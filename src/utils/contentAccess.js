import ROLES from "../constants/roles";
import { getEffectiveRole, getCurrentUser } from "../services/roleService";
import { hasApprovedScope } from "../services/accessPermissionService";

const EDIT_ROLES = [ROLES.ADMIN, ROLES.SITE_STAFF, ROLES.PI];
const RESTRICTED_ROLES = [ROLES.CRO, ROLES.SPONSOR];

export function getEffectiveRoleForAccess(user = getCurrentUser()) {
  return getEffectiveRole(user);
}

export function canEditStudyContent(user = getCurrentUser()) {
  const role = getEffectiveRoleForAccess(user);
  return EDIT_ROLES.includes(role);
}

// An Admin approving a Request Edit Permission request writes an approved
// scope (see accessPermissionService.acceptAccessRequest) but nothing was
// reading it back — the user stayed permanently locked out even after
// approval, with the Edit Permission action doing nothing. This checks
// that approved scope so edit access actually unlocks once granted.
export function hasApprovedEditAccess(user = getCurrentUser(), module, studyCode = "") {
  if (!user?.email || !module) {
    return false;
  }
  return hasApprovedScope(user.email, undefined, module, "", studyCode);
}

export function canDeleteStudy(user = getCurrentUser()) {
  const role = getEffectiveRoleForAccess(user);
  return EDIT_ROLES.includes(role);
}

export function canAddStudy(user = getCurrentUser()) {
  const role = getEffectiveRoleForAccess(user);
  return [
    ROLES.ADMIN,
    ROLES.SITE_STAFF,
    ROLES.PI,
    ROLES.CRO,
    ROLES.SPONSOR
  ].includes(role);
}

export function canEditSubjectContent(user = getCurrentUser()) {
  const role = getEffectiveRoleForAccess(user);
  return EDIT_ROLES.includes(role);
}

export function canAddSubject(user = getCurrentUser()) {
  return canEditSubjectContent(user);
}

export function canComment(user = getCurrentUser()) {
  const role = getEffectiveRoleForAccess(user);
  return role !== null;
}

export function canRecruitCRO(user = getCurrentUser()) {
  return getEffectiveRoleForAccess(user) === ROLES.SPONSOR;
}

export function requiresPermissionRequest(user = getCurrentUser()) {
  const role = getEffectiveRoleForAccess(user);
  return RESTRICTED_ROLES.includes(role);
}

export function isViewOnlySubjectAccess(user = getCurrentUser()) {
  return requiresPermissionRequest(user);
}

export {
  getSubjectStatusAnalytics,
  getAllSubjectsFromStorage,
  SUBJECT_STATUS_ORDER
} from "./subjectStatusAnalytics";

export { getEnrollmentStatusAnalytics } from "./enrollmentStatusAnalytics";
