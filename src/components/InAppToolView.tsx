import React from 'react';
import { AppItem, BackGestureState } from '../types';
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
  backGesture?: BackGestureState | null;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (appId: string) => void;
  onReloadTab: (appId: string) => void;
  onReturnHome: () => void;
}

export const InAppToolView: React.FC<InAppToolViewProps> = ({
  tabs,
  activeTabId,
  backGesture,
  onSelectTab,
  onCloseTab,
  onReloadTab,
  onReturnHome,
}) => {
  if (tabs.length === 0) return null;

  const currentTab = tabs.find((t) => t.app.id === activeTabId);
  const targetApp = currentTab ? currentTab.app : tabs[0].app;

  const isGestureActive = Boolean(backGesture?.active);
  const progress = isGestureActive ? backGesture?.progress ?? 0 : 0;
  const isTargetHome = backGesture?.destinationTabId === 'home';
  const edge = backGesture?.edge ?? 0;
  const translateXSign = edge === 0 ? 1 : -1;

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

  const wrapperStyle: React.CSSProperties = {
    display: activeTabId === 'home' ? 'none' : 'flex',
    ...(isGestureActive && isTargetHome
      ? {
          transform: `scale(${1 - progress * 0.08}) translateX(${progress * 28 * translateXSign}px)`,
          borderRadius: `${Math.round(progress * 24)}px`,
          boxShadow: `0 16px 48px rgba(0, 0, 0, ${0.15 + progress * 0.35})`,
          overflow: 'hidden',
          transition: progress === 0 ? 'transform 0.25s cubic-bezier(0.2, 0, 0, 1), border-radius 0.25s ease, box-shadow 0.25s ease' : 'none',
          willChange: 'transform, border-radius',
        }
      : {
          transform: 'none',
          borderRadius: '0px',
          boxShadow: 'none',
          transition: 'transform 0.25s cubic-bezier(0.2, 0, 0, 1), border-radius 0.25s ease, box-shadow 0.25s ease',
        }),
  };

  return (
    <div
      className="in-app-tool-wrapper"
      style={wrapperStyle}
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
          const isCurrentActive = activeTabId === tab.app.id;
          const isDestination = isGestureActive && backGesture?.destinationTabId === tab.app.id;
          const frameUrl = tab.app.previewUrl || tab.app.url;

          if (!isCurrentActive && !isDestination) {
            return null;
          }

          let layerStyle: React.CSSProperties = {};
          if (isCurrentActive) {
            layerStyle = {
              display: 'block',
              zIndex: 5,
              ...(isGestureActive && !isTargetHome
                ? {
                    transform: `scale(${1 - progress * 0.07}) translateX(${progress * 36 * translateXSign}px)`,
                    borderRadius: `${Math.round(progress * 24)}px`,
                    boxShadow: `0 16px 48px rgba(0, 0, 0, ${0.15 + progress * 0.35})`,
                    overflow: 'hidden',
                    transition: progress === 0 ? 'transform 0.25s cubic-bezier(0.2, 0, 0, 1), border-radius 0.25s ease' : 'none',
                    willChange: 'transform, border-radius',
                  }
                : {
                    transform: 'none',
                    borderRadius: '0px',
                    transition: 'transform 0.25s cubic-bezier(0.2, 0, 0, 1), border-radius 0.25s ease',
                  }),
            };
          } else if (isDestination) {
            // Preview destination tool underneath during predictive back gesture!
            layerStyle = {
              display: 'block',
              zIndex: 1,
              transform: `scale(${0.94 + progress * 0.06})`,
              opacity: 0.75 + progress * 0.25,
              transition: progress === 0 ? 'transform 0.25s ease, opacity 0.25s ease' : 'none',
              pointerEvents: 'none',
            };
          }

          return (
            <div
              key={tab.app.id}
              className="tool-frame-layer"
              data-app-id={tab.app.id}
              style={layerStyle}
            >
              <iframe
                key={tab.iframeKey}
                src={frameUrl}
                title={tab.app.title}
                className="tool-webview-iframe"
                style={{
                  pointerEvents: isGestureActive ? 'none' : 'auto',
                }}
                allow="camera; microphone; geolocation; clipboard-write; clipboard-read; vibrate; autoplay"
              />
            </div>
          );
        })}
      </main>
    </div>
  );
};
