// UPDATED: Settings with role-aware account, notification, and system preferences

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../Components/dashboard/DashboardLayout";
import DashboardCard from "../../Components/dashboard/DashboardCard";
import {
  getSettings,
  saveSettings
} from "../../services/adminService";
import ROLES from "../../constants/roles";
import {
  getAllRoles,
  getAssignedSite,
  getCurrentUser,
  getDashboardPath,
  getEffectiveRole,
  getUserProfile,
  getUserSettings,
  isAdmin,
  ROLE_LABELS,
  saveUserSettings,
  setAdminPreviewRole,
  SWITCHABLE_ROLE_DASHBOARDS
} from "../../services/roleService";
import {
  formatSessionTimestamp,
  getAllActiveSessions,
  getCurrentSession,
  getSessionDurationMinutes,
  SESSIONS_CHANGE_EVENT
} from "../../services/sessionService";
import { ADMIN_PREVIEW_ROLE_EVENT } from "../../constants/headerFilters";
import "./AdminPage.css";

function Settings() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const profile = getUserProfile();
  const assignedSite = getAssignedSite();
  const adminMode = isAdmin();

  const [systemSettings, setSystemSettings] = useState(
    adminMode ? getSettings() : {}
  );
  const [userSettings, setUserSettings] = useState({
    ...getUserSettings(),
    commentAlerts: true,
    visitReminders: true,
    weeklyDigest: adminMode,
    compactDashboard: false,
    defaultLandingPage: "dashboard"
  });
  const [savedMessage, setSavedMessage] = useState("");
  const [previewRole, setPreviewRoleState] = useState(
    () => getEffectiveRole(currentUser) || ROLES.ADMIN
  );
  const [sessionsVersion, setSessionsVersion] = useState(0);

  useEffect(() => {
    const refreshSessions = () => setSessionsVersion((value) => value + 1);

    window.addEventListener(SESSIONS_CHANGE_EVENT, refreshSessions);

    return () => {
      window.removeEventListener(SESSIONS_CHANGE_EVENT, refreshSessions);
    };
  }, []);

  useEffect(() => {
    if (adminMode) {
      getCurrentSession(currentUser);
      setSessionsVersion((value) => value + 1);
    }
  }, [adminMode, currentUser]);

  useEffect(() => {
    const syncPreviewRole = () => {
      setPreviewRoleState(getEffectiveRole(currentUser) || ROLES.ADMIN);
    };

    window.addEventListener(ADMIN_PREVIEW_ROLE_EVENT, syncPreviewRole);

    return () => {
      window.removeEventListener(ADMIN_PREVIEW_ROLE_EVENT, syncPreviewRole);
    };
  }, [currentUser]);

  const activeSessions = useMemo(() => {
    void sessionsVersion;
    return adminMode ? getAllActiveSessions() : [];
  }, [adminMode, sessionsVersion]);

  const currentSession = useMemo(() => {
    void sessionsVersion;
    return getCurrentSession(currentUser);
  }, [currentUser, sessionsVersion]);

  const roleOptions = useMemo(() => getAllRoles(), []);

  const handleSystemChange = (field, value) => {
    setSystemSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUserChange = (field, value) => {
    setUserSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (adminMode) {
      saveSettings(systemSettings);
    }

    saveUserSettings(userSettings);
    setSavedMessage("Settings saved successfully.");
  };

  const handlePreviewRoleChange = (nextRole) => {
    if (!nextRole || !adminMode) {
      return;
    }

    if (nextRole === ROLES.ADMIN) {
      setAdminPreviewRole(null);
      setPreviewRoleState(ROLES.ADMIN);
      navigate("/admin-dashboard");
      return;
    }

    if (SWITCHABLE_ROLE_DASHBOARDS.includes(nextRole)) {
      setAdminPreviewRole(nextRole);
      setPreviewRoleState(nextRole);
      navigate(getDashboardPath(nextRole));
    }
  };

  const handlePreviewSessionRole = (role) => {
    if (!role || role === ROLES.ADMIN) {
      handlePreviewRoleChange(ROLES.ADMIN);
      return;
    }

    if (SWITCHABLE_ROLE_DASHBOARDS.includes(role)) {
      handlePreviewRoleChange(role);
    }
  };

  return (
    <DashboardLayout>
      <div className="admin-page">
        <div className="admin-page-title">
          <h1>Account Settings</h1>
          <p>
            {adminMode
              ? "Administrative preferences, notifications, and system defaults"
              : `Site account preferences for ${assignedSite || "your site"}`}
          </p>
        </div>

        {adminMode && (
          <DashboardCard title="System Preferences">
            <form className="admin-settings-form" onSubmit={handleSave}>
              <div className="admin-form-grid">
                <label>
                  Organization Name
                  <input
                    type="text"
                    value={systemSettings.organizationName || ""}
                    onChange={(event) =>
                      handleSystemChange("organizationName", event.target.value)
                    }
                  />
                </label>

                <label>
                  Timezone
                  <select
                    value={systemSettings.timezone || "Asia/Kolkata"}
                    onChange={(event) =>
                      handleSystemChange("timezone", event.target.value)
                    }
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </label>

                <label>
                  Date Format
                  <select
                    value={systemSettings.dateFormat || "DD-MMM-YYYY"}
                    onChange={(event) =>
                      handleSystemChange("dateFormat", event.target.value)
                    }
                  >
                    <option value="DD-MMM-YYYY">DD-MMM-YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </label>

                <label>
                  Default Study Status
                  <select
                    value={systemSettings.defaultStudyStatus || "Active"}
                    onChange={(event) =>
                      handleSystemChange("defaultStudyStatus", event.target.value)
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Closed">Closed</option>
                  </select>
                </label>

                <label>
                  Audit Retention (days)
                  <input
                    type="number"
                    min="30"
                    value={systemSettings.auditRetentionDays || 365}
                    onChange={(event) =>
                      handleSystemChange(
                        "auditRetentionDays",
                        Number(event.target.value)
                      )
                    }
                  />
                </label>
              </div>
            </form>
          </DashboardCard>
        )}

        {adminMode && (
          <DashboardCard title="Active Sessions" className="settings-active-sessions-card">
            <p className="settings-section-help">
              Monitor active sessions across all roles and preview dashboards as
              another role.
            </p>

            {currentSession && (
              <div className="settings-current-session">
                <h4 className="settings-current-session-title">Active Session</h4>
                <div className="settings-current-session-grid">
                  <div>
                    <span>Session</span>
                    <strong>
                      {currentSession.sessionId?.slice(-8) || "—"}
                    </strong>
                  </div>
                  <div>
                    <span>Started</span>
                    <strong>
                      {formatSessionTimestamp(currentSession.startedAt)}
                    </strong>
                  </div>
                  <div>
                    <span>Duration</span>
                    <strong>{getSessionDurationMinutes(currentSession)} min</strong>
                  </div>
                  <div>
                    <span>Device</span>
                    <strong>{currentSession.device || "—"}</strong>
                  </div>
                </div>
              </div>
            )}

            <div className="settings-role-preview">
              <label>
                Preview dashboard as
                <select
                  value={previewRole}
                  onChange={(event) =>
                    handlePreviewRoleChange(event.target.value)
                  }
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="active-sessions-table-wrap">
              <table className="active-sessions-table">
                <thead>
                  <tr>
                    <th>Session ID</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Started</th>
                    <th>Duration</th>
                    <th>Device</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSessions.length ? (
                    activeSessions.map((session) => (
                      <tr key={session.sessionId}>
                        <td>{session.sessionId}</td>
                        <td>
                          <strong>{session.userName || "—"}</strong>
                          <div className="session-table-subtext">
                            {session.userEmail || "—"}
                          </div>
                        </td>
                        <td>{ROLE_LABELS[session.role] || session.role || "—"}</td>
                        <td>{formatSessionTimestamp(session.startedAt)}</td>
                        <td>{getSessionDurationMinutes(session)} min</td>
                        <td>{session.device || "—"}</td>
                        <td>
                          {session.role &&
                          session.role !== ROLES.ADMIN &&
                          SWITCHABLE_ROLE_DASHBOARDS.includes(session.role) ? (
                            <button
                              type="button"
                              className="secondary-btn session-preview-btn"
                              onClick={() =>
                                handlePreviewSessionRole(session.role)
                              }
                            >
                              View as {ROLE_LABELS[session.role] || session.role}
                            </button>
                          ) : (
                            <span className="session-table-muted">Current</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="session-table-empty">
                        No active sessions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        )}

        <DashboardCard title="Notification Preferences">
          <form className="admin-settings-form" onSubmit={handleSave}>
            <label>
              <span>
                <input
                  type="checkbox"
                  checked={!!userSettings.emailNotifications}
                  onChange={(event) =>
                    handleUserChange("emailNotifications", event.target.checked)
                  }
                />{" "}
                Enable email notifications
              </span>
            </label>

            <label>
              <span>
                <input
                  type="checkbox"
                  checked={!!userSettings.smsNotifications}
                  onChange={(event) =>
                    handleUserChange("smsNotifications", event.target.checked)
                  }
                />{" "}
                Enable SMS notifications
              </span>
            </label>

            <label>
              <span>
                <input
                  type="checkbox"
                  checked={!!userSettings.commentAlerts}
                  onChange={(event) =>
                    handleUserChange("commentAlerts", event.target.checked)
                  }
                />{" "}
                Alert me when new comments are assigned
              </span>
            </label>

            <label>
              <span>
                <input
                  type="checkbox"
                  checked={!!userSettings.visitReminders}
                  onChange={(event) =>
                    handleUserChange("visitReminders", event.target.checked)
                  }
                />{" "}
                Send upcoming visit reminders
              </span>
            </label>

            {adminMode && (
              <label>
                <span>
                  <input
                    type="checkbox"
                    checked={!!userSettings.weeklyDigest}
                    onChange={(event) =>
                      handleUserChange("weeklyDigest", event.target.checked)
                    }
                  />{" "}
                  Receive weekly portfolio digest
                </span>
              </label>
            )}

            <label>
              Dashboard Refresh
              <select
                value={userSettings.dashboardRefresh || "daily"}
                onChange={(event) =>
                  handleUserChange("dashboardRefresh", event.target.value)
                }
              >
                <option value="realtime">Real-time</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
              </select>
            </label>
          </form>
        </DashboardCard>

        <DashboardCard title="Profile & Display Preferences">
          <form className="admin-settings-form" onSubmit={handleSave}>
            <label>
              Preferred Language
              <select
                value={userSettings.preferredLanguage || profile.preferredLanguage}
                onChange={(event) =>
                  handleUserChange("preferredLanguage", event.target.value)
                }
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Tamil</option>
              </select>
            </label>

            <label>
              Default Landing Page
              <select
                value={userSettings.defaultLandingPage || "dashboard"}
                onChange={(event) =>
                  handleUserChange("defaultLandingPage", event.target.value)
                }
              >
                <option value="dashboard">Dashboard</option>
                <option value="studies">Studies</option>
                <option value="subjects">Subjects</option>
                <option value="comments">Comments</option>
              </select>
            </label>

            <label>
              <span>
                <input
                  type="checkbox"
                  checked={!!userSettings.compactDashboard}
                  onChange={(event) =>
                    handleUserChange("compactDashboard", event.target.checked)
                  }
                />{" "}
                Use compact dashboard layout
              </span>
            </label>

            {!adminMode && assignedSite && (
              <p style={{ color: "#6b7280", margin: 0 }}>
                Settings apply to site: <strong>{assignedSite}</strong>
              </p>
            )}

            <button type="submit">Save Settings</button>

            {savedMessage && (
              <p style={{ color: "#059669", margin: 0 }}>{savedMessage}</p>
            )}
          </form>
        </DashboardCard>

        <DashboardCard title="Account Summary">
          <div className="profile-detail-grid">
            <div>
              <span>Name</span>
              <strong>{currentUser?.name || "—"}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{currentUser?.email || "—"}</strong>
            </div>
            <div>
              <span>Role</span>
              <strong>{currentUser?.role || "—"}</strong>
            </div>
            <div>
              <span>Site</span>
              <strong>{assignedSite || profile.assignedSite || "—"}</strong>
            </div>
          </div>
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
}

export default Settings;
