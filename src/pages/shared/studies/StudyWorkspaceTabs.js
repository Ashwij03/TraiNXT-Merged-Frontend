import "./StudyWorkspaceTabs.css";

// ===== START F1 CHANGES =====
import { STUDY_WORKSPACE_TABS } from "./StudyWorkspaceTabsConfig";
// ===== END F1 CHANGES =====


function StudyWorkspaceTabs({ activeTab, setActiveTab }) {
  return (
    <div className="workspace-header">
      <div className="workspace-tabs">

        {/* ===== START F1 CHANGES ===== */}
        {STUDY_WORKSPACE_TABS.map((tab) => (
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


// function StudyWorkspaceTabs({ activeTab, setActiveTab }) {
//   const tabs = [
//     "Overview",
//     "Subjects",
//     "Planning",
//     "Visit Plan",
//     "eISF",
//     "Regulatory",
//     "Reports",
//     "Study Files",
//     "Logs",
//     "Financials",
//     "Others"
//   ];

//   return (
//     <div className="workspace-header">
//       <div className="workspace-tabs">

//         {tabs.map((tab) => (
//           <button
//             key={tab}
//             className={
//               activeTab === tab ? "workspace-tab active" : "workspace-tab"
//             }
//             onClick={() => setActiveTab(tab)}
//             type="button"
//           >
//             {tab}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default StudyWorkspaceTabs;
