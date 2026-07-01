import React, { useState } from "react";
import CROLayout from "./CROLayout";
import { useCROData } from "./CRODATAContext";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import CROModal from "./CROModal";

function CRORegulatoryDocuments() {
  const { documents, addDocument, updateDocument, showAlert } = useCROData();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [form, setForm] = useState({ docName: "", docSite: "", docVersion: "" });

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const approvedCount = documents.filter((d) => d.status === "Approved").length;
  const pendingCount = documents.filter((d) => d.status === "Pending").length;
  const expiringCount = documents.filter(doc => {
  const expiry = new Date(doc.expiry);
  const today = new Date();

  const diffDays = Math.ceil(
    (expiry - today) / (1000 * 60 * 60 * 24)
  );

  return diffDays >= 0 && diffDays <= 30;
}).length;
  const expiringSoon = documents.filter((d) => {
    const expiry = new Date(d.expiry);
    const in90Days = new Date();
    in90Days.setDate(in90Days.getDate() + 90);
    return expiry <= in90Days && d.status !== "Expired";
  }).length;

  const saveDocument = () => {
    addDocument({
      id: `DOC-${String(documents.length + 1).padStart(3, "0")}`,
      name: form.docName,
      site: form.docSite,
      version: form.docVersion,
      expiry: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
      status: "Pending",
    });
    setForm({ docName: "", docSite: "", docVersion: "" });
    setShowUploadModal(false);
    showAlert("Success", "Document uploaded successfully.");
  };

  const handleView = (doc) => {
    setSelectedDoc(doc);
    setShowViewModal(true);
  };

  const handleApprove = () => {
    if (selectedDoc) {
      updateDocument(selectedDoc.id, { status: "Approved" });
      setShowViewModal(false);
      showAlert("Approved", `${selectedDoc.name} has been approved.`);
    }
  };

  return (
    <CROLayout>
      <h1>Regulatory Documents</h1>

    <div className="cro-stats-grid">
  <div className="cro-card">
    <h3>Total Documents</h3>
    <h2>{documents.length}</h2>
  </div>

  <div className="cro-card">
    <h3>Approved</h3>
    <h2>{approvedCount}</h2>
  </div>

  <div className="cro-card">
    <h3>Pending Review</h3>
    <h2>{pendingCount}</h2>
  </div>

  <div className="cro-card">
    <h3>Expiring Soon</h3>
    <h2>{expiringCount}</h2>
  </div>
</div>

      <div className="cro-panel">
        <div className="cro-panel-header">
          <div className="cro-panel-filters">
            <input type="text" placeholder="Search Document..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="cro-input" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="cro-input">
              <option value="All">All</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          <h2></h2>
          <button type="button" className="cro-btn-primary-inline" onClick={() => setShowUploadModal(true)}>+ Upload Document</button>
        </div>

        {filteredDocuments.length === 0 ? (
          <EmptyState title="No Documents Found" />
        ) : (
          <div className="table-scroll-wrap">
            <table className="cro-table">
              <thead>
                <tr>
                  <th>Document ID</th>
                  <th>Name</th>
                  <th>Site</th>
                  <th>Version</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.id}</td>
                    <td>{doc.name}</td>
                    <td>{doc.site}</td>
                    <td>{doc.version}</td>
                    <td>{doc.expiry}</td>
                    <td><StatusBadge status={doc.status} /></td>
                    <td>
                      <button type="button" className="cro-btn-primary-inline" onClick={() => handleView(doc)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CROModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Regulatory Document"
        footer={<><button type="button" className="cro-btn cro-btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button><button type="button" className="cro-btn cro-btn-primary" onClick={saveDocument}>Upload</button></>}>
        <input className="cro-input" placeholder="Document Name" value={form.docName} onChange={(e) => setForm({ ...form, docName: e.target.value })} />
        <input type="file" className="cro-input" />
        <input className="cro-input" placeholder="Site" value={form.docSite} onChange={(e) => setForm({ ...form, docSite: e.target.value })} />
        <input className="cro-input" placeholder="Version" value={form.docVersion} onChange={(e) => setForm({ ...form, docVersion: e.target.value })} />
      </CROModal>

      <CROModal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title={selectedDoc?.name || "Document"}
        footer={selectedDoc?.status === "Pending" ? <button type="button" className="cro-btn cro-btn-primary" onClick={handleApprove}>Approve</button> : null}>
        {selectedDoc && (
          <div>
            <p><strong>ID:</strong> {selectedDoc.id}</p>
            <p><strong>Site:</strong> {selectedDoc.site}</p>
            <p><strong>Version:</strong> {selectedDoc.version}</p>
            <p><strong>Expiry:</strong> {selectedDoc.expiry}</p>
            <p><strong>Status:</strong> <StatusBadge status={selectedDoc.status} /></p>
          </div>
        )}
      </CROModal>
    </CROLayout>
  );
}

export default CRORegulatoryDocuments;
