# STACK PINEADO — El Scaffold de Referencia que Compila a la Primera

> **Cuándo cargar este archivo:**
> - Al ARRANCAR cualquier proyecto nuevo (antes de escribir la primera línea de código)
> - Cuando el proyecto no compila y sospechas de versiones/estructura (drift de dependencias)
> - Junto con `05-CREACION.md` (creación) y `28-INGENIERIA-NEXTJS.md` (patrones Next)
>
> ⚠️ **REGLA DE VIGENCIA: este archivo se revisa cada 6 meses. Fecha de última verificación: JULIO 2026.**
> Las majors de `next`, `tailwindcss` y `@supabase/ssr` fueron verificadas por web en esa fecha;
> el resto lleva la major conocida — confirmar con `npm outdated` tras instalar. Si han pasado
> más de 6 meses desde la fecha de arriba, verificar TODO antes de confiar en los pines.

## Objetivo

El mayor punto de no-determinismo del SO era ensamblar el stack "desde prosa": cada proyecto adivinaba versiones, flags del CLI y estructura, y a veces nacía roto. Este archivo es el **scaffold canónico**: comandos exactos, versiones pineadas por major, estructura de carpetas y checklist de verificación. Objetivo: que `create-next-app` + este archivo produzcan un proyecto que **compila a la primera**, siempre igual.

---

## 1. ARRANQUE DEL PROYECTO — comandos exactos

### Opción A (default): Next.js App Router

```bash
npx create-next-app@latest mi-app \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --no-src-dir \
  --turbopack \
  --import-alias "@/*"
```

Si el CLI pregunta algo (las flags de arriba responden casi todo), responder así:

```
Would you like to use TypeScript?            → Yes
Would you like to use ESLint?                → Yes
Would you like to use Tailwind CSS?          → Yes   (instala Tailwind v4, CSS-first)
Would you like your code inside a `src/`?    → No    (estructura canónica del SO: app/ en la raíz)
Would you like to use App Router?            → Yes   (SIEMPRE — el SO no usa Pages Router)
Would you like to use Turbopack?             → Yes   (default en Next 16)
Would you like to customize the import alias? → No   (dejar el default @/*)
```

> **Verificado jul-2026:** `create-next-app@latest` instala **Next 16** (React 19, Turbopack default,
> Node mínimo 20). Los patrones de `28-INGENIERIA-NEXTJS.md` (RSC, `params`/`cookies` async, fetch
> sin caché por defecto) aplican. Node local recomendado: **22 LTS** (el mismo del CI, ver 08).

### Opción B: Vite (solo herramienta tras login, sin SEO ni API routes — decisión de `12`)

```bash
npm create vite@latest mi-app -- --template react-ts
cd mi-app && npm install
npm install tailwindcss @tailwindcss/vite    # Tailwind v4 vía plugin de Vite
```

En `vite.config.ts` añadir `tailwindcss()` a `plugins`; en el CSS de entrada: `@import "tailwindcss";`.
El resto de este archivo aplica igual (semilla de dependencias, estructura, .env), quitando lo exclusivo de Next (`@supabase/ssr`, App Router).

### shadcn/ui (siempre, después del scaffold)

```bash
npx shadcn@latest init      # detecta Tailwind v4 y App Router solo
# Preguntas del init: Style → "new-york" (default) · Base color → Neutral ·
# CSS variables → Yes (OBLIGATORIO: los tokens del 10 viven en variables)
npx shadcn@latest add button card input dialog skeleton   # añadir por componente, no todo
```

> **Plantillas de código del SO (v6):** tras el scaffold, el proyecto COPIA `plantillas-codigo/`
> del SO: `plantillas-codigo/landing/` → `components/landing/` (el KIT canónico de la página de
> ventas — doctrina en `55` "EL KIT PRIMERO" y en su README) y su `tokens.css` importado en
> `app/globals.css`, listo para tematizar con FICHA-ARTE.md. La landing se compone desde ese
> kit, no desde cero.

---

## 2. `package.json` SEMILLA — majors pineadas (jul-2026)

Rangos `^` sobre la major correcta. Los números exactos de patch los resuelve `npm install`; lo que NO se adivina es la major.

```jsonc
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "^16.2.0",                     // VERIFICADO por web jul-2026 (16.x estable desde oct-2025)
    "react": "^19.0.0",                    // la que trae Next 16
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.0.0",     // verificar con npm outdated
    "@supabase/ssr": "^0.12.0",            // VERIFICADO por web jul-2026: sigue en 0.x → pinear el MINOR
                                           // (en 0.x cada minor puede romper; ver nota abajo)
    "zod": "^4.0.0",                       // verificar con npm outdated
    "motion": "^12.0.0",                   // import desde "motion/react" (ver 22) — verificar
    "lucide-react": "^0.525.0",            // 0.x: actualiza seguido, cualquier 0.x reciente sirve — verificar
    "@phosphor-icons/react": "^2.0.0",     // verificar con npm outdated
    "recharts": "^3.0.0"                   // verificar con npm outdated
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0",               // VERIFICADO por web jul-2026 (v4 CSS-first; 4.3.x vigente)
    "@tailwindcss/postcss": "^4.0.0",      // lo instala create-next-app; en Vite: @tailwindcss/vite
    "vitest": "^3.0.0",                    // verificar con npm outdated (posible v4)
    "@playwright/test": "^1.50.0",         // verificar con npm outdated
    "@axe-core/playwright": "^4.0.0"       // gate de accesibilidad del CI (ver 06)
  }
}
```

```
NOTAS DE PINEADO:
- shadcn/ui NO es dependencia: es un CLI (npx shadcn@latest) que copia componentes a components/ui/.
- @supabase/ssr está en 0.x: ahí el "major" real es el MINOR (^0.12.0 NO acepta 0.13). Si npm
  avisa de un 0.13+, leer el changelog antes de subir — la API de cookies ya cambió una vez
  (get/set/remove → getAll/setAll, ver 09/26).
- Tras el primer install, correr `npm outdated` y anotar en ESTADO.md cualquier major nueva
  que decidas NO adoptar todavía (decisión explícita, no accidente).
- Lo que NO va: axios (fetch nativo), moment (Intl/date-fns), styled-components (Tailwind),
  redux (estado de servidor = RSC/SWR; estado local = useState/zustand si hace falta).
```

---

## 3. ESTRUCTURA DE CARPETAS CANÓNICA

```
mi-app/
├── app/                          # App Router: rutas, layouts, route handlers
│   ├── layout.tsx                # root layout: fuentes, tokens, providers
│   ├── page.tsx                  # landing (o redirect a /app si es hard paywall)
│   ├── globals.css               # @import "tailwindcss" + tokens + @theme (ver §4)
│   ├── (app)/                    # grupo autenticado: /app, /ajustes...
│   └── api/                      # BFF: SOLO route handlers (generate, webhooks/hotmart)
│       └── generate/route.ts
├── components/
│   ├── ui/                       # lo que copia shadcn (NO editar a mano salvo theming)
│   └── app/                      # componentes propios del producto (PascalCase)
├── lib/                          # lógica sin React: utils, adaptadores, validaciones zod
│   ├── supabase/
│   │   ├── client.ts             # createBrowserClient (@supabase/ssr) — clave publishable
│   │   ├── server.ts             # createServerClient con cookies — para RSC/handlers
│   │   └── admin.ts              # createClient con SECRET key — SOLO servidor (rate limit, webhooks)
│   ├── ai-adapter.ts             # generateText/generateImage — abstracción de proveedor (30)
│   └── rate-limit.ts             # implementación canónica del 09
├── hooks/                        # hooks propios (useX.ts)
├── middleware.ts                 # refresh de sesión Supabase + CSP con nonce (09/26)
├── .env.example                  # §6 — commiteado; .env.local NUNCA (gitignore)
└── supabase/migrations/          # SQL versionado (25)
```

> **Nota Next 16:** el middleware fue renombrado a `proxy.ts` (`middleware.ts` sigue funcionando
> pero está deprecado). Usar el nombre de archivo que el scaffold pineado genere y NO mezclar
> ambos en el mismo proyecto.

Regla: si un archivo no sabe dónde va → `lib/` si no importa React, `components/app/` si renderiza, `hooks/` si es un hook. Nada de carpetas `utils/`, `helpers/`, `common/` paralelas.

---

## 4. TAILWIND v4 — CSS-first con `@theme` (no crear `tailwind.config.js`)

En v4 **no existe `tailwind.config.js`**: la configuración vive en `app/globals.css`. El patrón canónico completo —tokens semánticos en `:root`/`[data-theme]` + `@theme inline` que los expone como utilidades— **ya está escrito en `10-DESIGN-TOKENS.md` → "Integración con Tailwind CSS" → "Tailwind v4 (CSS-first, `@theme`)"**. Ese es la fuente de verdad; NO lo dupliques ni lo reinventes aquí. Esqueleto mínimo para reconocerlo:

```css
/* app/globals.css */
@import "tailwindcss";

:root { /* tokens semánticos del 10 (modo derivado en 16) */ }
[data-theme="light"] { /* variante */ }

@theme inline {
  /* mapeo token → utilidad, copiar del 10 tal cual */
  --color-surface-base: var(--surface-base);
  /* ... */
}
```

```
REGLAS v4 (recap del 10):
1. NO crear tailwind.config.js en proyectos nuevos — todo va en @theme.
2. @theme inline cuando el valor es una var() que cambia con el tema (sin inline se congela en build).
3. Los tokens semánticos del 10 son la fuente de verdad; @theme solo los expone.
```

---

## 5. CLAVES DE SUPABASE — nomenclatura NUEVA (publishable/secret)

Supabase reemplazó las claves legacy basadas en JWT por **API keys dedicadas**. Los proyectos nuevos traen las nuevas; muchos tutoriales viejos (y modelos de IA) siguen hablando de `anon`/`service_role` — esta tabla traduce:

| Clave NUEVA | Formato | Equivalente legacy | Dónde vive | Expuesta al browser |
|---|---|---|---|---|
| **Publishable key** | `sb_publishable_...` | `anon` key (JWT `eyJ...`) | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ Sí — diseñada para eso, protegida por RLS |
| **Secret key** | `sb_secret_...` | `service_role` key (JWT `eyJ...`) | `SUPABASE_SECRET_KEY` (SIN `NEXT_PUBLIC_`) | ❌ JAMÁS — salta RLS; solo servidor |

```
DÓNDE ENCONTRARLAS (dashboard actual, jul-2026):
Dashboard → tu proyecto → Project Settings → API Keys.
- Pestaña "API Keys": las nuevas (sb_publishable_... visible; sb_secret_... se crea/revela ahí,
  se pueden crear VARIAS secret keys con nombre y revocarlas individualmente — úsalo: una por entorno).
- Pestaña "Legacy API Keys": las viejas anon/service_role (JWT). En proyectos nuevos, NO usarlas;
  en proyectos existentes, migrar y luego deshabilitarlas desde esa misma pestaña.

REGLAS:
- Los clientes de @supabase/ssr y supabase-js aceptan la publishable key en el mismo parámetro
  donde antes iba la anon key (y la secret donde iba service_role). No cambia el código, cambia el valor.
- Rotación: las nuevas claves se revocan/rotan desde el dashboard sin re-firmar JWTs. Si una secret
  key tocó un chat/log/repo → revocarla YA y crear otra (regla de comunicación del CLAUDE.md).
- La URL del proyecto sigue igual: Project Settings → API → Project URL (https://<ref>.supabase.co).
```

---

## 6. `.env.example` CANÓNICO (commiteado; los valores reales van en `.env.local` y en Vercel)

```bash
# ── IA (SIEMPRE en env var, nunca hardcodeado — ver 30) ─────────────────────
AI_MODEL=claude-sonnet-4-6            # routing por capacidad en 30; verificar ID vigente
AI_MODEL_FALLBACK=                    # modelo del proveedor secundario (adaptador, 30)
IMAGE_MODEL=                          # verificar proveedor/ID/precio vigentes (30)
VIDEO_MODEL=                          # solo si hay video; fair-use durísimo (30)
ANTHROPIC_API_KEY=                    # SOLO servidor — jamás NEXT_PUBLIC_
AI_DAILY_BUDGET_USD=20                # kill-switch de gasto global (30)

# ── Supabase (nomenclatura nueva, ver §5) ───────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxx   # pública por diseño (RLS la protege)
SUPABASE_URL=https://xxxx.supabase.co                      # la misma URL, para el lado servidor
SUPABASE_SECRET_KEY=sb_secret_xxxx                         # SOLO servidor (equivale a service_role)

# ── Email transaccional (Resend, ver 18/46) ─────────────────────────────────
RESEND_API_KEY=                       # SOLO servidor
EMAIL_FROM=hola@tudominio.com         # dominio propio verificado en Resend

# ── Venta (Hotmart, ver 18) ─────────────────────────────────────────────────
HOTMART_HOTTOK=                       # verifica la firma del webhook — SOLO servidor

# ── Analítica (PostHog, ver 36) ─────────────────────────────────────────────
NEXT_PUBLIC_POSTHOG_KEY=              # clave de proyecto (pública, solo escritura)
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
POSTHOG_KEY=                          # para eventos server-side
POSTHOG_HOST=https://us.i.posthog.com
```

```
REGLAS DE ENV:
- NINGÚN secreto lleva prefijo NEXT_PUBLIC_ (se incrusta en el bundle — ver 09). Los únicos
  NEXT_PUBLIC_ legítimos: URL de Supabase, publishable key, claves de analytics.
- .env.local en .gitignore (create-next-app ya lo trae — VERIFICAR antes del primer commit).
- `.tsbuildinfo-hook` en .gitignore (cache del typecheck incremental de los hooks de Claude Code).
- Fail-closed: la app debe CRASHEAR al arrancar si falta un secreto requerido (validar las env
  con zod en lib/env.ts), no correr con uno de juguete (09).
- Producción: las mismas variables se cargan en Vercel (08), con proyecto Supabase SEPARADO de dev.
```

---

## 7. CHECKLIST DE VERIFICACIÓN POST-SCAFFOLD (antes de escribir la primera feature)

```
[ ] node --version → 22.x (o ≥20; el CI usa 22, ver 08)
[ ] npm install termina sin errores ni peer-dependency warnings graves
[ ] npx tsc --noEmit → limpio
[ ] npm run build → limpio (Next 16/Turbopack)
[ ] npm run dev → arranca, consola del navegador SIN errores
[ ] http://localhost:3000 renderiza la página inicial (ábrela y MÍRALA — Regla 7 del CLAUDE.md)
[ ] globals.css tiene @import "tailwindcss" + una utilidad de prueba aplicada y visible
    (ej. un div bg-red-500: si no pinta, Tailwind v4 no está cableado)
[ ] npx shadcn@latest add button → el botón renderiza con los tokens (CSS variables activas)
[ ] .env.local creado desde .env.example y en .gitignore (git status NO lo muestra)
[ ] Cliente Supabase conecta: un select simple a una tabla de prueba responde (o error claro de RLS)
[ ] npm outdated corrido → resultado anotado en ESTADO.md (majors nuevas: decisión explícita)
[ ] ESTADO.md creado con: fecha del scaffold, versiones instaladas (npm ls --depth=0), decisiones
```

> Si TODO lo de arriba pasa, el proyecto "compila a la primera" quedó garantizado — cualquier error
> posterior es de la feature, no del scaffold. Si algo falla aquí, arreglarlo ANTES de construir:
> un scaffold roto contamina todo lo que se construye encima.

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

- **`05-CREACION.md` / `28-INGENIERIA-NEXTJS.md`**: qué construir sobre este scaffold y con qué patrones.
- **`10-DESIGN-TOKENS.md`**: la fuente de verdad del `@theme` de Tailwind v4 (§4 solo la referencia).
- **`09-SEGURIDAD.md` / `26-AUTH-MODERNO.md`**: BFF, middleware de sesión, rate limiting canónico.
- **`22-LIBRERIAS-Y-CRAFT.md`**: cómo usar motion/lucide/phosphor/recharts que este archivo pinea.
- **`08-DEPLOY.md`**: CI con Node 22 y las mismas env vars en Vercel.
- **`25-BASE-DE-DATOS.md`**: las migraciones que viven en `supabase/migrations/`.
