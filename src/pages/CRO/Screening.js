import React, { useEffect, useMemo, useState } from "react";
import CROSidebar from "./Components/CROSidebar";
import CRONavbar from "./Components/CRONavbar";
import RequestPermissionButton from "../../Components/common/RequestPermissionButton";

function readScreeningRecords() {
  try {
    const subjectsByStudy = JSON.parse(localStorage.getItem("subjectsByStudy")) || {};
    return Object.entries(subjectsByStudy).flatMap(([studyCode, subjects]) =>
      (Array.isArray(subjects) ? subjects : [])
        .filter((subject) =>
          ["Screening", "Pending"].includes(subject.status) ||
          String(subject.visit || "").toLowerCase().includes("screening"),
        )
        .map((subject, index) => ({
          id: subject.id || subject.subjectId || `${studyCode}-${index}`,
          subjectId: subject.subjectId || subject.id || `${studyCode}-${index}`,
          name: subject.name || subject.subjectId || subject.id,
          study: studyCode,
          screeningDate: subject.enrollment || subject.createdAt || "—",
          status: subject.status || "Pending",
        })),
    );
  } catch {
    return [];
  }
}

function Screening() {
  const [search, setSearch] = useState("");
  const [screenings, setScreenings] = useState(readScreeningRecords);

  useEffect(() => {
    const refresh = () => setScreenings(readScreeningRecords());
    window.addEventListener("subjects-updated", refresh);
    window.addEventListener("studies-updated", refresh);
    return () => {
      window.removeEventListener("subjects-updated", refresh);
      window.removeEventListener("studies-updated", refresh);
    };
  }, []);

  const filteredScreenings = useMemo(
    () =>
      screenings.filter(
        (item) =>
          String(item.subjectId).toLowerCase().includes(search.toLowerCase()) ||
          String(item.name).toLowerCase().includes(search.toLowerCase()),
      ),
    [screenings, search],
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
            <h1>Screening</h1>
            <RequestPermissionButton
              action="Add Screening"
              module="Screening"
              label="+ Add Screening"
            />
          </div>

          <input
            type="text"
            placeholder="Search by Subject ID or Name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ marginBottom: "20px", padding: "10px", width: "100%" }}
          />

          {filteredScreenings.length === 0 ? (
            <p>No data available yet</p>
          ) : (
            <table width="100%" cellPadding="10">
              <thead>
                <tr>
                  <th>Subject ID</th>
                  <th>Name</th>
                  <th>Study</th>
                  <th>Screening Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredScreenings.map((item) => (
                  <tr key={item.id}>
                    <td>{item.subjectId}</td>
                    <td>{item.name}</td>
                    <td>{item.study}</td>
                    <td>{item.screeningDate}</td>
                    <td>{item.status}</td>
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

export default Screening;
