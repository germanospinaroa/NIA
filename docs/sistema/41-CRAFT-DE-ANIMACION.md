# CRAFT DE ANIMACIÓN — El Porqué del Movimiento, No Solo el Qué

> **Cuándo cargar este archivo:**
> - Cuando el movimiento de la app ya "existe" (las 7 baseline de DESIGN-CORE §6 están puestas) pero se siente genérico, mecánico o "demasiado animado"
> - Antes de tocar gestos, drawers, bottom sheets, transiciones de pantalla con View Transitions, o cualquier momento narrativo / de IA
> - Junto con `14-LEYES-DE-DISENO.md` (números exactos), `22-LIBRERIAS-Y-CRAFT.md` (qué animar siempre) y `16-DIRECCION-DE-ARTE.md` (motion signature, PASO 0.7)
>
> **Por qué existe:** `22` dice QUÉ animaciones deben existir (las 7 baseline) y `14` da los NÚMEROS (curvas, duraciones). Este archivo es la capa que falta: el CRITERIO — cuándo NO animar, por qué ease-out gana, cómo se interrumpe el movimiento, cómo se siente el peso físico. La diferencia entre "una IA puso transiciones" y "un design engineer las pensó" vive aquí. No repite las baseline ni las curvas nombradas — las usa como piso y construye encima.

---

## REGLA MAESTRA: El Lujo También Es Sustraer

El sesgo aditivo es la trampa: ante "haz que se sienta premium", el instinto es AGREGAR movimiento. Pero la app de élite no es la que más anima — es la que anima donde importa y deja quieto todo lo demás. Una transición de 300ms en una acción que el usuario hace 200 veces al día no es lujo: es una piedra en el zapato repetida 200 veces.

> Antes de animar cualquier cosa nueva, la pregunta no es "¿cómo lo animo?" sino "¿debe animarse?". Este archivo empieza por ahí.

---

## DECIDIR ANTES DE ANIMAR — ¿Debe Animarse?

El criterio no es estético, es de **FRECUENCIA DE USO**. Cuanto más se repite una acción, menos (o nada) debe animarse. La animación es un costo de tiempo que el usuario paga cada vez; ese costo solo se justifica si la acción es rara.

```
FRECUENCIA              EJEMPLOS                          TRATAMIENTO
100+ veces/día          atajos de teclado, command        JAMÁS animar. Cambio instantáneo.
                        palette, navegación con flechas    El usuario quiere velocidad, no show.
decenas de veces/día    hover, abrir menú, items de        REDUCIR. 80-120ms, cambio casi
                        lista, toggles, tabs               imperceptible. Funcional, no decorativo.
ocasional               modales, drawers, bottom sheets,   ESTÁNDAR. Las 7 baseline de 22 con
                        toasts, cambio de pantalla         sus curvas (14). Aquí vive el default.
raro / primera vez      onboarding, celebración de hito,   DELEITE. Spring, Lottie, secuencia
                        primer logro, empty state          coreografiada. El "wow" se permite acá.
```

### Regla dura: NUNCA animar acciones iniciadas por teclado

Si el usuario abrió algo con `Cmd+K`, `Enter`, una flecha o un atajo, ese usuario es de poder y quiere velocidad. Animar su acción la sabotea. El command palette aparece **instantáneo**; el resultado de un atajo es **instantáneo**.

```tsx
// El mismo componente, dos disparadores. El teclado NO anima; el click sí.
function CommandPalette({ open, openedVia }: { open: boolean; openedVia: 'key' | 'click' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={openedVia === 'key' ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={openedVia === 'key' ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
          transition={{ duration: openedVia === 'key' ? 0 : 0.18 }}
        />
      )}
    </AnimatePresence>
  );
}
```

> `initial={false}` en Motion = "ya estás en el estado final, no animes la entrada". Es la herramienta para apagar la animación sin quitar el componente.

---

## EASING PERCEPTUAL — El Porqué Detrás de la Curva

`14` ya da las curvas nombradas como tokens. Aquí va el CRITERIO para elegirlas, que es lo que se malinterpreta.

### ease-out para entradas Y salidas de UI

La regla intuitiva ("entra con ease-out, sale con ease-in") está mal para UI. El motivo: **ease-out arranca rápido**, y un arranque rápido se lee como feedback inmediato — el sistema responde YA. ease-in arranca lento, lo que en UI se siente como lag, como si la app dudara. Por eso:

- **Entradas de UI → ease-out** (arranca rápido = "te escuché").
- **Salidas de UI → también ease-out** (que se vaya rápido y termine suave; un ease-in al salir hace que el elemento "se quede pegado" un instante antes de irse, y se siente lento).
- **ease-in casi nunca en UI.** Su único uso legítimo es algo que sale de pantalla por completo y no volverá (raro).

> **Nota:** esta es la doctrina canónica del SO (`DESIGN-CORE.md`, doctrina a): salidas SIEMPRE con `ease-out`; `ease-in` solo para algo que sale de pantalla y no vuelve, como decisión deliberada. `14` y `10` ya están alineados con esta doctrina.

### Árbol de decisión de easing

```
¿El elemento ENTRA o SALE de la pantalla (aparece/desaparece)?  → ease-out
¿Se MUEVE de un punto a otro DENTRO de la pantalla (reorden, layout)? → ease-in-out
¿Es hover / cambio de color / fondo?  → ease (suave en ambos extremos, corto)
¿Es algo CONSTANTE (spinner, marquee, loop)?  → linear (cualquier curva se nota fea en loop)
```

### Las curvas nativas de CSS son débiles → usar custom fuertes

`ease`, `ease-out`, `ease-in-out` de CSS son tímidas: la diferencia con `linear` apenas se percibe. Las curvas con carácter tienen el control point empujado al extremo:

```css
/* Curvas de FIRMA — familia OPCIONAL que REEMPLAZA (no convive con) los tokens de 14. */
--ease-out:     cubic-bezier(0.23, 1, 0.32, 1);    /* entradas/salidas de UI, arranque seco */
--ease-in-out:  cubic-bezier(0.77, 0, 0.175, 1);   /* movimiento dentro de pantalla, decidido */
--ease-drawer:  cubic-bezier(0.32, 0.72, 0, 1);    /* el easing de los sheets de iOS — el "estándar oro" */
```

> **FIRMA OPCIONAL — decisión única por app.** Estas curvas son más agresivas que las de `14` (`cubic-bezier(0.16, 1, 0.3, 1)`). La doctrina (`DESIGN-CORE.md`, doctrina e) es UNA familia de curvas por app: o los tokens de `14` (el workhorse seguro) **o** esta familia de firma — nunca ambas. Si se adopta la firma, REEMPLAZA a las curvas base de `14` en toda la app, se decide conscientemente en la ficha de dirección de arte (motion signature de `16`, PASO 0.7) y se documenta en el brand kit. Prohibido mezclar familias en la misma pantalla.

---

## INTERRUMPIBILIDAD — La Diferencia Invisible que Lo Cambia Todo

Un usuario abre un menú, cambia de opinión, lo cierra antes de que termine de abrir. ¿Qué pasa?

- **Transitions CSS y springs**: se **interrumpen y redirigen** desde donde están. El menú a medio abrir se devuelve suave. Se siente vivo.
- **`@keyframes`**: **reinician** desde el frame 0. El menú salta al estado inicial y vuelve a empezar. Se siente roto.

```css
/* CORRECTO para algo que se togglea muchas veces: transition (interrumpible) */
.menu {
  opacity: 0;
  transform: scale(0.96);
  transition: opacity 0.18s var(--ease-out), transform 0.18s var(--ease-out);
}
.menu[data-open='true'] { opacity: 1; transform: scale(1); }

/* MAL para un toggle: @keyframes reinicia si lo interrumpes a media animación */
.menu { animation: pop-in 0.18s var(--ease-out); } /* ❌ no redirige */
```

> Regla: **toggles, toasts, expand/collapse, dropdowns → transitions** (porque el usuario los interrumpe). `@keyframes` solo para entradas únicas que no se interrumpen (el stagger de la primera carga de `22`).
> Los springs de Motion conservan la **velocidad** al interrumpir — si venías cerrando rápido y reabres, arranca con esa inercia. Por eso se sienten físicos.

---

## SPRING REAL — Física, No Una Curva que la Imita

`14` define `--ease-spring` como un `cubic-bezier(0.34, 1.56, 0.64, 1)`. Eso **imita** un spring con un overshoot fijo, pero no es física: no responde a velocidad ni se puede interrumpir con inercia. El spring REAL es el de Motion.

```tsx
// Config tipo Apple: se describe por sensación (duration + bounce), no por física cruda.
const appleSpring = { type: 'spring', duration: 0.5, bounce: 0.2 };
// bounce: 0.1–0.3. Por encima de 0.3 se ve "de juguete". En UI seria, casi siempre 0.1–0.2.
// bounce: 0 = sin overshoot (un spring crítico, útil para movimiento serio sin rebote).

<motion.div animate={{ scale: 1 }} transition={appleSpring} />
```

### Cuándo spring REAL y cuándo basta una curva

```
USA SPRING REAL (Motion) cuando:
- Hay DRAG con momentum (el elemento sigue al dedo y se asienta).
- El gesto es INTERRUMPIBLE (el usuario puede reagarrar a media animación).
- El elemento debe sentirse "vivo" (un toggle premium, un pin que cae en su lugar).
- Seguimiento de mouse / cursor (useSpring para suavizar el lag).

USA CURVA cubic-bezier (más barata, predecible) cuando:
- Duración fija conocida (un fade de 200ms, una transición de pantalla).
- No hay interacción a media animación (entra y se queda).
```

```tsx
// Seguimiento de mouse suavizado — caso clásico de useSpring
const x = useMotionValue(0);
const smoothX = useSpring(x, { stiffness: 300, damping: 30 }); // el "lag" que se siente premium
```

> Regla de oro: **bounce casi siempre se evita.** El overshoot es para celebración (hito real, ver `22` baseline #7) o para un elemento que de verdad debe sentirse físico. Un spring con bounce en un tap rutinario es una demo técnica, no craft.

---

## TRANSFORM-ORIGIN — Lo que Escala Debe Escalar Desde su Origen

El default de CSS es escalar desde el **centro**. Para un modal está bien (es el centro de atención). Para un popover, dropdown o tooltip está **mal**: deben crecer DESDE el botón que los disparó, como si emergieran de él.

```css
/* Popover/dropdown/tooltip: crece desde el trigger. Radix expone la variable exacta. */
.popover-content {
  transform-origin: var(--radix-popover-content-transform-origin);
}
/* Tooltip con Radix: var(--radix-tooltip-content-transform-origin) */
/* Dropdown:          var(--radix-dropdown-menu-content-transform-origin) */

/* Modal centrado: SÍ desde el centro (es correcto aquí) */
.modal { transform-origin: center; }
```

> Sin esto, un dropdown a la derecha de la pantalla crece desde su propio centro y "flota" raro. Con la variable de Radix, crece desde la esquina pegada al botón y se siente conectado. Es el detalle que separa un menú genérico de uno pensado.

---

## "NADA APARECE DE LA NADA" — El Punto de Partida Correcto

Un elemento que aparece desde `scale(0)` se ve como un truco de magia barato: salta de la nada. Todo lo que entra debe partir de un estado **casi completo**, no de cero.

```css
/* PROHIBIDO */
@keyframes bad { from { transform: scale(0); } }   /* ❌ aparece de la nada */

/* CORRECTO: empieza casi en su sitio, solo el último tramo se anima */
.enter {
  opacity: 0;
  transform: scale(0.95);   /* dropdowns/cards: 0.95 · elementos grandes: 0.9 · nunca menos */
}
.enter[data-open] { opacity: 1; transform: scale(1); }
```

### `@starting-style`: animar la entrada sin JS

El patrón viejo (`useEffect` + `setMounted(true)` para disparar la animación de entrada) ya no hace falta. CSS nativo permite definir el estado "desde el que entra":

```css
.toast {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.25s var(--ease-out), transform 0.25s var(--ease-out);

  @starting-style {              /* el estado del PRIMER frame al montarse */
    opacity: 0;
    transform: translateY(8px);
  }
}
```

> Esto reemplaza el `useEffect setMounted` en toasts, popovers y elementos que se montan. Menos JS (casa con `38`), menos re-render, y la entrada la maneja el compositor. Soporte: navegadores modernos; para el Android de gama media de LATAM funciona en Chrome reciente — si necesitas fallback, el patrón Motion `initial/animate` sigue siendo válido.

---

## PERFORMANCE DE RUNTIME — Que Corra a 60fps en un Android de Gama Media

`38` mide el PESO (bytes que se descargan). Esto es distinto: es el **RUNTIME** — que la animación, una vez descargada, no congele el hilo principal del teléfono lento del usuario LATAM. Una animación ligera en bytes puede ir a 12fps si toca las propiedades equivocadas.

### Animar SOLO `transform` y `opacity`

Son las únicas dos propiedades que el navegador puede animar saltándose **layout** y **paint** (van directo al compositor, en GPU). Todo lo demás recalcula.

```css
/* ❌ ESTO MATA EL FRAMERATE en gama media (recalcula layout en cada frame) */
.bad { transition: width 0.3s, height 0.3s, top 0.3s, left 0.3s, margin 0.3s; }

/* ❌ NUNCA esto: anima TODO, incluido lo caro, sin que lo decidas */
.bad { transition: all 0.3s; }

/* ✅ Solo transform y opacity */
.good { transition: transform 0.3s var(--ease-out), opacity 0.3s var(--ease-out); }
```

### CSS vars heredables recalculan los hijos

Una `--variable` en un padre **se hereda**: cambiarla en cada frame fuerza al navegador a recalcular TODOS los hijos que la leen. En un drawer con muchos items, esto es letal.

```ts
// ❌ En un drawer con 50 items: animar una var del padre recalcula los 50 cada frame
parent.style.setProperty('--drag-y', `${y}px`);  // los hijos que leen var(--drag-y) recalculan

// ✅ Escribir el transform DIRECTO en el elemento que se mueve (sin var heredable)
drawerEl.style.transform = `translateY(${y}px)`;  // toca un solo elemento, va a GPU
```

### Los shorthands de Framer (`x`/`y`/`scale`) NO siempre van por GPU

Motion expone `x`, `y`, `scale` como atajos, pero internamente puede pasarlos por propiedades que recalculan. Para el camino GPU garantizado, pasar el `transform` como **string**:

```tsx
// ✅ string transform = camino GPU garantizado en drag/animaciones críticas de runtime
<motion.div style={{ transform: 'translateX(100px)' }} />
// vs los shorthands (cómodos, pero verifica fps en dispositivo real para drag pesado):
<motion.div style={{ x: 100 }} />
```

### Bajo carga, CSS animations le ganan a JS

Las animaciones CSS (`transition`, `@keyframes`) corren **fuera del main thread**: aunque el JS esté ocupado (parseando datos, re-renderizando), la animación sigue fluida. Una animación manejada por JS (rAF, librería) compite por el mismo hilo y tartamudea bajo carga — exactamente el escenario del Android lento. Para movimiento crítico que debe sobrevivir a la carga, **prefiere CSS**.

### SVG: animar el `<g>`, no el path

```css
/* Para que un SVG anime por transform como cualquier caja, fijar el box de referencia */
svg .animated-group {
  transform-box: fill-box;        /* el transform se calcula respecto al bounding box del propio elemento */
  transform-origin: center;
  transition: transform 0.3s var(--ease-out);
}
```

> Sin `transform-box: fill-box`, el `transform-origin` de un SVG se calcula respecto al viewport, no al elemento, y la rotación/escala "vuela" fuera de sitio.

---

## GESTOS Y DRAG — Cómo se Sienten Premium (Bottom Sheets, Swipe-to-Dismiss)

El error de novato en un bottom sheet: "descártalo si lo arrastraron más de la mitad". Eso ignora la **intención**. Un flick rápido y corto debe descartar; un arrastre lento y largo que se suelta, no. La señal real es la **velocidad**.

### Descartar por VELOCIDAD, no por distancia

```ts
// velocity = distancia / tiempo (px por ms). Capturar al soltar.
function shouldDismiss(deltaY: number, elapsedMs: number): boolean {
  const velocity = Math.abs(deltaY) / elapsedMs;   // px/ms
  return velocity > 0.11;     // umbral de "flick": un gesto rápido descarta sin importar distancia
  // NO exigir un umbral de distancia mínima: un flick corto y veloz debe bastar.
}
```

### Damping en los bordes (fricción, no un muro)

Cuando el sheet llega a su tope (no puede subir más), no se debe clavar de golpe. Se sigue moviendo un poco con **resistencia creciente** — como en iOS:

```ts
// Más allá del límite, el movimiento se "amortigua": cada px arrastrado mueve menos.
function rubberBand(overscroll: number): number {
  const RESISTANCE = 0.55;
  return overscroll * RESISTANCE;   // arrastras 100px de más → se mueve 55px, con sensación de goma
}
```

### `setPointerCapture` e ignorar multi-touch

```ts
function onPointerDown(e: PointerEvent) {
  (e.target as HTMLElement).setPointerCapture(e.pointerId); // sigue el dedo aunque salga del elemento
  startY = e.clientY;
  startTime = performance.now();
}
// Tras iniciar un drag con un dedo, IGNORAR pointers adicionales (un segundo dedo no debe
// secuestrar el gesto). Guardar el pointerId activo y filtrar el resto.
```

> Estos cuatro detalles (velocidad, damping, pointer capture, ignorar multi-touch) son lo que hace que un bottom sheet se sienta nativo y no como un `<div>` que se mueve. Aplica a swipe-to-dismiss, sheets, carruseles arrastrables.

---

## `clip-path` COMO ANIMACIÓN — Revelar Sin DOM Extra

`clip-path` se anima en GPU y no agrega nodos al DOM. Tres usos de craft:

### 1. Hold-to-delete (mantener presionado para confirmar)

```css
.hold-fill {
  clip-path: inset(0 100% 0 0);                 /* arranca vacío (recortado por la derecha) */
  transition: clip-path 2s linear;              /* se llena en 2s mientras se mantiene */
}
.hold-fill[data-holding] { clip-path: inset(0 0 0 0); }   /* lleno */
/* Al SOLTAR antes de completar: snap-back rápido (200ms) que deshace el llenado */
.hold-fill[data-released] { transition: clip-path 0.2s var(--ease-out); clip-path: inset(0 100% 0 0); }
```

### 2. Image reveal on scroll (con IntersectionObserver)

```css
.reveal { clip-path: inset(100% 0 0 0); transition: clip-path 0.7s var(--ease-out); }
.reveal[data-visible] { clip-path: inset(0 0 0 0); }   /* se "destapa" de abajo hacia arriba */
```
```ts
new IntersectionObserver((entries) => {
  entries.forEach((e) => e.isIntersecting && e.target.setAttribute('data-visible', ''));
}, { threshold: 0.3 }).observe(el);
```

### 3. Tabs con transición de color de la activa

Duplicar la lista de tabs (una en color base, otra en color activo encima) y **clipear** la capa activa al ancho/posición de la pestaña seleccionada. El texto cambia de color con un barrido limpio, sin nodos extra ni reflow.

> Las tres son GPU, sin DOM adicional, sin reflow. Es el tipo de efecto que parece caro y cuesta casi nada.

---

## SCROLL-DRIVEN ANIMATIONS CSS — Reveals de Scroll con 0 JS

`animation-timeline: view()` / `scroll()` reemplaza con CERO JS el patrón IntersectionObserver del reveal de arriba — y corre **fuera del main thread** (el reveal no tartamudea aunque el JS esté ocupado; misma lógica de "bajo carga, CSS le gana a JS").

```css
@supports (animation-timeline: view()) {
  .reveal {
    animation: revelar linear both;
    animation-timeline: view();              /* avanza con la posición del elemento en el viewport */
    animation-range: entry 0% entry 60%;     /* completa al entrar el 60% del elemento */
  }
  @keyframes revelar {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
}
/* FALLBACK: sin soporte, el patrón IntersectionObserver de la sección de clip-path sigue
   siendo el camino — gatear ese JS con !CSS.supports('animation-timeline: view()'). */
@media (prefers-reduced-motion: reduce) {
  .reveal { animation: none; opacity: 1; transform: none; }   /* contenido visible, sin desplazamiento */
}
```

---

## MOTION NARRATIVO — Caro al Moverse (Hero, IA, Onboarding)

Esto es lo OPUESTO a la UI funcional. Aquí el movimiento ES el contenido: hero animado, respuesta de IA generándose, celebración. Se permite (y se busca) el peso, el drama, el tiempo. Pero con estructura, no improvisado.

### Estructura Slow-Fast-Boom-Stop

```
SLOW   anticipación: arranca despacio, casi se detiene (genera expectativa)
FAST   aceleración: el grueso del movimiento, rápido
BOOM   el momento clave: el dato, el resultado, el número final
STOP   frena EN SECO. Nunca un fade-out lánguido al final.
```

> El final en seco es la firma del peso físico: las cosas pesadas se detienen de golpe cuando llegan. Un fade-out al final delata animación "de plantilla".

```ts
// expoOut como easing por defecto del motion narrativo (peso físico: arranca volando, frena seco)
const expoOut = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
// En Motion: ease: [0.16, 1, 0.3, 1] se le aproxima; para el "boom" real, usa la función.
```

### Pausa antes del resultado clave

```ts
// 0.5s de silencio ANTES de revelar el número/resultado importante. La pausa crea el peso.
await animate(buildUp);
await delay(500);          // ← el respiro que hace que el resultado "aterrice"
await animate(revealResult);
```

### Principios Disney aplicables

- **Anticipation → Action → Follow-through**: antes de moverse, un pequeño retroceso (anticipación); el movimiento; y al llegar, un asentamiento mínimo (follow-through). No es bounce gratuito: es el cuerpo del movimiento.

### Chunk-reveal para texto de IA (NO máquina de escribir)

El efecto "máquina de escribir" (un carácter a la vez, intervalo fijo) se ve mecánico y delata IA. El texto real de un LLM debe revelarse en **trozos de 2-5 caracteres con intervalo irregular**:

```ts
function* chunkReveal(text: string) {
  let i = 0;
  while (i < text.length) {
    const size = 2 + Math.floor(Math.random() * 4);     // 2–5 chars por trozo
    yield text.slice(0, (i += size));
    // intervalo IRREGULAR (no fijo): se siente humano/pensante, no robótico
    // await delay(20 + Math.random() * 40);            // 20–60ms variable
  }
}
```

### Cursor que se mueve por la pantalla: Bézier + ruido

Un cursor que va en línea recta de A a B grita "automatizado". El cursor humano describe una **curva Bézier** con un poco de **ruido**:

```ts
// Movimiento de cursor "humano": curva, no recta; con jitter sutil
function humanCursorPath(from: Pt, to: Pt) {
  const ctrl = midpointWithOffset(from, to, /*desvío lateral*/ 40);  // punto de control = la curva
  return bezier(from, ctrl, to).map((p) => addNoise(p, /*±*/ 1.5));   // ruido sutil por punto
}
```

### Cambio de foco = brightness + saturate + BLUR (no solo opacity)

Para enfocar la atención en un elemento y "apagar" el resto, bajar la opacity de lo no-enfocado es débil. El combo que se siente cinematográfico:

```css
.unfocused {
  filter: brightness(0.7) saturate(0.8) blur(2px);   /* el blur es lo que da profundidad real */
  transition: filter 0.4s var(--ease-out);
}
```

> El `blur` es lo que vende el efecto "desenfoque de cámara". Cuidado: es caro en Safari (ver DETALLES DE CRAFT). Úsalo en momentos puntuales, no permanente.

---

## VIEW TRANSITIONS API NATIVA — Transiciones de Pantalla Sin Bundle

La View Transitions API es **nativa del navegador**: no agrega bytes al bundle (casa perfecto con `38`) y su soporte es amplio en 2026. **El camino BASELINE es la API nativa**, no el wrapper de React:

- **SPA** → `document.startViewTransition(actualizarDOM)`: el navegador captura el antes/después y anima el cruce.
- **MPA / multi-página** → `@view-transition { navigation: auto; }` en CSS: transiciones entre documentos sin una línea de JS.

⚠️ **El componente de React (`unstable_ViewTransition` / `<ViewTransition>`) es EXPERIMENTAL: verificar la doc de React vigente antes de usarlo, y NO usarlo por defecto.** El export ha vivido bajo prefijo `unstable_` y su disponibilidad/nombre cambia entre versiones; si no está estable en la versión instalada, quedarse con la API nativa (o el fallback CSS/Motion). Lo mismo aplica a `unstable_addTransitionType`.

```ts
// BASELINE (SPA): la API nativa, sin librerías
function cambiarVista(actualizar: () => void) {
  if (!document.startViewTransition) return actualizar();   // fallback: cambio sin transición
  document.startViewTransition(actualizar);
}
```

```css
/* BASELINE (MPA): transición entre páginas, 0 JS */
@view-transition { navigation: auto; }
```

```tsx
// EXPERIMENTAL (solo tras verificar la doc de React vigente — nunca por defecto):
import { unstable_ViewTransition as ViewTransition } from 'react'; // nombre según versión
<ViewTransition><PageContent /></ViewTransition>
```

### Direccionalidad por tipo de navegación

```ts
// BASELINE nativo: marca el TIPO de navegación para que el CSS elija la transición correcta
document.startViewTransition({ update: actualizarDOM, types: ['nav-forward'] }); // o 'nav-back'
// (el equivalente de React, unstable_addTransitionType, es experimental — misma advertencia de arriba)
```

```css
/* El CSS responde al tipo de navegación */
:active-view-transition-type(nav-forward) { /* slides */ }
:active-view-transition-type(tab-switch)  { /* fade, sin desplazamiento */ }
```

### Shared element transitions (morph entre pantallas)

```css
/* BASELINE nativo: la foto de la lista MORPHEA hacia la del detalle — mismo
   view-transition-name en ambas vistas (único por elemento montado a la vez) */
.foto-detalle { view-transition-name: photo-42; }
/* (el componente experimental de React lo expone como <ViewTransition name="photo-42">) */
```

### Qué transición según la navegación

```
Navegación JERÁRQUICA (lista → detalle, padre → hijo)  → SLIDES direccionales
Navegación LATERAL (tab ↔ tab, mismo nivel)            → FADE (sin dirección)
Cambio de DATOS (filtro, orden, paginación)            → enter/exit de los items que cambian
REFRESH / recarga de la misma vista                    → none (no animar un refresh)
```

### Gotchas (los que te van a morder)

```
- En SPA, el botón ATRÁS solo transiciona si tu router envuelve esa navegación en
  startViewTransition (el componente experimental de React no lo hace: back se la salta).
  En MPA con @view-transition, el navegador sí anima back/forward solo.
- Un solo elemento por `view-transition-name` puede estar montado a la vez. Dos elementos
  con el mismo name simultáneamente = error / transición rota.
- Es GRATIS en bundle (API nativa) → es la forma preferida de transición de pantalla
  cuando el navegador la soporta; en Android de gama media reciente, sí.
```

---

## ACCESIBILIDAD DE MOVIMIENTO — Matizada, No un Interruptor

`prefers-reduced-motion` NO significa "cero animación". Significa **quitar el MOVIMIENTO** (traslación, desplazamiento, parallax, escalas grandes) que marea — pero **conservar** opacity y color, que AYUDAN a comprender qué cambió. Apagar todo deja al usuario sin las pistas de qué pasó.

```ts
import { useReducedMotion } from 'motion/react';

function Card() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      // Quitar el MOVIMIENTO (translateY), conservar el FADE (opacity ayuda a entender)
      initial={{ opacity: 0, y: reduce ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.15 : 0.3 }}
    />
  );
}
```

```css
@media (prefers-reduced-motion: reduce) {
  /* No matar el fade; sí matar el desplazamiento y el bounce */
  .enter { transform: none; }     /* sin translateY/scale grande */
  .spring { animation: none; }    /* sin overshoot que marea */
  /* opacity y color SIGUEN animando, suaves */
}
```

> Regla: `useReducedMotion` se usa para **sustituir valores de posición** (poner `y: 0` en vez de `y: 12`), NO para apagar el componente. El fade se queda.

### Gate de hover para touch

En pantallas táctiles, `:hover` se dispara al **tap** y queda "pegado" (el estado hover persiste tras tocar). En LATAM, donde el grueso es mobile, esto rompe la sensación. Aislar el hover a dispositivos con puntero real:

```css
@media (hover: hover) and (pointer: fine) {
  .btn:hover { background: var(--surface-hover); }   /* solo en mouse/trackpad, no en touch */
}
```

---

## DETALLES DE CRAFT — Lo que Suma el Último 5%

```
1. scale(0.97) en :active UNIVERSAL — todo elemento interactivo se hunde un pelín al presionar.
   Es el feedback de tap de 22/14, pero como REGLA GLOBAL, no caso por caso.

2. filter: blur(2px) para enmascarar crossfades imperfectos — cuando dos imágenes/estados se
   cruzan en menos de 20px y el corte se nota, un blur sutil durante la transición lo disimula.
   ⚠️ Caro en Safari: úsalo breve y en pocos elementos, nunca permanente.

3. Tooltips: el PRIMERO tiene delay (300-500ms para no molestar); los SUBSECUENTES, si el
   usuario sigue explorando la barra, aparecen INSTANTÁNEOS (ya demostró intención).

4. Timing ASIMÉTRICO enter/exit: lento donde el usuario DECIDE (un menú que se abre con calma
   para que lo lea), rápido donde RESPONDE el sistema (que se cierre veloz, no estorbe).
   Enter ≠ exit casi siempre.

5. Percepción de velocidad: un spinner que gira MÁS RÁPIDO se SIENTE más rápido (aunque la
   carga real sea igual). La velocidad percibida es manipulable — úsalo a favor.

6. Revisar SIEMPRE: la animación en cámara lenta (slow-mo revela los saltos), al DÍA SIGUIENTE
   (ojos frescos ven lo que cansados no), y en DISPOSITIVO REAL (el Android de gama media, no
   tu laptop — lo que vuela en tu Mac puede ir a 15fps allá).
```

---

## TABLA DE AUDITORÍA DE MOVIMIENTO (Before / After / Why)

Herramienta para auditar cualquier animación existente. Si una está en la columna "Before", corregir.

| Before (lo genérico) | After (craft) | Why (el porqué) |
|---|---|---|
| Animar el command palette / atajos de teclado | Aparición instantánea (`initial={false}`) | 100+/día + teclado = velocidad, no show |
| `ease-in` en salidas de UI | `ease-out` en salidas también | ease-out arranca rápido = no se "pega" al irse |
| Curvas nativas (`ease`, `ease-out` de CSS) | `cubic-bezier(0.23,1,0.32,1)` | Las nativas son tímidas; las custom tienen firma |
| Toggle con `@keyframes` | Toggle con `transition` | keyframes reinicia al interrumpir; transition redirige |
| `--ease-spring` cubic-bezier en un drag | Spring real de Motion | El bezier no responde a velocidad ni inercia |
| Popover escala desde `center` | `transform-origin` = var de Radix | Debe crecer DESDE el trigger, no del aire |
| Entra desde `scale(0)` | Entra desde `scale(0.95)` + opacity | Nada aparece de la nada |
| `useEffect` + `setMounted` para entrada | `@starting-style` | Menos JS, lo maneja el compositor |
| `transition: all` / animar `width`/`top` | Solo `transform` + `opacity` | Las únicas que saltan layout+paint (GPU) |
| Var heredable animada en padre con N hijos | `element.style.transform` directo | La var recalcula TODOS los hijos cada frame |
| Drawer animado por JS/rAF | Animación CSS | CSS corre fuera del main thread, gana bajo carga |
| Sheet se descarta por distancia (>50%) | Se descarta por velocidad (>0.11 px/ms) | Un flick rápido y corto debe bastar |
| Sheet se clava en el borde | Rubber-band (damping 0.55) | Fricción, no muro: se siente iOS |
| Texto de IA tipo máquina de escribir | Chunk-reveal 2-5 chars, intervalo irregular | El intervalo fijo delata robot |
| Cursor automatizado en línea recta | Bézier + ruido | La recta grita "lo hizo un bot" |
| Motion narrativo con fade-out final | Frenar EN SECO (Slow-Fast-Boom-Stop) | El final seco = peso físico real |
| Cambio de foco solo con opacity | brightness + saturate + **blur** | El blur da la profundidad de cámara |
| Transición de pantalla con librería pesada | View Transitions API nativa | Cero bytes al bundle (ver 38) |
| `prefers-reduced-motion` apaga TODO | Quita movimiento, conserva opacity/color | El fade ayuda a entender; el movimiento marea |
| `:hover` sin gate en mobile | `@media (hover:hover) and (pointer:fine)` | En touch el hover se queda pegado al tap |
| Mismo timing enter y exit | Asimétrico (lento decide / rápido responde) | El usuario lee al entrar, no estorba al salir |

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

| Archivo | Relación con este (41) |
|---|---|
| **`22-LIBRERIAS-Y-CRAFT.md`** | `22` aporta el CÓMO de las **7 animaciones baseline** (la lista canónica vive en DESIGN-CORE §6) y el stack (Motion/GSAP/Lottie). `41` es el CRITERIO encima: cuándo NO animar, cómo se siente. No dupliques las baseline aquí. |
| **`14-LEYES-DE-DISENO.md`** | `14` tiene los **números exactos** (duraciones, las curvas nombradas `--ease-out`/`--ease-in`/`--ease-spring`) y el sistema de movimiento. `41` añade el porqué perceptual (salidas con `ease-out`, ya alineado con `14` y `DESIGN-CORE.md`). |
| **`16-DIRECCION-DE-ARTE.md`** | El **motion signature** (PASO 0.7): la firma de movimiento de la marca. `41` da el vocabulario (curvas fuertes, Slow-Fast-Boom-Stop) para ejecutar esa firma con carácter. |
| **`38-PERFORMANCE-BUDGET.md`** | `38` mide el **PESO** (bytes, bundle, gate de CI). `41` cubre el **RUNTIME** (fps en gama media): transform/opacity, CSS fuera del main thread, View Transitions = 0 bytes. Distintos ejes, mismo objetivo: que vuele en LATAM. |
| **`10-DESIGN-TOKENS.md`** | Donde viven los tokens de easing/duración. Si adoptas las curvas fuertes de `41`, regístralas como tokens ahí (y revisa la línea de `ease-in` en salidas). |
| **`15-PATRONES-UX.md`** | Rendimiento percibido (skeletons, optimistic UI). La percepción de velocidad de `41` (spinner más rápido se siente más rápido) es la misma idea aplicada al movimiento. |
| **`28-INGENIERIA-NEXTJS.md`** | El App Router donde se montan `<ViewTransition>` y `router.push()` para las transiciones direccionales nativas de `41`. |
