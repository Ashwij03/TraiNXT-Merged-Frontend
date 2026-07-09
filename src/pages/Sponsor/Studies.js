import { useState, useEffect } from 'react';
import './Studies.css';
import './SponsorShared.css';
import AppLayout from './AppLayout';
import { useNavigate } from 'react-router-dom';
import KpiCard from './KpiCard';
import { MdMenuBook, MdMonitorHeart, MdGroups, MdLocalHospital } from 'react-icons/md';
import EnterpriseModal from './EnterpriseModal';
import { getPortfolioStudies, getPortfolioKPIs } from './data/sponsorDataStore';
import { createStudy } from '../../services/studyService';

const Studies = () => {
  const navigate = useNavigate();
  const [studies, setStudies] = useState(getPortfolioStudies());
  const [kpis, setKpis] = useState(getPortfolioKPIs());
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [phaseFilter, setPhaseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStudy, setNewStudy] = useState({
    studyId: '',
    studyName: '',
    phase: 'Phase II',
    therapeuticArea: '',
    cro: '',
    sites: '',
    enrolled: 0,
    target: '',
    status: 'Planning',
    startDate: '',
  });

  useEffect(() => {
    const refresh = () => {
      setStudies(getPortfolioStudies());
      setKpis(getPortfolioKPIs());
    };
    window.addEventListener('sponsor-data-updated', refresh);
    return () => window.removeEventListener('sponsor-data-updated', refresh);
  }, []);

  const filteredStudies = studies.filter((study) => {
    const q = search.toLowerCase();
    const matchesSearch =
      study.studyName.toLowerCase().includes(q) ||
      study.studyId.toLowerCase().includes(q);
    const matchesPhase = !phaseFilter || study.phase === phaseFilter;
    const matchesStatus = !statusFilter || study.status === statusFilter;
    return matchesSearch && matchesPhase && matchesStatus;
  });

  const handleCreateStudy = () => {
    if (!newStudy.studyId || !newStudy.studyName) return;

    try {
      createStudy({
        code: newStudy.studyId,
        name: newStudy.studyName,
        phase: newStudy.phase,
        status: newStudy.status,
        cro: newStudy.cro,
        sites: Number(newStudy.sites) || 0,
        indication: newStudy.therapeuticArea,
        startDate: newStudy.startDate,
        enrolled: Number(newStudy.enrolled) || 0,
        targetSubjects: Number(newStudy.target) || 0,
      });
    } catch (err) {
      alert(err.message || 'Unable to create study.');
      return;
    }

    setStudies(getPortfolioStudies());
    setKpis(getPortfolioKPIs());
    setShowCreateModal(false);
    setNewStudy({
      studyId: '',
      studyName: '',
      phase: 'Phase II',
      therapeuticArea: '',
      cro: '',
      sites: '',
      enrolled: 0,
      target: '',
      status: 'Planning',
      startDate: '',
    });
  };

  const totalEnrolled = studies.reduce((s, st) => s + (st.enrolled || 0), 0);
  const totalSites = studies.reduce((s, st) => s + (st.sites || 0), 0);

  return (
    <AppLayout>
      <div className="studies-page">
        <div className="sponsor-page-header">
          <h1>Studies</h1>
          <p>Manage and monitor your clinical trial studies portfolio.</p>
        </div>

        <div className="sponsor-kpi-grid">
          <KpiCard
            title="Total Studies"
            value={kpis.total}
            subtitle="In portfolio"
            icon={<MdMenuBook size={24} />}
            iconBg="#eff6ff"
            iconColor="#2563eb"
          />
          <KpiCard
            title="Active"
            value={kpis.active + kpis.recruiting}
            subtitle="Running studies"
            icon={<MdMonitorHeart size={24} />}
            iconBg="#ecfdf5"
            iconColor="#16a34a"
          />
          <KpiCard
            title="Total Enrolled"
            value={totalEnrolled.toLocaleString()}
            subtitle="Across all studies"
            icon={<MdGroups size={24} />}
            iconBg="#ede9fe"
            iconColor="#7c3aed"
          />
          <KpiCard
            title="Total Sites"
            value={totalSites}
            subtitle="Participating sites"
            icon={<MdLocalHospital size={24} />}
            iconBg="#fef3c7"
            iconColor="#d97706"
          />
        </div>

        <div className="studies-toolbar sponsor-toolbar">
          <input
            type="text"
            placeholder="Search by Study ID, Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" className="sponsor-btn-secondary" onClick={() => setShowFilters(true)}>
            Filters
          </button>
          <button type="button" className="sponsor-btn-primary create-study-btn" onClick={() => setShowCreateModal(true)}>
            + Create Study
          </button>
        </div>

        <div className="study-grid">
          {filteredStudies.map((study) => (
            <div
              key={study.studyId}
              className="study-card"
              onClick={() => navigate(`/study/${study.studyId}`)}
              role="button"
              tabIndex={0}
            >
              <div className="study-card-header">
                <h3>{study.studyName}</h3>
                <span className={`status-badge ${study.status.toLowerCase()}`}>{study.status}</span>
              </div>
              <div className="study-info">
                <p><strong>ID:</strong> {study.studyId}</p>
                <p><strong>Phase:</strong> {study.phase}</p>
                <p><strong>CRO:</strong> {study.cro}</p>
                <p><strong>Sites:</strong> {study.sites}</p>
                <p><strong>Enrollment:</strong> {study.enrolled} / {study.target}</p>
              </div>
              <div className="study-card-actions">
                <button
                  type="button"
                  className="view-btn"
                  onClick={(e) => { e.stopPropagation(); navigate(`/study/${study.studyId}`); }}
                >
                  View
                </button>
                <button
                  type="button"
                  className="edit-btn"
                  onClick={(e) => { e.stopPropagation(); navigate('/study-oversight'); }}
                >
                  Oversight
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCreateModal && (
        <EnterpriseModal
          title="Create Study"
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateStudy}
          saveLabel="Create"
        >
          <input placeholder="Study ID" value={newStudy.studyId} onChange={(e) => setNewStudy({ ...newStudy, studyId: e.target.value })} />
          <input placeholder="Study Name" value={newStudy.studyName} onChange={(e) => setNewStudy({ ...newStudy, studyName: e.target.value })} />
          <select value={newStudy.phase} onChange={(e) => setNewStudy({ ...newStudy, phase: e.target.value })}>
            <option>Phase I</option>
            <option>Phase II</option>
            <option>Phase III</option>
            <option>Phase IV</option>
          </select>
          <input placeholder="Therapeutic Area" value={newStudy.therapeuticArea} onChange={(e) => setNewStudy({ ...newStudy, therapeuticArea: e.target.value })} />
          <input placeholder="CRO" value={newStudy.cro} onChange={(e) => setNewStudy({ ...newStudy, cro: e.target.value })} />
          <input type="number" placeholder="Sites" value={newStudy.sites} onChange={(e) => setNewStudy({ ...newStudy, sites: e.target.value })} />
          <input type="number" placeholder="Enrollment Target" value={newStudy.target} onChange={(e) => setNewStudy({ ...newStudy, target: e.target.value })} />
          <select value={newStudy.status} onChange={(e) => setNewStudy({ ...newStudy, status: e.target.value })}>
            <option>Planning</option>
            <option>Recruiting</option>
            <option>Active</option>
            <option>Completed</option>
          </select>
          <input type="date" value={newStudy.startDate} onChange={(e) => setNewStudy({ ...newStudy, startDate: e.target.value })} />
        </EnterpriseModal>
      )}

      {showFilters && (
        <EnterpriseModal title="Filters" onClose={() => setShowFilters(false)} onSave={() => setShowFilters(false)} saveLabel="Apply">
          <select value={phaseFilter} onChange={(e) => setPhaseFilter(e.target.value)}>
            <option value="">All Phases</option>
            <option value="Phase I">Phase I</option>
            <option value="Phase II">Phase II</option>
            <option value="Phase III">Phase III</option>
            <option value="Phase IV">Phase IV</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Recruiting">Recruiting</option>
            <option value="Planning">Planning</option>
            <option value="Completed">Completed</option>
          </select>
        </EnterpriseModal>
      )}
    </AppLayout>
  );
};

export default Studies;