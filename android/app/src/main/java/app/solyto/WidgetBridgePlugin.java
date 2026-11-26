package app.solyto;

import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.webkit.WebView;
import androidx.webkit.JavaScriptReplyProxy;
import androidx.webkit.WebMessageCompat;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import app.solyto.widget.PushSetup;
import app.solyto.widget.WidgetCache;
import app.solyto.widget.WidgetKind;
import app.solyto.widget.WidgetTokenStore;
import app.solyto.widget.WidgetWork;
import com.getcapacitor.Plugin;
import com.getcapacitor.WebViewListener;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * The widget bridge between the web app and native code: a
 * {@code window.SolytoWidgets} object, offered only to the app's own origin
 * through addWebMessageListener and accepting main-frame messages only.
 *
 * App → native: ready, setToken, clear, refresh, unsupported, getPushStatus,
 * enablePush, disablePush. Native → app: status (reply to ready), navigate
 * (widget row taps), pushStatus (one reply to each push message, with its id) and open
 * (notification taps). The widget token is never sent back.
 *
 * A Capacitor plugin only so the listener is added during bridge setup,
 * before the first page loads.
 */
@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    private static final String TAG = "WidgetBridge";
    private static final String JS_OBJECT = "SolytoWidgets";
    private static final int MAX_MESSAGE_LENGTH = 16 * 1024;
    private static final int MAX_REQUEST_ID_LENGTH = 64;

    // Token store and cache work (Keystore, disk) off the main thread, in order.
    private final ExecutorService storage = Executors.newSingleThreadExecutor();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    // Main thread only. The proxy belongs to the page that sent ready.
    private JavaScriptReplyProxy replyProxy;
    private String pendingRouteKey;
    private String pendingRouteId;
    private String pendingPath;
    // enablePush requests waiting for the notification permission dialog.
    private final List<PushRequest> awaitingPermission = new ArrayList<>();

    /** A push message from a page; answered with one pushStatus carrying its id. */
    private static final class PushRequest {
        final JavaScriptReplyProxy proxy;
        final String id;

        PushRequest(JavaScriptReplyProxy proxy, String id) {
            this.proxy = proxy;
            this.id = id;
        }
    }

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
            if (WidgetCache.setDeviceUnsupported(context, unsupported)) WidgetKind.updateAll(context);
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

    /** Opens a notification's page in the app now, or once the app reports ready. Main thread. */
    void openPath(String path) {
        if (replyProxy != null) {
            sendOpen(replyProxy, path);
        } else {
            pendingPath = path;
        }
    }

    /** The answer to the dialog asked for in {@link #onEnablePush}. Main thread. */
    void onNotificationPermissionResult() {
        List<PushRequest> requests = new ArrayList<>(awaitingPermission);
        awaitingPermission.clear();

        Context context = getContext().getApplicationContext();
        boolean allowed = PushSetup.canNotify(context);
        for (PushRequest request : requests) {
            if (allowed) {
                enablePush(context, request);
            } else {
                replyPushStatus(context, request, true);
            }
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
                    // Unregisters with the token, so before it is dropped.
                    PushSetup.disable(context);
                    WidgetTokenStore.clear(context);
                    WidgetCache.clear(context);
                    WidgetKind.updateAll(context);
                });
                break;
            case "refresh":
                storage.execute(() -> WidgetWork.fetchNow(context));
                break;
            case "unsupported":
                // The app's server has no widget routes. Without a token native
                // never fetches, so it only learns this from the app. A token
                // from an earlier server would show that server's data: drop it.
                storage.execute(() -> {
                    WidgetTokenStore.clear(context);
                    WidgetCache.clear(context);
                    WidgetCache.setState(context, WidgetCache.State.UNSUPPORTED_SERVER);
                    WidgetKind.updateAll(context);
                });
                break;
            case "getPushStatus":
                PushRequest status = pushRequest(proxy, json);
                if (status != null) replyPushStatus(context, status, false);
                break;
            case "enablePush":
                PushRequest enable = pushRequest(proxy, json);
                if (enable != null) onEnablePush(context, enable);
                break;
            case "disablePush":
                PushRequest disable = pushRequest(proxy, json);
                if (disable == null) break;
                storage.execute(() -> {
                    PushSetup.disable(context);
                    replyPushStatusNow(context, disable, false);
                });
                break;
            default:
                break;
        }
    }

    private static PushRequest pushRequest(JavaScriptReplyProxy proxy, JSONObject json) {
        String id = stringField(json, "id");
        if (id == null || id.isEmpty() || id.length() > MAX_REQUEST_ID_LENGTH) return null;
        return new PushRequest(proxy, id);
    }

    /**
     * Android 13+ is always asked: whether its dialog still appears isn't knowable beforehand (a
     * dismissed dialog doesn't count as a refusal); after a final refusal it answers at once.
     */
    private void onEnablePush(Context context, PushRequest request) {
        if (PushSetup.canNotify(context)) {
            enablePush(context, request);
            return;
        }
        MainActivity activity = getActivity() instanceof MainActivity ? (MainActivity) getActivity() : null;
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU || activity == null) {
            replyPushStatus(context, request, true);
            return;
        }

        boolean asking = !awaitingPermission.isEmpty();
        awaitingPermission.add(request);
        if (!asking) activity.requestNotificationPermission();
    }

    private void enablePush(Context context, PushRequest request) {
        storage.execute(() -> {
            PushSetup.enable(context);
            replyPushStatusNow(context, request, false);
        });
    }

    private void replyPushStatus(Context context, PushRequest request, boolean refused) {
        storage.execute(() -> replyPushStatusNow(context, request, refused));
    }

    /**
     * Sends the push state to the page that asked. "denied" after a refusal or where no dialog
     * exists (below Android 13: only the app's notification settings); otherwise "prompt" until
     * allowed. Storage thread.
     */
    private void replyPushStatusNow(Context context, PushRequest request, boolean refused) {
        boolean enabled = PushSetup.isOn(context);
        String permission;
        if (PushSetup.canNotify(context)) {
            permission = "granted";
        } else if (refused || Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            permission = "denied";
        } else {
            permission = "prompt";
        }
        mainHandler.post(() -> {
            try {
                post(request.proxy, new JSONObject().put("type", "pushStatus").put("id", request.id)
                        .put("enabled", enabled).put("permission", permission));
            } catch (JSONException e) {
                Log.w(TAG, "Push status not sent", e);
            }
        });
    }

    private void onReady(Context context, JavaScriptReplyProxy proxy) {
        replyProxy = proxy;
        if (pendingRouteKey != null) {
            sendNavigate(proxy, pendingRouteKey, pendingRouteId);
            pendingRouteKey = null;
            pendingRouteId = null;
        }
        if (pendingPath != null) {
            sendOpen(proxy, pendingPath);
            pendingPath = null;
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
                WidgetKind.updateAll(context);
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

    private void sendOpen(JavaScriptReplyProxy proxy, String path) {
        try {
            post(proxy, new JSONObject().put("type", "open").put("path", path));
        } catch (JSONException e) {
            Log.w(TAG, "Open not sent", e);
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
