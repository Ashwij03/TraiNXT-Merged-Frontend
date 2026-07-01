import "./AuditTrailModal.css";

export default function AuditTrailModal({
  open,
  document,
  onClose
}) {
  if (!open || !document) return null;

  const auditTrail = document.auditTrail || [
    {
      date: "10-Jun-2026",
      user: "Ramya",
      action: "Uploaded",
      remarks: "Initial document upload"
    },
    {
      date: "12-Jun-2026",
      user: "Dr. Smith",
      action: "Reviewed",
      remarks: "Verified successfully"
    },
    {
      date: document.modifiedDate,
      user: document.uploadedBy,
      action: "Updated",
      remarks: "Latest Version"
    }
  ];

  return (
    <div className="audit-overlay">

      <div className="audit-modal">

        <div className="audit-header">

          <h3>Audit Trail</h3>

          <button onClick={onClose}>✕</button>

        </div>

        <table className="audit-table">

          <thead>

            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Action</th>
              <th>Remarks</th>
            </tr>

          </thead>

          <tbody>

            {auditTrail.map((item, index) => (

              <tr key={index}>

                <td>{item.date}</td>

                <td>{item.user}</td>

                <td>{item.action}</td>

                <td>{item.remarks}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}