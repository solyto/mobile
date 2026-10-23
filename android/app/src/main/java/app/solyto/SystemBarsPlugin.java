package app.solyto;

import android.graphics.Color;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import com.getcapacitor.Logger;
import com.getcapacitor.Plugin;
import com.getcapacitor.WebViewListener;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Colours the system bars with the page's background colour.
 *
 * The app's theme and light/dark appearance are web settings (independent of
 * the system's dark mode), and themes bring their own background colours. A
 * small script injected into each page reads the computed background of the
 * page container whenever the theme can have changed and reports it, together
 * with the active theme, through a JavascriptInterface. Wallpaper themes have
 * no solid background; their bars get the colours of the wallpaper's top and
 * bottom edges, measured once from the theme's wallpaper on a phone-sized
 * viewport and blended with any translucent layer the theme draws over that
 * edge. Without either, MainActivity falls back to its defaults.
 *
 * This is a Capacitor plugin only so that the JavascriptInterface is added
 * during bridge setup, before the first page is loaded (interfaces added later
 * only show up after the next page load).
 *
 * The script is registered as a document-start script, so the WebView runs it
 * on every page load by itself. Capacitor's onPageLoaded is only a fallback
 * for WebViews without that feature: Capacitor skips it whenever
 * onPageFinished arrives before the progress reaches 100.
 */
@CapacitorPlugin(name = "SystemBars")
public class SystemBarsPlugin extends Plugin {

    static final String JS_INTERFACE = "SolytoSystemBars";

    // Reported by the script when the page has no solid background colour.
    private static final int NO_COLOR = -1;

    // Theme id -> { status bar colour, navigation bar colour }.
    private static final Map<String, int[]> WALLPAPER_BAR_COLORS = new HashMap<>();

    static {
        WALLPAPER_BAR_COLORS.put("aero", new int[] { 0xFF123970, 0xFF185595 });
        WALLPAPER_BAR_COLORS.put("xp", new int[] { 0xFF167DD2, 0xFF455D0C });
        // Skyrim has no window margin: the bars border the content area
        // (rgba(14, 14, 18, 0.9) over the wallpaper edge #BCD2D8) and the
        // mobile navbar (rgba(14, 14, 18, 0.3) over #10100C).
        WALLPAPER_BAR_COLORS.put("skyrim", new int[] { 0xFF1F2226, 0xFF0F0F0E });
    }

    private static final String SCRIPT = "(function () {"
            + "  var bridge = window." + JS_INTERFACE + ";"
            // Document-start scripts also run in same-origin iframes, which
            // have no page container and would reset the bars.
            + "  if (!bridge || window !== window.top || window.__solytoSystemBars) return;"
            + "  window.__solytoSystemBars = true;"
            + "  var SETTLE_MS = 400;"
            + "  var canvas = document.createElement('canvas');"
            + "  canvas.width = canvas.height = 1;"
            + "  var ctx = canvas.getContext('2d', { willReadFrequently: true });"
            // Computed colours can be in any colour space (e.g. oklch); the
            // canvas converts them to sRGB.
            + "  function backgroundColor() {"
            + "    var el = document.querySelector('.page-container');"
            + "    if (!el) return " + NO_COLOR + ";"
            + "    ctx.clearRect(0, 0, 1, 1);"
            + "    ctx.fillStyle = getComputedStyle(el).backgroundColor;"
            + "    ctx.fillRect(0, 0, 1, 1);"
            + "    var d = ctx.getImageData(0, 0, 1, 1).data;"
            + "    return d[3] === 255 ? (d[0] << 16) | (d[1] << 8) | d[2] : " + NO_COLOR + ";"
            + "  }"
            // Theme stylesheets are loaded from /themes/{id}/{id}.css.
            + "  function themeId() {"
            + "    var link = document.querySelector('link[href^=\"/themes/\"]');"
            + "    return link ? link.getAttribute('href').split('/')[2] : '';"
            + "  }"
            + "  var last = null;"
            + "  function report() {"
            + "    var color = backgroundColor();"
            + "    var theme = themeId();"
            + "    var key = color + ' ' + theme;"
            + "    if (key === last) return;"
            + "    last = key;"
            + "    bridge.setBackground(color, theme);"
            + "  }"
            // Report right away and once more after colour transitions and
            // theme stylesheets have settled.
            + "  var timer = null;"
            + "  function schedule() {"
            + "    requestAnimationFrame(report);"
            + "    clearTimeout(timer);"
            + "    timer = setTimeout(report, SETTLE_MS);"
            + "  }"
            + "  function start() {"
            // Theme and appearance are applied as classes/styles on <html>
            // and as theme stylesheets added to <head>.
            + "    new MutationObserver(schedule).observe(document.documentElement,"
            + "        { attributes: true, attributeFilter: ['class', 'style'] });"
            + "    new MutationObserver(function (mutations) {"
            + "      mutations.forEach(function (m) {"
            + "        m.addedNodes.forEach(function (n) {"
            + "          if (n.tagName === 'LINK') n.addEventListener('load', schedule);"
            + "        });"
            + "      });"
            + "      schedule();"
            + "    }).observe(document.head, { childList: true });"
            // The page container may not be rendered yet when this runs.
            + "    if (!document.querySelector('.page-container')) {"
            + "      var mount = new MutationObserver(function () {"
            + "        if (!document.querySelector('.page-container')) return;"
            + "        mount.disconnect();"
            + "        schedule();"
            + "      });"
            + "      mount.observe(document.body, { childList: true, subtree: true });"
            + "    }"
            + "    schedule();"
            + "  }"
            // As a document-start script this runs before <head> and <body>
            // exist.
            + "  if (document.readyState === 'loading') {"
            + "    document.addEventListener('DOMContentLoaded', start);"
            + "  } else {"
            + "    start();"
            + "  }"
            + "})();";

    @Override
    public void load() {
        WebView webView = getBridge().getWebView();
        webView.addJavascriptInterface(new JsInterface(), JS_INTERFACE);
        if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
            try {
                WebViewCompat.addDocumentStartJavaScript(webView, SCRIPT,
                        Collections.singleton(getBridge().getLocalUrl()));
            } catch (IllegalArgumentException e) {
                Logger.error("SystemBars: document-start script not added", e);
            }
        }
        getBridge().addWebViewListener(new WebViewListener() {
            @Override
            public void onPageLoaded(WebView view) {
                view.evaluateJavascript(SCRIPT, null);
            }
        });
    }

    private class JsInterface {
        @JavascriptInterface
        public void setBackground(int rgb, String theme) {
            Integer top = null;
            Integer bottom = null;
            if (rgb != NO_COLOR) {
                top = bottom = Color.rgb(Color.red(rgb), Color.green(rgb), Color.blue(rgb));
            } else if (WALLPAPER_BAR_COLORS.containsKey(theme)) {
                int[] colors = WALLPAPER_BAR_COLORS.get(theme);
                top = colors[0];
                bottom = colors[1];
            }

            Integer statusBarColor = top;
            Integer navigationBarColor = bottom;
            getActivity().runOnUiThread(() -> {
                if (getActivity() instanceof MainActivity) {
                    ((MainActivity) getActivity()).setPageBarColors(statusBarColor, navigationBarColor);
                }
            });
        }
    }
}
