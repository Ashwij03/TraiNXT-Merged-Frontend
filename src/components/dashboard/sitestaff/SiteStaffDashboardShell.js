import { useViewportMode } from "../../../hooks/useViewportMode";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardSidebar from "../shared/DashboardSidebar";
import SiteStaffNavbar from "./SiteStaffNavbar";
import LiveChatFab from "../../common/LiveChatFab";
import ROLES from "../../../constants/roles";
import {
  getCurrentUser,
  isAdmin,
  setAdminPreviewRole,
  setPIPreviewRole
} from "../../../services/roleService";

import "../shared/DashboardLayout.css";
import "../shared/dashboard.css";

const DASHBOARD_ROUTE_ROLES = {
  "/admin-dashboard": ROLES.ADMIN,
  "/site-staff-dashboard": ROLES.SITE_STAFF,
  "/pi-dashboard": ROLES.PI,
  "/cro-dashboard": ROLES.CRO,
  "/sponsor-dashboard": ROLES.SPONSOR
};

function SiteStaffDashboardShell({ children }) {
  const location = useLocation();
  const contentRef = useRef(null);
  const viewportMode = useViewportMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (isAdmin(currentUser)) {
      const matchedRole = DASHBOARD_ROUTE_ROLES[location.pathname];

      if (matchedRole) {
        setAdminPreviewRole(matchedRole);
      }

      return;
    }

    if (currentUser?.role === ROLES.PI) {
      if (location.pathname === "/site-staff-dashboard") {
        setPIPreviewRole(ROLES.SITE_STAFF);
      } else if (location.pathname === "/pi-dashboard") {
        setPIPreviewRole(null);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    if (viewportMode === "desktop") {
      setSidebarOpen((open) => (open ? false : open));
      return;
    }

    setSidebarCollapsed((collapsed) => (collapsed ? false : collapsed));
    setSidebarOpen((open) => (open ? false : open));
  }, [location.pathname, viewportMode]);

  const handleToggleSidebar = useCallback(() => {
    if (viewportMode === "desktop") {
      setSidebarCollapsed((prev) => !prev);
      return;
    }

    setSidebarOpen((prev) => !prev);
  }, [viewportMode]);

  const sidebarWrapClass = [
    "dashboard-sidebar-wrap",
    viewportMode !== "desktop" && sidebarOpen ? "is-open" : "",
    viewportMode === "desktop" && sidebarCollapsed ? "is-collapsed" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const sidebarIsOpen =
    viewportMode === "desktop" ? !sidebarCollapsed : sidebarOpen;

  return (
    <div className="dashboard-shell dashboard-shell--site-staff">
      {viewportMode !== "desktop" && (
        <div
          className={`sidebar-backdrop${sidebarOpen ? " is-visible" : ""}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={sidebarWrapClass}>
        <DashboardSidebar
          collapsed={viewportMode === "desktop" && sidebarCollapsed}
          compact={viewportMode === "tablet"}
          onNavigate={() => setSidebarOpen(false)}
        />
      </div>

      <div className="dashboard-main">
        <div className="dashboard-main-scaled">
          <div className="dashboard-header-wrap">
            <SiteStaffNavbar
              onToggleSidebar={handleToggleSidebar}
              sidebarOpen={sidebarIsOpen}
            />
          </div>

          <div className="dashboard-content" ref={contentRef}>
            {children}
          </div>
        </div>
      </div>

      <LiveChatFab liveChatPath="/site-staff-livechat" />
    </div>
  );
}

export default SiteStaffDashboardShell;