import { readJson } from "../utils/storageHelpers";
// UPDATED: Central admin data service — localStorage-backed, fully dynamic (no default/seed data)

import { getStudies, getRecentActivityLogs, getStudyByCode } from "./studyService";
import {
  filterBySite,
  getAssignedSite,
  getCurrentUser,
  isAdmin
} from "./roleService";
import {
  getFilteredSchedules,
  getMergedSchedules,
  getUpcomingVisitsWindow
} from "./visitScheduleService";
import {
  getNotificationsForUser,
  markNotificationRead as markSharedNotificationRead,
  markAllNotificationsReadForUser,
  NOTIFICATIONS_UPDATED
} from "./notificationService";

// UPDATED: queries storage key renamed to comments (legacy "queries" key migrated on read)
const STORAGE_KEYS = {
  sites: "sites",
  comments: "comments",
  schedules: "adminSchedules",
  notifications: "notifications",
  settings: "adminSettings",
  sitePerformance: "sitePerformance",
  recruitment: "recruitment",
  regulatory: "adminRegulatory",
  reports: "adminReports",
  compliance: "adminCompliance",
  trainingLogs: "trainingLogs",
  delegationLogs: "delegationLogs"
};

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Swallow storage write failures (e.g. quota exceeded) rather than
    // crashing the caller; data simply will not persist for this write.
  }
}

function getAllSubjectsFlat() {
  const subjectsByStudy =
    readJson("subjectsByStudy", {});

  return Object.entries(subjectsByStudy).flatMap(
    ([studyKey, subjects]) =>
      (Array.isArray(subjects) ? subjects : []).map((subject) => ({
        ...subject,
        studyKey,
        subjectId: subject.subjectId || subject.id
      }))
  );
}

// UPDATED: migrate legacy localStorage key from "queries" to "comments"
function migrateLegacyQueriesStorage() {
  if (typeof window === "undefined") {
    return;
  }

  const legacy = localStorage.getItem("queries");
  const current = localStorage.getItem(STORAGE_KEYS.comments);

  if (legacy && !current) {
    localStorage.setItem(STORAGE_KEYS.comments, legacy);
  }
}

// UPDATED: No more default/seed data of any kind. This now only performs the
// one-time legacy key migration so existing real data keeps working; it no
// longer manufactures sites, comments, schedules, reports, training logs,
// delegation logs, or any other demo records. Every getter below reads
// whatever is actually in localStorage and returns an empty array/object
// when nothing has been created yet.
export function initializeAdminData() {
  migrateLegacyQueriesStorage();
}

export function getUsers() {
  return readJson("users", []);
}

export function getPendingSignupRequests() {
  return getUsers().filter((user) => user.approvalStatus === "Pending");
}

export function approveSignupRequest(email) {
  const users = readJson("users", []);
  let updatedUser = null;

  const nextUsers = users.map((user) => {
    if (user.email !== email) {
      return user;
    }

    updatedUser = {
      ...user,
      approvalStatus: "Approved",
      accountStatus: "Active"
    };

    return updatedUser;
  });

  writeJson("users", nextUsers);
  return updatedUser;
}

export function rejectSignupRequest(email) {
  const users = readJson("users", []);
  let updatedUser = null;

  const nextUsers = users.map((user) => {
    if (user.email !== email) {
      return user;
    }

    updatedUser = {
      ...user,
      approvalStatus: "Rejected",
      accountStatus: "Inactive"
    };

    return updatedUser;
  });

  writeJson("users", nextUsers);
  return updatedUser;
}

// UPDATED: generic filter by an arbitrary site/institution name, used by the
// Admin header's Institution filter to scope dashboard data on demand.
function filterByExactSite(items, siteField, siteName) {
  if (!Array.isArray(items) || !siteName) {
    return items;
  }

  return items.filter((item) => {
    const value = item[siteField] || item.siteName || item.site || item.location || item.assignedSite || "";
    return (
      value === siteName ||
      String(value).includes(siteName) ||
      siteName.includes(String(value))
    );
  });
}

export function getSites(user = getCurrentUser()) {
  initializeAdminData();
  const sites = readJson(STORAGE_KEYS.sites, []);
  return isAdmin(user) ? sites : filterBySite(sites, "name", user);
}

export function saveSites(sites) {
  writeJson(STORAGE_KEYS.sites, sites);
}

// TODO: Comments code is yet to be completed — dynamic placeholder wired for now
export function getComments(user = getCurrentUser()) {
  initializeAdminData();
  const comments = readJson(STORAGE_KEYS.comments, []);
  return filterBySite(comments, "site", user);
}

export function saveComments(comments) {
  writeJson(STORAGE_KEYS.comments, comments);
}

/** @deprecated Renamed to getComments — kept for backward compatibility */
export function getQueries() {
  return getComments();
}

/** @deprecated Renamed to saveComments — kept for backward compatibility */
export function saveQueries(comments) {
  saveComments(comments);
}

export function getSchedules(user = getCurrentUser(), filterOptions = {}) {
  initializeAdminData();
  return getFilteredSchedules(user, filterOptions);
}

export function getAllSchedules(user = getCurrentUser()) {
  initializeAdminData();
  return getMergedSchedules(user);
}

// UPDATED: Admin no longer keeps its own parallel notifications array.
// getNotificationsForUser() reads the same shared "notifications" key that
// CRO/Sponsor/PI notifications use, scoped to the current admin user, so a
// notification created by any role/action shows up here without a separate
// admin-only copy of the data.
export function getNotifications() {
  return getNotificationsForUser(getCurrentUser());
}

// Kept as an alias of the shared event so existing imports of
// ADMIN_NOTIFICATIONS_EVENT / dispatchAdminNotificationsUpdated keep working,
// while actually dispatching the one shared event every role listens for.
export const ADMIN_NOTIFICATIONS_EVENT = NOTIFICATIONS_UPDATED;

export function dispatchAdminNotificationsUpdated() {
  window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED));
}

export function markNotificationRead(notificationId) {
  return markSharedNotificationRead(notificationId, getCurrentUser());
}

export function markNotificationUnread(notificationId) {
  const user = getCurrentUser();
  const visibleIds = new Set(
    getNotificationsForUser(user).map((item) => item.id)
  );

  if (!visibleIds.has(notificationId)) {
    return getNotificationsForUser(user);
  }

  const all = readJson(STORAGE_KEYS.notifications, []);
  const target = all.find((item) => item.id === notificationId);

  if (!target || !target.read) {
    return getNotificationsForUser(user);
  }

  const updated = all.map((item) =>
    item.id === notificationId ? { ...item, read: false } : item
  );
  writeJson(STORAGE_KEYS.notifications, updated);
  dispatchAdminNotificationsUpdated();
  return getNotificationsForUser(user);
}

export function markAllNotificationsRead() {
  return markAllNotificationsReadForUser(getCurrentUser());
}

export function getSettings() {
  initializeAdminData();
  return readJson(STORAGE_KEYS.settings, {});
}

export function saveSettings(settings) {
  writeJson(STORAGE_KEYS.settings, settings);
}

export function getSitePerformance(user = getCurrentUser()) {
  initializeAdminData();
  const records = readJson(STORAGE_KEYS.sitePerformance, []);
  return isAdmin(user)
    ? records
    : records.filter((item) => {
        const assignedSite = getAssignedSite(user);
        if (!assignedSite) return true;
        return (
          item.siteName === assignedSite ||
          item.siteName?.includes(assignedSite)
        );
      });
}

export function getTrainingLogs(user = getCurrentUser()) {
  initializeAdminData();
  const logs = readJson(STORAGE_KEYS.trainingLogs, []);
  return filterBySite(logs, "site", user);
}

export function getDelegationLogs(user = getCurrentUser()) {
  initializeAdminData();
  const logs = readJson(STORAGE_KEYS.delegationLogs, []);
  return filterBySite(logs, "site", user);
}

export function getStudyLogs(studyCode, user = getCurrentUser()) {
  initializeAdminData();

  const study = getStudyByCode(studyCode);
  const studySite = study?.site || study?.location || "";
  const normalizedCode = String(studyCode);

  const auditLogs = getRecentActivityLogs(50)
    .filter(
      (log) =>
        String(log.studyCode) === normalizedCode ||
        String(log.studyName) === normalizedCode
    )
    .map((log) => ({
      id: `AUD-${log.id}`,
      type: "Audit",
      action: log.action || "System activity",
      user: log.deletedBy || log.user || "System",
      timestamp: log.timestamp
        ? new Date(log.timestamp).toLocaleString()
        : "—",
      status: "Recorded"
    }));

  const trainingLogs = getTrainingLogs(user)
    .filter(
      (log) =>
        !studySite ||
        log.site === studySite ||
        String(log.site).includes(studySite)
    )
    .map((log) => ({
      id: log.id,
      type: "Training",
      action: log.training,
      user: log.delegates || "—",
      timestamp: "—",
      status: log.status || "Active"
    }));

  const delegationLogs = getDelegationLogs(user)
    .filter(
      (log) =>
        !studySite ||
        log.site === studySite ||
        String(log.site).includes(studySite)
    )
    .map((log) => ({
      id: log.id,
      type: "Delegation",
      action: log.description || log.duty,
      user: log.delegateName || "—",
      timestamp: log.effectivePeriod || "—",
      status: log.status || "Active"
    }));

  return [...auditLogs, ...trainingLogs, ...delegationLogs];
}

export function getRecruitment(user = getCurrentUser()) {
  initializeAdminData();
  const records = readJson(STORAGE_KEYS.recruitment, []);
  return filterBySite(records, "site", user);
}

export function getRegulatoryDocs(user = getCurrentUser()) {
  initializeAdminData();
  const docs = readJson(STORAGE_KEYS.regulatory, []);
  return filterBySite(docs, "site", user);
}

export function getReports() {
  initializeAdminData();
  return readJson(STORAGE_KEYS.reports, []);
}

// UPDATED: Compliance score is now derived entirely from real stored data —
// no hardcoded baseline. Returns "—" when there is nothing yet to measure
// (no comments and no regulatory docs recorded for any study), instead of a
// fabricated percentage.
export function getComplianceScore() {
  initializeAdminData();

  const comments = getComments();
  const regulatoryDocs = getRegulatoryDocs();

  if (comments.length === 0 && regulatoryDocs.length === 0) {
    return "—";
  }

  const openComments = comments.filter((c) => c.status === "Open").length;
  const nonValidRegulatoryDocs = regulatoryDocs.filter(
    (doc) => doc.status && doc.status !== "Valid"
  ).length;

  const score = Math.max(
    0,
    Math.min(100, 100 - openComments - nonValidRegulatoryDocs)
  );

  return `${score}%`;
}

export function getAdminDashboardData(siteFilter = "") {
  initializeAdminData();

  const allUsers = getUsers();
  const allStudies = getStudies();
  const allSites = getSites();
  const allComments = getComments();
  const allSchedules = getSchedules();

  const users = siteFilter
    ? filterByExactSite(allUsers, "assignedSite", siteFilter)
    : allUsers;

  const studies = siteFilter
    ? filterByExactSite(allStudies, "site", siteFilter)
    : allStudies;

  const sites = siteFilter
    ? allSites.filter(
        (site) =>
          site.name === siteFilter ||
          site.id === siteFilter ||
          site.name?.includes(siteFilter) ||
          siteFilter.includes(site.name || "")
      )
    : allSites;

  const comments = siteFilter
    ? filterByExactSite(allComments, "site", siteFilter)
    : allComments;

  const schedules = siteFilter
    ? filterByExactSite(allSchedules, "site", siteFilter)
    : allSchedules;

  const pendingUsers = users.filter(
    (user) => user.approvalStatus === "Pending"
  );

  // UPDATED: no more fabricated fallback numbers (previously "index + 4")
  // when a study/site has no recorded enrollment yet — real values only,
  // defaulting to 0 rather than an invented figure.
  const studyData =
    studies.length > 0
      ? studies.slice(0, 6).map((study, index) => ({
          name: study.code || study.name || `Study ${index + 1}`,
          value: Number(study.enrolled || study.subjects || 0)
        }))
      : sites.slice(0, 5).map((site, index) => ({
          name: site.name || `Site ${index + 1}`,
          value: Number(site.subjectsEnrolled || 0)
        }));

  const auditActivities = getRecentActivityLogs(5).map((log) => ({
    id: `audit-${log.id}`,
    title: log.action || "System activity",
    description: log.studyName || log.studyCode || log.subjectId || "Audit log entry",
    time: log.timestamp
      ? new Date(log.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      : "Recently",
    type: "info"
  }));

  return {
    users,
    studies,
    sites,
    comments,
    schedules,
    pendingUsers,
    pieData: [
      {
        name: "Approved",
        value: Math.max(users.length - pendingUsers.length, 0)
      },
      {
        name: "Pending",
        value: pendingUsers.length
      }
    ],
    studyData,
    requestData: pendingUsers.map((user) => ({
      name: user.name || "N/A",
      email: user.email || "N/A",
      role: user.role || "N/A",
      status: user.approvalStatus || "Pending"
    })),
    complianceScore: getComplianceScore(),
    auditActivities
  };
}

export function getSiteStaffDashboardData(user = getCurrentUser()) {
  initializeAdminData();

  const assignedSite = getAssignedSite(user);
  const subjects = getAllSubjectsFlat().filter((subject) => {
    if (isAdmin(user) || !assignedSite) {
      return true;
    }

    const subjectSite = subject.site || "";

    return (
      subjectSite === assignedSite ||
      subjectSite.includes(assignedSite) ||
      assignedSite.includes(subjectSite) ||
      !subjectSite
    );
  });

  const comments = getComments(user).filter((c) => c.status === "Open");
  const schedules = getSchedules(user);
  const today = new Date();

  const upcomingVisits = getUpcomingVisitsWindow(schedules, 7, today);

  const screeningCount = subjects.filter((s) =>
    String(s.status || "").toLowerCase().includes("screen")
  ).length;

  const enrolledCount = subjects.filter((s) =>
    ["active", "enrolled"].some((status) =>
      String(s.status || "").toLowerCase().includes(status)
    )
  ).length;

  const subjectActivity = subjects.slice(0, 8).map((subject) => ({
    subjectId: subject.subjectId || subject.id,
    status: subject.status || "Unknown",
    site: subject.site || "N/A"
  }));

  // UPDATED: recruitment/site totals are still real, dynamically-derived
  // fallbacks (used only when no subject records exist yet for this site) —
  // not fabricated demo numbers.
  return {
    screeningCount: screeningCount || getRecruitment(user).reduce((sum, r) => sum + Number(r.screened || 0), 0),
    enrolledCount: enrolledCount || getSites(user).reduce((sum, s) => sum + Number(s.subjectsEnrolled || 0), 0),
    upcomingVisitsCount: upcomingVisits.length,
    openCommentsCount: comments.length,
    upcomingVisits,
    subjectActivity,
    alerts: [
      {
        type: "warning",
        title: "Upcoming Visit",
        message: `${upcomingVisits.length} visits scheduled in the next 7 days`
      },
      {
        type: comments.length > 0 ? "danger" : "success",
        title: "Open Comments",
        message:
          comments.length > 0
            ? `${comments.length} comments require review`
            : "All comments are resolved"
      }
    ]
  };
}

export function getPIDashboardData() {
  initializeAdminData();

  const subjects = getAllSubjectsFlat();
  const comments = getComments().filter((c) => c.status === "Open");
  const schedules = getSchedules();
  const studies = getStudies();
  const totalTarget = studies.reduce(
    (sum, study) => sum + Number(study.targetSubjects || 0),
    0
  );
  const totalEnrolled = studies.reduce(
    (sum, study) => sum + Number(study.enrolled || 0),
    0
  );
  const activeSubjects = subjects.filter((s) =>
    String(s.status || "").toLowerCase().includes("active")
  ).length;

  const completedVisitCount = schedules.filter((s) => s.status === "Completed").length;

  // UPDATED: removed hardcoded fallback percentages ("92%", "88%") and the
  // hardcoded enrollment-target fallback (150). Metrics now reflect actual
  // stored data and show "—" when there is nothing yet to compute from.
  return {
    enrollmentCount: totalEnrolled,
    enrollmentTarget: totalTarget,
    activeSubjects: activeSubjects || totalEnrolled,
    pendingTasks: comments.length + getRegulatoryDocs().filter((d) => d.status !== "Valid").length,
    overdueDocuments: getRegulatoryDocs().filter((d) => d.status === "Expiring Soon").length,
    visitCompletion:
      schedules.length > 0
        ? `${Math.round((completedVisitCount / schedules.length) * 100)}%`
        : "—",
    consentRate: subjects.length
      ? `${Math.round((activeSubjects / subjects.length) * 100)}%`
      : "—",
    recentSubjects: subjects.slice(0, 5).map((s) => ({
      subjectId: s.subjectId || s.id,
      status: s.status || "Unknown",
      lastVisit: s.lastVisit || s.currentVisit || "N/A"
    })),
    upcomingVisits: schedules.slice(0, 5).map((s) => ({
      subjectId: s.subjectId,
      visit: s.visit,
      date: s.date
    })),
    pendingComments: comments.slice(0, 5).map((c) => ({
      commentId: c.id,
      subjectId: c.subjectId,
      status: c.status
    })),
    schedules,
    alerts: [
      {
        type: "danger",
        title: "Documents Requiring Action",
        message: `${getRegulatoryDocs().filter((d) => d.status !== "Valid").length} regulatory items need review`
      },
      {
        type: "warning",
        title: "Pending Tasks",
        message: `${comments.length} open comments assigned to site`
      },
      {
        type: "info",
        title: "Upcoming Visit",
        message:
          schedules.find((s) => s.status === "Scheduled")?.visit ||
          "No scheduled visits"
      }
    ]
  };
}

export function getCRODashboardData() {
  initializeAdminData();

  const sites = getSites();
  const comments = getComments();
  const studies = getStudies();

  return {
    sites,
    studies,
    openComments: comments.filter((c) => c.status === "Open"),
    sitePerformance: getSitePerformance(),
    alerts: [
      {
        type: "warning",
        title: "Monitoring Due",
        message: `${sites.filter((s) => s.status === "Active").length} active sites under monitoring`
      },
      {
        type: "danger",
        title: "Open Comments",
        message: `${comments.filter((c) => c.status === "Open").length} unresolved comments across sites`
      }
    ]
  };
}

export function getSponsorDashboardData() {
  initializeAdminData();

  const studies = getStudies();
  const sites = getSites();
  const reports = getReports();

  return {
    studies,
    sites,
    reports,
    portfolioValue: studies.length,
    activeSites: sites.filter((s) => s.status === "Active").length,
    complianceScore: getComplianceScore(),
    enrollmentTotal: studies.reduce(
      (sum, s) => sum + Number(s.enrolled || 0),
      0
    ),
    alerts: [
      {
        type: "info",
        title: "Portfolio Update",
        message: `${studies.length} studies in sponsor portfolio`
      },
      {
        type: "success",
        title: "Compliance",
        message: `Overall compliance score: ${getComplianceScore()}`
      }
    ]
  };
}

export function getSubjectsForAnalytics(user = getCurrentUser()) {
  const subjects = getAllSubjectsFlat();

  if (isAdmin(user)) {
    return subjects;
  }

  return filterBySite(subjects, "site", user);
}