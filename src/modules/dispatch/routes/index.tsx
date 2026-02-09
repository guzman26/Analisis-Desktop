import { lazy } from 'react';
import type { ModuleRoute } from '@/modules/core';

const DispatchListView = lazy(() => import('@/views/Dispatch/DispatchesList'));
const CreateDispatchView = lazy(
  () => import('@/views/Dispatch/CreateDispatchForm')
);

export const dispatchRoutes: ModuleRoute[] = [
  {
    path: '/dispatch/list',
    component: DispatchListView,
    meta: {
      title: 'Despachos',
      section: 'dispatch',
      breadcrumb: ['Despachos', 'Listado'],
      featureFlag: 'dispatch-core',
    },
  },
  {
    path: '/dispatch/create',
    component: CreateDispatchView,
    meta: {
      title: 'Crear despacho',
      section: 'dispatch',
      breadcrumb: ['Despachos', 'Crear'],
      featureFlag: 'dispatch-core',
    },
  },
  {
    path: '/dispatch/edit/:id',
    component: CreateDispatchView,
    meta: {
      title: 'Editar despacho',
      section: 'dispatch',
      breadcrumb: ['Despachos', 'Editar'],
      featureFlag: 'dispatch-core',
    },
  },
];
