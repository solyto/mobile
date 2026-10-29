package app.solyto.widget;

import android.content.Context;
import androidx.annotation.NonNull;
import androidx.work.Data;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

/**
 * Runs one row action and applies the widget error contract. Failures are
 * not retried: the row is reverted and nothing is queued for later.
 */
public class WidgetActionWorker extends Worker {

    static final String INPUT_KIND = "kind";
    static final String INPUT_KEY = "key";
    static final String INPUT_ID = "id";
    /** Whether the action sends a value; work enqueued by older builds has none and sends no body. */
    static final String INPUT_HAS_VALUE = "has_value";
    /** The value to send; absent with {@link #INPUT_HAS_VALUE} means an explicit null. */
    static final String INPUT_VALUE = "value";

    public WidgetActionWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        Context context = getApplicationContext();
        String kindId = getInputData().getString(INPUT_KIND);
        // Actions enqueued by a build before widget kinds carry none; Your Day was the only kind then.
        WidgetKind kind = kindId == null ? WidgetKind.YOUR_DAY : WidgetKind.fromId(kindId);
        String key = getInputData().getString(INPUT_KEY);
        String id = getInputData().getString(INPUT_ID);
        if (kind == null || !WidgetPayload.isValidActionKey(key) || !WidgetPayload.isValidRowId(id)) {
            return Result.success();
        }

        String token = WidgetTokenStore.readToken(context);
        String apiUrl = WidgetTokenStore.apiUrl(context);
        if (token == null || apiUrl == null) {
            WidgetCache.clear(context);
            WidgetKind.updateAll(context);
            return Result.success();
        }

        Data input = getInputData();
        WidgetApi.Outcome outcome;
        if (input.getBoolean(INPUT_HAS_VALUE, false)) {
            Integer value = input.hasKeyWithValueOfType(INPUT_VALUE, Integer.class)
                    ? input.getInt(INPUT_VALUE, 0) : null;
            outcome = WidgetApi.postAction(context, apiUrl, token, key, id, value);
        } else {
            outcome = WidgetApi.postAction(context, apiUrl, token, key, id);
        }

        // A logout or a new token arrived during the request; its own handling wins.
        if (!token.equals(WidgetTokenStore.readToken(context))) {
            WidgetCache.revertAction(context, kind, id, false);
            WidgetKind.updateAll(context);
            return Result.success();
        }

        switch (outcome) {
            case OK:
            case NOT_FOUND:
                // Done, or the row is gone: the re-fetch shows the server's state.
                WidgetCache.finishAction(context, kind, id);
                WidgetWork.fetchNow(context);
                break;
            case UNAUTHORIZED:
                WidgetTokenStore.clearIfCurrent(context, token);
                WidgetCache.clear(context);
                break;
            case UPGRADE_REQUIRED:
                WidgetCache.revertAction(context, kind, id, false);
                WidgetCache.setState(context, WidgetCache.State.UPDATE_APP);
                break;
            default:
                WidgetCache.revertAction(context, kind, id, true);
        }

        WidgetKind.updateAll(context);
        return Result.success();
    }
}
