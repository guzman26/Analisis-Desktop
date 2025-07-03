import React, { useContext, useEffect } from 'react';
import { IssuesContext } from '@/contexts/IssuesContext';
import '@/styles/SalesOrdersList.css';

const AdminIssues: React.FC = () => {
  const { adminIssuesPaginated } = useContext(IssuesContext);

  useEffect(() => {
    if (adminIssuesPaginated.data.length === 0) {
      adminIssuesPaginated.refresh();
    }
  }, []);

  const handleLoadMore = () => {
    if (adminIssuesPaginated.hasMore && !adminIssuesPaginated.loading) {
      adminIssuesPaginated.loadMore();
    }
  };

  console.log(adminIssuesPaginated.data);
  return (
    <div className="sales-orders-list">
      <div className="sales-orders-header">
        <h1>Problemas Reportados</h1>
        <button
          onClick={() => adminIssuesPaginated.refresh()}
          className="btn btn-secondary refresh-btn"
          disabled={adminIssuesPaginated.loading}
        >
          {adminIssuesPaginated.loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {adminIssuesPaginated.error && (
        <div className="error-message">
          <p>Error al cargar los issues: {adminIssuesPaginated.error}</p>
        </div>
      )}

      {adminIssuesPaginated.data.length === 0 &&
      !adminIssuesPaginated.loading ? (
        <div className="no-sales-message">
          <p>No hay issues reportados.</p>
        </div>
      ) : (
        <div className="sales-orders-grid">
          {adminIssuesPaginated.data.map((issue) => (
            <div key={issue.id} className="sale-card">
              <div className="sale-main-info">
                <div className="sale-date-primary">
                  {new Date(issue.createdAt).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div className="sale-customer-primary">
                  <span className="customer-name">{issue.title}</span>
                </div>
              </div>

              <div className="sale-secondary-info">
                <div className="sale-id-secondary">
                  <span className="label">ID:</span>
                  <span className="value">{issue.id}</span>
                </div>

                <div className="sale-boxes-info">
                  <span className="label">Estado:</span>
                  <span className="value">{issue.status}</span>
                </div>
              </div>

              <div className="sale-items">
                <span className="items-label">Descripción:</span>
                <p>{issue.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {adminIssuesPaginated.loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando issues...</p>
        </div>
      )}

      {adminIssuesPaginated.hasMore && !adminIssuesPaginated.loading && (
        <div className="load-more-section">
          <button
            onClick={handleLoadMore}
            className="btn btn-secondary load-more-btn"
          >
            Cargar Más
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminIssues;
