import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardHeader.css";
import SearchableDropdown from "../common/SearchableDropdown";
import RoleSwitcherDropdown from "../common/RoleSwitcherDropdown";
import NavbarNotificationsDropdown from "../common/NavbarNotificationsDropdown";
import {
  FiHome,
  FiMessageSquare,
  FiChevronDown,
  FiMenu,
  FiSliders,
  FiSettings
} from "react-icons/fi";
import { useAdminNavbarNotifications } from "../../hooks/useAdminNavbarNotifications";
import {
  FILTER_ORDERS,
  FILTER_LABELS,
  ROLE_BADGE_CLASSES,
} from "./enterpriseHeaderConfig";
import { getStudyByCode } from "../../services/studyService";
import ROLES from "../../constants/roles";
import {
  getCurrentUser,
  getDashboardPath,
  getEffectiveRole,
  getUserProfile,
  isAdmin,
  ROLE_LABELS,
  setAdminPreviewRole
} from "../../services/roleService";
import { PROFILE_PHOTO_EVENT } from "../../constants/profileEvents";
import {
  terminateCurrentSession,
  touchUserSession
} from "../../services/sessionService";
import {
  ADMIN_PREVIEW_ROLE_EVENT,
  clearDependentFilters,
  HEADER_FILTERS_EVENT,
  SELECTED_CRO_KEY,
  SELECTED_INDICATION_KEY,
  SELECTED_INSTITUTION_KEY,
  SELECTED_SITE_NUMBER_KEY,
  SELECTED_SPONSOR_KEY,
  SELECTED_STUDY_FILTER_KEY,
  getStoredCROFilter,
  getStoredIndicationFilter,
  getStoredInstitutionFilter,
  getStoredSiteNumberFilter,
  getStoredSponsorFilter,
  getStoredStudyFilter,
  getStoredSubjectFilter,
  setStoredCROFilter,
  setStoredIndicationFilter,
  setStoredInstitutionFilter,
  setStoredSiteNumberFilter,
  setStoredSponsorFilter,
  setStoredStudyFilter,
  setStoredSubjectFilter
} from "../../constants/headerFilters";
import {
  getCROOptions,
  getDefaultInstitution,
  getIndicationOptions,
  getInstitutionOptions,
  getRecruitedCROOptions,
  getSiteNumberOptions,
  getSponsorOptions,
  getStudyOptions,
  getSubjectOptions
} from "../../services/filterService";
import useLiveChatNavigation from "../../hooks/useLiveChatNavigation";
function EnterpriseNavbarBase({
  onToggleSidebar,
  sidebarOpen,
  layoutRole,
  liveChatPath,
  navbarClassName = "",
}) {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userEmail = currentUser?.email || "";
  const { openLiveChat } = useLiveChatNavigation(liveChatPath);
  const userIsAdmin = isAdmin(currentUser);
  const effectiveRole = getEffectiveRole(currentUser) || ROLES.ADMIN;

  const [profileOpen, setProfileOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterVersion, setFilterVersion] = useState(0);
  const {
    notifications,
    unreadCount,
    handleToggleRead,
    handleMarkAllRead,
  } = useAdminNavbarNotifications();
  const [previewRole, setPreviewRoleState] = useState(
    () => effectiveRole || ROLES.ADMIN
  );
 const current = JSON.parse(localStorage.getItem("currentUser"));

const [profilePhoto, setProfilePhoto] = useState(
  current?.profilePhoto || localStorage.getItem("profilePhoto") || ""
);

  const [selectedIndication, setSelectedIndication] = useState(
    getStoredIndicationFilter
  );
  const [selectedSponsor, setSelectedSponsor] = useState(getStoredSponsorFilter);
  const [selectedCRO, setSelectedCRO] = useState(getStoredCROFilter);
  const [selectedInstitution, setSelectedInstitution] = useState(
    () => getStoredInstitutionFilter() || getDefaultInstitution(currentUser)
  );
  const [selectedSiteNumber, setSelectedSiteNumber] = useState(
    getStoredSiteNumberFilter
  );
  const [selectedStudyCode, setSelectedStudyCode] = useState(
    getStoredStudyFilter
  );
  const [selectedSubject, setSelectedSubject] = useState(getStoredSubjectFilter);

  const indicationOptions = useMemo(() => {
    void filterVersion;
    return getIndicationOptions(currentUser);
  }, [userEmail, filterVersion]);
  const sponsorOptions = useMemo(() => {
    void filterVersion;
    return getSponsorOptions(currentUser);
  }, [userEmail, filterVersion]);
  const croOptions = useMemo(() => {
    void filterVersion;
    if (effectiveRole === ROLES.SPONSOR) {
      return getRecruitedCROOptions(currentUser);
    }
    return getCROOptions(currentUser);
  }, [userEmail, effectiveRole, filterVersion]);
  const filterOrder = useMemo(() => {
    let base;

    if (userIsAdmin) {
      if (effectiveRole === ROLES.ADMIN) {
        base = FILTER_ORDERS[ROLES.ADMIN];
      } else {
        const previewFilters = FILTER_ORDERS[effectiveRole] || [];
        base = [
          "role",
          ...previewFilters.filter((key) => key !== "role")
        ];
      }
    } else {
      base = FILTER_ORDERS[effectiveRole] || FILTER_ORDERS[ROLES.ADMIN];
    }

    if (effectiveRole === ROLES.SPONSOR && croOptions.length === 0) {
      return base.filter((key) => key !== "cro");
    }

    return base;
  }, [userIsAdmin, effectiveRole, croOptions.length]);
  const institutionOptions = useMemo(() => {
    void filterVersion;
    return getInstitutionOptions(currentUser);
  }, [userEmail, filterVersion]);
  const siteNumberOptions = useMemo(() => {
    void filterVersion;
    return getSiteNumberOptions(currentUser);
  }, [userEmail, filterVersion]);
  const studyOptions = useMemo(() => {
    void filterVersion;
    return getStudyOptions(currentUser);
  }, [userEmail, filterVersion]);
  const subjectOptions = useMemo(() => {
    void filterVersion;
    return getSubjectOptions(currentUser);
  }, [userEmail, filterVersion]);

  useEffect(() => {
    touchUserSession(getCurrentUser());
  }, [userEmail]);

  useEffect(() => {
  const refreshProfilePhoto = () => {
    const current = JSON.parse(localStorage.getItem("currentUser"));

    setProfilePhoto(
      current?.profilePhoto || localStorage.getItem("profilePhoto") || ""
    );
  };

  window.addEventListener(PROFILE_PHOTO_EVENT, refreshProfilePhoto);

  return () => {
    window.removeEventListener(PROFILE_PHOTO_EVENT, refreshProfilePhoto);
  };
}, []);

  useEffect(() => {
    const bumpFilters = () => setFilterVersion((value) => value + 1);

    window.addEventListener(HEADER_FILTERS_EVENT, bumpFilters);
    window.addEventListener(ADMIN_PREVIEW_ROLE_EVENT, bumpFilters);

    return () => {
      window.removeEventListener(HEADER_FILTERS_EVENT, bumpFilters);
      window.removeEventListener(ADMIN_PREVIEW_ROLE_EVENT, bumpFilters);
    };
  }, []);

  useEffect(() => {
    const handlePreviewRoleChange = () => {
      setPreviewRoleState((current) => {
        const next = getEffectiveRole(getCurrentUser()) || ROLES.ADMIN;
        return current === next ? current : next;
      });
    };

    window.addEventListener(ADMIN_PREVIEW_ROLE_EVENT, handlePreviewRoleChange);

    return () => {
      window.removeEventListener(
        ADMIN_PREVIEW_ROLE_EVENT,
        handlePreviewRoleChange
      );
    };
  }, [userEmail]);
const handleLogout = () => {
  terminateCurrentSession();

  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("adminPreviewRole");
  localStorage.removeItem("currentUser");

  setAdminPreviewRole(null);

  navigate("/login");
};
 const handleProfileNavigation = () => {
  const role = getEffectiveRole(getCurrentUser());

  let path = "/settings";

  switch (role) {
    case ROLES.ADMIN:
      path = "/settings";
      break;

    case ROLES.SPONSOR:
      path = "/settings";
      break;

    case ROLES.CRO:
      path = "/cro-settings";
      break;

    case ROLES.PI:
      path = "/pi-settings";
      break;

    case ROLES.SITE_STAFF:
      path = "/settings";
      break;

    default:
      path = "/settings";
  }

  navigate(path, {
    state: {
      openModal: "profile",
    },
  });

  setProfileOpen(false);
};
  const openStudy = (study) => {
    if (!study) {
      return;
    }

    localStorage.setItem("selectedStudy", JSON.stringify(study));
    navigate(`/study-dashboard/${study.code}`);
  };

  const handleStudyChange = (code) => {
    setSelectedStudyCode(code);
    setStoredStudyFilter(code);
    clearDependentFilters(SELECTED_STUDY_FILTER_KEY);
    setSelectedSubject("");
    openStudy(getStudyByCode(code));
  };

  const handleSubjectChange = (subjectId) => {
    setSelectedSubject(subjectId);
    setStoredSubjectFilter(subjectId);

    if (subjectId) {
      navigate(`/subject/${subjectId}`);
    }
  };

  const updateFilter = (key, value, setter) => {
    setter(value);

    const storageMap = {
      indication: [SELECTED_INDICATION_KEY, setStoredIndicationFilter],
      sponsor: [SELECTED_SPONSOR_KEY, setStoredSponsorFilter],
      cro: [SELECTED_CRO_KEY, setStoredCROFilter],
      siteName: [SELECTED_INSTITUTION_KEY, setStoredInstitutionFilter],
      siteNumber: [SELECTED_SITE_NUMBER_KEY, setStoredSiteNumberFilter]
    };

    const entry = storageMap[key];

    if (entry) {
      entry[1](value);
      clearDependentFilters(entry[0]);
      setFilterVersion((current) => current + 1);
    }

    if (key === "siteName") {
      setSelectedSiteNumber("");
      setSelectedStudyCode("");
      setSelectedSubject("");
    }

    if (key === "siteNumber") {
      setSelectedStudyCode("");
      setSelectedSubject("");
    }

    if (key === "indication" || key === "sponsor" || key === "cro") {
      setSelectedStudyCode("");
      setSelectedSubject("");
    }
  };

  const renderFilterControl = (filterKey) => {
    switch (filterKey) {
      case "role":
        return (
          <div className="header-role-control">
            <RoleSwitcherDropdown />
            {userIsAdmin && previewRole !== ROLES.ADMIN && (
              <span className="header-preview-indicator">
                Viewing: {ROLE_LABELS[previewRole] || previewRole}
              </span>
            )}
          </div>
        );
      case "indication":
        return (
          <SearchableDropdown
            value={selectedIndication}
            onChange={(value) =>
              updateFilter("indication", value, setSelectedIndication)
            }
            options={[
              { value: "", label: "All Indications" },
              ...indicationOptions
            ]}
            placeholder="All Indications"
            searchPlaceholder="Search Indication"
            className="header-dropdown"
          />
        );
      case "sponsor":
        return (
          <SearchableDropdown
            value={selectedSponsor}
            onChange={(value) =>
              updateFilter("sponsor", value, setSelectedSponsor)
            }
            options={[
              { value: "", label: "All Sponsors" },
              ...sponsorOptions
            ]}
            placeholder="All Sponsors"
            searchPlaceholder="Search Sponsor"
            className="header-dropdown"
          />
        );
      case "cro":
        if (effectiveRole === ROLES.SPONSOR && croOptions.length === 0) {
          return (
            <span className="header-static-value header-static-value--muted">
              No CROs recruited
            </span>
          );
        }

        return (
          <SearchableDropdown
            value={selectedCRO}
            onChange={(value) => updateFilter("cro", value, setSelectedCRO)}
            options={[{ value: "", label: "All CROs" }, ...croOptions]}
            placeholder="All CROs"
            searchPlaceholder="Search CRO"
            className="header-dropdown"
          />
        );
      case "study":
        return (
          <SearchableDropdown
            value={selectedStudyCode}
            onChange={handleStudyChange}
            options={studyOptions}
            placeholder="Select Study"
            searchPlaceholder="Search Study Number"
            className="header-dropdown"
          />
        );
      case "siteName":
        return (
          <SearchableDropdown
            value={selectedInstitution}
            onChange={(value) =>
              updateFilter("siteName", value, setSelectedInstitution)
            }
            options={institutionOptions}
            placeholder="All Institutions"
            searchPlaceholder="Search Institution"
            className="header-dropdown"
          />
        );
      case "siteNumber":
        return (
          <SearchableDropdown
            value={selectedSiteNumber}
            onChange={(value) =>
              updateFilter("siteNumber", value, setSelectedSiteNumber)
            }
            options={siteNumberOptions}
            placeholder="All Site Numbers"
            searchPlaceholder="Search Site Number"
            className="header-dropdown"
          />
        );
      case "subject":
        return (
          <SearchableDropdown
            value={selectedSubject}
            onChange={handleSubjectChange}
            options={subjectOptions}
            placeholder="Select Subject"
            searchPlaceholder="Search Subject"
            className="header-dropdown"
          />
        );
      default:
        return null;
    }
  };

  const dashboardPath = getDashboardPath(effectiveRole);
  const badgeRole = userIsAdmin ? ROLES.ADMIN : currentUser?.role;
  const badgeLabel = ROLE_LABELS[badgeRole] || badgeRole || "User";
  const badgeClass = ROLE_BADGE_CLASSES[badgeRole] || "role-badge--default";
  const profileRoleLabel = userIsAdmin
    ? ROLE_LABELS[ROLES.ADMIN]
    : ROLE_LABELS[currentUser?.role] || currentUser?.role || "User";

  return (
    <div className={`enterprise-header ${navbarClassName}`.trim()}>
      <div className="header-unified-row">
        <button
          type="button"
          className="header-menu-toggle"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={sidebarOpen}
        >
          <FiMenu />
        </button>

        <div className="header-identity-inline">
          <span className="header-welcome-text">Welcome</span>
          <span className={`role-badge ${badgeClass}`}>{badgeLabel}</span>
          <span className="header-username-inline">
            {currentUser?.name || "User"}
          </span>
        </div>

        <button
          type="button"
          className="header-filter-toggle"
          onClick={() => setFiltersOpen((prev) => !prev)}
          aria-label="Toggle filters"
          aria-expanded={filtersOpen}
        >
          <FiSliders />
          <span>Filters</span>
        </button>

        <div className={`header-filters-grid${filtersOpen ? " is-open" : ""}`}>
          {filterOrder.map((filterKey) => (
            <div className="header-filter-column" key={filterKey}>
              <div className="header-filter-heading">
                {FILTER_LABELS[filterKey] || filterKey}
              </div>
              <div className="header-filter-control">
                {renderFilterControl(filterKey)}
              </div>
            </div>
          ))}
        </div>

        <div className="header-right">
          <div className="header-menu">
            <button
              type="button"
              className="header-action-btn header-action-btn--outline"
              onClick={() => navigate(dashboardPath)}
            >
              <FiHome />
              <span>Home</span>
            </button>

            <button
              type="button"
              className="header-action-btn header-action-btn--outline"
              onClick={openLiveChat}
            >
              <FiMessageSquare />
              <span>Live Chat</span>
            </button>

            <NavbarNotificationsDropdown
              notifications={notifications}
              unreadCount={unreadCount}
              onToggleRead={handleToggleRead}
              onMarkAllRead={handleMarkAllRead}
              onViewAll={() => navigate("/notifications")}
              buttonClassName="header-icon-btn"
            />

            <button
              type="button"
              className="header-icon-btn"
              aria-label="Settings"
              onClick={() => navigate("/settings")}
            >
              <FiSettings />
            </button>
          </div>

          <div
            className="profile-section"
            onClick={() => setProfileOpen((prev) => !prev)}
          >
            <div className="profile-avatar">
              {profilePhoto ? (
                <img src={profilePhoto} alt="" className="profile-avatar-img" />
              ) : (
                currentUser?.name?.charAt(0)?.toUpperCase()
              )}
            </div>

            <div>
              <div className="profile-name">{currentUser?.name}</div>
              <div className="profile-role">{profileRoleLabel}</div>
            </div>

            <span>
              <FiChevronDown />
            </span>

            {profileOpen && (
              <div className="profile-dropdown">
                <div onClick={handleProfileNavigation}>Profile</div>
                <div onClick={() => navigate("/settings")}>
                  Account Settings
                </div>
                <div onClick={() => navigate("/security")}>Security</div>
                <div onClick={handleLogout}>Logout</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnterpriseNavbarBase;
