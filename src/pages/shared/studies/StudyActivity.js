
import RecentActivity from "../../../Components/dashboard/RecentActivity";
// ===== END F2 CHANGES =====
// ===== START F2 CHANGES =====
import StudyComments from "./StudyComments";
// ===== END F2 CHANGES =====
import React, { useState }from "react";
import "./StudyActivity.css";

// ===== START F2 CHANGES =====



const overdueActivities = [
  {
    id: 1,
    activity: "Protocol Review",
    owner: "Quality Team",
    dueDate: "05-Jul-2026",
    status: "Overdue",
  },
];

const upcomingActivities = [
  {
    id: 1,
    activity: "Site Monitoring Visit",
    owner: "Dr. Smith",
    dueDate: "20-Jul-2026",
    status: "Scheduled",
  },
  {
    id: 2,
    activity: "Investigator Meeting",
    owner: "Clinical Team",
    dueDate: "22-Jul-2026",
    status: "Planned",
  },
];

// ===== END F2 CHANGES =====

// ===== START F2 CHANGES =====
const recentActivities = [
  {
    id: 1,
    title: "Email sent to Investigator",
    site: "Apollo Hospital",
    time: "10 mins ago",
  },
  {
    id: 2,
    title: "Site Monitoring Visit",
    site: "Care Hospital",
    time: "1 hour ago",
  },
  {
    id: 3,
    title: "Study Document Uploaded",
    site: "Global Research Center",
    time: "Yesterday",
  },
];
// ===== END F2 CHANGES =====

function StudyActivity() {
    const [showComposeModal, setShowComposeModal] = useState(false);
    const handleRefresh = () => {
        window.location.reload();
    };

  return (
    <div className="workspace-content">

      {/* ===== START F2 CHANGES ===== */}

      <div className="activity-header">
        <h2>Study Activity</h2>

        <div className="activity-actions">
          <button onClick={() => setShowComposeModal(true)}>Compose Email</button>
          <button onClick={handleRefresh}>Refresh</button>
          <select>
            <option value="all">All Activities</option>
            <option value="email">Email</option>
            <option value="event">Events</option>
            <option value="task">Tasks</option>
            <option value="call">Log Calls</option>
          </select>
        </div>
      </div>

      <div className="activity-grid">

        <div className="activity-card">
          <h3>Upcoming Activities</h3>
          <table className="activity-table">
            <thead>
                <tr>
                    <th>Activity</th>
                    <th>Owner</th>
                    <th>Due Date</th>
                    <th>Status</th>
                </tr>
            </thead>

            <tbody>
                {upcomingActivities.map((item) => (
                    <tr key={item.id}>
                        <td>{item.activity}</td>
                        <td>{item.owner}</td>
                        <td>{item.dueDate}</td>
                        <td>{item.status}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>

        <div className="activity-card">
          <h3>Overdue Activities</h3>
          <table className="activity-table">
            <thead>
                <tr>
                    <th>Activity</th>
                    <th>Owner</th>
                    <th>Due Date</th>
                    <th>Status</th>
                </tr>
            </thead>

            <tbody>
                {overdueActivities.map((item) => (
                    <tr key={item.id}>
                        <td>{item.activity}</td>
                        <td>{item.owner}</td>
                        <td>{item.dueDate}</td>
                        <td>{item.status}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>

        <div className="activity-card">
          <h3>Timeline</h3>
          <RecentActivity activities={recentActivities} />
        </div>

        <div className="activity-card">
            <h3>Activity History</h3>

            {/* ===== START F2 CHANGES ===== */}

            <StudyComments />

            {/* ===== END F2 CHANGES ===== */}

        </div>

      </div>


      {/* ===== END F2 CHANGES ===== */}

      {/* ===== START F2 CHANGES ===== */}

      {showComposeModal && (
        <div className="email-modal-overlay">

          <div className="email-modal">

            <h3>Compose Email</h3>

            <input
              type="email"
              placeholder="Recipient"
            />

            <input
              type="text"
              placeholder="Subject"
            />

            <textarea
              rows="5"
              placeholder="Message"
            />

            <div className="modal-actions">

              <button
                onClick={() => {
                  alert("Email Sent");
                  setShowComposeModal(false);
                }}
              >
                Send
              </button>

              <button
                onClick={() => setShowComposeModal(false)}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ===== END F2 CHANGES ===== */}


    </div>
    
  );
}

export default StudyActivity;