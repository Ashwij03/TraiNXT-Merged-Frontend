import React, { useState } from "react";
import CROLayout from "./CROLayout";
import { useCROData } from "./CRODATAContext";
import CROStatusBadge from "./CROStatusBadge";
import EmptyState from "./EmptyState";
import { downloadCsvReport } from "../../utils/exportReport";

function CROReports() {
  const { reports, showModal } = useCROData();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReports = reports.filter((report) =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewReport = (report) => {
    showModal({
      title: "Report Details",
      message: `ID: ${report.id}\nName: ${report.name}\nType: ${report.type}\nStatus: ${report.status}`,
    });
  };

  const handleDownloadReport = (report) => {
    const rows = [
      ["Report ID", report.id],
      ["Report Name", report.name],
      ["Type", report.type],
      ["Generated On", report.generatedOn],
      ["Status", report.status],
    ];

    downloadCsvReport(
      `${report.name.replace(/\s+/g, "-")}-${Date.now()}.csv`,
      rows
    );
  };

  return (
    <CROLayout>
      <h1 style={{ marginBottom: "25px" }}>Reports</h1>

      <div className="cro-summary-cards">
        <div className="dashboard-card">
          <h3>Total Reports</h3>
          <h1>{reports.length}</h1>
        </div>
        <div className="dashboard-card">
          <h3>Generated</h3>
          <h1>{reports.filter((r) => r.status === "Generated").length}</h1>
        </div>
        <div className="dashboard-card">
          <h3>Pending</h3>
          <h1>{reports.filter((r) => r.status === "Pending").length}</h1>
        </div>
        <div className="dashboard-card">
          <h3>This Month</h3>
          <h1>{reports.length}</h1>
        </div>
      </div>

      <div className="cro-panel">
        <div className="cro-panel-header">
          <input
            type="text"
            placeholder="Search Report..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="cro-input"
          />
        </div>

        {filteredReports.length === 0 ? (
          <EmptyState title="No Reports Found" />
        ) : (
          <div className="cro-table-wrap">
            <table className="cro-data-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Report Name</th>
                  <th>Type</th>
                  <th>Generated On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.id}</td>
                    <td>{report.name}</td>
                    <td>{report.type}</td>
                    <td>{report.generatedOn}</td>
                    <td>
                      <CROStatusBadge status={report.status} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="cro-btn-sm"
                        onClick={() => handleViewReport(report)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="cro-btn-sm"
                        onClick={() => handleDownloadReport(report)}
                        style={{ marginLeft: 8 }}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CROLayout>
  );
}

export default CROReports;