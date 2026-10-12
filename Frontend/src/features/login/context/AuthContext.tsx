import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { authService } from '../service/ApiLoginService';
import { decodeJwtPayload } from '../utils/jwtPayload';

interface AuthContextType {
  token: string | null;
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));

  const isAdmin = useMemo(() => decodeJwtPayload(token)?.is_admin === true, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('jwt_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    authService.logout();
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
