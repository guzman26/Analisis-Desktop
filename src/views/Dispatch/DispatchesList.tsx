import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dispatch, DispatchState, DispatchDestination } from '@/types';
import {
  Button,
  WindowContainer,
  LoadingOverlay,
  DispatchCard,
} from '../../components/design-system';
import { useNotifications } from '../../components/Notification';
import {
  getDispatches,
  approveDispatch,
  cancelDispatch,
} from '@/api/endpoints';
import { PaginatedResponse } from '@/types';

import '@/styles/SalesOrdersList.css';

const DispatchesList: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextKey, setNextKey] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    estado?: DispatchState;
    destino?: DispatchDestination;
    startDate?: string;
    endDate?: string;
  }>({});
  const [approvingStates, setApprovingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);

  const loadDispatches = useCallback(
    async (append = false) => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          ...filters,
          limit: 20,
          lastKey: append && nextKey ? nextKey : undefined,
        };

        const response: PaginatedResponse<Dispatch> = await getDispatches(params);

        if (append) {
          setDispatches((prev) => [...prev, ...response.items]);
        } else {
          setDispatches(response.items);
        }

        setHasMore(!!response.nextKey);
        setNextKey(response.nextKey || null);
      } catch (err) {
        console.error('Error loading dispatches:', err);
        setError(
          err instanceof Error ? err.message : 'Error al cargar despachos'
        );
      } finally {
        setLoading(false);
      }
    },
    [filters, nextKey]
  );

  useEffect(() => {
    loadDispatches(false);
  }, [filters]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadDispatches(true);
    }
  };

  const handleRefresh = () => {
    setNextKey(null);
    loadDispatches(false);
  };

  const handleCreate = () => {
    navigate('/dispatch/create');
  };

  const handleEdit = (dispatch: Dispatch) => {
    navigate(`/dispatch/edit/${dispatch.id}`);
  };

  const handleApprove = async (dispatch: Dispatch) => {
    if (
      !window.confirm(
        `¿Está seguro de que desea aprobar el despacho ${dispatch.folio}? Esta acción moverá todas las cajas a TRANSITO.`
      )
    ) {
      return;
    }

    try {
      setApprovingStates((prev) => ({ ...prev, [dispatch.id]: true }));

      await approveDispatch(dispatch.id, 'user'); // TODO: Get actual user ID

      showSuccess(`Despacho ${dispatch.folio} aprobado exitosamente`);
      handleRefresh();
    } catch (err) {
      console.error('Error approving dispatch:', err);
      showError(
        err instanceof Error
          ? `Error al aprobar despacho: ${err.message}`
          : 'Error desconocido al aprobar despacho'
      );
    } finally {
      setApprovingStates((prev) => {
        const newStates = { ...prev };
        delete newStates[dispatch.id];
        return newStates;
      });
    }
  };

  const handleCancel = async (dispatch: Dispatch) => {
    const reason = window.prompt(
      `¿Está seguro de que desea cancelar el despacho ${dispatch.folio}? Ingrese el motivo de cancelación:`
    );

    if (!reason) {
      return;
    }

    try {
      await cancelDispatch(dispatch.id, 'user', reason); // TODO: Get actual user ID

      showSuccess(`Despacho ${dispatch.folio} cancelado exitosamente`);
      handleRefresh();
    } catch (err) {
      console.error('Error cancelling dispatch:', err);
      showError(
        err instanceof Error
          ? `Error al cancelar despacho: ${err.message}`
          : 'Error desconocido al cancelar despacho'
      );
    }
  };

  const handleViewDetails = (dispatch: Dispatch) => {
    setSelectedDispatch(dispatch);
    // TODO: Open detail modal or navigate to detail page
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setNextKey(null);
  };

  return (
    <>
      <LoadingOverlay show={loading && dispatches.length === 0} text="Cargando despachos…" />
      <WindowContainer title="Despachos">
        <div className="sales-orders-header">
          <h1>Despachos</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              onClick={handleRefresh}
              variant="secondary"
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Actualizar'}
            </Button>
            <Button onClick={handleCreate} variant="primary">
              Crear Despacho
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            padding: '1rem',
            background: 'var(--color-background-white)',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Estado</label>
            <select
              value={filters.estado || ''}
              onChange={(e) => handleFilterChange('estado', e.target.value || null)}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--color-border)',
              }}
            >
              <option value="">Todos</option>
              <option value="DRAFT">Borrador</option>
              <option value="APPROVED">Aprobado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Destino</label>
            <select
              value={filters.destino || ''}
              onChange={(e) => handleFilterChange('destino', e.target.value || null)}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--color-border)',
              }}
            >
              <option value="">Todos</option>
              <option value="Bodega Lomas Altas Capilla">Bodega Lomas Altas Capilla</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Fecha Desde</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value || null)}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--color-border)',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Fecha Hasta</label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value || null)}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--color-border)',
              }}
            />
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>Error al cargar los despachos: {error}</p>
          </div>
        )}

        {dispatches.length === 0 && !loading ? (
          <div className="no-sales-message">
            <p>No hay despachos disponibles.</p>
          </div>
        ) : (
          <div className="sales-orders-grid">
            {dispatches.map((dispatch: Dispatch) => (
              <DispatchCard
                key={dispatch.id}
                dispatch={dispatch}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onApprove={handleApprove}
                onCancel={handleCancel}
                isApproving={approvingStates[dispatch.id]}
              />
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <div className="load-more-section">
            <button
              onClick={handleLoadMore}
              className="btn btn-secondary load-more-btn"
            >
              Cargar Más
            </button>
          </div>
        )}

        {dispatches.length > 0 && (
          <div className="sales-summary">
            <p>
              Mostrando {dispatches.length} despachos
              {hasMore && ' (hay más disponibles)'}
            </p>
          </div>
        )}
      </WindowContainer>
    </>
  );
};

export default DispatchesList;

