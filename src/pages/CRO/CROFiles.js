import React, { useState } from "react";

import CROLayout from "./CROLayout";

import { useCROData } from "./CRODATAContext";

import EmptyState from "./EmptyState";

import CROModal from "./CROModal";



function CROFiles() {

  const { files, addFile, deleteFile, showAlert } = useCROData();

  const [searchTerm, setSearchTerm] = useState("");

  const [showUploadModal, setShowUploadModal] = useState(false);

  const [fileName, setFileName] = useState("");

  const [fileCategory, setFileCategory] = useState("");

  const [fileSite, setFileSite] = useState("");



  const filteredFiles = files.filter((f) =>

    f.name.toLowerCase().includes(searchTerm.toLowerCase())

  );



  const handleUpload = () => {

    if (!fileName.trim()) {

      showAlert("Validation", "Please enter a file name.");

      return;

    }

    addFile({

      name: fileName,

      category: fileCategory || "Other",

      site: fileSite,

      uploadedBy: "CRO User",

      size: "1.2 MB",

    });

    setFileName("");

    setFileCategory("");

    setFileSite("");

    setShowUploadModal(false);

    showAlert("Success", "File uploaded successfully.");

  };



  const handleDelete = (file) => {

    deleteFile(file.id);

    showAlert("Deleted", `${file.name} has been removed.`);

  };



  return (

    <CROLayout>

      <h1 style={{ marginBottom: "25px" }}>Files</h1>



      <div className="cro-summary-cards">

        <div className="dashboard-card">

          <h3>Total Files</h3>

          <h1>{files.length}</h1>

        </div>

        <div className="dashboard-card">

          <h3>Monitoring</h3>

          <h1>{files.filter((f) => f.category === "Monitoring").length}</h1>

        </div>

        <div className="dashboard-card">

          <h3>Regulatory</h3>

          <h1>{files.filter((f) => f.category === "Regulatory").length}</h1>

        </div>

        <div className="dashboard-card">

          <h3>Other</h3>

          <h1>

            {files.filter(

              (f) => !["Monitoring", "Regulatory"].includes(f.category)

            ).length}

          </h1>

        </div>

      </div>



      <div className="cro-panel">

        <div className="cro-panel-header">

          <input

            type="text"

            placeholder="Search Files..."

            value={searchTerm}

            onChange={(e) => setSearchTerm(e.target.value)}

            className="cro-input"

          />

          <h2>Files List</h2>

          <button

            type="button"

            className="cro-btn-primary"

            onClick={() => setShowUploadModal(true)}

          >

            + Upload File

          </button>

        </div>



        {filteredFiles.length === 0 ? (

          <EmptyState title="No Files Found" />

        ) : (

          <div className="cro-table-wrap">

            <table className="cro-data-table">

              <thead>

                <tr>

                  <th>File ID</th>

                  <th>Name</th>

                  <th>Category</th>

                  <th>Site</th>

                  <th>Uploaded On</th>

                  <th>Size</th>

                  <th>Actions</th>

                </tr>

              </thead>

              <tbody>

                {filteredFiles.map((file) => (

                  <tr key={file.id}>

                    <td>{file.id}</td>

                    <td>{file.name}</td>

                    <td>{file.category}</td>

                    <td>{file.site}</td>

                    <td>{file.uploadedOn}</td>

                    <td>{file.size}</td>

                    <td>

                      <button

                        type="button"

                        className="cro-btn-sm"

                        onClick={() =>

                          showAlert(

                            file.name,

                            `Category: ${file.category}\nSite: ${file.site}\nUploaded: ${file.uploadedOn}`

                          )

                        }

                      >

                        View

                      </button>

                      <button

                        type="button"

                        className="cro-btn-sm cro-btn-danger"

                        onClick={() => handleDelete(file)}

                        style={{ marginLeft: 8 }}

                      >

                        Delete

                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>



      <CROModal

        isOpen={showUploadModal}

        onClose={() => setShowUploadModal(false)}

        title="Upload File"

        footer={

          <>

            <button type="button" className="cro-btn cro-btn-secondary" onClick={() => setShowUploadModal(false)}>

              Cancel

            </button>

            <button type="button" className="cro-btn cro-btn-primary" onClick={handleUpload}>

              Upload

            </button>

          </>

        }

      >

        <input

          className="cro-input"

          placeholder="File Name"

          value={fileName}

          onChange={(e) => setFileName(e.target.value)}

        />

        <select

          className="cro-input"

          value={fileCategory}

          onChange={(e) => setFileCategory(e.target.value)}

        >

          <option value="">Select Category</option>

          <option value="Monitoring">Monitoring</option>

          <option value="Regulatory">Regulatory</option>

          <option value="Other">Other</option>

        </select>

        <input

          className="cro-input"

          placeholder="Site"

          value={fileSite}

          onChange={(e) => setFileSite(e.target.value)}

        />

        <input type="file" className="cro-input" />

      </CROModal>

    </CROLayout>

  );

}



export default CROFiles;

