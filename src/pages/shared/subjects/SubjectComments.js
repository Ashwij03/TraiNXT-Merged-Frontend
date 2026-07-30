import { useEffect, useMemo, useState } from "react";
import DataTable from "../../../components/dashboard/shared/DataTable";
import { getVisibleComments } from "../../../services/commentService";
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

function SubjectComments({ subjectId }) {
  // Bumped whenever "comments-updated" fires so this table reflects
  // comments posted anywhere else (RoleCommentsView, DocumentFolderManager,
  // CRO/Sponsor top-level comments) without needing the parent to remount.
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    function handleCommentsUpdated() {
      setRefreshTick((tick) => tick + 1);
    }

    window.addEventListener("comments-updated", handleCommentsUpdated);
    return () => {
      window.removeEventListener("comments-updated", handleCommentsUpdated);
    };
  }, []);

  // Use the shared commentService reader instead of reading adminService
  // directly. getVisibleComments() applies canViewComment, which enforces
  // Sponsor's document-scoped stage-gating and the CRO/Sponsor cross-study
  // access check. This component is reached via /subject/:id, a route with
  // no role restriction, so any role — including CRO/Sponsor — could
  // previously see another study's subject comments just by knowing the
  // subject ID.
  const comments = useMemo(() => {
    const fallbackStudyId = resolveStudyIdForSubject(subjectId);

    return getVisibleComments({ subjectId }).map((comment) => ({
      id: comment.id,
      studyId: comment.study || fallbackStudyId || "—",
      subjectDocument: comment.document
        ? `${comment.subjectId} / ${comment.document}`
        : comment.subjectId,
      comment: comment.description || "—",
      by: comment.createdBy || "—",
      date: comment.createdAt || "—",
      status: comment.status
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, refreshTick]);

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
