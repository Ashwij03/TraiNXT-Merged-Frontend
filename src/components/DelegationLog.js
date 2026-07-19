import React, { useState } from "react";
import "./DelegationLog.css";

// ---- MODIFIED: staff is no longer fetched here — it's the single source of
// truth living in StudyLogsTab and passed down as a prop. `history` is also
// passed down (was previously hardcoded inside the History modal). `onEdit`
// and `onDelete` are callbacks that update the parent's state. ----
const DelegationLog = ({ staff = [], history = [], onEdit, onDelete }) => {

  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [tab, setTab] = useState("active");

  // ---- NEW: Edit flow state — step 1 (confirm) then step 2 (edit form). ----
  const [editConfirmTarget, setEditConfirmTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    role: "",
    responsibility: "",
    status: "Active"
  });

  // ---- NEW: Delete flow state — step 1 (confirm) then step 2 (mandatory reason). ----
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);
  const [deleteReasonTarget, setDeleteReasonTarget] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteReasonError, setDeleteReasonError] = useState("");

  // ---- NEW: called from the "Confirm Edit" popup's Continue button.
  // Pre-fills the edit form with the selected row's current values. ----
  const handleContinueToEdit = () => {
    setEditForm({
      name: editConfirmTarget.name || "",
      role: editConfirmTarget.role || "",
      responsibility: editConfirmTarget.responsibility || "",
      status: editConfirmTarget.status || "Active"
    });
    setEditTarget(editConfirmTarget);
    setEditConfirmTarget(null);
  };

  // ---- NEW: called from the Edit modal's Update button. ----
  const handleUpdateSubmit = () => {
    if (!editForm.name.trim() || !editForm.role.trim() || !editForm.responsibility.trim()) {
      alert("Please fill in Name, Role, and Responsibility.");
      return;
    }
    onEdit(editTarget.id, editForm);
    setEditTarget(null);
  };

  // ---- NEW: called from the "Delete Delegation" popup's Continue button. ----
  const handleContinueToDeleteReason = () => {
    setDeleteReasonTarget(deleteConfirmTarget);
    setDeleteConfirmTarget(null);
    setDeleteReason("");
    setDeleteReasonError("");
  };

  // ---- NEW: called from the reason modal's Delete button. Reason is mandatory. ----
  const handleDeleteSubmit = () => {
    if (!deleteReason.trim()) {
      setDeleteReasonError("Reason for deletion is required.");
      return;
    }
    onDelete(deleteReasonTarget.id, deleteReason.trim());
    setDeleteReasonTarget(null);
  };

  return (

    <div className="delegation-container">

      <h2 className="delegation-title">
        B. Electronic Delegation Log
      </h2>
      <div className="delegation-header">

        <button onClick={() => alert("Open Add Staff Form")}>
          Add Staff
        </button>

        <button onClick={() => setShowHistory(true)}>
          Delegation History
        </button>

      </div>

      {/* CARD */}

      <table className="staff-table">

        <thead>

          <tr>

            <th>Name</th>

            <th>Role</th>

            <th>Responsibility</th>

            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          {staff.map((member) => (

            <tr key={member.id}>

              <td>{member.name || member.delegateName}</td>
              <td>{member.role || "-"}</td>

              <td>{member.responsibility || member.description}</td>

              <td>

                {/* ---- MODIFIED: Edit now opens the "Confirm Edit" popup
                instead of firing an alert. ---- */}
                <button
                  onClick={() => setEditConfirmTarget(member)}
                >
                  Edit
                </button>

                {/* ---- MODIFIED: Delete now opens the "Delete Delegation"
                popup instead of firing an alert. ---- */}
                <button
                  onClick={() => setDeleteConfirmTarget(member)}
                >
                  Delete
                </button>

                <button
                  onClick={() => setShowModal(true)}
                >
                  View
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>


      {/* MODAL */}

      {showModal && (

        <div className="modal-overlay">

          <div className="modal-box">
            {showHistory && (

              <div className="modal-overlay">

                <div className="modal-box">

                  <div className="modal-header">

                    <h3>Delegation History</h3>

                    <span
                      className="close-btn"
                      onClick={() => setShowHistory(false)}
                    >
                      ✖
                    </span>

                  </div>

                  <table className="delegation-table">

                    <thead>

                      <tr>

                        <th>Date</th>

                        <th>Action</th>

                        <th>User</th>

                      </tr>

                    </thead>

                    {/* ---- MODIFIED: rows now come from the `history` prop
                    (populated automatically by StudyLogsTab on every
                    add/edit/delete/status change) instead of 3 hardcoded rows. ---- */}
                    <tbody>

                      {history.length === 0 ? (
                        <tr>
                          <td colSpan={3} style={{ textAlign: "center", color: "#98a2b3" }}>
                            No history yet.
                          </td>
                        </tr>
                      ) : (
                        history.map((entry) => (
                          <tr key={entry.id}>
                            <td>{entry.date}</td>
                            <td>
                              {entry.action}
                              {entry.reason ? ` — ${entry.reason}` : ""}
                            </td>
                            <td>{entry.user}</td>
                          </tr>
                        ))
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            )}

            {/* HEADER */}

            <div className="modal-header">

              <div className="modal-user">

                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt=""
                />

                <div>

                  <h3>Megan Richards</h3>

                  <p>Investigator</p>

                </div>

              </div>

              <span
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ✖
              </span>

            </div>

            {/* TABS */}

            <div className="modal-tabs">

              <button
                className={tab === "active" ? "tab active" : "tab"}
                onClick={() => setTab("active")}
              >
                Active
              </button>

              <button
                className={tab === "inactive" ? "tab active" : "tab"}
                onClick={() => setTab("inactive")}
              >
                Inactive
              </button>

            </div>

            {/* TABLE */}

            <table className="delegation-table">

              <thead>

                <tr>

                  <th>Staff Name</th>

                  <th>Delegated Role</th>

                  <th>Start Date</th>

                  <th>End Date</th>

                  <th>Status</th>

                </tr>

              </thead>

              <tbody>

                {/* ACTIVE */}

                {tab === "active" && (
                  <>
                    <tr>
                      <td>A2</td>
                      <td>Physical Exam</td>
                      <td>1/27/2020 - Present</td>
                      <td>1/27/2020</td>
                      <td>1/27/2020</td>
                    </tr>

                    <tr>
                      <td>A3</td>
                      <td>Medical Review</td>
                      <td>2/10/2020 - Present</td>
                      <td>2/10/2020</td>
                      <td>2/10/2020</td>
                    </tr>
                  </>
                )}

                {/* INACTIVE */}

                {tab === "inactive" && (
                  <>
                    <tr>
                      <td>2</td>
                      <td>eReg Access</td>
                      <td>1/27/2020 - 4/13/2020</td>
                      <td>1/27/2020</td>
                      <td>1/27/2020</td>
                    </tr>

                    <tr>
                      <td>5</td>
                      <td>Data Verification</td>
                      <td>3/01/2020 - 6/20/2020</td>
                      <td>3/01/2020</td>
                      <td>3/01/2020</td>
                    </tr>
                  </>
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

      {/* ============================================================ */}
      {/* ---- NEW: Confirm Edit popup (step 1 of the Edit flow) ---- */}
      {/* ============================================================ */}
      {editConfirmTarget && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: "420px" }}>
            <div className="modal-title">Confirm Edit</div>
            <div className="modal-body">
              <p>Are you sure you want to edit this delegation?</p>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setEditConfirmTarget(null)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleContinueToEdit}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ---- NEW: Edit modal (step 2 of the Edit flow), pre-filled ---- */}
      {/* ============================================================ */}
      {editTarget && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: "460px" }}>
            <div className="modal-title">Edit Delegation</div>
            <div className="modal-body">
              <input
                placeholder="Name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />

              <input
                placeholder="Role"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              />

              <input
                placeholder="Responsibility"
                value={editForm.responsibility}
                onChange={(e) => setEditForm({ ...editForm, responsibility: e.target.value })}
              />

              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setEditTarget(null)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleUpdateSubmit}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ---- NEW: Delete Delegation confirm popup (step 1 of Delete) ---- */}
      {/* ============================================================ */}
      {deleteConfirmTarget && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: "420px" }}>
            <div className="modal-title">Delete Delegation</div>
            <div className="modal-body">
              <p>Are you sure you want to delete this delegation?</p>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setDeleteConfirmTarget(null)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleContinueToDeleteReason}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ---- NEW: Mandatory reason popup (step 2 of Delete flow) ---- */}
      {/* ============================================================ */}
      {deleteReasonTarget && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: "460px" }}>
            <div className="modal-title">Reason for Deletion</div>
            <div className="modal-body">
              <textarea
                placeholder="Enter reason"
                value={deleteReason}
                onChange={(e) => {
                  setDeleteReason(e.target.value);
                  if (deleteReasonError) setDeleteReasonError("");
                }}
                style={{
                  width: "100%",
                  minHeight: "90px",
                  padding: "10px 12px",
                  border: deleteReasonError ? "1px solid #dc3545" : "1px solid #d5dce5",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  boxSizing: "border-box"
                }}
              />
              {deleteReasonError && (
                <p style={{ color: "#dc3545", fontSize: "13px", marginTop: "6px" }}>
                  {deleteReasonError}
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setDeleteReasonTarget(null)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleDeleteSubmit}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

  );

};

export default DelegationLog;