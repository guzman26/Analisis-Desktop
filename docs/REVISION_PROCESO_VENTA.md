# Revisión: Proceso de venta (Bodega → Venta)

## Resumen del flujo actual

1. **Crear venta (Desktop)**  
   Tipo → Cliente → Calibres y cantidades (solo números) → Confirmar.  
   Se envía `SaleRequest` con `customerId`, `type`, `calibres: [{ calibre, boxCount }]`. No se eligen cajas ni pallets concretos.

2. **Backend CreateSale**  
   - Formato "request" (calibres): guarda la venta en estado **DRAFT** con `boxes = []`, `pallets = []` y `metadata.requestedBoxesByCalibre`.  
   - No reserva inventario ni mueve ubicaciones.

3. **Órdenes en borrador (Desktop)**  
   Lista de ventas DRAFT con acción **Confirmar**.

4. **Confirmar venta (Desktop)**  
   - Backend **ConfirmSale**: valida que `sale.boxes` tenga por calibre al menos lo pedido en `requestedBoxesByCalibre`; si faltan cajas, lanza "No se puede confirmar la venta: faltan cajas".  
   - Luego llama `sale.confirm()`. La entidad **Sale** en `canConfirm()` exige `pallets.length > 0 || boxes.length > 0`; si no, lanza "Sale must have at least one pallet or box".

5. **Ventas confirmadas (Desktop)**  
   Acciones: Ver detalles, Imprimir, Devolver, **Agregar Cajas**, Despachar, Completar.

6. **Backend Dispatch/Complete**  
   Solo cambian el estado de la venta (DISPATCHED, COMPLETED). No mueven cajas ni pallets a PREVENTA ni VENTA.

7. **Ubicaciones (BODEGA → PREVENTA → VENTA)**  
   En el backend de ventas **no** se actualiza `ubicacion` de cajas/pallets al confirmar, despachar o completar. Existen casos de uso de inventario que mueven **todos** los pallets de BODEGA/TRANSITO a VENTA (`MoveAllPalletsFromBodegaToVenta`, `MoveAllPalletsFromTransitToVenta`), pero no están atados a una venta concreta.

---

## Hallazgos: coherencia y optimización

### 1. Flujo de confirmación incompatible con “solo calibres”

- La venta se crea sin cajas (`boxes = []`).  
- Para **confirmar**, el backend exige que ya existan cajas asignadas y que cumplan por calibre lo solicitado.  
- Quien asigna cajas es **AddBoxesToSale**, que solo acepta ventas en **DRAFT**.  
- En la UI, **“Agregar Cajas”** solo se muestra en **Ventas Confirmadas** (ConfirmedSalesOrdersList), no en borradores.  
- Consecuencia: con el flujo actual (crear por calibres y confirmar desde desktop) **no hay forma en desktop de agregar cajas antes de confirmar**. La confirmación fallará siempre con “faltan cajas” a menos que otro sistema (p. ej. móvil) haya agregado cajas al DRAFT antes.

**Recomendación:**  
- Opción A: Permitir en desktop agregar cajas a ventas **DRAFT** (pantalla de borradores) y que “Confirmar” solo esté habilitado cuando la venta tenga las cajas necesarias por calibre.  
- Opción B: Si la intención es que las cajas se asignen solo en móvil al despachar, entonces en desktop “Confirmar” debería poder aceptar ventas en formato “solo calibres” (sin cajas aún) y la entidad `Sale` debería permitir `confirm()` cuando exista `metadata.requestedBoxesByCalibre` aunque `boxes.length === 0`. Hoy la entidad no tiene esa excepción.

---

### 2. Contrato add-boxes: frontend vs backend

- **Frontend** (`AddBoxesToSaleModal`): envía `{ saleId, items: [{ palletId, boxIds }], reason }` en una sola llamada.  
- **Backend** (SalesController + AddBoxesToSale): espera `{ saleId, boxCode?, palletCode? }` — **una** caja **o** **un** pallet por request.  
- El backend no usa `params.items`; si se envía solo `items`, `boxCode` y `palletCode` quedan undefined y el use case lanza “Debe proporcionar boxCode o palletCode”.  
- Además, AddBoxesToSale solo permite ventas en **DRAFT**, pero el modal “Agregar Cajas” se usa en ventas **CONFIRMED**.

**Recomendación:**  
- Unificar contrato: o el backend acepta `items[]` y procesa en batch (y opcionalmente permite CONFIRMED para “agregar cajas extra”), o el frontend hace N llamadas (una por caja o por pallet) y el backend mantiene un solo box/pallet por llamada.  
- Alinear estado: si agregar cajas solo es válido en DRAFT, el botón “Agregar Cajas” debe estar en la lista de **borradores**; si también se permite en CONFIRMED, el backend debe aceptarlo explícitamente.

---

### 3. validateInventory no se usa en la creación de venta

- Existe `validateInventory(items: { palletId, boxIds }[])` en la API.  
- **CreateSaleForm** no lo llama. La creación por calibres no comprueba disponibilidad en BODEGA por calibre antes de crear.  
- El usuario puede crear una venta pidiendo más cajas de un calibre de las que hay en BODEGA; el error solo aparecerá al intentar confirmar (o al asignar cajas), con mensajes genéricos de “faltan cajas”.

**Recomendación:**  
- Antes de crear (o antes de pasar al paso de confirmación), llamar a un endpoint que valide disponibilidad por calibre en BODEGA (o reutilizar/adaptar `validateInventory` si el backend soporta validación por calibre) y mostrar en UI “X cajas disponibles del calibre Y” o “No hay suficiente inventario para el calibre Z”.  
- Opcional: deshabilitar o advertir en el paso de calibres si no hay stock suficiente por calibre.

---

### 4. Ubicaciones PREVENTA / VENTA no se actualizan con la venta

- Confirmar / Despachar / Completar no mueven cajas ni pallets a PREVENTA ni VENTA.  
- Las cajas asignadas a una venta siguen en BODEGA a nivel de inventario.  
- Los movimientos masivos “todo BODEGA → VENTA” no están ligados a una venta concreta.

**Recomendación (según reglas de negocio):**  
- Si se desea que el inventario refleje “reservado para venta” o “vendido”:  
  - Al **confirmar** (o al asignar las cajas): marcar cajas/pallets como PREVENTA (o reservar por `saleId`), y/o  
  - Al **despachar** o **completar**: mover cajas/pallets de esa venta a VENTA y actualizar `soldTo`/reserva en el modelo de caja.  
- Implementar esto en el backend (ConfirmSale / DispatchSale / CompleteSale o en un servicio de inventario llamado desde ellos) y no depender solo de los “move all” actuales.

---

### 5. Entidad Sale: canConfirm() y formato “solo calibres”

- `Sale.canConfirm()` exige `pallets.length > 0 || boxes.length > 0`.  
- En formato “solo calibres”, al crear la venta `boxes` y `pallets` están vacíos.  
- ConfirmSale primero valida por calibre; si hay cajas asignadas y cuadran, luego llama `sale.confirm()` → `canConfirm()` ya se cumple.  
- Si **nunca** se asignan cajas (solo desktop), ConfirmSale falla antes por “faltan cajas”; si en el futuro se permitiera confirmar sin cajas, `canConfirm()` reventaría.  
- Para un flujo “confirmar solo con solicitud por calibre (sin cajas aún)”, la entidad debería permitir confirm cuando exista `metadata.requestedBoxesByCalibre` (y quizá estado “reservado” o similar).

**Recomendación:**  
- Definir un único flujo deseado (confirmar solo con cajas asignadas vs confirmar solo con calibres).  
- Si se confirma solo con cajas asignadas: mantener `canConfirm()` y asegurar que en desktop se puedan agregar cajas a DRAFT antes de confirmar (y alinear add-boxes como en punto 2).  
- Si se admite confirmar sin cajas: relajar `canConfirm()` cuando haya `requestedBoxesByCalibre` y documentar que las cajas se asignan después (p. ej. en despacho).

---

### 6. Refresco de datos tras crear venta

- CreateSaleForm después de crear llama a `draftSales.refresh()`, `confirmedSales.refresh()` y `fetchClosedPalletsInBodega()`.  
- Tiene sentido para que las listas y la bodega reflejen el nuevo DRAFT; no hay problema de optimización aquí.

---

### 7. UX y mensajes

- El mensaje de éxito al crear dice: “Las cajas se asignarán durante el despacho en la aplicación móvil”.  
- Eso es coherente con un flujo donde confirmar en desktop podría requerir que antes se hayan asignado cajas (p. ej. en móvil o en desktop con “Agregar cajas” en borradores).  
- Mejorar mensajes de error (ya hay varios casos en CreateSaleForm) y añadir uno explícito cuando falle confirmación por “faltan cajas” (indicar que se deben asignar cajas a la venta en borrador primero).

---

## Resumen de prioridades

| Prioridad | Acción |
|----------|--------|
| Alta     | Alinear flujo confirmación + asignación de cajas: o permitir “Agregar cajas” en DRAFT en desktop y que Confirmar exija cajas, o permitir confirmar sin cajas (solo calibres) y ajustar entidad y backend. |
| Alta     | Unificar contrato add-boxes (frontend envía `items[]`, backend espera boxCode/palletCode) y ubicación del botón “Agregar Cajas” (DRAFT vs CONFIRMED). |
| Media    | Validar disponibilidad por calibre en BODEGA antes o durante la creación de venta y mostrar feedback en UI. |
| Media    | Decidir si Confirmar/Despachar/Completar deben actualizar ubicaciones (PREVENTA/VENTA) y reserva/vendido; si sí, implementarlo en backend. |
| Baja     | Revisar uso de PREVENTA vs VENTA y si los “move all” deben convivir con movimientos por venta. |

---

## Conclusión

El proceso de venta desde bodega hasta venta **tiene sentido a nivel de ideas** (crear por calibres, asignar cajas, confirmar, despachar, completar), pero hoy hay **incoherencias importantes**:

1. No se pueden asignar cajas a un borrador desde desktop antes de confirmar, y el backend sí exige cajas para confirmar.  
2. “Agregar Cajas” está en ventas confirmadas mientras el backend solo permite agregar en DRAFT, y el contrato add-boxes (items[] vs boxCode/palletCode) no coincide.  
3. No hay validación de inventario por calibre al crear la venta.  
4. Las ubicaciones PREVENTA/VENTA no se actualizan con el ciclo de vida de la venta.

Con las correcciones anteriores (sobre todo flujo confirmación + add-boxes y, si aplica, movimientos de inventario), el proceso quedaría coherente y mejor preparado para uso real y optimizado.
