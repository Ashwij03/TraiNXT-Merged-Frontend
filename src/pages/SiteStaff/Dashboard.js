// UPDATED: Site Staff dashboard — Phase 8 subject-status analytics and full-height Upcoming Visits

import { useEffect, useMemo, useState } from "react";
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
import { useComments } from "../../comments/CommentsContext";
import { resolveSiteDisplay } from "../../utils/siteDisplay";

import "../Admin/Dashboard.css";
import "../shared/AccessPermissions.css";
import "./Dashboard.css";
import "../shared/studies/StudyDashboard.css";

function SiteStaffDashboard() {
  const navigate = useNavigate();
  const { pendingCount: openCommentsCount } = useComments();
  const [dashboardData, setDashboardData] = useState(() =>
    getSiteStaffDashboardData()
  );
  const assignedSite = getAssignedSite();
  const studyCount = useMemo(() => getAccessibleStudies().length, []);

  const analyticsSubjects = useMemo(() => getSubjectsForAnalytics(), []);
  const portfolioStudies = useMemo(() => getStudies(), []);

  useEffect(() => {
    const refreshDashboardData = () => {
      setDashboardData(getSiteStaffDashboardData());
    };

    window.addEventListener("subjects-updated", refreshDashboardData);
    window.addEventListener("studies-updated", refreshDashboardData);
    window.addEventListener("sponsor-data-updated", refreshDashboardData);
    window.addEventListener("admin-data-updated", refreshDashboardData);
    window.addEventListener("storage", refreshDashboardData);

    return () => {
      window.removeEventListener("subjects-updated", refreshDashboardData);
      window.removeEventListener("studies-updated", refreshDashboardData);
      window.removeEventListener("sponsor-data-updated", refreshDashboardData);
      window.removeEventListener("admin-data-updated", refreshDashboardData);
      window.removeEventListener("storage", refreshDashboardData);
    };
  }, []);

  const {
    enrolledCount,
    upcomingVisitsCount,
    subjectActivity,
    alerts
  } = dashboardData;

  // Item 17 — operational Site column shows Site Number, not Site Name.
  const siteResolvedSubjectActivity = useMemo(() => {
    const list = Array.isArray(subjectActivity) ? subjectActivity : [];
    return list.map((row) => ({
      ...row,
      site: resolveSiteDisplay(row?.site, {
        sources: portfolioStudies,
        fallback: row?.site || "—",
      }),
    }));
  }, [subjectActivity, portfolioStudies]);

  return (
    <SiteStaffDashboardLayout>
      <div className="admin-dashboard site-dashboard">
        <div className="dashboard-page-title">
          <h1>Site Staff Dashboard</h1>
          <p>
            Site Operations Overview
            {assignedSite
              ? ` — ${resolveSiteDisplay(assignedSite, {
                  sources: portfolioStudies,
                  fallback: assignedSite,
                })}`
              : ""}
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
              key: "studyNumber",
              label: "Study Number"
            },
            {
              key: "siteNumber",
              label: "Site Number"
            },
            {
              key: "subjectId",
              label: "Subject ID"
            },
            {
              key: "status",
              label: "Status"
            }
          ]}
          data={subjectActivity}
          searchable
          searchPlaceholder="Search subject activity..."
          searchFields={[
            "studyNumber",
            "siteNumber",
            "subjectId",
            "status"
          ]}
          filters={[
            {
              key: "status",
              label: "Status"
            }
          ]}
          pagination
          initialPageSize={5}
          data1={siteResolvedSubjectActivity}
        />
      </div>
    </SiteStaffDashboardLayout>
  );
}

export default SiteStaffDashboard;