
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import DataTable from "../../../components/dashboard/shared/DataTable";
import {
  canResolveComments,
  canViewComment,
  canWriteComments,
} from "../../../services/commentService";
import { getCurrentUser } from "../../../services/roleService";
import { getStudyByCode } from "../../../services/studyService";
import { useComments } from "../../../comments/CommentsContext";

function StudyComments() {
  const { id } = useParams();
  const study = getStudyByCode(id);
  const studyCode = study?.code || id;
  const currentUser = getCurrentUser();

  const {
    comments: liveComments,
    addComment,
    resolveComment,
  } = useComments();

  const [commentText, setCommentText] = useState("");

  // ===== NEW: Search + Filter state =====
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // ===== Canonical pipeline =====
  // authorized → study filter → search/filter → table
  const comments = useMemo(() => {
    let result = liveComments
      .filter((comment) =>
        canViewComment(comment, currentUser, study?.status),
      )
      .filter(
        (comment) =>
          !studyCode || String(comment.study) === String(studyCode),
      );

    // Status filter
    if (statusFilter !== "All") {
      result = result.filter(
        (comment) => comment.status === statusFilter,
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
          comment.document,
          comment.description,
          comment.createdBy,
          comment.createdAt,
          comment.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });
    }

    return result.map((comment) => ({
  id: comment.id,
  studyId: comment.study || studyCode || "—",
  subjectDocument: comment.documentDeleted
    ? `${comment.subjectId} / ${comment.document || "Deleted document"}`
    : comment.document
      ? `${comment.subjectId} / ${comment.document}`
      : comment.subjectId || "—",
  comment: comment.description || "—",
  by: comment.createdBy || "—",
  date: comment.createdAt || "—",
  status: comment.status,
  action:
    comment.status === "Open" && canResolveComments() ? (
      <button
        type="button"
        className="btn btn-sm btn-success"
        onClick={() => resolveComment(comment.id)}
      >
        Resolve
      </button>
    ) : (
      "—"
    ),
}));
  }, [
    liveComments,
    studyCode,
    study?.status,
    currentUser,
    resolveComment,
    searchTerm,
    statusFilter,
  ]);

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

  return (
    <div className="module-card">
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

      {/* ===== NEW: Search + Filter controls ===== */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        <input
          type="text"
          placeholder="Search comments, subjects, documents, users..."
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
            minWidth: "160px",
            padding: "10px 12px",
          }}
        >
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      <div style={{ overflowX: "auto" }}>
        <DataTable
          title={`Comments — ${study?.name || studyCode}`}
          columns={[
            { key: "id", label: "ID", width: "90px" },
            { key: "studyId", label: "Study ID", width: "120px" },
            {
              key: "subjectDocument",
              label: "Subject / Document",
              width: "220px",
            },
            { key: "comment", label: "Comment", width: "320px" },
            { key: "by", label: "By", width: "170px" },
            { key: "date", label: "Date", width: "180px" },
            { key: "status", label: "Status", width: "120px" },
            ...(canResolveComments()
              ? [{ key: "action", label: "Action", width: "120px" }]
              : []),
          ]}
          data={comments}
          emptyMessage="No comments for this study"
          pagination
          searchable={false}
        />
      </div>
    </div>
  );
}

export default StudyComments;