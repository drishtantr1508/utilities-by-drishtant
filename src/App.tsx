import React, { useState, useEffect, useMemo } from 'react';
import { APPS_DATA } from './data/apps';
import { AppItem } from './types';
import { Navbar, ThemeMode } from './components/Navbar';
import { AppCard } from './components/AppCard';
import { PreviewModal } from './components/PreviewModal';
import { InAppToolView, ToolTab } from './components/InAppToolView';
import { Search } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapApp } from '@capacitor/app';

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

  // Handle Android Hardware Back Button
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const handleBackButton = CapApp.addListener('backButton', () => {
        // 1. If a preview modal is open, close it
        if (previewApp) {
          setPreviewApp(null);
          return;
        }
        // 2. If viewing a tool, return to home catalog
        if (activeTabId !== 'home') {
          setActiveTabId('home');
          return;
        }
        // 3. If already on home, minimize app
        CapApp.minimizeApp().catch(() => {});
      });

      return () => {
        handleBackButton.then((h) => h.remove());
      };
    }
  }, [previewApp, activeTabId]);

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
    setActiveTabId(app.id);
  };

  // Handle Home Screen Widget Deep Links & Tool Launches
  useEffect(() => {
    const processAppLaunch = (targetId: string | null | undefined) => {
      if (!targetId) return;
      if (targetId === 'home') {
        setActiveTabId('home');
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

  const handleSelectTab = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const handleCloseTab = (appId: string) => {
    setOpenTabs((prev) => {
      const remaining = prev.filter((t) => t.app.id !== appId);
      if (activeTabId === appId) {
        if (remaining.length > 0) {
          setActiveTabId(remaining[remaining.length - 1].app.id);
        } else {
          setActiveTabId('home');
        }
      }
      return remaining;
    });
  };

  const handleReloadTab = (appId: string) => {
    setOpenTabs((prev) =>
      prev.map((t) => (t.app.id === appId ? { ...t, iframeKey: t.iframeKey + 1 } : t))
    );
  };

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

  return (
    <div className="site-wrapper">
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
                    onClick={() => setActiveTabId(tab.app.id)}
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
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onReloadTab={handleReloadTab}
        onReturnHome={() => setActiveTabId('home')}
      />

      {/* Quick Windowed Preview Modal */}
      <PreviewModal
        app={previewApp}
        onClose={() => setPreviewApp(null)}
      />
    </div>
  );
};

export default App;
