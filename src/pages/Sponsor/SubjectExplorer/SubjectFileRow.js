import React, { useCallback, useState } from "react";

import FileContextMenu from "./FileContextMenu";
import { getFileTypeMeta } from "./fileTypes";
import { formatFileSize, formatDate, formatDateTime } from "./fileService";

/**
 * Subject Explorer - one file row (Phase 4, requirement 3).
 *
 * Columns: icon + name · type · size · uploaded · last modified ·
 * uploaded by · status · actions.
 *
 * Presentational only - every action is reported upward through
 * `onAction`, and the parent performs it via FileService.
 *
 * Phase 7 (polish only - no behaviour change): memoised so re-sorting or
 * searching only re-renders rows whose data changed; `isActive` reflects the
 * file whose preview is open; the row exposes an accessible name and
 * aria-selected so screen readers announce it as a selectable row.
 *
 * Props
 *   file      file record
 *   isActive  this file's preview/dialog is currently open
 *   onAction  (actionKey, file) => void
 */

/** Mock status -> badge modifier. Statuses are display-only in this phase. */
const STATUS_CLASS = {
  Final: "sf-status--final",
  Approved: "sf-status--approved",
  "Pending Review": "sf-status--pending",
  Draft: "sf-status--draft",
  Superseded: "sf-status--superseded",
};

function SubjectFileRow({ file, isActive = false, onAction }) {
  // Keeps the row's action button visible while its menu is open.
  const [menuOpen, setMenuOpen] = useState(false);

  const { Icon, label, tone } = getFileTypeMeta(file.name);

  const openDetails = useCallback(() => {
    onAction?.("view", file);
  }, [onAction, file]);

  const handleKeyDown = useCallback(
    (event) => {
      // Ignore keys bubbling up from the row's action menu.
      if (event.target !== event.currentTarget) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDetails();
      }
    },
    [openDetails]
  );

  return (
    <tr
      className={[
        "sf-row",
        menuOpen ? "is-menu-open" : "",
        isActive ? "is-active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      tabIndex={0}
      aria-selected={isActive}
      aria-label={`${file.name}, ${label}, ${formatFileSize(file.size)}, ${
        file.status
      }. Press Enter to view details.`}
      onClick={openDetails}
      onKeyDown={handleKeyDown}
    >
      <td className="sf-cell-name">
        {/* The flex layout lives on this inner wrapper rather than the
            <td> itself. A table cell whose own `display` is overridden to
            `flex` stops taking part in the table's column-width algorithm,
            which is what let this column drift out of step with its header
            - wrapping keeps the <td> a normal table cell (so `colgroup`
            widths in `SubjectFiles.css` apply to it like every other
            column) while still laying the icon and name out side by
            side. */}
        <span className="sf-cell-name-inner">
          <span className={`sf-file-icon sf-file-icon--${tone}`} aria-hidden="true">
            <Icon size={17} />
          </span>
          <span className="sf-file-name" title={file.name}>
            {file.name}
          </span>
        </span>
      </td>

      <td>
        <span className={`sf-type-chip sf-type-chip--${tone}`} aria-hidden="true">
          {label}
        </span>
      </td>

      <td className="sf-cell-size">{formatFileSize(file.size)}</td>

      <td title={formatDateTime(file.uploadedAt)}>
        {formatDate(file.uploadedAt)}
      </td>

      <td title={formatDateTime(file.modifiedAt)}>
        {formatDate(file.modifiedAt)}
      </td>

      <td className="sf-cell-user">{file.uploadedBy}</td>

      <td className="sf-cell-status">
        <span
          className={`sf-status ${STATUS_CLASS[file.status] || "sf-status--draft"}`}
        >
          {file.status}
        </span>
      </td>

      <td className="sf-cell-actions">
        {/* Stops its own click events so the row never opens details when
            the menu is used. */}
        <FileContextMenu
          file={file}
          onAction={onAction}
          onOpenChange={setMenuOpen}
        />
      </td>
    </tr>
  );
}

/**
 * Memoised: sorting/searching rebuilds the row list, but each record object is
 * reused, so unchanged rows can skip rendering entirely.
 */
export default React.memo(SubjectFileRow);
