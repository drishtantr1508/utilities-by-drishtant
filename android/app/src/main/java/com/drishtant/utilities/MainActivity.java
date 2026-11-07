package com.drishtant.utilities;

import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.view.HapticFeedbackConstants;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import androidx.activity.BackEventCompat;
import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private Vibrator vibrator;
    private TextToSpeech tts;
    private boolean ttsInitialized = false;
    private String pendingSpeechText = null;
    private String pendingLaunchAppId = null;
    private OnBackPressedCallback predictiveBackCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setupEdgeToEdge();
        initVibrator();
        initTTS();
        setupPredictiveBack();
        setupBridges();
        handleWidgetLaunch(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleWidgetLaunch(intent);
    }

    private void handleWidgetLaunch(Intent intent) {
        if (intent == null) return;
        String appId = intent.getStringExtra("launch_app_id");
        if (appId != null && !appId.trim().isEmpty()) {
            pendingLaunchAppId = appId.trim();
            dispatchWidgetLaunch();
        }
    }

    private void dispatchWidgetLaunch() {
        if (pendingLaunchAppId == null) return;
        final String appId = pendingLaunchAppId;
        runOnUiThread(() -> {
            if (bridge != null && bridge.getWebView() != null) {
                pendingLaunchAppId = null;
                String js = "window.dispatchEvent(new CustomEvent('WIDGET_LAUNCH', { detail: { appId: '" + appId + "' } }));" +
                            "window.postMessage({ type: 'WIDGET_LAUNCH', appId: '" + appId + "' }, '*');";
                bridge.getWebView().evaluateJavascript(js, null);
            }
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        setupBridges();
        dispatchWidgetLaunch();
        if (tts == null || !ttsInitialized) {
            initTTS();
        }
    }

    private synchronized void initTTS() {
        if (ttsInitialized && tts != null) return;

        try {
            Context appContext = getApplicationContext();
            TextToSpeech.OnInitListener listener = status -> {
                if (status == TextToSpeech.SUCCESS && tts != null) {
                    ttsInitialized = true;
                    try {
                        // 1. Force audio output to standard Media channel (speakers/headphones at media volume)
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                            AudioAttributes audioAttrs = new AudioAttributes.Builder()
                                    .setUsage(AudioAttributes.USAGE_MEDIA)
                                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                                    .build();
                            tts.setAudioAttributes(audioAttrs);
                        }

                        // 2. Resilient locale setup: try system default first, then US, UK, or any available English
                        int result = tts.setLanguage(Locale.getDefault());
                        if (result < TextToSpeech.LANG_AVAILABLE) {
                            result = tts.setLanguage(Locale.US);
                            if (result < TextToSpeech.LANG_AVAILABLE) {
                                result = tts.setLanguage(Locale.UK);
                                if (result < TextToSpeech.LANG_AVAILABLE) {
                                    Set<Locale> available = tts.getAvailableLanguages();
                                    if (available != null) {
                                        for (Locale loc : available) {
                                            if (loc.getLanguage().equalsIgnoreCase("en") && tts.setLanguage(loc) >= TextToSpeech.LANG_AVAILABLE) {
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        tts.setSpeechRate(1.0f);
                        tts.setPitch(1.0f);

                        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                            @Override
                            public void onStart(String utteranceId) {
                                notifyTTSState("playing");
                            }

                            @Override
                            public void onDone(String utteranceId) {
                                notifyTTSState("stopped");
                            }

                            @Override
                            public void onError(String utteranceId) {
                                notifyTTSState("error");
                            }
                        });

                        // 3. Flush any queued speech that was triggered prior to init completion
                        if (pendingSpeechText != null) {
                            final String queued = pendingSpeechText;
                            pendingSpeechText = null;
                            speakChunks(queued);
                        }
                    } catch (Exception e) {
                        android.util.Log.e("MainActivity", "Error configuring TTS parameters", e);
                    }
                } else {
                    android.util.Log.e("MainActivity", "TextToSpeech init failed with status: " + status);
                    ttsInitialized = false;
                    tts = null;
                }
            };

            tts = new TextToSpeech(appContext, listener);
        } catch (Exception e) {
            android.util.Log.e("MainActivity", "Failed to construct TextToSpeech", e);
            ttsInitialized = false;
            tts = null;
        }
    }

    private void speakChunks(String text) {
        if (text == null || text.trim().isEmpty()) return;
        final String toSpeak = text.trim();

        runOnUiThread(() -> {
            if (tts != null && ttsInitialized) {
                try {
                    // Maximum safe chunk length is 3000 chars (Android TTS max limit is 4000)
                    List<String> chunks = new ArrayList<>();
                    if (toSpeak.length() <= 3000) {
                        chunks.add(toSpeak);
                    } else {
                        // Split by sentence terminators or newlines
                        String[] sentences = toSpeak.split("(?<=[.!?\\n])\\s+");
                        StringBuilder current = new StringBuilder();
                        for (String s : sentences) {
                            if (current.length() + s.length() + 1 > 3000) {
                                if (current.length() > 0) {
                                    chunks.add(current.toString());
                                    current = new StringBuilder();
                                }
                            }
                            if (s.length() > 3000) {
                                for (int i = 0; i < s.length(); i += 3000) {
                                    chunks.add(s.substring(i, Math.min(i + 3000, s.length())));
                                }
                            } else {
                                if (current.length() > 0) current.append(" ");
                                current.append(s);
                            }
                        }
                        if (current.length() > 0) {
                            chunks.add(current.toString());
                        }
                    }

                    boolean first = true;
                    for (int i = 0; i < chunks.size(); i++) {
                        String chunk = chunks.get(i);
                        Bundle params = new Bundle();
                        params.putInt(TextToSpeech.Engine.KEY_PARAM_STREAM, AudioManager.STREAM_MUSIC);
                        params.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, 1.0f);
                        int queueMode = first ? TextToSpeech.QUEUE_FLUSH : TextToSpeech.QUEUE_ADD;
                        first = false;
                        tts.speak(chunk, queueMode, params, "read_aloud_" + System.currentTimeMillis() + "_" + i);
                    }
                } catch (Exception e) {
                    android.util.Log.e("MainActivity", "TTS speak failed", e);
                }
            } else {
                // If engine not ready yet, record pending text and re-trigger initialization
                pendingSpeechText = toSpeak;
                if (tts == null || !ttsInitialized) {
                    initTTS();
                }
            }
        });
    }

    private void notifyTTSState(String state) {
        runOnUiThread(() -> {
            if (bridge != null && bridge.getWebView() != null) {
                String js = "window.dispatchEvent(new CustomEvent('NATIVE_TTS_STATE', { detail: { state: '" + state + "' } }));" +
                            "window.postMessage({ type: 'NATIVE_TTS_STATE', state: '" + state + "' }, '*');" +
                            "var iframes = document.querySelectorAll('iframe');" +
                            "for (var i = 0; i < iframes.length; i++) {" +
                            "  try { iframes[i].contentWindow.postMessage({ type: 'NATIVE_TTS_STATE', state: '" + state + "' }, '*'); } catch(e){}" +
                            "}";
                bridge.getWebView().evaluateJavascript(js, null);
            }
        });
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
            bridge.getWebView().post(() -> {
                try {
                    bridge.getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
                } catch (Exception ignored) {}
            });

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

            // Native Text-To-Speech Bridge for in-app tools & WebViews
            bridge.getWebView().addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void speak(String text) {
                    speakChunks(text);
                }

                @JavascriptInterface
                public void stop() {
                    runOnUiThread(() -> {
                        pendingSpeechText = null;
                        if (tts != null && ttsInitialized) {
                            try {
                                tts.stop();
                                notifyTTSState("stopped");
                            } catch (Exception ignored) {}
                        }
                    });
                }

                @JavascriptInterface
                public boolean isSpeaking() {
                    return tts != null && tts.isSpeaking();
                }
            }, "AndroidTTSBridge");

            // App Lifecycle & Widget Deep Link Bridge
            bridge.getWebView().addJavascriptInterface(new Object() {
                @JavascriptInterface
                public String getInitialLaunchAppId() {
                    String appId = getIntent() != null ? getIntent().getStringExtra("launch_app_id") : null;
                    return appId != null ? appId : "";
                }
            }, "AndroidAppBridge");

            // Predictive Back Gesture Bridge
            bridge.getWebView().addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void setBackEnabled(boolean enabled) {
                    runOnUiThread(() -> {
                        if (predictiveBackCallback != null) {
                            predictiveBackCallback.setEnabled(enabled);
                        }
                    });
                }
            }, "AndroidBackBridge");
        }
    }

    private void setupPredictiveBack() {
        predictiveBackCallback = new OnBackPressedCallback(false) {
            @Override
            public void handleOnBackStarted(@NonNull BackEventCompat backEvent) {
                dispatchBackGesture("START", backEvent.getProgress(), backEvent.getSwipeEdge(), backEvent.getTouchX(), backEvent.getTouchY());
            }

            @Override
            public void handleOnBackProgressed(@NonNull BackEventCompat backEvent) {
                dispatchBackGesture("PROGRESS", backEvent.getProgress(), backEvent.getSwipeEdge(), backEvent.getTouchX(), backEvent.getTouchY());
            }

            @Override
            public void handleOnBackPressed() {
                dispatchBackGesture("INVOKED", 1.0f, 0, 0, 0);
            }

            @Override
            public void handleOnBackCancelled() {
                dispatchBackGesture("CANCELLED", 0.0f, 0, 0, 0);
            }
        };

        getOnBackPressedDispatcher().addCallback(this, predictiveBackCallback);
    }

    private void dispatchBackGesture(String type, float progress, int swipeEdge, float touchX, float touchY) {
        runOnUiThread(() -> {
            if (bridge != null && bridge.getWebView() != null) {
                String js = "window.dispatchEvent(new CustomEvent('NATIVE_PREDICTIVE_BACK', { detail: { " +
                            "type: '" + type + "', " +
                            "progress: " + progress + ", " +
                            "edge: " + swipeEdge + ", " +
                            "touchX: " + touchX + ", " +
                            "touchY: " + touchY + " } }));";
                bridge.getWebView().evaluateJavascript(js, null);
            }
        });
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

    @Override
    public void onDestroy() {
        if (tts != null) {
            try {
                tts.stop();
                tts.shutdown();
            } catch (Exception ignored) {}
        }
        super.onDestroy();
    }
}
