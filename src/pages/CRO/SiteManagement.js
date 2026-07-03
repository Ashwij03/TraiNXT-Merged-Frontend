import React from "react";
import { getStudies } from "../../services/studyService";

function SiteManagement() {
  const studies = getStudies();

  const siteData = studies.map((study) => ({
    site: study.site || study.location || "—",
    pi: study.principalInvestigator || "—",
    location: study.location || study.country || "—",
    status: study.status || "Active",
    lastVisit: study.startDate || "—",
  }));

  return (
    <div style={{ padding: "30px" }}>
      <h1>Site Management</h1>

      {siteData.length === 0 ? (
        <p>No data available yet</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Site Name</th>
              <th>Principal Investigator</th>
              <th>Location</th>
              <th>Status</th>
              <th>Last Monitoring Visit</th>
            </tr>
          </thead>
          <tbody>
            {siteData.map((site, index) => (
              <tr key={index}>
                <td>{site.site}</td>
                <td>{site.pi}</td>
                <td>{site.location}</td>
                <td>{site.status}</td>
                <td>{site.lastVisit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SiteManagement;
