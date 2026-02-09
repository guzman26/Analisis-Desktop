import { Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from '@/app/layout';
import { layoutRoutes, routeManifest, standaloneRoutes } from './routeManifest';

const LoadingFallback = () => (
  <div className="route-loading-container">
    <div className="route-loading-spinner"></div>
    <p>Cargando...</p>
  </div>
);

const pathToMatcher = (routePath: string): RegExp => {
  const escaped = routePath
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/:([^/]+)/g, '[^/]+');

  return new RegExp(`^${escaped}$`);
};

const useRouteDocumentTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const activeRoute = routeManifest.find((route) =>
      pathToMatcher(route.path).test(location.pathname)
    );

    if (activeRoute?.meta?.title) {
      document.title = `${activeRoute.meta.title} | Lomas Altas`;
    }
  }, [location.pathname]);
};

export const AppRouter = () => {
  useRouteDocumentTitle();

  return (
    <Routes>
      {standaloneRoutes.map((route) => {
        const RouteComponent = route.component;

        return (
          <Route
            key={route.path}
            path={route.path}
            element={
              <Suspense fallback={<LoadingFallback />}>
                <RouteComponent />
              </Suspense>
            }
          />
        );
      })}

      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              {layoutRoutes.map((route) => {
                const RouteComponent = route.component;

                return (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <RouteComponent />
                      </Suspense>
                    }
                  />
                );
              })}
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
};
