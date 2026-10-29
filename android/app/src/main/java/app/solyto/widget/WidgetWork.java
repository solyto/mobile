package app.solyto.widget;

import android.content.Context;
import android.os.Build;
import androidx.work.BackoffPolicy;
import androidx.work.Data;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.ExistingWorkPolicy;
import androidx.work.OneTimeWorkRequest;
import androidx.work.OutOfQuotaPolicy;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import java.util.concurrent.TimeUnit;

/**
 * Schedules widget fetches and row actions. Work only exists while a widget
 * is placed. WorkManager stores input data unencrypted, so it never holds the
 * token: workers read it from {@link WidgetTokenStore}.
 */
public final class WidgetWork {

    private static final String PERIODIC = "widget-fetch-periodic";
    private static final String NOW = "widget-fetch-now";
    private static final String AT_REFRESH = "widget-fetch-at-refresh";
    private static final String ACTION_TAG = "widget-action";
    private static final String ACTION_PREFIX = "widget-action-";

    private static final long PERIOD_MINUTES = 60;
    private static final long BACKOFF_MINUTES = 5;
    // Fetch shortly after refresh_at (the next local midnight), not right at it.
    private static final long REFRESH_AT_DELAY_MS = 60_000;

    private WidgetWork() {}

    /**
     * Keeps the periodic fetch scheduled. Keeping a periodic job pending also
     * stops WorkManager from toggling its components when all work is done,
     * which would make launchers send another widget update.
     */
    static void schedulePeriodic(Context context) {
        PeriodicWorkRequest request = new PeriodicWorkRequest.Builder(
                WidgetFetchWorker.class, PERIOD_MINUTES, TimeUnit.MINUTES)
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, BACKOFF_MINUTES, TimeUnit.MINUTES)
                .build();
        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                PERIODIC, ExistingPeriodicWorkPolicy.KEEP, request);
    }

    /** A fetch as soon as possible; a newer request replaces a pending one. */
    public static void fetchNow(Context context) {
        if (!YourDayWidgetProvider.hasWidgets(context)) return;
        WorkManager.getInstance(context).enqueueUniqueWork(NOW, ExistingWorkPolicy.REPLACE, oneTime(0));
    }

    /** A fetch at the payload's refresh_at (epoch millis). */
    static void fetchAt(Context context, long refreshAt) {
        long delay = Math.max(0, refreshAt - System.currentTimeMillis()) + REFRESH_AT_DELAY_MS;
        WorkManager.getInstance(context).enqueueUniqueWork(
                AT_REFRESH, ExistingWorkPolicy.REPLACE, oneTime(delay));
    }

    /** Runs a row action once; while one is enqueued or running for this row, further requests are ignored. */
    static void runAction(Context context, String key, String id) {
        OneTimeWorkRequest.Builder builder = new OneTimeWorkRequest.Builder(WidgetActionWorker.class)
                .addTag(ACTION_TAG)
                .setInputData(new Data.Builder()
                        .putString(WidgetActionWorker.INPUT_KEY, key)
                        .putString(WidgetActionWorker.INPUT_ID, id)
                        .build());
        // Below API 31, expedited work runs as a foreground service with a notification.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            builder.setExpedited(OutOfQuotaPolicy.RUN_AS_NON_EXPEDITED_WORK_REQUEST);
        }
        WorkManager.getInstance(context).enqueueUniqueWork(
                ACTION_PREFIX + id, ExistingWorkPolicy.KEEP, builder.build());
    }

    static void cancelAll(Context context) {
        WorkManager workManager = WorkManager.getInstance(context);
        workManager.cancelUniqueWork(PERIODIC);
        workManager.cancelUniqueWork(NOW);
        workManager.cancelUniqueWork(AT_REFRESH);
        workManager.cancelAllWorkByTag(ACTION_TAG);
    }

    private static OneTimeWorkRequest oneTime(long delayMillis) {
        return new OneTimeWorkRequest.Builder(WidgetFetchWorker.class)
                .setInitialDelay(delayMillis, TimeUnit.MILLISECONDS)
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, BACKOFF_MINUTES, TimeUnit.MINUTES)
                .build();
    }
}
