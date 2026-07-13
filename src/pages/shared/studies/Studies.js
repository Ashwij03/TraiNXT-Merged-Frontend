import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../Components/dashboard/DashboardLayout";
import KPICard from "../../../Components/dashboard/KPICard";
import { createStudy, getStudies } from "../../../services/studyService";
import {
  getAccessibleStudies,
  getCurrentUser,
  getEffectiveRole,
} from "../../../services/roleService";
import { canAddStudy } from "../../../utils/contentAccess";
import ROLES from "../../../constants/roles";
import {
  FiFolder,
  FiGrid,
  FiList,
  FiColumns,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import "./Studies.css";

const STUDIES_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

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

  // For CRO, the main Studies page must mirror the exact same dynamic
  // study source the CRO sidebar uses (getStudies(), unfiltered), so the
  // sidebar count and the main page list/KPI always match. Every other
  // role keeps using getAccessibleStudies() exactly as before.
  const loadStudies = useCallback(() => {
    const user = getCurrentUser();
    const effectiveRole = String(getEffectiveRole(user) || "")
      .trim()
      .toLowerCase();
    const isCroRole = effectiveRole === String(ROLES.CRO).trim().toLowerCase();

    return isCroRole ? getStudies() : getAccessibleStudies(user);
  }, []);

  const [studies, setStudies] = useState(() => loadStudies());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sponsorFilter, setSponsorFilter] = useState("");
  const [indicationFilter, setIndicationFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [sortBy, setSortBy] = useState("studyId");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("studiesViewMode") || "grid";
  });

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const canCreateStudy = canAddStudy(currentUser);

  const handleViewChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem("studiesViewMode", mode);
  };

  const statusOptions = useMemo(
    () => [...new Set(studies.map((study) => study.status).filter(Boolean))].sort(),
    [studies]
  );

  const sponsorOptions = useMemo(
    () => [...new Set(studies.map((study) => study.sponsor).filter(Boolean))].sort(),
    [studies]
  );

  const indicationOptions = useMemo(
    () =>
      [...new Set(studies.map((study) => study.indication).filter(Boolean))].sort(),
    [studies]
  );

  const countryOptions = useMemo(
    () => [...new Set(studies.map((study) => study.country).filter(Boolean))].sort(),
    [studies]
  );

  const filteredStudies = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const result = studies.filter((study) => {
      const searchableValues = [
        study.name,
        study.code,
        study.sponsor,
        study.cro,
        study.indication,
        study.principalInvestigator,
        study.location,
        study.country,
        study.status,
        study.protocol,
      ];

      const matchesSearch =
        !search ||
        searchableValues.some((value) =>
          String(value || "").toLowerCase().includes(search)
        );

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
        return result.sort((a, b) =>
          String(a.code || "").localeCompare(String(b.code || ""))
        );

      case "startDate":
        return result.sort(
          (a, b) =>
            new Date(b.startDate || 0).getTime() -
            new Date(a.startDate || 0).getTime()
        );

      case "sponsor":
        return result.sort((a, b) =>
          String(a.sponsor || "").localeCompare(String(b.sponsor || ""))
        );

      default:
        return result.sort((a, b) =>
          String(a.studyId || "").localeCompare(String(b.studyId || ""))
        );
    }
  }, [
    studies,
    searchTerm,
    statusFilter,
    sponsorFilter,
    indicationFilter,
    countryFilter,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudies.length / pageSize)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    sponsorFilter,
    indicationFilter,
    countryFilter,
    sortBy,
    viewMode,
    pageSize,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const refreshStudies = () => setStudies(loadStudies());

    window.addEventListener("studies-updated", refreshStudies);
    window.addEventListener("sponsor-data-updated", refreshStudies);

    return () => {
      window.removeEventListener("studies-updated", refreshStudies);
      window.removeEventListener("sponsor-data-updated", refreshStudies);
    };
  }, [loadStudies]);

  const paginatedStudies = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return filteredStudies.slice(
      startIndex,
      startIndex + pageSize
    );
  }, [filteredStudies, currentPage, pageSize]);

  const pageStart =
    filteredStudies.length === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const pageEnd = Math.min(
    currentPage * pageSize,
    filteredStudies.length
  );

  const pageNumbers = useMemo(() => {
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisiblePages / 2)
    );

    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = totalPages - maxVisiblePages + 1;
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index
    );
  }, [currentPage, totalPages]);

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

    setStudies(loadStudies());
    setForm(initialForm);
    setFormOpen(false);
    setCurrentPage(1);

    navigate(`/study-dashboard/${createdStudy.code}`);
  };

  const handleStudyCardClick = (study) => {
    localStorage.setItem("selectedStudy", JSON.stringify(study));
    localStorage.setItem("sidebarStudiesOpen", JSON.stringify(true));
    localStorage.setItem("sidebarStudyBinderOpen", JSON.stringify(true));

    navigate(`/study-dashboard/${study.code}`);
  };

  const renderPagination = () => {
    if (filteredStudies.length === 0) {
      return null;
    }

    return (
      <div className="studies-pagination">
        <div className="studies-pagination-info">
          Showing {pageStart}-{pageEnd} of {filteredStudies.length} studies
        </div>

        <div className="studies-pagination-controls">
          <label className="studies-page-size">
            Rows
            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              aria-label="Rows per page"
            >
              {STUDIES_PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="pagination-btn"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <FiChevronLeft />
          </button>

          {pageNumbers[0] > 1 && (
            <>
              <button
                type="button"
                className="pagination-btn"
                onClick={() => setCurrentPage(1)}
              >
                1
              </button>

              {pageNumbers[0] > 2 && (
                <span className="pagination-ellipsis">...</span>
              )}
            </>
          )}

          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              className={`pagination-btn ${
                currentPage === page ? "active" : ""
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="pagination-ellipsis">...</span>
              )}

              <button
                type="button"
                className="pagination-btn"
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            type="button"
            className="pagination-btn"
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="studies-page">
        <div className="studies-page-header">
          <div>
            <h1>My Studies</h1>
            <p>Manage clinical studies and open study dashboards.</p>
          </div>
        </div>

        <div className="studies-toolbar">
          <div className="studies-search">
            <FiSearch />

            <input
              type="text"
              placeholder="Search studies..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="studies-filters">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">All Status</option>

              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={sponsorFilter}
              onChange={(event) => setSponsorFilter(event.target.value)}
            >
              <option value="">All Sponsors</option>

              {sponsorOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={indicationFilter}
              onChange={(event) => setIndicationFilter(event.target.value)}
            >
              <option value="">All Indications</option>

              {indicationOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={countryFilter}
              onChange={(event) => setCountryFilter(event.target.value)}
            >
              <option value="">All Countries</option>

              {countryOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="studyId">Study ID</option>
              <option value="name">Study Name</option>
              <option value="sponsor">Sponsor</option>
              <option value="startDate">Start Date</option>
            </select>
          </div>
        </div>

        <div className="studies-summary-kpi">
          <KPICard
            title="Total Studies"
            value={studies.length}
            subtitle="Accessible Studies"
            icon={<FiFolder />}
          />

          <div className="studies-summary-actions">
            <div className="studies-view-toggle">
              <button
                type="button"
                className={viewMode === "grid" ? "active" : ""}
                onClick={() => handleViewChange("grid")}
              >
                <FiGrid />
                <span>Grid</span>
              </button>

              <button
                type="button"
                className={viewMode === "list" ? "active" : ""}
                onClick={() => handleViewChange("list")}
              >
                <FiList />
                <span>List</span>
              </button>

              <button
                type="button"
                className={viewMode === "table" ? "active" : ""}
                onClick={() => handleViewChange("table")}
              >
                <FiColumns />
                <span>Table</span>
              </button>
            </div>

            {canCreateStudy && (
              <button
                type="button"
                className="add-study-btn"
                onClick={() => setFormOpen(true)}
              >
                + Add Study
              </button>
            )}
          </div>
        </div>

        {filteredStudies.length === 0 && (
          <div className="studies-empty-state">
            No studies found for the selected search and filters.
          </div>
        )}

        {viewMode === "grid" && filteredStudies.length > 0 && (
          <div className="studies-grid">
            {paginatedStudies.map((study) => (
              <div
                key={study.code}
                className="study-card"
                onClick={() => handleStudyCardClick(study)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleStudyCardClick(study);
                  }
                }}
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

                  <button
                    type="button"
                    className="open-study-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleStudyCardClick(study);
                    }}
                  >
                    Open Workspace
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "list" && filteredStudies.length > 0 && (
          <div className="studies-list">
            {paginatedStudies.map((study) => (
              <div
                key={study.code}
                className="study-list-item"
                onClick={() => handleStudyCardClick(study)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleStudyCardClick(study);
                  }
                }}
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
                    className={`study-status ${(
                      study.status || "active"
                    ).toLowerCase()}`}
                  >
                    {study.status || "Active"}
                  </span>

                  <button
                    type="button"
                    className="open-study-btn"
                    onClick={(event) => {
                      event.stopPropagation();
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

        {viewMode === "table" && filteredStudies.length > 0 && (
          <div className="studies-table-wrap">
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
                {paginatedStudies.map((study) => (
                  <tr key={study.code}>
                    <td>{study.code}</td>
                    <td>{study.name}</td>
                    <td>{study.sponsor || "-"}</td>
                    <td>{study.cro || "-"}</td>
                    <td>{study.indication || "-"}</td>
                    <td>{study.country || "-"}</td>
                    <td>{study.principalInvestigator || "-"}</td>
                    <td>{study.location || "-"}</td>
                    <td>
                      {study.enrolled || 0}/{study.targetSubjects || 0}
                    </td>

                    <td>
                      <span
                        className={`study-status ${(
                          study.status || "active"
                        ).toLowerCase()}`}
                      >
                        {study.status || "Active"}
                      </span>
                    </td>

                    <td>{study.startDate || "-"}</td>

                    <td>
                      <button
                        type="button"
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
          </div>
        )}

        {renderPagination()}

        {formOpen && (
          <div className="study-modal-overlay">
            <form className="study-modal" onSubmit={handleSubmit}>
              <div className="study-modal-header">
                <div>
                  <h2>Add Study</h2>
                  <p>Enter the study, site and subject details.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  aria-label="Close add study form"
                >
                  ×
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