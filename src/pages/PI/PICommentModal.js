import { useState } from "react";
import "./PICommentModal.css";

export default function PICommentModal({
  onClose,
  onSubmit,
}) {
  const [text, setText] = useState("");
  const [resolved, setResolved] = useState(false);

  const submit = () => {
    const newComment = {
      id: `COM-${Date.now()}`,
      subjectId: "SUB-1026",
      visit: "Visit 4",
      type: "General",
      comment: text,
      createdBy: "Dr. Nobithaa",
      date: new Date().toLocaleDateString(),
      status: resolved
        ? "resolved"
        : "unresolved",
    };

    onSubmit(newComment);

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <h2>Add Comment</h2>

        <label>
          <input
            type="checkbox"
            checked={resolved}
            onChange={(e) =>
              setResolved(e.target.checked)
            }
          />
          Mark Resolved
        </label>

        <div className="comment-user">
          <b>Dr. Nobithaa</b>
          <small>Just now</small>
        </div>

        <textarea
          placeholder="Write a comment..."
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
        />

        <div className="modal-actions">
          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="submit-btn"
            onClick={submit}
          >
            Submit
          </button>
        </div>

      </div>
    </div>
  );
}