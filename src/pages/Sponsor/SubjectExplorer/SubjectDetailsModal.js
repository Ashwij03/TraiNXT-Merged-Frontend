import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MdClose, MdBadge, MdErrorOutline } from "react-icons/md";

import { getSubjectStudyDefaults } from "../../../services/studyService";
import {
  SUBJECT_LIFECYCLE_STAGES,
  SUBJECT_TERMINAL_STATES,
} from "../../../utils/subjectLifecycle";
import "./FolderModals.css";
import "./SubjectDetailsModal.css";

const STATUS_OPTIONS = [...SUBJECT_LIFECYCLE_STAGES, ...SUBJECT_TERMINAL_STATES];

/**
 * Subject Explorer - Subject Details modal.
 *
 * Edits the CLINICAL metadata fields required by Task 1.5/1.6 (Initials,
 * Status, Screening Date, Enrollment Date - PI and Site are always
 * study-derived, shown read-only, exactly like the same fields in
 * `StudySubjects.js`'s own Add/Edit Subject form).
 *
 * This is deliberately separate from `EditSubjectModal` (which renames the
 * subject's id/name in the folder tree) - that flow is preserved unchanged.
 * This modal only ever edits the metadata record, writing through
 * `subjectRecordsService`, which targets the exact same `subjectsByStudy`
 * storage/service `StudySubjects.js` already uses - no second subject store.
 *
 * Props
 *   subject      { id, name } - the tree node being described
 *   studyId      current study code, used to resolve PI/Site defaults
 *   record       current metadata record (or null if none exists yet)
 *   submitError  error returned by the caller on submit
 *   onSubmit     (fields) => void
 *   onClose      () => void
 */
function SubjectDetailsModal({
  subject,
  studyId,
  record,
  submitError = "",
  onSubmit,
  onClose,
}) {
  const [initials, setInitials] = useState(record?.initials || "");
  const [status, setStatus] = useState(record?.status || "");
  const [screeningDate, setScreeningDate] = useState(record?.screeningDate || "");
  const [enrollmentDate, setEnrollmentDate] = useState(record?.enrollmentDate || "");
  const inputRef = useRef(null);

  const defaults = getSubjectStudyDefaults(studyId);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.({
      initials: initials.trim(),
      status,
      screeningDate,
      enrollmentDate,
    });
  };

  return createPortal(
    <div
      className="sxm-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        className="sxm-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Subject details"
      >
        <div className="sxm-header">
          <div className="sxm-header-title">
            <span className="sxm-header-icon">
              <MdBadge size={17} />
            </span>
            <div>
              <h3>Subject Details</h3>
              <p>Update the clinical details shown on {subject?.id}.</p>
            </div>
          </div>

          <button
            type="button"
            className="sxm-close"
            aria-label="Close"
            onClick={onClose}
          >
            <MdClose size={17} />
          </button>
        </div>

        <form className="sxm-body" onSubmit={handleSubmit} noValidate>
          <div className="sxm-context">
            <span className="sxm-context-label">Subject</span>
            <span className="sxm-context-value">{subject?.id}</span>
          </div>

          <label className="sxm-field">
            <span>Initials</span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Initials"
              value={initials}
              maxLength={10}
              onChange={(event) => setInitials(event.target.value)}
            />
          </label>

          <label className="sxm-field">
            <span>Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">Select status</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="sxm-field">
            <span>Principal Investigator</span>
            <input type="text" value={defaults.pi || "—"} readOnly aria-readonly="true" />
          </label>

          <label className="sxm-field">
            <span>Site</span>
            <input
              type="text"
              value={defaults.siteDisplay || defaults.site || "—"}
              readOnly
              aria-readonly="true"
            />
          </label>

          <div className="sxm-field-row">
            <label className="sxm-field">
              <span>Screening Date</span>
              <input
                type="date"
                value={screeningDate}
                onChange={(event) => setScreeningDate(event.target.value)}
              />
            </label>

            <label className="sxm-field">
              <span>Enrollment Date</span>
              <input
                type="date"
                value={enrollmentDate}
                onChange={(event) => setEnrollmentDate(event.target.value)}
              />
            </label>
          </div>

          {submitError && (
            <div className="sxm-error" role="alert">
              <MdErrorOutline size={15} aria-hidden="true" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="sxm-footer">
            <button type="button" className="sxm-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sxm-btn sxm-btn--primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default SubjectDetailsModal;
