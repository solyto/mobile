package app.solyto.widget;

import android.content.Context;
import android.content.SharedPreferences;
import java.util.UUID;

/**
 * Notifications on this phone: whether they are on, the phone's id at the API
 * and the poll cursor, in private SharedPreferences excluded from backup (a
 * restored id would make two phones one).
 */
public final class PushState {

    /** Prefs file name; the backup rules exclude {@code push_state.xml}. */
    static final String PREFS = "push_state";
    /** The cursor while the phone is not registered at the API. */
    static final long UNREGISTERED = -1;

    private static final String KEY_ENABLED = "enabled";
    private static final String KEY_DEVICE_ID = "device_id";
    private static final String KEY_CURSOR = "cursor";

    private PushState() {}

    public static boolean isEnabled(Context context) {
        return prefs(context).getBoolean(KEY_ENABLED, false);
    }

    static void setEnabled(Context context, boolean enabled) {
        prefs(context).edit().putBoolean(KEY_ENABLED, enabled).commit();
    }

    /** This installation's id at the API, created on first use. */
    static synchronized String deviceId(Context context) {
        String id = prefs(context).getString(KEY_DEVICE_ID, null);
        if (id == null) {
            id = UUID.randomUUID().toString();
            prefs(context).edit().putString(KEY_DEVICE_ID, id).commit();
        }
        return id;
    }

    static long cursor(Context context) {
        return prefs(context).getLong(KEY_CURSOR, UNREGISTERED);
    }

    static void setCursor(Context context, long cursor) {
        prefs(context).edit().putLong(KEY_CURSOR, cursor).commit();
    }

    private static SharedPreferences prefs(Context context) {
        return context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }
}
