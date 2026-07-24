// UPDATED: Central role-based access service — scopes data and routes per RBAC docs

import ROLES from "../constants/roles";
import PERMISSIONS from "../constants/permissions";
import rolePermissions from "../utils/rolePermissions";
import {
  getStoredAdminPreviewRole,
  getStoredPIPreviewRole,
  setStoredAdminPreviewRole,
  setStoredPIPreviewRole
} from "../constants/headerFilters";
import { getStudies } from "./studyService";
import { PROFILE_PHOTO_EVENT } from "../constants/profileEvents";

const SITES_STORAGE_KEY = "sites";

const ORG_TO_SITE = {
  "Apollo Hospitals": "Apollo Hospital",
  "Fortis Healthcare": "Fortis Healthcare",
  "Manipal Hospitals": "City Hospital",
  "Max Healthcare": "City Hospital",
  "Aster Hospitals": "Fortis Healthcare"
};

export function getCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return JSON.parse(localStorage.getItem("currentUser")) || null;
  } catch {
    return null;
  }
}

export function getAssignedSite(user = getCurrentUser()) {
  if (!user) {
    return null;
  }

  if (user.role === ROLES.ADMIN) {
    return null;
  }

  return (
    user.assignedSite ||
    ORG_TO_SITE[user.orgType] ||
    user.orgType ||
    user.site ||
    null
  );
}

export function isAdmin(user = getCurrentUser()) {
  return user?.role === ROLES.ADMIN;
}

export function getAdminPreviewRole() {
  return getStoredAdminPreviewRole() || null;
}

export function setAdminPreviewRole(role) {
  if (!role || role === ROLES.ADMIN) {
    setStoredAdminPreviewRole("");
    return;
  }

  setStoredAdminPreviewRole(role);
}

export function getPIPreviewRole() {
  return getStoredPIPreviewRole() || null;
}

export function setPIPreviewRole(role) {
  if (!role || role === ROLES.PI) {
    setStoredPIPreviewRole("");
    return;
  }

  if (role === ROLES.SITE_STAFF) {
    setStoredPIPreviewRole(role);
  }
}

export function isPIViewingAsSiteStaff(user = getCurrentUser()) {
  return user?.role === ROLES.PI && getPIPreviewRole() === ROLES.SITE_STAFF;
}

export function getAuthenticatedRole(user = getCurrentUser()) {
  return user?.role || null;
}

export function getEffectiveRole(user = getCurrentUser()) {
  if (!user) {
    return null;
  }

  if (isAdmin(user)) {
    return getAdminPreviewRole() || ROLES.ADMIN;
  }

  if (user.role === ROLES.PI) {
    return getPIPreviewRole() || ROLES.PI;
  }

  return user.role;
}

export function getEffectiveUser(user = getCurrentUser()) {
  if (!user) {
    return null;
  }

  const effectiveRole = getEffectiveRole(user);

  if (effectiveRole === user.role) {
    return user;
  }

  return {
    ...user,
    role: effectiveRole
  };
}

export function isAdminViewingAsRole(user = getCurrentUser()) {
  return isAdmin(user) && getEffectiveRole(user) !== ROLES.ADMIN;
}

export function hasPermission(permission, user = getCurrentUser()) {
  if (!user) {
    return false;
  }

  const effectiveRole = getEffectiveRole(user);

  if (effectiveRole === ROLES.ADMIN || user.permissions?.includes("*")) {
    return true;
  }

  const permissions = rolePermissions[effectiveRole] || [];
  return permissions.includes(permission);
}

export function getDashboardPath(role) {
  switch (role) {
    case ROLES.ADMIN:
      return "/admin-dashboard";
    case ROLES.SITE_STAFF:
      return "/site-staff-dashboard";
    case ROLES.PI:
      return "/pi-dashboard";
    case ROLES.CRO:
      return "/cro-dashboard";
    case ROLES.SPONSOR:
      return "/sponsor-dashboard";
    default:
      return "/dashboard";
  }
}

function readSitesFromStorage() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(localStorage.getItem(SITES_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function getAccessibleSites(user = getCurrentUser()) {
  const sites = readSitesFromStorage();

  if (isAdmin(user)) {
    return sites;
  }

  const assignedSite = getAssignedSite(user);

  if (!assignedSite) {
    return sites;
  }

  return sites.filter(
    (site) =>
      site.name === assignedSite ||
      site.id === assignedSite ||
      site.name?.includes(assignedSite) ||
      assignedSite?.includes(site.name)
  );
}

// UPDATED: CRO and Sponsor users are not tied to a single site the way
// Site Staff / PI are — they oversee studies across many sites. Filtering
// them by assignedSite (a site-based concept) incorrectly returned zero
// studies even when the sidebar (which reads studies directly) showed
// them correctly. CRO/Sponsor now match on their organization against
// the study's cro/sponsor field instead, matching the sidebar's data
// source. Admin/Site Staff/PI behavior is unchanged.
function getUserOrgName(user) {
  return (
    user?.organization ||
    user?.orgType ||
    user?.assignedSite ||
    user?.company ||
    user?.name ||
    ""
  );
}

function matchesOrg(value, orgName) {
  if (!value || !orgName) {
    return false;
  }

  const normalizedValue = String(value).trim().toLowerCase();
  const normalizedOrg = String(orgName).trim().toLowerCase();

  return (
    normalizedValue === normalizedOrg ||
    normalizedValue.includes(normalizedOrg) ||
    normalizedOrg.includes(normalizedValue)
  );
}

export function getAccessibleStudies(user = getCurrentUser()) {
  const studies = getStudies();

  if (isAdmin(user)) {
    return studies;
  }

  const effectiveRole = user?.role;

  if (effectiveRole === ROLES.CRO || effectiveRole === ROLES.SPONSOR) {
    const orgName = getUserOrgName(user);

    if (!orgName) {
      return studies;
    }

    const studyField = effectiveRole === ROLES.CRO ? "cro" : "sponsor";

    const matchedStudies = studies.filter((study) =>
      matchesOrg(study[studyField], orgName)
    );

    // Do not exclude every study just because the org label on the study
    // doesn't happen to match the user's stored org name (e.g. legacy
    // studies created before the org field was captured consistently).
    // Fall back to showing all studies rather than an incorrect zero.
    return matchedStudies.length > 0 ? matchedStudies : studies;
  }

  const assignedSite = getAssignedSite(user);

  if (!assignedSite) {
    return studies;
  }

  return studies.filter((study) => {
    const studySite = study.site || study.location || "";
    return (
      studySite === assignedSite ||
      studySite.includes(assignedSite) ||
      assignedSite.includes(studySite)
    );
  });
}

// UPDATED: returns studies scoped to an arbitrary site name (used by Admin
// header institution filter, independent of the logged-in user's own site).
export function getStudiesForSite(siteName) {
  const studies = getStudies();

  if (!siteName) {
    return studies;
  }

  return studies.filter((study) => {
    const studySite = study.site || study.location || "";
    return (
      studySite === siteName ||
      studySite.includes(siteName) ||
      siteName.includes(studySite)
    );
  });
}

// UPDATED: role labels + list used to populate the Admin header's role
// switcher dropdown.
export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.SITE_STAFF]: "Site Staff",
  [ROLES.PI]: "Principal Investigator",
  [ROLES.CRO]: "CRO",
  [ROLES.SPONSOR]: "Sponsor"
};

export function getAllRoles() {
  return Object.values(ROLES).map((role) => ({
    value: role,
    label: ROLE_LABELS[role] || role
  }));
}

// UPDATED: roles whose dashboard the Admin header can switch into.
export const SWITCHABLE_ROLE_DASHBOARDS = [
  ROLES.SITE_STAFF,
  ROLES.PI,
  ROLES.CRO,
  ROLES.SPONSOR
];

export function filterBySite(items, siteField = "site", user = getCurrentUser()) {
  if (!Array.isArray(items)) {
    return [];
  }

  if (isAdmin(user)) {
    return items;
  }

  const assignedSite = getAssignedSite(user);

  if (!assignedSite) {
    return items;
  }

  return items.filter((item) => {
    const value = item[siteField] || item.siteName || item.location || "";
    return (
      value === assignedSite ||
      value.includes(assignedSite) ||
      assignedSite.includes(value)
    );
  });
}

export function canAccessRoute(path, user = getCurrentUser()) {
  if (!user) {
    return false;
  }

  const routeUser = getEffectiveUser(user);

  if (routeUser.role === ROLES.ADMIN) {
    return true;
  }

  const routeAccess = {
    "/admin-dashboard": [ROLES.ADMIN],
    "/admin-livechat": [ROLES.ADMIN],
    "/site-staff-dashboard": [ROLES.SITE_STAFF, ROLES.PI],
    "/site-staff-livechat": [ROLES.SITE_STAFF, ROLES.PI],
    "/pi-dashboard": [ROLES.PI],
    "/cro-dashboard": [ROLES.CRO],
    "/sponsor-dashboard": [ROLES.SPONSOR],
    "/user-management": [ROLES.ADMIN, ROLES.SITE_STAFF],
    "/permission-approval": [ROLES.ADMIN, ROLES.SITE_STAFF],
    "/access-permission": [ROLES.ADMIN, ROLES.SITE_STAFF],
    "/cro-overview": [ROLES.ADMIN, ROLES.SITE_STAFF, ROLES.CRO],
    "/sites": [ROLES.ADMIN, ROLES.CRO],
    "/portfolio": [ROLES.SPONSOR],
    "/study-oversight": [ROLES.SPONSOR],
    "/cro-oversight": [ROLES.SPONSOR],
    "/risk-management": [ROLES.SPONSOR],
    "/site-ranking": [ROLES.SPONSOR],
    "/cro-details": [ROLES.SPONSOR],
    "/cro-report": [ROLES.SPONSOR],
    "/cro-contracts": [ROLES.SPONSOR],
    "/site-details": [ROLES.SPONSOR, ROLES.ADMIN],
    "/report-details": [ROLES.SPONSOR],
    "/recruitment-details": [ROLES.SPONSOR],
    "/regulatory-details": [ROLES.SPONSOR],
    "/risk-details": [ROLES.SPONSOR],
    "/query-details": [ROLES.SPONSOR],
    "/notification-details": [ROLES.SPONSOR],
    "/screening": [ROLES.SPONSOR, ROLES.CRO],
    "/enrollment": [ROLES.SPONSOR, ROLES.CRO],
    "/visits": [ROLES.SPONSOR, ROLES.CRO],
    "/files": [ROLES.SPONSOR, ROLES.CRO],
    "/monitoring": [ROLES.CRO],
    "/site-management": [ROLES.CRO],
    "/subject-management": [ROLES.CRO],
    "/visit-management": [ROLES.CRO],
    "/add-visit": [ROLES.CRO],
    "/cro-studies": [ROLES.CRO],
    "/cro-screening": [ROLES.CRO],
    "/cro-enrollment": [ROLES.CRO],
    "/cro-eisf": [ROLES.CRO],
    "/cro-icf": [ROLES.CRO],
    "/cro-study-folder": [ROLES.CRO],
    "/cro-logs": [ROLES.CRO],
    "/cro-comments": [ROLES.CRO],
    "/cro-queries": [ROLES.CRO],
    "/cro-recruitment": [ROLES.CRO],
    "/cro-regulatory": [ROLES.CRO],
    "/cro-site-performance": [ROLES.CRO],
    "/cro-reports": [ROLES.CRO],
    "/cro-notifications": [ROLES.CRO],
    "/cro-livechat": [ROLES.CRO],
    "/cro-settings": [ROLES.CRO],
    "/cro-subject-management": [ROLES.CRO],
    "/cro-subject/:id": [ROLES.CRO],
    "/cro-monitoring": [ROLES.CRO],
    "/cro-regulatory-documents": [ROLES.CRO],
    "/cro-subjects": [ROLES.CRO],
    "/cro-visits": [ROLES.CRO],
    "/cro-files": [ROLES.CRO],
    "/queries": [ROLES.CRO, ROLES.SPONSOR],
    "/pi-comments": [ROLES.PI],
    "/pi-site-performance": [ROLES.PI],
    "/pi-recruitment": [ROLES.PI],
    "/pi-regulatory": [ROLES.PI],
    "/pi-reports": [ROLES.PI],
    "/pi-notifications": [ROLES.PI],
    "/pi-settings": [ROLES.PI],
    "/pi-subjects-dashboard": [ROLES.PI],
    "/pi-study-folder-dashboard": [ROLES.PI],
    "/pi-study-subject-profile": [ROLES.PI],
    "/pi-eisf-dashboard": [ROLES.PI],
    "/pi-icf-dashboard": [ROLES.PI],
    "/pi-livechat": [ROLES.PI],
    "/site-performance": [
      ROLES.ADMIN,
      ROLES.SITE_STAFF,
      ROLES.PI,
      ROLES.CRO,
      ROLES.SPONSOR
    ],
   "/recruitment": [
  ROLES.ADMIN,
  ROLES.SITE_STAFF,
  ROLES.PI,
  ROLES.CRO,
  ROLES.SPONSOR
],
    "/regulatory": [
      ROLES.ADMIN,
      ROLES.SITE_STAFF,
      ROLES.PI,
      ROLES.CRO,
      ROLES.SPONSOR
    ],
    "/reports": [
      ROLES.ADMIN,
      ROLES.SITE_STAFF,
      ROLES.PI,
      ROLES.CRO,
      ROLES.SPONSOR
    ],
    "/notifications": Object.values(ROLES),
    "/live-chat": [ROLES.SPONSOR, ROLES.ADMIN],
    "/settings": Object.values(ROLES),
    "/profile": Object.values(ROLES),
    "/security": Object.values(ROLES),
    "/comments": Object.values(ROLES),
    "/studies": Object.values(ROLES),
    "/logs": Object.values(ROLES),
    "/logs/training": Object.values(ROLES),
    "/logs/delegation": Object.values(ROLES),
    "/training": Object.values(ROLES),
    "/delegation": Object.values(ROLES)
  };

  const normalizedPath = path.split("?")[0].replace(/\/$/, "") || "/";

  if (
    normalizedPath.startsWith("/study-dashboard") ||
    normalizedPath.startsWith("/study/") ||
    normalizedPath.startsWith("/subject/") ||
    normalizedPath.startsWith("/visit/") ||
    normalizedPath.startsWith("/site-queries/") ||
    normalizedPath.startsWith("/site-documents/") ||
    normalizedPath.startsWith("/progress-note-details/") ||
    normalizedPath.startsWith("/visit-details/")
  ) {
    return true;
  }

  const allowedRoles = routeAccess[normalizedPath];

  if (!allowedRoles) {
    return true;
  }

  return allowedRoles.includes(routeUser.role);
}

export function getUserProfile(user = getCurrentUser()) {
  if (!user) {
    return {};
  }

  const nameParts = String(user.name || "").trim().split(/\s+/);
  const storedProfile = (() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem(`profile_${user.id || user.email}`)
        ) || {}
      );
    } catch {
      return {};
    }
  })();

  return {
    email: user.email || "",
    firstName: storedProfile.firstName || nameParts[0] || "",
    lastName: storedProfile.lastName || nameParts.slice(1).join(" ") || "",
    middleName: storedProfile.middleName || "",
    credentials: storedProfile.credentials || "",
    officePhone: storedProfile.officePhone || "",
    cellPhone: storedProfile.cellPhone || "",
    fax: storedProfile.fax || "",
    headline: storedProfile.headline || "",
    department: storedProfile.department || "",
    jobTitle: storedProfile.jobTitle || "",
    bio: storedProfile.bio || "",
    timezone: storedProfile.timezone || "Asia/Kolkata",
    profilePhoto: storedProfile.profilePhoto || user.profilePhoto || "",
    preferredLanguage: storedProfile.preferredLanguage || "English",
    assignedSite: getAssignedSite(user) || "",
    role: user.role || "",
    orgType: user.orgType || ""
  };
}

export function syncProfilePhoto(photo, user = getCurrentUser()) {
  if (!user || typeof window === "undefined") {
    return null;
  }

  const key = `profile_${user.id || user.email}`;
  let storedProfile = {};

  try {
    storedProfile = JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    storedProfile = {};
  }

  const safePhoto = photo || "";

  try {
    storedProfile.profilePhoto = safePhoto;
    localStorage.setItem(key, JSON.stringify(storedProfile));

    /*
      Do not store the same Base64 image again in a separate "profilePhoto"
      localStorage key. It wastes browser storage and causes quota errors.
    */
    localStorage.removeItem("profilePhoto");

    const updatedUser = updateCurrentUserProfile({
      profilePhoto: safePhoto,
      profileImage: safePhoto || null,
      avatar: safePhoto || null,
    });

    window.dispatchEvent(new CustomEvent(PROFILE_PHOTO_EVENT));
    return updatedUser;
  } catch (error) {
    if (error?.name === "QuotaExceededError") {
      throw new Error(
        "Profile photo could not be saved because browser storage is full. Please upload a smaller image."
      );
    }

    throw error;
  }
}

export function clearProfilePhoto(user = getCurrentUser()) {
  return syncProfilePhoto("", user);
}

export function saveUserProfile(profile, user = getCurrentUser()) {
  if (!user) {
    return null;
  }

  const key = `profile_${user.id || user.email}`;

  /*
    Save profile information without the Base64 image first.
    The photo is saved separately once by syncProfilePhoto().
  */
  const { profilePhoto, ...profileWithoutPhoto } = profile;

  try {
    localStorage.setItem(key, JSON.stringify(profileWithoutPhoto));
  } catch (error) {
    if (error?.name === "QuotaExceededError") {
      throw new Error(
        "Profile details could not be saved because browser storage is full."
      );
    }

    throw error;
  }

  const fullName = [profile.firstName, profile.middleName, profile.lastName]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const updatedUser = updateCurrentUserProfile({
    name: fullName || user.name,
    assignedSite: profile.assignedSite || user.assignedSite,
    orgType: profile.assignedSite || user.orgType,
  });

  if (Object.prototype.hasOwnProperty.call(profile, "profilePhoto")) {
    syncProfilePhoto(profilePhoto, user);
  }

  return updatedUser;
}

export function getSiteSettings(user = getCurrentUser()) {
  return getUserSettings(user);
}

export function saveSiteSettings(settings, user = getCurrentUser()) {
  return saveUserSettings(settings, user);
}

export function updateCurrentUserProfile(updates) {
  const user = getCurrentUser();

  if (!user) {
    return null;
  }

  const updatedUser = { ...user, ...updates };
  localStorage.setItem("currentUser", JSON.stringify(updatedUser));

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const index = users.findIndex((u) => u.email === user.email);

  if (index >= 0) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem("users", JSON.stringify(users));
  }

  if (updates.name) {
    localStorage.setItem("userFullName", updates.name);
  }

  return updatedUser;
}

export function updateUserPassword(currentPassword, newPassword) {
  const user = getCurrentUser();

  if (!user) {
    return { success: false, message: "User account not found." };
  }

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const userIndex = users.findIndex((entry) => entry.email === user.email);

  if (userIndex === -1) {
    return { success: false, message: "User account not found." };
  }

  if (users[userIndex].password !== currentPassword) {
    return { success: false, message: "Current password is incorrect." };
  }

  users[userIndex] = {
    ...users[userIndex],
    password: newPassword
  };
  localStorage.setItem("users", JSON.stringify(users));
  updateCurrentUserProfile({ password: newPassword });
  return { success: true, message: "Password updated successfully." };
}

export function getUserSettingsKey(user = getCurrentUser()) {
  if (isAdmin(user)) {
    return "adminSettings";
  }

  const site = getAssignedSite(user) || "default";
  return `siteSettings_${site.replace(/\s+/g, "_")}`;
}

export function getUserSettings(user = getCurrentUser()) {
  const key = getUserSettingsKey(user);

  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    /* fall through */
  }

  return {
    emailNotifications: true,
    smsNotifications: false,
    dashboardRefresh: "daily",
    preferredLanguage: "English",
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeoutMinutes: isAdmin(user) ? 60 : 30
  };
}

export function saveUserSettings(settings, user = getCurrentUser()) {
  const key = getUserSettingsKey(user);
  localStorage.setItem(key, JSON.stringify(settings));
  return settings;
}

// UPDATED: Sidebar menu items per role — same modules, scoped by site for Site Staff
export function getSidebarMenuItems(user = getCurrentUser()) {
  const effectiveUser = getEffectiveUser(user);

  if (!effectiveUser) {
    return [];
  }

  const allItems = [
    { key: "dashboard", roles: Object.values(ROLES) },
    { key: "studies", roles: Object.values(ROLES) },
    { key: "comments", roles: Object.values(ROLES) },
    { key: "site-performance", roles: Object.values(ROLES) },
    {
  key: "recruitment",
  roles: [
    ROLES.ADMIN,
    ROLES.SITE_STAFF,
    ROLES.PI,
    ROLES.CRO,
    ROLES.SPONSOR
  ]
},
    { key: "regulatory", roles: Object.values(ROLES) },
    { key: "reports", roles: Object.values(ROLES) },
    { key: "user-management", roles: [ROLES.ADMIN, ROLES.SITE_STAFF] },
    { key: "permission-approval", roles: [ROLES.ADMIN, ROLES.SITE_STAFF] },
    { key: "notifications", roles: Object.values(ROLES) },
    { key: "settings", roles: Object.values(ROLES) }
  ];

  return allItems.filter((item) => item.roles.includes(effectiveUser.role));
}

export { ROLES, PERMISSIONS };
