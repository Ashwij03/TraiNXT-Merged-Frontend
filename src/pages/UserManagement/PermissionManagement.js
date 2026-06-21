function PermissionManagement() {

  const request =
    JSON.parse(
      localStorage.getItem(
        "requestedPermissions"
      )
    ) || [];

  const approve = () => {

    const currentUser =
      JSON.parse(
        localStorage.getItem(
          "currentUser"
        )
      );

    currentUser.permissions =
      request;

    localStorage.setItem(
      "currentUser",
      JSON.stringify(currentUser)
    );

    alert(
      "Permissions Approved"
    );
  };

  return (
    <div>

      <h2>
        Permission Management
      </h2>

      {request.map(permission => (

        <div key={permission}>
          {permission}
        </div>

      ))}

      <button
        onClick={approve}
      >
        Approve
      </button>

    </div>
  );
}

export default PermissionManagement;