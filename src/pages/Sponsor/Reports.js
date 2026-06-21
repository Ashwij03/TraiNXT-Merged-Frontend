import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from './AppLayout';
import './Reports.css';
import './SponsorShared.css';
import KpiCard from './KpiCard';
import EnterpriseModal from './EnterpriseModal';
import { FiFileText, FiCheckCircle, FiClock, FiDownload } from 'react-icons/fi';
import { getReports, saveReports, getReportKPIs } from './data/sponsorDataStore';

const Reports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState(getReports());
  const [kpis, setKpis] = useState(getReportKPIs());
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Enrollment', study: 'All' });

  useEffect(() => {
    const refresh = () => { setReports(getReports()); setKpis(getReportKPIs()); };
    window.addEventListener('sponsor-data-updated', refresh);
    return () => window.removeEventListener('sponsor-data-updated', refresh);
  }, []);

  const filteredReports = reports.filter((report) =>
    statusFilter === 'All' || report.status === statusFilter
  );

  const handleCreate = () => {
    if (!form.name) return;
    const updated = [...reports, {
      id: `RPT-${Date.now()}`,
      ...form,
      generatedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
    }];
    saveReports(updated);
    setReports(updated);
    setKpis(getReportKPIs());
    setShowCreate(false);
  };

  const reportTemplates = [
    { title: 'Study Reports', description: 'Study performance and milestone reports', type: 'Study' },
    { title: 'Enrollment Reports', description: 'Enrollment progress across studies', type: 'Enrollment' },
    { title: 'Compliance Reports', description: 'Regulatory and eTMF compliance reports', type: 'Compliance' },
    { title: 'Executive Reports', description: 'Executive level KPIs and portfolio summary', type: 'Executive' },
    { title: 'Operational Reports', description: 'Site, CRO and PI operational performance', type: 'Operations' },
    { title: 'Export Dashboard', description: 'Download dashboard metrics and charts', type: 'Export' },
  ];

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
          <button type="button" className="sponsor-btn-primary" onClick={() => setShowCreate(true)}>+ Generate Report</button>
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
              {filteredReports.map((r) => (
                <tr key={r.id} onClick={() => navigate('/report-details', { state: { report: r } })}>
                  <td>{r.id}</td>
                  <td>{r.name}</td>
                  <td>{r.type}</td>
                  <td>{r.study}</td>
                  <td>{r.generatedDate}</td>
                  <td><span className={`status-badge ${r.status === 'Ready' ? 'active' : 'planning'}`}>{r.status}</span></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="view-btn" onClick={() => navigate('/report-details', { state: { report: r } })}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <EnterpriseModal title="Generate Report" onClose={() => setShowCreate(false)} onSave={handleCreate} saveLabel="Generate">
          <input placeholder="Report Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option>Enrollment</option><option>Safety</option><option>CRO</option><option>Operations</option><option>Compliance</option>
          </select>
          <input placeholder="Study (or All)" value={form.study} onChange={(e) => setForm({ ...form, study: e.target.value })} />
        </EnterpriseModal>
      )}
    </AppLayout>
  );
};

export default Reports;
