import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MdClose, MdPersonAdd, MdErrorOutline } from "react-icons/md";

/**
 * Subject Explorer - Create Subject modal (Update 6).
 *
 * Adds a new top-level subject (no folders yet - the same starting shape
 * as SUB-003). Mirrors CreateFolderModal's structure/behaviour exactly so
 * the two flows feel identical; only the copy and target differ.
 *
 * The input is pre-filled with a suggested id (e.g. "SUB-007") generated
 * from the live tree, but it is fully editable - the user's typed value is
 * what gets validated and saved as the subject's name/id.
 *
 * Props
 *   suggestedName  default value for the input ("" if none available)
 *   validate       (name) => { valid, error }  (FolderTreeService)
 *   submitError    error returned by the service on submit
 *   onSubmit       (name) => void
 *   onClose        () => void
 */
function CreateSubjectModal({
  suggestedName = "",
  validate,
  submitError = "",
  onSubmit,
  onClose,
}) {
  const [name, setName] = useState(suggestedName);
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

  /* Live validation: only surfaced once the user has typed or submitted. */
  const validation = useMemo(() => {
    if (typeof validate !== "function") return { valid: true, error: "" };
    return validate(name);
  }, [validate, name]);

  const liveError = touched && !validation.valid ? validation.error : "";
  const error = liveError || submitError;

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched(true);
    if (!validation.valid) {
      inputRef.current?.focus();
      return;
    }
    onSubmit?.(name.trim());
  };

  // Portalled to <body>: the sidebar clips its overflow, which would
  // otherwise cut the modal off inside the tree panel.
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
        aria-label="Create Subject"
      >
        <div className="sxm-header">
          <div className="sxm-header-title">
            <span className="sxm-header-icon">
              <MdPersonAdd size={17} />
            </span>
            <div>
              <h3>Create Subject</h3>
              <p>The new subject will be added to the explorer root.</p>
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
            <span className="sxm-context-label">Location</span>
            <span className="sxm-context-value">Explorer root</span>
          </div>

          <label className="sxm-field">
            <span>
              Subject ID / Name <em>*</em>
            </span>
            <input
              ref={inputRef}
              type="text"
              className={error ? "has-error" : ""}
              placeholder="e.g. SUB-007"
              value={name}
              maxLength={80}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "sxm-create-subject-error" : undefined}
              onChange={(event) => {
                setName(event.target.value);
                setTouched(true);
              }}
            />
          </label>

          {error ? (
            <div className="sxm-error" id="sxm-create-subject-error" role="alert">
              <MdErrorOutline size={15} aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : (
            <p className="sxm-hint">
              Subject names must be unique. You can change this suggested id
              before creating it.
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
              Create Subject
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default CreateSubjectModal;
