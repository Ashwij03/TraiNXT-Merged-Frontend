import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../../components/dashboard/shared/DashboardLayout";
import {
  canResolveComments,
  canViewComment,
  canWriteComments,
} from "../../../services/commentService";
import { getCurrentUser } from "../../../services/roleService";
import { useComments } from "../../../comments/CommentsContext";

// "Comments" tab rendered inside a study's detail page
// (StudyDetails.js → activeTab === "comments"). Phase 7: reads/writes go
// through the shared CommentsContext instead of an ad-hoc window listener
// + getVisibleComments() re-read on every event. Result: this table stays
// in lockstep with Study Comments, Subject Comments, Open Comments,
// Pending Comments, dashboard widgets, and counters — one source of
// truth, no per-view API/state churn. Search/filter/permission/routing
// behavior is preserved.
export default function CommentsPage({ embedded = false }) {
  const { code } = useParams();
  const studyCode = code || "";
  const currentUser = getCurrentUser();
  const {
    comments: liveComments,
    addComment,
    resolveComment,
  } = useComments();

  const [filter, setFilter] = useState("unresolved");
  const [commentText, setCommentText] = useState("");

  const comments = useMemo(() => {
    return liveComments
      .filter((comment) => canViewComment(comment, currentUser))
      .filter(
        (comment) => !studyCode || String(comment.study) === String(studyCode)
      );
  }, [liveComments, studyCode, currentUser]);

  const filteredComments =
    filter === "all"
      ? comments
      : comments.filter((comment) =>
          filter === "resolved"
            ? comment.status === "Resolved"
            : comment.status !== "Resolved"
        );

  const toggleStatus = (comment) => {
    if (comment.status !== "Resolved") {
      resolveComment(comment.id);
    }
  };

  const handleAddComment = () => {
    const text = commentText.trim();

    if (!text || !studyCode) {
      return;
    }

    addComment("", {
      text,
      study: studyCode,
    });

    setCommentText("");
  };

  const content = (
    <div style={{ padding: "20px" }}>
      <h2>Comments</h2>

      {canWriteComments(currentUser) && (
        <div style={{ marginBottom: "20px" }}>
          <textarea
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="Add a comment..."
            rows={3}
            style={{ width: "100%", maxWidth: "480px", display: "block" }}
            disabled={!studyCode}
          />
          <button
            type="button"
            onClick={handleAddComment}
            disabled={!studyCode || !commentText.trim()}
            style={{ marginTop: "8px" }}
          >
            Add Comment
          </button>
        </div>
      )}

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
            <th>Study ID</th>
            <th>Subject</th>
            <th>Author</th>
            <th>Date</th>
            <th>Comment</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredComments.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No Comments Found
              </td>
            </tr>
          ) : (
            filteredComments.map((comment) => (
              <tr key={comment.id}>
                <td>{comment.id}</td>
                <td>{comment.study || studyCode || "—"}</td>
                <td>{comment.subjectId || "—"}</td>
                <td>
                  {comment.createdBy || "—"}
                  {comment.createdRole ? ` (${comment.createdRole})` : ""}
                </td>
                <td>{comment.createdAt || "—"}</td>
                <td>{comment.description || "—"}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => toggleStatus(comment)}
                    disabled={
                      comment.status === "Resolved" ||
                      !canResolveComments(currentUser)
                    }
                    style={{
                      background:
                        comment.status === "Resolved" ? "#d4edda" : "#fff3cd",
                      border: "1px solid #ccc",
                      padding: "5px 10px",
                      borderRadius: "5px",
                    }}
                  >
                    {comment.status === "Resolved" ? "Resolved" : "Open"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  if (embedded) {
    return content;
  }

  return <DashboardLayout>{content}</DashboardLayout>;
}
