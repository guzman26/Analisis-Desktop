import { lazy } from 'react';
import type { ModuleRoute } from '@/modules/core';

const TransitPalletsView = lazy(() => import('@/views/Transito/Pallets'));
const TransitoCartsView = lazy(() => import('@/views/Transito/Carts'));

export const transitoRoutes: ModuleRoute[] = [
  {
    path: '/transito/pallets',
    component: TransitPalletsView,
    meta: {
      title: 'Pallets en Tránsito',
      section: 'transito',
      breadcrumb: ['Tránsito', 'Pallets'],
      featureFlag: 'transito',
    },
  },
  {
    path: '/transito/carts',
    component: TransitoCartsView,
    meta: {
      title: 'Carros en Tránsito',
      section: 'transito',
      breadcrumb: ['Tránsito', 'Carros'],
      featureFlag: 'transito',
    },
  },
];
