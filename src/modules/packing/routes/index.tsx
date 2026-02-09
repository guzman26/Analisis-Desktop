import { lazy } from 'react';
import type { ModuleRoute } from '@/modules/core';

const OpenPalletsView = lazy(() => import('@/views/Packing/OpenPallets'));
const ClosedPalletsView = lazy(() => import('@/views/Packing/ClosedPallets'));
const CartsView = lazy(() => import('@/views/Packing/Carts'));
const CreatePalletView = lazy(() => import('@/views/Packing/CreatePallet'));
const UnassignedBoxesView = lazy(
  () => import('@/views/Packing/UnassignedBoxes')
);

export const packingRoutes: ModuleRoute[] = [
  {
    path: '/packing/openPallets',
    component: OpenPalletsView,
    meta: {
      title: 'Pallets Abiertos',
      section: 'packing',
      breadcrumb: ['Packing', 'Pallets Abiertos'],
      featureFlag: 'packing',
    },
  },
  {
    path: '/packing/closedPallets',
    component: ClosedPalletsView,
    meta: {
      title: 'Pallets Cerrados',
      section: 'packing',
      breadcrumb: ['Packing', 'Pallets Cerrados'],
      featureFlag: 'packing',
    },
  },
  {
    path: '/packing/carts',
    component: CartsView,
    meta: {
      title: 'Carros',
      section: 'packing',
      breadcrumb: ['Packing', 'Carros'],
      featureFlag: 'packing',
    },
  },
  {
    path: '/packing/createPallet',
    component: CreatePalletView,
    meta: {
      title: 'Crear Pallet',
      section: 'packing',
      breadcrumb: ['Packing', 'Crear Pallet'],
      featureFlag: 'packing',
    },
  },
  {
    path: '/packing/unassignedBoxes',
    component: UnassignedBoxesView,
    meta: {
      title: 'Cajas sin asignar',
      section: 'packing',
      breadcrumb: ['Packing', 'Cajas sin asignar'],
      featureFlag: 'packing',
    },
  },
];
