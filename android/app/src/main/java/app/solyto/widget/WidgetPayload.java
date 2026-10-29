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

    private static final Set<String> ICONS = new HashSet<>(Arrays.asList("event", "todo"));
    private static final int MAX_ROWS_PER_SECTION = 20;
    private static final int MAX_TEXT_LENGTH = 500;

    /** Row action UI types native can render; rows with other types get no control. */
    static final String ACTION_CHECK = "check";
    private static final Pattern ACTION_KEY = Pattern.compile("[a-z][a-z0-9_.-]*");
    private static final int MAX_ACTION_KEY_LENGTH = 64;
    // Path-segment safe and covers the UUIDs the server sends.
    private static final Pattern ROW_ID = Pattern.compile("[A-Za-z0-9-]{1,64}");

    static final class Item {
        final boolean isHeader;
        final String title;
        final String subtitle;
        final String timeLabel;
        /** "event", "todo" or null. */
        final String icon;
        final String routeKey;
        final String routeId;
        /** The row id; only set together with an action. */
        final String id;
        /** A known action type ({@link #ACTION_CHECK}) or null when the row has no action. */
        final String actionType;
        final String actionKey;
        final boolean actionChecked;

        Item(boolean isHeader, String title, String subtitle, String timeLabel, String icon,
                String routeKey, String routeId, String id, String actionType, String actionKey,
                boolean actionChecked) {
            this.isHeader = isHeader;
            this.title = title;
            this.subtitle = subtitle;
            this.timeLabel = timeLabel;
            this.icon = icon;
            this.routeKey = routeKey;
            this.routeId = routeId;
            this.id = id;
            this.actionType = actionType;
            this.actionKey = actionKey;
            this.actionChecked = actionChecked;
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

        List<Item> sectionRows = new ArrayList<>();
        for (int i = 0; i < rows.length() && sectionRows.size() < MAX_ROWS_PER_SECTION; i++) {
            Item row = parseRow(rows.optJSONObject(i));
            if (row != null) sectionRows.add(row);
        }
        if (sectionRows.isEmpty()) return;

        String sectionTitle = text(section, "title");
        if (sectionTitle != null) items.add(new Item(true, sectionTitle, null, null, null, null, null, null, null, null, false));
        items.addAll(sectionRows);
    }

    private static Item parseRow(JSONObject row) {
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
            }
        }

        return new Item(false, title, text(row, "subtitle"), text(row, "time_label"), icon, routeKey, routeId,
                id, actionType, actionKey, actionChecked);
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
