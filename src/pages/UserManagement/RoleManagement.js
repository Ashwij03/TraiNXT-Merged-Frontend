function RoleManagement() {

  const roles = [
    "Admin",
    "SiteStaff",
    "PI",
    "CRO",
    "Sponsor"
  ];

  return (
    <div>

      <h2>
        Role Management
      </h2>

      {roles.map(role => (

        <div key={role}>
          {role}
        </div>

      ))}

    </div>
  );
}

export default RoleManagement;