# Read-Only Role Refactor Report

**Date:** July 2, 2026  
**Project:** TriaNXT-Merged-Frontend  
**Status:** Complete

---

## Executive Summary

Implemented comprehensive read-only role enforcement for CRO and Sponsor, unified PI/CRO/Sponsor study sidebars with Admin/Site Staff, converted Sponsor data to dynamic shared storage, and completed the permission request workflow. Production build passes.

---

## Section A: CRO Changes

### Locked Files
All seven locked CRO files were **not modified**. No compile errors required locked-file changes.

### Non-Locked Files Modified

| File | Changes |
|------|---------|
| `CRORegulatoryDocuments.js` | Removed `addDocument`/`updateDocument` usage; read-only table; Request Permission for upload/approve |
| `Screening.js` | Removed mock data and local CRUD; reads `subjectsByStudy` dynamically |
| `Enrollment.js` | Removed mock enrollments and CRUD modals; dynamic shared data |
| `FileDetails.js` | Reads shared `files` key; Request Permission for add/delete |
| `Comments.js` | Uses `useCROData` shared comments; add-only, no delete/reply/resolve |
| `SiteManagement.js` | Derives sites from `studyService.getStudies()` |
| `Components/SubjectManagement.js` | Read-only subject list from `subjectsByStudy` |
| `Components/VisitManagement.js` | Read-only visits from `visitSchedules` |
| `CROSidebar.js` | Replaced hardcoded STUDIES array with dynamic tree |

### Preserved
- CRO Study CRUD in `Components/MyStudies.js` (unchanged)
- Locked routed pages (`CROSubjects`, `CROScreening`, etc.) already read-only via `CRODATAContext`

---

## Section B: Sponsor Changes

### `sponsorDataStore.js`
- Removed all static `defaultData` fallbacks for portfolio, CROs, sites, recruitment, regulatory, reports, notifications, enrollment trend
- Portfolio studies derived from `getStudies()` / `getFilteredStudies()`
- CROs, sites, recruitment, regulatory, reports, notifications derived from shared storage
- Risks remain in `sponsor_data_risks` (empty until user adds via approved permission)
- Quick actions computed dynamically from live KPIs

### Sponsor Pages
| Page | Change |
|------|--------|
| `SponsorDashboard.js` | Empty-state charts; listens to `studies-updated`, `subjects-updated` |
| `StatusPieChart.js` / `EnrollmentChart.js` | "No data available yet" when empty |
| `RiskManagement.js` | Request Permission replaces Add Risk modal |
| `CROOversight.js` | Request Permission; delete removed; dynamic CRO list |
| `Regulatory.js` | Request Permission; dynamic documents; empty chart state |
| `Reports.js` | Request Permission for generate; empty table state |
| `Comments.js` | Replaced static mock with `RoleCommentsView` |
| `AppLayout.js` | Dynamic studies sidebar |

### Studies CRUD Preserved
- `PortfolioManagement.js`, `Studies.js` retain study create/edit (Sponsor exception per requirements)

---

## Section C: Unified Studies Sidebar

### New Shared Components
- `src/hooks/useRoleStudiesSidebar.js` — state, event listeners, safe redirect
- `src/Components/common/RoleStudiesSidebarTree.js` — Admin-matching tree UI

### Sidebars Updated
| Sidebar | Before | After |
|---------|--------|-------|
| `PISidebar.js` | Hardcoded SUB-001..004 | Dynamic tree from `studyService` |
| `CROSidebar.js` | Hardcoded 747-303, 05151 | Dynamic tree + study count |
| `AppLayout.js` (Sponsor) | `getPortfolioStudies()` hardcoded tree | Shared tree component |

### Admin/Site Staff
- `DashboardSidebar.js` — **unchanged** per requirements

---

## Permission Request System

### New/Updated
- `RequestPermissionButton.js` + CSS — reusable modal with action, module, record, reason
- `accessPermissionService.js` — removed seed data; full request schema; scoped approvals; events

### Events Implemented
- `permission-requests-updated`
- `permissions-updated`
- `sponsor-data-updated` (on request submit/approve/reject)

### Admin Approval
- `AccessPermissions.js` updated to listen for `permission-requests-updated` and display action/module/record columns

---

## Build & Lint Results

```
npm run build — PASSED (exit 0)
```

Pre-existing warnings remain in unrelated files (`CRONotifications.js`, `CROSitePerformance.js`, `Settings.js`, `StudyOversight.js`, `SubjectFolderWorkspace.js`). No new blocking ESLint errors from this refactor.

---

## Blockers / Locked File Issues

**None.** All locked CRO files remained untouched. `CRORegulatoryDocuments.js` previously referenced non-exported `addDocument`/`updateDocument` from context — fixed in the importing file without modifying the locked context.

---

## Deliverables

1. `src/READ_ONLY_ROLE_REFACTOR_PLAN.md` — this plan
2. All code changes implemented across Sections A, B, C
3. `src/READ_ONLY_ROLE_REFACTOR_REPORT.md` — this report
4. `New Implementations zip.zip` — updated src folder archive

---

## Key New Files

- `src/hooks/useRoleStudiesSidebar.js`
- `src/Components/common/RoleStudiesSidebarTree.js`
- `src/Components/common/RequestPermissionButton.js`
- `src/Components/common/RequestPermissionButton.css`
