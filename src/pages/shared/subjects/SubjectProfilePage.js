import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../../Components/dashboard/DashboardLayout";
import SubjectProfile from "./SubjectProfile";

function findSubjectById(id) {
  try {
    const subjectsByStudy =
      JSON.parse(localStorage.getItem("subjectsByStudy")) || {};

    for (const subjects of Object.values(subjectsByStudy)) {
      if (!Array.isArray(subjects)) {
        continue;
      }

      const matched = subjects.find(
        (subject) =>
          String(subject.id) === String(id) ||
          String(subject.subjectId) === String(id)
      );

      if (matched) {
        return matched;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function SubjectProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const matchedSubject = findSubjectById(id);

    if (matchedSubject) {
      localStorage.setItem("selectedSubject", JSON.stringify(matchedSubject));
    }

    setIsReady(true);
  }, [id]);

  if (!isReady) {
    return (
      <DashboardLayout>
        <div className="dashboard-loading">Loading subject profile...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SubjectProfile setActiveTab={() => navigate("/subjects")} />
    </DashboardLayout>
  );
}

export default SubjectProfilePage;
