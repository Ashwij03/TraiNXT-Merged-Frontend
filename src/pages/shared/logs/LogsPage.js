// UPDATED: Logs hub — links to training and delegation logs in dashboard layout

import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../Components/dashboard/DashboardLayout";
import DashboardCard from "../../../Components/dashboard/DashboardCard";
import QuickActions from "../../../Components/dashboard/QuickActions";
import DocumentFolderManager from "../../../Components/common/DocumentFolderManager";
import { getTrainingLogs, getDelegationLogs } from "../../../services/adminService";
import { filterBySite, getAssignedSite, isAdmin } from "../../../services/roleService";
import "../../../pages/Admin/AdminPage.css";

function LogsPage() {
  const navigate = useNavigate();
  const assignedSite = getAssignedSite();
  const trainingCount = filterBySite(getTrainingLogs(), "site").length;
  const delegationCount = filterBySite(getDelegationLogs(), "site").length;

  return (
    <DashboardLayout>
      <div className="admin-page audit-logs-page">
        <div className="admin-page-title">
          <h1>Logs</h1>
          <p>
            {isAdmin()
              ? "Training and delegation compliance logs"
              : `Site logs for ${assignedSite}`}
          </p>
        </div>

        <DocumentFolderManager
          sectionId="logs"
          contextKey="global"
          title="Logs"
        />

        <QuickActions
          actions={[
            {
              icon: "📚",
              label: `Training Log (${trainingCount})`,
              path: "/logs/training"
            },
            {
              icon: "👥",
              label: `Delegation Log (${delegationCount})`,
              path: "/logs/delegation"
            }
          ]}
        />

        <div className="dashboard-grid-2">
          <DashboardCard title="Training Log">
            <p>{trainingCount} training records on file.</p>
            <button type="button" onClick={() => navigate("/logs/training")}>
              Open Training Log
            </button>
          </DashboardCard>

          <DashboardCard title="Delegation Log">
            <p>{delegationCount} delegation records on file.</p>
            <button type="button" onClick={() => navigate("/logs/delegation")}>
              Open Delegation Log
            </button>
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default LogsPage;
