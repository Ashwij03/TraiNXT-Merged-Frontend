import { useMemo } from "react";
import DataTable from "../../../components/dashboard/shared/DataTable";
import { canViewComment } from "../../../services/commentService";
import { getCurrentUser } from "../../../services/roleService";
import { useComments } from "../../../comments/CommentsContext";
import { readJson } from "../../../utils/storageHelpers";

// Resolve a Subject → Study ID mapping from the shared subjectsByStudy store,
// used as a fallback Study ID when a comment record itself does not carry an
// explicit study code (e.g. legacy records or subject-only scoped comments).
function resolveStudyIdForSubject(subjectId) {
  if (!subjectId) {
    return "";
  }

  const subjectsByStudy = readJson("subjectsByStudy", {});
  const normalized = String(subjectId).toLowerCase();

  for (const [studyKey, subjects] of Object.entries(subjectsByStudy)) {
    if (!Array.isArray(subjects)) {
      continue;
    }

    const match = subjects.find((subject) => {
      const candidateId = subject?.subjectId || subject?.id || "";
      return String(candidateId).toLowerCase() === normalized;
    });

    if (match) {
      return match.studyCode || match.studyId || studyKey;
    }
  }

  return "";
}

// Phase 7 (Cross-View Comments Synchronization): this view now reads from
// the shared CommentsContext instead of pulling from getVisibleComments()
// on every "comments-updated" event via a local refreshTick. That local
// listener duplicated work already done by CommentsProvider and left
// this table one render behind the counters/widgets. All authorization
// filtering still runs through canViewComment, unchanged.
function SubjectComments({ subjectId }) {
  const currentUser = getCurrentUser();
  const { comments: liveComments } = useComments();

  const comments = useMemo(() => {
    const fallbackStudyId = resolveStudyIdForSubject(subjectId);

    return liveComments
      .filter((comment) => canViewComment(comment, currentUser))
      .filter(
        (comment) => String(comment.subjectId || "") === String(subjectId || "")
      )
      .map((comment) => ({
        id: comment.id,
        studyId: comment.study || fallbackStudyId || "—",
        subjectDocument: comment.document
          ? `${comment.subjectId} / ${comment.document}`
          : comment.subjectId,
        comment: comment.description || "—",
        by: comment.createdBy || "—",
        date: comment.createdAt || "—",
        status: comment.status,
      }));
  }, [liveComments, subjectId, currentUser]);

  return (
    <DataTable
      title="Subject Comments"
      columns={[
        { key: "id", label: "ID" },
        { key: "studyId", label: "Study ID" },
        { key: "subjectDocument", label: "Subject/Document" },
        { key: "comment", label: "Comment" },
        { key: "by", label: "By" },
        { key: "date", label: "Date" },
        { key: "status", label: "Status" }
      ]}
      data={comments}
      emptyMessage="No comments for this subject"
      pagination
    />
  );
}

export default SubjectComments;
