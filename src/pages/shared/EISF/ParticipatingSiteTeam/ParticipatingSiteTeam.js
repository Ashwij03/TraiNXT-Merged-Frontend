import { useMemo } from "react";
import "./ParticipatingSiteTeam.css";
import EISFModuleWorkspace from "../EISFModuleWorkspace";
import EISFMenuConfig from "../Constants/EISFMenuConfig";
import { getParticipatingSiteDocuments } from "../services/eisfService";

export default function ParticipatingSiteTeam({
  activeSectionId,
  studyCode,
  moduleOptions,
  selectedModuleId,
  onModuleChange,
  onSectionChange,
}) {
  const moduleConfig = useMemo(() => {
    const module = EISFMenuConfig.find((item) => item.id === "1.0");

    return {
      id: module.id,
      title: module.title,
      description: "Manage and maintain documents related to the participating site research team.",
      sections: module.children.map((section) => ({
        id: section.id,
        title: section.title,
        description:
          section.description ||
          "Documents to be filed in this section include current, superseded and supporting records for the selected eISF folder.",
      })),
    };
  }, []);

  const documents = useMemo(() => getParticipatingSiteDocuments(), []);

  return (
    <EISFModuleWorkspace
      moduleConfig={moduleConfig}
      activeSectionId={activeSectionId}
      studyCode={studyCode}
      initialDocuments={documents}
      moduleOptions={moduleOptions}
      selectedModuleId={selectedModuleId}
      onModuleChange={onModuleChange}
      onSectionChange={onSectionChange}
    />
  );
}
