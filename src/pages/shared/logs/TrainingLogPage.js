// UPDATED: Training Log page in DashboardLayout with dynamic localStorage data

import DashboardLayout from "../../../Components/dashboard/DashboardLayout";
import DataTable from "../../../Components/dashboard/DataTable";
import KPICard from "../../../Components/dashboard/KPICard";
import { getTrainingLogs } from "../../../services/adminService";
import { getAssignedSite } from "../../../services/roleService";
import "../../../pages/Admin/AdminPage.css";
import "../../../Components/TrainingLog.css";

function TrainingLogPage() {
  const logs = getTrainingLogs();
  const assignedSite = getAssignedSite();
  const totalDelegates = logs.reduce(
    (sum, item) => sum + (item.delegates?.length || 0),
    0
  );

  const tableData = logs.map((item) => ({
    training: item.training,
    linkedDuties: item.linkedDuties,
    delegates: `${item.delegates?.length || 0} delegate(s)`,
    site: item.site
  }));

  return (
    <DashboardLayout>
      <div className="admin-page">
        <div className="admin-page-title">
          <h1>Training Log</h1>
          <p>
            Site training records and delegate certifications
            {assignedSite ? ` — ${assignedSite}` : ""}
          </p>
        </div>

        <div className="admin-kpi-grid">
          <KPICard
            title="Training Items"
            value={logs.length}
            subtitle="Active Training Records"
            icon="📚"
          />
          <KPICard
            title="Delegates"
            value={totalDelegates}
            subtitle="Assigned Personnel"
            icon="👥"
          />
        </div>

        <div className="admin-table-section">
          <DataTable
            title="Training Registry"
            columns={[
              { key: "training", label: "Training" },
              { key: "linkedDuties", label: "Linked Duties" },
              { key: "delegates", label: "Delegates" },
              { key: "site", label: "Site" }
            ]}
            data={tableData}
          />
        </div>

        <div className="training-container" style={{ marginTop: 24 }}>
          {logs.map((item) => (
            <div key={item.id} className="admin-table-section">
              <h3 style={{ marginTop: 0 }}>{item.training}</h3>
              <p className="entry-text">{item.linkedDuties}</p>
              <div className="delegate-icons">
                {item.delegates?.map((delegate) => (
                  <div key={delegate.name} className="delegate-wrapper">
                    <div className="delegate-avatar">
                      <img
                        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(delegate.name)}`}
                        alt=""
                      />
                      {delegate.status !== "complete" && (
                        <span className="warning">
                          {delegate.status === "warning" ? "▲" : "!"}
                        </span>
                      )}
                    </div>
                    <div className="delegate-tooltip">
                      <h4>{delegate.name}</h4>
                      <p>{delegate.role}</p>
                      <span>{item.training} certification</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default TrainingLogPage;
