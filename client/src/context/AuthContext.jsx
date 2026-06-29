import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);
const TOKEN_KEY = 'furniture_auth_token';
const USER_KEY = 'furniture_auth_user';

function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        if (!savedToken) return;

        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` },
        });

        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          setToken(savedToken);
          setUser(data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          return;
        }

        clearStoredSession();
      } catch {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        const savedUser = localStorage.getItem(USER_KEY);
        if (savedToken && savedUser) {
          try {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            return;
          } catch {
            clearStoredSession();
          }
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistSession = (sessionToken, sessionUser) => {
    localStorage.setItem(TOKEN_KEY, sessionToken);
    localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
    setToken(sessionToken);
    setUser(sessionUser);
  };

  const signup = async (username, password) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Sign up failed');
    persistSession(data.token, data.user);
    return data.user;
  };

  const signin = async (username, password) => {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Sign in failed');
    persistSession(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    clearStoredSession();
    setToken(null);
    setUser(null);
  };

  const authFetch = useCallback(
    async (url, options = {}) => {
      const headers = {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch(url, { ...options, headers });
      if (res.status === 401 && token) {
        clearStoredSession();
        setToken(null);
        setUser(null);
      }
      return res;
    },
    [token]
  );

  return (
    <AuthContext.Provider value={{ user, token, ready, signup, signin, logout, authFetch, isAuthenticated: !!token && !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
