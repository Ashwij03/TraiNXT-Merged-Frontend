import DocumentFolderManager from "../../../Components/common/DocumentFolderManager";

function EISFWorkspace({ studyCode }) {
  return (
    <div className="module-card">
      <h2>eISF</h2>

      <DocumentFolderManager
        sectionId="eISF"
        contextKey={studyCode || "default"}
        title="eISF"
        studyCode={studyCode}
        layout="vertical"
      />
    </div>
  );
}

export default EISFWorkspace;