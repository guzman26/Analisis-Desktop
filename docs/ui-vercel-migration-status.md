# UI V2 Migration Status

## Fecha
2026-02-07

## Implementado en esta entrega

### Foundation
- Nuevo tema V2: `src/styles/theme-v2.css`.
- Activación de tema desde `src/main.tsx`.
- Feature flags por shell y por módulo: `src/config/uiFlags.ts`.
- Variables de entorno:
  - `VITE_UI_V2_SHELL`
  - `VITE_UI_V2_VIEWS`
- Nuevo shell V2: `src/components/layout/AppShellV2.tsx`.
- Integración en layout principal: `src/components/Layout.tsx`.
- Compatibilidad de `WindowContainer` con V2 por ruta: `src/components/design-system/WindowContainer.tsx`.

### Primitivas V2
- `src/components/app-v2/PageHeaderV2.tsx`
- `src/components/app-v2/MetricCardV2.tsx`
- `src/components/app-v2/FilterBarV2.tsx`
- `src/components/app-v2/ListToolbarV2.tsx`
- `src/components/app-v2/SectionCardV2.tsx`
- `src/components/app-v2/EmptyStateV2.tsx`

### Ajustes de wrappers
- Densidad y look V2 en:
  - `src/components/ui/button.tsx`
  - `src/components/ui/card-extended.tsx`
  - `src/components/ui/input-extended.tsx`
  - `src/components/ui/data-table.tsx`

### Vistas migradas (core operación)
- Dashboard:
  - `src/views/Dashboard.tsx`
- Packing:
  - `src/views/Packing/OpenPallets.tsx`
  - `src/views/Packing/ClosedPallets.tsx`
  - `src/views/Packing/Carts.tsx`
  - `src/views/Packing/CreatePallet.tsx`
  - `src/views/Packing/UnassignedBoxes.tsx`
- Bodega:
  - `src/views/Bodega/Pallets.tsx`
  - `src/views/Bodega/UnassignedBoxes.tsx`
- Tránsito:
  - `src/views/Transito/Pallets.tsx`
- Ventas core:
  - `src/views/Sale/CreateCustomerForm.tsx`
  - `src/views/Sale/CustomersTable.tsx`
  - `src/views/Sale/DraftSalesOrdersList.tsx`
  - estilos V2 condicionales en `src/styles/SalesOrdersList.css` y `src/styles/CreateSaleForm.css`
- Despachos core:
  - `src/views/Dispatch/DispatchesList.tsx`

## Rutas fuera de alcance preservadas
- `/admin/*`
- `/sales/print/:saleId`
- `/pallet/label/:palletCode`
- `/test/shadcn`

## Backlog (siguiente ola)
- Migración visual profunda de:
  - `src/views/Sale/ConfirmedSalesOrdersList.tsx`
  - `src/views/Sale/CreateSaleForm/CreateSaleForm.tsx`
  - `src/views/Dispatch/CreateDispatchForm.tsx`
- Reemplazo de inline styles residuales por clases utilitarias.
- Limpieza de CSS legacy no usado tras validación funcional completa.
- Segunda ola fuera de alcance actual:
  - `/admin/*`
  - vistas de impresión y etiqueta.
