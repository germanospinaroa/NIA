# PANTALLA CANÓNICA — La pantalla ejemplar: copia la COMPOSICIÓN, nunca los valores

> **Cuándo cargar este archivo:**
> - Al construir la PRIMERA pantalla de cualquier app (junto con `DESIGN-CORE.md` + la Ficha de Dirección de Arte)
> - Cuando una pantalla te está saliendo "básica" (input + 2 botones + vacío) y no sabes cómo se ve una llena de valor
> - Antes de puntuar /40: compara tu pantalla contra estas dos en densidad, motion y estados
>
> **Por qué existe:** este archivo existe porque un implementador copia mejor de lo que deduce. El SO estaba lleno de reglas correctas y vacío de ejemplos completos — y un modelo de esfuerzo medio imita un ejemplo mucho mejor que sigue 40 reglas. Compón tus pantallas COMO estos ejemplos — misma densidad de valor, mismos patrones de motion, misma estructura de estados — cambiando SIEMPRE tokens, fuentes, contenido y layout según la Ficha de Dirección de Arte del proyecto.
>
> ⛔ **Copiar los hex/fuentes de estos ejemplos = fallo grave.** Si tu app usa el crema+verde tinta de "Capítulo" o el pizarra+latón de "Umbral", falla el test de intercambiabilidad de `16`/DESIGN-CORE §4 y hay que rederivar. Los dos ejemplos son deliberadamente OPUESTOS en todo lo derivable (modo, fuentes, radios, dispositivo, firma de motion) precisamente para demostrar que la composición es la misma y la piel nunca.
>
> ⚠️ **COLISIÓN NICHO+MODO:** si tu app cae en el MISMO nicho y modo que un ejemplo (otra app de finanzas oscura como "Umbral", otra de hábitos clara como "Capítulo"), la divergencia es OBLIGATORIA y triple: otra familia tipográfica, hue del acento a ≥60° de distancia, y otro dispositivo ownable. El revisor-visual tiene las paletas de estos ejemplos VETADAS.

---

## CÓMO LEER LOS EJEMPLOS

Cada ejemplo es la **home mobile (375px)** de una app ficticia, completa y compilable: un `globals.css` con `@theme` de Tailwind v4 + un `page.tsx`. Los comentarios `← ...` señalan QUÉ patrón del SO ilustra cada bloque. Los dos cumplen el checklist canónico de DESIGN-CORE §7: shell `min-h-dvh` con nav al fondo, jerarquía de 4 niveles, 60-30-10, áreas táctiles ≥44px, las 7 baseline de motion, estados empty/loading definidos, cero vacío muerto, ≥1 dispositivo ownable, fechas reales.

```
EJEMPLO A — "Capítulo" (hábitos de lectura) · CLARA/EDITORIAL · serif cálida · anillo de progreso
             · grano feTurbulence + borde-firma · motion sereno 300ms
EJEMPLO B — "Umbral" (finanzas personales) · OSCURA/DENSA · grotesk apretada · barra de presupuesto
             · numerales tabulares + regla vertical de datos · motion seco 200-250ms
```

> **Datos semilla:** los datos mock de ambos ejemplos ya cumplen la regla «LA APP NUNCA SE ENSEÑA VACÍA» del `32`: nombres del mundo del avatar ("Elena", "Pedro Páramo"), comercios reales ("Mercado — Éxito", "Spotify"), montos plausibles en COP, fechas recientes y progreso al 54-68% — jamás "User 1", 0% ni 100%. Tus pantallas se componen (y se FOTOGRAFÍAN para el cierre y el carrusel) igual: con el seed demo del proyecto, nunca vacías.

---

## EJEMPLO A — "Capítulo" · hábitos de lectura · dirección CLARA/EDITORIAL

Mundo del sujeto: papel, tinta, bibliotecas, tardes de lectura → modo claro cálido, serif con carácter, verde tinta de pluma como acento (NO terracota: crema+serif+terracota es combo quemado, lista anti-slop).

### A.1 — `app/globals.css` (completo)

```css
@import 'tailwindcss';

/* ============================================================
   CAPÍTULO — tokens del brand kit (derivados en 16 PASO 0)
   Neutros CÁLIDOS de una sola familia (tinte papel) — jamás gris puro
   ============================================================ */
:root {
  /* SUPERFICIES — claro cálido con 3 niveles de profundidad (base/elevado/hundido) */
  --surface-base: #F6F1E7;        /* papel — jamás #FFF puro */
  --surface-primary: #FBF8F1;     /* cards */
  --surface-elevated: #FFFEFA;    /* card héroe, dropdowns */
  --surface-tertiary: #EDE6D6;    /* inputs, áreas hundidas */
  --surface-overlay: rgba(43, 38, 32, 0.5);

  /* TEXTOS — casi-negro CON tinte marrón, jamás #000 */
  --text-primary: #2B2620;
  --text-secondary: #6E6557;
  --text-tertiary: #9C9181;
  --text-inverse: #FBF8F1;

  /* BORDES */
  --border-default: #E3DAC6;
  --border-strong: #CDC1A8;
  --border-focus: var(--brand-primary);

  /* MARCA — verde tinta de pluma, SOLO en acción primaria y dato clave (60-30-10) */
  --brand-primary: #3F5D45;
  --brand-primary-hover: #35503B;
  --brand-primary-soft: rgba(63, 93, 69, 0.10);
  --brand-primary-text: #FBF8F1;

  /* SEMÁNTICOS — solo en su función */
  --status-success: #4A7C52;
  --status-success-soft: rgba(74, 124, 82, 0.14);
  --status-error: #B4483C;
  --status-error-soft: rgba(180, 72, 60, 0.12);
  --status-warning: #B07C2E;
  --status-warning-soft: rgba(176, 124, 46, 0.14);

  /* SOMBRAS con el TINTE cálido del neutro (49 Parte 2c) — nunca negro puro */
  --shadow-tint: 62 50 36;
  --shadow-sm: 0 1px 2px rgb(var(--shadow-tint) / 0.06);
  --shadow-md: 0 4px 10px -2px rgb(var(--shadow-tint) / 0.10);
  --shadow-lg: 0 14px 30px -12px rgb(var(--shadow-tint) / 0.16);

  /* RADIOS del brand kit — generosos, de libro encuadernado (uno por rol, toda la app) */
  --radius-sm: 0.5rem;     /* 8px  — chips */
  --radius-md: 0.875rem;   /* 14px — botones, inputs */
  --radius-lg: 1.25rem;    /* 20px — cards */
  --radius-xl: 1.5rem;     /* 24px — sheets */

  /* TIPOGRAFÍA de la ficha — display serif con carácter + sans humanista (jamás Inter/Roboto)
     En Next: import { Petrona, Karla } from 'next/font/google' y asignar a estas vars */
  --font-display: 'Petrona', Georgia, serif;
  --font-body: 'Karla', 'Segoe UI', sans-serif;

  /* MOTION — firma serena de app de lectura: 300ms, UNA familia de curvas */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --motion-base: 300ms;
}

/* Mapping Tailwind v4 — los tokens son la única fuente de verdad */
@theme inline {
  --color-background: var(--surface-base);
  --color-foreground: var(--text-primary);
  --color-card: var(--surface-primary);
  --color-primary: var(--brand-primary);
  --color-primary-foreground: var(--brand-primary-text);
  --color-muted: var(--surface-tertiary);
  --color-muted-foreground: var(--text-secondary);
  --color-border: var(--border-default);
  --font-display: var(--font-display);
  --font-body: var(--font-body);
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
}

/* FONDO CON PROFUNDIDAD (32: jamás beige plano) — 2 puntos de luz de baja saturación.
   El fondo vive en una capa fija propia (pseudo-elemento position:fixed), NO en
   background-attachment: fixed — iOS Safari lo ignora o lo repinta con jank al scrollear. */
body {
  background: var(--surface-base);
  color: var(--text-primary);
  font-family: var(--font-body);
}
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(1100px 640px at 50% -10%, #FDFAF3 0%, transparent 58%),
    radial-gradient(760px 540px at 104% 2%, rgba(63, 93, 69, 0.07) 0%, transparent 55%),
    var(--surface-base);
}

/* ← DISPOSITIVO OWNABLE 1/2: grano de papel (feTurbulence) sobre toda la app */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 40; /* encima del contenido, debajo de toasts (--z-toast: 50) */
  pointer-events: none;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E");
}

/* ← DISPOSITIVO OWNABLE 2/2: borde-firma de la card héroe (regla superior de tinta,
   como la portadilla de un libro) — SOLO en el objeto principal, nunca regado */
.card-firma {
  border: 1px solid var(--border-strong);
  border-top: 3px solid var(--brand-primary);
  box-shadow: var(--shadow-md);
}

/* Skeleton (misma receta del 49 §8) */
.skeleton {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: var(--surface-tertiary);
}
.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.55), transparent);
  animation: skeleton-shimmer 1.6s var(--ease-out) infinite;
}
@keyframes skeleton-shimmer { 100% { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) {
  .skeleton::after { animation: none; }
}
```

### A.2 — `app/page.tsx` (completo)

```tsx
'use client';

// EJEMPLO A — "Capítulo": home de hábitos de lectura, 375px, dirección clara/editorial.
// Copia la COMPOSICIÓN de esta pantalla; deriva TODOS los valores de tu propia ficha.

import { useEffect, useState } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Variants,
} from 'motion/react';
import { BarChart3, BookOpen, Check, Clock, Home, Library, Plus, User } from 'lucide-react';

// ——— Dominio con contenido REAL (anti-slop: jamás lorem ipsum ni "Dashboard") ———
type EstadoHabito = 'hecho' | 'pendiente' | 'vencido';

interface Habito {
  id: string;
  titulo: string;
  detalle: string;
  hora: string;
  estado: EstadoHabito;
}

const HABITOS: Habito[] = [
  { id: 'h1', titulo: 'Leer 20 páginas de Pedro Páramo', detalle: 'Vas en la página 84 de 128', hora: '21:30', estado: 'pendiente' },
  { id: 'h2', titulo: 'Nota de lectura del capítulo 7', detalle: 'Escribiste 3 notas esta semana', hora: '08:00', estado: 'hecho' },
  { id: 'h3', titulo: 'Repasar subrayados de la semana', detalle: 'Venció el viernes 4 de julio', hora: '19:00', estado: 'vencido' },
];

// ← Regla UX 15: el estado temporal se comunica VISUALMENTE (chip + ícono, nunca solo color)
const CHIP_ESTADO: Record<EstadoHabito, { label: string; clase: string }> = {
  hecho: { label: 'Hecho', clase: 'bg-[var(--status-success-soft)] text-[var(--status-success)]' },
  pendiente: { label: 'Hoy', clase: 'bg-[var(--surface-tertiary)] text-[var(--text-secondary)]' },
  vencido: { label: 'Vencido', clase: 'bg-[var(--status-error-soft)] text-[var(--status-error)]' },
};

// ← baseline #2: conteo animado del número héroe — nunca un "12" estático
function CountUp({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const texto = useTransform(mv, (v) => Math.round(v).toString());
  useEffect(() => {
    const ctrl = animate(mv, value, { duration: reduce ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] });
    return () => ctrl.stop();
  }, [value, mv, reduce]);
  return <motion.span className="tabular-nums">{texto}</motion.span>;
}

// ← baseline #3: el anillo SE DIBUJA de 0 al valor (strokeDashoffset animado)
function ProgressRing({ value, size = 88 }: { value: number; size?: number }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} role="img" aria-label={`Meta de julio: ${value}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={10} stroke="var(--brand-primary-soft)" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={10}
        stroke="var(--brand-primary)" strokeLinecap="round" strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - value / 100) }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

// ← copy contextual, no "Bienvenido" genérico
function saludoPorHora(h: number): string {
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

// ← baseline #1: stagger de entrada 60ms — la mejora más barata de "estático" a "premium"
const lista: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

const NAV = [
  { id: 'hoy', label: 'Hoy', icono: Home },
  { id: 'biblioteca', label: 'Biblioteca', icono: Library },
  { id: 'progreso', label: 'Progreso', icono: BarChart3 },
  { id: 'perfil', label: 'Perfil', icono: User },
] as const;

export default function HomeCapitulo() {
  const [habitos] = useState<Habito[]>(HABITOS);
  const [tab, setTab] = useState<(typeof NAV)[number]['id']>('hoy');
  const ahora = new Date();
  // ← Regla UX 13: fecha REAL visible, no "Esta semana"
  const fecha = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' }).format(ahora);

  return (
    // ← 32: shell min-h-dvh + flex-col, contenido flex-1, nav SIEMPRE al fondo — cero vacío muerto
    <div className="flex min-h-dvh flex-col">
      <motion.main variants={lista} initial="hidden" animate="visible"
        className="mx-auto w-full max-w-md flex-1 px-4 pt-6 pb-4">

        {/* ——— HEADER: contexto, no decoración ——— */}
        <motion.header variants={item} className="mb-6">
          <p className="text-[13px] font-medium capitalize text-[var(--text-tertiary)]">{fecha}</p>
          {/* ← nivel 1 de jerarquía: display serif, 1 por pantalla */}
          <h1 className="mt-1 font-display text-[32px] font-bold leading-[1.1] tracking-[-0.02em] text-balance">
            {saludoPorHora(ahora.getHours())}, Elena
          </h1>
        </motion.header>

        {/* ——— OBJETO PRINCIPAL: StatCard héroe (17: UN dato héroe + insight interpretado) ——— */}
        <motion.section variants={item} aria-label="Tu racha de lectura"
          className="card-firma rounded-[var(--radius-lg)] bg-[var(--surface-elevated)] p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              {/* ← nivel 4: label · nivel 1: dato · nivel 3: insight — números centrados con su label */}
              <p className="text-[13px] font-medium text-[var(--text-secondary)]">Racha de lectura</p>
              <p className="mt-1 font-display text-[40px] font-bold leading-[1.1] tracking-[-0.02em]">
                <CountUp value={12} /> <span className="text-[17px] font-semibold text-[var(--text-secondary)]">días</span>
              </p>
              <p className="mt-2 text-[14px] text-[var(--text-secondary)]">↑ 3 días más que en junio</p>
            </div>
            <div className="relative shrink-0">
              <ProgressRing value={68} />
              <span className="absolute inset-0 flex items-center justify-center text-[15px] font-semibold tabular-nums">
                68%
              </span>
            </div>
          </div>
          {/* ← 15: next best action — LA acción que conviene ahora, dentro del héroe */}
          <motion.button whileTap={{ scale: 0.97 }} type="button"
            className="mt-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-[var(--radius-md)]
                       bg-[var(--brand-primary)] text-base font-semibold text-[var(--brand-primary-text)]
                       shadow-[var(--shadow-sm)] transition-colors duration-150 hover:bg-[var(--brand-primary-hover)]
                       [touch-action:manipulation]">
            {/* ← baseline #4: whileTap 0.97 · CTA héroe VIVO, nombra su consecuencia (42) */}
            <BookOpen size={20} aria-hidden="true" />
            Retomar Pedro Páramo · pág. 84
          </motion.button>
        </motion.section>

        {/* ——— LISTA DE HOY: chips de estado + horas reales (densidad = valor, no adorno) ——— */}
        <motion.section variants={item} className="mt-8" aria-label="Hábitos de hoy">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[19px] font-semibold">Tu plan de hoy</h2>
            {/* ← Regla UX 12: la acción de crear vive JUNTO a la lista que alimenta */}
            <motion.button whileTap={{ scale: 0.97 }} type="button" aria-label="Crear hábito de lectura"
              className="flex size-11 items-center justify-center rounded-[var(--radius-md)]
                         bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]">
              <Plus size={20} aria-hidden="true" />
            </motion.button>
          </div>

          {habitos.length === 0 ? (
            /* ← estado EMPTY que activa (15): título que no dice "vacío" + CTA dominante */
            <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border
                            border-[var(--border-default)] bg-[var(--surface-primary)] px-6 py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-[var(--brand-primary-soft)]">
                <BookOpen size={28} color="var(--brand-primary)" aria-hidden="true" />
              </div>
              <h3 className="font-display text-[19px] font-semibold text-balance">Empieza tu primer capítulo</h3>
              <p className="max-w-[32ch] text-[14px] text-[var(--text-secondary)]">
                Elige un libro y una hora — Capítulo te acompaña página a página.
              </p>
              <motion.button whileTap={{ scale: 0.97 }} type="button"
                className="mt-1 h-12 rounded-[var(--radius-md)] bg-[var(--brand-primary)] px-6
                           text-base font-semibold text-[var(--brand-primary-text)]">
                Crear mi primer hábito
              </motion.button>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {habitos.map((h) => (
                /* ← toda la fila es tocable (≥44px), con feedback — nada que parece botón y no responde */
                <motion.li key={h.id} variants={item}>
                  <motion.button whileTap={{ scale: 0.98 }} type="button"
                    className="flex w-full items-start gap-3 rounded-[var(--radius-lg)] border
                               border-[var(--border-default)] bg-[var(--surface-primary)] p-4 text-left
                               [touch-action:manipulation]">
                    <span aria-hidden="true"
                      className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${
                        h.estado === 'hecho'
                          ? 'bg-[var(--status-success)] text-[var(--text-inverse)]'
                          : 'border border-[var(--border-strong)]'
                      }`}>
                      {h.estado === 'hecho' && <Check size={14} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      {/* ← min-w-0 + truncate: probado con títulos larguísimos (43) */}
                      <span className="block truncate text-[15px] font-medium">{h.titulo}</span>
                      <span className="mt-0.5 block text-[13px] text-[var(--text-secondary)]">{h.detalle}</span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1.5">
                      {/* ← chip w-fit que ABRAZA su contenido (49 §4), estado con texto no solo color */}
                      <span className={`inline-flex w-fit items-center rounded-[var(--radius-sm)] px-2.5 py-1
                                        text-[12px] font-medium ${CHIP_ESTADO[h.estado].clase}`}>
                        {CHIP_ESTADO[h.estado].label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[12px] tabular-nums text-[var(--text-tertiary)]">
                        <Clock size={12} aria-hidden="true" />
                        {h.hora}
                      </span>
                    </span>
                  </motion.button>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.section>

        {/* ——— MICROCOPY DE CONFIANZA (32): una línea que llena y tranquiliza ——— */}
        <motion.p variants={item} className="mt-6 text-center text-[13px] text-[var(--text-tertiary)]">
          Tus notas y subrayados viven solo en tu cuenta.
        </motion.p>
      </motion.main>

      {/* ——— BOTTOM NAV: 4 destinos, activo con acento + fill, safe-area (49 §5) ——— */}
      <nav aria-label="Navegación principal"
        className="sticky bottom-0 border-t border-[var(--border-default)] bg-[var(--surface-elevated)]
                   pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex h-16 max-w-md items-stretch justify-around px-2">
          {NAV.map(({ id, label, icono: Icono }) => {
            const activo = tab === id;
            return (
              <motion.button key={id} whileTap={{ scale: 0.97 }} type="button" onClick={() => setTab(id)}
                aria-current={activo ? 'page' : undefined}
                className="relative flex min-w-16 flex-col items-center justify-center gap-1 [touch-action:manipulation]">
                {/* ← baseline #5: el indicador activo se DESLIZA entre tabs (layoutId) */}
                {activo && (
                  <motion.span layoutId="tab-activa" aria-hidden="true"
                    className="absolute top-0 h-0.5 w-8 rounded-full bg-[var(--brand-primary)]" />
                )}
                <Icono size={24} aria-hidden="true"
                  color={activo ? 'var(--brand-primary)' : 'var(--text-tertiary)'}
                  strokeWidth={activo ? 2.4 : 2} />
                <span className={`text-[11px] font-medium ${
                  activo ? 'text-[var(--brand-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                  {label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
```

> Estados restantes de esta pantalla (obligatorios igual): **loading** = `StatCardSkeleton` + 3 filas skeleton espejando la lista (receta exacta en `49` §8, la clase `.skeleton` ya está en el CSS de arriba); **error/offline** = card inline con qué-pasó + qué-hacer y botón "Reintentar" (copy de `42`). El empty ya está implementado arriba en la rama `habitos.length === 0`.

---

## EJEMPLO B — "Umbral" · finanzas personales · dirección OSCURA/DENSA

Mundo del sujeto: control, precisión, extractos bancarios, editorial financiera → modo oscuro DERIVADO (no por reflejo: la razón escrita es "app que se consulta de noche antes de decidir gastos; densidad de datos pide fondo que recede"). Casi-negro CON tinte pizarra (no #000), acento latón NO neón usado solo en el dato clave, profundidad por ELEVACIÓN de superficies (no sombras), grotesk con tracking apretado.

### B.1 — `app/globals.css` (completo)

```css
@import 'tailwindcss';

/* ============================================================
   UMBRAL — tokens del brand kit
   Neutros FRÍOS pizarra de una sola familia · profundidad por superficies
   más claras (dark: elevar con luz, no con sombra — DESIGN-CORE §2)
   ============================================================ */
:root {
  /* SUPERFICIES — casi-negro con tinte azul-pizarra, 3 niveles por LUMINANCIA */
  --surface-base: #0E0F13;        /* jamás #000 */
  --surface-primary: #15171D;
  --surface-elevated: #1C1F27;    /* héroe, dropdowns: MÁS CLARO = más cerca */
  --surface-tertiary: #101116;    /* hundido: inputs, wells */
  --surface-overlay: rgba(8, 9, 12, 0.72);

  /* TEXTOS — casi-blanco frío, jamás #FFF */
  --text-primary: #E8EAEF;
  --text-secondary: #9CA1AD;
  --text-tertiary: #676D7B;
  --text-inverse: #0E0F13;

  /* BORDES — en dark, el borde claro sutil define la elevación */
  --border-default: #24272F;
  --border-strong: #363A45;
  --border-focus: var(--brand-primary);
  --card-elevated-border: rgba(255, 255, 255, 0.07);

  /* MARCA — latón viejo (NO neón, NO morado/cian): solo en el dato clave y el CTA */
  --brand-primary: #C9A24B;
  --brand-primary-hover: #D9B463;
  --brand-primary-soft: rgba(201, 162, 75, 0.12);
  --brand-primary-text: #14100A;

  /* SEMÁNTICOS desaturados para dark (10-20% menos saturación) */
  --status-success: #5CA97A;
  --status-success-soft: rgba(92, 169, 122, 0.14);
  --status-error: #D06A5E;
  --status-error-soft: rgba(208, 106, 94, 0.14);
  --status-warning: #C99A4B;
  --status-warning-soft: rgba(201, 154, 75, 0.14);

  /* SOMBRAS mínimas (la elevación la dan las superficies) — tinte pizarra */
  --shadow-tint: 5 6 10;
  --shadow-sm: 0 1px 2px rgb(var(--shadow-tint) / 0.5);
  --shadow-md: 0 6px 16px -6px rgb(var(--shadow-tint) / 0.6);

  /* RADIOS del brand kit — más secos que Capítulo (precisión, no calidez) */
  --radius-sm: 0.5rem;     /* 8px  — chips (radius-sm canónico) */
  --radius-md: 0.75rem;    /* 12px — botones, inputs */
  --radius-lg: 1rem;       /* 16px — cards */
  --radius-xl: 1.25rem;    /* 20px — sheets */

  /* TIPOGRAFÍA — grotesk display con tracking APRETADO (tratamiento propio) + sans neutra
     En Next: import { Archivo, Instrument_Sans } from 'next/font/google' */
  --font-display: 'Archivo', 'Helvetica Neue', sans-serif;
  --font-body: 'Instrument Sans', 'Segoe UI', sans-serif;
  --tracking-display: -0.035em;

  /* MOTION — firma seca y precisa: 200-250ms, curva firme (una sola familia en toda la app) */
  --ease-out: cubic-bezier(0.32, 0.72, 0, 1);
  --motion-base: 220ms;
}

@theme inline {
  --color-background: var(--surface-base);
  --color-foreground: var(--text-primary);
  --color-card: var(--surface-primary);
  --color-primary: var(--brand-primary);
  --color-primary-foreground: var(--brand-primary-text);
  --color-muted: var(--surface-tertiary);
  --color-muted-foreground: var(--text-secondary);
  --color-border: var(--border-default);
  --font-display: var(--font-display);
  --font-body: var(--font-body);
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
}

/* FONDO CON PROFUNDIDAD — luz fría arriba, nunca negro plano ni orbe de gradiente.
   Capa fija propia (pseudo-elemento position:fixed), NO background-attachment: fixed —
   iOS Safari lo ignora o lo repinta con jank al scrollear. */
body {
  background: var(--surface-base);
  color: var(--text-primary);
  font-family: var(--font-body);
}
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(900px 520px at 50% -12%, rgba(201, 162, 75, 0.05) 0%, transparent 55%),
    linear-gradient(180deg, #12141A 0%, var(--surface-base) 320px),
    var(--surface-base);
}

/* ← DISPOSITIVO OWNABLE: la REGLA VERTICAL DE DATOS — estilo editorial financiera.
   Todo dato importante cuelga de una regla de latón que se desvanece; los números
   van SIEMPRE en tabular-nums. Es la firma visual de Umbral. */
.dato-regla {
  display: grid;
  grid-template-columns: 2px 1fr;
  column-gap: 12px;
}
.dato-regla::before {
  content: '';
  border-radius: 9999px;
  background: linear-gradient(180deg, var(--brand-primary) 0%, transparent 100%);
}
.numeral {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}

/* Skeleton (shimmer más tenue en dark — 49 §8) */
.skeleton {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: var(--surface-tertiary);
}
.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.06), transparent);
  animation: skeleton-shimmer 1.6s var(--ease-out) infinite;
}
@keyframes skeleton-shimmer { 100% { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) {
  .skeleton::after { animation: none; }
}
```

### B.2 — `app/page.tsx` (completo)

```tsx
'use client';

// EJEMPLO B — "Umbral": home de finanzas personales, 375px, dirección oscura/densa.
// MISMA composición que el Ejemplo A (héroe + lista + nav + estados) con TODO lo derivable distinto.

import { useEffect, useState } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Variants,
} from 'motion/react';
import { ArrowDownLeft, ArrowUpRight, ChartPie, Plus, Target, Wallet, User } from 'lucide-react';

type TipoMovimiento = 'gasto' | 'ingreso';

interface Movimiento {
  id: string;
  concepto: string;
  categoria: string;
  fecha: string;        // ISO
  monto: number;        // COP
  tipo: TipoMovimiento;
}

const MOVIMIENTOS: Movimiento[] = [
  { id: 'm1', concepto: 'Mercado — Éxito', categoria: 'Alimentación', fecha: '2026-07-05', monto: 186400, tipo: 'gasto' },
  { id: 'm2', concepto: 'Pago freelance — sitio web', categoria: 'Ingresos', fecha: '2026-07-04', monto: 1250000, tipo: 'ingreso' },
  { id: 'm3', concepto: 'Suscripción — Spotify', categoria: 'Suscripciones', fecha: '2026-07-03', monto: 26900, tipo: 'gasto' },
];

const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const FECHA_CORTA = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' });

// ← baseline #2: el monto héroe CUENTA de 0 al valor, en tabular-nums (no salta el layout)
function CountUpMoney({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const texto = useTransform(mv, (v) => COP.format(Math.round(v)));
  useEffect(() => {
    const ctrl = animate(mv, value, { duration: reduce ? 0 : 0.7, ease: [0.32, 0.72, 0, 1] });
    return () => ctrl.stop();
  }, [value, mv, reduce]);
  return <motion.span className="numeral">{texto}</motion.span>;
}

// ← baseline #3 (variante barra): el presupuesto CRECE de 0 al valor — nunca aparece lleno
function BudgetBar({ value }: { value: number }) {
  return (
    <div role="img" aria-label={`Presupuesto usado: ${value}%`}
      className="h-2 w-full overflow-hidden rounded-full bg-[var(--brand-primary-soft)]">
      <motion.div
        className="h-full origin-left rounded-full bg-[var(--brand-primary)]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: value / 100 }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
      />
    </div>
  );
}

// ← baseline #1: stagger — Umbral usa 50ms y 8px (firma más seca que Capítulo)
const lista: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.32, 0.72, 0, 1] } },
};

const NAV = [
  { id: 'resumen', label: 'Resumen', icono: Wallet },
  { id: 'movimientos', label: 'Movimientos', icono: ChartPie },
  { id: 'metas', label: 'Metas', icono: Target },
  { id: 'perfil', label: 'Perfil', icono: User },
] as const;

export default function HomeUmbral() {
  const [movimientos] = useState<Movimiento[]>(MOVIMIENTOS);
  const [tab, setTab] = useState<(typeof NAV)[number]['id']>('resumen');
  // ← Regla UX 13: período REAL con fechas, no "Este mes"
  const periodo = 'Jul 1 – 31, 2026';

  return (
    <div className="flex min-h-dvh flex-col">
      <motion.main variants={lista} initial="hidden" animate="visible"
        className="mx-auto w-full max-w-md flex-1 px-4 pt-6 pb-4">

        {/* ——— HEADER con navegación de períodos (← →) ——— */}
        <motion.header variants={item} className="mb-6 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-[var(--text-tertiary)]">{periodo}</p>
            {/* ← nivel 1: display grotesk con tracking apretado (tratamiento propio de la ficha) */}
            <h1 className="mt-1 font-display text-[30px] font-bold leading-[1.1] tracking-[var(--tracking-display)] text-balance">
              Julio, bajo control
            </h1>
          </div>
          <div className="flex shrink-0 gap-2">
            <motion.button whileTap={{ scale: 0.97 }} type="button" aria-label="Mes anterior"
              className="flex size-11 items-center justify-center rounded-[var(--radius-md)]
                         border border-[var(--border-default)] text-[var(--text-secondary)]">←</motion.button>
            <motion.button whileTap={{ scale: 0.97 }} type="button" aria-label="Mes siguiente" disabled
              className="flex size-11 items-center justify-center rounded-[var(--radius-md)]
                         border border-[var(--border-default)] text-[var(--text-tertiary)] opacity-50">→</motion.button>
          </div>
        </motion.header>

        {/* ——— OBJETO PRINCIPAL: disponible del mes, colgado de la regla de latón ——— */}
        <motion.section variants={item} aria-label="Disponible este mes"
          className="rounded-[var(--radius-lg)] border border-[var(--card-elevated-border)]
                     bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-md)]">
          {/* ← dispositivo ownable: .dato-regla — el dato clave cuelga de la regla vertical */}
          <div className="dato-regla">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-[var(--text-secondary)]">Disponible hasta el 31 de julio</p>
              {/* ← el ÚNICO uso del acento en texto: el dato clave (lección Spotify) */}
              <p className="mt-1 font-display text-[34px] font-bold leading-[1.1] tracking-[var(--tracking-display)] text-[var(--brand-primary)]">
                <CountUpMoney value={1834600} />
              </p>
              <p className="mt-2 text-[14px] text-[var(--text-secondary)]">
                Gastas 12% menos que en junio a esta altura del mes
              </p>
            </div>
          </div>
          <div className="mt-6">
            <div className="mb-2 flex items-baseline justify-between text-[13px]">
              <span className="font-medium text-[var(--text-secondary)]">Presupuesto usado</span>
              <span className="numeral font-semibold">54%</span>
            </div>
            <BudgetBar value={54} />
          </div>
          <motion.button whileTap={{ scale: 0.97 }} type="button"
            className="mt-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-[var(--radius-md)]
                       bg-[var(--brand-primary)] text-base font-semibold text-[var(--brand-primary-text)]
                       transition-colors duration-150 hover:bg-[var(--brand-primary-hover)]
                       [touch-action:manipulation]">
            <Plus size={20} aria-hidden="true" />
            Registrar movimiento
          </motion.button>
        </motion.section>

        {/* ——— MOVIMIENTOS RECIENTES: densidad de producto-inteligencia (≥3 señales de valor) ——— */}
        <motion.section variants={item} className="mt-8" aria-label="Movimientos recientes">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-[18px] font-semibold tracking-[var(--tracking-display)]">
              Últimos movimientos
            </h2>
            <button type="button" className="text-[13px] font-medium text-[var(--text-secondary)] underline-offset-4 hover:underline">
              Ver julio completo
            </button>
          </div>

          {movimientos.length === 0 ? (
            /* ← empty que activa: dirige a la PRIMERA acción, jamás "No hay datos" */
            <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border
                            border-[var(--border-default)] bg-[var(--surface-primary)] px-6 py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-[var(--brand-primary-soft)]">
                <Wallet size={28} color="var(--brand-primary)" aria-hidden="true" />
              </div>
              <h3 className="font-display text-[18px] font-semibold text-balance">Tu primer registro toma 10 segundos</h3>
              <p className="max-w-[32ch] text-[14px] text-[var(--text-secondary)]">
                Anota lo que gastaste hoy y Umbral arma el resto del mes contigo.
              </p>
              <motion.button whileTap={{ scale: 0.97 }} type="button"
                className="mt-1 h-12 rounded-[var(--radius-md)] bg-[var(--brand-primary)] px-6
                           text-base font-semibold text-[var(--brand-primary-text)]">
                Registrar mi primer gasto
              </motion.button>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {movimientos.map((m) => (
                <motion.li key={m.id} variants={item}>
                  <motion.button whileTap={{ scale: 0.98 }} type="button"
                    className="flex w-full items-center gap-3 rounded-[var(--radius-lg)] border
                               border-[var(--border-default)] bg-[var(--surface-primary)] p-4 text-left
                               [touch-action:manipulation]">
                    {/* ← tipo comunicado con ícono + color, nunca solo color (daltonismo) */}
                    <span aria-hidden="true"
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                        m.tipo === 'ingreso'
                          ? 'bg-[var(--status-success-soft)] text-[var(--status-success)]'
                          : 'bg-[var(--surface-tertiary)] text-[var(--text-secondary)]'
                      }`}>
                      {m.tipo === 'ingreso' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium">{m.concepto}</span>
                      <span className="mt-0.5 block text-[13px] text-[var(--text-tertiary)]">
                        {m.categoria} · {FECHA_CORTA.format(new Date(`${m.fecha}T12:00:00`))}
                      </span>
                    </span>
                    {/* ← numerales tabulares SIEMPRE: la columna de montos queda alineada */}
                    <span className={`numeral shrink-0 text-[15px] font-semibold ${
                      m.tipo === 'ingreso' ? 'text-[var(--status-success)]' : 'text-[var(--text-primary)]'}`}>
                      {m.tipo === 'ingreso' ? '+' : '−'}{COP.format(m.monto)}
                    </span>
                  </motion.button>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.section>

        <motion.p variants={item} className="mt-6 text-center text-[13px] text-[var(--text-tertiary)]">
          Cifras cifradas en tu dispositivo. Nadie más las ve.
        </motion.p>
      </motion.main>

      {/* ——— BOTTOM NAV — misma composición que A, piel propia ——— */}
      <nav aria-label="Navegación principal"
        className="sticky bottom-0 border-t border-[var(--border-default)] bg-[var(--surface-elevated)]
                   pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex h-16 max-w-md items-stretch justify-around px-2">
          {NAV.map(({ id, label, icono: Icono }) => {
            const activo = tab === id;
            return (
              <motion.button key={id} whileTap={{ scale: 0.97 }} type="button" onClick={() => setTab(id)}
                aria-current={activo ? 'page' : undefined}
                className="relative flex min-w-16 flex-col items-center justify-center gap-1 [touch-action:manipulation]">
                {activo && (
                  <motion.span layoutId="tab-activa" aria-hidden="true"
                    className="absolute top-0 h-0.5 w-8 rounded-full bg-[var(--brand-primary)]" />
                )}
                <Icono size={24} aria-hidden="true"
                  color={activo ? 'var(--brand-primary)' : 'var(--text-tertiary)'}
                  strokeWidth={activo ? 2.4 : 2} />
                <span className={`text-[11px] font-medium ${
                  activo ? 'text-[var(--brand-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                  {label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
```

> Nota Phosphor: en producción el ícono activo de la nav usa Phosphor `weight="fill"` (49 §5). Los ejemplos usan Lucide con `strokeWidth` para mantener UN solo import de íconos por archivo — el patrón (activo se distingue por acento + peso, nunca tapado) es el mismo.

---

## POR QUÉ ESTOS DOS EJEMPLOS DEMUESTRAN EL RANGO

| Eje derivable | Capítulo (A) | Umbral (B) |
|---|---|---|
| Modo | Claro cálido (papel) | Oscuro pizarra (derivado con razón escrita) |
| Neutros | Familia cálida marrón | Familia fría azul-pizarra |
| Acento | Verde tinta `#3F5D45` | Latón viejo `#C9A24B` |
| Display | Petrona (serif) | Archivo (grotesk, tracking −0.035em) |
| Radios | 8·14·20·24 (encuadernado) | 8·12·16·20 (seco) |
| Profundidad | Sombras tintadas cálidas | Elevación por superficies más claras |
| Dispositivo ownable | Grano feTurbulence + borde-firma | Numerales tabulares + regla vertical de latón |
| Motion | 300ms, ease `(0.16,1,0.3,1)`, stagger 60ms/10px | 220ms, ease `(0.32,0.72,0,1)`, stagger 50ms/8px |
| Gráfico héroe | Anillo que se dibuja | Barra que crece |

**Lo que NO cambia entre A y B** (y por eso se copia): shell min-h-dvh, header con fecha real + N1 único, un objeto principal dominante con dato héroe animado + insight interpretado + next best action, lista con chips de estado que abrazan su contenido, empty state que activa, microcopy de confianza, nav de 4 con indicador layoutId, stagger de entrada, whileTap en todo lo interactivo.

---

## QUÉ COPIAR vs QUÉ DERIVAR (la tabla que gobierna el uso de este archivo)

| ✅ COPIAR (composición — es el punto del archivo) | 🔁 DERIVAR de la Ficha de Dirección de Arte (copiar = fallo grave) |
|---|---|
| Estructura del shell: min-h-dvh + flex-col + main flex-1 + nav al fondo | Hex de paleta (superficies, neutros, acento) |
| Densidad: header contextual + héroe + lista con valor + microcopy + nav (3-4 bloques, cero vacío) | Familias tipográficas y su tratamiento (serif/grotesk, tracking, pesos) |
| Jerarquía 4 niveles y sus proporciones (display/título/body/label) | Escala de radios por rol |
| Patrones de motion: stagger de entrada, CountUp, dibujado de anillo/barra, whileTap 0.97, layoutId en nav | Duraciones y curva concretas (la FIRMA de motion: serena vs seca) |
| Manejo de estados: rama empty con CTA que activa, skeleton espejo, chips de estado con texto+color | Dispositivo ownable (grano, regla, duotone, sombra dura… — ver `54`) |
| Anatomía del dato héroe: label → cifra animada → insight interpretado → next best action | Todo el copy y el contenido del dominio (libros ≠ pesos ≠ tu app) |
| Accesibilidad cableada: aria-label/aria-current, ≥44px, tabular-nums, min-w-0+truncate, reduced-motion | Modo claro/oscuro (se deriva del mundo del sujeto, jamás se asume) |
| Fechas y períodos REALES con navegación ← → | Estructura del layout si tu dominio pide otra (mapa, feed, canvas…) |

**Regla de cierre:** si al terminar tu pantalla puedes poner tu screenshot junto al de Capítulo o Umbral y un tercero duda de cuál app es cuál → copiaste valores, no composición → rederivar con `16` PASO 0.45 y el banco del `54`.
