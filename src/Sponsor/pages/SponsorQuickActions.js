import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {  MdWorkspaces,
  MdWarning,
  MdAssessment,
  MdGroups,
  MdBusiness,
} from 'react-icons/md';
import { syncQuickActionValues } from '../data/sponsorDataStore';
import '../styles/SponsorQuickActions.css';

const iconMap = {
  study: MdWorkspaces,
  risk: MdWarning,
  report: MdAssessment,
  recruitment: MdGroups,
  cro: MdBusiness,
};

const SponsorQuickActions = () => {
  const navigate = useNavigate();
  const [actions, setActions] = useState(syncQuickActionValues());

  useEffect(() => {
    const refresh = () => setActions(syncQuickActionValues());
    refresh();
    window.addEventListener('sponsor-data-updated', refresh);
    return () => window.removeEventListener('sponsor-data-updated', refresh);
  }, []);

  const handleCardClick = (action) => {
    if (action.route) {
      navigate(action.route);
    }
  };

  return (
    <div className="quick-actions-card tnxt-sponsor-quick-actions">
      <div className="quick-actions-header">
        <h3>Quick Actions</h3>
      </div>

      <div className="quick-actions-grid">
        {actions.map((action) => {
          const Icon = iconMap[action.icon] || MdWorkspaces;
          return (
            <div
              key={action.id}
              className="quick-action-kpi"
              onClick={() => handleCardClick(action)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleCardClick(action)}
            >
              <div className="qa-icon" style={{ backgroundColor: action.bg, color: action.color }}>
                <Icon size={24} />
              </div>
              <div className="qa-text">
                <span className="qa-value">{action.value}</span>
                <span className="qa-label">{action.label}</span>
                {action.subtitle && <span className="qa-subtitle">{action.subtitle}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SponsorQuickActions;