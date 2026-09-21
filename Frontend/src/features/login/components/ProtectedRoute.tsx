import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRouter() {
  const { token } = useAuth();
  const activeToken = token || localStorage.getItem('jwt_token');
  //return <Outlet />
  return activeToken ? <Outlet /> : <Navigate to='/login' replace />;
}