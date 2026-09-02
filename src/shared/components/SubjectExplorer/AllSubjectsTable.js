import React, { useMemo, useState } from "react";
import {
  MdSearch,
  MdClose,
  MdFileDownload,
  MdEdit,
  MdDeleteOutline,
  MdFolderOpen,
} from "react-icons/md";

import { downloadCsvReport } from "../../utils/exportReport";
import PaginationFooter from "./PaginationFooter";
import "./AllSubjectsTable.css";

/**
 * Subject Explorer - ALL SUBJECTS TABLE (Task 1.6, State A).
 *
 * Shown in the Subjects tab whenever nothing is selected in the sidebar.
 * Columns/behaviour follow the eISF DocumentTable pattern (shell, header,
 * row hover, sorting, pagination footer, "Showing X to Y of Z") without
 * importing anything from eISF - this is Subjects' own table, reading the
 * same live folder tree (`SubjectExplorer`/`FolderTreeService`) and the
 * same subject metadata records (`subjectRecordsService`, i.e. the exact
 * `subjectsByStudy` storage `StudySubjects.js` already owns) that back the
 * rest of the tab. No mock/static rows, no second subject store.
 *
 * Props
 *   subjects       [{ id, name, record }]  merged tree + metadata rows
 *   studyId
 *   canModify      show/hide the Actions column
 *   onOpen(subject)    row click / "Open" action -> select in explorer
 *   onEdit(subject)    Edit action -> SubjectFormModal
 *   onDelete(subject)  Delete action -> confirmation dialog
 */

const STATUS_ALL = "__all__";
const PAGE_SIZE_DEFAULT = 10;

/**
 * Fix (this update): the table had NO `<colgroup>` at all - header and body
 * column widths were left entirely to the browser's default table layout,
 * which sizes each column from its own row's content. That is the actual
 * structural cause of any header/row drift: two rows with differently-long
 * content can legitimately end up with different column widths under that
 * algorithm. An explicit `<colgroup>` plus `table-layout: fixed`
 * (`AllSubjectsTable.css`) removes that entirely - one set of widths, used
 * for the header row and every body row, exactly like `SubjectFileTable.js`
 * already does for the file table. Two sets because the Actions column
 * only renders when `canModify` is true; each sums to 100%. */
/* Actions widened (14% -> 17%) so the Edit + Delete button pair fits
   comfortably inside its own column (including at the 560px min-width
   floor) and never needs to spill into the Status column; Current Visit
   gives up the difference. Percentages still sum to 100. */
const COLUMNS_WITH_ACTIONS = [
  { key: "id", width: "12%" },
  { key: "status", width: "10%" },
  { key: "pi", width: "15%" },
  { key: "site", width: "13%" },
  { key: "screening", width: "12%" },
  { key: "enrollment", width: "12%" },
  { key: "currentVisit", width: "9%" },
  { key: "actions", width: "17%" },
];

const COLUMNS_WITHOUT_ACTIONS = [
  { key: "id", width: "14%" },
  { key: "status", width: "11%" },
  { key: "pi", width: "18%" },
  { key: "site", width: "15%" },
  { key: "screening", width: "14%" },
  { key: "enrollment", width: "14%" },
  { key: "currentVisit", width: "14%" },
];

function AllSubjectsTable({
  subjects = [],
  studyId,
  canModify = false,
  onOpen,
  onEdit,
  onDelete,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(STATUS_ALL);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);

  const statusOptions = useMemo(() => {
    const set = new Set();
    subjects.forEach((subject) => {
      if (subject.record?.status) set.add(subject.record.status);
    });
    return Array.from(set).sort();
  }, [subjects]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return subjects.filter((subject) => {
      if (statusFilter !== STATUS_ALL && subject.record?.status !== statusFilter) {
        return false;
      }
      if (!term) return true;

      const haystack = [
        subject.id,
        subject.record?.initials,
        subject.record?.status,
        subject.record?.pi,
        subject.record?.site,
        subject.record?.screeningDate,
        subject.record?.enrollmentDate,
        subject.record?.currentVisit,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [subjects, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

  const handleReset = () => {
    setSearch("");
    setStatusFilter(STATUS_ALL);
    setPage(1);
  };

  const handleExport = () => {
    const header = [
      "Subject ID",
      "Status",
      "Principal Investigator",
      "Site",
      "Screening Date",
      "Enrollment Date",
      "Current Visit",
    ];

    const rows = filtered.map((subject) => [
      subject.id,
      subject.record?.status || "",
      subject.record?.pi || "",
      subject.record?.site || "",
      subject.record?.screeningDate || "",
      subject.record?.enrollmentDate || "",
      subject.record?.currentVisit || "",
    ]);

    downloadCsvReport(`${studyId || "subjects"}-all-subjects`, [header, ...rows]);
  };

  return (
    <section className="sat-panel" aria-label="All subjects">
      <header className="sat-toolbar" role="search">
        <div className="sat-search">
          <MdSearch size={17} className="sat-search-icon" aria-hidden="true" />
          <input
            type="text"
            className="sat-search-input"
            placeholder="Search subjects by ID, PI, site, status..."
            value={search}
            aria-label="Search subjects"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          {search && (
            <button
              type="button"
              className="sat-search-clear"
              aria-label="Clear search"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
            >
              <MdClose size={14} />
            </button>
          )}
        </div>

        <div className="sat-toolbar-right">
          <label className="sat-filter">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by status"
            >
              <option value={STATUS_ALL}>All statuses</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button type="button" className="sat-btn sat-btn--ghost" onClick={handleReset}>
            Reset
          </button>

          <button type="button" className="sat-btn" onClick={handleExport}>
            <MdFileDownload size={14} aria-hidden="true" />
            <span>Export</span>
          </button>
        </div>
      </header>

      <div className="sat-table-scroll">
        <table className="sat-table">
          <colgroup>
            {(canModify ? COLUMNS_WITH_ACTIONS : COLUMNS_WITHOUT_ACTIONS).map(
              ({ key, width }) => (
                <col key={key} className={`sat-col-${key}`} style={{ width }} />
              )
            )}
          </colgroup>
          <thead>
            <tr>
              <th>Subject ID</th>
              <th>Status</th>
              <th>Principal Investigator</th>
              <th>Site</th>
              <th>Screening Date</th>
              <th>Enrollment Date</th>
              <th>Current Visit</th>
              {canModify && <th className="sat-th-actions">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={canModify ? 8 : 7} className="sat-empty-cell">
                  No matching subjects found.
                </td>
              </tr>
            ) : (
              pageRows.map((subject) => (
                <tr
                  key={subject.id}
                  className="sat-row"
                  onClick={() => onOpen?.(subject)}
                >
                  <td className="sat-cell-id">
                    <span className="sat-cell-id-inner">
                      <MdFolderOpen size={15} aria-hidden="true" />
                      <span>{subject.id}</span>
                    </span>
                  </td>
                  <td>
                    {subject.record?.status ? (
                      <span className="sat-status-pill">{subject.record.status}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{subject.record?.pi || "—"}</td>
                  <td>{subject.record?.site || "—"}</td>
                  <td>{subject.record?.screeningDate || "—"}</td>
                  <td>{subject.record?.enrollmentDate || "—"}</td>
                  <td>{subject.record?.currentVisit || "—"}</td>
                  {canModify && (
                    <td className="sat-cell-actions">
                      <div className="sat-row-actions">
                        <button
                          type="button"
                          className="sat-action-btn"
                          aria-label={`Edit subject ${subject.id}`}
                          title="Edit subject details"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEdit?.(subject);
                          }}
                        >
                          <MdEdit size={15} />
                        </button>
                        <button
                          type="button"
                          className="sat-action-btn sat-action-btn--danger"
                          aria-label={`Delete subject ${subject.id}`}
                          title="Delete subject"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDelete?.(subject);
                          }}
                        >
                          <MdDeleteOutline size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationFooter
        page={safePage}
        pageSize={pageSize}
        total={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </section>
  );
}

export default AllSubjectsTable;
