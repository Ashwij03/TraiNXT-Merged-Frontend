import DocumentFolderManager from "../../../Components/common/DocumentFolderManager";
import "./SubjectDocuments.css";

function SubjectDocuments({ subject }) {
  const subjectId = subject?.subjectId || subject?.id || "unknown";

  return (
    <div className="subject-documents">
      <DocumentFolderManager
        sectionId="subjects"
        contextKey={subjectId}
        title="Subject Documents"
      />
    </div>
  );
}

export default SubjectDocuments;
