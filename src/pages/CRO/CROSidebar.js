import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBook,
  FaFolderOpen,
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
import "./CRODashboard.css";

const SUBMENU_ITEMS = [
  { to: "/cro-subjects", label: "Subjects" },
  { to: "/cro-screening", label: "Screening" },
  { to: "/cro-enrollment", label: "Enrollment" },
  { to: "/cro-visits", label: "Visits" },
  { to: "/cro-files", label: "Files" },
];

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

function CROSidebar({ isOpen = false, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [studiesOpen, setStudiesOpen] = useState(true);
  const [studyBinderOpen, setStudyBinderOpen] = useState(true);
  const isStudiesRoute =
    location.pathname === "/studies" ||
    location.pathname.startsWith("/study-dashboard") ||
    location.pathname.startsWith("/study/");

  const isCommentsRoute =
    location.pathname === "/comments" ||
    location.pathname.includes("/comments");

  const handleNavigate = () => {
    if (onClose) onClose();
  };

  const handleStudiesClick = () => {
    setStudiesOpen(true);
    handleNavigate();

    if (location.pathname !== "/studies") {
      navigate("/studies");
    }
  };

  return (
    <aside className={`cro-sidebar cro-sidebar-aligned${isOpen ? " open" : ""}`}>
      <div className="cro-sidebar-top">
        <NavLink
          to="/cro-dashboard"
          className="cro-sidebar-logo-link"
          onClick={handleNavigate}
          aria-label="Go to CRO Dashboard"
        >
          <TriaNXTLogo size="sidebar" />
        </NavLink>
        <button
          type="button"
          className="cro-sidebar-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          <FaTimes />
        </button>
      </div>

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
              isStudiesRoute || isCommentsRoute ? " active" : ""
            }`}
            onClick={handleStudiesClick}
          >
            <span className="cro-sidebar-icon">
              <FaBook />
            </span>
            <span className="cro-sidebar-label">Studies</span>
            <span className="cro-sidebar-chevron">
              {studiesOpen ? <FaChevronDown /> : <FaChevronRight />}
            </span>
          </button>
        </li>

        {studiesOpen && (
          <li className="cro-sidebar-item cro-sidebar-submenu-wrap">
            <button
              type="button"
              className="cro-sidebar-link cro-sidebar-toggle"
              onClick={() => setStudyBinderOpen(!studyBinderOpen)}
            >
              <span className="cro-sidebar-icon">
                <FaFolderOpen />
              </span>
              <span className="cro-sidebar-label">Study Binder</span>
              <span className="cro-sidebar-chevron">
                {studyBinderOpen ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            </button>

            {studyBinderOpen && (
              <ul className="cro-nested-submenu">
                {SUBMENU_ITEMS.map((item) => (
                  <li key={item.to} className="cro-sidebar-item">
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `cro-sidebar-link cro-sidebar-sublink${isActive ? " active" : ""}`
                      }
                      onClick={handleNavigate}
                    >
                      <span className="cro-sidebar-icon cro-sidebar-icon-sub" />
                      <span className="cro-sidebar-label">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}

            <NavLink
              to="/comments"
              className={`cro-sidebar-link cro-sidebar-sublink cro-studies-comments-link${
                isCommentsRoute ? " active" : ""
              }`}
              onClick={handleNavigate}
            >
              <span className="cro-sidebar-icon cro-sidebar-icon-sub" />
              <span className="cro-sidebar-label">Comments</span>
            </NavLink>
          </li>
        )}

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
