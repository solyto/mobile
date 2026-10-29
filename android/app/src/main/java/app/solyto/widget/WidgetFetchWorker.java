package app.solyto.widget;

import android.content.Context;
import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

/** Fetches the data of every placed widget kind and applies the widget error contract. */
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
        if (!WidgetKind.anyPlaced(context)) return Result.success();

        String token = WidgetTokenStore.readToken(context);
        String apiUrl = WidgetTokenStore.apiUrl(context);
        if (token == null || apiUrl == null) {
            WidgetCache.clear(context);
            WidgetKind.updateAll(context);
            return Result.success();
        }

        boolean failed = false;
        for (WidgetKind kind : WidgetKind.values()) {
            if (!kind.hasWidgets(context)) continue;

            WidgetApi.Result result = WidgetApi.fetch(context, apiUrl, token, kind);

            // A logout or a new token arrived during the request; its own handling wins.
            if (!token.equals(WidgetTokenStore.readToken(context))) return Result.success();

            // Token and server outcomes are global and end the run; failures only mark their kind.
            WidgetCache.State global = null;
            switch (result.outcome) {
                case OK:
                    if (WidgetPayload.isNewerSchema(result.data)) {
                        global = WidgetCache.State.UPDATE_APP;
                        break;
                    }
                    WidgetPayload payload = WidgetPayload.parse(result.data, kind);
                    if (payload == null) {
                        WidgetCache.markOutdated(context, kind);
                        failed = true;
                        break;
                    }
                    WidgetCache.saveData(context, kind, result.data.toString(), System.currentTimeMillis());
                    if (payload.refreshAt > 0) WidgetWork.fetchAt(context, kind, payload.refreshAt);
                    break;
                case UNAUTHORIZED:
                    WidgetTokenStore.clearIfCurrent(context, token);
                    WidgetCache.clear(context);
                    WidgetKind.updateAll(context);
                    return Result.success();
                case NOT_FOUND:
                    global = WidgetCache.State.UNSUPPORTED_SERVER;
                    break;
                case UPGRADE_REQUIRED:
                    global = WidgetCache.State.UPDATE_APP;
                    break;
                default:
                    // 429, 5xx, offline: keep the last data and mark it outdated.
                    WidgetCache.markOutdated(context, kind);
                    failed = true;
            }
            if (global != null) {
                WidgetCache.setState(context, global);
                WidgetKind.updateAll(context);
                return Result.success();
            }
        }

        WidgetKind.updateAll(context);
        return failed && getRunAttemptCount() < MAX_RETRIES ? Result.retry() : Result.success();
    }
}
