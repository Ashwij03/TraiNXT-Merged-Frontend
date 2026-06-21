import React from "react";
import AppLayout from "./AppLayout";
import { useLocation, useNavigate } from "react-router-dom";

const NotificationDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const notification = location.state;

  if (!notification) {
    return (
      <AppLayout>
        <div style={{ padding: "24px" }}>
          <h2>No Notification Selected</h2>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-container">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <h1>Notification Details</h1>

        <div className="kpi-grid">
          <div className="kpi-card">
            <h3>ID</h3>
            <h2>{notification.id}</h2>
          </div>

          <div className="kpi-card">
            <h3>Type</h3>
            <h2>{notification.type}</h2>
          </div>

          <div className="kpi-card">
            <h3>Priority</h3>
            <h2>{notification.priority}</h2>
          </div>

          <div className="kpi-card">
            <h3>Date</h3>
            <h2>{notification.date}</h2>
          </div>
        </div>

        <div className="details-card">
          <h2>Notification Information</h2>

          <div className="details-grid">
            <div>
              <strong>ID</strong>
              <p>{notification.id}</p>
            </div>

            <div>
              <strong>Type</strong>
              <p>{notification.type}</p>
            </div>

            <div>
              <strong>Priority</strong>
              <p>{notification.priority}</p>
            </div>

            <div>
              <strong>Message</strong>
              <p>{notification.message}</p>
            </div>
          </div>
        </div>

        <div className="details-card">
          <h2>Notification Summary</h2>

          <div className="details-grid">
            <div>
              <strong>Study</strong>
              <p>TRIA-003</p>
            </div>

            <div>
              <strong>Triggered By</strong>
              <p>Risk Engine</p>
            </div>

            <div>
              <strong>Category</strong>
              <p>Enrollment Risk</p>
            </div>

            <div>
              <strong>Status</strong>
              <p>Unread</p>
            </div>
          </div>
        </div>

        <div className="details-card">
          <h2>Impact Assessment</h2>

          <table className="sponsor-table">
            <thead>
              <tr>
                <th>Area</th>
                <th>Impact</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Enrollment</td>
                <td>High</td>
              </tr>

              <tr>
                <td>Timeline</td>
                <td>Medium</td>
              </tr>

              <tr>
                <td>Budget</td>
                <td>Low</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="details-card">
          <h2>Affected Sites</h2>

          <table className="sponsor-table">
            <thead>
              <tr>
                <th>Site</th>
                <th>Status</th>
                <th>Enrollment</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Apollo Hospital</td>
                <td>Active</td>
                <td>72%</td>
              </tr>

              <tr>
                <td>Care Hospital</td>
                <td>Delayed</td>
                <td>65%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="details-card">
          <h2>Notification Timeline</h2>

          <table className="sponsor-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Event</th>
                <th>User</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>17-Jun-2026</td>
                <td>Notification Generated</td>
                <td>System</td>
              </tr>

              <tr>
                <td>17-Jun-2026</td>
                <td>Assigned to Sponsor</td>
                <td>Workflow Engine</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotificationDetails;
