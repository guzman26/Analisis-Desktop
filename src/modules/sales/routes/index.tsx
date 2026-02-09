import { lazy } from 'react';
import type { ModuleRoute } from '@/modules/core';

const CreateSaleView = lazy(
  () => import('@/views/Sale/CreateSaleForm/CreateSaleForm')
);
const CreateCustomerView = lazy(
  () => import('@/views/Sale/CreateCustomerForm')
);
const DraftSalesView = lazy(() => import('@/views/Sale/DraftSalesOrdersList'));
const ConfirmedSalesView = lazy(
  () => import('@/views/Sale/ConfirmedSalesOrdersList')
);
const CustomersView = lazy(() => import('@/views/Sale/CustomersTable'));

export const salesRoutes: ModuleRoute[] = [
  {
    path: '/sales/new',
    component: CreateSaleView,
    meta: {
      title: 'Nueva venta',
      section: 'sales',
      breadcrumb: ['Ventas', 'Nueva venta'],
      featureFlag: 'sales-core',
    },
  },
  {
    path: '/sales/createCustomer',
    component: CreateCustomerView,
    meta: {
      title: 'Nuevo cliente',
      section: 'sales',
      breadcrumb: ['Ventas', 'Clientes', 'Crear'],
      featureFlag: 'sales-core',
    },
  },
  {
    path: '/sales/orders',
    component: DraftSalesView,
    meta: {
      title: 'Órdenes borrador',
      section: 'sales',
      breadcrumb: ['Ventas', 'Órdenes', 'Borrador'],
      featureFlag: 'sales-core',
    },
  },
  {
    path: '/sales/confirmed',
    component: ConfirmedSalesView,
    meta: {
      title: 'Órdenes confirmadas',
      section: 'sales',
      breadcrumb: ['Ventas', 'Órdenes', 'Confirmadas'],
      featureFlag: 'sales-core',
    },
  },
  {
    path: '/sales/customers',
    component: CustomersView,
    meta: {
      title: 'Clientes',
      section: 'sales',
      breadcrumb: ['Ventas', 'Clientes'],
      featureFlag: 'sales-core',
    },
  },
];
