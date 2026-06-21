import React from "react";
import CROLayout from "./CROLayout";
import { useCROData } from "./CRODATAContext";
import CROStatusBadge from "./CROStatusBadge";
import EmptyState from "./EmptyState";
import { useNavigate } from "react-router-dom";

function CROEnrollment() {
  const { subjects } = useCROData();
  const navigate = useNavigate();

  const enrolledSubjects = subjects.filter((s) =>
    ["Active", "Completed"].includes(s.status)
  );

  return (
    <CROLayout>
      <h1 style={{ marginBottom: "25px" }}>Enrollment</h1>

      <div className="cro-summary-cards">
        <div className="dashboard-card">
          <h3>Total Enrolled</h3>
          <h1>{enrolledSubjects.length}</h1>
        </div>
        <div className="dashboard-card">
          <h3>Active</h3>
          <h1>{subjects.filter((s) => s.status === "Active").length}</h1>
        </div>
        <div className="dashboard-card">
          <h3>Completed</h3>
          <h1>{subjects.filter((s) => s.status === "Completed").length}</h1>
        </div>
        <div className="dashboard-card">
          <h3>Enrollment Rate</h3>
          <h1>
            {subjects.length > 0
              ? `${Math.round((enrolledSubjects.length / subjects.length) * 100)}%`
              : "0%"}
          </h1>
        </div>
      </div>

      <div className="cro-panel">
        <h2>Enrolled Subjects</h2>
        {enrolledSubjects.length === 0 ? (
          <EmptyState title="No Enrolled Subjects Found" />
        ) : (
          <div className="cro-table-wrap">
            <table className="cro-data-table">
              <thead>
                <tr>
                  <th>Subject ID</th>
                  <th>Study</th>
                  <th>Site</th>
                  <th>Enrollment Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrolledSubjects.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.study}</td>
                    <td>{s.site}</td>
                    <td>{s.enrollment}</td>
                    <td>
                      <CROStatusBadge status={s.status} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="cro-btn-sm"
                        onClick={() => navigate(`/cro-subject/${s.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CROLayout>
  );
}

export default CROEnrollment;
