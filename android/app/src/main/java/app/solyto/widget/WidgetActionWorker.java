package app.solyto.widget;

import android.content.Context;
import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

/**
 * Runs one row action and applies the widget error contract. Failures are
 * not retried: the row is reverted and nothing is queued for later.
 */
public class WidgetActionWorker extends Worker {

    static final String INPUT_KEY = "key";
    static final String INPUT_ID = "id";

    public WidgetActionWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        Context context = getApplicationContext();
        String key = getInputData().getString(INPUT_KEY);
        String id = getInputData().getString(INPUT_ID);
        if (!YourDayPayload.isValidActionKey(key) || !YourDayPayload.isValidRowId(id)) return Result.success();

        String token = WidgetTokenStore.readToken(context);
        String apiUrl = WidgetTokenStore.apiUrl(context);
        if (token == null || apiUrl == null) {
            WidgetCache.clear(context);
            YourDayWidgetProvider.updateAll(context);
            return Result.success();
        }

        WidgetApi.Outcome outcome = WidgetApi.postAction(context, apiUrl, token, key, id);

        // A logout or a new token arrived during the request; its own handling wins.
        if (!token.equals(WidgetTokenStore.readToken(context))) {
            WidgetCache.revertAction(context, id, false);
            YourDayWidgetProvider.updateAll(context);
            return Result.success();
        }

        switch (outcome) {
            case OK:
            case NOT_FOUND:
                // Done, or the row is gone: the re-fetch shows the server's state.
                WidgetCache.finishAction(context, id);
                WidgetWork.fetchNow(context);
                break;
            case UNAUTHORIZED:
                WidgetTokenStore.clearIfCurrent(context, token);
                WidgetCache.clear(context);
                break;
            case UPGRADE_REQUIRED:
                WidgetCache.revertAction(context, id, false);
                WidgetCache.setState(context, WidgetCache.State.UPDATE_APP);
                break;
            default:
                WidgetCache.revertAction(context, id, true);
        }

        YourDayWidgetProvider.updateAll(context);
        return Result.success();
    }
}
