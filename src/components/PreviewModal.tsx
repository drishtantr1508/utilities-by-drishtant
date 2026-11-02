import React, { useState } from 'react';
import { AppItem } from '../types';
import { X, ExternalLink, RotateCw, Monitor, Tablet, Smartphone } from 'lucide-react';

interface PreviewModalProps {
  app: AppItem | null;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ app, onClose }) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(0);

  if (!app) return null;

  const targetUrl = app.previewUrl || app.url;

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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
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

