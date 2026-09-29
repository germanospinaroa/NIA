# LIBRERÍAS Y CRAFT — Las Herramientas Concretas del Diseño Premium

> **Cuándo cargar este archivo:**
> - SIEMPRE al construir o mejorar UI (junto con `14-LEYES-DE-DISENO.md`, `16-DIRECCION-DE-ARTE.md` y `15-PATRONES-UX.md`)
> - Es OBLIGATORIO leerlo antes de escribir componentes — sin él, el diseño sale plano
>
> **Por qué existe:** El error que vuelve genérico al diseño no es solo de reglas — es de HERRAMIENTAS. Pedirle al agente "usa animaciones premium" sin decirle CON QUÉ es como pedir cocina gourmet sin ingredientes. Este archivo prescribe las librerías concretas que usan las apps de élite en 2026 y, más importante, DEFINE LAS ANIMACIONES QUE DEBEN EXISTIR SIEMPRE. El dato que lo justifica: las webs con elementos de UI animados ven la conversión subir hasta 40% en acciones clave (cifra ilustrativa del sector, no verificada).

---

## REGLA MAESTRA: Animar con Propósito, No Decorar

La regla de oro de toda la investigación: usar las librerías de animación selectivamente para interacción y momentos clave, NO en todas las pantallas densas de datos. Animar para ayudar a entender y deleitar, no para distraer. Los errores a evitar: animar todo en vez de los momentos clave, usar una librería pesada para transiciones simples, mezclar varias librerías sin razón, e ignorar `prefers-reduced-motion`.

Por eso este archivo no dice "anima todo" — dice QUÉ animar siempre (abajo) y con qué herramienta.

---

## STACK DE LIBRERÍAS PRESCRITO (2026)

### Animación — la decisión por defecto
```
MOTION (antes Framer Motion) → LA elección por defecto para UI en React.
  - ~6M descargas semanales, el estándar de la industria, usado por Framer y Figma.
  - API declarativa: defines cómo se ve el elemento en cada estado y la librería anima la
    transición. Soporta gestos, layout animations, y exit animations con AnimatePresence.
  - Instalación: npm i motion  →  import { motion, AnimatePresence } from "motion/react"
  - Úsala para: entradas, transiciones entre pantallas, micro-interacciones, gestos, modales.

GSAP → solo para secuencias complejas coreografiadas (timelines, animaciones tipo juego).
  - Modelo imperativo basado en timeline. Performance "a prueba de balas".
  - Úsala SOLO cuando Motion se queda corto (animaciones de varios pasos sincronizados).

TAILWIND CSS / CSS nativo → para animaciones simples (hover, fade, pulse).
  - CSS nativo ahora soporta linear() easing para simular spring sin JS.
  - No traigas una librería para un fade simple — CSS basta.

LOTTIE (lottie-react) → para ilustraciones vectoriales animadas complejas.
  - Animaciones JSON exportadas de After Effects o descargadas de LottieFiles.
  - Úsala para: onboarding, empty states ilustrados, celebraciones, estados de éxito.
  - Es lo que da el toque "wow" que el código puro no logra en ilustraciones.
  - PRESUPUESTO: usar dotLottie (.lottie) en vez de JSON cuando se pueda; cargar el player
    DIFERIDO (post-interacción/idle, nunca en el bundle crítico). Límite: una animación
    >50KB de JSON no entra. Para celebraciones simples, CSS/SVG antes que Lottie —
    en la gama media LATAM cada MB es churn (38).

REGLA ANTI-CAOS: una app usa Motion como base. GSAP y Lottie se SUMAN solo cuando aportan algo
que Motion no da. No mezclar 3 librerías de animación "porque sí".
```

### Íconos — más allá de Lucide
```
LUCIDE (lucide-react) → el set funcional ÚNICO por defecto para los íconos de UI.
  - Limpio, ligero, integra con shadcn/ui, 1.500+ íconos. El "just works".

PHOSPHOR (@phosphor-icons/react) → capa expresiva OPCIONAL sobre el set base.
  - ~1.280 íconos × 6 pesos (thin, light, regular, bold, fill, duotone).
  - El peso FILL es ideal para estados activos (un ícono de navegación seleccionado).
  - El peso DUOTONE es premium para ilustraciones de features y onboarding.
  - Doctrina: Lucide es el set funcional único por defecto; Phosphor es capa expresiva
    OPCIONAL (duotone en onboarding, fill en estados activos) — si se usa, se documenta
    en FICHA-ARTE y se usa consistente en toda la app.

ICONOIR / TABLER → alternativas gratis y completas si se necesita otro estilo.

LORDICON / USEANIMATIONS → íconos ANIMADOS (micro-interacciones).
  - Íconos que reaccionan al tap/hover. Para navegación, botones de like, onboarding.
  - Cruzaron de novedad a utilidad: dan vida sin esfuerzo de código.

REGLA: un solo set de íconos funcionales por app (mezclar sets se ve incoherente). Los
animados o duotone se suman para momentos puntuales, no reemplazan el set base.

REGLA ANTI-EMOJI (dura): un emoji JAMÁS hace de ícono — ni en la app (anti-patrón de
CLAUDE.md) ni en landing/onboarding/paywall — salvo que el usuario lo pida explícitamente.
Todo ícono es SVG de estas librerías; en piezas de venta va además con CONTENEDOR premium
(chip 40-48px, fondo acento 8-12%): el SISTEMA DE ÍCONOS Y DETALLES completo vive en `55`,
y los componentes <IconChip> y <GradientBorderCard> en `49`.
```

### Gráficos y datos
```
RECHARTS → por defecto para gráficos en React (barras, líneas, áreas, donuts).
  - Declarativo, se integra bien, fácil de estilizar con la paleta de la app.
VISX (de Airbnb) → cuando se necesita control fino y gráficos custom (sobre D3).
NIVO → gráficos hermosos con buen default estético.
Specs de cómo deben verse y animarse: `docs/sistema/17-VISUALIZACION-DATOS.md`.
```

### Componentes base
```
SHADCN/UI → componentes accesibles y sin estilo impuesto (se adaptan a tu dirección de arte).
  La base recomendada. NO usar librerías con estética fuerte propia (Material UI) que
  imponen un look genérico y matan la identidad.
```

---

## LAS ANIMACIONES QUE DEBEN EXISTIR SIEMPRE (baseline no negociable)

La lista canónica de las 7 baseline vive en **`DESIGN-CORE.md` §6** — esa es la fuente única de la doctrina; aquí no se re-enumera. Este archivo aporta el CÓMO (herramienta y patrón de implementación por baseline), y **`53-PANTALLA-CANONICA.md`** las muestra COMPUESTAS en una pantalla real compilable (CountUp, ProgressRing, stagger y nav con layoutId, listos para copiar la composición):

```
#1 stagger de entrada  → Motion: variants con staggerChildren 0.05-0.08 en el contenedor padre
#2 conteo de héroe     → Motion: useMotionValue + animate (componente CountUp — código en 49 §10 y 53)
#3 anillos / barras    → SVG strokeDashoffset animado (49 §11) · barras: scaleX/scaleY con origin
#4 tap <150ms          → whileTap={{ scale: 0.97 }} (o active:scale-[0.97] en CSS puro)
#5 tabs / pantallas    → AnimatePresence + variants de entrada/salida · indicador con layoutId
#6 modales / sheets    → vaul para bottom sheets (49 §6) · Dialog: scale 0.95→1 + fade, jamás scale(0)
#7 celebración         → spring de Motion o micro-Lottie — SOLO en hitos reales
```

Todas respetan `prefers-reduced-motion`. NO es "cero animación": quitar solo movimiento/posición y CONSERVAR fades/color que ayudan a comprender (NUNCA matar todo a `0.01ms` — patrón correcto en `10-DESIGN-TOKENS.md`). Una parte real de usuarios lo activa (y crece con la edad): respetarlo SIEMPRE.

**LAS 4 REGLAS DE EJECUCIÓN que separan estas baseline "amateur" de "premium"** (detalle en `41`; sin esto, las 7 de arriba se ven hechas por IA):
```
1. ARRANQUE PROPORCIONAL — nada entra desde 0. Un elemento aparece desde opacity 0 + translateY
   8-16px, o scale 0.96 (elementos grandes 0.9) — NUNCA desde scale(0) ni opacity 0 con un salto
   grande de posición. "Aparecer de la nada" es el tell #1 de motion amateur (Rauno Freiberg).
2. SALIDAS MÁS RÁPIDAS QUE ENTRADAS — el usuario espera para actuar. Default: entra 250-300ms,
   sale 150-200ms. Un modal que tarda lo mismo en irse que en venir se siente lento.
3. SOLO transform + opacity — las únicas dos que corren en GPU sin recalcular layout. Animar
   width/height/top/left/margin tartamudea en el Android de gama media de LATAM (ver `41`/`38`).
4. SPRING para lo interactivo/gestual (toggle, sheet, drag), CURVA de duración para opacity/color
   y fades fijos. Reservar el overshoot/bounce SOLO para la celebración #7 (nunca en un tap
   rutinario — bounce en todo = demo técnica, no craft).
```

---

## EJEMPLO: De Genérico a Premium (el caso del score 53)

Una pantalla con un score y consejos (tipo dashboard de bienestar) NO debe entregarse así:
```
❌ El número 53 aparece estático
❌ El anillo ya está pintado al cargar
❌ Los consejos aparecen todos de golpe
❌ Tocar un consejo no hace nada visible
❌ Cambiar de tab es un corte seco
```

Debe entregarse así:
```
✅ Al cargar: el anillo se dibuja de 0 a 53% (700ms), el número cuenta 0→53 sincronizado
✅ El glow del anillo aparece con un fade suave (solo si la FICHA-ARTE lo autoriza — el glow está restringido por defecto: 16/DESIGN-CORE §4)
✅ El badge "Zona amarilla" entra con un pop sutil (spring) tras el número
✅ Los consejos entran escalonados (cada uno 60ms después del anterior, fade + slide-up)
✅ Cada consejo tiene feedback de tap (scale 0.98) y se expande con layout animation
✅ Cambiar a "Tendencia"/"Acciones" transiciona con fade + slide (300ms)
✅ El ícono de la pestaña activa usa Phosphor fill (relleno) + color de acento
✅ Si hay un hito (primera lectura, racha), un micro-Lottie de celebración
```
Mismo contenido, misma estructura — la diferencia entre "lo hizo una IA" y "lo hizo un estudio" está TODA en esta capa de movimiento y craft.

---

## CHECKLIST DE LIBRERÍAS Y CRAFT

```
LIBRERÍAS INSTALADAS Y USADAS
[ ] Motion (motion/react) para animaciones de UI
[ ] Lucide para íconos base + Phosphor (fill/duotone) donde aporta
[ ] Recharts u otra para gráficos (si hay datos)
[ ] Lottie para ilustraciones animadas / celebraciones (si aplica)
[ ] shadcn/ui como base de componentes

ANIMACIONES BASELINE (todas presentes)
[ ] Entrada escalonada en cada pantalla principal
[ ] Conteo animado de números héroe
[ ] Dibujado de anillos / crecimiento de barras
[ ] Feedback de tap <150ms en todo interactivo
[ ] Transiciones entre pantallas/tabs
[ ] Aparición suave de modales/sheets
[ ] Celebración en hitos reales
[ ] prefers-reduced-motion respetado en TODAS

PROPÓSITO (no decoración)
[ ] Cada animación ayuda a entender o deleita, no distrae
[ ] No se mezclan librerías sin razón
[ ] Las pantallas densas de datos NO están sobre-animadas
[ ] El ícono de estado activo se distingue (fill/color), nunca invisible
```
