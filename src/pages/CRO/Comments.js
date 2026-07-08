import React, { useEffect, useMemo, useState } from "react";
import CROSidebar from "./Components/CROSidebar";
import CRONavbar from "./Components/CRONavbar";
import CommentModal from "./CommentModal";
import { getCurrentUser } from "../../services/roleService";
import { useCROData } from "./CRODATAContext";

export default function CommentsPage() {
  const { comments, addComment } = useCROData();
  const currentUser = getCurrentUser();
  const [filter, setFilter] = useState("unresolved");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const refresh = () => setRefreshKey((value) => value + 1);
    window.addEventListener("comments-updated", refresh);
    return () => window.removeEventListener("comments-updated", refresh);
  }, []);

  void refreshKey;

  const normalizedComments = useMemo(
    () =>
      comments.map((comment) => ({
        id: comment.id,
        subject: comment.subjectId || comment.subject || "—",
        visit: comment.visit || comment.document || "—",
        date: comment.date || comment.createdAt || "—",
        comment: comment.comment || comment.message || comment.description || "—",
        status:
          comment.status === "Resolved" || comment.status === "resolved"
            ? "resolved"
            : "unresolved",
        createdBy: comment.createdBy || comment.createdRole || "—",
        isOwn:
          comment.createdBy === currentUser?.name ||
          comment.createdRole === currentUser?.role,
      })),
    [comments, currentUser],
  );

  const filteredComments = normalizedComments.filter(
    (comment) =>
      (filter === "all" ? true : comment.status === filter) &&
      (comment.subject.toLowerCase().includes(search.toLowerCase()) ||
        comment.comment.toLowerCase().includes(search.toLowerCase())),
  );

  const addNewComment = (newComment) => {
    addComment({
      subjectId: newComment.subject || "",
      visit: newComment.visit || "",
      comment: newComment.comment || newComment.description || "",
      createdBy: currentUser?.name || "CRO User",
      createdRole: currentUser?.role || "CRO",
    });
    setShowModal(false);
  };

  return (
    <div className="dashboard-layout">
      <CROSidebar />
      <div className="main-content">
        <CRONavbar />
        <div style={{ padding: "20px" }}>
          <h2>Comments</h2>

          <button type="button" onClick={() => setShowModal(true)}>
            ➕ Add Comment
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

          <input
            type="text"
            placeholder="Search comments..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ marginBottom: "16px", padding: "8px", width: "100%" }}
          />

          <table border="1" cellPadding="10" width="100%">
            <thead>
              <tr>
                <th>ID</th>
                <th>Subject</th>
                <th>Visit / Procedure</th>
                <th>Date</th>
                <th>Comment</th>
                <th>Created By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredComments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No data available yet
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
                    <td>{comment.createdBy}</td>
                    <td>
                      {comment.status === "resolved" ? "✅ Resolved" : "❗ Unresolved"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {showModal && (
            <CommentModal
              onClose={() => setShowModal(false)}
              onSubmit={addNewComment}
            />
          )}
        </div>
      </div>
    </div>
  );
}
