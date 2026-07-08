import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiDownload,
  FiEdit2,
  FiEye,
  FiFile,
  FiFolder,
  FiFolderPlus,
  FiMessageSquare,
  FiTrash2,
  FiUpload
} from "react-icons/fi";
import {
  FOLDER_TREE_EVENT,
  collectFolderSubtree,
  createFolder,
  deleteFolder,
  getDocumentsForFolder,
  getFolderTree,
  importUploadedFolderStructure,
  isICFFolder,
  isProtectedFolder,
  renameFolder,
  saveDocumentsForFolder
} from "../../services/folderService";
import {
  buildFolderZip,
  parseUploadedFolderFiles,
  triggerBlobDownload,
  uploadedTreeToStructure
} from "../../utils/folderZipUtils";
import FolderOptionsMenu from "./FolderOptionsMenu";
import FolderTemplateModal from "./FolderTemplateModal";
import {
  addCommentRecord,
  canResolveComments,
  canWriteComments,
  getVisibleComments,
  markCommentsDocumentDeleted,
  resolveCommentRecord
} from "../../services/commentService";
import { getStudyByCode } from "../../services/studyService";
import { VISIT_STAGES } from "../../services/visitScheduleService";
import "./DocumentFolderManager.css";
import FolderColumnView from "./FolderColumnView";
function findNodeById(nodes, nodeId) {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node;
    }

    if (node.children?.length) {
      const nested = findNodeById(node.children, nodeId);

      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

function buildBreadcrumb(tree, pathIds) {
  return pathIds
    .map((nodeId) => findNodeById(tree, nodeId))
    .filter(Boolean);
}

function FolderTreeNode({
  node,
  depth,
  selectedId,
  expandedIds,
  onSelect,
  onToggle,
  onAddFolder,
  onRenameFolder,
  onDeleteFolder,
  onUploadFolder,
  onDownloadFolder,
  canModify
}) {
  const hasChildren = node.children?.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  return (
    <div className="dfm-folder-node">
      <div
        className={`dfm-folder-row${isSelected ? " is-selected" : ""}${
          isICFFolder(node) ? " is-icf" : ""
        }`}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="dfm-folder-toggle"
            onClick={() => onToggle(node.id)}
            aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
          >
            {isExpanded ? "▾" : "▸"}
          </button>
        ) : (
          <span className="dfm-folder-spacer" />
        )}

        <div className="dfm-folder-content">
          <button
            type="button"
            className="dfm-folder-label"
            onClick={() => onSelect(node.id)}
          >
            <FiFolder />
            <span>{node.name}</span>
          </button>

          <FolderOptionsMenu
            folderId={node.id}
            folderName={node.name}
            disabled={!canModify}
            className="dfm-folder-options"
            onCreate={onAddFolder}
            onRename={onRenameFolder}
            onDelete={onDeleteFolder}
            onUpload={onUploadFolder}
            onDownload={onDownloadFolder}
          />
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="dfm-folder-children">
          {node.children.map((child) => (
            <FolderTreeNode
  key={child.id}
  node={child}
  depth={depth + 1}
  selectedId={selectedId}
  expandedIds={expandedIds}
  onSelect={onSelect}
  onToggle={onToggle}
  canModify={canModify}
  onAddFolder={onAddFolder}
  onRenameFolder={onRenameFolder}
  onDeleteFolder={onDeleteFolder}
  onUploadFolder={onUploadFolder}
  onDownloadFolder={onDownloadFolder}
/>
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentCommentsPanel({
  documentId,
  documentName,
  studyCode,
  subjectId
}) {
  const study = getStudyByCode(studyCode);
  const studyStage = study?.status || "Monitoring";
  const [commentText, setCommentText] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const comments = useMemo(() => {
    void refreshKey;
    return getVisibleComments(
      { studyCode, subjectId, documentId, studyStage },
      undefined
    ).filter(
      (item) =>
        String(item.documentId) === String(documentId) ||
        item.document === documentName
    );
  }, [studyCode, subjectId, documentId, documentName, studyStage, refreshKey]);

  const handleAdd = () => {
    if (!commentText.trim() || !canWriteComments()) {
      return;
    }

    addCommentRecord({
      study: studyCode,
      subjectId,
      documentId,
      documentName,
      description: commentText.trim(),
      stage: studyStage
    });

    setCommentText("");
    setRefreshKey((value) => value + 1);
  };

  const handleResolve = (commentId) => {
    if (resolveCommentRecord(commentId)) {
      setRefreshKey((value) => value + 1);
    }
  };

  return (
    <div className="dfm-doc-comments">
      <h5>
        <FiMessageSquare /> Document Comments
      </h5>

      {canWriteComments() && (
        <div className="dfm-comment-compose">
          <textarea
            placeholder="Add a comment about this document..."
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            rows={2}
          />
          <button type="button" onClick={handleAdd}>
            Add Comment
          </button>
        </div>
      )}

      <ul className="dfm-comment-list">
        {comments.length === 0 && (
          <li className="dfm-comment-empty">No comments for this document.</li>
        )}
        {comments.map((comment) => (
          <li key={comment.id} className="dfm-comment-item">
            <div>
              <strong>{comment.createdBy}</strong>
              <span>{comment.createdAt}</span>
              {comment.documentDeleted && (
                <em className="dfm-doc-deleted-tag">Document deleted</em>
              )}
            </div>
            <p>{comment.description}</p>
            <div className="dfm-comment-meta">
              <span className={`dfm-status dfm-status--${comment.status?.toLowerCase()}`}>
                {comment.status}
              </span>
              {comment.status === "Open" && canResolveComments() && (
                <button type="button" onClick={() => handleResolve(comment.id)}>
                  Resolve
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DocumentFolderManager({
  sectionId,
  contextKey = "default",
  title = "Documents",
  readOnly = false,
  studyCode = "",
  subjectId = "",
  layout = "vertical",
  onVisitStageComplete
}) {
  const [viewLayout, setViewLayout] = useState(layout);
  const isExplorerLayout = viewLayout === "explorer";
  const isColumnLayout = viewLayout === "column";
  const fileInputRef = useRef(null);
  const folderUploadInputRef = useRef(null);
  const uploadTargetFolderIdRef = useRef("");
  const selectedFolderIdRef = useRef("");
  const initialTree = getFolderTree(sectionId, contextKey);
  const initialRootId = initialTree[0]?.id || "";
  const [tree, setTree] = useState(() => initialTree);
  const [selectedFolderId, setSelectedFolderId] = useState(
    () => initialRootId
  );
  const [navigationPath, setNavigationPath] = useState(() =>
    initialRootId ? [initialRootId] : []
  );
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [documents, setDocuments] = useState([]);
  const [pendingUpload, setPendingUpload] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragDocIndex, setDragDocIndex] = useState(null);
  const [dragOverEmpty, setDragOverEmpty] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  selectedFolderIdRef.current = selectedFolderId;

  const navigationTailId =
    navigationPath.length > 0
      ? navigationPath[navigationPath.length - 1]
      : "";

  const refreshTree = useCallback(() => {
    const nextTree = getFolderTree(sectionId, contextKey);
    setTree(nextTree);
    selectedFolderIdRef.current = nextTree[0]?.id || "";
    const nextRootId = nextTree[0]?.id || "";
    const latestSelected = selectedFolderIdRef.current;

console.log("Old Selected =", latestSelected);
console.log("New Root =", nextRootId);
    const currentSelectedId = selectedFolderIdRef.current;
    const selectedStillExists = Boolean(
      currentSelectedId && findNodeById(nextTree, currentSelectedId)
    );

   if (!selectedStillExists) {
  console.log("Resetting selected folder to root");

  selectedFolderIdRef.current = nextRootId;
  setSelectedFolderId(nextRootId);

  if (isExplorerLayout) {
    setNavigationPath(nextRootId ? [nextRootId] : []);
  }
}
  }, [sectionId, contextKey, isExplorerLayout]);

  const refreshDocuments = useCallback(() => {
    const folderId = selectedFolderIdRef.current;

    if (!folderId) {
      setDocuments([]);
      return;
    }

    setDocuments(getDocumentsForFolder(sectionId, contextKey, folderId));
  }, [sectionId, contextKey]);

  useEffect(() => {
    refreshTree();
  }, [refreshTree]);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments, selectedFolderId]);

  useEffect(() => {
    const handleTreeUpdate = (event) => {
      if (
        event.detail?.sectionId === sectionId &&
        event.detail?.contextKey === contextKey
      ) {
        refreshTree();
      }
    };

    window.addEventListener(FOLDER_TREE_EVENT, handleTreeUpdate);

    return () => {
      window.removeEventListener(FOLDER_TREE_EVENT, handleTreeUpdate);
    };
  }, [sectionId, contextKey, refreshTree]);

  useEffect(() => {
    if (!isExplorerLayout || !navigationTailId) {
      return;
    }

    setSelectedFolderId((currentId) =>
      currentId === navigationTailId ? currentId : navigationTailId
    );
  }, [isExplorerLayout, navigationTailId]);

  useEffect(() => {
    if (!isExplorerLayout && !isColumnLayout) {
      return;
    }

    if (!selectedFolderId || navigationPath.includes(selectedFolderId)) {
      return;
    }

    const latestTree = getFolderTree(sectionId, contextKey);
    const buildPath = (nodes, targetId, path = []) => {
      for (const item of nodes) {
        const next = [...path, item.id];

        if (item.id === targetId) {
          return next;
        }

        if (item.children?.length) {
          const result = buildPath(item.children, targetId, next);
          if (result) {
            return result;
          }
        }
      }

      return null;
    };

    const path = buildPath(latestTree, selectedFolderId);

    if (path) {
      setNavigationPath(path);
    }
  }, [
    isExplorerLayout,
    isColumnLayout,
    selectedFolderId,
    navigationPath,
    sectionId,
    contextKey
  ]);

  const selectedFolderNode = useMemo(() => {
    const findNode = (nodes) => {
      for (const node of nodes) {
        if (node.id === selectedFolderId) {
          return node;
        }

        if (node.children?.length) {
          const nested = findNode(node.children);

          if (nested) {
            return nested;
          }
        }
      }

      return null;
    };

    return findNode(tree);
  }, [tree, selectedFolderId]);

  const selectedFolderName = selectedFolderNode?.name || title;
  const isSelectedProtected = isProtectedFolder(selectedFolderNode);
  const canModify = !readOnly;
  const matchedVisitStage = VISIT_STAGES.find(
    (stage) => stage.toLowerCase() === String(selectedFolderName).toLowerCase()
  );
  const canCompleteVisitStage =
    Boolean(matchedVisitStage) &&
    sectionId === "subjects" &&
    documents.length > 0 &&
    typeof onVisitStageComplete === "function";
  const breadcrumb = useMemo(
    () => buildBreadcrumb(tree, navigationPath),
    [tree, navigationPath]
  );
  const currentFolderChildren = selectedFolderNode?.children || [];

 const enterFolder = (folderId) => {
  const latestTree = getFolderTree(sectionId, contextKey);

  const buildPath = (nodes, targetId, path = []) => {
    for (const item of nodes) {
      const next = [...path, item.id];

      if (item.id === targetId) {
        return next;
      }

      if (item.children?.length) {
        const result = buildPath(item.children, targetId, next);

        if (result) return result;
      }
    }

    return null;
  };

  const path = buildPath(latestTree, folderId);

  setTree(latestTree);
  setSelectedFolderId(folderId);

  if (path) {
    setNavigationPath(path);
  }
};

  const goUpOneLevel = () => {
    setNavigationPath((prev) =>
      prev.length > 1 ? prev.slice(0, -1) : prev
    );
  };

  const goToBreadcrumbIndex = (index) => {
    setNavigationPath((prev) => prev.slice(0, index + 1));
  };

  const persistDocuments = (nextDocuments) => {
    saveDocumentsForFolder(
      sectionId,
      contextKey,
      selectedFolderId,
      nextDocuments
    );
    setDocuments(nextDocuments);
  };
//console.log("Selected Folder =", folderId);

  const handleAddFolder = (folderId = selectedFolderId) => {
      console.log("Selected Folder Before Create =", folderId);
  console.log("Current State Selected =", selectedFolderId);

    if (!canModify) {
      return;
    }

    const name = window.prompt("New folder name:");

    if (!name?.trim()) {
      return;
    }

   const latestTree = getFolderTree(sectionId, contextKey);
const latestRootId = latestTree[0]?.id || "";

const created = createFolder(
  sectionId,
  contextKey,
  folderId || latestRootId,
  name.trim()
);

    if (created) {
      setExpandedIds((prev) => new Set([...prev, folderId]));
      refreshTree();
      setSelectedFolderId(created.id);

      if (isExplorerLayout || isColumnLayout) {
        enterFolder(created.id);
      }
    }
  };

  const handleRenameFolder = (folderId = selectedFolderId) => {
    if (!canModify) {
      return;
    }

    const node = findNodeById(tree, folderId);

    if (!node || isProtectedFolder(node)) {
      return;
    }

    const name = window.prompt("Rename folder:", node?.name || "");

    if (!name?.trim()) {
      return;
    }

    const renamed = renameFolder(
      sectionId,
      contextKey,
      folderId,
      name.trim()
    );

    if (renamed) {
      refreshTree();
    }
  };

  const handleDeleteFolder = (folderId = selectedFolderId) => {
    if (!canModify) {
      return;
    }

    const rootId = tree[0]?.id;

    if (!folderId || folderId === rootId) {
      window.alert("Cannot delete the root folder.");
      return;
    }

    const node = findNodeById(tree, folderId);

    if (!node || isProtectedFolder(node)) {
      return;
    }

    if (
      window.confirm(
        `Delete folder "${node?.name}" and its documents?`
      )
    ) {
      const deleted = deleteFolder(
        sectionId,
        contextKey,
        folderId
      );

      if (deleted) {
        setSelectedFolderId(rootId);
        refreshTree();
        refreshDocuments();
      }
    }
  };

  const handleUploadFolder = (folderId = selectedFolderId) => {
    if (!canModify || !folderId) {
      return;
    }

    uploadTargetFolderIdRef.current = folderId;
    folderUploadInputRef.current?.click();
  };

  const handleFolderUploadSelect = async (fileList) => {
    const targetFolderId = uploadTargetFolderIdRef.current || selectedFolderId;

    if (!targetFolderId || !fileList?.length) {
      return;
    }

    const parsedTree = parseUploadedFolderFiles(fileList);
    const structure = uploadedTreeToStructure(parsedTree);

    await importUploadedFolderStructure(
      sectionId,
      contextKey,
      targetFolderId,
      structure
    );

    refreshTree();
    enterFolder(targetFolderId);
  };

  const handleDownloadFolder = async (folderId = selectedFolderId) => {
    const latestTree = getFolderTree(sectionId, contextKey);
    const subtree = collectFolderSubtree(latestTree, folderId);

    if (!subtree) {
      window.alert("Unable to download folder.");
      return;
    }

    try {
      const blob = await buildFolderZip({
        rootName: subtree.name,
        rootNode: subtree,
        getDocumentsForFolder: (targetFolderId) =>
          getDocumentsForFolder(sectionId, contextKey, targetFolderId)
      });

      triggerBlobDownload(blob, `${subtree.name || "folder"}.zip`);
    } catch (error) {
      window.alert("Folder download failed.");
    }
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileSelect = async (fileList) => {
    const file = Array.from(fileList || [])[0];

    if (!file) {
      return;
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      window.alert("Only PDF files are allowed.");
      return;
    }

    setUploadProgress(0);
    setPendingUpload({ file, name: file.name, size: file.size });

    const steps = [20, 45, 70, 90, 100];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 120));
      setUploadProgress(step);
    }
  };

  const handleSaveUpload = async () => {
    if (!pendingUpload || !selectedFolderId) {
      return;
    }

    const dataUrl = await readFileAsDataUrl(pendingUpload.file);
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: pendingUpload.name,
      size: pendingUpload.size,
      uploadedAt: new Date().toISOString(),
      dataUrl
    };

    persistDocuments([...documents, newDoc]);
    setPendingUpload(null);
    setUploadProgress(0);
  };

  const handleRenameDoc = (docId) => {
    if (!canModify) {
      return;
    }

    const doc = documents.find((item) => item.id === docId);

    if (!doc) {
      return;
    }

    const name = window.prompt("Rename document:", doc.name);

    if (!name?.trim()) {
      return;
    }

    persistDocuments(
      documents.map((item) =>
        item.id === docId ? { ...item, name: name.trim() } : item
      )
    );
  };

  const handleReplaceDoc = (docId) => {
    if (!canModify) {
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf,.pdf";

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) {
        return;
      }

      if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        window.alert("Only PDF files are allowed.");
        return;
      }

      const dataUrl = await readFileAsDataUrl(file);

      persistDocuments(
        documents.map((item) =>
          item.id === docId
            ? {
                ...item,
                name: file.name,
                size: file.size,
                uploadedAt: new Date().toISOString(),
                dataUrl
              }
            : item
        )
      );
    };

    input.click();
  };

  const handleDeleteDoc = (docId) => {
    if (!canModify) {
      return;
    }

    const doc = documents.find((item) => item.id === docId);

    if (window.confirm("Delete this document?")) {
      markCommentsDocumentDeleted(docId, doc?.name);
      persistDocuments(documents.filter((item) => item.id !== docId));
    }
  };

  const handleDownloadDoc = (doc) => {
    if (!doc.dataUrl) {
      return;
    }

    const link = document.createElement("a");
    link.href = doc.dataUrl;
    link.download = doc.name;
    link.click();
  };

  const handleDragStart = (index) => {
    setDragDocIndex(index);
  };

  const handleDrop = (index) => {
    if (dragDocIndex === null || dragDocIndex === index) {
      setDragDocIndex(null);
      return;
    }

    const reordered = [...documents];
    const [moved] = reordered.splice(dragDocIndex, 1);
    reordered.splice(index, 0, moved);
    persistDocuments(reordered);
    setDragDocIndex(null);
  };

  const formatSize = (bytes) => {
    if (!bytes) {
      return "—";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };


  return (
    <div className={`dfm-container dfm-layout-${viewLayout}`}>
      {!isExplorerLayout && !isColumnLayout && (
              <aside className="dfm-sidebar">
        <div className="dfm-sidebar-header">
          <h3>Folders</h3>
          </div>

        <div className="dfm-folder-tree">
          {tree.map((node) => (
            <FolderTreeNode
    key={node.id}
    node={node}
    depth={0}
    selectedId={selectedFolderId}
    expandedIds={expandedIds}
    onSelect={setSelectedFolderId}
    onToggle={(folderId) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);

            if (next.has(folderId)) {
                next.delete(folderId);
            } else {
                next.add(folderId);
            }

            return next;
        });
    }}
    canModify={canModify}
    onAddFolder={handleAddFolder}
    onRenameFolder={handleRenameFolder}
    onDeleteFolder={handleDeleteFolder}
    onUploadFolder={handleUploadFolder}
    onDownloadFolder={handleDownloadFolder}
/>
          ))}
        </div>
      </aside>
      )}

      <section className="dfm-main">
        <div className="dfm-view-toolbar">
          <div className="dfm-view-switcher" role="tablist" aria-label="Folder view">
            <button
              type="button"
              className={viewLayout === "vertical" ? "active" : ""}
              onClick={() => setViewLayout("vertical")}
            >
              Tree View
            </button>
            <button
              type="button"
              className={viewLayout === "explorer" ? "active" : ""}
              onClick={() => setViewLayout("explorer")}
            >
              Explorer View
            </button>
            <button
              type="button"
              className={viewLayout === "column" ? "active" : ""}
              onClick={() => setViewLayout("column")}
            >
              Column View
            </button>
          </div>

          {canModify && (
            <button
              type="button"
              className="dfm-template-btn"
              onClick={() => setShowTemplateModal(true)}
            >
              Folder Templates
            </button>
          )}
        </div>
   
        {isExplorerLayout && (
          <div className="dfm-explorer-nav">
            <div className="dfm-explorer-nav-row">
              {navigationPath.length > 1 && (
                <button
                  type="button"
                  className="dfm-back-btn"
                  onClick={goUpOneLevel}
                >
                  ← Back
                </button>
              )}

              <nav className="dfm-breadcrumb" aria-label="Folder path">
                {breadcrumb.map((node, index) => (
                  <span key={node.id} className="dfm-breadcrumb-item">
                    {index > 0 && (
                      <span className="dfm-breadcrumb-sep">›</span>
                    )}
                    <button
                      type="button"
                      className={
                        index === breadcrumb.length - 1
                          ? "dfm-breadcrumb-current"
                          : "dfm-breadcrumb-link"
                      }
                      onClick={() => goToBreadcrumbIndex(index)}
                    >
                      {node.name}
                    </button>
                  </span>
                ))}
              </nav>
            </div>
          </div>
        )}

        <div className="dfm-main-header">
          <h3>{selectedFolderName}</h3>
          <span>
            {currentFolderChildren.length} folder(s) • {documents.length}{" "}
            file(s)
          </span>
        </div>

        <div className="dfm-action-bar">
          {canModify && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="dfm-file-input"
                onChange={(event) => {
                  handleFileSelect(event.target.files);
                  event.target.value = "";
                }}
              />
              <input
                ref={folderUploadInputRef}
                type="file"
                className="dfm-file-input"
                webkitdirectory=""
                directory=""
                multiple
                onChange={(event) => {
                  handleFolderUploadSelect(event.target.files);
                  event.target.value = "";
                }}
              />

              <button
                type="button"
                className="dfm-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <FiUpload />
                Upload Files
              </button>

              {!isSelectedProtected && (
                <button
  className="dfm-add-folder-btn"
  onClick={() => handleAddFolder()}
>
                  <FiFolderPlus />
                  Add Folder
                </button>
              )}

              {canCompleteVisitStage && (
                <button
                  type="button"
                  className="dfm-complete-visit-btn"
                  onClick={() => onVisitStageComplete(matchedVisitStage)}
                >
                  Complete {matchedVisitStage}
                </button>
              )}
            </>
          )}
        </div>

        {pendingUpload && (
          <div className="dfm-upload-progress">
            <div className="dfm-progress-bar">
              <div
                className="dfm-progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span>
              {pendingUpload.name} — {uploadProgress}%
            </span>
            {uploadProgress >= 100 && (
              <button
                type="button"
                className="dfm-save-btn"
                onClick={handleSaveUpload}
              >
                Save
              </button>
            )}
          </div>
        )}

        {isExplorerLayout && currentFolderChildren.length > 0 && (
          <div className="dfm-explorer-folder-grid">
            {currentFolderChildren.map((folder) => (
              <div
                key={folder.id}
                className={`dfm-explorer-folder-wrap${
                  isICFFolder(folder) ? " is-icf" : ""
                }`}
              >
                <button
                  type="button"
                  className="dfm-explorer-folder"
                  onClick={() => enterFolder(folder.id)}
                >
                  <FiFolder className="dfm-explorer-folder-icon" />
                  <span>{folder.name}</span>
                </button>
                <FolderOptionsMenu
                  folderId={folder.id}
                  folderName={folder.name}
                  disabled={!canModify}
                  onCreate={handleAddFolder}
                  onRename={handleRenameFolder}
                  onDelete={handleDeleteFolder}
                  onUpload={handleUploadFolder}
                  onDownload={handleDownloadFolder}
                />
              </div>
            ))}
          </div>
        )}
        {isColumnLayout && (
  <FolderColumnView
    tree={tree}
    navigationPath={navigationPath}
    enterFolder={enterFolder}
    goToBreadcrumbIndex={goToBreadcrumbIndex}
    selectedFolderId={selectedFolderId}
    canModify={canModify}
    onAddFolder={handleAddFolder}
    onRenameFolder={handleRenameFolder}
    onDeleteFolder={handleDeleteFolder}
    onUploadFolder={handleUploadFolder}
    onDownloadFolder={handleDownloadFolder}
  />
)}

        <ul className="dfm-doc-list">
          {documents.map((doc, index) => (
            <li
              key={doc.id}
              className="dfm-doc-item"
              draggable={canModify}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(index)}
            >
              <FiFile className="dfm-doc-icon" />
              <div className="dfm-doc-info">
                <strong>{doc.name}</strong>
                <small>
                  PDF • {formatSize(doc.size)} •{" "}
                  {new Date(doc.uploadedAt).toLocaleString()}
                </small>
              </div>
              <div className="dfm-doc-actions">
                <button
                  type="button"
                  title="View"
                  onClick={() => setViewDoc(doc)}
                >
                  <FiEye />
                </button>
                <button
                  type="button"
                  title="Download"
                  onClick={() => handleDownloadDoc(doc)}
                >
                  <FiDownload />
                </button>
                {canModify && (
                  <>
                    <button
                      type="button"
                      title="Rename"
                      onClick={() => handleRenameDoc(doc.id)}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      type="button"
                      title="Replace"
                      onClick={() => handleReplaceDoc(doc.id)}
                    >
                      <FiUpload />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => handleDeleteDoc(doc.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>

        {documents.length === 0 && !pendingUpload && (
          canModify ? (
            <div
              className={`dfm-drop-zone${dragOverEmpty ? " is-drag-over" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOverEmpty(true);
              }}
              onDragLeave={() => setDragOverEmpty(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragOverEmpty(false);
                handleFileSelect(event.dataTransfer.files);
              }}
            >
              <FiUpload className="dfm-drop-zone-icon" />
              <p className="dfm-drop-zone-title">Drag and drop PDF files here</p>
              <p className="dfm-drop-zone-hint">or click to browse</p>
            </div>
          ) : (
            <p className="dfm-empty">No documents in this folder.</p>
          )
        )}
      </section>

      {viewDoc && (
        <div className="dfm-viewer-overlay" onClick={() => setViewDoc(null)}>
          <div
            className="dfm-viewer-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dfm-viewer-header">
              <h4>{viewDoc.name}</h4>
              <button type="button" onClick={() => setViewDoc(null)}>
                Close
              </button>
            </div>
            {viewDoc.dataUrl ? (
              <iframe
                title={viewDoc.name}
                src={viewDoc.dataUrl}
                className="dfm-viewer-frame"
              />
            ) : (
              <p>Preview unavailable.</p>
            )}
            <DocumentCommentsPanel
              documentId={viewDoc.id}
              documentName={viewDoc.name}
              studyCode={studyCode || contextKey.split("::")[0]}
              subjectId={subjectId || contextKey.split("::")[1]}
            />
          </div>
        </div>
      )}

      {showTemplateModal && (
        <FolderTemplateModal
          sectionId={sectionId}
          contextKey={contextKey}
          selectedFolderId={selectedFolderId}
          onClose={() => setShowTemplateModal(false)}
          onApplied={() => {
            refreshTree();
            enterFolder(selectedFolderId);
          }}
        />
      )}
    </div>
  );
}

export default DocumentFolderManager;
