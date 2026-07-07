// router.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';  
import { DashBoard } from './pages/DashBoard';
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
      
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}