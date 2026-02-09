# PR Checklist: Vercel-Like Consistency Architecture

## Arquitectura (solo archivos tocados)
- [ ] Código nuevo/refactorizado vive en `src/modules/<feature>/`.
- [ ] No se agrega nueva lógica de negocio en `src/views` o `src/components` legacy.
- [ ] Se usa contrato de módulo (`routes`, `queries`, `api`, `mappers`, `model`).

## Server State
- [ ] La vista consume hooks de módulo (`queries`/`mutations`), no endpoints directos.
- [ ] Hay query-key factory por módulo para listas/detalles.
- [ ] Mutaciones invalidan scope de server-state correspondiente.

## Routing
- [ ] Ruta nueva/refactorizada está declarada en `src/modules/*/routes`.
- [ ] Metadata de ruta (title/section/breadcrumb/flag) vive en route config.
- [ ] Si aplica, la ruta queda protegida por feature flag.

## UI y estilos
- [ ] No se introducen `style={{ ... }}` inline en zonas migradas.
- [ ] Se usan tokens de `theme-v2.css` + aliases de `theme-legacy-aliases.css`.
- [ ] Se priorizan primitivas compartidas (`PageHeaderV2`, `FilterBarV2`, `SectionCardV2`, `EmptyStateV2`).

## Calidad
- [ ] `npm run type-check`.
- [ ] `npm run build`.
- [ ] `npm run lint` en archivos tocados (o lint completo cuando sea posible).
- [ ] Smoke manual de rutas tocadas: carga, filtros, acciones, empty/loading/error.
