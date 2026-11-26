package app.solyto.widget;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;

/** Turns notifications on this phone on and off. */
public final class PushSetup {

    private PushSetup() {}

    /** Whether Android lets the app show notifications: allowed for the app and its channel not blocked. */
    public static boolean canNotify(Context context) {
        if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) return false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
                && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS)
                        != PackageManager.PERMISSION_GRANTED) {
            return false;
        }
        return !isChannelBlocked(context);
    }

    // The channel exists once a notification was shown; until then it can't be blocked.
    private static boolean isChannelBlocked(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return false;
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        NotificationChannel channel = manager != null ? manager.getNotificationChannel(PushNotifier.CHANNEL_ID) : null;
        return channel != null && channel.getImportance() == NotificationManager.IMPORTANCE_NONE;
    }

    /** Whether notifications reach this phone: turned on in the app and allowed by Android. */
    public static boolean isOn(Context context) {
        return PushState.isEnabled(context) && canNotify(context);
    }

    /** Starts polling; the first poll registers the phone. */
    public static void enable(Context context) {
        PushState.setEnabled(context, true);
        PushWork.start(context);
    }

    /**
     * Stops polling and unregisters the phone while the token still exists, so
     * the API stops queueing for it. Waits for a running poll, which could
     * register the phone again. Does network I/O: never on the main thread.
     */
    public static void disable(Context context) {
        PushWork.stop(context);
        synchronized (PushPollWorker.LOCK) {
            PushState.setEnabled(context, false);

            String token = WidgetTokenStore.readToken(context);
            String apiUrl = WidgetTokenStore.apiUrl(context);
            if (token != null && apiUrl != null && PushState.cursor(context) != PushState.UNREGISTERED) {
                WidgetApi.unregisterDevice(context, apiUrl, token, PushState.deviceId(context));
            }
            PushState.setCursor(context, PushState.UNREGISTERED);
        }
    }
}
