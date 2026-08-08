import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MdClose, MdEdit, MdErrorOutline } from "react-icons/md";

/**
 * Subject Explorer - Edit Subject modal (Update 6).
 *
 * Renames a top-level subject. Mirrors RenameFolderModal's structure and
 * behaviour exactly (pre-filled + pre-selected value, live validation,
 * "unchanged -> close quietly"); only the copy and target differ. Editing
 * updates the tree immediately, and - because the workspace resolves the
 * selected node from the live tree on every render - the open workspace
 * picks up the new name at the same time.
 *
 * Props
 *   subject      the subject node being edited ({ id, name, ... })
 *   validate     (name) => { valid, error }  (FolderTreeService)
 *   submitError  error returned by the service on submit
 *   onSubmit     (name) => void
 *   onClose      () => void
 */
function EditSubjectModal({
  subject,
  validate,
  submitError = "",
  onSubmit,
  onClose,
}) {
  const [name, setName] = useState(subject?.name || "");
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const validation = useMemo(() => {
    if (typeof validate !== "function") return { valid: true, error: "" };
    return validate(name);
  }, [validate, name]);

  const liveError = touched && !validation.valid ? validation.error : "";
  const error = liveError || submitError;

  const unchanged = name.trim() === (subject?.name || "").trim();

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched(true);

    if (!validation.valid) {
      inputRef.current?.focus();
      return;
    }
    // Nothing to persist - close quietly.
    if (unchanged) {
      onClose?.();
      return;
    }
    onSubmit?.(name.trim());
  };

  // Portalled to <body> so the sidebar's overflow cannot clip the modal.
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
        aria-label="Edit subject"
      >
        <div className="sxm-header">
          <div className="sxm-header-title">
            <span className="sxm-header-icon">
              <MdEdit size={17} />
            </span>
            <div>
              <h3>Edit Subject</h3>
              <p>Update the subject name shown in the explorer.</p>
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
            <span className="sxm-context-label">Current</span>
            <span className="sxm-context-value" title={subject?.name}>
              {subject?.name}
            </span>
          </div>

          <label className="sxm-field">
            <span>
              New Name <em>*</em>
            </span>
            <input
              ref={inputRef}
              type="text"
              className={error ? "has-error" : ""}
              placeholder="Enter a new subject name"
              value={name}
              maxLength={80}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "sxm-edit-subject-error" : undefined}
              onChange={(event) => {
                setName(event.target.value);
                setTouched(true);
              }}
            />
          </label>

          {error ? (
            <div className="sxm-error" id="sxm-edit-subject-error" role="alert">
              <MdErrorOutline size={15} aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : (
            <p className="sxm-hint">
              Folders and files inside this subject stay unchanged.
            </p>
          )}

          <div className="sxm-footer">
            <button type="button" className="sxm-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="sxm-btn sxm-btn--primary"
              disabled={!name.trim()}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default EditSubjectModal;
