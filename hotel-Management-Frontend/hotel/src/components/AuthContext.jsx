// src/components/AuthContext.js
import { createContext, useContext } from 'react';

const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export { AuthContext, useAuth };