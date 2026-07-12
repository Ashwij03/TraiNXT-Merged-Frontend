import "./DocumentViewer.css";

export default function DocumentViewer({
  open,
  document,
  onClose,
  onDownload
}) {

  if (!open || !document) return null;

  return (
    <div className="viewer-overlay">

      <div className="viewer-modal">

        <div className="viewer-header">

          <div>
            <h3>{document.documentName}</h3>
            <span>{document.fileName}</span>
          </div>

          <button
            type="button"
            className="viewer-close"
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        <div className="viewer-info">

          <div>
            <label>Category</label>
            <span>{document.category}</span>
          </div>

          <div>
            <label>Status</label>
            <span>{document.status}</span>
          </div>

          <div>
            <label>Version</label>
            <span>{document.version}</span>
          </div>

          <div>
            <label>Uploaded By</label>
            <span>{document.uploadedBy}</span>
          </div>

          <div>
            <label>Modified</label>
            <span>{document.modifiedDate}</span>
          </div>

          <div>
            <label>File Size</label>
            <span>{document.fileSize}</span>
          </div>

        </div>

        <div className="viewer-preview">

          <div className="pdf-placeholder">

              <span className="pdf-placeholder-icon">PDF</span>

              <h3>
                  PDF Preview
              </h3>

              <p>
                  Mock preview is shown because backend file storage is not connected.
              </p>

          </div>

        </div>

        <div className="viewer-footer">

          <button
            type="button"
            className="secondary-btn"
            onClick={() => onDownload?.(document)}
          >
            Download
          </button>

          <button
            type="button"
            className="primary-btn"
            onClick={onClose}
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}
