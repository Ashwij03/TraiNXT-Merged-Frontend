import { Navigate } from "react-router-dom";
import { usePermission } from "../context/PermissionContext";

function PermissionRoute({
  children,
  permission
}) {

  const { hasPermission } =
    usePermission();

  if (!hasPermission(permission)) {

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}

export default PermissionRoute;