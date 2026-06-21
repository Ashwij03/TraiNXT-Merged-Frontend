import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FaHome,
  FaBookOpen,
  FaChartBar,
  FaComments,
  FaUserFriends,
  FaUniversity,
  FaChartPie,
  FaBell,
  FaCog,
} from "react-icons/fa";
import "./PISidebar.css";
import { getSidebarMenuData } from "./piDashboardService";
import TriaNXTLogo from "../../Components/common/TriaNXTLogo";

const ICON_MAP = {
  home: FaHome,
  chart: FaChartBar,
  comments: FaComments,
  users: FaUserFriends,
  university: FaUniversity,
  pie: FaChartPie,
  bell: FaBell,
  cog: FaCog,
};

function PISidebar({
  selectedPage,
  setSelectedPage,
  subjects = [],
  isOpen = true,
  onClose,
}) {
  const location = useLocation();
  const [openStudies, setOpenStudies] = useState(false);
  const [openBinder, setOpenBinder] = useState(false);
  const [openSubjects, setOpenSubjects] = useState(false);
  const [openSubject, setOpenSubject] = useState(null);
  const menuData = getSidebarMenuData();

  useEffect(() => {
    const openStudiesHandler = () => setOpenStudies(true);
    window.addEventListener("pi-navigate-studies", openStudiesHandler);
    return () =>
      window.removeEventListener("pi-navigate-studies", openStudiesHandler);
  }, []);

  const handleStudiesClick = () => {
    const isStudiesRoute =
      location.pathname === "/studies" ||
      location.pathname.startsWith("/study-dashboard") ||
      location.pathname.startsWith("/study/");

    if (isStudiesRoute && openStudies) {
      setOpenStudies(false);
      return;
    }

    setOpenStudies(true);

    if (!isStudiesRoute) {
      setSelectedPage("studies");
    }
  };

  const handleMenuClick = (page) => {
    setSelectedPage(page);
    if (onClose) onClose();
  };

  const getMenuClass = (page) =>
    `menu-item${selectedPage === page ? " active-menu" : ""}`;

  const mainSections = menuData.sections.filter((s) => s.id !== "dashboard");
  const dashboardSection = menuData.sections.find((s) => s.id === "dashboard");

  return (
    <>
      <div
        className={`pi-sidebar-overlay${isOpen ? " visible" : ""}`}
        onClick={onClose}
      />

      <div className={`sidebar pi-sidebar${isOpen ? " open" : ""}`}>
        <TriaNXTLogo
          size="sidebar"
          className="pi-sidebar-brand"
          onClick={() => handleMenuClick("dashboard")}
        />

        {dashboardSection && (
          <div
            className={getMenuClass(dashboardSection.page)}
            onClick={() => handleMenuClick(dashboardSection.page)}
          >
            <FaHome />
            <span>{dashboardSection.label}</span>
          </div>
        )}

        {/* STUDIES — static section (excluded from dynamic changes per requirements) */}
        <div
          className={`menu-item studies-menu${
  selectedPage === "studies" ? " active-menu" : ""
}`}
          onClick={handleStudiesClick}
        >
          <FaBookOpen />
          <span>Studies</span>
        </div>

        {openStudies && (
          <div className="submenu-container">
            <div
              className="submenu-title"
              onClick={() => setOpenBinder(!openBinder)}
            >
              Study Binder
            </div>

            <div
              className={`submenu-title${
                selectedPage === "comments" ? " active-menu" : ""
              }`}
              onClick={() => handleMenuClick("comments")}
            >
              Comments
            </div>

            {openBinder && (
              <>
                <div
                  className="submenu-title"
                  onClick={() => setOpenSubjects(!openSubjects)}
                >
                  Subjects ({subjects.length || 4})
                </div>

                {openSubjects && (
                  <>
                    <div
                      className="subject-item"
                      onClick={() =>
                        setOpenSubject(
                          openSubject === "SUB-001" ? null : "SUB-001"
                        )
                      }
                    >
                      SUB-001
                    </div>

                    {openSubject === "SUB-001" && (
                      <div className="submenu-level2">
                        <div
                          className="submenu-item"
                          onClick={() => handleMenuClick("screening")}
                        >
                          Screening
                        </div>
                        <div
                          className="submenu-item"
                          onClick={() => handleMenuClick("enrollment")}
                        >
                          Enrollment
                        </div>
                        <div
                          className="submenu-item"
                          onClick={() => handleMenuClick("visits")}
                        >
                          Visits
                        </div>
                        <div
                          className="submenu-item"
                          onClick={() => handleMenuClick("progress-notes")}
                        >
                          Progress Notes
                        </div>
                        <div
                          className="submenu-item"
                          onClick={() => handleMenuClick("comments")}
                        >
                          Comments
                        </div>
                        <div
                          className="submenu-item"
                          onClick={() => handleMenuClick("files")}
                        >
                          Files
                        </div>
                        <div
                          className="submenu-item"
                          onClick={() => handleMenuClick("logs")}
                        >
                          Logs
                        </div>
                      </div>
                    )}

                    <div className="subject-item">SUB-002</div>
                    <div className="subject-item">SUB-003</div>
                    <div className="subject-item">SUB-004</div>
                  </>
                )}

                <div
                  className="submenu-title"
                  onClick={() => handleMenuClick("eisf")}
                >
                  eISF
                </div>
                <div
                  className="submenu-title"
                  onClick={() => handleMenuClick("icf")}
                >
                  ICF
                </div>
                <div
                  className="submenu-title"
                  onClick={() => handleMenuClick("study-folder")}
                >
                  Study Folder
                </div>
              </>
            )}
          </div>
        )}

        {/* UPDATED: Dynamic sidebar sections (excluding studies) */}
        {mainSections.map((section) => {
          const Icon = ICON_MAP[section.icon] || FaChartBar;
          return (
            <div
              key={section.id}
              className={getMenuClass(section.page)}
              onClick={() => handleMenuClick(section.page)}
            >
              <Icon />
              <span>{section.label}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default PISidebar;
