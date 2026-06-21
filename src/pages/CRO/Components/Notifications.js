import React from "react";
import CROSidebar from "./CROSidebar";
import CRONavbar from "./CRONavbar";

function Notifications() {
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
		  <h2>Recent Notifications</h2>

		  <table
		    style={{
		      width: "100%",
		      borderCollapse: "collapse"
		    }}
		  >
		    <thead>
		      <tr>
		        <th>Date</th>
		        <th>Notification</th>
		        <th>Priority</th>
		        <th>Status</th>
		      </tr>
		    </thead>

		    <tbody>

		      <tr>
		        <td>10-Jun-2026</td>
		        <td>Apollo Hospital Monitoring Visit Overdue</td>
		        <td>High</td>
		        <td>Open</td>
		      </tr>

		      <tr>
		        <td>12-Jun-2026</td>
		        <td>Protocol Deviation Review Pending</td>
		        <td>Medium</td>
		        <td>Pending</td>
		      </tr>

		      <tr>
		        <td>14-Jun-2026</td>
		        <td>Site Initiation Visit Scheduled</td>
		        <td>Low</td>
		        <td>Scheduled</td>
		      </tr>

		      <tr>
		        <td>15-Jun-2026</td>
		        <td>CAPA Review Completed</td>
		        <td>Low</td>
		        <td>Closed</td>
		      </tr>

		    </tbody>
		  </table>
		</div>
		
        </div>

      </div>

  );
}

export default Notifications;