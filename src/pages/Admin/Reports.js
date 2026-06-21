// UPDATED: Reports page with dynamic report catalog from adminService

import DashboardLayout from "../../Components/dashboard/DashboardLayout";
import KPICard from "../../Components/dashboard/KPICard";
import DataTable from "../../Components/dashboard/DataTable";
import { getReports } from "../../services/adminService";
import "./AdminPage.css";

function Reports() {
  const reports = getReports();
  const readyReports = reports.filter((report) => report.status === "Ready").length;

  return (
    <DashboardLayout>
      <div className="admin-page">
        <div className="admin-page-title">
          <h1>Reports</h1>
          <p>Available operational and monitoring reports</p>
        </div>

        <div className="admin-kpi-grid">
          <KPICard
            title="Total"
            value={reports.length}
            subtitle="Report Templates"
            icon="📈"
          />
          <KPICard
            title="Ready"
            value={readyReports}
            subtitle="Available Now"
            icon="✅"
          />
        </div>

        <div className="admin-table-section">
          <DataTable
            title="Report Catalog"
            columns={[
              { key: "id", label: "Report ID" },
              { key: "name", label: "Name" },
              { key: "category", label: "Category" },
              { key: "lastGenerated", label: "Last Generated" },
              { key: "status", label: "Status" }
            ]}
            data={reports}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Reports;
