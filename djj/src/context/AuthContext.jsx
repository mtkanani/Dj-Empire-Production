import React, { createContext, useContext, useState, useEffect } from 'react';
import { tokenManager } from '../utils/tokenManager.js';
import { authService } from '../services/authService.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => tokenManager.getUser());
  const [token, setToken] = useState(() => tokenManager.getAccessToken());
  const [loading, setLoading] = useState(true);

  // Initialize Session Restoration
  useEffect(() => {
    const initSession = async () => {
      const storedToken = tokenManager.getAccessToken();
      const storedRefreshToken = tokenManager.getRefreshToken();

      if (storedToken && !user) {
        try {
          const res = await authService.refreshToken(storedRefreshToken || '');
          const newAccessToken = res.data?.accessToken || res.accessToken;
          const newRefreshToken = res.data?.refreshToken || res.refreshToken;

          if (newAccessToken) {
            tokenManager.setAccessToken(newAccessToken);
            if (newRefreshToken) tokenManager.setRefreshToken(newRefreshToken);
            setToken(newAccessToken);
          }
        } catch {
          tokenManager.clear();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initSession();
  }, []);

  const login = (userData, accessToken, refreshToken) => {
    setUser(userData);
    setToken(accessToken);
    tokenManager.setUser(userData);
    tokenManager.setAccessToken(accessToken);
    if (refreshToken) tokenManager.setRefreshToken(refreshToken);
  };

  const logout = async () => {
    const refreshToken = tokenManager.getRefreshToken();
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch {
        // Safe silent logout
      }
    }
    setUser(null);
    setToken(null);
    tokenManager.clear();
  };

  const isAuthenticated = Boolean(token && user);
  const userRole = user?.role || 'GUEST';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        userRole,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
