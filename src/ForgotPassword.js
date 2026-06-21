import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";

function ForgotPassword() {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const handleReset = () => {

    const users =
      JSON.parse(
        localStorage.getItem("users")
      ) || [];

    const userIndex =
      users.findIndex(
        (u) => u.email === email
      );

    if (userIndex === -1) {

      setMessage(
        "Email not registered"
      );

      return;
    }

    users[userIndex].password =
      newPassword;

    localStorage.setItem(
      "users",
      JSON.stringify(users)
    );

    setMessage(
      "Password updated successfully!"
    );

    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (

    <AuthLayout title="Reset Password">

      <div className="input-group">

        <label>Email</label>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
        />

      </div>

      <div className="input-group">

        <label>
          New Password
        </label>

        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) =>
            setNewPassword(
              e.target.value
            )
          }
        />

      </div>

      <button
        className="auth-btn"
        onClick={handleReset}
      >
        Reset Password
      </button>
              
      <div className="login-section">
              
        <span>
          Remember your password?
        </span>
              
        <button
          type="button"
          className="login-link-btn"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </button>
              
      </div>
              
      {message && (
        <p
          style={{
            textAlign: "center",
            marginTop: "15px",
            color:
              message.includes(
                "success"
              )
                ? "green"
                : "red",
          }}
        >
          {message}
        </p>
      )}

    </AuthLayout>
  );
}

export default ForgotPassword;