import React, { useState } from 'react';
import { X, Check, Globe } from 'lucide-react';
import { AppItem } from '../types';

interface ConfigureUrlModalProps {
  app: AppItem | null;
  currentUrl: string;
  onSave: (url: string) => void;
  onClose: () => void;
}

export const ConfigureUrlModal: React.FC<ConfigureUrlModalProps> = ({
  app,
  currentUrl,
  onSave,
  onClose,
}) => {
  const [url, setUrl] = useState(currentUrl);

  if (!app) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSave(url.trim());
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="config-modal" onClick={(e) => e.stopPropagation()}>
        <div className="config-header">
          <div className="config-title-group">
            <Globe size={18} />
            <h3>Configure App URL</h3>
          </div>
          <button onClick={onClose} className="config-close-btn" aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="config-form">
          <p className="config-desc">
            Set the live deployment URL for <strong>{app.title}</strong> once deployed on Streamlit Cloud (or custom domain).
          </p>

          <div className="form-group">
            <label htmlFor="app-url-input">Production URL</label>
            <input
              id="app-url-input"
              type="url"
              placeholder="https://your-app-name.streamlit.app"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="text-input font-mono"
              required
              autoFocus
            />
          </div>

          <div className="config-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={14} />
              <span>Save URL</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

