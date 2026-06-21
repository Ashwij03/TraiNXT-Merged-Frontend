import React, { useState, useEffect } from "react";
import CROSidebar from "./Components/CROSidebar";
import CRONavbar from "./Components/CRONavbar";

function SitePerformance() {

	const [search, setSearch] = useState("");

	const [sites, setSites] = useState(() => {
	  const savedSites =
	    localStorage.getItem("sitePerformance");

	  return savedSites
	    ? JSON.parse(savedSites)
	    : [
	        {
	          id: 1,
	          site: "Apollo Hospital",
	          enrollment: 40,
	          queries: 5,
	          compliance: "98%",
	          status: "Excellent"
	        },
	        {
	          id: 2,
	          site: "Yashoda Hospital",
	          enrollment: 32,
	          queries: 8,
	          compliance: "94%",
	          status: "Good"
	        },
	        {
	          id: 3,
	          site: "AIG Hospital",
	          enrollment: 28,
	          queries: 3,
	          compliance: "96%",
	          status: "Excellent"
	        }
	      ];
	});
	
	useEffect(() => {
	  localStorage.setItem(
	    "sitePerformance",
	    JSON.stringify(sites)
	  );
	}, [sites]);

	const filteredSites = sites.filter((site) =>
	  site.site.toLowerCase().includes(
	    search.toLowerCase()
	  )
	);

	const handleAddSite = () => {
	  const siteName =
	    prompt("Enter Site Name");

	  if (!siteName) return;

	  const newSite = {
	    id: Date.now(),
	    site: siteName,
	    enrollment: 0,
	    queries: 0,
	    compliance: "90%",
	    status: "Good"
	  };

	  setSites([...sites, newSite]);
	};

	const handleDelete = (id) => {
	  setSites(
	    sites.filter((site) => site.id !== id)
	  );
	};

	const handleStatusChange = (id) => {
	  setSites(
	    sites.map((site) =>
	      site.id === id
	        ? {
	            ...site,
	            status:
	              site.status === "Excellent"
	                ? "Good"
	                : site.status === "Good"
	                ? "Needs Attention"
	                : "Excellent"
	          }
	        : site
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
	          <h1>Site Performance Management</h1>

	          <button
	            onClick={handleAddSite}
	            style={{
	              background: "#0d6efd",
	              color: "#fff",
	              border: "none",
	              padding: "12px 24px",
	              borderRadius: "8px",
	              cursor: "pointer"
	            }}
	          >
	            Add Site
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
	            placeholder="Search Site..."
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
	                <th>Site Name</th>
	                <th>Enrollment</th>
	                <th>Open Queries</th>
	                <th>Compliance</th>
	                <th>Status</th>
	                <th>Action</th>
	              </tr>
	            </thead>

	            <tbody>

	              {filteredSites.map((site) => (
	                <tr key={site.id}>

	                  <td>{site.site}</td>

	                  <td>{site.enrollment}</td>

	                  <td>{site.queries}</td>

	                  <td>{site.compliance}</td>

	                  <td>{site.status}</td>

	                  <td>

	                    <button
	                      onClick={() =>
	                        alert(
	                          `Site: ${site.site}
	Enrollment: ${site.enrollment}
	Queries: ${site.queries}
	Compliance: ${site.compliance}`
	                        )
	                      }
	                    >
	                      View
	                    </button>

	                    <button
	                      onClick={() =>
	                        handleStatusChange(
	                          site.id
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
	                          site.id
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
	              ))}

	            </tbody>

	          </table>

	        </div>

	      </div>

	    </div>

	  </div>
	);
	
 
}

export default SitePerformance;