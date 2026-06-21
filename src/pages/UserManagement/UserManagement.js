import { useState } from "react";

function UserManagement() {

  const [users, setUsers] = useState(
    JSON.parse(
      localStorage.getItem("users")
    ) || []
  );

  return (
    <div className="page-container">

      <h2>User Management</h2>

      <table>

        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>

        <tbody>

          {users.map((user, index) => (

            <tr key={index}>

              <td>{user.name}</td>

              <td>{user.email}</td>

              <td>{user.role}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default UserManagement;