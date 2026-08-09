import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("djibjob_user");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("djibjob_user");
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("djibjob_token");
  });

  function login(authenticatedUser, authenticationToken) {
    localStorage.setItem(
      "djibjob_user",
      JSON.stringify(authenticatedUser)
    );

    localStorage.setItem(
      "djibjob_token",
      authenticationToken
    );

    setUser(authenticatedUser);
    setToken(authenticationToken);
  }

  function logout() {
    localStorage.removeItem("djibjob_user");
    localStorage.removeItem("djibjob_token");

    setUser(null);
    setToken(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
    }),
    [user, token]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth doit être utilisé dans AuthProvider."
    );
  }

  return context;
}