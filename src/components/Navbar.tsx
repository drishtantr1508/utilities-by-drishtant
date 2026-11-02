import React from 'react';
import { Sun, Moon, Laptop, Command } from 'lucide-react';

export type ThemeMode = 'system' | 'light' | 'dark';

interface NavbarProps {
  themeMode: ThemeMode;
  isEffectiveDark: boolean;
  onCycleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  themeMode,
  isEffectiveDark,
  onCycleTheme,
}) => {
  const renderThemeIcon = () => {
    switch (themeMode) {
      case 'system':
        return <Laptop size={16} />;
      case 'dark':
        return <Moon size={16} />;
      case 'light':
        return <Sun size={16} />;
    }
  };

  const getThemeTitle = () => {
    switch (themeMode) {
      case 'system':
        return `Theme: System (${isEffectiveDark ? 'Dark' : 'Light'}) — Tap to override`;
      case 'dark':
        return 'Theme: Dark (Manual) — Tap for Light';
      case 'light':
        return 'Theme: Light (Manual) — Tap for System';
    }
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand-group">
          <div className="brand-icon">
            <Command size={18} />
          </div>
          <div>
            <h1 className="brand-name">Utilities by Drishtant</h1>
            <p className="brand-sub">Personal Applications & Tools</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={onCycleTheme}
            className="theme-toggle-btn"
            aria-label="Toggle theme mode"
            title={getThemeTitle()}
          >
            {renderThemeIcon()}
          </button>
        </div>
      </div>
    </header>
  );
};
