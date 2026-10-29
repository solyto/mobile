package app.solyto.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.text.format.DateFormat;
import android.view.View;
import android.widget.RemoteViews;
import androidx.core.widget.RemoteViewsCompat;
import app.solyto.MainActivity;
import app.solyto.R;
import java.util.Date;
import org.json.JSONException;
import org.json.JSONObject;

/** The "Your Day" list widget. Renders from {@link WidgetCache}. */
public class YourDayWidgetProvider extends AppWidgetProvider {

    private static final int REQUEST_HEADER = 1;
    private static final int REQUEST_ROW_TEMPLATE = 2;

    @Override
    public void onEnabled(Context context) {
        WidgetWork.schedulePeriodic(context);
    }

    @Override
    public void onDisabled(Context context) {
        WidgetWork.cancelAll(context);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int id : appWidgetIds) render(context, manager, id);
        WidgetWork.schedulePeriodic(context);
        WidgetWork.fetchNow(context);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager manager, int appWidgetId,
            Bundle newOptions) {
        render(context, manager, appWidgetId);
    }

    public static boolean hasWidgets(Context context) {
        return widgetIds(context).length > 0;
    }

    /** Re-renders every placed Your Day widget from the cache. */
    public static void updateAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        for (int id : widgetIds(context)) render(context, manager, id);
    }

    private static int[] widgetIds(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        if (manager == null) return new int[0];
        return manager.getAppWidgetIds(new ComponentName(context, YourDayWidgetProvider.class));
    }

    private static void render(Context context, AppWidgetManager manager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_your_day);
        PendingIntent openApp = openAppIntent(context);
        views.setOnClickPendingIntent(R.id.widget_header, openApp);
        views.setOnClickPendingIntent(R.id.widget_message, openApp);
        views.setPendingIntentTemplate(R.id.widget_list, rowTemplateIntent(context));

        YourDayPayload payload = null;
        String message;
        WidgetCache.State state = WidgetCache.state(context);

        if (WidgetCache.isDeviceUnsupported(context)) {
            message = context.getString(R.string.widget_not_supported);
        } else if (state == WidgetCache.State.OK) {
            payload = parse(WidgetCache.payload(context));
            message = payload == null
                    ? context.getString(R.string.widget_update_app)
                    : payload.emptyLabel != null ? payload.emptyLabel : "";
        } else {
            message = context.getString(stateMessage(state));
        }

        views.setTextViewText(R.id.widget_title, payload != null && payload.title != null
                ? payload.title : context.getString(R.string.widget_your_day_name));
        renderUpdatedAt(context, views, payload != null);

        RemoteViewsCompat.RemoteCollectionItems.Builder items =
                new RemoteViewsCompat.RemoteCollectionItems.Builder()
                        .setHasStableIds(false)
                        .setViewTypeCount(2);
        boolean hasRows = payload != null && !payload.items.isEmpty();
        if (hasRows) {
            for (int i = 0; i < payload.items.size(); i++) {
                items.addItem(i, itemView(context, payload.items.get(i)));
            }
        }
        RemoteViewsCompat.setRemoteAdapter(context, views, appWidgetId, R.id.widget_list, items.build());

        views.setViewVisibility(R.id.widget_list, hasRows ? View.VISIBLE : View.GONE);
        views.setViewVisibility(R.id.widget_message, hasRows ? View.GONE : View.VISIBLE);
        views.setTextViewText(R.id.widget_message, message);

        manager.updateAppWidget(appWidgetId, views);
    }

    private static int stateMessage(WidgetCache.State state) {
        switch (state) {
            case SIGNED_OUT:
                return R.string.widget_signed_out;
            case UNSUPPORTED_SERVER:
                return R.string.widget_unsupported_server;
            case UPDATE_APP:
                return R.string.widget_update_app;
            default:
                return R.string.widget_loading;
        }
    }

    private static YourDayPayload parse(String json) {
        if (json == null) return null;
        try {
            return YourDayPayload.parse(new JSONObject(json));
        } catch (JSONException e) {
            return null;
        }
    }

    private static void renderUpdatedAt(Context context, RemoteViews views, boolean hasData) {
        long fetchedAt = WidgetCache.fetchedAt(context);
        if (!hasData || fetchedAt <= 0) {
            views.setViewVisibility(R.id.widget_updated, View.GONE);
            return;
        }
        if (WidgetCache.hasActionError(context)) {
            views.setTextViewText(R.id.widget_updated, context.getString(R.string.widget_action_failed));
            views.setViewVisibility(R.id.widget_updated, View.VISIBLE);
            return;
        }
        String time = DateFormat.getTimeFormat(context).format(new Date(fetchedAt));
        views.setTextViewText(R.id.widget_updated, context.getString(
                WidgetCache.isOutdated(context) ? R.string.widget_outdated_at : R.string.widget_updated_at, time));
        views.setViewVisibility(R.id.widget_updated, View.VISIBLE);
    }

    private static RemoteViews itemView(Context context, YourDayPayload.Item item) {
        if (item.isHeader) {
            RemoteViews header = new RemoteViews(context.getPackageName(), R.layout.widget_your_day_section);
            header.setTextViewText(R.id.widget_section_title, item.title);
            return header;
        }

        RemoteViews row = new RemoteViews(context.getPackageName(), R.layout.widget_your_day_row);
        row.setTextViewText(R.id.widget_row_title, item.title);
        setOptionalText(row, R.id.widget_row_subtitle, item.subtitle);
        setOptionalText(row, R.id.widget_row_time, item.timeLabel);

        int icon = iconResource(item.icon);
        if (item.actionType != null) {
            bindCheck(context, row, item);
            row.setViewVisibility(R.id.widget_row_icon, View.GONE);
        } else {
            row.setViewVisibility(R.id.widget_row_check, View.GONE);
            if (icon != 0) {
                row.setImageViewResource(R.id.widget_row_icon, icon);
                row.setViewVisibility(R.id.widget_row_icon, View.VISIBLE);
            } else {
                row.setViewVisibility(R.id.widget_row_icon, View.GONE);
            }
        }

        if (item.routeKey != null) {
            Intent fillIn = new Intent().putExtra(MainActivity.EXTRA_WIDGET_ROUTE_KEY, item.routeKey);
            if (item.routeId != null) fillIn.putExtra(MainActivity.EXTRA_WIDGET_ROUTE_ID, item.routeId);
            row.setOnClickFillInIntent(R.id.widget_row, fillIn);
        }
        return row;
    }

    /**
     * The row's checkbox: checked when the server says so or a local action
     * is active. On API 31+ the launcher toggles the CheckBox itself, so every
     * render sets its state explicitly; a reverted row is unchecked again.
     * The fill-in is always set, so a recycled list view never keeps another
     * row's; the receiver ignores taps on checked and active rows.
     */
    private static void bindCheck(Context context, RemoteViews row, YourDayPayload.Item item) {
        boolean checked = item.actionChecked || WidgetCache.isActionActive(context, item.id);
        Intent fillIn = new Intent()
                .putExtra(WidgetActionReceiver.EXTRA_ACTION_TYPE, item.actionType)
                .putExtra(WidgetActionReceiver.EXTRA_ACTION_KEY, item.actionKey)
                .putExtra(WidgetActionReceiver.EXTRA_ACTION_ID, item.id);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            row.setCompoundButtonChecked(R.id.widget_row_check, checked);
            row.setBoolean(R.id.widget_row_check, "setEnabled", !checked);
            row.setOnCheckedChangeResponse(R.id.widget_row_check,
                    RemoteViews.RemoteResponse.fromFillInIntent(fillIn));
        } else {
            row.setImageViewResource(R.id.widget_row_check,
                    checked ? R.drawable.ic_widget_check_on : R.drawable.ic_widget_todo);
            row.setOnClickFillInIntent(R.id.widget_row_check, fillIn);
        }
        row.setContentDescription(R.id.widget_row_check, context.getString(R.string.widget_action_check));
        row.setViewVisibility(R.id.widget_row_check, View.VISIBLE);
    }

    // Always sets visibility: the list reapplies row views to recycled views,
    // so a row without this text would otherwise keep a previous row's.
    private static void setOptionalText(RemoteViews views, int viewId, String text) {
        if (text == null) {
            views.setViewVisibility(viewId, View.GONE);
            return;
        }
        views.setTextViewText(viewId, text);
        views.setViewVisibility(viewId, View.VISIBLE);
    }

    private static int iconResource(String icon) {
        if ("event".equals(icon)) return R.drawable.ic_widget_event;
        if ("todo".equals(icon)) return R.drawable.ic_widget_todo;
        return 0;
    }

    private static PendingIntent openAppIntent(Context context) {
        Intent intent = new Intent(context, MainActivity.class)
                .setAction(Intent.ACTION_MAIN)
                .addCategory(Intent.CATEGORY_LAUNCHER);
        return PendingIntent.getActivity(context, REQUEST_HEADER, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /**
     * Collection rows need a mutable template; each row fills in its route or
     * action. All row taps go to {@link WidgetActionReceiver}, which opens routes itself.
     */
    private static PendingIntent rowTemplateIntent(Context context) {
        Intent intent = new Intent(context, WidgetActionReceiver.class)
                .setAction(WidgetActionReceiver.ACTION_ROW_TAP);
        int mutable = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ? PendingIntent.FLAG_MUTABLE : 0;
        return PendingIntent.getBroadcast(context, REQUEST_ROW_TEMPLATE, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | mutable);
    }
}
