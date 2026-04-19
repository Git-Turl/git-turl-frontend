import { createBrowserRouter } from 'react-router';
import { Layout } from '../components/layout/Layout';


export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        path: 'notifications',
        element: <div className="p-8"><h1 className="text-2xl">Notifications Page</h1></div>,
      },
    ],
  },
]);