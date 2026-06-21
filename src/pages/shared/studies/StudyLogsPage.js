import { useMemo } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../../Components/dashboard/DashboardLayout";
import DataTable from "../../../Components/dashboard/DataTable";
import { getStudyByCode } from "../../../services/studyService";
import "../../../pages/Admin/AdminPage.css";
import "../operations/StudyLogs.css";

function readSubjectsByStudy() {
  try {
    return JSON.parse(localStorage.getItem("subjectsByStudy")) || {};
  } catch {
    return {};
  }
}

function StudyLogsPage() {
  const { code } = useParams();
  const study = getStudyByCode(code) || (() => {
    try {
      return JSON.parse(localStorage.getItem("selectedStudy"));
    } catch {
      return null;
    }
  })();
  const studyCode = code || study?.code;

  const logRows = useMemo(() => {
    const subjectsByStudy = readSubjectsByStudy();
    const subjects = subjectsByStudy[studyCode] || [];

    if (subjects.length) {
      return subjects.map((subject) => ({
        subjectId: subject.subjectId || subject.id,
        randomizationId: subject.randomizationId || "—",
        sex: subject.sex || subject.gender || "—",
        dob: subject.dob || "—",
        screeningDate: subject.screeningDate || "—",
        status: subject.status || "In Screening",
        statusChanged: subject.statusChanged || "—",
        reason: subject.reason || "—"
      }));
    }

    return [
      {
        subjectId: "SUB-001",
        randomizationId: "—",
        sex: "Female",
        dob: "—",
        screeningDate: "28-FEB-2022",
        status: "In Screening",
        statusChanged: "26-OCT-2022",
        reason: "—"
      }
    ];
  }, [studyCode]);

  return (
    <DashboardLayout>
      <div className="logs-page admin-page">
        <div className="admin-page-title">
          <h1>Logs — {study?.code || studyCode || "Study"}</h1>
          <p>{study?.name || "Study-specific subject logs"}</p>
        </div>

        <p className="sub-title">Screening Log</p>

        <div className="admin-table-section">
          <DataTable
            title="Subject Logs"
            columns={[
              { key: "subjectId", label: "Subject ID" },
              { key: "randomizationId", label: "Randomization ID" },
              { key: "sex", label: "Sex" },
              { key: "dob", label: "DOB" },
              { key: "screeningDate", label: "Screening Date" },
              { key: "status", label: "Status" },
              { key: "statusChanged", label: "Status Changed As Of" },
              { key: "reason", label: "Reason" }
            ]}
            data={logRows}
            emptyMessage="No log entries for this study"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default StudyLogsPage;
