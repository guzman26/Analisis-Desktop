# UI Vercel Migration Spec (Core Operación)

## Objetivo

Migrar la UI a una estética inspirada en `vercel.app` en módulos activables por feature flags, manteniendo lógica de negocio y contratos API intactos.

## Principios visuales

- Tipografía: Geist Sans y Geist Mono como fuentes principales.
- Superficies: planas, neutras, con ruido visual mínimo.
- Bordes: sutiles (`1px`), radios moderados (`8px` a `12px`).
- Densidad: compacta, priorizando escaneo de información y acciones rápidas.
- Jerarquía: contraste por tamaño, peso y espacio, evitando colores saturados.
- Estados: foco visible, hover discreto, loading y empty states consistentes.

## Contrato de UX por pantalla

- Header con título, descripción y acciones primarias.
- Filtros agrupados y legibles.
- Contenido principal en cards o tabla con separación clara.
- Estado vacío explícito con siguiente acción sugerida.
- Estado de carga no bloqueante cuando aplique.
- Estado de error con mensaje accionable.
- Modales con títulos claros y acciones de confirmación/cancelación.

## Alcance de esta ola

- Dashboard.
- Packing, Bodega y Tránsito.
- Ventas core: nueva venta, clientes, órdenes (draft/confirmed).
- Despachos core: listado y formulario create/edit.

## Fuera de alcance

- Admin.
- Vistas de impresión (`/sales/print/:saleId`, `/pallet/label/:palletCode`).
- Ruta de prueba (`/test/shadcn`).

## Baseline de referencia (pre-migración)

> Guardar capturas por ruta antes de activar flags V2 para comparar regresiones visuales.

### Checklist de baseline por ruta

- [ ] Header y jerarquía visual.
- [ ] Filtros y toolbar.
- [ ] Alineación de cards/tablas.
- [ ] Empty state.
- [ ] Loading y errores.
- [ ] Modales principales.

### Rutas baseline sugeridas

- [ ] `/dashboard`
- [ ] `/packing/openPallets`
- [ ] `/packing/closedPallets`
- [ ] `/packing/carts`
- [ ] `/packing/createPallet`
- [ ] `/packing/unassignedBoxes`
- [ ] `/bodega/pallets`
- [ ] `/bodega/unassignedBoxes`
- [ ] `/transito/pallets`
- [ ] `/sales/new`
- [ ] `/sales/createCustomer`
- [ ] `/sales/orders`
- [ ] `/sales/confirmed`
- [ ] `/sales/customers`
- [ ] `/dispatch/list`
- [ ] `/dispatch/create`

## Activación por flags

- `VITE_UI_V2_SHELL=true|false`
- `VITE_UI_V2_VIEWS=dashboard,packing,bodega,transito,sales-core,dispatch-core`

## Criterios de aceptación

- Cada módulo puede activarse o desactivarse sin deploy adicional (env o localStorage override).
- Sin cambios funcionales de endpoints, contextos o reglas de negocio.
- Compilación y lint sin errores (`type-check`, `lint`, `build`).
- No regresión visual/funcional en rutas fuera de alcance.
