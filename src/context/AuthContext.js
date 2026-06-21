import { createContext, useContext, useState } from "react";

import rolePermissions from "../utils/rolePermissions";

const AuthContext =
  createContext(null);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("currentUser")) || null
  );

  const login = (userData) => {

    localStorage.setItem(
      "currentUser",
      JSON.stringify(userData)
    );

    setUser(userData);
  };

  const logout = () => {

    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("adminPreviewRole");

    setUser(null);
  };

  const role = user?.role || null;

  const permissions =
    role && rolePermissions[role]
      ? rolePermissions[role]
      : [];

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        permissions,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);