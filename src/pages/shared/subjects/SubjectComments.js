import { useEffect, useMemo, useState } from "react";
import DataTable from "../../../components/dashboard/shared/DataTable";
import { getVisibleComments } from "../../../services/commentService";

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
    return getVisibleComments({ subjectId }).map((comment) => ({
      id: comment.id,
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
        { key: "subjectDocument", label: "Subject/Document" },
        { key: "comment", label: "Comment" },
        { key: "by", label: "By" },
        { key: "date", label: "Date" },
        { key: "status", label: "Status" }
      ]}
      data={comments}
      emptyMessage="No comments for this subject"
    />
  );
}

export default SubjectComments;