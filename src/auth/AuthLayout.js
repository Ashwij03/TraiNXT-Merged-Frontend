import "./Auth.css";
import TriaNXTLogo from "../components/common/TriaNXTLogo";

export default function AuthLayout({ title, children }) {
  return (
    <div className="auth-page">
      <div className="overlay"></div>

      <div className="auth-container">
        {/* LEFT — BRANDING SECTION */}
        <div className="auth-left">
          <div className="auth-left-content">
            <TriaNXTLogo size="auth-hero" className="auth-left-logo" />
            <p className="auth-tagline">Clinical Trial Management System</p>

            <div className="auth-left-divider"></div>

            <ul className="auth-left-features">
              <li>
                <span className="auth-feature-icon">✔</span>
                Streamlined trial &amp; site management
              </li>
              <li>
                <span className="auth-feature-icon">🔒</span>
                Role-based, secure access controls
              </li>
              <li>
                <span className="auth-feature-icon">📊</span>
                Real-time dashboards &amp; reporting
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT — FORM SECTION */}
        <div className="auth-right">
          <div className="auth-card">
            <h2 className="auth-title">{title}</h2>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}