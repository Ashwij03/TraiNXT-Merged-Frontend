/**
 * Subject Explorer - FOLDER TREE SERVICE (mock / local state layer)
 * =================================================================
 *
 * Single source of truth for folder CRUD in the Subject Explorer.
 *
 * PHASE 3 SCOPE: no backend. The tree is kept in localStorage and seeded
 * from `subjectExplorerMockData.js` on first run.
 *
 * API MIGRATION NOTE
 * ------------------
 * The component layer never touches localStorage directly - it only calls
 * the functions below. To move to real APIs later, replace the bodies of
 * `loadFolderTree` / `createFolder` / `renameFolder` / `deleteFolder`
 * with HTTP calls (returning the same `{ ok, tree, node, error }` shape)
 * and nothing in the UI has to change.
 *
 * Phase 11 note: the eISF-style "+" quick-create action added to subject
 * rows (see FolderContextMenu.js) calls this same `createFolder` function
 * with no new parameters - it is a second UI entry point into the existing
 * create pipeline, not a new mutation. No changes were needed here.
 *
 * Update 6 - SUBJECT CRUD
 * -----------------------
 * Subjects were previously a fixed, seed-only concept: `createFolder` /
 * `renameFolder` / `deleteFolder` all explicitly refuse to touch a
 * `type: "subject"` node ("Subjects cannot be renamed/deleted here"), and
 * there was no way to add one at all. This adds a parallel, dedicated set
 * of mutations - `createSubject` / `renameSubject` / `deleteSubject` - that
 * operate ONLY on top-level subject nodes, so the existing folder
 * functions above are completely untouched and keep behaving exactly as
 * before (they still reject subjects). This is what fixes SUB-003 (and
 * every other subject): a subject is no longer a dead end that can only
 * ever hold folders - it can now be created, edited and deleted like any
 * other node, including the zero-folder case.
 *
 * Subject ids are generated (SUB-001, SUB-002, ...) from whatever subjects
 * already exist in the live tree, never from a hardcoded list - so the
 * subject roster is fully dynamic and grows/shrinks with user actions.
 *
 * Node contract (unchanged from Phase 2):
 *   { id: string, name: string, type: "subject" | "folder", children: node[] }
 */

import { SUBJECT_EXPLORER_TREE } from "./subjectExplorerMockData";

/* ==================================================================
   CONSTANTS
================================================================== */

/** localStorage key (follows the existing `trianxt*` naming convention). */
export const SUBJECT_FOLDER_TREE_KEY = "trianxtSubjectExplorerTree";

/** Fired after every successful write so open explorers can auto-refresh. */
export const SUBJECT_FOLDER_TREE_EVENT = "trianxt-subject-folder-tree-updated";

const STORAGE_VERSION = 1;

/** Characters that would break path-style ids / look wrong in a tree. */
// eslint-disable-next-line no-useless-escape
const INVALID_NAME_CHARS = /[\/\\:*?"<>|]/;

const MAX_NAME_LENGTH = 60;

export const FOLDER_NAME_RULES = {
  maxLength: MAX_NAME_LENGTH,
  invalidCharsLabel: '/ \\ : * ? " < > |',
};

/* ==================================================================
   INTERNAL HELPERS
================================================================== */

function createId(prefix = "fld") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Next sequential subject id (SUB-001, SUB-002, ...), derived from the
 * subjects that currently exist in the tree - never from a fixed list, so
 * newly-created and deleted subjects are always reflected.
 */
function nextSubjectId(nodes) {
  const used = new Set(
    (Array.isArray(nodes) ? nodes : [])
      .filter((node) => node.type === "subject")
      .map((node) => node.id)
  );

  let n = 1;
  let candidate = `SUB-${String(n).padStart(3, "0")}`;
  while (used.has(candidate)) {
    n += 1;
    candidate = `SUB-${String(n).padStart(3, "0")}`;
  }
  return candidate;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const hasStorage = () =>
  typeof window !== "undefined" && Boolean(window.localStorage);

/**
 * Guarantee every node has a `children` array and a `type`, so a folder
 * created inside a former leaf node works without special-casing.
 */
function normalizeNodes(nodes) {
  if (!Array.isArray(nodes)) return [];

  return nodes.map((node) => ({
    ...node,
    id: node.id || createId(),
    name: typeof node.name === "string" ? node.name : "Untitled",
    type: node.type === "subject" ? "subject" : "folder",
    children: normalizeNodes(node.children),
  }));
}

function emitTreeUpdate(source) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(SUBJECT_FOLDER_TREE_EVENT, { detail: { source } })
  );
}

/* ==================================================================
   PERSISTENCE
================================================================== */

/**
 * Read the tree from localStorage, seeding it from mock data on first run.
 * Accepts both the wrapped `{ version, tree }` payload and a bare array
 * so older/hand-edited data keeps working.
 */
export function loadFolderTree(seed = SUBJECT_EXPLORER_TREE) {
  const fallback = normalizeNodes(seed);

  if (!hasStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(SUBJECT_FOLDER_TREE_KEY);

    if (!raw) {
      persist(fallback);
      return fallback;
    }

    const parsed = JSON.parse(raw);
    const stored = Array.isArray(parsed) ? parsed : parsed?.tree;

    if (!Array.isArray(stored)) {
      persist(fallback);
      return fallback;
    }

    return normalizeNodes(stored);
  } catch {
    // Corrupt payload - fall back to the seed rather than breaking the page.
    return fallback;
  }
}

function persist(tree) {
  if (!hasStorage()) return true;

  try {
    window.localStorage.setItem(
      SUBJECT_FOLDER_TREE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        updatedAt: new Date().toISOString(),
        tree,
      })
    );
    return true;
  } catch (error) {
    if (error?.name === "QuotaExceededError") return false;
    return false;
  }
}

/** Persist an already-built tree and notify listeners. */
export function saveFolderTree(tree, source = "save") {
  const normalized = normalizeNodes(tree);
  const saved = persist(normalized);

  if (saved) emitTreeUpdate(source);

  return saved
    ? { ok: true, tree: normalized }
    : {
        ok: false,
        tree: normalized,
        error: "Storage limit reached. Unable to save folder changes.",
      };
}

/** Clear persisted folders and go back to the seed tree. */
export function resetFolderTree(seed = SUBJECT_EXPLORER_TREE) {
  const fresh = normalizeNodes(seed);
  persist(fresh);
  emitTreeUpdate("reset");
  return fresh;
}

/**
 * Subscribe to folder-tree changes (same tab via CustomEvent, other tabs
 * via the native `storage` event). Returns an unsubscribe function.
 */
export function subscribeFolderTree(handler) {
  if (typeof window === "undefined" || typeof handler !== "function") {
    return () => {};
  }

  const onCustom = (event) => handler(event?.detail || {});
  const onStorage = (event) => {
    if (event.key === SUBJECT_FOLDER_TREE_KEY) handler({ source: "storage" });
  };

  window.addEventListener(SUBJECT_FOLDER_TREE_EVENT, onCustom);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(SUBJECT_FOLDER_TREE_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}

/* ==================================================================
   LOOKUPS (pure)
================================================================== */

/** Depth-first search by id. Returns the node or null. */
export function findNodeById(nodes, nodeId) {
  if (!nodeId || !Array.isArray(nodes)) return null;

  for (const node of nodes) {
    if (node.id === nodeId) return node;

    const found = findNodeById(node.children, nodeId);
    if (found) return found;
  }

  return null;
}

/** Parent of `nodeId`, or null when the node is at root level / missing. */
export function findParentOf(nodes, nodeId, parent = null) {
  if (!nodeId || !Array.isArray(nodes)) return null;

  for (const node of nodes) {
    if (node.id === nodeId) return parent;

    const found = findParentOf(node.children, nodeId, node);
    if (found) return found;
  }

  return null;
}

/** Children of `parentId`; the root list when `parentId` is null. */
export function getChildren(nodes, parentId) {
  if (!parentId) return Array.isArray(nodes) ? nodes : [];
  return findNodeById(nodes, parentId)?.children || [];
}

/** Ids from the node down to the root (used to reveal a node). */
export function getAncestorIds(nodes, nodeId) {
  const path = [];
  let current = findParentOf(nodes, nodeId);

  while (current) {
    path.push(current.id);
    current = findParentOf(nodes, current.id);
  }

  return path;
}

/** Folder count inside a subtree, excluding the node itself. */
export function countDescendantFolders(node) {
  if (!node?.children?.length) return 0;

  return node.children.reduce(
    (total, child) => total + 1 + countDescendantFolders(child),
    0
  );
}

/** Total folders (subjects excluded) anywhere in the tree. */
export function countFolders(nodes) {
  if (!Array.isArray(nodes)) return 0;

  return nodes.reduce(
    (total, node) =>
      total + (node.type === "folder" ? 1 : 0) + countFolders(node.children),
    0
  );
}

/* ==================================================================
   VALIDATION
================================================================== */

/**
 * Validate a folder name for a given parent.
 *
 * Rules (Phase 3 requirement 6):
 *   - name is required (no empty / whitespace-only names)
 *   - no duplicate name under the same parent (case-insensitive)
 *   - length + illegal characters guarded so the tree stays readable
 *
 * `excludeId` skips a node during the duplicate check (used by rename,
 * so a folder does not clash with itself).
 *
 * Returns { valid: boolean, error: string }.
 */
export function validateFolderName(nodes, parentId, name, options = {}) {
  const { excludeId = null } = options;
  const trimmed = String(name ?? "").trim();

  if (!trimmed) {
    return { valid: false, error: "Folder name is required." };
  }

  if (trimmed.length > MAX_NAME_LENGTH) {
    return {
      valid: false,
      error: `Folder name cannot exceed ${MAX_NAME_LENGTH} characters.`,
    };
  }

  if (INVALID_NAME_CHARS.test(trimmed)) {
    return {
      valid: false,
      error: `Folder name cannot contain ${FOLDER_NAME_RULES.invalidCharsLabel}`,
    };
  }

  const duplicate = getChildren(nodes, parentId).some(
    (child) =>
      child.id !== excludeId &&
      child.name.trim().toLowerCase() === trimmed.toLowerCase()
  );

  if (duplicate) {
    return {
      valid: false,
      error: `A folder named "${trimmed}" already exists here.`,
    };
  }

  return { valid: true, error: "" };
}

/* ==================================================================
   MUTATIONS
   Each returns { ok, tree, node?, error? } and persists on success,
   so the UI can update from one place after any CRUD operation.
================================================================== */

/**
 * Create a folder under `parentId`.
 * `parentId` may be a subject (requirement 1) or a folder (requirement 2 -
 * nesting is unlimited). Passing null creates at root level.
 */
export function createFolder(tree, parentId, name) {
  const working = clone(normalizeNodes(tree));

  if (parentId && !findNodeById(working, parentId)) {
    return { ok: false, tree, error: "Parent folder no longer exists." };
  }

  const check = validateFolderName(working, parentId, name);
  if (!check.valid) return { ok: false, tree, error: check.error };

  const folder = {
    id: createId(),
    name: String(name).trim(),
    type: "folder",
    children: [],
    createdAt: new Date().toISOString(),
  };

  if (parentId) {
    findNodeById(working, parentId).children.push(folder);
  } else {
    working.push(folder);
  }

  const saved = saveFolderTree(working, "create");
  if (!saved.ok) return { ok: false, tree, error: saved.error };

  return { ok: true, tree: saved.tree, node: folder };
}

/** Rename a folder. Subjects are not renameable in this phase. */
export function renameFolder(tree, nodeId, name) {
  const working = clone(normalizeNodes(tree));
  const node = findNodeById(working, nodeId);

  if (!node) return { ok: false, tree, error: "This folder no longer exists." };

  if (node.type === "subject") {
    return { ok: false, tree, error: "Subjects cannot be renamed here." };
  }

  const parent = findParentOf(working, nodeId);
  const check = validateFolderName(working, parent?.id ?? null, name, {
    excludeId: nodeId,
  });
  if (!check.valid) return { ok: false, tree, error: check.error };

  node.name = String(name).trim();
  node.updatedAt = new Date().toISOString();

  const saved = saveFolderTree(working, "rename");
  if (!saved.ok) return { ok: false, tree, error: saved.error };

  return { ok: true, tree: saved.tree, node: findNodeById(saved.tree, nodeId) };
}

/**
 * Delete a folder and everything nested inside it (requirement 4).
 * Subjects are never deleted by folder management.
 */
export function deleteFolder(tree, nodeId) {
  const working = clone(normalizeNodes(tree));
  const target = findNodeById(working, nodeId);

  if (!target) {
    return { ok: false, tree, error: "This folder no longer exists." };
  }

  if (target.type === "subject") {
    return { ok: false, tree, error: "Subjects cannot be deleted here." };
  }

  const removedIds = [target.id];
  const collect = (node) =>
    (node.children || []).forEach((child) => {
      removedIds.push(child.id);
      collect(child);
    });
  collect(target);

  const prune = (list) =>
    list
      .filter((node) => node.id !== nodeId)
      .map((node) => ({ ...node, children: prune(node.children || []) }));

  const saved = saveFolderTree(prune(working), "delete");
  if (!saved.ok) return { ok: false, tree, error: saved.error };

  return { ok: true, tree: saved.tree, removedIds };
}

/* ==================================================================
   SUBJECT CRUD (Update 6)
   Dedicated mutations for top-level subject nodes. Kept separate from
   createFolder/renameFolder/deleteFolder above (which continue to refuse
   subjects) so existing folder CRUD behaviour is unchanged.
================================================================== */

/** Suggested next subject id (e.g. "SUB-007") - a default, not a lock-in;
 *  the create dialog lets the user override it before submitting. */
export function generateSubjectId(tree) {
  return nextSubjectId(Array.isArray(tree) ? tree : []);
}

/**
 * Validate a subject name.
 *
 * Subjects live at the tree root, so uniqueness is checked against other
 * top-level subjects only (mirrors validateFolderName's same-parent rule).
 * `excludeId` skips a subject during the duplicate check (used by edit).
 */
export function validateSubjectName(tree, name, options = {}) {
  const { excludeId = null } = options;
  const trimmed = String(name ?? "").trim();

  if (!trimmed) {
    return { valid: false, error: "Subject name is required." };
  }

  if (trimmed.length > MAX_NAME_LENGTH) {
    return {
      valid: false,
      error: `Subject name cannot exceed ${MAX_NAME_LENGTH} characters.`,
    };
  }

  if (INVALID_NAME_CHARS.test(trimmed)) {
    return {
      valid: false,
      error: `Subject name cannot contain ${FOLDER_NAME_RULES.invalidCharsLabel}`,
    };
  }

  const duplicate = (Array.isArray(tree) ? tree : [])
    .filter((node) => node.type === "subject")
    .some(
      (node) =>
        node.id !== excludeId &&
        node.name.trim().toLowerCase() === trimmed.toLowerCase()
    );

  if (duplicate) {
    return {
      valid: false,
      error: `A subject named "${trimmed}" already exists.`,
    };
  }

  return { valid: true, error: "" };
}

/** Create a new top-level subject (starts with zero folders, like SUB-003). */
export function createSubject(tree, name) {
  const working = clone(normalizeNodes(tree));

  const check = validateSubjectName(working, name);
  if (!check.valid) return { ok: false, tree, error: check.error };

  const subject = {
    id: nextSubjectId(working),
    name: String(name).trim(),
    type: "subject",
    children: [],
    createdAt: new Date().toISOString(),
  };

  working.push(subject);

  const saved = saveFolderTree(working, "create-subject");
  if (!saved.ok) return { ok: false, tree, error: saved.error };

  return { ok: true, tree: saved.tree, node: subject };
}

/** Edit (rename) a subject. Only ever targets a `type: "subject"` node. */
export function renameSubject(tree, subjectId, name) {
  const working = clone(normalizeNodes(tree));
  const node = findNodeById(working, subjectId);

  if (!node) return { ok: false, tree, error: "This subject no longer exists." };
  if (node.type !== "subject") {
    return { ok: false, tree, error: "Only subjects can be edited here." };
  }

  const check = validateSubjectName(working, name, { excludeId: subjectId });
  if (!check.valid) return { ok: false, tree, error: check.error };

  node.name = String(name).trim();
  node.updatedAt = new Date().toISOString();

  const saved = saveFolderTree(working, "edit-subject");
  if (!saved.ok) return { ok: false, tree, error: saved.error };

  return {
    ok: true,
    tree: saved.tree,
    node: findNodeById(saved.tree, subjectId),
  };
}

/**
 * Delete a subject and everything nested inside it (its whole folder tree),
 * same semantics as deleteFolder but for a top-level subject.
 */
export function deleteSubject(tree, subjectId) {
  const working = clone(normalizeNodes(tree));
  const target = findNodeById(working, subjectId);

  if (!target) {
    return { ok: false, tree, error: "This subject no longer exists." };
  }
  if (target.type !== "subject") {
    return { ok: false, tree, error: "Only subjects can be deleted here." };
  }

  const removedIds = [target.id];
  const collect = (node) =>
    (node.children || []).forEach((child) => {
      removedIds.push(child.id);
      collect(child);
    });
  collect(target);

  const remaining = working.filter((node) => node.id !== subjectId);

  const saved = saveFolderTree(remaining, "delete-subject");
  if (!saved.ok) return { ok: false, tree, error: saved.error };

  return { ok: true, tree: saved.tree, removedIds };
}

const FolderTreeService = {
  loadFolderTree,
  saveFolderTree,
  resetFolderTree,
  subscribeFolderTree,
  findNodeById,
  findParentOf,
  getChildren,
  getAncestorIds,
  countFolders,
  countDescendantFolders,
  validateFolderName,
  createFolder,
  renameFolder,
  deleteFolder,
  generateSubjectId,
  validateSubjectName,
  createSubject,
  renameSubject,
  deleteSubject,
};

export default FolderTreeService;
