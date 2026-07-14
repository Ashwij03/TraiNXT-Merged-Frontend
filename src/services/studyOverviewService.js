import { readJson } from "../utils/storageHelpers";
import { getStudyByCode, getStudies } from "./studyService";
import {
  getFolderTree,
  getFolderDocuments,
} from "./folderService";
import { getSitePerformance, getTrainingLogs, getSites } from "./adminService";
import { getFilteredSchedules } from "./visitScheduleService";
import { getCurrentUser } from "./roleService";
import {
  normalizeSiteActivationStatus,
  normalizeGCPStatus,
  SITE_ACTIVATION_BUCKETS,
  GCP_CERT_BUCKETS,
} from "../utils/siteStatusNormalizer";

export const STUDY_MILESTONES_KEY = "studyMilestonesByStudy";
export const STUDY_OVERVIEW_EVENT = "study-overview-updated";

const ESSENTIAL_DOC_SECTIONS = ["eISF", "regulatory", "studyFolder"];

const DEFAULT_MILESTONE_TITLES = [
  "Study Start",
  "FPI",
  "50% Enrollment",
  "Close-Out",
];

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function dispatchStudyOverviewUpdated() {
  window.dispatchEvent(new CustomEvent(STUDY_OVERVIEW_EVENT));
}

function countDocsInTree(sectionId, contextKey, nodes) {
  const docsByFolder = getFolderDocuments(sectionId, contextKey);
  let count = 0;

  const walk = (list) => {
    (Array.isArray(list) ? list : []).forEach((node) => {
      const folderDocs = docsByFolder[node.id];
      if (Array.isArray(folderDocs)) {
        count += folderDocs.length;
      }
      if (node.children?.length) {
        walk(node.children);
      }
    });
  };

  walk(nodes);
  return count;
}

export function getEssentialDocumentsCompletion(studyCode) {
  const code = String(studyCode || "");
  let uploaded = 0;
  let expected = 0;

  ESSENTIAL_DOC_SECTIONS.forEach((sectionId) => {
    const tree = getFolderTree(sectionId, code);
    const root = tree[0];
    const children = Array.isArray(root?.children) ? root.children : [];
    expected += Math.max(children.length, 1);
    uploaded += countDocsInTree(sectionId, code, tree);
  });

  const percent =
    expected === 0 && uploaded === 0
      ? 0
      : Math.min(100, Math.round((uploaded / Math.max(expected, 1)) * 100));

  return {
    uploaded,
    expected: Math.max(expected, uploaded),
    percent,
    complete: uploaded > 0 && percent >= 100,
  };
}

export function getStudyProgressSummary(studyCode) {
  const code = String(studyCode || "");
  const study = getStudyByCode(code);

  let subjects = [];
  try {
    const byStudy = readJson("subjectsByStudy", {});
    subjects = Array.isArray(byStudy[code]) ? byStudy[code] : [];
  } catch {
    subjects = [];
  }

  const schedules = getFilteredSchedules(getCurrentUser(), { studyCode: code });
  const docStats = getEssentialDocumentsCompletion(code);

  const sites = new Set();
  if (study?.site) sites.add(String(study.site));
  if (study?.location) sites.add(String(study.location));
  subjects.forEach((s) => {
    if (s?.site) sites.add(String(s.site));
  });

  return {
    sites: sites.size,
    subjects: subjects.length,
    visits: schedules.length,
    documents: docStats.uploaded,
    targetSubjects: Number(study?.targetSubjects) || 0,
    enrolled: Number(study?.enrolled) || subjects.length,
  };
}

function createDefaultMilestones(studyCode) {
  const today = new Date().toISOString().slice(0, 10);
  return DEFAULT_MILESTONE_TITLES.map((title, index) => ({
    id: `ms-${studyCode}-${index + 1}`,
    title,
    targetDate: "",
    actualDate: index === 0 ? today : "",
    status: index === 0 ? "Completed" : "Pending",
    notes: "",
  }));
}

export function getStudyMilestones(studyCode) {
  const code = String(studyCode || "");
  const all = readJson(STUDY_MILESTONES_KEY, {});
  const list = all[code];
  if (Array.isArray(list) && list.length) return list;
  return createDefaultMilestones(code);
}

export function saveStudyMilestones(studyCode, milestones) {
  const code = String(studyCode || "");
  const all = readJson(STUDY_MILESTONES_KEY, {});
  all[code] = Array.isArray(milestones) ? milestones : [];
  writeJson(STUDY_MILESTONES_KEY, all);
  dispatchStudyOverviewUpdated();
  return all[code];
}

export function addStudyMilestone(studyCode, milestone) {
  const list = getStudyMilestones(studyCode);
  const entry = {
    id: `ms-${Date.now()}`,
    title: String(milestone?.title ?? "").trim() || "New Milestone",
    targetDate: milestone?.targetDate || "",
    actualDate: milestone?.actualDate || "",
    status: milestone?.status || "Pending",
    notes: milestone?.notes || "",
  };
  return saveStudyMilestones(studyCode, [...list, entry]);
}

export function updateStudyMilestone(studyCode, milestoneId, updates) {
  const list = getStudyMilestones(studyCode).map((item) =>
    item.id === milestoneId ? { ...item, ...updates } : item
  );
  return saveStudyMilestones(studyCode, list);
}

export function deleteStudyMilestone(studyCode, milestoneId) {
  const list = getStudyMilestones(studyCode).filter(
    (item) => item.id !== milestoneId
  );
  return saveStudyMilestones(studyCode, list);
}

export function getStudyScopedSitePerformance(studyCode, user = getCurrentUser()) {
  const study = getStudyByCode(studyCode);
  const studySite = String(study?.site || study?.location || "").trim();
  const records = getSitePerformance(user);

  if (!studySite) return records;

  return records.filter((item) => {
    const name = String(item.siteName || item.site || item.name || "");
    return (
      name === studySite ||
      name.includes(studySite) ||
      studySite.includes(name)
    );
  });
}

export function getSiteActivationCounts(studyCode, user = getCurrentUser()) {
  const study = getStudyByCode(studyCode);
  const studySite = String(study?.site || study?.location || "").trim();
  const sites = getSites(user);
  const counts = Object.fromEntries(
    SITE_ACTIVATION_BUCKETS.map((label) => [label, 0])
  );

  const relevant = sites.filter((site) => {
    const name = String(site.name || site.siteName || "");
    if (!studySite) return true;
    return (
      name === studySite ||
      name.includes(studySite) ||
      studySite.includes(name)
    );
  });

  if (!relevant.length && studySite) {
    const normalized = normalizeSiteActivationStatus(study?.status);
    if (counts[normalized] !== undefined) {
      counts[normalized] += 1;
    } else {
      counts.Pending += 1;
    }
    return counts;
  }

  relevant.forEach((site) => {
    const bucket = normalizeSiteActivationStatus(site.status);
    if (counts[bucket] !== undefined) {
      counts[bucket] += 1;
    } else {
      counts.Pending += 1;
    }
  });

  return counts;
}

export function getGCPCertificationSummary(studyCode, user = getCurrentUser()) {
  const study = getStudyByCode(studyCode);
  const studySite = String(study?.site || study?.location || "").trim();
  const logs = getTrainingLogs(user).filter((log) => {
    const training = String(log.training || "").toLowerCase();
    if (!training.includes("gcp")) return false;
    if (!studySite) return true;
    const site = String(log.site || "");
    return site === studySite || site.includes(studySite) || studySite.includes(site);
  });

  const counts = Object.fromEntries(
    GCP_CERT_BUCKETS.map((label) => [label, 0])
  );

  if (!logs.length) {
    counts.Missing += studySite ? 1 : 0;
    return counts;
  }

  logs.forEach((log) => {
    const bucket = normalizeGCPStatus(log.status);
    if (counts[bucket] !== undefined) {
      counts[bucket] += 1;
    } else {
      counts.Missing += 1;
    }
  });

  return counts;
}

export function getStudyHealthSummary(studyCode, user = getCurrentUser()) {
  const progress = getStudyProgressSummary(studyCode);
  const docs = getEssentialDocumentsCompletion(studyCode);
  const activation = getSiteActivationCounts(studyCode, user);
  const gcp = getGCPCertificationSummary(studyCode, user);
  const milestones = getStudyMilestones(studyCode);

  const factors = [];
  let score = 100;

  if (docs.percent < 50) {
    score -= 25;
    factors.push({ label: "Essential documents incomplete", impact: "High" });
  } else if (docs.percent < 80) {
    score -= 10;
    factors.push({ label: "Essential documents in progress", impact: "Medium" });
  }

  const pendingSites = (activation.Pending || 0) + (activation.Onboarding || 0);
  if (pendingSites > 0) {
    score -= 15;
    factors.push({
      label: `${pendingSites} site(s) not fully activated`,
      impact: "Medium",
    });
  }

  const gcpIssues = (gcp.Expired || 0) + (gcp.Missing || 0);
  if (gcpIssues > 0) {
    score -= 20;
    factors.push({
      label: `${gcpIssues} GCP certification gap(s)`,
      impact: "High",
    });
  }

  const overdueMilestones = milestones.filter(
    (m) =>
      m.status !== "Completed" &&
      m.targetDate &&
      new Date(m.targetDate) < new Date()
  );
  if (overdueMilestones.length) {
    score -= 10;
    factors.push({
      label: `${overdueMilestones.length} overdue milestone(s)`,
      impact: "Medium",
    });
  }

  if (
    progress.targetSubjects > 0 &&
    progress.enrolled / progress.targetSubjects < 0.25
  ) {
    score -= 10;
    factors.push({ label: "Enrollment below 25% of target", impact: "Medium" });
  }

  score = Math.max(0, Math.min(100, score));

  let status = "Healthy";
  if (score < 50) status = "At Risk";
  else if (score < 75) status = "Needs Attention";

  return { score, status, factors };
}

export function getStudiesForOverview() {
  return getStudies();
}
