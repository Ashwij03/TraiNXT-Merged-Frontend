import { useEffect, useState } from "react";
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
    study?.code ??
      study?.id ??
      study?.studyId ??
      study?.title ??
      study?.name ??
      "",
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

  if (!code) {
    return "";
  }

  return String(code) !== getStudyDisplayName(study) ? String(code) : "";
}

function getStudySubjects(study) {
  const subjectsByStudy = getAllSubjectsByStudy();
  const studyKey = getStudyKey(study);
  const subjects = subjectsByStudy[studyKey];

  return Array.isArray(subjects) ? subjects : [];
}

function readStudies() {
  try {
    const result = getStudies();
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

export function useRoleStudiesSidebar({ onNavigate } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const [studies, setStudies] = useState(() => readStudies());
  const [folderTreeVersion, setFolderTreeVersion] = useState(0);

  const [studiesOpen, setStudiesOpen] = useState(() => {
    return (
      pathname === "/studies" ||
      pathname.startsWith("/study-dashboard") ||
      pathname.startsWith("/study/") ||
      pathname === "/comments" ||
      pathname.includes("/comments")
    );
  });

  const [studyBinderOpen, setStudyBinderOpen] = useState(false);
  const [expandedStudies, setExpandedStudies] = useState({});
  const [expandedStudySections, setExpandedStudySections] = useState({});

  const studyCount = studies.length;

  const isStudiesOverviewRoute = pathname === "/studies";
  const isStudyInternalRoute =
    pathname.startsWith("/study-dashboard") || pathname.startsWith("/study/");
  const isCommentsRoute =
    pathname === "/comments" || pathname.includes("/comments");

  const isStudiesActive =
    isStudiesOverviewRoute || isStudyInternalRoute || isCommentsRoute;

  useEffect(() => {
    const refreshStudies = () => {
      setStudies(readStudies());
    };

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
    const refreshFolderTree = () => {
      setFolderTreeVersion((version) => version + 1);
    };

    window.addEventListener(FOLDER_TREE_EVENT, refreshFolderTree);

    return () => {
      window.removeEventListener(FOLDER_TREE_EVENT, refreshFolderTree);
    };
  }, []);

  useEffect(() => {
    if (isStudiesActive) {
      setStudiesOpen(true);
    }
  }, [isStudiesActive]);

  const handleNav = (path) => {
    navigate(path);

    if (typeof onNavigate === "function") {
      onNavigate();
    }
  };

  const handleStudiesClick = () => {
    setStudiesOpen((open) => !open);

    if (pathname !== "/studies") {
      navigate("/studies");
    }
  };

  const handleStudyBinderClick = (event) => {
    event?.stopPropagation();
    setStudyBinderOpen((open) => !open);
  };

  const handleStudiesCommentsClick = (event) => {
    event?.stopPropagation();
    handleNav("/comments");
  };

  const toggleStudyNode = (studyKey, event) => {
    event?.stopPropagation();

    setExpandedStudies((previous) => ({
      ...previous,
      [studyKey]: !previous[studyKey],
    }));
  };

  const toggleStudySection = (studyKey, sectionKey, event) => {
    event?.stopPropagation();

    const compositeKey = `${studyKey}__${sectionKey}`;

    setExpandedStudySections((previous) => ({
      ...previous,
      [compositeKey]: !previous[compositeKey],
    }));
  };

  const navigateToStudySection = (studyKey, sectionKey) => {
    const selectedStudy = studies.find(
      (study) => getStudyKey(study) === String(studyKey),
    );

    if (selectedStudy) {
      localStorage.setItem("selectedStudy", JSON.stringify(selectedStudy));
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

    const tab = tabMap[sectionKey] || "Overview";

    handleNav(
      `/study-dashboard/${encodeURIComponent(
        studyKey,
      )}?tab=${encodeURIComponent(tab)}`,
    );
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
    const subjectId = subject?.subjectId || subject?.id;

    if (!subjectId) {
      return;
    }

    localStorage.setItem(
      "selectedStudy",
      JSON.stringify({ code: String(studyKey) }),
    );

    handleNav(`/subject/${encodeURIComponent(subjectId)}`);
  };

  const getSubjectSidebarFolders = (studyKey, subject) => {
    void folderTreeVersion;

    const subjectId = subject?.subjectId || subject?.id;

    if (!subjectId) {
      return [];
    }

    return getFirstLevelFolders("subjects", `${studyKey}::${subjectId}`);
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