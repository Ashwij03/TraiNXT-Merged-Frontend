export const FOLDER_TREE_EVENT = "trianxt-folder-tree-updated";
export const FOLDER_TEMPLATES_EVENT = "trianxt-folder-templates-updated";
const FOLDER_TREE_KEY = "trianxtFolderTrees";
const FOLDER_DOCS_KEY = "trianxtFolderDocuments";
const FOLDER_TEMPLATE_KEY = "trianxtFolderTemplates";
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

const folderTreesStore = {};
const folderDocsStore = {};
let folderTemplatesStore = [];

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
  console.log("WRITING LOCAL STORAGE");
  console.log("KEY =", key);
  console.log("VALUE =", value);

  localStorage.setItem(key, JSON.stringify(value));

  console.log("AFTER WRITE =", localStorage.getItem(key));
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

  // ICF already exists
  const icfFolder = root.children?.find(
    (child) => child.name === ICF_FOLDER_NAME
  );

  if (icfFolder) {
    return icfFolder;
  }

  const newICF = createICFFolder();

  root.children = [...(root.children || []), newICF];

  saveFolderTree(sectionId, contextKey, tree);

  return newICF;
}

function emitTreeUpdate(sectionId, contextKey) {
  window.dispatchEvent(
    new CustomEvent(FOLDER_TREE_EVENT, {
      detail: { sectionId, contextKey }
    })
  );
}

function emitTemplatesUpdate() {
  window.dispatchEvent(new CustomEvent(FOLDER_TEMPLATES_EVENT));
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

function cloneTree(tree) {
  return JSON.parse(JSON.stringify(tree));
}

export function getFirstLevelFolders(sectionId, contextKey = "default") {
  const tree = getFolderTree(sectionId, contextKey);
  const root = tree[0];
  return Array.isArray(root?.children) ? root.children : [];
}

export function getFolderTree(sectionId, contextKey = "default") {
  const trees = readJson(FOLDER_TREE_KEY, {});
  const key = getStorageKey(sectionId, contextKey);

  folderTreesStore[key] = trees[key] || folderTreesStore[key] || null;

  if (!trees[key]?.length) {
    const tree = defaultTree(sectionId);
    trees[key] = tree;
    folderTreesStore[key] = tree;
    writeJson(FOLDER_TREE_KEY, trees);
    return cloneTree(tree);
  }

  const cloned = cloneTree(trees[key]);
  folderTreesStore[key] = cloneTree(cloned);

  if (sectionId === "subjects") {
    const root = cloned[0];

    if (root?.children?.length) {
      root.children = root.children.filter(
        (child) => child.name !== contextKey
      );
    }
  }

  console.log("===== GET FOLDER TREE =====");
  console.log("Storage Key :", key);
  console.log("Trees From LocalStorage :", trees);
  console.log("Returned Tree :", cloned);

  return cloned;
}
export function saveFolderTree(sectionId, contextKey, tree) {
  console.log("SAVE FOLDER TREE CALLED");
  const trees = readJson(FOLDER_TREE_KEY, {});
  const key = getStorageKey(sectionId, contextKey);

  trees[key] = cloneTree(tree);

  writeJson(FOLDER_TREE_KEY, trees);

  emitTreeUpdate(sectionId, contextKey);
}

export function createFolder(sectionId, contextKey, parentId, name) {
  console.log("===== CREATE FOLDER =====");
  console.log("SECTION ID :", sectionId);
  console.log("CONTEXT KEY :", contextKey);
  console.log("PARENT ID :", parentId);
  console.log("FOLDER NAME :", name);

  const trimmed = String(name || "").trim();

  if (!trimmed) {
    return null;
  }

  const tree = getFolderTree(sectionId, contextKey);

  console.log("TREE STRING =", JSON.stringify(tree, null, 2));

  const parent = parentId ? findFolderNode(tree, parentId) : tree[0];

  console.log("FOUND PARENT =", parent);

  if (!parent) {
    return null;
  }

  const newFolder = {
    id: createId("folder"),
    name: trimmed,
    children: []
  };

  parent.children = [...(parent.children || []), newFolder];

  

  saveFolderTree(sectionId, contextKey, tree);

  return newFolder;
}

export function renameFolder(sectionId, contextKey, folderId, name) {
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
  const docs = readJson(FOLDER_DOCS_KEY, {});
  const key = docsKey(sectionId, contextKey);

  folderDocsStore[key] = docs[key] || folderDocsStore[key] || {};

  return folderDocsStore[key];
}

function saveFolderDocuments(sectionId, contextKey, docs) {
  const allDocs = readJson(FOLDER_DOCS_KEY, {});
  const key = docsKey(sectionId, contextKey);

  folderDocsStore[key] = docs;
  allDocs[key] = docs;

  writeJson(FOLDER_DOCS_KEY, allDocs);
}

export function getDocumentsForFolder(sectionId, contextKey, folderId) {
  const docs = getFolderDocuments(sectionId, contextKey);
  return Array.isArray(docs[folderId]) ? [...docs[folderId]] : [];
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

export function snapshotFolderNode(node) {
  if (!node || isProtectedFolder(node)) {
    return null;
  }

  return {
    name: node.name,
    children: (node.children || [])
      .map((child) => snapshotFolderNode(child))
      .filter(Boolean)
  };
}

export function getFolderTemplates() {
  return readJson(FOLDER_TEMPLATE_KEY, []);
}

export function saveFolderTemplate(name, structure) {
  const trimmed = String(name || "").trim();

  if (!trimmed || !structure) {
    return null;
  }

  const template = {
    id: createId("tmpl"),
    name: trimmed,
    structure: cloneTree([structure])[0] || structure,
    createdAt: new Date().toISOString()
  };

 const templates = readJson(FOLDER_TEMPLATE_KEY, []);

templates.push(template);

writeJson(FOLDER_TEMPLATE_KEY, templates);

emitTemplatesUpdate();

  return template;
}

export function deleteFolderTemplate(templateId) {
  let templates = readJson(FOLDER_TEMPLATE_KEY, []);

  const oldLength = templates.length;

  templates = templates.filter(
    (t) => t.id !== templateId
  );

  writeJson(FOLDER_TEMPLATE_KEY, templates);

  if (templates.length !== oldLength) {
    emitTemplatesUpdate();
    return true;
  }

  return false;
}

function applyStructureNodes(sectionId, contextKey, parentId, nodes) {
  if (!Array.isArray(nodes)) {
    return;
  }

  nodes.forEach((node) => {
    if (!node?.name) {
      return;
    }

    const created = createFolder(sectionId, contextKey, parentId, node.name);

    if (created && node.children?.length) {
      applyStructureNodes(sectionId, contextKey, created.id, node.children);
    }
  });
}

export function applyFolderTemplate(
  sectionId,
  contextKey,
  parentId,
  templateId
) {
  const template = folderTemplatesStore.find((item) => item.id === templateId);

  if (!template?.structure) {
    return false;
  }

  applyStructureNodes(
    sectionId,
    contextKey,
    parentId,
    [template.structure]
  );

  return true;
}

export function saveCurrentFolderAsTemplate(
  sectionId,
  contextKey,
  folderId,
  templateName
) {
  const tree = getFolderTree(sectionId, contextKey);
  const node = findFolderNode(tree, folderId);

  if (!node) {
    return null;
  }

  const structure = snapshotFolderNode(node);

  if (!structure) {
    return null;
  }

  return saveFolderTemplate(templateName, structure);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function importStructureNode(
  sectionId,
  contextKey,
  parentId,
  node
) {
  const created = createFolder(sectionId, contextKey, parentId, node.name);

  if (!created) {
    return;
  }

  const files = node.files || [];

  if (files.length) {
    const existingDocs = getDocumentsForFolder(
      sectionId,
      contextKey,
      created.id
    );
    const importedDocs = [];

    for (const file of files) {
      const isPdf =
        file.type === "application/pdf" ||
        String(file.name).toLowerCase().endsWith(".pdf");

      if (!isPdf) {
        continue;
      }

      const dataUrl = await readFileAsDataUrl(file);

      importedDocs.push({
        id: createId("doc"),
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        dataUrl
      });
    }

    if (importedDocs.length) {
      saveDocumentsForFolder(
        sectionId,
        contextKey,
        created.id,
        [...existingDocs, ...importedDocs]
      );
    }
  }

  if (node.children?.length) {
    for (const child of node.children) {
      await importStructureNode(sectionId, contextKey, created.id, child);
    }
  }
}

export async function importUploadedFolderStructure(
  sectionId,
  contextKey,
  parentId,
  structure
) {
  if (!structure?.children?.length && !structure?.files?.length) {
    return false;
  }

  if (structure.name && structure.children?.length) {
    for (const child of structure.children) {
      await importStructureNode(sectionId, contextKey, parentId, child);
    }
    return true;
  }

  await importStructureNode(sectionId, contextKey, parentId, structure);
  return true;
}

export function collectFolderSubtree(tree, folderId) {
  const node = findFolderNode(tree, folderId);

  if (!node) {
    return null;
  }

  return cloneTree([node])[0];
}

export function listFoldersInSubtree(node, list = []) {
  if (!node) {
    return list;
  }

  list.push(node);

  (node.children || []).forEach((child) => {
    listFoldersInSubtree(child, list);
  });

  return list;
}
