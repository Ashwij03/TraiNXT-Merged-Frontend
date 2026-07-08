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
  const sidebar = useRoleStudiesSidebar({ onNavigate });
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
  } = sidebar;

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
        <span
          className="sidebar-tree-label sidebar-tree-label--strong"
          onClick={handleStudyBinderClick}
        >
          Study Binder
        </span>
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
              const isStudyOpen = !!expandedStudies[studyKey];

              return (
                <div key={studyKey} className="sidebar-tree-study">
                  <div className="sidebar-tree-row sidebar-tree-row--branch">
                    <button
                      type="button"
                      className="sidebar-expander"
                      aria-label={
                        isStudyOpen
                          ? "Collapse study sections"
                          : "Expand study sections"
                      }
                      onClick={(event) => toggleStudyNode(studyKey, event)}
                    >
                      {isStudyOpen ? "−" : "+"}
                    </button>
                    <div
                      className="study-label-block"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigateToStudySection(studyKey, "overview");
                      }}
                    >
                      <span className="study-label-name">{studyName}</span>
                      {studyMeta && (
                        <small className="study-label-meta">{studyMeta}</small>
                      )}
                    </div>
                  </div>

                  {isStudyOpen && (
                    <div className="sidebar-tree-group sidebar-tree-group--sections">
                      {STUDY_SECTIONS.map((section) => {
                        const sectionKey = section.key;
                        const compositeKey = `${studyKey}__${sectionKey}`;
                        const isSectionOpen =
                          !!expandedStudySections[compositeKey];

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
                                <span
                                  className="sidebar-tree-label"
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
                                </span>
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
                                          <div
                                            className="sidebar-tree-row sidebar-tree-row--section-leaf sidebar-subject-row"
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
                                          </div>
                                          <div className="sidebar-subject-folders">
                                            {subjectFolders?.map((folder) => (
                                              <div
                                                key={`${subjectKey}-${folder.id}`}
                                                className="sidebar-tree-row sidebar-tree-row--folder-leaf"
                                                onClick={() => {
                                                  localStorage.setItem(
                                                    "selectedSubject",
                                                    JSON.stringify({
                                                      ...subject,
                                                      studyId: studyKey,
                                                    }),
                                                  );
                                                  handleNav(
                                                    `/study-dashboard/${studyKey}?tab=Subjects&subject=${subjectKey}&folder=${folder.id}`,
                                                  );
                                                }}
                                              >
                                                <span className="sidebar-tree-label">
                                                  {folder.name}
                                                </span>
                                              </div>
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
                                  {EISFMenuConfig.map((module) => (
                                    <div key={module.id}>
                                      <div
                                        className="sidebar-tree-row sidebar-tree-row--section-leaf sidebar-tree-row--expandable"
                                        onClick={() =>
                                          setExpandedStudySections((prev) => ({
                                            ...prev,
                                            [`${studyKey}-${module.id}`]:
                                              !prev[`${studyKey}-${module.id}`],
                                          }))
                                        }
                                      >
                                        <span>
                                          {module.id} {module.title}
                                        </span>
                                      </div>
                                      {expandedStudySections[
                                        `${studyKey}-${module.id}`
                                      ] && (
                                        <div className="sidebar-tree-group sidebar-tree-group--nested">
                                          {module.children.map((child) => (
                                            <div
                                              key={child.id}
                                              className="sidebar-tree-row sidebar-tree-row--folder-leaf eisf-module"
                                              onClick={() =>
                                                handleNav(child.path)
                                              }
                                            >
                                              <span>
                                                {child.id} {child.title}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <div
                            key={compositeKey}
                            className="sidebar-tree-row sidebar-tree-row--section-leaf"
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
                          </div>
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

      <div
        className={`sidebar-tree-row sidebar-tree-row--comments${
          isCommentsRoute ? " active" : ""
        }`}
        onClick={handleStudiesCommentsClick}
      >
        <span className="sidebar-tree-spacer" aria-hidden="true" />
        <span className="sidebar-tree-label">Comments</span>
      </div>
    </div>
  );
}

export default RoleStudiesSidebarTree;
