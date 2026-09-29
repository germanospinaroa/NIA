# KIT CANÓNICO DE LANDING — plantillas-codigo/landing/

**La landing NO se maqueta desde cero: se construye DESDE este kit.** Las 10 secciones de la
estructura canónica de `19-PAGINA-DE-VENTAS.md` ya están ejecutadas aquí con los blueprints de
`55-DISENO-DE-LANDING.md` embebidos en el código (medidas, motion, sticky CTA, accesibilidad,
presupuesto de copy con warns en dev). Quien construye la landing tematiza tokens, llena props
y compone — no reinterpreta la pantalla.

## La doctrina (no negociable)

1. **Se copia el kit al proyecto:** `plantillas-codigo/landing/` → `components/landing/` del
   proyecto (el scaffold lo hace — ver nota en `51-STACK-PINEADO.md`). `tokens.css` se importa
   en `app/globals.css` después de `@import "tailwindcss"`.
2. **Se tematiza SOLO `tokens.css`** con la FICHA-ARTE.md del proyecto (los valores marcados
   "← reemplazar"). Ningún `.tsx` del kit lleva hex, fuentes ni radios propios: todo sale de
   los tokens.
3. **Las props se llenan con el copy MARCADO de `docs/copy/landing.md`** (`[acento]…[/acento]`
   y `[b]…[/b]`, regla "QUÉ PALABRA SE RESALTA" de `52`). El copy se traza a FICHA-AVATAR.md;
   el kit solo lo ejecuta.
4. **Desviarse de la estructura exige justificación en ESTADO.md.** Construir a mano una
   sección que el kit ya trae, reordenar las 10, o quitar una, es una DESVIACIÓN: se escribe en
   ESTADO.md qué faltaba en el kit y por qué no se resolvió con props/slots — y se propone al
   usuario antes (regla de estructura inmutable de `19`).

## Orden operativo (el de "EL KIT PRIMERO" en 55)

```
1. FICHA-ARTE.md aprobada (16 PASO 0)        → sin ficha no hay tokens
2. Tematizar tokens.css                      → la ÚNICA edición de estilo permitida
3. docs/copy/landing.md marcado (52 + 57)    → sin ficha de avatar no hay copy
4. Componer la página (EJEMPLO-page.tsx      → mismo orden canónico, props llenas
   muestra cómo)
5. audit-conversion + gates de cierre        → render 375px + rúbricas /40 y copy /20
```

## Cómo se consume el copy marcado

`docs/copy/landing.md` entrega cada pieza con marcadores; los componentes las reciben en props
`*Marked` y `MarkedCopy.tsx` las convierte en nodos:

```
[acento]palabra que vende[/acento]  →  <Accent> (color var(--accent))
[b]palabra importante[/b]           →  <strong class="font-semibold">
```

- El H1 ya es bold completo (700-800) por defecto — el `[acento]` marca las 1-3 palabras clave
  (JERARQUÍA DE ÉNFASIS de `55`). No se agrega bold al titular vía `[b]`.
- El presupuesto de copy de `52` está cableado: cada sección cuenta palabras y hace
  `console.warn` en dev si una pieza excede su tope (el subtítulo del hero además se trunca a
  14 palabras). **La corrección es recortar el copy, nunca tocar el límite del componente.**

| Pieza | Tope (warn) |
|---|---|
| Hero → H1 | 10 palabras |
| Hero → subtítulo | 14 (trunca) |
| Problema → cada pregunta | 12 · (3-5 preguntas) |
| Agitación → cada frase | 18 · (2-4 frases, tipo `string[]`: un párrafo no compila como frase única) |
| Solución → detalle de paso | 14 · (exactamente 3 pasos: tupla) |
| Oferta → cada feature | 12 · (4-6 features) |
| Garantía → condición | 30 (~3 líneas) |
| FAQ → cada respuesta | 40 · (4-6 ítems) |
| CTA final → H2 / future pacing / PS | 8 / 24 / 55 |

## Qué NO se toca (la estructura premium embebida)

- El **orden y la alternancia de fondos** (hero base → problema+agitación elevado →
  solución base → carrusel elevado → oferta base → garantía elevada compacta → FAQ base →
  CTA final invertido → footer base) — es el patrón canónico de `55` T1.
- Los **detalles premium**: IconChip 44px, hairline degradada (solo mecanismo / plan
  recomendado / garantía), checkmarks custom, mesh del hero, sombra tintada del CTA, number
  chips de los 3 pasos.
- El **motion**: reveal whileInView una sola vez + stagger, whileTap 0.97,
  `useReducedMotion` respetado en todo (incluye el acordeón y el sticky).
- La **accesibilidad**: HTML semántico, `aria-expanded`/`aria-controls` del FAQ, dots del
  carrusel tocables con `aria-label`, focus-visible, áreas táctiles ≥44px.
- La **mecánica de la oferta**: anual primero en el DOM, total anual visible, trial solo si
  02C lo definió, ahorro en meses.
- El **sticky CTA** (T2): aparece al salir el hero, se oculta frente a oferta y CTA final,
  dos estados (ver precios → CTA comercial), safe-area.

## Qué SÍ decide cada proyecto

- `tokens.css` completo (con la FICHA-ARTE).
- Todo el copy (props `*Marked` desde `docs/copy/landing.md`).
- Íconos de dolor del Problema (Lucide, del dominio del avatar).
- Visual del hero y screenshots del carrusel (reales al cerrar la app; mientras tanto los
  placeholders honestos que el kit ya trae).
- Destino de los CTAs según el MODELO de `02C` (checkout Hotmart vs `/onboarding`) — el mismo
  `href` en hero, mid-page, oferta, CTA final y sticky.
- Slots: social proof del hero (SOLO datos reales), contraste de Agitación, antes/después de
  Solución, stack Hormozi de la Oferta, recap y PS del CTA final.

## Archivos

```
tokens.css        ← lo ÚNICO que se tematiza (variables + ejemplo lleno comentado)
ui.tsx            ← Accent · Kicker · IconChip · Hairline · CheckCustom · SectionShell ·
                    useReveal · CtaButton · StickyCtaMobile
MarkedCopy.tsx    ← parser [acento]/[b] + presupuesto de copy ejecutable (warnCopy)
Hero.tsx … FooterLegal.tsx   ← las 10 secciones canónicas
EJEMPLO-page.tsx  ← composición completa con datos semilla (app ficticia "Despeja")
```

Requisitos del stack (ya pineados en `51`): React 19 + TypeScript + Tailwind v4 (arbitrary
values sobre las CSS vars — no requiere `@theme` propio), `motion` (import `motion/react`),
`lucide-react`. Los componentes con hooks/motion llevan `'use client'`; `FooterLegal` y
`MarkedCopy` funcionan también como server components.

## Cierre

El kit no exime de los gates: screenshot real a 375px + revisor independiente (/40 usabilidad,
/20 craft, /20 copy), pasada final de auto-auditoría de `52`, enlaces del footer existentes, y
pendientes de placeholders anotados en ESTADO.md. El kit garantiza el piso premium; el gate
verifica que el proyecto no lo rompió al tematizar.
