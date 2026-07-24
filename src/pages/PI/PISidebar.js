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
import TriaNXTLogo from "../../components/common/TriaNXTLogo";
import RoleStudiesSidebarTree from "../../components/common/RoleStudiesSidebarTree";
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

function PISidebar({ selectedPage, setSelectedPage, isOpen = true, onClose }) {
  const location = useLocation();
  const menuData = getSidebarMenuData();
  

  const { studyCount, studiesOpen, isStudiesActive, handleStudiesClick } =
    useRoleStudiesSidebar({ onNavigate: onClose });

  const handleStudiesNav = () => {
    handleStudiesClick();

    if (typeof setSelectedPage === "function") {
      setSelectedPage("studies");
    }
  };

  const handleMenuClick = (page) => {
    if (typeof setSelectedPage === "function") {
      setSelectedPage(page);
    }

    if (typeof onClose === "function") {
      onClose();
    }
  };

 const getMenuClass = (page) => {
  const path = location.pathname.toLowerCase();

  switch (page) {
    case "dashboard":
      return `menu-item${path === "/pi-dashboard" ? " active-menu" : ""}`;

    case "reports":
      return `menu-item${path === "/pi-reports" ? " active-menu" : ""}`;

    case "notifications":
      return `menu-item${path === "/pi-notifications" ? " active-menu" : ""}`;

    case "settings":
      return `menu-item${path === "/pi-settings" ? " active-menu" : ""}`;

    case "regulatory":
      return `menu-item${path === "/pi-regulatory" ? " active-menu" : ""}`;

    case "recruitment":
      return `menu-item${path === "/pi-recruitment" ? " active-menu" : ""}`;

     case "sitePerformance":
    case "site-performance":
      return `menu-item${
        path === "/pi-performance" || path === "/pi-site-performance"
          ? " active-menu"
          : ""
      }`;
    default:
      return "menu-item";
  }
};
  const mainSections = menuData.sections.filter(
    (section) => section.id !== "dashboard",
  );

  const dashboardSection = menuData.sections.find(
    (section) => section.id === "dashboard",
  );

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
  selectedPage === "studies" ||
  isStudiesActive ||
  location.pathname.toLowerCase().includes("stud")
    ? " active-menu"
    : ""
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