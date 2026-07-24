import "./KPICard.css";

function KPICard({
  title,
  value,
  subtitle,
  icon,
  variant = "blue",
  trend,
  onClick
}) {
  const variantClass = variant ? ` enterprise-kpi--${variant}` : "";

  return (
    <div
      className={`enterprise-kpi${variantClass}`}
      onClick={onClick}
    >

      <div className="enterprise-kpi-icon">

        {icon}

      </div>

      <div className="enterprise-kpi-content">

        <div className="enterprise-kpi-title">

          {title}

        </div>

        <div className="enterprise-kpi-value">

          {value}

        </div>

        <div className="enterprise-kpi-sub">

          {subtitle}

        </div>

        {trend && (
          <div className="enterprise-kpi-trend">{trend}</div>
        )}

      </div>

    </div>

  );
}

export default KPICard;