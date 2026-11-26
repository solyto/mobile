package app.solyto.widget;

import android.content.Context;
import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.ExistingWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.OneTimeWorkRequest;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import java.util.concurrent.TimeUnit;

/** Schedules polling for notifications while they are on, independent of placed widgets. */
final class PushWork {

    private static final String PERIODIC = "push-poll-periodic";
    private static final String NOW = "push-poll-now";
    // WorkManager's minimum period.
    private static final long PERIOD_MINUTES = 15;

    private PushWork() {}

    /** Polls now and every 15 minutes while online. */
    static void start(Context context) {
        Constraints online = new Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build();
        WorkManager workManager = WorkManager.getInstance(context);
        workManager.enqueueUniquePeriodicWork(PERIODIC, ExistingPeriodicWorkPolicy.KEEP,
                new PeriodicWorkRequest.Builder(PushPollWorker.class, PERIOD_MINUTES, TimeUnit.MINUTES)
                        .setConstraints(online)
                        .build());
        workManager.enqueueUniqueWork(NOW, ExistingWorkPolicy.REPLACE,
                new OneTimeWorkRequest.Builder(PushPollWorker.class).setConstraints(online).build());
    }

    static void stop(Context context) {
        WorkManager workManager = WorkManager.getInstance(context);
        workManager.cancelUniqueWork(PERIODIC);
        workManager.cancelUniqueWork(NOW);
    }
}
