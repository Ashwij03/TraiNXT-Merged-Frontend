import React, { useEffect, useState } from 'react';
import { HEADER_FILTERS_EVENT } from "../../constants/headerFilters";
import { useNavigate } from 'react-router-dom';
import {
  MdWorkspaces,
  MdMonitorHeart,
  MdBusiness,
  MdGroups,
  MdWarning,
  MdAssessment,
  MdNotifications,
} from 'react-icons/md';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

import './SponsorDashboard.css';
import "../shared/studies/StudyDashboard.css";
import AppLayout from './AppLayout.js';
import EnrollmentChart from './EnrollmentChart';
import StatusPieChart from './StatusPieChart';
import KpiCard from './KpiCard';
import AlertsPanel from './AlertsPanel';
import QuickActions from './QuickActions';
import {
  getDashboardKPIs,
  getEnrollmentByStudy,
  getStudyStatusData,
  getPhaseDistribution,
  getEnrollmentTrend,
  getRegulatoryKPIs,
} from './data/sponsorDataStore';

const CHART_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const SponsorDashboard = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(getDashboardKPIs());
  const [enrollmentData, setEnrollmentData] = useState(getEnrollmentByStudy());
  const [statusData, setStatusData] = useState(getStudyStatusData());
  const [phaseData, setPhaseData] = useState(getPhaseDistribution());
  const [trendData, setTrendData] = useState(getEnrollmentTrend());
  const [regKpis, setRegKpis] = useState(getRegulatoryKPIs());

  const refreshData = () => {
    setKpis(getDashboardKPIs());
    setEnrollmentData(getEnrollmentByStudy());
    setStatusData(getStudyStatusData());
    setPhaseData(getPhaseDistribution());
    setTrendData(getEnrollmentTrend());
    setRegKpis(getRegulatoryKPIs());
  };

  useEffect(() => {
    refreshData();

    const handler = () => {
      refreshData();
    };

    window.addEventListener("sponsor-data-updated", handler);
    window.addEventListener(HEADER_FILTERS_EVENT, handler);
    window.addEventListener("studies-updated", handler);
    window.addEventListener("subjects-updated", handler);

    return () => {
      window.removeEventListener("sponsor-data-updated", handler);
      window.removeEventListener(HEADER_FILTERS_EVENT, handler);
      window.removeEventListener("studies-updated", handler);
      window.removeEventListener("subjects-updated", handler);
    };
  }, []);

  return (
    <AppLayout>
      <div className="sponsor-dashboard">
        <div className="dashboard-header">
          <h1>Sponsor Dashboard</h1>
          <p>Welcome back! Here&apos;s an overview of your clinical trial portfolio.</p>
        </div>

        <div className="kpi-grid">
          <KpiCard
            title="Portfolio Studies"
            value={kpis.portfolio}
            subtitle="Total in portfolio"
            icon={<MdWorkspaces size={28} />}
            iconBg="#eff6ff"
            iconColor="#2563eb"
            onClick={() => navigate('/portfolio')}
          />
          <KpiCard
            title="Active Studies"
            value={kpis.studies}
            subtitle="Currently running"
            icon={<MdMonitorHeart size={28} />}
            iconBg="#ecfdf5"
            iconColor="#16a34a"
            onClick={() => navigate('/studies')}
          />
          <KpiCard
            title="Active CROs"
            value={kpis.cros}
            subtitle="Partner organizations"
            icon={<MdBusiness size={28} />}
            iconBg="#fef3c7"
            iconColor="#d97706"
            onClick={() => navigate('/cro-oversight')}
          />
          <KpiCard
            title="Recruitment"
            value={`${kpis.recruitment}%`}
            subtitle={`${kpis.recruitmentCount.toLocaleString()} enrolled`}
            icon={<MdGroups size={28} />}
            iconBg="#ede9fe"
            iconColor="#7c3aed"
            onClick={() => navigate('/recruitment')}
          />
          <KpiCard
            title="Open Risks"
            value={kpis.risks}
            subtitle="Requiring attention"
            icon={<MdWarning size={28} />}
            iconBg="#fee2e2"
            iconColor="#dc2626"
            onClick={() => navigate('/risk-management')}
          />
          <KpiCard
            title="Reports Ready"
            value={kpis.reports}
            subtitle="Available for download"
            icon={<MdAssessment size={28} />}
            iconBg="#fce7f3"
            iconColor="#db2777"
            onClick={() => navigate('/reports')}
          />
          <KpiCard
            title="Notifications"
            value={kpis.notifications}
            subtitle={`${kpis.totalNotifications} total alerts`}
            icon={<MdNotifications size={28} />}
            iconBg="#e0f2fe"
            iconColor="#0284c7"
            onClick={() => navigate('/notifications')}
          />
        </div>

        

        <div className="chart-grid">
          <StatusPieChart />
          <EnrollmentChart data={enrollmentData} />
          <div className="chart-card">
            <h3>Study Status Distribution</h3>
            {statusData.length === 0 ? (
              <p className="chart-empty-state">No data available yet</p>
            ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={90} label>
                  {statusData.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            )}
          </div>
          <div className="chart-card">
            <h3>Study Phase Distribution</h3>
            {phaseData.length === 0 ? (
              <p className="chart-empty-state">No data available yet</p>
            ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={phaseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="phase" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="studies" fill="#082b3d" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>
          <div className="chart-card chart-card-wide">
            <h3>Enrollment Trend</h3>
            {trendData.length === 0 ? (
              <p className="chart-empty-state">No data available yet</p>
            ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="enrolled" stroke="#2563eb" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bottom-actions-grid">
          <AlertsPanel />
          <QuickActions />
        </div>

      
        <div className="bottom-grid bottom-grid-single">
          <div className="regulatory-card">
            <h3>Regulatory Status Overview</h3>
            <div className="regulatory-stats">
              <div className="reg-item">
                <h2>{regKpis.approved}</h2>
                <p>Approved</p>
              </div>
              <div className="reg-item">
                <h2>{regKpis.inReview}</h2>
                <p>In Review</p>
              </div>
              <div className="reg-item">
                <h2>{regKpis.submitted}</h2>
                <p>Submitted</p>
              </div>
              <div className="reg-item reg-overdue">
                <h2>{regKpis.overdue}</h2>
                <p>Overdue</p>
              </div>
            </div>
            <div className="view-all-link">
              <span onClick={() => navigate('/regulatory')}>View Regulatory →</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SponsorDashboard;
