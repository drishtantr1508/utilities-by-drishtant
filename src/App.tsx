import React, { useState, useEffect, useMemo } from 'react';
import { APPS_DATA } from './data/apps';
import { AppItem } from './types';
import { Navbar, ThemeMode } from './components/Navbar';
import { AppCard } from './components/AppCard';
import { PreviewModal } from './components/PreviewModal';
import { Search } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

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

  // Sync DOM attribute, localStorage, and Native Status Bar
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isEffectiveDark ? 'dark' : 'light');
    localStorage.setItem('utilities_theme_mode', themeMode);

    // Sync native Android status bar overlay and icon colors
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
      StatusBar.setStyle({ style: isEffectiveDark ? Style.Dark : Style.Light }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#00000000' }).catch(() => {});
    }
  }, [themeMode, isEffectiveDark]);

  const cycleTheme = () => {
    setThemeMode((prev) => {
      if (prev === 'system') return 'dark';
      if (prev === 'dark') return 'light';
      return 'system';
    });
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

      {/* Preview Modal */}
      <PreviewModal
        app={previewApp}
        onClose={() => setPreviewApp(null)}
      />
    </div>
  );
};

export default App;
