import { Dispatch, Pallet, Sale } from '@/types';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  kind?: 'neutral' | 'success' | 'warning' | 'danger';
}

export function buildSaleTimeline(sale: Sale, relatedPallets?: Pallet[]): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: `${sale.saleId}-created`,
      timestamp: sale.createdAt,
      title: 'Venta creada',
      description: sale.customerName || sale.customerInfo?.name || sale.customerId,
      kind: 'neutral',
    },
  ];

  if (sale.confirmedAt) {
    events.push({
      id: `${sale.saleId}-confirmed`,
      timestamp: sale.confirmedAt,
      title: 'Venta confirmada',
      kind: 'success',
    });
  }

  if (sale.dispatchedAt) {
    events.push({
      id: `${sale.saleId}-dispatched`,
      timestamp: sale.dispatchedAt,
      title: 'Venta despachada',
      kind: 'success',
    });
  }

  if (sale.completedAt) {
    events.push({
      id: `${sale.saleId}-completed`,
      timestamp: sale.completedAt,
      title: 'Venta completada',
      kind: 'success',
    });
  }

  (relatedPallets || []).forEach((pallet) => {
    events.push({
      id: `${sale.saleId}-pallet-${pallet.codigo}`,
      timestamp: pallet.fechaCreacion,
      title: `Pallet ${pallet.codigo} creado`,
      description: `Ubicacion ${pallet.ubicacion}`,
      kind: 'neutral',
    });
  });

  return events.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

export function buildDispatchTimeline(dispatch: Dispatch): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: `${dispatch.id}-created`,
      timestamp: dispatch.createdAt || dispatch.fecha,
      title: `Despacho ${dispatch.folio} creado`,
      description: dispatch.destino,
      kind: 'neutral',
    },
  ];

  if (dispatch.approvedAt) {
    events.push({
      id: `${dispatch.id}-approved`,
      timestamp: dispatch.approvedAt,
      title: 'Despacho aprobado',
      description: dispatch.approvedBy,
      kind: 'success',
    });
  }

  (dispatch.stateHistory || []).forEach((history, index) => {
    events.push({
      id: `${dispatch.id}-history-${index}`,
      timestamp: history.timestamp,
      title: `Cambio de estado: ${history.state}`,
      description: history.notes || history.userId,
      kind: history.state === 'CANCELLED' ? 'danger' : 'neutral',
    });
  });

  return events.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

