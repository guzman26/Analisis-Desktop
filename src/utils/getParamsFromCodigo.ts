/**
 * Nuevo formato de código de caja (16 dígitos):
 * D (1 dígito): Día de la semana
 * SS (2 dígitos): Semana
 * AA (2 dígitos): Año
 * OO (2 dígitos): Operario
 * E (1 dígito): Empacadora
 * T (1 dígito): Turno
 * CC (2 dígitos): Calibre
 * F (1 dígito): Formato
 * CCCC (4 dígitos): Contador
 */

/**
 * FUNCIONES PARA CÓDIGOS DE CAJAS (16 dígitos)
 */

// Code parsing utilities with configuration-based approach

// Code format configurations
const FORMATS = {
  box: {
    length: 16,
    pattern: /^\d{16}$/,
    fields: {
      dia: [0, 1],
      semana: [1, 3],
      ano: [3, 5],
      operario: [5, 7],
      empacadora: [7, 8],
      turno: [8, 9],
      calibre: [9, 11],
      formato: [11, 12],
      contador: [12, 16],
    },
    baseCode: [0, 12],
  },
  pallet: {
    length: 13,
    pattern: /^\d{13}$/,
    fields: {
      calibre: [6, 8],
    },
    baseCode: [2, 10],
  },
} as const;

// Calibre mappings
const CALIBRE_MAP: Record<string, string> = {
  '01': 'ESPECIAL BCO',
  '02': 'EXTRA BCO',
  '04': 'GRANDE BCO',
  '07': 'MEDIANO BCO',
  '09': 'TERCERA BCO',
  '15': 'CUARTA BCO',
  '12': 'JUMBO BCO',
  '03': 'ESPECIAL COLOR',
  '05': 'EXTRA COLOR',
  '06': 'GRANDE COLOR',
  '13': 'MEDIANO COLOR',
  '11': 'TERCERA COLOR',
  '16': 'CUARTA COLOR',
  '14': 'JUMBO COLOR',
  '08': 'SUCIO / TRIZADO',
};

// Type detection
export const detectCodigoType = (
  codigo: string
): 'box' | 'pallet' | 'unknown' => {
  if (FORMATS.box.pattern.test(codigo)) return 'box';
  if (FORMATS.pallet.pattern.test(codigo)) return 'pallet';
  return 'unknown';
};

// Generic field extractor
const extractField = (
  codigo: string,
  type: 'box' | 'pallet',
  field: string
): string => {
  const format = FORMATS[type];
  const fields = format.fields as Record<string, readonly [number, number]>;
  const [start, end] = fields[field] || [];
  return start !== undefined ? codigo.slice(start, end) : '';
};

// Calibre formatting
export const formatCalibreName = (calibre: string): string =>
  CALIBRE_MAP[calibre] || calibre;

// Main extraction functions
export const getCalibreFromCodigo = (codigo: string): string => {
  const type = detectCodigoType(codigo);
  if (type === 'unknown') return '';
  const calibreNum = extractField(codigo, type, 'calibre');
  return formatCalibreName(calibreNum);
};

export const getBaseCodeFromCodigo = (codigo: string): string => {
  const type = detectCodigoType(codigo);
  if (type === 'unknown') return '';
  const [start, end] = FORMATS[type].baseCode;
  return codigo.slice(start, end);
};

// Box-specific extractors
export const getBoxInfo = (codigo: string) => {
  if (detectCodigoType(codigo) !== 'box') {
    throw new Error('Código de caja debe tener exactamente 16 dígitos');
  }

  const format = FORMATS.box;
  return Object.entries(format.fields).reduce(
    (acc, [field, range]) => {
      acc[field] = codigo.slice(range[0], range[1]);
      return acc;
    },
    {} as Record<string, string>
  );
};

// Validation functions
export const validateCodigoCaja = (codigo: string): boolean =>
  FORMATS.box.pattern.test(codigo);

export const validateCodigoPallet = (codigo: string): boolean =>
  FORMATS.pallet.pattern.test(codigo);

// Display formatting
export const formatCodigoForDisplay = (codigo: string): string => {
  if (detectCodigoType(codigo) === 'box') {
    const info = getBoxInfo(codigo);
    return `${info.dia}-${info.semana}-${info.ano}-${info.operario}-${info.empacadora}-${info.turno}-${info.calibre}-${info.formato}-${info.contador}`;
  }
  return codigo;
};

// Summary generator
export const getCodigoSummary = (codigo: string): string => {
  try {
    const info = getBoxInfo(codigo);
    const calibre = formatCalibreName(info.calibre);
    return `Sem.${info.semana}/20${info.ano} - Op.${info.operario} - ${calibre} - Caja #${info.contador}`;
  } catch {
    return 'Código no válido';
  }
};

/**
 * FUNCIONES ESPECÍFICAS PARA CAJAS (16 dígitos)
 */

export const getDiaFromCodigo = (codigo: string) => {
  // Día de la semana: posición 0
  return codigo.slice(0, 1);
};

export const getSemanaFromCodigo = (codigo: string) => {
  // Semana: posiciones 1-2
  return codigo.slice(1, 3);
};

export const getAnoFromCodigo = (codigo: string) => {
  // Año: posiciones 3-4
  return codigo.slice(3, 5);
};

export const getOperarioFromCodigo = (codigo: string) => {
  // Operario: posiciones 5-6
  return codigo.slice(5, 7);
};

export const getEmpacadoraFromCodigo = (codigo: string) => {
  // Empacadora: posición 7
  return codigo.slice(7, 8);
};

export const getTurnoFromCodigo = (codigo: string) => {
  // Turno: posición 8
  return codigo.slice(8, 9);
};

export const getFormatoFromCodigo = (codigo: string) => {
  // Formato: posición 11
  return codigo.slice(11, 12);
};

export const getContadorFromCodigo = (codigo: string) => {
  // Contador: posiciones 12-15 (4 dígitos)
  return codigo.slice(12, 16);
};

/**
 * CONSTANTES ÚTILES
 */

export const DIAS_SEMANA = {
  '1': 'Lunes',
  '2': 'Martes',
  '3': 'Miércoles',
  '4': 'Jueves',
  '5': 'Viernes',
  '6': 'Sábado',
  '7': 'Domingo',
} as const;

export const TURNOS = {
  '1': 'Turno 1',
  '2': 'Turno 2',
  '3': 'Turno 3',
} as const;

/**
 * Obtiene el nombre del día de la semana
 */
export const getDiaNombre = (codigo: string): string => {
  const dia = getDiaFromCodigo(codigo);
  return DIAS_SEMANA[dia as keyof typeof DIAS_SEMANA] || `Día ${dia}`;
};

/**
 * Obtiene el nombre del turno
 */
export const getTurnoNombre = (codigo: string): string => {
  const turno = getTurnoFromCodigo(codigo);
  return TURNOS[turno as keyof typeof TURNOS] || `Turno ${turno}`;
};
