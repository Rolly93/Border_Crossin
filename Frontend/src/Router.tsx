import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DashBoard } from './pages/DashBoard';
import { SftpConnection } from './pages/SftpConnection';
import { Layout } from './components/layout/Layout';
import { EmployeePage } from './pages/Employe';
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <DashBoard />,
      },
      {
        path: '/sftp_connection',
        element: <SftpConnection />
      }, {
        path: '/employee',
        element: <EmployeePage />
      }

    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}