// UPDATED: Dynamic studies with preserved default seed data structure

const STUDIES_STORAGE_KEY = "trianxtStudies";
const AUDIT_LOG_KEY = "auditLogs";

const defaultStudies = [
  {
    code: "747-303",
    name: "OBETICHOLIC ACID (OCA)",
    protocol: "OBETICHOLIC ACID (OCA)",
    indication: "Hepatology",
    location: "Apollo Hospital",
    site: "Apollo Hospital",
    enrolled: 1,
    targetSubjects: 50,
    status: "Active",
    principalInvestigator: "Dr. Meera Rao",
    sponsor: "Intercept Pharmaceuticals",
    cro: "IQVIA",
    startDate: "2026-06-01",
    description: "OCA clinical trial study"
  },
  {
    code: "05151",
    name: "SeptiTest",
    protocol: "SeptiTest",
    indication: "Infectious Disease",
    location: "Apollo Hospital",
    site: "Apollo Hospital",
    enrolled: 8,
    targetSubjects: 80,
    status: "Screening",
    principalInvestigator: "Dr. Arun Kumar",
    sponsor: "Abbott Laboratories",
    cro: "Syneos Health",
    startDate: "2026-06-03",
    description: "Sepsis diagnostic study"
  }
];

export function initializeStudies() {
  if (typeof window === "undefined") {
    return defaultStudies;
  }

  const stored = getStoredStudies();

  if (!stored.length) {
    saveStoredStudies(defaultStudies);
    return defaultStudies;
  }

  return stored;
}

function getStoredStudies() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(
      localStorage.getItem(
        STUDIES_STORAGE_KEY
      )
    ) || [];
  } catch {
    return [];
  }
}

function saveStoredStudies(studies) {
  localStorage.setItem(
    STUDIES_STORAGE_KEY,
    JSON.stringify(studies)
  );
}

function normalizeStudy(study) {
  return {
    ...study,
    protocol:
      study.protocol || study.name,
    site:
      study.site || study.location,
    indication: study.indication || "General",
    sponsor: study.sponsor || "TriaNXT Research",
    cro: study.cro || "TriaNXT CRO",
    enrolled:
      Number(study.enrolled) || 0,
    targetSubjects:
      Number(study.targetSubjects) || 0
  };
}

export function getStudies() {
  initializeStudies();
  return getStoredStudies().map(normalizeStudy);
}

export function getStudyByCode(code) {
  return getStudies().find(
    (study) => String(study.code) === String(code)
  );
}

export function createStudy(study) {
  const normalizedStudy =
    normalizeStudy(study);
  const storedStudies =
    getStoredStudies();

  saveStoredStudies([
    ...storedStudies,
    normalizedStudy
  ]);

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

  const updatedStudy = normalizeStudy({
    ...storedStudies[index],
    ...updates,
    code: storedStudies[index].code
  });

  storedStudies[index] = updatedStudy;
  saveStoredStudies(storedStudies);

  return updatedStudy;
}

function getAuditLogs() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(
      localStorage.getItem(
        AUDIT_LOG_KEY
      )
    ) || [];
  } catch {
    return [];
  }
}

function saveAuditLogs(logs) {
  localStorage.setItem(
    AUDIT_LOG_KEY,
    JSON.stringify(logs)
  );
}

export function addAuditLog(action, details) {
  const logs = getAuditLogs();
  const newLog = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    action: action,
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
  const logs = getAuditLogs();
  return logs.slice(0, limit);
}

export function deleteStudy(studyCode, deletionDetails) {
  const storedStudies = getStoredStudies();
  const study = getStudyByCode(studyCode);

  if (!study) {
    throw new Error("Study not found");
  }

  const updatedStudies = storedStudies.filter(
    (s) => s.code !== studyCode
  );

  saveStoredStudies(updatedStudies);

  const subjectsByStudy =
    JSON.parse(
      localStorage.getItem("subjectsByStudy")
    ) || {};

  if (subjectsByStudy[studyCode]) {
    delete subjectsByStudy[studyCode];
    localStorage.setItem(
      "subjectsByStudy",
      JSON.stringify(subjectsByStudy)
    );
  }

  addAuditLog("STUDY_DELETED", {
    studyCode: studyCode,
    studyName: study.name,
    deletedBy: deletionDetails.deletedBy,
    reason: deletionDetails.reason,
    timestamp: new Date().toISOString()
  });

  return true;
}

export function deleteSubject(studyCode, subjectId, deletionDetails) {
  const subjectsByStudy =
    JSON.parse(
      localStorage.getItem("subjectsByStudy")
    ) || {};

  if (Array.isArray(subjectsByStudy[studyCode])) {
    subjectsByStudy[studyCode] =
      subjectsByStudy[studyCode].filter(
        (subject) => subject.id !== subjectId
      );

    localStorage.setItem(
      "subjectsByStudy",
      JSON.stringify(subjectsByStudy)
    );
  }

  addAuditLog("SUBJECT_DELETED", {
    studyCode: studyCode,
    subjectId: subjectId,
    deletedBy: deletionDetails.deletedBy,
    reason: deletionDetails.reason,
    timestamp: new Date().toISOString()
  });

  return true;
}