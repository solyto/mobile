package app.solyto;

import android.os.SystemClock;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import com.getcapacitor.Logger;
import com.getcapacitor.Plugin;
import com.getcapacitor.WebViewListener;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Collections;

/**
 * Decides whether a pull-down gesture may start a refresh.
 *
 * The web app never scrolls the document itself; content scrolls inside nested
 * elements, so the WebView always reports "at top". A small script injected
 * into each page checks, on every touchstart, whether anything under the finger
 * is scrolled down or is an overlay (modal, dialog, fixed sheet) or handles its
 * own touch gestures, and reports the result through a JavascriptInterface.
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
@CapacitorPlugin(name = "PullToRefresh")
public class PullToRefreshPlugin extends Plugin {

    static final String JS_INTERFACE = "SolytoPullToRefresh";

    // How long a touch waits for the page's answer before refresh is allowed
    // anyway (e.g. the page's main thread is busy or the script failed).
    private static final long JS_ANSWER_TIMEOUT_MS = 300;

    private static final String SCRIPT = "(function () {"
            + "  var bridge = window." + JS_INTERFACE + ";"
            + "  if (!bridge) return;"
            + "  if (window.__solytoPullToRefresh) { bridge.ready(); return; }"
            + "  window.__solytoPullToRefresh = true;"
            + "  var OVERLAY = 'dialog[open], [role=\"dialog\"], [role=\"alertdialog\"], [aria-modal=\"true\"]';"
            + "  function blocksPull(el) {"
            + "    if (window.visualViewport && window.visualViewport.scale > 1.01) return true;"
            + "    var root = document.scrollingElement;"
            + "    if (root && root.scrollTop > 0) return true;"
            + "    for (var n = el; n && n.nodeType === 1 && n !== document.documentElement; n = n.parentElement) {"
            + "      if (n.scrollTop > 0) return true;"
            + "      if (n.matches(OVERLAY)) return true;"
            + "      var s = getComputedStyle(n);"
            + "      if (s.position === 'fixed') return true;"
            + "      var ta = s.touchAction;"
            + "      if (ta && ta !== 'auto' && ta !== 'manipulation'"
            + "          && ta.indexOf('pan-y') < 0 && ta.indexOf('pan-down') < 0) return true;"
            + "    }"
            + "    return false;"
            + "  }"
            + "  var blocked = false;"
            + "  window.addEventListener('touchstart', function (e) {"
            + "    var t = e.target;"
            + "    if (t && t.nodeType !== 1) t = t.parentElement;"
            + "    try { blocked = e.touches.length > 1 || blocksPull(t); } catch (err) { blocked = true; }"
            + "    bridge.report(blocked);"
            + "  }, { capture: true, passive: true });"
            // A page handler that calls preventDefault() on touchmove (drag and
            // drop, custom gestures) owns the gesture. Check after all
            // listeners have run.
            + "  window.addEventListener('touchmove', function (e) {"
            + "    if (blocked) return;"
            + "    setTimeout(function () {"
            + "      if (e.defaultPrevented && !blocked) { blocked = true; bridge.report(true); }"
            + "    }, 0);"
            + "  }, { passive: true });"
            + "  bridge.ready();"
            + "})();";

    // Set once in load(), before the first page is loaded.
    private boolean documentStartScript = false;

    // Written from the JavaBridge thread, read on the main thread.
    private volatile boolean scriptReady = false;
    private volatile boolean answered = false;
    private volatile boolean blocked = false;

    // Main thread only.
    private long touchDownTime = 0;

    @Override
    public void load() {
        WebView webView = getBridge().getWebView();
        webView.addJavascriptInterface(new JsInterface(), JS_INTERFACE);
        if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
            try {
                WebViewCompat.addDocumentStartJavaScript(webView, SCRIPT,
                        Collections.singleton(getBridge().getLocalUrl()));
                documentStartScript = true;
            } catch (IllegalArgumentException e) {
                Logger.error("PullToRefresh: document-start script not added", e);
            }
        }
        getBridge().addWebViewListener(new WebViewListener() {
            @Override
            public void onPageStarted(WebView view) {
                // A document-start script may already have called ready() for
                // the new page before this callback arrives, so only reset when
                // the script is injected after load.
                if (!documentStartScript) scriptReady = false;
            }

            @Override
            public void onPageLoaded(WebView view) {
                view.evaluateJavascript(SCRIPT, null);
            }
        });
    }

    /** Called on the main thread when a new touch sequence starts. */
    void onTouchDown() {
        answered = false;
        blocked = false;
        touchDownTime = SystemClock.uptimeMillis();
    }

    /**
     * Whether the content under the finger can still scroll up (or otherwise
     * owns the gesture), i.e. a pull must not start a refresh.
     */
    boolean canContentScrollUp(WebView webView) {
        if (!scriptReady) {
            // No script on this page (still loading, error page): fall back to
            // the WebView's own scroll position.
            return webView.canScrollVertically(-1);
        }
        if (!answered) {
            // Wait briefly for the page's touchstart answer.
            return SystemClock.uptimeMillis() - touchDownTime < JS_ANSWER_TIMEOUT_MS;
        }
        return blocked;
    }

    private class JsInterface {
        @JavascriptInterface
        public void ready() {
            scriptReady = true;
        }

        @JavascriptInterface
        public void report(boolean isBlocked) {
            blocked = isBlocked;
            answered = true;
        }
    }
}
