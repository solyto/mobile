package app.solyto;

import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebView;
import android.widget.FrameLayout;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.ColorUtils;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

public class MainActivity extends BridgeActivity {

    // Safety net: hide the spinner even if no page-load callback arrives.
    private static final long REFRESH_TIMEOUT_MS = 15000;

    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final Runnable stopRefreshing = this::finishRefresh;
    // Where the spinner rests below the top of the WebView (SwipeRefreshLayout's default).
    private static final int REFRESH_INDICATOR_REST_DP = 64;

    private PullToRefreshLayout swipeRefresh;
    private int appliedIndicatorTop = 0;
    // Bar colours matching the page, reported by SystemBarsPlugin.
    private Integer pageStatusBarColor = null;
    private Integer pageNavigationBarColor = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(PullToRefreshPlugin.class);
        registerPlugin(SystemBarsPlugin.class);
        super.onCreate(savedInstanceState);
        applyKeyboardInsets();
        setupPullToRefresh();
        handleShareIntent(getIntent());
        applySystemBarAppearance();
        styleRefreshIndicator();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleShareIntent(intent);
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        applySystemBarAppearance();
        styleRefreshIndicator();
    }

    /**
     * Wraps the Capacitor WebView in a SwipeRefreshLayout so pulling down from
     * the top reloads the page with the standard Material spinner.
     * PullToRefreshPlugin decides whether a pull may start (see there).
     *
     * The WebView is put into an intermediate FrameLayout because Capacitor's
     * edge-to-edge handling ("adjustMarginsForEdgeToEdge") insets the WebView
     * via its layout margins, and SwipeRefreshLayout ignores child margins.
     */
    private void setupPullToRefresh() {
        WebView webView = getBridge().getWebView();
        if (!(webView.getParent() instanceof ViewGroup)) return;
        ViewGroup parent = (ViewGroup) webView.getParent();

        int index = parent.indexOfChild(webView);
        ViewGroup.LayoutParams webViewParams = webView.getLayoutParams();
        parent.removeView(webView);

        FrameLayout container = new FrameLayout(this);
        container.addView(webView, webViewParams instanceof ViewGroup.MarginLayoutParams
                ? new FrameLayout.LayoutParams((ViewGroup.MarginLayoutParams) webViewParams)
                : new FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        swipeRefresh = new PullToRefreshLayout(this);
        PullToRefreshPlugin gate = (PullToRefreshPlugin) getBridge()
                .getPlugin("PullToRefresh").getInstance();
        swipeRefresh.setGate(new PullToRefreshLayout.Gate() {
            @Override
            public void onTouchDown() {
                gate.onTouchDown();
            }

            @Override
            public boolean canContentScrollUp() {
                return gate.canContentScrollUp(webView);
            }
        });
        swipeRefresh.addView(container, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        parent.addView(swipeRefresh, index, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        swipeRefresh.setOnRefreshListener(() -> {
            mainHandler.removeCallbacks(stopRefreshing);
            mainHandler.postDelayed(stopRefreshing, REFRESH_TIMEOUT_MS);
            webView.reload();
        });

        getBridge().addWebViewListener(new WebViewListener() {
            @Override
            public void onPageLoaded(WebView view) {
                finishRefresh();
            }

            @Override
            public void onReceivedError(WebView view) {
                finishRefresh();
            }
        });

        // Keep the spinner below the status bar: under edge-to-edge (Android
        // 15+) the WebView's top margin is the status bar height.
        webView.addOnLayoutChangeListener((v, l, t, r, b, ol, ot, or, ob) -> {
            if (t != ot) v.post(this::applyRefreshIndicatorOffset);
        });

        // Re-dispatch insets so the WebView gets its edge-to-edge margins in
        // its new parent.
        ViewCompat.requestApplyInsets(swipeRefresh);
    }

    /**
     * Replaces Capacitor's edge-to-edge insets listener with one that also
     * respects the keyboard. Under edge-to-edge (Android 15+) the window is no
     * longer resized for the keyboard and Capacitor only insets the WebView by
     * the system bars, so the keyboard covered the WebView and the page never
     * noticed it (visualViewport did not shrink). Insetting the bottom by the
     * keyboard height shrinks the WebView, so dvh-sized layouts such as the
     * bottom sheet end up above the keyboard.
     */
    private void applyKeyboardInsets() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.VANILLA_ICE_CREAM) return;

        ViewCompat.setOnApplyWindowInsetsListener(getBridge().getWebView(), (v, windowInsets) -> {
            Insets bars = windowInsets.getInsets(
                    WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            Insets ime = windowInsets.getInsets(WindowInsetsCompat.Type.ime());
            ViewGroup.MarginLayoutParams mlp = (ViewGroup.MarginLayoutParams) v.getLayoutParams();
            mlp.leftMargin = bars.left;
            mlp.topMargin = bars.top;
            mlp.rightMargin = bars.right;
            mlp.bottomMargin = Math.max(bars.bottom, ime.bottom);
            v.setLayoutParams(mlp);
            return WindowInsetsCompat.CONSUMED;
        });
    }

    private void finishRefresh() {
        mainHandler.removeCallbacks(stopRefreshing);
        if (swipeRefresh != null && swipeRefresh.isRefreshing()) {
            swipeRefresh.setRefreshing(false);
        }
        applyRefreshIndicatorOffset();
    }

    /** Positions the spinner relative to the top of the WebView. */
    private void applyRefreshIndicatorOffset() {
        // setProgressViewOffset() resets the indicator, so never call it while
        // a refresh is showing; finishRefresh() calls this again afterwards.
        if (swipeRefresh == null || swipeRefresh.isRefreshing()) return;
        int top = getBridge().getWebView().getTop();
        if (top == appliedIndicatorTop) return;
        appliedIndicatorTop = top;

        int restingDistance = Math.round(
                REFRESH_INDICATOR_REST_DP * getResources().getDisplayMetrics().density);
        swipeRefresh.setProgressViewOffset(false,
                top - swipeRefresh.getProgressCircleDiameter(), top + restingDistance);
    }

    /** Spinner colours that follow the system light/dark mode. */
    private void styleRefreshIndicator() {
        if (swipeRefresh == null) return;
        boolean darkMode = (getResources().getConfiguration().uiMode
                & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
        swipeRefresh.setProgressBackgroundColorSchemeColor(ContextCompat.getColor(
                this, darkMode ? R.color.solyto_surface_dark : R.color.solyto_bg_light));
        swipeRefresh.setColorSchemeColors(
                ContextCompat.getColor(this, R.color.solyto_lightblue),
                ContextCompat.getColor(this, R.color.solyto_green));
    }

    private void handleShareIntent(Intent intent) {
        if (intent == null) return;
        if (!Intent.ACTION_SEND.equals(intent.getAction())) return;
        if (!"text/plain".equals(intent.getType())) return;

        String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
        if (sharedText == null || sharedText.isEmpty()) return;

        String encoded = android.net.Uri.encode(sharedText);
        getBridge().getWebView().post(() ->
            getBridge().getWebView().loadUrl("https://my.solyto.app/share?q=" + encoded)
        );
    }

    /** Called by SystemBarsPlugin; null when the page has no matching colours. */
    void setPageBarColors(Integer statusBarColor, Integer navigationBarColor) {
        pageStatusBarColor = statusBarColor;
        pageNavigationBarColor = navigationBarColor;
        applySystemBarAppearance();
    }

    /**
     * Gives the system bars the colours reported by the page, falling back to
     * the default light/dark background (following the system's dark mode)
     * until the page reports them or when it has none.
     */
    private void applySystemBarAppearance() {
        boolean darkMode = (getResources().getConfiguration().uiMode
                & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
        int defaultColor = ContextCompat.getColor(
                this, darkMode ? R.color.solyto_bg_dark : R.color.solyto_bg_light);
        int statusBarColor = pageStatusBarColor != null ? pageStatusBarColor : defaultColor;
        int navigationBarColor = pageNavigationBarColor != null ? pageNavigationBarColor : defaultColor;
        boolean lightStatusBar = isLightColor(statusBarColor);
        boolean lightNavigationBar = isLightColor(navigationBarColor);
        Window window = getWindow();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM) {
            // Edge-to-edge (Android 15+): the WebView is inset by the system
            // bar insets, so the area behind the transparent bars shows the
            // window background. Its middle is covered by the WebView.
            window.setBackgroundDrawable(new GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM,
                    new int[] { statusBarColor, statusBarColor, navigationBarColor, navigationBarColor }));
        } else {
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(statusBarColor);
            // Dark navigation bar icons need Android 8; keep the bar black
            // below that rather than showing light icons on a light colour.
            window.setNavigationBarColor(
                    Build.VERSION.SDK_INT >= Build.VERSION_CODES.O || !lightNavigationBar
                            ? navigationBarColor : Color.BLACK);
        }

        // The page sets no html/body background and sizes its container to
        // the whole-pixel window.innerHeight, so a sub-pixel strip of the
        // WebView's own (white) background shows below the page. Paint it
        // in the navigation bar colour instead.
        getBridge().getWebView().setBackgroundColor(navigationBarColor);

        // Without this, the 3-button navigation bar gets a translucent scrim
        // over the colour.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.setNavigationBarContrastEnforced(false);
        }

        WindowInsetsControllerCompat controller =
                WindowCompat.getInsetsController(window, window.getDecorView());
        controller.setAppearanceLightStatusBars(lightStatusBar);
        controller.setAppearanceLightNavigationBars(lightNavigationBar);
    }

    /** Whether dark icons contrast better than light ones on this colour. */
    private static boolean isLightColor(int color) {
        return ColorUtils.calculateContrast(Color.BLACK, color)
                > ColorUtils.calculateContrast(Color.WHITE, color);
    }
}
