import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MdSearch,
  MdClose,
  MdFolderOff,
  MdCheckCircle,
  MdErrorOutline,
  MdWarningAmber,
  MdSwapVert,
  MdInsertDriveFile,
  MdStorage,
  MdTune,
} from "react-icons/md";

import FileUploadButton from "./FileUploadButton";
import DragDropUpload from "./DragDropUpload";
import SubjectFileTable from "./SubjectFileTable";
import FilePreviewModal from "./FilePreviewModal";
import RenameFileModal from "./RenameFileModal";
import DeleteFileDialog from "./DeleteFileDialog";
import CreateFolderModal from "./CreateFolderModal";
import FolderStatsBar from "./FolderStatsBar";
import FileFilterBar from "./FileFilterBar";
import FileService from "./fileService";
import FolderTreeService from "./folderTreeService";
import FolderStatsService from "./folderStatsService";
import FileFilterService, { DEFAULT_FILTERS } from "./fileFilterService";
import { formatFileSize } from "./fileService";
import "./SubjectFiles.css";
import "./DocumentExperience.css";

/**
 * Subject Explorer - SUBJECT FILE MANAGER (Phase 4 container)
 * ==========================================================
 *
 * Owns all file state for the folder currently selected in the explorer:
 * upload, list, search, sort, and the view/rename/download/delete actions.
 *
 * Design notes
 * ------------
 * - Every read/write goes through FileService, so swapping localStorage for
 *   real APIs later needs no changes here (see that module's migration note).
 * - The folder tree is read (never written) through FolderTreeService so the
 *   header can show the full folder path and orphaned file buckets can be
 *   pruned after a Phase 3 folder delete. Phase 1-3 files are untouched.
 * - The node handed down by the explorer is re-resolved by id on every
 *   render, so a folder renamed in Phase 3 shows its new name immediately.
 *
 * NOT in this phase: backend APIs, version history, sharing, permissions,
 * approval workflow.
 *
 * Props
 *   selectedFolder  node selected in the explorer ({ id, name, type }) or null
 */

const SORT_OPTIONS = [
  { key: "name", label: "Name" },
  { key: "date", label: "Date" },
  { key: "size", label: "Size" },
  { key: "type", label: "Type" },
];

/** Default direction per key: newest/largest first feels right for those. */
const DEFAULT_DIRECTION = { name: "asc", type: "asc", date: "desc", size: "desc" };

function SubjectFileManager({ selectedFolder }) {
  /* ---------- persisted stores ---------- */
  const [store, setStore] = useState(() => FileService.loadFileStore());
  const [tree, setTree] = useState(() => FolderTreeService.loadFolderTree());

  /* ---------- view state ---------- */
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  /* Phase 6: advanced filters (type / uploaded date / size). */
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  /* ---------- interaction state ---------- */
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { tone, message, details? }
  const [dialog, setDialog] = useState(null); // { mode, file }
  const [submitError, setSubmitError] = useState("");
  /* Phase 6: create-subfolder from the empty state. */
  const [creatingFolder, setCreatingFolder] = useState(false);
  /* Phase 7: true while the async folder read is in flight (see note below). */
  const [loadingFiles, setLoadingFiles] = useState(false);

  const folderId = selectedFolder?.id || null;

  /* ==============================================================
     SYNC WITH PERSISTED DATA
  ============================================================== */

  /**
   * Files changed -> reload from the persisted store.
   *
   * Phase 5: this listens to EVERY source, not just "storage". The workspace
   * now has more than one writer (this panel, and anything else driven by
   * `useSubjectWorkspace`), so filtering to cross-tab events alone would let
   * this table drift out of step with the folder bar's file count.
   *
   * Re-reading after a local mutation is harmless: the value being loaded is
   * exactly what was just written, so the state lands on the same store.
   */
  useEffect(
    () =>
      FileService.subscribeFiles(() => {
        setStore(FileService.loadFileStore());
      }),
    []
  );

  /* Folder tree changed (any source, including Phase 3 CRUD in the sidebar)
     -> re-read it so the path/header stay accurate. */
  useEffect(
    () =>
      FolderTreeService.subscribeFolderTree(() => {
        setTree(FolderTreeService.loadFolderTree());
      }),
    []
  );

  /* All folder ids currently present in the tree. */
  const existingFolderIds = useMemo(() => {
    const ids = [];
    const walk = (nodes) =>
      (nodes || []).forEach((node) => {
        ids.push(node.id);
        walk(node.children);
      });
    walk(tree);
    return ids;
  }, [tree]);

  /**
   * Drop file buckets whose folder was deleted in the sidebar.
   *
   * Phase 3's deleteFolder intentionally knows nothing about files, so this
   * keeps the two stores consistent without touching that module.
   *
   * The prune runs outside the state updater because it writes to storage;
   * updater functions must stay pure (StrictMode double-invokes them).
   * `store` is read from the ref so this effect does not re-run on every
   * upload/rename/delete - only when the folder tree itself changes.
   */
  const storeRef = useRef(store);
  storeRef.current = store;

  useEffect(() => {
    if (existingFolderIds.length === 0) return;

    const result = FileService.pruneOrphanFolders(
      storeRef.current,
      existingFolderIds
    );

    if (result.changed) setStore(result.store);
  }, [existingFolderIds]);

  /* Reset the per-folder view state when the selection changes. */
  const previousFolderId = useRef(folderId);
  useEffect(() => {
    if (previousFolderId.current === folderId) return;
    previousFolderId.current = folderId;
    setSearch("");
    setFeedback(null);
    setDialog(null);
    setSubmitError("");
    // Phase 6: filters are per-folder too - carrying a PDF filter into a
    // folder with no PDFs would look like an empty folder.
    setFilters(DEFAULT_FILTERS);
    setShowFilters(false);
    setCreatingFolder(false);
  }, [folderId]);

  /**
   * Phase 7: drive the table's skeleton from the async read seam.
   *
   * Reads go through `FileService.fetchFolderFiles`, the async counterpart to
   * the synchronous `listFiles` selector. This is a real await, not a timer -
   * nothing is delayed artificially.
   *
   * Measured behaviour: against today's localStorage layer the promise settles
   * on a microtask, so React batches the true -> false transition into a single
   * commit and the skeleton does not paint. That is the correct outcome - the
   * rows are already in hand, so flashing a placeholder over them would only
   * slow the folder switch down. Verified against a latency-injected build,
   * this same code holds the skeleton for the full duration of the request, so
   * a real backend needs no further changes here.
   *
   * Only the folder id is in the dependency list. Keying this on `store` too
   * would flash a skeleton after every upload, rename and delete, which would
   * hide rows the app already has - the case that was rightly rejected before.
   *
   * The rows themselves keep coming from the `folderFiles` memo below, so the
   * persisted store stays the single source of truth and this cannot drift
   * from the folder bar's count. On migration, the resolved array is what you
   * feed into `setStore` here.
   */
  useEffect(() => {
    if (!folderId) {
      setLoadingFiles(false);
      return undefined;
    }

    // Guards against a stale read landing after a fast folder switch.
    const controller = new AbortController();
    let active = true;

    setLoadingFiles(true);

    FileService.fetchFolderFiles(storeRef.current, folderId, {
      signal: controller.signal,
    })
      .catch(() => {
        // Aborted or failed: the store-derived rows remain correct, so there
        // is nothing to surface here. A real backend would set an error state.
      })
      .finally(() => {
        if (active) setLoadingFiles(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [folderId]);

  /* Transient success/error banner. */
  useEffect(() => {
    if (!feedback) return undefined;
    // Multi-file validation summaries stay until dismissed - they render a
    // list the user needs time to read. A single rejection is one sentence
    // in the message itself, so it auto-dismisses like any other alert.
    if (feedback.details?.length > 1) return undefined;

    const timer = setTimeout(() => setFeedback(null), 3200);
    return () => clearTimeout(timer);
  }, [feedback]);

  /* ==============================================================
     DERIVED DATA
  ============================================================== */

  /* Re-resolve the node from the tree so a Phase 3 rename is reflected. */
  const folderNode = useMemo(
    () => (folderId ? FolderTreeService.findNodeById(tree, folderId) : null),
    [tree, folderId]
  );

  const folderName = folderNode?.name || selectedFolder?.name || "";
  const isSubjectNode = (folderNode?.type || selectedFolder?.type) === "subject";

  /* Breadcrumb path from the root down to the selected folder. */
  const folderPath = useMemo(() => {
    if (!folderId) return [];

    const ancestors = FolderTreeService.getAncestorIds(tree, folderId)
      .map((id) => FolderTreeService.findNodeById(tree, id)?.name)
      .filter(Boolean)
      .reverse();

    return [...ancestors, folderName].filter(Boolean);
  }, [tree, folderId, folderName]);

  const folderFiles = useMemo(
    () => FileService.listFiles(store, folderId),
    [store, folderId]
  );

  /**
   * Phase 6 pipeline: filters -> search -> sort.
   *
   * Filtering first means the "N of M" counter and the empty-state choice
   * both reason about the same set the user narrowed to.
   */
  const filteredFiles = useMemo(
    () => FileFilterService.applyFilters(folderFiles, filters),
    [folderFiles, filters]
  );

  const visibleFiles = useMemo(
    () =>
      FileService.sortFiles(
        FileService.searchFiles(filteredFiles, search),
        sortKey,
        sortDir
      ),
    [filteredFiles, search, sortKey, sortDir]
  );

  const folderSize = useMemo(() => FileService.totalSize(folderFiles), [folderFiles]);

  const activeFilterCount = useMemo(
    () => FileFilterService.countActiveFilters(filters),
    [filters]
  );

  /* Requirement 2: folders / files / storage for the selected subtree. */
  const stats = useMemo(
    () => FolderStatsService.getFolderStats(folderNode, store),
    [folderNode, store]
  );

  /* ==============================================================
     HANDLERS
  ============================================================== */

  /** Requirement 1 + 8: upload with per-file validation. */
  const handleUpload = useCallback(
    async (fileList) => {
      if (!folderId) {
        setFeedback({
          tone: "error",
          message: "Select a folder in the explorer before uploading files.",
        });
        return;
      }

      setUploading(true);

      try {
        const result = await FileService.uploadFiles(store, folderId, fileList);

        if (!result.ok) {
          setFeedback({
            tone: "error",
            message: result.error,
            details: result.rejected,
          });
          return;
        }

        setStore(result.store);

        const count = result.added.length;
        const base = `${count} ${count === 1 ? "file" : "files"} uploaded to "${folderName}".`;

        setFeedback({
          tone: result.rejected.length > 0 ? "warning" : "success",
          message:
            result.rejected.length > 0
              ? `${base} ${result.rejected.length} ${
                  result.rejected.length === 1 ? "file was" : "files were"
                } skipped.`
              : result.warning
              ? `${base} ${result.warning}`
              : base,
          details: result.rejected,
        });
      } finally {
        setUploading(false);
      }
    },
    [store, folderId, folderName]
  );

  /**
   * Requirement 6: clicking the active column flips the direction, a new
   * column adopts its default direction.
   *
   * Both setters are called from the event handler rather than nesting one
   * inside the other's updater - updater functions must stay pure, and React
   * StrictMode double-invokes them (which would toggle the direction twice
   * and appear to do nothing).
   */
  const handleSort = useCallback(
    (key) => {
      if (key === sortKey) {
        setSortDir(sortDir === "asc" ? "desc" : "asc");
        return;
      }
      setSortKey(key);
      setSortDir(DEFAULT_DIRECTION[key] || "asc");
    },
    [sortKey, sortDir]
  );

  /* ---------- Phase 6: advanced filters ---------- */
  const patchFilters = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  /**
   * Drop a filter value whose option no longer exists.
   *
   * The type options are derived from the folder's files, so deleting the last
   * PDF while "PDF" was selected left the `<select>` with a value that matched
   * no option: the browser painted "All types" while the state still filtered
   * on PDF, so the table showed nothing and the control contradicted it.
   *
   * `reconcileFilters` returns the *same* object when nothing is stale, so this
   * is a no-op on almost every render and cannot loop. Uploads are covered too
   * - adding a file only ever widens the option list.
   */
  useEffect(() => {
    setFilters((prev) => FileFilterService.reconcileFilters(prev, folderFiles));
  }, [folderFiles]);

  /* Stable callbacks handed to the memoised table (Phase 7). */
  const clearSearch = useCallback(() => setSearch(""), []);
  const openCreateFolder = useCallback(() => {
    setSubmitError("");
    setCreatingFolder(true);
  }, []);
  const dismissFeedback = useCallback(() => setFeedback(null), []);
  const toggleFilters = useCallback(() => setShowFilters((prev) => !prev), []);
  const flipSortDir = useCallback(
    () => setSortDir((prev) => (prev === "asc" ? "desc" : "asc")),
    []
  );

  /* ---------- Phase 6: create a subfolder from the empty state ---------- */
  const validateNewFolder = useCallback(
    (name) => FolderTreeService.validateFolderName(tree, folderId, name),
    [tree, folderId]
  );

  const submitCreateFolder = (name) => {
    const result = FolderTreeService.createFolder(tree, folderId, name);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    // The service persists and emits, so the sidebar tree and the stats
    // strip both pick this up through their existing subscriptions.
    setTree(result.tree);
    setCreatingFolder(false);
    setSubmitError("");
    setFeedback({
      tone: "success",
      message: `Folder "${result.node.name}" created in "${folderName}".`,
    });
  };

  const handleDownload = useCallback((file) => {
    const result = FileService.downloadFile(file);

    setFeedback(
      result.ok
        ? {
            tone: result.placeholder ? "warning" : "success",
            message: result.placeholder
              ? `"${file.name}" has no stored contents - a details summary was downloaded instead.`
              : `"${file.name}" downloaded.`,
          }
        : { tone: "error", message: result.error }
    );
  }, []);

  /** Requirement 4: route row/menu actions to the right dialog. */
  const handleAction = useCallback(
    (action, file) => {
      setSubmitError("");

      if (action === "download") {
        handleDownload(file);
        return;
      }

      if (action === "view" || action === "rename" || action === "delete") {
        setDialog({ mode: action === "view" ? "preview" : action, file });
      }
    },
    [handleDownload]
  );

  const closeDialog = useCallback(() => {
    setDialog(null);
    setSubmitError("");
  }, []);

  /* Live validator handed to the rename modal (one rule set, one source). */
  const validateRename = useCallback(
    (name) =>
      FileService.validateFileName(store, folderId, name, {
        excludeId: dialog?.file?.id,
      }),
    [store, folderId, dialog]
  );

  const submitRename = (name) => {
    const result = FileService.renameFile(store, folderId, dialog.file.id, name);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    setStore(result.store);
    setFeedback({ tone: "success", message: `Renamed to "${result.file.name}".` });
    closeDialog();
  };

  const submitDelete = () => {
    const target = dialog.file;
    const result = FileService.deleteFile(store, folderId, target.id);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    setStore(result.store);
    setFeedback({ tone: "success", message: `"${target.name}" deleted.` });
    closeDialog();
  };

  /* ==============================================================
     RENDER
  ============================================================== */

  /* No folder chosen yet - mirror the explorer's own empty-state style. */
  if (!folderId) {
    return (
      <section className="sf-panel" aria-label="Subject files">
        <div className="sf-empty-state sf-empty-state--no-folder">
          <span className="sf-empty-icon" aria-hidden="true">
            <MdFolderOff size={30} />
          </span>
          <h3>No folder selected</h3>
          <p>
            Choose a subject or folder in the Subject Explorer to view and
            manage its files.
          </p>
        </div>
      </section>
    );
  }

  const FeedbackIcon =
    feedback?.tone === "success"
      ? MdCheckCircle
      : feedback?.tone === "warning"
      ? MdWarningAmber
      : MdErrorOutline;

  return (
    <section className="sf-panel" aria-label={`Files in ${folderName}`}>
      {/* ================= HEADER ================= */}
      <header className="sf-panel-header">
        <div className="sf-panel-heading">
          <div className="sf-panel-eyebrow">
            {isSubjectNode ? "Subject Files" : "Folder Files"}
          </div>

          <h2 title={folderName}>{folderName}</h2>

          {folderPath.length > 1 && (
            <nav className="sf-path" aria-label="Folder path">
              {folderPath.map((segment, index) => (
                <React.Fragment key={`${segment}-${index}`}>
                  {index > 0 && <span className="sf-path-sep">/</span>}
                  <span className="sf-path-seg">{segment}</span>
                </React.Fragment>
              ))}
            </nav>
          )}

          <div className="sf-panel-meta">
            <span className="sf-meta-item">
              <MdInsertDriveFile size={13} aria-hidden="true" />
              {folderFiles.length} {folderFiles.length === 1 ? "file" : "files"}
            </span>
            <span className="sf-meta-item">
              <MdStorage size={13} aria-hidden="true" />
              {formatFileSize(folderSize)}
            </span>
          </div>
        </div>

        <div className="sf-panel-actions">
          {/* Requirement 4: filters live behind a toggle so the toolbar stays
              calm until the user needs them. */}
          <button
            type="button"
            className={`sf-btn sf-btn--ghost sf-filter-toggle${
              showFilters ? " is-open" : ""
            }${activeFilterCount > 0 ? " has-active" : ""}`}
            onClick={toggleFilters}
            aria-expanded={showFilters}
            aria-controls="sf-filterbar"
            title="Advanced filters"
          >
            <MdTune size={16} aria-hidden="true" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span
                className="sf-filter-badge"
                aria-label={`${activeFilterCount} active`}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          <FileUploadButton onFiles={handleUpload} busy={uploading} />
        </div>
      </header>

      {/* ================= FOLDER STATISTICS (requirement 2) ================= */}
      <FolderStatsBar stats={stats} scope="folder" label={folderName} />

      {/* ================= FEEDBACK / VALIDATION ================= */}
      {feedback && (
        <div
          className={`sf-alert sf-alert--${feedback.tone}`}
          role="status"
          aria-live="polite"
        >
          <FeedbackIcon size={16} className="sf-alert-icon" aria-hidden="true" />

          <div className="sf-alert-body">
            <span className="sf-alert-message">{feedback.message}</span>

            {/* The per-file list only adds information for a batch. With a
                single rejection the summary message already states that
                file's reason, so listing it again would repeat it. */}
            {feedback.details?.length > 1 && (
              <ul className="sf-alert-list">
                {feedback.details.map((item, index) => (
                  <li key={`${item.name}-${index}`}>
                    <strong>{item.name}</strong> — {item.error}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            className="sf-alert-close"
            aria-label="Dismiss message"
            onClick={dismissFeedback}
          >
            <MdClose size={15} />
          </button>
        </div>
      )}

      {/* ================= BODY: file table + right-side details panel =================
          Update 7: "View Details" no longer opens a popup. Selecting a file
          (row click or the "View Details" menu item, both still routed
          through `handleAction("view", file)` exactly as before) docks a
          details panel to the right instead, matching the eISF split-view
          interaction (`inline` mode of `pages/shared/EISF/components/
          DocumentViewer.js`) - width, spacing and open/close behaviour -
          without importing anything from eISF. The table stays mounted and
          visible in the left pane the entire time. */}
      <div
        className={`sf-body${dialog?.mode === "preview" ? " sf-body--split" : ""}`}
      >
        <div className="sf-body-list">
          {/* ================= TOOLBAR: SEARCH + SORT ================= */}
          {folderFiles.length > 0 && (
            <div className="sf-toolbar" role="search">
              <div className="sf-search">
                <MdSearch size={17} className="sf-search-icon" aria-hidden="true" />
                <input
                  type="text"
                  className="sf-search-input"
                  placeholder="Search files in this folder..."
                  value={search}
                  aria-label="Search files in this folder"
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    className="sf-search-clear"
                    aria-label="Clear file search"
                    onClick={clearSearch}
                  >
                    <MdClose size={14} />
                  </button>
                )}
              </div>

              <div className="sf-toolbar-right">
                <label className="sf-sort">
                  <span>Sort</span>
                  <select
                    aria-label="Sort files by"
                    value={sortKey}
                    onChange={(event) => {
                      const key = event.target.value;
                      setSortKey(key);
                      setSortDir(DEFAULT_DIRECTION[key] || "asc");
                    }}
                  >
                    {SORT_OPTIONS.map(({ key, label }) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  className="sf-dir-btn"
                  onClick={flipSortDir}
                  title={sortDir === "asc" ? "Ascending" : "Descending"}
                  aria-label={`Sort direction: ${
                    sortDir === "asc" ? "ascending" : "descending"
                  }`}
                >
                  <MdSwapVert size={16} aria-hidden="true" />
                  <span>{sortDir === "asc" ? "Asc" : "Desc"}</span>
                </button>

                <span className="sf-result-count" role="status" aria-live="polite">
                  {visibleFiles.length} of {folderFiles.length}
                </span>
              </div>
            </div>
          )}

          {/* ================= ADVANCED FILTERS (requirement 4) =================
              Also shown whenever a filter is active, even if the bar was toggled
              closed: collapsing it used to hide the only control that could undo
              the narrowing, leaving a short table with no visible cause. */}
          {folderFiles.length > 0 && (showFilters || activeFilterCount > 0) && (
            <FileFilterBar
              files={folderFiles}
              filters={filters}
              onChange={patchFilters}
              onReset={resetFilters}
              /* The counter reports the filtered set before the text search, so
                 "N of M" describes what the filters did rather than conflating
                 the two narrowings. */
              resultCount={filteredFiles.length}
              totalCount={folderFiles.length}
            />
          )}

          {/* ================= DROP ZONE (populated folders) ================= */}
          {folderFiles.length > 0 && (
            <DragDropUpload onFiles={handleUpload} busy={uploading} compact />
          )}

          {/* ================= FILE TABLE / EMPTY STATES ================= */}
          <SubjectFileTable
            files={visibleFiles}
            totalInFolder={folderFiles.length}
            folderName={folderName}
            sortKey={sortKey}
            sortDir={sortDir}
            activeFileId={dialog?.file?.id ?? null}
            loading={loadingFiles}
            onSort={handleSort}
            onAction={handleAction}
            onUpload={handleUpload}
            onCreateFolder={openCreateFolder}
            onClearSearch={clearSearch}
            onClearFilters={resetFilters}
            hasSearch={search.trim().length > 0}
            hasFilters={activeFilterCount > 0}
            uploading={uploading}
            canUpload={Boolean(folderId)}
          />
        </div>

        {/* ================= RIGHT-SIDE FILE DETAILS PANEL =================
            Replaces the old FilePreviewModal popup. Same component, same
            props - only its own markup/CSS changed from an overlay dialog
            to a docked panel (see FilePreviewModal.js). */}
        {dialog?.mode === "preview" && (
          <div className="sf-body-details">
            <FilePreviewModal
              file={dialog.file}
              folderName={folderPath.join(" / ")}
              onRename={() => setDialog({ mode: "rename", file: dialog.file })}
              onDownload={() => handleDownload(dialog.file)}
              onDelete={() => setDialog({ mode: "delete", file: dialog.file })}
              onClose={closeDialog}
            />
          </div>
        )}
      </div>

      {/* ================= FILE DIALOGS (rename / delete stay as modals) ================= */}
      {dialog?.mode === "rename" && (
        <RenameFileModal
          file={dialog.file}
          folderName={folderName}
          validate={validateRename}
          submitError={submitError}
          onSubmit={submitRename}
          onClose={closeDialog}
        />
      )}

      {dialog?.mode === "delete" && (
        <DeleteFileDialog
          file={dialog.file}
          folderName={folderName}
          submitError={submitError}
          onConfirm={submitDelete}
          onClose={closeDialog}
        />
      )}

      {/* Phase 6: create a subfolder without leaving the empty state. */}
      {creatingFolder && (
        <CreateFolderModal
          variant="subfolder"
          parentName={folderName}
          parentType={isSubjectNode ? "subject" : "folder"}
          validate={validateNewFolder}
          submitError={submitError}
          onSubmit={submitCreateFolder}
          onClose={() => {
            setCreatingFolder(false);
            setSubmitError("");
          }}
        />
      )}
    </section>
  );
}

export default SubjectFileManager;
