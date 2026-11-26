package app.solyto.widget;

import android.content.Context;
import android.content.pm.PackageManager;
import android.net.Uri;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Calls the widget routes with the widget token. Neither the token nor
 * response bodies are logged.
 */
final class WidgetApi {

    enum Outcome { OK, UNAUTHORIZED, NOT_FOUND, UPGRADE_REQUIRED, TEMPORARY_FAILURE }

    static final class Result {
        final Outcome outcome;
        /** The envelope's `data` object; only set for {@link Outcome#OK}. */
        final JSONObject data;

        Result(Outcome outcome, JSONObject data) {
            this.outcome = outcome;
            this.data = data;
        }
    }

    private static final String ACTIONS_PATH = "/api/v1/widgets/actions/";
    private static final String NOTIFICATIONS_PATH = "/api/v1/widgets/notifications";
    private static final int TIMEOUT_MS = 15_000;
    private static final int MAX_BODY_BYTES = 1024 * 1024;

    private WidgetApi() {}

    /** Fetches the kind's data from its widget route. */
    static Result fetch(Context context, String apiUrl, String token, WidgetKind kind) {
        return request(context, apiUrl + kind.path, "GET", token, null);
    }

    /** Registers this phone for notifications; the data holds the {@code cursor} to poll from. */
    static Result registerDevice(Context context, String apiUrl, String token, String deviceId) {
        String body;
        try {
            body = new JSONObject().put("device_id", deviceId).toString();
        } catch (JSONException e) {
            return new Result(Outcome.TEMPORARY_FAILURE, null);
        }
        return request(context, apiUrl + NOTIFICATIONS_PATH + "/devices", "POST", token, body);
    }

    /** The notifications queued for this phone after the cursor; the data holds {@code items} and the next {@code cursor}. */
    static Result deviceNotifications(Context context, String apiUrl, String token, String deviceId, long after) {
        return request(context, apiUrl + NOTIFICATIONS_PATH + "?device_id=" + Uri.encode(deviceId) + "&after=" + after,
                "GET", token, null);
    }

    static Outcome unregisterDevice(Context context, String apiUrl, String token, String deviceId) {
        return request(context, apiUrl + NOTIFICATIONS_PATH + "/devices/" + Uri.encode(deviceId), "DELETE", token, null)
                .outcome;
    }

    /** A request whose 200 response carries the envelope's {@code data} object; 404 is {@link Outcome#NOT_FOUND}. */
    private static Result request(Context context, String url, String method, String token, String jsonBody) {
        HttpURLConnection connection = null;
        try {
            connection = open(context, url, method, token);
            if (jsonBody != null) {
                byte[] body = jsonBody.getBytes(StandardCharsets.UTF_8);
                connection.setDoOutput(true);
                connection.setRequestProperty("Content-Type", "application/json");
                connection.setFixedLengthStreamingMode(body.length);
                try (OutputStream out = connection.getOutputStream()) {
                    out.write(body);
                }
            }

            int status = connection.getResponseCode();
            if (status == 404) return new Result(Outcome.NOT_FOUND, null);
            if (status != 200) return new Result(outcome(status), null);

            JSONObject envelope = new JSONObject(readBody(connection.getInputStream()));
            if (!envelope.optBoolean("success", false)) return new Result(Outcome.TEMPORARY_FAILURE, null);
            // DELETE answers with data: null.
            JSONObject data = envelope.optJSONObject("data");
            if (data == null && !"DELETE".equals(method)) return new Result(Outcome.TEMPORARY_FAILURE, null);
            return new Result(Outcome.OK, data);
        } catch (IOException | JSONException | RuntimeException e) {
            return new Result(Outcome.TEMPORARY_FAILURE, null);
        } finally {
            if (connection != null) connection.disconnect();
        }
    }

    /**
     * Runs a row action: {@code POST /widgets/actions/{key}/{id}} without a
     * body. 403 counts as {@link Outcome#NOT_FOUND}: the row is not the user's.
     */
    static Outcome postAction(Context context, String apiUrl, String token, String key, String id) {
        return postAction(context, apiUrl, token, key, id, false, null);
    }

    /**
     * Runs a row action with the body {@code {"value": <value>}}; a null value
     * is sent as an explicit {@code null} (clear), never as a toggle.
     */
    static Outcome postAction(Context context, String apiUrl, String token, String key, String id,
            Integer value) {
        return postAction(context, apiUrl, token, key, id, true, value);
    }

    private static Outcome postAction(Context context, String apiUrl, String token, String key, String id,
            boolean withBody, Integer value) {
        if (!WidgetPayload.isValidActionKey(key) || !WidgetPayload.isValidRowId(id)) {
            return Outcome.NOT_FOUND;
        }
        HttpURLConnection connection = null;
        try {
            connection = open(context, apiUrl + ACTIONS_PATH + key + "/" + id, "POST", token);
            connection.setDoOutput(true);
            if (withBody) {
                byte[] body = ("{\"value\":" + (value != null ? value.toString() : "null") + "}")
                        .getBytes(StandardCharsets.UTF_8);
                connection.setRequestProperty("Content-Type", "application/json");
                connection.setFixedLengthStreamingMode(body.length);
                try (OutputStream out = connection.getOutputStream()) {
                    out.write(body);
                }
            } else {
                connection.setFixedLengthStreamingMode(0);
                connection.getOutputStream().close();
            }

            int status = connection.getResponseCode();
            if (status == 200) return Outcome.OK;
            if (status == 403 || status == 404) return Outcome.NOT_FOUND;
            return outcome(status);
        } catch (IOException | RuntimeException e) {
            return Outcome.TEMPORARY_FAILURE;
        } finally {
            if (connection != null) connection.disconnect();
        }
    }

    private static HttpURLConnection open(Context context, String url, String method, String token)
            throws IOException {
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setRequestMethod(method);
        connection.setConnectTimeout(TIMEOUT_MS);
        connection.setReadTimeout(TIMEOUT_MS);
        connection.setUseCaches(false);
        // A redirect could carry the token to another host.
        connection.setInstanceFollowRedirects(false);
        connection.setRequestProperty("Authorization", "Bearer " + token);
        connection.setRequestProperty("Accept", "application/json");
        connection.setRequestProperty("X-Client-Version", appVersion(context));
        return connection;
    }

    /** The outcome of a status other than 200, 403 and 404. */
    private static Outcome outcome(int status) {
        if (status == 401) return Outcome.UNAUTHORIZED;
        if (status == 426) return Outcome.UPGRADE_REQUIRED;
        return Outcome.TEMPORARY_FAILURE;
    }

    private static String readBody(InputStream stream) throws IOException {
        try (InputStream in = stream) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buffer = new byte[8192];
            int read;
            while ((read = in.read(buffer)) != -1) {
                if (out.size() + read > MAX_BODY_BYTES) throw new IOException("Response too large");
                out.write(buffer, 0, read);
            }
            return new String(out.toByteArray(), StandardCharsets.UTF_8);
        }
    }

    /** The versionName, which build-fdroid.sh sets from package.json, like the app's PUBLIC_VERSION. */
    private static String appVersion(Context context) {
        try {
            String version = context.getPackageManager()
                    .getPackageInfo(context.getPackageName(), 0).versionName;
            return version != null ? version : "";
        } catch (PackageManager.NameNotFoundException e) {
            return "";
        }
    }
}
