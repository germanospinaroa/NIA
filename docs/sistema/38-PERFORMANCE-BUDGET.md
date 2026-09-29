# PERFORMANCE BUDGET — El Peso es Churn (LATAM)

> **Cuándo cargar este archivo:**
> - Al decidir la arquitectura del frontend (junto con `28-INGENIERIA-NEXTJS.md`)
> - Antes del deploy, para poner el GATE de performance en el CI (junto con `08-DEPLOY.md`)
> - Cuando la app empieza a sentirse lenta en dispositivos reales (no en tu laptop)

## Objetivo
Poner un techo medible al peso de la app y hacerlo cumplir AUTOMÁTICAMENTE en el CI, no a ojo. Un presupuesto de performance es un número que el merge no puede exceder. Sin él, cada PR agrega 20KB "que no se notan" hasta que la app pesa 800KB y no carga en un Android de gama media con 3G — que es el dispositivo y la red promedio del usuario LATAM al que le quieres vender.

---

## POR QUÉ ESTO ES CRÍTICO EN LATAM (no es opcional)

```
- El dispositivo promedio NO es tu iPhone ni tu MacBook: es un Android de gama media-baja
  (CPU lenta, poca RAM) sobre 4G congestionada o 3G. Ese teléfono PARSEA y EJECUTA JS
  mucho más lento que tu máquina de desarrollo — un bundle que vuela en tu laptop puede
  congelar 4 segundos el hilo principal en ese dispositivo.
- El peso es churn directo: cada 100ms de demora y cada 100KB de JS extra bajan la conversión.
  El usuario que espera 6 segundos a que cargue NO espera — cierra y no vuelve. No hay paywall
  que rescate a quien nunca vio la promesa, el onboarding o la primera pantalla de valor.
- El costo recae en el usuario dos veces: en tiempo (espera) y en DATOS (los planes prepago
  cobran por MB). Una app pesada literalmente le cuesta dinero abrirla. Eso es fricción de venta.
- Tu demo miente: la mides en wifi con un dispositivo caro. El budget existe para que el número
  refleje al usuario real, no a ti.
```

La regla mental: **el JS es el recurso más caro que envías**. Una imagen pesada bloquea una imagen; 200KB de JS bloquea el hilo principal entero (parse + compile + execute) en un teléfono lento. Por eso el budget de JS es más estricto que el de cualquier otro asset.

---

## EL BUDGET POR RUTA (números concretos, medidos en campo p75)

El budget se mide en el **percentil 75 de campo** (usuarios reales, no Lighthouse de laboratorio). Lo que importa es la cola lenta, no el promedio.

```
CORE WEB VITALS (p75 de campo — los mismos umbrales de Google):
LCP (Largest Contentful Paint)   < 2.5 s     contenido principal visible
INP (Interaction to Next Paint)  < 200 ms    respuesta a la interacción
CLS (Cumulative Layout Shift)    < 0.1       el layout no "salta"

PESO POR RUTA (brotli, lo que de verdad descarga el navegador en Vercel):
First Load JS (ruta crítica, agregado)  < ~170 KB brotli ← el número que más cuidas
CSS                                     < ~50 KB brotli
Imagen del hero (LCP, asset servido)    < ~150 KB        WebP/AVIF, dimensionada (tras next/image)
Fuentes (web)                           ≤ 2 pesos, subset, woff2, next/font

⚠️ El budget se mide en BROTLI, no gzip. Vercel sirve brotli por defecto, que pesa ~15-20%
   menos que gzip. Si mides en gzip, tu número del CI NO corresponde a los bytes reales que
   recibe el usuario — donde uses size-limit (CSS, libs), fija la métrica ("brotli": true).
   "First Load JS" = el conjunto de chunks que la ruta carga en la primera visita (webpack +
   framework + main-app + page-*), NO un solo main-*.js NI la suma de todos los chunks del
   build (eso incluiría los lazy). Es el número POR RUTA que reporta la tabla de `next build`.
```

```
BUDGET DIFERENCIADO POR TIPO DE RUTA (no todas pesan igual):
- Landing / página pública (debe convertir en frío)  → JS < 130 KB   LCP < 2.0 s
- Pantalla core / dashboard (tras login)              → JS < 170 KB   INP < 200 ms
- Ruta secundaria (settings, perfil)                  → lazy; no carga en el bundle inicial
```

> Estos números son el DEFAULT sensato para una app de IA vendible en LATAM, no dogma de física. Si tu app justifica más (un editor complejo), súbelo a propósito y documenta por qué — pero el budget sigue existiendo y el CI sigue siendo el GATE. Un budget que nadie hace cumplir no es un budget, es un deseo.

---

## CÓMO MEDIR (campo vs laboratorio — no confundirlos)

```
CAMPO (lo que viven los usuarios reales — es lo que cuenta para el budget):
- CrUX / PageSpeed Insights: datos reales p75 de Chrome. Es la fuente de verdad del budget.
- Web Vitals en PRODUCCIÓN: la librería `web-vitals` reporta LCP/INP/CLS de cada sesión real
  → enviar esos eventos a tu analítica (ver `36-ANALITICA-Y-EVENTOS.md`). Así ves el p75 real
  de TU base de usuarios LATAM, no el promedio global de Google.

LABORATORIO (reproducible, para el CI y para depurar — NO es el budget final):
- Lighthouse CI: corre en cada PR con throttling de CPU/red simulando gama media. Es el GATE.
- Lighthouse / PSI manual: auditoría puntual al depurar.
```

```
⚠️ NO uses DevTools → Performance para medir INP de campo.
   DevTools mide TU interacción en TU máquina: es útil para encontrar la long task culpable,
   pero NO es el INP real de tus usuarios. El INP que cuenta para el budget viene de CAMPO
   (CrUX / web-vitals en producción). Confundir laboratorio con campo es el error #1:
   "en mi máquina da 80ms" no significa nada si el p75 de campo es 340ms.
```

```ts
// Reportar Web Vitals de campo desde producción → tu analítica (36-ANALITICA-Y-EVENTOS)
// app/web-vitals.tsx — Client Component montado una vez en el layout
'use client';
import { useReportWebVitals } from 'next/web-vitals';
import { track } from '@/lib/analytics';   // wrapper de analítica de 36-ANALITICA-Y-EVENTOS

export function WebVitals() {
  useReportWebVitals((metric) => {
    // metric: { name: 'LCP'|'INP'|'CLS'|..., value, rating, id, navigationType }
    track('web_vital', {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,                // 'good' | 'needs-improvement' | 'poor'
      id: metric.id,                        // id único de la medición → deduplica en la analítica
      navigationType: metric.navigationType, // 'navigate' | 'reload' | 'back-forward' | 'prerender'
      route: window.location.pathname,
    });
  });
  return null;
}
```

---

## LA MÉTRICA QUE IMPORTA EN UN EMBUDO: TIEMPO HASTA LA PRIMERA PREGUNTA

El peso en kilobytes es un buen indicador general, pero **puede llevar a la conclusión contraria**
en las pantallas que deciden el negocio. Lo que hace que alguien abandone no es el peso: es cuánto
tarda en poder **hacer algo**.

Caso que ilustra el patrón: una pantalla de onboarding tardaba casi el doble en mostrar su titular
que la landing… **pesando menos**. La causa no era el peso, era que se renderizaba entera en el
navegador: mientras la landing llegaba con su HTML hecho, el onboarding llegaba vacío y tenía que
construirse.

```
Medición que importa en cada pantalla del embudo, en gama media con red móvil:

  tiempo hasta que la PRIMERA ACCIÓN es tocable
  (no "HTML listo", no "kilobytes", no "carga completa")
```

**La regla estructural:** la primera pantalla de cualquier embudo se **renderiza en el servidor**.
Todo lo que dependa de datos del dispositivo (progreso guardado, preferencias, sesión) se restaura
**después**, sobre algo que ya está pintado. Una pantalla 100% cliente llega en blanco, y en la
pantalla donde más gente se pierde eso es carísimo.

> ⚠️ Este es el motivo por el que el presupuesto de este archivo se mide **por ruta** y no como
> promedio del sitio: la ruta que recibe el tráfico pago es la que tiene que cumplir, aunque las
> demás sean más pesadas.

### El peso de la medición también se mide

Los scripts de terceros (píxeles de anuncios, analítica, chat de soporte) suelen ser **el archivo
más grande del sitio** y compiten con el contenido por el mismo ancho de banda. Hay que conocer su
tamaño y decidir a conciencia:

| Estrategia | Qué gana | Qué cuesta |
|---|---|---|
| Cargarlo antes que nada | No pierde ningún evento | Retrasa la primera acción |
| Cargarlo después de la interactividad | La pantalla responde antes | Puede perder eventos de quien rebota rápido |

No hay respuesta universal: en una pantalla de embudo pagado, perder eventos tempranos rompe la
atribución; en una pantalla de contenido, no. **Decidirlo explícitamente y anotarlo**, en vez de
heredar el valor por defecto del fragmento que pegó la plataforma.

---

## CÓMO HACERLO CUMPLIR (GATE en el CI — el corazón de este archivo)

Un budget sin enforcement automático SIEMPRE se erosiona. La regla: **si un PR excede el budget, el merge FALLA**. Dos herramientas, complementarias:

### Gate de First Load JS POR RUTA — medir lo que `next build` reporta (no la suma de chunks)

```
⚠️ NO uses una config de size-limit que agregue `.next/static/chunks/**/*.js`: ese glob suma
   TODOS los chunks del build — incluidos los LAZY (next/dynamic, below-the-fold) que NO cargan
   en la primera visita — así que el gate mediría otra cosa y fallaría (o pasaría) por razones
   falsas. La métrica correcta es el "First Load JS" POR RUTA: la imprime la tabla de
   `next build`, y `@next/bundle-analyzer` (ANALYZE=true next build) la desglosa chunk a chunk.
```

```js
// scripts/check-first-load.mjs — GATE: falla si la ruta crítica supera su budget.
// Uso en CI: next build | tee build.log  →  node scripts/check-first-load.mjs build.log
import fs from 'node:fs';

const BUDGET_KB = { '/': 130, '/app': 170 };   // budgets POR RUTA (tabla de arriba)
const log = fs.readFileSync(process.argv[2] ?? 'build.log', 'utf8');
let failed = false;
for (const [route, limit] of Object.entries(BUDGET_KB)) {
  // fila de la tabla de `next build`: "┌ ○ /app  12.3 kB  145 kB" — la ÚLTIMA cifra es First Load JS
  const re = new RegExp(String.raw`[┌├└]\s+[○●ƒλ]\s+${route.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}\s.*?([\d.]+)\s*kB\s*$`, 'm');
  const m = log.match(re);
  if (!m) { console.error(`⚠️ no encontré la ruta ${route} en el output de next build`); failed = true; continue; }
  const kb = parseFloat(m[1]);
  if (kb > limit) { console.error(`❌ ${route}: First Load JS ${kb} kB > budget ${limit} kB`); failed = true; }
  else console.log(`✅ ${route}: First Load JS ${kb} kB ≤ ${limit} kB`);
}
process.exit(failed ? 1 : 0);
```

> La cifra de `next build` no es byte a byte el brotli que sirve Vercel, pero es ESTABLE y por
> ruta: como gate de regresión en cada PR es lo que importa. Para investigar POR QUÉ subió, el
> desglose visual es `@next/bundle-analyzer` (`ANALYZE=true next build`).

> **`size-limit` no se tira — se re-enfoca:** queda SOLO para lo que sí es un archivo/entrada
> aislada — el CSS (`.next/static/css/*.css`, con `"brotli": true`) y presupuestos de libs
> puntuales (ej. que `motion` no crezca de versión en versión) — nunca para el First Load JS
> de la app.

```jsonc
// package.json — los scripts que el CI ejecuta
{
  "scripts": {
    "build:log": "next build | tee build.log",
    "size": "node scripts/check-first-load.mjs build.log && size-limit"  // ≠ 0 si excede → rompe el merge
  }
}
```

### Lighthouse CI — gate de WEB VITALS de laboratorio

```js
// lighthouserc.js — assertions que FALLAN el build si no se cumplen
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/', 'http://localhost:3000/app'],
      settings: {
        // ⚠️ Sin esto, Lighthouse CI corre con el default y NO simula el dispositivo LATAM real.
        // Forzamos perfil MÓVIL de gama media + throttling de CPU/red (no la máquina del CI):
        formFactor: 'mobile',
        screenEmulation: { mobile: true, width: 360, height: 640, deviceScaleFactor: 2 },
        throttling: {                       // simulación de gama media sobre 4G lenta
          rttMs: 150,
          throughputKbps: 1638,             // ~Slow 4G
          cpuSlowdownMultiplier: 4,         // CPU 4x más lenta = Android de gama media
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],  // 2.5s
        'cumulative-layout-shift':  ['error', { maxNumericValue: 0.1 }],
        // NOTA: NO usamos `total-byte-weight` como gate del "first-load 400KB": suma TODOS
        // los recursos de la página (above + below the fold + lazy), no la primera vista.
        // El First Load JS por ruta lo mide el gate sobre el output de `next build` (arriba);
        // el CSS y las libs puntuales, size-limit.
        // INP NO tiene assertion aquí: es métrica de CAMPO, no se controla en laboratorio.
      },
    },
  },
};
```

> **INP no tiene gate de laboratorio** (es correcto): el INP solo se mide bien con interacciones
> reales de usuarios, no en una corrida headless de Lighthouse. Su control NO es el CI sino una
> **alerta en analítica (36) sobre el p75 de campo** — si el p75 de INP cruza 200 ms en producción,
> salta la alerta. El gate de laboratorio cubre LCP/CLS y el peso del bundle; INP se vigila en campo.

> **El "cómo" del INP <200ms vive en el 28.** Medir y alertar no baja el INP; lo bajan los
> patrones de RENDER del cliente: estado derivado en render (no en effects), `useDeferredValue`/
> `startTransition` para no trabar el input, inputs no controlados por defecto, lazy init de
> `useState`, suscribirse a booleanos derivados. En el Android lento LATAM (CPU 4x), un render
> que hace trabajo de más es lo que cruza los 200ms. Ver **"OPTIMIZACIÓN DE RE-RENDER (INP)"
> en `28-INGENIERIA-NEXTJS.md`** — aquí está el GATE; allá está la técnica que lo cumple.

```yaml
# Fragmento del ci.yml de 08-DEPLOY.md — performance como GATE de merge
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build:log                     # next build | tee build.log
      - run: npm run size                          # gate First Load JS por ruta + size-limit (CSS/libs)
      - run: npx lhci autorun                       # Lighthouse CI: falla si baja de los umbrales
```

> Esto se conecta con el `ci.yml` de `08-DEPLOY.md` y con la sección de TESTING AUTOMATIZADO de `06-TESTING.md`: tsc + build + vitest + playwright + lighthouse/gate de first-load son TODOS gates del mismo pipeline. Ninguno es opcional antes de mergear a main.

---

## TÉCNICAS NEXT.JS PARA CABER EN EL BUDGET

El framework te da casi todo gratis si usas los patrones correctos del App Router (detalle en `28-INGENIERIA-NEXTJS.md`):

```
ENVIAR MENOS JS:
- RSC por defecto: un Server Component NO manda su JS al cliente. La forma #1 de bajar el bundle
  es que el código corra en el servidor. 'use client' solo en la HOJA interactiva (ver 28).
  OJO: RSC no manda JS, PERO su payload serializado (el árbol RSC) SÍ viaja por la red —
  mantén el árbol acotado y no serialices datos enormes hacia el cliente.
- Code splitting con next/dynamic: lo NO crítico (modales, gráficos, editores pesados) se carga
  bajo demanda, no en el first load.
    const Chart = dynamic(() => import('./Chart'), { ssr: false });  // fuera del bundle inicial
- Lazy de lo below-the-fold: lo que no se ve al cargar no debe bloquear el LCP.

ASSETS QUE NO PESEN NI MUEVAN EL LAYOUT:
- next/image: WebP/AVIF automático, dimensiones explícitas (mata el CLS), priority en el hero (LCP),
  sizes correcto para no servir un 4K a un móvil. El budget de imagen (~150KB) aplica al asset
  SERVIDO al usuario TRAS la transformación de next/image, no al original en el repo. Cuidado a
  escala: cada transformación tiene costo (ver 13-INFRA-ESCALABILIDAD por caché/CDN de imágenes).
- next/font: auto-host + preload + subset, cero parpadeo de fuente, cero request externo bloqueante.

NO ARRASTRAR LIBRERÍAS PESADAS (el asesino silencioso del budget):
- Antes de instalar, revisa el costo en bundlephobia (cifra "min+gz", lo que pesa minificado y
  comprimido). moment (~22KB min+gz) → date-fns (import puntual) / Temporal / Intl nativo.
  lodash entero (~25KB min+gz) → import puntual o utilidades nativas. Charts pesada → liviana o SVG.
- Una sola dependencia gorda puede reventar el budget de JS de toda la ruta. Enlaza con la
  disciplina de dependencias de 22 y los patrones de 28.
```

```
BARREL FILES — el asesino silencioso del bundle (rompe el budget "sin agregar nada"):
- Un barrel es un index.ts que re-exporta todo un paquete: `export * from './a'; export *
  from './b'`. Al hacer `import { Icono } from 'lib-de-iconos'` (la raíz/barrel), muchos
  bundlers arrastran el MÓDULO ENTERO porque no pueden probar que el resto no tiene efectos
  → el tree-shaking muere y metes 300 iconos para usar 3.
- Por eso un PR que "solo importó un helper" sube el First Load 40KB: no agregaste código,
  importaste por el barrel. El budget se rompe sin que se note en el diff.
- FIX: importar la RUTA DIRECTA del símbolo, no el barrel:
    ❌ import { Search } from 'lucide-react';          // barrel: riesgo de arrastrar todo
    ✅ import Search from 'lucide-react/icons/search'; // ruta directa: solo ese módulo
- En Next: `optimizePackageImports` (next.config) reescribe los imports de barrel de paquetes
  conocidos a rutas directas automáticamente. Útil, pero NO sustituye revisar tus propios
  barrels internos (el index.ts de tu carpeta /components también puede matar el tree-shaking).
- Verifícalo con @next/bundle-analyzer: si un chunk pesa raro, casi siempre es un barrel.
```

```
CARGAR A TIEMPO LO QUE IMPORTA, DIFERIR LO QUE NO:
- Preload en hover/focus: precargar el chunk de una ruta/modal cuando el usuario muestra
  INTENCIÓN (pasa el mouse o tabula al link), no antes. Para cuando hace click, ya está.
    <Link prefetch> de next/link hace esto para rutas; para imports propios, dispara
    import('./Modal') en onMouseEnter/onFocus del trigger.
- Diferir analytics/logging a POST-HYDRATION: el script de analítica, el de errores, el chat
  de soporte → NO deben competir con el render inicial por el hilo. Cárgalos tras hidratar
  (next/script con strategy="afterInteractive" o "lazyOnload"), no en el camino del LCP/INP.
```

---

## PERFORMANCE DE RUNTIME DE ANIMACIÓN (jank, no peso)

El budget de arriba es de PESO (bytes que descargas). Esta sección es de RUNTIME: una animación puede pesar 0KB extra y aun así tirar frames y reventar el INP. El jank que se ve en el Android de gama media LATAM casi siempre nace de animar **la propiedad equivocada**, no de un bundle gordo.

```
LA REGLA (innegociable): animar SOLO transform y opacity.
- transform (translate/scale/rotate) y opacity las resuelve la GPU en el COMPOSITOR, sin
  recalcular layout ni repintar. Son las dos propiedades baratas. Punto.
- Animar width/height/top/left/margin → fuerza LAYOUT (reflow) en CADA frame: el navegador
  recalcula posiciones de todo. En un teléfono lento, eso baja de 60fps a 20fps visibles.
- Animar color/box-shadow/background → fuerza PAINT (repintado) en cada frame: más barato que
  layout, pero sigue sin ir por GPU. Para sombras/glow, anima opacity de una capa con la sombra.

NUNCA `transition: all`:
- `transition: all` hace que CUALQUIER propiedad que cambie se anime, incluidas las caras
  (layout/paint) que ni querías animar. Es la causa #1 de jank accidental. Lista explícita:
    ❌ transition: all 200ms;
    ✅ transition: transform 200ms, opacity 200ms;

Más reglas de runtime:
- will-change: transform con MODERACIÓN (promueve a capa GPU). Abusar = consumo de memoria de
  GPU y el efecto contrario. Ponlo justo antes de animar, quítalo al terminar.
- Respetar prefers-reduced-motion: el usuario que lo pide NO debe recibir movimiento (también
  ahorra batería/frames). Es accesibilidad Y performance.
- Animar en el COMPOSITOR = no bloquea el hilo principal = el INP se mantiene aunque haya
  animación corriendo. Animar layout SÍ compite con la interacción → INP arriba de 200ms.
```

```css
/* ❌ transition: all + animar layout = reflow por frame + jank en gama media */
.card { transition: all 200ms; }
.card:hover { width: 320px; box-shadow: 0 8px 24px rgba(0,0,0,.2); } /* width = layout */

/* ✅ Solo transform/opacity, transición explícita, respeta reduced-motion */
.card {
  transition: transform 200ms ease, opacity 200ms ease;
  will-change: transform;                 /* solo si de verdad se anima seguido */
}
.card:hover { transform: scale(1.03); }   /* GPU, sin reflow ni repaint */
@media (prefers-reduced-motion: reduce) {
  .card { transition: none; }
  .card:hover { transform: none; }
}
```

> Esto es solo la CONEXIÓN con el budget/Web Vitals (animar mal sube el INP y tira frames). El
> detalle profundo del craft de animación —curvas/easing, orquestación, spring, FLIP, layout
> animations— vive en **`41-CRAFT-DE-ANIMACION.md`**. Aquí: la regla de runtime que protege el
> presupuesto; allá: cómo hacer que se sienta premium sin pagarlo en frames.

---

## ITEM DE CHECKLIST (verificar antes de vender)

```
PERFORMANCE BUDGET
[ ] Budget por ruta definido (First Load JS < ~170KB BROTLI, LCP <2.5s, INP <200ms, CLS <0.1 p75)
[ ] El gate mide el First Load JS POR RUTA del output de `next build` (o bundle-analyzer) — NO un
    solo main-*.js NI la suma de todos los chunks (incluiría los lazy)
[ ] Gate de First Load JS corriendo en el ci.yml (falla el merge si la ruta crítica excede);
    size-limit reservado para CSS y libs puntuales
[ ] Lighthouse CI con throttling móvil de gama media (formFactor mobile + cpuSlowdown 4x)
[ ] Lighthouse CI con assertions de LCP/CLS como GATE (INP NO: es de campo, ver abajo)
[ ] INP vigilado por ALERTA en analítica (36) sobre el p75 de campo, NO por gate de laboratorio
[ ] Web Vitals de CAMPO reportados a la analítica en producción (36), no solo laboratorio
[ ] LCP/INP/CLS verificados en CrUX/PSI con datos reales p75 (no DevTools para INP de campo)
[ ] Lo no-crítico va por next/dynamic; imágenes con next/image; fuentes con next/font
[ ] Ninguna dependencia gigante innecesaria (revisado en bundlephobia, peso min+gz)
[ ] Sin imports de barrel en la ruta crítica (ruta directa / optimizePackageImports) — verificado en bundle-analyzer
[ ] Analytics/logging diferidos a post-hydration (next/script afterInteractive/lazyOnload), no en el camino del LCP
[ ] Animaciones solo de transform/opacity; nunca transition: all; prefers-reduced-motion respetado
```

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

- **`28-INGENIERIA-NEXTJS.md`**: los patrones (RSC, next/image, next/font, code splitting) que te hacen caber en el budget. **38 es la FUENTE ÚNICA de los NÚMEROS y del GATE**; el 28 da el CÓMO técnico. Si 28 tiene un checklist de vitals, no lo dupliques: su ítem de vitals debe decir "ver budget y gate en 38" en vez de repetir cifras (que se desincronizan).
- **`06-TESTING.md`**: la sección de TESTING AUTOMATIZADO; lighthouse y el gate de first-load son parte del mismo CI que vitest+playwright.
- **`08-DEPLOY.md`**: el `ci.yml` donde vive el GATE de performance.
- **`13-INFRA-ESCALABILIDAD.md`**: caché de CDN y peso de imágenes a escala — el budget del cliente complementa el escalado del servidor.
- **`36-ANALITICA-Y-EVENTOS.md`**: a dónde se envían los Web Vitals de campo para ver el p75 real de tu base LATAM.
- **`22`**: disciplina de dependencias — una librería pesada revienta el budget.
