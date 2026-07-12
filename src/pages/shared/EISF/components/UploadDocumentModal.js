import { useEffect, useMemo, useState } from "react";
import { DOCUMENT_TYPE_OPTIONS } from "../Constants/documentTypes";
import "./UploadDocumentModal.css";

export default function UploadDocumentModal({
  open,
  onClose,
  onUpload,
  categoryOptions = [],
  defaultCategory = ""
}) {
  const [form, setForm] = useState({
    documentName: "",
    category: defaultCategory || "",
    version: "",
    comments: "",
    file: null
  });
  const [error, setError] = useState("");

  const categories = useMemo(() => {
    const options = Array.isArray(categoryOptions) ? categoryOptions : [];

    return options.length
      ? options
      : DOCUMENT_TYPE_OPTIONS;
  }, [categoryOptions]);

  useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...prev,
        category: defaultCategory || prev.category
      }));
      setError("");
    }
  }, [open, defaultCategory]);

  if (!open) return null;

  const submit = () => {
    if (!form.documentName || !form.category || !form.file) {
      setError("Please fill all mandatory fields.");
      return;
    }

    setError("");
    onUpload(form);

    setForm({
      documentName: "",
      category: defaultCategory || "",
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

          {error && <div className="upload-error">{error}</div>}

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
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
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
            type="button"
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
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
