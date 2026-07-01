import React, { useMemo } from "react";
import "./CRODashboard.css";
import CROLayout from "./CROLayout";
import { useCROData } from "./CRODATAContext";
import SubjectAnalyticsSection from "../../Components/dashboard/SubjectAnalyticsSection";
import StudyStatusChart from "./StudyStatusChart";
import EnrollmentChart from "./EnrollmentChart";
import VisitCompletionChart from "./VisitCompletionChart";
import QueryStatusChart from "./QueryStatusChart";
import UpcomingMonitoringVisits from "./UpcomingMonitoringVisits";
import CROStatusBadge from "./CROStatusBadge";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import { useNavigate } from "react-router-dom";

function CRODashboard() {
  const {
    visits,
    subjects,
    comments,
    notifications,
    kpis,
    isLoading,
  } = useCROData();
  const navigate = useNavigate();

  const loading = isLoading;

  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const uniqueSites = [...new Set(visits.map((v) => v.site))];
  const recentActivities = visits.slice(0, 3);
  const recentComments = comments.filter((c) => c.status === "Open").slice(0, 3);
  const unreadNotifications = notifications.filter(
    (n) => n.status === "Unread"
  );

  const analyticsSubjects = useMemo(
    () =>
      subjects.map((subject) => ({
        ...subject,
        studyId: subject.study || subject.studyId,
        status: subject.status || "Screening"
      })),
    [subjects]
  );

  const croStudies = useMemo(() => {
    const studyMap = new Map();

    subjects.forEach((subject) => {
      const code = subject.study || subject.studyId;

      if (!code) {
        return;
      }

      if (!studyMap.has(code)) {
        studyMap.set(code, { code, enrolled: 0 });
      }

      studyMap.get(code).enrolled += 1;
    });

    return Array.from(studyMap.values());
  }, [subjects]);

  const kpiCards = [
    {
      icon: "🏥",
      title: "Sites Under Monitoring",
      value: kpis.sitesUnderMonitoring,
      route: "/cro-subject-management",
    },
    {
      icon: "📅",
      title: "Monitoring Visits",
      value: kpis.monitoringVisits,
      route: "/cro-monitoring",
    },
    {
      icon: "📋",
      title: "Pending Reviews",
      value: kpis.pendingReviews,
      route: "/cro-regulatory-documents",
    },
    {
      icon: "💬",
      title: "Comments",
      value: kpis.comments,
      route: "/cro-comments",
    },
    {
      icon: "📊",
      title: "Compliance Metrics",
      value: kpis.complianceMetrics,
      route: "/cro-site-performance",
    },
  ];

  const quickActions = [
    {
      label: "📋 Create Monitoring Report",
      route: "/cro-reports",
    },
    {
      label: "📊 Review Site Performance",
      route: "/cro-site-performance",
    },
    {
      label: "💬 Review Comments",
      route: "/cro-comments",
    },
    {
      label: "📁 Regulatory Review",
      route: "/cro-regulatory-documents",
    },
  ];

  return (
    <CROLayout>
      <div className="cro-dashboard">
        <div className="cro-header">

           <div className="dashboard-header">

              <h1>CRO Dashboard</h1>

            <div className="dashboard-subtitle">
             Clinical Research Operations Overview
            </div>

           </div>

          </div>

        {loading ? (
          <SkeletonLoader rows={5} type="cards" />
        ) : (
          <>
              <div className="kpi-grid">
                {kpiCards.map((card) => (
                  <div
                    key={card.title}
                    className="kpi-card"
                    onClick={() => navigate(card.route)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && navigate(card.route)
                    }
                    role="button"
                    tabIndex={0}
                  >
                    <div className="kpi-icon">{card.icon}</div>
                    <h3>{card.title}</h3>
                    <p>{card.value}</p>
                  </div>
                ))}
              </div>

          
              <div className="charts-grid">
                <div
                  className="dashboard-card clickable-card"
                  onClick={() => navigate("/cro-enrollment")}
                  role="button"
                  tabIndex={0}
                >
                  <EnrollmentChart />
                </div>
                <div
                  className="dashboard-card clickable-card"
                  onClick={() => navigate("/cro-monitoring")}
                  role="button"
                  tabIndex={0}
                >
                  <VisitCompletionChart />
                </div>
                <div
                  className="dashboard-card clickable-card"
                  onClick={() => navigate("/cro-comments")}
                  role="button"
                  tabIndex={0}
                >
                  <QueryStatusChart />
                </div>
                <div
                  className="dashboard-card clickable-card"
                  onClick={() => navigate("/cro-subjects")}
                  role="button"
                  tabIndex={0}
                >
                  <StudyStatusChart />
                </div>
              </div>

              <div
                className="dashboard-card clickable-card"
                onClick={() => navigate("/cro-subject-management")}
                role="button"
                tabIndex={0}
              >
                <h2>Sites Under Monitoring</h2>
                {uniqueSites.length === 0 ? (
                  <EmptyState title="No Sites Found" />
                ) : (
                  <div className="cro-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Site Name</th>
                          <th>Study</th>
                          <th>Subjects</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uniqueSites.map((site) => {
                          const siteSubjects = subjects.filter(
                            (s) => s.site === site
                          );
                          return (
                            <tr key={site}>
                              <td>{site} Hospital</td>
                              <td>
                                {siteSubjects[0]?.study || "—"}
                              </td>
                              <td>{siteSubjects.length}</td>
                              <td>
                                <span className="status-active">Active</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div
                className="dashboard-card clickable-card"
                onClick={() => navigate("/cro-monitoring")}
                role="button"
                tabIndex={0}
              >
                <h2>Monitoring Visits</h2>
                {visits.length === 0 ? (
                  <EmptyState title="No Visits Found" />
                ) : (
                  <div className="cro-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Visit ID</th>
                          <th>Site</th>
                          <th>Visit Type</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visits.slice(0, 5).map((visit) => (
                          <tr key={visit.id}>
                            <td>{visit.id}</td>
                            <td>{visit.site}</td>
                            <td>{visit.visitType}</td>
                            <td>
                              <CROStatusBadge status={visit.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="dashboard-card">
                  <UpcomingMonitoringVisits />
                </div>


              <div className="info-grid">
                <div
                  className="dashboard-card clickable-card"
                  onClick={() => navigate("/cro-monitoring")}
                  role="button"
                  tabIndex={0}
                >
                  <h2>Recent Monitoring Activities</h2>
                  {recentActivities.length === 0 ? (
                    <EmptyState title="No Activities" />
                  ) : (
                    <div className="cro-table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Site</th>
                            <th>Activity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentActivities.map((v) => (
                            <tr key={v.id}>
                              <td>{v.site}</td>
                              <td>
                                {v.visitType} — {v.status}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div
                  className="dashboard-card clickable-card"
                  onClick={() => navigate("/cro-comments")}
                  role="button"
                  tabIndex={0}
                >
                  <h2>Recent Comments</h2>
                  {recentComments.length === 0 ? (
                    <EmptyState title="No Comments Found" />
                  ) : (
                    <div className="cro-table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Comment</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentComments.map((c) => (
                            <tr key={c.id}>
                              <td>{c.subject}</td>
                              <td>{c.message.substring(0, 50)}...</td>
                              <td>
                                <CROStatusBadge status={c.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div
  className="dashboard-card clickable-card"
  onClick={() => navigate("/cro-notifications")}
  role="button"
  tabIndex={0}
>
  <h2>🔔 Alerts & Notifications</h2>

  <div className="alerts-list">
    {unreadNotifications.map((alert) => (
      <div
  key={alert.id}
  className={`alert-card ${alert.severity?.toLowerCase()}`}
>
  <div className="alert-card-header">
    <h4>{alert.title}</h4>

    <span className={`status-${alert.severity?.toLowerCase()}`}>
      {alert.severity}
    </span>
  </div>

  <p>{alert.message}</p>

  <div className="alert-card-footer">
    <span>{alert.type}</span>
    <span>{alert.date}</span>
  </div>
</div>
    ))}
  </div>
</div>
             <div className="dashboard-card quick-actions-container">
  <h2>⚡ Quick Actions</h2>

  <div className="quick-actions">
    {quickActions.map((action) => (
      <button
        key={action.label}
        type="button"
        onClick={() => navigate(action.route)}
      >
        {action.label}
      </button>
    ))}
  </div>
</div>
              </div>
            </>
          )}
      </div>
    </CROLayout>
  );
}

export default CRODashboard;
