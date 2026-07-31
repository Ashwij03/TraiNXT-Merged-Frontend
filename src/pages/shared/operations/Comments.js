import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../../components/dashboard/shared/DashboardLayout";
import {
  canResolveComments,
  canViewComment,
  canWriteComments,
} from "../../../services/commentService";
import { getCurrentUser, getAssignedSite } from "../../../services/roleService";
import { useComments } from "../../../comments/CommentsContext";

export default function CommentsPage({ embedded = false }) {
  const { code } = useParams();
  const studyCode = code || "";
  const currentUser = getCurrentUser();
  const assignedSite = getAssignedSite() || "";
  const {
    comments: liveComments,
    addComment,
    resolveComment,
  } = useComments();

  // UI state
  const [filter, setFilter] = useState("unresolved");
  const [commentText, setCommentText] = useState("");

  // Compute study-scoped, visible comments from canonical source
  const comments = useMemo(() => {
    return liveComments
      .filter((comment) => canViewComment(comment, currentUser))
      .filter(
        (comment) => !studyCode || String(comment.study) === String(studyCode)
      );
  }, [liveComments, studyCode, currentUser]);

  // ===== FILTER PIPELINE =====
  const filteredComments = useMemo(() => {
    let result = [...comments];

    // Status filter
    if (statusFilter === "resolved") {
      result = result.filter(
        (comment) => comment.status === "Resolved",
      );
    } else if (statusFilter === "unresolved") {
      result = result.filter(
        (comment) => comment.status !== "Resolved",
      );
    }

    // Search filter
    const query = searchTerm.trim().toLowerCase();

    if (query) {
      result = result.filter((comment) => {
        const searchableText = [
          comment.id,
          comment.study,
          comment.subjectId,
          comment.createdBy,
          comment.description,
          comment.status,
          comment.createdAt,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });
    }

    return result;
  }, [comments, searchTerm, statusFilter]);

  // ===== RESET PAGE WHEN FILTERING =====
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // ===== PAGINATION CALCULATION =====
  const totalRows = filteredComments.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalRows / rowsPerPage),
  );

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const paginatedComments = filteredComments.slice(
    startIndex,
    endIndex,
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
      site: assignedSite,
      module: "OperationsComments",
      sourceView: "operations",
      activity: "General",
    });

    setCommentText("");
  };

  const content = (
    <div className="module-card" style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>
        Comments — {studyCode || "Study"}
      </h2>

      {/* ===== ADD COMMENT ===== */}
      {canWriteComments(currentUser) && (
        <div style={{ marginBottom: "20px" }}>
          <textarea
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="Add a comment..."
            rows={3}
            style={{
              width: "100%",
              maxWidth: "560px",
              display: "block",
            }}
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

      {/* ===== SEARCH + FILTER ===== */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Search comments, subjects, users..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          style={{
            flex: "1 1 320px",
            minWidth: "260px",
            padding: "10px 12px",
          }}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          style={{
            minWidth: "180px",
            padding: "10px 12px",
          }}
        >
          <option value="all">All Comments</option>
          <option value="unresolved">Open / Unresolved</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* ===== TABLE ===== */}
      <div style={{ overflowX: "auto" }}>
        <table
          border="1"
          cellPadding="10"
          width="100%"
          style={{ borderCollapse: "collapse" }}
        >
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
            {paginatedComments.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No Comments Found
                </td>
              </tr>
            ) : (
              paginatedComments.map((comment) => (
                <tr key={comment.id}>
                  <td>{comment.id}</td>
                  <td>{comment.study || studyCode || "—"}</td>
                  <td>{comment.subjectId || "—"}</td>
                  <td>
                    {comment.createdBy || "—"}
                    {comment.createdRole
                      ? ` (${comment.createdRole})`
                      : ""}
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
                          comment.status === "Resolved"
                            ? "#d4edda"
                            : "#fff3cd",
                        border: "1px solid #ccc",
                        padding: "5px 10px",
                        borderRadius: "5px",
                      }}
                    >
                      {comment.status === "Resolved"
                        ? "Resolved"
                        : "Open"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== PAGINATION ===== */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "16px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          Showing {totalRows === 0 ? 0 : startIndex + 1}–
          {Math.min(endIndex, totalRows)} of {totalRows}
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <select
            value={rowsPerPage}
            onChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5 rows</option>
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
          </select>

          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) => Math.max(1, page - 1))
            }
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) =>
                Math.min(totalPages, page + 1),
              )
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return <DashboardLayout>{content}</DashboardLayout>;
}
