package app.solyto.widget;

import android.annotation.SuppressLint;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import app.solyto.MainActivity;
import app.solyto.R;
import java.util.List;
import org.json.JSONObject;

/**
 * Shows polled notifications in one channel; which types arrive is set in the
 * app's settings. A tap opens the notification's page in the app.
 */
final class PushNotifier {

    static final String CHANNEL_ID = "solyto";
    // After a long time offline, the newest few are shown and the rest summed up.
    private static final int SHOWN_INDIVIDUALLY = 5;
    // Queue ids start at 1, so 0 is free for the summary.
    private static final int SUMMARY_ID = 0;

    private PushNotifier() {}

    /** Shows the items (oldest first, as the API sends them). */
    // The permission is checked in PushSetup.canNotify.
    @SuppressLint("MissingPermission")
    static void show(Context context, List<JSONObject> items) {
        if (items.isEmpty() || !PushSetup.canNotify(context)) return;
        createChannel(context);

        NotificationManagerCompat manager = NotificationManagerCompat.from(context);
        int first = Math.max(0, items.size() - SHOWN_INDIVIDUALLY);
        try {
            for (int i = first; i < items.size(); i++) {
                JSONObject item = items.get(i);
                int id = notificationId(item);
                manager.notify(id, notification(context, item, id));
            }
            if (first > 0) manager.notify(SUMMARY_ID, summary(context, first));
        } catch (SecurityException e) {
            // The permission was revoked between the check and the call.
        }
    }

    private static void createChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null) return;
        manager.createNotificationChannel(new NotificationChannel(
                CHANNEL_ID, context.getString(R.string.push_channel_name), NotificationManager.IMPORTANCE_DEFAULT));
    }

    private static android.app.Notification notification(Context context, JSONObject item, int id) {
        String title = text(item, "title");
        String body = text(item, "body");
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle(title != null ? title : context.getString(R.string.app_name))
                .setAutoCancel(true)
                .setContentIntent(openIntent(context, appPath(text(item, "url")), id));
        if (body != null) {
            builder.setContentText(body).setStyle(new NotificationCompat.BigTextStyle().bigText(body));
        }
        return builder.build();
    }

    private static android.app.Notification summary(Context context, int count) {
        return new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle(context.getString(R.string.app_name))
                .setContentText(context.getResources().getQuantityString(R.plurals.push_more, count, count))
                .setAutoCancel(true)
                .setContentIntent(openIntent(context, null, SUMMARY_ID))
                .build();
    }

    /** Opens the app, on the given page if there is one; MainActivity and the app check the path again. */
    private static PendingIntent openIntent(Context context, String path, int requestCode) {
        Intent intent = new Intent(context, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        if (path != null) {
            intent.setAction(MainActivity.ACTION_OPEN_PATH).putExtra(MainActivity.EXTRA_OPEN_PATH, path);
        } else {
            intent.setAction(Intent.ACTION_MAIN);
        }
        return PendingIntent.getActivity(context, requestCode, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** The path and query of the notification's web URL, or null. */
    private static String appPath(String url) {
        if (url == null) return null;
        Uri uri = Uri.parse(url);
        String path = uri.getEncodedPath();
        if (path == null || !path.startsWith("/")) return null;
        String query = uri.getEncodedQuery();
        return query != null ? path + "?" + query : path;
    }

    private static int notificationId(JSONObject item) {
        long id = item.optLong("id", 1);
        return (int) Math.max(1, id % Integer.MAX_VALUE);
    }

    private static String text(JSONObject object, String name) {
        Object value = object.opt(name);
        if (!(value instanceof String)) return null;
        String s = ((String) value).trim();
        return s.isEmpty() ? null : s;
    }
}
