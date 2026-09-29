# DEL MVP BÁSICO AL PRODUCTO ENRIQUECIDO Y VENDIBLE

> **Cuándo cargar este archivo:**
> - SIEMPRE durante construcción y pulido (junto con `05-CREACION.md`, `07-PULIDO.md`, `14-LEYES-DE-DISENO.md`)
> - Es el archivo que sube el listón de "funciona" a "se vende". Si solo lees uno antes de declarar algo terminado, que sea este.

## Por qué existe (con evidencia real, no teoría)

El fracaso #1 de las apps hechas con IA **no es que no funcionen** — es que quedan **básicas**: pantallas con un input y dos botones flotando en un vacío, fondo plano sin profundidad, navegación mal puesta, CTA que parece muerto, landing que no vende. Y casi siempre por la **misma causa raíz**: *el agente nunca abrió la app renderizada y la miró*. Construyó "el mínimo correcto", pasó el `tsc`/`build`, y declaró listo — sin ver el resultado con ojos de usuario.

**Caso real (no inventado).** Una app de triage veterinario construida con este mismo SO llegó a la fase pre-deploy así:
- La **barra de navegación flotaba a media pantalla** con un gran vacío debajo (bug de `min-h-full` sin cadena de altura).
- **Fondo crema plano**, sin profundidad — justo lo que el archivo 16 prohíbe ("minimal NO es beige plano").
- Pantallas con **un textarea + dos botones y aire muerto** abajo.
- El **CTA principal en gris apagado** (estado disabled al 50%) — parecía roto.
- Una **landing fina** que "no vendía nada".

Lo demoledor: **todas las reglas para evitar cada uno de esos errores YA estaban en el SO** (14, 16, 11, 22, 07, 19). No fallaron por falta de contenido. Fallaron porque **nadie miró la app renderizada y la puló**. Este archivo cierra ese hueco.

---

## EL PRINCIPIO: el estándar es "vendible hoy", no "MVP de demo"

```
Un MVP básico ≠ un producto. El entregable de este SO es algo que el usuario podría COBRAR hoy
—o ajustar un poco y cobrar— no una demo que "técnicamente funciona".

Una pantalla con un input + 2 botones y un vacío NO está lista, aunque compile y no tenga bugs.
"Correcto" es el piso, no la meta. La meta es ENRIQUECIDO: que se sienta un producto cuidado.
```

---

## NO EXISTE LA "PRIMERA VERSIÓN SENCILLA" (la trampa del pase de pulido)

El patrón más caro de este sistema no es construir mal: es construir **a medias a propósito**,
pensando que después habrá un pase de pulido. Suena razonable —"primero que funcione, después que se
vea bien"— y produce, sin excepción:

```
Lo que pasa de verdad:
1. Sale una v1 correcta pero pobre (estructura bien, densidad baja, cero profundidad)
2. Se declara "listo, después lo pulimos"
3. El pulido NUNCA llega, o llega cuando ya hay tráfico pagado encima
4. El dueño —que no es diseñador— tiene que pedir mejora por mejora, una por una,
   sin saber nombrar lo que le falta ("se ve básico", "le falta algo")
```

⚠️ **Ese trabajo es del agente, no del dueño.** El usuario de este SO no sabe pedir "más profundidad
en el fondo" ni "densidad tipográfica". Si la v1 sale pobre, él solo puede decir *"no me convence"* —
y ahí se pierden días de ida y vuelta que el agente podía haber ahorrado haciéndolo bien la primera vez.

**LA REGLA:**

```
Cada pantalla, landing o comparativa se entrega en su versión FINAL desde la primera vez.
No hay "primer pase". No hay "después lo mejoramos". No hay "por ahora lo dejo simple".
```

**Cómo se aplica en la práctica** (lo que SÍ es legítimo dejar para después):

| Legítimo posponer | NUNCA se pospone |
|---|---|
| Contenido que **todavía no existe** (capturas de una app sin construir) → va PLACEHOLDER visible y honesto | La densidad, la profundidad, la jerarquía y el craft de lo que SÍ se entrega |
| Features fuera del alcance acordado | Los estados (empty, loading, error) de lo que se entrega |
| Datos reales que dependen de terceros | Los datos SEMILLA que hacen que se vea llena |

**El placeholder es la salida honesta, y es una salida CON CALIDAD.** Un hueco marcado como
"aquí irá la captura del panel" —dentro de su marco de dispositivo, con su proporción correcta y su
tratamiento visual— es profesional. Una sección a medio hacer sin decir que está a medio hacer, no.
Ver `55-DISENO-DE-LANDING.md` §1.3, que ya especifica cómo se ve un placeholder bien hecho.

> **Test para saber si estás cayendo en la trampa:** ¿estás pensando "esto queda así por ahora"?
> Entonces no está listo. O lo terminas, o lo marcas explícitamente como placeholder y se lo dices
> al usuario en el reporte de cierre. Lo que no vale es entregarlo sin decir nada esperando que no
> se note.

---

## REGLA #0 — MÍRALO RENDERIZADO (la que previene el 80% de todo)

```
Antes de declarar CUALQUIER pantalla lista:
1. Ábrela RENDERIZADA a 375px (mobile) con un mecanismo REAL de screenshot/preview — un MCP de preview/
   navegador, Playwright, o el navegador abierto — y MÍRALA. Si no tienes ninguno, pídele al usuario una
   captura. (No basta "imaginar" cómo se ve: hay que VERLA.)
2. Puntúala con la RÚBRICA /40 de `RUBRICAS-DE-PANTALLA.md` — sobre lo que VES, no sobre el código.
3. Una pantalla que no viste renderizada NO está lista. "El código se ve bien" NO cuenta.

El caso real de arriba se habría evitado casi entero con esta sola regla: el bug de la nav, el vacío,
el fondo plano y el CTA muerto GRITAN en cuanto abres la app a 375px. El agente nunca la abrió.
```

> Esto extiende el ritual de verificación del archivo 12 (`tsc`/`build`/`dev`): **verificar que compila NO es verificar que se ve bien.** Son dos puertas distintas; la visual es la que faltaba.

---

## LA ESTRUCTURA — el bug de layout #1 (nav flotando / vacío muerto)

El error más común y más devastador. El app-shell de una app con bottom-nav debe llenar el viewport:

```tsx
// ✅ CORRECTO: el shell llena la pantalla, la nav queda SIEMPRE al fondo
<div className="flex min-h-dvh flex-col">      {/* min-h-dvh, NO min-h-full */}
  <div className="mx-auto w-full max-w-md flex-1 px-5 pt-5">{children}</div>  {/* flex-1 = empuja */}
  <BottomNav />                                {/* último hijo del column = al fondo */}
</div>
```

```
ANTI-BUG (lo que pasó en el caso real):
  `min-h-full` (min-height:100%) solo funciona si el PADRE tiene altura EXPLÍCITA. Si el body tiene
  `min-h-full` (no `h-full`), el porcentaje se resuelve contra altura `auto` → se IGNORA → el contenedor
  mide lo que mide el contenido → la nav `sticky bottom-0` se pega al final del contenido corto =
  nav flotando a media pantalla con vacío abajo.
  → Solución: usar `min-h-dvh` en el shell (es relativo al viewport, no depende de la cadena del padre).

REGLA DURA: cero vacío muerto. El contenido llena el viewport o se balancea; la bottom-nav SIEMPRE al fondo.
Verificar a 375px: ¿la nav está abajo? ¿hay un hueco grande sin propósito? Si sí → no está lista.
```

---

## ANTI-PLANO — la receta de profundidad (operacionaliza el archivo 16)

"Usa mesh gradients" es aspiración; esto es la receta concreta para que NO se vea plano:

```css
/* 1. Fondo CON profundidad — no un fill plano */
body {
  background:
    radial-gradient(1100px 640px at 50% -10%, <crema-clara> 0%, transparent 58%),
    radial-gradient(760px 540px at 104% 2%, <acento a 6-8% alpha> 0%, transparent 55%),
    var(--bg-base);
  background-attachment: fixed;
}
/* 2. Superficies ELEVADAS — sombra suave + borde, no solo borde */
.surface { box-shadow: 0 1px 2px rgba(0,0,0,.03), 0 14px 30px -20px rgba(0,0,0,.20); }
```
```
- Fondo: mesh sutil (2-3 puntos de luz a baja saturación), NUNCA un color sólido plano.
- Cards/inputs: elevación sutil (la sombra de arriba), no superficies "pegadas" al fondo.
- Un detalle de craft por pantalla protagonista (glow del acento, gradiente con dato).
- El MODO se deriva del arquetipo y el mundo del sujeto (archivo 16, Regla 2) — no hay default oscuro.
  Si la Ficha derivó claro: claro CON profundidad (cálido, sombras suaves, mesh sutil), no beige plano.
  Si derivó oscuro: casi-negro con tinte y superficies elevadas, no #000 plano.
```

---

## ANTI-SPARSE — cómo llenar una pantalla con VALOR (no con aire)

Si una pantalla principal tiene menos de ~3-4 bloques de valor, está vacía. **Llenarla con valor, no estirando elementos ni dejando huecos.** Catálogo de patrones (los que rescataron el caso real):

```
PATRÓN                          QUÉ RESUELVE
Chips de acción rápida          Atajos de lo más común (síntomas, categorías, plantillas) → densidad + UX.
Medidores VISUALES              "3 de 3 consultas" en texto plano → 3 puntos llenos + label. El dato se VE.
Tarjetas de estado / next-best  "Tu mascota está al día", "Lo que conviene hacer ahora" → dirige y llena.
Microcopy de confianza          Una línea con ícono (disclaimer, garantía, "tus datos no salen del equipo").
Actividad reciente / retomar    "Tu última consulta", "Seguí donde quedaste" → continuidad + densidad.
Empty states con personalidad   Ilustración + título que no dice "vacío" + CTA + ejemplo (archivo 15). NUNCA "No hay datos".
Estado/progreso (emocional)     Racha, hito, "al día" — aunque sea una utilidad (ver capa emocional abajo).
```

```
EJEMPLO REAL (pantalla de Consulta del caso):
  ANTES:   header + textarea + botón "foto" + CTA + un texto "3 de 3"  →  vacío grande, se ve básica.
  DESPUÉS: + chips de síntomas frecuentes + medidor visual de consultas + línea de confianza
           = intencional, llena, premium. Mismo propósito, cero relleno hueco.
```

---

## LA APP NUNCA SE ENSEÑA VACÍA (datos semilla del mundo del avatar)

Los empty states (15) son para el USUARIO nuevo; los datos semilla son para ENSEÑAR la app. Una app recién construida está vacía, y vacía se ve pobre exactamente donde más se juega: en los screenshots del carrusel de la landing (19 §5), en el preview que puntúa el `revisor-visual`, en la demo al dueño y en el primer render de cada pantalla. Nadie compra una app que se presenta con "No hay datos".

```
REGLA: todo proyecto incluye un SEED de datos DEMO realistas del mundo del avatar
(script o fixture — `npm run seed:demo` o un módulo `demo-data.ts`), con 4 propiedades:

1. NOMBRES REALES del mercado: "María", "Andrés", "Camila" — jamás "User 1", "Test", "asdf".
2. VALORES PLAUSIBLES del nicho con su moneda/formato local: gastos en COP con separador de
   miles ($186.400), pesos en kg, hábitos con nombre humano ("Leer 20 páginas", no "Hábito 1").
3. FECHAS RECIENTES relativas a HOY (generadas con `Date.now()` − días, nunca hardcodeadas):
   un seed con fechas de 2023 grita "demo abandonada".
4. CANTIDADES QUE LLENAN SIN SATURAR: cada lista con 5-8 ítems (una lista-preview de home
   puede mostrar 3-4, pero el seed TIENE 5-8 para que las vistas completas no queden ralas) ·
   cada gráfico con 2-3 semanas de datos · racha en 3-12 días · progreso al 40-70% —
   NUNCA 0% (vacío) ni 100% (irreal y sin tensión).
```

**Dónde se usa (y dónde JAMÁS):**
```
(a) Screenshots del carrusel de la landing (19 §5) y del CIERRE de cada pantalla: el
    revisor-visual puntúa pantallas LLENAS — la app vacía no representa el producto.
(b) Modo demo para el dueño: que recorra SU app llena antes de tener usuarios reales.
(c) NUNCA en producción real: el seed corre solo tras un flag/entorno separado
    (`SEED_DEMO=true` en `.env.local` o script manual — jamás en el arranque de prod).
```

**Un seed de ejemplo por nicho (matriz A-F del 02C):**

| Nicho | Seed demo (1 ejemplo del mundo del avatar) |
|---|---|
| A · Educación | 2 cursos al 60% y 35% ("Excel para finanzas", "Inglés B1"), 6 lecciones completadas esta semana |
| B · Bienestar | 6 hábitos con nombre humano ("Meditar 10 min", "Dormir antes de las 11"), racha de 8 días |
| C · Fitness | 3 rutinas con nombres + pesos en kg realistas ("Pierna — sentadilla 60 kg × 8"), 5 sesiones en 2 semanas |
| D · IA creativa | 7 generaciones previas con títulos reales ("Post para el Día de la Madre"), 2 marcadas favoritas |
| E · Productividad | 8 tareas en 3 estados, proyecto "Lanzamiento tienda" al 55%, fechas de esta semana |
| F · Finanzas | 12 gastos hormiga colombianos con comercios reales ("Éxito", "Rappi", "Ara"), mes al 54% del presupuesto |

Los datos mock de la pantalla canónica (53) ya siguen esta regla — úsala como referencia de tono ("Mercado — Éxito", "Pedro Páramo · pág. 84").

---

## 4 DETALLES DE ENRIQUECIMIENTO QUE SEPARAN "FUNCIONA" DE "LO AMAN" (verificar en TODA app interna)

Detectados al pulir una app real hasta el nivel que sus usuarios de referencia (Streaks, Finch)
sí tienen. Ninguno es una feature nueva — son el remate que falta en features que YA existen:

```
1. CERO ÍCONOS DE TEXTO/UNICODE EN FUNCIONALIDAD REAL. Un ✓, ★, → o emoji como ícono de un botón,
   estado o navegación se ve a medio-hacer al lado de un ícono real. TODO ícono funcional sale de
   la librería del stack (Lucide/Phosphor, ver 22) — nunca un carácter Unicode ni un emoji actuando
   de ícono. (Emoji SÍ vale como acento decorativo puntual — nunca como el ícono de una acción.)

2. TODO CONTADOR NUMÉRICO DE PROGRESO NECESITA HITOS DE CELEBRACIÓN, no solo el número subiendo.
   Si la app cuenta algo (check-ins, consultas, sesiones, entregas), celebrar los hitos reales
   (7/14/30/100 — ver `24-GAMIFICACION.md`) ADEMÁS de la confirmación normal de cada acción. Esto
   aplica incluso a apps que evitan gamificación punitiva (rachas que rompen): un hito de volumen
   ("100 check-ins") no es punitivo — es un logro que nunca se pierde, compatible con cualquier
   mecanismo anti-culpa.

3. TODA SECCIÓN DE HISTORIAL/CALENDARIO/LÍNEA DE TIEMPO NECESITA UNA TARJETA DE RESUMEN AGREGADO
   (no solo la lista/calendario en crudo). Mínimo: "Esta semana" + "Total" con el dato héroe cada
   una. Ver una lista sin ningún agregado obliga al usuario a contar mentalmente — el resumen es
   el trabajo que la app le ahorra.

4. CHEQUEO DE "FUNCIÓN MUERTA" — ninguna capacidad definida sin una forma de alcanzarla desde la
   UI. Si el sistema de diseño (10/16) define modo claro Y oscuro, tiene que existir un control
   real para cambiar entre ellos — no basta con que los tokens existan. Si el modelo de datos
   permite archivar/exportar/renombrar algo, tiene que haber un botón para hacerlo. Antes de cerrar
   la app interna, listar cada capacidad que el sistema técnico soporta y confirmar que TODAS son
   alcanzables por el usuario — una capacidad "soportada mas no alcanzable" no cuenta como hecha.
```

---

## CTAs VIVOS (el héroe nunca se ve muerto)

```
- El botón primario JAMÁS se ve apagado/roto. El estado disabled NO es el pill al 50% de opacidad
  (parece roto): usa un estado suave "en espera" (fondo neutro claro + texto tenue) que invita a actuar.
- El héroe de cada pantalla se ve accionable de un vistazo (archivo 14: el CTA se reconoce en <3s).
- Mejor aún: mantener el primario vivo y validar al hacer click (hint amable si falta algo), en vez
  de un CTA que arranca deshabilitado y muerto.
```

---

## LA CAPA EMOCIONAL/GAMIFICACIÓN NO ES OPCIONAL (aunque sea "una utilidad")

El error del caso real: "es una app de triage, una utilidad" → se omitió todo lo emocional. Mal. Hasta la herramienta más seria necesita:
```
- Personalidad en el copy (los 3 adjetivos del archivo 11) — voz reconocible, no software frío.
- UN elemento de estado/progreso visible (archivo 24): "al día", racha de cuidados, hito.
- UNA micro-celebración en el PRIMER éxito (primera consulta, primer registro).
→ Cargar 11 + 24 incluso en apps utilitarias. La calidez no es solo para apps de hábito.
```

---

## LA LANDING NUNCA ES BÁSICA

```
Refuerzo del archivo 19: una landing plana NO vende, y el usuario lo nota de inmediato.
Mínimo: las 10 secciones de la ESTRUCTURA CANÓNICA del 19 (en su orden exacto), profundidad visual (no fill plano), prueba social concreta, pricing con ancla,
FAQ que derriba objeciones, garantía, copy de respuesta directa. Misma rúbrica /40 que la app.
Si la landing "se ve simple", no está lista: es la pieza que convierte visitantes en pagos.
```

---

## EL TEST FINAL — ¿básico o enriquecido?

```
[ ] ¿ABRISTE la pantalla renderizada a 375px y la MIRASTE? (regla #0 — sin esto, nada cuenta)
[ ] La bottom-nav está al fondo y NO hay vacío muerto (min-h-dvh, no min-h-full)
[ ] El fondo tiene profundidad (mesh/gradiente), no un fill plano; las superficies están elevadas
[ ] Cada pantalla principal está LLENA DE VALOR (chips/medidores/estado/confianza), no estirada
[ ] El screenshot del cierre (y los del carrusel de la landing) se tomó con DATOS SEMILLA realistas — nunca la app vacía
[ ] El CTA héroe se ve VIVO y accionable (nunca un pill muerto al 50%)
[ ] Hay personalidad + un elemento de estado/progreso + celebración en el primer éxito
[ ] La landing tiene profundidad, prueba social, pricing ancla y las 10 secciones canónicas del 19 en orden
[ ] Cada pantalla protagonista puntúa ≥36/40 Y ≥16/20 — puntuadas por el subagente `revisor-visual`, no por quien construyó
[ ] Test del logo: si lo quito, ¿se ve como producto premium o como demo de IA genérica?
[ ] Cero íconos de texto/Unicode/emoji haciendo de ícono funcional — todos de la librería del stack
[ ] Todo contador de progreso tiene hitos de celebración (7/30/100...), no solo el número subiendo
[ ] Todo historial/calendario tiene una tarjeta de resumen agregado (Esta semana/Total), no solo la lista cruda
[ ] Cero "funciones muertas": toda capacidad que el sistema técnico soporta es alcanzable desde la UI
→ Si alguna falla, todavía es un MVP básico. No está listo para vender.
```

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

- **`RUBRICAS-DE-PANTALLA.md`**: la rúbrica /40 — aquí se exige aplicarla sobre lo RENDERIZADO, no sobre el código.
- **`14-LEYES-DE-DISENO.md`**: specs exactas + la regla de viewport/estructura.
- **`15-PATRONES-UX.md`**: el catálogo de patrones para llenar pantallas con valor.
- **`16-DIRECCION-DE-ARTE.md`**: la profundidad y el anti-plano nacen ahí; aquí se operacionalizan.
- **`11-DISENO-EMOCIONAL.md` + `24-GAMIFICACION.md`**: la capa emocional, obligatoria también en utilidades.
- **`19-PAGINA-DE-VENTAS.md`**: la landing rica que vende — sus screenshots del carrusel (§5) se toman con los datos semilla, nunca con la app vacía.
- **`12-FLUJO-AGENTICO.md`**: la verificación visual extiende su ritual de `tsc`/`build`/`dev`.

---

## MATRIZ: CUÁNDO ACTIVAR CADA MÓDULO (que "enriquecido" no se vuelva sobre-ingeniería)

"Producto enriquecido" es la superficie que el usuario VE Y PAGA — no activar toda la maquinaria del SO el día 1. Esta matriz dice qué se enciende en cada etapa. Leyenda por celda: **—** (no todavía) · **mínimo** (la versión más chica que sirve, entre paréntesis) · **completo** (el módulo entero como lo describe su archivo).

| Módulo / capacidad | MVP día 1 | Primeras ventas | 500+ usuarios |
|---|---|---|---|
| RAG (33) | — (contexto en el prompt + prompt caching basta) | mínimo (pgvector + chunking simple SOLO si la feature core lo exige) | completo (hybrid search, reranking, evals de retrieval) |
| Feature flags (37) | mínimo (flags por env var/tabla SOLO en features que tocan dinero o IA — ver regla abajo) | mínimo (kill-switch de IA + flag por feature nueva de pago) | completo (rollout gradual por cohortes, targeting por plan) |
| i18n (39) | — (mono-idioma decidido en ESTADO.md; textos NO hardcodeados si se planea más de uno) | — (salvo que el nicho sea Brasil → pt-BR desde el inicio) | mínimo→completo (segundo mercado con demanda probada: next-intl + monedas) |
| Evals de IA (31) | mínimo (golden set de 10-20 casos de la acción core, corrido a mano) | mínimo (golden set en CI antes de cambiar modelo/prompt) | completo (LLM-judge, tracing, regresión automática) |
| pSEO (45) | — | mínimo (SEO técnico base: metadata, sitemap, schema.org en la landing) | completo (programmatic SEO con plantillas indexables) |
| A/B testing (37) | — (no hay tráfico: un A/B sin muestra es ruido) | mínimo (UN experimento a la vez en el paywall/pricing, medido en 36) | completo (experimentos con significancia, flags + analítica) |
| Backoffice (21) | mínimo (nivel 1: queries SQL guardadas + dashboard de Supabase) | mínimo (nivel 2: panel /admin con métricas de dinero, uso e IA) | completo (nivel 3: gestión de usuarios, reembolsos, kill-switches desde la UI) |
| Colas / infra (13) | mínimo (pgmq/pg_cron SOLO si hay imagen/audio/video async; si no, nada) | mínimo (worker + reintentos + alertas de costo) | completo (checklist de escalabilidad del 13: pooling, índices auditados, Supabase Pro) |
| Analítica (36) | mínimo (los 5-8 eventos canónicos del funnel: signup, activación, paywall_visto, pago) | completo (funnel completo + identify + eventos de retención) | completo (+ cohortes, retención D7/D30, dashboards por experimento) |

```
REGLA DE FLAGS EN ETAPA MVP (acotada, no dogmática):
"Toda feature nueva nace detrás de un flag" aplica EN MVP solo a features que tocan DINERO o IA
(paywall, pricing, créditos, llamadas a modelos, webhooks de pago): ahí el flag es tu kill-switch
si algo sale caro o roto. El resto de la UI del MVP NO necesita flags — es fricción sin beneficio
cuando aún no hay usuarios. Desde "primeras ventas" en adelante, la regla se generaliza (ver 37).

CÓMO LEER LA MATRIZ:
- Si estás construyendo el MVP y un módulo dice "—": NO lo construyas "por si acaso". Anota en
  ESTADO.md cuándo se activará (la columna siguiente) y sigue.
- Cambiar de columna es un EVENTO explícito (primera venta real; ~500 usuarios activos): al cruzarlo,
  volver a esta matriz y activar lo que corresponda — no "cuando haya tiempo".
```
