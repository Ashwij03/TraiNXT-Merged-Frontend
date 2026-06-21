// UPDATED: Central admin data service — localStorage-backed with default seed data

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

function readJson(key, fallback = []) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
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

function seedIfEmpty(key, defaults) {
  const existing = readJson(key, null);

  if (Array.isArray(existing) && existing.length === 0) {
    writeJson(key, defaults);
    return defaults;
  }

  if (existing === null || existing === undefined) {
    writeJson(key, defaults);
    return defaults;
  }

  return existing;
}

export function initializeAdminData() {
  const defaultSites = [
    {
      id: "SITE-A",
      siteNumber: "001",
      name: "Apollo Hospital",
      location: "Chennai",
      pi: "Dr. Meera Rao",
      status: "Active",
      enrollmentRate: 82,
      subjectsEnrolled: 24,
      targetSubjects: 30
    },
    {
      id: "SITE-B",
      siteNumber: "002",
      name: "City Hospital",
      location: "Bangalore",
      pi: "Dr. Priya Sharma",
      status: "Active",
      enrollmentRate: 68,
      subjectsEnrolled: 17,
      targetSubjects: 25
    },
    {
      id: "SITE-C",
      siteNumber: "003",
      name: "Fortis Healthcare",
      location: "Mumbai",
      pi: "Dr. Arun Kumar",
      status: "Onboarding",
      enrollmentRate: 45,
      subjectsEnrolled: 9,
      targetSubjects: 20
    }
  ];

  const defaultComments = [
    {
      id: "C-101",
      subjectId: "SUB-001",
      document: "Lab Report — Visit 2",
      study: "747-303",
      site: "Apollo Hospital",
      status: "Open",
      priority: "High",
      createdAt: "2026-06-08",
      createdBy: "Dr. Meera Rao",
      description: "Missing lab result for Visit 2",
      stage: "Monitoring"
    },
    {
      id: "C-102",
      subjectId: "SUB-002",
      document: "Informed Consent Form",
      study: "05151",
      site: "Apollo Hospital",
      status: "Open",
      priority: "Medium",
      createdAt: "2026-06-09",
      createdBy: "Site Monitor",
      description: "Consent date discrepancy",
      stage: "Monitoring"
    },
    {
      id: "C-103",
      subjectId: "SUB-003",
      document: "Screening Visit Notes",
      study: "747-303",
      site: "City Hospital",
      status: "Resolved",
      priority: "Low",
      createdAt: "2026-06-05",
      createdBy: "CRA Reviewer",
      description: "Comment closed after clarification",
      stage: "Final"
    }
  ];

  const defaultSchedules = [
    {
      date: "2026-06-08",
      subjectId: "SUB-001",
      subjectName: "John Doe",
      visit: "Screening",
      status: "Completed",
      study: "747-303",
      site: "Apollo Hospital",
      time: "10:00 AM"
    },
    {
      date: "2026-06-08",
      subjectId: "SUB-002",
      subjectName: "Jane Smith",
      visit: "Visit 1",
      status: "Scheduled",
      study: "05151",
      site: "Apollo Hospital",
      time: "02:00 PM"
    },
    {
      date: "2026-06-10",
      subjectId: "SUB-003",
      subjectName: "Mike Johnson",
      visit: "Visit 2",
      status: "Completed",
      study: "747-303",
      site: "City Hospital",
      time: "11:00 AM"
    },
    {
      date: "2026-06-10",
      subjectId: "SUB-001",
      subjectName: "John Doe",
      visit: "Visit 3",
      status: "Scheduled",
      study: "747-303",
      site: "Apollo Hospital",
      time: "03:30 PM"
    },
    {
      date: "2026-06-15",
      subjectId: "SUB-004",
      subjectName: "Sarah Williams",
      visit: "End of Study",
      status: "Scheduled",
      study: "05151",
      site: "Fortis Healthcare",
      time: "09:00 AM"
    }
  ];

  const defaultNotifications = [
    {
      id: "N-001",
      title: "Pending user approvals",
      message: "New registration requests require admin review",
      type: "warning",
      read: false,
      createdAt: "2026-06-15T08:00:00.000Z"
    },
    {
      id: "N-002",
      title: "Site performance report ready",
      message: "Monthly site metrics are available for review",
      type: "info",
      read: false,
      createdAt: "2026-06-14T14:30:00.000Z"
    },
    {
      id: "N-003",
      title: "Regulatory document expiring",
      message: "Site B IRB approval expires in 14 days",
      type: "danger",
      read: true,
      createdAt: "2026-06-13T10:15:00.000Z"
    }
  ];

  const defaultSettings = {
    organizationName: "TriaNXT Research",
    timezone: "Asia/Kolkata",
    dateFormat: "DD-MMM-YYYY",
    emailNotifications: true,
    auditRetentionDays: 365,
    defaultStudyStatus: "Active"
  };

  const defaultSitePerformance = [
    {
      siteId: "SITE-A",
      siteName: "Apollo Hospital",
      enrollmentTarget: 30,
      enrolled: 24,
      screeningRate: 88,
      visitCompliance: 94,
      commentResolutionDays: 2.1
    },
    {
      siteId: "SITE-B",
      siteName: "City Hospital",
      enrollmentTarget: 25,
      enrolled: 17,
      screeningRate: 72,
      visitCompliance: 89,
      commentResolutionDays: 3.4
    },
    {
      siteId: "SITE-C",
      siteName: "Fortis Healthcare",
      enrollmentTarget: 20,
      enrolled: 9,
      screeningRate: 61,
      visitCompliance: 85,
      commentResolutionDays: 4.2
    }
  ];

  const defaultRecruitment = [
    {
      id: "REC-001",
      source: "Referral",
      screened: 42,
      enrolled: 18,
      conversionRate: 43,
      site: "Apollo Hospital"
    },
    {
      id: "REC-002",
      source: "Advertisement",
      screened: 28,
      enrolled: 9,
      conversionRate: 32,
      site: "City Hospital"
    },
    {
      id: "REC-003",
      source: "Database",
      screened: 35,
      enrolled: 12,
      conversionRate: 34,
      site: "Fortis Healthcare"
    }
  ];

  const defaultRegulatory = [
    {
      id: "REG-001",
      document: "IRB Approval",
      site: "Apollo Hospital",
      expiryDate: "2026-12-01",
      status: "Valid"
    },
    {
      id: "REG-002",
      document: "Investigator CV",
      site: "City Hospital",
      expiryDate: "2026-08-15",
      status: "Expiring Soon"
    },
    {
      id: "REG-003",
      document: "Site Initiation Visit Report",
      site: "Fortis Healthcare",
      expiryDate: "2026-06-30",
      status: "Pending Review"
    }
  ];

  const defaultReports = [
    {
      id: "RPT-001",
      name: "Enrollment Summary",
      category: "Operations",
      lastGenerated: "2026-06-14",
      status: "Ready"
    },
    {
      id: "RPT-002",
      name: "Comment Aging Report",
      category: "Quality",
      lastGenerated: "2026-06-13",
      status: "Ready"
    },
    {
      id: "RPT-003",
      name: "Site Performance Dashboard",
      category: "Monitoring",
      lastGenerated: "2026-06-10",
      status: "Scheduled"
    }
  ];

  seedIfEmpty(STORAGE_KEYS.sites, defaultSites);
  migrateLegacyQueriesStorage();
  seedIfEmpty(STORAGE_KEYS.comments, defaultComments);
  seedIfEmpty(STORAGE_KEYS.schedules, defaultSchedules);
  seedIfEmpty(STORAGE_KEYS.notifications, defaultNotifications);

  if (!localStorage.getItem(STORAGE_KEYS.settings)) {
    writeJson(STORAGE_KEYS.settings, defaultSettings);
  }

  seedIfEmpty(STORAGE_KEYS.sitePerformance, defaultSitePerformance);
  seedIfEmpty(STORAGE_KEYS.recruitment, defaultRecruitment);
  seedIfEmpty(STORAGE_KEYS.regulatory, defaultRegulatory);
  seedIfEmpty(STORAGE_KEYS.reports, defaultReports);

  if (!localStorage.getItem(STORAGE_KEYS.compliance)) {
    writeJson(STORAGE_KEYS.compliance, { score: 95 });
  }

  const defaultTrainingLogs = [
    {
      id: "TRN-001",
      training: "GCP",
      linkedDuties: "REQUIRED FOR ALL USERS",
      site: "Apollo Hospital",
      delegates: "8 delegates",
      status: "Active"
    },
    {
      id: "TRN-002",
      training: "Physical Exam",
      linkedDuties: "A2 - Physical Exam",
      site: "Apollo Hospital",
      delegates: "1 delegate",
      status: "Active"
    },
    {
      id: "TRN-003",
      training: "GCP Refresher",
      linkedDuties: "REQUIRED FOR ALL USERS",
      site: "City Hospital",
      delegates: "5 delegates",
      status: "Expired"
    }
  ];

  const defaultDelegationLogs = [
    {
      id: "DEL-001",
      delegateName: "Megan Richards",
      role: "Investigator",
      duty: "A2",
      description: "Physical Exam",
      effectivePeriod: "1/27/2020 - Present",
      site: "Apollo Hospital",
      status: "Active"
    },
    {
      id: "DEL-002",
      delegateName: "Megan Richards",
      role: "Investigator",
      duty: "A3",
      description: "Medical Review",
      effectivePeriod: "2/10/2020 - Present",
      site: "Apollo Hospital",
      status: "Active"
    },
    {
      id: "DEL-003",
      delegateName: "Hannah Kulkarni",
      role: "Coordinator",
      duty: "2",
      description: "eReg Access",
      effectivePeriod: "1/27/2020 - 4/13/2020",
      site: "Apollo Hospital",
      status: "Inactive"
    },
    {
      id: "DEL-004",
      delegateName: "Chris Patel",
      role: "Nurse",
      duty: "A1",
      description: "Vital Signs",
      effectivePeriod: "3/01/2020 - Present",
      site: "City Hospital",
      status: "Active"
    }
  ];

  seedIfEmpty(STORAGE_KEYS.trainingLogs, defaultTrainingLogs);
  seedIfEmpty(STORAGE_KEYS.delegationLogs, defaultDelegationLogs);
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

export function getNotifications() {
  initializeAdminData();
  return readJson(STORAGE_KEYS.notifications, []);
}

export const ADMIN_NOTIFICATIONS_EVENT = "admin-notifications-updated";

export function dispatchAdminNotificationsUpdated() {
  window.dispatchEvent(new CustomEvent(ADMIN_NOTIFICATIONS_EVENT));
}

export function markNotificationRead(notificationId) {
  const notifications = getNotifications().map((item) =>
    item.id === notificationId ? { ...item, read: true } : item
  );
  writeJson(STORAGE_KEYS.notifications, notifications);
  dispatchAdminNotificationsUpdated();
  return notifications;
}

export function markNotificationUnread(notificationId) {
  const notifications = getNotifications().map((item) =>
    item.id === notificationId ? { ...item, read: false } : item
  );
  writeJson(STORAGE_KEYS.notifications, notifications);
  dispatchAdminNotificationsUpdated();
  return notifications;
}

export function markAllNotificationsRead() {
  const notifications = getNotifications().map((item) => ({
    ...item,
    read: true
  }));
  writeJson(STORAGE_KEYS.notifications, notifications);
  dispatchAdminNotificationsUpdated();
  return notifications;
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

export function getComplianceScore() {
  initializeAdminData();
  const comments = getComments();
  const openComments = comments.filter((c) => c.status === "Open").length;
  const stored = readJson(STORAGE_KEYS.compliance, { score: 95 });
  const baseScore = Number(stored.score) || 95;
  const adjusted = Math.max(70, Math.min(100, baseScore - openComments));
  return `${adjusted}%`;
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

  const studyData =
    studies.length > 0
      ? studies.slice(0, 6).map((study, index) => ({
          name: study.code || study.name || `Study ${index + 1}`,
          value: Number(study.enrolled || study.subjects || index + 4)
        }))
      : sites.slice(0, 5).map((site, index) => ({
          name: site.name || `Site ${index + 1}`,
          value: Number(site.subjectsEnrolled || index + 4)
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

  return {
    screeningCount: screeningCount || getRecruitment().reduce((sum, r) => sum + r.screened, 0),
    enrolledCount: enrolledCount || getSites().reduce((sum, s) => sum + (s.subjectsEnrolled || 0), 0),
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

  return {
    enrollmentCount: totalEnrolled,
    enrollmentTarget: totalTarget || 150,
    activeSubjects: activeSubjects || totalEnrolled,
    pendingTasks: comments.length + getRegulatoryDocs().filter((d) => d.status !== "Valid").length,
    overdueDocuments: getRegulatoryDocs().filter((d) => d.status === "Expiring Soon").length,
    visitCompletion:
      schedules.length > 0
        ? `${Math.round(
            (schedules.filter((s) => s.status === "Completed").length /
              schedules.length) *
              100
          )}%`
        : "92%",
    consentRate: subjects.length
      ? `${Math.round((activeSubjects / subjects.length) * 100)}%`
      : "88%",
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
