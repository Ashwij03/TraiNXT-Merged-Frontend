import "./VersionHistoryModal.css";

function getHistory(document) {
  const history = document.history || document.versions || [];

  if (history.length) {
    return history;
  }

  return [
    {
      version: document.version || "1.0",
      date: document.modifiedDate || "-",
      user: document.uploadedBy || "Study Staff",
      status: document.status || "-",
    },
  ];
}

export default function VersionHistoryModal({
  open,
  document,
  onClose
}) {
  if (!open || !document) return null;

  const history = getHistory(document);

  return (
    <div className="history-overlay">
      <div className="history-modal">
        <div className="history-header">
          <h3>Version History</h3>
          <button type="button" onClick={onClose}>✕</button>
        </div>

        <table className="history-table">
          <thead>
            <tr>
              <th>Version</th>
              <th>Date</th>
              <th>User</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={`${item.version}-${index}`}>
                <td>{item.version}</td>
                <td>{item.date || item.createdAt || "-"}</td>
                <td>{item.user || item.createdBy || "Study Staff"}</td>
                <td>{item.status || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
