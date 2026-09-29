# MICRO-CRAFT Y EJECUCIÓN — La Última Milla Verificable

> **Cuándo cargar este archivo:**
> - SIEMPRE en el PULIDO (junto con `07-PULIDO.md` y `32-DEL-MVP-AL-PRODUCTO.md`): es la pasada final que separa una demo de un producto vendible
> - Al construir cualquier formulario, lista con contenido variable, modal, o vista con filtros/tabs
> - Antes del deploy, como check mecánico (casi todo aquí se verifica mirando o midiendo, no opinando)

## Objetivo
El `32` sube el listón de "funciona" a "se ve como producto". Este archivo cubre el escalón que queda: el **craft invisible de implementación** — las decenas de detalles pequeños que, sumados, son la diferencia entre "demo de IA" y "producto que alguien pagaría". Lo clave: **casi todo aquí es verificable mecánicamente**. No es "que se sienta premium" (subjetivo); es "¿usaste `…` o `...`?", "¿hay `min-w-0` en ese hijo flex?", "¿el input de email tiene `inputmode`?". Por eso vive en el pulido: se recorre como checklist, no como debate.

> Regla mental: el usuario nunca dice "qué bien, usaron comillas tipográficas". Pero la suma de 30 detalles correctos se SIENTE como cuidado, y la suma de 30 detalles rotos se siente como demo. El craft es invisible de a uno y decisivo en conjunto.

---

## 1. MICRO-TIPOGRAFÍA (lo que distingue texto "puesto" de texto "compuesto")

```
[ ] Puntos suspensivos: usar el carácter … (U+2026), NUNCA tres puntos "..."
[ ] Comillas tipográficas: “curvas” y ‘simples’, no rectas " '  (rectas = se ve a código)
[ ] Apóstrofo tipográfico ’ en vez de ' recto
[ ] Guion largo — (em dash) para incisos, no dos guiones --
```

```css
/* Números que NO "bailan" al actualizarse (contadores, precios, tablas, timers) */
.tabular { font-variant-numeric: tabular-nums; }
/* Sin esto, "111" y "999" ocupan anchos distintos → la columna tiembla al cambiar el valor */
```

```html
<!-- Titulares: reparten el texto en líneas equilibradas (no una línea huérfana corta) -->
<h1 class="text-balance">Tu resumen de la semana</h1>     <!-- text-wrap: balance -->
<!-- Párrafos: evitan que la última línea quede con una sola palabra -->
<p class="text-pretty">Lo que publiques aparecerá aquí…</p>  <!-- text-wrap: pretty -->

<!-- Non-breaking space: lo que NUNCA debe partirse entre dos líneas -->
<span>10&nbsp;MB</span>   <span>⌘&nbsp;K</span>   <span>50&nbsp;%</span>   <span>Club&nbsp;Abunda</span>
<!-- Número+unidad, atajo de teclado y nombres de marca van pegados o no van -->
```

---

## 2. CONTENIDO VARIABLE / OVERFLOW (el anti-overflow, complemento del anti-vacío de 32)

El `32` enseña a no renderizar UI vacía. Su gemelo: no renderizar UI ROTA con contenido largo. El texto real del usuario nunca mide lo que mide tu dato de prueba.

```
LA CAUSA #1 DE LAYOUTS ROTOS CON TEXTO LARGO: falta `min-w-0` en un hijo flex.
Por defecto un flex item tiene min-width:auto → NO se encoge por debajo de su contenido →
un texto largo lo empuja y rompe la fila (desborda, tapa el ícono, saca el botón de pantalla).
```

```tsx
// ✅ CORRECTO: min-w-0 en el hijo que contiene texto variable, truncate para cortar
<div className="flex items-center gap-3">
  <Avatar />
  <div className="min-w-0 flex-1">                 {/* min-w-0 = permite encoger */}
    <p className="truncate">{nombreLarguísimoDelUsuario}</p>
    <p className="truncate text-sm text-muted">{emailLargo}</p>
  </div>
  <Boton className="shrink-0">Seguir</Boton>        {/* shrink-0 = el botón no se aplasta */}
</div>
```

```
CHECKLIST DE OVERFLOW:
[ ] `min-w-0` en TODO hijo flex que contenga texto variable (la causa #1 — revísalo primero)
[ ] `truncate` (una línea) o `line-clamp-2/3` (varias) en títulos, nombres, descripciones
[ ] `break-words` / `break-all` en emails, URLs y tokens largos sin espacios
[ ] `shrink-0` en íconos, avatares y botones para que el texto no los aplaste
[ ] Probar cada campo con input CORTO ("Ana"), MEDIO y LARGUÍSIMO (80+ caracteres)
[ ] No renderizar UI rota para strings/arrays VACÍOS (anti-vacío de 32) NI desbordada (anti-overflow)
```

---

## 3. FORMS DE ÉLITE (donde el craft se nota más en mobile LATAM)

El teclado móvil correcto es la diferencia entre un form que se llena en 10 segundos y uno que frustra. Cada `type`/`inputmode` mal puesto le cuesta toques reales al usuario.

```tsx
{/* Email: teclado con @, sin autocapitalizar, sin corrector */}
<input type="email" inputMode="email" autoComplete="email"
       autoCapitalize="none" spellCheck={false} />

{/* Teléfono: teclado numérico de marcado */}
<input type="tel" inputMode="tel" autoComplete="tel" />

{/* URL: teclado con / y .com */}
<input type="url" inputMode="url" autoCapitalize="none" spellCheck={false} />

{/* Cantidad: teclado numérico (decimal si aplica) */}
<input type="text" inputMode="numeric" pattern="[0-9]*" />   {/* o inputMode="decimal" */}

{/* Código OTP / username: sin corrector ni autocapitalización */}
<input inputMode="numeric" autoComplete="one-time-code" spellCheck={false} autoCapitalize="none" />
```

```css
/* iOS hace ZOOM automático al enfocar un input con font-size < 16px — el "tell" #1 de "esto es
   una web, no una app". El zoom descoloca el layout y el usuario tiene que pellizcar para volver.
   Regla dura: TODO input/textarea/select ≥ 16px de font-size en mobile (aunque el diseño lo quiera
   más chico visualmente, 16px es el piso — nunca menos). */
input, textarea, select { font-size: 16px; }   /* mínimo en mobile; subir con media query si se quiere */
```

```
REGLAS DURAS DE FORMS:
[ ] TODO input/textarea/select ≥ 16px de font-size en mobile (evita el zoom-on-focus de iOS — el tell #1 de "web, no app")
[ ] type + inputMode + autoComplete correctos por campo (email/tel/url/numeric — clave en móvil LATAM)
[ ] spellCheck={false} en email, código, username, contraseña (el subrayado rojo asusta y estorba)
[ ] NUNCA bloquear paste (onPaste preventDefault está PROHIBIDO — rompe gestores de contraseñas y OTP)
[ ] CTA de submit habilitado HASTA que arranca el request; valida al hacer click con hint amable
    (refuerza "CTA vivo" de 32: nada de botón muerto al 50% esperando que el form esté perfecto)
[ ] Mientras el request corre: deshabilitar + spinner inline + texto "Guardando…" (no doble submit)
[ ] Placeholders = ejemplo terminado en "…" ("Ej. tunombre@empresa.com…"), no repetir la label (ver 42)
[ ] Warning antes de salir con cambios sin guardar (beforeunload + intercept de navegación)
```

```ts
// Avisar antes de perder cambios sin guardar
useEffect(() => {
  if (!hayCambiosSinGuardar) return;
  const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
}, [hayCambiosSinGuardar]);
```

---

## 4. URL COMO ESTADO / DEEP-LINKING (el estado vive en la URL, no solo en useState)

Un producto serio se puede compartir, recargar y abrir en pestaña nueva sin perder el estado. Filtros, tabs, paginación y paneles abiertos deben vivir en la URL.

```tsx
// nuqs: estado sincronizado con la query string (?tab=stats&page=2&filtro=activos)
import { useQueryState } from 'nuqs';

function Panel() {
  const [tab, setTab] = useQueryState('tab', { defaultValue: 'resumen' });
  // recargar la página mantiene el tab; compartir el link abre el mismo tab.
}
```

```
CHECKLIST URL / NAVEGACIÓN:
[ ] Filtros, tabs, paginación y paneles abiertos en query params (librería nuqs) — sobreviven recarga y se comparten
[ ] Links de navegación son <a>/<Link> REALES, no <div onClick> → soportan Cmd+click y middle-click (pestaña nueva)
[ ] Acciones destructivas: confirmación explícita O ventana de undo (toast "Eliminado — Deshacer" 5s)
[ ] El botón "atrás" del navegador hace lo esperado (no rompe el estado ni atrapa al usuario)
```

---

## 5. TOUCH / MOBILE NATIVO (que se sienta app, no web abierta en el teléfono)

```css
/* Mata el delay de 300ms al tocar (la app se siente "pegajosa" sin esto) */
button, a, [role="button"] { touch-action: manipulation; }

/* Highlight de tap INTENCIONAL (el gris feo por defecto grita "esto es una web") */
:root { -webkit-tap-highlight-color: transparent; }   /* y dar tu propio :active */

/* Scroll-chaining: que el scroll de un modal/sheet NO arrastre la página de atrás */
.modal, .sheet, .drawer { overscroll-behavior: contain; }

/* Notch / barra inferior: respetar las safe areas en pantalla completa */
.bottom-bar { padding-bottom: env(safe-area-inset-bottom); }
.top-bar    { padding-top: env(safe-area-inset-top); }
```

```
CHECKLIST TOUCH:
[ ] touch-action: manipulation en todo lo tocable (sin delay de 300ms)
[ ] -webkit-tap-highlight-color intencional + estado :active propio (no el highlight gris por defecto)
[ ] overscroll-behavior: contain en modales, sheets y drawers (arregla el scroll-chaining feo)
[ ] env(safe-area-inset-*) en barras fijas y full-screen (notch y barra de gestos)
[ ] Durante un drag: deshabilitar selección de texto (user-select:none) + `inert` en lo que no se arrastra
[ ] Áreas tocables ≥ 44×44px (thumb zone de 14) — ningún tap-target diminuto
```

---

## 6. DARK MODE ROBUSTO (los bugs que solo aparecen en dark)

El dark mode no es invertir colores: los controles NATIVOS del navegador (scrollbars, inputs, selects, autofill) tienen su propio render que ignora tu CSS si no se lo dices.

```css
/* Le dice al navegador que los controles nativos van en su variante oscura */
html { color-scheme: dark; }   /* arregla scrollbars, inputs nativos, autofill, calendarios */
```

```html
<!-- La barra del navegador/PWA matchea el fondo (sin esto, una franja blanca arriba en dark) -->
<meta name="theme-color" content="#0b0b0f" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
```

```css
/* <select> nativo en Windows dark: SIN background/color explícitos → texto negro sobre fondo negro */
select, option { background-color: var(--surface); color: var(--text); }
```

```
CHECKLIST DARK MODE:
[ ] color-scheme: dark en <html> (scrollbars/inputs/autofill nativos en dark, no blancos)
[ ] <meta name="theme-color"> que matchee el fondo en cada esquema (sin franja blanca en la barra)
[ ] <select> nativo con background-color y color explícitos (bug de texto invisible en Windows dark)
[ ] Verificar autofill, datepicker nativo y scrollbar realmente renderizados en dark (no solo el CSS)
```

---

## 7. BUNDLE TÁCTICO (caber en el budget de 38 con micro-decisiones)

Los NÚMEROS y el GATE del budget viven en `38-PERFORMANCE-BUDGET.md`. Esto son las micro-prácticas de import que evitan que el bundle crezca sin querer.

```ts
// ❌ Barrel file: importa TODO el index aunque uses una función → arrastra el paquete entero
import { formatDate } from '@/lib/utils';
// ✅ Ruta directa: solo trae lo que usas (mejor tree-shaking)
import { formatDate } from '@/lib/utils/formatDate';
```

```tsx
// Preload en hover/focus: el chunk de la ruta empieza a bajar antes del click → navegación instantánea
<Link href="/stats" prefetch onMouseEnter={() => import('./Stats')}>Ver stats</Link>
```

```
CHECKLIST BUNDLE TÁCTICO (refiere a 38 para el budget y el GATE):
[ ] Evitar barrel files: importar la ruta directa, no `import { x } from 'lib'` (mejor tree-shaking)
[ ] Preload del chunk en hover/focus de links y CTAs principales (navegación percibida instantánea)
[ ] Diferir analytics y scripts no críticos a post-hydration (requestIdleCallback / afterInteractive)
[ ] Antes de instalar una librería, revisar su peso min+gz (ver 38) — una dependencia gorda revienta el budget
```

---

## 8. ENCAJE Y CENTRADO ÓPTICO (los detalles que delatan "lo hizo una IA" — bugs reales detectados)

Pequeños desencajes que individualmente parecen nada, pero juntos gritan "amateur". Son **verificables mirando la pantalla renderizada**:

```
CHIPS / BADGES / PÍLDORAS: ABRAZAN su contenido, NUNCA estiran.
  ❌ BUG real: un chip "🔥 1" dentro de una caja que ocupa todo el ancho → queda un hueco muerto a la derecha.
  ✅ El chip es `inline-flex w-fit` (o `self-start`): su ancho = su contenido + padding. Si está en una fila,
     usar `justify-between`/`gap` para que el espacio sea intencional, no un estiramiento accidental del chip.
  Regla: NADA pequeño (chip, badge, racha, tag) ocupa un contenedor grande con aire muerto al lado.

NÚMEROS COMPUESTOS (contador, fracción, dato + unidad): se componen, no se apilan torpemente.
  ❌ BUG real: en un anillo, "1" arriba y "/1" abajo, sin centrar → se ve roto.
  ✅ Decidir UNA composición: "1/1" en una línea (el denominador más chico/tenue, baseline alineada), o el
     número grande con la unidad como sufijo inline. Centrado ÓPTICO dentro del anillo (no solo matemático:
     un número puede necesitar 1px de ajuste). tabular-nums si cambia.

CENTRADO ÓPTICO (no solo `items-center`):
  [ ] Íconos dentro de botones circulares: centrados a OJO (muchos glifos tienen peso visual descentrado).
  [ ] Texto + ícono en un botón: el conjunto centrado como bloque, con gap consistente, no el texto solo.
  [ ] El contenido de una card no "flota" pegado a un lado dejando hueco del otro (padding simétrico).
```

---

## 9. KEYBOARD AVOIDANCE (el teclado móvil NO puede tapar el input ni el CTA)

El `03` lo exige ("el teclado nunca tapa lo que el usuario escribe") — este es el código. En mobile web, el teclado en pantalla NO redimensiona el viewport de layout: tapa la mitad inferior y tu input o tu CTA de submit quedan debajo. Dos piezas:

```tsx
// 1) Al enfocar un input: asegurarse de que quede visible sobre el teclado
function enfocarVisible(e: React.FocusEvent<HTMLElement>) {
  // pequeño delay: esperar a que el teclado termine de abrir
  setTimeout(() => {
    e.target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, 300);
}
// <input onFocus={enfocarVisible} ... />  → aplicarlo a TODO input de la mitad inferior
```

```ts
// 2) visualViewport: saber cuánto espacio REAL queda visible (el teclado lo reduce)
//    y reposicionar barras/CTAs fijos que quedarían tapados.
useEffect(() => {
  const vv = window.visualViewport;
  if (!vv) return;
  const onResize = () => {
    // alto del teclado = ventana de layout − viewport visible
    const teclado = window.innerHeight - vv.height;
    document.documentElement.style.setProperty('--kb', `${Math.max(0, teclado)}px`);
  };
  vv.addEventListener('resize', onResize);
  vv.addEventListener('scroll', onResize);
  onResize();
  return () => { vv.removeEventListener('resize', onResize); vv.removeEventListener('scroll', onResize); };
}, []);
```

```css
/* La barra fija (CTA de submit, toolbar del composer) sube con el teclado */
.bottom-bar { bottom: calc(env(safe-area-inset-bottom) + var(--kb, 0px)); }
```

```
CHECKLIST KEYBOARD:
[ ] Todo input de la mitad inferior hace scrollIntoView({block:'center'}) al enfocar (delay ~300ms)
[ ] CTAs/barras fijas inferiores suben con el teclado (visualViewport → var(--kb)) o se ocultan mientras escribe
[ ] Probado REAL a 375px con teclado abierto: se ve el input, lo escrito y el botón de enviar
[ ] En navegadores nuevos, evaluar `interactive-widget=resizes-content` en la meta viewport (Chrome 108+)
```

---

## 10. OFFLINE CONCRETO (detección + banner + acciones deshabilitadas + cola de reintento)

"Offline" aparece en los checklists de estados (CLAUDE.md, 15, 32) — este es el patrón implementable. Cuatro piezas, en orden de importancia:

```tsx
// 1) DETECCIÓN: hook de conexión (navigator.onLine + listeners)
function useOnline() {
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return online;
  // OJO: navigator.onLine=true no garantiza internet real (wifi sin salida).
  // Para la acción core, confirmar con el resultado del fetch (catch → tratar como offline).
}
```

```tsx
// 2) BANNER PERSISTENTE NO BLOQUEANTE (no un toast que desaparece — el estado sigue)
{!online && (
  <div role="status" aria-live="polite"
       className="sticky top-0 z-50 bg-[var(--status-warning-soft)] text-[var(--text-primary)]
                  text-sm text-center py-2 px-4">
    Sin conexión — puedes seguir viendo tu contenido. Guardaremos tus cambios cuando vuelva.
  </div>
)}
// Reglas: sticky (no modal), tono calmado (no culpa), dice QUÉ sigue funcionando.
// Al reconectar: banner verde breve "Conexión recuperada ✓" que sí desaparece (3s).
```

```tsx
// 3) ACCIONES DE RED DESHABILITADAS CON ESTADO CLARO (no un botón que falla en silencio)
<button disabled={!online} title={!online ? 'Necesita conexión' : undefined}>
  {online ? 'Generar mi plan' : 'Sin conexión — se activará al volver'}
</button>
// El label CAMBIA: el usuario entiende por qué no puede, y qué pasará después.
// Lo local (navegar, leer, escribir borradores) NUNCA se deshabilita por estar offline.
```

```ts
// 4) COLA SIMPLE DE REINTENTO para la acción core (lo escrito no se pierde JAMÁS)
const KEY = 'cola-pendiente';
function encolar(accion: { tipo: string; payload: unknown; ts: number }) {
  const cola = JSON.parse(localStorage.getItem(KEY) ?? '[]');
  localStorage.setItem(KEY, JSON.stringify([...cola, accion]));
}
async function drenarCola(ejecutar: (a: any) => Promise<void>) {
  const cola: any[] = JSON.parse(localStorage.getItem(KEY) ?? '[]');
  for (const accion of [...cola]) {
    try {
      await ejecutar(accion);                       // el endpoint debe ser IDEMPOTENTE (ts/id como clave)
      cola.shift(); localStorage.setItem(KEY, JSON.stringify(cola));
    } catch { break; }                              // sigue sin red → reintentar en el próximo 'online'
  }
}
// window.addEventListener('online', () => drenarCola(miEjecutor));
// UI: los ítems encolados se marcan "Pendiente de enviar" (optimistic UI + badge), no desaparecen.
```

```
CHECKLIST OFFLINE:
[ ] useOnline() global + banner sticky no bloqueante (dice qué sigue funcionando)
[ ] Acciones de RED deshabilitadas con label que explica; acciones LOCALES intactas
[ ] La acción core escrita offline se ENCOLA (localStorage) y se drena al reconectar — nunca se pierde input
[ ] Endpoint de la acción core idempotente (la cola puede reintentar sin duplicar)
[ ] Probado: activar modo avión a mitad del flujo principal → sin pantalla rota, sin datos perdidos
```

---

## 11. SCROLL RESTORATION (volver atrás te deja DONDE estabas, no arriba de todo)

El usuario scrollea 40 ítems, abre el detalle, vuelve — y la lista está arriba de todo: se siente castigo. Los browsers restauran el scroll en navegación nativa, pero las SPAs lo rompen (el DOM aún no existe al volver).

```ts
// Next.js App Router y React Router v7 restauran el scroll por defecto en back/forward.
// Se rompe cuando la lista carga async: al volver, el contenedor mide 0 y no hay dónde restaurar.
// Patrón manual para contenedores con scroll propio (feeds, paneles, tabs):

// Guardar ANTES de navegar
function guardarScroll(id: string, el: HTMLElement) {
  sessionStorage.setItem(`scroll:${id}`, String(el.scrollTop));
}
// Restaurar cuando los DATOS ya están renderizados (no en el mount vacío)
useEffect(() => {
  if (!datosListos) return;
  const y = sessionStorage.getItem(`scroll:${id}`);
  if (y) contenedorRef.current?.scrollTo({ top: Number(y) });
}, [datosListos]);
```

```
CHECKLIST SCROLL RESTORATION:
[ ] Lista → detalle → atrás: la lista queda EN LA MISMA posición (probarlo con 30+ ítems)
[ ] Contenedores con scroll propio (overflow-y-auto) guardan/restauran con sessionStorage
[ ] La restauración espera a que los datos estén renderizados (skeleton con altura similar ayuda)
[ ] Navegación NUEVA (no back) sí arranca arriba — restaurar solo en back/forward
[ ] history.scrollRestoration = 'auto' (no pisarlo a 'manual' sin implementar el reemplazo)
```

---

## 12. THUMB ZONE A 375px (el pulgar decide dónde vive cada acción)

Uso real: una mano, el pulgar hace todo. A 375×812 (viewport de referencia del SO), las zonas del pulgar derecho son:

```
375px de ancho ──────────────────────────
┌────────────────────────────────────┐  0px
│ ✋ IMPOSIBLE (esquina sup. izq.)    │
│ ⚠️ estirada — solo lectura,        │  ~0-250px
│    título, botón "atrás" (izq.)    │
├────────────────────────────────────┤
│ ⚠️ ESTIRADA — contenido            │  ~250-450px
│    scrolleable, cards, datos       │
├────────────────────────────────────┤
│ ✅ CÓMODA — el pulgar vive aquí    │  ~450-812px
│    CTA primario, inputs core,      │
│    acciones frecuentes,            │
│    bottom-nav (siempre al fondo)   │
└────────────────────────────────────┘  812px
        └── la esquina inferior CONTRARIA a la mano también cuesta:
            centrar el CTA o llenarlo a lo ancho (w-full) lo resuelve
```

```
REGLAS DE THUMB ZONE:
[ ] CTA primario y bottom-nav en la ZONA CÓMODA inferior (~último tercio), CTA a lo ancho o centrado
[ ] Acciones frecuentes (crear, enviar, siguiente) accesibles sin reacomodar la mano
[ ] Acciones DESTRUCTIVAS (eliminar, cerrar sesión, cancelar suscripción) FUERA de la zona cómoda —
    arriba o dentro de un menú: que borrar exija intención, no un pulgar resbalado
[ ] La zona superior es de LECTURA (título, contexto, atrás) — nunca la única vía a la acción core
[ ] Tap-targets ≥44×44px en toda zona; en la estirada, mejor ≥48px (el tap es menos preciso)
[ ] Verificar sobre el render real a 375px: ¿alcanzo el CTA con el pulgar sin mover la mano? 
```

---

## 13. DESKTOP SIN VERGÜENZA (la app también se abre en computador)

El SO es 375px-first y eso no cambia. Pero el comprador web abre la app en su laptop — el checkout de Hotmart, el email de acceso y la landing viven en desktop — y un layout mobile ESTIRADO a 1440px (cards de 1200px de ancho, chips gigantes, texto que cruza toda la pantalla) se ve amateur en el momento exacto en que acaba de pagar.

```
LA DECISIÓN (una vez por app, anotada en ESTADO.md — no se improvisa pantalla a pantalla):

A) COLUMNA CENTRADA — default para apps de hábito/consumo B2C: la app interna vive en un
   contenedor `max-w-md` (448px) — o `max-w-lg` (512px) si las cards piden aire — CENTRADO
   (`mx-auto`) sobre el fondo con profundidad del 32, que SÍ llena el viewport completo.
   Es el patrón honesto de las apps mobile-first: nada se estira, nada se rompe, se ve
   intencional en cualquier monitor.
B) ADAPTATIVO REAL — solo si el nicho lo pide (B2B, productividad, dashboards de datos):
   sidebar de navegación (la bottom-nav mobile se convierte en sidebar desde `lg:`) +
   contenido `max-w-4xl` · listas → tablas con más columnas · bento de 2-3 columnas ·
   doble panel lista+detalle. Cuesta el doble: se elige solo con razón escrita en ESTADO.md.

LO QUE NO SE DECIDE (fijo, siempre):
- La LANDING es SIEMPRE adaptativa real: el 55 ya da los tamaños desktop (hero display
  64-88px; secciones 2/4/6 en grid de 2-3 columnas desde `md:`). Una landing en columna
  de 448px en un monitor de 27" NO vende.
- El FUNNEL (onboarding + paywall) es SIEMPRE columna centrada `max-w-md`: los chips de
  selección, la barra de progreso y la pricing card NUNCA se estiran a 1200px.
- Imágenes/mockups con tamaño máximo explícito (`max-w-[420px]` el mockup de teléfono,
  nunca `w-full` suelto que se infle en desktop).
- Hover states SOLO bajo `@media (hover: hover)` — ya es regla del SO; aquí se refuerza al
  revés: en desktop el hover SÍ se espera, y un botón sin hover en laptop se siente muerto.
- Tipografía FLUIDA con `clamp()` en la landing (ej. hero `font-size: clamp(2.5rem, 6vw, 5.5rem)`):
  escala continua entre 375 y 1440px, sin saltos duros por breakpoint.
- Container queries (`@container`) para componentes que viven en columnas de ancho variable
  (card de bento 1-3 columnas, panel lista+detalle): responden a SU contenedor, no al viewport.
- Test: si la app declara soporte desktop, screenshot a 1440px de las 3 pantallas clave
  ADEMÁS del de 375px (la landing lo exige siempre).
```

```
CHECKLIST DESKTOP (recorrer si la app declara soporte desktop — la landing SIEMPRE):
[ ] La decisión A/B está anotada en ESTADO.md (ninguna pantalla mezcla ambas)
[ ] A 1440px: cero cards/chips/CTAs estirados a lo ancho de la pantalla (max-w aplicado)
[ ] El fondo con profundidad llena el viewport a 1440px (el mesh del 32 no se corta en una franja)
[ ] Landing a 1440px: hero 64-88px, grids de 2-3 columnas, sticky CTA correcto (55)
[ ] Onboarding/paywall a 1440px: columna max-w-md centrada, nada flotando con huecos
[ ] Hover visible en TODO lo interactivo bajo (hover: hover); cero hover pegajoso en touch
[ ] Sin scroll horizontal en NINGÚN ancho entre 375 y 1440px
[ ] Screenshot a 1440px de las 3 pantallas clave (landing, home interna, paywall) además del de 375px
```

---

## MICRO-CRAFT CHECKLIST (la pasada compacta del pulido)

```
TIPOGRAFÍA
[ ] … (no ...) · comillas “ ” ‘ ’ (no rectas) · em dash — · tabular-nums en números que cambian
[ ] text-balance en titulares · text-pretty en párrafos · &nbsp; en "10 MB", "⌘ K", nombres de marca

ENCAJE / CENTRADO (sección 8 — mirar la pantalla)
[ ] Chips/badges/píldoras ABRAZAN su contenido (w-fit/inline-flex) — CERO hueco muerto al lado de algo pequeño
[ ] Números compuestos (1/1, 20 min) en UNA composición decidida y centrados ÓPTICAMENTE (no apilados torpes)
[ ] Íconos en botones circulares y texto+ícono centrados a ojo; padding de card simétrico (nada flotando)

OVERFLOW
[ ] min-w-0 en hijos flex con texto (causa #1) · truncate/line-clamp · break-words en URLs · shrink-0 en íconos
[ ] probado con input corto/medio/larguísimo · sin UI rota por vacío (32) ni por desborde

FORMS
[ ] type+inputMode+autoComplete por campo · spellCheck=false en email/código · paste NUNCA bloqueado
[ ] submit vivo hasta el request · placeholder de ejemplo "…" · warning de cambios sin guardar

URL / NAV
[ ] filtros/tabs/paginación en query (nuqs) · links <a>/<Link> reales (Cmd+click) · destructivo con confirm/undo

TOUCH
[ ] touch-action: manipulation · tap-highlight intencional · overscroll-behavior: contain en modales
[ ] safe-area-insets · drag deshabilita selección + inert · tap-targets ≥44px

KEYBOARD / OFFLINE / SCROLL / THUMB (secciones 9-12)
[ ] scrollIntoView al enfocar inputs bajos · barra fija sube con el teclado (visualViewport → --kb)
[ ] useOnline + banner sticky · acciones de red deshabilitadas con label · cola de reintento de la acción core
[ ] lista→detalle→atrás conserva el scroll (sessionStorage en contenedores propios)
[ ] CTA primario y nav en zona cómoda inferior · destructivas FUERA de ella · verificado a 375px

DESKTOP (sección 13 — si la app lo declara; la landing SIEMPRE)
[ ] decisión A/B en ESTADO.md · nada estirado a 1440px · funnel max-w-md centrado · hover bajo (hover:hover) · screenshot 1440px de las 3 clave

DARK MODE
[ ] color-scheme: dark · theme-color por esquema · <select> con bg/color explícitos

BUNDLE
[ ] sin barrel imports · preload en hover · analytics post-hydration · peso de libs revisado (→ 38)
```

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

- **`07-PULIDO.md`**: este archivo es la pasada de detalle del pulido — la rúbrica /40 (en `RUBRICAS-DE-PANTALLA.md`) puntúa lo que se VE; este checklist garantiza que lo que se ve no se rompa con datos reales.
- **`32-DEL-MVP-AL-PRODUCTO.md`**: el anti-vacío de 32 y el anti-overflow de aquí son gemelos; el "CTA vivo" se refuerza en la sección de forms. 32 sube de "funciona" a "se ve producto"; 43 cierra la última milla mecánica.
- **`38-PERFORMANCE-BUDGET.md`**: la FUENTE ÚNICA de los números y el GATE de bundle. La sección 7 de aquí da las micro-prácticas; los límites y el enforcement viven en 38, no se duplican.
- **`42-UX-WRITING.md`**: los placeholders de ejemplo, los estados de carga con gerundio y la consistencia de verbos son su dominio; aquí se aplican en el contexto técnico del form.
- **`14-LEYES-DE-DISENO.md`**: la thumb zone y los tap-targets ≥44px nacen ahí; aquí se verifican mecánicamente.
- **`28-INGENIERIA-NEXTJS.md`**: los patrones de import, preload y diferido se implementan con las herramientas del App Router que ese archivo detalla.
