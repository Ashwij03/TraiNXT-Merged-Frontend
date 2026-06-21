import "./Auth.css";
import TriaNXTLogo from "./Components/common/TriaNXTLogo";

export default function AuthLayout({ title, children }) {
  return (
    <div className="auth-page">
      <div className="overlay"></div>

      <div className="auth-card">
        <TriaNXTLogo size="auth" />

        <h2 className="auth-title">{title}</h2>

        {children}
      </div>
    </div>
  );
}
