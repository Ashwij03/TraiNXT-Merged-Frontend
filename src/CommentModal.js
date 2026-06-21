import { useState } from "react";
import { useComments } from "./CommentsContext";
import "./CommentModal.css";

export default function CommentModal({ onClose, visitId }) {
  const { addComment } = useComments();
  const [text, setText] = useState("");
  const [resolved, setResolved] = useState(false);

  const submit = () => {
	addComment(visitId, {
	  text: text,
	  status: resolved ? "resolved" : "unresolved",

	  visitNumber: 3,
	  week: 24,
	  visitName: "Full Physical Exam",
	});
    onClose();
  };
  return (
    <div className="modal-overlay">
      <div className="modal-box">
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
      </div>
    </div>
  );
}
