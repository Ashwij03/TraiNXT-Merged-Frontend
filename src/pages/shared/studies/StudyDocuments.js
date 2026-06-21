import { useParams } from "react-router-dom";
import DocumentFolderManager from "../../../Components/common/DocumentFolderManager";

function StudyDocuments() {
  const { id } = useParams();

  return (
    <div className="module-card">
      <h2>Study Folder</h2>
      <DocumentFolderManager
        sectionId="studyFolder"
        contextKey={id || "default"}
        title="Study Folder"
        studyCode={id}
        layout="vertical"
      />
    </div>
  );
}

export default StudyDocuments;
