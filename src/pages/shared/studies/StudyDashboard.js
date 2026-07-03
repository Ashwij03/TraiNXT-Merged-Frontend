import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams
} from "react-router-dom";
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
import StudyFinancials from "../../Sponsor/Financials/StudyFinancials";
import AlertsPanel from "../../../Components/dashboard/AlertsPanel";
import SubjectProfile from "../subjects/SubjectProfile";
import useStudiesDashboard from "../../../hooks/useStudiesDashboard";
import useVisitSchedules from "../../../hooks/useVisitSchedules";
import { getStudyByCode, deleteStudy, updateStudy } from "../../../services/studyService";
import DeleteConfirmationModal from "../../../Components/DeleteConfirmationModal";
import RecentSubjectsWidget from "../../../Components/dashboard/RecentSubjectsWidget";
import UpcomingVisitsWidget from "../../../Components/dashboard/UpcomingVisitsWidget";
import PendingCommentsWidget from "../../../Components/dashboard/PendingCommentsWidget";
import QuickActionsWidget from "../../../Components/dashboard/QuickActionsWidget";
import DocumentFolderManager from "../../../Components/common/DocumentFolderManager";

import {
  FiUsers,
  FiClipboard,
  FiMessageSquare,
  FiTrash2,
  FiArrowLeft,
  FiEdit2
} from "react-icons/fi";
import {
  canDeleteStudy,
  canEditStudyContent,
  requiresPermissionRequest
} from "../../../utils/contentAccess";
import { submitAccessRequest } from "../../../services/accessPermissionService";
import { getCurrentUser } from "../../../services/roleService";
import "../AccessPermissions.css";
import "../../Admin/Dashboard.css";

function StudyDashboard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "Overview"
  );

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");

    if (tabFromUrl) {
      setActiveTab((currentTab) =>
        currentTab === tabFromUrl ? currentTab : tabFromUrl
      );
    }
  }, [searchParams]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [studyRefreshKey, setStudyRefreshKey] = useState(0);

  useEffect(() => {
    const currentStudy = getStudyByCode(id);

    if (currentStudy) {
      localStorage.setItem(
        "selectedStudy",
        JSON.stringify(currentStudy)
      );
    }

    localStorage.setItem(
      "sidebarStudiesOpen",
      JSON.stringify(true)
    );

    localStorage.setItem(
      "sidebarStudyBinderOpen",
      JSON.stringify(true)
    );
  }, [id]);

  const { data } = useStudiesDashboard();

  const currentUser = getCurrentUser();

  const canEditStudy = canEditStudyContent(currentUser);
  const canRemoveStudy = canDeleteStudy(currentUser);
  const needsPermissionRequest = requiresPermissionRequest(currentUser);

  const currentStudy = getStudyByCode(id);
  void studyRefreshKey;

  const getStudyKey = useCallback(
    (study) =>
      String(
        study?.code ??
          study?.id ??
          study?.studyId ??
          study?.title ??
          study?.name ??
          ""
      ),
    []
  );

  const currentStudyKey = getStudyKey(currentStudy);

  const safeArray = useCallback((value) => {
    return Array.isArray(value) ? value : [];
  }, []);

  const matchesCurrentStudy = useCallback(
    (item) => {
      if (!item || !currentStudy) return false;

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
        item.protocolCode
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
    studyCode: id
  });

  const filteredUpcomingVisits = useMemo(() => {
    if (upcomingWindow.length) {
      return upcomingWindow.map((item) => ({
        subject: item.subjectid || item.subjectId || item.subject,
        subjectId: item.subjectid || item.subjectId || item.subject,
        visit: item.time ? `${item.visit} • ${item.time}` : item.visit,
        date: item.date
      }));
    }

    return studySchedules
      .filter((item) => item.status !== "Completed")
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 12)
      .map((item) => ({
        subject: item.subjectId,
        subjectId: item.subjectId,
        visit: item.time ? `${item.visit} • ${item.time}` : item.visit,
        date: item.date
      }));
  }, [studySchedules, upcomingWindow]);

  const upcomingVisitsEmptyMessage = "No upcoming visits scheduled";

  const filteredPendingComments = useMemo(() => {
    return safeArray(data?.pendingComments || data?.pendingQueries).filter(
      matchesCurrentStudy
    );
  }, [data?.pendingComments, data?.pendingQueries, safeArray, matchesCurrentStudy]);

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
    matchesCurrentStudy
  ]);

  const studyKpis = useMemo(() => {
    return {
      studies: currentStudy ? 1 : 0,
      subjects: filteredRecentSubjects.length,
      comments: filteredPendingComments.length,
      visits: filteredUpcomingVisits.length
    };
  }, [
    currentStudy,
    filteredRecentSubjects,
    filteredPendingComments,
    filteredUpcomingVisits
  ]);

  const handleRequestEditPermission = () => {
    submitAccessRequest(
      {
        studySubject: currentStudy?.code || id,
        accessType: "Edit Access",
        notes: "Study overview edit request"
      },
      currentUser
    );
    alert("Edit permission request submitted for admin review.");
  };

  const handleDeleteStudy = (deletionDetails) => {
    if (currentStudy) {
      try {
        deleteStudy(
          currentStudy.code,
          deletionDetails
        );
        setShowDeleteModal(false);
        alert(
          `Study "${currentStudy.name}" has been deleted successfully.`
        );
        navigate("/studies");
      } catch (error) {
        alert(
          "Error deleting study: " + error.message
        );
      }
    }
  };

  const handleBackToStudies = () => {
    localStorage.setItem(
      "sidebarStudiesOpen",
      JSON.stringify(true)
    );

    localStorage.setItem(
      "sidebarStudyBinderOpen",
      JSON.stringify(true)
    );

    navigate("/studies");
  };

  const handleEditStudy = () => {
    if (currentStudy) {
      setEditForm({
        code: currentStudy.code || "",
        name: currentStudy.name || "",
        protocol: currentStudy.protocol || "",
        indication: currentStudy.indication || "",
        location: currentStudy.location || currentStudy.site || "",
        site: currentStudy.site || currentStudy.location || "",
        enrolled: currentStudy.enrolled ?? "",
        targetSubjects: currentStudy.targetSubjects ?? "",
        status: currentStudy.status || "Active",
        principalInvestigator: currentStudy.principalInvestigator || "",
        sponsor: currentStudy.sponsor || "",
        cro: currentStudy.cro || "",
        startDate: currentStudy.startDate || "",
        description: currentStudy.description || ""
      });
      setShowEditModal(true);
    }
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;

    setEditForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  };

  const handleSaveStudyEdit = (event) => {
    event?.preventDefault();

    try {
      const updatedStudy = updateStudy(editForm.code, {
        ...editForm,
        site: editForm.site || editForm.location,
        location: editForm.location || editForm.site,
        enrolled: Number(editForm.enrolled) || 0,
        targetSubjects: Number(editForm.targetSubjects) || 0
      });

      localStorage.setItem(
        "selectedStudy",
        JSON.stringify(updatedStudy)
      );
      setShowEditModal(false);
      setStudyRefreshKey((value) => value + 1);
    } catch (error) {
      alert("Error saving study: " + error.message);
    }
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
            className="back-to-studies-btn"
            onClick={handleBackToStudies}
            type="button"
          >
            <FiArrowLeft />
            <span>Back to Studies</span>
          </button>
        </div>

        <div className="page-header">
          <div>
            <h1>
              {currentStudy?.name || "Study Dashboard"}
            </h1>

            <p>
              {currentUser?.role === "Admin"
                ? "All Sites Overview"
                : "Assigned Site Overview"}
            </p>
          </div>

          <div className="page-header-actions">
            {canEditStudy && (
              <button
                className="btn-edit edit-study-btn"
                onClick={handleEditStudy}
                title="Edit study"
                aria-label="Edit study"
                type="button"
              >
                <FiEdit2 /> Edit Study
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
                className="delete-study-btn"
                onClick={() =>
                  setShowDeleteModal(true)
                }
                title="Delete study"
                aria-label="Delete study"
                type="button"
              >
                <FiTrash2 /> Delete Study
              </button>
            )}
          </div>
        </div>

        {activeTab !== "Subjects" && activeTab !== "SubjectProfile" && (
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
        )}

        <StudyWorkspaceTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {activeTab === "Overview" && (
          <>
            <VisitCalendarSection studyCode={id} />

            <SubjectAnalyticsSection
              subjects={filteredRecentSubjects}
              studies={currentStudy ? [currentStudy] : []}
              studyCode={id}
            />

            <div className="widget-grid">
              <RecentSubjectsWidget
                subjects={filteredRecentSubjects}
              />

              <UpcomingVisitsWidget
                visits={filteredUpcomingVisits}
                emptyMessage={upcomingVisitsEmptyMessage}
              />
            </div>

            <div className="widget-grid">
              <PendingCommentsWidget
                comments={filteredPendingComments}
              />

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

        {activeTab === "eISF" && (
          <div className="module-card">
            <h2>eISF</h2>
            <DocumentFolderManager
              sectionId="eISF"
              contextKey={id || "default"}
              title="eISF"
              studyCode={id}
              layout="vertical"
            />
          </div>
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
              >
                x
              </button>
            </div>

            <div className="study-form-grid">
              <label>
                Study ID
                <input
                  name="code"
                  value={editForm.code || ""}
                  readOnly
                />
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
          onClose={() =>
            setShowDeleteModal(false)
          }
          onConfirm={handleDeleteStudy}
          title={`Delete Study: ${currentStudy.name}`}
          message={`Are you sure you want to delete the study "${currentStudy.name}" (${currentStudy.code})? This action cannot be undone.`}
          itemType="study"
        />
          )}
        </>
      )}
    </DashboardLayout>
  );
}

export default StudyDashboard;