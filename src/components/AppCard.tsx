import React from 'react';
import { AppItem } from '../types';
import {
  ExternalLink,
  Eye,
  Camera,
  Calculator,
  FileText,
  ArrowRight,
} from 'lucide-react';

interface AppCardProps {
  app: AppItem;
  isOpen: boolean;
  onLaunch: (app: AppItem) => void;
  onPreview: (app: AppItem) => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  isOpen,
  onLaunch,
  onPreview,
}) => {
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
    if (isOpen) {
      return <span className="status-badge status-live">● Running</span>;
    }
    switch (app.status) {
      case 'Live':
        return <span className="status-badge status-live">● Live</span>;
      case 'Ready':
        return <span className="status-badge status-ready">● Ready</span>;
      default:
        return <span className="status-badge status-dev">● Dev</span>;
    }
  };

  return (
    <div className={`app-card ${isOpen ? 'app-card-active' : ''}`}>
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

        <button
          onClick={() => onLaunch(app)}
          className={`btn ${isOpen ? 'btn-resume' : 'btn-primary'}`}
          title={isOpen ? 'Switch to running tool' : 'Launch tool inside app'}
        >
          {isOpen ? (
            <>
              <span className="live-dot">●</span>
              <span>Resume Tool</span>
            </>
          ) : (
            <>
              <span>Launch</span>
              <ArrowRight size={13} />
            </>
          )}
        </button>

        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-icon"
          title="Open in external browser"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};
