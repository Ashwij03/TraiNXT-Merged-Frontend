import React, { useState, useEffect, useRef } from "react";
import CROSidebar from "./Components/CROSidebar";
import CRONavbar from "./Components/CRONavbar";

function FileDetails() {
	const [files, setFiles] = useState(() => {
	  const saved = localStorage.getItem("croFiles");

	  return saved
	    ? JSON.parse(saved)
	    :
		[
		]
	});

  const [search, setSearch] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      "croFiles",
      JSON.stringify(files)
    );
  }, [files]);

  const handleAddFile = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    const newFile = {
      id: Date.now(),
      name: selectedFile.name,
      type: selectedFile.name.split(".").pop().toUpperCase(),
      date: new Date().toLocaleDateString(),
      url: URL.createObjectURL(selectedFile)
    };

    setFiles((prev) => [...prev, newFile]);
  };
  const handleDelete = (id) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleView = (file) => {
    if (file.url) {
      window.open(file.url, "_blank");
    } else {
      alert("No file available");
    }
  };
  
  const handleDownload = (file) => {
    const link = document.createElement("a");

    link.href = file.url;
    link.download = file.name;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              alignItems: "center"
            }}
          >
            <h1>File Management</h1>

            <button
              onClick={handleAddFile}
              style={{
                background: "#0d6efd",
                color: "#fff",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Upload File
            </button>
			
			<input
			  type="file"
			  ref={fileInputRef}
			  style={{ display: "none" }}
			  onChange={handleFileUpload}
			/>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              marginTop: "20px"
            }}
          >
		  <input
		    type="text"
		    placeholder="🔍 Search Files..."
		    value={search}
		    onChange={(e) => setSearch(e.target.value)}
		    style={{
		      padding: "12px",
		      width: "320px",
		      borderRadius: "8px",
		      border: "1px solid #dcdcdc"
		    }}
		  />

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse"
              }}
            >
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredFiles.map((file) => (
                  <tr key={file.id}>
                    <td>{file.name}</td>
                    <td>{file.type}</td>
                    <td>{file.date}</td>

					<td>
					  <button
					    onClick={() => handleView(file)}
					    style={{
					      background: "#0d6efd",
					      color: "white",
					      border: "none",
					      padding: "8px 14px",
					      borderRadius: "6px",
					      cursor: "pointer",
					      fontWeight: "600"
					    }}
					  >
					    👁 View
					  </button>

					  <button
					    onClick={() => handleDownload(file)}
					    style={{
					      background: "#198754",
					      color: "white",
					      border: "none",
					      padding: "8px 14px",
					      borderRadius: "6px",
					      cursor: "pointer",
					      marginLeft: "8px",
					      fontWeight: "600"
					    }}
					  >
					    ⬇ Download
					  </button>

					  <button
					    onClick={() => handleDelete(file.id)}
					    style={{
					      background: "#dc3545",
					      color: "white",
					      border: "none",
					      padding: "8px 14px",
					      borderRadius: "6px",
					      cursor: "pointer",
					      marginLeft: "8px",
					      fontWeight: "600"
					    }}
					  >
					    🗑 Delete
					  </button>
					</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>
      </div>
    </div>
  );
}

export default FileDetails;