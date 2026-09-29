# SISTEMA DE COMPONENTES — Definir Una Vez, Componer Siempre

> Pantallas completas ejemplares (composición + motion + estados, compilables): `53-PANTALLA-CANONICA.md`. Banco de direcciones de arte (paletas, pares tipográficos, dispositivos ownable): `54-BANCO-DE-DIRECCIONES.md`.

> **Cuándo cargar este archivo:**
> - Inmediatamente DESPUÉS de completar el brand kit (PASO 0 de `16-DIRECCION-DE-ARTE.md`) y ANTES de construir la primera pantalla
> - Al crear cualquier pantalla nueva (para COMPONER desde el inventario, no reinventar) — junto con `14`, `22` y `15`
> - Cuando dos pantallas de la misma app muestran botones/cards/inputs que no se parecen entre sí
>
> **Por qué existe:** el pipeline saltaba de tokens (`10`) a pantallas (`14`/`16`/`32`) sin capa intermedia. Resultado real: cada pantalla re-estila sus botones y cards, y todas las apps del SO comparten el "look shadcn" default — fallando el test endurecido del `16`: *si dos apps del SO pueden intercambiar su kit sin que se note, ninguna tiene identidad*. Este archivo define (1) el INVENTARIO canónico de componentes con variantes × estados × medidas exactas, y (2) la receta para que shadcn deje de parecer shadcn.

---

## EL PRINCIPIO

```
1. Los componentes se definen UNA VEZ por app — tras el brand kit del 16, antes de la primera pantalla.
2. Las pantallas COMPONEN; no estilan. PROHIBIDO re-estilar ad-hoc en pantalla lo que ya tiene componente.
3. Todo patrón visual usado ≥2 veces se PROMUEVE a componente (vive en components/ui/, jamás copiado-pegado).
4. Cada componente define TODAS sus variantes y TODOS sus estados aquí — una pantalla nunca "inventa" un estado.
5. La identidad vive en el componente: si Button y Card no llevan el brand kit, ninguna pantalla lo va a salvar.
```

DÓNDE ENCAJA: tokens (`10`) → brand kit (`16` PASO 0) → **componentes (49)** → pantallas (`14`/`15`/`32`). El inventario de la app (qué componentes existen + variantes en uso) se anota en `ESTADO.md`. shadcn se COPIA al repo: los archivos de `components/ui/` son TUYOS — se editan, no se envuelven.

---

## PARTE 1 — INVENTARIO CANÓNICO

Regla de lectura: las medidas son las de `14` (no se renegocian); el radius, las fuentes y la curva de motion salen de la FICHA del `16`; el copy de los estados sale de `42`. Un estado sin definir es un bug, no un pendiente.

### 1. Button

```
VARIANTES (4 — y ninguna más sin razón escrita):
  primario     bg var(--brand-primary) · texto var(--brand-primary-text) · sombra var(--shadow-sm)
               → SOLO la acción principal de la pantalla (regla del acento, 14 mandamiento 4)
  secundario   bg var(--surface-tertiary) · borde 1px var(--border-default) · texto var(--text-primary)
  ghost        transparente · texto var(--text-secondary) · hover: bg var(--brand-primary-soft)
  destructivo  bg var(--status-error) · texto #fff · SOLO acciones que destruyen; siempre con confirm o undo (43)

MEDIDAS (una decisión, toda la app):
  Altura 48px default · 52px CTA héroe · padding-x 20-24px · texto 16px/500-600
  Radius: var(--radius-md) DEL BRAND KIT (14: botones 12-16px) · gap ícono-texto 8px · ícono 20px
  En mobile el primario llena el ancho (14, regla 5 de espaciado); en el tercio inferior (thumb zone)

ESTADOS (los 6, obligatorios en cada variante):
  default        el de arriba. El CTA héroe se ve VIVO — nunca un pill apagado (32)
  hover          un paso de luminancia (var(--brand-primary-hover)) · SOLO bajo @media (hover:hover) (41)
  pressed        scale(0.97) + sombra a 0, respuesta <100ms · whileTap={{ scale: 0.97 }} o active:scale-[0.97]
  loading        spinner inline 16px + GERUNDIO del verbo del botón ("Generando…", "Guardando…" — 42)
                 · aria-busy · deshabilita mientras corre el request (anti doble-submit, 43)
  disabled       opacity 50% + pointer-events-none · PROHIBIDO como estado por defecto del CTA héroe:
                 el CTA nace habilitado y valida al click con hint amable (43: "submit vivo hasta el request")
  focus-visible  outline 2px var(--border-focus) + offset 2px (10) · jamás outline:none sin reemplazo

MOTION: press 80-150ms ease-out · release 150ms · touch-action: manipulation · el destructivo nunca celebra
```

Código completo (override f1) en la PARTE 2 — es el mismo Button, no hay dos.

### 2. Input / Textarea / Select

```
MEDIDAS: altura 48-56px (14) · Textarea min-h 96px · padding-x 16px · texto 16px (evita zoom de iOS)
  bg var(--surface-tertiary) (superficie HUNDIDA, 16) · radius var(--radius-md) · borde 1px var(--border-default)

ESTADOS: default · focus (borde var(--border-focus) + ring 2px var(--brand-primary-soft)) ·
  error (borde var(--status-error) + mensaje debajo) · disabled (opacity 50%)

REGLAS DURAS:
  - Label SIEMPRE visible encima (13px/500 var(--text-secondary)) — nunca floating label ni placeholder-como-label
  - Placeholder = ejemplo terminado en "…" ("Ej. Lanzamiento de marzo…"), no repite la label (42)
  - inputMode/type/autoComplete correctos por tipo (43): email→type=email+inputMode=email+autoCapitalize=none ·
    teléfono→tel · monto→inputMode=decimal · OTP→inputMode=numeric+autoComplete=one-time-code · spellCheck=false
    en email/código/username · paste JAMÁS bloqueado
  - Error con qué-pasó + qué-hacer, inline debajo del campo, role="alert" + aria-invalid + aria-describedby (42/10)
  - <select> nativo con background-color y color explícitos (bug de Windows dark, 10) — o el Select de shadcn tematizado
```

```tsx
<div className="space-y-1.5">
  <label htmlFor="monto" className="text-[13px] font-medium text-[var(--text-secondary)]">Monto a invertir</label>
  <Input id="monto" inputMode="decimal" placeholder="Ej. 50.000…"
         aria-invalid={!!error} aria-describedby={error ? 'monto-error' : undefined} />
  {error && (
    <p id="monto-error" role="alert" className="text-[13px] text-[var(--status-error)]">
      No pudimos leer el monto. Escribe solo números, sin letras ni símbolos.
    </p>
  )}
</div>
```

### 3. Card — 3 niveles de elevación (y solo 3)

```
base      bg var(--surface-primary) + borde 1px var(--border-default) · sin sombra · el contenedor default
elevada   DARK: superficie más clara (var(--surface-elevated)) + borde blanco 6-8% + var(--shadow-md)
          LIGHT: bg blanco + borde var(--border-default) + sombra CON TINTE de marca (Parte 2c) — nunca gris puro
          → cards destacadas, dropdowns, el bloque héroe del bento
hundida   bg var(--surface-tertiary), sin sombra, borde transparente → wells, inputs, áreas recesadas

MEDIDAS: radius var(--radius-lg) del brand kit (14: cards 16-20px, TODAS iguales) · padding interno 16-24px
REGLA:   la profundidad en dark se logra con superficies MÁS CLARAS, no con sombras (14/16). La card del
         objeto principal DESTACA (elevada); las demás receden (base). Cero cards idénticas infinitas (16 PASO 5).
```

Código (cva con `elevation`) en la PARTE 2 (override f3).

### 4. Chip / Badge

```
MEDIDAS: chip seleccionable 36px de alto (área táctil con padding) · badge 20-24px · padding-x 12-16px
  radius var(--radius-sm) (8px) o var(--radius-full) (pill) — UNO por app · texto 13-14px/500
REGLA #1: w-fit / inline-flex OBLIGATORIO — el chip ABRAZA su contenido, jamás estira (43 §8: cero
  chips ocupando un contenedor con hueco muerto al lado). En fila: flex-wrap + gap-2, no grid estirado.
ESTADOS (base del onboarding — la "pregunta con opciones" del 15 son chips):
  seleccionable  borde var(--border-default) · texto var(--text-secondary) · bg transparente
  seleccionado   borde var(--brand-primary) · bg var(--brand-primary-soft) · texto var(--text-primary)
                 + ✓ ícono 14px (segunda señal: nunca solo color — daltonismo, 17)
  pressed        whileTap scale 0.97 · aria-pressed refleja el estado
```

```tsx
<motion.button whileTap={{ scale: 0.97 }} aria-pressed={seleccionado} onClick={onToggle}
  className={cn(
    'inline-flex w-fit items-center gap-1.5 h-9 rounded-full border px-4 text-sm font-medium',
    'transition-colors duration-150 ease-[var(--ease-out)] [touch-action:manipulation]',
    seleccionado
      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-soft)] text-[var(--text-primary)]'
      : 'border-[var(--border-default)] text-[var(--text-secondary)]'
  )}>
  {seleccionado && <Check size={14} aria-hidden="true" />}
  {label}
</motion.button>
```

### 5. TabBar / BottomNav

```
MEDIDAS: 56-64px de alto + padding-bottom: env(safe-area-inset-bottom) (14/43) · 3-5 destinos, NUNCA más (14)
  · label 11px/500 siempre visible · ícono 24px · el shell usa min-h-dvh con la nav al FONDO (14 regla 6)
ESTADO ACTIVO: marcado con relleno/acento — Phosphor weight="fill" + var(--brand-primary) SI la app
  usa Phosphor (capa opcional, 22); con Lucide: fondo acento sutil + strokeWidth mayor, como el
  ejemplo canónico del 53. Inactivo: var(--text-tertiary). El indicador es una barra/fondo SUTIL —
  JAMÁS pintar el ícono del color de su propio fondo (14 mandamiento 9: ícono blanco sobre círculo
  blanco = invisible).
MOTION: indicador compartido con layoutId de Motion (se desliza entre tabs, 250ms ease-out) ·
  cambio de tab = fade + slide sutil del contenido, no corte seco (22 baseline 5).
```

```tsx
<IconoTab size={24} weight={esActivo ? 'fill' : 'regular'}
          color={esActivo ? 'var(--brand-primary)' : 'var(--text-tertiary)'} />
{esActivo && <motion.span layoutId="tab-activa"
  className="absolute top-0 h-0.5 w-8 rounded-full bg-[var(--brand-primary)]" />}
```

### 6. BottomSheet / Modal

Librería concreta: **`vaul`** (`npm i vaul`) para el sheet mobile — trae drag con física real, **velocity-based dismiss** (un flick corto y rápido descarta; un arrastre lento que se suelta, no — 41) y snap points. No reimplementar el gesto a mano.

```
SHEET (mobile): entra desde abajo 300ms ease-out (o --ease-drawer de 41) · radius superior var(--radius-xl)
  · HANDLE obligatorio: 40×4px, rounded-full, var(--border-strong), centrado arriba · bg var(--surface-elevated)
  · overscroll-behavior: contain (el scroll interno no arrastra la página, 43) · pb env(safe-area-inset-bottom)
MODAL (desktop/confirmaciones): centrado, entra scale 0.95→1 + fade (JAMÁS scale(0) — 41: "nada aparece de
  la nada") · transform-origin: center ES correcto aquí. POPOVER/DROPDOWN/TOOLTIP: transform-origin en el
  TRIGGER con la var de Radix (--radix-popover-content-transform-origin) — crecen desde el botón, no del aire.
OVERLAY: var(--surface-overlay) + fade · z-index var(--z-modal) · salida MÁS RÁPIDA que la entrada (41).
```

```tsx
import { Drawer } from 'vaul';

<Drawer.Root shouldScaleBackground>
  <Drawer.Trigger asChild><Button variant="secondary">Filtrar</Button></Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Overlay className="fixed inset-0 z-30 bg-[var(--surface-overlay)]" />
    <Drawer.Content className="fixed inset-x-0 bottom-0 z-40 rounded-t-[var(--radius-xl)]
        bg-[var(--surface-elevated)] pb-[env(safe-area-inset-bottom)] [overscroll-behavior:contain]">
      <div aria-hidden="true" className="mx-auto mt-3 h-1 w-10 rounded-full bg-[var(--border-strong)]" />
      <Drawer.Title className="px-6 pt-4 font-display text-xl font-semibold">Filtros</Drawer.Title>
      {/* contenido */}
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>
```

### 6B. Accesibilidad operativa de overlays (focus y teclado — no negociable)

```
[ ] FOCUS TRAP: mientras el modal/sheet está abierto, Tab nunca escapa al fondo
    (Radix/vaul lo traen de fábrica; en un overlay custom se implementa, no se omite)
[ ] AL CERRAR, EL FOCO VUELVE AL TRIGGER: onCloseAutoFocus (Radix) devuelve el foco al
    botón que abrió — el usuario de teclado nunca queda "en el aire"
[ ] FONDO CON `inert` MIENTRAS EL OVERLAY ESTÁ ABIERTO: lo de atrás no recibe foco ni
    lectura de screen reader (el Portal de Radix ya lo cubre; verificarlo en custom)
[ ] TODO BOTÓN-ÍCONO CON NOMBRE ACCESIBLE: aria-label en cada botón sin texto visible
    (cerrar, atrás, crear, filtrar)
[ ] VERIFICACIÓN: navegar el flujo completo SOLO con teclado (Tab/Shift+Tab/Enter/Esc) —
    abrir, operar y cerrar cada overlay sin tocar el mouse
```

### 7. Toast

```
POSICIÓN: mobile → bottom-center, ENCIMA de la TabBar (bottom: calc(64px + env(safe-area-inset-bottom) + 8px))
  · desktop → bottom-right · z-index var(--z-toast)
COLA: máximo 3 visibles apiladas; el resto espera su turno. Nunca toasts encimados tapándose.
ENTRADA: translateY(8px) + fade, 250ms ease-out — con @starting-style (41, sin JS) · salida 150ms.
AUTO-DISMISS: 4s para éxito/info (se pausa con hover/focus) · los ERRORES persisten hasta que el usuario cierre.
DESHACER: toda acción destructiva reversible → toast "Eliminado — Deshacer" con ventana de 5s (43);
  el deshacer RESTAURA de verdad, no es decorativo.
COPY: mismo verbo del botón que lo disparó — "Publicar" → "Publicado ✓" (42). Prohibido "¡Listo!".
A11Y: role="status" para éxito/info, role="alert" para error; la región vive en el DOM ANTES de llenarse (15).
BASE: sonner (el toaster de shadcn) sirve como motor — re-tematizado con la Parte 2, nunca con su look default.
```

### 8. Skeleton — código completo (copiable)

Regla dura (14/15): spinner genérico PROHIBIDO para contenido principal. El skeleton copia la **forma y dimensiones del contenido real** — cuando llega el contenido, NADA salta (CLS = 0).

```tsx
// components/ui/skeleton.tsx
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn('skeleton', className)} {...props} />;
}

// El skeleton de una vista se COMPONE espejando el componente real, medida por medida:
export function StatCardSkeleton() {
  return (
    <div className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border-default)]
                    bg-[var(--surface-primary)] p-4">
      <Skeleton className="h-4 w-24" />   {/* label 13px */}
      <Skeleton className="h-9 w-32" />   {/* dato héroe (display 36px) */}
      <Skeleton className="h-4 w-40" />   {/* insight */}
      <Skeleton className="h-10 w-full" />{/* sparkline */}
    </div>
  );
}
```

```css
/* globals.css — shimmer sutil que comunica "procesando", no "colgado" (15) */
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
[data-theme='light'] .skeleton::after {
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.55), transparent);
}
@keyframes skeleton-shimmer { 100% { transform: translateX(100%); } }
/* reduce-motion: fuera el barrido (movimiento), queda un pulso de opacidad (fade permitido — 10) */
@media (prefers-reduced-motion: reduce) {
  .skeleton::after { animation: none; }
  .skeleton { animation: skeleton-pulse 2s ease-in-out infinite; }
}
@keyframes skeleton-pulse { 50% { opacity: 0.7; } }
```

### 9. EmptyState — código completo (copiable)

Anatomía del `15`: ícono con personalidad (Phosphor **duotone**, `22`) + título que NO dice "vacío" + una línea de valor + UN CTA dominante + ejemplo precargado tocable. Impacto medido: +30-40% activación.

```tsx
// components/ui/empty-state.tsx
import { motion, useReducedMotion } from 'motion/react';
import type { Icon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: Icon;                 // Phosphor, se renderiza weight="duotone"
  title: string;              // "Crea tu primera rutina" — JAMÁS "No hay datos" (42)
  description: string;        // 1 línea de valor: "Cada rutina que armes vivirá aquí"
  actionLabel: string;        // verbo + objeto: "Crear primera rutina"
  onAction: () => void;
  example?: React.ReactNode;  // plantilla/ejemplo precargado que el usuario puede tocar
}

export function EmptyState({ icon: Icono, title, description, actionLabel, onAction, example }: EmptyStateProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-[var(--brand-primary-soft)]">
        <Icono size={32} weight="duotone" color="var(--brand-primary)" aria-hidden="true" />
      </div>
      <h3 className="text-balance font-display text-xl font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="max-w-[36ch] text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p>
      <Button size="lg" className="mt-2" onClick={onAction}>{actionLabel}</Button>
      {example && <div className="mt-4 w-full">{example}</div>}
    </motion.div>
  );
}
```

Los 3 tipos del `15` usan este MISMO componente con distinto contenido: primer uso (máxima energía + ejemplo), resultado vacío (CTA = "Limpiar filtros"), todo completado (celebrar + siguiente paso).

### 10. StatCard / dato héroe (del `17`)

```
ANATOMÍA (una card = UN dato héroe, no 5 números compitiendo):
  label 12-13px/500 var(--text-secondary) → dato display 28-40px/700 tracking-tight TABULAR-NUMS con
  CONTEO ANIMADO 0→valor en 600-800ms (22 baseline 2 — nunca estático) → insight INTERPRETADO 14px
  ("↓ 8% vs la semana pasada", no "1.420" a secas — 17) → mini-gráfico de apoyo (sparkline Recharts,
  40px de alto, sin ejes, stroke var(--brand-primary), fill var(--brand-primary-soft), animado al cargar).
UNIDAD: pegada con &nbsp; ("1.420 kcal" no se parte de línea — 43) · alternativa sr-only en tabla (17).
```

```tsx
// components/ui/count-up.tsx — el conteo animado reutilizable (respeta reduce-motion)
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { useEffect } from 'react';

export function CountUp({ value, format = (v: number) => Math.round(v).toLocaleString('es-CO') }:
  { value: number; format?: (v: number) => string }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const texto = useTransform(mv, format);
  useEffect(() => {
    const ctrl = animate(mv, value, { duration: reduce ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] });
    return () => ctrl.stop();
  }, [value, mv, reduce]);
  return <motion.span className="tabular-nums">{texto}</motion.span>;
}
```

### 11. ProgressBar / ProgressRing

```
BARRA: alto 6-10px, pill (radius-full) · track neutro al 10-15% de opacidad · relleno var(--brand-primary)
  · se LLENA de 0 al valor en 600ms ease-out al montar (nunca aparece ya llena) · label con % al lado.
ANILLO: grosor 8-12px, stroke-linecap: round · número central display, centrado ÓPTICA y matemáticamente
  con su label como grupo (14 mandamiento 10) · se DIBUJA de 0 al valor en 600-800ms (strokeDashoffset).
```

```tsx
export function ProgressRing({ value, size = 96 }: { value: number; size?: number }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} role="img" aria-label={`Progreso: ${value}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={10}
              stroke="var(--brand-primary-soft)" />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={10}
        stroke="var(--brand-primary)" strokeLinecap="round" strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - value / 100) }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  );
}
```

### 12. IconChip — contenedor de ícono premium (del SISTEMA DE ÍCONOS Y DETALLES de `55`)

Un ícono desnudo flotando junto al texto se ve de template; un ícono en su chip se ve diseñado. Regla dura: el ícono es SIEMPRE SVG de librería (Lucide/Phosphor, `22`) — **jamás un emoji** (anti-patrón, salvo pedido explícito del usuario). Variante `duotone` para secciones cálidas (problema, mecanismo, garantía, onboarding); `line` para técnicas (features de pricing, trust row). UN peso consistente por página.

```tsx
// components/ui/icon-chip.tsx — ícono 20-24px dentro de chip 40-48px (55)
import type { Icon } from '@phosphor-icons/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const iconChipVariants = cva('inline-flex shrink-0 items-center justify-center border', {
  variants: {
    tone: {
      duotone:
        'bg-[var(--brand-primary-soft)] border-[color-mix(in_oklab,var(--brand-primary)_20%,transparent)]',
      line: 'bg-[var(--surface-tertiary)] border-[var(--border-default)]',
    },
    size: {
      md: 'size-10 rounded-[var(--radius-md)]',   // 40px → ícono 20px
      lg: 'size-12 rounded-[var(--radius-md)]',   // 48px → ícono 24px
    },
  },
  defaultVariants: { tone: 'duotone', size: 'md' },
});

interface IconChipProps extends VariantProps<typeof iconChipVariants> {
  icon: Icon;          // Phosphor (o adaptar a LucideIcon si el set base es Lucide)
  className?: string;
}

export function IconChip({ icon: Icono, tone, size, className }: IconChipProps) {
  return (
    <span className={cn(iconChipVariants({ tone, size }), className)}>
      <Icono
        size={size === 'lg' ? 24 : 20}
        weight={tone === 'line' ? 'regular' : 'duotone'}
        color={tone === 'line' ? 'var(--text-secondary)' : 'var(--brand-primary)'}
        aria-hidden="true"
      />
    </span>
  );
}
```

USO: preguntas del problema y pasos del mecanismo de la landing (`55`), chips de opciones del onboarding y checks del paywall (`50`), bullets de la oferta, badges de confianza. Forma (caja vs círculo — cambiar el radius) UNA por app.

### 13. GradientBorderCard — hairline degradada 1-2px (padding-box/border-box)

Técnica de doble background con borde transparente: respeta cualquier radius, sin pseudo-elementos. Regla de jerarquía de `55`: hairline degradada = "esto importa" — SOLO en 1-3 elementos clave por vista (plan recomendado del pricing, card de garantía, chip del mecanismo). Regada en todas las cards deja de significar.

```tsx
// components/ui/gradient-border-card.tsx
import { cn } from '@/lib/utils';

export function GradientBorderCard({ className, emphasis = false, style, ...props }:
  React.HTMLAttributes<HTMLDivElement> & { emphasis?: boolean }) {
  return (
    <div
      className={cn('rounded-[var(--radius-lg)]', className)}
      style={{
        border: `${emphasis ? 2 : 1}px solid transparent`,
        background:
          'linear-gradient(var(--surface-primary), var(--surface-primary)) padding-box, ' +
          `linear-gradient(135deg, color-mix(in oklab, var(--brand-primary) ${emphasis ? 55 : 40}%, transparent), transparent 60%) border-box`,
        ...style,
      }}
      {...props}
    />
  );
}
// emphasis: false = card destacada (1px, acento 40%) · true = EL elemento de la vista
// (plan recomendado: 2px, acento 55%). El fondo interno hereda --surface-primary: si la
// card va sobre fondo elevado, cambiar la primera capa a var(--surface-elevated).
```

---

## PARTE 2 — RECETA DE DES-SHADCN-IZACIÓN (la sección más importante)

shadcn es la base correcta (`22`) porque NO impone estética — pero su default (radius 0.5rem, fuente del sistema, gris puro, 150ms planos) ES una estética: la de todas las demos de IA. Esta receta inyecta el brand kit del PASO 0 del `16` en el theme, en este orden, ANTES del primer componente de pantalla.

### (a) Mapping: tokens del `10` → CSS vars de shadcn

Los tokens del `10` (ya personalizados por el brand kit) son la ÚNICA fuente de verdad; las vars de shadcn son un puente de solo-lectura. Cambias el token, cambia toda la app.

```css
/* globals.css — DESPUÉS del bloque :root de tokens del 10 (ya con el acento/neutros del brand kit).
   Si el proyecto usa Tailwind v4, mapear además en @theme inline (--color-background: var(--background); …). */
:root {
  --background: var(--surface-base);
  --foreground: var(--text-primary);
  --card: var(--surface-primary);
  --card-foreground: var(--text-primary);
  --popover: var(--surface-elevated);
  --popover-foreground: var(--text-primary);
  --primary: var(--brand-primary);
  --primary-foreground: var(--brand-primary-text);
  --secondary: var(--surface-secondary);
  --secondary-foreground: var(--text-primary);
  --muted: var(--surface-tertiary);
  --muted-foreground: var(--text-secondary);
  --accent: var(--brand-primary-soft);
  --accent-foreground: var(--text-primary);
  --destructive: var(--status-error);
  --border: var(--border-default);
  --input: var(--border-default);
  --ring: var(--border-focus);
  --radius: var(--radius-md);   /* ← ver (b) */
}
```

### (b) Radius: del brand kit, NUNCA el 0.5rem por defecto

El `--radius: 0.5rem` que shadcn trae de fábrica es la huella #1 del look genérico. El radius sale de la FICHA del `16` ("Radio de bordes: ___px") y se escribe en los tokens del `10` — un solo lugar:

```css
/* Ej. ficha: "cards 16px, botones 12px, chips 8px" (dentro de los rangos de 14) */
:root {
  --radius-sm: 0.5rem;    /* 8px  — chips, badges */
  --radius-md: 0.75rem;   /* 12px — botones, inputs */
  --radius-lg: 1rem;      /* 16px — cards */
  --radius-xl: 1.25rem;   /* 20px — sheets, modales */
}
```

Regla de `14`/`16`: consistencia ABSOLUTA — si las cards son 16px, TODAS son 16px. Un radius distinto en una pantalla = bug.

### (c) Sombras con el TINTE del neutro de marca (no gris puro)

El `16` exige neutros con temperatura; las sombras también la llevan. Una sombra negra pura sobre un fondo con tinte cálido "no pertenece". Se define el tinte UNA vez:

```css
:root {  /* dark — ej. marca cálida: el negro de la sombra se empuja hacia el marrón del fondo */
  --shadow-tint: 20 14 10;   /* RGB del casi-negro CON el tinte del neutro de marca (16 PASO 0.5) */
  --shadow-sm: 0 1px 2px rgb(var(--shadow-tint) / 0.4);
  --shadow-md: 0 4px 6px -1px rgb(var(--shadow-tint) / 0.5);
  --shadow-lg: 0 10px 25px -5px rgb(var(--shadow-tint) / 0.6);
  --card-elevated-border: rgb(255 255 255 / 0.07);  /* borde 1px que define la card elevada en dark (16) */
}
[data-theme='light'] {
  --shadow-tint: 46 32 22;   /* mismo hue, luminancia de sombra clara */
  --shadow-sm: 0 1px 2px rgb(var(--shadow-tint) / 0.06);
  --shadow-md: 0 4px 6px -1px rgb(var(--shadow-tint) / 0.09);
  --shadow-lg: 0 10px 25px -5px rgb(var(--shadow-tint) / 0.12);
  --card-elevated-border: var(--border-default);
}
```

### (d) Tipografías display/body de la ficha

Jamás dejar la fuente del template (system-ui/Geist = huella de IA, `14` mandamiento 5). Las 2 familias de la ficha del `16` (PASO 0.6, con su tratamiento propio) entran por `--font-display`/`--font-body` del `10`:

```tsx
// app/layout.tsx (Next) — las fuentes de la FICHA, no las del template
// Bricolage Grotesque + Schibsted Grotesk — par ILUSTRATIVO, NO copiar: deriva el tuyo (29/54)
import { Bricolage_Grotesque, Schibsted_Grotesk } from 'next/font/google';
const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display' });
const body = Schibsted_Grotesk({ subsets: ['latin'], variable: '--font-body' });
// <html className={`${display.variable} ${body.variable}`}> · en Vite: @import + asignar las vars en :root
```

```js
// tailwind.config.js (o @theme en v4): body es el default; display se PIDE explícito
fontFamily: { sans: 'var(--font-body)', display: 'var(--font-display)' }
```

Uso: `font-display tracking-tight` SOLO en titulares y datos héroe (máx 3 tamaños por pantalla, `14`); el tratamiento propio de la display (peso inusual, tracking marcado, mayúsculas) se decide en la ficha y se aplica SIEMPRE igual.

### (e) Motion presets de la firma en Dialog/Sheet/Popover

shadcn anima con `tailwindcss-animate` a 150-200ms y curvas planas — movimiento "de plantilla". La firma de motion del brand kit (`16` PASO 0.7) se centraliza en dos tokens y se pisa en los componentes vendorizados:

```css
:root {
  --motion-base: 250ms;                 /* app "serena" → 300-400ms; "enérgica" → 200ms (16/14) */
  --motion-ease: var(--ease-out);       /* o la curva FIRMA (ej. --ease-drawer de 41 para sheets) */
}
```

En `components/ui/dialog.tsx`, `popover.tsx`, `dropdown-menu.tsx` (son archivos tuyos): reemplazar `duration-200` por `duration-[var(--motion-base)] ease-[var(--motion-ease)]`, entrada `zoom-in-95` (nunca desde 0), y en popover/dropdown fijar `transform-origin: var(--radix-popover-content-transform-origin)` para que crezcan desde el trigger (41). El Sheet mobile se reemplaza por `vaul` (inventario #6). Salidas más rápidas que entradas; todo respeta `prefers-reduced-motion` (10).

### (f) Overrides concretos de componentes shadcn

**f1 — Button** (el que más delata; sustituye el `button.tsx` generado):

```tsx
// components/ui/button.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap ' +
  'rounded-[var(--radius-md)] font-medium transition-[transform,background-color,border-color,opacity] ' +
  'duration-150 ease-[var(--ease-out)] active:scale-[0.97] [touch-action:manipulation] ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)] ' +
  'disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--brand-primary)] text-[var(--brand-primary-text)] shadow-[var(--shadow-sm)] ' +
          'hover:bg-[var(--brand-primary-hover)] active:shadow-none',
        secondary:
          'border border-[var(--border-default)] bg-[var(--surface-tertiary)] ' +
          'text-[var(--text-primary)] hover:border-[var(--border-strong)]',
        ghost: 'text-[var(--text-secondary)] hover:bg-[var(--brand-primary-soft)] hover:text-[var(--text-primary)]',
        destructive: 'bg-[var(--status-error)] text-white hover:opacity-90',
      },
      size: {
        default: 'h-12 px-5 text-base',      // 48px reales — no los 36px del default de shadcn
        lg: 'h-[52px] px-6 text-base',       // CTA héroe
        sm: 'h-9 px-3 text-sm',              // solo acciones secundarias densas en desktop
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  }
);

interface ButtonProps extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingText?: string;  // GERUNDIO del verbo del botón: "Generando…", "Guardando…" (42)
}

export function Button({ className, variant, size, loading = false, loadingText, disabled, children, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)}
            disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {loadingText ?? children}
        </>
      ) : children}
    </button>
  );
}
export { buttonVariants };
```

**f2 — Input** (48px reales + superficie hundida):

```tsx
// components/ui/input.tsx
export function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'flex h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-default)]',
        'bg-[var(--surface-tertiary)] px-4 text-base text-[var(--text-primary)]',
        'placeholder:text-[var(--text-tertiary)]',
        'transition-[border-color,box-shadow] duration-150 ease-[var(--ease-out)]',
        'focus-visible:border-[var(--border-focus)] focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-soft)]',
        'aria-[invalid=true]:border-[var(--status-error)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
```

**f3 — Card** (con los 3 niveles del inventario #3):

```tsx
// components/ui/card.tsx
const cardVariants = cva('rounded-[var(--radius-lg)]', {
  variants: {
    elevation: {
      base: 'border border-[var(--border-default)] bg-[var(--surface-primary)]',
      elevated:
        'border border-[var(--card-elevated-border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-md)]',
      sunken: 'border border-transparent bg-[var(--surface-tertiary)]',
    },
  },
  defaultVariants: { elevation: 'base' },
});

export function Card({ className, elevation, ...props }:
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>) {
  return <div className={cn(cardVariants({ elevation }), className)} {...props} />;
}
```

**f4 — Dialog/Popover**: el edit de (e) — duración/curva firma + transform-origin del trigger. **f5 — Tabs/Nav**: ícono activo con relleno/acento según inventario #5 + indicador layoutId.

### Test final de des-shadcn-ización

Montar `/dev/kit` (ruta interna) con Button primario + Card elevada + un Input con label, JUNTOS. Y no es un test puntual: **la ruta `/dev/kit` con todos los componentes × estados renderizados se mantiene VIVA todo el proyecto — es la evidencia barata de consistencia inter-pantalla que el revisor puede pedir** (un vistazo ahí detecta la variante accidental antes que cualquier auditoría). Captura a 375px y responder en frío:

```
[ ] ¿El radius, la fuente display, la sombra tintada y el acento se distinguen del shadcn default?
[ ] ¿Se distinguen del kit de la OTRA app del SO? (test del 16: si son intercambiables, ninguna tiene identidad)
[ ] ¿Un tercero podría decir "esto es de la app X" viendo SOLO estos 3 componentes, sin logo?
```

Si alguna falla → volver al PASO 0.45 del `16` (mundo del sujeto) y rederivar; NO parchear la pantalla.

---

## CHECKLIST DEL MÓDULO (binario — recorrer antes de construir pantallas y en cada pulido)

```
[ ] 1.  El inventario existe en components/ui/ ANTES de la primera pantalla, derivado del brand kit del 16
[ ] 2.  Todo patrón usado ≥2 veces está promovido a componente — cero botones/cards/inputs ad-hoc en pantallas
[ ] 3.  Cero hex fuera de tokens: los componentes solo usan var(--…) del 10
[ ] 4.  Radius idéntico por rol en TODA la app (del brand kit — jamás el 0.5rem default de shadcn)
[ ] 5.  Todo interactivo define los 6 estados (default/hover/pressed/loading/disabled/focus-visible);
        hover gateado con @media (hover:hover)
[ ] 6.  Ningún CTA héroe nace disabled; loading = spinner inline + gerundio del verbo (42)
[ ] 7.  Inputs 48-56px con label visible + inputMode/autoComplete correctos + error con qué-pasó/qué-hacer
[ ] 8.  Chips/badges con w-fit (abrazan su contenido) — cero chips estirados con hueco muerto
[ ] 9.  TabBar 56-64px + env(safe-area-inset-bottom); ícono activo con relleno/acento (fill si usa
        Phosphor; con Lucide: fondo acento sutil + strokeWidth mayor), nunca tapado
[ ] 10. Sheets con vaul (handle + velocity dismiss); popovers con transform-origin del trigger; salida < entrada
[ ] 11. Toda vista con datos tiene su Skeleton espejo (CLS=0) y su EmptyState con CTA — no un hueco
[ ] 12. Test de intercambio pasado: captura Button+Card+Input ≠ shadcn default y ≠ otra app del SO
[ ] 13. Íconos SIEMPRE SVG de librería con contenedor (IconChip) — cero emojis como íconos;
        GradientBorderCard solo en 1-3 elementos clave por vista (sistema del 55)
```

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

| Archivo | Relación con este (49) |
|---|---|
| **`10-DESIGN-TOKENS.md`** | Fuente única de los tokens que consumen todos los componentes; el mapping (a) los expone a shadcn. |
| **`16-DIRECCION-DE-ARTE.md`** | El brand kit del PASO 0 es el INPUT de este archivo: radius, fuentes, acento, firma de motion. El test de intercambio es su Regla 4. |
| **`14-LEYES-DE-DISENO.md`** | Dueño de los números (alturas 48-52, tab bar 56-64, radius por rol, curvas). 49 los congela en componentes. |
| **`22` / `41`** | 22 da las librerías (Motion, Phosphor, Recharts) y las 7 baseline; 41 el criterio (transform-origin, velocity dismiss, @starting-style). |
| **`42` / `43`** | 42 gobierna el copy de estados (gerundios, errores, empty); 43 el micro-craft (w-fit, inputMode, safe-areas) que aquí queda cableado de fábrica. |
| **`15` / `17`** | 15 define skeleton/empty/toast como patrones; 17 el dato héroe. 49 los convierte en componentes reutilizables. |
| **`32-DEL-MVP-AL-PRODUCTO.md`** | Las pantallas se LLENAN de valor componiendo este inventario — no inventando piezas nuevas a mitad de obra. |
