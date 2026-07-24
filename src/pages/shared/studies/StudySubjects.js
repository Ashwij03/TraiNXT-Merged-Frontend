import { readStorage } from "../../../utils/storageHelpers";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiFolder,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import DocumentFolderManager from "../../../components/common/DocumentFolderManager";
import {
  canAddSubject,
  canEditSubjectContent,
} from "../../../utils/contentAccess";
import {
  getCurrentUser,
  getEffectiveRole,
  ROLE_LABELS,
} from "../../../services/roleService";
import { notifySubjectCreated } from "../../../services/notificationService";
import {
  deriveSubjectLifecycleStatus,
  SUBJECT_TERMINAL_STATES,
} from "../../../utils/subjectLifecycle";
import { syncSubjectSchedules } from "../../../services/visitScheduleService";
import {
  getStudyByCode,
  getSubjectStudyDefaults,
  createSubject,
  updateSubject,
  COMPLETED_STUDY_SUBJECT_CREATION_MESSAGE,
  COMPLETED_STUDY_SUBJECT_EDIT_MESSAGE,
  getStudies,
} from "../../../services/studyService";
import { STUDY_STATUS_COMPLETED } from "../../../constants/studyStatus";
import { resolveSiteDisplay } from "../../../utils/siteDisplay";
import "./StudySubjects.css";

const SUBJECTS_STORAGE_KEY = "subjectsByStudy";
const SELECTED_SUBJECT_STORAGE_KEY = "selectedSubject";
const SUBJECTS_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

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

function getSubjectDetailCards(subject, siteSources = []) {
  const siteDisplay = subject?.site
    ? resolveSiteDisplay(subject.site, {
        sources: siteSources,
        fallback: subject.site || "—"
      })
    : "—";

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
      label: "Study ID",
      value: subject?.studyId || "—",
    },
    {
      label: "Site",
      value: siteDisplay,
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
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const currentUser = getCurrentUser();
  const showAddSubject = canAddSubject(currentUser);
  const canModifySubjects = canEditSubjectContent(currentUser);

  /*
    Item 7 (Stage 5A): resolve the authoritative study for this page so the
    UI guard can react to study status changes made elsewhere (edit-study
    dialog, other tabs). Refreshed on `studies-updated`.
  */
  const [currentStudy, setCurrentStudy] = useState(() =>
    studyId ? getStudyByCode(studyId) : null
  );

  useEffect(() => {
    setCurrentStudy(studyId ? getStudyByCode(studyId) : null);

    const refreshStudy = () => {
      setCurrentStudy(studyId ? getStudyByCode(studyId) : null);
    };

    window.addEventListener("studies-updated", refreshStudy);
    window.addEventListener("sponsor-data-updated", refreshStudy);

    return () => {
      window.removeEventListener("studies-updated", refreshStudy);
      window.removeEventListener("sponsor-data-updated", refreshStudy);
    };
  }, [studyId]);

  const isStudyCompleted =
    currentStudy?.status === STUDY_STATUS_COMPLETED;

  const inheritedSubjectFields = getSubjectStudyDefaults(studyId);

  const getStudyDerivedSubjectFormFields = () => {
    const latestDefaults = getSubjectStudyDefaults(studyId);

    return {
      pi: latestDefaults.pi || "",
      site: latestDefaults.site || "",
    };
  };

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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSubjects.length / pageSize)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize, studyId]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedSubjects = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSubjects.slice(startIndex, startIndex + pageSize);
  }, [filteredSubjects, currentPage, pageSize]);

  const pageStart =
    filteredSubjects.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(
    currentPage * pageSize,
    filteredSubjects.length
  );

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

  const handleSaveSubject = () => {
    const subjectId = newSubject.id.trim();

    if (!studyId || !subjectId) {
      window.alert("Subject ID is required.");
      return;
    }

    const isEditing = Boolean(editingSubjectId);

    /*
      Item 7 (extension): Completed-study subject guard.
      Both NEW subject creation and editing an existing subject are
      blocked once the study is Completed.
      Validation happens BEFORE any subject mutation.
    */
    if (isEditing) {
      const authoritativeStudy = getStudyByCode(studyId);
      if (
        authoritativeStudy &&
        authoritativeStudy.status === STUDY_STATUS_COMPLETED
      ) {
        window.alert(COMPLETED_STUDY_SUBJECT_EDIT_MESSAGE);
        return;
      }
    } else {
      const authoritativeStudy = getStudyByCode(studyId);
      if (
        authoritativeStudy &&
        authoritativeStudy.status === STUDY_STATUS_COMPLETED
      ) {
        window.alert(COMPLETED_STUDY_SUBJECT_CREATION_MESSAGE);
        return;
      }
    }

    const duplicateExists = subjectsData.some(
      (subject) =>
        normalizeValue(subject.id) === normalizeValue(subjectId) &&
        normalizeValue(subject.id) !== normalizeValue(editingSubjectId || "")
    );

    if (duplicateExists) {
      window.alert("A subject with this Subject ID already exists.");
      return;
    }

    const now = new Date().toISOString();

    let updatedSubjectsForStudy;

    // Item 21: manual status control is limited to terminal workflow actions
    // (Withdrawn / Dropout). Any other value is ignored and the authoritative
    // status is derived from the subject's actual lifecycle fields (screening
    // date, enrollment date, current visit, per-subject visit records). This
    // prevents an arbitrary manual override from silently regressing an
    // Ongoing subject back to Enrolled, marking Completed without real
    // completion evidence, etc.
    const requestedManualStatus = SUBJECT_TERMINAL_STATES.includes(newSubject.status)
      ? newSubject.status
      : "";

    if (isEditing) {
      updatedSubjectsForStudy = subjectsData.map((subject) => {
        if (normalizeValue(subject.id) !== normalizeValue(editingSubjectId)) {
          return subject;
        }

        const merged = {
          ...subject,
          ...newSubject,
          id: subjectId,
          initials: newSubject.initials.trim(),
          pi: newSubject.pi.trim(),
          site: newSubject.site.trim(),
          studyId,
          updatedAt: now,
        };

        const derived = deriveSubjectLifecycleStatus(
          { ...merged, status: "" },
          { studyId }
        );

        return {
          ...merged,
          status: requestedManualStatus || derived || merged.status || "",
        };
      });
      
      saveSubjects({
        ...subjectsByStudy,
        [studyId]: updatedSubjectsForStudy,

      });

      const editedSubject = updatedSubjectsForStudy.find(
        (subject) => normalizeValue(subject.id) === normalizeValue(subjectId)
      );

      /*
        Item 7 (extension): route the authoritative subject-edit write
        through the shared service, which re-checks the Completed-study
        rule before mutating `subjectsByStudy`. This is the defense-in-depth
        backstop for the UI guard above.
      */
      try {
        updateSubject(studyId, editingSubjectId, editedSubject);
      } catch (error) {
        window.alert(
          (error && error.message) || COMPLETED_STUDY_SUBJECT_EDIT_MESSAGE
        );
        return;
      }

      setSubjectsByStudy((current) => ({
        ...current,
        [studyId]: updatedSubjectsForStudy,
      }));

      // Push the updated Screening/Enrollment dates into the shared visit
      // schedule store so this change is reflected on every role's
      // "Visit Calendar & Upcoming Visits" widget (Admin, Site Staff, PI).
      syncSubjectSchedules(studyId, subjectId, editedSubject);
    } else {
      const studyDerivedFields = getStudyDerivedSubjectFormFields();
      const baseSubject = {
        ...newSubject,
        id: subjectId,
        initials: newSubject.initials.trim(),
        pi: studyDerivedFields.pi,
        site: studyDerivedFields.site,
        studyId,
        createdAt: now,
        updatedAt: now,
      };

      const derived = deriveSubjectLifecycleStatus(
        { ...baseSubject, status: "" },
        { studyId }
      );

      const subjectToAdd = {
        ...baseSubject,
        status: requestedManualStatus || derived || "",
      };

      /*
        Item 7 (Stage 5A): route the authoritative new-subject write through
        the shared service, which re-checks the Completed-study rule before
        mutating `subjectsByStudy`. This is the defense-in-depth backstop for
        the UI guard above.
      */
      let createdSubject;

      try {
        createdSubject = createSubject(studyId, subjectToAdd);
      } catch (error) {
        window.alert(
          (error && error.message) ||
            COMPLETED_STUDY_SUBJECT_CREATION_MESSAGE
        );
        return;
      }

      // Keep local component state consistent with what the shared service
      // just persisted so the table renders immediately without waiting for
      // the `subjects-updated` event dispatch to round-trip through storage.
      setSubjectsByStudy((current) => ({
        ...current,
        [studyId]: [...subjectsData, createdSubject],
      }));

      // Push the new subject's Screening/Enrollment dates into the shared
      // visit schedule store so this new subject immediately shows up on
      // every role's "Visit Calendar & Upcoming Visits" widget (Admin,
      // Site Staff, PI) — previously only the SubjectFolderWorkspace flow
      // did this, so subjects added from this page never appeared there.
      syncSubjectSchedules(studyId, subjectId, createdSubject);

      // notifySubjectCreated expects { subjectId, studyCode, addedByRole },
      // while this page's own subject record uses { id, studyId } — adapt the
      // field names here rather than renaming the stored record shape used by
      // every other subject reader in the app.
      notifySubjectCreated({
        subjectId,
        studyCode: studyId,
        addedByRole:
          ROLE_LABELS[getEffectiveRole(currentUser)] ||
          getEffectiveRole(currentUser),
      });
    }

    setNewSubject(emptySubjectForm);
    setEditingSubjectId(null);
    setShowSubjectModal(false);
  };

  const openAddSubjectModal = () => {
    // Item 7 (Stage 5A): prevent opening the Add Subject flow at all when
    // the target study is Completed. Shared service still enforces this
    // as defense in depth if the flow is somehow reached.
    if (isStudyCompleted) {
      window.alert(COMPLETED_STUDY_SUBJECT_CREATION_MESSAGE);
      return;
    }

    setEditingSubjectId(null);
    setNewSubject({
      ...emptySubjectForm,
      ...getStudyDerivedSubjectFormFields(),
    });
    setShowSubjectModal(true);
  };

  const openEditSubjectModal = (subject) => {
    if (!subject) {
      return;
    }

    // Item 7 (extension): prevent opening the Edit Subject flow at all when
    // the target study is Completed. Shared service still enforces this
    // as defense in depth if the flow is somehow reached.
    if (isStudyCompleted) {
      window.alert(COMPLETED_STUDY_SUBJECT_EDIT_MESSAGE);
      return;
    }

    setEditingSubjectId(subject.id);
    setNewSubject({
      id: subject.id || "",
      initials: subject.initials || "",
      status: subject.status || "",
      screeningDate: subject.screeningDate || "",
      enrollmentDate: subject.enrollmentDate || "",
      currentVisit: subject.currentVisit || "",
      pi: subject.pi || "",
      site: subject.site || "",
    });
    setShowSubjectModal(true);
  };

  const handleDeleteSubject = (subject) => {
    if (!subject) {
      return;
    }

    const confirmed = window.confirm(
      `Delete subject ${subject.id}? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    const updatedSubjectsForStudy = subjectsData.filter(
      (item) => normalizeValue(item.id) !== normalizeValue(subject.id)
    );

    saveSubjects({
      ...subjectsByStudy,
      [studyId]: updatedSubjectsForStudy,
    });

    if (
      selectedSubjectId &&
      normalizeValue(selectedSubjectId) === normalizeValue(subject.id)
    ) {
      localStorage.removeItem(SELECTED_SUBJECT_STORAGE_KEY);
      setSelectedSubjectId(null);
    }
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

    const subjectDetailCards = getSubjectDetailCards(
      selectedSubject,
      getStudies()
    );

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
            onClick={openAddSubjectModal}
            disabled={isStudyCompleted}
            aria-disabled={isStudyCompleted}
            title={
              isStudyCompleted
                ? COMPLETED_STUDY_SUBJECT_CREATION_MESSAGE
                : undefined
            }
          >
            <FiPlus />
            Add Subject
          </button>
        )}
      </div>

      <div className="subject-search-bar">
        <input
          id="subject-search"
          name="subjectSearch"
          type="search"
          placeholder="Search by Subject ID, initials, PI, site, status, visit, date..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          aria-label="Search subjects"
          autoComplete="off"
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
                {canModifySubjects && <th>Actions</th>}
              </tr>
            </thead>

            <tbody>
              {paginatedSubjects.length > 0 ? (
                paginatedSubjects.map((subject) => (
                  <tr key={subject.id}>
                    <td>{subject.id || "—"}</td>
                    <td>{subject.initials || "—"}</td>
                    <td>{subject.status || "—"}</td>
                    <td>{subject.pi || "—"}</td>
                    <td>
                      {subject.site
                        ? resolveSiteDisplay(subject.site, {
                            sources: getStudies(),
                            fallback: subject.site
                          })
                        : "—"}
                    </td>
                    <td>{subject.screeningDate || "—"}</td>
                    <td>{subject.enrollmentDate || "—"}</td>
                    <td>{subject.currentVisit || "—"}</td>
                    {canModifySubjects && (
                      <td>
                        <div className="subject-row-actions">
                          <button
                            type="button"
                            className="subject-action-btn subject-action-edit"
                            onClick={() => openEditSubjectModal(subject)}
                            disabled={isStudyCompleted}
                            aria-disabled={isStudyCompleted}
                            aria-label={`Edit subject ${subject.id}`}
                            title={
                              isStudyCompleted
                                ? COMPLETED_STUDY_SUBJECT_EDIT_MESSAGE
                                : "Edit subject"
                            }
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            type="button"
                            className="subject-action-btn subject-action-delete"
                            onClick={() => handleDeleteSubject(subject)}
                            aria-label={`Delete subject ${subject.id}`}
                            title="Delete subject"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={canModifySubjects ? 9 : 8}
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
              {paginatedSubjects.map((subject) => (
                <div key={subject.id} className="subjects-folder-card">
                  <button
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

                  {canModifySubjects && (
                    <div className="subjects-folder-actions">
                      <button
                        type="button"
                        className="subject-action-btn subject-action-edit"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditSubjectModal(subject);
                        }}
                        disabled={isStudyCompleted}
                        aria-disabled={isStudyCompleted}
                        aria-label={`Edit subject ${subject.id}`}
                        title={
                          isStudyCompleted
                            ? COMPLETED_STUDY_SUBJECT_EDIT_MESSAGE
                            : "Edit subject"
                        }
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        className="subject-action-btn subject-action-delete"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteSubject(subject);
                        }}
                        aria-label={`Delete subject ${subject.id}`}
                        title="Delete subject"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="subjects-explorer-empty">
              No matching subjects found.
            </p>
          )}
        </div>
      )}

      {filteredSubjects.length > 0 && (
        <div className="subjects-pagination">
          <div className="subjects-pagination-info">
            Showing {pageStart}-{pageEnd} of {filteredSubjects.length} subjects
          </div>

          <div className="subjects-pagination-controls">
            <label className="subjects-page-size">
              Rows
              <select
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                aria-label="Rows per page"
              >
                {SUBJECTS_PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="subjects-pagination-btn"
              onClick={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <FiChevronLeft />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  className={`subjects-pagination-btn ${
                    currentPage === pageNumber ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              )
            )}

            <button
              type="button"
              className="subjects-pagination-btn"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}

      {showSubjectModal && (
        <div className="subject-modal-overlay">
          <div className="subject-modal">
            <h3>{editingSubjectId ? "Edit Subject" : "Add New Subject"}</h3>

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
            {editingSubjectId ? (
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
            ) : (
              <input
                id="subject-pi"
                placeholder="Principal Investigator"
                value={inheritedSubjectFields.pi || "—"}
                readOnly
                aria-readonly="true"
              />
            )}

            <label htmlFor="subject-site">Site</label>
            {editingSubjectId ? (
              (() => {
                const availableSites = (getStudies() || []).filter(
                  (study) =>
                    study && (study.siteNumber || study.site || study.location)
                );

                if (availableSites.length > 0) {
                  return (
                    <select
                      id="subject-site"
                      value={newSubject.site}
                      onChange={(event) =>
                        setNewSubject({
                          ...newSubject,
                          site: event.target.value,
                        })
                      }
                    >
                      <option value="">Select Site</option>
                      {availableSites.map((study) => {
                        const number =
                          study.siteNumber ||
                          study.number ||
                          study.siteNo ||
                          "";
                        const name =
                          study.site ||
                          study.siteName ||
                          study.location ||
                          "";
                        const optionValue = number || name;
                        const label =
                          number && name
                            ? `${number} — ${name}`
                            : number || name;
                        return (
                          <option
                            key={`${study.id || study.code || optionValue}`}
                            value={optionValue}
                          >
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  );
                }

                return (
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
                );
              })()
            ) : (
                <input
                  id="subject-site"
                  placeholder="Site"
                  value={inheritedSubjectFields.siteDisplay || "—"}
                  readOnly
                  aria-readonly="true"
                />
            )}

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
            {/* Item 21: normal lifecycle stages (Screened / Enrolled / Ongoing /
                Completed) are derived automatically from the subject's actual
                screening date, enrollment date, current visit, and visit
                records. The manual control here is limited to terminal
                workflow actions (Withdrawn / Dropout) plus "Auto (derived)",
                which clears any manual override so the canonical derivation
                applies. */}
            <select
              id="subject-status"
              value={
                SUBJECT_TERMINAL_STATES.includes(newSubject.status)
                  ? newSubject.status
                  : ""
              }
              onChange={(event) =>
                setNewSubject({
                  ...newSubject,
                  status: event.target.value,
                })
              }
            >
              <option value="">Auto (derived from lifecycle data)</option>
              <option value="Withdrawn">Withdrawn</option>
              <option value="Dropout">Dropout</option>
            </select>
            <small
              className="subject-status-derived-hint"
              style={{ display: "block", marginTop: "4px", color: "#64748b" }}
            >
              Derived status:{" "}
              {deriveSubjectLifecycleStatus(
                { ...newSubject, id: newSubject.id, studyId, status: "" },
                { studyId }
              ) || "—"}
            </small>

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
              <button type="button" onClick={handleSaveSubject}>
                {editingSubjectId ? "Save Changes" : "Add Subject"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSubjectModal(false);
                  setNewSubject(emptySubjectForm);
                  setEditingSubjectId(null);
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

