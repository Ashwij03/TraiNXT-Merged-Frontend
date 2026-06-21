import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../Components/dashboard/DashboardLayout";
import KPICard from "../../../Components/dashboard/KPICard";
import { createStudy } from "../../../services/studyService";
import { getAccessibleStudies, getCurrentUser } from "../../../services/roleService";
import { canAddStudy } from "../../../utils/contentAccess";
import { FiFolder } from "react-icons/fi";

import "./Studies.css";

const initialForm = {
  code: "",
  name: "",
  protocol: "",
  location: "",
  site: "",
  enrolled: "",
  targetSubjects: "",
  status: "Active",
  principalInvestigator: "",
  sponsor: "",
  startDate: "",
  description: ""
};

function Studies() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [studies, setStudies] = useState(() => getAccessibleStudies(currentUser));
  const [formOpen, setFormOpen] =
    useState(false);
  const [form, setForm] =
    useState(initialForm);

  const canCreateStudy = canAddStudy(currentUser);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const createdStudy =
      createStudy({
        ...form,
        site:
          form.site || form.location,
        protocol:
          form.protocol || form.name
      });

    const subjectsByStudy =
      JSON.parse(
        localStorage.getItem("subjectsByStudy")
      ) || {};

    if (!subjectsByStudy[createdStudy.code]) {
      subjectsByStudy[createdStudy.code] = [];
      localStorage.setItem(
        "subjectsByStudy",
        JSON.stringify(subjectsByStudy)
      );
    }

    localStorage.setItem(
      "selectedStudy",
      JSON.stringify(createdStudy)
    );

    localStorage.setItem(
      "sidebarStudiesOpen",
      JSON.stringify(true)
    );
    localStorage.setItem(
      "sidebarStudyBinderOpen",
      JSON.stringify(true)
    );

    setStudies(getAccessibleStudies(currentUser));
    setForm(initialForm);
    setFormOpen(false);

    navigate(
      `/study-dashboard/${createdStudy.code}`
    );
  };

  const handleStudyCardClick = (study) => {
    localStorage.setItem(
      "selectedStudy",
      JSON.stringify(study)
    );

    localStorage.setItem(
      "sidebarStudiesOpen",
      JSON.stringify(true)
    );

    localStorage.setItem(
      "sidebarStudyBinderOpen",
      JSON.stringify(true)
    );

    navigate(
      `/study-dashboard/${study.code}`
    );
  };

  return (
    <DashboardLayout>
      <div className="studies-page">
        <div className="studies-page-header">
          <div>
            <h1>My Studies</h1>
            <p>
              Manage clinical studies and open study dashboards.
            </p>
          </div>

          {canCreateStudy && (
          <button
            className="add-study-btn"
            onClick={() => setFormOpen(true)}
          >
            + Add Study
          </button>
          )}
        </div>

        <div className="studies-summary-kpi">
          <KPICard
            title="Total Studies"
            value={studies.length}
            subtitle="Accessible Studies"
            icon={<FiFolder />}
          />
        </div>

        <div className="studies-grid">
          {studies.map((study) => (
            <div
              key={study.code}
              className="study-card"
              onClick={() =>
                handleStudyCardClick(study)
              }
            >
              <div className="study-card-content">

                <div
                  className={`study-status ${(
                    study.status || "active"
                  ).toLowerCase()}`}
                >
                  {study.status || "Active"}
                </div>

                <h3>
                  {study.name}
                </h3>

                <div className="study-code">
                  Study ID : {study.code}
                </div>

                <div className="study-info">

                  <div>
                    <strong>PI:</strong>
                    {study.principalInvestigator || "N/A"}
                  </div>

                  <div>
                    <strong>Site:</strong>
                    {study.location || "N/A"}
                  </div>

                  <div>
                    <strong>Subjects:</strong>
                    {study.enrolled || 0}
                    {" / "}
                    {study.targetSubjects || 0}
                  </div>

                  <div>
                    <strong>Start:</strong>
                    {study.startDate || "-" }
                  </div>

                </div>

                <button
                  className="open-study-btn"
                >
                  Open Workspace
                </button>

              </div>
            </div>
          ))}
        </div>

        {formOpen && (
          <div className="study-modal-overlay">
            <form
              className="study-modal"
              onSubmit={handleSubmit}
            >
              <div className="study-modal-header">
                <div>
                  <h2>Add Study</h2>
                  <p>
                    Enter the study, site and subject details.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                >
                  x
                </button>
              </div>

              <div className="study-form-grid">
                <label>
                  Study ID
                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    required
                    placeholder="Example: ABC-101"
                  />
                </label>

                <label>
                  Study Name
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Study name"
                  />
                </label>

                <label>
                  Protocol
                  <input
                    name="protocol"
                    value={form.protocol}
                    onChange={handleChange}
                    placeholder="Protocol title"
                  />
                </label>

                <label>
                  Site / Hospital
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    placeholder="Apollo Hospital"
                  />
                </label>

                <label>
                  Subjects Enrolled
                  <input
                    name="enrolled"
                    type="number"
                    min="0"
                    value={form.enrolled}
                    onChange={handleChange}
                    required
                    placeholder="0"
                  />
                </label>

                <label>
                  Target Subjects
                  <input
                    name="targetSubjects"
                    type="number"
                    min="0"
                    value={form.targetSubjects}
                    onChange={handleChange}
                    required
                    placeholder="100"
                  />
                </label>

                <label>
                  Study Status
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    required
                  >
                    <option>Active</option>
                    <option>Screening</option>
                    <option>Enrollment</option>
                    <option>Paused</option>
                    <option>Completed</option>
                  </select>
                </label>

                <label>
                  Principal Investigator
                  <input
                    name="principalInvestigator"
                    value={form.principalInvestigator}
                    onChange={handleChange}
                    required
                    placeholder="PI name"
                  />
                </label>

                <label>
                  Sponsor
                  <input
                    name="sponsor"
                    value={form.sponsor}
                    onChange={handleChange}
                    required
                    placeholder="Sponsor name"
                  />
                </label>

                <label>
                  Start Date
                  <input
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="study-form-wide">
                  Study Description
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows="3"
                    placeholder="Brief study description"
                  />
                </label>
              </div>

              <div className="study-modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="add-study-btn"
                >
                  Submit Study
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Studies;