import "./DashboardCards.css";
import {
  buildDashboardCards,
  getDashboardSummary,
} from "../utils/dashboardUtils";

export default function DashboardCards({
  documents = [],
  summary = null,
  cards = null,
  variant = "default",
}) {
  const dashboardSummary =
    summary || getDashboardSummary(documents);

  const dashboardCards =
    cards || buildDashboardCards(dashboardSummary);

  return (
    <div className={`dashboard-cards ${variant === "reference" ? "dashboard-cards-reference" : ""}`}>
      {dashboardCards.map((card) => (
        <div
          className="dashboard-card"
          key={card.key}
        >
          {variant !== "reference" && (
            <div
              className="dashboard-card-strip"
              style={{
                background: card.color || "#2563eb",
              }}
            />
          )}

          <div className="dashboard-card-body">
            {variant === "reference" && card.key !== "completion" && (
              <div className="dashboard-card-icon" style={{ "--card-color": card.color || "#2563eb" }}>
                {card.icon || "□"}
              </div>
            )}

            {variant === "reference" && card.key === "completion" ? (
              <>
                <div className="dashboard-completion-copy">
                  <div className="dashboard-card-title">{card.title}</div>
                  <div className="dashboard-completion-row">
                    <div
                      className="dashboard-completion-ring"
                      style={{
                        "--completion": `${card.value || 0}%`,
                        "--card-color": card.color || "#2563eb",
                      }}
                    >
                      <span>{card.value}{card.suffix || ""}</span>
                    </div>
                    <div>
                      <strong>{card.caption || "Overall Completion"}</strong>
                      <small>{card.detail}</small>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <div className="dashboard-card-title">
                  {card.title}
                </div>

                <div
                  className="dashboard-card-value"
                  style={{
                    color: variant === "reference" ? "#0f172a" : card.color || "#2563eb",
                  }}
                >
                  {card.value}
                  {card.suffix || ""}
                </div>

                {variant === "reference" && card.detail && (
                  <div className="dashboard-card-detail">{card.detail}</div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
