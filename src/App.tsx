import React, { useState, useEffect, useMemo } from 'react';
import { APPS_DATA } from './data/apps';
import { AppItem } from './types';
import { Navbar } from './components/Navbar';
import { AppCard } from './components/AppCard';
import { PreviewModal } from './components/PreviewModal';
import { Search } from 'lucide-react';

export const App: React.FC = () => {
  // Theme state synced with system preference or localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('utilities_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [previewApp, setPreviewApp] = useState<AppItem | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('utilities_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
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
      <Navbar isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />

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
