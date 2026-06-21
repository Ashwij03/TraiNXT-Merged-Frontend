import { useEffect, useCallback, useState } from "react";
import ROLES from "../../../constants/roles";
import PERMISSIONS from "../../../constants/permissions";
import {
  getCurrentUser,
  getEffectiveRole,
  hasPermission
} from "../../../services/roleService";
import {
  ensureSubjectFolderWithICF,
  FOLDER_TREE_EVENT
} from "../../../services/folderService";
import {
  markVisitStageCompleted,
  SCHEDULES_EVENT,
  shouldPromptNextVisit,
  syncSubjectSchedules,
  VISIT_STAGES
} from "../../../services/visitScheduleService";
import NextVisitPromptModal from "../../../Components/common/NextVisitPromptModal";
import DocumentFolderManager from "../../../Components/common/DocumentFolderManager";
import "./SubjectFolderWorkspace.css";

const SUBJECT_DETAILS_KEY = "subjectDetailsByStudy";
const SUBJECT_STATUSES = [
  "Screening",
  "Enrolled",
  "Ongoing",
  "Completed",
  "Withdrawn",
  "Dropout"
];

function readSubjectDetails(studyId, subjectId) {
  try {
    const all = JSON.parse(localStorage.getItem(SUBJECT_DETAILS_KEY)) || {};
    return all[`${studyId}::${subjectId}`] || null;
  } catch {
    return null;
  }
}

function saveSubjectDetails(studyId, subjectId, details) {
  const all = JSON.parse(localStorage.getItem(SUBJECT_DETAILS_KEY)) || {};
  all[`${studyId}::${subjectId}`] = details;
  localStorage.setItem(SUBJECT_DETAILS_KEY, JSON.stringify(all));
}

function canModifySubjects(user = getCurrentUser()) {
  const role = getEffectiveRole(user);
  return (
    hasPermission(PERMISSIONS.EDIT_SUBJECT, user) ||
    [ROLES.ADMIN, ROLES.SITE_STAFF, ROLES.PI].includes(role)
  );
}

function SubjectDetailsPanel({ subject, studyId, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const stored = readSubjectDetails(studyId, subject.id) || {};
  const [form, setForm] = useState({
    initials: stored.initials || subject.initials || "",
    status: stored.status || subject.status || "Screening",
    pi: stored.pi || subject.pi || "",
    site: stored.site || subject.site || "",
    screeningDate: stored.screeningDate || subject.screeningDate || "",
    enrollmentDate: stored.enrollmentDate || subject.enrollmentDate || ""
  });

  const canEdit = canModifySubjects();

  const handleSave = () => {
    const payload = { ...form, subjectId: subject.id, studyId };
    saveSubjectDetails(studyId, subject.id, payload);
    syncSubjectSchedules(studyId, subject.id, { ...subject, ...payload });
    onUpdate?.(payload);
    setEditing(false);
  };

  if (!stored.initials && !subject.initials && !editing && canEdit) {
    return (
      <div className="subject-details-panel subject-details-empty">
        <p>No subject details added yet.</p>
        <button type="button" onClick={() => setEditing(true)}>
          Add Subject Details
        </button>
      </div>
    );
  }

  return (
    <div className="subject-details-panel">
      <div className="subject-details-header">
        <h4>Subject Details</h4>
        {canEdit && (
          <button type="button" onClick={() => setEditing((v) => !v)}>
            {editing ? "Cancel" : "Edit"}
          </button>
        )}
      </div>

      {editing ? (
        <div className="subject-details-form">
          <label>
            Initials
            <input
              value={form.initials}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, initials: e.target.value }))
              }
            />
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              {SUBJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            PI
            <input
              value={form.pi}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, pi: e.target.value }))
              }
            />
          </label>
          <label>
            Site
            <input
              value={form.site}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, site: e.target.value }))
              }
            />
          </label>
          <label>
            Screening Date
            <input
              type="date"
              value={form.screeningDate}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  screeningDate: e.target.value
                }))
              }
            />
          </label>
          <label>
            Enrollment Date
            <input
              type="date"
              value={form.enrollmentDate}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  enrollmentDate: e.target.value
                }))
              }
            />
          </label>
          <button type="button" className="save-details-btn" onClick={handleSave}>
            Save Details
          </button>
        </div>
      ) : (
        <div className="subject-details-grid">
          <div>
            <span>ID</span>
            <strong>{subject.id}</strong>
          </div>
          <div>
            <span>Initials</span>
            <strong>{form.initials || "—"}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{form.status || "—"}</strong>
          </div>
          <div>
            <span>PI</span>
            <strong>{form.pi || "—"}</strong>
          </div>
          <div>
            <span>Site</span>
            <strong>{form.site || "—"}</strong>
          </div>
          <div>
            <span>Screening</span>
            <strong>{form.screeningDate || "—"}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

function SubjectFolderWorkspace({ subject, studyId, onBack }) {
  const subjectId = subject?.id || subject?.subjectId;
  const contextKey = `${studyId}::${subjectId}`;
  const [folderVersion, setFolderVersion] = useState(0);
  const [showNextVisitPrompt, setShowNextVisitPrompt] = useState(false);
  const canModify = canModifySubjects();

  useEffect(() => {
    ensureSubjectFolderWithICF("subjects", contextKey);
    syncSubjectSchedules(studyId, subjectId, subject);
    setShowNextVisitPrompt(shouldPromptNextVisit(studyId, subjectId));
  }, [contextKey, studyId, subjectId, subject]);

  useEffect(() => {
    const refreshPrompt = () => {
      setShowNextVisitPrompt(shouldPromptNextVisit(studyId, subjectId));
    };

    window.addEventListener(SCHEDULES_EVENT, refreshPrompt);

    return () => {
      window.removeEventListener(SCHEDULES_EVENT, refreshPrompt);
    };
  }, [studyId, subjectId]);

  const handleVisitStageComplete = useCallback(
    (stageName) => {
      if (!stageName || !VISIT_STAGES.includes(stageName)) {
        return;
      }

      markVisitStageCompleted(studyId, subjectId, stageName);
      syncSubjectSchedules(studyId, subjectId, subject);
      setShowNextVisitPrompt(shouldPromptNextVisit(studyId, subjectId));
    },
    [studyId, subjectId, subject]
  );

  useEffect(() => {
    const handleUpdate = () => setFolderVersion((v) => v + 1);
    window.addEventListener(FOLDER_TREE_EVENT, handleUpdate);
    return () => window.removeEventListener(FOLDER_TREE_EVENT, handleUpdate);
  }, []);

  void folderVersion;

  const handleSubjectUpdate = useCallback(
    (details) => {
      try {
        const subjectsByStudy =
          JSON.parse(localStorage.getItem("subjectsByStudy")) || {};
        const list = subjectsByStudy[studyId] || [];
        subjectsByStudy[studyId] = list.map((item) =>
          item.id === subjectId ? { ...item, ...details } : item
        );
        localStorage.setItem(
          "subjectsByStudy",
          JSON.stringify(subjectsByStudy)
        );
      } catch {
        /* ignore */
      }
    },
    [studyId, subjectId]
  );

  return (
    <div className="subject-folder-workspace">
      <button type="button" className="back-btn" onClick={onBack}>
        ← Back to Subjects List
      </button>

      <SubjectDetailsPanel
        subject={subject}
        studyId={studyId}
        onUpdate={handleSubjectUpdate}
      />

      <DocumentFolderManager
        sectionId="subjects"
        contextKey={contextKey}
        title={`Subject ${subjectId}`}
        readOnly={!canModify}
        studyCode={studyId}
        subjectId={subjectId}
        layout="explorer"
        onVisitStageComplete={handleVisitStageComplete}
      />

      {showNextVisitPrompt && (
        <NextVisitPromptModal
          studyId={studyId}
          subjectId={subjectId}
          subject={subject}
          onClose={() => setShowNextVisitPrompt(false)}
          onSaved={() => syncSubjectSchedules(studyId, subjectId, subject)}
        />
      )}
    </div>
  );
}

export default SubjectFolderWorkspace;
