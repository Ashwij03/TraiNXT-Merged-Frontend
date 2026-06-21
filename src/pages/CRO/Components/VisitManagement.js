import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CROSidebar from "./CROSidebar";
import CRONavbar from "./CRONavbar";

function VisitManagement() {
	const [search, setSearch] = useState("");
	const [visits, setVisits] = useState(() => {

    const savedVisits = localStorage.getItem("visits");
	return savedVisits
	  ? JSON.parse(savedVisits)
	  : [
		{
		  id: 1,
		  visitName: "Screening Visit",
		  study: "SUB001",
		  status: "Scheduled"
		},
		{
		  id: 2,
		  visitName: "Baseline Visit",
		  study: "SUB002",
		  status: "Completed"
		},
		{
		  id: 3,
		  visitName: "Follow-up Visit",
		  study: "SUB003",
		  status: "Missed"
		}
	    ];
   });  


useEffect(() => {
  localStorage.setItem(
    "visits",
    JSON.stringify(visits)
  );
}, [visits]);

const filteredVisits = visits.filter((visit) =>
  visit.visitName.toLowerCase().includes(
    search.toLowerCase()
  )
);

const handleAddVisit = () => {
  const visitName = prompt("Enter Visit Name");

  if (!visitName) return;

  const newVisit = {
    id: Date.now(),
    visitName,
    study: "ST101",
    status: "Scheduled"
  };

  setVisits([...visits, newVisit]);
};

const handleDelete = (id) => {
  setVisits(
    visits.filter((visit) => visit.id !== id)
  );
};

const handleStatusChange = (id) => {
  setVisits(
    visits.map((visit) =>
      visit.id === id
        ? {
            ...visit,
            status:
              visit.status === "Scheduled"
                ? "In Progress"
                : visit.status === "In Progress"
                ? "Completed"
                : "Scheduled"
          }
        : visit
    )
  );
};

const navigate = useNavigate();

  return (
    <div className="dashboard-layout">

      <CROSidebar />

      <div className="main-content">

        <CRONavbar />

        <div style={{ padding: "30px" }}>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <h1>Visit Management</h1>

			<button
			onClick={handleAddVisit}
			  style={{
			    background: "#0d6efd",
			    color: "#fff",
			    border: "none",
			    padding: "12px 24px",
			    borderRadius: "8px",
			    fontWeight: "600",
			    cursor: "pointer"
			  }}
			>
			  Add Visit
			</button>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              marginTop: "20px"
            }}
          >
		  <input
		    type="text"
		    placeholder="Search Visit..."
		    value={search}
		    onChange={(e) => setSearch(e.target.value)}
		    style={{
		      padding: "10px",
		      width: "300px",
		      marginBottom: "20px"
		    }}
		  />

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse"
              }}
            >
              <thead>
                <tr>
                  <th>Visit ID</th>
                  <th>Subject</th>
                  <th>Visit Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

			  <tbody>
			    {filteredVisits.map((visit) => (
			      <tr key={visit.id}>
			        <td>{visit.id}</td>

			        <td>{visit.study}</td>

			        <td>{visit.visitName}</td>

			        <td>
			          <span
			            className={
			              visit.status === "Completed"
			                ? "status-completed"
			                : visit.status === "Scheduled"
			                ? "status-scheduled"
			                : "status-missed"
			            }
			          >
			            {visit.status}
			          </span>
			        </td>

					<td>
					  <button
					    onClick={() =>
					      alert(
					        `Visit Name: ${visit.visitName}
					Subject: ${visit.study}
					Status: ${visit.status}`
					      )
					    }
					  >
					    View
					  </button>

					  <button
					    onClick={() =>
					      handleStatusChange(visit.id)
					    }
					    style={{
					      marginLeft: "8px"
					    }}
					  >
					    Status
					  </button>

					  <button
					    onClick={() =>
					      handleDelete(visit.id)
					    }
					    style={{
					      marginLeft: "8px",
					      background: "red",
					      color: "white"
					    }}
					  >
					    Delete
					  </button>
					</td>
			      </tr>
			    ))}
			  </tbody>
			  
            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

export default VisitManagement;