import React, { useState } from "react";
import CROSidebar from "./Components/CROSidebar";
import CRONavbar from "./Components/CRONavbar";
function Screening() {
  const [search, setSearch] = useState("");

  const [screenings, setScreenings] = useState([
    {
      id: 1,
      subjectId: "SUB001",
      name: "John Doe",
      age: 45,
      gender: "Male",
      screeningDate: "01-Jun-2026",
      status: "Eligible"
    },
    {
      id: 2,
      subjectId: "SUB002",
      name: "David Smith",
      age: 52,
      gender: "Male",
      screeningDate: "03-Jun-2026",
      status: "Pending"
    },
    {
      id: 3,
      subjectId: "SUB003",
      name: "Sarah Wilson",
      age: 39,
      gender: "Female",
      screeningDate: "05-Jun-2026",
      status: "Failed"
    }
	]);

  const filteredScreenings = screenings.filter(
    (item) =>
      item.subjectId.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase())
  );
  
  const handleAddScreening = () => {
    const subjectId = prompt("Enter Subject ID");
    const name = prompt("Enter Subject Name");

    if (!subjectId || !name) return;

    const newScreening = {
      id: Date.now(),
      subjectId,
      name,
      age: 30,
      gender: "Male",
      screeningDate: new Date().toLocaleDateString(),
      status: "Pending"
    };

    setScreenings([
      ...screenings,
      newScreening
    ]);
  };
  
	const handleDelete = (id) => {
	  setScreenings(
	    screenings.filter((item) => item.id !== id)
	  );
	};
	const handleStatusChange = (id) => {
	  setScreenings(
	    screenings.map((item) =>
	      item.id === id
	        ? {
	            ...item,
	            status:
	              item.status === "Pending"
	                ? "Eligible"
	                : item.status === "Eligible"
	                ? "Failed"
	                : "Pending"
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
            <h1>Screening Management</h1>

			<button
			  onClick={handleAddScreening}
			  style={{
			    background: "#0d6efd",
			    color: "#fff",
			    border: "none",
			    padding: "12px 24px",
			    borderRadius: "8px",
			    cursor: "pointer"
			  }}
			>
			  Add Screening
			</button>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
            }}
          >
            <input
              type="text"
              placeholder="Search Screening..."
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
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Screening Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredScreenings.map((item) => (
                  <tr key={item.id}>
                    <td>{item.subjectId}</td>
                    <td>{item.name}</td>
                    <td>{item.age}</td>
                    <td>{item.gender}</td>
                    <td>{item.screeningDate}</td>

                    <td>
                      <span
                        className={
                          item.status === "Eligible"
                            ? "status-enrolled"
                            : item.status === "Pending"
                            ? "status-recruiting"
                            : "status-closeout"
                        }
                      >
                        {item.status}
                      </span>
                    </td>

					<td>
					  <button
					    onClick={() =>
					      alert(
					        `Subject ID: ${item.subjectId}
					Name: ${item.name}
					Age: ${item.age}
					Gender: ${item.gender}
					Status: ${item.status}`
					      )
					    }
					  >
					    View
					  </button>

					  <button
					    onClick={() =>
					      handleStatusChange(item.id)
					    }
					    style={{
					      marginLeft: "8px"
					    }}
					  >
					    Status
					  </button>

					  <button
					    onClick={() =>
					      handleDelete(item.id)
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

export default Screening;