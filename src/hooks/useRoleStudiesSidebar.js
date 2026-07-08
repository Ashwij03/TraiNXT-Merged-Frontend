import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getStudies } from "../services/studyService";
import {
  FOLDER_TREE_EVENT,
  getFirstLevelFolders,
} from "../services/folderService";

export const STUDY_SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "subjects", label: "Subjects", expandable: true },
  { key: "planning", label: "Planning" },
  { key: "visitPlan", label: "Visit Plan" },
  { key: "eisf", label: "eISF", expandable: true },
  { key: "regulatory", label: "Regulatory" },
  { key: "reports", label: "Reports" },
  { key: "studyFiles", label: "Study Files" },
  { key: "logs", label: "Logs" },
  { key: "financials", label: "Financials" },
  { key: "others", label: "Others" },
];

function getAllSubjectsByStudy() {
  try {
    return JSON.parse(localStorage.getItem("subjectsByStudy")) || {};
  } catch {
    return {};
  }
}

export function getStudyKey(study) {
  return String(
    study?.code ?? study?.id ?? study?.studyId ?? study?.title ?? study?.name,
  );
}

export function getStudyDisplayName(study) {
  return (
    study?.name ||
    study?.title ||
    study?.studyName ||
    study?.protocolTitle ||
    study?.protocol ||
    "Untitled Study"
  );
}

export function getStudyMeta(study) {
  const code = study?.code || study?.id || study?.studyId;
  if (!code) return "";
  const name = getStudyDisplayName(study);
  if (name && code !== name) return code;
  return "";
}

function getStudySubjects(study) {
  const subjectsByStudy = getAllSubjectsByStudy();
  const studyKey = getStudyKey(study);
  const subjects = subjectsByStudy[studyKey];
  return Array.isArray(subjects) ? subjects : [];
}

export function useRoleStudiesSidebar({ onNavigate } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const prevActiveStudyKeyRef = useRef(null);

  const [studiesVersion, setStudiesVersion] = useState(0);
  const [studyBinderOpen, setStudyBinderOpen] = useState(false);
  const [studiesOpen, setStudiesOpen] = useState(() => {
    const path = pathname;
    return (
      path === "/studies" ||
      path.startsWith("/study-dashboard") ||
      path.startsWith("/study/") ||
      path.includes("/comments") ||
      path === "/comments"
    );
  });
  const [expandedStudies, setExpandedStudies] = useState({});
  const [expandedStudySections, setExpandedStudySections] = useState({});
  const [folderTreeVersion, setFolderTreeVersion] = useState(0);

  void studiesVersion;

  const studies = (() => {
    try {
      const list = getStudies();
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  })();

  const studyCount = studies.length;
  const isStudiesOverviewRoute = pathname === "/studies";
  const isStudyInternalRoute =
    pathname.startsWith("/study-dashboard") || pathname.startsWith("/study/");
  const isCommentsRoute =
    pathname.includes("/comments") || pathname === "/comments";
  const isStudiesActive = isStudiesOverviewRoute || isStudyInternalRoute;

  useEffect(() => {
    const refreshStudies = () => setStudiesVersion((v) => v + 1);

    window.addEventListener("studies-updated", refreshStudies);
    window.addEventListener("subjects-updated", refreshStudies);
    window.addEventListener("sponsor-data-updated", refreshStudies);
    window.addEventListener("planning-updated", refreshStudies);
    window.addEventListener("visit-plans-updated", refreshStudies);
    window.addEventListener("study-overview-updated", refreshStudies);

    return () => {
      window.removeEventListener("studies-updated", refreshStudies);
      window.removeEventListener("subjects-updated", refreshStudies);
      window.removeEventListener("sponsor-data-updated", refreshStudies);
      window.removeEventListener("planning-updated", refreshStudies);
      window.removeEventListener("visit-plans-updated", refreshStudies);
      window.removeEventListener("study-overview-updated", refreshStudies);
    };
  }, []);

  useEffect(() => {
    const handleFolderTreeUpdate = () => {
      setFolderTreeVersion((value) => value + 1);
    };

    window.addEventListener(FOLDER_TREE_EVENT, handleFolderTreeUpdate);
    return () =>
      window.removeEventListener(FOLDER_TREE_EVENT, handleFolderTreeUpdate);
  }, []);

  useEffect(() => {
    if (isStudiesOverviewRoute || isStudyInternalRoute || isCommentsRoute) {
      setStudiesOpen((open) => (open ? open : true));
      return;
    }
    setStudiesOpen((open) => (open ? false : open));
  }, [isStudiesOverviewRoute, isStudyInternalRoute, isCommentsRoute, pathname]);

  useEffect(() => {
    if (!isStudyInternalRoute) {
      prevActiveStudyKeyRef.current = null;
      return;
    }

    const studyMatch = pathname.match(/^\/study-dashboard\/([^/?]+)/);
    const activeStudyKey = studyMatch?.[1];
    if (!activeStudyKey) return;

    const studyExists = studies.some(
      (study) => getStudyKey(study) === activeStudyKey,
    );

    if (!studyExists && studies.length >= 0) {
      navigate("/studies", { replace: true });
      return;
    }

    if (prevActiveStudyKeyRef.current !== activeStudyKey) {
      setStudyBinderOpen((open) => (open ? open : true));
      setExpandedStudies((prev) => ({ ...prev, [activeStudyKey]: true }));
      prevActiveStudyKeyRef.current = activeStudyKey;
    }
  }, [pathname, isStudyInternalRoute, studies, navigate]);

  const handleNav = (path) => {
    navigate(path);
    onNavigate?.();
  };

  const handleStudiesClick = () => {
    if (pathname === "/studies" && studiesOpen) {
      setStudiesOpen(false);
      return;
    }
    setStudiesOpen((open) => (open ? open : true));
    if (pathname !== "/studies") {
      handleNav("/studies");
    }
  };

  const handleStudyBinderClick = (event) => {
    event?.stopPropagation();
    setStudyBinderOpen((prev) => !prev);
  };

  const handleStudiesCommentsClick = (event) => {
    event?.stopPropagation();
    handleNav("/comments");
  };

  const toggleStudyNode = (studyKey, event) => {
    event?.stopPropagation();
    setExpandedStudies((prev) => ({
      ...prev,
      [studyKey]: !Boolean(prev[studyKey]),
    }));
  };

  const toggleStudySection = (studyKey, sectionKey, event) => {
    event?.stopPropagation();
    const compositeKey = `${studyKey}__${sectionKey}`;
    setExpandedStudySections((prev) => ({
      ...prev,
      [compositeKey]: !prev[compositeKey],
    }));
  };

  const navigateToStudySection = (studyKey, section) => {
    const study = studies.find((item) => getStudyKey(item) === studyKey);
    if (study) {
      localStorage.setItem("selectedStudy", JSON.stringify(study));
    }

    const tabMap = {
      overview: "Overview",
      subjects: "Subjects",
      planning: "Planning",
      visitPlan: "Visit Plan",
      eisf: "eISF",
      regulatory: "Regulatory",
      reports: "Reports",
      studyFiles: "Study Files",
      logs: "Logs",
      financials: "Financials",
      others: "Others",
    };

    const tab = tabMap[section] || "Overview";
    handleNav(`/study-dashboard/${studyKey}?tab=${encodeURIComponent(tab)}`);
  };

  const handleExpandableSectionLabelClick = (
    studyKey,
    sectionKey,
    isSectionOpen,
    event,
  ) => {
    event?.stopPropagation();
    if (isSectionOpen) {
      toggleStudySection(studyKey, sectionKey, event);
      return;
    }
    navigateToStudySection(studyKey, sectionKey);
  };

  const handleSubjectClick = (studyKey, subject) => {
    const subjectId = subject.subjectId || subject.id;
    localStorage.setItem("selectedStudy", JSON.stringify({ code: studyKey }));
    handleNav(`/subject/${subjectId}`);
  };

  const getSubjectSidebarFolders = (studyKey, subject) => {
    void folderTreeVersion;
    const subjectId = subject.subjectId || subject.id;
    const contextKey = `${studyKey}::${subjectId}`;
    return getFirstLevelFolders("subjects", contextKey);
  };

  const getSubjectsForStudy = (study) => getStudySubjects(study);

  return {
    studies,
    studyCount,
    studiesOpen,
    setStudiesOpen,
    studyBinderOpen,
    expandedStudies,
    expandedStudySections,
    setExpandedStudySections,
    isStudiesActive,
    isCommentsRoute,
    handleStudiesClick,
    handleStudyBinderClick,
    handleStudiesCommentsClick,
    toggleStudyNode,
    toggleStudySection,
    navigateToStudySection,
    handleExpandableSectionLabelClick,
    handleSubjectClick,
    getSubjectSidebarFolders,
    getSubjectsForStudy,
    handleNav,
  };
}