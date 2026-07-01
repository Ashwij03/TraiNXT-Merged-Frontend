import "./DocumentTable.css";
import StatusBadge from "./StatusBadge";

export default function DocumentTable({
    documents = [],
    onView,
    onHistory,
    onAudit,
    onDownload,
    onEdit,
    onDelete
}) {
  return (
    <div className="document-table-card">

      <table className="document-table">

        <thead>
          <tr>
            <th>Document Name</th>
            <th>Category</th>
            <th>Version</th>
            <th>Status</th>
            <th>Last Modified</th>
            <th>Owner</th>
            <th width="170">Actions</th>
          </tr>
        </thead>

        <tbody>

          {documents.length === 0 ? (
            <tr>
              <td colSpan="7" className="no-records">
                No Documents Found
              </td>
            </tr>
          ) : (
            documents.map((doc) => (
              <tr key={doc.id}>

                <td>{doc.documentName}</td>

                <td>{doc.category}</td>

                <td>{doc.version}</td>

                <td>
                  <StatusBadge status={doc.status} />
                </td>

                <td>{doc.modifiedDate}</td>

                <td>{doc.uploadedBy}</td>

                <td>

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

</td>

              </tr>
            ))
          )}

        </tbody>

      </table>

    </div>
  );
}