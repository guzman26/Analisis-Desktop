import { lazy } from 'react';
import type { ModuleRoute } from '@/modules/core';

const BodegaPalletsView = lazy(() => import('@/views/Bodega/Pallets'));
const BodegaUnassignedBoxesView = lazy(
  () => import('@/views/Bodega/UnassignedBoxes')
);

export const bodegaRoutes: ModuleRoute[] = [
  {
    path: '/bodega/pallets',
    component: BodegaPalletsView,
    meta: {
      title: 'Pallets en Bodega',
      section: 'bodega',
      breadcrumb: ['Bodega', 'Pallets'],
      featureFlag: 'bodega',
    },
  },
  {
    path: '/bodega/unassignedBoxes',
    component: BodegaUnassignedBoxesView,
    meta: {
      title: 'Cajas sin asignar',
      section: 'bodega',
      breadcrumb: ['Bodega', 'Cajas sin asignar'],
      featureFlag: 'bodega',
    },
  },
];
