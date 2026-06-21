import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from './AppLayout';
import './RiskManagement.css';
import './SponsorShared.css';
import KpiCard from './KpiCard';
import EnterpriseModal from './EnterpriseModal';
import { FiAlertTriangle, FiShield, FiCheckCircle, FiActivity } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getRisks, saveRisks, getRiskKPIs, SEVERITY_COLORS } from './data/sponsorDataStore';

const RiskManagement = () => {
  const navigate = useNavigate();
  const [risks, setRisks] = useState(getRisks());
  const [kpis, setKpis] = useState(getRiskKPIs());
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [form, setForm] = useState({ study: '', title: '', category: 'Enrollment', severity: 'Medium', status: 'Open', owner: '' });

  useEffect(() => {
    const refresh = () => { setRisks(getRisks()); setKpis(getRiskKPIs()); };
    window.addEventListener('sponsor-data-updated', refresh);
    return () => window.removeEventListener('sponsor-data-updated', refresh);
  }, []);

  const filteredRisks = risks.filter((risk) => {
    if (statusFilter === 'Open') return risk.status === 'Open';
    if (statusFilter === 'Resolved') return risk.status === 'Closed' || risk.status === 'Mitigated';
    if (statusFilter === 'Critical/High') return risk.severity === 'Critical' || risk.severity === 'High';
    return true;
  });

  const severityChart = [
    { severity: 'Critical', count: kpis.critical },
    { severity: 'High', count: kpis.high },
    { severity: 'Medium', count: kpis.medium },
    { severity: 'Low', count: kpis.low },
  ].filter(d => d.count > 0);

  const handleCreate = () => {
    if (!form.title || !form.study) return;
    const updated = [...risks, { id: `RISK-${Date.now()}`, ...form }];
    saveRisks(updated);
    setRisks(updated);
    setKpis(getRiskKPIs());
    setShowCreate(false);
  };

  return (
    <AppLayout>
      <div className="risk-page">
        <div className="sponsor-page-header">
          <h1>Risk Management</h1>
          <p>Identify, track, and mitigate clinical trial risks.</p>
        </div>

        <div className="sponsor-kpi-grid">
          <KpiCard title="Total Risks" value={kpis.total} subtitle="Identified risks" icon={<FiShield size={24} />} iconBg="#eff6ff" iconColor="#2563eb" onClick={() => setStatusFilter('All')} />
          <KpiCard title="Critical/High" value={kpis.critical + kpis.high} subtitle="Priority risks" icon={<FiAlertTriangle size={24} />} iconBg="#fee2e2" iconColor="#dc2626" onClick={() => setStatusFilter('Critical/High')} />
          <KpiCard title="Open Risks" value={kpis.open} subtitle="Requiring action" icon={<FiActivity size={24} />} iconBg="#fef3c7" iconColor="#d97706" onClick={() => setStatusFilter('Open')} />
          <KpiCard title="Resolved" value={kpis.resolved} subtitle="Mitigated or closed" icon={<FiCheckCircle size={24} />} iconBg="#ecfdf5" iconColor="#16a34a" onClick={() => setStatusFilter('Resolved')} />
        </div>

        <div className="sponsor-chart-grid">
          <div className="sponsor-chart-card">
            <h3>Risks by Severity</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={severityChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="severity" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#082b3d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="sponsor-toolbar">
          <button type="button" className="sponsor-btn-primary" onClick={() => setShowCreate(true)}>+ Add Risk</button>
        </div>

        <div className="sponsor-table-wrap">
          <h2>Risk Overview</h2>
          <table className="sponsor-table risk-table">
            <thead>
              <tr>
                <th>Risk ID</th>
                <th>Title</th>
                <th>Study</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRisks.map((risk) => (
                <tr key={risk.id} onClick={() => navigate('/risk-details', { state: risk })}>
                  <td>{risk.id}</td>
                  <td>{risk.title}</td>
                  <td>{risk.study}</td>
                  <td>{risk.category}</td>
                  <td><span className="severity-badge" style={{ backgroundColor: SEVERITY_COLORS[risk.severity] }}>{risk.severity}</span></td>
                  <td><span className={`status-badge ${risk.status === 'Open' ? 'open' : 'active'}`}>{risk.status}</span></td>
                  <td>{risk.owner}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="view-btn" onClick={() => navigate('/risk-details', { state: risk })}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <EnterpriseModal title="Add Risk" onClose={() => setShowCreate(false)} onSave={handleCreate} saveLabel="Add">
          <input placeholder="Study ID" value={form.study} onChange={(e) => setForm({ ...form, study: e.target.value })} />
          <input placeholder="Risk Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option>Enrollment</option><option>Protocol</option><option>Regulatory</option><option>Operations</option><option>Data</option>
          </select>
          <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
            <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
          </select>
          <input placeholder="Owner" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
        </EnterpriseModal>
      )}
    </AppLayout>
  );
};

export default RiskManagement;
