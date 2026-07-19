
// newly added

import {
  FiUserPlus,
  FiCalendar,
  FiUpload,
  FiFileText
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  COMPLETED_STUDY_SUBJECT_CREATION_MESSAGE,
  isStudyCompletedByCode,
} from "../../../services/studyService";

import "./dashboard.css";

function QuickActionsWidget({ study, studyCode, onAddSubject }) {
  const navigate = useNavigate();

  const resolvedStudyCode =
    studyCode ||
    study?.code ||
    study?.studyId ||
    study?.id ||
    "";

  const handleAddSubject = () => {
    if (resolvedStudyCode && isStudyCompletedByCode(resolvedStudyCode)) {
      window.alert(COMPLETED_STUDY_SUBJECT_CREATION_MESSAGE);
      return;
    }

    if (typeof onAddSubject === "function") {
      onAddSubject();
      return;
    }

    if (resolvedStudyCode) {
      navigate(
        `/study-dashboard/${encodeURIComponent(resolvedStudyCode)}?tab=Subjects`
      );
    } else {
      navigate("/studies");
    }
  };

  return (

    <div className="dashboard-widget">

      <h3>
        Quick Actions
      </h3>

      <div className="quick-grid">

        <button type="button" onClick={handleAddSubject}>
          <FiUserPlus />
          Add Subject
        </button>

        <button>
          <FiCalendar />
          Schedule Visit
        </button>

        <button>
          <FiUpload />
          Upload File
        </button>

        <button>
          <FiFileText />
          Create Report
        </button>

      </div>

    </div>

  );
}

export default QuickActionsWidget;
