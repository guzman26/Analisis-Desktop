import { PeriodRange, PeriodType } from '@/utils/metricsAggregation';

export interface ChangeIndicator {
  value: number;
  percentage: number;
  isPositive: boolean;
  isNegative: boolean;
  isNeutral: boolean;
}

export function calculatePeriodChange(
  current: number,
  previous: number
): ChangeIndicator {
  const value = current - previous;
  const percentage =
    previous !== 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;

  return {
    value,
    percentage,
    isPositive: value > 0,
    isNegative: value < 0,
    isNeutral: value === 0,
  };
}

export function getPreviousPeriod(
  periodType: PeriodType,
  customStart?: Date,
  customEnd?: Date
): PeriodRange {
  const now = new Date();
  let start: Date;
  let end: Date;

  switch (periodType) {
    case 'week': {
      end = new Date(now);
      end.setDate(now.getDate() - 7);
      end.setHours(23, 59, 59, 999);
      start = new Date(end);
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return {
        start,
        end,
        label: `Semana Anterior (${start.toLocaleDateString('es-ES', {
          month: 'short',
          day: 'numeric',
        })} - ${end.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })})`,
      };
    }
    case 'month': {
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      start = new Date(prevMonth);
      start.setHours(0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
      return {
        start,
        end,
        label: `Mes Anterior (${prevMonth.toLocaleDateString('es-ES', {
          month: 'long',
          year: 'numeric',
        })})`,
      };
    }
    case 'quarter': {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const prevQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
      const prevQuarterYear =
        currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
      start = new Date(prevQuarterYear, prevQuarter * 3, 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(prevQuarterYear, (prevQuarter + 1) * 3, 0);
      end.setHours(23, 59, 59, 999);
      return {
        start,
        end,
        label: `Trimestre ${prevQuarter + 1} ${prevQuarterYear}`,
      };
    }
    case 'semester': {
      const currentSemester = Math.floor(now.getMonth() / 6);
      const prevSemester = currentSemester === 0 ? 1 : 0;
      const prevSemesterYear =
        currentSemester === 0 ? now.getFullYear() - 1 : now.getFullYear();
      start = new Date(prevSemesterYear, prevSemester * 6, 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(prevSemesterYear, (prevSemester + 1) * 6, 0);
      end.setHours(23, 59, 59, 999);
      return {
        start,
        end,
        label: `Semestre ${prevSemester + 1} ${prevSemesterYear}`,
      };
    }
    case 'year': {
      start = new Date(now.getFullYear() - 1, 0, 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(now.getFullYear() - 1, 11, 31);
      end.setHours(23, 59, 59, 999);
      return {
        start,
        end,
        label: `Año ${now.getFullYear() - 1}`,
      };
    }
    case 'custom': {
      if (customStart && customEnd) {
        const duration = customEnd.getTime() - customStart.getTime();
        end = new Date(customStart);
        end.setTime(end.getTime() - 1);
        end.setHours(23, 59, 59, 999);
        start = new Date(end);
        start.setTime(start.getTime() - duration);
        start.setHours(0, 0, 0, 0);
        return {
          start,
          end,
          label: `${start.toLocaleDateString('es-ES')} - ${end.toLocaleDateString('es-ES')}`,
        };
      }
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      start = new Date(prevMonth);
      start.setHours(0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
      return {
        start,
        end,
        label: `Mes Anterior (${prevMonth.toLocaleDateString('es-ES', {
          month: 'long',
          year: 'numeric',
        })})`,
      };
    }
  }
}

