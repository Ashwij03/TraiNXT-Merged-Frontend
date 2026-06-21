// UPDATED: Admin regulatory overview page (not study workspace regulatory)

import DashboardLayout from "../../Components/dashboard/DashboardLayout";
import KPICard from "../../Components/dashboard/KPICard";
import AlertsPanel from "../../Components/dashboard/AlertsPanel";
import DataTable from "../../Components/dashboard/DataTable";
import { getRegulatoryDocs } from "../../services/adminService";
import "./AdminPage.css";

function Regulatory() {
  const documents = getRegulatoryDocs();
  const validDocs = documents.filter((doc) => doc.status === "Valid").length;
  const expiringDocs = documents.filter(
    (doc) => doc.status === "Expiring Soon"
  ).length;

  return (
    <DashboardLayout>
      <div className="admin-page">
        <div className="admin-page-title">
          <h1>Regulatory</h1>
          <p>Site-level regulatory document compliance overview</p>
        </div>

        <div className="admin-kpi-grid">
          <KPICard
            title="Documents"
            value={documents.length}
            subtitle="Tracked Items"
            icon="📄"
          />
          <KPICard
            title="Valid"
            value={validDocs}
            subtitle="In Compliance"
            icon="✅"
          />
          <KPICard
            title="Expiring"
            value={expiringDocs}
            subtitle="Needs Attention"
            icon="⏰"
          />
        </div>

        <AlertsPanel
          title="Regulatory Alerts"
          alerts={documents
            .filter((doc) => doc.status !== "Valid")
            .map((doc) => ({
              type: doc.status === "Expiring Soon" ? "warning" : "info",
              title: doc.document,
              message: `${doc.site} • Expires ${doc.expiryDate}`
            }))}
        />

        <div className="admin-table-section">
          <DataTable
            title="Regulatory Documents"
            columns={[
              { key: "id", label: "ID" },
              { key: "document", label: "Document" },
              { key: "site", label: "Site" },
              { key: "expiryDate", label: "Expiry Date" },
              { key: "status", label: "Status" }
            ]}
            data={documents}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Regulatory;
