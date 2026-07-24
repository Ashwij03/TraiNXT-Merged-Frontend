import React, { useEffect, useState } from "react";
import CROSidebar from "./CROSidebar";
import CRONavbar from "./CRONavbar";
import RequestPermissionButton from "../../components/common/RequestPermissionButton";
import { getAccessibleStudies, getCurrentUser } from "../../services/roleService";

function readSharedFiles() {
  try {
    return JSON.parse(localStorage.getItem("files")) || [];
  } catch {
    return [];
  }
}

function FileDetails() {
  const [files, setFiles] = useState(readSharedFiles);
  const [studies, setStudies] = useState(() => getAccessibleStudies(getCurrentUser()));
  const [uploadStudyCode, setUploadStudyCode] = useState("");

  useEffect(() => {
    const refresh = () => setFiles(readSharedFiles());
    window.addEventListener("files-updated", refresh);
    return () => window.removeEventListener("files-updated", refresh);
  }, []);

  useEffect(() => {
    const refreshStudies = () => setStudies(getAccessibleStudies(getCurrentUser()));
    window.addEventListener("studies-updated", refreshStudies);
    return () => window.removeEventListener("studies-updated", refreshStudies);
  }, []);

  const handleDownload = (file) => {
    if (!file.url) return;
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name || "download";
    link.click();
  };

  return (
    <div className="dashboard-layout">
      <CROSidebar />
      <div className="main-content">
        <CRONavbar />
        <div style={{ padding: "30px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h1>Files</h1>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <select
                value={uploadStudyCode}
                onChange={(event) => setUploadStudyCode(event.target.value)}
                aria-label="Select study for new file"
                style={{ padding: "8px" }}
              >
                <option value="">Select study…</option>
                {studies.map((study) => (
                  <option key={study.code} value={study.code}>
                    {study.name || study.code}
                  </option>
                ))}
              </select>
              {uploadStudyCode && (
                <RequestPermissionButton
                  action="Upload File"
                  module="Files"
                  studyCode={uploadStudyCode}
                  label="+ Add File"
                />
              )}
            </div>
          </div>

          {files.length === 0 ? (
            <p>No data available yet</p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {files.map((file) => (
                <div
                  key={file.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong>{file.name || file.fileName}</strong>
                    <p style={{ margin: "4px 0 0", color: "#64748b" }}>
                      {file.category || file.type || "General"}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button type="button" onClick={() => handleDownload(file)}>
                      Download
                    </button>
                    <RequestPermissionButton
                      action="Delete File"
                      module="Files"
                      recordId={file.id}
                      recordName={file.name || file.fileName}
                      studyCode={file.studyCode}
                      label="Delete"
                      variant="link"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileDetails;