# CHANGELOG — Sistema Operativo (SO)

Registro de cambios del **propio sistema documental** (no de las apps que construye con él).
Formato basado en [Keep a Changelog](https://keepachangelog.com/) (simplificado) + [SemVer](https://semver.org/lang/es/).

**Cómo versionar este SO (semver):** **MAJOR** = cambio de proceso o de estructura (rompe cómo se usa el sistema: sesiones, ruteo, núcleo obligatorio). **MINOR** = doc/pilar nuevo o ampliación con compatibilidad hacia atrás. **PATCH** = correcciones (typos, refs rotas, IDs de modelo, fences, coherencia interna).

---

## [6.10.0] — 2026-08-31

**MINOR: EL GLOSARIO DEL MENSAJE AL USUARIO (regla 1F) — cero jerga improvisada, cero
tecnologías anunciadas.** El agente decía "landing", "hero" y contaba el stack del proyecto a
alumnos que aún no manejan esos términos. Dos raíces: no había tabla CERRADA de traducción
(cada mensaje improvisaba), y los propios textos de ejemplo del SO usaban la jerga (la misma
lección del voseo: el agente imita lo que los documentos le muestran).

### Added
- **Regla 1F en CLAUDE/AGENTS (COMUNICACIÓN):** glosario cerrado de 12 traducciones
  (landing→"tu página de ventas", hero→"la parte de arriba de tu página", paywall→"la pantalla
  de planes", onboarding→"el recorrido de inicio", CTA→"el botón principal", deploy→"publicar
  tu app en internet", checkout→"la página de pago de Hotmart", trial→"la prueba gratis"…) —
  esos términos NO aparecen en mensajes al usuario. + LAS TECNOLOGÍAS NO SE ANUNCIAN (van a
  ESTADO.md; ejemplo ❌/✅ embebido) con la ÚNICA EXCEPCIÓN bien definida: cuando el usuario
  debe HACER algo sobre el servicio (crear cuenta, conectar, autorizar, pagar) se nombra con
  su traducción de una frase; y si el usuario pregunta, se le responde con gusto. + REGLA
  ESPEJO: si el usuario usa el término primero, se le sigue (su vocabulario manda).
- **Mini-glosario del alumno en GUIA-DE-LOS-PROMPTS:** "Palabras que quizá veas por aquí" —
  7 términos explicados en una línea, porque los títulos de algunos botones los usan.
- **Vigilante en audit-so.sh** (glosario en CLAUDE + GUIA — 50 checks) y **fila en el MAPA**.

### Fixed
- **La jerga de los propios ejemplos del SO:** el ✅ de la regla 1C decía "hago la landing
  completa" → "hago tu página de ventas completa"; el filtro 1D ahora manda reemplazar por la
  traducción del glosario.
- **7 textos VISIBLES del kit A/B/C** (los lee el usuario al abrir la comparativa): los rótulos
  "hero de la landing" → "Así se vería la página que vende tu app" (×3); las descripciones de
  opción con jerga de diseño ("serif display", "grid 2×2", "layout") → reescritas en lenguaje
  del usuario con marcador de reemplazo (×3); la cabecera "direcciones estructuralmente
  distintas" → "tres estilos de verdad distintos". El 54 ahora exige las 2 líneas de cada
  opción según el GLOSARIO ("di qué SIENTE y qué VE").

## [6.9.0] — 2026-08-30

**MINOR: EL TOUR DE LA APP — el estilo se confirma viendo la app POR DENTRO, no en abstracto.**
Elegir mirando UNA pantalla es aprobar una promesa; el tour convierte la elección en una
confirmación con los ojos y captura los "mmm, no me convence" cuando ajustar cuesta minutos,
no en la semana 3.

### Added
- **EL TOUR DE LA APP (54, cierre del protocolo — ambas rutas convergen aquí):** elegida la
  opción del A/B/C (o aprobada la réplica fiel), ANTES de fijar la ficha se construye
  `vista-previa-app.html`: 4-5 vistas de la app por dentro con el estilo aplicado — la
  pantalla principal/ritual diario (M0), una pantalla del onboarding, el PAYWALL y 1-2 vistas
  del mecanismo en acción — cada una con su rótulo en lenguaje del usuario. Barato por diseño
  (Regla Dura #0): nace DUPLICANDO el frame ya tematizado, conservando el marcador abc-v2;
  mismos gates (fallback-trampa, cero emojis, mockups llenos con tab bar, screenshot
  verificado). Pregunta 1E textual: 1️⃣ me encanta — sigamos así · 2️⃣ ajusta un detalle ·
  3️⃣ prefiero repensar el estilo. Con el tour aprobado, FICHA-ARTE se llena y es cosa
  juzgada; tour + screenshot se archivan en docs/revisiones/ como evidencia. Advertencia
  explícita: el tour es mockup pre-código — no sustituye el revisor ni el cierre de las
  pantallas reales.
- **Hook pre-stop (gate nuevo, probado funcionalmente):** FICHA-ARTE sin vista-previa-app.html
  (ni en árbol ni en historia de git) = violación con clave propia 'vista-previa' y escape
  documentado; el marcador abc-v2 se exige también al tour. Test: A/B/C sin tour → cae;
  con tour → pasa.
- **Cableado completo:** rutas del 54 (paso 5 del A/B/C y paso 6 de la réplica pasan por el
  tour antes de cosa juzgada), 16 (la ficha no se cierra sin tour), INICIO Sesión 2
  (entregable), CLAUDE/AGENTS (bloque DISEÑO), PLANTILLA-FICHA-ARTE (campo del tour con
  vistas y aprobación), MAPA (fila nueva) y vigilante en audit-so.sh (49 checks).

## [6.8.0] — 2026-08-30

**MINOR: KIT A/B/C v2 + REGLA DURA #0 (la comparativa nace del kit, verificado por hook) + EL
RITMO DEL PLAN DE 20.** Forense de una comparativa real generada (app-prueba18): el agente
escribió direcciones-abc.html desde cero en 239 líneas — sin chasis, con emojis 🔥 como íconos,
sin fallback-trampa, sin tab bar, sin hero de landing, cards planas — teniendo el kit de ~900
líneas disponible. Doctrina suficiente, enforcement ausente: esta versión lo cierra.

### Added
- **Kit A/B/C v2 (plantillas-codigo/direcciones-abc/plantilla.html):** marcador de origen
  `data-kit="abc-v2"` en el <html> (NO se borra); TAB BAR con 4 íconos SVG y estado activo en
  cada teléfono (mockup lleno = nav visible); HERO DE LANDING por opción con la dirección
  aplicada (badge del mecanismo, palabra que vende en acento, botón VALIENTE con degradé tonal
  + luz interior + sombra tintada, línea de garantía) — la dirección se elige mirando también
  la pantalla que vende; MUESTRA DE PALETA visual (5 círculos con los hex reales) en cada
  ficha; fondo del shell con profundidad (mesh radial, no fill plano); pie de gates
  actualizado. Verificado renderizado: 3 tab bars dentro del marco, 3 heroes, 3 paletas,
  cero overflow horizontal, acentos y gradientes computados.
- **REGLA DURA #0 en el 54:** la comparativa NO se escribe a mano — se COPIA el kit y se
  TEMATIZA; el archivo final conserva el marcador; aplica igual a replica-fiel.html (RUTA 2).
  Con el fallo real documentado y el argumento de presupuesto: tematizar cuesta una fracción
  de escribir desde cero — calidad y tokens empujan en la misma dirección.
- **Hook pre-stop (gate de comparativa endurecido):** direcciones-abc.html o replica-fiel.html
  presentes SIN el marcador data-kit="abc-v2" = violación con instrucción de rehacer desde el
  kit. Probado funcionalmente: caza el archivo real de app-prueba18 (sin marcador) y deja
  pasar el nacido del kit.
- **EL RITMO DEL PLAN DE 20 (12-FLUJO-AGENTICO):** una sesión del SO = una ventana de uso; al
  aviso de límite se cierra en orden (ESTADO.md + verificar lo construido) y se ESPERA — el
  reset no cuesta nada porque la memoria es externa; prohibido "estirar" degradando calidad;
  expectativa honesta: app completa = varias ventanas en 1-2 semanas. + Tabla de costos
  actualizada (kit vs desde-cero ~3-5×, contexto base ~20k cacheado) y la regla "los kits son
  también una regla de PRESUPUESTO".
- **SETUP-CLAUDE-CODE §5C "¿Te alcanza tu plan?":** la versión simple para el alumno — sí
  alcanza trabajando por sesiones; "cierra la sesión y guarda el avance" al aviso; /retomar al
  renovarse; no pedir "más rápido/simple para gastar menos".
- **2 vigilantes en audit-so.sh** (marcador abc-v2 en plantilla+hook+54; ritmo del plan en
  12+SETUP) — la auditoría pasa de 46 a 48 checks. **MAPA:** fila del kit obligatorio.

## [6.7.0] — 2026-08-29

**MINOR: LOS 3 SUELOS DEL PRECIO + EL CHEQUEO DE PRECIO PARA ADS — el pricing deja de tener
huecos entre el costo de API, el mercado y la publicidad.** Revisión completa de la estrategia
de pricing: la base era sólida (FICHA-MERCADO con fuente, gate de viabilidad unitaria del 40,
créditos por plan), pero faltaba la fórmula cerrada de los cupos, el suelo de canal y la
conversación bien cronometrada con el dueño.

### Added
- **LOS 3 SUELOS DEL PRECIO (02C, la regla de decisión del precio inicial):** el precio se
  propone como el MAYOR de — SUELO 1 DE COSTO: gate del 40 en ambos escenarios (margen ≥70%
  sobre neto, IA ≤20% de catálogo) + FÓRMULA DEL CUPO por plan, cerrada y no a ojo:
  cupo_máximo = precio × 20% ÷ costo por resultado, redondeado hacia abajo, calculado al peor
  caso; SUELO 2 DE MERCADO: FICHA-MERCADO §1 (mediana + rango de líderes, desvío ±30%
  justificado). El SUELO 3 DE CANAL se chequea DESPUÉS, al entrar el paid — con la verdad
  incómoda escrita: un plan de $5-7/mes B2C LATAM con checkout web casi nunca paga una compra
  en Meta; ese precio es de canal orgánico/afiliados.
- **LA CONVERSACIÓN EN DOS MOMENTOS (02C):** MOMENTO 1 (Sesión 1) — los suelos se calculan por
  dentro y al dueño se le informa en 2 líneas simples con la semilla ("está pensado para
  lanzar; cuando quieras invertir en publicidad, lo revisamos") — PROHIBIDO mencionar Meta,
  CAC, API o tokens en ese momento; MOMENTO 2 (cuando pide ads) — pregunta en formato 1E:
  1️⃣ subir el precio · 2️⃣ empujar el plan anual (la caja del año financia los anuncios) ·
  3️⃣ seguir con afiliados/orgánico.
- **CHEQUEO DE PRECIO PARA ADS (34, gate económico del paid):** hermano del gate del píxel —
  antes de la PRIMERA campaña pagada se corre el suelo 3 (CAC máximo tolerable = LTV/3 con
  churn realista sobre neto vs CPA esperado del canal); si no cierra, NO se lanza: primero la
  conversación del momento 2. Referenciado desde la Etapa 1 ("sin los dos gates no se
  invierte un peso").
- **Vigilante en audit-so.sh:** LOS 3 SUELOS (02C/CLAUDE) + CHEQUEO DE PRECIO PARA ADS (34)
  — la auditoría pasa de 45 a 46 checks. **MAPA-DE-AUTORIDAD:** fila nueva (el precio manda
  desde 02C).

### Changed
- **INICIO Sesión 1:** 40-UNIT-ECONOMICS entra a los archivos de la sesión y el entregable
  exige "PRECIO Y PLANES propuestos con los suelos 1-2 pasados e informados en simple
  (momento 1)".
- **CLAUDE/AGENTS (decide-informa-avanza):** el precio inicial Y los límites de cada plan se
  proponen con los 3 suelos; el suelo de canal se chequea recién antes de la primera campaña.
- **40:** su gate queda declarado como el suelo 1 de los 3 suelos (con puntero a la fórmula
  del cupo). **30:** el cupo visible de cada plan se deriva con la fórmula, no se estima.

## [6.6.0] — 2026-08-29

**MINOR: EL FORMATO VISUAL DE PREGUNTAS (regla 1E) — toda pregunta de opciones se entiende de
un vistazo.** El formato que estrenó la PREGUNTA DE REFERENCIA (emoji temático + opciones con
número emoji + lo importante en negrilla + explicación breve) pasa de ser un caso a ser LA REGLA
de toda pregunta de opciones del SO.

### Added
- **Regla 1E en CLAUDE/AGENTS (COMUNICACIÓN):** cada vez que se le pide al usuario una decisión
  entre opciones (arranque, ruta de diseño, elegir estilo, nombre, cualquier elección), la
  pregunta abre con UN emoji temático + 1 línea de contexto; cada opción va en su PROPIA línea
  numerada con emoji (1️⃣ 2️⃣ 3️⃣ — u Opción A/B/C si son estilos renderizados), ARRANCA con lo
  importante EN NEGRILLA (3-7 palabras) seguido de guion y explicación breve en simple, y
  cierra con "Responde 1 o 2" (+ salida libre si aplica). Máximo 2-4 opciones, una pregunta por
  mensaje. Con ejemplo ❌/✅ embebido. El cierre de etapa y las preguntas abiertas mantienen su
  formato propio.
- **Vigilante de presencia en audit-so.sh:** la regla 1E + sus ecos en INICIO y 54 — la
  auditoría pasa de 44 a 45 checks.
- **MAPA-DE-AUTORIDAD:** fila nueva — el formato de preguntas manda desde CLAUDE.md regla 1E.

### Changed
- **La Primera Pregunta (INICIO PASO 2 + copia de 00):** actualizada al formato — 🚀 de
  apertura y 1️⃣ 2️⃣ 3️⃣ en las opciones (texto idéntico, tratamiento visual nuevo).
- **Las salidas del protocolo A/B/C (54, paso 3 + reporte al usuario) y de la RÉPLICA FIEL
  (paso 5):** reformateadas — cada salida en su línea con número emoji, lo importante en
  negrilla y su explicación breve ("**Combina lo mejor** — 'la B pero con la tipografía de
  la A'").
- **INICIO (REGLAS DE CONDUCCIÓN, regla 1) y 54 (reglas de la PREGUNTA DE REFERENCIA):**
  apuntan a la regla 1E y declaran la Primera Pregunta como el molde del formato.

## [6.5.0] — 2026-08-29

**MINOR: LA PREGUNTA DE REFERENCIA + LA RÉPLICA FIEL — la referencia se PIDE, no se espera.**
El fallo que corrige: el SO solo reaccionaba a la referencia visual si el usuario la daba por
iniciativa propia; la mayoría no sabe que puede darla (tiene una captura de Pinterest, de redes
o de una app que ama guardada) y recibía una propuesta inventada sin que nadie le preguntara.

### Added
- **PASO 0 — LA PREGUNTA DE REFERENCIA (54, nueva entrada del protocolo de identidad):** antes
  de crear CUALQUIER propuesta de diseño, el agente pregunta SIEMPRE (textual, sin parafrasear):
  1️⃣ ¿te propongo yo los estilos (3 opciones A/B/C)? o 2️⃣ ¿tienes capturas de un diseño que te
  guste (Pinterest, redes sociales, otra app) para que tu app se vea igual? Reglas: una sola vez
  por proyecto, se omite si ya dio referencia, si elige 2 sin capturas se ESPERA (prohibido
  proponer "mientras tanto"), y la ruta va a ESTADO.md como cosa juzgada.
- **LA RÉPLICA FIEL (RUTA 2 del PASO 0):** con captura de PANTALLA COMPLETA el entregable NO
  son 3 opciones divergentes — es `replica-fiel.html`: analizar la captura A DETALLE con la
  TABLA DE EXTRACCIÓN del 16 (hex, tipografía, radios, sombras, densidad, layout — mirando la
  imagen), y construir UN frame de 375px con la pantalla clave de SU app vestida con ese estilo,
  la captura embebida AL LADO para comparar. REGLA DE ORO: el estilo NO se toca — se adapta el
  CONTENIDO (copy, datos, mecanismo); se replica LO MÁS IGUAL POSIBLE, prohibido "mejorar" o
  aplicar la capa anti-IA en contra. TEST DE FIDELIDAD pasado ANTES de presentar + gates de
  calidad de la comparativa (fuentes fallback-trampa, cero emojis, mockup lleno). Salidas:
  aprobar · ajustar · ver variantes fieles · cambiar captura. Con VARIAS capturas se extrae el
  sistema común (si se contradicen, se pregunta cuál manda). Las 3 INTERPRETACIONES FIELES
  quedan para referencia PARCIAL (moodboard/paleta sin UI) o cuando el usuario pide variantes.
- **2 checks de presencia en audit-so.sh:** LA PREGUNTA DE REFERENCIA (54/INICIO/CLAUDE) y
  replica-fiel.html (54 + hook) — la auditoría pasa de 42 a 44 checks.
- **PLANTILLA-FICHA-ARTE:** campos nuevos "Ruta de diseño" y "Réplica fiel" (ruta del html,
  capturas archivadas, test de fidelidad).
- **MAPA-DE-AUTORIDAD:** fila nueva — la pregunta y la ruta réplica-vs-A/B/C mandan desde el 54.

### Changed
- **El protocolo A/B/C deja de ser universal:** aplica cuando la identidad se crea SIN captura
  de pantalla completa (propuesta propia, referencia parcial o pedido de variantes); con captura
  completa manda la réplica fiel. Actualizados: 54 (cabecera + regla a), 16 (el contrato ahora
  abre con "la referencia se PIDE, no se espera"; la sección pre-ficha bifurca réplica vs
  interpretaciones; el flujo PASO 0.1-0.7 se marca como ruta "propónmelo tú"), INICIO (Sesión 2
  + párrafo universal de identidad), CLAUDE/AGENTS (bloque DISEÑO + Regla de Oro 1),
  PROMPT-NUEVA-APP y /nueva-app (piden la pregunta si no se adjuntó referencia).
- **Hook pre-stop (gate de comparativa):** acepta `replica-fiel.html` como entregable
  equivalente a `direcciones-abc.html` (y el escape documentado reconoce ambos términos) —
  verificado con test funcional de los tres casos.

## [6.4.0] — 2026-08-21

**MINOR: LA ESCALERA DE COMPROMISO + EL PRE-CIERRE + pilar 63 EMBUDO DE CHAT — el funnel
psicológico completo (que el comprador llegue al checkout de Hotmart ya decidido) y el segundo
camino de venta conversacional.** Auditoría psicológica del funnel v6.3.0: sólido dentro de cada
pantalla, débil en las costuras — esta versión cierra las costuras y limpia el folklore.

### Added
- **LA ESCALERA DE COMPROMISO (02B, doctrina que une el funnel):** el paywall es la CONSECUENCIA
  de una inversión acumulada, no una pantalla suelta. 9 peldaños con evidencia exacta (micro-sí
  trivial · razón-porque Langer 1978 60%→94% · plan visible IKEA Norton/Mochon/Ariely 2012 +
  endowed progress Nunes & Drèze 2006 · costo hundido Arkes & Blumer 1985 + 50-82% del revenue
  D0 RevenueCat · etiquetado Tybout & Yalch 1980 · pledge d=0.65 Gollwitzer & Sheeran 2006 ·
  perceived fit Headspace 31%→63% · proyección), mapa de inversión pantalla→qué acumula, y el
  test verificable: "si el usuario pudiera llegar al paywall sin haber invertido nada, la
  escalera está rota". La landing es el PELDAÑO 0 (19) y el checkout el último (pre-cierre 02C).
  + Reglas derivadas a-d: costo hundido OBLIGATORIO en el paywall ("Hecho con tus 12
  respuestas" pasa de opcional a obligatorio en 50 y checklist), etiquetado positivo
  pre-paywall (variante final A5 en 50 — la etiqueta con evidencia, no adulación), peak-end
  (Redelmeier & Kahneman: el pico se diseña — revelación del plan — y el final post-pago fija
  el recuerdo anti-refund) y anti-REACTANCIA nombrada (Rains 2013). Fila nueva en el MAPA.
- **EL PRE-CIERRE (02C, dentro de EL PUENTE DE CHECKOUT):** el checkout NO vende — EJECUTA una
  decisión ya tomada. 4 condiciones (precio ya visto, plan ya elegido, transición anunciada,
  cero información nueva en el checkout) + regla de diagnóstico: Tasa 2 baja con Tasa 1 sana =
  puente psicológico roto, no técnico. + MERA EXPOSICIÓN al precio (Modelo 2 sin landing: el
  paywall JAMÁS es la primera exposición — pre-exposición dentro del funnel, y §6 del 19 la
  landing muestra el precio SIEMPRE) + efecto señuelo endurecido: 11 de 91 réplicas con
  productos reales — el default anual se marca con jerarquía visual y se TESTEA, jamás se asume.
- **VALIDADO vs FOLKLORE (52):** tabla de 8 efectos validados que el SO usa (anclaje Many Labs
  d>1.0, implementation intentions 94 estudios…) vs 6 mitos que NO se implementan (símbolo de
  moneda, mirada del bebé n=106, decoy como ley, fMRI-marketing…). + Tabla pantalla→palanca del
  funnel (8 filas: qué sesgo carga cada pantalla de onboarding/paywall) + FÓRMULA ÚNICA del
  headline de paywall: `[META o MECANISMO] + [presencia o pérdida honesta]` — una sola
  filosofía, tres dueños alineados (02B/50/52).
- **El puente psicológico (60):** 4 preguntas de diagnóstico cuando el funnel pierde entre
  paywall y compra (¿precio-sorpresa? ¿miedo activo sin responder? ¿re-decisión forzada?
  ¿inversión invisible?).
- **PILAR 63 — EMBUDO DE CHAT (archivo nuevo + PROMPT-EMBUDO-CHAT.txt + comando
  `/embudo-chat`):** el segundo camino de venta — Meta Ads → página PROPIA con formato de
  conversación (simulador de botones, NO WhatsApp real: cero baneos, respuesta instantánea,
  analítica por tap) → checkout de Hotmart. Regla de marca anti-suplantación (el formato de
  chat es de todos; el trade dress de WhatsApp es de Meta), guion de 7 etapas E1-E7 derivado de
  las fichas (diagnóstico antes de oferta — Headspace 31%→63%), reglas de copy por burbuja, la
  escalera del 02B aplicada entera al chat, medición con sck=chat-[campaña]-[plan] + gate del
  Píxel del 34, y el MODELO DE CONTRIBUCIÓN LATAM diseccionado (Radiohead 62% pagó cero, Gneezy
  Science 2010: qué se roba — valor antes de pedir, trial como regalo — y qué NO — el precio
  voluntario no financia software). Dos caminos del alumno: clonar y adaptar la plataforma
  wsp-funnel del curso (protocolo de duplicación segura) o pedir la app nueva ya orientada al
  embudo (la SECUENCIA MAESTRA queda intacta; solo cambia la superficie de venta). Variante
  CTWA real documentada como táctica avanzada en 34. Ruteo + menú en CLAUDE/AGENTS e
  inventarios actualizados (SETUP 29 comandos, GUIA, REFERENCIA-RAPIDA y SELF-CHECK a 00-63).
- **3 vigilantes semánticos nuevos en audit-so.sh (#13-15):** Zeigarnik derogado, stats de
  constancia inventadas, "95% (Zaltman)" — la auditoría pasa de 39 a 42 checks (el #14 ya cazó
  una 4ª stat inventada en la matriz de voz del 11 durante esta misma ronda).

### Changed
- **50:** barra de progreso 5-8% re-atribuida a ENDOWED PROGRESS (Nunes & Drèze 2006) + nota de
  gradiente de meta; loader por pasos nombrado LABOR ILLUSION (Buell & Norton 2011); C0/C1
  "Hecho con tus N respuestas" obligatorio.
- **56:** M2 conectado explícitamente a la regla peak-end del 02B (el pico se diseña, no se
  espera); advertencia en las tablas de copy M1-M7: los ejemplos NO llevan % — si citas un
  número, va con fuente y año o no existe.
- **19:** la landing entra a la escalera como PELDAÑO 0 (su CTA es el primer micro-sí) y la §6
  pre-expone el precio.
- **PILARES pilar 4:** actualizado con la escalera de punta a punta.

### Fixed
- **"Zeigarnik" eliminado del SO completo** (50, 11, 15, 24): el mecanismo real del progreso
  visible es endowed progress / gradiente de meta — la atribución a Zeigarnik no replica.
- **Estadísticas inventadas fuera** (56 ×3 + 11 matriz de voz): "el 80% del resultado depende
  de la semana 1", "solo el 6% llega a 30 días", "top 6% de constancia" — reemplazadas por
  verdades sin número o datos con fuente.
- **"~95% (Zaltman)" eliminado** (02B — cifra no verificable; queda el punto operativo) y el
  "72%" de teardown marcado como direccional sin fuente.

## [6.3.0] — 2026-08-21

**MINOR: EL RADAR DE MERCADO + LA APP MODELO — la ideación al nivel de los profesionales que
modelan lo que ya gana.** Investigación verificada navegando las plataformas (21-08-2026):
RevenueCat, TrustMRR, Product Hunt, AppMagic, Sensor Tower + 9 fuentes más.

### Added
- **EL RADAR DE MERCADO en 01:** tabla ejecutable de 14 fuentes — cada una con qué extrae la IA
  GRATIS y sin cuenta, y a qué señal alimenta (TrustMRR: revenue REAL verificado navegable al
  100%; RevenueCat SOSA: benchmarks públicos; Sensor Tower lookup público: cifra del líder;
  AppMagic charts en rangos con fallback a Appfigures; Similarweb — el punto ciego WEB
  corregido; el marketplace de Hotmart como señal de pago del canal exacto del SO; Mobbin,
  Meta Ads Library con rango de impresiones ene-2026, TikTok CC, AppTweak keywords, Starter
  Story/IH/Acquire, Growth.Design/Sub Club) + EL PIPELINE en orden + reglas de robustez:
  cachear todo dato con fuente y fecha (las fuentes gratuitas se cierran — AppMagic ene-2026)
  y fallback. Regla central: EL USUARIO JAMÁS VISITA ESTAS PÁGINAS — la IA consulta, extrae,
  cita y presenta en simple.
- **LA APP MODELO como paso obligatorio pre-gates (01) + FICHA-MODELO como CUARTA ficha
  canónica** (PLANTILLA-FICHA-MODELO.md nueva; Regla de Oro 3 pasa a CINCO artefactos; el hook
  de arranque la inyecta; el pre-stop bloquea construir sin ella): UNA app modelo (no fusión —
  esa queda para lo visual del 16) con revenue probado por ≥2 señales independientes, y su
  plano completo: mecanismo+aha · onboarding paso a paso · paywall/pricing · core vs
  accesorias · quejas 1-2★ (lo que mejoramos 10x) y amores 5★ (lo que no se toca) · sus 5 ads
  más antiguos con impresiones · el EJE ÚNICO de diferenciación. Caso fundante: el mismo
  playbook replicado 3 veces — RizzGPT $2,4M → Umax $5M → Cal AI $8M ARR.
- **Regla del EJE ÚNICO** (01 ×2): del modelo se cambia UNA cosa (audiencia/idioma-geo/ángulo)
  y se CONSERVA lo probado (onboarding, momento del paywall, pricing). Dos ejes = apuesta.
- **Mecanismo y Big Idea anclados al modelo (19):** mecanismo propio = lo que el modelo prueba
  + el paso que elimina su queja #1; la Big Idea se deriva de la promesa que el modelo ya
  comunica en sus ads, ajustada por consciencia (57).
- **Demanda cuantificada:** volumen de keywords (AppTweak/Search Popularity) en la Señal 4;
  rango de impresiones de Meta en la Señal 2. **Calibración honesta** junto a los gates: solo
  el 4,6% llega a $10k/mes en 2 años; 14.700 apps nuevas/mes (RevenueCat SOSA 2026) — el
  filtro es el regalo.
- Baselines del modelo propagadas: 02B (onboarding), 02C (pricing), 34 (ángulos), 16 (la app
  modelo encabeza la TABLA DE LÍDERES), 02 (la idea propia también se modela), INICIO (radar
  en los flujos A/B + FICHA-MODELO en el entregable de la Sesión 1), PILARES pilar 1, MAPA.

## [6.2.0] — 2026-08-06

**MINOR: LA CAPA LEGAL, CERRADA — la IA redacta, audita y perfecciona; el usuario solo aporta
sus datos.**

### Added
- **`PROMPT-LEGAL.txt` + comando `/legal` (nuevos):** auditoría de perfeccionamiento legal en 5
  pasos — inventario real (páginas vs las 6 obligatorias del 47 Y vs lo que el código hace),
  una sola tanda de preguntas al usuario (solo lo indeducible: razón social, país, email
  legal), checklist duro (subprocesadores nombrados, derecho de eliminación PROBADO en el
  código, reembolsos alineados con Hotmart y con la landing, disclaimer de IA visible, banner
  de cookies verificado en el código, capa de suscripción/ARL, coherencia páginas=código=
  landing como hallazgo crítico), corrección completa y reporte en simple con el umbral honesto
  de "cuándo sí necesitas un abogado".

### Changed
- 47: la regla de generación invertida — LA IA REDACTA las páginas legales (entregable de la
  Sesión 3, antes de declarar la landing); los generadores externos (Termly/Iubenda) pasan de
  método recomendado a contraste opcional. La política de privacidad ahora exige la lista
  NOMBRADA de subprocesadores con su función, fecha de última actualización + versionado, y
  aviso de cambios materiales por email. La IA pide los DATOS DEL RESPONSABLE antes de
  redactar (lo único que no puede inventar).
- Inventarios sincronizados: SETUP (28 comandos), MENÚ de CLAUDE.md, GUIA (ficha de /legal),
  REFERENCIA-RAPIDA.

## [6.1.1] — 2026-08-06

**PATCH: EL MECANISMO COMO COLUMNA VERTEBRAL.** La regla que separa a las apps líderes ("no
venden muchas funciones — venden UN mecanismo fácil de recordar y una sensación útil casi
inmediata") estaba cumplida a medias: el mecanismo bautizado vivía solo en la landing (19) y
se bautizaba recién en la Sesión 3. Ahora es el hilo de todo el producto:

### Changed
- 01 (Constitución): la primera victoria SE DEFINE como "sentir el mecanismo funcionando con
  tus datos", y el mecanismo se bautiza en la pregunta nueva 4b (con el protocolo del 19) —
  ANTES de construir cualquier superficie. Cosa juzgada: el mismo nombre en todas.
- 19: el nombre se HEREDA de la Constitución + REGLA DE HILO (landing, onboarding, paywall y
  ritual diario nombran el MISMO mecanismo — lo que cambia de nombre no es memorable).
- 02B: test de salida del onboarding — el usuario debe poder DECIR el nombre del mecanismo que
  acaba de configurar ("configuraste un formulario" ≠ "configuraste tu Radar").
- 50: el mecanismo bautizado como palabra resaltada del headline del paywall (variante igual de
  fuerte que la meta — el paywall vende el mecanismo, no una lista de funciones).
- 56 (M0): el insight diario habla EN LA VOZ del mecanismo ("tu Radar detectó...") — el
  mecanismo es el personaje de la app; el usuario recuerda QUÉ paga cada vez que abre.
- PILARES-DEL-EXITO: la regla transversal explícita + el test de una frase ("el usuario paga
  por [mecanismo] que le da [sensación] en [minutos]"). CLAUDE.md regla UX 2 acoplada.

## [6.1.0] — 2026-08-06

**MINOR: LOS PILARES DEL ÉXITO — la sabiduría de élite destilada, priorizada y con evidencia.**
Tres investigaciones nuevas (ideación/validación, backend/seguridad, arte/landing CRO) + la
síntesis de todas las rondas anteriores, convertidas en la brújula del sistema.

### Added
- **`PILARES-DEL-EXITO.md` (archivo maestro nuevo, ruteado desde CLAUDE.md e inyectado por el
  hook de arranque):** los 11 pilares que deciden el éxito o el fracaso, en orden de prioridad
  con la evidencia que lo justifica (el mercado 42-43% de los fracasos > el avatar > la oferta
  +12.7% por 1% de mejora > el funnel > la utilidad diaria > la retención del pago > la
  identidad > la integridad técnica > la seguridad > la adquisición > la operación), cada uno
  con sus QUÉ HACER y QUÉ NUNCA HACER de élite destilados (fuente y año) y el puntero a sus
  archivos profundos. Regla de lectura: 2 minutos al arrancar y al cerrar cada sesión. Regla
  final: ante recursos limitados gana el pilar de número más bajo — salvo fuego activo en
  integridad/seguridad.
- **Ideación/validación de élite (01, 02, 44):** KILL CRITERIA en la Ficha del Gate (señal +
  fecha + acción pre-comprometida, escritos ANTES de validar) + regla anti-sunk-cost (máx 2
  reformulaciones de ángulo — Annie Duke 2022); OPCIÓN C — VALIDACIÓN CONCIERGE (la IA genera
  los outputs, el founder los entrega a mano y COBRA; ≥3 pagos = la señal más fuerte que
  existe — doctrina YC); TAR PIT IDEAS en los anti-patrones (entusiasmo universal + cementerio
  de intentos = descartar — Caldwell/YC 2024); hipótesis MÁS RIESGOSA antes de la Big Q (MVT —
  Biyani/First Round 2021); autoridad del gate con los datos de fracaso (CB Insights 2014/2026,
  UserIntuition 2025); features solo se copian entendiendo el mecanismo; arbitraje gana por
  ADAPTACIÓN, no traducción (Wharton).
- **Backend/integridad de élite (18, 61, 21, 31, 13, 25, 48, 62, 27, 30):** RECONCILIACIÓN
  SEMANAL DE SUSCRIPCIONES contra el proveedor (el seguro contra el drift silencioso — webhook
  perdido más allá de la ventana de reintentos = acceso regalado para siempre; casilla en Gate
  2 de 61 + card de drift en 21); DEAD MAN'S SWITCH del backup (heartbeat con verificación de
  tamaño — la lección GitLab 2017: 5 backups fallando en silencio); uptime externo + heartbeat
  de crons críticos (15 min de setup, día 1); RE-DRILL trimestral del restore (solo 61% de los
  restores logra su objetivo — Backblaze 2024); REGLA DURA ANTI-REPLIT en 62 (el agente jamás
  con credenciales de escritura sobre producción — casos SaaStr jul-2025 y PocketOS 2026);
  gitleaks/Push Protection en 27 (39M secretos filtrados en 2024; claves OpenAI +1.212%);
  CAPA 0 del gasto de IA (spend cap duro en el proveedor); dual-write con flag para cutovers.
- **Arte/landing con evidencia CRO (19, 55, 16 + kit):** el CARRUSEL pasa a MANUAL por defecto
  (scroll-snap + peek + dots; el auto-avance queda prohibido como vehículo de mensaje — la
  evidencia más sólida del CRO: ~1% interactúa, el slide 4 lo ve el 0.03% — Notre Dame,
  corroborado hasta 2026; el kit YA era manual: cero cambios); velocidad cuantificada como
  doctrina (0.1s móvil = +8.4% conversión — Deloitte/Google 2020) + presupuesto de peso (≤1MB,
  JS ≤200KB); benchmarks de conversión por industria (Unbounce 2024: mediana 6.6%, SaaS 3.8% —
  compárate contra TU industria); datos mobile-LATAM con fuente (~85% del tráfico — Statista);
  patrón de VIDEO en hero (nunca autoplay de fondo; demo iniciada por el usuario con poster);
  franja social bajo el CTA blindada con el dato (+15-40%); COMPRESIÓN PROACTIVA legítima para
  tráfico caliente; el ícono nunca sustituye al label (NN/g); seguridad percibida del pago
  (48.7% no distingue sellos — Baymard); consistencia de marca ↔ ingresos (+23-33% — Marq).

## [6.0.0] — 2026-08-06

**MAJOR: LA CAPA DE ENFORCEMENT — de "doctrina que se ignora" a "sistema que se cumple solo".**
Origen: auditoría forense completa de un proyecto real construido con v5.11.1. Veredicto medido:
de ~27 clases de fallo, ~24 ya estaban prohibidas por reglas escritas que el agente IGNORÓ — el
gate más importante (revisor en la landing) fue *narrado* en ESTADO.md sin ejecutarse, la
comparativa A/B/C nunca existió como archivo, la obra salió en voseo con tres documentos
ordenando tuteo, y el agente abandonó el stack pineado degradando en silencio todas las recetas
premium. Esta versión no añade doctrina que leer: cambia QUIÉN verifica. MAJOR porque cambia
cómo se cierra cada etapa (evidencia como artefacto) y cómo se construye la landing (kit-first).

### Added — PILAR 1: evidencia como artefacto (la prosa deja de contar)
- Convención de evidencia del proyecto: `docs/revisiones/` (screenshots `<pantalla>-375.png`,
  veredictos `<pantalla>-veredicto.md` con formato canónico QUE ESCRIBE EL REVISOR — se le dio
  la herramienta Write al subagente) y `docs/copy/` (el copy MARCADO [acento]/[b] como input de
  construcción).
- `pre-stop.sh` v2: gates que verifican ARTEFACTOS — pantalla del dinero declarada lista sin
  veredicto ≥36/40 y ≥16/20 → bloqueo; veredicto más viejo que el código de su pantalla =
  CADUCADO; FICHA-ARTE sin `direcciones-abc.html` (árbol o historia git) → bloqueo; pantalla de
  venta sin copy marcado → bloqueo; garantía ahora FAIL-CLOSED (mencionada en el copy sin
  FICHA-MERCADO con M>N = bloqueo siempre). ANTI-LOOP REPARADO: la segunda pasada re-corre los
  chequeos deterministas — solo cierra si se resolvió o quedó documentado (grepeable) en
  "Problemas conocidos" de ESTADO.md. Todas las violaciones se reportan JUNTAS en una corrida.
- `scripts/pre-commit-gates.sh` (nuevo): los mismos gates como pre-commit de git — un estado
  no-cerrable tampoco se puede commitear. Instalación documentada en SETUP.

### Added — PILAR 2: `scripts/audit-conversion.sh` (caza AUSENCIAS, no solo anti-patrones)
- 15 chequeos mecánicos sobre las pantallas de conversión construidas: presupuesto de copy
  contando palabras/caracteres del JSX (regla móvil: bloque >160 caracteres = crítico), énfasis
  en H1/H2 (y lista negra de palabras vacías resaltadas), hairlines, chips 40-48px, emojis,
  radios vs FICHA-ARTE, fondo con profundidad, sticky CTA con safe-area, animaciones +
  reduced-motion, VOZ contra la propia ficha (diccionario voseante + palabras vetadas leídas de
  FICHA-AVATAR), contraste WCAG calculado desde los tokens, stack pineado, orden de planes, y
  la comparativa A/B/C (fuentes que jamás cargan, fallback-trampa, DOM >80% idéntico = "1
  pantalla con 3 acentos"). Motor en `scripts/lib-conversion.mjs` (solo built-ins de Node).
- PRUEBA DE ACEPTACIÓN contra el proyecto forense: 53 críticos · 12 avisos — enciende TODO lo
  que los auditores humanos encontraron a mano. El pre-stop lo invoca automáticamente.

### Added — PILAR 3: el KIT CANÓNICO EJECUTABLE (`plantillas-codigo/`)
- `plantillas-codigo/landing/`: las 10 secciones canónicas como componentes TERMINADOS (React +
  TS + Tailwind v4 + motion + lucide; tsc estricto = 0 errores contra dependencias reales) con
  las reglas EMBEBIDAS COMO TIPOS: la agitación acepta `string[]` de frases (el párrafo de 72
  palabras ya no puede existir), la solución es una tupla de exactamente 3 pasos, el plan anual
  exige `totalAnual` en el tipo; chips, hairlines, checkmarks custom, mesh de fondo, sticky CTA
  con dos estados, animaciones con reduced-motion, FAQ accesible y presupuestos de copy con
  warns de desarrollo ya incluidos. + `tokens.css` tematizable desde FICHA-ARTE + parser de
  copy marcado + página de EJEMPLO completa. Doctrina: la landing se construye DESDE el kit
  (55 "EL KIT PRIMERO", ruteo en CLAUDE.md); desviarse se justifica en ESTADO.md.
- `plantillas-codigo/direcciones-abc/plantilla.html`: comparativa con 3 layouts
  ESTRUCTURALMENTE distintos ya maquetados y llenos, chasis de teléfono real, especímenes
  tipográficos con fallback-trampa monospace, instrucciones @font-face data-URI (compatible con
  CSP de artifacts), cero emojis, hipótesis de conversión por opción. Renderizada y verificada
  en navegador.

### Added/Changed — PILAR 4: las pocas correcciones de doctrina reales
- RUBRICAS: presupuesto de copy POR SECCIÓN de landing como anclas binarias (la única brecha
  real de la rúbrica que el forense encontró).
- MAPA-DE-AUTORIDAD: 4 tensiones resueltas (kicker en landing vs eyebrow-slop en app; el
  dialecto lo manda la FICHA siempre — multi-país = neutro; el modo de la opción C se deriva
  del mundo del sujeto; la sofisticación §6 manda sobre el mapeo deseo→headline §9).
- 57-AVATAR endurecido: protocolo VoC ejecutable de 2 horas (reseñas ES de las apps del nicho +
  Reddit + grupos; ≥10 frases literales con fuente o la ficha queda en estado BORRADOR —
  prohibido derivar copy de venta de un borrador); regla ¿1 o 2 sub-avatares?; dolor corporal
  obligatorio y "Momento del AÑO" en nichos de salud/hábito; sofisticación bilingüe; gate de
  consistencia interna (la ficha no usa sus propias palabras vetadas; no promete lo que su
  inventario declara inexistente).
- 02-VALIDACION: "FALSEAR LA TESIS DE MERCADO" — buscar activamente el competidor que refuta la
  brecha antes de aprobarla.
- 54: la comparativa muestra también el HERO de la landing; hipótesis de conversión por opción;
  nota de vehículo (artifact/CSP); los descartes se ARCHIVAN en docs/revisiones/ (contradicción
  con "se borran" resuelta). 16: la TABLA DE LÍDERES se llena con los líderes del NICHO EXACTO
  de ESTADO.md, no con categorías vecinas.

### Fixed
- El linter cazó su primer bug ANTES del release: el token placeholder `--text-tertiary` del
  propio kit fallaba AA (3.05-3.54:1) → corregido a 5.0-5.8:1. El sistema ya se audita a sí
  mismo.
- REF del audit-so: las rutas-convención del proyecto destino (docs/revisiones/, docs/copy/,
  placeholders <slug>) ya no se marcan como referencias rotas del paquete.
- 54 resumen rápido fila 9: par tipográfico alineado con la dirección detallada (Inter Tight).

## [5.11.1] — 2026-08-05

**PATCH: el flujo de acceso Hotmart-first, pulido a nivel profesional (26, 18, 24).**
El flujo base (correo → verificar compra en TU base → acceso passwordless) ya era el correcto y
queda ratificado; se afinan los 4 puntos que separan "funciona" de "sin fricción y sin tickets":

### Added
- **EL COMBO enlace + código de 6 dígitos en el MISMO email** (26 + 18): el fallo #1 del enlace
  mágico solo es que el correo se abre en otro navegador/dispositivo que donde empezó el login —
  el código se escribe donde el usuario EMPEZÓ. Implementación exacta: `signInWithOtp` +
  plantilla con `{{ .ConfirmationURL }}` y `{{ .Token }}`; verificación con `verifyOtp`; campo
  de código VISIBLE en /login tras enviar.
- **Vida de sesión por tipo de app** (26): consumo/hábito (default del SO) = sesión larga
  (30-90 días o hasta logout/revocación — re-loguearse cada semana por correo mata el ritual
  diario del 24); B2B/dinero = corta + step-up. Y REVOCACIÓN ligada al webhook: al bajar el plan
  (cancelación/reembolso/chargeback) se revocan las sesiones en el servidor.
- **El momento de la passkey** (26 + 24): se ofrece tras la PRIMERA VICTORIA (D3-D4 de la
  Primera Semana), nunca en el primer login; un tap y el usuario no vuelve a depender del
  correo; si dice no, UNA re-oferta en D7 y no insistir; el email siempre queda como respaldo.
- **RUTA DE RESCATE DE ACCESO** (18, sección nueva): el ticket #1 del modelo ("compré y no me
  llega") resuelto en /login desde el día 1 — reenviar con respuesta uniforme (anti-enumeración
  intacta), recordatorio de spam + remitente, verificación del correo de compra, soporte con
  asunto pre-llenado, y el procedimiento del dueño (buscar en panel de Hotmart → actualizar el
  email de la cuenta EXISTENTE, nunca crear una segunda cuenta).

### Changed
- 26 (HOTMART-FIRST): tres reglas nuevas explícitas — el combo siempre; el login verifica contra
  TU base (nunca consultando a Hotmart en vivo); prohibido añadir contraseñas a este flujo
  (fricción + riesgo de reutilización, sin beneficio que el combo + passkey no dé mejor).
- Checklist de 26 ampliado con 5 ítems verificables (combo, vida de sesión, revocación por
  webhook, ruta de rescate, momento de la passkey).

## [5.11.0] — 2026-08-04

**MINOR: los 4 pilares del uso diario y el pago recurrente — con evidencia verificada.**
Investigación profunda en 4 frentes (onboarding, paywall/pricing, hábito diario, retención de
pago) sobre la evidencia 2024-2026: RevenueCat SOSA 2025/2026 (115.000+ apps), Adapty 2026,
Superwall (40M+ aperturas), Recurly, Amplitude (2.600 empresas), estudios académicos (JCR
2015/2023, AER 2025, meta-análisis Gollwitzer & Sheeran) y los playbooks de Duolingo, Flo,
Headspace, Blinkist, Noom y Cal AI. 60+ hallazgos con fuente y año, cada uno con gap analysis
contra el SO. **Regla de toda la versión: ningún número entra sin fuente y año.**

### Added — onboarding (02B, 50, 60)
- Bloque BENCHMARKS VERIFICADOS DEL FUNNEL en 02B (install→trial ~10.9%, trial→pago ~25.6%,
  mejor placement 1.78%, D0 = 82-90% de trials y 44.5% de compras, activación 34%/25%, regla
  del 7% D7).
- PAYWALL DE SECUENCIA (multi-página): +37% vs una página (Superwall 2026, solo 24% lo usa) —
  estrategia en 02B + blueprint C0 en 50 (recap personalizado → expectativas/timeline → precio).
- ACTIVACIÓN medible ("% que completa la primera victoria en la primera sesión") con benchmarks
  y la regla de urgencia (55.4% de cancelaciones de trial corto el mismo D0; 35% del churn anual
  en el mes 1).
- PREGUNTA DE ANCLAJE CONTEXTUAL en el onboarding ("¿en qué momento del día lo harás?" → fija la
  notificación del día 1; d≈0.65, 94 estudios).
- C4 (timeline del trial) sube a visual DEFAULT del paywall con trial, con los números de
  Blinkist (+23% trials, −55% quejas, opt-in 6%→74%) y el opt-in pedido DENTRO del timeline.
- Evidencia experimental del quiz: Headspace 31%→63% de activación solo por preguntar.
- Conflictos resueltos con texto canónico: oferta post-cierre no intrusiva de 24h real permitida
  (recupera 8-15% — el primer tap en X sigue cerrando SIEMPRE); email OPCIONAL como valor en la
  pantalla de resultados permitido y medible (el PEAJE sigue prohibido) — idéntico en 50 y 60.

### Added — paywall y pricing (02C, 52)
- ORDEN DE EXPERIMENTOS DE PRICING (win rates Adapty 2026: localización 62.3% > trial 59.6% >
  duración 58.7% > nº planes 57.1% > precio 45.5% > visual 34.6%; ~14.7 tests/año).
- Doctrina de trial reescrita: TIEMPO-A-VALOR (5-7 si aha inmediato; 14+ si anual/caro; trials
  17-32 días convierten 42.5% vs 25.5% — RevenueCat 2026; patrón Headspace dual 14/7). El
  "5-9 días óptimo" queda DEROGADO en todo el sistema (erradicado también de 18/55/02/19).
- Trade-off soft/hard explícito (+50% conversión vs ~2x LTV), garantía cuantificada (+8-18%
  trials / +5-12% pago), "9 de cada 10 suscripciones a precio completo", puente de checkout con
  números reales (−45% conversión, 85-97% del ingreso retenido), decoy con honestidad
  epistémica, nota "los planes semanales de store no se trasladan a web", CTA "$0 hoy" (Duolingo).

### Added — utilidad y hábito diario (24, 56, 30, 36)
- REGLA DEL MOAT ACTIVO: "el registro de hoy cambia lo que la app dice mañana" + test binario
  "si borro tu historial, ¿la app de mañana es idéntica?" (Flo; a16z 2025) — también en la
  Regla de Oro 6 de CLAUDE.md.
- MOMENTO M0 — EL RITUAL DIARIO en 56: blueprint de la pantalla más vista de la app (dato de
  hoy + acción de 1 tap + racha + el insight que no sabía); anti-patrón "dashboard de 8 widgets".
- LA PRIMERA SEMANA DISEÑADA (D1-D7) en 24, con la evidencia de Duolingo (600+ experimentos;
  >50% del DAU con racha ≥7) y meta 7% D7 = top 25% (Amplitude).
- Timing preciso de notificaciones (última acción −30 min; racha en riesgo 21-22h; regla "el
  silencio también churnea": mínimo 1 toque de valor/semana si hay opt-in).
- BENCHMARKS DE ENGAGEMENT con fuente (DAU/MAU 20/50%; D1~25/D7~12/D30~6%; 6 meses 40/70%;
  por vertical) + CURR semanal como métrica prioritaria (5-6x impacto — Duolingo).
- Re-enganche web completo: WhatsApp como canal 3 (LATAM), add-to-homescreen tras primera
  victoria + racha de 3; mini-lista PROBADO QUE NO FUNCIONA; default 2 freezes (JCR 2023).
- MEMORIA DEL USUARIO = RETENCIÓN en 30 (resumen rodante + personalización explícita).
- Eventos nuevos en 36: activacion_primera_victoria, CURR semanal, pagador_fantasma_detectado.

### Added — retención de pago (58, 40, 21, 47)
- PIX AUTOMÁTICO (jun-2025, soportado por Hotmart): Paso 0 de la rama PIX/boleto — el cobro
  manual queda como fallback; código expira en 48h; hasta 5 reintentos; Recuperador en
  descontinuación gradual. La afirmación absoluta "PIX no se auto-cobra" queda DEROGADA.
- EL ACANTILADO DEL MES 1 DEL ANUAL (35% de las cancelaciones anuales — RevenueCat 2026):
  los primeros 30 días post-compra anual son retención de ingresos.
- RADAR DE RIESGO — EL PAGADOR FANTASMA (14+ días sin sesión): intervención pre-cobro con el
  valor acumulado; re-onboarding obligatorio para resucitados (~20% peor retención — Duolingo).
- Benchmarks medibles + sección FUENTES DE CALIBRACIÓN en 58 (churn ⅓ involuntario; dunning
  objetivo >40-50%, top 70-85%; grace +57% / triplica con hold; save rate 6-23%; descuento
  30-40% con TouchNote 40≈50; pausa 19%/75%; win-back 10-30% y 20-25% de las altas; refunds 2-5%).
- Caja de evidencia del pre-aviso anual (AER 2025: la inatención infla ingresos +14-200% — se
  avisa igual; California ARL jul-2025) + marco legal en 47.
- QUÉ MUEVE MÁS EL LTV en 40 (monetización +12.7% > retención +6.71% > adquisición +3.32%;
  mezcla anual = palanca #1; churn NO plano — modelar con curva); métricas nuevas en 21 (split
  voluntario/involuntario, % de altas que son regresos, CURR, pagadores fantasma).

### Changed
- Guardianes semánticos #11 ("5-9 días" derogado) y #12 ("PIX y boleto NO se auto-cobran" como
  absoluto) — el #11 cazó 4 residuos en 18/55/02/19 durante esta misma integración.
- CLAUDE.md: Regla de Oro 6 con inversión ACTIVA + primera semana + M0; fila de ruteo del 56
  ahora nombra el ritual diario; REFERENCIA-RAPIDA actualizada (M0 + 7 momentos-evento).

## [5.10.0] — 2026-08-04

**MINOR: voz neutra LATAM + doctrina de énfasis y detalles premium + fidelidad endurecida.**
Cuatro fallas observadas en prueba real, cada una con causa raíz corregida en TODO el sistema:

### Fixed — voz del agente (acento argentino)
- Causa raíz: ~37 instancias de voseo rioplatense en los propios documentos ("vos vas a lograr",
  "tenés", "querés", "definí", "usá", "medí", "acotás"…) repartidas en 10 archivos — el agente
  imita el registro de lo que lee. TODAS neutralizadas a tuteo neutro.
- Regla D-A nueva: la voz del AGENTE es español latino NEUTRO siempre (tuteo; jamás voseo ni
  modismos de un país) — en CLAUDE.md (COMUNICACIÓN 1), INICIO (regla de conducción 11),
  42-UX-WRITING (sección "VOZ DEL AGENTE vs COPY DE LA APP"), 11, y los prompts/comandos de
  arranque y retomar. Distinción explícita: el copy de la APP sigue el dialecto del avatar (52)
  — si el mercado es Argentina, la app puede vosear; el agente en el chat, nunca.
- Guardián semántico #10: conjugaciones voseantes inequívocas y enclíticos rioplatenses, con
  allowlist para los archivos que ENSEÑAN la regla dialectal y las citas de voice-of-customer.

### Added — jerarquía de énfasis (D-B) y detalles premium como gate (D-C)
- JERARQUÍA DE ÉNFASIS en superficies de conversión, ahora en 7 archivos coherentes (55 con
  sección propia + ejemplo JSX, 52, 50, 19, DESIGN-CORE, CHECKLIST-CIERRE, RUBRICAS): titular
  SIEMPRE bold completo (700-800) con 1-3 palabras clave en color de ACENTO (la palabra que
  VENDE, trazable a la ficha — nunca artículos); subtitular con 2-4 palabras en semibold;
  secciones adyacentes distinguibles; el copy viaja MARCADO ([acento]/[b]) — el diseño no
  adivina. Un titular plano donde nada resalta NO pasa el cierre.
- GATE BINARIO de 6 detalles premium en landing/onboarding/paywall (checklists de 55/50, bloque
  condicional nuevo de CHECKLIST-CIERRE, anclas de conversión en RUBRICAS y revisor-visual):
  énfasis del titular · ≥1 hairline degradé 1-2px · icon chips SVG en toda lista de beneficios
  (CERO emojis) · checkmarks custom · fondo con profundidad · radios del kit.

### Fixed — mockups A/B/C con emojis (D-D)
- Gate nuevo en 54 + CLAUDE.md: los mockups A/B/C se renderizan con los componentes premium del
  kit (chips SVG, hairlines, checkmarks custom, fondo con profundidad, datos semilla) y CERO
  emojis — "el mockup ES la promesa de calidad"; con emojis o placeholders pobres, se rehace
  antes de mostrarse.

### Fixed — fidelidad a la referencia (D-E)
- El estándar de éxito ahora es explícito: que el usuario diga "ES IGUALITA". Prohibido
  "mejorar", reinterpretar o aplicar la capa anti-IA contra la referencia; solo se EXTIENDE lo
  que la referencia no cubre, con su mismo sistema (16, INICIO, PREFLIGHT, CLAUDE.md).
- Caso nuevo APP NOMBRADA ("quiero que se parezca a X"): X es referencia-mandato de patrones —
  se investiga a fondo y se replica su sistema lo más similar posible sin clonar
  assets/copy/marca. La fusión de 3-5 líderes queda como default SOLO sin referencia (16 PASO
  0.2bis corregido — antes una app nombrada sin imagen caía en fusión).
- Corregidos 4 puntos donde el TEST DE DIVERGENCIA obligaba a divergir INCLUSO con referencia
  (16 ×2, 54 ×2): con referencia, las 3 opciones divergen SOLO en lo que el contrato no fija —
  y si difieren poco, ESO ESTÁ BIEN.

## [5.9.2] — 2026-08-04

**PATCH: silencio de cocina y cero jerga — corregido desde fallos observados en sesión real.**
Dos fallas de comunicación vistas en una prueba en vivo, ambas con causa raíz encontrada:

### Fixed
- **El muro de texto del arranque tenía una ORDEN contradictoria adentro del propio SO:**
  `PROMPT-ARRANQUE.txt` y `/arranque` decían "FIJA EXPECTATIVAS al inicio: dile que hay ~5 cosas
  que solo él puede hacer (cuentas, dominio, claves)…" — exactamente el muro que INICIO PASO 2
  prohíbe. El agente no desobedecía: obedecía la instrucción equivocada. Reescrito en ambos:
  las expectativas se reparten EN SU MOMENTO (regla 8 de INICIO), y el cierre del prompt exige
  que el PRIMER texto visible sea ÚNICAMENTE la Primera Pregunta, con instalación (unzip, git)
  en silencio absoluto. Guardián semántico #9 nuevo: "FIJA EXPECTATIVAS al inicio" = frase
  derogada (cubre docs, prompts .txt y comandos).
- **La pregunta de las 3 opciones se parafraseaba** (el agente la redujo a "1. No tengo idea /
  2. Tengo una idea / 3. Mejorar app"): el propio prompt de arranque enseñaba ese resumen
  acortado — eliminado. INICIO PASO 2 ahora exige VERBATIM, y las 3 opciones se reescribieron
  mejor explicadas (qué hará el sistema en cada camino, para elegir sin dudar). La misma
  pregunta canónica quedó alineada en 00-SISTEMA-MAESTRO (modo chat).
- **Las decisiones técnicas se colaban al resumen de cierre** ("Decisiones técnicas y qué
  significan para ti: Next.js+Supabase, RLS, magic link…): regla 9(b) de INICIO extendida — la
  implementación tampoco aparece en el RESUMEN de sesión (vive en ESTADO.md); el resumen es de
  producto/negocio en simple. Refuerzo en CLAUDE.md (PREGUNTAR vs DECIDIR + nuevo FILTRO 1D de
  3 preguntas antes de enviar cualquier mensaje).
- **El agente inventó una ficha inexistente** (`FICHA-ARQUITECTURA.md`): Regla de Oro 3 ahora
  fija que los ÚNICOS artefactos de memoria son ESTADO.md + las 3 fichas — prohibido inventar
  fichas nuevas; la arquitectura va en ESTADO.md bajo "Decisiones técnicas".
- **El hook de arranque ahora inyecta el protocolo del primer mensaje** cuando no hay ESTADO.md
  (instalación en silencio + pregunta verbatim + nada antes ni después) — llega al contexto del
  agente ANTES de que pueda fallar, sin depender de que lea INICIO primero.
- INSTRUCCIONES: se le dice al usuario qué debería ver al arrancar (la pregunta, no narración
  técnica) y qué responder si no ("sigue el PASO 2 de INICIO.md: solo la pregunta").
- Ejemplos de fallo real añadidos a la regla 1B de CLAUDE.md ("Arranco la Sesión 1…", "Sistema
  instalado y listo", "Activé puntos de guardado…").

## [5.9.1] — 2026-08-03

**PATCH: SO 100% agnóstico de nicho.** El SO construye, perfecciona y potencia apps de CUALQUIER
nicho; ningún flujo puede estar dedicado a un vertical concreto. La capacidad de "meterse en el
nicho" viene de sus mecanismos genéricos: investigación de líderes (TABLA DE LÍDERES del 16 +
FLUJO A/B de INICIO), cliente ideal (57/FICHA-AVATAR), números del mercado (FICHA-MERCADO) y
descubrimiento con usuarios reales (44).

### Removed
- `PROMPT-NUEVA-APP-FITNESS.txt` y `/nueva-app-fitness`: era el único flujo del SO atado a un
  nicho específico (fitness/nutrición, con líderes fijados: Cal AI, MyFitnessPal, Strava, Fitbod).

### Added
- `PROMPT-NUEVA-APP.txt` y `/nueva-app` (reemplazo agnóstico): arranque rápido con respuestas
  adelantadas para CUALQUIER nicho — el usuario declara nicho + idea, y el sistema INVESTIGA los
  líderes de ESE nicho (no los asume), deriva el avatar, el mercado y la personalidad desde la
  audiencia concreta (compilador del 11), con referencia visual opcional bajo REFERENCIA=CONTRATO.
  Regla nueva explícita: "el nicho no cambia el protocolo — lo alimenta".

### Changed
- Inventarios actualizados al reemplazo (menú de CLAUDE.md, SETUP, REFERENCIA-RAPIDA, GUIA).
- El ejemplo de "llegó con todo claro" de INICIO ahora usa placeholders de nicho/app en vez de un
  vertical concreto. Los nichos que aparecen en matrices y ejemplos ilustrativos (matriz A-F,
  filas del 29, avatares de muestra) NO son sesgo: son herramientas parametrizadas por nicho y
  ejemplos de mecánica — cada proyecto deriva los suyos.

## [5.9.0] — 2026-08-03

**MINOR: el gran pase de sincronización.** Auditoría externa completa de los 160 archivos por 5
revisores especializados (diseño, copy/conversión, marketing/ventas, ingeniería, coherencia) con
verificación de hechos de plataforma contra documentación oficial (Hotmart, Anthropic, Next.js,
WebAuthn). Resultado: se eliminaron TODAS las contradicciones de doctrina conocidas, los errores de
hecho y los bugs de scripts, y el SO ganó un guardián que impide que vuelvan a entrar. **No cambia
el flujo del SO** (sesiones, comandos y Reglas de Oro intactos).

### Fixed — contradicciones de doctrina (una sola regla, propagada a todos los archivos)
- **Color**: la doctrina ago-2026 ("la paleta del líder se toma TAL CUAL, sin perturbar el hue")
  quedó a medio propagar en 5.8.0 — sobrevivía la regla vieja (±10-25°) en 9 puntos, incluido
  CLAUDE.md. Sincronizados: CLAUDE.md, 16, 29, 54, PLANTILLA-FICHA-ARTE, INICIO.
- **Onboarding**: convivían tres reglas (2-3 / 4-8 / 15-25 pantallas). Gana 02B: B2C 4-8 pasos
  (9-20 solo si el diagnóstico ES el producto, con evidencia); B2B ≤5 (ideal 2-3). Sincronizados:
  CLAUDE.md (interno y regla UX 3), REFERENCIA-RAPIDA, 15, DESIGN-CORE.
- **Revisor visual**: política única (obligatorio en las 4 pantallas del dinero + primera de cada
  plantilla/tipo nuevo; secundarias = medición + checklist anotado) y la invocación exige SIEMPRE
  las 4 entradas, incluida la ruta del CÓDIGO (antes CLAUDE.md la omitía y el corte ≥36/40 era
  inalcanzable). Sincronizados: CLAUDE.md ×3, RUBRICAS, PREFLIGHT, PLANTILLA-REVISION,
  revisor-visual, CHECKLIST-CIERRE.
- **Display de precios**: $/mes grande + TOTAL anual SIEMPRE visible en label + ahorro en "meses
  gratis" (nunca %). Corregidos 02B, 02C, 18, 50 — y el EJEMPLO canónico, cuya cuenta estaba MAL
  en 3 archivos ($107.88/$12.99 no da "2 meses gratis": da ~4). Números canónicos que sí cuadran:
  $12.99 mensual / $129.90 anual mostrado $10.83/mes = 2 meses gratis (≈17%), en 19/50/55.
- **Límites de copy**: una sola regla en 52 (headline 8-10 palabras, <8 ideal; excederse solo con
  justificación anotada); 19/42/prompts/comandos la citan. Estructura canónica: el orden de las 10
  secciones no cambia; la consciencia decide el ÉNFASIS (57 corregido); rescate compacta con 60.
- **Radius** (10 = 49: sm 8 chips · md 12 botones · lg 16 cards · xl 20 sheets), **espaciado**
  (escala sin 20; única excepción: margen lateral 16 o 20), **texto** (lectura ≥14px; labels
  11-13px), **íconos** (Lucide único por defecto; Phosphor capa expresiva opcional), **payback**
  (<12 ideal <6, umbral único en 40), **trial** (plazo = FICHA-MERCADO §4; 7 días pasa a ejemplo).

### Fixed — errores de hecho y plataforma (verificados contra doc oficial)
- **Hotmart**: SÍ soporta cambio de plan nativo — la FSM del webhook de 18 ahora mapea
  `SWITCH_PLAN` (antes "cancelar y recomprar", y el evento se ignoraba en silencio); sección nueva
  de carrito abandonado NATIVO (informe + webhook v2) y referencia rota de PROMPT-EMAILS corregida;
  Hotmart SÍ acepta software/apps (justificación del flujo corregida); dunning con rama PIX/boleto
  (no se auto-cobran) + Recuperador de Ventas en 58; tabla de palancas nativas de retención.
- **21-BACKOFFICE** resincronizado: estado `trialing` separado de `active`, el ~45% pasa de
  objetivo a techo de app store (02C), conversión medida hasta primer cobro >0 (60).
- **Atribución**: la etiqueta viaja como `src`+`sck` y se reconcilia por `sck` (34/36 corregidos —
  el `src` NO llega en el webhook).
- **Atribuciones de datos**: 95% subconsciente → Zaltman (no Cialdini); +234% → caso AppAgent (no
  RevenueCat); Ogilvy reformulado; Ford=Masterson aclarado; Fascinations → Mel Martin; Baymard con
  año; el "68%" inventado de los ejemplos 57/02B eliminado (desculpabilizar con la CAUSA, no con
  estadística sin fuente); "estudio de Figma 2026" y cifras similares sin fuente marcadas o
  eliminadas; léxico del avatar CDMX corregido ("el dinero/la lana", no "la plata"); PNL/VAK
  reformulado como "espejar los verbos del avatar".
- **Técnica**: RPC de créditos ahora invocable (public + grant a authenticated + nota BFF, 25);
  passkeys ya no rechazan a usuarios Apple (check de counter omitido cuando ambos son 0, 26); env
  vars unificadas a `*_PUBLISHABLE_KEY` (26/08/05); mínimos de prompt caching corregidos
  (1.024/2.048, 30); fallback server-side degradado a patrón condicional con camino manual (30);
  `llmJudge` implementado completo (31); `Deno.serve` + `AI_MODEL` por env (09); CSP sin
  `api.anthropic.com` en connect-src + camino Report-Only (09); `'use cache'` con nota de flag y
  `proxy.ts` de Next 16 (28/51); gate de bundle mide First Load por ruta (38); Sentry v9/v10 (08);
  E2E de pago sobre Hotmart, no Stripe (06); banner de cookies con "Rechazar" simétrico (47);
  supply chain + CVE-2025-29927 (27); pendientes → ESTADO.md (12); ejemplo de 04 con tokens.
- **Diseño/craft**: `background-attachment: fixed` sustituido por pseudo-elemento fixed (iOS
  Safari) en 53/54; View Transitions con el camino baseline nativo y el componente React como
  experimental (41); refs de "las 7 baseline" a DESIGN-CORE §6; glow condicionado a la ficha;
  erratas de 29 (celda corrupta, Space Grotesk quemada) y 54 (body neutro) corregidas; numeración
  12/12bis y variantes a-e reparadas (52/50).

### Fixed — scripts y hooks
- `test-integridad.mjs`: ya no crashea sin baseline (modo usuario-final con mensaje claro y exit 0);
  `fileURLToPath`; etiquetas de versión veraces; rutas y versiones actualizadas a v5.9.0.
- `audit-so.sh`: falla claro si falta ripgrep (antes los checks de seguridad pasaban en verde sin
  él — fail-open).
- `release.sh`: el check de paridad ya no SOBRESCRIBE AGENTS.md — falla y pide sincronizar a mano.
- `audit-diseno.sh`: whitelist de la escala canónica (antes marcaba como crítica la propia
  53-PANTALLA-CANONICA), Inter-como-body degradado a aviso, filtro por ruta (no por línea), grises
  ampliados; mismo arreglo de filtro en `post-edit-diseno.sh`. Hooks con tsc `--incremental`.

### Added
- **`MAPA-DE-AUTORIDAD.md`**: tabla doctrina → archivo que manda (ruteada desde CLAUDE.md) — si dos
  archivos parecen contradecirse, esta tabla decide sin razonamiento.
- **GUARDIÁN SEMÁNTICO** en `audit-so.sh` + sección (h) del SELF-CHECK: 8 greps de doctrina
  (perturbación de hue, 15-25, NUNCA el total, % de ahorro anual, counter WebAuthn, ANON_KEY,
  `supabase db query`, cancelar y recomprar) con la regla del mantenedor: todo cambio de doctrina
  futuro entra con su grep — sin grep, no está propagado.
- **Calidad diseño**: accesibilidad operativa de overlays (focus trap/retorno/inert, 49);
  `ChartContainer` canónico con código (tokens→Recharts, tabla sr-only, skeleton, 17); sección
  OKLCH en 10 (hace medible el "tinte" de los neutros); verificación a 360px y QA de dos temas en
  PREFLIGHT; scroll-driven animations CSS (41); presupuesto Lottie (22); `/dev/kit` permanente
  (49); longitud de línea 45-75ch (14); clamp() y container queries (43).
- **Calidad copy**: doctrina dialectal + campos nuevos de FICHA-AVATAR (registro, léxico local,
  palabras vetadas, disparador de compra, inventario de prueba día-1); 5ª objeción universal de
  PAGO/CHECKOUT LATAM con microcopy de Hotmart (57); protocolo de mecanismo real con test de
  falsabilidad (19); regla del output real como demo (19); gate humano de 5 segundos pre-tráfico +
  subcampeonas guardadas para A/B (52); sub-checks de message-match y garantía en la rúbrica /20.
- **Calidad marketing**: Google Search de marca desde el día 1 + árbol de decisión de canal +
  cadencia de creative testing + expectativa honesta de afiliados (34); comunidad post-compra
  (58/59); párrafo web vs app store y price parity por país (02C); ranuras PIX/boleto/Pix
  Automático y price parity en FICHA-MERCADO; costo de WhatsApp API (34).
- **Dieta de contexto**: las sesiones de INICIO B5 ahora indican las SECCIONES a leer de los
  archivos grandes, con la regla "leer las secciones, no los archivos enteros".

### Changed
- Inventarios sincronizados: SETUP (27 comandos, con `/conversion`), MENÚ de CLAUDE.md (27
  prompts), REFERENCIA-RAPIDA (añade SECUENCIA-MAESTRA, FICHA-MERCADO, plantillas y 12 prompts),
  GUIA (21 situaciones + ficha de `/nueva-app-fitness` + mapeo comando↔prompt), self-check (rango
  62), números de sesión de INSTRUCCIONES/PLANTILLA-ESTADO, PREFLIGHT "~40 líneas".
- Fe de erratas añadida a los reportes v5.5.0 (la afirmación sobre el 15-25 era incorrecta) y
  v5.6.0 (cinco → seis artefactos). La historia no se reescribe; se anota.

## [5.8.0] — 2026-08-01

**MINOR: verificación que no miente, y números del mercado que no se heredan.** Convierte los
hallazgos de una construcción real end-to-end (app educativa con IA, tráfico pago, primera venta) en
reglas universales. **No cambia el flujo del SO**: no reordena fases, no renombra comandos y no toca
las 7 Reglas de Oro — todo entra dentro de los archivos que ya existían.

### Added
- `PLANTILLA-FICHA-MERCADO.md`: tercera ficha de memoria persistente, junto a arte y avatar. Guarda
  los NÚMEROS del nicho (precio típico, ciclo de decisión, medios de pago reales, plazos que la
  pasarela permite) con **fuente, fecha y vencimiento**. Las reglas del SO ahora citan RANURAS de
  esta ficha en vez de constantes.
- `06-TESTING.md`: "PRESENCIA ≠ LEGIBILIDAD" (el test que pasa mientras el usuario no alcanza a
  leer), verificación de eventos cuando la plataforma bloquea navegadores automáticos, y plan B
  escalonado cuando la captura de pantalla falla.
- `12-FLUJO-AGENTICO.md`: "MEDIR EL LAYOUT, NO DECLARARLO" (con cada variante de contenido, no una),
  "EL ENTORNO DE DESARROLLO MIENTE" y las trampas de edición masiva que pierden trabajo ya hecho.
- `08-DEPLOY.md`: verificar la publicación buscando una cadena que solo exista en la versión nueva
  —y leyendo el DOM cuando el contenido se arma en el navegador—, más las fricciones conocidas
  (variables enmascaradas que rompen el build, cuenta de CLI cambiada).
- `36-ANALITICA-Y-EVENTOS.md`: saltar vs abandonar como dos problemas distintos con eventos de salida
  explícita, no re-disparar eventos al restaurar progreso, eventos contaminados por terceros, y una
  predicción escrita antes de cada cambio.
- `14-LEYES-DE-DISENO.md`: "UN OBJETO, NO UNA LISTA DE COSAS" (estructura antes que contenido) y
  falsa afordancia (lo que parece tocable, se toca).
- `42-UX-WRITING.md`: el mecanismo no es la promesa, nada de jerga del sistema en la interfaz, y
  cuidado al presentar datos que escribió el usuario (capitalización, concordancia, no truncar).
- `10-DESIGN-TOKENS.md`: tokens para colores de marcas ajenas.
- `30-INTEGRACION-IA.md`: caché envenenada — validar antes de guardar **y** al leer.
- `38-PERFORMANCE-BUDGET.md`: tiempo hasta la primera acción tocable como métrica del embudo, y el
  peso de los scripts de terceros como decisión explícita.
- `CHECKLIST-CIERRE.md`: bloque condicional para pantallas que miden, venden o publican.

### Payments and economics
- `18-VENTA-HOTMART.md`: **REGLA DURA `garantía > prueba`** — si coinciden o la garantía es menor, la
  cobertura real es CERO y la garantía no se menciona. Protocolo de checkout real (abrirlo en móvil,
  tocar cada medio de pago para detectar los que se muestran pero están inertes, comprobar si el
  plazo de garantía aparece) y verificación uno a uno de los parámetros de URL de la pasarela,
  comparando con y sin.
- `02C-PRICING-Y-MODELO-DE-NEGOCIO.md`: aviso de que sus cifras son ejemplos de datos bien citados,
  no valores por defecto; precio, prueba y garantía salen de `FICHA-MERCADO.md`.

### Security
- `47-LEGAL-FISCAL-Y-PRIVACIDAD.md`: las promesas escritas mandan sobre la táctica de crecimiento —
  releer política y microcopy antes de enviar datos a terceros, con tres salidas legítimas y la
  decisión en manos del dueño, nunca del agente.

### El craft, no solo el color (octava prueba en vivo: las propuestas seguían viéndose planas)
Las propuestas visuales seguían pareciendo "genéricas / AI slop" **aunque la paleta y la tipografía
fueran las correctas**. Dos causas encontradas, las dos corregidas en `29-REFERENCIA-VISUAL`:
- **La regla que desafinaba las paletas buenas, ELIMINADA.** El SO obligaba a mover el hue ±10-25°
  "para que dos apps no salieran iguales". Una paleta de un líder no es una lista de colores: es un
  **sistema de relaciones** con contrastes medidos y pareja tipográfica pensada. Rotar un hue rompe
  esas relaciones y produce una versión *ligeramente desafinada* de algo que funcionaba — que es
  exactamente el aspecto "hecho con IA": nada mal del todo, nada bien del todo. Ahora **la paleta y
  la tipografía del líder se toman íntegras**, y la diferenciación sale de qué líder eliges, la
  composición, el dispositivo ownable y el copy. Con la línea explícita de qué NO se toca nunca
  (nombre, logo, ilustraciones, copy y pantallas literales): se toma el idioma, no el discurso.
- **EXTRAER EL CRAFT, NO SOLO EL COLOR — los 7 materiales.** La causa de fondo: de una app líder se
  extraía únicamente el color y el par tipográfico. Lo que hace premium a una interfaz no es el hue,
  es el MATERIAL. Protocolo nuevo con receta CSS para los 7: superficie con degradé y luz superior ·
  sombras en 2-3 capas · borde hairline o ninguno (nunca `1px solid #ddd`) · botón con degradé tonal,
  luz interior y sombra TINTADA de su propio color · íconos siempre en chip · fondo con profundidad ·
  dato héroe con cifras tabulares. Con el test de un vistazo: si solo puedes describir la pantalla
  hablando de colores y tamaños, está plana.
- Exigible en el comparador (`54`) y en el `CHECKLIST-CIERRE`.

### Certeza, lenguaje y variación visual (séptima prueba en vivo: app-prueba9)
- **Prohibido anunciar acabado pobre** (`CLAUDE.md`/`AGENTS.md` regla 1C): "voy a crear una página
  simple", "una versión básica", "un MVP rápido y después lo mejoramos". El usuario no puede juzgar
  si "simple" alcanza; la frase solo baja su confianza y compromete un acabado pobre antes de
  empezar. Se comunica el ALCANCE (qué entra en esta sesión), nunca el nivel de acabado.
- **La duda se resuelve ANTES de proponer, no se traslada** (`01-IDEACION`): el agente cerró una
  propuesta con "todavía nadie ha pagado por esta idea… eso no prueba que un usuario LATAM pague".
  Era CIERTO —por eso el arreglo no es fingir certeza— pero es exactamente lo que la SEÑAL DE PAGO
  existe para resolver: si no se verificó, la idea no estaba lista. Y la validación no desaparece,
  cambia de tono: se presenta como PASO DEL PLAN (la landing mide desde el día 1, que es lo que ya
  manda la secuencia maestra) en vez de como advertencia de que la idea podría ser mala. Con la
  distinción explícita entre duda difusa ("no sé si funcionará", inútil) y dato faltante nombrado
  ("no encontré cuánto cobran en México", accionable).
- **Divergencia por construcción** (`29-REFERENCIA-VISUAL`): distintos usuarios recibían propuestas
  visuales casi idénticas. La causa no era falta de paletas —hay decenas— sino que el REGISTRO
  ANTI-REPETICIÓN vive en el `ESTADO.md` del proyecto y **en un proyecto nuevo está vacío**: sin nada
  que vetar, el agente elegía siempre la fila "más segura" del nicho. Ahora las 3 opciones nacen de
  clases estructuralmente distintas — **la del líder, la del nicho vecino, y la del modo contrario** —
  todas de filas reales de líderes (la regla anti-invento sigue vigente), con comprobación de que
  usan clases tipográficas distintas y de que cada una se puede nombrar con una palabra diferente.
- `12-FLUJO-AGENTICO`: nota explícita de que el SO se usa con planes económicos y modelos de gama
  media, y de que la vía de ahorro es **no hacer las cosas dos veces**, nunca entregar menos.

### Calidad de la primera entrega (sexta prueba en vivo: app de deudas)
Probando el SO en un proyecto nuevo, la comparativa de direcciones salió como tres cajas planas
—el dueño la describió como "muy básica"— y la landing quedó correcta pero pobre en densidad
visual. **Diagnóstico verificado: el SO NO manda hacer versiones básicas primero** (se buscó esa
regla y no existe), y `55-DISENO-DE-LANDING` §1.3 ya especificaba los placeholders. Otra vez el
patrón: la doctrina estaba, faltaba hacerla exigible.
- `54-BANCO-DE-DIRECCIONES.md` → **la comparativa es un escaparate, no un formulario**: vara de
  calidad concreta para la PÁGINA en sí (fondo con profundidad, 3 frames de igual medida, marco de
  dispositivo real con bisel/isla/barra de estado, pantalla llena con datos semilla, muestra de
  paleta, y el nombre de cada fuente escrito en su propia fuente). Es la primera impresión visual
  que recibe el usuario: si se ve amateur, ya no confía en ninguna de las tres opciones.
- `32-DEL-MVP-AL-PRODUCTO.md` → **NO EXISTE LA "PRIMERA VERSIÓN SENCILLA"**. El pase de pulido
  diferido nunca llega, y traslada al dueño —que no es diseñador y solo puede decir "no me
  convence"— un trabajo que es del agente. Con la tabla de qué SÍ es legítimo posponer (contenido
  que aún no existe → placeholder honesto y bien hecho) y qué nunca (densidad, profundidad,
  jerarquía, estados, datos semilla).
- `52-COPY-VISUALES-CONVERSION.md` → **cinco correcciones de copy con evidencia medida**: el
  mecanismo no es la promesa · el precio nunca aparece desnudo · la garantía dura más que la prueba ·
  un aviso que empieza con "no te asustes" instala el susto (medido: se comía 2 de cada 3) ·
  personalizar con lo que la persona ELIGIÓ y no con un dato que hay que pedirle (medido: la
  pantalla que lo pedía expulsaba al 70%).
- `CHECKLIST-CIERRE.md`: bloque condicional para comparativas y landings.

### Generación reescrita: categoría probada × audiencia (quinta prueba en vivo)
La corrección anterior sobrecorrigió: al empujar hacia nichos menos obvios, el agente propuso a un
usuario **no técnico** un generador de anuncios en VIDEO para empresas — buen negocio quizá,
inconstruible para él. Los dos extremos fallan: categorías de moda ya tomadas, o nichos raros
imposibles de construir. La sección se **reescribió entera** (no se apiló otra capa) sobre un eje
distinto:
- **La categoría sale de las que históricamente monetizan** (Salud y Fitness, Foto y Video,
  Productividad, Finanzas, Educación — datos que el Pilar 5 ya citaba pero que la generación no
  usaba como eje). No hay directorio mágico de "apps garantizadas"; lo más cercano son los informes
  anuales de categoría, y ahora se anotan con fuente y fecha en `FICHA-MERCADO.md`.
- **La variación entre usuarios sale de la AUDIENCIA, no de inventar categorías raras.** Categoría
  probada × audiencia específica × momento de dolor. Repetir categoría es correcto y deseable —son
  las que pagan—; repetir la misma app exacta, no.
- **GATE 4 — CONSTRUIBILIDAD (nuevo gate duro):** lista explícita de lo que este SO construye con un
  usuario no técnico (texto→texto, foto→análisis, voz→texto, formulario→documento, registro→insight)
  y lo que queda FUERA (video, integraciones con sistemas de terceros, scraping, marketplaces de dos
  lados, tiempo real multi-usuario). Una app que el usuario no puede construir **no es una
  oportunidad, es una frustración con fecha**.
- **Objetivo explícito de 5 oportunidades.** Si no salen, la segunda ronda explora OTRAS audiencias
  de las MISMAS categorías probadas — nunca salta a nichos exóticos para llenar el número, y el
  umbral de calidad no baja.
- Coherencia: los "3 GATES" pasan a 4 en los 7 sitios donde se nombraban, tabla de puntuación
  incluida.

### Generación de candidatas (cuarta prueba en vivo: 15 categorías → 1 idea)
El agente investigó 15 categorías y presentó UNA sola oportunidad, concluyendo que el mercado estaba
tomado. Al revisar las 15 —calorías, journaling, CV, fitness, finanzas, mascotas, armario virtual,
inglés…— **14 eran "categorías de apps de IA de consumo"**: la misma lista que busca todo el mundo,
clonada desde hace dos años. El filtro funcionaba bien; **las candidatas eran malas**.
- `01-IDEACION.md` → **DE DÓNDE SALEN LAS CANDIDATAS**: cinco pozos de generación, con la regla de
  que una ronda toma de **al menos 3 distintos** y **máximo 3 del arbitraje** (el pozo más agotado,
  y el único que el SO documentaba). Los nuevos: trabajo manual caro dentro de un oficio; **lo que
  hoy se le paga a un humano** (marketplaces de servicios — la señal de pago más fuerte que existe,
  porque ya está probada); cambios normativos recientes que crean una obligación con fecha; y
  comunidades reunidas POR un problema.
- **Regla de profundidad:** si pasan menos de 3, NO se presenta — se hace una segunda ronda desde
  pozos distintos. Presentar una sola idea tras una ronda pobre no es honestidad, es rendirse pronto.
  ⚠️ Esto **no reabre la cuota** de rellenar con ideas flojas: el umbral de calidad no baja nunca; lo
  que sube es el esfuerzo de búsqueda.
- `INICIO.md` A2c reescrito para generar desde los pozos, empezando por el de señal de pago probada.
- Presupuesto ajustado: ~10-14 búsquedas **por ronda** en vez de 15-20 sueltas. Medido: 15 categorías
  genéricas costaron >100k tokens y produjeron una idea. **Generar mejor cuesta menos que filtrar más.**

### Arranque limpio (tercera prueba en vivo)
El primer mensaje del SO llegaba como un muro de texto: narración de la instalación (descomprimir,
mover carpetas, iniciar git, "sistema instalado y listo"), cómo iba a ser el trabajo, las cuatro
cuentas que tendría que crear, que llevaría varias sesiones y todo lo que costaría dinero — **todo
antes de preguntarle al usuario qué quiere hacer**. Información correcta en el momento equivocado.
- `INICIO.md` PASO 2: **el primer mensaje contiene la pregunta y nada más**, con la lista explícita
  de lo que está prohibido incluir. Y la instalación no se narra: se hace.
- `INICIO.md` regla transversal 8: las expectativas se **reparten en su momento** en vez de soltarse
  juntas — el modelo de trabajo en 1-2 líneas al elegir camino, las cuentas concretas al llegar a la
  fase de servicios externos, el aviso de dinero justo antes del gasto, y lo de "esto lleva varias
  sesiones" al CERRAR la primera, cuando ya vivió el ritmo.
- `CLAUDE.md`/`AGENTS.md` regla de comunicación **1B: no narres el trabajo interno, muestra el
  resultado.** Un problema que el agente resolvió solo no se cuenta: se resolvió. El silencio se
  rompe solo si algo falló y le afecta, hay riesgo o costo, o hace falta una decisión suya.

### Presupuesto de tokens (para planes limitados)
Segunda prueba en vivo: el agente presentó **2 oportunidades** —una de ellas admitiendo "evidencia
moderada, no fuerte"— y el painkiller como adjetivo ("alto") en vez de número. Dos causas, ambas
corregidas:
- **Contradicción introducida en 5.8.0 y ahora resuelta:** `INICIO.md` A3 exigía "no menos de 3"
  mientras `01-IDEACION.md` decía "presenta solo las que pasan". Una cuota mínima **obliga a rellenar
  con ideas flojas**. Eliminada: se presentan las que salen PROPONER, aunque sea una; si salen cero,
  se dice y se busca en otras categorías.
- El formato de A3 ahora exige el painkiller **en número** ("alto" no es una puntuación) y los tres
  gates en SÍ/NO, y remite a la tabla de puntuación como paso previo obligatorio.

`12-FLUJO-AGENTICO.md` → **PRESUPUESTO DE TOKENS DEL AGENTE**, con medidas reales tomadas con este
SO: la investigación de ideas cuesta ~64k tokens **una sola vez**, mientras el revisor visual cuesta
~78-92k **por pantalla**. En un proyecto de 10 pantallas las revisiones cuestan ~10× lo que costó
elegir la idea. Conclusión documentada: **no se recorta la investigación** (es el mapa antes de un
viaje largo); se aplica criterio en el revisor —obligatorio en las 4 pantallas que deciden el dinero,
medición + checklist en las secundarias—, no se releen documentos en la misma sesión, y la
investigación se acota a ~15-20 búsquedas parando en cuanto haya 2-3 candidatas que pasen.
Nota de coste añadida a la Regla de Oro 7 de `CLAUDE.md`/`AGENTS.md`.

### Ideación (probado en vivo: el agente incumplía su propia doctrina)
Al probar el FLUJO A, el agente entregó **ocho candidatas comparadas solo por "tracción afuera" y
"hueco en español"**, sin puntuar un pilar ni emitir un veredicto de gate, y recomendó tres — una de
ellas de uso por evento, que el GATE de retención descalifica, presentada "con una nota honesta".
`01-IDEACION.md` ya prohibía las dos cosas. El problema no era la doctrina: era que nada obligaba a
aplicarla. Cuatro correcciones:
- **Contradicción interna resuelta:** el encabezado del arbitraje se autoproclamaba "el criterio más
  importante" mientras el cuerpo decía que los pilares son los que deciden. Ahora dice lo que es —
  dónde buscar, no qué proponer— y declara inválido un informe de arbitraje sin puntuación.
- **Artefacto obligatorio nuevo:** tabla de puntuación por candidata (painkiller /20, los 3 gates en
  binario, canal de alcance con CPM y lugar concreto, crecimiento) con **veredicto mecánico**
  PROPONER/REFORMULAR/DESCARTAR. Prohibido presentar lo que el propio agente sabe que es flojo:
  si salen cero candidatas, se dice y se busca otra vez.
- **Los 4 pilares de mercado de Hormozi** mapeados a los 8 existentes, con el que faltaba:
  **mercado en crecimiento**, y la advertencia de que "no hay competencia" suele significar "no paga".
- **Protocolo de búsqueda por señal:** cuatro señales (duele / pagan / se les alcanza / crece) con
  fuentes y queries distintos para cada una. Incluye las que faltaban para probar PAGO —top grossing
  por país, estimaciones de ingresos, y **Biblioteca de Anuncios de Meta** (un anuncio que lleva meses
  corriendo es rentable; nadie sostiene un anuncio que pierde)— y para probar ALCANCE.
- **Escenario B (el usuario trae su idea):** pasa por la misma tabla, sin excepciones, con guía para
  decirlo sin apagar a nadie.

### Enforcement (gates que dejan de ser solo doctrina)
- `.claude/hooks/pre-stop.sh`: tres gates de venta comprobables mecánicamente, que impiden cerrar
  una sesión con (a) copy de venta escrito sin `FICHA-AVATAR.md`, (b) promesas de prueba/garantía/
  precio sin `FICHA-MERCADO.md`, y (c) **la regla dura `garantía > prueba` incumplida**, leyendo los
  dos plazos de la ficha. Probados los 5 escenarios (sin copy de venta no dice nada; los tres casos
  malos bloquean; el caso bueno pasa) para que el hook no genere falsos positivos — un hook que
  avisa sin razón se acaba desactivando.
- `scripts/audit-so.sh`: `FICHA-MERCADO.md` registrada como artefacto que genera la app.
- `scripts/test-integridad.mjs`: reapuntado para certificar v5.8.0 contra v5.7.0.
  **Resultado de la certificación: 100 verificaciones, 0 fallos.**
- `REPORTE-CERTIFICACION-TECNICA-v5.8.0.md`: evidencia reproducible del paquete.

### Changed
- Regla de Oro 3 de `CLAUDE.md`/`AGENTS.md`: la memoria pasa de dos fichas a tres, con la advertencia
  explícita de que los números de ejemplo del SO no son valores por defecto.
- `.claude/hooks/post-edit.sh`: además de `tsc`, lintea el archivo editado (silencioso si el proyecto
  no tiene ESLint). Los errores de REGLAS son los que más caro salen si aparecen al final.
- `.claude/hooks/session-start.sh`: inyecta también `FICHA-MERCADO.md`, o avisa si falta.
- `PREFLIGHT-PANTALLA.md`: dos puntos nuevos — medir lo medible con cada variante, y que lo que hay
  que leer no se vaya solo.

## [5.7.0] — 2026-07-22

**MINOR: publicación segura, persistente y comprobable.** Elimina la falsa equivalencia entre subir a
GitHub, ejecutar `vercel link` y conectar GitHub→Vercel; además impide que el agente solicite secretos.

### Added
- `62-PUBLICACION-SEGURA-Y-CONTINUA.md`: máquina P0-P9 para identidad, Git, integración persistente,
  Supabase target/migraciones, ambientes, Preview, dominio/callbacks, Production y operación posterior.
- `PLANTILLA-CERTIFICADO-PUBLICACION.md`: evidencia de owner/repo/proyecto/rama/root/project-ref,
  aislamiento de entornos, SHA, callbacks, rollback y segunda publicación automática.
- Matriz de reparación para repo invisible, permisos GitHub App, proyecto duplicado, repo transferido,
  build omitido, env ausente, Supabase incorrecto, Auth en localhost y webhooks rotos.

### Security
- Protocolo Cero Secretos en Chat: el agente nunca pide/acepta/repite valores; el dueño los introduce
  directamente en el proveedor. Exposición activa revocación, rotación, búsqueda histórica y redeploy.
- Bloqueo de `db reset --linked`/seed en Production, verificación de project-ref y dry-run antes de migrar.
- Separación obligatoria de Development/Preview/Production y redeploy tras cambios de variables.

### Verification
- El deploy solo cierra tras Preview y Production desde Git con SHA coincidente, más un segundo commit
  canario y su reversión auto-desplegados sin Vercel CLI.
- Integridad pasa de cinco a seis artefactos obligatorios e incorpora `PUBLICATION-CERTIFICATE.md`.
- `scripts/test-integridad.mjs`: 100 verificaciones, 15 mutaciones rechazadas y reauditoría del ZIP;
  evidencia en `REPORTE-CERTIFICACION-TECNICA-v5.7.0.md`.

## [5.6.0] — 2026-07-21

**MINOR: integridad de lanzamiento verificable.** Convierte los hallazgos críticos de una auditoría
real de una app educativa con IA en gates universales para cualquier nicho.

### Added
- `61-INTEGRIDAD-DE-LANZAMIENTO.md`: 10 gates binarios para auth/backdoors, pagos/ledger, claims,
  consentimiento/menores, RPC de valor, IA/evals/economía, multimoneda, UX honesta, repositorio
  reconstruible y piloto controlado.
- Cinco artefactos obligatorios de evidencia y `PLANTILLA-INTEGRIDAD-LANZAMIENTO.md`.
- `PROMPT-INTEGRIDAD-LANZAMIENTO.txt` + `/integridad-lanzamiento`.

### Security
- Gamificación cambia de `for all` propio a SELECT propio; XP/gemas/logros solo mutan mediante RPC
  estrecha que verifica acción e idempotencia y calcula recompensas en servidor.
- Inventario obligatorio de rutas de prueba/bypass/impersonación, funciones SECURITY DEFINER,
  grants y buckets; admin separado y cero OTP autoverificado.
- Consentimiento ligado a identidad/versión, sin preselección desde localStorage; protección
  reforzada de menores y archivos privados.

### Payments and economics
- Hotmart valida catálogo, separa dedupe técnico de ledger económico, evita doble ingreso
  APPROVED/COMPLETE y modela `access_until`, cancelación, expiración, refund y chargeback.
- Backoffice en unidad menor y moneda explícita; cero sumas COP/USD; conciliación y distinción entre
  caja, ingreso devengado y MRR.
- IA reserva atómicamente retries/fallbacks, usa rate limit distribuido, caché con alcance y evals
  compilados por dominio; economía certificada en mediana/p95/heavy user.

### Quality gates
- CI exige lint, tests, build, E2E y clean-room bootstrap; warnings requieren excepción trazable.
- Release manifest alinea git SHA, deploy, migración y evidencia. El certificado /100 no puede
  compensar un bloqueante de integridad.
- `scripts/test-integridad.mjs`: 69 contratos/regresiones sobre v5.5/v5.6, mutation testing,
  hooks funcionales y re-auditoría desde ZIP; reporte reproducible en
  `REPORTE-CERTIFICACION-TECNICA-v5.6.0.md`.

## [5.5.0] — 2026-07-21

**MINOR: operacion de conversion medible desde trafico hasta primer cobro.** Integra las lecciones
del rescate de una app B2C con Hotmart: el SO deja de asumir que el problema es copy, evita peajes
pre-checkout y separa exposicion, checkout, trial y cobro.

### Added
- `60-OPERACION-DE-CONVERSION.md`: funnel canonico, sesiones anonimas de 30 minutos, QA por sesion,
  atribucion de 30 dias/click IDs, visibilidad real, Hotmart directo, diagnostico por etapa,
  backoffice desde dia 1 y checkpoint operativo honesto.
- `PROMPT-CONVERSION.txt` + `/conversion`: auditoria de datos, recorrido real, causa raiz,
  implementacion y verificacion sin prometer uplift.
- `scripts/audit-so.sh`: valida JSON, shell, referencias, fences, ruteo, comandos, igualdad
  AGENTS/CLAUDE y dependencias silenciosas antes de distribuir.

### Changed
- Onboarding: una pregunta por pantalla y longitud ganada por valor (1-3/max 5 utilidad; 4-8
  personalizado; mas de 8 solo con evidencia), no 15-25 por categoria.
- Paywall: formato corto por defecto, hasta 3 beneficios y 2 planes, precio/renovacion visibles.
- Hotmart: `off` + `showOnlyTrial=1` + `sck`; `email` solo si ya existe legitimamente; sin
  formulario o transicion obligatoria antes del checkout.
- Analitica/backoffice: `paywall_visto` exige viewport real; `checkout_iniciado`,
  `trial_iniciado` y `primer_cobro_confirmado` son eventos distintos; panel de conversion antes
  de las primeras ventas.
- Landing: primer viewport verificado en 390x844 y 1440x900, CTA anonimo a onboarding por defecto
  y sticky en dos estados.
- Prompts/comandos de landing, onboarding-paywall, analitica y backoffice alineados con el contrato.

### Fixed
- Hooks PostToolUse/Stop ya no dependen silenciosamente de Python; usan el Node requerido por el SO.
- Ruteo, indices y secuencia maestra incluyen el modulo 60 y siembran eventos al construir.

---

## [5.4.2] — 2026-07-07

**PATCH: protocolo A/B/C — fuentes garantizadas + listón de showcase (2ª prueba real).** Las
tipografías declaradas no cargaron (embed base64 fallido en silencio → las 3 opciones con la misma
serif de fallback) y las opciones eran correctas pero planas frente a los showcases reales.

### Fixed (54 + 16 + CLAUDE.md)
- **CARGA DE FUENTES GARANTIZADA**: receta canónica de Google Fonts (preconnect + display=swap, 1
  URL con todas las familias) · FALLBACK-TRAMPA (cada familia con fallback monospace en la
  comparativa — si la fuente no carga, el fallo GRITA en el screenshot) · verificación obligatoria
  clase por clase antes de presentar ("¿la A se ve redondeada? ¿la B grotesk?") · alternativa
  offline con @font-face verificando el peso del archivo.
- **REGLA DURA #3 — EL LISTÓN DE SHOWCASE**: las 3 opciones al nivel de Mobbin/Dribbble/Pinterest
  actuales — cada una con forma dominante propia, SISTEMA DE ÍCONOS propio (chip de color pleno,
  duotone o soft-3D con receta CSS — nunca pelados), elemento gráfico firma (blob/patrón/sticker/
  spot) y un momento de COLOR VALIENTE (coraje ≠ neón, capa anti-IA vigente). MOCKUPS LLENOS con
  datos semilla (media pantalla vacía = rehacer). 5 gates sobre el screenshot en el formato de
  presentación.

---

## [5.4.1] — 2026-07-07

**PATCH: protocolo A/B/C endurecido (hallazgo de prueba real).** El agente presentaba las 3
opciones solo en texto (preview en boilerplate) y como 1 diseño con 3 acentos.

### Fixed (54 + 16 + PLANTILLA-FICHA-ARTE + CLAUDE.md)
- **El entregable es un archivo visual**: página comparativa `direcciones-abc.html` autocontenida
  (o /dev/direcciones) con los 3 mockups lado a lado en frames de 375px; PROHIBIDO presentar solo
  texto o preguntar sin pegar la ruta + screenshot auto-verificado ("si el preview muestra el
  boilerplate, NO has terminado").
- **Divergencia real — regla de los 4 ejes**: cada opción diverge en ≥3 de 4 (clase tipográfica de
  fila DISTINTA del 29 · composición anclada a líderes distintos · paleta real · dispositivo);
  TEST DE DIVERGENCIA en escala de grises como gate. Con referencia: divergencia obligatoria en
  composición + dispositivo.
- Corregida la causa raíz documentada: el 54 decía "las 3 variantes comparten el mismo TSX (solo
  cambia globals.css)" — reescrito: cada opción tiene su PROPIA composición y tipografía.

---

## [5.4.0] — 2026-07-07

**MINOR: los 6 huecos de la "versión definitiva" (análisis estratégico de la experiencia completa).**

### Added
- **EL PUENTE DEL TRIAL (02C)**: mapa D1-D7 dentro de la app — primera victoria D1, insight de SUS
  datos D2-D3, inversión visible D4-D5, AVISO PRE-COBRO honesto D6 (baja reembolsos/chargebacks),
  agradecimiento+desbloqueo D7; indicador "Día 3 de 7" neutro; cada día trazable a un deseo de la
  ficha; métricas del puente. + C4bis en 50 (la verdad del puente bajo el CTA) + 58 (primera línea
  del dunning) + PLANTILLA-ESTADO.
- **TEST DE ESTRENO (48)**: la IA recorre landing→onboarding→paywall→primera sesión ENCARNANDO al
  avatar (dolor activo, objeción, su hora del día) y entrega narración en 1ª persona + las 3 fugas
  con fix — la evaluación EXPERIENCIAL que las rúbricas por pantalla no ven.
- **CERTIFICADO /100 (48 + /pre-lanzamiento)**: un solo número para el dueño con 6 pilares (VENTA
  /20 · FUNNEL /20 · PRODUCTO /20 · CONFIANZA /15 · VELOCIDAD /10 · RETENCIÓN /15), regla honesta
  (no medido = 0 y se dice), bandas ≥90/80-89/<80, guardado en ESTADO.md.
- **DATOS SEMILLA (32)**: la app nunca se enseña vacía — seed realista del mundo del avatar
  (comercios/nombres/montos del mercado, fechas relativas a hoy, progreso 40-70%) para screenshots
  del carrusel, revisor y demo; jamás en producción (flag). Tabla por nicho A-F. Cableado en
  SECUENCIA (prerrequisito del carrusel), PREFLIGHT y checklist núcleo ítem 2.
- **DESKTOP SIN VERGÜENZA (43 §13)**: decisión única por app (columna centrada max-w-md default
  B2C vs adaptativo real B2B), landing siempre adaptativa, funnel siempre max-w-md, screenshot
  1440px de las 3 pantallas clave.
- **RECETAS DE PROMPTS DESDE FICHA-ARTE (20)**: cero prompts genéricos de imagen — plantilla base
  compuesta con los hex/mood/dirección de la ficha, PACK MÍNIMO (logo, OG, hero, serie de
  ilustraciones, mascota→11, share card→56), coherencia de una sesión, fallbacks honestos.
- 3 filas nuevas de ruteo + Regla de Oro 6 y fila del 48 actualizadas.

---

## [5.3.0] — 2026-07-07

**MINOR: protocolo A/B/C universal + sistema de íconos y detalles premium.**

### Changed — PROTOCOLO A/B/C (54, ahora universal)
- La elección de estilo visual es SIEMPRE entre 3 opciones RENDERIZADAS a 375px de la misma
  pantalla clave (/dev/direcciones): sin referencia → 3 FUSIONES distintas de los líderes del
  nicho; CON referencia → 3 INTERPRETACIONES FIELES del contrato (divergen solo en lo que la
  imagen no fija). El usuario ELIGE A/B/C, COMBINA lo mejor ("la B con la tipografía de la A" →
  se re-renderiza), pide OTRAS 3 (sin repetir, descartadas anotadas) o ajusta un detalle. Es de
  las pocas preguntas legítimas al usuario (gusto). Propagado a 16 (contrato + PASO 0 + tarjeta),
  INICIO (Sesión 2 + análisis de referencias), PLANTILLA-FICHA-ARTE (campo de elección),
  CLAUDE.md (doctrina + 2 filas de ruteo) y aclarado el fallback de lógicas del 16.

### Added — SISTEMA DE ÍCONOS Y DETALLES (55, obligatorio en toda sección)
- REGLA MADRE: ninguna sección de landing/onboarding/paywall es SOLO texto; emojis como íconos
  PROHIBIDOS salvo pedido explícito. Íconos SVG (Lucide/Phosphor) siempre en contenedor premium
  (chip 40-48px, fondo acento 8-12%, radius del kit) — receta Tailwind incluida.
- Receta CSS copiable de HAIRLINE 1-2px con degradé (padding-box/border-box + color-mix), solo
  en 1-3 elementos clave por vista (el plan recomendado del pricing es el lugar canónico).
- REPERTORIO DEL DISEÑADOR: 10 detalles con mini-receta (number chips de pasos reales, separadores
  con fade, badge pills, textura del 54, sombras de color, highlight de titular sin gradiente de
  texto, bento, marcos de screenshot, checkmarks custom, hover con elevación) — reconciliado
  explícitamente con la capa anti-slop (funcional con tratamiento propio SÍ; decorativo regado NO).
- Blueprints del 55 actualizados sección por sección (los emojis 🛡/🔒/📸 de los propios blueprints
  reemplazados por SVG); 19 con remisiones + ítem de checklist; 49 con 2 componentes nuevos
  compilables (`<IconChip>`, `<GradientBorderCard>`); 50 (chips y trust row con SVG); 22 (regla
  anti-emoji dura); PROMPT-LANDING//landing con la regla; CLAUDE.md y DESIGN-CORE con la doctrina.

---

## [5.2.0] — 2026-07-07

**MINOR: la identidad visual se BASA EN LO QUE YA FUNCIONA (fusión de líderes).** Hallazgo de
prueba real: sin referencia del usuario, el SO derivaba combinaciones inventadas (dos serifs
compitiendo, degradé salvia→durazno) que ninguna app grande usa.

### Changed
- **16 — PASO 0.2bis "LO QUE YA FUNCIONA" (obligatorio, primero)**: sin referencia del usuario, se
  investigan las 3-5 apps LÍDERES del nicho + 1-2 gigantes admirados, se llena la TABLA DE LÍDERES
  (tipografía real→equivalente Google Fonts, lógica de color/degradés, radius/cards, navegación,
  celebración, patrón robable) y el brand kit se compone por FUSIÓN de lo mejor de cada una;
  diferenciación SOLO con acento perturbado + dispositivo ownable + copy. REGLA ANTI-INVENTO: si
  ninguna app líder usa algo parecido, no se propone — la novedad no es objetivo, la conversión sí.
- **29 — COMBINACIONES TIPOGRÁFICAS PROBADAS (método principal)**: reglas duras (patrón #1 = UNA
  sola sans en 2-3 pesos; 2 familias = display con carácter + body sans NEUTRA; NUNCA serif+serif;
  serif display solo editorial/lujo) + tabla de 10 combinaciones por nicho con referente real y
  equivalente verificado + DEGRADÉS QUE USAN LAS GRANDES (tonal/análogo ≤40°, nunca saltos raros).
  La "lista fresca" queda solo para el detalle propio.
- **54** reposicionado (fuente del dispositivo ownable, no sustituto de los líderes; si contradice
  a los líderes del nicho, mandan los líderes) · **PLANTILLA-FICHA-ARTE** con la TABLA DE LÍDERES
  y la combinación probada usada · **CLAUDE.md/DESIGN-CORE//diseno/INICIO/PROMPT-NUEVA-APP-FITNESS**
  alineados a la doctrina de fusión.

---

## [5.1.0] — 2026-07-07

**MINOR: doctrina DECIDE-INFORMA-AVANZA + 4 prompts complementarios nuevos + paquete DOCX.**
Hallazgo de prueba REAL con usuario: el agente preguntaba decisiones estratégicas ("¿hard paywall u
onboarding-first?", "¿qué framework?") a un usuario que no puede responderlas — incluso cuando ya
sabía la respuesta.

### Changed — DECIDE-INFORMA-AVANZA (CLAUDE.md → PREGUNTAR vs DECIDIR, reescrito)
- Toda decisión estratégica con respaldo del SO (modelo de monetización vía matriz A-F, framework,
  trial, longitud del onboarding, mecánicas de gamificación, "regla nunca", precio inicial
  propuesto) la DECIDE la IA con la data del SO, la anota en ESTADO.md con su evidencia, la INFORMA
  en 1 línea simple con opción de veto, y AVANZA. Preguntárselas al usuario queda PROHIBIDO.
- Al usuario solo se le pregunta lo que la IA no puede saber: gustos/identidad (siempre con
  opciones propuestas), contexto del negocio, acciones que cuestan SU dinero, credenciales, y
  eliminar trabajo hecho. Propagado a: 01 (la Constitución la REDACTA la IA, no es cuestionario),
  INICIO (regla 10), 02C (la decisión de modelo la toma la IA), y 8 prompts complementarios.

### Added — prompts complementarios
- **PROMPT-CRITICA-DE-EXPERTOS** (/critica-expertos): panel de 4 expertos brutalmente honestos
  (copywriter, director de arte, conversión/retención, inversionista escéptico) puntúa /10 por área
  con screenshots reales, top 10 por impacto en ventas, quick wins y veredicto "¿la comprarías?" —
  solo diagnóstico, ejecuta tras el OK.
- **PROMPT-EMAILS** (/emails): todos los correos del negocio (acceso post-compra, carrito, dunning,
  win-back, D1-D7, nurturing) con voz del arquetipo, deliverability y prueba E2E real.
- **PROMPT-VELOCIDAD** (/velocidad): performance en celular LATAM real — medir antes, arreglar por
  capas, medir después (budget del 38).
- **PROMPT-ANALITICA** (/analitica): instrumentación completa (taxonomía del 36, atribución,
  server-side) verificando que cada evento llega, conectada al backoffice.
- Menú de CLAUDE.md, GUIA-DE-LOS-PROMPTS y SETUP (25 comandos) actualizados.

### Fixed — pasada de pulido de los 20 prompts existentes
- Encabezado estándar ("📌 CUÁNDO USARLO" + instrucción de pegado) en todos.
- NUEVA-APP-FITNESS contradecía la doctrina v5 (diluía la referencia del usuario con la capa
  anti-IA) — alineado a REFERENCIA=CONTRATO.
- 6 prompts con referencias a contenido migrado (35→58, 47→59) corregidas; 5 prompts que tocaban
  UI sin exigir screenshot + revisor-visual al cierre — añadido.
- Carpeta distribuible completa en TXT + **paquete paralelo en DOCX** (24 prompts + "Guía de los
  Prompts — cuándo usar cada uno") generado y validado.

---

## [5.0.1] — 2026-07-06

**PATCH: prueba seca end-to-end completa (app simulada "Fuga", 8 sesiones + operación) + matriz de
cobertura de 52 pilares.** Veredicto de la prueba: el SO es ejecutable de punta a punta sin
callejones sin salida; 47/52 pilares CUBIERTOS. Los ~35 hallazgos (3 graves, resto fricciones)
quedaron corregidos:

### Fixed — graves (funnel anónimo)
- **26**: el middleware canónico redirigía a /login a todo el funnel anónimo (el modelo default) —
  ahora declara RUTAS PÚBLICAS y protege solo /app + API. Sección nueva USUARIO ANÓNIMO → CUENTA
  (estado versionado en navegador, migración validada por BFF, conflictos, otro dispositivo).
  Decisión Hotmart-first: magic link primario.
- **18**: implementación del Modelo 2A (anónimo→compra→cuenta con `sck`), tabla de idempotencia
  unificada, eventos de webhook corregidos (PURCHASE_DELAYED/EXPIRED — `PURCHASE_OVERDUE` no es
  del catálogo) + advertencia de verificar nombres en el panel.
- **50**: spec visual de LOGIN (no existía), estado de ERROR del loading "construyendo tu plan",
  háptica del funnel, objeción de eficacia/abandono, nombre obligatorio para el "Plan [Nombre]".

### Fixed — gates y costuras
- **02C**: tie-breaker nicho vs frecuencia + CÓMO SE RENUEVAN LOS CRÉDITOS (reset que no existía).
- **24**: RLS de user_progress con `with check`, timezone de la racha, disparo del hito (M2),
  matiz rachas-en-finanzas. **25**: period_start en user_quota. **30**: tope mensual del kill-switch.
- **48/PRE-LANZAMIENTO**: gate doble completo (≥36/40 Y ≥16/20), gate de performance del 38, y
  cierre de pendientes de ESTADO.md (screenshots reales del carrusel) en la puerta final.
- **55/19/50**: trial parametrizado (lo define 02C — prohibido inventarlo), fórmula del ahorro anual,
  convención de precios por moneda, CTA ≥52px unificado, dots del carrusel obligatorios.
- **revisor-visual**: RÚBRICA 4 de COPY /20 embebida, FICHA-ARTE como input activo (desvío = defecto),
  test anti-clon con las paletas de los ejemplos del 53 VETADAS, recibe la ruta del código.
- **16**: rama para referencia descrita/link (sin imagen) + filas dataviz/íconos en la extracción.
  **53**: regla de colisión nicho+modo (divergencia triple obligatoria). **17**: glow condicionado.
- **57/plantillas**: pregunta del costo de inacción, objeción de IA condicional, fila Bordes,
  personalidad compilada SIEMPRE. **34**: los ángulos de ads salen de FICHA-AVATAR (mapeo).
- **36**: nomenclatura de eventos resuelta (los de 24 en inglés = única excepción), eventos
  `momento_mostrado`/`logro_compartido` para el 56. **58**: cancelación vía portal Hotmart cubierta.
  **59**: 4 plantillas base de soporte. **47**: Colombia/Ley 1581 operativa + el agente redacta
  los borradores legales. **INICIO**: listas de sesión completadas (52§1bis, 11, 57, 17/24/56,
  31, 41/43/38). **05**: re-anclado a PREFLIGHT/DESIGN-CORE/53. **06**: rúbricas re-apuntadas +
  fallback del test con persona real. **04/02B**: longitud de onboarding por nicho + banco de
  preguntas de segmentación. **PROMPT-DEPLOY**: registro de la URL del webhook en Hotmart +
  RESEND_API_KEY + compra E2E en el cierre. **21/OPERACION-MENSUAL/PROMPT-LANZAMIENTO/08/19**:
  referencias stale del split 35→58 y sobre-promesas corregidas.

---

## [5.0.0] — 2026-07-06

**MAJOR: un archivo = un pilar.** Auditoría completa de pilares fusionados (mapeo de los 60+ docs
por pilares, líneas por pilar y ruteo) + self-check integral. Cinco separaciones ejecutadas donde la
fusión confundía el ruteo u obligaba a cargar cientos de líneas de un pilar para usar otro — y
veredicto explícito de NO separar donde la fusión es cohesión real (onboarding+paywall = un solo
funnel; 34 = mapa comparativo de canales; 31 = ciclo operar-IA).

### Changed — separaciones de pilares (contenido migrado íntegro, cero pérdida)
- **02B → 02B-ONBOARDING-Y-PAYWALL.md (304 l.) + 02C-PRICING-Y-MODELO-DE-NEGOCIO.md (444 l., nuevo)**:
  el pricing/modelo de negocio (3 modelos, matriz A-F, señuelo, créditos, puente de checkout,
  métricas, trial) es pilar propio — `/precios` ya no carga el funnel entero para tocar un precio.
- **35 → 35-LANZAMIENTO.md (179 l.) + 58-RETENCION-DE-INGRESOS.md (174 l., nuevo)**: lanzar y
  proteger el ingreso son momentos opuestos del negocio con comandos dedicados. 58 = churn
  voluntario, dunning, win-back, referidos, renovación anual (distinción explícita: 24 retiene el
  USO; 58 retiene el INGRESO).
- **07 → 07-PULIDO.md (408 l., fase pura) + RUBRICAS-DE-PANTALLA.md (248 l., nuevo)**: las rúbricas
  (/40 con anclas, craft /20, 5 ejes, severidad, gate cognitivo, gate doble) son la operación más
  frecuente del SO — ya no exigen cargar la fase de pulido. Verificado: idénticas a las embebidas
  del subagente `revisor-visual`.
- **09 (940→798 l., seguridad técnica PURA) + 47 → 47-LEGAL-FISCAL-Y-PRIVACIDAD.md (368 l.)**: el
  pilar legal (páginas legales, privacidad LGPD/LATAM, ToS, disclaimer IA, T&S) vive en UN solo
  lugar; duplicados 09/47 fusionados (ToS, links legales, checklists).
- **59-SOPORTE-CLIENTE.md (138 l., nuevo)**: soporte consolidado (antes repartido en 47 §2 + 31
  Parte 4) — canales por etapa, SLA, plantillas, IA+escalada, rescate de churn, métricas.
- **Deduplicación paywall**: línea de propiedad en 02B/50/52 (estrategia → 02B · layout/motion →
  50 · palabras/fórmulas → 52).
- **Pasada global de referencias**: ~150 menciones re-apuntadas en ~50 archivos según contexto
  (tabla de ruteo con filas nuevas para 02C/58/59/RUBRICAS, comandos, PROMPT-*.txt, catálogos,
  cross-refs); CERO referencias a los nombres viejos; carpeta distribuible re-sincronizada.

### Fixed — self-check integral
- Faltaban en el paquete: `PROMPT-NUEVA-APP-FITNESS.txt` y `.claude/commands/nueva-app-fitness.md`.
- 19 prompts de la carpeta distribuible estaban en v3 → sincronizados (21 + guía).
- Gate del revisor llevado a los PROMPT-*.txt canónicos (auditoria/diseno/landing) con fallback
  para entornos sin subagentes; gemelos arranque/retencion alineados; SECUENCIA-MAESTRA con
  Puerta de Etapa exigiendo screenshot + veredicto del revisor y gate de FICHA-AVATAR; catálogos
  (REFERENCIA-RAPIDA, INSTRUCCIONES, 00-SISTEMA-MAESTRO, SETUP con los 21 comandos) actualizados;
  conteos corregidos (núcleo de 10, rango 00-59, ~30 líneas del preflight).

---

## [4.1.0] — 2026-07-06

**El SO ahora vende a UN cliente ideal, no al aire.** Antes creaba landing/onboarding/paywall sin
saber a quién le vendía. Ahora: FICHA-AVATAR obligatoria + estructura de landing canónica inmutable.

### Added
- **`57-AVATAR-Y-CONSCIENCIA.md`** — el fundamento de toda la venta: avatar (con investigación
  voice-of-customer), problema urgente y diario, escalera de 5+ dolores en 3 niveles (superficial→
  emocional→identidad), 5+ deseos en 3 niveles, nivel de consciencia Y sofisticación del mercado
  (Schwartz, con tests de diagnóstico), 5+ objeciones con destino, PNL ética aplicada (sistema
  representacional, presuposiciones, future pacing, anclaje, límites éticos explícitos), y la
  TABLA DE MAPEO campo→pieza de copy con ejemplo completo trabajado. Regla madre: PROHIBIDO
  escribir venta sin FICHA-AVATAR.md aprobada — el copy se DERIVA (trazable), no se inventa.
- **`PLANTILLA-FICHA-AVATAR.md`** — la ficha persistente del cliente ideal (raíz del proyecto,
  inyectada por el hook de arranque junto a FICHA-ARTE.md; cosa juzgada).

### Changed
- **`19-PAGINA-DE-VENTAS.md`** — LA ESTRUCTURA CANÓNICA (INMUTABLE, 10 secciones que se repiten
  en toda landing del SO): 1) hero con 4 U's de Mark Ford + subtitular que potencia + visual o
  placeholder con sugerencia + CTA · 2) problema en 3-5 preguntas desde los dolores de la ficha ·
  3) agitación con costo de inacción cuantificado · 4) mecanismo único bautizado · 5) carrusel
  automático de screenshots de la app (placeholders hasta que la app exista → la IA toma los
  screenshots reales con Playwright al cerrarla, paso obligatorio) · 6) oferta anual+mensual AMBOS
  con prueba gratuita · 7) garantía con nombre · 8) FAQ desde las objeciones de la ficha · 9) CTA
  final emocional con future pacing + PS · 10) footer legal (páginas EXISTENTES, contenido según
  47). Prueba social día-1 en posición fija bajo el CTA del hero. Gate de avatar al inicio.
  No se reordena ni se recorta; solo copy (ficha avatar) y visual (ficha arte) cambian.
- **`55-DISENO-DE-LANDING.md`** — blueprints reordenados 1-10 al orden canónico + nuevos: placeholder
  de visual del hero, carrusel completo (frames 9:19.5, auto-scroll 25-30s pausable, mask fade,
  reduced-motion→manual, estado placeholder), pricing con trial en ambos planes, CTA final
  emocional, footer legal.
- **`52`** — nueva fuente única del copy (FICHA-AVATAR + test de traza), tabla de NEUROMARKETING
  por sección (saliencia, "me leyó la mente", aversión a pérdida, dotación, anclaje, future
  pacing), tabla Schwartz acotada (el nivel ajusta ÉNFASIS, nunca el orden canónico).
- **`02B`/`50`** — onboarding y paywall derivados de la ficha (preguntas←dolores,
  micro-compromisos←deseos, headline paywall←deseo #1, microcopy del CTA←objeción dominante).
- **Cableado**: hook de arranque inyecta FICHA-AVATAR.md; CLAUDE.md/AGENTS.md (Reglas 3 y 6,
  checklist núcleo ítem 8, 6 filas de la tabla de ruteo); CHECKLIST-CIERRE (traza + orden
  canónico); INICIO.md (Sesión 1 entrega la ficha aprobada; Sesión 3 canónica); PLANTILLA-ESTADO
  (sección "Avatar y venta"); comandos /landing y /onboarding-paywall + sus PROMPT-*.txt gemelos
  (gate de avatar); 32/REFERENCIA-RAPIDA sin residuos de "≥11 secciones".

---

## [4.0.0] — 2026-07-06

**MAJOR: de garantías declarativas a garantías MECÁNICAS.** Auditoría de 5 dimensiones (referencia
visual, ejecutabilidad con modelo medio, copy de respuesta directa, diseño emocional, arquitectura
de flujo) detectó la causa raíz del diseño genérico: el SO era un sistema de validación sin motor de
generación, y sus garantías dependían de que el agente obedeciera texto. Esta versión las convierte
en mecanismos (hooks, linter, subagente revisor, ejemplos compilables, ficha persistente).

### Added — mecanismos (antes no existían, solo se exhortaban)
- **`.mcp.json` con Playwright** — prometido por SETUP §4 desde v3.x pero AUSENTE del paquete; sin él
  toda la verificación visual caía en modo degradado.
- **`.claude/agents/revisor-visual.md`** — el "revisor independiente" ahora es un agente real con las
  rúbricas /40 y /20 EMBEBIDAS + test de fidelidad a la referencia + formato de veredicto fijo.
  Autoevaluarse la rúbrica queda prohibido (Regla de Oro 7, checklist de cierre, 12, plantillas).
- **`.claude/hooks/post-edit-diseno.sh`** — linter mecánico de diseño al editar .tsx/.css: hex fuera
  de tokens, `transition: all`, Inter/Roboto/system-ui, `min-h-full`, espaciados fuera de escala.
- **`session-start.sh` reescrito**: inyecta el CONTENIDO de FICHA-ARTE.md + PREFLIGHT en cada sesión
  (incluida la vuelta de una compactación) — las decisiones visuales ya no dependen de "lee el archivo X".
  `pre-compact.sh` ahora exige checkpoint escrito en ESTADO.md antes de compactar.
- **`PLANTILLA-FICHA-ARTE.md`** — la dirección de arte vive en FICHA-ARTE.md en la raíz del proyecto
  (extracción de la referencia, brand kit, personalidad compilada, trazabilidad, vetos) y sobrevive
  sesiones y compactaciones.
- **`PREFLIGHT-PANTALLA.md`** — tarjeta de ~25 líneas que se relee ANTES de cada pantalla, con la
  SPEC PRE-CÓDIGO en YAML (el diseño se ancla antes de improvisar en JSX).
- **`53-PANTALLA-CANONICA.md`** — 2 pantallas ejemplares COMPLETAS y compilables (clara/editorial y
  oscura/densa: globals.css @theme + page.tsx con las 7 baseline implementadas) — verificadas con
  tsc --strict y PostCSS. "Copia la COMPOSICIÓN, nunca los valores."
- **`54-BANCO-DE-DIRECCIONES.md`** — 12 direcciones nombradas (paleta + par tipográfico único +
  dispositivo ownable CON receta CSS + motion signature) + regla de perturbación obligatoria +
  registro anti-repetición + protocolo de 3 DIRECCIONES DIVERGENTES renderizadas (el usuario elige).
- **`55-DISENO-DE-LANDING.md`** — el hermano visual del 50 para la landing: hero con medidas a 375px,
  pricing table con señuelo, sticky CTA, ritmo de secciones, animaciones de scroll.
- **`56-MOMENTOS-EMOCIONALES.md`** — los 7 momentos que retienen (primera victoria, hito de racha,
  level-up, racha en riesgo, racha rota, vuelta tras abandono, share card) con blueprint + timeline
  + copy por 4 arquetipos + 2 componentes TSX completos (CelebrationOverlay, StreakAtRisk).

### Changed — protocolo REFERENCIA=CONTRATO (arregla "ignora mi imagen de referencia")
- **16**: nueva sección obligatoria al inicio — la referencia del usuario MANDA sobre la capa anti-IA
  y las tablas del 29; distinción referencia-mandato vs referencia-investigación ("no clonar el hex"
  aplica SOLO a la segunda); TABLA DE EXTRACCIÓN de 16 campos (mirando la imagen); TEST DE FIDELIDAD
  al cierre (screenshot al lado de la referencia, ≥2 desvíos = corregir). + tarjeta "SI SOLO PUEDES
  RETENER 15 LÍNEAS".
- **29**: hex de las tablas PROHIBIDOS literales (perturbar hue ±10-25°); 3 candidatas tipográficas
  obligatorias; lista fresca ampliada a ~35 fuentes verificadas; REGISTRO ANTI-REPETICIÓN.
- **10**: gate "tokens antes de código" — prohibido codear UI con placeholders; el :root se llena y
  se muestra al usuario ANTES de la primera pantalla.
- **Contradicciones resueltas**: "dark-first default" eliminado de 16/32/14/29 y /diseno (el modo se
  DERIVA); glow/crema+serif+terracota armonizados; 07 limpiado de código legacy que violaba la
  doctrina (`transition: all`, nuke de reduced-motion, `ring:` inválido, "¡Listo!"); baselines y
  anti-slop deduplicados a DESIGN-CORE como fuente única; DESIGN-CORE §7 declarado EL ÚNICO checklist
  de cierre (los demás son consulta).
- **19/52/02B**: Big Idea + MECANISMO BAUTIZADO (regla dura), oferta Hormozi completa (ecuación de
  valor, stack, garantía diseñada, PS), oferta de fundadores operativa, SWIPE FILE (10 plantillas +
  24 headlines por nicho), PROCESO OBLIGATORIO DE HEADLINE (10 variantes + 4 U's + test del bar +
  intercambiabilidad), RÚBRICA DE COPY /20, Schwartz completado a 5 niveles con tabla nivel→landing,
  efecto señuelo de 3 planes con receta numérica.
- **11/24/50**: sistema de personaje operativo (árbol de decisión + 5 estados + pipeline IA),
  COMPILADOR DE PERSONALIDAD (adjetivo → valores), MATRIZ DE VOZ 4 arquetipos × 8 momentos, pushes
  con voz, plan con nombre propio, spec de Lottie/ilustración.
- **CLAUDE.md/AGENTS.md**: Reglas de Oro 1/3/7 reescritas (preflight por pantalla, FICHA-ARTE.md
  como memoria, revisor obligatorio, fidelidad); tabla de ruteo con 53/54/55/56 y la fila de
  referencia visual; checklist de cierre núcleo actualizado. `12`: protocolo del revisor con tope de
  3 iteraciones. `INICIO.md`: análisis de referencias separado en mandato vs investigación.
  Comandos `/diseno` y `/landing` reconectados. SETUP con los 5 hooks + inspector explicados.

---

## [3.3.0] — 2026-07-02

### Added — pasada de diseño integral basada en investigación 2026 (RevenueCat, Emil Kowalski, Rauno Freiberg, Refactoring UI, guía de estética frontend de Anthropic)
4 investigaciones en paralelo (animaciones premium, UX/diseño de conversión de RevenueCat, tipografía/color por nicho, e inventario de los docs de diseño del SO). Hallazgo: los archivos de diseño ya son muy sólidos en lo básico — se rellenaron SOLO los huecos concretos que la investigación 2026 confirmó, sin reescrituras ni bloat:
- **`22-LIBRERIAS-Y-CRAFT.md`**: nuevas "4 reglas de ejecución" que convierten las 7 animaciones baseline de amateur a premium — arranque proporcional (nunca desde scale(0)/salto grande; el tell #1 de motion amateur, Rauno), salidas más rápidas que entradas (250-300 entra / 150-200 sale), solo transform+opacity (GPU), spring para interactivo + curva para opacity.
- **`16-DIRECCION-DE-ARTE.md`**: (1) táctica "derivar el color de una referencia CULTURAL" (cabaña de esquí 70s → naranja quemado/aguacate) en vez del selector de tono — el antídoto documentado contra el morado genérico. (2) Números del tratamiento tipográfico bespoke (contraste de peso extremos 800/900 vs 400 nunca 400-vs-600, saltos de tamaño 3×+, tracking por tamaño, `opsz`, line-height por rol). (3) Valores concretos de la firma de movimiento por arquetipo (tripleta bounce/stagger/duración; `bounce>0.3` solo en juguetón/kids).
- **`29-REFERENCIA-VISUAL.md`**: pares tipográficos frescos 2026 que faltaban — Mona Sans+Hubot Sans (productividad, GitHub open-source), display+monospace para IA/creativo, y guía fresca por nicho (Fraunces+Hanken bienestar, Gambetta/Boska+Manrope finanzas).
- **`50-DISENO-ONBOARDING-PAYWALL.md`**: el descuento/ahorro como el elemento MÁS ruidoso del paywall (RevenueCat: +20% al subirlo a badge grande contrastante) + equivalente mensual como ancla; el tipo de visual sigue al vertical (ilustración para lúdico/consumer, capturas reales+reseñas para utilidad/finanzas).
- **`43-MICRO-CRAFT-Y-EJECUCION.md`**: regla dura de inputs ≥16px en mobile (evita el zoom-on-focus de iOS — el tell #1 de "web, no app").
- **`DESIGN-CORE.md`**: 2 tells de diseño-IA nuevos de 2026 a la lista anti-slop — cards anidadas dentro de cards (el tell más común del dashboard-IA) y paleta tímida/repartida sin dominante.
- Fences verificados balanceados en los 6 archivos; sin referencias rotas.

---

## [3.2.1] — 2026-07-02

### Added — 6 patrones extraídos de una prueba real del SO (app "Constancia", app-prueba3, Sonnet 5 esfuerzo medio)
El usuario probó el SO de cero en una sesión aparte, obtuvo una app decente pero tuvo que pedir
varias rondas de pulido manual sobre el onboarding, el paywall y la app interna. Se auditó el
código ya corregido de esa sesión y se extrajo el patrón GENERAL de cada corrección puntual, para
que la próxima app lo tenga bien desde el primer intento:
- **`50-DISENO-ONBOARDING-PAYWALL.md`**: (1) escape hatch obligatorio "Otra cosa (escribí la tuya)"
  en toda pregunta de categoría ABIERTA (meta, hábito, nicho) — las preguntas de categoría cerrada
  (sí/no, horario, frecuencia) no lo necesitan. (2) Nuevo patrón "input con sugerencias que
  rellenan, no seleccionan" para metas en las propias palabras del usuario — el chip llena el
  campo editable, nunca avanza el paso solo. (3) Fórmula de copy de 3 pasos (nombrar el patrón
  exacto → quitar la culpa con la causa real → nombrar el mecanismo propio) para que las pantallas
  de reconocimiento conecten con el avatar específico, no con ánimo genérico intercambiable. (4)
  Mini-visual con los colores REALES de la app en las pantallas que explican el mecanismo
  diferenciador (mismo principio que "mockups honestos" de `19`, aplicado dentro del onboarding).
- **`52-COPY-VISUALES-CONVERSION.md`**: nuevo patrón "12bis" — usar la propia investigación de
  mercado de la Sesión 1 (apps de referencia con métricas reales) como autoridad de Cialdini en el
  paywall, sin esfuerzo extra y sin inventar nada.
- **`32-DEL-MVP-AL-PRODUCTO.md`**: nueva sección "4 detalles de enriquecimiento" + checklist final
  ampliado — cero íconos de texto/Unicode/emoji haciendo de ícono funcional (siempre Lucide/
  Phosphor), hitos de celebración en todo contador de progreso (compatible con mecanismos
  anti-culpa), tarjeta de resumen agregado en toda sección de historial/calendario, y el chequeo de
  "función muerta" (si el sistema técnico soporta algo —ej. modo claro/oscuro—, tiene que ser
  alcanzable desde la UI, no solo existir en los tokens).
- Fences verificados balanceados en los 3 archivos tocados.

---

## [3.2.0] — 2026-07-02

### Fixed — auditoría final end-to-end de los 5 pilares del SO (ventas/onboarding/paywall, diseño, arquitectura/seguridad/datos, construcción/secuencia, crecimiento/operación/legal)
5 agentes en paralelo re-auditaron el SO completo con ojo escéptico (asumiendo que las mejoras
previas podían tener huecos nuevos). Se corrigieron los hallazgos con impacto real; se descartaron
observaciones puramente cosméticas (vaguedad inherente a guías de diseño/copy que no necesitan un
número para cada palabra):
- **`10-DESIGN-TOKENS.md`**: la afirmación "dark-first es la base" contradecía directamente a
  `16-DIRECCION-DE-ARTE.md` (el modo se DERIVA, claro suele ser más distintivo hoy) — reescrita
  para aclarar que el `:root` oscuro es solo andamiaje técnico de partida, no una recomendación.
  Reconciliados los radios de borde (botones 12-16px, no 8px) y la escala de espaciado (se
  eliminaron `--space-5`/`--space-10` que rompían la regla "solo estos 8 valores").
- **`14-LEYES-DE-DISENO.md`**: aclarado que la escala tipográfica de 6 niveles es la paleta
  completa, no una obligación de usar los 6 a la vez (máx 3 por pantalla, per DESIGN-CORE).
- **`04-ARQUITECTURA.md`** y **`05-CREACION.md`**: la corrección de "no presentarle al usuario
  decisiones técnicas" (ronda anterior) no se había propagado aquí — agregadas notas explícitas +
  cross-reference al presupuesto de copy de `52` para que no se improvise copy de venta desde estos archivos.
- **`27-REVISION-SEGURIDAD.md`**: la verificación de firma de webhook apuntaba a "ver 18" de forma
  genérica — ahora apunta a la sección exacta ("SEGURIDAD DEL WEBHOOK DE HOTMART") que SÍ tiene
  código completo y correcto (verificado, no hacía falta escribirlo de nuevo). Prompt-injection
  (A05) ahora tiene el patrón concreto (datos vs instrucciones, zod, confirmación humana) en vez de
  la frase suelta "no ejecutar acciones según texto del usuario".
- **`09-SEGURIDAD.md`**: una llamada a `SUPABASE_ANON_KEY` (nomenclatura legacy) coexistía con la
  nomenclatura nueva (`SUPABASE_SECRET_KEY`) en el mismo archivo — corregida a
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` con referencia a `51-STACK-PINEADO.md` §5.
- **`34-ADQUISICION-Y-TRAFICO.md`**: suavizaba demasiado la viabilidad de 50% de comisión recurrente
  frente a la advertencia estricta de `40-UNIT-ECONOMICS.md` (margen ≤0 a precios típicos) —
  endurecido el texto para que no se lea como "opción válida con solo recalcular".
- **`24-GAMIFICACION.md`**: la regla simple de "congelador de racha" (1 congelador = salva cualquier
  ausencia) contradecía el código más abajo (1 congelador POR día fallado) — aclarado inline.
- Chequeo mecánico completo corrido: sin referencias rotas, `AGENTS.md`==`CLAUDE.md`, fences
  balanceados en los 8 archivos tocados en esta ronda.

---

## [3.1.3] — 2026-07-02

### Added — pasada final de auto-auditoría obligatoria (el bug que dejaba pasar violaciones ya "revisadas")
Error real detectado: cada sección se revisaba al escribirla, pero nadie recorría la pantalla
COMPLETA al final — así sobrevivieron 2 bullets de beneficios de 14-16 palabras y respuestas de FAQ
largas en una landing que ya había pasado por la Fase 1-5 de mejora.
- **`52-COPY-VISUALES-CONVERSION.md`**: nueva sección "PASADA FINAL DE AUTO-AUDITORÍA" — recorrido
  de arriba a abajo DESPUÉS de terminar de escribir todo, contando palabras contra el presupuesto en
  cada elemento. Nueva excepción documentada para respuestas de FAQ (contenido bajo demanda: hasta
  ~18-22 palabras en 2 oraciones cortas, nunca una sola oración compuesta larga).
- **`19-PAGINA-DE-VENTAS.md`**: checklist con el ítem de la pasada final.
- Aplicado a la landing real: 2 bullets de beneficios acortados, las 5 respuestas de FAQ reescritas
  más cortas y directas. tsc ✓ build ✓ verificado.

---

## [3.1.2] — 2026-07-02

### Fixed — reglas de copy sin números duros permitían texto largo y secciones puramente textuales
Error real detectado: el subtítulo del hero tenía 35 palabras y ocupaba 5 líneas en mobile — la
regla "máx 2 líneas" ya existía en `52` pero en prosa, sin un conteo verificable. Varias secciones
de la landing eran solo párrafos de texto sin ningún elemento visual, y no existía un patrón para
assets (foto/video) que la IA no puede generar.
- **`52-COPY-VISUALES-CONVERSION.md`**: nueva sección "PRESUPUESTO DE COPY" con topes numéricos
  exactos por tipo de elemento (headline ≤8-10 palabras, subheadline ≤12-14, bullet ≤10-12, párrafo
  ≤2 líneas mobile) — auto-auditable contando palabras, no "a ojo". Nueva sección "DENSIDAD VISUAL"
  (ninguna sección con 3+ bloques de texto seguidos sin ícono/mockup/foto). Nueva sección
  "PLACEHOLDER DE ASSET REAL" — patrón de caja punteada + ícono + instrucción de 1 línea para
  fotos/videos que la IA no puede generar (distinto de los mockups honestos de UI).
- **`19-PAGINA-DE-VENTAS.md`**: checklist actualizado con los 3 puntos de arriba.
- Retrofit de la landing real (`app/`): subtítulo del hero de 35→11 palabras; secciones de
  "problema" y "diferenciación" con ícono por card; sección "solución" (era un párrafo largo) ahora
  es un mini value-stack visual de 3 líneas cortas; nuevo componente `AssetPlaceholder.tsx` con un
  placeholder de video del fundador insertado en la banda de identidad.

---

## [3.1.1] — 2026-07-02

### Fixed — el agente exponía decisiones técnicas internas como si necesitaran aprobación del usuario
Error real detectado: en Sesión 1, el agente presentó el modelo de datos y el método de auth (temas
100% de implementación) como un mini-acuerdo a confirmar con el usuario — mezclando decisiones de
PRODUCTO (que sí se preguntan) con decisiones de IMPLEMENTACIÓN (que se deciden y documentan solas):
- **`CLAUDE.md`/`AGENTS.md`**: Regla de Oro 6 aclara que los 3 pilares técnicos son decisión interna,
  no de producto — se anotan en ESTADO.md sin presentárselos al usuario. "PREGUNTAR vs DECIDIR"
  ahora incluye explícitamente modelo de datos/RLS, método de auth y arquitectura de IA bajo "Decide
  solo", con la razón (el usuario no gana nada sabiendo el nombre de una tabla).
- **`INICIO.md`** (regla 9 de conducción): separa explícitamente decisiones de producto/negocio
  (sí se confirman, agrupadas) de decisiones de implementación pura (se ejecutan directo).
- **`SECUENCIA-MAESTRA-CONSTRUCCION.md`** (Paso 6): agrega el detalle de CÓMO se guía la única etapa
  con acompañamiento manual (servicios externos) — incluye abrir `.env.local`, pegar claves,
  confirmar antes de seguir. Deja explícito que es la ÚNICA etapa así; las anteriores no piden nada al usuario.
- `AGENTS.md` resincronizado byte a byte con `CLAUDE.md`. Self-check corrido: sin refs rotas, fences balanceados.

---

## [3.1.0] — 2026-07-02

### Added — Fase 1 de auditoría de copy/conversión: fórmulas deterministas + evidencia real de apps ganadoras
Tras detectar (auditoría de dos agentes: inventario de huecos + investigación de fuentes externas) que `19` y `52` citaban principios correctos pero sin fórmula replicable, se agregó:
- **`52-COPY-VISUALES-CONVERSION.md`**: sección "1bis" con la fórmula de las 4 U's (AWAI/Michael Masterson) + niveles de consciencia de Schwartz para calibrar el ángulo del titular; sección "2bis" con 12 patrones validados extraídos de teardowns reales con fuente citada (Duolingo, Cal AI, Tiimo, Flo, Asana — RevenueCat, Lenny's Newsletter, TechCrunch, growthcurve.co, retention.blog, Auth0, entre otras); método "Fascinations" de Copyhackers para bullets; advertencia ética con caso real (Apple retirando Cal AI de la App Store por dark pattern de facturación, abril 2026).
- **`19-PAGINA-DE-VENTAS.md`**: arco narrativo StoryBrand SB7 como columna vertebral de las 11 secciones; guía de "mockups honestos pre-lanzamiento" (jerarquía de fidelidad cuando la app interna aún no existe — nunca screenshots falsos); checklist de cierre actualizado.
- Ambos checklists de cierre actualizados con los criterios nuevos. Sin archivos numerados nuevos (se integró en los existentes para no romper el ruteo ni el conteo del self-check).

### Added — Fase 2: onboarding y paywall heredan los patrones y fórmulas de la Fase 1
- **`02B-ONBOARDING-MONETIZACION.md`**: nueva sección "Patrones reales de apps ganadoras" (resumen aplicable de los 12 patrones de `52`); cifras actualizadas de RevenueCat (State of Subscription Apps 2025: 12.1% vs 2.2% conversión hard-paywall/freemium, ~8x ingreso a 14 días, ~50% de trials inician en onboarding); referencia a la fórmula 4 U's para el titular del paywall.
- **`50-DISENO-ONBOARDING-PAYWALL.md`**: pregunta de atribución ("cómo nos conociste", patrón Cal AI) y pre-poblado "Sugerir por mí" (patrón Tiimo) añadidos a la especificación de preguntas de onboarding; ritual de micro-compromiso pre-paywall opcional (patrón Flo, "mantener presionado"); guía de mockups honestos cuando el backend de pago aún no existe; referencia a las 4 U's en el headline del paywall.
- Ambos checklists de cierre actualizados. Fences verificados balanceados en los 4 archivos tocados hasta ahora (`52`, `19`, `02B`, `50`).

### Added — Fase 3: referencias cruzadas menores (sin reescritura — estos archivos ya cubrían bien lo suyo)
- **`15-PATRONES-UX.md`**, **`11-DISENO-EMOCIONAL.md`**, **`24-GAMIFICACION.md`**: una línea de referencia cruzada cada uno apuntando a `52-COPY-VISUALES-CONVERSION.md` para copy persuasivo/de venta, evitando que un agente futuro escriba headline o paywall desde el archivo de tono/mecánica en vez del de conversión. `42-UX-WRITING.md` ya tenía esta referencia — sin cambios ahí.
- Self-check de coherencia interna corrido tras las Fases 1-3: sin referencias rotas, `AGENTS.md`==`CLAUDE.md`, sin docs huérfanos de la tabla de ruteo, fences balanceados en los 7 archivos tocados.

---

## [3.0.0] — 2026-07-02

### Changed/Added — MAJOR: de "exhortación" a MECANISMO + capa de diseño rediseñada (plan de mejora integral, 6 fases)
Auditoría end-to-end con 5 frentes (núcleo, diseño, negocio, ingeniería, growth) → PLAN-MEJORA-SO.md ejecutado completo:
- **Paquete nativo de Claude Code (`.claude/`)**: 21 slash commands (uno por PROMPT-*.txt + 7 nuevos), hooks (SessionStart/PostToolUse-tsc/Stop-gate/PreCompact), permisos pre-aprobados, `.mcp.json` con Playwright para el gate visual, `scripts/release.sh` (reempaque verificado) y `scripts/audit-diseno.sh` (auditoría mecánica anti-slop). Setup para no técnicos en `SETUP-CLAUDE-CODE.md`.
- **Capa de diseño**: `DESIGN-CORE.md` (núcleo canónico único que reemplaza el bundle de 9 archivos y los ~10 checklists solapados; doctrinas resueltas: ease-out en salidas, umbral spinner/skeleton, onboarding por 02B, modo derivado, una familia de curvas), `49-SISTEMA-DE-COMPONENTES.md` (inventario canónico + receta de des-shadcn-ización), `50-DISENO-ONBOARDING-PAYWALL.md` (spec VISUAL de las 2 pantallas que venden), paletas LIGHT por nicho en 29 + scaffold light y anti-FOUC y Tailwind v4 en 10, PASO 0.48 de referencias reales (Mobbin) en 16, keyboard/offline/scroll/thumb-zone en 43, PWA e ilustración in-app en 20, rúbrica de CRAFT /20 con gate doble (≥36/40 usabilidad Y ≥16/20 craft) puntuada por REVISOR INDEPENDIENTE (12). Contradicciones barridas en 03/11/14/15/41.
- **Negocio**: "EL PUENTE DE CHECKOUT" en 02B (fricción real del checkout Hotmart vs benchmarks de app store, con métricas separadas), landing bifurcada por modelo en 19/PROMPT-LANDING, gate de validación con matemática realista y FLUJO A sin loophole en 02, "qué se puede y qué NO en Hotmart" + verificación sandbox del evento de trial + graduación de plataforma en 18, prueba social en frío y claims publicitarios seguros en 19/47, capa legal de suscripción en 47, mini-teardown competitivo en 01, comisión de afiliados alineada 30-40% (40↔34).
- **Ingeniería**: `51-STACK-PINEADO.md` (scaffold canónico, Next 16/Tailwind 4/claves Supabase nuevas, verificado jul-2026), rate limiting canónico en 09 (Postgres atómico + Upstash), VIDEO asíncrono en 30, matriz "cuándo activar cada módulo" en 32. Correcciones críticas: snippet de IA con headers y solo-servidor (05), CSP con nonce (09), middleware SSR de Supabase (26), `with check` en RLS de 30/26/33, params async (39/45), CLI de Supabase (25).
- **Growth y ciclo de vida**: píxel/CAPI en Hotmart como gate del paid + WhatsApp + tácticas LATAM en 34, pausa de suscripción corregida (Hotmart controla el cobro) + checklist D-14→D+7 + prerrequisito 46/47 en 35, y 7 prompts/comandos nuevos: RETENER-INGRESOS, OPERACION-MENSUAL, ITERACION-FEEDBACK, SOPORTE, CONTENIDO-SEMANAL, PRECIOS (+ NUEVA-APP-FITNESS reescrito sin dependencia de imagen ni look neón). `GUIA-DE-LOS-PROMPTS.md` reemplaza a la guía Word (flujo + prerrequisitos, no catálogo).
- **Gobernanza**: CLAUDE.md adelgazado (la referencia por dominio → `CHECKLIST-CIERRE.md`), tabla de ruteo actualizada (DESIGN-CORE/49/50/51/SETUP/GUIA), cifras no verificadas marcadas o retiradas, INSTRUCCIONES/REFERENCIA-RAPIDA remiten a INICIO (8 sesiones), CHECKPOINT en PLANTILLA-ESTADO, self-check con rutas relativas, AGENTS.md generado por script.

---

## [2.11.0] — 2026-06-26

### Added — pilar nuevo `48-RIGOR-DE-ENTREGA.md` + circuit-breaker de costo de IA (que la v1 salga CASI PERFECTA y el usuario corrija lo mínimo)
Pensando fuera de la caja: el patrón de fondo de casi todo lo que el usuario tuvo que corregir (flujos a medias, paywall faltante, output flojo, detalles de encaje, secuencia) es que el SO construye bien pero NO tenía una capa final de RIGOR DE ENTREGA. Nuevo pilar transversal que actúa como QA despiadado + fundador preocupado + operador servicial antes de declarar "listo":
- **`48-RIGOR-DE-ENTREGA.md`** (nuevo): (1) **Auto-QA end-to-end** — manejar la app como usuario real, tocar cada elemento, recorrer cada flujo, 6 estados, casos borde, primer arranque vacío (compilar ≠ probar); (2) **Pre-mortem** (Gary Klein) — imaginar el fracaso a 1 semana y corregir los top riesgos + test del desconocido; (3) **Invariantes que no pueden fallar** — dinero (gating en servidor, webhook idempotente, refund/chargeback), datos (no se pierden, export, soft-delete), seguridad (IDOR, RLS, secretos); (4) **Circuit-breaker de costo de IA** — tope global + por-usuario + kill-switch + alerta (evita la factura sorpresa de miles); (5) **Calidad del OUTPUT de IA** — que el resultado sea bueno/completo/en-marca, no slop (rúbrica/golden set de 31); (6) **Manual del Dueño** — `MANUAL-DEL-DUEÑO.md` con cuentas/claves/deploy/tareas comunes/runbook en lenguaje simple; (7) **Cadencia de mantenimiento** (claves, dominio, backups, deps, costos). + CHECKLIST DE ENTREGA como puerta final.
- **`30-INTEGRACION-IA.md`**: detalle técnico del **circuit-breaker de gasto** (3 capas: por-usuario, global con kill-switch, anti-loop) con código de verificación de presupuesto antes de cada llamada cara.
- **Tejido en el SO**: fila de ruteo en `CLAUDE.md`/`AGENTS.md`; Regla de Oro 6 ("antes de vender, corre 27 Y la puerta 48 — sin 48 no está lista"); Sesión 6 del plan en `INICIO.md` (entregable incluye el checklist de 48 + el manual); `00-SISTEMA-MAESTRO.md` y `REFERENCIA-RAPIDA.md`; `PROMPT-PRE-LANZAMIENTO.txt` ampliado con el punto 10 (rigor de entrega).

Fuentes: técnica de pre-mortem (Gary Klein/HBR), prácticas de SRE/runbooks, y el patrón observado al auditar las apps reales construidas con el SO.

---

## [2.10.0] — 2026-06-26

### Changed — auditoría de 2ª app real ("Habi", hábitos) → color por nicho, micro-craft y persuasión de paywall/onboarding
La 2ª app construida con el SO mejoró mucho (onboarding-first de 9 pasos, paywall, loop de retención, fuente fresca), pero la corrida destapó 3 fallas, corregidas con investigación:
- **Color genérico para el nicho** (la app de hábitos salió marrón oscuro + ámbar, sombría, no motivadora). Fix: **`16` PASO 0.5 + `29`** — la paleta se VALIDA contra los GANADORES del nicho (estudiar 3-5 apps exitosas del nicho exacto y extraer su lógica de color), debe servir al trabajo emocional del nicho (hábitos = positivo, victoria visible, verde=hecho — BJ Fogg), y NO defaultear a "oscuro + 1 acento" (muchos géneros ganan en claro/multicolor). Test: "¿un usuario del nicho sentiría 'esto es para mí' en 1 segundo?".
- **Micro-craft con desencajes** (anillo "1" sobre "/1" sin centrar; chip "🔥 1" con hueco muerto a la derecha). Fix: **`43` nueva sección 8 "Encaje y centrado óptico"** + ítems de checklist — chips/badges ABRAZAN su contenido (`w-fit`, cero hueco muerto), números compuestos en UNA composición centrada ópticamente, centrado óptico real (no solo `items-center`).
- **Paywall/onboarding sin profundidad de persuasión.** Fix: **`02B` nueva sección "LA CAPA DE PERSUASIÓN"** — los 7 principios de Cialdini aplicados (compromiso/consistencia, reciprocidad, prueba social, autoridad, escasez real, simpatía, identidad), gatillos de copywriting (aversión a la pérdida, anclaje, especificidad, emoción-primero, "cada pregunta devuelve algo" de Noom, review prompt a mitad del onboarding de Cal AI, CTA en 1ª persona), con el dato de que ~95% de la decisión es subconsciente — todo con límite ético explícito (gatillo real, nunca dark pattern).

Fuentes: RevenueCat (pricing psychology), Cialdini (*Influence*), casos Duolingo/Noom/Cal AI (UX teardowns), BJ Fogg (visible win), color psychology (Angela Wright), apps de hábitos (Streaks, Productive, Finch, Atoms, Way of Life).

---

## [2.9.0] — 2026-06-26

### Changed — auditoría de una app REAL construida con el SO (app "Imán") → 4 gaps de proceso/producto corregidos
Se auditó end-to-end una app que un usuario construyó con el SO. El SO hizo mucho bien (Constitución, validación FLUJO A, nicho D preview→paywall, pricing, atomicidad de cuota), pero la corrida destapó 4 fallas reales:
- **Secuencia: el paywall y el wow real quedaban para el final.** El agente construyó dos generadores con datos DEMO + onboarding y se fue al backend (cuentas/planes/nube) SIN haber construido el paywall ni probado la primera victoria con IA real. Fix: **`INICIO.md` + Regla 6 de `CLAUDE.md`/`AGENTS.md`** — construir temprano la **"columna vertebral de venta"** completa (primera victoria REAL con IA conectada + onboarding + el MOMENTO DE PAYWALL como pantalla de primera clase + la superficie de retención), aunque la persistencia sea local/mock; "backend primero" = el BFF de la acción core para que el wow sea real, NO posponer lo que vende.
- **"Generador + historial" no es una app de suscripción** (la app salía con pocas utilidades). Fix: **`01-IDEACION.md` + `24`** — el MVP DEBE incluir ≥1 **superficie de retención** (el loop del 24 hecho PANTALLA: calendario, biblioteca que se remixa, métricas), no diferirla a V2; la lista de features para apps de GENERACIÓN ahora incluye la superficie de retención como obligatoria, no opcional. Reconciliado con la disciplina de features: la superficie de retención está PROTEGIDA del recorte porque ES la razón de pagar.
- **El artefacto salía incompleto** (carruseles de texto sin imágenes, pese a prometer "listo para publicar"). Fix: regla de **artefacto completo = igual a la promesa** (si es visual, CON imágenes/diseño, no solo texto); el wow debe IGUALAR la promesa.
- **Faltaba cerrar el loop** (crear→publicar→medir→mejorar). Fix: medir-el-resultado se documenta como la palanca de retención #1, con nota honesta de **factibilidad** (APIs sociales tienen fricción real — empezar liviano: métricas pegadas/subidas por el usuario, o integración acotada), atado al pilar 3 de factibilidad de `01`.

---

## [2.8.0] — 2026-06-26

### Changed — identidad visual con "dientes" anti-genérico (el SO entregaba brand kits que "huelen a IA")
Al probar el SO, sus propuestas de identidad visual salían genéricas (oscuro + acento + glow, o el par editorial "seguro") aunque el protocolo de `16` ya era sofisticado. El problema: la teoría no tenía RESTRICCIONES NEGATIVAS, así que el "default estadístico" de IA se colaba. Investigación (Refactoring UI, "por qué todas las apps de IA se ven iguales", Pendo/NN-g, font-pairing, Marty Neumeier *Zag*) convertida en una capa con teeth:
- **`16-DIRECCION-DE-ARTE.md` — nueva sección "LA CAPA ANTI-IA"**: (1) el look de IA tiene RECETA y banderas rojas nombradas (#000/#fff puro, neón morado/cian, glow regado, tarjeta glass + orbe de gradiente, jerarquía por peso) — 3+ = recházalo; (2) **restricción negativa por defecto** (prohibido neón/negro puro/glow/glass salvo que el arquetipo lo justifique) + referencia positiva concreta; (3) el **MODO oscuro/claro se DERIVA, no se asume oscuro** (claro/editorial suele ser MÁS distintivo hoy); (4) tácticas "se ve diseñado" (casi-negro con tinte, grises con temperatura, profundidad de 3 niveles, un acento por viewport, jerarquía por TAMAÑO, glass solo en overlays); (5) **Zag/Neumeier** + test endurecido: "¿el brand kit se distingue de TODA app de IA y de las otras apps del SO?"; (6) exigir ≥1 dispositivo ownable (textura/foto/ilustración/2ª nota de color), no solo "oscuro + 1 acento".
- **`16` PASO 0.6 + `29`**: la propia "rotación fresca" (Clash, Satoshi, Fraunces) ya se quema como Space Grotesk/Geist → ROTAR, no auto-elegir el par del mood, y dar a la display un TRATAMIENTO propio; opciones frescas añadidas (Bricolage, Schibsted, Familjen, Gambetta, Erode, Instrument Serif, Unbounded…); principios de pareo (contraste por clase, superfamilia, x-height).
- **`CLAUDE.md`/`AGENTS.md`**: reescrita la guía de "Dirección de arte" (antes recomendaba "dark-first por defecto" y "glow/glassmorphism" — justo el look de IA) + nuevo ítem en el checklist de cierre de diseño (capa anti-IA, ≥1 dispositivo ownable, test de no-intercambiabilidad).

Fuentes: Refactoring UI (Wathan/Schoger), "Dark Mode Design That Doesn't Look AI" (RAXXO), AI-Unchained sobre colores genéricos de IA, Google Fonts Knowledge / TypeSmith (font pairing), NN/g, Marty Neumeier (*The Brand Gap*, *Zag*).

---

## [2.7.0] — 2026-06-26

### Changed — ideación ENDURECIDA (cierra 5 huecos detectados al probar el SO) + el criterio de "buena idea" se extiende a la construcción
Tras probar la ideación con un prompt real, salieron 5 fallas (ideas bien presentadas pero flojas como suscripción: uso único disfrazado, "wow" de IA que solo adivina, riesgo legal minimizado, "existe afuera" tomado como prueba de pago LATAM, rúbrica sesgada hacia lo catastrófico-pero-raro). Corregido con evidencia:
- **`01-IDEACION.md` — los 8 pilares ahora tienen 3 GATES DUROS** (descalifican aunque el painkiller sea 19/20): (6) **retención** = gate, no asterisco (uso único/episódico NO se propone como suscripción; o se reformula a recurrente o es otro modelo); (3) **IA real, no simulada** = test "quítale la palabra IA" + test de factibilidad de datos (la IA debe RESOLVER con precisión, no adivinar con cara de certeza); (8) **riesgo regulatorio** (consejo médico/legal/financiero vinculante por un fundador solo = mala base; solo entra como "información, no asesoría"). Rúbrica painkiller **de-sesgada**: modificador de frecuencia + Trampa #2 "catastrófico-pero-raro" (intensidad alta + frecuencia baja = transaccional, no suscripción). Pilar 2: separar **señal de arbitraje** ("existe/levantó plata afuera") de **señal de pago LATAM** (gente gastando dinero hoy aquí). Filtro y anti-patrones reescritos con los gates.
- **`01-IDEACION.md` — nuevo "EL FILTRO DE FEATURE"**: el criterio de "buena idea" NO termina en la ideación, aplica a CADA feature al construir. Evidencia: ~80% de las features se usan poco o nunca, solo ~12% seguido (Pendo 2019; Standish 64% en 2002). 4 preguntas por feature (apoya la promesa · la usaría >50% · test "quítale la palabra IA" · ahora o V2) + cómo decir que no sin ser un "sí señor", coherente con el estándar "enriquecido = valor, no features" de 32.
- **`CLAUDE.md`/`AGENTS.md`**: nueva regla de UX 19 (**disciplina de features**) que hace vivo ese filtro durante toda la construcción, con el dato del 80% y el test anti-gimmick de IA.

Fuentes: RevenueCat State of Subscription Apps 2025/2026, framework painkiller-vs-vitamin (Airbridge), Pendo Feature Adoption Report 2019, Standish CHAOS, NN/g y guías de diseño de features de IA.

---

## [2.6.0] — 2026-06-26

### Added — refuerzo profundo de la generación de IDEAS (anclado en datos reales 2026, no en intuición)
Investigación externa (RevenueCat State of Subscription Apps 2025/2026, framework painkiller-vs-vitamin, caso Cal AI, "why now" de Lenny Rachitsky, señales de demanda en Reddit) convertida en un marco accionable para que el SO proponga ideas GANADORAS, no la primera ocurrencia:
- **`01-IDEACION.md`**: nueva sección mayor **"LOS PILARES DE UNA IDEA GANADORA (con datos 2026)"** — 8 pilares con la evidencia detrás: (1) painkiller > vitamina con rúbrica de 4 preguntas /20 (convierten 5-9× más; la URGENCIA paga, no la frecuencia); (2) problema que millones comparten con demanda revelada (reseñas 1-2★, "ojalá existiera", Reddit); (3) un momento-IA puntual que borra la peor parte (truco de Cal AI ~$30M); (4) "por qué ahora" / capacidad de IA reciente; (5) categoría que monetiza + poder de precio (Salud/Fitness, Foto/Video, Productividad, Finanzas; precio alto = 6× LTV); (6) **retención incorporada** (las apps de IA ganan +41% pero retienen −30-36% → deben ser verticales con razón de volver, no chatbots genéricos); (7) ventaja de distribución (solo 17% llegan a $1k MRR; el arbitraje LATAM ES un canal); (8) alcanzable y defendible. Incluye el filtro en una frase y los anti-patrones que los datos dicen que pierden.
- La **plantilla de propuesta** de `01` ahora exige un "chequeo de pilares" (painkiller score, por qué ahora, por qué retiene, categoría, distribución) y reformular si algún pilar queda débil. El **Banco de Ideas** se marca como semillas que deben afilarse con los pilares.
- El **filtro del Escenario B** (idea propia del usuario) añade el paso de pasar la idea por los pilares y proponer el ángulo que convierte una vitamina/uso-único en painkiller con retención.
- **`INICIO.md`** (FLUJO A): la tarjeta de oportunidades incorpora campos nuevos (💊 por qué duele/painkiller, ⚡ momento-IA, ⏰ por qué ahora, 🔁 por qué retiene, categoría que paga) y una regla: cada oportunidad PASA los 8 pilares antes de mostrarse — nunca "la primera para llenar la lista".

---

## [2.5.0] — 2026-06-26

### Added / Fixed — cierre de los 11 hallazgos de un simulacro de uso completo (dry-run con usuaria no técnica)
Se simuló una corrida entera del SO en voz alta poniéndose en los pies de un usuario no técnico que "quiere que la IA lo haga todo". 0 blockers; se cerraron las **costuras entre piezas** y los **gaps de expectativa** que solo un dry-run destapa:
- **`02-VALIDACION.md`** (alto): el Gate de Demanda ya no puede frenar en seco a un no-técnico. Tres caminos explícitos: FLUJO A → gate cubierto por arbitraje (igual se corre el de viabilidad unitaria 40); quiere validar → fake-door con la landing de 19; no puede/no quiere → ruta de **riesgo asumido** documentada + validación EN PARALELO, con OK explícito (no bloqueo silencioso). El gate es bloqueante de verdad solo para gastar en ads.
- **`18-VENTA-HOTMART.md`** (alto): nueva sección **"Los dos modelos de creación de usuario"** (hard paywall = webhook CREA al pagar; onboarding-first = registro gratis → webhook SUBE a Pro) + el **caveat crítico del email que no coincide** (registro con un correo, compra con otro → cuenta duplicada y progreso huérfano) con 3 mitigaciones (mismo email/pre-rellenar, matchear por id/`src`, flujo de reclamo). Nueva sección **"Prueba de pago de punta a punta"** obligatoria + ítems de checklist (incl. casos del Modelo 2 y reembolso).
- **`40-UNIT-ECONOMICS.md`**: la plantilla ahora la **rellena el AGENTE** estimando los costos; al dueño no técnico solo se le piden 2-3 datos (precio objetivo, afiliados sí/no, ciclo). No más hoja financiera en blanco.
- **`CLAUDE.md`/`AGENTS.md`**: degradación de la verificación visual — sin herramienta de preview NO se le exige al usuario no técnico una captura a 375px ni puntuar /40; se deja "pendiente de preview automático" y no se declara la pantalla lista.
- **`INICIO.md`**: reglas de conducción 8-10 (fijar expectativas al inicio — "hay ~5 cosas que solo tú puedes hacer, te aviso y te guío"; ritmo en sesiones densas; degradar sin web/preview y ofrecer ejemplos en preguntas difíciles), notas de secuencia en el plan (clave de IA en local temprano para probar el wow real; sembrar eventos al construir; modelo de usuario decidido en Sesión 1), y ejemplos en la pregunta "qué NUNCA debe hacer la app".
- **`30-INTEGRACION-IA.md`**: configurar la clave de IA en local temprano para probar la primera victoria con generación REAL (no declarar el onboarding listo sobre un mock).
- **`36-ANALITICA-Y-EVENTOS.md`**: sembrar los eventos de activación/retención AL construir cada pantalla (Sesiones 3-4), no en una sesión de analítica al final.
- **`02B`** y **`PROMPT-ARRANQUE.txt`**: cross-link al seam de `18` cuando hay free tier; y fijación de expectativas en el prompt de arranque.
- **Desambiguación de los dos prompts de auditoría** (mismo "audita" en el nombre, funciones distintas): `PROMPT-AUDITORIA.txt` (audita TU APP, en el menú de usuario) y `PROMPT-AUDITAR-SO.txt` (audita la DOCUMENTACIÓN del SO, uso interno) ahora llevan una línea de cross-pointer al inicio; la fila de ruteo de `CLAUDE.md`/`AGENTS.md` marca el segundo como "uso INTERNO de mantenimiento". No se renombraron (evita romper referencias del zip).

---

## [2.4.1] — 2026-06-26

### Fixed — auditoría integral final (4 pases de coherencia: monetización, meta/ruteo, prompts, diseño/técnico)
Resultado de la auditoría: **0 blockers**, refs cruzadas íntegras (0 rotas), CLAUDE.md = AGENTS.md, ruteo y menú completos. Correcciones aplicadas:
- **`10-DESIGN-TOKENS.md`**: import roto `framer-motion` → `motion/react` (el SO estandariza en Motion; el import viejo habría fallado al construir). *Único hallazgo con impacto de build.*
- **`02B` / `02-VALIDACION`**: unificadas las metas de retención (D7 >20%, D30 >10% en ambos) y de churn (meta aspiracional <8% en ambos + nota: para MODELAR el LTV usar el churn realista 10-20% de `40`). Antes se contradecían (D7 20 vs 25, D30 10 vs 15; churn <5 vs <8).
- **`02B`**: checklist decía matriz "(A-G)" → "(A-F)" (el nicho G/e-commerce se había eliminado).
- **`21-BACKOFFICE`**: el objetivo trial→pago ~45% remitía a `18` (que no lo contiene) → ahora "(ver 02B/02)".
- **`22-LIBRERIAS-Y-CRAFT` / `14-LEYES-DE-DISENO`**: corregida la doctrina de `prefers-reduced-motion` en 22 (decía "animaciones a 0.01ms" — el antipatrón que 10/14 marcan como INCORRECTO; ahora "conservar fades/color, quitar solo movimiento") y suavizada la estadística inflada "~35% (WebAIM)" en 14 y 22 por una frase cualitativa defendible.
- **`11-DISENO-EMOCIONAL`**: hardcode `#2563eb` etiquetado "Colores de la marca" (el azul default que el propio SO prohíbe) → placeholder que remite al brand kit (PASO 0 de 16).
- **`05-CREACION`**: nota añadida — el `<link>` a Google Fonts es para Vite/HTML plano; en Next.js usar `next/font` (ver 28).
- **`CLAUDE.md`/`AGENTS.md`**: alineada la línea de IDENTIDAD con la regla transversal ("por defecto hablas SIMPLE; subes el registro solo si detectas a un técnico").

NITs no corregidos (no rompen nada, decisión del dueño): `PROMPT-NUEVA-APP-FITNESS.txt` es un ejemplo no expuesto en el menú de CLAUDE.md; `PROMPT-AUDITAR-SO.txt` es de uso interno y no está en el menú a propósito; placeholder `system-ui` en el favicon de `20-ASSETS-VISUALES` (se reemplaza al generar el favicon real).

---

## [2.4.0] — 2026-06-26

### Changed — `02B-ONBOARDING-MONETIZACION.md` ampliado (cierre de huecos de pricing/paywall/onboarding por nicho, a partir de investigación externa)
- **Orden de diseño explícito**: nueva sección que fija la secuencia *tipo de app → promesa → frecuencia de uso → primera victoria → paywall → pricing → retención* y prohíbe empezar por el precio. La frecuencia (diaria/semanal/puntual) decide el modelo (hábito→freemium vs resultado→hard paywall/preview→paywall). Mide activación antes que adquisición.
- **Matriz de nichos A-G**: la sección "estrategia por tipo de app" pasó de 3 buckets a los **7 nichos** completos (educación, bienestar, fitness, IA creativa/contenido, productividad, finanzas, e-commerce), cada uno con primera victoria · onboarding · paywall · monetización · retención · qué NO hacer. Añade tabla consolidada de un vistazo y la "fórmula para una app de IA" (qué copiar de Duolingo/Headspace/Cal AI). Antes faltaban IA creativa, educación y e-commerce.
- **Modelo de créditos como packaging visible** + regla **"vende resultados, no tokens"** (ej. "100 guiones/mes", no "500.000 tokens"); tiers Starter/Pro/Max + créditos extra; cuándo usarlo; free tier de 1 preview/generación en apps de IA cara. Es la cara visible del fair-use interno de `30`, validada contra el COGS de `40`. Más caution sobre **lifetime deals**.
- **Los 5 trabajos del onboarding** (segmentar · personalizar · activar · crear deseo · preparar el pago) como el "qué" antes del "cómo" de las 7 reglas.
- **Las 7 preguntas que el paywall debe responder** (qué desbloqueo · por qué ahora · qué pierdo · qué gano · puedo cancelar · cuál plan · salida limpia) + estructura narrativa que las ensambla, con nota anti-dark-pattern sobre la aversión a la pérdida honesta.
- Checklist de estrategia ampliado con las decisiones nuevas (orden, nicho, frecuencia, 5 trabajos, 7 preguntas, créditos en resultados).
- Cross-links nuevos: `40-UNIT-ECONOMICS.md` y `30-INTEGRACION-IA.md` (fair-use interno ↔ créditos visibles); nota de monetización por defecto en `CLAUDE.md`/`AGENTS.md` actualizada con el orden de diseño, la matriz de nichos y los créditos.
- **Removed**: nicho G (e-commerce/marketplace) — TODA app del SO se vende como suscripción recurrente por Hotmart; el comercio por compra única queda fuera del modelo. La matriz quedó en A-F.

### Changed — perfeccionamiento de los pilares de retención y venta (24, 35, 19)
- **`24-GAMIFICACION.md`**: nueva sección **"La métrica de activación — el número mágico que predice la retención"** (acción × cantidad × ventana que separa retenidos de churneados; cómo hallarlo con datos de `36`; calibrar la gamificación para empujar al usuario a cruzarlo) + la **forma de la curva de retención** (decae a cero = no hay producto, ninguna mecánica lo salva; aplana en meseta >0 = PMF, ahí rinde la gamificación). Checklist y conexión con `36` añadidos.
- **`35-LANZAMIENTO-Y-RETENCION.md`**: nueva sección **"Referidos / member-get-member"** (dos formas en el modelo Hotmart: convertir clientes en afiliados de `34`, o recompensa in-app "da y recibe" reconciliada por el webhook de `18`; pedir el referido en el momento de máxima felicidad de `24`; no montarlo antes de que la curva aplane; respetar el margen de `40`) + bloque **"renovación anual — el acantilado del mes 12"** (cadencia pre-renovación que convierte el cobro anual en algo esperado, no una emboscada). Conexiones a `34`/`40` actualizadas; TODO de índices del mantenedor marcado HECHO.
- **`19-PAGINA-DE-VENTAS.md`**: nueva sección **"Message-match"** (el headline del hero debe ecoar la promesa exacta del anuncio/email que trae al visitante — congruencia de *information scent* con `34`, alineada al nivel de consciencia de Schwartz) + ítem en checklist. **Fix**: eliminada la fuga de marca "MECLUB" (nombre de proyecto que se había colado en el SO genérico).
- Ruteo de `35` actualizado en `CLAUDE.md`/`AGENTS.md` y `REFERENCIA-RAPIDA.md` (añadidos referidos y renovación anual).

### Added — regla transversal de comunicación con el usuario no técnico + alertas (orientación 100% a usuario no técnico)
- **`CLAUDE.md`/`AGENTS.md`**: nueva sección **"Comunicación con el usuario y alertas"** (regla transversal, aplica en cada mensaje): (1) hablar SIEMPRE simple, traduciendo cada término técnico la primera vez; (2) cerrar cada etapa preguntando si seguir Y explicando en una frase simple QUÉ es el siguiente paso y PARA QUÉ sirve, esperando confirmación; (3) **protocolo de alertas proactivas** (⚠️ formato qué pasó→por qué importa→qué hacer) para pendientes/omisiones importantes, riesgos de seguridad, algo que cuesta dinero, y —destacado— **el caso de que el usuario pegue una API key/secreto en el chat**: avisar de inmediato y decirle que la rote/regenere.
- **`INICIO.md`**: regla de conducción 3 reforzada (el siguiente paso se explica en simple, no solo se nombra) + nueva regla 7 (hablar simple y avisar lo importante, con remisión a la sección de `CLAUDE.md`).

### Changed — conexión 34 ↔ 36 ↔ 21 (atribución por canal, la pieza que faltaba)
- **`34-ADQUISICION-Y-TRAFICO.md`**: nueva sección **"Medir antes de gastar"** — instrumentar el funnel (36) y **etiquetar cada canal** antes de invertir: afiliados los atribuye Hotmart solo; ads/orgánico/email se etiquetan con el parámetro `src` del checkout de Hotmart (`?src=meta_dolor`, `?src=email_dia3`...) para saber qué canal trae clientes que PAGAN. Conexión con `36` añadida.
- **`36-ANALITICA-Y-EVENTOS.md`**: nueva sección **"Atribución por canal — cómo se llena `source`"** que cierra el círculo: la cadena completa `src` en la URL → la landing la guarda y la arrastra al checkout → el webhook (18) la persiste en `profiles.source` → `identify()` y cada evento la leen. Sin esto, el CAC por canal de `21`/`34` no se podía calcular. Conexión con `34` actualizada.
- **Prompts `.txt` actualizados** (los atajos que disparan estos archivos, en `docs/sistema/`): `PROMPT-MEJORA-ONBOARDING-PAYWALL` (orden de diseño, matriz de nichos A-F, 5 trabajos del onboarding, 7 preguntas del paywall, créditos en resultados, anual como $/mes), `PROMPT-RETENCION` (número mágico + curva de retención + referidos), `PROMPT-LANDING` (message-match), `PROMPT-ADQUISICION` (medir antes de gastar + atribución por `src`/36), `PROMPT-LANZAMIENTO` (referidos + renovación anual), `PROMPT-BACKOFFICE` (ganancia real + avisos al dueño + refs 40/36), `PROMPT-ARRANQUE` (regla de comunicación: hablar simple, explicar el siguiente paso, avisar/rotar API key).
- **`21-BACKOFFICE.md`**: (1) métrica **"Ganancia real"** — la línea de fondo que faltaba (ingresos − Hotmart − afiliados − impuestos − IA de `ai_calls`/31 − infra − email) con % de margen y alerta si la IA supera el ~20% (regla de 30/40); (2) sección **"Avisos automáticos para el dueño"** — el panel empuja alertas en lenguaje simple (IA cara, webhook fallando, churn involuntario, canal que pierde dinero, margen negativo), reflejo de la regla de alertas de `CLAUDE.md` dentro del producto; (3) **reconciliación con `36` y `40`** en "Relación con herramientas externas" (backoffice = vista del dueño / PostHog = herramienta del constructor sobre el MISMO `event_log`; backoffice = ganancia real / `40` = modelo previo; no mezclar bases). Checklist y atribución (captura vía 36) actualizados.

---

## [2.3.0] — 2026-06-21

### Added — Cierre de fugas operativas (capa post-venta y crecimiento orgánico que faltaba)
- **`45-SEO-TECNICO.md`**: lo técnico del orgánico (metadata dinámica/`generateMetadata`, `sitemap.ts`/`robots.ts` nativos, JSON-LD schema.org, SSG/ISR vs CSR para que el bot indexe, hreflang, programmatic SEO legítimo vs spam, GSC). Complementa la estrategia de `34`.
- **`46-EMAIL-DELIVERABILITY.md`**: que el email no caiga en spam — SPF/DKIM/DMARC (DMARC progresivo), subdominio dedicado separando transaccional (`tx.`) de marketing (`news.`), warmup, higiene de lista (double opt-in, suppression vía webhooks), `List-Unsubscribe`, monitoreo (Postmaster Tools), specifics de Resend. Protege los emails de acceso de `18` y el nurturing de `34`.
- **`47-LEGAL-FISCAL-Y-SOPORTE.md`**: operación post-venta — fiscal/legal LATAM (Hotmart como Merchant of Record reduce pero no elimina la carga; ToS/refund/**disclaimer de IA** + limitación de responsabilidad; checklist empezar vs escalar), **soporte al cliente como sistema de retención** (SLA, IA+escalada humana sin loops, rescate de churn ligado a `35`, loop de feedback a `44`), y **trust & safety/moderación** condicional (UGC + outputs de IA, enlaza guardrails de `30`).

### Changed
- `06-TESTING.md`: añadido el gate de **accesibilidad testeada automáticamente** (`@axe-core/playwright`/`jest-axe`/`pa11y-ci` en CI), aclarando que cubre ~30-50% de WCAG y complementa (no reemplaza) el test manual con lector de pantalla y la regla `aria-live` de `15`.

---

## [2.2.0] — 2026-06-21

### Added — Descubrimiento de usuario (a partir de analizar la skill cookiy-ai/user-research-skill: tomar lo bueno, corregir lo malo)
- **`44-DESCUBRIMIENTO-DE-USUARIO.md`**: cierra el eslabón entre "tengo una idea" (01) y "alguien la paga" (02). Toma de la skill lo sólido (Big Q atada a una decisión, screener por comportamiento, protocolo de entrevista anti-sesgo, síntesis trazable con ≥2 fuentes, Opportunity Solution Tree / Opportunity Scoring) y **corrige sus defectos**: **Mom Test explícito** (prohíbe "¿te gustaría/pagarías/usarías?" → comportamiento pasado específico), **fuerzas JTBD/switch** + timeline, **prohíbe synthetic users (entrevistar IAs) como evidencia de demanda**, **prohíbe muestra complaciente / relajar el segmento para llenar cupo** (5 del avatar exacto > 30 tibios; no encontrar 5 ya es señal), y **handoff obligatorio** al gate de pago (02) y a la economía unitaria (40): 44 detecta la señal cualitativa de WTP, 02 la prueba con dinero, 40 la ancla al pricing value-based. Sin sesgo comercial.
- Enlaces cruzados nuevos en `01-IDEACION.md`, `02-VALIDACION.md` (junto al gate de demanda) y `40-UNIT-ECONOMICS.md`; fila de ruteo en `CLAUDE.md`/`AGENTS.md`.

---

## [2.1.0] — 2026-06-20

### Added — Tier "craft de élite" (ingesta de 5 skills de diseño de referencia: frontend-design de Anthropic, UX/UI Pro Max, Emil Kowalski, Huashu, Vercel)
- **`41-CRAFT-DE-ANIMACION.md`**: criterio de animación de élite — framework "¿debe animarse?" por frecuencia de uso (cuándo NO animar), easing perceptual, interrumpibilidad (transition/spring vs keyframe), spring físico, transform-origin, prohibir `scale(0)`, **performance de runtime GPU** (transform/opacity, CSS vars heredables, Framer no-GPU), gestos/drag por velocidad, `clip-path`, **motion narrativo** (Slow-Fast-Boom-Stop, expoOut, chunk-reveal, foco con blur), **View Transitions API nativa**, reduced-motion matizado.
- **`42-UX-WRITING.md`**: microcopy de interfaz — nombrar por lo que el usuario controla, consistencia de verbos acción→confirmación, errores/empty states como dirección.
- **`43-MICRO-CRAFT-Y-EJECUCION.md`**: la última milla verificable — micro-tipografía (`…`/comillas/`tabular-nums`/`text-wrap:balance`), overflow/`min-w-0`, forms (`inputmode`/`autocomplete`/no-bloquear-paste), URL-como-estado, touch nativo (`touch-action`/`overscroll-behavior`/safe-area), dark robusto (`color-scheme`), barrel-files.

### Changed — enriquecimientos
- `16`: PASO 0.45 "mundo del sujeto", test de genericidad, matiz "eje libre" a la lista negra, protocolo de 3 lógicas divergentes, menú de estilos nombrados 2026. `29`: verticales especializados (12 sectores + anti-patrón) + estilos-firma con % de fidelidad CSS.
- `14`: árbol de easing perceptual, complexity matching, densidad por tipo de producto, micro-tipografía, filas anti-slop nuevas. `10`: reduced-motion matizado (no apagar fades), dark robusto, utility `.tabular`.
- `20`: protocolo de activos de marca + sub-portón de logos. `12`: "verdad antes que suposición" + pase junior. `17`: gráfico→caso de uso + accesibilidad de visualizaciones. `07`: severidad en checklist + rúbrica de crítica de 5 ejes + gate de micro-craft.
- `28`: composición de componentes + waterfalls granulares + re-render/INP. `38`: runtime de animación + barrel files. `15`: URL-como-estado + sostenibilidad/peso de assets.

### Fixed
- Lectura fina de los 5 pilares 36-40: corregidos errores reales (comisión de afiliado Hotmart 40-60% vs tarifa 10% en `40` → dos escenarios de margen; sesgo de doble módulo y caso anónimo en `37`; `size-limit`/brotli en `38`; `flush()` vs `shutdown()` y taxonomía en `36`; setup `next-intl` completo en `39`).

---

## [2.0.0] — 2026-06-19

### Added
- **Pilares nuevos** que cierran la cadena de "vendible y operable": `33-RAG-Y-CONTEXTO.md`, `34-ADQUISICION-Y-TRAFICO.md`, `35-LANZAMIENTO-Y-RETENCION.md`, `36-ANALITICA-Y-EVENTOS.md`, `37-FEATURE-FLAGS-Y-EXPERIMENTOS.md`, `38-PERFORMANCE-BUDGET.md`, `39-INTERNACIONALIZACION.md`, `40-UNIT-ECONOMICS.md`.
- **PASO 0 "del brief al brand kit"** en `16-DIRECCION-DE-ARTE.md`: la identidad se DERIVA de la audiencia/ICP, no se copia de un nicho genérico.
- **Núcleo de 9 ítems + verificación-como-artefacto** en `CLAUDE.md` (y su copia byte a byte `AGENTS.md`): cierre con evidencia (tsc/build/dev + render a 375px), no exhortación.
- **DR / Continuidad a nivel app** en `31-EVALS-OBSERVABILIDAD-OPERACION.md` (runbook que orquesta el detalle de DB de `25`).
- **Self-check del propio SO**: `docs/sistema/PLANTILLA-SELF-CHECK.md` + `docs/sistema/PROMPT-AUDITAR-SO.txt` para detectar incoherencias internas antes de reempacar.

### Changed
- **Auditoría integral multi-rol + plan de pulido**: revisión por roles (producto, diseño, UX, backend, DB, auth, ciberseguridad, IA, infra, monetización, distribución, operación).
- **Webhook de Hotmart de producción** en `18-VENTA-HOTMART.md`: firma en tiempo constante sobre el RAW body + idempotencia + máquina de estados.
- **Correctitud de datos** en `25-BASE-DE-DATOS.md`: transacciones atómicas, idempotencia, paginación keyset (no OFFSET profundo), multitenancy con RLS de alto rendimiento.
- **Seguridad** en `09-SEGURIDAD.md`/`27-REVISION-SEGURIDAD.md`: XSS por escape de OUTPUT, SSRF en fetch de URLs, CSRF (SameSite + Origin/double-submit), privacidad LATAM (LGPD/Ley 1581/LFPDPPP).
- **IA seria** en `30-INTEGRACION-IA.md`/`31`/`33`: structured output vía tool use nativo (no parsear texto a ciegas) + RAG solo cuando hace falta + evals con golden set y LLM-judge.
- **Proceso canónico unificado** en 8 sesiones (una sola narrativa de extremo a extremo).
- **Fusión de prompts** redundantes: `PROMPT-AUDITORIA.txt` (modos --rapido/--exhaustivo) y `PROMPT-DISENO.txt`.

### Fixed
- Sincronización de referencias cruzadas (`NN-*.md` / `PROMPT-*.txt`), conteos de docs/sesiones y rangos numéricos — el defecto histórico #1 del SO es la incoherencia interna; esta versión añade versionado y un self-check para contenerlo.
- IDs de modelo vigentes en todos los docs: `claude-opus-4-8` / `claude-sonnet-4-6` / `claude-haiku-4-5` / `fable-5` (sin sufijo de fecha ni versiones 3.x).

---

<!--
Plantilla para entradas futuras (copia y rellena; la más reciente arriba):

## [X.Y.Z] — AAAA-MM-DD
### Added      (pilares/docs/plantillas/prompts nuevos → bump MINOR)
### Changed    (cambios de proceso/estructura → bump MAJOR; ampliaciones compatibles → MINOR)
### Fixed      (correcciones de coherencia/refs/IDs/fences → bump PATCH)
### Removed     (docs/secciones retiradas)
-->
