// UPDATED: Subjects page inside enterprise dashboard shell with dynamic data

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../Components/dashboard/DashboardLayout";
import DataTable from "../../../Components/dashboard/DataTable";
import { getAccessibleStudies } from "../../../services/roleService";
import "./SubjectsDashboard.css";

function readAllSubjects() {
  try {
    const subjectsByStudy =
      JSON.parse(localStorage.getItem("subjectsByStudy")) || {};
    const studies = getAccessibleStudies();

    return studies.flatMap((study) => {
      const studyKey = String(study.code || study.id || study.name);
      const studySubjects = Array.isArray(subjectsByStudy[studyKey])
        ? subjectsByStudy[studyKey]
        : [];

      return studySubjects.map((subject) => ({
        id: subject.id || subject.subjectId,
        initials: subject.initials,
        study: study.name || studyKey,
        site: subject.site || study.site,
        status: subject.status,
        enrollmentDate: subject.enrollmentDate,
        pi: subject.pi
      }));
    });
  } catch {
    return [];
  }
}

function SubjectsDashboard() {
  const navigate = useNavigate();
  const subjects = useMemo(() => readAllSubjects(), []);

  const openSubject = (subject) => {
    localStorage.setItem("selectedSubject", JSON.stringify(subject));
    navigate(`/subject/${subject.id}`);
  };

  return (
    <DashboardLayout>
      <div className="subjects-page">
        <div className="subjects-header">
          <h1>Subjects</h1>
        </div>

        <DataTable
          title="Subject Registry"
          columns={[
            { key: "id", label: "Subject ID" },
            { key: "initials", label: "Initials" },
            { key: "study", label: "Study" },
            { key: "site", label: "Site" },
            { key: "pi", label: "Principal Investigator" },
            { key: "status", label: "Status" },
            { key: "enrollmentDate", label: "Enrollment Date" },
            {
              key: "actions",
              label: "Actions",
              render: (_, row) => (
                <button type="button" onClick={() => openSubject(row)}>
                  View
                </button>
              )
            }
          ]}
          data={subjects}
          emptyMessage="No subjects found for your accessible studies"
        />
      </div>
    </DashboardLayout>
  );
}

export default SubjectsDashboard;
