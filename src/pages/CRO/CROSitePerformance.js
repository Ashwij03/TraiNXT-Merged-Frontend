import React, { useState } from "react";
import CROLayout from "./CROLayout";
import { useCROData } from "./CRODATAContext";
import CROStatusBadge from "./CROStatusBadge";
import EmptyState from "./EmptyState";
import CROModal from "./CROModal";

function CROSitePerformance() {
  const { sitePerformanceData } = useCROData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedSite, setSelectedSite] = useState(null);

  const filteredSites = sitePerformanceData.filter((site) => {
    const matchesSearch = site.site
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || site.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const excellentCount = sitePerformanceData.filter(
    (s) => s.status === "Excellent"
  ).length;
  const atRiskCount = sitePerformanceData.filter(
    (s) => s.status === "At Risk"
  ).length;
  const avgEnrollment =
    sitePerformanceData.length > 0
      ? Math.round(
          sitePerformanceData.reduce(
            (sum, s) => sum + parseInt(s.enrollment, 10),
            0
          ) / sitePerformanceData.length
        )
      : 0;

  return (
    <CROLayout>
      <h1 style={{ marginBottom: "25px" }}>Site Performance</h1>

      <div className="cro-summary-cards">
        <div className="dashboard-card">
          <h3>Total Sites</h3>
          <h1>{sitePerformanceData.length}</h1>
        </div>
        <div className="dashboard-card">
          <h3>Top Performing</h3>
          <h1>{excellentCount}</h1>
        </div>
        <div className="dashboard-card">
          <h3>Average Enrollment</h3>
          <h1>{avgEnrollment}%</h1>
        </div>
        <div className="dashboard-card">
          <h3>At Risk Sites</h3>
          <h1>{atRiskCount}</h1>
        </div>
      </div>

      <div className="cro-panel">
        <div className="cro-panel-header">
          <div className="cro-panel-filters">
            <input
              type="text"
              placeholder="Search Site..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cro-input"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="cro-input"
            >
              <option value="All">All</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="At Risk">At Risk</option>
            </select>
          </div>
          <h2>Site Performance</h2>
        </div>

        {filteredSites.length === 0 ? (
          <EmptyState title="No Sites Found" />
        ) : (
          <div className="cro-table-wrap">
            <table className="cro-data-table">
              <thead>
                <tr>
                  <th>Site Name</th>
                  <th>Study</th>
                  <th>Enrollment %</th>
                  <th>Screen Failure %</th>
                  <th>Visit Compliance %</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSites.map((site) => (
                  <tr key={site.id}>
                    <td>{site.site}</td>
                    <td>{site.study}</td>
                    <td>{site.enrollment}</td>
                    <td>{site.screenFailure}</td>
                    <td>{site.compliance}</td>
                    <td>
                      <CROStatusBadge status={site.status} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="cro-btn-sm"
                        onClick={() => setSelectedSite(site)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CROModal
        isOpen={Boolean(selectedSite)}
        onClose={() => setSelectedSite(null)}
        title={selectedSite ? `${selectedSite.site} Performance` : "Site Details"}
        footer={
          <button
            type="button"
            className="cro-btn cro-btn-primary"
            onClick={() => setSelectedSite(null)}
          >
            Close
          </button>
        }
      >
        {selectedSite && (
          <div>
            <p><strong>Site ID:</strong> {selectedSite.id}</p>
            <p><strong>Study:</strong> {selectedSite.study}</p>
            <p><strong>Enrollment:</strong> {selectedSite.enrollment}</p>
            <p><strong>Screen Failure:</strong> {selectedSite.screenFailure}</p>
            <p><strong>Visit Compliance:</strong> {selectedSite.compliance}</p>
            <p><strong>Status:</strong> <CROStatusBadge status={selectedSite.status} /></p>
          </div>
        )}
      </CROModal>
    </CROLayout>
  );
}

export default CROSitePerformance;
