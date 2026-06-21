import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../Components/dashboard/DashboardLayout";
import { getCRODashboardData } from "../../services/adminService";
import CROContracts from "./CROContracts";
import CRODetails from "./CRODetails";
import CROReport from "./CROReport";
import "./CROOversight.css";

function CROOverview() {
  const navigate = useNavigate();
  const { sites, studies, openComments } = getCRODashboardData();
  const [selectedCro, setSelectedCro] = useState(null);

  return (
    <DashboardLayout>
      <div className="cro-page">
        <div className="cro-page-header">
          <h1>CRO Overview</h1>
          <p>Contract oversight, monitoring metrics, and CRO performance</p>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <h2>{sites.length}</h2>
            <p>Monitored Sites</p>
          </div>
          <div className="kpi-card">
            <h2>{studies.length}</h2>
            <p>Active Studies</p>
          </div>
          <div className="kpi-card">
            <h2>{openComments.length}</h2>
            <p>Open Comments</p>
          </div>
          <div className="kpi-card">
            <h2>3</h2>
            <p>Active CRO Partners</p>
          </div>
        </div>

        <CROContracts onViewDetails={setSelectedCro} />

        {selectedCro && <CRODetails cro={selectedCro} />}

        <CROReport />

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button type="button" onClick={() => navigate("/sites")}>
              View Sites
            </button>
            <button type="button" onClick={() => navigate("/studies")}>
              View Studies
            </button>
            <button type="button" onClick={() => navigate("/comments")}>
              Open Comments
            </button>
            <button type="button" onClick={() => navigate("/reports")}>
              All Reports
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CROOverview;
