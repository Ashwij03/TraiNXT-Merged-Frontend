import React, { useState } from "react";
import CommentModal from "../../CommentModal";

const initialComments = [
  {
    id: "E1",
    subject: "J-D 77777",
    visit: "Visit 1 - Screening",
    date: "11/12/2019",
    comment: "Kristen Bosse please review...",
    status: "resolved",
  },
  {
    id: "E2",
    subject: "",
    visit: "",
    date: "27/03/2026",
    comment: "Alice TestOne please review...",
    status: "unresolved",
  },
];

export default function CommentsPage() {
  const [comments, setComments] = useState(initialComments);
  const [filter, setFilter] = useState("unresolved");
  const [showModal, setShowModal] = useState(false); // ⭐ NEW

  // 🔥 Filtering logic
  const filteredComments =
    filter === "all"
      ? comments
      : comments.filter((c) => c.status === filter);

  // 🔁 Toggle resolve/unresolve
  const toggleStatus = (id) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: c.status === "resolved" ? "unresolved" : "resolved",
            }
          : c
      )
    );
  };
  // ⭐ ADD NEW COMMENT
  const addComment = (newComment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Comments</h2>

      {/* ⭐ ADD BUTTON */}
      <button onClick={() => setShowModal(true)}>
        ➕ Add Comment
      </button>

      {/* 🔥 Tabs */}
      <div style={{ marginBottom: "20px", marginTop: "10px" }}>
        <button onClick={() => setFilter("unresolved")}>
          Unresolved Comments
        </button>
        <button onClick={() => setFilter("resolved")}>
          Resolved Comments
        </button>
        <button onClick={() => setFilter("all")}>All</button>
      </div>

      {/* 🔥 Table */}
      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Subject</th>
            <th>Visit / Procedure</th>
            <th>Date</th>
            <th>Comment</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredComments.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No Comments Found
              </td>
            </tr>
          ) : (
            filteredComments.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.subject}</td>
				<td>
				  Visit {c.visitNumber} - Week {c.week}
				  <br />
				  <small>{c.visitName}</small>
				</td>
                <td>{c.date}</td>
                <td>{c.comment}</td>

                {/* ✅ Status Toggle */}
				<td>
				  <button
				    onClick={() => toggleStatus(c.id)}
				    style={{
				      background: c.status === "resolved" ? "#d4edda" : "#fff3cd",
				      border: "1px solid #ccc",
				      padding: "5px 10px",
				      borderRadius: "5px",
				    }}
				  >
				    {c.status === "resolved" ? "✅ Resolved" : "❗ Unresolved"}
				  </button>
				</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ⭐ POPUP MODAL */}
      {showModal && (
        <CommentModal
          onClose={() => setShowModal(false)}
          onSubmit={addComment}
        />
      )}
    </div>
  );
}