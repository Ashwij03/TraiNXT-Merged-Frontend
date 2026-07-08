import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../Components/dashboard/DashboardLayout";
import KPICard from "../../../Components/dashboard/KPICard";
import { createStudy } from "../../../services/studyService";
import {
  getAccessibleStudies,
  getCurrentUser,
} from "../../../services/roleService";
import { canAddStudy } from "../../../utils/contentAccess";
import { FiFolder, FiGrid, FiList, FiColumns, FiSearch } from "react-icons/fi";

import "./Studies.css";

const initialForm = {
  code: "",
  name: "",
  protocol: "",
  indication: "",
  country: "",
  location: "",
  site: "",
  enrolled: "",
  targetSubjects: "",
  status: "Active",
  principalInvestigator: "",
  sponsor: "",
  cro: "",
  startDate: "",
  description: "",
};

function Studies() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [studies, setStudies] = useState(() =>
    getAccessibleStudies(currentUser),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sponsorFilter, setSponsorFilter] = useState("");
  const [indicationFilter, setIndicationFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("studiesViewMode") || "grid";
  });
  const handleViewChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem("studiesViewMode", mode);
  };
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const canCreateStudy = canAddStudy(currentUser);

  const statusOptions = useMemo(
    () => [...new Set(studies.map((s) => s.status).filter(Boolean))].sort(),
    [studies],
  );

  const sponsorOptions = useMemo(
    () => [...new Set(studies.map((s) => s.sponsor).filter(Boolean))].sort(),
    [studies],
  );

  const indicationOptions = useMemo(
    () => [...new Set(studies.map((s) => s.indication).filter(Boolean))].sort(),
    [studies],
  );

  const countryOptions = useMemo(
    () => [...new Set(studies.map((s) => s.country).filter(Boolean))].sort(),
    [studies],
  );

  const filteredStudies = useMemo(() => {
    const search = searchTerm.toLowerCase();

    let result = studies.filter((study) => {
      const matchesSearch =
        study.name?.toLowerCase().includes(search) ||
        study.code?.toLowerCase().includes(search) ||
        study.sponsor?.toLowerCase().includes(search) ||
        study.cro?.toLowerCase().includes(search) ||
        study.indication?.toLowerCase().includes(search) ||
        study.principalInvestigator?.toLowerCase().includes(search) ||
        study.location?.toLowerCase().includes(search);

      const matchesStatus = !statusFilter || study.status === statusFilter;

      const matchesSponsor = !sponsorFilter || study.sponsor === sponsorFilter;

      const matchesIndication =
        !indicationFilter || study.indication === indicationFilter;

      const matchesCountry = !countryFilter || study.country === countryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSponsor &&
        matchesIndication &&
        matchesCountry
      );
    });

    switch (sortBy) {
      case "studyId":
        result.sort((a, b) => a.code.localeCompare(b.code));
        break;

      case "startDate":
        result.sort(
          (a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0),
        );
        break;

      case "sponsor":
        result.sort((a, b) => (a.sponsor || "").localeCompare(b.sponsor || ""));
        break;

      default:
        result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [
    studies,
    searchTerm,
    statusFilter,
    sponsorFilter,
    indicationFilter,
    countryFilter,
    sortBy,
  ]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const createdStudy = createStudy({
      ...form,
      site: form.site || form.location,
      protocol: form.protocol || form.name,
    });

    const subjectsByStudy =
      JSON.parse(localStorage.getItem("subjectsByStudy")) || {};

    if (!subjectsByStudy[createdStudy.code]) {
      subjectsByStudy[createdStudy.code] = [];
      localStorage.setItem("subjectsByStudy", JSON.stringify(subjectsByStudy));
    }

    localStorage.setItem("selectedStudy", JSON.stringify(createdStudy));

    localStorage.setItem("sidebarStudiesOpen", JSON.stringify(true));
    localStorage.setItem("sidebarStudyBinderOpen", JSON.stringify(true));

    setStudies(getAccessibleStudies(currentUser));
    setForm(initialForm);
    setFormOpen(false);

    navigate(`/study-dashboard/${createdStudy.code}`);
  };

  const handleStudyCardClick = (study) => {
    localStorage.setItem("selectedStudy", JSON.stringify(study));

    localStorage.setItem("sidebarStudiesOpen", JSON.stringify(true));

    localStorage.setItem("sidebarStudyBinderOpen", JSON.stringify(true));

    navigate(`/study-dashboard/${study.code}`);
  };

  return (
    <DashboardLayout>
      <div className="studies-page">
        <div className="studies-page-header">
          <div>
            <h1>My Studies</h1>
            <p>Manage clinical studies and open study dashboards.</p>
          </div>

          {canCreateStudy && (
            <button className="add-study-btn" onClick={() => setFormOpen(true)}>
              + Add Study
            </button>
          )}
        </div>

        <div className="studies-toolbar">
          <div className="studies-search">
            <FiSearch />

            <input
              type="text"
              placeholder="Search studies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="studies-filters">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>

              {statusOptions.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>

            <select
              value={sponsorFilter}
              onChange={(e) => setSponsorFilter(e.target.value)}
            >
              <option value="">All Sponsors</option>

              {sponsorOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              value={indicationFilter}
              onChange={(e) => setIndicationFilter(e.target.value)}
            >
              <option value="">All Indications</option>

              {indicationOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
            >
              <option value="">All Countries</option>

              {countryOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Study Name</option>
              <option value="studyId">Study ID</option>
              <option value="sponsor">Sponsor</option>
              <option value="startDate">Start Date</option>
            </select>
          </div>

          <div className="view-toggle">
            <button
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => handleViewChange("grid")}
            >
              <FiGrid />
              <span>Grid</span>
            </button>

            <button
              className={viewMode === "list" ? "active" : ""}
              onClick={() => handleViewChange("list")}
            >
              <FiList />
              <span>List</span>
            </button>

            <button
              className={viewMode === "table" ? "active" : ""}
              onClick={() => handleViewChange("table")}
            >
              <FiColumns />
              <span>Table</span>
            </button>
          </div>
        </div>

        <div className="studies-summary-kpi">
          <KPICard
            title="Total Studies"
            value={filteredStudies.length}
            subtitle="Accessible Studies"
            icon={<FiFolder />}
          />
        </div>

        {viewMode === "grid" && (
          <div className="studies-grid">
            {filteredStudies.map((study) => (
              <div
                key={study.code}
                className="study-card"
                onClick={() => handleStudyCardClick(study)}
              >
                <div className="study-card-content">
                  <div
                    className={`study-status ${(
                      study.status || "active"
                    ).toLowerCase()}`}
                  >
                    {study.status || "Active"}
                  </div>

                  <h3>{study.name}</h3>

                  <div className="study-code">Study ID : {study.code}</div>

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
                      {study.startDate || "-"}
                    </div>
                  </div>

                  <button className="open-study-btn">Open Workspace</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "list" && (
          <div className="studies-list">
            {filteredStudies.map((study) => (
              <div
                key={study.code}
                className="study-list-item"
                onClick={() => handleStudyCardClick(study)}
              >
                <div className="study-list-name">
                  <h3>{study.name}</h3>
                  <span>{study.code}</span>
                </div>

                <div className="study-list-field">
                  <label>Sponsor</label>
                  <span>{study.sponsor || "-"}</span>
                </div>

                <div className="study-list-field">
                  <label>CRO</label>
                  <span>{study.cro || "-"}</span>
                </div>

                <div className="study-list-field">
                  <label>Indication</label>
                  <span>{study.indication || "-"}</span>
                </div>

                <div className="study-list-field">
                  <label>Country</label>
                  <span>{study.country || "-"}</span>
                </div>

                <div className="study-list-field">
                  <label>PI</label>
                  <span>{study.principalInvestigator || "-"}</span>
                </div>

                <div className="study-list-field">
                  <label>Site</label>
                  <span>{study.location || "-"}</span>
                </div>

                <div className="study-list-field">
                  <label>Subjects</label>
                  <span>
                    {study.enrolled || 0}/{study.targetSubjects || 0}
                  </span>
                </div>

                <div className="study-list-field">
                  <label>Start Date</label>
                  <span>{study.startDate || "-"}</span>
                </div>

                <div className="study-list-status">
                  <span
                    className={`study-status ${(study.status || "active").toLowerCase()}`}
                  >
                    {study.status || "Active"}
                  </span>

                  <button
                    className="open-study-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStudyCardClick(study);
                    }}
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "table" && (
          <table className="studies-table">
            <thead>
              <tr>
                <th>Study ID</th>

                <th>Name</th>

                <th>Sponsor</th>

                <th>CRO</th>

                <th>Indication</th>

                <th>Country</th>

                <th>PI</th>

                <th>Site</th>

                <th>Subjects</th>

                <th>Status</th>

                <th>Start</th>

                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudies.map((study) => (
                <tr key={study.code}>
                  <td>{study.code}</td>

                  <td>{study.name}</td>

                  <td>{study.sponsor}</td>

                  <td>{study.cro}</td>

                  <td>{study.indication}</td>

                  <td>{study.country}</td>

                  <td>{study.principalInvestigator}</td>

                  <td>{study.location}</td>

                  <td>
                    {study.enrolled}/{study.targetSubjects}
                  </td>

                  <td>
                    <span
                      className={`study-status ${(
                        study.status || "active"
                      ).toLowerCase()}`}
                    >
                      {study.status}
                    </span>
                  </td>

                  <td>{study.startDate}</td>

                  <td>
                    <button
                      className="open-study-btn"
                      onClick={() => handleStudyCardClick(study)}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {formOpen && (
          <div className="study-modal-overlay">
            <form className="study-modal" onSubmit={handleSubmit}>
              <div className="study-modal-header">
                <div>
                  <h2>Add Study</h2>
                  <p>Enter the study, site and subject details.</p>
                </div>

                <button type="button" onClick={() => setFormOpen(false)}>
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
                  Indication
                  <input
                    name="indication"
                    value={form.indication}
                    onChange={handleChange}
                    required
                    placeholder="Example: Oncology"
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
                  Country
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    required
                    placeholder="India"
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
                  CRO
                  <input
                    name="cro"
                    value={form.cro}
                    onChange={handleChange}
                    placeholder="IQVIA"
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

                <button type="submit" className="add-study-btn">
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
