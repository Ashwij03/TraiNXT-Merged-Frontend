import { useMemo, useState } from "react";
import DashboardLayout from "../../Components/dashboard/DashboardLayout";
import KPICard from "../../Components/dashboard/KPICard";
import DataTable from "../../Components/dashboard/DataTable";
import { getUsers } from "../../services/adminService";
import { removeUserPermissions } from "../../services/accessPermissionService";
import { ROLE_LABELS } from "../../services/roleService";
import "../../pages/Admin/AdminPage.css";
import "./AccessPermissions.css";

function UserManagement() {
  const [refreshKey, setRefreshKey] = useState(0);
  const allUsers = useMemo(() => {
    void refreshKey;
    return getUsers();
  }, [refreshKey]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const roles = useMemo(() => {
    const unique = Array.from(
      new Set(allUsers.map((user) => user.role).filter(Boolean))
    );
    return ["All", ...unique];
  }, [allUsers]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return allUsers.filter((user) => {
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesQuery =
        !query ||
        String(user.name || "").toLowerCase().includes(query) ||
        String(user.email || "").toLowerCase().includes(query) ||
        String(user.assignedSite || "").toLowerCase().includes(query);

      return matchesRole && matchesQuery;
    });
  }, [allUsers, roleFilter, searchTerm]);

  const approvedCount = allUsers.filter(
    (user) => user.approvalStatus === "Approved"
  ).length;
  const pendingCount = allUsers.filter(
    (user) => user.approvalStatus === "Pending"
  ).length;

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

  return (
    <DashboardLayout>
      <div className="admin-page">
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
        </div>

        <div className="admin-table-section">
          <DataTable
            title="User Directory"
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "role", label: "Role" },
              { key: "assignedSite", label: "Institution" },
              { key: "approvalStatus", label: "Approval" },
              { key: "accountStatus", label: "Account Status" },
              { key: "removePermission", label: "Remove Permission" }
            ]}
            data={filteredUsers.map((user) => ({
              name: user.name || "N/A",
              email: user.email || "N/A",
              role: ROLE_LABELS[user.role] || user.role || "N/A",
              assignedSite: user.assignedSite || "—",
              approvalStatus: user.approvalStatus || "Pending",
              accountStatus: user.accountStatus || "Inactive",
              removePermission: (
                <button
                  type="button"
                  className="permission-remove-btn"
                  onClick={() => handleRemovePermission(user.email)}
                >
                  Remove
                </button>
              )
            }))}
            emptyMessage="No users match the current search/filter"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default UserManagement;
