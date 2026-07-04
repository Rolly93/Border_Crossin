// router.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';  
import { DashBoard } from './pages/DashBoard';
import { SftpConnection } from './pages/SftpConnection';
// import { ProfilePage } from './pages/Profile.page'; // Example of another page

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />, // The persistent Shell
    children: [
      {
        path: '/dashboard', // This makes it the default page at '/'
        element: <DashBoard />,
      },
      {
          path: '/sftp_connection', // Matches '/profile' seamlessly inside the same shell
         element: <SftpConnection/>
       },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}