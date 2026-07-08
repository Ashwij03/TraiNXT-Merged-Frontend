import React, { useState } from "react";
import CROLayout from "./CROLayout";
import { useCROData } from "./CRODATAContext";
import CROStatusBadge from "./CROStatusBadge";
import EmptyState from "./EmptyState";

function CRONotifications() {
  const {
    notifications,
    markNotificationRead,
    addNotification,
    showModal,
  } = useCROData();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredNotifications = notifications.filter((item) =>
    item.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const criticalCount = notifications.filter(
    (notification) =>
      notification.type === "Performance" &&
      notification.status === "Unread"
  ).length;

  return (
    <CROLayout>
      <h1 style={{ marginBottom: "25px" }}>Notifications</h1>

      <div className="cro-summary-cards">
        <div className="dashboard-card">
          <h3>Total Notifications</h3>
          <h1>{notifications.length}</h1>
        </div>

        <div className="dashboard-card">
          <h3>Unread</h3>
          <h1>
            {notifications.filter(
              (notification) => notification.status === "Unread"
            ).length}
          </h1>
        </div>

        <div className="dashboard-card">
          <h3>Read</h3>
          <h1>
            {notifications.filter(
              (notification) => notification.status === "Read"
            ).length}
          </h1>
        </div>

        <div className="dashboard-card">
          <h3>Critical Alerts</h3>
          <h1>{criticalCount}</h1>
        </div>
      </div>

      <div className="cro-panel">
        <div className="cro-panel-header">
          <input
            type="text"
            placeholder="Search Notification..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <h2 className="sr-only">Notification Actions</h2>

          <button
            type="button"
            className="cro-btn-primary"
            onClick={() =>
              addNotification({
                message: "New monitoring visit scheduled",
                type: "Monitoring",
              })
            }
          >
            + Create Notification
          </button>
        </div>

        {filteredNotifications.length === 0 ? (
          <EmptyState title="No Notifications Found" />
        ) : (
          <div className="cro-table-wrap">
            <table className="cro-data-table">
              <thead>
                <tr>
                  <th>Notification ID</th>
                  <th>Message</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredNotifications.map((notification) => (
                  <tr key={notification.id}>
                    <td>{notification.id}</td>
                    <td>{notification.message}</td>
                    <td>{notification.type}</td>
                    <td>{notification.date}</td>

                    <td>
                      <CROStatusBadge
                        status={
                          notification.status === "Unread"
                            ? "Pending"
                            : "Completed"
                        }
                      />

                      <span style={{ marginLeft: 8, fontSize: 12 }}>
                        {notification.status}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="cro-btn-sm"
                        onClick={() =>
                          showModal({
                            title: notification.id,
                            message: notification.message,
                          })
                        }
                      >
                        View
                      </button>

                      {notification.status === "Unread" && (
                        <button
                          type="button"
                          className="cro-btn-sm"
                          onClick={() =>
                            markNotificationRead(notification.id)
                          }
                          style={{ marginLeft: 8 }}
                        >
                          Mark Read
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CROLayout>
  );
}

export default CRONotifications;