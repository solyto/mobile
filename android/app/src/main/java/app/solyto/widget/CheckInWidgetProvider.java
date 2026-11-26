package app.solyto.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
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

/** The check-in widget: today's value per enabled tracker, set by tapping. Renders from {@link WidgetCache}. */
public class CheckInWidgetProvider extends AppWidgetProvider {

    private static final WidgetKind KIND = WidgetKind.CHECK_IN;
    // Distinct from Your Day's and time tracking's, so the kinds' PendingIntents don't replace each other.
    private static final int REQUEST_HEADER = 7;
    private static final int REQUEST_ROW_TEMPLATE = 8;
    private static final int BUSY_ALPHA = 90;
    // The option buttons' icon area: 36dp high, minus 6dp padding on each side.
    private static final int OPTION_ICON_DP = 24;
    // Space between the rating rows and the yes/no and count rows below them, and
    // the log rows' own bottom padding (both log row layouts), restated as
    // setViewPadding sets all four sides.
    private static final int LOG_ROWS_GAP_DP = 12;
    private static final int LOG_ROW_PADDING_BOTTOM_DP = 4;
    /** Per-value icons (1-5) for the trackers the app draws as a fill level, in the app's own colors. */
    private static final int[] WATER_ICONS = {
            R.drawable.ic_widget_checkin_water_1, R.drawable.ic_widget_checkin_water_2,
            R.drawable.ic_widget_checkin_water_3, R.drawable.ic_widget_checkin_water_4,
            R.drawable.ic_widget_checkin_water_5};
    private static final int[] FOOD_AMOUNT_ICONS = {
            R.drawable.ic_widget_checkin_food_amount_1, R.drawable.ic_widget_checkin_food_amount_2,
            R.drawable.ic_widget_checkin_food_amount_3, R.drawable.ic_widget_checkin_food_amount_4,
            R.drawable.ic_widget_checkin_food_amount_5};
    private static final int[] MENSTRUATION_ICONS = {
            R.drawable.ic_widget_checkin_menstruation_1, R.drawable.ic_widget_checkin_menstruation_2,
            R.drawable.ic_widget_checkin_menstruation_3, R.drawable.ic_widget_checkin_menstruation_4,
            R.drawable.ic_widget_checkin_menstruation_5};
    private static final int[] OPTION_VIEWS = {
        R.id.widget_option_1, R.id.widget_option_2, R.id.widget_option_3,
        R.id.widget_option_4, R.id.widget_option_5, R.id.widget_option_6,
    };

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

    /** Re-renders every placed check-in widget from the cache. */
    public static void updateAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        for (int id : widgetIds(context)) render(context, manager, id);
    }

    private static int[] widgetIds(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        if (manager == null) return new int[0];
        return manager.getAppWidgetIds(new ComponentName(context, CheckInWidgetProvider.class));
    }

    private static void render(Context context, AppWidgetManager manager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_check_in);
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
                ? payload.title : context.getString(R.string.widget_check_in_name));
        renderUpdatedAt(context, views, payload != null);

        // Rating row, yes/no row or count row.
        RemoteViewsCompat.RemoteCollectionItems.Builder items =
                new RemoteViewsCompat.RemoteCollectionItems.Builder()
                        .setHasStableIds(false)
                        .setViewTypeCount(3);
        int rowCount = 0;
        boolean afterRating = false;
        if (payload != null) {
            for (WidgetPayload.Item item : payload.items) {
                // No section titles: the widget title is enough.
                if (item.isHeader) continue;
                if (WidgetPayload.ACTION_TOGGLE.equals(item.actionType)
                        || WidgetPayload.ACTION_COUNTER.equals(item.actionType)) {
                    items.addItem(rowCount++, logRowView(context, item, afterRating));
                    afterRating = false;
                } else {
                    items.addItem(rowCount++, itemView(context, item));
                    afterRating = true;
                }
            }
        }
        RemoteViewsCompat.setRemoteAdapter(context, views, appWidgetId, R.id.widget_list, items.build());

        boolean hasRows = rowCount > 0;
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
        RemoteViews row = new RemoteViews(context.getPackageName(), R.layout.widget_check_in_row);
        row.setTextViewText(R.id.widget_row_title, item.title);

        Intent routeFillIn = new Intent();
        if (item.routeKey != null) {
            routeFillIn.putExtra(MainActivity.EXTRA_WIDGET_ROUTE_KEY, item.routeKey);
            if (item.routeId != null) routeFillIn.putExtra(MainActivity.EXTRA_WIDGET_ROUTE_ID, item.routeId);
        }
        row.setOnClickFillInIntent(R.id.widget_row_title, routeFillIn);

        boolean scale = WidgetPayload.ACTION_SCALE.equals(item.actionType);
        boolean busy = scale && WidgetCache.isActionActive(context, KIND, item.id);
        int count = scale ? item.options.size() : 0;
        for (int i = 0; i < OPTION_VIEWS.length; i++) {
            if (i < count) {
                bindOption(context, row, OPTION_VIEWS[i], item, i, busy);
            } else {
                row.setViewVisibility(OPTION_VIEWS[i], View.GONE);
            }
        }
        return row;
    }

    /**
     * An own yes/no tracker (a check) or count tracker (minus, today's count, plus), with space
     * above it when it follows a rating row.
     */
    private static RemoteViews logRowView(Context context, WidgetPayload.Item item, boolean afterRating) {
        boolean toggle = WidgetPayload.ACTION_TOGGLE.equals(item.actionType);
        RemoteViews row = new RemoteViews(context.getPackageName(),
                toggle ? R.layout.widget_check_in_toggle_row : R.layout.widget_check_in_counter_row);
        row.setTextViewText(R.id.widget_row_title, item.title);

        float density = context.getResources().getDisplayMetrics().density;
        row.setViewPadding(R.id.widget_log_row, 0, afterRating ? Math.round(LOG_ROWS_GAP_DP * density) : 0, 0,
                Math.round(LOG_ROW_PADDING_BOTTOM_DP * density));

        boolean busy = WidgetCache.isActionActive(context, KIND, item.id);

        if (toggle) {
            // Any stored value is "yes", as in the app.
            boolean yes = item.actionValue != null;
            row.setImageViewResource(R.id.widget_toggle, yes ? R.drawable.ic_widget_check_on : R.drawable.ic_widget_todo);
            bindActionButton(row, R.id.widget_toggle, item, null, busy, context.getString(
                    yes ? R.string.widget_check_in_yes_selected : R.string.widget_check_in_yes, item.title));
        } else {
            row.setTextViewText(R.id.widget_counter_value, String.valueOf(item.actionValue));
            // Nothing to take away at 0, as in the app.
            bindActionButton(row, R.id.widget_counter_minus, item, -1, busy || item.actionValue == 0,
                    context.getString(R.string.widget_check_in_count_less, item.title));
            bindActionButton(row, R.id.widget_counter_plus, item, 1, busy,
                    context.getString(R.string.widget_check_in_count_more, item.title));
        }
        return row;
    }

    /** A yes/no or count button: dimmed and disabled while the row's action is active or it has nothing to do; the receiver checks again. */
    private static void bindActionButton(RemoteViews row, int viewId, WidgetPayload.Item item, Integer step,
            boolean disabled, String description) {
        Intent fillIn = new Intent()
                .putExtra(WidgetActionReceiver.EXTRA_ACTION_KIND, KIND.id)
                .putExtra(WidgetActionReceiver.EXTRA_ACTION_TYPE, item.actionType)
                .putExtra(WidgetActionReceiver.EXTRA_ACTION_KEY, item.actionKey)
                .putExtra(WidgetActionReceiver.EXTRA_ACTION_ID, item.id);
        if (step != null) fillIn.putExtra(WidgetActionReceiver.EXTRA_ACTION_VALUE, step.intValue());

        row.setInt(viewId, "setImageAlpha", disabled ? BUSY_ALPHA : 255);
        row.setBoolean(viewId, "setEnabled", !disabled);
        row.setContentDescription(viewId, description);
        row.setOnClickFillInIntent(viewId, fillIn);
    }

    /**
     * One option button: its icon tinted with the server's color (level icons keep their own; an own
     * tracker's level buttons show its icon, as in the app), highlighted
     * when selected, dimmed and disabled while the row's action is active. The
     * fill-in is always set; the receiver ignores taps on active rows.
     */
    private static void bindOption(Context context, RemoteViews row, int viewId, WidgetPayload.Item item,
            int index, boolean busy) {
        WidgetPayload.Option option = item.options.get(index);
        boolean selected = item.actionValue != null && item.actionValue == option.value;
        Intent fillIn = new Intent()
                .putExtra(WidgetActionReceiver.EXTRA_ACTION_KIND, KIND.id)
                .putExtra(WidgetActionReceiver.EXTRA_ACTION_TYPE, item.actionType)
                .putExtra(WidgetActionReceiver.EXTRA_ACTION_KEY, item.actionKey)
                .putExtra(WidgetActionReceiver.EXTRA_ACTION_ID, item.id)
                .putExtra(WidgetActionReceiver.EXTRA_ACTION_VALUE, option.value);

        int levelIcon = levelIconRes(option.icon, option.value);
        Bitmap ownIcon = ownIcon(context, item, option);
        if (ownIcon != null) {
            row.setImageViewBitmap(viewId, ownIcon);
        } else {
            row.setImageViewResource(viewId, levelIcon != 0 ? levelIcon : iconRes(option.icon));
        }
        // Option views are reused, so the filter is always set. A transparent SRC_ATOP filter leaves
        // the level icons' own colors unchanged.
        row.setInt(viewId, "setColorFilter", levelIcon != 0 ? Color.TRANSPARENT : option.color);
        row.setInt(viewId, "setBackgroundResource", selected ? R.drawable.widget_check_in_option_selected : 0);
        row.setContentDescription(viewId, context.getString(
                selected ? R.string.widget_check_in_option_selected : R.string.widget_check_in_option,
                item.title, index + 1, item.options.size()));
        row.setInt(viewId, "setImageAlpha", busy ? BUSY_ALPHA : 255);
        row.setBoolean(viewId, "setEnabled", !busy);
        row.setOnClickFillInIntent(viewId, fillIn);
        row.setViewVisibility(viewId, View.VISIBLE);
    }

    /** An own tracker's icon for its level buttons, or null for other buttons and when it can't be drawn (the level dot then). */
    private static Bitmap ownIcon(Context context, WidgetPayload.Item item, WidgetPayload.Option option) {
        if (item.lucideIcon == null || !"level".equals(option.icon)) return null;
        int sizePx = Math.round(OPTION_ICON_DP * context.getResources().getDisplayMetrics().density);
        return LucideIcons.render(context, item.lucideIcon, sizePx);
    }

    /**
     * Water, food amount and menstruation show their value in the app (a glass filling up, more
     * pizza, a droplet filling up), so they get one drawable per value; 0 for every other icon.
     */
    private static int levelIconRes(String icon, int value) {
        int[] levels;
        switch (icon) {
            case "water": levels = WATER_ICONS; break;
            case "food_amount": levels = FOOD_AMOUNT_ICONS; break;
            case "menstruation": levels = MENSTRUATION_ICONS; break;
            default: return 0;
        }
        return levels[Math.max(1, Math.min(levels.length, value)) - 1];
    }

    /** The drawable for one of {@link WidgetPayload#OPTION_ICONS} that is not a level icon. */
    private static int iconRes(String icon) {
        switch (icon) {
            case "mood_1": return R.drawable.ic_widget_checkin_mood_1;
            case "mood_2": return R.drawable.ic_widget_checkin_mood_2;
            case "mood_3": return R.drawable.ic_widget_checkin_mood_3;
            case "mood_4": return R.drawable.ic_widget_checkin_mood_4;
            case "mood_5": return R.drawable.ic_widget_checkin_mood_5;
            case "sport_dumbbell": return R.drawable.ic_widget_checkin_sport_dumbbell;
            case "sport_bike": return R.drawable.ic_widget_checkin_sport_bike;
            case "sport_mountain": return R.drawable.ic_widget_checkin_sport_mountain;
            case "sport_footprints": return R.drawable.ic_widget_checkin_sport_footprints;
            case "sport_waves_ladder": return R.drawable.ic_widget_checkin_sport_waves_ladder;
            case "sport_yoga": return R.drawable.ic_widget_checkin_sport_yoga;
            case "sleep": return R.drawable.ic_widget_checkin_sleep;
            case "dreams": return R.drawable.ic_widget_checkin_dreams;
            case "food_quality": return R.drawable.ic_widget_checkin_food_quality;
            case "work": return R.drawable.ic_widget_checkin_work;
            case "alcohol": return R.drawable.ic_widget_checkin_alcohol;
            case "smoking": return R.drawable.ic_widget_checkin_smoking;
            case "level": return R.drawable.ic_widget_checkin_level;
            default: return R.drawable.ic_widget_checkin_social_life;
        }
    }

    /**
     * Opens the app on the check-in page (header and message). Without a login the app
     * ignores the route and just opens.
     */
    private static PendingIntent openAppIntent(Context context) {
        Intent intent = new Intent(context, MainActivity.class)
                .setAction(MainActivity.ACTION_WIDGET_ROUTE)
                .putExtra(MainActivity.EXTRA_WIDGET_ROUTE_KEY, "check_in")
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
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
