import React from 'react';
import { AppItem } from '../types';
import {
  ExternalLink,
  Eye,
  Camera,
  Calculator,
  FileText,
  MapPin,
  Layers,
  Settings,
  Sparkles,
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
      case 'map-pin':
        return <MapPin size={22} />;
      default:
        return <Layers size={22} />;
    }
  };

  const getStatusBadge = () => {
    switch (app.status) {
      case 'Live':
        return <span className="status-badge status-live">● Live</span>;
      case 'Cloud Ready':
        return <span className="status-badge status-ready">⚡ Ready</span>;
      case 'In Development':
        return <span className="status-badge status-dev">◌ Dev</span>;
      default:
        return <span className="status-badge status-internal">◈ Internal</span>;
    }
  };

  const isConfigurable = app.id === 'salary-calculator';

  return (
    <div className={`app-card ${app.featured ? 'is-featured' : ''}`}>
      <div className="card-top">
        <div className="card-header-left">
          <div className="card-icon-frame">{renderIcon()}</div>
          <div>
            <div className="card-title-row">
              <h3 className="card-title">{app.title}</h3>
              {app.featured && (
                <span className="featured-tag">
                  <Sparkles size={11} />
                  Featured
                </span>
              )}
            </div>
            <p className="card-tagline">{app.tagline}</p>
          </div>
        </div>

        <div className="card-header-right">{getStatusBadge()}</div>
      </div>

      <p className="card-description">{app.description}</p>

      {/* Highlight stat / host */}
      <div className="card-meta-row">
        <div className="meta-capsule">
          <span className="meta-label">Host:</span>
          <span className="meta-value">{app.hostPlatform}</span>
        </div>
        {app.highlightStat && (
          <div className="meta-capsule">
            <span className="meta-label">{app.highlightStat.label}:</span>
            <span className="meta-value font-mono">{app.highlightStat.value}</span>
          </div>
        )}
      </div>

      {/* Tech Stack Pills */}
      <div className="tech-stack-row">
        {app.techStack.map((tech) => (
          <span key={tech} className="tech-pill">
            {tech}
          </span>
        ))}
      </div>

      {/* Actions Footer */}
      <div className="card-actions">
        {app.previewSupported && (
          <button
            onClick={() => onPreview(app)}
            className="btn btn-secondary"
            title="Inspect application inside preview window"
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
            title="Configure Cloud URL"
          >
            <Settings size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
