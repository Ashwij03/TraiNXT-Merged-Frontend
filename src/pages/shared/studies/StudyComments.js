import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import DataTable from "../../../Components/dashboard/DataTable";
import {
  addCommentRecord,
  canResolveComments,
  canWriteComments,
  getVisibleComments,
  resolveCommentRecord
} from "../../../services/commentService";
import { getCurrentUser } from "../../../services/roleService";
import { getStudyByCode } from "../../../services/studyService";

function StudyComments() {
  const { id } = useParams();
  const study = getStudyByCode(id);
  const studyCode = study?.code || id;
  const currentUser = getCurrentUser();
  const [refreshKey, setRefreshKey] = useState(0);
  const [commentText, setCommentText] = useState("");

  // Live-refresh whenever any comment changes anywhere in the app (Sponsor's
  // top-level comment, another tab, a resolve action elsewhere, etc). This
  // component previously only computed its comment list once on mount and
  // never listened for updates, so a comment added via the Sponsor/Admin
  // Comments tab (a different route, /study/:code) never appeared here
  // until this component fully remounted.
  useEffect(() => {
    function handleCommentsUpdated() {
      setRefreshKey((value) => value + 1);
    }

    window.addEventListener("comments-updated", handleCommentsUpdated);
    return () => {
      window.removeEventListener("comments-updated", handleCommentsUpdated);
    };
  }, []);

  const comments = useMemo(() => {
    void refreshKey;
    return getVisibleComments(
      { studyCode, studyStage: study?.status },
      undefined
    ).map((comment) => ({
      id: comment.id,
      subjectDocument: comment.documentDeleted
        ? `${comment.subjectId} / ${comment.document || "Deleted document"}`
        : comment.document
          ? `${comment.subjectId} / ${comment.document}`
          : comment.subjectId,
      comment: comment.description || "—",
      by: comment.createdBy || "—",
      date: comment.createdAt || "—",
      status: comment.status,
      action:
        comment.status === "Open" && canResolveComments() ? (
          <button
            type="button"
            onClick={() => {
              resolveCommentRecord(comment.id);
              setRefreshKey((value) => value + 1);
            }}
          >
            Resolve
          </button>
        ) : (
          "—"
        )
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studyCode, study?.status, refreshKey]);

  const handleAddComment = () => {
    const text = commentText.trim();

    if (!text || !studyCode) {
      return;
    }

    // addCommentRecord already enforces top-level-only for CRO/Sponsor
    // internally — this view is reached by Admin/Site Staff/PI/CRO, so no
    // additional gating is needed here beyond canWriteComments below.
    addCommentRecord(
      {
        study: studyCode,
        description: text
      },
      currentUser
    );

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

      <DataTable
        title={`Comments — ${study?.name || studyCode}`}
        columns={[
          { key: "id", label: "ID" },
          { key: "subjectDocument", label: "Subject/Document" },
          { key: "comment", label: "Comment" },
          { key: "by", label: "By" },
          { key: "date", label: "Date" },
          { key: "status", label: "Status" },
          ...(canResolveComments()
            ? [{ key: "action", label: "Action" }]
            : [])
        ]}
        data={comments}
        emptyMessage="No comments for this study"
      />
    </div>
  );
}

export default StudyComments;