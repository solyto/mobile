package app.solyto.widget;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Widget data (schema version 1), the format all widget kinds share,
 * flattened into section headers and rows. Unknown sections, icons and fields
 * are ignored and malformed rows skipped. All text is display-ready from the server.
 */
final class WidgetPayload {

    static final int SCHEMA_VERSION = 1;

    private static final Set<String> ICONS = new HashSet<>(Arrays.asList("event", "todo", "timer"));
    private static final Set<String> BUTTON_ICONS = new HashSet<>(Arrays.asList("play", "stop"));
    static final Set<String> OPTION_ICONS = new HashSet<>(Arrays.asList(
            "mood_1", "mood_2", "mood_3", "mood_4", "mood_5",
            "sport_dumbbell", "sport_bike", "sport_mountain", "sport_footprints", "sport_waves_ladder",
            "sport_yoga", "sleep", "dreams", "food_quality", "food_amount", "water", "work",
            "menstruation", "alcohol", "smoking", "social_life"));
    static final int MAX_OPTIONS = 6;
    private static final Pattern COLOR = Pattern.compile("#[0-9A-Fa-f]{6}");
    private static final int MAX_ROWS_PER_SECTION = 20;
    private static final int MAX_TEXT_LENGTH = 500;

    /** Row action UI types native can render; rows with other types get no control. */
    static final String ACTION_CHECK = "check";
    static final String ACTION_BUTTON = "button";
    static final String ACTION_SCALE = "scale";
    static final int NO_COLOR = 0;
    private static final Pattern ACTION_KEY = Pattern.compile("[a-z][a-z0-9_.-]*");
    private static final int MAX_ACTION_KEY_LENGTH = 64;
    // Path-segment safe; covers the UUIDs and tracker keys (e.g. food_quality) the server sends.
    private static final Pattern ROW_ID = Pattern.compile("[A-Za-z0-9_-]{1,64}");

    /** One value of a scale action. */
    static final class Option {
        final int value;
        /** One of {@link #OPTION_ICONS}. */
        final String icon;
        /** Opaque ARGB. */
        final int color;

        Option(int value, String icon, int color) {
            this.value = value;
            this.icon = icon;
            this.color = color;
        }
    }

    static final class Item {
        final boolean isHeader;
        final String title;
        final String subtitle;
        final String timeLabel;
        /** "event", "todo", "timer" or null. */
        final String icon;
        /** Whether the row shows the time elapsed since {@link #at}. */
        final boolean liveElapsed;
        /** Epoch millis of the row's {@code at}, or -1. */
        final long at;
        /** Opaque ARGB, or {@link #NO_COLOR}. */
        final int color;
        final String routeKey;
        final String routeId;
        /** The row id; only set together with an action. */
        final String id;
        /** A known action type ({@link #ACTION_CHECK}, {@link #ACTION_BUTTON}, {@link #ACTION_SCALE}) or null when the row has no action. */
        final String actionType;
        final String actionKey;
        final boolean actionChecked;
        /** "play" or "stop" for button actions, else null. */
        final String actionIcon;
        /** The selected value of a scale action, or null. */
        final Integer actionValue;
        /** The valid options of a scale action (1 to {@link #MAX_OPTIONS}), else empty. */
        final List<Option> options;
        /** The key of the section this header or row belongs to. */
        final String section;

        /** Whether the value is one of this row's scale options. */
        boolean hasOption(int value) {
            for (Option option : options) {
                if (option.value == value) return true;
            }
            return false;
        }

        Item(boolean isHeader, String title, String subtitle, String timeLabel, String icon,
                boolean liveElapsed, long at, int color, String routeKey, String routeId, String id,
                String actionType, String actionKey, boolean actionChecked, String actionIcon,
                Integer actionValue, List<Option> options, String section) {
            this.isHeader = isHeader;
            this.title = title;
            this.subtitle = subtitle;
            this.timeLabel = timeLabel;
            this.icon = icon;
            this.liveElapsed = liveElapsed;
            this.at = at;
            this.color = color;
            this.routeKey = routeKey;
            this.routeId = routeId;
            this.id = id;
            this.actionType = actionType;
            this.actionKey = actionKey;
            this.actionChecked = actionChecked;
            this.actionIcon = actionIcon;
            this.actionValue = actionValue;
            this.options = options;
            this.section = section;
        }
    }

    final String title;
    final String emptyLabel;
    final List<Item> items;
    /** Epoch millis when the data goes stale, or -1. */
    final long refreshAt;

    private WidgetPayload(String title, String emptyLabel, List<Item> items, long refreshAt) {
        this.title = title;
        this.emptyLabel = emptyLabel;
        this.items = items;
        this.refreshAt = refreshAt;
    }

    static boolean isValidActionKey(String key) {
        return key != null && key.length() <= MAX_ACTION_KEY_LENGTH && ACTION_KEY.matcher(key).matches();
    }

    static boolean isValidRowId(String id) {
        return id != null && ROW_ID.matcher(id).matches();
    }

    /** The row with this id and action, or null. */
    Item findAction(String type, String key, String id) {
        for (Item item : items) {
            if (item.actionType != null && item.actionType.equals(type)
                    && item.actionKey.equals(key) && item.id.equals(id)) {
                return item;
            }
        }
        return null;
    }

    static boolean isNewerSchema(JSONObject data) {
        return data.optInt("schema_version", SCHEMA_VERSION) > SCHEMA_VERSION;
    }

    /** Null when the data is not a payload of this kind this version can read. */
    static WidgetPayload parse(JSONObject data, WidgetKind kind) {
        if (data == null || !kind.id.equals(data.optString("kind")) || isNewerSchema(data)) return null;

        JSONObject labels = data.optJSONObject("labels");
        String title = labels != null ? text(labels, "title") : null;
        String emptyLabel = labels != null ? text(labels, "empty") : null;

        List<Item> items = new ArrayList<>();
        JSONArray sections = data.optJSONArray("sections");
        if (sections != null) {
            for (int i = 0; i < sections.length(); i++) {
                JSONObject section = sections.optJSONObject(i);
                if (section == null || !kind.sectionKeys.contains(section.optString("key"))) continue;
                addSection(items, section);
            }
        }

        return new WidgetPayload(title, emptyLabel, Collections.unmodifiableList(items),
                IsoTime.parse(data.optString("refresh_at", null)));
    }

    private static void addSection(List<Item> items, JSONObject section) {
        JSONArray rows = section.optJSONArray("rows");
        if (rows == null) return;
        String sectionKey = section.optString("key");

        List<Item> sectionRows = new ArrayList<>();
        for (int i = 0; i < rows.length() && sectionRows.size() < MAX_ROWS_PER_SECTION; i++) {
            Item row = parseRow(rows.optJSONObject(i), sectionKey);
            if (row != null) sectionRows.add(row);
        }
        if (sectionRows.isEmpty()) return;

        String sectionTitle = text(section, "title");
        if (sectionTitle != null) items.add(new Item(true, sectionTitle, null, null, null, false, -1, NO_COLOR,
                null, null, null, null, null, false, null, null, Collections.<Option>emptyList(), sectionKey));
        items.addAll(sectionRows);
    }

    private static Item parseRow(JSONObject row, String sectionKey) {
        if (row == null) return null;
        String title = text(row, "title");
        if (title == null) return null;

        String icon = row.optString("icon", null);
        if (!ICONS.contains(icon)) icon = null;

        String routeKey = null;
        String routeId = null;
        JSONObject route = row.optJSONObject("route");
        if (route != null) {
            routeKey = text(route, "key");
            routeId = text(route, "id");
        }

        String id = null;
        String actionType = null;
        String actionKey = null;
        boolean actionChecked = false;
        String actionIcon = null;
        Integer actionValue = null;
        List<Option> options = Collections.emptyList();
        JSONObject action = row.optJSONObject("action");
        String rowId = text(row, "id");
        if (action != null && isValidRowId(rowId)) {
            String type = text(action, "type");
            String key = text(action, "key");
            if (ACTION_CHECK.equals(type) && isValidActionKey(key)) {
                id = rowId;
                actionType = type;
                actionKey = key;
                actionChecked = action.optBoolean("checked", false);
            } else if (ACTION_BUTTON.equals(type) && isValidActionKey(key)
                    && BUTTON_ICONS.contains(text(action, "icon"))) {
                id = rowId;
                actionType = type;
                actionKey = key;
                actionIcon = text(action, "icon");
            } else if (ACTION_SCALE.equals(type) && isValidActionKey(key)) {
                List<Option> scale = options(action.optJSONArray("options"));
                if (!scale.isEmpty()) {
                    id = rowId;
                    actionType = type;
                    actionKey = key;
                    actionValue = integer(action.opt("value"));
                    options = scale;
                }
            }
        }

        return new Item(false, title, text(row, "subtitle"), text(row, "time_label"), icon,
                "elapsed".equals(text(row, "live")), IsoTime.parse(text(row, "at")), color(text(row, "color")),
                routeKey, routeId, id, actionType, actionKey, actionChecked, actionIcon, actionValue, options, sectionKey);
    }

    /** The valid options, at most {@link #MAX_OPTIONS}; options with an unknown icon or invalid color or value are skipped. */
    private static List<Option> options(JSONArray array) {
        if (array == null) return Collections.emptyList();
        List<Option> options = new ArrayList<>();
        for (int i = 0; i < array.length() && options.size() < MAX_OPTIONS; i++) {
            JSONObject option = array.optJSONObject(i);
            if (option == null) continue;
            Integer value = integer(option.opt("value"));
            String icon = text(option, "icon");
            int color = color(text(option, "color"));
            if (value == null || !OPTION_ICONS.contains(icon) || color == NO_COLOR) continue;
            options.add(new Option(value, icon, color));
        }
        return Collections.unmodifiableList(options);
    }

    /** A JSON integer that fits an int, else null. */
    private static Integer integer(Object value) {
        if (value instanceof Integer) return (Integer) value;
        if (value instanceof Long) {
            long l = (Long) value;
            if (l >= Integer.MIN_VALUE && l <= Integer.MAX_VALUE) return (int) l;
        }
        return null;
    }

    /** A strict {@code #RRGGBB} as opaque ARGB, else {@link #NO_COLOR}. */
    private static int color(String value) {
        if (value == null || !COLOR.matcher(value).matches()) return NO_COLOR;
        return 0xFF000000 | Integer.parseInt(value.substring(1), 16);
    }

    /** A non-empty string field, cut to a sane length, or null. */
    private static String text(JSONObject object, String name) {
        Object value = object.opt(name);
        if (!(value instanceof String)) return null;
        String s = ((String) value).trim();
        if (s.isEmpty()) return null;
        return s.length() > MAX_TEXT_LENGTH ? s.substring(0, MAX_TEXT_LENGTH) : s;
    }
}
