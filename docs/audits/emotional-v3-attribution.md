# emotional_v3 — atribución determinista de compra

Fecha: 2026-10-17

## Estado

Implementación local aislada y verificada. Production no fue modificada, no se creó una branch de Supabase y no se hizo ninguna compra.

## Arquitectura

1. `/descubre/v3/planes` solicita `/api/funnel/v3/checkout-attempt` con el `session_id` anónimo y el plan.
2. El servidor genera un UUID opaco y guarda `funnel_checkout_attempts` con sesión, versión, plan, offer, timestamps y campos operativos del proveedor.
3. El navegador añade ese UUID como `sck` a la URL Hotmart, conservando el offer y la atribución UTM existente.
4. El webhook valida Hottok antes de procesar el evento. `purchaseData()` extrae `purchase.origin.sck`, `src` y `xcod`.
5. Para `PURCHASE_APPROVED` o `PURCHASE_COMPLETE`, una función SQL `SECURITY DEFINER` bloquea el intento, valida versión/plan/offer y crea exactamente un `purchase_confirmed` con la sesión original.

## Garantías

- `purchase_confirmed` no está permitido en `POST /api/funnel/events`.
- El evento analítico se inserta dentro de la función server-side, nunca desde el navegador.
- `PURCHASE_APPROVED` y `PURCHASE_COMPLETE` sobre el mismo intento devuelven `already_confirmed` en la segunda llamada.
- Un `sck` inexistente, inválido o ausente no crea atribución; el procesamiento normal de la compra no se inventa ni se retroatribuye.
- La tabla operativa no guarda email, nombre, teléfono, buyer code ni subscriber code.
- La compra histórica de v2 con `purchase.origin = null` no fue retroatribuida.

## Preview

La migración `20261017133000_emotional_v3_checkout_attribution.sql` está preparada, pero no aplicada: este workspace no tiene una branch/conector de Supabase preview disponible y no se creó uno automáticamente por posible coste o autorización externa.

## Evidencia local

- Anti-spoof: `POST /api/funnel/events` con `purchase_confirmed` devuelve HTTP 400 y `{"accepted":false}`.
- Parser/webhook fixture: `npm run test:funnel-v3-attribution` verifica `origin.sck/src/xcod`, plan monthly, trial, llamada RPC, segundo evento idempotente y ausencia de vínculo sin `sck`.
- Checkout: la implementación añade `sck` después de conservar `off`, precio, trial y atribución.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS, 0 errores y 4 warnings heredados.
- `npm run build`: PASS.

Falta, necesariamente en un preview real, ejecutar el SQL y repetir el fixture contra una base de datos no productiva para observar la fila y confirmar la unicidad desde PostgreSQL.

## Final preview database gate

El intento de ejecutar el gate final el 2026-10-17 se detuvo en la precondición: la conexión oficial de Supabase respondió `USER_NOT_LOGGED_IN` al listar proyectos. No existe evidencia de una preview branch identificable desde este workspace. Por ello los tests DB 1–10, migration history, constraints reales, atomicidad y queries de evidencia quedan **NO EJECUTADOS**, no aprobados. No se aplicó SQL a ningún proyecto.
