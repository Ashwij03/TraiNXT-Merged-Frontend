import { readStorage } from "../../utils/storageHelpers";
// UPDATED: Central PI dashboard data layer (localStorage + dynamic study synchronization)

// Notifications are intentionally NOT read from/written to their own
// isolated "piNotificationsData" key anymore. B10 requires one shared
// notification source across every role so PI sees the same records that
// Admin/Site Staff/CRO/Sponsor generate (subject/visit/document/report/
// comment/permission events) instead of an isolated, never-populated copy.
import {
  getNotificationsForUser,
  markNotificationRead as markSharedNotificationRead,
} from "../../services/notificationService";
import { getCurrentUser, getAssignedSite } from "../../services/roleService";
import { getComments, saveComments } from "../../services/adminService";
import {
  getFilteredSchedules,
  getUpcomingVisitsWindow
} from "../../services/visitScheduleService";
import {
  addCommentRecord,
  resolveCommentRecord,
} from "../../services/commentService";

const STORAGE_KEYS = {
  dashboard: "piDashboardData",
  reports: "piReportsData",
  settings: "piSettingsData",
  security: "piSecurityData",
  recruitment: "piRecruitmentData",
  regulatory: "piRegulatoryData",
  sitePerformance: "piSitePerformanceData",
  liveChat: "piLiveChatData",
  sidebarMenu: "piSidebarMenuData",
  navbar: "piNavbarData",
};

export const dispatchNotificationsUpdated = () => {
  window.dispatchEvent(new CustomEvent("pi-notifications-updated"));
};

const writeStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

/*
  IMPORTANT:
  Studies are intentionally empty here.
  Actual studies must come from the Admin-created / saved PI dashboard data.
*/
export const getDefaultDashboardData = () => ({
  kpis: {
    enrollmentCount: 0,
    targetCount: 0,
    activeSubjects: 0,
    pendingTasks: 0,
    overdueDocuments: 0,
    visitCompletion: 0,
    consentRate: 0,
    studiesCount: 0,
    commentsCount: 0,
    openComments: 0,
    comments: 0,
  },
  studies: [],
  recentSubjects: [],
  upcomingVisits: [],
  pendingQueries: [],
  notifications: [],
  visitData: [],
  lastUpdated: new Date().toLocaleString(),
});

const getDynamicUpcomingVisits = () => {
  try {
    return getUpcomingVisitsWindow(getFilteredSchedules(getCurrentUser()), 30).map(
      (visit) => ({
        ...visit,
        subject: visit.subject || visit.subjectId || visit.subjectid
      })
    );
  } catch {
    return [];
  }
};

export const getDashboardData = () => {
  const defaults = getDefaultDashboardData();
  const saved = readStorage(STORAGE_KEYS.dashboard, {});
  const dynamicUpcomingVisits = getDynamicUpcomingVisits();

  const mergedData = {
    ...defaults,
    ...saved,
    studies: Array.isArray(saved.studies) ? saved.studies : defaults.studies,
    recentSubjects: Array.isArray(saved.recentSubjects)
      ? saved.recentSubjects
      : defaults.recentSubjects,
    upcomingVisits: dynamicUpcomingVisits,
    pendingQueries: Array.isArray(saved.pendingQueries)
      ? saved.pendingQueries
      : defaults.pendingQueries,
    notifications: Array.isArray(saved.notifications)
      ? saved.notifications
      : defaults.notifications,
    visitData: Array.isArray(saved.visitData)
      ? saved.visitData
      : defaults.visitData,
    kpis: {
      ...defaults.kpis,
      ...(saved.kpis || {}),
    },
  };

  /*
    Always overwrite old saved KPI count with the actual study array count.
    This fixes cases where old localStorage still contains studiesCount: 2.
  */
  return syncKpisFromData(mergedData);
};

export const saveDashboardData = (data) => {
  const syncedData = syncKpisFromData(data);

  const payload = {
    ...syncedData,
    lastUpdated: new Date().toLocaleString(),
  };

  writeStorage(STORAGE_KEYS.dashboard, payload);
  dispatchNotificationsUpdated();

  return payload;
};

export const getNavbarNotifications = () => {
  const dashboard = getDashboardData();
  return dashboard.notifications || [];
};

export const getUnreadNotificationCount = () =>
  getNavbarNotifications().filter((n) => !n.read).length;

export const markNavbarNotificationRead = (index, read = true) => {
  const data = getDashboardData();

  const notifications = (data.notifications || []).map((n, i) =>
    i === index ? { ...n, read } : n
  );

  return saveDashboardData({
    ...data,
    notifications,
  });
};

export const toggleNavbarNotificationRead = (index) => {
  const data = getDashboardData();
  const notification = data.notifications?.[index];

  if (!notification) return data;

  return markNavbarNotificationRead(index, !notification.read);
};

export const markAllNavbarNotificationsRead = () => {
  const data = getDashboardData();

  const notifications = (data.notifications || []).map((n) => ({
    ...n,
    read: true,
  }));

  return saveDashboardData({
    ...data,
    notifications,
  });
};

const formatAlertDate = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function isOpenComment(comment) {
  const status = String(comment?.status || "").toLowerCase();
  return status === "open" || status === "unresolved";
}

const PRIORITY_TO_TYPE = {
  Critical: "critical",
  High: "danger",
  Medium: "warning",
  Low: "info",
};

export const buildDynamicAlerts = (dashboardData, comments = []) => {
  const openComments = comments.filter(isOpenComment).length;

  const studiesCount = (dashboardData.studies || []).length;

  const upcomingCount = (dashboardData.upcomingVisits || []).length;

  const openQueries = (dashboardData.pendingQueries || []).filter(
    (query) => query.status === "Open"
  ).length;

  const overdueDocs = dashboardData.kpis?.overdueDocuments || 0;
  const dateStr = formatAlertDate();

  return [
    ...(overdueDocs > 0
      ? [
          {
            type: "critical",
            priority: "Critical",
            title: `${overdueDocs} overdue document${
              overdueDocs !== 1 ? "s" : ""
            }`,
            message: "Regulatory documents require immediate PI review",
            date: dateStr,
            page: "regulatory",
          },
        ]
      : []),

    ...(openComments > 0
      ? [
          {
            type: "danger",
            priority: "High",
            title: `${openComments} open comment${
              openComments !== 1 ? "s" : ""
            } require review`,
            message: "Review unresolved comments across active subjects",
            date: dateStr,
            page: "comments",
          },
        ]
      : []),

    ...(openQueries > 0
      ? [
          {
            type: "warning",
            priority: "High",
            title: `${openQueries} open ${
              openQueries !== 1 ? "queries" : "query"
            }`,
            message: "Data queries awaiting PI response",
            date: dateStr,
            page: "dashboard",
          },
        ]
      : []),

    {
      type: "study-alert",
      priority: "Medium",
      title: `${studiesCount} active ${
        studiesCount !== 1 ? "studies" : "study"
      } monitored`,
      message: "Track enrollment and compliance across portfolio",
      date: dateStr,
      page: "site-performance",
    },

    {
      type: "info",
      priority: "Low",
      title: `${upcomingCount} upcoming visit${
        upcomingCount !== 1 ? "s" : ""
      } scheduled`,
      message:
        upcomingCount > 0
          ? `Next: ${dashboardData.upcomingVisits?.[0]?.subject || "—"} — ${
              dashboardData.upcomingVisits?.[0]?.visit || "—"
            }`
          : "No visits scheduled",
      date: dateStr,
      page: "dashboard",
    },
  ];
};

export { PRIORITY_TO_TYPE };

export const getDefaultSecurityData = () => ({
  password: {
    status: "Strong",
    strength: "High",
    lastChanged: "15-Mar-2026",
    expiryDate: "15-Jun-2026",
    daysUntilExpiry: 45,
  },
  lastLogin: {
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    date: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    location: "Hyderabad, IN",
  },
  settings: {
    twoFactor: true,
    sessionAlerts: true,
    autoLock: true,
    auditLog: true,
  },
  loginActivity: [],
  sessions: [],
  securityScore: 92,
});

export const getSecurityData = () =>
  readStorage(STORAGE_KEYS.security, getDefaultSecurityData());

export const saveSecurityData = (data) => {
  writeStorage(STORAGE_KEYS.security, data);
  return data;
};

export const getDefaultComments = () => [];

export const getCommentsData = () => getComments();

export const saveCommentsData = (comments) => {
  const safeComments = Array.isArray(comments) ? comments : [];
  saveComments(safeComments);
  window.dispatchEvent(new Event("comments-updated"));
  window.dispatchEvent(new CustomEvent("pi-comments-updated"));
  return safeComments;
};

export const addComment = (comment = {}) => {
  const user = getCurrentUser();
  const record = addCommentRecord(
    {
      subjectId: comment.subjectId || "",
      description: comment.comment || comment.text || comment.description || "",
      study: comment.study || comment.studyCode || "",
      site: comment.site || "",
      stage: comment.type || comment.stage || "General",
    },
    user
  );

  if (comment.status === "resolved" && record?.id) {
    resolveCommentRecord(record.id, user);
  }

  return record;
};

export const updateComment = (commentId, updates = {}) => {
  const user = getCurrentUser();
  const nextStatus = updates.status;

  if (
    nextStatus === "resolved" ||
    nextStatus === "Resolved" ||
    nextStatus === "open" ||
    nextStatus === "Open" ||
    nextStatus === "unresolved"
  ) {
    if (nextStatus === "resolved" || nextStatus === "Resolved") {
      resolveCommentRecord(commentId, user);
      return getCommentsData().find((comment) => comment.id === commentId) || null;
    }

    const updatedComments = getCommentsData().map((comment) =>
      comment.id === commentId
        ? {
            ...comment,
            ...updates,
            status: "Open",
          }
        : comment
    );

    return saveCommentsData(updatedComments).find(
      (comment) => comment.id === commentId
    );
  }

  const updatedComments = getCommentsData().map((comment) =>
    comment.id === commentId ? { ...comment, ...updates } : comment
  );

  return saveCommentsData(updatedComments).find(
    (comment) => comment.id === commentId
  );
};

export const deleteComment = (commentId) => {
  const updatedComments = getCommentsData().filter(
    (comment) => comment.id !== commentId
  );

  return saveCommentsData(updatedComments);
};

export const clearCommentsData = () => {
  saveComments([]);
  window.dispatchEvent(new CustomEvent("pi-comments-updated"));
  return [];
};

export const getReportsData = () =>
  readStorage(STORAGE_KEYS.reports, {
    kpis: { total: 0, monthly: 0, study: 0, pending: 0, generated: 0 },
    reports: [],
  });

export const saveReportsData = (data) => {
  writeStorage(STORAGE_KEYS.reports, data);
  return data;
};

const NOTIFICATION_CATEGORY_BY_TITLE = {
  "Visit scheduled": "Upcoming Visits",
  "Visit updated": "Upcoming Visits",
  "Document added": "Regulatory Deadlines",
  "Subject added": "Study Updates",
  "Subject updated": "Study Updates",
  "Report created": "Study Updates",
  "Report updated": "Study Updates",
  "New comment": "Study Updates",
  "Permission request submitted": "Compliance Alerts",
  "Permission request approved": "Compliance Alerts",
  "Permission request rejected": "Compliance Alerts",
};

const NOTIFICATION_PRIORITY_BY_TITLE = {
  "Visit scheduled": "Medium",
  "Visit updated": "Medium",
  "Document added": "Medium",
  "Subject added": "Low",
  "Subject updated": "Low",
  "Report created": "Medium",
  "Report updated": "Medium",
  "New comment": "Low",
  "Permission request submitted": "High",
  "Permission request approved": "Medium",
  "Permission request rejected": "Medium",
};

const formatNotificationDate = (isoString) => {
  const parsed = new Date(isoString);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Maps a shared notificationService record (id/title/message/studyCode/
// createdAt/read) into the { message, category, study, priority, date,
// status } shape the Notifications page/table already renders.
const toNotificationsPageItem = (notification) => ({
  id: notification.id,
  message: notification.message,
  category: NOTIFICATION_CATEGORY_BY_TITLE[notification.title] || "Study Updates",
  study: notification.studyCode || "",
  priority: NOTIFICATION_PRIORITY_BY_TITLE[notification.title] || "Medium",
  date: formatNotificationDate(notification.createdAt),
  status: notification.read ? "Read" : "Unread",
});

export const getNotificationsPageData = () => {
  const items = getNotificationsForUser(getCurrentUser()).map(
    toNotificationsPageItem
  );

  const unread = items.filter((item) => item.status === "Unread").length;
  const alerts = items.filter(
    (item) => item.priority === "High" || item.priority === "Critical"
  ).length;

  return {
    kpis: { total: items.length, unread, tasksDue: unread, alerts },
    items,
  };
};

export const saveNotificationsPageData = (data) => {
  const items = Array.isArray(data?.items) ? data.items : [];
  const user = getCurrentUser();

  const currentlyUnreadIds = new Set(
    getNotificationsForUser(user)
      .filter((notification) => !notification.read)
      .map((notification) => notification.id)
  );

  items.forEach((item) => {
    if (item.status === "Read" && currentlyUnreadIds.has(item.id)) {
      markSharedNotificationRead(item.id, user);
    }
  });

  dispatchNotificationsUpdated();

  return getNotificationsPageData();
};

export const syncNotificationsPageToNavbar = (pageItems = []) => {
  const data = getDashboardData();

  const notifications = pageItems.slice(0, 8).map((item) => ({
    type:
      item.priority === "Critical"
        ? "critical"
        : item.priority === "High"
        ? "danger"
        : item.priority === "Medium"
        ? "warning"
        : "info",
    priority: item.priority,
    title: item.message,
    message: `${item.study || "All Studies"} · ${
      item.category || item.priority
    }`,
    date: item.date,
    read: item.status === "Read",
    pageId: item.id,
  }));

  return saveDashboardData({
    ...data,
    notifications,
  });
};

export const getSettingsData = () => {
  const user = readStorage("currentUser", null);
  const dashboard = getDashboardData();
  const assignedSite = getAssignedSite(user) || "";

  const defaults = {
    profile: {
      name:
        user?.name ||
        localStorage.getItem("userFullName") ||
        "Principal Investigator",
      role: user?.role || "Principal Investigator",
      department: "",
      email: user?.email || "",
      phone: user?.phone || "",
      institute: user?.orgType || assignedSite,
      siteName: assignedSite,
      status: "Active",
      studyAssignments: (dashboard.studies || []).map((study) => study.study),
      contactInfo: {
        office: "",
        mobile: "",
        email: user?.email || "",
      },
    },
    notificationPreferences: {
      emailNotifications: true,
      smsNotifications: false,
      visitAlerts: true,
      regulatoryAlerts: true,
      safetyAlerts: true,
      recruitmentUpdates: true,
      studyUpdates: false,
      digestFrequency: "Daily",
    },
    studyPreferences: {
      preferredStudies: (dashboard.studies || []).map((study) => study.study),
      defaultStudyView: "All Studies",
      dashboardLayout: "Standard",
      defaultReportFormat: "PDF",
      showKpiTrends: true,
      compactTables: false,
    },
    cards: [
      {
        id: "profile",
        title: "Profile Settings",
        description: "PI name, site, contact & assignments",
      },
      {
        id: "notifications",
        title: "Notification Settings",
        description: "Email, SMS & alert preferences",
      },
      {
        id: "security",
        title: "Account Security",
        description: "Password, MFA, sessions & activity",
      },
      {
        id: "preferences",
        title: "Study Preferences",
        description: "Dashboard & reporting preferences",
      },
    ],
    lastUpdated: new Date().toLocaleString(),
  };

  const saved = readStorage(STORAGE_KEYS.settings, {});

  return {
    ...defaults,
    ...saved,
    profile: {
      ...defaults.profile,
      ...(saved.profile || {}),
      studyAssignments: (dashboard.studies || []).map((study) => study.study),
    },
    notificationPreferences: {
      ...defaults.notificationPreferences,
      ...(saved.notificationPreferences || {}),
    },
    studyPreferences: {
      ...defaults.studyPreferences,
      ...(saved.studyPreferences || {}),
      preferredStudies: (dashboard.studies || []).map((study) => study.study),
    },
  };
};

export const saveSettingsData = (data) => {
  writeStorage(STORAGE_KEYS.settings, data);

  const navbar = getNavbarData();

  saveNavbarData({
    ...navbar,
    userName: data.profile?.name || navbar.userName,
    institute: data.profile?.institute || navbar.institute,
  });

  return data;
};

export const getRecruitmentData = () =>
  readStorage(STORAGE_KEYS.recruitment, {
    kpis: {
      activeRecruitment: 0,
      enrolledPatients: 0,
      screeningFailures: 0,
      recruitmentTarget: 0,
      recruitmentProgress: 0,
      pipelineCount: 0,
    },
    studies: [],
    pipeline: [],
  });

export const saveRecruitmentData = (data) => {
  writeStorage(STORAGE_KEYS.recruitment, data);
  return data;
};

export const getRegulatoryData = () =>
  readStorage(STORAGE_KEYS.regulatory, {
    kpis: {
      irbApprovals: 0,
      expiringDocuments: 0,
      complianceReviews: 0,
      regulatorySubmissions: 0,
      auditReadiness: 0,
      trainingCompliance: 0,
    },
    documents: [],
    submissions: [],
  });

export const saveRegulatoryData = (data) => {
  writeStorage(STORAGE_KEYS.regulatory, data);
  return data;
};

export const getSitePerformanceData = () =>
  readStorage(STORAGE_KEYS.sitePerformance, {
    kpis: {
      enrollmentPerformance: 0,
      screeningSuccessRate: 0,
      visitCompletionRate: 0,
      protocolCompliance: 0,
      queryResolutionRate: 0,
      patientRetentionRate: 0,
      dataEntryTimeliness: 0,
      studyProgress: 0,
    },
    metrics: [],
    chartData: [],
  });

export const saveSitePerformanceData = (data) => {
  writeStorage(STORAGE_KEYS.sitePerformance, data);
  return data;
};

export const filterByStudy = (items, selectedStudy, studyKey = "study") => {
  if (!selectedStudy || selectedStudy === "All Studies") return items || [];

  return (items || []).filter(
    (item) =>
      !item[studyKey] ||
      item[studyKey] === selectedStudy ||
      item[studyKey] === "All Studies"
  );
};

export const getProfileData = () => {
  const settings = getSettingsData();
  const navbar = getNavbarData();

  return {
    ...settings.profile,
    userName: navbar.userName,
    role: navbar.role,
    institute: navbar.institute,
  };
};

export const clearAuthSession = () => {
  [
    "isLoggedIn",
    "currentUser",
    "userFullName",
    "userName",
    "userProfile",
    "token",
    "authToken",
  ].forEach((key) => localStorage.removeItem(key));
};

export const handleLogout = () => {
  clearAuthSession();
};

export const getLiveChatData = () =>
  readStorage(STORAGE_KEYS.liveChat, {
    conversations: [],
  });

export const saveLiveChatData = (data) => {
  writeStorage(STORAGE_KEYS.liveChat, data);
  return data;
};

export const getSidebarMenuData = () =>
  readStorage(STORAGE_KEYS.sidebarMenu, {
    sections: [
      { id: "dashboard", label: "Dashboard", icon: "home", page: "dashboard" },
      {
        id: "site-performance",
        label: "Site Performance",
        icon: "chart",
        page: "site-performance",
      },
      {
        id: "recruitment",
        label: "Recruitment",
        icon: "users",
        page: "recruitment",
      },
      {
        id: "regulatory",
        label: "Regulatory",
        icon: "university",
        page: "regulatory",
      },
      { id: "reports", label: "Reports", icon: "pie", page: "reports" },
      {
        id: "notifications",
        label: "Notifications",
        icon: "bell",
        page: "notifications",
      },
      { id: "settings", label: "Settings", icon: "cog", page: "settings" },
    ],
  });

/*
  IMPORTANT:
  The study dropdown now uses dashboard.studies only.
  It will no longer pull old demo study IDs from reports, recruitment,
  regulatory, notifications, or site-performance localStorage.
*/
export const collectAllStudies = () => {
  const dashboard = getDashboardData();

  const studySet = new Set(
    (dashboard.studies || [])
      .map((study) => study?.study)
      .filter(Boolean)
  );

  return ["All Studies", ...Array.from(studySet).sort()];
};

export const collectAllDepartments = () => {
  const settings = getSettingsData();

  return settings.profile?.department
    ? [settings.profile.department]
    : [];
};

export const getNavbarData = () => {
  const user =
    readStorage("currentUser", null) || readStorage("userProfile", null);

  const settings = getSettingsData();
  const allStudies = collectAllStudies();
  const allDepartments = collectAllDepartments();
  const saved = readStorage(STORAGE_KEYS.navbar, {});

  const selectedStudy =
    saved.selectedStudy &&
    (saved.selectedStudy === "All Studies" ||
      allStudies.includes(saved.selectedStudy))
      ? saved.selectedStudy
      : "All Studies";

  return {
    userName:
      user?.name ||
      localStorage.getItem("userFullName") ||
      localStorage.getItem("userName") ||
      settings.profile?.name ||
      "PI User",
    role: saved.selectedRole || "Principal Investigator",
    selectedRole: saved.selectedRole || "Principal Investigator",
    institute: settings.profile?.institute || "",
    allStudies,
    studies: allStudies.filter((study) => study !== "All Studies"),
    departments: allDepartments,
    selectedDepartment:
      saved.selectedDepartment || allDepartments[0] || "",
    selectedStudy,
    ...saved,
  };
};

export const saveNavbarData = (data) => {
  writeStorage(STORAGE_KEYS.navbar, data);
  return data;
};

export const searchDashboard = (query, dashboardData) => {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) return [];

  const results = [];

  (dashboardData.recentSubjects || []).forEach((subject) => {
    if (subject.subject?.toLowerCase().includes(normalizedQuery)) {
      results.push({
        type: "Subject",
        label: subject.subject,
        page: "dashboard",
      });
    }
  });

  (dashboardData.studies || []).forEach((study) => {
    if (study.study?.toLowerCase().includes(normalizedQuery)) {
      results.push({
        type: "Study",
        label: study.study,
        page: "dashboard",
      });
    }
  });

  getCommentsData().forEach((comment) => {
    if (
      comment.subjectId?.toLowerCase().includes(normalizedQuery) ||
      comment.comment?.toLowerCase().includes(normalizedQuery)
    ) {
      results.push({
        type: "Comment",
        label: comment.subjectId,
        page: "comments",
      });
    }
  });

  return results;
};

/*
  This is the main permanent KPI synchronization function.
  It never uses old saved studiesCount values.
*/
export const syncKpisFromData = (data = {}) => {
  const studies = Array.isArray(data.studies) ? data.studies : [];
  const recentSubjects = Array.isArray(data.recentSubjects)
    ? data.recentSubjects
    : [];
  const upcomingVisits = getDynamicUpcomingVisits();

  const totalEnrolled = studies.reduce(
    (sum, study) => sum + Number(study.enrolled || 0),
    0
  );

  const totalTarget = studies.reduce(
    (sum, study) => sum + Number(study.target || 0),
    0
  );

  const activeSubjects = recentSubjects.filter(
    (subject) => subject.status === "Active"
  ).length;

  const studiesCount = studies.length;

  const comments = getCommentsData();

  const openComments = comments.filter(isOpenComment).length;
  const commentsCount = openComments;

  const completedSubjects = recentSubjects.filter(
    (subject) => subject.status === "Completed"
  ).length;

  const visitCompletion =
    recentSubjects.length > 0
      ? Math.round((completedSubjects / recentSubjects.length) * 100)
      : 0;

  const consentedSubjects = recentSubjects.filter(
    (subject) =>
      subject.status === "Active" || subject.status === "Completed"
  ).length;

  const consentRate =
    recentSubjects.length > 0
      ? Math.round((consentedSubjects / recentSubjects.length) * 100)
      : 0;

  return {
    ...data,
    studies,
    recentSubjects,
    upcomingVisits,
    pendingQueries: Array.isArray(data.pendingQueries)
      ? data.pendingQueries
      : [],
    notifications: Array.isArray(data.notifications)
      ? data.notifications
      : [],
    visitData: Array.isArray(data.visitData) ? data.visitData : [],
    kpis: {
      ...(data.kpis || {}),
      enrollmentCount: totalEnrolled,
      targetCount: totalTarget,
      activeSubjects,
      studiesCount,
      commentsCount,
      openComments,
      comments: openComments,
      pendingTasks: studiesCount,
      visitCompletion,
      consentRate,
    },
  };
};

export const filterVisitsByDate = (visits, selectedDate) => {
  if (!selectedDate) return visits || [];

  const targetDate = new Date(selectedDate).toDateString();

  return (visits || []).filter(
    (visit) => new Date(visit.date).toDateString() === targetDate
  );
};

export const getVisitsForDate = (visits, date) => {
  if (!date) return [];

  const targetDate = new Date(date).toDateString();

  return (visits || []).filter(
    (visit) => new Date(visit.date).toDateString() === targetDate
  );
};

export const recalculateSitePerformanceKpis = (data) => {
  const metrics = data.metrics || [];

  const averageMetric = (predicate) => {
    const matchedMetrics = metrics.filter(predicate);

    if (!matchedMetrics.length) return 0;

    return Math.round(
      matchedMetrics.reduce(
        (sum, metric) => sum + Number(metric.value || 0),
        0
      ) / matchedMetrics.length
    );
  };

  const kpis = {
    enrollmentPerformance: averageMetric((metric) =>
      metric.metric.includes("Enrollment")
    ),
    screeningSuccessRate: averageMetric((metric) =>
      metric.metric.includes("Screening")
    ),
    visitCompletionRate: averageMetric((metric) =>
      metric.metric.includes("Visit")
    ),
    protocolCompliance: averageMetric((metric) =>
      metric.metric.includes("Protocol")
    ),
    queryResolutionRate: averageMetric((metric) =>
      metric.metric.includes("Query")
    ),
    patientRetentionRate: averageMetric((metric) =>
      metric.metric.includes("Retention")
    ),
    dataEntryTimeliness: averageMetric((metric) =>
      metric.metric.includes("Data")
    ),
    studyProgress: averageMetric((metric) =>
      metric.metric.includes("Study Progress")
    ),
  };

  const chartData = [
    { name: "Enrollment", value: kpis.enrollmentPerformance },
    { name: "Screening", value: kpis.screeningSuccessRate },
    { name: "Visits", value: kpis.visitCompletionRate },
    { name: "Compliance", value: kpis.protocolCompliance },
    { name: "Queries", value: kpis.queryResolutionRate },
    { name: "Retention", value: kpis.patientRetentionRate },
  ];

  return {
    ...data,
    kpis: {
      ...(data.kpis || {}),
      ...kpis,
    },
    chartData,
    lastUpdated: new Date().toLocaleString(),
  };
};

export const recalculateRecruitmentKpis = (data, dashboard) => {
  const studies = data.studies || [];
  const pipeline = data.pipeline || [];
  const syncedDashboard = dashboard ? syncKpisFromData(dashboard) : null;

  const enrolledPatients = syncedDashboard
    ? syncedDashboard.kpis.enrollmentCount
    : studies.reduce(
        (sum, study) => sum + Number(study.enrolled || 0),
        0
      );

  const recruitmentTarget = syncedDashboard
    ? syncedDashboard.kpis.targetCount
    : studies.reduce(
        (sum, study) => sum + Number(study.target || 0),
        0
      );

  return {
    ...data,
    kpis: {
      ...(data.kpis || {}),
      activeRecruitment: studies.filter(
        (study) => study.status !== "Completed"
      ).length,
      enrolledPatients,
      screeningFailures: studies.reduce(
        (sum, study) => sum + Number(study.screenFailures || 0),
        0
      ),
      recruitmentTarget,
      recruitmentProgress:
        recruitmentTarget > 0
          ? Math.round((enrolledPatients / recruitmentTarget) * 100)
          : 0,
      pipelineCount: pipeline.length,
    },
  };
};