/**
 * Subject Explorer - MOCK DATA
 *
 * Frontend-only mock tree for the Subject Explorer sidebar.
 * No backend integration. Replace with an API response later without
 * touching the component layer - the shape below is the contract:
 *
 *   {
 *     id: string          unique node id
 *     name: string        display label
 *     type: "subject" | "folder"
 *     locked?: boolean    true only for the system ICF folder - its own
 *                         CRUD (rename/delete) is blocked, everything else
 *                         (view/open, file upload/management inside it)
 *                         works like any other folder
 *     children?: node[]   nested folders (optional)
 *   }
 *
 * This array is a SEED only, used once on first run (see
 * FolderTreeService.loadFolderTree). It is not the live subject list: every
 * create/edit/delete goes through FolderTreeService, which reads and writes
 * localStorage, so the subject roster shown in the explorer is dynamic and
 * grows/shrinks with user actions, never re-read from here after first load.
 *
 * Update 7/8 (Subjects - Additional Updates): every subject now seeds with
 * ONLY its locked ICF folder - the previous hardcoded defaults (Screening,
 * Visit 1, Visit 2, Additional Documents, Lab Reports, X-Ray, Insurance,
 * Consent Forms, Adverse Events, Imaging) have been removed. Users add
 * whatever folders they need through the existing Add Folder flow, which
 * remains fully editable/deletable - only ICF is locked.
 *
 * `FolderTreeService.loadFolderTree` also migrates any tree already
 * persisted in localStorage from before this update, so the old default
 * folders and a missing ICF folder are both corrected on next load, not
 * just for a fresh seed.
 */

export const SUBJECT_EXPLORER_TREE = [
  {
    id: "SUB-001",
    name: "SUB-001",
    type: "subject",
    children: [{ id: "SUB-001/icf", name: "ICF", type: "folder", locked: true, children: [] }],
  },
  {
    id: "SUB-002",
    name: "SUB-002",
    type: "subject",
    children: [{ id: "SUB-002/icf", name: "ICF", type: "folder", locked: true, children: [] }],
  },
  {
    id: "SUB-003",
    name: "SUB-003",
    type: "subject",
    children: [{ id: "SUB-003/icf", name: "ICF", type: "folder", locked: true, children: [] }],
  },
  {
    id: "SUB-004",
    name: "SUB-004",
    type: "subject",
    children: [{ id: "SUB-004/icf", name: "ICF", type: "folder", locked: true, children: [] }],
  },
  {
    id: "SUB-005",
    name: "SUB-005",
    type: "subject",
    children: [{ id: "SUB-005/icf", name: "ICF", type: "folder", locked: true, children: [] }],
  },
  {
    id: "SUB-006",
    name: "SUB-006",
    type: "subject",
    children: [{ id: "SUB-006/icf", name: "ICF", type: "folder", locked: true, children: [] }],
  },
];

export default SUBJECT_EXPLORER_TREE;
