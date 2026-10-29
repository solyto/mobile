package app.solyto.widget;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import app.solyto.MainActivity;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Receives every tap on a widget list row: a list has a single click
 * template, so row taps (open a route) and checkbox taps (run an action) both
 * arrive here. Fill-in extras come from the launcher and are untrusted.
 */
public class WidgetActionReceiver extends BroadcastReceiver {

    static final String ACTION_ROW_TAP = "app.solyto.action.WIDGET_ROW_TAP";
    static final String EXTRA_ACTION_TYPE = "app.solyto.extra.WIDGET_ACTION_TYPE";
    static final String EXTRA_ACTION_KEY = "app.solyto.extra.WIDGET_ACTION_KEY";
    static final String EXTRA_ACTION_ID = "app.solyto.extra.WIDGET_ACTION_ID";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !ACTION_ROW_TAP.equals(intent.getAction())) return;

        String type;
        String key;
        String id;
        String routeKey;
        String routeId;
        try {
            type = intent.getStringExtra(EXTRA_ACTION_TYPE);
            key = intent.getStringExtra(EXTRA_ACTION_KEY);
            id = intent.getStringExtra(EXTRA_ACTION_ID);
            routeKey = intent.getStringExtra(MainActivity.EXTRA_WIDGET_ROUTE_KEY);
            routeId = intent.getStringExtra(MainActivity.EXTRA_WIDGET_ROUTE_ID);
        } catch (RuntimeException e) {
            // Malformed extras bundle.
            return;
        }

        if (type != null) {
            // On API 31+ the launcher already toggled the CheckBox locally; re-render to undo that.
            if (!runAction(context, type, key, id)) YourDayWidgetProvider.updateAll(context);
        } else if (routeKey != null) {
            openRoute(context, routeKey, routeId);
        }
    }

    private static boolean runAction(Context context, String type, String key, String id) {
        if (!YourDayPayload.ACTION_CHECK.equals(type)) return false;
        if (!YourDayPayload.isValidActionKey(key) || !YourDayPayload.isValidRowId(id)) return false;

        // Only rows the widget currently shows with this action, and not already done.
        if (WidgetCache.state(context) != WidgetCache.State.OK) return false;
        YourDayPayload payload = cachedPayload(context);
        YourDayPayload.Item row = payload != null ? payload.findAction(type, key, id) : null;
        if (row == null || row.actionChecked) return false;

        // Repeated taps while a call is running are ignored.
        if (!WidgetCache.startAction(context, id)) return false;
        YourDayWidgetProvider.updateAll(context);
        WidgetWork.runAction(context, key, id);
        return true;
    }

    /** MainActivity validates the route again: it is exported and gets these extras from anywhere. */
    private static void openRoute(Context context, String routeKey, String routeId) {
        Intent open = new Intent(context, MainActivity.class)
                .setAction(MainActivity.ACTION_WIDGET_ROUTE)
                .putExtra(MainActivity.EXTRA_WIDGET_ROUTE_KEY, routeKey)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        if (routeId != null) open.putExtra(MainActivity.EXTRA_WIDGET_ROUTE_ID, routeId);
        context.startActivity(open);
    }

    private static YourDayPayload cachedPayload(Context context) {
        String json = WidgetCache.payload(context);
        if (json == null) return null;
        try {
            return YourDayPayload.parse(new JSONObject(json));
        } catch (JSONException e) {
            return null;
        }
    }
}
