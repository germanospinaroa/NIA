# SISTEMA DE DESIGN TOKENS

> ⚠️ **GATE — PROHIBIDO CODEAR UI CON LOS PLACEHOLDERS DE ESTE ARCHIVO.** Los hex de los bloques
> `:root` de abajo son andamiaje ilustrativo, no una paleta. Antes de la primera pantalla:
> (1) llena el bloque `:root` COMPLETO con el brand kit derivado (PASO 0 de `16`) o con la TABLA
> DE EXTRACCIÓN de la referencia del usuario (protocolo REFERENCIA=CONTRATO, inicio de `16`);
> (2) muéstraselo al usuario en simple ("así traduje tu referencia/dirección: estos colores,
> estas letras") y **espera su OK**. Una pantalla construida sobre los placeholders = paso no hecho.

## Objetivo
Definir un sistema de colores, tipografía, espaciado y efectos basado en tokens semánticos (CSS variables) que garantice consistencia visual, habilite dark mode desde el primer día, y permita cambiar toda la apariencia de la app modificando un solo archivo.

---

## ¿Por Qué Tokens y No Clases de Color Directas?

```css
/* ❌ INCORRECTO — Color hardcodeado */
.card { background: #ffffff; color: #1a1a1a; border: 1px solid #e5e5e5; }

/* ✅ CORRECTO — Token semántico */
.card { background: var(--surface-primary); color: var(--text-primary); border: 1px solid var(--border-default); }
```

Con tokens:
- Cambiar de tema (claro/oscuro) es modificar variables, no 200 clases.
- Los colores tienen SIGNIFICADO (--surface-primary dice "fondo principal", #ffffff no dice nada).
- La mayoría de usuarios prefiere dark mode hoy (verificar el dato exacto para tu nicho). Sin tokens, implementar dark mode requiere reescribir todo el CSS.

---

## Estructura de Tokens

### Tokens de Color — Dark Theme (base)

El `:root` de este archivo usa dark como **andamiaje técnico de partida** (para tener valores
funcionando desde el día 1) — **NO es una recomendación estética**. El modo real (oscuro o claro)
se DERIVA del arquetipo + mundo del sujeto en `16-DIRECCION-DE-ARTE.md` → PASO 0.5/Regla 2: hoy,
claro/editorial suele ser MÁS distintivo que oscuro precisamente porque casi nadie no-genérico lo
elige. Antes de fijar el modo de una app nueva, leer `16` — no asumir oscuro por defecto porque
este archivo empieza así.

> **Set de tokens canónico.** Los nombres semánticos largos (`--surface-primary`, `--text-primary`,
> `--brand-primary`) se definen aquí, y abajo se exponen los **alias cortos** que usan `14`, `16` y `29`:
> `--bg`, `--surface`, `--accent`, `--text`. Documentado UNA vez aquí; los demás archivos lo citan.
>
> **El acento (`--accent`/`--brand-primary`) es un PLACEHOLDER NEUTRO.** El acento real lo fija el
> brand kit del PASO 0 de `16`. No hardcodear un azul (#2563eb) como si fuera la marca.
>
> **La rampa de neutros es un PLACEHOLDER frío** (grises puros sin tinte). Reemplazarla por
> neutros con tinte (cálido o frío según la marca) en el PASO 0.5 de `16` — un dark con un
> sutil tinte se ve más intencional que el gris puro.

```css
/* TODOS los hex de este bloque son ilustrativos, NO copiar: deriva los tuyos (16) */
:root {
  /* ====== SUPERFICIES (fondos) — dark base ====== */
  --surface-base: #0A0A0B;           /* Fondo de página */
  --surface-primary: #0F0F12;        /* Cards, modales, contenedores principales */
  --surface-secondary: #141417;      /* Secciones alternas, sidebars */
  --surface-tertiary: #1A1A1F;       /* Inputs, áreas recesadas */
  --surface-elevated: #1A1A1F;       /* Elementos flotantes (dropdowns, tooltips) */
  --surface-overlay: rgba(0,0,0,0.7); /* Overlay detrás de modales */
  
  /* ====== TEXTOS ====== */
  --text-primary: #E8E8EA;           /* Títulos y texto principal */
  --text-secondary: #A1A1AA;         /* Descripciones, subtítulos */
  --text-tertiary: #71717A;          /* Placeholders, texto auxiliar */
  --text-inverse: #0A0A0B;           /* Texto sobre fondos de color */
  --text-link: var(--brand-primary); /* Links */
  
  /* ====== BORDES ====== */
  --border-default: #27272A;         /* Bordes normales */
  --border-strong: #3F3F46;          /* Bordes con más contraste */
  --border-focus: var(--brand-primary); /* Focus rings */
  
  /* ====== MARCA — PLACEHOLDER NEUTRO (el acento real lo fija el PASO 0 de 16) ====== */
  --brand-primary: #E8E8EA;          /* PLACEHOLDER neutro — NO un azul de marca; reemplazar */
  --brand-primary-hover: #FFFFFF;    /* Hover del color principal (placeholder) */
  --brand-primary-soft: rgba(232,232,234,0.10); /* Fondo sutil del acento (placeholder) */
  --brand-primary-text: #0A0A0B;     /* Texto sobre color principal */

  /* ====== ALIAS CORTOS — set canónico que citan 14/16/29 ====== */
  --bg: var(--surface-base);         /* fondo de página */
  --surface: var(--surface-primary); /* superficie de cards/contenedores */
  --text: var(--text-primary);       /* texto principal */
  --accent: var(--brand-primary);    /* acento (placeholder neutro hasta el PASO 0 de 16) */
  
  /* ====== ESTADOS SEMÁNTICOS ====== */
  --status-success: #22c55e;
  --status-success-soft: rgba(34,197,94,0.12);
  --status-error: #ef4444;
  --status-error-soft: rgba(239,68,68,0.12);
  --status-warning: #f59e0b;
  --status-warning-soft: rgba(245,158,11,0.12);
  --status-info: #38bdf8;
  --status-info-soft: rgba(56,189,248,0.12);
  
  /* ====== SOMBRAS (más profundas en dark) ====== */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.4);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.5);
  --shadow-lg: 0 10px 25px -5px rgba(0,0,0,0.6);
  --shadow-overlay: 0 25px 50px -12px rgba(0,0,0,0.7);
  
  /* ====== RADIOS (canónico: sm 8 chips · md 12 botones/inputs · lg 16 cards · xl 20 sheets — reconciliado con DESIGN-CORE y 49) ====== */
  --radius-sm: 0.5rem;     /* 8px — chips/badges */
  --radius-md: 0.75rem;    /* 12px — botones e inputs */
  --radius-lg: 1rem;       /* 16px — cards */
  --radius-xl: 1.25rem;    /* 20px — sheets/modales */
  --radius-full: 9999px;   /* Circular — avatares, pills */
  
  /* ====== TIPOGRAFÍA ====== */
  --font-display: 'TU_FUENTE_DISPLAY', system-ui, sans-serif;
  --font-body: 'TU_FUENTE_BODY', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Tamaños */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  
  /* Pesos */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Tracking (letter-spacing) — los displays usan tracking-tight */
  --tracking-tight: -0.02em;
  --tracking-tighter: -0.03em;

  /* Leading (line-height) */
  --leading-tight: 1.1;   /* displays / titulares grandes */
  --leading-snug: 1.2;    /* subtítulos */
  --leading-base: 1.5;    /* cuerpo de texto */
  --leading-relaxed: 1.6; /* párrafos largos */
  
  /* ====== ESPACIADO — escala canónica única: 4·8·12·16·24·32·48·64 (ver DESIGN-CORE) ====== */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  /* NO agregar --space-5 (20px) ni --space-10 (40px) ni ningún valor intermedio — rompe la regla
     "solo estos valores" de DESIGN-CORE. Si un layout "necesita" 20px, usar 16 o 24 — salvo el
     margen lateral de pantalla, que puede ser 20 si la app lo fija como token dedicado
     (--margen-lateral). */
  
  /* ====== CURVAS DE EASING (14-LEYES-DE-DISENO es el dueño único de las curvas) ====== */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);     /* DEFAULT UI: entradas Y salidas — arranca rápido y desacelera. Las salidas/exits también van con ease-out (doctrina canónica del SO), NUNCA ease-in */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);         /* casi nunca: NO usarla en salidas de UI (se siente lenta al arrancar); reservada a casos deliberados y raros */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* rebote sutil (overshoot) */

  /* ====== TRANSICIONES (construidas sobre las curvas de arriba) ====== */
  --transition-fast: 150ms var(--ease-out);
  --transition-base: 200ms var(--ease-out);
  --transition-slow: 300ms var(--ease-out);
  --transition-spring: 500ms var(--ease-spring);
  
  /* ====== Z-INDEX (escala fija, nunca inventar valores) ====== */
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-overlay: 30;
  --z-modal: 40;
  --z-toast: 50;
}

/* ====== UTILITY: números tabulares (métricas, tablas, contadores) ====== */
/* Sin esto, las cifras "bailan" al actualizarse porque cada dígito tiene ancho distinto.
   Aplicar en columnas de números, dashboards, timers, precios. (Regla en 14, micro-tipografía.) */
.tabular { font-variant-numeric: tabular-nums; }
```

### Tokens de Color — Light Theme (scaffold COMPLETO, no un "override opcional")

**El modo se DERIVA en el PASO 0 de `16` — no se asume oscuro.** Si el razonamiento del 16 dio modo claro (hábitos, kids, salud, educación, social, finanzas personales suelen ganar en claro — ver `29`), este scaffold es el punto de partida de PRIMERA CLASE, tan completo como el dark. Reglas propias del claro:

- **Casi-blancos CÁLIDOS con tinte, NUNCA `#FFFFFF` puro** (blanco puro = default delatador; el tinte lo fija la marca en el PASO 0.5 de `16` — estos valores son placeholder cálido).
- **La elevación en claro se hace con SOMBRAS SUAVES, no con bordes duros** (al revés que en dark, donde eleva la luz). Sombras tenues, multicapa, con un toque del tinte cálido — jamás `rgba(0,0,0,0.25)` a secas.
- **Semánticos más oscuros**: el verde/rojo/ámbar que contrastaba sobre `#0A0A0B` falla AA sobre crema. Se ajustan (abajo), no se heredan.

```css
/* TODOS los hex de este bloque son ilustrativos, NO copiar: deriva los tuyos (16) */
[data-theme="light"] {
  /* ====== SUPERFICIES (fondos) — light base ====== */
  --surface-base: #FAF7F2;           /* Fondo de página — casi-blanco CÁLIDO, nunca #fff */
  --surface-primary: #FFFEFA;        /* Cards, modales (apenas más claro que el fondo) */
  --surface-secondary: #F4F0E9;      /* Secciones alternas, sidebars */
  --surface-tertiary: #EEE9E0;       /* Inputs, áreas recesadas (−luz: hundido) */
  --surface-elevated: #FFFFFE;       /* Flotantes (dropdowns, tooltips) — la sombra hace el trabajo */
  --surface-overlay: rgba(40,34,27,0.45); /* Overlay cálido detrás de modales */

  /* ====== TEXTOS ====== */
  --text-primary: #28221B;           /* Casi-negro cálido, nunca #000 */
  --text-secondary: #6E6558;
  --text-tertiary: #9B9184;
  --text-inverse: #FAF7F2;           /* Texto sobre fondos de color */
  --text-link: var(--brand-primary);

  /* ====== BORDES (refuerzo sutil; la sombra es la que eleva) ====== */
  --border-default: #E6E0D6;
  --border-strong: #CFC7BA;
  --border-focus: var(--brand-primary);

  /* ====== MARCA — PLACEHOLDER NEUTRO (el acento real lo fija el PASO 0 de 16) ====== */
  --brand-primary: #28221B;          /* placeholder neutro oscuro — reemplazar por la marca */
  --brand-primary-hover: #16120D;
  --brand-primary-soft: rgba(40,34,27,0.06);
  --brand-primary-text: #FAF7F2;

  /* ====== ESTADOS SEMÁNTICOS (1-2 pasos más oscuros que en dark para AA sobre claro) ====== */
  --status-success: #15803d;
  --status-success-soft: rgba(21,128,61,0.10);
  --status-error: #b91c1c;
  --status-error-soft: rgba(185,28,28,0.08);
  --status-warning: #a16207;
  --status-warning-soft: rgba(161,98,7,0.10);
  --status-info: #0369a1;
  --status-info-soft: rgba(3,105,161,0.08);

  /* ====== SOMBRAS (suaves, multicapa, con tinte cálido — la elevación del modo claro) ====== */
  --shadow-sm: 0 1px 2px rgba(40,34,27,0.05), 0 1px 3px rgba(40,34,27,0.04);
  --shadow-md: 0 2px 4px rgba(40,34,27,0.04), 0 6px 16px rgba(40,34,27,0.06);
  --shadow-lg: 0 4px 8px rgba(40,34,27,0.05), 0 12px 32px rgba(40,34,27,0.08);
  --shadow-overlay: 0 24px 48px -12px rgba(40,34,27,0.18);
}
```

> Los alias cortos (`--bg`, `--surface`, `--text`, `--accent`), radios, tipografía, espaciado, easing y z-index NO se redeclaran: apuntan a los semánticos y cambian solos con el tema.
>
> **Si el proyecto es LIGHT-FIRST** (el PASO 0 del 16 derivó claro como modo principal): invertir la estructura — este bloque claro pasa a ser el `:root` base y el dark pasa a ser el override `[data-theme="dark"]`. La lógica de tokens es idéntica; solo cambia cuál es el default. Recordar entonces `color-scheme: light` en `:root` y el `theme-color` claro como primario.

### COLOR EN OKLCH (opcional recomendado)

Tailwind v4 es OKLCH nativo (su paleta interna ya vive en `oklch()`), y los tokens del SO pueden
declararse igual: `oklch(L C H)` separa luminancia (L), croma (C) y hue (H) en ejes perceptuales
independientes — lo que vuelve MEDIBLE la regla del "neutro con tinte sutil" que hasta ahora se
verificaba a ojo.

**Fórmula de rampa de neutros con carácter:**

```
L → fijo por nivel de superficie (ej. en claro: base 0.98 · elevado 0.96 · hundido 0.94)
C → 0.005–0.015 (el "tinte" que la doctrina pedía a ojo, ahora medible — menos es gris
    puro, más ya es un color)
H → el hue del acento (así toda la rampa neutra "mira" hacia la marca)
```

**Ejemplo — 3 tokens del scaffold claro en oklch(), equivalentes a los hex actuales (aprox.):**

```css
--surface-base:     oklch(0.978 0.008 85);  /* ≈ #FAF7F2 */
--surface-primary:  oklch(0.995 0.005 95);  /* ≈ #FFFEFA */
--surface-tertiary: oklch(0.937 0.013 85);  /* ≈ #EEE9E0 */
```

> Los hex siguen siendo válidos — OKLCH no los reemplaza: hace VERIFICABLE la regla del tinte
> (¿C está entre 0.005 y 0.015? ¿H apunta al hue del acento?) en vez de confiarla al ojo.

### Dark Mode Robusto a Nivel Plataforma (lo que los tokens solos NO arreglan)

Los tokens controlan tu CSS, pero hay tres piezas nativas del navegador/SO que ignoran tus variables y se ven rotas en dark si no las declaras explícitamente:

```css
/* 1. color-scheme: arregla scrollbars, inputs nativos, autofill, date pickers
      del navegador para que rendericen en su variante oscura */
:root { color-scheme: dark; }
[data-theme="light"] { color-scheme: light; }
```

```html
<!-- 2. theme-color: pinta la barra del navegador (mobile) y el chrome del SO
        para que matcheen el fondo de la app, no quede una franja blanca arriba -->
<meta name="theme-color" content="#0A0A0B" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#ffffff"  media="(prefers-color-scheme: light)">
```

```css
/* 3. <select> nativo: en Windows dark mode el desplegable hereda blanco-sobre-blanco
      (bug real). Forzar background-color y color explícitos. */
select {
  background-color: var(--surface-tertiary);
  color: var(--text-primary);
}
```

Sin `color-scheme`, un dark mode "perfecto" en tu CSS aún muestra scrollbars claras e inputs nativos blancos — la señal #1 de un dark mode a medias.

### Anti-FOUC: el script inline OBLIGATORIO en `<head>` (antes del primer paint)

**El `useTheme` de abajo NO basta solo**: React corre DESPUÉS del primer paint, así que un usuario con tema claro guardado ve un flash oscuro (o viceversa) en cada carga — el "flash of wrong theme" que delata una app amateur. La solución canónica es un script inline **bloqueante** en el `<head>`, ANTES de cualquier CSS/JS de la app, que lee localStorage y `prefers-color-scheme` y setea el atributo antes de pintar:

```html
<!-- En <head>, ANTES de los stylesheets. Inline, sin src, sin defer/async. -->
<script>
  (function () {
    try {
      var saved = localStorage.getItem('theme'); // 'light' | 'dark' | null
      var theme = saved || (window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light' : 'dark'); // default del SO: dark (invertir si el proyecto es light-first)
      if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = theme;
    } catch (e) {}
  })();
</script>
```

```tsx
// Next.js App Router: en app/layout.tsx, dentro de <head> (o como primer hijo de <body>)
// con dangerouslySetInnerHTML para que sea inline y bloqueante:
const themeScript = `(function(){try{var s=localStorage.getItem('theme');var t=s||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');if(t==='light')document.documentElement.setAttribute('data-theme','light');document.documentElement.style.colorScheme=t}catch(e){}})()`;
// <script dangerouslySetInnerHTML={{ __html: themeScript }} />
// Nota: setear data-theme en <html> desde el script puede requerir
// suppressHydrationWarning en la etiqueta <html> (es el patrón estándar, ej. next-themes).
```

Reglas: (1) el script decide con la MISMA lógica que `useTheme` (localStorage → prefers-color-scheme → default del SO) para que nunca discrepen; (2) va inline en el HTML, nunca en un bundle (llegaría tarde); (3) el `try/catch` cubre localStorage bloqueado (Safari privado).

### Implementar el Toggle de Tema

```typescript
// hooks/useTheme.ts — gestiona los CAMBIOS de tema en runtime.
// El estado INICIAL sin flash lo garantiza el script inline de arriba, no este hook.
function useTheme() {
  // Este snippet asume :root = dark como PUNTO DE PARTIDA TÉCNICO (si tu Ficha derivó claro, invierte: ver "inversión light-first" abajo).
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // 1. Respetar preferencia guardada
    const saved = localStorage.getItem('theme');
    if (saved) return saved as 'light' | 'dark';
    // 2. Default = el modo DERIVADO en FICHA-ARTE.md; el otro modo respeta prefers-color-scheme
    return window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light' : 'dark';
  });

  useEffect(() => {
    // dark es :root → solo seteamos el atributo para el override claro
    if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return { theme, toggleTheme };
}
```

**Regla para MVP**: Si implementar dark mode no es prioridad, IGUALMENTE usar tokens semánticos. Así cuando quieras agregar dark mode después, es agregar un bloque CSS, no reescribir la app.

---

## Tokens de Marcas Ajenas (WhatsApp, redes, pasarelas)

Cuando un botón representa un servicio externo, su color **no** es una decisión de diseño: es un
activo de reconocimiento. Un botón de WhatsApp en gris genérico pierde justo lo que lo hace útil —
que se identifique sin leerlo.

Esos colores **también son tokens**. Un hex suelto en un componente es exactamente lo que el sistema
prohíbe, y además hace que el valor se copie mal la segunda vez que se use.

```css
/* ====== MARCAS AJENAS ======
   No se derivan de la paleta propia: son valores oficiales de terceros.
   ⚠️ No ajustarlos "para que combinen": su valor está en que se reconozcan. */
--brand-ext-[servicio]-from:   /* color oficial claro */
--brand-ext-[servicio]-to:     /* color oficial oscuro, si lleva degradado */
--brand-ext-[servicio]-shadow: /* sombra tintada del mismo color */
```

**Reglas:**
- Usar el **glifo oficial** del servicio, no un ícono genérico parecido (un bocadillo de chat no es
  el logo de WhatsApp). Respetar las guías de marca del tercero.
- El color ajeno **no compite** con el acento propio si están en jerarquías distintas: la acción
  principal en el color de la marca propia, la acción del servicio externo en el suyo.
- No inventar degradados ni versiones "adaptadas" del color de otro.

---

## Tokens de Accesibilidad

### Contraste de Color — Mínimos Obligatorios (WCAG 2.2 AA)

```
Texto normal (<18px):        4.5:1 ratio mínimo con su fondo
Texto grande (≥18px bold):   3:1 ratio mínimo con su fondo
Elementos de UI (íconos, bordes): 3:1 ratio mínimo con su fondo
Focus indicators:            3:1 ratio con el fondo adyacente
```

**Herramientas para verificar**: Usar la extensión "Colour Contrast Checker" en el navegador, o WebAIM Contrast Checker online.

**Errores comunes de contraste:**
```css
/* ❌ FALLA — gris claro sobre blanco (ratio ~2:1) */
.subtitle { color: #d1d5db; background: #ffffff; }

/* ✅ PASA — gris suficientemente oscuro (ratio ~4.6:1) */
.subtitle { color: #6b7280; background: #ffffff; }

/* ❌ FALLA — texto blanco sobre azul claro */
.badge { color: #ffffff; background: #93c5fd; }

/* ✅ PASA — texto oscuro sobre azul claro */
.badge { color: #1e3a5f; background: #93c5fd; }
```

### Target Size — Áreas Táctiles Mínimas (WCAG 2.2)

```css
/* WCAG 2.2 Level AA: mínimo 24x24px */
/* Recomendación para apps touch: 44x44px */

.button, .link-touchable, [role="button"] {
  min-height: 44px;
  min-width: 44px;
  /* Si el elemento visual es más pequeño, usar padding */
  padding: 8px 16px;
}

/* Íconos clickeables necesitan área táctil expandida */
.icon-button {
  position: relative;
  width: 24px;
  height: 24px;
}
.icon-button::before {
  content: '';
  position: absolute;
  inset: -10px; /* Expande el área táctil sin cambiar el visual */
}
```

### Focus Visible — Obligatorio para Navegación por Teclado

```css
/* Base: focus visible solo con teclado (no con mouse) */
:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Eliminar el outline de mouse pero mantener el de teclado */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Reduce Motion — Respetar Preferencia del Usuario

**`prefers-reduced-motion` NO significa "cero animación".** Significa: el usuario tiene una condición vestibular (mareo, náusea) que dispara el MOVIMIENTO y la POSICIÓN, no el color ni la opacidad. Matar todas las transiciones a `0.01ms` es un error común: rompe fades y cambios de color que ayudan a *comprender* qué pasó (un elemento que aparece sin fade se siente como un glitch, no como respeto a la accesibilidad).

Regla correcta: **quitar solo movimiento/posición (transform, translate, scale grandes, parallax, autoplay); conservar opacity/color.**

```css
/* ❌ INCORRECTO — mata TODA animación, incluidos fades inofensivos */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* ✅ CORRECTO — neutraliza movimiento, deja fades y color */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    /* corta loops y scroll animado (lo que marea) */
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
  /* anula desplazamiento/escala pero NO toca opacity ni color */
  [data-motion],
  .stagger-1, .stagger-2, .stagger-3, .stagger-4 {
    transform: none !important;
    animation-name: fade-only !important; /* mismo timing, sin translateY */
  }
}
@keyframes fade-only { from { opacity: 0 } to { opacity: 1 } }
```

Para valores de posición controlados en JS (Framer Motion / animaciones por estado), usar el hook para **sustituir el valor de movimiento, no para apagar todo**:

```tsx
import { useReducedMotion } from 'motion/react';

const reduce = useReducedMotion();
// el fade se queda; el desplazamiento se anula
const variants = {
  hidden:  { opacity: 0, y: reduce ? 0 : 12 },
  visible: { opacity: 1, y: 0 },
};
```

**Esto es obligatorio, no opcional.** Algunos usuarios tienen condiciones vestibulares que pueden causar mareos o náuseas con el movimiento. Respetar la preferencia es accesibilidad básica — pero respetarla bien es conservar lo que comunica y quitar solo lo que marea. (Detalle de animación accesible en `41-CRAFT-DE-ANIMACION.md`.)

---

## HTML Semántico — Estructura Correcta

La estructura HTML de la app debe usar las etiquetas correctas, no solo `<div>` para todo:

```html
<!-- ✅ CORRECTO — HTML Semántico -->
<body>
  <header role="banner">
    <nav aria-label="Navegación principal">
      <!-- Links de navegación -->
    </nav>
  </header>
  
  <main id="main-content">
    <section aria-labelledby="section-title">
      <h1 id="section-title">Título de la sección</h1>
      <article>
        <!-- Contenido de un resultado/item -->
      </article>
    </section>
    
    <aside aria-label="Barra lateral">
      <!-- Contenido secundario -->
    </aside>
  </main>
  
  <footer role="contentinfo">
    <!-- Links legales, contacto -->
  </footer>
</body>

<!-- ❌ INCORRECTO — Div soup -->
<body>
  <div class="header">
    <div class="nav">...</div>
  </div>
  <div class="content">
    <div class="section">
      <div class="title">...</div>
    </div>
  </div>
</body>
```

**¿Por qué importa?** Los lectores de pantalla usan las etiquetas semánticas para construir un índice de la página. Sin ellas, los usuarios con discapacidad visual no pueden navegar la app. También mejora el SEO.

---

## Formularios Accesibles — Patrón Correcto

```html
<!-- ✅ CORRECTO — Label asociado, error descriptivo, aria-attributes -->
<div class="field">
  <label for="email">Correo electrónico</label>
  <input 
    id="email"
    type="email" 
    aria-describedby="email-error"
    aria-invalid="true"
    placeholder="tu@email.com"
  />
  <p id="email-error" role="alert" class="error">
    Ingresa un correo válido
  </p>
</div>

<!-- ❌ INCORRECTO — Sin label, sin asociación -->
<div>
  <input type="email" placeholder="Email" />
  <p class="error">Error</p>
</div>
```

### Validación de Formularios — Cuándo Validar

```
Al escribir (onBlur): Validar cuando el usuario SALE del campo. 
  No validar mientras escribe (frustrante).

Al enviar (onSubmit): Validar todo de nuevo antes de enviar. 
  Enfocar automáticamente el primer campo con error.

Validación inline: Mostrar el error DEBAJO del campo, no en un toast 
  o en la parte superior de la página.

Éxito inline: Mostrar checkmark verde cuando el campo es válido 
  (solo para campos que el usuario puede dudar, como passwords).
```

---

## Core Web Vitals — Las 3 Métricas que Importan

### LCP (Largest Contentful Paint) — Objetivo: <2.5 segundos
Mide cuánto tarda el elemento más grande visible en cargar.

**Cómo optimizar:**
- El contenido principal debe cargar primero (no detrás de JS pesado)
- Imágenes en formatos modernos (WebP, AVIF)
- Fuentes con `font-display: swap` para no bloquear el render
- Precargar recursos críticos: `<link rel="preload">`

### INP (Interaction to Next Paint) — Objetivo: <200ms
Mide la latencia entre la acción del usuario y la respuesta visual.

**Cómo optimizar:**
- Event handlers livianos (no computación pesada en onClick)
- Debounce en inputs que disparan re-renders
- Web Workers para procesamiento pesado
- React: evitar re-renders innecesarios con useMemo/useCallback

### CLS (Cumulative Layout Shift) — Objetivo: <0.1
Mide cuánto se mueve el layout mientras carga.

**Cómo optimizar:**
- Siempre definir width/height en imágenes y videos
- Reservar espacio para contenido dinámico (skeleton loaders)
- Fuentes con `font-display: optional` o `swap` + `size-adjust`
- No insertar contenido arriba del viewport después del render inicial

---

## Cómo Usar Este Archivo

### Integración con Tailwind CSS

#### Tailwind v4 (CSS-first, `@theme` — el default de proyectos nuevos)

**Los proyectos nuevos de `create-next-app` ya traen Tailwind v4**: no hay `tailwind.config.js` — la configuración vive en el CSS con `@theme`. Los MISMOS tokens se mapean así:

```css
/* app/globals.css */
@import "tailwindcss";

/* 1. Los tokens semánticos se declaran igual que siempre (:root dark + [data-theme="light"]) */
:root { /* ...bloque dark de este archivo... */ }
[data-theme="light"] { /* ...bloque light de este archivo... */ }

/* 2. @theme expone los tokens como utilidades de Tailwind.
      "inline" hace que la utilidad referencie la var() en runtime → el toggle de tema funciona. */
@theme inline {
  --color-surface-base: var(--surface-base);
  --color-surface-primary: var(--surface-primary);
  --color-surface-secondary: var(--surface-secondary);
  --color-surface-tertiary: var(--surface-tertiary);
  --color-brand-primary: var(--brand-primary);
  --color-brand-primary-hover: var(--brand-primary-hover);
  --color-brand-primary-soft: var(--brand-primary-soft);
  --color-txt-primary: var(--text-primary);      /* 'text' choca con utilidades text-* */
  --color-txt-secondary: var(--text-secondary);
  --color-txt-tertiary: var(--text-tertiary);
  --color-border-default: var(--border-default);

  --font-display: var(--font-display);
  --font-body: var(--font-body);

  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);

  --ease-out: var(--ease-out);
  --ease-spring: var(--ease-spring);
}
```

Con eso escribes `bg-surface-primary text-txt-secondary rounded-lg font-display` exactamente igual que en v3, pero sin archivo de config. Reglas v4: (1) NO crear `tailwind.config.js` en proyectos v4 — todo va en `@theme`; (2) usar `@theme inline` cuando el valor es una `var()` que cambia con el tema (sin `inline`, Tailwind congela el valor en build); (3) los tokens semánticos siguen siendo la fuente de verdad — `@theme` solo los expone, no los reemplaza.

#### Tailwind v3 (proyectos existentes con `tailwind.config.js`)

Los tokens CSS se integran con Tailwind extendiendo el config:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        surface: {
          base: 'var(--surface-base)',
          primary: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
          tertiary: 'var(--surface-tertiary)',
        },
        brand: {
          primary: 'var(--brand-primary)',
          'primary-hover': 'var(--brand-primary-hover)',
          'primary-soft': 'var(--brand-primary-soft)',
        },
        txt: { // 'text' está reservado en Tailwind
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
    }
  }
}
```

Así puedes escribir `bg-surface-primary text-txt-secondary` en vez de clases hexadecimales, y al cambiar el token CSS cambia toda la app.

Si NO usas Tailwind config personalizado, usar las variables directamente en los estilos inline o en clases CSS:
```tsx
<div style={{ background: 'var(--surface-primary)', color: 'var(--text-primary)' }}>
```

### Pasos de Implementación

1. **Al inicio del proyecto**: Copiar la ESTRUCTURA de tokens al archivo global de estilos
2. **Personalizar ANTES de la primera pantalla (gate de arriba)**: reemplazar TODOS los hex
   placeholder por el brand kit derivado/extraído, mostrarlo al usuario y esperar su OK
3. **Referenciar siempre tokens**: NUNCA usar colores hexadecimales directos en componentes
4. **Verificar contraste**: Cada vez que elijas un color de texto sobre un fondo
5. **Probar con teclado**: Navegar la app entera solo con Tab, Enter y Escape
6. **Probar reduce-motion**: Activar "reduce motion" en el sistema y verificar que la app funcione sin animaciones
