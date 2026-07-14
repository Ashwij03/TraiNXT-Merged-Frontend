
import "./dashboard.css";

function UpcomingVisitsWidget({
  visits = [],
  emptyMessage = "No upcoming visits scheduled"
}) {
  if (!visits.length) {
    return (
      <div className="dashboard-widget">
        <h3>Upcoming Visits</h3>
        <p className="visit-item-empty">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-widget">
      <h3>Upcoming Visits</h3>

      {visits.map((visit, index) => (
        <div key={`${visit.subject || visit.subjectId}-${index}`} className="visit-item">
          <strong>{visit.subject || visit.subjectId || "—"}</strong>
          <div>{visit.visit || "—"}</div>
          <small>{visit.date || "—"}</small>
        </div>
      ))}
    </div>
  );
}

export default UpcomingVisitsWidget;
