import { createContext, useContext, useMemo, useState, ReactNode, useEffect } from 'react';
import { authService } from '../service/ApiLoginService';
import {
  decodeJwtPayload,
  hasNumericSub,
  getUserIdFromToken,
  getTokenMsUntilExpiry,
  isTokenUsable,
} from '../utils/jwtPayload';

interface AuthContextType {
  token: string | null;
  /** Hay token vigente (no expirado). */
  isAuthenticated: boolean;
  isAdmin: boolean;
  canPerformAdminActions: boolean;
  userId: number | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Un token expirado guardado de una sesión anterior se descarta al iniciar:
  // así no se monta el Layout (ni se abre /events/stream) antes del login.
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem('jwt_token');
    if (stored && !isTokenUsable(stored)) {
      localStorage.removeItem('jwt_token');
      return null;
    }
    return stored;
  });

  // Al llegar la expiración se cierra la sesión en la interfaz.
  useEffect(() => {
    const msLeft = getTokenMsUntilExpiry(token);
    if (msLeft === null) {
      return;
    }
    const timer = window.setTimeout(() => {
      localStorage.removeItem('jwt_token');
      setToken(null);
    }, Math.max(msLeft, 0));
    return () => window.clearTimeout(timer);
  }, [token]);

  // Sync token across tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'jwt_token') {
        const newToken = event.newValue
        setToken(newToken)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const isAuthenticated = useMemo(() => isTokenUsable(token), [token]);
  const isAdmin = useMemo(() => decodeJwtPayload(token)?.is_admin === true, [token]);
  const canPerformAdminActions = useMemo(() => isAdmin && hasNumericSub(token), [isAdmin, token]);
  const userId = useMemo(() => getUserIdFromToken(token), [token]);

  const login = (newToken: string) => {
    localStorage.setItem('jwt_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    authService.logout();
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated, isAdmin, canPerformAdminActions, userId, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
