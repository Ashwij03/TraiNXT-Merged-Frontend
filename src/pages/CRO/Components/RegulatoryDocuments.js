import React from "react";

function RegulatoryDocuments() {
  return (
    <div className="page-container">
      <h1>Regulatory Documents</h1>

      <table className="data-table">
        <thead>
          <tr>
            <th>Document ID</th>
            <th>Document Name</th>
            <th>Version</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>DOC001</td>
            <td>Protocol</td>
            <td>1.0</td>
            <td>Approved</td>
            <td>View</td>
          </tr>

          <tr>
            <td>DOC002</td>
            <td>Consent Form</td>
            <td>2.0</td>
            <td>Approved</td>
            <td>View</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default RegulatoryDocuments;