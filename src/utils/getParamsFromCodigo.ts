/**
 * Esquemas de códigos
 *
 * Caja – 16 dígitos (config/schemas/box.js)
 * 1 díaSemana
 * 2 semanaISO
 * 2 año (YY)
 * 2 operario
 * 1 empacadora
 * 1 turno (1=mañana, 2=tarde)
 * 2 calibre
 * 1 formato
 * 1 empresa
 * 3 contador
 *
 * Pallet – 14 dígitos (config/schemas/pallet.js)
 * BaseCode 11 dígitos:
 * 1 díaSemana, 2 semanaISO, 2 año (YY), 1 turno, 2 calibre, 1 formato, 2 empresa
 * Sufijo 3 dígitos: contador incremental
 */

/**
 * FUNCIONES PARA CÓDIGOS DE CAJAS (16 dígitos)
 */

// Code parsing utilities with configuration-based approach

// Code format configurations
const FORMATS = {
  box: {
    length: 16,
    // Aceptar códigos numéricos de longitud variable; normalizaremos más abajo
    pattern: /^\d{16,}$/,
    fields: {
      dia: [0, 1],
      semana: [1, 3],
      ano: [3, 5],
      operario: [5, 7],
      empacadora: [7, 8],
      turno: [8, 9],
      calibre: [9, 11],
      formato: [11, 12],
      empresa: [12, 13],
      contador: [13, 16],
    },
    // Para cajas, baseCode = todo excepto el contador (13 primeros dígitos)
    baseCode: [0, 13],
  },
  pallet: {
    length: 14,
    pattern: /^\d{14,}$/,
    fields: {
      dia: [0, 1],
      semana: [1, 3],
      ano: [3, 5],
      turno: [5, 6],
      calibre: [6, 8],
      formato: [8, 9],
      empresa: [9, 11],
      contador: [11, 14],
    },
    // Para pallets, baseCode = primeros 11 dígitos
    baseCode: [0, 11],
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

// Export canonical list of all calibre codes
export const ALL_CALIBRE_CODES: string[] = Object.keys(CALIBRE_MAP);

// Type detection
export const detectCodigoType = (
  codigo: string
): 'box' | 'pallet' | 'unknown' => {
  if (!codigo) return 'unknown';

  // Normalize: take last N digits if longer
  const normalized16 = codigo.length >= 16 ? codigo.slice(-16) : codigo;
  const normalized14 = codigo.length >= 14 ? codigo.slice(-14) : codigo;

  // Check exact length for precise detection
  if (normalized16.length === 16 && /^\d{16}$/.test(normalized16)) return 'box';
  if (normalized14.length === 14 && /^\d{14}$/.test(normalized14))
    return 'pallet';

  return 'unknown';
};

// Generic field extractor
const extractField = (
  codigo: string,
  type: 'box' | 'pallet',
  field: string
): string => {
  const format = FORMATS[type];
  // Normalizar tomando los últimos N dígitos esperados si el código es más largo
  const normalized =
    codigo.length >= format.length ? codigo.slice(-format.length) : codigo;
  const fields = format.fields as Record<string, readonly [number, number]>;
  const [start, end] = fields[field] || [];
  return start !== undefined ? normalized.slice(start, end) : '';
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
  const fmt = FORMATS[type];
  const normalized =
    codigo.length >= fmt.length ? codigo.slice(-fmt.length) : codigo;
  return normalized.slice(start, end);
};

// Box-specific extractors
export const getBoxInfo = (codigo: string) => {
  if (!FORMATS.box.pattern.test(codigo)) {
    throw new Error('Código de caja inválido');
  }

  const format = FORMATS.box;
  const normalized =
    codigo.length >= format.length ? codigo.slice(-format.length) : codigo;
  return Object.entries(format.fields).reduce(
    (acc, [field, range]) => {
      acc[field] = normalized.slice(range[0], range[1]);
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
  const type = detectCodigoType(codigo);
  if (type === 'box') {
    const info = getBoxInfo(codigo);
    return `${info.dia}-${info.semana}-${info.ano}-${info.operario}-${info.empacadora}-${info.turno}-${info.calibre}-${info.formato}-${info.empresa}-${info.contador}`;
  }
  if (type === 'pallet') {
    const fmt = FORMATS.pallet;
    const normalized =
      codigo.length >= fmt.length ? codigo.slice(-fmt.length) : codigo;
    const base = normalized.slice(fmt.baseCode[0], fmt.baseCode[1]);
    const sufijo = normalized.slice(
      fmt.fields.contador[0],
      fmt.fields.contador[1]
    );
    return `${base}-${sufijo}`;
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

export const getEmpresaFromCodigo = (codigo: string) => {
  // Empresa: posición 12-13
  return codigo.slice(12, 14);
};

export const getContadorFromCodigo = (codigo: string) => {
  // Contador: posiciones 14-16 (3 dígitos)
  return codigo.slice(14, 17);
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
  '1': 'Mañana',
  '2': 'Tarde',
} as const;

export const EMPRESAS = {
  // Box format (1 digit)
  '1': 'Lomas Altas',
  '2': 'Santa Marta',
  '3': 'Coliumo',
  '4': 'El Monte',
  '5': 'Libre',
  // Pallet format (2 digits with leading zero)
  '01': 'Lomas Altas',
  '02': 'Santa Marta',
  '03': 'Coliumo',
  '04': 'El Monte',
  '05': 'Libre',
} as const;

/**
 * Obtiene el nombre del día de la semana
 */
export const getDiaNombre = (codigo: string): string => {
  const dia = getDiaFromCodigo(codigo);
  return DIAS_SEMANA[dia as keyof typeof DIAS_SEMANA] || `Día ${dia}`;
};

/**
 * Obtiene el nombre del turno (horario de proceso)
 * Works with both box (16 digits) and pallet (14 digits) codes
 */
export const getTurnoNombre = (codigo: string): string => {
  if (!codigo) return 'N/A';

  const type = detectCodigoType(codigo);
  if (type === 'unknown') return 'N/A';

  const turno = extractField(codigo, type, 'turno');
  return TURNOS[turno as keyof typeof TURNOS] || `Turno ${turno}`;
};

/**
 * Obtiene el nombre de la empresa desde el código
 * Works with both box (16 digits) and pallet (14 digits) codes
 */
export const getEmpresaNombre = (codigo: string): string => {
  if (!codigo) return 'N/A';

  const type = detectCodigoType(codigo);
  if (type === 'unknown') return 'N/A';

  const empresa = extractField(codigo, type, 'empresa');

  // EMPRESAS mapping supports both 1-digit (box) and 2-digit (pallet) formats
  return EMPRESAS[empresa as keyof typeof EMPRESAS] || `Empresa ${empresa}`;
};
