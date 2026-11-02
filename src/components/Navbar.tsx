import React from 'react';
import { Sun, Moon, Command } from 'lucide-react';

interface NavbarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isDarkMode, onToggleTheme }) => {
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
            onClick={onToggleTheme}
            className="theme-toggle-btn"
            aria-label="Toggle theme mode"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
};
