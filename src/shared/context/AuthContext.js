import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { formatUserDisplayName } from "../services/roleService";
import rolePermissions from "../utils/rolePermissions";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser")) || null;
    } catch {
      return null;
    }
  });

  const login = useCallback((userData) => {
    const nextUser = {
      ...userData,
      displayName: formatUserDisplayName(userData),
    };

    localStorage.setItem("currentUser", JSON.stringify(nextUser));

    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("adminPreviewRole");

    setUser(null);
  }, []);

  // Safety net: if another tab (or a login handler that bypasses this
  // context) writes to localStorage, re-hydrate React state so the two
  // never silently diverge. Also handles a stale tab where context is
  // null but localStorage is populated.
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== "currentUser") return;

      try {
        const next = event.newValue ? JSON.parse(event.newValue) : null;
        setUser((prev) => {
          // Only update if actually different to avoid re-render loops.
          const prevId = prev?.id;
          const nextId = next?.id;
          if (prevId === nextId) return prev;
          return next;
        });
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const role = user?.role || null;
  const displayName = useMemo(() => formatUserDisplayName(user), [user]);

  const permissions =
    role && rolePermissions[role] ? rolePermissions[role] : [];

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ? { ...user, displayName } : null,
        role,
        displayName,
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

export const useAuth = () => useContext(AuthContext);