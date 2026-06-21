import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import CROSidebar from "./CROSidebar";
import CRONavbar from "./CRONavbar";

function MyStudies() {

  const navigate = useNavigate();
  
  const [showModal, setShowModal] = useState(false);
  
  const [search, setSearch] =
    useState("");
	
	const [selectedStudy,
	setSelectedStudy] = useState(null);
	
	const [isEditing, setIsEditing] = useState(false);
	const [editId, setEditId] = useState(null);

  const [studies, setStudies] = useState([
    {
      id: 1,
      name: "OBETICHOLIC ACID (OCA)",
      hospital: "Apollo Hospital",
      enrolled: 1
    },

    {
      id: 2,
      name: "SeptiTest",
      hospital: "Apollo Hospital",
      enrolled: 8
    }
  ]);

  const [newStudy, setNewStudy] = useState({
    name: "",
    protocol: "",
    sponsor: "",
    hospital: "",
    pi: "",
    targetEnrollment: "",
    enrolled: "",
    status: "Active"
  });

  const deleteStudy = (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this study?"
      );

    if (!confirmDelete) return;

    setStudies(
      studies.filter(
        (study) => study.id !== id
      )
    );
  };
  
  const saveStudy = () => {
	
	if (isEditing) {

	  const updatedStudies =
	    studies.map((study) =>
	      study.id === editId
	        ? {
	            ...study,
	            ...newStudy
	          }
	        : study
	    );

	  setStudies(updatedStudies);

	  setShowModal(false);
	  setIsEditing(false);
	  setEditId(null);
	  setIsEditing(false);
	  setEditId(null);

	  return;
	}

    const study = {
      id: Date.now(),

      name: newStudy.name,
      protocol: newStudy.protocol,
      sponsor: newStudy.sponsor,
      hospital: newStudy.hospital,
      pi: newStudy.pi,
      targetEnrollment: newStudy.targetEnrollment,
      enrolled: Number(newStudy.enrolled),
      status: newStudy.status
    };

    setStudies([...studies, study]);

    setShowModal(false);

    setNewStudy({
      name: "",
      protocol: "",
      sponsor: "",
      hospital: "",
      pi: "",
      targetEnrollment: "",
      enrolled: "",
      status: "Active"
    });
  };
  return (
 
	<div className="dashboard-layout">

	  <CROSidebar />

	  <div className="main-content">

	    <CRONavbar />
		<div style={{ padding: "40px" }}>
		<h1
		  style={{
		    fontSize: "48px",
		    fontWeight: "700",
		    marginBottom: "10px"
		  }}
		>
		  My Studies
		</h1>

		<p
		  style={{
		    color: "#666",
		    fontSize: "18px",
		    marginBottom: "30px"
		  }}
		>
		  Manage clinical studies and open study dashboards.
		</p>
		
		<div
		  style={{
		    display: "grid",
		    gridTemplateColumns: "repeat(4,1fr)",
		    gap: "20px",
		    marginBottom: "30px"
		  }}
		>

		  <div className="stat-card">
		  <h2>{studies.length}</h2>
		  <p>Total Studies</p>
		  </div>

		  <div className="stat-card">
		  <h2>
		    {
		      studies.filter(
		        (study) =>
		          study.status === "Active"
		      ).length
		    }
		  </h2>

		  <p>Active Studies</p>
		  </div>

		  <div className="stat-card">
		  <h2>
		    {
		      new Set(
		        studies.map(
		          (study) =>
		            study.hospital
		        )
		      ).size
		    }
		  </h2>

		  <p>Sites</p>
		  </div>

		  <div className="stat-card">
			  
			  <h2>
			    {
			      studies.reduce(
			        (total, study) =>
			          total +
			          Number(
			            study.enrolled || 0
			          ),
			        0
			      )
			    }
			  </h2>

			  <p>Total Enrollment</p>
		  </div>

		</div>
		
		<div
		  style={{
		    display: "flex",
		    justifyContent: "space-between",
		    alignItems: "center",
		    marginBottom: "30px"
		  }}
		>
		
		<input
		  type="text"
		  placeholder="Search Study..."
		  value={search}
		  onChange={(e) =>
		    setSearch(e.target.value)
		  }
		  style={{
		    width: "300px",
		    padding: "12px",
		    borderRadius: "8px",
		    border: "1px solid #ccc"
		  }}
		/>
		
		<button
		  onClick={() =>
		    setShowModal(true)
		  }
		  style={{
		    background: "#1677ff",
		    color: "#fff",
		    border: "none",
		    padding: "14px 25px",
		    borderRadius: "10px",
		    cursor: "pointer"
		  }}
		>
		  + Add Study
		</button>
		</div>
		
		<div
		  style={{
		    display: "flex",
		    gap: "25px",
		    flexWrap: "wrap"
		  }}
		>
		{studies
		  .filter((study) =>
		    study.name
		      .toLowerCase()
		      .includes(search.toLowerCase())
		  )
		  .map((study) => (

		<div
		  key={study.id}

		  onClick={() =>
		    navigate(
		      `/study-dashboard/${study.id}`
		    )
		  }

		  style={{
		    width: "280px",
		    background: "#fff",
		    borderRadius: "15px",
		    overflow: "hidden",
		    cursor: "pointer",
		    boxShadow:
		      "0 2px 10px rgba(0,0,0,0.08)"
		  }}
		>
		<div
		  style={{
		    height: "160px",
		    background: "#eee",
		    display: "flex",
		    alignItems: "center",
		    justifyContent: "center"
		  }}
		>
		<div
		  style={{
		    position: "absolute",
		    top: "10px",
		    right: "10px",
		    background: "#22c55e",
		    color: "white",
		    padding: "5px 10px",
		    borderRadius: "20px"
		  }}
		>
		  Active
		</div>
		</div>
		<div
		  style={{
		    padding: "20px"
		  }}
		>
		
		<h3>{study.name}</h3>

		<p>
		  Protocol: {study.protocol}
		</p>

		<p>
		  Sponsor: {study.sponsor}
		</p>

		<p>
		  Site: {study.hospital}
		</p>

		<p style={{ marginTop: "8px", fontWeight: "600" }}>
		  Status: {study.status}
		</p>
		
		<div
		  style={{
		    marginTop: "10px"
		  }}
		>
		  <b>
		    {study.enrolled}/
		    {study.targetEnrollment}
		    Enrolled
		  </b>

		  <div
		    style={{
		      width: "100%",
		      height: "8px",
		      background: "#e5e7eb",
		      borderRadius: "10px",
		      marginTop: "8px"
		    }}
		  >

		    <div
		      style={{
		        width: `${
		          (study.enrolled /
		            study.targetEnrollment) *
		          100
		        }%`,
		        height: "100%",
		        background: "#22c55e",
		        borderRadius: "10px"
		      }}
		    />

		  </div>

		  <small>
		    {Math.round(
		      (study.enrolled /
		        study.targetEnrollment) *
		        100
		    )}
		    % Completed
		  </small>
		</div>
		
		<div
		  style={{
		    display: "flex",
		    gap: "10px",
		    marginTop: "15px"
		  }}
		>

		<button
		  onClick={(e) => {
		    e.stopPropagation();
		    setSelectedStudy(study);
		  }}
		>
		  👁 View
		</button>
		
		<button
		  onClick={(e) => {
		    e.stopPropagation();

		    setIsEditing(true);
		    setEditId(study.id);

		    setNewStudy({
		      name: study.name,
		      protocol: study.protocol,
		      sponsor: study.sponsor,
		      hospital: study.hospital,
		      pi: study.pi,
		      targetEnrollment: study.targetEnrollment,
		      enrolled: study.enrolled,
		      status: study.status
		    });

		    setShowModal(true);
		  }}
		>
		  ✏ Edit
		</button>

		  <button
		    onClick={(e) => {
		      e.stopPropagation();
		      deleteStudy(study.id);
		    }}
		  >
		    🗑 Delete
		  </button>

		</div>
		</div>
		</div>
		))}
		
		{showModal && (

		  <div
		    style={{
		      position: "fixed",
		      top: 0,
		      left: 0,
		      right: 0,
		      bottom: 0,
		      background: "rgba(0,0,0,0.5)",
		      display: "flex",
		      justifyContent: "center",
		      alignItems: "center"
		    }}
		  >

		    <div
		      style={{
		        background: "#fff",
		        padding: "30px",
		        borderRadius: "12px",
		        width: "400px"
		      }}
		    >

			<h2>
			  {isEditing ? "Edit Study" : "Add Study"}
			</h2>

			  <input
			    placeholder="Study Name"
			    value={newStudy.name}
			    onChange={(e) =>
			      setNewStudy({
			        ...newStudy,
			        name: e.target.value
			      })
			    }
			    style={{
			      width: "100%",
			      padding: "10px",
			      marginBottom: "10px"
			    }}
			  />

			  <input
			    placeholder="Protocol Number"
			    value={newStudy.protocol}
			    onChange={(e) =>
			      setNewStudy({
			        ...newStudy,
			        protocol: e.target.value
			      })
			    }
			  />
			  
			  <input
			    placeholder="Sponsor"
			    value={newStudy.sponsor}
			    onChange={(e) =>
			      setNewStudy({
			        ...newStudy,
			        sponsor: e.target.value
			      })
			    }
			  />
			  
			  <input
			    placeholder="Hospital / Site"
			    value={newStudy.hospital}
			    onChange={(e) =>
			      setNewStudy({
			        ...newStudy,
			        hospital: e.target.value
			      })
			    }
			    style={{
			      width: "100%",
			      padding: "10px",
			      marginBottom: "10px"
			    }}
			  />

			  <input
			    placeholder="Principal Investigator"
			    value={newStudy.pi}
			    onChange={(e) =>
			      setNewStudy({
			        ...newStudy,
			        pi: e.target.value
			      })
			    }
			    style={{
			      width: "100%",
			      padding: "10px",
			      marginBottom: "10px"
			    }}
			  />

			  <input
			    type="number"
			    placeholder="Target Enrollment"
			    value={newStudy.targetEnrollment}
			    onChange={(e) =>
			      setNewStudy({
			        ...newStudy,
			        targetEnrollment: e.target.value
			      })
			    }
			    style={{
			      width: "100%",
			      padding: "10px",
			      marginBottom: "10px"
			    }}
			  />
			  
			  <input
			    type="number"
			    placeholder="Current Enrollment"
			    value={newStudy.enrolled}
			    onChange={(e) =>
			      setNewStudy({
			        ...newStudy,
			        enrolled: e.target.value
			      })
			    }
			    style={{
			      width: "100%",
			      padding: "10px",
			      marginBottom: "10px"
			    }}
			  />

			  <select
			    value={newStudy.status}
			    onChange={(e) =>
			      setNewStudy({
			        ...newStudy,
			        status: e.target.value
			      })
			    }
			  >
			    <option>Active</option>
			    <option>Planning</option>
			    <option>Completed</option>
			    <option>Closed</option>
			  </select>
			  
			  <div
			    style={{
			      marginTop: "20px",
			      display: "flex",
			      gap: "10px"
			    }}
			  >
			    <button onClick={saveStudy}>
			      Save Study
			    </button>

			    <button
			      onClick={() => setShowModal(false)}
			    >
			      Cancel
			    </button>
			  </div>
					
			      </div>
			    </div>
			  )}

			  {selectedStudy && (
			    <div className="modal-overlay">
			      <div className="modal-content">

			        <h2>{selectedStudy.name}</h2>

			        <p>Protocol: {selectedStudy.protocol}</p>
			        <p>Sponsor: {selectedStudy.sponsor}</p>
			        <p>Site: {selectedStudy.hospital}</p>
			        <p>PI: {selectedStudy.pi}</p>
			        <p>Status: {selectedStudy.status}</p>

			        <button
			          onClick={() =>
			            setSelectedStudy(null)
			          }
			        >
			          Close
			        </button>

			      </div>
			    </div>
			  )}

		    </div>

		  </div>

		</div>
		</div>
		);
	}
export default MyStudies;