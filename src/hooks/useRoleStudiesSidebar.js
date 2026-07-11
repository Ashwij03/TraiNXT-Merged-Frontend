import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getStudies } from "../services/studyService";
import { FOLDER_TREE_EVENT } from "../services/folderService";

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
    const savedSubjects = JSON.parse(
      localStorage.getItem("subjectsByStudy")
    );

    return savedSubjects && typeof savedSubjects === "object"
      ? savedSubjects
      : {};
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
      ""
  ).trim();
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

  const studyName = getStudyDisplayName(study);

  return String(code) !== String(studyName) ? String(code) : "";
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

  const previousActiveStudyKeyRef = useRef(null);

  const [studies, setStudies] = useState(() => readStudies());

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
    window.addEventListener("storage", refreshStudies);

    return () => {
      window.removeEventListener("studies-updated", refreshStudies);
      window.removeEventListener("subjects-updated", refreshStudies);
      window.removeEventListener("sponsor-data-updated", refreshStudies);
      window.removeEventListener("planning-updated", refreshStudies);
      window.removeEventListener("visit-plans-updated", refreshStudies);
      window.removeEventListener("study-overview-updated", refreshStudies);
      window.removeEventListener("storage", refreshStudies);
    };
  }, []);

  useEffect(() => {
    const refreshSidebar = () => {
      setStudies(readStudies());
    };

    window.addEventListener(FOLDER_TREE_EVENT, refreshSidebar);

    return () => {
      window.removeEventListener(FOLDER_TREE_EVENT, refreshSidebar);
    };
  }, []);

  useEffect(() => {
    if (isStudiesOverviewRoute || isStudyInternalRoute || isCommentsRoute) {
      setStudiesOpen((currentValue) => (currentValue ? currentValue : true));
      return;
    }

    setStudiesOpen((currentValue) => (currentValue ? false : currentValue));
  }, [
    isStudiesOverviewRoute,
    isStudyInternalRoute,
    isCommentsRoute,
    pathname,
  ]);

  useEffect(() => {
    if (!isStudyInternalRoute) {
      previousActiveStudyKeyRef.current = null;
      return;
    }

    const studyMatch = pathname.match(/^\/study-dashboard\/([^/?]+)/);
    const activeStudyKey = studyMatch?.[1];

    if (!activeStudyKey) {
      return;
    }

    if (previousActiveStudyKeyRef.current !== activeStudyKey) {
      setStudiesOpen(true);
      setStudyBinderOpen(true);
      setExpandedStudies({ [activeStudyKey]: true });
      setExpandedStudySections({});
      previousActiveStudyKeyRef.current = activeStudyKey;
    }
  }, [pathname, isStudyInternalRoute]);

  const handleNav = (path) => {
    navigate(path);
    onNavigate?.();
  };

  const handleStudiesClick = () => {
    if (pathname === "/studies" && studiesOpen) {
      setStudiesOpen(false);
      return;
    }

    setStudiesOpen(true);

    if (pathname !== "/studies") {
      handleNav("/studies");
    }
  };

  const handleStudyBinderClick = (event) => {
    event?.stopPropagation();
    setStudyBinderOpen((previousValue) => !previousValue);
  };

  const handleStudiesCommentsClick = (event) => {
    event?.stopPropagation();
    handleNav("/comments");
  };

  const toggleStudyNode = (studyKey, event) => {
    event?.stopPropagation();

    const isCurrentStudyOpen = Boolean(expandedStudies[studyKey]);

    if (isCurrentStudyOpen) {
      setExpandedStudies({});
      setExpandedStudySections({});
      return;
    }

    setExpandedStudies({ [studyKey]: true });
    setExpandedStudySections({});
  };

  const toggleStudySection = (studyKey, sectionKey, event) => {
    event?.stopPropagation();

    const compositeKey = `${studyKey}__${sectionKey}`;

    setExpandedStudySections((previousValue) => ({
      ...previousValue,
      [compositeKey]: !Boolean(previousValue[compositeKey]),
    }));
  };

  const toggleEisfModule = (studyKey, moduleId, event) => {
    event?.stopPropagation();

    const moduleKey = `${studyKey}__eisf_module__${moduleId}`;

    setExpandedStudySections((previousValue) => ({
      ...previousValue,
      [moduleKey]: !Boolean(previousValue[moduleKey]),
    }));
  };

  const navigateToStudySection = (studyKey, sectionKey) => {
    const selectedStudy = studies.find(
      (study) => getStudyKey(study) === String(studyKey)
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
        studyKey
      )}?tab=${encodeURIComponent(tab)}`
    );
  };

  const handleStudyNameClick = (studyKey, event) => {
    event?.stopPropagation();

    const isCurrentStudyOpen = Boolean(expandedStudies[studyKey]);

    if (isCurrentStudyOpen) {
      setExpandedStudies({});
      setExpandedStudySections({});
      return;
    }

    setExpandedStudies({ [studyKey]: true });
    setExpandedStudySections({});
    navigateToStudySection(studyKey, "overview");
  };

  const handleSubjectsSectionClick = (studyKey, event) => {
    event?.stopPropagation();

    const compositeKey = `${studyKey}__subjects`;

    setExpandedStudySections((previousValue) => ({
      ...previousValue,
      [compositeKey]: !Boolean(previousValue[compositeKey]),
    }));

    localStorage.removeItem("selectedSubject");

    window.dispatchEvent(
      new CustomEvent("subject-selected", {
        detail: {
          studyId: studyKey,
          subject: null,
        },
      })
    );

    navigateToStudySection(studyKey, "subjects");
  };

  const handleEisfSectionClick = (studyKey, event) => {
    event?.stopPropagation();

    const compositeKey = `${studyKey}__eisf`;

    setExpandedStudySections((previousValue) => ({
      ...previousValue,
      [compositeKey]: !Boolean(previousValue[compositeKey]),
    }));

    navigateToStudySection(studyKey, "eisf");
  };

  const handleExpandableSectionLabelClick = (studyKey, sectionKey, event) => {
    event?.stopPropagation();

    if (sectionKey === "subjects") {
      handleSubjectsSectionClick(studyKey, event);
      return;
    }

    if (sectionKey === "eisf") {
      handleEisfSectionClick(studyKey, event);
      return;
    }

    toggleStudySection(studyKey, sectionKey, event);
  };

  const handleSubjectClick = (studyKey, subject) => {
    const subjectId = String(subject?.subjectId || subject?.id || "").trim();

    if (!subjectId) {
      return;
    }

    const selectedStudy = studies.find(
      (study) => getStudyKey(study) === String(studyKey)
    );

    if (selectedStudy) {
      localStorage.setItem("selectedStudy", JSON.stringify(selectedStudy));
    }

    const selectedSubject = {
      ...subject,
      subjectId,
      id: subject?.id || subjectId,
      studyId: studyKey,
    };

    localStorage.setItem("selectedSubject", JSON.stringify(selectedSubject));

    setStudiesOpen(true);
    setStudyBinderOpen(true);
    setExpandedStudies({ [studyKey]: true });
    setExpandedStudySections({
      [`${studyKey}__subjects`]: true,
    });

    window.dispatchEvent(
      new CustomEvent("subject-selected", {
        detail: {
          studyId: studyKey,
          subject: selectedSubject,
        },
      })
    );

    handleNav(
      `/study-dashboard/${encodeURIComponent(
        studyKey
      )}?tab=Subjects&subject=${encodeURIComponent(subjectId)}`
    );
  };

  const handleEisfChildClick = (studyKey, child) => {
    const selectedStudy = studies.find(
      (study) => getStudyKey(study) === String(studyKey)
    );

    if (selectedStudy) {
      localStorage.setItem("selectedStudy", JSON.stringify(selectedStudy));
    }

    const childPath = String(child?.path || "");
    const separator = childPath.includes("?") ? "&" : "?";

    if (childPath) {
      handleNav(
        `${childPath}${separator}study=${encodeURIComponent(studyKey)}`
      );
      return;
    }

    navigateToStudySection(studyKey, "eisf");
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
    isStudiesActive,
    isCommentsRoute,
    handleStudiesClick,
    handleStudyBinderClick,
    handleStudiesCommentsClick,
    toggleStudyNode,
    toggleStudySection,
    toggleEisfModule,
    navigateToStudySection,
    handleStudyNameClick,
    handleExpandableSectionLabelClick,
    handleSubjectClick,
    handleEisfChildClick,
    getSubjectsForStudy,
    handleNav,
  };
}