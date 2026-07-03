import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import DataTable from "../../../Components/dashboard/DataTable";
import DocumentFolderManager from "../../../Components/common/DocumentFolderManager";
import DelegationLog from "../../../Components/DelegationLog";

import { getStudyLogs, getDelegationLogs } from "../../../services/adminService";
import { getStudyByCode } from "../../../services/studyService";
import "./StudyLogsTab.css";

function StudyLogsTab() {
  const [staff, setStaff] = useState([]);
  const { id } = useParams();

  const study = getStudyByCode(id);
  const studyCode = study?.code || id;

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    role: "",
    responsibility: "",
    status: "Active"
  });
  const ROLE_OPTIONS = [
  "Principal Investigator",
  "Sub Investigator",
  "Study Coordinator",
  "Research Nurse",
  "Clinical Research Associate",
  "Pharmacist",
  "Laboratory Technician",
  "Data Manager",
  "Regulatory Coordinator",
  "Quality Assurance",
  "Medical Monitor"
];

const RESPONSIBILITY_MAP = {
  "Principal Investigator": [
    "Medical Review",
    "Physical Exam",
    "Protocol Oversight",
    "Subject Eligibility",
    "Safety Review",
    "Adverse Event Review"
  ],

  "Sub Investigator": [
    "Medical Review",
    "Physical Exam",
    "Subject Follow-up",
    "Adverse Event Assessment"
  ],

  "Study Coordinator": [
    "eReg Access",
    "Source Documentation",
    "Visit Coordination",
    "Subject Scheduling",
    "Regulatory Documentation"
  ],

  "Research Nurse": [
    "Vital Signs",
    "Blood Collection",
    "Drug Administration",
    "ECG",
    "Sample Collection"
  ],

  "Clinical Research Associate": [
    "Source Data Verification",
    "Monitoring Visit",
    "Query Resolution",
    "Site Monitoring"
  ],

  "Pharmacist": [
    "Drug Dispensing",
    "IP Accountability",
    "Drug Storage",
    "Temperature Monitoring"
  ],

  "Laboratory Technician": [
    "Sample Collection",
    "Sample Processing",
    "Specimen Shipping",
    "Lab Testing"
  ],

  "Data Manager": [
    "Data Entry",
    "Data Validation",
    "Query Management",
    "Database Review"
  ],

  "Regulatory Coordinator": [
    "IRB Submission",
    "Regulatory Documents",
    "Essential Documents",
    "Protocol Amendment"
  ],

  "Quality Assurance": [
    "Internal Audit",
    "CAPA Review",
    "Compliance Review"
  ],

  "Medical Monitor": [
    "Medical Oversight",
    "Safety Assessment",
    "Protocol Review"
  ]
};

  // ---- NEW: Study Logs is now state instead of a static useMemo, so we can
  // append a new row every time a delegation is added/edited/deleted. ----
  const [studyLogs, setStudyLogs] = useState([]);

  // ---- NEW: Delegation History is now owned here (single source of truth)
  // and passed down to DelegationLog via props instead of being hardcoded
  // inside the child component. ----
  const [delegationHistory, setDelegationHistory] = useState([]);

  // Seed Study Logs from the service once we know the study code.
  useEffect(() => {
    if (studyCode) {
      setStudyLogs(getStudyLogs(studyCode));
    }
  }, [studyCode]);

  // ---- NEW: Delegation staff now lives in StudyLogsTab (was previously
  // duplicated inside DelegationLog.js). This fetch was moved here from
  // DelegationLog.js's old useEffect so there is only one copy of this state. ----
  useEffect(() => {
    const data = getDelegationLogs();
    const formatted = data.map((item) => ({
      ...item,
      name: item.delegateName,
      responsibility: item.description,
      status: item.status || "Active"
    }));
    setStaff(formatted);
  }, []);

  // ---- NEW: shared helpers to append a Study Log row and a History row.
  // Every delegation action (add/edit/delete/status change) goes through
  // these so Study Logs and Delegation History stay in sync automatically. ----
  const addStudyLogEntry = (action, user, status) => {
    setStudyLogs((prev) => [
      ...prev,
      {
        id: `DEL-${Date.now()}`,
        type: "Delegation",
        action,
        user,
        timestamp: new Date().toLocaleDateString(),
        status
      }
    ]);
  };

  const addHistoryEntry = (action, user, reason = null) => {
    setDelegationHistory((prev) => [
      {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        action,
        user,
        reason
      },
      ...prev
    ]);
  };

  // ---- MODIFIED: handleSave now validates required fields, updates staff,
  // and records a Study Log + History entry. This replaces the old
  // handleSave/handleAdd pair (handleAdd was dead code — it wrote to a
  // delegationLogs state that was never rendered anywhere). ----
  const handleSave = () => {
    if (!form.name.trim() || !form.role.trim() || !form.responsibility.trim()) {
      alert("Please fill in Name, Role, and Responsibility.");
      return;
    }

    const newStaff = {
      id: Date.now(),
      name: form.name,
      role: form.role,
      responsibility: form.responsibility,
      status: form.status,
      duties: [
        {
          duty: "A2",
          description: form.responsibility
        }
      ]
    };

    setStaff((prev) => [...prev, newStaff]);
    addStudyLogEntry("Added Staff", form.name, form.status);
    addHistoryEntry("Staff Added", form.name);

    setForm({
      name: "",
      role: "",
      responsibility: "",
      status: "Active"
    });

    setShowModal(false);
  };

  // ---- NEW: passed to DelegationLog as onEdit. Runs after the child's
  // "Confirm Edit" step, and after Update is pressed in the edit modal. ----
  const handleUpdateStaff = (staffId, updatedFields) => {
    const original = staff.find((s) => s.id === staffId);

    setStaff((prev) =>
      prev.map((s) =>
        s.id === staffId
          ? {
              ...s,
              ...updatedFields,
              duties: [{ duty: "A2", description: updatedFields.responsibility }]
            }
          : s
      )
    );

    addStudyLogEntry("Edited Staff", updatedFields.name, updatedFields.status);
    addHistoryEntry("Staff Edited", updatedFields.name);

    if (original && original.status !== updatedFields.status) {
      addStudyLogEntry("Status Changed", updatedFields.name, updatedFields.status);
      addHistoryEntry(`Status Changed to ${updatedFields.status}`, updatedFields.name);
    }
  };

  // ---- NEW: passed to DelegationLog as onDelete. Runs after the child's
  // "Delete Delegation" confirm step + mandatory reason step. ----
  const handleDeleteStaff = (staffId, reason) => {
    const target = staff.find((s) => s.id === staffId);

    setStaff((prev) => prev.filter((s) => s.id !== staffId));

    if (target) {
      addStudyLogEntry("Deleted Staff", target.name, "Inactive");
      addHistoryEntry("Staff Deleted", target.name, reason);
    }
  };

  return (
    <div className="module-card">
      <DocumentFolderManager
        sectionId="logs"
        contextKey={studyCode || "default"}
        title="Logs"
      />

      <div className="studylogs-toolbar">
        <button
          className="add-delegation-btn"
          onClick={() => setShowModal(true)}
        >
          + Add Delegation
        </button>
      </div>

      <DataTable
        title={`Study Logs — ${study?.name || studyCode}`}
        columns={[
          { key: "id", label: "Log ID" },
          { key: "type", label: "Type" },
          { key: "action", label: "Action" },
          { key: "user", label: "User" },
          { key: "timestamp", label: "Date/Time" },
          { key: "status", label: "Status" }
        ]}
        data={studyLogs}
        emptyMessage="No log entries for this study"
      />

      {/* ---- MODIFIED: staff, history, and the edit/delete handlers are now
      passed down as props instead of DelegationLog fetching/holding its own
      copy of the staff list. ---- */}
            <DelegationLog
        staff={staff}
        history={delegationHistory}
        onEdit={handleUpdateStaff}
        onDelete={handleDeleteStaff}
      />

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">

            <div className="modal-title">
              Add Delegation
            </div>

            <div className="modal-body">
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <select
  value={form.role}
  onChange={(e) =>
    setForm({
      ...form,
      role: e.target.value,
      responsibility: ""
    })
  }
>
  <option value="">Select Role</option>

  {ROLE_OPTIONS.map((role) => (
    <option key={role} value={role}>
      {role}
    </option>
  ))}
</select>

              <select
  value={form.responsibility}
  disabled={!form.role}
  onChange={(e) =>
    setForm({
      ...form,
      responsibility: e.target.value
    })
  }
>
  <option value="">
    Select Responsibility
  </option>

  {(RESPONSIBILITY_MAP[form.role] || []).map((item) => (
    <option key={item} value={item}>
      {item}
    </option>
  ))}
</select>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="save-btn"
                onClick={handleSave}
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default StudyLogsTab;
