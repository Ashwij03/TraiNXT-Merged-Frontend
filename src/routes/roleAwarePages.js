import ROLES from "../constants/roles";
import { getEffectiveRole } from "../services/roleService";

import RoleCommentsView from "../components/common/RoleCommentsView";
import DashboardLayout from "../components/dashboard/shared/DashboardLayout";
import AdminComments from "../pages/Admin/Comments";
import AdminSitePerformance from "../pages/Admin/SitePerformance";
import AdminRecruitment from "../pages/Admin/Recruitment";
import AdminReports from "../pages/Admin/Reports";
import AdminNotifications from "../pages/Admin/Notifications";
import AdminSettings from "../pages/Admin/Settings";
import SharedProgressNotes from "../pages/shared/operations/ProgressNotes";
import SharedStudies from "../pages/shared/studies/Studies";
// import SharedSubjects from "../pages/shared/subjects/SubjectsDashboard";
import SponsorEnrollment from "../pages/Sponsor/Enrollment";
import SponsorQueries from "../pages/Sponsor/Queries";
import CroEnrollment from "../pages/CRO/CROEnrollment";
import CroQueries from "../pages/CRO/CROQueries";

import SponsorSitePerformance from "../pages/Sponsor/SitePerformance";
import SponsorRecruitment from "../pages/Sponsor/Recruitment";
import SponsorRegulatory from "../pages/Sponsor/Regulatory";
import SponsorReports from "../pages/Sponsor/Reports";
import SponsorNotifications from "../pages/Sponsor/Notifications";
import SponsorSettings from "../pages/Sponsor/Settings";
import SponsorProgressNotes from "../pages/Sponsor/ProgressNotes";
import SponsorSubjects from "../pages/Sponsor/Subjects";

import CroSitePerformance from "../pages/CRO/CROSitePerformance";
import CroRecruitment from "../pages/CRO/Recruitment";
import CroRegulatory from "../pages/CRO/CRORegulatoryDocuments";
import CroReports from "../pages/CRO/CROReports";
import CroNotifications from "../pages/CRO/CRONotifications";
import CroSettings from "../pages/CRO/CROSettings";

import PISitePerformance from "../pages/PI/PISitePerformance";
import PISettings from "../pages/PI/PISettings";

function pickComponent(roleMap, defaultComponent) {
  const role = getEffectiveRole();
  return roleMap[role] || defaultComponent;
}

// The Admin role no longer has a dedicated Regulatory page (it was an
// orphaned page with no sidebar/nav link anywhere in the app). This is
// the fallback shown to any role without its own Regulatory page if the
// /regulatory route is ever reached directly.
function RegulatoryUnavailable() {
  return (
    <DashboardLayout>
      <div style={{ padding: "40px 24px" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 22 }}>Regulatory</h1>
        <p style={{ margin: 0, color: "#6b7280" }}>
          This page isn't available for your role.
        </p>
      </div>
    </DashboardLayout>
  );
}

function withDashboardLayout(Component) {
  return function DashboardLayoutWrapper(props) {
    return (
      <DashboardLayout>
        <Component {...props} />
      </DashboardLayout>
    );
  };
}

const PISettingsWithLayout = withDashboardLayout(PISettings);
const PISitePerformanceWithLayout = withDashboardLayout(PISitePerformance);

export function RoleAwareComments() {
  return (
    <DashboardLayout>
      <RoleCommentsView />
    </DashboardLayout>
  );
}

export function RoleAwareSitePerformance() {
  const Component = pickComponent(
    {
      [ROLES.SPONSOR]: SponsorSitePerformance,
      [ROLES.CRO]: CroSitePerformance,
      [ROLES.PI]: PISitePerformanceWithLayout
    },
    AdminSitePerformance
  );
  return <Component />;
}

export function RoleAwareRecruitment() {
  const Component = pickComponent(
    {
      [ROLES.SPONSOR]: SponsorRecruitment,
      [ROLES.CRO]: CroRecruitment
    },
    AdminRecruitment
  );
  return <Component />;
}

export function RoleAwareRegulatory() {
  const Component = pickComponent(
    {
      [ROLES.SPONSOR]: SponsorRegulatory,
      [ROLES.CRO]: CroRegulatory
    },
    RegulatoryUnavailable
  );
  return <Component />;
}

export function RoleAwareReports() {
  const Component = pickComponent(
    {
      [ROLES.SPONSOR]: SponsorReports,
      [ROLES.CRO]: CroReports
    },
    AdminReports
  );
  return <Component />;
}

export function RoleAwareNotifications() {
  const Component = pickComponent(
    {
      [ROLES.SPONSOR]: SponsorNotifications,
      [ROLES.CRO]: CroNotifications
    },
    AdminNotifications
  );
  return <Component />;
}

export function RoleAwareSettings() {
  const Component = pickComponent(
    {
      [ROLES.SPONSOR]: SponsorSettings,
      [ROLES.CRO]: CroSettings,
      [ROLES.PI]: PISettingsWithLayout,
    },
    AdminSettings
  );
  return <Component />;
}

export function RoleAwareProgressNotes() {
  const Component = pickComponent(
    {
      [ROLES.SPONSOR]: SponsorProgressNotes
    },
    SharedProgressNotes
  );
  return <Component />;
}

export function RoleAwareStudies() {
  return <SharedStudies />;
}

export function RoleAwareEnrollment() {
  const Component = pickComponent(
    {
      [ROLES.SPONSOR]: SponsorEnrollment,
      [ROLES.CRO]: CroEnrollment
    },
    SponsorEnrollment
  );
  return <Component />;
}

export function RoleAwareQueries() {
  const Component = pickComponent(
    {
      [ROLES.SPONSOR]: SponsorQueries,
      [ROLES.CRO]: CroQueries
    },
    AdminComments
  );
  return <Component />;
}

export function RoleAwareSubjects() {
  const Component = pickComponent(
    {
      [ROLES.SPONSOR]: SponsorSubjects
    },
    // SharedSubjects
  );
  return <Component />;
}