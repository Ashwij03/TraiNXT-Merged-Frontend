import { readStorage } from "../../utils/storageHelpers";
import {
  getStudyByCode,
  getSubjectStudyDefaults,
  getStudies,
} from "../../services/studyService";
import { resolveSiteDisplay } from "../../utils/siteDisplay";

/**
 * Subject Explorer - SUBJECT RECORDS (metadata bridge)
 * =====================================================
 *
 * `src/pages/shared/studies/StudySubjects.js` already owns the real subject
 * metadata records (Initials, Status, Principal Investigator, Site,
 * Screening/Enrollment dates, Current Visit) under the `subjectsByStudy`
 * localStorage key, written through `services/studyService.js`
 * (createSubject / updateSubject / deleteSubject).
 *
 * The Subjects TAB (`StudySubjectsWorkspace` -> `SubjectExplorer` /
 * `SubjectFileManager`) is a separate, already-complete folder/file
 * explorer keyed off its own tree (`folderTreeService.js`). It never read
 * subject metadata at all - it only knew a subject's id/name.
 *
 * This module is the read/write bridge between the two: it targets the
 * SAME `subjectsByStudy` storage and the SAME service functions
 * `StudySubjects.js` already uses, so the Subjects tab's new KPI cards and
 * "All Subjects" table show the real record - no second subject store is
 * created, and an edit here is visible in the Overview tab's table (and
 * vice versa) because both read/write the same key and the same
 * "subjects-updated" event.
 */

const SUBJECTS_STORAGE_KEY = "subjectsByStudy";

function normalizeValue(value) {
  return String(value ?? "").trim().toLowerCase();
}

function writeSubjectsForStudy(studyId, nextSubjectsForStudy) {
  const all = readStorage(SUBJECTS_STORAGE_KEY, {});
  const next = { ...all, [studyId]: nextSubjectsForStudy };

  localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("subjects-updated", { detail: next }));

  return nextSubjectsForStudy;
}

/** All metadata records for a study, in the same shape StudySubjects.js reads. */
export function getSubjectsForStudy(studyId) {
  const all = readStorage(SUBJECTS_STORAGE_KEY, {});
  if (!all || typeof all !== "object") return [];

  const exact = all[studyId];
  if (Array.isArray(exact)) return exact;

  const normalizedStudyId = normalizeValue(studyId);
  const matchingKey = Object.keys(all).find(
    (key) => normalizeValue(key) === normalizedStudyId
  );

  return matchingKey && Array.isArray(all[matchingKey]) ? all[matchingKey] : [];
}

export function findSubjectRecord(studyId, subjectId) {
  return (
    getSubjectsForStudy(studyId).find(
      (subject) => normalizeValue(subject.id) === normalizeValue(subjectId)
    ) || null
  );
}

/** Fires on every local write ("subjects-updated") and cross-tab writes ("storage"). */
export function subscribeSubjects(handler) {
  if (typeof handler !== "function") return () => {};

  window.addEventListener("subjects-updated", handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener("subjects-updated", handler);
    window.removeEventListener("storage", handler);
  };
}

/**
 * Create (or seed) the metadata record for a subject that already exists in
 * the folder tree. Used right after the existing "Add Subject" flow
 * (SubjectFormModal/FolderTreeService.createSubject) creates the tree
 * node, so the subject appears in the KPI cards / All Subjects table
 * immediately, with PI/Site inherited from the study exactly like
 * StudySubjects.js does.
 */
export function ensureSubjectRecord(studyId, subjectId) {
  if (!studyId || !subjectId) return null;

  const existing = findSubjectRecord(studyId, subjectId);
  if (existing) return existing;

  const study = getStudyByCode(studyId);
  if (!study) return null;

  const defaults = getSubjectStudyDefaults(studyId);
  const record = {
    id: subjectId,
    initials: "",
    status: "",
    pi: defaults.pi,
    site: defaults.site,
    studyId,
    screeningDate: "",
    enrollmentDate: "",
    currentVisit: "",
    createdAt: new Date().toISOString(),
  };

  const current = getSubjectsForStudy(studyId);
  writeSubjectsForStudy(studyId, [...current, record]);
  return record;
}

/** Update a subject's metadata fields (mirrors StudySubjects.js's own edit flow). */
export function updateSubjectRecord(studyId, subjectId, updatedFields) {
  const current = getSubjectsForStudy(studyId);
  const normalizedId = normalizeValue(subjectId);

  const exists = current.some(
    (subject) => normalizeValue(subject.id) === normalizedId
  );

  const next = exists
    ? current.map((subject) =>
        normalizeValue(subject.id) === normalizedId
          ? { ...subject, ...updatedFields, id: subject.id, updatedAt: new Date().toISOString() }
          : subject
      )
    : [
        ...current,
        {
          id: subjectId,
          ...updatedFields,
          studyId,
          createdAt: new Date().toISOString(),
        },
      ];

  writeSubjectsForStudy(studyId, next);
  return next.find((subject) => normalizeValue(subject.id) === normalizedId) || null;
}

/** Remove a subject's metadata record (paired with FolderTreeService.deleteSubject). */
export function deleteSubjectRecord(studyId, subjectId) {
  const current = getSubjectsForStudy(studyId);
  const next = current.filter(
    (subject) => normalizeValue(subject.id) !== normalizeValue(subjectId)
  );

  if (next.length === current.length) return; // nothing to remove
  writeSubjectsForStudy(studyId, next);
}

/**
 * The 8 required KPI/detail fields for a subject, in the exact order the
 * spec lists them. Mirrors `getSubjectDetailCards` in StudySubjects.js so
 * both views resolve PI/Site the same way (study-derived, falling back to
 * whatever is on the record).
 */
export function getSubjectDetailFields(studyId, subjectId) {
  const record = findSubjectRecord(studyId, subjectId) || {};
  const defaults = getSubjectStudyDefaults(studyId);

  const latestSite = defaults.site || record.site;
  const siteDisplay = latestSite
    ? resolveSiteDisplay(latestSite, {
        sources: getStudies(),
        fallback: latestSite,
      })
    : "—";

  return [
    { key: "initials", label: "Initials", value: record.initials || "—" },
    { key: "status", label: "Status", value: record.status || "—" },
    {
      key: "pi",
      label: "Principal Investigator",
      value: defaults.pi || record.pi || "—",
    },
    { key: "studyId", label: "Study ID", value: studyId || "—" },
    { key: "site", label: "Site", value: siteDisplay },
    {
      key: "screeningDate",
      label: "Screening Date",
      value: record.screeningDate || "—",
    },
    {
      key: "enrollmentDate",
      label: "Enrollment Date",
      value: record.enrollmentDate || "—",
    },
    {
      key: "currentVisit",
      label: "Current Visit",
      value: record.currentVisit || "—",
    },
  ];
}

const SubjectRecordsService = {
  getSubjectsForStudy,
  findSubjectRecord,
  subscribeSubjects,
  ensureSubjectRecord,
  updateSubjectRecord,
  deleteSubjectRecord,
  getSubjectDetailFields,
};

export default SubjectRecordsService;
