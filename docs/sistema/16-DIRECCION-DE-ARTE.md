# DIRECCIÓN DE ARTE — De "Correcto" a "Memorable"

> **Cuándo cargar este archivo:**
> - Al inicio de CUALQUIER app, ANTES de escribir código de UI (junto con `14-LEYES-DE-DISENO.md`)
> - Cuando una app cumple las reglas pero se ve sosa, genérica o "segura"
>
> **La diferencia que cubre este archivo:** Las leyes de diseño (archivo 14) son los *guardarraíles* — evitan que algo se vea feo. La dirección de arte es el *gusto* — hace que algo se vea memorable. Una app puede cumplir todas las reglas (jerarquía, espaciado, contraste) y aun así ser olvidable, porque tomó decisiones "seguras". Este archivo enseña a tomar decisiones audaces y cohesivas. La diferencia entre una app que "está bien" y una que la gente quiere mostrar.

---

## ⚠️ PROTOCOLO OBLIGATORIO: LA REFERENCIA DEL USUARIO ES UN CONTRATO

> **Se lee ANTES que todo lo demás de este archivo.** Si el usuario dio una o más imágenes de
> referencia, este protocolo MANDA sobre la capa anti-IA, sobre las tablas de `29-REFERENCIA-VISUAL.md`
> y sobre el catálogo de fuentes. El error real que corrige: el SO diluía la imagen del usuario en
> 3-6 adjetivos y luego la sobreescribía con las tablas por nicho — el usuario recibía otra app.
>
> ⚠️ **Y la referencia se PIDE, no se espera:** antes de proponer CUALQUIER diseño, el agente
> hace LA PREGUNTA DE REFERENCIA (PASO 0 del protocolo del `54`, textual): ¿te propongo yo los
> estilos, o tienes capturas de un diseño que te guste (Pinterest, redes, otra app) para que tu
> app se vea igual? Una captura enviada por esa vía es referencia-mandato con todo este contrato.

### Regla de prioridad

```
1. LA REFERENCIA DEL USUARIO MANDA. La capa anti-IA solo filtra lo que la referencia NO decide
   (p. ej. la referencia fija paleta y modo → la capa anti-IA sigue gobernando espaciado,
   jerarquía y motion, que la imagen no dicta).
2. Las prohibiciones de la capa anti-IA (neón, glow, oscuro, glass…) SOLO se mantienen si lo
   que pide la referencia viola accesibilidad (contraste AA). Si la referencia trae glow o neón,
   se conservan.
3. Anotar en la Ficha: "Referencia del usuario levanta: [prohibiciones X, Y]".
```

**Dos tipos de referencia — no los confundas:**

```
REFERENCIA-MANDATO        La dio el USUARIO (imagen O app nombrada: "quiero que se vea así",
                          "que se parezca a X"). → FIDELIDAD.
                          Clonar su paleta, su mood y su lógica visual está BIEN y es lo
                          esperado: es lo que el usuario contrató. Las tablas de 29 NO aplican.

REFERENCIA-INVESTIGACIÓN  La encontraste tú (Mobbin, App Store, líderes — PASO 0.2bis).
                          → FUSIONAR lo mejor de varias; de UNA sola se destila el
                            porqué, no se clona el hex.
```

### DOCTRINA DE FIDELIDAD (D-E) — el estándar es "es igualita"

La referencia la eligió el usuario POR ALGO. El estándar de éxito es que al ver su app diga
**"es igualita"**. PROHIBIDO "mejorarla", reinterpretarla o aplicarle la capa anti-IA en su
contra — el TEST DE FIDELIDAD mide SIMILITUD con la referencia, no el gusto del agente. Lo que
la referencia NO cubre (pantallas, estados, componentes ausentes) se EXTIENDE con su mismo
sistema, nunca con otro.

**Subcaso APP NOMBRADA ("quiero que se parezca a X"):** el nombre de una app ES una
referencia-mandato de PATRONES, aunque no haya imagen. Investigar X a fondo (web oficial,
App Store/Play Store, screenshots con la herramienta disponible), llenar con ELLA la TABLA DE
EXTRACCIÓN de abajo y replicar su sistema completo (estructura de pantallas, lógica de color,
clase tipográfica, componentes, densidad) lo más similar posible SIN clonar assets, copy ni
marca. La TABLA DE LÍDERES con fusión de 3-5 apps (PASO 0.2bis) es el default SOLO cuando el
usuario NO fijó ninguna referencia.

### TABLA DE EXTRACCIÓN OBLIGATORIA (con referencia-mandato)

**MIRA la imagen con tu herramienta de lectura de imágenes (nunca solo la descripción del
usuario) y llena TODOS los campos; campo vacío = paso no hecho:**

```
Modo:                    claro / oscuro
Fondo:                   #______
Superficie/card:         #______
Texto 1º / 2º:           #______ / #______
Acento(s):               #______ — y DÓNDE aparece en la imagen (CTA, dato, ícono, tab…)
Semánticos visibles:     éxito/error/warning si se ven — #______
Display:                 clase (serif/grotesca/geométrica/redonda…) + 2-3 candidatas de
                         Google Fonts/Fontshare más parecidas
Body:                    clase + 2-3 candidatas
Radio:                   cards __px / botones __px (estimado)
Espaciado base:          apretado / medio / aireado (+ px estimado)
Sombras:                 ninguna / sutil / dura
Bordes:                  sí/no, grosor y opacidad
Textura/grano/gradiente: ______
Gráficos/dataviz:        estilo visible si hay: tipo de gráfico, grid, gradientes
Íconos:                  estilo: line / fill / duotone, grosor
Layout:                  bento / lista / hero+cards / ______
Mood:                    3 adjetivos
Detalle firma:           el gesto concreto de la imagen a replicar
```

El resultado de la tabla se vuelca en `FICHA-ARTE.md` (archivo en la raíz del proyecto de la app —
plantilla en `docs/sistema/PLANTILLA-FICHA-ARTE.md`) y en los tokens de `10-DESIGN-TOKENS.md`
**ANTES de la primera pantalla**.

### ANTES de cerrar la ficha: réplica fiel o interpretaciones fieles (según el tipo de referencia)

La extracción NO cierra la ficha directo. Qué se renderiza depende de QUÉ fija la referencia
(la ruta la define el PASO 0 del `54`):

**Captura de PANTALLA COMPLETA (una UI real: layout, componentes, jerarquía) → RÉPLICA FIEL
ÚNICA.** Se construye `replica-fiel.html` (protocolo del `54`): UN frame de 375px con la
pantalla clave de SU app vestida con el estilo extraído, AL LADO de la captura embebida para
comparar. El estilo NO se toca — se adapta el CONTENIDO (copy, datos, mecanismo de su app);
colores, tipografía, radios, sombras, densidad y composición se replican lo más igual posible.
Pasa el TEST DE FIDELIDAD de abajo ANTES de presentarse, y el usuario aprueba / ajusta / pide
variantes fieles / cambia la captura.

**Referencia PARCIAL (moodboard, paleta, foto de ambiente — no fija la composición) o el
usuario pidió variantes → EL PROTOCOLO A/B/C del `54`:** renderizar 3 **INTERPRETACIONES
FIELES** del contrato — la paleta, el mood y la
tipografía extraídas se respetan en las TRES; divergen SOLO en lo que la referencia NO fija:
COMPOSICIÓN de la pantalla y DISPOSITIVO OWNABLE (+ densidad, profundidad, cards,
microdetalles). Si la referencia fija casi todo y las 3 difieren poco, ESO ESTÁ BIEN: es
exactamente lo que el usuario pidió. Las 3 se entregan
como **página comparativa que el usuario abre y VE** (`direcciones-abc.html` autocontenido o
`/dev/direcciones` — NUNCA solo texto, la ruta va en el mensaje), y se **espera la elección del
usuario** (elige / combina / pide otras 3 / ajusta un detalle). Gates del `54`: fuentes
verificadas en el screenshot (fallback-trampa) + mockups llenos al nivel showcase (el TEST DE
DIVERGENCIA en escala de grises es gate SOLO del caso SIN referencia — aquí jamás se fuerza
divergencia contra el contrato). Ninguna
opción "se aleja" de la referencia. La elegida (o la combinación confirmada) es la que se
vuelca en la ficha y en los tokens. Protocolo completo, formato de presentación y las 4
salidas → `54`.

**En AMBAS rutas, tras la elección viene EL TOUR DE LA APP (`54`, sección final):** el usuario ve
4-5 vistas de su app POR DENTRO con el estilo elegido (`vista-previa-app.html`, nacido del frame
ya tematizado) y confirma, ajusta o repiensa. La ficha NO se cierra sin el tour aprobado.

### ¿Y si el usuario solo DESCRIBE la imagen o pega un link?

```
1. Pídele el archivo — o, si es una URL y existe herramienta de lectura web, ÁBRELA y
   extrae la tabla mirando la imagen real.
2. Si solo hay descripción: llena la tabla desde la descripción, marca en la ficha
   "extracción SIN verificación visual" y pide la captura en cuanto pueda — el TEST DE
   FIDELIDAD queda PENDIENTE hasta tener la imagen real.
```

### TEST DE FIDELIDAD (al cerrar cada pantalla clave)

Screenshot a 375px **AL LADO de la referencia** y verifica:

```
[ ] Mismo modo (claro/oscuro)
[ ] Hue del acento en la misma familia
[ ] Misma clase tipográfica display
[ ] Radios ±4px
[ ] Misma densidad
[ ] Misma lógica de sombras
```

Si fallan **≥2** → corregir tokens y re-renderizar. Reportar la comparación en el cierre.

---

## SI SOLO PUEDES RETENER 15 LÍNEAS (la secuencia mínima operable)

```
1. ¿El usuario dio referencia visual o NOMBRÓ una app ("quiero que se parezca a X")?
   SÍ → es un CONTRATO: extráela con la TABLA DE EXTRACCIÓN de arriba (mirando la imagen,
        no recordando la descripción; si NOMBRÓ una app, investígala a fondo y llena la tabla
        con ELLA — subcaso APP NOMBRADA). El estándar es que el usuario diga "es igualita":
        no se mejora ni se reinterpreta. La capa anti-IA solo filtra lo que la referencia no decide.
   NO → LO QUE YA FUNCIONA (PASO 0.2bis): investiga las 3-5 apps LÍDERES del nicho + 1-2
        gigantes admirados, llena la TABLA DE LÍDERES y FUSIONA lo mejor de cada una (la
        tipografía de una, la lógica de color de otra, las cards de otra). Te diferencias SOLO
        con: 1 dispositivo ownable + composición propia + copy — NO desafinando su paleta (29). PROHIBIDO inventar
        combinaciones que ningún líder use. El par tipográfico sale de las COMBINACIONES
        PROBADAS de 29; arquetipo (0.3) y mundo del sujeto (0.45) afinan la fusión.
2. → 3 opciones A/B/C renderizadas (54, SIEMPRE) → el usuario elige/combina → ficha.
   Con referencia: 3 interpretaciones FIELES. Sin referencia: 3 fusiones distintas de líderes.
   Entregable: página comparativa direcciones-abc.html / /dev/direcciones — NUNCA solo texto.
   Gate SIN referencia: TEST DE DIVERGENCIA (en grises, 3 diseños distintos — no 1 pantalla
   con 3 acentos). CON referencia: divergen solo en lo que el contrato no fija (poco = BIEN).
3. Llena el bloque :root COMPLETO de tokens (10) con la opción elegida — cero placeholders.
4. Vuelca todo en FICHA-ARTE.md (incluida la TABLA DE LÍDERES) antes de la primera pantalla.
5. Renderiza a 375px y corre el test que aplique:
   con referencia → TEST DE FIDELIDAD (arriba)
   sin referencia → tests de intercambiabilidad + genericidad (PASO 5): protegen contra
   clonar UNA sola app — la fusión de varias los pasa.
El resto de este archivo es la profundidad de cada paso — consúltalo, pero esta secuencia
es la que nunca se salta.
```

---

## EL PRINCIPIO RECTOR: Boldness Estratégica

Las apps memorables no son las que evitan errores — son las que toman una decisión visual audaz y construyen un sistema riguroso alrededor de ella. **Elegir un color, una forma o un concepto inesperado, y luego ser absolutamente disciplinado en aplicarlo.**

El error del diseño "hecho con IA" no es la fealdad — es la *cobardía*: azul seguro, gris neutro, gradiente morado genérico. Lo opuesto de memorable no es feo, es **promedio**.

---

## LA CAPA ANTI-IA — restricciones negativas (lo que NO se hace por defecto)

El protocolo PASO 0 deriva una buena dirección, pero sin esta capa el output **se cae igual al look genérico** — porque ese look es el "default estadístico" hacia el que toda IA gravita (las modelos se entrenaron en lo más upvoteado de 2022-2026: oscuro + neón + glass). Esta capa le pone **dientes**: prohibiciones explícitas, no consejos abstractos.

### El look de IA tiene receta — y banderas rojas que lo delatan
**EXCEPCIÓN: si la referencia del usuario contiene estos rasgos, se conservan (ver el protocolo
REFERENCIA=CONTRATO al inicio de este archivo) — solo el contraste AA es innegociable.**
El "huele a IA" no es vago: es una receta concreta (investigación 2026). **Fondo oscuro + acento neón (morado/cian) + todo muy redondeado + tarjeta glass flotante + orbe de gradiente de fondo + glow en los botones.** Si tu propuesta marca **3 o más** de estas, ES el genérico — recházala y re-deriva del PASO 0:
```
🚩 Fondo #000 puro · texto #FFF puro (delata de inmediato)
🚩 Acento neón REGADO (glow en cada botón/ícono, no en UN dato/acción)
🚩 Tarjeta glass/blur SOBRE el contenido + orbe de gradiente de fondo
🚩 Jerarquía por PESO de fuente en vez de por TAMAÑO
🚩 10+ tamaños de fuente / paddings arbitrarios (15px, 23px…)
🚩 El par tipográfico "de moda" sin tratamiento propio (ver PASO 0.6)
🚩 Modo oscuro elegido por reflejo (no derivado del sujeto/arquetipo)
```

### Regla 1 — RESTRICCIÓN NEGATIVA POR DEFECTO (la palanca #1 contra lo genérico)
El brief arranca con PROHIBICIONES, y solo se levantan si el arquetipo + el mundo del sujeto las justifican explícitamente:
> **Por defecto, PROHIBIDO:** morado/cian neón · fondo negro puro · glow en botones · orbe de gradiente de fondo · glass sobre el contenido · "dark + 1 acento brillante" como respuesta automática.
> Se levanta una prohibición SOLO con una razón escrita (ej. "cripto-forajido → el neón ácido SÍ es su mundo"). Acompañar SIEMPRE con una referencia POSITIVA concreta, no abstracta: "cálido como cobre envejecido", "como Linear: grises apagados, acento mínimo", "editorial como una revista impresa". La restricción + la referencia es lo que saca al sistema del camino trillado.

### Regla 2 — EL MODO (oscuro/claro) SE DERIVA, NO SE ASUME OSCURO
Oscuro + acento es **el** default de IA. Muchas apps ganadoras hoy son CLARAS, editoriales, con color real (míralo en cualquier tablero de referencias actual). Elegir oscuro solo si el mundo del sujeto/arquetipo lo pide; si no, **claro/cálido suele ser MÁS distintivo hoy justamente porque casi nadie no-genérico lo hace.** El `29` es "dark-first" como punto de partida, no como obligación — derivá el modo, no lo heredes.

### Regla 3 — TÁCTICAS DE "SE VE DISEÑADO, NO DEFAULTEADO" (Refactoring UI + anti-AI)
```
- Casi-negro CON TINTE (#14141A, #1C1815…), NUNCA #000. Casi-blanco cálido (#F5F2EC, #F5F5F7), nunca #FFF.
- Grises con TEMPERATURA (sesgados al cálido o frío de la marca), nunca gris neutro puro de Tailwind.
- PROFUNDIDAD de 3 niveles: base / elevado (cards, +luz) / hundido (inputs, −luz). El genérico es plano.
- UN acento por viewport. El resto lo carga la jerarquía de TAMAÑO, no más color ni glow.
- 9 tonos por color (100–900), afinados A OJO (la matemática sola no basta — Refactoring UI).
- Glass solo en overlays/menús (blur ~5px), JAMÁS sobre el contenido principal.
```

### Regla 4 — DIFERÉNCIATE A PROPÓSITO (Neumeier, *Zag*)
"Cuando todos hacen oscuro+neón, hacé lo contrario." Una marca memorable es **ownable y diferente**, no bonita-promedio (Marty Neumeier: *una marca es el gut feeling de la persona; la diferenciación es lo que la vuelve recordable*). Test final ENDURECIDO — no basta "¿se distingue de un template?":
> **"¿Este brand kit se distingue de TODA otra app hecha con IA y de las otras apps de este SO?"** Si dos apps distintas del SO podrían intercambiar su paleta+tipografía sin que se note, **ninguna tiene identidad** → volver al PASO 0.45 (mundo del sujeto) y robar algo que SOLO esta app podría tener.

### Regla 5 — UNA IDENTIDAD ES MÁS QUE COLOR + FUENTE
Los ganadores usan también: **fotografía real, ilustración con carácter, grano/textura, un acento INESPERADO, paletas más ricas** (no solo 1 acento sobre gris). Exigir AL MENOS UN dispositivo ownable más allá de "oscuro + 1 acento": una textura sutil, una ilustración, un tratamiento de foto, una 2ª nota de color con intención, una tipografía display con un detalle propio. Sin eso, aunque los hex estén bien, se siente plano y genérico.

---

## PASO 0 — DEL BRIEF AL BRAND KIT (protocolo de derivación)

> **OBLIGATORIO antes de tocar el PASO 1.** No se elige un solo color hasta completar este protocolo. El error #1 detectado en auditoría: el agente colapsa "fitness para mujeres 40+" y "fitness para hombres CrossFit" en el mismo hex porque solo mira el *nicho*. El nicho NO basta — la **audiencia** dentro del nicho cambia toda la dirección de arte. Este paso convierte `{idea + ICP + nicho + competencia}` en `{paleta + tipografía + motion + brand kit}` con un razonamiento trazable, no un default.
>
> La tabla de partida por nicho (`29-REFERENCIA-VISUAL.md`) es el *piso*; este protocolo es el que la dobla según la audiencia. Si no hay ICP claro, se pregunta antes de diseñar.

### PASO 0.1 — INPUTS DEL BRIEF (capturar antes de nada)

No se diseña sin estos tres bloques completos. Si falta el ICP, se pregunta; no se asume.

```
IDEA (1 frase):       qué hace la app + para quién + el resultado que entrega.
                      Ej: "App que arma rutinas de fuerza en casa para mujeres de 40+ sin equipo."

ICP DETALLADO:
  - Género dominante:        femenino / masculino / mixto-neutro
  - Rango de edad:           ej. 38-52
  - Nivel socioeconómico:    C / C+ / B / A (LATAM) — define percepción de "caro" y aspiración
  - Sofisticación digital:   baja (usa 3 apps) / media / alta (early adopter)
  - Estado emocional al abrir la app: ¿llega cansada y culpable? ¿llega con adrenalina?
                             ¿con miedo a equivocarse con su dinero? ¿con un niño llorando al lado?
                             ESTE es el dato que más mueve la dirección de arte y el que la IA salta.

3 COMPETIDORES REALES: nombres concretos del mercado del usuario (no genéricos).
                       Ej: "Sweat, Nike Training Club, app X local de LATAM."
```

El **estado emocional al usar la app** es el insumo que separa dos apps del mismo nicho. "Fitness" para una mujer de 45 que llega agotada y con culpa pide calma y permiso; "fitness" para un hombre de 28 en pre-entreno pide adrenalina y agresividad. Mismo nicho, direcciones opuestas.

### PASO 0.2 — MAPA COMPETITIVO (converger o romper, a propósito)

Mirar los 3 competidores y capturar su patrón dominante:

```
CAPTURAR de cada competidor:
  - Familia de hue del acento (¿todos usan verde? ¿todos azul?)
  - Temperatura general (cálida / fría / neutra)
  - Clase tipográfica (¿todos sans geométricas? ¿todos serif?)
  - Densidad y "energía" (calmado/espacioso vs denso/enérgico)

DETECTAR EL PATRÓN DE CATEGORÍA: el rasgo cromático/tipográfico que comparten 2-3 de ellos.
  Ej. fintech LATAM → casi todos azul + sans geométrica + fondo claro.
```

Luego decidir, **a propósito**:

```
CONVERGER (parecerse al patrón de categoría):
  Cuándo → categoría regulada o de confianza (fintech, salud, seguros), audiencia de
           sofisticación digital BAJA, o producto nuevo que necesita "leerse" como su categoría
           para que el usuario confíe. La señal de pertenencia VALE más que la diferenciación.
  Cómo  → adoptar la temperatura/clase de la categoría PERO ganar en craft y ejecución
           (mejor tipografía, mejor jerarquía, mejor motion), no en color exótico.

ROMPER (diferenciarse del patrón):
  Cuándo → categoría saturada donde todos se ven igual, audiencia de sofisticación ALTA que
           premia lo distinto, o posicionamiento explícito de "el rebelde de la categoría".
  Cómo  → tomar el eje en que todos convergen y moverlo 180° (si todos son azul fríos, ir
           cálido; si todos son sans, ir serif display) — pero UN solo eje, no todos a la vez
           (romper todo = caos, no diferenciación).
```

> Regla: nunca converger ni romper "por reflejo". Cada decisión queda escrita con su porqué en la ficha de salida.

### PASO 0.2bis — LO QUE YA FUNCIONA (obligatorio ANTES de elegir nada)

> **Doctrina (cambio tras prueba real, jul-2026):** el SO derivó para una app de hábitos DOS serifs
> compitiendo (display serif + body serif) y un degradé salvia→durazno que ninguna app grande usa —
> inventó una combinación. **Cuando NO hay referencia del usuario, la identidad se BASA EN LO QUE
> YA FUNCIONA:** se investigan las apps más grandes del nicho, se extrae lo que usan de verdad y se
> FUSIONA lo mejor de cada una. Inventar combinaciones nuevas queda PROHIBIDO. Innovar = elegir
> bien entre lo probado + 1 detalle propio.

**Si el usuario NO dio referencia visual NI nombró una app ("quiero que se parezca a X" =
referencia-mandato de PATRONES — subcaso APP NOMBRADA del protocolo REFERENCIA=CONTRATO, al
inicio de este archivo: se investiga X y se replica SU sistema, no se fusiona), tu PRIMERA
acción es INVESTIGAR:**

```
(a) Las 3-5 apps LÍDERES del nicho EXACTO — con búsqueda web/Mobbin si hay herramienta;
    si no hay ninguna, tu conocimiento de las más grandes: Duolingo, Cal AI, Noom, Headspace,
    Calm, MyFitnessPal, Strava, Notion, Linear, Revolut, Nubank, Spotify, Airbnb, Flo, Fabulous...
(b) 1-2 GIGANTES de consumo admirados por su UI aunque sean de OTRO nicho (para robarles craft).
```

⚠️ La TABLA DE LÍDERES se llena con los líderes del NICHO EXACTO ya identificados en la
validación (los de ESTADO.md, con nombre y MRR) — usar categorías vecinas genéricas ("apps de
hábitos") cuando hay líderes concretos nombrados es una violación del paso.
La app modelo de FICHA-MODELO.md encabeza SIEMPRE la tabla de líderes — es el líder #1 por
definición; los otros 2-4 la complementan.

**TABLA DE LÍDERES (una fila por app — campo vacío = paso no hecho):**

| App | Tipografía real → equivalente Google Fonts/Fontshare | Lógica de color (neutros · acento · ¿degradés? ¿dónde?) | Radius y cards | Navegación | Cómo celebra/gamifica | UN patrón robable |
|---|---|---|---|---|---|---|
| Duolingo (ej.) | Feather Bold, redondeada → Nunito/Baloo 2 | claro, verde marca + multicolor funcional, sin degradés en UI | 12-16px, cards planas con borde inferior grueso | bottom-tabs 5 | racha + cofres + XP con mascota | botón 3D con borde inferior que se hunde al tap |
| ... | | | | | | |

**LA FUSIÓN (cómo se compone el brand kit):**

```
El brand kit se COMPONE eligiendo lo mejor de la tabla — no se inventa:
  - la TIPOGRAFÍA de la que mejor tipografía tiene
  - la LÓGICA DE COLOR (modo, neutros, dónde vive el acento, si hay degradé y dónde) de la
    que mejor color tiene
  - el TRATAMIENTO DE CARDS/radius de otra
  - la forma de CELEBRAR/gamificar de la que mejor retiene
Y se DIFERENCIA solo con 3 palancas (la paleta y la tipografía del líder se toman TAL CUAL,
íntegras y sin perturbar el hue — doctrina ago-2026, fuente única: 29):
  1. UN dispositivo ownable (banco del 54 o propio, compatible con lo que los líderes hacen)
  2. UNA segunda nota de color propia (con intención, dentro del 60-30-10)
  3. El COPY (voz de 11/42)
Fusionar 3+ líderes YA es distintivo — nadie más tiene esa mezcla exacta. El test de
intercambiabilidad (Regla 4) protege contra clonar UNA sola app; NO prohíbe fusionar varias.
```

**REGLA DURA ANTI-INVENTO:**

> **PROHIBIDO usar una combinación (tipográfica, de degradé, de paleta) que NINGUNA app grande
> use.** Si no puedes nombrar al menos una app líder que use algo parecido a lo que estás
> proponiendo, no lo propongas. La novedad NO es un objetivo del brand kit — la conversión sí.

**Regla de herramientas:** si hay navegación/screenshot disponible (MCP de navegador, WebFetch,
Playwright), MIRAR las apps de verdad — no "recordar cómo son". Si NO hay ninguna herramienta,
usar el conocimiento de las líderes listadas arriba y pedir al usuario 2-3 capturas de la app que
admire. Nunca saltarse el paso en silencio.

La TABLA DE LÍDERES se vuelca en `FICHA-ARTE.md` (campo "TABLA DE LÍDERES") y alimenta el resto
del protocolo: 0.5 (la lógica de color sale de la tabla), 0.6 (el par se confirma contra las
COMBINACIONES TIPOGRÁFICAS PROBADAS de `29`) y 0.7 (motion). Los pasos 0.3-0.45 AFINAN la fusión
(qué líder pesa más, qué dispositivo ownable y qué 2ª nota de color propia) — no la sustituyen.

### PASO 0.3 — ARQUETIPO DE MARCA (Jung → 3-5 keywords)

Elegir **1** de los 12 arquetipos de Jung. Es el atajo para que personalidad, color, tipografía y motion apunten al mismo lugar. Conecta directamente con los **3 adjetivos** de `11-DISENO-EMOCIONAL.md`: el arquetipo es el "personaje", los 3 adjetivos son su voz.

```
ARQUETIPO         ESTÉTICA TÍPICA                                          EJEMPLO DE NICHO
Inocente          claro, limpio, optimista, pasteles cálidos               bienestar suave, familia
Sabio             sobrio, editorial, alto contraste, serif transicional    educación, finanzas serias
Héroe             audaz, alto contraste, energía, hue saturado             fitness, retos, deporte
Forajido          oscuro, disruptivo, neón/ácido, tipografía cruda         cripto edgy, marcas reto
Mago              místico, gradientes profundos, violetas, brillo          IA, transformación, wellness premium
Explorador        terroso, aventurero, naturales, sans humanista           viajes, outdoor, hábitos
Amante            cálido, íntimo, sensual, corales/rojos suaves, serif      citas, belleza, lujo personal
Bufón             vibrante, juguetón, alto color, formas redondas          juegos, educación infantil, social
Gente Común       honesto, accesible, neutros cálidos, sans cercana        herramientas cotidianas, marketplace
Cuidador          protector, suave, cálido-confiable, azules/verdes calmos salud, cuidado, seguros
Creador           expresivo, experimental, paletas ricas, display audaz    creadores, diseño, no-code
Gobernante        premium, lujo, dorado sobre oscuro, serif display        fintech premium, B2B enterprise
```

Del arquetipo elegido + el estado emocional del ICP, derivar **3-5 keywords de marca** (adjetivos accionables, no vagos). Ej. arquetipo Cuidador + mujer 45 agotada → `calmado, permisivo, contenido, cálido`. Esas keywords gobiernan los siguientes 4 pasos.

### PASO 0.4 — MOODBOARD + KEYWORDS VISUALES

Reunir **5-8 referencias** (apps, productos, fotografía, packaging — lo que el usuario dio o lo que el agente recuerda del competidor). Si no hay imágenes a mano, **describirlas en texto**: el moodboard puede ser una lista de descripciones precisas, no obligatoriamente imágenes.

De las referencias, extraer keywords visuales en 4 ejes (siempre los mismos 4, para que sean comparables):

```
TEXTURA:      ¿plano y limpio? ¿granulado/papel? ¿vidrio/glass? ¿metálico?
FORMA:        ¿geométrica dura? ¿redondeada/orgánica? ¿angular/agresiva?
DENSIDAD:     ¿aireada y minimal? ¿compacta y rica en información?
TEMPERATURA:  ¿cálida (rojos/naranjas/ámbar)? ¿fría (azules/cian)? ¿neutra?
```

Salida: una línea por eje, ej. `Textura: glass sutil sobre oscuro · Forma: redondeada 20px · Densidad: aireada · Temperatura: cálida`. Esto alimenta directamente PASO 0.45, 0.5 y 0.6.

### PASO 0.45 — MUNDO DEL SUJETO (el 3er eje que vuelve única a la app)

> **OBLIGATORIO antes de elegir color.** El error sutil que sobrevive a los pasos 0.1–0.4: dos apps con la MISMA audiencia y el MISMO arquetipo terminan idénticas porque ambas derivaron solo de `nicho × audiencia`. Falta el tercer eje: el **mundo real del sujeto concreto** del producto. Antes de tocar la paleta, robar identidad del universo material de lo que la app realmente trata — no del nicho genérico.

```
nicho × audiencia × MUNDO DEL SUJETO
  El nicho dice "qué categoría".  La audiencia dice "para quién".
  El mundo del sujeto dice "de qué está hecho ESTE tema en la vida real"
  — y de ahí salen texturas, formas y detalles que ningún otro proyecto del
  mismo nicho tendría.
```

**Procedimiento:** listar **5-8 artefactos / materiales / herramientas / palabras** del mundo real del producto concreto, y derivar de cada uno una decisión de **textura / forma / detalle** (no de paleta — eso viene después).

```
EJEMPLO — App para BARISTAS (nicho: comida/bebida; audiencia: pros del café):
  ❌ reflejo genérico: "cafetería = marrón, taza, vapor". Eso es el nicho, no el sujeto.
  ✅ mundo real del sujeto:
     - cobre de la máquina espresso      → acento metálico cálido, detalle de borde bruñido
     - papel kraft del saco de grano     → textura de superficie con grano sutil
     - términos de tueste (light/city/   → micro-tipografía de etiqueta, nomenclatura real en UI
       full/french)
     - báscula y temporizador de extracción → datos como cronómetro de precisión, mono para cifras
     - curva de tueste / gráfico de extracción → forma de las visualizaciones (curvas, no barras)
     - tono tierra del grano tostado      → familia de neutros con tinte (alimenta 0.5)
```

> **Regla dura adicional — CONTENIDO REAL, JAMÁS lorem ipsum:** diseñar y mirar SIEMPRE con el contenido real del dominio (nombres, cifras, términos, casos verídicos del sujeto). El lorem ipsum oculta los problemas de jerarquía y borra la identidad que este paso acaba de construir. Si no hay datos reales, inventarlos plausibles para ESE mundo — nunca texto de relleno.

Salida: una línea por artefacto, ej. `cobre máquina → borde bruñido cálido · kraft → grano sutil en card · términos de tueste → nomenclatura real en labels`. Esto sesga las decisiones de PASO 0.5 (color), 0.6 (tipo) y 0.7 (motion) hacia algo que solo ESTA app podría ser.

### PASO 0.48 — REFERENCIAS REALES (absorbido por el PASO 0.2bis — LO QUE YA FUNCIONA)

> **Este paso se movió al FRENTE del protocolo.** La investigación de líderes ya no es "un paso
> más" antes del color: es la PRIMERA acción de toda derivación sin referencia del usuario.
> Procedimiento completo, TABLA DE LÍDERES, método de FUSIÓN y regla dura anti-invento →
> **PASO 0.2bis**. Si llegaste aquí sin haberlo corrido, vuelve: sin tabla no se elige nada.

**Matiz que sobrevive aquí — DESTILAR vs FUSIONAR (no los confundas):**

```
DESTILAR aplica a UNA app: si solo miras una líder, clonarla entera es plagio detectable y
  falla el test de intercambiabilidad — de una sola app se destila el PORQUÉ, no el hex.
LA FUSIÓN de varias es EL MÉTODO (0.2bis): de cada líder se toma un subsistema entero
  (su lógica tipográfica, su lógica de color, su tratamiento de cards) tal como funciona,
  y la diferencia la ponen la mezcla + el dispositivo propio + la composición + el copy (la paleta del líder se toma íntegra — 29).
Y si la referencia la dio el USUARIO (imagen o app NOMBRADA: "quiero que se parezca a X"), es
  referencia-MANDATO: clonar su paleta y su mood (o replicar el sistema de X sin sus
  assets/copy/marca) es lo correcto y lo esperado — ver el protocolo REFERENCIA=CONTRATO y el
  subcaso APP NOMBRADA al inicio de este archivo.
```

### PASO 0.5 — MAPEO EMOCIÓN → COLOR (el corazón del protocolo)

Aquí se deriva la familia cromática desde audiencia + emoción + arquetipo — NO desde el nicho a secas. La tabla da el punto de partida; la rampa de luminancia se construye **ya cumpliendo contraste y daltonismo desde el inicio**, no como check posterior.

> **VALIDA la paleta contra los GANADORES del nicho — no la inventes en el vacío** (error detectado al probar el SO: una app de HÁBITOS salió en marrón oscuro + ámbar, que se siente sombría/cafetería, no motivadora). Antes de fijar la familia cromática:
> 1. **Usa la TABLA DE LÍDERES que ya llenaste en el PASO 0.2bis** (si te la saltaste, vuelve: es la primera acción obligatoria) y aplica su LÓGICA de color extraída: ¿claro o oscuro? ¿una nota o multicolor? ¿qué color = éxito/progreso? ¿degradé y dónde? Hay convenciones de género que el usuario ESPERA y que comunican "esto es del nicho X". La familia cromática ES la de la líder con mejor color, **tomada íntegra y sin desafinar** (29 — la perturbación de hue se eliminó en ago-2026: rompía las relaciones que hacían buena esa paleta) — nunca una familia inventada.
> 2. **La paleta debe servir al TRABAJO EMOCIONAL del nicho:** hábitos/bienestar/kids → positivo, energizante, con "victoria visible" (verde=hecho es casi universal — BJ Fogg: un color/estrella motiva más que un número); finanzas → confianza/claridad; productividad → foco/calma. Una paleta "correcta" para el arquetipo pero que se siente del nicho equivocado, FALLA.
> 3. **NO defaultees a "oscuro + 1 acento" para todo** (ver "LA CAPA ANTI-IA"). Muchos géneros ganan en CLARO, multicolor o pastel brillante (hábitos, kids, social). El modo y la riqueza cromática se DERIVAN del nicho+audiencia, no se heredan.
> Test: *"¿un usuario de este nicho, al ver la pantalla 1 segundo, sentiría 'esto es para mí' o 'esto es otra cosa'?"* Si la app de hábitos parece app de café, la paleta está mal aunque los hex sean bonitos.

> **TÁCTICA ANTI-GENÉRICO #1 — DERIVAR DE UNA REFERENCIA CULTURAL, no del selector de tono.** El
> reflejo de toda IA ante "elige un color" es ir al azul/morado seguro (el `bg-indigo-500` de los
> frameworks — la causa raíz documentada del "todo se ve igual hecho con IA"). El antídoto más
> potente: en vez de elegir un HUE abstracto, elegir un MUNDO CULTURAL concreto del que robar la
> paleta entera. Ejemplos: "cabaña de esquí años 70 → naranja quemado, aguacate, marrón cálido,
> crema" · "farmacia japonesa minimalista → blanco papel, un rojo sello, gris tinta" · "cuaderno de
> ingeniería → azul blueprint, papel cuadriculado, grafito". Sale una paleta que NINGUNA otra app
> de IA tendría, porque no salió de un picker sino de un lugar real. Conecta directo con el PASO
> 0.45 (mundo del sujeto): el mundo cultural + el mundo del sujeto son la misma búsqueda. Anotar la
> referencia cultural elegida en la ficha ("Paleta derivada de: ___") — si no hay una, la paleta
> probablemente salió del reflejo genérico.

```
AUDIENCIA / EMOCIÓN          ARQUETIPO     → FAMILIA HUE      TEMP    SATURACIÓN   ENERGÍA
Femenina, bienestar,         Cuidador /    → durazno/coral    cálida  media-baja   baja-media
  llega agotada, busca calma   Inocente       o salvia                 (no pastel infantil)
Masculina, fitness,          Héroe /       → lima/eléctrico   fría-   alta         alta
  pre-entreno, adrenalina      Forajido       o ámbar quemado  neutra  (sobre oscuro)
Mixta, fintech,              Gobernante /  → verde dinero o    fría    media        baja
  miedo a equivocarse, confía  Cuidador       azul profundo            (sobrio, no juguetón)
Infantil/familiar,           Bufón /       → multi-acento     cálida  alta         alta-amable
  juego, llega con un niño      Inocente       cálido + 1 frío          (alto contraste, no estridente)
```

**Reglas duras de la rampa (aplicar al derivar, no al auditar):**

```
1. CONTRASTE AA DESDE EL INICIO: el texto principal sobre el fondo derivado debe dar ≥4.5:1
   (normal) / ≥3:1 (grande y UI). Se elige la luminancia del texto PARA cumplirlo, no se
   "ajusta después". Specs exactas y la fórmula de jerarquía → `14-LEYES-DE-DISENO.md`.
2. DALTONISMO DESDE EL INICIO: nunca depender SOLO de rojo/verde para comunicar estado
   (deuteranopía/protanopía: ~8% de hombres no los distinguen). Todo estado (éxito/error)
   lleva además ícono o forma o texto, no solo color. Si el acento de marca es verde y el
   semántico de error rojo, verificar que se distingan por luminancia, no solo por hue.
3. RAMPA DE LUMINANCIA: del fondo base (el extremo del modo derivado: el más oscuro en dark,
   el más claro en light) mover 2-3 superficies en pasos perceptibles de luminosidad, MISMA
   familia de neutro con tinte hacia el acento (regla "neutros con temperatura" del PASO 1).
   El acento vive a una luminancia que destaque sobre TODAS las superficies, no solo el fondo base.
```

**Matiz cultural LATAM (no asumir convenciones anglosajonas):**

```
- BLANCO: en partes de LATAM se asocia a salud/pureza PERO también a hospital/luto en
  algunos contextos andinos/indígenas. Un fondo blanco clínico puede leerse frío.
- ROJO: pasión/energía/comida (apetito) — más cálido y positivo que el "peligro" anglosajón.
  Sirve como acento de deseo/CTA, no solo como error.
- AMARILLO/DORADO: prosperidad, fiesta, calidez — muy bien recibido; el dorado lee "premium"
  sin caer en el cliché del oro corporativo.
- VERDE: salud/dinero/naturaleza, lectura positiva amplia y segura.
- MORADO/VIOLETA: en algunos países lo asocian a luto/cuaresma (ej. ciertas tradiciones
  católicas). Usar con conciencia en apps de duelo, salud o público mayor.
- NARANJA/TERRACOTA: cercano, popular, cálido — conecta con audiencias amplias sin leerse
  "corporativo frío".
Regla: el matiz cultural ajusta el HUE del acento y los semánticos; el MODO (claro/oscuro)
se deriva aparte (Regla 2) — el matiz no obliga ni a claro ni a oscuro.
```

**Ejemplos concretos derivados (hex de partida — afinar con PASO 1):**

```
X — APP FEMENINA BIENESTAR (Cuidador, mujer 45, agotada, busca calma):
    Fondo #14100E · Superficie #1E1813 · Texto #F2E9E1 / #B0A096
    Acento #E8A07A (durazno cálido, saturación media-baja) · Éxito #7FB59B
    → cálido, permisivo, contenido. NO rosa pastel infantil.

Y — APP FITNESS MASCULINA (Héroe, hombre 28, pre-entreno, adrenalina):
    Fondo #0B0F0E · Superficie #141A18 · Texto #ECF2EF / #8A9A94
    Acento #C6FF3D (lima eléctrica, saturación alta) · Error #FF4D4D
    → audaz, agresivo, alto contraste. Acento como inyección de energía.

Z — APP FINTECH CONFIANZA (Gobernante/Cuidador, mixta, miedo a errar):
    Fondo #0A0C12 · Superficie #12151E · Texto #E9ECF5 / #8088A0
    Acento #3DDC84 (verde solo en saldos/ganancias) · Error #FF6B6B con ícono
    → sobrio, claro, confiable. Converge con la categoría; gana en craft.

W — APP INFANTIL/FAMILIAR (Bufón/Inocente, niño + adulto, juego):
    Fondo #0D1117 · Superficie #172033 · Texto #EAF0FA / #8FA0BC
    Acento #FFB020 (ámbar cálido) + #4FC3F7 (cian) · alto contraste, amable
    → dos acentos, energía alta pero NO estridente; íconos como guía (daltonismo).
```

### PASO 0.6 — SISTEMA TIPOGRÁFICO POR CLASIFICACIÓN (razonar, no listar)

No se elige la fuente de una lista por reflejo — se razona **personalidad → clase tipográfica**, y recién entonces se baja al catálogo concreto de `29-REFERENCIA-VISUAL.md`.

```
PERSONALIDAD / KEYWORD          → CLASE TIPOGRÁFICA           CARÁCTER QUE TRANSMITE
preciso, moderno, técnico-limpio → sans geométrica            exacto, neutro-premium, "diseñado"
cercano, humano, accesible       → sans humanista             cálido, legible, de confianza
audaz, editorial, con actitud    → grotesca                   declarativo, contemporáneo, fuerte
confiable, establecido, serio    → serif transicional         institucional, creíble, "lleva años"
lujo, editorial, aspiracional    → serif display              elegante, caro, distintivo
técnico, dato, código            → mono                       sistema, precisión, "ingeniería"
```

```
PROCEDIMIENTO:
1. De las keywords del arquetipo (PASO 0.3), elegir la CLASE de la DISPLAY (la que carga
   la identidad).
2. Elegir la CLASE del CUERPO (casi siempre una sans legible — humanista o geométrica neutra).
3. Bajar a las COMBINACIONES TIPOGRÁFICAS PROBADAS de `29-REFERENCIA-VISUAL.md` (basadas en
   las apps más grandes): elegir la fila del nicho y CONFIRMARLA contra la TABLA DE LÍDERES
   del PASO 0.2bis — si tus líderes usan otra cosa, manda lo que usan tus líderes.
   Máximo 2 familias (regla 5 de `14`); NUNCA serif+serif ni dos displays fuertes juntas.
4. Prohibiciones de marca (Inter/Roboto/Arial/system-ui) y la nota anti-slop de Space
   Grotesk/Geist → ya viven en este doc (PASO 2) y en `29`. No re-elegir contra ellas.
```

Ej. arquetipo Gobernante + keyword "lujo" → clase **serif display** para display + sans geométrica para cuerpo → en `29`, par "Editorial / lujo" (Fraunces + Hanken Grotesk).

> **OJO — la "rotación fresca" del SO ya se está quemando, pero la frescura NO manda sobre lo probado.** Clash Display, Satoshi, Fraunces, Cabinet Grotesk, Sentient son characterful, pero de tanto recomendarlas se volvieron **el nuevo genérico** (igual que les pasó a Space Grotesk/Geist, ver `29`). Tres reglas, en este orden de prioridad:
> 1. **El par BASE sale de las COMBINACIONES PROBADAS de `29`, confirmado contra la TABLA DE LÍDERES (0.2bis).** Si el par que usan los líderes está "quemado" (ej. Poppins en social), la regla anti-quemada CEDE ante la regla de lo probado — el REGISTRO ANTI-REPETICIÓN de `29` evita repetirlo ENTRE proyectos del SO, que es el riesgo real.
> 2. **La LISTA FRESCA de `29` queda para el DETALLE PROPIO opcional** (la display de la landing, un titular de celebración) — nunca para inventar el par base ni para meter una segunda personalidad fuerte junto a la display.
> 3. **Dale a la DISPLAY un tratamiento propio** para que dos apps con la misma fuente NO se vean iguales: tracking negativo marcado, un peso inusual (no siempre 700), optical size, mayúsculas vs minúsculas, una ligadura/detalle estilístico, o mezclar tamaños con contraste fuerte. La fuente es el 50%; el TRATAMIENTO es el otro 50%.
> **Principio de pareo (cuando dudes):** contraste por CLASE (serif display + sans geométrica = 40-60% más distinción que dos del mismo tipo), o superfamilia (IBM Plex, Source) para cohesión garantizada; x-heights similares cohesionan, clasificación contrastante jerarquiza.

> **NÚMEROS DEL TRATAMIENTO BESPOKE (la palanca que hace que la MISMA fuente se vea de estudio, no
> de plantilla — Refactoring UI + guía de estética frontend de Anthropic):**
> ```
> CONTRASTE DE PESO: usar los EXTREMOS, no el medio tibio. Display 800/900 junto a cuerpo 400,
>   o incluso 200/300 (light) para un display fino y elegante junto a 600 — pero NUNCA 400 vs 600
>   (el salto tímido que grita "default"). El contraste de peso ES la jerarquía.
> SALTOS DE TAMAÑO: 3×+ entre el display y el cuerpo (ej. 40px sobre 16px), no 1.5× (24 sobre 16,
>   que se ve indeciso). Jerarquía por TAMAÑO dramático, no por medio-tono.
> TRACKING POR TAMAÑO (no un valor global): titulares grandes (≥32px) → −0.5 a −2px (apretar, se ve
>   premium); cuerpo (14-20px) → 0 (dejar en paz); labels/mayúsculas → +0.05 a +0.15em (respirar).
> OPTICAL SIZING: activar el eje `opsz` en fuentes variables (Fraunces, Bricolage, Roboto Flex) —
>   el display se aprieta, el cuerpo se abre, gratis. Es "diseño" que la mayoría no activa.
> LINE-HEIGHT: cuerpo 1.5-1.6; display grande 1.0-1.15 (los titulares grandes necesitan MENOS
>   interlineado, no el 1.5 del cuerpo aplicado a todo — otro tell de plantilla).
> ```

### PASO 0.7 — MOTION SIGNATURE (derivar la curva, no copiarla)

De los **3 adjetivos / arquetipo**, derivar la curva de easing y la duración base. El movimiento debe "sonar" como la marca. Los valores exactos (curvas nombradas, rangos de duración, stagger, `prefers-reduced-motion`) ya están en `14-LEYES-DE-DISENO.md` — aquí solo se elige CUÁL usar:

```
KEYWORD / ARQUETIPO        → FIRMA DE MOTION                          REMITE A `14`
enérgico, audaz, Héroe      → spring rápido con overshoot, entradas    --ease-spring, duración baja
                              veloces, feedback de tap marcado          del rango (200-300ms)
sereno, calmado, Cuidador   → ease-out largo y suave, sin overshoot,   --ease-out, extremo alto
                              fades amplios, stagger lento              del rango (300-400ms)
preciso, técnico, Sabio     → ease-out corto y exacto, mínimo          --ease-out, duración media,
                              movimiento, nada de bounce                cero spring
juguetón, Bufón             → spring con bounce visible, entradas       --ease-spring en más lugares
                              con personalidad, celebraciones generosas (con criterio, no en todo)
```

> Regla: la firma de motion se elige UNA vez y se mantiene (cohesión, PASO 4). Un spring de celebración en una app "serena" rompe el universo. Specs y `prefers-reduced-motion` SIEMPRE → `14`.

> **VALORES CONCRETOS DE LA FIRMA (para que "spring rápido" o "sereno" no sean adjetivos vagos —
> se fija UNA tripleta bounce/stagger/duración por app y se documenta en la ficha):**
> ```
> ARQUETIPO / KEYWORD    BOUNCE (spring)   STAGGER (lista)   DURACIÓN BASE   NOTA
> enérgico / Héroe       0.2-0.25          40-50ms           180-220ms       overshoot visible en celebración
> sereno / Cuidador      0-0.1             70-90ms           300-380ms       casi sin rebote; fades amplios
> preciso / Sabio        0 (spring crítico) 30-40ms          160-220ms       cero bounce; exacto y seco
> juguetón / Bufón       0.25-0.35         50-70ms           200-260ms       el único caso donde >0.3 se permite
> ```
> Regla dura: `bounce > 0.3` SOLO en arquetipo juguetón/kids; en todo lo demás delata "demo técnica",
> no craft (ver `41` → SPRING REAL). El stagger es el ritmo de la marca: rápido = enérgico, lento =
> sereno — pero nunca >100ms (se siente lento) ni 0 (se pierde el efecto). Estos son el punto de
> partida; los números finos y las curvas nombradas viven en `14`.

---

### MINI-EJEMPLO TRABAJADO (brief ficticio → brand kit derivado)

```
BRIEF
  Idea: "App que enseña a invertir desde $50.000 COP a jóvenes que nunca invirtieron."
  ICP: mixto con leve sesgo masculino · 22-30 · nivel C/C+ LATAM · sofisticación digital alta
       (vive en el celular) · estado emocional: curiosidad + algo de miedo a "perder su plata"
       + ganas de sentirse adulto/capaz.
  Competidores: Trii, Tyba, una fintech bancaria tradicional local.

0.2 MAPA COMPETITIVO
  Patrón de categoría: azul + sans geométrica + tono institucional (la bancaria) vs. más fresco
  (Tyba/Trii). Decisión: ROMPER el eje "institucional frío" — la audiencia joven lo asocia a
  "el banco de mis papás". Converger solo en la SEÑAL de confianza (claridad, datos sobrios).

0.2bis TABLA DE LÍDERES (miradas, no recordadas — lo que YA funciona)
  Trii → oscuro, verde solo en ganancias, densidad media; robable: el delta diario como héroe.
  Tyba → claro amable, ilustración propia; robable: onboarding que traduce jerga a español simple.
  Revolut (gigante admirado) → una sola grotesk en 2-3 pesos, números tabulares; robable: la
  jerarquía de número héroe. Robinhood (Mobbin) → gráfico de línea que colorea TODO el estado
  (verde/rojo) sin regarlo en la UI.
  FUSIÓN: lógica de color de Trii/Robinhood (oscuro, verde solo en dinero) + lógica tipográfica
  de Revolut (una grotesk segura) + delta héroe de Trii. Ninguna combinación inventada.

0.3 ARQUETIPO
  Sabio (enseña) con un toque de Gente Común (accesible, "para ti que nunca invertiste").
  Keywords: claro, cercano, capaz, sin-miedo, honesto.

0.4 MOODBOARD (descrito)
  Textura: glass sutil sobre oscuro · Forma: redondeada 16px · Densidad: aireada ·
  Temperatura: neutra-fría con un acento cálido para romper.

0.5 EMOCIÓN → COLOR (aplica la lógica de la TABLA DE LÍDERES de 0.2bis)
  Confianza + juventud + LATAM (verde = dinero positivo, seguro): la lógica de Trii/Robinhood
  (verde solo en dinero, oscuro sobrio) — NO el azul institucional, NO una familia inventada.
  Un toque cálido (ámbar) para "humano/cercano" en hitos.
    Fondo #0A0C12 · Superficie #12151E · Texto #E9ECF5 / #8088A0
    Acento #3DDC84 (verde, SOLO en saldos/ganancias y CTA) · Hito #FFC23D (ámbar, cálido)
    Error #FF6B6B SIEMPRE con ícono (daltonismo). Texto verifica AA sobre todas las superficies.

0.6 TIPOGRAFÍA (combinación probada de `29`, confirmada contra los líderes)
  Fila "finanzas" de `29`: grotesk segura tipo Revolut/Nubank → Archivo (display + body en
  2-3 pesos, una sola familia — el patrón #1 de las grandes) o + Instrument Sans de body.
  Coincide con lo que usan los líderes de la tabla → validada. Jamás serif+serif.

0.7 MOTION
  Sabio + cercano → ease-out corto y exacto (--ease-out de `14`), un único spring suave
  reservado a la celebración de "primera inversión hecha". Stagger de entrada en home.

RESULTADO: una fintech educativa que NO se ve como el banco de los papás (rompió el eje frío)
pero SÍ transmite confianza por claridad y datos sobrios (convergió en la señal correcta).
Dos apps de "fintech" con ICP distinto habrían dado hex y tipografías distintos.
```

**OUTPUT — y el paso que falta ANTES de cerrar la ficha: las 3 opciones A/B/C.** (Todo este
flujo presupone que LA PREGUNTA DE REFERENCIA del `54` ya se hizo y el usuario eligió "propónmelo
tú" — con captura del usuario mandaría la RÉPLICA FIEL, no esta derivación.) Con los PASOS
0.1–0.7 derivados, NO se fija una sola dirección: se ejecuta **EL PROTOCOLO A/B/C del `54`** —
3 FUSIONES distintas desde la TABLA DE LÍDERES (qué líder pesa más,
temperatura, modo si el nicho lo permite, dispositivo ownable; las 3 con combinaciones probadas
del 29), renderizadas como mockups reales de la misma pantalla clave a 375px (fuentes
verificadas en el screenshot — fallback-trampa; mockups llenos al nivel showcase), y **se espera
la elección del usuario** (elige / combina / pide otras 3 / ajusta un detalle). Recién entonces se
rellena la ficha de Dirección de Arte (la del bloque "EL FLUJO DE DIRECCIÓN DE ARTE" de este mismo
doc) con la opción elegida. Cada campo de la ficha (paleta, tipografía, modo, regla del acento,
detalles de craft) sale ya derivado de los PASOS 0.1–0.7 + la elección A/B/C — y se añade una
línea de trazabilidad: `Arquetipo: ___ · Keywords: ___ · Converge/Rompe: ___ · Tabla de líderes
(0.2bis): [app → qué tomé] · Combinación probada de 29: ___ · Opción A/B/C elegida: ___`.
Recién con la ficha llena se pasa al PASO 1.

---

## PASO 1: ELEGIR LA IDENTIDAD CROMÁTICA (con audacia)

### El anti-patrón a matar
"Azul porque es seguro / confiable." El azul corporativo por defecto es la bandera blanca del diseño. A menos que haya una razón estratégica real (fintech que necesita transmitir confianza bancaria), elegir un color con personalidad.

### Cómo elegir el acento de marca
El color de acento nace de la personalidad (los 3 adjetivos de `11-DISENO-EMOCIONAL.md`) y del nicho, no del gusto personal:

```
Energía / fitness / acción      → lima neón, naranja eléctrico, magenta
Calma / bienestar / meditación  → verdes suaves, lavanda, durazno apagado, teal
Premium / lujo / finanzas serias → dorado sobre negro, verde esmeralda, azul profundo
Creatividad / juventud          → gradientes vibrantes, duotonos, colores joya
Confianza / salud / banca       → azul (aquí sí), verde para positivo
Tecnología / cripto / futurista → neón sobre negro, cian, violeta eléctrico
```

### El modo se DERIVA — y si salió oscuro, hazlo bien
**El modo (oscuro/claro) NO es un default: se deriva del arquetipo + el mundo del sujeto (Regla 2
de la capa anti-IA y doctrina (d) de DESIGN-CORE).** Dark-first es *frecuente* en algunos nichos
(fitness de alta intensidad, música, cripto, herramientas nocturnas) — no el estándar universal;
claro/editorial suele ser MÁS distintivo hoy. Si el razonamiento (o la referencia del usuario)
derivó OSCURO, estas son las reglas para que no se vea genérico:

```
REGLAS DEL MODO OSCURO (cuando el modo derivado es dark):
- Fondo base: NUNCA #000 puro. Usar un casi-negro CON tinte (ej. rango #0A0A0B–#14141A)
- Probar el acento sobre el fondo base Y sobre las superficies elevadas
- Reducir saturación de los colores de marca 10-20% (vibran demasiado puros sobre oscuro)
- Texto principal: no #FFF puro, sino un casi-blanco (ej. #E8E8EA)
- Elevar superficies con grises MÁS CLAROS, nunca con sombras (las sombras no se ven en oscuro)
(Si derivó CLARO: reglas espejo en 29 → tabla MODO CLARO y en 10 → scaffold light.)
```

### La lección Spotify: "El contenido es el color"
El principio de oro de la restricción cromática: **el acento se usa EXCLUSIVAMENTE para elementos interactivos y datos clave.** En Spotify, el verde solo aparece en botones de play, barras de progreso y CTAs — creando una asociación fortísima entre el color y "tomar acción". Es una clase magistral de restricción estratégica.

Aplicación: si tu acento aparece en el fondo, en los íconos decorativos, en los bordes Y en los botones, no significa nada. Resérvalo. Que cuando aparezca, el ojo SEPA que ahí se actúa.

### Estructura completa de la paleta (5-8 colores)
```
1 PRIMARIO de marca       → el acento audaz (solo en acción/dato clave)
1 SECUNDARIO de apoyo     → para diferenciar elementos, usado con moderación
3-5 NEUTROS               → fondo base + 2-3 niveles de superficie elevada + bordes
SEMÁNTICOS                → éxito (verde), error (rojo), warning (ámbar), info
Cada uno con variante para dark y light → ~20-30 valores totales en el sistema
```

### RESTRICCIÓN CROMÁTICA ESTRICTA (la regla del "menos es más" — no negociable)

El error clásico de la IA: empezar con una paleta y a lo largo de la app ir metiendo 4, 5, 6 colores hasta que todo se ve ruidoso y genérico. La regla mecánica que lo impide:

```
LA REGLA 60-30-10 (proporción de color en pantalla):
  60% → color dominante (el fondo y sus superficies — neutros)
  30% → color secundario (texto, elementos de UI — neutros de otro tono)
  10% → color de acento (SOLO acciones y datos clave) — y NADA más

MÁXIMO DE COLORES "REALES" (sin contar neutros ni semánticos):
  1 acento principal. Opcionalmente 1 secundario si hay razón funcional REAL.
  NUNCA 3+ colores de marca compitiendo. Si aparece un tercer color decorativo → eliminarlo.

LOS NEUTROS NO SON "COLORES LIBRES": fondo + 2-3 superficies + bordes + 2-3 niveles de texto,
  TODOS de la misma familia (mismo tono, distinta luminosidad). No mezclar grises cálidos y fríos.

LOS SEMÁNTICOS SOLO APARECEN EN SU FUNCIÓN: verde solo para éxito real, rojo solo para error
  real, ámbar solo para advertencia. No usar el "verde de éxito" como decoración.

AUDITORÍA OBLIGATORIA AL TERMINAR: contar TODOS los colores usados en la app. Si hay más de
  ~1-2 de marca + la familia de neutros + los semánticos en su función → hay exceso, recortar.
  Recorrer pantalla por pantalla buscando colores que se colaron sin propósito.
```

### Paletas Modernas (huir del "negro + 1 acento" genérico de IA)

El default de toda IA es fondo negro puro + un color de resalto (naranja, azul, morado). Eso es la huella del diseño genérico. Las paletas modernas 2026:

```
MINIMAL NO ES BEIGE NI NEGRO PLANO: el neo-minimalismo usa neutros con CARÁCTER —
  chocolate profundo, salvia, pizarra, piedra, crema imperfecta — que dan calma premium.
  Un fondo "casi negro con un tinte" (azulado, cálido, verdoso) se ve mucho más caro que #000.

NEUTROS CON TEMPERATURA: en vez de gris neutro puro, usar neutros con un tinte sutil hacia
  el acento (si el acento es cálido, neutros ligeramente cálidos). Da cohesión y se siente diseñado.

DUOTONOS: dos colores relacionados en vez de "neutro + acento". Más identidad, igual de limpio.

MESH GRADIENTS (la tendencia premium de 2026): gradientes suaves de varios puntos de luz que
  dan PROFUNDIDAD sin elementos ilustrativos. Úsalos en: el fondo (muy sutil, baja saturación),
  detrás del elemento héroe (un resplandor de color), en cards destacadas. El gradiente como
  parte del diseño, no como textura de relleno. Reglas: baja saturación en fondos para no
  competir con el contenido; que el texto encima siempre mantenga contraste AA.

JEWEL TONES sobre oscuro: esmeralda, zafiro, amatista, rubí apagado — premium y con carácter,
  alternativa elegante al neón.
```

### Gradientes — dónde y cómo (lo pediste, con reglas)
```
- FONDO: un mesh gradient MUY sutil (2-3 puntos de color de baja saturación) en vez de un
  color plano. Da profundidad y vida sin ruido. El contenido encima manda; el fondo susurra.
- DETRÁS DEL HÉROE: un resplandor radial del color de acento detrás del elemento principal
  (el número, el anillo, el CTA) — lo hace "brillar" y crea foco.
- EN DATOS: gradiente en barras/anillos que comunica (lima→ámbar = intensidad), ver archivo 17.
- EN CARDS DESTACADAS: un gradiente sutil en la card del plan recomendado o el dato clave.
- REGLA: el gradiente nunca compite con el contenido. Baja saturación, transiciones suaves,
  siempre verificar contraste del texto encima. Un gradiente chillón se ve más barato que un
  color plano. Sutileza = premium.
```

Todos verificados contra WCAG AA (4.5:1 texto, 3:1 UI). Audacia CON accesibilidad, no en su contra.

---

## PASO 2: TIPOGRAFÍA CON CARÁCTER

La tipografía es donde más cae el diseño genérico. Reglas:

```
- JAMÁS Inter / Roboto / Arial / system-ui como fuente de marca. Son la huella del "hecho con IA".
- Elegir UNA display con personalidad para títulos + UNA sans legible para cuerpo (máx 2 familias).
- La display carga la identidad: ¿geométrica y moderna? ¿con serifa y editorial? ¿condensada y
  enérgica? ¿redonda y amigable? Esta elección define el "tono de voz" visual.
- Contraste de pesos: un título en 700-800 junto a cuerpo en 400 crea jerarquía dramática.
- Letter-spacing negativo (-0.02em a -0.03em) en títulos grandes los hace ver premium y "apretados".
```

Fuentes con carácter (ejemplos, no obligatorios): Clash Display, Cabinet Grotesk, General Sans, Satoshi, Sora, Sentient, Fraunces, Bricolage Grotesque, Unbounded. La elección depende de la personalidad de la app.

> **Nota anti-slop (2026):** **Space Grotesk** y **Geist** se volvieron tan ubicuas en apps hechas con IA que ya no diferencian — pasan de "recomendadas" a "permitidas con criterio" (úsalas por una razón, no por reflejo). Pares tipográficos curados por nicho con su `@import`/`next/font` en `29-REFERENCIA-VISUAL.md`.

---

## PASO 3: DETALLES DE CRAFT (lo que eleva de bueno a increíble)

Estos son los detalles que ninguna regla genérica dicta pero que separan una app cara de una correcta. Aplicar selectivamente, con propósito:

```
GLOW / RESPLANDOR:    SOLO si la dirección de arte lo pide (ficha) o la referencia del usuario
                      lo trae — la capa anti-IA lo prohíbe COMO DEFAULT. Si se usa: un único
                      glow sutil detrás de UN elemento clave (anillo de progreso, número héroe),
                      nunca en botones/íconos regado, y el contenido nunca encima del glow.
                      box-shadow con el color de acento a baja opacidad + blur alto.

GRADIENTES CON DATO:  las barras/elementos de datos pueden llevar un gradiente sutil
                      (ej: lima → ámbar) que es bello Y comunica (intensidad, progreso).
                      No gradiente decorativo: gradiente con significado.

PROFUNDIDAD POR CAPAS: glassmorphism (backdrop-filter: blur) SOLO en capas flotantes que
                      deben sentirse "encima" — barras, overlays, tarjetas destacadas.
                      Nunca en texto de cuerpo.

BORDES SUTILES:       en dark mode, un borde de 1px en blanco a 6-10% de opacidad define
                      las tarjetas con elegancia, mejor que una sombra.

MICRO-DETALLE EN ÍCONOS: el ícono de la marca o los íconos clave pueden tener un toque
                      único (un gradiente, un glow, una forma custom) en vez del set genérico.

RADIO GENEROSO:       bordes redondeados amplios (16-24px en cards) se sienten más modernos
                      y amigables que esquinas duras. Consistencia absoluta en toda la app.
```

Advertencia: estos detalles son sal, no plato principal. Uno o dos por pantalla, en los elementos protagonistas. Si todo brilla y todo tiene gradiente, vuelve a ser ruido.

---

## PASO 4: COHESIÓN — El Sistema Por Encima de la Pieza

Lo que hace que una app se sienta "diseñada por un profesional" es que todo pertenece al mismo universo visual:

```
[ ] El mismo radio de bordes en TODA la app (no 8px aquí y 16px allá)
[ ] El acento se usa con la misma lógica en todas las pantallas
[ ] Los gráficos usan la misma familia de colores que el resto de la UI
[ ] El espaciado sigue la misma escala (múltiplos de 4/8) en todo
[ ] Los íconos son todos del mismo set/estilo
[ ] Las animaciones tienen el mismo "carácter" (todas suaves, o todas enérgicas)
[ ] La tipografía mantiene la misma jerarquía en cada pantalla
```

Una app puede tener una pantalla hermosa y sentirse amateur si la siguiente usa otra lógica visual. La cohesión es lo que comunica profesionalismo.

La cohesión no es estética: la consistencia de marca es la variable con correlación medida a ingresos (+23-33% — Lucidpress/Marq, State of Brand Consistency 2019/21); cada pantalla que rompe el sistema descuenta confianza.

---

## PASO 5: LAS PROHIBICIONES ABSOLUTAS (lista negra anti-slop)

El archivo 14 da las reglas de lo que SÍ hacer; esta es la lista de lo que NUNCA hacer porque grita "hecho con IA". Son los reflejos de primer orden del modelo — los tics visuales que delatan que nadie tomó una decisión. **Si cualquiera de estos aparece sin una razón deliberada, eliminarlo:**

```
1. Franja de color vertical (border-left/right de color, >1px) en cards/alerts como "acento".
2. Texto con gradiente (background-clip: text) en titulares — el cliché #1 de landing-IA.
3. Glassmorphism DECORATIVO (blur en cosas que no flotan). El blur solo en capas realmente
   superpuestas (overlays, barras flotantes), nunca como textura de relleno.
4. La plantilla de "métrica héroe" idéntica en todos lados: número gigante + label + mini-stats
   + gradiente de fondo, repetida en cada card por igual.
5. Grids de cards idénticas repetidas hasta el infinito, sin jerarquía ni variación de tamaño.
6. "Eyebrows" diminutos en mayúsculas con letter-spacing exagerado encima de CADA sección.
7. Marcadores numéricos 01 / 02 / 03 como decoración por defecto en features o pasos.
```

**Lista negra de "looks" genéricos concretos (combos que se ven en todas las demos de IA):**
```
- Crema #F4F1EA + serif + terracota ("startup-boutique" que ya hizo todo el mundo).
- Casi-negro + verde ácido / bermellón como único acento "edgy".
- Reglas hairline tipo periódico + radio 0 + todo gris ("editorial" por default).
```
> Nota sobre crema+serif+terracota: está prohibido como REFLEJO, no como resultado. Si sale de
> la tabla clara de `29` / la matriz audiencia×nicho (paleta tomada tal cual — doctrina ago-2026 de 29)
> y con el porqué anotado en la ficha — o si la referencia del usuario lo trae — es una decisión
> válida, no slop.

> **MATIZ IMPORTANTE — la lista negra NO es absoluta, es contra el REFLEJO.** Los looks de arriba están prohibidos *como default*, no como técnica. Son válidos SI el brief los pide explícitamente o si son una decisión deliberada y razonada en la ficha. El pecado no es usar glassmorphism o un texto con gradiente — es **gastar la libertad de un eje abierto en el default del modelo.** Si el brief dejó un eje libre (p. ej. "el estilo lo decides tú") y el agente lo llena con su reflejo, eso es slop aunque cada pieza pase las reglas. Regla: *"nunca por reflejo en un eje que podías decidir"*, no *"nunca este look"*. Gastá la libertad eligiendo a propósito, no dejándola caer en el promedio.

**EL TEST DEL PRIMER REFLEJO (la prueba anti-slop definitiva):**
> *"Si alguien pudiera identificar esto como hecho-por-IA solo por su categoría visual — sin mirar detalles — entonces falló."* Si la app cae en un look reconocible "de IA", no tomó una decisión: tomó el promedio. Volver al PASO 1 y elegir con audacia.

**TEST DE GENERICIDAD (detecta el reflejo del propio agente):**
> Además del test del logo, hacerse esta pregunta por cada decisión grande (color, tipo, forma, motion): *"¿tomaría yo esta MISMA decisión en otro proyecto del mismo tipo?"* — **Si la respuesta es sí, es un default disfrazado, no una elección.** El test del logo detecta que la app se parece a *otras del nicho*; el test de genericidad detecta que la app se parece a *lo que el agente siempre hace*. El segundo es más insidioso porque el reflejo se siente como criterio. Si tres apps distintas tuyas convergerían en el mismo hex/fuente/curva, no estás decidiendo: estás default-eando. Volver al PASO 0.45 (mundo del sujeto) para romper el empate.
>
> **Cómo se ejecuta (no es introspección — es una verificación):** consulta el REGISTRO
> ANTI-REPETICIÓN (`29-REFERENCIA-VISUAL.md`, sección final): las direcciones ya usadas viven en
> el ESTADO.md de proyectos anteriores y/o en la memoria del agente. Verifica que la paleta
> (familia de hue del acento + modo) y el par tipográfico de ESTE proyecto NO se repitan del
> proyecto anterior. Si coinciden → están vetados: elegir OTRO líder (el vecino, el del modo
> contrario — 29 «divergencia por construcción») u otra candidata de la LISTA FRESCA, o cambiar
> el dispositivo ownable — NUNCA desafinar la paleta — antes de seguir.

---

## PROTOCOLO FALLBACK — 3 LÓGICAS DIVERGENTES (para briefs vagos)

> Nota: este fallback genera las LÓGICAS candidatas cuando el brief es vago; la PRESENTACIÓN y elección final siempre pasan por el PROTOCOLO A/B/C del 54 (renderizadas, elegir/combinar/pedir otras).

> **Cuándo usar:** el brief es vago ("hazme algo lindo", "que se vea moderno", "sorpréndeme") y no hay un eje claro que decidir. El reflejo del modelo ante la vaguedad es colapsar a UNA dirección segura (minimalismo silencioso). Este protocolo lo impide **forzando divergencia**: en vez de proponer una dirección, generar **3 variantes en paralelo con lógicas DISTINTAS**, y dejar que el usuario haga mix-and-match. Dar opciones razonadas = el cliente siente que *contrató a un diseñador*, no que recibió un template.

Idealmente cada variante se genera en un **contexto aislado / subagente** para que no se contaminen entre sí (si comparten contexto, las tres convergen al promedio — justo lo que evitamos). Las tres usan el **MISMO contenido real** del dominio (PASO 0.45); solo cambia la lógica de diseño.

```
① ESTILO FORZADO — romper el sesgo del modelo
   Lógica: tomar deliberadamente un estilo AUDAZ del menú (anexo de abajo) que el modelo
   NO elegiría solo (neo-brutalism, aurora, Y2K, editorial duro...). El objetivo es quebrar
   el imán hacia "el minimalismo seguro". Elegir el estilo PRIMERO, derivar todo desde él.

② REFERENCIA REAL — el mejor del mundo para este caso
   Lógica: buscar (con búsqueda web, verificado) el sitio/app PREMIADO mundial más cercano
   a este caso de uso. Diseccionarlo: ¿qué hace su paleta, su tipo, su layout, su motion?
   Adaptar esa lógica al contenido real del proyecto. No copiar — destilar el porqué.

③ "EL MEJOR ESTUDIO" — presupuesto infinito
   Lógica: preguntarse "¿qué haría Pentagram / Collins / Kenya Hara con este brief y sin
   límite de presupuesto?". Pensar en SISTEMA de marca, no en pantalla: concepto rector,
   gesto tipográfico fuerte, un detalle de craft que nadie más se tomaría el trabajo de hacer.
```

> **Entrega al usuario:** las 3 variantes lado a lado, cada una con su lógica escrita en una línea ("esta rompe el sesgo con X", "esta destila el premiado Y", "esta es la jugada de estudio Z"). Invitar al mix-and-match ("la paleta de ①, la tipo de ③"). Nunca entregar las 3 sin etiquetar su porqué — la divergencia razonada es el producto.

---

## EL FLUJO DE DIRECCIÓN DE ARTE (al inicio del proyecto)

Antes de escribir UI, definir y documentar en el App Brief / ESTADO.md:

```markdown
## DIRECCIÓN DE ARTE — [App]
Referencia(s) visual(es): [imágenes que el usuario dio → TABLA DE EXTRACCIÓN del protocolo
  REFERENCIA=CONTRATO (inicio de este archivo) + "Referencia del usuario levanta: ___"]
Tabla de líderes (PASO 0.2bis, obligatorio sin referencia): [3-5 líderes del nicho + 1-2
  gigantes admirados — por cada uno: tipografía real→equivalente, lógica de color/degradés,
  cards, navegación, celebración, patrón robable] + FUSIÓN: [qué tomé de cada una]
Personalidad (3 adjetivos): [de 11-DISENO-EMOCIONAL]
Modo: dark-first / light-first
Paleta:
  - Fondo base: #______
  - Superficies (2-3 niveles): #______ / #______
  - Acento primario: #______ (uso: SOLO acción/dato clave)
  - Secundario: #______
  - Texto: #______ (primario) / #______ (secundario)
  - Semánticos: éxito #______ error #______ warning #______
Tipografía: Display "______" / Cuerpo "______"
Radio de bordes: ___px (consistente en toda la app)
Detalles de craft a usar: [glow / gradientes con dato / glassmorphism / ...]
Regla del acento: [dónde SÍ y dónde NO aparece]
```

Esta ficha gobierna cada decisión visual posterior. Si una pantalla se desvía de ella, está mal.

---

## TEST FINAL DE DIRECCIÓN DE ARTE

```
[ ] Si quito el logo, ¿la app se distingue de cualquier competidor del nicho?
[ ] ¿El color de acento se siente como una DECISIÓN, no como un default?
[ ] ¿La tipografía tiene personalidad (no es Inter/Roboto)?
[ ] ¿Hay al menos un detalle de craft memorable por pantalla protagonista?
[ ] ¿Todas las pantallas pertenecen al mismo universo visual?
[ ] ¿El acento se usa con restricción (solo acción/dato), no regado por todos lados?
[ ] ¿Un diseñador profesional miraría esto y diría "alguien tomó decisiones aquí"?
```

Si la app pasa estos 7, dejó de verse "hecha con IA" y empezó a verse diseñada.

---

## ANEXO — MENÚ DE ESTILOS NOMBRADOS 2026 (elegir un estilo A PROPÓSITO)

> **Por qué existe:** el PASO 0 elige paleta, tipo y motion — pero el agente sigue tirando, por reflejo, a un mismo "look minimal seguro". Este menú obliga a elegir un **estilo nombrado** como decisión consciente, igual que se elige el arquetipo. No es "qué color", es "qué LENGUAJE visual". Está **sesgado hacia lo audaz a propósito**: el modelo ya gravita solo a lo silencioso, así que aquí se empuja al otro lado. Cada estilo marca si se reproduce **100% en HTML/CSS** o si **exige imagen generada** (3D, partículas, acuarela), y su temperatura.

| Estilo | En 1 línea | Cuándo usarlo | HTML/CSS puro | Temp |
|---|---|---|---|---|
| **Editorial / Brutalism** | Tipografía enorme, reglas duras, grid visible, casi sin color | revistas, portfolios, marcas con voz fuerte, audiencia sofisticada | 100% | audaz |
| **Neo-Brutalism** | Bordes negros gruesos, sombras duras (no blur), bloques de color plano saturado | productos jóvenes/rebeldes, no-code, social, anti-corporativo | 100% | muy audaz |
| **Bento / Linear** | Grid de tarjetas redondeadas de distinto tamaño, cada una un módulo | dashboards, SaaS, landing de features, mostrar mucho sin caos | 100% | neutro |
| **Swiss / Vercel** | Negro/blanco, mucho aire, una tipo grotesca perfecta, cero adorno | dev tools, infra, B2B premium que gana por craft no por color | 100% | neutro-silencioso |
| **Aurora UI** | Gradientes mesh suaves de luz difusa como fondo, glow de color | IA, wellness premium, fintech moderna, héroes con profundidad | 100% (CSS gradients) | audaz |
| **Liquid Glass** | Capas de vidrio con refracción/blur fuerte, transparencias apiladas | OS-like, apps premium 2026, overlays y barras flotantes | ~80% (refracción real pide imagen) | audaz |
| **Neumorphism** | Relieve suave, sombras dobles (claro+oscuro), todo del mismo tono | nichos calmos, audio/hardware-like — usar con MUCHO cuidado (contraste) | 100% | silencioso |
| **Claymorphism** | Formas 3D "de plastilina", redondas, infladas, sombras suaves coloridas | kids, juego, educación, productos amables y divertidos | ~70% (3D real pide imagen) | audaz-amable |
| **Retro-Futurism** | Estética "futuro de los 80", neón, grids sintéticos, cromados | gaming, música, cripto edgy, eventos | ~70% (cromos/3D piden imagen) | muy audaz |
| **Y2K** | Burbujas, brillos, cromado líquido, lime/cyan/magenta, nostalgia 2000 | Gen-Z, moda, social, creadores jóvenes | ~60% (texturas piden imagen) | muy audaz |
| **Organic / Biophilic** | Formas blob, curvas naturales, verdes/tierra, asimetría suave | salud, sostenibilidad, bienestar, agritech, slow-living | ~85% (blobs SVG sí; fotografía no) | neutro-cálido |
| **Memphis** | Geometría caótica 80s, color chillón, patrones, zig-zags | educación infantil, eventos, marcas juguetonas y desinhibidas | 100% (SVG patterns) | muy audaz |
| **Kenya-Hara minimal** | Vacío como protagonista, blanco/papel, mínimo gesto, calma extrema | lujo japonés, editorial silencioso, wellness premium, cosmética | 100% | silencioso |
| **Maximalism / More-is-more** | Color saturado por todas partes, capas, densidad rica, sin miedo | marcas de personalidad, cultura, food, creadores, LATAM cálida | 100% | muy audaz |
| **Glassmorphism clásico** | Cards translúcidas con blur sutil sobre fondo colorido | overlays, paneles flotantes (NO como textura de relleno, ver PASO 5) | 100% (backdrop-filter) | neutro |

> **Cómo usarlo:** en el PASO 0, tras elegir arquetipo y mundo del sujeto, elegir UN estilo de esta tabla y escribirlo en la ficha (`Estilo: ___`). Eso fija el lenguaje visual antes del primer pixel. Si la columna "HTML/CSS puro" dice <100%, planear de antemano qué piezas exigen imagen generada (ver `17`/assets) y si el proyecto puede pagarlas; si no, elegir un estilo 100% reproducible. **Sesgo deliberado: ante la duda, subir un escalón de audacia** — el promedio del modelo ya está cubierto de sobra por el silencio.
