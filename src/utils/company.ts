// Mapeo centralizado de códigos de empresa a su nombre legible
// Si cambia el catálogo, actualice este objeto.

const COMPANY_CODE_TO_NAME: Record<string | number, string> = {
  1: 'Lomas Altas',
  2: 'Santa Marta',
  3: 'Coliumo',
  4: 'El monte',
  5: 'Libre',
};

/**
 * Devuelve el nombre de la empresa a partir de su código.
 * Acepta código como string o number. Si el código no es conocido, retorna
 * una etiqueta genérica "Empresa {codigo}".
 */
export function getCompanyNameFromCode(
  code: string | number | undefined | null
): string {
  if (code === undefined || code === null || code === '') return 'Sin empresa';
  const key = typeof code === 'string' ? code.trim() : code;
  return COMPANY_CODE_TO_NAME[key] || `Empresa ${key}`;
}

/**
 * Exporta el catálogo completo por si se necesita poblar dropdowns.
 */
export const COMPANY_CATALOG = COMPANY_CODE_TO_NAME;
