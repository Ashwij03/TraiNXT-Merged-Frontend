import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  CRO_STORAGE_KEYS,
  loadFromStorage,
  saveToStorage,
} from "./croStorage"

const CRODataContext = createContext();

const DEFAULT_SUBJECTS = [
  {
    id: "SUB-001",
    study: "OCA",
    site: "Apollo",
    status: "Active",
    enrollment: "12-May-2026",
    visit: "Visit 2",
  },
  {
    id: "SUB-002",
    study: "OCA",
    site: "Apollo",
    status: "Completed",
    enrollment: "15-Apr-2026",
    visit: "Completed",
  },
  {
    id: "SUB-003",
    study: "OCA",
    site: "Yashoda",
    status: "Active",
    enrollment: "22-May-2026",
    visit: "Screening",
  },
];

const DEFAULT_VISITS = [
  {
    id: "MON-001",
    site: "Apollo",
    cra: "John",
    visitType: "SIV",
    date: "2026-06-15",
    status: "Completed",
  },
  {
    id: "MON-002",
    site: "Yashoda",
    cra: "David",
    visitType: "IMV",
    date: "2026-06-20",
    status: "Pending",
  },
  {
    id: "MON-003",
    site: "Apollo",
    cra: "Sarah",
    visitType: "COV",
    date: "2026-06-28",
    status: "Scheduled",
  },
];

const DEFAULT_DOCUMENTS = [
  {
    id: "DOC-001",
    name: "Protocol",
    site: "Apollo",
    version: "V3.0",
    expiry: "2026-12-31",
    status: "Approved",
  },
  {
    id: "DOC-002",
    name: "ICF",
    site: "Yashoda",
    version: "V2.1",
    expiry: "2026-08-15",
    status: "Pending",
  },
  {
    id: "DOC-003",
    name: "Investigator Brochure",
    site: "Apollo",
    version: "V5.0",
    expiry: "2026-07-20",
    status: "Approved",
  },
];

const DEFAULT_REPORTS = [
  {
    id: "REP-001",
    name: "Enrollment Report",
    type: "Enrollment",
    generatedOn: "01-Jul-2025",
    status: "Generated",
  },
  {
    id: "REP-002",
    name: "Site Performance Report",
    type: "Performance",
    generatedOn: "03-Jul-2025",
    status: "Pending",
  },
  {
    id: "REP-003",
    name: "Monitoring Report",
    type: "Monitoring",
    generatedOn: "05-Jul-2025",
    status: "Generated",
  },
];

const DEFAULT_COMMENTS = [
  {
    id: "CMT-001",
    subject: "SUB-001",
    site: "Apollo",
    author: "CRA John",
    message: "Source data verification pending for Visit 2",
    status: "Open",
    date: "2026-06-10",
    replies: [],
  },
  {
    id: "CMT-002",
    subject: "SUB-003",
    site: "Yashoda",
    author: "Data Manager",
    message: "Protocol deviation review required",
    status: "Answered",
    date: "2026-06-12",
    replies: [
      {
        id: "RPL-001",
        author: "Site Coordinator",
        message: "Deviation documented and submitted",
        date: "2026-06-13",
      },
    ],
  },
  {
    id: "CMT-003",
    subject: "SUB-002",
    site: "Apollo",
    author: "Monitor",
    message: "Query resolution awaiting site response",
    status: "Open",
    date: "2026-06-14",
    replies: [],
  },
];

const DEFAULT_NOTIFICATIONS = [
  {
    id: "NOT-001",
    title: "Monitoring Visit Due",
    message: "Apollo Hospital monitoring visit scheduled within 3 days.",
    type: "Monitoring",
    severity: "High",
    date: "2026-06-18",
    status: "Unread",
  },
  {
    id: "NOT-002",
    title: "Protocol Deviation Review",
    message: "Subject SUB-003 requires CRO review and acknowledgement.",
    type: "Compliance",
    severity: "Medium",
    date: "2026-06-18",
    status: "Unread",
  },
  {
    id: "NOT-003",
    title: "Regulatory Document Expiry",
    message: "SITE-101 delegation log expires within 7 days.",
    type: "Regulatory",
    severity: "Low",
    date: "2026-06-18",
    status: "Unread",
  },
];

const DEFAULT_FILES = [
  {
    id: "FIL-001",
    name: "Monitoring Report Q2.pdf",
    category: "Monitoring",
    site: "Apollo",
    uploadedOn: "2026-06-01",
    size: "2.4 MB",
  },
  {
    id: "FIL-002",
    name: "Site Initiation Checklist.docx",
    category: "Regulatory",
    site: "Yashoda",
    uploadedOn: "2026-05-28",
    size: "890 KB",
  },
];

function usePersistedState(storageKey, defaultValue) {
  const [state, setState] = useState(() =>
    loadFromStorage(storageKey, defaultValue)
  );

  useEffect(() => {
    saveToStorage(storageKey, state);
  }, [storageKey, state]);

  return [state, setState];
}

export const CROProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = usePersistedState(
    CRO_STORAGE_KEYS.subjects,
    DEFAULT_SUBJECTS
  );
  const [visits, setVisits] = usePersistedState(
    CRO_STORAGE_KEYS.visits,
    DEFAULT_VISITS
  );
  const [documents, setDocuments] = usePersistedState(
    CRO_STORAGE_KEYS.documents,
    DEFAULT_DOCUMENTS
  );
  const [reports, setReports] = usePersistedState(
    CRO_STORAGE_KEYS.reports,
    DEFAULT_REPORTS
  );
  const [comments, setComments] = usePersistedState(
    CRO_STORAGE_KEYS.comments,
    DEFAULT_COMMENTS
  );
  const [notifications, setNotifications] = usePersistedState(
    CRO_STORAGE_KEYS.notifications,
    DEFAULT_NOTIFICATIONS
  );
  const [files, setFiles] = usePersistedState(
    CRO_STORAGE_KEYS.files,
    DEFAULT_FILES
  );

  const [alertModal, setAlertModal] = useState({
    open: false,
    title: "",
    message: "",
  });

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

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const kpiMetrics = useMemo(() => {
    const uniqueSites = new Set(visits.map((v) => v.site)).size;
    const pendingReviews = documents.filter(
      (d) => d.status === "Pending"
    ).length;
    const completedVisits = visits.filter(
      (v) => v.status === "Completed"
    ).length;
    const approvedDocs = documents.filter(
      (d) => d.status === "Approved"
    ).length;
    const visitCompliance =
      visits.length > 0
        ? Math.round((completedVisits / visits.length) * 100)
        : 0;
    const docCompliance =
      documents.length > 0
        ? Math.round((approvedDocs / documents.length) * 100)
        : 0;
    const complianceRate =
      visitCompliance > 0 || docCompliance > 0
        ? Math.round((visitCompliance + docCompliance) / (documents.length > 0 && visits.length > 0 ? 2 : 1))
        : 0;

    return {
      sitesUnderMonitoring: uniqueSites,
      monitoringVisits: visits.length,
      pendingReviews,
      comments: comments.length,
      commentsCount: comments.length,
      complianceMetrics: `${complianceRate}%`,
    };
  }, [visits, documents, comments]);

  const sitePerformanceData = useMemo(() => {
    const siteNames = [...new Set(subjects.map((s) => s.site))];

    return siteNames.map((site, idx) => {
      const siteSubjects = subjects.filter((s) => s.site === site);
      const siteVisits = visits.filter((v) => v.site === site);
      const completedVisits = siteVisits.filter(
        (v) => v.status === "Completed"
      ).length;
      const enrolled = siteSubjects.filter((s) =>
        ["Active", "Completed"].includes(s.status)
      ).length;
      const withdrawn = siteSubjects.filter(
        (s) => s.status === "Withdrawn"
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
      if (compliancePct >= 95 && enrollmentPct >= 80) status = "Excellent";
      else if (compliancePct < 75 || enrollmentPct < 60) status = "At Risk";

      return {
        id: `SITE-${String(idx + 1).padStart(3, "0")}`,
        site,
        study: siteSubjects[0]?.study || "—",
        enrollment: `${enrollmentPct}%`,
        screenFailure: `${screenFailurePct}%`,
        compliance: `${compliancePct}%`,
        status,
      };
    });
  }, [subjects, visits]);

  const kpis = kpiMetrics;

  const upcomingVisits = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return [...visits]
      .filter((v) => v.status !== "Completed")
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 8);
  }, [visits]);

  const globalSearch = useCallback(
    (query) => {
      if (!query || query.trim().length < 1) return [];

      const q = query.toLowerCase().trim();
      const results = [];

      subjects.forEach((s) => {
        if (
          s.id.toLowerCase().includes(q) ||
          s.site.toLowerCase().includes(q) ||
          s.study.toLowerCase().includes(q)
        ) {
          results.push({
            type: "Subject",
            id: s.id,
            label: s.id,
            sublabel: `${s.site} · ${s.status}`,
            route: `/cro-subject/${s.id}`,
            data: s,
          });
        }
      });

      visits.forEach((v) => {
        if (
          v.id.toLowerCase().includes(q) ||
          v.site.toLowerCase().includes(q) ||
          v.visitType.toLowerCase().includes(q)
        ) {
          results.push({
            type: "Visit",
            id: v.id,
            label: v.id,
            sublabel: `${v.site} · ${v.visitType}`,
            route: "/cro-monitoring",
            data: v,
          });
        }
      });

      documents.forEach((d) => {
        if (
          d.id.toLowerCase().includes(q) ||
          d.name.toLowerCase().includes(q) ||
          d.site.toLowerCase().includes(q)
        ) {
          results.push({
            type: "Regulatory Document",
            id: d.id,
            label: d.name,
            sublabel: `${d.site} · ${d.status}`,
            route: "/cro-regulatory-documents",
            data: d,
          });
        }
      });

      reports.forEach((r) => {
        if (
          r.id.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q)
        ) {
          results.push({
            type: "Report",
            id: r.id,
            label: r.name,
            sublabel: r.type,
            route: "/cro-reports",
            data: r,
          });
        }
      });

      comments.forEach((c) => {
        if (
          c.id.toLowerCase().includes(q) ||
          c.message.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q)
        ) {
          results.push({
            type: "Comment",
            id: c.id,
            label: c.id,
            sublabel: c.message.substring(0, 50),
            route: "/cro-comments",
            data: c,
          });
        }
      });

      files.forEach((f) => {
        if (
          f.id.toLowerCase().includes(q) ||
          f.name.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q)
        ) {
          results.push({
            type: "File",
            id: f.id,
            label: f.name,
            sublabel: f.category,
            route: "/cro-files",
            data: f,
          });
        }
      });

      visits.forEach((v) => {
        if (
          v.cra.toLowerCase().includes(q) &&
          !results.some((r) => r.id === v.id && r.type === "Visit")
        ) {
          results.push({
            type: "Monitoring Record",
            id: v.id,
            label: v.id,
            sublabel: `CRA: ${v.cra}`,
            route: "/cro-monitoring",
            data: v,
          });
        }
      });

      return results.slice(0, 12);
    },
    [subjects, visits, documents, reports, comments, files]
  );

  const addSubject = useCallback((subject) => {
    setSubjects((prev) => [...prev, subject]);
  }, [setSubjects]);

  const updateSubject = useCallback(
    (id, updates) => {
      setSubjects((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
    },
    [setSubjects]
  );

  const deleteSubject = useCallback(
    (id) => {
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    },
    [setSubjects]
  );

  const addVisit = useCallback(
    (visit) => {
      setVisits((prev) => [...prev, visit]);
    },
    [setVisits]
  );

  const updateVisit = useCallback(
    (id, updates) => {
      setVisits((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
      );
    },
    [setVisits]
  );

  const deleteVisit = useCallback(
    (id) => {
      setVisits((prev) => prev.filter((v) => v.id !== id));
    },
    [setVisits]
  );

  const addDocument = useCallback(
    (doc) => {
      setDocuments((prev) => [...prev, doc]);
    },
    [setDocuments]
  );

  const updateDocument = useCallback(
    (id, updates) => {
      setDocuments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
      );
    },
    [setDocuments]
  );

  const addReport = useCallback(
    (report) => {
      setReports((prev) => [
        ...prev,
        {
          id: report.id || `REP-${String(prev.length + 1).padStart(3, "0")}`,
          status: report.status || "Generated",
          ...report,
        },
      ]);
    },
    [setReports]
  );

  const addComment = useCallback(
    (comment) => {
      setComments((prev) => [
        ...prev,
        {
          id: comment.id || `CMT-${String(prev.length + 1).padStart(3, "0")}`,
          replies: comment.replies || [],
          date: comment.date || new Date().toISOString().split("T")[0],
          ...comment,
        },
      ]);
    },
    [setComments]
  );

  const replyToComment = useCallback(
    (commentId, reply) => {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, replies: [...(c.replies || []), reply] }
            : c
        )
      );
    },
    [setComments]
  );

  const markNotificationRead = useCallback(
    (id) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, status: "Read" } : n
        )
      );
    },
    [setNotifications]
  );

  const addNotification = useCallback(
    (notification) => {
      setNotifications((prev) => [
        ...prev,
        {
          id: notification.id || `NOT-${String(prev.length + 1).padStart(3, "0")}`,
          date: notification.date || new Date().toISOString().split("T")[0],
          status: notification.status || "Unread",
          ...notification,
        },
      ]);
    },
    [setNotifications]
  );

  const addFile = useCallback(
    (file) => {
      setFiles((prev) => [
        ...prev,
        {
          id: file.id || `FIL-${String(prev.length + 1).padStart(3, "0")}`,
          uploadedOn: file.uploadedOn || file.date || new Date().toISOString().split("T")[0],
          size: file.size || "1.0 MB",
          ...file,
        },
      ]);
    },
    [setFiles]
  );

  const deleteFile = useCallback(
    (id) => {
      setFiles((prev) => prev.filter((f) => f.id !== id));
    },
    [setFiles]
  );

  return (
    <CRODataContext.Provider
      value={{
        isLoading,
        subjects,
        setSubjects,
        addSubject,
        updateSubject,
        deleteSubject,
        visits,
        setVisits,
        addVisit,
        updateVisit,
        deleteVisit,
        documents,
        setDocuments,
        addDocument,
        updateDocument,
        reports,
        setReports,
        addReport,
        comments,
        setComments,
        addComment,
        replyToComment,
        notifications,
        setNotifications,
        markNotificationRead,
        addNotification,
        files,
        setFiles,
        addFile,
        deleteFile,
        kpiMetrics,
        kpis,
        sitePerformanceData,
        upcomingVisits,
        globalSearch,
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
