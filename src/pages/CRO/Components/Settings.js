import React, { useState } from "react";

function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  return (
    <div style={{ padding: "30px" }}>
      <h1>Settings</h1>

      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          marginTop: "20px",
          width: "500px"
        }}
      >
        <h3>Notification Settings</h3>

        <label>
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={() =>
              setEmailNotifications(!emailNotifications)
            }
          />
          Email Notifications
        </label>

        <br />
        <br />

        <label>
          <input
            type="checkbox"
            checked={smsNotifications}
            onChange={() =>
              setSmsNotifications(!smsNotifications)
            }
          />
          SMS Notifications
        </label>

        <hr />

        <h3>Password Settings</h3>

        <input
          type="password"
          placeholder="Current Password"
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="New Password"
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Confirm Password"
        />

        <br />
        <br />

 <button
   onClick={() => {
    localStorage.setItem(
      "croSettings",
      JSON.stringify({
        emailNotifications,
        smsNotifications
      })
    );

    alert("Settings Saved Successfully");
  }}
>
  Save Changes
</button>
      </div>
    </div>
  );
}

export default Settings;