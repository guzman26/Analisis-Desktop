import type { ModuleRoute } from '@/modules/core';
import { dashboardRoutes } from '@/modules/dashboard/routes';
import { packingRoutes } from '@/modules/packing/routes';
import { bodegaRoutes } from '@/modules/bodega/routes';
import { transitoRoutes } from '@/modules/transito/routes';
import { salesRoutes } from '@/modules/sales/routes';
import { dispatchRoutes } from '@/modules/dispatch/routes';

export const moduleRoutes: ModuleRoute[] = [
  ...dashboardRoutes,
  ...packingRoutes,
  ...bodegaRoutes,
  ...transitoRoutes,
  ...salesRoutes,
  ...dispatchRoutes,
];
