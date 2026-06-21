import React, { useState } from "react";

function CommentModal({ onClose, onSubmit }) {
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    const newComment = {
      id: Date.now(),
      subject: "SUB001",
      visit: "Screening",
      date: new Date().toLocaleDateString(),
      comment,
      status: "unresolved"
    };

    onSubmit(newComment);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "20px",
          width: "400px",
          borderRadius: "10px"
        }}
      >
        <h3>Add Comment</h3>

        <textarea
          value={comment}
          onChange={(e) =>
            setComment(e.target.value)
          }
          rows="5"
          style={{
            width: "100%",
            marginBottom: "15px"
          }}
        />

        <button onClick={handleSubmit}>
          Save
        </button>

        <button
          onClick={onClose}
          style={{ marginLeft: "10px" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default CommentModal;