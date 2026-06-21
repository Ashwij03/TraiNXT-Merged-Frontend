import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { initializeUserSession } from "./services/sessionService";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // 🔥 STRICT EMAIL RULE
  const emailRegex = /^(?=.*\d)[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ✅ EMAIL VALIDATION
  const validateUsername = (value) => {
    if (!value.trim()) {
      setUsernameError("Email is required");
      return false;
    } else if (!emailRegex.test(value)) {
      setUsernameError("Enter a valid email address.");
      return false;
    } else {
      setUsernameError("");
      return true;
    }
  };

  // ✅ PASSWORD VALIDATION
  const validatePassword = (value) => {
    if (!value) {
      setPasswordError("Password is required");
      return false;
    } else if (value.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return false;
    } else if (!/[A-Z]/.test(value)) {
      setPasswordError("Password must include at least one uppercase letter");
      return false;
    } else if (!/[a-z]/.test(value)) {
      setPasswordError("Password must include at least one lowercase letter");
      return false;
    } else if (!/[0-9]/.test(value)) {
      setPasswordError("Password must include at least one number");
      return false;
    } else if (!/[!@#$%^&*]/.test(value)) {
      setPasswordError("Password must include at least one special character");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  // 🚀 LOGIN HANDLER (UPDATED)
  const handleLogin = (e) => {
    e.preventDefault();

    const isEmailValid = validateUsername(username);
	
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) return;

    // 🔥 GET ALL USERS (ARRAY)
    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    // 🔍 FIND MATCHING USER
    const user = users.find(
      (u) => u.email === username && u.password === password
    );

	if (user) {
    // newly added
    if (
      user.role !== "Admin" &&
      user.approvalStatus !== "Approved"
    ) {

      setPasswordError(
        "Your account is waiting for Admin approval."
      );

      return;
    }
    // newly added till here
	  // 🔐 LOGIN SUCCESS
	  localStorage.setItem("isLoggedIn", "true");

	  // 🔥 STORE NAME FOR DASHBOARD
	  localStorage.setItem("userFullName", user.name);

    localStorage.removeItem("adminPreviewRole");

	  // ✅ ADD THIS LINE (THIS IS YOUR STEP-1 FIX)
	  localStorage.setItem("currentUser", JSON.stringify(user));
    initializeUserSession(user);

    // newly added

	  if (user.role === "Admin") {

      navigate(
        "/admin-dashboard",
        { replace: true }
      );
    
    } else if (
      user.role === "SiteStaff"
    ) {
    
      navigate(
        "/site-staff-dashboard",
        { replace: true }
      );
    
    } else if (
      user.role === "PI"
    ) {
    
      navigate(
        "/pi-dashboard",
        { replace: true }
      );
    
    } else if (
      user.role === "CRO"
    ) {
    
      navigate(
        "/cro-dashboard",
        { replace: true }
      );
    
    } else if (
      user.role === "Sponsor"
    ) {
    
      navigate(
        "/sponsor-dashboard",
        { replace: true }
      );
    
    } else {
    
      navigate(
        "/dashboard",
        { replace: true }
      );
    } // newly added till here
	} else {
      setPasswordError("Invalid email or password");
    }
  };

  return (
    <AuthLayout title="Welcome Back">
      <form onSubmit={handleLogin}>

        {/* SIGNUP LINK */}
        <p style={{ marginTop: "15px", fontSize: "14px", textAlign: "center" }}>
          Don’t have an account?{" "}
          <span
            style={{
              color: "#007bff",
              cursor: "pointer",
              fontWeight: "500"
            }}
            onClick={() => navigate("/register")}
          >
            Sign Up
          </span>
        </p>

        {/* EMAIL */}
        <div className="input-group">
          <label>Email</label>
          <input
            type="text"
            placeholder="Enter your email"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              validateUsername(e.target.value);
            }}
          />

          {usernameError && (
            <p style={{ color: "red", fontSize: "12px" }}>
              {usernameError}
            </p>
          )}
        </div>

        {/* PASSWORD */}
        <div className="input-group">
                
          <label>Password</label>
                
          <div className="password-box">
                
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(
                  e.target.value
                );
              }}
              onPaste={(e) =>
                e.preventDefault()
              }
              onCopy={(e) =>
                e.preventDefault()
              }
              onCut={(e) =>
                e.preventDefault()
              }
              onContextMenu={(e) =>
                e.preventDefault()
              }
            />
        
            <span
              className="toggle-text"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              {showPassword
                ? "Hide"
                : "Show"}
            </span>
              
          </div>
              
          <p
            className="forgot-password"
            onClick={() =>
              navigate("/forgot-password")
            }
          >
            Forgot Password?
          </p>
          
          {passwordError && (
            <p
              style={{
                color: "red",
                fontSize: "12px",
              }}
            >
              {passwordError}
            </p>
          )}
        
        </div>

        <button type="submit" className="auth-btn">
          Login
        </button>

        <div className="security-card">

          <div className="security-icon">
            🔐
          </div>

          <div>

            <h4>Secure Login</h4>

            <p>
              Your credentials are protected
              using encrypted authentication
              and secure access controls.
            </p>

          </div>

        </div>

        </form>
    </AuthLayout>
  );
}

export default Login;