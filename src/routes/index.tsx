import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';

// A simple mock check for authentication
const ProtectedRoute = () =>{
  const isAuth = !!localStorage.getItem("token");

  return isAuth ? <RootLayout/> : <Navigate to="/login" replace/>
}
export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <NotFound />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "login", element: <Login /> },
        ],
      },
      {
        element: <ProtectedRoute/>,
        children: [
          { index: true, element: <Navigate to="/dashboard" /> },
          { path: "dashboard", element: <Dashboard /> },
        ],
      },
    ],
  },
]);