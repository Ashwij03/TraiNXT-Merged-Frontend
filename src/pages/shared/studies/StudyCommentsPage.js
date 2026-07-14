import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../../components/dashboard/shared/DashboardLayout";
import DataTable from "../../../components/dashboard/shared/DataTable";
import { getVisibleComments } from "../../../services/commentService";
import { getStudyByCode } from "../../../services/studyService";
import "../../../pages/Admin/AdminPage.css";

function StudyCommentsPage() {
  const { code } = useParams();
  const study = getStudyByCode(code);

  // Bumped whenever "comments-updated" fires so this page reflects
  // comments posted anywhere else (RoleCommentsView, DocumentFolderManager,
  // CRO/Sponsor top-level comments) without needing a full remount.
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
  // directly. getVisibleComments() already applies canViewComment, which
  // enforces: (1) Sponsor's document-scoped stage-gating, and (2) the
  // CRO/Sponsor cross-study access check via accessibleStudyCodeSet. This
  // route has no role restriction, so any role — including CRO/Sponsor —
  // can land on it, and previously they could see another study's comments
  // (or stage-gated comments) just by editing the URL.
  const studyComments = useMemo(
    () =>
      getVisibleComments({ studyCode: code }).map((comment) => ({
        id: comment.id,
        subjectDocument: `${comment.subjectId || "—"} / ${comment.document || "—"}`,
        comment: comment.description || "—",
        by: comment.createdBy || "—",
        date: comment.createdAt || "—",
        status: comment.status || "—"
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [code, refreshTick]
  );

  return (
    <DashboardLayout>
      <div className="admin-page">
        <div className="admin-page-title">
          <h1>Comments — {study?.code || code}</h1>
          <p>{study?.name || "Study-specific comment tracker"}</p>
        </div>

        <div className="admin-table-section">
          <DataTable
            title="Study Comments"
            columns={[
              { key: "id", label: "ID" },
              { key: "subjectDocument", label: "Subject/Document" },
              { key: "comment", label: "Comment" },
              { key: "by", label: "By" },
              { key: "date", label: "Date" },
              { key: "status", label: "Status" }
            ]}
            data={studyComments}
            emptyMessage="No comments for this study"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default StudyCommentsPage;