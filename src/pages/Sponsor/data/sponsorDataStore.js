import { getFilteredStudies } from '../../../services/filterService';
import { getStudies } from '../../../services/studyService';
import {
  getNotifications as getAdminNotifications,
  markNotificationRead as markAdminNotificationRead,
  markAllNotificationsRead as markAllAdminNotificationsRead,
  getRecruitment as getAdminRecruitment,
  getRegulatoryDocs,
  getReports as getAdminReports,
  getSitePerformance,
  getSites as getAdminSites,
} from '../../../services/adminService';

const STORAGE_PREFIX = 'sponsor_data_';
const SETTINGS_KEY = 'sponsor_settings';
const SUBSCRIPTION_KEY = 'sponsor_subscription';
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
    new CustomEvent('sponsor-data-updated', {
      detail: { key },
    })
  );
}

function getSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function mapStudyToPortfolio(study = {}) {
  return {
    studyId: study.code || study.studyId || study.id || '',
    studyName: study.name || study.studyName || '',
    phase: study.phase || '',
    status: study.status || '',
    cro: study.cro || study.croName || '',
    sites: Number(study.sites || study.siteCount || 0),
    enrolled: Number(study.enrolled || study.enrolledSubjects || 0),
    target: Number(study.targetSubjects || study.target || 0),
    startDate: study.startDate || '',
    therapeuticArea: study.indication || study.therapeuticArea || '',
  };
}

export function getPortfolioStudies() {
  const filteredStudies = getSafeArray(getFilteredStudies());

  if (filteredStudies.length > 0) {
    return filteredStudies.map(mapStudyToPortfolio);
  }

  const allStudies = getSafeArray(getStudies());
  return allStudies.map(mapStudyToPortfolio);
}

export function savePortfolioStudies(data) {
  writeJson(`${STORAGE_PREFIX}portfolioStudies`, data);
}

export function getOversightStudies() {
  return getPortfolioStudies().map((study) => {
    const progress =
      study.target > 0
        ? Math.min(Math.round((study.enrolled / study.target) * 100), 100)
        : 0;

    return {
      studyId: study.studyId,
      studyName: study.studyName,
      status:
        study.status === 'Completed'
          ? 'Completed'
          : progress >= 70
            ? 'On Track'
            : study.enrolled > 0
              ? 'Delayed'
              : 'Planning',
      progress,
      enrollment: `${study.enrolled}/${study.target}`,
      milestone: study.status || '',
      nextReview: study.startDate || '',
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
    if (!study.cro) {
      return;
    }

    const existing = croMap.get(study.cro) || {
      id: `CRO-${study.cro}`,
      name: study.cro,
      studies: 0,
      sites: 0,
      performance: 0,
      status: 'Active',
      contact: '',
    };

    existing.studies += 1;
    existing.sites += Number(study.sites) || 0;

    croMap.set(study.cro, existing);
  });

  const recruitedCROs = readJson('sponsorRecruitedCROs', []);

  getSafeArray(recruitedCROs).forEach((cro) => {
    const croName = typeof cro === 'string' ? cro : cro?.name;

    if (!croName || croMap.has(croName)) {
      return;
    }

    croMap.set(croName, {
      id: cro?.id || `CRO-${croName}`,
      name: croName,
      studies: Number(cro?.studies || 0),
      sites: Number(cro?.sites || 0),
      performance: Number(cro?.performance || 0),
      status: cro?.status || 'Active',
      contact: cro?.contact || '',
    });
  });

  return Array.from(croMap.values());
}

export function saveCROs(data) {
  writeJson(`${STORAGE_PREFIX}cros`, data);
}

export function getSites() {
  const adminSites = getSafeArray(getAdminSites());

  if (adminSites.length > 0) {
    return adminSites.map((site = {}) => ({
      id: site.id || site.siteNumber || '',
      name: site.name || '',
      study: site.study || site.studyCode || '',
      enrolled: Number(site.enrolled || 0),
      target: Number(site.target || 0),
      performance: Number(site.performance || 0),
      region: site.region || site.country || '',
    }));
  }

  return getSafeArray(getSitePerformance()).map((site = {}) => ({
    id: site.id || site.siteNumber || site.siteName || '',
    name: site.siteName || site.name || '',
    study: site.study || site.studyCode || '',
    enrolled: Number(site.enrolled || 0),
    target: Number(site.target || 0),
    performance: Number(site.performance || 0),
    region: site.region || site.country || '',
  }));
}

export function saveSites(data) {
  writeJson(`${STORAGE_PREFIX}sites`, data);
}

export function getRecruitment() {
  return getSafeArray(getAdminRecruitment()).map((item = {}) => ({
    id: item.id || '',
    study: item.study || item.studyCode || '',
    screened: Number(item.screened || 0),
    enrolled: Number(item.enrolled || 0),
    target: Number(item.target || 0),
    rate: Number(item.rate || 0),
    status: item.status || '',
  }));
}

export function saveRecruitment(data) {
  writeJson(`${STORAGE_PREFIX}recruitment`, data);
}

export function getRegulatory() {
  return getSafeArray(getRegulatoryDocs()).map((doc = {}) => ({
    id: doc.id || '',
    study: doc.study || doc.studyCode || '',
    document: doc.document || doc.name || '',
    status: doc.status || '',
    authority: doc.authority || '',
    dueDate: doc.dueDate || '',
    submittedDate: doc.submittedDate || '',
  }));
}

export function saveRegulatory(data) {
  writeJson(`${STORAGE_PREFIX}regulatory`, data);
}

export function getRisks() {
  return getSafeArray(readJson(RISKS_KEY, []));
}

export function saveRisks(data) {
  writeJson(RISKS_KEY, data);
}

export function getReports() {
  return getSafeArray(getAdminReports()).map((report = {}) => ({
    id: report.id || '',
    name: report.name || report.title || '',
    type: report.type || '',
    study: report.study || report.studyCode || '',
    generatedDate: report.generatedDate || report.date || '',
    status: report.status || '',
  }));
}

export function saveReports(data) {
  writeJson(`${STORAGE_PREFIX}reports`, data);
}

// Shared notification records (services/notificationService.js, written by
// every role's subject/visit/document/report/comment/permission actions)
// carry title/message/studyCode/createdAt/read -- not the type/severity/date
// shape this page expects. This map derives a severity from the record's
// title so the Critical/High/Medium/Low badges and filters here reflect
// something real instead of always being blank.
const NOTIFICATION_SEVERITY_BY_TITLE = {
  'Permission request submitted': 'High',
  'Permission request rejected': 'High',
  'Permission request approved': 'Medium',
  'Document added': 'Medium',
  'Report created': 'Medium',
  'Report updated': 'Medium',
  'Visit scheduled': 'Medium',
  'Visit updated': 'Medium',
  'Subject added': 'Low',
  'Subject updated': 'Low',
  'New comment': 'Low',
};

function formatSponsorNotificationDate(isoString) {
  const parsed = new Date(isoString);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getNotifications() {
  return getSafeArray(getAdminNotifications()).map((item = {}) => ({
    id: item.id || '',
    type: item.title || '',
    message: item.message || item.title || '',
    severity: NOTIFICATION_SEVERITY_BY_TITLE[item.title] || 'Medium',
    date: formatSponsorNotificationDate(item.createdAt),
    read: Boolean(item.read),
  }));
}

// Diffs the incoming (page-local, optimistic) items against the shared
// notification records and marks any newly-read ids through the shared
// service, so "read" actually persists instead of being written to a
// sponsor-only key that getNotifications() never reads back from.
export function saveNotifications(data) {
  const items = getSafeArray(data);

  const previouslyUnreadIds = new Set(
    getSafeArray(getAdminNotifications())
      .filter((item) => !item.read)
      .map((item) => item.id)
  );

  items.forEach((item) => {
    if (item.read && previouslyUnreadIds.has(item.id)) {
      markAdminNotificationRead(item.id);
    }
  });
}

// Exposed for callers (e.g. a future "mark all read" action) that want to
// go through the shared service directly rather than diffing a full item
// list via saveNotifications().
export function markAllNotificationsRead() {
  markAllAdminNotificationsRead();
}

export function getAlerts() {
  const regulatoryKPIs = getRegulatoryKPIs();
  const recruitmentKPIs = getRecruitmentKPIs();
  const riskKPIs = getRiskKPIs();
  const notificationKPIs = getNotificationKPIs();
  const croKPIs = getCROKPIs();

  const alerts = [];

  if (regulatoryKPIs.overdue > 0) {
    alerts.push({
      id: 'ALT-REG',
      message: `${regulatoryKPIs.overdue} regulatory document${
        regulatoryKPIs.overdue > 1 ? 's' : ''
      } overdue`,
      severity: 'Critical',
      module: 'Regulatory',
    });
  }

  if (recruitmentKPIs.belowTarget > 0) {
    alerts.push({
      id: 'ALT-REC',
      message: `${recruitmentKPIs.belowTarget} ${
        recruitmentKPIs.belowTarget > 1 ? 'studies' : 'study'
      } below enrollment target`,
      severity: 'High',
      module: 'Recruitment',
    });
  }

  if (riskKPIs.open > 0) {
    alerts.push({
      id: 'ALT-RISK',
      message: `${riskKPIs.open} open risk${
        riskKPIs.open > 1 ? 's' : ''
      } requiring attention`,
      severity: riskKPIs.critical > 0 ? 'Critical' : 'High',
      module: 'Risk Management',
    });
  }

  if (notificationKPIs.unread > 0) {
    alerts.push({
      id: 'ALT-NOT',
      message: `${notificationKPIs.unread} unread notification${
        notificationKPIs.unread > 1 ? 's' : ''
      }`,
      severity: notificationKPIs.critical > 0 ? 'Critical' : 'High',
      module: 'Notifications',
    });
  }

  if (croKPIs.total > 0) {
    alerts.push({
      id: 'ALT-CRO',
      message: `${croKPIs.active} active CRO partner${
        croKPIs.active > 1 ? 's' : ''
      }`,
      severity: 'Medium',
      module: 'CRO Oversight',
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
      id: 'QA-001',
      label: 'Create Study',
      value: String(kpis.portfolio),
      subtitle: 'Portfolio studies',
      icon: 'study',
      color: '#2563eb',
      bg: '#eff6ff',
      route: '/portfolio',
    },
    {
      id: 'QA-002',
      label: 'Review Risks',
      value: String(kpis.risks),
      subtitle: 'Open risks',
      icon: 'risk',
      color: '#dc2626',
      bg: '#fee2e2',
      route: '/risk-management',
    },
    {
      id: 'QA-003',
      label: 'Generate Report',
      value: String(kpis.reports),
      subtitle: 'Ready reports',
      icon: 'report',
      color: '#7c3aed',
      bg: '#ede9fe',
      route: '/reports',
    },
    {
      id: 'QA-004',
      label: 'View Recruitment',
      value: `${kpis.recruitment}%`,
      subtitle: 'Enrollment rate',
      icon: 'recruitment',
      color: '#16a34a',
      bg: '#ecfdf5',
      route: '/recruitment',
    },
    {
      id: 'QA-005',
      label: 'CRO Dashboard',
      value: String(kpis.cros),
      subtitle: 'Active CROs',
      icon: 'cro',
      color: '#d97706',
      bg: '#fef3c7',
      route: '/cro-oversight',
    },
  ];
}

export function saveQuickActions(data) {
  writeJson(`${STORAGE_PREFIX}quickActions`, data);
}

export function loadSettings() {
  const currentUser = readJson('currentUser', {});
  const storedSettings = readJson(SETTINGS_KEY, {});

  return {
    firstName: currentUser.firstName || '',
    lastName: currentUser.lastName || '',
    fullName: currentUser.name || '',
    employeeId: currentUser.employeeId || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    jobTitle: currentUser.jobTitle || '',
    department: currentUser.department || '',
    organization: currentUser.organization || '',
    country: currentUser.country || '',
    timeZone: currentUser.timeZone || '',
    language: currentUser.language || '',
    profilePhoto: currentUser.profilePhoto || '',
    digitalSignature: currentUser.digitalSignature || '',
    emailAlerts: false,
    smsAlerts: false,
    criticalOnly: false,
    enrollmentAlerts: false,
    regulatoryAlerts: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    sessionTimeout: false,
    defaultStudyView: '',
    dashboardRefresh: '',
    preferredTherapeuticArea: '',
    showCompletedStudies: false,
    theme: '',
    ...storedSettings,
  };
}

export function saveSettings(data) {
  writeJson(SETTINGS_KEY, data);
}

export function getSubscription() {
  return readJson(SUBSCRIPTION_KEY, {
    plan: '',
    status: '',
    startDate: '',
    endDate: '',
    maxUsers: '',
    maxStudies: '',
    storageLimit: '',
    autoRenewal: false,
    notes: '',
  });
}

export function saveSubscription(data) {
  writeJson(SUBSCRIPTION_KEY, data);
}

export function getAllSubjectsFromStorage() {
  const subjects = readJson('subjects', []);
  return getSafeArray(subjects);
}

export function syncQuickActionValues() {
  return getQuickActions();
}

export function getEnrollmentTrend() {
  return getPortfolioStudies().slice(0, 6).map((study, index) => ({
    month: study.studyId || `Study ${index + 1}`,
    enrolled: Number(study.enrolled || 0),
  }));
}

export function useSponsorDataRefresh(callback) {
  const handler = () => callback();

  window.addEventListener('sponsor-data-updated', handler);
  window.addEventListener('studies-updated', handler);
  window.addEventListener('subjects-updated', handler);
  window.addEventListener('reports-updated', handler);
  window.addEventListener('notifications-updated', handler);

  return () => {
    window.removeEventListener('sponsor-data-updated', handler);
    window.removeEventListener('studies-updated', handler);
    window.removeEventListener('subjects-updated', handler);
    window.removeEventListener('reports-updated', handler);
    window.removeEventListener('notifications-updated', handler);
  };
}

export function getDashboardKPIs() {
  const portfolio = getPortfolioStudies();
  const cros = getCROs();
  const risks = getRisks();
  const reports = getReports();
  const notifications = getNotifications();

  const activeStudies = portfolio.filter((study) =>
    ['Active', 'Recruiting'].includes(study.status)
  ).length;

  const totalEnrolled = portfolio.reduce(
    (sum, study) => sum + Number(study.enrolled || 0),
    0
  );

  const totalTarget = portfolio.reduce(
    (sum, study) => sum + Number(study.target || 0),
    0
  );

  return {
    portfolio: portfolio.length,
    studies: activeStudies,
    cros: cros.filter((cro) => cro.status === 'Active').length,
    recruitment:
      totalTarget > 0 ? Math.round((totalEnrolled / totalTarget) * 100) : 0,
    recruitmentCount: totalEnrolled,
    risks: risks.filter((risk) => risk.status === 'Open').length,
    reports: reports.filter((report) => report.status === 'Ready').length,
    notifications: notifications.filter((notification) => !notification.read)
      .length,
    totalNotifications: notifications.length,
  };
}

export function getEnrollmentByStudy() {
  return getPortfolioStudies().map((study) => ({
    study: study.studyId,
    enrolled: Number(study.enrolled || 0),
  }));
}

export function getStudyStatusData() {
  const counts = {};

  getPortfolioStudies().forEach((study) => {
    const status = study.status || 'Unknown';
    counts[status] = (counts[status] || 0) + 1;
  });

  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
  }));
}

export function getPhaseDistribution() {
  const counts = {};

  getPortfolioStudies().forEach((study) => {
    const phase = study.phase || 'Unspecified';
    counts[phase] = (counts[phase] || 0) + 1;
  });

  return Object.entries(counts).map(([phase, studies]) => ({
    phase,
    studies,
  }));
}

export function getEnrollmentStatusPie() {
  let onTrack = 0;
  let belowTarget = 0;
  let completed = 0;

  getPortfolioStudies().forEach((study) => {
    const rate =
      study.target > 0 ? (Number(study.enrolled) / Number(study.target)) * 100 : 0;

    if (study.status === 'Completed') {
      completed += 1;
    } else if (rate >= 70) {
      onTrack += 1;
    } else {
      belowTarget += 1;
    }
  });

  return [
    { name: 'On Track', value: onTrack },
    { name: 'Below Target', value: belowTarget },
    { name: 'Completed', value: completed },
  ].filter((item) => item.value > 0);
}

export function getPortfolioKPIs() {
  const studies = getPortfolioStudies();

  return {
    total: studies.length,
    active: studies.filter((study) => study.status === 'Active').length,
    recruiting: studies.filter((study) => study.status === 'Recruiting').length,
    completed: studies.filter((study) => study.status === 'Completed').length,
    planning: studies.filter((study) => study.status === 'Planning').length,
  };
}

export function getOversightKPIs() {
  const studies = getOversightStudies();

  return {
    total: studies.length,
    onTrack: studies.filter((study) => study.status === 'On Track').length,
    delayed: studies.filter((study) => study.status === 'Delayed').length,
    completed: studies.filter((study) => study.status === 'Completed').length,
  };
}

export function getCROKPIs() {
  const cros = getCROs();

  const averagePerformance =
    cros.length > 0
      ? Math.round(
          cros.reduce(
            (sum, cro) => sum + Number(cro.performance || 0),
            0
          ) / cros.length
        )
      : 0;

  return {
    total: cros.length,
    active: cros.filter((cro) => cro.status === 'Active').length,
    avgPerformance: averagePerformance,
    totalStudies: cros.reduce(
      (sum, cro) => sum + Number(cro.studies || 0),
      0
    ),
  };
}

export function getRecruitmentKPIs() {
  const recruitment = getRecruitment();

  const totalEnrolled = recruitment.reduce(
    (sum, item) => sum + Number(item.enrolled || 0),
    0
  );

  const totalTarget = recruitment.reduce(
    (sum, item) => sum + Number(item.target || 0),
    0
  );

  return {
    totalStudies: recruitment.length,
    enrolled: totalEnrolled,
    target: totalTarget,
    rate:
      totalTarget > 0
        ? Math.round((totalEnrolled / totalTarget) * 100)
        : 0,
    belowTarget: recruitment.filter(
      (item) => item.status === 'Below Target'
    ).length,
  };
}

export function getRegulatoryKPIs() {
  const regulatory = getRegulatory();

  return {
    total: regulatory.length,
    approved: regulatory.filter((item) => item.status === 'Approved').length,
    inReview: regulatory.filter((item) => item.status === 'In Review').length,
    submitted: regulatory.filter((item) => item.status === 'Submitted').length,
    overdue: regulatory.filter((item) => item.status === 'Overdue').length,
  };
}

export function getRiskKPIs() {
  const risks = getRisks();

  return {
    total: risks.length,
    critical: risks.filter((risk) => risk.severity === 'Critical').length,
    high: risks.filter((risk) => risk.severity === 'High').length,
    medium: risks.filter((risk) => risk.severity === 'Medium').length,
    low: risks.filter((risk) => risk.severity === 'Low').length,
    open: risks.filter((risk) => risk.status === 'Open').length,
    resolved: risks.filter(
      (risk) =>
        risk.status === 'Closed' || risk.status === 'Mitigated'
    ).length,
  };
}

export function getReportKPIs() {
  const reports = getReports();

  return {
    total: reports.length,
    ready: reports.filter((report) => report.status === 'Ready').length,
    pending: reports.filter((report) => report.status === 'Pending').length,
  };
}

export function getNotificationKPIs() {
  const notifications = getNotifications();

  return {
    total: notifications.length,
    critical: notifications.filter(
      (notification) => notification.severity === 'Critical'
    ).length,
    high: notifications.filter(
      (notification) => notification.severity === 'High'
    ).length,
    unread: notifications.filter((notification) => !notification.read).length,
    resolved: notifications.filter((notification) => notification.read).length,
  };
}

export function getSiteKPIs() {
  const sites = getSites();

  const averagePerformance =
    sites.length > 0
      ? Math.round(
          sites.reduce(
            (sum, site) => sum + Number(site.performance || 0),
            0
          ) / sites.length
        )
      : 0;

  return {
    total: sites.length,
    avgPerformance: averagePerformance,
    totalEnrolled: sites.reduce(
      (sum, site) => sum + Number(site.enrolled || 0),
      0
    ),
  };
}

export const SEVERITY_COLORS = {
  Critical: '#dc2626',
  High: '#ea580c',
  Medium: '#ca8a04',
  Low: '#2563eb',
};