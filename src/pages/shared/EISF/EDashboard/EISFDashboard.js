import { useMemo, useState } from "react";
import "./EISFDashboard.css";
import EISFMenuConfig from "../Constants/EISFMenuConfig";

// Pages
import ParticipatingSiteTeam from "../ParticipatingSiteTeam/ParticipatingSiteTeam";
import ProjectManagement from "../ProjectManagement/ProjectManagement";
import Protocol from "../Protocol/Protocol";
import ParticipantConsent from "../ParticipantConsent/ParticipantConsent";
import Regulatory from "../Regulatory/Regulatory";
import Ethics from "../Ethics/Ethics";
import ResearchGovernance from "../ResearchGovernance/ResearchGovernance";
import SOP from "../Sop/Sop";
import SiteInitiation from "../SiteInitiation/SiteInitiation";
import SiteTraining from "../SiteTraining/SiteTraining";
import Recruitment from "../Recruitment/Recruitment";
import Randomization from "../Randomization/Randomization";
import DataManagement from "../DataManagement/DataManagement";
import Safety from "../Safety/Safety";
import Monitoring from "../Monitoring/Monitoring";
import Laboratory from "../Laboratory/Laboratory";
import Supplies from "../Supplies/Supplies";
import Legal from "../Legal/Legal";
import Finance from "../Finance/Finance";
import OtherCommunication from "../OtherCommunication/OtherCommunication";
import Archiving from "../Archiving/Archiving";
import InvestigationalProduct from "../InvestigationalProduct/InvestigationalProduct";

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
  const [expanded, setExpanded] = useState({});

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
    setExpanded((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
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
              >
                <button
                  type="button"
                  className="eisf-menu-label"
                  onClick={() => handleModuleChange(item.id)}
                >
                  <span className="eisf-module-number">{item.id}</span>
                  <span>{item.title}</span>
                </button>

                {item.children?.length > 0 && (
                  <button
                    type="button"
                    className="eisf-expand-btn"
                    onClick={() => toggleModule(item.id)}
                    aria-label={`${expanded[item.id] ? "Collapse" : "Expand"} ${item.title}`}
                  >
                    {expanded[item.id] ? "−" : "+"}
                  </button>
                )}
              </div>

              {expanded[item.id] &&
                item.children?.map((child) => (
                  <button
                    type="button"
                    key={child.id}
                    className={`eisf-child-item ${
                      selected === child.id ? "active" : ""
                    }`}
                    onClick={() => handleSectionChange(child.id)}
                  >
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
