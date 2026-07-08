import DashboardLayout from "../../../Components/dashboard/DashboardLayout";
import SecuritySettingsSection from "./SecuritySettingsSection";
import "../../../pages/Admin/AdminPage.css";

function SecurityPage() {
  return (
    <DashboardLayout>
      <div className="admin-page">
        <div className="admin-page-title">
          <h1>Security</h1>
          <p>Manage password, authentication, and active sessions</p>
        </div>
        <SecuritySettingsSection />
      </div>
    </DashboardLayout>
  );
}

export default SecurityPage;
