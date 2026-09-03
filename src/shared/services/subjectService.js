/**
 * Subject Service — Single Source of Truth for Subject Data
 * =========================================================
 *
 * All subject reads and writes in the app go through this module. It owns
 * the `subjectsByStudy` localStorage key (`{ [studyId]: Subject[] }`), with
 * every read/write strictly scoped by studyId.
 *
 * DIRECT localStorage ACCESS RULE:
 * This is the ONLY file in the codebase allowed to call
 * `localStorage.getItem("subjectsByStudy")` /
 * `localStorage.setItem("subjectsByStudy", ...)`.
 * Every other module must import from this module.
 */

function getStudiesFromStudyService() {
  // eslint-disable-next-line global-require
  const studyService = require("./studyService");
  return studyService.getStudies();
}

/**
 * Last Modified column support: resolves the role of whoever is currently
 * acting in the app (respecting Admin/PI preview mode, same as the rest of
 * the app's permission checks) so every subject create/update can be
 * stamped with "who". Lazy `require` mirrors the pattern already used for
 * `studyService` above, avoiding a circular import at module-eval time.
 */
function getActingRole() {
  try {
    // eslint-disable-next-line global-require
    const roleService = require("./roleService");
    return roleService.getEffectiveRole(roleService.getCurrentUser()) || "";
  } catch {
    return "";
  }
}

function getSubjectStudyDefaultsFromStudyService(studyCode) {
  // eslint-disable-next-line global-require
  const studyService = require("./studyService");
  return studyService.getSubjectStudyDefaults(studyCode);
}

function assertStudyIsEditable(studyId) {
  // eslint-disable-next-line global-require
  if (require("./studyService").isStudyCompletedByCode(studyId)) {
    throw new Error("Subjects cannot be changed because this study is completed.");
  }
}

/* ==================================================================
   CONSTANTS
================================================================== */

const SUBJECTS_STORAGE_KEY = "subjectsByStudy";
const LEGACY_FLAT_KEY = "subjectsData";
const MIGRATION_FLAG_KEY = "subjectServiceMigrationV1";
const CLEANUP_FLAG_KEY = "subjectsByStudyCleanupV1";
const ORPHANED_SUBJECTS_KEY = "orphanedSubjects";

const LEGACY_MOCK_SUBJECT_IDS = new Set([
  "SUB-001", "SUB-002", "SUB-003",
  "SUB-004", "SUB-005", "SUB-006",
]);

/* ==================================================================
   INTERNAL HELPERS
================================================================== */

function normalizeValue(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function readSubjectsByStudy() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(SUBJECTS_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export function writeSubjectsByStudy(next) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("subjects-updated", { detail: next }));
  // Added global event to ensure table and workspace updates universally
  window.dispatchEvent(new CustomEvent("SUBJECT_LIST_UPDATED")); 
}

function readJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

/* ==================================================================
   STUDY KEY RESOLUTION
================================================================== */

export function resolveStudyKey(study) {
  return String(
    study?.code ||
      study?.id ||
      study?.studyId ||
      study?.title ||
      study?.name ||
      "",
  ).trim();
}

/* ==================================================================
   LEGACY DATA MIGRATION
================================================================== */

export function migrateLegacySubjectsData({ force = false } = {}) {
  if (typeof window === "undefined") return null;
  if (!force && localStorage.getItem(MIGRATION_FLAG_KEY) === "done") return null;

  try {
    const legacyData = readJson(LEGACY_FLAT_KEY, []);
    if (!Array.isArray(legacyData) || legacyData.length === 0) {
      localStorage.setItem(MIGRATION_FLAG_KEY, "done");
      return null;
    }

    const studies = getStudiesFromStudyService();
    const codeByNormalized = new Map();
    studies.forEach((s) => {
      if (s?.code) codeByNormalized.set(normalizeValue(s.code), s.code);
    });

    const subjectsByStudy = readSubjectsByStudy();
    const orphaned = readJson(ORPHANED_SUBJECTS_KEY, []);
    let movedCount = 0;
    let orphanedCount = 0;

    legacyData.forEach((subject) => {
      const subjectStudyId = subject?.studyId || subject?.study || "";
      const normalizedStudyId = normalizeValue(subjectStudyId);

      let destinationKey = null;
      if (normalizedStudyId && codeByNormalized.has(normalizedStudyId)) {
        destinationKey = codeByNormalized.get(normalizedStudyId);
      }

      if (destinationKey) {
        if (!Array.isArray(subjectsByStudy[destinationKey])) {
          subjectsByStudy[destinationKey] = [];
        }
        const normalizedSubjectId = normalizeValue(subject?.id);
        const alreadyPresent = subjectsByStudy[destinationKey].some(
          (existing) => normalizeValue(existing?.id) === normalizedSubjectId
        );
        if (!alreadyPresent) {
          subjectsByStudy[destinationKey].push({
            ...subject,
            studyId: destinationKey,
          });
          movedCount += 1;
        }
      } else {
        orphaned.push({
          ...subject,
          _orphanedFrom: LEGACY_FLAT_KEY,
          _orphanedAt: new Date().toISOString(),
        });
        orphanedCount += 1;
      }
    });

    writeSubjectsByStudy(subjectsByStudy);

    if (orphanedCount > 0) {
      localStorage.setItem(ORPHANED_SUBJECTS_KEY, JSON.stringify(orphaned));
    }

    localStorage.removeItem(LEGACY_FLAT_KEY);
    localStorage.setItem(MIGRATION_FLAG_KEY, "done");

    const summary = { moved: movedCount, orphaned: orphanedCount };
    console.info("[TriaNXT] subjectsData migration complete:", summary);
    return summary;
  } catch (error) {
    console.error("[TriaNXT] subjectsData migration failed:", error);
    return null;
  }
}

function cleanupMockSubjectsFromMetadata() {
  if (typeof window === "undefined") return;

  try {
    const allByStudy = readSubjectsByStudy();
    let changed = false;

    const cleaned = { ...allByStudy };
    for (const [studyId, records] of Object.entries(cleaned)) {
      if (!Array.isArray(records)) continue;
      const filtered = records.filter(
        (r) => r?.id && !LEGACY_MOCK_SUBJECT_IDS.has(r.id)
      );
      if (filtered.length !== records.length) {
        cleaned[studyId] = filtered;
        changed = true;
      }
    }

    if (changed) {
      writeSubjectsByStudy(cleaned);
    }
  } catch {
    // Best-effort: leave data intact if anything fails.
  }
}

/* ==================================================================
   CROSS-STUDY DATA REPAIR 
================================================================== */

export function cleanupCrossStudySubjectData({ force = false } = {}) {
  if (typeof window === "undefined") return null;
  if (!force && localStorage.getItem(CLEANUP_FLAG_KEY) === "done") return null;

  try {
    const studies = getStudiesFromStudyService();
    const codeByNormalizedCode = new Map();
    studies.forEach((study) => {
      if (study?.code) {
        codeByNormalizedCode.set(normalizeValue(study.code), study.code);
      }
    });

    const subjectsByStudy = readSubjectsByStudy();
    const orphaned = readJson(ORPHANED_SUBJECTS_KEY, []);
    const nextBuckets = {};

    let movedCount = 0;
    let orphanedCount = 0;
    let keptCount = 0;

    Object.entries(subjectsByStudy).forEach(([bucketKey, subjects]) => {
      if (!Array.isArray(subjects)) return;

      const normalizedBucketKey = normalizeValue(bucketKey);

      subjects.forEach((subject) => {
        const subjectStudyId = subject?.studyId;
        const normalizedSubjectId = normalizeValue(subjectStudyId);

        let destinationKey = null;

        if (!subjectStudyId) {
          destinationKey = codeByNormalizedCode.has(normalizedBucketKey)
            ? bucketKey : null;
        } else if (normalizedSubjectId === normalizedBucketKey) {
          destinationKey = bucketKey;
        } else if (codeByNormalizedCode.has(normalizedSubjectId)) {
          destinationKey = codeByNormalizedCode.get(normalizedSubjectId);
          movedCount += 1;
        }

        if (destinationKey) {
          if (!nextBuckets[destinationKey]) {
            nextBuckets[destinationKey] = [];
          }
          const normalizedSubjectRecordId = normalizeValue(subject?.id);
          const alreadyPresent = nextBuckets[destinationKey].some(
            (existing) => normalizeValue(existing?.id) === normalizedSubjectRecordId
          );
          if (!alreadyPresent) {
            nextBuckets[destinationKey].push(subject);
            keptCount += 1;
          }
        } else {
          orphaned.push({
            ...subject,
            _orphanedFromBucket: bucketKey,
            _orphanedAt: new Date().toISOString(),
          });
          orphanedCount += 1;
        }
      });
    });

    writeSubjectsByStudy(nextBuckets);

    if (orphanedCount > 0) {
      localStorage.setItem(ORPHANED_SUBJECTS_KEY, JSON.stringify(orphaned));
    }

    localStorage.setItem(CLEANUP_FLAG_KEY, "done");

    const summary = {
      bucketsBefore: Object.keys(subjectsByStudy).length,
      bucketsAfter: Object.keys(nextBuckets).length,
      subjectsKept: keptCount,
      subjectsMoved: movedCount,
      subjectsOrphaned: orphanedCount,
    };
    return summary;
  } catch (error) {
    console.error("[TriaNXT] subjectsByStudy cleanup failed:", error);
    return null;
  }
}

export function getOrphanedSubjects() {
  return readJson(ORPHANED_SUBJECTS_KEY, []);
}

// Run once on module load
migrateLegacySubjectsData();
cleanupCrossStudySubjectData();
cleanupMockSubjectsFromMetadata();

if (typeof window !== "undefined") {
  window.__trianxtMigrateSubjectsData = migrateLegacySubjectsData;
  window.__trianxtCleanupSubjects = cleanupCrossStudySubjectData;
}

/* ==================================================================
   READS — Strict Study-Scoped Filtering
================================================================== */

export function getSubjectsForStudy(studyId) {
  if (!studyId) return [];

  const allByStudy = readSubjectsByStudy();
  const records = allByStudy[studyId];

  if (!Array.isArray(records)) return [];

  return records.filter((subject) => {
    if (!subject || (!subject.id && !subject.subjectId)) return false;
    // Strict study scoping enforced here to prevent cross-study leaks
    return subject.studyId === studyId;
  });
}

export function getSubjects(studyId) {
  return getSubjectsForStudy(studyId);
}

export function findSubject(studyId, subjectId) {
  if (!studyId || !subjectId) return null;
  return (
    getSubjectsForStudy(studyId).find(
      (s) => normalizeValue(s.id) === normalizeValue(subjectId) || normalizeValue(s.subjectId) === normalizeValue(subjectId)
    ) || null
  );
}

export function getAllSubjects() {
  const allByStudy = readSubjectsByStudy();
  const result = [];

  Object.entries(allByStudy).forEach(([studyId, records]) => {
    if (!Array.isArray(records)) return;
    records.forEach((subject) => {
      if (subject?.id || subject?.subjectId) {
        result.push({ ...subject, studyId });
      }
    });
  });

  return result;
}

export function isSubjectIdTaken(studyId, subjectId, excludeId = null) {
  return getSubjectsForStudy(studyId).some(
    (s) =>
      (normalizeValue(s.id) === normalizeValue(subjectId) || normalizeValue(s.subjectId) === normalizeValue(subjectId)) &&
      (!excludeId || normalizeValue(s.id) !== normalizeValue(excludeId))
  );
}

export function getSubjectsCount(studyId) {
  return getSubjectsForStudy(studyId).length;
}

/* ==================================================================
   WRITES — Strictly Scoped & Normalized Persistence
================================================================== */

// Replaces the dynamic imports to tightly scope local persistence and normalization
export function saveSubject(subjectData) {
  if (!subjectData.studyId) throw new Error("studyId is required to save a subject.");
  assertStudyIsEditable(subjectData.studyId);
  if (!String(subjectData.id || subjectData.subjectId || "").trim()) {
    throw new Error("subjectId is required to save a subject.");
  }

  const allByStudy = readSubjectsByStudy();
  const studyId = subjectData.studyId;
  const currentBucket = Array.isArray(allByStudy[studyId]) ? allByStudy[studyId] : [];

  // Normalize and persist all required attributes to eliminate blanks
  const normalizedSubject = {
    ...subjectData,
    id: subjectData.id || subjectData.subjectId?.trim() || `sub_${Date.now()}`,
    subjectId: String(subjectData.subjectId || subjectData.id).trim(),
    studyId: subjectData.studyId,
    principalInvestigator: subjectData.principalInvestigator || '—',
    site: subjectData.site || '—',
    siteNo: subjectData.siteNo || subjectData.siteNumber || '',
    status: subjectData.status || 'Screened',
    screeningDate: subjectData.screeningDate || new Date().toISOString().split('T')[0],
    enrollmentDate: subjectData.enrollmentDate || '—',
    currentVisit: subjectData.currentVisit || 'Screening',
    createdAt: subjectData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Last Modified column: who last touched this subject's folder, and
    // when. Stamped on create too, so a brand-new subject already shows a
    // sensible Last Modified value instead of "—".
    updatedBy: getActingRole() || subjectData.updatedBy || "",
  };

  currentBucket.push(normalizedSubject);
  allByStudy[studyId] = currentBucket;
  
  writeSubjectsByStudy(allByStudy);
  return normalizedSubject;
}

export function updateSubject(studyId, subjectId, updateData) {
  if (!studyId || !subjectId) return null;
  assertStudyIsEditable(studyId);
  
  const allByStudy = readSubjectsByStudy();
  const currentBucket = Array.isArray(allByStudy[studyId]) ? allByStudy[studyId] : [];
  
  // Strict study-scoped lookup
  const index = currentBucket.findIndex(s => s.subjectId === subjectId || s.id === subjectId);
  
  if (index !== -1) {
    currentBucket[index] = {
      ...currentBucket[index],
      ...updateData,
      studyId,
      subjectId: updateData.subjectId?.trim() || currentBucket[index].subjectId || currentBucket[index].id,
      principalInvestigator: updateData.principalInvestigator || currentBucket[index].principalInvestigator || "â€”",
      site: updateData.site || currentBucket[index].site || "â€”",
      siteNo: updateData.siteNo || updateData.siteNumber || currentBucket[index].siteNo || "",
      status: updateData.status || currentBucket[index].status || "Screened",
      screeningDate: updateData.screeningDate || currentBucket[index].screeningDate || new Date().toISOString().split("T")[0],
      enrollmentDate: updateData.enrollmentDate || currentBucket[index].enrollmentDate || "â€”",
      currentVisit: updateData.currentVisit || currentBucket[index].currentVisit || "Screening",
      updatedAt: new Date().toISOString(),
      // Last Modified column: overwrite on every edit with whoever is
      // currently acting (respects Admin/PI preview mode), so the table
      // always reflects the role that made the most recent change.
      updatedBy: getActingRole() || currentBucket[index].updatedBy || "",
    };
    allByStudy[studyId] = currentBucket;
    writeSubjectsByStudy(allByStudy);
    return currentBucket[index];
  }
  return null;
}

export function deleteSubject(studyId, subjectId) {
  if (!studyId || !subjectId) return;
  assertStudyIsEditable(studyId);
  
  const allByStudy = readSubjectsByStudy();
  const currentBucket = Array.isArray(allByStudy[studyId]) ? allByStudy[studyId] : [];
  
  // Scoped deletion
  const filtered = currentBucket.filter(s => s.subjectId !== subjectId && s.id !== subjectId);
  
  if (filtered.length !== currentBucket.length) {
    allByStudy[studyId] = filtered;
    writeSubjectsByStudy(allByStudy);
  }
}

// Fallback legacy proxy for older UI components if needed
export function createSubject(studyCode, subject) {
  return saveSubject({ ...subject, studyId: studyCode });
}

export function deleteStudySubjects(studyId) {
  if (!studyId || typeof window === "undefined") return;

  const allByStudy = readSubjectsByStudy();
  if (allByStudy[studyId]) {
    delete allByStudy[studyId];
    writeSubjectsByStudy(allByStudy);
  }
}

/* ==================================================================
   METADATA BRIDGE
================================================================== */

export function ensureSubjectRecord(studyId, subjectId) {
  if (!studyId || !subjectId) return null;
  assertStudyIsEditable(studyId);

  const existing = findSubject(studyId, subjectId);
  if (existing) return existing;

  const defaults = getSubjectStudyDefaultsFromStudyService(studyId);
  
  // Normalized to prevent blanks upon bridging
  const record = {
    id: subjectId,
    subjectId: subjectId,
    initials: "",
    status: "Screened",
    principalInvestigator: defaults.principalInvestigator || defaults.pi || "—",
    site: defaults.siteName || defaults.site || "—",
    siteNo: defaults.siteNumber || "",
    studyId,
    screeningDate: new Date().toISOString().split("T")[0],
    enrollmentDate: "—",
    currentVisit: "Screening",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: getActingRole(),
  };

  const allByStudy = readSubjectsByStudy();
  const current = Array.isArray(allByStudy[studyId]) ? allByStudy[studyId] : [];
  allByStudy[studyId] = [...current, record];
  writeSubjectsByStudy(allByStudy);

  return record;
}

export function updateSubjectRecord(studyId, subjectId, updatedFields) {
  return updateSubject(studyId, subjectId, updatedFields);
}

export function deleteSubjectRecord(studyId, subjectId) {
  return deleteSubject(studyId, subjectId);
}

export const findSubjectRecord = findSubject;

export function getSubjectDetailFields(studyId, subjectId) {
  const record = findSubject(studyId, subjectId) || {};
  const defaults = getSubjectStudyDefaultsFromStudyService(studyId);
  const { resolveSiteDisplay } = require("../utils/siteDisplay");
  const { getStudies: getStudiesForDisplay } = require("./studyService");

  const latestSite = record.site || defaults.site || "—";
  const siteDisplay = latestSite && latestSite !== "—"
    ? resolveSiteDisplay(latestSite, {
        sources: getStudiesForDisplay(),
        fallback: latestSite,
      })
    : "—";

  return [
    { key: "initials", label: "Initials", value: record.initials || "—" },
    { key: "status", label: "Status", value: record.status || "Screened" },
    {
      key: "pi",
      label: "Principal Investigator",
      value: record.principalInvestigator || defaults.pi || record.pi || "—",
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
      value: record.currentVisit || "Screening",
    },
  ];
}

export function getStudyDisplayName(study) {
  return (
    study?.name ||
    study?.title ||
    study?.studyName ||
    study?.protocolTitle ||
    study?.protocol ||
    "Untitled Study"
  );
}

export function getStudyMeta(study) {
  const code = study?.code || study?.id || study?.studyId;
  if (!code) return "";
  const studyName = getStudyDisplayName(study);
  return String(code) !== String(studyName) ? String(code) : "";
}

/* ==================================================================
   SUBSCRIPTION
================================================================== */

export function subscribeSubjects(handler) {
  if (typeof window !== "undefined" && typeof handler === "function") {
    window.addEventListener("subjects-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("subjects-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }
  return () => {};
}

/* ==================================================================
   DEFAULT EXPORT
================================================================== */

const SubjectService = {
  resolveStudyKey,
  getStudyKey: resolveStudyKey,

  getSubjects,
  getSubjectsForStudy,
  findSubject,
  findSubjectRecord,
  getAllSubjects,
  isSubjectIdTaken,
  getSubjectsCount,

  saveSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  deleteStudySubjects,

  getStudyDisplayName,
  getStudyMeta,

  ensureSubjectRecord,
  updateSubjectRecord,
  deleteSubjectRecord,
  getSubjectDetailFields,

  subscribeSubjects,

  migrateLegacySubjectsData,
  cleanupCrossStudySubjectData,
  getOrphanedSubjects,
};

export default SubjectService;