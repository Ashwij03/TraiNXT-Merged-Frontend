import "./DashboardSidebar.css";
import TriaNXTLogo from "../common/TriaNXTLogo";
import { getStudies } from "../../services/studyService";
import {
  getCurrentUser,
  getDashboardPath,
  getEffectiveRole,
  getEffectiveUser,
  getSidebarMenuItems
} from "../../services/roleService";
import { ADMIN_PREVIEW_ROLE_EVENT } from "../../constants/headerFilters";
import {
  FOLDER_TREE_EVENT,
  getFirstLevelFolders,
  getFolderTree
} from "../../services/folderService";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiBell,
  FiClipboard,
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
  FiLayers
} from "react-icons/fi";
import { getRoleExtraMenuItems } from "../../config/roleMenus";

const SIDEBAR_EXPANDED_STUDIES_KEY = "sidebarExpandedStudies";
const SIDEBAR_EXPANDED_SECTIONS_KEY = "sidebarExpandedStudySections";
const SIDEBAR_STUDY_BINDER_OPEN_KEY = "sidebarStudyBinderOpen";

function readStoredJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const STUDY_SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "subjects", label: "Subjects", expandable: true },
  { key: "regulatory", label: "Regulatory" },
  { key: "reports", label: "Reports" },
  { key: "studyFolder", label: "Study Folder", expandable: true },
  { key: "logs", label: "Logs" }
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
    getEffectiveRole(currentUser)
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
        study?.name
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

    if (name && code !== name) {
      return code;
    }

    return "";
  };

  const getStudySubjects = (study) => {
    const subjectsByStudy = getAllSubjectsByStudy();
    const studyKey = getStudyKey(study);
    const subjects = subjectsByStudy[studyKey];
    return Array.isArray(subjects) ? subjects : [];
  };

  const [studyBinderOpen, setStudyBinderOpen] = useState(() =>
    readStoredJson(SIDEBAR_STUDY_BINDER_OPEN_KEY, false)
  );
  const [studiesOpen, setStudiesOpen] = useState(() => {
    const path = pathname;
    return (
      path === "/studies" ||
      path.startsWith("/study-dashboard") ||
      path.startsWith("/study/") ||
      path.includes("/comments") ||
      path === "/comments"
    );
  });
  const [expandedStudies, setExpandedStudies] = useState(() =>
    readStoredJson(SIDEBAR_EXPANDED_STUDIES_KEY, {})
  );
  const [expandedStudySections, setExpandedStudySections] = useState(() =>
    readStoredJson(SIDEBAR_EXPANDED_SECTIONS_KEY, {})
  );
  const [folderTreeVersion, setFolderTreeVersion] = useState(0);
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

  const sidebarClassName = [
    "enterprise-sidebar",
    collapsed || compact ? "is-collapsed" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const isStudiesOverviewRoute = pathname === "/studies";
  const isStudyInternalRoute =
    pathname.startsWith("/study-dashboard") || pathname.startsWith("/study/");
  const isEisfRoute = pathname === "/ereg-comments";
  const isCommentsRoute =
    pathname.includes("/comments") || pathname === "/comments";

  const isStudiesActive =
    isStudiesOverviewRoute || isStudyInternalRoute;

  useEffect(() => {
    const handlePreviewRoleChange = () => {
      setEffectiveRole(getEffectiveRole(getCurrentUser()));
    };

    window.addEventListener(ADMIN_PREVIEW_ROLE_EVENT, handlePreviewRoleChange);

    return () => {
      window.removeEventListener(
        ADMIN_PREVIEW_ROLE_EVENT,
        handlePreviewRoleChange
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
    localStorage.setItem(
      SIDEBAR_EXPANDED_STUDIES_KEY,
      JSON.stringify(expandedStudies)
    );
  }, [expandedStudies]);

  useEffect(() => {
    localStorage.setItem(
      SIDEBAR_EXPANDED_SECTIONS_KEY,
      JSON.stringify(expandedStudySections)
    );
  }, [expandedStudySections]);

  useEffect(() => {
    localStorage.setItem(
      SIDEBAR_STUDY_BINDER_OPEN_KEY,
      JSON.stringify(studyBinderOpen)
    );
  }, [studyBinderOpen]);

  useEffect(() => {
    if (!isStudyInternalRoute) {
      prevActiveStudyKeyRef.current = null;
      return;
    }

    const studyMatch = pathname.match(
      /^\/study-dashboard\/([^/?]+)/
    );
    const activeStudyKey = studyMatch?.[1];

    if (!activeStudyKey) {
      return;
    }

    if (prevActiveStudyKeyRef.current !== activeStudyKey) {
      setStudyBinderOpen(true);
      setExpandedStudies((prev) => ({
        ...prev,
        [activeStudyKey]: true
      }));
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

  const getSubmenuClass = (isOpen) =>
    isOpen ? "submenu-item submenu-open" : "submenu-item";

  const getSubmenuParentClass = (isOpen) =>
    isOpen ? "submenu-parent submenu-open" : "submenu-parent";

  const handleNav = (path) => {
    navigate(path);
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
    setStudyBinderOpen((prev) => !prev);
  };

  const handleStudyNameClick = (studyKey, event) => {
    event.stopPropagation();
    navigateToStudySection(studyKey, "overview");
  };

  const handleStudiesCommentsClick = (event) => {
    event?.stopPropagation();
    handleNav("/comments");
  };

  const toggleStudyNode = (studyKey, event) => {
    event?.stopPropagation();

    setExpandedStudies((prev) => ({
      ...prev,
      [studyKey]: !Boolean(prev[studyKey])
    }));
  };

  const toggleStudySection = (studyKey, sectionKey, event) => {
    event?.stopPropagation();
    const compositeKey = `${studyKey}__${sectionKey}`;

    setExpandedStudySections((prev) => ({
      ...prev,
      [compositeKey]: !Boolean(prev[compositeKey])
    }));
  };

  const handleExpandableSectionLabelClick = (
    studyKey,
    sectionKey,
    isSectionOpen,
    event
  ) => {
    event?.stopPropagation();

    if (isSectionOpen) {
      toggleStudySection(studyKey, sectionKey, event);
      return;
    }

    navigateToStudySection(studyKey, sectionKey);
  };

  const navigateToStudySection = (studyKey, section) => {
    const study = studies.find((item) => getStudyKey(item) === studyKey);

    if (study) {
      localStorage.setItem("selectedStudy", JSON.stringify(study));
    }

    const tabMap = {
      overview: "Overview",
      subjects: "Subjects",
      regulatory: "Regulatory",
      reports: "Reports",
      studyFolder: "Study Folder",
      logs: "Logs"
    };

    const tab = tabMap[section] || "Overview";
    handleNav(`/study-dashboard/${studyKey}?tab=${encodeURIComponent(tab)}`);
  };

  const handleSubjectClick = (studyKey, subject) => {
    const subjectId = subject.subjectId || subject.id;
    localStorage.setItem("selectedStudy", JSON.stringify({ code: studyKey }));
    handleNav(`/subject/${subjectId}`);
  };

  const getSectionFolderNodes = (sectionKey, studyKey) => {
    void folderTreeVersion;

    if (sectionKey === "subjects") {
      return [];
    }

    const tree = getFolderTree(sectionKey, studyKey);
    const root = tree[0];

    if (!root?.children?.length) {
      return [];
    }

    return root.children;
  };

  const getSubjectSidebarFolders = (studyKey, subject) => {
    void folderTreeVersion;

    const subjectId = subject.subjectId || subject.id;
    const contextKey = `${studyKey}::${subjectId}`;
    return getFirstLevelFolders("subjects", contextKey);
  };

  const handleFolderNavigate = (studyKey, sectionKey, node) => {
    const name = String(node?.name || "").toLowerCase();

    if (
      sectionKey === "studyFolder" &&
      (name.includes("regulatory") || name.includes("reg"))
    ) {
      navigateToStudySection(studyKey, "regulatory");
      return;
    }

    navigateToStudySection(studyKey, sectionKey);
  };

  const renderDynamicFolderNodes = (nodes, studyKey, sectionKey, depth = 0) =>
    nodes.map((node) => {
      const compositeKey = `${studyKey}__${sectionKey}__folder__${node.id}`;
      const depthClass =
        depth > 0 ? ` sidebar-tree-depth-${Math.min(depth, 2)}` : "";

      return (
        <div key={compositeKey}>
          <div
            className={`submenu-item subject-child${depthClass}`}
            onClick={() => handleFolderNavigate(studyKey, sectionKey, node)}
          >
            {node.name}
          </div>
          {node.children?.length
            ? renderDynamicFolderNodes(
                node.children,
                studyKey,
                sectionKey,
                depth + 1
              )
            : null}
        </div>
      );
    });

  return (
    <div
      className={sidebarClassName}
      style={
        collapsed || compact
          ? undefined
          : {
              width: sidebarWidth,
              minWidth: sidebarWidth,
              flexBasis: sidebarWidth
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
        className={`${getLinkClass(isStudiesActive)} sidebar-folder sidebar-folder--no-indicator${
          studiesOpen ? " submenu-open" : ""
        }`}
        onClick={handleStudiesClick}
      >
        <FiFolder size={16} />
        <span>Studies ({studyCount})</span>
      </div>

      {studiesOpen && (
        <div className="sidebar-submenu">
          <div
            className={getSubmenuParentClass(studyBinderOpen)}
            onClick={handleStudyBinderClick}
          >
            Study Binder
          </div>

          {studyBinderOpen && (
            <div className="nested-submenu studies-subfolder-tree">
              {studies.map((study) => {
                const studyKey = getStudyKey(study);
                const studyName = getStudyDisplayName(study);
                const studyMeta = getStudyMeta(study);
                const studySubjects = getStudySubjects(study);
                const subjectCount = studySubjects.length;
                const isStudyOpen = !!expandedStudies[studyKey];

                return (
                  <div key={studyKey} className="subject-node">
                    <div
                      className={`submenu-item subject-folder${
                        isStudyOpen ? " submenu-open" : ""
                      }`}
                    >
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
                      >
                        <span className="study-label-name">{studyName}</span>
                        {studyMeta && (
                          <small className="study-label-meta">{studyMeta}</small>
                        )}
                      </div>
                    </div>

                    {isStudyOpen && (
                      <div className="nested-submenu">
                        {STUDY_SECTIONS.map((section) => {
                          const sectionKey = section.key;
                          const compositeKey = `${studyKey}__${sectionKey}`;
                          const isSectionOpen =
                            !!expandedStudySections[compositeKey];

                          if (section.expandable) {
                            const displayLabel =
                              sectionKey === "subjects"
                                ? `Subjects (${subjectCount})`
                                : section.label;

                            return (
                              <div key={compositeKey}>
                                <div
                                  className={`${getSubmenuClass(isSectionOpen)} submenu-item-with-toggle`}
                                >
                                  <button
                                    type="button"
                                    className="sidebar-expander"
                                    aria-label={
                                      isSectionOpen
                                        ? "Collapse section"
                                        : "Expand section"
                                    }
                                    onClick={(event) =>
                                      toggleStudySection(
                                        studyKey,
                                        sectionKey,
                                        event
                                      )
                                    }
                                  >
                                    {isSectionOpen ? "−" : "+"}
                                  </button>
                                  <span
                                    className="submenu-item-label"
                                    onClick={(event) =>
                                      handleExpandableSectionLabelClick(
                                        studyKey,
                                        sectionKey,
                                        isSectionOpen,
                                        event
                                      )
                                    }
                                  >
                                    {displayLabel}
                                  </span>
                                </div>

                                {isSectionOpen && sectionKey === "subjects" && (
                                  <div className="nested-submenu">
                                    {studySubjects.map((subject) => {
                                      const subjectKey = String(
                                        subject.subjectId || subject.id
                                      );
                                      const subjectFolders =
                                        getSubjectSidebarFolders(
                                          studyKey,
                                          subject
                                        );

                                      return (
                                        <div key={`${studyKey}-${subjectKey}`}>
                                          <div
                                            className="submenu-item subject-leaf"
                                            onClick={() =>
                                              handleSubjectClick(
                                                studyKey,
                                                subject
                                              )
                                            }
                                          >
                                            {subject.subjectId || subject.id}
                                          </div>
                                          {subjectFolders.map((folder) => (
                                            <div
                                              key={`${subjectKey}-${folder.id}`}
                                              className="submenu-item subject-child"
                                              onClick={() => {
                                                localStorage.setItem(
                                                  "selectedSubject",
                                                  JSON.stringify({
                                                    ...subject,
                                                    studyId: studyKey
                                                  })
                                                );
                                                handleNav(
                                                  `/study-dashboard/${studyKey}?tab=${encodeURIComponent("Subjects")}&subject=${encodeURIComponent(subjectKey)}&folder=${encodeURIComponent(folder.id)}`
                                                );
                                              }}
                                            >
                                              {folder.name}
                                            </div>
                                          ))}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {isSectionOpen && sectionKey === "studyFolder" && (
                                    <div className="nested-submenu">
                                      {renderDynamicFolderNodes(
                                        getSectionFolderNodes(
                                          "studyFolder",
                                          studyKey
                                        ),
                                        studyKey,
                                        "studyFolder"
                                      )}
                                    </div>
                                  )}
                              </div>
                            );
                          }

                          return (
                            <div
                              key={compositeKey}
                              className="submenu-item"
                              onClick={() =>
                                navigateToStudySection(studyKey, sectionKey)
                              }
                            >
                              {section.label}
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
            className={`submenu-item studies-subfolder-row${
              isCommentsRoute ? " active" : ""
            }`}
            onClick={handleStudiesCommentsClick}
          >
            Comments
          </div>
        </div>
      )}

      <div
        className={getLinkClass(isEisfRoute)}
        onClick={() => handleNav("/ereg-comments")}
      >
        <FiClipboard size={16} />
        <span>eISF</span>
      </div>

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
              pathname.includes("permission-approval")
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
          className={getLinkClass(pathname === "/logs" || pathname.startsWith("/logs/"))}
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

      <div
        className={getLinkClass(pathname.includes("/profile"))}
        onClick={() => handleNav("/profile")}
      >
        <FiUser size={16} />
        <span>Profile</span>
      </div>

      {sidebarItems.some((item) => item.key === "settings") && (
        <div
          className={getLinkClass(pathname.includes("settings"))}
          onClick={() => handleNav("/settings")}
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
