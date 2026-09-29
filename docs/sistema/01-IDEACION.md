# FASE 0 — IDEACIÓN Y DESCUBRIMIENTO

## LA CONSTITUCIÓN DEL PRODUCTO (completar ANTES de pedir cualquier pantalla o UI)

Estas 6 preguntas son el filtro más importante del proyecto. Si no pueden responderse, no hay suficiente claridad para generar UI final. Documentar las respuestas en `ESTADO.md` antes de diseñar nada — la IA las consulta cada vez que haya duda sobre qué construir o qué cortar.

```
1. ¿Quién es el usuario principal y en qué situación concreta usa la app?
2. ¿Qué problema real quiere resolver y qué intenta evitar?
3. ¿Cuál es la promesa central de la app en UNA frase?
4. ¿Cuál es la primera victoria que debe experimentar (el "momento aha")? — y se define así:
   la primera vez que el usuario SIENTE EL MECANISMO funcionando con SUS datos (no un tour,
   no una promesa: el Radar detectando SU antojo, el Escáner leyendo SU foto)
4b. ¿Cómo se llama EL MECANISMO? Se bautiza AQUÍ, en la Constitución (con el PROTOCOLO DE
   MECANISMO REAL del 19: nombra el paso que elimina la causa del fracaso anterior, y pasa el
   test de falsabilidad). Por qué aquí y no en la landing: las apps líderes no venden "muchas
   funciones" — venden UN mecanismo fácil de recordar y una sensación útil casi inmediata; el
   nombre es la columna vertebral que atraviesa landing, onboarding, paywall y el ritual
   diario, así que tiene que existir ANTES de construir cualquiera de ellos. Es cosa juzgada:
   el MISMO nombre en todas las superficies, nunca se renombra por pantalla.
5. ¿Cuáles son los 3 flujos más importantes?
6. ¿Qué comportamientos NUNCA debe tener la app aunque mejoren métricas a corto plazo?
```

> ⚠️ **La Constitución NO es un cuestionario para el usuario.** El usuario sabe poco o nada de
> crear apps: la IA REDACTA las 6 respuestas a partir de la idea que él dio + la investigación
> (las 4-6 — primera victoria, flujos, regla-nunca — se DERIVAN de la promesa y del nicho, no se
> preguntan), se las presenta COMPLETAS en un solo mensaje simple ("así entiendo tu app — corrige
> lo que no encaje") y avanza con su OK. Solo se pregunta lo indeducible, y siempre con 2-3
> opciones propuestas, nunca en blanco (CLAUDE.md → DECIDE-INFORMA-AVANZA).

**Fórmula obligatoria de promesa** (completar y guardar en ESTADO.md):
> "Esta app ayuda a [tipo de usuario] a lograr [resultado deseado] sin [fricción principal], mediante [mecanismo diferencial]."

**Regla de filtro:** Si una función no apoya la promesa central, probablemente sobra o debe esperar. Pensar desde el problema evita que la app se parezca a una plantilla genérica — cuando se entiende la situación real del usuario, aparecen decisiones de interfaz más humanas: qué mostrar primero, qué ocultar, qué automatizar.

**Criterio de aceptación:** Si eliminas una función y el usuario aún puede lograr la promesa principal con menos esfuerzo, esa función no era esencial para el MVP.

> **Validar la hipótesis antes de construir:** la hipótesis de problema que captura esta Constitución se VALIDA con usuarios reales en `44-DESCUBRIMIENTO-DE-USUARIO.md` antes de construir — el comportamiento pasado del segmento confirma (o tumba) el dolor antes de que `02` lo pruebe con dinero.

---

## Objetivo
Definir qué web app se va a crear. Si el usuario no tiene idea, guiarlo hasta una. Si ya tiene idea, refinarla y validar que tiene potencial.

---

## FUENTES DE INVESTIGACIÓN — Dónde Buscar Ideas Validadas

Usar estas fuentes con herramientas de búsqueda web al ejecutar el FLUJO A de `INICIO.md`. No son para leer manualmente — son para buscar en ellas activamente con queries específicos.

### 📡 EL RADAR DE MERCADO (las fuentes que la IA consulta — el usuario JAMÁS visita estas páginas)

**REGLA DE OPERACIÓN:** la IA consulta, extrae, CITA fuente + fecha y presenta en simple. El usuario
no abre ninguna de estas páginas: recibe el hallazgo ya digerido, con su fuente. Todo dato extraído
se CACHEA en la ficha correspondiente (`FICHA-MERCADO.md`, `FICHA-MODELO.md`) — las fuentes
gratuitas se están cerrando (AppMagic endureció su free tier en ene-2026 explícitamente contra
scraping); si una fuente está caída o cerrada, se usa el fallback y se anota en la ficha.

**TABLA DEL RADAR** (fuente · qué extrae la IA gratis y sin cuenta · a qué señal alimenta — datos verificados 21-08-2026):

| Fuente | Qué extrae la IA (gratis y sin cuenta) | Alimenta |
|---|---|---|
| **TrustMRR** (trustmrr.com, 100% navegable sin login) | Revenue REAL verificado por API de pago — MRR, revenue 30d, suscriptores, stack, canales, pricing de 9.000+ startups (ej. verificado 21-08-2026: Rezi $257k MRR con 10.677 subs visibles). LA fuente para elegir la app modelo | Señal 2 (pagan) |
| **RevenueCat State of Subscription Apps** (microsite público, gratis sin email) | Benchmarks de la categoría — conversión, churn, trial, pricing (115.000 apps, $16B) | Señal 2 + calibración de expectativas |
| **Sensor Tower lookup público** (app.sensortower.com/overview/{appId}, sin login) | Descargas + revenue del ÚLTIMO MES del líder concreto, cifra puntual (verificado 21-08-2026: ChatGPT $276M/mes). Solo sanity-check — el resto es enterprise ($42k+/año: NO pagar) | Señal 2 |
| **AppMagic top charts** (appmagic.rocks/top-charts/apps, sin cuenta) | Ingresos/descargas estimados EN RANGOS por app y categoría, mensual. Frágil (anti-scraping desde ene-2026; adquirida por Sensor Tower may-2026) — usar con fallback a Appfigures | Señales 1-2 |
| **Appfigures** (charts públicos top grossing por país/categoría sin login + blog con cifras) | Fallback de AppMagic y fuente de "cuánto factura X" | Señal 2 |
| **Similarweb** (página pública por dominio, límite diario) | Tráfico, canales y países de competidores WEB — la señal de revenue para web apps, que las stores no ven | Señales 1-2 (crítico: el SO construye web apps) |
| **Marketplace de Hotmart** (público) | Qué YA se vende del dolor X en español/portugués, a qué precio y con qué promesa — la señal de pago del canal EXACTO del SO | Señal 2 |
| **Product Hunt** (leaderboards y productos públicos) | Tendencias, posicionamientos, objeciones en comentarios. ⚠️ votos ≠ mercado (cero revenue, sesgo early-adopter) | Señales 1 y 4 |
| **Mobbin** (plan gratis: ~8 apps completas recientes) | Los flujos REALES de onboarding→paywall del modelo, pantalla a pantalla | FICHA-MODELO |
| **Meta Ads Library** (gratis, sin cuenta) | Ads activos de cualquier competidor — copy, hooks, ANTIGÜEDAD (meses activo = rentable) y desde ene-2026 el RANGO DE IMPRESIONES por anuncio (distingue al que testea del que escala) | Señales 2-3 |
| **TikTok Creative Center** (gratis) | Top ads por país/industria. ⚠️ TikTok anunció que Top Ads dejará de actualizarse durante 2026 — verificar al usar | Señal 3 |
| **AppTweak free tools** | Top charts + VOLUMEN de keywords (Search Popularity oficial de Apple) — demanda cuantificada en español | Señal 4 |
| **Starter Story / Indie Hackers products / Acquire.com** (públicos) | Case studies con revenue declarado, MRR, listings con TTM/stack. Calibración: mediana indie $169/mes y solo 0,9% supera $10k/mes (análisis de 5.079 productos Stripe-verified, verificado 21-08-2026) | Señal 2 |
| **Growth.Design** (teardowns gratis) y **Sub Club** (podcast de RevenueCat) | El PORQUÉ psicológico de los patrones del modelo y la doctrina de suscripción | FICHA-MODELO y 02B/02C |

**EL PIPELINE (en orden):** tendencia (Product Hunt + charts) → candidatas con revenue real
(TrustMRR / Starter Story / Acquire) → benchmarks de la categoría (RevenueCat SOSA) → sanity-check
del líder (Sensor Tower lookup) → si es web: Similarweb → pago LATAM (Hotmart marketplace) →
plano UX del modelo (Mobbin) → ángulos (Meta Ads Library + TikTok Creative Center).

### Para ver qué funciona afuera (mercados extranjeros)
```
Las fuentes con revenue real (TrustMRR, Product Hunt, Indie Hackers, Acquire...) viven en la
TABLA DEL RADAR de arriba — consultar de ahí, no duplicar queries.
appsumo.com         → software que vende a emprendedores. Precios y volumen de compras.
```

### Para detectar tendencias antes de que lleguen a LATAM
```
explodingtopics.com → términos de búsqueda con crecimiento acelerado en últimos 6 meses
trends.google.com   → comparar EN vs ES de la misma keyword (¿crece la búsqueda en español?)
bigideasdb.com      → ideas rankeadas por quejas reales de usuarios (238K+ validadas)
reddit.com          → r/SaaS, r/indiehackers, r/microsaas — buscar "I wish there was a tool for..."
```

### Para confirmar que el dolor existe en LATAM
```
Google Trends en español → buscar la keyword en ES, filtrar por región LATAM
Reddit en español         → r/es, r/colombia, r/mexico, r/argentina — quejas + necesidades
Comunidades de nicho      → Facebook groups, Telegram, Discord de emprendedores LATAM
```

### 🔴 DE DÓNDE SALEN LAS CANDIDATAS (el paso que decide la calidad de todo lo demás)

> **Dos fallos detectados probando, en direcciones opuestas:**
> 1. Primero el agente generó **15 categorías obvias de apps de IA de consumo** (calorías, journaling,
>    CV, fitness…) — la lista que busca todo el mundo, ya clonada. Casi todas tomadas → 1 sola idea.
> 2. Al empujarlo hacia nichos menos obvios, produjo ideas **raras y no construibles** (un generador
>    de anuncios en video para empresas), imposibles para alguien no técnico.
>
> Ninguno de los dos extremos sirve. Lo que funciona está en el medio, y tiene una forma concreta:
> **categoría probada + audiencia específica + construible en una semana.**

**La pregunta correcta NO es "¿qué idea nueva puedo inventar?".** Es:

```
¿Qué tipo de app lleva años ganando dinero de forma consistente,
   es simple de construir,
   y todavía no está bien resuelta EN ESPAÑOL para UNA audiencia concreta?
```

#### PASO 1 — Partir de las categorías que históricamente monetizan (no de la moda)

No hay un directorio mágico de "apps garantizadas" — quien lo venda, miente. Pero **sí hay datos
anuales de qué categorías monetizan y retienen de verdad**, y este SO ya los cita en el Pilar 5:

| Categoría | Por qué es terreno fértil |
|---|---|
| **Salud y Fitness** | La mayor LTV/ARPU de todas |
| **Foto y Video** | La mayor tasa de éxito: ~28% llega a $1k/mes en 2 años |
| **Productividad / Utilidades** | Dolor recurrente, se paga sin drama |
| **Finanzas personales** | Ansiedad recurrente = uso recurrente |
| **Educación / Aprendizaje** | Ciclo de decisión largo pero LTV alta |

> ⚠️ Actualizar esta tabla con el informe anual más reciente al empezar un proyecto, y **anotar
> fuente y fecha en `FICHA-MERCADO.md`**. Las categorías se mueven poco año a año; los números sí.

**La categoría se elige de esta tabla.** No de lo que está de moda en X esta semana.

#### PASO 2 — La variación viene de la AUDIENCIA, no de inventar categorías raras

Aquí está la clave que evita tanto la repetición como las ideas extrañas: **la categoría se mantiene
probada; lo que cambia de un usuario a otro es PARA QUIÉN y para QUÉ momento exacto.**

```
Categoría probada  ×  Audiencia específica  ×  Momento concreto
     (paga)              (alcanzable)            (el dolor)
```

Una misma categoría da decenas de apps distintas y todas siguen siendo terreno probado:

```
"Seguimiento con IA"  → para embarazadas · para quien entrena fuerza · para diabéticos ·
                        para quien deja de fumar · para cuidadores de un familiar mayor
"Foto → resultado"    → antes/después de obra · progreso físico · estado de una planta ·
                        inventario de un negocio pequeño · documentos de un trámite
"Texto → documento"   → contratos simples · propuestas · reportes de clase · descripciones
                        de producto · resúmenes de historia clínica personal
```

**Regla de variación entre usuarios:** al arrancar, elegir **audiencias distintas de las de la última
ronda** (queda anotado en `ESTADO.md`). Repetir categoría está bien y es deseable —son las que pagan—;
repetir la misma app exacta, no. Si dos usuarios reciben propuestas parecidas porque la categoría es
buena, eso es correcto: **es mejor una categoría probada compartida que una idea rara exclusiva.**

**REGLA DEL EJE ÚNICO:** «Del modelo se cambia UN SOLO EJE — audiencia, idioma/geo o ángulo — y se
CONSERVA todo lo probado: la estructura del onboarding, el momento del paywall y la arquitectura de
pricing. Dos ejes cambiados a la vez ya no es modelado: es apuesta.»

#### PASO 3 — De dónde sale el DOLOR concreto de esa audiencia

Con categoría y audiencia elegidas, el dolor específico se busca (no se imagina):

```
→ Grupos y foros DE ESA AUDIENCIA (no de tecnología): qué preguntan una y otra vez
→ Reseñas 1-2★ de las apps líderes de esa categoría, en español: qué odian
→ Marketplaces de servicios: ¿le pagan a alguien por resolver esto hoy? ¿cuánto?
   ⚠️ Esta es la señal de pago más fuerte que existe: ya está probada, no hay que estimarla
→ Cambios recientes (una norma, un requisito) que obliguen a esa audiencia a algo nuevo
```

### 🚦 GATE 4 — CONSTRUIBILIDAD (nuevo gate duro)

> **El fallo que corrige:** se propuso una app de generación de anuncios en video para empresas a un
> usuario **no técnico**. Aunque la idea fuera rentable, es inconstruible para él: video, integraciones,
> costos por render. Una idea que el usuario no puede construir **no es una oportunidad, es una
> frustración con fecha.**

Antes de proponer, la idea tiene que caber en lo que este SO construye de verdad en ~1 semana:

```
✅ SÍ (el 90% de las apps ganadoras caben acá)
   texto → texto              (analizar, redactar, resumir, planificar, explicar)
   foto → texto/análisis      (identificar, medir, comparar, corregir)
   voz → texto                (transcribir, resumir, organizar)
   formulario → documento     (generar un plan, contrato, reporte, rutina)
   registro propio → insight  (seguimiento + patrón + recomendación)

⚠️ CON CUIDADO (sube costo y complejidad — solo si es EL núcleo del valor)
   generación de imagen (asíncrono + almacenamiento + costo por imagen)

❌ NO para un usuario no técnico con este SO
   generación o edición de VIDEO
   integraciones con sistemas de terceros (CRM, ERP, bancos, facturación)
   scraping o datos en tiempo real de fuentes cerradas
   marketplace de dos lados (necesita oferta Y demanda desde cero)
   hardware, wearables, o cualquier cosa que dependa de un dispositivo externo
   tiempo real multi-usuario (chat en vivo, colaboración simultánea)
```

**Si la idea cae en ❌, no se propone** — por muy buen negocio que parezca. Se busca el ángulo de la
misma audiencia que SÍ caiga en ✅, o se descarta.

### Cuántas presentar y qué hacer si no salen

```
Objetivo: 5 oportunidades que pasen los 4 gates.
La generación por categoría × audiencia está DISEÑADA para producir suficientes:
si no salen 5, casi nunca es que el mercado esté lleno — es que se probaron pocas audiencias.

Pasan 5 o más → presentar las 5 mejores
Pasan 3-4     → presentar esas, y decir cuántas audiencias se probaron
Pasan <3      → NO presentar. Segunda ronda con OTRAS audiencias de las MISMAS
                categorías probadas (no cambiar a categorías raras para llenar el cupo)
Pasan <3 tras dos rondas → presentar lo que haya + preguntar al usuario por una
                audiencia que él conozca bien (ahí sabe cosas que el agente no)
```

⚠️ **El umbral de calidad no baja nunca.** Lo que sube cuando faltan ideas es el número de
**audiencias** exploradas dentro de categorías que ya sabemos que pagan — nunca la tolerancia a una
idea floja, ni el salto a un nicho exótico para llenar el número.

**Presupuesto:** ~10-14 búsquedas por ronda. Empezar por marketplaces de servicios de la audiencia
elegida (señal de pago probada) rinde más que buscar categorías sueltas.

---

### PROTOCOLO DE BÚSQUEDA — cuatro señales distintas, cuatro búsquedas distintas

> ⚠️ **El error que degrada esta fase:** buscar una sola señal (que la app exista y le vaya bien
> afuera) y usarla para responder las cuatro preguntas. "Levantó $20M" prueba que el problema es real
> — **no** prueba que duela en LATAM, ni que paguen, ni que puedas alcanzarlos, ni que crezca.
>
> Cada señal se busca **por separado**, con sus fuentes y sus queries. Una candidata sin las cuatro
> señales no está investigada: está intuida.

**SEÑAL 1 — ¿DUELE DE VERDAD? (dolor, no interés)**
```
Reseñas de 1-2★ de los líderes de la categoría, en App Store y Play EN ESPAÑOL
   → lo que ODIAN es el hueco; las quejas repetidas mes a mes son el dolor real
"[problema] no funciona" / "odio tener que" / "pierdo horas" site:reddit.com
"ojalá existiera" OR "alguien conoce una app que" + [nicho]  (en español)
Grupos de Facebook y Telegram del nicho → leer, no publicar
Foros verticales del oficio (no foros de tecnología)
```

**SEÑAL 2 — ¿PAGAN? (la señal que más se falsifica)**
```
⚠️ Precio del competidor ≠ prueba de que alguien paga. Es su lista de deseos.
Lo que SÍ prueba pago:
   Top Grossing de App Store / Play POR PAÍS de LATAM en la categoría
      → estar en top grossing es dinero entrando, no descargas
   Estimaciones de ingresos por país (Sensor Tower, Appfigures, data.ai)
   Biblioteca de Anuncios de Meta: ¿hay alguien pagando anuncios de esto EN ESPAÑOL,
      y hace CUÁNTO que corren? → un anuncio que lleva meses activo es rentable.
      Un anuncio que nadie sostiene es un mercado que no paga.
      Sub-dato (disponible desde ene-2026): el RANGO DE IMPRESIONES por anuncio —
      anuncio con meses de antigüedad + rango alto de impresiones = el competidor
      ESCALA, no testea.
   Marketplaces de compraventa (Acquire, Flippa): apps del nicho con MRR declarado
   ¿La gente ya paga por resolverlo SIN app? (un servicio, un gestor, un curso, un freelancer)
      → esta es la señal más fuerte de todas: dinero ya moviéndose por ese dolor
```

**SEÑAL 3 — ¿SE LES ALCANZA BARATO? (el pilar que mata más apps buenas)**
```
Biblioteca de Anuncios de Meta → ¿qué ángulos usan? ¿cuántos anunciantes compiten?
   Muchos anunciantes = validado pero caro. Ninguno = o no paga, o nadie lo intentó
Estimar el CPM del país + intereses de segmentación reales (¿existe el interés?)
   ⚠️ Un público que NO se puede segmentar en Meta es un público caro, aunque exista
¿Hay creadores de contenido de ese nicho en español? (TikTok/YouTube/IG)
   → si hay creadores, hay audiencia agrupada y hay canal orgánico
¿Hay comunidades donde ya estén juntos? (grupos, subreddits, Discords)
Regla: si no puedes nombrar el lugar CONCRETO donde están juntos, no tienes canal.
```

**SEÑAL 4 — ¿CRECE?**
```
Google Trends, keyword EN ESPAÑOL, 24-36 meses, filtrado por país LATAM
   ⚠️ Comparar EN vs ES: si sube en inglés y es plano en español, es una tendencia
      que aún no llegó (oportunidad) o que no aplica (trampa). Hay que decidir cuál.
Exploding Topics → crecimiento acelerado, y desde cuándo
Volumen de keywords EN ESPAÑOL (AppTweak free tools — Search Popularity oficial de Apple)
   → demanda CUANTIFICADA en español, complementa el dato RELATIVO de Google Trends
¿Entran competidores NUEVOS al mercado? → sí = hay dinero
¿Hay un cambio estructural detrás? (regulación, demografía, precio de una tecnología)
```

**Regla de honestidad de la investigación:** cada dato lleva **fuente y fecha**, y cuando una señal no
se encuentra se escribe `NO ENCONTRADO` — nunca se rellena con lo que parece razonable. Una candidata
con tres señales verificadas y una `NO ENCONTRADO` es más útil que cuatro señales inventadas, porque
dice exactamente qué falta comprobar antes de apostar. Todo esto alimenta `FICHA-MERCADO.md`.

---

## EL FILTRO DE ARBITRAJE LATAM (dice DÓNDE buscar, no QUÉ proponer)

> ⚠️ **Este filtro NO decide.** Encuentra terreno fértil: categorías donde algo ya funciona afuera y
> está desatendido en español. Pero "existe afuera + hay hueco en español" **no es una idea ganadora**,
> es una pista. Lo que decide son los 8 PILARES y los 4 GATES de la sección siguiente.
>
> Un informe de arbitraje sin puntuación de pilares **no es un entregable válido**: es investigación a
> medias. Presentar candidatas comparadas solo por "tracción afuera / hueco en español" es el error
> más común de esta fase, y produce ideas correctas pero mediocres — clones finos que el incumbente
> localiza en un mes.

Una idea es una oportunidad de oro cuando pasa los 3 filtros simultáneamente:

```
✅ FILTRO 1 — Funciona afuera: la app tiene revenue real, reseñas positivas, 
   usuarios activos en mercados de habla inglesa o europea.

✅ FILTRO 2 — El dolor existe en LATAM: búsquedas en español creciendo,
   quejas similares en comunidades latinoamericanas, problema universal.

✅ FILTRO 3 — No hay competidor fuerte en español: sin app equivalente 
   con tracción real en LATAM, o la que existe tiene mala UX/UX y malas reseñas.
```

Si pasa los 3: el riesgo de validación es mínimo — el problema ya está probado,
solo hay que adaptarlo al contexto y al idioma. Eso es arbitraje de mercado.

> **El arbitraje gana por ADAPTACIÓN** — pago local, canal local, confianza local, precio al poder
> adquisitivo — no por traducción. El clon que solo traduce queda como la copia barata (Wharton,
> caso Rocket Internet; Zalando ganó ENRIQUECIENDO el modelo, no clonándolo).
>
> **REGLA DEL EJE ÚNICO:** «Del modelo se cambia UN SOLO EJE — audiencia, idioma/geo o ángulo — y se
> CONSERVA todo lo probado: la estructura del onboarding, el momento del paywall y la arquitectura de
> pricing. Dos ejes cambiados a la vez ya no es modelado: es apuesta.»

Si solo pasa 1 o 2: puede funcionar, pero requiere más validación antes de construir.

---

## LOS PILARES DE UNA IDEA GANADORA (con datos 2026 — NO "la primera que se te ocurra")

El arbitraje LATAM dice DÓNDE buscar. Estos pilares dicen QUÉ separa una idea millonaria de una que nadie paga. Los datos son contundentes: **solo ~17% de las apps nuevas llegan a $1.000/mes de ingreso** y los líderes (top 25%) crecen +80% al año mientras el cuartil de abajo PIERDE un tercio (RevenueCat, State of Subscription Apps 2026). La diferencia no es suerte: las ganadoras comparten una estructura. **Una idea solo se le propone al usuario si pasa estos 8 pilares — jamás la primera ocurrencia.**

### Pilar 1 — DOLOR AGUDO, no "estaría bueno" (painkiller > vitamina)
Las apps que resuelven un dolor URGENTE convierten **5-9× más** que las "nice-to-have" (hasta 37% vs 4% de conversión). La gente YA busca cómo resolverlo y paga por que el dolor PARE. Rúbrica de 4 preguntas (1-5 cada una):
```
1. ¿Qué tan URGENTE es el problema?         (1 mejora linda → 5 dolor diario que ya intentan resolver)
2. ¿Qué pasa si NO lo resuelven?            (1 nada → 5 consecuencia real: dinero, salud, tiempo, reputación)
3. ¿Cuánto ALIVIO emocional da resolverlo?  (1 leve → 5 transformación/alivio fuerte)
4. ¿Qué tan malas son las ALTERNATIVAS hoy? (1 hay opciones gratis fáciles → 5 caras/lentas/frustrantes)
Suma:  16-20 = painkiller con poder de precio · 10-15 = vitamina con un nicho que sí paga · 4-9 = vitamina (descartar o reposicionar)

5. (MODIFICADOR para suscripción) ¿CADA CUÁNTO aparece el dolor? (raro/1 vez en la vida → recurrente diario/semanal)
   → Esto NO suma al painkiller, pero DECIDE el modelo de negocio (ver Pilar 6).
```
> **Trampa #1: confundir FRECUENCIA DE USO con disposición a pagar.** Una app de fertilidad usada 1 vez al día tiene WTP enorme; una del clima usada 5 veces al día, casi cero. **La urgencia paga, no la frecuencia de uso.**
> **Trampa #2 (la que se nos coló probando): el "catastrófico-pero-raro".** Un dolor enorme que ocurre UNA vez (sacar una visa, comprar un auto, una crisis) puntúa altísimo en "consecuencia" (pregunta 2) y PARECE ganador — pero como no se repite, es un **producto de pago único**, no una suscripción. Para este SO (suscripción recurrente por Hotmart), un painkiller de 18/20 que solo se usa una vez vale MENOS que uno de 16/20 que se usa cada semana. **Intensidad alta + frecuencia baja = transaccional, no suscripción** (ver Pilar 6, que es un gate duro).

### Pilar 2 — UN PROBLEMA QUE MILLONES COMPARTEN (demanda revelada, no imaginada)
No un dolor de 200 personas: uno universal y visible EN PÚBLICO. Señales de demanda REAL (buscarlas, no suponerlas): reseñas de 1-2 estrellas de las apps líderes (lo que ODIAN = tu oportunidad), "ojalá existiera algo que…" en Reddit/foros/grupos, volumen de búsqueda creciente, las MISMAS quejas repitiéndose mes a mes. Si nadie se queja del problema en ningún lado, probablemente no duele lo suficiente para pagar.
> **NO confundir dos señales distintas** (el error que se nos coló probando): que una startup gringa **levantó $20M** o **existe afuera** prueba que el PROBLEMA es real (señal de arbitraje, Pilar 7) — NO prueba que un latino pague **$20/mes por Hotmart**. La inversión de un VC ≠ disposición a pagar en LATAM. La señal de pago LATAM es propia: ¿hay gente en LATAM **gastando dinero hoy** en resolver esto (otra app de pago, un servicio, un "despacho", consultas)? Esa es la que vale para el modelo del SO. Si solo tienes "existe afuera" pero cero evidencia de pago en LATAM, baja la idea a "validar con el gate de demanda de 02".

### Pilar 3 — UN MOMENTO-IA QUE DE VERDAD RESUELVE (no que SIMULA) — el truco de Cal AI
Cal AI (~$30M/año) ganó con UN momento: foto → tus calorías. Su insight: *"la gente odia registrar comida a mano; la IA de visión elimina la peor parte de eso."* Específico, acotado, resuelto con UNA buena interacción de IA. La idea ganadora **toma el paso más tedioso de un trabajo que la gente YA hace y lo borra con IA en un solo toque** — no es "40 herramientas en una", es un wow puntual y memorable.
> **El wow tiene que ser REAL, no un disfraz** (el error que se nos coló probando con el "verificador de autos"): la IA puede *parecer* que resuelve cuando en realidad solo **adivina**. Antes de aprobar la idea, dos tests:
> - **Test "quítale la palabra IA":** si describes la app SIN decir "IA", ¿el usuario aún la quiere? Si el atractivo era solo "tiene IA", es gimmick. La gente compra el resultado (el agujero), no el taladro.
> - **Test de factibilidad real:** ¿la IA SOLA puede entregar el resultado prometido, o necesita **datos/integraciones que no tienes** (registros oficiales, bases privadas, APIs caras) para no quedarse en un "creo que…"? Si el valor de verdad vive en datos que el fundador no puede conseguir, la IA solo da una corazonada bonita — eso no es un painkiller, es un placebo. La IA debe **borrar trabajo real con precisión**, no producir adivinanzas con cara de certeza.

### Pilar 4 — "¿POR QUÉ AHORA?" (why now)
Una idea ganadora suele apoyarse en un cambio reciente que la hace posible o necesaria HOY. En apps de IA casi siempre es **una capacidad nueva del modelo** (visión, voz, generación de imagen/video, razonamiento) que antes no existía y ahora hace trivial algo que era imposible o carísimo. Si tu idea ya se podía hacer hace 5 años y nadie la hizo bien, pregúntate por qué — o encuentra el cambio que la destraba ahora.

### Pilar 5 — CATEGORÍA QUE MONETIZA + poder de precio
No todas las categorías pagan igual. Las que mejor monetizan y retienen (RevenueCat 2026): **Salud y Fitness** (la mayor LTV/ARPU), **Foto y Video** (la mayor tasa de éxito: ~28% llega a $1k en 2 años), **Productividad/Utilidades** y **Finanzas**. Y cobrar MÁS no baja la conversión: las apps de precio alto generan **~$62 de LTV por pagador vs ~$11** las baratas (6×) y convierten 2× mejor. Una idea que solo aguanta $3/mes es mala base — apunta a **$15-40/mes** con valor que lo justifique.

### Pilar 6 — RETENCIÓN INCORPORADA (GATE DURO, no advertencia)
Dato crítico: las apps de IA ganan **+41% de ingreso por pagador PERO retienen 30-36% PEOR** a 12 meses (RevenueCat 2026). El hype trae usuarios y los pierde rápido. Por eso la idea DEBE tener una razón estructural para volver: el problema se repite (diario/semanal), los datos se acumulan (mejora con el uso) o el resultado se vuelve un sistema. Las que ganan son **verticales y con opinión**, no un chatbot genérico para todo.
> **Este pilar es un GATE, no un asterisco** (el error #1 que se nos coló probando: presentar ideas de "un solo uso" con una nota de "ojo, esto no retiene" y seguir). Regla dura para el modelo del SO (suscripción recurrente por Hotmart):
> - Si la app es de **uso único / episódico** (sacar una visa, comprar un auto, un trámite puntual): **NO se propone como app de suscripción.** O se REFORMULA para que recurra (¿qué hace el usuario el resto del año?), o se reconoce que es un **producto de pago único** (otro modelo, fuera del default del SO). No se presenta con un "pero igual…".
> - La pregunta que decide: *"¿por qué este usuario abriría la app la semana que viene, y la siguiente?"* Si no hay una respuesta honesta y concreta, la idea NO pasa — por muy alto que sea su painkiller.

### Pilar 7 — VENTAJA DE DISTRIBUCIÓN (cómo vas a llegar barato)
La idea más brillante sin forma de llegar a su público es un hobby. Solo 17% de apps llegan a $1k MRR — y el filtro suele ser la distribución, no el producto. Ventajas válidas: PERTENECES a ese nicho (lo entiendes y tienes acceso), una audiencia de creadores que lo amplifica, o el propio **arbitraje LATAM** (un mercado/idioma desatendido ES tu canal). Si no hay forma barata y repetible de traer al usuario, reformula.

### Pilar 8 — ALCANZABLE, DEFENDIBLE Y SIN RIESGO REGULATORIO QUE TE HUNDA
Construible en ~1 semana con el SO, y con un ángulo que ChatGPT/Canva/Notion no copien de un día para otro (vertical, con opinión, con datos del nicho). Si "ChatGPT ya lo hace gratis", necesitas un ángulo 10× o un nicho específico que lo genérico no atiende bien.
> **Pesar el RIESGO REGULATORIO/LEGAL** (lo que se nos coló probando llamándolo "manejable" cuando no lo es): los dominios de **consejo médico, legal, migratorio o financiero** son terreno minado para un fundador no técnico solo — un mal output puede dañar a alguien y exponerte legalmente. No los descartes de plano, pero:
> - Solo entran si el producto se puede enmarcar honestamente como **"información/organización, NO consejo profesional"** (ej. organizar medicamentos ✅ vs. "te digo qué tomar" ❌; revisar un contrato y señalar dudas ✅ vs. "ejerzo de abogado" ❌).
> - Si el valor REAL de la idea exige cruzar esa línea (dar diagnóstico, asesoría legal vinculante), es **mala base para empezar** — sube muchísimo el riesgo y la complejidad. Preferir ideas igual de dolorosas pero de **bajo riesgo regulatorio**.

### El filtro, en una frase (con 4 GATES DUROS que descalifican aunque el resto brille)
> Una idea se propone SOLO si es un **painkiller** (Pilar 1 ≥16/20), de un **problema que millones comparten** con señal de pago en LATAM (2), resuelto por **un momento-IA que de verdad resuelve** (3), con un **por qué ahora** (4), en una **categoría que paga** (5), y una **forma de distribuirla** (7), **construible** (8).
> **Y además pasa los 4 GATES (si falla UNO, NO se propone aunque el painkiller sea 19/20):**
> 1. **GATE de retención (6):** hay razón honesta para volver semana a semana. Uso único → fuera (o es otro modelo).
> 2. **GATE de IA real (3):** la IA RESUELVE con precisión, no adivina; pasa el test "quítale la palabra IA" y el de factibilidad de datos.
> 3. **GATE regulatorio (8):** no exige dar consejo médico/legal/financiero vinculante; se enmarca como información, no asesoría.
> 4. **GATE de construibilidad (8):** cabe en lo que este SO construye en ~1 semana con un usuario NO técnico — texto→texto, foto→análisis, voz→texto, formulario→documento, registro→insight. Video, integraciones con sistemas de terceros, scraping, marketplaces de dos lados y tiempo real multi-usuario quedan FUERA.
> Si falla un pilar "blando", se REFORMULA. Si falla un GATE, se descarta o se cambia de raíz. **Nunca proponer "la primera que se te ocurra" ni una que tú mismo sabes que es floja "con una nota honesta".**

> **CALIBRACIÓN HONESTA — por qué el rigor:** solo el 4,6% de las apps de suscripción nuevas llega a
> $10.000/mes en 2 años, y entran 14.700 apps de suscripción nuevas POR MES (RevenueCat SOSA 2026).
> Los gates de este archivo existen para que estés en ese 4,6% — se le explica al usuario en simple,
> sin drama: el filtro es el regalo, no el obstáculo.

### LOS 4 PILARES DE MERCADO (Hormozi, $100M Offers) — cómo mapean a los 8 de arriba

Hormozi no evalúa la IDEA: evalúa el **mercado** al que le vas a vender. Antes de mirar el producto,
el mercado tiene que cumplir cuatro cosas a la vez. Es la misma lógica de la "multitud hambrienta" de
Gary Halbert: el mejor puesto de hamburguesas no gana por la carne, gana por el hambre de la gente.

| Pilar de mercado (Hormozi) | Pregunta que responde | Dónde vive en este archivo |
|---|---|---|
| **1. Dolor masivo** | ¿Duele MUCHO, a MUCHA gente? | Pilares 1 y 2 |
| **2. Poder adquisitivo** | ¿Esa gente PUEDE y QUIERE pagar? | Pilar 5 + señal de pago LATAM del Pilar 2 |
| **3. Fácil de alcanzar** | ¿Existe un lugar donde estén JUNTOS y se les pueda llegar barato? | Pilar 7 |
| **4. Mercado en crecimiento** | ¿Cada año hay MÁS de esta gente, no menos? | ⚠️ **No estaba cubierto — se añade abajo** |

**El cuarto pilar, que faltaba:** un mercado que se encoge castiga todo lo demás. Aunque el dolor sea
enorme y paguen bien, si cada año hay menos gente con ese problema estás remando contra la corriente:
el costo de adquisición sube solo y la competencia se vuelve una pelea por las migajas.

```
Cómo se verifica (con datos, no con intuición):
- Tendencia de búsqueda de la keyword principal EN ESPAÑOL, últimos 24-36 meses (¿sube o baja?)
- ¿La población que sufre el problema crece? (demografía, adopción de una tecnología, cambio legal)
- ¿Aparecen competidores NUEVOS? Que entre gente es buena señal: hay dinero.
  Un mercado sin ningún competidor casi nunca es una oportunidad — suele ser un mercado sin dinero.
```

> ⚠️ **El error de leer "no hay competencia" como oportunidad.** Si nadie lo resolvió, la explicación
> más probable no es que nadie se dio cuenta: es que **no paga**, o que hay una barrera que no ves
> (datos, regulación, costo). Antes de celebrar un hueco vacío, hay que responder POR QUÉ está vacío.

---

### LA DUDA SE RESUELVE ANTES DE PROPONER — NO SE LE TRASLADA AL USUARIO

> **El fallo, textual, de una prueba real:** el agente propuso una idea y cerró con
> *"el riesgo que quiero que sepas: todavía nadie ha pagado por esta idea… eso no prueba que un
> usuario LATAM pague $15/mes por esto específicamente"*.
>
> **Lo que dijo era CIERTO** — y por eso este arreglo no consiste en callarlo ni en fingir certeza.
> El problema es el ORDEN: esa duda es exactamente lo que la SEÑAL 2 (¿pagan?) existe para resolver.
> Si no se resolvió, **la idea no estaba lista para proponerse**. Y soltarla como advertencia después
> de haberla recomendado deja al usuario en el peor sitio posible: con una decisión tomada y una
> duda encima, sin herramientas para juzgarla.

**LA REGLA:**

```
Si la SEÑAL DE PAGO no se pudo verificar  →  la candidata NO se propone.
                                             Se sigue investigando (regla de profundidad).

Si SÍ se verificó  →  se propone CON LA EVIDENCIA, no con una advertencia:
                      "Hay gente pagando hoy por esto: [qué, dónde, cuánto, fuente]"
```

**Y la validación NO desaparece: cambia de sitio y de tono.** Toda idea, por bien verificada que
esté, se confirma con dinero real antes de gastar en anuncios (`02-VALIDACION.md`). Eso es un **paso
del plan**, no un aviso de que la idea podría ser mala:

```
❌ COMO DUDA (destruye la confianza del usuario en su propia decisión):
   "No sé si alguien pagará por esto. Mi recomendación: montemos una landing
    de reserva para ver si hay señal, y si no la hay, ajustamos."

✅ COMO PLAN (misma información, misma honestidad, cero incertidumbre paralizante):
   "Encontré esto pagándose hoy: [evidencia concreta con fuente].
    El plan arranca por la página de ventas — así el primer día ya está midiendo
    quién hace clic en comprar, antes de invertir un peso en anuncios."
```

La diferencia no es cosmética: en el segundo caso la validación **ya está integrada en la secuencia
maestra** (página de ventas → onboarding → paywall), que es justamente el orden que el SO manda
construir. Medir la intención de pago no es un experimento aparte que hay que "montar en paralelo":
**es lo que hace la landing desde el día uno.**

⚠️ **Lo que sí se dice siempre**, sin adornos: si un dato concreto no se encontró, se nombra ese
dato (`NO ENCONTRADO — se decide por criterio y se revisa el [fecha]`, en `FICHA-MERCADO.md`). Eso es
precisión, no duda difusa. **"No sé si esto funcionará" no es información; "no encontré cuánto cobran
los competidores en México" sí lo es** — y se puede actuar sobre ello.

---

### 🎯 LA APP MODELO (antes de los gates — el corazón del modelado profesional)

**Toda candidata que se va a PROPONER nombra UNA app modelo.** Una, no cinco: fusionar 3-5 apps en
el PRODUCTO diluye el mecanismo hasta que no queda nada que copiar con precisión (la fusión de
líderes queda para la identidad VISUAL del `16` — ahí sí se mezclan). La app modelo debe cumplir:

```
REVENUE PROBADO por ≥2 señales INDEPENDIENTES (una sola no basta):
   top grossing de su categoría · MRR verificado en TrustMRR · ads >90 días activos
   (Meta Ads Library) · listing en Acquire con TTM declarado

+ los 4 criterios de modelabilidad:
   1. Mecanismo simple y replicable (se describe en una frase y se construye con este SO)
   2. Sin foso estructural: sin efecto de red, sin datos propietarios, sin ventas enterprise
   3. Demanda creciendo (Señal 4)
   4. Grietas visibles: quejas 1-2★ repetidas, o un segmento/idioma desatendido
```

**El caso que funda la doctrina:** el mismo playbook replicado 3 veces por el mismo founder —
RizzGPT $2,4M → Umax $5M → Cal AI $8M ARR (Blake Anderson, 2024). No inventó tres ideas: modeló
un patrón probado, tres veces, cambiando un eje cada vez.

El plano completo del modelo se extrae en la **FICHA-MODELO** (plantilla: `PLANTILLA-FICHA-MODELO.md`)
y ALIMENTA todo lo posterior: la Constitución (pregunta 4b, el mecanismo), `02B` (onboarding/paywall),
`02C` (pricing), `19` (landing), `34` (adquisición) y `16` (identidad visual).

---

### 🔴 ARTEFACTO OBLIGATORIO: LA TABLA DE PUNTUACIÓN (antes de recomendar nada)

> **El fallo que este artefacto corrige** (detectado probando el SO): el agente entregó ocho
> candidatas comparadas por "tracción afuera" y "hueco en español", **sin puntuar un solo pilar ni
> emitir un veredicto de gate**, y recomendó tres — una de ellas de uso por evento, que el GATE de
> retención descalifica explícitamente, presentada "con una nota honesta" sobre su retención débil.
> Este archivo prohíbe las dos cosas desde hace versiones. La doctrina estaba bien; **faltaba el
> artefacto que obliga a aplicarla.**

**Ninguna candidata se le presenta al usuario sin esta tabla llena.** Se emite ANTES de cualquier
recomendación, con una fila por candidata:

```markdown
| Candidata | Categoría probada | Audiencia | Painkiller /20 | G1 retención | G2 IA real | G3 regulatorio | G4 construible | Alcance barato | VEREDICTO |
|---|---|---|---|---|---|---|---|---|---|
| [nombre] | [de la tabla de categorías] | [para quién exactamente] | __/20 | SÍ/NO + por qué vuelve | SÍ/NO + qué borra | SÍ/NO | SÍ/NO + de qué tipo (texto→texto, foto→análisis…) | $__ CPM y DÓNDE | PROPONER / REFORMULAR / DESCARTAR |
```

**Cómo se decide el veredicto (mecánico, sin criterio del agente):**

```
Cualquiera de los 4 GATES en NO           → DESCARTAR. No se presenta. Ni "con una nota".
G4 (construible) en NO                    → DESCARTAR aunque el negocio sea excelente:
                                             una app que el usuario no puede construir
                                             no es una oportunidad, es una frustración.
Painkiller < 16/20                        → DESCARTAR o REFORMULAR (no se presenta como está)
Sin canal de alcance barato y concreto    → REFORMULAR (Pilar 7)
Mercado decreciente (↓)                   → DESCARTAR salvo razón escrita muy fuerte
Todo lo anterior en verde                 → PROPONER
```

⚠️ **Prohibido presentar una candidata que el propio agente sabe que es floja.** Si al llenar la
tabla queda claro que no pasa, la respuesta correcta es **seguir investigando**, no entregar la mejor
de un lote malo. Entregar tres finalistas mediocres con notas honestas es peor que decir "estas
categorías no dieron; voy a buscar en otras" — porque el usuario apuesta meses de su vida en esto.

**Cuántas candidatas investigar:** amplio al buscar (8-15 categorías), estrecho al presentar. Del
lote, se presentan **solo las que salen PROPONER**. Si salen cero, se dice y se busca otra vez con
ángulos distintos. Si sale una, se presenta una.

---

### Anti-patrones (ideas que los datos dicen que PIERDEN)
```
❌ Vitamina ("estaría bueno") → ~4% de conversión, no paga.
❌ Uso único / catastrófico-pero-raro (visa, comprar auto, un trámite) → gran dolor pero pago ÚNICO, no suscripción.
❌ "Wow" de IA que en realidad ADIVINA (no tiene los datos para resolver de verdad) → placebo, no painkiller.
❌ Chatbot genérico "para todo" → sin retención ni diferenciación (la IA churna rápido).
❌ Consejo médico/legal/financiero vinculante por un fundador solo → riesgo legal que te hunde.
❌ "Existe afuera / levantó plata" tomado como prueba de que LATAM pagará → es señal de arbitraje, NO de WTP local.
❌ Categoría que no monetiza o problema sin urgencia → techo bajísimo.
❌ Sin ventaja de distribución → gran producto que nadie encuentra.
❌ Copia de un feature de ChatGPT/Canva sin ángulo vertical → te borran en una actualización.
❌ TAR PIT IDEAS (Dalton Caldwell/YC, 2024): la idea que TODOS reciben con entusiasmo, que muchos
   founders ya intentaron y que estructuralmente no funciona (apps sociales de coordinación,
   descubrir planes con amigos...). Parece agua fresca, es brea: el entusiasmo inicial atrae más
   intentos al mismo pozo. Detección OBLIGATORIA antes de proponer una candidata: buscar cuántos
   la intentaron antes y por qué murieron — entusiasmo universal + cementerio de intentos + sin
   barrera de entrada = descartar.
```

---

## CRITERIOS DE UNA BUENA IDEA (para el SO)

Además del filtro LATAM, la idea debe ser construible con este sistema:

```
✅ Problema puntual y claro (no "el próximo Salesforce")
✅ Monetizable por suscripción recurrente ($15-39/mes value-based, anclado al WTP medido en el gate de 02; no es precio de catálogo fijo)
✅ IA añade valor real (no decorativa — resume, genera, clasifica, personaliza)
✅ Construible en 1 semana (4-6 sesiones con el SO)
✅ Sin requerimientos de hardware, app stores nativas, ni regulaciones complejas
✅ El dueño puede operarla solo con el backoffice del SO (sin equipo técnico)
```

### Secuencia de Preguntas (máximo 5, mínimo 3)

Haz estas preguntas UNA POR UNA. No las lances todas juntas. Espera respuesta antes de avanzar.

**Pregunta 1 — Nicho y Audiencia**
> "¿En qué nicho o industria te mueves? (puede ser el tuyo o el de tu audiencia). Por ejemplo: fitness, educación, finanzas, marketing, gastronomía, salud mental, productividad, freelancers, e-commerce..."

**Pregunta 2 — Problema o Dolor**
> "¿Cuál es el problema más repetitivo o frustrante que tiene tu audiencia (o tú mismo)? Algo que les haga perder tiempo, dinero, o les genere estrés."

**Pregunta 3 — Frecuencia**
> "Ese problema, ¿ocurre todos los días, cada semana, o cada mes? (Esto define si la app puede retener usuarios recurrentemente)"

**Pregunta 4 — Soluciones Actuales**
> "¿Cómo lo resuelven ahora? (Excel, a mano, con otra app, no lo resuelven...)"

**Pregunta 5 — Resultado Soñado**
> "Si existiera una app que resolviera esto, ¿qué tendría que pasar para que digas 'esto es exactamente lo que necesitaba'?"

### Generación de la Propuesta

Con las respuestas, genera UNA propuesta de app (no tres, no cinco — UNA, la mejor) con este formato:

```markdown
## 🚀 Propuesta de App: [Nombre de la App]

**Qué hace:** [Una frase clara, máximo 15 palabras]

**Para quién:** [Audiencia específica]

**Problema que resuelve:** [El dolor concreto]

**Cómo lo resuelve (flujo básico):**
1. El usuario [acción de entrada]
2. La IA [procesamiento/magia]
3. El usuario recibe [resultado de valor]

**Por qué pagarían mes a mes:**
- [Razón 1: datos acumulados / personalización / contenido nuevo]
- [Razón 2: ahorro de tiempo cuantificable]
- [Razón 3: resultados que mejoran con el uso]

**Momento WOW (primeros 30 segundos):**
[Qué va a ver/sentir el usuario la primera vez que use la app que le haga decir "esto está increíble"]

**Por qué GANA (chequeo de pilares — ver "LOS PILARES DE UNA IDEA GANADORA"):**
- 💊 Painkiller: [score 1-5 de las 4 preguntas → /20; por qué duele de verdad]
- ⏰ Por qué ahora: [el cambio reciente / capacidad de IA que la destraba hoy]
- 🔁 Por qué retiene: [la razón estructural para volver — se repite / acumula datos / es un sistema]
- 💰 Categoría + precio: [categoría que monetiza + rango $15-40/mes]
- 📣 Distribución: [cómo se llega al usuario barato — nicho propio / creadores / arbitraje LATAM]

**Modelo de monetización sugerido:**
- Free: [qué incluye]
- Pro ($X/mes): [qué desbloquea]
```
> Si al rellenar este bloque algún pilar queda débil (ej. es vitamina, no retiene, o no hay cómo distribuirla), REFORMULA la idea antes de presentarla — no la presentes "como salió".

Presenta la propuesta y pregunta: **"¿Esto va por buen camino? ¿Qué le cambiarías?"**

---

## Escenario B: El Usuario YA Tiene Idea

Si el usuario llega con una idea, no la aceptes tal cual. Pásala por este filtro:

### Filtro de Viabilidad Rápida

> ⚠️ **La idea propia del usuario pasa por la MISMA tabla de puntuación que las que investiga el
> agente.** No hay dos varas. La tentación de aprobar la idea de quien te la trae —porque le ilusiona,
> porque ya la tiene decidida, porque discutirla incomoda— es exactamente cómo se construyen apps que
> nadie compra. Un "sí" cómodo hoy le cuesta meses de trabajo y el dinero de sus anuncios.
>
> **Se llena la tabla de puntuación (arriba) también para su idea, y se le enseña.** Si un GATE sale
> en NO, se dice claro, con el dato que lo respalda, y se propone el ÁNGULO que lo arregla — nunca se
> acepta "porque es la suya". Que sea suya no la hace ganadora; el mercado no sabe de quién fue la idea.
>
> **Cómo se dice sin apagar a nadie:** primero lo que SÍ funciona de su idea (siempre hay algo),
> después el gate concreto que falla con su evidencia, y después el giro que la salva. El objetivo no
> es tener razón: es que su app venda.

Evalúa mentalmente (no necesitas mostrar todo esto al usuario):

1. **¿Se puede construir con IA en una sesión de trabajo?** → Si requiere infraestructura compleja (ML personalizado, procesamiento de video en tiempo real, etc.), sugiere simplificar.
2. **¿Tiene uso recurrente?** → Si es una herramienta de "usar una vez y ya", sugiere cómo añadir recurrencia.
3. **¿El resultado es inmediato?** → Si el usuario tiene que esperar días para ver valor, es un problema.
4. **¿Se diferencia de lo que ya existe gratis?** → Si ChatGPT o una herramienta gratuita ya lo hace igual, sugiere el ángulo diferenciador.
5. **¿Pasa "LOS PILARES DE UNA IDEA GANADORA"?** → sobre todo painkiller (¿duele de verdad o es vitamina?) y retención (¿hay razón para volver o es de un solo uso?). La idea propia del usuario a menudo es una vitamina o de uso único: tu trabajo NO es solo aceptarla, es proponerle el ÁNGULO que la convierte en painkiller con retención (sin destruir su visión). Ej: "tu idea de X es útil, pero para que la gente PAGUE mes a mes le daría este giro: [ángulo painkiller + razón de retorno]".

### Si la idea pasa el filtro:
Reformúlala usando el mismo formato de propuesta del Escenario A (incluido el chequeo de pilares) y preséntala al usuario para aprobación.

### MINI-TEARDOWN COMPETITIVO (entregable escrito, ya no "mental")

Antes de proponer la app, hacer un teardown BREVE pero ESCRITO — 20-30 minutos con búsqueda web, no
un informe de consultoría. Va resumido en la propuesta y completo en ESTADO.md/App Brief (un análisis
"mental" no deja rastro, no se puede auditar y siempre se hace a medias):

**1. TRES competidores × esta tabla (buscar "[idea] app", "AI [idea] tool" y su equivalente en español):**
```
| Competidor | Precio y modelo (sub / pago único / freemium) | Top-3 quejas en reseñas 1-2★ | Onboarding (nº de pasos) | Momento del paywall | 2 ads más antiguos (Meta Ads Library) | El hueco que deja |
|---|---|---|---|---|---|---|
| [App 1]    | ej. $12/mes sub                               | 1)… 2)… 3)…                   | ej. 7 pasos              | ej. tras el resultado | [hook + desde cuándo corre]           | [qué NO resuelve] |
| [App 2]    |                                               |                               |                          |                       |                                       |                   |
| [App 3]    |                                               |                               |                          |                       |                                       |                   |
```
Las quejas 1-2★ de los líderes se buscan en app stores, Trustpilot/G2 y comentarios de redes — son
la materia prima del Pilar 2 (lo que ODIAN = tu oportunidad) y el **hueco que dejan ES tu ángulo
diferenciador**. Si Canva/Notion/ChatGPT ya lo hacen como feature, el hueco debe ser nicho o 10×.
El onboarding (número de pasos) y el momento del paywall se miran en Mobbin o recorriendo el flujo
real; los 2 ads MÁS ANTIGUOS de cada competidor (Meta Ads Library) son sus ángulos rentables — un
ad que lleva meses corriendo se paga solo. **Todo aterriza en la FICHA-MODELO si esa app resulta
elegida como modelo.**

**Regla al copiar features de un líder:** por cada feature que se copie de un líder, escribir en
una línea QUÉ trabajo del usuario resuelve y POR QUÉ existe. Si no se puede explicar el mecanismo,
no se copia — copiar features sin entender el porqué es cómo los clones pierden contra el original.

**2. DEMANDA EN ESPAÑOL — fuente OBLIGATORIA: TikTok e Instagram.** Buscar el problema/las keywords
EN ESPAÑOL en TikTok/IG: ¿hay creadores hablando del dolor? ¿videos con tracción? ¿comentarios
pidiendo una solución? Es la señal más directa de demanda + distribución LATAM (Pilar 7) — Google
Trends solo se queda corto para audiencias que viven en redes.

**3. ¿Los competidores COBRAN?** Si sí → mercado validado. Si todo es gratis → preguntarse por qué
(quizás no se puede monetizar).

**4. FECHAR todo dato de mercado.** Cada benchmark citado lleva fuente y fecha con vencimiento:
"RevenueCat 2026 — revisar en 12 meses". Un dato sin fecha es un rumor; uno de hace 3 años, una trampa.

Presentar al usuario el teardown RESUMIDO (la tabla + el hueco encontrado) como parte de la
propuesta — el detalle queda en ESTADO.md.

### Naming de la App

Al proponer el nombre, seguir estas reglas:
- Máximo 2 palabras (ideal 1)
- Fácil de escribir y pronunciar en el idioma del usuario
- Verificar que el dominio .com o .app esté disponible (o al menos .co)
- Que no tenga connotaciones negativas en otros idiomas
- Que sugiera qué hace la app sin ser genérico ("BriefAI" > "AI Tool Pro")

Si no puedes verificar dominios, propón 2-3 opciones de nombre y dile al usuario que verifique disponibilidad.

### Si la idea NO pasa el filtro:
Explica con honestidad y respeto cuál es el problema, y propón una variación que sí funcione:

> "Tu idea de [X] tiene potencial, pero hay un tema: [problema identificado]. Lo que te propongo es [variación mejorada] porque [razón]. ¿Qué te parece?"

---

## Banco de Ideas por Nicho (si el usuario está muy perdido)

Si el usuario no puede responder las preguntas o dice "no sé qué hacer", ofrécele ideas probadas por nicho:

### Productividad / Freelancers
- Generador de propuestas comerciales con IA (input: tipo de servicio + cliente → output: propuesta profesional lista)
- Dashboard de ingresos y gastos con predicciones IA

### Marketing / Creadores de Contenido
- Generador de calendarios de contenido por nicho con captions y hashtags
- Analizador de perfiles de redes sociales con recomendaciones de mejora

### Educación
- Generador de quizzes y evaluaciones a partir de cualquier texto/tema
- Tutor personalizado que se adapta al nivel del estudiante

### Fitness / Salud
- Planificador de comidas personalizadas con lista de compras automática
- Tracker de hábitos con coach IA que analiza patrones

### E-commerce / Negocios
- Generador de descripciones de productos optimizadas para SEO
- Calculadora de pricing con análisis de competencia

### Finanzas Personales
- Asesor financiero IA que analiza gastos y sugiere optimizaciones
- Simulador de inversiones con escenarios personalizados

**Regla**: No presentes el banco entero. Filtra 2-3 ideas basándote en lo poco que sabes del usuario y preséntalas como sugerencias conversacionales.

> **Importante:** este banco son SEMILLAS genéricas, no ideas ya ganadoras. Varias, tal cual, son vitaminas (ej. "tracker de hábitos" sin ángulo es nice-to-have). Antes de proponer cualquiera, pásala por "LOS PILARES DE UNA IDEA GANADORA" y AFÍLALA hasta que sea un painkiller con su momento-IA, su por qué ahora y su razón de retención. El banco es para destrabar al usuario, no para entregar la primera de la lista.

---

## Paso Intermedio: Definición Estratégica de Features

Antes de generar el App Brief, definir exactamente qué funciones tendrá la app. No inventar features — basarlas en lo que hacen las apps exitosas del mismo tipo.

### Regla: Máximo 3-5 Features Core en el MVP

El usuario tiende a pedir 15 funciones. Tu trabajo es reducirlo a las 3-5 que realmente importan.

**Framework de priorización — Preguntar para cada feature:**
1. **¿Genera valor directo?** → Si la quitas, ¿la app pierde su razón de existir?
2. **¿Se puede construir en una sesión?** → Si requiere semanas, no es MVP.
3. **¿La van a usar >50% de los usuarios?** → Si solo la usaría el 5%, sobra.

Lo que NO pasa estos 3 filtros → Lista de "Versión 2.0", no del MVP.

### EL FILTRO DE FEATURE — el criterio de "buena idea" NO termina en la ideación (con evidencia)

El mismo criterio que filtra IDEAS debe filtrar cada FEATURE que se construye. El dato que lo justifica: **el ~80% de las features de una app se usan poco o nunca, y solo el ~12% se usan seguido** (Pendo, 2019 — 180M usuarios, 35.000 apps; el Standish Group ya medía 64% en 2002). Cada feature que no se usa no es neutra: **agrega complejidad, confunde, diluye la promesa y ralentiza la app**. Construir menos, pero mejor, es lo que hacen las apps exitosas.

> **El agente debe defender el alcance, no obedecer pedidos de más features.** Cuando el usuario (o el propio impulso) quiera añadir algo durante la construcción, pasa la feature por estas 4 preguntas — y si no las pasa, se dice con respeto y se manda a "V2", no se construye:
```
1. ¿APOYA LA PROMESA CENTRAL? (la frase de la Constitución). Si no la apoya, sobra — por buena que suene.
2. ¿LA USARÁ >50%? (regla del 80/20: si solo la usa un 5%, es peso muerto que esconde lo importante).
3. TEST "QUÍTALE LA PALABRA IA": ¿el usuario aún la querría si no dijera "con IA"? Si el atractivo era
   solo "tiene IA", es gimmick. La buena IA BORRA trabajo (aparece sola, reduce pasos), no agrega pasos
   ni botones. Se vende el RESULTADO, no "que usa IA".
4. ¿AHORA O DESPUÉS? Si no es parte de la primera victoria ni del loop de retención, va a V2. Lanzar
   enfocado > lanzar inflado.
```
> **Cómo decirlo (no eres un "sí señor"):** *"Entiendo por qué quieres [X], y es buena idea para más adelante. Pero ahora mismo NO apoya la promesa central / la usaría poca gente / haría la app más confusa. Te propongo dejarla en la lista de V2 y lanzar enfocados; cuando tengamos usuarios reales, ellos nos dirán si la piden. ¿Te parece?"* Esto NO contradice el estándar de "producto enriquecido" del archivo 32: enriquecido = cada pantalla LLENA DE VALOR, no llena de FEATURES. Profundidad en lo esencial, no cantidad de funciones.

> Cuándo SÍ sumar una feature a mitad de construcción: cuando hay evidencia de que pertenece (la piden usuarios reales de la beta, la tienen TODAS las apps de referencia del sector y el usuario la espera, o es parte del loop de retención del archivo 24). Evidencia, no corazonada.

### CUIDADO: un GENERADOR + HISTORIAL NO es una app de suscripción (la trampa de "pocas utilidades")

El filtro de arriba evita el exceso de features. Pero hay un error simétrico igual de letal, detectado al probar el SO: **podar tanto que quede un "generador + historial" — una herramienta de un solo disparo que no da razones para volver ni para pagar mes a mes.** "Genera X → guárdalo en Mis creaciones" es exactamente lo que ChatGPT hace gratis. Para una SUSCRIPCIÓN, el MVP DEBE incluir tres cosas que el recorte suele mandar a "V2" por error:

```
1. AL MENOS UNA SUPERFICIE DE RETENCIÓN (el loop del 24 hecho FEATURE, no "pendiente"):
   No basta con generar + guardar. El MVP necesita el sistema que hace volver. Según el tipo:
   - Contenido/creadores → CALENDARIO de contenido (qué publicar y cuándo) + biblioteca que se
     reutiliza/remixa + (idealmente) MÉTRICAS de lo publicado. "Hoy toca tu carrusel" vive en una pantalla, no en una nota.
   - Fitness/hábitos → registro + progreso/historial visible + check-ins.
   - Productividad → el sistema/espacio que se acumula (proyectos, plantillas), no solo "generar tarea".
   REGLA: el loop de retención (24) se define como PANTALLA(S) del MVP, no como "a diseñar después".
   Si lo dejas para V2, lanzas una herramienta de un solo uso y el churn de IA (−30%, ver 02C) te mata.

2. EL ARTEFACTO debe estar COMPLETO, igual a la promesa (no una versión "de texto"):
   Si la promesa es "carrusel de Instagram listo para publicar", el output lleva DISEÑO/IMÁGENES,
   no solo texto en cajas — un carrusel sin diseño NO está "listo para publicar" y rompe el wow.
   Antes de definir features, preguntar: "¿el artefacto que entrego es USABLE tal cual para lo que
   el usuario vino a hacer, o le falta la mitad (las imágenes, el formato, la exportación real)?"
   El wow tiene que IGUALAR la promesa, no insinuarla.

3. CERRAR EL LOOP (la retención más fuerte): crear → publicar → MEDIR → mejorar.
   Las apps que retienen no solo ayudan a CREAR; ayudan a ver si FUNCIONÓ y a mejorar. Para un
   creador: "tu carrusel del martes tuvo 2× alcance — repite ese formato". Eso da una razón
   mensual brutal para volver. ⚠️ FACTIBILIDAD (pilar 3): publicar/medir vía APIs oficiales
   (Instagram/Meta, LinkedIn) tiene fricción real (revisión de app, permisos) y puede ser inviable
   al inicio para un fundador solo. Caminos realistas: empezar con métricas que el usuario PEGA o
   sube (captura), o un sub-set de integración liviano; medir-el-resultado entra al roadmap como
   palanca de retención #1, evaluando la viabilidad técnica honestamente, no prometiéndola a la ligera.
```
> **Reconciliación con el filtro de features:** estas tres NO son "más features por gusto" — son lo que convierte un generador en un producto de suscripción. La disciplina de features corta lo que no apoya la promesa NI la retención; la superficie de retención SÍ las apoya, así que está PROTEGIDA del recorte. Cortar el calendario/métricas de un app de contenido para "lanzar enfocado" es cortar justo la razón de pagar.

### Cómo Sugerir Features (la IA propone, el usuario elige)

Si el usuario no sabe qué features incluir, la IA sugiere basándose en patrones probados según el tipo de app:

**Para apps de GENERACIÓN con IA (generador de textos, propuestas, contenido):**
1. Campo de input + generación (el core) — con el ARTEFACTO COMPLETO (si es visual, CON imágenes/diseño, no solo texto)
2. **SUPERFICIE DE RETENCIÓN — obligatoria en el MVP, no opcional** (el loop del 24 hecho pantalla):
   calendario/planificador, biblioteca que se reutiliza-remixa, o panel de resultados/métricas. SIN esto
   es "generador + historial" = herramienta de un solo uso que no retiene (la trampa de arriba).
3. Historial/biblioteca de resultados (que se reusa, no solo se archiva)
4. Personalización persistente (la "marca"/tono que la app APRENDE y reaplica — inversión que sube el costo de irse)
5. Copiar / exportar el resultado USABLE tal cual
6. Opcional: plantillas por caso de uso · cerrar el loop (medir resultados, con la nota de factibilidad de arriba)

**Para apps de ANÁLISIS con IA (analizador, evaluador, auditor):**
1. Input de datos (texto, URL, archivo)
2. Dashboard de resultados con métricas claras
3. Recomendaciones accionables
4. Historial de análisis anteriores
5. Opcional: Comparativa entre análisis

**Para apps de TRACKING/HÁBITOS:**
1. Registro diario de la actividad
2. Vista de progreso (gráfico/calendario)
3. Rachas y hitos
4. Insights IA sobre patrones
5. Opcional: Recordatorios/notificaciones

**Para apps de PLANIFICACIÓN con IA (calendarios, meal planners, etc.):**
1. Input de preferencias/restricciones
2. Plan generado por IA
3. Vista de calendario/timeline
4. Edición manual del plan
5. Opcional: Lista de compras/acciones derivadas

**Para apps de EDUCACIÓN:**
1. Lección/contenido adaptativo
2. Evaluación (quiz, ejercicio)
3. Progreso y nivel actual
4. Repaso de errores
5. Opcional: Gamificación (puntos, rachas)

### Formato de Presentación al Usuario

```markdown
## Features del MVP — [Nombre de la App]

### Core (imprescindibles):
1. [Feature]: [qué hace en 1 línea] — [por qué es necesaria]
2. [Feature]: [qué hace] — [por qué]
3. [Feature]: [qué hace] — [por qué]

### Importantes (recomendadas para retención):
4. [Feature]: [qué hace] — [por qué]
5. [Feature]: [qué hace] — [por qué]

### Versión 2.0 (después de validar el MVP):
- [Feature futura 1]
- [Feature futura 2]
- [Feature futura 3]

Total features MVP: [3-5]
```

Presentar y preguntar: **"¿Agregarías o quitarías algo?"**

Si el usuario quiere agregar más de 5, explicar:
> "Entiendo que quieres incluir [X], y es buena idea, pero para el MVP necesitamos lanzar rápido con lo esencial. Te propongo ponerlo en la lista de V2 y agregarlo cuando ya tengamos usuarios reales que nos confirmen que lo necesitan. ¿Te parece?"

---

## Entregable de Fase 0: App Brief

Cuando el usuario apruebe la idea, genera el App Brief final:

```markdown
# APP BRIEF — [Nombre de la App]

## Resumen Ejecutivo
[2-3 líneas describiendo qué hace la app y para quién]

## Problema
[El dolor específico que resuelve]

## Solución
[Cómo lo resuelve, paso a paso simple]

## Usuario Objetivo
- Perfil: [quién es]
- Frecuencia de uso esperada: [diario/semanal]
- Contexto de uso: [en el trabajo, en su celular, etc.]

## Propuesta de Valor Única
[¿Por qué ESTA app y no cualquier otra solución?]

## Features del MVP (máximo 5)
1. [Feature core]: [qué hace]
2. [Feature]: [qué hace]
3. [Feature]: [qué hace]
4. [Feature]: [qué hace] (si aplica)
5. [Feature]: [qué hace] (si aplica)

## Personalidad de la App
3 adjetivos: [___], [___], [___]
Si fuera una persona: [descripción breve]
Tono de voz: [formal/casual, entusiasta/sereno, técnico/simple]

## Modelo de Monetización
- Tier Gratuito: [límites]
- Tier Pro: [precio + beneficios]

## Métricas de Éxito
- Activación: [qué cuenta como "usuario activado"]
- Retención: [qué hace que vuelvan]
- Conversión: [qué los hace pagar]

## Momento WOW
[La primera experiencia que engancha al usuario]

## Complejidad Técnica Estimada
- Nivel: [Bajo / Medio / Alto]
  - Bajo: Solo frontend + API de IA. Se puede construir en 1-2 sesiones.
  - Medio: Necesita auth + base de datos. 2-4 sesiones.
  - Alto: Necesita integraciones externas, pagos, o lógica compleja. 4-8 sesiones.
- Backend necesario: [Sí/No — si sí, qué necesita: auth, DB, storage, pagos]
- APIs externas: [Lista de APIs que se usarán]
- Deploy recomendado: [Artifact / Vercel simple / Vercel + Supabase]
```

### Criterios de Salida de Fase 0
- [ ] El usuario aprobó la idea
- [ ] El App Brief está completo
- [ ] El modelo de monetización está definido
- [ ] El momento WOW está claro

→ **Siguiente: Cargar `02-VALIDACION.md`**
