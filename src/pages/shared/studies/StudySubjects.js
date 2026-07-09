import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiFolder, FiPlus } from "react-icons/fi";
import DocumentFolderManager from "../../../Components/common/DocumentFolderManager";
import { canAddSubject } from "../../../utils/contentAccess";
import { getCurrentUser } from "../../../services/roleService";
import "./StudySubjects.css";

const SUBJECTS_STORAGE_KEY = "subjectsByStudy";
const SELECTED_SUBJECT_STORAGE_KEY = "selectedSubject";

const emptySubjectForm = {
  id: "",
  initials: "",
  status: "",
  screeningDate: "",
  enrollmentDate: "",
  currentVisit: "",
  pi: "",
  site: "",
};

function readStorage(key, fallbackValue) {
  try {
    const savedValue = localStorage.getItem(key);

    if (!savedValue) {
      return fallbackValue;
    }

    return JSON.parse(savedValue) ?? fallbackValue;
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallbackValue;
  }
}

function writeStorage(key, value, eventName) {
  localStorage.setItem(key, JSON.stringify(value));

  if (eventName) {
    window.dispatchEvent(
      new CustomEvent(eventName, {
        detail: value,
      })
    );
  }
}

function normalizeValue(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function getSubjectContextKey(studyId, subjectId) {
  return `subject-${studyId || "unknown-study"}-${subjectId || "unknown-subject"}`;
}

function getSearchableSubjectText(subject) {
  if (!subject || typeof subject !== "object") {
    return "";
  }

  const searchableValues = [];

  const addValue = (value) => {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(addValue);
      return;
    }

    if (typeof value === "object") {
      Object.values(value).forEach(addValue);
      return;
    }

    searchableValues.push(String(value));
  };

  Object.values(subject).forEach(addValue);

  return searchableValues.join(" ").toLowerCase();
}

function getSubjectsForStudy(subjectsByStudy, studyId) {
  if (!subjectsByStudy || typeof subjectsByStudy !== "object") {
    return [];
  }

  const exactMatch = subjectsByStudy[studyId];

  if (Array.isArray(exactMatch)) {
    return exactMatch;
  }

  const normalizedStudyId = normalizeValue(studyId);

  const matchingKey = Object.keys(subjectsByStudy).find(
    (key) => normalizeValue(key) === normalizedStudyId
  );

  if (matchingKey && Array.isArray(subjectsByStudy[matchingKey])) {
    return subjectsByStudy[matchingKey];
  }

  return [];
}

function getSubjectDetailCards(subject) {
  return [
    {
      label: "Initials",
      value: subject?.initials || "—",
    },
    {
      label: "Status",
      value: subject?.status || "—",
    },
    {
      label: "Principal Investigator",
      value: subject?.pi || "—",
    },
    {
      label: "Site",
      value: subject?.site || "—",
    },
    {
      label: "Screening Date",
      value: subject?.screeningDate || "—",
    },
    {
      label: "Enrollment Date",
      value: subject?.enrollmentDate || "—",
    },
    {
      label: "Current Visit",
      value: subject?.currentVisit || "—",
    },
  ];
}

function StudySubjects({
  setActiveTab,
  showTable = false,
  showBackButton = true,
}) {
  const params = useParams();
  const navigate = useNavigate();

  const studyId = String(
    params.id || params.studyId || params.code || ""
  ).trim();

  const [subjectsByStudy, setSubjectsByStudy] = useState(() =>
    readStorage(SUBJECTS_STORAGE_KEY, {})
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [newSubject, setNewSubject] = useState(emptySubjectForm);

  const currentUser = getCurrentUser();
  const showAddSubject = canAddSubject(currentUser);

  useEffect(() => {
    const refreshSubjects = () => {
      setSubjectsByStudy(readStorage(SUBJECTS_STORAGE_KEY, {}));
    };

    window.addEventListener("subjects-updated", refreshSubjects);
    window.addEventListener("storage", refreshSubjects);

    return () => {
      window.removeEventListener("subjects-updated", refreshSubjects);
      window.removeEventListener("storage", refreshSubjects);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "selectedStudy",
      JSON.stringify({
        code: studyId,
      })
    );
  }, [studyId]);

  useEffect(() => {
    const savedSubject = readStorage(SELECTED_SUBJECT_STORAGE_KEY, null);

    if (
      savedSubject?.id &&
      normalizeValue(savedSubject.studyId) === normalizeValue(studyId)
    ) {
      setSelectedSubjectId(savedSubject.id);
      return;
    }

    setSelectedSubjectId(null);
  }, [studyId]);

  const subjectsData = useMemo(() => {
    return getSubjectsForStudy(subjectsByStudy, studyId);
  }, [studyId, subjectsByStudy]);

  const filteredSubjects = useMemo(() => {
    const normalizedSearchTerm = normalizeValue(searchTerm);

    if (!normalizedSearchTerm) {
      return subjectsData;
    }

    return subjectsData.filter((subject) => {
      const searchableText = getSearchableSubjectText(subject);

      return searchableText.includes(normalizedSearchTerm);
    });
  }, [searchTerm, subjectsData]);

  const selectedSubject = useMemo(() => {
    if (!selectedSubjectId) {
      return null;
    }

    return (
      subjectsData.find(
        (subject) =>
          normalizeValue(subject.id) === normalizeValue(selectedSubjectId)
      ) || null
    );
  }, [selectedSubjectId, subjectsData]);

  const saveSubjects = (updatedSubjectsByStudy) => {
    setSubjectsByStudy(updatedSubjectsByStudy);

    writeStorage(
      SUBJECTS_STORAGE_KEY,
      updatedSubjectsByStudy,
      "subjects-updated"
    );
  };

  const handleAddSubject = () => {
    const subjectId = newSubject.id.trim();

    if (!studyId || !subjectId) {
      window.alert("Subject ID is required.");
      return;
    }

    const subjectAlreadyExists = subjectsData.some(
      (subject) =>
        normalizeValue(subject.id) === normalizeValue(subjectId)
    );

    if (subjectAlreadyExists) {
      window.alert("A subject with this Subject ID already exists.");
      return;
    }

    const subjectToAdd = {
      ...newSubject,
      id: subjectId,
      initials: newSubject.initials.trim(),
      pi: newSubject.pi.trim(),
      site: newSubject.site.trim(),
      studyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveSubjects({
      ...subjectsByStudy,
      [studyId]: [...subjectsData, subjectToAdd],
    });

    setNewSubject(emptySubjectForm);
    setShowSubjectModal(false);
  };

  const openSubjectFolder = (subject, shouldNavigate = false) => {
    localStorage.setItem(
      SELECTED_SUBJECT_STORAGE_KEY,
      JSON.stringify({
        ...subject,
        studyId,
      })
    );

    setSelectedSubjectId(subject.id);

    if (shouldNavigate && studyId) {
      navigate(
        `/study-dashboard/${encodeURIComponent(
          studyId
        )}?tab=Subjects&subject=${encodeURIComponent(subject.id)}`
      );
    }
  };

  const closeSubjectFolder = () => {
    localStorage.removeItem(SELECTED_SUBJECT_STORAGE_KEY);
    setSelectedSubjectId(null);
    setSearchTerm("");
  };

  if (selectedSubject) {
    const subjectContextKey = getSubjectContextKey(
      studyId,
      selectedSubject.id
    );

    const subjectDetailCards = getSubjectDetailCards(selectedSubject);

    return (
      <div className="subjects-module">
        <div className="subject-details-header">
          <button
            type="button"
            className="back-btn"
            onClick={closeSubjectFolder}
          >
            <FiArrowLeft />
            Back to Subjects
          </button>

          <div className="subject-details-title-row">
            <h2>{selectedSubject.id}</h2>
          </div>

          <div className="subject-details-grid">
            {subjectDetailCards.map((detail) => (
              <div
                key={detail.label}
                className="subject-details-card"
              >
                <span>{detail.label}</span>
                <strong>{detail.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="subjects-document-manager">
          <DocumentFolderManager
            key={subjectContextKey}
            sectionId="subjects"
            contextKey={subjectContextKey}
            title={selectedSubject.id}
            studyCode={studyId}
            subjectId={selectedSubject.id}
            layout="explorer"
            onBackToSubjects={closeSubjectFolder}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="subjects-module">
      {showBackButton && typeof setActiveTab === "function" && (
        <button
          type="button"
          className="back-btn"
          onClick={() => setActiveTab("Overview")}
        >
          <FiArrowLeft />
          Back
        </button>
      )}

      <div className="subjects-header">
        <div>
          <h2>Subjects</h2>

          <p className="subject-details-subtitle">
            Manage subjects for the selected study.
          </p>
        </div>

        {showAddSubject && (
          <button
            type="button"
            className="add-subject-btn"
            onClick={() => setShowSubjectModal(true)}
          >
            <FiPlus />
            Add Subject
          </button>
        )}
      </div>

      <div className="subject-search-bar">
        <input
          type="search"
          placeholder="Search by Subject ID, initials, PI, site, status, visit, date..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          aria-label="Search subjects"
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
              </tr>
            </thead>

            <tbody>
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <tr key={subject.id}>
                    <td>{subject.id || "—"}</td>
                    <td>{subject.initials || "—"}</td>
                    <td>{subject.status || "—"}</td>
                    <td>{subject.pi || "—"}</td>
                    <td>{subject.site || "—"}</td>
                    <td>{subject.screeningDate || "—"}</td>
                    <td>{subject.enrollmentDate || "—"}</td>
                    <td>{subject.currentVisit || "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "#64748b",
                    }}
                  >
                    No matching subjects found.
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
                  onClick={() => openSubjectFolder(subject)}
                >
                  <FiFolder className="subjects-folder-icon" />

                  <span className="subjects-folder-name">
                    {subject.id || "Unnamed Subject"}
                  </span>

                  <small>{subject.status || "No status"}</small>
                </button>
              ))}
            </div>
          ) : (
            <p className="subjects-explorer-empty">
              No matching subjects found.
            </p>
          )}
        </div>
      )}

      {showSubjectModal && (
        <div className="subject-modal-overlay">
          <div className="subject-modal">
            <h3>Add New Subject</h3>

            <label htmlFor="subject-id">Subject ID</label>
            <input
              id="subject-id"
              placeholder="Subject ID"
              value={newSubject.id}
              onChange={(event) =>
                setNewSubject({
                  ...newSubject,
                  id: event.target.value,
                })
              }
            />

            <label htmlFor="subject-initials">Initials</label>
            <input
              id="subject-initials"
              placeholder="Initials"
              value={newSubject.initials}
              onChange={(event) =>
                setNewSubject({
                  ...newSubject,
                  initials: event.target.value,
                })
              }
            />

            <label htmlFor="subject-pi">Principal Investigator</label>
            <input
              id="subject-pi"
              placeholder="Principal Investigator"
              value={newSubject.pi}
              onChange={(event) =>
                setNewSubject({
                  ...newSubject,
                  pi: event.target.value,
                })
              }
            />

            <label htmlFor="subject-site">Site</label>
            <input
              id="subject-site"
              placeholder="Site"
              value={newSubject.site}
              onChange={(event) =>
                setNewSubject({
                  ...newSubject,
                  site: event.target.value,
                })
              }
            />

            <div className="form-group">
              <label htmlFor="subject-screening-date">
                Screening Date
              </label>

              <input
                id="subject-screening-date"
                type="date"
                value={newSubject.screeningDate}
                onChange={(event) =>
                  setNewSubject({
                    ...newSubject,
                    screeningDate: event.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject-enrollment-date">
                Enrollment Date
              </label>

              <input
                id="subject-enrollment-date"
                type="date"
                value={newSubject.enrollmentDate}
                onChange={(event) =>
                  setNewSubject({
                    ...newSubject,
                    enrollmentDate: event.target.value,
                  })
                }
              />
            </div>

            <label htmlFor="subject-status">Status</label>
            <select
              id="subject-status"
              value={newSubject.status}
              onChange={(event) =>
                setNewSubject({
                  ...newSubject,
                  status: event.target.value,
                })
              }
            >
              <option value="">Select</option>
              <option value="Screening">Screening</option>
              <option value="Enrolled">Enrolled</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Withdrawn">Withdrawn</option>
              <option value="Dropout">Dropout</option>
            </select>

            <label htmlFor="subject-current-visit">Current Visit</label>
            <select
              id="subject-current-visit"
              value={newSubject.currentVisit}
              onChange={(event) =>
                setNewSubject({
                  ...newSubject,
                  currentVisit: event.target.value,
                })
              }
            >
              <option value="">Select</option>
              <option value="Screening">Screening</option>
              <option value="Enrollment">Enrollment</option>
              <option value="Visit 1">Visit 1</option>
              <option value="Visit 2">Visit 2</option>
              <option value="Visit 3">Visit 3</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Completed">Completed</option>
            </select>

            <div className="modal-actions">
              <button type="button" onClick={handleAddSubject}>
                Add Subject
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSubjectModal(false);
                  setNewSubject(emptySubjectForm);
                }}
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