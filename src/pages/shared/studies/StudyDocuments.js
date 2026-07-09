import { useParams } from "react-router-dom";
import { useState } from "react";
import DocumentFolderManager from "../../../Components/common/DocumentFolderManager";


function StudyDocuments() {
  const { id } = useParams();
  const [searchText, setSearchText] = useState("");
  return (
  <div className="module-card">
    <h2>Study Folder</h2>

    {/* ===== START F3 CHANGES ===== */}
    <div className="study-files-search">
      <label htmlFor="study-file-search">
        <strong>Search Files</strong>
      </label>

      <input
        id="study-file-search"
        type="text"
        placeholder="Search files..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
    </div>
    {/* ===== END F3 CHANGES ===== */}

    <DocumentFolderManager
      sectionId="studyFolder"
      contextKey={id || "default"}
      title="Study Folder"
      studyCode={id}
      layout="vertical"
    />
  </div>
);

  // return (
  //   <div className="module-card">
  //     <h2>Study Folder</h2>
  //     <DocumentFolderManager
  //       sectionId="studyFolder"
  //       contextKey={id || "default"}
  //       title="Study Folder"
  //       studyCode={id}
  //       layout="vertical"
  //     />
  //   </div>
  // );
}

export default StudyDocuments;
