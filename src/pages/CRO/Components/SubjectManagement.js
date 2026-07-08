import React, { useEffect, useMemo, useState } from "react";
import CROSidebar from "./CROSidebar";
import CRONavbar from "./CRONavbar";
import RequestPermissionButton from "../../Components/common/RequestPermissionButton";

function readSharedSubjects() {
  try {
    const subjectsByStudy = JSON.parse(localStorage.getItem("subjectsByStudy")) || {};
    return Object.entries(subjectsByStudy).flatMap(([studyCode, subjects]) =>
      (Array.isArray(subjects) ? subjects : []).map((subject, index) => ({
        id: subject.id || subject.subjectId || `${studyCode}-${index}`,
        subjectId: subject.subjectId || subject.id || `${studyCode}-${index}`,
        subjectName: subject.name || subject.subjectId || subject.id,
        study: studyCode,
        status: subject.status || "Active",
      })),
    );
  } catch {
    return [];
  }
}

function SubjectManagement() {
  const [subjects, setSubjects] = useState(readSharedSubjects);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const refresh = () => setSubjects(readSharedSubjects());
    window.addEventListener("subjects-updated", refresh);
    window.addEventListener("studies-updated", refresh);
    return () => {
      window.removeEventListener("subjects-updated", refresh);
      window.removeEventListener("studies-updated", refresh);
    };
  }, []);

  const filteredSubjects = useMemo(
    () =>
      subjects.filter(
        (subject) =>
          String(subject.subjectId).toLowerCase().includes(search.toLowerCase()) ||
          String(subject.subjectName).toLowerCase().includes(search.toLowerCase()),
      ),
    [subjects, search],
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
            }}
          >
            <h1>Subject Management</h1>
            <RequestPermissionButton
              action="Add Subject"
              module="Subject Management"
              label="Add Subject"
            />
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              marginTop: "20px",
            }}
          >
            <input
              type="text"
              placeholder="Search Subject..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ marginBottom: "20px", padding: "10px", width: "100%" }}
            />

            {filteredSubjects.length === 0 ? (
              <p>No data available yet</p>
            ) : (
              <table width="100%" cellPadding="10">
                <thead>
                  <tr>
                    <th>Subject ID</th>
                    <th>Name</th>
                    <th>Study</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.map((subject) => (
                    <tr key={subject.id}>
                      <td>{subject.subjectId}</td>
                      <td>{subject.subjectName}</td>
                      <td>{subject.study}</td>
                      <td>{subject.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubjectManagement;
