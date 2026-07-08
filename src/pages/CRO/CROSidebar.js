import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBook,
  FaChartLine,
  FaFileAlt,
  FaBell,
  FaCog,
  FaChevronDown,
  FaChevronRight,
  FaTasks,
  FaShieldAlt,
  FaUserFriends,
  FaTimes,
} from "react-icons/fa";
import TriaNXTLogo from "../../Components/common/TriaNXTLogo";
import RoleStudiesSidebarTree from "../../Components/common/RoleStudiesSidebarTree";
import { useRoleStudiesSidebar } from "../../hooks/useRoleStudiesSidebar";
import "./CRODashboard.css";

const MAIN_ITEMS = [
  { to: "/cro-dashboard", icon: FaTachometerAlt, label: "Dashboard" },
  { to: "/cro-subject-management", icon: FaUserFriends, label: "Subject Management" },
  { to: "/cro-monitoring", icon: FaTasks, label: "Monitoring" },
  { to: "/cro-regulatory-documents", icon: FaShieldAlt, label: "Regulatory Docs" },
  { to: "/cro-site-performance", icon: FaChartLine, label: "Site Performance" },
  { to: "/cro-reports", icon: FaFileAlt, label: "Reports" },
  { to: "/cro-notifications", icon: FaBell, label: "Notifications" },
  { to: "/cro-settings", icon: FaCog, label: "Settings" },
];

function SidebarItem({ to, icon: Icon, label, onNavigate }) {
  return (
    <li className="cro-sidebar-item">
      <NavLink
        to={to}
        className={({ isActive }) =>
          `cro-sidebar-link${isActive ? " active" : ""}`
        }
        onClick={onNavigate}
      >
        <span className="cro-sidebar-icon">
          <Icon />
        </span>
        <span className="cro-sidebar-label">{label}</span>
      </NavLink>
    </li>
  );
}

function CROSidebar({ isOpen = false, collapsed = false, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    studyCount,
    studiesOpen,
    isStudiesActive,
    isCommentsRoute,
    handleStudiesClick,
  } = useRoleStudiesSidebar({ onNavigate: onClose });

  const isStudiesRoute =
    location.pathname === "/studies" ||
    location.pathname.startsWith("/study-dashboard") ||
    location.pathname.startsWith("/study/") ||
    location.pathname.startsWith("/comments");

  const handleNavigate = () => {
    if (onClose) onClose();
  };

  const handleStudiesToggle = () => {
    if (!isStudiesRoute) {
      handleStudiesClick();
      handleNavigate();
      return;
    }
    handleStudiesClick();
  };

  return (
    <aside
      className={`cro-sidebar cro-sidebar-aligned
    ${isOpen ? " open" : ""}
    ${collapsed ? " collapsed" : ""}`}
    >
      {!collapsed && (
        <div className="cro-sidebar-top">
          <div
            className="cro-sidebar-logo-link"
            onClick={() => {
              handleNavigate();
              navigate("/cro-dashboard");
            }}
          >
            <TriaNXTLogo size="sidebar" />
          </div>

          <button type="button" className="cro-sidebar-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
      )}

      <ul className="sidebar-menu cro-sidebar-menu-aligned">
        <SidebarItem
          to="/cro-dashboard"
          icon={FaTachometerAlt}
          label="Dashboard"
          onNavigate={handleNavigate}
        />

        <li className="cro-sidebar-item">
          <button
            type="button"
            className={`cro-sidebar-link cro-sidebar-toggle${
              isStudiesActive || isCommentsRoute ? " active" : ""
            }`}
            onClick={handleStudiesToggle}
          >
            <span className="cro-sidebar-icon">
              <FaBook />
            </span>
            <span className="cro-sidebar-label">Studies ({studyCount})</span>
            <span className="cro-sidebar-chevron">
              {studiesOpen ? <FaChevronDown /> : <FaChevronRight />}
            </span>
          </button>

          {studiesOpen && (
            <div className="cro-studies-submenu">
              <RoleStudiesSidebarTree onNavigate={handleNavigate} />
            </div>
          )}
        </li>

        {MAIN_ITEMS.slice(1).map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            onNavigate={handleNavigate}
          />
        ))}
      </ul>
    </aside>
  );
}

export default CROSidebar;
