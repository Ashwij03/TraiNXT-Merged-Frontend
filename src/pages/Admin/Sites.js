// UPDATED: Dynamic sites page wired to adminService localStorage data

import DashboardLayout from "../../Components/dashboard/DashboardLayout";
import KPICard from "../../Components/dashboard/KPICard";
import DataTable from "../../Components/dashboard/DataTable";
import { getSites } from "../../services/adminService";
import "./AdminPage.css";

function Sites() {
  const sites = getSites();
  const activeSites = sites.filter((site) => site.status === "Active").length;
  const totalEnrolled = sites.reduce(
    (sum, site) => sum + Number(site.subjectsEnrolled || 0),
    0
  );

  return (
    <DashboardLayout>
      <div className="admin-page">
        <div className="admin-page-title">
          <h1>Sites</h1>
          <p>Operational site network overview</p>
        </div>

        <div className="admin-kpi-grid">
          <KPICard
            title="Total Sites"
            value={sites.length}
            subtitle="Configured Sites"
            icon="🏥"
          />
          <KPICard
            title="Active"
            value={activeSites}
            subtitle="Currently Active"
            icon="✅"
          />
          <KPICard
            title="Enrolled"
            value={totalEnrolled}
            subtitle="Subjects Across Sites"
            icon="👥"
          />
        </div>

        <div className="admin-table-section">
          <DataTable
            title="Site Directory"
            columns={[
              { key: "id", label: "Site ID" },
              { key: "name", label: "Name" },
              { key: "location", label: "Location" },
              { key: "pi", label: "PI" },
              { key: "subjectsEnrolled", label: "Enrolled" },
              { key: "status", label: "Status" }
            ]}
            data={sites}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Sites;
