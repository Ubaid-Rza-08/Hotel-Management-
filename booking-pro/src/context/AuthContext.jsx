import { createContext, useContext, useState, useEffect } from 'react';
import { AUTH_API } from '../api/config';

// ─────────────────────────────────────────────────────────────
//  AUTH CONTEXT
// ─────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => sessionStorage.getItem('bp_tok'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchProfile(token);
    else       setLoading(false);
  }, []);

  const fetchProfile = async (tok) => {
    try {
      const r = await fetch(`${AUTH_API}/profile`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (r.ok) setUser(await r.json());
      else      logout();
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (tok) => {
    sessionStorage.setItem('bp_tok', tok);
    setToken(tok);
    fetchProfile(tok);
  };

  const logout = () => {
    sessionStorage.removeItem('bp_tok');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const refreshUser = () => token && fetchProfile(token);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
