import { useMemo, useState } from "react";
import "./EISFDashboard.js";
import EISFMenuConfig from "../../../../shared/pages/EISF/Constants/EISFMenuConfig.js";

// Pages
import ParticipatingSiteTeam from "../../../../shared/pages/EISF/ParticipatingSiteTeam/ParticipatingSiteTeam.css";
import ProjectManagement from "../../../../shared/pages/EISF/ProjectManagement/ProjectManagement.css";
import Protocol from "../../../../shared/pages/EISF/Protocol/Protocol.css";
import ParticipantConsent from "../../../../shared/pages/EISF/ParticipantConsent/ParticipantConsent.css";
import Regulatory from "../../../Admin/Regulatory.js";
import Ethics from "../../../../shared/pages/EISF/Ethics/Ethics.css";
import ResearchGovernance from "../../../../shared/pages/EISF/ResearchGovernance/ResearchGovernance.css";
import SOP from "../../../../shared/pages/EISF/Sop/Sop.css";
import SiteInitiation from "../SiteInitiation/SiteInitiation";
import SiteTraining from "../../../../shared/pages/EISF/SiteTraining/SiteTraining.css";
import Recruitment from "../../../../Admin/pages/Recruitment.js";
import Randomization from "../../../../shared/pages/EISF/Randomization/Randomization.css";
import DataManagement from "../../../../shared/pages/EISF/DataManagement/DataManagement.css";
import Safety from "../../../../shared/pages/EISF/Safety/Safety.css";
import Monitoring from "../../../CRO/Monitoring.js";
import Laboratory from "../../../../shared/pages/EISF/Laboratory/Laboratory.css";
import Supplies from "../../../../shared/pages/EISF/Supplies/Supplies.css";
import Legal from "../../../../shared/pages/EISF/Legal/Legal.css";
import Finance from "../../../../shared/pages/EISF/Finance/Finance.css";
import OtherCommunication from "../../../../shared/pages/EISF/OtherCommunication/OtherCommunication.css";
import Archiving from "../../../../shared/pages/EISF/Archiving/Archiving.css";
import InvestigationalProduct from "../../../../shared/pages/EISF/InvestigationalProduct/InvestigationalProduct.css";

const pageMap = {
  "1.0": ParticipatingSiteTeam,
  "2.0": ProjectManagement,
  "3.0": Protocol,
  "4.0": ParticipantConsent,
  "5.0": Regulatory,
  "6.0": Ethics,
  "7.0": ResearchGovernance,
  "8.0": SOP,
  "9.0": SiteInitiation,
  "10.0": SiteTraining,
  "11.0": Recruitment,
  "12.0": Randomization,
  "13.0": DataManagement,
  "14.0": Safety,
  "15.0": Monitoring,
  "16.0": Laboratory,
  "17.0": Supplies,
  "18.0": Legal,
  "19.0": Finance,
  "20.0": OtherCommunication,
  "21.0": Archiving,
  "22.0": InvestigationalProduct,
};
function getParentSectionId(id) {
  if (!id) return "1.0";

  const [sectionNumber] = id.split(".");

  return `${sectionNumber}.0`;
}

export default function EISFDashboard({ studyCode } = {}) {
  const [selected, setSelected] = useState("1.0");
  const [expandedModuleId, setExpandedModuleId] = useState(null);

  const selectedModuleId = useMemo(
    () => getParentSectionId(selected),
    [selected]
  );

  const CurrentPage = useMemo(() => {
    return pageMap[selectedModuleId] || ParticipatingSiteTeam;
  }, [selectedModuleId]);
  const handleModuleChange = (moduleId) => {
    setSelected(moduleId);
  };

  const handleSectionChange = (sectionId) => {
    setSelected(sectionId);
  };

  const toggleModule = (moduleId) => {
    setExpandedModuleId((currentModuleId) =>
      currentModuleId === moduleId ? null : moduleId
    );
  };

  return (
    <div className="eisf-layout eisf-layout-reference">
      <aside className="eisf-sidebar">
        <div className="eisf-sidebar-title">eISF Modules</div>

        <div className="eisf-sidebar-list">
          {EISFMenuConfig.map((item) => (
            <div className="eisf-sidebar-group" key={item.id}>
              <div
                className={`eisf-menu-item ${
                  selectedModuleId === item.id ? "active" : ""
                }`}

                <button
                  type="button"
                  className="eisf-menu-label"
                  onClick={() => handleModuleChange(item.id)}

                  <span className="eisf-module-number">{item.id}</span>
                  <span>{item.title}</span>
                </button>

                {item.children?.length > 0 && (
                  <button
                    type="button"
                    className="eisf-expand-btn"
                    onClick={() => toggleModule(item.id)}
                    aria-label={`${expandedModuleId === item.id ? "Collapse" : "Expand"} ${item.title}`}

                    {expandedModuleId === item.id ? "−" : "+"}
                  </button>
                )}
              </div>

              {expandedModuleId === item.id &&
                item.children?.map((child) => (
                  <button
                    type="button"
                    key={child.id}
                    className={`eisf-child-item ${
                      selected === child.id ? "active" : ""
                    }`}
                    onClick={() => handleSectionChange(child.id)}

                    {child.id} {child.title}
                  </button>
                ))}
            </div>
          ))}
        </div>
      </aside>

      <main className="eisf-content">
        <CurrentPage
          studyCode={studyCode}
          activeSectionId={selected === selectedModuleId ? undefined : selected}
          selectedModuleId={selectedModuleId}
          onModuleChange={handleModuleChange}
          onSectionChange={handleSectionChange}
        />
      </main>
    </div>
  );
}
