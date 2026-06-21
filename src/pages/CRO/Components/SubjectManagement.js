import React, { useState, useEffect } from "react";
import CROSidebar from "./CROSidebar";
import CRONavbar from "./CRONavbar";

function SubjectManagement() {
	const [subjects, setSubjects] = useState(() => {
	  const savedSubjects = localStorage.getItem("subjects");
	  
	  return savedSubjects
	    ? JSON.parse(savedSubjects)
	    : [
			{
			  id: 1,
			  subjectId: "SUB001",
			  subjectName: "John Doe",
			  study: "ST101",
			  status: "Screened"
			},
			{
			  id: 2,
			  subjectId: "SUB002",
			  subjectName: "David Smith",
			  study: "ST102",
			  status: "Enrolled"
			},
			{
			  id: 3,
			  subjectId: "SUB003",
			  subjectName: "Robert Brown",
			  study: "ST103",
			  status: "Completed"
			}
	      ];
	});
	
	useEffect(() => {
	  localStorage.setItem(
	    "subjects",
	    JSON.stringify(subjects)
	  );
	}, [subjects]);
	
	const [search, setSearch] = useState("");

	const filteredSubjects = subjects.filter(
	  (subject) =>
	    subject.subjectId
	      .toLowerCase()
	      .includes(search.toLowerCase()) ||
	    subject.subjectName
	      .toLowerCase()
	      .includes(search.toLowerCase())
	);
	
	const handleAddSubject = () => {
	  const subjectId = prompt("Enter Subject ID");

	  if (!subjectId) return;

	  const subjectName = prompt("Enter Subject Name");

	  const newSubject = {
	    id: Date.now(),
	    subjectId,
	    subjectName,
	    study: "ST101",
	    status: "Screened"
	  };

	  setSubjects([...subjects, newSubject]);
	};
	
	
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
            <h1>Subject Management</h1>

			<button
			  onClick={handleAddSubject}
			  style={{
			    background: "#0d6efd",
			    color: "#fff",
			    border: "none",
			    padding: "12px 24px",
			    borderRadius: "8px",
			    cursor: "pointer"
			  }}
			>
			  Add Subject
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
		    placeholder="Search Subject..."
		    value={search}
		    onChange={(e) => setSearch(e.target.value)}
		    style={{
		      width: "350px",
		      padding: "12px",
		      marginBottom: "20px",
		      border: "1px solid #ddd",
		      borderRadius: "8px"
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
			    <th>Subject ID</th>
			    <th>Subject Name</th>
			    <th>Study</th>
			    <th>Status</th>
			    <th>Action</th>
			  </tr>
              </thead>

			  <tbody>
			    {filteredSubjects.map((subject) => (
			      <tr key={subject.id}>
			        <td>{subject.subjectId}</td>

			        <td>{subject.subjectName}</td>

			        <td>{subject.study}</td>

			        <td>
			          <span
			            className={
			              subject.status === "Screened"
			                ? "status-screened"
			                : subject.status === "Enrolled"
			                ? "status-enrolled"
			                : "status-completed"
			            }
			          >
			            {subject.status}
			          </span>
			        </td>

			        <td>
			          <button>View</button>
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

export default SubjectManagement;