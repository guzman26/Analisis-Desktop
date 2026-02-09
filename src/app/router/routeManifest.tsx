import type { ModuleRoute } from '@/modules/core';
import { legacyRoutes } from './legacyRoutes';
import { moduleRoutes } from './moduleRoutes';

export const routeManifest: ModuleRoute[] = [...moduleRoutes, ...legacyRoutes];

export const standaloneRoutes = routeManifest.filter(
  (route) => route.standalone
);
export const layoutRoutes = routeManifest.filter((route) => !route.standalone);
