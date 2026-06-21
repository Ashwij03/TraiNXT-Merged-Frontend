import { useMemo } from "react";
import { useParams } from "react-router-dom";
import DataTable from "../../../Components/dashboard/DataTable";
import DocumentFolderManager from "../../../Components/common/DocumentFolderManager";
import { getStudyLogs } from "../../../services/adminService";
import { getStudyByCode } from "../../../services/studyService";

function StudyLogsTab() {
  const { id } = useParams();
  const study = getStudyByCode(id);
  const studyCode = study?.code || id;

  const logRows = useMemo(() => getStudyLogs(studyCode), [studyCode]);

  return (
    <div className="module-card">
      <DocumentFolderManager
        sectionId="logs"
        contextKey={studyCode || "default"}
        title="Logs"
      />

      <DataTable
        title={`Study Logs — ${study?.name || studyCode}`}
        columns={[
          { key: "id", label: "Log ID" },
          { key: "type", label: "Type" },
          { key: "action", label: "Action" },
          { key: "user", label: "User" },
          { key: "timestamp", label: "Date/Time" },
          { key: "status", label: "Status" }
        ]}
        data={logRows}
        emptyMessage="No log entries for this study"
      />
    </div>
  );
}

export default StudyLogsTab;
