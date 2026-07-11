import { useEffect, useMemo, useState } from "react";
import DashboardCards from "./components/DashboardCards";
import DocumentTable from "./components/DocumentTable";
import UploadDocumentModal from "./components/UploadDocumentModal";
import DocumentViewer from "./components/DocumentViewer";
import EditDocumentModal from "./components/EditDocumentModal";
import VersionHistoryModal from "./components/VersionHistoryModal";
import AuditTrailModal from "./components/AuditTrailModal";
import DOCUMENT_STATUS from "./Constants/documentStatus";
import "./EISFModuleWorkspace.css";

function normalizeDocument(document, section, moduleConfig, index = 0) {
  const documentName = document.documentName || document.name || section.title;
  const owner = document.uploadedBy || document.owner || "Study Staff";

  return {
      id: document.id || `${moduleConfig.id}-${section.id}-${index + 1}`,
      section: section.id,
      documentName,
      category: document.category || document.documentType || section.title,
      documentType: document.documentType || document.category || section.title,
      version: document.version || "1.0",
      status: document.status || DOCUMENT_STATUS.DRAFT,
      uploadedBy: owner,
      approvedBy: document.approvedBy || "-",
      modifiedDate: document.modifiedDate || "-",
      expiryDate: document.expiryDate || "-",
      fileName: document.fileName || `${documentName}.pdf`,
      fileSize: document.fileSize || "-",
      history: document.history,
      auditTrail: document.auditTrail,
  };
}

function buildInitialDocuments(moduleConfig, initialDocuments = null) {
  if (Array.isArray(initialDocuments)) {
    return initialDocuments.map((document, index) => {
      const section = moduleConfig.sections.find((item) => item.id === document.section) ||
        moduleConfig.sections[0] ||
        { id: "default", title: moduleConfig.title };

      return normalizeDocument(document, section, moduleConfig, index);
    });
  }

  return moduleConfig.sections.flatMap((section) =>
    (section.documents || []).map((document, index) =>
      normalizeDocument(document, section, moduleConfig, index)
    )
  );
}

function getStorageKey(moduleConfig, studyCode) {
  return `eisf:${studyCode || "default-study"}:${moduleConfig.id}:documents`;
}

function readStoredDocuments(moduleConfig, studyCode, fallbackDocuments) {
  try {
    const stored = window.localStorage.getItem(getStorageKey(moduleConfig, studyCode));
    if (!stored) return fallbackDocuments;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallbackDocuments;
  } catch (error) {
    return fallbackDocuments;
  }
}

function persistDocuments(moduleConfig, studyCode, documents) {
  try {
    window.localStorage.setItem(
      getStorageKey(moduleConfig, studyCode),
      JSON.stringify(documents)
    );
  } catch (error) {
    // Local storage is optional in embedded previews and private browsing.
  }
}

function getDashboardCards(documents) {
  const total = documents.length;
  const approved = documents.filter((doc) => doc.status === DOCUMENT_STATUS.APPROVED).length;
  const underReview = documents.filter((doc) =>
    [DOCUMENT_STATUS.PENDING, DOCUMENT_STATUS.UNDER_REVIEW, DOCUMENT_STATUS.UNDER_APPROVAL].includes(doc.status)
  ).length;
  const expired = documents.filter((doc) => doc.status === DOCUMENT_STATUS.EXPIRED).length;
  const completion = total ? Math.round((approved / total) * 100) : 0;
  const percent = (count) => (total ? `${Math.round((count / total) * 100)}%` : "0%");

  return [
    { key: "total", title: "Total Documents", value: total, detail: "Across all sections", icon: "□", color: "#2f80ed" },
    { key: "approved", title: "Approved", value: approved, detail: percent(approved), icon: "▤", color: "#2bb673" },
    { key: "underReview", title: "Under Review", value: underReview, detail: percent(underReview), icon: "◷", color: "#f5a524" },
    { key: "expired", title: "Expired", value: expired, detail: percent(expired), icon: "◴", color: "#ef5b65" },
    { key: "completion", title: "Section Completion", value: completion, suffix: "%", detail: "0 / 0 sections", color: "#2f80ed" },
  ];
}

function getCompletedSectionCount(sections, documents) {
  return sections.filter((section) => {
    const sectionDocuments = documents.filter((document) => document.section === section.id);

    return sectionDocuments.length > 0 &&
      sectionDocuments.every((document) => document.status === DOCUMENT_STATUS.APPROVED);
  }).length;
}

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
  const [documents, setDocuments] = useState(() => {
    const seedDocuments = buildInitialDocuments(moduleConfig, initialDocuments);
    return readStoredDocuments(moduleConfig, studyCode, seedDocuments);
  });
  const [selectedSectionId, setSelectedSectionId] = useState(
    activeSectionId || moduleConfig.sections[0]?.id
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [versionFilter, setVersionFilter] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);

  useEffect(() => {
    const seedDocuments = buildInitialDocuments(moduleConfig, initialDocuments);
    setDocuments(readStoredDocuments(moduleConfig, studyCode, seedDocuments));
    setSearch("");
    setStatusFilter("");
    setTypeFilter("");
    setVersionFilter("");
  }, [moduleConfig, initialDocuments, studyCode]);

  useEffect(() => {
    persistDocuments(moduleConfig, studyCode, documents);
  }, [documents, moduleConfig, studyCode]);

  useEffect(() => {
    const requestedSection = moduleConfig.sections.find(
      (section) => section.id === activeSectionId
    );

    setSelectedSectionId(requestedSection?.id || moduleConfig.sections[0]?.id);
  }, [activeSectionId, moduleConfig]);

  const activeSection = useMemo(
    () => moduleConfig.sections.find((section) => section.id === selectedSectionId) || moduleConfig.sections[0],
    [moduleConfig.sections, selectedSectionId]
  );

  const sectionDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return documents.filter((document) => {
      if (document.section !== activeSection?.id) return false;
      if (statusFilter && document.status !== statusFilter) return false;
      if (typeFilter && (document.documentType || document.category) !== typeFilter) return false;
      if (versionFilter && document.version !== versionFilter) return false;

      if (!query) return true;

      return [
        document.documentName,
        document.category,
        document.status,
        document.version,
        document.uploadedBy,
        document.fileName,
      ]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(query));
    });
  }, [activeSection, documents, search, statusFilter, typeFilter, versionFilter]);

  const statusOptions = useMemo(
    () => [...new Set(documents.map((document) => document.status))].filter(Boolean),
    [documents]
  );

  const categoryOptions = useMemo(
    () => moduleConfig.sections.map((section) => section.title),
    [moduleConfig.sections]
  );

  const typeOptions = useMemo(
    () => [...new Set(documents.map((document) => document.documentType || document.category))].filter(Boolean),
    [documents]
  );

  const versionOptions = useMemo(
    () => [...new Set(documents.map((document) => document.version))].filter(Boolean),
    [documents]
  );

  const dashboardCards = useMemo(() => {
    const cards = getDashboardCards(documents);
    const completedSections = getCompletedSectionCount(moduleConfig.sections, documents);
    const completionCard = cards.find((card) => card.key === "completion");

    if (completionCard) {
      completionCard.detail = `${completedSections} / ${moduleConfig.sections.length} sections`;
    }

    return cards;
  }, [documents, moduleConfig.sections]);

  const selectSection = (sectionId) => {
    setSelectedSectionId(sectionId);
    onSectionChange?.(sectionId);
  };

  const handleUpload = (formData) => {
    const newDocument = {
      id: `${moduleConfig.id}-${activeSection.id}-${Date.now()}`,
      section: activeSection.id,
      documentName: formData.documentName,
      category: formData.category || activeSection.title,
      documentType: formData.category || activeSection.title,
      version: formData.version || "1.0",
      status: DOCUMENT_STATUS.DRAFT,
      uploadedBy: "Current User",
      approvedBy: "-",
      modifiedDate: new Date().toLocaleDateString(),
      expiryDate: "-",
      fileName: formData.file?.name || `${formData.documentName}.pdf`,
      fileSize: formData.file?.size ? `${(formData.file.size / 1024).toFixed(1)} KB` : "-",
    };

    setDocuments((prev) => [newDocument, ...prev]);
  };

  const handleSaveDocument = (updatedDocument) => {
    setDocuments((prev) =>
      prev.map((document) =>
        document.id === updatedDocument.id ? updatedDocument : document
      )
    );
    setEditOpen(false);
    setSelectedDocument(null);
  };

  const openModal = (document, setter) => {
    setSelectedDocument(document);
    setter(true);
  };

  const closeDocumentModal = (setter) => {
    setter(false);
    setSelectedDocument(null);
  };

  const handleDelete = (document) => {
    if (window.confirm(`Delete ${document.documentName}?`)) {
      setDocuments((prev) => prev.filter((item) => item.id !== document.id));
    }
  };

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

          <div className="eisf-module-section-list">
            {moduleConfig.sections.map((section) => {
              const count = documents.filter((document) => document.section === section.id).length;

              return (
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
                  <span className="section-count">{count}</span>
                </button>
              );
            })}
          </div>

          {activeSection && (
            <div className="eisf-section-help">
              <h4>About this Section</h4>
              <p>{activeSection.description}</p>
              <button type="button" className="filing-guideline-btn">
                View Filing Guideline ↗
              </button>
            </div>
          )}
        </aside>

        <section className="eisf-module-documents-card">
          <div className="eisf-documents-header">
            <div>
              <h3>{activeSection?.id} {activeSection?.title}</h3>
              <span>{sectionDocuments.length} Documents</span>
            </div>

            <div className="eisf-documents-actions">
              <button type="button" onClick={() => alert("Export will be connected to backend service.")}>⇩ Export</button>
              <button type="button" className="primary" onClick={() => setShowUpload(true)}>Upload</button>
              <button type="button" className="more-action" onClick={() => alert("More actions will be connected to backend service.")}>⋯</button>
            </div>
          </div>

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

            <button type="button" className="filter-action">Filters</button>
          </div>

          <DocumentTable
            documents={sectionDocuments}
            variant="reference"
            onView={(document) => openModal(document, setViewerOpen)}
            onHistory={(document) => openModal(document, setHistoryOpen)}
            onAudit={(document) => openModal(document, setAuditOpen)}
            onDownload={(document) => alert(`Downloading ${document.fileName}`)}
            onEdit={(document) => openModal(document, setEditOpen)}
            onDelete={handleDelete}
          />

          <div className="eisf-table-footer">
            <span>Showing 1 to {sectionDocuments.length} of {sectionDocuments.length} documents</span>
            <div className="eisf-pagination">
              <button type="button" disabled>‹</button>
              <button type="button" className="active">1</button>
              <button type="button" disabled>›</button>
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
    </div>
  );
}
