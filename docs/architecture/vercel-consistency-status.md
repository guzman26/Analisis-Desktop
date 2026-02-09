# Vercel-Like Consistency Architecture Status

## Implementado en esta entrega

1. Migración real a TanStack Query (v5):
- Dependencias instaladas: `@tanstack/react-query`, `@tanstack/react-query-devtools`.
- `QueryClientProvider` integrado en `AppProviders`.
- Defaults aplicados: `retry: 1`, `refetchOnWindowFocus: false`, `staleTime: 30000`, `gcTime: 600000`.

2. Flags de datos separados de UI:
- Nuevo contrato en `src/config/dataFlags.ts`.
- Env vars agregadas: `VITE_DATA_V2_MODULES`, `VITE_DATA_V2_DEVTOOLS`.
- Tipado de env en `src/vite-env.d.ts`.

3. Capa compartida inventory creada:
- `src/modules/inventory/pallets/*`: api, keys, queries, mutations, hook bridge `usePalletServerState`.
- `src/modules/inventory/boxes/*`: api, keys, queries, mutations, hook `useUnassignedBoxesState`.

4. Capa sales migrada a query hooks:
- `src/modules/sales/*`: api, mappers, queries (infinite + detalle), mutations e invalidación.

5. Consumidores migrados (sin dependencia de Pallet/Boxes/Sales contexts):
- Packing: `OpenPallets`, `ClosedPallets`, `CreatePallet`, `UnassignedBoxes`.
- Bodega: `Pallets`, `UnassignedBoxes`.
- Tránsito: `Pallets`.
- Sales: `DraftSalesOrdersList`, `ConfirmedSalesOrdersList`, `CreateSaleForm`, `SaleReportPrintView`.
- Componentes: `SelectTargetPalletModal`, `PalletLooseEggsModal`, `AddBoxesToSaleModal`.

6. Retiro de contexts de server state:
- `PalletProvider`, `BoxesProvider`, `SalesProvider` removidos de `LegacyDomainProviders`.
- Archivos eliminados:
  - `src/contexts/PalletContext.tsx`
  - `src/contexts/BoxesContext.tsx`
  - `src/contexts/SalesContext.tsx`

7. Gates de consistencia reforzados:
- ESLint bloquea imports de contextos retirados.
- Se mantiene prohibición de endpoints directos en capas de módulo migradas.

## Notas de rollout

- Rollout por módulo soportado mediante `dataFlags`.
- En hooks de inventory/sales se mantiene fallback legacy por flag para rollback controlado durante transición.
