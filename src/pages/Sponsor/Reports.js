import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from './AppLayout';
import './Reports.css';
import './SponsorShared.css';
import KpiCard from './KpiCard';
import RequestPermissionButton from '../../Components/common/RequestPermissionButton';
import { FiFileText, FiCheckCircle, FiClock, FiDownload } from 'react-icons/fi';
import { getReports, getReportKPIs } from './data/sponsorDataStore';

const reportTemplates = [
  { title: 'Study Reports', description: 'Study performance and milestone reports', type: 'Study' },
  { title: 'Enrollment Reports', description: 'Enrollment progress across studies', type: 'Enrollment' },
  { title: 'Compliance Reports', description: 'Regulatory and eTMF compliance reports', type: 'Compliance' },
  { title: 'Executive Reports', description: 'Executive level KPIs and portfolio summary', type: 'Executive' },
  { title: 'Operational Reports', description: 'Site, CRO and PI operational performance', type: 'Operations' },
  { title: 'Export Dashboard', description: 'Download dashboard metrics and charts', type: 'Export' },
];

const Reports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState(getReports());
  const [kpis, setKpis] = useState(getReportKPIs());
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const refresh = () => {
      setReports(getReports());
      setKpis(getReportKPIs());
    };
    window.addEventListener('sponsor-data-updated', refresh);
    window.addEventListener('reports-updated', refresh);
    return () => {
      window.removeEventListener('sponsor-data-updated', refresh);
      window.removeEventListener('reports-updated', refresh);
    };
  }, []);

  const filteredReports = reports.filter((report) =>
    statusFilter === 'All' || report.status === statusFilter
  );

  return (
    <AppLayout>
      <div className="reports-page">
        <div className="sponsor-page-header">
          <h1>Reports</h1>
          <p>Generate and access clinical trial reports and analytics.</p>
        </div>

        <div className="sponsor-kpi-grid">
          <KpiCard title="Total Reports" value={kpis.total} subtitle="Available reports" icon={<FiFileText size={24} />} iconBg="#eff6ff" iconColor="#2563eb" onClick={() => setStatusFilter('All')} />
          <KpiCard title="Ready" value={kpis.ready} subtitle="Ready for download" icon={<FiCheckCircle size={24} />} iconBg="#ecfdf5" iconColor="#16a34a" onClick={() => setStatusFilter('Ready')} />
          <KpiCard title="Pending" value={kpis.pending} subtitle="Being generated" icon={<FiClock size={24} />} iconBg="#fef3c7" iconColor="#d97706" onClick={() => setStatusFilter('Pending')} />
          <KpiCard title="Templates" value={reportTemplates.length} subtitle="Report categories" icon={<FiDownload size={24} />} iconBg="#ede9fe" iconColor="#7c3aed" />
        </div>

        <div className="sponsor-toolbar">
          <RequestPermissionButton action="Generate Report" module="Reports" label="+ Generate Report" className="sponsor-btn-primary" />
        </div>

        <div className="reports-grid">
          {reportTemplates.map((report) => (
            <div key={report.title} className="report-card" onClick={() => navigate('/report-details', { state: { reportType: report.title } })} role="button" tabIndex={0}>
              <h3>{report.title}</h3>
              <p>{report.description}</p>
              <button type="button" className="open-report-btn" onClick={(e) => { e.stopPropagation(); navigate('/report-details', { state: { reportType: report.title } }); }}>
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
                  <td colSpan="7" style={{ textAlign: 'center' }}>No data available yet</td>
                </tr>
              ) : filteredReports.map((report) => (
                <tr key={report.id} onClick={() => navigate('/report-details', { state: { report } })}>
                  <td>{report.id}</td>
                  <td>{report.name}</td>
                  <td>{report.type}</td>
                  <td>{report.study}</td>
                  <td>{report.generatedDate}</td>
                  <td><span className={`status-badge ${report.status === 'Ready' ? 'active' : 'planning'}`}>{report.status}</span></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="view-btn" onClick={() => navigate('/report-details', { state: { report } })}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;
