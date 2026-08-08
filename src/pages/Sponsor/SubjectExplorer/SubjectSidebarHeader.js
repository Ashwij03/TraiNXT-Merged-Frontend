import React from "react";
import {
  MdFolderOpen,
  MdUnfoldMore,
  MdUnfoldLess,
} from "react-icons/md";

/**
 * Subject Explorer - sidebar header.
 *
 * Title + subject count, plus expand-all / collapse-all controls.
 * Presentational: all state lives in SubjectExplorer.
 *
 * Phase 10: styled (via SubjectExplorer.css) to match the top-level
 * "SUBJECTS" header treatment used by the eISF sidebar title
 * (bold, sticky, bordered) - no eISF component or class is imported here.
 */
function SubjectSidebarHeader({
  subjectCount = 0,
  allExpanded = false,
  onExpandAll,
  onCollapseAll,
}) {
  return (
    <div className="sx-header">
      <div className="sx-header-title">
        <MdFolderOpen size={16} className="sx-header-icon" />
        <span>Subjects</span>
        <span className="sx-header-count">{subjectCount}</span>
      </div>

      <button
        type="button"
        className="sx-header-action"
        title={allExpanded ? "Collapse all" : "Expand all"}
        aria-label={allExpanded ? "Collapse all" : "Expand all"}
        onClick={allExpanded ? onCollapseAll : onExpandAll}
      >
        {allExpanded ? <MdUnfoldLess size={16} /> : <MdUnfoldMore size={16} />}
      </button>
    </div>
  );
}

export default SubjectSidebarHeader;
