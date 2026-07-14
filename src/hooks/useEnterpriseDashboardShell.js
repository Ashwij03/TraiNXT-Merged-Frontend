import { useViewportMode } from "./useViewportMode";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import ROLES from "../constants/roles";
import {
  getCurrentUser,
  isAdmin,
  setAdminPreviewRole,
  setPIPreviewRole
} from "../services/roleService";

const DASHBOARD_ROUTE_ROLES = {
  "/admin-dashboard": ROLES.ADMIN,
  "/site-staff-dashboard": ROLES.SITE_STAFF,
  "/pi-dashboard": ROLES.PI,
  "/cro-dashboard": ROLES.CRO,
  "/sponsor-dashboard": ROLES.SPONSOR
};

export function useEnterpriseDashboardShell() {
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

  const headerWrapClass = "dashboard-header-wrap";

  return {
    contentRef,
    viewportMode,
    sidebarOpen,
    sidebarCollapsed,
    sidebarWrapClass,
    sidebarIsOpen,
    headerWrapClass,
    handleToggleSidebar,
    closeSidebar: () => setSidebarOpen(false)
  };
}

export default useEnterpriseDashboardShell;