import React from "react";
import { useEnterpriseDashboardShell } from "../../hooks/useEnterpriseDashboardShell";
import CROSidebar from "./CROSidebar";
import CRONavbar from "./CRONavbar";
import CROAlertHost from "./CROAlertHost";
import LiveChatFab from "../../components/common/LiveChatFab";
import "../../components/dashboard/shared/DashboardLayout.css";
import "./CROLayout.css";

function CROLayout({ children }) {
const {
  contentRef,
  viewportMode,
  sidebarWrapClass,
  sidebarIsOpen,
  sidebarCollapsed,
  headerWrapClass,
  handleToggleSidebar,
  closeSidebar
} = useEnterpriseDashboardShell();

  return (
    <div className="dashboard-shell dashboard-shell--cro cro-layout">
      {viewportMode !== "desktop" && (
        <div
          className={`sidebar-backdrop${sidebarIsOpen ? " is-visible" : ""}`}
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <div className={sidebarWrapClass}>
            <CROSidebar
            isOpen={sidebarIsOpen}
            collapsed={sidebarCollapsed}
            onClose={closeSidebar}
          />
      </div>

      <div className="dashboard-main cro-main-content">
        <div className="dashboard-main-scaled">
          <div className={headerWrapClass}>
            <CRONavbar
              onToggleSidebar={handleToggleSidebar}
              sidebarOpen={sidebarIsOpen}
            />
          </div>

          <div className="dashboard-content cro-page-content" ref={contentRef}>
            {children}
          </div>
        </div>
      </div>

      <CROAlertHost />
      <LiveChatFab liveChatPath="/cro-livechat" />
    </div>
  );
}

export default CROLayout;
