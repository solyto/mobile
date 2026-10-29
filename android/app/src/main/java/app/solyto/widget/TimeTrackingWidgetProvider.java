package app.solyto.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.text.format.DateFormat;
import android.view.View;
import android.widget.RemoteViews;
import androidx.core.widget.RemoteViewsCompat;
import app.solyto.MainActivity;
import app.solyto.R;
import java.util.Date;
import org.json.JSONException;
import org.json.JSONObject;

/** The time tracking widget: the running timer and the projects to start. Renders from {@link WidgetCache}. */
public class TimeTrackingWidgetProvider extends AppWidgetProvider {

    private static final WidgetKind KIND = WidgetKind.TIME_TRACKING;
    // Distinct from Your Day's, so the kinds' PendingIntents don't replace each other.
    private static final int REQUEST_HEADER = 3;
    private static final int REQUEST_ROW_TEMPLATE = 4;
    private static final int BUSY_ALPHA = 90;

    @Override
    public void onEnabled(Context context) {
        WidgetWork.schedulePeriodic(context);
    }

    @Override
    public void onDisabled(Context context) {
        WidgetWork.cancelIfNoWidgets(context);
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

    /** Re-renders every placed time tracking widget from the cache. */
    public static void updateAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        for (int id : widgetIds(context)) render(context, manager, id);
    }

    private static int[] widgetIds(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        if (manager == null) return new int[0];
        return manager.getAppWidgetIds(new ComponentName(context, TimeTrackingWidgetProvider.class));
    }

    private static void render(Context context, AppWidgetManager manager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_time_tracking);
        PendingIntent openApp = openAppIntent(context);
        views.setOnClickPendingIntent(R.id.widget_header, openApp);
        views.setOnClickPendingIntent(R.id.widget_message, openApp);
        views.setPendingIntentTemplate(R.id.widget_list, rowTemplateIntent(context));

        WidgetPayload payload = null;
        String message;
        WidgetCache.State state = WidgetCache.state(context);

        boolean deviceUnsupported = WidgetCache.isDeviceUnsupported(context);
        if (!deviceUnsupported && state == WidgetCache.State.OK) {
            payload = parse(WidgetCache.payload(context, KIND));
        }

        if (deviceUnsupported) {
            message = context.getString(R.string.widget_not_supported);
        } else if (payload != null) {
            message = payload.emptyLabel != null ? payload.emptyLabel : "";
        } else if ((state == WidgetCache.State.LOADING || state == WidgetCache.State.OK)
                && WidgetCache.isOutdated(context, KIND)) {
            // A fetch failed before any data was cached: say so instead of "Loading…".
            message = context.getString(R.string.widget_load_failed);
        } else {
            // OK without data of this kind yet (e.g. right after an app update) shows "Loading…".
            message = context.getString(stateMessage(state));
        }

        views.setTextViewText(R.id.widget_title, payload != null && payload.title != null
                ? payload.title : context.getString(R.string.widget_time_tracking_name));
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

    private static WidgetPayload parse(String json) {
        if (json == null) return null;
        try {
            return WidgetPayload.parse(new JSONObject(json), KIND);
        } catch (JSONException e) {
            return null;
        }
    }

    private static void renderUpdatedAt(Context context, RemoteViews views, boolean hasData) {
        long fetchedAt = WidgetCache.fetchedAt(context, KIND);
        if (!hasData || fetchedAt <= 0) {
            views.setViewVisibility(R.id.widget_updated, View.GONE);
            return;
        }
        if (WidgetCache.hasActionError(context, KIND)) {
            views.setTextViewText(R.id.widget_updated, context.getString(R.string.widget_time_tracking_failed));
            views.setViewVisibility(R.id.widget_updated, View.VISIBLE);
            return;
        }
        String time = DateFormat.getTimeFormat(context).format(new Date(fetchedAt));
        int label = WidgetCache.isOutdated(context, KIND) ? R.string.widget_outdated_at : R.string.widget_updated_at;
        views.setTextViewText(R.id.widget_updated, context.getString(label, time));
        views.setViewVisibility(R.id.widget_updated, View.VISIBLE);
    }

    // The list reapplies row views to recycled views, so every view state is set
    // explicitly; a row would otherwise keep a previous row's.
    private static RemoteViews itemView(Context context, WidgetPayload.Item item) {
        if (item.isHeader) {
            RemoteViews header = new RemoteViews(context.getPackageName(), R.layout.widget_time_tracking_section);
            header.setTextViewText(R.id.widget_section_title, item.title);
            return header;
        }

        RemoteViews row = new RemoteViews(context.getPackageName(), R.layout.widget_time_tracking_row);
        row.setTextViewText(R.id.widget_row_title, item.title);
        if (item.subtitle != null) {
            row.setTextViewText(R.id.widget_row_subtitle, item.subtitle);
            row.setViewVisibility(R.id.widget_row_subtitle, View.VISIBLE);
        } else {
            row.setViewVisibility(R.id.widget_row_subtitle, View.GONE);
        }

        row.setInt(R.id.widget_row_dot, "setColorFilter",
                item.color != WidgetPayload.NO_COLOR ? item.color : context.getColor(R.color.widget_accent));

        boolean running = item.liveElapsed && item.at > 0;
        row.setInt(R.id.widget_row, "setBackgroundResource", running ? R.drawable.widget_running_background : 0);
        row.setViewVisibility(R.id.widget_row_icon, running && "timer".equals(item.icon) ? View.VISIBLE : View.GONE);
        if (running) {
            long elapsed = Math.max(0, System.currentTimeMillis() - item.at);
            row.setChronometer(R.id.widget_row_elapsed, SystemClock.elapsedRealtime() - elapsed, null, true);
            row.setViewVisibility(R.id.widget_row_elapsed, View.VISIBLE);
        } else {
            row.setChronometer(R.id.widget_row_elapsed, SystemClock.elapsedRealtime(), null, false);
            row.setViewVisibility(R.id.widget_row_elapsed, View.GONE);
        }

        if (WidgetPayload.ACTION_BUTTON.equals(item.actionType)) {
            bindButton(context, row, item);
        } else {
            row.setViewVisibility(R.id.widget_row_button, View.GONE);
        }

        Intent routeFillIn = new Intent();
        if (item.routeKey != null) {
            routeFillIn.putExtra(MainActivity.EXTRA_WIDGET_ROUTE_KEY, item.routeKey);
            if (item.routeId != null) routeFillIn.putExtra(MainActivity.EXTRA_WIDGET_ROUTE_ID, item.routeId);
        }
        row.setOnClickFillInIntent(R.id.widget_row, routeFillIn);
        return row;
    }

    /**
     * The row's start or stop button, dimmed and disabled while its action is
     * active. The fill-in is always set; the receiver ignores taps on active rows.
     */
    private static void bindButton(Context context, RemoteViews row, WidgetPayload.Item item) {
        boolean busy = WidgetCache.isActionActive(context, KIND, item.id);
        boolean stop = "stop".equals(item.actionIcon);
        Intent fillIn = new Intent()
                .putExtra(WidgetActionReceiver.EXTRA_ACTION_KIND, KIND.id)
                .putExtra(WidgetActionReceiver.EXTRA_ACTION_TYPE, item.actionType)
                .putExtra(WidgetActionReceiver.EXTRA_ACTION_KEY, item.actionKey)
                .putExtra(WidgetActionReceiver.EXTRA_ACTION_ID, item.id);

        row.setImageViewResource(R.id.widget_row_button, stop ? R.drawable.ic_widget_stop : R.drawable.ic_widget_play);
        row.setContentDescription(R.id.widget_row_button,
                context.getString(stop ? R.string.widget_action_stop : R.string.widget_action_start));
        row.setInt(R.id.widget_row_button, "setImageAlpha", busy ? BUSY_ALPHA : 255);
        row.setBoolean(R.id.widget_row_button, "setEnabled", !busy);
        row.setOnClickFillInIntent(R.id.widget_row_button, fillIn);
        row.setViewVisibility(R.id.widget_row_button, View.VISIBLE);
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
