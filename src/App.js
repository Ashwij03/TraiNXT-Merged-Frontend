import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./auth/Login";
import Register from "./auth/Register";
import Dashboard from "./Dashboard";
import ProfilePage from "./pages/shared/profile/ProfilePage";
import SecurityPage from "./pages/shared/profile/SecurityPage";
import ROLES from "./constants/roles";
import StudyDashboard from "./pages/shared/studies/StudyDashboard";
import VisitDetails from "./pages/shared/visits/VisitDetails";
import CompletedVisit from "./pages/shared/visits/CompletedVisit";
// import SubjectProfilePage from "./pages/shared/subjects/SubjectProfilePage";
import SubjectPage from "./pages/shared/subjects/SubjectPage";
import ProtectedRoute from "./auth/ProtectedRoute";
import ForgotPassword from "./auth/ForgotPassword";
import EISFHub from "./pages/shared/documents/EISFHub";

import OperationsComments from "./pages/shared/operations/Comments";
import StudyCommentsPage from "./pages/shared/studies/StudyCommentsPage";
import StudyLogsPage from "./pages/shared/studies/StudyLogsPage";
import FileDetails from "./pages/shared/documents/FileDetails";

import AdminDashboard from "./pages/Admin/Dashboard";
import SiteStaffDashboard from "./pages/SiteStaff/Dashboard";
import PIDashboard from "./pages/PI/PIDashboard";
import CRODashboard from "./pages/CRO/CRODashboard";
import SponsorDashboard from "./pages/Sponsor/SponsorDashboard";
import AccessRequestForm from "./pages/shared/AccessRequestForm";
import AccessPermissions from "./pages/shared/AccessPermissions";
import PermissionApproval from "./pages/shared/PermissionApproval";
import UserManagement from "./pages/shared/UserManagement";
import CROOverview from "./pages/CRO/CROOverview";

import Sites from "./pages/Admin/Sites";
import LogsPage from "./pages/shared/logs/LogsPage";
import TrainingLogPage from "./pages/shared/logs/TrainingLogPage";
import DelegationLogPage from "./pages/shared/logs/DelegationLogPage";
import {
  getDashboardPath,
  getCurrentUser,
  getEffectiveRole,
} from "./services/roleService";
import EISFDashboard from "./pages/shared/EISF/EDashboard/EISFDashboard";
import {
  RoleAwareComments,
  RoleAwareNotifications,
  RoleAwareProgressNotes,
  RoleAwareRecruitment,
  RoleAwareRegulatory,
  RoleAwareReports,
  RoleAwareSettings,
  RoleAwareSitePerformance,
  RoleAwareStudies,
  RoleAwareStudyDetails,
  RoleAwareSubjects,
  RoleAwareEnrollment,
  RoleAwareQueries,
} from "./routes/roleAwarePages";

import SponsorScreening from "./pages/Sponsor/Screening";
import SponsorVisits from "./pages/Sponsor/Visits";
import SponsorFiles from "./pages/Sponsor/Files";
import PortfolioManagement from "./pages/Sponsor/PortfolioManagement";
import StudyOversight from "./pages/Sponsor/StudyOversight";
import CROOversight from "./pages/Sponsor/CROOversight";
import RiskManagement from "./pages/Sponsor/RiskManagement";
import SiteRanking from "./pages/Sponsor/SiteRanking";
import SiteQueries from "./pages/Sponsor/SiteQueries";
import SiteDocuments from "./pages/Sponsor/SiteDocuments";
import SponsorCRODetails from "./pages/Sponsor/CRODetails";
import SponsorCROReport from "./pages/Sponsor/CROReport";
import SponsorCROContracts from "./pages/Sponsor/CROContracts";
import SiteDetails from "./pages/Sponsor/SiteDetails";
import ReportDetails from "./pages/Sponsor/ReportDetails";
import RecruitmentDetails from "./pages/Sponsor/RecruitmentDetails";
import RegulatoryDetails from "./pages/Sponsor/RegulatoryDetails";
import RiskDetails from "./pages/Sponsor/RiskDetails";
import QueryDetails from "./pages/Sponsor/QueryDetails";
import NotificationDetails from "./pages/Sponsor/NotificationDetails";
import ProgressNoteDetails from "./pages/Sponsor/ProgressNoteDetails";
import SponsorVisitDetails from "./pages/Sponsor/VisitDetails";
import SponsorMonitoring from "./pages/Sponsor/Monitoring";
import SponsorQueries from "./pages/Sponsor/Queries";

import PIComments from "./pages/PI/PIComments";
import PISitePerformance from "./pages/PI/PISitePerformance";
import PIRecruitment from "./pages/PI/PIRecruitment";
import PIRegulatory from "./pages/PI/PIRegulatory";
import PIReports from "./pages/PI/PIReports";
import PINotifications from "./pages/PI/PINotifications";
import PISettings from "./pages/PI/PISettings";
import PISubjectsDashboard from "./pages/PI/PISubjectsDashboard";
import PIStudyFolderDashboard from "./pages/PI/PIStudyFolderDashboard";
import PIStudySubjectsProfile from "./pages/PI/PIStudySubjectsProfile";
import PIEISFDashboard from "./pages/PI/PIEISFDashboard";
import PIICFDashboard from "./pages/PI/PIICFDashboard";
import PILiveChat from "./pages/PI/PILiveChat";
import PIPageLayout from "./pages/PI/PIPageLayout";

import CroMonitoring from "./pages/CRO/CROMonitoring";
import CroSubjectManagement from "./pages/CRO/CROSubjectManagement";
// import CroSubjectDetail from "./pages/CRO/CROSubjectDetail";
// import CroSubjects from "./pages/CRO/CROSubjects";
import CroScreening from "./pages/CRO/CROScreening";
import CroEnrollment from "./pages/CRO/CROEnrollment";
import CroVisits from "./pages/CRO/CROVisits";
import CroComments from "./pages/CRO/CROComments";
import CroFiles from "./pages/CRO/CROFiles";
import CroSitePerformance from "./pages/CRO/CROSitePerformance";
import CroReports from "./pages/CRO/CROReports";
import CroNotifications from "./pages/CRO/CRONotifications";
import CroSettings from "./pages/CRO/CROSettings";
import CroRegulatoryDocuments from "./pages/CRO/CRORegulatoryDocuments";
import AdminLiveChat from "./pages/Admin/LiveChat";
import SiteStaffLiveChat from "./pages/SiteStaff/LiveChat";
import CROLiveChat from "./pages/CRO/CROLiveChat";
import SponsorLiveChat from "./pages/Sponsor/LiveChat";

const SPONSOR_ROLES = [ROLES.SPONSOR];
const SPONSOR_ADMIN_ROLES = [ROLES.SPONSOR, ROLES.ADMIN];
const PI_ROLES = [ROLES.PI];
const CRO_ROLES = [ROLES.CRO, ROLES.ADMIN];

function RoleAwareFallback() {
  const user = getCurrentUser();
  const destination = user?.role ? getDashboardPath(user.role) : "/login";

  return <Navigate to={destination} replace />;
}

function UnifiedSettingsRedirect({ section, children }) {
  const role = getEffectiveRole(getCurrentUser());

  if (role === ROLES.ADMIN || role === ROLES.SITE_STAFF) {
    return <Navigate to="/settings" state={{ section }} replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/completedvisit" element={<CompletedVisit />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UnifiedSettingsRedirect section="profile">
              <ProfilePage />
            </UnifiedSettingsRedirect>
          </ProtectedRoute>
        }
      />

      <Route
        path="/security"
        element={
          <ProtectedRoute>
            <UnifiedSettingsRedirect section="security">
              <SecurityPage />
            </UnifiedSettingsRedirect>
          </ProtectedRoute>
        }
      />

      <Route
        path="/studies"
        element={
          <ProtectedRoute>
            <RoleAwareStudies />
          </ProtectedRoute>
        }
      />

      <Route
        path="/study-dashboard/:id"
        element={
          <ProtectedRoute>
            <StudyDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/study/:code/logs"
        element={
          <ProtectedRoute>
            <StudyLogsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/study/:code/comments"
        element={
          <ProtectedRoute>
            <StudyCommentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/study/:code"
        element={
          <ProtectedRoute>
            <RoleAwareStudyDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/visit/:visitId"
        element={
          <ProtectedRoute>
            <VisitDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/subjects"
        element={
          <ProtectedRoute>
            <RoleAwareSubjects />
          </ProtectedRoute>
        }
      />

      {/* <Route
        path="/subject/:id"
        element={
          <ProtectedRoute>
            <SubjectProfilePage />
          </ProtectedRoute>
        }
      /> */}

      <Route
        path="/subject-page"
        element={
          <ProtectedRoute>
            <SubjectPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operations/comments"
        element={
          <ProtectedRoute>
            <OperationsComments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/comments"
        element={
          <ProtectedRoute>
            <RoleAwareComments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/progress-notes"
        element={
          <ProtectedRoute>
            <RoleAwareProgressNotes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/file-details"
        element={
          <ProtectedRoute>
            <FileDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/study-logs"
        element={
          <ProtectedRoute>
            <StudyLogsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/logs"
        element={
          <ProtectedRoute>
            <LogsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/logs/training"
        element={
          <ProtectedRoute>
            <TrainingLogPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/logs/delegation"
        element={
          <ProtectedRoute>
            <DelegationLogPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/delegation"
        element={<Navigate to="/logs/delegation" replace />}
      />

      <Route
        path="/training"
        element={<Navigate to="/logs/training" replace />}
      />

      <Route
        path="/ereg-comments"
        element={
          <ProtectedRoute>
            <EISFHub />
          </ProtectedRoute>
        }
      />

      <Route
        path="/eisf"
        element={
          <ProtectedRoute>
            <EISFDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/icf" element={<Navigate to="/ereg-comments" replace />} />
      <Route
        path="/study-folder"
        element={<Navigate to="/studies" replace />}
      />

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/site-staff-dashboard"
        element={
          <ProtectedRoute allowedRoles={[ROLES.SITE_STAFF, ROLES.PI]}>
            <SiteStaffDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pi-dashboard"
        element={
          <ProtectedRoute allowedRoles={[...PI_ROLES, ROLES.ADMIN]}>
            <PIPageLayout>
              <PIDashboard embeddedInLayout />
            </PIPageLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/cro-dashboard"
        element={
          <ProtectedRoute allowedRoles={[...CRO_ROLES, ROLES.ADMIN]}>
            <CRODashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sponsor-dashboard"
        element={
          <ProtectedRoute allowedRoles={[...SPONSOR_ROLES, ROLES.ADMIN]}>
            <SponsorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/access-request"
        element={
          <ProtectedRoute>
            <AccessRequestForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/access-permission"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SITE_STAFF]}>
            <AccessPermissions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/permission-approval"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SITE_STAFF]}>
            <PermissionApproval />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cro-overview"
        element={
          <ProtectedRoute
            allowedRoles={[ROLES.ADMIN, ROLES.SITE_STAFF, ROLES.CRO]}
          >
            <CROOverview />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user-management"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SITE_STAFF]}>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sites"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CRO]}>
            <Sites />
          </ProtectedRoute>
        }
      />

      <Route
        path="/queries"
        element={
          <ProtectedRoute>
            <RoleAwareQueries />
          </ProtectedRoute>
        }
      />

      <Route
        path="/site-performance"
        element={
          <ProtectedRoute>
            <RoleAwareSitePerformance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recruitment"
        element={
          <ProtectedRoute>
            <RoleAwareRecruitment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/regulatory"
        element={
          <ProtectedRoute>
            <RoleAwareRegulatory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <RoleAwareReports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <RoleAwareNotifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <RoleAwareSettings />
          </ProtectedRoute>
        }
      />

      {/* Sponsor-specific routes */}
      <Route
        path="/screening"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <SponsorScreening />
          </ProtectedRoute>
        }
      />
      <Route
        path="/enrollment"
        element={
          <ProtectedRoute allowedRoles={[...SPONSOR_ROLES, ...CRO_ROLES]}>
            <RoleAwareEnrollment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/visits"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <SponsorVisits />
          </ProtectedRoute>
        }
      />
      <Route
        path="/files"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <SponsorFiles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portfolio"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <PortfolioManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/study-oversight"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <StudyOversight />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cro-oversight"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <CROOversight />
          </ProtectedRoute>
        }
      />
      <Route
        path="/risk-management"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <RiskManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/site-ranking"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <SiteRanking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/site-queries/:siteId"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <SiteQueries />
          </ProtectedRoute>
        }
      />
      <Route
        path="/site-documents/:siteId"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <SiteDocuments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cro-details"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <SponsorCRODetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cro-report"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <SponsorCROReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cro-contracts"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <SponsorCROContracts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/site-details"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ADMIN_ROLES}>
            <SiteDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/report-details"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <ReportDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruitment-details"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <RecruitmentDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/regulatory-details"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <RegulatoryDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/risk-details"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <RiskDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/query-details"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <QueryDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notification-details"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <NotificationDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress-note-details/:id"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <ProgressNoteDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/visit-details/:id"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <SponsorVisitDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sponsor-monitoring"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <SponsorMonitoring />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sponsor-queries"
        element={
          <ProtectedRoute allowedRoles={SPONSOR_ROLES}>
            <SponsorQueries />
          </ProtectedRoute>
        }
      />

      {/* PI-specific routes */}
      <Route
        path="/pi-comments"
        element={
          <ProtectedRoute allowedRoles={PI_ROLES}>
            <PIPageLayout>
              <PIComments />
            </PIPageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pi-site-performance"
        element={
          <ProtectedRoute allowedRoles={PI_ROLES}>
            <PIPageLayout>
              <PISitePerformance />
            </PIPageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pi-recruitment"
        element={
          <ProtectedRoute allowedRoles={PI_ROLES}>
            <PIPageLayout>
              <PIRecruitment />
            </PIPageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pi-regulatory"
        element={
          <ProtectedRoute allowedRoles={PI_ROLES}>
            <PIPageLayout>
              <PIRegulatory />
            </PIPageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pi-reports"
        element={
          <ProtectedRoute allowedRoles={PI_ROLES}>
            <PIPageLayout>
              <PIReports />
            </PIPageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pi-notifications"
        element={
          <ProtectedRoute allowedRoles={PI_ROLES}>
            <PIPageLayout>
              <PINotifications />
            </PIPageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pi-settings"
        element={
          <ProtectedRoute allowedRoles={PI_ROLES}>
            <PIPageLayout>
              <PISettings />
            </PIPageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pi-subjects-dashboard"
        element={
          <ProtectedRoute allowedRoles={PI_ROLES}>
            <PIPageLayout>
              <PISubjectsDashboard />
            </PIPageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pi-study-folder-dashboard"
        element={
          <ProtectedRoute allowedRoles={PI_ROLES}>
            <PIPageLayout>
              <PIStudyFolderDashboard />
            </PIPageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pi-study-subject-profile"
        element={
          <ProtectedRoute allowedRoles={PI_ROLES}>
            <PIPageLayout>
              <PIStudySubjectsProfile />
            </PIPageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pi-eisf-dashboard"
        element={
          <ProtectedRoute allowedRoles={PI_ROLES}>
            <PIPageLayout>
              <PIEISFDashboard />
            </PIPageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pi-icf-dashboard"
        element={
          <ProtectedRoute allowedRoles={PI_ROLES}>
            <PIPageLayout>
              <PIICFDashboard />
            </PIPageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pi-livechat"
        element={
          <ProtectedRoute allowedRoles={PI_ROLES}>
            <PIPageLayout>
              <PILiveChat />
            </PIPageLayout>
          </ProtectedRoute>
        }
      />

      {/* CRO-specific routes */}
      <Route
        path="/cro-subject-management"
        element={
          <ProtectedRoute allowedRoles={CRO_ROLES}>
            <CroSubjectManagement />
          </ProtectedRoute>
        }
      />
      {/* <Route path="/cro-subject/:id" element={<ProtectedRoute allowedRoles={CRO_ROLES}><CroSubjectDetail /></ProtectedRoute>} /> */}
      <Route
        path="/cro-monitoring"
        element={
          <ProtectedRoute allowedRoles={CRO_ROLES}>
            <CroMonitoring />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cro-regulatory-documents"
        element={
          <ProtectedRoute allowedRoles={CRO_ROLES}>
            <CroRegulatoryDocuments />
          </ProtectedRoute>
        }
      />
      {/* <Route path="/cro-subjects" element={<ProtectedRoute allowedRoles={CRO_ROLES}><CroSubjects /></ProtectedRoute>} /> */}
      <Route
        path="/cro-screening"
        element={
          <ProtectedRoute allowedRoles={CRO_ROLES}>
            <CroScreening />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cro-enrollment"
        element={
          <ProtectedRoute allowedRoles={CRO_ROLES}>
            <CroEnrollment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cro-visits"
        element={
          <ProtectedRoute allowedRoles={CRO_ROLES}>
            <CroVisits />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cro-comments"
        element={
          <ProtectedRoute allowedRoles={CRO_ROLES}>
            <CroComments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cro-files"
        element={
          <ProtectedRoute allowedRoles={CRO_ROLES}>
            <CroFiles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cro-site-performance"
        element={
          <ProtectedRoute allowedRoles={CRO_ROLES}>
            <CroSitePerformance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cro-reports"
        element={
          <ProtectedRoute allowedRoles={CRO_ROLES}>
            <CroReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cro-notifications"
        element={
          <ProtectedRoute allowedRoles={CRO_ROLES}>
            <CroNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cro-settings"
        element={
          <ProtectedRoute allowedRoles={CRO_ROLES}>
            <CroSettings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-livechat"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminLiveChat />
          </ProtectedRoute>
        }
      />

      <Route
        path="/site-staff-livechat"
        element={
          <ProtectedRoute allowedRoles={[ROLES.SITE_STAFF, ROLES.PI]}>
            <SiteStaffLiveChat />
          </ProtectedRoute>
        }
      />

      <Route
        path="/live-chat"
        element={
          <ProtectedRoute allowedRoles={[ROLES.SPONSOR, ROLES.ADMIN]}>
            <SponsorLiveChat />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cro-livechat"
        element={
          <ProtectedRoute allowedRoles={[...CRO_ROLES, ROLES.ADMIN]}>
            <CROLiveChat />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<RoleAwareFallback />} />
    </Routes>
  );
}

export default App;
