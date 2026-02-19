import { Dispatch, Pallet, Sale } from '@/types';

export interface CycleTimeSummary {
  averageHours: number;
  medianHours: number;
  count: number;
}

export interface CycleTimeMetrics {
  productionToSale: CycleTimeSummary;
  saleToDispatch: CycleTimeSummary;
  dispatchApprovalLeadTime: CycleTimeSummary;
}

function toTimestamp(value?: string): number | null {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function toSummary(values: number[]): CycleTimeSummary {
  if (values.length === 0) {
    return { averageHours: 0, medianHours: 0, count: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const total = sorted.reduce((acc, value) => acc + value, 0);
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

  return {
    averageHours: total / sorted.length,
    medianHours: median,
    count: sorted.length,
  };
}

export function calculateCycleTimeMetrics(
  pallets: Pallet[],
  sales: Sale[],
  dispatches: Dispatch[]
): CycleTimeMetrics {
  const palletsByCode = new Map<string, Pallet>();
  pallets.forEach((pallet) => {
    palletsByCode.set(pallet.codigo, pallet);
  });

  const productionToSaleHours: number[] = [];
  sales.forEach((sale) => {
    const saleTimestamp = toTimestamp(sale.confirmedAt || sale.createdAt);
    if (!saleTimestamp) return;
    (sale.pallets || []).forEach((palletCode) => {
      const pallet = palletsByCode.get(palletCode);
      const productionTimestamp = toTimestamp(pallet?.fechaCreacion);
      if (!productionTimestamp) return;
      const diffHours = (saleTimestamp - productionTimestamp) / (1000 * 60 * 60);
      if (diffHours >= 0) {
        productionToSaleHours.push(diffHours);
      }
    });
  });

  const saleToDispatchHours: number[] = [];
  sales.forEach((sale) => {
    const confirmedTimestamp = toTimestamp(sale.confirmedAt);
    const dispatchedTimestamp = toTimestamp(sale.dispatchedAt);
    if (!confirmedTimestamp || !dispatchedTimestamp) return;
    const diffHours = (dispatchedTimestamp - confirmedTimestamp) / (1000 * 60 * 60);
    if (diffHours >= 0) {
      saleToDispatchHours.push(diffHours);
    }
  });

  const dispatchApprovalHours: number[] = [];
  dispatches.forEach((dispatch) => {
    const createdTimestamp = toTimestamp(dispatch.createdAt);
    const approvedTimestamp = toTimestamp(dispatch.approvedAt);
    if (!createdTimestamp || !approvedTimestamp) return;
    const diffHours = (approvedTimestamp - createdTimestamp) / (1000 * 60 * 60);
    if (diffHours >= 0) {
      dispatchApprovalHours.push(diffHours);
    }
  });

  return {
    productionToSale: toSummary(productionToSaleHours),
    saleToDispatch: toSummary(saleToDispatchHours),
    dispatchApprovalLeadTime: toSummary(dispatchApprovalHours),
  };
}

