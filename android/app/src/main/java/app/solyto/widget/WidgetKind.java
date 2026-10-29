package app.solyto.widget;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.function.Consumer;

/**
 * Every widget kind native knows. A new widget is an entry here, a provider
 * with its layout, and the server's {@code /api/v1/widgets/<kind>} endpoint.
 */
public enum WidgetKind {

    YOUR_DAY("your-day", YourDayWidgetProvider.class, YourDayWidgetProvider::updateAll,
            "today", "due", "upcoming"),
    TIME_TRACKING("time-tracking", TimeTrackingWidgetProvider.class, TimeTrackingWidgetProvider::updateAll,
            "running", "projects");

    private static final String PATH_PREFIX = "/api/v1/widgets/";

    /** The payload's {@code kind} and the API path segment. */
    final String id;
    final String path;
    final Class<?> provider;
    /** The section keys the provider renders; other sections are ignored. */
    final Set<String> sectionKeys;
    private final Consumer<Context> render;

    WidgetKind(String id, Class<?> provider, Consumer<Context> render, String... sectionKeys) {
        this.id = id;
        this.path = PATH_PREFIX + id;
        this.provider = provider;
        this.render = render;
        this.sectionKeys = Collections.unmodifiableSet(new HashSet<>(Arrays.asList(sectionKeys)));
    }

    /** The kind with this id, or null. */
    static WidgetKind fromId(String id) {
        if (id == null) return null;
        for (WidgetKind kind : values()) {
            if (kind.id.equals(id)) return kind;
        }
        return null;
    }

    /** Re-renders every placed widget of every kind from the cache. */
    public static void updateAll(Context context) {
        for (WidgetKind kind : values()) kind.render(context);
    }

    /** Whether any widget of any kind is placed. */
    static boolean anyPlaced(Context context) {
        for (WidgetKind kind : values()) {
            if (kind.hasWidgets(context)) return true;
        }
        return false;
    }

    boolean hasWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        if (manager == null) return false;
        return manager.getAppWidgetIds(new ComponentName(context, provider)).length > 0;
    }

    /** Re-renders this kind's placed widgets from the cache. */
    void render(Context context) {
        render.accept(context);
    }
}
