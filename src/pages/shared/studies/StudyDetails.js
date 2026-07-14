import { readStorage } from "../../../utils/storageHelpers";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ProgressNotes from "../operations/ProgressNotes";
import Comments from "../operations/Comments";
import FileDetails from "../documents/FileDetails";
import StudyLogs from "../operations/StudyLogs";
import "./StudyDetails.css";
import ERegSection from "../../../ereg/ERegSection.js";
import StudyFinancials from "../../Sponsor/Financials/StudyFinancials";
import DashboardLayout from "../../../components/dashboard/shared/DashboardLayout";

const STUDY_STORAGE_KEYS = ["studies", "studiesData", "studyData"];

function getAllStudies() {
  for (const storageKey of STUDY_STORAGE_KEYS) {
    const savedStudies = readStorage(storageKey, null);

    if (Array.isArray(savedStudies)) {
      return savedStudies;
    }

    if (savedStudies && typeof savedStudies === "object") {
      return Object.values(savedStudies).flatMap((value) =>
        Array.isArray(value) ? value : [value]
      );
    }
  }

  return [];
}

function getStudyCode(study) {
  return String(
    study?.code ||
      study?.studyCode ||
      study?.studyId ||
      study?.id ||
      ""
  );
}

function getStudyTitle(study) {
  return (
    study?.title ||
    study?.studyName ||
    study?.name ||
    "Untitled Study"
  );
}

function getStudyOrganization(study) {
  return (
    study?.organization ||
    study?.sponsor ||
    study?.cro ||
    "—"
  );
}

function getStudyLocation(study) {
  return (
    study?.location ||
    study?.site ||
    study?.country ||
    "—"
  );
}

function StudyDetails() {
  const { code } = useParams();

  const [showSubjects, setShowSubjects] = useState(false);
  const [activeTab, setActiveTab] = useState("financials");
  const [studies, setStudies] = useState(() => getAllStudies());

  useEffect(() => {
    const refreshStudies = () => {
      setStudies(getAllStudies());
    };

    window.addEventListener("studies-updated", refreshStudies);
    window.addEventListener("study-data-updated", refreshStudies);
    window.addEventListener("storage", refreshStudies);

    return () => {
      window.removeEventListener("studies-updated", refreshStudies);
      window.removeEventListener("study-data-updated", refreshStudies);
      window.removeEventListener("storage", refreshStudies);
    };
  }, []);

  const currentStudy = useMemo(() => {
    const normalizedCode = String(code || "").trim().toLowerCase();

    return (
      studies.find(
        (study) =>
          getStudyCode(study).trim().toLowerCase() === normalizedCode
      ) || null
    );
  }, [code, studies]);

  const studyCode = getStudyCode(currentStudy) || code || "—";
  const studyTitle = getStudyTitle(currentStudy);
  const studyOrganization = getStudyOrganization(currentStudy);
  const studyLocation = getStudyLocation(currentStudy);

  const tabs = [
    { id: "subjects", label: "Subjects" },
    { id: "progress", label: "Progress Notes" },
    { id: "comments", label: "Comments" },
    { id: "files", label: "Files" },
    { id: "logs", label: "Logs" },
    { id: "ereg", label: "eReg" },
    { id: "financials", label: "Financials" },
  ];

  return (
    <DashboardLayout>
      <div className="studies-wrapper">
        <div className="study-detail-header">
          <div className="study-title">
            <div className="study-id">{studyCode}</div>

            <div className="study-name">{studyTitle}</div>
          </div>

          <div className="study-org-header">
            <div className="study-org">
              <strong>{studyOrganization}</strong>
              <p>{studyLocation}</p>
            </div>

            <button
              type="button"
              className="study-dropdown-btn"
              onClick={() => setShowSubjects((previousValue) => !previousValue)}
              aria-label="Toggle study details"
              aria-expanded={showSubjects}
            >
              ▼
            </button>
          </div>
        </div>

        {showSubjects && (
          <div className="study-dropdown-content">
            <p>
              <strong>Study Code:</strong> {studyCode}
            </p>

            <p>
              <strong>Study Name:</strong> {studyTitle}
            </p>

            <p>
              <strong>Organization:</strong> {studyOrganization}
            </p>

            <p>
              <strong>Location:</strong> {studyLocation}
            </p>
          </div>
        )}

        <div className="study-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`study-tab-button ${
                activeTab === tab.id ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="study-tab-content">
          {activeTab === "subjects" && (
            <div className="study-empty-state">
              Subjects content will appear here.
            </div>
          )}

          {activeTab === "progress" && <ProgressNotes />}

          {activeTab === "comments" && <Comments embedded />}

          {activeTab === "files" && <FileDetails />}

          {activeTab === "logs" && <StudyLogs />}

          {activeTab === "ereg" && <ERegSection />}

          {activeTab === "financials" && <StudyFinancials studyCode={studyCode} />}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default StudyDetails;