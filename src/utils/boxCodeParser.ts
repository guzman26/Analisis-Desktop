/**
 * BOX CODE PARSER
 * 
 * Parsea códigos de cajas de 16 dígitos para extraer toda la información embebida.
 * Basado en el schema del backend (LambdaLomasAltas/config/schemas/box.js)
 * 
 * Estructura del código de 16 dígitos:
 * - dayOfWeek (1 dígito): Día de la semana (1-7)
 * - weekOfYear (2 dígitos): Semana del año (01-52)
 * - year (2 dígitos): Año en formato YY (ej: 24 = 2024)
 * - operator (2 dígitos): Código del operario
 * - packer (1 dígito): Código de la empacadora
 * - shift (1 dígito): Turno (1=Mañana, 2=Tarde)
 * - caliber (2 dígitos): Calibre del huevo (01-06)
 * - format (1 dígito): Formato de la caja
 * - companyCode (1 dígito): Código de la empresa
 * - counter (3 dígitos): Contador secuencial
 * 
 * Ejemplo: 7422514510412054
 * - 7: Día 7 (Domingo)
 * - 42: Semana 42
 * - 25: Año 2025
 * - 14: Operario 14
 * - 5: Empacadora 5
 * - 1: Turno mañana
 * - 04: Calibre 04 (Grande)
 * - 1: Formato 1
 * - 2: Empresa 2
 * - 054: Contador 054
 */

export interface BoxCodeSchema {
  totalLength: number;
  segments: Array<{
    key: string;
    length: number;
    start: number;
    end: number;
  }>;
}

export interface ParsedBoxCode {
  // Código completo
  codigo: string;
  
  // Información de tiempo
  dayOfWeek: string;        // 1 dígito
  weekOfYear: string;       // 2 dígitos
  year: string;             // YYYY formato (convertido de YY)
  
  // Personal
  operator: string;         // 2 dígitos
  packer: string;           // 1 dígito
  shift: string;            // 1 dígito (1=Mañana, 2=Tarde)
  
  // Producto
  caliber: string;          // 2 dígitos
  format: string;           // 1 dígito
  companyCode: string;      // 1 dígito
  
  // Secuencia
  counter: string;          // 3 dígitos
}

/**
 * Schema del código de caja
 */
const BOX_CODE_SCHEMA: BoxCodeSchema = {
  totalLength: 16,
  segments: [
    { key: 'dayOfWeek', length: 1, start: 0, end: 1 },
    { key: 'weekOfYear', length: 2, start: 1, end: 3 },
    { key: 'year', length: 2, start: 3, end: 5 },
    { key: 'operator', length: 2, start: 5, end: 7 },
    { key: 'packer', length: 1, start: 7, end: 8 },
    { key: 'shift', length: 1, start: 8, end: 9 },
    { key: 'caliber', length: 2, start: 9, end: 11 },
    { key: 'format', length: 1, start: 11, end: 12 },
    { key: 'companyCode', length: 1, start: 12, end: 13 },
    { key: 'counter', length: 3, start: 13, end: 16 },
  ],
};

/**
 * Valida que un código de caja tenga el formato correcto
 */
export function isValidBoxCode(code: string): boolean {
  if (typeof code !== 'string') return false;
  if (code.length !== BOX_CODE_SCHEMA.totalLength) return false;
  if (!/^\d+$/.test(code)) return false;
  return true;
}

/**
 * Parsea un código de caja y extrae toda la información
 * @throws Error si el código no es válido
 */
export function parseBoxCode(code: string): ParsedBoxCode {
  // Validar formato
  if (!isValidBoxCode(code)) {
    throw new Error(
      `Código inválido: ${code}. Debe tener ${BOX_CODE_SCHEMA.totalLength} dígitos numéricos.`
    );
  }

  // Extraer segmentos
  const segments: Record<string, string> = {};
  for (const segment of BOX_CODE_SCHEMA.segments) {
    segments[segment.key] = code.slice(segment.start, segment.end);
  }

  // Convertir año YY a YYYY
  const yearYY = segments.year;
  const yearNumber = parseInt(yearYY, 10);
  // Asumimos que años 00-50 son 2000-2050, y 51-99 son 1951-1999
  const fullYear = yearNumber <= 50 ? 2000 + yearNumber : 1900 + yearNumber;

  return {
    codigo: code,
    dayOfWeek: segments.dayOfWeek,
    weekOfYear: segments.weekOfYear,
    year: fullYear.toString(),
    operator: segments.operator,
    packer: segments.packer,
    shift: segments.shift,
    caliber: segments.caliber,
    format: segments.format,
    companyCode: segments.companyCode,
    counter: segments.counter,
  };
}

/**
 * Intenta parsear un código de caja, retornando null si falla
 */
export function tryParseBoxCode(code: string): ParsedBoxCode | null {
  try {
    return parseBoxCode(code);
  } catch {
    return null;
  }
}

/**
 * Extrae el código base de una caja (primeros 10 dígitos)
 */
export function getBoxBaseCode(code: string): string {
  if (!isValidBoxCode(code)) {
    throw new Error('Código inválido');
  }
  return code.slice(0, 10);
}

/**
 * Extrae el FCF (Fecha-Calibre-Formato, últimos 9 dígitos)
 */
export function getBoxFCF(code: string): string {
  if (!isValidBoxCode(code)) {
    throw new Error('Código inválido');
  }
  return code.slice(7, 16);
}

