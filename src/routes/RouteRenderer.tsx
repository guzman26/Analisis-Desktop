import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { routes } from './index';
import Layout from '../components/Layout';

const LoadingFallback = () => (
  <div className="route-loading-container">
    <div className="route-loading-spinner"></div>
    <p>Cargando...</p>
  </div>
);

export const RouteRenderer = () => {
  return (
    <Layout>
      <Routes>
        {/* Dynamic routes from configuration */}
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
  );
};
