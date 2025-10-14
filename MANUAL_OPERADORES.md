# 📖 Manual de Usuario - Sistema Lomas Altas

### Sistema de Gestión de Inventario y Ventas

---

## Índice

1. [Introducción](#1-introducción)
2. [Dashboard Principal](#2-dashboard-principal)
3. [Módulo Packing](#3-módulo-packing)
   - 3.1 [Crear Pallet](#31-crear-pallet)
   - 3.2 [Crear Pallet de Huevo Suelto](#32-crear-pallet-de-huevo-suelto)
   - 3.3 [Pallets Abiertos](#33-pallets-abiertos)
   - 3.4 [Cerrar Pallet](#34-cerrar-pallet)
   - 3.5 [Pallets Cerrados](#35-pallets-cerrados)
   - 3.6 [Cajas Sin Asignar (Packing)](#36-cajas-sin-asignar-packing)
4. [Módulo Bodega](#4-módulo-bodega)
   - 4.1 [Pallets en Bodega](#41-pallets-en-bodega)
   - 4.2 [Mover Pallets](#42-mover-pallets)
   - 4.3 [Cajas Sin Asignar (Bodega)](#43-cajas-sin-asignar-bodega)
   - 4.4 [Crear Pallet Individual](#44-crear-pallet-individual)
5. [Módulo Ventas](#5-módulo-ventas)
   - 5.1 [Crear Nueva Venta](#51-crear-nueva-venta)
   - 5.2 [Crear Cliente](#52-crear-cliente)
   - 5.3 [Órdenes en Borrador](#53-órdenes-en-borrador)
   - 5.4 [Órdenes Confirmadas](#54-órdenes-confirmadas)
   - 5.5 [Imprimir Reporte](#55-imprimir-reporte)
6. [Módulo Administración](#6-módulo-administración)
   - 6.1 [Ver Problemas](#61-ver-problemas)
   - 6.2 [Zona de Peligro](#62-zona-de-peligro)
7. [Operaciones Especiales](#7-operaciones-especiales)
   - 7.1 [Mover Cajas Entre Pallets](#71-mover-cajas-entre-pallets)
   - 7.2 [Auditoría de Pallets](#72-auditoría-de-pallets)
   - 7.3 [Generar Etiquetas](#73-generar-etiquetas)
   - 7.4 [Ver Detalles de Caja](#74-ver-detalles-de-caja)
8. [Códigos y Nomenclatura](#8-códigos-y-nomenclatura)
9. [Preguntas Frecuentes](#9-preguntas-frecuentes)

---

## 1. Introducción

### ¿Qué es el Sistema Lomas Altas?

Es una aplicación para gestionar el inventario de huevos, desde el empaque hasta la venta, permitiendo:

- ✅ Crear y gestionar pallets
- ✅ Controlar cajas de huevos
- ✅ Realizar ventas a clientes
- ✅ Rastrear productos en bodega
- ✅ Generar reportes e imprimir etiquetas

### Estructura del Sistema

El sistema se divide en 4 módulos principales:

- **Packing**: Creación y gestión de pallets abiertos
- **Bodega**: Control de inventario
- **Ventas**: Gestión de clientes y pedidos
- **Administración**: Problemas y configuración

---

## 2. Dashboard Principal

### ¿Para qué sirve?

Punto de acceso principal a todos los módulos del sistema.

### Flujo completo:

```
INICIO
  ↓
1. Al abrir la aplicación, verás el Dashboard
  ↓
2. VES 4 OPCIONES PRINCIPALES:

   ┌──────────────────────────────┐
   │ 📦 PACKING                   │
   │ Gestiona pallets y cajas     │
   └──────────────────────────────┘

   ┌──────────────────────────────┐
   │ 🏭 BODEGA                    │
   │ Control de inventario        │
   └──────────────────────────────┘

   ┌──────────────────────────────┐
   │ 🛒 VENTAS                    │
   │ Nueva venta o pedido         │
   └──────────────────────────────┘

   ┌──────────────────────────────┐
   │ ⚙️  ADMINISTRACIÓN            │
   │ Configuración y problemas    │
   └──────────────────────────────┘
  ↓
3. VES ESTADÍSTICAS EN TIEMPO REAL:
   • Pallets Abiertos: 12
   • Ventas del Día: 8
   • Cajas sin Pallet: 24
  ↓
4. TOCA EL MÓDULO que necesites
  ↓
FIN
```

### 💡 Consejo:

El Dashboard siempre muestra estadísticas actualizadas. Si los números no son correctos, refresca la página.

---

## 3. Módulo Packing

### 3.1 Crear Pallet

#### ¿Para qué sirve?

Crear un nuevo pallet vacío que recibirá cajas de producción.

#### Flujo completo:

```
INICIO
  ↓
1. Desde el Dashboard, toca "📦 Packing"
  ↓
2. En la barra superior, toca "Crear Pallet"
  ↓
3. COMPLETA EL FORMULARIO:

   ┌────────────────────────────────┐
   │ Turno: *                       │
   │ ○ Turno 1 (Mañana)            │
   │ ○ Turno 2 (Tarde)             │
   │ ○ Turno 3 (Noche)             │
   │                                │
   │ Calibre: *                     │
   │ ○ 01 - ESPECIAL (Blanco)      │
   │ ○ 02 - EXTRA (Blanco)         │
   │ ○ 03 - ESPECIAL (Color)       │
   │ ○ 04 - EXTRA (Color)          │
   │ ○ 07 - TRICO                  │
   │ ○ 09 - FERIA                  │
   │ ... [más opciones]             │
   │                                │
   │ Formato: *                     │
   │ ○ Formato 1 (180 unidades)    │
   │ ○ Formato 2 (100 JUMBO)       │
   │ ○ Formato 3 (Docena)          │
   │                                │
   │ Empresa: *                     │
   │ ○ Lomas Altas                 │
   │ ○ Santa Marta                 │
   │ ○ Coliumo                     │
   │ ○ El Monte                    │
   │ ○ Libre                       │
   │                                │
   │ Capacidad de cajas (máximo 60)│
   │ [60]                           │
   └────────────────────────────────┘
  ↓
4. VERIFICA LA INFORMACIÓN:
   • Todos los campos obligatorios (*) completos
   • Capacidad máxima: 60 cajas
  ↓
5. Toca "Crear Pallet"
  ↓
6. ESPERA confirmación:
   ✅ "Pallet creado exitosamente"
  ↓
7. Serás redirigido a "Pallets Abiertos"
  ↓
FIN
```

#### ⚠️ IMPORTANTE:

- **Capacidad máxima**: No puedes crear pallets con más de 60 cajas
- **Todos los campos son obligatorios**: Debes completar turno, calibre, formato y empresa
- **El código se genera automáticamente**: No necesitas ingresarlo manualmente

#### 📊 Estructura del Código de Pallet:

```
Código generado: 1 23 24 1 01 1 01 000
                 │ │  │  │ │  │ │  └─ Sufijo (3 dígitos - automático)
                 │ │  │  │ │  │ └─── Empresa (2 dígitos)
                 │ │  │  │ │  └───── Formato (1 dígito)
                 │ │  │  │ └──────── Calibre (2 dígitos)
                 │ │  │  └─────────── Turno (1 dígito)
                 │ │  └────────────── Año (2 dígitos últimos)
                 │ └───────────────── Semana del año (2 dígitos)
                 └─────────────────── Día de la semana (1 dígito)
```

---

### 3.2 Crear Pallet de Huevo Suelto

#### ¿Para qué sirve?

Registrar huevos que no están en cajas (carritos, bandejas o huevos sueltos).

#### Flujo completo:

```
INICIO
  ↓
1. Desde "Pallets Abiertos" en Packing
  ↓
2. Toca "Nuevo Pallet (Huevo suelto)"
  ↓
3. APARECE UN MODAL - COMPLETA:

   ┌────────────────────────────────┐
   │ Código Base: *                 │
   │ [Ej: 12324101101]             │
   │                                │
   │ Ubicación:                     │
   │ ○ PACKING (seleccionado)      │
   │ ○ BODEGA                      │
   │                                │
   │ Cantidad en Carritos:          │
   │ [Ej: 10]                      │
   │                                │
   │ Cantidad en Bandejas:          │
   │ [Ej: 25]                      │
   │                                │
   │ Cantidad de Huevos Sueltos:    │
   │ [Ej: 150]                     │
   │                                │
   │ Empresa: *                     │
   │ ○ Lomas Altas                 │
   │ ○ Santa Marta                 │
   │ ... [más opciones]             │
   └────────────────────────────────┘
  ↓
4. INGRESA AL MENOS UNA CANTIDAD:
   • Carritos, O
   • Bandejas, O
   • Huevos sueltos
  ↓
5. Toca "Crear"
  ↓
6. ESPERA confirmación:
   ✅ "Pallet de huevo suelto creado"
  ↓
7. El modal se cierra automáticamente
  ↓
FIN
```

#### 💡 Información:

- **Código base**: 11 dígitos que identifican el pallet
- **Al menos una cantidad**: Debes ingresar carritos, bandejas o huevos
- **Empresa obligatoria**: Selecciona la empresa correspondiente

---

### 3.3 Pallets Abiertos

#### ¿Para qué sirve?

Ver y gestionar todos los pallets que están recibiendo cajas actualmente.

#### Flujo completo:

```
INICIO
  ↓
1. Desde Dashboard, toca "📦 Packing"
  ↓
2. Por defecto verás "Pallets Abiertos"
  ↓
3. VES LA PANTALLA:

   ┌────────────────────────────────┐
   │ 🔍 [Buscar por código...]      │
   │                                │
   │ Estadísticas:                  │
   │ • Total Pallets: 5             │
   │ • Total Cajas: 287             │
   │ • Promedio por Pallet: 57      │
   │                                │
   │ Lista de Pallets:              │
   │ ┌────────────────────────┐    │
   │ │ 📦 Pallet 12324101101  │    │
   │ │ Estado: ● ABIERTO      │    │
   │ │ Calibre: EXTRA (Blanco)│    │
   │ │ Cajas: 48/60           │    │
   │ │ Creado: hace 2 horas   │    │
   │ └────────────────────────┘    │
   │ ... [más pallets]              │
   └────────────────────────────────┘
  ↓
4. ACCIONES DISPONIBLES:
   • Buscar por código
   • Crear nuevo pallet
   • Toca un pallet para ver detalles
  ↓
5. AL TOCAR UN PALLET se abre el Modal
  ↓
FIN (Ver sección 3.4 para Cerrar Pallet)
```

#### 🔍 Búsqueda:

Puedes buscar pallets por su código. El sistema filtra en tiempo real mientras escribes.

---

### 3.4 Cerrar Pallet

#### ¿Para qué sirve?

Finalizar un pallet cuando ya tiene todas sus cajas y está listo para bodega.

#### Flujo completo:

```
INICIO (desde Pallets Abiertos)
  ↓
1. Toca el pallet que quieres cerrar
  ↓
2. SE ABRE EL MODAL DE DETALLES:

   ┌────────────────────────────────┐
   │ Detalles de Pallet 12324101101 │
   │                                │
   │ Estado: ● ABIERTO              │
   │ Ubicación: PACKING             │
   │ Cajas: 58/60                   │
   │                                │
   │ Información:                   │
   │ • Calibre: EXTRA (Blanco)      │
   │ • Código Base: 12324101101     │
   │ • Fecha: 14/10/2025            │
   │ • Total Cajas: 58              │
   │ • Capacidad: 60                │
   │ • Empresa: Lomas Altas         │
   │ • Turno: Mañana                │
   │                                │
   │ Historial reciente: [58]       │
   │ [Lista de cajas...]            │
   │                                │
   │ [Generar Etiqueta]             │
   │ [Mover Cajas] [Cerrar Pallet]  │
   └────────────────────────────────┘
  ↓
3. Toca "Cerrar Pallet"
  ↓
4. EL SISTEMA INICIA AUDITORÍA AUTOMÁTICA:

   ┌────────────────────────────────┐
   │ 🔍 Auditando Pallet...         │
   │                                │
   │ Verificando:                   │
   │ ✅ Capacidad del pallet        │
   │ ✅ Unicidad de cajas           │
   │ ✅ Secuencias de cajas         │
   └────────────────────────────────┘
  ↓
5. VES EL RESULTADO DE LA AUDITORÍA:

   ┌────────────────────────────────┐
   │ Resultado: ✅ EXCELENTE        │
   │ Puntuación: 100/100            │
   │                                │
   │ Resumen:                       │
   │ ✅ Capacidad: Correcto         │
   │ ✅ Unicidad: Sin duplicados    │
   │ ✅ Secuencia: Correcta         │
   │                                │
   │ Problemas: 0                   │
   │                                │
   │ [Cancelar] [Confirmar Cierre]  │
   └────────────────────────────────┘
  ↓
6. OPCIONES:

   Si AUDITORÍA PASÓ:
   ✅ Toca "Confirmar Cierre"
      → Pallet se cierra exitosamente
      → Va a "Pallets Cerrados"

   Si HAY PROBLEMAS:
   ⚠️ Revisa los problemas encontrados:
      • Duplicados
      • Cajas fuera de secuencia
      • Sobrecapacidad
   ⚠️ OPCIONES:
      • Toca "Confirmar Cierre" (cierra de todos modos)
      • Toca "Cancelar" (corrige problemas primero)
  ↓
7. DESPUÉS DEL CIERRE:
   ✅ "Pallet cerrado exitosamente"
   • El pallet desaparece de "Abiertos"
   • Aparece en "Cerrados"
   • Ya NO puedes agregar más cajas
  ↓
FIN
```

#### 🎯 Calificaciones de Auditoría:

```
✅ EXCELENTE (100 puntos)
   • Sin problemas detectados
   • Pallet perfecto

✅ BUENO (80-99 puntos)
   • Problemas menores
   • Advertencias leves

⚠️ ADVERTENCIA (50-79 puntos)
   • Algunos problemas
   • Revisar antes de cerrar

❌ CRÍTICO (0-49 puntos)
   • Problemas graves
   • Se recomienda NO cerrar
```

#### ⚠️ Errores comunes:

- **"Pallet vacío"**: No puedes cerrar un pallet sin cajas
- **"Cajas duplicadas"**: El mismo código está repetido
- **"Sobrecapacidad"**: Hay más cajas que el máximo permitido

---

### 3.5 Pallets Cerrados

#### ¿Para qué sirve?

Ver los pallets que ya fueron finalizados en Packing.

#### Flujo completo:

```
INICIO
  ↓
1. Desde Packing, toca "Pallets Cerrados"
  ↓
2. VES LA LISTA de pallets cerrados:

   ┌────────────────────────────────┐
   │ 🔍 [Buscar...]                 │
   │                                │
   │ ┌────────────────────────┐    │
   │ │ 📦 Pallet 12324101101  │    │
   │ │ Estado: ● CERRADO      │    │
   │ │ Calibre: EXTRA         │    │
   │ │ Cajas: 60/60           │    │
   │ │ Ubicación: PACKING     │    │
   │ └────────────────────────┘    │
   │ ... [más pallets]              │
   └────────────────────────────────┘
  ↓
3. TOCA UN PALLET para ver detalles
  ↓
4. EN EL MODAL, puedes:
   • 📄 Generar Etiqueta
   • 🚚 Mover Pallet a otra ubicación
  ↓
FIN
```

#### 💡 Información:

Los pallets cerrados no se pueden editar. Si necesitas hacer cambios, contacta a un administrador.

---

### 3.6 Cajas Sin Asignar (Packing)

#### ¿Para qué sirve?

Ver y gestionar cajas que no están asignadas a ningún pallet en el área de Packing.

#### Flujo completo:

```
INICIO
  ↓
1. Desde Packing, toca "Cajas Sin Asignar"
  ↓
2. VES LA LISTA de cajas:

   ┌────────────────────────────────┐
   │ Filtros:                       │
   │ • Calibre: [Todos]            │
   │ • Fecha desde: [...]          │
   │ • Fecha hasta: [...]          │
   │ • ☐ Solo especiales           │
   │ • 🔍 Buscar...                │
   │                                │
   │ Cajas encontradas:             │
   │ ┌────────────────────────┐    │
   │ │ 📦 1234567890123456    │    │
   │ │ Calibre: EXTRA         │    │
   │ │ Operario: 01           │    │
   │ │ Fecha: 14/10/2025      │    │
   │ └────────────────────────┘    │
   │ ... [más cajas]                │
   └────────────────────────────────┘
  ↓
3. ACCIONES DISPONIBLES:
   • Filtrar por calibre, fecha
   • Buscar por código
   • Toca una caja para ver detalles
  ↓
FIN
```

#### 💡 Filtros especiales:

- **Solo especiales**: Muestra solo cajas con información custom (formatos especiales)
- **Calibre**: Filtra por tipo de huevo

---

## 4. Módulo Bodega

### 4.1 Pallets en Bodega

#### ¿Para qué sirve?

Ver y gestionar todos los pallets que están almacenados en la bodega.

#### Flujo completo:

```
INICIO
  ↓
1. Desde Dashboard, toca "🏭 Bodega"
  ↓
2. VES LA PANTALLA:

   ┌────────────────────────────────┐
   │ 🔍 [Buscar...]                 │
   │                                │
   │ Filtros:                       │
   │ • Estado: [Todos/Abiertos/    │
   │           Cerrados]            │
   │ • Fecha desde: [...]          │
   │ • Fecha hasta: [...]          │
   │                                │
   │ ┌────────────────────────┐    │
   │ │ 📦 Pallet 12324101101  │    │
   │ │ Estado: ● CERRADO      │    │
   │ │ Ubicación: BODEGA      │    │
   │ │ Cajas: 60/60           │    │
   │ │ [Ver Detalles]         │    │
   │ └────────────────────────┘    │
   │ ... [más pallets]              │
   └────────────────────────────────┘
  ↓
3. TOCA UN PALLET para ver detalles
  ↓
FIN
```

---

### 4.2 Mover Pallets

#### ¿Para qué sirve?

Cambiar la ubicación de un pallet cerrado a otra área del sistema.

#### Flujo completo:

```
INICIO (desde Pallets Cerrados)
  ↓
1. Toca el pallet que quieres mover
  ↓
2. En el modal de detalles, toca "Mover Pallet ▼"
  ↓
3. SE DESPLIEGA UN MENÚ:

   ┌────────────────────────────────┐
   │ Mover a:                       │
   │ • 🚚 TRANSITO                  │
   │ • 🏭 BODEGA                    │
   │ • 🛒 VENTA                     │
   └────────────────────────────────┘
  ↓
4. TOCA LA UBICACIÓN de destino
  ↓
5. ESPERA confirmación:
   ✅ "Pallet movido exitosamente"
  ↓
6. El pallet cambia de ubicación:
   • Desaparece de la vista actual
   • Aparece en la nueva ubicación
  ↓
FIN
```

#### ⚠️ IMPORTANTE:

- Solo puedes mover pallets **CERRADOS**
- No puedes mover a la misma ubicación actual
- El movimiento se registra en el historial

---

### 4.3 Cajas Sin Asignar (Bodega)

#### ¿Para qué sirve?

Gestionar cajas que llegaron a bodega sin pallet asignado.

#### Flujo completo:

```
INICIO
  ↓
1. Desde Bodega, toca "Cajas Sin Asignar"
  ↓
2. VES LA LISTA de cajas sin pallet:

   ┌────────────────────────────────┐
   │ Filtros: [Calibre] [Fecha]     │
   │                                │
   │ ┌────────────────────────┐    │
   │ │ 📦 1234567890123456    │    │
   │ │ Calibre: EXTRA         │    │
   │ │ Estado: Sin asignar    │    │
   │ │ [Ver] [Crear Pallet]   │    │
   │ └────────────────────────┘    │
   │ ... [más cajas]                │
   └────────────────────────────────┘
  ↓
3. Para cada caja puedes:
   • Ver detalles
   • Crear pallet individual
  ↓
FIN (Ver 4.4 para Crear Pallet Individual)
```

---

### 4.4 Crear Pallet Individual

#### ¿Para qué sirve?

Crear un pallet con una sola caja cuando no puede ir en un pallet existente.

#### Flujo completo:

```
INICIO (desde Cajas Sin Asignar en Bodega)
  ↓
1. Encuentra la caja que quieres empaletizar
  ↓
2. Toca "Crear Pallet" en esa caja
  ↓
3. EL SISTEMA AUTOMÁTICAMENTE:
   • Crea un nuevo pallet
   • Asigna la caja a ese pallet
   • Cierra el pallet
   • Lo marca para bodega
  ↓
4. ESPERA mientras se procesa:
   ⏳ Creando pallet individual...
  ↓
5. VES CONFIRMACIÓN:
   ✅ "Pallet individual creado exitosamente"
  ↓
6. La caja desaparece de "Sin Asignar"
  ↓
FIN
```

#### 💡 ¿Cuándo usar esta función?

- Cajas con calibres especiales
- Cajas de producción extraordinaria
- Cajas que deben ir solas por alguna razón

---

## 5. Módulo Ventas

### 5.1 Crear Nueva Venta

#### ¿Para qué sirve?

Registrar una venta o salida de producto a un cliente.

#### Flujo completo:

```
INICIO
  ↓
1. Desde Dashboard, toca "🛒 Ventas"
  ↓
2. Toca "Nueva Venta"
  ↓
3. PASO 1 - TIPO DE VENTA:

   ┌────────────────────────────────┐
   │ Selecciona el tipo:            │
   │                                │
   │ ○ Venta                       │
   │ ○ Reposición                  │
   │ ○ Donación                    │
   │ ○ Inutilizado                 │
   │ ○ Ración                      │
   │                                │
   │         [Siguiente →]          │
   └────────────────────────────────┘
  ↓
4. PASO 2 - SELECCIONAR CLIENTE:

   ┌────────────────────────────────┐
   │ 🔍 Buscar cliente...           │
   │                                │
   │ ┌────────────────────────┐    │
   │ │ 👤 Juan Pérez          │    │
   │ │ 📧 juan@email.com      │    │
   │ │ 📞 +56 9 1234 5678     │    │
   │ └────────────────────────┘    │
   │ ... [más clientes]             │
   │                                │
   │ [Crear Nuevo Cliente]          │
   │ [← Atrás] [Siguiente →]        │
   └────────────────────────────────┘
  ↓
5. PASO 3 - SELECCIONAR CAJAS:

   ┌────────────────────────────────┐
   │ Pallets disponibles en BODEGA: │
   │                                │
   │ ┌────────────────────────┐    │
   │ │ 📦 Pallet 12324101101  │    │
   │ │ Cajas: 60/60           │    │
   │ │ Calibre: EXTRA         │    │
   │ │                        │    │
   │ │ Seleccionar cajas:     │    │
   │ │ ☐ Todas (60)          │    │
   │ │ ☐ Caja 1               │    │
   │ │ ☐ Caja 2               │    │
   │ │ ... [más cajas]        │    │
   │ └────────────────────────┘    │
   │                                │
   │ Total seleccionado: 45 cajas   │
   │ [← Atrás] [Siguiente →]        │
   └────────────────────────────────┘
  ↓
6. PASO 4 - RESUMEN Y CONFIRMACIÓN:

   ┌────────────────────────────────┐
   │ Resumen de la Venta:           │
   │                                │
   │ Tipo: Venta                    │
   │ Cliente: Juan Pérez            │
   │ Total Pallets: 2               │
   │ Total Cajas: 45                │
   │                                │
   │ Observaciones (opcional):      │
   │ [Notas adicionales...]         │
   │                                │
   │ [← Atrás] [Confirmar Venta]    │
   └────────────────────────────────┘
  ↓
7. Toca "Confirmar Venta"
  ↓
8. ESPERA mientras se procesa:
   ⏳ Creando orden de venta...
  ↓
9. VES LA CONFIRMACIÓN:

   ┌────────────────────────────────┐
   │ ✅ Venta creada exitosamente   │
   │                                │
   │ Orden #VTA-2024-001            │
   │                                │
   │ [Imprimir Reporte]             │
   │ [Ver Orden] [Nueva Venta]      │
   └────────────────────────────────┘
  ↓
FIN
```

#### 💡 Consejos:

- **Selección múltiple**: Puedes seleccionar cajas de varios pallets
- **Observaciones**: Usa este campo para notas de entrega o instrucciones
- **Imprimir**: El reporte se puede imprimir inmediatamente

---

### 5.2 Crear Cliente

#### ¿Para qué sirve?

Registrar un nuevo cliente en el sistema para poder hacerle ventas.

#### Flujo completo:

```
INICIO
  ↓
1. Desde "Ventas", toca "Crear Cliente"
   O
   Durante creación de venta, toca "Crear Nuevo Cliente"
  ↓
2. COMPLETA EL FORMULARIO:

   ┌────────────────────────────────┐
   │ Nombre: *                      │
   │ [Ej: Juan Pérez]              │
   │                                │
   │ Email: *                       │
   │ [Ej: juan@email.com]          │
   │                                │
   │ Teléfono: *                    │
   │ [Ej: +56 9 1234 5678]         │
   │                                │
   │ Dirección: (opcional)          │
   │ [Ej: Av. Principal #123]      │
   │                                │
   │ RUT/Tax ID: (opcional)         │
   │ [Ej: 12.345.678-9]            │
   │                                │
   │ Persona de Contacto: (opc.)    │
   │ [Ej: María López]             │
   │                                │
   │ [Cancelar] [Guardar Cliente]   │
   └────────────────────────────────┘
  ↓
3. Verifica que el email sea válido
  ↓
4. Toca "Guardar Cliente"
  ↓
5. ESPERA confirmación:
   ✅ "Cliente creado exitosamente"
  ↓
6. El cliente está listo para ventas
  ↓
FIN
```

#### ⚠️ Campos obligatorios:

- **Nombre**: Nombre completo o razón social
- **Email**: Correo electrónico válido
- **Teléfono**: Número de contacto

---

### 5.3 Órdenes en Borrador

#### ¿Para qué sirve?

Ver todas las ventas que aún no han sido confirmadas.

#### Flujo completo:

```
INICIO
  ↓
1. Desde "Ventas", toca "Órdenes en Borrador"
  ↓
2. VES LA LISTA:

   ┌────────────────────────────────┐
   │ ┌────────────────────────┐    │
   │ │ 📝 Orden VTA-2024-001  │    │
   │ │ Cliente: Juan Pérez    │    │
   │ │ Tipo: Venta            │    │
   │ │ Cajas: 45              │    │
   │ │ Estado: BORRADOR       │    │
   │ │ [Ver] [Confirmar]      │    │
   │ └────────────────────────┘    │
   │ ... [más órdenes]              │
   └────────────────────────────────┘
  ↓
3. ACCIONES DISPONIBLES:
   • Ver detalles
   • Confirmar orden
   • Editar (dependiendo del estado)
  ↓
FIN
```

---

### 5.4 Órdenes Confirmadas

#### ¿Para qué sirve?

Ver el historial de todas las ventas que fueron confirmadas.

#### Flujo completo:

```
INICIO
  ↓
1. Desde "Ventas", toca "Órdenes Confirmadas"
  ↓
2. VES LA LISTA de ventas confirmadas:

   ┌────────────────────────────────┐
   │ Filtros: [Fecha] [Cliente]     │
   │                                │
   │ ┌────────────────────────┐    │
   │ │ ✅ Orden VTA-2024-001  │    │
   │ │ Cliente: Juan Pérez    │    │
   │ │ Fecha: 14/10/2025      │    │
   │ │ Cajas: 45              │    │
   │ │ [Ver] [Imprimir]       │    │
   │ └────────────────────────┘    │
   │ ... [más órdenes]              │
   └────────────────────────────────┘
  ↓
3. TOCA UNA ORDEN para ver detalles completos
  ↓
4. PUEDES:
   • Ver reporte detallado
   • Imprimir reporte
   • Ver información del cliente
  ↓
FIN
```

---

### 5.5 Imprimir Reporte

#### ¿Para qué sirve?

Generar un documento imprimible con los detalles de una venta.

#### Flujo completo:

```
INICIO (desde una orden confirmada)
  ↓
1. Toca "Imprimir Reporte" en una orden
  ↓
2. SE ABRE UNA NUEVA VENTANA con el reporte:

   ┌────────────────────────────────┐
   │ 🏢 LOMAS ALTAS                 │
   │                                │
   │ REPORTE DE VENTA               │
   │ Orden #VTA-2024-001            │
   │                                │
   │ Cliente: Juan Pérez            │
   │ Email: juan@email.com          │
   │ Teléfono: +56 9 1234 5678      │
   │ Fecha: 14 de Octubre, 2025     │
   │                                │
   │ DETALLE:                       │
   │ ┌──────────────────────────┐  │
   │ │ Pallet: 12324101101      │  │
   │ │ Cajas: 45                │  │
   │ │ Calibre: EXTRA (Blanco)  │  │
   │ └──────────────────────────┘  │
   │                                │
   │ Total Pallets: 1               │
   │ Total Cajas: 45                │
   │                                │
   │ Observaciones:                 │
   │ [Entregar en horario laboral]  │
   └────────────────────────────────┘
  ↓
3. USA LOS CONTROLES DEL NAVEGADOR:
   • 🖨️ Imprimir (Ctrl+P / Cmd+P)
   • 💾 Guardar como PDF
   • 📧 Enviar por email
  ↓
4. Cierra la ventana cuando termines
  ↓
FIN
```

#### 💡 Formato del reporte:

- Logo de la empresa
- Información completa del cliente
- Detalle de pallets y cajas
- Fecha y hora de la venta
- Observaciones adicionales

---

## 6. Módulo Administración

### 6.1 Ver Problemas

#### ¿Para qué sirve?

Revisar problemas o issues detectados en el sistema.

#### Flujo completo:

```
INICIO
  ↓
1. Desde Dashboard, toca "⚙️ Administración"
  ↓
2. Por defecto verás "Problemas"
  ↓
3. VES LA LISTA de problemas:

   ┌────────────────────────────────┐
   │ Filtros: [Estado] [Fecha]      │
   │                                │
   │ ┌────────────────────────┐    │
   │ │ ⚠️ Pallet sobrecapacidad│    │
   │ │ Código: 12324101101    │    │
   │ │ Estado: ABIERTO        │    │
   │ │ Prioridad: ALTA        │    │
   │ │ [Ver Detalles]         │    │
   │ └────────────────────────┘    │
   │ ... [más problemas]            │
   └────────────────────────────────┘
  ↓
4. TOCA UN PROBLEMA para ver más información
  ↓
5. Dependiendo del tipo de problema:
   • Toma acciones correctivas
   • Marca como resuelto
   • Escala a un supervisor
  ↓
FIN
```

---

### 6.2 Zona de Peligro

#### ¿Para qué sirve?

Realizar operaciones administrativas críticas que afectan datos importantes.

#### ⚠️ ADVERTENCIA:

Esta sección es solo para **ADMINISTRADORES**. Las operaciones aquí son **IRREVERSIBLES**.

#### Flujo completo:

```
INICIO
  ↓
1. Desde Administración, toca "Zona de Peligro"
  ↓
2. VES ADVERTENCIAS:

   ┌────────────────────────────────┐
   │ ⚠️ ZONA DE PELIGRO              │
   │                                │
   │ Las operaciones aquí son       │
   │ IRREVERSIBLES y pueden         │
   │ afectar datos críticos.        │
   │                                │
   │ Operaciones disponibles:       │
   │ • Eliminar datos antiguos      │
   │ • Resetear sistema             │
   │ • Exportar base de datos       │
   │                                │
   │ [Volver al Dashboard]          │
   └────────────────────────────────┘
  ↓
3. SOLO PROCEDE SI:
   ✅ Tienes autorización
   ✅ Entiendes las consecuencias
   ✅ Has hecho backup
  ↓
FIN
```

---

## 7. Operaciones Especiales

### 7.1 Mover Cajas Entre Pallets

#### ¿Para qué sirve?

Transferir cajas de un pallet a otro cuando hay errores o reorganización.

#### Flujo completo:

```
INICIO (desde detalles de un pallet ABIERTO)
  ↓
1. En el modal del pallet, toca "Mover Cajas"
  ↓
2. SE ACTIVA EL MODO SELECCIÓN:

   ┌────────────────────────────────┐
   │ Modo: Seleccionar cajas        │
   │                                │
   │ [Seleccionar todo]             │
   │ 0 seleccionada(s)              │
   │                                │
   │ Cajas del pallet:              │
   │ ┌────────────────────────┐    │
   │ │ ☐ 1234567890123456     │    │
   │ │ ☐ 1234567890123457     │    │
   │ │ ☐ 1234567890123458     │    │
   │ └────────────────────────┘    │
   │                                │
   │ [Cancelar mover]               │
   │ [Mover seleccionadas]          │
   └────────────────────────────────┘
  ↓
3. TOCA LAS CAJAS que quieres mover:
   • Toca cada caja individualmente
   • O usa "Seleccionar todo"
  ↓
4. Cuando hayas seleccionado, toca "Mover seleccionadas"
  ↓
5. SE ABRE MODAL DE SELECCIÓN DE PALLET:

   ┌────────────────────────────────┐
   │ Selecciona pallet destino:     │
   │                                │
   │ 🔍 [Buscar pallet...]          │
   │                                │
   │ Pallets abiertos disponibles:  │
   │ ┌────────────────────────┐    │
   │ │ ○ 12324101102          │    │
   │ │   Cajas: 45/60         │    │
   │ │   Calibre: EXTRA       │    │
   │ └────────────────────────┘    │
   │ ... [más pallets]              │
   │                                │
   │ [Cancelar] [Confirmar]         │
   └────────────────────────────────┘
  ↓
6. SELECCIONA el pallet destino
  ↓
7. Toca "Confirmar"
  ↓
8. ESPERA mientras se mueven:
   ⏳ Moviendo 5 caja(s)...
  ↓
9. VES RESULTADO:
   ✅ "Se movieron 5 caja(s) correctamente"
   O
   ⚠️ "Se movieron 3 caja(s), pero 2 fallaron"
  ↓
10. Las cajas movidas:
    • Desaparecen del pallet origen
    • Aparecen en el pallet destino
  ↓
FIN
```

#### ⚠️ IMPORTANTE:

- Solo funciona con pallets **ABIERTOS**
- Verifica que el pallet destino tenga espacio
- El calibre debe coincidir

---

### 7.2 Auditoría de Pallets

#### ¿Para qué sirve?

Verificar la integridad y calidad de un pallet antes de cerrarlo.

#### Flujo completo:

```
INICIO
  ↓
1. La auditoría se ejecuta automáticamente al cerrar pallet
  ↓
2. EL SISTEMA VERIFICA:

   ┌────────────────────────────────┐
   │ 🔍 Auditando...                │
   │                                │
   │ Verificaciones:                │
   │                                │
   │ 1️⃣ CAPACIDAD:                  │
   │    ✅ El pallet no excede      │
   │       el máximo de cajas       │
   │                                │
   │ 2️⃣ UNICIDAD:                   │
   │    ✅ No hay cajas duplicadas  │
   │                                │
   │ 3️⃣ SECUENCIA:                  │
   │    ✅ Las cajas están en       │
   │       orden correcto           │
   └────────────────────────────────┘
  ↓
3. CALCULA PUNTUACIÓN:
   • 100 puntos = EXCELENTE ✅
   • 80-99 = BUENO ✅
   • 50-79 = ADVERTENCIA ⚠️
   • 0-49 = CRÍTICO ❌
  ↓
4. MUESTRA PROBLEMAS ENCONTRADOS:

   Si hay problemas:
   ┌────────────────────────────────┐
   │ Problemas detectados:          │
   │                                │
   │ ⚠️ ADVERTENCIA:                 │
   │ • Caja 1234567890123456        │
   │   está duplicada (2 veces)     │
   │                                │
   │ ⚠️ ADVERTENCIA:                 │
   │ • Hay 3 cajas fuera de         │
   │   secuencia                    │
   │                                │
   │ Total: 2 problemas             │
   └────────────────────────────────┘
  ↓
5. OPCIONES:
   • Confirmar cierre (ignora problemas)
   • Cancelar (corregir problemas)
  ↓
FIN
```

#### 💡 Tipos de problemas detectados:

- **COUNT_MISMATCH**: Número de cajas no coincide
- **OVERFILLED**: Más cajas que la capacidad
- **UNDERUTILIZED**: Muy pocas cajas (advertencia)
- **DUPLICATE_BOXES**: Códigos repetidos
- **SEQUENCE_GAPS**: Faltan cajas en la secuencia
- **INVALID_BOX_CODES**: Códigos mal formados

---

### 7.3 Generar Etiquetas

#### ¿Para qué sirve?

Crear una etiqueta imprimible con código de barras para identificar un pallet.

#### Flujo completo:

```
INICIO (desde detalles de un pallet)
  ↓
1. En el modal del pallet, toca "Generar Etiqueta"
  ↓
2. SE ABRE UNA NUEVA VENTANA con la etiqueta:

   ┌────────────────────────────────┐
   │                                │
   │    🏢 LOMAS ALTAS               │
   │                                │
   │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓           │
   │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓           │
   │   12324101101000               │
   │                                │
   │ Calibre: EXTRA (Blanco)        │
   │ Empresa: Lomas Altas           │
   │ Turno: Mañana                  │
   │ Fecha: 14/10/2025              │
   │                                │
   │ Cajas: 60/60                   │
   │ Estado: CERRADO                │
   │                                │
   └────────────────────────────────┘
  ↓
3. USA CONTROLES DEL NAVEGADOR:
   • 🖨️ Imprimir (Ctrl+P / Cmd+P)
   • 💾 Guardar como PDF
  ↓
4. AJUSTA TAMAÑO:
   • Recomendado: A5 o A6
   • Orientación: Vertical
  ↓
5. Imprime la etiqueta
  ↓
6. PEGA LA ETIQUETA en el pallet físico
  ↓
FIN
```

#### 💡 Información en la etiqueta:

- Logo de la empresa
- Código de barras escane able
- Código del pallet (texto)
- Información clave (calibre, empresa, turno)
- Fecha de creación
- Cantidad de cajas

---

### 7.4 Ver Detalles de Caja

#### ¿Para qué sirve?

Ver información completa de una caja específica.

#### Flujo completo:

```
INICIO (desde lista de cajas o pallet)
  ↓
1. TOCA una caja
  ↓
2. SE ABRE EL MODAL DE DETALLES:

   ┌────────────────────────────────┐
   │ Detalles de Caja               │
   │ 1234567890123456               │
   │                                │
   │ 📦 Código:                     │
   │    1234567890123456            │
   │                                │
   │ 🏭 Empacadora:                 │
   │    Línea 1                     │
   │                                │
   │ 📏 Calibre:                    │
   │    02 - EXTRA (Blanco)         │
   │                                │
   │ 📦 Formato:                    │
   │    180 unidades                │
   │                                │
   │ 👤 Operario:                   │
   │    01                          │
   │                                │
   │ 📍 Estado:                     │
   │    Asignado                    │
   │                                │
   │ 📅 Fecha Registro:             │
   │    14 de Octubre, 2025         │
   │                                │
   │ 🏢 Ubicación:                  │
   │    BODEGA                      │
   │                                │
   │ 🚛 Pallet:                     │
   │    12324101101000              │
   │                                │
   │ 🔢 Contador:                   │
   │    0042                        │
   │                                │
   │ 📊 Cantidad:                   │
   │    180 huevos                  │
   │                                │
   │ [Cerrar]                       │
   └────────────────────────────────┘
  ↓
3. REVISA la información
  ↓
4. Toca "Cerrar" cuando termines
  ↓
FIN
```

#### 💡 Información especial:

Si la caja es **ESPECIAL**, verás información adicional sobre el contenido custom.

---

## 8. Códigos y Nomenclatura

### 8.1 Estructura del Código de Pallet

#### Código completo: 14 dígitos

```
1 23 24 1 01 1 01 000
│ │  │  │ │  │ │  └─── Sufijo (3 dígitos)
│ │  │  │ │  │ └────── Empresa (2 dígitos)
│ │  │  │ │  └───────── Formato (1 dígito)
│ │  │  │ └──────────── Calibre (2 dígitos)
│ │  │  └─────────────── Turno (1 dígito)
│ │  └────────────────── Año (2 últimos dígitos)
│ └───────────────────── Semana del año (2 dígitos)
└─────────────────────── Día de la semana (1 dígito)
```

#### Ejemplo real:

**1232410110 1000**

- Día: `1` (Lunes)
- Semana: `23` (semana 23 del año)
- Año: `24` (2024)
- Turno: `1` (Mañana)
- Calibre: `01` (ESPECIAL Blanco)
- Formato: `1` (180 unidades)
- Empresa: `01` (Lomas Altas)
- Sufijo: `000` (primer pallet del día)

---

### 8.2 Estructura del Código de Caja

#### Código completo: 16 dígitos

```
1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6
│ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │
└─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─ Identificador único
  │ │ │ │ │ │ │ │ │ │
  │ │ │ │ │ └─┴─┴─┴─┴───────── Contador (4 dígitos)
  │ │ │ │ └─────────────────── Operario (1 dígito)
  │ │ │ └───────────────────── Calibre (2 dígitos)
  │ │ └─────────────────────── Turno (1 dígito)
  │ └───────────────────────── Fecha/Semana
  └─────────────────────────── Día semana
```

---

### 8.3 Códigos de Calibre

| Código | Descripción       |
| ------ | ----------------- |
| `01`   | ESPECIAL (Blanco) |
| `02`   | EXTRA (Blanco)    |
| `03`   | ESPECIAL (Color)  |
| `04`   | EXTRA (Color)     |
| `05`   | GRANDE (Color)    |
| `06`   | MEDIANO (Color)   |
| `07`   | TRICO             |
| `08`   | CHICO (Color)     |
| `09`   | FERIA             |
| `11`   | GRANDE (Blanco)   |
| `12`   | FINO (Blanco)     |
| `13`   | MEDIANO (Blanco)  |
| `14`   | CHICO (Blanco)    |
| `15`   | FINO (Color)      |
| `16`   | OTROS             |

---

### 8.4 Códigos de Empresa

| Código | Empresa     |
| ------ | ----------- |
| `01`   | Lomas Altas |
| `02`   | Santa Marta |
| `03`   | Coliumo     |
| `04`   | El Monte    |
| `05`   | Libre       |

---

### 8.5 Códigos de Formato

| Código | Descripción  |
| ------ | ------------ |
| `1`    | 180 unidades |
| `2`    | 100 JUMBO    |
| `3`    | Docena       |

---

### 8.6 Códigos de Turno

| Código | Turno  |
| ------ | ------ |
| `1`    | Mañana |
| `2`    | Tarde  |
| `3`    | Noche  |

---

### 8.7 Estados de Ubicación

| Estado         | Descripción                              |
| -------------- | ---------------------------------------- |
| `PACKING`      | Área de empaque, pallets en construcción |
| `TRANSITO`     | En movimiento entre áreas                |
| `BODEGA`       | Almacenado, listo para venta             |
| `PREVENTA`     | Reservado para un cliente                |
| `VENTA`        | Vendido y despachado                     |
| `UNSUBSCRIBED` | Dado de baja                             |

---

### 8.8 Estados de Pallet

| Estado   | Descripción               |
| -------- | ------------------------- |
| `open`   | Abierto, recibiendo cajas |
| `closed` | Cerrado, listo para mover |

---

### 8.9 Tipos de Venta

| Tipo          | Descripción                      |
| ------------- | -------------------------------- |
| `Venta`       | Venta normal a cliente           |
| `Reposición`  | Reemplazo de producto defectuoso |
| `Donación`    | Producto donado                  |
| `Inutilizado` | Producto descartado              |
| `Ración`      | Producto para consumo interno    |

---

## 9. Preguntas Frecuentes

### ❓ ¿Puedo cerrar un pallet con menos de 60 cajas?

✅ **Sí**, el número 60 es el máximo, no el mínimo. Puedes cerrar un pallet con cualquier cantidad de cajas siempre que:

- Tenga al menos 1 caja
- La auditoría no detecte problemas críticos

---

### ❓ ¿Qué hago si escaneo un código y no aparece?

⚠️ **Posibles causas:**

1. El código no está registrado en el sistema
2. El código está mal formado (verifica que tenga 14 o 16 dígitos)
3. Hay un error de conexión

**Solución:**

- Verifica el código manualmente
- Intenta escanearlo nuevamente
- Si persiste, contacta a un administrador

---

### ❓ ¿Puedo editar un pallet cerrado?

❌ **No**, una vez cerrado un pallet no se puede editar. Si necesitas hacer cambios:

1. Contacta a un administrador
2. El administrador puede reabrir el pallet
3. Haz los cambios necesarios
4. Cierra el pallet nuevamente

---

### ❓ ¿Qué significa "Pallet de huevo suelto"?

💡 Es un pallet especial para huevos que **NO están en cajas**, como:

- Carritos de huevos
- Bandejas sueltas
- Huevos individuales

Se registran por cantidad en lugar de por código de caja.

---

### ❓ ¿Puedo mover cajas entre pallets cerrados?

❌ **No**, solo puedes mover cajas entre pallets **ABIERTOS**.

Si necesitas mover cajas de un pallet cerrado:

1. Contacta a un administrador para reabrirlo
2. Mueve las cajas
3. Cierra ambos pallets nuevamente

---

### ❓ ¿Qué hago si la auditoría falla?

⚠️ **Depende de la calificación:**

- **CRÍTICO (0-49)**: **NO cierres** el pallet, corrige los problemas
- **ADVERTENCIA (50-79)**: Revisa los problemas, decide si cerrar o corregir
- **BUENO (80-99)**: Puedes cerrar, problemas menores
- **EXCELENTE (100)**: Cierra sin problemas

**Problemas comunes:**

- Cajas duplicadas → Elimina duplicados
- Sobrecapacidad → Mueve cajas a otro pallet
- Secuencia incorrecta → Reordena las cajas

---

### ❓ ¿Cómo sé cuántas cajas tiene un pallet?

📊 La información aparece en varios lugares:

- En la lista de pallets: `Cajas: 48/60`
- En el modal de detalles: `Total de Cajas: 48`
- En la etiqueta impresa

El formato `48/60` significa:

- `48` = cajas actuales
- `60` = capacidad máxima

---

### ❓ ¿Puedo crear un pallet sin cajas?

✅ **Sí**, puedes crear un pallet vacío que recibirá cajas posteriormente. Sin embargo:

- No puedes cerrarlo si está vacío
- Debe tener al menos 1 caja para cerrar

---

### ❓ ¿Qué es una caja especial?

💡 Una **caja especial** contiene información custom sobre el contenido, como:

- Tipos de huevos específicos
- Cantidades personalizadas
- Formatos especiales

Puedes filtrar cajas especiales usando el filtro "Solo especiales" en las listas de cajas.

---

### ❓ ¿Cómo imprimo una etiqueta?

🖨️ **Pasos:**

1. Abre el pallet
2. Toca "Generar Etiqueta"
3. Se abre una ventana nueva
4. Presiona `Ctrl+P` (Windows) o `Cmd+P` (Mac)
5. Configura:
   - Tamaño: A5 o A6
   - Orientación: Vertical
6. Imprime o guarda como PDF

---

### ❓ ¿Puedo cancelar una venta?

⚠️ **Depende del estado:**

- **BORRADOR**: Sí, puedes eliminarla
- **CONFIRMADA**: Contacta a un administrador

Las ventas confirmadas generalmente no se pueden cancelar sin autorización.

---

### ❓ ¿Qué hago si me equivoco al crear un pallet?

Si **NO lo has cerrado**:

1. No agregues cajas
2. Déjalo vacío
3. Contacta a un administrador para eliminarlo

Si **YA lo cerraste**:

1. Contacta inmediatamente a un administrador
2. Explica el error
3. El administrador tomará las acciones necesarias

---

### ❓ ¿Por qué no puedo mover un pallet?

⚠️ **Posibles causas:**

1. El pallet está **ABIERTO** → Solo se mueven pallets cerrados
2. Ya está en la ubicación de destino
3. No tienes permisos suficientes

**Solución:**

- Cierra el pallet primero
- Verifica la ubicación actual
- Contacta a un administrador si persiste

---

### ❓ ¿Cómo busco un cliente?

🔍 **En la creación de venta:**

1. Paso 2: Selección de cliente
2. Usa la barra de búsqueda
3. Escribe:
   - Nombre del cliente
   - Email
   - Teléfono
4. Los resultados se filtran automáticamente

---

### ❓ ¿Puedo ver el historial de un pallet?

📊 **Sí**, en el modal de detalles verás:

- Todas las cajas que contiene
- Fecha de creación
- Movimientos de ubicación (próximamente)
- Historial de auditorías

---

### ❓ El sistema está lento, ¿qué hago?

⚠️ **Soluciones:**

1. Refresca la página (F5)
2. Cierra otras pestañas del navegador
3. Verifica tu conexión a internet
4. Limpia el caché del navegador
5. Si persiste, contacta a soporte técnico

---

### ❓ ¿Cómo reporto un problema?

🐛 **Pasos:**

1. Ve a "Administración"
2. Toca "Problemas"
3. Si es un problema nuevo, contacta a un administrador
4. Describe:
   - Qué estabas haciendo
   - Qué código (pallet o caja) estaba involucrado
   - Qué mensaje de error viste (si hubo)

---

## 📞 Contacto y Soporte

Si tienes problemas no resueltos en este manual:

1. Contacta a tu supervisor inmediato
2. Llama al equipo de soporte técnico
3. Envía un email a: soporte@lomasaltas.com

---

## 📝 Notas Finales

### Buenas Prácticas:

- ✅ Siempre verifica los códigos antes de escanear
- ✅ Cierra los pallets cuando estén completos
- ✅ Revisa la auditoría antes de confirmar
- ✅ Mantén las etiquetas legibles y bien pegadas
- ✅ Reporta problemas inmediatamente

### Seguridad:

- 🔒 No compartas tus credenciales
- 🔒 Cierra sesión al terminar
- 🔒 No realices operaciones en "Zona de Peligro" sin autorización

---

**Versión del Manual:** 1.0  
**Última actualización:** Octubre 2025  
**Sistema:** Lomas Altas - Gestión de Inventario y Ventas

---

© 2025 Lomas Altas. Todos los derechos reservados.
