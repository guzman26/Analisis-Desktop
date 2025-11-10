/**
 * BOX CODE FORMATTERS
 * 
 * Funciones para formatear y mostrar los valores parseados de códigos de cajas
 * de forma legible para el usuario.
 */

import { ParsedBoxCode } from './boxCodeParser';
import { CALIBRE_MAP } from './getParamsFromCodigo';

/**
 * Mapeo de días de la semana
 */
const DAY_OF_WEEK_MAP: Record<string, string> = {
  '1': 'Lunes',
  '2': 'Martes',
  '3': 'Miércoles',
  '4': 'Jueves',
  '5': 'Viernes',
  '6': 'Sábado',
  '7': 'Domingo',
};

/**
 * Mapeo de turnos
 */
const SHIFT_MAP: Record<string, string> = {
  '1': 'Mañana',
  '2': 'Tarde',
};

/**
 * Mapeo de formatos de caja
 */
const FORMAT_MAP: Record<string, string> = {
  '1': 'Formato 1',
  '2': 'Formato 2',
  '3': 'Formato 3',
  '4': 'Formato 4',
  '5': 'Formato 5',
  '6': 'Formato 6',
  '7': 'Formato 7',
  '8': 'Formato 8',
  '9': 'Formato 9',
};

/**
 * Formatea el día de la semana
 */
export function formatDayOfWeek(dayOfWeek: string): string {
  return DAY_OF_WEEK_MAP[dayOfWeek] || `Día ${dayOfWeek}`;
}

/**
 * Formatea el turno
 */
export function formatShift(shift: string): string {
  return SHIFT_MAP[shift] || `Turno ${shift}`;
}

/**
 * Formatea el calibre usando el mapeo centralizado
 */
export function formatCaliber(caliber: string): string {
  return CALIBRE_MAP[caliber] || `Calibre ${caliber}`;
}

/**
 * Formatea el calibre (versión corta) - usa el mismo mapeo centralizado
 */
export function formatCaliberShort(caliber: string): string {
  return CALIBRE_MAP[caliber] || caliber;
}

/**
 * Formatea el formato de caja
 */
export function formatBoxFormat(format: string): string {
  return FORMAT_MAP[format] || `Formato ${format}`;
}

/**
 * Formatea el operario
 */
export function formatOperator(operator: string): string {
  return `Operario ${operator}`;
}

/**
 * Formatea la empacadora
 */
export function formatPacker(packer: string): string {
  return `Empacadora ${packer}`;
}

/**
 * Formatea la semana del año
 */
export function formatWeekOfYear(weekOfYear: string): string {
  return `Semana ${parseInt(weekOfYear, 10)}`;
}

/**
 * Formatea el contador
 */
export function formatCounter(counter: string): string {
  return parseInt(counter, 10).toString();
}

/**
 * Formatea el código de empresa
 */
export function formatCompanyCode(companyCode: string): string {
  return `Empresa ${companyCode}`;
}

/**
 * Convierte un código parseado a un objeto con valores legibles
 */
export interface FormattedBoxCode {
  // Valores originales
  codigo: string;
  dayOfWeek: string;
  weekOfYear: string;
  year: string;
  operator: string;
  packer: string;
  shift: string;
  caliber: string;
  format: string;
  companyCode: string;
  counter: string;
  
  // Valores formateados
  dayOfWeekDisplay: string;
  weekOfYearDisplay: string;
  operatorDisplay: string;
  packerDisplay: string;
  shiftDisplay: string;
  caliberDisplay: string;
  caliberShortDisplay: string;
  formatDisplay: string;
  companyCodeDisplay: string;
  counterDisplay: string;
}

/**
 * Convierte un código parseado a formato de display
 */
export function formatParsedBoxCode(parsed: ParsedBoxCode): FormattedBoxCode {
  return {
    // Valores originales
    codigo: parsed.codigo,
    dayOfWeek: parsed.dayOfWeek,
    weekOfYear: parsed.weekOfYear,
    year: parsed.year,
    operator: parsed.operator,
    packer: parsed.packer,
    shift: parsed.shift,
    caliber: parsed.caliber,
    format: parsed.format,
    companyCode: parsed.companyCode,
    counter: parsed.counter,
    
    // Valores formateados
    dayOfWeekDisplay: formatDayOfWeek(parsed.dayOfWeek),
    weekOfYearDisplay: formatWeekOfYear(parsed.weekOfYear),
    operatorDisplay: formatOperator(parsed.operator),
    packerDisplay: formatPacker(parsed.packer),
    shiftDisplay: formatShift(parsed.shift),
    caliberDisplay: formatCaliber(parsed.caliber),
    caliberShortDisplay: formatCaliberShort(parsed.caliber),
    formatDisplay: formatBoxFormat(parsed.format),
    companyCodeDisplay: formatCompanyCode(parsed.companyCode),
    counterDisplay: formatCounter(parsed.counter),
  };
}

/**
 * Obtiene un resumen del código parseado en una sola línea
 */
export function getBoxCodeSummary(parsed: ParsedBoxCode): string {
  return `${formatDayOfWeek(parsed.dayOfWeek)}, Semana ${parseInt(parsed.weekOfYear, 10)} de ${parsed.year} - ${formatCaliberShort(parsed.caliber)} - ${formatShift(parsed.shift)}`;
}

/**
 * Obtiene información de producción formateada
 */
export interface ProductionInfo {
  dayOfWeek: string;
  dayOfWeekDisplay: string;
  weekOfYear: number;
  year: string;
  shift: string;
  shiftDisplay: string;
  operator: string;
  operatorDisplay: string;
  packer: string;
  packerDisplay: string;
}

/**
 * Extrae información de producción formateada
 */
export function getProductionInfo(parsed: ParsedBoxCode): ProductionInfo {
  return {
    dayOfWeek: parsed.dayOfWeek,
    dayOfWeekDisplay: formatDayOfWeek(parsed.dayOfWeek),
    weekOfYear: parseInt(parsed.weekOfYear, 10),
    year: parsed.year,
    shift: parsed.shift,
    shiftDisplay: formatShift(parsed.shift),
    operator: parsed.operator,
    operatorDisplay: formatOperator(parsed.operator),
    packer: parsed.packer,
    packerDisplay: formatPacker(parsed.packer),
  };
}

/**
 * Obtiene información del producto formateada
 */
export interface ProductInfo {
  caliber: string;
  caliberDisplay: string;
  caliberShort: string;
  format: string;
  formatDisplay: string;
  companyCode: string;
  companyCodeDisplay: string;
  counter: number;
  counterDisplay: string;
}

/**
 * Extrae información del producto formateada
 */
export function getProductInfo(parsed: ParsedBoxCode): ProductInfo {
  return {
    caliber: parsed.caliber,
    caliberDisplay: formatCaliber(parsed.caliber),
    caliberShort: formatCaliberShort(parsed.caliber),
    format: parsed.format,
    formatDisplay: formatBoxFormat(parsed.format),
    companyCode: parsed.companyCode,
    companyCodeDisplay: formatCompanyCode(parsed.companyCode),
    counter: parseInt(parsed.counter, 10),
    counterDisplay: formatCounter(parsed.counter),
  };
}

