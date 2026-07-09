import { FiBarChart2 } from "react-icons/fi";

function StudyProgressSummary({ progress }) {
  const items = [
    { label: "Sites", value: progress?.sites ?? 0 },
    { label: "Subjects", value: progress?.subjects ?? 0 },
    { label: "Visits", value: progress?.visits ?? 0 },
    { label: "Documents", value: progress?.documents ?? 0 },
  ];

  const allZero = items.every((item) => item.value === 0);

  return (
    <div className="study-widget-card">
      <div className="study-widget-header">
        <FiBarChart2 />
        <h3>Study Progress Summary</h3>
      </div>
      {allZero ? (
        <p className="study-widget-empty">No study activity recorded yet</p>
      ) : (
        <div className="study-progress-grid">
          {items.map((item) => (
            <div key={item.label} className="study-progress-item">
              <span className="study-progress-value">{item.value}</span>
              <span className="study-progress-label">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudyProgressSummary;
