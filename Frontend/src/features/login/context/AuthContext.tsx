import { createContext, useContext, useMemo, useState, ReactNode, useEffect } from 'react';
import { authService } from '../service/ApiLoginService';
import { decodeJwtPayload, hasNumericSub, getUserIdFromToken } from '../utils/jwtPayload';

interface AuthContextType {
  token: string | null;
  isAdmin: boolean;
  canPerformAdminActions: boolean;
  userId: number | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));

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
    <AuthContext.Provider value={{ token, isAdmin, canPerformAdminActions, userId, login, logout }}>
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
