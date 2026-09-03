import React, { useMemo } from "react";
import { resolveSiteDisplay } from "../../shared/utils/siteDisplay.js";
import { getStudies } from "../../services/studyService";
import useVisitSchedules from "../../shared/hooks/useVisitSchedules.js";
import { formatScheduleDisplayDate } from "../../shared/utils/formatScheduleDisplayDate.js";

function Monitoring() {
  const { schedules } = useVisitSchedules();
  const siteSources = useMemo(() => getStudies(), []);
  const displaySite = (value) =>
    value
      ? resolveSiteDisplay(value, {
          sources: siteSources,
          fallback: value
        })
      : "—";

  return (
    <div style={{ padding: "30px" }}>
      <h1>Monitoring Visits</h1>

      <table>
        <thead>
          <tr>
            <th>Site</th>
            <th>Visit Type</th>
            <th>Visit Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {schedules.length === 0 ? (
            <tr>
              <td colSpan="4">No monitoring visits scheduled.</td>
            </tr>
          ) : (
            schedules.map((visit) => (
              <tr key={visit.id}>
                <td>{displaySite(visit.site)}</td>
                <td>{visit.visit || "Visit"}</td>
                <td>{formatScheduleDisplayDate(visit.date)}</td>
                <td>{visit.status || "Scheduled"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Monitoring;
