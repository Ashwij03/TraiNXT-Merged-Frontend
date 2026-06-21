import React from "react";
import AppLayout from "./AppLayout";

const SiteDocuments = () => {
  return (
    <AppLayout>
      <div className="page-container">

        <h1>Site Documents</h1>

        <table className="report-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Version</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Protocol.pdf</td>
              <td>V1.0</td>
              <td>Approved</td>
            </tr>

            <tr>
              <td>ICF.pdf</td>
              <td>V3.0</td>
              <td>Approved</td>
            </tr>

            <tr>
              <td>Monitoring Report.pdf</td>
              <td>V2.0</td>
              <td>Uploaded</td>
            </tr>
          </tbody>

        </table>

      </div>
    </AppLayout>
  );
};

export default SiteDocuments;