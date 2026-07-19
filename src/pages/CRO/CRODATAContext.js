import { readStorageArray } from "../../utils/storageHelpers";
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getStudies } from "../../services/studyService";
import { addCommentRecord } from "../../services/commentService";
import { getCurrentUser } from "../../services/roleService";

const CRODataContext = createContext();

function getSharedStudies() {
  try {
    const studies = getStudies();
    return Array.isArray(studies) ? studies : [];
  } catch {
    return [];
  }
}

function getSharedSubjects() {
  try {
    const subjectsByStudy =
      JSON.parse(localStorage.getItem("subjectsByStudy")) || {};

    const studiesByCode = new Map(
      getStudies().map((study) => [String(study.code), study]),
    );

    return Object.entries(subjectsByStudy).flatMap(([studyCode, list]) => {
      const study = studiesByCode.get(String(studyCode));

      return (Array.isArray(list) ? list : []).map((subject, index) => ({
        ...subject,
        id:
          subject.id ||
          subject.subjectId ||
          `${studyCode}-SUB-${String(index + 1).padStart(3, "0")}`,
        subjectId:
          subject.subjectId ||
          subject.id ||
          `${studyCode}-SUB-${String(index + 1).padStart(3, "0")}`,
        studyCode,
        study: study?.name || studyCode,
        studyName: study?.name || studyCode,
        site: subject.site || study?.site || study?.location || "",
        status: subject.status || "Active",
      }));
    });
  } catch {
    return [];
  }
}

/*
  These readers are read-only.

  They support the common shared storage keys used across the project.
  If a key does not exist yet, CRO shows an empty list instead of demo data.
*/
function getSharedVisits() {
  return readStorageArray("visitSchedules");
}

function getSharedDocuments() {
  return readStorageArray("documents");
}

function getSharedReports() {
  return readStorageArray("reports");
}

function getSharedComments() {
  return readStorageArray("comments").map((comment) => ({
    ...comment,
    message: comment.description || comment.message || comment.text || "",
    author: comment.createdBy || comment.author || "Unknown",
    subject: comment.subjectId || comment.subject || "",
    date: comment.createdAt || comment.date || "",
  }));
}

function getSharedNotifications() {
  return readStorageArray("notifications");
}

function getSharedFiles() {
  return readStorageArray("files");
}

export const CROProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  const [studies, setStudies] = useState(() => getSharedStudies());
  const [subjects, setSubjects] = useState(() => getSharedSubjects());
  const [visits, setVisits] = useState(() => getSharedVisits());
  const [documents, setDocuments] = useState(() => getSharedDocuments());
  const [reports, setReports] = useState(() => getSharedReports());
  const [comments, setComments] = useState(() => getSharedComments());
  const [notifications, setNotifications] = useState(() =>
    getSharedNotifications(),
  );
  const [files, setFiles] = useState(() => getSharedFiles());

  const [alertModal, setAlertModal] = useState({
    open: false,
    title: "",
    message: "",
  });

  const refreshSharedData = useCallback(() => {
    setStudies(getSharedStudies());
    setSubjects(getSharedSubjects());
    setVisits(getSharedVisits());
    setDocuments(getSharedDocuments());
    setReports(getSharedReports());
    setComments(getSharedComments());
    setNotifications(getSharedNotifications());
    setFiles(getSharedFiles());
  }, []);

  useEffect(() => {
    refreshSharedData();

    const handleSharedDataUpdate = () => {
      refreshSharedData();
    };

    window.addEventListener("studies-updated", handleSharedDataUpdate);
    window.addEventListener("subjects-updated", handleSharedDataUpdate);
    window.addEventListener("visits-updated", handleSharedDataUpdate);
    window.addEventListener("documents-updated", handleSharedDataUpdate);
    window.addEventListener("reports-updated", handleSharedDataUpdate);
    window.addEventListener("comments-updated", handleSharedDataUpdate);
    window.addEventListener("notifications-updated", handleSharedDataUpdate);
    window.addEventListener("files-updated", handleSharedDataUpdate);
    window.addEventListener("sponsor-data-updated", handleSharedDataUpdate);
    window.addEventListener("storage", handleSharedDataUpdate);

    return () => {
      window.removeEventListener("studies-updated", handleSharedDataUpdate);
      window.removeEventListener("subjects-updated", handleSharedDataUpdate);
      window.removeEventListener("visits-updated", handleSharedDataUpdate);
      window.removeEventListener("documents-updated", handleSharedDataUpdate);
      window.removeEventListener("reports-updated", handleSharedDataUpdate);
      window.removeEventListener("comments-updated", handleSharedDataUpdate);
      window.removeEventListener(
        "notifications-updated",
        handleSharedDataUpdate,
      );
      window.removeEventListener("files-updated", handleSharedDataUpdate);
      window.removeEventListener(
        "sponsor-data-updated",
        handleSharedDataUpdate,
      );
      window.removeEventListener("storage", handleSharedDataUpdate);
    };
  }, [refreshSharedData]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);

    return () => clearTimeout(timer);
  }, []);

  const showAlert = useCallback((title, message) => {
    setAlertModal({ open: true, title, message });
  }, []);

  const showModal = useCallback(({ title, message }) => {
    setAlertModal({ open: true, title, message });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertModal({ open: false, title: "", message: "" });
  }, []);

  const closeModal = closeAlert;

  // CRO is allowed to add comments (create-only). It must never edit,
  // reply to, resolve, or delete comments — those remain Admin/Site
  // Staff/PI actions. This writes to the same shared "comments" key
  // used across the app and notifies other roles via the same event
  // this context already listens for.
  const addComment = useCallback((newComment) => {
    const user = getCurrentUser();

    return addCommentRecord(
      {
        subjectId: newComment.subject || newComment.subjectId || "",
        description: newComment.message || newComment.text || "",
        site: newComment.site || "",
        study: newComment.study || newComment.studyCode || "",
        stage: "Monitoring",
      },
      user
    );
  }, []);

  const kpiMetrics = useMemo(() => {
    const uniqueSites = new Set(
      visits.map((visit) => visit.site).filter(Boolean),
    ).size;

    const pendingReviews = documents.filter(
      (document) => document.status === "Pending",
    ).length;

    const openCommentsCount = comments.filter((comment) => {
      const status = String(comment?.status || "").toLowerCase();
      return status === "open" || status === "unresolved";
    }).length;

    const completedVisits = visits.filter(
      (visit) => visit.status === "Completed",
    ).length;

    const approvedDocs = documents.filter(
      (document) => document.status === "Approved",
    ).length;

    const visitCompliance =
      visits.length > 0
        ? Math.round((completedVisits / visits.length) * 100)
        : 0;

    const documentCompliance =
      documents.length > 0
        ? Math.round((approvedDocs / documents.length) * 100)
        : 0;

    const complianceValues = [];

    if (visits.length > 0) {
      complianceValues.push(visitCompliance);
    }

    if (documents.length > 0) {
      complianceValues.push(documentCompliance);
    }

    const complianceRate =
      complianceValues.length > 0
        ? Math.round(
            complianceValues.reduce((total, value) => total + value, 0) /
              complianceValues.length,
          )
        : 0;

    return {
      sitesUnderMonitoring: uniqueSites,
      monitoringVisits: visits.length,
      pendingReviews,
      comments: openCommentsCount,
      commentsCount: openCommentsCount,
      complianceMetrics: `${complianceRate}%`,
    };
  }, [visits, documents, comments]);

  const sitePerformanceData = useMemo(() => {
    const siteNames = [
      ...new Set(subjects.map((subject) => subject.site).filter(Boolean)),
    ];

    return siteNames.map((site, index) => {
      const siteSubjects = subjects.filter((subject) => subject.site === site);
      const siteVisits = visits.filter((visit) => visit.site === site);

      const completedVisits = siteVisits.filter(
        (visit) => visit.status === "Completed",
      ).length;

      const enrolled = siteSubjects.filter((subject) =>
        ["Active", "Completed"].includes(subject.status),
      ).length;

      const withdrawn = siteSubjects.filter(
        (subject) => subject.status === "Withdrawn",
      ).length;

      const enrollmentPct =
        siteSubjects.length > 0
          ? Math.round((enrolled / siteSubjects.length) * 100)
          : 0;

      const screenFailurePct =
        siteSubjects.length > 0
          ? Math.round((withdrawn / siteSubjects.length) * 100)
          : 0;

      const compliancePct =
        siteVisits.length > 0
          ? Math.round((completedVisits / siteVisits.length) * 100)
          : 0;

      let status = "Good";

      if (compliancePct >= 95 && enrollmentPct >= 80) {
        status = "Excellent";
      } else if (compliancePct < 75 || enrollmentPct < 60) {
        status = "At Risk";
      }

      return {
        id: `SITE-${String(index + 1).padStart(3, "0")}`,
        site,
        study: siteSubjects[0]?.study || "—",
        enrollment: `${enrollmentPct}%`,
        screenFailure: `${screenFailurePct}%`,
        compliance: `${compliancePct}%`,
        status,
      };
    });
  }, [subjects, visits]);

  const upcomingVisits = useMemo(() => {
    return [...visits]
      .filter((visit) => visit.status !== "Completed")
      .sort(
        (firstVisit, secondVisit) =>
          new Date(firstVisit.date) - new Date(secondVisit.date),
      )
      .slice(0, 8);
  }, [visits]);

  const globalSearch = useCallback(
    (query) => {
      if (!query || query.trim().length < 1) {
        return [];
      }

      const normalizedQuery = query.toLowerCase().trim();
      const results = [];

      subjects.forEach((subject) => {
        const subjectId = String(subject.subjectId || subject.id || "");
        const site = String(subject.site || "");
        const study = String(subject.study || subject.studyName || "");

        if (
          subjectId.toLowerCase().includes(normalizedQuery) ||
          site.toLowerCase().includes(normalizedQuery) ||
          study.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            type: "Subject",
            id: subjectId,
            label: subjectId,
            sublabel: `${site} · ${subject.status || ""}`,
            route: `/cro-subject/${subjectId}`,
            data: subject,
          });
        }
      });

      visits.forEach((visit) => {
        const visitId = String(visit.id || "");
        const site = String(visit.site || "");
        const visitType = String(visit.visitType || visit.visit || "");

        if (
          visitId.toLowerCase().includes(normalizedQuery) ||
          site.toLowerCase().includes(normalizedQuery) ||
          visitType.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            type: "Visit",
            id: visitId,
            label: visitId,
            sublabel: `${site} · ${visitType}`,
            route: "/cro-monitoring",
            data: visit,
          });
        }
      });

      documents.forEach((document) => {
        const documentId = String(document.id || "");
        const name = String(document.name || document.fileName || "");
        const site = String(document.site || "");

        if (
          documentId.toLowerCase().includes(normalizedQuery) ||
          name.toLowerCase().includes(normalizedQuery) ||
          site.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            type: "Regulatory Document",
            id: documentId,
            label: name,
            sublabel: `${site} · ${document.status || ""}`,
            route: "/cro-regulatory-documents",
            data: document,
          });
        }
      });

      reports.forEach((report) => {
        const reportId = String(report.id || "");
        const name = String(report.name || report.title || "");
        const type = String(report.type || "");

        if (
          reportId.toLowerCase().includes(normalizedQuery) ||
          name.toLowerCase().includes(normalizedQuery) ||
          type.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            type: "Report",
            id: reportId,
            label: name,
            sublabel: type,
            route: "/cro-reports",
            data: report,
          });
        }
      });

      comments.forEach((comment) => {
        const commentId = String(comment.id || "");
        const message = String(comment.message || comment.comment || "");

        if (
          commentId.toLowerCase().includes(normalizedQuery) ||
          message.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            type: "Comment",
            id: commentId,
            label: commentId,
            sublabel: message.substring(0, 50),
            route: "/cro-comments",
            data: comment,
          });
        }
      });

      files.forEach((file) => {
        const fileId = String(file.id || "");
        const name = String(file.name || file.fileName || "");
        const category = String(file.category || "");

        if (
          fileId.toLowerCase().includes(normalizedQuery) ||
          name.toLowerCase().includes(normalizedQuery) ||
          category.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            type: "File",
            id: fileId,
            label: name,
            sublabel: category,
            route: "/cro-files",
            data: file,
          });
        }
      });

      return results.slice(0, 12);
    },
    [subjects, visits, documents, reports, comments, files],
  );

  return (
    <CRODataContext.Provider
      value={{
        isLoading,

        // Read-only shared data
        studies,
        subjects,
        visits,
        documents,
        reports,
        comments,
        notifications,
        files,

        kpiMetrics,
        kpis: kpiMetrics,
        sitePerformanceData,
        upcomingVisits,
        globalSearch,
        addComment,

        alertModal,
        modal: alertModal,
        showAlert,
        showModal,
        closeAlert,
        closeModal,
      }}
    >
      {children}
    </CRODataContext.Provider>
  );
};

export const useCROData = () => {
  const context = useContext(CRODataContext);

  if (!context) {
    throw new Error("useCROData must be used within CROProvider");
  }

  return context;
};