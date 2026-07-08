import React, { useState, useEffect } from "react";
import CROSidebar from "./Components/CROSidebar";
import CRONavbar from "./Components/CRONavbar";
import RequestPermissionButton from "../../Components/common/RequestPermissionButton";
import { getSitePerformance } from "../../services/adminService";

function loadSites() {
  try {
    const fromAdmin = getSitePerformance();
    if (fromAdmin.length) return fromAdmin;
    const saved = localStorage.getItem("sitePerformance");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function SitePerformance() {
  const [search, setSearch] = useState("");
  const [sites, setSites] = useState(loadSites);

  useEffect(() => {
    const refresh = () => setSites(loadSites());
    window.addEventListener("sponsor-data-updated", refresh);
    window.addEventListener("studies-updated", refresh);
    return () => {
      window.removeEventListener("sponsor-data-updated", refresh);
      window.removeEventListener("studies-updated", refresh);
    };
  }, []);

  const filteredSites = sites.filter((site) =>
    String(site.siteName || site.site || site.name || "")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

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
              marginBottom: "20px",
            }}
          >
            <h1>Site Performance</h1>
            <RequestPermissionButton
              action="Add Site"
              module="Site Performance"
              label="+ Add Site"
            />
          </div>

          <input
            type="text"
            placeholder="Search Site..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "350px",
              padding: "12px",
              marginBottom: "20px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          />

          {filteredSites.length === 0 ? (
            <p>No data available yet</p>
          ) : (
            <table width="100%" border="1" cellPadding="10">
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Enrollment</th>
                  <th>Queries</th>
                  <th>Compliance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSites.map((site) => (
                  <tr key={site.id || site.siteName || site.site}>
                    <td>{site.siteName || site.site || site.name}</td>
                    <td>{site.enrollment ?? "—"}</td>
                    <td>{site.queries ?? "—"}</td>
                    <td>{site.compliance ?? "—"}</td>
                    <td>{site.status ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default SitePerformance;
