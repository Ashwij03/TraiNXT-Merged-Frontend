import React, { useState, useEffect } from 'react';
import AppLayout from './AppLayout';
import { useNavigate } from 'react-router-dom';
import './CROOversight.css';
import './SponsorShared.css';
import KpiCard from './KpiCard';
import EnterpriseModal from './EnterpriseModal';
import { FiLayers, FiActivity, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';
import { getCROs, saveCROs, getCROKPIs } from './data/sponsorDataStore';

const CROOversight = () => {
  const navigate = useNavigate();
  const [cros, setCros] = useState(getCROs());
  const [kpis, setKpis] = useState(getCROKPIs());
  const [viewCro, setViewCro] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', studies: 0, sites: 0, performance: 90, contact: '' });

  useEffect(() => {
    const refresh = () => { setCros(getCROs()); setKpis(getCROKPIs()); };
    window.addEventListener('sponsor-data-updated', refresh);
    return () => window.removeEventListener('sponsor-data-updated', refresh);
  }, []);

  const exportData = () => {
    const csv = 'CRO,Studies,Sites,Performance\n' + cros.map(c => `${c.name},${c.studies},${c.sites},${c.performance}%`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'CRO_Data.csv';
    a.click();
  };

  const handleCreate = () => {
    if (!form.name) return;
    const updated = [...cros, { id: `CRO-${Date.now()}`, ...form, studies: Number(form.studies), sites: Number(form.sites), performance: Number(form.performance), status: 'Active' }];
    saveCROs(updated);
    setCros(updated);
    setKpis(getCROKPIs());
    setShowCreate(false);
  };
  const handleDelete = (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this CRO?"
  );

  if (!confirmDelete) return;

  const updated = cros.filter(
    (cro) => cro.id !== id
  );

  saveCROs(updated);
  setCros(updated);
  setKpis(getCROKPIs());
};

  return (
    <AppLayout>
      <div className="cro-page">
        <div className="sponsor-page-header">
          <h1>CRO Oversight</h1>
          <p>Monitor CRO partner performance and study delivery metrics.</p>
        </div>

        <div className="sponsor-kpi-grid">
          <KpiCard title="Total CROs" value={kpis.total} subtitle="Partners" icon={<FiLayers size={24} />} iconBg="#eff6ff" iconColor="#2563eb" />
          <KpiCard title="Active CROs" value={kpis.active} subtitle="Currently engaged" icon={<FiActivity size={24} />} iconBg="#ecfdf5" iconColor="#16a34a" />
          <KpiCard title="Total Studies" value={kpis.totalStudies} subtitle="Managed by CROs" icon={<FiBarChart2 size={24} />} iconBg="#fef3c7" iconColor="#d97706" />
          <KpiCard title="Avg Performance" value={`${kpis.avgPerformance}%`} subtitle="Across partners" icon={<FiTrendingUp size={24} />} iconBg="#ede9fe" iconColor="#7c3aed" />
        </div>

       

        <div className="sponsor-toolbar">
          <button type="button" className="sponsor-btn-primary" onClick={() => setShowCreate(true)}>+ Add CRO</button>
          <button type="button" className="sponsor-btn-secondary" onClick={exportData}>Export Data</button>
          <button type="button" className="sponsor-btn-secondary" onClick={() => navigate('/cro-report')}>Performance Report</button>
        </div>

        <div className="sponsor-table-wrap">
          <h2>CRO Performance Overview</h2>
          <table className="sponsor-table cro-table">
            <thead>
              <tr>
                <th>CRO Name</th>
                <th>Studies</th>
                <th>Sites</th>
                <th>Performance</th>
                <th>Contact</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cros.map((cro) => (
                <tr key={cro.id} onClick={() => setViewCro(cro)}>
                  <td>{cro.name}</td>
                  <td>{cro.studies}</td>
                  <td>{cro.sites}</td>
                  <td>{cro.performance}%</td>
                  <td>{cro.contact}</td>
                  <td onClick={(e) => e.stopPropagation()}>
  <div className="action-btn-group">

    <button
      type="button"
      className="view-btn"
      onClick={() =>
        navigate('/cro-details', { state: cro })
      }
    >
      View
    </button>

    <button
      type="button"
      className="delete-btn"
      onClick={() => handleDelete(cro.id)}
    >
      Delete
    </button>

  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewCro && (
        <EnterpriseModal title={viewCro.name} onClose={() => setViewCro(null)}>
          <p><strong>Studies:</strong> {viewCro.studies}</p>
          <p><strong>Sites:</strong> {viewCro.sites}</p>
          <p><strong>Performance:</strong> {viewCro.performance}%</p>
          <p><strong>Contact:</strong> {viewCro.contact}</p>
        </EnterpriseModal>
      )}

      {showCreate && (
        <EnterpriseModal title="Add CRO Partner" onClose={() => setShowCreate(false)} onSave={handleCreate} saveLabel="Add">
          <input placeholder="CRO Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="number" placeholder="Studies" value={form.studies} onChange={(e) => setForm({ ...form, studies: e.target.value })} />
          <input type="number" placeholder="Sites" value={form.sites} onChange={(e) => setForm({ ...form, sites: e.target.value })} />
          <input type="number" placeholder="Performance %" value={form.performance} onChange={(e) => setForm({ ...form, performance: e.target.value })} />
          <input placeholder="Contact Person" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
        </EnterpriseModal>
      )}
    </AppLayout>
  );
};

export default CROOversight;
