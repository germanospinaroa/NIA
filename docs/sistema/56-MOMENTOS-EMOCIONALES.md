# MOMENTOS EMOCIONALES — Los Blueprints de las Pantallas que Enamoran

> **Cuándo cargar este archivo:**
> - SIEMPRE que se construya o revise una celebración, hito, racha, level-up, pantalla de racha rota, vuelta tras abandono o share card — cualquier momento donde la app RECONOCE al usuario
> - Junto con `11-DISENO-EMOCIONAL.md` (la voz: COMPILADOR DE PERSONALIDAD + MATRIZ DE VOZ — de ahí salen los valores de spring y el arquetipo), `24-GAMIFICACION.md` (el sistema que dispara estos momentos), `41-CRAFT-DE-ANIMACION.md` (motion narrativo: Slow-Fast-Boom-Stop) y `14-LEYES-DE-DISENO.md` (curvas y duraciones base)
>
> **Por qué existe:** `50` especifica al píxel las pantallas que COBRAN (onboarding/paywall). Este archivo hace lo mismo con las pantallas que RETIENEN. Sin especificación, el agente resuelve "celebrar el hito" con un toast y confetti genérico — y las apps que retienen (Duolingo, Headspace, Strava) tratan estos momentos como pantallas de primera clase, más trabajadas que el propio dashboard. La racha rota es, según Duolingo, una de las pantallas más iteradas de toda su app. Aquí están M0 (el ritual diario — la pantalla que se ve todos los días) y los 7 momentos-evento, con el mismo rigor que el paywall: blueprint 375px + números + timeline + copy por arquetipo.

**Regla de dependencia:** los valores concretos (acento, display, radius) salen del brand kit (`16`); los valores de spring/duración/intensidad salen de la fila compilada de personalidad (`11` → COMPILADOR DE PERSONALIDAD); el copy usa el arquetipo de voz elegido (`11` → MATRIZ DE VOZ). Este archivo fija estructura, rangos y comportamiento. Márgenes laterales: 16px, como todo el funnel.

**Regla de intensidad (heredada de 11/24):** la celebración escala con el hito. Acción frecuente → toast (NO es de este archivo). Hito real → overlay o takeover de este archivo. Si todo celebra, nada celebra. Y NUNCA una celebración bloquea: siempre tap-to-dismiss + auto-dismiss.

**Regla de escala:** los takeovers de celebración son la EXCEPCIÓN de escala permitida frente a DESIGN-CORE (display hasta 72px, vs 28-40px): son pantallas-momento, no pantallas de trabajo.

**Regla de voz:** cada momento trae el copy en los 4 arquetipos (coach enérgico · mentor sereno · cómplice juguetón · experto sobrio). La app usa UNO — el elegido en la Ficha de Dirección de Arte. Prohibido mezclar arquetipos entre pantallas.

---

## M0. EL RITUAL DIARIO — la pantalla más vista de la app

Los momentos M1-M7 son EVENTOS; M0 es la pantalla que se ve 365 veces al año — más que todas
las celebraciones juntas. Duolingo, Flo y Whoop viven de esta pantalla. No celebra nada:
sostiene el loop diario de `24` en una sola vista, todos los días.

### M0.1 Blueprint (las 4 piezas, en este orden)

```
1. EL DATO DE HOY (arriba)      → lo que cambió desde ayer — no un dashboard general.
2. LA ACCIÓN DE 1 TAP           → el check-in/registro del día: la acción de valor del
                                  loop de 24, no un menú.
3. EL ESTADO DE LA RACHA        → visible, no protagonista (si está en riesgo, adopta
                                  el estado M4 de este archivo).
4. EL INSIGHT QUE NO SABÍA      → "con tus N registros, tu patrón es X" — la inversión
                                  activa de 24 hecha visible; si la app no puede decir
                                  algo nuevo hoy, el moat no existe. Y habla EN LA VOZ
                                  DEL MECANISMO bautizado (01): "tu Radar detectó que
                                  el 80% de tus antojos son de noche" — el mecanismo es
                                  el personaje de la app, no una sección del menú; así
                                  el usuario recuerda QUÉ está pagando cada vez que abre.
```

**Anti-patrón:** resolver esta pantalla como "dashboard" con 8 widgets — es UNA misión:
completar el día de hoy. La pantalla se diseña con el mismo rigor que el paywall (revisor
incluido: es una de las 4 del dinero — la "pantalla principal").

> M0 no emite `momento_mostrado` (eso es de los momentos-evento M1-M7): su medición es
> `sesion_iniciada` y la CURR semanal de `36-ANALITICA-Y-EVENTOS.md`.

---

## M1. PRIMERA VICTORIA — el takeover del primer resultado real

El momento más importante de toda la app: el usuario acaba de obtener su primer resultado real (su primer plan, su primer análisis, su primera creación). Aquí se decide si vuelve mañana. NO es un toast — es una pantalla completa (takeover) con 3 actos: el resultado → qué significa → el siguiente paso.

### M1.1 Blueprint a 375px

```
┌─────────────────────────────────────┐  375px
│                                     │
│              ✦ ✦ ✦                  │ ← burst de confetti/partículas UNA vez
│           ╭─────────╮               │    (canvas, colores del brand kit)
│           │  visual │               │ ← ACTO 1: el RESULTADO como héroe:
│           │  del    │               │    card/preview del artefacto real
│           │resultado│               │    120-160px alto, radius de cards,
│           ╰─────────╯               │    sombra elevada (nivel 3 de 16)
│                                     │
│   Tu primer plan está listo         │ ← display 28-32px / 700 / lh 1.1
│                                     │    máx 8 palabras, con el SUSTANTIVO real
│   Hecho con tus 12 respuestas.      │ ← ACTO 2: qué significa: body 16px /
│   Esto es lo que la mayoría         │    lh 1.5 / máx 3 líneas · el dato
│   nunca llega a tener.              │    clave en weight 600 o acento
│                                     │
│   ┌───────┐  ┌───────┐              │ ← fila opcional de 2 datos del resultado
│   │  4    │  │ 12    │              │    (número 24px/700 tabular + label 12px)
│   │semanas│  │pasos  │              │    solo si el resultado los tiene REALES
│   └───────┘  └───────┘              │
│                                     │
│ ┌─────────────────────────────────┐ │ ← ACTO 3: CTA héroe 52-56px acento pleno
│ │        Ver mi plan              │ │    verbo + posesivo (1ª persona)
│ └─────────────────────────────────┘ │
│        Guardar para después         │ ← salida secundaria terciaria 14px, 44px táctil
└─────────────────────────────────────┘
```

### M1.2 Especificación numérica

```
- Takeover fullscreen (min-h-dvh), fondo con profundidad: base + mesh/radial sutil
  detrás del visual (nunca fondo plano — 16). Sin bottom-nav (es un momento, no una vista).
- Visual del resultado: 120-160px de alto · el ARTEFACTO REAL (mini-preview del plan,
  del documento, de la imagen generada) — nunca un ícono genérico ni ilustración stock.
- Headline: display 28-32px/700, letter-spacing -0.02em. Nombra el resultado, no "¡Felicidades!".
- Cuerpo: 16px/400/lh 1.5, máx 3 líneas. Fórmula: [qué acaba de lograr] + [por qué importa].
- Stats: máx 2-3, solo datos REALES del artefacto. Número 24px/700 tabular-nums + label 12px.
- CTA: 52-56px alto, ancho completo, fijo abajo + safe-area. El CTA lleva AL resultado
  (siguiente paso del loop de 24), nunca "Cerrar" ni "OK".
- Confetti: 1 burst único de 1.2-1.8s, particleCount 80-120, colores del brand kit
  (NUNCA los default). Componente <CelebrationOverlay> de abajo.
```

### M1.3 Timeline (ms)

```
   0ms  fondo entra (fade 200ms) — pantalla toma el control
 100ms  visual del resultado: scale 0.9→1 + opacity, spring (bounce del compilador de 11)
 350ms  burst de confetti UNA vez (dispara junto al "aterrizaje" del visual — BOOM de 41)
 450ms  headline: fade + translateY(12→0), 300ms ease-out
 550ms  cuerpo: ídem, stagger 100ms
 650ms  stats: entran con stagger 60ms entre cards; los números CUENTAN de 0 al valor (600ms)
 850ms  CTA: fade + translateY, 300ms · pausa — el momento respira (STOP de 41)
        Nada más se mueve después. prefers-reduced-motion: todo con fade simple, sin confetti.
```

### M1.4 Copy por arquetipo (headline + cuerpo)

| Arquetipo | Copy |
|---|---|
| **Coach enérgico** | "¡Tu primer plan está listo!" / "12 respuestas, 4 semanas, cero excusas. Esto ya está en marcha — y tú también." |
| **Mentor sereno** | "Tu primer plan está listo" / "Lo construiste con tus propias respuestas. Es un buen punto de partida — el resto se hace un día a la vez." |
| **Cómplice juguetón** | "Míralo. Es tu plan. Existe." / "Hace 5 minutos era una idea vaga. Ahora tiene 4 semanas y nombre propio. No está nada mal para un martes." |
| **Experto sobrio** | "Primer plan generado" / "4 semanas, calibrado a tu nivel intermedio. La semana 1 es donde se decide el hábito — empieza por ahí." |

**❌ PROHIBIDO (la versión genérica intercambiable):** "¡Felicidades! 🎉 Has completado tu primera acción. ¡Sigue así!" — no nombra el resultado, serviría para cualquier app, celebra a la app y no al usuario.

> ⚠️ **Regla para TODAS las tablas de copy de este archivo (M1-M7): los ejemplos NO llevan %** —
> si citas un número, va con fuente y año o no existe (regla de 50/52). Un porcentaje inventado
> en el copy de celebración es el mismo pecado que la prueba social fabricada del paywall.

### M1.5 Háptica y accesibilidad

```
- Háptica: medium (navigator.vibrate?.(20)) al aterrizar el visual — una vez.
- aria-live="polite" en el contenedor del headline+cuerpo (el lector anuncia el logro
  cuando termina lo que esté leyendo — nunca "assertive": no es una emergencia).
- Foco: al montar, mover el foco al takeover (role="dialog" aria-modal="true"); al cerrar,
  devolverlo al disparador. Esc y tap fuera NO cierran (hay CTA y salida secundaria visibles).
```

---

## M2. HITO DE RACHA (7 / 30 / 100) — fullscreen con anillo y número

La racha cumplió un hito real (7/30/100/365 — los de `24`). Intensidad CRECIENTE: el 7 es notable, el 30 es grande, el 100 es el evento del año. Fullscreen con el número como protagonista absoluto. Este momento es un PICO en el sentido de la regla peak-end de `02B` — el pico se diseña, no se espera.

### M2.1 Blueprint a 375px

```
┌─────────────────────────────────────┐
│                                     │
│              ╭──────╮               │ ← anillo 140-180px · grosor 10-12px ·
│             ╱        ╲              │    se DIBUJA 0→100% al entrar ·
│            │    30    │             │    fill acento sobre track neutro 12%
│            │   días   │             │ ← número display 56-72px / 700 /
│             ╲        ╱              │    tabular-nums · entra con spring
│              ╰──────╯               │    overshoot + label 14px/500 gris
│               🔥                    │ ← emblema de racha 28-32px bajo el anillo
│                                     │    (llama/símbolo propio del brand kit)
│   Un mes entero, sin soltarlo       │ ← display 24-28px / 700 · máx 8 palabras
│                                     │
│   La mayoría abandona antes del     │ ← body 15-16px / máx 2-3 líneas ·
│   día 30 — tú ya llevas 30.         │    dato REAL o se omite (nunca inventado)
│                                     │
│ ┌─────────────────────────────────┐ │
│ │         Compartir logro         │ │ ← CTA primario 52px (genera share card M7)
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │           Continuar             │ │ ← secundario ghost 48px · gap 12px
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### M2.2 Especificación numérica

```
- Anillo: 140-180px diámetro · stroke 10-12px · radius pill en los extremos (stroke-linecap
  round) · se dibuja con stroke-dashoffset animado (patrón de 17), 900-1200ms ease-out.
- Número: 56-72px/700 tabular-nums. NO cuenta de 0 a 30 (una racha no "cuenta" — YA existe):
  entra con spring overshoot scale 0.5→1 justo cuando el anillo completa.
- Emblema: el símbolo de racha de la app (SVG propio con tokens, no el emoji literal).
- Intensidad por hito (multiplica sobre la base del compilador de 11):
    7 días  → confetti particleCount ~80, 1 burst
    30 días → ~140, 2 bursts (izq/der, 250ms entre sí)
    100+    → ~200, 3 bursts + el anillo dispara un pulso de glow 400ms (única
              excepción permitida al "sin glow" de 16: dura <500ms y es un evento raro)
- CTAs: compartir primero (el pico emocional es EL momento de pedir el share — no después).
```

### M2.3 Timeline (ms)

```
   0ms  fondo fade 200ms
 150ms  anillo se dibuja 0→100%, 900-1200ms ease-out (SLOW-FAST de 41: arranca lento, acelera)
~1200ms anillo completa → número entra con spring (bounce compilado, overshoot visible) — BOOM
~1300ms burst(s) de confetti + háptica heavy · emblema entra scale 0.5→1 spring 300ms
~1500ms headline fade+translateY 300ms · cuerpo stagger 100ms
~1800ms CTAs entran con stagger 80ms — STOP: nada más se mueve
        prefers-reduced-motion: anillo aparece completo, número sin spring, sin confetti.
```

### M2.4 Copy por arquetipo (hito de 30 — adaptar el número)

| Arquetipo | Copy |
|---|---|
| **Coach enérgico** | "¡30 días! Esto ya es disciplina" / "Un mes sin fallar. Tu yo de hace 30 días no se lo creería. A por los 100." |
| **Mentor sereno** | "30 días de constancia" / "Ya no es un intento — es un hábito. Lo que hiciste un mes puedes sostenerlo una vida." |
| **Cómplice juguetón** | "30 días. TREINTA." / "Oficialmente eres de esas personas constantes que todos admiramos con algo de envidia." |
| **Experto sobrio** | "Racha: 30 días" / "La mayoría abandona antes del día 30 — tú ya llevas 30. A esta altura la adherencia deja de depender de la motivación." |

**❌ PROHIBIDO:** "¡Wow! ¡Racha de 30 días! ¡Eres increíble! 🎉🔥💪" — inflación de exclamaciones y emojis en vez de significado; no dice por qué 30 importa.

### M2.5 Háptica y accesibilidad

```
- Háptica: heavy en el momento del número (navigator.vibrate?.([30, 40, 30])) — este es
  el único momento del catálogo que amerita heavy positivo.
- aria-live="polite" con texto completo: "Hito alcanzado: racha de 30 días".
- El anillo es decorativo para el lector: aria-hidden="true"; el dato vive en el texto.
- Tap en cualquier parte fuera de los CTAs = continuar (no atrapar al usuario).
```

---

## M3. LEVEL-UP / LOGRO DESBLOQUEADO — overlay con badge

Menos que un takeover: un overlay centrado sobre scrim. Para level-up y logros desbloqueados (mecánicas 2 y 4 de `24`). El badge es el protagonista; entra con spring overshoot y una luz barrida lo "acuña".

### M3.1 Blueprint a 375px

```
┌─────────────────────────────────────┐
│ ░░░░░░░░░░░ scrim 60% ░░░░░░░░░░░░░ │ ← fondo de la app visible, oscurecido
│ ░░┌─────────────────────────────┐░░ │
│ ░░│                             │░░ │ ← card 320px ancho · radius de cards ·
│ ░░│         ╭───────╮           │░░ │    superficie elevada + sombra nivel 3
│ ░░│         │ badge │           │░░ │ ← badge 96-120px · SVG propio con
│ ░░│         ╰───────╯           │░░ │    tokens · spring overshoot + luz
│ ░░│                             │░░ │    barrida diagonal (1 pasada, 600ms)
│ ░░│     Nivel 5: Constante      │░░ │ ← title 20-22px / 700 · el NOMBRE del
│ ░░│                             │░░ │    nivel/logro (con nombre, no solo №)
│ ░░│   Desbloqueaste las metas   │░░ │ ← body 15px / máx 2 líneas · QUÉ gana
│ ░░│   semanales personalizadas  │░░ │    (si el nivel desbloquea algo real)
│ ░░│                             │░░ │
│ ░░│  ┌───────────────────────┐  │░░ │
│ ░░│  │      Continuar        │  │░░ │ ← CTA 48-52px ancho completo de la card
│ ░░│  └───────────────────────┘  │░░ │
│ ░░└─────────────────────────────┘░░ │ ← tap en scrim = cerrar · auto-dismiss 6s
└─────────────────────────────────────┘
```

### M3.2 Especificación numérica

```
- Scrim: negro del brand (casi-negro con tinte) al 60%, fade-in 200ms. Tap = dismiss.
- Card: 320px máx (16+ px de aire lateral), padding 24px, radius de cards del kit.
- Badge: 96-120px. SVG propio: forma base del sistema de badges (misma silueta en toda
  la app, cambia el interior — colección de 24). Nunca un emoji como badge.
- Luz barrida ("shine"): pseudo-elemento con linear-gradient(105deg, transparent 40%,
  blanco 12% 50%, transparent 60%), translateX(-120% → 120%), 600ms ease-in-out,
  UNA sola pasada, 200ms después del aterrizaje del badge. Es el "acuñado" — no un loop.
- Título: 20-22px/700. El nivel/logro TIENE NOMBRE ("Nivel 5: Constante", "Madrugador") —
  un número pelado no construye identidad (nivel reflexivo de 11).
- Beneficio: solo si el nivel desbloquea algo REAL. Si no desbloquea nada, esa línea se
  omite (no inventar "beneficios" vacíos).
- Auto-dismiss a los 6s si el usuario no interactúa + SIEMPRE tap-to-dismiss.
```

### M3.3 Timeline (ms)

```
   0ms  scrim fade-in 200ms
 100ms  card entra: scale 0.95→1 + opacity, 250ms ease-out
 250ms  badge: scale 0.5→1 con spring overshoot (bounce compilado ×1.2 — este momento
        tolera más rebote) + háptica medium
 550ms  luz barrida: 1 pasada de 600ms sobre el badge
 600ms  título y cuerpo: fade + translateY(8→0), stagger 80ms
 800ms  CTA fade-in 200ms — STOP
        prefers-reduced-motion: card y badge con fade, sin overshoot ni luz barrida.
```

### M3.4 Copy por arquetipo (level-up con desbloqueo)

| Arquetipo | Copy |
|---|---|
| **Coach enérgico** | "¡Nivel 5: Constante!" / "Te lo ganaste entrenando, no mirando. Ya tienes metas semanales personalizadas." |
| **Mentor sereno** | "Nivel 5: Constante" / "Tu constancia abrió algo nuevo: metas semanales a tu medida. Úsalas con calma." |
| **Cómplice juguetón** | "Nivel 5. Ya eres 'Constante' oficial" / "Con papeles y todo. De regalo: metas semanales personalizadas. Tú sigue a lo tuyo." |
| **Experto sobrio** | "Nivel 5 alcanzado: Constante" / "Desbloqueado: metas semanales personalizadas. Disponibles desde tu panel." |

**❌ PROHIBIDO:** "¡LEVEL UP! +500 XP ⭐⭐⭐" — jerga de videojuego pegada encima (el anti-patrón #1 de 24: puntos sin significado), no dice qué ganó el usuario en SU vida.

### M3.5 Háptica y accesibilidad

```
- Háptica: medium (navigator.vibrate?.(20)) con el aterrizaje del badge.
- role="dialog" aria-modal="true" + aria-live="polite" ("Logro desbloqueado: Nivel 5,
  Constante. Nuevas metas semanales disponibles.").
- La luz barrida y el badge: aria-hidden. Esc cierra. Foco al CTA al abrir, de vuelta al cerrar.
```

---

## M4. RACHA EN RIESGO — estado in-app (NO una pantalla)

El usuario abrió la app y hoy aún no hizo su acción: la racha vence a medianoche. Esto NO es un modal ni una notificación — es el ESTADO VISUAL del contador de racha en el home. Preocupación sana: la llama sin encender, en gris — NUNCA rojo punitivo, NUNCA countdown de pánico.

### M4.1 Blueprint a 375px (el módulo en el home)

```
│ ┌─────────────────────────────────┐ │
│ │  ◌   Racha: 12 días             │ │ ← emblema APAGADO: outline gris, sin fill
│ │      Tu registro de hoy la      │ │    (vs. encendido: fill acento) · número
│ │      mantiene viva              │ │    conserva su tamaño (16-17px/600) pero
│ │                                 │ │    en color secundario, no acento
│ │  ┌───────────────────────────┐  │ │
│ │  │   Registrar mi día  →     │  │ │ ← CTA inline 44-48px — la acción central
│ │  └───────────────────────────┘  │ │    del loop, a UN tap (24: mínimo esfuerzo)
│ └─────────────────────────────────┘ │
```

### M4.2 Especificación numérica

```
- Emblema: la MISMA forma de siempre, en estado apagado: stroke 1.5px gris secundario,
  sin fill, sin animación de "llama viva". El contraste encendido/apagado ES el mensaje.
- Colores: TODO en neutros de la escala. PROHIBIDO rojo/ámbar aquí (el rojo es para
  vencido/error — la regla de estados por vencimiento de CLAUDE.md: neutro/ámbar/rojo;
  la racha en riesgo aún NO venció).
- Número: mantiene tamaño y peso (la racha sigue viva) pero pierde el acento.
- Micro-animación permitida: el emblema apagado "respira" (opacity 0.5→0.7, 2s,
  ease-in-out, loop suave) — está dormido, no muerto. prefers-reduced-motion: estático.
- CTA: la acción central del loop, directa (deep-link al registro, no al home de la feature).
- A partir de las 20:00 hora local puede sumarse UNA línea de urgencia suave
  ("se apaga a medianoche") — nunca countdown con segundos corriendo.
- El push de racha en riesgo (canal externo) vive en 24 → RE-ENGANCHE; este es el estado in-app.
```

### M4.3 Copy por arquetipo (línea bajo el contador)

| Arquetipo | Copy |
|---|---|
| **Coach enérgico** | "12 días no se dejan morir hoy. Un registro y sigue." |
| **Mentor sereno** | "Tu racha de 12 días sigue viva. El registro de hoy la mantiene." |
| **Cómplice juguetón** | "La llama está en modo siesta. Un registro y vuelve a prenderse." |
| **Experto sobrio** | "Racha activa: 12 días. Falta el registro de hoy." |

**❌ PROHIBIDO:** "⚠️ ¡CUIDADO! Estás a punto de PERDER tu racha de 12 días. ¡No tires todo tu esfuerzo a la basura!" — pánico + culpa anticipada; convierte la racha en amenaza (anti-patrón de 24: la racha no es una cárcel).

### M4.4 Háptica y accesibilidad

```
- Háptica: NINGUNA (es un estado, no un evento).
- Sin aria-live (no interrumpe): el estado se lee en el flujo normal del home.
- El estado apagado NO puede depender solo del color: el emblema outline vs fill
  + el texto explícito son la señal (contraste ≥4.5:1 también en gris).
```

---

## M5. RACHA ROTA — la pantalla de reparación

La racha se rompió (el gap superó los congeladores — lógica de `24`). La pantalla más trabajada de Duolingo, porque es donde se decide si el usuario se va para siempre. Estructura: reencuadre sin culpa → lo que NO se perdió → la reparación como acción inmediata.

### M5.1 Blueprint a 375px

```
┌─────────────────────────────────────┐
│                                     │
│              ◌ → ✦                  │ ← visual: emblema apagado que conserva
│                                     │    una chispa (NO llama llorando/rota:
│                                     │    el visual apunta a la reparación)
│   Tu racha de 23 días               │ ← display 26-28px / 700 · nombra la racha
│   se pausó — no se borró            │    REENCUADRE en el propio headline
│                                     │
│   23 días de constancia siguen      │ ← body 16px / máx 3 líneas · QUÉ queda:
│   en tu historial. Tu mejor         │    historial, récord, XP, nivel — nada
│   marca sigue siendo tuya.          │    de eso se pierde (24: nunca quitar)
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ❄ Recuperar mi racha            │ │ ← REPARACIÓN (<48h, mecánica de 24):
│ │   Haz tu registro de hoy y      │ │    card con la acción concreta + qué
│ │   los 23 días vuelven           │ │    devuelve · borde acento 1.5px
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │      Hacer mi registro          │ │ ← CTA héroe 52-56px acento
│ └─────────────────────────────────┘ │
│        Empezar de nuevo             │ ← salida honesta terciaria 14px, 44px táctil
└─────────────────────────────────────┘
```

### M5.2 Especificación numérica

```
- Se muestra UNA vez, al primer open tras la ruptura (flag en servidor — no re-mostrar
  cada sesión: recordarle la falla en loop es castigo).
- CERO rojo. CERO confetti (obvio). Paleta: neutros + acento SOLO en la ruta de reparación.
- Visual: 64-80px, estático o micro-motion sutil (la chispa parpadea 1 vez). Nunca una
  animación de "muerte" de la mascota/llama (Duolingo lo probó: castigo visual = churn).
- Headline: la palabra ROTA/PERDISTE no aparece. Vocabulario: "se pausó", "quedó en pausa".
- Bloque "qué queda": OBLIGATORIO antes de la oferta. Primero seguridad, después acción.
- Card de reparación: si la ventana <48h aplica, la acción es concreta (registro doble,
  ver un tip, o beneficio Pro — decidido en 24). Mostrar plazo honesto ("hoy y mañana").
  PROHIBIDO pay-to-not-lose como única salida (anti-patrón de 24): siempre debe existir
  una reparación por ACCIÓN, aunque exista también la opción Pro.
- "Empezar de nuevo": visible, sin culpa, sin confirmshaming. Reinicia limpio y en paz.
```

### M5.3 Timeline (ms)

```
   0ms  fondo fade 200ms — entrada SERENA: sin springs, sin bounce (el tono lo manda)
 150ms  visual fade-in 300ms
 300ms  headline fade + translateY(8→0) 300ms ease-out
 450ms  cuerpo ídem · 600ms card de reparación · 750ms CTA y salida (stagger 100-150ms:
        más lento que una celebración — esta pantalla camina, no salta)
        prefers-reduced-motion: fades simples.
```

### M5.4 Copy por arquetipo (headline / cuerpo / card)

| Arquetipo | Copy |
|---|---|
| **Coach enérgico** | "23 días no se borran con 1 día malo" / "Tu marca sigue en tu historial. Los grandes también fallan días — la diferencia es que vuelven." / "Registra hoy y recuperas tu racha completa." |
| **Mentor sereno** | "Tu racha de 23 días se pausó — no se borró" / "Un día en blanco no deshace 23 de constancia. Todo tu progreso sigue aquí." / "Con el registro de hoy, tus 23 días vuelven." |
| **Cómplice juguetón** | "La racha se tomó un día libre (sin permiso)" / "Tranquilidad: tus 23 días siguen en tu historial, intactos y presumibles." / "Haz tu registro de hoy y la traemos de vuelta como si nada." |
| **Experto sobrio** | "Racha en pausa: 23 días conservados" / "Tu historial y tu mejor marca no cambian. Un día perdido es ruido; la tendencia es lo que cuenta." / "Reparación disponible hoy: un registro restaura la racha." |

**❌ PROHIBIDO:** "Perdiste tu racha de 23 días 💔. Todo tu esfuerzo se reinició a 0. Para que no vuelva a pasar, hazte Pro." — culpa + pérdida total falsa + monetizar el dolor. Es la receta exacta del churn con reseña de 1 estrella.

### M5.5 Háptica y accesibilidad

```
- Háptica: NINGUNA. (Vibrar en la mala noticia se siente castigo físico.)
- aria-live="polite" en el headline. role="dialog" si es overlay; preferible ruta propia.
- Las 3 salidas (reparar / registrar / empezar de nuevo) accesibles por teclado, orden lógico.
```

---

## M6. VUELTA TRAS ABANDONO (≥7 días) — bienvenida in-app

El usuario reabrió tras una semana o más. La pantalla decide si esta visita es "la vuelta" o "la última". Estructura: bienvenida cálida → qué quedó guardado (su inversión, ver loop de 24) → re-onboarding suave de 1 tap. NUNCA culpa, NUNCA "te extrañamos" vacío, NUNCA un tour forzado.

### M6.1 Blueprint a 375px

```
┌─────────────────────────────────────┐
│                                     │
│            ◐ saludo                 │ ← visual de marca en estado "saludando"
│                                     │    (personaje si hay — 11; si no, orbe/
│   Qué bueno verte, Andrea           │    forma de marca animada suave)
│                                     │ ← display 26-28px / 700 · nombre real
│   Todo sigue donde lo dejaste:      │
│                                     │
│ ┌─────────────────────────────────┐ │ ← LA INVERSIÓN, tangible: 2-3 filas
│ │ ✓ Tu plan de 4 semanas          │ │    de lo que el usuario DEJÓ dentro
│ │ ✓ 18 días de historial          │ │    (plan, historial, biblioteca, nivel)
│ │ ✓ Tu mejor racha: 23 días       │ │    checks 20px acento · 15px/500
│ └─────────────────────────────────┘ │
│                                     │
│   ¿Retomamos suave? Tu siguiente    │ ← re-onboarding de 1 TAP: la app propone
│   paso son 10 minutos.              │    UN paso pequeño (next best action, 15)
│                                     │
│ ┌─────────────────────────────────┐ │
│ │     Retomar con 10 minutos      │ │ ← CTA héroe 52-56px · verbo suave +
│ └─────────────────────────────────┘ │    tamaño del paso (bajar la barrera)
│         Ir a mi panel               │ ← salida directa terciaria (usuario que
└─────────────────────────────────────┘    sabe qué quiere no es rehén del flujo)
```

### M6.2 Especificación numérica

```
- Trigger: gap ≥7 días desde last_active_on (dato de 24). Se muestra UNA vez por regreso.
- La lista de inversión usa DATOS REALES de su cuenta — si algo no existe, la fila se
  omite. Mínimo 2 filas; si no hay 2 cosas guardadas que mostrar, saltar esta pantalla
  (un "todo sigue aquí" sin nada dentro es peor que nada).
- El paso propuesto es MÁS PEQUEÑO que la acción normal (10 min, 1 registro, repaso corto):
  re-entrada con barrera baja. NUNCA "ponte al día con los 7 días que faltaron".
- Si la racha se rompió durante la ausencia: esta pantalla NO la menciona en negativo —
  la fila muestra "Tu mejor racha: 23 días" (el récord, que nunca se pierde). La
  reparación (M5) solo aparece si sigue dentro de la ventana de 48h; si no, no se toca el tema.
- Visual de marca en estado "saludando" (uno de los 5 estados del personaje — ver 11).
- Motion: entrada escalonada estándar (stagger 80ms), filas de inversión con stagger 60ms
  y checks con scale 0.5→1 spring sutil. Tono cálido, no festivo: sin confetti.
```

### M6.3 Timeline (ms)

```
   0ms  visual saludo: fade + scale 0.95→1, 300ms
 200ms  headline fade + translateY 300ms
 400ms  card de inversión: entra, luego sus filas stagger 60ms (checks spring sutil)
 700ms  propuesta de paso + CTA, stagger 100ms — STOP
        prefers-reduced-motion: fades simples.
```

### M6.4 Copy por arquetipo (headline / propuesta)

| Arquetipo | Copy |
|---|---|
| **Coach enérgico** | "¡Volviste! Eso ya cuenta" / "Nada se movió de su sitio. Retomamos con 10 minutos, no con culpa. ¿Vamos?" |
| **Mentor sereno** | "Qué bueno verte, Andrea" / "Todo sigue donde lo dejaste. Un paso pequeño hoy vale más que una semana perfecta." |
| **Cómplice juguetón** | "¡Andrea! Justo hablábamos de ti" / "Tu plan te guardó el asiento. ¿Retomamos suave con 10 minutitos?" |
| **Experto sobrio** | "Tu progreso sigue intacto" / "Plan, historial y mejor marca conservados. Sugerencia para hoy: una sesión corta de 10 minutos." |

**❌ PROHIBIDO:** "Te fuiste 9 días 😢. Tu racha murió y tu progreso te echó de menos. ¡No nos vuelvas a abandonar!" — culpa + drama + reproche. También prohibido el neutro-muerto: abrir directo al dashboard como si nada, sin reconocer la vuelta ni bajar la barrera de re-entrada.

### M6.5 Háptica y accesibilidad

```
- Háptica: ninguna (cálido ≠ evento).
- aria-live no hace falta: es una ruta normal, se lee en orden de foco.
- "Ir a mi panel" garantiza que el usuario con prisa no queda atrapado (skip honesto).
```

---

## M7. LOGRO COMPARTIBLE — la share card (1080×1920 y 1080×1080)

El hito genera una imagen que el usuario COMPARTE (stories 1080×1920, feed 1080×1080). Es marketing gratuito con la voz del usuario — y la pieza de identidad visual más vista fuera de la app. Se diseña con los tokens de marca, no con un template genérico.

### M7.1 Composición (proporciones sobre 1080×1920 — story)

```
┌───────────────────────┐ 1080×1920
│                       │
│   [logo + nombre]     │ ← marca arriba: logo 64px + nombre 40px/600 ·
│                       │    margen superior 120px · discreta, no protagonista
│                       │
│        ╭─────╮        │
│       │  30   │       │ ← EL DATO HÉROE: anillo/emblema 480-560px con el
│       │ días  │       │    número en display 200-240px/700 tabular-nums
│        ╰─────╯        │    — legible como thumbnail de 150px (test clave)
│                       │
│   Un mes entero de    │ ← claim 56-64px/700, máx 2 líneas, centrado ·
│   constancia          │    en la VOZ del arquetipo (no "achievement unlocked")
│                       │
│   ────────────────    │
│   12 sem · 340 XP     │ ← fila de 2-3 datos secundarios 36px/500 (opcional)
│                       │
│   [nombre-app.com]    │ ← atribución abajo 32px gris · margen inferior 120px
└───────────────────────┘
1080×1080 (feed): misma jerarquía, dato héroe 400-440px, claim 48px,
márgenes 96px — se recompone, NO se recorta la de 1920.
```

### M7.2 Especificación

```
- COLORES: exclusivamente tokens del brand kit — fondo con la profundidad de la app
  (base + mesh sutil), acento en el dato. La card debe pasar el test de 16: si le
  quito el logo, ¿se sabe de qué app es?
- TIPOGRAFÍA: la display de marca (rasterizada en el render — ver nota de fuentes abajo).
- CONTENIDO: el dato del hito REAL + claim en la voz del arquetipo. Sin datos privados
  (peso, dinero, salud) salvo opt-in explícito del usuario: la card es PÚBLICA.
- TEST DEL THUMBNAIL: a 150px de ancho se debe leer el número y reconocer la marca.
- FLUJO UI: tras "Compartir logro" (M2/M3) → preview de la card (fade+scale 0.95→1,
  250ms) + botón "Compartir" (Web Share API con el archivo) + "Guardar imagen" (fallback
  de descarga). Generación <1s percibida: skeleton con la forma de la card si tarda.
```

### M7.3 Cómo generarla con html-to-image

```tsx
// npm i html-to-image — renderiza un nodo DOM (oculto) a PNG con los tokens reales.
import { toPng } from 'html-to-image';

// El nodo: un <div> de 1080×1920 posicionado fuera de viewport (no display:none —
// html-to-image necesita layout real), estilizado con los MISMOS tokens CSS de la app.
export async function generateShareCard(node: HTMLElement): Promise<File> {
  const dataUrl = await toPng(node, {
    width: 1080,
    height: 1920,
    pixelRatio: 1,               // el nodo YA está a tamaño final — no escalar
    cacheBust: true,             // evita servir una card vieja cacheada
  });
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], 'mi-logro.png', { type: 'image/png' });
}

export async function shareCard(node: HTMLElement): Promise<void> {
  const file = await generateShareCard(node);
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file] });     // sheet nativo (mobile)
  } else {
    const url = URL.createObjectURL(file);        // fallback: descarga directa
    const a = Object.assign(document.createElement('a'), { href: url, download: file.name });
    a.click();
    URL.revokeObjectURL(url);
  }
}
```

```
GOTCHAS REALES:
- FUENTES: la webfont debe estar CARGADA antes del render (await document.fonts.ready)
  o la card sale con la fuente fallback — el bug #1 de las share cards.
- IMÁGENES del nodo: mismo origen o CORS habilitado; si no, el canvas se "ensucia" y
  toPng falla. Preferir SVG inline y gradientes CSS (cero requests externos).
- Safari iOS: la primera invocación a toPng puede rasterizar mal las webfonts —
  workaround estándar: llamar toPng dos veces y usar el segundo resultado.
- El nodo se monta oculto (position:fixed; left:-9999px), NUNCA display:none.
```

### M7.4 Claim por arquetipo (hito de 30 días)

| Arquetipo | Claim en la card |
|---|---|
| **Coach enérgico** | "30 días sin fallar. Esto es disciplina." |
| **Mentor sereno** | "Un mes de constancia, un día a la vez." |
| **Cómplice juguetón** | "30 días seguidos. Sí, soy de esas personas ahora." |
| **Experto sobrio** | "Racha de 30 días — la constancia ya es un dato." |

**❌ PROHIBIDO:** "🏆 ACHIEVEMENT UNLOCKED! 30 DAY STREAK 🔥" — inglés de videojuego en una app en español, template intercambiable sin marca.

### M7.5 Accesibilidad

```
- El preview de la card lleva alt descriptivo ("Tarjeta de logro: racha de 30 días").
- El flujo de compartir es opcional y jamás bloquea el "Continuar" del hito.
```

---

## COMPONENTES DE REFERENCIA (TSX completos)

Dos componentes canónicos para copiar al proyecto y adaptar a sus tokens. Stack: React + TS + Motion (`motion/react`) + canvas-confetti. Sin `any`, sin TODOs.

### `<CelebrationOverlay>` — la celebración canónica (M1/M2/M3 la parametrizan)

```tsx
// src/components/celebration-overlay.tsx
// npm i canvas-confetti motion && npm i -D @types/canvas-confetti
import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

/** Colores leídos de los tokens CSS del brand kit — nunca hex hardcodeado. */
function brandColors(): string[] {
  const styles = getComputedStyle(document.documentElement);
  return ['--color-accent', '--color-accent-soft', '--color-positive']
    .map((token) => styles.getPropertyValue(token).trim())
    .filter((value) => value.length > 0);
}

export interface CelebrationOverlayProps {
  open: boolean;
  /** Headline en la voz del arquetipo (ver MATRIZ DE VOZ de 11). */
  title: string;
  /** 1-3 líneas de significado. */
  message: string;
  /** Label del CTA — verbo + posesivo ("Ver mi plan"). */
  ctaLabel: string;
  onCta: () => void;
  onDismiss: () => void;
  /** Intensidad del hito (ver M2.2): escala el confetti. Default 1. */
  intensity?: 1 | 2 | 3;
  /** ms hasta auto-dismiss. Default 8000. */
  autoDismissMs?: number;
  /** Slot para el visual héroe (anillo, badge, preview del resultado). */
  children?: ReactNode;
}

export function CelebrationOverlay({
  open,
  title,
  message,
  ctaLabel,
  onCta,
  onDismiss,
  intensity = 1,
  autoDismissMs = 8000,
  children,
}: CelebrationOverlayProps) {
  const reduceMotion = useReducedMotion();
  const firedRef = useRef(false);

  const fireConfetti = useCallback(() => {
    if (reduceMotion || firedRef.current) return;
    firedRef.current = true;
    const colors = brandColors();
    const bursts = intensity; // 1 hito normal · 2 hito grande · 3 evento (100 días)
    for (let i = 0; i < bursts; i++) {
      window.setTimeout(() => {
        confetti({
          particleCount: 80 + intensity * 40,
          spread: 70,
          startVelocity: 32,
          origin: { x: bursts === 1 ? 0.5 : i / Math.max(bursts - 1, 1), y: 0.4 },
          colors: colors.length > 0 ? colors : undefined,
          disableForReducedMotion: true,
        });
      }, i * 250);
    }
    navigator.vibrate?.(intensity >= 2 ? [30, 40, 30] : 20);
  }, [intensity, reduceMotion]);

  useEffect(() => {
    if (!open) {
      firedRef.current = false;
      return;
    }
    const timer = window.setTimeout(onDismiss, autoDismissMs);
    return () => window.clearTimeout(timer);
  }, [open, autoDismissMs, onDismiss]);

  const spring = { type: 'spring', duration: 0.5, bounce: reduceMotion ? 0 : 0.25 } as const;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[var(--color-scrim)] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onDismiss} // tap-to-dismiss en el scrim
        >
          <motion.div
            className="flex w-full max-w-[343px] flex-col items-center gap-4 rounded-[var(--radius-card)] bg-[var(--color-surface-raised)] p-6 text-center shadow-lg"
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.95 }}
            transition={spring}
            onAnimationComplete={fireConfetti}
            onClick={(event) => event.stopPropagation()} // la card no cierra al tocarla
          >
            {children}
            {/* aria-live polite: el lector anuncia el logro sin interrumpir */}
            <div aria-live="polite">
              <h2 className="text-[26px] font-bold leading-tight text-[var(--color-text)]">
                {title}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
                {message}
              </p>
            </div>
            <motion.button
              type="button"
              onClick={onCta}
              whileTap={{ scale: 0.97 }}
              className="h-[52px] w-full rounded-[var(--radius-button)] bg-[var(--color-accent)] text-[16px] font-semibold text-[var(--color-on-accent)]"
            >
              {ctaLabel}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### `<StreakAtRisk>` — el estado M4 con slot de voz por arquetipo

```tsx
// src/components/streak-at-risk.tsx
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export type VoiceArchetype = 'coach' | 'mentor' | 'complice' | 'experto';

/** Copy de M4 por arquetipo — la app usa SOLO el suyo (Ficha de Dirección de Arte). */
const AT_RISK_COPY: Record<VoiceArchetype, (days: number) => string> = {
  coach: (days) => `${days} días no se dejan morir hoy. Un registro y sigue.`,
  mentor: (days) => `Tu racha de ${days} días sigue viva. El registro de hoy la mantiene.`,
  complice: () => 'La llama está en modo siesta. Un registro y vuelve a prenderse.',
  experto: (days) => `Racha activa: ${days} días. Falta el registro de hoy.`,
};

export interface StreakAtRiskProps {
  streakDays: number;
  archetype: VoiceArchetype;
  /** Label del CTA = la acción central del loop ("Registrar mi día"). */
  actionLabel: string;
  onAction: () => void;
  /** Ícono/emblema de racha de la marca en estado APAGADO (outline, sin fill). */
  emblem: ReactNode;
}

export function StreakAtRisk({ streakDays, archetype, actionLabel, onAction, emblem }: StreakAtRiskProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-label={`Racha de ${streakDays} días, pendiente el registro de hoy`}
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
    >
      <div className="flex items-center gap-3">
        {/* Emblema apagado que "respira": dormido, no muerto. Estático con reduced-motion. */}
        <motion.span
          aria-hidden="true"
          className="text-[var(--color-text-secondary)]"
          animate={reduceMotion ? undefined : { opacity: [0.5, 0.7, 0.5] }}
          transition={reduceMotion ? undefined : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {emblem}
        </motion.span>
        <div className="min-w-0">
          {/* El número conserva tamaño y peso, pero SIN acento: la racha duerme, no murió */}
          <p className="text-[16px] font-semibold text-[var(--color-text-secondary)]">
            Racha: {streakDays} días
          </p>
          <p className="text-[14px] text-[var(--color-text-secondary)]">
            {AT_RISK_COPY[archetype](streakDays)}
          </p>
        </div>
      </div>
      <motion.button
        type="button"
        onClick={onAction}
        whileTap={{ scale: 0.97 }}
        className="mt-3 h-[46px] w-full rounded-[var(--radius-button)] bg-[var(--color-accent)] text-[15px] font-semibold text-[var(--color-on-accent)]"
      >
        {actionLabel} →
      </motion.button>
    </section>
  );
}
```

> **Tokens usados por ambos componentes** (mapear a los reales de `10-DESIGN-TOKENS.md`):
> `--color-accent`, `--color-accent-soft`, `--color-positive`, `--color-on-accent`,
> `--color-scrim`, `--color-surface-raised`, `--color-border`, `--color-text`,
> `--color-text-secondary`, `--radius-card`, `--radius-button`. Si algún nombre difiere
> en el proyecto, se adapta el componente — nunca se mete un hex directo.

---

## CHECKLIST DE CIERRE — Momentos emocionales

```
[ ] M0: la pantalla del ritual diario cumple sus 4 piezas (dato de hoy, acción de 1 tap,
    racha visible, insight del historial) y NO se resolvió como dashboard de widgets
[ ] Cada evento emocional del contrato de 24 (streak_extended en hito, level_up,
    achievement_unlocked, streak_broken, win_back) tiene SU momento de este archivo
    implementado — no un toast genérico
[ ] Todos los momentos usan UN solo arquetipo de voz (el de la Ficha) y el copy no es
    intercambiable con otra app (test: quitar el nombre de la app y ver si delata la voz)
[ ] Intensidad correcta: confetti solo en hitos reales, escalada 7<30<100
[ ] Racha en riesgo: gris/apagado, cero rojo, cero countdown de pánico
[ ] Racha rota: reencuadre sin culpa + "qué queda" + reparación por ACCIÓN visible
    (no solo Pro) + "empezar de nuevo" sin confirmshaming — y se muestra UNA vez
[ ] Vuelta tras abandono: inversión REAL listada (≥2 filas o se omite la pantalla) +
    paso de re-entrada MÁS pequeño que la acción normal + salida directa al panel
[ ] Share card: tokens de marca, legible como thumbnail 150px, sin datos privados,
    document.fonts.ready antes del render
[ ] Todos: tap-to-dismiss + auto-dismiss, nunca bloquean la siguiente acción
[ ] Todos: prefers-reduced-motion (fades sí, springs/confetti/traslación no) y
    aria-live="polite" donde el momento anuncia algo
[ ] Háptica según tabla: medium en logro, heavy solo en hito grande, NINGUNA en
    riesgo/rota/vuelta
[ ] Verificado RENDERIZADO a 375px con screenshot (Regla 7) — cada momento es una
    pantalla de primera clase y se revisa como tal
```

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

- **`11-DISENO-EMOCIONAL.md`**: define la VOZ (COMPILADOR DE PERSONALIDAD → valores de spring/duración/exclamaciones; MATRIZ DE VOZ → el copy por arquetipo; SISTEMA DE PERSONAJE → quién porta la emoción). Este archivo pone esa voz en pantallas concretas.
- **`24-GAMIFICACION.md`**: el SISTEMA que dispara estos momentos (eventos `streak_extended`, `level_up`, `achievement_unlocked`, `streak_broken`, win-back) y su lógica de servidor. 24 decide CUÁNDO; 56 decide QUÉ SE VE.
- **`41-CRAFT-DE-ANIMACION.md`**: la doctrina de motion narrativo (Slow-Fast-Boom-Stop, pausa antes del resultado, frenar en seco) que estos timelines aplican.
- **`50-DISENO-ONBOARDING-PAYWALL.md`**: el hermano de este archivo — mismas reglas de blueprint para las pantallas que COBRAN. El pico emocional de M2 alimenta el momento del paywall (02B).
- **`17-VISUALIZACION-DATOS.md`**: anillos que se dibujan, números que cuentan — la gramática de datos animados que M1/M2 reutilizan.
- **`22-LIBRERIAS-Y-CRAFT.md`**: el stack (Motion, canvas-confetti, Lottie) y las 7 baseline; la celebración de hito real es su baseline #7 — aquí está su especificación completa.
- **`36-ANALITICA-Y-EVENTOS.md`**: cada momento emite su evento (`momento_mostrado {momento_id}`, `logro_compartido`) — taxonomía en 36.
