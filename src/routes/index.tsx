import { lazy } from 'react';

const Dashboard = lazy(() => import('../views/Dashboard'));
const OpenPallets = lazy(() => import('../views/Packing/OpenPallets'));
const ClosedPallets = lazy(() => import('../views/Packing/ClosedPallets'));
const PalletsInBodega = lazy(() => import('../views/Bodega/Pallets'));
const UnassignedBoxesBodega = lazy(() => import('../views/Bodega/UnassignedBoxes'));
const UnassignedBoxesPacking = lazy(() => import('../views/Packing/UnassignedBoxes'));
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
    path: '/packing/openPallets',
    element: <OpenPallets />,
  },
  {
    path: '/packing/closedPallets',
    element: <ClosedPallets />,
  },
  {
    path: '/bodega/pallets',
    element: <PalletsInBodega />,
  },
  {
    path: '/bodega/unassignedBoxes',
    element: <UnassignedBoxesBodega />,
  },
  {
    path: '/packing/unassignedBoxes',
    element: <UnassignedBoxesPacking />,
  },
];
