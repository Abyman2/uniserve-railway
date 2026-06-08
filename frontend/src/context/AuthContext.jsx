import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiFetch } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [portal, setPortal] = useState(() => localStorage.getItem('portal') || null);
  const [loading, setLoading] = useState(true);

  // Load user profile on startup if token exists
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await apiFetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          // If no portal was saved, set default based on role
          if (!portal) {
            let defaultPortal = 'customer';
            if (userData.role === 'ADMIN') defaultPortal = 'admin';
            else if (userData.role === 'SERVICE_PROVIDER') defaultPortal = 'provider';
            setPortal(defaultPortal);
            localStorage.setItem('portal', defaultPortal);
          }
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const login = async (email, password) => {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Invalid credentials');
    }

    const data = await res.json();
    setToken(data.token);
    localStorage.setItem('token', data.token);

    // Fetch user details immediately
    const profileRes = await apiFetch('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${data.token}`
      }
    });

    if (profileRes.ok) {
      const userData = await profileRes.json();
      setUser(userData);
      
      let defaultPortal = 'customer';
      if (userData.role === 'ADMIN') defaultPortal = 'admin';
      else if (userData.role === 'SERVICE_PROVIDER') defaultPortal = 'provider';
      
      setPortal(defaultPortal);
      localStorage.setItem('portal', defaultPortal);
      return userData;
    } else {
      throw new Error('Failed to fetch profile after login');
    }
  };

  const registerUser = async (fullName, email, password) => {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fullName, email, password })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Registration failed');
    }

    return await res.json();
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setPortal(null);
    localStorage.removeItem('token');
    localStorage.removeItem('portal');
  };

  const changePortal = (newPortal) => {
    setPortal(newPortal);
    localStorage.setItem('portal', newPortal);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await apiFetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    } catch (err) {
      console.error("Failed to refresh user profile:", err);
    }
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      portal,
      loading,
      login,
      register: registerUser,
      logout,
      changePortal,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
