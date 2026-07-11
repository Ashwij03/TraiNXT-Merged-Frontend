import "./DashboardCards.css";
import {
  buildDashboardCards,
  getDashboardSummary,
} from "../utils/dashboardUtils";

export default function DashboardCards({
  documents = [],
  summary = null,
  cards = null,
}) {
  const dashboardSummary =
    summary || getDashboardSummary(documents);

  const dashboardCards =
    cards || buildDashboardCards(dashboardSummary);

  return (
    <div className="dashboard-cards">
      {dashboardCards.map((card) => (
        <div
          className="dashboard-card"
          key={card.key}
        >
          <div
            className="dashboard-card-strip"
            style={{
              background: card.color || "#2563eb",
            }}
          />

          <div className="dashboard-card-body">
            <div className="dashboard-card-title">
              {card.title}
            </div>

            <div
              className="dashboard-card-value"
              style={{
                color: card.color || "#2563eb",
              }}
            >
              {card.value}
              {card.suffix || ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}