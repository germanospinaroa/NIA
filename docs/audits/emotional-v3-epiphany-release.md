# emotional_v3 — Epiphany Funnel release

## Cutover

- Commit de la reconstrucción: `9b92ce955af0823f62b67ae1f8399cae3f3a2179`.
- Deployment Vercel de la reconstrucción: `14gCNc84QPzxHpMYXqQqmG5AShAs`.
- Production quedó READY/SUCCESS según el check de Vercel en GitHub: `2026-10-17T17:47:18Z`.
- Hora Bogotá del cutover: `2026-10-17 12:47:18 -05:00`.

## Interpretación de analytics

`funnel_version` continúa siendo `emotional_v3`. Todos los eventos `emotional_v3` anteriores a `2026-10-17T17:47:18Z` corresponden a la arquitectura v3 anterior y deben excluirse de cualquier análisis del Epiphany Funnel. Los análisis nuevos deben filtrar `created_at >= '2026-10-17T17:47:18Z'`.

No se crearon eventos nuevos ni migraciones. Checkout attribution, Hotmart, `purchase_confirmed`, prices, offers y trial permanecen sin cambios.

## Verificación pública sin compra

- `/` devuelve HTTP 200 y comienza con `No sobrepiensas porque no sepas qué hacer.`.
- Pantallas 1–3 no contienen opciones; Personalize contiene exactamente 3 opciones.
- Los tres contextos (`request`, `conversation`, `decision`) producen demos distintas.
- El nombre es opcional y personaliza el saludo cuando existe.
- Mobile QA: 360×800, 375×812, 390×844 y 430×932: sin overflow, errores de consola o fallos de red.
- Desktop QA: 1440×900: sin overflow, errores de consola o fallos de red.
- Anti-spoof `POST /api/funnel/events` con `purchase_confirmed`: HTTP 400, `accepted=false`.
- No se completó ninguna compra real ni se fabricó `purchase_confirmed`.
