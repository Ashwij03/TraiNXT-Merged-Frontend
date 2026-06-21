// UPDATED: Profile page with photo upload and expanded account fields

import { useMemo, useState } from "react";
import DashboardLayout from "../../../Components/dashboard/DashboardLayout";
import DashboardCard from "../../../Components/dashboard/DashboardCard";
import {
  getAssignedSite,
  getCurrentUser,
  getUserProfile,
  isAdmin,
  saveUserProfile
} from "../../../services/roleService";
import { PROFILE_PHOTO_EVENT } from "../../../constants/profileEvents";
import "../../../pages/Admin/AdminPage.css";

function ProfilePage() {
  const currentUser = getCurrentUser();
  const [profile, setProfile] = useState(getUserProfile());
  const [savedMessage, setSavedMessage] = useState("");
  const canEditSite = isAdmin(currentUser);

  const avatarInitial = useMemo(
    () =>
      profile.firstName?.charAt(0)?.toUpperCase() ||
      currentUser?.name?.charAt(0)?.toUpperCase() ||
      "U",
    [profile.firstName, currentUser?.name]
  );

  const handleChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      handleChange("profilePhoto", reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    handleChange("profilePhoto", "");
  };

  const handleSave = (event) => {
    event.preventDefault();
    saveUserProfile(profile, currentUser);
    window.dispatchEvent(new CustomEvent(PROFILE_PHOTO_EVENT));
    setSavedMessage("Profile updated successfully.");
  };

  return (
    <DashboardLayout>
      <div className="admin-page">
        <div className="admin-page-title">
          <h1>User Profile</h1>
          <p>
            Manage your personal details and profile photo
            {!isAdmin(currentUser) && getAssignedSite()
              ? ` — ${getAssignedSite()}`
              : ""}
          </p>
        </div>

        <DashboardCard title="Profile Photo">
          <div className="profile-avatar-row">
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt="Profile"
                className="profile-avatar-image"
              />
            ) : (
              <div className="profile-avatar-circle">{avatarInitial}</div>
            )}

            <div className="profile-photo-actions">
              <label className="profile-photo-upload">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </label>
              {profile.profilePhoto && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleRemovePhoto}
                >
                  Remove Photo
                </button>
              )}
              <p className="profile-photo-help">
                JPG or PNG recommended. Your photo appears in the header avatar.
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Profile Details">
          <form className="admin-settings-form" onSubmit={handleSave}>
            <div className="admin-form-grid">
              <label>
                First Name
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(event) =>
                    handleChange("firstName", event.target.value)
                  }
                />
              </label>

              <label>
                Last Name
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(event) =>
                    handleChange("lastName", event.target.value)
                  }
                />
              </label>

              <label>
                Middle Name
                <input
                  type="text"
                  value={profile.middleName}
                  onChange={(event) =>
                    handleChange("middleName", event.target.value)
                  }
                />
              </label>

              <label>
                Credentials
                <input
                  type="text"
                  value={profile.credentials}
                  onChange={(event) =>
                    handleChange("credentials", event.target.value)
                  }
                />
              </label>

              <label>
                Job Title
                <input
                  type="text"
                  value={profile.jobTitle}
                  onChange={(event) =>
                    handleChange("jobTitle", event.target.value)
                  }
                />
              </label>

              <label>
                Department
                <input
                  type="text"
                  value={profile.department}
                  onChange={(event) =>
                    handleChange("department", event.target.value)
                  }
                />
              </label>

              <label>
                Email Address
                <input type="email" value={profile.email} readOnly />
              </label>

              <label>
                Role
                <input type="text" value={profile.role} readOnly />
              </label>

              <label>
                Assigned Site
                <input
                  type="text"
                  value={profile.assignedSite}
                  readOnly={!canEditSite}
                  onChange={(event) =>
                    handleChange("assignedSite", event.target.value)
                  }
                />
              </label>

              <label>
                Office Phone
                <input
                  type="text"
                  value={profile.officePhone}
                  onChange={(event) =>
                    handleChange("officePhone", event.target.value)
                  }
                />
              </label>

              <label>
                Cell Phone
                <input
                  type="text"
                  value={profile.cellPhone}
                  onChange={(event) =>
                    handleChange("cellPhone", event.target.value)
                  }
                />
              </label>

              <label>
                Fax
                <input
                  type="text"
                  value={profile.fax}
                  onChange={(event) =>
                    handleChange("fax", event.target.value)
                  }
                />
              </label>

              <label>
                Professional Headline
                <input
                  type="text"
                  value={profile.headline}
                  onChange={(event) =>
                    handleChange("headline", event.target.value)
                  }
                />
              </label>

              <label>
                Timezone
                <select
                  value={profile.timezone}
                  onChange={(event) =>
                    handleChange("timezone", event.target.value)
                  }
                >
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                </select>
              </label>

              <label>
                Preferred Language
                <select
                  value={profile.preferredLanguage}
                  onChange={(event) =>
                    handleChange("preferredLanguage", event.target.value)
                  }
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Tamil">Tamil</option>
                </select>
              </label>
            </div>

            <label>
              Bio
              <textarea
                rows={4}
                value={profile.bio}
                onChange={(event) => handleChange("bio", event.target.value)}
                placeholder="Brief professional summary"
              />
            </label>

            <button type="submit">Save Profile</button>

            {savedMessage && (
              <p style={{ color: "#059669", margin: 0 }}>{savedMessage}</p>
            )}
          </form>
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
}

export default ProfilePage;
