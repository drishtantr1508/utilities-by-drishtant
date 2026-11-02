import React, { useState, useEffect, useMemo } from 'react';
import { APPS_DATA } from './data/apps';
import { AppItem, AppCategory } from './types';
import { Navbar } from './components/Navbar';
import { AppCard } from './components/AppCard';
import { PreviewModal } from './components/PreviewModal';
import { CloudStatusDrawer } from './components/CloudStatusDrawer';
import { ConfigureUrlModal } from './components/ConfigureUrlModal';
import { Search, Grid, Terminal, ArrowUpRight } from 'lucide-react';

export const App: React.FC = () => {
  // Theme state synced with system preference or localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('utilities_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Category & search filter
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [previewApp, setPreviewApp] = useState<AppItem | null>(null);
  const [configuringApp, setConfiguringApp] = useState<AppItem | null>(null);
  const [isStatusDrawerOpen, setIsStatusDrawerOpen] = useState(false);

  // Custom URLs (e.g. for Streamlit deployed app)
  const [customUrls, setCustomUrls] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('utilities_custom_urls');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('utilities_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleSaveUrl = (url: string) => {
    if (configuringApp) {
      const updated = { ...customUrls, [configuringApp.id]: url };
      setCustomUrls(updated);
      localStorage.setItem('utilities_custom_urls', JSON.stringify(updated));
      setConfiguringApp(null);
    }
  };

  const categories: AppCategory[] = [
    'All',
    'Finance & Tax',
    'Creative & Media',
    'Productivity',
    'Automation',
  ];

  const filteredApps = useMemo(() => {
    return APPS_DATA.filter((app) => {
      const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        app.title.toLowerCase().includes(q) ||
        app.tagline.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.techStack.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="site-wrapper">
      <Navbar
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onOpenStatus={() => setIsStatusDrawerOpen(true)}
        totalApps={APPS_DATA.length}
      />

      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-inner">
            <span className="hero-eyebrow">Drishtant Rai — Personal Suite</span>
            <h1 className="hero-heading">
              Personal applications, specialized tools & computational engines.
            </h1>
            <p className="hero-description">
              A unified operating surface aggregating photography curation, Indian payroll simulation,
              document management, and local backend services.
            </p>
          </div>
        </section>

        {/* Filter & Search Toolbar */}
        <section className="toolbar-section">
          <div className="toolbar-inner">
            {/* Category Pills */}
            <div className="category-group">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="search-input-wrapper">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Search tools, stacks, keywords..."
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
          </div>
        </section>

        {/* Apps Grid */}
        <section className="catalog-section">
          <div className="catalog-header">
            <div className="catalog-header-title">
              <Grid size={15} />
              <span>Catalog ({filteredApps.length})</span>
            </div>
          </div>

          {filteredApps.length === 0 ? (
            <div className="empty-state">
              <p>No tools found matching "{searchQuery}"</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="btn btn-secondary"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="apps-grid">
              {filteredApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  customUrl={customUrls[app.id]}
                  onPreview={(a) => setPreviewApp(a)}
                  onConfigureUrl={(a) => setConfiguringApp(a)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Streamlit Deployment Guide Helper Callout */}
        <section className="quickstart-callout">
          <div className="callout-content">
            <div className="callout-icon-frame">
              <Terminal size={20} />
            </div>
            <div>
              <h3 className="callout-title">Deploying Indian Salary Calculator to Streamlit Cloud</h3>
              <p className="callout-desc">
                Your `salary_calculator` project has been prepared with `requirements.txt` and git.
                Push it to GitHub and deploy in 1 click at <code>share.streamlit.io</code> for dedicated 1GB RAM and free SSL.
              </p>
            </div>
          </div>
          <a
            href="https://share.streamlit.io"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary callout-action-btn"
          >
            <span>Open Streamlit Cloud</span>
            <ArrowUpRight size={14} />
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <span className="footer-brand">Utilities by Drishtant</span>
            <span className="footer-divider">•</span>
            <span className="footer-copy">All engines operational</span>
          </div>
          <div className="footer-right">
            <button onClick={() => setIsStatusDrawerOpen(true)} className="footer-link">
              Cloud Infrastructure
            </button>
          </div>
        </div>
      </footer>

      {/* Preview Modal */}
      <PreviewModal
        app={previewApp}
        customUrl={previewApp ? customUrls[previewApp.id] : undefined}
        onClose={() => setPreviewApp(null)}
      />

      {/* Configure URL Modal */}
      <ConfigureUrlModal
        app={configuringApp}
        currentUrl={configuringApp ? customUrls[configuringApp.id] || configuringApp.url : ''}
        onSave={handleSaveUrl}
        onClose={() => setConfiguringApp(null)}
      />

      {/* Cloud Infrastructure Drawer */}
      <CloudStatusDrawer
        isOpen={isStatusDrawerOpen}
        onClose={() => setIsStatusDrawerOpen(false)}
      />
    </div>
  );
};

export default App;
