import { lazy } from 'react';
import type { ModuleRoute } from '@/modules/core';

const SaleReportPrintView = lazy(
  () => import('@/views/Sale/SaleReportPrintView')
);
const PalletLabelView = lazy(() => import('@/views/PalletLabelView'));
const AdminIssues = lazy(() => import('@/views/Admin/Issues'));
const AdminDangerZone = lazy(() => import('@/views/Admin/DangerZone'));
const AdminMetrics = lazy(() => import('@/views/Admin/Metrics'));
const AdminMetricsAggregated = lazy(
  () => import('@/views/Admin/MetricsAggregated')
);
const AdminSalesMetrics = lazy(() => import('@/views/Admin/SalesMetrics'));
const ShadcnTest = lazy(() => import('@/views/Test/ShadcnTest'));

export const legacyRoutes: ModuleRoute[] = [
  {
    path: '/admin/issues',
    component: AdminIssues,
    meta: {
      title: 'Admin Issues',
      section: 'admin',
      breadcrumb: ['Admin', 'Issues'],
    },
  },
  {
    path: '/admin/danger-zone',
    component: AdminDangerZone,
    meta: {
      title: 'Admin Danger Zone',
      section: 'admin',
      breadcrumb: ['Admin', 'Danger Zone'],
    },
  },
  {
    path: '/admin/metrics',
    component: AdminMetrics,
    meta: {
      title: 'Admin Metrics',
      section: 'admin',
      breadcrumb: ['Admin', 'Metrics'],
    },
  },
  {
    path: '/admin/metrics/aggregated',
    component: AdminMetricsAggregated,
    meta: {
      title: 'Admin Metrics Aggregated',
      section: 'admin',
      breadcrumb: ['Admin', 'Metrics', 'Aggregated'],
    },
  },
  {
    path: '/admin/metrics/sales',
    component: AdminSalesMetrics,
    meta: {
      title: 'Admin Sales Metrics',
      section: 'admin',
      breadcrumb: ['Admin', 'Metrics', 'Sales'],
    },
  },
  {
    path: '/sales/print/:saleId',
    component: SaleReportPrintView,
    standalone: true,
    meta: {
      title: 'Imprimir venta',
      section: 'sales',
      breadcrumb: ['Ventas', 'Imprimir'],
    },
  },
  {
    path: '/pallet/label/:palletCode',
    component: PalletLabelView,
    standalone: true,
    meta: {
      title: 'Etiqueta de pallet',
      section: 'pallet',
      breadcrumb: ['Pallet', 'Etiqueta'],
    },
  },
  {
    path: '/test/shadcn',
    component: ShadcnTest,
    meta: {
      title: 'Shadcn test',
      section: 'test',
      breadcrumb: ['Test', 'Shadcn'],
    },
  },
];
