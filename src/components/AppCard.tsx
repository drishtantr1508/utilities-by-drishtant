import React from 'react';
import { AppItem } from '../types';
import {
  ExternalLink,
  Eye,
  Camera,
  Calculator,
  FileText,
  Settings,
} from 'lucide-react';

interface AppCardProps {
  app: AppItem;
  customUrl?: string;
  onPreview: (app: AppItem) => void;
  onConfigureUrl: (app: AppItem) => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  customUrl,
  onPreview,
  onConfigureUrl,
}) => {
  const activeUrl = customUrl || app.url;

  const renderIcon = () => {
    switch (app.iconName) {
      case 'camera':
        return <Camera size={22} />;
      case 'calculator':
        return <Calculator size={22} />;
      case 'file-text':
        return <FileText size={22} />;
      default:
        return <Camera size={22} />;
    }
  };

  const getStatusBadge = () => {
    switch (app.status) {
      case 'Live':
        return <span className="status-badge status-live">● Live</span>;
      case 'Ready':
        return <span className="status-badge status-ready">● Ready</span>;
      default:
        return <span className="status-badge status-dev">● Dev</span>;
    }
  };

  const isConfigurable = app.id === 'salary-calculator';

  return (
    <div className="app-card">
      <div className="card-top">
        <div className="card-header-left">
          <div className="card-icon-frame">{renderIcon()}</div>
          <div>
            <h3 className="card-title">{app.title}</h3>
            <p className="card-tagline">{app.tagline}</p>
          </div>
        </div>

        <div className="card-header-right">{getStatusBadge()}</div>
      </div>

      <p className="card-description">{app.description}</p>

      {/* Actions Footer */}
      <div className="card-actions">
        {app.previewSupported && (
          <button
            onClick={() => onPreview(app)}
            className="btn btn-secondary"
            title="Preview inside window"
          >
            <Eye size={14} />
            <span>Preview</span>
          </button>
        )}

        <a
          href={activeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          <span>Launch</span>
          <ExternalLink size={13} />
        </a>

        {isConfigurable && (
          <button
            onClick={() => onConfigureUrl(app)}
            className="btn-icon"
            title="Set Live Streamlit URL"
          >
            <Settings size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
