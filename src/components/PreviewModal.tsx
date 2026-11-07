import React, { useState } from 'react';
import { AppItem, BackGestureState } from '../types';
import { X, ExternalLink, RotateCw, Monitor, Tablet, Smartphone } from 'lucide-react';

interface PreviewModalProps {
  app: AppItem | null;
  backGesture?: BackGestureState | null;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ app, backGesture, onClose }) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(0);

  if (!app) return null;

  const targetUrl = app.previewUrl || app.url;

  const isDismissing = Boolean(backGesture?.active && backGesture.destinationTabId === 'preview-modal');
  const progress = isDismissing ? backGesture?.progress ?? 0 : 0;

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return '390px';
      case 'tablet':
        return '768px';
      default:
        return '100%';
    }
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={onClose}
      style={{
        opacity: isDismissing ? 1 - progress * 0.5 : 1,
        transition: isDismissing ? 'none' : 'opacity 0.2s ease',
      }}
    >
      <div 
        className="preview-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: isDismissing 
            ? `scale(${1 - progress * 0.06}) translateY(${progress * 24}px)` 
            : 'none',
          opacity: isDismissing ? 1 - progress * 0.25 : 1,
          transition: isDismissing ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1), opacity 0.2s ease',
          pointerEvents: isDismissing ? 'none' : 'auto',
        }}
      >
        {/* Preview Topbar */}
        <div className="preview-topbar">
          <div className="preview-info">
            <h3 className="preview-title">{app.title}</h3>
            <span className="preview-url-badge">{targetUrl}</span>
          </div>

          {/* Viewport Switcher */}
          <div className="viewport-toggle-group">
            <button
              onClick={() => setViewport('desktop')}
              className={`vp-btn ${viewport === 'desktop' ? 'active' : ''}`}
              title="Desktop View"
            >
              <Monitor size={14} />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`vp-btn ${viewport === 'tablet' ? 'active' : ''}`}
              title="Tablet View (768px)"
            >
              <Tablet size={14} />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`vp-btn ${viewport === 'mobile' ? 'active' : ''}`}
              title="Mobile View (390px)"
            >
              <Smartphone size={14} />
            </button>
          </div>

          {/* Actions */}
          <div className="preview-controls">
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              className="preview-btn"
              title="Reload Frame"
            >
              <RotateCw size={14} />
            </button>
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="preview-btn"
              title="Open in New Tab"
            >
              <ExternalLink size={14} />
            </a>
            <button onClick={onClose} className="preview-btn close-btn" title="Close Preview (Esc)">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Frame Container */}
        <div className="preview-frame-wrapper">
          <div
            className="preview-viewport-container"
            style={{ width: getViewportWidth() }}
          >
            <iframe
              key={iframeKey}
              src={targetUrl}
              title={app.title}
              className="preview-iframe"
              allow="camera; microphone; geolocation"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

