import React from "react";
import CROLayout from "./CROLayout";
import { useCROData } from "./CRODATAContext";
import CROStatusBadge from "./CROStatusBadge";
import EmptyState from "./EmptyState";
import { useNavigate } from "react-router-dom";

function CROSubjects() {
  const { subjects } = useCROData();
  const navigate = useNavigate();

  return (
    <CROLayout>
      <h1 style={{ marginBottom: "25px" }}>Subjects</h1>
      <div className="cro-panel">
        {subjects.length === 0 ? (
          <EmptyState title="No Subjects Found" />
        ) : (
          <div className="cro-table-wrap">
            <table className="cro-data-table">
              <thead>
                <tr>
                  <th>Subject ID</th>
                  <th>Study</th>
                  <th>Site</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.study}</td>
                    <td>{s.site}</td>
                    <td>
                      <CROStatusBadge status={s.status} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="cro-btn-sm"
                        onClick={() => navigate(`/cro-subject/${s.id}`)}
                      >
                        View Details
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

export default CROSubjects;
