import React from "react";

function SiteManagement() {

  const siteData = [
    {
      site: "Apollo Hospital",
      pi: "Dr. Ramesh",
      location: "Hyderabad",
      status: "Active",
      lastVisit: "10-Jun-2026"
    },
    {
      site: "Yashoda Hospital",
      pi: "Dr. Suresh",
      location: "Hyderabad",
      status: "Monitoring",
      lastVisit: "14-Jun-2026"
    },
    {
      site: "AIG Hospital",
      pi: "Dr. Kumar",
      location: "Hyderabad",
      status: "Recruiting",
      lastVisit: "22-Jun-2026"
    }
  ];

  return (
    <div style={{ padding: "30px" }}>

      <h1>Site Management</h1>

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

    </div>
  );
}

export default SiteManagement;