import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dispatch, DispatchDestination, DispatchState } from '@/types';
import {
  Button,
  WindowContainer,
  LoadingOverlay,
  DispatchCard,
  Modal,
} from '@/components/design-system';
import { useNotifications } from '@/components/Notification';
import {
  useApproveDispatchMutation,
  useCancelDispatchMutation,
  useDispatchListQuery,
} from '@/modules/dispatch';
import {
  EmptyStateV2,
  FilterBarV2,
  ListToolbarV2,
  PageHeaderV2,
  SectionCardV2,
} from '@/components/app-v2';
import { buildDispatchTimeline } from '@/utils/timelineBuilder';
import { ProductionTimeline } from '@/components/story/ProductionTimeline';

import '@/styles/SalesOrdersList.css';

interface DispatchFiltersFormState {
  estado?: DispatchState;
  destino?: DispatchDestination;
  startDate?: string;
  endDate?: string;
}

const DispatchesList: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const [filters, setFilters] = useState<DispatchFiltersFormState>({});
  const [approvingStates, setApprovingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);

  const { dispatches, loading, error, hasMore, isEmpty, refresh, loadMore } =
    useDispatchListQuery(filters);

  const approveMutation = useApproveDispatchMutation();
  const cancelMutation = useCancelDispatchMutation();

  const handleCreate = () => {
    navigate('/dispatch/create');
  };

  const handleEdit = (dispatch: Dispatch) => {
    navigate(`/dispatch/edit/${dispatch.id}`);
  };

  const handleApprove = async (dispatch: Dispatch) => {
    if (!dispatch.pallets || dispatch.pallets.length === 0) {
      showError('No se puede confirmar un borrador sin pallets asignados.');
      return;
    }

    if (
      !window.confirm(
        `¿Está seguro de que desea aprobar el despacho ${dispatch.folio}? Esta acción moverá todas las cajas a TRANSITO.`
      )
    ) {
      return;
    }

    try {
      setApprovingStates((prev) => ({ ...prev, [dispatch.id]: true }));
      await approveMutation.mutateAsync(dispatch.id, 'user');
      showSuccess(`Despacho ${dispatch.folio} aprobado exitosamente`);
      await refresh();
    } catch (err) {
      showError(
        err instanceof Error
          ? `Error al aprobar despacho: ${err.message}`
          : 'Error desconocido al aprobar despacho'
      );
    } finally {
      setApprovingStates((prev) => {
        const next = { ...prev };
        delete next[dispatch.id];
        return next;
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
      await cancelMutation.mutateAsync(dispatch.id, 'user', reason);
      showSuccess(`Despacho ${dispatch.folio} cancelado exitosamente`);
      await refresh();
    } catch (err) {
      showError(
        err instanceof Error
          ? `Error al cancelar despacho: ${err.message}`
          : 'Error desconocido al cancelar despacho'
      );
    }
  };

  const handleViewDetails = (dispatch: Dispatch) => {
    setSelectedDispatch(dispatch);
  };

  const handlePrint = (dispatch: Dispatch) => {
    navigate(`/dispatch/print/${dispatch.id}`);
  };

  const handleFilterChange = (
    key: keyof DispatchFiltersFormState,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  return (
    <>
      <LoadingOverlay
        show={loading && dispatches.length === 0}
        text="Cargando despachos…"
      />
      <WindowContainer title="Despachos">
        <div className="v2-page">
          <PageHeaderV2
            title="Despachos"
            description="Gestión operacional de despachos, aprobaciones y estado de salida."
            actions={
              <ListToolbarV2
                left={
                  <Button
                    onClick={() => void refresh()}
                    variant="secondary"
                    disabled={loading}
                  >
                    {loading ? 'Actualizando...' : 'Actualizar'}
                  </Button>
                }
                right={
                  <Button onClick={handleCreate} variant="primary">
                    Crear Despacho
                  </Button>
                }
                className="border-0 bg-transparent p-0"
              />
            }
          />

          <FilterBarV2>
            <div className="flex min-w-[170px] flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Estado
              </label>
              <select
                value={filters.estado || ''}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Todos</option>
                <option value="DRAFT">Borrador</option>
                <option value="APPROVED">Aprobado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>

            <div className="flex min-w-[170px] flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Destino
              </label>
              <select
                value={filters.destino || ''}
                onChange={(e) => handleFilterChange('destino', e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Todos</option>
                <option value="Bodega Lomas Altas Capilla">
                  Bodega Lomas Altas Capilla
                </option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="flex min-w-[170px] flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Fecha Desde
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) =>
                  handleFilterChange('startDate', e.target.value)
                }
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>

            <div className="flex min-w-[170px] flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
          </FilterBarV2>

          {error && (
            <SectionCardV2 className="border-destructive/40 bg-destructive/5">
              <p className="text-sm font-medium text-destructive">
                Error al cargar los despachos: {error}
              </p>
            </SectionCardV2>
          )}

          {isEmpty && !loading ? (
            <EmptyStateV2
              title="No hay despachos disponibles"
              description="Ajusta los filtros o crea un nuevo despacho para comenzar."
              action={
                <Button onClick={handleCreate} variant="primary">
                  Crear Despacho
                </Button>
              }
            />
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
                  onPrint={handlePrint}
                  isApproving={approvingStates[dispatch.id]}
                />
              ))}
            </div>
          )}

          {hasMore && !loading && (
            <div className="load-more-section">
              <Button
                onClick={() => void loadMore()}
                variant="secondary"
                className="load-more-btn"
              >
                Cargar Más
              </Button>
            </div>
          )}

          {dispatches.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Mostrando {dispatches.length} despachos
              {hasMore && ' (hay más disponibles)'}
            </p>
          )}
        </div>
      </WindowContainer>

      <Modal
        isOpen={Boolean(selectedDispatch)}
        onClose={() => setSelectedDispatch(null)}
        title={selectedDispatch ? `Historia del despacho ${selectedDispatch.folio}` : 'Historia del despacho'}
        size="medium"
      >
        {selectedDispatch ? (
          <div className="space-y-4">
            <div className="grid gap-2 text-sm md:grid-cols-2">
              <p>
                <strong>Destino:</strong> {selectedDispatch.destino}
              </p>
              <p>
                <strong>Estado:</strong> {selectedDispatch.estado}
              </p>
              <p>
                <strong>Pallets:</strong> {selectedDispatch.pallets.length}
              </p>
              <p>
                <strong>Chofer:</strong> {selectedDispatch.nombreChofer}
              </p>
            </div>
            <ProductionTimeline events={buildDispatchTimeline(selectedDispatch)} />
          </div>
        ) : null}
      </Modal>
    </>
  );
};

export default DispatchesList;
