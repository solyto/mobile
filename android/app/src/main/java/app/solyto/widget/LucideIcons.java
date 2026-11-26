package app.solyto.widget;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.util.Log;
import androidx.core.graphics.PathParser;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Draws an own tracker's Lucide icon for its rating buttons. The icons come
 * from the app's sprite in the bundled web assets ({@code icons/lucide-sprite.svg}),
 * so every icon the app's picker offers is available without a drawable per
 * icon. Icons are drawn white; the button's color filter gives each value its
 * color, like the built-in icons.
 */
final class LucideIcons {

    private static final String TAG = "LucideIcons";
    private static final String SPRITE = "public/icons/lucide-sprite.svg";
    private static final float VIEWBOX = 24f;
    private static final float STROKE_WIDTH = 2f;
    private static final int MAX_SPRITE_BYTES = 4 * 1024 * 1024;

    private static final Pattern SYMBOL = Pattern.compile("<symbol id=\"([a-z0-9-]+)\"[^>]*>(.*?)</symbol>", Pattern.DOTALL);
    private static final Pattern ELEMENT = Pattern.compile("<(path|circle|ellipse|rect|line|polyline|polygon)\\b([^>]*?)/?>");
    private static final Pattern ATTRIBUTE = Pattern.compile("([a-z-]+)=\"([^\"]*)\"");

    // Symbol markup by icon name, read once per process.
    private static Map<String, String> symbols;
    // Rendered icons by name and size: a row's buttons share one bitmap, which
    // keeps the widget update small.
    private static final Map<String, Bitmap> rendered = new HashMap<>();

    private LucideIcons() {}

    /** The icon as a white bitmap of the given size, or null when the sprite or the icon is missing. */
    static synchronized Bitmap render(Context context, String name, int sizePx) {
        String cacheKey = name + "@" + sizePx;
        Bitmap cached = rendered.get(cacheKey);
        if (cached != null) return cached;

        String markup = symbols(context).get(name);
        if (markup == null || sizePx <= 0) return null;

        Bitmap bitmap = Bitmap.createBitmap(sizePx, sizePx, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);
        canvas.scale(sizePx / VIEWBOX, sizePx / VIEWBOX);

        Paint stroke = new Paint(Paint.ANTI_ALIAS_FLAG);
        stroke.setStyle(Paint.Style.STROKE);
        stroke.setStrokeWidth(STROKE_WIDTH);
        stroke.setStrokeCap(Paint.Cap.ROUND);
        stroke.setStrokeJoin(Paint.Join.ROUND);
        stroke.setColor(0xFFFFFFFF);
        Paint fill = new Paint(Paint.ANTI_ALIAS_FLAG);
        fill.setStyle(Paint.Style.FILL);
        fill.setColor(0xFFFFFFFF);

        Matcher element = ELEMENT.matcher(markup);
        while (element.find()) {
            Map<String, String> attributes = attributes(element.group(2));
            Path path = path(element.group(1), attributes);
            if (path == null) continue;
            if ("currentColor".equals(attributes.get("fill"))) canvas.drawPath(path, fill);
            canvas.drawPath(path, stroke);
        }
        rendered.put(cacheKey, bitmap);
        return bitmap;
    }

    private static Map<String, String> symbols(Context context) {
        if (symbols != null) return symbols;

        Map<String, String> parsed = new HashMap<>();
        try {
            Matcher symbol = SYMBOL.matcher(readSprite(context));
            while (symbol.find()) parsed.put(symbol.group(1), symbol.group(2));
        } catch (IOException e) {
            // A build without the sprite: the buttons fall back to the level dot.
            Log.w(TAG, "Icon sprite not readable: " + e.getClass().getSimpleName());
        }
        symbols = Collections.unmodifiableMap(parsed);
        return symbols;
    }

    private static String readSprite(Context context) throws IOException {
        try (InputStream in = context.getAssets().open(SPRITE)) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buffer = new byte[8192];
            int read;
            while ((read = in.read(buffer)) != -1) {
                if (out.size() + read > MAX_SPRITE_BYTES) throw new IOException("Sprite too large");
                out.write(buffer, 0, read);
            }
            return new String(out.toByteArray(), StandardCharsets.UTF_8);
        }
    }

    private static Map<String, String> attributes(String markup) {
        Map<String, String> attributes = new HashMap<>();
        Matcher attribute = ATTRIBUTE.matcher(markup);
        while (attribute.find()) attributes.put(attribute.group(1), attribute.group(2));
        return attributes;
    }

    /** The element as a path in the 24×24 view box, or null when it can't be read. */
    private static Path path(String element, Map<String, String> a) {
        try {
            Path path = new Path();
            switch (element) {
                case "path":
                    String d = a.get("d");
                    return d != null ? PathParser.createPathFromPathData(d) : null;
                case "circle":
                    path.addCircle(number(a, "cx"), number(a, "cy"), number(a, "r"), Path.Direction.CW);
                    return path;
                case "ellipse":
                    float cx = number(a, "cx");
                    float cy = number(a, "cy");
                    float rx = number(a, "rx");
                    float ry = number(a, "ry");
                    path.addOval(new RectF(cx - rx, cy - ry, cx + rx, cy + ry), Path.Direction.CW);
                    return path;
                case "rect":
                    float x = number(a, "x");
                    float y = number(a, "y");
                    // An SVG rect with only rx or ry uses it for both.
                    float cornerX = a.containsKey("rx") ? number(a, "rx") : number(a, "ry");
                    float cornerY = a.containsKey("ry") ? number(a, "ry") : cornerX;
                    path.addRoundRect(new RectF(x, y, x + number(a, "width"), y + number(a, "height")),
                            cornerX, cornerY, Path.Direction.CW);
                    return path;
                case "line":
                    path.moveTo(number(a, "x1"), number(a, "y1"));
                    path.lineTo(number(a, "x2"), number(a, "y2"));
                    return path;
                case "polyline":
                case "polygon":
                    String[] points = a.containsKey("points") ? a.get("points").trim().split("[\\s,]+") : new String[0];
                    if (points.length < 4) return null;
                    path.moveTo(Float.parseFloat(points[0]), Float.parseFloat(points[1]));
                    for (int i = 2; i + 1 < points.length; i += 2) {
                        path.lineTo(Float.parseFloat(points[i]), Float.parseFloat(points[i + 1]));
                    }
                    if (element.equals("polygon")) path.close();
                    return path;
                default:
                    return null;
            }
        } catch (RuntimeException e) {
            // Malformed numbers or path data: skip the element.
            return null;
        }
    }

    private static float number(Map<String, String> attributes, String name) {
        String value = attributes.get(name);
        return value != null ? Float.parseFloat(value) : 0f;
    }
}
