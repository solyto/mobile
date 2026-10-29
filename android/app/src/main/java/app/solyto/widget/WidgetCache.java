package app.solyto.widget;

import android.content.Context;
import android.content.SharedPreferences;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * The last payload of each widget kind and the state the widgets show, in
 * private SharedPreferences excluded from backup. The state is global (token
 * and server); payload, fetch time, outdated flag and action state are per
 * kind, under kind-prefixed keys. {@link #clear} wipes the data.
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
    private static final String[] KIND_KEYS =
            {KEY_PAYLOAD, KEY_FETCHED_AT, KEY_OUTDATED, KEY_ACTION_ROWS, KEY_ACTION_ERROR};
    // Set once the unprefixed keys of the single-kind cache are dropped.
    private static final String KEY_PER_KIND = "per_kind";

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
    static String payload(Context context, WidgetKind kind) {
        return prefs(context).getString(key(kind, KEY_PAYLOAD), null);
    }

    static long fetchedAt(Context context, WidgetKind kind) {
        return prefs(context).getLong(key(kind, KEY_FETCHED_AT), 0);
    }

    static boolean isOutdated(Context context, WidgetKind kind) {
        return prefs(context).getBoolean(key(kind, KEY_OUTDATED), false);
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
    static synchronized void saveData(Context context, WidgetKind kind, String payload, long fetchedAt) {
        JSONObject rows = actionRows(context, kind);
        for (String id : keys(rows)) {
            if (rows.optLong(id) < 0) rows.remove(id);
        }
        prefs(context).edit()
                .putString(KEY_STATE, State.OK.name())
                .putString(key(kind, KEY_PAYLOAD), payload)
                .putLong(key(kind, KEY_FETCHED_AT), fetchedAt)
                .putBoolean(key(kind, KEY_OUTDATED), false)
                .putString(key(kind, KEY_ACTION_ROWS), rows.toString())
                .putBoolean(key(kind, KEY_ACTION_ERROR), false)
                .commit();
    }

    /** Whether the row is shown as done locally: its action is running or waiting for the re-fetch. */
    static synchronized boolean isActionActive(Context context, WidgetKind kind, String id) {
        return actionRows(context, kind).has(id);
    }

    /**
     * Marks the row's action as running and clears the error state. Returns
     * false when an action for this row is already active.
     */
    static synchronized boolean startAction(Context context, WidgetKind kind, String id) {
        JSONObject rows = actionRows(context, kind);
        if (rows.has(id)) return false;
        try {
            rows.put(id, System.currentTimeMillis());
        } catch (JSONException e) {
            return false;
        }
        prefs(context).edit()
                .putString(key(kind, KEY_ACTION_ROWS), rows.toString())
                .putBoolean(key(kind, KEY_ACTION_ERROR), false)
                .commit();
        return true;
    }

    /** The action succeeded: the row stays shown as done until the next saved fetch. */
    static synchronized void finishAction(Context context, WidgetKind kind, String id) {
        JSONObject rows = actionRows(context, kind);
        if (!rows.has(id)) return;
        try {
            rows.put(id, -System.currentTimeMillis());
        } catch (JSONException e) {
            return;
        }
        prefs(context).edit().putString(key(kind, KEY_ACTION_ROWS), rows.toString()).commit();
    }

    /** The action did not happen: the row shows its server state again, optionally with the error state. */
    static synchronized void revertAction(Context context, WidgetKind kind, String id, boolean showError) {
        JSONObject rows = actionRows(context, kind);
        rows.remove(id);
        SharedPreferences.Editor editor =
                prefs(context).edit().putString(key(kind, KEY_ACTION_ROWS), rows.toString());
        if (showError) editor.putBoolean(key(kind, KEY_ACTION_ERROR), true);
        editor.commit();
    }

    static boolean hasActionError(Context context, WidgetKind kind) {
        return prefs(context).getBoolean(key(kind, KEY_ACTION_ERROR), false);
    }

    public static void setState(Context context, State state) {
        prefs(context).edit().putString(KEY_STATE, state.name()).commit();
    }

    static void markOutdated(Context context, WidgetKind kind) {
        prefs(context).edit().putBoolean(key(kind, KEY_OUTDATED), true).commit();
    }

    /** Returns whether the value changed. */
    public static boolean setDeviceUnsupported(Context context, boolean unsupported) {
        if (isDeviceUnsupported(context) == unsupported) return false;
        prefs(context).edit().putBoolean(KEY_DEVICE_UNSUPPORTED, unsupported).commit();
        return true;
    }

    /** Deletes the cached data; the widgets show the signed-out state. */
    public static synchronized void clear(Context context) {
        SharedPreferences.Editor editor = prefs(context).edit();
        for (WidgetKind kind : WidgetKind.values()) {
            for (String name : KIND_KEYS) editor.remove(key(kind, name));
        }
        editor.putString(KEY_STATE, State.SIGNED_OUT.name()).commit();
    }

    /** The active action rows, without entries older than {@link #ACTION_TTL_MS}. */
    private static JSONObject actionRows(Context context, WidgetKind kind) {
        JSONObject rows;
        try {
            rows = new JSONObject(prefs(context).getString(key(kind, KEY_ACTION_ROWS), "{}"));
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

    private static String key(WidgetKind kind, String name) {
        return kind.id + "." + name;
    }

    /**
     * The prefs, after dropping the single-kind cache of an older build once.
     * Its data is not migrated: the next fetch fills the kind's own keys.
     */
    private static synchronized SharedPreferences prefs(Context context) {
        SharedPreferences prefs =
                context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        if (!prefs.getBoolean(KEY_PER_KIND, false)) {
            SharedPreferences.Editor editor = prefs.edit();
            for (String name : KIND_KEYS) editor.remove(name);
            editor.putBoolean(KEY_PER_KIND, true).commit();
        }
        return prefs;
    }
}
