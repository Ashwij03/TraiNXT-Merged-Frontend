import React, { useState } from "react";
import CROLayout from "./CROLayout";
import { useCROData } from "./CRODATAContext";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import CROModal from "./CROModal";

function CROMonitoring() {
  const { visits, addVisit, updateVisit, deleteVisit, showAlert } = useCROData();

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [editVisit, setEditVisit] = useState(null);
  const [form, setForm] = useState({
    site: "",
    cra: "",
    visitType: "",
    visitDate: "",
    status: "Scheduled",
  });

  const filteredVisits = visits.filter((visit) => {
    const matchesSearch = visit.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || visit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const completedCount = visits.filter((v) => v.status === "Completed").length;
  const pendingCount = visits.filter((v) => v.status === "Pending").length;
  const overdueCount = visits.filter((v) => {
    if (v.status === "Completed") return false;
    return new Date(v.date) < new Date();
  }).length;

  const resetForm = () => {
    setForm({ site: "", cra: "", visitType: "", visitDate: "", status: "Scheduled" });
    setEditVisit(null);
  };

  const handleSave = () => {
    if (editVisit) {
      updateVisit(editVisit.id, {
        site: form.site,
        cra: form.cra,
        visitType: form.visitType,
        date: form.visitDate,
        status: form.status,
      });
      showAlert("Success", "Visit updated successfully.");
    } else {
      addVisit({
        id: `MON-${String(visits.length + 1).padStart(3, "0")}`,
        site: form.site,
        cra: form.cra,
        visitType: form.visitType,
        date: form.visitDate,
        status: "Scheduled",
      });
      showAlert("Success", "Monitoring visit added successfully.");
    }
    setShowModal(false);
    resetForm();
  };

  const openEdit = (visit) => {
    setEditVisit(visit);
    setForm({
      site: visit.site,
      cra: visit.cra,
      visitType: visit.visitType,
      visitDate: visit.date,
      status: visit.status,
    });
    setShowModal(true);
  };

  return (
    <CROLayout>
      <h1>Monitoring</h1>

      <div className="cro-stats-grid">
        <div className="dashboard-card">
          <h3>Total Visits</h3>
          <h1>{visits.length}</h1>
        </div>
        <div className="dashboard-card">
          <h3>Completed</h3>
          <h1>{completedCount}</h1>
        </div>
        <div className="dashboard-card">
          <h3>Pending</h3>
          <h1>{pendingCount}</h1>
        </div>
        <div className="dashboard-card">
          <h3>Overdue</h3>
          <h1>{overdueCount}</h1>
        </div>
      </div>

      <div className="cro-panel">
        <div className="cro-panel-header">
          <div className="cro-panel-filters">
            <input
              type="text"
              placeholder="Search Visit ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cro-input"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="cro-input"
            >
              <option value="All">All</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
            </select>
          </div>
          <h2>Monitoring List</h2>
          <button
            type="button"
            className="cro-btn-primary-inline"
            onClick={() => { resetForm(); setShowModal(true); }}
          >
            + Add Visit
          </button>
        </div>

        {filteredVisits.length === 0 ? (
          <EmptyState title="No Visits Found" />
        ) : (
          <div className="table-scroll-wrap">
            <table className="cro-table">
              <thead>
                <tr>
                  <th>Visit ID</th>
                  <th>Site</th>
                  <th>CRA</th>
                  <th>Visit Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.map((visit) => (
                  <tr key={visit.id}>
                    <td>{visit.id}</td>
                    <td>{visit.site}</td>
                    <td>{visit.cra}</td>
                    <td>{visit.visitType}</td>
                    <td>{visit.date}</td>
                    <td><StatusBadge status={visit.status} /></td>
                    <td>
                      <button type="button" className="cro-btn-primary-inline" onClick={() => openEdit(visit)}>Edit</button>
                      <button
                        type="button"
                        className="cro-btn-danger-inline"
                        onClick={() => {
                          deleteVisit(visit.id);
                          showAlert("Deleted", `Visit ${visit.id} removed.`);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CROModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editVisit ? "Edit Monitoring Visit" : "Add Monitoring Visit"}
        footer={
          <>
            <button type="button" className="cro-btn cro-btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
            <button type="button" className="cro-btn cro-btn-primary" onClick={handleSave}>Save</button>
          </>
        }
      >
        <input className="cro-input" placeholder="Site Name" value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} />
        <input className="cro-input" placeholder="CRA Name" value={form.cra} onChange={(e) => setForm({ ...form, cra: e.target.value })} />
        <select className="cro-input" value={form.visitType} onChange={(e) => setForm({ ...form, visitType: e.target.value })}>
          <option value="">Select Visit Type</option>
          <option value="SIV">SIV</option>
          <option value="IMV">IMV</option>
          <option value="COV">COV</option>
        </select>
        <input type="date" className="cro-input" value={form.visitDate} onChange={(e) => setForm({ ...form, visitDate: e.target.value })} />
        {editVisit && (
          <select className="cro-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Scheduled</option>
            <option>Pending</option>
            <option>Completed</option>
          </select>
        )}
      </CROModal>
    </CROLayout>
  );
}

export default CROMonitoring;
