# RÚBRICAS DE PANTALLA — Fuente canónica de evaluación

> **Cuándo cargar:** al CERRAR cualquier pantalla (checklist de cierre, Regla de Oro 7) y al auditar.
> **Quién puntúa:** el subagente `revisor-visual` (`.claude/agents/revisor-visual.md`), que ya lleva
> estas rúbricas embebidas — este archivo es la fuente canónica de esas rúbricas y la referencia
> para humanos/entornos sin subagentes. **Autoevaluarse está prohibido** (doctrina del 12: quien
> construyó la pantalla está contaminado por la intención).
>
> **CUÁNDO SE INVOCA EL REVISOR (política canónica):** El revisor-visual es OBLIGATORIO en las 4
> pantallas que deciden el dinero (landing, onboarding, paywall, pantalla principal) y en la
> PRIMERA pantalla de cada plantilla/tipo nuevo. En las demás (ajustes, perfil, legales, variantes
> de un tipo ya aprobado): medición + checklist, anotando en el reporte "sin revisor (pantalla secundaria)".
> Al invocarlo se le pasan SIEMPRE 4 cosas: ruta del screenshot + ruta del ARCHIVO DE CÓDIGO +
> FICHA-ARTE.md + referencia del usuario si existe.
>
> Contenido: escala de severidad · rúbrica de crítica de 5 ejes · rúbrica /40 de usabilidad
> (Nielsen, con anclas 0-4 y pistas por criterio) · gate de carga cognitiva · rúbrica de craft
> visual /20 · regla del GATE DOBLE (≥36/40 Y ≥16/20) · anclas de los ítems subjetivos del cierre.
> Extraído de la fase de pulido (`07-PULIDO.md`), que las usa en su cierre.

---

## SEVERIDAD EN EL CHECKLIST (triar bajo presión, nunca sacrificar lo crítico)

Cuando el tiempo aprieta, el riesgo es gastar la última hora en microcopy mientras el flujo de pago sigue roto. Para evitarlo, **todo ítem de pulido lleva una etiqueta de prioridad** y se resuelve en ese orden. Nunca se sacrifica un CRÍTICO por pulir un MEDIO.

```
CRÍTICO  (bloquea el envío — se resuelve primero, sí o sí)
  - Accesibilidad (foco visible, lectores de pantalla, aria-live en contenido dinámico)
  - Contraste de texto suficiente (WCAG AA)
  - Targets táctiles ≥44px (que se pueda usar con el dedo)
  - Que el FLUJO DE PAGO funcione de punta a punta (si la app cobra, esto es lo primero)

ALTO  (se resuelve antes de "listo", salvo excepción justificada y avisada)
  - Performance (carga, Core Web Vitals, sin jank)
  - Seguridad (no exponer claves, validación, RLS)
  - Jerarquía visual (una acción primaria clara, el ojo sabe a dónde ir)

MEDIO  (pulido fino — solo después de cerrar CRÍTICO y ALTO)
  - Tipografía fina (kerning, viudas, escala)
  - Animación y micro-interacciones de detalle
  - Microcopy y afinado de tono
```

> Regla de triaje: si queda una hora, se gasta en CRÍTICO → ALTO. Un MEDIO sin resolver es un detalle; un CRÍTICO sin resolver es una app que no se puede vender.

---

## RÚBRICA DE CRÍTICA DE 5 EJES (complementa la rúbrica /40)

La rúbrica de Nielsen /40 mide usabilidad. Esta la complementa midiendo **craft y dirección** del entregable, sea una app, una landing o un deck. Es una herramienta de CRÍTICA cualitativa (genera el KEEP/FIX/QUICK-WINS de abajo); **el GATE numérico de pantallas de app es la RÚBRICA DE CRAFT VISUAL /20** (más abajo), que tiene anclas 0-4 y corte obligatorio. Puntuar **0-10 cada eje**, con PESOS según el medio:

```
EJE                       QUÉ MIDE
1. Coherencia filosófica   ¿el diseño tiene una idea rectora y todo la respeta?
2. Jerarquía               ¿el ojo sabe qué mirar primero, segundo, tercero?
3. Craft de ejecución      ¿el detalle fino está cuidado (espaciado, tipografía, estados)?
4. Funcionalidad           ¿hace lo que promete, sin fricción, en el flujo real?
5. Originalidad            ¿se siente propio o es una plantilla genérica más?

PESOS SEGÚN EL MEDIO (el mismo eje no pesa igual en todo):
  Deck / presentación  → pesa JERARQUÍA y coherencia filosófica
  Landing / página     → pesa FUNCIONALIDAD/conversión y jerarquía
  App / herramienta    → pesa FUNCIONALIDAD y craft de ejecución
  Pieza de marca/arte  → pesa ORIGINALIDAD y coherencia filosófica
```

### Formato de salida de la crítica

```
KEEP        → qué ya funciona y NO hay que tocar (anclarlo para no romperlo al iterar)
FIX         → qué corregir, etiquetado por severidad:
                ⚠️ crítico    (bloquea)
                ⚡ importante  (resolver antes de cerrar)
                💡 nice       (mejora si sobra tiempo)
QUICK-WINS  → cambios de bajo costo y alto impacto, listos para aplicar ya
```

> **Insight sobre variantes:** si generaste varias versiones, NO compiten por un único ganador. Cada una puede tener su caso de uso distinto — una más sobria para el cliente, otra más vistosa para redes. Antes de "elegir la mejor", pregunta para qué medio es cada una.

---

## RÚBRICA DE CRÍTICA PRE-ENVÍO (puntaje, no opinión)

"Se ve bien" no es un criterio. Antes de dar una pantalla protagonista por terminada, puntuarla contra las 10 heurísticas de Nielsen, **0-4 cada una** (0 = ausente, 4 = excelente). Total sobre 40:

```
 1. Visibilidad del estado del sistema (el usuario siempre sabe qué pasa)         [0-4]
 2. Lenguaje del usuario, no del sistema (mundo real, no jerga interna)           [0-4]
 3. Control y libertad (deshacer, cancelar, salir, volver)                        [0-4]
 4. Consistencia y estándares (mismos patrones en toda la app)                    [0-4]
 5. Prevención de errores (el mejor error es el que no ocurre)                     [0-4]
 6. Reconocer mejor que recordar (opciones visibles, no memoria)                  [0-4]
 7. Flexibilidad y eficiencia (atajos para expertos sin estorbar al novato)        [0-4]
 8. Estético y minimalista (cada elemento se gana su lugar — archivo 14)          [0-4]
 9. Errores claros y con solución (qué pasó + qué hacer — archivo 11)             [0-4]
10. Ayuda contextual cuando se necesita (tooltips, empty states que enseñan)       [0-4]
                                                                         TOTAL: __/40
```

```
BANDAS DE PUNTAJE:
  36-40 → pasa el corte de USABILIDAD (para "listo" falta el 2º corte: craft visual ≥16/20, ver abajo)
  28-35 → bueno, pulir los puntos de 2-3 antes de enviar
  20-27 → necesita trabajo; no enviar aún
  <20   → rehacer la pantalla
Realidad: un 4 es raro; la mayoría de UIs reales puntúan 20-32. Subir cada heurística baja
es trabajo concreto de pulido, no opinión.
```

### Anclas objetivas 0-4 (para que el puntaje sea repetible entre agentes)

El corte ≥36/40 es el gate visual central del SO (lo exige `32-DEL-MVP-AL-PRODUCTO.md` sobre el render a 375px). Sin anclas, dos agentes puntúan la misma pantalla distinto porque el filo se juega en "¿esto es 2 o 3?". Esta tabla fija qué significa cada puntaje de forma verificable. Puntuá sobre el render real a 375px, no sobre la intención:

```
ANCLA   SIGNIFICADO (vale para los 10 criterios)
  0   Ausente o roto. El criterio no se atendió, o lo que hay perjudica (ej: ilegible, foco invisible).
  1   Presente pero deficiente. Se intentó, falla en lo básico y se nota a simple vista.
  2   Aceptable con problemas notorios. Funciona, pero un usuario los percibe sin buscarlos.
  3   Bien, detalles menores. Solo un ojo entrenado detecta qué afinar. Apto para enviar.
  4   Ejemplar. Nivel del decil superior; nada que mejorar en este criterio.
```

Regla de oro del corte: si dudas entre dos anclas, **el problema visible baja el puntaje** (elige el menor). El "2 vs 3" se decide así: ¿un usuario cualquiera lo nota sin buscarlo? → es 2. ¿Solo lo ve quien revisa con lupa? → es 3.

Qué mirar para puntuar cada criterio de forma objetiva (la pista verificable, no el gusto):

```
 1. Estado del sistema  → ¿toda acción >100ms tiene feedback inmediato (skeleton/spinner inline)?
                          ¿el usuario nunca se pregunta "se colgó"? (ver 15, escala de latencia)
 2. Lenguaje del usuario → ¿0 jerga técnica/inglés crudo en la UI? ¿títulos y CTAs en su mundo? (ver 07-PULIDO.md, Capa 2 copy)
 3. Control y libertad  → ¿toda acción destructiva tiene confirmación + undo? ¿hay volver/cancelar/cerrar visible?
 4. Consistencia        → ¿el mismo componente luce/actúa igual en todas las pantallas? ¿0 variantes accidentales?
 5. Prevención de error → ¿inputs validan antes de enviar? ¿estados deshabilitados claros? ¿se evita el error de raíz?
 6. Reconocer vs recordar→ ¿las opciones están visibles, sin pedir memorizar datos de otra pantalla?
 7. Flexibilidad         → ¿hay atajos para el experto (teclado, defaults) sin estorbar al novato?
 8. Estético/minimalista → ¿1 sola acción primaria por pantalla? ¿cada elemento se gana su lugar? (ver 14)
                          ¿jerarquía, espaciado, color, tipografía y movimiento respetan las leyes de 14?
 9. Errores con solución → ¿cada error dice qué pasó + qué hacer, sin código técnico? (ver 11)
10. Ayuda contextual    → ¿empty states que enseñan, tooltips donde se necesita, 0 pantalla muda?
```

> ⚠️ **QUÉ SE PUNTÚA SOBRE EL SCREENSHOT Y QUÉ NO.** Un screenshot estático NO muestra: undo y
> confirmaciones (heurística 3), atajos de teclado/defaults (heurística 7), aria-live y anuncios
> de contenido dinámico (parte de la 1 y del gate de accesibilidad), ni la validación en vivo
> (parte de la 5). **Esas se evalúan sobre el CÓDIGO y el flujo real** (grep de `aria-live`,
> handlers de undo, onBlur de validación) — está PROHIBIDO inventarles un puntaje mirando la
> imagen. El resto (jerarquía, copy, estados visibles, consistencia, densidad) se puntúa sobre
> el screenshot a 375px. En el reporte, marcar cada heurística con su fuente: `[render]` o `[código]`.

Nota sobre los criterios visuales de craft (jerarquía, espaciado, color, tipografía, movimiento, estados,
profundidad/craft) que el SO también audita: caen dentro de las heurísticas 4, 8 y 9 de esta rúbrica; usa
las "Capas 1-3" de `07-PULIDO.md` y `14-LEYES-DE-DISENO.md` como la lista verificable de qué mirar para subir
esos puntajes. Accesibilidad (incluido el contenido dinámico anunciado en aria-live, ver 15) entra en el
gate de calidad de `03-PRINCIPIOS-APP-EXITOSA.md` y es prerrequisito de un 3-4 en la heurística 8.

**Gate de carga cognitiva (si falla 1, es crítico — corregir antes de puntuar lo demás):**
```
[ ] Cada grupo/lista visible tiene ≤4-5 ítems antes de pedir scroll o agrupar
[ ] Cada decisión presenta ≤4 opciones (más = parálisis; archivo 15 "next best action")
[ ] UNA acción primaria por pantalla (archivo 14, mandamiento 1)
[ ] El usuario no tiene que recordar nada de una pantalla a la otra
[ ] Ninguna pantalla pide >5-7 campos sin dividir en pasos
[ ] El texto por bloque cabe en 3-4 líneas (archivo 14, límites de texto)
[ ] El "qué sigue" es obvio sin leer instrucciones
[ ] Cero elementos que parezcan interactivos y no hagan nada (CLAUDE.md, regla UX 11)
→ 4 o más fallas = sobrecarga crítica; simplificar antes de cualquier otra cosa.
```

---

## RÚBRICA DE CRAFT VISUAL /20 (separada de la /40 — mide lo que Nielsen deja pasar)

La rúbrica /40 es de **usabilidad** (Nielsen): una pantalla usable pero SOSA puede sacar 36/40 y seguir pareciendo template. Esta rúbrica mide el **craft visual** — lo que separa "correcta" de "diseñada". Se puntúa SIEMPRE junto a la /40, sobre el render real a 375px. Cinco ejes, **0-4 cada uno**, total sobre 20:

```
EJE 1 — JERARQUÍA (test de entrecerrar los ojos: ¿se lee 1→2→3→4?)
  0  Al entrecerrar, todo pesa igual: no hay un elemento dominante; el ojo no sabe dónde empezar.
  2  Hay un elemento dominante, pero el 2º y 3º nivel compiten entre sí (dos cosas del mismo
     tamaño/peso reclaman ser "lo segundo"), o hay >3 tamaños de texto en la pantalla.
  4  Al entrecerrar se leen 4 niveles nítidos en orden (héroe → título → cuerpo → label);
     máx 3 tamaños; el ojo recorre la pantalla en el orden que el diseño quiso.

EJE 2 — PROFUNDIDAD (¿fondo plano o 3 niveles?)
  0  Fondo de UN fill plano (#000, gris uniforme, beige plano); cards que solo se distinguen
     por un borde; cero sensación de capas.
  2  Hay algún intento (una sombra, un borde sutil) pero inconsistente: unas cards elevan y
     otras no, o el fondo es plano y solo las cards tienen tratamiento.
  4  3 niveles consistentes en TODA la pantalla: base con profundidad (mesh/gradiente sutil o
     tinte), superficies elevadas (sombra suave + luz en dark / sombra multicapa en claro),
     áreas hundidas (inputs). Se percibe qué flota y qué recede sin leer nada.

EJE 3 — IDENTIDAD OWNABLE (¿intercambiable con otra app?)
  0  Brand kit intercambiable: si le cambias el logo por el de otra app del SO o de cualquier
     demo de IA, nadie lo nota. Dark + 1 acento + fuente de moda sin tratamiento.
  2  Hay decisiones (acento con intención, tipografía con carácter) pero NINGÚN dispositivo
     ownable: sin textura, ilustración, foto, 2ª nota de color ni tratamiento propio de la
     display. Correcta pero anónima.
  4  ≥1 dispositivo ownable visible en la pantalla (textura/grano, ilustración de la serie,
     tratamiento de foto, detalle firma) + el kit pasa el test del 16: NO podría intercambiarse
     con otra app sin que se note.

EJE 4 — MOVIMIENTO (¿las 7 baseline vivas?)
  0  Pantalla estática: aparece de golpe, números plantados, taps sin feedback.
  2  Algunas baseline presentes (3-4 de 7): hay stagger o feedback de tap, pero faltan piezas
     obvias (números héroe sin conteo, modales que aparecen en seco, tabs con corte).
  4  Las 7 baseline de DESIGN-CORE §6 verificadas UNA POR UNA en esta pantalla (las que apliquen) +
     prefers-reduced-motion respetado + el carácter del motion es consistente (una sola firma).

EJE 5 — ENCAJE ÓPTICO (¿números centrados, radius consistente, alineaciones?)
  0  Desencajes visibles a simple vista: número descentrado en su anillo, chips estirados con
     hueco muerto, radios distintos entre cards, contenido que flota asimétrico.
  2  El grueso encaja pero hay 1-2 detalles que un usuario nota sin buscarlos (un ícono
     descentrado en su botón circular, un padding asimétrico, una fila desalineada).
  4  Pasa la sección 8 del 43 completa: números compuestos en una composición decidida y
     centrados a OJO, radius idéntico en toda la pantalla, chips que abrazan su contenido,
     padding simétrico, alineaciones a la retícula. Solo una lupa encontraría algo.
                                                                        TOTAL: __/20
```

**ANCLAS BINARIAS PARA PANTALLAS DE CONVERSIÓN (aplican SOLO a landing/onboarding/paywall — no a
pantallas de app interna).** Se verifican junto a los 5 ejes sobre el render a 375px; un fallo
baja el eje correspondiente (énfasis → jerarquía · hairline/chips → identidad · secciones →
profundidad) y va a TOP DEFECTOS:

```
[ ] Titular con énfasis: bold completo + 1-3 palabras clave en acento (JERARQUÍA DE ÉNFASIS de 55)
[ ] ≥1 hairline degradé (1-2px, máx 3 por vista) y chips SVG sin emojis en las listas de beneficios
[ ] Secciones adyacentes distinguibles (contraste de fondo base/elevado o separador) — texto AA
```

**PRESUPUESTO DE COPY DE LANDING (por sección — si 3+ secciones lo exceden, el eje de copy NO
pasa).** Los límites vienen del presupuesto del `52` (el archivo que manda en presupuesto de copy,
ver MAPA-DE-AUTORIDAD); aquí se fijan como ancla BINARIA por sección para que se CUENTEN, no se estimen:

```
[ ] Subheadline del hero ≤14 palabras
[ ] Card de problema ≤12 palabras
[ ] Agitación: frases de ≤2 líneas cada una (jamás párrafo corrido)
[ ] Cada paso del mecanismo: 1 línea
[ ] Condición de la garantía ≤3 líneas
[ ] Cada respuesta de FAQ ≤40 palabras
[ ] H2 del CTA final ≤8 palabras
[ ] REGLA MÓVIL: ningún bloque de texto >3-4 líneas a 375px (~160 caracteres)
```

> Nota: `audit-conversion.sh` lo cuenta mecánicamente; el revisor confirma visualmente
> (el conteo no ve lo que el line-height y el ancho real rompen a 375px).

```
REGLA DE GATE (doble corte, ambos obligatorios):
  PANTALLA LISTA = ≥36/40 en usabilidad Y ≥16/20 en craft visual.
  - 38/40 + 12/20 = usable pero sosa → NO está lista (subir craft: ejes en 0-2).
  - 30/40 + 18/20 = linda pero frustrante → NO está lista (subir usabilidad).
  Puntúa el REVISOR INDEPENDIENTE (doctrina del 12 — quien construyó la pantalla está
  contaminado por la intención). El revisor YA EXISTE como agente en
  `.claude/agents/revisor-visual.md`, con las rúbricas EMBEBIDAS en su definición:
  se invoca lanzando ese subagente pasándole 4 cosas — el screenshot a 375px + la
  FICHA-ARTE.md del proyecto + la referencia del usuario (si la hay, para el test de
  fidelidad) + la RUTA del archivo de código de la pantalla (las heurísticas 3/7 y el
  eje de movimiento se verifican en código, no sobre la imagen). Si la pantalla VENDE
  (landing/paywall/upgrade), se le pasa además FICHA-AVATAR.md (rúbrica de copy /20).
  NO debe leer este archivo ni el razonamiento del constructor — contexto limpio.
  El puntaje intermedio (1 y 3) se usa cuando la pantalla queda entre dos anclas; ante la
  duda, el problema visible baja el puntaje (misma regla de oro de la /40).
```

### Anclas para los ítems subjetivos del checklist de cierre (criterios observables, no gusto)

**"CTA héroe VIVO"** deja de ser opinión — el CTA cumple los 4 o no está vivo:

```
[ ] Contraste ≥3:1 del CTA con su fondo inmediato (medido, no estimado)
[ ] Estado hover/tap DEFINIDO e implementado (whileTap scale 0.97 o :active propio — se ve responder)
[ ] NUNCA disabled por defecto: habilitado hasta que arranca el request; valida al click con hint
    (regla de forms del 43 — nada de pill muerto al 50% de opacidad esperando el form perfecto)
[ ] Área táctil ≥48px de alto y ancho completo o centrado en la zona cómoda del pulgar (43, thumb zone)
```

**"¿Es genuinamente bueno / se ve premium?"** se responde con 3 checks observables, no con adjetivos:

```
[ ] Test del logo: tapando el logo, ¿la pantalla se distingue de un template y de las otras apps del SO?
[ ] Test del reflejo: ¿al menos UNA decisión visual de esta pantalla NO la tomarías en otro proyecto
    del mismo tipo? (16, test de genericidad — si todo es reusable, es default disfrazado)
[ ] Craft visual ≥16/20 en la rúbrica de arriba, puntuado por el revisor independiente
```
