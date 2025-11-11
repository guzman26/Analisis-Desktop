/**
 * Freshness Calculation Utilities
 * Calculates egg/box age from pallet codes based on production date
 */

export interface ProductionDate {
  dayOfWeek: number; // 1-7
  weekOfYear: number; // 1-53
  year: number; // Full year (e.g., 2024)
}

export interface FreshnessInfo {
  productionDate: Date;
  ageInDays: number;
  freshnessLevel: 'fresh' | 'good' | 'aging' | 'old';
  freshnessColor: string;
  freshnessLabel: string;
}

/**
 * Parse production date from pallet code
 * First 5 digits: dayOfWeek(1) + weekOfYear(2) + year(2)
 * Example: "12425" = day 1, week 24, year 25 (2025)
 */
export function parseProductionDateFromPalletCode(palletCode: string): ProductionDate | null {
  if (!palletCode || palletCode.length < 5) {
    return null;
  }

  try {
    const dayOfWeek = parseInt(palletCode[0], 10); // 1-7 (1=Monday, 7=Sunday)
    const weekOfYear = parseInt(palletCode.slice(1, 3), 10); // 1-53
    const yearYY = parseInt(palletCode.slice(3, 5), 10); // 00-99
    const year = 2000 + yearYY;

    // Validate ranges
    if (dayOfWeek < 1 || dayOfWeek > 7) return null;
    if (weekOfYear < 1 || weekOfYear > 53) return null;
    if (year < 2020 || year > 2099) return null;

    return { dayOfWeek, weekOfYear, year };
  } catch (error) {
    console.error('Error parsing production date from pallet code:', error);
    return null;
  }
}

/**
 * Calculate actual date from week number and day of week
 * ISO 8601 week date system - using UTC to avoid timezone issues
 */
export function calculateDateFromWeek(
  year: number,
  weekOfYear: number,
  dayOfWeek: number
): Date {
  // Calcular usando UTC para evitar problemas de zona horaria
  // La semana ISO 1 es la primera semana que contiene un jueves
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOffset = (jan4.getUTCDay() + 6) % 7; // Lunes = 0, Domingo = 6
  const weekStart = new Date(jan4);
  weekStart.setUTCDate(jan4.getUTCDate() - dayOffset + (weekOfYear - 1) * 7);
  
  // Ajustar por día de la semana (1=Lunes, 7=Domingo)
  const adjustedDay = dayOfWeek - 1;
  const targetDate = new Date(weekStart);
  targetDate.setUTCDate(weekStart.getUTCDate() + adjustedDay);
  
  return targetDate;
}

/**
 * Get production date as Date object from pallet code
 */
export function getProductionDate(palletCode: string): Date | null {
  const parsed = parseProductionDateFromPalletCode(palletCode);
  if (!parsed) return null;

  return calculateDateFromWeek(parsed.year, parsed.weekOfYear, parsed.dayOfWeek);
}

/**
 * Calculate age in days from production date
 */
export function calculateAgeInDays(productionDate: Date, referenceDate: Date = new Date()): number {
  const diffInMs = referenceDate.getTime() - productionDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffInDays); // Never negative
}

/**
 * Determine freshness level based on age
 * 0-7 days: Fresh
 * 8-14 days: Good
 * 15-21 days: Aging
 * 22+ days: Old
 */
export function getFreshnessLevel(ageInDays: number): FreshnessInfo['freshnessLevel'] {
  if (ageInDays <= 7) return 'fresh';
  if (ageInDays <= 14) return 'good';
  if (ageInDays <= 21) return 'aging';
  return 'old';
}

/**
 * Get color associated with freshness level
 */
export function getFreshnessColor(level: FreshnessInfo['freshnessLevel']): string {
  const colors = {
    fresh: '#10b981', // Green
    good: '#fbbf24',  // Yellow
    aging: '#f97316', // Orange
    old: '#ef4444',   // Red
  };
  return colors[level];
}

/**
 * Get label for freshness level
 */
export function getFreshnessLabel(level: FreshnessInfo['freshnessLevel']): string {
  const labels = {
    fresh: 'Fresco',
    good: 'Bueno',
    aging: 'Envejeciendo',
    old: 'Antiguo',
  };
  return labels[level];
}

/**
 * Get complete freshness information for a pallet
 */
export function getFreshnessInfo(palletCode: string, referenceDate: Date = new Date()): FreshnessInfo | null {
  const productionDate = getProductionDate(palletCode);
  if (!productionDate) return null;

  const ageInDays = calculateAgeInDays(productionDate, referenceDate);
  const freshnessLevel = getFreshnessLevel(ageInDays);

  return {
    productionDate,
    ageInDays,
    freshnessLevel,
    freshnessColor: getFreshnessColor(freshnessLevel),
    freshnessLabel: getFreshnessLabel(freshnessLevel),
  };
}

/**
 * Format age for display
 */
export function formatAge(ageInDays: number): string {
  if (ageInDays === 0) return 'Hoy';
  if (ageInDays === 1) return '1 día';
  return `${ageInDays} días`;
}

/**
 * Calculate average age from multiple pallet codes
 */
export function calculateAverageAge(palletCodes: string[], referenceDate: Date = new Date()): number | null {
  const ages = palletCodes
    .map((code) => {
      const info = getFreshnessInfo(code, referenceDate);
      return info?.ageInDays;
    })
    .filter((age): age is number => age !== null && age !== undefined);

  if (ages.length === 0) return null;

  const sum = ages.reduce((acc, age) => acc + age, 0);
  return Math.round(sum / ages.length);
}

/**
 * Find oldest pallet from a list
 */
export function findOldestPallet(palletCodes: string[], referenceDate: Date = new Date()): {
  palletCode: string;
  ageInDays: number;
} | null {
  let oldest: { palletCode: string; ageInDays: number } | null = null;

  palletCodes.forEach((code) => {
    const info = getFreshnessInfo(code, referenceDate);
    if (info && (!oldest || info.ageInDays > oldest.ageInDays)) {
      oldest = {
        palletCode: code,
        ageInDays: info.ageInDays,
      };
    }
  });

  return oldest;
}

/**
 * Sort pallets by age (oldest first for FIFO)
 */
export function sortPalletsByAge(
  palletCodes: string[],
  order: 'oldest-first' | 'newest-first' = 'oldest-first',
  referenceDate: Date = new Date()
): string[] {
  const palletsWithAge = palletCodes
    .map((code) => ({
      code,
      age: getFreshnessInfo(code, referenceDate)?.ageInDays ?? -1,
    }))
    .filter((p) => p.age >= 0);

  palletsWithAge.sort((a, b) => {
    return order === 'oldest-first' ? b.age - a.age : a.age - b.age;
  });

  return palletsWithAge.map((p) => p.code);
}

/**
 * Check if pallet should show freshness warning
 */
export function shouldShowFreshnessWarning(palletCode: string, warningThreshold: number = 21): boolean {
  const info = getFreshnessInfo(palletCode);
  return info ? info.ageInDays >= warningThreshold : false;
}

