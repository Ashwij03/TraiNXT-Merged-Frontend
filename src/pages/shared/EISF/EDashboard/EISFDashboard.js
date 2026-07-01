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
import SOP from "../SOP/Sop";
import SiteIntiation from "../SiteIntiation/SiteIntiation";
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
  "participating-site-team": ParticipatingSiteTeam,
  "project-management": ProjectManagement,
  protocol: Protocol,
  "participant-consent": ParticipantConsent,
  regulatory: Regulatory,
  ethics: Ethics,
  "research-governance": ResearchGovernance,
  sop: SOP,
  "site-intiation": SiteIntiation,
  "site-training": SiteTraining,
  recruitment: Recruitment,
  randomization: Randomization,
  "data-management": DataManagement,
  safety: Safety,
  monitoring: Monitoring,
  laboratory: Laboratory,
  supplies: Supplies,
  legal: Legal,
  finance: Finance,
  "other-communication": OtherCommunication,
  archiving: Archiving,
  "investigational-product": InvestigationalProduct
};

export default function EISFDashboard() {
  const [selected, setSelected] = useState("participating-site-team");

  const [expanded, setExpanded] = useState(() => {
    const state = {};

    EISFMenuConfig.forEach((item) => {
      if (item.children?.length) {
        state[item.id] = false;
      }
    });

    return state;
  });

 const CurrentPage = useMemo(() => {
    return pageMap[selected] || ParticipatingSiteTeam;
  }, [selected]);
  const toggle = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="eisf-layout">
      <aside className="eisf-sidebar">
        <div className="eisf-sidebar-title">eISF</div>

        {EISFMenuConfig.map((item) => (
          <div key={item.id}>
            <div
              className={`eisf-menu-item ${
                selected === item.id ? "active" : ""
              }`}
            >
              <div
                className="eisf-menu-label"
                onClick={() => setSelected(item.id)}
              >
                {item.title}
              </div>

              {item.children?.length > 0 && (
                <button
                  type="button"
                  className="eisf-expand-btn"
                  onClick={() => toggle(item.id)}
                >
                  {expanded[item.id] ? "−" : "+"}
                </button>
              )}
            </div>

            {expanded[item.id] &&
              item.children?.map((child) => (
                <div key={child.id} className="eisf-child-item">
                  {child.title}
                </div>
              ))}
          </div>
        ))}
      </aside>

      <main className="eisf-content">
        <CurrentPage />
      </main>
    </div>
  );
}