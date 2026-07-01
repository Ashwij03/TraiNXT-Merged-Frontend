import { useState } from "react";
import "./UploadDocumentModal.css";

export default function UploadDocumentModal({
  open,
  onClose,
  onUpload
}) {
  const [form, setForm] = useState({
    documentName: "",
    category: "",
    version: "",
    comments: "",
    file: null
  });

  if (!open) return null;

  const submit = () => {
    if (!form.documentName || !form.category || !form.file) {
      alert("Please fill all mandatory fields.");
      return;
    }

    onUpload(form);

    setForm({
      documentName: "",
      category: "",
      version: "",
      comments: "",
      file: null
    });

    onClose();
  };

  return (
    <div className="upload-backdrop">

      <div className="upload-modal">

        <div className="upload-header">
          Upload Document
        </div>

        <div className="upload-body">

          <label>Document Name *</label>

          <input
            value={form.documentName}
            onChange={(e) =>
              setForm({
                ...form,
                documentName: e.target.value
              })
            }
          />

          <label>Category *</label>

          <select
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value
              })
            }
          >
            <option value="">Select</option>
            <option>Contact</option>
            <option>Delegation</option>
            <option>Training</option>
            <option>CV</option>
          </select>

          <label>Version</label>

          <input
            value={form.version}
            onChange={(e) =>
              setForm({
                ...form,
                version: e.target.value
              })
            }
          />

          <label>Select File *</label>

          <input
            type="file"
            onChange={(e) =>
              setForm({
                ...form,
                file: e.target.files[0]
              })
            }
          />

          <label>Comments</label>

          <textarea
            rows="3"
            value={form.comments}
            onChange={(e) =>
              setForm({
                ...form,
                comments: e.target.value
              })
            }
          />

        </div>

        <div className="upload-footer">

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="save-btn"
            onClick={submit}
          >
            Upload
          </button>

        </div>

      </div>

    </div>
  );
}