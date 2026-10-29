package app.solyto;

import android.content.Context;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.webkit.WebView;
import androidx.webkit.JavaScriptReplyProxy;
import androidx.webkit.WebMessageCompat;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import app.solyto.widget.WidgetCache;
import app.solyto.widget.WidgetTokenStore;
import app.solyto.widget.WidgetWork;
import app.solyto.widget.YourDayWidgetProvider;
import com.getcapacitor.Plugin;
import com.getcapacitor.WebViewListener;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Collections;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * The widget bridge between the web app and native code: a
 * {@code window.SolytoWidgets} object, offered only to the app's own origin
 * through addWebMessageListener and accepting main-frame messages only.
 *
 * App → native: ready, setToken, clear, refresh. Native → app: status (reply
 * to ready) and navigate (widget row taps). The widget token is never sent back.
 *
 * A Capacitor plugin only so the listener is added during bridge setup,
 * before the first page loads.
 */
@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    private static final String TAG = "WidgetBridge";
    private static final String JS_OBJECT = "SolytoWidgets";
    private static final int MAX_MESSAGE_LENGTH = 16 * 1024;

    // Token store and cache work (Keystore, disk) off the main thread, in order.
    private final ExecutorService storage = Executors.newSingleThreadExecutor();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    // Main thread only. The proxy belongs to the page that sent ready.
    private JavaScriptReplyProxy replyProxy;
    private String pendingRouteKey;
    private String pendingRouteId;

    @Override
    public void load() {
        Context context = getContext().getApplicationContext();
        boolean supported = WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER);
        if (supported) {
            try {
                WebViewCompat.addWebMessageListener(getBridge().getWebView(), JS_OBJECT,
                        Collections.singleton(getBridge().getLocalUrl()), this::onPostMessage);
            } catch (IllegalArgumentException e) {
                Log.w(TAG, "Message listener not added", e);
                supported = false;
            }
        }

        boolean unsupported = !supported;
        storage.execute(() -> {
            if (WidgetCache.setDeviceUnsupported(context, unsupported)) YourDayWidgetProvider.updateAll(context);
        });
        if (unsupported) return;

        getBridge().addWebViewListener(new WebViewListener() {
            @Override
            public void onPageStarted(WebView view) {
                replyProxy = null;
            }
        });
    }

    @Override
    protected void handleOnDestroy() {
        storage.shutdown();
    }

    /** Opens a widget route in the app now, or once the app reports ready. Main thread. */
    void openRoute(String key, String id) {
        if (replyProxy != null) {
            sendNavigate(replyProxy, key, id);
        } else {
            pendingRouteKey = key;
            pendingRouteId = id;
        }
    }

    private void onPostMessage(WebView view, WebMessageCompat message, Uri sourceOrigin,
            boolean isMainFrame, JavaScriptReplyProxy proxy) {
        if (!isMainFrame || message.getType() != WebMessageCompat.TYPE_STRING) return;
        String data = message.getData();
        if (data == null || data.length() > MAX_MESSAGE_LENGTH) return;

        JSONObject json;
        try {
            json = new JSONObject(data);
        } catch (JSONException e) {
            return;
        }

        Context context = getContext().getApplicationContext();
        switch (json.optString("type")) {
            case "ready":
                onReady(context, proxy);
                break;
            case "setToken":
                onSetToken(context, json);
                break;
            case "clear":
                storage.execute(() -> {
                    WidgetTokenStore.clear(context);
                    WidgetCache.clear(context);
                    YourDayWidgetProvider.updateAll(context);
                });
                break;
            case "refresh":
                storage.execute(() -> WidgetWork.fetchNow(context));
                break;
            default:
                break;
        }
    }

    private void onReady(Context context, JavaScriptReplyProxy proxy) {
        replyProxy = proxy;
        if (pendingRouteKey != null) {
            sendNavigate(proxy, pendingRouteKey, pendingRouteId);
            pendingRouteKey = null;
            pendingRouteId = null;
        }

        storage.execute(() -> {
            boolean needsToken = WidgetTokenStore.needsToken(context);
            mainHandler.post(() -> {
                if (proxy != replyProxy) return;
                try {
                    post(proxy, new JSONObject().put("type", "status").put("needsToken", needsToken));
                } catch (JSONException e) {
                    Log.w(TAG, "Status not sent", e);
                }
            });
        });
    }

    private void onSetToken(Context context, JSONObject json) {
        String token = stringField(json, "token");
        String expiresAt = stringField(json, "expiresAt");
        String apiUrl = stringField(json, "apiUrl");
        if (token == null || expiresAt == null || apiUrl == null) return;

        storage.execute(() -> {
            if (!WidgetTokenStore.save(context, token, expiresAt, apiUrl)) return;
            if (WidgetCache.state(context) != WidgetCache.State.OK) {
                WidgetCache.setState(context, WidgetCache.State.LOADING);
                YourDayWidgetProvider.updateAll(context);
            }
            WidgetWork.fetchNow(context);
        });
    }

    private void sendNavigate(JavaScriptReplyProxy proxy, String key, String id) {
        try {
            JSONObject message = new JSONObject().put("type", "navigate").put("key", key);
            if (id != null) message.put("id", id);
            post(proxy, message);
        } catch (JSONException e) {
            Log.w(TAG, "Navigate not sent", e);
        }
    }

    private static void post(JavaScriptReplyProxy proxy, JSONObject message) {
        proxy.postMessage(message.toString());
    }

    private static String stringField(JSONObject json, String name) {
        Object value = json.opt(name);
        return value instanceof String ? (String) value : null;
    }
}
