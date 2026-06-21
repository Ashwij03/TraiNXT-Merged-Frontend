import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMessageSquare } from "react-icons/fi";
import {
  FaUser,
  FaClipboardList,
  FaShieldAlt,
  FaUsers,
  FaFileAlt,
  FaChartBar,
  FaCalendarAlt,
  FaBookOpen,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaFileMedical,
  FaClock
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer
} from "recharts";
import PINavbar from "./PINavbar";
import PISidebar from "./PISidebar";
import PILiveChat from "./PILiveChat";
import PICommentModal from "./PICommentModal";
import PIReports from "./PIReports";
import PIRecruitment from "./PIRecuritment";
import PIRegulatory from "./PIRegulatory";
import PISettings from "./PISettings";
import PINotifications from "./PINotifications";
import PISitePerformance from "./PISitePerformance";
import PIComments from "./PIComments";
import PIEISFDashboard from "./PIEISFDashboard";
import PIICFDashboard from "./PIICFDashboard";
import StudyFolderDashboard from "./PIStudyFolderDashboard";
import VisitCalendarSection from "../../Components/dashboard/VisitCalendarSection";
import SubjectAnalyticsSection from "../../Components/dashboard/SubjectAnalyticsSection";
import {
  getDashboardData,
  saveDashboardData,
  syncKpisFromData,
  getNavbarData,
  getCommentsData,
  buildDynamicAlerts
} from "./piDashboardService";
import "./PIDashboard.css";
import "../Admin/Dashboard.css";

function PIDashboard({ embeddedInLayout = false }) {
  const navigate = useNavigate();

  const [comments, setComments] = useState([]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState("dashboard");
  const [settingsView, setSettingsView] = useState("security");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showQueryModal, setShowQueryModal] = useState(false);
  // UPDATED: Track selected study from navbar for dynamic page filtering
  const [selectedStudy, setSelectedStudy] = useState(
    () => getNavbarData().selectedStudy || "All Studies"
  );

  // UPDATED: Sync selected study when navbar study dropdown changes
  useEffect(() => {
    const onStudyChange = (e) => {
      setSelectedStudy(e.detail || "All Studies");
    };
    window.addEventListener("pi-study-change", onStudyChange);
    return () => window.removeEventListener("pi-study-change", onStudyChange);
  }, []);

  useEffect(() => {
    const refreshDashboard = () => {
      setDashboardData(syncKpisFromData(getDashboardData()));
    };
    window.addEventListener("pi-comments-updated", refreshDashboard);
    return () =>
      window.removeEventListener("pi-comments-updated", refreshDashboard);
  }, []);

  // UPDATED: Load dashboard data from piDashboardService (localStorage)
  const [dashboardData, setDashboardData] = useState(() =>
    syncKpisFromData(getDashboardData())
  );

  const [newStudy, setNewStudy] = useState({
    study: "",
    target: "",
    enrolled: "",
    status: "On Track"
  });

  const [newVisit, setNewVisit] = useState({
    subject: "",
    visit: "",
    date: ""
  });

  const [newQuery, setNewQuery] = useState({
    id: "",
    subject: "",
    status: "Open"
  });

  const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

  const navigateToPage = (page) => setSelectedPage(page);

const getAlertIcon = (type) => {
  if (type === "critical")
    return <FaFileMedical className="alert-svg" />;

  if (type === "danger")
    return <FaExclamationCircle className="alert-svg" />;

  if (type === "warning")
    return <FaExclamationCircle className="alert-svg" />;

  if (type === "study-alert")
    return <FaExclamationTriangle className="alert-svg" />;

  return <FaInfoCircle className="alert-svg" />;
};

  const handleAlertClick = (alert) => {
    if (alert.page) navigateToPage(alert.page);
    else navigateToPage("notifications");
  };

  const openStudiesSection = () => {
    window.dispatchEvent(new CustomEvent("pi-navigate-studies"));
    setSidebarOpen(true);
  };

  const quickActionsData = [
    {
      title: "Schedule Visit",
      icon: <FaCalendarAlt />,
      count: (dashboardData.upcomingVisits || []).length,
      action: () => setShowVisitModal(true),
    },
    {
      title: "Studies",
      icon: <FaBookOpen />,
      count: dashboardData.kpis.studiesCount ?? dashboardData.studies.length,
      action: openStudiesSection,
    },
    {
      title: "Comments",
      icon: <FaFileAlt />,
      count: dashboardData.kpis.commentsCount ?? dashboardData.kpis.comments ?? 0,
      action: () => navigateToPage("comments"),
    },
    {
      title: "Generate Report",
      icon: <FaChartBar />,
      count: dashboardData.studies.length,
      action: () => navigateToPage("reports"),
    },
  ];

  const dynamicAlerts = buildDynamicAlerts(dashboardData, getCommentsData());

  const totalTarget = dashboardData.studies.reduce(
    (sum, study) => sum + Number(study.target || 0),
    0
  );

  const totalEnrolled = dashboardData.studies.reduce(
    (sum, study) => sum + Number(study.enrolled || 0),
    0
  );

  const enrollmentChartData = [
    { name: "Target", value: totalTarget },
    { name: "Enrolled", value: totalEnrolled }
  ];

  const consentChartData = [
    {
      name: "Consented",
      value: (dashboardData.recentSubjects || []).filter(
        (s) => s.status === "Active"
      ).length
    },
    {
      name: "Pending",
      value: (dashboardData.recentSubjects || []).filter(
        (s) => s.status === "Screening"
      ).length
    },
    {
      name: "Declined",
      value: (dashboardData.recentSubjects || []).filter(
        (s) => s.status === "Withdrawn"
      ).length
    }
  ];

  const updateDashboard = (updatedDashboard) => {
    const synced = syncKpisFromData(updatedDashboard);
    setDashboardData(synced);
    saveDashboardData(synced);
  };

  const handleAddStudy = () => {
    if (!newStudy.study || !newStudy.target || !newStudy.enrolled) {
      alert("Please fill all fields");
      return;
    }

    const updatedDashboard = {
      ...dashboardData,
      studies: [
        ...dashboardData.studies,
        {
          ...newStudy,
          target: Number(newStudy.target),
          enrolled: Number(newStudy.enrolled)
        }
      ]
    };

    updateDashboard(updatedDashboard);
    setShowStudyModal(false);
    setNewStudy({
      study: "",
      target: "",
      enrolled: "",
      status: "On Track"
    });
  };

  const handleAddVisit = () => {
    if (!newVisit.subject || !newVisit.visit || !newVisit.date) {
      alert("Please fill all fields");
      return;
    }

    const updatedDashboard = {
      ...dashboardData,
      upcomingVisits: [...(dashboardData.upcomingVisits || []), newVisit]
    };

    updateDashboard(updatedDashboard);
    setShowVisitModal(false);
    setNewVisit({
      subject: "",
      visit: "",
      date: ""
    });
  };

  const handleAddQuery = () => {
    if (!newQuery.id || !newQuery.subject || !newQuery.status) {
      alert("Please fill all fields");
      return;
    }

    const updatedDashboard = {
      ...dashboardData,
      pendingQueries: [...(dashboardData.pendingQueries || []), newQuery]
    };

    updateDashboard(updatedDashboard);
    setShowQueryModal(false);
    setNewQuery({
      id: "",
      subject: "",
      status: "Open"
    });
  };

  const renderPageContent = (forcedPage) => {
    const page = forcedPage || selectedPage;

    // UPDATED: Route all sidebar/navbar pages — remount on page change via key
    if (page === "livechat") {
      return <PILiveChat key="livechat" setSelectedPage={setSelectedPage} />;
    }
    if (page === "reports") {
      return <PIReports key="reports" selectedStudy={selectedStudy} />;
    }
    if (page === "recruitment") {
      return <PIRecruitment key="recruitment" selectedStudy={selectedStudy} />;
    }
    if (page === "regulatory") {
      return <PIRegulatory key="regulatory" selectedStudy={selectedStudy} />;
    }
    if (page === "settings") {
      return (
        <PISettings
          key={`settings-${settingsView}`}
          activeView={settingsView}
        />
      );
    }
    if (page === "notifications") {
      return <PINotifications key="notifications" selectedStudy={selectedStudy} />;
    }
    if (page === "site-performance") {
      return <PISitePerformance key="site-performance" selectedStudy={selectedStudy} />;
    }
    if (page === "comments") return <PIComments embedded />;
    if (page === "eisf") return <PIEISFDashboard />;
    if (page === "icf") return <PIICFDashboard />;
    if (page === "study-folder") return <StudyFolderDashboard />;

    return (
      <div className="pi-page-content">
        <div className="dashboard-header">
          <div>
            <h2>Principal Investigator Dashboard</h2>
            <p className="pi-subtitle">Site overview and study progress</p>
          </div>


        </div>

        <div className="pi-kpi-grid">
          <div
            className="pi-card pi-kpi-clickable"
            onClick={() => navigateToPage("recruitment")}
            role="button"
            tabIndex={0}
          >
            <div className="card-header">
              <div className="icon-circle blue">
                <FaUsers />
              </div>
              <div className="card-content">
                <span className="card-title">Enrollment Count</span>
                <span className="card-value">
                  {dashboardData.kpis.enrollmentCount}
                </span>
                <span className="card-subtitle">
                  Target: {dashboardData.kpis.targetCount}
                </span>
              </div>
            </div>
          </div>

          <div
            className="pi-card pi-kpi-clickable"
            onClick={openStudiesSection}
            role="button"
            tabIndex={0}
          >
            <div className="card-header">
              <div className="icon-circle green">
                <FaUser />
              </div>
              <div className="card-content">
                <span className="card-title">Active Subjects</span>
                <span className="card-value">
                  {dashboardData.kpis.activeSubjects}
                </span>
              </div>
            </div>
          </div>

          <div
            className="pi-card pi-kpi-clickable"
            onClick={openStudiesSection}
            role="button"
            tabIndex={0}
          >
            <div className="card-header">
              <div className="icon-circle orange">
                <FaClipboardList />
              </div>
              <div className="card-content">
                <span className="card-title">Studies</span>
                <span className="card-value">
                  {dashboardData.kpis.studiesCount ?? dashboardData.studies.length}
                </span>
              </div>
            </div>
          </div>

          <div
            className="pi-card pi-kpi-clickable"
            onClick={() => navigateToPage("comments")}
            role="button"
            tabIndex={0}
          >
            <div className="card-header">
              <div className="icon-circle red">
                <FaFileAlt />
              </div>
              <div className="card-content">
                <span className="card-title">Comments</span>
                <span className="card-value">
                  {dashboardData.kpis.commentsCount ?? dashboardData.kpis.comments ?? 0}
                </span>
              </div>
            </div>
          </div>

          <div
            className="pi-card pi-kpi-clickable"
            onClick={() => navigateToPage("site-performance")}
            role="button"
            tabIndex={0}
          >
            <div className="card-header">
              <div className="icon-circle purple">
                <FaChartBar />
              </div>
              <div className="card-content">
                <span className="card-title">Visit Completion %</span>
                <span className="card-value">
                  {dashboardData.kpis.visitCompletion}%
                </span>
              </div>
            </div>
          </div>

          <div
            className="pi-card pi-kpi-clickable"
            onClick={() => navigateToPage("regulatory")}
            role="button"
            tabIndex={0}
          >
            <div className="card-header">
              <div className="icon-circle teal">
                <FaShieldAlt />
              </div>
              <div className="card-content">
                <span className="card-title">Consent Rate</span>
                <span className="card-value">
                  {dashboardData.kpis.consentRate}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pi-calendar-visits-section">
          <VisitCalendarSection
            studyCode={
              selectedStudy && selectedStudy !== "All Studies"
                ? selectedStudy
                : ""
            }
          />
        </div>

        <div className="pi-chart-sections">
          <div className="pi-chart-pair-section">
            <div className="pi-chart-pair-grid">
              <div className="chart-card">
                <h4>Enrollment vs Target</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={enrollmentChartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card">
                <h4>Consent Distribution</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={consentChartData}
                      dataKey="value"
                      outerRadius={90}
                      paddingAngle={2}
                      label={({ name, value }) =>
                        value > 0 ? `${name}: ${value}` : ""
                      }
                    >
                      {consentChartData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="middle" align="right" layout="vertical" />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <SubjectAnalyticsSection
            subjects={dashboardData.recentSubjects || []}
            studies={(dashboardData.studies || []).map((study) => ({
              code: study.study || study.code,
              enrolled: Number(study.enrolled) || 0
            }))}
            studyCode={
              selectedStudy && selectedStudy !== "All Studies"
                ? selectedStudy
                : null
            }
          />

          <div className="pi-chart-pair-section">
            <div className="pi-chart-pair-grid">
              <div className="chart-card">
  <h4>Visit Completion Trend</h4>

  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={dashboardData.visitData}>
      <XAxis dataKey="visit" />
      <YAxis />
      <Tooltip />
      <Bar
        dataKey="completion"
        fill="#a78bfa"
        radius={[6, 6, 0, 0]}
      />
    </BarChart>
  </ResponsiveContainer>
</div>
            </div>
          </div>
        </div>

        <div className="alerts-actions-grid">
          <div className="pi-section alerts-card">
            <h3>
              Alerts &amp; Notifications ({dynamicAlerts.length})
            </h3>

            <div className="alerts-list">
              {dynamicAlerts.map((alert, index) => (
                <div
                  key={index}
                  className="alert-item pi-alert-clickable"
                  onClick={() => handleAlertClick(alert)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleAlertClick(alert)}
                >
                  <div className="alert-left">
                    <div className={`alert-icon ${alert.type}`}>
                      {getAlertIcon(alert.type)}
                    </div>

                    <div>
                      <div className="alert-title-row">
                        <h4>{alert.title}</h4>
                        {alert.priority && (
                          <span className={`pi-priority-badge ${alert.priority.toLowerCase()}`}>
                            <FaClipboardList className="alert-field-icon" aria-hidden="true" />
                            {alert.priority}
                          </span>
                        )}
                      </div>
                      <p>{alert.message}</p>
                    </div>
                  </div>

                  <span className="alert-date">
                    <FaClock className="alert-field-icon" aria-hidden="true" />
                    {alert.date}
                  </span>
                </div>
              ))}

              <div
                className="view-alerts-link"
                onClick={() => setShowAlertsModal(true)}
              >
                View All Alerts →
              </div>
            </div>
          </div>

          <div className="pi-section quick-actions-card">
            <h3>Quick Actions</h3>

            <div className="quick-actions">
              {quickActionsData.map((item, index) => (
                <div
                  key={index}
                  className="action-card"
                  onClick={item.action}
                >
                  <div className="action-icon">{item.icon}</div>
                  <p>{item.title}</p>
                  <span className="action-count">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showStudyModal && (
          <div className="study-modal-overlay">
            <div className="study-modal">
              <h3>Add New Study</h3>

              <input
                type="text"
                placeholder="Study ID"
                value={newStudy.study}
                onChange={(e) =>
                  setNewStudy({
                    ...newStudy,
                    study: e.target.value
                  })
                }
              />

              <input
                type="number"
                placeholder="Target"
                value={newStudy.target}
                onChange={(e) =>
                  setNewStudy({
                    ...newStudy,
                    target: e.target.value
                  })
                }
              />

              <input
                type="number"
                placeholder="Enrolled"
                value={newStudy.enrolled}
                onChange={(e) =>
                  setNewStudy({
                    ...newStudy,
                    enrolled: e.target.value
                  })
                }
              />

              <select
                value={newStudy.status}
                onChange={(e) =>
                  setNewStudy({
                    ...newStudy,
                    status: e.target.value
                  })
                }
              >
                <option>On Track</option>
                <option>At Risk</option>
              </select>

              <div className="modal-buttons">
                <button onClick={() => setShowStudyModal(false)}>Cancel</button>
                <button onClick={handleAddStudy}>Save Study</button>
              </div>
            </div>
          </div>
        )}

        {showVisitModal && (
          <div className="study-modal-overlay">
            <div className="study-modal">
              <h3>Schedule Visit</h3>

              <input
                type="text"
                placeholder="Subject ID"
                value={newVisit.subject}
                onChange={(e) =>
                  setNewVisit({
                    ...newVisit,
                    subject: e.target.value
                  })
                }
              />

              <input
                type="text"
                placeholder="Visit Name"
                value={newVisit.visit}
                onChange={(e) =>
                  setNewVisit({
                    ...newVisit,
                    visit: e.target.value
                  })
                }
              />

              <input
                type="date"
                value={newVisit.date}
                onChange={(e) =>
                  setNewVisit({
                    ...newVisit,
                    date: e.target.value
                  })
                }
              />

              <div className="modal-buttons">
                <button onClick={() => setShowVisitModal(false)}>Cancel</button>
                <button onClick={handleAddVisit}>Save Visit</button>
              </div>
            </div>
          </div>
        )}

        {showQueryModal && (
          <div className="study-modal-overlay">
            <div className="study-modal">
              <h3>Create Query</h3>

              <input
                type="text"
                placeholder="Query ID"
                value={newQuery.id}
                onChange={(e) =>
                  setNewQuery({
                    ...newQuery,
                    id: e.target.value
                  })
                }
              />

              <input
                type="text"
                placeholder="Subject ID"
                value={newQuery.subject}
                onChange={(e) =>
                  setNewQuery({
                    ...newQuery,
                    subject: e.target.value
                  })
                }
              />

              <select
                value={newQuery.status}
                onChange={(e) =>
                  setNewQuery({
                    ...newQuery,
                    status: e.target.value
                  })
                }
              >
                <option>Open</option>
                <option>Answered</option>
                <option>Closed</option>
              </select>

              <div className="modal-buttons">
                <button onClick={() => setShowQueryModal(false)}>Cancel</button>
                <button onClick={handleAddQuery}>Save Query</button>
              </div>
            </div>
          </div>
        )}

        {showAlertsModal && (
          <div className="study-modal-overlay">
            <div className="study-modal">
              <h3>All Alerts</h3>

              {dynamicAlerts.map((alert, index) => (
                <div key={index} className="pi-alert-modal-item">
                  <div className="alert-title-row">
                    <strong>{alert.title}</strong>
                    {alert.priority && (
                      <span className={`pi-priority-badge ${alert.priority.toLowerCase()}`}>
                        {alert.priority}
                      </span>
                    )}
                  </div>
                  <p>{alert.message}</p>
                  <small>{alert.date}</small>
                </div>
              ))}

              <button
                className="close-alert-btn"
                onClick={() => setShowAlertsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {!embeddedInLayout && (
          <button
            type="button"
            className="floating-chat-btn"
            onClick={() =>
              navigate("/pi-livechat", {
                state: { from: "/pi-dashboard" },
              })
            }
            aria-label="Open live chat"
          >
            <FiMessageSquare size={40} />
          </button>
        )}
      </div>
    );
  };

  if (embeddedInLayout) {
    return renderPageContent("dashboard");
  }

  return (
    <div className="pi-dashboard-wrapper">
      <PINavbar
        setSelectedPage={setSelectedPage}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onProfileNavigate={(view) => setSettingsView(view || "security")}
      />
      <div className="pi-dashboard-layout">
        <PISidebar
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
          subjects={dashboardData.recentSubjects || []}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="pi-dashboard-content">{renderPageContent()}</div>
      </div>

      {showCommentModal && (
        <PICommentModal
          comments={comments}
          setComments={setComments}
          onClose={() => setShowCommentModal(false)}
        />
      )}
    </div>
  );
}

export default PIDashboard;