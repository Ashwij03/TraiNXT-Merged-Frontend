import DocumentFolderManager from "../components/common/DocumentFolderManager";

export default function ERegDocuments({ contextKey = "default" }) {
  return (
    <DocumentFolderManager
      sectionId="eISF"
      contextKey={contextKey}
      title="Study Documents"
    />
  );
}
