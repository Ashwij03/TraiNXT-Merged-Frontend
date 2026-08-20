import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/shared/DashboardLayout";
import KPICard from "../../components/dashboard/shared/KPICard";
import DataTable from "../../components/dashboard/shared/DataTable";
import { getUsers } from "../../services/adminService";
import {
  removeUserPermissions,
  PERMISSION_REQUESTS_UPDATED,
} from "../../services/accessPermissionService";
import {
  getUserAccessLevel,
  setUserAccessLevel,
  ACCESS_LEVELS_UPDATED,
} from "../../services/accessLevelService";
import { ROLE_LABELS } from "../../services/roleService";
import ROLES from "../../constants/roles";
import "../../pages/Admin/AdminPage.css";
import "./AccessPermissions.css";

// Reuses the shared status-pill styles from AccessPermissions.css.
function AccessStatusPill({ status }) {
  let className = "status-pill";

  if (status === "Permissions Removed" || status === "Rejected") {
    className += " revoked";
  } else if (status === "Pending Approval") {
    className += " pending";
  } else {
    className += " inactive";
  }

  return <span className={className}>{status}</span>;
}

const ACCESS_CONTROLLED_ROLES = [ROLES.CRO, ROLES.SPONSOR];

function UserManagement() {
  const [refreshKey, setRefreshKey] = useState(0);
  const allUsers = useMemo(() => {
    void refreshKey;
    return getUsers();
  }, [refreshKey]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const navigate = useNavigate();

  // Stay in sync with changes made elsewhere (e.g. an admin approving or
  // changing a user's Access level from Permission Approval → Signup
  // Approvals) without requiring this page to remount.
  useEffect(() => {
    const refresh = () => setRefreshKey((value) => value + 1);

    window.addEventListener(ACCESS_LEVELS_UPDATED, refresh);
    window.addEventListener(PERMISSION_REQUESTS_UPDATED, refresh);

    return () => {
      window.removeEventListener(ACCESS_LEVELS_UPDATED, refresh);
      window.removeEventListener(PERMISSION_REQUESTS_UPDATED, refresh);
    };
  }, []);

  const roles = useMemo(() => {
    const unique = Array.from(
      new Set(allUsers.map((user) => user.role).filter(Boolean))
    );
    return ["All", ...unique];
  }, [allUsers]);

  // Derived from the actual accountStatus values present in the data
  // (e.g. Active / Inactive) — never a hardcoded status list.
  const statuses = useMemo(() => {
    const unique = Array.from(
      new Set(
        allUsers.map((user) => user.accountStatus || "Inactive").filter(Boolean)
      )
    );
    return ["All", ...unique];
  }, [allUsers]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return allUsers.filter((user) => {
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "All" ||
        (user.accountStatus || "Inactive") === statusFilter;
      const matchesQuery =
        !query ||
        String(user.name || "").toLowerCase().includes(query) ||
        String(user.email || "").toLowerCase().includes(query) ||
        String(user.assignedSite || "").toLowerCase().includes(query);

      return matchesRole && matchesStatus && matchesQuery;
    });
  }, [allUsers, roleFilter, statusFilter, searchTerm]);

  const approvedCount = allUsers.filter(
    (user) => user.approvalStatus === "Approved"
  ).length;
  const pendingCount = allUsers.filter(
    (user) => user.approvalStatus === "Pending"
  ).length;

  // Access History — derived entirely from the real user/permission
  // records stored in the app. A user lands here when they currently
  // have no active access: permissions were removed by an admin
  // (Revoked), registration was rejected, the account is inactive, or
  // approval is still pending. Nothing is hardcoded.
  const accessHistory = useMemo(() => {
    const entries = [];
    const seenEmails = new Set();

    allUsers.forEach((user) => {
      const email = String(user.email || "");
      if (!email || seenEmails.has(email)) {
        return;
      }

      const approval = String(user.approvalStatus || "").toLowerCase();
      const account = String(user.accountStatus || "inactive").toLowerCase();

      let status = "";
      let reason = "";

      if (approval === "revoked") {
        status = "Permissions Removed";
        reason = "All permissions were removed by an administrator";
      } else if (approval === "rejected") {
        status = "Rejected";
        reason = "Registration was rejected by an administrator";
      } else if (approval === "pending") {
        status = "Pending Approval";
        reason = "Awaiting administrator approval";
      } else if (account !== "active") {
        status = "Inactive";
        reason = "Account is not active";
      } else {
        return;
      }

      seenEmails.add(email);

      entries.push({
        id: user.id || email,
        name: user.name || "N/A",
        email,
        role: ROLE_LABELS[user.role] || user.role || "N/A",
        institution: user.assignedSite || user.orgType || "—",
        status,
        reason,
        updatedOn: user.lastPermissionUpdate || user.permissionRequestDate || "",
        priority:
          status === "Permissions Removed"
            ? 3
            : status === "Rejected"
              ? 2
              : status === "Pending Approval"
                ? 1
                : 0
      });
    });

    return entries
      .sort(
        (a, b) =>
          b.priority - a.priority ||
          String(a.name).localeCompare(String(b.name))
      )
      .map(({ priority, ...entry }) => entry);
  }, [allUsers]);

  const handleRemovePermission = (userEmail) => {
    if (
      !window.confirm(
        "Remove all permissions for this user? They will need to request access again."
      )
    ) {
      return;
    }

    removeUserPermissions(userEmail);
    setRefreshKey((value) => value + 1);
  };

  const handleAccessChange = useCallback((email, role, level) => {
    setUserAccessLevel(email, level, role);
    setRefreshKey((value) => value + 1);
  }, []);

  return (
    <DashboardLayout>
      <div className="admin-page tnxt-compact">
        <div className="admin-page-title">
          <h1>User Management</h1>
          <p>Manage user accounts, roles, and site assignments.</p>
        </div>

        <div className="admin-kpi-grid">
          <KPICard
            title="Total Users"
            value={allUsers.length}
            subtitle="Registered Accounts"
            icon="👤"
          />
          <KPICard
            title="Approved"
            value={approvedCount}
            subtitle="Active Access"
            icon="✅"
          />
          <KPICard
            title="Pending"
            value={pendingCount}
            subtitle="Awaiting Approval"
            icon="🛡️"
            onClick={() => navigate("/access-permission")}
          />
          <KPICard
            title="No Access"
            value={accessHistory.length}
            subtitle="Inactive or Revoked"
            icon="🔒"
          />
        </div>

        <div className="user-management-toolbar">
          <input
            type="text"
            className="user-management-search"
            placeholder="Search by name, email, or site..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <select
            className="user-management-role-filter"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role === "All" ? "All Roles" : ROLE_LABELS[role] || role}
              </option>
            ))}
          </select>

          <select
            className="user-management-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by account status"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "All" ? "All Status" : status}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-table-section">
          <DataTable
            className="ctms-standard-table"
            title="User Directory"
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "role", label: "Role" },
              { key: "assignedSite", label: "Institution" },
              { key: "approvalStatus", label: "Approval" },
              { key: "accountStatus", label: "Account Status" },
              { key: "access", label: "Access", width: "220px" },
              { key: "removePermission", label: "Remove Permission" }
            ]}
            data={filteredUsers.map((user) => {
              const isAccessControlled = ACCESS_CONTROLLED_ROLES.includes(user.role);
              const currentLevel = getUserAccessLevel(user.email, user.role);

              return {
                name: user.name || "N/A",
                email: user.email || "N/A",
                role: ROLE_LABELS[user.role] || user.role || "N/A",
                assignedSite: user.assignedSite || "—",
                approvalStatus: user.approvalStatus || "Pending",
                accountStatus: user.accountStatus || "Inactive",
                access: isAccessControlled ? (
                  <div className="access-checkbox-group">
                    <label className="access-checkbox-label">
                      <input
                        type="checkbox"
                        checked={currentLevel === "Read" || currentLevel === "Read and Write" || currentLevel === "Edit"}
                        onChange={() => handleAccessChange(user.email, user.role, "Read")}
                      />
                      <span>Read</span>
                    </label>
                    <label className="access-checkbox-label">
                      <input
                        type="checkbox"
                        checked={currentLevel === "Read and Write" || currentLevel === "Edit"}
                        onChange={() => handleAccessChange(user.email, user.role, "Read and Write")}
                      />
                      <span>Read and Write</span>
                    </label>
                    <label className="access-checkbox-label">
                      <input
                        type="checkbox"
                        checked={currentLevel === "Edit"}
                        onChange={() => handleAccessChange(user.email, user.role, "Edit")}
                      />
                      <span>Edit</span>
                    </label>
                  </div>
                ) : (
                  <span className="access-full-badge">Full Access</span>
                ),
                removePermission: (
                  <button
                    type="button"
                    className="permission-remove-btn"
                    onClick={() => handleRemovePermission(user.email)}
                  >
                    Remove
                  </button>
                )
              };
            })}
            emptyMessage="No users match the current search/filter"
            pagination
          />
        </div>

        <div className="admin-table-section user-management-history-section">
          <div className="user-management-history-summary">
            <p>
              <strong>{accessHistory.length}</strong>
              {accessHistory.length === 1
                ? " user has no active access"
                : " users have no active access"}
            </p>
          </div>

          <DataTable
            className="ctms-standard-table"
            title="Access History"
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "role", label: "Role" },
              { key: "institution", label: "Institution" },
              { key: "status", label: "Access Status" },
              { key: "reason", label: "Reason" },
              { key: "updatedOn", label: "Last Updated" }
            ]}
            data={accessHistory.map((entry) => ({
              ...entry,
              status: <AccessStatusPill status={entry.status} />,
              updatedOn: entry.updatedOn
                ? new Date(entry.updatedOn).toLocaleDateString()
                : "—"
            }))}
            emptyMessage="No inactive users or removed permissions yet"
            pagination
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default UserManagement;