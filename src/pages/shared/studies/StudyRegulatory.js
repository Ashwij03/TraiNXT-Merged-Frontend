import { useParams } from "react-router-dom";
import DocumentFolderManager from "../../../components/common/DocumentFolderManager";
import useCanEditStudyContent from "../../../hooks/useCanEditStudyContent";

function StudyRegulatory() {
  const { id } = useParams();
  // Vastav — Task 5: gate Regulatory file actions the same way the rest
  // of the Study Workspace gates edit access, so a Read-only CRO/Sponsor
  // user can view but not upload/edit/delete regulatory files.
  const canEdit = useCanEditStudyContent("Regulatory", id);

  return (
    <div className="module-card">
      <h2>Regulatory</h2>
      <DocumentFolderManager
  sectionId="regulatory"
  contextKey={id || "default"}
  title="Regulatory"
  studyCode={id}
  layout="column"
  readOnly={!canEdit}
/>
    </div>
  );
}

export default StudyRegulatory;
