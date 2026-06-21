const STORAGE_PREFIX = 'sponsor_data_';

const defaultData = {
  portfolioStudies: [
    { studyId: 'TRIA-001', studyName: 'COVID-19 Phase III', phase: 'Phase III', status: 'Active', cro: 'IQVIA', sites: 35, enrolled: 2200, target: 3000, startDate: '2026-01-01', therapeuticArea: 'Infectious Disease' },
    { studyId: 'TRIA-002', studyName: 'Diabetes Efficacy Study', phase: 'Phase II', status: 'Active', cro: 'PPD', sites: 20, enrolled: 900, target: 1500, startDate: '2026-02-10', therapeuticArea: 'Endocrinology' },
    { studyId: 'TRIA-003', studyName: 'Oncology Treatment Trial', phase: 'Phase I', status: 'Recruiting', cro: 'Syneos', sites: 15, enrolled: 420, target: 600, startDate: '2026-03-05', therapeuticArea: 'Oncology' },
    { studyId: 'TRIA-004', studyName: 'Cardiovascular Safety Study', phase: 'Phase IV', status: 'Active', cro: 'ICON', sites: 30, enrolled: 3100, target: 4000, startDate: '2026-01-15', therapeuticArea: 'Cardiology' },
    { studyId: 'TRIA-005', studyName: 'Neurology Phase II', phase: 'Phase II', status: 'Planning', cro: 'Parexel', sites: 12, enrolled: 0, target: 800, startDate: '2026-06-01', therapeuticArea: 'Neurology' },
    { studyId: 'TRIA-006', studyName: 'Rheumatology Trial', phase: 'Phase III', status: 'Completed', cro: 'IQVIA', sites: 22, enrolled: 1800, target: 1800, startDate: '2025-03-01', therapeuticArea: 'Rheumatology' },
  ],
  oversightStudies: [
    { studyId: 'TRIA-001', studyName: 'COVID-19 Phase III', status: 'On Track', progress: 73, enrollment: '2200/3000', milestone: 'Interim Analysis', nextReview: '2026-07-01' },
    { studyId: 'TRIA-002', studyName: 'Diabetes Efficacy Study', status: 'Delayed', progress: 60, enrollment: '900/1500', milestone: 'Site Activation', nextReview: '2026-06-20' },
    { studyId: 'TRIA-003', studyName: 'Oncology Treatment Trial', status: 'On Track', progress: 70, enrollment: '420/600', milestone: 'First Patient In', nextReview: '2026-06-25' },
    { studyId: 'TRIA-004', studyName: 'Cardiovascular Safety Study', status: 'On Track', progress: 78, enrollment: '3100/4000', milestone: 'Database Lock Prep', nextReview: '2026-07-10' },
  ],
  cros: [
    { id: 'CRO-001', name: 'IQVIA', studies: 12, sites: 45, performance: 95, status: 'Active', contact: 'Sarah Chen' },
    { id: 'CRO-002', name: 'Parexel', studies: 8, sites: 32, performance: 90, status: 'Active', contact: 'James Wilson' },
    { id: 'CRO-003', name: 'ICON', studies: 10, sites: 28, performance: 88, status: 'Active', contact: 'Maria Lopez' },
    { id: 'CRO-004', name: 'Syneos Health', studies: 6, sites: 20, performance: 85, status: 'Active', contact: 'David Park' },
    { id: 'CRO-005', name: 'PPD', studies: 5, sites: 18, performance: 92, status: 'Active', contact: 'Emily Brown' },
  ],
  sites: [
    { id: 'S-101', name: 'City Hospital', study: 'TRIA-001', enrolled: 198, target: 250, performance: 79, region: 'North America' },
    { id: 'S-102', name: 'Apollo Medical Center', study: 'TRIA-002', enrolled: 175, target: 220, performance: 80, region: 'Europe' },
    { id: 'S-103', name: 'Care Hospital', study: 'TRIA-003', enrolled: 150, target: 200, performance: 75, region: 'Asia Pacific' },
    { id: 'S-104', name: 'Metro Research Clinic', study: 'TRIA-001', enrolled: 142, target: 180, performance: 79, region: 'North America' },
    { id: 'S-105', name: 'University Health System', study: 'TRIA-004', enrolled: 210, target: 250, performance: 84, region: 'Europe' },
  ],
  recruitment: [
    { id: 'REC-001', study: 'TRIA-001', screened: 3200, enrolled: 2200, target: 3000, rate: 73, status: 'On Track' },
    { id: 'REC-002', study: 'TRIA-002', screened: 1400, enrolled: 900, target: 1500, rate: 60, status: 'Below Target' },
    { id: 'REC-003', study: 'TRIA-003', screened: 680, enrolled: 420, target: 600, rate: 70, status: 'On Track' },
    { id: 'REC-004', study: 'TRIA-004', screened: 4100, enrolled: 3100, target: 4000, rate: 78, status: 'On Track' },
  ],
  regulatory: [
    { id: 'REG-001', study: 'TRIA-001', document: 'Protocol Amendment v3', status: 'Approved', authority: 'FDA', dueDate: '2026-05-01', submittedDate: '2026-04-15' },
    { id: 'REG-002', study: 'TRIA-002', document: 'ICF Version 2.1', status: 'In Review', authority: 'IRB', dueDate: '2026-06-30', submittedDate: '2026-06-01' },
    { id: 'REG-003', study: 'TRIA-003', document: 'IND Safety Report', status: 'Submitted', authority: 'FDA', dueDate: '2026-07-15', submittedDate: '2026-06-10' },
    { id: 'REG-004', study: 'TRIA-004', document: 'Annual Safety Report', status: 'Overdue', authority: 'EMA', dueDate: '2026-05-20', submittedDate: null },
  ],
  risks: [
    { id: 'RISK-001', study: 'TRIA-001', title: 'Enrollment Below Target', category: 'Enrollment', severity: 'High', status: 'Open', owner: 'Dr. Smith' },
    { id: 'RISK-002', study: 'TRIA-002', title: 'Protocol Deviation Trend', category: 'Protocol', severity: 'Medium', status: 'Mitigated', owner: 'Jane Doe' },
    { id: 'RISK-003', study: 'TRIA-003', title: 'Regulatory Submission Delay', category: 'Regulatory', severity: 'Critical', status: 'Open', owner: 'Regulatory Team' },
    { id: 'RISK-004', study: 'TRIA-004', title: 'Site Activation Delay', category: 'Operations', severity: 'High', status: 'Open', owner: 'Ops Lead' },
    { id: 'RISK-005', study: 'TRIA-002', title: 'Data Quality Issues', category: 'Data', severity: 'Low', status: 'Closed', owner: 'Data Manager' },
  ],
  reports: [
    { id: 'RPT-001', name: 'Monthly Enrollment Summary', type: 'Enrollment', study: 'All', generatedDate: '2026-06-01', status: 'Ready' },
    { id: 'RPT-002', name: 'Q2 Safety Report', type: 'Safety', study: 'TRIA-001', generatedDate: '2026-06-10', status: 'Ready' },
    { id: 'RPT-003', name: 'CRO Performance Review', type: 'CRO', study: 'All', generatedDate: '2026-06-12', status: 'Pending' },
    { id: 'RPT-004', name: 'Site Activation Tracker', type: 'Operations', study: 'TRIA-002', generatedDate: '2026-06-14', status: 'Ready' },
  ],
  notifications: [
    { id: 'NOT-001', type: 'Risk Alert', message: 'Critical enrollment risk detected in TRIA-003', severity: 'Critical', date: '2026-06-17', read: false },
    { id: 'NOT-002', type: 'Regulatory Alert', message: 'Annual Safety Report overdue for TRIA-004', severity: 'High', date: '2026-06-16', read: false },
    { id: 'NOT-003', type: 'Study Update', message: 'TRIA-001 reached 73% enrollment milestone', severity: 'Low', date: '2026-06-15', read: true },
    { id: 'NOT-004', type: 'CRO Alert', message: 'Syneos Health performance review due', severity: 'Medium', date: '2026-06-14', read: false },
    { id: 'NOT-005', type: 'Site Alert', message: 'Site S-103 enrollment below 80% of target', severity: 'High', date: '2026-06-13', read: true },
    { id: 'NOT-006', type: 'Document Alert', message: 'ICF document pending IRB approval', severity: 'Medium', date: '2026-06-12', read: false },
  ],
  alerts: [
    { id: 'ALT-001', message: '3 regulatory documents overdue', severity: 'Critical', module: 'Regulatory' },
    { id: 'ALT-002', message: '2 studies below enrollment target', severity: 'High', module: 'Recruitment' },
    { id: 'ALT-003', message: 'CRO performance review scheduled', severity: 'Medium', module: 'CRO Oversight' },
    { id: 'ALT-004', message: '5 unread high-priority notifications', severity: 'High', module: 'Notifications' },
  ],
  quickActions: [
    { id: 'QA-001', label: 'Create Study', value: '6', subtitle: 'Portfolio studies', icon: 'study', color: '#2563eb', bg: '#eff6ff', route: '/portfolio' },
    { id: 'QA-002', label: 'Review Risks', value: '3', subtitle: 'Open risks', icon: 'risk', color: '#dc2626', bg: '#fee2e2', route: '/risk-management' },
    { id: 'QA-003', label: 'Generate Report', value: '3', subtitle: 'Ready reports', icon: 'report', color: '#7c3aed', bg: '#ede9fe', route: '/reports' },
    { id: 'QA-004', label: 'View Recruitment', value: '73%', subtitle: 'Enrollment rate', icon: 'recruitment', color: '#16a34a', bg: '#ecfdf5', route: '/recruitment' },
    { id: 'QA-005', label: 'CRO Dashboard', value: '5', subtitle: 'Active CROs', icon: 'cro', color: '#d97706', bg: '#fef3c7', route: '/cro-oversight' },
  ],
  settings: {
    name: 'Sponsor Admin',
    email: 'sponsor@trianxt.com',
    jobTitle: 'Clinical Operations Director',
    organization: 'TriaNXT Pharmaceuticals',
    emailAlerts: true,
    smsAlerts: false,
    criticalOnly: false,
    enrollmentAlerts: true,
    regulatoryAlerts: true,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    sessionTimeout: true,
    defaultStudyView: 'grid',
    dashboardRefresh: '5',
    preferredTherapeuticArea: 'All',
    showCompletedStudies: true,
    theme: 'light',
  },
  enrollmentTrend: [
    { month: 'Jan', enrolled: 320 },
    { month: 'Feb', enrolled: 410 },
    { month: 'Mar', enrolled: 500 },
    { month: 'Apr', enrolled: 620 },
    { month: 'May', enrolled: 780 },
    { month: 'Jun', enrolled: 920 },
  ],
};

function loadCollection(key) {
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn('Failed to load sponsor data:', key, e);
  }
  return defaultData[key] ? JSON.parse(JSON.stringify(defaultData[key])) : [];
}

function saveCollection(key, data) {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('sponsor-data-updated', { detail: { key } }));
}

export function getPortfolioStudies() { return loadCollection('portfolioStudies'); }
export function savePortfolioStudies(data) { saveCollection('portfolioStudies', data); }

export function getOversightStudies() { return loadCollection('oversightStudies'); }
export function saveOversightStudies(data) { saveCollection('oversightStudies', data); }

export function getCROs() { return loadCollection('cros'); }
export function saveCROs(data) { saveCollection('cros', data); }

export function getSites() { return loadCollection('sites'); }
export function saveSites(data) { saveCollection('sites', data); }

export function getRecruitment() { return loadCollection('recruitment'); }
export function saveRecruitment(data) { saveCollection('recruitment', data); }

export function getRegulatory() { return loadCollection('regulatory'); }
export function saveRegulatory(data) { saveCollection('regulatory', data); }

export function getRisks() { return loadCollection('risks'); }
export function saveRisks(data) { saveCollection('risks', data); }

export function getReports() { return loadCollection('reports'); }
export function saveReports(data) { saveCollection('reports', data); }

export function getNotifications() { return loadCollection('notifications'); }
export function saveNotifications(data) { saveCollection('notifications', data); }

export function getAlerts() {
  const regKpis = getRegulatoryKPIs();
  const recKpis = getRecruitmentKPIs();
  const riskKpis = getRiskKPIs();
  const notifKpis = getNotificationKPIs();
  const croKpis = getCROKPIs();

  const alerts = [];

  if (regKpis.overdue > 0) {
    alerts.push({
      id: 'ALT-REG',
      message: `${regKpis.overdue} regulatory document${regKpis.overdue > 1 ? 's' : ''} overdue`,
      severity: 'Critical',
      module: 'Regulatory',
    });
  }

  if (recKpis.belowTarget > 0) {
    alerts.push({
      id: 'ALT-REC',
      message: `${recKpis.belowTarget} stud${recKpis.belowTarget > 1 ? 'ies' : 'y'} below enrollment target`,
      severity: 'High',
      module: 'Recruitment',
    });
  }

  if (riskKpis.open > 0) {
    alerts.push({
      id: 'ALT-RISK',
      message: `${riskKpis.open} open risk${riskKpis.open > 1 ? 's' : ''} requiring attention`,
      severity: riskKpis.critical > 0 ? 'Critical' : 'High',
      module: 'Risk Management',
    });
  }

  if (notifKpis.unread > 0) {
    alerts.push({
      id: 'ALT-NOT',
      message: `${notifKpis.unread} unread notification${notifKpis.unread > 1 ? 's' : ''}`,
      severity: notifKpis.critical > 0 ? 'Critical' : 'High',
      module: 'Notifications',
    });
  }

  if (croKpis.total > 0) {
    alerts.push({
      id: 'ALT-CRO',
      message: `${croKpis.active} active CRO partner${croKpis.active > 1 ? 's' : ''} — performance review due`,
      severity: 'Medium',
      module: 'CRO Oversight',
    });
  }

  return alerts.length > 0 ? alerts : loadCollection('alerts');
}
export function saveAlerts(data) { saveCollection('alerts', data); }

export function getQuickActions() { return loadCollection('quickActions'); }
export function saveQuickActions(data) { saveCollection('quickActions', data); }

const SETTINGS_KEY = 'sponsor_settings';

export function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return { ...defaultData.settings, ...JSON.parse(stored) };
  } catch (e) {
    console.warn('Failed to load settings', e);
  }
  return JSON.parse(JSON.stringify(defaultData.settings));
}

export function saveSettings(data) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('sponsor-data-updated', { detail: { key: 'settings' } }));
}

export function syncQuickActionValues() {
  const kpis = getDashboardKPIs();
  const actions = getQuickActions();
  const valueMap = {
    study: String(kpis.portfolio),
    risk: String(kpis.risks),
    report: String(kpis.reports),
    recruitment: `${kpis.recruitment}%`,
    cro: String(kpis.cros),
  };
  const subtitleMap = {
    study: 'Portfolio studies',
    risk: 'Open risks',
    report: 'Ready reports',
    recruitment: 'Enrollment rate',
    cro: 'Active CROs',
  };
  return actions.map((a) => ({
    ...a,
    value: valueMap[a.icon] || a.value || '—',
    subtitle: subtitleMap[a.icon] || a.subtitle || '',
  }));
}

export function getEnrollmentTrend() { return loadCollection('enrollmentTrend'); }

export function useSponsorDataRefresh(callback) {
  const handler = () => callback();
  window.addEventListener('sponsor-data-updated', handler);
  return () => window.removeEventListener('sponsor-data-updated', handler);
}

export function getDashboardKPIs() {
  const portfolio = getPortfolioStudies();
  const cros = getCROs();
  const risks = getRisks();
  const reports = getReports();
  const notifications = getNotifications();

  const activeStudies = portfolio.filter(s => ['Active', 'Recruiting'].includes(s.status)).length;
  const totalEnrolled = portfolio.reduce((sum, s) => sum + (s.enrolled || 0), 0);
  const totalTarget = portfolio.reduce((sum, s) => sum + (s.target || 0), 0);
  const openRisks = risks.filter(r => r.status === 'Open').length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return {
    portfolio: portfolio.length,
    studies: activeStudies,
    cros: cros.filter(c => c.status === 'Active').length,
    recruitment: Math.round((totalEnrolled / Math.max(totalTarget, 1)) * 100),
    recruitmentCount: totalEnrolled,
    risks: openRisks,
    reports: reports.filter(r => r.status === 'Ready').length,
    notifications: unreadNotifications,
    totalNotifications: notifications.length,
  };
}

export function getEnrollmentByStudy() {
  return getPortfolioStudies().map(s => ({
    study: s.studyId,
    enrolled: s.enrolled || 0,
  }));
}

export function getStudyStatusData() {
  const portfolio = getPortfolioStudies();
  const statusCounts = {};
  portfolio.forEach(s => {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
  });
  return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
}

export function getPhaseDistribution() {
  const portfolio = getPortfolioStudies();
  const phaseCounts = {};
  portfolio.forEach(s => {
    phaseCounts[s.phase] = (phaseCounts[s.phase] || 0) + 1;
  });
  return Object.entries(phaseCounts).map(([phase, studies]) => ({ phase, studies }));
}

export function getEnrollmentStatusPie() {
  const portfolio = getPortfolioStudies();
  let onTrack = 0, belowTarget = 0, completed = 0;
  portfolio.forEach(s => {
    const rate = s.target ? (s.enrolled / s.target) * 100 : 0;
    if (s.status === 'Completed') completed++;
    else if (rate >= 70) onTrack++;
    else belowTarget++;
  });
  return [
    { name: 'On Track', value: onTrack },
    { name: 'Below Target', value: belowTarget },
    { name: 'Completed', value: completed },
  ].filter(d => d.value > 0);
}

export function getPortfolioKPIs() {
  const studies = getPortfolioStudies();
  return {
    total: studies.length,
    active: studies.filter(s => s.status === 'Active').length,
    recruiting: studies.filter(s => s.status === 'Recruiting').length,
    completed: studies.filter(s => s.status === 'Completed').length,
    planning: studies.filter(s => s.status === 'Planning').length,
  };
}

export function getOversightKPIs() {
  const studies = getOversightStudies();
  return {
    total: studies.length,
    onTrack: studies.filter(s => s.status === 'On Track').length,
    delayed: studies.filter(s => s.status === 'Delayed').length,
    completed: studies.filter(s => s.status === 'Completed').length,
  };
}

export function getCROKPIs() {
  const cros = getCROs();
  const avgPerf = cros.length ? Math.round(cros.reduce((s, c) => s + c.performance, 0) / cros.length) : 0;
  return {
    total: cros.length,
    active: cros.filter(c => c.status === 'Active').length,
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
    belowTarget: rec.filter(r => r.status === 'Below Target').length,
  };
}

export function getRegulatoryKPIs() {
  const reg = getRegulatory();
  return {
    total: reg.length,
    approved: reg.filter(r => r.status === 'Approved').length,
    inReview: reg.filter(r => r.status === 'In Review').length,
    submitted: reg.filter(r => r.status === 'Submitted').length,
    overdue: reg.filter(r => r.status === 'Overdue').length,
  };
}

export function getRiskKPIs() {
  const risks = getRisks();
  return {
    total: risks.length,
    critical: risks.filter(r => r.severity === 'Critical').length,
    high: risks.filter(r => r.severity === 'High').length,
    medium: risks.filter(r => r.severity === 'Medium').length,
    low: risks.filter(r => r.severity === 'Low').length,
    open: risks.filter(r => r.status === 'Open').length,
    resolved: risks.filter(r => r.status === 'Closed' || r.status === 'Mitigated').length,
  };
}

export function getReportKPIs() {
  const reports = getReports();
  return {
    total: reports.length,
    ready: reports.filter(r => r.status === 'Ready').length,
    pending: reports.filter(r => r.status === 'Pending').length,
  };
}

export function getNotificationKPIs() {
  const notifications = getNotifications();
  return {
    total: notifications.length,
    critical: notifications.filter(n => n.severity === 'Critical').length,
    high: notifications.filter(n => n.severity === 'High').length,
    unread: notifications.filter(n => !n.read).length,
    resolved: notifications.filter(n => n.read).length,
  };
}

export function getSiteKPIs() {
  const sites = getSites();
  const avgPerf = sites.length ? Math.round(sites.reduce((s, site) => s + site.performance, 0) / sites.length) : 0;
  return {
    total: sites.length,
    avgPerformance: avgPerf,
    totalEnrolled: sites.reduce((s, site) => s + site.enrolled, 0),
  };
}

export const SEVERITY_COLORS = {
  Critical: '#dc2626',
  High: '#ea580c',
  Medium: '#ca8a04',
  Low: '#2563eb',
};
