// Mapeo centralizado de códigos de empresa a su nombre legible
// Si cambia el catálogo, actualice este objeto.

const COMPANY_CODE_TO_NAME: Record<string, string> = {
  '01': 'Lomas Altas',
  '02': 'Santa Marta',
  '03': 'Coliumo',
  '04': 'El Monte',
  '05': 'Libre',
};

const COMPANY_NAME_TO_CODE: Record<string, string> = {
  'lomas altas': '01',
  'santa marta': '02',
  coliumo: '03',
  'el monte': '04',
  libre: '05',
};

/**
 * Normaliza empresa a código canónico de 2 dígitos (01..05).
 * Soporta entradas como "04", 4 y nombres legibles.
 */
export function normalizeCompanyCode(
  codeOrName: string | number | undefined | null
): string | null {
  if (codeOrName === undefined || codeOrName === null) return null;
  const raw = String(codeOrName).trim();
  if (!raw) return null;

  if (/^\d+$/.test(raw)) {
    const normalized = Number(raw);
    if (!Number.isInteger(normalized) || normalized < 1 || normalized > 5) {
      return null;
    }
    return String(normalized).padStart(2, '0');
  }

  const normalizedName = raw.toLowerCase();
  return COMPANY_NAME_TO_CODE[normalizedName] || null;
}

/**
 * Devuelve el nombre de la empresa a partir de su código.
 * Acepta código como string o number. Si el código no es conocido, retorna
 * una etiqueta genérica "Empresa {codigo}".
 */
export function getCompanyNameFromCode(
  code: string | number | undefined | null
): string {
  if (code === undefined || code === null || code === '') return 'Sin empresa';
  const normalizedCode = normalizeCompanyCode(code);
  if (normalizedCode) return COMPANY_CODE_TO_NAME[normalizedCode];
  const key = typeof code === 'string' ? code.trim() : code;
  return COMPANY_CODE_TO_NAME[key] || `Empresa ${key}`;
}

/**
 * Exporta el catálogo completo por si se necesita poblar dropdowns.
 */
export const COMPANY_CATALOG = COMPANY_CODE_TO_NAME;

// ========================================
// Información de Contacto Centralizada
// ========================================

export interface CompanyContactInfo {
  name: string;
  legalName: string;
  rut: string;
  email: string;
  phone?: string;
  address?: string;
  comuna?: string;
  ciudad?: string;
  giro?: string;
}

/**
 * Información de contacto de la empresa
 * Centralizada para facilitar mantenimiento y actualización
 */
export const COMPANY_CONTACT_INFO: CompanyContactInfo = {
  name: 'Lomas Altas Agrícola',
  legalName: 'SOC AGRICOLA LOMAS ALTAS LIMITADA',
  rut: '87.590.100-1',
  email: 'contacto@lomasaltas.cl',
  phone: undefined, // Por definir
  address: 'HJ 2 FUNDO SAN RAMIRO HJ 2',
  comuna: 'SAN PEDRO',
  ciudad: 'STGO',
  giro: 'VENTA AL POR MAYOR DE HUEVOS, LACTEO',
};

/**
 * Obtiene el email de contacto de la empresa
 */
export function getContactEmail(): string {
  return COMPANY_CONTACT_INFO.email;
}

/**
 * Obtiene el teléfono de contacto de la empresa
 * Retorna un string por defecto si no está definido
 */
export function getContactPhone(): string {
  return COMPANY_CONTACT_INFO.phone || 'Por definir';
}

/**
 * Obtiene el RUT de la empresa
 */
export function getCompanyRUT(): string {
  return COMPANY_CONTACT_INFO.rut;
}

/**
 * Obtiene el nombre completo de la empresa
 */
export function getCompanyName(): string {
  return COMPANY_CONTACT_INFO.name;
}

/**
 * Obtiene el nombre legal completo de la empresa
 */
export function getCompanyLegalName(): string {
  return COMPANY_CONTACT_INFO.legalName;
}

/**
 * Obtiene la dirección completa de la empresa
 */
export function getCompanyAddress(): string {
  return COMPANY_CONTACT_INFO.address || '';
}

/**
 * Obtiene la comuna de la empresa
 */
export function getCompanyComuna(): string {
  return COMPANY_CONTACT_INFO.comuna || '';
}

/**
 * Obtiene la ciudad de la empresa
 */
export function getCompanyCiudad(): string {
  return COMPANY_CONTACT_INFO.ciudad || '';
}

/**
 * Obtiene el giro de la empresa
 */
export function getCompanyGiro(): string {
  return COMPANY_CONTACT_INFO.giro || '';
}

/**
 * Obtiene la dirección completa formateada (dirección, comuna, ciudad)
 */
export function getCompanyFullAddress(): string {
  const parts = [
    COMPANY_CONTACT_INFO.address,
    COMPANY_CONTACT_INFO.comuna,
    COMPANY_CONTACT_INFO.ciudad,
  ].filter(Boolean);
  return parts.join(', ');
}

/**
 * Obtiene toda la información de contacto
 */
export function getCompanyContactInfo(): CompanyContactInfo {
  return { ...COMPANY_CONTACT_INFO };
}
