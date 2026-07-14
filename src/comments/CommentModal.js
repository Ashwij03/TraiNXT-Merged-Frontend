import { useState } from "react";
import { useComments } from "./CommentsContext";
import "./CommentModal.css";

export default function CommentModal({
  onClose,
  visitId,
  onSubmit,
  subject = "SUB001",
  visit = "Screening",
}) {
  const commentsContext = useComments();
  const [text, setText] = useState("");
  const [resolved, setResolved] = useState(false);

  const submit = () => {
    const status = resolved ? "resolved" : "unresolved";

    if (onSubmit) {
      onSubmit({
        id: Date.now(),
        subject,
        visit,
        date: new Date().toLocaleDateString(),
        comment: text,
        status,
      });
    } else {
      commentsContext?.addComment?.(visitId, {
        text,
        status,
        visitNumber: 3,
        week: 24,
        visitName: "Full Physical Exam",
      });
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
            onChange={e => setResolved(e.target.checked)}
          />
          Mark Resolved
        </label>

        <div className="comment-user">
          <b>Alice TestOne</b>
          <small>5 months ago</small>
        </div>

        <textarea
          placeholder="Write a comment..."
          value={text}
          onChange={e => setText(e.target.value)}
        />

        <button onClick={submit}>Submit</button>
        <button onClick={onClose} style={{ marginLeft: "10px" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
