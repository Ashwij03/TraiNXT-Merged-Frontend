import React from "react";
import { useNavigate } from "react-router-dom";
import { useCROData } from "./CRODATAContext";
import CROStatusBadge from "./CROStatusBadge";
import EmptyState from "./EmptyState";
import "./UpcomingMonitoringVisits.css";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function UpcomingMonitoringVisits() {
  const { upcomingVisits } = useCROData();
  const navigate = useNavigate();

  return (
    <div className="upcoming-visits-widget">
      <div className="upcoming-visits-header">
        <h2>Upcoming Monitoring Visits</h2>
        <button
          type="button"
          className="upcoming-visits-view-all"
          onClick={() => navigate("/cro-monitoring")}
        >
          View All
        </button>
      </div>

      {upcomingVisits.length === 0 ? (
        <EmptyState
          title="No Upcoming Visits"
          message="All monitoring visits are completed or none scheduled."
        />
      ) : (
        <div className="upcoming-visits-table-wrap">
          <table className="upcoming-visits-table">
            <thead>
              <tr>
                <th>Visit ID</th>
                <th>Site</th>
                <th>Visit Type</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {upcomingVisits.slice(0, 6).map((visit) => (
                <tr key={visit.id}>
                  <td>{visit.id}</td>
                  <td>{visit.site}</td>
                  <td>{visit.visitType}</td>
                  <td>{formatDate(visit.date)}</td>
                  <td>
                    <CROStatusBadge status={visit.status} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="upcoming-visits-action-btn"
                      onClick={() => navigate("/cro-monitoring")}
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
  );
}

export default UpcomingMonitoringVisits;
