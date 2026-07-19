import {
  STUDY_STATUS_DEFAULT,
  STUDY_STATUS_COMPLETED,
} from "../constants/studyStatus";
import { notifyStudyCompleted } from "./notificationService";

const STUDIES_STORAGE_KEY = "trianxtStudies";
const AUDIT_LOG_KEY = "auditLogs";
const SUBJECTS_STORAGE_KEY = "subjectsByStudy";

function getStoredStudies() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(localStorage.getItem(STUDIES_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveStoredStudies(studies) {
  localStorage.setItem(STUDIES_STORAGE_KEY, JSON.stringify(studies));
}

function notifyStudiesUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("studies-updated"));
  window.dispatchEvent(new Event("sponsor-data-updated"));
}

function normalizeStudy(study) {
  return {
    ...study,
    code: study.code || "",
    name: study.name || "",
    protocol: study.protocol || study.name || "",
    indication: study.indication || "",
    country: study.country || "",
    location: study.location || study.site || "",
    site: study.site || study.location || "",
    sponsor: study.sponsor || "",
    cro: study.cro || "",
    status: study.status || STUDY_STATUS_DEFAULT,
    principalInvestigator: study.principalInvestigator || "",
    startDate: study.startDate || "",
    description: study.description || "",
    enrolled: Number(study.enrolled) || 0,
    targetSubjects: Number(study.targetSubjects) || 0,
    /*
      Item 7 (Stage 5A): completedDate is authoritative completion data.
      Preserve it exactly as stored — never fabricate here.
    */
    completedDate: study.completedDate || null,
  };
}

export function initializeStudies() {
  if (typeof window === "undefined") {
    return [];
  }

  /*
    Start with an empty study list.
    The key is created only when the user creates the first study.
  */
  return getStoredStudies();
}

export function getStudies() {
  return getStoredStudies().map(normalizeStudy);
}

export function getStudyByCode(code) {
  return getStudies().find(
    (study) => String(study.code) === String(code)
  );
}

export function createStudy(study) {
  const normalizedStudy = normalizeStudy(study);
  const storedStudies = getStoredStudies();

  const duplicateStudy = storedStudies.some(
    (item) => String(item.code) === String(normalizedStudy.code)
  );

  if (duplicateStudy) {
    throw new Error("A study with this Study ID already exists.");
  }

  saveStoredStudies([...storedStudies, normalizedStudy]);
  notifyStudiesUpdated();

  return normalizedStudy;
}

export function updateStudy(studyCode, updates) {
  const storedStudies = getStoredStudies();

  const index = storedStudies.findIndex(
    (study) => String(study.code) === String(studyCode)
  );

  if (index === -1) {
    throw new Error("Study not found");
  }

  /*
    Item 7 (Stage 5A): transition-aware Completed detection.

    The authoritative previous status is read from the stored study.
    The requested status preserves the previous status when the caller
    did not explicitly provide a `status` field in `updates`.

    A transition into Completed is defined as:
      previousStatus !== "Completed" && requestedStatus === "Completed"

    completedDate is stamped only on that transition.
    Existing completedDate is preserved on every other update path,
    including remaining Completed and moving away from Completed
    (historical completion record).
  */
  const previousStudy = storedStudies[index];
  const previousStatus = previousStudy.status;
  const requestedStatus = Object.prototype.hasOwnProperty.call(
    updates || {},
    "status"
  )
    ? updates.status
    : previousStatus;

  const isTransitionIntoCompleted =
    previousStatus !== STUDY_STATUS_COMPLETED &&
    requestedStatus === STUDY_STATUS_COMPLETED;

  let nextCompletedDate = previousStudy.completedDate || null;

  if (isTransitionIntoCompleted) {
    nextCompletedDate = new Date().toISOString();
  }
  // else: preserve previous completedDate exactly (remaining Completed
  // preserves it; moving away from Completed preserves it as historical
  // completion data). No regeneration, no clearing.

  const updatedStudy = normalizeStudy({
    ...previousStudy,
    ...updates,
    code: previousStudy.code,
    completedDate: nextCompletedDate,
  });

  storedStudies[index] = updatedStudy;

  saveStoredStudies(storedStudies);

  if (isTransitionIntoCompleted) {
    notifyStudyCompleted(updatedStudy);
  }

  notifyStudiesUpdated();

  return updatedStudy;
}

/*
  Item 7 (Stage 5A): shared authoritative subject creation guard.

  Defense-in-depth companion to the UI guard in StudySubjects.js.
  Any code path that adds a new subject to a study must route through
  this function so the Completed-study business rule cannot be bypassed.

  Validation happens BEFORE any mutation of `subjectsByStudy`. The
  subject is never added-then-removed.
*/
export const COMPLETED_STUDY_SUBJECT_CREATION_MESSAGE =
  "Subjects cannot be added because this study is completed.";

function readSubjectsByStudy() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(localStorage.getItem(SUBJECTS_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveSubjectsByStudy(subjectsByStudy) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    SUBJECTS_STORAGE_KEY,
    JSON.stringify(subjectsByStudy)
  );

  window.dispatchEvent(new Event("subjects-updated"));
}

export function createSubject(studyCode, subject) {
  if (!studyCode) {
    throw new Error("Study code is required to create a subject.");
  }

  if (!subject || typeof subject !== "object") {
    throw new Error("Subject data is required.");
  }

  const study = getStoredStudies().find(
    (item) => String(item.code) === String(studyCode)
  );

  if (!study) {
    throw new Error("Study not found");
  }

  // Completed-study business rule — validated BEFORE any mutation.
  if (study.status === STUDY_STATUS_COMPLETED) {
    throw new Error(COMPLETED_STUDY_SUBJECT_CREATION_MESSAGE);
  }

  const subjectsByStudy = readSubjectsByStudy();
  const currentSubjectsForStudy = Array.isArray(subjectsByStudy[studyCode])
    ? subjectsByStudy[studyCode]
    : [];

  const normalizedNewId = String(subject.id || "").trim().toLowerCase();

  if (!normalizedNewId) {
    throw new Error("Subject ID is required.");
  }

  const duplicateExists = currentSubjectsForStudy.some(
    (existing) =>
      String(existing.id || "").trim().toLowerCase() === normalizedNewId
  );

  if (duplicateExists) {
    throw new Error("A subject with this Subject ID already exists.");
  }

  const subjectToStore = {
    ...subject,
    studyId: studyCode,
  };

  const nextSubjectsByStudy = {
    ...subjectsByStudy,
    [studyCode]: [...currentSubjectsForStudy, subjectToStore],
  };

  saveSubjectsByStudy(nextSubjectsByStudy);

  return subjectToStore;
}

export function isStudyCompletedByCode(studyCode) {
  if (!studyCode) {
    return false;
  }

  const study = getStoredStudies().find(
    (item) => String(item.code) === String(studyCode)
  );

  return Boolean(study && study.status === STUDY_STATUS_COMPLETED);
}

function getAuditLogs() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(localStorage.getItem(AUDIT_LOG_KEY)) || [];
  } catch {
    return [];
  }
}

function saveAuditLogs(logs) {
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
}

export function addAuditLog(action, details) {
  const logs = getAuditLogs();

  const newLog = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    action,
    ...details
  };

  logs.unshift(newLog);

  if (logs.length > 100) {
    logs.pop();
  }

  saveAuditLogs(logs);

  return newLog;
}

export function getRecentActivityLogs(limit = 10) {
  return getAuditLogs().slice(0, limit);
}

export function deleteStudy(studyCode, deletionDetails = {}) {
  const storedStudies = getStoredStudies();

  const study = storedStudies.find(
    (item) => String(item.code) === String(studyCode)
  );

  if (!study) {
    throw new Error("Study not found");
  }

  const updatedStudies = storedStudies.filter(
    (item) => String(item.code) !== String(studyCode)
  );

  saveStoredStudies(updatedStudies);

  const subjectsByStudy =
    JSON.parse(localStorage.getItem("subjectsByStudy")) || {};

  if (subjectsByStudy[studyCode]) {
    delete subjectsByStudy[studyCode];

    localStorage.setItem(
      "subjectsByStudy",
      JSON.stringify(subjectsByStudy)
    );
  }

  addAuditLog("STUDY_DELETED", {
    studyCode,
    studyName: study.name,
    deletedBy: deletionDetails.deletedBy || "Unknown",
    reason: deletionDetails.reason || "",
    timestamp: new Date().toISOString()
  });

  notifyStudiesUpdated();

  return true;
}

export function deleteSubject(studyCode, subjectId, deletionDetails = {}) {
  const subjectsByStudy =
    JSON.parse(localStorage.getItem("subjectsByStudy")) || {};

  if (Array.isArray(subjectsByStudy[studyCode])) {
    subjectsByStudy[studyCode] = subjectsByStudy[studyCode].filter(
      (subject) => String(subject.id) !== String(subjectId)
    );

    localStorage.setItem(
      "subjectsByStudy",
      JSON.stringify(subjectsByStudy)
    );
  }

  addAuditLog("SUBJECT_DELETED", {
    studyCode,
    subjectId,
    deletedBy: deletionDetails.deletedBy || "Unknown",
    reason: deletionDetails.reason || "",
    timestamp: new Date().toISOString()
  });

  return true;
}
