import { layoutRoutes, standaloneRoutes } from '@/app/router';

export const routes = layoutRoutes.map((route) => ({
  path: route.path,
  element: <route.component />,
}));

export { standaloneRoutes };
