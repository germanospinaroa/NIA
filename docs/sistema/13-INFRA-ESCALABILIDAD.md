# INFRAESTRUCTURA Y ESCALABILIDAD — Apps Listas para Vender y Crecer

> **Cuándo cargar este archivo:**
> - Al decidir la arquitectura (junto con `04-ARQUITECTURA.md`)
> - Antes del deploy (junto con `08-DEPLOY.md`)
> - Cuando la app empieza a tener usuarios reales y hay que prepararla para crecer

## Objetivo
Que la app no se caiga, no se vuelva lenta y no genere facturas sorpresa cuando pase de 10 usuarios a 500, 1.000 o más. La mayoría de apps creadas con IA mueren aquí: funcionan perfecto en la demo y colapsan con usuarios reales.

---

## NOTA SOBRE COSTOS DE HOSTING (Vercel) — el matiz honesto

```
- Vercel Hobby (gratis): técnicamente sus términos PROHÍBEN el uso comercial, y en teoría
  pueden suspender la cuenta. EN LA PRÁCTICA, mientras el tráfico se mantenga dentro de los
  límites gratis (100GB de ancho de banda/mes, 1M de invocaciones de función — verificado jul-2026),
  rara vez lo aplican para apps pequeñas — por eso mucha gente vende apps en Hobby sin que les cobren.
- El riesgo real NO es un cobro sorpresa (no hay tarjeta en archivo, las funciones se pausan
  al llegar al límite). El riesgo es una suspensión sin aviso si la app crece y llama la atención.
- Límite técnico (2026, con Fluid compute por defecto): las funciones llegan a ~300s en Hobby y
  hasta 800s en Pro — los viejos "10s Hobby / 60s Pro" quedaron obsoletos. Aun así, NO sostengas
  requests largos para imagen/audio: usa el patrón asíncrono de `30-INTEGRACION-IA.md` (es cuestión
  de costo, UX y fiabilidad, no de timeout). Fluid compute además factura CPU activa (la espera de
  I/O por llamadas a IA/DB cuesta ~$0), lo que abarata las cargas que esperan a APIs externas.
- RECOMENDACIÓN HONESTA: empezar y validar en Hobby gratis está perfecto. Cuando la app ya
  genera ingresos estables, pasar a Pro ($20/mes) por dos razones: cumplir los términos y
  quitarte el riesgo de suspensión, y un timeout de función mucho mayor (hasta 800s con Fluid compute). No es urgente desde el día uno —
  es el paso correcto cuando el negocio ya factura.
- Alternativa gratis sin restricción comercial estricta: Netlify o Cloudflare Pages tienen
  tiers gratis generosos; valorarlas si el presupuesto es cero y la app es comercial desde ya.
```

---

## ARQUITECTURA DE REFERENCIA (el stack que escala sin reescribir)

```
Usuario
  │
  ▼
[Vercel] ── Frontend (React/Next.js) + CDN global automático
  │
  ▼
[Vercel Functions / Supabase Edge Functions] ── BFF: lógica + claves de IA
  │                                              + rate limiting
  ├──▶ [API de IA] (Anthropic/OpenAI) — con max_tokens y caché
  │
  ▼
[Supabase] ── Auth + PostgreSQL + Storage + Realtime
  │
[GitHub] ── Repo + CI (cada push a main = deploy automático en Vercel)
[Stripe / Lemon Squeezy / Hotmart] ── Pagos + webhooks
[Sentry] ── Errores en producción
[Vercel Analytics / Plausible] ── Métricas de uso
```

Esta arquitectura aguanta miles de usuarios en planes gratuitos o baratos SI se aplican las prácticas de abajo. El problema nunca es el stack — es cómo se usa.

---

## QUÉ SE ROMPE CON 500-1.000 USUARIOS (y cómo prevenirlo HOY)

### 1. La base de datos se vuelve lenta → ÍNDICES
El error #1. Las queries que tardan 50ms con 100 filas tardan 5 segundos con 100.000.

```sql
-- Regla: TODA columna que aparece en WHERE, ORDER BY o JOIN lleva índice.
CREATE INDEX idx_generations_user ON generations(user_id);
CREATE INDEX idx_generations_user_created ON generations(user_id, created_at DESC);
-- El patrón más común: "los resultados de ESTE usuario, más recientes primero"
-- necesita el índice compuesto de arriba.
```

> Estrategia completa de índices (FKs sin indexar, orden de índices compuestos, tipos GIN/BRIN), migraciones zero-downtime y diagnóstico con `EXPLAIN ANALYZE` en `25-BASE-DE-DATOS.md`.

### 2. Las listas explotan → PAGINACIÓN obligatoria
Nunca `SELECT *` sin límite. Un usuario con 2.000 generaciones no debe descargar 2.000 filas al abrir su historial.

```typescript
// Siempre paginar:
.select('*').order('created_at', { ascending: false }).range(0, 24) // 25 por página
// Y en la UI: botón "Cargar más" o scroll infinito con indicador.
```
> ⚠️ `.range()`/OFFSET es el caso simple y se **degrada en listas profundas** (la página 50 escanea miles de filas y puede duplicar/saltar registros si entran inserciones). Para historiales, feeds y scroll infinito —el 90% de los casos— el default correcto es **paginación KEYSET (cursor)**. Patrón completo (comparación de tuplas + índice + cliente de Supabase) en `25-BASE-DE-DATOS.md` → "PAGINACIÓN KEYSET". Reservar OFFSET para paginadores numerados sobre pocas filas.

### 3. Las conexiones a la DB se agotan → CONNECTION POOLING
Las funciones serverless abren una conexión por invocación. Con tráfico, agotas el límite de Postgres.
- **Puerto 6543 (transaction mode)** → para serverless / Edge / la app. El cliente JS de Supabase ya lo maneja; aplica si conectas con drivers SQL directos. **Cuidado:** el modo transaction ROMPE prepared statements, `SET` de sesión, `LISTEN/NOTIFY` y advisory locks — no uses esas features sobre el pooler transaccional.
- **Puerto 5432 (session mode / conexión directa)** → para migraciones y tareas administrativas (donde sí necesitas sesión persistente).
- Regla de capacidad: `max_connections` de Postgres ≥ suma de todos los pool sizes + conexiones directas estables + 20% de margen.

### 4. Un usuario (o un bot) te quema el presupuesto de IA → RATE LIMITING en el servidor
Sin esto, un script puede hacer 10.000 llamadas a tu BFF en una hora y la factura de la API de IA es tuya.

```typescript
// En el BFF, por usuario autenticado (no por IP, que se rota fácil):
// Free: 10 req/min y límite diario duro. Pro: 30 req/min + fair-use mensual.
// Implementación simple: contador en la DB o en Upstash Redis (plan gratis)
// (implementación canónica en 09 — sliding window en Postgres y variante @upstash/ratelimit).
// Responder 429 con mensaje amigable, nunca un error críptico.
```
> ⚠️ Si el contador vive en la DB, increméntalo de forma **atómica** (`UPDATE ... SET n = n + 1 WHERE ... RETURNING n`), nunca "SELECT n → comparar en JS → UPDATE": bajo concurrencia eso es una race condition que deja pasar más requests del límite. Incremento/decremento atómico y cuotas correctas en `25-BASE-DE-DATOS.md` → "TRANSACCIONES Y ATOMICIDAD".

### 5. Pagas dos veces por la misma respuesta de IA → CACHÉ
Si 50 usuarios piden lo mismo (o el mismo usuario repite), la segunda vez debe costar $0.

```typescript
const cacheKey = hash(normalizedInput + options);
// Guardar en una tabla `ai_cache` (key, output, created_at) con TTL según el caso.
// Para inputs únicos por usuario el hit-rate será bajo; para features tipo
// "analiza esta URL" o "plantillas populares", el ahorro es enorme.
```

### 6. Las tareas largas → NO BLOQUEAR (patrón asíncrono)
Con Fluid compute las funciones llegan a ~300s (Hobby) / 800s (Pro), pero sostener un request largo para imagen/audio es mala UX, caro y frágil ante reintentos. Regla por tipo de tarea:
- Texto que el usuario espera ver: streaming (ve progreso, la conexión no muere ociosa).
- Imagen / audio / lotes: SIEMPRE patrón asíncrono — fila `status: 'processing'` → worker (cola **pgmq** o **pg_cron** —ambos incluidos en Supabase en todos los planes—, Edge Function con `EdgeRuntime.waitUntil`, o Inngest/Trigger.dev/QStash) → el frontend se entera por Realtime o polling. **Arquitectura completa de IA multimodal y resiliencia en `30-INTEGRACION-IA.md`.**

### 7. Las imágenes matan la carga → OPTIMIZACIÓN + CDN
- Subidas de usuarios → Supabase Storage con transformaciones (resize al servir).
- Assets propios → WebP/AVIF, <200KB, lazy loading. Vercel sirve todo por CDN automáticamente.
- Nunca servir imágenes originales de 4MB porque "se ve igual".

### 8. Algo se rompe a las 3am y nadie se entera → MONITOREO + ALERTAS
- **Sentry** para errores de frontend y backend (plan gratis: 5K eventos/mes).
- **Alertas de costo**: configurar límites de gasto/alertas en la consola de la API de IA y en Vercel. Una app con bug en un loop puede generar cientos de dólares en una noche.
- Revisar semanalmente: logs de Vercel, logs de Supabase, dashboard de Sentry.

### 9. Se pierde la base de datos → BACKUPS
- Supabase hace backups diarios automáticos (verificar que el plan los incluye).
- Antes de cualquier migración de esquema en producción: backup manual primero.
- Regla: nunca correr `DROP` o `ALTER` destructivo en producción sin backup de ese día.

---

## CHECKLIST DE ESCALABILIDAD (verificar antes de vender la app)

```
BASE DE DATOS
[ ] Índices en toda columna usada en WHERE / ORDER BY / JOIN
[ ] Paginación en toda lista (nunca SELECT sin límite)
[ ] RLS activo en todas las tablas (seguridad Y rendimiento)
[ ] Backups automáticos verificados

BACKEND / BFF
[ ] Rate limiting por usuario en todos los endpoints de IA
[ ] Caché de respuestas de IA donde aplique
[ ] max_tokens limitado en toda llamada a IA
[ ] Tareas >30s fuera del request (streaming o cola)
[ ] Timeouts y reintentos definidos para APIs externas

FRONTEND
[ ] Imágenes optimizadas (WebP, lazy loading)
[ ] Bundle sin dependencias gigantes innecesarias
[ ] Skeleton loaders (la percepción de velocidad también escala)

OPERACIÓN
[ ] Sentry capturando errores en producción
[ ] Uptime externo gratuito (UptimeRobot/BetterStack) sobre la URL de producción + /api/health —
    Sentry NO avisa si la app está caída y nadie la visita (ver 31)
[ ] Heartbeat de TODOS los crons críticos (worker de cola, reclaim, backup, reconciliación de
    suscripciones — 18/31): cada cron hace ping al terminar; sin ping = alerta
[ ] Alertas de costo configuradas (API de IA + Vercel)
[ ] Variables de entorno separadas dev/producción
[ ] Proyecto Supabase de dev separado del de producción
[ ] Dominio propio con HTTPS (Vercel lo da automático)
[ ] Estrategia de rollback conocida (promote deployment anterior en Vercel)

NEGOCIO
[ ] Webhook de pagos probado end-to-end (pagar → plan activo → features desbloqueadas)
[ ] Fair-use limit en el plan "ilimitado"
[ ] Economía unitaria verificada: costo de IA por usuario Pro < 20% del precio
```

---

## CAPACIDAD REAL A 300-500 USUARIOS (números verificados, mediados 2026)

El stack básico (Supabase + Vercel + APIs de IA) aguanta 300-500 usuarios activos SIN reescribir nada — pero hay que saber qué da cada tier y, sobre todo, **qué se rompe primero** (no es lo que la mayoría cree).

```
QUÉ DA CADA TIER:
Supabase Free : 500 MB DB · 1 GB Storage · 5 GB egress/mes · 500k invocaciones Edge ·
                pg_cron y pgmq incluidos · SE PAUSA tras 7 días de inactividad · máx 2 proyectos.
Supabase Pro  : $25/mes · 8 GB DB · 100 GB Storage · 250 GB egress · 2M invocaciones ·
                pooler 200 conexiones · sin pausa.
Vercel Hobby  : 100 GB bandwidth (tope duro) · 1M invocaciones (verificado jul-2026) ·
                funciones ~300s (Fluid compute) · cron mínimo 1×/día.
Vercel Pro    : $20/asiento · 1 TB transfer · funciones hasta 800s · cron hasta 1×/minuto.
```

```
QUÉ SE ROMPE PRIMERO (y NO es Vercel):
→ El plan FREE de Supabase, por dos razones antes que cualquier límite de volumen:
  (a) SE PAUSA tras 7 días de inactividad → inviable para una app en producción 24/7;
  (b) los 5 GB de egress/mes se agotan rápido sirviendo assets/imágenes a 300-500 usuarios.

PRIMER UPGRADE (el mejor dólar que vas a gastar): Supabase Pro ($25/mes).
  Quita la pausa, sube egress a 250 GB y DB a 8 GB, y habilita el pooler (200 conns) para serverless.

SEGUNDO UPGRADE: Vercel Pro ($20) — cuando necesites crons frecuentes (workers de cola con pgmq,
  que en Hobby solo corren 1×/día) o pases de 100 GB de bandwidth.

LAS APIS DE IA no se "rompen": escalan linealmente. El riesgo ahí es COSTO, no caída. Mitigar con
  prompt caching (~90%), Batch API (50%) y modelos baratos (Haiku, Flash v2.5). Detalle en `30`.
```

> **Límite de payload de Vercel (4.5 MB por request/response):** las subidas de imágenes del usuario y los archivos generados NO pasan por la función — van directo a Supabase Storage con upload firmado. Si no, recibes un 413. Ver `30-INTEGRACION-IA.md`.

---

## CUÁNDO PREOCUPARSE POR MÁS (y cuándo NO)

**NO necesitas (todavía):** Kubernetes, microservicios, Redis dedicado, múltiples regiones, GraphQL, colas enterprise. Todo eso es para decenas de miles de usuarios activos. Agregarlo antes es complejidad que frena sin dar nada.

**Señales de que toca el siguiente nivel** (miles de usuarios activos diarios): queries lentas pese a índices → réplicas de lectura; el pooler se satura → plan superior de Supabase; la factura de IA domina los costos → modelos más pequeños + batch + caché agresivo. Pero con la checklist de arriba bien aplicada, el stack de referencia llega mucho más lejos de lo que la gente cree.
