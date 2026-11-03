import React from 'react';
import { AppItem } from '../types';
import { 
  ArrowLeft, 
  X, 
  RotateCw, 
  ExternalLink, 
  Camera, 
  Calculator, 
  FileText,
  Home
} from 'lucide-react';

export interface ToolTab {
  app: AppItem;
  iframeKey: number;
}

interface InAppToolViewProps {
  tabs: ToolTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (appId: string) => void;
  onReloadTab: (appId: string) => void;
  onReturnHome: () => void;
}

export const InAppToolView: React.FC<InAppToolViewProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onReloadTab,
  onReturnHome,
}) => {
  if (tabs.length === 0) return null;

  const currentTab = tabs.find((t) => t.app.id === activeTabId);
  const targetApp = currentTab ? currentTab.app : tabs[0].app;

  const renderIcon = (iconName: string, size = 13) => {
    switch (iconName) {
      case 'camera':
        return <Camera size={size} />;
      case 'calculator':
        return <Calculator size={size} />;
      case 'file-text':
        return <FileText size={size} />;
      default:
        return <Camera size={size} />;
    }
  };

  return (
    <div
      className="in-app-tool-wrapper"
      style={{ display: activeTabId === 'home' ? 'none' : 'flex' }}
    >
      {/* Sleek Top Navigation Bar */}
      <header className="tool-navbar">
        <div className="tool-navbar-inner">
          {/* Home / Back Action */}
          <button
            onClick={onReturnHome}
            className="tool-nav-btn tool-home-btn"
            title="Return to Catalog (Home)"
          >
            <ArrowLeft size={15} />
            <span className="tool-home-label">Home</span>
          </button>

          {/* Tab Strip */}
          <div className="tool-tabs-scroller">
            <button
              onClick={onReturnHome}
              className={`tool-tab-pill ${activeTabId === 'home' ? 'active' : ''}`}
              title="Catalog Dashboard"
            >
              <Home size={13} />
              <span>Catalog</span>
            </button>

            {tabs.map((tab) => {
              const isActive = activeTabId === tab.app.id;
              return (
                <div
                  key={tab.app.id}
                  className={`tool-tab-pill ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectTab(tab.app.id)}
                  title={tab.app.title}
                >
                  <span className="tool-tab-icon">
                    {renderIcon(tab.app.iconName, 13)}
                  </span>
                  <span className="tool-tab-title">{tab.app.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.app.id);
                    }}
                    className="tool-tab-close"
                    title={`Close ${tab.app.title}`}
                  >
                    <X size={11} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick Toolbar */}
          <div className="tool-actions">
            <button
              onClick={() => onReloadTab(targetApp.id)}
              className="tool-nav-btn tool-action-btn"
              title="Reload Tool"
            >
              <RotateCw size={14} />
            </button>
            <a
              href={targetApp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="tool-nav-btn tool-action-btn"
              title="Open in External Browser"
            >
              <ExternalLink size={14} />
            </a>
            <button
              onClick={() => onCloseTab(targetApp.id)}
              className="tool-nav-btn tool-close-btn"
              title="Close Tool"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Edge-to-Edge Frames Canvas */}
      <main className="tool-frames-canvas">
        {tabs.map((tab) => {
          const isVisible = activeTabId === tab.app.id;
          const frameUrl = tab.app.previewUrl || tab.app.url;

          return (
            <div
              key={tab.app.id}
              className="tool-frame-layer"
              style={{ display: isVisible ? 'block' : 'none' }}
            >
              <iframe
                key={tab.iframeKey}
                src={frameUrl}
                title={tab.app.title}
                className="tool-webview-iframe"
                allow="camera; microphone; geolocation; clipboard-write; clipboard-read"
              />
            </div>
          );
        })}
      </main>
    </div>
  );
};
