import { FiActivity } from "react-icons/fi";

function StudyHealthSummary({ health }) {
  const score = health?.score ?? 0;
  const status = health?.status ?? "Unknown";
  const factors = Array.isArray(health?.factors) ? health.factors : [];

  return (
    <div className="study-widget-card study-health-card">
      <div className="study-widget-header">
        <FiActivity />
        <h3>Study Health Summary</h3>
      </div>
      <div className="study-health-score">
        <span className="study-health-value">{score}</span>
        <span className={`study-health-status status-${String(status).toLowerCase().replace(/\s+/g, "-")}`}>
          {status}
        </span>
      </div>
      {factors.length === 0 ? (
        <p className="study-widget-empty">No contributing factors — study looks healthy</p>
      ) : (
        <ul className="study-health-factors">
          {factors.map((factor) => (
            <li key={factor.label}>
              <span>{factor.label}</span>
              <span className="impact-tag">{factor.impact}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default StudyHealthSummary;
