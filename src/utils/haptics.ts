export type HapticEffectType = 'click' | 'tick' | 'heavy' | 'zoom_step' | 'zoom_end';

export function triggerHaptic(type: HapticEffectType = 'click') {
  try {
    // 1. Check Android Native HD Bridge
    const bridge = (window as any).AndroidHapticsBridge;
    if (bridge) {
      if (type === 'zoom_step' && typeof bridge.zoomStep === 'function') {
        bridge.zoomStep();
        return;
      }
      if (type === 'zoom_end' && typeof bridge.zoomEnd === 'function') {
        bridge.zoomEnd();
        return;
      }
      if (type === 'tick' && typeof bridge.tick === 'function') {
        bridge.tick();
        return;
      }
      if (type === 'heavy' && typeof bridge.heavy === 'function') {
        bridge.heavy();
        return;
      }
      if (typeof bridge.click === 'function') {
        bridge.click();
        return;
      }
      if (typeof bridge.performHaptic === 'function') {
        bridge.performHaptic(type);
        return;
      }
    }

    // 2. Web fallback (crisp micro-pulse)
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      if (type === 'zoom_step') {
        navigator.vibrate(6);
      } else if (type === 'zoom_end' || type === 'heavy') {
        navigator.vibrate([10, 25, 18]);
      } else if (type === 'tick') {
        navigator.vibrate(5);
      } else {
        navigator.vibrate(10);
      }
    }
  } catch (e) {
    // Ignore errors
  }
}

// Global click & tap tactile listener
export function initGlobalHaptics() {
  if (typeof window === 'undefined') return;

  // Listen for haptic events dispatched from in-app tool iframes
  window.addEventListener('message', (event) => {
    try {
      if (event.data && (event.data.type === 'HAPTIC_TRIGGER' || event.data.type === 'HAPTIC_FEEDBACK')) {
        const effect = event.data.effect || 'click';
        triggerHaptic(effect as HapticEffectType);
      }
    } catch (e) {}
  });

  // Attach tactile response to all interactive taps across the host app
  const interactiveSelector = 'button, [role="button"], a, input, select, textarea, [data-interactive="true"], summary';

  document.addEventListener('pointerdown', (e) => {
    const target = e.target as HTMLElement | null;
    if (target && target.closest(interactiveSelector)) {
      triggerHaptic('click');
    }
  }, { capture: true, passive: true });
}

