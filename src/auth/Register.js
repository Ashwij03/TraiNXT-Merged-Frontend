import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import "./Auth.css";

function Register() {

  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [password, setPassword] = useState("");
  const [orgType, setOrgType] = useState("");
  const [role, setRole] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  const generateUsername = (fname, lname) => {

    if (fname && lname) {

      setUsername(
        fname.charAt(0).toLowerCase() +
        lname.toLowerCase() +
        "01"
      );
    }
  };

  const capitalize = (value) =>
    value.charAt(0).toUpperCase() +
    value.slice(1);

  const validateEmail = (value) => {

    setEmail(value);

    const regex =
      /^(?=.*\d)[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value.trim()) {

      setEmailError("Email is required");

    } else if (!regex.test(value)) {

      setEmailError(
        "Enter a valid email address"
      );

    } else {

      setEmailError("");
    }
  };

  const validatePassword = (pwd) => {

    setPassword(pwd);

    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!regex.test(pwd)) {

      setPasswordError(
        "Min 8 chars, upper, lower, number & special char"
      );

    } else {

      setPasswordError("");
    }

    if (
      confirmPassword &&
      pwd !== confirmPassword
    ) {

      setConfirmError(
        "Passwords do not match"
      );

    } else {

      setConfirmError("");
    }
  };

  const validateConfirmPassword = (value) => {

    setConfirmPassword(value);

    setConfirmError(
      value !== password
        ? "Passwords do not match"
        : ""
    );
  };

  const handleSignup = (e) => {

   

    e.preventDefault();

    if (
      emailError ||
      passwordError ||
      confirmError
    ) {

      alert("Please fix errors");

      return;
    }

    let users = [];

    try {

      const storedUsers =
        localStorage.getItem("users");

      users = storedUsers
        ? JSON.parse(storedUsers)
        : [];

    } catch (error) {

      users = [];
    }

    const exists = users.some(
      (u) => u.email === email
    );

    if (exists) {

      setEmailError(
        "You are already registered. Please login."
      );

      return;
    }

 // newly added Create new user object

    users.push({
      id: Date.now(),

      email,

      password,

      name: firstName + " " + lastName,

      orgType,

      role,

      // UPDATED: persist assigned site for site-scoped RBAC
      assignedSite: orgType,

      approvalStatus:
        role === "Admin"
          ? "Approved"
          : "Pending",
      
      accountStatus:
        role === "Admin"
          ? "Active"
          : "Inactive",

      permissions:
        role === "Admin"
          ? ["*"]
          : [],

      requestedPermissions: [],

        permissionRequestDate:
          null,
            
        lastPermissionUpdate:
          null
    });  // newly added till here

    localStorage.setItem(
      "users",
      JSON.stringify(users)
    );

    alert("Registration successful!");

    navigate("/login", {
      replace: true
    });
  };

  // ROLE OPTIONS //newly added
  const roleOptions = {
    "Apollo Hospitals": [
      "Admin",
      "PI",
      "SiteStaff"
    ],
  
    "Fortis Healthcare": [
      "Admin",
      "PI",
      "SiteStaff"
    ],
  
    "Manipal Hospitals": [
      "Admin",
      "PI",
      "SiteStaff"
    ],
  
    "Max Healthcare": [
      "Admin",
      "PI",
      "SiteStaff"
    ],
  
    "Aster Hospitals": [
      "Admin",
      "PI",
      "SiteStaff"
    ],
  
    IQVIA: [
      "CRO"
    ],
  
    "ICON plc": [
      "CRO"
    ],
  
    Parexel: [
      "CRO"
    ],
  
    "Syneos Health": [
      "CRO"
    ],
  
    Medpace: [
      "CRO"
    ],

    "Pfizer Inc.": [
      "Sponsor"
    ],

    "Novartis AG": [
      "Sponsor"
    ],

    "Roche": [
      "Sponsor"
    ],

    "AstraZeneca": [
      "Sponsor"
    ],

    "Merck & Co.": [
      "Sponsor"
    ]
  }; // newly added till here
  return (

    <AuthLayout title="Create Account">

      <form onSubmit={handleSignup}>

        {/* FIRST NAME */}
        <div className="input-group">

          <label>First Name</label>

          <input
            value={firstName}
            onChange={(e) => {

              const val =
                capitalize(
                  e.target.value
                );

              setFirstName(val);

              generateUsername(
                val,
                lastName
              );
            }}
            required
          />

        </div>

        {/* LAST NAME */}
        <div className="input-group">

          <label>Last Name</label>

          <input
            value={lastName}
            onChange={(e) => {

              const val =
                capitalize(
                  e.target.value
                );

              setLastName(val);

              generateUsername(
                firstName,
                val
              );
            }}
            required
          />

        </div>

        {/* USERNAME */}
        <div className="input-group">

          <label>Username</label>

          <input
            value={username}
            readOnly
          />

        </div>

        {/* EMAIL */}
        <div className="input-group">

          <label>Email</label>

          <input
            value={email}
            onChange={(e) =>
              validateEmail(
                e.target.value
              )
            }
            onPaste={(e) =>
              e.preventDefault()
            }
            onCopy={(e) =>
              e.preventDefault()
            }
            required
          />

          {
            emailError && (

              <p className="error">
                {emailError}
              </p>
            )
          }

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
              value={password}
              onChange={(e) =>
                validatePassword(
                  e.target.value
                )
              }
              required
            />

            <span
              className="toggle-text"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              {
                showPassword
                  ? "Hide"
                  : "Show"
              }
            </span>

          </div>

          {
            passwordError && (

              <p className="error">
                {passwordError}
              </p>
            )
          }

        </div>

        {/* CONFIRM PASSWORD */}
        <div className="input-group">

          <label>Confirm Password</label>

          <div className="password-box">

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              value={confirmPassword}
              onChange={(e) =>
                validateConfirmPassword(
                  e.target.value
                )
              }
              required
            />

            <span
              className="toggle-text"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
            >
              {
                showConfirmPassword
                  ? "Hide"
                  : "Show"
              }
            </span>

          </div>

          {
            confirmError && (

              <p className="error">
                {confirmError}
              </p>
            )
          }

        </div>

        {/* ORGANIZATION TYPE */}
        <div className="input-group">

          <label>
            Organization Type
          </label>

          <select
            value={orgType}
            onChange={(e) => {
              setOrgType(e.target.value);
              setRole("");
            }}
            required
          >
            <option value="">
              Select Organization
            </option>
          
            <option value="Apollo Hospitals">
              Apollo Hospitals
            </option>
          
            <option value="Fortis Healthcare">
              Fortis Healthcare
            </option>
          
            <option value="Manipal Hospitals">
              Manipal Hospitals
            </option>
          
            <option value="Max Healthcare">
              Max Healthcare
            </option>
          
            <option value="Aster Hospitals">
              Aster Hospitals
            </option>
          
            <option value="IQVIA">
              IQVIA
            </option>
          
            <option value="ICON plc">
              ICON plc
            </option>
          
            <option value="Parexel">
              Parexel
            </option>
          
            <option value="Syneos Health">
              Syneos Health
            </option>
          
            <option value="Medpace">
              Medpace
            </option>

            <option value="Pfizer Inc.">
              Pfizer Inc.
            </option>

            <option value="Novartis AG">
              Novartis AG
            </option>

            <option value="Roche">
              Roche
            </option>

            <option value="AstraZeneca">
              AstraZeneca
            </option>

            <option value="Merck & Co.">
              Merck & Co.
            </option>
          </select>

        </div>

        {/* ROLE */}
        <div className="input-group">

          <label>
            Role
          </label>

          <select
            value={role}
            onChange={(e) =>
              setRole(
                e.target.value
              )
            }
            required
          >

            <option value="">
              Select role
            </option>

            {
              orgType &&
              roleOptions[
                orgType
              ].map((r, index) => (

                <option
                  key={index}
                  value={r}
                >
                  {r}
                </option>
              ))
            }

          </select>

        <div className="policy-container">

          <input
            type="checkbox"
            id="policy"
            checked={acceptedPolicy}
            onChange={() =>
              setAcceptedPolicy(!acceptedPolicy)
            }
          />

          <label htmlFor="policy">
            I agree to the{" "}
            <span
              className="policy-link"
              onClick={(e) => {
                e.preventDefault();
                setShowPolicy(true);
              }}
            >
              Privacy Policy
            </span>
          </label>
            
        </div>

        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="auth-btn"
          disabled={
            emailError ||
            passwordError ||
            confirmError ||
            !acceptedPolicy
          }
        >
          SIGN UP
        </button>

        <div className="login-section">

          <span>
            Already have an account?
          </span>

          <button
            type="button"
            className="login-link-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

        </div>

        <div className="security-card">

          <div className="security-icon">
            🔒
          </div>

          <div>

            <h4>
              Secure Registration
            </h4>

            <p>
              Your information is encrypted
              and protected using
              industry-standard security
              practices.
            </p>

          </div>

        </div>

      </form>

      {showPolicy && (

        <div className="policy-modal">
        
          <div className="policy-content">
            
            <h2>
              TriaNXT Privacy Policy
            </h2>
            
            <p>
              TriaNXT collects user
              information such as
              name, email address,
              organization and role
              for authentication and
              platform access.
            </p>
            
            <p>
              We never sell or share
              personal information
              with unauthorized
              third parties.
            </p>
            
            <p>
              Access to study data,
              dashboards and reports
              is controlled through
              role-based permissions.
            </p>
            
            <p>
              All information is stored
              securely using modern
              encryption standards.
            </p>
            
            <button
              className="close-policy"
              onClick={() =>
                setShowPolicy(false)
              }
            >
              Close
            </button>
            
          </div>
            
        </div>
      
      )}

    </AuthLayout>
  );
}

export default Register;