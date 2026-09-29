# FASE 7 — DEPLOY Y LANZAMIENTO

> **Antes de desplegar a producción (obligatorio):** correr la auditoría de `27-REVISION-SEGURIDAD.md` (OWASP Top 10:2025, grep de fail-open, `semgrep`, `npm audit`, secretos). Si la app es Next.js, revisar `28-INGENIERIA-NEXTJS.md` (Core Web Vitals y caché) antes de publicar. Desplegar con la verificación de seguridad pendiente es el error que cuesta dinero y datos.
>
> **Conexión y actualización continua:** ejecutar `62-PUBLICACION-SEGURA-Y-CONTINUA.md`. Este archivo
> explica la infraestructura; el 62 certifica que GitHub, Vercel, Supabase, ambientes, dominio y
> callbacks apuntan al mismo producto y que un segundo push se publica automáticamente.

## DEPLOY SIN TERMINAL — Protocolo de Lenguaje Natural

La forma más simple de publicar la app: pega el `PROMPT-DEPLOY.txt` (incluido en el sistema)
en Claude Code con el proyecto abierto. Claude detecta el estado actual (primera vez,
repo existente, variables configuradas) y ejecuta todo lo necesario, preguntando solo
lo que no puede resolver solo.

**Qué hace el agente por ti:**
- Audita, corrige, crea commits y usa conectores/CLIs ya autenticadas.
- Identifica el repo, proyecto y ambiente correctos antes de crear o modificar recursos.
- Guía una acción manual por vez, justo cuando se necesita, con ruta y resultado esperado.
- Certifica GitHub -> Vercel con Preview, Production y una segunda publicación automática.
- Completa `PUBLICATION-CERTIFICATE.md` sin valores sensibles.

**Lo que el usuario hace manualmente cuando el proveedor lo exige:**
- Crear cuentas en GitHub, Supabase y Vercel (son externas, Claude no puede crearte cuentas)
- Hacer clic en "Authorize" cuando el navegador se abre para autenticar
- Introducir secretos directamente en el dashboard/prompt seguro. El agente NUNCA pide sus valores por chat.

**Para deploys posteriores** (ya todo configurado), basta con decir:
> "Publica los cambios en GitHub"
→ El agente hace el commit + push; Vercel despliega automáticamente porque esa conexión ya fue probada
con P8 de `62`. Si no aparece deployment, se diagnostica la integración; no se oculta con deploy manual.

---

## Objetivo
Poner la app en producción accesible al mundo, con analytics configurado para medir las métricas definidas en la Fase 1. El usuario debe poder compartir un link y que la app funcione.

---

## Opción A: Deploy Simple (Sin Backend)

Para apps que no necesitan autenticación, base de datos, o procesamiento server-side. Todo corre en el navegador del usuario.

### Deploy en Vercel (Recomendado)

**Paso 1: Preparar el proyecto**
```bash
# Verificar que la app construye sin errores
npm run build

# Si hay errores de TypeScript, corregirlos
# Warnings no se ignoran por defecto: corregirlos o documentar riesgo, responsable y vencimiento.
```

**Paso 2: Subir a GitHub**
```bash
# Si el usuario no tiene repositorio aún:
git init
git add .
git commit -m "MVP listo para deploy"

# Crear repositorio en GitHub:
# 1. Ir a github.com → New Repository
# 2. Nombre: [nombre-de-la-app]
# 3. Público o Privado
# 4. No inicializar con README (ya tenemos código)

git remote add origin https://github.com/[usuario]/[nombre-de-la-app].git
git branch -M main
git push -u origin main
```

**Paso 3: Conectar de forma persistente con Vercel**
```
1. Ir a vercel.com → Sign up con GitHub
2. "Import Project" → Seleccionar el repositorio exacto (owner/repo)
   Si no aparece: "Configure GitHub App" → dar acceso solo a ese repo.
3. Vercel detecta automáticamente el framework (Next.js, Vite, etc.)
   Verificar también Scope/Team, Production Branch y Root Directory (crítico en monorepos).
4. Si hay variables de entorno, agregarlas en:
   Settings → Environment Variables
   - SOLO los valores PÚBLICOS llevan prefijo NEXT_PUBLIC_ (Next.js) o VITE_ (Vite):
     se incrustan en el bundle del cliente. Ej: NEXT_PUBLIC_SUPABASE_URL, VITE_SUPABASE_URL.
   - Las API keys de IA y de pago van SIN prefijo (ej: AI_API_KEY, WEBHOOK_SECRET) y se
     consumen SOLO desde el BFF/servidor (Route Handler, Server Action, Edge Function).
     Nunca pongas una API key de IA bajo NEXT_PUBLIC_/VITE_ — quedaría expuesta (ver 09).
5. Click "Deploy"
6. En 1-2 minutos, la app está viva en [nombre].vercel.app
7. Settings → Git → Connected Git Repository debe mostrar EXACTAMENTE owner/repo.
8. Hacer la prueba Preview + segunda publicación de `62`; `vercel link` o `vercel --prod` no sustituyen 7.
```

**Paso 4: Dominio personalizado (Opcional)**
```
1. En Vercel: Settings → Domains → Add
2. Escribir el dominio: app.tudominio.com
3. Vercel da los DNS records necesarios
4. Configurar en el registrador de dominio (Namecheap, GoDaddy, Cloudflare)
5. Esperar propagación (5 min - 48h)
```

---

## Opción B: Deploy con Backend (Supabase)

Para apps que necesitan: autenticación de usuarios, base de datos, almacenamiento de archivos, o lógica server-side.

### Setup de Supabase

**Paso 1: Crear proyecto**
```
1. Ir a supabase.com → New Project
2. Nombre: [nombre-de-la-app]
3. Región: elegir la más cercana a la audiencia
4. Password de la base de datos: generarla y guardarla
5. Esperar ~2 minutos a que se cree
```

**Paso 2: Configurar la base de datos**
```sql
-- Ejemplo de tablas comunes para una web app con IA.
-- NOTA: el esquema canónico vive en 25-BASE-DE-DATOS.md; esto es solo ilustrativo.
-- Usar SIEMPRE timestamptz (con zona) + now(), nunca TIMESTAMP sin zona.

-- Tabla de usuarios (Supabase auth ya la maneja, pero datos extra):
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  plan TEXT DEFAULT 'free', -- 'free' | 'pro'
  usage_today INTEGER DEFAULT 0,
  usage_reset_at TIMESTAMPTZ DEFAULT now(),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de resultados/generaciones:
CREATE TABLE generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  input TEXT NOT NULL,
  output TEXT NOT NULL,
  type TEXT, -- tipo de generación si hay varios
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security (CRÍTICO para seguridad):
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo ven sus propios datos (forma de alto rendimiento: ver 25-BASE-DE-DATOS):
CREATE POLICY "Users see own profile" ON profiles
  FOR ALL USING ((select auth.uid()) = id);

CREATE POLICY "Users see own generations" ON generations
  FOR ALL USING ((select auth.uid()) = user_id);

-- Indexar la columna de cada política (sin esto el RLS escanea toda la tabla):
CREATE INDEX IF NOT EXISTS generations_user_id_idx ON generations(user_id);
```

**Paso 3: Configurar autenticación**
```
En Supabase Dashboard:
1. Authentication → Providers
2. Activar: Email (siempre) + Google OAuth (recomendado)
3. Para Google OAuth:
   - Ir a console.cloud.google.com
   - Crear credenciales OAuth 2.0
   - Redirect URL: https://[tu-proyecto].supabase.co/auth/v1/callback
   - Pegar Client ID y Secret en Supabase
```

**Paso 4: Integrar en el frontend**

Next.js es el DEFAULT del SO — usar `@supabase/ssr` y `process.env.NEXT_PUBLIC_*`:
```typescript
// lib/supabase/client.ts  (Next.js — cliente del navegador)
import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);
// En el servidor (Route Handler / Server Action) usar createServerClient de @supabase/ssr
// para leer/escribir cookies de sesión correctamente (ver 09 y 28).
```

Variante Vite + React (si esa fue la decisión de 12):
```typescript
// lib/supabase.ts  (Vite)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

Ejemplos de uso (ambos frameworks):
```typescript
// Ejemplo: Login con Google
async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
}

// Ejemplo: Guardar una generación
async function saveGeneration(input: string, output: string) {
  const { data, error } = await supabase
    .from('generations')
    .insert({ input, output, user_id: (await supabase.auth.getUser()).data.user?.id });
}

// Ejemplo: Obtener historial
async function getHistory() {
  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  return data;
}
```

**Paso 5: Variables de entorno**
```env
# .env.local (NO subir a GitHub)
VITE_SUPABASE_URL=https://[tu-proyecto].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[tu-publishable-key]
# La clave de IA va SOLO en el servidor (BFF). NUNCA con prefijo VITE_ (se incrusta en el bundle — ver 09).
AI_API_KEY=[tu-api-key-de-ia]   # se usa desde la Edge Function / Route Handler, jamás desde el cliente
```

```
# En Vercel, configurar las mismas variables en:
Settings → Environment Variables
```

---

## Opción C: Deploy como Artifact (Sin infraestructura)

Para apps que viven dentro de Claude o como archivos HTML standalone. La opción más simple.

**Cuándo elegir esta opción:**
- MVPs rápidos para validar la idea
- Apps que no necesitan persistencia entre sesiones
- Demos o prototipos para mostrar a potenciales usuarios

**Limitaciones:**
- Sin autenticación de usuarios
- Sin base de datos persistente (solo window.storage para persistencia básica)
- Sin dominio propio
- Sin SEO

**Proceso:**
1. Generar la app como React artifact o HTML
2. El usuario la prueba directamente
3. Si valida la idea, migrar a Opción A o B para producción

---

## Configuración de Analytics

> **Analítica de PRODUCTO (funnels, eventos, retención):** la taxonomía de eventos canónica vive en `36-ANALITICA-Y-EVENTOS.md`; sigue esa convención (`objeto_accion`, wrapper `track`). Esta sección cubre el monitoreo de errores y la analítica de TRÁFICO de la landing; los eventos de producto no se nombran aquí.

### Monitoreo de Errores — Sentry (Obligatorio en Producción)

Los analytics miden métricas. Sentry atrapa errores que los usuarios no reportan.

```
1. Crear cuenta en sentry.io (plan gratuito incluye 5K eventos/mes)
2. Instalar el SDK (Next.js es el default del SO — captura cliente, server Y edge,
   lo que cubre el webhook y las rutas de IA que corren en el servidor):
   npm install @sentry/nextjs
3. Correr el wizard OFICIAL y commitear TODO lo que genere:
   npx @sentry/wizard@latest -i nextjs
   // El wizard moderno (SDK v9/v10 — requerido con Turbopack, el default de Next 16) genera
   // instrumentation.ts + instrumentation-client.ts (ya NO sentry.client.config.ts, que era v8).
   // No listar archivos de memoria: la receta es "correr el wizard y commitear lo que genere".
   // En la config generada, ajustar:
   //   Sentry.init({
   //     dsn: "https://xxx@sentry.io/yyy",
   //     environment: process.env.VERCEL_ENV ?? "development",
   //     tracesSampleRate: 0.1, // 10% de transacciones
   //   });
   // (Para una app Vite + React: usar @sentry/react + Sentry.ErrorBoundary.)
4. Usar global-error.tsx para reportar errores de render del App Router a Sentry
5. Los errores ahora aparecen en el dashboard de Sentry con:
   - Stack trace completo
   - Breadcrumbs (qué hizo el usuario antes del error)
   - Browser, OS, y dispositivo
   - Cuántos usuarios están afectados
```

Para MVP: Si Sentry es demasiado, al mínimo revisar la consola de Vercel para errores de deploy y los logs de Supabase para errores de backend.

### Gestión de Ambientes

```
Desarrollo (local):
  - .env.local con claves de desarrollo
  - Base de datos de desarrollo (o proyecto Supabase separado)
  - npm run dev

Producción:
  - Variables de entorno en Vercel Dashboard
  - Base de datos de producción
  - Deploy automático con cada push a main
  
Preview (automático con Vercel):
  - Cada pull request genera una URL de preview
  - Útil para probar cambios antes de mergear
```

**Regla**: NUNCA usar la misma base de datos para desarrollo y producción. Si usas Supabase, crea un proyecto separado para dev (es gratis).

**Scoping de secretos por entorno (crítico):** en Vercel, cada variable se asigna a uno o más entornos (Production / Preview / Development). Los secretos de PRODUCCIÓN (DB de prod, claves de IA y de pago reales, WEBHOOK_SECRET de prod) se marcan SOLO en Production y NO se exponen en Preview deploys — cada PR genera una URL pública y un secreto de prod ahí filtrado es un secreto filtrado. Preview usa su propio proyecto Supabase y sus propias keys (incluso claves de IA de prueba o con límite de gasto). Nunca compartas el mismo secreto entre Production y Preview.

**Cero secretos en la conversación:** el agente pregunta únicamente qué variables faltan y pide que el
dueño las introduzca directamente en Vercel/Supabase. No acepta valores, no imprime `.env`, no pone
secretos en argumentos de terminal y no solicita capturas que los muestren. Tras cualquier cambio de env
se crea un deployment nuevo: los deployments existentes no reciben variables retroactivamente.

### Certificado de conexión y segunda publicación

## VERIFICAR QUE LO PUBLICADO ES LO NUEVO (no que el servidor responde)

Un `200 OK` significa "hay algo ahí", **no** "está lo que acabas de subir". Entre el push y lo que
ve un usuario hay build, caché de CDN y caché del navegador; cualquiera de los tres puede seguir
sirviendo la versión anterior durante minutos u horas mientras todo responde 200.

**La única verificación válida es buscar una cadena que SOLO exista en la versión nueva:**

```bash
# Elegir una frase textual introducida en este cambio (no una palabra genérica).
curl -s https://TU-DOMINIO/ruta | grep -c "la frase nueva y exacta"
# 0 → todavía NO está publicado. Esperar y repetir; no declarar desplegado.
```

> ⚠️ **Si el contenido se arma en el navegador, no aparece en el HTML.** Todo lo que dependa de
> parámetros de la URL, de datos guardados en el dispositivo o de una llamada posterior **no está**
> en la respuesta de `curl`, aunque el despliegue haya terminado. Ahí `grep` sobre el HTML da 0 y
> parece un fallo de publicación cuando no lo es.
>
> En ese caso la verificación se hace **abriendo la página y leyendo el DOM ya renderizado**
> (`document.querySelector('h1').innerText`), no el HTML crudo. Antes de dar por rota una
> publicación, comprobar cuál de los dos casos es.

**Bucle de espera recomendado** (en vez de "esperar un rato y mirar"):

```
repetir hasta 25 veces:
   cargar la página → ¿aparece la cadena nueva?
      sí  → publicado; anotar en qué intento
      no  → esperar 20s y repetir
si se agota → NO declarar desplegado; revisar build y logs del proveedor
```

---

## FRICCIONES CONOCIDAS DE PUBLICACIÓN (y su solución)

Cosas que rompen el trabajo sin ser errores del código. Documentadas para que nadie las diagnostique
dos veces:

| Síntoma | Causa real | Solución |
|---|---|---|
| `npm run build` falla con error de variable inválida, y en el navegador todo anda | El archivo de variables de producción descargado del proveedor trae los valores **enmascarados** (aparecen como `[SENSITIVE]` o similar), y el build los lee como valores reales | Apartar ese archivo, compilar con las variables de desarrollo, y **restaurarlo al terminar**. Nunca "arreglar" el archivo escribiendo secretos a mano (ver Protocolo Cero Secretos, `62`) |
| `git push` falla con "repositorio no encontrado" aunque el repo existe | La sesión de la CLI cambió a **otra cuenta** con la que el repo no es visible | Comprobar la cuenta activa **antes de cada push**, no solo al configurar. Si el proyecto se publica con una cuenta concreta, verificarla forma parte del ritual |
| El despliegue "no toma" un cambio de variables | Las variables se leen **en el momento del build** | Volver a desplegar después de cambiarlas (ya cubierto en `62`) |

---

Antes de cerrar el deploy, completar `PLANTILLA-CERTIFICADO-PUBLICACION.md` y verificar:

```text
[ ] origin = GitHub owner/repo = Vercel Connected Git Repository
[ ] Production Branch y Root Directory correctos
[ ] Supabase project-ref de cada ambiente comprobado antes de migrar
[ ] Preview nace de un push sin ejecutar Vercel CLI
[ ] Production nace del merge/push y su SHA coincide con /api/version
[ ] Segundo commit canario y su reversión generan deployments automáticos
[ ] Auth/OAuth/Resend/pagos/webhooks usan el dominio final
[ ] Ningún secreto de Production está disponible en Preview
```

Una URL viva con alguno de estos campos no verificado es `NO APTO`, no "casi listo".

### Estrategia de Rollback

Si algo se rompe en producción:
```
1. En Vercel Dashboard → Deployments
2. Encontrar el deployment anterior que funcionaba
3. Click "..." → "Promote to Production"
4. En <30 segundos el sitio vuelve a la versión anterior
5. Investigar qué se rompió en la versión nueva
6. Corregir, probar, y re-desplegar
```

Vercel mantiene historial de todos los deploys. Siempre se puede volver atrás.

#### Rollback de DB (lo que el rollback de Vercel NO cubre)

Promover un deploy anterior en Vercel revierte el CÓDIGO, pero NO revierte las migraciones ya aplicadas a la base de datos. Si la versión nueva corrió una migración (ej. renombró/borró una columna), el código viejo volverá a apuntar a un esquema que ya cambió y romperá igual.

```
- Migraciones destructivas con expand/contract (nunca un DROP de un solo paso):
    EXPAND  → agregar lo nuevo (columna/tabla) sin tocar lo viejo; deploy de código que escribe en ambos.
    MIGRATE → backfill de datos; el código nuevo ya lee de lo nuevo.
    CONTRACT → recién en un deploy POSTERIOR y estable, borrar lo viejo.
  Así el código viejo sigue funcionando contra el esquema nuevo y el rollback de Vercel es seguro.
- Tener SIEMPRE un script de reversión por migración (la migración "down"), probado en Preview.
- El esquema y el flujo declarativo de migraciones son canónicos en 25-BASE-DE-DATOS.md.
```

### Opción Simple: Vercel Analytics (Gratis)
```
1. En Vercel Dashboard → Analytics → Enable
2. Automáticamente trackea: pageviews, visitantes, países, dispositivos
3. No requiere código adicional
```

### Opción Recomendada: Plausible o Umami (Privacy-friendly)
```
1. Crear cuenta en plausible.io o umami.is
2. Agregar el script al <head>:
   <script defer data-domain="tuapp.com" src="https://plausible.io/js/script.js"></script>
3. Trackear eventos custom:
   plausible('Generate', { props: { type: 'proposal' } });
   plausible('Upgrade', { props: { plan: 'pro' } });
```

### Eventos a Trackear (mínimo)

> **La taxonomia canonica vive en `36` y el funnel comercial en `60`; usa `objeto_accion` y wrapper
> unico `track`.** Los nombres viejos de abajo son ilustrativos y quedan derogados: `purchase` se
> separa en `trial_iniciado` y `primer_cobro_confirmado`; `view_pricing` solo es `paywall_visto`
> cuando la oferta entra realmente al viewport. No instrumentes nombres ingleses heredados.

```javascript
// Eventos críticos que debemos medir (NOMBRES ILUSTRATIVOS — usar la taxonomía de 36):

// 1. ACTIVACIÓN
trackEvent('first_generation');      // Primera vez que genera algo
trackEvent('onboarding_complete');   // Completó el onboarding
trackEvent('signup');                // Se registró

// 2. ENGAGEMENT
trackEvent('generation', { type }); // Cada generación
trackEvent('copy_result');          // Copió un resultado
trackEvent('save_result');          // Guardó un resultado
trackEvent('return_visit');         // Volvió a la app

// 3. CONVERSIÓN
trackEvent('hit_free_limit');       // Alcanzó el límite gratuito
trackEvent('view_pricing');         // Vió la página de pricing
trackEvent('start_checkout');       // Inició el pago
trackEvent('purchase', { plan });   // Completó el pago

// 4. RETENCIÓN
trackEvent('day_streak', { days }); // Días consecutivos de uso
trackEvent('weekly_return');        // Volvió en la misma semana
```

---

## Integración de Pagos (si la app tiene tier Pro)

> **El DEFAULT de este SO es Hotmart** (producto suscripción + webhook con hottok, ideal para LATAM). El flujo COMPLETO —producto, área de miembros con la clase de acceso, dos planes con prueba de 7 días, webhook y emails— está paso a paso en `18-VENTA-HOTMART.md`. Lemon Squeezy/Stripe son **alternativas** solo si el caso lo justifica (mercados anglosajones o infra ya existente).

### Alternativa (no-default): Lemon Squeezy
```
Ventajas: 
- Gestiona IVA/impuestos internacionales automáticamente
- No necesitas entidad legal compleja
- Checkout embebido bonito

Setup:
1. Crear cuenta en lemonsqueezy.com
2. Crear producto con pricing mensual/anual
3. Obtener el link de checkout
4. Integrar en la app:
   <a href="https://tutienda.lemonsqueezy.com/checkout/buy/xxx">
     Desbloquear Pro
   </a>
5. Configurar webhook para actualizar el plan del usuario en Supabase
```

### Hotmart — EL DEFAULT del sistema (flujo completo en `18-VENTA-HOTMART.md`)
```
1. Producto tipo SUSCRIPCIÓN + área de miembros con UNA clase de acceso (requisito de aprobación)
2. Dos planes (mensual + anual) con prueba de 7 días activada en AMBOS
3. Webhook → verificar el HOTTOK → crear/actualizar el usuario en Supabase → Resend manda el acceso
→ Todos los pasos manuales en Hotmart, el código del webhook y los emails: ver 18-VENTA-HOTMART.md
```

### Alternativa (no-default): Stripe
```
Para mayor control y mejor experiencia de checkout:
1. Crear cuenta en Stripe
2. Stripe Checkout para pagos one-click
3. Stripe Customer Portal para que el usuario gestione su suscripción
4. Webhooks para sincronizar con Supabase
```

### Webhook de Pagos — La Pieza que Conecta Todo

Mencionar "configurar webhook" no basta. Sin esto, el usuario paga pero su plan nunca se activa.

> **NO dupliques el código del webhook aquí.** La implementación SEGURA y canónica vive en `18-VENTA-HOTMART.md` → sección "SEGURIDAD DEL WEBHOOK DE HOTMART". Esa versión hace lo que un webhook de pago de verdad necesita y que un snippet ingenuo se salta:
> - **Raw body** para verificar la firma (verificar sobre el body ya parseado da falsos positivos/negativos).
> - **Comparación en tiempo constante** del token/firma (evita timing attacks).
> - **Tabla `processed_events` para idempotencia** (dedup): el proveedor reintenta, y sin dedup se procesa el mismo evento dos veces.
> - **Máquina de estados** del plan (no un simple `update` por email, que falla si el perfil aún no existe → el cliente paga y no recibe nada).
>
> Usa esa implementación; no escribas una propia aquí.

**Probar el webhook ANTES de lanzar:** Stripe/Lemon Squeezy tienen modo test con eventos simulados; Hotmart tiene modo de prueba limitado — si no alcanza, se hace una compra REAL reembolsable (ver 18). Hacer una compra de prueba completa: pagar → webhook llega → plan cambia a 'pro' en la DB → la app desbloquea features. Si un eslabón falla, el usuario paga y no recibe nada — el peor bug posible.

---

## Checklist Pre-Launch

```
FUNCIONALIDAD
[ ] La app funciona en el URL de producción
[ ] Las variables de entorno están configuradas en producción
[ ] La API de IA funciona desde producción (no solo localhost)
[ ] Los pagos funcionan (si aplica) — hacer una compra de prueba
[ ] La autenticación funciona (si aplica)

SEGURIDAD
[ ] No hay API keys en el código fuente
[ ] Las variables de entorno están en Vercel, no en el código
[ ] Row Level Security está activo en Supabase (si aplica)
[ ] CORS configurado correctamente
[ ] HTTPS activo (Vercel lo hace automático)

ANALYTICS
[ ] El tracking de pageviews funciona
[ ] Los eventos custom se registran
[ ] Se puede ver el dashboard de analytics

SEO / SOCIAL
[ ] Title y description configurados
[ ] Open Graph tags para preview en redes sociales
[ ] Favicon configurado
[ ] La URL se ve bien cuando se comparte en WhatsApp/Twitter/LinkedIn

EXPERIENCIA
[ ] Probar en un celular real (no solo el emulador)
[ ] Probar con una conexión lenta (throttle en DevTools)
[ ] Probar el flujo completo como un usuario nuevo
[ ] Pedir a 1-2 personas reales que lo prueben sin instrucciones
```

---

## CI/CD — El Muro Automático Antes de Producción

El ritual de verificación de `12` (tsc → build → tests) depende de que el agente se acuerde. Un pipeline de CI lo convierte en un **muro**: si no pasa, no se mergea. Mínimo con GitHub Actions:

```yaml
# .github/workflows/ci.yml
name: CI
on: pull_request
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint                             # cero errores; policy de warnings explícita
      - run: npx tsc --noEmit                          # tipos
      - run: npm run build                             # build de producción
      - run: npm run test                              # lógica crítica real, no script vacío
      - run: npx playwright test                       # auth/pago/entitlement/a11y/visual
      - run: npm audit --omit=dev --audit-level=high   # dependencias (ver 27)
      - run: npx semgrep --config auto --metrics=off   # análisis estático (ver 27)
      # si la app usa IA: correr el golden set de evals (ver 31) como required check
```

### Release trazable y reconstrucción clean-room

Antes de promover producción, crear `docs/release/RELEASE-MANIFEST.json` con git SHA, deployment ID,
URL, última migración y fecha. Verificar una versión no sensible en producción (`/api/version` o
panel admin) contra ese SHA. Un ZIP, ESTADO.md y Vercel con commits distintos = NO VERIFICADO.

En CI o un entorno temporal, partir de clon limpio y proyecto DB vacío: `npm ci`, variables desde
`.env.example`, todas las migraciones, seed mínimo, lint/typecheck/test/build/E2E. El README debe
permitir hacerlo sin conocimiento oral. Si una tabla o variable se creó manualmente y no está en el
repo, el release no es reproducible y no se promueve. Ver Gate 9 de `61`.

```
REGLAS:
- Marcar el job como "required check" en la rama protegida → no se puede mergear si falla.
- Secretos vía `secrets:` del repo (Settings → Secrets), NUNCA en el YAML (ver 27 — CI agéntico).
- Migraciones: aplicarlas en el entorno PREVIEW de Supabase desde el PR, no a mano contra
  producción (ver 25, flujo declarativo). El deploy de Vercel ya es automático por push a main.
- Si la app usa IA: el golden set de evals (31) corre aquí — cambiar de modelo/prompt sin pasar
  los evals queda bloqueado, igual que un error de tipos.
```

---

## Post-Launch: Primeras 48 Horas

```
Hora 0-2: Monitorear
- ¿Hay errores en la consola de Vercel?
- ¿Los analytics registran visitas?
- ¿La API de IA funciona sin rate limits?

Hora 2-24: Observar
- ¿Cuántos usuarios se registran?
- ¿Cuántos completan su primera generación?
- ¿Alguien reporta errores?

Hora 24-48: Evaluar
- Revisar métricas vs. objetivos de Fase 1
- Identificar los drop-offs más grandes
- Priorizar los 3 fixes/mejoras más urgentes
```

---

## Entregable de Fase 7
- App desplegada en URL accesible
- Analytics configurado y recibiendo datos
- Pagos funcionando (si aplica)
- Checklist pre-launch completado

### Criterios de Salida de Fase 7
- [ ] La app está viva en una URL pública
- [ ] Al menos 1 persona real (que no sea el creador) la usó exitosamente
- [ ] Los analytics registran eventos
- [ ] El flujo de pago funciona (si aplica)
- [ ] No hay errores críticos en producción

→ **La app está lista. Felicitaciones. Ahora a iterar basándose en datos reales.**
