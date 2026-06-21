import { useParams } from "react-router-dom";
import { useState } from "react";

import "./SubjectProfile.css";

import ProgressNotes from "./ProgressNotes";
import Files from "./Files";

export default function SubjectProfile() {

  const { id } = useParams();

  const [activeTab, setActiveTab] = useState("visits");

  return (

    <div className="subject-container">
    

      <div className="subject-profile-card">


        {/* HEADER */}
        <div className="profile-header">

          <div className="profile-left">

            <div className="profile-avatar">
              👤
            </div>

            <div>

              <h2>T-S 123-0001</h2>

              <p>
                <strong>Subject ID:</strong> 123-0001
              </p>

              <p>
                <strong>Status:</strong> In Screening
              </p>

              <p>
                <strong>Randomization ID:</strong>
              </p>

              <p>
                <strong>Randomization Date:</strong>
              </p>

            </div>

          </div>

          <div className="profile-right">

            <p>
              <strong>Sex:</strong> Female
            </p>

            <p>
              <strong>Gender:</strong> Female
            </p>

            <p>
              <strong>DOB:</strong> 04-Mar-1958
            </p>

          </div>

        </div>

        {/* INNER TABS */}
        <div className="inner-tabs">

          <span
            className={activeTab === "visits" ? "active" : ""}
            onClick={() => setActiveTab("visits")}
          >
            Visit Schedule
          </span>

          <span
            className={activeTab === "progress" ? "active" : ""}
            onClick={() => setActiveTab("progress")}
          >
            Progress Notes
          </span>

          <span
            className={activeTab === "comments" ? "active" : ""}
            onClick={() => setActiveTab("comments")}
          >
            Profile Changes
          </span>

          <span
            className={activeTab === "logs" ? "active" : ""}
            onClick={() => setActiveTab("logs")}
          >
            Logs
          </span>

        </div>

        {/* VISITS */}
        {activeTab === "visits" && (

          <div className="visit-schedule-box">

            <div className="todo-bar">

              <div>
                <strong>To-dos Summary</strong>
              </div>

              <div className="todo-status">
                <span style={{ color: "red" }}>1 Overdue</span>
                <span style={{ color: "orange" }}>0 Immediate</span>
                <span style={{ color: "green" }}>0 Available</span>
              </div>

            </div>

            <div className="attached-files">
              <strong>1 Files</strong> attached to T-S 123-0001
            </div>

            <table
              width="100%"
              border="1"
              cellPadding="10"
            >

              <thead>

                <tr>

                  <th>Visit</th>

                  <th>Status</th>

                  <th>Visit Date</th>

                  <th>Users</th>

                  <th>Files</th>

                </tr>

              </thead>

              <tbody>

                <tr>

                  <td>VISIT - UNSCHEDULED VISIT</td>

                  <td>✔ Completed offline</td>

                  <td>25-JUL-2021</td>

                  <td>Megan Richards</td>

                  <td>1</td>

                </tr>

              </tbody>

            </table>

          </div>

        )}

        {/* PROGRESS */}
        {activeTab === "progress" && (
          <ProgressNotes />
        )}

        {/* FILES */}
        {activeTab === "files" && (
          <Files />
        )}

        {/* COMMENTS */}
        {activeTab === "comments" && (
          <p>Profile Changes Section</p>
        )}

        {/* LOGS */}
        {activeTab === "logs" && (
          <p>Logs Section</p>
        )}

      </div>

    </div>

  );

}