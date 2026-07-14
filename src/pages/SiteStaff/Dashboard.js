// UPDATED: Site Staff dashboard — Phase 8 subject-status analytics and full-height Upcoming Visits

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SiteStaffDashboardLayout from "../../components/dashboard/sitestaff/SiteStaffDashboardLayout";
import KPICard from "../../components/dashboard/shared/KPICard";
import SubjectAnalyticsSection from "../../components/dashboard/shared/SubjectAnalyticsSection";
import { getStudies } from "../../services/studyService";
import DataTable from "../../components/dashboard/shared/DataTable";
import AlertsPanel from "../../components/dashboard/shared/AlertsPanel";
import QuickActions from "../../components/dashboard/shared/QuickActions";
import VisitCalendarSection from "../../components/dashboard/shared/VisitCalendarSection";
import {
  getSiteStaffDashboardData,
  getSubjectsForAnalytics
} from "../../services/adminService";
import { getAccessibleStudies, getAssignedSite } from "../../services/roleService";

import "../Admin/Dashboard.css";
import "../shared/AccessPermissions.css";
import "./Dashboard.css";
import "../shared/studies/StudyDashboard.css";

function SiteStaffDashboard() {
  const navigate = useNavigate();
  const dashboardData = getSiteStaffDashboardData();
  const assignedSite = getAssignedSite();
  const studyCount = useMemo(() => getAccessibleStudies().length, []);

  const analyticsSubjects = useMemo(() => getSubjectsForAnalytics(), []);
  const portfolioStudies = useMemo(() => getStudies(), []);

  const {
    enrolledCount,
    upcomingVisitsCount,
    openCommentsCount,
    subjectActivity,
    alerts
  } = dashboardData;

  return (
    <SiteStaffDashboardLayout>
      <div className="admin-dashboard site-dashboard">
        <div className="dashboard-page-title">
          <h1>Site Staff Dashboard</h1>
          <p>
            Site Operations Overview
            {assignedSite ? ` — ${assignedSite}` : ""}
          </p>
        </div>

        <div className="dashboard-grid-6 kpi-grid">
          <KPICard
            title="Studies"
            value={studyCount}
            subtitle="Active Studies"
            icon="📁"
            onClick={() => navigate("/studies")}
          />

          <KPICard
            title="Enrollment"
            value={enrolledCount}
            subtitle="Active Enrollment"
            icon="➕"
            onClick={() => navigate("/subjects")}
          />

          <KPICard
            title="Upcoming Visits"
            value={upcomingVisitsCount}
            subtitle="Next 7 Days"
            icon="📅"
            onClick={() => navigate("/site-performance")}
          />

          <KPICard
            title="Open Comments"
            value={openCommentsCount}
            subtitle="Pending Resolution"
            icon="💬"
            onClick={() => navigate("/comments")}
          />
        </div>

        <VisitCalendarSection />

        <SubjectAnalyticsSection
          subjects={analyticsSubjects}
          studies={portfolioStudies}
          compactKpis
        />

        <div className="dashboard-grid-2">
          <AlertsPanel title="Site Alerts" alerts={alerts} />

          <QuickActions
            actions={[
              {
                icon: "📁",
                label: "Studies",
                path: "/studies"
              },
              {
                icon: "🔍",
                label: "Recruitment",
                path: "/recruitment"
              },
              {
                icon: "📚",
                label: "Study Logs",
                path: "/studies"
              },
              {
                icon: "💬",
                label: "Comments",
                path: "/comments"
              }
            ]}
          />
        </div>

        <DataTable
          title="Subject Activity"
          columns={[
            {
              key: "subjectId",
              label: "Subject ID"
            },
            {
              key: "status",
              label: "Status"
            },
            {
              key: "site",
              label: "Site"
            }
          ]}
          data={subjectActivity}
        />
      </div>
    </SiteStaffDashboardLayout>
  );
}

export default SiteStaffDashboard;
