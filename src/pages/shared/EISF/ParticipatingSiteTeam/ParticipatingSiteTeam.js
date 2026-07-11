import "./ParticipatingSiteTeam.css";
import { useState, useMemo } from "react";
import { getParticipatingSiteDocuments } from "../services/eisfService";
import useDocuments from "../hooks/useDocuments";
import useSearch from "../hooks/useSearch";
import * as documentService from "../services/documentService";
import DOCUMENT_STATUS from "../Constants/documentStatus";
import DashboardCards from "../components/DashboardCards";
import DocumentToolbar from "../components/DocumentToolbar";
import DocumentTable from "../components/DocumentTable";
import UploadDocumentModal from "../components/UploadDocumentModal";
import DocumentViewer from "../components/DocumentViewer";
import EditDocumentModal from "../components/EditDocumentModal";
import VersionHistoryModal from "../components/VersionHistoryModal";
import AuditTrailModal from "../components/AuditTrailModal";
export default function ParticipatingSiteTeam() {
 
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDocument,setSelectedDocument]=useState(null);
  const [viewerOpen,setViewerOpen]=useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [historyOpen,setHistoryOpen]=useState(false);
  const [auditOpen,setAuditOpen]=useState(false);
 
const {
  documents,
  setDocuments,
} = useDocuments(getParticipatingSiteDocuments());

const {
  search,
  setSearch,
  filteredDocuments,
} = useSearch(documents);

const sections = [
  { id: "1.1", name: "Contact List" },
  { id: "1.2", name: "Signature & Delegation Log" },
  { id: "1.3", name: "CVs" },
  { id: "1.4", name: "GCP Training Certificates" },
  { id: "1.5", name: "EDC Training Certifications" },
  { id: "1.6", name: "Other Training Certificates" },
];

const [activeSection, setActiveSection] = useState("1.1");

const sectionDocuments = useMemo(() => {
  return filteredDocuments.filter(
    (doc) => doc.section === activeSection
  );
}, [filteredDocuments, activeSection]);

  const handleUpload = (formData) => {

 const newDocument = {
  id: Date.now(),
  documentName: formData.documentName,
  category: formData.category,
  section: "1.1",
  version: formData.version || "1.0",
  status: DOCUMENT_STATUS.DRAFT,
  uploadedBy: "Current User",
  approvedBy: "-",
  modifiedDate: new Date().toLocaleDateString(),
  expiryDate: "-",
  fileName: formData.file.name,
  fileSize: `${(formData.file.size / 1024).toFixed(1)} KB`,
};

  setDocuments((prev) => [newDocument, ...prev]);
};
const handleView = (doc) => {
  setSelectedDocument(doc);
  setViewerOpen(true);
};
const handleHistory = (doc) => {
    setSelectedDocument(doc);
    setHistoryOpen(true);
};
const handleAudit = (doc) => {
    setSelectedDocument(doc);
    setAuditOpen(true);
};

const handleDownload = (doc) => {
  alert(`Downloading ${doc.fileName}`);
};

const handleEdit = (doc) => {
  setSelectedDocument(doc);
  setEditOpen(true);
};

const handleDelete = (doc) => {
  if (window.confirm(`Delete ${doc.documentName}?`)) {
    setDocuments((prev) => prev.filter((x) => x.id !== doc.id));
  }
};
const handleSaveDocument = (updatedDocument) => {
  setDocuments((prev) =>
    prev.map((doc) =>
      doc.id === updatedDocument.id ? updatedDocument : doc
    )
  );

  setEditOpen(false);
  setSelectedDocument(null);
};


  return (
    <div className="pst-page">

      <div className="pst-header">

        <div>
          <h2>Participating Site Team</h2>
          <p>Manage participating site team documents.</p>
        </div>

      </div>
      <DashboardCards
    documents={filteredDocuments}
/>

     <DocumentToolbar
    search={search}
    onSearch={setSearch}
    onUpload={() => setShowUpload(true)}
/>
<div className="pst-sections">

    {sections.map((section) => (

        <button
            key={section.id}
            className={
                activeSection === section.id
                    ? "pst-section active"
                    : "pst-section"
            }
            onClick={() => setActiveSection(section.id)}
        >
            <span>{section.id}</span>

            {section.name}

            <span className="count">
                {
                    documents.filter(
                        d => d.section === section.id
                    ).length
                }
            </span>

        </button>

    ))}

</div>
  <DocumentTable
    documents={sectionDocuments}
    onView={handleView}
    onHistory={handleHistory}
    onAudit={handleAudit}
    onDownload={handleDownload}
    onEdit={handleEdit}
    onDelete={handleDelete}
/>
      <UploadDocumentModal
    open={showUpload}
    onClose={() => setShowUpload(false)}
    onUpload={handleUpload}
/>
<DocumentViewer
  open={viewerOpen}
  document={selectedDocument}
  onClose={() => {
    setViewerOpen(false);
    setSelectedDocument(null);
  }}
/>
<EditDocumentModal
  open={editOpen}
  document={selectedDocument}
  onClose={() => {
    setEditOpen(false);
    setSelectedDocument(null);
  }}
  onSave={handleSaveDocument}
/>
<VersionHistoryModal
    open={historyOpen}
    document={selectedDocument}
    onClose={()=>{
        setHistoryOpen(false);
        setSelectedDocument(null);
    }}
/>
<AuditTrailModal
    open={auditOpen}
    document={selectedDocument}
    onClose={()=>{
        setAuditOpen(false);
        setSelectedDocument(null);
    }}
/>

    </div>
  );
}