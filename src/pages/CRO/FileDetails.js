import React, { useEffect, useState } from "react";
import CROSidebar from "./Components/CROSidebar";
import CRONavbar from "./Components/CRONavbar";
import RequestPermissionButton from "../../Components/common/RequestPermissionButton";

function readSharedFiles() {
  try {
    return JSON.parse(localStorage.getItem("files")) || [];
  } catch {
    return [];
  }
}

function FileDetails() {
  const [files, setFiles] = useState(readSharedFiles);

  useEffect(() => {
    const refresh = () => setFiles(readSharedFiles());
    window.addEventListener("files-updated", refresh);
    return () => window.removeEventListener("files-updated", refresh);
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
            <RequestPermissionButton
              action="Upload File"
              module="Files"
              label="+ Add File"
            />
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
