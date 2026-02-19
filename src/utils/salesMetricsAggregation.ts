import { Sale, SaleType, SaleState } from '@/types';
import { PeriodType, PeriodRange } from './metricsAggregation';
import {
  ChangeIndicator as SharedChangeIndicator,
  calculatePeriodChange as calculateSharedPeriodChange,
  getPreviousPeriod as getSharedPreviousPeriod,
} from './periodComparison';

/**
 * Change indicator with value and percentage
 */
export type ChangeIndicator = SharedChangeIndicator;

/**
 * Period comparison result
 */
export interface PeriodComparison {
  totalSales: ChangeIndicator;
  totalBoxes: ChangeIndicator;
  totalPallets: ChangeIndicator;
  averageBoxesPerSale: ChangeIndicator;
  averagePalletsPerSale: ChangeIndicator;
}

/**
 * Comparison result for aggregated data
 */
export interface ComparisonResult<T> {
  key: string;
  current: T | null;
  previous: T | null;
  change: ChangeIndicator;
}

/**
 * Safely extract number from any value
 */
function safeNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return Number.isNaN(num) ? 0 : num;
  }
  return 0;
}

/**
 * Calculate total boxes from sale items
 */
function getTotalBoxesFromSale(sale: Sale): number {
  if (sale.totalBoxes !== undefined) {
    return safeNumber(sale.totalBoxes);
  }
  if (sale.items && Array.isArray(sale.items)) {
    return sale.items.reduce((sum, item) => sum + safeNumber(item.boxIds?.length || 0), 0);
  }
  if (sale.boxes && Array.isArray(sale.boxes)) {
    return sale.boxes.length;
  }
  return 0;
}

/**
 * Calculate total pallets from sale items
 */
function getTotalPalletsFromSale(sale: Sale): number {
  if (sale.items && Array.isArray(sale.items)) {
    const uniquePallets = new Set(sale.items.map((item) => item.palletId).filter(Boolean));
    return uniquePallets.size;
  }
  if (sale.pallets && Array.isArray(sale.pallets)) {
    return sale.pallets.length;
  }
  return 0;
}

/**
 * Filter sales by date range
 */
export function filterSalesByPeriod(
  sales: Sale[],
  periodRange: PeriodRange
): Sale[] {
  if (!Array.isArray(sales)) {
    return [];
  }
  
  if (!periodRange || !periodRange.start || !periodRange.end) {
    return sales;
  }

  return sales.filter((sale) => {
    if (!sale || !sale.createdAt) {
      return false;
    }
    
    try {
      const saleDate = new Date(sale.createdAt);
      if (isNaN(saleDate.getTime())) {
        return false;
      }
      return saleDate >= periodRange.start && saleDate <= periodRange.end;
    } catch {
      return false;
    }
  });
}

/**
 * Aggregate sales by customer
 */
export interface AggregatedByCustomer {
  customerId: string;
  customerName: string;
  totalSales: number;
  totalBoxes: number;
  totalPallets: number;
  percentage: number;
}

export function aggregateByCustomer(sales: Sale[]): AggregatedByCustomer[] {
  if (!Array.isArray(sales) || sales.length === 0) {
    return [];
  }

  const customerMap = new Map<
    string,
    {
      customerName: string;
      totalSales: number;
      totalBoxes: number;
      totalPallets: number;
    }
  >();

  sales.forEach((sale) => {
    if (!sale) return;
    
    const customerId = sale.customerId || 'unknown';
    const customerName = sale.customerName || sale.customerInfo?.name || 'Sin nombre';

    if (!customerMap.has(customerId)) {
      customerMap.set(customerId, {
        customerName,
        totalSales: 0,
        totalBoxes: 0,
        totalPallets: 0,
      });
    }

    const entry = customerMap.get(customerId);
    if (entry) {
      entry.totalSales += 1;
      entry.totalBoxes += getTotalBoxesFromSale(sale);
      entry.totalPallets += getTotalPalletsFromSale(sale);
    }
  });

  const totalSales = sales.length;

  return Array.from(customerMap.entries())
    .map(([customerId, data]) => ({
      customerId,
      customerName: data.customerName,
      totalSales: data.totalSales,
      totalBoxes: data.totalBoxes,
      totalPallets: data.totalPallets,
      percentage: totalSales > 0 ? (data.totalSales / totalSales) * 100 : 0,
    }))
    .sort((a, b) => b.totalSales - a.totalSales);
}

/**
 * Aggregate sales by type
 */
export interface AggregatedByType {
  type: SaleType;
  totalSales: number;
  totalBoxes: number;
  totalPallets: number;
  percentage: number;
}

export function aggregateByType(sales: Sale[]): AggregatedByType[] {
  if (!Array.isArray(sales) || sales.length === 0) {
    return [];
  }

  const typeMap = new Map<
    SaleType,
    {
      totalSales: number;
      totalBoxes: number;
      totalPallets: number;
    }
  >();

  sales.forEach((sale) => {
    if (!sale) return;
    
    const type = (sale.type || 'Venta') as SaleType;

    if (!typeMap.has(type)) {
      typeMap.set(type, {
        totalSales: 0,
        totalBoxes: 0,
        totalPallets: 0,
      });
    }

    const entry = typeMap.get(type);
    if (entry) {
      entry.totalSales += 1;
      entry.totalBoxes += getTotalBoxesFromSale(sale);
      entry.totalPallets += getTotalPalletsFromSale(sale);
    }
  });

  const totalSales = sales.length;

  return Array.from(typeMap.entries())
    .map(([type, data]) => ({
      type,
      totalSales: data.totalSales,
      totalBoxes: data.totalBoxes,
      totalPallets: data.totalPallets,
      percentage: totalSales > 0 ? (data.totalSales / totalSales) * 100 : 0,
    }))
    .sort((a, b) => b.totalSales - a.totalSales);
}

/**
 * Aggregate sales by state
 */
export interface AggregatedByState {
  state: SaleState;
  totalSales: number;
  totalBoxes: number;
  totalPallets: number;
  percentage: number;
}

export function aggregateByState(sales: Sale[]): AggregatedByState[] {
  if (!Array.isArray(sales) || sales.length === 0) {
    return [];
  }

  const stateMap = new Map<
    SaleState,
    {
      totalSales: number;
      totalBoxes: number;
      totalPallets: number;
    }
  >();

  sales.forEach((sale) => {
    if (!sale) return;
    
    const state = (sale.state || 'DRAFT') as SaleState;

    if (!stateMap.has(state)) {
      stateMap.set(state, {
        totalSales: 0,
        totalBoxes: 0,
        totalPallets: 0,
      });
    }

    const entry = stateMap.get(state);
    if (entry) {
      entry.totalSales += 1;
      entry.totalBoxes += getTotalBoxesFromSale(sale);
      entry.totalPallets += getTotalPalletsFromSale(sale);
    }
  });

  const totalSales = sales.length;

  return Array.from(stateMap.entries())
    .map(([state, data]) => ({
      state,
      totalSales: data.totalSales,
      totalBoxes: data.totalBoxes,
      totalPallets: data.totalPallets,
      percentage: totalSales > 0 ? (data.totalSales / totalSales) * 100 : 0,
    }))
    .sort((a, b) => b.totalSales - a.totalSales);
}

/**
 * Aggregate sales by temporal period
 */
export interface SalesTemporalData {
  period: string;
  totalSales: number;
  totalBoxes: number;
  totalPallets: number;
  date: Date;
}

export function aggregateByTemporalPeriod(
  sales: Sale[],
  groupBy: 'day' | 'week' | 'month'
): SalesTemporalData[] {
  if (!Array.isArray(sales) || sales.length === 0) {
    return [];
  }

  const periodMap = new Map<
    string,
    {
      totalSales: number;
      totalBoxes: number;
      totalPallets: number;
      date: Date;
    }
  >();

  sales.forEach((sale) => {
    if (!sale || !sale.createdAt) return;
    
    let saleDate: Date;
    try {
      saleDate = new Date(sale.createdAt);
      if (isNaN(saleDate.getTime())) {
        return; // Skip invalid dates
      }
    } catch {
      return; // Skip if date parsing fails
    }
    
    let periodKey: string;

    if (groupBy === 'day') {
      periodKey = saleDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } else if (groupBy === 'week') {
      const weekStart = new Date(saleDate);
      weekStart.setDate(saleDate.getDate() - saleDate.getDay());
      periodKey = `Semana ${weekStart.toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
      })}`;
    } else {
      periodKey = saleDate.toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
      });
    }

    if (!periodMap.has(periodKey)) {
      periodMap.set(periodKey, {
        totalSales: 0,
        totalBoxes: 0,
        totalPallets: 0,
        date: new Date(saleDate),
      });
    }

    const entry = periodMap.get(periodKey)!;
    entry.totalSales += 1;
    entry.totalBoxes += getTotalBoxesFromSale(sale);
    entry.totalPallets += getTotalPalletsFromSale(sale);
  });

  return Array.from(periodMap.entries())
    .map(([period, data]) => ({
      period,
      totalSales: data.totalSales,
      totalBoxes: data.totalBoxes,
      totalPallets: data.totalPallets,
      date: data.date,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Calculate summary data for sales
 */
export interface SalesSummaryData {
  totalSales: number;
  totalBoxes: number;
  totalPallets: number;
  averageBoxesPerSale: number;
  averagePalletsPerSale: number;
  topCustomers: AggregatedByCustomer[];
  salesByType: AggregatedByType[];
  salesByState: AggregatedByState[];
}

export function calculateSalesSummary(sales: Sale[]): SalesSummaryData {
  if (!Array.isArray(sales)) {
    return {
      totalSales: 0,
      totalBoxes: 0,
      totalPallets: 0,
      averageBoxesPerSale: 0,
      averagePalletsPerSale: 0,
      topCustomers: [],
      salesByType: [],
      salesByState: [],
    };
  }

  const totalSales = sales.length;
  const totalBoxes = sales.reduce((sum, sale) => {
    if (!sale) return sum;
    return sum + getTotalBoxesFromSale(sale);
  }, 0);
  const totalPallets = sales.reduce((sum, sale) => {
    if (!sale) return sum;
    return sum + getTotalPalletsFromSale(sale);
  }, 0);

  const customers = aggregateByCustomer(sales);
  const byType = aggregateByType(sales);
  const byState = aggregateByState(sales);

  return {
    totalSales,
    totalBoxes,
    totalPallets,
    averageBoxesPerSale: totalSales > 0 ? totalBoxes / totalSales : 0,
    averagePalletsPerSale: totalSales > 0 ? totalPallets / totalSales : 0,
    topCustomers: customers.slice(0, 5),
    salesByType: byType,
    salesByState: byState,
  };
}

/**
 * Calculate period change indicator
 */
export function calculatePeriodChange(
  current: number,
  previous: number
): ChangeIndicator {
  return calculateSharedPeriodChange(current, previous);
}

/**
 * Get previous period based on current period type
 */
export function getPreviousPeriod(
  periodType: PeriodType,
  customStart?: Date,
  customEnd?: Date
): PeriodRange {
  return getSharedPreviousPeriod(periodType, customStart, customEnd);
}

/**
 * Compare two sales summary data sets
 */
export function compareSalesPeriods(
  current: SalesSummaryData,
  previous: SalesSummaryData
): PeriodComparison {
  return {
    totalSales: calculatePeriodChange(current.totalSales, previous.totalSales),
    totalBoxes: calculatePeriodChange(current.totalBoxes, previous.totalBoxes),
    totalPallets: calculatePeriodChange(current.totalPallets, previous.totalPallets),
    averageBoxesPerSale: calculatePeriodChange(
      current.averageBoxesPerSale,
      previous.averageBoxesPerSale
    ),
    averagePalletsPerSale: calculatePeriodChange(
      current.averagePalletsPerSale,
      previous.averagePalletsPerSale
    ),
  };
}

/**
 * Compare aggregated data between two periods
 */
export function compareAggregatedData<T extends { [key: string]: any }>(
  current: T[],
  previous: T[],
  keyField: string,
  valueField: string
): ComparisonResult<T>[] {
  const currentMap = new Map<string, T>();
  const previousMap = new Map<string, T>();

  current.forEach((item) => {
    const key = String(item[keyField]);
    currentMap.set(key, item);
  });

  previous.forEach((item) => {
    const key = String(item[keyField]);
    previousMap.set(key, item);
  });

  const allKeys = new Set([...currentMap.keys(), ...previousMap.keys()]);

  return Array.from(allKeys).map((key) => {
    const currentItem = currentMap.get(key) || null;
    const previousItem = previousMap.get(key) || null;

    const currentValue = currentItem ? safeNumber(currentItem[valueField]) : 0;
    const previousValue = previousItem ? safeNumber(previousItem[valueField]) : 0;

    return {
      key,
      current: currentItem,
      previous: previousItem,
      change: calculatePeriodChange(currentValue, previousValue),
    };
  });
}

