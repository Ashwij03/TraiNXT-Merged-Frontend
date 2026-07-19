import React, { useMemo, useState } from "react";
import "./PISubjectsDashboard.css";
import { FaEye, FaFileAlt, FaEllipsisV } from "react-icons/fa";
import {
  COMPLETED_STUDY_SUBJECT_CREATION_MESSAGE,
  createSubject,
  getStudyByCode,
  getSubjectStudyDefaults,
  getStudies,
} from "../../services/studyService";
import { STUDY_STATUS_COMPLETED } from "../../constants/studyStatus";

import { resolveSiteDisplay } from "../../utils/siteDisplay";

function PISubjectsDashboard({ onProfileClick }) {
  const [search, setSearch] = useState("");

  const siteSources = useMemo(() => getStudies(), []);
  const displaySite = (value) =>
    value
      ? resolveSiteDisplay(value, {
          sources: siteSources,
          fallback: value,
        })
      : "—";
  const studyOptions = useMemo(
    () =>
      getStudies().filter(
        (study) => study && study.status !== STUDY_STATUS_COMPLETED
      ),
    []
  );

  const [subjects, setSubjects] = useState(() => {
    return JSON.parse(localStorage.getItem("subjectsData")) || [];
  });
  const handleAddSubject = () => {
    if (!newSubject.id || !newSubject.initials || !newSubject.study) {
      alert("Please fill required fields");
      return;
    }

    // Item 7 (Stage 5A): resolve the authoritative study and refuse subject
    // creation for Completed studies BEFORE any mutation.
    const targetStudy = getStudyByCode(newSubject.study);
    if (targetStudy && targetStudy.status === STUDY_STATUS_COMPLETED) {
      alert(COMPLETED_STUDY_SUBJECT_CREATION_MESSAGE);
      return;
    }

    const studyDerivedFields = getSubjectStudyDefaults(newSubject.study);
    const subjectForCanonicalStore = {
      id: newSubject.id.trim(),
      initials: newSubject.initials.trim(),
      studyId: newSubject.study,
      pi: studyDerivedFields.pi,
      site: studyDerivedFields.site,
      status: newSubject.status,
      enrollmentDate: newSubject.enrollmentDate,
      currentVisit: newSubject.lastVisit,
    };
    let createdSubject;

    try {
      createdSubject = createSubject(
        newSubject.study,
        subjectForCanonicalStore
      );
    } catch (error) {
      alert(
        (error && error.message) ||
          COMPLETED_STUDY_SUBJECT_CREATION_MESSAGE
      );
      return;
    }

    const piSubjectRecord = {
      ...newSubject,
      id: createdSubject.id,
      initials: createdSubject.initials || newSubject.initials,
      study: createdSubject.studyId || newSubject.study,
      pi: createdSubject.pi,
      principalInvestigator: createdSubject.principalInvestigator,
      site: createdSubject.site,
      siteNumber: createdSubject.siteNumber,
    };

    const updatedSubjects = [...subjects, piSubjectRecord];

    setSubjects(updatedSubjects);

    localStorage.setItem("subjectsData", JSON.stringify(updatedSubjects));
    window.dispatchEvent(new Event("subjects-updated"));

    setShowModal(false);

    setNewSubject({
      id: "",
      initials: "",
      study: "",
      site: "",
      status: "Screening",
      enrollmentDate: "",
      lastVisit: "",

      screening: {
        screeningDate: "",
        eligibility: "Pending",
        notes: "",
      },

      enrollment: {
        enrolledDate: "",
        arm: "",
        consentStatus: "Pending",
      },

      visits: [
        {
          visitName: "Screening",
          visitDate: "",
          status: "Scheduled",
        },
      ],

      documents: [],
      queries: [],

      auditTrail: [
        {
          action: "Subject Created",
          user: "PI",
          date: new Date().toLocaleDateString(),
        },
      ],
    });
  };
  const [selectedStatus, setSelectedStatus] = useState("All");

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = subject.id
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      selectedStatus === "All" || subject.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const enrolledCount = subjects.filter((s) => s.status === "Enrolled").length;

  const screeningCount = subjects.filter(
    (s) => s.status === "Screening",
  ).length;

  const completedCount = subjects.filter(
    (s) => s.status === "Completed",
  ).length;

  const withdrawnCount = subjects.filter(
    (s) => s.status === "Withdrawn",
  ).length;
  const [showModal, setShowModal] = useState(false);

  const [newSubject, setNewSubject] = useState({
    id: "",
    initials: "",
    study: "",
    site: "",
    status: "Screening",
    enrollmentDate: "",
    lastVisit: "",

    screening: {
      screeningDate: "",
      eligibility: "Pending",
      notes: "",
    },

    enrollment: {
      enrolledDate: "",
      arm: "",
      consentStatus: "Pending",
    },

    visits: [
      {
        visitName: "Screening",
        visitDate: "",
        status: "Scheduled",
      },
    ],

    documents: [],

    queries: [],

    auditTrail: [
      {
        action: "Subject Created",
        user: "PI",
        date: new Date().toLocaleDateString(),
      },
    ],
  });

  const selectedStudyDefaults = useMemo(
    () => getSubjectStudyDefaults(newSubject.study),
    [newSubject.study]
  );

  const handleView = (subject) => {
    setSelectedSubject(subject);
    setShowViewModal(true);
  };

  const handleProfile = (subject) => {
    localStorage.setItem("selectedSubject", JSON.stringify(subject));

    if (onProfileClick) {
      onProfileClick(subject);
    }
  };

  const handleMore = (subject) => {
    console.log("More:", subject);
  };

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  return (
    <div className="subjects-dashboard">
      <div className="subjects-header">
        <div>
          <h2>Subjects</h2>
          <p>View and manage all subjects</p>
        </div>

        <button
          className="add-subject-btn"
          onClick={() => setShowModal(true)}
          disabled={studyOptions.length === 0}
          title={
            studyOptions.length === 0
              ? "No non-completed studies are available for subject creation."
              : undefined
          }
        >
          + Add Subject
        </button>
      </div>

      <div className="subjects-filters">
        <input
          type="text"
          placeholder="Search Subject ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option>All</option>
          <option>Screening</option>
          <option>Enrolled</option>
          <option>Completed</option>
          <option>Withdrawn</option>
        </select>
      </div>

      <div className="subjects-kpis">
        <div className="subject-kpi">
          <h4>Total Subjects</h4>
          <h2>{subjects.length}</h2>
        </div>

        <div className="subject-kpi">
          <h4>Enrolled</h4>
          <h2>{enrolledCount}</h2>
        </div>

        <div className="subject-kpi">
          <h4>Screening</h4>
          <h2>{screeningCount}</h2>
        </div>

        <div className="subject-kpi">
          <h4>Completed</h4>
          <h2>{completedCount}</h2>
        </div>

        <div className="subject-kpi">
          <h4>Withdrawn</h4>
          <h2>{withdrawnCount}</h2>
        </div>
      </div>

      <div className="subjects-table-card">
        <table className="subjects-table">
          <thead>
            <tr>
              <th>Subject ID</th>
              <th>Initials</th>
              <th>Study</th>
              <th>Site</th>
              <th>Status</th>
              <th>Enrollment Date</th>
              <th>Last Visit</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredSubjects.map((subject) => (
              <tr key={subject.id}>
                <td>{subject.id}</td>
                <td>{subject.initials}</td>
                <td>{subject.study}</td>
                <td>{displaySite(subject.site)}</td>

                <td>
                  <span
                    className={`status-badge ${subject.status.toLowerCase()}`}
                  >
                    {subject.status}
                  </span>
                </td>
                <td>{subject.enrollmentDate}</td>
                <td>{subject.lastVisit}</td>
                <td>
                  <div className="action-buttons">
                    <FaEye
                      className="action-icon"
                      title="View"
                      onClick={() => handleView(subject)}
                    />

                    <FaFileAlt
                      className="action-icon"
                      title="Profile"
                      onClick={() => handleProfile(subject)}
                    />

                    <FaEllipsisV
                      className="action-icon"
                      title="More"
                      onClick={() => handleMore(subject)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Add Subject</h3>

            <input
              placeholder="Subject ID"
              value={newSubject.id}
              onChange={(e) =>
                setNewSubject({
                  ...newSubject,
                  id: e.target.value,
                })
              }
            />

            <input
              placeholder="Initials"
              value={newSubject.initials}
              onChange={(e) =>
                setNewSubject({
                  ...newSubject,
                  initials: e.target.value,
                })
              }
            />

            <select
              value={newSubject.study}
              onChange={(e) =>
                setNewSubject({
                  ...newSubject,
                  study: e.target.value,
                  site: getSubjectStudyDefaults(e.target.value).site,
                })
              }
            >
              <option value="">Select active study</option>
              {studyOptions.map((study) => (
                <option key={study.code} value={study.code}>
                  {study.code} — {study.name || study.protocol || "Untitled"}
                </option>
              ))}
            </select>

            <input
              placeholder="Principal Investigator"
              value={selectedStudyDefaults.pi || "—"}
              readOnly
              aria-readonly="true"
            />

            <input
              placeholder="Site"
              value={selectedStudyDefaults.siteDisplay || "—"}
              readOnly
              aria-readonly="true"
            />
            <input
              type="date"
              value={newSubject.enrollmentDate}
              onChange={(e) =>
                setNewSubject({
                  ...newSubject,
                  enrollmentDate: e.target.value,
                })
              }
            />
            <input
              placeholder="Last Visit"
              value={newSubject.lastVisit}
              onChange={(e) =>
                setNewSubject({
                  ...newSubject,
                  lastVisit: e.target.value,
                })
              }
            />

            <select
              value={newSubject.status}
              onChange={(e) =>
                setNewSubject({
                  ...newSubject,
                  status: e.target.value,
                })
              }
            >
              <option>Screening</option>
              <option>Enrolled</option>
              <option>Completed</option>
              <option>Withdrawn</option>
            </select>

            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)}>Cancel</button>

              <button onClick={handleAddSubject}>Save Subject</button>
            </div>
          </div>
        </div>
      )}
      {showViewModal && selectedSubject && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Subject Details - {selectedSubject.id}</h3>

            <div className="subject-view-grid">
              <div className="detail-card">
                <span className="detail-label">Subject ID</span>

                <span className="detail-value">{selectedSubject.id}</span>
              </div>
              <div className="detail-card">
                <span className="detail-label">Initials</span>

                <span className="detail-value">{selectedSubject.initials}</span>
              </div>

              <div className="detail-card">
                <span className="detail-label">Study</span>

                <span className="detail-value">{selectedSubject.study}</span>
              </div>
              <div className="detail-card">
                <span className="detail-label">Site</span>

                <span className="detail-value">
                  {displaySite(selectedSubject.site)}
                </span>
              </div>

              <div className="detail-card">
                <span className="detail-label">Status</span>

                <span
                  className={`status-badge ${selectedSubject.status.toLowerCase()}`}
                >
                  {selectedSubject.status}
                </span>
              </div>
              <div className="detail-card">
                <span className="detail-label">Enrollment Data</span>

                <span className="detail-value">
                  {selectedSubject.enrollmentDate}
                </span>
              </div>

              <div className="detail-card">
                <span className="detail-label">Last Visit</span>

                <span className="detail-value">
                  {selectedSubject.lastVisit || "Not Available"}
                </span>
              </div>
            </div>

            <div className="modal-buttons">
              <button onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PISubjectsDashboard;
