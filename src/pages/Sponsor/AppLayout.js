import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdMenuBook,
  MdPeople,
  MdPersonSearch,
  MdHowToReg,
  MdEvent,
  MdDescription,
  MdFolder,
  MdListAlt,
  MdStorage,
  MdAssignment,
  MdFolderShared,
  MdWorkspaces,
  MdMonitorHeart,
  MdBusiness,
  MdAnalytics,
  MdGroups,
  MdGavel,
  MdWarning,
  MdAssessment,
  MdNotifications,
  MdSettings,
} from "react-icons/md";

import "./AppLayout.css";
import SponsorNavbar from "../../Components/dashboard/SponsorNavbar";
import TriaNXTLogo from "../../Components/common/TriaNXTLogo";
import { useEnterpriseDashboardShell } from "../../hooks/useEnterpriseDashboardShell";
import LiveChatFab from "../../Components/common/LiveChatFab";
import "../../Components/dashboard/DashboardLayout.css";

const MENU_ITEMS = [
  { name: "Dashboard", path: "/sponsor-dashboard", icon: MdDashboard },
  { name: "Subjects", path: "/subjects", icon: MdPeople },
  { name: "Screening", path: "/screening", icon: MdPersonSearch },
  { name: "Enrollment", path: "/enrollment", icon: MdHowToReg },
  { name: "Visits", path: "/visits", icon: MdEvent },
  { name: "Progress Notes", path: "/progress-notes", icon: MdDescription },
  { name: "Files", path: "/files", icon: MdFolder },
  { name: "Logs", path: "/logs", icon: MdListAlt },
  { name: "eISF", path: "/eisf", icon: MdStorage },
  { name: "ICF", path: "/icf", icon: MdAssignment },
  { name: "Study Folder", path: "/study-folder", icon: MdFolderShared },
  { name: "Portfolio Management", path: "/portfolio", icon: MdWorkspaces },
  { name: "Study Oversight", path: "/study-oversight", icon: MdMonitorHeart },
  { name: "CRO Oversight", path: "/cro-oversight", icon: MdBusiness },
  { name: "Site Performance", path: "/site-performance", icon: MdAnalytics },
  { name: "Recruitment", path: "/recruitment", icon: MdGroups },
  { name: "Regulatory", path: "/regulatory", icon: MdGavel },
  { name: "Risk Management", path: "/risk-management", icon: MdWarning },
  { name: "Reports", path: "/reports", icon: MdAssessment },
  { name: "Notifications", path: "/notifications", icon: MdNotifications },
  { name: "Settings", path: "/settings", icon: MdSettings },
];

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [studiesOpen, setStudiesOpen] = useState(true);
  const [studyBinderOpen, setStudyBinderOpen] = useState(true);
  const {
    contentRef,
    viewportMode,
    sidebarWrapClass,
    sidebarIsOpen,
    headerWrapClass,
    handleToggleSidebar,
    closeSidebar
  } = useEnterpriseDashboardShell();

  const isStudiesRoute =
    location.pathname === "/studies" ||
    location.pathname.startsWith("/study-dashboard") ||
    location.pathname.startsWith("/study/");

  const isCommentsRoute =
    location.pathname === "/comments" ||
    location.pathname.includes("/comments");

  const isActive = (item) => {
    const { pathname } = location;
    if (item.path === "/sponsor-dashboard") {
      return pathname === "/sponsor-dashboard";
    }
    if (item.path === "/subjects") {
      return pathname === "/subjects" || pathname.startsWith("/subject/");
    }
    return pathname === item.path || pathname.startsWith(`${item.path}/`);
  };

  const handleNav = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
    closeSidebar();
  };

  const handleStudiesClick = () => {
    setStudiesOpen(true);
    if (location.pathname !== "/studies") {
      handleNav("/studies");
    }
  };

  return (
    <div className="dashboard-shell dashboard-shell--sponsor app-layout">
      {viewportMode !== "desktop" && (
        <div
          className={`sidebar-backdrop${sidebarIsOpen ? " is-visible" : ""}`}
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <div className={sidebarWrapClass}>
        <aside className="sidebar sponsor-enterprise-sidebar">
          <div className="sidebar-logo">
            <TriaNXTLogo
              size="sidebar"
              onClick={() => handleNav("/sponsor-dashboard")}
            />
            <span className="sidebar-subtitle">Sponsor Portal</span>
          </div>

          <nav className="sidebar-menu">
            <div
              className={`sidebar-item${
                location.pathname === "/sponsor-dashboard" ? " active" : ""
              }`}
              onClick={() => handleNav("/sponsor-dashboard")}
              role="button"
              tabIndex={0}
            >
              <MdDashboard className="sidebar-icon" size={20} />
              <span>Dashboard</span>
            </div>

            <div
              className={`sidebar-item studies-sidebar-item${
                isStudiesRoute || isCommentsRoute ? " active" : ""
              }`}
              onClick={handleStudiesClick}
              role="button"
              tabIndex={0}
            >
              <MdMenuBook className="sidebar-icon" size={20} />
              <span>Studies</span>
            </div>

            {studiesOpen && (
              <div className="sponsor-studies-submenu">
                <div
                  className={`sponsor-studies-subitem${
                    isStudiesRoute && !isCommentsRoute ? " active" : ""
                  }`}
                  onClick={() => {
                    setStudyBinderOpen((open) => !open);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <span className="sponsor-studies-expander">
                    {studyBinderOpen ? "−" : "+"}
                  </span>
                  <span>Study Binder</span>
                </div>

                <div
                  className={`sponsor-studies-subitem${
                    isCommentsRoute ? " active" : ""
                  }`}
                  onClick={() => handleNav("/comments")}
                  role="button"
                  tabIndex={0}
                >
                  <span className="sponsor-studies-expander" aria-hidden="true" />
                  <span>Comments</span>
                </div>
              </div>
            )}

            {MENU_ITEMS.slice(1).map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <div
                  key={item.name}
                  className={`sidebar-item${active ? " active" : ""}`}
                  onClick={() => handleNav(item.path)}
                  role="button"
                  tabIndex={0}
                >
                  <Icon className="sidebar-icon" size={20} />
                  <span>{item.name}</span>
                </div>
              );
            })}
          </nav>
        </aside>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-main-scaled">
          <div className={headerWrapClass}>
            <SponsorNavbar
              onToggleSidebar={handleToggleSidebar}
              sidebarOpen={sidebarIsOpen}
            />
          </div>

          <main className="dashboard-content main-layout" ref={contentRef}>
            {children}
          </main>
        </div>
      </div>

      <LiveChatFab liveChatPath="/live-chat" />
    </div>
  );
};

export default AppLayout;
