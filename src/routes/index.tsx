import { lazy } from 'react';

const Dashboard = lazy(() => import('../views/Dashboard'));
const OpenPallets = lazy(() => import('../views/Packing/OpenPallets'));
const ClosedPallets = lazy(() => import('../views/Packing/ClosedPallets'));
const PalletsInBodega = lazy(() => import('../views/Bodega/Pallets'));
const UnassignedBoxesBodega = lazy(
  () => import('../views/Bodega/UnassignedBoxes')
);
const UnassignedBoxesPacking = lazy(
  () => import('../views/Packing/UnassignedBoxes')
);
const CreateSaleForm = lazy(
  () => import('../views/Sale/CreateSaleForm/CreateSaleForm')
);
const CreateCustomerForm = lazy(
  () => import('../views/Sale/CreateCustomerForm')
);
const SalesOrders = lazy(() => import('../views/Sale/DraftSalesOrdersList'));
const SaleReportPrintView = lazy(
  () => import('../views/Sale/SaleReportPrintView')
);
const PalletLabelView = lazy(() => import('../views/PalletLabelView'));
const ConfirmedSalesOrdersList = lazy(
  () => import('../views/Sale/ConfirmedSalesOrdersList')
);
const AdminIssues = lazy(() => import('../views/Admin/Issues'));
const AdminDangerZone = lazy(() => import('../views/Admin/DangerZone'));

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
  {
    path: '/sales/new',
    element: <CreateSaleForm />,
  },
  {
    path: '/sales/createCustomer',
    element: <CreateCustomerForm />,
  },
  {
    path: '/sales/orders',
    element: <SalesOrders />,
  },
  {
    path: '/sales/confirmed',
    element: <ConfirmedSalesOrdersList />,
  },
  {
    path: '/admin/issues',
    element: <AdminIssues />,
  },
  {
    path: '/admin/danger-zone',
    element: <AdminDangerZone />,
  },
];

// Routes that don't use the Layout component (no sidebar)
export const standaloneRoutes = [
  {
    path: '/sales/print/:saleId',
    element: <SaleReportPrintView />,
  },
  {
    path: '/pallet/label/:palletCode',
    element: <PalletLabelView />,
  },
];
