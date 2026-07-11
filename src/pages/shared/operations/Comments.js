import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../../Components/dashboard/DashboardLayout";
import {
  addCommentRecord,
  canResolveComments,
  canWriteComments,
  getVisibleComments,
  resolveCommentRecord,
} from "../../../services/commentService";
import { getCurrentUser } from "../../../services/roleService";

// This is the "Comments" tab rendered inside a study's detail page
// (StudyDetails.js → activeTab === "comments"), reached by opening a
// study and clicking Comments. It previously held its own hardcoded
// demo comments in local React state (never persisted, never scoped to
// a study, never shared with any other role), which is why a comment
// added here never survived a refresh and was never visible to any
// other role. It now reads/writes through the same shared commentService
// used everywhere else, scoped to the current study.
function loadStudyComments(studyCode, user) {
  return getVisibleComments({ studyCode: studyCode || undefined }, user);
}

export default function CommentsPage({ embedded = false }) {
  const { code } = useParams();
  const studyCode = code || "";
  const currentUser = getCurrentUser();

  const [filter, setFilter] = useState("unresolved");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(() =>
    loadStudyComments(studyCode, currentUser)
  );

  const refreshComments = useCallback(() => {
    setComments(loadStudyComments(studyCode, currentUser));
  }, [studyCode, currentUser]);

  useEffect(() => {
    refreshComments();

    window.addEventListener("comments-updated", refreshComments);
    window.addEventListener("sponsor-data-updated", refreshComments);

    return () => {
      window.removeEventListener("comments-updated", refreshComments);
      window.removeEventListener("sponsor-data-updated", refreshComments);
    };
  }, [refreshComments]);

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
      resolveCommentRecord(comment.id, currentUser);
    }
  };

  const handleAddComment = () => {
    const text = commentText.trim();

    if (!text || !studyCode) {
      return;
    }

    addCommentRecord(
      {
        study: studyCode,
        description: text,
      },
      currentUser
    );

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
              <td colSpan="6" style={{ textAlign: "center" }}>
                No Comments Found
              </td>
            </tr>
          ) : (
            filteredComments.map((comment) => (
              <tr key={comment.id}>
                <td>{comment.id}</td>
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