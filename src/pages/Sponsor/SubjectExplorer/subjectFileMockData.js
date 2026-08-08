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

export const SUBJECT_FILE_SEED = {
  "SUB-001/screening": [
    seed(
      "file-s1-01",
      "SUB-001/screening",
      "Screening Checklist.pdf",
      248_320,
      "2026-01-10T09:14:00.000Z",
      "2026-01-12T11:02:00.000Z",
      "Dr Rao",
      "Approved"
    ),
    seed(
      "file-s1-02",
      "SUB-001/screening",
      "Eligibility Criteria.docx",
      86_016,
      "2026-01-10T09:22:00.000Z",
      "2026-01-10T09:22:00.000Z",
      "Priya Nair",
      "Final"
    ),
    seed(
      "file-s1-03",
      "SUB-001/screening",
      "Baseline Labs.xlsx",
      132_600,
      "2026-01-11T14:40:00.000Z",
      "2026-01-15T08:05:00.000Z",
      "Site Coordinator",
      "Pending Review"
    ),
  ],
  "SUB-001/visit-1": [
    seed(
      "file-s1-04",
      "SUB-001/visit-1",
      "Visit 1 Source Notes.pdf",
      512_000,
      "2026-01-18T10:00:00.000Z",
      "2026-01-18T10:00:00.000Z",
      "Dr Rao",
      "Final"
    ),
    seed(
      "file-s1-05",
      "SUB-001/visit-1",
      "Vitals Log.xls",
      45_100,
      "2026-01-18T10:12:00.000Z",
      "2026-01-19T09:30:00.000Z",
      "Anita Desai",
      "Draft"
    ),
  ],
  "SUB-002/lab-reports": [
    seed(
      "file-s2-01",
      "SUB-002/lab-reports",
      "Haematology Panel.pdf",
      301_400,
      "2026-01-20T07:45:00.000Z",
      "2026-01-20T07:45:00.000Z",
      "Dr Kumar",
      "Approved"
    ),
    seed(
      "file-s2-02",
      "SUB-002/lab-reports",
      "Biochemistry Results.xlsx",
      164_800,
      "2026-01-21T12:20:00.000Z",
      "2026-01-24T16:10:00.000Z",
      "Site Coordinator",
      "Pending Review"
    ),
    seed(
      "file-s2-03",
      "SUB-002/lab-reports",
      "Lab Certificate.png",
      722_944,
      "2026-01-22T09:05:00.000Z",
      "2026-01-22T09:05:00.000Z",
      "Priya Nair",
      "Final"
    ),
  ],
  "SUB-002/x-ray": [
    seed(
      "file-s2-04",
      "SUB-002/x-ray",
      "Chest X-Ray.jpg",
      1_248_576,
      "2026-01-23T15:30:00.000Z",
      "2026-01-23T15:30:00.000Z",
      "Dr Kumar",
      "Final"
    ),
    seed(
      "file-s2-05",
      "SUB-002/x-ray",
      "Radiology Report.docx",
      98_304,
      "2026-01-23T16:02:00.000Z",
      "2026-01-25T10:44:00.000Z",
      "Anita Desai",
      "Draft"
    ),
  ],
  "SUB-004/consent-forms/icf-v1": [
    seed(
      "file-s4-01",
      "SUB-004/consent-forms/icf-v1",
      "ICF Signed v1.0.pdf",
      420_000,
      "2026-02-02T08:10:00.000Z",
      "2026-02-02T08:10:00.000Z",
      "Dr Rao",
      "Superseded"
    ),
  ],
  "SUB-004/consent-forms/icf-v2": [
    seed(
      "file-s4-02",
      "SUB-004/consent-forms/icf-v2",
      "ICF Signed v2.0.pdf",
      438_272,
      "2026-02-14T09:25:00.000Z",
      "2026-02-16T13:15:00.000Z",
      "Dr Rao",
      "Approved"
    ),
    seed(
      "file-s4-03",
      "SUB-004/consent-forms/icf-v2",
      "Consent Log.txt",
      4_096,
      "2026-02-14T09:31:00.000Z",
      "2026-02-14T09:31:00.000Z",
      "Priya Nair",
      "Final"
    ),
  ],
  "SUB-005/imaging": [
    seed(
      "file-s5-01",
      "SUB-005/imaging",
      "MRI Series.zip",
      8_734_310,
      "2026-02-20T11:00:00.000Z",
      "2026-02-20T11:00:00.000Z",
      "Site Coordinator",
      "Pending Review"
    ),
    seed(
      "file-s5-02",
      "SUB-005/imaging",
      "Imaging Summary.pptx",
      1_048_576,
      "2026-02-21T14:18:00.000Z",
      "2026-02-22T09:40:00.000Z",
      "Dr Menon",
      "Draft"
    ),
  ],
};

export default SUBJECT_FILE_SEED;
