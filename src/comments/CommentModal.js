import { useState } from "react";
import { useComments } from "./CommentsContext";
import { getCurrentUser } from "../services/roleService";
import "./CommentModal.css";

export default function CommentModal({
  onClose,
  visitId,
  onSubmit,
  subject = "SUB001",
  visit = "Screening",
  // Phase-7: edit-mode support. When initialText is supplied the modal
  // re-uses the existing Add Comment layout for editing so no separate
  // component is introduced.
  initialText = "",
  initialResolved = false,
  mode = "add",
  title,
  submitLabel,
}) {
  const commentsContext = useComments();
  const currentUser = getCurrentUser();
  const [text, setText] = useState(initialText);
  const [resolved, setResolved] = useState(initialResolved);
  const isEdit = mode === "edit";
  const headerTitle = title || (isEdit ? "Edit Comment" : "Add Comment");
  const submitText = submitLabel || (isEdit ? "Save" : "Submit");

  const submit = () => {
    if (onSubmit) {
      onSubmit({
        id: Date.now(),
        subject,
        visit,
        date: new Date().toLocaleDateString(),
        comment: text,
        status: resolved ? "resolved" : "open",
      });
    } else {
      const record = commentsContext?.addComment?.(visitId, {
        text,
        subjectId: subject,
        visitName: visit,
      });

      if (resolved && record?.id) {
        commentsContext?.resolveComment?.(record.id);
      }
    }

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>{headerTitle}</h3>

        <label>
          <input
            type="checkbox"
            checked={resolved}
            onChange={(e) => setResolved(e.target.checked)}
          />
          Mark Resolved
        </label>

        <div className="comment-user">
          <b>{currentUser?.name || "Current User"}</b>
          <small>{new Date().toLocaleDateString()}</small>
        </div>

        <textarea
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button onClick={submit}>{submitText}</button>
        <button onClick={onClose} style={{ marginLeft: "10px" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
