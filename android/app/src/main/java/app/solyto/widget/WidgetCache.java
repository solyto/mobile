package app.solyto.widget;

import android.content.Context;
import android.content.SharedPreferences;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * The last widget payload and the state the widgets show, in private
 * SharedPreferences excluded from backup. {@link #clear} wipes the data.
 */
public final class WidgetCache {

    /** Prefs file name; the backup rules exclude {@code widget_cache.xml}. */
    static final String PREFS = "widget_cache";

    public enum State { LOADING, OK, SIGNED_OUT, UNSUPPORTED_SERVER, UPDATE_APP }

    private static final String KEY_STATE = "state";
    private static final String KEY_PAYLOAD = "payload";
    private static final String KEY_FETCHED_AT = "fetched_at";
    private static final String KEY_OUTDATED = "outdated";
    private static final String KEY_DEVICE_UNSUPPORTED = "device_unsupported";
    private static final String KEY_ACTION_ROWS = "action_rows";
    private static final String KEY_ACTION_ERROR = "action_error";

    // Row ids with an action call running (value: start time), or done and waiting
    // for the re-fetch (value: minus the finish time).
    // Drops entries that are never resolved, e.g. when their work was cancelled or the re-fetch fails.
    private static final long ACTION_TTL_MS = 5 * 60_000;

    private WidgetCache() {}

    public static State state(Context context) {
        try {
            return State.valueOf(prefs(context).getString(KEY_STATE, State.LOADING.name()));
        } catch (IllegalArgumentException e) {
            return State.LOADING;
        }
    }

    /** The `data` object of the last successful response, as JSON, or null. */
    static String payload(Context context) {
        return prefs(context).getString(KEY_PAYLOAD, null);
    }

    static long fetchedAt(Context context) {
        return prefs(context).getLong(KEY_FETCHED_AT, 0);
    }

    static boolean isOutdated(Context context) {
        return prefs(context).getBoolean(KEY_OUTDATED, false);
    }

    /**
     * Whether the WebView lacks the message listener the bridge needs. Set
     * again on every app start, since a WebView update can add the feature.
     */
    static boolean isDeviceUnsupported(Context context) {
        return prefs(context).getBoolean(KEY_DEVICE_UNSUPPORTED, false);
    }

    /**
     * Stores fresh data. Rows whose action finished now show the server's
     * state; rows with a call still running stay shown as done.
     */
    static synchronized void saveData(Context context, String payload, long fetchedAt) {
        JSONObject rows = actionRows(context);
        for (String id : keys(rows)) {
            if (rows.optLong(id) < 0) rows.remove(id);
        }
        prefs(context).edit()
                .putString(KEY_STATE, State.OK.name())
                .putString(KEY_PAYLOAD, payload)
                .putLong(KEY_FETCHED_AT, fetchedAt)
                .putBoolean(KEY_OUTDATED, false)
                .putString(KEY_ACTION_ROWS, rows.toString())
                .putBoolean(KEY_ACTION_ERROR, false)
                .commit();
    }

    /** Whether the row is shown as done locally: its action is running or waiting for the re-fetch. */
    static synchronized boolean isActionActive(Context context, String id) {
        return actionRows(context).has(id);
    }

    /**
     * Marks the row's action as running and clears the error state. Returns
     * false when an action for this row is already active.
     */
    static synchronized boolean startAction(Context context, String id) {
        JSONObject rows = actionRows(context);
        if (rows.has(id)) return false;
        try {
            rows.put(id, System.currentTimeMillis());
        } catch (JSONException e) {
            return false;
        }
        prefs(context).edit()
                .putString(KEY_ACTION_ROWS, rows.toString())
                .putBoolean(KEY_ACTION_ERROR, false)
                .commit();
        return true;
    }

    /** The action succeeded: the row stays shown as done until the next saved fetch. */
    static synchronized void finishAction(Context context, String id) {
        JSONObject rows = actionRows(context);
        if (!rows.has(id)) return;
        try {
            rows.put(id, -System.currentTimeMillis());
        } catch (JSONException e) {
            return;
        }
        prefs(context).edit().putString(KEY_ACTION_ROWS, rows.toString()).commit();
    }

    /** The action did not happen: the row shows its server state again, optionally with the error state. */
    static synchronized void revertAction(Context context, String id, boolean showError) {
        JSONObject rows = actionRows(context);
        rows.remove(id);
        SharedPreferences.Editor editor = prefs(context).edit().putString(KEY_ACTION_ROWS, rows.toString());
        if (showError) editor.putBoolean(KEY_ACTION_ERROR, true);
        editor.commit();
    }

    static boolean hasActionError(Context context) {
        return prefs(context).getBoolean(KEY_ACTION_ERROR, false);
    }

    public static void setState(Context context, State state) {
        prefs(context).edit().putString(KEY_STATE, state.name()).commit();
    }

    static void markOutdated(Context context) {
        prefs(context).edit().putBoolean(KEY_OUTDATED, true).commit();
    }

    /** Returns whether the value changed. */
    public static boolean setDeviceUnsupported(Context context, boolean unsupported) {
        if (isDeviceUnsupported(context) == unsupported) return false;
        prefs(context).edit().putBoolean(KEY_DEVICE_UNSUPPORTED, unsupported).commit();
        return true;
    }

    /** Deletes the cached data; the widgets show the signed-out state. */
    public static synchronized void clear(Context context) {
        prefs(context).edit()
                .remove(KEY_PAYLOAD)
                .remove(KEY_FETCHED_AT)
                .remove(KEY_OUTDATED)
                .remove(KEY_ACTION_ROWS)
                .remove(KEY_ACTION_ERROR)
                .putString(KEY_STATE, State.SIGNED_OUT.name())
                .commit();
    }

    /** The active action rows, without entries older than {@link #ACTION_TTL_MS}. */
    private static JSONObject actionRows(Context context) {
        JSONObject rows;
        try {
            rows = new JSONObject(prefs(context).getString(KEY_ACTION_ROWS, "{}"));
        } catch (JSONException e) {
            return new JSONObject();
        }
        long now = System.currentTimeMillis();
        for (String id : keys(rows)) {
            long at = Math.abs(rows.optLong(id));
            if (now - at > ACTION_TTL_MS || at > now) rows.remove(id);
        }
        return rows;
    }

    private static List<String> keys(JSONObject object) {
        List<String> keys = new ArrayList<>();
        Iterator<String> it = object.keys();
        while (it.hasNext()) keys.add(it.next());
        return keys;
    }

    private static SharedPreferences prefs(Context context) {
        return context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }
}
