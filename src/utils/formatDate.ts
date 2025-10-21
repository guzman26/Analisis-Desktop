export const formatDate = (input: string | Date): string => {
  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
};

/**
 * Calcula la fecha real a partir de componentes del código de caja
 * @param dayOfWeek - Día de la semana (1-7)
 * @param weekNumber - Número de semana ISO (1-52)
 * @param year - Año en formato YY
 * @returns Fecha en formato DD/MM/YYYY
 */
export const calculateDateFromBoxCode = (
  dayOfWeek: string,
  weekNumber: string,
  year: string
): string => {
  try {
    const fullYear =
      parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
    const weekNum = parseInt(weekNumber);
    const day = parseInt(dayOfWeek);

    // Calculate the date from ISO week number
    // ISO week 1 is the first week with a Thursday
    const jan4 = new Date(fullYear, 0, 4);
    const dayOffset = jan4.getDay() - 1; // Monday = 0
    const weekStart = new Date(jan4);
    weekStart.setDate(jan4.getDate() - dayOffset + (weekNum - 1) * 7);

    // Add days of week (Monday = 0, Sunday = 6)
    // But our format uses Monday = 1, Sunday = 7
    const adjustedDay = day === 7 ? 0 : day; // Convert 7 (Sunday) to 0
    const resultDate = new Date(weekStart);
    resultDate.setDate(weekStart.getDate() + adjustedDay);

    const dayFormatted = String(resultDate.getDate()).padStart(2, '0');
    const monthFormatted = String(resultDate.getMonth() + 1).padStart(2, '0');
    const yearFormatted = resultDate.getFullYear();

    return `${dayFormatted}/${monthFormatted}/${yearFormatted}`;
  } catch {
    return 'N/A';
  }
};
