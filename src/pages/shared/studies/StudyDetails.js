import { useParams } from "react-router-dom";
import { useState } from "react";

// import SubjectsTab from "./SubjectsTab";
import ProgressNotes from "../operations/ProgressNotes";
import Comments from "../operations/Comments";
import FileDetails from "../documents/FileDetails";
import StudyLogs from "../operations/StudyLogs";
import "./StudyDetails.css";
import ERegSection from "../../../ERegSection.jsx";
import DashboardLayout from "../../../Components/dashboard/DashboardLayout";

function StudyDetails() {

  const { code } = useParams();

  const [showSubjects, setShowSubjects] = useState(false);

  const [activeTab, setActiveTab] = useState("");

  // Dynamic study data
  const studyData = {

    "747-303": {
      title: "OBETICHOLIC ACID (OCA)",
      org: "Test Organization",
      location: "Cambridge, MA",
    },

    "05151": {
      title: "SeptiTest",
      org: "Test Organization",
      location: "Cambridge, MA",
    },

  };

  // Current selected study
  const currentStudy = studyData[code];

  // Codex change: Study workspace is wrapped so sidebar/header stay visible on /study/:code.
  return (

    <DashboardLayout>

    <div
      className="studies-wrapper"
      style={{
        width: "100%",
        margin: "0",
        padding: "0"
      }}>
        
      {/* HEADER */}
      <div
        className="study-detail-header"
        style={{
          backgroundColor: "#032B3A",
          padding: "25px 35px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          margin: "0",
          borderRadius: "4px"
        }}>
          <div className="study-title">
            <div
              className="study-id"
              style={{
                color: "white",
                fontSize: "18px",
                fontWeight: "bold"
              }}
            >
              {code}
            </div>
            
            <div
              className="study-name"
              style={{
                color: "white",
                marginTop: "8px"
              }}
            >
              {currentStudy?.title}
            </div>
            
          </div>
          <div
            className="study-org-header"
            style={{ color: "white" }}
          >
            <div className="study-org">
              <strong style={{ color: "white" }}>
                {currentStudy?.org}
              </strong>
              <p style={{ color: "white" }}>
                {currentStudy?.location}
              </p>
            </div>
            <button
              className="study-dropdown-btn"
              onClick={() => setShowSubjects(!showSubjects)}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                marginLeft: "10px",
                cursor: "pointer"
              }}
            >
              ▼
            </button>
      </div>

    </div>


      {/* TABS */}
      <div
        className="study-tabs"
        style={{
          display: "flex",
          gap: "18px",
          background: "#062b3d",
          padding: "16px 20px",
          borderRadius: "4px",
          width: "100%",
          margin: "0",
        }}
      >

        {/* SUBJECTS */}
        <div
          onClick={() => setActiveTab("subjects")}
          style={{
            background:
              activeTab === "subjects"
                ? "#0d6efd"
                : "#f2f2f2",

            color:
              activeTab === "subjects"
                ? "white"
                : "#062b3d",

            padding: "12px 20px",

            borderRadius: "8px",

            cursor: "pointer",

            fontWeight: "bold"
          }}
        >
          Subjects
        </div>

        {/* PROGRESS */}
        <div
          onClick={() => setActiveTab("progress")}
          style={{
            background:
              activeTab === "progress"
                ? "#0d6efd"
                : "#f2f2f2",

            color:
              activeTab === "progress"
                ? "white"
                : "#062b3d",

            padding: "12px 20px",

            borderRadius: "8px",

            cursor: "pointer",

            fontWeight: "bold"
          }}
        >
          Progress Notes
        </div>

        {/* COMMENTS */}
        <div
          onClick={() => setActiveTab("comments")}
          style={{
            background:
              activeTab === "comments"
                ? "#0d6efd"
                : "#f2f2f2",

            color:
              activeTab === "comments"
                ? "white"
                : "#062b3d",

            padding: "12px 20px",

            borderRadius: "8px",

            cursor: "pointer",

            fontWeight: "bold"
          }}
        >
          Comments
        </div>

        {/* FILES */}
        <div
          onClick={() => setActiveTab("files")}
          style={{
            background:
              activeTab === "files"
                ? "#0d6efd"
                : "#f2f2f2",

            color:
              activeTab === "files"
                ? "white"
                : "#062b3d",

            padding: "12px 20px",

            borderRadius: "8px",

            cursor: "pointer",

            fontWeight: "bold"
          }}
        >
          Files
        </div>

        {/* LOGS */}
        <div
          onClick={() => setActiveTab("logs")}
          style={{
            background:
              activeTab === "logs"
                ? "#0d6efd"
                : "#f2f2f2",

            color:
              activeTab === "logs"
                ? "white"
                : "#062b3d",

            padding: "12px 20px",

            borderRadius: "8px",

            cursor: "pointer",

            fontWeight: "bold"
          }}
        >
          Logs
        </div>

        {/* EREG */}
        <div
          onClick={() => setActiveTab("ereg")}
          style={{
            background:
              activeTab === "ereg"
                ? "#0d6efd"
                : "#f2f2f2",

            color:
              activeTab === "ereg"
                ? "white"
                : "#062b3d",

            padding: "12px 20px",

            borderRadius: "8px",

            cursor: "pointer",

            fontWeight: "bold"
          }}
        >
          eReg
        </div>

      </div>

      {/* SUBJECTS */}
      {/* {activeTab === "subjects" && (
        <>
          <SubjectsTab />
        </>
      )} */}

      {/* PROGRESS NOTES */}
      {activeTab === "progress" && (
        <ProgressNotes />
      )}

      {/* COMMENTS */}
      {activeTab === "comments" && (
        <Comments />
      )}

      {/* FILES */}
      {activeTab === "files" && (
        <FileDetails />
      )}

      {/* LOGS */}
      {activeTab === "logs" && (
        <StudyLogs />
      )}

      {/* EREG */}
      {activeTab === "ereg" && (
        <ERegSection />
      )}

    </div>

    </DashboardLayout>

  );

}

export default StudyDetails;
