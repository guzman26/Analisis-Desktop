# Box Code Parser - Guía de Uso

Este módulo proporciona utilidades para parsear y formatear códigos de cajas de 16 dígitos.

## Estructura del Código de Caja (16 dígitos)

Los códigos de caja siguen una estructura fija:

```
7422514510412054
│││││││││││││└──┴─ Contador (3 dígitos): 054
││││││││││││└────── Código de Empresa (1 dígito): 2
│││││││││││└─────── Formato (1 dígito): 1
││││││││││└──────── Calibre (2 dígitos): 04
│││││││││└───────── Turno (1 dígito): 1 (Mañana)
││││││││└────────── Empacadora (1 dígito): 5
│││││││└─────────── Operario (2 dígitos): 14
││││││└──────────── Año (2 dígitos): 25 (2025)
│││││└───────────── Semana del año (2 dígitos): 42
││││└────────────── Día de la semana (1 dígito): 7 (Domingo)
```

## Uso Básico

### Parsear un Código

```typescript
import { parseBoxCode, tryParseBoxCode } from '@/utils';

// Parsear (lanza error si es inválido)
try {
  const parsed = parseBoxCode('7422514510412054');
  console.log(parsed.operator); // "14"
  console.log(parsed.year);     // "2025"
} catch (error) {
  console.error('Código inválido:', error);
}

// Parsear (retorna null si es inválido)
const parsed = tryParseBoxCode('7422514510412054');
if (parsed) {
  console.log('Código válido:', parsed);
} else {
  console.log('Código inválido');
}
```

### Formatear Valores

```typescript
import { formatParsedBoxCode, getProductionInfo, getProductInfo } from '@/utils';

const parsed = tryParseBoxCode('7422514510412054');

if (parsed) {
  // Formatear todo el código
  const formatted = formatParsedBoxCode(parsed);
  console.log(formatted.shiftDisplay);    // "Mañana"
  console.log(formatted.caliberDisplay);  // "Chico (S)"
  
  // Obtener información de producción
  const production = getProductionInfo(parsed);
  console.log(production.dayOfWeekDisplay); // "Domingo"
  console.log(production.weekOfYear);       // 42
  console.log(production.year);             // "2025"
  
  // Obtener información del producto
  const product = getProductInfo(parsed);
  console.log(product.caliberDisplay);  // "Chico (S)"
  console.log(product.formatDisplay);   // "Formato 1"
  console.log(product.counter);         // 54
}
```

### Validar Códigos

```typescript
import { isValidBoxCode } from '@/utils';

if (isValidBoxCode('7422514510412054')) {
  console.log('Código válido');
}

if (!isValidBoxCode('123')) {
  console.log('Código inválido (longitud incorrecta)');
}

if (!isValidBoxCode('74225145104120AB')) {
  console.log('Código inválido (caracteres no numéricos)');
}
```

## Formatos de Display

### Calibres
- `01` → "Extra Grande (XL)"
- `02` → "Grande (L)"
- `03` → "Mediano (M)"
- `04` → "Chico (S)"
- `05` → "Extra Chico (XS)"
- `06` → "Jumbo (XXL)"

### Turnos
- `1` → "Mañana"
- `2` → "Tarde"

### Días de la Semana
- `1` → "Lunes"
- `2` → "Martes"
- `3` → "Miércoles"
- `4` → "Jueves"
- `5` → "Viernes"
- `6` → "Sábado"
- `7` → "Domingo"

## Ejemplo de Uso en un Componente

```typescript
import React, { useMemo } from 'react';
import { tryParseBoxCode, formatParsedBoxCode } from '@/utils';

interface BoxInfoProps {
  codigo: string;
}

const BoxInfo: React.FC<BoxInfoProps> = ({ codigo }) => {
  const parsed = useMemo(() => tryParseBoxCode(codigo), [codigo]);
  const formatted = useMemo(() => 
    parsed ? formatParsedBoxCode(parsed) : null, 
    [parsed]
  );

  if (!formatted) {
    return <div>Código inválido</div>;
  }

  return (
    <div>
      <h3>Información de la Caja</h3>
      <p>Operario: {formatted.operatorDisplay}</p>
      <p>Empacadora: {formatted.packerDisplay}</p>
      <p>Calibre: {formatted.caliberDisplay}</p>
      <p>Turno: {formatted.shiftDisplay}</p>
      <p>Semana: {formatted.weekOfYearDisplay}</p>
      <p>Año: {formatted.year}</p>
      <p>Día: {formatted.dayOfWeekDisplay}</p>
    </div>
  );
};
```

## API Completa

### Funciones de Parseo

- `parseBoxCode(code: string): ParsedBoxCode` - Parsea o lanza error
- `tryParseBoxCode(code: string): ParsedBoxCode | null` - Parsea o retorna null
- `isValidBoxCode(code: string): boolean` - Valida formato
- `getBoxBaseCode(code: string): string` - Extrae primeros 10 dígitos
- `getBoxFCF(code: string): string` - Extrae últimos 9 dígitos (Fecha-Calibre-Formato)

### Funciones de Formateo

- `formatDayOfWeek(dayOfWeek: string): string`
- `formatShift(shift: string): string`
- `formatCaliber(caliber: string): string`
- `formatCaliberShort(caliber: string): string`
- `formatBoxFormat(format: string): string`
- `formatOperator(operator: string): string`
- `formatPacker(packer: string): string`
- `formatWeekOfYear(weekOfYear: string): string`
- `formatCounter(counter: string): string`
- `formatCompanyCode(companyCode: string): string`

### Funciones de Alto Nivel

- `formatParsedBoxCode(parsed: ParsedBoxCode): FormattedBoxCode`
- `getProductionInfo(parsed: ParsedBoxCode): ProductionInfo`
- `getProductInfo(parsed: ParsedBoxCode): ProductInfo`
- `getBoxCodeSummary(parsed: ParsedBoxCode): string`

## Tipos TypeScript

```typescript
interface ParsedBoxCode {
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
}

interface FormattedBoxCode extends ParsedBoxCode {
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

interface ProductionInfo {
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

interface ProductInfo {
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
```

## Notas Importantes

1. **Validación**: Siempre valida el código antes de parsearlo o usa `tryParseBoxCode` para manejo seguro de errores.

2. **Performance**: Usa `useMemo` en componentes React para evitar parseos innecesarios.

3. **Años**: Los códigos con año YY se convierten automáticamente a YYYY. Años 00-50 se interpretan como 2000-2050, años 51-99 como 1951-1999.

4. **Fallbacks**: En BoxDetailModal, el parser se usa como fallback cuando la información no está disponible en la respuesta del API.

5. **Compatibilidad**: El parser está basado en el schema del backend (`LambdaLomasAltas/config/schemas/box.js`) para mantener consistencia.

