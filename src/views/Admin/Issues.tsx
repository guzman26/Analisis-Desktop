import React, { useContext, useEffect, useMemo } from 'react';
import { IssuesContext } from '@/contexts/IssuesContext';
import '@/styles/SalesOrdersList.css';
import IssueCard from '@/components/IssueCard';
import { Card } from '@/components/design-system';

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

  const issuesSummary = useMemo(() => {
    const summary = {
      total: filteredIssues.length,
      open: 0,
      inProgress: 0,
      closed: 0,
    };

    filteredIssues.forEach((issue) => {
      if (issue.status === 'OPEN') summary.open += 1;
      else if (issue.status === 'IN_PROGRESS') summary.inProgress += 1;
      else if (issue.status === 'CLOSED') summary.closed += 1;
    });

    return summary;
  }, [filteredIssues]);

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

      <Card variant="default" padding="medium" style={{ marginBottom: 'var(--4)' }}>
        <h3 style={{ marginTop: 0, marginBottom: 'var(--2)' }}>Salud de incidencias</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'var(--2)',
          }}
        >
          <div>
            <p className="text-sm text-muted-foreground">Activas</p>
            <p className="text-2xl font-semibold">{issuesSummary.total}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Abiertas</p>
            <p className="text-2xl font-semibold">{issuesSummary.open}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">En progreso</p>
            <p className="text-2xl font-semibold">{issuesSummary.inProgress}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cerradas en periodo cargado</p>
            <p className="text-2xl font-semibold">{issuesSummary.closed}</p>
          </div>
        </div>
      </Card>

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
