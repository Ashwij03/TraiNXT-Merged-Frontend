import React from "react";
import CROSidebar from "./CROSidebar";
import CRONavbar from "./CRONavbar";

function Reports() {
  return (
    <div className="dashboard-layout">

      <CROSidebar />

      <div className="main-content">

        <CRONavbar />

		<div
		  style={{
		    background: "#fff",
		    padding: "20px",
		    borderRadius: "10px",
		    marginTop: "20px"
		  }}
		>
		  <h2>Recent Reports</h2>

		  <table
		    style={{
		      width: "100%",
		      borderCollapse: "collapse"
		    }}
		  >
		    <thead>
		      <tr>
		        <th>Report Name</th>
		        <th>Study</th>
		        <th>Date</th>
		        <th>Status</th>
		        <th>Action</th>
		      </tr>
		    </thead>

		    <tbody>

		      <tr>
		        <td>Monitoring Visit Report</td>
		        <td>CARDIO-101</td>
		        <td>10-Jun-2026</td>
		        <td>Submitted</td>
		        <td>
		          <button>Download</button>
		        </td>
		      </tr>

		      <tr>
		        <td>Site Performance Report</td>
		        <td>ONCO-202</td>
		        <td>15-Jun-2026</td>
		        <td>Approved</td>
		        <td>
		          <button>Download</button>
		        </td>
		      </tr>

		      <tr>
		        <td>Recruitment Report</td>
		        <td>DIAB-303</td>
		        <td>22-Jun-2026</td>
		        <td>Pending</td>
		        <td>
		          <button>Download</button>
		        </td>
		      </tr>

		    </tbody>

		  </table>

		</div>

        </div>

      </div>

  );
}

export default Reports;