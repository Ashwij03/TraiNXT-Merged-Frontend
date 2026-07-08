import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CROSidebar from "./CROSidebar";
import CRONavbar from "./CRONavbar";
import RequestPermissionButton from "../../Components/common/RequestPermissionButton";
import { getAllSchedules } from "../../services/adminService";

function loadVisits() {
  try {
    const schedules = getAllSchedules();
    if (schedules.length) {
      return schedules.map((item, index) => ({
        id: item.id || index,
        visitName: item.visit || item.visitName || "Visit",
        study: item.studyCode || item.subjectId || "—",
        status: item.status || "Scheduled",
      }));
    }
    const saved = localStorage.getItem("visits");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function VisitManagement() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [visits, setVisits] = useState(loadVisits);

  useEffect(() => {
    const refresh = () => setVisits(loadVisits());
    window.addEventListener("visits-updated", refresh);
    window.addEventListener("studies-updated", refresh);
    return () => {
      window.removeEventListener("visits-updated", refresh);
      window.removeEventListener("studies-updated", refresh);
    };
  }, []);

  const filteredVisits = visits.filter((visit) =>
    String(visit.visitName || "")
      .toLowerCase()
      .includes(search.toLowerCase()),
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
            <RequestPermissionButton
              action="Add Visit"
              module="Visits"
              label="+ Add Visit"
            />
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
                  <th>Visit</th>
                  <th>Study / Subject</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.map((visit) => (
                  <tr key={visit.id}>
                    <td>{visit.visitName}</td>
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
