import { useState } from "react";
import DashboardLayout from "../../../Components/dashboard/DashboardLayout";
import DocumentFolderManager from "../../../Components/common/DocumentFolderManager";
import "./EISFHub.css";

const DOCUMENT_TABS = [
  { id: "eISF", label: "eISF" },
  { id: "icf", label: "ICF" },
  { id: "others", label: "Others" }
];

function EISFHub() {
  const [activeTab, setActiveTab] = useState("eISF");

  return (
    <DashboardLayout>
      <div className="eisf-hub">
        <div className="eisf-hub-header">
          <h1>eISF Document Center</h1>
          <p>Manage eISF, ICF, and other regulatory documents</p>
        </div>

        <div className="eisf-hub-tabs">
          {DOCUMENT_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <DocumentFolderManager
          sectionId={activeTab}
          contextKey="global"
          title={DOCUMENT_TABS.find((tab) => tab.id === activeTab)?.label}
        />
      </div>
    </DashboardLayout>
  );
}

export default EISFHub;
