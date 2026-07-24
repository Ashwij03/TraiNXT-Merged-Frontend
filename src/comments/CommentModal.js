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
}) {
  const commentsContext = useComments();
  const currentUser = getCurrentUser();
  const [text, setText] = useState("");
  const [resolved, setResolved] = useState(false);

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
        <h3>Add Comment</h3>

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

        <button onClick={submit}>Submit</button>
        <button onClick={onClose} style={{ marginLeft: "10px" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
