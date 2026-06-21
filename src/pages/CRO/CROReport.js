import { useState } from "react";
import "./CROOversight.css";
import { downloadCsvReport } from "../../utils/exportReport";

function CROReport() {
  const [reportStatus, setReportStatus] = useState("");

  const generateReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      type: "CRO Oversight Summary",
      format: "csv"
    };

    localStorage.setItem("lastCROReport", JSON.stringify(report));
    setReportStatus("Report generated successfully. Ready for CSV download.");
  };

  const downloadReport = () => {
    const report = JSON.parse(localStorage.getItem("lastCROReport") || "null");

    if (!report) {
      setReportStatus("Generate a report first before downloading.");
      return;
    }

    const rows = [
      ["CRO Oversight Report"],
      ["Generated", report.generatedAt],
      ["Format", "CSV"],
      [],
      ["CRO ID", "Organization", "Studies", "Sites", "Status"]
    ];

    const contracts =
      JSON.parse(localStorage.getItem("croContracts") || "null") || [
        ["CRO-001", "ClinTech Research", 3, 8, "Active"],
        ["CRO-002", "Global CRO Partners", 2, 5, "Active"]
      ];

    contracts.forEach((row) => {
      if (Array.isArray(row)) {
        rows.push(row);
      } else {
        rows.push([
          row.id,
          row.name,
          row.studies,
          row.sites,
          row.status
        ]);
      }
    });

    downloadCsvReport(`cro-oversight-report-${Date.now()}.csv`, rows);
    setReportStatus("Report downloaded as CSV.");
  };

  return (
    <div className="quick-actions">
      <h2>CRO Reports</h2>
      <div className="action-buttons">
        <button type="button" onClick={generateReport}>
          Generate Report
        </button>
        <button type="button" onClick={downloadReport}>
          Download Report (CSV)
        </button>
      </div>
      {reportStatus && <p style={{ marginTop: 16, color: "#374151" }}>{reportStatus}</p>}
    </div>
  );
}

export default CROReport;
