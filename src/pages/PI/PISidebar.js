import React from "react";
import { useLocation } from "react-router-dom";
import {
  FaHome,
  FaBookOpen,
  FaChartBar,
  FaUserFriends,
  FaUniversity,
  FaChartPie,
  FaBell,
  FaCog,
} from "react-icons/fa";
import "./PISidebar.css";
import { getSidebarMenuData } from "./piDashboardService";
import TriaNXTLogo from "../../Components/common/TriaNXTLogo";
import RoleStudiesSidebarTree from "../../Components/common/RoleStudiesSidebarTree";
import { useRoleStudiesSidebar } from "../../hooks/useRoleStudiesSidebar";

const ICON_MAP = {
  home: FaHome,
  chart: FaChartBar,
  users: FaUserFriends,
  university: FaUniversity,
  pie: FaChartPie,
  bell: FaBell,
  cog: FaCog,
};

function PISidebar({
  selectedPage,
  setSelectedPage,
  isOpen = true,
  onClose,
}) {
  const location = useLocation();
  const menuData = getSidebarMenuData();
  const {
    studyCount,
    studiesOpen,
    isStudiesActive,
    handleStudiesClick,
  } = useRoleStudiesSidebar({ onNavigate: onClose });

  const handleStudiesNav = () => {
    const isStudiesRoute =
      location.pathname === "/studies" ||
      location.pathname.startsWith("/study-dashboard") ||
      location.pathname.startsWith("/study/");

    if (isStudiesRoute && studiesOpen) {
      handleStudiesClick();
      return;
    }

    handleStudiesClick();
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

  const mainSections = menuData.sections.filter((section) => section.id !== "dashboard");
  const dashboardSection = menuData.sections.find((section) => section.id === "dashboard");

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

        <div
          className={`menu-item studies-menu${
            selectedPage === "studies" || isStudiesActive ? " active-menu" : ""
          }`}
          onClick={handleStudiesNav}
        >
          <FaBookOpen />
          <span>Studies ({studyCount})</span>
        </div>

        {studiesOpen && (
          <div className="submenu-container pi-studies-tree">
            <RoleStudiesSidebarTree onNavigate={onClose} />
          </div>
        )}

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
