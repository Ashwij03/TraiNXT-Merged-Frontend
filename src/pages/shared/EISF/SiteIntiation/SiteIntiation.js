import EISFModuleWorkspace from "../EISFModuleWorkspace";
import EISF_ASSIGNED_MODULES from "../eisfAssignedModuleConfig";
import "./SiteIntiation.css";

export default function SiteIntiation({ activeSectionId, studyCode, moduleOptions, selectedModuleId, onModuleChange, onSectionChange }) {
  return (
    <EISFModuleWorkspace
      moduleConfig={EISF_ASSIGNED_MODULES.siteInitiation}
      activeSectionId={activeSectionId}
      studyCode={studyCode}
      moduleOptions={moduleOptions}
      selectedModuleId={selectedModuleId}
      onModuleChange={onModuleChange}
      onSectionChange={onSectionChange}
    />
  );
}
