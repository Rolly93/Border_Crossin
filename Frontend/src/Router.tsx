import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRouter } from './features/login/components/ProtectedRoute';
import { AuthProvider } from './features/login/context/AuthContext';
import { Suspense, lazy } from 'react';
import { Loading } from '@/components/ui/Loading';

// Lazy load pages for code splitting
const DashBoard = lazy(() => import('./pages/DashBoard'));
const SftpConnection = lazy(() => import('./pages/SftpConnection'));
const SftpSends = lazy(() => import('./pages/SftpSends'));
const ClientsPage = lazy(() => import('./pages/ClientsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const FirstTimeLog = lazy(() => import('./features/login/components/FirstTimeCreate'));
const EmployeePage = lazy(() => import('./pages/EmployeePage'));
const UnitPage = lazy(() => import('./pages/UnitPage'));

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<Loading />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/onetime',
    element: (
      <Suspense fallback={<Loading />}>
        <FirstTimeLog />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <ProtectedRouter />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          {
            path: '/dashboard',
            element: (
              <Suspense fallback={<Loading />}>
                <DashBoard />
              </Suspense>
            ),
          },
          {
            path: '/clients',
            element: (
              <Suspense fallback={<Loading />}>
                <ClientsPage />
              </Suspense>
            ),
          },
          {
            path: '/sftp_connection',
            element: (
              <Suspense fallback={<Loading />}>
                <SftpConnection />
              </Suspense>
            ),
          },
          {
            path: '/sftp_sends',
            element: (
              <Suspense fallback={<Loading />}>
                <SftpSends />
              </Suspense>
            ),
          },
          {
            path: '/employee',
            element: (
              <Suspense fallback={<Loading />}>
                <EmployeePage />
              </Suspense>
            ),
          },
          {
            path: '/units',
            element: (
              <Suspense fallback={<Loading />}>
                <UnitPage />
              </Suspense>
            ),
          },
        ],
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