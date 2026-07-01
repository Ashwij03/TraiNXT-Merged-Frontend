import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import CROLayout from "./CROLayout";
import { useCROData } from "./CRODATAContext";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import CROModal from "./CROModal";

function CROSubjectManagement() {
  const location = useLocation();
  const {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    showAlert,
  } = useCROData();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    study: "OCA",
    site: "Apollo",
    status: "Active",
    visit: "Screening",
  });

  React.useEffect(() => {
    if (location.state?.selectedData && location.state?.selectedType === "Subject") {
      setSelectedSubject(location.state.selectedData);
      setShowDetailModal(true);
    } else if (location.state?.subjectId) {
      const subject = subjects.find((s) => s.id === location.state.subjectId);
      if (subject) {
        setSelectedSubject(subject);
        setForm({
          study: subject.study,
          site: subject.site,
          status: subject.status,
          visit: subject.visit,
        });
        setShowDetailModal(true);
      }
    }
  }, [location.state, subjects]);

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = subject.id
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || subject.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = subjects.filter((s) => s.status === "Active").length;
  const completedCount = subjects.filter((s) => s.status === "Completed").length;
  const withdrawnCount = subjects.filter((s) => s.status === "Withdrawn").length;

  const handleAddSubject = () => {
    const newSubject = {
      id: `SUB-${String(subjects.length + 1).padStart(3, "0")}`,
      study: form.study,
      site: form.site,
      status: form.status,
      enrollment: new Date().toLocaleDateString("en-GB"),
      visit: form.visit,
    };
    addSubject(newSubject);
    setShowAddModal(false);
    setForm({ study: "OCA", site: "Apollo", status: "Active", visit: "Screening" });
    showAlert("Success", `Subject ${newSubject.id} added successfully.`);
  };

  const handleSaveEdit = () => {
    if (!selectedSubject) return;
    updateSubject(selectedSubject.id, form);
    setSelectedSubject({ ...selectedSubject, ...form });
    setEditMode(false);
    showAlert("Success", "Subject updated successfully.");
  };

  const handleDelete = (id) => {
    deleteSubject(id);
    setShowDetailModal(false);
    setSelectedSubject(null);
    showAlert("Deleted", `Subject ${id} has been removed.`);
  };

  const openDetail = (subject) => {
    setSelectedSubject(subject);
    setForm({
      study: subject.study,
      site: subject.site,
      status: subject.status,
      visit: subject.visit,
    });
    setEditMode(false);
    setShowDetailModal(true);
  };

  return (
    <CROLayout>
      <div className="cro-subject-page"></div>
      <h1>Subject Management</h1>

      <div className="cro-stats-grid">
        <div className="cro-card">
          <h3>Total Subjects</h3>
          <h2>{subjects.length}</h2>
        </div>
        <div className="cro-card">
          <h3>Active Subjects</h3>
          <h2>{activeCount}</h2>
        </div>
        <div className="cro-card">
          <h3>Completed</h3>
          <h2>{completedCount}</h2>
        </div>
        <div className="cro-card">
          <h3>Withdrawn</h3>
          <h2>{withdrawnCount}</h2>
        </div>
      </div>

      <div className="cro-panel">

  <h2 className="cro-section-title">Subjects List</h2>

  <div className="cro-panel-header">

    <div className="cro-panel-filters">

      <input
        type="text"
        placeholder="Search Subject ID..."
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
        <option value="Active">Active</option>
        <option value="Completed">Completed</option>
        <option value="Withdrawn">Withdrawn</option>
        <option value="Screening">Screening</option>
      </select>

    </div>

  </div>

        {filteredSubjects.length === 0 ? (
          <EmptyState title="No Subjects Found" message="Add a subject to get started." />
        ) : (
          <div className="table-scroll-wrap">
            <table className="cro-table">
              <thead>
                <tr>
                  <th>Subject ID</th>
                  <th>Study</th>
                  <th>Site</th>
                  <th>Status</th>
                  <th>Enrollment Date</th>
                  <th>Current Visit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.study}</td>
                    <td>{item.site}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>{item.enrollment}</td>
                    <td>{item.visit}</td>
                    <td>
                      <button
                        type="button"
                        className="cro-btn-primary-inline"
                        onClick={() => openDetail(item)}
                      >
                        View
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
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Subject"
        footer={
          <>
            <button type="button" className="cro-btn cro-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button type="button" className="cro-btn cro-btn-primary" onClick={handleAddSubject}>Save</button>
          </>
        }
      >
        <input className="cro-input" placeholder="Study" value={form.study} onChange={(e) => setForm({ ...form, study: e.target.value })} />
        <input className="cro-input" placeholder="Site" value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} />
        <select className="cro-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option>Active</option>
          <option>Screening</option>
          <option>Completed</option>
          <option>Withdrawn</option>
        </select>
        <input className="cro-input" placeholder="Current Visit" value={form.visit} onChange={(e) => setForm({ ...form, visit: e.target.value })} />
      </CROModal>

      <CROModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedSubject ? `Subject ${selectedSubject.id}` : "Subject Details"}
        size="large"
        footer={
          editMode ? (
            <>
              <button type="button" className="cro-btn cro-btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
              <button type="button" className="cro-btn cro-btn-primary" onClick={handleSaveEdit}>Save Changes</button>
            </>
          ) : (
            <>
              <button type="button" className="cro-btn cro-btn-secondary" onClick={() => selectedSubject && handleDelete(selectedSubject.id)}>Delete</button>
              <button type="button" className="cro-btn cro-btn-primary" onClick={() => setEditMode(true)}>Edit</button>
            </>
          )
        }
      >
        {selectedSubject && (
          editMode ? (
            <>
              <input className="cro-input" value={form.study} onChange={(e) => setForm({ ...form, study: e.target.value })} />
              <input className="cro-input" value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} />
              <select className="cro-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Active</option>
                <option>Screening</option>
                <option>Completed</option>
                <option>Withdrawn</option>
              </select>
              <input className="cro-input" value={form.visit} onChange={(e) => setForm({ ...form, visit: e.target.value })} />
            </>
          ) : (
            <div className="subject-detail">
              <p><strong>Subject ID:</strong> {selectedSubject.id}</p>
              <p><strong>Study:</strong> {selectedSubject.study}</p>
              <p><strong>Site:</strong> {selectedSubject.site}</p>
              <p><strong>Status:</strong> <StatusBadge status={selectedSubject.status} /></p>
              <p><strong>Enrollment:</strong> {selectedSubject.enrollment}</p>
              <p><strong>Current Visit:</strong> {selectedSubject.visit}</p>
            </div>
          )
        )}
      </CROModal>
    </CROLayout>
  );
}

export default CROSubjectManagement;
