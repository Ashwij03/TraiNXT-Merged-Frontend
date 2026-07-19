import React, { useMemo } from "react";
import CROLayout from "./CROLayout";
import { useCROData } from "./CRODATAContext";
import CROStatusBadge from "./CROStatusBadge";
import EmptyState from "./EmptyState";
import { useNavigate } from "react-router-dom";
import { resolveSiteDisplay } from "../../utils/siteDisplay";
import { getStudies } from "../../services/studyService";


function CROVisits() {
  const { subjects, visits } = useCROData();
  const navigate = useNavigate();

  const siteSources = useMemo(() => getStudies(), []);
  const displaySite = (value) =>
    value
      ? resolveSiteDisplay(value, {
          sources: siteSources,
          fallback: value
        })
      : "—";

  const subjectVisits = subjects.map((s) => ({
    id: s.id,
    subject: s.id,
    site: s.site,
    visit: s.visit,
    status: s.status,
  }));

  return (
    <CROLayout>
      <h1 style={{ marginBottom: "25px" }}>Visits</h1>

      <div className="cro-summary-cards">
        <div className="dashboard-card">
          <h3>Subject Visits</h3>
          <h1>{subjectVisits.length}</h1>
        </div>
        <div className="dashboard-card">
          <h3>Monitoring Visits</h3>
          <h1>{visits.length}</h1>
        </div>
        <div className="dashboard-card">
          <h3>Completed</h3>
          <h1>{visits.filter((v) => v.status === "Completed").length}</h1>
        </div>
        <div className="dashboard-card">
          <h3>Scheduled</h3>
          <h1>{visits.filter((v) => v.status === "Scheduled").length}</h1>
        </div>
      </div>

      <div className="cro-panel">
        <h2>Subject Visit Status</h2>
        {subjectVisits.length === 0 ? (
          <EmptyState title="No Visits Found" />
        ) : (
          <div className="cro-table-wrap">
            <table className="cro-data-table">
              <thead>
                <tr>
                  <th>Subject ID</th>
                  <th>Site</th>
                  <th>Current Visit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjectVisits.map((v) => (
                  <tr key={v.id}>
                    <td>{v.subject}</td>
                    <td>{displaySite(v.site)}</td>
                    <td>{v.visit}</td>
                    <td>
                      <CROStatusBadge status={v.status} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="cro-btn-sm"
                        onClick={() => navigate(`/cro-subject/${v.id}`)}
                      >
                        View Subject
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

export default CROVisits;
