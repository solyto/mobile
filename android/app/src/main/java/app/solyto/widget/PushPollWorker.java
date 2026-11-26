package app.solyto.widget;

import android.content.Context;
import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Polls the API for the notifications queued for this phone and shows them.
 * Registers the phone on the first poll and again when the API no longer
 * knows it. Failures wait for the next poll.
 */
public class PushPollWorker extends Worker {

    // The periodic and the immediate poll may run at once, and PushSetup.disable may run meanwhile;
    // one at a time keeps the cursor consistent.
    static final Object LOCK = new Object();
    // After a long time offline the queue can hold several pages (the API sends 100 at a time);
    // they are fetched first so the newest few and the summary cover all of them.
    private static final int MAX_PAGES = 10;

    public PushPollWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        synchronized (LOCK) {
            poll(getApplicationContext());
        }
        return Result.success();
    }

    private static void poll(Context context) {
        // Without the permission, entries would be read and never shown; the
        // queue waits until it is allowed again (the API drops entries after 7 days).
        if (!PushSetup.isOn(context)) return;

        // Without a token, the app sends one the next time it is opened.
        String token = WidgetTokenStore.readToken(context);
        String apiUrl = WidgetTokenStore.apiUrl(context);
        if (token == null || apiUrl == null) return;

        String deviceId = PushState.deviceId(context);
        long cursor = PushState.cursor(context);
        if (cursor == PushState.UNREGISTERED) {
            register(context, apiUrl, token, deviceId);
            return;
        }

        List<JSONObject> items = new ArrayList<>();
        long next = cursor;
        for (int page = 0; page < MAX_PAGES; page++) {
            WidgetApi.Result result = WidgetApi.deviceNotifications(context, apiUrl, token, deviceId, next);
            if (dropIfRevoked(context, token, result)) break;
            if (result.outcome == WidgetApi.Outcome.NOT_FOUND && page == 0) {
                // The API dropped the phone after 30 days without polling: register again.
                PushState.setCursor(context, PushState.UNREGISTERED);
                register(context, apiUrl, token, deviceId);
                return;
            }
            if (result.outcome != WidgetApi.Outcome.OK || result.data == null) break;

            JSONArray pageItems = result.data.optJSONArray("items");
            if (pageItems == null || pageItems.length() == 0) break;
            for (int i = 0; i < pageItems.length(); i++) {
                JSONObject item = pageItems.optJSONObject(i);
                if (item != null) items.add(item);
            }
            next = Math.max(next, result.data.optLong("cursor", next));
        }

        // What was fetched is shown even if a later page failed; the cursor only covers that.
        PushNotifier.show(context, items);
        if (next != cursor) PushState.setCursor(context, next);
    }

    private static void register(Context context, String apiUrl, String token, String deviceId) {
        WidgetApi.Result result = WidgetApi.registerDevice(context, apiUrl, token, deviceId);
        if (dropIfRevoked(context, token, result)) return;
        if (result.outcome == WidgetApi.Outcome.OK && result.data != null) {
            PushState.setCursor(context, Math.max(0, result.data.optLong("cursor", 0)));
        }
    }

    /**
     * Drops a revoked token, so the app sends a new one the next time it is
     * opened; without a placed widget nothing else would notice.
     */
    private static boolean dropIfRevoked(Context context, String token, WidgetApi.Result result) {
        if (result.outcome != WidgetApi.Outcome.UNAUTHORIZED) return false;
        WidgetTokenStore.clearIfCurrent(context, token);
        return true;
    }
}
