import React from "react";
import CROSidebar from "./CROSidebar";
import CRONavbar from "./CRONavbar";

function Queries() {
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
            <h1>Queries Management</h1>

            <button
              style={{
                padding: "10px 20px",
                background: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "5px"
              }}
            >
              Raise Query
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
              placeholder="Search Query..."
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
                  <th>Query ID</th>
                  <th>Study</th>
                  <th>Site</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Q001</td>
                  <td>ST101</td>
                  <td>Site-01</td>
                  <td>High</td>
                  <td>Open</td>
                  <td><button>View</button></td>
                </tr>

                <tr>
                  <td>Q002</td>
                  <td>ST102</td>
                  <td>Site-02</td>
                  <td>Medium</td>
                  <td>Closed</td>
                  <td><button>View</button></td>
                </tr>
              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Queries;