import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { FiFolder } from "react-icons/fi";
import SubjectProfile from "../subjects/SubjectProfile";
import { canAddSubject } from "../../../utils/contentAccess";
import { getCurrentUser } from "../../../services/roleService";
import "./StudySubjects.css";

function StudySubjects({ setActiveTab, showTable = false, showBackButton = true }) {
  const { id: studyId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showModal, setShowModal] = useState(false);

  const [newSubject, setNewSubject] = useState({
    id: "",
    initials: "",
    status: "Screening",
    screeningDate: "",
    enrollmentDate: "",
    currentVisit: "Screening",
    pi: "",
    site: ""
  });

  const defaultSubjectsByStudy = {
    "747-303": [
      {
        id: "SUB-001",
        initials: "RA",
        status: "Ongoing",
        screeningDate: "2026-06-01",
        enrollmentDate: "2026-06-05",
        currentVisit: "Visit 3",
        pi: "Dr. Richard Thomas",
        site: "Apollo Hospital",
        studyId: "747-303"
      }
    ],
    "05151": [
      {
        id: "SUB-002",
        initials: "AK",
        status: "Screening",
        screeningDate: "2026-06-03",
        enrollmentDate: "-",
        currentVisit: "Screening",
        pi: "Dr. Richard Thomas",
        site: "Apollo Hospital",
        studyId: "05151"
      }
    ]
  };

  const [subjectsByStudy, setSubjectsByStudy] =
    useState(() => {
      const storedSubjectsByStudy =
        localStorage.getItem("subjectsByStudy");

      if (storedSubjectsByStudy) {
        return JSON.parse(storedSubjectsByStudy);
      }

      return defaultSubjectsByStudy;
    });

  const [searchTerm, setSearchTerm] =
    useState("");

  const [activeSubject, setActiveSubject] = useState(null);
  const currentUser = getCurrentUser();
  const showAddSubject = canAddSubject(currentUser);

  const subjectsData = useMemo(() => {
    return Array.isArray(subjectsByStudy[studyId])
      ? subjectsByStudy[studyId]
      : [];
  }, [subjectsByStudy, studyId]);

  const filteredSubjects = useMemo(() => {
    return subjectsData.filter((subject) =>
      [
        subject.id,
        subject.initials,
        subject.pi,
        subject.site,
        subject.status
      ]
        .filter(Boolean)
        .some((value) =>
          value
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
    );
  }, [subjectsData, searchTerm]);

  useEffect(() => {
    localStorage.setItem(
      "subjectsByStudy",
      JSON.stringify(subjectsByStudy)
    );
  }, [subjectsByStudy]);

  useEffect(() => {
    const selectedStudy =
      JSON.parse(localStorage.getItem("selectedStudy")) || null;

    if (!selectedStudy || selectedStudy.code !== studyId) {
      localStorage.setItem(
        "selectedStudy",
        JSON.stringify({ code: studyId })
      );
    }
  }, [studyId]);

  /*
useEffect(() => {
  const subjectParam = searchParams.get("subject");

  if (!subjectParam) {
    return;
  }

  const matched = subjectsData.find(
    (item) => String(item.id) === String(subjectParam)
  );

  if (matched) {
    setActiveSubject(matched);
  }
}, [searchParams, subjectsData]);
*/

  const handleBackFromSubject = () => {
    setActiveSubject(null);
    setSearchParams((params) => {
      params.delete("subject");
      params.delete("folder");
      return params;
    });
  };

  const handleAddSubject = () => {
    if (!newSubject.id.trim()) {
      return;
    }

    const subjectToAdd = {
      ...newSubject,
      studyId
    };

    setSubjectsByStudy((prev) => ({
      ...prev,
      [studyId]: [
        ...(prev[studyId] || []),
        subjectToAdd
      ]
    }));

    setShowModal(false);

    setNewSubject({
      id: "",
      initials: "",
      status: "Screening",
      screeningDate: "",
      enrollmentDate: "",
      currentVisit: "Screening",
      pi: "",
      site: ""
    });
  };

  /*
if (activeSubject) {
  return (
    <SubjectProfile
      subject={activeSubject}
      studyId={studyId}
      onBack={handleBackFromSubject}
    />
  );
}
*/

  return (
    <div className="subjects-module">
      {showBackButton && (
        <button
          className="back-btn"
          onClick={() =>
            setActiveTab("Overview")
          }
        >
          ← Back
        </button>
      )}

      <div className="subjects-header">
        <h2>
          Subjects
        </h2>

        {showAddSubject && (
          <button
            className="add-subject-btn"
            onClick={() =>
              setShowModal(true)
            }
          >
            + Add Subject
          </button>
        )}
      </div>

      <div className="subject-search-bar">
        <input
          type="text"
          placeholder="Search by Subject ID, PI, Site, Status..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
        />
      </div>

      {showTable ? (
        <div className="subject-table-card">
          <table>
            <thead>
              <tr>
                <th>Subject ID</th>
                <th>Initials</th>
                <th>Status</th>
                <th>PI</th>
                <th>Site</th>
                <th>Screening</th>
                <th>Enrollment</th>
                <th>Current Visit</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <tr key={subject.id}>
                    <td>{subject.id}</td>
                    <td>{subject.initials}</td>
                    <td>{subject.status}</td>
                    <td>{subject.pi}</td>
                    <td>{subject.site}</td>
                    <td>{subject.screeningDate}</td>
                    <td>{subject.enrollmentDate}</td>
                    <td>{subject.currentVisit}</td>

                    <td>
                      <button
                        className="view-btn"
                        onClick={() => {
                          localStorage.setItem(
                            "selectedSubject",
                            JSON.stringify({
                              ...subject,
                              studyId
                            })
                          );

                          setSearchParams((params) => {
                            params.set("subject", subject.id);
                            return params;
                          });
                          setActiveSubject(subject);
                        }}
                      >
                        Open Folder
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "#64748b"
                    }}
                  >
                    No subjects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
      <div className="subjects-explorer">
        <div className="subjects-explorer-toolbar">
          <span className="subjects-explorer-path">Subjects</span>
          <span className="subjects-explorer-count">
            {filteredSubjects.length} item(s)
          </span>
        </div>

        {filteredSubjects.length > 0 ? (
          <div className="subjects-folder-grid">
            {filteredSubjects.map((subject) => (
              <button
                key={subject.id}
                type="button"
                className="subjects-folder-item"
                onClick={() => {
                  localStorage.setItem(
                    "selectedSubject",
                    JSON.stringify({
                      ...subject,
                      studyId
                    })
                  );

                  setSearchParams((params) => {
                    params.set("subject", subject.id);
                    return params;
                  });
                  setActiveSubject(subject);
                }}
              >
                <FiFolder className="subjects-folder-icon" />
                <span className="subjects-folder-name">{subject.id}</span>
                <small>{subject.status || "—"}</small>
              </button>
            ))}
          </div>
        ) : (
          <p className="subjects-explorer-empty">No subjects found</p>
        )}
      </div>
      )}

      {showModal && (
        <div className="subject-modal-overlay">
          <div className="subject-modal">
            <h3>Add New Subject</h3>

            <input
              placeholder="Subject ID"
              value={newSubject.id}
              onChange={(e) =>
                setNewSubject({
                  ...newSubject,
                  id: e.target.value
                })
              }
            />

            <input
              placeholder="Initials"
              value={newSubject.initials}
              onChange={(e) =>
                setNewSubject({
                  ...newSubject,
                  initials: e.target.value
                })
              }
            />

            <input
              placeholder="Principal Investigator"
              value={newSubject.pi}
              onChange={(e) =>
                setNewSubject({
                  ...newSubject,
                  pi: e.target.value
                })
              }
            />

            <input
              placeholder="Site"
              value={newSubject.site}
              onChange={(e) =>
                setNewSubject({
                  ...newSubject,
                  site: e.target.value
                })
              }
            />

            <div className="form-group">
              <label>
                Screening Date
              </label>

              <input
                type="date"
                value={newSubject.screeningDate}
                onChange={(e) =>
                  setNewSubject({
                    ...newSubject,
                    screeningDate: e.target.value
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>
                Enrollment Date
              </label>

              <input
                type="date"
                value={newSubject.enrollmentDate}
                onChange={(e) =>
                  setNewSubject({
                    ...newSubject,
                    enrollmentDate: e.target.value
                  })
                }
              />
            </div>

            <select
              value={newSubject.status}
              onChange={(e) =>
                setNewSubject({
                  ...newSubject,
                  status: e.target.value
                })
              }
            >
              <option>Screening</option>
              <option>Enrolled</option>
              <option>Ongoing</option>
              <option>Completed</option>
              <option>Withdrawn</option>
              <option>Dropout</option>
            </select>

            <div className="modal-actions">
              <button onClick={handleAddSubject}>
                Add Subject
              </button>

              <button
                onClick={() =>
                  setShowModal(false)
                }
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudySubjects;