import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CROSidebar from "./CROSidebar";
import CRONavbar from "./CRONavbar";
import RequestPermissionButton from "../../../Components/common/RequestPermissionButton";
import { getAccessibleStudies, getCurrentUser } from "../../../services/roleService";
import {
  getFilteredSchedules,
  mapScheduleToTableRow,
  SCHEDULES_EVENT,
} from "../../../services/visitScheduleService";

function readSharedVisits(studyCode) {
  try {
    const schedules = getFilteredSchedules(getCurrentUser(), {
      studyCode: studyCode || undefined,
    });
    return schedules.map(mapScheduleToTableRow);
  } catch {
    return [];
  }
}

function VisitManagement() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [studies, setStudies] = useState(() => getAccessibleStudies(getCurrentUser()));
  const [studyCode, setStudyCode] = useState("");
  const [visits, setVisits] = useState(() => readSharedVisits(""));

  useEffect(() => {
    setVisits(readSharedVisits(studyCode));
  }, [studyCode]);

  useEffect(() => {
    const refresh = () => {
      setVisits(readSharedVisits(studyCode));
      setStudies(getAccessibleStudies(getCurrentUser()));
    };
    window.addEventListener(SCHEDULES_EVENT, refresh);
    window.addEventListener("studies-updated", refresh);
    return () => {
      window.removeEventListener(SCHEDULES_EVENT, refresh);
      window.removeEventListener("studies-updated", refresh);
    };
  }, [studyCode]);

  const filteredVisits = useMemo(
    () =>
      visits.filter((visit) =>
        String(visit.visit || "")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [visits, search],
  );

  return (
    <div className="dashboard-layout">
      <CROSidebar />
      <div className="main-content">
        <CRONavbar />
        <div style={{ padding: "30px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h1>Visit Management</h1>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <select
                value={studyCode}
                onChange={(event) => setStudyCode(event.target.value)}
                aria-label="Select study for new visit"
                style={{ padding: "8px" }}
              >
                <option value="">All studies</option>
                {studies.map((study) => (
                  <option key={study.code} value={study.code}>
                    {study.name || study.code}
                  </option>
                ))}
              </select>
              {studyCode && (
                <RequestPermissionButton
                  action="Add Visit"
                  module="Visits"
                  studyCode={studyCode}
                  label="+ Add Visit"
                />
              )}
            </div>
          </div>

          <input
            type="text"
            placeholder="Search Visit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "350px",
              padding: "12px",
              marginBottom: "20px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          />

          {filteredVisits.length === 0 ? (
            <p>No data available yet</p>
          ) : (
            <table width="100%" border="1" cellPadding="10">
              <thead>
                <tr>
                  <th>Subject ID</th>
                  <th>Visit</th>
                  <th>Date</th>
                  <th>Study</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.map((visit) => (
                  <tr key={visit.id}>
                    <td>{visit.subjectId}</td>
                    <td>{visit.visit}</td>
                    <td>{visit.date}</td>
                    <td>{visit.study}</td>
                    <td>{visit.status}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => navigate(`/visit-details/${visit.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default VisitManagement;