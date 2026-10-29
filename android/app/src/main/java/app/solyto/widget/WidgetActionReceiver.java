package app.solyto.widget;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import app.solyto.MainActivity;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Receives every tap on a widget list row: a list has a single click
 * template, so row taps (open a route) and checkbox or button taps (run an action) both
 * arrive here. Fill-in extras come from the launcher and are untrusted.
 */
public class WidgetActionReceiver extends BroadcastReceiver {

    static final String ACTION_ROW_TAP = "app.solyto.action.WIDGET_ROW_TAP";
    static final String EXTRA_ACTION_KIND = "app.solyto.extra.WIDGET_ACTION_KIND";
    static final String EXTRA_ACTION_TYPE = "app.solyto.extra.WIDGET_ACTION_TYPE";
    static final String EXTRA_ACTION_KEY = "app.solyto.extra.WIDGET_ACTION_KEY";
    static final String EXTRA_ACTION_ID = "app.solyto.extra.WIDGET_ACTION_ID";
    /** The tapped option's value, for scale actions. */
    static final String EXTRA_ACTION_VALUE = "app.solyto.extra.WIDGET_ACTION_VALUE";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !ACTION_ROW_TAP.equals(intent.getAction())) return;

        String kind;
        String type;
        String key;
        String id;
        Integer value;
        String routeKey;
        String routeId;
        try {
            kind = intent.getStringExtra(EXTRA_ACTION_KIND);
            type = intent.getStringExtra(EXTRA_ACTION_TYPE);
            key = intent.getStringExtra(EXTRA_ACTION_KEY);
            id = intent.getStringExtra(EXTRA_ACTION_ID);
            Bundle extras = intent.getExtras();
            Object rawValue = extras != null ? extras.get(EXTRA_ACTION_VALUE) : null;
            value = rawValue instanceof Integer ? (Integer) rawValue : null;
            routeKey = intent.getStringExtra(MainActivity.EXTRA_WIDGET_ROUTE_KEY);
            routeId = intent.getStringExtra(MainActivity.EXTRA_WIDGET_ROUTE_ID);
        } catch (RuntimeException e) {
            // Malformed extras bundle.
            return;
        }

        if (type != null) {
            // On API 31+ the launcher already toggled the CheckBox locally; re-render to undo that.
            if (!runAction(context, WidgetKind.fromId(kind), type, key, id, value)) WidgetKind.updateAll(context);
        } else if (routeKey != null) {
            openRoute(context, routeKey, routeId);
        }
    }

    private static boolean runAction(Context context, WidgetKind kind, String type, String key, String id,
            Integer value) {
        boolean check = WidgetPayload.ACTION_CHECK.equals(type);
        boolean scale = WidgetPayload.ACTION_SCALE.equals(type);
        if (kind == null || !(check || scale || WidgetPayload.ACTION_BUTTON.equals(type))) return false;
        if (scale && value == null) return false;
        if (!WidgetPayload.isValidActionKey(key) || !WidgetPayload.isValidRowId(id)) return false;

        // Only rows the widget currently shows with this action, and not already done.
        if (WidgetCache.state(context) != WidgetCache.State.OK) return false;
        WidgetPayload payload = cachedPayload(context, kind);
        WidgetPayload.Item row = payload != null ? payload.findAction(type, key, id) : null;
        if (row == null || (check && row.actionChecked)) return false;
        if (scale && !row.hasOption(value)) return false;

        // Repeated taps while a call is running are ignored.
        if (!WidgetCache.startAction(context, kind, id)) return false;
        kind.render(context);
        if (scale) {
            // Tapping the selected value clears it; always the explicit target, so a retry cannot flip it.
            WidgetWork.runAction(context, kind, key, id, value.equals(row.actionValue) ? null : value);
        } else {
            WidgetWork.runAction(context, kind, key, id);
        }
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

    private static WidgetPayload cachedPayload(Context context, WidgetKind kind) {
        String json = WidgetCache.payload(context, kind);
        if (json == null) return null;
        try {
            return WidgetPayload.parse(new JSONObject(json), kind);
        } catch (JSONException e) {
            return null;
        }
    }
}
