import DashboardLayout from "../../components/dashboard/shared/DashboardLayout";
import ProfileSettingsSection from "./ProfileSettingsSection";
import "../../styles/AdminPage.css";

function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="admin-page">
        <div className="admin-page-title">
          <h1>User Profile</h1>
          <p>Manage your personal details and profile photo</p>
        </div>
        <ProfileSettingsSection />
      </div>
    </DashboardLayout>
  );
}

export default ProfilePage;
