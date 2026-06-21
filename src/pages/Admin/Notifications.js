// UPDATED: Role-aware notifications with categories and bulk actions

import { useMemo, useState } from "react";
import DashboardLayout from "../../Components/dashboard/DashboardLayout";
import DashboardCard from "../../Components/dashboard/DashboardCard";
import KPICard from "../../Components/dashboard/KPICard";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "../../services/adminService";
import {
  getAssignedSite,
  getCurrentUser,
  isAdmin
} from "../../services/roleService";
import "./AdminPage.css";

const CATEGORY_LABELS = {
  comment: "Comment",
  visit: "Visit",
  access: "Access",
  system: "System"
};

function Notifications() {
  const currentUser = getCurrentUser();
  const adminMode = isAdmin(currentUser);
  const assignedSite = getAssignedSite();
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState(getNotifications());

  const scopedNotifications = useMemo(() => {
    if (adminMode) {
      return notifications;
    }

    return notifications.filter((item) => {
      if (!item.site) {
        return true;
      }

      return (
        item.site === assignedSite ||
        String(item.site).includes(assignedSite || "") ||
        String(assignedSite || "").includes(item.site)
      );
    });
  }, [adminMode, assignedSite, notifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return scopedNotifications.filter((item) => !item.read);
    }

    if (filter === "read") {
      return scopedNotifications.filter((item) => item.read);
    }

    return scopedNotifications;
  }, [filter, scopedNotifications]);

  const unreadCount = scopedNotifications.filter((item) => !item.read).length;

  const handleMarkRead = (notificationId) => {
    const updated = markNotificationRead(notificationId);
    setNotifications(updated);
  };

  const handleMarkAllRead = () => {
    setNotifications(markAllNotificationsRead());
  };

  return (
    <DashboardLayout>
      <div className="admin-page">
        <div className="admin-page-title">
          <h1>Notifications</h1>
          <p>
            {adminMode
              ? "System alerts and administrative notifications"
              : `Site notifications for ${assignedSite || "your site"}`}
          </p>
        </div>

        <div className="admin-kpi-grid">
          <KPICard
            title="Total"
            value={scopedNotifications.length}
            subtitle="Visible Notifications"
            icon="🔔"
          />
          <KPICard
            title="Unread"
            value={unreadCount}
            subtitle="Require Attention"
            icon="📬"
          />
          <KPICard
            title="Comments"
            value={
              scopedNotifications.filter((item) => item.category === "comment")
                .length
            }
            subtitle="Comment Alerts"
            icon="💬"
          />
        </div>

        <DashboardCard title="Notification Feed">
          <div className="notification-toolbar">
            <div className="notification-filters">
              {["all", "unread", "read"].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={
                    filter === option
                      ? "notification-filter active"
                      : "notification-filter"
                  }
                  onClick={() => setFilter(option)}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>

            {unreadCount > 0 && (
              <button type="button" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-feed">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item${
                  notification.read ? "" : " unread"
                }`}
              >
                <div>
                  <div className="notification-item-header">
                    <strong>{notification.title}</strong>
                    <span className={`notification-category notification-category--${notification.category || "system"}`}>
                      {CATEGORY_LABELS[notification.category] || "System"}
                    </span>
                  </div>
                  <p style={{ margin: "6px 0 0", color: "#4b5563" }}>
                    {notification.message}
                  </p>
                  <small style={{ color: "#9ca3af" }}>
                    {new Date(notification.createdAt).toLocaleString()}
                    {notification.site ? ` • ${notification.site}` : ""}
                  </small>
                </div>

                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(notification.id)}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}

            {!filteredNotifications.length && (
              <p className="notification-empty">
                No notifications match the selected filter.
              </p>
            )}
          </div>
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
}

export default Notifications;
