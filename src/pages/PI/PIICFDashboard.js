import React from "react";

function PIICFDashboard() {
  return (
    <div className="pi-page-content">

      <h1>ICF Dashboard</h1>

      <div className="cards-container">

        <div className="dashboard-card">
          <h3>Total Subjects</h3>
          <h2>120</h2>
        </div>

        <div className="dashboard-card">
          <h3>Signed Consents</h3>
          <h2>105</h2>
        </div>

        <div className="dashboard-card">
          <h3>Pending Consents</h3>
          <h2>12</h2>
        </div>

        <div className="dashboard-card">
          <h3>Expired Consents</h3>
          <h2>3</h2>
        </div>

      </div>

      <div className="table-container">

        <h2>Consent Status</h2>

        <table>
          <thead>
            <tr>
              <th>Subject ID</th>
              <th>ICF Version</th>
              <th>Consent Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td>SUB-001</td>
              <td>Version 3</td>
              <td>01-Jun-2026</td>
              <td>Signed</td>
            </tr>

            <tr>
              <td>SUB-002</td>
              <td>Version 3</td>
              <td>-</td>
              <td>Pending</td>
            </tr>

            <tr>
              <td>SUB-003</td>
              <td>Version 2</td>
              <td>15-May-2026</td>
              <td>Signed</td>
            </tr>

            <tr>
              <td>SUB-004</td>
              <td>Version 3</td>
              <td>-</td>
              <td>Pending</td>
            </tr>

          </tbody>
        </table>


      </div>

    </div>
  );
}

export default PIICFDashboard;