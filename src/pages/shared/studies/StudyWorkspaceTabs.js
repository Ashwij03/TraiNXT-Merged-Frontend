// import "./StudyWorkspaceTabs.css";

// // ===== START F1 CHANGES =====
// import { STUDY_WORKSPACE_TABS } from "./StudyWorkspaceTabsConfig";
// // ===== END F1 CHANGES =====

// import { getEffectiveRole, ROLES } from "../../../services/roleService";


// function StudyWorkspaceTabs({ activeTab, setActiveTab }) {
//   const effectiveRole = getEffectiveRole();
//    const visibleTabs = STUDY_WORKSPACE_TABS.filter((tab) => {
//     if (tab.id === "clinical-sites") {
//       return effectiveRole === ROLES.SPONSOR;
//     }

//     return true;
//   });

//   return (
//     <div className="workspace-header">
//       <div className="workspace-tabs">

//         {/* ===== START F1 CHANGES ===== */}
//         {STUDY_WORKSPACE_TABS.map((tab) => (
//           <button
//             key={tab.id}
//             className={
//               activeTab === tab.label
//                 ? "workspace-tab active"
//                 : "workspace-tab"
//             }
//             onClick={() => setActiveTab(tab.label)}
//             type="button"
//           >
//             {tab.label}
//           </button>
//         ))}
//         {/* ===== END F1 CHANGES ===== */}

//       </div>
//     </div>
//   );
// }

// export default StudyWorkspaceTabs;


import "./StudyWorkspaceTabs.css";

// ===== START F1 CHANGES =====
import { STUDY_WORKSPACE_TABS } from "./StudyWorkspaceTabsConfig";
// ===== END F1 CHANGES =====

import { getEffectiveRole, ROLES } from "../../../services/roleService";

function StudyWorkspaceTabs({ activeTab, setActiveTab }) {

  // ===== START G1 CHANGES =====
  const effectiveRole = getEffectiveRole();

  const visibleTabs = STUDY_WORKSPACE_TABS.filter((tab) => {
    if (tab.id === "clinical-sites") {
      return effectiveRole === ROLES.SPONSOR || effectiveRole === ROLES.ADMIN;
    }

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
