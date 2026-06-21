// UPDATED: Delegation Log page in DashboardLayout with dynamic localStorage data

import { useState } from "react";
import DashboardLayout from "../../../Components/dashboard/DashboardLayout";
import DataTable from "../../../Components/dashboard/DataTable";
import KPICard from "../../../Components/dashboard/KPICard";
import { getDelegationLogs } from "../../../services/adminService";
import { getAssignedSite } from "../../../services/roleService";
import "../../../pages/Admin/AdminPage.css";
import "../../../Components/DelegationLog.css";

function DelegationLogPage() {
  const logs = getDelegationLogs();
  const assignedSite = getAssignedSite();
  const [selectedDelegate, setSelectedDelegate] = useState(logs[0] || null);
  const [tab, setTab] = useState("active");

  const activeDuties =
    selectedDelegate?.duties?.filter((duty) => duty.status === "active") || [];
  const inactiveDuties =
    selectedDelegate?.duties?.filter((duty) => duty.status !== "active") || [];
  const visibleDuties = tab === "active" ? activeDuties : inactiveDuties;

  return (
    <DashboardLayout>
      <div className="admin-page">
        <div className="admin-page-title">
          <h1>Delegation Log</h1>
          <p>
            Electronic delegation of duties and signatures
            {assignedSite ? ` — ${assignedSite}` : ""}
          </p>
        </div>

        <div className="admin-kpi-grid">
          <KPICard
            title="Delegates"
            value={logs.length}
            subtitle="Site Personnel"
            icon="👤"
          />
          <KPICard
            title="Active Duties"
            value={activeDuties.length}
            subtitle="Current Assignments"
            icon="✅"
          />
        </div>

        <div className="delegation-container">
          {logs.map((delegate) => (
            <div
              key={delegate.id}
              className="delegate-card"
              onClick={() => setSelectedDelegate(delegate)}
              style={{ cursor: "pointer" }}
            >
              <div className="delegate-user">
                <div className="delegate-image">
                  <img
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(delegate.name)}`}
                    alt=""
                  />
                </div>
                <div className="delegate-info">
                  <h3>{delegate.name}</h3>
                  <p>{delegate.role}</p>
                </div>
              </div>
              <div className="delegate-actions">
                <div className="duty-box">
                  {delegate.duties?.[0]?.code || "—"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedDelegate && (
          <div className="admin-table-section">
            <h3>
              {selectedDelegate.name} — Duty Assignments
            </h3>

            <div className="modal-tabs" style={{ marginBottom: 16 }}>
              <button
                type="button"
                className={tab === "active" ? "tab active" : "tab"}
                onClick={() => setTab("active")}
              >
                Active
              </button>
              <button
                type="button"
                className={tab === "inactive" ? "tab active" : "tab"}
                onClick={() => setTab("inactive")}
              >
                Inactive
              </button>
            </div>

            <DataTable
              columns={[
                { key: "code", label: "Duty" },
                { key: "description", label: "Description" },
                { key: "effectivePeriod", label: "Effective Period" },
                { key: "piSignature", label: "PI Signature" },
                { key: "userSignature", label: "User Signature" }
              ]}
              data={visibleDuties}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default DelegationLogPage;
