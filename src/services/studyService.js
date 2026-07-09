const STUDIES_STORAGE_KEY = "trianxtStudies";
const AUDIT_LOG_KEY = "auditLogs";

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
    status: study.status || "Active",
    principalInvestigator: study.principalInvestigator || "",
    startDate: study.startDate || "",
    description: study.description || "",
    enrolled: Number(study.enrolled) || 0,
    targetSubjects: Number(study.targetSubjects) || 0
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

  const updatedStudy = normalizeStudy({
    ...storedStudies[index],
    ...updates,
    code: storedStudies[index].code
  });

  storedStudies[index] = updatedStudy;

  saveStoredStudies(storedStudies);
  notifyStudiesUpdated();

  return updatedStudy;
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