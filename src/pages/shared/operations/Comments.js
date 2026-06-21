import React, { useState } from "react";
import CommentModal from "../../../CommentModal";
import DashboardLayout from "../../../Components/dashboard/DashboardLayout";

const initialComments = [
  {
    id: "E1",
    subject: "J-D 77777",
    visit: "Visit 1 - Screening",
    date: "11/12/2019",
    comment: "Kristen Bosse please review...",
    status: "resolved"
  },
  {
    id: "E2",
    subject: "",
    visit: "",
    date: "27/03/2026",
    comment: "Alice TestOne please review...",
    status: "unresolved"
  }
];

export default function CommentsPage() {
  const [comments, setComments] = useState(initialComments);
  const [filter, setFilter] = useState("unresolved");
  const [showModal, setShowModal] = useState(false);

  const filteredComments =
    filter === "all"
      ? comments
      : comments.filter((comment) => comment.status === filter);

  const toggleStatus = (id) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === id
          ? {
              ...comment,
              status:
                comment.status === "resolved" ? "unresolved" : "resolved"
            }
          : comment
      )
    );
  };

  const addComment = (newComment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  return (
    <DashboardLayout>
      <div style={{ padding: "20px" }}>
        <h2>Comments</h2>

        <button type="button" onClick={() => setShowModal(true)}>
          Add Comment
        </button>

        <div style={{ marginBottom: "20px", marginTop: "10px" }}>
          <button type="button" onClick={() => setFilter("unresolved")}>
            Unresolved Comments
          </button>
          <button type="button" onClick={() => setFilter("resolved")}>
            Resolved Comments
          </button>
          <button type="button" onClick={() => setFilter("all")}>
            All
          </button>
        </div>

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
              filteredComments.map((comment) => (
                <tr key={comment.id}>
                  <td>{comment.id}</td>
                  <td>{comment.subject}</td>
                  <td>{comment.visit}</td>
                  <td>{comment.date}</td>
                  <td>{comment.comment}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleStatus(comment.id)}
                      style={{
                        background:
                          comment.status === "resolved" ? "#d4edda" : "#fff3cd",
                        border: "1px solid #ccc",
                        padding: "5px 10px",
                        borderRadius: "5px"
                      }}
                    >
                      {comment.status === "resolved"
                        ? "Resolved"
                        : "Unresolved"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {showModal && (
          <CommentModal
            onClose={() => setShowModal(false)}
            onSubmit={addComment}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
