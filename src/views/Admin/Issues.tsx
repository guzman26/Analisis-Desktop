import React, { useContext, useEffect } from 'react';
import { IssuesContext } from '@/contexts/IssuesContext';
import '@/styles/SalesOrdersList.css';
import IssueCard from '@/components/IssueCard';

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

  const filteredIssues = adminIssuesPaginated.data.filter(
    (issue) => issue.status !== 'RESOLVED'
  );

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
          {filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
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
