import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SubjectOverview from "./SubjectOverview";
import SubjectVisits from "./SubjectVisits";
import SubjectDocuments from "./SubjectDocuments";
import SubjectComments from "./SubjectComments";
import SubjectAuditTrail from "./SubjectAuditTrail";
import {
  canEditSubjectContent,
  requiresPermissionRequest
} from "../../../utils/contentAccess";
import { submitAccessRequest } from "../../../services/accessPermissionService";
import { getCurrentUser } from "../../../services/roleService";
import {
  markVisitStageCompleted,
  syncSubjectSchedules
} from "../../../services/visitScheduleService";
import "../AccessPermissions.css";
// import VisitDetails from "./VisitDetails";
// import VisitDetails from "../visits/VisitDetails";

import "./SubjectProfile.css";

function SubjectProfile({ setActiveTab: setStudyTab, onBack }) {

  const navigate = useNavigate();

  const subject = JSON.parse(
    localStorage.getItem("selectedSubject") || "null"
  );

  const [activeTab, setActiveTab] = useState("Overview");

  const [isEditing, setIsEditing] = useState(false);

  const [subjectData, setSubjectData] = useState(subject || {});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState({
    deletedBy: "",
    reason: ""
  });
  const currentUser = getCurrentUser();
  const canEditSubject = canEditSubjectContent(currentUser);
  const needsPermissionRequest = requiresPermissionRequest(currentUser);

  const handleRequestEditPermission = () => {
    submitAccessRequest(
      {
        studySubject: subjectData?.studyId || subjectData?.id,
        accessType: "Subject Edit Access",
        notes: "Subject profile edit request"
      },
      currentUser
    );
    alert("Edit permission request submitted for admin review.");
  };

  // const [visits] = useState(
  //   JSON.parse(
  //     localStorage.getItem(
  //       `subject_${subject.id}_visits`
  //     )
  //   ) || []
  // );

  const saveSubject = () => {

    const subjects =
      JSON.parse(
        localStorage.getItem(
          "subjects"
        )
      ) || [];

    const updatedSubjects =
      subjects.map(item =>
        item.id === subjectData.id
          ? subjectData
          : item
      );

    localStorage.setItem(
      "subjects",
      JSON.stringify(updatedSubjects)
    );

    localStorage.setItem(
      "selectedSubject",
      JSON.stringify(subjectData)
    );

    syncSubjectSchedules(
      subjectData.studyId || subjectData.study || subjectData.studyName,
      subjectData.id,
      subjectData
    );

    try {
      const subjectsByStudy =
        JSON.parse(localStorage.getItem("subjectsByStudy")) || {};
      const studyKey =
        subjectData.studyId || subjectData.study || subjectData.studyName;

      if (studyKey && Array.isArray(subjectsByStudy[studyKey])) {
        subjectsByStudy[studyKey] = subjectsByStudy[studyKey].map((item) =>
          item.id === subjectData.id ? { ...item, ...subjectData } : item
        );
        localStorage.setItem(
          "subjectsByStudy",
          JSON.stringify(subjectsByStudy)
        );
      }

      const detailsKey = "subjectDetailsByStudy";
      const allDetails = JSON.parse(localStorage.getItem(detailsKey)) || {};
      allDetails[`${studyKey}::${subjectData.id}`] = {
        initials: subjectData.initials,
        status: subjectData.status,
        pi: subjectData.pi,
        site: subjectData.site,
        screeningDate: subjectData.screeningDate,
        enrollmentDate: subjectData.enrollmentDate,
        subjectId: subjectData.id,
        studyId: studyKey
      };
      localStorage.setItem(detailsKey, JSON.stringify(allDetails));
    } catch {
      /* ignore storage errors */
    }

    const logs =
      JSON.parse(
        localStorage.getItem(
          "auditLogs"
        )
      ) || [];

    logs.push({
      action: "EDIT SUBJECT",
      subjectId: subjectData.id,
      updatedBy: "Admin",
      updatedAt:
        new Date().toISOString()
    });

    localStorage.setItem(
      "auditLogs",
      JSON.stringify(logs)
    );

    alert(
      "Subject Updated Successfully"
    );

    setIsEditing(false);

  };

  const confirmDeleteSubject = () => {

    if (
      !deleteInfo.deletedBy.trim() ||
      !deleteInfo.reason.trim()
    ) {
      alert(
        "Deleted By and Reason are required"
      );
      return;
    }

    const logs =
      JSON.parse(
        localStorage.getItem(
          "auditLogs"
        )
      ) || [];

    logs.push({

      action: "DELETE SUBJECT",

      subjectId: subject.id,

      deletedBy:
        deleteInfo.deletedBy,

      reason:
        deleteInfo.reason,

      deletedAt:
        new Date().toISOString()

    });

    localStorage.setItem(
      "auditLogs",
      JSON.stringify(logs)
    );

    const subjects =
      JSON.parse(
        localStorage.getItem(
          "subjects"
        )
      ) || [];

    const updatedSubjects =
      subjects.filter(
        item =>
          item.id !== subject.id
      );

    localStorage.setItem(
      "subjects",
      JSON.stringify(updatedSubjects)
    );

    localStorage.removeItem(
      "selectedSubject"
    );

    setStudyTab("Subjects");

  };


  const updateSubject = (field, value) => {
    setSubjectData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBack = () => {
    if (typeof setStudyTab === "function") {
      setStudyTab("Subjects");
      return;
    }

    if (typeof onBack === "function") {
      onBack();
      return;
    }

    navigate("/subjects");
  };

  if (!subject) {

    return (

      <div className="subject-profile-page">

        <div className="subject-empty-state">

          <h2>
            No Subject Selected
          </h2>

          <button
            className="back-btn"
            onClick={handleBack}
            type="button"
          >
            Back To Subjects
          </button>

        </div>

      </div>

    );

  }

  const resolvedSubjectId =
    subject?.subjectId || subject?.id || subjectData?.subjectId || subjectData?.id;

  const workflowSteps = [

    {
      id: 1,
      name: "Screening"
    },

    {
      id: 2,
      name: "Enrollment"
    },

    {
      id: 3,
      name: "Visit 1"
    },

    {
      id: 4,
      name: "Visit 2"
    },

    {
      id: 5,
      name: "Visit 3"
    },

    {
      id: 6,
      name: "Completed"
    }

  ];

  if (!subject) {
    return (
      <div className="subject-profile-empty">
        <p>No subject selected.</p>
        <button type="button" onClick={() => setStudyTab?.("Subjects")}>
          Back to Subjects
        </button>
      </div>
    );
  }

  return (

    <div className="subject-profile-page">

      {/* Header */}

      <div className="subject-workspace-header">

        <div>

          <button
            className="back-btn"
            onClick={handleBack}
            type="button"
          >
            ← Back To Subjects
          </button>

          <h1 className="subject-title">

            {subject.id}

          </h1>

          <p className="subject-subtitle">

            Subject Workspace

          </p>

        </div>

        <div className="subject-header-actions">

          <span
            className={`status-badge ${
              subject.status?.toLowerCase()
            }`}
          >
            {subject.status}
          </span>

          {canEditSubject && (
            <>
              <button
                className="btn-edit edit-subject-btn"
                onClick={() =>
                  setIsEditing(true)
                }
              >
                ✏ Edit Subject
              </button>

              <button
                className="delete-subject-btn"
                onClick={() =>
                  setDeleteModalOpen(true)
                }
              >
                🗑 Delete Subject
              </button>
            </>
          )}

          {needsPermissionRequest && (
            <button
              type="button"
              className="request-permission-btn"
              onClick={handleRequestEditPermission}
            >
              Request Edit Permission
            </button>
          )}
          
        </div>

      </div>

      <div className="subject-master-card">

        <div className="subject-master-header">

          <h2>
            Subject Information
          </h2>

        </div>

        <div className="subject-master-grid">

          <div
            className="master-item"
            onClick={() =>
              setActiveTab("Overview")
            }
          >
            <label>Subject ID</label>
            <p>{subject.id}</p>
          </div>

          <div
            className="master-item"
            onClick={() =>
              setActiveTab("Overview")
            }
          >
            <label>Initials</label>
            {
              isEditing ? (
              
                <input
                  type="text"
                  value={subjectData.initials}
                  onChange={(e) =>
                    updateSubject(
                      "initials",
                      e.target.value
                    )
                  }
                />
                
              ) : (
              
                <p>{subjectData.initials}</p>
              
              )
            }
          </div>

          <div
            className="master-item"
            onClick={() =>
              setActiveTab("Overview")
            }
          >
            <label>Status</label>
          
            {
              isEditing ? (
              
                <select
                  value={subjectData.status}
                  onChange={(e) =>
                    updateSubject(
                      "status",
                      e.target.value
                    )
                  }
                  >
                  <option>
                    Screening
                  </option>

                  <option>
                    Enrolled
                  </option>
                
                  <option>
                    Ongoing
                  </option>
                  
                  <option>
                    Completed
                  </option>
                  
                  <option>
                    Withdrawn
                  </option>
                  
                  <option>
                    Dropout
                  </option>
                
                </select>

              ) : (
              
                <p>
                  {subjectData.status}
                </p>

              )
            }

          </div>

          <div className="master-item">
            <label>Study</label>
            <p>
              {subjectData.studyName ||
                "Orthopedics Study"}
            </p>
          </div>
              
          <div className="master-item">
            <label>Principal Investigator</label>
            {
              isEditing ? (
              
                <input
                  type="text"
                  value={subjectData.pi}
                  onChange={(e) =>
                    updateSubject(
                      "pi",
                      e.target.value
                    )
                  }
                />
                
              ) : (
              
                <p>{subjectData.pi}</p>
              
              )
            }
          </div>
              
          <div className="master-item">
            <label>Site</label>
            {
              isEditing ? (
              
                <input
                  type="text"
                  value={subjectData.site}
                  onChange={(e) =>
                    updateSubject(
                      "site",
                      e.target.value
                    )
                  }
                />
                
              ) : (
              
                <p>{subjectData.site}</p>
              
              )
            }
          </div>
              
          <div className="master-item">
            <label>Screening Date</label>
            {
              isEditing ? (
              
                <input
                  type="date"
                  value={subjectData.screeningDate}
                  onChange={(e) =>
                    updateSubject(
                      "screeningDate",
                      e.target.value
                    )
                  }
                />
                
              ) : (
              
                <p>{subjectData.screeningDate}</p>
              
              )
            }
          </div>
              
          <div className="master-item">
            <label>Enrollment Date</label>
            {
              isEditing ? (
              
                <input
                  type="date"
                  value={subjectData.enrollmentDate}
                  onChange={(e) =>
                    updateSubject(
                      "enrollmentDate",
                      e.target.value
                    )
                  }
                />
                
              ) : (
              
                <p>{subjectData.enrollmentDate}</p>
              
              )
            }
          </div>
              
          <div
            className="master-item"
            onClick={() =>
              setActiveTab("Visits")
            }
          >
            <label>Current Visit</label>
            {
              isEditing ? (
              
                <input
                  type="text"
                  value={subjectData.currentVisit}
                  onChange={(e) =>
                    updateSubject(
                      "currentVisit",
                      e.target.value
                    )
                  }
                />
                
              ) : (
              
                <p>{subjectData.currentVisit}</p>
              
              )
            }
          </div>
              
        </div>
              
      </div>

      {
        isEditing && (
        
          <button
            className="save-subject-btn"
            onClick={saveSubject}
          >
            Save Changes
          </button>

        )
      }

      {/* Subject Journey */}

      <div className="journey-card">

        <h3>
          Subject Journey
        </h3>

        <div className="journey-container">

          {workflowSteps.map(
            (step, index) => (

              <div
                key={step.id}
                className="journey-step"
                onClick={() => {
                  localStorage.setItem(
                    "selectedVisitStage",
                    step.name
                  );

                  if (
                    String(subjectData.currentVisit || "").toLowerCase() ===
                    step.name.toLowerCase()
                  ) {
                    markVisitStageCompleted(
                      subjectData.studyId ||
                        subjectData.study ||
                        subjectData.studyName,
                      resolvedSubjectId,
                      step.name
                    );
                  }

                  setActiveTab("Visits");
                }}
              >
              
                <div className="journey-circle">
                  {index + 1}
                </div>
              
                <span>
                  {step.name}
                </span>
              
              </div>

            )
          )}

        </div>

      </div>

      {/* Tabs */}

      <div className="subject-tabs">

        {[
          "Overview",
          "Visits",
          "Documents",
          "Comments",
          "Audit Trail"
        ].map(tab => (

          <button
            key={tab}
            className={
              activeTab === tab
                ? "subject-tab active"
                : "subject-tab"
            }
            onClick={() =>
              setActiveTab(tab)
            }
          >
            {tab}
          </button>

        ))}

      </div>

      {/* Dynamic Content */}

      <div className="subject-content">

        {
          activeTab === "Overview" && (

            <SubjectOverview
              subject={subject}
            />

          )
        }

        {
          activeTab === "Visits" && (

            <SubjectVisits
              subject={subject}
              setActiveTab={setActiveTab}
            />

          )
        }

        {/* {activeTab === "VisitDetails" && (
          <VisitDetails
            subject={subject}
            setActiveTab={setActiveTab}
          />
        )} */}

        {
          activeTab === "Documents" && (

            <SubjectDocuments
              subject={subject}
            />

          )
        }

        {
          activeTab === "Comments" && (
            <SubjectComments subjectId={resolvedSubjectId} />
          )
        }

        {
          activeTab === "Audit Trail" && (

            <SubjectAuditTrail
              subject={subject}
            />

          )
        }

      </div>

      {
        deleteModalOpen && (
        
          <div className="delete-modal">

            <h3>
              Delete Subject
            </h3>

            <p>
              This action will be recorded
              in Audit Trail.
            </p>

            <input
              type="text"
              placeholder="Deleted By"
              value={deleteInfo.deletedBy}
              onChange={(e)=>
                setDeleteInfo({
                  ...deleteInfo,
                  deletedBy:e.target.value
                })
              }
            />

            <textarea
              placeholder="Reason For Deletion"
              value={deleteInfo.reason}
              onChange={(e)=>
                setDeleteInfo({
                  ...deleteInfo,
                  reason:e.target.value
                })
              }
            />

            <div className="delete-modal-actions">
            
              <button
                onClick={() =>
                  setDeleteModalOpen(false)
                }
              >
                Cancel
              </button>
              
              <button
                onClick={confirmDeleteSubject}
              >
                Delete Subject
              </button>
              
            </div>
              
          </div>

        )
      }

    </div>

  );

}

export default SubjectProfile;