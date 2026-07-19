import React, { useMemo } from "react";
import { resolveSiteDisplay } from "../../utils/siteDisplay";
import { getStudies } from "../../services/studyService";

function Monitoring() {
  const siteSources = useMemo(() => getStudies(), []);
  const displaySite = (value) =>
    value
      ? resolveSiteDisplay(value, {
          sources: siteSources,
          fallback: value
        })
      : "—";

  const visits = [
    {
      site: "Apollo Hospital",
      type: "Routine Monitoring",
      date: "10-Jun-2026",
      status: "Completed"
    },
    {
      site: "Yashoda Hospital",
      type: "Follow Up",
      date: "14-Jun-2026",
      status: "Scheduled"
    },
    {
      site: "AIG Hospital",
      type: "Close Out",
      date: "22-Jun-2026",
      status: "Pending"
    }
  ];

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
          {visits.map((visit, index) => (
            <tr key={index}>
              <td>{displaySite(visit.site)}</td>
              <td>{visit.type}</td>
              <td>{visit.date}</td>
              <td>{visit.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Monitoring;