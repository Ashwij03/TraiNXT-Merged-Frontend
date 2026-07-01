import "./DashboardCards.css";

export default function DashboardCards({ documents = [] }) {

  const total = documents.length;

  const approved = documents.filter(
    (doc) => doc.status === "Approved"
  ).length;

  const pending = documents.filter(
    (doc) =>
      doc.status === "Pending" ||
      doc.status === "Pending Review"
  ).length;

  const draft = documents.filter(
    (doc) => doc.status === "Draft"
  ).length;

  const expired = documents.filter(
    (doc) => doc.status === "Expired"
  ).length;

  const cards = [
    {
      title: "Total Documents",
      value: total,
      color: "#2563eb"
    },
    {
      title: "Approved",
      value: approved,
      color: "#16a34a"
    },
    {
      title: "Pending",
      value: pending,
      color: "#d97706"
    },
    {
      title: "Draft",
      value: draft,
      color: "#64748b"
    },
    {
      title: "Expired",
      value: expired,
      color: "#dc2626"
    }
  ];

  return (
    <div className="dashboard-cards">

      {cards.map((card) => (
        <div
          className="dashboard-card"
          key={card.title}
        >

          <div
            className="dashboard-card-strip"
            style={{
              background: card.color
            }}
          />

          <div className="dashboard-card-body">

            <div className="dashboard-card-title">
              {card.title}
            </div>

            <div
              className="dashboard-card-value"
              style={{
                color: card.color
              }}
            >
              {card.value}
            </div>

          </div>

        </div>
      ))}

    </div>
  );
}