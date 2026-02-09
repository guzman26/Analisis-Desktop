import { lazy } from 'react';
import type { ModuleRoute } from '@/modules/core';

const DashboardView = lazy(() => import('@/views/Dashboard'));

export const dashboardRoutes: ModuleRoute[] = [
  {
    path: '/',
    component: DashboardView,
    meta: {
      title: 'Dashboard',
      section: 'dashboard',
      breadcrumb: ['Dashboard'],
      featureFlag: 'dashboard',
    },
  },
  {
    path: '/dashboard',
    component: DashboardView,
    meta: {
      title: 'Dashboard',
      section: 'dashboard',
      breadcrumb: ['Dashboard'],
      featureFlag: 'dashboard',
    },
  },
];
