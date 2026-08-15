package app.solyto;

import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.drawable.ColorDrawable;
import android.os.Build;
import android.os.Bundle;
import androidx.core.content.ContextCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleShareIntent(getIntent());
        applySystemBarAppearance();
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

    private void applySystemBarAppearance() {
        // Edge-to-edge is only enforced on Android 15+ (API 35). On older
        // versions the system bars are opaque and drawn by the framework.
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.VANILLA_ICE_CREAM) {
            return;
        }

        boolean darkMode = (getResources().getConfiguration().uiMode
                & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;

        // The WebView is inset by the system bar insets, so the area behind the
        // transparent bars shows the window background. Match the web app's
        // background color so there is no visible strip.
        getWindow().setBackgroundDrawable(new ColorDrawable(ContextCompat.getColor(
                this, darkMode ? R.color.solyto_bg_dark : R.color.solyto_bg_light)));

        // Use dark bar icons on a light background and light icons on a dark one.
        WindowInsetsControllerCompat controller =
                WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.setAppearanceLightStatusBars(!darkMode);
        controller.setAppearanceLightNavigationBars(!darkMode);
    }
}
