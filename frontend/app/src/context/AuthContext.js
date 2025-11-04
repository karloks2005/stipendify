import React, { createContext, useContext, useState } from "react";

// Create the context
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  
  // Fake login/logout logic for demo
  const login = (response) => {
    // support different token shapes from backend
    const token = response?.accessToken || response?.access_token || null;
    if (token) setAccessToken(token);
    // attempt to load user info either with token in Authorization header
    // or relying on cookie-based session if backend sets a cookie (credentials: include)
    userFromToken(token);
  };

  const userFromToken = (token) => {
    // send request to users/me endpoint with optional Authorization header
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch("http://localhost:8888/users/me", {
      method: "GET",
      credentials: "include",
      headers,
    }).then(response => {
      if (response.ok) {
        response.json().then(data => {
          setUser(data); // set user info in context
        });
      } else {
        console.log("Failed to fetch user info");
      }
    }).catch(err => {
      console.error('userFromToken error', err);
    });
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
  };

  const getUserData = () => {
    console.log("Current user data:", user);
  };

  const contextValue = {
    user,
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
