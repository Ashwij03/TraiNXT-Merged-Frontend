/**
 * Subject Explorer - FILE MOCK DATA (Phase 4)
 *
 * Frontend-only seed files so the workspace is not empty on first load.
 * Keyed by folder id, matching the folder ids seeded in
 * `subjectExplorerMockData.js`.
 *
 * Record shape (the contract a real API should return):
 *
 *   {
 *     id: string             unique file id
 *     folderId: string       owning folder node id
 *     name: string           file name incl. extension
 *     size: number           bytes
 *     uploadedAt: string     ISO timestamp
 *     modifiedAt: string     ISO timestamp
 *     uploadedBy: string     mock user name
 *     status: string         mock workflow status
 *     hasContent: boolean    true when a data URL is stored locally
 *     dataUrl?: string       base64 payload (uploads only, size-capped)
 *   }
 *
 * `type` is intentionally NOT stored - it is derived from the extension by
 * `fileTypes.js`, so a rename keeps the type and icon consistent.
 */

/** Mock uploader pool + statuses (no auth wiring in this phase). */
export const MOCK_UPLOADERS = [
  "Dr Rao",
  "Priya Nair",
  "Site Coordinator",
  "Dr Kumar",
  "Anita Desai",
];

export const FILE_STATUSES = [
  "Final",
  "Approved",
  "Pending Review",
  "Draft",
  "Superseded",
];

/** Uploader attributed to files created in this phase. */
export const CURRENT_MOCK_USER = "Priya Nair";

const seed = (id, folderId, name, size, uploadedAt, modifiedAt, uploadedBy, status) => ({
  id,
  folderId,
  name,
  size,
  uploadedAt,
  modifiedAt,
  uploadedBy,
  status,
  hasContent: false,
});

/**
 * Update 7/8: the seed folders these files used to sit under (Screening,
 * Visit 1, Lab Reports, X-Ray, Imaging, the old two-folder Consent Forms
 * split) no longer exist - every subject now seeds with only its ICF
 * folder (see subjectExplorerMockData.js). The two consent-form file
 * entries are the only ones that still apply to a real ICF folder, so
 * they're retargeted onto SUB-004's ICF folder id; the rest were removed
 * rather than left pointing at folders that can never be opened again.
 */
export const SUBJECT_FILE_SEED = {
  "SUB-004/icf": [
    seed(
      "file-s4-01",
      "SUB-004/icf",
      "ICF Signed v1.0.pdf",
      420_000,
      "2026-02-02T08:10:00.000Z",
      "2026-02-02T08:10:00.000Z",
      "Dr Rao",
      "Superseded"
    ),
    seed(
      "file-s4-02",
      "SUB-004/icf",
      "ICF Signed v2.0.pdf",
      438_272,
      "2026-02-14T09:25:00.000Z",
      "2026-02-16T13:15:00.000Z",
      "Dr Rao",
      "Approved"
    ),
    seed(
      "file-s4-03",
      "SUB-004/icf",
      "Consent Log.txt",
      4_096,
      "2026-02-14T09:31:00.000Z",
      "2026-02-14T09:31:00.000Z",
      "Priya Nair",
      "Final"
    ),
  ],
};

export default SUBJECT_FILE_SEED;
