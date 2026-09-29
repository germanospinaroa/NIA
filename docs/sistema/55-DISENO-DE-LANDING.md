# DISEÑO DE LANDING — Especificación Visual de la Estructura Canónica

> **Cuándo cargar este archivo:**
> - SIEMPRE que se construya o revise la landing/página de ventas (hero, carrusel, oferta, FAQ, CTA final, sticky CTA, footer)
> - Junto con `19-PAGINA-DE-VENTAS.md` (la ESTRUCTURA CANÓNICA de 10 secciones y el arco — este archivo es su capa VISUAL, igual que `50` lo es de `02B`), `52-COPY-VISUALES-CONVERSION.md` (el copy que va dentro de estas medidas), `14-LEYES-DE-DISENO.md` (los números base) y `16-DIRECCION-DE-ARTE.md` (el brand kit del que salen acento, tipografías y radius)
>
> **Por qué existe:** `19` fija QUÉ 10 secciones lleva la landing (orden INMUTABLE) y `52` QUÉ dicen. Pero sin especificación visual, el agente diseña la landing "de reflejo" y sale genérica: hero de texto chico, secciones pegadas sin ritmo, pricing de columnas iguales y un footer con el CTA perdido. El paywall ya tiene su blueprint con medidas (`50`); la landing — la pantalla que trae el tráfico pagado — merece el mismo rigor. Números, no adjetivos.

**Regla de dependencia:** los valores CONCRETOS (acento, familia display, radius, modo claro/oscuro) salen del brand kit de `16` (FICHA-ARTE.md) y son los MISMOS de la app (coherencia landing↔producto, checklist de 19). Este archivo fija estructura, rangos y comportamiento. Márgenes laterales mobile: 16-20px. Contenedor desktop: max-width 1100-1200px centrado.

**Orden de secciones = el canónico de `19`, sin excepción:**
```
1. HERO → 2. PROBLEMA → 3. AGITACIÓN → 4. SOLUCIÓN → 5. LA APP POR DENTRO (carrusel) →
6. OFERTA → 7. GARANTÍA → 8. FAQ → 9. CTA FINAL EMOCIONAL → 10. FOOTER LEGAL
(+ capas transversales al final: ritmo vertical, sticky CTA, señales direccionales, animaciones)
```

---

## EL KIT PRIMERO (v6) — la landing se construye DESDE el código canónico

La landing NO se maqueta desde cero: se construye desde el **KIT EJECUTABLE
`plantillas-codigo/landing/`** (las 10 secciones + `ui.tsx` + `MarkedCopy.tsx` + `tokens.css`),
que ya trae embebidos los blueprints de este archivo — medidas, motion, sticky CTA,
accesibilidad y el presupuesto de copy de `52` como warns ejecutables en dev. El orden operativo:

```
1. FICHA-ARTE.md aprobada  →  2. copiar el kit al proyecto y tematizar SOLO tokens.css  →
3. llenar las props con el copy MARCADO de docs/copy/landing.md ([acento]/[b], regla de 52)  →
4. componer la página (EJEMPLO-page.tsx muestra cómo)  →  5. audit-conversion + gates de
   cierre (render 375px + rúbricas /40 y copy /20)
```

**Construir a mano una sección que el kit ya trae = DESVIACIÓN:** se justifica por escrito en
ESTADO.md (qué faltaba en el kit y por qué no se resolvió con props/slots) y se propone al
usuario antes (regla de estructura inmutable de `19`). Los blueprints de abajo siguen siendo la
ESPECIFICACIÓN de referencia — el kit es su ejecución: si kit y blueprint divergen, se corrige
el kit, no se reinterpreta la pantalla. La doctrina de uso completa vive en
`plantillas-codigo/landing/README.md`.

---

## EL SISTEMA DE ÍCONOS Y DETALLES (lo que rompe el texto — obligatorio en TODA sección)

Hallazgo de prueba real: las landings salían con demasiado texto y casi cero ícono ni detalle visual — planas y aburridas. Este sistema es TRANSVERSAL: se aplica ANTES de maquetar cualquier sección, y sus recetas son las mismas para onboarding, paywall y app (los componentes `<IconChip>` y `<GradientBorderCard>` viven en `49`).

**REGLA MADRE: ninguna sección de la landing es SOLO texto.** Cada una de las 10 secciones lleva su elemento visual definido (ícono con contenedor, visual del producto, número héroe, borde con intención — la tabla de "dónde van" y el repertorio de abajo dicen cuál). **Emojis PROHIBIDOS como elemento visual** (ya son anti-patrón en la app — CLAUDE.md; en la landing también) salvo que el usuario los pida explícitamente. Todo ícono es SVG de librería, nunca un carácter emoji.

### Íconos premium — fuente + contenedor

```
FUENTE: las librerías SVG del stack, ya instaladas (22): Lucide + Phosphor.
  - Phosphor DUOTONE para secciones cálidas/emocionales (problema, mecanismo, garantía, FAQ).
  - Lucide o Phosphor REGULAR (line) para secciones técnicas/informativas (features del
    pricing, trust row, footer).
  - UN peso CONSISTENTE en toda la página (elegir duotone O line por sección y sostenerlo;
    no mezclar en la misma sección) · color SIEMPRE del brand kit (var(--brand-primary) o
    var(--text-secondary)) — jamás un color nuevo.

CONTENEDOR DE ÍCONO (el detalle que separa premium de básico — un ícono desnudo flotando
junto al texto se ve de template; un ícono en su chip se ve diseñado):
  - Ícono 20-24px DENTRO de un chip/caja de 40-48px (cuadrada o circular — UNA forma por página).
  - Radius del brand kit (--radius-md la caja, --radius-full el círculo).
  - Fondo: acento al 8-12% (var(--brand-primary-soft)) o degradé sutil del MISMO hue
    (135deg, acento 12% → acento 4%).
  - Opcional: hairline de 1px (acento al 20-25%) que lo despega del fondo.
```

```tsx
// El patrón (componente completo <IconChip> con variantes en 49):
<div className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-md)]
                border border-[color-mix(in_oklab,var(--brand-primary)_20%,transparent)]
                bg-[var(--brand-primary-soft)]">
  <ForkKnife size={22} weight="duotone" color="var(--brand-primary)" aria-hidden="true" />
</div>
```

```
DÓNDE VAN SÍ o SÍ (mínimo obligatorio — sin esto la sección no está lista):
  §2 PROBLEMA  → UN ícono de dolor por pregunta (en contenedor, neutro/ámbar apagado)
  §4 MECANISMO → cada paso con number chip o ícono en contenedor
  §6 OFERTA    → checkmarks CUSTOM en las features + bullets del stack de valor con ícono
  §7 GARANTÍA  → sello/badge con ícono de escudo SVG en contenedor
  §8 FAQ       → chevron SVG 20px por ítem (opcional: ícono por pregunta)
  Badges de garantía/confianza (trust row, franja del hero) → íconos SVG 14-16px, jamás emoji
```

> **Regla NN/g (Icon Usability): el ícono ACOMPAÑA al texto, nunca lo sustituye** — sin estándar
> universal, el reconocimiento de íconos varía enormemente y el label visible es obligatorio
> (hover no existe en touch). Y el límite: si quitar el chip no pierde significado NI ancla el
> escaneo, el chip sobra — la iconografía decorativa es ruido, no conversión.

### Hairlines y bordes con degradé (receta CSS copiable)

```css
/* Borde fino 1-2px con degradé — técnica padding-box/border-box (respeta el radius): */
.hairline-degradada {
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  background:
    linear-gradient(var(--surface-primary), var(--surface-primary)) padding-box,
    linear-gradient(135deg,
      color-mix(in oklab, var(--brand-primary) 40%, transparent),
      transparent 60%) border-box;
}
/* Variante de énfasis (el elemento MÁS importante de la vista): 2px y acento al 55-60%. */
```

```
DÓNDE SE USA: cards destacadas · el plan RECOMENDADO del pricing (§6) · la card de garantía (§7)
  · el chip/nombre del mecanismo bautizado (§4). Componente listo: <GradientBorderCard> (49).
REGLA DE JERARQUÍA: hairline degradada = señal de "esto importa". Solo en 1-3 elementos clave
  por vista — regada en todas las cards deja de significar y se vuelve decoración (16 PASO 5).
```

### El repertorio del diseñador (los 10 detalles que rompen el texto)

| # | Detalle | Mini-receta | Dónde |
|---|---|---|---|
| 1 | Number chips (01/02/03) | dígito 16-18px/700 tabular-nums en contenedor 40-48px, radius del kit, fondo acento 8-12% | SOLO pasos reales del mecanismo (§4) — ver ⚠️ abajo |
| 2 | Separadores con intención | hairline 1px con fade lateral: `linear-gradient(90deg, transparent, var(--border-default), transparent)` | entre bloques DENTRO de una sección (entre secciones separa el cambio de fondo, T1) |
| 3 | Badge pills | borde 1px acento 25% + fondo acento 8% + caps 11-12px/600 + radius-full, padding 4×12px | kickers, "MÁS POPULAR", badge de trial |
| 4 | Fondos de sección con textura sutil | grano SVG al 2-3% de opacidad o dots en grid de 24px (recetas del banco del 54) | secciones elevadas (2-3, 5, 7) |
| 5 | Sombras de color | `box-shadow: 0 8px 30px color-mix(in oklab, var(--brand-primary) 18%, transparent)` — hue del acento al 15-20%, no negro puro | CTA héroe, visual del hero, plan recomendado |
| 6 | Highlight de palabras clave | subrayado marcador (receta del 54) o acento en 1-3 palabras del titular (JERARQUÍA DE ÉNFASIS) — NUNCA gradiente de texto (cliché IA, 16) | titular del hero, headline del CTA final |
| 7 | Tarjetas bento | 1 card grande protagonista + 2-3 chicas, radius del kit, MISMO gap (12-16px) | beneficios dentro de §4/§5 si el contenido lo pide |
| 8 | Marcos de screenshot | frame con hairline 1px + sombra de color (detalle 5) + radius 16-24px | visual del hero, frames del carrusel §5 |
| 9 | Checkmarks custom | círculo 20-24px fondo acento 12% + check SVG 12-14px acento (stroke 2.5) — no el ✓ del sistema ni emoji | features del pricing §6, stack de valor, beneficios |
| 10 | Hover con elevación | translateY(-2px) + sombra un nivel arriba, 200ms ease-out, SOLO bajo @media (hover:hover) | cards de planes, testimonios, FAQ |

> ⚠️ **Sobre los number chips vs el anti-slop del 16 (PASO 5.7):** lo prohibido allá son los marcadores 01/02/03 como DECORACIÓN por defecto (eyebrows numerados regados sobre cada feature, sin diseño propio). Aquí son otra cosa: numeran PASOS reales de un proceso (el mecanismo de §4), van en contenedor del brand kit y aparecen UNA sola vez en la página. Funcional + con tratamiento propio = permitido; decorativo + regado = sigue prohibido.

```
ANTI-SLOP SIGUE VIGENTE: este sistema NO es licencia para glow regado, glass sobre el contenido
ni orbes de gradiente (16). Cada detalle sale del brand kit (FICHA-ARTE.md) y del banco del 54;
la regla 60-30-10 manda: los detalles usan el MISMO acento y los MISMOS neutros — cero colores
nuevos. Si un detalle no se puede trazar al kit, no entra.
```

---

## JERARQUÍA DE ÉNFASIS (por qué nada resalta y cómo arreglarlo)

Fallo real observado: titulares de landing en texto plano — mismo peso, mismo color en toda la frase — donde nada resalta: el ojo no tiene ruta y la promesa se lee como un párrafo más. La regla (aplica a landing, onboarding y paywall — doctrina compartida con `50` y `52`):

```
TITULAR (H1/H2 de landing/onboarding/paywall): bold completo (700-800) SIEMPRE + 1-3 palabras
  clave en COLOR DE ACENTO — se resalta la palabra que VENDE (el beneficio, el número o la
  transformación), nunca artículos ni conectores. Variante permitida si el kit la define:
  degradé tonal del acento en la palabra clave (nunca gradiente animado en todo el titular — 16).
SUBTITULAR: peso 400-500 con 2-4 palabras importantes en semibold (600); máximo 1 palabra en
  acento y solo si el titular no usó acento en la misma zona.
BODY: 1-2 keywords en semibold por párrafo largo.
CONTRASTE POR SECCIÓN: secciones adyacentes distinguibles (fondo base/elevado alternado o
  separador — el patrón de T1); todo texto AA sobre su fondo.
```

```tsx
// Mini-ejemplo — la palabra que vende lleva el acento; el subtitular marca lo importante:
<h1 className="text-[40px] font-bold">
  Escanea tu plato: <span className="text-[var(--accent)]">calorías en 10 segundos</span>
</h1>
<p className="text-[17px] font-normal text-[var(--text-secondary)]">
  El Escáner de Plato registra tu comida <strong className="font-semibold">sin escribir nada</strong>
</p>
```

QUÉ palabra se marca lo decide el REDACTOR, no el maquetador: el copy llega MARCADO con
`[acento]…[/acento]` y `[b]…[/b]` (regla "QUÉ PALABRA SE RESALTA" de `52`) — el diseño ejecuta, no adivina.

---

## 1. HERO MOBILE (375px) — los 3-5 segundos que deciden todo

> La regla de los 3-5 segundos no es metáfora (57% del tiempo de visionado ocurre arriba del
> fold y 74% en las dos primeras pantallas — NN/g 2018; el "fold ya no importa" es un mito).

### 1.1 Blueprint a 375px

```
┌─────────────────────────────────────┐  375px
│ ◆ NombreApp              [Entrar]   │ ← header 56-64px: logo 24-28px + wordmark
│                                     │    16px/600 · link login terciario 14px
│                                     │    (gap 32-48px)
│  Escanea tu plato:                  │ ← titular (4 U's de Mark Ford, 19 §1)
│  calorías en                        │    display 40-56px / 700-800 /
│  10 segundos                        │    lh 1.05-1.1 / letter-spacing 0
│                                     │    máx 8-10 palabras · text-wrap: balance
│                                     │    (desktop: empieza en 56-72px; ajusta al copy real)
│  El Escáner de Plato registra tu    │ ← subtitular 17-18px / 400 / lh 1.5 /
│  comida sin escribir nada           │    gris secundario · máx 12-14 palabras (52)
│                                     │    (gap 24px)
│ ┌─────────────────────────────────┐ │
│ │      Probar mi primer escaneo   │ │ ← CTA héroe: alto ≥52px (52-56px), ancho
│ └─────────────────────────────────┘ │    completo mobile, acento pleno, 17px/600
│  ★★★★★ 4.8 · +2.140 personas ya     │ ← FRANJA DE PRUEBA SOCIAL (posición fija de
│  lo usan                            │    19 §1): 13-14px, 8-12px bajo el CTA ·
│                                     │    SOLO números reales (día 1 → garantía)
│ ┌─────────────────────────────────┐ │
│ │      [ visual del producto ]    │ │ ← visual REAL o PLACEHOLDER (ver 1.3):
│ │      recortado, entra desde     │ │    ancho completo · el borde superior
│ │      abajo del pliegue          │ │    VISIBLE en el primer viewport
│ └─────────────────────────────────┘ │    (invita al scroll — nunca 100% oculto)
└─────────────────────────────────────┘
```

### 1.2 Especificación numérica

```
TITULAR: empieza en 36-48px mobile / 56-72px desktop y ajusta al copy renderizado ·
  weight 700-800 · lh 1.05-1.1 · letter-spacing 0. Es el elemento MAS GRANDE de la pagina,
  pero no se fuerza una escala que rompa el primer viewport. Si un numero de la
  oferta o un título de sección le compite en tamaño, la jerarquía está rota.
  OBLIGATORIO (JERARQUÍA DE ÉNFASIS de arriba): 1-3 palabras clave en acento o con
  subrayado/marker (la que cambia la decisión — resultado, tiempo o mecanismo; el copy
  llega marcado según la regla de énfasis de 52). Nunca gradiente animado en todo el
  titular (receta del look IA, ver 16).

SUBTITULAR: 17-18px / 400 / lh 1.5 / color secundario · máx 12-14 palabras (presupuesto
  de copy de 52) · máx 2 líneas a 375px · gap de 12-16px bajo el titular. Complementa y
  POTENCIA el titular (19 §1) — nunca lo repite.

CTA: alto 52-56px (≥52px SIEMPRE) · ancho completo a 375px (desktop: auto con padding
  32-40px horizontal) · radius del brand kit · 16-17px/600 · acento pleno · sombra de
  elevación sutil (el botón se ve VIVO, no plano) · whileTap scale 0.97.
  1ª persona + beneficio ("Probar mi primer escaneo") — nunca "Empezar"/"Registrarse".
  El destino sigue al MODELO de 02C (checkout Hotmart vs registro/onboarding) — ver 19.

FRANJA DE PRUEBA SOCIAL BAJO EL CTA: 13-14px · 8-12px de gap · estrellas 14-16px si hay
  rating real. Día 1 sin números: "Garantía Hotmart de 7 días — sin preguntas" (la
  reversión de riesgo ES prueba social de día 1, jerarquía de 19 §5). NUNCA un contador
  inventado. Esta franja es LA posición de la prueba social temprana — no se duplica en
  una sección propia.

VISUAL DEL PRODUCTO: entra parcialmente en el primer viewport (borde superior visible
  ~80-120px) — señal de que hay más abajo. Screenshot real dentro de la app o mini-demo
  HTML honesto (19 → "mockups honestos"). Con marco de dispositivo o sombra elevada +
  radius 16-24px. Imagen AVIF/WebP <100KB, width/height definidos, SIN lazy (es el LCP —
  specs de 19).

HEADER: 56-64px de alto · logo+nombre a la izquierda (lleva a `/`) · a la derecha SOLO
  "Entrar" (terciario) — sin menú de navegación que distraiga del CTA (19). Sticky solo
  en desktop si aporta; en mobile el sticky es del CTA (transversal T2), no del header.
```

### 1.3 Variante PLACEHOLDER de visual (app aún no construida, o imagen que debe poner el usuario)

```
┌─────────────────────────────────────┐
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │ ← borde DISCONTINUO 2px dashed, color neutro
│ │                                 │ │    secundario · radius 16-24px · fondo elevado
│ │   [◉] Sugerencia: captura del   │ │    sutil (acento al 4-6% o neutro elevado)
│ │   dashboard con el plan del     │ │ ← [◉] = ícono Camera/Image SVG 20px (Lucide),
│ │   día ya generado               │ │    no emoji 📸 (sistema de íconos) · texto
│ │                                 │ │    interno 14-15px/500 centrado, máx 2 líneas:
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │    SIEMPRE con sugerencia CONCRETA de qué imagen
└─────────────────────────────────────┘    poner
- RATIO fijo que reserva el espacio real: 4:3 si el visual será horizontal (dashboard,
  antes-después), 9:16 si será vertical (screenshot de teléfono). aspect-ratio en CSS →
  CLS 0 cuando llegue la imagen real.
- El texto interno nombra la imagen sugerida: "Sugerencia: [captura del dashboard de
  la app / foto del resultado / antes-después del usuario]" — nunca "imagen aquí".
- Es un placeholder VISIBLE y honesto (jerarquía de mockups de 19), no un frame que
  finge ser producto terminado. Se anota como pendiente en ESTADO.md.
```

---

## 2. PROBLEMA — las preguntas que hacen asentir (visual mínimo, dolor máximo)

```
- 3-5 PREGUNTAS (copy de 19 §2) como bloques apilados, NO párrafo corrido:
  cada pregunta 17-18px/500 · lh 1.4 · máx 2 líneas · gap 16-20px entre preguntas.
- Marcador por pregunta (SISTEMA DE ÍCONOS de arriba — obligatorio): UN ícono de dolor SVG
  20-24px (Lucide/Phosphor — jamás emoji) en contenedor de 40-44px, neutro/ámbar apagado,
  a la izquierda (NUNCA checkmarks verdes — los checks son de la solución, no del problema).
- Título de sección opcional arriba ("¿Te suena?") 28-36px/700 — o entrar directo a la
  primera pregunta si el kicker ya orienta.
- Fondo ELEVADO (esta sección abre el bloque problema+agitación — ver T1).
- Stagger de entrada 60-80ms entre preguntas (reveal on scroll, T4).
```

---

## 3. AGITACIÓN — el costo de seguir igual, visible

```
- 2-4 frases cortas (copy de 19 §3): 16-17px/400 · lh 1.6 · máx 2 líneas cada una ·
  max-width de lectura (T1). El NÚMERO del costo cuantificado (horas/mes, $/mes) en
  weight 700 o acento — es el dato héroe de la sección.
- Opcional: 1 mini-card de contraste "hoy vs en 6 meses" (2 columnas 50/50 en mobile
  apiladas) — neutro para hoy, más apagado/frío para "si nada cambia".
- MISMO fondo elevado que la sección 2 (problema y agitación son UN movimiento visual,
  sin separador entre ellas).
- Cero rojo alarmista ni íconos de sirena: el peso viene del número y del copy, no de
  decoración de miedo (ética de 19 §3).
```

---

## 4. SOLUCIÓN — el mecanismo bautizado con su escenario

```
- Vuelve al fondo BASE (el alivio después de la agitación también es visual).
- Kicker en acento ("EL MECANISMO") + título con el NOMBRE PROPIO del mecanismo
  28-36px/700 ("Conoce el Escáner de Plato").
- Big Idea en 1-2 líneas (17-18px) + los 3 PASOS del mecanismo (19 §4):
  · Mobile: 3 filas apiladas, cada una: NUMBER CHIP 01/02/03 (repertorio #1: contenedor
    40-48px del kit, dígito 16-18px/700 tabular-nums, fondo acento 8-12%) o ícono en
    contenedor (<IconChip>, 49) + título del paso 16px/600 + 1 línea 14-15px gris ·
    gap 20-24px · conector vertical sutil opcional (línea 1-2px entre pasos).
  · Desktop: 3 columnas iguales.
- El chip/nombre del mecanismo bautizado puede llevar hairline degradada (uno de los
  1-3 usos permitidos por vista — sistema de íconos y detalles de arriba).
- Antes/después: split 2 columnas (mobile apilado) con label 12-13px caps encima de
  cada lado; el "después" con acento sutil de fondo (4-6%).
- Micro-animación: los 3 pasos entran escalonados; el ícono de cada paso puede tener
  una micro-animación al entrar en viewport (Lottie/Motion, 22).
```

---

## 5. LA APP POR DENTRO — carrusel manual de screenshots

### 5.1 Blueprint a 375px

```
┌─────────────────────────────────────┐
│  ASÍ SE VE POR DENTRO               │ ← kicker caps 12-13px acento + título 28-36px
│  Tu semana, ya planificada          │
│                                     │
│ ░░┌───────┐ ┌───────┐ ┌───────┐░░  │ ← pista del carrusel: overflow horizontal con
│ ░░│ ▯▯▯▯▯ │ │ ▯▯▯▯▯ │ │ ▯▯▯▯▯ │░░  │    mask-image de FADE en ambos bordes (░) —
│ ░░│ ▯▯▯▯▯ │ │ ▯▯▯▯▯ │ │ ▯▯▯▯▯ │░░  │    el corte nunca es seco
│ ░░│ ▯▯▯▯▯ │ │ ▯▯▯▯▯ │ │ ▯▯▯▯▯ │░░  │ ← cada frame: teléfono 9:19.5, ancho
│ ░░│ ▯▯▯▯▯ │ │ ▯▯▯▯▯ │ │ ▯▯▯▯▯ │░░  │    240-280px mobile · radius 24-32px ·
│ ░░└───────┘ └───────┘ └───────┘░░  │    borde 4-6px casi-negro con tinte + sombra
│      Plan del día · label 13px      │ ← label bajo cada frame: nombre-RESULTADO de
│                                     │    la pantalla (19 §5), 13px/500 gris
│           ● ○ ○ ○                   │ ← dots de posición 6-8px, gap 8px, activo en
└─────────────────────────────────────┘    acento — sincronizados con el scroll
```

### 5.2 Especificación de comportamiento

```
CONTENIDO: 3-5 screenshots REALES de la app a 375px (ratio 9:19.5) dentro de un frame de
  teléfono. Los toma LA IA al cerrar la app (mecanismo de preview/Playwright, a 375px) —
  paso OBLIGATORIO del cierre de la landing (19 §5). Lazy-loading (below the fold),
  width/height definidos.

COMPORTAMIENTO (default único): el carrusel es ESTÁTICO con scroll-snap MANUAL
  (overflow-x + scroll-snap-type: x mandatory + snap-center) + PEEK del siguiente frame
  (15-20% visible en el borde — invita a deslizar) + dots. El AUTO-AVANCE queda prohibido
  como vehículo de mensaje: la evidencia es la más sólida del CRO — ~1% de los visitantes
  interactúa con carruseles, el 84-89% de esos clics va al slide 1 y el slide 4 lo ve el
  0.03% del tráfico (Erik Runyon/Notre Dame 2013, corroborado por NN/g y The Good hasta
  2026); el movimiento automático se procesa como publicidad (banner blindness).
  Excepción única: auto-scroll DECORATIVO (marquee de logos/ambiente) donde NINGÚN slide
  carga información única. REGLA DURA: ningún mensaje de venta vive SOLO dentro de un
  slide ≥2.

BORDES: `mask-image: linear-gradient(to right, transparent, black 8%, black 92%,
  transparent)` — el contenido se desvanece en los bordes, nunca corte seco.

DOTS: 6-8px · gap 8px · activo en acento, resto neutro 30% · reflejan el frame más
  visible (Intersection Observer) y son TOCABLES (llevan a su frame). OBLIGATORIOS
  SIEMPRE — 19 §5 los exige: el usuario necesita saber dónde está y cuántos frames hay.

ESTADO PLACEHOLDER (app aún no construida — 19 §5): mismos frames de teléfono pero en
  gris neutro elevado, con el NOMBRE de la pantalla futura centrado (14-15px/500:
  "Onboarding", "Plan del día", "Reporte semanal") + borde dashed 2px. Mismo scroll-snap
  manual + dots que el estado real. Pendiente anotado en ESTADO.md hasta montar los reales.

TESTIMONIOS (solo con ≥3 REALES — si no, se omiten; regla dura de 19): cards bajo el
  carrusel, dentro de esta misma sección:
  ┌─────────────────────────────────┐
  │ ★★★★★                           │ ← estrellas 16px arriba
  │ "Pasé de 2 horas a 15 minutos   │ ← quote 16-17px / lh 1.5 · máx 3-4 líneas ·
  │  por propuesta."                │    el RESULTADO/número en weight 600 o acento
  │ (○) Carolina M.                 │ ← foto REAL 40-44px circular + nombre 14px/600
  │     Diseñadora freelance, CDMX  │    + contexto 13px gris (rol/ciudad = credibilidad)
  └─────────────────────────────────┘
  Card: radius 16px · padding 20-24px · fondo elevado · 3-6 máximo · mobile apiladas o
  carrusel scroll-snap (1 card + peek 10%); desktop grid 2-3 col · alturas naturales
  (6 cards idénticas se leen como fabricadas) · el resultado MÁS específico primero ·
  sin foto real → iniciales sobre acento al 15% — JAMÁS foto de stock (19).

CTA MID-PAGE al final de esta sección (reglas de CTA de 19): mismas medidas y mismo
  verbo del CTA héroe.
```

---

## 6. OFERTA — anual + mensual, con el esquema de trial que definió 02C

La mecánica de anclaje (y el señuelo si hay 3er plan) está en `02C`; la estructura de la oferta en `19` §6. Aquí, su anatomía visual. El trial NO se hornea: N y su existencia salen de 02C/ESTADO.md.

### 6.1 Blueprint (mobile apilado / desktop 2-3 columnas)

```
   [ stack de valor Hormozi — si aplica, ARRIBA de los planes: lista apilada con el
     valor $ por línea alineado a la derecha en tabular-nums, total TACHADO (strike)
     y el precio real debajo en display — el tachado es del TOTAL del stack, jamás
     un precio mensual falso inflado (anti-patrón de 50 C5) ]

              ┌──────────────┐
        ┌─────┤ MÁS POPULAR  ├─────┐   ┌───────────────────┐
        │     └──────────────┘     │   │      Mensual      │
        │        ANUAL             │   │                   │
        │  ⭐ [N] días gratis      │   │ ⭐ [N] días gratis│ ← badge TRIAL en AMBOS
        │                          │   │                   │    planes: caps 12px/700,
        │      $10.83/mes          │   │    $12.99/mes     │    acento suave, SIEMPRE
        │   Se cobra $129.90/año   │   │                   │    visible (no letra chica) ·
        │   💰 2 meses gratis      │   │                   │    N lo define 02C — si el
        │                          │   │                   │    esquema es SIN trial, sin badge
        │ [Empezar mis N días]     │   │ [Elegir mensual]  │ ← CTA recomendado: acento
        └──────────────────────────┘   └───────────────────┘    PLENO; el otro outline
MOBILE (<768px): apilados en 1 columna, el ANUAL (recomendado) PRIMERO, el mensual
debajo con menos altura visual. Nunca scroll horizontal (regla dura de UX).
Si 02C definió un 3er plan SEÑUELO: 3 columnas desktop con la recomendada al CENTRO,
elevada (translateY(-8px)), señuelo dimensionado según 02C — el anual sigue recomendado.
```

### 6.2 Especificación numérica

```
CARDS: radius 16-20px · padding 24-32px · gap 16-24px. La RECOMENDADA (anual): borde
  acento 2px — o HAIRLINE DEGRADADA de 2px (<GradientBorderCard> de 49, receta del sistema
  de arriba: es EL lugar canónico de esa técnica) — + fondo acento 4-6% + sombra un nivel
  mayor (con tinte del acento, repertorio #5) + badge "MÁS POPULAR" montado -10px sobre
  el borde (specs de 50 C2).
BADGE DE TRIAL: "[N] días gratis" en AMBOS planes — N y su EXISTENCIA los define
  02C/ESTADO.md (plazo por tiempo-a-valor — 02C) · caps 11-12px/700 · padding 4×10px · radius 6-8px ·
  fondo acento al 12-15% con texto en acento · dentro de la card, arriba del precio.
  Si hay trial, es LA puerta de entrada — nunca se esconde ni se omite en un plan.
  Si 02C definió un esquema SIN trial (p. ej. hard paywall puro), NO se pinta badge:
  prohibido inventar un trial que no existe (19 §6).
PRECIO: display 32-40px / 700 / tabular-nums + "/mes" en 14px gris al lado. El anual
  SIEMPRE como $/mes con el total anual en label 12px debajo ("Se cobra $X/año") —
  regla de oro de 02C, misma que el paywall (50 C2).
AHORRO: es el elemento más ruidoso después del CTA (RevenueCat, ver 50 C2): badge o texto
  acento 14-15px/600 — nunca gris chico. "2 meses gratis" > "%". Descomposición por día
  ("menos de $1 al día") en 13px bajo el precio.
FILAS DE FEATURES: 4-6 por card máximo, en lenguaje de RESULTADO ("100 guiones al mes",
  no "API access") · CHECKMARK CUSTOM (repertorio #9: círculo 20-24px fondo acento 12% +
  check SVG 12-14px — jamás el ✓ del sistema ni emoji) · 15px/400 · si hay señuelo, la
  dimensión comparable (guiones/análisis/escaneos) SIEMPRE la primera fila de todas las cards.
TOGGLE mensual↔anual (si se usa toggle en vez de 2 cards): segmentado 40-44px · el cambio
  anima los precios con conteo 300ms tabular-nums (nunca corte seco — 50 C3) · anual
  pre-seleccionado · el ahorro SIEMPRE visible junto al toggle.
DESTINO DEL CTA: segun el modelo (19 -> Hotmart): Modelo 1 -> checkout; Modelo 2 -> los
  planes SE MUESTRAN pero el CTA lleva a `/onboarding` anonimo por defecto. Solo lleva a
  registro si la persistencia previa al pago fue una decision explicita del Modelo 2B.
```

---

## 7. GARANTÍA — el bloque que quita el miedo

```
- Franja propia (fondo elevado) inmediatamente bajo la oferta — NO una línea perdida:
  ┌─────────────────────────────────────┐
  │          ( ◈ sello escudo )         │ ← SELLO: ícono escudo SVG 32-40px acento
  │   La Garantía de la Primera Fuga    │    (ShieldCheck de Lucide / SealCheck de
  │   Si en 7 días el Radar no te       │    Phosphor duotone) en contenedor 56-64px
  │   muestra una fuga real, te         │    del sistema de íconos — JAMÁS emoji 🛡
  │   devolvemos todo. Un correo,       │ ← nombre PROPIO 20-24px/700 (19 §7) ·
  │   sin preguntas.                    │    condición 15-16px/400 · máx 3 líneas ·
  │   Respaldada por la garantía        │    lh 1.6 · max-width de lectura
  │   Hotmart de 7 días                 │ ← piso Hotmart 13px gris + candado SVG 14px
  └─────────────────────────────────────┘    (Lock de Lucide, no 🔒)
- La card puede llevar hairline degradada 1px (uno de los 1-3 usos permitidos por vista).
- Padding vertical 48-64px (más compacta que una sección completa) · centrada.
- Nunca placeholders ("garantía visible"): se nombra la política concreta o no se muestra.
- El plazo mostrado = el configurado en Hotmart (límite operativo de 19 §7).
- SEGURIDAD PERCIBIDA (aplica a §6 y §7): la confianza del pago la producen: el bloque de
  pago visualmente SÓLIDO + la marca conocida (Hotmart) + la garantía verificable con nombre
  y plazo. Apilar sellos genéricos NO suma: el 48.7% de los usuarios no distingue entre
  sellos (Baymard 2022-24) — juzgan por la solidez del diseño.
```

---

## 8. FAQ ACORDEÓN — objeciones, no soporte

```
- 4-6 preguntas (las OBJECIONES de FICHA-AVATAR.md vía 19 §8, no "¿cómo cambio mi contraseña?").
- Ítem: alto ≥56px cerrado · pregunta 16px/600 · chevron SVG 20px (ChevronDown de Lucide —
  jamás ▼ ni emoji) a la derecha que ROTA 180° (200ms ease-out) al abrir · separador 1px
  neutro entre ítems (o cards separadas 8px) · opcional: ícono por pregunta en contenedor
  36-40px (sistema de íconos — mismo peso que el resto de la página).
- Respuesta: 15-16px/400 gris · máx 2 oraciones (~18-22 palabras — la excepción de FAQ
  del presupuesto de copy de 52) · expand animado por altura 250-300ms ease-out.
- UNO abierto a la vez (accordion, no collapse múltiple) · el primero puede venir abierto
  con la objeción #1 (normalmente la de precio/garantía).
- Área táctil de la pregunta: la FILA COMPLETA (no solo el chevron) · aria-expanded real.
- La última respuesta puede cerrar con un mini-CTA de texto ("Pruébalo con la garantía →").
```

---

## 9. CTA FINAL EMOCIONAL + PS — la última parada antes del footer

```
┌─────────────────────────────────────┐
│  (bloque de MÁXIMO contraste de     │ ← fondo INVERTIDO (inversión de modo) o acento
│   toda la página — el único que     │    profundo del kit · padding vertical 80-96px ·
│   puede ser dramático)              │    SIN nav, sin distracciones: solo cierre
│                                     │
│  Imagina tu próxima comida          │ ← headline EMOCIONAL 28-32px / 700 / lh 1.15
│  ya registrada                      │    (desktop 40-48px) · máx 8 palabras
│                                     │
│  Mañana desayunas, sacas la foto,   │ ← 1 línea de FUTURE PACING 16-17px / lh 1.5 ·
│  y listo — sin planillas            │    presente, 2ª persona (19 §9) · máx 2 líneas
│                                     │
│ ┌─────────────────────────────────┐ │
│ │    Probar mi primer escaneo     │ │ ← CTA ≥56px de alto · MISMO texto y verbo del
│ └─────────────────────────────────┘ │    CTA héroe (42) · acento pleno sobre el fondo
│  Garantía de la Primera Fuga ·      │    invertido = máximo contraste de la página
│  quedan 13 cupos de fundador        │ ← recap riesgo/urgencia 13-14px bajo el CTA
│                                     │    (cupo SOLO si es real — 19 fundadores)
│  PS: [App] convierte [antes] en     │ ← PS 15-16px / lh 1.6 / máx 4 líneas, estilo
│  [después] con [mecanismo]. Hoy…    │    carta (itálica o borde izquierdo 2px acento)
└─────────────────────────────────────┘    — el PS de la oferta Hormozi (19 §9)
- Es la ÚLTIMA parada antes del footer legal: nada se interpone entre el PS y el footer.
- Test: entrecerrar los ojos sobre la página completa → este bloque debe ser el punto
  de mayor contraste después del hero.
```

---

## 10. FOOTER LEGAL — confianza sin competirle al CTA

```
┌─────────────────────────────────────┐
│  ◆ NombreApp                        │ ← fila 1: logo chico 20px + enlaces legales
│  Privacidad · Términos y            │    13-14px, color terciario PERO contraste
│  Condiciones · Reembolsos ·         │    ≥4.5:1 (accesible, no invisible) · cada
│  Aviso de IA                        │    enlace con área táctil ≥44px (padding
│                                     │    vertical generoso, no líneas pegadas)
│  © 2026 NombreApp ·                 │ ← fila 2: copyright + soporte (email REAL
│  soporte@app.com                    │    que alguien lee) 13px
└─────────────────────────────────────┘
- 2 filas máximo: enlaces legales arriba, copyright/soporte abajo. Sin columnas de
  sitemap ni listas de 20 links (no es un SaaS enterprise — parecería spam de enlaces).
- Fondo base, padding vertical 32-48px · separado del bloque 9 (el footer NUNCA compite
  con el CTA final — jerarquía terciaria total: cero acento, cero botones).
- TODOS los enlaces apuntan a páginas EXISTENTES (contenido con 47) — la landing no está
  lista con enlaces muertos (regla dura de 19 §10). Disclaimer de IA si la app genera
  contenido/consejos con IA.
```

---

## TRANSVERSAL 1 — RITMO VERTICAL: el espaciado que hace que la página "respire"

```
ENTRE SECCIONES: 64-96px de padding vertical por sección en mobile (96-140px desktop).
  Menos de 64px = página apretada que se siente barata (19 → whitespace). Escala de 14:
  usar 64 / 80 / 96 — nada intermedio. (Excepciones fijadas arriba: garantía 48-64px,
  footer 32-48px.)

ALTERNANCIA DE FONDO (sobre el orden canónico): las secciones alternan fondo BASE ↔
  fondo ELEVADO (niveles de profundidad del brand kit, 16) — nunca toda la página del
  mismo color plano. Patrón canónico:
  1 hero(base) → 2-3 problema+agitación(elevado, UN solo movimiento visual) →
  4 solución(base) → 5 carrusel(elevado) → 6 oferta(base — es la protagonista) →
  7 garantía(elevado, franja compacta) → 8 FAQ(base) →
  9 CTA final(MÁXIMO contraste — invertido/acento profundo) → 10 footer(base, terciario).
  El cambio de fondo ES el separador — no usar <hr> ni líneas divisorias además.

TÍTULOS DE SECCIÓN: 28-36px mobile / 40-48px desktop · 700 · máx 8 palabras · centrados
  o alineados a la izquierda pero IGUAL en toda la página (no mezclar). Kicker opcional
  arriba: caps 12-13px/600 tracking +0.08em en acento ("EL MECANISMO", "LA OFERTA").

ANCHO DE LECTURA: párrafos a máx 65-75 caracteres por línea en desktop (max-width
  ~600-680px) aunque el contenedor sea de 1200 — texto a ancho completo no se lee.
```

---

## TRANSVERSAL 2 — STICKY CTA MOBILE: siempre a un tap del dinero

```
- Barra fija inferior SOLO mobile (<768px): alto 64-72px total = CTA 48-52px + padding
  8-12px · fondo de superficie con borde superior 1px o sombra hacia arriba ·
  padding-bottom: max(12px, env(safe-area-inset-bottom)) — respeta el notch.
- APARECE cuando el hero sale del viewport (Intersection Observer sobre el CTA héroe):
  slide-up 250ms ease-out. Mientras el CTA héroe es visible, NO hay sticky (dos CTAs
  idénticos en pantalla = ruido).
- SE OCULTA cuando la oferta (6) o el CTA final (9) están en viewport (ya hay un CTA
  mayor visible) y reaparece al pasarlos.
- Contenido en dos estados: antes de ver la oferta, `Ver prueba y precios` hace scroll al precio;
  despues de que precio, renovacion y CTA entraron al viewport, cambia al CTA comercial y puede
  abrir Hotmart. No saltar una oferta que la persona todavia no vio.
- Nunca tapa contenido interactivo: el body lleva padding-bottom igual al alto de la barra.
```

---

## TRANSVERSAL 3 — SEÑALES DIRECCIONALES: el ojo termina en el CTA

```
- MIRADA: si hay foto de persona (fundador, testimonio destacado), su mirada/orientación
  apunta HACIA el CTA o el titular, nunca hacia el borde de la página (el ojo del lector
  sigue la mirada de la foto — eye-tracking clásico de CRO).
- FLECHAS/TRAZOS: un trazo dibujado sutil (SVG de 1.5-2px, estilo hand-drawn si el brand
  kit lo permite) puede conectar subtitular → CTA o stack → precio. MÁXIMO 1-2 en toda
  la página — regados se vuelven decoración.
- CONTRASTE DIRECCIONAL: el CTA es SIEMPRE el elemento de mayor contraste de su viewport
  (14/19). Test por sección: entrecerrar los ojos → lo primero que se ve debe ser el CTA
  o el dato que lleva a él.
- WHITESPACE COMO FLECHA: el espacio alrededor del CTA (mín 24-32px libres en todas las
  direcciones) es la señal más barata — un CTA pegado a otros elementos pierde el foco.
```

---

## TRANSVERSAL 4 — ANIMACIONES DE LANDING: reveal con propósito, carga intacta

```
- REVEAL ON SCROLL: cada sección entra con fade + translateY(16-24px), 400-500ms ease-out,
  al entrar en viewport (threshold ~0.2) — UNA sola vez (nunca re-animar al re-scrollear:
  mareante y barato). Bloques internos (preguntas del problema, pasos del mecanismo,
  cards de testimonios) con stagger 60-80ms.
- CONTEO DE NÚMEROS: todo número héroe (usuarios, minutos ahorrados, $ del stack) cuenta
  de 0 al valor en 600-800ms tabular-nums al entrar en viewport — una vez.
- CARRUSEL (sección 5): ESTÁTICO con scroll-snap manual + peek + dots — el AUTO-AVANCE está
  prohibido como vehículo de mensaje (spec y evidencia en 5.2); solo se permite el marquee
  decorativo sin información única.
- HERO: carga INMEDIATA — como mucho un fade simple de 300ms; nada de secuencias pesadas
  que compitan con el LCP (specs de rendimiento de 19: LCP <2.5s manda sobre cualquier
  animación).
- PROHIBIDO: parallax pesado (scroll-jacking, mata INP y marea en mobile) · animaciones
  en loop infinito fuera del marquee decorativo (logos/ambiente sin información única) y
  micro-detalles · orbes de gradiente flotando (receta del look IA, 16) · animar
  blur/box-shadow en scroll (jank garantizado — solo transform/opacity).
- prefers-reduced-motion: todo reveal → fade simple sin translate; conteos → valor final
  directo; carrusel → ya es estático por defecto (5.2); el marquee decorativo, si existe,
  se detiene.
- Implementación: Intersection Observer o `whileInView` de Motion (22) con `once: true`.
```

---

## MINI-CHECKLIST DE DISEÑO DE LANDING (recorrer al cerrar, además del checklist de 19 — en el orden canónico)

```
[ ] 1. HERO: en 390x844 y 1440x900 se ven marca + titular + subtitulo + CTA + pista del producto;
       escala del titular ajustada al copy real, CTA >=52px, prueba social solo si es real; visual
       asoma en el primer viewport (~80-120px) y es LCP optimizado — o PLACEHOLDER dashed con ratio
       fijo y sugerencia escrita (1.3)
[ ] 2. PROBLEMA: 3-5 preguntas apiladas, cada una con su ícono de dolor SVG en contenedor
       (no checks verdes, no emojis), stagger de entrada
[ ] 3. AGITACIÓN: número del costo en 700/acento como dato héroe · mismo bloque elevado que 2 ·
       cero decoración de miedo
[ ] 4. SOLUCIÓN: nombre propio del mecanismo en el título · 3 pasos con number chip/IconChip ·
       antes/después
[ ] 5. CARRUSEL: 3-5 frames 9:19.5 · scroll-snap MANUAL + peek del siguiente frame (15-20%) ·
       CERO auto-avance (prohibido como vehículo de mensaje — 5.2; marquee decorativo es la única
       excepción) · mask-image de fade en bordes · dots SIEMPRE (19 §5) · PLACEHOLDERS grises
       con label si la app no existe (pendiente en ESTADO.md) · screenshots REALES tomados por
       la IA al cerrar la app · testimonios en cards SOLO si hay ≥3 reales · CTA mid-page al final
[ ] 6. OFERTA: anual + mensual AMBOS con badge "[N] días gratis" visible (N según 02C/ESTADO.md;
       si 02C definió un esquema SIN trial, sin badge — jamás inventar un trial) · anual
       recomendado, elevado, como $/mes con total en label 12px · ahorro "2 meses gratis"
       ruidoso · stack de valor con total tachado (jamás precio falso inflado) · señuelo solo
       si 02C lo definió
[ ] 7. GARANTÍA: franja propia con nombre PROPIO 20-24px + condición + piso Hotmart — plazo = lo
       configurado en Hotmart
[ ] 8. FAQ: fila táctil completa ≥56px, chevron rotando, respuestas ≤2 oraciones, uno abierto
[ ] 9. CTA FINAL: bloque de MÁXIMO contraste (invertido/acento profundo), sin nav · headline
       emocional 28-32px · 1 línea de future pacing · CTA ≥56px mismo verbo · PS ≤4 líneas debajo
[ ] 10. FOOTER: 2 filas (legales + copyright/soporte) · contraste ≥4.5:1 · táctil ≥44px · TODAS
       las páginas enlazadas existen · sin parecer spam de enlaces ni competir con el CTA final
[ ] T. Ritmo: 64-96px por sección + alternancia base↔elevado del patrón canónico · sticky CTA
       mobile (aparece al salir el hero, safe-area, se oculta frente a oferta/CTA final) ·
       reveal una sola vez + conteo de números + cero parallax + reduced-motion completo ·
       ojo entrecerrado por sección: lo primero que se ve es el CTA
[ ] S. SISTEMA DE ÍCONOS Y DETALLES: cero secciones solo-texto (cada una con su elemento
       visual definido) · todos los íconos SVG de librería CON contenedor 40-48px — cero
       emojis como elemento visual (salvo pedido explícito del usuario) · peso consistente
       por página · checkmarks CUSTOM en §6 · hairline degradada SOLO en 1-3 elementos clave
       (plan recomendado/garantía/mecanismo) · number chips solo como pasos del mecanismo ·
       cero colores fuera del brand kit
[ ] G. GATE DE DETALLES PREMIUM (los 6, binarios — sin los 6, la pantalla de conversión NO se
       declara lista):
       [ ] titular con énfasis (bold completo 700-800 + 1-3 palabras clave en acento —
           JERARQUÍA DE ÉNFASIS de arriba)
       [ ] ≥1 hairline degradé de 1-2px en el elemento clave (máx 3 por vista)
       [ ] toda lista de beneficios con icon chips premium (SVG Lucide/Phosphor, contenedor
           40-48px, fondo acento 8-12%, radius del kit) — CERO emojis
       [ ] checkmarks custom (círculo acento 12% + check SVG), nunca el ✓ del sistema
       [ ] fondo con profundidad (mesh/radial sutil detrás del héroe, no plano)
       [ ] radios consistentes del kit en toda la vista
```

Regla de cierre: la landing es una PANTALLA — pasa por el gate de render de la Regla de Oro 7 (screenshot real a 375px + rúbrica /40) y por la RÚBRICA DE COPY /20 de `52`, ambas del revisor independiente, antes de declararse lista. Y si el carrusel quedó en placeholders, la landing queda con pendiente abierto en ESTADO.md hasta montar los screenshots reales.
