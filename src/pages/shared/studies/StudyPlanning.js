import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RequestPermissionButton from "../../../Components/common/RequestPermissionButton";
import { canEditStudyContent } from "../../../utils/contentAccess";
import { getCurrentUser } from "../../../services/roleService";
import {
  PLANNING_UPDATED_EVENT,
  getPlanningMilestones,
  getPlanningTasks,
  getStudyTeam,
  getRegulatoryChecklist,
  getProtocols,
  savePlanningMilestone,
  deletePlanningMilestone,
  savePlanningTask,
  deletePlanningTask,
  saveStudyTeamMember,
  deleteStudyTeamMember,
  saveRegulatoryChecklistItem,
  deleteRegulatoryChecklistItem,
  saveProtocol,
  deleteProtocol,
} from "../../../services/planningService";
import "./StudyPlanning.css";

function StudyPlanning() {
  const { id: studyCode } = useParams();
  const canEdit = canEditStudyContent(getCurrentUser());
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const refresh = () => setVersion((v) => v + 1);
    window.addEventListener(PLANNING_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(PLANNING_UPDATED_EVENT, refresh);
  }, []);

  void version;

  const milestones = getPlanningMilestones(studyCode);
  const tasks = getPlanningTasks(studyCode);
  const team = getStudyTeam(studyCode);
  const checklist = getRegulatoryChecklist(studyCode);
  const protocols = getProtocols(studyCode);

  const bump = () => setVersion((v) => v + 1);

  return (
    <div className="study-planning-page">
      <div className="study-planning-header">
        <h2>Planning</h2>
        {!canEdit && (
          <RequestPermissionButton
            action="Edit Planning"
            module="Study Planning"
            label="Request Edit Permission"
          />
        )}
      </div>

      <section className="planning-section">
        <h3>Project Management — Milestones</h3>
        {milestones.length === 0 ? (
          <p className="planning-empty">No planning milestones yet</p>
        ) : (
          <table className="planning-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Due</th>
                <th>Owner</th>
                <th>Status</th>
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {milestones.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.dueDate || "—"}</td>
                  <td>{item.owner || "—"}</td>
                  <td>{item.status}</td>
                  {canEdit && (
                    <td>
                      <button
                        type="button"
                        className="link-btn danger"
                        onClick={() => {
                          deletePlanningMilestone(studyCode, item.id);
                          bump();
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {canEdit && (
          <PlanningMilestoneForm
            onSave={(data) => {
              savePlanningMilestone(studyCode, data);
              bump();
            }}
          />
        )}
      </section>

      <section className="planning-section">
        <h3>Tasks</h3>
        {tasks.length === 0 ? (
          <p className="planning-empty">No tasks yet</p>
        ) : (
          <table className="planning-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Assignee</th>
                <th>Due</th>
                <th>Priority</th>
                <th>Status</th>
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {tasks.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.assignee || "—"}</td>
                  <td>{item.dueDate || "—"}</td>
                  <td>{item.priority}</td>
                  <td>{item.status}</td>
                  {canEdit && (
                    <td>
                      <button
                        type="button"
                        className="link-btn danger"
                        onClick={() => {
                          deletePlanningTask(studyCode, item.id);
                          bump();
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {canEdit && (
          <PlanningTaskForm
            onSave={(data) => {
              savePlanningTask(studyCode, data);
              bump();
            }}
          />
        )}
      </section>

      <section className="planning-section">
        <h3>Study Team</h3>
        {team.length === 0 ? (
          <p className="planning-empty">No team members added yet</p>
        ) : (
          <table className="planning-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Organization</th>
                <th>Email</th>
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {team.map((member) => (
                <tr key={member.id}>
                  <td>{member.name || "—"}</td>
                  <td>{member.role || "—"}</td>
                  <td>{member.organization || "—"}</td>
                  <td>{member.email || "—"}</td>
                  {canEdit && (
                    <td>
                      <button
                        type="button"
                        className="link-btn danger"
                        onClick={() => {
                          deleteStudyTeamMember(studyCode, member.id);
                          bump();
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {canEdit && (
          <StudyTeamForm
            onSave={(data) => {
              saveStudyTeamMember(studyCode, data);
              bump();
            }}
          />
        )}
      </section>

      <section className="planning-section">
        <h3>Regulatory Documents Checklist</h3>
        {checklist.length === 0 ? (
          <p className="planning-empty">No checklist items yet</p>
        ) : (
          <ul className="regulatory-checklist">
            {checklist.map((item) => (
              <li key={item.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(item.completed)}
                    disabled={!canEdit}
                    onChange={(e) => {
                      saveRegulatoryChecklistItem(studyCode, {
                        ...item,
                        completed: e.target.checked,
                      });
                      bump();
                    }}
                  />
                  <span>{item.label}</span>
                </label>
                <span className="checklist-meta">
                  Due: {item.dueDate || "—"}
                </span>
                {canEdit && (
                  <button
                    type="button"
                    className="link-btn danger"
                    onClick={() => {
                      deleteRegulatoryChecklistItem(studyCode, item.id);
                      bump();
                    }}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {canEdit && (
          <RegulatoryItemForm
            onSave={(data) => {
              saveRegulatoryChecklistItem(studyCode, data);
              bump();
            }}
          />
        )}
      </section>

      <section className="planning-section">
        <h3>Protocols</h3>
        {protocols.length === 0 ? (
          <p className="planning-empty">No protocols recorded yet</p>
        ) : (
          protocols.map((protocol) => (
            <div key={protocol.id} className="protocol-card">
              <div className="protocol-header">
                <strong>{protocol.title}</strong>
                <span>Current: v{protocol.currentVersion || "—"}</span>
                {canEdit && (
                  <button
                    type="button"
                    className="link-btn danger"
                    onClick={() => {
                      deleteProtocol(studyCode, protocol.id);
                      bump();
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
              <ul className="protocol-versions">
                {(protocol.versions || []).map((versionRow, index) => (
                  <li key={`${protocol.id}-v-${index}`}>
                    v{versionRow.version} — {versionRow.effectiveDate || "—"} (
                    {versionRow.status || "Draft"})
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
        {canEdit && (
          <ProtocolForm
            onSave={(data) => {
              saveProtocol(studyCode, data);
              bump();
            }}
          />
        )}
      </section>
    </div>
  );
}

function PlanningMilestoneForm({ onSave }) {
  const [form, setForm] = useState({
    title: "",
    dueDate: "",
    owner: "",
    status: "Not Started",
  });

  return (
    <form
      className="planning-inline-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        onSave(form);
        setForm({ title: "", dueDate: "", owner: "", status: "Not Started" });
      }}
    >
      <input
        placeholder="Milestone title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <input
        type="date"
        value={form.dueDate}
        onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
      />
      <input
        placeholder="Owner"
        value={form.owner}
        onChange={(e) => setForm({ ...form, owner: e.target.value })}
      />
      <button type="submit" className="secondary-btn">
        Add Milestone
      </button>
    </form>
  );
}

function PlanningTaskForm({ onSave }) {
  const [form, setForm] = useState({
    title: "",
    assignee: "",
    dueDate: "",
    priority: "Medium",
    status: "Open",
  });

  return (
    <form
      className="planning-inline-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        onSave(form);
        setForm({
          title: "",
          assignee: "",
          dueDate: "",
          priority: "Medium",
          status: "Open",
        });
      }}
    >
      <input
        placeholder="Task title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <input
        placeholder="Assignee"
        value={form.assignee}
        onChange={(e) => setForm({ ...form, assignee: e.target.value })}
      />
      <input
        type="date"
        value={form.dueDate}
        onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
      />
      <button type="submit" className="secondary-btn">
        Add Task
      </button>
    </form>
  );
}

function StudyTeamForm({ onSave }) {
  const [form, setForm] = useState({
    name: "",
    role: "",
    email: "",
    organization: "",
  });

  return (
    <form
      className="planning-inline-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        onSave(form);
        setForm({ name: "", role: "", email: "", organization: "" });
      }}
    >
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        placeholder="Role"
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
      />
      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        placeholder="Organization"
        value={form.organization}
        onChange={(e) => setForm({ ...form, organization: e.target.value })}
      />
      <button type="submit" className="secondary-btn">
        Add Member
      </button>
    </form>
  );
}

function RegulatoryItemForm({ onSave }) {
  const [label, setLabel] = useState("");

  return (
    <form
      className="planning-inline-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!label.trim()) return;
        onSave({ label, completed: false });
        setLabel("");
      }}
    >
      <input
        placeholder="Checklist item"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <button type="submit" className="secondary-btn">
        Add Item
      </button>
    </form>
  );
}

function ProtocolForm({ onSave }) {
  const [form, setForm] = useState({
    title: "",
    version: "1.0",
    effectiveDate: "",
    summary: "",
    status: "Draft",
  });

  return (
    <form
      className="planning-inline-form planning-inline-form--stacked"
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        onSave(form);
        setForm({
          title: "",
          version: "1.0",
          effectiveDate: "",
          summary: "",
          status: "Draft",
        });
      }}
    >
      <input
        placeholder="Protocol title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <input
        placeholder="Version"
        value={form.version}
        onChange={(e) => setForm({ ...form, version: e.target.value })}
      />
      <input
        type="date"
        value={form.effectiveDate}
        onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
      />
      <textarea
        placeholder="Summary"
        value={form.summary}
        rows={2}
        onChange={(e) => setForm({ ...form, summary: e.target.value })}
      />
      <button type="submit" className="secondary-btn">
        Add Protocol
      </button>
    </form>
  );
}

export default StudyPlanning;
