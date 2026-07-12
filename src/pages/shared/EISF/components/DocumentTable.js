import { useCallback, useEffect, useRef, useState } from "react";
import "./DocumentTable.css";
import StatusBadge from "./StatusBadge";
import {
  FiDownload,
  FiEdit2,
  FiEye,
  FiList,
  FiMoreVertical,
  FiTrash2,
} from "react-icons/fi";

const REFERENCE_COLUMNS = [
  { key: "documentName", label: "Document Name" },
  { key: "documentType", label: "Document Type" },
  { key: "version", label: "Version" },
  { key: "status", label: "Status" },
  { key: "modifiedDate", label: "Last Modified" },
];

const ACTION_MENU_WIDTH = 210;
const ACTION_MENU_ESTIMATED_HEIGHT = 282;
const ACTION_MENU_GAP = 8;

export default function DocumentTable({
  documents = [],
  onView,
  onHistory,
  onAudit,
  onDownload,
  onEdit,
  onDelete,
  onSort,
  sortField = "documentName",
  sortDirection = "asc",
  variant = "default",
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuButtonRefs = useRef({});
  const isReferenceView = variant === "reference";

  const runAction = (callback, doc) => {
    setOpenMenuId(null);
    callback?.(doc);
  };

  const updateMenuPosition = useCallback((documentId) => {
    const button = menuButtonRefs.current[documentId];

    if (!button || typeof window === "undefined") return;

    const rect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const hasRoomBelow = viewportHeight - rect.bottom >= ACTION_MENU_ESTIMATED_HEIGHT + ACTION_MENU_GAP;
    const hasRoomAbove = rect.top >= ACTION_MENU_ESTIMATED_HEIGHT + ACTION_MENU_GAP;
    const top = hasRoomBelow || !hasRoomAbove
      ? Math.min(rect.bottom + ACTION_MENU_GAP, viewportHeight - ACTION_MENU_ESTIMATED_HEIGHT - ACTION_MENU_GAP)
      : rect.top - ACTION_MENU_ESTIMATED_HEIGHT - ACTION_MENU_GAP;
    const left = Math.min(
      Math.max(ACTION_MENU_GAP, rect.right - ACTION_MENU_WIDTH),
      viewportWidth - ACTION_MENU_WIDTH - ACTION_MENU_GAP
    );

    setMenuPosition({
      top: Math.max(ACTION_MENU_GAP, top),
      left: Math.max(ACTION_MENU_GAP, left),
    });
  }, []);

  const toggleActionMenu = (documentId) => {
    if (openMenuId === documentId) {
      setOpenMenuId(null);
      return;
    }

    updateMenuPosition(documentId);
    setOpenMenuId(documentId);
  };

  useEffect(() => {
    if (!openMenuId || typeof window === "undefined") return undefined;

    const reposition = () => updateMenuPosition(openMenuId);
    const closeOnOutsideClick = (event) => {
      if (event.target.closest(".document-action-menu, .icon-action-btn.menu")) return;
      setOpenMenuId(null);
    };

    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    window.document.addEventListener("mousedown", closeOnOutsideClick);

    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
      window.document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [openMenuId, updateMenuPosition]);

  const renderSortLabel = (column) => {
    if (!onSort) return column.label;

    const isActive = sortField === column.key;

    return (
      <button
        type="button"
        className={`table-sort-btn ${isActive ? "active" : ""}`}
        onClick={() => onSort(column.key)}
      >
        {column.label}
        <span>{isActive ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}</span>
      </button>
    );
  };

  return (
    <div className={`document-table-card ${isReferenceView ? "reference-table-card" : ""}`}>
      <table className="document-table">
        <thead>
          <tr>
            {isReferenceView && <th className="select-col"><input type="checkbox" aria-label="Select all documents" /></th>}
            {isReferenceView ? (
              REFERENCE_COLUMNS.map((column) => (
                <th key={column.key}>{renderSortLabel(column)}</th>
              ))
            ) : (
              <>
                <th>Document Name</th>
                <th>Category</th>
                <th>Version</th>
                <th>Status</th>
                <th>Last Modified</th>
                <th>Owner</th>
              </>
            )}
            <th width={isReferenceView ? "150" : "170"}>Actions</th>
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
                        onClick={() => runAction(onView, doc)}
                        aria-label={`View ${doc.documentName}`}
                        title="View"
                      >
                        <FiEye />
                      </button>

                      <button
                        type="button"
                        className="icon-action-btn"
                        onClick={() => runAction(onDownload, doc)}
                        aria-label={`Download ${doc.documentName}`}
                        title="Download"
                      >
                        <FiDownload />
                      </button>

                      <div className="document-row-menu">
                        <button
                          type="button"
                          className="icon-action-btn menu"
                          ref={(button) => {
                            menuButtonRefs.current[doc.id] = button;
                          }}
                          onClick={() => toggleActionMenu(doc.id)}
                          aria-label={`More actions for ${doc.documentName}`}
                          aria-expanded={openMenuId === doc.id}
                          title="More"
                        >
                          <FiMoreVertical />
                        </button>

                        {openMenuId === doc.id && (
                          <div
                            className="document-action-menu"
                            role="menu"
                            style={menuPosition}
                          >
                            <button type="button" role="menuitem" onClick={() => runAction(onView, doc)}>
                              <FiEye /> View
                            </button>
                            <button type="button" role="menuitem" onClick={() => runAction(onDownload, doc)}>
                              <FiDownload /> Download
                            </button>
                            <button type="button" role="menuitem" onClick={() => runAction(onHistory, doc)}>
                              <FiList /> Version History
                            </button>
                            <button type="button" role="menuitem" onClick={() => runAction(onAudit, doc)}>
                              <FiEye /> Audit Trail
                            </button>
                            <button type="button" role="menuitem" onClick={() => runAction(onEdit, doc)}>
                              <FiEdit2 /> Edit
                            </button>
                            <button type="button" role="menuitem" className="danger" onClick={() => runAction(onDelete, doc)}>
                              <FiTrash2 /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <button className="action-btn view-btn" onClick={() => onView(doc)}>View</button>
                      <button className="action-btn history-btn" onClick={() => onHistory(doc)}>History</button>
                      <button className="action-btn audit-btn" onClick={() => onAudit(doc)}>Audit</button>
                      <button className="action-btn download-btn" onClick={() => onDownload(doc)}>Download</button>
                      <button className="action-btn edit-btn" onClick={() => onEdit(doc)}>Edit</button>
                      <button className="action-btn delete-btn" onClick={() => onDelete(doc)}>Delete</button>
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
