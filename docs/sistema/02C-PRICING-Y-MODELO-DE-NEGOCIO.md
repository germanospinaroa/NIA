# PRICING Y MODELO DE NEGOCIO — Dónde, Cuándo y Cuánto Cobrar

> **Cuándo cargar este archivo:**
> - En la fase de validación (junto con `02-VALIDACION.md`) al decidir el modelo de negocio
> - SIEMPRE antes de diseñar el onboarding o el paywall: la decisión de modelo/precio se toma ANTES de diseñar ese funnel (`02B-ONBOARDING-Y-PAYWALL.md`)
> - Al definir planes, precios, créditos, trial o la sección de oferta de la landing
>
> **Por qué existe:** la pregunta más importante de cualquier app de suscripción es dónde y cuándo cobrar. La respuesta tiene datos reales en 2026 y no es intuitiva. Este archivo recoge lo que hacen Duolingo, Cal AI ($35M → adquirida por MyFitnessPal), Noom, Revolut y las apps top — y traduce esos patrones al contexto de una web app vendida por Hotmart: el orden de diseño, los 3 modelos validados, la estrategia de pricing (anclaje, señuelo, créditos, trial por nicho), la matriz A-F por tipo de app, el puente de checkout y las métricas del funnel.
>
> **Con qué se combina:**
> - `02B-ONBOARDING-Y-PAYWALL.md` — el FUNNEL que ejecuta este modelo (los 5 trabajos del onboarding, la anatomía del paywall, la capa de persuasión)
> - `19-PAGINA-DE-VENTAS.md` + `55-DISENO-DE-LANDING.md` (§6) — la sección de OFERTA de la landing (donde vive el pricing de 3 columnas)
> - `40-UNIT-ECONOMICS.md` — validar el NÚMERO (COGS, margen, "regla de 30", LTV con churn realista)
> - `18-VENTA-HOTMART.md` — la configuración del cobro real (producto, trial, webhook)

---

## ⚠️ ANTES DE USAR CUALQUIER NÚMERO DE ESTE ARCHIVO

Los precios, porcentajes de conversión y duraciones que aparecen a continuación vienen de estudios
concretos, de **categorías y países concretos**, y con **fecha**. Son ejemplos de cómo se ve un dato
bien citado — **no son valores por defecto para tu app**.

```
Precio, duración de prueba, garantía y modelo de cobro NO se copian de aquí:
se toman de FICHA-MERCADO.md, que se llena investigando TU nicho y TU país.
(plantilla: PLANTILLA-FICHA-MERCADO.md)
```

Un mismo modelo de negocio se comporta distinto en categorías distintas y en países distintos: cambia
lo que la gente está acostumbrada a pagar, cuánto tarda en decidir y **con qué puede pagar**. Un
número traído de otra categoría se ve razonable y está mal.

**Cómo se usa este archivo:** para entender los MECANISMOS (por qué el señuelo funciona, por qué el
ancla importa, cómo se estructura un trial). Los NÚMEROS los pones tú, con fuente y fecha.

**El punto de partida del pricing es el del MODELO (FICHA-MODELO §4): su precio, trial y arquitectura son la baseline; se ajusta con FICHA-MERCADO y los benchmarks de este archivo.**

---


## EL ORDEN DE DISEÑO — el error #1 es diseñar el precio antes que la experiencia

El error más común al monetizar es empezar por el final: elegir el paywall o el precio ANTES de saber qué hábito tiene el usuario. El paywall y el pricing "correctos" no existen en abstracto — existen **para un tipo de app, una frecuencia de uso y un valor percibido concretos**. El paywall de Duolingo no sirve para una app de IA creativa, y el de Cal AI no sirve para una app de finanzas.

> **Regla de construccion:** despues de definir esta estrategia, el agente debe construir o maquetar
> onboarding y paywall ANTES de la app interna. Si el primer codigo de producto es un dashboard,
> se salto la monetizacion real. Ver `SECUENCIA-MAESTRA-CONSTRUCCION.md`.

Por eso el SO impone un ORDEN. No se diseña el siguiente eslabón sin haber fijado el anterior:

```
1. TIPO DE APP        → ¿bienestar, educación, fitness, IA creativa, productividad o finanzas? (matriz A-F)
2. PROMESA            → la transformación en una frase (Constitución del Producto, 01)
3. FRECUENCIA DE USO  → ¿diaria, semanal, puntual? Decide si necesitas HÁBITO (freemium/gamificación, 24)
                        o RESULTADO inmediato (hard paywall / preview→paywall)
4. PRIMERA VICTORIA   → el "momento aha" que el usuario debe vivir ANTES de que le pidas pagar (01, 32)
5. PAYWALL            → su forma y su momento se DERIVAN de lo anterior (el momento/modelo aquí;
                        su diseño y narrativa en 02B-ONBOARDING-Y-PAYWALL.md)
6. PRICING            → value-based, anclado al WTP medido (02) y al margen (40), no al costo de IA
7. RETENCIÓN          → el loop que sostiene la suscripción mes a mes (24, 35)
```

> **La pregunta que ordena todo (responder en la Sesión 1, guardar en ESTADO.md):**
> *¿Esta app resuelve algo DIARIO, SEMANAL o PUNTUAL? ¿El usuario necesita un HÁBITO o un RESULTADO inmediato? ¿El valor está en crear, aprender, ahorrar tiempo, verse/sentirse mejor o ganar dinero?*
> La respuesta decide el modelo de monetización (freemium para hábito vs hard paywall / preview→paywall para resultado), la longitud del onboarding y el loop de retención. Optimizar adquisición (más tráfico/ads) ANTES de tener activación es pagar por perder usuarios.

**Por qué importa, dicho sin rodeos:** el usuario no paga por "una app con IA". Paga cuando la app le demuestra rápido tres cosas — *esto me entiende, esto me ahorra tiempo, esto me da el resultado que quiero*. Primero se diseña esa demostración (la primera victoria); el paywall es solo su consecuencia natural.

---

## LA RESPUESTA A LA PREGUNTA CLAVE

### ¿Cobrar en la landing page o hacer onboarding primero?

La respuesta depende del contexto, pero el dato es claro:

Las apps que combinan un onboarding estructurado con un paywall de prueba gratuita alcanzan 1.78% de conversión install-to-paid — la configuración de mayor rendimiento en todas las categorías de apps de suscripción según el State of In-App Subscriptions 2026.

Los paywalls "duros" (cobro inmediato) convierten 5x mejor que el freemium: 10.7% vs 2.1% al día 35. Pero la ventaja desaparece a largo plazo: la retención al año es prácticamente idéntica (28% freemium vs 27% hard paywall).

> **Actualización con datos mas recientes (RevenueCat, State of Subscription Apps 2025):** hard
> paywall vs freemium/soft — 12.1% vs 2.2% de conversion mediana descarga-a-pago, y hasta ~8x mas
> ingreso a 14 dias — consistente con el patron de arriba (la cifra exacta varia por metodologia y
> ano del reporte; la CONCLUSION no cambia: paywall duro convierte mas rapido, onboarding+paywall
> gana en LTV y retencion). Dato adicional: ~50% de los trials empiezan durante el onboarding, y la
> conversion del Dia 0 suele superar 80% — llegar rapido al "aha" y recien ahi mostrar el paywall.

**La conclusión real:** ni pagar de entrada ni freemium puro. **El modelo ganador es:**

```
Usuario llega → Onboarding personalizado (micro-compromisos) →
Resultado/plan generado PARA ÉL → Paywall → Pago
```

El paywall no aparece al inicio ni al final — aparece en el momento de máxima inversión emocional del usuario.

---

## LOS 3 MODELOS VALIDADOS (con datos 2026)

> ⚠️ **Esta decisión la toma la IA, no el usuario** (CLAUDE.md → DECIDE-INFORMA-AVANZA): la matriz
> A-F + el tie-breaker determinan el modelo con data validada. Preguntarle al usuario "¿hard
> paywall u onboarding-first?" es trasladarle una decisión técnica que no puede tomar. Se decide,
> se anota en ESTADO.md con la evidencia ("Modelo 2A porque nicho F + freemium"), se informa en
> 1 línea simple y se avanza.

### Modelo 1 — Hard Paywall inmediato (landing → pago → app)
```
CUÁNDO USARLO: apps B2B, herramientas de productividad, nicho técnico
VENTAJA: cash inmediato, datos de conversión rápidos, sin "turistas"
DESVENTAJA: elimina usuarios que necesitaban ver el valor antes de pagar
CONVERSIÓN: 10.7% de los que llegan al paywall (vs 2.1% freemium)
```
*Este es el modelo de Hotmart por defecto: la landing vende, el usuario paga, luego accede.*

### Modelo 2 — Onboarding + Paywall de prueba (el más poderoso para consumidores)
```
CUÁNDO USARLO: apps B2C, wellness, productividad personal, fitness, finanzas
VENTAJA: conversión brutal cuando el onboarding construye compromiso real
DESVENTAJA: más complejo de implementar, requiere un onboarding excepcional
CONVERSIÓN: hasta +234% vs un paywall sin onboarding previo (caso AppAgent, experimentos de
  timing de paywall — un caso, no una ley del sector)
DATO CLAVE: 82-90% (RevenueCat 2025 / Adapty 2026) de los que inician una prueba lo hacen en el
  día 0, y 44.5% de las COMPRAS también ocurren el Día 0 (Adapty 2026) —
  si no los enganchas en la primera sesión, ya los perdiste
```
*Este es el modelo de Duolingo, Cal AI, Noom, Calm, Headspace.*

### Modelo 3 — Freemium → Upgrade (el modelo más común, pero el menos eficiente)
```
CUÁNDO USARLO: apps de colaboración donde el viral loop depende del crecimiento
VENTAJA: base de usuarios grande, crece por boca a boca
DESVENTAJA: la mayoría nunca paga (2.1% conversión), soporte costoso
CONVERSIÓN: 2.1% (la peor de las tres opciones en revenue por install)
```
*Este es el modelo de Notion, Slack, Figma.*

> **SOFT vs HARD — el trade-off explícito:** Soft paywall: +50% de conversión paywall→pago
> (4.85% vs 3.34%) pero el hard da ~2x el LTV mediana ($41.90 vs $20.00) — son dos palancas
> distintas: decide por LTV objetivo, no solo por conversión. Y el timing manda: 2.1x más
> inicios de trial cuando el paywall aparece tras un momento de valor medible que como hard
> inmediato (65% vs 31% — Adapty 2026).

---

## EL MODELO RECOMENDADO PARA ESTE SO

Para web apps vendidas por Hotmart en LATAM, el modelo óptimo combina lo mejor de los tres:

```
PASO 1 — LANDING: vender el RESULTADO (no la app). CTA → "Empieza tu prueba gratis"
  (o "Accede ahora" si es hard paywall). Ver 19-PAGINA-DE-VENTAS.md.

PASO 2 — ONBOARDING (DENTRO DE LA APP, antes del pago si el modelo permite preview):
  El onboarding no es un tour — es la construcción de SU resultado personalizado.
  Puede correr sin cuenta usando estado local si el objetivo es mostrar valor primero,
  o con registro gratis si el progreso debe persistir antes de pagar.

PASO 3 — PAYWALL (si hay free tier) o ACTIVACIÓN (si ya pagó):
  Si pagó: el onboarding lleva directo a su primera victoria (momento aha).
  Si hay free tier: el paywall aparece después del onboarding, cuando ya
  invirtió tiempo y vio el resultado.

PASO 4 — PRIMER VALOR INMEDIATO:
  Dentro de los primeros 60 segundos, el usuario debe sentir que la app
  ya le está ayudando. Sin esto, la retención colapsa.
```

**Decisión estratégica inicial que el agente debe hacer con el usuario:**
> "¿Tu app tiene una propuesta de valor que se puede demostrar ANTES de pagar (y tiene sentido ofrecer un free tier), o el valor está claro desde la landing y conviene cobrar directo?"

> **Implicación técnica (no la pases por alto):** onboarding-first NO significa siempre "registro primero".
> Hay dos variantes:
> - **Preview anonimo -> paywall -> login/auth**: default para este SO cuando se quiere demostrar valor
>   antes de pedir cuenta. Guardas temporalmente en navegador y pides login para conservar/desbloquear.
> - **Registro gratis -> onboarding -> paywall**: usar solo si el progreso debe persistir antes del pago
>   o si la app necesita cuenta para entregar el primer valor.
>
> Si eliges la variante con registro gratis, la compra de Hotmart debe **SUBIR** esa cuenta a Pro
> (no crear una nueva). Ese bug típico —el email del registro no coincide con el de compra— está
> documentado en `18-VENTA-HOTMART.md` → "Los dos modelos de creación de usuario".

---

## LOS 3 SUELOS DEL PRECIO (la regla de decisión del precio inicial)

> **El hueco que corrige:** el precio se decidía con mercado + margen, pero sin fórmula cerrada
> para los límites de plan y sin mirar el canal de adquisición. Resultado posible: un plan de
> $5-7/mes con cupos generosos que pasa los gates… y muere el día que se enciende la publicidad.

El precio inicial se propone como **el MAYOR de los dos primeros suelos** (dentro del techo del
rango de mercado); el tercero se chequea cuando el canal pago entra en juego:

```
SUELO 1 — DE COSTO (¿gano dinero con cada usuario?):
  · El GATE DE VIABILIDAD UNITARIA del 40 pasa en ambos escenarios (directo y afiliado):
    margen bruto ≥70% sobre el ingreso NETO, IA ≤20% del precio de catálogo.
  · FÓRMULA DEL CUPO POR PLAN (cerrada, no a ojo):
      cupo_máximo del plan = (precio del plan × 0.20) / costo por resultado (30)
    redondeado HACIA ABAJO a un número de resultados que suene natural (30, 50, 100…).
    Ej.: plan $15/mes, imagen a ~$0.04 → (15 × 0.20)/0.04 = 75 → cupo 60-70 imágenes/mes.
    El cupo protege el margen en el PEOR caso (el usuario que agota el plan), no el promedio.
  · Si ningún precio del rango de mercado aguanta un cupo mínimo útil → bajar el COGS con las
    palancas del 30 ANTES de subir el precio fuera de mercado.

SUELO 2 — DE MERCADO (¿es lo que este mercado paga?):
  · FICHA-MERCADO §1: mediana del nicho + rango de los líderes, con fuente y fecha.
  · El precio vive dentro del rango; desvío >±30% de la mediana exige razón escrita (ficha).

SUELO 3 — DE CANAL (¿el precio puede pagar la publicidad?) — SE CHEQUEA DESPUÉS, no al fijar:
  · Se activa en el CHEQUEO DE PRECIO PARA ADS del 34 (antes de la PRIMERA campaña pagada).
  · Regla: CAC máximo tolerable (LTV/3, con el churn realista del 40) ≥ CPA esperado del canal.
    Verdad incómoda del contexto SO: un plan de $5-7/mes B2C LATAM con checkout web casi
    nunca paga una compra en Meta — ese precio es de canal orgánico/afiliados, no de paid.
  · Si no pasa: subir el precio · empujar anual-first (la caja del año adelantado financia el
    CAC) · o posponer el paid y crecer con afiliados/orgánico (34, Etapa 0). No es un fracaso:
    es la secuencia correcta.
```

### LA CONVERSACIÓN EN DOS MOMENTOS (cómo se le comunica al dueño — sin jerga a destiempo)

El dueño no sabe qué es una API ni un CAC — y no tiene por qué saberlo al arrancar. La regla:

```
MOMENTO 1 — al proponer el precio (Sesión 1, decide-informa-avanza):
  Los suelos 1 y 2 se calculan POR DENTRO y se documentan (40 + FICHA-MERCADO + ESTADO.md).
  Al dueño, 2 líneas en simple + la SEMILLA del momento 2:
    "💰 Decidí $X/mes (anual $Y) porque es lo que paga tu tipo de cliente y te deja
     ganancia desde el primer usuario. Está pensado para lanzar; cuando quieras invertir
     en publicidad, lo revisamos juntos — y si prefieres otro precio, dímelo."
  PROHIBIDO en este momento: Meta, CAC, API, tokens, márgenes — jerga que no cambia su decisión.

MOMENTO 2 — cuando pide publicidad (o al llegar a la Etapa 1 del 34):
  Se corre el SUELO 3 y, si el precio no aguanta el canal, la pregunta va en formato 1E:
    "📣 Tus precios están bien para lanzar. Para invertir en publicidad hay que ajustar,
     porque cada cliente nuevo cuesta dinero en anuncios. Dime qué prefieres:
     1️⃣ **Subir el precio a $X** — cada cliente paga lo que cuesta conseguirlo y sobra ganancia.
     2️⃣ **Empujar el plan anual** — el pago del año por adelantado financia los anuncios.
     3️⃣ **Seguir sin publicidad por ahora** — crecemos con afiliados y contenido, que no
        cuestan por adelantado.
     Responde 1, 2 o 3."
  El resultado va a ESTADO.md y, si cambia el precio, sigue el protocolo de /precios.
```

---

## LA ESTRATEGIA DE PRICING EN EL PAYWALL

El pricing anual presentado junto al mensual hace que el plan anual se sienta como una ganga. Los precios que terminan en .99 pueden subir la conversión 3-7% (práctica común sin dato sólido — testear), especialmente en LATAM y Asia.

```
ESTRUCTURA DE PRICING RECOMENDADA (regla de oro: el ANUAL siempre se muestra como precio MENSUAL):
- Plan mensual: $X/mes (el ancla — el "caro").
- Plan anual: mostrarlo como "$Y/mes" en el display grande, con el TOTAL anual siempre visible en label ("Se cobra $X/año" — transparencia obligatoria, 50/52).
  → Así el anual se ve MÁS BARATO que el mensual de un vistazo — esa comparación es la que vende.
  → El total anual va solo en letra chica (transparencia/cumplimiento): "$Y/mes · se cobra $Z/año".
  → Pre-seleccionado por defecto + badge "Más popular / Mejor valor" → +15-20% eligen anual (Mojo).
  → Mostrar el ahorro como "2 MESES GRATIS" (≈17%) — convierte mejor que un "%". Descuento óptimo 15-20%.

DATO LATAM (CLAVE para Hotmart): mostrar el anual como mensual dio +60% de ARPU y, EN BRASIL,
  +45% de ingreso por impresión de paywall (Mojo/RevenueCat) — "particularmente efectivo en mercados
  de menor ingreso". Es de las palancas más rentables para una app vendida por Hotmart en LATAM.

PARA LATAM:
- Precios en número redondo o .99 (ej: $19.99 en vez de $20)
- Descomponer el precio por día/semana ("menos de $1 al día") reduce el sticker shock
- La garantía de devolución es más importante aquí que en mercados anglosajones
```

> **Garantía CUANTIFICADA:** garantía visible junto al CTA: +8-18% en inicios de trial y +5-12%
> en conversión a pago (RocketShip HQ 2026); presupuesta el costo: un test documentado dio +21%
> de ventas con 12% de refunds. Benchmark real de refunds: 2-5% de los pagadores (Educación 4.86%
> y Health&Fitness 4.71% las peores; hard paywall 5.8% vs freemium 3.4% — RevenueCat 2025).

Las apps de precio alto convierten 2x mejor que las de precio bajo: mediana de 2.8% vs 1.4%. Cobrar más no reduce necesariamente la conversión — puede aumentarla si comunica más valor. Y 9 de cada 10 suscripciones se venden a PRECIO COMPLETO (los descuentos son solo 6.9% — Adapty 2026) y las apps caras generan 3x el LTV de las baratas: no descuentes por miedo.

### Modelo de CRÉDITOS / uso (clave en apps de IA con costo variable alto)

Cuando cada acción cuesta dinero real (imagen, audio, video, generaciones largas), la suscripción "plana ilimitada" puede destruir el margen — un usuario intensivo se come la ganancia de diez. Ahí el modelo correcto es **suscripción + cuota de créditos por plan**, con compra de créditos extra. Esto NO sustituye al fair-use interno de `30` (control de costo en el servidor) — es su cara visible: convierte el límite en un eje de pricing en vez de en un freno invisible.

```
CUÁNDO USAR CRÉDITOS:
- La app usa IA cara por acción (imagen/audio/video, o texto muy largo).
- Hay usuarios intensivos que justifican un tier superior.
- Quieres evitar abuso sin poner un "ilimitado" que mienta.

ESTRUCTURA TIPO (ajustar números al COGS real de 30/40):
- Starter:  ~30 generaciones/mes   → para probar y enganchar.
- Pro:      ~150 generaciones/mes  → el plan recomendado (cubre al usuario frecuente).
- Max:      ~500 generaciones/mes + prioridad/cola rápida → para el usuario intensivo.
- Créditos extra: "compra 100 generaciones adicionales" (ingreso incremental sin cambiar de plan).
```

> **REGLA DE ORO — vende RESULTADOS, no la unidad técnica.** El usuario promedio no compra "tokens" ni "500.000 tokens"; compra resultados. Empaqueta y nombra la cuota en la unidad que el usuario entiende:
> - ❌ "Incluye 500.000 tokens" · "2.000 créditos de cómputo"
> - ✅ "Incluye 100 guiones al mes" · "30 videos generados" · "50 análisis de contenido"
>
> Internamente puedes medir en tokens/créditos de proveedor (ElevenLabs, etc. — ver `30`), pero la UI y el paywall hablan en resultados. Mostrar también el contador como resultado ("Te quedan 42 guiones este mes"), nunca como saldo técnico. La economía de cada tier de créditos se valida contra el COGS y la "regla de 30" (IA < 20% del precio) en `40-UNIT-ECONOMICS.md`.

> **Free tier en apps de IA cara:** no regales generaciones ilimitadas. El patrón que protege margen Y crea deseo: **1 resultado o preview gratis** → paywall para completar/exportar/generar más. Ver el nicho "IA creativa" abajo.

#### CÓMO SE RENUEVAN LOS CRÉDITOS (sin esto, la cuota es de un solo mes)

```
PLAN PAGO → los créditos se renuevan con CADA evento de cobro aprobado del webhook (18):
  el PURCHASE_APPROVED de la recurrencia resetea la cuota al cupo del plan
  (set credits = cupo_del_plan, NO credits + cupo — los no usados no se acumulan,
  salvo que el plan lo prometa). Los créditos EXTRA comprados aparte sí se SUMAN.

PLAN FREE → no hay webhook que dispare nada: columna `period_start` en `user_quota`
  y RESET PEREZOSO al primer uso del nuevo período (sin cron):
  dentro de la MISMA RPC atómica de 25 (create_generation), ANTES de descontar:
    if now() - period_start > interval '30 days'
      → credits = cupo_free, period_start = now()
  Un free que no vuelve nunca dispara nada — exactamente lo correcto.

LA UI lee de ahí: "Te quedan X [resultados] este mes" = user_quota.credits, y la fecha
  de renovación = period_start + 30 días (free) o la fecha del próximo cobro (pago).
```

### EL EFECTO SEÑUELO en 3 planes (cuando hay 3 tiers, el del medio se DISEÑA para hacer obvio el recomendado)

El anti-patrón "varios planes con diferencias confusas" (ver la anatomía del paywall en `02B-ONBOARDING-Y-PAYWALL.md`) NO prohíbe 3 planes — prohíbe 3 planes *incomparables*. El señuelo (decoy effect, Ariely: el caso The Economist) es lo contrario de la confusión: **una sola dimensión de comparación, tan clara que la decisión se toma en 3 segundos**. El plan del medio existe para que el recomendado se vea como ganga evidente. (Evidencia de laboratorio fuerte — Ariely/MIT: 84%→32% al quitar el señuelo — PERO falla con productos reales: 11 de 91 réplicas funcionaron (Yang & Lynn 2014; Frederick, Lee & Baskin 2014 — desaparece con estímulos realistas). Lo que las apps top usan de verdad: default marcado + badge + jerarquía visual (Adapty: configuraciones óptimas logran 69-74% de selección anual). El señuelo se TESTEA, jamás se asume.)

```
RECETA DEL SEÑUELO (dimensionarlo, no improvisarlo):
1. UNA dimensión comparable entre los 3 planes (generaciones/mes, guiones, análisis) — la unidad
   de RESULTADO del plan de créditos de arriba. Si los planes difieren en 4 dimensiones a la vez,
   no hay señuelo: hay confusión (el anti-patrón).
2. PRECIO del señuelo: 80-90% del precio del plan recomendado (incómodamente cerca).
3. VALOR del señuelo: ≤40-50% del valor del recomendado en esa dimensión.
   → Resultado: "por $5 más, el triple" — el recomendado se vuelve la única opción racional.
4. El señuelo NUNCA lleva badge ni pre-selección (eso es del recomendado) y es un plan REAL
   y comprable (un plan ficticio solo-para-anclar es dark pattern — ver 50 → C5).

EJEMPLO NUMÉRICO (app de IA creativa, unidad = guiones/mes):
  Starter   $9.99/mes  →  30 guiones                      (entrada honesta, para probar)
  Pro       $24.99/mes → 100 guiones                      ← SEÑUELO (90% del precio, 1/3 del valor)
  Max       $27.99/mes → 300 guiones + cola prioritaria   ← RECOMENDADO (badge + pre-seleccionado)
  Lectura del usuario en 3 segundos: "Pro casi cuesta lo mismo que Max y da 3× menos" → Max obvio.

DÓNDE VIVE: en el pricing de la LANDING con 3 columnas (layout exacto en 55-DISENO-DE-LANDING.md).
En el PAYWALL in-app a 375px se mantienen 2-3 cards máximo (50 → C1): si son 3, la del medio es
el señuelo; si el nicho no da para 3 tiers, quedarse con mensual-ancla vs anual-recomendado
(el anclaje simple de arriba) — nunca inventar un tercer plan sin caso de uso real.
```

### Lifetime deals — usar con pinzas

Un pago único "de por vida" puede servir para **validación temprana** (caja rápida, primeros testimonios), pero destruye el ingreso recurrente si das demasiado acceso para siempre: el costo de servir (IA, infra) sigue corriendo mes a mes contra un ingreso que ya cobraste una vez. Si se usa: limitarlo en el tiempo o en cupo, y nunca como modelo principal de una app con COGS de IA continuo. La suscripción recurrente es el modelo por defecto del SO (ver `40`).

---

## ESTRATEGIA SEGÚN EL TIPO DE APP (decidir antes de diseñar)

El tipo de app es el factor que MÁS mueve la conversión. No hay un onboarding ni un paywall "mejor" en abstracto — hay uno correcto para cada hábito y valor percibido. Abajo, los 7 nichos con su estrategia completa (primera victoria → onboarding → paywall → monetización → retención). Elegir el del proyecto y fijar todo ANTES de diseñar.

### A) EDUCACIÓN / APRENDIZAJE (idiomas, cursos, skills) — referencia: Duolingo
```
OBJETIVO:        crear HÁBITO y progreso visible (el valor se acumula con el uso diario).
PRIMERA VICTORIA: completar la primera lección/ejercicio real (no leer una explicación).
ONBOARDING:      ~7 preguntas rápidas (meta + nivel) + un ejercicio real ANTES de pedir registro.
PAYWALL:         después de la primera victoria. "Ya completaste tu primera práctica. Continúa sin
                 límites, con ejercicios personalizados y seguimiento avanzado."
MONETIZACIÓN:    FREEMIUM útil + premium (quitar fricción, acelerar progreso, desbloquear funciones).
                 Freemium tiene sentido aquí porque necesitas volumen y hábito, y el uso mejora el producto.
RETENCIÓN:       rachas, niveles, metas diarias, recordatorios (loop "Educación/idiomas" de 24).
NO HACER:        cobrar antes de que entienda CÓMO aprende · clases largas al inicio · esconder
                 demasiado tras el pago si necesitas hábito · rankings que distraigan del aprendizaje.
```

### B) BIENESTAR / MEDITACIÓN / SALUD MENTAL — referencias: Headspace, Calm
```
OBJETIVO:        confianza, calma y continuidad (relación de largo plazo, sin presión).
PRIMERA VICTORIA: una primera sesión corta (respirar, dormir, enfocarse) que el usuario SIENTE.
ONBOARDING:      suave y emocional. Preguntar el objetivo emocional (dormir mejor, reducir estrés,
                 enfocarse) con lenguaje tranquilo. Empezar con 4-8 pasos de alto rendimiento que
                 terminan en un resultado util; extender solo con evidencia por paso.
PAYWALL:         tras la mini-experiencia. "Tu plan de calma está listo. Empieza con sesiones guiadas
                 para dormir mejor y reducir estrés." Vender continuidad, no urgencia agresiva.
MONETIZACIÓN:    TRIAL gratis (duración por TIEMPO-A-VALOR — ver la nota de trial; patrón
                 Headspace: 14 días anual / 7 mensual) + anual destacado. Onboarding LARGO.
RETENCIÓN:       rutina emocional diaria (dormir, meditar, respirar) — el loop, no la presión.
NO HACER:        copy agresivo "última oportunidad" · saturar de descuentos · hacer sentir culpa ·
                 prometer resultados exagerados.
```

### C) FITNESS / NUTRICIÓN / TRACKING — referencias: Cal AI, MyFitnessPal, Strava
```
OBJETIVO:        reducir fricción brutalmente y mostrar progreso (Cal AI: foto → estimación en segundos).
PRIMERA VICTORIA: el primer registro/análisis hecho (foto de comida, primer tracking).
ONBOARDING:      rápido + personalizado. Pedir lo mínimo, dar una acción inmediata antes del primer registro.
                 4-8 pasos iniciales + plan/resultado visible; un quiz profundo requiere que cada
                 respuesta cambie el plan y que los datos justifiquen la longitud.
PAYWALL:         tras el primer análisis. "Ya analizamos tu primer registro. Desbloquea seguimiento
                 inteligente, historial y recomendaciones personalizadas."
MONETIZACIÓN:    TRIAL (duración por TIEMPO-A-VALOR — ver la nota de trial) + anual; CRÉDITOS
                 si la IA por acción es cara. Email recordatorio 1-2 días antes del cobro.
RETENCIÓN:       check-ins diarios/semanales, progreso, racha (loop "Fitness/nutrición" de 24).
NO HACER:        vender desde la INSEGURIDAD corporal · usar vergüenza/culpa/comparación física ·
                 prometer resultados irreales · onboarding largo ANTES del primer registro · hablar
                 solo de números (hablar de control, claridad, constancia).
```

### D) IA CREATIVA / CONTENIDO / VIDEO / DISEÑO — el nicho central de muchas apps de este SO
```
OBJETIVO:        resultado inmediato y "wow moment". El usuario no quiere aprender la herramienta —
                 quiere PRODUCIR algo ya.
PRIMERA VICTORIA: el primer resultado generado (una preview usable en <2 minutos).
ONBOARDING:      ULTRA corto. "¿Qué quieres crear?" → caso de uso → preview rápida. Plantillas por caso
                 (anuncio, guion, carrusel, video, avatar, landing). El usuario NO escribe prompts desde cero.
PAYWALL:         después de la PREVIEW. "Tu primer guion está listo. Desbloquea la versión completa,
                 edítala y genera variaciones listas para publicar."
MONETIZACIÓN:    1 preview/generación gratis → paywall para completar/exportar/generar más.
                 SUSCRIPCIÓN + CRÉDITOS (la IA por acción es cara — ver sección de créditos arriba y 30/40).
                 Cobrar por: exportar, generar más, calidad premium, guardar proyectos, plantillas premium.
RETENCIÓN:       calendario y producción, NO "entra a jugar". "Hoy toca crear tu guion del día" ·
                 "Te faltan 2 piezas para completar tu semana" · "Tu calendario está al 70%"
                 (loop "Creación de contenido" de 24).
NO HACER:        mostrar 40 herramientas en la primera pantalla · hablar de modelos/tokens/parámetros ·
                 hacer escribir prompts desde cero · regalar IA ilimitada si el costo es alto.
```

### E) PRODUCTIVIDAD / ORGANIZACIÓN / NOTAS / CALENDARIO — referencias: Notion, Linear
```
OBJETIVO:        ahorrar tiempo y reducir caos (vender "menos desorden", no "más funciones").
PRIMERA VICTORIA: la primera tarea organizada / algo ordenado (agenda, lista priorizada, resumen listo).
ONBOARDING:      problema → solución. Conectar con un dolor concreto y mostrar un resultado rápido.
                 Modelo 1 (hard paywall) o Modelo 2 corto; la primera tarea completada en minutos.
PAYWALL:         después de ordenar algo. "Organizamos tu semana. Desbloquea automatizaciones,
                 recordatorios inteligentes y planificación recurrente."
MONETIZACIÓN:    SUSCRIPCIÓN. Cobrar por automatizaciones, integraciones, recordatorios, colaboración.
RETENCIÓN:       automatizaciones y sistema acumulado (loop "Productividad" de 24).
NO HACER:        empezar pidiendo mil permisos · pedir conectar calendario/Gmail/archivos ANTES de
                 explicar el beneficio · vender "más features" en vez de "menos caos".
```

### F) FINANZAS / INVERSIÓN / DINERO — referencias: Revolut, Wise
```
OBJETIVO:        confianza, claridad y control. Aquí NO va un paywall juguetón — el usuario necesita seguridad.
PRIMERA VICTORIA: un diagnóstico o visualización inicial de su situación.
ONBOARDING:      confianza + datos claros. Mostrar transparencia, privacidad y seguridad. La prueba social
                 (número de usuarios, auditorías) va ANTES del paywall.
PAYWALL:         después del diagnóstico. "Tu panorama financiero está listo. Desbloquea reportes
                 avanzados, alertas y recomendaciones personalizadas."
MONETIZACIÓN:    premium / reportes / alertas / automatización. Modelo 2 con énfasis en confianza.
RETENCIÓN:       alertas y reportes periódicos.
NO HACER:        prometer ganancias · urgencia agresiva · ocultar costos · gamificación que haga
                 parecer el dinero un juego.
```

> **Por qué no hay nicho de e-commerce/marketplace aquí:** TODA app de este SO se vende como **suscripción recurrente por Hotmart** (ver `18`/`40`). El comercio con checkout de productos o membresía de marketplace queda fuera del modelo — si una idea solo monetiza por compra única, no encaja con este SO (revisar la idea en `01`/`02`).

### MATRIZ ESTRATÉGICA CONSOLIDADA (de un vistazo)

| Nicho | Primera victoria | Onboarding | Paywall | Monetización | Retención |
|---|---|---|---|---|---|
| Educación | Completar 1ª lección | Metas + nivel + ejercicio real | Después de probar | Freemium + premium | Rachas / progreso |
| Bienestar | Primera sesión corta | Suave / emocional | Tras mini-experiencia | Trial + anual | Rutina diaria |
| Fitness / tracking | Primer registro/análisis | Rápido + personalizado | Tras el 1er análisis | Trial / créditos / premium | Check-ins |
| IA creativa | Primer resultado generado | Ultra corto, por caso de uso | Tras la preview | Créditos + suscripción | Calendario / proyectos |
| Productividad | Primera tarea organizada | Problema → solución | Tras ordenar algo | Suscripción | Automatizaciones |
| Finanzas | Diagnóstico inicial | Confianza + datos claros | Tras el diagnóstico | Premium / reportes | Alertas / reportes |

> **TIE-BREAKER nicho vs frecuencia:** si el NICHO y la FRECUENCIA sugieren modelos distintos (ej. finanzas = resultado → premium/diagnóstico, pero el uso es diario → "hábito"), manda la **MATRIZ DEL NICHO** para el modelo de PAGO; la frecuencia se atiende con el LOOP de retención (`24-GAMIFICACION.md`) — se gamifica la CONSTANCIA de uso (registrar cada día), nunca el dinero. El modelo de cobro sale de esta tabla; el hábito se construye aparte.

> **Nota sobre trial (aplica a B/C/F):** la duración se decide por TIEMPO-A-VALOR, no por
> convención: 5-7 días SOLO si el aha es inmediato (primera victoria en minutos); 14+ días cuando
> el compromiso es anual/caro o el valor tarda en acumularse — los trials de 17-32 días convierten
> 42.5% (mediana trial→pago) vs 25.5% los de <4 días (RevenueCat 2026, 115.000+ apps), y sin
> embargo el 46.5% de las apps usa trials de ≤4 días. Patrón Headspace: trial DUAL — 14 días para
> el plan anual, 7 para el mensual (mayor barrera = más prueba). El plazo final sale de
> FICHA-MERCADO §4. Avisar fecha y monto antes del cobro. Config en `18`; operacion y fuentes
> en `60`; loops de retencion en `24`.

### LA FÓRMULA PARA UNA APP DE IA (qué copiar de cada referencia)

No copiar 100% a ninguna. Tomar lo correcto de cada una:
```
De Duolingo:  progreso visible, hábito, rachas útiles, pequeñas victorias.
De Headspace: onboarding emocional, claridad, calma, promesa simple.
De Cal AI:    reducir fricción brutalmente y dar resultado inmediato.
De apps de IA: preview antes del pago, créditos, exportación premium, plantillas listas.

La fórmula:
"Dime qué quieres crear → te doy una preview útil → desbloquea la versión completa →
 vuelve cada día para completar tu sistema de contenido."
```

---

## EL PUENTE DE CHECKOUT (la fricción que los benchmarks no cuentan)

Los benchmarks de este archivo (1.78% install-to-paid, ~45% trial→pago, +234%) vienen de **apps móviles donde pagar es 1 tap con Face ID/Google Pay** sin salir de la pantalla. Aquí NO: el usuario debe **SALIR de la app al checkout de Hotmart**, digitar la tarjeta completa (o PIX/boleto), y volver. El dato: **el checkout web convierte ~45% menos que el pago in-app (Adapty 2026), pero retiene 85-97% del ingreso vs 70-85% tras comisiones de stores (RevenueCat 2025) — menos conversión, más margen**. Diseñar y medir como si fuera un paywall de App Store es fijarse metas que nunca vas a ver — y diagnosticar mal cuando no lleguen.

> **Regla: los benchmarks de app store son REFERENCIA DE TECHO, no meta.** Sirven para entender la mecánica (onboarding→paywall convierte más que paywall solo), no para fijar objetivos de una web app con checkout externo. Y los benchmarks de PLAN SEMANAL de app stores (55.6% del revenue en stores) NO se trasladan a Hotmart/checkout web — no los importes.

> **WEB vs APP STORE — el canal de re-enganche tampoco es el mismo.** Los benchmarks aspiracionales
> (Duolingo, Cal AI) viven de ASO y de PUSH NATIVO: la app store los distribuye y el sistema
> operativo les deja tocar al usuario cada día. Una web app NO tiene ese canal: el re-enganche
> D2-D3 del trial depende de email/WhatsApp (46/34) y el "instalable" es agregar a pantalla de
> inicio, no una instalación de store. Diseñar el puente del trial contando con ESO —
> email/WhatsApp como músculo de retorno — no con un push de app store que nunca va a existir.

### El funnel real por etapas (medir cada tasa POR SEPARADO)

```
VISTA DEL PAYWALL
   │  Tasa 1: paywall → clic-al-checkout ... mide si el paywall CONVENCE (diseño, oferta, momento).
   ▼         Medir APARTE — es la única tasa comparable con los benchmarks de paywall.
CLIC EN "EMPEZAR MI PRUEBA" (sale de la app al checkout de Hotmart)
   │  Tasa 2: clic → trial-iniciado ........ mide el PUENTE. Aquí muere la mayoría: página nueva,
   ▼         tarjeta completa, dudas de confianza. Esperar MUCHO MENOS que el 40%+ de app store —
TRIAL INICIADO (lo confirma el webhook)      en web con checkout externo, una fracción de eso es normal.
   │  Tasa 3: trial → pago ................. aquí sí aplican las palancas clásicas (email día 5-6,
   ▼         valor durante el trial). El ~45% de Adapty también es techo de app móvil.
PRIMER COBRO REAL
```

Si colapsas paywall→trial en UNA sola tasa, no sabes si el problema es el PAYWALL (no convence) o el PUENTE (convence, pero la fricción del checkout externo lo mata). Son dos diagnósticos con dos arreglos distintos.

> **OFERTA POST-CIERRE:** si el usuario rechaza el paywall: oferta post-cierre NO intrusiva
> (banner/email) con ventana de 24h real — recupera 8-15% de los que abandonan y +10-15% de
> ARPU (Adapty 2026). El diseño y las reglas anti-dark-pattern viven en `50` (C2).
> UNA vez por usuario.

### EL PRE-CIERRE (la psicología del puente — la decisión se toma ANTES del formulario)

**PRINCIPIO:** el checkout de Hotmart NO vende: EJECUTA una decisión ya tomada. Todo lo
psicológico ocurre antes de cruzar; si el usuario "re-decide" frente al formulario, el
pre-cierre falló.

**LAS 4 CONDICIONES DEL CRUCE (verificables, una por una, antes de culpar al paywall):**

```
a) PRECIO YA VISTO Y ACEPTADO ANTES (cero sorpresa): el precio nunca llega desnudo —
   siempre con su ancla y su equivalencia (regla de 52). El paywall CONFIRMA un número
   que el usuario ya procesó; no lo estrena.
b) LA INVERSIÓN DEL USUARIO ES VISIBLE en el paywall: su plan, sus respuestas — el
   costo hundido construido por el onboarding (02B) está EN PANTALLA al decidir.
c) EL MIEDO ESTÁ DESACTIVADO: timeline del trial + "te avisamos el día 5" + garantía
   nombrada — Blinkist: +23% trials y −55% quejas CON MÁS transparencia, no menos.
d) LA TRANSFERENCIA DE CONFIANZA ESTÁ PUENTEADA: el CTA anticipa el cambio de página
   ("Ir a Hotmart — pago seguro") + qué verá al llegar; CERO pantallas intermedias
   nuevas — el experimento "no te asustes" de 52 mató 2 de 3.
```

> **Regla de diagnóstico:** si la Tasa 2 (clic→pago) muere, ANTES de tocar el paywall
> revisa las 4 condiciones — el puente psicológico roto (precio-sorpresa, miedo activo,
> re-decisión) mata más que el puente técnico. El vocabulario operativo del diagnóstico
> vive en `60-OPERACION-DE-CONVERSION.md`.

> **MERA EXPOSICIÓN (el agujero del Modelo 2):** el paywall JAMÁS es la primera vez que el
> usuario ve el precio. En el Modelo 2 (ads → onboarding directo, sin pasar por la landing),
> el precio se pre-expone dentro del funnel — en el timeline del trial o en el último
> reconocimiento ("planes desde $X/mes") — ANTES de la pantalla de precio. La primera
> exposición en el momento de la decisión es el peor escenario del anclaje.

### El diseno del PUENTE (reducir la fuga del checkout externo)

```
A) ANTES DE REDIRIGIR — directo por defecto:
   - El CTA abre Hotmart sin pedir otro dato ni otro click.
   - Solo usar una transicion si reduce incertidumbre sin formulario ni confirmacion adicional.
   - El CTA y una linea de ayuda dicen que se abrira Hotmart y como seleccionar la prueba.
   - No afirmar "activo al instante": el webhook puede tardar.

B) LA URL DEL CHECKOUT — pre-llenada, siempre:
   - `off=<oferta>` para fijar el plan correcto y `showOnlyTrial=1` si el trial esta configurado.
   - Pasar user_id/anon_id no sensible por `sck` para reconciliar el webhook.
   - `email=` SOLO si ya existe por cuenta o necesidad real del producto. Nunca pedirlo antes del
     checkout solo para capturar el lead: Hotmart lo pedira una vez.

C) AL VOLVER — pantalla "Confirmando tu compra…" (nunca dejarlo perdido):
   - Polling: la app consulta cada pocos segundos si el webhook ya activó el plan (status
     trialing/active en el perfil). Al confirmarse → celebración + directo a su primera victoria.
   - Si tras ~60-90s no llega: fallback honesto — "El pago puede tardar unos minutos en confirmarse.
     Te avisamos por correo" + botón "Ya pagué y no se activa" que dispara el flujo de reclamo
     (buscar por email/código de suscriptor, ver 18). Cubre el caso del email distinto y el webhook lento.
```

### Price parity por país (si vendes multi-país)

Hotmart permite fijar PRECIO POR MONEDA/PAÍS en la oferta. Si vendes multi-país, fija precios por
poder adquisitivo (Brasil ≠ México ≠ Argentina — el mismo $19 USD es barato en un mercado y
prohibitivo en otro) y anótalos en FICHA-MERCADO §1 con fuente y fecha. Cuidado con el arbitraje
por VPN (comprar "desde" el país barato): aceptable al inicio; revisar si escala.

---

## EL PUENTE DEL TRIAL (los días 1-7 DENTRO de la app: de "activó la prueba" a "pagó y se queda")

El SO diseña con precisión cómo se ACTIVA el trial (onboarding → paywall → puente de checkout), pero entre "trial iniciado" y "primer cobro real" están los días del trial DENTRO de la app (5-14+, según la regla de tiempo-a-valor) — y ahí se decide si ese cobro llega a suceder. Un trial sin experiencia diseñada es un contador en silencio que termina en cancelación pre-cobro o, peor, en un cobro-emboscada (reembolso + chargeback + reseña de 1 estrella — y Hotmart castiga ambos). Regla rectora: **cada día del trial tiene UN momento de valor diseñado, igual que cada pantalla del onboarding tiene un micro-compromiso.**

### EL MAPA D1-D7 (adaptar los números a la duración REAL del trial del nicho — decidida por tiempo-a-valor, ver la nota de trial arriba)

```
D1 — PRIMERA VICTORIA, YA: la victoria que el onboarding PROMETIÓ se materializa HOY — el plan/
     resultado generado es USABLE el mismo día (no "tu plan empieza el lunes"). Sin D1 no hay D2.
D2-D3 — EL MOMENTO "ESTO FUNCIONA": la app muestra el primer INSIGHT derivado de SUS datos reales
     ("tu mejor hora de X es...", "con solo 2 registros ya vemos que..."), nunca un tip genérico
     que serviría para cualquiera. Si aplica, aquí caen los momentos M1/M2 del 56 (1ª celebración).
D4-D5 — INVERSIÓN ACUMULADA VISIBLE: la app le muestra lo que YA construyó — "llevas 6 registros,
     tu [plan/artefacto] ya sabe [Y] de ti". El costo de irse crece cada día (efecto dotación).
D6 — AVISO PRE-COBRO HONESTO (in-app + email): fecha exacta, monto exacto y cómo cancelar en 1 tap.
     Contraintuitivo pero probado: avisar BAJA reembolsos y chargebacks y SUBE la confianza — el
     que iba a cancelar cancela igual; el que se queda, se queda sin rencor.
D7 / COBRO — AGRADECIMIENTO + DESBLOQUEO VISIBLE: "ya eres Pro" con lo Pro tangible (qué se
     desbloqueó, señalado en la UI) — el primer cobro se siente como upgrade, no como débito.
```

### INDICADOR DE TRIAL honesto (siempre visible, nunca amenazante)

```
Pill discreta "Día 3 de 7" en el home: caption 12-13px, fondo neutro elevado, SIN color de alarma —
NUNCA un countdown rojo de presión. Al tocarla abre un sheet: qué incluye Pro + fecha y monto
exactos del cobro + "Cancelar mi prueba" en 1 tap (sin laberinto).
```

### REGLA DURA

Cada día del trial tiene UN momento de valor diseñado y TRAZABLE a un deseo de FICHA-AVATAR.md (57) — el mapa se anota en ESTADO.md (sección de monetización). Si el usuario NO volvió en D2-D3, el push/email de re-enganche (24/34) usa el DOLOR #1 de la ficha en su lenguaje literal — nunca un "te extrañamos".

### MÉTRICAS DEL PUENTE DEL TRIAL (sumarlas a las del funnel de abajo)

```
- Activación D1: % de trials con la primera victoria completada el día 1 (meta: >80%).
- Retorno D3: % que volvió a abrir la app el día 2-3 (si no volvió, el cobro casi nunca llega).
- Conversión trial→pago: benchmark honesto por nicho — el ~45% de Adapty es TECHO de app store
  (ver EL PUENTE DE CHECKOUT); en web con checkout externo, medir la propia base y mejorarla.
- % de cancelación pre-cobro y SU DÍA: ¿cancelan al D1 (falló la primera victoria) o al D6 (el
  aviso reveló poco valor acumulado)? — dos diagnósticos con dos arreglos distintos.
```

> **Cross-refs:** los momentos de D2-D5 se diseñan con `56-MOMENTOS-EMOCIONALES.md` · si cancela igual → encuesta + oferta de rescate de `58-RETENCION-DE-INGRESOS.md` · la secuencia espejo por EMAIL (D1 bienvenida, D5-D6 aviso) vive en `PROMPT-EMAILS.txt` + `18` · los 3 bullets de confianza del paywall que PROMETEN este puente están en `50` → C4bis.

---

## ORDEN DE EXPERIMENTOS DE PRICING (qué probar primero)

No todos los tests valen lo mismo. Win rates medidos sobre experimentos de paywall, ordenados por
impacto en LTV (Adapty 2026):

| Qué testear | Win rate (impacto en LTV) |
|---|---|
| Localización de precios | 62.3% |
| Estructura del trial | 59.6% |
| Duración de planes | 58.7% |
| Número de planes | 57.1% |
| Cambios de precio | 45.5% |
| Cambios visuales / de texto | 34.6% |

Reglas de uso:
- Los cambios de ESTRUCTURA tienen ~2x el win rate de los visuales — no gastes tests en colores de botón.
- Cadencia de los mejores: ~14.7 experimentos/año; las apps que experimentan consistentemente
  ganan hasta 40x más (Adapty 2026).
- La infraestructura vive en `37` (flags/A-B) y la medición en `60`/`36`.

---

## MÉTRICAS CLAVE A MEDIR (implementar desde el día 1)

```
ONBOARDING
- Tasa de completación del onboarding (meta: >70%)
- Tasa de abandono por paso (identificar el paso donde más se van)
- Tiempo hasta la primera victoria (<60 segundos es el objetivo)
- Tasa de activación (% que completa la primera acción de valor)

PAYWALL Y PUENTE (dos tasas SEPARADAS — ver "EL PUENTE DE CHECKOUT" arriba)
- Vista del paywall → clic al checkout (¿el paywall convence?) — medir aparte
- Clic al checkout → trial iniciado (¿el puente funciona?) — esperar MUCHO menos que el 40%+
  de app store: ese número es techo de apps móviles con pago de 1 tap, no meta de web
- Trial → pago (referencia de techo app store: ~45%, Adapty 2026; la duración del trial se
  decide por tiempo-a-valor — ver la nota de trial de la matriz A-F)
- Día 0 de cancelación (el 55% de las cancelaciones ocurren el Día 0). ⚠️ DIAGNÓSTICO: un Día 0
  alto o una conversión pobre NO siempre es mal onboarding — PRIMERO revisa el PUENTE (¿la gente
  hace clic pero no inicia el trial? ¿vuelve del checkout a una pantalla que confirma y activa,
  o queda perdida?). Solo si el puente está sano, el sospechoso es el onboarding/compromiso.

RETENCIÓN
- D1 (meta: >40%), D7 (meta: >20%), D30 (meta: >10%)
- Churn mensual (meta aspiracional <8%; para MODELAR el LTV usa el churn realista 10-20% de `40-UNIT-ECONOMICS.md`)
```

---

## CHECKLIST DE PRICING Y MODELO DE NEGOCIO

```
[ ] Orden de diseño respetado: tipo de app → promesa → frecuencia → primera victoria → paywall → pricing → retención (no al revés)
[ ] Nicho identificado y su estrategia tomada de la matriz (A-F): primera victoria, onboarding, paywall, monetización y retención fijados ANTES de diseñar
[ ] Frecuencia de uso definida (diaria/semanal/puntual) → modelo elegido (freemium=hábito · hard paywall / preview→paywall=resultado)
[ ] Decisión tomada: ¿hard paywall, onboarding→paywall, o freemium?
[ ] Trial definido con duracion, fecha/monto de renovacion y razon basada en tiempo a valor; no por imitacion
[ ] Si la IA por acción es cara: créditos por plan definidos y empaquetados en RESULTADOS (no tokens), validados contra el COGS (40)
[ ] Plan anual mostrado como $/mes en grande + total anual visible en label ("Se cobra $X/año"), pre-seleccionado, con badge "2 meses gratis"
[ ] Pricing en .99 si el mercado es LATAM; precio descompuesto por día/semana
[ ] Si hay 3 tiers: el del medio dimensionado como señuelo (una dimensión, 80-90% del precio, ≤40-50% del valor) y el recomendado con badge
[ ] PUENTE DE CHECKOUT disenado: Hotmart directo por defecto + URL con `off`, `showOnlyTrial=1` y `sck` + `email` solo si ya se conoce + retorno con polling y fallback
[ ] PUENTE DEL TRIAL diseñado: mapa D1-D7 con UN momento de valor por día (trazado a FICHA-AVATAR), indicador "Día X de Y" honesto, aviso pre-cobro D6 in-app + email — anotado en ESTADO.md
[ ] Metricas del funnel canonico de `60` desde el dia 1: `paywall_visto` por visibilidad real, `checkout_iniciado`, `trial_iniciado` y `primer_cobro_confirmado` separados
```

> El diseño del FUNNEL que ejecuta este modelo (los 5 trabajos del onboarding, las 7 reglas, la anatomía y las 7 preguntas del paywall) se verifica con el checklist de `02B-ONBOARDING-Y-PAYWALL.md`.
> La operacion, definiciones de eventos, QA, atribucion y diagnostico viven en
> `60-OPERACION-DE-CONVERSION.md` y prevalecen si un ejemplo anterior entra en conflicto.
