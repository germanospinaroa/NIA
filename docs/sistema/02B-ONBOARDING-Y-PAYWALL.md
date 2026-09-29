# ONBOARDING Y PAYWALL — La Estrategia que Usan las Apps de $35M+

> ⚠️ **El PRICING y el modelo de negocio viven en `02C-PRICING-Y-MODELO-DE-NEGOCIO.md`** — el orden de diseño, los 3 modelos validados, la estrategia de pricing (anclaje, señuelo, créditos, trial), la matriz A-F por nicho, el puente de checkout y las métricas del funnel están allá. **La decisión de modelo/precio se toma ANTES de diseñar este funnel.** Este archivo diseña el funnel que ejecuta esa decisión.

> **Cuándo cargar este archivo:**
> - Siempre que se diseñe el onboarding o el paywall de la app (con el modelo ya decidido en `02C-PRICING-Y-MODELO-DE-NEGOCIO.md`)
> - En la fase de arquitectura (junto con `04-ARQUITECTURA.md`) al diseñar el flujo de usuario
> - Junto con `24-GAMIFICACION.md` (el onboarding gamificado y el loop de retención que sostiene la suscripción) y `26-AUTH-MODERNO.md` (registro sin fricción en el momento correcto)
>
> **Por qué existe:** el onboarding y el paywall son las 2-3 pantallas que concentran el dinero de la app. Este archivo recoge lo que hacen Duolingo, Cal AI ($35M → adquirida por MyFitnessPal), Noom y las apps top — los 5 trabajos del onboarding, las 7 reglas, la anatomía del paywall, las 7 preguntas y la capa de persuasión — y traduce esos patrones al contexto de una web app vendida por Hotmart.
>
> **⚠️ Antes de CONSTRUIR estas pantallas:** este archivo es la ESTRATEGIA. La especificación VISUAL de las pantallas de pregunta, el loading "construyendo tu plan" y el paywall (layouts a 375px, medidas exactas, motion, criterios de revisión) está en `50-DISENO-ONBOARDING-PAYWALL.md` — leerla antes de diseñarlas o revisarlas.
> **⚠️ Antes de escribir COPY o VISUALES de venta:** leer `52-COPY-VISUALES-CONVERSION.md`. El 02C decide el modelo; este archivo el funnel; el 52 convierte ese funnel en headline, visual, CTA, garantia concreta y navegacion de marca.

---

## BENCHMARKS VERIFICADOS DEL FUNNEL (2025-2026)

Puntos de referencia con fuente para calibrar expectativas ANTES de diseñar — no son metas propias:

```
- Install→trial global ~10.9% · trial→pago ~25.6% (Business of Apps 2026).
- Paywall en el onboarding CON trial = el placement que más convierte: 1.78% install→trial
  promedio (Adapty 2026).
- Hard paywall 10.7% vs freemium 2.1% de download→pago a D35 (RevenueCat 2026).
- Paywall multi-página +37% vs una página (12.41% vs 9.07%, 40M+ aperturas — Superwall 2026).
- El Día 0 concentra 82-90% de los inicios de trial (RevenueCat 2025 / Adapty 2026) y el
  44.5% de las compras (Adapty 2026).
- Tasa de activación: promedio 34%, mediana 25% (encuesta de Lenny Rachitsky, 500+ productos, 2022).
- Volver el D7 con 7% ya es top 25% (Amplitude, 2.600 empresas, 2024).
```

Estos son puntos de calibración con fuente — las metas del proyecto se fijan en `60` y se miden con `36`.

**El punto de partida del onboarding es el del MODELO (FICHA-MODELO §4): su número de pasos y micro-compromisos son la baseline probada; se ajusta con la evidencia de este archivo.**

---

## PATRONES REALES DE APPS GANADORAS — antes de diseñar, revisar la evidencia

`52-COPY-VISUALES-CONVERSION.md` → sección "2bis" tiene 12 patrones extraídos de teardowns
reales (Duolingo, Cal AI, Tiimo, Flo, Asana) con fuente citada — no reinventar lo que ya está
probado a millones de usuarios. Resumen aplicable a esta fase:
```
- Registro DESPUÉS del primer valor real (Duolingo: +20% DAU por posponer el registro, y un
  free→paid que pasó de 3% a 8.9% en ~5 años por iteración compuesta de experimentos de
  +2-3% — First Round Review).
- Paywall DESPUÉS del "aha" personalizado, nunca antes (Cal AI oculta precio hasta ver el plan).
- Ritual de micro-compromiso justo antes del paywall (Flo: gesto de mantener presionado).
- Retención construida en el LOOP CENTRAL mismo, no como capa aparte (Flo, Duolingo).
- Invertir en retener usuarios existentes rinde más que solo adquirir (Duolingo: 5x impacto).
```
Ver también `50-DISENO-ONBOARDING-PAYWALL.md` para la especificación visual de estos patrones.

---

## EL ONBOARDING QUE CONVIERTE — PATRONES DE LAS MEJORES APPS

### El patrón de Cal AI ($35M → adquirida 2026)

Cal AI empieza con un video demo corto, incluye personalización profunda a lo largo del flujo, está lleno de animaciones e interacciones, pide una reseña a mitad del onboarding, genera un plan personalizado, y solo entonces muestra el paywall: un "free trial" anual con 75% de descuento.

Cal AI mejoró significativamente sus tasas de conversión añadiendo preguntas al onboarding que no afectaban la funcionalidad de la app pero aumentaban el engagement del usuario. Convierte 20-25% de sus usuarios nuevos a trial/pago y corrió 61 experimentos de paywall para llegar ahí (Superwall/GetLatka 2025-2026).

Lección clave: **las preguntas del onboarding no tienen que ser solo funcionales — también son herramientas de construcción de compromiso.** Cada pregunta que el usuario responde es un micro-compromiso que aumenta su inversión emocional.

### El patrón de Noom (hasta 113 pantallas de onboarding)

El onboarding de Noom convierte a través de construcción progresiva de compromiso: las preguntas sensibles se enmarcan con contexto, las expectativas se establecen deliberadamente, y el paywall aparece solo después de que los usuarios han invertido tiempo y energía emocional significativos. La pantalla de carga que anima mientras "construye tu plan" no es relleno — es el argumento de apertura del paywall.

Lección clave: **el "loading screen" que genera el plan del usuario es en realidad el inicio del pitch de venta.** El usuario ve su resultado renderizarse en tiempo real y ya quiere protegerlo pagando.

Anti-gap del patrón: el funnel DEBE mostrar cómo se ve la app por dentro antes del paywall — la crítica al funnel de Noom es exactamente esa: nunca la muestra (RevenueCat 2025). El quiz construye deseo; una captura o preview REAL del producto lo vuelve creíble.

### El patrón de Duolingo (gradual engagement + loss aversion)

El onboarding de Duolingo guía a los usuarios a través de un ejercicio real antes de pedir que se registren. El registro se siente como un pequeño paso dentro de un proceso más grande, en vez de un obstáculo frustrante en el camino a lograr valor.

Duolingo convierte el tiempo en el producto y el progreso acumulado en disposición a pagar mediante loss aversion y formación de hábitos — no solo mediante paywalls de fricción.

Lección clave: **el momento del registro o pago debe sentirse como un paso natural dentro de un proceso que ya empezó, no como una puerta.**

---

## LA ESCALERA DE COMPROMISO (la doctrina que une el funnel — de la landing al checkout)

**PRINCIPIO:** cada paso del funnel debe SUBIR la inversión del usuario respecto al anterior; el
paywall se diseña como CONSECUENCIA de esa inversión, no como interrupción. La landing es el
peldaño 0 (su CTA es el primer micro-sí), y el cruce al checkout es el último peldaño — la
decisión se toma ANTES del formulario de pago (doctrina de PRE-CIERRE en `02C`).

**LOS 9 PELDAÑOS** (cada uno con su principio, su evidencia y dónde vive en el SO):

```
1. DEMOSTRAR VALOR ANTES DE PEDIR NADA — Cal AI abre con un video del producto funcionando
   (pantalla 1, cero preguntas). Fluidez de procesamiento: lo fácil de procesar se juzga más
   creíble y menos riesgoso (Alter & Oppenheimer 2009). Vive en: 19/55 (landing) y 50 (apertura).
2. PRIMER MICRO-SÍ IMPOSIBLE DE FALLAR — Noom incluye "Aún no lo decidí" entre las opciones.
   Pie-en-la-puerta (Freedman & Fraser 1966; caveat honesto: la réplica de 2020 mostró el
   efecto más frágil que el folklore — lo que importa es CUMPLIR la petición pequeña: tocar,
   no leer). Vive en: 50 → A2/A3 (la primera pregunta del quiz).
3. LA RAZÓN-PORQUE EN PREGUNTAS SENSIBLES — explicar POR QUÉ se pide cada dato ANTES de
   pedirlo ("preguntamos X porque afecta Y") + validar la respuesta ("gracias por
   compartirlo"). Langer 1978 (60%→94% de cumplimiento; con peticiones costosas solo
   funcionan razones REALES). Vive en: 50 → A1 (micro-copy) y A5 (validación).
4. EL PLAN SE CONSTRUYE VISIBLEMENTE CON SUS RESPUESTAS — animaciones que reaccionan a cada
   input. Efecto IKEA (Norton, Mochon & Ariely 2012: la gente valora más lo que ensambló) +
   gradiente de meta (Kivetz, Urminsky & Zheng 2006: el progreso pre-llenado acelera — por
   eso la barra arranca en 5-8%: es ENDOWED PROGRESS, Nunes & Drèze 2006). Vive en: 50 → A2/A4/B.
5. INVERSIÓN DE TIEMPO COMO COSTO HUNDIDO DELIBERADO — Arkes & Blumer 1985. El dato que lo
   ancla: 50-82% de las conversiones ocurren el Día 0 (RevenueCat) — toda la inversión se
   construye en la primera sesión. Vive en: la longitud por tipo de app (este archivo) + 60.
6. ETIQUETADO DE IDENTIDAD — el quiz devuelve un perfil positivo ("eres un planificador
   estratégico"). Labeling effect (Tybout & Yalch 1980). El pago después CONFIRMA una
   identidad ya entregada, no compra una promesa fría. Vive en: 50 → A5 (variante final).
7. EL PLEDGE EXPLÍCITO — hold-to-commit, "¿te comprometes a X min/día?". Consistencia +
   implementation intentions (Gollwitzer & Sheeran 2006: d=0.65 en un meta-análisis de 94
   estudios — de lo MÁS sólido de la psicología aplicada; Headspace: el brazo de
   pre-compromiso +7.5% aperturas). Vive en: 50 → A6 (slider de meta) y C3bis (ritual).
8. PERCEIVED FIT — ya doctrina: Headspace 31%→63% — preguntar CREA el fit aunque la
   recomendación sea la misma. Matiz honesto: mueve engagement, no hábitos — y la entrega
   debe ser honesta: caso Coursiv, quiz personalizado + biblioteca genérica = colapso de
   confianza y refunds. Vive en: regla 2 de este archivo.
9. LA PROYECCIÓN PERSONALIZADA DEL FUTURO — la curva hasta SU fecha con SU evento. La cima
   de la escalera: el plan ya es "suyo" (transición directa a la dotación del paywall).
   Vive en: 50 → C2 (variante c, gráfica de proyección).
```

**MAPA DE INVERSIÓN** (qué acumula cada pantalla — la escalera hecha tabla):

```
PANTALLA                          → QUÉ INVERSIÓN ACUMULA
Clic en la landing (peldaño 0)    → el primer micro-sí (intención declarada)
Respuestas del quiz               → tiempo + datos personales + auto-diagnóstico
Slider / meta                     → un número PROPIO que la app usará (compromiso)
Loading "construyendo tu plan"    → ver SU plan ensamblarse (efecto IKEA)
Reconocimiento-identidad          → una identidad positiva recibida (etiquetado)
Pledge                            → una promesa explícita (consistencia)
Paywall                           → TODO lo anterior, MOSTRADO en el momento del precio
```

**TEST VERIFICABLE:** en el momento del precio, ¿el paywall MUESTRA lo que el usuario ya
invirtió? Si el usuario pudiera llegar al paywall sin haber invertido nada, la escalera
está rota.

### REGLAS DERIVADAS DE LA ESCALERA (obligatorias)

```
a) COSTO HUNDIDO OBLIGATORIO EN EL PAYWALL: "Hecho con tus N respuestas" (o equivalente
   cuantificado) deja de ser ejemplo y pasa a REGLA — la inversión del onboarding se MUESTRA
   en el momento del precio (Arkes & Blumer 1985). Blueprint en 50 → C1.
b) ETIQUETADO PRE-PAYWALL: el ÚLTIMO reconocimiento del quiz etiqueta POSITIVAMENTE con una
   identidad aspiracional ("eres un planificador estratégico") — labeling effect (Tybout &
   Yalch 1980). Los reconocimientos A5 actuales desculpabilizan; este además ETIQUETA.
   Spec en 50 → A5 (variante final).
c) PEAK-END EN EL FUNNEL DE COMPRA (Redelmeier & Kahneman 1996: el recuerdo = pico y final;
   la duración casi no cuenta — r=.03; por eso 113 pantallas no se sienten largas si el
   final es alto). El PICO se diseña (= la revelación del plan, la pantalla previa al
   paywall), el paywall llega EN el pico, el rating de tienda se pide en el pico PRE-paywall
   (patrón Cal AI), y la pantalla post-pago es el FINAL que fija el recuerdo → celebración +
   qué pasa ahora (anti-refund del Día 0; ver 56 → M1 y 58).
d) REACTANCIA: prohibido el lenguaje controlador ("debes", "tu única opción") — el
   meta-análisis de Rains 2013 lo señala como el disparador más replicado del efecto
   boomerang. La salida visible ES la técnica (regla 7 de este archivo).
```

---

## LOS 5 TRABAJOS DEL ONBOARDING (qué debe LOGRAR, antes de cómo se diseña)

Un onboarding que convierte no es solo "corto" — es **estratégico**. La ESCALERA de arriba es el CÓMO se acumula la inversión a lo largo de TODO el funnel; estos 5 trabajos son el QUÉ debe lograr el onboarding dentro de ella. Antes de pensar pantallas, verificar que el flujo hace estos 5 trabajos en orden. Si falta uno, el paywall llega frío:

```
1. SEGMENTAR   → saber quién es el usuario (nicho, objetivo, nivel). 1-2 preguntas.
2. PERSONALIZAR→ mostrarle algo construido CON sus respuestas (no una bienvenida genérica).
3. ACTIVAR     → que HAGA una acción de valor (no que lea sobre la app). Primera victoria.
4. CREAR DESEO → mostrar lo que PODRÍA conseguir (el resultado renderizándose, el plan, la preview).
5. PREPARAR EL PAGO → que el paywall se sienta como el paso natural siguiente, no como una puerta.
```

> Estos 5 trabajos son el "qué". Las 7 reglas de abajo son el "cómo". Un onboarding largo que segmenta y personaliza pero nunca ACTIVA (el usuario no logró nada con sus propias manos) convierte peor que uno corto que sí da la primera victoria.

#### ACTIVAR se mide, no se declara (definición operativa del trabajo 3)

```
ACTIVACIÓN = % de usuarios que completa la PRIMERA VICTORIA en su primera sesión.
Benchmarks: promedio 34% · mediana 25% (encuesta de Lenny Rachitsky, 500+ productos, 2022).
```

La urgencia tiene número: en trials de 3 días, el 55.4% de las cancelaciones ocurre el MISMO
Día 0 y el 84% entre D0-D1 (RevenueCat 2026); y el 35% de las cancelaciones de planes anuales
ocurre en el MES 1 (RevenueCat 2026). Conclusión operativa: la primera victoria debe aterrizar
en los primeros MINUTOS post-pago, no "durante la primera semana". El evento de activación se
instrumenta con `36`. Y el onboarding no termina en el pago: la primera victoria post-pago
decide el refund y la renovación (`58`).

#### EL ONBOARDING SE DERIVA DE FICHA-AVATAR.md (no se improvisa el cuestionario)

Las preguntas del onboarding B2C no se inventan: **ecoan los DOLORES de la ficha** (`57-AVATAR-Y-CONSCIENCIA.md`) — el usuario se auto-diagnostica respondiendo y siente "esta app me entiende" (el efecto "me leyó la mente" trasladado del copy a la interacción). Los **micro-compromisos apuntan a los DESEOS** de la ficha (la meta que fija en el slider de compromiso es un deseo tangible con número), y la **pantalla de reconocimiento** (50 → A5) usa el **dolor emocional #1 en el lenguaje LITERAL del avatar** — nunca un ánimo genérico intercambiable.

```
Ejemplo (app de finanzas, ficha con dolor #1 "no sé en qué se me va el dinero" y
dolor emocional "me da ansiedad abrir la app del banco"):
  Pregunta:       "¿Cuándo sientes que 'se te va' el dinero?" ← eco del dolor #1
  Chips:          quincena / fines de semana / gastos hormiga / "ni idea — y eso es
                  lo que quiero saber" ← el último chip ES el avatar hablando
  Reconocimiento: "Caro, llegar al día 20 a ciegas no es un problema de ingreso: es de
                  visibilidad — por eso el Excel no te duró ni dos semanas." ← desculpabiliza
                  con la CAUSA, no con una estadística (si citas un %, va con fuente y año —
                  si no la tienes, NO existe) (fórmula de 50 → A5)
```

Regla: antes de diseñar el cuestionario, abrir la ficha y mapear pregunta→dolor y micro-compromiso→deseo. Una pregunta que no ecoa ningún campo de la ficha ni personaliza el plan es fricción decorativa.

#### BANCO DE PREGUNTAS DE SEGMENTACION (para personalizar sin inflar el flujo)

Las preguntas-ancla salen de la ficha (dolores/deseos/objeciones — **incluida la objeción dominante COMO pregunta**: "¿ya probaste apps así?" habilita la pantalla de reconocimiento que la desarma). El resto son preguntas de **segmentación funcional** por vertical — alimentan el plan de verdad:

```
FITNESS/NUTRICIÓN → nivel actual · lesiones/limitaciones · equipo disponible (casa/gym/nada)
FINANZAS          → medio de pago principal (efectivo/tarjeta/transferencia) · categorías donde
                    "se va" el dinero · día de cobro (ancla el ciclo del presupuesto)
EDUCACIÓN/IDIOMAS → nivel · tiempo disponible/día · meta concreta (viaje, trabajo, examen)
IA CREATIVA       → caso de uso (anuncio/guion/carrusel) · estilo/tono de marca
PRODUCTIVIDAD     → rol/contexto de trabajo · herramientas que ya usa
BIENESTAR         → momento del día crítico (dormir/mañana/estrés) · hábito actual de partida
```

**PREGUNTA DE ANCLAJE CONTEXTUAL (siempre va):** una de las preguntas del onboarding SIEMPRE es
"¿En qué momento del día vas a [la acción diaria]?" (mañana al despertar / almuerzo / noche…).
Las implementation intentions ("cuando pase X, haré Y") muestran d≈0.65 en un meta-análisis de
94 estudios (Gollwitzer & Sheeran 2006). La respuesta fija la HORA de la notificación desde el
día 1 — resuelve el arranque en frío del "hora activa histórica" de `24`.

La regla de arriba sigue mandando: si una pregunta no ecoa un campo de la ficha NI personaliza el
plan, es friccion decorativa y se corta. No existe un numero objetivo que haya que rellenar.
Reconocimientos (50 -> A5) y compromiso (50 -> A6) se usan cuando agregan comprension o deseo,
no para fabricar longitud.

---

## LAS 7 REGLAS DEL ONBOARDING DE ALTA CONVERSIÓN

Basadas en la investigación de 2026 y los patrones de las apps top:

```
1. UNA PREGUNTA O DECISION POR PANTALLA (Ley de Hick aplicada al onboarding)
   Una pregunta, un grupo de respuestas o una accion. Nada mas en pantalla. Nombre y meta son
   dos preguntas: nunca compartir pantalla ni indicador de progreso.
   Los "quiz" de onboarding que convierten tienen 1 elemento por paso.

2. CADA PREGUNTA CAMBIA ALGO REAL
   Solo preguntar lo que afecta la experiencia O construye compromiso.
   Las preguntas decorativas que no personalizan nada destruyen conversión.
   PERO: las preguntas que no afectan la funcionalidad pero aumentan el
   engagement (Cal AI) sí tienen lugar — son micro-compromisos.
   Evidencia experimental: Headspace + Irrational Labs (2026) — hacer preguntas DUPLICÓ la
   activación (31% → 63%) aunque la recomendación final fuera la MISMA ("perceived fit":
   sentirse visto); el brazo de pre-compromiso ("cuando pase X haré Y") sumó +7.5% de app opens.

3. BARRA DE PROGRESO SIEMPRE VISIBLE
   El efecto goal gradient: las personas se esfuerzan más mientras más cerca
   están de completar un objetivo. Una barra al 70% genera más urgencia que
   una al 0%. El progreso predispone a completar.

4. PERSONALIZACIÓN QUE SE VE
   El onboarding debe decir "basado en tus respuestas, tu plan es X" —
   no una pantalla genérica de bienvenida. Usar el nombre, el objetivo,
   las respuestas del usuario en el resultado que se muestra.

5. ANIMACIÓN DEL RESULTADO ANTES DEL PAYWALL
   El "loading screen" que genera el plan (como Noom) es la preparación
   del paywall. El usuario ve algo construirse para él — cuando llega el
   precio, ya lo quiere proteger.

6. LA PRIMERA VICTORIA ANTES DE 60 SEGUNDOS
   Si no hay free tier: el primer resultado útil debe aparecer
   inmediatamente después del pago/registro.
   Si hay free tier: la primera victoria lleva al paywall de forma natural.

7. SKIP DISPONIBLE EN PASOS NO CRÍTICOS (anti-REACTANCIA)
   Paradójicamente, dar la opción de saltar aumenta la conversión porque
   reduce la resistencia. El usuario que elige quedarse está más comprometido.
   El mecanismo tiene nombre: REACTANCIA — el lenguaje controlador ("debes",
   "tu única opción") es el disparador más replicado del efecto boomerang
   (meta-análisis Rains 2013). La salida visible ES la técnica, no una concesión.
```

---

## ¿CUÁNTAS PANTALLAS/PREGUNTAS DEBE TENER EL ONBOARDING? (con datos 2026)

La longitud larga puede funcionar cuando cada respuesta cambia un PLAN PERSONALIZADO, pero no se
copia por prestigio ni por categoria. Los lideres prueban recorridos distintos:
```
Noom     → ~40-120 pantallas según el teardown (varía por versión y por qué se cuenta) (10-15 min). El quiz largo ES el motor de conversión.
Cal AI   → ~20 pasos (preguntas + insights + features) → plan personalizado → trial corto.
Runna    → 36 pantallas (fitness de consumo — cada pregunta alimenta el plan de verdad; teardown UX Collective 2026).
Duolingo → ~7 preguntas rápidas + un ejercicio real ANTES de pedir registro.
Yuka (utilidad) → deliberadamente CORTO: el valor es obvio, el quiz solo estorba.
```
**LA REGLA POR TIPO DE APP (decidir y validar antes de disenar):**
```
UTILIDAD / VALOR OBVIO:
  -> 1-3 pasos; maximo 5 si cada respuesta cambia la salida. Valor en 30-60 segundos.

CONSUMO PERSONALIZADO / BIENESTAR / FITNESS / FINANZAS / HABITOS:
  -> empezar con 4-8 pasos de alto rendimiento: identidad/contexto, dolor, meta, restriccion,
     compromiso y resultado. Agregar mas solo si datos por paso y entrevistas demuestran valor.

EVALUACION PROFUNDA:
  -> 9-20 pasos solo cuando el diagnostico ES parte del producto, las respuestas cambian de forma
     visible el plan y el valor percibido compensa el tiempo. Probar abandono por paso.
```
> El agente DEBE clasificar la app (¿personaliza un plan, o es utilidad de valor obvio?) y fijar la
> longitud inicial antes de disenar. La categoria orienta; los datos propios deciden. RevenueCat
> observa que la mayoria de trials se inicia el dia cero: retrasar valor o la oferta exige evidencia,
> no imitacion. Ver contrato operativo y fuentes en `60-OPERACION-DE-CONVERSION.md`.

---

## EL DISEÑO DEL PAYWALL QUE CONVIERTE

> **Propiedad del pilar paywall:** ESTRATEGIA y anatomía → `02B-ONBOARDING-Y-PAYWALL.md` · medidas/layout/motion → `50-DISENO-ONBOARDING-PAYWALL.md` · palabras/fórmulas de copy → `52-COPY-VISUALES-CONVERSION.md`. Este archivo cubre SOLO su parte.

### La anatomía de un paywall de alta conversión

La eliminación de texto excesivo y el diseño enfocado en un mensaje claro aumentaron la conversión de install-to-trial en un 72% (dato de teardown sin fuente verificable — tratar como direccional). Los paywalls cortos con reseñas reales del App Store y un dato impactante sobre el resultado de la app superan a los paywalls largos con muchas features listadas.

```
ELEMENTOS OBLIGATORIOS:
✅ Encabezado que refleja el objetivo DEL USUARIO (no los features del producto)
   "Tu plan para [su meta] está listo" vs "Accede a todas las funciones"
✅ Headline corto y persuasivo (<=10 palabras) + subtítulo de máximo 2 líneas en mobile
✅ Logo/nombre de la app y ruta clara para volver en onboarding/paywall/login
✅ El resultado personalizado visible (usa su nombre, su meta, su respuesta — el nombre solo si YA lo diste/lo tienes del onboarding; NUNCA pedir nombre o correo para personalizar el paywall (52, hallazgo del 70%))
✅ El resultado NOMBRA EL MECANISMO (01, pregunta 4b): "tu [Radar de Antojos] está listo/configurado" — el test de salida del onboarding: si le preguntas al usuario QUÉ acaba de configurar, debe poder decir el nombre del mecanismo. Un onboarding del que se sale sin poder nombrar el mecanismo construyó un formulario, no una convicción
✅ LA INVERSIÓN VISIBLE (costo hundido — regla a de LA ESCALERA): "Hecho con tus N respuestas" o equivalente cuantificado — la inversión del onboarding se MUESTRA en el momento del precio (Arkes & Blumer 1985); no es un ejemplo de copy, es REGLA
✅ Prueba social específica: número de usuarios O reseña real con nombre y foto
✅ Las 3 funciones más importantes — sin más
✅ Precio con ancla: el mensual como referencia "cara" y el anual mostrado como $/mes en el display grande, con el TOTAL anual SIEMPRE visible en label ("Se cobra $X/año" — transparencia obligatoria, 50/52) y el ahorro en meses gratis
✅ CTA con beneficio: "Empezar mi plan" vs "Suscribirse"
✅ Garantía concreta si existe: "30 días o te devolvemos el dinero" o "Garantía Hotmart de 7 días" (reduce el miedo)
✅ Fecha exacta de cuándo se cobra (si hay trial)

ELEMENTOS QUE MATAN LA CONVERSIÓN:
❌ Listas largas de features (crea fatiga de decisión)
❌ Varios planes con diferencias confusas
❌ Precio mensual solo sin ancla anual
❌ CTA genérico ("Enviar", "Continuar", "Suscribirse")
❌ Sin garantía ni reversión de riesgo cuando ya existe checkout real
❌ Placeholder de confianza ("garantía visible", "pago seguro después") cuando la política aún no existe
❌ Pantalla idéntica para todos (ignorar la personalización del onboarding)
```

> El detalle de la ESTRUCTURA DE PRECIOS de estas cards (anclaje anual como $/mes, efecto señuelo con 3 tiers, créditos, trial por nicho) vive en `02C-PRICING-Y-MODELO-DE-NEGOCIO.md` — se decide ANTES de diseñar esta pantalla.

> **Día 1 sin prueba social (no inventarla JAMÁS):** una app recién lanzada no tiene reseñas ni "12.000 usuarios" — y rellenar con placeholders es la puerta por donde entran los testimonios fabricados. Usar la jerarquía día-1 del playbook "PRUEBA SOCIAL EN FRÍO" de `19-PAGINA-DE-VENTAS.md`: demo/GIF del producto real → garantía Hotmart destacada → resultado del propio fundador con fecha → beta testers reales divulgados. El bloque de reseñas/contador se OMITE hasta que sea real.

### PAYWALL DE SECUENCIA (multi-página) — la estructura que más convierte

+37% de conversión vs una página (12.41% vs 9.07% — Superwall 2026, 40M+ aperturas) y solo el
24% de las apps lo usa. La secuencia: pantalla de recap de valor personalizado → pantalla de
expectativas/timeline del trial → pantalla de precio. El paywall deja de ser UNA pantalla que
lo carga todo: cada paso responde una duda antes de mostrar el número. El blueprint vive en
`50` (C0).

### Las 7 preguntas que el paywall debe responder (la narrativa, no solo los elementos)

Un buen paywall no es una lista de precios — es un argumento. Antes de cerrar el diseño, verificar que la pantalla responde estas 7 preguntas en la cabeza del usuario, en este orden. Si una queda sin responder, ahí se cae la conversión:

```
1. ¿QUÉ DESBLOQUEO?      → el resultado/transformación, no las features (encabezado).
2. ¿POR QUÉ AHORA?       → el momento (acabas de ver tu plan/preview; tu prueba termina el día X).
3. ¿QUÉ PIERDO SI NO SIGO?→ aversión a la pérdida honesta (tu plan/progreso queda sin completar).
4. ¿QUÉ GANO HOY?        → el valor inmediato al pagar (acceso completo, primera victoria protegida).
5. ¿PUEDO CANCELAR?      → reversión de riesgo (cancela cuando quieras, garantía de devolución).
6. ¿CUÁL PLAN ME CONVIENE?→ un plan recomendado OBVIO (anual como $/mes, badge, pre-seleccionado).
7. ¿Y SI NO QUIERO AHORA?→ salida limpia ("Ahora no" / seguir con versión limitada), sin culpa.
```

**Estructura narrativa que ensambla las 7** (de arriba a abajo en la pantalla):
```
Headline de RESULTADO  → "Crea contenido con IA sin empezar desde cero" (responde 1)
Subheadline PERSONAL   → "Preparamos tu ruta según tu nicho y objetivo" (usa sus respuestas)
Beneficios concretos   → máx 3, en lenguaje de resultado (responde 1 y 4)
Prueba social          → número real o reseña con nombre (baja el riesgo percibido)
Plan recomendado       → anual $/mes pre-seleccionado + "2 meses gratis" (responde 6)
Confianza/reversión    → garantía + fecha de cobro + "cancela cuando quieras" (responde 5 y 2)
CTA con beneficio      → "Desbloquear mi plan" (responde 4)
Salida limpia          → "Ahora no" (responde 7, sin confirmshaming)
```

> La regla 3 (aversión a la pérdida) es la más fácil de convertir en dark pattern. Hacerla HONESTA: "tu plan queda sin completar" (real) ✅ — no "vas a fracasar sin esto" (culpa) ❌. Ver ética de gamificación en `03` y `24`.

### LA CAPA DE PERSUASIÓN — cómo las "máquinas de conversión" venden (psicología + copywriting)

Un paywall y un onboarding que convierten no solo están "bien diseñados" — están construidos sobre psicología de la decisión. El punto operativo: **la decisión de compra/registro se inicia en lo emocional; la lógica la JUSTIFICA después**. Por eso la emoción inicia la acción y los datos la respaldan. Estos son los gatillos que usan Duolingo, Noom, Cal AI y las top — aplicados con ÉTICA (gatillo real, nunca manipulación; ver `03`):

```
LOS 7 PRINCIPIOS DE CIALDINI, APLICADOS AL ONBOARDING + PAYWALL:
1. COMPROMISO Y CONSISTENCIA → micro-compromisos en el onboarding. Quien YA invirtió tiempo, convierte.
   Duolingo: pre-comprometerse a una meta diaria + racha ANTES de la 1ª lección. Pide pequeñas decisiones
   que el usuario quiera honrar.
2. RECIPROCIDAD → dar valor ANTES de pedir pago (la preview, el plan, un insight gratis). Noom: cada
   pregunta DEVUELVE algo (un dato, una validación) — el usuario siente que ya recibió antes de pagar.
3. PRUEBA SOCIAL → "+12.000 personas ya lo usan", reseña con nombre y foto, rating. La gran mayoría
   (93-95% según BrightLocal/Podium) lee reseñas antes de decidir. Específica > abstracta.
4. AUTORIDAD → respaldo creíble (método, ciencia, experto, números reales). Noom apoya en CBT/ciencia.
5. ESCASEZ / URGENCIA → solo si es REAL (oferta de fundador que expira, cupos reales). Falsa = dark pattern.
6. SIMPATÍA (liking) → hablarle como un aliado, en su lenguaje, con su nombre y su meta. Cal AI: tono
   cercano + personalización profunda + pedir reseña a mitad del onboarding (cuando el ánimo está alto).
7. UNIDAD / IDENTIDAD → "para personas como tú que [identidad]". Atoms (James Clear): hábitos basados en
   identidad — "conviértete en alguien que [meta]".
```

```
GATILLOS DE COPYWRITING (el lenguaje que convierte):
- AVERSIÓN A LA PÉRDIDA (2× más fuerte que ganar): enmarca lo que PIERDE, no solo lo que gana.
  ✅ "No pierdas el plan que armaste" · ✅ "Deja de perder 2 horas por carrusel" — no solo "ahorra tiempo".
- ANCLAJE: muestra primero el precio ALTO (mensual) para que el anual se sienta ganga (ver la
  estrategia de pricing en `02C-PRICING-Y-MODELO-DE-NEGOCIO.md`).
- ESPECIFICIDAD: "de 2 horas a 4 minutos por carrusel" convierte más que "ahorra tiempo". El número
  concreto da crédito — pero SOLO si es verificable y propio. ⛔ PROHIBIDO: claims de ingresos
  ("gana $X en Y días") o de salud sin sustento — violan políticas de Meta/TikTok y queman cuentas
  de ads (ver `47` → "claims publicitarios y moderación").
- EMOCIÓN PRIMERO, LÓGICA DESPUÉS: el titular toca la emoción (la transformación); los bullets dan la
  razón lógica para justificar la compra que la emoción ya inició.
- "CADA PREGUNTA DEVUELVE ALGO" (Noom): en el onboarding, tras un dato sensible, responde con
  reconocimiento/insight ("la mayoría que empieza como tú ve [X] en 2 semanas"). Nunca solo "siguiente".
- EL LOADING QUE CONSTRUYE EL PLAN es persuasión: el usuario VE su resultado armándose → ya lo quiere proteger.
- CTA en primera persona y de beneficio: "Empezar MI plan" > "Suscribirse" (el usuario se apropia de la acción).
- REVIEW PROMPT a mitad del onboarding (Cal AI), en el pico emocional, no al final.
```

> **Límite ético (no negociable):** estos gatillos venden DANDO valor real, no explotando. Prohibido: urgencia/escasez falsa, culpa ("no, prefiero seguir fracasando"), prueba social inventada, esconder el precio o la cancelación. Un gatillo deshonesto es deuda de confianza (ver `03` y `47`). La diferencia entre máquina de conversión y dark pattern es si el usuario, al pagar, recibe lo que la emoción le prometió.

---

## CHECKLIST DE ONBOARDING Y PAYWALL

```
DISEÑO DEL ONBOARDING
[ ] 1 decisión por pantalla
[ ] Barra de progreso visible en todo el onboarding
[ ] Cada pregunta personaliza el resultado O construye compromiso
[ ] "Skip" disponible en pasos no críticos
[ ] Animación que genera el "plan personalizado" antes del paywall
[ ] La primera victoria del usuario ocurre antes de los 60 segundos

DISEÑO DEL PAYWALL
[ ] Encabezado con el objetivo del usuario (no features del producto)
[ ] El resultado personalizado visible (nombre, meta, respuestas del onboarding — el nombre solo si YA lo tienes del onboarding; NUNCA pedir nombre o correo para personalizar el paywall (52, hallazgo del 70%))
[ ] Prueba social específica (número real o reseña con nombre) — si aún no existe, jerarquía día-1 de 19 (demo real/garantía/fundador); NUNCA placeholders
[ ] Máximo 3 features destacados
[ ] Precio con ancla: mensual vs anual con el ahorro en meses gratis (ej. badge "2 MESES GRATIS")
[ ] CTA con beneficio ("Empezar mi plan")
[ ] Garantía de devolución visible
[ ] Fecha exacta de cobro si hay trial
[ ] La inversión del usuario VISIBLE en el momento del precio ("Hecho con tus N respuestas"
    o equivalente cuantificado — regla a de LA ESCALERA)
[ ] El último reconocimiento pre-paywall ETIQUETA con identidad aspiracional (regla b de
    LA ESCALERA — labeling effect, Tybout & Yalch 1980)
[ ] Pico y final diseñados: revelación del plan = pico · rating en el pico PRE-paywall ·
    pantalla post-pago = final que fija el recuerdo (regla c de LA ESCALERA, peak-end)

ESTRATEGIA
[ ] Se revisaron los patrones de apps ganadoras aplicables (ver "PATRONES REALES DE APPS
    GANADORAS" arriba y `52` → "2bis") antes de diseñar el onboarding/paywall desde cero
[ ] El titular del paywall pasó por las 4 U's de `52` → "1bis", no solo por la plantilla de
    "pérdida honesta + resultado"
[ ] El onboarding hace los 5 trabajos (segmentar · personalizar · activar · crear deseo · preparar el pago)
[ ] El paywall responde las 7 preguntas (qué desbloqueo · por qué ahora · qué pierdo · qué gano · puedo cancelar · cuál plan · salida limpia)
[ ] Longitud inicial fijada por valor: 1-3/max 5 utilidad · 4-8 personalizado · >8 solo con evidencia
```

> Las decisiones de MODELO y PRICING (orden de diseño, nicho A-F, frecuencia→modelo, trial, créditos,
> anual como $/mes, .99, señuelo, PUENTE DE CHECKOUT y métricas del funnel) se verifican con el
> checklist de `02C-PRICING-Y-MODELO-DE-NEGOCIO.md` — deben estar tomadas ANTES de diseñar este funnel.
