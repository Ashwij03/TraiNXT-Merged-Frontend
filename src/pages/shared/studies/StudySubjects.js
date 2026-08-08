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
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import SubjectComments from "../subjects/SubjectComments";
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
  SUBJECT_LIFECYCLE_STAGES,
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
  pi: "",
  site: "",
};

// Item 21 (reverted): status is now a fully manual field. The dropdown
// offers every lifecycle stage plus the terminal workflow states, and the
// value chosen is saved as-is — there is no automatic/derived override.
const SUBJECT_STATUS_OPTIONS = [
  ...SUBJECT_LIFECYCLE_STAGES,
  ...SUBJECT_TERMINAL_STATES,
];

function writeStorage(key, value, eventName) {
  localStorage.setItem(key, JSON.stringify(value));

  if (eventName) {
    window.dispatchEvent(
      new CustomEvent(eventName, {
        detail: value,
      }),
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
    (key) => normalizeValue(key) === normalizedStudyId,
  );

  if (matchingKey && Array.isArray(subjectsByStudy[matchingKey])) {
    return subjectsByStudy[matchingKey];
  }

  return [];
}

function getSubjectDetailCards(subject, siteSources = []) {
  const latestSite =
    getSubjectStudyDefaults(subject?.studyId).site || subject?.site;

  const siteDisplay = latestSite
    ? resolveSiteDisplay(latestSite, {
        sources: siteSources,
        fallback: latestSite,
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
      value: getSubjectStudyDefaults(subject?.studyId).pi || subject?.pi || "—",
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
    params.id || params.studyId || params.code || "",
  ).trim();

  const [subjectsByStudy, setSubjectsByStudy] = useState(() =>
    readStorage(SUBJECTS_STORAGE_KEY, {}),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  // Phase-7: Subject Details "Comments" button toggles a shared modal.
  const [showSubjectCommentsModal, setShowSubjectCommentsModal] =
    useState(false);
  const [newSubject, setNewSubject] = useState(emptySubjectForm);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [subjectModalError, setSubjectModalError] = useState("");
  // Phase-7 IMP-MOD-2: replace window.alert/window.confirm with standardized
  // modals so subject flows never use browser-native dialogs.
  const [subjectNotice, setSubjectNotice] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
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
    studyId ? getStudyByCode(studyId) : null,
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

  const isStudyCompleted = currentStudy?.status === STUDY_STATUS_COMPLETED;

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
    const loadSelectedSubject = () => {
      const savedSubject = readStorage(SELECTED_SUBJECT_STORAGE_KEY, null);

      if (
        savedSubject?.id &&
        normalizeValue(savedSubject.studyId) === normalizeValue(studyId)
      ) {
        setSelectedSubjectId(savedSubject.id);
      } else {
        setSelectedSubjectId(null);
      }
    };

    // Load on first render
    loadSelectedSubject();

    // Update whenever the sidebar selects a subject
    window.addEventListener("subject-selected", loadSelectedSubject);

    return () => {
      window.removeEventListener("subject-selected", loadSelectedSubject);
    };
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

  const totalPages = Math.max(1, Math.ceil(filteredSubjects.length / pageSize));

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
  const pageEnd = Math.min(currentPage * pageSize, filteredSubjects.length);

  const selectedSubject = useMemo(() => {
    if (!selectedSubjectId) {
      return null;
    }

    return (
      subjectsData.find(
        (subject) =>
          normalizeValue(subject.id) === normalizeValue(selectedSubjectId),
      ) || null
    );
  }, [selectedSubjectId, subjectsData]);

  const saveSubjects = (updatedSubjectsByStudy) => {
    setSubjectsByStudy(updatedSubjectsByStudy);

    writeStorage(
      SUBJECTS_STORAGE_KEY,
      updatedSubjectsByStudy,
      "subjects-updated",
    );
  };

  const handleSaveSubject = (event) => {
    if (event && typeof event.preventDefault === "function") {
      event.preventDefault();
    }

    setSubjectModalError("");

    const subjectId = newSubject.id.trim();

    if (!studyId || !subjectId) {
      setSubjectModalError("Subject ID is required.");
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
        setSubjectModalError(COMPLETED_STUDY_SUBJECT_EDIT_MESSAGE);
        return;
      }
    } else {
      const authoritativeStudy = getStudyByCode(studyId);
      if (
        authoritativeStudy &&
        authoritativeStudy.status === STUDY_STATUS_COMPLETED
      ) {
        setSubjectModalError(COMPLETED_STUDY_SUBJECT_CREATION_MESSAGE);
        return;
      }
    }

    const duplicateExists = subjectsData.some(
      (subject) =>
        normalizeValue(subject.id) === normalizeValue(subjectId) &&
        normalizeValue(subject.id) !== normalizeValue(editingSubjectId || ""),
    );

    if (duplicateExists) {
      setSubjectModalError("A subject with this Subject ID already exists.");
      return;
    }

    const now = new Date().toISOString();

    let updatedSubjectsForStudy;

    // Item 21 (reverted): status is now a plain manual field — whatever the
    // user selects in the form is saved as-is, with no automatic/derived
    // override of any kind.
    const manualStatus = String(newSubject.status || "").trim();

    if (isEditing) {
      updatedSubjectsForStudy = subjectsData.map((subject) => {
        if (normalizeValue(subject.id) !== normalizeValue(editingSubjectId)) {
          return subject;
        }
        const latestDefaults = getSubjectStudyDefaults(studyId);
        const merged = {
          ...subject,
          ...newSubject,
          id: subjectId,
          initials: newSubject.initials.trim(),
          pi: latestDefaults.pi,
          site: latestDefaults.site,
          studyId,
          updatedAt: now,
        };

        return {
          ...merged,
          status: manualStatus,
        };
      });

      saveSubjects({
        ...subjectsByStudy,
        [studyId]: updatedSubjectsForStudy,
      });

      const editedSubject = updatedSubjectsForStudy.find(
        (subject) => normalizeValue(subject.id) === normalizeValue(subjectId),
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
        setSubjectModalError(
          (error && error.message) || COMPLETED_STUDY_SUBJECT_EDIT_MESSAGE,
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

      const subjectToAdd = {
        ...baseSubject,
        status: manualStatus,
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
        setSubjectModalError(
          (error && error.message) || COMPLETED_STUDY_SUBJECT_CREATION_MESSAGE,
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
    setSubjectModalError("");
    setShowSubjectModal(false);
  };

  const closeSubjectModal = () => {
    setShowSubjectModal(false);
    setNewSubject(emptySubjectForm);
    setEditingSubjectId(null);
    setSubjectModalError("");
  };

  const openAddSubjectModal = () => {
    // Item 7 (Stage 5A): prevent opening the Add Subject flow at all when
    // the target study is Completed. Shared service still enforces this
    // as defense in depth if the flow is somehow reached.
    if (isStudyCompleted) {
      setSubjectNotice({
        title: "Add Subject Unavailable",
        message: COMPLETED_STUDY_SUBJECT_CREATION_MESSAGE,
      });
      return;
    }

    setEditingSubjectId(null);
    setSubjectModalError("");
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
      setSubjectNotice({
        title: "Edit Subject Unavailable",
        message: COMPLETED_STUDY_SUBJECT_EDIT_MESSAGE,
      });
      return;
    }

    setEditingSubjectId(subject.id);
    setSubjectModalError("");
    setNewSubject({
      id: subject.id || "",
      initials: subject.initials || "",
      status: subject.status || "",
      screeningDate: subject.screeningDate || "",
      enrollmentDate: subject.enrollmentDate || "",
      pi: getSubjectStudyDefaults(studyId).pi || subject.pi || "",
      site: getSubjectStudyDefaults(studyId).site || subject.site || "",
    });
    setShowSubjectModal(true);
  };

  const handleDeleteSubject = (subject) => {
    if (!subject) {
      return;
    }

    // Phase-7 IMP-MOD-2: open the shared DeleteConfirmationModal instead of
    // window.confirm. The actual delete happens in confirmDeleteSubject.
    setSubjectToDelete(subject);
  };

  const confirmDeleteSubject = () => {
    if (!subjectToDelete) {
      return;
    }

    const subject = subjectToDelete;

    const updatedSubjectsForStudy = subjectsData.filter(
      (item) => normalizeValue(item.id) !== normalizeValue(subject.id),
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

    setSubjectToDelete(null);
  };

  const openSubjectFolder = (subject, shouldNavigate = false) => {
    localStorage.setItem(
      SELECTED_SUBJECT_STORAGE_KEY,
      JSON.stringify({
        ...subject,
        studyId,
      }),
    );

    setSelectedSubjectId(subject.id);

    if (shouldNavigate && studyId) {
      navigate(
        `/study-dashboard/${encodeURIComponent(
          studyId,
        )}?tab=Subjects&subject=${encodeURIComponent(subject.id)}`,
      );
    }
  };

  const closeSubjectFolder = () => {
    localStorage.removeItem(SELECTED_SUBJECT_STORAGE_KEY);
    setSelectedSubjectId(null);
    setSearchTerm("");
  };

  if (selectedSubject) {
    const subjectContextKey = getSubjectContextKey(studyId, selectedSubject.id);

    const subjectDetailCards = getSubjectDetailCards(
      selectedSubject,
      getStudies(),
    );

    return (
      <div className="subjects-module tnxt-compact">
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
            {/* Phase-7: opens the shared Subject Comments modal.
                We deliberately don't add another Subject Comments
                component — the existing SubjectComments.js is rendered
                in modal mode. */}
            <button
              type="button"
              className="subject-details-comments-btn"
              onClick={() => setShowSubjectCommentsModal(true)}
            >
              Comments
            </button>
          </div>

          <div className="subject-details-grid">
            {subjectDetailCards.map((detail) => (
              <div key={detail.label} className="subject-details-card">
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

        {showSubjectCommentsModal && (
          <SubjectComments
            asModal
            subjectId={selectedSubject.id}
            studyId={studyId}
            onClose={() => setShowSubjectCommentsModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="subjects-module tnxt-compact">
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
                    <td>
                      {getSubjectStudyDefaults(studyId).pi || subject.pi || "—"}
                    </td>
                    <td>
                      {(() => {
                        const latestSite =
                          getSubjectStudyDefaults(studyId).site || subject.site;

                        return latestSite
                          ? resolveSiteDisplay(latestSite, {
                              sources: getStudies(),
                              fallback: latestSite,
                            })
                          : "—";
                      })()}
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
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
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
              ),
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
        <div className="subject-modal-overlay" role="presentation">
          <div
            className="subject-modal"
            role="dialog"
            aria-labelledby="subject-modal-title"
            aria-modal="true"
          >
            <div className="subject-modal-header">
              <div>
                <h3 id="subject-modal-title">
                  {editingSubjectId ? "Edit Subject" : "Add New Subject"}
                </h3>
                <p className="subject-modal-subtitle">
                  {editingSubjectId
                    ? "Update the subject details below and save your changes."
                    : "Enter the details for the new subject."}
                </p>
              </div>
              <button
                type="button"
                className="subject-modal-close"
                onClick={closeSubjectModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form
              className="subject-modal-form"
              onSubmit={handleSaveSubject}
              noValidate
            >
              <div className="form-group">
                <label htmlFor="subject-id">Subject ID</label>
                <input
                  id="subject-id"
                  type="text"
                  placeholder="Subject ID"
                  value={newSubject.id}
                  onChange={(event) =>
                    setNewSubject({
                      ...newSubject,
                      id: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject-initials">Initials</label>
                <input
                  id="subject-initials"
                  type="text"
                  placeholder="Initials"
                  value={newSubject.initials}
                  onChange={(event) =>
                    setNewSubject({
                      ...newSubject,
                      initials: event.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject-pi">Principal Investigator</label>
                {/*
                  Principal Investigator is always derived from the study
                  (see getSubjectStudyDefaults) and is re-applied on save
                  for both Add and Edit flows, so it must never be
                  editable here — Add and Edit now render the same
                  read-only field for consistency.
                */}
                <input
                  id="subject-pi"
                  type="text"
                  placeholder="Principal Investigator"
                  value={inheritedSubjectFields.pi || "—"}
                  readOnly
                  aria-readonly="true"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject-site">Site</label>
                {/*
                  Site is always derived from the study (see
                  getSubjectStudyDefaults) and is re-applied on save for
                  both Add and Edit flows, so it must never be editable
                  here — Add and Edit now render the same read-only field
                  for consistency.
                */}
                <input
                  id="subject-site"
                  type="text"
                  placeholder="Site"
                  value={inheritedSubjectFields.siteDisplay || "—"}
                  readOnly
                  aria-readonly="true"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject-screening-date">Screening Date</label>
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
                <label htmlFor="subject-enrollment-date">Enrollment Date</label>
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

              <div className="form-group">
                <label htmlFor="subject-status">Status</label>
                {/* Status is a fully manual field. The user picks the
                    subject's lifecycle stage or a terminal workflow state
                    directly — nothing here is auto-derived or overridden. */}
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
                  <option value="">Select status</option>
                  {SUBJECT_STATUS_OPTIONS.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {statusOption}
                    </option>
                  ))}
                </select>
              </div>

              {subjectModalError && (
                <p className="subject-modal-error" role="alert">
                  {subjectModalError}
                </p>
              )}

              <div className="subject-modal-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={closeSubjectModal}
                >
                  Cancel
                </button>
                <button type="submit">
                  {editingSubjectId ? "Save Changes" : "Add Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phase-7 IMP-MOD-2: standardized notice modal replaces window.alert()
          for the completed-study guards. Uses the same subject-modal shell
          for header/spacing/button consistency. */}
      {subjectNotice && (
        <div className="subject-modal-overlay" role="presentation">
          <div
            className="subject-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subject-notice-title"
          >
            <div className="subject-modal-header">
              <div>
                <h3 id="subject-notice-title">{subjectNotice.title}</h3>
                <p className="subject-modal-subtitle">
                  This action is not allowed for the current study state.
                </p>
              </div>
              <button
                type="button"
                className="subject-modal-close"
                onClick={() => setSubjectNotice(null)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <p className="subject-modal-error" role="alert">
              {subjectNotice.message}
            </p>

            <div className="subject-modal-actions">
              <button type="button" onClick={() => setSubjectNotice(null)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase-7 IMP-MOD-2: reuse shared DeleteConfirmationModal instead of
          window.confirm(). Preserves existing subject delete behavior. */}
      {subjectToDelete && (
        <DeleteConfirmationModal
          title="Delete Subject"
          itemType="subject"
          message={`Are you sure you want to delete subject ${subjectToDelete.id}? This action cannot be undone.`}
          onClose={() => setSubjectToDelete(null)}
          onConfirm={confirmDeleteSubject}
        />
      )}
    </div>
  );
}

export default StudySubjects;
