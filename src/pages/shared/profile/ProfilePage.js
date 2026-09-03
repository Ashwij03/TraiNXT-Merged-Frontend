import DashboardLayout from "../../../shared/components/dashboard/shared/DashboardLayout.css";
import ProfileSettingsSection from "../../../shared/pages/profile/ProfileSettingsSection.js";
import "../../../shared/styles/AdminPage.css";

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
