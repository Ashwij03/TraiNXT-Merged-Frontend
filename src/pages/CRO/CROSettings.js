import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CROLayout from "./CROLayout";
import { useCROData } from "./CRODATAContext";
import { CRO_STORAGE_KEYS, loadFromStorage } from "./croStorage";
import "./CROSettings.css";

const DEFAULT_SETTINGS = {
  organization: "Clinical Research Org",
  email: "cro@trialnxt.com",
  phone: "+91 9876543210",
  timezone: "Asia/Kolkata",
  notifications: true,
  emailAlerts: true,
  smsAlerts: false,
  twoFactorEnabled: false,
};

const SECTIONS = [
  { id: "account", label: "Account Settings" },
  { id: "security", label: "Security Settings" },
  { id: "notifications", label: "Notification Preferences" },
];

function CROSettings() {
  const { showModal } = useCROData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState("account");
  const [settings, setSettings] = useState(() =>
    loadFromStorage(CRO_STORAGE_KEYS.settings, DEFAULT_SETTINGS)
  );

  useEffect(() => {
    const section = searchParams.get("section");
    if (section && SECTIONS.some((item) => item.id === section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    setSearchParams({ section: sectionId });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = () => {
    localStorage.setItem(CRO_STORAGE_KEYS.settings, JSON.stringify(settings));
    showModal({
      title: "Settings Saved",
      message: "Your settings have been saved successfully.",
    });
  };

  return (
    <CROLayout>
      <h1 style={{ marginBottom: "25px" }}>Settings</h1>

      <div className="cro-settings-tabs" role="tablist" aria-label="Settings sections">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            role="tab"
            aria-selected={activeSection === section.id}
            className={`cro-settings-tab${
              activeSection === section.id ? " cro-settings-tab--active" : ""
            }`}
            onClick={() => handleSectionChange(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="cro-panel cro-settings-panel">
        {activeSection === "account" && (
          <div role="tabpanel" id="cro-settings-account">
            <h2 className="cro-settings-section-title">Account Settings</h2>
            <div style={{ marginBottom: "15px" }}>
              <label>Organization Name</label>
              <input
                type="text"
                name="organization"
                value={settings.organization}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: 12,
                  marginTop: 5,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: 12,
                  marginTop: 5,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: 12,
                  marginTop: 5,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>Timezone</label>
              <select
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: 12,
                  marginTop: 5,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              >
                <option value="Asia/Kolkata">India (Asia/Kolkata)</option>
                <option value="America/New_York">USA (New York)</option>
                <option value="Europe/London">UK (London)</option>
                <option value="Asia/Singapore">Singapore</option>
                <option value="Australia/Sydney">Australia (Sydney)</option>
              </select>
            </div>
          </div>
        )}

        {activeSection === "security" && (
          <div role="tabpanel" id="cro-settings-security">
            <h2 className="cro-settings-section-title">Security Settings</h2>
            <div className="cro-settings-info">
              Manage password policies, session security, and two-factor
              authentication for your CRO account.
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                style={{
                  width: "100%",
                  padding: 12,
                  marginTop: 5,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                style={{
                  width: "100%",
                  padding: 12,
                  marginTop: 5,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <input
                type="checkbox"
                name="twoFactorEnabled"
                checked={settings.twoFactorEnabled}
                onChange={handleChange}
              />
              <label>Enable Two-Factor Authentication (2FA)</label>
            </div>
          </div>
        )}

        {activeSection === "notifications" && (
          <div role="tabpanel" id="cro-settings-notifications">
            <h2 className="cro-settings-section-title">
              Notification Preferences
            </h2>
            <div className="cro-settings-info">
              Choose how you receive alerts for monitoring visits, regulatory
              updates, and study milestones.
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <input
                type="checkbox"
                name="notifications"
                checked={settings.notifications}
                onChange={handleChange}
              />
              <label>Enable In-App Notifications</label>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <input
                type="checkbox"
                name="emailAlerts"
                checked={settings.emailAlerts}
                onChange={handleChange}
              />
              <label>Email Alerts</label>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <input
                type="checkbox"
                name="smsAlerts"
                checked={settings.smsAlerts}
                onChange={handleChange}
              />
              <label>SMS Alerts</label>
            </div>
          </div>
        )}

        <button type="button" className="cro-btn-primary" onClick={handleSave}>
          Save Settings
        </button>
      </div>
    </CROLayout>
  );
}

export default CROSettings;
