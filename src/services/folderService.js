const FOLDER_TREES_KEY = "trianxtFolderTrees";
const FOLDER_DOCS_KEY = "trianxtFolderDocuments";
export const FOLDER_TREE_EVENT = "trianxt-folder-tree-updated";

export const FOLDER_SECTIONS = {
  subjects: "Subjects",
  regulatory: "Regulatory",
  studyFolder: "Study Folder",
  reports: "Reports",
  logs: "Logs",
  eISF: "eISF",
  icf: "ICF",
  others: "Others"
};

function createId(prefix = "folder") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getStorageKey(sectionId, contextKey) {
  return `${sectionId}::${contextKey || "default"}`;
}

export const ICF_FOLDER_NAME = "ICF";

function defaultTree(sectionId) {
  const rootName =
    FOLDER_SECTIONS[sectionId] || sectionId || "Documents";

  return [
    {
      id: createId("root"),
      name: rootName,
      children: []
    }
  ];
}

export function isICFFolder(node) {
  return Boolean(node?.isICF || node?.name === ICF_FOLDER_NAME);
}

export function isProtectedFolder(node) {
  return Boolean(node?.isProtected || isICFFolder(node));
}

function createICFFolder() {
  return {
    id: createId("icf"),
    name: ICF_FOLDER_NAME,
    isICF: true,
    isProtected: true,
    children: []
  };
}

export function ensureSubjectFolderWithICF(sectionId, contextKey) {
  const tree = getFolderTree(sectionId, contextKey);
  const root = tree[0];

  if (!root) {
    return null;
  }

  const hasSubjectFolder = root.children?.length > 0;

  if (hasSubjectFolder) {
    return root.children[0];
  }

  const subjectFolder = {
    id: createId("folder"),
    name: contextKey,
    children: [createICFFolder()]
  };

  root.children = [subjectFolder];
  saveFolderTree(sectionId, contextKey, tree);

  return subjectFolder;
}

function emitTreeUpdate(sectionId, contextKey) {
  window.dispatchEvent(
    new CustomEvent(FOLDER_TREE_EVENT, {
      detail: { sectionId, contextKey }
    })
  );
}

function findFolderNode(nodes, folderId) {
  for (const node of nodes) {
    if (node.id === folderId) {
      return node;
    }

    if (node.children?.length) {
      const found = findFolderNode(node.children, folderId);

      if (found) {
        return found;
      }
    }
  }

  return null;
}

function removeFolderNode(nodes, folderId) {
  return nodes
    .filter((node) => node.id !== folderId)
    .map((node) => ({
      ...node,
      children: node.children ? removeFolderNode(node.children, folderId) : []
    }));
}

export function getFirstLevelFolders(sectionId, contextKey = "default") {
  const tree = getFolderTree(sectionId, contextKey);
  const root = tree[0];
  return Array.isArray(root?.children) ? root.children : [];
}

export function getFolderTree(sectionId, contextKey = "default") {
  const trees = readJson(FOLDER_TREES_KEY, {});
  const key = getStorageKey(sectionId, contextKey);

  if (!trees[key]?.length) {
    return defaultTree(sectionId);
  }

  return trees[key];
}

export function saveFolderTree(sectionId, contextKey, tree) {
  const trees = readJson(FOLDER_TREES_KEY, {});
  const key = getStorageKey(sectionId, contextKey);
  trees[key] = tree;
  writeJson(FOLDER_TREES_KEY, trees);
  emitTreeUpdate(sectionId, contextKey);
}

export function createFolder(
  sectionId,
  contextKey,
  parentId,
  name
) {
  const trimmed = String(name || "").trim();

  if (!trimmed) {
    return null;
  }

  const tree = getFolderTree(sectionId, contextKey);
  const parent = parentId
    ? findFolderNode(tree, parentId)
    : tree[0];

  if (!parent) {
    return null;
  }

  const newFolder = {
    id: createId("folder"),
    name: trimmed,
    children: []
  };

  parent.children = [...(parent.children || []), newFolder];

  if (
    sectionId === "subjects" &&
    parent.id === tree[0]?.id &&
    parent.children.length === 1
  ) {
    newFolder.children = [createICFFolder()];
  }

  saveFolderTree(sectionId, contextKey, tree);

  return newFolder;
}

export function renameFolder(
  sectionId,
  contextKey,
  folderId,
  name
) {
  const trimmed = String(name || "").trim();

  if (!trimmed) {
    return false;
  }

  const tree = getFolderTree(sectionId, contextKey);
  const node = findFolderNode(tree, folderId);

  if (!node || isProtectedFolder(node)) {
    return false;
  }

  node.name = trimmed;
  saveFolderTree(sectionId, contextKey, tree);

  return true;
}

export function deleteFolder(sectionId, contextKey, folderId) {
  const tree = getFolderTree(sectionId, contextKey);
  const rootId = tree[0]?.id;

  if (!folderId || folderId === rootId) {
    return false;
  }

  const node = findFolderNode(tree, folderId);

  if (isProtectedFolder(node)) {
    return false;
  }

  const docs = getFolderDocuments(sectionId, contextKey);
  delete docs[folderId];
  saveFolderDocuments(sectionId, contextKey, docs);

  saveFolderTree(
    sectionId,
    contextKey,
    removeFolderNode(tree, folderId)
  );

  return true;
}

function docsKey(sectionId, contextKey) {
  return getStorageKey(sectionId, contextKey);
}

export function getFolderDocuments(sectionId, contextKey = "default") {
  const allDocs = readJson(FOLDER_DOCS_KEY, {});
  return allDocs[docsKey(sectionId, contextKey)] || {};
}

function saveFolderDocuments(sectionId, contextKey, docs) {
  const allDocs = readJson(FOLDER_DOCS_KEY, {});
  allDocs[docsKey(sectionId, contextKey)] = docs;
  writeJson(FOLDER_DOCS_KEY, allDocs);
}

export function getDocumentsForFolder(
  sectionId,
  contextKey,
  folderId
) {
  const docs = getFolderDocuments(sectionId, contextKey);
  return Array.isArray(docs[folderId]) ? docs[folderId] : [];
}

export function saveDocumentsForFolder(
  sectionId,
  contextKey,
  folderId,
  documents
) {
  const docs = getFolderDocuments(sectionId, contextKey);
  docs[folderId] = documents;
  saveFolderDocuments(sectionId, contextKey, docs);
}

export function deleteDocumentsInFolderTree(
  sectionId,
  contextKey,
  folderId
) {
  const docs = getFolderDocuments(sectionId, contextKey);
  delete docs[folderId];

  const tree = getFolderTree(sectionId, contextKey);
  const node = findFolderNode(tree, folderId);

  if (node?.children?.length) {
    node.children.forEach((child) => {
      deleteDocumentsInFolderTree(sectionId, contextKey, child.id);
    });
  }

  saveFolderDocuments(sectionId, contextKey, docs);
}
