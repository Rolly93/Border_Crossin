import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { DashBoard } from './pages/DashBoard';
import { SftpConnection } from './pages/SftpConnection';
import { SftpSends } from './pages/SftpSends';
import { ClientsPage } from './pages/ClientsPage';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRouter } from './features/login/components/ProtectedRoute';
import { AuthProvider } from './features/login/context/AuthContext';
import { FirstTimeLog } from './features/login/components/FirstTimeCreate';
import { EmployeePage } from './pages/EmployeePage';
import { UnitPage } from './pages/UnitPage';
const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,

  }, {
    path: '/onetime',
    element: <FirstTimeLog />,

  }
  , {
    path: '/',
    element: <ProtectedRouter />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashBoard />, },
          { path: '/clients', element: <ClientsPage /> },
          { path: '/sftp_connection', element: <SftpConnection /> },
          { path: '/sftp_sends', element: <SftpSends /> },
          { path: '/employee', element: <EmployeePage /> },
          { path: '/units', element: <UnitPage /> },
        ]
      },
    ],
  },
]);

export function Router() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}