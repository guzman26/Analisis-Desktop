import { lazy } from 'react';

const Dashboard = lazy(() => import('../views/Dashboard'));
const OpenPallets = lazy(() => import('../views/OpenPallets'));

export const routes = [
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/openPallets',
    element: <OpenPallets />,
  },
];
