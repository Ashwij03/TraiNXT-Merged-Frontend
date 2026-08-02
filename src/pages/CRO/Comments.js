import React, { useMemo, useState } from "react";
import CROSidebar from "./CROSidebar";
import CRONavbar from "./CRONavbar";
import CommentModal from "../../comments/CommentModal";
import { getCurrentUser } from "../../services/roleService";
import { canViewComment } from "../../services/commentService";
import { useCROData } from "./CRODATAContext";
import { useComments } from "../../comments/CommentsContext";

// Phase 7: this page now reads from the shared CommentsContext (the app's
// single source of truth for comments) instead of the parallel
// CRODATAContext.comments cache. That cache stays in place for the rest
// of the CRO dashboard's cross-entity KPIs / global search, but the
// Comments *view* itself no longer risks drifting from Study Comments,
// Subject Comments, Open/Pending widgets, and comment counters.
// Writes continue to go through useCROData().addComment, which already
// funnels into commentService.addCommentRecord — no duplicate write path.
export default function CommentsPage() {
  const { addComment } = useCROData();
  const { comments: liveComments } = useComments();
  const currentUser = getCurrentUser();
  const [filter, setFilter] = useState("unresolved");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const normalizedComments = useMemo(
    () =>
      liveComments
        .filter((comment) => canViewComment(comment, currentUser))
        .map((comment) => ({
          id: comment.id,
          subject: comment.subjectId || comment.subject || "—",
          visit: comment.visit || comment.document || "—",
          date: comment.date || comment.createdAt || "—",
          comment:
            comment.comment || comment.message || comment.description || "—",
          status:
            comment.status === "Resolved" || comment.status === "resolved"
              ? "resolved"
              : "unresolved",
          createdBy: comment.createdBy || comment.createdRole || "—",
          isOwn:
            comment.createdBy === currentUser?.name ||
            comment.createdRole === currentUser?.role,
        })),
    [liveComments, currentUser],
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
    <div className="dashboard-layout tnxt-compact">
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

          <table className="ctms-standard-table" border="1" cellPadding="10" width="100%">
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
