import { getFilteredStudies } from "../../../services/filterService";
import { getStudies } from "../../../services/studyService";
import {
  getNotifications as getAdminNotifications,
  getRecruitment as getAdminRecruitment,
  getRegulatoryDocs,
  getReports as getAdminReports,
  getSitePerformance,
  getSites as getAdminSites,
} from "../../../services/adminService";

const STORAGE_PREFIX = "sponsor_data_";
const SETTINGS_KEY = "sponsor_settings";
const RISKS_KEY = `${STORAGE_PREFIX}risks`;

function readJson(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(
    new CustomEvent("sponsor-data-updated", { detail: { key } }),
  );
}

function mapStudyToPortfolio(study) {
  return {
    studyId: study.code,
    studyName: study.name,
    phase: study.phase || "Phase I",
    status: study.status || "Active",
    cro: study.cro || "",
    sites: study.sites || 1,
    enrolled: Number(study.enrolled) || 0,
    target: Number(study.targetSubjects) || 0,
    startDate: study.startDate || "",
    therapeuticArea: study.indication || "General",
  };
}

export function getPortfolioStudies() {
  const enterpriseStudies = getFilteredStudies();
  if (enterpriseStudies.length > 0) {
    return enterpriseStudies.map(mapStudyToPortfolio);
  }

  const allStudies = getStudies();
  return allStudies.map(mapStudyToPortfolio);
}

export function savePortfolioStudies(data) {
  writeJson(`${STORAGE_PREFIX}portfolioStudies`, data);
}

export function getOversightStudies() {
  return getPortfolioStudies().map((study) => {
    const rate = study.target
      ? Math.round((study.enrolled / study.target) * 100)
      : 0;

    return {
      studyId: study.studyId,
      studyName: study.studyName,
      status: rate >= 70 ? "On Track" : study.enrolled > 0 ? "Delayed" : "Planning",
      progress: Math.min(rate, 100),
      enrollment: `${study.enrolled}/${study.target}`,
      milestone: study.status || "Active",
      nextReview: study.startDate || "—",
    };
  });
}

export function saveOversightStudies(data) {
  writeJson(`${STORAGE_PREFIX}oversightStudies`, data);
}

export function getCROs() {
  const studies = getPortfolioStudies();
  const croMap = new Map();

  studies.forEach((study) => {
    if (!study.cro) return;

    const existing = croMap.get(study.cro) || {
      id: `CRO-${study.cro}`,
      name: study.cro,
      studies: 0,
      sites: 0,
      performance: 90,
      status: "Active",
      contact: "—",
    };

    existing.studies += 1;
    existing.sites += Number(study.sites) || 0;
    croMap.set(study.cro, existing);
  });

  try {
    const recruited = JSON.parse(
      localStorage.getItem("sponsorRecruitedCROs") || "[]",
    );
    recruited.forEach((name) => {
      if (name && !croMap.has(name)) {
        croMap.set(name, {
          id: `CRO-${name}`,
          name,
          studies: 0,
          sites: 0,
          performance: 90,
          status: "Active",
          contact: "—",
        });
      }
    });
  } catch {
    /* ignore */
  }

  return Array.from(croMap.values());
}

export function saveCROs(data) {
  writeJson(`${STORAGE_PREFIX}cros`, data);
  window.dispatchEvent(new Event("sponsor-data-updated"));
}

export function getSites() {
  const adminSites = getAdminSites();
  if (adminSites.length > 0) {
    return adminSites.map((site) => ({
      id: site.id || site.siteNumber,
      name: site.name,
      study: site.study || "—",
      enrolled: site.enrolled || 0,
      target: site.target || 0,
      performance: site.performance || 0,
      region: site.region || site.country || "—",
    }));
  }

  const performance = getSitePerformance();
  return performance.map((item) => ({
    id: item.id || item.siteName,
    name: item.siteName || item.name,
    study: item.study || "—",
    enrolled: item.enrolled || 0,
    target: item.target || 0,
    performance: item.performance || 0,
    region: item.region || "—",
  }));
}

export function saveSites(data) {
  writeJson(`${STORAGE_PREFIX}sites`, data);
}

export function getRecruitment() {
  const records = getAdminRecruitment();
  return records.map((item) => ({
    id: item.id,
    study: item.study || item.studyCode || "—",
    screened: item.screened || 0,
    enrolled: item.enrolled || 0,
    target: item.target || 0,
    rate: item.rate || 0,
    status: item.status || "On Track",
  }));
}

export function saveRecruitment(data) {
  writeJson(`${STORAGE_PREFIX}recruitment`, data);
}

export function getRegulatory() {
  return getRegulatoryDocs().map((doc) => ({
    id: doc.id,
    study: doc.study || doc.studyCode || "—",
    document: doc.document || doc.name || "—",
    status: doc.status || "Submitted",
    authority: doc.authority || "—",
    dueDate: doc.dueDate || "—",
    submittedDate: doc.submittedDate || null,
  }));
}

export function saveRegulatory(data) {
  writeJson(`${STORAGE_PREFIX}regulatory`, data);
}

export function getRisks() {
  return readJson(RISKS_KEY, []);
}

export function saveRisks(data) {
  writeJson(RISKS_KEY, data);
}

export function getReports() {
  return getAdminReports().map((report) => ({
    id: report.id,
    name: report.name || report.title,
    type: report.type || "General",
    study: report.study || "All",
    generatedDate: report.generatedDate || report.date || "—",
    status: report.status || "Ready",
  }));
}

export function saveReports(data) {
  writeJson(`${STORAGE_PREFIX}reports`, data);
}

export function getNotifications() {
  return getAdminNotifications().map((item) => ({
    id: item.id,
    type: item.type || "Alert",
    message: item.message || item.title || "—",
    severity: item.severity || "Medium",
    date: item.date || item.timestamp || "—",
    read: Boolean(item.read),
  }));
}

export function saveNotifications(data) {
  writeJson(`${STORAGE_PREFIX}notifications`, data);
}

export function getAlerts() {
  const regKpis = getRegulatoryKPIs();
  const recKpis = getRecruitmentKPIs();
  const riskKpis = getRiskKPIs();
  const notifKpis = getNotificationKPIs();
  const croKpis = getCROKPIs();
  const alerts = [];

  if (regKpis.overdue > 0) {
    alerts.push({
      id: "ALT-REG",
      message: `${regKpis.overdue} regulatory document${regKpis.overdue > 1 ? "s" : ""} overdue`,
      severity: "Critical",
      module: "Regulatory",
    });
  }

  if (recKpis.belowTarget > 0) {
    alerts.push({
      id: "ALT-REC",
      message: `${recKpis.belowTarget} stud${recKpis.belowTarget > 1 ? "ies" : "y"} below enrollment target`,
      severity: "High",
      module: "Recruitment",
    });
  }

  if (riskKpis.open > 0) {
    alerts.push({
      id: "ALT-RISK",
      message: `${riskKpis.open} open risk${riskKpis.open > 1 ? "s" : ""} requiring attention`,
      severity: riskKpis.critical > 0 ? "Critical" : "High",
      module: "Risk Management",
    });
  }

  if (notifKpis.unread > 0) {
    alerts.push({
      id: "ALT-NOT",
      message: `${notifKpis.unread} unread notification${notifKpis.unread > 1 ? "s" : ""}`,
      severity: notifKpis.critical > 0 ? "Critical" : "High",
      module: "Notifications",
    });
  }

  if (croKpis.total > 0) {
    alerts.push({
      id: "ALT-CRO",
      message: `${croKpis.active} active CRO partner${croKpis.active > 1 ? "s" : ""} — performance review due`,
      severity: "Medium",
      module: "CRO Oversight",
    });
  }

  return alerts;
}

export function saveAlerts(data) {
  writeJson(`${STORAGE_PREFIX}alerts`, data);
}

export function getQuickActions() {
  const kpis = getDashboardKPIs();
  return [
    {
      id: "QA-001",
      label: "Create Study",
      value: String(kpis.portfolio),
      subtitle: "Portfolio studies",
      icon: "study",
      color: "#2563eb",
      bg: "#eff6ff",
      route: "/portfolio",
    },
    {
      id: "QA-002",
      label: "Review Risks",
      value: String(kpis.risks),
      subtitle: "Open risks",
      icon: "risk",
      color: "#dc2626",
      bg: "#fee2e2",
      route: "/risk-management",
    },
    {
      id: "QA-003",
      label: "Generate Report",
      value: String(kpis.reports),
      subtitle: "Ready reports",
      icon: "report",
      color: "#7c3aed",
      bg: "#ede9fe",
      route: "/reports",
    },
    {
      id: "QA-004",
      label: "View Recruitment",
      value: `${kpis.recruitment}%`,
      subtitle: "Enrollment rate",
      icon: "recruitment",
      color: "#16a34a",
      bg: "#ecfdf5",
      route: "/recruitment",
    },
    {
      id: "QA-005",
      label: "CRO Dashboard",
      value: String(kpis.cros),
      subtitle: "Active CROs",
      icon: "cro",
      color: "#d97706",
      bg: "#fef3c7",
      route: "/cro-oversight",
    },
  ];
}

export function saveQuickActions(data) {
  writeJson(`${STORAGE_PREFIX}quickActions`, data);
}

export function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const defaults = {
      firstName: currentUser.firstName || "Sponsor",
      lastName: currentUser.lastName || "User",
      fullName: currentUser.name || "Sponsor User",
      email: currentUser.email || "",
      employeeId: currentUser.employeeId || "",
      phone: currentUser.phone || "",
      jobTitle: currentUser.jobTitle || "",
      department: currentUser.department || "",
      organization: currentUser.organization || "",
      country: currentUser.country || "",
      timeZone: currentUser.timeZone || "UTC",
      language: "English",
      profilePhoto: currentUser.profilePhoto || "",
      emailAlerts: true,
      smsAlerts: false,
      criticalOnly: false,
      enrollmentAlerts: true,
      regulatoryAlerts: true,
      theme: "light",
    };

    if (stored) {
      return { ...defaults, ...JSON.parse(stored) };
    }

    return defaults;
  } catch {
    return {};
  }
}

export function saveSettings(data) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
  window.dispatchEvent(
    new CustomEvent("sponsor-data-updated", { detail: { key: "settings" } }),
  );
}

export function syncQuickActionValues() {
  return getQuickActions();
}

export function getEnrollmentTrend() {
  const portfolio = getPortfolioStudies();
  if (!portfolio.length) return [];

  return portfolio.slice(0, 6).map((study, index) => ({
    month: study.studyId || `S${index + 1}`,
    enrolled: study.enrolled || 0,
  }));
}

export function useSponsorDataRefresh(callback) {
  const handler = () => callback();
  window.addEventListener("sponsor-data-updated", handler);
  window.addEventListener("studies-updated", handler);
  window.addEventListener("subjects-updated", handler);
  window.addEventListener("reports-updated", handler);
  window.addEventListener("notifications-updated", handler);
  return () => {
    window.removeEventListener("sponsor-data-updated", handler);
    window.removeEventListener("studies-updated", handler);
    window.removeEventListener("subjects-updated", handler);
    window.removeEventListener("reports-updated", handler);
    window.removeEventListener("notifications-updated", handler);
  };
}

export function getDashboardKPIs() {
  const portfolio = getPortfolioStudies();
  const cros = getCROs();
  const risks = getRisks();
  const reports = getReports();
  const notifications = getNotifications();

  const activeStudies = portfolio.filter((s) =>
    ["Active", "Recruiting"].includes(s.status),
  ).length;
  const totalEnrolled = portfolio.reduce(
    (sum, s) => sum + (s.enrolled || 0),
    0,
  );
  const totalTarget = portfolio.reduce((sum, s) => sum + (s.target || 0), 0);
  const openRisks = risks.filter((r) => r.status === "Open").length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return {
    portfolio: portfolio.length,
    studies: activeStudies,
    cros: cros.filter((c) => c.status === "Active").length,
    recruitment: Math.round((totalEnrolled / Math.max(totalTarget, 1)) * 100),
    recruitmentCount: totalEnrolled,
    risks: openRisks,
    reports: reports.filter((r) => r.status === "Ready").length,
    notifications: unreadNotifications,
    totalNotifications: notifications.length,
  };
}

export function getEnrollmentByStudy() {
  return getPortfolioStudies().map((s) => ({
    study: s.studyId,
    enrolled: s.enrolled || 0,
  }));
}

export function getStudyStatusData() {
  const portfolio = getPortfolioStudies();
  const statusCounts = {};
  portfolio.forEach((s) => {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
  });
  return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
}

export function getPhaseDistribution() {
  const portfolio = getPortfolioStudies();
  const phaseCounts = {};
  portfolio.forEach((s) => {
    phaseCounts[s.phase] = (phaseCounts[s.phase] || 0) + 1;
  });
  return Object.entries(phaseCounts).map(([phase, studies]) => ({
    phase,
    studies,
  }));
}

export function getEnrollmentStatusPie() {
  const portfolio = getPortfolioStudies();
  let onTrack = 0;
  let belowTarget = 0;
  let completed = 0;

  portfolio.forEach((s) => {
    const rate = s.target ? (s.enrolled / s.target) * 100 : 0;
    if (s.status === "Completed") completed += 1;
    else if (rate >= 70) onTrack += 1;
    else belowTarget += 1;
  });

  return [
    { name: "On Track", value: onTrack },
    { name: "Below Target", value: belowTarget },
    { name: "Completed", value: completed },
  ].filter((d) => d.value > 0);
}

export function getPortfolioKPIs() {
  const studies = getPortfolioStudies();
  return {
    total: studies.length,
    active: studies.filter((s) => s.status === "Active").length,
    recruiting: studies.filter((s) => s.status === "Recruiting").length,
    completed: studies.filter((s) => s.status === "Completed").length,
    planning: studies.filter((s) => s.status === "Planning").length,
  };
}

export function getOversightKPIs() {
  const studies = getOversightStudies();
  return {
    total: studies.length,
    onTrack: studies.filter((s) => s.status === "On Track").length,
    delayed: studies.filter((s) => s.status === "Delayed").length,
    completed: studies.filter((s) => s.status === "Completed").length,
  };
}

export function getCROKPIs() {
  const cros = getCROs();
  const avgPerf = cros.length
    ? Math.round(cros.reduce((s, c) => s + c.performance, 0) / cros.length)
    : 0;
  return {
    total: cros.length,
    active: cros.filter((c) => c.status === "Active").length,
    avgPerformance: avgPerf,
    totalStudies: cros.reduce((s, c) => s + c.studies, 0),
  };
}

export function getRecruitmentKPIs() {
  const rec = getRecruitment();
  const totalEnrolled = rec.reduce((s, r) => s + r.enrolled, 0);
  const totalTarget = rec.reduce((s, r) => s + r.target, 0);
  return {
    totalStudies: rec.length,
    enrolled: totalEnrolled,
    target: totalTarget,
    rate: Math.round((totalEnrolled / Math.max(totalTarget, 1)) * 100),
    belowTarget: rec.filter((r) => r.status === "Below Target").length,
  };
}

export function getRegulatoryKPIs() {
  const reg = getRegulatory();
  return {
    total: reg.length,
    approved: reg.filter((r) => r.status === "Approved").length,
    inReview: reg.filter((r) => r.status === "In Review").length,
    submitted: reg.filter((r) => r.status === "Submitted").length,
    overdue: reg.filter((r) => r.status === "Overdue").length,
  };
}

export function getRiskKPIs() {
  const risks = getRisks();
  return {
    total: risks.length,
    critical: risks.filter((r) => r.severity === "Critical").length,
    high: risks.filter((r) => r.severity === "High").length,
    medium: risks.filter((r) => r.severity === "Medium").length,
    low: risks.filter((r) => r.severity === "Low").length,
    open: risks.filter((r) => r.status === "Open").length,
    resolved: risks.filter(
      (r) => r.status === "Closed" || r.status === "Mitigated",
    ).length,
  };
}

export function getReportKPIs() {
  const reports = getReports();
  return {
    total: reports.length,
    ready: reports.filter((r) => r.status === "Ready").length,
    pending: reports.filter((r) => r.status === "Pending").length,
  };
}

export function getNotificationKPIs() {
  const notifications = getNotifications();
  return {
    total: notifications.length,
    critical: notifications.filter((n) => n.severity === "Critical").length,
    high: notifications.filter((n) => n.severity === "High").length,
    unread: notifications.filter((n) => !n.read).length,
    resolved: notifications.filter((n) => n.read).length,
  };
}

export function getSiteKPIs() {
  const sites = getSites();
  const avgPerf = sites.length
    ? Math.round(sites.reduce((s, site) => s + site.performance, 0) / sites.length)
    : 0;
  return {
    total: sites.length,
    avgPerformance: avgPerf,
    totalEnrolled: sites.reduce((s, site) => s + site.enrolled, 0),
  };
}

export const SEVERITY_COLORS = {
  Critical: "#dc2626",
  High: "#ea580c",
  Medium: "#ca8a04",
  Low: "#2563eb",
};
