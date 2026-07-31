// router.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';  
import { DashBoard } from './pages/DashBoard';
import { SftpConnection } from './pages/SftpConnection';
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
         element: <SftpConnection/>
       },

    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}