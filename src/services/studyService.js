import {
  STUDY_STATUS_DEFAULT,
  STUDY_STATUS_COMPLETED,
} from "../constants/studyStatus";
import { notifyStudyCompleted } from "./notificationService";
import {
  formatSiteOption,
  getSiteDisplayName,
  resolveSiteNumber,
  resolveSiteRecord,
} from "../utils/siteDisplay";

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

function readJson(key, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
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

function getSiteRecords() {
  const sites = readJson("sites", []);
  return Array.isArray(sites) ? sites : [];
}

function getStudySiteReference(study = {}) {
  const siteName =
    study.siteName ||
    study.site ||
    study.location ||
    "";

  return {
    siteNumber:
      study.siteNumber ||
      study.siteNo ||
      study.site_number ||
      study.siteCode ||
      "",
    siteName,
    name: siteName,
    id: study.siteId || study.site || study.location || "",
  };
}

function deriveStudySiteRelationship(study = {}) {
  const siteRecords = getSiteRecords();
  const siteReference = getStudySiteReference(study);
  const matchedSite = resolveSiteRecord(siteReference, siteRecords);
  const siteNumber = resolveSiteNumber(siteReference, {
    sources: siteRecords,
    fallback: "",
  });
  const siteName =
    getSiteDisplayName(matchedSite) ||
    study.siteName ||
    study.site ||
    study.location ||
    "";
  const siteId =
    matchedSite?.id ||
    matchedSite?.siteId ||
    study.siteId ||
    "";

  return {
    site: siteNumber || siteName,
    siteNumber,
    siteName,
    siteId,
  };
}

export function getSubjectStudyDefaults(studyCode) {
  const study = getStudyByCode(studyCode);

  if (!study) {
    return {
      pi: "",
      principalInvestigator: "",
      site: "",
      siteNumber: "",
      siteName: "",
      siteId: "",
      siteDisplay: "",
    };
  }

  const siteRelationship = deriveStudySiteRelationship(study);
  const principalInvestigator = study.principalInvestigator || "";

  return {
    ...siteRelationship,
    pi: principalInvestigator,
    principalInvestigator,
    siteDisplay: formatSiteOption(siteRelationship),
  };
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

  // Item 9 (Stage 5B): a brand-new study can be entered with a Completed
  // Date already filled in on the study details form — notify the same
  // way as an edit that adds one.
  if (normalizedStudy.completedDate) {
    notifyStudyCompleted(normalizedStudy);
  }

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

    Existing completedDate is preserved on every other update path,
    including remaining Completed and moving away from Completed
    (historical completion record).

    Item 9 (Stage 5B): the Completed Date field on the study details
    form is user-editable. When a value is manually entered there, it
    is authoritative and is saved exactly as typed rather than being
    overwritten by an auto-generated timestamp. The auto-stamp (current
    time) remains only as a fallback for a status transition into
    Completed where no explicit completedDate was supplied.
  */
  const previousStudy = storedStudies[index];
  const previousStatus = previousStudy.status;
  const previousCompletedDate = previousStudy.completedDate || null;

  const requestedStatus = Object.prototype.hasOwnProperty.call(
    updates || {},
    "status"
  )
    ? updates.status
    : previousStatus;

  const hasManualCompletedDate =
    Object.prototype.hasOwnProperty.call(updates || {}, "completedDate") &&
    String(updates.completedDate || "").trim() !== "";

  const isTransitionIntoCompleted =
    previousStatus !== STUDY_STATUS_COMPLETED &&
    requestedStatus === STUDY_STATUS_COMPLETED;

  let nextCompletedDate = previousCompletedDate;

  if (hasManualCompletedDate) {
    nextCompletedDate = updates.completedDate;
  } else if (isTransitionIntoCompleted) {
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

  /*
    Item 9 (Stage 5B): notify Admin, Site Staff, Principal Investigator,
    and Sponsor whenever a Completed Date is newly entered or changed on
    the study — whether that happened by the user typing a date directly
    into the study details form, or via the auto-stamped status
    transition above.
  */
  const completedDateWasEnteredOrChanged =
    Boolean(nextCompletedDate) && nextCompletedDate !== previousCompletedDate;

  if (completedDateWasEnteredOrChanged) {
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

  /*
    Stage 7A: PI and Site are authoritative study relationships, not
    caller-controlled subject form values. Re-resolve them immediately before
    persistence so direct routes, stale modals, and alternate role pages cannot
    create a subject with a mismatched PI/Site.
  */
  const inheritedStudyFields = getSubjectStudyDefaults(studyCode);

  const subjectToStore = {
    ...subject,
    studyId: studyCode,
    pi: inheritedStudyFields.pi,
    principalInvestigator: inheritedStudyFields.principalInvestigator,
    site: inheritedStudyFields.site,
    siteNumber: inheritedStudyFields.siteNumber,
    siteId: inheritedStudyFields.siteId,
  };

  const nextSubjectsByStudy = {
    ...subjectsByStudy,
    [studyCode]: [...currentSubjectsForStudy, subjectToStore],
  };

  saveSubjectsByStudy(nextSubjectsByStudy);

  return subjectToStore;
}

/*
  Item 7 (extension): shared authoritative subject edit guard.

  Mirrors createSubject above — any code path that edits an existing
  subject must route through this function so the Completed-study
  business rule (no adding OR editing subjects once a study is
  Completed) cannot be bypassed. Validation happens BEFORE any
  mutation of `subjectsByStudy`.
*/
export const COMPLETED_STUDY_SUBJECT_EDIT_MESSAGE =
  "Subjects cannot be edited because this study is completed.";

export function updateSubject(studyCode, subjectId, updatedFields) {
  if (!studyCode) {
    throw new Error("Study code is required to update a subject.");
  }

  if (!subjectId) {
    throw new Error("Subject ID is required to update a subject.");
  }

  const study = getStoredStudies().find(
    (item) => String(item.code) === String(studyCode)
  );

  if (!study) {
    throw new Error("Study not found");
  }

  // Completed-study business rule — validated BEFORE any mutation.
  if (study.status === STUDY_STATUS_COMPLETED) {
    throw new Error(COMPLETED_STUDY_SUBJECT_EDIT_MESSAGE);
  }

  const subjectsByStudy = readSubjectsByStudy();
  const currentSubjectsForStudy = Array.isArray(subjectsByStudy[studyCode])
    ? subjectsByStudy[studyCode]
    : [];

  const normalizedId = String(subjectId).trim().toLowerCase();

  const nextSubjectsForStudy = currentSubjectsForStudy.map((existing) =>
    String(existing.id || "").trim().toLowerCase() === normalizedId
      ? { ...existing, ...updatedFields }
      : existing
  );

  const nextSubjectsByStudy = {
    ...subjectsByStudy,
    [studyCode]: nextSubjectsForStudy,
  };

  saveSubjectsByStudy(nextSubjectsByStudy);

  return nextSubjectsForStudy.find(
    (item) => String(item.id || "").trim().toLowerCase() === normalizedId
  );
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

  // D2 (Activity Access Control): notify listeners an activity was recorded
  // so scoped Recent Activity views can refresh via event sync instead of
  // polling, matching the existing studies-updated / admin-data-updated
  // pattern used elsewhere in the app.
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("activity-log-updated", { detail: { action } })
    );
  }

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
    site: study.site || study.location || "",
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

  const existingSubject = Array.isArray(subjectsByStudy[studyCode])
    ? subjectsByStudy[studyCode].find(
        (subject) => String(subject.id) === String(subjectId)
      )
    : null;

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
    site: existingSubject?.site || "",
    deletedBy: deletionDetails.deletedBy || "Unknown",
    reason: deletionDetails.reason || "",
    timestamp: new Date().toISOString()
  });

  return true;
}
