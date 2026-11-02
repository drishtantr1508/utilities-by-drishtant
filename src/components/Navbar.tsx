import React from 'react';
import { Sun, Moon, Server, Command } from 'lucide-react';

interface NavbarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenStatus: () => void;
  totalApps: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDarkMode,
  onToggleTheme,
  onOpenStatus,
  totalApps,
}) => {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand-group">
          <div className="brand-icon">
            <Command size={18} />
          </div>
          <div>
            <div className="brand-title-row">
              <span className="brand-name">Utilities by Drishtant</span>
              <span className="brand-badge">{totalApps} Applications</span>
            </div>
            <p className="brand-sub">Central Hub & Developer Workbench</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={onOpenStatus}
            className="action-pill-btn"
            title="View Cloud & Deployment Status"
          >
            <Server size={14} className="pulse-icon" />
            <span>Infrastructure Status</span>
            <span className="status-dot-active" />
          </button>

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
