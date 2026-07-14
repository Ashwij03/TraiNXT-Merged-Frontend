import { useEffect, useMemo, useRef, useState } from "react";
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
  FiSettings,
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
  isAdmin,
  ROLE_LABELS,
  setAdminPreviewRole,
} from "../../services/roleService";
import { PROFILE_PHOTO_EVENT } from "../../constants/profileEvents";
import {
  terminateCurrentSession,
  touchUserSession,
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
  SELECTED_SUBJECT_KEY,
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
  setStoredSubjectFilter,
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
  getSubjectOptions,
} from "../../services/filterService";
import useLiveChatNavigation from "../../hooks/useLiveChatNavigation";

function EnterpriseNavbarBase({
  onToggleSidebar,
  sidebarOpen,
  layoutRole,
  liveChatPath,
  navbarClassName = "",
  setSelectedPage,
}) {
  const navigate = useNavigate();
  const profileSectionRef = useRef(null);

  const currentUser = getCurrentUser();
  const userEmail = currentUser?.email || "";
  const { openLiveChat } = useLiveChatNavigation(liveChatPath);

  const userIsAdmin = isAdmin(currentUser);
  const effectiveRole =
    getEffectiveRole(currentUser) || layoutRole || ROLES.ADMIN;

  const [profileOpen, setProfileOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterVersion, setFilterVersion] = useState(0);

  const { notifications, unreadCount, handleToggleRead, handleMarkAllRead } =
    useAdminNavbarNotifications();

  const [previewRole, setPreviewRoleState] = useState(
    () => effectiveRole || ROLES.ADMIN
  );

  const [profilePhoto, setProfilePhoto] = useState(
    currentUser?.profilePhoto || ""
  );

  const [selectedIndication, setSelectedIndication] = useState(
    getStoredIndicationFilter
  );

  const [selectedSponsor, setSelectedSponsor] = useState(
    getStoredSponsorFilter
  );

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

  const [selectedSubject, setSelectedSubject] = useState(
    getStoredSubjectFilter
  );

  const indicationOptions = useMemo(() => {
    void filterVersion;
    return getIndicationOptions(currentUser);
  }, [filterVersion, currentUser]);

  const sponsorOptions = useMemo(() => {
    void filterVersion;
    return getSponsorOptions(currentUser);
  }, [filterVersion, currentUser]);

  const croOptions = useMemo(() => {
    void filterVersion;

    if (effectiveRole === ROLES.SPONSOR) {
      return getRecruitedCROOptions(currentUser);
    }

    return getCROOptions(currentUser);
  }, [effectiveRole, filterVersion, currentUser]);

  const institutionOptions = useMemo(() => {
    void filterVersion;
    return getInstitutionOptions(currentUser);
  }, [filterVersion, currentUser]);

  const siteNumberOptions = useMemo(() => {
    void filterVersion;
    return getSiteNumberOptions(currentUser);
  }, [filterVersion, currentUser]);

  const studyOptions = useMemo(() => {
    void filterVersion;
    return getStudyOptions(currentUser);
  }, [filterVersion, currentUser]);

  const subjectOptions = useMemo(() => {
    void filterVersion;
    return getSubjectOptions(currentUser);
  }, [filterVersion, currentUser]);

  const filterOrder = useMemo(() => {
    let base;

    if (userIsAdmin) {
      if (effectiveRole === ROLES.ADMIN) {
        base = FILTER_ORDERS[ROLES.ADMIN];
      } else {
        const previewFilters = FILTER_ORDERS[effectiveRole] || [];
        base = ["role", ...previewFilters.filter((key) => key !== "role")];
      }
    } else {
      base = FILTER_ORDERS[effectiveRole] || FILTER_ORDERS[ROLES.ADMIN];
    }

    if (effectiveRole === ROLES.SPONSOR && croOptions.length === 0) {
      return base.filter((key) => key !== "cro");
    }

    return base;
  }, [userIsAdmin, effectiveRole, croOptions.length]);

  useEffect(() => {
    touchUserSession(getCurrentUser());
  }, [userEmail]);

  useEffect(() => {
    const refreshProfilePhoto = () => {
      const current = getCurrentUser();
      setProfilePhoto(current?.profilePhoto || "");
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
      setPreviewRoleState(
        getEffectiveRole(getCurrentUser()) || ROLES.ADMIN
      );
    };

    window.addEventListener(
      ADMIN_PREVIEW_ROLE_EVENT,
      handlePreviewRoleChange
    );

    return () => {
      window.removeEventListener(
        ADMIN_PREVIEW_ROLE_EVENT,
        handlePreviewRoleChange
      );
    };
  }, [userEmail]);

  useEffect(() => {
    const handleOutsideProfileClick = (event) => {
      if (
        profileOpen &&
        profileSectionRef.current &&
        !profileSectionRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideProfileClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideProfileClick);
    };
  }, [profileOpen]);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  const handleLogout = () => {
    terminateCurrentSession();

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("adminPreviewRole");
    localStorage.removeItem("currentUser");

    setAdminPreviewRole(null);

    setProfileOpen(false);
    navigate("/login");
  };

  const handleHomeNavigation = () => {
    setProfileOpen(false);
    setFiltersOpen(false);

    const currentRole =
      getEffectiveRole(getCurrentUser()) || layoutRole || ROLES.ADMIN;

    const dashboardPath = getDashboardPath(currentRole);

    if (typeof setSelectedPage === "function") {
      setSelectedPage("dashboard");
    }

    navigate(dashboardPath);
  };

  const navigateToSettingsSection = (section) => {
    const role = getEffectiveRole(getCurrentUser());

    let path = "/settings";

    if (role === ROLES.CRO) {
      path = "/cro-settings";
    }

    if (role === ROLES.PI) {
      path = "/pi-settings";
    }

    setProfileOpen(false);

    navigate(path, {
      state: { section },
    });
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

    if (!subjectId) {
      setStoredSubjectFilter("");
      return;
    }

    // Subject options carry a "studyKey" (the study code they belong to) —
    // see getSubjectOptions in filterService.js. Fall back to whatever study
    // is currently selected in the header if a match isn't found.
    const matchedOption = subjectOptions.find(
      (option) => String(option.value) === String(subjectId)
    );

    const studyCode = matchedOption?.studyKey || selectedStudyCode;

    if (!studyCode) {
      // No study context to navigate into — just remember the raw id.
      setStoredSubjectFilter(subjectId);
      return;
    }

    // Store the same { id, studyId } shape that StudySubjects.js,
    // DashboardSidebar.js and the PI/CRO subject pages already read from
    // the "selectedSubject" key so the destination page opens directly
    // on this subject.
    localStorage.setItem(
      SELECTED_SUBJECT_KEY,
      JSON.stringify({ id: subjectId, studyId: studyCode })
    );

    navigate(
      `/study-dashboard/${encodeURIComponent(
        studyCode
      )}?tab=Subjects&subject=${encodeURIComponent(subjectId)}`
    );
  };

  const updateFilter = (key, value, setter) => {
    setter(value);

    const storageMap = {
      indication: [SELECTED_INDICATION_KEY, setStoredIndicationFilter],
      sponsor: [SELECTED_SPONSOR_KEY, setStoredSponsorFilter],
      cro: [SELECTED_CRO_KEY, setStoredCROFilter],
      siteName: [SELECTED_INSTITUTION_KEY, setStoredInstitutionFilter],
      siteNumber: [SELECTED_SITE_NUMBER_KEY, setStoredSiteNumberFilter],
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
              ...indicationOptions,
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
              ...sponsorOptions,
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
            onChange={(value) =>
              updateFilter("cro", value, setSelectedCRO)
            }
            options={[
              { value: "", label: "All CROs" },
              ...croOptions,
            ]}
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
            placeholder={
              selectedIndication || selectedInstitution
                ? "Select Study"
                : "Select Study"
            }
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
            placeholder={
              selectedIndication || selectedInstitution
                ? "Select Subject"
                : "Select Subject"
            }
            searchPlaceholder="Search Subject"
            className="header-dropdown"
          />
        );

      default:
        return null;
    }
  };

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
          onClick={() => setFiltersOpen((previousValue) => !previousValue)}
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
              onClick={handleHomeNavigation}
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
              onClick={() => navigateToSettingsSection("profile")}
            >
              <FiSettings />
            </button>
          </div>

          <div
            ref={profileSectionRef}
            className="profile-section"
            onClick={() => setProfileOpen((previousValue) => !previousValue)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setProfileOpen((previousValue) => !previousValue);
              }
            }}
          >
            <div className="profile-avatar">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt=""
                  className="profile-avatar-img"
                />
              ) : (
                currentUser?.name?.charAt(0)?.toUpperCase()
              )}
            </div>

            <div>
              <div className="profile-name">{currentUser?.name || "User"}</div>
              <div className="profile-role">{profileRoleLabel}</div>
            </div>

            <FiChevronDown />

            {profileOpen && (
              <div
                className="profile-dropdown"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => navigateToSettingsSection("profile")}
                >
                  Profile
                </button>

                <button
                  type="button"
                  onClick={() => navigateToSettingsSection("account")}
                >
                  Account Settings
                </button>

                <button
                  type="button"
                  onClick={() => navigateToSettingsSection("security")}
                >
                  Security
                </button>

                <button type="button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnterpriseNavbarBase;