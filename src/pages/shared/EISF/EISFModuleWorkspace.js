import { useEffect, useMemo, useState } from "react";
import DashboardCards from "./components/DashboardCards";
import DocumentTable from "./components/DocumentTable";
import UploadDocumentModal from "./components/UploadDocumentModal";
import DocumentViewer from "./components/DocumentViewer";
import EditDocumentModal from "./components/EditDocumentModal";
import VersionHistoryModal from "./components/VersionHistoryModal";
import AuditTrailModal from "./components/AuditTrailModal";
import FilingGuidelineModal from "./components/FilingGuidelineModal";
import useDashboard from "./hooks/useDashboard";
import { DOCUMENT_PAGE_SIZE_OPTIONS } from "./Constants/dashboardConstants";
import {
  createUploadedDocument,
  downloadDocument,
  exportDocuments,
  getFilterOptions,
  getFolderCounts,
  initializeModuleDocuments,
  paginateDocuments,
  persistModuleDocuments,
  updateDocumentRecord,
} from "./services/documentService";
import { buildReferenceDashboardCards } from "./utils/dashboardUtils";
import { processDocuments } from "./utils/searchUtils";
import "./EISFModuleWorkspace.css";

export default function EISFModuleWorkspace({
  moduleConfig,
  activeSectionId,
  studyCode,
  initialDocuments = null,
  moduleOptions = [],
  selectedModuleId,
  onModuleChange,
  onSectionChange,
}) {
  const [documents, setDocuments] = useState(() =>
    initializeModuleDocuments(moduleConfig, studyCode, initialDocuments)
  );
  const [selectedSectionId, setSelectedSectionId] = useState(
    activeSectionId || moduleConfig.sections[0]?.id
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [versionFilter, setVersionFilter] = useState("");
  const [sortField, setSortField] = useState("documentName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [guidelineOpen, setGuidelineOpen] = useState(false);

  const dashboard = useDashboard(documents);

  useEffect(() => {
    setDocuments(initializeModuleDocuments(moduleConfig, studyCode, initialDocuments));
    setSearch("");
    setStatusFilter("");
    setTypeFilter("");
    setVersionFilter("");
    setSortField("documentName");
    setSortDirection("asc");
    setPage(1);
  }, [moduleConfig, initialDocuments, studyCode]);

  useEffect(() => {
    persistModuleDocuments(moduleConfig, studyCode, documents);
  }, [documents, moduleConfig, studyCode]);

  useEffect(() => {
    const requestedSection = moduleConfig.sections.find(
      (section) => section.id === activeSectionId
    );

    setSelectedSectionId(requestedSection?.id || moduleConfig.sections[0]?.id);
    setPage(1);
  }, [activeSectionId, moduleConfig]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter, versionFilter, sortField, sortDirection, selectedSectionId, pageSize]);

  const activeSection = useMemo(
    () =>
      moduleConfig.sections.find((section) => section.id === selectedSectionId) ||
      moduleConfig.sections[0],
    [moduleConfig.sections, selectedSectionId]
  );

  const folderCounts = useMemo(
    () => getFolderCounts(moduleConfig.sections, documents),
    [moduleConfig.sections, documents]
  );

  const processedSectionDocuments = useMemo(() => {
    const sectionDocuments = documents.filter(
      (document) => document.section === activeSection?.id || document.sectionId === activeSection?.id
    );

    return processDocuments(sectionDocuments, {
      keyword: search,
      filters: {
        status: statusFilter,
        documentType: typeFilter,
        version: versionFilter,
      },
      sortField,
      sortDirection,
    });
  }, [activeSection, documents, search, statusFilter, typeFilter, versionFilter, sortField, sortDirection]);

  const pagination = useMemo(
    () => paginateDocuments(processedSectionDocuments, page, pageSize),
    [processedSectionDocuments, page, pageSize]
  );

  const statusOptions = useMemo(
    () => getFilterOptions(documents, "status"),
    [documents]
  );

  const categoryOptions = useMemo(
    () => moduleConfig.sections.map((section) => section.title),
    [moduleConfig.sections]
  );

  const typeOptions = useMemo(
    () => getFilterOptions(documents, "documentType"),
    [documents]
  );

  const versionOptions = useMemo(
    () => getFilterOptions(documents, "version"),
    [documents]
  );

  const dashboardCards = useMemo(
    () => buildReferenceDashboardCards(documents, moduleConfig.sections),
    [documents, moduleConfig.sections]
  );

  const selectSection = (sectionId) => {
    setSelectedSectionId(sectionId);
    onSectionChange?.(sectionId);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setTypeFilter("");
    setVersionFilter("");
    setSortField("documentName");
    setSortDirection("asc");
    setPage(1);
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("asc");
  };

  const handleUpload = (formData) => {
    const newDocument = createUploadedDocument(
      formData,
      activeSection,
      moduleConfig,
      "Current User"
    );

    setDocuments((prev) => [newDocument, ...prev]);
  };

  const handleSaveDocument = (updatedDocument) => {
    setDocuments((prev) =>
      prev.map((document) =>
        document.id === updatedDocument.id
          ? updateDocumentRecord(document, updatedDocument, "Current User")
          : document
      )
    );
    setEditOpen(false);
    setSelectedDocument(null);
  };

  const handleDelete = (document) => {
    if (window.confirm(`Delete ${document.documentName}?`)) {
      setDocuments((prev) => prev.filter((item) => item.id !== document.id));
    }
  };

  const openModal = (document, setter) => {
    setSelectedDocument(document);
    setter(true);
  };

  const closeDocumentModal = (setter) => {
    setter(false);
    setSelectedDocument(null);
  };

  const handleExport = () => {
    const sectionName = activeSection?.title || moduleConfig.title;
    const fileName = `${moduleConfig.id}-${activeSection?.id || "all"}-documents.csv`.replace(/\s+/g, "_");

    exportDocuments(processedSectionDocuments, fileName);
    return sectionName;
  };

  const totalLabel = `${processedSectionDocuments.length} Document${processedSectionDocuments.length === 1 ? "" : "s"}`;

  return (
    <div className="eisf-module-workspace">
      <div className="eisf-module-header">
        <div>
          <div className="eisf-breadcrumb">
            <span>Studies</span>
            <span>›</span>
            <span>{studyCode || "P-2024-001"}</span>
            <span>›</span>
            <span>eISF</span>
            <span>›</span>
            <strong>{moduleConfig.title}</strong>
          </div>
          <h2>{moduleConfig.title}</h2>
          <p>{moduleConfig.description}</p>
        </div>

        {moduleOptions.length > 0 && (
          <label className="eisf-module-select">
            <span>Module</span>
            <select
              value={selectedModuleId || moduleConfig.id}
              onChange={(event) => onModuleChange?.(event.target.value)}
            >
              {moduleOptions.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.id} {module.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <DashboardCards documents={documents} cards={dashboardCards} variant="reference" />

      <div className="eisf-module-grid">
        <aside className="eisf-module-sections-card">
          <h3>Sections</h3>
          <div className="eisf-folder-summary">
            <span>{moduleConfig.sections.length} folders</span>
            <strong>{dashboard.totalDocuments} files</strong>
          </div>

          <div className="eisf-module-section-list">
            {moduleConfig.sections.map((section) => (
              <button
                type="button"
                key={section.id}
                className={`eisf-module-section-btn ${activeSection?.id === section.id ? "active" : ""}`}
                onClick={() => selectSection(section.id)}
              >
                <span className="eisf-module-section-title">
                  <span className="folder-icon" aria-hidden="true">▣</span>
                  {section.id} {section.title}
                </span>
                <span className="section-count">{folderCounts[section.id] || 0}</span>
              </button>
            ))}
          </div>

          {activeSection && (
            <div className="eisf-section-help">
              <h4>About this Section</h4>
              <p>{activeSection.description}</p>
              <button
                type="button"
                className="filing-guideline-btn"
                onClick={() => setGuidelineOpen(true)}
              >
                View Filing Guidelines ↗
              </button>
            </div>
          )}
        </aside>

        <section className="eisf-module-documents-card">
          <div className="eisf-documents-header">
            <div>
              <h3>{activeSection?.id} {activeSection?.title}</h3>
              <span>{totalLabel}</span>
            </div>

            <div className="eisf-documents-actions">
              <button type="button" onClick={handleExport}>⇩ Export</button>
              <button type="button" className="primary" onClick={() => setShowUpload(true)}>Upload</button>
              <button
                type="button"
                className="more-action"
                onClick={() => setShowFilters((current) => !current)}
                aria-label="Toggle filters"
                title="Toggle filters"
              >
                ⋯
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="eisf-documents-toolbar">
              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">Status: All</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="">Document Type: All</option>
                {typeOptions.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select value={versionFilter} onChange={(event) => setVersionFilter(event.target.value)}>
                <option value="">Version: All</option>
                {versionOptions.map((version) => (
                  <option key={version} value={version}>{version}</option>
                ))}
              </select>

              <button type="button" className="filter-action" onClick={clearFilters}>Reset</button>
            </div>
          )}

          <DocumentTable
            documents={pagination.documents}
            variant="reference"
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onView={(document) => openModal(document, setViewerOpen)}
            onHistory={(document) => openModal(document, setHistoryOpen)}
            onAudit={(document) => openModal(document, setAuditOpen)}
            onDownload={downloadDocument}
            onEdit={(document) => openModal(document, setEditOpen)}
            onDelete={handleDelete}
          />

          <div className="eisf-table-footer">
            <span>
              Showing {pagination.start} to {pagination.end} of {pagination.totalItems} documents
            </span>
            <div className="eisf-pagination-controls">
              <label>
                Rows
                <select
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                >
                  {DOCUMENT_PAGE_SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <div className="eisf-pagination">
                <button
                  type="button"
                  disabled={pagination.page === 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  ‹
                </button>
                {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    type="button"
                    key={pageNumber}
                    className={pagination.page === pageNumber ? "active" : ""}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <UploadDocumentModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onUpload={handleUpload}
        categoryOptions={categoryOptions}
        defaultCategory={activeSection?.title}
      />

      <DocumentViewer
        open={viewerOpen}
        document={selectedDocument}
        onClose={() => closeDocumentModal(setViewerOpen)}
        onDownload={downloadDocument}
      />

      <EditDocumentModal
        open={editOpen}
        document={selectedDocument}
        onClose={() => closeDocumentModal(setEditOpen)}
        onSave={handleSaveDocument}
      />

      <VersionHistoryModal
        open={historyOpen}
        document={selectedDocument}
        onClose={() => closeDocumentModal(setHistoryOpen)}
      />

      <AuditTrailModal
        open={auditOpen}
        document={selectedDocument}
        onClose={() => closeDocumentModal(setAuditOpen)}
      />

      <FilingGuidelineModal
        open={guidelineOpen}
        moduleConfig={moduleConfig}
        section={activeSection}
        onClose={() => setGuidelineOpen(false)}
      />
    </div>
  );
}
