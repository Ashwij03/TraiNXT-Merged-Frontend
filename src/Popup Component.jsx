import React, { useState } from "react";

export default function CommentModal({ onClose, onSubmit }) {
  const [text, setText] = useState("");
  const [isResolved, setIsResolved] = useState(false);

  const handleSubmit = () => {
    if (!text.trim()) return;

    onSubmit({
      id: "E" + Math.floor(Math.random() * 1000),
      comment: text,
      date: new Date().toLocaleDateString(),
      status: isResolved ? "resolved" : "unresolved",
    });

    onClose();
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.3)"
    }}>
      <div style={{
        background: "#fff",
        padding: "20px",
        width: "300px",
        margin: "100px auto",
        borderRadius: "8px"
      }}>
        <h4>Write a Comment</h4>

        <label>
          <input
            type="checkbox"
            checked={isResolved}
            onChange={(e) => setIsResolved(e.target.checked)}
          />
          Mark Resolved
        </label>

        <textarea
          placeholder="Enter comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: "100%", marginTop: "10px" }}
        />

        <button onClick={handleSubmit} style={{ marginTop: "10px" }}>
          Submit
        </button>

        <button onClick={onClose} style={{ marginLeft: "10px" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}