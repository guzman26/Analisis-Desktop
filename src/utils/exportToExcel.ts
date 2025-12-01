import { Sale } from '@/types';
import {
  SalesSummaryData,
  AggregatedByCustomer,
  AggregatedByType,
  AggregatedByState,
  SalesTemporalData,
  PeriodComparison,
} from './salesMetricsAggregation';

/**
 * Export sales data to Excel format
 * Uses a simple CSV approach that can be opened in Excel
 * For full Excel support, install xlsx or exceljs library
 */
export function exportSalesToExcel(
  sales: Sale[],
  summaryData: SalesSummaryData,
  customersData: AggregatedByCustomer[],
  typeData: AggregatedByType[],
  stateData: AggregatedByState[],
  temporalData: SalesTemporalData[],
  comparisonData?: {
    summaryComparison: SalesSummaryData | null;
    periodComparison: PeriodComparison | null;
    customersComparison: AggregatedByCustomer[];
    typeComparison: AggregatedByType[];
    stateComparison: AggregatedByState[];
    temporalComparison: SalesTemporalData[];
    period1Label?: string;
    period2Label?: string;
  }
): void {
  // Create CSV content for each sheet
  const sheets: Array<{ name: string; content: string }> = [];

  // Sheet 1: Listado completo de ventas
  const salesHeaders = [
    'ID Venta',
    'Fecha Creación',
    'Cliente',
    'Tipo',
    'Estado',
    'Total Cajas',
    'Total Pallets',
    'Fecha Confirmación',
    'Fecha Despacho',
    'Fecha Completado',
    'Notas',
  ];

  const salesRows = sales.map((sale) => {
    const totalBoxes =
      sale.totalBoxes ||
      sale.items?.reduce((sum, item) => sum + (item.boxIds?.length || 0), 0) ||
      sale.boxes?.length ||
      0;

    const totalPallets = sale.items
      ? new Set(sale.items.map((item) => item.palletId).filter(Boolean)).size
      : sale.pallets?.length || 0;

    return [
      sale.saleId,
      formatDateForExcel(sale.createdAt),
      sale.customerName || sale.customerInfo?.name || 'Sin nombre',
      sale.type || 'Venta',
      sale.state || 'DRAFT',
      totalBoxes.toString(),
      totalPallets.toString(),
      sale.confirmedAt ? formatDateForExcel(sale.confirmedAt) : '',
      sale.dispatchedAt ? formatDateForExcel(sale.dispatchedAt) : '',
      sale.completedAt ? formatDateForExcel(sale.completedAt) : '',
      (sale.notes || '').replace(/"/g, '""'), // Escape quotes
    ];
  });

  sheets.push({
    name: 'Ventas',
    content: createCSV([salesHeaders, ...salesRows]),
  });

  // Sheet 2: Resumen de métricas
  const summaryHeaders = ['Métrica', 'Valor'];
  const summaryRows = [
    ['Total Ventas', summaryData.totalSales.toString()],
    ['Total Cajas', summaryData.totalBoxes.toString()],
    ['Total Pallets', summaryData.totalPallets.toString()],
    ['Promedio Cajas por Venta', summaryData.averageBoxesPerSale.toFixed(2)],
    ['Promedio Pallets por Venta', summaryData.averagePalletsPerSale.toFixed(2)],
  ];

  sheets.push({
    name: 'Resumen',
    content: createCSV([summaryHeaders, ...summaryRows]),
  });

  // Sheet 3: Ventas por cliente
  const customersHeaders = ['Cliente', 'Total Ventas', 'Total Cajas', 'Total Pallets', 'Porcentaje'];
  const customersRows = customersData.map((customer) => [
    customer.customerName,
    customer.totalSales.toString(),
    customer.totalBoxes.toString(),
    customer.totalPallets.toString(),
    `${customer.percentage.toFixed(2)}%`,
  ]);

  sheets.push({
    name: 'Por Cliente',
    content: createCSV([customersHeaders, ...customersRows]),
  });

  // Sheet 4: Ventas por tipo
  const typeHeaders = ['Tipo', 'Total Ventas', 'Total Cajas', 'Total Pallets', 'Porcentaje'];
  const typeRows = typeData.map((type) => [
    type.type,
    type.totalSales.toString(),
    type.totalBoxes.toString(),
    type.totalPallets.toString(),
    `${type.percentage.toFixed(2)}%`,
  ]);

  sheets.push({
    name: 'Por Tipo',
    content: createCSV([typeHeaders, ...typeRows]),
  });

  // Sheet 5: Ventas por estado
  const stateHeaders = ['Estado', 'Total Ventas', 'Total Cajas', 'Total Pallets', 'Porcentaje'];
  const stateRows = stateData.map((state) => [
    state.state,
    state.totalSales.toString(),
    state.totalBoxes.toString(),
    state.totalPallets.toString(),
    `${state.percentage.toFixed(2)}%`,
  ]);

  sheets.push({
    name: 'Por Estado',
    content: createCSV([stateHeaders, ...stateRows]),
  });

  // Sheet 6: Evolución temporal
  const temporalHeaders = ['Período', 'Total Ventas', 'Total Cajas', 'Total Pallets'];
  const temporalRows = temporalData.map((temporal) => [
    temporal.period,
    temporal.totalSales.toString(),
    temporal.totalBoxes.toString(),
    temporal.totalPallets.toString(),
  ]);

  sheets.push({
    name: 'Evolución',
    content: createCSV([temporalHeaders, ...temporalRows]),
  });

  // Add comparison sheets if comparison data is provided
  if (comparisonData && comparisonData.periodComparison) {
    // Comparison Summary
    const comparisonSummaryHeaders = ['Métrica', 'Período 1', 'Período 2', 'Diferencia', '% Cambio'];
    const comparisonSummaryRows = [
      [
        'Total Ventas',
        summaryData.totalSales.toString(),
        comparisonData.summaryComparison?.totalSales.toString() || '0',
        comparisonData.periodComparison.totalSales.value.toString(),
        `${comparisonData.periodComparison.totalSales.percentage.toFixed(2)}%`,
      ],
      [
        'Total Cajas',
        summaryData.totalBoxes.toString(),
        comparisonData.summaryComparison?.totalBoxes.toString() || '0',
        comparisonData.periodComparison.totalBoxes.value.toString(),
        `${comparisonData.periodComparison.totalBoxes.percentage.toFixed(2)}%`,
      ],
      [
        'Total Pallets',
        summaryData.totalPallets.toString(),
        comparisonData.summaryComparison?.totalPallets.toString() || '0',
        comparisonData.periodComparison.totalPallets.value.toString(),
        `${comparisonData.periodComparison.totalPallets.percentage.toFixed(2)}%`,
      ],
      [
        'Promedio Cajas/Venta',
        summaryData.averageBoxesPerSale.toFixed(2),
        comparisonData.summaryComparison?.averageBoxesPerSale.toFixed(2) || '0.00',
        comparisonData.periodComparison.averageBoxesPerSale.value.toFixed(2),
        `${comparisonData.periodComparison.averageBoxesPerSale.percentage.toFixed(2)}%`,
      ],
      [
        'Promedio Pallets/Venta',
        summaryData.averagePalletsPerSale.toFixed(2),
        comparisonData.summaryComparison?.averagePalletsPerSale.toFixed(2) || '0.00',
        comparisonData.periodComparison.averagePalletsPerSale.value.toFixed(2),
        `${comparisonData.periodComparison.averagePalletsPerSale.percentage.toFixed(2)}%`,
      ],
    ];

    sheets.push({
      name: 'Comparación Resumen',
      content: createCSV([comparisonSummaryHeaders, ...comparisonSummaryRows]),
    });

    // Comparison by Customer
    const comparisonCustomersHeaders = [
      'Cliente',
      comparisonData.period1Label || 'Período 1',
      comparisonData.period2Label || 'Período 2',
      'Diferencia',
      '% Cambio',
    ];
    const comparisonCustomersRows = customersData.map((customer) => {
      const comparison = comparisonData.customersComparison.find((c) => c.customerId === customer.customerId);
      const currentValue = customer.totalSales;
      const previousValue = comparison?.totalSales || 0;
      const difference = currentValue - previousValue;
      const percentage = previousValue !== 0 ? ((difference / previousValue) * 100) : (currentValue > 0 ? 100 : 0);
      return [
        customer.customerName,
        currentValue.toString(),
        previousValue.toString(),
        difference.toString(),
        `${percentage.toFixed(2)}%`,
      ];
    });

    sheets.push({
      name: 'Comparación Clientes',
      content: createCSV([comparisonCustomersHeaders, ...comparisonCustomersRows]),
    });

    // Comparison by Type
    const comparisonTypeHeaders = [
      'Tipo',
      comparisonData.period1Label || 'Período 1',
      comparisonData.period2Label || 'Período 2',
      'Diferencia',
      '% Cambio',
    ];
    const comparisonTypeRows = typeData.map((type) => {
      const comparison = comparisonData.typeComparison.find((t) => t.type === type.type);
      const currentValue = type.totalSales;
      const previousValue = comparison?.totalSales || 0;
      const difference = currentValue - previousValue;
      const percentage = previousValue !== 0 ? ((difference / previousValue) * 100) : (currentValue > 0 ? 100 : 0);
      return [
        type.type,
        currentValue.toString(),
        previousValue.toString(),
        difference.toString(),
        `${percentage.toFixed(2)}%`,
      ];
    });

    sheets.push({
      name: 'Comparación Tipos',
      content: createCSV([comparisonTypeHeaders, ...comparisonTypeRows]),
    });

    // Comparison by State
    const comparisonStateHeaders = [
      'Estado',
      comparisonData.period1Label || 'Período 1',
      comparisonData.period2Label || 'Período 2',
      'Diferencia',
      '% Cambio',
    ];
    const comparisonStateRows = stateData.map((state) => {
      const comparison = comparisonData.stateComparison.find((s) => s.state === state.state);
      const currentValue = state.totalSales;
      const previousValue = comparison?.totalSales || 0;
      const difference = currentValue - previousValue;
      const percentage = previousValue !== 0 ? ((difference / previousValue) * 100) : (currentValue > 0 ? 100 : 0);
      return [
        state.state,
        currentValue.toString(),
        previousValue.toString(),
        difference.toString(),
        `${percentage.toFixed(2)}%`,
      ];
    });

    sheets.push({
      name: 'Comparación Estados',
      content: createCSV([comparisonStateHeaders, ...comparisonStateRows]),
    });
  }

  // For now, we'll create a single CSV file with all sheets combined
  // In a full implementation with xlsx library, we'd create a proper Excel file with multiple sheets
  const allContent = sheets
    .map((sheet) => `\n\n=== ${sheet.name} ===\n\n${sheet.content}`)
    .join('\n');

  // Create and download the file
  const filename = comparisonData
    ? `metricas-ventas-comparacion-${new Date().toISOString().split('T')[0]}.csv`
    : `metricas-ventas-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(allContent, filename);
}

/**
 * Create CSV string from rows
 */
function createCSV(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const cellStr = String(cell || '');
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(',')
    )
    .join('\n');
}

/**
 * Format date for Excel (YYYY-MM-DD)
 */
function formatDateForExcel(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

/**
 * Download CSV file
 */
function downloadCSV(content: string, filename: string): void {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel UTF-8
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Future: Full Excel export with xlsx library
 * Uncomment and install xlsx when needed:
 * npm install xlsx
 * npm install --save-dev @types/xlsx
 */
/*
import * as XLSX from 'xlsx';

export function exportSalesToExcelFull(
  sales: Sale[],
  summaryData: SalesSummaryData,
  customersData: AggregatedByCustomer[],
  typeData: AggregatedByType[],
  stateData: AggregatedByState[],
  temporalData: SalesTemporalData[]
): void {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Sales list
  const salesData = sales.map((sale) => ({
    'ID Venta': sale.saleId,
    'Fecha Creación': formatDateForExcel(sale.createdAt),
    Cliente: sale.customerName || sale.customerInfo?.name || 'Sin nombre',
    Tipo: sale.type || 'Venta',
    Estado: sale.state || 'DRAFT',
    'Total Cajas': sale.totalBoxes || sale.items?.reduce((sum, item) => sum + (item.boxIds?.length || 0), 0) || 0,
    'Total Pallets': sale.items ? new Set(sale.items.map((item) => item.palletId).filter(Boolean)).size : sale.pallets?.length || 0,
    'Fecha Confirmación': sale.confirmedAt ? formatDateForExcel(sale.confirmedAt) : '',
    'Fecha Despacho': sale.dispatchedAt ? formatDateForExcel(sale.dispatchedAt) : '',
    'Fecha Completado': sale.completedAt ? formatDateForExcel(sale.completedAt) : '',
  }));
  const salesSheet = XLSX.utils.json_to_sheet(salesData);
  XLSX.utils.book_append_sheet(workbook, salesSheet, 'Ventas');

  // Sheet 2: Summary
  const summarySheet = XLSX.utils.json_to_sheet([
    { Métrica: 'Total Ventas', Valor: summaryData.totalSales },
    { Métrica: 'Total Cajas', Valor: summaryData.totalBoxes },
    { Métrica: 'Total Pallets', Valor: summaryData.totalPallets },
    { Métrica: 'Promedio Cajas por Venta', Valor: summaryData.averageBoxesPerSale.toFixed(2) },
    { Métrica: 'Promedio Pallets por Venta', Valor: summaryData.averagePalletsPerSale.toFixed(2) },
  ]);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

  // Add more sheets as needed...

  // Write file
  const filename = `metricas-ventas-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
*/

