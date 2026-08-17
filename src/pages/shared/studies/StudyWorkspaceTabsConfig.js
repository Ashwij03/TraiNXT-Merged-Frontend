// ===== START F1 CHANGES =====

import ROLES from "../../../constants/roles";
import { getEffectiveRole } from "../../../services/roleService";

// ===== START TASK 3 (Financials access): Admin + PI only =====
// Financials is restricted to Admin and PI. getEffectiveRole() already
// resolves the Admin/PI "preview as role" state, so an Admin previewing
// as SiteStaff / CRO / Sponsor is correctly treated as that role here.
export const FINANCIALS_ALLOWED_ROLES = [ROLES.ADMIN, ROLES.PI];

export function canViewFinancials(currentUser) {
  return FINANCIALS_ALLOWED_ROLES.includes(getEffectiveRole(currentUser));
}
// ===== END TASK 3 (Financials access) =====

export const STUDY_WORKSPACE_TABS = [
  {
    id: "overview",
    label: "Overview",
  },
  {
    id: "subjects",
    label: "Subjects",
  },
  {
    id: "eisf",
    label: "eISF",
  },
  {
    id: "logs",
    label: "Logs",
  },
  {
    id: "planning",
    label: "Planning",
  },
  {
    id: "visit-plan",
    label: "Visit Plan",
  },
  // ===== START G1 CHANGES =====
  {
    id: "clinical-sites",
    label: "Clinical Sites",
  },
// ===== END G1 CHANGES =====
  // ===== START ITEM 16: Regulatory tab removed from Studies module =====
  // {
  //   id: "regulatory",
  //   label: "Regulatory",
  // },
  // ===== END ITEM 16 =====
  {
    id: "reports",
    label: "Reports",
  },
  {
    id: "study-files",
    label: "Study Files",
  },
  {
    id: "financials",
    label: "Financials",
  },
  {
    id: "others",
    label: "Others",
  },
  {
    id: "activity",
    label: "Activity"
}
];

// ===== END F1 CHANGES =====