import React from "react";

function Profile() {

  const user =
    JSON.parse(localStorage.getItem("currentUser"));

  return (
    <div style={{ padding: "30px" }}>

      <h1>Profile</h1>

      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          marginTop: "20px"
        }}
      >
        <p><b>Name:</b> {user?.name}</p>

        <p><b>Email:</b> {user?.email}</p>

        <p><b>Role:</b> {user?.role}</p>

        <p><b>Organization:</b> {user?.orgType}</p>
      </div>

    </div>
  );
}

export default Profile;