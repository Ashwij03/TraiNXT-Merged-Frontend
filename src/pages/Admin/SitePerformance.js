// UPDATED: Site Performance page with dynamic metrics from adminService

import DashboardLayout from "../../shared/components/dashboard/shared/DashboardLayout.css";
import DashboardCard from "../../shared/components/dashboard/shared/DashboardCard.css";
import DashboardBarChart from "../../shared/components/dashboard/shared/DashboardBarChart.js";
import DataTable from "../../components/dashboard/shared/DataTable";
import { getSitePerformance } from "../../services/adminService";
import { formatSiteLabel } from "../../shared/utils/siteDisplay.js";
import "../../shared/styles/AdminPage.css";

function SitePerformance() {
  const performance = getSitePerformance();

  const chartData = performance.map((site) => ({
    name: site.siteName,
    value: Number(site.enrolled || 0)
  }));

  return (
    <DashboardLayout>
      <div className="admin-page">
        <div className="admin-page-title">
          <h1>Site Performance</h1>
          <p>Enrollment, compliance, and operational metrics by site</p>
        </div>

        <DashboardCard title="Enrollment by Site">
          <DashboardBarChart data={chartData} />
        </DashboardCard>

        <div className="admin-table-section">
          <DataTable
            title="Performance Metrics"
            columns={[
              {
                key: "siteName",
                label: "Site",
                render: (_value, row) => formatSiteLabel(row) || "—"
              },
              { key: "enrolled", label: "Enrolled" },
              { key: "enrollmentTarget", label: "Target" },
              { key: "screeningRate", label: "Screening %" },
              { key: "visitCompliance", label: "Visit Compliance %" },
              { key: "commentResolutionDays", label: "Avg Comment Days" }
            ]}
            data={performance}
            pagination
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default SitePerformance;
