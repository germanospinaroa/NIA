# DISEÑO DE ONBOARDING Y PAYWALL — Especificación Visual de las Pantallas que Generan el Dinero

> **Cuándo cargar este archivo:**
> - SIEMPRE que se construya o revise cualquier pantalla del funnel de conversión: pregunta de onboarding, micro-pantalla de reconocimiento, loading "construyendo tu plan" o paywall
> - Junto con `52-COPY-VISUALES-CONVERSION.md` (copy + visuales que venden), `02B-ONBOARDING-Y-PAYWALL.md` (la ESTRATEGIA — este archivo es su capa VISUAL), `14-LEYES-DE-DISENO.md` (los números base) y `16-DIRECCION-DE-ARTE.md` (el brand kit del que salen radius, acento y tipografías)
>
> **Por qué existe:** `02B` define QUÉ deben lograr estas pantallas (micro-compromisos, las 7 preguntas del paywall, el trial). Pero sin especificación visual, el agente las diseña "de reflejo" y salen genéricas: dots de progreso, radio buttons tristes, un spinner antes del paywall y una lista de precios sin jerarquía. Estas 2-3 pantallas concentran el dinero de la app — se diseñan con números exactos, no con adjetivos. Aquí están.

**Regla de dependencia:** los valores CONCRETOS (color de acento, familia display, radius exacto) salen del brand kit derivado en `16`. Este archivo fija estructura, rangos y comportamiento — lo que NO se improvisa. Márgenes laterales de TODO el funnel: 16px (contenido útil = 343px a 375px de viewport).

**Regla de marca en funnel:** onboarding, paywall y login SIEMPRE muestran logo + nombre de app arriba. El logo/nombre vuelve a `/` o pide confirmacion si se perderia progreso. El usuario nunca debe sentirse en una pantalla anonima o desconectada del producto.

---

## A. PANTALLA DE PREGUNTA DE ONBOARDING

Una decisión por pantalla (Ley de Hick, regla 1 de `02B`). Cada pregunta es un micro-compromiso: la pantalla debe sentirse rápida, viva y personal — nunca un formulario.

### A1. Blueprint a 375px

```
┌─────────────────────────────────────┐  375px
│ ‹   ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░  45%  │ ← atrás 44px táctil + barra 2-3px + % real
│                                     │    (gap 24px hasta la pregunta)
│  ¿Cuál es tu meta                   │ ← display 28-32px / 700 / lh 1.1
│  principal?                         │    máx 8 palabras · text-wrap: balance
│  Esto define tu plan semanal        │ ← micro-copy 14-15px / 400 / gris secundario
│                                     │    opcional · 1 línea · 8px bajo la pregunta
│ ┌─────────────────────────────────┐ │    (gap 24-32px hasta las opciones)
│ │ ◈  Perder grasa               ✓ │ │ ← chip SELECCIONADO: borde acento +
│ └─────────────────────────────────┘ │    fondo acento 8-12% + check acento
│ ┌─────────────────────────────────┐ │
│ │ ◈  Ganar músculo                │ │ ← chip normal: borde 1px neutro,
│ └─────────────────────────────────┘ │    fondo superficie elevada
│ ┌─────────────────────────────────┐ │
│ │ ◈  Tener más energía            │ │ ← gap entre chips: 12px
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ ◈  Mantener mi peso             │ │
│ └─────────────────────────────────┘ │
│                                     │ ← sin CTA en selección única
└─────────────────────────────────────┘    (auto-avance, ver A2)
```

### A2. Especificación numérica

```
BARRA DE PROGRESO (regla 3 de 02B — goal gradient, SIEMPRE visible):
- Línea FINA de 2-3px, ancho completo menos márgenes. NUNCA dots ni steps numerados.
- Fill = acento · track = neutro al 10-15% de opacidad · radius = 999px (pill).
- % REAL (pregunta actual / total). Opcional label "45%" en caption 11-12px tabular-nums.
- TRUCO DE ARRANQUE: la barra empieza en 5-8%, nunca en 0% — es ENDOWED PROGRESS
  (Nunes & Drèze 2006: el progreso ya otorgado acelera la completación; se suma al
  gradiente de meta de Kivetz, Urminsky & Zheng 2006). El incremento se ANIMA (ver A4).

BOTÓN ATRÁS: chevron ‹ 20-24px, área táctil 44×44px, color secundario, arriba-izquierda,
  mismo renglón que la barra. Discreto pero SIEMPRE presente desde la pregunta 2.
  NUNCA "Saltar" visible en preguntas de personalización core (meta, nivel, nicho).
  Skip solo en pasos accesorios (regla 7 de 02B): texto terciario 13px bajo las opciones.

PREGUNTA: display 28-32px / weight 700 / line-height 1.1 / letter-spacing -0.02em.
  Máx 8 palabras, 1-2 líneas. UNA pregunta — nada más compite (regla de 14: un objeto).

CHIPS DE OPCIÓN (ancho completo, NUNCA radio buttons desnudos ni dropdown):
- Alto: 56-64px · ancho: 343px (completo) · radius: el de botones del brand kit (12-16px).
- Padding horizontal 16-20px · gap entre chips 12px · máx 5-6 opciones (Hick).
  Si hay >6 opciones con labels cortos (emojis/temas): grid de 2 columnas, chips de 48px.
- Normal: borde 1px neutro + fondo superficie elevada (un paso sobre el fondo, no plano).
- Ícono opcional a la izquierda: Phosphor DUOTONE 24px (el peso de onboarding, ver 22) —
  SVG de librería SIEMPRE, jamás emoji como ícono de opción; con contenedor si el diseño
  lo pide: <IconChip> de 49 (SISTEMA DE ÍCONOS Y DETALLES de 55).
- Label: 16px / 500. Texto en el lenguaje del usuario, 1-4 palabras.
- SELECCIONADO: borde acento 1.5-2px + fondo acento al 8-12% + check 20px acento a la
  derecha (entra con scale 0.5→1, 200ms, spring sutil) + háptica light.
- Tap feedback: whileTap scale 0.97-0.98, <150ms (obligatorio, 14).

ESCAPE HATCH OBLIGATORIO — "Otra cosa (escribe la tuya)":
  Regla dura: si la pregunta es sobre una categoría ABIERTA que no se puede enumerar por completo
  (meta personal, hábito, nicho/rubro, profesión, "qué tipo de contenido creas") → el último chip
  SIEMPRE es "Otra cosa (escribe la tuya)". Al tocarlo, NO auto-avanza: revela un campo de texto
  corto (mismo estilo que INPUT LIBRE de A3) con su propio CTA "Continuar". Excepción: preguntas de
  categoría CERRADA real (sí/no, franja horaria, frecuencia 1-7 días, nivel bajo/medio/alto) no lo
  necesitan — ahí las opciones SÍ cubren el 100% de respuestas posibles. Error real detectado: una
  pregunta de "¿qué quieres lograr?" con solo 3 opciones fijas obliga a un % de usuarios a mentir
  eligiendo la opción menos mala — mata la personalización desde la primera pregunta.
```

### A3. Comportamiento de selección

```
SELECCIÓN ÚNICA (el default — la mayoría de preguntas):
1. Tap → el chip pasa a estado seleccionado INMEDIATAMENTE (check + borde + fondo).
2. Pausa de 250-400ms (recomendado 300ms) con el chip marcado VISIBLE — el usuario debe
   VER su elección confirmada antes de avanzar. Auto-avance sin botón "Continuar":
   elimina un tap por pregunta y reduce friccion acumulada, incluso en recorridos cortos.
3. Durante la pausa se bloquea el doble-tap (no se puede seleccionar otro chip).

SELECCIÓN MÚLTIPLE ("elige todas las que apliquen"):
- Chips toggle (tocar marca/desmarca) + botón "Continuar" FIJO abajo con safe-area
  (padding-bottom: max(16px, env(safe-area-inset-bottom))). Alto 52-56px, ancho completo.
- Deshabilitado hasta ≥1 selección (65% opacidad — visible, nunca pill fantasma);
  al habilitarse, transición 200ms a acento pleno.
- Indicar el modo en el micro-copy: "Elige todas las que apliquen".

INPUT LIBRE (nombre, número): un solo campo 48-56px, autofocus, teclado correcto
  (type="text|number"), CTA fijo abajo. El teclado NUNCA tapa el campo (03, regla 12).

INPUT LIBRE CON SUGERENCIAS QUE RELLENAN (no seleccionan) — para metas/hábitos en las propias
  palabras del usuario, patrón Tiimo "Sugerir por mí" (ver `52` → "2bis"):
  - 2-4 chips de sugerencia arriba del campo (labels cortos, ej. "Publicar contenido a diario").
  - Tap en un chip → RELLENA el campo de texto con esa sugerencia (el chip NO se marca como
    "seleccionado" ni avanza el paso). El usuario puede editar libremente lo que se rellenó.
  - CTA "Continuar" FIJO abajo, habilitado solo con texto no vacío en el campo — el usuario decide
    cuándo avanzar, nunca un tap en el chip lo hace por él.
  - Diferencia clave con CHIPS DE OPCIÓN (A2/A3 arriba): esos son de selección discreta y auto-
    avanzan; estos son de personalización abierta y SIEMPRE requieren confirmación explícita.
  - Sub-copy sobre el campo: "Elige una sugerencia para completar el campo, o escribe la tuya."
```

### A4. Transición entre pasos

```
- SALE la pregunta actual: translateX(0 → -24px) + opacity 1→0 · 200ms ease-in.
- ENTRA la siguiente: translateX(40px → 0) + opacity 0→1 · 300ms ease-out
  (cubic-bezier(0.16, 1, 0.3, 1) — el token --ease-out de 14).
- Los chips de la pregunta nueva entran con stagger 50-60ms entre cada uno.
- La barra de progreso ANIMA su incremento en paralelo: width 300ms ease-out.
  El usuario ve la barra crecer con cada respuesta = recompensa inmediata.
- ATRÁS invierte la dirección (sale a la derecha, entra desde la izquierda).
- prefers-reduced-motion: solo cross-fade 200ms, sin translate.
```

### A4bis. Patrones adicionales de apps reales (evidencia citada en `52` → "2bis")

Dos micro-patrones documentados que suben conversión/activación sin romper esta especificación:

```
PREGUNTA DE ATRIBUCIÓN ("¿cómo nos conociste?"): Cal AI la incluye en su quiz — sirve como
  dato de marketing INCLUSO si el usuario abandona antes de registrarse. Insertar como una
  pregunta más (chips: Instagram/TikTok/Recomendación/Google/Otro) si el canal de adquisición
  no está ya instrumentado por otra vía (ver `36-ANALITICA-Y-EVENTOS.md`).

PRE-POBLADO CON "SUGERIR POR MÍ": cuando la pregunta pide que el usuario CONSTRUYA algo
  (una rutina, una lista, un primer plan), Tiimo pre-puebla con una sugerencia editable y un
  botón "Sugerir por mí" en vez de un campo vacío — baja la fricción de la hoja en blanco.
  Aplicar a cualquier pantalla tipo "crea tu primer X": mostrar un ejemplo ya lleno con el
  contenido REAL del dominio, que el usuario edita o acepta, nunca un formulario vacío.
```

### A5. Micro-pantallas de RECONOCIMIENTO (cada 3-5 preguntas)

"Cada pregunta devuelve algo" (Noom, en `02B`): tras un bloque de preguntas — y SIEMPRE
tras una pregunta sensible — se inserta una pantalla que devuelve un insight construido
con la respuesta real del usuario. Rompe la monotonía del quiz y paga el micro-compromiso.

```
┌─────────────────────────────────────┐
│ ‹   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░   58%  │ ← la barra NO retrocede: sigue sumando
│                                     │
│            ◐ ilustración            │ ← ícono duotone 64-80px o Lottie corto,
│                                     │    centrado · NUNCA foto stock genérica
│  Buena noticia, Andrea              │ ← display 28px / 700 · usa nombre/respuesta
│                                     │
│  Quienes empiezan en nivel          │ ← body 16px / lh 1.5 / máx 3 líneas
│  intermedio como tú ven progreso    │    el DATO clave en acento o weight 600
│  en las primeras 2 semanas          │    (dato honesto — nunca inventado: ética 03)
│                                     │
│ ┌─────────────────────────────────┐ │
│ │           Continuar             │ │ ← ÚNICO CTA · 52-56px · acento pleno
│ └─────────────────────────────────┘ │    fijo abajo + safe-area
└─────────────────────────────────────┘
```

```
- Entrada con stagger 60-80ms: ilustración → titular → texto → CTA (de arriba a abajo).
- 1 de estas cada 3-5 preguntas. Tipos que rotan: insight con su respuesta ·
  validación tras dato sensible · prueba social específica ("+12.000 personas") ·
  preview parcial del plan ("tu plan tendrá 4 semanas").
- Es también el lugar del review prompt de Cal AI (a mitad del onboarding, ánimo alto).
- CERO opciones aquí: solo Continuar. Es una recompensa, no otra decisión.
- Háptica: LIGHT al aparecer la pantalla (el reconocimiento se siente llegar, no solo se lee).
```

**VARIANTE FINAL OBLIGATORIA — ETIQUETADO POSITIVO (regla b de LA ESCALERA en `02B`):** el ÚLTIMO
reconocimiento antes del loading/paywall no solo desculpabiliza — ETIQUETA al usuario con una
identidad aspiracional construida desde sus respuestas (labeling effect, Tybout & Yalch 1980).
El pago después CONFIRMA una identidad ya entregada. Ejemplo (misma estructura del blueprint A5):
`"Tus respuestas te describen: eres un planificador estratégico — pocos definen su meta, su
horario Y su límite antes de empezar. Tu plan usa exactamente esa fortaleza."` — etiqueta positiva
+ evidencia sacada de SUS respuestas + puente al plan. Nunca una etiqueta genérica sin la evidencia
("eres increíble" no etiqueta: adula).

**SPEC DE LOTTIE/ILUSTRACIÓN (resuelve el "ilustración propia o Lottie corto" de arriba y del
visual del paywall — sin esto, el agente pone un ícono duotone y lo llama ilustración):**
```
CUÁNDO CADA TÉCNICA:
- LOTTIE: ilustración narrativa que se beneficia de movimiento orgánico (un plan que se arma,
  una figura que progresa, la celebración del reconocimiento).
- CSS/MOTION: formas geométricas y datos (anillos, barras, mini-gráficos, el mini-visual con
  tokens de esta sección) — más liviano y SIEMPRE en colores exactos del kit.
- CANVAS-CONFETTI: solo celebración de hito real (spec completa en 56-MOMENTOS-EMOCIONALES.md).

REGLAS DEL LOTTIE:
- Duración 1.2-2s, 1 SOLO loop (o loop suave si es ambient) · peso <50KB (formato .lottie/
  dotLottie preferido) · carga lazy (no bloquea el onboarding).
- FUENTE: LottieFiles (licencia verificada) RECOLOREADO a los tokens del kit vía el editor de
  LottieFiles o programáticamente (lottie-web/dotLottie exponen los layers de color) — un Lottie
  con su paleta original grita template. Para estáticos: generación IA según el pipeline de
  `11-DISENO-EMOCIONAL.md` (SISTEMA DE PERSONAJE: descripción canónica + export transparente).
- FALLBACK ESTÁTICO SIEMPRE: primer frame como SVG/PNG para prefers-reduced-motion, error de
  carga y conexiones lentas (LATAM). El momento nunca queda vacío.
- PROHIBIDO: el ícono duotone genérico como ÚNICA carga emocional del momento de reconocimiento.
  El duotone es para chips y listas (22); el momento de reconocimiento pide ilustración propia,
  Lottie recoloreado o mini-visual con datos reales — algo que otra app NO pueda copiar-pegar.
```

**FÓRMULA DE COPY para la pantalla de reconocimiento tras una respuesta sensible (no genérica):**
el error real más común es un texto de ánimo intercambiable ("¡Vas muy bien!") que serviría para
cualquier app. La fórmula que SÍ conecta con el avatar específico:
```
1. NOMBRAR el patrón exacto que esa respuesta revela (no "tienes un problema" — el patrón LITERAL:
   "cada vez que lo dejaste, fue justo después de un mal día").
2. QUITAR LA CULPA explícitamente, señalando la causa real (el diseño de la categoría de producto,
   una circunstancia, un mecanismo externo) — NUNCA "no es tu culpa" vacío; dar la razón concreta.
3. NOMBRAR EL MECANISMO propio del producto que rompe ESE patrón específico (no una promesa vaga
   de "esta vez va a ser diferente").
```
Ejemplo trabajado (app de hábitos anti-culpa, respuesta "lo intenté 3+ veces y lo dejé"):
`"Cada vez que lo dejaste, no fue por falta de voluntad. Fue porque justo el día que más
necesitabas apoyo — después de un mal día — la app te mostró un cero y una sensación de fracaso.
Eso termina ahora."` — nombra el patrón (paso 1), quita la culpa con la causa real (paso 2: el
diseño de la competencia, no el usuario), nombra el mecanismo propio (paso 3, implícito en "eso
termina ahora" + la pantalla siguiente lo explica). Esta fórmula aplica a CUALQUIER nicho: cambiar
"racha que rompe" por el patrón de fracaso real de tu categoría (ej. en finanzas: "cada vez que
armaste un presupuesto, lo abandonaste a la semana 2 porque era demasiado rígido para un mes real").

**MINI-VISUAL CON LOS COLORES REALES DE LA APP (no solo texto) en la pantalla que explica el
mecanismo diferenciador:** cuando la pantalla de reconocimiento presenta EL mecanismo propio del
producto (no solo agita el dolor), acompañar el texto con un mini-visual de 2-3 elementos que USE
los tokens de color reales del brand kit (16) — ej. un antes/después de 2 celdas de un calendario
(ayer en el color de "recuperación", hoy en el color de "hecho"), o un mini-gráfico de 3 barras.
Es la misma lógica de "mockups honestos" de `19`, aplicada DENTRO del onboarding, no solo en la
landing. Un ícono genérico + texto no demuestra el mecanismo; un mini-visual con los colores reales
de la app SÍ — y refuerza que el usuario ya está viendo "su" futura app, no una pantalla educativa
genérica.

### A6. Pregunta de COMPROMISO (commitment device — slider/selector de meta)

Para "¿cuántos días por semana?", "¿cuál es tu meta de X?": el usuario FIJA un número
que la app usará después (loading, paywall, recordatorios). El feedback es inmediato.

```
┌─────────────────────────────────────┐
│ ‹   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░   72%  │
│                                     │
│  ¿Cuántos días entrenarás           │
│  por semana?                        │
│                                     │
│                4                    │ ← valor héroe 40-48px / 700 / tabular-nums
│            días/semana              │    centrado óptico con su label (14, ley 10)
│                                     │    cambia EN VIVO al arrastrar (sin delay)
│   ○────────●────────────○           │ ← track 8px radius pill · thumb 28px con
│   1                     7           │    sombra sutil · háptica light por paso
│                                     │
│  ⚡ Meta realista para empezar       │ ← feedback contextual 14px que CAMBIA por
│                                     │    rango: 1-2 "suave" · 3-5 "realista" ·
│ ┌─────────────────────────────────┐ │    6-7 "ambiciosa — te acompañamos"
│ │        Fijar mi meta            │ │ ← CTA con verbo de compromiso (no "Continuar")
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

```
- El valor anima con conteo (snap por pasos discretos, nunca decimales raros).
- El feedback contextual valida SIEMPRE — nunca juzga ("¿solo 1 día?" PROHIBIDO).
- La respuesta se guarda y REAPARECE textual en el loading (B) y el paywall (C):
  ese eco es lo que convierte el dato en compromiso.
```

---

## B. LOADING "CONSTRUYENDO TU PLAN" — el argumento de apertura del paywall

`02B` es explícito: esta pantalla NO es relleno — es el inicio del pitch (patrón Noom).
El usuario ve su plan armarse con SUS respuestas y ya quiere protegerlo pagando.
Es una pantalla de primera clase: se diseña, no se resuelve con un spinner.

El mecanismo tiene nombre: LABOR ILLUSION (Buell & Norton 2011) — los usuarios valoran MÁS
el resultado cuando VEN el trabajo ocurriendo. El loader que muestra el procesamiento real
por pasos no es teatro decorativo: es valor percibido.

### B1. Blueprint a 375px

```
┌─────────────────────────────────────┐
│                                     │
│              ╭─────╮                │ ← anillo 96-120px · grosor 8-10px
│             │  72%  │               │    fill acento sobre track neutro 12%
│              ╰─────╯                │    % en display 24px tabular-nums, contando
│                                     │
│   Construyendo tu plan…             │ ← headline 22-24px / 700 · elipsis … (U+2026)
│                                     │    (gap 32px hasta la lista)
│   ✓  Analizando tu nivel:           │ ← COMPLETADA: check 20px acento +
│      intermedio                     │    texto 15px al 100%
│   ✓  Ajustando a tu meta de 5 kg    │ ← cada línea usa una RESPUESTA REAL
│   ●  Calculando tu ruta de          │ ← ACTIVA: punto pulsando 1s loop +
│      4 días/semana                  │    texto al 100%
│   ○  Preparando tu plan semanal     │ ← PENDIENTE: círculo outline, todo al 40%
│                                     │
└─────────────────────────────────────┘
```

### B2. Secuencia y motion

```
DURACIÓN TOTAL: 4-6 segundos. Ni menos (no se percibe el trabajo — si el plan real
  tarda 1s, la secuencia corre igual sus 4s mínimos) ni más de 8s JAMÁS (fake-loading
  >8s = el usuario huele el teatro y se rompe la confianza).

LÍNEAS (3-5): aparecen UNA a una, 600-900ms entre sí, entrada fade + translateY(8px)
  200ms ease-out. Cada línea PERSONALIZADA con la plantilla:
  "[Verbo gerundio] + tu [dato]: [respuesta literal del usuario]"
  ✅ "Ajustando a tu meta de 5 kg" · "Analizando tu nivel: intermedio"
  ❌ "Cargando datos…" · "Procesando…" (genérico = tira la persuasión a la basura)
  Transición de estado: pendiente → activa (inmediata) → completada (check entra con
  scale 0.5→1 spring 300ms + háptica light).

ANILLO: progresa 0→100% sincronizado con las líneas, con MESETAS (avanza rápido,
  se detiene 300-400ms al cambiar de línea, sprint final) — el ritmo irregular se
  percibe como trabajo real; un llenado linear perfecto se percibe como fake.
  El % cuenta con tabular-nums (los dígitos no bailan — 14).

CIERRE: última línea en check → anillo a 100% → PAUSA de 400ms con todo completado
  visible (el usuario registra "está listo") → transición al paywall: slide horizontal
  300-400ms ease-out (misma gramática de transición del onboarding — es el paso 26,
  no otra app).

REGLAS DURAS:
- NUNCA un spinner genérico aquí (prohibido en 15; aquí sería además tirar la venta).
- NUNCA barra sin texto: las líneas personalizadas SON el argumento.
- Si el backend REAL tarda >6s: mantener la última línea activa con mensajes que
  rotan cada 2s — nunca congelar el anillo (congelado = roto).
- ESTADO DE ERROR (la generación real FALLA — la lentitud no es el único fallo posible):
  el anillo se DETIENE (dejar de fingir progreso) + mensaje humano: "No pudimos terminar
  tu plan. Tus respuestas están guardadas." + CTA "Reintentar" que REUSA las respuestas
  (dispara solo la generación de nuevo — JAMÁS repetir el quiz). Si el reintento también
  falla → fallback a un plan GENÉRICO del nicho marcado como provisional ("Empieza con
  este plan base — lo afinamos con tus respuestas en tu primera sesión"): el usuario
  nunca queda a las puertas del paywall con las manos vacías.
- Accesibilidad: contenedor aria-live="polite" + aria-busy hasta completar (15);
  prefers-reduced-motion → líneas con fade simple, anillo sin animación de barrido.
- Sin botones: no hay nada que decidir. Atrás deshabilitado (el flujo ya se comprometió).
```

---

## C. PAYWALL — la pantalla que cobra

> **Propiedad del pilar paywall:** ESTRATEGIA y anatomía → `02B-ONBOARDING-Y-PAYWALL.md` · medidas/layout/motion → `50-DISENO-ONBOARDING-PAYWALL.md` · palabras/fórmulas de copy → `52-COPY-VISUALES-CONVERSION.md`. Este archivo cubre SOLO su parte.

Debe resolver las 7 dudas de `02B`, pero NO convertirlas en 7 bloques. El default es corto y
escaneable: una promesa, un visual de valor, hasta 3 beneficios, hasta 2 planes, renovacion,
CTA y una linea de confianza. En 390x844 deben verse al menos promesa, plan seleccionado,
precio/renovacion y CTA; si no caben, simplificar antes de reducir legibilidad.

### C0. PAYWALL DE SECUENCIA (multi-página) — cuándo el paywall son 3 pantallas, no 1

+37% de conversión vs una sola página (12.41% vs 9.07%, 40M+ aperturas — Superwall 2026) y solo
el 24% de las apps lo usa. Cada pantalla hace UN trabajo:

```
PANTALLA 1 — RECAP DEL VALOR PERSONALIZADO: lo que el quiz construyó, con los datos DEL usuario
  ("tu plan tiene X, Y, Z" — sus respuestas literales, nunca genéricos). Incluye la INVERSIÓN
  cuantificada ("Hecho con tus 12 respuestas") — costo hundido visible, regla a de LA ESCALERA
  de 02B: obligatorio, no ejemplo.
PANTALLA 2 — EXPECTATIVAS/TIMELINE DEL TRIAL: el C4 ES esta pantalla (Hoy → Día 5 → Día 7,
  con montos y fechas exactos).
PANTALLA 3 — PRECIO: el paywall de C1 (cards, CTA, salida limpia).
```

- El ritual C3bis (hold-to-commit) puede ir entre la pantalla 1 y la 2.
- En web, cada pantalla es un paso del MISMO flujo (sin recarga) — la transición de A4 aplica igual.

### C1. Blueprint a 375px

```
┌─────────────────────────────────────┐
│ ✕                                   │ ← (1) cierre 44×44px, esquina sup-izq,
│                                     │    ícono 20px secundario. VISIBLE desde el
│  Tu plan para perder                │    frame 1 — X oculta/retardada = dark pattern
│  5 kg está listo                    │ ← (2) headline display 28-32px/700 con la
│  Hecho con tus 12 respuestas        │    META REAL del usuario. NUNCA "Elige tu plan"
│                                     │    subhead 14-15px gris — OBLIGATORIO: muestra
│                                     │    la inversión ("Hecho con tus N respuestas" o
│                                     │    equivalente cuantificado — costo hundido
│                                     │    visible, regla a de LA ESCALERA de 02B)
│ ┌─────────────────────────────────┐ │
│ │  ✓ Plan de 4 días a tu nivel    │ │ ← (3) visual del valor: máx 3 beneficios (un
│ │  ✓ Ajustes semanales con IA     │ │    4º SOLO si responde una objeción de la
│ │  ✓ Seguimiento de tu progreso   │ │    FICHA-AVATAR), checks 20px acento, con
│ └─────────────────────────────────┘ │    SUS respuestas (o preview/gráfica, ver C2)
│           ┌──────────────┐          │
│ ┌─────────┤ MÁS POPULAR  ├────────┐ │ ← (4) card RECOMENDADA pre-seleccionada:
│ │ Anual   └──────────────┘        │ │    borde acento 2px + fondo acento 6-8% +
│ │ $10.83/mes                      │ │    badge. Precio anual SIEMPRE como $/mes
│ │ Se cobra $129.90/año · 2 meses  │ │    en 22-24px/700 tabular-nums; total anual
│ │ gratis                          │ │    texto 14px mínimo (transparencia obligatoria)
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Mensual                         │ │ ← (5) card alternativa: borde 1px neutro,
│ │ $12.99/mes                      │ │    el ancla "cara" (02C). Tap = selecciona
│ └─────────────────────────────────┘ │    (borde acento se mueve, precio del CTA
│ ┌─────────────────────────────────┐ │    se actualiza con conteo)
│ │   Empezar mis 7 días gratis     │ │ ← (6) CTA héroe 52-56px, ancho completo,
│ └─────────────────────────────────┘ │    acento pleno, 16-17px/600, 1ª persona
│  Cancela cuando quieras · Te        │ ← (7) reversibilidad: 13px gris, centrado,
│  avisamos antes del cobro           │    8px bajo el CTA. Con trial: fecha exacta
│                                     │    ("Sin cargo hasta el 8 de julio")
│     Ahora no  ·  Restaurar compra   │ ← (8) salida limpia: terciario 14px, 44px
│                                     │    táctil, SIN confirmshaming
│  🔒 Pago seguro · Garantía 30 días  │ ← (9) trust row: caption 12px + íconos 16px
└─────────────────────────────────────┘
```

**JERARQUÍA DE ÉNFASIS DEL HEADLINE (la misma de `55` — aplica a los headlines de onboarding Y del paywall):**
```
HEADLINE (pregunta de onboarding, reconocimiento, paywall): bold completo (700-800) SIEMPRE +
  1-3 palabras clave en COLOR DE ACENTO — se resalta la palabra que VENDE; en el paywall suele
  ser la META del usuario o el número del plan ("Tu plan para [perder 5 kg] está listo",
  "Empezar mis [7 días] gratis") — nunca artículos ni conectores. Variante igual de fuerte:
  EL MECANISMO bautizado como palabra resaltada ("Tu [Radar de Antojos] está configurado") —
  el paywall vende el mecanismo, no una lista de funciones (regla de hilo de 01/19). Variante
  permitida si el kit la define: degradé tonal del acento en la palabra clave.
SUBHEAD: peso 400-500 con 2-4 palabras importantes en semibold (600); máx 1 palabra en acento
  y solo si el headline no usó acento en la misma zona.
Un headline en texto plano donde nada resalta no pasa el cierre (gate de detalles premium, sección D).
```

### C2. Especificación de componentes

```
(1) CIERRE: 44×44px táctil, contraste ≥3:1. Es LEY (03, dark patterns): nunca oculto,
    nunca con delay, nunca 20% de opacidad camuflado en el fondo.
(2) HEADLINE: max 8-10 palabras. Sale del PROCESO OBLIGATORIO del `52` (10 variantes →
    puntuar con las 4 U's → test del bar → test de intercambiabilidad) — no solo interpolar
    la meta del onboarding de forma literal. Debe vender resultado, no describir estado.
    Ej: "Guarda tus 3 prioridades de hoy — mañana replanificas en un tap".
    Prohibido headline tibio tipo "Tu plan está listo" si no contiene deseo/perdida.

    El primer tap en X SIEMPRE cierra el paywall — una segunda modal que bloquea el cierre sigue
    PROHIBIDA (dark pattern). Lo que SÍ es legítimo y recomendado: una oferta post-cierre NO
    intrusiva — banner in-app discreto o email — con ventana de 24h REAL (el countdown NO se
    resetea; si expira, expiró). Recupera 8-15% de los que rechazan el paywall y +10-15% de ARPU
    (Adapty 2026). Caveat: si el usuario aprende que cerrar dispara descuento, se entrena a
    cerrar — por eso es UNA vez por usuario, no un patrón repetible. La cancelación retentiva de
    58 es para un suscriptor que quiere cancelar, no para presionar a quien descarta un paywall.

    Semántica honesta: "100%" solo significa que terminó el onboarding; "vista previa lista" no
    significa plan comprado/desbloqueado. "Ver mi plan" abre contenido propio; si abre venta, el
    CTA dice "Ver planes" o "Desbloquear mi plan".
    ⭐ EL COPY DEL PAYWALL SE DERIVA DE FICHA-AVATAR.md (57 §9, obligatorio): el headline
    usa el DESEO TANGIBLE #1 de la ficha; el recordatorio de pérdida honesta (visual b /
    línea de pérdida) usa el DOLOR #1 en su lenguaje literal; el CTA (6) usa la IDENTIDAD
    ASPIRACIONAL en 1ª persona; y las OBJECIONES de la ficha deciden qué microcopy de
    confianza va bajo el CTA (7): objeción de compromiso → "Cancela cuando quieras" ·
    objeción de precio → el precio/día ("menos de $1 al día") · objeción de privacidad →
    "tus datos no se comparten/conectan" · objeción de EFICACIA/ABANDONO ("ya probé apps
    así y las dejo" — la más común en hábitos/finanzas) → garantía CON PLAZO: "Si en 7 días
    no viste tu primera [victoria], te devolvemos todo" (solo si la política existe de
    verdad — ver C5). Sin ficha, el paywall no se escribe.
(3) VISUAL DEL VALOR — elegir UNA variante según el nicho (matriz A-F de 02C + archivo 52):
    a) ANTES/DESPUES: caos actual vs plan guardado, con contraste claro.
    b) PLAN BLOQUEADO con perdida honesta: item 1 visible, items 2-3/historial marcados
       como "se guarda al desbloquear Pro". No usar blur barato ni una card titulada
       "Preview de tu plan" sin tension de valor.
    c) GRÁFICA DE PROYECCIÓN: línea hoy → meta con fecha estimada en el eje
       ("5 kg menos ~ 15 de septiembre"), 120-160px de alto, se DIBUJA al entrar (17).
    d) LISTA/VALUE STACK de beneficios con checks acento — máx 3 (un 4º SOLO si responde
       una objeción de la FICHA-AVATAR), en lenguaje de resultado.
       Los checks son CHECKMARKS CUSTOM del sistema del 55 (círculo 20-24px fondo acento 12% +
       check SVG — componente en 49), jamás el ✓ del sistema ni emoji.
    e) TIMELINE de activacion: hoy → semana → patron/resultado.
    ⭐ EL TIPO DE VISUAL SIGUE AL VERTICAL (RevenueCat teardowns): apps lúdicas/consumer/social →
    ILUSTRACIÓN propia que refuerza el tono; apps de utilidad/productividad/finanzas → CAPTURAS
    REALES del producto + reseñas reales con estrellas (credibilidad > decoración). No poner una
    ilustración genérica en una app de finanzas ni una captura fría en una app juguetona.
    Si la variante lleva ilustración/Lottie: aplica la SPEC DE LOTTIE/ILUSTRACIÓN de A5
    (duración, peso <50KB, recoloreo a tokens, fallback estático).
(3bis) PLAN CON NOMBRE PROPIO — opcional: el plan generado se presenta como ARTEFACTO con identidad,
    no como una lista: card visual propia con los tokens de marca (fondo elevado + acento
    en el título, radius de cards, mini-sello o monograma del kit) titulada
    "El Plan [Nombre]: [n] semanas · nivel [x]" — el nombre del usuario o de su meta lo
    vuelve SUYO, y algo con nombre propio da pena abandonar (dotación: es la inversión
    del onboarding hecha objeto). El headline (2) y el CTA (6) se refieren a él por su
    nombre. Ejemplo: card "El Plan Andrea — 4 semanas · nivel intermedio" sobre el value
    stack, y CTA "Desbloquear el Plan Andrea" en vez de "Desbloquear mi plan".
    Solo pedir el nombre si personaliza mas que este titulo. Es UNA pantalla independiente y
    su posicion se decide por sensibilidad/contexto; nunca compartirla con la meta. Si no hay
    nombre, nombrar el plan por la META, nunca mostrar un placeholder vacio.
(4) PLAN CARDS: 2 opciones por defecto; 3 solo si el tercer tier tiene una diferencia real.
    Alto 72-88px · radius de cards del kit (16px) ·
    gap 12px. Recomendada PRE-SELECCIONADA (así +15-20% eligen anual, 02C).
    Badge: caps 11px/700, padding 4×8px, radius 6-8px, fondo acento, texto sobre acento,
    montado -10px sobre el borde superior. "MÁS POPULAR" o "2 MESES GRATIS".
    Precio: $/mes en tabular-nums SIEMPRE (aunque el plan sea anual — regla de oro 02C);
    total anual en texto mínimo 14px móvil "Se cobra $X/año" — visible, no escondido.
    Ahorro como "2 meses gratis" (> convierte que el %).
    ⭐ EL DESCUENTO/AHORRO ES EL ELEMENTO MÁS RUIDOSO DE LA PANTALLA (RevenueCat: los rediseños
    que subieron el ahorro a badge grande y contrastante ganaron +20% de conversión; enterrarlo
    rinde peor). El badge de ahorro debe COMPETIR EN PESO VISUAL con el CTA — no un texto gris
    chico. Mostrar además el equivalente mensual del anual ("solo $10.83/mes") como ancla visual.
(5) SELECTOR mensual↔anual: cards tocables (preferido a 375px) o toggle segmentado 40px.
    Háptica MEDIUM al seleccionar un plan (la decisión de compra se confirma en la mano).
(6) CTA: verbo + beneficio + 1ª persona. "Empezar mis 7 días gratis" · "Desbloquear mi
    plan". PROHIBIDO: "Suscribirse", "Continuar", "Pagar". Nunca deshabilitado (siempre
    hay un plan seleccionado). Sombra de elevación sutil — el botón se ve VIVO.
(7) Si hay trial, la fecha exacta del cobro es OBLIGATORIA aquí (02B, elementos ✅).
(8) "Ahora no" lleva a la versión limitada/estado anterior SIN fricción ni culpa.
    "Restaurar compra" siempre presente (compliance y confianza).
(9) TRUST ROW: una sola linea con garantia real, seguridad o dato social real; no amontonar los
    tres si repiten informacion. Iconos SVG
    16px (Lock/ShieldCheck de Lucide — jamás emoji 🔒, sistema del 55). Si no
    existe garantia o checkout real, NO mostrar placeholders como "garantia visible".
```

### C3. Motion del paywall

```
- ENTRADA escalonada top-down, stagger 60-80ms: headline → visual → cards → CTA →
  textos. (Deja que el argumento se lea en orden — es la narrativa de 02B animada.)
- BADGE: entra al final con spring sutil (scale 0.8→1, bounce 0.3, 400ms, UNA vez).
- CAMBIO mensual↔anual: el borde acento se DESLIZA a la card elegida (200ms ease-out)
  y el precio del CTA/card anima con CONTEO 300ms en tabular-nums (nunca corte seco).
- CTA: pulso MUY sutil opcional — scale 1→1.02→1, 600ms, 1 SOLO ciclo ~2s después de
  entrar. PROHIBIDO loop infinito (ansiedad = barato).
- prefers-reduced-motion: fades sin translate, sin pulso, precios sin conteo.
```

### C3bis. Ritual de micro-compromiso pre-paywall (opcional, patrón Flo)

Flo inserta un gesto de "mantener presionado" para afirmar intención justo antes de mostrar
el precio — convierte la auto-reflexión en compromiso (Cialdini: compromiso y consistencia,
como INTERACCIÓN, no solo como copy). Headway lo testeó y convirtió mejor (Retention.Blog
2024) — deja de ser solo "patrón Flo": tiene réplica con datos. Usar cuando el nicho lo
justifique (bienestar, hábitos):

```
┌─────────────────────────────────────┐
│         ¿Listo/a para empezar?       │ ← pregunta directa, 1 línea
│                                     │
│  ┌───────────────────────────────┐  │
│  │   Mantén presionado para      │  │ ← botón circular grande (96-120px),
│  │   confirmar tu compromiso     │  │    se llena de acento mientras se sostiene
│  └───────────────────────────────┘  │    (800-1200ms), spring al completar +
│                                     │    háptica medium
└─────────────────────────────────────┘
```
No usar como fricción artificial: si el nicho no tiene una razón de peso (bienestar/hábito),
un botón normal "Continuar" es más honesto. El gesto debe sentirse como un ritual, no un obstáculo.

### C3ter. Mockups honestos si el backend del paywall aún no existe

Estas especificaciones asumen datos y planes reales. Si se está diseñando/revisando ANTES de
conectar Hotmart (Sesión 4 antes de Sesión 6, ver `SECUENCIA-MAESTRA-CONSTRUCCION.md`): construir
la pantalla completa con el precio y copy REALES que se van a vender (no placeholder "$X.XX"),
pero el botón de pago puede simular el flujo con estado local — nunca mostrar un checkout falso
que parezca procesar un cobro real. Ver la jerarquía de fidelidad en `19` → "Mockups honestos
pre-lanzamiento" — aplica igual a onboarding/paywall.

### C4. TIMELINE DEL TRIAL — el visual DEFAULT de todo paywall CON trial (patrón Blinkist)

El timeline es el visual del valor (3) POR DEFECTO en todo paywall CON trial; el value stack
(variante d de C2) queda para el hard paywall SIN trial. Evidencia: Blinkist logró +23% de
inicios de trial, −55% de quejas y un push opt-in de 6% → 74% con un paywall SIN lista de
features — solo el timeline transparente; la objeción #1 en sus encuestas de salida era
"miedo a olvidar cancelar" (Growth.Design/Purchasely). Responde "¿puedo cancelar?" y
"¿por qué ahora?" de un vistazo y sube la confianza:

```
│  ●  Hoy — acceso completo           │ ← nodo 12px acento FILL + línea vertical 2px
│  │   Todo tu plan, sin límites      │    (acento de Hoy a Día 5, neutro después)
│  ●  Día 5 — te avisamos             │ ← el recordatorio ES parte de la promesa
│  │   Correo antes de cualquier cobro│    (y se cumple: email Día 5-6, ver 02C/18)
│  ○  Día 7 — 1er cobro: $129.90/año  │ ← nodo outline · monto y fecha EXACTOS
│      Cancela antes sin costo        │
```

```
- 3 nodos, texto title 15px/600 + caption 13px gris. Alto total 140-170px.
- La línea se DIBUJA de arriba a abajo al entrar (600ms ease-out) — 1 sola vez.
- Con esta variante el CTA dice "Empezar mis 7 días gratis" y la línea (7) puede
  acortarse a "Cancela cuando quieras" (la fecha ya está en el timeline).
- PEDIR EL OPT-IN DENTRO DEL TIMELINE: el aviso del "Día 5 te recordamos" se pide como
  permiso en ese momento ("¿te avisamos por correo/notificación?") — así el opt-in es
  parte de la promesa, no una interrupción (6%→74% en Blinkist).
- La primera victoria debe ocurrir ANTES del primer momento de cancelación: el 55.4% de
  las cancelaciones de trial corto ocurre el mismo D0 (RevenueCat 2026) — el post-pago se
  diseña para que la victoria llegue en minutos.
```

### C4bis. La verdad del puente bajo el CTA (OBLIGATORIO en todo paywall con trial)

El paywall con trial DEBE decir la verdad del PUENTE DEL TRIAL (`02C` → EL PUENTE DEL TRIAL): 3 bullets
de confianza bajo el CTA — caption 13px, checks 14px acento: **"Hoy no pagas nada" · "Te avisamos 1 día
antes del cobro" · "Cancela en 1 tap"**. Y se CUMPLEN de verdad (aviso D6 in-app + email, cancelación sin
laberinto) — prometer el aviso y no enviarlo es dark pattern (C5). Si el timeline de C4 ya muestra los 3,
no duplicar: el timeline ES la verdad del puente.

### C4ter. Checkout externo sin peaje (y la única captura de email permitida)

En web apps con Hotmart, el CTA abre el checkout directo por defecto, sin confirmación adicional.
Sigue PROHIBIDO el PEAJE de email (pedirlo como condición para ver el precio o el CTA — eso
destruye intención, regla de `60`). Lo que SÍ se permite y se recomienda TESTEAR: email OPCIONAL
en la pantalla de RESULTADOS del quiz, enmarcado como valor ("¿Te enviamos tu plan por correo?")
— nunca bloqueante, con skip visible. Por qué: en checkout web el ~97% que no compra es
irrecuperable sin email (visitante→suscripción web promedia 2-3% — FunnelFox/ConvertFlow 2025);
Noom captura el email a 1/3 del funnel (RevenueCat 2025). El email capturado alimenta la
secuencia de carrito abandonado (`18`) y el nurturing (`34`/`46`).

Texto recomendado: `Ir a Hotmart y activar mi prueba`; ayuda:
`Completa tus datos y elige "Quiero un periodo gratis".` La URL lleva `off`,
`showOnlyTrial=1` y `sck`; `email` solo si ya se conoce legitimamente. Antes de abrir Hotmart se
emite `checkout_iniciado`; `trial_iniciado` llega solo desde el webhook. Ver `18`, `36` y `60`.

### C5. Anti-patrones específicos del paywall (auditar SIEMPRE)

```
❌ X invisible, con delay o camuflada          → 44px, visible desde el frame 1
❌ Total anual escondido u omitido             → texto 14px visible bajo el $/mes
❌ Primer cierre abre otra presión (modal)      → cerrar en el primer tap; la oferta
   que bloquea el cierre                          post-cierre va en banner/email 24h (C2)
❌ "100%/completo" confunde quiz con compra    → nombrar onboarding, preview y unlock por separado
❌ Legal/precio crítico a 12px                  → mínimo 14px móvil + contraste AA
❌ Comparativa falsa (mensual inflado que      → el mensual es un precio REAL y
   nadie puede comprar solo para anclar)         comprable
❌ Urgencia fake (countdown que se resetea,    → escasez solo si es real (02B, ética)
   "oferta termina hoy" eterna)
❌ Confirmshaming en la salida ("No, prefiero  → "Ahora no", neutro y sin culpa
   seguir fracasando")
❌ Precio que solo aparece tras tocar el CTA   → el precio vive EN esta pantalla
❌ Precio/CTA debajo del primer viewport mobile → CTA fijo inferior con precio seleccionado
❌ "Preview de tu plan" como visual sin perdida/desbloqueo → convertir en antes/despues,
   value stack o plan bloqueado con perdida honesta
❌ "Garantia visible" / "pago seguro despues" → politica concreta o se omite de UI publica
❌ Pre-seleccionar el plan MÁS CARO sin ser    → se pre-selecciona el RECOMENDADO
   el recomendado honesto                        (mejor valor real para el usuario)
```
La ética completa está en `03` (REGLAS ÉTICAS) y `02B` (límite ético). Un paywall que
engaña convierte una vez y hace churn + refund + reseña de 1 estrella después.

---

## D. CRITERIOS DE REVISIÓN PROPIOS (añadir a `PLANTILLA-REVISION-PANTALLA.md` al revisar estas pantallas)

Ítems binarios — pasa o no pasa. Se suman al checklist general SOLO para las pantallas
de este funnel (pregunta, reconocimiento, loading, paywall):

```
ONBOARDING
[ ] La barra de progreso es una línea fina (2-3px) con % real que ANIMA cada avance
    — no dots, y nunca retrocede
[ ] Las opciones son chips de ancho completo 56-64px con estado seleccionado completo
    (borde acento + fondo 8-12% + check) — no radio buttons desnudos
[ ] Selección única auto-avanza a los 250-400ms CON el chip marcado visible antes
[ ] No hay "Saltar" en preguntas de personalización core; atrás discreto sí existe
[ ] Hay una micro-pantalla de reconocimiento cada 3-5 preguntas y usa la respuesta
    REAL del usuario (no un genérico intercambiable)

LOADING
[ ] El loading pre-paywall dura 4-6s (nunca >8s) y NO es un spinner: 3-5 líneas con
    checkmarks progresivos, cada una con un dato real del onboarding
[ ] Al completar hay pausa de 400ms con todo en check antes de transicionar

PAYWALL
[ ] El headline salió del PROCESO OBLIGATORIO del `52` (10 variantes + 4 U's + test del bar) y menciona la META del usuario
    ("Tu plan para X está listo"), no "Elige tu plan" — la diferencia con el headline
    tibio prohibido es la META: "Tu plan está listo" es tibio; "Tu plan para [su meta]
    está listo" nombra el deseo — sin la meta, no va
[ ] La inversión del usuario es VISIBLE en el momento del precio ("Hecho con tus N
    respuestas" o equivalente cuantificado — costo hundido, regla a de LA ESCALERA de 02B)
[ ] El precio anual se muestra como $/mes en tabular-nums Y el total anual es
    visible en label pequeño
[ ] La opción recomendada está PRE-SELECCIONADA con borde acento 2px + badge
[ ] El CTA es de acción en 1ª persona ("Empezar mis 7 días gratis") — nunca
    "Suscribirse" — y bajo él está la línea de reversibilidad con fecha de cobro
[ ] Hay ruta de salida visible: X de 44px desde el inicio + "Ahora no" sin
    confirmshaming + restaurar compra

GATE DE DETALLES PREMIUM (los 6, binarios — para TODA pantalla de conversión del funnel;
sin los 6, la pantalla NO se declara lista):
[ ] Titular/headline con énfasis: bold completo (700-800) + 1-3 palabras clave en acento
    (JERARQUÍA DE ÉNFASIS de 55)
[ ] ≥1 hairline degradé de 1-2px en el elemento clave (máx 3 por vista)
[ ] Toda lista de beneficios con icon chips premium (SVG Lucide/Phosphor, contenedor 40-48px,
    fondo acento 8-12%, radius del kit) — CERO emojis
[ ] Checkmarks custom (círculo acento 12% + check SVG), nunca el ✓ del sistema
[ ] Fondo con profundidad (mesh/radial sutil, no plano)
[ ] Radios consistentes del kit en toda la vista
```

Regla de cierre: estas pantallas son "obligatorias" en `PLANTILLA-REVISION-PANTALLA.md`
(onboarding y pago) — se revisan RENDERIZADAS a 375px con screenshot, como toda pantalla
(Regla 7 de CLAUDE.md), y además contra estos ítems. Si un ítem falla, la pantalla no
está lista aunque puntúe bien en la rúbrica general: aquí cada detalle es conversión.

---

## E. PANTALLA DE LOGIN — el último paso del funnel (después del paywall, nunca antes)

Es donde el comprador de Hotmart entra con su magic link caducado, y donde el usuario del funnel
guarda su plan. Sin password por default: el método primario es **magic link por email** (decisión
Hotmart-first de `26-AUTH-MODERNO.md`).

```
┌─────────────────────────────────────┐
│  ◆ [Logo + nombre]                  │ ← arriba, tocable → vuelve a / (regla de marca)
│                                     │
│  Entra a tu plan                    │ ← headline 24-28px / 700 · "Entra a tu [plan/app]",
│  Para guardarlo y verlo en          │    nunca "Iniciar sesión" frío
│  cualquier dispositivo              │ ← el PORQUÉ se pide cuenta: 1 línea de microcopy
│                                     │    14-15px gris (52 §6) — no se pide sin razón
│ ┌─────────────────────────────────┐ │
│ │ tu@correo.com                   │ │ ← input 48-56px, type="email", autofocus
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │   Enviarme mi enlace de acceso  │ │ ← CTA PRIMARIO 52-56px acento pleno = MAGIC LINK
│ └─────────────────────────────────┘ │    (compradores Hotmart: "usa el correo de tu compra")
│ ┌─────────────────────────────────┐ │
│ │  G  Continuar con Google        │ │ ← secundario OUTLINE (borde 1px neutro, no acento)
│ └─────────────────────────────────┘ │
│  🔒 Sin contraseñas: te llegará     │ ← caption 13px gris
│  un enlace de un solo uso           │
└─────────────────────────────────────┘
```

```
ESTADOS (los tres, diseñados — no un alert()):
- ENVIANDO: CTA con spinner inline + deshabilitado (bloquea doble-tap).
- ENVIADO: la pantalla cambia a "Revisa tu correo 📬 — te enviamos el enlace a [email]"
  + "Reenviar" deshabilitado 60s con countdown visible ("Reenviar en 42s") — respeta el
  rate limit de magic link de 26 (3 / 5 min) sin que el usuario se estrelle contra él.
- ERROR: humano y accionable ("No pudimos enviar el enlace. Revisa el correo e intenta de
  nuevo."), genérico ante email inexistente (anti-enumeración de 26: mismo mensaje exista o no).

MOTION: entrada con stagger 60ms (logo → headline → input → CTAs) — misma gramática del funnel.
La revisión usa los criterios de D que apliquen (CTA 1ª persona, sin dark patterns) + screenshot 375px.
```
