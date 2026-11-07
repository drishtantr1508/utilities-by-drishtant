import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { APPS_DATA } from './data/apps';
import { AppItem, BackGestureState } from './types';
import { Navbar, ThemeMode } from './components/Navbar';
import { AppCard } from './components/AppCard';
import { PreviewModal } from './components/PreviewModal';
import { InAppToolView, ToolTab } from './components/InAppToolView';
import { Search } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

declare global {
  interface Window {
    AndroidThemeBridge?: {
      setSystemBarTheme: (isDark: boolean) => void;
    };
    AndroidBackBridge?: {
      setBackEnabled: (enabled: boolean) => void;
    };
    AndroidHapticsBridge?: {
      click: () => void;
      tick: () => void;
      heavy: () => void;
    };
  }
}

export const App: React.FC = () => {
  // Theme preference: defaults to 'system' to strictly respect Android system dark/light mode
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('utilities_theme_mode');
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved as ThemeMode;
    }
    return 'system';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen to live system dark mode changes from Android OS / Browser
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isEffectiveDark = themeMode === 'system' ? systemIsDark : themeMode === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [previewApp, setPreviewApp] = useState<AppItem | null>(null);

  // Tab & In-App WebView state
  const [openTabs, setOpenTabs] = useState<ToolTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('home');

  // Linear Navigation History Stack (avoids recursive loops between tools)
  const [navHistory, setNavHistory] = useState<string[]>(['home']);

  // Android Native Predictive Back Gesture Tracking
  const [backGesture, setBackGesture] = useState<BackGestureState | null>(null);

  // Sync DOM attribute, localStorage, and Native Status Bar & Navigation Bar
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isEffectiveDark ? 'dark' : 'light');
    localStorage.setItem('utilities_theme_mode', themeMode);

    // Sync native Android status bar overlay and icon colors
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
      StatusBar.setStyle({ style: isEffectiveDark ? Style.Dark : Style.Light }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#00000000' }).catch(() => {});

      // Native Android navigation gesture bar & status bar icon colors bridge
      if (window.AndroidThemeBridge && typeof window.AndroidThemeBridge.setSystemBarTheme === 'function') {
        window.AndroidThemeBridge.setSystemBarTheme(isEffectiveDark);
      }
    }
  }, [themeMode, isEffectiveDark, activeTabId]);

  // Navigate Back (unwinds linear history stack without recursion loops)
  const navigateBack = useCallback(() => {
    // 1. If preview modal is open, dismiss it first
    if (previewApp) {
      setPreviewApp(null);
      return;
    }

    // 2. Unwind the history stack
    setNavHistory((prev) => {
      if (prev.length <= 1) {
        setActiveTabId('home');
        return ['home'];
      }
      const nextStack = prev.slice(0, prev.length - 1);
      const destination = nextStack[nextStack.length - 1] || 'home';
      setActiveTabId(destination);
      return nextStack;
    });
  }, [previewApp]);

  // Dynamically inform Android whether the in-app back callback should be enabled
  // If on homepage and no modal is open, backEnabled=false so Android OS triggers native predictive back-to-home!
  useEffect(() => {
    const canGoBackInApp = Boolean(previewApp || activeTabId !== 'home' || navHistory.length > 1);

    if (window.AndroidBackBridge && typeof window.AndroidBackBridge.setBackEnabled === 'function') {
      window.AndroidBackBridge.setBackEnabled(canGoBackInApp);
    }
  }, [previewApp, activeTabId, navHistory]);

  // Listen for native Android 14+ Predictive Back Gesture events from MainActivity
  useEffect(() => {
    const handleNativePredictiveBack = (e: any) => {
      const detail = e.detail;
      if (!detail) return;

      if (detail.type === 'START') {
        const dest = previewApp
          ? 'preview-modal'
          : (navHistory.length > 1 ? navHistory[navHistory.length - 2] : 'home');

        setBackGesture({
          active: true,
          progress: 0,
          edge: detail.edge ?? 0,
          touchX: detail.touchX,
          touchY: detail.touchY,
          destinationTabId: dest,
        });
      } else if (detail.type === 'PROGRESS') {
        setBackGesture((prev) => {
          if (!prev) {
            const dest = previewApp
              ? 'preview-modal'
              : (navHistory.length > 1 ? navHistory[navHistory.length - 2] : 'home');
            return {
              active: true,
              progress: detail.progress,
              edge: detail.edge ?? 0,
              touchX: detail.touchX,
              touchY: detail.touchY,
              destinationTabId: dest,
            };
          }
          return {
            ...prev,
            progress: detail.progress,
            touchX: detail.touchX,
            touchY: detail.touchY,
          };
        });
      } else if (detail.type === 'INVOKED') {
        navigateBack();
        setTimeout(() => {
          setBackGesture(null);
        }, 120);
      } else if (detail.type === 'CANCELLED') {
        setBackGesture(null);
      }
    };

    window.addEventListener('NATIVE_PREDICTIVE_BACK', handleNativePredictiveBack);
    return () => {
      window.removeEventListener('NATIVE_PREDICTIVE_BACK', handleNativePredictiveBack);
    };
  }, [previewApp, navHistory, activeTabId, navigateBack]);

  const cycleTheme = () => {
    setThemeMode((prev) => {
      if (prev === 'system') return 'dark';
      if (prev === 'dark') return 'light';
      return 'system';
    });
  };

  // Launch tool in in-app webview tab
  const handleLaunchApp = (app: AppItem) => {
    setOpenTabs((prev) => {
      const existing = prev.find((t) => t.app.id === app.id);
      if (existing) {
        return prev;
      }
      return [...prev, { app, iframeKey: 0 }];
    });
    setNavHistory((prev) => {
      if (prev[prev.length - 1] === app.id) return prev;
      return [...prev, app.id];
    });
    setActiveTabId(app.id);
  };

  const handleSelectTab = (tabId: string) => {
    if (tabId === activeTabId) return;
    if (tabId === 'home') {
      handleReturnHome();
      return;
    }
    setNavHistory((prev) => {
      if (prev[prev.length - 1] === tabId) return prev;
      return [...prev, tabId];
    });
    setActiveTabId(tabId);
  };

  const handleReturnHome = () => {
    setNavHistory(['home']);
    setActiveTabId('home');
  };

  const handleCloseTab = (appId: string) => {
    setOpenTabs((prev) => prev.filter((t) => t.app.id !== appId));
    setNavHistory((prev) => {
      const remainingHistory = prev.filter((id) => id !== appId);
      const cleanHistory = remainingHistory.length > 0 ? remainingHistory : ['home'];
      if (activeTabId === appId) {
        const nextActive = cleanHistory[cleanHistory.length - 1] || 'home';
        setActiveTabId(nextActive);
      }
      return cleanHistory;
    });
  };

  const handleReloadTab = (appId: string) => {
    setOpenTabs((prev) =>
      prev.map((t) => (t.app.id === appId ? { ...t, iframeKey: t.iframeKey + 1 } : t))
    );
  };

  // Handle Home Screen Widget Deep Links & Tool Launches
  useEffect(() => {
    const processAppLaunch = (targetId: string | null | undefined) => {
      if (!targetId) return;
      if (targetId === 'home') {
        handleReturnHome();
        return;
      }
      const matched = APPS_DATA.find((a) => a.id === targetId);
      if (matched) {
        handleLaunchApp(matched);
      }
    };

    // 1. Check native AndroidAppBridge initial intent on startup
    try {
      const bridge = (window as any).AndroidAppBridge;
      if (bridge && typeof bridge.getInitialLaunchAppId === 'function') {
        const initial = bridge.getInitialLaunchAppId();
        if (initial) {
          processAppLaunch(initial);
        }
      }
    } catch (e) {}

    // 2. Check URL search query parameter
    try {
      const params = new URLSearchParams(window.location.search);
      const urlApp = params.get('launch');
      if (urlApp) {
        processAppLaunch(urlApp);
      }
    } catch (e) {}

    // 3. Listen for live widget events from MainActivity
    const onCustomEvent = (e: any) => {
      processAppLaunch(e.detail?.appId);
    };
    const onMessageEvent = (e: MessageEvent) => {
      if (e.data?.type === 'WIDGET_LAUNCH') {
        processAppLaunch(e.data.appId);
      }
    };

    window.addEventListener('WIDGET_LAUNCH', onCustomEvent);
    window.addEventListener('message', onMessageEvent);

    return () => {
      window.removeEventListener('WIDGET_LAUNCH', onCustomEvent);
      window.removeEventListener('message', onMessageEvent);
    };
  }, []);

  const filteredApps = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return APPS_DATA;
    return APPS_DATA.filter(
      (app) =>
        app.title.toLowerCase().includes(q) ||
        app.tagline.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const isBackToHome = Boolean(backGesture?.active && backGesture.destinationTabId === 'home');
  const homeProgress = isBackToHome ? backGesture?.progress ?? 0 : 0;
  const mainStyle: React.CSSProperties = {
    transform: isBackToHome ? `scale(${0.96 + homeProgress * 0.04})` : 'none',
    opacity: isBackToHome ? 0.75 + homeProgress * 0.25 : 1,
    transition: homeProgress === 0 ? 'transform 0.25s ease, opacity 0.25s ease' : 'none',
  };

  return (
    <div className="site-wrapper" style={mainStyle}>
      <Navbar
        themeMode={themeMode}
        isEffectiveDark={isEffectiveDark}
        onCycleTheme={cycleTheme}
      />

      <main className="main-content">
        {/* Active Tools Resume Banner (if any tools are running in background) */}
        {openTabs.length > 0 && (
          <section className="active-tools-banner">
            <div className="active-tools-inner">
              <div className="active-tools-label">
                <span className="pulse-dot">●</span>
                <span>Running in background ({openTabs.length}):</span>
              </div>
              <div className="active-tools-pills">
                {openTabs.map((tab) => (
                  <button
                    key={tab.app.id}
                    onClick={() => handleSelectTab(tab.app.id)}
                    className="active-pill"
                    title={`Resume ${tab.app.title}`}
                  >
                    <span>{tab.app.title}</span>
                    <span className="active-pill-action">Resume →</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Clean Hero Section */}
        <section className="hero-section">
          <div className="hero-inner">
            <span className="hero-eyebrow">Drishtant Rai</span>
            <h2 className="hero-heading">
              Personal applications and computational tools.
            </h2>
            <p className="hero-description">
              An independent suite of web applications spanning curatorial photography exhibitions,
              dynamic tax engines, and personal workspaces.
            </p>
          </div>
        </section>

        {/* Minimal Search Bar */}
        <section className="search-section">
          <div className="search-input-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="search-clear-btn"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </section>

        {/* Clean Apps Grid */}
        <section className="catalog-section">
          {filteredApps.length === 0 ? (
            <div className="empty-state">
              <p>No applications found matching "{searchQuery}"</p>
              <button onClick={() => setSearchQuery('')} className="btn btn-secondary">
                Clear Search
              </button>
            </div>
          ) : (
            <div className="apps-grid">
              {filteredApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  isOpen={openTabs.some((t) => t.app.id === app.id)}
                  onLaunch={handleLaunchApp}
                  onPreview={(a) => setPreviewApp(a)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <span className="footer-brand">Utilities by Drishtant</span>
          <span className="footer-copy">© {new Date().getFullYear()} Drishtant Rai. All rights reserved.</span>
        </div>
      </footer>

      {/* Full-Screen In-App WebView & Multi-Tab Switcher */}
      <InAppToolView
        tabs={openTabs}
        activeTabId={activeTabId}
        backGesture={backGesture}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onReloadTab={handleReloadTab}
        onReturnHome={handleReturnHome}
      />

      {/* Quick Windowed Preview Modal */}
      <PreviewModal
        app={previewApp}
        backGesture={backGesture}
        onClose={() => setPreviewApp(null)}
      />
    </div>
  );
};

export default App;
