import { useViewportMode } from "../../../hooks/useViewportMode";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardSidebar from "../shared/DashboardSidebar";
import AdminNavbar from "./AdminNavbar";
import LiveChatFab from "../../common/LiveChatFab";
import ROLES from "../../../constants/roles";
import {
  getCurrentUser,
  isAdmin,
  setAdminPreviewRole,
  setPIPreviewRole,
} from "../../../services/roleService";
import { EISF_SIDEBAR_COLLAPSE_EVENT } from "../../../constants/headerFilters";

import "../shared/DashboardLayout.css";
import "../shared/dashboard.css";

const DASHBOARD_ROUTE_ROLES = {
  "/admin-dashboard": ROLES.ADMIN,
  "/site-staff-dashboard": ROLES.SITE_STAFF,
  "/pi-dashboard": ROLES.PI,
  "/cro-dashboard": ROLES.CRO,
  "/sponsor-dashboard": ROLES.SPONSOR,
};

function AdminDashboardShell({ children }) {
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

  // Task 14 — eISF Sidebar Auto Close: see useEnterpriseDashboardShell for
  // the full explanation. AdminDashboardShell keeps its own separate
  // sidebar state (rather than the shared hook), so it needs its own copy
  // of this listener.
  useEffect(() => {
    const handleEisfEntered = () => {
      if (viewportMode === "desktop") {
        setSidebarCollapsed(true);
        return;
      }

      setSidebarOpen(false);
    };

    window.addEventListener(EISF_SIDEBAR_COLLAPSE_EVENT, handleEisfEntered);

    return () => {
      window.removeEventListener(
        EISF_SIDEBAR_COLLAPSE_EVENT,
        handleEisfEntered,
      );
    };
  }, [viewportMode]);

  const sidebarWrapClass = [
    "dashboard-sidebar-wrap",
    viewportMode !== "desktop" && sidebarOpen ? "is-open" : "",
    viewportMode === "desktop" && sidebarCollapsed ? "is-collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const sidebarIsOpen =
    viewportMode === "desktop" ? !sidebarCollapsed : sidebarOpen;

  return (
    <div className="dashboard-shell dashboard-shell--admin">
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
            <AdminNavbar
              onToggleSidebar={handleToggleSidebar}
              sidebarOpen={sidebarIsOpen}
            />
          </div>

          <div className="dashboard-content" ref={contentRef}>
            {children}
          </div>
        </div>
      </div>

      <LiveChatFab liveChatPath="/admin-livechat" />
    </div>
  );
}

export default AdminDashboardShell;
