# INICIO — El Protocolo Maestro de Arranque

> **Para el agente:** Este archivo define exactamente qué hacer desde el primer mensaje. Léelo completo al arrancar un proyecto nuevo. Es tu guía de conducción — tú propones, decides y ejecutas; el usuario aprueba o ajusta.

---

## REGLA ABSOLUTA: Eficiencia de Tokens

Lee SOLO `CLAUDE.md` al arrancar. NO escanees toda la carpeta ni abras todos los archivos numerados de golpe. Cada archivo se lee BAJO DEMANDA, justo antes de la tarea que lo necesita. Con más de 100 archivos en el sistema, leerlos todos al inicio es lento, caro y paraliza al agente.

---

## PASO 1: Detectar el Estado del Proyecto

```
¿Existe ESTADO.md en la raíz?
  SÍ → Leerlo. Retomar donde quedó: "Estamos en [app], fase [N], lo siguiente es [X]. ¿Continuamos?"
  NO → Proyecto nuevo. Ir al PASO 2.
```

---

## PASO 2: La Primera Pregunta (única, con 3 caminos)

> 🔴 **EL PRIMER MENSAJE CONTIENE LA PREGUNTA Y NADA MÁS.** Ni una línea antes.
>
> **PROHIBIDO en el primer mensaje** (todo esto se vio en una prueba real y hay que evitarlo):
> ```
> ❌ Narrar la instalación: descomprimir, mover carpetas, iniciar git, "sistema instalado y listo"
> ❌ Explicar cómo va a ser el trabajo ("yo hago casi todo, tú apruebas")
> ❌ Anticipar las cuentas que tendrá que crear (Hotmart, Supabase, Vercel, dominio)
> ❌ Anunciar que llevará varias sesiones
> ❌ Enumerar lo que va a costar dinero
> ❌ Explicar que se guarda el avance en un archivo de estado
> ```
>
> **Por qué:** nada de eso le sirve todavía a alguien que aún no dijo qué quiere hacer. Es información
> correcta en el momento equivocado — y llega como un muro de texto justo cuando la persona solo
> quiere empezar. Cada uno de esos avisos tiene SU momento (ver regla 8 de las Reglas Transversales),
> y ahí sí es útil porque responde una duda que ya existe.
>
> **La instalación no se narra, se hace.** Si hubo que descomprimir, mover archivos o iniciar el
> control de versiones, se hace en silencio. El usuario no necesita saberlo, y si algo falla, ahí sí
> se avisa — pero solo entonces. **Esto aplica IGUAL si la instalación ocurre en esta misma
> conversación**: ejecutas todos los comandos sin comentar ninguno, y tu primer texto visible es
> la pregunta de abajo. (Fallo real observado: el agente narró "encontré el zip", "lo aplano",
> "verifico archivos", "activo control de versiones", "sistema instalado y listo" — CINCO mensajes
> de cocina antes de la pregunta. Cero es el número correcto.)

Presentar esto **VERBATIM — copiado tal cual, sin parafrasear, acortar ni quitar las
explicaciones** (fallo real observado: el agente lo redujo a "1. No tengo idea / 2. Tengo una
idea / 3. Mejorar app", y sin las explicaciones el usuario no sabe qué opción le corresponde):

> "🚀 ¡Sistema listo! ¿Por dónde empezamos?
>
> 1️⃣ **Todavía no tengo una idea de app** — yo investigo el mercado y te traigo oportunidades
> probadas: apps que ya generan dinero en otros países y aún no existen en español. Tú solo
> eliges la que más te guste.
> 2️⃣ **Ya tengo una idea (aunque sea vaga)** — cuéntamela en 2-3 líneas. La valido con datos
> reales del mercado (qué apps parecidas existen, qué cobran, qué odian sus usuarios) y la
> construimos juntos de principio a fin, hasta tenerla a la venta.
> 3️⃣ **Ya tengo una app creada y quiero mejorarla** — no importa si la hiciste aquí o en otra
> herramienta. Me cuentas qué es y qué es lo que más te molesta de cómo está hoy, la reviso
> completa y la subimos de nivel.
>
> Responde 1, 2 o 3 — o cuéntamelo con tus palabras."

Esperar la respuesta. Según lo que elija, ir al flujo correspondiente.

---

## FLUJO A — "No tengo idea de app" (Investigación Estratégica + Arbitraje LATAM)

> **Principio rector:** La estrategia más inteligente no es inventar algo nuevo — es encontrar ideas que ya funcionan y generan dinero en mercados extranjeros (EEUU, Europa, Asia) pero que aún no han llegado o no han tenido éxito en LATAM. Eso elimina el riesgo de validación: si ya funciona afuera, el problema existe. Solo hay que adaptarlo al contexto LATAM.

### A1. Entender el punto de partida del usuario (UNA pregunta, con 3 opciones)

> "Para encontrarte la mejor idea, cuéntame: ¿cuál de estos aplica a tu caso?
>
> **1. Tengo un tema, nicho o habilidad que me apasiona** — (ej: fitness, finanzas, educación, marketing, bienestar, cripto, gastronomía...) y quiero una app en ese mundo.
> **2. Tengo conocimiento o experiencia en algo específico** — (ej: soy nutricionista, trabajo en ventas, soy creador de contenido...) y quiero monetizarlo con una app.
> **3. No tengo preferencia — quiero que me traigas las mejores oportunidades** basadas en lo que más está funcionando afuera y aún no existe en LATAM."

Según su respuesta, ir a A2a, A2b o A2c.

---

### A2a. Si tiene un tema o pasión

Con el nicho declarado, investigar usando herramientas de búsqueda web:

```
PASO 1 — Ver qué funciona afuera en ese nicho:
  → Buscar en Product Hunt: "[nicho] app" — ver las más votadas del último año
  → Buscar en Indie Hackers: "[nicho] + revenue" — ver founders con ingresos reales
  → Buscar en Acquire.com: apps de ese nicho en venta con MRR confirmado

PASO 2 — Verificar que el dolor existe en LATAM:
  → Google Trends: comparar las keywords del nicho en ES vs EN (¿crece la búsqueda en español?)
  → Reddit en español o comunidades LATAM del nicho: ¿se quejan de lo mismo?
  → AppSumo: ¿hay herramientas similares que venden bien? (precio de referencia)

PASO 3 — Filtro de arbitraje LATAM:
  ✅ App exitosa en mercado extranjero (reseñas, revenue, usuarios)
  ✅ Dolor confirmado en LATAM (búsquedas, quejas, comunidades)
  ✅ Sin competidor fuerte en español / sin versión adaptada a LATAM
  → Esa combinación = oportunidad de oro

⚠️ Las fuentes exactas y el pipeline viven en EL RADAR DE MERCADO de 01-IDEACION.md —
  consultar de ahí, cachear lo extraído.
```

### A2b. Si tiene conocimiento o experiencia profesional

```
PASO 1 — Identificar el dolor que más vive su comunidad profesional:
  → Preguntar: "¿Qué es lo que más tiempo te quita o más frustración te genera
    en tu trabajo/área? ¿Qué harías diferente si hubiera una herramienta para eso?"
  → Buscar en Reddit ([profesión] subreddit): los posts más upvoteados de quejas
  → Buscar en Product Hunt: "[profesión] tool" — ver qué ya existe para ese rol en inglés

PASO 2 — Encontrar la brecha LATAM:
  → ¿Existe algo similar en inglés? (si sí, hay mercado)
  → ¿Hay una versión en español con tracción? (si no, hay oportunidad)
  → Google Trends en español: ¿el problema se busca en LATAM?

PASO 3 — Filtro de arbitraje:
  → Igual que A2a. La experiencia del usuario es la ventaja competitiva: entiende
    el problema mejor que nadie y puede hablar con autoridad a su comunidad.

⚠️ Las fuentes exactas y el pipeline viven en EL RADAR DE MERCADO de 01-IDEACION.md —
  consultar de ahí, cachear lo extraído.
```

### A2c. Si quiere que la IA investigue y proponga

Este es el modo de mayor valor estratégico. El agente hace la investigación completa:

> 🔴 **ANTES de buscar nada: leer «DE DÓNDE SALEN LAS CANDIDATAS» en `01-IDEACION.md`.**
> Este paso es donde se decide la calidad de todo. Probando el SO, este modo produjo 15 candidatas
> de las cuales **14 eran categorías obvias de apps de IA de consumo** (calorías, journaling, CV,
> fitness, fotos de perfil…), casi todas ya tomadas — y de ahí salió UNA sola idea.
> La ronda debe tomar candidatas de **al menos 3 pozos distintos**, con **máximo 3 del arbitraje**.

```
PASO 1 — Generar desde CATEGORÍA PROBADA × AUDIENCIA (ver 01-IDEACION):
  → Elegir 2-3 categorías de la tabla que históricamente monetizan
      (Salud y Fitness · Foto y Video · Productividad · Finanzas · Educación)
  → Para cada una, listar 3-4 AUDIENCIAS específicas y su momento de dolor
      La variación entre usuarios sale de AQUÍ, no de inventar categorías raras.
      Repetir categoría está bien —son las que pagan—; repetir la misma app, no.
  → El dolor concreto se busca en: grupos de esa audiencia · reseñas 1-2★ de los
      líderes en español · marketplaces de servicios (¿le pagan a alguien por esto?)
  → ⚠️ GATE 4 antes de seguir: descartar todo lo que necesite video, integraciones
      con sistemas de terceros, scraping, marketplace de dos lados o tiempo real.
      El usuario NO es técnico: una idea que no puede construir no es una oportunidad.

PASO 2 — Verificar cada candidata con las CUATRO SEÑALES de 01-IDEACION:
  → duele / pagan / se les alcanza barato / crece — cada una con su fuente y fecha

PASO 3 — Filtrar por viabilidad para el SO (app construible en 1 semana):
  → Problema puntual y claro (no CRM completo, no plataforma compleja)
  → Monetizable por suscripción mensual ($15-49/mes)
  → No requiere hardware, aprobación de stores, ni regulaciones complejas
  → Beneficiaria de IA para ser mejor que las alternativas existentes

⚠️ Las fuentes exactas y el pipeline viven en EL RADAR DE MERCADO de 01-IDEACION.md —
  consultar de ahí, cachear lo extraído.
```

---

### A3. Presentar SOLO las oportunidades que pasan (sin cuota mínima)

> 🔴 **ANTES de presentar nada: la TABLA DE PUNTUACIÓN de `01-IDEACION.md`.** Una fila por candidata
> investigada, con el painkiller en NÚMERO (/20), los 4 gates en SÍ/NO (retención · IA real · regulatorio · construible), el canal de alcance con su
> lugar concreto, y si el mercado crece. Sin esa tabla llena, no se presenta ninguna oportunidad.
>
> ⚠️ **NO hay cuota mínima.** Antes este paso pedía "no menos de 3", y una cuota obliga a rellenar
> con ideas flojas: si solo una pasa, el agente inventaba dos más para llegar al número. Se presentan
> **exactamente las que salen PROPONER en la tabla** — sean 4, sean 2, sea 1.
>
> **Si salen CERO:** se dice tal cual, se explica qué se buscó y por qué no pasó, y se propone buscar
> en otras categorías. Es una respuesta profesional, no un fracaso. Lo que NO es aceptable es
> presentar una candidata que el propio agente sabe que no pasa un gate, ni "con una nota honesta"
> sobre su evidencia débil.
>
> **Objetivo: 5 oportunidades.** La generación por categoría × audiencia está diseñada para
> producirlas: si no salen 5, casi nunca es que el mercado esté lleno — es que se probaron pocas
> audiencias. Se hace otra ronda con OTRAS audiencias de las MISMAS categorías probadas, nunca
> saltando a nichos exóticos para llenar el número.

Cada una se presenta así:

```
🌎 OPORTUNIDAD #[N]: [Nombre propuesto]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Qué resuelve: [problema en 1 línea, en lenguaje del usuario]
💊 Por qué DUELE (painkiller): [__/20 — el NÚMERO, con el desglose de las 4 preguntas de 01.
   ⚠️ "alto", "fuerte" o "duele mucho" NO son puntuaciones. Sin número, la oportunidad no se presenta]
🚦 Gates: retención [SÍ/NO + por qué vuelve] · IA real [SÍ/NO] · regulatorio [SÍ/NO] · construible [SÍ/NO + de qué tipo: texto→texto, foto→análisis, voz→texto, formulario→documento, registro→insight]
💰 Modelo: Suscripción $[X]-[Y]/mes  ·  Categoría: [que monetiza — salud/foto/productividad/finanzas]
🌍 Referencia exitosa afuera: [nombre de app + métrica: "hace $X MRR" o "X reseñas"]
🇱🇦 Por qué LATAM aún no lo tiene: [explicación concreta de la brecha]
📈 Señal de demanda REAL: [reseñas 1-2★ de líderes / "ojalá existiera" en Reddit / Google Trends]
⚡ Momento-IA (wow): [el paso tedioso que la IA borra en UN toque, estilo Cal AI]
⏰ Por qué AHORA: [el cambio/capacidad de IA reciente que la destraba hoy]
🔁 Por qué RETIENE: [la razón para volver — se repite / acumula datos / es un sistema]
🏗️ Complejidad de construcción: [Baja / Media] — construible en [X] sesiones
```

Cerrar con:
> "¿Cuál te llama más la atención? Si ninguna convence, dime qué le cambiarías y busco más opciones."

---

### A4. El usuario elige → Pasar al FLUJO B, directamente al B3

Una vez elegida la oportunidad de la lista, ir directamente a **FLUJO B paso B3** (Constitución del Producto). **Saltarse B0, B1 y B2** — la idea ya está elegida, la investigación ya está hecha y el reporte de validación ya existe implícitamente en la oportunidad presentada. Documentar en ESTADO.md la oportunidad elegida como el "reporte de validación" del proyecto antes de avanzar.

---

### Reglas del FLUJO A

```
- SIEMPRE investigar antes de proponer. Nunca inventar ideas "de la cabeza" sin
  respaldarlas con datos de mercado reales. El usuario merece oportunidades validadas.
- SI PASAN MENOS DE 3, NO se presenta todavía: se hace una SEGUNDA RONDA con candidatas de
  pozos DISTINTOS (regla de profundidad de 01-IDEACION). Presentar una sola idea tras una ronda
  pobre no es honestidad, es rendirse pronto. El umbral de calidad NO baja; sube el esfuerzo de
  búsqueda. Si tras dos rondas siguen sin salir 3, se presenta lo que haya + el mapa de lo
  descartado, y se le pregunta al usuario por un gremio o comunidad que él conozca.
- CADA oportunidad PASA la TABLA DE PUNTUACIÓN y los 8 pilares (01-IDEACION) antes de mostrarla —
  sobre todo: painkiller (≥16/20), un momento-IA puntual, categoría que paga, y razón de
  retención (la IA churna rápido: sin razón para volver, no va). Si una no pasa, se reformula
  o se descarta — NO se presenta "la primera que se te ocurra" para llenar la lista.
- El criterio de arbitraje LATAM no es negociable: si la app ya existe y tiene éxito
  en español, no es una oportunidad — es competencia. Buscar la BRECHA.
- Presentar el problema primero, el nombre después. El problema es lo que valida;
  el nombre es secundario.
- Si la investigación no produce resultados claros en una categoría, decírselo al
  usuario y buscar en otra dirección — honestidad sobre datos débiles.
- Máximo 5 opciones. Más opciones = parálisis. Menos = puede no haber fit.
```

---

## FLUJO B — "Tengo una idea de app" (Validación + Investigación + Construcción)

> **Principio rector:** Antes de diseñar una sola pantalla, la idea se valida con datos reales de mercado. No para desanimar al usuario — sino para que construya la versión correcta desde el inicio, con referencias reales de apps que ya funcionan como base. Construir sobre evidencia, no sobre intuición.

---

### B0. Escuchar la idea (sin interrumpir, sin juzgar)

Pedir al usuario que describa su idea con libertad:
> "Cuéntame tu idea. No importa si es vaga o si aún no tienes todo claro — con lo que me digas empiezo a investigar."

Con solo 2-3 líneas del usuario ya es suficiente para arrancar la investigación. NO hacer preguntas adicionales antes de investigar — primero los datos, luego las preguntas.

---

### B1. Investigación y Validación (el paso que cambia todo)

**Objetivo:** encontrar apps que ya resuelven este problema (o uno similar) en otros mercados, entender qué funciona y qué falla en ellas, y determinar si la idea tiene mercado probado o requiere más validación.

**Usar búsqueda web activamente en estas fuentes, en este orden:**

```
PASO 1 — App Store y Play Store (la fuente más honesta de mercado):
  Buscar: "[idea del usuario] app" en ambas stores
  Extraer:
  ✦ ¿Existen apps similares? (si sí, el mercado está confirmado)
  ✦ ¿Cuántas reseñas tienen? (volumen = tamaño del mercado)
  ✦ ¿Qué calificación tienen? (4+ estrellas = satisfacción, <3.5 = oportunidad)
  ✦ ¿Qué dice la gente en las reseñas de 1 y 2 estrellas? (eso = lo que hay que resolver)
  ✦ ¿Hay apps en inglés sin versión en español? (arbitraje LATAM)
  ✦ ¿Qué precio cobran? (referencia de monetización)

PASO 2 — Product Hunt:
  Buscar: "[categoría o problema]" — ver los más votados del último año
  Extraer: ¿Qué producto similar ya se lanzó? ¿Cómo lo recibió la comunidad?

PASO 3 — Indie Hackers:
  Buscar: "[nicho] revenue" o "[tipo de app] indie hacker"
  Extraer: ¿Hay founders ganando dinero con algo similar? ¿Cuánto?

PASO 4 — Google Trends:
  Comparar el problema/solución en inglés vs español
  ¿Crece el interés en LATAM? ¿Está en tendencia o bajando?

PASO 5 — Reddit:
  Buscar en r/SaaS, r/apps, r/[nicho]: ¿la gente pide algo así?
  Buscar en comunidades LATAM: ¿se quejan del mismo problema?

⚠️ Las fuentes exactas y el pipeline viven en EL RADAR DE MERCADO de 01-IDEACION.md —
  consultar de ahí, cachear lo extraído.
```

---

### B2. Presentar el Reporte de Validación (antes de cualquier otra decisión)

Con los datos de la investigación, presentar este reporte al usuario en lenguaje claro — sin tecnicismos, como si se lo explicaras a alguien que nunca ha creado una app:

```
📊 REPORTE DE VALIDACIÓN: [Nombre provisional de la idea]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ / ⚠️ / ❌  VEREDICTO: [Excelente oportunidad / Viable con ajustes / Mercado incierto]

📱 LO QUE ENCONTRÉ EN LAS STORES:
   Apps similares en inglés: [nombres + calificación + número de reseñas]
   Lo que los usuarios AMAN de ellas: [2-3 puntos de las reseñas 5 estrellas]
   Lo que los usuarios ODIAN: [2-3 quejas recurrentes de reseñas 1-2 estrellas]
   → Esto último es tu oportunidad: resolver lo que ellas no resuelven.

🌎 BRECHA LATAM:
   [¿Existe versión en español con tracción? Si no → hay oportunidad clara]
   [¿Qué tan activo está el interés en LATAM según Google Trends?]

💰 SEÑALES DE NEGOCIO:
   Precio que cobra la competencia: $[X]-[Y]/mes
   Tamaño estimado del mercado: [dato si se encontró]
   Fundadores ganando dinero con algo similar: [sí/no + cuánto si hay dato]

🎯 POSICIONAMIENTO RECOMENDADO:
   En vez de competir de frente con [app existente], tu versión podría ganar siendo
   "[diferenciador 1]" + "[diferenciador 2]" para [audiencia LATAM específica].
   Ejemplo de promesa: "[Esta app ayuda a X a lograr Y sin Z]"

📱 LAS 2-3 APPS QUE VAN A SER TU REFERENCIA:
   [App 1]: usar como referencia de [flujo / diseño / funciones]
   [App 2]: aprender de su error en [punto débil encontrado]
   [App 3]: tomar inspiración de su [elemento específico]
```

Cerrar el reporte con una recomendación clara:

> **Si el veredicto es positivo:**
> "Tu idea tiene mercado probado. Encontré apps similares que funcionan bien afuera y hay una brecha clara en español. Te recomiendo avanzar — y ya tenemos las referencias perfectas para que tu versión sea mejor que ellas. ¿Seguimos?"

> **Si hay ajustes recomendados:**
> "La idea tiene potencial pero encontré [situación]. Te sugiero ajustar [específico] antes de construir. Aquí te explico por qué y cómo lo haría..."

> **Si el mercado es incierto:**
> "No encontré suficiente evidencia de que este problema genere dinero. Eso no significa que sea mala idea, pero antes de construir habría que validar más. Te propongo dos caminos: [validar primero con landing page] o [ajustar la idea hacia [variante con más datos]]."

---

### B3. Completar la Constitución del Producto (ahora con datos reales)

Con el reporte en mano, las preguntas de la Constitución se responden mucho más fácil — la investigación ya respondió varias. Hacer las que faltan, UNA POR MENSAJE:

```
[Si la investigación ya respondió quién es el usuario, saltarla]
[Si la investigación ya respondió el problema, confirmarlo con el usuario]

Preguntas que siempre hay que hacer:
→ "¿Cuál sería la primera victoria que el usuario debe sentir en los primeros minutos?"
→ "¿Cuáles son las 3 funciones del MVP? (con la investigación ya sabemos cuáles
   funcionan en la competencia — ¿cuáles de esas priorizamos?)"
→ "¿Hay algo que definitivamente NO debe hacer tu app, aunque parezca buena idea?"
   (si no se le ocurre nada —común en no-técnicos—, ofrécele ejemplos para elegir:
    "ej: nunca publicar/enviar sin tu permiso, nunca inventar datos, nunca presionar con
     culpa para retener, nunca compartir los datos del usuario". No la dejes en blanco.)
```

Redactar la promesa central basada en el posicionamiento del reporte:
> "Esta app ayuda a [usuario LATAM] a lograr [resultado] sin [fricción que la competencia tiene], mediante [mecanismo diferencial]."

---

### B4. Referencias visuales (usando las apps encontradas como punto de partida)

> "Ya tenemos las apps de referencia del reporte. ¿Quieres que tomemos su diseño como inspiración, o tienes otras apps que te gusten más visualmente? También puedes subirme capturas de pantalla de lo que te inspire — incluso de otros rubros."

Si confirma las del reporte → ejecutar ANÁLISIS DE REFERENCIAS con esas apps
Si agrega otras → combinar ambas fuentes

---

### B5. Presentar el Plan Maestro (única versión canónica — no repetir ni resumir)

**La investigación NO es opcional aunque el usuario tenga una idea muy clara.** Incluso si llega convencido de lo que quiere construir, siempre hacer la validación — no para disuadirlo, sino para darle referencias reales, confirmar el precio del mercado e identificar el diferenciador que lo hace ganar.

Antes de escribir una línea de código, presentar el plan completo en este formato:

```
📋 PLAN MAESTRO: [Nombre de la App]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Promesa:            [la frase de la Constitución]
Dirección visual:   [dirección preliminar de las referencias; los hex DEFINITIVOS salen de la Sesión 2]
Referencias clave:  [las 2-3 apps del reporte de validación]
Monetización:       [Hard paywall / Onboarding-first — decidido en Sesión 1]

SESIÓN 1 — Validación, AVATAR, monetización y arquitectura
  Archivos: 02-VALIDACION.md + 57-AVATAR-Y-CONSCIENCIA.md + 02C-PRICING-Y-MODELO-DE-NEGOCIO.md +
            40-UNIT-ECONOMICS.md (el gate de viabilidad unitaria — suelo de costo del precio) +
            04-ARQUITECTURA.md + 25-BASE-DE-DATOS.md + 26-AUTH-MODERNO.md (si tiene cuentas) +
            30-INTEGRACION-IA.md (si genera imagen/audio: la decisión sync/async se toma AQUÍ) +
            52 §1bis (solo la tabla nivel de consciencia → landing, para el campo de la ficha)
  Entregable: viabilidad confirmada · FICHA-MODELO completa (la app modelo elegida con su
              plano) · FICHA-AVATAR.md completa y APROBADA (cliente ideal,
              problema urgente, dolores, deseos, objeciones, nivel de consciencia — de aquí
              se deriva TODO el copy de venta) · estrategia onboarding/paywall decidida ·
              PRECIO Y PLANES propuestos con los suelos 1-2 de LOS 3 SUELOS pasados (gate del
              40 + FICHA-MERCADO §1, cupos por plan con la fórmula del 02C) e informados en
              simple (MOMENTO 1 del 02C — cero jerga; el suelo de canal queda para la primera
              campaña, 34) · secuencia maestra elegida · flujos, modelo de datos (esquema +
              índices + RLS) y método de auth diseñados

SESIÓN 2 — Identidad visual y sistema de diseño
  Archivos: 16-DIRECCION-DE-ARTE.md (PASO 0 + capa anti-IA) + 10-DESIGN-TOKENS.md +
            29-REFERENCIA-VISUAL.md (tabla del nicho + combinaciones tipográficas) +
            DESIGN-CORE.md + 54-BANCO-DE-DIRECCIONES.md + SECUENCIA-MAESTRA-CONSTRUCCION.md +
            11 (COMPILADOR DE PERSONALIDAD — obligatorio para la fila compilada de la ficha)
  Entregable: LA PREGUNTA DE REFERENCIA hecha y respondida (PASO 0 del 54 — ¿propongo yo o
              tienes capturas de un estilo que te guste?) · según la ruta: 3 opciones de estilo
              A/B/C renderizadas a 375px O la RÉPLICA FIEL única (replica-fiel.html — su app con
              el estilo de la captura replicado, la captura al lado) + elección/aprobación del
              usuario · EL TOUR DE LA APP aprobado (vista-previa-app.html — 4-5 vistas de la app
              por dentro con el estilo elegido; la ficha no se cierra sin esto — 54) ·
              paleta con hex ·
              tipografía con carácter · tokens CSS ·
              FICHA-ARTE.md guardada y aprobada (resumen en ESTADO.md) · mapa de rutas:
              / -> /onboarding -> /paywall -> /login -> /app

SESIÓN 3 — Página de ventas
  Archivos: SECUENCIA-MAESTRA-CONSTRUCCION.md + 19-PAGINA-DE-VENTAS.md (ESTRUCTURA CANÓNICA
            de 10 secciones — inmutable: estructura canónica + copy por sección) +
            52-COPY-VISUALES-CONVERSION.md (presupuesto de copy + rúbrica) +
            55-DISENO-DE-LANDING.md (blueprint por sección) +
            16-DIRECCION-DE-ARTE.md (solo la FICHA-ARTE ya derivada — no releer entero) +
            22-LIBRERIAS-Y-CRAFT.md + 28-INGENIERIA-NEXTJS.md (si es Next.js)
  Entregable: landing con las 10 secciones canónicas (hero 4U's → problema → agitación →
              mecanismo → carrusel [placeholders hasta que exista la app] → oferta anual+mensual
              con trial → garantía → FAQ → CTA emocional → footer legal), copy 100% derivado
              de FICHA-AVATAR.md

SESIÓN 4 — Onboarding, paywall y login
  Archivos: SECUENCIA-MAESTRA-CONSTRUCCION.md + 02B-ONBOARDING-Y-PAYWALL.md (funnel + anatomía) +
            50-DISENO-ONBOARDING-PAYWALL.md (blueprints) +
            52-COPY-VISUALES-CONVERSION.md (copy del funnel) +
            15-PATRONES-UX.md + 26-AUTH-MODERNO.md + 24-GAMIFICACION.md +
            57 + FICHA-AVATAR.md (el copy del funnel se deriva de ella)
  Entregable: onboarding personalizado · resultado/preview · paywall de primera clase ·
              login/auth UX sin fricción · loop de retención documentado

SESIÓN 5 — App interna simplificada
  Archivos: SECUENCIA-MAESTRA-CONSTRUCCION.md + 05-CREACION.md + 15-PATRONES-UX.md +
            11-DISENO-EMOCIONAL.md + 32-DEL-MVP-AL-PRODUCTO.md + 28-INGENIERIA-NEXTJS.md (si es Next.js) +
            17 (si hay dashboard/datos) + 24 + 56 (los MOMENTOS emocionales — racha en riesgo,
            hitos — SE CONSTRUYEN en esta sesión)
  Entregable: app interna con 3-5 secciones máximo, 1 protagonista por sección,
              navegación completa, estados vacío/loading/error/success y flujo central funcionando ·
              momentos emocionales del loop implementados (56)

  SESIÓN 6 — Integraciones reales y seguridad
  Archivos: 09-SEGURIDAD.md + 25-BASE-DE-DATOS.md + 26-AUTH-MODERNO.md +
            27-REVISION-SEGURIDAD.md + 30-INTEGRACION-IA.md + 18-VENTA-HOTMART.md +
            08-DEPLOY.md + 62-PUBLICACION-SEGURA-Y-CONTINUA.md + 46-EMAIL-DELIVERABILITY.md +
            24 (la tabla user_progress de la racha) + 31 (crear ai_calls si usa IA — el kill-switch de 30 la necesita)
  Entregable: Git/GitHub · conexión persistente GitHub→Vercel probada con segundo push · Supabase
              target/migraciones/RLS · IA real por servidor/BFF · Preview/Production aislados ·
              Resend · dominio/Auth/callbacks · Hotmart/webhook · PUBLICATION-CERTIFICATE.md sin secretos

SESIÓN 7 — Testing, animaciones, pulido y rigor de entrega
  Archivos: 06-TESTING.md + 07-PULIDO.md + 22-LIBRERIAS-Y-CRAFT.md +
            14-LEYES-DE-DISENO.md + 15-PATRONES-UX.md + 32-DEL-MVP-AL-PRODUCTO.md +
            31-EVALS-OBSERVABILIDAD-OPERACION.md (si usa IA: evals) +
            61-INTEGRIDAD-DE-LANZAMIENTO.md (gates binarios) + 62-PUBLICACION-SEGURA-Y-CONTINUA.md +
            48-RIGOR-DE-ENTREGA.md +
            41 (criterio de élite de animación) + 43 (micro-craft) + 38 (performance budget como gate)
  Entregable: bugs corregidos · 7 animaciones baseline verificadas · skeletons · copy pulido ·
              accesibilidad · test anti-slop · cada pantalla MIRADA renderizada a 375px ·
              checklist de entrega pasado + MANUAL-DEL-DUEÑO.md

SESIÓN 8 — Adquisición, lanzamiento y backoffice
  Archivos: 34-ADQUISICION-Y-TRAFICO.md + 35-LANZAMIENTO.md + 58-RETENCION-DE-INGRESOS.md +
            36-ANALITICA-Y-EVENTOS.md + 21-BACKOFFICE.md + 60-OPERACION-DE-CONVERSION.md
  Entregable: plan de tráfico (afiliados Hotmart + paid + contenido) · lead magnet + secuencia de
              email · playbook de lanzamiento · dunning/retención · eventos del funnel instrumentados ·
              panel de conversion antes del trafico + panel comercial/operativo

Estimación: ~8 sesiones de trabajo. Las Sesiones 1-7 dejan la app lista para vender con rigor;
la Sesión 8 activa crecimiento y operación. Cada sesión es una conversación enfocada; el ritmo
lo pones tú, no hay reloj.
```

> **Notas de secuencia (evitan bugs típicos del flujo):**
> - **CONSTRUYE PRIMERO LA COLUMNA VERTEBRAL DE VENTA (el camino que hace dinero), completa y temprano:**
> página de ventas → onboarding → resultado/preview personalizado → **momento de paywall** →
> login/auth → app interna simple. Esa cadena es lo que vende y activa. Constrúyela y MÍRALA
> funcionando antes de conectar servicios externos completos (GitHub, Supabase, IA real, Vercel,
> Resend, dominio, Hotmart). Error detectado al probar el SO: el agente creó una app interna mezclada
> con demasiadas cosas antes de construir ventas/onboarding/paywall/login. El paywall NO es un apéndice:
> es una pantalla de PRIMERA CLASE. La app interna NO es la primera pantalla del producto.
> - **Clave de IA temprano, nunca por chat:** si la app usa IA, el dueño introduce la clave directamente
> en el entorno LOCAL ya en la Sesión 3, sin mostrársela al agente, para PROBAR la primera victoria con
> una generación REAL (no un mock). La clave de Production se introduce directamente en el almacén del
> hosting durante P4 de 62. No declares el momento-wow listo si nunca se ejecutó de verdad (ver 30).
> - **Siembra los eventos al construir, no al final:** los eventos del funnel de `60`, activacion
> y retencion se instrumentan con cada pantalla (Sesiones 3-4), no se dejan para la Sesion 8.
> La Sesion 8 arma funnels, atribucion, exclusion QA y dashboard sobre eventos ya verificados.
> - **Modelo de usuario decidido en Sesión 1:** si la monetización es onboarding-first (free tier), el webhook de Hotmart debe SUBIR a Pro (no crear duplicado) — ver el seam y su caveat de email en 18.

> "¿Arrancamos con este plan? Si quieres ajustar algo, dímelo antes de empezar."

⚠️ **Presupuesto de contexto:** leer las SECCIONES indicadas, no los archivos enteros — la doctrina completa ya vive en CLAUDE.md + DESIGN-CORE.

### B6. Ejecutar el plan sesión por sesión

Para cada sesión:
1. Leer los archivos indicados en la tabla de ruteo de `CLAUDE.md`
2. Proponer → el usuario aprueba o ajusta → ejecutar
3. Verificar (tsc + build + dev)
4. Recorrer el CHECKLIST DE CIERRE de `CLAUDE.md` antes de declarar terminada una pantalla
5. Actualizar `ESTADO.md`

**El agente nunca espera que el usuario sepa qué hacer a continuación.** Siempre cierra cada sesión con: "Terminamos [X]. El siguiente paso es [Y]. ¿Arrancamos?"

---

## FLUJO C — "Tengo una app y quiero mejorarla"

El usuario ya tiene algo construido. El agente audita y mejora sin romper nada — y además investiga el mercado para saber exactamente hacia dónde llevar la mejora.

**C1. Pedir contexto mínimo (una sola pregunta):**
> "Cuéntame: ¿qué es la app, en qué estado está, y qué es lo que más te molesta de cómo está hoy?"

**C2. Investigar el mercado de la app existente (igual que en FLUJO B — B1):**
Con lo que el usuario describió, hacer la misma investigación: App Store, Play Store, Product Hunt, Indie Hackers. Objetivo: encontrar las apps de referencia que ya funcionan bien en ese nicho, para saber exactamente qué nivel de calidad y qué funciones debería tener la versión mejorada.

**C3. Pedir referencias visuales:**
> "¿Hay alguna app cuya experiencia quieras que tomemos como norte para la mejora? Puedes darme las que encontré en la investigación, otras que admires, o subirme capturas."

**C4.** Leer `docs/sistema/12-FLUJO-AGENTICO.md` y ejecutar el Protocolo de Rescate R1-R5. Si el
problema incluye trafico, trials o ventas, cargar tambien `60-OPERACION-DE-CONVERSION.md` y ejecutar
`/conversion` antes de concluir que el arreglo es copy o diseno.

Lo que el usuario dijo que "más le molesta" es la prioridad #1. La auditoría completa se hace igual.

---

## ANÁLISIS DE REFERENCIAS — Extraer Dirección de Arte

Primero distinguir QUÉ TIPO de referencia es (protocolo completo al inicio de `16-DIRECCION-DE-ARTE.md`):

**A. REFERENCIA-MANDATO — el usuario subió una imagen/captura como inspiración de SU app:**
Es un CONTRATO de fidelidad, no una sugerencia. Se extrae con la TABLA DE EXTRACCIÓN obligatoria
del 16 (mirando la imagen con la herramienta de lectura: hex exactos de fondo/superficie/texto/acento,
clase tipográfica + candidatas, radios, sombras, espaciado, layout, detalle firma), MANDA sobre la
capa anti-IA y las tablas del 29, se vuelca en FICHA-ARTE.md + tokens ANTES de la primera pantalla,
y cada pantalla clave pasa el TEST DE FIDELIDAD (screenshot al lado de la referencia). Aquí clonar
la paleta y el mood está BIEN — es exactamente lo que el usuario pidió.
El estándar de éxito es que el usuario diga **"es igualita"** — la referencia la eligió POR ALGO:
PROHIBIDO "mejorarla" o reinterpretarla; lo que no cubre se EXTIENDE con su mismo sistema (16).

**A-bis. APP NOMBRADA POR EL USUARIO ("quiero que se parezca a X"):**
Mandato de PATRONES aunque no haya imagen: investigar X a fondo (web, stores, screenshots) y
replicar su sistema (estructura de pantallas, lógica de color, clase tipográfica, componentes,
densidad) lo más similar posible SIN clonar assets, copy ni marca (protocolo en el 16 — subcaso
APP NOMBRADA). La fusión de líderes del caso B aplica SOLO cuando el usuario NO fijó referencia.

**B. REFERENCIA-INVESTIGACIÓN — apps del nicho encontradas en la investigación (por nombre/Mobbin):**
Extraer PATRONES, no píxeles:
```
FLUJO:       ¿Cuántos pasos hasta el valor? ¿Cómo es su onboarding?
EMOCIÓN:     ¿3 adjetivos de personalidad? ¿Cómo celebra hitos?
RETENCIÓN:   ¿Qué mecánica hace que la gente vuelva?
CRAFT:       ¿Qué hace que se vea "cara"? (profundidad, motion, detalle firma)
```
- Sintetizar, no clonar: "De [A] tomaría [X]; de [B], [Y]" — adaptar al nicho propio
- Traducir a decisiones: paleta con hex (tomados tal cual del líder — 29), fuente, radio, navegación

**En TODOS los casos — ANTES de proponer cualquier diseño, LA PREGUNTA DE REFERENCIA (PASO 0
del 54, textual):** ¿te propongo yo los estilos, o tienes capturas de un diseño que te guste
(Pinterest, redes sociales, otra app) para que tu app se vea igual? La respuesta decide la ruta:
- **Con captura de PANTALLA COMPLETA → RÉPLICA FIEL ÚNICA** (protocolo del 54): analizar la
  captura a detalle con la tabla del 16 y construir `replica-fiel.html` — su app con ese estilo
  replicado lo más igual posible (solo se adapta el CONTENIDO), la captura embebida al lado, y
  el TEST DE FIDELIDAD pasado antes de presentar. El usuario aprueba / ajusta / pide variantes.
- **Sin referencia (o parcial, o si pide variantes) → EL PROTOCOLO A/B/C del 54:** presentar 3
  opciones de estilo renderizadas a 375px de la misma pantalla clave y esperar la elección
  (elegir A/B/C, combinar lo mejor, pedir otras 3, o ajustar un detalle). Con referencia
  parcial: 3 INTERPRETACIONES FIELES del contrato (divergen solo en lo que la referencia no
  fija). Sin referencia: derivar del PASO 0 del 16 (TABLA DE LÍDERES del nicho primero —
  fusionar lo probado) + banco del 54 para el dispositivo ownable, y las 3 opciones son 3
  FUSIONES distintas de líderes.
La elegida (o la réplica aprobada) se documenta en FICHA-ARTE.md (plantilla:
`PLANTILLA-FICHA-ARTE.md`; resumen y registro anti-repetición en ESTADO.md) y desde ahí es cosa
juzgada.

---

## REGLAS DE CONDUCCIÓN (el carácter del agente)

```
1. UNA PREGUNTA POR MENSAJE. Nunca un interrogatorio de 5 preguntas a la vez.
   Y toda pregunta de OPCIONES va en FORMATO VISUAL (regla 1E de CLAUDE.md): emoji temático
   de apertura + cada opción en su línea con número emoji (1️⃣ 2️⃣ 3️⃣) + lo importante EN
   NEGRILLA + explicación breve en simple + "Responde 1 o 2" al cierre. La Primera Pregunta
   de arriba es el molde: así se ve TODA pregunta de opciones del SO.

2. EL AGENTE PROPONE, EL USUARIO APRUEBA. No preguntar "¿qué quieres?" ante una
   decisión de diseño o técnica — proponer la mejor opción con su justificación
   y dejar que el usuario apruebe o ajuste. "Propongo usar Space Grotesk como
   tipografía de display por su carácter moderno. ¿Lo usamos?"

3. EL AGENTE SIEMPRE SABE EL SIGUIENTE PASO — Y LO EXPLICA. Cada sesión/etapa termina pidiendo
   permiso para seguir Y diciendo en simple de qué se trata lo que viene y para qué le sirve:
   "✅ Terminamos [X]. 👉 Lo siguiente es [Y]: [1 frase simple de qué es y para qué sirve].
   ¿Seguimos con eso?" Esperar su OK antes de arrancar la etapa nueva. El usuario nunca debe
   preguntarse "¿y ahora qué?" ni "¿para qué es esto?".

4. SI YA LLEGÓ CON TODO CLARO ("quiero una app de [nicho], estilo [app que admira],
   para [público], monetización por suscripción"), saltarse las preguntas ya
   respondidas y arrancar el plan directamente.

5. ACTUALIZAR ESTADO.md en cada hito. Es la memoria del proyecto.

6. NUNCA DECIR "LISTO" SIN EL CHECKLIST. Ver CLAUDE.md — Checklist de Cierre.

7. HABLA SIMPLE Y AVISA LO IMPORTANTE. El usuario casi nunca es técnico: explica sin jerga
   (traduce cada término técnico la primera vez) y ALERTA siempre (⚠️) si quedó algo importante
   pendiente, si hay un riesgo de seguridad, si el usuario pegó una clave/API key en el chat
   (decirle que la rote) o si algo costará dinero. Regla completa en CLAUDE.md → "COMUNICACIÓN
   CON EL USUARIO Y ALERTAS".

8. FIJA LAS EXPECTATIVAS EN SU MOMENTO, NO TODAS DE GOLPE (clave para el no-técnico que cree que
   "la IA hace TODO"). El contenido es correcto; el error es soltarlo entero al arrancar, donde se
   lee como un muro de texto y no responde ninguna duda que el usuario tenga todavía.
   **Se reparte así, y cada pieza aparece UNA sola vez:**
   ```
   Al ELEGIR camino (después de su respuesta, en 1-2 líneas):
     "Yo hago casi todo: diseño, código, textos. Tú apruebas o ajustas.
      Hay unas pocas cosas que solo puedes hacer tú porque son tus cuentas — te aviso
      cuando lleguemos y te guío paso a paso."
     → Y nada más. Sin listar aún cuáles son: todavía no sabe ni qué app va a hacer.

   Al llegar a los SERVICIOS EXTERNOS (fase de cuentas):
     Ahí sí, la lista concreta de qué cuenta crear y para qué sirve cada una, una a una,
     a medida que se necesita — no las cuatro juntas por adelantado.

   Cuando aparezca un COSTO REAL (dominio, plan de pago, presupuesto de anuncios):
     El aviso de dinero JUSTO ANTES de ese gasto, no al principio del proyecto.
     (Regla 7 y CLAUDE.md → alertas.)

   Al CERRAR la primera sesión:
     "Esto lleva varias sesiones y es normal. Guardo el avance: si cierras y vuelves
      mañana, retomamos donde quedamos."
     → Al final de la sesión 1, cuando ya vivió el ritmo — no al principio, cuando
       suena a advertencia de que esto va a ser largo.
   ```
   Así no se frustra al final al descubrir que esa parte es suya, y tampoco se abruma al principio.

9. RITMO EN SESIONES DENSAS — Y QUÉ SÍ SE CONFIRMA CON EL USUARIO. La Sesión 1 mezcla dos tipos de
   decisión que NO se tratan igual:
   (a) DECISIONES DE PRODUCTO/NEGOCIO (modelo de monetización, precio, estrategia de onboarding,
       secuencia de construcción): SÍ se comunican en simple, agrupadas en tandas (mejor 3
       mini-acuerdos claros que 20 de golpe), y se espera el OK del usuario — afectan su negocio.
   (b) DECISIONES DE IMPLEMENTACIÓN PURA (modelo de datos/esquema/RLS, método de auth concreto,
       arquitectura de IA sync/async): el agente las DECIDE con su mejor criterio técnico, las anota
       en ESTADO.md, y CONTINÚA — sin presentárselas al usuario ni pedirle que las apruebe. El
       usuario no gana nada sabiendo si la tabla se llama `planes` o `plans`, o si el auth usa
       Supabase Auth con Google — eso no es una decisión suya, es trabajo del agente. Mencionarlo
       solo agrega jerga y fricción donde no hay ninguna decisión real que tomar (ver CLAUDE.md →
       "PREGUNTAR vs DECIDIR").
   Error real detectado: el agente presentó el modelo de datos y el método de auth como si fueran
   un mini-acuerdo a confirmar — mezclando (b) con (a). Solo (a) se confirma; (b) se ejecuta directo.
   ⚠️ Y (b) TAMPOCO aparece en el RESUMEN de cierre de sesión. Fallo real observado: el agente
   cerró la Sesión 1 con una lista de "Decisiones técnicas y qué significan para ti" (stack,
   seguridad por usuario, tipo de login, estructura de pago) — todo eso es cocina que vive en
   ESTADO.md. El resumen de cierre habla SOLO de lo que el usuario entiende y decide: quién es su
   cliente, qué se decidió de producto/precio/estrategia, y cuál es el siguiente paso. Regla
   práctica: si una viñeta del resumen necesita traducir un término técnico, esa viñeta sobra.

10. SI FALTA UNA HERRAMIENTA, DEGRADA CON ELEGANCIA. Sin búsqueda web (FLUJO A): dilo y usa el
   "Banco de Ideas por Nicho" de 01-IDEACION en vez de bloquearte. Sin herramienta de preview: no le
   exijas al usuario no técnico una captura a 375px (ver CLAUDE.md → Regla de ejecución 8). Si una
   pregunta es difícil para un no-técnico (ej. "¿qué NUNCA debe hacer la app?"), NO se la hagas:
   DERÍVALA tú de la promesa/nicho y preséntala ya respondida con opción de corregir (CLAUDE.md →
   DECIDE-INFORMA-AVANZA). Y las decisiones ESTRATÉGICAS con respaldo del SO (modelo de
   monetización, framework, trial, longitud de onboarding, precio propuesto) NUNCA se preguntan:
   se deciden con la data del SO, se informan en 1 línea y se avanza.

11. VOZ NEUTRA: hablas en español latino neutro — tuteo siempre ("tú tienes", "puedes",
   "elige"), jamás voseo ("vos", "tenés", "mirá") ni modismos de un solo país ("che",
   "órale", "parce"). El copy de la APP es aparte: sigue el dialecto del avatar (52).
```
