package app.solyto.widget;

import android.content.Context;
import androidx.work.BackoffPolicy;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.ExistingWorkPolicy;
import androidx.work.OneTimeWorkRequest;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import java.util.concurrent.TimeUnit;

/**
 * Schedules widget fetches. Work only exists while a widget is placed. No
 * input data is passed: WorkManager stores it unencrypted, so the worker reads
 * the token from {@link WidgetTokenStore}.
 */
public final class WidgetWork {

    private static final String PERIODIC = "widget-fetch-periodic";
    private static final String NOW = "widget-fetch-now";
    private static final String AT_REFRESH = "widget-fetch-at-refresh";

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

    static void cancelAll(Context context) {
        WorkManager workManager = WorkManager.getInstance(context);
        workManager.cancelUniqueWork(PERIODIC);
        workManager.cancelUniqueWork(NOW);
        workManager.cancelUniqueWork(AT_REFRESH);
    }

    private static OneTimeWorkRequest oneTime(long delayMillis) {
        return new OneTimeWorkRequest.Builder(WidgetFetchWorker.class)
                .setInitialDelay(delayMillis, TimeUnit.MILLISECONDS)
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, BACKOFF_MINUTES, TimeUnit.MINUTES)
                .build();
    }
}
