
// UPDATED: Admin dashboard — Phase 8 subject-status analytics and full-height Upcoming Visits

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboardLayout from "../../components/dashboard/admin/AdminDashboardLayout";

import KPICard from "../../components/dashboard/shared/KPICard";
import SubjectAnalyticsSection from "../../components/dashboard/shared/SubjectAnalyticsSection";
import { getStudies } from "../../services/studyService";
import AlertsPanel from "../../components/dashboard/shared/AlertsPanel";
import QuickActions from "../../components/dashboard/shared/QuickActions";
import VisitCalendarSection from "../../components/dashboard/shared/VisitCalendarSection";
import {
  getAdminDashboardData,
  getSubjectsForAnalytics
} from "../../services/adminService";
import { useComments } from "../../comments/CommentsContext";
import {
  INSTITUTION_FILTER_EVENT,
  getStoredInstitutionFilter
} from "../../constants/headerFilters";

import "./Dashboard.css";
import "../shared/studies/StudyDashboard.css";
import "../shared/AccessPermissions.css";

// Ongoing studies = studies currently in Startup, Recruitment Phase,
// or Conduct Phase (the statuses set on the study details form's
// Study Status dropdown). Defined at module scope so it's a stable
// reference for the useMemo dependency array below.
const ONGOING_STUDY_STATUSES = ["Startup", "Recruitment Phase", "Conduct Phase"];

function AdminDashboard() {
  const { pendingCount: openCommentsCount } = useComments();
  const [institutionFilter, setInstitutionFilter] = useState(
    getStoredInstitutionFilter()
  );

  useEffect(() => {
    const handleFilterChange = (event) => {
      setInstitutionFilter(event?.detail || getStoredInstitutionFilter());
    };

    window.addEventListener(INSTITUTION_FILTER_EVENT, handleFilterChange);

    return () => {
      window.removeEventListener(
        INSTITUTION_FILTER_EVENT,
        handleFilterChange
      );
    };
  }, []);

  const dashboardData = useMemo(
    () => getAdminDashboardData(institutionFilter),
    [institutionFilter]
  );
  const navigate = useNavigate();

  const {
    users,
    studies,
    sites,
    pendingUsers,
    complianceScore
  } = dashboardData;

  const analyticsSubjects = useMemo(() => {
    return getSubjectsForAnalytics().filter(
      (subject) =>
        !institutionFilter ||
        subject.site === institutionFilter ||
        subject.site?.includes(institutionFilter) ||
        institutionFilter.includes(subject.site || "")
    );
  }, [institutionFilter]);

  const portfolioStudies = useMemo(() => getStudies(), []);

  const ongoingStudiesCount = useMemo(
    () =>
      studies.filter((study) =>
        ONGOING_STUDY_STATUSES.includes(study.status)
      ).length,
    [studies]
  );

  return (
    <AdminDashboardLayout>
      <div className="admin-dashboard">
        <div className="dashboard-page-title">
          <h1>Admin Dashboard</h1>
          <p>
            Clinical Trial System Overview
            {institutionFilter ? ` — ${institutionFilter}` : ""}
          </p>
        </div>

        <div className="dashboard-grid-6">
          <KPICard
            title="Users"
            value={users.length}
            subtitle="Registered Users"
            icon="👤"
            onClick={() => navigate("/user-management")}
          />

          <KPICard
            title="Pending"
            value={pendingUsers.length}
            subtitle="Access Requests"
            icon="🛡️"
            onClick={() => navigate("/access-permission")}
          />

          <KPICard
            title="Studies"
            value={ongoingStudiesCount}
            subtitle="Ongoing Studies"
            icon="📁"
            onClick={() => navigate("/studies")}
          />

          <KPICard
            title="Sites"
            value={sites.length}
            subtitle="Operational Sites"
            icon="🏥"
            onClick={() => navigate("/sites")}
          />

          <KPICard
            title="Comments"
            value={openCommentsCount}
            subtitle="Open Comments"
            icon="💬"
            onClick={() => navigate("/comments")}
          />

          <KPICard
            title="Compliance"
            value={complianceScore}
            subtitle="Overall Score"
            icon="✅"
          />
        </div>

        <VisitCalendarSection institutionFilter={institutionFilter} />

        <SubjectAnalyticsSection
          subjects={analyticsSubjects}
          studies={portfolioStudies}
          compactKpis
        />

        <div className="dashboard-grid-2">
          <AlertsPanel
            title="System Alerts"
            alerts={[
              {
                type: "warning",
                title: "Pending Approvals",
                message: `${pendingUsers.length} users awaiting approval`
              },
              {
                type: "danger",
                title: "Open Comments",
                message: `${openCommentsCount} unresolved comments`
              },
              {
                type: "info",
                title: "Study Update",
                message: `${studies.length} studies in portfolio`
              }
            ]}
          />

          <QuickActions
            actions={[
              {
                icon: "👤",
                label: "User Management",
                path: "/user-management"
              },
              {
                icon: "🛡️",
                label: "Access Permission",
                path: "/access-permission"
              },
              {
                icon: "📁",
                label: "Studies",
                path: "/studies"
              },
              {
                icon: "📈",
                label: "Reports",
                path: "/reports"
              }
            ]}
          />
        </div>
      </div>
    </AdminDashboardLayout>
  );
}

export default AdminDashboard;
