export const formatDate = (input: string | Date): string => {
  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) return '';
  
  // Usar métodos UTC para evitar problemas de zona horaria
  // Cuando el backend envía fechas ISO UTC (ej: "2025-11-11T00:00:00.000Z"),
  // debemos usar UTC para que el día no cambie según la zona horaria local
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = String(date.getUTCFullYear());
  return `${day}/${month}/${year}`;
};

/**
 * Calcula la fecha real a partir de componentes del código de caja
 * @param dayOfWeek - Día de la semana (1-7, donde 1=Lunes, 7=Domingo)
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

    // Calcular la fecha desde el número de semana ISO usando UTC
    // La semana ISO 1 es la primera semana que contiene un jueves
    // Usamos UTC para evitar problemas de zona horaria
    const jan4 = new Date(Date.UTC(fullYear, 0, 4));
    const dayOffset = (jan4.getUTCDay() + 6) % 7; // Lunes = 0, Domingo = 6
    const weekStart = new Date(jan4);
    weekStart.setUTCDate(jan4.getUTCDate() - dayOffset + (weekNum - 1) * 7);

    // Ajustar por día de la semana (nuestro formato: 1=Lunes, 7=Domingo)
    // weekStart ya apunta al Lunes, entonces:
    // 1 (Lunes) = +0 días, 2 (Martes) = +1 día, ... 7 (Domingo) = +6 días
    const adjustedDay = day - 1;
    const resultDate = new Date(weekStart);
    resultDate.setUTCDate(weekStart.getUTCDate() + adjustedDay);

    const dayFormatted = String(resultDate.getUTCDate()).padStart(2, '0');
    const monthFormatted = String(resultDate.getUTCMonth() + 1).padStart(2, '0');
    const yearFormatted = resultDate.getUTCFullYear();

    return `${dayFormatted}/${monthFormatted}/${yearFormatted}`;
  } catch {
    return 'N/A';
  }
};
