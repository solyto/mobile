package app.solyto.widget;

import android.content.Context;
import android.content.SharedPreferences;
import android.net.Uri;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import android.util.Log;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.KeyStore;
import java.util.Locale;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/**
 * Keeps the widget token, encrypted with an AES-GCM key from the
 * AndroidKeyStore. Only the ciphertext, IV, expiry and API URL are written to
 * private SharedPreferences (excluded from backup). Every failure counts as
 * "no token"; the token is never stored in plain text and never logged.
 */
public final class WidgetTokenStore {

    private static final String TAG = "WidgetTokenStore";

    /** Prefs file name; the backup rules exclude {@code widget_token.xml}. */
    static final String PREFS = "widget_token";

    private static final String KEYSTORE = "AndroidKeyStore";
    private static final String KEY_ALIAS = "solyto_widget_token";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int TAG_BITS = 128;
    private static final int MAX_TOKEN_LENGTH = 4096;
    private static final int MAX_URL_LENGTH = 2048;

    private static final String KEY_CIPHERTEXT = "ciphertext";
    private static final String KEY_IV = "iv";
    private static final String KEY_EXPIRES_AT = "expires_at";
    private static final String KEY_API_URL = "api_url";

    private WidgetTokenStore() {}

    /**
     * Stores a token from the app. Returns false (and stores nothing) when the
     * values are invalid or encryption fails.
     */
    public static synchronized boolean save(Context context, String token, String expiresAt, String apiUrl) {
        if (token == null || token.isEmpty() || token.length() > MAX_TOKEN_LENGTH) return false;
        long expiresAtMillis = IsoTime.parse(expiresAt);
        if (expiresAtMillis <= System.currentTimeMillis()) return false;
        String url = normalizeApiUrl(apiUrl);
        if (url == null) return false;

        try {
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey());
            cipher.updateAAD(associatedData(expiresAtMillis, url));
            byte[] ciphertext = cipher.doFinal(token.getBytes(StandardCharsets.UTF_8));

            return prefs(context).edit()
                    .putString(KEY_CIPHERTEXT, Base64.encodeToString(ciphertext, Base64.NO_WRAP))
                    .putString(KEY_IV, Base64.encodeToString(cipher.getIV(), Base64.NO_WRAP))
                    .putLong(KEY_EXPIRES_AT, expiresAtMillis)
                    .putString(KEY_API_URL, url)
                    .commit();
        } catch (GeneralSecurityException | RuntimeException e) {
            Log.w(TAG, "Could not encrypt the widget token: " + e.getClass().getSimpleName());
            clear(context);
            return false;
        }
    }

    /** The token, or null when there is none, it has expired or cannot be decrypted. */
    public static synchronized String readToken(Context context) {
        SharedPreferences prefs = prefs(context);
        String ciphertext = prefs.getString(KEY_CIPHERTEXT, null);
        String iv = prefs.getString(KEY_IV, null);
        String url = prefs.getString(KEY_API_URL, null);
        long expiresAt = prefs.getLong(KEY_EXPIRES_AT, 0);
        if (ciphertext == null || iv == null || url == null) return null;
        if (expiresAt <= System.currentTimeMillis()) return null;

        try {
            KeyStore keyStore = KeyStore.getInstance(KEYSTORE);
            keyStore.load(null);
            SecretKey key = (SecretKey) keyStore.getKey(KEY_ALIAS, null);
            if (key == null) {
                clear(context);
                return null;
            }

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, key,
                    new GCMParameterSpec(TAG_BITS, Base64.decode(iv, Base64.NO_WRAP)));
            cipher.updateAAD(associatedData(expiresAt, url));
            byte[] token = cipher.doFinal(Base64.decode(ciphertext, Base64.NO_WRAP));
            return new String(token, StandardCharsets.UTF_8);
        } catch (Exception e) {
            // Invalidated key, restored prefs without the key, tampered data.
            Log.w(TAG, "Stored widget token is unreadable: " + e.getClass().getSimpleName());
            clear(context);
            return null;
        }
    }

    /** The API URL from the last setToken, without a trailing slash, or null. */
    public static synchronized String apiUrl(Context context) {
        return prefs(context).getString(KEY_API_URL, null);
    }

    public static boolean needsToken(Context context) {
        return readToken(context) == null;
    }

    public static synchronized void clear(Context context) {
        prefs(context).edit().clear().commit();
    }

    /** Clears the store only if it still holds this token (a newer one may have arrived meanwhile). */
    static synchronized void clearIfCurrent(Context context, String token) {
        if (token.equals(readToken(context))) clear(context);
    }

    /** The bare server URL (http or https, with a host), without trailing slashes, or null. */
    static String normalizeApiUrl(String apiUrl) {
        if (apiUrl == null || apiUrl.isEmpty() || apiUrl.length() > MAX_URL_LENGTH) return null;
        String url = apiUrl.trim();
        while (url.endsWith("/")) url = url.substring(0, url.length() - 1);

        Uri uri = Uri.parse(url);
        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
        if (!scheme.equals("https") && !scheme.equals("http")) return null;
        if (uri.getHost() == null || uri.getHost().isEmpty()) return null;
        if (uri.getQuery() != null || uri.getFragment() != null || uri.getUserInfo() != null) return null;
        return url;
    }

    private static byte[] associatedData(long expiresAt, String url) {
        return (expiresAt + "\n" + url).getBytes(StandardCharsets.UTF_8);
    }

    private static SecretKey getOrCreateKey() throws GeneralSecurityException {
        try {
            KeyStore keyStore = KeyStore.getInstance(KEYSTORE);
            keyStore.load(null);
            SecretKey existing = (SecretKey) keyStore.getKey(KEY_ALIAS, null);
            if (existing != null) return existing;
        } catch (java.io.IOException e) {
            throw new GeneralSecurityException(e);
        }

        KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, KEYSTORE);
        generator.init(new KeyGenParameterSpec.Builder(KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .build());
        return generator.generateKey();
    }

    private static SharedPreferences prefs(Context context) {
        return context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }
}
