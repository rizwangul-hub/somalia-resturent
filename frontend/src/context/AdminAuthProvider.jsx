import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { AdminAuthContext } from './AdminAuthContext.js';

const ADMIN_TOKEN_KEY = 'aflax_admin_token';

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });

  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verify session on mount if token exists
  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
      if (!storedToken) {
        if (active) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await adminService.getMe();
        if (active && res && res.success && res.data) {
          setAdmin(res.data);
          setIsAuthenticated(true);
        } else {
          throw new Error('Invalid session');
        }
      } catch (err) {
        console.warn('Admin session expired or invalid:', err.message);
        if (active) {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          setToken(null);
          setAdmin(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      active = false;
    };
  }, []);

  // Login handler
  const login = async (email, password) => {
    const res = await adminService.login({ email, password });
    if (res && res.success && res.data?.token) {
      const authToken = res.data.token;
      localStorage.setItem(ADMIN_TOKEN_KEY, authToken);
      setToken(authToken);
      setAdmin(res.data.admin);
      setIsAuthenticated(true);
      return res.data;
    }
    throw new Error(res?.message || 'Login failed');
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
    setAdmin(null);
    setIsAuthenticated(false);
  };

  const value = {
    token,
    admin,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
