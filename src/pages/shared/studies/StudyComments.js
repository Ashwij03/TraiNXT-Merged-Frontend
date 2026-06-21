import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import DataTable from "../../../Components/dashboard/DataTable";
import {
  canResolveComments,
  getVisibleComments,
  resolveCommentRecord
} from "../../../services/commentService";
import { getStudyByCode } from "../../../services/studyService";

function StudyComments() {
  const { id } = useParams();
  const study = getStudyByCode(id);
  const studyCode = study?.code || id;
  const [refreshKey, setRefreshKey] = useState(0);

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
  }, [studyCode, study?.status, refreshKey]);

  return (
    <div className="module-card">
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
