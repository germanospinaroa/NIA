# DESCUBRIMIENTO DE USUARIO — Investigar la hipótesis de problema con HUMANOS REALES (antes del gate de pago)

> **Cuándo cargar este archivo:**
> - Justo DESPUÉS de `01-IDEACION.md` (ya tienes una hipótesis de problema y un avatar) y ANTES de `02-VALIDACION.md` (el gate de pago).
> - Cuando tu hipótesis de problema NO está aterrizada en conversaciones reales con el segmento — es decir, casi siempre antes de construir.
> - Cuando vas a fijar el value-based pricing de `40-UNIT-ECONOMICS.md` y necesitas el "trabajo a contratar" y el rango de disposición a pagar.
>
> **Por qué existe:** el SO ya tiene un gate que prueba la demanda con DINERO (`02`, Paso 0) y un modelo que prueba si el precio deja margen (`40`). Lo que faltaba es el eslabón ANTES de pedir plata: investigar la hipótesis de problema con personas reales del segmento y aterrizarla en su COMPORTAMIENTO PASADO. Este archivo conecta `01` (la hipótesis) con `02` (la señal de pago): `44` detecta la señal CUALITATIVA, `02` la confirma con dinero. **Una app bonita que no resuelve un problema real no se vende: la idea y el problema son lo que la hacen vendible.**
> El dato que lo respalda: el 42-43% de los fracasos es "no había mercado" (CB Insights 2014/2026), y ~65% de los que fallaron por mercado nunca hablaron con un cliente antes de construir (UserIntuition 2025). Matiz clave (Lenny Rachitsky, 2022-23): las entrevistas no GENERAN la idea (en 50 startups de consumo exitosas, solo 1 la originó así) — la VALIDAN o la matan; la idea nace de exposición al problema y experimentos rápidos.

---

## 1. PRINCIPIO RECTOR — problema antes que solución; el comportamiento no miente

```
Las OPINIONES mienten. El COMPORTAMIENTO no.
"Me encantaría algo así" es cortesía, no evidencia.
Lo que la persona YA HIZO la última vez que tuvo el problema es el único dato confiable.
```

Tres reglas que gobiernan todo el archivo:

1. **El problema es lo vendible, no la app.** Una interfaz pulida sobre un problema que nadie tiene es la forma más cara de perder semanas. Pensar desde el problema (no desde la solución) es lo que hace una app vendible — coincide con la Constitución de `01`.
2. **Research sin una DECISIÓN que dependa de él = teatro.** Si ningún resultado del estudio va a cambiar lo que construyes, no investigues: estás buscando confirmación, no verdad.
3. **Pide hechos del pasado, no opiniones del futuro.** "¿Usarías esto?" es una predicción que la gente falla. "¿Qué hiciste la última vez?" es un hecho que la gente recuerda.

---

## 2. LA BIG Q — toda investigación arranca atada a una decisión

**LA HIPÓTESIS MÁS RIESGOSA — antes de formular la Big Q:** lista las 2-3 asunciones que MATARÍAN
la idea (¿que paguen? ¿que la IA entregue calidad suficiente? ¿que el canal exista?) y marca LA
más riesgosa. El estudio se diseña para ESA — no para la que es más cómoda de testear (framework
MVT de Gagan Biyani, First Round 2021: "un test de una hipótesis esencial, no un MVP"). Testear el
pago cuando la asunción letal era la calidad del output es validar la pregunta equivocada.

Antes de hablar con nadie, escribe la **pregunta de investigación** con un **verbo de resultado** y declara **qué decisión de producto cambia** según lo que encuentres. Si ninguna decisión depende del estudio, NO se hace.

**Verbos que SÍ** (concretos, evaluables): *describir, evaluar, identificar, comparar, cuantificar, priorizar.*
**Verbos que NO** (vagos, infinitos): *entender, explorar, conocer, profundizar.*

```
PLANTILLA DE BIG Q — [Nombre del estudio]

Big Q:        [verbo de resultado] + [qué exactamente] + [en qué segmento]
              ej. "IDENTIFICAR qué hacen hoy los community managers freelance de LATAM
                   para planear su contenido semanal y cuánto les cuesta en tiempo/dinero."
Decisión que cambia: [si encuentro X → hago A; si encuentro Y → hago B / pivot]
              ej. "Si planean en Excel/a mano y les duele >2h/semana → sigo al gate de 02.
                   Si ya usan una herramienta que les sirve → pivot de ángulo o de avatar."
Si NINGUNA decisión cambia: NO HACER EL ESTUDIO.
```

> Regla dura: si no puedes completar la línea "Decisión que cambia", todavía no estás listo para investigar. Una Big Q sin decisión atada es teatro con apariencia de rigor.

---

## 3. EL MOM TEST — las 3 preguntas PROHIBIDAS

El *Mom Test* (Rob Fitzpatrick): haz preguntas que ni tu mamá podría responder de forma sesgada para hacerte sentir bien. Estas tres están **prohibidas** porque invitan a mentir por cortesía:

```
❌ "¿Te gustaría una app que…?"   → todos dicen que sí, no cuesta nada decirlo
❌ "¿Pagarías por esto?"           → predicción hipotética; la gente sobrestima
❌ "¿Usarías esto?"                → opinión sobre un futuro que no ha vivido
```

Reemplázalas por **comportamiento pasado específico**:

| Pregunta MALA (opinión/futuro) | Pregunta BUENA (hecho/pasado) |
|---|---|
| "¿Pagarías por esto?" | "La última vez que tuviste este problema, ¿qué hiciste? ¿Gastaste dinero? ¿En qué?" |
| "¿Te gustaría organizar mejor tu contenido?" | "Cuéntame cómo planeaste tu contenido la semana pasada, paso a paso." |
| "¿Usarías una app para esto?" | "¿Qué herramientas abriste la última vez que hiciste esta tarea?" |
| "¿Es importante para ti este problema?" | "¿Cuánto tiempo/dinero te costó la última vez? ¿Qué pasó después?" |
| "¿Te parece buena idea?" | "¿Cuándo fue la última vez que esto te frenó? ¿Qué hiciste al respecto?" |

**Las 3 reglas del Mom Test:**
1. **Habla de SU vida, no de tu idea.** En cuanto mencionas tu solución, la conversación se sesga hacia agradarte.
2. **Nunca hagas pitch.** Si la persona sabe qué quieres oír, te lo dirá. Tu idea no se menciona hasta el final (o nunca).
3. **Pide hechos del pasado, no opiniones del futuro.** "¿Qué hiciste?" > "¿Qué harías?".

---

## 4. A QUIÉN ENTREVISTAR — reclutar el segmento correcto

Hablar con la gente equivocada produce datos que mienten con más confianza. Recluta por **comportamiento**, no por demografía.

### Screener (máx. 4 preguntas)

```
REGLAS DEL SCREENER:
- El DESCALIFICADOR va PRIMERO (filtra rápido a quien no es del segmento).
- PROHIBIDO sí/no (invita a mentir para entrar). Pregunta abierta o de opción múltiple.
- Filtra por COMPORTAMIENTO, no por demografía ni por intención declarada:
    ✅ "¿Qué herramientas usaste en los últimos 30 días para [tarea]?"
    ❌ "¿Usas apps de [categoría]?"  (sí/no, demográfico, fácil de fingir)

Ejemplo (CM freelance LATAM):
1. [DESCALIFICADOR] ¿Para cuántas marcas/cuentas creaste contenido en los últimos 30 días?
2. ¿Qué herramientas concretas usaste para planearlo? (lista las que recuerdes)
3. ¿Cuántas horas a la semana le dedicas, más o menos?
4. [ARTICULACY CHECK] Cuéntame en 2-3 frases la última vez que se te complicó. (abierta)
```

> **Articulacy check:** la última pregunta abierta no filtra el segmento — anticipa la CALIDAD del informante. Quien responde con un episodio concreto y detallado dará una buena entrevista; quien responde en generalidades dará datos pobres. Prioriza a los articulados.

### REGLAS DURAS de reclutamiento (corrigen los defectos típicos)

```
(a) NO amigos ni audiencia complaciente.
    Quien te quiere bien te dice lo que quieres oír → sesga a agradar.
    Tu audiencia/seguidores ya te compraron el ángulo → no son muestra neutral.

(b) 5 del avatar EXACTO > 30 tibios.
    Cinco personas que VIVEN el problema valen más que treinta que "lo entienden".
    Y si NO consigues 5 del segmento exacto, ESO YA ES UNA SEÑAL:
    el segmento no existe, no es alcanzable, o no es quien crees.
    PROHIBIDO relajar el segmento para llenar cupo ("bueno, este casi califica").
    No es que "tus criterios sean muy estrictos" — es que el mercado te está hablando.

(c) SYNTHETIC USERS / entrevistas simuladas por IA → PROHIBIDAS como evidencia de demanda.
    Un LLM alucina lo que CREE que dirías y valida lo que el fundador ya quería oír.
    Jamás "deja la tarjeta", jamás te frena cuando vas hacia un mal producto.
    Uso permitido: ENSAYAR tu guía o redactar el screener. NUNCA como señal que pasa un gate.
```

---

## 5. GUÍA DE ENTREVISTA — JTBD / SWITCH (Bob Moesta)

El objetivo no es "qué opinas" sino reconstruir el **episodio real** en que la persona contrató una solución (aunque fuera Excel o "no hacer nada"). Estructura en embudo:

```
1. CALENTAMIENTO   → rapport, contexto de su trabajo/vida. Sin mencionar tu idea.
2. CONTEXTO        → "¿cómo es tu semana/proceso normal con [tarea]?"
3. EL EPISODIO REAL→ "llévame a la ÚLTIMA vez que [vivió el problema]. ¿Qué pasó?"
4. PROFUNDIZAR     → las 4 fuerzas + la timeline del switch (abajo)
5. CIERRE          → "¿qué más debí preguntarte?" + (opcional) pedir referidos del segmento
```

### Las 4 FUERZAS del progreso

```
PUSH    → el empuje del problema actual: ¿qué dolía tanto que te movió a buscar algo?
PULL    → el jalón de la nueva solución: ¿qué te atrajo de probar otra cosa?
ANSIEDAD→ el miedo al cambio: ¿qué te frenaba? ¿qué podía salir mal?
HÁBITO  → la inercia del presente: ¿por qué seguías con lo de siempre tanto tiempo?
```

Push + Pull deben superar Ansiedad + Hábito para que ocurra el switch. Si en tus entrevistas el Push es débil, no hay dolor suficiente → no hay venta.

### La TIMELINE del switch

```
PRIMER PENSAMIENTO → EVENTO DETONANTE → BÚSQUEDA ACTIVA → DECISIÓN → PRIMER USO
("un día noté")     ("hasta que pasó X") ("busqué/pregunté")("elegí esto")("la primera vez")
```

Reconstruir esta línea de tiempo revela el momento exacto en que se crea la demanda — ese momento es tu mensaje de marketing y tu trigger de activación.

### PROTOCOLO DE CONDUCCIÓN (anti-sesgo)

```
- REGLA DE LOS 60 SEGUNDOS: tras preguntar, CÁLLATE. El silencio saca el dato real.
- "¿Oh?" como follow-up neutro: invita a seguir sin sugerir respuesta.
- "Cuéntame de UNA VEZ específica": aterriza cualquier generalización ("siempre", "normalmente").
- ESPEJA su lenguaje: usa sus palabras, no las tuyas (no traduzcas su problema a tu jerga).
- NUNCA corrijas: si dice algo "equivocado" o inesperado, eso ES un hallazgo, no un error.
- REFORMULA lo evaluativo: en vez de "¿fue fácil?" (invita a "sí") → "descríbeme cómo fue".
```

---

## 6. SATURACIÓN Y PARADA — cuándo dejar de entrevistar

```
Para a las 5-8 entrevistas del MISMO segmento, O antes si dejas de oír códigos/temas NUEVOS
(saturación). No infles un número arbitrario para sentirte riguroso.

Regla de evidencia: NINGÚN hallazgo se sostiene con menos de 2 fuentes.
Una sola persona diciendo algo es una anécdota, no un patrón.
```

> Si a las 8 entrevistas sigues oyendo cosas nuevas cada vez, el segmento es demasiado amplio o tu Big Q es difusa: estrecha el segmento o afina la pregunta antes de seguir gastando entrevistas.

---

## 7. SÍNTESIS LIGERA — para 1 fundador, no para 50 transcripts

No necesitas un laboratorio de UX. Necesitas convertir citas en decisiones:

```
1. AFFINITY MAPPING: vuelca citas textuales en notas → agrúpalas por tema emergente.
2. UN HALLAZGO = un patrón con ≥2 CITAS TEXTUALES como evidencia (no paráfrasis tuyas).
3. PERSONAS: solo si están ancladas a datos reales de las entrevistas. Nunca inventadas.
4. OPPORTUNITY SOLUTION TREE (Teresa Torres): atado a UN outcome de negocio
   (ej. "activar al CM en su 1ª semana"). Outcome → oportunidades → soluciones → experimentos.
```

### Frameworks de priorización

```
OPPORTUNITY SCORING (Importancia vs. Satisfacción) → para elegir el HUECO DE MERCADO.
   Oportunidad alta = problema MUY importante para el usuario y MAL resuelto hoy.
   Ese gap (importante + insatisfecho) es donde una app nueva puede ganar.

IMPACT / EFFORT → para elegir qué construir en el MVP.
   Alto impacto + bajo esfuerzo primero. Lo demás → V2 (coincide con la regla de features de 01).
```

---

## 8. INSIGHT → DECISIÓN — el puente que cierra cada hallazgo

Un reporte bonito no mueve el producto. Cada hallazgo DEBE terminar en una decisión concreta:

```
HALLAZGO: "[patrón] — evidencia: ≥2 citas textuales"
   → ESTO CAMBIA: [ la promesa | una feature | el precio | el avatar | o es un PIVOT ]

Ejemplo:
HALLAZGO: "Los CM no planean con anticipación; improvisan el mismo día por falta de ideas,
           no por falta de calendario. Citas: '...', '...'"
   → ESTO CAMBIA: el ángulo de la app pasa de 'calendario' a 'generador de ideas' (cambia la PROMESA).
```

Si un hallazgo no cambia nada, o no era un hallazgo, o ya lo sabías. No lo reportes: actúa o descártalo.

---

## 9. HANDOFF AL GATE (02) Y A LA ECONOMÍA (40)

`44` **NO reemplaza el gate de pago de `02`** — lo PRECEDE y lo NUTRE. Entrega tres cosas concretas:

```
(a) EL DOLOR REAL + SU FRECUENCIA  → alimenta la Constitución/avatar de 01.
    Qué problema, en qué situación, cada cuánto. Aterriza las 6 preguntas de la Constitución.

(b) LAS SEÑALES CUALITATIVAS DE DISPOSICIÓN A PAGAR → las CONFIRMA 02 con dinero.
    De las entrevistas sale QUÉ gastan hoy, EN QUÉ, y CUÁNTO (comportamiento pasado).
    Eso te da un RANGO probable de precio.
    44 DETECTA el rango (cualitativo); 02 lo PRUEBA con plata
    (Van Westendorp / pre-orden / fake-door). Una cosa no sustituye a la otra:
    la entrevista te dice "creo que pagarían $X"; el gate te dice "pagaron $X".

(c) EL "TRABAJO A CONTRATAR" (JTBD) → ancla el value-based pricing de 40.
    El job que el usuario quiere resuelto define el VALOR (no el costo) → es la base
    del precio value-based. El rango de WTP detectado aquí entra al modelo unitario de 40.
```

> Orden correcto del flujo: `01` (hipótesis) → **`44` (la pruebas con humanos, sale señal cualitativa)** → `02` (la pruebas con dinero, sale señal de pago) → `40` (verificas que ese precio deja margen) → construir.

---

## 10. ANTI-TEATRO — checklist de cierre

Antes de dar por buena la investigación, responde HONESTAMENTE:

```
[ ] ¿Declaré la DECISIÓN que cambia ANTES de investigar? (Big Q atada, sección 2)
[ ] ¿Pregunté por comportamiento PASADO, no por intención hipotética? (Mom Test, sección 3)
[ ] ¿Hice pitch de mi idea sin querer en algún momento? (si sí → esas respuestas están sesgadas)
[ ] ¿El segmento era el EXACTO? (no amigos, no audiencia complaciente — sección 4)
[ ] ¿Usé HUMANOS reales? (cero synthetic users como evidencia de demanda)
[ ] ¿Cada hallazgo tiene ≥2 citas textuales? (sección 6)
[ ] ¿Cada hallazgo termina en una DECISIÓN? (insight → decisión, sección 8)
[ ] ¿Salí con una señal que CUESTA algo (un número de WTP, un dolor cuantificado, un referido)?
```

> Si marcaste todas: pasa al gate de `02` con munición real. Si fallaste alguna: lo que tienes es teatro, no descubrimiento — y el gate de pago lo va a desenmascarar caro.

---

## CÓMO SE CONECTA

```
01-IDEACION.md         → de aquí sale la HIPÓTESIS de problema y el avatar (la Constitución).
                         44 la valida con usuarios reales ANTES de construir; el dolor + frecuencia
                         que detecta 44 aterriza las 6 preguntas de la Constitución.
02-VALIDACION.md       → 44 PRECEDE y NUTRE el Gate de Demanda. 44 detecta la señal CUALITATIVA
                         (qué gastan, en qué, cuánto); el gate de 02 la CONFIRMA con dinero
                         (Van Westendorp / pre-orden / fake-door). 44 no reemplaza el gate.
40-UNIT-ECONOMICS.md   → el "trabajo a contratar" (JTBD) y el rango de WTP detectado aquí
                         anclan el value-based pricing; el modelo unitario verifica que deje margen.
03-PRINCIPIOS-APP-EXITOSA.md → el momento WOW y la primera victoria salen del dolor real y de la
                         timeline del switch (cuándo se crea la demanda) que descubre 44.
12-FLUJO-AGENTICO.md   → cómo Claude Code conduce esta fase: redactar Big Q, screener y guía,
                         ensayar (no falsear) con simulación, y registrar hallazgos→decisiones en ESTADO.
```
