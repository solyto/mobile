package app.solyto.widget;

import android.content.Context;
import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

/** Fetches the Your Day data and applies the widget error contract. */
public class WidgetFetchWorker extends Worker {

    // Further failures wait for the next periodic fetch.
    private static final int MAX_RETRIES = 3;

    public WidgetFetchWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        Context context = getApplicationContext();
        if (!YourDayWidgetProvider.hasWidgets(context)) return Result.success();

        String token = WidgetTokenStore.readToken(context);
        String apiUrl = WidgetTokenStore.apiUrl(context);
        if (token == null || apiUrl == null) {
            WidgetCache.clear(context);
            YourDayWidgetProvider.updateAll(context);
            return Result.success();
        }

        WidgetApi.Result result = WidgetApi.fetchYourDay(context, apiUrl, token);

        // A logout or a new token arrived during the request; its own handling wins.
        if (!token.equals(WidgetTokenStore.readToken(context))) return Result.success();

        Result workResult = Result.success();
        switch (result.outcome) {
            case OK:
                if (YourDayPayload.isNewerSchema(result.data)) {
                    WidgetCache.setState(context, WidgetCache.State.UPDATE_APP);
                    break;
                }
                YourDayPayload payload = YourDayPayload.parse(result.data);
                if (payload == null) {
                    workResult = failTemporarily(context);
                    break;
                }
                WidgetCache.saveData(context, result.data.toString(), System.currentTimeMillis());
                if (payload.refreshAt > 0) WidgetWork.fetchAt(context, payload.refreshAt);
                break;
            case UNAUTHORIZED:
                WidgetTokenStore.clearIfCurrent(context, token);
                WidgetCache.clear(context);
                break;
            case NOT_FOUND:
                WidgetCache.setState(context, WidgetCache.State.UNSUPPORTED_SERVER);
                break;
            case UPGRADE_REQUIRED:
                WidgetCache.setState(context, WidgetCache.State.UPDATE_APP);
                break;
            default:
                workResult = failTemporarily(context);
        }

        YourDayWidgetProvider.updateAll(context);
        return workResult;
    }

    /** 429, 5xx, offline: keep the last data, mark it outdated and back off. */
    private Result failTemporarily(Context context) {
        WidgetCache.markOutdated(context);
        return getRunAttemptCount() < MAX_RETRIES ? Result.retry() : Result.success();
    }
}
