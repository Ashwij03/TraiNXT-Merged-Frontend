import React from 'react';
import AppLayout from './AppLayout';

function Files() {

  const files = [
    {
      document:'Protocol v2.0',
      status:'Approved'
    },
    {
      document:'Investigator Brochure',
      status:'Approved'
    },
    {
      document:'ICF Amendment',
      status:'Pending Review'
    }
  ];

  return (

    <AppLayout>

      <h1>Study Documents</h1>

      <table className="subjects-table">

        <thead>

          <tr>
            <th>Document</th>
            <th>Status</th>
          </tr>

        </thead>

        <tbody>

          {files.map((file) => (

            <tr key={file.document}>

              <td>{file.document}</td>
              <td>{file.status}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </AppLayout>

  );

}

export default Files;