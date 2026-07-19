import "./DashboardSidebar.css";
import TriaNXTLogo from "../../common/TriaNXTLogo";
import { getStudies } from "../../../services/studyService";
import {
  getCurrentUser,
  getDashboardPath,
  getEffectiveRole,
  getEffectiveUser,
  getSidebarMenuItems,
} from "../../../services/roleService";
import { ADMIN_PREVIEW_ROLE_EVENT } from "../../../constants/headerFilters";
import { FOLDER_TREE_EVENT } from "../../../services/folderService";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiBell,
  FiFolder,
  FiGrid,
  FiSettings,
  FiShield,
  FiTrendingUp,
  FiUsers,
  FiEye,
  FiUser,
  FiBarChart2,
  FiFileText,
  FiLayers,
} from "react-icons/fi";
import { getRoleExtraMenuItems } from "../../../constants/roleMenus";

const STUDY_SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "subjects", label: "Subjects", expandable: true },
  { key: "planning", label: "Planning" },
  { key: "visitPlan", label: "Visit Plan" },
  { key: "clinicalSites", label: "Clinical Sites" },
  { key: "eisf", label: "eISF" },
  { key: "regulatory", label: "Regulatory" },
  { key: "reports", label: "Reports" },
  { key: "studyFiles", label: "Study Files" },
  { key: "logs", label: "Logs" },
  { key: "financials", label: "Financials" },
  { key: "others", label: "Others" },
];

function DashboardSidebar({ onNavigate, collapsed = false, compact = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const resizingRef = useRef(false);
  const prevActiveStudyKeyRef = useRef(null);

  const currentUser = getCurrentUser();
  const userEmail = currentUser?.email || "";

  const [effectiveRole, setEffectiveRole] = useState(() =>
    getEffectiveRole(currentUser),
  );

  const effectiveUser = getEffectiveUser(currentUser);

  const getStudiesSafe = () => {
    try {
      const studies = getStudies();
      return Array.isArray(studies) ? studies : [];
    } catch {
      return [];
    }
  };

  const getAllSubjectsByStudy = () => {
    try {
      return JSON.parse(localStorage.getItem("subjectsByStudy")) || {};
    } catch {
      return {};
    }
  };

  const getStudyKey = (study) =>
    String(
      study?.code ??
        study?.id ??
        study?.studyId ??
        study?.title ??
        study?.name ??
        "",
    );

  const getStudyDisplayName = (study) =>
    study?.name ||
    study?.title ||
    study?.studyName ||
    study?.protocolTitle ||
    study?.protocol ||
    "Untitled Study";

  const getStudyMeta = (study) => {
    const code = study?.code || study?.id || study?.studyId;

    if (!code) {
      return "";
    }

    const name = getStudyDisplayName(study);

    return name && code !== name ? code : "";
  };

  const getStudySubjects = (study) => {
    const subjectsByStudy = getAllSubjectsByStudy();
    const studyKey = getStudyKey(study);
    const subjects = subjectsByStudy[studyKey];

    return Array.isArray(subjects) ? subjects : [];
  };

  const [studyBinderOpen, setStudyBinderOpen] = useState(false);

  const [studiesOpen, setStudiesOpen] = useState(() => {
    return (
      pathname === "/studies" ||
      pathname.startsWith("/study-dashboard") ||
      pathname.startsWith("/study/") ||
      pathname.includes("/comments") ||
      pathname === "/comments"
    );
  });

  const [expandedStudies, setExpandedStudies] = useState({});
  const [expandedStudySections, setExpandedStudySections] = useState({});
  const [, setFolderTreeVersion] = useState(0);

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const storedWidth = Number(localStorage.getItem("dashboardSidebarWidth"));
    return storedWidth >= 220 ? storedWidth : 260;
  });

  const studies = getStudiesSafe();
  const studyCount = studies.length;
  const sidebarItems = getSidebarMenuItems(currentUser);

  const canManageUsers =
    effectiveUser?.role === "Admin" || effectiveUser?.role === "SiteStaff";

  const canApprovePermissions =
    effectiveUser?.role === "Admin" || effectiveUser?.role === "SiteStaff";

  const canViewCROOverview =
    effectiveUser?.role === "Admin" ||
    effectiveUser?.role === "SiteStaff" ||
    effectiveUser?.role === "CRO";

  const canViewAuditLogs =
    effectiveUser?.role === "Admin" || effectiveUser?.role === "SiteStaff";

  const canRequestAccess =
    effectiveUser?.role === "CRO" || effectiveUser?.role === "Sponsor";

  const roleExtraMenuItems = getRoleExtraMenuItems(effectiveUser?.role);
  const visibleStudySections = STUDY_SECTIONS.filter(
    (section) =>
      section.key !== "clinicalSites" ||
      effectiveUser?.role === "Sponsor" ||
      effectiveUser?.role === "Admin",
  );

  const sidebarClassName = [
    "enterprise-sidebar",
    collapsed || compact ? "is-collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const isStudiesOverviewRoute = pathname === "/studies";

  const isStudyInternalRoute =
    pathname.startsWith("/study-dashboard") || pathname.startsWith("/study/");

  const isCommentsRoute =
    pathname.includes("/comments") || pathname === "/comments";

  const isStudiesActive = isStudiesOverviewRoute || isStudyInternalRoute;

  useEffect(() => {
    const handlePreviewRoleChange = () => {
      const nextRole = getEffectiveRole(getCurrentUser());

      setEffectiveRole((currentRole) =>
        currentRole === nextRole ? currentRole : nextRole,
      );
    };

    window.addEventListener(ADMIN_PREVIEW_ROLE_EVENT, handlePreviewRoleChange);

    return () => {
      window.removeEventListener(
        ADMIN_PREVIEW_ROLE_EVENT,
        handlePreviewRoleChange,
      );
    };
  }, [userEmail]);

  useEffect(() => {
    if (isStudiesOverviewRoute || isStudyInternalRoute || isCommentsRoute) {
      setStudiesOpen((open) => (open ? open : true));
      return;
    }

    setStudiesOpen((open) => (open ? false : open));
  }, [isStudiesOverviewRoute, isStudyInternalRoute, isCommentsRoute, pathname]);

  useEffect(() => {
    if (!isStudyInternalRoute) {
      prevActiveStudyKeyRef.current = null;
      return;
    }

    const studyMatch = pathname.match(/^\/study-dashboard\/([^/?]+)/);
    const activeStudyKey = studyMatch?.[1];

    if (!activeStudyKey) {
      return;
    }

    if (prevActiveStudyKeyRef.current !== activeStudyKey) {
      setStudyBinderOpen(true);
      setExpandedStudies({ [activeStudyKey]: true });
      setExpandedStudySections({});
      prevActiveStudyKeyRef.current = activeStudyKey;
    }
  }, [pathname, isStudyInternalRoute]);

  useEffect(() => {
    const handleFolderTreeUpdate = () => {
      setFolderTreeVersion((value) => value + 1);
    };

    window.addEventListener(FOLDER_TREE_EVENT, handleFolderTreeUpdate);

    return () => {
      window.removeEventListener(FOLDER_TREE_EVENT, handleFolderTreeUpdate);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!resizingRef.current) {
        return;
      }

      const nextWidth = Math.min(390, Math.max(220, event.clientX));

      setSidebarWidth(nextWidth);
      localStorage.setItem("dashboardSidebarWidth", String(nextWidth));
    };

    const handleMouseUp = () => {
      resizingRef.current = false;
      document.body.classList.remove("sidebar-resizing");
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const dashboardPath = getDashboardPath(effectiveRole);

  const isDashboardActive =
    pathname === "/dashboard" ||
    (pathname.endsWith("-dashboard") &&
      !pathname.startsWith("/study-dashboard"));

  const getLinkClass = (isActive) =>
    isActive ? "sidebar-link active" : "sidebar-link";

  const handleNav = (path) => {
    navigate(path);
    onNavigate?.();
  };

  const usesUnifiedSettings =
    effectiveUser?.role === "Admin" || effectiveUser?.role === "SiteStaff";

  const handleSettingsNav = (section = "profile") => {
    navigate("/settings", { state: { section } });
    onNavigate?.();
  };

  const handleDashboardClick = () => {
    handleNav(dashboardPath);
  };

  const handleStudiesClick = () => {
    if (pathname === "/studies" && studiesOpen) {
      setStudiesOpen(false);
      return;
    }

    setStudiesOpen(true);

    if (pathname !== "/studies") {
      handleNav("/studies");
    }
  };

  const handleStudyBinderClick = (event) => {
    event.stopPropagation();
    setStudyBinderOpen((previousValue) => !previousValue);
  };

  const handleStudiesCommentsClick = (event) => {
    event?.stopPropagation();
    handleNav("/comments");
  };

  const toggleStudyNode = (studyKey, event) => {
    event?.stopPropagation();

    const isCurrentStudyOpen = Boolean(expandedStudies[studyKey]);

    if (isCurrentStudyOpen) {
      setExpandedStudies({});
      setExpandedStudySections({});
      return;
    }

    setExpandedStudies({ [studyKey]: true });
    setExpandedStudySections({});
  };

  const toggleStudySection = (studyKey, sectionKey, event) => {
    event?.stopPropagation();

    const compositeKey = `${studyKey}__${sectionKey}`;

    setExpandedStudySections((previousValue) => ({
      ...previousValue,
      [compositeKey]: !Boolean(previousValue[compositeKey]),
    }));
  };

  const navigateToStudySection = (studyKey, section) => {
    const study = studies.find((item) => getStudyKey(item) === studyKey);

    if (study) {
      localStorage.setItem("selectedStudy", JSON.stringify(study));
    }

    const tabMap = {
      overview: "Overview",
      subjects: "Subjects",
      planning: "Planning",
      visitPlan: "Visit Plan",
      clinicalSites: "Clinical Sites",
      eisf: "eISF",
      regulatory: "Regulatory",
      reports: "Reports",
      studyFiles: "Study Files",
      logs: "Logs",
      financials: "Financials",
      others: "Others",
    };

    const tab = tabMap[section] || "Overview";

    handleNav(
      `/study-dashboard/${encodeURIComponent(
        studyKey,
      )}?tab=${encodeURIComponent(tab)}`,
    );
  };

  const handleStudyNameClick = (studyKey, event) => {
    event?.stopPropagation();

    const isCurrentStudyOpen = Boolean(expandedStudies[studyKey]);

    if (isCurrentStudyOpen) {
      setExpandedStudies({});
      setExpandedStudySections({});
      return;
    }

    setExpandedStudies({ [studyKey]: true });
    setExpandedStudySections({});
    navigateToStudySection(studyKey, "overview");
  };

  const handleSubjectsSectionClick = (studyKey, event) => {
    event?.stopPropagation();

    const compositeKey = `${studyKey}__subjects`;

    setExpandedStudySections((previousValue) => ({
      ...previousValue,
      [compositeKey]: !Boolean(previousValue[compositeKey]),
    }));

    localStorage.removeItem("selectedSubject");

    window.dispatchEvent(
      new CustomEvent("subject-selected", {
        detail: {
          studyId: studyKey,
          subject: null,
        },
      }),
    );

    navigateToStudySection(studyKey, "subjects");
  };

  const handleExpandableSectionLabelClick = (studyKey, sectionKey, event) => {
    event?.stopPropagation();

    if (sectionKey === "subjects") {
      handleSubjectsSectionClick(studyKey, event);
      return;
    }

    toggleStudySection(studyKey, sectionKey, event);
  };

  const handleSubjectClick = (studyKey, subject) => {
    const subjectId = String(subject?.subjectId || subject?.id || "").trim();

    if (!subjectId) {
      return;
    }

    const study = studies.find((item) => getStudyKey(item) === studyKey);

    if (study) {
      localStorage.setItem("selectedStudy", JSON.stringify(study));
    }

    const selectedSubject = {
      ...subject,
      subjectId,
      id: subject?.id || subjectId,
      studyId: studyKey,
    };

    localStorage.setItem("selectedSubject", JSON.stringify(selectedSubject));

    setStudyBinderOpen(true);
    setStudiesOpen(true);
    setExpandedStudies({ [studyKey]: true });
    setExpandedStudySections((previousValue) => ({
      ...previousValue,
      [`${studyKey}__subjects`]: true,
    }));

    window.dispatchEvent(
      new CustomEvent("subject-selected", {
        detail: {
          studyId: studyKey,
          subject: selectedSubject,
        },
      }),
    );

    handleNav(
      `/study-dashboard/${encodeURIComponent(
        studyKey,
      )}?tab=Subjects&subject=${encodeURIComponent(subjectId)}`,
    );
  };

  return (
    <div
      className={sidebarClassName}
      style={
        collapsed || compact
          ? undefined
          : {
              width: sidebarWidth,
              minWidth: sidebarWidth,
              flexBasis: sidebarWidth,
            }
      }
    >
      <TriaNXTLogo size="sidebar" onClick={() => handleNav(dashboardPath)} />

      <div
        className={getLinkClass(isDashboardActive)}
        onClick={handleDashboardClick}
      >
        <FiGrid size={16} />
        <span>Dashboard</span>
      </div>

      <div
        className={`${getLinkClass(
          isStudiesActive,
        )} sidebar-folder sidebar-folder--no-indicator${
          studiesOpen ? " submenu-open" : ""
        }`}
        onClick={handleStudiesClick}
      >
        <FiFolder size={16} />
        <span>Studies ({studyCount})</span>
      </div>

      {studiesOpen && (
        <div className="sidebar-submenu sidebar-studies-tree">
          <div className="sidebar-tree-row sidebar-tree-row--branch">
            <button
              type="button"
              className="sidebar-expander"
              aria-label={
                studyBinderOpen
                  ? "Collapse Study Binder"
                  : "Expand Study Binder"
              }
              onClick={handleStudyBinderClick}
            >
              {studyBinderOpen ? "−" : "+"}
            </button>

            <span
              className="sidebar-tree-label sidebar-tree-label--strong"
              onClick={handleStudyBinderClick}
            >
              Study Binder
            </span>
          </div>

          {studyBinderOpen && (
            <div className="sidebar-tree-group">
              {studies.map((study) => {
                const studyKey = getStudyKey(study);
                const studyName = getStudyDisplayName(study);
                const studyMeta = getStudyMeta(study);
                const studySubjects = getStudySubjects(study);
                const subjectCount = studySubjects.length;
                const isStudyOpen = Boolean(expandedStudies[studyKey]);

                return (
                  <div key={studyKey} className="sidebar-tree-study">
                    <div className="sidebar-tree-row sidebar-tree-row--branch">
                      <button
                        type="button"
                        className="sidebar-expander"
                        aria-label={
                          isStudyOpen
                            ? "Collapse study sections"
                            : "Expand study sections"
                        }
                        onClick={(event) => toggleStudyNode(studyKey, event)}
                      >
                        {isStudyOpen ? "−" : "+"}
                      </button>

                      <div
                        className="study-label-block"
                        onClick={(event) =>
                          handleStudyNameClick(studyKey, event)
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleStudyNameClick(studyKey, event);
                          }
                        }}
                      >
                        <span className="study-label-name">{studyName}</span>

                        {studyMeta && (
                          <small className="study-label-meta">
                            {studyMeta}
                          </small>
                        )}
                      </div>
                    </div>

                    {isStudyOpen && (
                      <div className="sidebar-tree-group sidebar-tree-group--sections">
                        {visibleStudySections.map((section) => {
                          const sectionKey = section.key;
                          const compositeKey = `${studyKey}__${sectionKey}`;
                          const isSectionOpen = Boolean(
                            expandedStudySections[compositeKey],
                          );

                          if (section.expandable) {
                            const displayLabel =
                              sectionKey === "subjects"
                                ? `Subjects (${subjectCount})`
                                : section.label;

                            return (
                              <div key={compositeKey}>
                                <div className="sidebar-tree-row sidebar-tree-row--section-leaf sidebar-tree-row--expandable">
                                  <button
                                    type="button"
                                    className="sidebar-expander"
                                    aria-label={
                                      isSectionOpen
                                        ? `Collapse ${displayLabel}`
                                        : `Expand ${displayLabel}`
                                    }
                                    onClick={(event) =>
                                      toggleStudySection(
                                        studyKey,
                                        sectionKey,
                                        event,
                                      )
                                    }
                                  >
                                    {isSectionOpen ? "−" : "+"}
                                  </button>

                                  <span
                                    className="sidebar-tree-label"
                                    onClick={(event) =>
                                      handleExpandableSectionLabelClick(
                                        studyKey,
                                        sectionKey,
                                        event,
                                      )
                                    }
                                  >
                                    {displayLabel}
                                  </span>
                                </div>

                                {isSectionOpen && sectionKey === "subjects" && (
                                  <div className="sidebar-tree-group sidebar-tree-group--nested">
                                    {studySubjects.map((subject) => {
                                      const subjectKey = String(
                                        subject?.subjectId || subject?.id || "",
                                      ).trim();

                                      if (!subjectKey) {
                                        return null;
                                      }

                                      return (
                                        <div
                                          key={`${studyKey}-${subjectKey}`}
                                          className="sidebar-subject-group"
                                        >
                                          <div
                                            className="sidebar-tree-row sidebar-tree-row--section-leaf sidebar-subject-row"
                                            onClick={() =>
                                              handleSubjectClick(
                                                studyKey,
                                                subject,
                                              )
                                            }
                                          >
                                            <span className="sidebar-tree-label">
                                              {subjectKey}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          }

                          return (
                            <div
                              key={compositeKey}
                              className="sidebar-tree-row sidebar-tree-row--section-leaf"
                              onClick={() =>
                                navigateToStudySection(studyKey, sectionKey)
                              }
                            >
                              <span
                                className="sidebar-tree-spacer"
                                aria-hidden="true"
                              />

                              <span className="sidebar-tree-label">
                                {section.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div
            className={`sidebar-tree-row sidebar-tree-row--comments${
              isCommentsRoute ? " active" : ""
            }`}
            onClick={handleStudiesCommentsClick}
          >
            <span className="sidebar-tree-spacer" aria-hidden="true" />
            <span className="sidebar-tree-label">Comments</span>
          </div>
        </div>
      )}

      {sidebarItems.some((item) => item.key === "site-performance") && (
        <div
          className={getLinkClass(pathname.includes("site-performance"))}
          onClick={() => handleNav("/site-performance")}
        >
          <FiTrendingUp size={16} />
          <span>Site Performance</span>
        </div>
      )}

      {sidebarItems.some((item) => item.key === "recruitment") && (
        <div
          className={getLinkClass(pathname.includes("recruitment"))}
          onClick={() => handleNav("/recruitment")}
        >
          <FiUsers size={16} />
          <span>Recruitment</span>
        </div>
      )}

      {sidebarItems.some((item) => item.key === "reports") && (
        <div
          className={getLinkClass(pathname.includes("/reports"))}
          onClick={() => handleNav("/reports")}
        >
          <FiBarChart2 size={16} />
          <span>Reports</span>
        </div>
      )}

      {canManageUsers && (
        <div
          className={getLinkClass(pathname.includes("user-management"))}
          onClick={() => handleNav("/user-management")}
        >
          <FiUsers size={16} />
          <span>User Management</span>
        </div>
      )}

      {canApprovePermissions && (
        <div
          className={getLinkClass(
            pathname.includes("access-permission") ||
              pathname.includes("permission-approval"),
          )}
          onClick={() => handleNav("/access-permission")}
        >
          <FiShield size={16} />
          <span>Permission Approval</span>
        </div>
      )}

      {canRequestAccess && (
        <div
          className={getLinkClass(pathname.includes("access-request"))}
          onClick={() => handleNav("/access-request")}
        >
          <FiShield size={16} />
          <span>Request Access</span>
        </div>
      )}

      {canViewCROOverview && (
        <div
          className={getLinkClass(pathname.includes("cro-overview"))}
          onClick={() => handleNav("/cro-overview")}
        >
          <FiEye size={16} />
          <span>CRO Overview</span>
        </div>
      )}

      {canViewAuditLogs && (
        <div
          className={getLinkClass(
            pathname === "/logs" || pathname.startsWith("/logs/"),
          )}
          onClick={() => handleNav("/logs")}
        >
          <FiFileText size={16} />
          <span>Audit Logs</span>
        </div>
      )}

      {sidebarItems.some((item) => item.key === "notifications") && (
        <div
          className={getLinkClass(pathname.includes("notifications"))}
          onClick={() => handleNav("/notifications")}
        >
          <FiBell size={16} />
          <span>Notifications</span>
        </div>
      )}

      {!usesUnifiedSettings && (
        <div
          className={getLinkClass(pathname.includes("/profile"))}
          onClick={() => handleNav("/profile")}
        >
          <FiUser size={16} />
          <span>Profile</span>
        </div>
      )}

      {sidebarItems.some((item) => item.key === "settings") && (
        <div
          className={getLinkClass(pathname.includes("settings"))}
          onClick={() =>
            usesUnifiedSettings
              ? handleSettingsNav("profile")
              : handleNav("/settings")
          }
        >
          <FiSettings size={16} />
          <span>Settings</span>
        </div>
      )}

      {roleExtraMenuItems.map((item) => (
        <div
          key={item.key}
          className={getLinkClass(pathname.includes(item.path))}
          onClick={() => handleNav(item.path)}
        >
          <FiLayers size={16} />
          <span>{item.label}</span>
        </div>
      ))}

      {!collapsed && !compact && (
        <div
          className="sidebar-resize-handle"
          onMouseDown={(event) => {
            event.preventDefault();
            resizingRef.current = true;
            document.body.classList.add("sidebar-resizing");
          }}
        />
      )}
    </div>
  );
}

export default DashboardSidebar;
