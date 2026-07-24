import React, { useState } from "react";
import DelegationLog from "../../components/DelegationLog";
import TrainingLog from "../../components/TrainingLog";
import "./PIEISFDashboard.css";
function PIEISFDashboard() {
  const [eisfTab, setEisfTab] = useState("delegation");

  return (
    <div className="pi-page-content">

      <h1>eISF Dashboard</h1>

      {/* KPI Cards */}
      <div className="cards-container">

        <div className="dashboard-card">
          <h3>Total Documents</h3>
          <h2>125</h2>
        </div>

        <div className="dashboard-card">
          <h3>Expiring Documents</h3>
          <h2>8</h2>
        </div>

        <div className="dashboard-card">
          <h3>Missing Documents</h3>
          <h2>3</h2>
        </div>

        <div className="dashboard-card">
          <h3>Compliance %</h3>
          <h2>96%</h2>
        </div>

      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
          marginBottom: "20px"
        }}
      >
        <button
          className={eisfTab === "delegation" ? "active-tab" : ""}
          onClick={() => setEisfTab("delegation")}
        >
          Delegation Log
        </button>

        <button
          className={eisfTab === "training" ? "active-tab" : ""}
          onClick={() => setEisfTab("training")}
        >
          Training Log
        </button>

        <button
          className={eisfTab === "cvs" ? "active-tab" : ""}
          onClick={() => setEisfTab("cvs")}
        >
          CVs
        </button>

        <button
          className={eisfTab === "licenses" ? "active-tab" : ""}
          onClick={() => setEisfTab("licenses")}
        >
          Licenses
        </button>
      </div>

      {/* Dynamic Content */}

      {eisfTab === "delegation" && (
        <DelegationLog />
      )}

      {eisfTab === "training" && (
        <TrainingLog />
      )}

      {eisfTab === "cvs" && (
        <div className="table-container">
          <h2>CV Documents</h2>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Expiry Date</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Principal Investigator CV</td>
                <td>Active</td>
                <td>15-Aug-2026</td>
              </tr>

              <tr>
                <td>Sub Investigator CV</td>
                <td>Active</td>
                <td>20-Sep-2026</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {eisfTab === "licenses" && (
        <div className="table-container">
          <h2>Licenses</h2>

          <table>
            <thead>
              <tr>
                <th>License</th>
                <th>Status</th>
                <th>Expiry Date</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Medical License</td>
                <td>Active</td>
                <td>01-Jul-2026</td>
              </tr>

              <tr>
                <td>Research License</td>
                <td>Expiring Soon</td>
                <td>15-Jun-2026</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Essential Documents */}
      <div className="table-container">
        <h2>Essential Documents</h2>

        <table>
          <thead>
            <tr>
              <th>Document</th>
              <th>Status</th>
              <th>Expiry Date</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Protocol</td>
              <td>Approved</td>
              <td>31-Dec-2026</td>
            </tr>

            <tr>
              <td>Investigator CV</td>
              <td>Active</td>
              <td>15-Aug-2026</td>
            </tr>

            <tr>
              <td>Medical License</td>
              <td>Expiring Soon</td>
              <td>01-Jul-2026</td>
            </tr>
          </tbody>

        </table>
      </div>

    </div>
  );
}

export default PIEISFDashboard;