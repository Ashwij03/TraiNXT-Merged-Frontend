import { useMemo } from "react";
import DataTable from "../../../Components/dashboard/DataTable";
import { getComments } from "../../../services/adminService";

function SubjectComments({ subjectId }) {
  const comments = useMemo(() => {
    return getComments()
      .filter((comment) => String(comment.subjectId) === String(subjectId))
      .map((comment) => ({
        id: comment.id,
        subjectDocument: comment.document
          ? `${comment.subjectId} / ${comment.document}`
          : comment.subjectId,
        comment: comment.description || "—",
        by: comment.createdBy || "—",
        date: comment.createdAt || "—",
        status: comment.status
      }));
  }, [subjectId]);

  return (
    <div className="subject-tab-card">
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
    </div>
  );
}

export default SubjectComments;
