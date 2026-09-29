# SEGURIDAD TÉCNICA

> **Cuándo cargar este archivo:**
> - Antes de desplegar a producción (obligatorio)
> - Al auditar una app existente que ya está en producción
> - Si la app maneja datos de usuario, pagos, o APIs de pago

## Objetivo
Cubrir las vulnerabilidades técnicas que pueden destruir una web app que "funciona bien": API keys expuestas, endpoints sin autorizar, XSS/CSRF/SSRF, uploads inseguros, RLS ausente. Este archivo NO es opcional. El pilar LEGAL/PRIVACIDAD (páginas legales, LGPD/LATAM, consentimiento, transferencia internacional a la IA) vive completo en `47-LEGAL-FISCAL-Y-PRIVACIDAD.md`.

---

## SEGURIDAD FRONTEND

### Protocolo Cero Secretos en Chat y Herramientas

La clave puede estar bien protegida en el código y filtrarse durante el deploy por conversación, captura,
comando, log o historial. Por eso la seguridad cubre también cómo colaboran el agente y el dueño:

```text
EL AGENTE PUEDE PEDIR: nombre de variable · proveedor · entorno · estado configurada/falta
EL AGENTE NO PUEDE PEDIR: valor · token · password · cookie · HOTTOK · connection string · .env
```

- El dueño introduce secretos directamente en el dashboard oficial o prompt interactivo; responde solo
  `configurada`. El agente confirma presencia y funcionamiento sin leer ni repetir el valor.
- OAuth/conectores y permisos mínimos antes que PATs. Nunca tokens incrustados en URLs o argumentos.
- No imprimir `.env*`, `env`, headers, cookies, payloads o logs completos; redactar antes de compartir.
- No pedir screenshots de pantallas con valores visibles. Explicar primero cómo ocultarlos.
- `.env.example` usa valores ficticios; `.env`, `.env.*`, `.vercel/`, dumps y credenciales se ignoran.
- Si un secreto aparece, tratarlo como comprometido: detener, revocar/rotar, buscarlo en Git/logs/artefactos,
  redeployar y probar que el anterior dejó de funcionar. Borrarlo del último archivo no limpia el historial.

La clasificación y el procedimiento completos viven en `62-PUBLICACION-SEGURA-Y-CONTINUA.md`.

### El Problema #1: API Keys Expuestas

**Realidad brutal**: Las variables de entorno en React (VITE_*, NEXT_PUBLIC_*, REACT_APP_*) NO SON SEGURAS. Se incrustan en el bundle de JavaScript y cualquier persona puede extraerlas abriendo DevTools → Sources.

**Una gran proporción de apps frontend filtra credenciales** (informes anuales de GitGuardian). Esto incluye claves de OpenAI, Anthropic, Stripe, Supabase, y cualquier API de pago.

### Patrón Correcto: Backend for Frontend (BFF)

NUNCA llamar a APIs con claves sensibles directamente desde el frontend. Siempre pasar por un servidor intermedio.

> Este es el patrón de SEGURIDAD del BFF. La arquitectura completa de integración de IA (texto/imagen/audio, streaming, colas async, resiliencia y costo) está en `30-INTEGRACION-IA.md`.

```
❌ INCORRECTO (la clave va en el browser):
Frontend → API de IA (con API key en el header)

✅ CORRECTO (la clave nunca sale del servidor):
Frontend → Tu servidor/función → API de IA (clave en el servidor)
```

**Implementación con Supabase Edge Functions:**
```typescript
// supabase/functions/generate/index.ts (SERVIDOR — la clave vive aquí)
const AI_MODEL = Deno.env.get('AI_MODEL') ?? '<modelo por defecto>'; // modelo en env var, NUNCA hardcodeado (ver 12-FLUJO-AGENTICO)

Deno.serve(async (req) => {
  const { input } = await req.json();
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY'), // Clave en el servidor
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: input }]
    })
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

```typescript
// Frontend — NUNCA ve la API key
async function generate(input: string) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    body: JSON.stringify({ input })
  });
  return res.json();
}
```

**Implementación con Vercel Serverless Functions:**
```typescript
// api/generate.ts (Vercel serverless — clave en el servidor)
export default async function handler(req, res) {
  const { input } = req.body;
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY, // Clave en env de Vercel
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL ?? '<modelo por defecto>', // modelo en env var, NUNCA hardcodeado (ver 12-FLUJO-AGENTICO)
      max_tokens: 1024,
      messages: [{ role: 'user', content: input }]
    })
  });

  const data = await response.json();
  res.status(200).json(data);
}
```

**Cuándo SÍ es aceptable una clave en el frontend:**
- Clave pública de Supabase (anon key) — diseñada para estar expuesta, protegida por Row Level Security
- Claves de Google Maps JS — restringidas por dominio
- Claves de analytics (Plausible, Vercel Analytics) — son solo de escritura

**Cuándo NUNCA:**
- API keys de IA (OpenAI, Anthropic, Google AI)
- Secret keys de Stripe
- Service role keys de Supabase
- Cualquier clave con permisos de lectura/escritura sobre datos o dinero

### Rate Limiting en el Servidor — IMPLEMENTACIÓN CANÓNICA

> Esta es la implementación de referencia del SO. Cuando `13-INFRA-ESCALABILIDAD.md`, `26-AUTH-MODERNO.md` o `30-INTEGRACION-IA.md` exigen "rate limiting", se refieren a ESTO — no reinventarlo por app.

**Regla de aplicación (no negociable): TODO endpoint BFF que llama a la IA y TODO endpoint de auth (login, registro, reset de contraseña, magic link) llevan rate limit.** Sin esto, un script puede quemar tu factura de IA o forzar credenciales por fuerza bruta.

```
Parámetros de partida (ajustar por app):
- IA / acción core:  free 5-10 req/min · pro 20-30 req/min · SIEMPRE por user_id (no por IP sola)
- Auth (pre-login):  5 intentos / 15 min por IP + por email — mensaje genérico, sin revelar cuál
- Respuesta al exceder: 429 + header Retry-After + mensaje amigable ("Demasiadas solicitudes,
  espera un momento"), nunca un error críptico.
- FAIL-CLOSED en endpoints que gastan dinero: si el chequeo de límite falla, NO llamar a la IA.
```

**Variante A — Sliding window atómico en Postgres/Supabase (para EMPEZAR: cero dependencias, cero servicios extra).** Una función SQL `security definer` hace insert + conteo en una sola transacción (atómico: sin race condition bajo concurrencia, a diferencia del "SELECT → comparar en JS → UPDATE").

```sql
-- Migración: rate limiting sliding window en la propia DB.
create schema if not exists private;

create table if not exists private.rate_limit_hits (
  key text not null,                        -- ej. 'generate:user:<uuid>' o 'login:ip:1.2.3.4'
  at  timestamptz not null default now()
);
create index if not exists rate_limit_hits_key_at_idx
  on private.rate_limit_hits (key, at desc);

-- security definer: escribe en private.* sin exponer la tabla. En public para poder llamarla por RPC.
create or replace function public.check_rate_limit(
  p_key text, p_max int, p_window_seconds int
) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_count int;
begin
  -- Limpieza oportunista (sin cron): borra hits viejos de ESTA key
  delete from private.rate_limit_hits
    where key = p_key and at < now() - make_interval(secs => p_window_seconds * 4);

  insert into private.rate_limit_hits (key) values (p_key);

  select count(*) into v_count from private.rate_limit_hits
    where key = p_key and at > now() - make_interval(secs => p_window_seconds);

  return v_count <= p_max;   -- true = dentro del límite
end $$;

-- CRÍTICO: solo el servidor (clave secret/service_role) puede llamarla. Si anon/authenticated
-- pudieran, un cliente malicioso inflaría el contador de otro usuario (DoS barato).
revoke execute on function public.check_rate_limit(text, int, int) from public, anon, authenticated;
```

```typescript
// lib/rate-limit.ts — SIEMPRE con el cliente admin del servidor (sb_secret_... / legacy service_role).
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,          // clave secreta: SOLO servidor, jamás NEXT_PUBLIC_
  { auth: { persistSession: false } }
);

export async function checkRateLimit(
  key: string, max: number, windowSeconds: number
): Promise<boolean> {
  const { data, error } = await admin.rpc('check_rate_limit', {
    p_key: key, p_max: max, p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error('[rate-limit]', error.message);
    return false;                            // FAIL-CLOSED: ante la duda, no gastar dinero
  }
  return data === true;
}
```

```typescript
// Uso en el route handler del BFF (es el paso 4 del orden canónico de abajo):
import { checkRateLimit } from '@/lib/rate-limit';

const dentro = await checkRateLimit(`generate:user:${user.id}`, profile.plan === 'pro' ? 30 : 10, 60);
if (!dentro) {
  return NextResponse.json(
    { error: 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.' },
    { status: 429, headers: { 'Retry-After': '60' } }
  );
}
```

**Variante B — `@upstash/ratelimit` + Redis (para ESCALA: miles de usuarios, o límites en el Edge/middleware).** Redis responde en ~1ms y no le mete escrituras a tu Postgres en cada request. Upstash tiene plan gratis; `npm i @upstash/ratelimit @upstash/redis`.

```typescript
// lib/rate-limit.ts (variante Redis — misma interfaz hacia el handler)
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Env vars del servidor: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
const redis = Redis.fromEnv();

export const aiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),   // 10 req/min (subir para plan Pro)
  prefix: 'rl:ai',
});

export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),    // 5 intentos / 15 min (login, reset, magic link)
  prefix: 'rl:auth',
});
```

```typescript
// En el route handler (funciona igual en Node y en Edge/middleware):
const { success, reset } = await aiLimiter.limit(`user:${user.id}`);
if (!success) {
  return NextResponse.json(
    { error: 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.' },
    { status: 429, headers: { 'Retry-After': String(Math.max(1, Math.ceil((reset - Date.now()) / 1000))) } }
  );
}
// En endpoints de auth (sin sesión aún): limitar por IP Y por email
// await authLimiter.limit(`ip:${ip}`) y authLimiter.limit(`email:${emailNormalizado}`)
```

```
¿Cuál usar? Empezar con A (Postgres): cero servicios extra, suficiente hasta cientos de usuarios.
Migrar a B (Upstash) cuando: el endpoint es de MUY alto tráfico, necesitas limitar en el middleware/Edge
(antes de tocar la DB), o las escrituras del limitador empiezan a pesar en Postgres (ver 13).
La interfaz del handler no cambia: es un intercambio de lib/rate-limit.ts.
```

### El BFF debe AUTORIZAR, no solo esconder la clave

Los ejemplos BFF de arriba resuelven *dónde vive la API key* (en el servidor). Pero un BFF que solo reenvía a la IA **sin validar quién llama ni qué plan tiene** es un endpoint abierto: cualquiera que vea `/api/generate` en el Network tab puede llamarlo en bucle y **quemar tu factura de IA**, o un usuario free puede usar features de pago.

**Defensa en profundidad:** RLS protege los *datos* en la DB; el BFF debe autorizar la *acción* antes de gastar dinero llamando a la IA. Ambos, no uno u otro.

```
Orden en TODO endpoint que llama a la IA o muta datos:
1. Validar la SESIÓN (¿hay un usuario autenticado de verdad?)
2. Cargar el PLAN/estado del usuario desde el servidor (no confiar en el cliente)
3. AUTORIZAR: ¿este plan puede hacer esto? ¿le quedan créditos? ¿está 'active'/'past_due', no 'refunded'?
4. Rate limit por usuario
5. Recién entonces → validar input (zod) → llamar a la IA
```

```typescript
// app/api/generate/route.ts (Next.js App Router — el BFF que SÍ autoriza)
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const Body = z.object({ prompt: z.string().trim().min(1).max(2000) });

export async function POST(req: NextRequest) {
  // 1. SESIÓN: cliente ligado a las cookies del request (lee el token httpOnly de Supabase)
  const cookieStore = await cookies(); // Next 15: cookies() es async → SIEMPRE await
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    // nomenclatura NUEVA de Supabase (no la legacy `*_ANON_KEY`) — ver `51-STACK-PINEADO.md` → "§5"
    {
      // API actual de @supabase/ssr: getAll/setAll (la vieja get/set/remove está deprecada)
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          // En un route handler de solo lectura puede no aplicar; el refresh/rotación de
          // sesión se hace en el MIDDLEWARE (código canónico completo en 26-AUTH-MODERNO,
          // sección "MIDDLEWARE CANÓNICO DE SUPABASE SSR"). Aquí, defensivo:
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options));
          } catch { /* set desde un Server Component: lo maneja el middleware */ }
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser(); // valida el JWT contra Supabase
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  // 2. PLAN/estado del usuario — desde el SERVIDOR, nunca del body
  const { data: profile } = await supabase
    .from('profiles').select('plan, status').eq('id', user.id).single();

  // 3. AUTORIZAR: estado de membresía + plan. Un 'refunded'/'chargeback' NO pasa.
  if (!profile || ['refunded', 'chargeback'].includes(profile.status)) {
    return NextResponse.json({ error: 'Acceso no disponible' }, { status: 403 });
  }
  if (profile.plan !== 'pro') {
    return NextResponse.json({ error: 'Esta función requiere plan Pro' }, { status: 403 });
  }

  // 4. Rate limit por usuario — checkRateLimit(`generate:user:${user.id}`, ...) → 429 si excede
  //    (implementación canónica en la sección "Rate Limiting en el Servidor" arriba)
  // 5. Validar input (formato) y SOLO AHORA llamar a la IA (con la clave del servidor)
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Input inválido' }, { status: 400 });

  const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!, // clave SOLO en el servidor
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL, max_tokens: 1024,
      messages: [{ role: 'user', content: parsed.data.prompt }],
    }),
  });
  return NextResponse.json(await aiRes.json());
}
```

> Ocultar el botón Pro en el frontend **no es autorización** — es cosmética. La verificación del plan tiene que estar en el servidor (este handler) Y los datos protegidos por RLS. Ver A01/A06 en `27-REVISION-SEGURIDAD.md`.

### XSS: escapar el OUTPUT, no el INPUT (doctrina correcta)

> **NUNCA escapes el input para "prevenir XSS".** Escapar en la entrada (`.replace(/</g,'&lt;')...` sobre lo que escribe el usuario) es un **antipatrón**: **corrompe los datos** (`Tom & Jerry` se guarda como `Tom &amp; Jerry`, `a < b` se rompe) y **no previene XSS** — el XSS se previene al renderizar, no al guardar.

**La regla correcta:** el XSS se previene con **escape contextual en el OUTPUT** (al renderizar), según el contexto donde el dato aterriza (HTML, atributo, URL, JS).

```
✅ Guardar el input TAL CUAL (validado por formato con zod, ver abajo).
✅ Escapar al RENDERIZAR, según el contexto de salida.
❌ Escapar al guardar  → datos corruptos y no protege.
```

**1. React ya escapa el output por defecto.** `{userInput}` en JSX se renderiza como texto, nunca como HTML. Para el 95% de los casos no hay que hacer nada — solo dejar que React renderice. Aunque `userName` sea `<img onerror=alert(1)>`, se muestra como texto literal.

**2. `dangerouslySetInnerHTML` está PROHIBIDO sin sanitizar.** Es la puerta #1 al XSS en React. Solo para HTML rico legítimo (ej. markdown renderizado), SIEMPRE pasando por DOMPurify primero:

```tsx
import DOMPurify from 'isomorphic-dompurify';

function ContenidoRico({ html }: { html: string }) {
  const limpio = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p','b','i','em','strong','a','ul','ol','li','h1','h2','h3','blockquote','code','pre'],
    ALLOWED_ATTR: ['href','title'],
  });
  return <div dangerouslySetInnerHTML={{ __html: limpio }} />;
}
// ❌ NUNCA: <div dangerouslySetInnerHTML={{ __html: comentarioDelUsuario }} />  // ☠️ XSS
```

**3. Cuidado con `href`.** Una URL de usuario puede ser `javascript:alert(1)`. Validar el esquema:

```tsx
function safeHref(url: string): string {
  try {
    const u = new URL(url, window.location.origin);
    return ['http:', 'https:', 'mailto:'].includes(u.protocol) ? u.href : '#';
  } catch { return '#'; }
}
```

**Validar input por FORMATO (zod) ≠ escapar para seguridad.** Validar sigue siendo necesario, pero su propósito es **integridad de datos y reglas de negocio** (que un email tenga forma de email, que un texto no exceda un límite), no prevenir XSS. Usar **zod** en el servidor:

```typescript
import { z } from 'zod';
const GenerarSchema = z.object({
  prompt: z.string().trim().min(1, 'El texto no puede estar vacío').max(2000, 'Máximo 2000 caracteres'),
});
const parsed = GenerarSchema.safeParse(await req.json()); // datos LIMPIOS por formato, guardados tal cual
if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
```

> **Resumen:** zod valida la *forma* del dato; DOMPurify + el escape de React protegen el *renderizado*; el **Content-Security-Policy** (más abajo) es la red de seguridad a nivel de red. Tres trabajos distintos.

### CORS (Cross-Origin Resource Sharing)

Si tienes un backend propio, NUNCA usar `Access-Control-Allow-Origin: *` en producción:

```typescript
// Correcto: solo permitir tu dominio
const allowedOrigins = [
  'https://tuapp.com',
  'https://www.tuapp.com',
  process.env.NODE_ENV === 'development' && 'http://localhost:3000'
].filter(Boolean) as string[];
```

Definir la lista no basta — hay que **aplicarla**: validar el `Origin` entrante contra ella,
reflejar SOLO si pasa (nunca `*` en producción), añadir `Vary: Origin` (para que el cache no
sirva la cabecera de un origen a otro) y responder el preflight `OPTIONS`:

```typescript
// lib/cors.ts — valida y APLICA la allowlist (no solo la declara)
function corsHeaders(origin: string | null): Headers {
  const h = new Headers();
  h.set('Vary', 'Origin'); // SIEMPRE, pase o no — evita envenenar el cache entre orígenes
  if (origin && allowedOrigins.includes(origin)) {
    // Reflejar SOLO el origen permitido; jamás Access-Control-Allow-Origin: * en producción
    h.set('Access-Control-Allow-Origin', origin);
    h.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    h.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    h.set('Access-Control-Allow-Credentials', 'true'); // si usas cookies; incompatible con '*'
    h.set('Access-Control-Max-Age', '86400');
  }
  return h; // origen no permitido → sin cabeceras CORS → el navegador bloquea
}

// Preflight: responder OPTIONS antes de tocar la lógica
export function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req.headers.get('origin')) });
}

// En cada respuesta real, fusionar estas cabeceras:
//   const headers = corsHeaders(req.headers.get('origin'));
//   return NextResponse.json(data, { headers });
```

### SSRF: fetch seguro de URLs/imágenes del usuario (apps de visión)

Las apps de IA con visión hacen `fetch` de **URLs o imágenes que el usuario provee**. Eso es un vector de **SSRF (Server-Side Request Forgery)**: el atacante mete una URL que apunta **hacia adentro de tu infra**, y tu servidor —que sí tiene acceso a la red interna— la busca por él.

```
Objetivos típicos de un SSRF:
- http://169.254.169.254/...  → metadata de la nube (AWS/GCP): puede filtrar CREDENCIALES IAM
- http://localhost / 127.0.0.1 → servicios internos (admin, DBs, paneles sin auth)
- http://10.x / 172.16-31.x / 192.168.x → red privada interna
- file:// , gopher:// , dict:// → leer archivos locales o hablar con otros protocolos
- Un dominio público que REDIRIGE (302) a 169.254.169.254 → bypass si no revalidás tras el redirect
```

**Defensa (todas las capas):** allowlist de esquema (solo `https:`); resolver el DNS y validar la **IP resuelta** (bloquear loopback/privadas/link-local); NO seguir redirects (`redirect: 'manual'`); timeout corto + límite de tamaño.

```typescript
// lib/safe-fetch.ts
import { lookup } from 'node:dns/promises';
import net from 'node:net';
import ipaddr from 'ipaddr.js'; // npm i ipaddr.js

const ALLOWED_PROTOCOLS = ['https:'];
const MAX_BYTES = 10 * 1024 * 1024; const TIMEOUT_MS = 5000;

function isPublicIp(ip: string): boolean {
  if (!net.isIP(ip)) return false;
  const range = ipaddr.parse(ip).range();
  const BLOCKED = ['loopback','private','linkLocal','uniqueLocal','multicast',
                   'reserved','unspecified','broadcast','carrierGradeNat'];
  return !BLOCKED.includes(range);
}

export async function safeFetchImage(rawUrl: string): Promise<Response> {
  let url: URL;
  try { url = new URL(rawUrl); } catch { throw new Error('URL inválida'); }
  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) throw new Error('Esquema no permitido');

  // Resolver DNS y validar la IP resuelta (frena IPs internas escritas como dominio)
  const { address } = await lookup(url.hostname);
  if (!isPublicIp(address)) throw new Error('Destino no permitido (IP interna/privada)');

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url.href, { redirect: 'manual', signal: ctrl.signal });
  } finally { clearTimeout(timer); }
  if (res.status >= 300 && res.status < 400) throw new Error('Redirect no permitido');

  if (!(res.headers.get('content-type') ?? '').startsWith('image/')) throw new Error('No es imagen');

  // Content-Length lo controla el atacante (puede mentir u omitirlo): úsalo SOLO como rechazo
  // temprano, nunca como la verdad. El límite REAL se aplica leyendo el body por stream y
  // abortando si se supera MAX_BYTES.
  const declared = Number(res.headers.get('content-length') ?? 0);
  if (declared > MAX_BYTES) throw new Error('Archivo demasiado grande');

  if (!res.body) throw new Error('Sin cuerpo de respuesta');
  const reader = res.body.getReader();
  const parts: Uint8Array[] = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > MAX_BYTES) {            // tope real: cortar en cuanto se excede
      await reader.cancel();
      throw new Error('Archivo demasiado grande');
    }
    parts.push(value);
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const p of parts) { bytes.set(p, offset); offset += p.byteLength; }
  return new Response(bytes, { headers: { 'content-type': res.headers.get('content-type')! } });
}
```

> Si tu hosting lo permite, **bloquear el acceso a `169.254.169.254` a nivel de red** (firewall de egress) es la defensa más sólida. Para DNS rebinding (avanzado), fijar la IP validada al conectar (pinning) o usar un proxy de egress con allowlist.

### File upload seguro a Supabase Storage

La extensión y el `Content-Type` que manda el navegador **son mentira controlable por el atacante** — validar el **tipo real por magic bytes**.

```
1. Tipo REAL por magic bytes (primeros bytes), NO por extensión ni Content-Type del cliente.
2. Límite de tamaño. 3. RECHAZAR SVG (es XML → <script> → XSS si se sirve inline).
4. Content-Disposition: attachment al servir. 5. Nombres ALEATORIOS (uuid), nunca el original.
6. Bucket PRIVADO + signed URLs de vida corta.
```

```typescript
// lib/upload.ts
import { fileTypeFromBuffer } from 'file-type'; // npm i file-type
import { randomUUID } from 'node:crypto';

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Map([['image/jpeg','jpg'],['image/png','png'],['image/webp','webp'],['application/pdf','pdf']]);

export async function uploadUserFile(supabaseAdmin: any, userId: string, bytes: Uint8Array) {
  if (bytes.byteLength > MAX_BYTES) throw new Error('Archivo demasiado grande');
  const detected = await fileTypeFromBuffer(bytes);          // magic bytes, ignora lo que diga el cliente
  if (!detected || !ALLOWED.has(detected.mime)) throw new Error('Tipo no permitido'); // SVG/ejecutables caen aquí
  const path = `${userId}/${randomUUID()}.${ALLOWED.get(detected.mime)}`;  // nombre aleatorio, namespaced
  const { error } = await supabaseAdmin.storage.from('uploads').upload(path, bytes, {
    contentType: detected.mime, upsert: false,
  });
  if (error) throw error;
  return path; // guardar el path; servir con signed URL de vida corta (createSignedUrl 60s, { download: true })
}
```

```sql
-- El bucket 'uploads' debe ser PRIVADO. Política: cada quien su carpeta (primer segmento = user_id).
create policy "uploads_own_folder" on storage.objects for all to authenticated
  using ( bucket_id = 'uploads' and (storage.foldername(name))[1] = (select auth.uid())::text )
  with check ( bucket_id = 'uploads' and (storage.foldername(name))[1] = (select auth.uid())::text );
```

> La **signed URL** ya es de tu propio dominio confiable — el `safeFetchImage` (SSRF) es para URLs que el **usuario** trae de fuera, no para tus signed URLs internas.

### Content Security Policy (CSP)

Headers estáticos de seguridad — si usas Vercel, en `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
      ]
    }
  ]
}
```

> ⚠️ **La CSP NO va en `vercel.json` si tu app es Next.js.** Una CSP con `script-src 'self'` a secas
> rompe la hidratación de Next.js en producción (los scripts inline que Next inyecta quedan bloqueados)
> → app en blanco. El patrón correcto es el **nonce por request** generado en `middleware.ts`, que es
> el que recomienda Next:

```typescript
// middleware.ts — CSP con nonce por request (patrón oficial de Next.js)
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: https:`,
    `font-src 'self'`,
    // el navegador JAMÁS habla con la API de IA — eso pasa por tu BFF (si aparece
    // api.anthropic.com en tu CSP, la clave está en el cliente: ERROR)
    `connect-src 'self' https://*.supabase.co`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ].join('; ');

  // Pasar el nonce a los Server Components vía request header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    // Aplica a todo excepto estáticos y prefetches
    { source: '/((?!_next/static|_next/image|favicon.ico).*)', missing: [
      { type: 'header', key: 'next-router-prefetch' },
      { type: 'header', key: 'purpose', value: 'prefetch' },
    ] },
  ],
};
```

Next lee el header `Content-Security-Policy` del request y aplica el nonce automáticamente a sus
scripts. Si añades `<Script>` propios, pásales el nonce leído con `headers()` (`x-nonce`).

> **Tradeoff MVP consciente:** si el nonce te complica el arranque (analytics de terceros, scripts
> que no aceptan nonce), es MEJOR documentar `script-src 'self' 'unsafe-inline'` como compromiso
> explícito en ESTADO.md — sigue teniendo `frame-ancestors`, `connect-src` y el resto de la red de
> seguridad — que entregar una CSP "estricta" que tumba la app en producción. Una CSP que rompe la
> hidratación no es más segura: es una app en blanco. Endurecer a nonce cuando el MVP respire.

> Ajusta `connect-src` a los dominios que tu app realmente usa (Supabase, analytics — NUNCA el
> endpoint del proveedor de IA: esa llamada vive en el BFF, no en el navegador).
> Empezar cerrado y abrir lo justo, nunca al revés. Nota: si ya usas `middleware.ts` para refrescar
> la sesión de Supabase (ver `26-AUTH-MODERNO.md`), la CSP se añade en ESE mismo middleware — Next
> solo permite uno.

> **Camino de adopción sin sustos:** publicar primero la política como
> `Content-Security-Policy-Report-Only` con `report-to` apuntando a tu endpoint de reportes, mirar
> unos días qué bloquearía con tráfico real, y solo entonces promoverla a enforcement (`Content-Security-Policy`).

---

## AUTENTICACIÓN SEGURA

> **Auth moderno completo en `26-AUTH-MODERNO.md`** (passkeys/WebAuthn, rotación de tokens, rate limits por endpoint, MFA, anti-enumeración). Esta sección es el resumen endurecido; el detalle de 2026 vive en el 26.

### Reglas de Autenticación

1. **Nunca implementar auth propio** para un MVP. Usar Supabase Auth, Clerk, NextAuth, o Firebase Auth.
2. **Siempre ofrecer OAuth** (Google como mínimo). Reduce fricción de registro un 30-50%.
3. **Nunca almacenar contraseñas en texto plano** (los servicios de auth ya manejan esto).
4. **Tokens en httpOnly cookies**, nunca en localStorage (previene XSS).
5. **Sesiones con expiración** — renovar automáticamente, pero expirar después de inactividad.

### Patrón de Autenticación Recomendado

```
1. Usuario hace click en "Entrar con Google"
2. Se abre el flujo de OAuth de Supabase/Clerk
3. Al volver, el token se guarda en cookie httpOnly (Supabase lo hace automático)
4. Cada request al backend incluye el token
5. El backend valida el token antes de ejecutar cualquier acción
```

### Endurecimiento del Login (blindaje adicional)

```
[ ] Mensajes de error genéricos: "Credenciales inválidas" — NUNCA "el email no existe"
    o "contraseña incorrecta" (eso le confirma a un atacante qué emails están registrados)
[ ] Rate limiting en login: máx 5 intentos fallidos → espera incremental (Supabase
    Auth lo trae integrado; verificar que está activo. Para endpoints de auth PROPIOS,
    implementación canónica en "Rate Limiting en el Servidor" arriba)
[ ] Contraseñas: mínimo 8 caracteres exigido por el proveedor de auth. No inventar
    reglas absurdas (mayúscula+símbolo+sangre de unicornio) — longitud > complejidad
[ ] Sesiones con expiración + refresh automático (default de Supabase: correcto).
    Logout debe invalidar la sesión en el servidor, no solo borrar la cookie
[ ] Magic links o OAuth como opción preferente: menos contraseñas = menos riesgo
[ ] 2FA: ofrecerlo (Supabase Auth lo soporta) si la app maneja datos sensibles o dinero
[ ] Emails de auth (reset, verificación) con expiración corta (1h) y un solo uso
[ ] Nunca loguear contraseñas, tokens, ni códigos en consola o Sentry
```

### CSRF: la cookie httpOnly NO te protege de esto

Punto de confusión frecuente: guardar el token en cookie **httpOnly** protege contra el **robo** del token por XSS (JS no puede leerla). Pero **NO protege contra CSRF**: justamente porque el navegador adjunta la cookie *automáticamente* en cada petición a tu dominio, un sitio malicioso puede disparar una petición a tu API y el navegador manda la cookie del usuario sin que él lo sepa.

```
Defensa CSRF (capas):
1. SameSite en la cookie de sesión: Lax (default razonable) o Strict para apps sensibles.
   → la cookie NO viaja en peticiones cross-site → corta el grueso de CSRF. Supabase ya setea SameSite.
2. Para endpoints MUTANTES sensibles (pago, borrar cuenta, cambiar email): double-submit token
   → un token CSRF en cookie legible + el mismo en un header; el servidor exige que coincidan.
3. Validar el header Origin/Referer en mutaciones (rechazar si no es tu dominio).
```

> **Matices que hacen que el double-submit no sea de juguete:**
> - El token CSRF va en su **PROPIA cookie legible (no httpOnly)** — NO es la cookie de sesión.
>   La de sesión sigue httpOnly; mezclarlas rompe ambas protecciones.
> - El double-submit **naive** (cookie aleatoria que se refleja en un header, sin más) es
>   **bypasseable**: un subdominio o un MITM sin TLS puede *plantar* una cookie y la comparación
>   "cookie == header" pasa igual. La defensa real es un **token FIRMADO**: un HMAC ligado a la
>   sesión (`HMAC(secret, session_id)`), que el atacante no puede forjar sin el secreto del servidor.
> - **Default recomendado para un MVP:** **Origin-check + `SameSite=Strict`** en la cookie de sesión.
>   Es robusto, simple y sin estado extra. El double-submit firmado se suma encima solo para las
>   mutaciones más sensibles (pago, borrar cuenta).

```typescript
function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  const allowed = ['https://tuapp.com', 'https://www.tuapp.com'];
  return !!origin && allowed.includes(origin);
}
// En el handler de una mutación sensible: if (!sameOrigin(req)) return 403;
```

> El detalle de sesión (cookies HttpOnly + Secure + SameSite, rotación de refresh, logout server-side) está en `26-AUTH-MODERNO.md`. Aquí solo el matiz: httpOnly ≠ anti-CSRF.

### Row Level Security (RLS) — Obligatorio con Supabase

Si usas Supabase, RLS es OBLIGATORIO. Sin RLS, cualquier usuario puede leer/modificar datos de cualquier otro usuario:

```sql
-- SIEMPRE activar RLS en todas las tablas
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- ❌ FORMA INGENUA — NO USAR: `for all` con solo `using` (sin `with check`)
-- `using` filtra lo que se LEE/actualiza/borra, pero NO valida lo que se ESCRIBE.
-- Con solo `using`, un usuario puede INSERT/UPDATE con un user_id AJENO → IDOR de escritura.
CREATE POLICY "users_own_data" ON generations
  FOR ALL USING (auth.uid() = user_id);   -- ⚠️ falta WITH CHECK → escritura de filas ajenas

-- ✅ CORRECTO: políticas por comando, con WITH CHECK en insert/update (frena el IDOR de escritura).
--    using  = qué filas puede ver/tocar;  with check = qué filas puede ESCRIBIR.
CREATE POLICY "gen_select" ON generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "gen_insert" ON generations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gen_update" ON generations FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gen_delete" ON generations FOR DELETE USING (auth.uid() = user_id);

-- NUNCA confiar en que el frontend envíe el user_id correcto
-- SIEMPRE usar auth.uid() en el servidor
```

> La **matriz canónica de RLS por comando** (SELECT/INSERT/UPDATE/DELETE, con `using` vs `with check` en cada uno) vive en `25-BASE-DE-DATOS.md` (sección "RLS COMPLETO — matriz por comando"). Acá solo el patrón mínimo seguro; el detalle y los casos multi-tabla, en el 25.

**RLS de alto rendimiento (correcto Y rápido).** La forma ingenua de arriba es segura pero lenta en tablas grandes: `auth.uid()` se evalúa una vez por fila. Dos ajustes dan **100x+** sin perder seguridad:

```sql
-- ✅ Envolver auth.uid() en subquery: Postgres lo evalúa UNA vez y cachea (no por fila).
--    Política por comando + WITH CHECK en insert/update (igual que arriba: el truco de rendimiento
--    no cambia que `for all` con solo `using` deja escribir filas ajenas).
CREATE POLICY "gen_select" ON generations FOR SELECT USING ( (select auth.uid()) = user_id );
CREATE POLICY "gen_insert" ON generations FOR INSERT WITH CHECK ( (select auth.uid()) = user_id );
CREATE POLICY "gen_update" ON generations FOR UPDATE
  USING ( (select auth.uid()) = user_id ) WITH CHECK ( (select auth.uid()) = user_id );
CREATE POLICY "gen_delete" ON generations FOR DELETE USING ( (select auth.uid()) = user_id );

-- ✅ SIEMPRE indexar la columna usada en la política
CREATE INDEX generations_user_id_idx ON generations(user_id);
```

Para políticas con lógica multi-tabla (ej: "solo miembros del equipo X"), no meter el join en la política: moverlo a una función `security definer` en un schema privado y revocar su ejecución a los roles públicos.

```sql
CREATE SCHEMA IF NOT EXISTS private;
CREATE FUNCTION private.es_miembro(team uuid) RETURNS boolean
  LANGUAGE sql SECURITY DEFINER STABLE AS $$
    SELECT EXISTS (SELECT 1 FROM memberships m
      WHERE m.team_id = team AND m.user_id = (select auth.uid()));
  $$;
REVOKE EXECUTE ON FUNCTION private.es_miembro FROM anon, authenticated;
```

> Diseño de esquema, índices, migraciones seguras y `EXPLAIN ANALYZE` están en `25-BASE-DE-DATOS.md`. RLS sin índice en la columna de la política es el footgun de rendimiento #1.

---

## LEGAL Y PRIVACIDAD → vive completo en `47-LEGAL-FISCAL-Y-PRIVACIDAD.md`

> El pilar legal/privacidad (páginas legales, minimización de datos, derecho a eliminación, LGPD/LATAM, transferencia internacional a la IA, ZDR) vive completo en `47-LEGAL-FISCAL-Y-PRIVACIDAD.md`. Las páginas legales son requisito del footer de la landing (`19` §10) y del pre-lanzamiento. Este archivo queda como seguridad técnica pura.

---

## CHECKLIST DE SEGURIDAD

> **Antes de vender, correr la auditoría completa de `27-REVISION-SEGURIDAD.md`** (OWASP Top 10:2025, grep de fail-open, `semgrep`, `npm audit`, threat model ligero). Esta checklist es la base; el 27 es la rutina de auditoría con comandos.

```
SEGURIDAD
[ ] API keys sensibles están en el servidor, NUNCA en el frontend
[ ] El patrón BFF está implementado para llamadas a IA
[ ] El BFF AUTORIZA sesión + plan en el servidor antes de llamar a la IA (no solo oculta la key)
[ ] Rate limiting activo en TODO endpoint BFF de IA y TODO endpoint de auth (implementación canónica arriba: Postgres o Upstash)
[ ] XSS prevenido por escape de OUTPUT (React/DOMPurify), NO escapando el input; dangerouslySetInnerHTML sanitizado
[ ] Input validado por formato con zod (integridad), no "sanitizado" para seguridad
[ ] Fetch de URLs/imágenes del usuario pasa por safe-fetch (anti-SSRF: allowlist de esquema, IP resuelta validada, sin redirects)
[ ] Uploads validados por magic bytes (no extensión); SVG rechazado; bucket privado + signed URLs; Content-Disposition: attachment
[ ] CSRF: SameSite en la cookie de sesión + double-submit/Origin-check en mutaciones sensibles
[ ] CORS configurado con whitelist de dominios
[ ] Headers de seguridad configurados, incluido un Content-Security-Policy real (no solo X-Frame-Options)
[ ] RLS activo en todas las tablas de Supabase, en forma de alto rendimiento (select auth.uid())
[ ] Auth endurecido según 26-AUTH-MODERNO (rotación de tokens, rate limits, anti-enumeración)
[ ] OAuth implementado (Google como mínimo); passkeys si el público lo soporta
[ ] No hay console.log con datos sensibles
[ ] .env en .gitignore (verificar con git log); secretos filtrados alguna vez → rotados
[ ] npm audit sin vulnerabilidades críticas; lockfile commiteado
[ ] Sin defaults inseguros (fail-open): la app crashea si falta un secreto, no corre con uno de juguete

DATOS (técnico)
[ ] Contraseñas manejadas por servicio de auth (nunca custom)
[ ] Datos de pago manejados por procesador (nunca almacenados)
[ ] Backups con PITR en prod (no solo el diario) y restore PROBADO al menos una vez (ver 25)

LEGAL Y PRIVACIDAD → checklist completa en 47-LEGAL-FISCAL-Y-PRIVACIDAD.md (páginas legales,
LGPD/consentimiento, eliminar cuenta, transferencia internacional a IA + ZDR)
```
