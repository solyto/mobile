package app.solyto.widget;

import android.content.Context;
import android.content.SharedPreferences;

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

    static void saveData(Context context, String payload, long fetchedAt) {
        prefs(context).edit()
                .putString(KEY_STATE, State.OK.name())
                .putString(KEY_PAYLOAD, payload)
                .putLong(KEY_FETCHED_AT, fetchedAt)
                .putBoolean(KEY_OUTDATED, false)
                .commit();
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
    public static void clear(Context context) {
        prefs(context).edit()
                .remove(KEY_PAYLOAD)
                .remove(KEY_FETCHED_AT)
                .remove(KEY_OUTDATED)
                .putString(KEY_STATE, State.SIGNED_OUT.name())
                .commit();
    }

    private static SharedPreferences prefs(Context context) {
        return context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }
}
