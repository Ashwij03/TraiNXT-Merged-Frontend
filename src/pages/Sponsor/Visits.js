import React, { useState } from 'react';
import AppLayout from './AppLayout';
import "./Visits.css";
import { useNavigate } from "react-router-dom";
function Visits() {
	const navigate = useNavigate();
	const [inputValue, setInputValue] = useState("");
	

	const visits = [
	  {
	    visitId: "VIS-001",
	    studyId: "TRIA-001",
	    subject: "SUB-001",
	    site: "Hyderabad",
	    visit: "Month 3",
	    scheduledDate: "10-Jun-2026",
	    actualDate: "10-Jun-2026",
	    status: "Completed",
	    deviation: "No"
	  },
	  {
	    visitId: "VIS-002",
	    studyId: "TRIA-001",
	    subject: "SUB-002",
	    site: "Hyderabad",
	    visit: "Baseline",
	    scheduledDate: "12-Jun-2026",
	    actualDate: "-",
	    status: "Upcoming",
	    deviation: "No"
	  },
	  {
	    visitId: "VIS-003",
	    studyId: "TRIA-002",
	    subject: "SUB-003",
	    site: "Bangalore",
	    visit: "Month 1",
	    scheduledDate: "08-Jun-2026",
	    actualDate: "12-Jun-2026",
	    status: "Completed",
	    deviation: "Yes"
	  }
	];
	const filteredVisits = visits.filter((item) =>
  item.visitId
    .toLowerCase()
    .includes(inputValue.toLowerCase())
);
  return (

	<AppLayout>

	  <div className="visits-page">

	    <h1>Visit Tracking</h1>

	    <div className="visit-summary">

	    <div className="summary-card">
	      <h3>Completed Visits</h3>
	      <p>350</p>
	    </div>

	    <div className="summary-card">
	      <h3>Upcoming Visits</h3>
	      <p>50</p>
	    </div>

	    <div className="summary-card">
	      <h3>Missed Visits</h3>
	      <p>20</p>
	    </div>

	    <div className="summary-card">
	      <h3>Protocol Deviations</h3>
	      <p>5</p>
	    </div>

	  </div>
	  <div className="visits-filters">

	 <input
  type="text"
  placeholder="Search Visit ID..."
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
/>
	
	  </div>

	  <div className="visits-table-card">

	  <table className="subjects-table">
        <thead>

          <tr>
		  <th>Visit ID</th>
		  <th>Study</th>
		  <th>Subject</th>
		  <th>Site</th>
		  <th>Visit Type</th>
		  <th>Scheduled Date</th>
		  <th>Actual Date</th>
		  <th>Status</th>
		  <th>Deviation</th>
		  <th>Action</th>
          </tr>

        </thead>

        <tbody>

        {filteredVisits.map((item) => (

            <tr key={item.subject}>

			<td>{item.visitId}</td>
			<td>{item.studyId}</td>
			<td>{item.subject}</td>
			<td>{item.site}</td>
			<td>{item.visit}</td>
			<td>{item.scheduledDate}</td>
			<td>{item.actualDate}</td>
			<td>
			  <span className={`status-badge ${item.status}`}>
			    {item.status}
			  </span>
			</td>
			<td>{item.deviation}</td>

			<td>
			<button
  className="view-btn"
  onClick={() =>
    navigate(`/visit-details/${item.visitId}`)
  }
>
  View
</button>
			</td>

            </tr>

          ))}

        </tbody>

      </table>
	  
	      </div>

	    </div>

	  </AppLayout>

  );

}

export default Visits;