package com.drishtant.utilities;

import android.content.Context;
import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.view.HapticFeedbackConstants;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private Vibrator vibrator;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setupEdgeToEdge();
        initVibrator();
        setupBridges();
    }

    private void initVibrator() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                VibratorManager vibratorManager = (VibratorManager) getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
                if (vibratorManager != null) {
                    vibrator = vibratorManager.getDefaultVibrator();
                }
            }
            if (vibrator == null) {
                vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        setupEdgeToEdge();
    }

    private void setupBridges() {
        if (bridge != null && bridge.getWebView() != null) {
            // Theme Bridge
            bridge.getWebView().addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void setSystemBarTheme(boolean isDark) {
                    runOnUiThread(() -> applySystemBarTheme(isDark));
                }
            }, "AndroidThemeBridge");

            // High-Definition Tactile Haptics Bridge (Pixel & Modern Android LRA actuator)
            bridge.getWebView().addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void click() {
                    triggerHapticEffect("click");
                }

                @JavascriptInterface
                public void tick() {
                    triggerHapticEffect("tick");
                }

                @JavascriptInterface
                public void heavy() {
                    triggerHapticEffect("heavy");
                }

                @JavascriptInterface
                public void zoomStep() {
                    triggerHapticEffect("zoom_step");
                }

                @JavascriptInterface
                public void zoomEnd() {
                    triggerHapticEffect("zoom_end");
                }

                @JavascriptInterface
                public void performHaptic(String type) {
                    triggerHapticEffect(type);
                }
            }, "AndroidHapticsBridge");
        }
    }

    private void triggerHapticEffect(String type) {
        runOnUiThread(() -> {
            View targetView = (bridge != null && bridge.getWebView() != null) ? bridge.getWebView() : getWindow().getDecorView();

            if (vibrator != null && vibrator.hasVibrator()) {
                try {
                    if ("click".equals(type) || "button".equals(type)) {
                        // Pixel HD crisp mechanical click
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && vibrator.areAllPrimitivesSupported(VibrationEffect.Composition.PRIMITIVE_CLICK)) {
                            vibrator.vibrate(VibrationEffect.startComposition()
                                    .addPrimitive(VibrationEffect.Composition.PRIMITIVE_CLICK, 0.75f)
                                    .compose());
                            return;
                        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                            vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK));
                            return;
                        }
                    } else if ("tick".equals(type) || "selection".equals(type)) {
                        // Subtle clock tick / notched selection
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && vibrator.areAllPrimitivesSupported(VibrationEffect.Composition.PRIMITIVE_TICK)) {
                            vibrator.vibrate(VibrationEffect.startComposition()
                                    .addPrimitive(VibrationEffect.Composition.PRIMITIVE_TICK, 0.45f)
                                    .compose());
                            return;
                        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                            vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK));
                            return;
                        }
                    } else if ("zoom_step".equals(type)) {
                        // Elongated ratcheting texture while zooming
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && vibrator.areAllPrimitivesSupported(VibrationEffect.Composition.PRIMITIVE_LOW_TICK)) {
                            vibrator.vibrate(VibrationEffect.startComposition()
                                    .addPrimitive(VibrationEffect.Composition.PRIMITIVE_LOW_TICK, 0.35f)
                                    .compose());
                            return;
                        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                            vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK));
                            return;
                        }
                    } else if ("zoom_end".equals(type) || "heavy".equals(type)) {
                        // Distinguished mechanical conclusion
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && vibrator.areAllPrimitivesSupported(VibrationEffect.Composition.PRIMITIVE_THUD)) {
                            vibrator.vibrate(VibrationEffect.startComposition()
                                    .addPrimitive(VibrationEffect.Composition.PRIMITIVE_THUD, 0.85f)
                                    .compose());
                            return;
                        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                            vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_HEAVY_CLICK));
                            return;
                        }
                    }
                } catch (Exception ignored) {}
            }

            // High-fidelity fallback via View Haptic Feedback Constants (uses Pixel ROM tuning)
            if (targetView != null) {
                int flags = HapticFeedbackConstants.FLAG_IGNORE_GLOBAL_SETTING | HapticFeedbackConstants.FLAG_IGNORE_VIEW_SETTING;
                if ("zoom_end".equals(type) || "heavy".equals(type)) {
                    targetView.performHapticFeedback(HapticFeedbackConstants.CONFIRM, flags);
                } else if ("tick".equals(type) || "zoom_step".equals(type)) {
                    targetView.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK, flags);
                } else {
                    targetView.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP, flags);
                }
            }
        });
    }

    private void applySystemBarTheme(boolean isDark) {
        Window window = getWindow();
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
        if (controller != null) {
            controller.setAppearanceLightStatusBars(!isDark);
            controller.setAppearanceLightNavigationBars(!isDark);
        }
    }

    private void setupEdgeToEdge() {
        Window window = getWindow();

        // 1. Enable Edge-to-Edge: content flows seamlessly under status bar & gesture navigation bar
        WindowCompat.setDecorFitsSystemWindows(window, false);

        // 2. Make system bars transparent
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);

        // 3. Remove translucent scrims over gesture bar (Android 10+ / API 29+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.setNavigationBarContrastEnforced(false);
            window.setStatusBarContrastEnforced(false);
        }

        // 4. Adapt icon colors for status and navigation bars according to system dark/light theme
        int nightMode = getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        boolean isDark = nightMode == Configuration.UI_MODE_NIGHT_YES;
        applySystemBarTheme(isDark);
    }
}
