import "./DocumentTable.css";
import StatusBadge from "./StatusBadge";
import {
    FiDownload,
    FiEye,
    FiMoreVertical,
} from "react-icons/fi";

export default function DocumentTable({
    documents = [],
    onView,
    onHistory,
    onAudit,
    onDownload,
    onEdit,
    onDelete,
    variant = "default",
}) {
  const isReferenceView = variant === "reference";

  return (
    <div className={`document-table-card ${isReferenceView ? "reference-table-card" : ""}`}>

      <table className="document-table">

        <thead>
          <tr>
            {isReferenceView && <th className="select-col"><input type="checkbox" aria-label="Select all documents" /></th>}
            <th>Document Name</th>
            <th>{isReferenceView ? "Document Type" : "Category"}</th>
            <th>Version</th>
            <th>Status</th>
            <th>Last Modified</th>
            {!isReferenceView && <th>Owner</th>}
            <th width={isReferenceView ? "120" : "170"}>Actions</th>
          </tr>
        </thead>

        <tbody>

          {documents.length === 0 ? (
            <tr>
              <td colSpan={isReferenceView ? "7" : "7"} className="no-records">
                No Documents Found
              </td>
            </tr>
          ) : (
            documents.map((doc) => (
              <tr key={doc.id}>
                {isReferenceView && (
                  <td className="select-col">
                    <input type="checkbox" aria-label={`Select ${doc.documentName}`} />
                  </td>
                )}

                <td>
                  {isReferenceView ? (
                    <div className="document-name-cell">
                      <span className="pdf-file-icon">PDF</span>
                      <span>{doc.documentName}</span>
                    </div>
                  ) : (
                    doc.documentName
                  )}
                </td>

                <td>{doc.documentType || doc.category}</td>

                <td>{doc.version}</td>

                <td>
                  <StatusBadge status={doc.status} />
                </td>

                <td>
                  {isReferenceView ? (
                    <span className="modified-cell">
                      <span>{doc.modifiedDate}</span>
                      <small>by {doc.uploadedBy || doc.owner || "Study Staff"}</small>
                    </span>
                  ) : (
                    doc.modifiedDate
                  )}
                </td>

                {!isReferenceView && <td>{doc.uploadedBy}</td>}

                <td>

{isReferenceView ? (
  <div className="icon-actions">
    <button
      type="button"
      className="icon-action-btn"
      onClick={() => onView(doc)}
      aria-label={`View ${doc.documentName}`}
      title="View"
    >
      <FiEye />
    </button>

    <button
      type="button"
      className="icon-action-btn"
      onClick={() => onDownload(doc)}
      aria-label={`Download ${doc.documentName}`}
      title="Download"
    >
      <FiDownload />
    </button>

    <button
      type="button"
      className="icon-action-btn menu"
      onClick={() => onHistory(doc)}
      aria-label={`More actions for ${doc.documentName}`}
      title="More"
    >
      <FiMoreVertical />
    </button>
  </div>
) : (
  <>
    <button
        className="action-btn view-btn"
        onClick={() => onView(doc)}
    >
        View
    </button>

    <button
    className="action-btn history-btn"
    onClick={()=>onHistory(doc)}
>
    History
</button>

<button
    className="action-btn audit-btn"
    onClick={()=>onAudit(doc)}
>
    Audit
</button>

    <button
        className="action-btn download-btn"
        onClick={() => onDownload(doc)}
    >
        Download
    </button>

    <button
        className="action-btn edit-btn"
        onClick={() => onEdit(doc)}
    >
        Edit
    </button>

    <button
        className="action-btn delete-btn"
        onClick={() => onDelete(doc)}
    >
        Delete
    </button>

</>
)}
</td>

              </tr>
            ))
          )}

        </tbody>

      </table>

    </div>
  );
}
