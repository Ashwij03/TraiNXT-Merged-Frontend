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
 *     children?: node[]   nested folders (optional)
 *   }
 *
 * This array is a SEED only, used once on first run (see
 * FolderTreeService.loadFolderTree). It is not the live subject list: every
 * create/edit/delete goes through FolderTreeService, which reads and writes
 * localStorage, so the subject roster shown in the explorer is dynamic and
 * grows/shrinks with user actions, never re-read from here after first load.
 *
 * SUB-003 is intentionally seeded with zero folders - it is the reference
 * case for "a subject with nothing in it yet" (empty tree, create-first-
 * folder, and, as of Update 6, edit/delete) and must keep working exactly
 * like every other subject.
 */

export const SUBJECT_EXPLORER_TREE = [
  {
    id: "SUB-001",
    name: "SUB-001",
    type: "subject",
    children: [
      { id: "SUB-001/screening", name: "Screening", type: "folder" },
      { id: "SUB-001/visit-1", name: "Visit 1", type: "folder" },
      { id: "SUB-001/visit-2", name: "Visit 2", type: "folder" },
      {
        id: "SUB-001/additional-documents",
        name: "Additional Documents",
        type: "folder",
      },
    ],
  },
  {
    id: "SUB-002",
    name: "SUB-002",
    type: "subject",
    children: [
      { id: "SUB-002/lab-reports", name: "Lab Reports", type: "folder" },
      { id: "SUB-002/x-ray", name: "X-Ray", type: "folder" },
      { id: "SUB-002/insurance", name: "Insurance", type: "folder" },
    ],
  },
  {
    id: "SUB-003",
    name: "SUB-003",
    type: "subject",
    children: [],
  },
  {
    id: "SUB-004",
    name: "SUB-004",
    type: "subject",
    children: [
      { id: "SUB-004/screening", name: "Screening", type: "folder" },
      {
        id: "SUB-004/consent-forms",
        name: "Consent Forms",
        type: "folder",
        children: [
          { id: "SUB-004/consent-forms/icf-v1", name: "ICF v1.0", type: "folder" },
          { id: "SUB-004/consent-forms/icf-v2", name: "ICF v2.0", type: "folder" },
        ],
      },
      { id: "SUB-004/visit-1", name: "Visit 1", type: "folder" },
      { id: "SUB-004/adverse-events", name: "Adverse Events", type: "folder" },
    ],
  },
  {
    id: "SUB-005",
    name: "SUB-005",
    type: "subject",
    children: [
      { id: "SUB-005/screening", name: "Screening", type: "folder" },
      { id: "SUB-005/visit-1", name: "Visit 1", type: "folder" },
      { id: "SUB-005/lab-reports", name: "Lab Reports", type: "folder" },
      { id: "SUB-005/imaging", name: "Imaging", type: "folder" },
      {
        id: "SUB-005/additional-documents",
        name: "Additional Documents",
        type: "folder",
      },
    ],
  },
  {
    id: "SUB-006",
    name: "SUB-006",
    type: "subject",
    children: [
      { id: "SUB-006/screening", name: "Screening", type: "folder" },
      { id: "SUB-006/insurance", name: "Insurance", type: "folder" },
    ],
  },
];

export default SUBJECT_EXPLORER_TREE;
