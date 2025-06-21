import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { routes, standaloneRoutes } from './index';
import Layout from '../components/Layout';

const LoadingFallback = () => (
  <div className="route-loading-container">
    <div className="route-loading-spinner"></div>
    <p>Cargando...</p>
  </div>
);

export const RouteRenderer = () => {
  return (
    <Routes>
      {/* Standalone routes without Layout */}
      {standaloneRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <Suspense fallback={<LoadingFallback />}>{route.element}</Suspense>
          }
        />
      ))}

      {/* Regular routes with Layout */}
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              {routes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      {route.element}
                    </Suspense>
                  }
                />
              ))}
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
};
