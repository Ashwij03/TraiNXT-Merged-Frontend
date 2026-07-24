import "./StudyWorkspaceTabs.css";

// ===== START F1 CHANGES =====
import { STUDY_WORKSPACE_TABS } from "./StudyWorkspaceTabsConfig";
// ===== END F1 CHANGES =====

import { getEffectiveRole, ROLES, hasPermission, PERMISSIONS } from "../../../services/roleService";

function StudyWorkspaceTabs({ activeTab, setActiveTab }) {

  // ===== START G1 CHANGES =====
  const effectiveRole = getEffectiveRole();

  const visibleTabs = STUDY_WORKSPACE_TABS.filter((tab) => {
    if (tab.id === "clinical-sites") {
      return effectiveRole === ROLES.SPONSOR || effectiveRole === ROLES.ADMIN;
    }

    // ===== START D2 PART 1 CHANGES =====
    // Role-based Activity visibility: driven by the same rolePermissions
    // map (VIEW_SITE_ACTIVITIES) every other permission check in the app
    // reads from, instead of a hardcoded role list, so a future change to
    // that map is reflected here automatically.
    if (tab.id === "activity") {
      return hasPermission(PERMISSIONS.VIEW_SITE_ACTIVITIES);
    }
    // ===== END D2 PART 1 CHANGES =====

    return true;
  });
  // ===== END G1 CHANGES =====

  return (
    <div className="workspace-header">
      <div className="workspace-tabs">

        {/* ===== START F1 CHANGES ===== */}
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            className={
              activeTab === tab.label
                ? "workspace-tab active"
                : "workspace-tab"
            }
            onClick={() => setActiveTab(tab.label)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
        {/* ===== END F1 CHANGES ===== */}

      </div>
    </div>
  );
}

export default StudyWorkspaceTabs;
