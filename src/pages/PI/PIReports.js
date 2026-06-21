import React, { useState } from "react";
import {
  FaFileAlt,
  FaCalendarAlt,
  FaBook,
  FaHourglassHalf,
  FaShieldAlt,
  FaDownload,
  FaEye,
} from "react-icons/fa";
import PIKpiCard from "./PIKpiCard";
import {
  getReportsData,
  saveReportsData,
  getNavbarData,
  filterByStudy,
} from "./piDashboardService";

function PIReports({ selectedStudy: studyProp }) {
  const [data, setData] = useState(getReportsData);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [downloadMsg, setDownloadMsg] = useState("");
  const selectedStudy = studyProp || getNavbarData().selectedStudy || "All Studies";

  const persist = (updated) => {
    const saved = saveReportsData(updated);
    setData(saved);
  };

  const filteredReports = filterByStudy(data.reports, selectedStudy);
  const displayReports =
    categoryFilter === "All"
      ? filteredReports
      : filteredReports.filter((r) => r.category === categoryFilter);

  const generatedCount = filteredReports.filter((r) => r.status === "Generated").length;
  const pendingCount = filteredReports.filter((r) => r.status === "Pending").length;

  const dynamicKpis = {
    total: filteredReports.length,
    generated: generatedCount,
    study: filteredReports.filter((r) => r.type === "Study").length,
    pending: pendingCount,
    compliance: filteredReports.filter((r) => r.category === "Compliance").length,
    safety: filteredReports.filter((r) => r.category === "Safety").length,
  };

  const handleGenerateReport = () => {
    const newReport = {
      id: `RPT-${Date.now()}`,
      name: `Report-${new Date().toLocaleDateString()}`,
      category: "Study Progress",
      type: "Study",
      study: selectedStudy === "All Studies" ? "747-303" : selectedStudy,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Pending",
      format: "PDF",
    };
    persist({
      ...data,
      reports: [newReport, ...data.reports],
      kpis: {
        total: (data.kpis.total || 0) + 1,
        pending: (data.kpis.pending || 0) + 1,
        generated: data.kpis.generated || 0,
        study: data.kpis.study || 0,
      },
    });
  };

  const handleDownload = (report) => {
    setDownloadMsg(`Download queued: ${report.name} (${report.format || "PDF"})`);
    setTimeout(() => setDownloadMsg(""), 3000);
  };

  const handleView = (report) => {
    persist({
      ...data,
      reports: data.reports.map((r) =>
        r.id === report.id ? { ...r, status: "Generated" } : r
      ),
      kpis: {
        ...data.kpis,
        generated: data.reports.filter((r) =>
          r.id === report.id ? true : r.status === "Generated"
        ).length + (report.status !== "Generated" ? 1 : 0),
        pending: Math.max(
          0,
          data.reports.filter((r) => r.status === "Pending" && r.id !== report.id).length
        ),
      },
    });
  };

  const categories = ["Enrollment", "Compliance", "Safety", "Study Progress", "Visit", "Regulatory"];

  return (
    <div className="pi-page-content">
      <div className="dashboard-header">
        <div>
          <h2>Reports Dashboard</h2>
          <p className="pi-subtitle">
            Generate and manage study reports
            {selectedStudy !== "All Studies" && ` — ${selectedStudy}`}
          </p>
        </div>
        <div className="dashboard-actions">
          <select className="pi-filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button type="button" className="export-btn" onClick={handleGenerateReport}>
            Generate Report
          </button>
        </div>
      </div>

      {downloadMsg && <div className="pi-toast-info">{downloadMsg}</div>}

      <div className="pi-kpi-grid pi-kpi-grid-4">
        <PIKpiCard title="Total Reports" value={dynamicKpis.total} icon={FaFileAlt} color="blue" clickable onClick={() => setCategoryFilter("All")} />
        <PIKpiCard title="Generated" value={dynamicKpis.generated} icon={FaCalendarAlt} color="green" clickable />
        <PIKpiCard title="Study Reports" value={dynamicKpis.study} icon={FaBook} color="purple" clickable />
        <PIKpiCard title="Pending Reports" value={dynamicKpis.pending} icon={FaHourglassHalf} color="orange" clickable onClick={() => setCategoryFilter("All")} />
        <PIKpiCard title="Compliance Reports" value={dynamicKpis.compliance} icon={FaShieldAlt} color="teal" clickable onClick={() => setCategoryFilter("Compliance")} />
        <PIKpiCard title="Safety Reports" value={dynamicKpis.safety} icon={FaFileAlt} color="red" clickable onClick={() => setCategoryFilter("Safety")} />
      </div>

      <div className="table-container">
        <div className="section-header">
          <h2>Report List</h2>
          <button type="button" className="view-all-btn" onClick={() => setCategoryFilter("All")}>View All</button>
        </div>
        <div className="pi-table-responsive">
          <table className="pi-table">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Study</th>
                <th>Date</th>
                <th>Format</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayReports.map((report) => (
                <tr key={report.id || report.name} className="pi-table-clickable">
                  <td>{report.name}</td>
                  <td>{report.category || report.type}</td>
                  <td>{report.type}</td>
                  <td>{report.study || "—"}</td>
                  <td>{report.date}</td>
                  <td>{report.format || "PDF"}</td>
                  <td>
                    <span className={report.status === "Generated" ? "status-success" : "status-danger"}>
                      {report.status}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="view-all-btn pi-btn-icon" onClick={() => handleView(report)} title="View">
                      <FaEye /> View
                    </button>
                    <button type="button" className="export-btn pi-btn-sm pi-btn-icon" onClick={() => handleDownload(report)} title="Download">
                      <FaDownload /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PIReports;
