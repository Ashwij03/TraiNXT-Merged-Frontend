# Read-Only Role Refactor Plan

## Overview

This refactor enforces read-only operational access for **CRO** and **Sponsor** roles while preserving study management and own-comment capabilities. It unifies PI, CRO, and Sponsor study sidebars with Admin/Site Staff using `studyService.js` as the single study source.

## Locked Files (Do Not Modify)

- `src/pages/CRO/CRODATAContext.js`
- `src/pages/CRO/CROComments.js`
- `src/pages/CRO/CROMonitoring.js`
- `src/pages/CRO/CROSubjectManagement.js`
- `src/pages/CRO/CROReports.js`
- `src/pages/CRO/CROOverview.js`
- `src/pages/CRO/CROFiles.js`

If compile errors originate from locked files, fix importing callers and document the issue.

---

## Section A: CRO Read-Only Operational Access

### Goals
- Remove direct CRUD for subjects, visits, screening, enrollment, files, regulatory docs
- Replace blocked actions with **Request Permission** modal
- Remove reply-to-comment UI (view + add own comments only via shared context)
- Keep read-only viewing, search, filter, sort, navigation
- Keep CRO Study CRUD where it exists (`Components/MyStudies.js`)
- Use shared localStorage keys; no mock/demo data

### Files Updated
| File | Change |
|------|--------|
| `CRORegulatoryDocuments.js` | Read-only view; Request Permission for upload/approve |
| `Screening.js` | Dynamic `subjectsByStudy`; Request Permission for add |
| `Enrollment.js` | Dynamic enrollment from shared subjects |
| `FileDetails.js` | Dynamic `files` key; Request Permission for add/delete |
| `Comments.js` | Shared comments via `useCROData`; no delete/reply |
| `SiteManagement.js` | Dynamic sites from `studyService` |
| `Components/SubjectManagement.js` | Read-only list; Request Permission for add |
| `Components/VisitManagement.js` | Read-only from `visitSchedules` |
| `CROSidebar.js` | Dynamic studies tree (Section C) |

---

## Section B: Sponsor Dynamic Data & Read-Only

### Goals
- Convert `sponsorDataStore.js` to dynamic adapter (no static fallback arrays)
- Dashboard and pages derive from shared storage (`trianxtStudies`, `subjectsByStudy`, `documents`, `reports`, `notifications`)
- Empty charts/KPIs show **"No data available yet"**
- Sponsor read-only for operational data except Studies CRUD and own comments
- Request Permission for operational modifications
- Event listeners: `sponsor-data-updated`, `studies-updated`, `subjects-updated`, etc.

### Files Updated
| File | Change |
|------|--------|
| `data/sponsorDataStore.js` | Full dynamic adapter rewrite |
| `SponsorDashboard.js` | Empty-state charts; live refresh events |
| `StatusPieChart.js` / `EnrollmentChart.js` | Empty-state messaging |
| `RiskManagement.js` | Request Permission replaces Add Risk |
| `CROOversight.js` | Request Permission; remove delete |
| `Regulatory.js` | Request Permission; dynamic docs |
| `Reports.js` | Request Permission for generate |
| `Comments.js` | Uses shared `RoleCommentsView` |
| `AppLayout.js` | Dynamic studies sidebar (Section C) |

---

## Section C: Unified Studies Sidebar

### Reference
- `DashboardSidebar.js` (Admin/Site Staff — unchanged)
- `PISidebar.js`, `CROSidebar.js`, `AppLayout.js` (Sponsor)

### Implementation
| Component | Purpose |
|-----------|---------|
| `hooks/useRoleStudiesSidebar.js` | Shared state, events, safe redirect on study delete |
| `Components/common/RoleStudiesSidebarTree.js` | Study Binder tree matching Admin structure |

### Behavior
- Single source: `getStudies()` from `studyService.js`
- Subjects from `subjectsByStudy` localStorage key
- Subject folders via `folderService.getFirstLevelFolders`
- eISF child nav from `EISFMenuConfig`
- Listens: `studies-updated`, `subjects-updated`, `sponsor-data-updated`
- Only active route study folder expands on navigation
- Safe redirect to `/studies` when current study deleted
- No hardcoded study lists or duplicate localStorage keys

---

## Permission Request System

| Component | Purpose |
|-----------|---------|
| `Components/common/RequestPermissionButton.js` | Modal + submit for CRO/Sponsor |
| `services/accessPermissionService.js` | Storage, events, scoped approval |

### Request Schema
- `id`, `action`, `module`, `recordId`, `recordName`, `reason`
- `requestedBy`, `email`, `role`, `timestamp`, `status` (Pending/Approved/Rejected)

### Events
- `permission-requests-updated`
- `permissions-updated`
- `sponsor-data-updated`

### Approval Flow
- Admin/Site Staff approve/reject via `AccessPermissions.js`
- Approved requests grant scoped access in `approvedPermissionScopes` localStorage key

---

## Shared Data Rules

| Key | Usage |
|-----|-------|
| `trianxtStudies` | Study list |
| `subjectsByStudy` | Subject data per study |
| `visitSchedules` | Visit data |
| `documents` | Regulatory documents |
| `reports` | Reports |
| `comments` | Comments |
| `notifications` | Notifications |
| `files` | Files |
| `accessPermissionRequests` | Permission requests |

Empty state message: **"No data available yet"**

Dispatch events after saves: `studies-updated`, `subjects-updated`, `visits-updated`, `documents-updated`, `reports-updated`, `comments-updated`, `notifications-updated`, `files-updated`, `sponsor-data-updated`

---

## Validation Checklist

- [x] CRO non-locked files: no direct CRUD on operational data
- [x] Sponsor dashboard: no static fallback charts
- [x] Permission workflow with modal and admin approval
- [x] PI/CRO/Sponsor sidebars use shared study source
- [x] Production build compiles
- [x] Locked CRO files untouched
