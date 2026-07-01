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

function useViewportMode() {
  const [mode, setMode] = useState(() => {
    if (typeof window === "undefined") {
      return "desktop";
    }

    const width = window.innerWidth;

    if (width <= 767) {
      return "mobile";
    }

    if (width <= 1024) {
      return "tablet";
    }

    return "desktop";
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width <= 767) {
        setMode("mobile");
      } else if (width <= 1024) {
        setMode("tablet");
      } else {
        setMode("desktop");
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return mode;
}

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