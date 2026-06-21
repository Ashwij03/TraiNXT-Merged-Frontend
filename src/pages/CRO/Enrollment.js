import React, { useState, useEffect } from "react";
import CROSidebar from "./Components/CROSidebar";
import CRONavbar from "./Components/CRONavbar";

function Enrollment() {
	const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);

	const [subjectId, setSubjectId] = useState("");
	const [subjectName, setSubjectName] = useState("");
	const [studyCode, setStudyCode] = useState("");
	const [enrollmentDate, setEnrollmentDate] = useState("");
	const [status, setStatus] = useState("Enrolled");

  const [search, setSearch] = useState("");

  const [enrollments, setEnrollments] = useState(() => {

    const savedEnrollments =
      localStorage.getItem("enrollments");

    return savedEnrollments
      ? JSON.parse(savedEnrollments)
      : [
          {
            id: 1,
            subjectId: "SUB001",
            subjectName: "John Doe",
            study: "ST101",
            enrollmentDate: "02-Jun-2026",
            status: "Enrolled"
          },
          {
            id: 2,
            subjectId: "SUB002",
            subjectName: "David Smith",
            study: "ST102",
            enrollmentDate: "05-Jun-2026",
            status: "Randomized"
          },
          {
            id: 3,
            subjectId: "SUB003",
            subjectName: "Sarah Wilson",
            study: "ST103",
            enrollmentDate: "08-Jun-2026",
            status: "Completed"
          }
        ];
  });

  useEffect(() => {
    localStorage.setItem(
      "enrollments",
      JSON.stringify(enrollments)
    );
  }, [enrollments]);

  const filteredEnrollments =
    enrollments.filter(
      (enrollment) =>
        enrollment.subjectId
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        enrollment.subjectName
          .toLowerCase()
          .includes(search.toLowerCase())
    );
	
  const handleAddEnrollment = () => {
	
    const subjectId =
      prompt("Enter Subject ID");
	  
	  const subjectName =
	    prompt("Enter Subject Name");

		if (!subjectId || !subjectName)
		  return;

    const newEnrollment = {
      id: Date.now(),
      subjectId,
	  subjectName,
      study: "ST101",
      enrollmentDate: new Date()
        .toLocaleDateString(),
		status: "Screened"
    };
	
    setEnrollments([
      ...enrollments,
      newEnrollment
    ]);
  };
  const handleSaveEnrollment = () => {

    if (!subjectId || !subjectName) {
      alert("Please fill all fields");
      return;
    }

    const newEnrollment = {
      id: Date.now(),
      subjectId,
      subjectName,
      study: studyCode || "ST101",
      enrollmentDate:
        enrollmentDate || new Date().toLocaleDateString(),
      status
    };

    setEnrollments([
      ...enrollments,
      newEnrollment
    ]);

    setSubjectId("");
    setSubjectName("");
    setStudyCode("");
    setEnrollmentDate("");
    setStatus("Enrolled");

    setShowEnrollmentModal(false);
  };
  
  const handleDelete = (id) => {
    setEnrollments(
      enrollments.filter(
        (item) => item.id !== id
      )
    );
  };

  const handleStatusChange = (id) => {
    setEnrollments(
      enrollments.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "Screened"
                  ? "Enrolled"
                  : item.status === "Enrolled"
                  ? "Completed"
                  : "Screened"
            }
          : item
      )
    );
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
              alignItems: "center",
              marginBottom: "30px"
            }}
          >
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "700"
              }}
            >
              Enrollment Management
            </h1>

			<button
			  onClick={() => setShowEnrollmentModal(true)}
			  style={{
			    background: "#0d6efd",
			    color: "#fff",
			    border: "none",
			    padding: "14px 28px",
			    borderRadius: "8px",
			    cursor: "pointer",
			    fontWeight: "600"
			  }}
			>
			  Add Enrollment
			</button>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "12px",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.08)"
            }}
          >

            <input
              type="text"
              placeholder="Search Subject..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
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
                  <th>Enrollment Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredEnrollments.map(
                  (enrollment) => (
                    <tr key={enrollment.id}>

                      <td>
                        {enrollment.subjectId}
                      </td>

                      <td>
                        {enrollment.subjectName}
                      </td>

                      <td>
                        {enrollment.study}
                      </td>

                      <td>
                        {enrollment.enrollmentDate}
                      </td>

                      <td>
                        <span
						className={
						  enrollment.status ===
						  "Completed"
						    ? "status-completed"
						    : enrollment.status ===
						      "Enrolled"
						    ? "status-enrolled"
						    : "status-screened"
						}
                        >
                          {enrollment.status}
                        </span>
                      </td>

					  <td>

					    <button
					      onClick={() =>
					        alert(
					          `Subject ID: ${enrollment.subjectId}
					  Subject Name: ${enrollment.subjectName}
					  Study: ${enrollment.study}
					  Status: ${enrollment.status}`
					        )
					      }
					    >
					      View
					    </button>

					    <button
					      onClick={() =>
					        handleStatusChange(
					          enrollment.id
					        )
					      }
					      style={{
					        marginLeft: "8px"
					      }}
					    >
					      Status
					    </button>

					    <button
					      onClick={() =>
					        handleDelete(
					          enrollment.id
					        )
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
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>
	  {showEnrollmentModal && (
	    <div className="modal-overlay">
	      <div className="study-modal">

	        <h2>Add Enrollment</h2>

	        <input
	          type="text"
	          placeholder="Subject ID"
	          value={subjectId}
	          onChange={(e) => setSubjectId(e.target.value)}
	        />

	        <input
	          type="text"
	          placeholder="Subject Name"
	          value={subjectName}
	          onChange={(e) => setSubjectName(e.target.value)}
	        />

	        <button onClick={() => setShowEnrollmentModal(false)}>
	          Cancel
	        </button>
			
			{showEnrollmentModal && (

			  <div className="modal-overlay">

			    <div className="study-modal">

			      <div className="modal-header">

			        <h2>Add Enrollment</h2>

			        <button
			          onClick={() =>
			            setShowEnrollmentModal(false)
			          }
			        >
			          ✕
			        </button>

			      </div>

			      <div className="modal-body">

			        <input
			          type="text"
			          placeholder="Subject ID"
			          value={subjectId}
			          onChange={(e) =>
			            setSubjectId(e.target.value)
			          }
			        />

			        <input
			          type="text"
			          placeholder="Subject Name"
			          value={subjectName}
			          onChange={(e) =>
			            setSubjectName(e.target.value)
			          }
			        />

			        <input
			          type="text"
			          placeholder="Study Code"
			          value={studyCode}
			          onChange={(e) =>
			            setStudyCode(e.target.value)
			          }
			        />

			        <input
			          type="date"
			          value={enrollmentDate}
			          onChange={(e) =>
			            setEnrollmentDate(e.target.value)
			          }
			        />

			        <select
			          value={status}
			          onChange={(e) =>
			            setStatus(e.target.value)
			          }
			        >
			          <option>Screened</option>
			          <option>Enrolled</option>
			          <option>Randomized</option>
			          <option>Completed</option>
			        </select>

			      </div>

			      <div className="modal-footer">

			        <button
			          onClick={() =>
			            setShowEnrollmentModal(false)
			          }
			        >
			          Cancel
			        </button>

			        <button
			          onClick={handleSaveEnrollment}
			        >
			          Save Enrollment
			        </button>

			      </div>

			    </div>

			  </div>

			)}

	      </div>
	    </div>
	  )}

    </div>
  );
}


export default Enrollment;