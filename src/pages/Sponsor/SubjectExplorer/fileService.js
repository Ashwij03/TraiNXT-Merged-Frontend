/**
 * Subject Explorer - FILE SERVICE (mock / localStorage layer, Phase 4)
 * ====================================================================
 *
 * Single source of truth for subject file management. Mirrors the structure
 * of `folderTreeService.js` so both layers behave the same way.
 *
 * PHASE 4 SCOPE: no backend. Files live in localStorage under one key,
 * bucketed by folder id, seeded from `subjectFileMockData.js` on first run.
 *
 * API MIGRATION NOTE
 * ------------------
 * The component layer never touches localStorage directly - it only calls
 * the functions below, and every mutation returns the same
 * `{ ok, files, file?, error?, ... }` shape. To move to real APIs later,
 * replace the bodies of `uploadFiles` / `renameFile` / `deleteFile` with HTTP
 * calls and the UI does not change.
 *
 * For reads, use `fetchFolderFiles` (async) as the network seam - NOT
 * `listFiles`. `listFiles` is a synchronous pure selector used inside
 * `useMemo` hooks, `reduce` callbacks in `folderStatsService`, and four
 * mutations in this file; giving it a promise return type would break all of
 * them. See the note on `fetchFolderFiles` for the full reasoning.
 *
 * NOT in this phase (by design): version history, sharing, permissions,
 * approval workflow.
 */

import {
  SUBJECT_FILE_SEED,
  CURRENT_MOCK_USER,
  FILE_STATUSES,
} from "./subjectFileMockData";
import {
  getExtension,
  isSupportedExtension,
  SUPPORTED_EXTENSIONS_LABEL,
} from "./fileTypes";

/* ==================================================================
   CONSTANTS
================================================================== */

/** localStorage key (follows the existing `trianxt*` naming convention). */
export const SUBJECT_FILES_KEY = "trianxtSubjectFiles";

/** Fired after every successful write so open views can auto-refresh. */
export const SUBJECT_FILES_EVENT = "trianxt-subject-files-updated";

const STORAGE_VERSION = 1;

/**
 * Per-file cap for keeping the actual bytes in localStorage.
 *
 * localStorage is a ~5 MB string store, so persisting real payloads is only
 * viable for small files. Larger uploads are still recorded (name, size,
 * type, dates) but without content - `hasContent: false` - and the UI
 * degrades gracefully: preview shows a placeholder and download emits a
 * metadata stub. A real backend removes this limit entirely.
 */
export const MAX_INLINE_CONTENT_BYTES = 384 * 1024;

/** Hard cap per upload, so a huge file cannot stall the page. */
export const MAX_FILE_BYTES = 25 * 1024 * 1024;

/** Characters that would break a filename. */
// eslint-disable-next-line no-useless-escape
const INVALID_NAME_CHARS = /[\/\\:*?"<>|]/;

const MAX_NAME_LENGTH = 120;

export const FILE_NAME_RULES = {
  maxLength: MAX_NAME_LENGTH,
  invalidCharsLabel: '/ \\ : * ? " < > |',
};

/** Sort keys exposed to the table header (requirement 6). */
export const FILE_SORT_KEYS = ["name", "date", "size", "type"];

/* ==================================================================
   INTERNAL HELPERS
================================================================== */

function createId(prefix = "file") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const hasStorage = () =>
  typeof window !== "undefined" && Boolean(window.localStorage);

/** Guarantee every stored record has the fields the UI reads. */
function normalizeFile(file, folderId) {
  const now = new Date().toISOString();

  return {
    id: file.id || createId(),
    folderId: file.folderId || folderId,
    name: typeof file.name === "string" && file.name ? file.name : "Untitled",
    size: Number.isFinite(file.size) ? file.size : 0,
    uploadedAt: file.uploadedAt || now,
    modifiedAt: file.modifiedAt || file.uploadedAt || now,
    uploadedBy: file.uploadedBy || CURRENT_MOCK_USER,
    status: file.status || "Final",
    hasContent: Boolean(file.hasContent && file.dataUrl),
    ...(file.dataUrl ? { dataUrl: file.dataUrl } : {}),
  };
}

/** Normalize the whole `{ folderId: File[] }` map. */
function normalizeStore(store) {
  if (!store || typeof store !== "object") return {};

  return Object.entries(store).reduce((acc, [folderId, files]) => {
    if (!Array.isArray(files)) return acc;
    acc[folderId] = files
      .filter((file) => file && typeof file === "object")
      .map((file) => normalizeFile(file, folderId));
    return acc;
  }, {});
}

function emitFilesUpdate(source, folderId) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(SUBJECT_FILES_EVENT, { detail: { source, folderId } })
  );
}

/* ==================================================================
   PERSISTENCE
================================================================== */

/**
 * Read the whole file store, seeding it from mock data on first run.
 * Accepts both the wrapped `{ version, files }` payload and a bare map so
 * older/hand-edited data keeps working.
 */
export function loadFileStore(seed = SUBJECT_FILE_SEED) {
  const fallback = normalizeStore(seed);

  if (!hasStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(SUBJECT_FILES_KEY);

    if (!raw) {
      persist(fallback);
      return fallback;
    }

    const parsed = JSON.parse(raw);
    const stored = parsed?.files ?? parsed;

    if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
      persist(fallback);
      return fallback;
    }

    return normalizeStore(stored);
  } catch {
    // Corrupt payload - fall back to the seed rather than breaking the page.
    return fallback;
  }
}

function persist(store) {
  if (!hasStorage()) return true;

  try {
    window.localStorage.setItem(
      SUBJECT_FILES_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        updatedAt: new Date().toISOString(),
        files: store,
      })
    );
    return true;
  } catch {
    // QuotaExceededError is the expected failure once inline content piles
    // up; retry once with all payloads stripped so metadata still saves.
    const stripped = stripAllContent(store);

    try {
      window.localStorage.setItem(
        SUBJECT_FILES_KEY,
        JSON.stringify({
          version: STORAGE_VERSION,
          updatedAt: new Date().toISOString(),
          files: stripped,
        })
      );
      return "stripped";
    } catch {
      return false;
    }
  }
}

/** Remove every inline payload (used as the quota fallback). */
function stripAllContent(store) {
  return Object.entries(store).reduce((acc, [folderId, files]) => {
    acc[folderId] = files.map(
      // Destructuring `dataUrl` out is how the key is dropped; the binding
      // is deliberately unused.
      // eslint-disable-next-line no-unused-vars
      ({ dataUrl, ...rest }) => ({
        ...rest,
        hasContent: false,
      })
    );
    return acc;
  }, {});
}

/** Persist an already-built store and notify listeners. */
export function saveFileStore(store, source = "save", folderId = null) {
  const normalized = normalizeStore(store);
  const saved = persist(normalized);

  if (saved) emitFilesUpdate(source, folderId);

  if (saved === "stripped") {
    return {
      ok: true,
      store: normalizeStore(stripAllContent(normalized)),
      warning:
        "Storage limit reached. File details were saved, but file contents were released.",
    };
  }

  return saved
    ? { ok: true, store: normalized }
    : {
        ok: false,
        store: normalized,
        error: "Storage limit reached. Unable to save file changes.",
      };
}

/** Clear persisted files and go back to the seed data. */
export function resetFileStore(seed = SUBJECT_FILE_SEED) {
  const fresh = normalizeStore(seed);
  persist(fresh);
  emitFilesUpdate("reset", null);
  return fresh;
}

/**
 * Subscribe to file changes (same tab via CustomEvent, other tabs via the
 * native `storage` event). Returns an unsubscribe function.
 */
export function subscribeFiles(handler) {
  if (typeof window === "undefined" || typeof handler !== "function") {
    return () => {};
  }

  const onCustom = (event) => handler(event?.detail || {});
  const onStorage = (event) => {
    if (event.key === SUBJECT_FILES_KEY) handler({ source: "storage" });
  };

  window.addEventListener(SUBJECT_FILES_EVENT, onCustom);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(SUBJECT_FILES_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}

/* ==================================================================
   READS (pure)
================================================================== */

/** Files inside one folder; always a new array. */
export function listFiles(store, folderId) {
  if (!folderId) return [];
  return Array.isArray(store?.[folderId]) ? [...store[folderId]] : [];
}

/**
 * Async counterpart to `listFiles` - the seam a real backend plugs into.
 *
 * WHY THIS EXISTS ALONGSIDE THE SYNC VERSION
 * ------------------------------------------
 * `listFiles` is a pure selector with call sites that cannot await: it runs
 * inside `useMemo` in the file manager and the workspace hook, inside `reduce`
 * callbacks in `folderStatsService`, and inside four mutations in this very
 * module (`validateFileName`, `uploadFiles`, `renameFile`, `deleteFile`).
 * Making it return a promise would break every one of those - the reducers
 * would sum promises and the memos would hand components a thenable instead of
 * an array. So the sync selector stays exactly as it is, and asynchrony is
 * added here as a separate, additive entry point.
 *
 * Today this resolves from the already-loaded store on a microtask, so the
 * skeleton appears for one frame on a folder switch rather than being dead
 * markup. Nothing is delayed artificially - there is no timer here.
 *
 * API MIGRATION: replace the body with the real request
 * (`const res = await fetch(...)`) and keep the resolved shape - an array of
 * file records. `SubjectFileManager` already handles the pending, success and
 * failure branches, so no component has to change.
 *
 * @param {object} store    current file store (ignored once a backend exists)
 * @param {string} folderId folder whose files to read
 * @param {{ signal?: AbortSignal }} [options] abort support for stale requests
 * @returns {Promise<Array>} files in that folder
 */
export async function fetchFolderFiles(store, folderId, options = {}) {
  const { signal } = options;

  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  // Yields to the microtask queue so callers observe a real pending state.
  const files = await Promise.resolve(listFiles(store, folderId));

  // The folder may have changed while this was in flight.
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  return files;
}

/** Total file count across every folder. */
export function countAllFiles(store) {
  if (!store) return 0;
  return Object.values(store).reduce(
    (total, files) => total + (Array.isArray(files) ? files.length : 0),
    0
  );
}

/** Combined byte size of a file list. */
export function totalSize(files) {
  if (!Array.isArray(files)) return 0;
  return files.reduce((total, file) => total + (file.size || 0), 0);
}

/** Look up a single record by id inside a folder. */
export function findFileById(store, folderId, fileId) {
  return listFiles(store, folderId).find((file) => file.id === fileId) || null;
}

/**
 * Drop buckets whose folder no longer exists in the folder tree.
 *
 * Phase 3's `deleteFolder` intentionally knows nothing about files, so this
 * keeps the two stores consistent without changing that module. Returns
 * `{ changed, store }` and only writes when something was actually removed.
 */
export function pruneOrphanFolders(store, existingFolderIds) {
  const keep = new Set(existingFolderIds || []);
  const next = {};
  let changed = false;

  Object.entries(store || {}).forEach(([folderId, files]) => {
    if (keep.has(folderId)) {
      next[folderId] = files;
    } else {
      changed = true;
    }
  });

  if (!changed) return { changed: false, store };

  persist(normalizeStore(next));

  return { changed: true, store: normalizeStore(next) };
}

/* ==================================================================
   SEARCH + SORT (pure, requirements 5 & 6)
================================================================== */

/** Case-insensitive match on file name, type, uploader or status. */
export function searchFiles(files, term) {
  const query = String(term ?? "").trim().toLowerCase();
  if (!query) return files;

  return files.filter((file) => {
    const haystack = [
      file.name,
      getExtension(file.name),
      file.uploadedBy,
      file.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

/**
 * Sort by name / date / size / type.
 *
 * `date` uses `modifiedAt` so the most recently touched file surfaces first,
 * falling back to `uploadedAt` for records that were never modified.
 * Ties break on name so the order is stable and predictable.
 */
export function sortFiles(files, key = "name", direction = "asc") {
  const factor = direction === "desc" ? -1 : 1;
  const byName = (a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

  const compare = {
    name: byName,
    size: (a, b) => (a.size || 0) - (b.size || 0) || byName(a, b),
    type: (a, b) =>
      getExtension(a.name).localeCompare(getExtension(b.name)) || byName(a, b),
    date: (a, b) => {
      const at = new Date(a.modifiedAt || a.uploadedAt).getTime() || 0;
      const bt = new Date(b.modifiedAt || b.uploadedAt).getTime() || 0;
      return at - bt || byName(a, b);
    },
  }[key] || byName;

  return [...files].sort((a, b) => compare(a, b) * factor);
}

/* ==================================================================
   VALIDATION (requirement 8)
================================================================== */

/**
 * Validate one incoming filename for a folder.
 *
 * Rules:
 *   - name required, length + illegal characters guarded
 *   - extension must be one of the supported document formats
 *   - no duplicate name in the same folder (case-insensitive)
 *
 * `excludeId` skips a record during the duplicate check (used by rename so
 * a file does not clash with itself).
 */
export function validateFileName(store, folderId, name, options = {}) {
  const { excludeId = null } = options;
  const trimmed = String(name ?? "").trim();

  if (!trimmed) {
    return { valid: false, error: "File name is required." };
  }

  if (trimmed.length > MAX_NAME_LENGTH) {
    return {
      valid: false,
      error: `File name cannot exceed ${MAX_NAME_LENGTH} characters.`,
    };
  }

  if (INVALID_NAME_CHARS.test(trimmed)) {
    return {
      valid: false,
      error: `File name cannot contain ${FILE_NAME_RULES.invalidCharsLabel}`,
    };
  }

  const extension = getExtension(trimmed);

  if (!extension) {
    return {
      valid: false,
      error: "File name must include an extension (e.g. .pdf).",
    };
  }

  if (!isSupportedExtension(extension)) {
    return {
      valid: false,
      error: `"${extension.toUpperCase()}" is not a supported file type. Allowed: ${SUPPORTED_EXTENSIONS_LABEL}.`,
    };
  }

  const duplicate = listFiles(store, folderId).some(
    (file) =>
      file.id !== excludeId &&
      file.name.trim().toLowerCase() === trimmed.toLowerCase()
  );

  if (duplicate) {
    return {
      valid: false,
      error: `A file named "${trimmed}" already exists in this folder.`,
    };
  }

  return { valid: true, error: "" };
}

/**
 * Validate a browser `File` before upload: type, emptiness and hard size
 * cap. Duplicate checking is handled by `validateFileName`.
 */
export function validateUploadCandidate(file) {
  if (!file) return { valid: false, error: "No file selected." };

  const extension = getExtension(file.name);

  if (!extension || !isSupportedExtension(extension)) {
    return {
      valid: false,
      error: `Unsupported file type${
        extension ? ` (.${extension})` : ""
      }. Allowed: ${SUPPORTED_EXTENSIONS_LABEL}.`,
    };
  }

  if (!file.size) {
    return { valid: false, error: "File is empty (0 bytes)." };
  }

  if (file.size > MAX_FILE_BYTES) {
    return {
      valid: false,
      error: `File exceeds the ${formatFileSize(MAX_FILE_BYTES)} upload limit.`,
    };
  }

  return { valid: true, error: "" };
}

/* ==================================================================
   MUTATIONS
   Each returns { ok, store, ... } and persists on success, so the UI can
   refresh from one place after any operation.
================================================================== */

/** Read a File as a data URL, resolving to null when it is too large. */
function readFileContent(file) {
  if (file.size > MAX_INLINE_CONTENT_BYTES) return Promise.resolve(null);
  if (typeof FileReader === "undefined") return Promise.resolve(null);

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload one or many files into `folderId` (requirement 1).
 *
 * Async because file contents are read off disk. Validation runs per file
 * so a single bad file never blocks the rest of the batch, and duplicates
 * are checked against both the store and the current batch.
 *
 * Resolves with:
 *   { ok, store, added: File[], rejected: [{ name, error }], warning? }
 */
export async function uploadFiles(store, folderId, fileList) {
  const incoming = Array.from(fileList || []);

  if (!folderId) {
    return {
      ok: false,
      store,
      added: [],
      rejected: [],
      error: "Select a folder before uploading files.",
    };
  }

  if (incoming.length === 0) {
    return {
      ok: false,
      store,
      added: [],
      rejected: [],
      error: "No files selected. Choose at least one file to upload.",
    };
  }

  const working = { ...store, [folderId]: listFiles(store, folderId) };
  const added = [];
  const rejected = [];

  for (const raw of incoming) {
    const candidate = validateUploadCandidate(raw);

    if (!candidate.valid) {
      rejected.push({ name: raw?.name || "Unknown file", error: candidate.error });
      continue;
    }

    // Duplicate check runs against `working`, so two identically named
    // files inside one batch are caught too.
    const nameCheck = validateFileName(working, folderId, raw.name);

    if (!nameCheck.valid) {
      rejected.push({ name: raw.name, error: nameCheck.error });
      continue;
    }

    /* eslint-disable no-await-in-loop -- sequential keeps memory flat and
       preserves the order files were chosen in. */
    const dataUrl = await readFileContent(raw);
    /* eslint-enable no-await-in-loop */

    const now = new Date().toISOString();
    const record = normalizeFile(
      {
        id: createId(),
        folderId,
        name: raw.name.trim(),
        size: raw.size,
        uploadedAt: now,
        modifiedAt: raw.lastModified
          ? new Date(raw.lastModified).toISOString()
          : now,
        uploadedBy: CURRENT_MOCK_USER,
        status: "Pending Review",
        hasContent: Boolean(dataUrl),
        ...(dataUrl ? { dataUrl } : {}),
      },
      folderId
    );

    working[folderId] = [record, ...working[folderId]];
    added.push(record);
  }

  if (added.length === 0) {
    return {
      ok: false,
      store,
      added: [],
      rejected,
      error: rejected.length === 1 ? rejected[0].error : "No files could be uploaded.",
    };
  }

  const saved = saveFileStore(working, "upload", folderId);

  if (!saved.ok) {
    return { ok: false, store, added: [], rejected, error: saved.error };
  }

  return {
    ok: true,
    store: saved.store,
    added,
    rejected,
    warning: saved.warning,
  };
}

/** Rename a file inside its folder (requirement 4). */
export function renameFile(store, folderId, fileId, name) {
  const files = listFiles(store, folderId);
  const target = files.find((file) => file.id === fileId);

  if (!target) {
    return { ok: false, store, error: "This file no longer exists." };
  }

  const check = validateFileName(store, folderId, name, { excludeId: fileId });
  if (!check.valid) return { ok: false, store, error: check.error };

  const renamed = {
    ...target,
    name: String(name).trim(),
    modifiedAt: new Date().toISOString(),
  };

  const working = {
    ...store,
    [folderId]: files.map((file) => (file.id === fileId ? renamed : file)),
  };

  const saved = saveFileStore(working, "rename", folderId);
  if (!saved.ok) return { ok: false, store, error: saved.error };

  return { ok: true, store: saved.store, file: renamed };
}

/** Delete a file from its folder (requirement 4). */
export function deleteFile(store, folderId, fileId) {
  const files = listFiles(store, folderId);
  const target = files.find((file) => file.id === fileId);

  if (!target) {
    return { ok: false, store, error: "This file no longer exists." };
  }

  const working = {
    ...store,
    [folderId]: files.filter((file) => file.id !== fileId),
  };

  const saved = saveFileStore(working, "delete", folderId);
  if (!saved.ok) return { ok: false, store, error: saved.error };

  return { ok: true, store: saved.store, file: target };
}

/**
 * Trigger a browser download (requirement 4).
 *
 * Files uploaded in this session carry their bytes as a data URL and
 * download for real. Seeded/oversized records have no payload, so a small
 * text stub describing the file is generated instead - the same call site
 * will work unchanged once a backend serves real URLs.
 */
export function downloadFile(file) {
  if (!file || typeof document === "undefined") {
    return { ok: false, error: "Unable to download this file." };
  }

  const href =
    file.hasContent && file.dataUrl
      ? file.dataUrl
      : URL.createObjectURL(
          new Blob(
            [
              `TriaNXT - subject file placeholder\n\n` +
                `File: ${file.name}\n` +
                `Size: ${formatFileSize(file.size)}\n` +
                `Uploaded: ${formatDateTime(file.uploadedAt)}\n` +
                `Uploaded By: ${file.uploadedBy}\n` +
                `Status: ${file.status}\n\n` +
                `Contents are not stored locally for this record. ` +
                `The real file will be served once the backend is connected.\n`,
            ],
            { type: "text/plain" }
          )
        );

  const isObjectUrl = !(file.hasContent && file.dataUrl);
  const link = document.createElement("a");

  link.href = href;
  link.download = isObjectUrl ? `${file.name}.txt` : file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (isObjectUrl) URL.revokeObjectURL(href);

  return {
    ok: true,
    placeholder: isObjectUrl,
  };
}

/* ==================================================================
   FORMATTERS (shared by table, preview and messages)
================================================================== */

/** Bytes -> "1.2 MB". */
export function formatFileSize(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return "0 KB";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    units.length - 1,
    Math.floor(Math.log(value) / Math.log(1024))
  );
  const scaled = value / 1024 ** index;
  const decimals = scaled >= 100 || index === 0 ? 0 : 1;

  return `${scaled.toFixed(decimals)} ${units[index]}`;
}

/** ISO -> "12-Jan-2026" (matches the date style used across the app). */
export function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return `${String(date.getDate()).padStart(2, "0")}-${
    months[date.getMonth()]
  }-${date.getFullYear()}`;
}

/** ISO -> "12-Jan-2026, 14:05". */
export function formatDateTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return `${formatDate(iso)}, ${String(date.getHours()).padStart(
    2,
    "0"
  )}:${String(date.getMinutes()).padStart(2, "0")}`;
}

const FileService = {
  loadFileStore,
  saveFileStore,
  resetFileStore,
  subscribeFiles,
  listFiles,
  fetchFolderFiles,
  countAllFiles,
  totalSize,
  findFileById,
  pruneOrphanFolders,
  searchFiles,
  sortFiles,
  validateFileName,
  validateUploadCandidate,
  uploadFiles,
  renameFile,
  deleteFile,
  downloadFile,
  formatFileSize,
  formatDate,
  formatDateTime,
  FILE_STATUSES,
};

export default FileService;
