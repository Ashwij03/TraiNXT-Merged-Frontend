import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClinicalSiteQuickView from "./ClinicalSiteQuickView";


import "./ClinicalSitesDashboard.css";

import { getSites, getSiteKPIs } from "../../Sponsor/data/sponsorDataStore";

import KPICard from "../../../Components/dashboard/KPICard";
import { FiHome, FiUsers, FiTrendingUp, FiActivity } from "react-icons/fi";

function ClinicalSitesDashboard({ study }) {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [quickViewSite, setQuickViewSite] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedSite, setSelectedSite] = useState("All Sites");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [rankingPage, setRankingPage] = useState(1);
  const rankingRowsPerPage = 10;
  const [kpis, setKpis] = useState({
    total: 0,
    totalEnrolled: 0,
    avgPerformance: 0,
  });

  

  useEffect(() => {
    const refresh = () => {
      setSites(getSites());
      setKpis(getSiteKPIs());
    };

    refresh();

    window.addEventListener("sponsor-data-updated", refresh);

    return () => window.removeEventListener("sponsor-data-updated", refresh);
  }, []);

  // Whenever a filter changes, jump both tables back to page 1 so we
  // never end up stuck on an empty page after the result set shrinks.
  useEffect(() => {
    setCurrentPage(1);
    setRankingPage(1);
  }, [selectedCountry, selectedStatus, selectedSite, searchText, sortDirection]);

  const siteSummary = {
    totalSites: kpis.total,
    activeSites: sites.filter((site) => site.status === "Active").length,
    totalEnrolled: kpis.totalEnrolled,
    averagePerformance: kpis.avgPerformance,
  };

  const countries = [
    "All Countries",
    ...new Set(
      sites.map(
        (site) => site.country || site.region || site.location || "Unknown",
      ),
    ),
  ];

  const statuses = [
    "All Status",
    ...new Set(sites.map((site) => site.status || "Unknown")),
  ];

  const siteNames = [
  "All Sites",
  ...new Set(
    sites.map((site) => site.name || "Unknown")
  ),
];

  const filteredSites = sites.filter((site) => {
    const countryValue = site.country || site.region || site.location || "";

    const matchesCountry =
      selectedCountry === "All Countries" || countryValue === selectedCountry;

    const matchesStatus =
      selectedStatus === "All Status" || (site.status || "") === selectedStatus;
      
    const matchesSite =
      selectedSite === "All Sites" ||
      (site.name || "") === selectedSite;

    const search = searchText.toLowerCase();

    const matchesSearch =
  String(site.id || "")
    .toLowerCase()
    .includes(search) ||

  String(site.name || "")
    .toLowerCase()
    .includes(search) ||

  String(site.country || "")
    .toLowerCase()
    .includes(search) ||

  String(site.sponsor || "")
    .toLowerCase()
    .includes(search) ||

  String(site.status || "")
    .toLowerCase()
    .includes(search);

    // const matchesSearch =
    //   (site.id || "").toLowerCase().includes(search) ||
    //   (site.name || "").toLowerCase().includes(search) ||
    //   (site.account || site.sponsor || "").toLowerCase().includes(search);

    return matchesCountry && matchesStatus && matchesSite && matchesSearch;
  });

  const sortedSites = [...filteredSites].sort((a, b) => {
  const valueA = (a.name || "").toLowerCase();
  const valueB = (b.name || "").toLowerCase();

  if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
  if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;

  return 0;
});

//   const sortedSites = [...filteredSites].sort((a, b) => {
//     let valueA = a[sortField] ?? "";
//     let valueB = b[sortField] ?? "";

//     if (typeof valueA === "string") {
//       valueA = valueA.toLowerCase();
//       valueB = valueB.toLowerCase();
//     }

//     if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;

//     if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;

//     return 0;
//   });

  const totalPages = Math.max(1, Math.ceil(sortedSites.length / rowsPerPage));

  const paginatedSites = sortedSites.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  // Rank across ALL filtered sites first (not just the current
  // Site Performance page), then paginate the ranked list on its own.
  const rankedSites = [...filteredSites].sort(
    (a, b) =>
      (b.performance ?? b.enrollmentRate ?? 0) -
      (a.performance ?? a.enrollmentRate ?? 0),
  );

  const rankingTotalPages = Math.max(
    1,
    Math.ceil(rankedSites.length / rankingRowsPerPage),
  );

  const paginatedRankedSites = rankedSites.slice(
    (rankingPage - 1) * rankingRowsPerPage,
    rankingPage * rankingRowsPerPage,
  );

 return (
  <div className="clinical-sites-page">
      <h2>Clinical Sites</h2>

      <div className="studies-kpi-grid">
        <KPICard
          title="Total Sites"
          value={siteSummary.totalSites}
          subtitle="Configured Sites"
          icon={<FiHome />}
        />

        <KPICard
          title="Active Sites"
          value={siteSummary.activeSites}
          subtitle="Currently Active"
          icon={<FiActivity />}
        />

        <KPICard
          title="Total Enrolled"
          value={siteSummary.totalEnrolled}
          subtitle="Subjects"
          icon={<FiUsers />}
        />

        <KPICard
          title="Avg Performance"
          value={`${siteSummary.averagePerformance}%`}
          subtitle="Enrollment Rate"
          icon={<FiTrendingUp />}
        />
      </div>

      <div className="clinical-sites-card">
  <h3>Clinical Site Filters</h3>

  <div className="clinical-sites-toolbar">

    <input
      type="text"
      placeholder="Search Site ID, Site Name, Country, Sponsor or Status"
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
    />

    <select
      value={selectedCountry}
      onChange={(e) => setSelectedCountry(e.target.value)}
    >
      {countries.map((country) => (
        <option key={country} value={country}>
          {country}
        </option>
      ))}
    </select>

    <select
      value={selectedStatus}
      onChange={(e) => setSelectedStatus(e.target.value)}
    >
      {statuses.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>

    <select
      value={selectedSite}
      onChange={(e) => setSelectedSite(e.target.value)}
    >
      {siteNames.map((siteName) => (
        <option key={siteName} value={siteName}>
          {siteName}
        </option>
      ))}
    </select>

    <select
      value={sortDirection}
      onChange={(e) => setSortDirection(e.target.value)}
    >
      <option value="asc">Ascending</option>
      <option value="desc">Descending</option>
    </select>

  </div>
</div>

      <div className="clinical-sites-card">
        <h3>Site Performance</h3>

        {filteredSites.length === 0 ? (
          <p>No clinical sites match the selected filters.</p>
        ) : (
          <table className="site-table">
            <thead>
              <tr>
                <th>Site ID</th>
                <th>Site Name</th>
                <th>Country</th>
                <th>Sponsor</th>
                <th>Status</th>
                <th>Enrolled</th>
                <th>Target</th>
                <th>Performance</th>
                <th>Quick View</th>
                <th>Site Workspace</th>
              </tr>
            </thead>

            <tbody>
              {paginatedSites.map((site) => (
                <tr key={site.id}>
                  <td>{site.id}</td>

                  <td>{site.name}</td>

                  <td>{site.country || "—"}</td>

                  <td>{site.sponsor || study?.sponsor || "—"}</td>


                  {/* <td>{site.name}</td>

                  <td>
                    {site.account || site.sponsor || study?.sponsor || "—"}
                  </td> */}

                  <td>{site.status}</td>

                  <td>{site.enrolled ?? site.subjectsEnrolled ?? 0}</td>

                  <td>{site.target ?? site.targetSubjects ?? 0}</td>

                  <td>{site.performance ?? site.enrollmentRate ?? 0}%</td>
                  <td>
                  <button
                    type="button"
                    className="sponsor-btn-secondary"
                    onClick={() => setQuickViewSite(site)}
                  >
                    View
                  </button>
                  </td>
                  <td>
                   <button
                     type="button"
                     className="sponsor-btn-secondary"
                     onClick={() =>
                       navigate("/site-details", {
                         state: site,
                       })
                     }
                   >
                     Open
                   </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="clinical-sites-pagination">
       
          <button
            className="sponsor-btn-secondary"
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => page - 1)}
          >
            ← Previous
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="sponsor-btn-secondary"
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => page + 1)}
          >
            Next →
          </button>
        </div>
      </div>
      
      <div className="clinical-sites-card">
        <h3>Site Ranking</h3>

        {filteredSites.length === 0 ? (
          <p>No clinical sites available for ranking.</p>
        ) : (
          <table className="site-ranking-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Site Name</th>
                <th>Enrolled</th>
                <th>Performance</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRankedSites.map((site, index) => (
                <tr key={site.id}>
                  <td>{(rankingPage - 1) * rankingRowsPerPage + index + 1}</td>
                  <td>{site.name}</td>
                  <td>{site.enrolled ?? site.subjectsEnrolled ?? 0}</td>
                  <td>{site.performance ?? site.enrollmentRate ?? 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {filteredSites.length > 0 && (
          <div className="clinical-sites-pagination">
            <button
              className="sponsor-btn-secondary"
              type="button"
              disabled={rankingPage === 1}
              onClick={() => setRankingPage((page) => page - 1)}
            >
              ← Previous
            </button>

            <span>
              Page {rankingPage} of {rankingTotalPages}
            </span>

            <button
              className="sponsor-btn-secondary"
              type="button"
              disabled={rankingPage === rankingTotalPages}
              onClick={() => setRankingPage((page) => page + 1)}
            >
              Next →
            </button>
          </div>
        )}
        </div>
        <div className="clinical-sites-card">
            <h3>Interactive Map</h3>

            <div className="clinical-sites-map">
                Interactive Map component will be       integrated here.
            </div>
        </div>
       {quickViewSite && (
        <ClinicalSiteQuickView
          site={quickViewSite}
          study={study}
          onClose={() => setQuickViewSite(null)}
         />
      )}
    </div>
  );
}

export default ClinicalSitesDashboard;