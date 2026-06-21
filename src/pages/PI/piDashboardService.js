// UPDATED: Central PI dashboard data layer (localStorage + service defaults)

const STORAGE_KEYS = {
  dashboard: "piDashboardData",
  comments: "piCommentsData",
  reports: "piReportsData",
  notifications: "piNotificationsData",
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

const readStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getDefaultDashboardData = () => ({
  kpis: {
    enrollmentCount: 125,
    targetCount: 150,
    activeSubjects: 85,
    pendingTasks: 12,
    overdueDocuments: 3,
    visitCompletion: 92,
    consentRate: 88,
  },
  studies: [
    { study: "747-303", target: 150, enrolled: 120, status: "On Track" },
    { study: "05151", target: 100, enrolled: 85, status: "At Risk" },
  ],
  recentSubjects: [
    { subject: "SUB-001", status: "Active", visit: "Visit 2" },
    { subject: "SUB-002", status: "Screening", visit: "Visit 1" },
    { subject: "SUB-003", status: "Completed", visit: "Visit 3" },
  ],
  upcomingVisits: [
    { subject: "SUB-001", visit: "Visit 3", date: "2026-06-16" },
    { subject: "SUB-004", visit: "Visit 2", date: "2026-06-16" },
    { subject: "SUB-002", visit: "Visit 1", date: "2026-06-10" },
    { subject: "SUB-005", visit: "Screening", date: "2026-06-20" },
  ],
  pendingQueries: [
    { id: "Q-101", subject: "SUB-001", status: "Open" },
    { id: "Q-102", subject: "SUB-002", status: "Open" },
    { id: "Q-103", subject: "SUB-003", status: "Answered" },
  ],
  notifications: [
    {
      type: "danger",
      title: "3 Documents are overdue",
      message: "Please review and take action",
      date: "10-Jun-2026",
      read: false,
    },
    {
      type: "warning",
      title: "12 Tasks are pending",
      message: "Click to view pending tasks",
      date: "10-Jun-2026",
      read: false,
    },
    {
      type: "info",
      title: "Upcoming visit for SUB-001 (Visit 3)",
      message: "Scheduled on 10-Jun-2026",
      date: "10-Jun-2026",
      read: true,
    },
  ],
  lastUpdated: new Date().toLocaleString(),
});

export const getDashboardData = () => {
  const defaults = getDefaultDashboardData();
  const saved = readStorage(STORAGE_KEYS.dashboard, {});
  return {
    ...defaults,
    ...saved,
    kpis: { ...defaults.kpis, ...(saved.kpis || {}) },
  };
};

export const saveDashboardData = (data) => {
  const payload = { ...data, lastUpdated: new Date().toLocaleString() };
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
  return saveDashboardData({ ...data, notifications });
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
  return saveDashboardData({ ...data, notifications });
};

const formatAlertDate = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const PRIORITY_TO_TYPE = {
  Critical: "critical",
  High: "danger",
  Medium: "warning",
  Low: "info",
};

export const buildDynamicAlerts = (dashboardData, comments = []) => {
  const openComments = comments.filter((c) => c.status === "unresolved").length;
  const studiesCount = (dashboardData.studies || []).length;
  const upcomingCount = (dashboardData.upcomingVisits || []).length;
  const openQueries = (dashboardData.pendingQueries || []).filter(
    (q) => q.status === "Open"
  ).length;
  const overdueDocs = dashboardData.kpis?.overdueDocuments || 0;
  const dateStr = formatAlertDate();

  return [
    ...(overdueDocs > 0
      ? [
          {
            type: "critical",
            priority: "Critical",
            title: `${overdueDocs} overdue document${overdueDocs !== 1 ? "s" : ""}`,
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
            title: `${openComments} open comment${openComments !== 1 ? "s" : ""} require review`,
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
            title: `${openQueries} open quer${openQueries !== 1 ? "ies" : "y"}`,
            message: "Data queries awaiting PI response",
            date: dateStr,
            page: "dashboard",
          },
        ]
      : []),
  {
  type: "study-alert",
  priority: "Medium",
  title: `${studiesCount} active stud${studiesCount !== 1 ? "ies" : "y"} monitored`,
  message: "Track enrollment and compliance across portfolio",
  date: dateStr,
  page: "site-performance",
},

    {
      type: "info",
      priority: "Low",
      title: `${upcomingCount} upcoming visit${upcomingCount !== 1 ? "s" : ""} scheduled`,
      message:
        upcomingCount > 0
          ? `Next: ${dashboardData.upcomingVisits[0]?.subject || "—"} — ${
              dashboardData.upcomingVisits[0]?.visit || "—"
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
  loginActivity: [
    {
      id: "LA-1",
      datetime: "16-Jun-2026 08:42 AM",
      event: "Successful login",
      location: "Hyderabad, IN",
      device: "Windows Desktop",
      status: "Success",
    },
    {
      id: "LA-2",
      datetime: "15-Jun-2026 06:15 PM",
      event: "Successful login",
      location: "Hyderabad, IN",
      device: "iPhone 15",
      status: "Success",
    },
    {
      id: "LA-3",
      datetime: "14-Jun-2026 09:03 AM",
      event: "Failed login attempt",
      location: "Unknown",
      device: "Chrome / Linux",
      status: "Blocked",
    },
  ],
  sessions: [
    {
      id: "S-1",
      device: "Windows Desktop",
      browser: "Chrome 137",
      ip: "192.168.1.42",
      lastActive: "Just now",
      current: true,
      active: true,
    },
    {
      id: "S-2",
      device: "iPhone 15",
      browser: "Safari Mobile",
      ip: "192.168.1.88",
      lastActive: "Yesterday 6:15 PM",
      current: false,
      active: true,
    },
    {
      id: "S-3",
      device: "MacBook Pro",
      browser: "Firefox 139",
      ip: "10.0.0.15",
      lastActive: "3 days ago",
      current: false,
      active: false,
    },
  ],
  securityScore: 92,
});

export const getSecurityData = () =>
  readStorage(STORAGE_KEYS.security, getDefaultSecurityData());

export const saveSecurityData = (data) => {
  writeStorage(STORAGE_KEYS.security, data);
  return data;
};

export const getDefaultComments = () => [
  {
    id: "COM-1567",
    subjectId: "SUB-1025",
    visit: "Visit 3",
    type: "General",
    comment: "Subject reported mild fatigue and headache after procedure.",
    createdBy: "Dr. B. Nobitha",
    date: "15-May-2025",
    status: "unresolved",
  },
  {
    id: "COM-1566",
    subjectId: "SUB-1024",
    visit: "Visit 2",
    type: "Query",
    comment: "Please confirm BP reading.",
    createdBy: "Dr. K. Suzukaa",
    date: "14-May-2025",
    status: "resolved",
  },
  {
    id: "COM-1565",
    subjectId: "SUB-1023",
    visit: "Screening",
    type: "Safety",
    comment: "Subject experienced dizziness.",
    createdBy: "Dr. B. Doremon",
    date: "13-May-2025",
    status: "pending-review",
  },
];

export const getCommentsData = () =>
  readStorage(STORAGE_KEYS.comments, getDefaultComments());

export const saveCommentsData = (comments) => {
  writeStorage(STORAGE_KEYS.comments, comments);
  return comments;
};

export const getReportsData = () =>
  readStorage(STORAGE_KEYS.reports, {
    kpis: { total: 24, monthly: 6, study: 12, pending: 3, generated: 18 },
    reports: [
      { id: "RPT-001", name: "Enrollment Report", category: "Enrollment", type: "Study", study: "747-303", date: "01-Jun-2026", status: "Generated", format: "PDF" },
      { id: "RPT-002", name: "Compliance Report", category: "Compliance", type: "Regulatory", study: "All Studies", date: "15-Jun-2026", status: "Generated", format: "PDF" },
      { id: "RPT-003", name: "Safety Report", category: "Safety", type: "Study", study: "05151", date: "20-May-2026", status: "Pending", format: "PDF" },
      { id: "RPT-004", name: "Study Progress Report", category: "Study Progress", type: "Study", study: "747-303", date: "10-Jun-2026", status: "Generated", format: "XLSX" },
      { id: "RPT-005", name: "Visit Completion Report", category: "Visit", type: "Study", study: "05151", date: "12-Jun-2026", status: "Generated", format: "PDF" },
      { id: "RPT-006", name: "Regulatory Submission Report", category: "Regulatory", type: "Regulatory", study: "747-303", date: "08-Jun-2026", status: "Pending", format: "PDF" },
    ],
  });

// UPDATED: Save helpers for dynamic page data
export const saveReportsData = (data) => {
  writeStorage(STORAGE_KEYS.reports, data);
  return data;
};

export const getNotificationsPageData = () =>
  readStorage(STORAGE_KEYS.notifications, {
    kpis: { total: 18, unread: 7, tasksDue: 5, alerts: 4 },
    items: [
      { id: "N-1", category: "Upcoming Visits", message: "Visit 2 due for SUB-001", study: "747-303", priority: "High", date: "20-Jun-2026", status: "Unread" },
      { id: "N-2", category: "Regulatory Deadlines", message: "Medical License expiring in 60 days", study: "All Studies", priority: "Critical", date: "18-Jun-2026", status: "Unread" },
      { id: "N-3", category: "Safety Notifications", message: "SAE report pending PI signature", study: "05151", priority: "Critical", date: "17-Jun-2026", status: "Unread" },
      { id: "N-4", category: "Study Updates", message: "Protocol amendment approved by IRB", study: "747-303", priority: "Medium", date: "16-Jun-2026", status: "Read" },
      { id: "N-5", category: "Recruitment Updates", message: "Enrollment target 80% reached", study: "747-303", priority: "Low", date: "15-Jun-2026", status: "Read" },
      { id: "N-6", category: "Compliance Alerts", message: "Training certificate renewal required", study: "All Studies", priority: "High", date: "14-Jun-2026", status: "Unread" },
      { id: "N-7", category: "Upcoming Visits", message: "Screening visit scheduled for SUB-005", study: "05151", priority: "Medium", date: "20-Jun-2026", status: "Unread" },
      { id: "N-8", category: "Regulatory Deadlines", message: "IRB continuing review due in 30 days", study: "747-303", priority: "High", date: "12-Jun-2026", status: "Read" },
    ],
  });

export const saveNotificationsPageData = (data) => {
  writeStorage(STORAGE_KEYS.notifications, data);
  dispatchNotificationsUpdated();
  return data;
};

export const syncNotificationsPageToNavbar = (pageItems) => {
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
    message: `${item.study || "All Studies"} · ${item.category || item.priority}`,
    date: item.date,
    read: item.status === "Read",
    pageId: item.id,
  }));
  return saveDashboardData({ ...data, notifications });
};

export const getSettingsData = () => {
  const user = readStorage("currentUser", null);
  const dashboard = getDashboardData();
  const defaults = {
    profile: {
      name: user?.name || localStorage.getItem("userFullName") || "Dr. Rajesh Kumar",
      role: user?.role || "Principal Investigator",
      department: "Cardiology",
      email: user?.email || "pi@trainxt.com",
      phone: "+91 98765 43210",
      institute: "Apollo Hospital — Clinical Research Site",
      siteName: "Apollo Hospital, Hyderabad",
      status: "Active",
      studyAssignments: (dashboard.studies || []).map((s) => s.study),
      contactInfo: {
        office: "+91 40 2345 6789",
        mobile: "+91 98765 43210",
        email: "pi@trainxt.com",
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
      preferredStudies: ["747-303", "05151"],
      defaultStudyView: "All Studies",
      dashboardLayout: "Standard",
      defaultReportFormat: "PDF",
      showKpiTrends: true,
      compactTables: false,
    },
    cards: [
      { id: "profile", title: "Profile Settings", description: "PI name, site, contact & assignments" },
      { id: "notifications", title: "Notification Settings", description: "Email, SMS & alert preferences" },
      { id: "security", title: "Account Security", description: "Password, MFA, sessions & activity" },
      { id: "preferences", title: "Study Preferences", description: "Dashboard & reporting preferences" },
    ],
    lastUpdated: new Date().toLocaleString(),
  };
  const saved = readStorage(STORAGE_KEYS.settings, {});
  return {
    ...defaults,
    ...saved,
    profile: { ...defaults.profile, ...(saved.profile || {}) },
    notificationPreferences: {
      ...defaults.notificationPreferences,
      ...(saved.notificationPreferences || {}),
    },
    studyPreferences: {
      ...defaults.studyPreferences,
      ...(saved.studyPreferences || {}),
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
      activeRecruitment: 2,
      enrolledPatients: 205,
      screeningFailures: 18,
      recruitmentTarget: 250,
      recruitmentProgress: 82,
      pipelineCount: 34,
    },
    studies: [
      { study: "747-303", target: 150, enrolled: 120, screened: 145, screenFailures: 10, status: "On Track", progress: 80 },
      { study: "05151", target: 100, enrolled: 85, screened: 98, screenFailures: 8, status: "At Risk", progress: 85 },
    ],
    pipeline: [
      { id: "P-001", subject: "SUB-006", study: "747-303", stage: "Screening", status: "In Progress", date: "18-Jun-2026" },
      { id: "P-002", subject: "SUB-007", study: "747-303", stage: "Pre-Screen", status: "Scheduled", date: "19-Jun-2026" },
      { id: "P-003", subject: "SUB-008", study: "05151", stage: "Consent", status: "Pending", date: "20-Jun-2026" },
      { id: "P-004", subject: "SUB-009", study: "05151", stage: "Enrollment", status: "Ready", date: "21-Jun-2026" },
    ],
  });

export const saveRecruitmentData = (data) => {
  writeStorage(STORAGE_KEYS.recruitment, data);
  return data;
};

export const getRegulatoryData = () =>
  readStorage(STORAGE_KEYS.regulatory, {
    kpis: {
      irbApprovals: 4,
      expiringDocuments: 3,
      complianceReviews: 2,
      regulatorySubmissions: 5,
      auditReadiness: 94,
      trainingCompliance: 97,
    },
    documents: [
      { id: "DOC-001", document: "IRB Approval", study: "747-303", status: "Active", expiry: "31-Dec-2026", owner: "PI", category: "IRB" },
      { id: "DOC-002", document: "Medical License", study: "All Studies", status: "Expiring Soon", expiry: "15-Aug-2026", owner: "Investigator", category: "License" },
      { id: "DOC-003", document: "Protocol Approval", study: "05151", status: "Approved", expiry: "—", owner: "Sponsor", category: "Protocol" },
      { id: "DOC-004", document: "GCP Training Certificate", study: "All Studies", status: "Active", expiry: "01-Jan-2027", owner: "PI", category: "Training" },
      { id: "DOC-005", document: "IRB Continuing Review", study: "747-303", status: "Pending", expiry: "30-Jul-2026", owner: "Regulatory", category: "IRB" },
      { id: "DOC-006", document: "FDA 1572 Form", study: "05151", status: "Active", expiry: "—", owner: "PI", category: "Regulatory" },
    ],
    submissions: [
      { id: "SUB-001", title: "Annual Safety Report", study: "747-303", status: "Submitted", date: "01-Jun-2026" },
      { id: "SUB-002", title: "Protocol Amendment v2.1", study: "05151", status: "Under Review", date: "10-Jun-2026" },
    ],
  });

export const saveRegulatoryData = (data) => {
  writeStorage(STORAGE_KEYS.regulatory, data);
  return data;
};

export const getSitePerformanceData = () =>
  readStorage(STORAGE_KEYS.sitePerformance, {
    kpis: {
      enrollmentPerformance: 82,
      screeningSuccessRate: 88,
      visitCompletionRate: 92,
      protocolCompliance: 96,
      queryResolutionRate: 89,
      patientRetentionRate: 94,
      dataEntryTimeliness: 91,
      studyProgress: 78,
    },
    metrics: [
      { metric: "Enrollment Performance", study: "747-303", target: "150", actual: "120", status: "On Track", value: 80 },
      { metric: "Screening Success Rate", study: "747-303", target: "90%", actual: "93%", status: "Good", value: 93 },
      { metric: "Visit Completion Rate", study: "747-303", target: "90%", actual: "92%", status: "Good", value: 92 },
      { metric: "Protocol Compliance", study: "747-303", target: "95%", actual: "97%", status: "Good", value: 97 },
      { metric: "Query Resolution Rate", study: "05151", target: "85%", actual: "89%", status: "Good", value: 89 },
      { metric: "Patient Retention Rate", study: "05151", target: "90%", actual: "94%", status: "Good", value: 94 },
      { metric: "Data Entry Timeliness", study: "05151", target: "90%", actual: "91%", status: "Good", value: 91 },
      { metric: "Study Progress", study: "05151", target: "100", actual: "85", status: "On Track", value: 85 },
    ],
    chartData: [
      { name: "Enrollment", value: 82 },
      { name: "Screening", value: 88 },
      { name: "Visits", value: 92 },
      { name: "Compliance", value: 96 },
      { name: "Queries", value: 89 },
      { name: "Retention", value: 94 },
    ],
  });

export const saveSitePerformanceData = (data) => {
  writeStorage(STORAGE_KEYS.sitePerformance, data);
  return data;
};

// UPDATED: Filter page data by selected study from navbar
export const filterByStudy = (items, selectedStudy, studyKey = "study") => {
  if (!selectedStudy || selectedStudy === "All Studies") return items;
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

// UPDATED: Clear auth session on logout from PI navbar
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
    conversations: [
      {
        id: 1,
        name: "Site Coordinator",
        unread: 2,
        messages: [
          { sender: "them", text: "Need help with Subject 101", time: "10:24 AM" },
          { sender: "me", text: "Sure, what is the issue?", time: "10:25 AM" },
        ],
      },
      {
        id: 2,
        name: "Clinical Monitor",
        unread: 1,
        messages: [{ sender: "them", text: "Visit completed successfully", time: "11:00 AM" }],
      },
      {
        id: 3,
        name: "Data Manager",
        unread: 0,
        messages: [{ sender: "them", text: "Database lock scheduled", time: "09:15 AM" }],
      },
    ],
  });

export const saveLiveChatData = (data) => {
  writeStorage(STORAGE_KEYS.liveChat, data);
  return data;
};

// UPDATED: Dynamic sidebar sections (studies section excluded — kept static in PISidebar)
export const getSidebarMenuData = () =>
  readStorage(STORAGE_KEYS.sidebarMenu, {
    sections: [
      { id: "dashboard", label: "Dashboard", icon: "home", page: "dashboard" },
      { id: "comments", label: "Comments", icon: "comments", page: "comments" },
      { id: "site-performance", label: "Site Performance", icon: "chart", page: "site-performance" },
      { id: "recruitment", label: "Recruitment", icon: "users", page: "recruitment" },
      { id: "regulatory", label: "Regulatory", icon: "university", page: "regulatory" },
      { id: "reports", label: "Reports", icon: "pie", page: "reports" },
      { id: "notifications", label: "Notifications", icon: "bell", page: "notifications" },
      { id: "settings", label: "Settings", icon: "cog", page: "settings" },
    ],
  });

export const collectAllStudies = () => {
  const studySet = new Set();
  const addStudies = (items, key = "study") => {
    (items || []).forEach((item) => {
      const val = typeof item === "string" ? item : item[key];
      if (val && val !== "All Studies") studySet.add(val);
    });
  };


  const dashboard = getDashboardData();
  addStudies(dashboard.studies);
  addStudies(getRecruitmentData().studies);
  addStudies(getRegulatoryData().documents);
  addStudies(getReportsData().reports);
  addStudies(getNotificationsPageData().items);
  addStudies(getSitePerformanceData().metrics);

  return ["All Studies", ...Array.from(studySet).sort()];
};
export const collectAllDepartments = () => {
  const settings = getSettingsData();

  return settings.profile?.department
    ? [settings.profile.department]
    : [];
};

export const getNavbarData = () => {
  const user = readStorage("currentUser", null) || readStorage("userProfile", null);
  const settings = getSettingsData();
  const allStudies = collectAllStudies();
  const allDepartments = collectAllDepartments();
  const saved = readStorage(STORAGE_KEYS.navbar, {});
  return {
    userName:
      user?.name ||
      localStorage.getItem("userFullName") ||
      localStorage.getItem("userName") ||
      settings.profile?.name ||
      "PI User",
    role: saved.selectedRole || "Principal Investigator",
    selectedRole: saved.selectedRole || "Principal Investigator",
    institute: settings.profile?.institute || "Apollo Hospital",
    allStudies,
    studies: allStudies.filter((s) => s !== "All Studies"),
    departments: allDepartments,

selectedDepartment:
  saved.selectedDepartment ||
  allDepartments[0] ||
  "",
    selectedStudy: saved.selectedStudy || "All Studies",
    ...saved,
  };
};

export const saveNavbarData = (data) => {
  writeStorage(STORAGE_KEYS.navbar, data);
  return data;
};

export const searchDashboard = (query, dashboardData) => {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results = [];
  (dashboardData.recentSubjects || []).forEach((s) => {
    if (s.subject.toLowerCase().includes(q)) {
      results.push({ type: "Subject", label: s.subject, page: "dashboard" });
    }
  });
  (dashboardData.studies || []).forEach((s) => {
    if (s.study.toLowerCase().includes(q)) {
      results.push({ type: "Study", label: s.study, page: "dashboard" });
    }
  });
  getCommentsData().forEach((c) => {
    if (
      c.subjectId?.toLowerCase().includes(q) ||
      c.comment?.toLowerCase().includes(q)
    ) {
      results.push({ type: "Comment", label: c.subjectId, page: "comments" });
    }
  });
  return results;
};

export const syncKpisFromData = (data) => {
  const totalEnrolled = (data.studies || []).reduce(
    (sum, s) => sum + Number(s.enrolled || 0),
    0
  );
  const totalTarget = (data.studies || []).reduce(
    (sum, s) => sum + Number(s.target || 0),
    0
  );
  const activeSubjects = (data.recentSubjects || []).filter(
    (s) => s.status === "Active"
  ).length;
  const studiesCount = (data.studies || []).length;
  const comments = getCommentsData();
  const commentsCount = comments.length;
  const openComments = comments.filter((c) => c.status === "unresolved").length;
  const completedVisits = (data.upcomingVisits || []).length;
  const visitCompletion =
    completedVisits > 0
      ? Math.min(
          100,
          Math.round(
            ((data.recentSubjects || []).filter((s) => s.status === "Completed")
              .length /
              Math.max((data.recentSubjects || []).length, 1)) *
              100
          ) || data.kpis?.visitCompletion || 92
        )
      : data.kpis?.visitCompletion || 92;
  const consented = (data.recentSubjects || []).filter(
    (s) => s.status === "Active" || s.status === "Completed"
  ).length;
  const consentRate =
    (data.recentSubjects || []).length > 0
      ? Math.round(
          (consented / (data.recentSubjects || []).length) * 100
        )
      : data.kpis?.consentRate || 88;

  return {
    ...data,
    kpis: {
      ...data.kpis,
      enrollmentCount: totalEnrolled || data.kpis?.enrollmentCount,
      targetCount: totalTarget || data.kpis?.targetCount,
      activeSubjects: activeSubjects || data.kpis?.activeSubjects,
      studiesCount: studiesCount || data.kpis?.studiesCount || 0,
      commentsCount: commentsCount || data.kpis?.commentsCount || 0,
      openComments: openComments || data.kpis?.openComments || 0,
      visitCompletion,
      consentRate,
      pendingTasks: studiesCount,
      comments: commentsCount,
    },
  };
};

export const filterVisitsByDate = (visits, selectedDate) => {
  if (!selectedDate) return visits || [];
  const target = new Date(selectedDate).toDateString();
  return (visits || []).filter(
    (visit) => new Date(visit.date).toDateString() === target
  );
};

export const getVisitsForDate = (visits, date) => {
  if (!date) return [];
  const target = new Date(date).toDateString();
  return (visits || []).filter(
    (visit) => new Date(visit.date).toDateString() === target
  );
};

export const recalculateSitePerformanceKpis = (data) => {
  const metrics = data.metrics || [];
  const avg = (predicate) => {
    const matched = metrics.filter(predicate);
    if (!matched.length) return 0;
    return Math.round(
      matched.reduce((sum, m) => sum + Number(m.value || 0), 0) / matched.length
    );
  };

  const kpis = {
    enrollmentPerformance: avg((m) => m.metric.includes("Enrollment")),
    screeningSuccessRate: avg((m) => m.metric.includes("Screening")),
    visitCompletionRate: avg((m) => m.metric.includes("Visit")),
    protocolCompliance: avg((m) => m.metric.includes("Protocol")),
    queryResolutionRate: avg((m) => m.metric.includes("Query")),
    patientRetentionRate: avg((m) => m.metric.includes("Retention")),
    dataEntryTimeliness: avg((m) => m.metric.includes("Data")),
    studyProgress: avg((m) => m.metric.includes("Study Progress")),
  };

  const chartData = [
    { name: "Enrollment", value: kpis.enrollmentPerformance || data.kpis?.enrollmentPerformance || 82 },
    { name: "Screening", value: kpis.screeningSuccessRate || data.kpis?.screeningSuccessRate || 88 },
    { name: "Visits", value: kpis.visitCompletionRate || data.kpis?.visitCompletionRate || 92 },
    { name: "Compliance", value: kpis.protocolCompliance || data.kpis?.protocolCompliance || 96 },
    { name: "Queries", value: kpis.queryResolutionRate || data.kpis?.queryResolutionRate || 89 },
    { name: "Retention", value: kpis.patientRetentionRate || data.kpis?.patientRetentionRate || 94 },
  ];

  return {
    ...data,
    kpis: { ...data.kpis, ...kpis },
    chartData,
    lastUpdated: new Date().toLocaleString(),
  };
};

export const recalculateRecruitmentKpis = (data, dashboard) => {
  const studies = data.studies || [];
  const pipeline = data.pipeline || [];
  const synced = dashboard ? syncKpisFromData(dashboard) : null;
  return {
    ...data,
    kpis: {
      ...data.kpis,
      activeRecruitment: studies.filter((s) => s.status !== "Completed").length,
      enrolledPatients: synced?.kpis?.enrollmentCount ?? studies.reduce((s, st) => s + Number(st.enrolled || 0), 0),
      screeningFailures: studies.reduce((s, st) => s + Number(st.screenFailures || 0), 0),
      recruitmentTarget: synced?.kpis?.targetCount ?? studies.reduce((s, st) => s + Number(st.target || 0), 0),
      recruitmentProgress: synced
        ? Math.round((synced.kpis.enrollmentCount / Math.max(synced.kpis.targetCount, 1)) * 100)
        : data.kpis?.recruitmentProgress || 0,
      pipelineCount: pipeline.length,
    },
  };
};

