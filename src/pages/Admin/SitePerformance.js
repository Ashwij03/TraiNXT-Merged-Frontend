// UPDATED: Site Performance page with dynamic metrics from adminService

import DashboardLayout from "../../Components/dashboard/DashboardLayout";
import DashboardCard from "../../Components/dashboard/DashboardCard";
import DashboardBarChart from "../../Components/dashboard/DashboardBarChart";
import DataTable from "../../Components/dashboard/DataTable";
import { getSitePerformance } from "../../services/adminService";
import "./AdminPage.css";

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
              { key: "siteName", label: "Site" },
              { key: "enrolled", label: "Enrolled" },
              { key: "enrollmentTarget", label: "Target" },
              { key: "screeningRate", label: "Screening %" },
              { key: "visitCompliance", label: "Visit Compliance %" },
              { key: "commentResolutionDays", label: "Avg Comment Days" }
            ]}
            data={performance}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default SitePerformance;
