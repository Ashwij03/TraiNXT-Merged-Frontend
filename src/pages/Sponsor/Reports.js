import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import "./Reports.css";
import "./SponsorShared.css";
import KpiCard from "./KpiCard";
import EnterpriseModal from "./EnterpriseModal";
import { FiFileText, FiCheckCircle, FiClock, FiDownload } from "react-icons/fi";
import { getReports, saveReports, getReportKPIs } from "./data/sponsorDataStore";
import { getSponsorDocumentReportCards } from "./data/sponsorDocumentReportService";

const RequestPermissionButton = ({
  action,
  module,
  label,
  className,
  onClick,
}) => {
  const handleClick = () => {
    window.dispatchEvent(
      new CustomEvent("request-permission", {
        detail: {
          action,
          module,
        },
      })
    );

    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      aria-label={label || action}
    >
      {label || action}
    </button>
  );
};

const Reports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState(getReports());
  const [kpis, setKpis] = useState(getReportKPIs());
  const [statusFilter, setStatusFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "Enrollment",
    study: "All",
  });

  const documentReportCards = useMemo(
    () => getSponsorDocumentReportCards(),
    []
  );

  useEffect(() => {
    const refresh = () => {
      setReports(getReports());
      setKpis(getReportKPIs());
    };

    window.addEventListener("sponsor-data-updated", refresh);
    window.addEventListener("reports-updated", refresh);

    return () => {
      window.removeEventListener("sponsor-data-updated", refresh);
      window.removeEventListener("reports-updated", refresh);
    };
  }, []);

  const filteredReports = reports.filter(
    (report) => statusFilter === "All" || report.status === statusFilter
  );

  const handleCreate = () => {
    if (!form.name.trim()) {
      return;
    }

    const updated = [
      ...reports,
      {
        id: `RPT-${Date.now()}`,
        ...form,
        generatedDate: new Date().toISOString().split("T")[0],
        status: "Pending",
      },
    ];

    saveReports(updated);
    setReports(updated);
    setKpis(getReportKPIs());
    setShowCreate(false);
    setForm({
      name: "",
      type: "Enrollment",
      study: "All",
    });
  };

  const reportTemplates = [
    {
      title: "Study Reports",
      description: "Study performance and milestone reports",
      type: "Study",
    },
    {
      title: "Enrollment Reports",
      description: "Enrollment progress across studies",
      type: "Enrollment",
    },
    {
      title: "Compliance Reports",
      description: "Regulatory and eTMF compliance reports",
      type: "Compliance",
    },
    {
      title: "Executive Reports",
      description: "Executive level KPIs and portfolio summary",
      type: "Executive",
    },
    {
      title: "Operational Reports",
      description: "Site, CRO and PI operational performance",
      type: "Operations",
    },
    {
      title: "Export Dashboard",
      description: "Download dashboard metrics and charts",
      type: "Export",
    },
  ];

  const openReport = (reportType) => {
    navigate("/report-details", { state: { reportType } });
  };

  return (
    <AppLayout>
      <div className="reports-page">
        <div className="sponsor-page-header">
          <h1>Reports</h1>
          <p>Generate and access clinical trial reports and analytics.</p>
        </div>

        <div className="sponsor-kpi-grid">
          <KpiCard
            title="Total Reports"
            value={kpis.total}
            subtitle="Available reports"
            icon={<FiFileText size={24} />}
            iconBg="#eff6ff"
            iconColor="#2563eb"
            onClick={() => setStatusFilter("All")}
          />

          <KpiCard
            title="Ready"
            value={kpis.ready}
            subtitle="Ready for download"
            icon={<FiCheckCircle size={24} />}
            iconBg="#ecfdf5"
            iconColor="#16a34a"
            onClick={() => setStatusFilter("Ready")}
          />

          <KpiCard
            title="Pending"
            value={kpis.pending}
            subtitle="Being generated"
            icon={<FiClock size={24} />}
            iconBg="#fef3c7"
            iconColor="#d97706"
            onClick={() => setStatusFilter("Pending")}
          />

          <KpiCard
            title="Templates"
            value={reportTemplates.length + documentReportCards.length}
            subtitle="Report categories"
            icon={<FiDownload size={24} />}
            iconBg="#ede9fe"
            iconColor="#7c3aed"
          />
        </div>

        <div className="sponsor-toolbar">
          <RequestPermissionButton
            action="Generate Report"
            module="Reports"
            label="+ Generate Report"
            className="sponsor-btn-primary"
            onClick={() => setShowCreate(true)}
          />
        </div>

        <h2 className="reports-section-title">Sponsor Document Reports</h2>

        <div className="reports-grid">
          {documentReportCards.map((report) => (
            <div
              key={report.title}
              className="report-card report-card--compliance"
              onClick={() => openReport(report.type)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  openReport(report.type);
                }
              }}
            >
              <h3>{report.title}</h3>
              <p>{report.description}</p>

              <button
                type="button"
                className="open-report-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  openReport(report.type);
                }}
              >
                Open Report
              </button>
            </div>
          ))}
        </div>

        <h2 className="reports-section-title">Standard Reports</h2>

        <div className="reports-grid">
          {reportTemplates.map((report) => (
            <div
              key={report.title}
              className="report-card"
              onClick={() => openReport(report.title)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  openReport(report.title);
                }
              }}
            >
              <h3>{report.title}</h3>
              <p>{report.description}</p>

              <button
                type="button"
                className="open-report-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  openReport(report.title);
                }}
              >
                Open Report
              </button>
            </div>
          ))}
        </div>

        <div className="sponsor-table-wrap" style={{ marginTop: 24 }}>
          <h2>Recent Reports</h2>

          <table className="sponsor-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Study</th>
                <th>Generated</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No data available yet
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() =>
                      navigate("/report-details", { state: { report } })
                    }
                  >
                    <td>{report.id}</td>
                    <td>{report.name}</td>
                    <td>{report.type}</td>
                    <td>{report.study}</td>
                    <td>{report.generatedDate}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          report.status === "Ready" ? "active" : "planning"
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        className="view-btn"
                        onClick={() =>
                          navigate("/report-details", { state: { report } })
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <EnterpriseModal
          title="Generate Report"
          onClose={() => setShowCreate(false)}
          onSave={handleCreate}
          saveLabel="Generate"
        >
          <input
            placeholder="Report Name"
            value={form.name}
            onChange={(event) =>
              setForm({ ...form, name: event.target.value })
            }
          />

          <select
            value={form.type}
            onChange={(event) =>
              setForm({ ...form, type: event.target.value })
            }
          >
            <option>Enrollment</option>
            <option>Safety</option>
            <option>CRO</option>
            <option>Operations</option>
            <option>Compliance</option>
          </select>

          <input
            placeholder="Study (or All)"
            value={form.study}
            onChange={(event) =>
              setForm({ ...form, study: event.target.value })
            }
          />
        </EnterpriseModal>
      )}
    </AppLayout>
  );
};

export default Reports;