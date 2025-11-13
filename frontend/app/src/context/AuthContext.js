import React, { createContext, useContext, useState, useEffect, useRef } from "react";

// Create the context
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // On mount, try to rehydrate auth state from localStorage (if token was saved)
  const hasRunRef = useRef(false);
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        if (token) {
          console.log("Rehydrating auth from localStorage, token:", token);
          setAccessToken(token);
          // attempt to load user using the saved token (or cookie if backend sets it)
          await userFromToken(token);
        }
      } catch (err) {
        // localStorage may be unavailable in some environments — ignore failures
        console.warn('Failed to read access_token from localStorage. The token is probably null.');
      } finally {
        setInitializing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Fake login/logout logic for demo
  const login = (response) => {
    // support different token shapes from backend
    const token = response?.accessToken || response?.access_token || null;
    if (token) {
      setAccessToken(token);
      try { localStorage.setItem("access_token", token); } catch (e) { /* ignore */ }
      console.log("Logged in, token:", token);
    }
    // attempt to load user info either with token in Authorization header
    // or relying on cookie-based session if backend sets a cookie (credentials: include)
  setInitializing(true);
  // Return the promise so callers can await rehydration
  const p = userFromToken(token).finally(() => setInitializing(false));
  return p;
  };

  const userFromToken = async (token) => {
    // send request to users/me endpoint with optional Authorization header
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const response = await fetch("http://localhost:8888/users/me", {
        method: "GET",
        credentials: "include",
        headers,
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        console.log("Fetched user: ", data);
        setUser(data); // set user info in context
        return data;
      } else {
        console.log("Failed to fetch user info");
        setUser(null);
        return null;
      }
    } catch (err) {
      console.error('userFromToken error', err);
      setUser(null);
      return null;
    }
  };

  const logout = () => {
    // Clear local state immediately so UI updates.
    setUser(null);
    setAccessToken(null);

    // Attempt to notify backend to clear server-side session/cookie if applicable.
    (async () => {
      try {
        const headers = {};
        if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
        const res = await fetch("http://localhost:8888/auth/jwt/logout", {
          method: "POST",
          credentials: "include",
          headers: headers
        });

        if (res.ok) {
          console.log("Logged out successfully on server");
        } else {
          console.warn("Server logout responded with status", res.status);
        }
      } catch (err) {
        console.warn("Network error during logout", err);
      } finally {
        try {
          localStorage.removeItem('access_token');
        } catch (err) {
          console.log("Failed to remove access_token from localStorage", err);
        }
      }
    })();
  };

  const getUserData = () => {
    return user;
  };

  const contextValue = {
    user,
    accessToken,
    initializing,
    login,
    logout,
    // expose for development/debugging so you can fetch user info by token
    userFromToken,
  };

  // DEV: attach small helper to window for easy console debugging
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    // avoid overwriting an existing helper
    window.__STIPENDIFY_AUTH = window.__STIPENDIFY_AUTH || {};
    window.__STIPENDIFY_AUTH.userFromToken = userFromToken;
    window.__STIPENDIFY_AUTH.login = login;
    window.__STIPENDIFY_AUTH.user = getUserData;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for convenience
// Custom hook for convenience with guard
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
