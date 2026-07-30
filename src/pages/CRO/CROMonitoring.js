import React, { useMemo, useState } from "react";
import CROLayout from "./CROLayout";
import { useCROData } from "./CRODATAContext";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import { resolveSiteDisplay } from "../../utils/siteDisplay";
import { getStudies } from "../../services/studyService";
import { formatScheduleDisplayDate } from "../../utils/formatScheduleDisplayDate";
import { isPastCalendarDate } from "../../services/visitScheduleService";

function CROMonitoring() {
  const { visits } = useCROData();

  const siteSources = useMemo(() => getStudies(), []);
  const displaySite = (value) =>
    value
      ? resolveSiteDisplay(value, {
          sources: siteSources,
          fallback: value
        })
      : "—";

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredVisits = visits.filter((visit) => {
    const matchesSearch = String(visit.id || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || visit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const completedCount = visits.filter((v) => v.status === "Completed").length;
  const pendingCount = visits.filter((v) => v.status === "Pending").length;
  const overdueCount = visits.filter((v) => {
    if (v.status === "Completed") return false;
    return isPastCalendarDate(v.date);
  }).length;

  return (
    <CROLayout>
      <h1>Monitoring</h1>

<div className="cro-stats-grid">
  <div className="cro-card">
    <h3>Total Visits</h3>
    <h2>{visits.length}</h2>
  </div>

  <div className="cro-card">
    <h3>Completed</h3>
    <h2>{completedCount}</h2>
  </div>

  <div className="cro-card">
    <h3>Pending</h3>
    <h2>{pendingCount}</h2>
  </div>

  <div className="cro-card">
    <h3>Overdue</h3>
    <h2>{overdueCount}</h2>
  </div>
</div>

      <div className="cro-panel">
        <div className="cro-panel-header">
          <div className="cro-panel-filters">
            <input
              type="text"
              placeholder="Search Visit ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cro-input"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="cro-input"
            >
              <option value="All">All</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
            </select>
          </div>
        </div>

        {filteredVisits.length === 0 ? (
          <EmptyState title="No Visits Found" />
        ) : (
          <div className="table-scroll-wrap">
            <table className="cro-table">
              <thead>
                <tr>
                  <th>Visit ID</th>
                  <th>Site</th>
                  <th>CRA</th>
                  <th>Visit Type</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.map((visit) => (
                  <tr key={visit.id}>
                    <td>{visit.id}</td>
                    <td>{displaySite(visit.site)}</td>
                    <td>{visit.cra}</td>
                    <td>{visit.visitType}</td>
                    <td>{formatScheduleDisplayDate(visit.date)}</td>
                    <td><StatusBadge status={visit.status} /></td>
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

export default CROMonitoring;
