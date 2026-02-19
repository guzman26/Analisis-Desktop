export interface Metric {
  metricType: string;
  dateKey: string;
  date: string;
  data: any;
  calculatedAt: string;
  isFinal: boolean;
}

export type PeriodType =
  | 'week'
  | 'month'
  | 'quarter'
  | 'semester'
  | 'year'
  | 'custom';

export interface PeriodRange {
  start: Date;
  end: Date;
  label: string;
}

export interface AggregatedByOperario {
  operario: string;
  totalBoxes: number;
  totalPallets: number;
  daysWorked: number;
  percentage: number;
}

export interface AggregatedByCalibre {
  calibre: string;
  totalBoxes: number;
  totalEggUnits: number;
  percentageBoxes: number;
  percentageEggUnits: number;
}

export interface AggregatedByHorario {
  horario: string;
  totalBoxes: number;
  totalPallets: number;
  percentage: number;
}

export interface TemporalData {
  period: string;
  totalBoxes: number;
  totalPallets: number;
  totalCarts: number;
  date: Date;
}

export interface SummaryData {
  totalBoxes: number;
  totalPallets: number;
  totalCarts: number;
  totalDays: number;
  topOperarios: AggregatedByOperario[];
  topCalibres: AggregatedByCalibre[];
  topHorarios: AggregatedByHorario[];
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
 * Calculate date range for a period type
 */
export function getPeriodRange(
  periodType: PeriodType,
  customStart?: Date,
  customEnd?: Date
): PeriodRange {
  const now = new Date();
  let start: Date;
  let end: Date = new Date(now);
  end.setHours(23, 59, 59, 999);

  switch (periodType) {
    case 'week': {
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return {
        start,
        end,
        label: 'Última Semana',
      };
    }
    case 'month': {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      return {
        start,
        end,
        label: `Mes Actual (${now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })})`,
      };
    }
    case 'quarter': {
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      start.setHours(0, 0, 0, 0);
      return {
        start,
        end,
        label: `Trimestre ${quarter + 1} ${now.getFullYear()}`,
      };
    }
    case 'semester': {
      const semester = Math.floor(now.getMonth() / 6);
      start = new Date(now.getFullYear(), semester * 6, 1);
      start.setHours(0, 0, 0, 0);
      return {
        start,
        end,
        label: `Semestre ${semester + 1} ${now.getFullYear()}`,
      };
    }
    case 'year': {
      start = new Date(now.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
      return {
        start,
        end,
        label: `Año ${now.getFullYear()}`,
      };
    }
    case 'custom': {
      if (!customStart || !customEnd) {
        // Default to last month
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
      } else {
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
      }
      return {
        start,
        end,
        label: `${start.toLocaleDateString('es-ES')} - ${end.toLocaleDateString('es-ES')}`,
      };
    }
  }
}

/**
 * Filter metrics by date range
 */
export function filterMetricsByPeriod(
  metrics: Metric[],
  periodRange: PeriodRange
): Metric[] {
  return metrics.filter((metric) => {
    const metricDate = new Date(metric.date || metric.dateKey);
    return metricDate >= periodRange.start && metricDate <= periodRange.end;
  });
}

/**
 * Aggregate metrics by operario
 */
export function aggregateByOperario(metrics: Metric[]): AggregatedByOperario[] {
  const operarioMap = new Map<
    string,
    {
      totalBoxes: number;
      totalPallets: number;
      daysWorked: Set<string>;
    }
  >();

  metrics.forEach((metric) => {
    if (metric.metricType !== 'PRODUCTION_DAILY') return;
    const data = metric.data || {};
    const boxesByOperario = data.boxesByOperario || {};

    Object.entries(boxesByOperario).forEach(([operario, boxes]) => {
      const boxesNum = safeNumber(boxes);
      if (boxesNum === 0) return;

      if (!operarioMap.has(operario)) {
        operarioMap.set(operario, {
          totalBoxes: 0,
          totalPallets: 0,
          daysWorked: new Set(),
        });
      }

      const entry = operarioMap.get(operario)!;
      entry.totalBoxes += boxesNum;
      entry.totalPallets +=
        safeNumber(data.totalPallets) *
        (boxesNum / safeNumber(data.totalBoxes));
      entry.daysWorked.add(metric.date || metric.dateKey);
    });
  });

  const totalBoxes = Array.from(operarioMap.values()).reduce(
    (sum, entry) => sum + entry.totalBoxes,
    0
  );

  return Array.from(operarioMap.entries())
    .map(([operario, data]) => ({
      operario,
      totalBoxes: data.totalBoxes,
      totalPallets: Math.round(data.totalPallets),
      daysWorked: data.daysWorked.size,
      percentage: totalBoxes > 0 ? (data.totalBoxes / totalBoxes) * 100 : 0,
    }))
    .sort((a, b) => b.totalBoxes - a.totalBoxes);
}

/**
 * Aggregate metrics by calibre
 */
export function aggregateByCalibre(metrics: Metric[]): AggregatedByCalibre[] {
  const calibreMap = new Map<string, { totalBoxes: number; totalEggUnits: number }>();

  metrics.forEach((metric) => {
    if (metric.metricType !== 'PRODUCTION_DAILY') return;
    const data = metric.data || {};
    const boxesByCalibre = data.boxesByCalibre || {};
    const eggsByCalibre = data.eggsByCalibre || {};

    Object.entries(boxesByCalibre).forEach(([calibre, boxes]) => {
      const boxesNum = safeNumber(boxes);
      if (boxesNum === 0) return;

      const current = calibreMap.get(calibre) || { totalBoxes: 0, totalEggUnits: 0 };
      current.totalBoxes += boxesNum;
      calibreMap.set(calibre, current);
    });

    Object.entries(eggsByCalibre).forEach(([calibre, eggs]) => {
      const eggsNum = safeNumber(eggs);
      if (eggsNum === 0) return;

      const current = calibreMap.get(calibre) || { totalBoxes: 0, totalEggUnits: 0 };
      current.totalEggUnits += eggsNum;
      calibreMap.set(calibre, current);
    });
  });

  const totalBoxes = Array.from(calibreMap.values()).reduce(
    (sum, values) => sum + values.totalBoxes,
    0
  );
  const totalEggUnits = Array.from(calibreMap.values()).reduce(
    (sum, values) => sum + values.totalEggUnits,
    0
  );

  return Array.from(calibreMap.entries())
    .map(([calibre, values]) => ({
      calibre,
      totalBoxes: values.totalBoxes,
      totalEggUnits: values.totalEggUnits,
      percentageBoxes: totalBoxes > 0 ? (values.totalBoxes / totalBoxes) * 100 : 0,
      percentageEggUnits:
        totalEggUnits > 0 ? (values.totalEggUnits / totalEggUnits) * 100 : 0,
    }))
    .sort((a, b) => b.totalEggUnits - a.totalEggUnits || b.totalBoxes - a.totalBoxes);
}

/**
 * Aggregate metrics by horario/turno
 */
export function aggregateByHorario(metrics: Metric[]): AggregatedByHorario[] {
  const horarioMap = new Map<
    string,
    {
      totalBoxes: number;
      totalPallets: number;
    }
  >();

  metrics.forEach((metric) => {
    if (metric.metricType !== 'PRODUCTION_DAILY') return;
    const data = metric.data || {};
    const boxesByShift = data.boxesByShift || {};

    Object.entries(boxesByShift).forEach(([horario, boxes]) => {
      const boxesNum = safeNumber(boxes);
      if (boxesNum === 0) return;

      if (!horarioMap.has(horario)) {
        horarioMap.set(horario, {
          totalBoxes: 0,
          totalPallets: 0,
        });
      }

      const entry = horarioMap.get(horario)!;
      entry.totalBoxes += boxesNum;
      entry.totalPallets +=
        safeNumber(data.totalPallets) *
        (boxesNum / safeNumber(data.totalBoxes));
    });
  });

  const totalBoxes = Array.from(horarioMap.values()).reduce(
    (sum, entry) => sum + entry.totalBoxes,
    0
  );

  return Array.from(horarioMap.entries())
    .map(([horario, data]) => ({
      horario: `Turno ${horario}`,
      totalBoxes: data.totalBoxes,
      totalPallets: Math.round(data.totalPallets),
      percentage: totalBoxes > 0 ? (data.totalBoxes / totalBoxes) * 100 : 0,
    }))
    .sort(
      (a, b) =>
        parseInt(a.horario.split(' ')[1]) - parseInt(b.horario.split(' ')[1])
    );
}

/**
 * Aggregate metrics by temporal periods (week/month)
 */
export function aggregateByTemporalPeriod(
  metrics: Metric[],
  groupBy: 'week' | 'month'
): TemporalData[] {
  const periodMap = new Map<
    string,
    {
      totalBoxes: number;
      totalPallets: number;
      totalCarts: number;
      date: Date;
    }
  >();

  metrics.forEach((metric) => {
    if (metric.metricType !== 'PRODUCTION_DAILY') return;
    const metricDate = new Date(metric.date || metric.dateKey);
    const data = metric.data || {};

    let periodKey: string;
    if (groupBy === 'week') {
      const weekStart = new Date(metricDate);
      weekStart.setDate(metricDate.getDate() - metricDate.getDay());
      periodKey = `Semana ${weekStart.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}`;
    } else {
      periodKey = metricDate.toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
      });
    }

    if (!periodMap.has(periodKey)) {
      periodMap.set(periodKey, {
        totalBoxes: 0,
        totalPallets: 0,
        totalCarts: 0,
        date: new Date(metricDate),
      });
    }

    const entry = periodMap.get(periodKey)!;
    entry.totalBoxes += safeNumber(data.totalBoxes);
    entry.totalPallets += safeNumber(data.totalPallets);
    entry.totalCarts += safeNumber(data.totalCarts);
  });

  return Array.from(periodMap.entries())
    .map(([period, data]) => ({
      period,
      totalBoxes: data.totalBoxes,
      totalPallets: data.totalPallets,
      totalCarts: data.totalCarts,
      date: data.date,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Calculate summary data for a period
 */
export function calculateSummary(metrics: Metric[]): SummaryData {
  const productionMetrics = metrics.filter(
    (m) => m.metricType === 'PRODUCTION_DAILY'
  );

  const totalBoxes = productionMetrics.reduce(
    (sum, m) => sum + safeNumber(m.data?.totalBoxes || 0),
    0
  );

  const totalPallets = productionMetrics.reduce(
    (sum, m) => sum + safeNumber(m.data?.totalPallets || 0),
    0
  );

  const totalCarts = productionMetrics.reduce(
    (sum, m) => sum + safeNumber(m.data?.totalCarts || 0),
    0
  );

  const uniqueDates = new Set(
    productionMetrics.map((m) => m.date || m.dateKey)
  );

  const operarios = aggregateByOperario(productionMetrics);
  const calibres = aggregateByCalibre(productionMetrics);
  const horarios = aggregateByHorario(productionMetrics);

  return {
    totalBoxes,
    totalPallets,
    totalCarts,
    totalDays: uniqueDates.size,
    topOperarios: operarios.slice(0, 5),
    topCalibres: calibres.slice(0, 5),
    topHorarios: horarios,
  };
}

/**
 * Format period label
 */
export function formatPeriodLabel(periodRange: PeriodRange): string {
  return periodRange.label;
}
