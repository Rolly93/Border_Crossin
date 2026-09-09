import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DashBoard } from './pages/DashBoard';
import { SftpConnection } from './pages/SftpConnection';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRouter } from './features/login/components/ProtectedRoute';
import { AuthProvider } from './features/login/context/AuthContext';
import { FirstTimeLog } from './features/login/components/FirstTimeCreate';
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
          { path: '/', element: <DashBoard />, },
          { path: '/sftp_connection', element: <SftpConnection /> },
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