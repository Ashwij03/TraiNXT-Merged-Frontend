import React, { useState, useEffect } from 'react';
import AppLayout from './AppLayout';
import './StudyOversight.css';
import './SponsorShared.css';
import KpiCard from './KpiCard';
import EnterpriseModal from './EnterpriseModal';
import { FiActivity, FiCheckCircle, FiAlertTriangle, FiClock } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getOversightStudies, getOversightKPIs } from './data/sponsorDataStore';

const StudyOversight = () => {
  const [studies, setStudies] = useState(getOversightStudies());
  const [kpis, setKpis] = useState(getOversightKPIs());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewStudy, setViewStudy] = useState(null);

  useEffect(() => {
    const refresh = () => {
      setStudies(getOversightStudies());
      setKpis(getOversightKPIs());
    };
    window.addEventListener('sponsor-data-updated', refresh);
    return () => window.removeEventListener('sponsor-data-updated', refresh);
  }, []);

  const filteredStudies = studies.filter((study) => {
    const matchesSearch =
      study.studyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.studyId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || study.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const progressData = studies.map(s => ({ study: s.studyId, progress: s.progress }));

  return (
    <AppLayout>
      <div className="page-container">
        <div className="sponsor-page-header">
          <h1>Study Oversight</h1>
          <p>Monitor study progress, milestones, and enrollment targets.</p>
        </div>

        <div className="sponsor-kpi-grid">
          <KpiCard title="Total Studies" value={kpis.total} subtitle="Under oversight" icon={<FiActivity size={24} />} iconBg="#eff6ff" iconColor="#2563eb" onClick={() => setStatusFilter('All')} />
          <KpiCard title="On Track" value={kpis.onTrack} subtitle="Meeting targets" icon={<FiCheckCircle size={24} />} iconBg="#ecfdf5" iconColor="#16a34a" onClick={() => setStatusFilter('On Track')} />
          <KpiCard title="Delayed" value={kpis.delayed} subtitle="Needs attention" icon={<FiAlertTriangle size={24} />} iconBg="#fee2e2" iconColor="#dc2626" onClick={() => setStatusFilter('Delayed')} />
          <KpiCard title="Completed" value={kpis.completed} subtitle="Finished" icon={<FiClock size={24} />} iconBg="#e0e7ff" iconColor="#3730a3" onClick={() => setStatusFilter('Completed')} />
        </div>

        <div className="sponsor-chart-grid">
          <div className="sponsor-chart-card">
            <h3>Study Progress</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="study" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="progress" fill="#082b3d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="oversight-actions sponsor-toolbar">
          <input type="text" placeholder="Search Study..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>On Track</option>
            <option>Delayed</option>
            <option>Completed</option>
          </select>
        </div>

        <div className="sponsor-table-wrap">
          <table className="sponsor-table oversight-table">
            <thead>
              <tr>
                <th>Study ID</th>
                <th>Study Name</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Enrollment</th>
                <th>Milestone</th>
                <th>Next Review</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudies.map((study) => (
                <tr key={study.studyId} onClick={() => setViewStudy(study)}>
                  <td>{study.studyId}</td>
                  <td>{study.studyName}</td>
                  <td><span className={`status-badge ${study.status === 'Delayed' ? 'open' : 'active'}`}>{study.status}</span></td>
                  <td>{study.progress}%</td>
                  <td>{study.enrollment}</td>
                  <td>{study.milestone}</td>
                  <td>{study.nextReview}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="view-btn" onClick={() => setViewStudy(study)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewStudy && (
        <EnterpriseModal title={`Study: ${viewStudy.studyName}`} onClose={() => setViewStudy(null)}>
          <p><strong>ID:</strong> {viewStudy.studyId}</p>
          <p><strong>Status:</strong> {viewStudy.status}</p>
          <p><strong>Progress:</strong> {viewStudy.progress}%</p>
          <p><strong>Enrollment:</strong> {viewStudy.enrollment}</p>
          <p><strong>Current Milestone:</strong> {viewStudy.milestone}</p>
          <p><strong>Next Review:</strong> {viewStudy.nextReview}</p>
        </EnterpriseModal>
      )}
    </AppLayout>
  );
};

export default StudyOversight;
