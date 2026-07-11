// ===== START F2 CHANGES =====
import StudyActivity from "./StudyActivity";
// ===== END F2 CHANGES =====
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../../Components/dashboard/DashboardLayout";
import KPICard from "../../../Components/dashboard/KPICard";
import SubjectAnalyticsSection from "../../../Components/dashboard/SubjectAnalyticsSection";
import VisitCalendarSection from "../../../Components/dashboard/VisitCalendarSection";
import StudySubjects from "./StudySubjects";
import StudyWorkspaceTabs from "./StudyWorkspaceTabs";
import StudyDocuments from "./StudyDocuments";
import StudyComments from "./StudyComments";
import StudyLogsTab from "./StudyLogsTab";
import StudyRegulatory from "./StudyRegulatory";
import StudyReports from "./StudyReports";
import StudyPlanning from "./StudyPlanning";
import StudyVisitPlan from "./StudyVisitPlan";
import EssentialDocumentsWidget from "../../../Components/studies/EssentialDocumentsWidget";
import StudyProgressSummary from "../../../Components/studies/StudyProgressSummary";
import StudyMilestoneTimeline from "../../../Components/studies/StudyMilestoneTimeline";
import SitePerformanceSummary from "../../../Components/studies/SitePerformanceSummary";
import SiteActivationStatus from "../../../Components/studies/SiteActivationStatus";
import GCPCertificationStatus from "../../../Components/studies/GCPCertificationStatus";
import StudyHealthSummary from "../../../Components/studies/StudyHealthSummary";
import useStudyOverview from "../../../hooks/useStudyOverview";
import StudyFinancials from "../../Sponsor/Financials/StudyFinancials";
import AlertsPanel from "../../../Components/dashboard/AlertsPanel";
import SubjectProfile from "../subjects/SubjectProfile";
import useStudiesDashboard from "../../../hooks/useStudiesDashboard";
import useVisitSchedules from "../../../hooks/useVisitSchedules";
import {
  getStudyByCode,
  deleteStudy,
  updateStudy,
} from "../../../services/studyService";
import DeleteConfirmationModal from "../../../Components/DeleteConfirmationModal";
import RecentSubjectsWidget from "../../../Components/dashboard/RecentSubjectsWidget";
import UpcomingVisitsWidget from "../../../Components/dashboard/UpcomingVisitsWidget";
import PendingCommentsWidget from "../../../Components/dashboard/PendingCommentsWidget";
import QuickActionsWidget from "../../../Components/dashboard/QuickActionsWidget";
import DocumentFolderManager from "../../../Components/common/DocumentFolderManager";
import EISFWorkspace from "../EISF/EISFWorkspace";
import {
  FiUsers,
  FiClipboard,
  FiMessageSquare,
  FiTrash2,
  FiArrowLeft,
  FiEdit2,
  FiRefreshCw,
} from "react-icons/fi";
import {
  canDeleteStudy,
  canEditStudyContent,
  requiresPermissionRequest,
} from "../../../utils/contentAccess";
import { submitAccessRequest } from "../../../services/accessPermissionService";
import { getCurrentUser } from "../../../services/roleService";
import "../AccessPermissions.css";
import "../../Admin/Dashboard.css";

import ClinicalSitesDashboard from "./ClinicalSitesDashboard";

function StudyDashboard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "Overview"
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [studyRefreshKey, setStudyRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");

    if (tabFromUrl) {
      setActiveTab((currentTab) =>
        currentTab === tabFromUrl ? currentTab : tabFromUrl
      );
    }
  }, [searchParams]);

  useEffect(() => {
    const selectedStudy = getStudyByCode(id);

    if (selectedStudy) {
      localStorage.setItem("selectedStudy", JSON.stringify(selectedStudy));
    }

    localStorage.setItem("sidebarStudiesOpen", JSON.stringify(true));
    localStorage.setItem("sidebarStudyBinderOpen", JSON.stringify(true));
  }, [id]);

  const { data } = useStudiesDashboard();
  const currentUser = getCurrentUser();

  const canEditStudy = canEditStudyContent(currentUser);
  const canRemoveStudy = canDeleteStudy(currentUser);
  const needsPermissionRequest = requiresPermissionRequest(currentUser);

  const currentStudy = getStudyByCode(id);
  const overview = useStudyOverview(id, studyRefreshKey);

  const getStudyKey = useCallback((study) => {
    return String(
      study?.code ??
        study?.id ??
        study?.studyId ??
        study?.title ??
        study?.name ??
        ""
    );
  }, []);

  const currentStudyKey = getStudyKey(currentStudy);

  const safeArray = useCallback((value) => {
    return Array.isArray(value) ? value : [];
  }, []);

  const matchesCurrentStudy = useCallback(
    (item) => {
      if (!item || !currentStudy) {
        return false;
      }

      const possibleKeys = [
        item.studyCode,
        item.studyId,
        item.studyKey,
        item.code,
        item.study?.code,
        item.study?.id,
        item.study?.studyId,
        item.study?.name,
        item.studyName,
        item.studyTitle,
        item.protocolCode,
      ]
        .filter(Boolean)
        .map(String);

      return possibleKeys.includes(currentStudyKey);
    },
    [currentStudy, currentStudyKey]
  );

  const studySubjectsFromStorage = useMemo(() => {
    try {
      const allSubjectsByStudy =
        JSON.parse(localStorage.getItem("subjectsByStudy")) || {};

      const studySubjects = allSubjectsByStudy[currentStudyKey];

      return Array.isArray(studySubjects) ? studySubjects : [];
    } catch {
      return [];
    }
  }, [currentStudyKey]);

  const { schedules: studySchedules, upcomingWindow } = useVisitSchedules({
    studyCode: id,
  });

  const filteredUpcomingVisits = useMemo(() => {
    if (upcomingWindow.length > 0) {
      return upcomingWindow.map((item) => ({
        subject: item.subjectid || item.subjectId || item.subject,
        subjectId: item.subjectid || item.subjectId || item.subject,
        visit: item.time ? `${item.visit} • ${item.time}` : item.visit,
        date: item.date,
      }));
    }

    return studySchedules
      .filter((item) => item.status !== "Completed")
      .sort((firstItem, secondItem) => {
        return new Date(firstItem.date) - new Date(secondItem.date);
      })
      .slice(0, 12)
      .map((item) => ({
        subject: item.subjectId,
        subjectId: item.subjectId,
        visit: item.time ? `${item.visit} • ${item.time}` : item.visit,
        date: item.date,
      }));
  }, [studySchedules, upcomingWindow]);

  const filteredPendingComments = useMemo(() => {
    return safeArray(data?.pendingComments || data?.pendingQueries).filter(
      matchesCurrentStudy
    );
  }, [
    data?.pendingComments,
    data?.pendingQueries,
    safeArray,
    matchesCurrentStudy,
  ]);

  const filteredAlerts = useMemo(() => {
    return safeArray(data?.alerts).filter(matchesCurrentStudy);
  }, [data?.alerts, safeArray, matchesCurrentStudy]);

  const filteredRecentSubjects = useMemo(() => {
    if (studySubjectsFromStorage.length > 0) {
      return studySubjectsFromStorage;
    }

    return safeArray(data?.recentSubjects).filter(matchesCurrentStudy);
  }, [
    data?.recentSubjects,
    studySubjectsFromStorage,
    safeArray,
    matchesCurrentStudy,
  ]);

  const studyKpis = useMemo(() => {
    return {
      subjects: filteredRecentSubjects.length,
      comments: filteredPendingComments.length,
      visits: filteredUpcomingVisits.length,
    };
  }, [
    filteredRecentSubjects,
    filteredPendingComments,
    filteredUpcomingVisits,
  ]);

  const handleRefreshStudy = () => {
    setIsRefreshing(true);
    setStudyRefreshKey((value) => value + 1);
    overview.refresh();

    window.setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const handleNavigateToEisf = () => {
    setActiveTab("eISF");
  };

  const handleRequestEditPermission = () => {
    submitAccessRequest(
      {
        studySubject: currentStudy?.code || id,
        accessType: "Edit Access",
        notes: "Study overview edit request",
      },
      currentUser
    );

    alert("Edit permission request submitted for admin review.");
  };

  const handleDeleteStudy = (deletionDetails) => {
    if (!currentStudy) {
      return;
    }

    try {
      deleteStudy(currentStudy.code, deletionDetails);
      setShowDeleteModal(false);
      alert(`Study "${currentStudy.name}" has been deleted successfully.`);
      navigate("/studies");
    } catch (error) {
      alert(`Error deleting study: ${error.message}`);
    }
  };

  const handleBackToStudies = () => {
    localStorage.setItem("sidebarStudiesOpen", JSON.stringify(true));
    localStorage.setItem("sidebarStudyBinderOpen", JSON.stringify(true));
    navigate("/studies");
  };

  const handleEditStudy = () => {
    if (!currentStudy) {
      return;
    }

    setEditForm({
      code: currentStudy.code || "",
      name: currentStudy.name || "",
      protocol: currentStudy.protocol || "",
      indication: currentStudy.indication || "",
      location: currentStudy.location || currentStudy.site || "",
      site: currentStudy.site || currentStudy.location || "",
      country: currentStudy.country || "",
      enrolled: currentStudy.enrolled ?? "",
      targetSubjects: currentStudy.targetSubjects ?? "",
      status: currentStudy.status || "Active",
      principalInvestigator: currentStudy.principalInvestigator || "",
      sponsor: currentStudy.sponsor || "",
      cro: currentStudy.cro || "",
      startDate: currentStudy.startDate || "",
      description: currentStudy.description || "",
    });

    setShowEditModal(true);
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;

    setEditForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSaveStudyEdit = (event) => {
    event.preventDefault();

    try {
      const updatedStudy = updateStudy(editForm.code, {
        ...editForm,
        site: editForm.site || editForm.location,
        location: editForm.location || editForm.site,
        enrolled: Number(editForm.enrolled) || 0,
        targetSubjects: Number(editForm.targetSubjects) || 0,
      });

      localStorage.setItem("selectedStudy", JSON.stringify(updatedStudy));
      setShowEditModal(false);
      setStudyRefreshKey((value) => value + 1);
    } catch (error) {
      alert(`Error saving study: ${error.message}`);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <DashboardLayout>
      {!data ? (
        <div className="dashboard-loading">Loading Dashboard...</div>
      ) : (
        <>
          <div className="study-dashboard-page">
            <div className="study-dashboard-topbar">
              <button
                type="button"
                className="back-to-studies-btn"
                onClick={handleBackToStudies}
              >
                <FiArrowLeft />
                <span>Back to Studies</span>
              </button>
            </div>

            <div className="page-header">
              <div>
                <h1>{currentStudy?.name || "Study Dashboard"}</h1>

                <p>
                  {currentUser?.role === "Admin"
                    ? "All Sites Overview"
                    : "Assigned Site Overview"}
                </p>
              </div>

              <div className="page-header-actions">
                <button
                  type="button"
                  className="refresh-study-btn"
                  onClick={handleRefreshStudy}
                  disabled={isRefreshing}
                  title="Refresh study overview"
                >
                  <FiRefreshCw className={isRefreshing ? "spinning" : ""} />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </button>

                {canEditStudy && (
                  <button
                    type="button"
                    className="btn-edit edit-study-btn"
                    onClick={handleEditStudy}
                    title="Edit study"
                    aria-label="Edit study"
                  >
                    <FiEdit2 />
                    Edit Study
                  </button>
                )}

                {needsPermissionRequest && (
                  <button
                    type="button"
                    className="request-permission-btn"
                    onClick={handleRequestEditPermission}
                  >
                    Request Edit Permission
                  </button>
                )}

                {canRemoveStudy && (
                  <button
                    type="button"
                    className="delete-study-btn"
                    onClick={() => setShowDeleteModal(true)}
                    title="Delete study"
                    aria-label="Delete study"
                  >
                    <FiTrash2 />
                    Delete Study
                  </button>
                )}
              </div>
            </div>

            {/* KPI cards intentionally stay visible for every study tab,
                including Subjects and SubjectProfile. */}
            <div className="studies-kpi-grid">
              <KPICard
                title="Total Subjects"
                value={studyKpis.subjects}
                subtitle="In This Study"
                icon={<FiUsers />}
              />

              <KPICard
                title="Open Comments"
                value={studyKpis.comments}
                subtitle="For This Study"
                icon={<FiMessageSquare />}
              />

              <KPICard
                title="Site Visits"
                value={studyKpis.visits}
                subtitle="For This Study"
                icon={<FiClipboard />}
              />
            </div>

            <StudyWorkspaceTabs
              activeTab={activeTab}
              setActiveTab={handleTabChange}
            />

            {activeTab === "Overview" && (
              <>
                <div className="study-overview-widgets">
                  <EssentialDocumentsWidget
                    stats={overview.documents}
                    onNavigateToEisf={handleNavigateToEisf}
                  />

                  <StudyProgressSummary progress={overview.progress} />

                  <StudyHealthSummary health={overview.health} />

                  <SiteActivationStatus counts={overview.siteActivation} />

                  <GCPCertificationStatus counts={overview.gcpCertification} />

                  <SitePerformanceSummary records={overview.sitePerformance} />
                </div>

                <StudyMilestoneTimeline
                  studyCode={id}
                  milestones={overview.milestones}
                  canEdit={canEditStudy}
                  onUpdated={() => setStudyRefreshKey((value) => value + 1)}
                />

                <VisitCalendarSection studyCode={id} />

                <SubjectAnalyticsSection
                  subjects={filteredRecentSubjects}
                  studies={currentStudy ? [currentStudy] : []}
                  studyCode={id}
                />

                <div className="widget-grid">
                  <RecentSubjectsWidget subjects={filteredRecentSubjects} />

                  <UpcomingVisitsWidget
                    visits={filteredUpcomingVisits}
                    emptyMessage="No upcoming visits scheduled"
                  />
                </div>

                <div className="widget-grid">
                  <PendingCommentsWidget comments={filteredPendingComments} />
                  <QuickActionsWidget />
                </div>

                <div className="study-dashboard-alerts">
                  <AlertsPanel alerts={filteredAlerts} />
                </div>

                <div className="study-dashboard-subjects-section">
                  <StudySubjects
                    setActiveTab={setActiveTab}
                    showTable
                    showBackButton={false}
                  />
                </div>
              </>
            )}

            {activeTab === "Subjects" && (
              <StudySubjects setActiveTab={setActiveTab} />
            )}

            {activeTab === "SubjectProfile" && (
              <SubjectProfile setActiveTab={setActiveTab} />
            )}

            {activeTab === "Planning" && <StudyPlanning />}

            {activeTab === "Visit Plan" && <StudyVisitPlan />}

            {activeTab === "Study Files" && <StudyDocuments />}

            {activeTab === "Comments" && <StudyComments />}

            {activeTab === "Logs" && <StudyLogsTab />}

            {activeTab === "Regulatory" && <StudyRegulatory />}

            {activeTab === "Reports" && <StudyReports />}

            {activeTab === "eISF" && (
  <EISFWorkspace studyCode={id} />
)}
            {activeTab === "Clinical Sites" && (
              <ClinicalSitesDashboard
              study={currentStudy}
              />
        )}

            {activeTab === "Financials" && (
              <div className="study-financials-tab">
                <StudyFinancials
                  studyCode={id}
                  study={currentStudy}
                  refreshKey={studyRefreshKey}
                />
              </div>
            )}

            {activeTab === "Others" && (
              <div className="module-card">
                <h2>Others</h2>

        {activeTab === "Subjects" && (
          <StudySubjects setActiveTab={setActiveTab} />
        )}

        {activeTab === "SubjectProfile" && (
          <SubjectProfile setActiveTab={setActiveTab} />
        )}

        {activeTab === "Study Folder" && (
          <StudyDocuments />
        )}

        {activeTab === "Comments" && (
          <StudyComments />
        )}

        {activeTab === "Logs" && (
          <StudyLogsTab />
        )}

        {activeTab === "Regulatory" && (
          <StudyRegulatory />
        )}

        {activeTab === "Reports" && (
          <StudyReports />
        )}
    

        
{activeTab === "Financials" && (
  <StudyFinancials />
)}
        {activeTab === "Others" && (
          <div className="module-card">
            <h2>Others</h2>
            <DocumentFolderManager
              sectionId="others"
              contextKey={id || "default"}
              title="Others"
              studyCode={id}
              layout="vertical"
            />
          </div>
        )}
                <DocumentFolderManager
                  sectionId="others"
                  contextKey={id || "default"}
                  title="Others"
                  studyCode={id}
                  layout="vertical"
                />
              </div>
            )}
          </div>

          {showEditModal && (
            <div className="study-modal-overlay">
              <form className="study-modal" onSubmit={handleSaveStudyEdit}>
                <div className="study-modal-header">
                  <div>
                    <h2>Edit Study</h2>
                    <p>Update all study details and save changes.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    aria-label="Close edit study modal"
                  >
                    ×
                  </button>
                </div>

                <div className="study-form-grid">
                  <label>
                    Study ID
                    <input name="code" value={editForm.code || ""} readOnly />
                  </label>

                  <label>
                    Study Name
                    <input
                      name="name"
                      value={editForm.name || ""}
                      onChange={handleEditFormChange}
                      required
                    />
                  </label>

                  <label>
                    Protocol
                    <input
                      name="protocol"
                      value={editForm.protocol || ""}
                      onChange={handleEditFormChange}
                    />
                  </label>

                  <label>
                    Indication
                    <input
                      name="indication"
                      value={editForm.indication || ""}
                      onChange={handleEditFormChange}
                    />
                  </label>

                  <label>
                    Site / Hospital
                    <input
                      name="location"
                      value={editForm.location || ""}
                      onChange={handleEditFormChange}
                      required
                    />
                  </label>

                  <label>
                    Country
                    <input
                      name="country"
                      value={editForm.country || ""}
                      onChange={handleEditFormChange}
                      required
                    />
                  </label>

                  <label>
                    Subjects Enrolled
                    <input
                      name="enrolled"
                      type="number"
                      min="0"
                      value={editForm.enrolled ?? ""}
                      onChange={handleEditFormChange}
                      required
                    />
                  </label>

                  <label>
                    Target Subjects
                    <input
                      name="targetSubjects"
                      type="number"
                      min="0"
                      value={editForm.targetSubjects ?? ""}
                      onChange={handleEditFormChange}
                      required
                    />
                  </label>

                  <label>
                    Study Status
                    <select
                      name="status"
                      value={editForm.status || "Active"}
                      onChange={handleEditFormChange}
                      required
                    >
                      <option>Active</option>
                      <option>Screening</option>
                      <option>Enrollment</option>
                      <option>Paused</option>
                      <option>Completed</option>
                    </select>
                  </label>

                  <label>
                    Principal Investigator
                    <input
                      name="principalInvestigator"
                      value={editForm.principalInvestigator || ""}
                      onChange={handleEditFormChange}
                      required
                    />
                  </label>

                  <label>
                    Sponsor
                    <input
                      name="sponsor"
                      value={editForm.sponsor || ""}
                      onChange={handleEditFormChange}
                      required
                    />
                  </label>

                  <label>
                    CRO
                    <input
                      name="cro"
                      value={editForm.cro || ""}
                      onChange={handleEditFormChange}
                    />
                  </label>

                  <label>
                    Start Date
                    <input
                      name="startDate"
                      type="date"
                      value={editForm.startDate || ""}
                      onChange={handleEditFormChange}
                      required
                    />
                  </label>

                  <label className="study-form-wide">
                    Study Description
                    <textarea
                      name="description"
                      value={editForm.description || ""}
                      onChange={handleEditFormChange}
                      rows="3"
                    />
                  </label>
                </div>

                <div className="study-modal-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="add-study-btn">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {showDeleteModal && currentStudy && (
            <DeleteConfirmationModal
              onClose={() => setShowDeleteModal(false)}
              onConfirm={handleDeleteStudy}
              title={`Delete Study: ${currentStudy.name}`}
              message={`Are you sure you want to delete the study "${currentStudy.name}" (${currentStudy.code})? This action cannot be undone.`}
              itemType="study"
            />
          )}
        </>
      )}
      {activeTab === "Activity" && (
        <StudyActivity />
      )}
    </DashboardLayout>
  );
}

export default StudyDashboard;