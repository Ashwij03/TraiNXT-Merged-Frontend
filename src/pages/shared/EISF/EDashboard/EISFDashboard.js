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
  "1.0": ParticipatingSiteTeam,
  "2.0": ProjectManagement,
  "3.0": Protocol,
  "4.0": ParticipantConsent,
  "5.0": Regulatory,
  "6.0": Ethics,
  "7.0": ResearchGovernance,
  "8.0": SOP,
  "9.0": SiteIntiation,
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
export default function EISFDashboard() {
  const [selected, setSelected] = useState("1.0");

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
    <div
      key={child.id}
      className={`eisf-child-item ${
        selected === child.id ? "active" : ""
      }`}
      onClick={() => setSelected(item.id)}
    >
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