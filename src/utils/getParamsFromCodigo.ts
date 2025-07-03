/**
 * Nuevo formato de código de caja (17 dígitos):
 * D (1 dígito): Día de la semana
 * SS (2 dígitos): Semana
 * AA (2 dígitos): Año
 * OO (2 dígitos): Operario
 * E (1 dígito): Empacadora
 * T (1 dígito): Turno
 * CC (2 dígitos): Calibre
 * F (1 dígito): Formato
 * C (1 dígito): Empresa
 * CCCC (4 dígitos): Contador
 */

/**
 * FUNCIONES PARA CÓDIGOS DE CAJAS (17 dígitos)
 */

export const getCalibreFromCodigoCaja = (codigo: string) => {
  // Calibre está en posiciones 9-10 (2 dígitos)
  const calibreNumber = codigo.slice(9, 11);
  const calibreName = formatCalibreName(calibreNumber);
  return calibreName;
};

export const getBaseCodeFromCodigoCaja = (codigo: string) => {
  // Base code incluye desde día hasta empresa (sin contador): posiciones 0-12
  const baseCode = codigo.slice(0, 13);
  return baseCode;
};

/**
 * FUNCIONES PARA CÓDIGOS DE PALLETS (formato anterior)
 * Mantiene compatibilidad con el sistema existente
 */

export const getCalibreFromCodigoPallet = (codigo: string) => {
  // Para pallets, mantiene la lógica anterior (posiciones 6-8)
  const calibreNumber = codigo.slice(6, 8);
  const calibreName = formatCalibreName(calibreNumber);
  return calibreName;
};

export const getBaseCodeFromCodigoPallet = (codigo: string) => {
  // Para pallets, mantiene la lógica anterior (posiciones 2-10)
  const baseCode = codigo.slice(2, 10);
  return baseCode;
};

/**
 * FUNCIONES GENÉRICAS (mantienen compatibilidad)
 * Detectan automáticamente si es código de caja o pallet
 */

export const getCalibreFromCodigo = (codigo: string) => {
  if (validateCodigoCaja(codigo)) {
    // Es código de caja (17 dígitos)
    return getCalibreFromCodigoCaja(codigo);
  } else {
    // Es código de pallet (formato anterior)
    return getCalibreFromCodigoPallet(codigo);
  }
};

export const getBaseCodeFromCodigo = (codigo: string) => {
  if (validateCodigoCaja(codigo)) {
    // Es código de caja (17 dígitos)
    return getBaseCodeFromCodigoCaja(codigo);
  } else {
    // Es código de pallet (formato anterior)
    return getBaseCodeFromCodigoPallet(codigo);
  }
};

/**
 * FUNCIONES ESPECÍFICAS PARA CAJAS (17 dígitos)
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
  // Empresa: posición 12
  return codigo.slice(12, 13);
};

export const getContadorFromCodigo = (codigo: string) => {
  // Contador: posiciones 13-16 (4 dígitos)
  return codigo.slice(13, 17);
};

export const formatCalibreName = (calibre: string): string => {
  const calibreMap: Record<string, string> = {
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

  return calibreMap[calibre] || `${calibre}`;
};

/**
 * VALIDACIONES
 */

/**
 * Valida que un código de caja tenga el formato correcto (17 dígitos)
 */
export const validateCodigoCaja = (codigo: string): boolean => {
  return /^\d{17}$/.test(codigo);
};

/**
 * Valida que un código de pallet tenga el formato correcto (12 dígitos)
 */
export const validateCodigoPallet = (codigo: string): boolean => {
  return /^\d{12}$/.test(codigo);
};

/**
 * Obtiene información completa de un código de caja
 */
export const getFullInfoFromCodigo = (codigo: string) => {
  if (!validateCodigoCaja(codigo)) {
    throw new Error('Código de caja debe tener exactamente 17 dígitos');
  }

  return {
    dia: getDiaFromCodigo(codigo),
    semana: getSemanaFromCodigo(codigo),
    ano: getAnoFromCodigo(codigo),
    operario: getOperarioFromCodigo(codigo),
    empacadora: getEmpacadoraFromCodigo(codigo),
    turno: getTurnoFromCodigo(codigo),
    calibre: getCalibreFromCodigoCaja(codigo),
    calibreNumero: codigo.slice(9, 11),
    formato: getFormatoFromCodigo(codigo),
    empresa: getEmpresaFromCodigo(codigo),
    contador: getContadorFromCodigo(codigo),
    baseCode: getBaseCodeFromCodigoCaja(codigo),
  };
};

/**
 * FUNCIONES UTILITARIAS ADICIONALES
 */

/**
 * Determina el tipo de código (caja o pallet) automáticamente
 */
export const detectCodigoType = (
  codigo: string
): 'caja' | 'pallet' | 'unknown' => {
  if (validateCodigoCaja(codigo)) {
    return 'caja';
  } else if (validateCodigoPallet(codigo)) {
    return 'pallet';
  } else {
    return 'unknown';
  }
};

/**
 * Formatea un código para mejor legibilidad
 * Para cajas: D-SS-AA-OO-E-T-CC-F-C-CCCC
 * Para pallets: mantiene formato original
 */
export const formatCodigoForDisplay = (codigo: string): string => {
  const type = detectCodigoType(codigo);

  if (type === 'caja') {
    // Formato: D-SS-AA-OO-E-T-CC-F-C-CCCC
    return `${codigo[0]}-${codigo.slice(1, 3)}-${codigo.slice(3, 5)}-${codigo.slice(5, 7)}-${codigo[7]}-${codigo[8]}-${codigo.slice(9, 11)}-${codigo[11]}-${codigo[12]}-${codigo.slice(13, 17)}`;
  }

  return codigo; // Para pallets u otros, mantiene formato original
};

/**
 * Obtiene un resumen legible de un código de caja
 */
export const getCodigoSummary = (codigo: string): string => {
  if (!validateCodigoCaja(codigo)) {
    return 'Código no válido para caja';
  }

  const info = getFullInfoFromCodigo(codigo);
  return `Sem.${info.semana}/20${info.ano} - Op.${info.operario} - ${info.calibre} - Caja #${info.contador}`;
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
