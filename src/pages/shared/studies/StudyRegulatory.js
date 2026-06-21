import { useParams } from "react-router-dom";
import DocumentFolderManager from "../../../Components/common/DocumentFolderManager";

function StudyRegulatory() {
  const { id } = useParams();

  return (
    <div className="module-card">
      <h2>Regulatory</h2>
      <DocumentFolderManager
        sectionId="regulatory"
        contextKey={id || "default"}
        title="Regulatory"
        studyCode={id}
        layout="vertical"
      />
    </div>
  );
}

export default StudyRegulatory;
