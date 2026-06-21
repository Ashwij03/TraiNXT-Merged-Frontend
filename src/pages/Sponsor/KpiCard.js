import React from 'react';
import './KpiCard.css';

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  iconColor,
  onClick
}) {
  return (
    <div
      className="kpi-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="kpi-content">
        <div className="kpi-details">
          <h4 className="kpi-title">{title}</h4>
          <h2 className="kpi-value">{value}</h2>
          <p className="kpi-subtitle">{subtitle}</p>
        </div>
        <div className="kpi-icon" style={{ backgroundColor: iconBg, color: iconColor }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default KpiCard;
