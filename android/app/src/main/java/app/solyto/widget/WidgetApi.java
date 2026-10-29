package app.solyto.widget;

import android.content.Context;
import android.content.pm.PackageManager;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
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

    private static final String YOUR_DAY_PATH = "/api/v1/widgets/your-day";
    private static final String ACTIONS_PATH = "/api/v1/widgets/actions/";
    private static final int TIMEOUT_MS = 15_000;
    private static final int MAX_BODY_BYTES = 1024 * 1024;

    private WidgetApi() {}

    static Result fetchYourDay(Context context, String apiUrl, String token) {
        HttpURLConnection connection = null;
        try {
            connection = open(context, apiUrl + YOUR_DAY_PATH, "GET", token);

            int status = connection.getResponseCode();
            if (status == 404) return new Result(Outcome.NOT_FOUND, null);
            if (status != 200) return new Result(outcome(status), null);

            JSONObject envelope = new JSONObject(readBody(connection.getInputStream()));
            JSONObject data = envelope.optJSONObject("data");
            if (!envelope.optBoolean("success", false) || data == null) {
                return new Result(Outcome.TEMPORARY_FAILURE, null);
            }
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
        if (!YourDayPayload.isValidActionKey(key) || !YourDayPayload.isValidRowId(id)) {
            return Outcome.NOT_FOUND;
        }
        HttpURLConnection connection = null;
        try {
            connection = open(context, apiUrl + ACTIONS_PATH + key + "/" + id, "POST", token);
            connection.setDoOutput(true);
            connection.setFixedLengthStreamingMode(0);
            connection.getOutputStream().close();

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
