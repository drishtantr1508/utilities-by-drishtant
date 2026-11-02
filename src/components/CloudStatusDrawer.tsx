import React from 'react';
import { X, Server, Cloud, Cpu, HardDrive, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CloudStatusDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudStatusDrawer: React.FC<CloudStatusDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-header-title">
            <Server size={18} />
            <h2>Cloud Infrastructure</h2>
          </div>
          <button onClick={onClose} className="drawer-close-btn" aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Status summary */}
          <div className="status-overview-card">
            <div className="status-indicator-badge">
              <span className="dot-pulse" />
              <span>All Systems Operational</span>
            </div>
            <p className="status-overview-text">
              Multi-cloud topology separating static edge delivery, stateful backends, and serverless Python runtimes.
            </p>
          </div>

          {/* Node 1: GCP Compute Engine */}
          <div className="infra-node-card">
            <div className="node-head">
              <div className="node-title-group">
                <Cpu size={16} />
                <h3>GCP Compute Engine</h3>
              </div>
              <span className="node-badge">e2-micro</span>
            </div>
            <div className="node-details">
              <div className="node-stat-item">
                <span className="stat-label">Host IP:</span>
                <span className="stat-val font-mono">35.184.166.81</span>
              </div>
              <div className="node-stat-item">
                <span className="stat-label">Location:</span>
                <span className="stat-val">us-central1-a (Iowa, US)</span>
              </div>
              <div className="node-stat-item">
                <span className="stat-label">RAM / Swap:</span>
                <span className="stat-val font-mono">1 GB RAM + 2 GB Swap</span>
              </div>
              <div className="node-stat-item">
                <span className="stat-label">Active Daemons:</span>
                <span className="stat-val">portfolio (:80), notion (:8000)</span>
              </div>
            </div>
          </div>

          {/* Node 2: Netlify Edge CDN */}
          <div className="infra-node-card">
            <div className="node-head">
              <div className="node-title-group">
                <Cloud size={16} />
                <h3>Netlify Edge CDN</h3>
              </div>
              <span className="node-badge">Global Edge</span>
            </div>
            <div className="node-details">
              <div className="node-stat-item">
                <span className="stat-label">Routing:</span>
                <span className="stat-val font-mono">Edge Functions & Proxy</span>
              </div>
              <div className="node-stat-item">
                <span className="stat-label">SSL:</span>
                <span className="stat-val">Automatic Let's Encrypt Wildcard</span>
              </div>
              <div className="node-stat-item">
                <span className="stat-label">Security:</span>
                <span className="stat-val font-mono">X-Netlify-Secret Proxy Guard</span>
              </div>
            </div>
          </div>

          {/* Node 3: Streamlit Community Cloud */}
          <div className="infra-node-card">
            <div className="node-head">
              <div className="node-title-group">
                <HardDrive size={16} />
                <h3>Streamlit Cloud (Dedicated)</h3>
              </div>
              <span className="node-badge">Free Tier</span>
            </div>
            <div className="node-details">
              <div className="node-stat-item">
                <span className="stat-label">Target App:</span>
                <span className="stat-val">Indian Salary & TDS Calculator</span>
              </div>
              <div className="node-stat-item">
                <span className="stat-label">Resource Isolation:</span>
                <span className="stat-val">1 GB Container (Zero GCP VM load)</span>
              </div>
              <div className="node-stat-item">
                <span className="stat-label">Git Sync:</span>
                <span className="stat-val">Auto-deploy on git push</span>
              </div>
            </div>
          </div>

          {/* Security Features */}
          <div className="infra-security-box">
            <div className="security-box-header">
              <ShieldCheck size={16} />
              <h4>Security Posture</h4>
            </div>
            <ul className="security-list">
              <li>
                <CheckCircle2 size={13} />
                <span>Port 80 backend strictly validates Netlify token header</span>
              </li>
              <li>
                <CheckCircle2 size={13} />
                <span>OWASP headers enforced (Frame denial, No-Sniff)</span>
              </li>
              <li>
                <CheckCircle2 size={13} />
                <span>SQLite with automatic point-in-time snapshot directory</span>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
};
