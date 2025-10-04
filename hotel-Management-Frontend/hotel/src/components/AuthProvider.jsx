import React, { useState, useEffect, createContext } from 'react';

// API Configuration
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Auth Context
export const AuthContext = createContext(null);

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Initialize token from memory instead of localStorage
    const initializeAuth = async () => {
      // Check if we have stored credentials in memory
      if (token) {
        await fetchUserProfile();
      } else {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = (accessToken, refreshToken) => {
    // Store tokens in memory only
    setToken(accessToken);
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: token })
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchUserProfile, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;