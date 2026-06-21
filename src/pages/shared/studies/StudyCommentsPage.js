import { useMemo } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../../Components/dashboard/DashboardLayout";
import DataTable from "../../../Components/dashboard/DataTable";
import { getComments } from "../../../services/adminService";
import { getStudyByCode } from "../../../services/studyService";
import "../../../pages/Admin/AdminPage.css";

function StudyCommentsPage() {
  const { code } = useParams();
  const study = getStudyByCode(code);
  const comments = getComments();

  const studyComments = useMemo(
    () =>
      comments
        .filter((comment) => String(comment.study) === String(code))
        .map((comment) => ({
          id: comment.id,
          subjectDocument: `${comment.subjectId || "—"} / ${comment.document || "—"}`,
          comment: comment.description || "—",
          by: comment.createdBy || "—",
          date: comment.createdAt || "—",
          status: comment.status || "—"
        })),
    [comments, code]
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
