import { FiFileText } from "react-icons/fi";

function EssentialDocumentsWidget({ stats, onNavigateToEisf }) {
  const uploaded = stats?.uploaded ?? 0;
  const expected = stats?.expected ?? 0;
  const percent = stats?.percent ?? 0;

  return (
    <button
      type="button"
      className="study-widget-card study-widget-clickable"
      onClick={onNavigateToEisf}
    >
      <div className="study-widget-header">
        <FiFileText />
        <h3>Essential Documents</h3>
      </div>
      {uploaded === 0 && expected === 0 ? (
        <p className="study-widget-empty">No documents uploaded yet</p>
      ) : (
        <>
          <div className="study-widget-progress">
            <div
              className="study-widget-progress-bar"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="study-widget-stat">
            {uploaded} of {expected} complete ({percent}%)
          </p>
        </>
      )}
    </button>
  );
}

export default EssentialDocumentsWidget;
