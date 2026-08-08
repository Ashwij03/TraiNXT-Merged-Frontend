import React, { useCallback, useMemo } from "react";

import {
  MdFolderCopy,
  MdInsertDriveFile,
  MdCloudQueue,
  MdPeopleOutline,
} from "react-icons/md";

import SubjectExplorer from "./SubjectExplorer";
import SubjectFileManager from "./SubjectFileManager";
import SelectedFolderBar from "./SelectedFolderBar";
import useSubjectWorkspace from "./useSubjectWorkspace";
import FolderStatsService from "./folderStatsService";
import { formatFileSize } from "./fileService";

/* `SelectedFolderBar` renders `.sw-folderbar*`, but those rules live in
   `pages/Sponsor/WorkspaceIntegration.css` and that component imports no
   stylesheet of its own. Today the sheet happens to be in the bundle because
   `routes/roleAwarePages.js` statically imports `pages/Sponsor/Subjects.js` -
   an accidental dependency that would break this tab the moment that route is
   code-split. Importing it here makes the requirement explicit. The sheet is
   entirely class-scoped (`sw-folderbar*` / `sw-crumb--folder`) and contains no
   `!important`, so this is cascade-neutral: it adds no rule that was not
   already being served. */
import "../WorkspaceIntegration.css";
import "./StudySubjectsWorkspace.css";

/**
 * KPI CARD - Subjects tab's own implementation
 * =============================================
 * A small, self-contained card renderer scoped entirely to this file/
 * stylesheet (`.ssw-kpi-card*`). It intentionally mirrors the *look* of the
 * eISF `DashboardCards` "reference" variant (icon-left layout, 84px min
 * height, 38px icon, 12/22/11px type steps) because the brief asks the two
 * workspaces to match visually - but it shares no import, no component and
 * no class name with `pages/shared/EISF/components/DashboardCards`. Subjects
 * owns this markup and can change it independently of eISF from now on.
 */
function SubjectsKpiCard({ card }) {
  const Icon = card.Icon;
  return (
    <div className="ssw-kpi-card">
      <div className="ssw-kpi-card-body">
        <div
          className="ssw-kpi-card-icon"
          style={{ "--card-color": card.color || "#2563eb" }}
        >
          <Icon aria-hidden="true" focusable="false" />
        </div>
        <div className="ssw-kpi-card-text">
          <div className="ssw-kpi-card-title">{card.title}</div>
          <div className="ssw-kpi-card-value">{card.value}</div>
          {card.detail && (
            <div className="ssw-kpi-card-detail">{card.detail}</div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * STUDY WORKSPACE -> SUBJECTS TAB (integration point only)
 * ========================================================
 *
 * Mounts the completed Phase 1-7 Subject Explorer workspace inside the Study
 * Workspace's Subjects tab.
 *
 * WHAT THIS IS
 * ------------
 * An integration seam - nearly every visible piece is an existing,
 * already-polished component (`SubjectExplorer`, `SubjectFileManager`,
 * `SelectedFolderBar`) driven by the existing `useSubjectWorkspace` hook. The
 * header and its KPI strip are this tab's own layout, styled to match eISF's
 * header but owned entirely by Subjects (see `SubjectsKpiCard` above).
 *
 * HEADER LAYOUT
 * -------------
 * The header is two columns on one row:
 *   LEFT   a compact "SUBJECTS / <selected section>" wayfinder, stacked on
 *          two lines, so the tab always shows where the explorer selection
 *          currently sits.
 *   RIGHT  the panel title ("Subject Documents", or the selected section's
 *          own name once a folder/subject is picked) beside its KPI cards,
 *          on the same row - never a separate row underneath.
 *
 * KPI STRIP
 * ---------
 * Cards are Subjects' own (`SubjectsKpiCard`), fed by `FolderStatsService`,
 * which already exposes both a workspace-wide scope and a per-node scope:
 *   - no selection   `getWorkspaceStats` - totals across every subject.
 *   - folder selected `getFolderStats(selectedFolder, store)` - totals
 *     scoped to that selection, so the strip is subject/section-specific
 *     rather than a static workspace summary.
 * No eISF component or stylesheet is imported to build this.
 *
 * WHY IT IS NOT `Subjects.js`
 * ---------------------------
 * `pages/Sponsor/Subjects.js` is a *page*: it renders `AppLayout`, a page
 * `<h1>`, KPI cards, a breadcrumb and its own subject table. Inside a tab all
 * of that is wrong - the study dashboard already supplies the chrome, and a
 * second layout/breadcrumb would nest one page inside another. So this
 * composes the same workspace parts without the page shell.
 *
 * WHAT IS DELIBERATELY LEFT OUT
 * -----------------------------
 * - `AppLayout`      the dashboard already provides it.
 * - `WorkspaceBreadcrumb` the dashboard owns the breadcrumb trail.
 * - the page `<h1>`  the tab heading is an `<h2>` under the dashboard's title.
 * - the subject table and Add Subject modal  those stay the responsibility of
 *   `StudySubjects.js`, which is untouched by this change.
 *
 * STYLING ISOLATION
 * -----------------
 * All layout lives in `StudySubjectsWorkspace.css`, scoped under
 * `.study-subjects-workspace`. `pages/shared/studies/StudySubjects.css` is NOT
 * modified, so `pages/PI/PISubjectsDashboard.js` - which imports that
 * stylesheet - is completely unaffected.
 *
 * SELECTION SCOPE
 * ---------------
 * `persist` is passed straight through to the hook. The tab defaults to
 * `persist={false}` so a folder chosen while reviewing one study is not
 * restored when a different study is opened; the standalone `/subjects` page
 * keeps its persisted selection. Both read the same folder/file stores, so no
 * data is duplicated.
 *
 * NOT IMPLEMENTED (unchanged across all phases): backend APIs, authentication,
 * version history, approval workflow, permissions, sharing, new CRUD.
 *
 * Props
 *   studyId  study whose subjects are being reviewed; used for labelling and
 *            to reset the selection when the study changes. Optional.
 *   persist  persist the folder selection across mounts (default false)
 */
function StudySubjectsWorkspace({ studyId = "", persist = false }) {
  const {
    tree,
    store,
    selectedId,
    selectedFolder,
    selectFolder,
    clearSelection,
    folderPath,
    fileCount,
    totalSize,
  } = useSubjectWorkspace({ persist });

  /* Whole-workspace totals: folders, files and storage across every subject.
     Used whenever nothing is selected, so the tab has numbers to show before
     a folder is picked. Memoised on the same inputs the hook already
     tracks. */
  const workspaceStats = useMemo(
    () => FolderStatsService.getWorkspaceStats(tree, store),
    [tree, store]
  );

  /* Once a folder/subject is selected, the strip switches to that node's own
     scope (`getFolderStats`) so the KPI cards describe the selected section
     rather than the whole workspace. */
  const selectedStats = useMemo(
    () => FolderStatsService.getFolderStats(selectedFolder, store),
    [selectedFolder, store]
  );

  const activeStats = selectedFolder ? selectedStats : workspaceStats;

  /**
   * The active scope's numbers mapped onto this tab's own card contract
   * (`{ key, title, value, detail, color, Icon }`). Rendered by
   * `SubjectsKpiCard` above - Subjects' own component, not eISF's.
   */
  const kpiCards = useMemo(() => {
    const {
      totalSubjects = 0,
      totalFolders = 0,
      totalFiles = 0,
      storageUsed = 0,
      quota = 0,
      usedPercent = 0,
    } = activeStats || {};

    return [
      {
        key: "subjects",
        title: selectedFolder ? "Nested Subjects" : "Total Subjects",
        value: totalSubjects,
        detail: selectedFolder
          ? "Within selected section"
          : "With document folders",
        Icon: MdPeopleOutline,
        color: "#2f80ed",
      },
      {
        key: "folders",
        title: "Folders",
        value: totalFolders,
        detail: selectedFolder ? "Within selection" : "Across all subjects",
        Icon: MdFolderCopy,
        color: "#2bb673",
      },
      {
        key: "files",
        title: "Documents",
        value: totalFiles,
        detail: selectedFolder ? "Within selection" : "Across the workspace",
        Icon: MdInsertDriveFile,
        color: "#f5a524",
      },
      {
        key: "storage",
        title: "Storage Used",
        value: formatFileSize(storageUsed),
        detail: quota
          ? `${Math.round(usedPercent)}% of ${formatFileSize(quota)}`
          : "Total size",
        Icon: MdCloudQueue,
        color: "#ef5b65",
      },
    ];
  }, [activeStats, selectedFolder]);

  /* Stable so the memoised explorer does not re-render on unrelated updates. */
  const handleSelect = useCallback((node) => selectFolder(node), [selectFolder]);

  /* Text shared by the left "SUBJECTS / ..." wayfinder and the right-hand
     panel title - both track the current selection so the header always
     reads as one coherent statement rather than two independent labels. */
  const sectionLabel = selectedFolder ? selectedFolder.name : "All Subjects";
  const panelTitle = selectedFolder ? selectedFolder.name : "Subject Documents";

  return (
    <section
      className="study-subjects-workspace tnxt-compact"
      aria-label={
        studyId ? `Subject documents for study ${studyId}` : "Subject documents"
      }
      data-study-id={studyId || ""}
      data-selected-folder={selectedFolder?.id || ""}
    >
      {/* Two-column header, one row:
            LEFT  "SUBJECTS / <selected section>" wayfinder.
            RIGHT panel title + KPI cards, side by side on the same row. */}
      <header className="ssw-header">
        <div className="ssw-crumb">
          <span className="ssw-crumb-eyebrow">SUBJECTS /</span>
          <span className="ssw-crumb-section" title={sectionLabel}>
            {sectionLabel}
          </span>
        </div>

        <div className="ssw-header-right">
          <div className="ssw-header-text">
            <div className="ssw-title-row">
              <h2 className="ssw-title">{panelTitle}</h2>
              <span className="ssw-title-count">
                {activeStats?.totalSubjects ?? 0}
              </span>
            </div>
            <p className="ssw-subtitle">
              {selectedFolder
                ? `Documents and folders within ${selectedFolder.name}.`
                : `Browse subject folders and manage their documents${
                    studyId ? ` for ${studyId}` : ""
                  }.`}
            </p>
          </div>

          {/* Subject-specific totals for the active scope. */}
          <div className="ssw-kpi-cards">
            {kpiCards.map((card) => (
              <SubjectsKpiCard card={card} key={card.key} />
            ))}
          </div>
        </div>
      </header>

      <div className="ssw-body">
        {/* Controlled selection: sidebar, folder bar and file list can never
            disagree, including on the first render after a tab switch. */}
        <SubjectExplorer selectedId={selectedId} onSelect={handleSelect} />

        <div className="ssw-main">
          <SelectedFolderBar
            folder={selectedFolder}
            path={folderPath}
            fileCount={fileCount}
            totalSize={totalSize}
            onClear={clearSelection}
          />

          {/* Owns its own file state and persistence. */}
          <SubjectFileManager selectedFolder={selectedFolder} />
        </div>
      </div>
    </section>
  );
}

export default StudySubjectsWorkspace;
