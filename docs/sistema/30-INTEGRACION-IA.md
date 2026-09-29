# INTEGRACIÓN DE IA — Texto, Imagen, Audio, Video y Resiliencia a Escala

> **Cuándo cargar este archivo:**
> - Al construir CUALQUIER feature que llame a una API de IA (texto, imagen o audio) — junto con `05-CREACION.md` y `09-SEGURIDAD.md`
> - Al diseñar la arquitectura de una app de IA que debe soportar 300-500 usuarios (junto con `13-INFRA-ESCALABILIDAD.md`)
> - Cuando la app es lenta, falla intermitentemente, o el costo de IA se dispara
>
> **Números verificados a mediados de 2026.** Los precios y modelos cambian — `AI_MODEL` siempre en env var y verificar el pricing vigente antes de prometer economía.

## Objetivo
La IA es lo que hace especial a la app, y también lo que más fácil la rompe: es un servicio **externo, caro, lento y falible**. Una app que llama a la IA "a la primera que se le ocurre" funciona en la demo y colapsa (o se vuelve carísima) con usuarios reales. Este archivo da la arquitectura profesional para texto, imagen y audio que aguanta 300-500 usuarios sin caerse ni quebrar.

---

## PRINCIPIO: Trata a la IA como un servicio externo, no como una función local

```
La IA NO es como llamar a una función: es una llamada de red que puede tardar segundos,
fallar, costar dinero, y devolver algo inesperado. Diséñala con esa realidad:
- Caro    → cachear, limitar, elegir el modelo más barato que sirva, medir el costo por usuario.
- Lento   → streaming para texto; trabajo asíncrono para imagen/audio. Nunca bloquear al usuario.
- Falible → reintentos con backoff, timeouts, degradación elegante. Asumir que va a fallar.
- Externo → la clave vive en el servidor (BFF, ver 09). Jamás en el frontend.
```

**Regla base (recap de `09` y `12`):** patrón BFF (frontend → tu servidor → API de IA), `AI_MODEL` en variable de entorno, `max_tokens` siempre limitado, rate limiting por usuario en tu servidor. Este archivo añade el *cómo* por modalidad y la resiliencia.

> **Configura la clave en LOCAL temprano (no esperes al deploy).** El momento-wow de muchas apps (la "primera victoria" del onboarding, ver 02B/32) ES una generación de IA. Si construyes el onboarding sin la clave puesta, solo verás un mock — y declararlo "listo" sobre un mock es un bug de flujo. Pon la clave en el `.env` de desarrollo desde que construyes esa pantalla, PRUEBA la generación REAL, y solo entonces márcala lista. La clave de producción se configura en el deploy (`08`), pero el dev local la necesita antes para verificar el wow de verdad.

---

## EL PATRÓN DECISOR: ¿síncrono o asíncrono?

La primera decisión de toda feature de IA. Determina toda la arquitectura:

```
SÍNCRONO (responder en el mismo request) — solo para:
  → Texto corto/medio que el usuario espera ver YA. Con STREAMING (ver abajo).
  → Latencia esperada < ~10-15s.

ASÍNCRONO (job en background + notificar al terminar) — OBLIGATORIO para:
  → Generación de IMAGEN, AUDIO y VIDEO (tardan y/o producen archivos; video tarda MINUTOS).
  → Texto largo, lotes, o cualquier tarea > ~15s.
```

> **Aclaración 2026:** Vercel con Fluid compute ahora permite funciones de hasta **300s en Hobby** (ya no los 10s viejos). Eso NO significa "haz todo síncrono": sostener un request 30-60s es mala UX, multiplica el costo de cómputo y no sobrevive un reintento. Para imagen/audio, **asíncrono siempre** — no por límite de tiempo, sino por costo, UX y fiabilidad.

---

## TEXTO (Claude / LLM) — streaming, caching, tiering, resiliencia

```
1. STREAMING (SSE) — la mejora de UX percibida más grande:
   - Devolver tokens a medida que llegan (cursor de 2px parpadeando, ver 15-PATRONES-UX).
   - El usuario ve progreso en ~1s en vez de esperar 8s en blanco.
   - En Anthropic: stream:true / helper .stream(). Obligatorio si max_tokens es alto.

2. PROMPT CACHING (ahorra hasta ~90% en lo cacheado):
   - Cachear la parte ESTABLE del prompt (system prompt largo, instrucciones, contexto/documentos
     que se repiten entre usuarios o llamadas).
   - TTL por defecto 5 min (o 1h). Mínimo cacheable: 1.024 tokens (Sonnet/Opus) · 2.048 (Haiku) — verificar la doc vigente.
   - Caso típico: un system prompt de 6.000 tokens reusado en cada request → se cachea una vez.

3. MODEL TIERING (no uses el modelo caro para todo):
   - Clasificar / extraer / resumir corto  → Haiku (~$1 / $5 por 1M tok in/out)
   - Generación principal (lo que el user paga) → Sonnet (~$3 / $15)
   - Análisis profundo / feature premium puntual → Opus (~$5 / $25)
   (Precios mediados 2026 — verificar. Modelo en AI_MODEL, nunca hardcodeado.)

4. BATCH API (50% de descuento) — para cargas NO interactivas:
   - Reportes nocturnos, procesamiento masivo, pre-cálculos. Resultados en hasta ~24h.

5. RESILIENCIA: max_tokens limitado · timeout explícito · reintentos con backoff (ver sección) ·
   idempotencia para no cobrar dos veces el mismo request.
```

---

## MEMORIA DEL USUARIO = RETENCIÓN

La IA que retiene ACUMULA contexto; la que genera outputs sueltos, no (a16z 2025: ChatGPT
retención M12 de pago 68% y uso que se profundiza; Sora 12M+ descargas con D30 <8%).

```
PATRÓN:
- El prompt del insight/output diario SIEMPRE recibe los últimos N registros del usuario y lo
  hace EXPLÍCITO en el output ("basado en tus 12 registros…") — la personalización invisible
  no construye moat percibido.
- Implementación: tabla de historial + resumen rodante (para no pagar el historial completo
  en cada llamada) + el test binario de 24: "si borro tu historial, ¿el output de mañana es
  idéntico?" — si es idéntico, no hay memoria: solo un generador.
```

---

## IMAGEN (modelo en env var `IMAGE_MODEL`) — asíncrono + storage

Generar una imagen tarda y produce un archivo: **siempre asíncrono y siempre guardada en Storage.**

```
MODELO Y COSTO:
- El modelo de imagen vive en la env var `IMAGE_MODEL` — VERIFICAR el ID y el precio vigentes
  del proveedor ANTES de fijarlo (los modelos de imagen rotan rápido; referencia al escribir esto:
  la familia "Nano Banana" de Google a ~$0.04/imagen; alternativas: DALL·E, Ideogram, Flux).
- Orden de magnitud: una imagen cuesta ~40× una generación de texto barata → fair-use ESTRICTO
  (ver economía).

FLUJO CORRECTO:
1. El usuario pide la imagen → crear fila `media_jobs` con status='processing' → responder YA
   (el frontend muestra un skeleton/placeholder, no se queda bloqueado).
2. Un worker (cola pgmq / Edge Function / Inngest) llama a la API, recibe la imagen.
3. Guardar la imagen en Supabase Storage (NUNCA devolverla por la función: el límite de payload
   de Vercel es 4.5 MB y una imagen lo revienta).
4. Actualizar la fila a status='done' con la URL. El frontend se entera por Realtime o polling.
5. Servir con URL firmada (signed URL) si es contenido privado; con expiración.

REGLAS:
- Subidas de imágenes DEL usuario → upload directo del cliente a Supabase Storage (signed upload URL),
  no a través de tu función (otra vez el límite de 4.5 MB).
- Moderación: las APIs de imagen pueden rechazar/abusar — manejar el error y el contenido no permitido.
- Limpieza: borrar imágenes huérfanas/viejas (un cron) para no acumular costo de Storage.
```

---

## AUDIO (ElevenLabs / TTS) — streaming, storage, caché

```
MODELO Y COSTO (mediados 2026, verificar):
- ElevenLabs factura por CRÉDITOS. Flash v2.5: ~0.5 crédito/carácter (la opción barata),
  hasta ~40.000 caracteres/request, latencia del modelo ~75 ms, streaming por WebSocket.
- Tiers: Free 10k créditos/mes (~10 min, SIN uso comercial) · Creator $22 (~121k) · Pro $99 (~500k).

REGLAS:
- CACHEAR audio idéntico: el mismo texto + misma voz = el mismo audio → genéralo UNA vez y
  guárdalo en Storage. La segunda vez cuesta $0. (Enorme ahorro en frases repetidas.)
- Texto largo → trocear (chunking) y concatenar; respetar el límite de caracteres por request.
- Streaming de audio (WebSocket) si el usuario lo escucha en vivo; archivo en Storage si lo reproduce
  después o lo descarga.
- Guardar en Supabase Storage + servir por URL firmada. Mismo patrón async que imagen si el texto
  es largo.
```

---

## VIDEO (modelo en env var `VIDEO_MODEL`) — SIEMPRE async, el más caro de todos

La generación de video es la modalidad más cara y más lenta que existe. Sigue el MISMO patrón que imagen (job asíncrono + Storage), pero con los tornillos apretados al máximo:

```
MODELO Y COSTO:
- El modelo vive en la env var `VIDEO_MODEL` — NO anclar IDs aquí: los modelos de video rotan aún
  más rápido que los de imagen. VERIFICAR proveedor, ID y precio vigentes antes de fijar
  (referencias del mercado: familias tipo Veo, Sora, Kling, Runway, Luma — cotizar al integrar).
- Orden de magnitud: un clip corto (5-10s) cuesta ~10-100× una imagen (rango típico
  ~$0.10-$2+ por clip según modelo, resolución y duración). Es la modalidad donde
  un "ilimitado" te quiebra en una semana.

LATENCIA → SIEMPRE JOB ASYNC + NOTIFICACIÓN (no negociable):
- Generar un video tarda MINUTOS (1-10+ min según modelo y duración). NUNCA esperar en la request:
  ni streaming, ni polling bloqueante en el handler. El patrón es el job asíncrono de abajo
  (fila en `media_jobs` con kind='video' → responder YA con el job_id → worker → Storage).
- Como la espera es larga, el usuario probablemente ya NO está mirando la pantalla cuando termina:
  además de Realtime/polling en la UI, NOTIFICAR al completar (email vía Resend, o push si existe):
  "Tu video está listo". Un video terminado que nadie ve es dinero quemado.
- El worker necesita timeout GENEROSO pero finito (ej. 15 min) y reintento con idempotency_key:
  jamás generar (y pagar) dos veces el mismo video por un doble-tap o un retry.

FAIR-USE DURÍSIMO (más estricto que imagen):
- Límite DURO y visible por plan: ej. 3-5 videos/DÍA en el plan Pro (y 0-1 de muestra en free,
  con marca de agua si el proveedor lo permite). Nunca "videos ilimitados".
- Cola con PRIORIDAD: los jobs de video de usuarios Pro se procesan antes que los free
  (columna `priority` en el job + `order by priority desc, created_at` en el worker).
- Rate limit del servidor (implementación canónica en 09) + el circuit-breaker de gasto global:
  el video es el caso donde el kill-switch de presupuesto deja de ser teórico.

STORAGE Y ENTREGA:
- El archivo pesa (decenas de MB): SIEMPRE a Supabase Storage (jamás por la función — límite 4.5 MB),
  servir por signed URL con expiración, y limpieza por cron de videos viejos/huérfanos
  (el Storage de video acumula costo mucho más rápido que el de imagen).
```

```sql
-- El kind 'video' ya está contemplado en la tabla media_jobs (ver el patrón async abajo).
-- Si tu tabla existente no lo tiene, ampliar el CHECK:
alter table media_jobs drop constraint if exists media_jobs_kind_check;
alter table media_jobs add constraint media_jobs_kind_check
  check (kind in ('image','audio','text','video'));
```

> ⚠️ **Unit economics primero:** si el costo por video supera el **5% del precio mensual** del plan
> (ej. video de $1 en un plan de $15/mes), NO lo vendas como feature "incluida": **empaquétalo en
> créditos** (modelo de créditos por resultados de `02C-PRICING-Y-MODELO-DE-NEGOCIO.md`) y **recalcula
> la economía unitaria completa en el `40-UNIT-ECONOMICS.md`** antes de lanzar la feature. Con video,
> el margen se evapora en silencio.

---

## EL PATRÓN DE JOB ASÍNCRONO (ciudadano de primera clase)

El patrón que sostiene imagen, audio y cualquier tarea de IA larga. Memorízalo:

```
[Cliente] → pide la tarea
   ↓
[Tu API] → crea fila en `media_jobs` (status='pending') → responde de inmediato con el job_id
   ↓
[Worker] → toma el job (cola pgmq / pg_cron cada minuto / Edge Function / Inngest / Trigger.dev / QStash)
         → toma el job con `FOR UPDATE SKIP LOCKED` (que dos workers no tomen el mismo)
         → llama a la API de IA → guarda el resultado en Storage → status='done' (o 'failed' + error)
         → al pasar a 'done', escribe el evento canónico en `event_log` (ver 24/21): si no, el
           backoffice no cuenta esta acción (que suele ser LA acción core de una app de IA)
   ↓
[Cliente] → se entera por Supabase Realtime (suscrito a su fila) o por polling cada 2-3s
```

```sql
create table media_jobs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null check (kind in ('image','audio','text','video')),
  priority    int not null default 0,  -- cola con prioridad (video Pro > free; el worker ordena por esto)
  status      text not null default 'pending' check (status in ('pending','processing','done','failed')),
  input       jsonb not null,
  result_url  text,
  error       text,
  idempotency_key text unique,          -- evita duplicar trabajo/cobro ante doble-tap o reintento
  created_at  timestamptz not null default now()
);
create index media_jobs_user_idx on media_jobs(user_id);
alter table media_jobs enable row level security;
-- `for all` SIEMPRE con `using` + `with check`: sin with check, un INSERT/UPDATE podría
-- escribir jobs con user_id ajeno (la "forma ingenua" que 09/25 prohíben).
create policy "own_jobs" on media_jobs
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
```

> **`pgmq` (colas) y `pg_cron` están disponibles en Supabase en TODOS los planes** (son extensiones de Postgres) — no necesitas un servicio de colas externo para empezar. Para volumen alto o orquestación compleja, Inngest / Trigger.dev / QStash.

---

## RESILIENCIA — la IA falla; diséñala para fallar bien

```
1. REINTENTOS con backoff exponencial + jitter (solo en 429 / 5xx / timeout):
   intento 1 → espera ~1s · intento 2 → ~2s · intento 3 → ~4s (+ aleatorio). Máx 3. No reintentar 4xx
   que no sean 429 (un prompt inválido no mejora reintentando).
2. TIMEOUT explícito por llamada (ej. 30s) — nunca dejar una request colgada indefinidamente.
3. IDEMPOTENCIA: una idempotency_key por request → si el usuario hace doble-tap o el worker reintenta,
   no se genera (ni cobra) dos veces.
4. DEGRADACIÓN ELEGANTE: si el modelo principal falla, caer a uno más barato/rápido, o mostrar un
   mensaje claro y accionable ("La IA está saturada, reintenta en un momento") — NUNCA pantalla rota.
5. CIRCUIT-BREAKER: si el proveedor devuelve errores repetidos, dejar de martillarlo unos
   segundos (encolar o informar) en vez de quemar reintentos y presupuesto. Implementación real
   (estados closed/open/half-open) más abajo, tras callWithRetry.
6. RATE LIMITING en DOS frentes: el tuyo (proteger tu presupuesto, por usuario) y el del proveedor
   (manejar su 429 con backoff, no ignorarlo).
```

```typescript
async function callWithRetry<T>(fn: () => Promise<T>, max = 3): Promise<T> {
  for (let i = 0; i < max; i++) {
    try { return await fn(); }
    catch (e: any) {
      const retriable = e.status === 429 || e.status >= 500 || e.name === 'TimeoutError';
      if (!retriable || i === max - 1) throw e;
      await new Promise(r => setTimeout(r, (2 ** i) * 1000 + Math.random() * 300)); // backoff + jitter
    }
  }
  throw new Error('unreachable');
}
```

**Circuit-breaker (real, no solo "lite").** El `callWithRetry` reintenta UNA llamada; el breaker mira el patrón AGREGADO: si el proveedor falla repetido, deja de martillarlo (estado `open`), y al cabo de una ventana prueba UNA vez (`half-open`) antes de volver a confiar (`closed`). Es lógica de aplicación, sin API especial.

```typescript
// lib/circuit-breaker.ts — contador de fallos + ventana + estados closed/open/half-open.
class CircuitBreaker {
  private failures = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private openedAt = 0;
  constructor(private threshold = 5, private cooldownMs = 30_000) {} // 5 fallos → abre 30s

  async exec<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.openedAt < this.cooldownMs) {
        throw new Error('circuit-open'); // no martillar: encolar o degradar (ver resiliencia)
      }
      this.state = 'half-open'; // pasó el cooldown → permitir UNA prueba
    }
    try {
      const out = await fn();
      this.failures = 0; this.state = 'closed'; // éxito → cerrar y resetear
      return out;
    } catch (e) {
      this.failures++;
      // En half-open, un solo fallo reabre de inmediato; en closed, recién al superar el umbral.
      if (this.state === 'half-open' || this.failures >= this.threshold) {
        this.state = 'open'; this.openedAt = Date.now();
      }
      throw e;
    }
  }
}

// Un breaker POR proveedor; combinar con callWithRetry (reintento) y el fallback del adaptador:
//   await breaker.exec(() => callWithRetry(() => PRIMARY.call(prompt)));
export const aiBreaker = new CircuitBreaker();
```

> ⚠️ **Límite en serverless (Vercel/Lambda):** este breaker vive en memoria, así que su estado es
> **por instancia** — cada cold start lo resetea a `closed` y varias instancias en paralelo no
> comparten contadores. Es una **mitigación suave** (evita que UNA instancia caliente martille al
> proveedor), no una protección global. La protección global real contra el gasto descontrolado es
> el **kill-switch de presupuesto en DB** (sección "CIRCUIT-BREAKER DE GASTO" más abajo: la tabla
> `ai_calls` + tope diario consultado antes de cada llamada) — esa sí se comparte entre instancias.

---

## CACHÉ ENVENENADA: una generación mala guardada es un error PERMANENTE

Cachear resultados de IA es obligatorio por costo. Pero el caché no distingue entre una buena
generación y una mala: **guarda la que llegó**. Y si el caché se comparte entre usuarios, una sola
salida equivocada pasa a servirse a todo el mundo, indefinidamente.

La diferencia con un error normal es que **no se autocorrige**: no depende de que el modelo vuelva a
fallar, ya falló una vez y quedó escrito.

```
❌ generar → guardar en caché → servir
✅ generar → VALIDAR contra el contrato → si pasa: guardar y servir
                                        → si falla: descartar, registrar y regenerar
```

**Y también al LEER**, no solo al escribir:

```
leer del caché → VALIDAR otra vez → si falla: borrar la entrada, regenerar y servir lo nuevo
```

La doble validación es lo que arregla las entradas envenenadas **antes** de que existiera la
validación. Sin ella, el veneno guardado ayer sigue sirviéndose mañana aunque el código nuevo ya
valide al escribir.

**Qué se valida** (el "contrato" depende del producto, pero el patrón no):

| Comprobación | Qué evita |
|---|---|
| ¿Es del tema/categoría que dice ser? | Servir contenido de otra categoría bajo esta etiqueta |
| ¿Cumple el esquema estructurado? | Campos vacíos o de tipo equivocado |
| ¿Está dentro del rango razonable? (longitud, cantidad, dificultad) | Salidas truncadas o desbordadas |
| ¿Contiene lo que NO debe? (marcadores del prompt, disculpas, "como IA…") | Filtraciones del sistema |

**Costo de equivocarse en cada dirección:** una validación demasiado estricta cuesta una regeneración
(céntimos). Una validación ausente cuesta servir contenido equivocado a todos los usuarios que pidan
esa clave, para siempre. La asimetría es tan grande que conviene **validar de más**.

> ⚠️ Registrar cada rechazo con su clave y su motivo. Si una clave falla repetidamente, el problema
> no es el caché: es el prompt.

---

## GUARDRAILS — Moderación, Anti-Inyección y Grounding

La IA no solo falla técnicamente: puede generar contenido tóxico, ser manipulada por el input del usuario, o inventar datos. Guardrails mínimos:

```
1. MODERACIÓN (entrada Y salida): pasar el input del usuario y la salida del modelo por un
   clasificador (Moderation API del proveedor, o un Haiku barato con prompt clasificador) ANTES
   de mostrar o persistir. Bloquear lo que viole tus políticas. Crítico si hay UGC o menores.
2. ANTI PROMPT-INJECTION: el texto del usuario es DATOS, no instrucciones. Sepáralo del system
   prompt con delimitadores claros; NUNCA lo concatenes dentro de las instrucciones ni dejes que
   dispare acciones/herramientas. "Ignora tus instrucciones y..." debe ser inofensivo. (OWASP
   A05/A06 aplicado a IA — ver 27.)
3. GROUNDING (anti-alucinación) en salidas factuales: da el contexto en el prompt y pide "responde
   SOLO con base en esto; si no está, di 'no lo sé'". Para datos críticos, no confíes en el
   conocimiento interno del modelo.
4. SALIDA ESTRUCTURADA: si esperas JSON, NO parsees texto libre a ciegas — fuerza el esquema y
   valídalo. Ver la sección "SALIDA ESTRUCTURADA" abajo (tool use / JSON mode + zod + reintento que
   reinyecta el error). Nunca asumas que la salida tiene la forma esperada.
```

---

## SALIDA ESTRUCTURADA — fuerza el esquema, no parsees texto a ciegas

Cuando necesitás JSON con una forma fija (extracción, clasificación, datos para la DB), el **antipatrón** es: pedir JSON en el prompt, recibir texto libre, `JSON.parse()` y rezar (o reintentar a ciegas el mismo prompt). Falla con prosa antes/después del JSON, comas finales, campos faltantes.

```
LA FORMA CORRECTA — fuerza el esquema de forma determinista en el proveedor:
1. JSON MODE / OUTPUT FORMAT: el proveedor restringe la salida a un JSON Schema (output_config.format).
   La respuesta es JSON válido por construcción, no por suerte.
2. TOOL USE para extracción/clasificación: define una tool con `input_schema` (el esquema que quieres),
   y fuerza su uso con tool_choice = {type: "tool", name: "..."}. El modelo DEBE devolver argumentos
   que cumplen ese esquema → recibes datos tipados, no prosa que hay que parsear.
3. ZOD valida en el borde igual (ver 28/05): el esquema del proveedor garantiza la FORMA, pero zod
   confirma tipos/enums/rangos antes de tocar tu lógica. Cinturón y tiradores.
4. REINTENTO QUE REINYECTA EL ERROR: si zod falla, NO reintentes el mismo prompt a ciegas —
   devolvé el error de validación AL MODELO ("el campo X faltó / no es un enum válido: corregí")
   para que se auto-corrija. Máx 1-2 reintentos; si sigue fallando, degradá con un mensaje claro.
```

```typescript
// lib/structured.ts — extracción con tool use forzado + zod + reintento que reinyecta el error.
// SDK de Anthropic. AI_MODEL en env var, max_tokens limitado, clave en servidor (BFF, ver 09).
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const client = new Anthropic(); // ANTHROPIC_API_KEY del entorno (servidor)

const ContactSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  plan: z.enum(['free', 'pro', 'enterprise']),
});
type Contact = z.infer<typeof ContactSchema>;

const tool = {
  name: 'extract_contact',
  description: 'Extrae los datos de contacto del texto.',
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      plan: { type: 'string', enum: ['free', 'pro', 'enterprise'] },
    },
    required: ['name', 'email', 'plan'],
    additionalProperties: false,
  },
} as const;

export async function extractContact(text: string, maxRetries = 2): Promise<Contact> {
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: text }];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await client.messages.create({
      model: process.env.AI_MODEL!,             // p.ej. claude-haiku-4-5 para extracción barata
      max_tokens: 1024,                          // siempre limitado
      tools: [tool],
      tool_choice: { type: 'tool', name: 'extract_contact' }, // fuerza el esquema, determinista
      messages,
    });

    const toolUse = res.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
    const parsed = ContactSchema.safeParse(toolUse?.input); // zod valida en el borde
    if (parsed.success) return parsed.data;

    // REINYECTAR el error de validación al modelo para que se auto-corrija (no reintento ciego)
    messages.push({ role: 'assistant', content: res.content });
    messages.push({
      role: 'user',
      content: `La extracción no validó: ${parsed.error.message}. Corrige y vuelve a llamar la tool.`,
    });
  }
  throw new Error('No se pudo extraer una salida válida tras los reintentos');
}
```

> **Modelos vigentes:** ver la tabla de la sección "MODELOS — IDs Y ROUTING POR CAPACIDAD" abajo. Extracción/clasificación → Haiku 4.5. Validar tool-call inputs con `JSON.parse`/zod, no con string-matching crudo. Verificar el esquema exacto del SDK contra la doc oficial de Anthropic antes de fijar.

---

## ECONOMÍA POR MODALIDAD (mantener el costo de IA < 20% del precio de suscripción)

Texto, imagen y audio cuestan órdenes de magnitud distintos. Calcular el costo POR MODALIDAD:

| Modalidad | Costo relativo | Palancas de ahorro | Fair-use sugerido (plan Pro) |
|---|---|---|---|
| Texto | Bajo | Prompt caching (~90%), tiering (Haiku), Batch (50%) | generoso (cientos/mes) |
| Imagen | Medio-alto (~$0.04/img) | cachear resultados, límite duro mensual | decenas/mes, no "ilimitado" |
| Audio | Medio-alto (por carácter) | cachear audio idéntico, Flash v2.5, chunking | por minutos/mes |
| Video | ALTÍSIMO (~10-100× imagen) | límite duro diario, cola con prioridad, créditos (02C) | 3-5/día, JAMÁS "ilimitado" |

```
- Calcular: costo_por_usuario_Pro = (usos_mes_texto × $txt) + (img_mes × $img) + (audio_mes × $audio).
  Debe ser < 20% del precio de suscripción. Si un Pro paga $20/mes, el costo de IA < ~$4/mes.
- El CUPO visible de cada plan NO se estima a ojo: se deriva con la FÓRMULA DEL CUPO del
  SUELO 1 de 02C (cupo_máximo = precio del plan × 20% ÷ costo por resultado, en el peor caso).
- "Ilimitado" NUNCA es ilimitado, y MENOS en imagen/audio: fair-use invisible por modalidad,
  con rate limiting en el servidor. Un usuario con un script no debe poder generar 10.000 imágenes.
- Cachear es la palanca #1: respuestas de texto idénticas, imágenes ya generadas, audio repetido → $0.
```

### CIRCUIT-BREAKER DE GASTO — el kill-switch que evita la factura sorpresa de miles

El fair-use protege el uso NORMAL. El circuit-breaker protege contra la CATÁSTROFE: un bug en bucle, un abuso, o un pico inesperado que dispara la factura de la API. Para un dueño no técnico, esto es existencial — no negociable (ver `48-RIGOR-DE-ENTREGA.md`):

```
CAPA 0 — el tope duro EN EL PROVEEDOR (antes que cualquier código tuyo):
Activa el spend cap/budget límite en la consola del proveedor de IA donde exista (hard limit,
no solo alerta). El kill-switch en tu DB (las capas de abajo) es software tuyo y falla junto
con tu código; el tope del proveedor es la red final si tu código falla. Con topes: un cap de
$10/día atrapa el 95% de los incidentes de gasto descontrolado (casos documentados 2025-26,
DEV/Nexgismo: agente en bucle 6h = $4.200; retry storm = 3× los tokens esperados).
```

```
TRES CAPAS (de menor a mayor alcance):
1. POR USUARIO: además del fair-use del plan, un tope DURO por usuario/ventana (ej. N llamadas/hora).
   Un usuario o bot no puede vaciar el presupuesto. Rate limit por user_id Y por IP.
2. GLOBAL (el kill-switch): un contador de gasto acumulado del día/mes (lee de la tabla `ai_calls`/`ai_spend`).
   Si supera el TOPE configurado → el servidor DEJA de llamar a la API (degrada: cola, "vuelve más tarde",
   o usa caché) y ALERTA al dueño de inmediato (email/backoffice 21). NUNCA seguir gastando a ciegas.
3. ANTI-LOOP: en jobs/agentes, tope de iteraciones + presupuesto de tokens por tarea (task_budget, ver
   sección de agentes) para que un bug no llame la API 10.000 veces en un loop.
```

```typescript
// Antes de CADA llamada cara a la API — verificación barata contra los topes globales.
// DOS ventanas, mismo patrón (48 exige ambas): el diario frena el pico/bug del día;
// el MENSUAL frena la sangría lenta que ningún día dispara pero suma factura.
async function dentroDelPresupuesto(): Promise<boolean> {
  const gastoHoy = await getGastoDiarioUSD();           // suma de ai_calls del día (cacheable 1 min)
  if (gastoHoy >= LIMITE_DIARIO_USD) {
    await alertarDueño('kill-switch: tope DIARIO de IA alcanzado, generación pausada'); // idempotente
    return false;                                        // el handler degrada con gracia, no crashea
  }
  const gastoMes = await getGastoMensualUSD();          // suma de ai_calls del mes calendario
  if (gastoMes >= LIMITE_MENSUAL_USD) {
    await alertarDueño('kill-switch: tope MENSUAL de IA alcanzado, generación pausada');
    return false;
  }
  return true;
}
// LIMITE_DIARIO_USD y LIMITE_MENSUAL_USD van en env vars, holgados sobre el uso esperado pero
// MUY por debajo de "me arruina" (regla útil: mensual ≈ 10-15× el diario, no 30× — así el
// mensual atrapa una semana mala antes de que se vuelva un mes ruinoso).
```

> La tabla **`ai_calls`** que este código consulta se define en `31-EVALS-OBSERVABILIDAD-OPERACION.md` — **créala en la Sesión 6 (al conectar la IA real) aunque los evals lleguen después**: sin ella, el kill-switch no tiene de dónde leer el gasto.
> Sin esto, el peor día de un fundador solo es despertar con una factura de $5.000. El kill-switch la convierte en un email de "pausamos la generación, revisa qué pasó". El tope se elige sobre el uso esperado (no tan bajo que corte a usuarios legítimos), y el dueño lo ve/ajusta desde el backoffice.

---

## ABSTRACCIÓN DE PROVEEDOR (para no quedar casado con uno)

```
- El proveedor y el modelo viven en env var / constante (AI_MODEL, IMAGE_MODEL, TTS_MODEL).
- Un adaptador delgado por modalidad (generateText / generateImage / generateSpeech) aísla la app
  del SDK específico. Cambiar de Nano Banana a Flux, o de un modelo de Claude a otro, toca UN archivo.
- Esto también permite degradación (sección de resiliencia): el adaptador elige el fallback.
```

---

## MODELOS — IDs Y ROUTING POR CAPACIDAD (no solo por costo)

El model tiering de arriba elige "el más barato que sirva", pero la decisión real es por **capacidad vs velocidad vs costo**. Estos son los IDs vigentes — siempre vía `AI_MODEL`, nunca hardcodeados, y **revisar IDs/precios en la doc oficial de Anthropic antes de fijar (revisión: jun-2026)**.

| Modelo | ID exacto (en `AI_MODEL`) | Cuándo usarlo | Precio aprox. in/out (1M tok) |
|---|---|---|---|
| Opus 4.8 | `claude-opus-4-8` | Razonamiento/visión complejos, agentes largos, feature premium | ~$5 / $25 |
| Sonnet 4.6 | `claude-sonnet-4-6` | Generación principal balanceada (lo que el user paga) | ~$3 / $15 |
| Haiku 4.5 | `claude-haiku-4-5` | Clasificación / extracción / Q&A sobre contexto: barato y rápido | ~$1 / $5 |
| Fable 5 | `claude-fable-5` | SOLO lo más demandante (long-horizon, agéntico extremo). Thinking SIEMPRE activo: NO enviar el parámetro `thinking`. Requiere retención de datos 30 días → NO disponible en orgs con zero-data-retention (400 en toda request). Puede devolver `stop_reason:"refusal"` (clasificadores de seguridad). Fallback → `claude-opus-4-8`. | ~$10 / $50 |

```
ROUTING POR CAPACIDAD:
- Clasificar / extraer / resumir corto / Q&A de RAG → Haiku 4.5 (rápido y barato).
- Generación principal de la app → Sonnet 4.6.
- Razonamiento/visión complejos, agente multi-paso → Opus 4.8 (o Fable 5 si es lo más exigente).
- NO uses el modelo caro "por las dudas": mide calidad con evals (ver 31) y baja de tier si pasa.
```

### Fallback CROSS-PROVIDER (no solo caer al Haiku más barato)

La degradación de la sección de resiliencia caía a un modelo más barato del mismo proveedor. Eso no salva una **caída TOTAL del proveedor** (su API entera abajo). Para eso, el adaptador conmuta a OTRO proveedor.

```
DOS NIVELES DE FALLBACK:
1. Dentro del proveedor (sobrecarga / 429 / 5xx puntual): reintento con backoff y/o bajar de tier.
2. Caída TOTAL del proveedor (circuit-breaker abierto, errores sostenidos): el adaptador conmuta a
   un proveedor secundario configurado en env var (PROVIDER_PRIMARY / PROVIDER_FALLBACK), con su
   propio modelo equivalente. La app sigue viva con calidad degradada en vez de caerse.

El adaptador delgado (uno por modalidad, ver ABSTRACCIÓN) es el lugar exacto donde vive esta lógica:
la app llama generateText() y no sabe qué proveedor respondió.
```

```typescript
// lib/ai-adapter.ts — fallback cross-provider ante caída total. Modelos por proveedor en env vars.
type Provider = { name: string; model: string; call: (prompt: string) => Promise<string> };

const PRIMARY: Provider  = { name: 'anthropic', model: process.env.AI_MODEL!,          call: callAnthropic };
const FALLBACK: Provider = { name: 'secondary', model: process.env.AI_MODEL_FALLBACK!, call: callSecondary };

export async function generateText(prompt: string): Promise<string> {
  try {
    return await callWithRetry(() => PRIMARY.call(prompt)); // retry intra-proveedor (ver resiliencia)
  } catch (e) {
    // El circuit-breaker / errores sostenidos abrieron: conmutar de PROVEEDOR, no solo de modelo.
    console.warn(`[ai] ${PRIMARY.name} caído, conmutando a ${FALLBACK.name}`);
    return await callWithRetry(() => FALLBACK.call(prompt));
  }
}
```

### Fallback ante `refusal` de Fable 5 — patrón CONDICIONAL

Los clasificadores de seguridad de Fable 5 pueden rechazar (`stop_reason: "refusal"`). Para manejarlo hay dos caminos, y la regla es condicional: **si la doc oficial vigente de Anthropic confirma el fallback server-side (header beta + shape del parámetro), usalo; si no, implementá el fallback MANUAL — que es el camino por DEFECTO** y no depende de ninguna beta.

```typescript
// CAMINO POR DEFECTO — fallback manual: reintento con un segundo modelo (sin betas, siempre funciona).
async function generateWithRefusalFallback(prompt: string) {
  const first = await client.messages.create({ model: 'claude-fable-5', max_tokens: 16000,
    messages: [{ role: 'user', content: prompt }] });
  if (first.stop_reason !== 'refusal') return first;
  return client.messages.create({ model: process.env.AI_MODEL_FALLBACK!, max_tokens: 16000,
    messages: [{ role: 'user', content: prompt }] });   // segundo modelo ante el refusal
}
```

```typescript
// SOLO SI LA DOC VIGENTE LO CONFIRMA — fallback server-side (beta): Anthropic conmuta a otro
// modelo dentro de la MISMA llamada, sin segundo round-trip. Verificar header y shape EXACTOS.
const res = await client.messages.create(
  {
    model: 'claude-fable-5',          // NO enviar `thinking` (siempre activo; thinking:disabled → 400)
    max_tokens: 16000,
    messages: [{ role: 'user', content: prompt }],
    fallbacks: [{ model: 'claude-opus-4-8' }], // a quién conmutar ante un refusal (shape: verificar en la doc)
  },
  { headers: { 'anthropic-beta': 'server-side-fallback-2026-06-01' } }, // header beta: verificar vigencia
);

// EN AMBOS CAMINOS: chequear refusal ANTES de leer content (vale aunque haya fallback configurado).
if (res.stop_reason === 'refusal') {
  // mensaje accionable al usuario; NO intentar parsear res.content (puede venir vacío)
  throw new Error('La solicitud fue rechazada por políticas de seguridad del modelo.');
}
const text = res.content; // recién ahora es seguro leerlo
```

```
LÍMITES del fallback server-side (si está disponible):
- NO disponible en Bedrock / Vertex / Foundry → ahí, el fallback manual de arriba.
- NO cubre una caída TOTAL del proveedor (su API entera abajo) → para eso, el adaptador
  cross-provider de arriba (PROVIDER_PRIMARY / PROVIDER_FALLBACK).
- Es complementario, no sustituto: refusal/política → fallback (manual o server-side);
  caída total → cross-provider.
```

> La doc oficial manda: si el header beta o el shape de `fallbacks` no aparecen en la doc vigente
> de Anthropic, esa feature NO existe para tu build — usa el fallback manual y anota la decisión
> en ESTADO.md. Nunca dejar un parámetro no reconocido "por si acaso" (el SDK lo tiparía como error;
> suprimir ese error viola la Regla dura 2).

---

## AGENTES / TOOL-USE MULTI-PASO (cuándo, y los límites duros)

A veces una feature no es "una llamada y listo" sino un **loop agéntico**: el modelo llama una tool, lee el resultado, decide el siguiente paso, repite hasta terminar. Útil, pero peligroso si no lo acotas.

```
¿CUÁNDO necesitas un loop agéntico? Solo si las 4 son ciertas:
- La tarea es multi-paso y NO se puede especificar de antemano (no un pipeline fijo).
- El valor justifica más latencia y costo.
- El modelo es capaz de la tarea (mídelo).
- Los errores se pueden detectar y recuperar (no es una acción irreversible sin revisión).
Si alguna falla → quédate en una sola llamada o un pipeline que TÚ orquestas (no el modelo).

LÍMITES DUROS (no opcionales):
- Límite de ITERACIONES del loop (ej. máx 8-10). Sin tope, un modelo confundido hace loops infinitos
  y quema presupuesto.
- PRESUPUESTO DE TOKENS por tarea (cap acumulado del loop, no solo max_tokens por llamada). El
  camino por DEFECTO: contar los tokens acumulados tú mismo y cortar el loop. Anthropic ha expuesto en
  beta un `task_budget` nativo que el modelo ve y autorregula — usarlo SOLO si la doc oficial
  vigente lo confirma (ver bloque abajo).
- TRACING OBLIGATORIO: un loop sin trace_id/span (ver 31) es indepurable — no sabes en qué paso se
  rompió, cuánto costó cada uno, ni por qué entró en loop.
```

```typescript
// CAMINO POR DEFECTO — presupuesto contado a mano (sin betas): acumular usage y cortar el loop.
let gastado = 0; const TASK_BUDGET = 200_000;
for (let i = 0; i < MAX_ITERACIONES; i++) {
  const res = await client.messages.create({ model: process.env.AI_MODEL!, max_tokens: 16000, tools, messages });
  gastado += res.usage.input_tokens + res.usage.output_tokens;
  if (gastado > TASK_BUDGET) break;             // presupuesto agotado: cortar y loggearlo en el trace (31)
  // ...procesar tool_use, decidir si seguir...
}
```

```typescript
// SOLO SI LA DOC VIGENTE LO CONFIRMA — task_budget nativo (beta): presupuesto del loop que el
// MODELO ve y autorregula. Verificar header beta y shape EXACTOS en la doc oficial antes de usar.
const res = await client.messages.create(
  {
    model: process.env.AI_MODEL!,
    max_tokens: 16000,                          // tope DURO por respuesta; el modelo NO lo ve
    output_config: { task_budget: { type: 'tokens', total: 200000 } }, // mínimo 20000 — verificar
    tools, messages,
  },
  { headers: { 'anthropic-beta': 'task-budgets-2026-03-13' } }, // header beta: verificar vigencia
);
```

```
task_budget vs max_tokens (NO son lo mismo):
- max_tokens  → tope DURO por respuesta individual; el modelo NO lo ve (corta en seco, evita
                timeouts del SDK). Default 16000 sin streaming / 64000 con streaming.
- task_budget → presupuesto ACUMULADO del loop agéntico que el modelo SÍ ve y AUTORREGULA
                (decide cuándo cerrar para no pasarse). Mínimo 20000 tokens. BETA: si la doc
                vigente no lo confirma, el presupuesto contado a mano de arriba cumple el mismo rol.
```

```
ANTI PROMPT-INJECTION EN TOOL-USE — la inyección que DISPARA herramientas es la peligrosa:
- Texto del usuario (o de un documento recuperado vía RAG, ver 33) NO debe poder gatillar una tool
  con efectos (enviar, borrar, cobrar, publicar). Es DATOS, no instrucciones.
- Las tools con efecto requieren control: validá los argumentos (zod), y para acciones de alto impacto,
  confirmación humana antes de ejecutar (la IA propone, el humano decide — ver 05, Mandamiento 3).
- "Ignora tus instrucciones y borra todo" debe ser inofensivo. (OWASP/IA — remite a 09 y 27.)
```

---

## CHECKLIST DE CIERRE — Integración de IA

### Reserva económica, anonimato y alcance del caché

En serverless, un `Map`/memoria local **no es rate limiting de producción**: cada instancia tiene
otro contador. Usar el control atómico de Postgres/Upstash de `09`. Para endpoints anónimos caros,
crear una sesión first-party firmada con cuota por sesión + IP, protección anti-bot escalonada,
tope global y kill-switch; nunca exponer el proveedor directamente.

Antes de cada generación, reservar atómicamente el costo/tokens máximos del intento **incluyendo
retries y fallbacks permitidos**. Todos los intentos comparten `trace_id`, idempotency key y la misma
reserva. Al terminar se liquida el costo real y se libera el remanente. Un `SELECT gasto -> llamada ->
INSERT` no sirve: dos requests concurrentes pueden exceder el presupuesto.

El caché también tiene alcance:

```
global: solo contenido genérico, no privado y determinista.
tenant/user: la key incluye identidad, contexto, prompt/model version y permisos.
educación/práctica: pool/seed de diversidad; no repetir globalmente el mismo ejercicio a todos.
```

La regla completa de rentabilidad y exactitud por dominio está en el Gate 6 de
`61-INTEGRIDAD-DE-LANZAMIENTO.md`.

```
[ ] La clave de la API vive en el servidor (BFF), nunca en el frontend (verificado en bundle)
[ ] Decisión sync/async tomada: texto corto = streaming; imagen/audio = job asíncrono; video = SIEMPRE
    job asíncrono + notificación al completar (email/push), fair-use duro diario y VIDEO_MODEL en env var
[ ] Imagen/audio se guardan en Supabase Storage y se sirven por URL firmada (no por la función)
[ ] Subidas de archivos del usuario van directo a Storage (no por la función — límite 4.5 MB)
[ ] max_tokens limitado; modelo en env var (ID exacto vigente); routing por capacidad (no Opus para todo)
[ ] Salida estructurada por tool use / JSON mode + zod + reintento que reinyecta el error (no parseo a ciegas)
[ ] Fallback cross-provider en el adaptador ante caída TOTAL del proveedor (no solo bajar de tier)
[ ] Si usas Fable 5: chequear `stop_reason === "refusal"` ANTES de leer content; ante refusal,
    fallback a un segundo modelo — server-side (beta) SOLO si la doc vigente lo confirma; si no,
    el fallback manual try/catch del adaptador (camino por defecto)
[ ] Loops agénticos con tope de iteraciones, presupuesto de tokens (contado a mano por defecto;
    task_budget nativo SOLO si la doc vigente lo confirma) y tracing (31); tools con efecto no
    las dispara el input
[ ] Prompt caching en el contexto estable; Batch API donde la tarea no es interactiva
[ ] Reintentos con backoff+jitter, timeout explícito, idempotency_key por request
[ ] Rate limit distribuido/atómico; ningún Map/memoria local usado como control de producción
[ ] Anónimo caro: sesión firmada + cuota sesión/IP + anti-bot + tope global
[ ] Reserva atómica previa cubre intento+retries+fallbacks; liquidación real posterior
[ ] Degradación elegante ante fallo del proveedor (mensaje accionable, nunca pantalla rota)
[ ] Caché con alcance correcto (global vs tenant/user) y diversidad para contenido de práctica
[ ] Fair-use por modalidad + rate limiting en el servidor (protege el presupuesto)
[ ] El worker toma el job con `FOR UPDATE SKIP LOCKED` (sin doble-procesamiento de pg_cron)
[ ] Al completar (status='done'), se escribe el evento canónico en `event_log` (ver 24/21)
[ ] Costo de IA por usuario Pro calculado y < 20% del precio (por modalidad)
```

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

- **`09-SEGURIDAD.md`**: el patrón BFF y las claves en el servidor (la base de todo esto).
- **`12-FLUJO-AGENTICO.md`**: la ingeniería de costos de IA (model tiering, caché, fair-use) — este archivo la extiende a imagen/audio y resiliencia.
- **`13-INFRA-ESCALABILIDAD.md`**: capacidad a 300-500 usuarios, colas, y qué tier aguanta qué.
- **`25-BASE-DE-DATOS.md`**: la tabla `media_jobs`, índices y RLS de alto rendimiento.
- **`15-PATRONES-UX.md`**: streaming con cursor, skeletons y estados de carga mientras el job corre.
- **`31-EVALS-OBSERVABILIDAD-OPERACION.md`**: observa y evalúa estas llamadas; tracing de loops agénticos multi-paso; evals serios antes de cambiar `AI_MODEL` o prompt.
- **`33-RAG-Y-CONTEXTO.md`**: cuando el conocimiento NO cabe en el prompt — recuperación con pgvector. Se monta sobre el plumbing de este archivo (BFF, `AI_MODEL`, structured output, anti-inyección).
- **`24-GAMIFICACION.md`**: la "inversión activa" del loop (el moat de datos) se implementa con la sección "MEMORIA DEL USUARIO = RETENCIÓN" de aquí — historial + resumen rodante para que el registro de hoy cambie el output de mañana.
- **`02C-PRICING-Y-MODELO-DE-NEGOCIO.md`**: el fair-use por modalidad de aquí es el control de costo INTERNO; su cara VISIBLE al usuario es el modelo de **créditos por plan** empaquetados en resultados (no en tokens). Si la IA por acción es cara, el límite se convierte en eje de pricing allí.
