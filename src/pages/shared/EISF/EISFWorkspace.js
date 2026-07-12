import EISFDashboard from "./EDashboard/EISFDashboard";
function EISFWorkspace({ studyCode }) {
  return (
  <div className="module-card">
    <EISFDashboard studyCode={studyCode} />
  </div>
);
}

export default EISFWorkspace;