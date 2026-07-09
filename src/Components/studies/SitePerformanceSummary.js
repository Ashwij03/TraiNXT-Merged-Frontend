import { FiTrendingUp } from "react-icons/fi";

function SitePerformanceSummary({ records }) {
  const list = Array.isArray(records) ? records : [];

  return (
    <div className="study-widget-card">
      <div className="study-widget-header">
        <FiTrendingUp />
        <h3>Site Performance Summary</h3>
      </div>
      {list.length === 0 ? (
        <p className="study-widget-empty">No site performance data for this study</p>
      ) : (
        <div className="study-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Site</th>
                <th>Enrolled</th>
                <th>Screening</th>
                <th>Compliance</th>
              </tr>
            </thead>
            <tbody>
              {list.map((site) => (
                <tr key={site.siteId || site.siteName || site.site}>
                  <td>{site.siteName || site.site || site.name || "—"}</td>
                  <td>
                    {site.enrolled ?? site.subjectsEnrolled ?? "—"}/
                    {site.enrollmentTarget ?? site.targetSubjects ?? "—"}
                  </td>
                  <td>{site.screeningRate != null ? `${site.screeningRate}%` : "—"}</td>
                  <td>
                    {site.visitCompliance != null
                      ? `${site.visitCompliance}%`
                      : site.compliance ?? "—"}
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

export default SitePerformanceSummary;
