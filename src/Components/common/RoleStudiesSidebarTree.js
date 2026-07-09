import EISFMenuConfig from "../../pages/shared/EISF/Constants/EISFMenuConfig";
import {
  STUDY_SECTIONS,
  getStudyDisplayName,
  getStudyKey,
  getStudyMeta,
  useRoleStudiesSidebar,
} from "../../hooks/useRoleStudiesSidebar";
import "../../Components/dashboard/DashboardSidebar.css";

function RoleStudiesSidebarTree({ onNavigate, className = "" }) {
  const {
    studies,
    studiesOpen,
    studyBinderOpen,
    expandedStudies,
    expandedStudySections,
    setExpandedStudySections,
    isCommentsRoute,
    handleStudyBinderClick,
    handleStudiesCommentsClick,
    toggleStudyNode,
    toggleStudySection,
    navigateToStudySection,
    handleExpandableSectionLabelClick,
    handleSubjectClick,
    getSubjectSidebarFolders,
    getSubjectsForStudy,
    handleNav,
  } = useRoleStudiesSidebar({ onNavigate });

  if (!studiesOpen) {
    return null;
  }

  return (
    <div className={`sidebar-submenu sidebar-studies-tree ${className}`.trim()}>
      <div className="sidebar-tree-row sidebar-tree-row--branch">
        <button
          type="button"
          className="sidebar-expander"
          aria-label={
            studyBinderOpen ? "Collapse Study Binder" : "Expand Study Binder"
          }
          onClick={handleStudyBinderClick}
        >
          {studyBinderOpen ? "−" : "+"}
        </button>

        <button
          type="button"
          className="sidebar-tree-label sidebar-tree-label--strong sidebar-tree-label-button"
          onClick={handleStudyBinderClick}
        >
          Study Binder
        </button>
      </div>

      {studyBinderOpen && (
        <div className="sidebar-tree-group">
          {studies.length === 0 ? (
            <div className="sidebar-tree-row sidebar-tree-row--section-leaf">
              <span className="sidebar-tree-spacer" aria-hidden="true" />
              <span className="sidebar-tree-label">No data available yet</span>
            </div>
          ) : (
            studies.map((study) => {
              const studyKey = getStudyKey(study);
              const studyName = getStudyDisplayName(study);
              const studyMeta = getStudyMeta(study);
              const studySubjects = getSubjectsForStudy(study);
              const subjectCount = studySubjects.length;
              const isStudyOpen = Boolean(expandedStudies[studyKey]);

              return (
                <div key={studyKey} className="sidebar-tree-study">
                  <div className="sidebar-tree-row sidebar-tree-row--branch">
                    <button
                      type="button"
                      className="sidebar-expander"
                      aria-label={
                        isStudyOpen
                          ? `Collapse ${studyName}`
                          : `Expand ${studyName}`
                      }
                      onClick={(event) => toggleStudyNode(studyKey, event)}
                    >
                      {isStudyOpen ? "−" : "+"}
                    </button>

                    <button
                      type="button"
                      className="study-label-block study-label-block-button"
                      onClick={(event) => toggleStudyNode(studyKey, event)}
                    >
                      <span className="study-label-name">{studyName}</span>
                      {studyMeta && (
                        <small className="study-label-meta">{studyMeta}</small>
                      )}
                    </button>
                  </div>

                  {isStudyOpen && (
                    <div className="sidebar-tree-group sidebar-tree-group--sections">
                      {STUDY_SECTIONS.map((section) => {
                        const sectionKey = section.key;
                        const compositeKey = `${studyKey}__${sectionKey}`;
                        const isSectionOpen = Boolean(
                          expandedStudySections[compositeKey],
                        );

                        if (section.expandable) {
                          const displayLabel =
                            sectionKey === "subjects"
                              ? `Subjects (${subjectCount})`
                              : section.label;

                          return (
                            <div key={compositeKey}>
                              <div className="sidebar-tree-row sidebar-tree-row--section-leaf sidebar-tree-row--expandable">
                                <button
                                  type="button"
                                  className="sidebar-expander"
                                  aria-label={
                                    isSectionOpen
                                      ? `Collapse ${displayLabel}`
                                      : `Expand ${displayLabel}`
                                  }
                                  onClick={(event) =>
                                    toggleStudySection(
                                      studyKey,
                                      sectionKey,
                                      event,
                                    )
                                  }
                                >
                                  {isSectionOpen ? "−" : "+"}
                                </button>

                                <button
                                  type="button"
                                  className="sidebar-tree-label sidebar-tree-label-button"
                                  onClick={(event) =>
                                    handleExpandableSectionLabelClick(
                                      studyKey,
                                      sectionKey,
                                      isSectionOpen,
                                      event,
                                    )
                                  }
                                >
                                  {displayLabel}
                                </button>
                              </div>

                              {isSectionOpen && sectionKey === "subjects" && (
                                <div className="sidebar-tree-group sidebar-tree-group--nested">
                                  {studySubjects.length === 0 ? (
                                    <div className="sidebar-tree-row sidebar-tree-row--section-leaf">
                                      <span
                                        className="sidebar-tree-spacer"
                                        aria-hidden="true"
                                      />
                                      <span className="sidebar-tree-label">
                                        No data available yet
                                      </span>
                                    </div>
                                  ) : (
                                    studySubjects.map((subject) => {
                                      const subjectKey = String(
                                        subject.subjectId || subject.id,
                                      );

                                      const subjectFolders =
                                        getSubjectSidebarFolders(
                                          studyKey,
                                          subject,
                                        );

                                      return (
                                        <div
                                          key={`${studyKey}-${subjectKey}`}
                                          className="sidebar-subject-group"
                                        >
                                          <button
                                            type="button"
                                            className="sidebar-tree-row sidebar-tree-row--section-leaf sidebar-subject-row sidebar-tree-row-button"
                                            onClick={() =>
                                              handleSubjectClick(
                                                studyKey,
                                                subject,
                                              )
                                            }
                                          >
                                            <span className="sidebar-tree-label">
                                              {subjectKey}
                                            </span>
                                          </button>

                                          <div className="sidebar-subject-folders">
                                            {subjectFolders.map((folder) => (
                                              <button
                                                key={`${subjectKey}-${folder.id}`}
                                                type="button"
                                                className="sidebar-tree-row sidebar-tree-row--folder-leaf sidebar-tree-row-button"
                                                onClick={() => {
                                                  localStorage.setItem(
                                                    "selectedSubject",
                                                    JSON.stringify({
                                                      ...subject,
                                                      studyId: studyKey,
                                                    }),
                                                  );

                                                  handleNav(
                                                    `/study-dashboard/${encodeURIComponent(
                                                      studyKey,
                                                    )}?tab=Subjects&subject=${encodeURIComponent(
                                                      subjectKey,
                                                    )}&folder=${encodeURIComponent(
                                                      folder.id,
                                                    )}`,
                                                  );
                                                }}
                                              >
                                                <span className="sidebar-tree-label">
                                                  {folder.name}
                                                </span>
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              )}

                              {isSectionOpen && sectionKey === "eisf" && (
                                <div className="sidebar-tree-group sidebar-tree-group--nested">
                                  {EISFMenuConfig.map((module) => {
                                    const moduleKey = `${studyKey}__eisf__${module.id}`;
                                    const isModuleOpen = Boolean(
                                      expandedStudySections[moduleKey],
                                    );

                                    return (
                                      <div key={module.id}>
                                        <div className="sidebar-tree-row sidebar-tree-row--section-leaf sidebar-tree-row--expandable">
                                          <button
                                            type="button"
                                            className="sidebar-expander"
                                            aria-label={
                                              isModuleOpen
                                                ? `Collapse ${module.title}`
                                                : `Expand ${module.title}`
                                            }
                                            onClick={() =>
                                              setExpandedStudySections(
                                                (previous) => ({
                                                  ...previous,
                                                  [moduleKey]:
                                                    !previous[moduleKey],
                                                }),
                                              )
                                            }
                                          >
                                            {isModuleOpen ? "−" : "+"}
                                          </button>

                                          <button
                                            type="button"
                                            className="sidebar-tree-label sidebar-tree-label-button"
                                            onClick={() =>
                                              setExpandedStudySections(
                                                (previous) => ({
                                                  ...previous,
                                                  [moduleKey]:
                                                    !previous[moduleKey],
                                                }),
                                              )
                                            }
                                          >
                                            {module.id} {module.title}
                                          </button>
                                        </div>

                                        {isModuleOpen && (
                                          <div className="sidebar-tree-group sidebar-tree-group--nested">
                                            {module.children.map((child) => (
                                              <button
                                                key={child.id}
                                                type="button"
                                                className="sidebar-tree-row sidebar-tree-row--folder-leaf eisf-module sidebar-tree-row-button"
                                                onClick={() =>
                                                  handleNav(child.path)
                                                }
                                              >
                                                <span>
                                                  {child.id} {child.title}
                                                </span>
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <button
                            key={compositeKey}
                            type="button"
                            className="sidebar-tree-row sidebar-tree-row--section-leaf sidebar-tree-row-button"
                            onClick={() =>
                              navigateToStudySection(studyKey, sectionKey)
                            }
                          >
                            <span
                              className="sidebar-tree-spacer"
                              aria-hidden="true"
                            />
                            <span className="sidebar-tree-label">
                              {section.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      <button
        type="button"
        className={`sidebar-tree-row sidebar-tree-row--comments sidebar-tree-row-button${
          isCommentsRoute ? " active" : ""
        }`}
        onClick={handleStudiesCommentsClick}
      >
        <span className="sidebar-tree-spacer" aria-hidden="true" />
        <span className="sidebar-tree-label">Comments</span>
      </button>
    </div>
  );
}

export default RoleStudiesSidebarTree;