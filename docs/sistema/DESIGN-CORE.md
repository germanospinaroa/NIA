# DESIGN-CORE — El Núcleo Operativo de Diseño (lectura obligatoria única)

## 1. QUÉ ES ESTE ARCHIVO

Este es EL núcleo de diseño del SO: se lee SIEMPRE, completo, antes de diseñar o modificar cualquier interfaz, y **reemplaza la carga de los módulos profundos de diseño (10, 14, 15, 16, 17, 22, 29, 41, 43, 49, 53, 54) para el 90% de las tareas**. Contiene los números, las doctrinas resueltas, la lista anti-slop unificada, el protocolo por capas y EL checklist de cierre canónico. Los módulos completos pasan a ser consulta bajo demanda: se abren solo cuando la tarea pide su profundidad. Si este archivo y un módulo se contradicen, **manda este archivo** (sección 3: Doctrinas).

**⚠️ ANTES DE TODO: si el usuario dio imagen(es) de referencia, la referencia es un CONTRATO** —
manda sobre la capa anti-IA, sobre las tablas de `29` y sobre el catálogo de fuentes; la capa
anti-IA solo filtra lo que la imagen no decide, y las prohibiciones solo se sostienen si violan
contraste AA. Protocolo completo (tabla de extracción + test de fidelidad): `16-DIRECCION-DE-ARTE.md`, inicio.

**Detalle visual que rompe el texto:** toda pantalla de venta aplica el SISTEMA DE ÍCONOS Y DETALLES de `55` (íconos SVG con contenedor 40-48px — jamás emoji salvo pedido explícito —, hairline degradada solo en 1-3 elementos clave, checkmarks custom, repertorio de 10 detalles) con los componentes `<IconChip>`/`<GradientBorderCard>` de `49` — siempre dentro del 60-30-10 y del brand kit, nunca como licencia para glow/glass (16).

**Deduplicación de gates:** el checklist de la sección 7 es **EL ÚNICO que se recorre al cierre de
pantalla**. Los checklists de `07`, `14`, `22`, `32`, `43` y `49` son fuente de CONSULTA (para
subir un puntaje o profundizar un ítem), NO listas a recorrer — recorrerlos todos duplica trabajo
sin subir calidad.

| Si necesitas… | Lee |
|---|---|
| Derivar brand kit desde cero (TABLA DE LÍDERES → fusión, arquetipo, mundo del sujeto) | `16-DIRECCION-DE-ARTE.md` (PASO 0.2bis PRIMERO: fusionar lo mejor de las apps líderes del nicho) + `29-REFERENCIA-VISUAL.md` (combinaciones tipográficas PROBADAS + degradés de las grandes — prohibido inventar combinaciones que ninguna app grande use) |
| El detalle de una ley (micro-tipografía, CSS de espaciado roto, dial de intensidad) | `14-LEYES-DE-DISENO.md` |
| Código de librerías (Motion, GSAP, Lottie, Phosphor, Recharts) | `22-LIBRERIAS-Y-CRAFT.md` |
| Onboarding, empty states, auth UX, gestos, háptica, URL-estado, aria-live | `15-PATRONES-UX.md` |
| Personalidad (3 adjetivos), celebraciones, tono de error, gamificación emocional | `11-DISENO-EMOCIONAL.md` (+ `24`) |
| Springs, física, interrumpibilidad, View Transitions, curvas de firma | `41-CRAFT-DE-ANIMACION.md` |
| Micro-craft mecánico (overflow/min-w-0, forms, touch, dark robusto, bundle) | `43-MICRO-CRAFT-Y-EJECUCION.md` |
| Gráficos, dashboards, visualización de datos | `17-VISUALIZACION-DATOS.md` |
| Tokens CSS completos y patrón reduced-motion | `10-DESIGN-TOKENS.md` |
| Copy funcional (verbos, errores, labels, formato) | `42-UX-WRITING.md` |
| Copy y visuales de conversion para landing/paywall/checkout | `52-COPY-VISUALES-CONVERSION.md` |
| Subir de MVP básico a producto (anti-vacío, anti-plano, rúbrica /40) | `32-DEL-MVP-AL-PRODUCTO.md` + `RUBRICAS-DE-PANTALLA.md` |

---

## 2. LOS NÚMEROS (no interpretables — úsalos tal cual)

### Tipografía — 4 niveles de jerarquía
```
N1 DISPLAY (protagonista, 1 por pantalla): 28-40px · 700 · lh 1.1 · tracking -0.02em
N2 TITLE (apoyo directo, 1-2 por pantalla): 17-22px · 600 · lh 1.2-1.3
N3 BODY (contexto):                         15-16px · 400 · lh 1.5
N4 LABEL/CAPTION (metadata):                12-13px · 500 · lh 1.4 · color secundario
```
- Máximo 3 tamaños por pantalla. Saltos perceptibles (32/22/16/13), nunca 28 junto a 26.
- Máximo 2 familias: 1 display con carácter + 1 sans legible. Jerarquía por TAMAÑO, no por peso.
- Texto por pantalla: 1 titular (≤8 palabras) + 1 subtitular (≤3 líneas). Bloques de cuerpo ≤3-4 líneas. Labels de 1-2 palabras.
- Cifras que cambian: `font-variant-numeric: tabular-nums`. Titulares: `text-wrap: balance`. Elipsis `…`, nunca `...`.
- En superficies de conversión (landing/onboarding/paywall) aplica la JERARQUÍA DE ÉNFASIS (`55`): titular bold completo + 1-3 palabras clave en acento; subtitular con 2-4 palabras en semibold. Un titular plano donde nada resalta no pasa el cierre.

### Espaciado — escala única y mecánica
```
SOLO estos valores: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64  (prohibido 13, 15, 18, 22, 30…)
— única excepción: el margen lateral de pantalla puede ser 16 o 20 (uno solo por app, como
token dedicado).
Si dudas entre dos → el mayor (más aire = más premium).
```
- **Interno ≤ externo**: el padding de un elemento ≤ la separación con sus vecinos (card con padding 16 → gap entre cards ≥16).
- Relacionados juntos (gap 8-12) · grupos distintos lejos (24-32). NUNCA espaciado uniforme entre todo.
- Padding horizontal simétrico (izq=der). Márgenes laterales idénticos en TODA la app (16 o 20, uno solo). Line-height múltiplo de 4.
- Cards y CTA primario llenan el ancho en mobile; nada pequeño flotando con hueco muerto al lado.
- Shell de app con bottom-nav: `min-h-dvh` + flex-col, contenido `flex-1`, nav al fondo. NUNCA `min-h-full` sin `h-full` en el padre. Cero vacío muerto.

### Densidad máxima por pantalla
```
Bloques en primera vista: 3-4 · Acciones: 1 primaria + máx 2 secundarias · Nav: 3-5 destinos
Métricas destacadas: 3-4 · Campos de form visibles: 5-7 · Filtros desde 8-10 ítems · Paginar a 20-25
```
- Excepción producto-de-inteligencia (apps de IA, dashboards, finanzas, salud): la pantalla necesita ≥3 señales visibles de valor (datos reales, razonamiento, estado inferido, relaciones). Densidad con CONTENIDO, jamás con adorno — los íconos decorativos siguen prohibidos.

### Color — regla cromática
```
60-30-10: 60% neutro dominante (fondos) · 30% neutro secundario (texto/UI) · 10% acento
Acento: SOLO en la acción primaria y el dato clave. MÁXIMO 1 de marca (2 con razón funcional real).
```
- Neutros: una sola familia, con tinte sutil hacia el hue del acento (croma 0.005-0.015) — nunca gris puro de Tailwind.
- Casi-negro con tinte (#0A0A0B–#14141A), jamás #000. Casi-blanco cálido (#F5F2EC / #F5F5F7), jamás #FFF. (Hex ilustrativos, NO copiar: deriva los tuyos con `16`/`29`.)
- Semánticos (verde/rojo/ámbar) solo en su función; todo estado lleva además ícono o texto (daltonismo).
- Contraste medido, no asumido: ≥4.5:1 texto normal · ≥3:1 texto grande y UI.
- Dark: elevar con superficies más claras (no sombras); reducir saturación del acento 10-20%. Claro: sombra sutil `0 1px 3px rgba(0,0,0,.08)`.
- Fondo con profundidad (mesh/radial sutil de baja saturación), nunca fill plano — ni negro plano ni beige plano.
- Al cerrar: AUDITAR colores de toda la app y recortar los que se colaron.

### Movimiento — duraciones y curvas exactas
```
Tap/press: 80-150ms · Toggle/hover: 150-200ms · Aparición: 200-300ms · Pantalla/modal: 300-400ms
Celebración: 400-600ms spring (SOLO hitos reales) · Nada >500ms bloqueante · Linear solo en loops
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1)      ← el default para casi todo
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)  ← solo celebración
```
- Árbol de decisión: ENTRA o SALE de la UI → ease-out · SE MUEVE dentro de la pantalla → ease-in-out · hover/color → ease · progreso constante → linear.
- Stagger de entrada: 50-80ms entre elementos en cada pantalla principal.
- Animar SOLO `transform` y `opacity` (jamás `transition: all`). Animación >300ms = interrumpible.
- Press de botón: scale 0.97 + tono más oscuro, instantáneo; retorno 150ms ease-out. Un botón que no reacciona se siente roto.
- Toggles/menús que se repiten: `transition` (interrumpible y redirigible), no `@keyframes` (reinicia).
- `prefers-reduced-motion`: quitar movimiento/posición, CONSERVAR fades y color. Nunca el nuke global a 0.01ms.

### Componentes — alturas y radios
```
Botón: 48-52px (táctil ≥44px) · Input: 48-56px · Tab bar: 56-64px + safe-area · Anillo de progreso: 8-12px grosor
Radio: UNO por tipo, consistente en toda la app — cards 16-20px · botones 12-16px · chips 8px
```

---

## 3. DOCTRINAS RESUELTAS (versión canónica — deroga lo que la contradiga)

**(a) Salidas SIEMPRE con `ease-out`.** Entradas Y salidas de UI usan ease-out: arranca rápido = se siente responsivo; un ease-in al salir "se queda pegado". (`10` y `14` ya están alineados: ease-out para entradas, ease-in solo para elementos que SALEN de la pantalla). `ease-in` solo para algo que sale de pantalla y no vuelve, como decisión deliberada.

**(b) Umbral de loading.** `<100ms` → nada. `100ms-1s` → spinner inline EN el elemento + bloquear doble-tap (sin bloquear la pantalla). `>1s` → skeleton con la forma exacta del contenido + shimmer (CLS=0). `3s+` → añade progreso y botón de cancelar. El spinner genérico de página completa sigue **prohibido** en todos los casos. IA de texto: skeleton hasta el primer token, luego streaming con cursor de 2px a 500ms.

**(c) Longitud de onboarding: la define la estrategia de `02B` según nicho.** B2B / herramienta técnica → ≤5 pantallas (ideal 2-3), directas al valor. B2C emocional (bienestar, fitness, finanzas personales) → puede ser extenso, con micro-compromisos que construyen inversión antes del paywall (estilo Cal AI/Noom). El "máx 3 pasos" universal de `03` queda **derogado**. La decisión se toma en la Sesión 1 y se documenta en ESTADO.md. Invariantes en ambos casos: acción real en el primer minuto y valor visible antes del registro.

**(d) El modo claro/oscuro SE DERIVA, nunca se asume oscuro.** Lo decide el arquetipo + el mundo del sujeto (`16`). Oscuro-por-reflejo es EL default de IA; claro/editorial suele ser más distintivo hoy. El dark-first de `10`/`29` es punto de partida técnico de los tokens, no una obligación estética.

**(e) UNA familia de curvas de easing por app.** O los tokens de `14` (el workhorse seguro) o las curvas de firma de `41` (más agresivas, ej. `cubic-bezier(0.32,0.72,0,1)` para sheets). La firma se adopta conscientemente en la ficha de dirección de arte o no se usa. Prohibido mezclar familias en la misma pantalla.

---

## 4. LA LISTA ANTI-SLOP UNIFICADA (la única — eliminar toda señal o justificarla)

**La receta del "look IA" (si tu propuesta marca 3+, ES el genérico → recházala y re-deriva):**
```
🚩 Fondo oscuro elegido por reflejo + acento neón (morado/cian)
🚩 Glow en botones/íconos regado (no en UN dato/acción)
🚩 Tarjeta glass/blur sobre el contenido + orbe de gradiente de fondo
🚩 #000 puro de fondo · #FFF puro de texto
🚩 Gradiente morado-a-azul genérico · texto con gradiente en titulares
🚩 Jerarquía por PESO de fuente en vez de por TAMAÑO · paddings arbitrarios (15px, 23px)
```

**Prohibiciones por defecto (los tics que delatan que nadie decidió):**
- Inter / Roboto / Arial / system-ui como fuente de marca. Space Grotesk y Geist: solo con razón escrita. Clash/Satoshi/Fraunces se están quemando: exigir tratamiento propio de la display o buscar una menos usada.
- Emojis como íconos.
- Acento en 5 sitios (no significa nada) · cards idénticas en grid infinito sin jerarquía · la plantilla "métrica héroe" repetida igual en cada card.
- **Cards anidadas dentro de cards** (contenedor dentro de contenedor dentro de contenedor): el tell 2026 más común del dashboard-IA. Aplanar — el espacio en blanco y la alineación agrupan mejor que un borde/fondo por cada nivel. Una card DENTRO de otra necesita una razón real, no ser el reflejo de "envolver todo".
- **Paleta tímida y repartida** (varios colores suaves en proporciones parejas, sin un dominante claro): se ve indecisa. Un color dominante + UN acento afilado > cinco pasteles equilibrados.
- Franja vertical de color en cards/alerts como "acento" · eyebrows en mayúsculas sobre CADA sección (en APP INTERNA; en landing el kicker del 55 es legítimo — máx 1 por sección; ver MAPA-DE-AUTORIDAD) · marcadores 01/02/03 decorativos.
- Glassmorphism decorativo (blur en cosas que no flotan) · combos quemados: crema+serif+terracota, casi-negro+verde ácido único, hairlines+radio 0+todo gris.
- Popover que crece desde el centro (transform-origin va anclado al trigger) · aparecer desde scale(0) (empezar en 0.95+fade) · `transition: all` · hover pegado en touch (gatear con `@media (hover: hover)`).
- Copy genérico ("Bienvenido", "Dashboard") · lorem ipsum (diseñar SIEMPRE con contenido real del dominio).
- Números desalineados de sus labels · ícono activo del mismo color que su contenedor · CTA disabled como pill muerto al 50%.

**El matiz que gobierna la lista:** todo lo anterior está prohibido **como reflejo, no como técnica**. Cualquier ítem se levanta SOLO con una razón escrita en la ficha ("cripto-forajido → el neón ácido SÍ es su mundo") acompañada de una referencia positiva concreta. El pecado no es usar glass o neón: es gastar un eje libre del brief en el default del modelo.

**Obligación positiva — ≥1 dispositivo ownable** más allá de "fondo + 1 acento": una textura/grano sutil, fotografía o ilustración con carácter, un tratamiento propio de la display (tracking marcado, peso inusual, mayúsculas), una 2ª nota de color con intención. Sin al menos uno, el diseño se siente plano aunque los hex estén bien.

**Los 2 tests anti-slop:**
1. **Intercambiabilidad (endurecido, de `16`):** "¿Este brand kit se distingue de TODA otra app hecha con IA y de las otras apps de este SO?" Si dos apps podrían intercambiar paleta+tipografía sin que se note, ninguna tiene identidad → rederivar del mundo del sujeto (`16` PASO 0.45).
2. **Genericidad (detecta tu propio reflejo):** por cada decisión grande, "¿tomaría esta MISMA decisión en otro proyecto del mismo tipo?" Si sí, es un default disfrazado, no una elección.

---

## 5. PROTOCOLO POR CAPAS (orden obligatorio — nunca todo de un golpe)

**Antes de la capa 1: verificar la secuencia de producto.** Si la pantalla pertenece a una app nueva,
confirmar que respeta `SECUENCIA-MAESTRA-CONSTRUCCION.md`: ventas -> onboarding -> paywall ->
login/auth -> app interna. No diseñar un dashboard interno como primera pantalla del producto.

**1. Layout y jerarquía (sin color aún).** Define el objeto principal único, asigna nivel 1-4 a cada elemento, verifica los máximos de densidad y la estructura del viewport (min-h-dvh, nav al fondo, cero vacío muerto). Toda pantalla responde "¿qué sigue?" con UN paso obvio; CTAs en el tercio inferior (thumb zone).

**2. Sistema visual.** Aplica tokens, la escala tipográfica de 4 niveles y la escala única de espaciado. Verifica interno≤externo, simetría, alineación a rejilla y contraste medido. Radio de bordes consistente por tipo.

**3. Color con intención.** Neutros con tinte de una sola familia + el acento SOLO en la acción/dato clave (60-30-10). Fondo con profundidad, superficies elevadas, semánticos en su función. Audita los colores que se colaron.

**4. Movimiento.** Stagger de entrada, feedback en cada tap, transiciones entre pantallas, y las 7 baseline (sección 6). Una sola familia de curvas, solo transform/opacity, reduced-motion respetado.

**5. Auditoría anti-slop.** Recorre la sección 4 completa: elimina cada señal presente o escribe la razón que la justifica. Verifica el dispositivo ownable y los 2 tests anti-slop.

**6. Crítica final.** Abre la pantalla RENDERIZADA a 375px y mírala. Recorre el checklist canónico (sección 7) y aplica los 2 tests finales (sección 8). Sin esto, la pantalla NO está lista aunque compile.

---

## 6. LAS 7 ANIMACIONES BASELINE (piso no negociable — sin ellas la pantalla está incompleta)

```
1. STAGGER de entrada en cada pantalla principal — 50-80ms entre elementos, fade + translateY(8-12px).
2. CONTEO ANIMADO de números héroe — cuenta de 0 al valor en 600-800ms, nunca estático.
3. DIBUJADO de anillos y barras — strokeDashoffset animado; barras crecen escalonadas.
4. FEEDBACK DE TAP en todo lo interactivo — <150ms, whileTap scale 0.97.
5. TRANSICIÓN entre tabs/pantallas — fade + slide sutil 200-400ms ease-out, nunca corte seco.
6. MODALES y bottom sheets — aparición suave desde abajo, 300ms ease-out.
7. CELEBRACIÓN en hitos reales — spring 400-600ms (opcional Lottie), SOLO hitos reales.
Todas respetan prefers-reduced-motion (fades sí, movimiento no).
Stack: Motion (motion/react) como base · Lucide + Phosphor (fill=activo) · CSS para lo simple.
```

---

## 7. EL CHECKLIST DE CIERRE DE DISEÑO CANÓNICO

Este checklist **reemplaza a todos los demás** para cerrar una pantalla (los módulos conservan los suyos solo como referencia profunda). Cada ítem es binario y se verifica mirando o midiendo. Si uno falla → corregir antes de declarar lista.

```
RENDER Y ESTRUCTURA
[ ] 1.  Miraste la pantalla RENDERIZADA a 375px (screenshot real — "el código se ve bien" no cuenta)
[ ] 2.  Shell min-h-dvh, nav al fondo, cero vacío muerto, cero scroll horizontal
[ ] 3.  UN objeto principal dominante y máximo 3 tamaños de fuente en pantalla
[ ] 4.  Densidad correcta: 3-4 bloques, 1 primaria + ≤2 secundarias (o ≥3 señales de valor si producto-inteligencia)
[ ] 4b. Si es app interna: 3-5 secciones maximo en la nav, 1 protagonista principal por seccion y cero secciones duplicadas

ESPACIADO Y COLOR
[ ] 5.  Todo espaciado sale de 4·8·12·16·24·32·48·64; interno≤externo; padding simétrico
[ ] 6.  60-30-10 cumplida; acento SOLO en acción/dato clave; cero colores colados (auditado)
[ ] 7.  Contraste medido ≥4.5:1 texto / ≥3:1 UI; ningún estado comunicado solo por color
[ ] 8.  Fondo con profundidad (no fill plano) y superficies elevadas; ni #000 ni #FFF puros

TIPOGRAFÍA Y DETALLE
[ ] 9.  Máx 2 familias; display con carácter y tratamiento propio (jamás Inter/Roboto de marca)
[ ] 10. Radio de bordes idéntico por tipo de componente en toda la pantalla
[ ] 11. Números centrados ópticamente con sus labels; chips/badges abrazan su contenido (w-fit, sin hueco)
[ ] 12. tabular-nums en cifras que cambian · … no "..." · text-balance en titulares
[ ] 13. min-w-0 + truncate/line-clamp en texto variable; probado con contenido corto y larguísimo

MOVIMIENTO
[ ] 14. Las 7 baseline presentes, verificadas UNA POR UNA (sección 6)
[ ] 15. Solo transform/opacity animados; UNA familia de curvas; popover con origin en el trigger; sin scale(0)
[ ] 16. prefers-reduced-motion respetado (movimiento fuera, fades dentro)
[ ] 17. Ícono de navegación activo visible (fill/acento), nunca tapado por su fondo

ESTADOS Y FEEDBACK
[ ] 18. Loading según umbral: skeleton con forma para >1s (CLS=0); jamás spinner de página completa
[ ] 19. Existen TODOS los estados: empty (con CTA que activa) · loading · success · error · disabled · offline
[ ] 20. CTA héroe VIVO (nunca pill al 50%), reconocible en <3s; feedback en todo lo interactivo
[ ] 21. Contenido dinámico anunciado (aria-live/role=status); áreas táctiles ≥44px; focus visible

COPY
[ ] 22. Botones nombran su consecuencia ("Guardar cambios", no "Enviar"/"OK"); mismo verbo en reposo→cargando→éxito→error
[ ] 23. Errores dicen QUÉ pasó + QUÉ hacer; empty states dirigen a la primera acción (nunca "No hay datos")
[ ] 24. Copy específico del producto en lenguaje del usuario (nada de "Bienvenido"/"Dashboard"/jerga)
[ ] 24b. Si es pantalla de venta/upgrade: headline <=10 palabras, subtitulo <=2 lineas mobile, visual vende contraste/perdida/desbloqueo/progreso/prueba, y logo/nombre permite volver

ANTI-SLOP Y FIDELIDAD
[ ] 25. Sección 4 recorrida: cero señales sin justificación escrita + ≥1 dispositivo ownable presente
[ ] 26. SOLO si hubo referencia del usuario: TEST DE FIDELIDAD pasado (screenshot 375px al lado de
        la referencia — mismo modo · hue del acento en la misma familia · misma clase de display ·
        radios ±4px · misma densidad · misma lógica de sombras; ≥2 fallas → corregir tokens y
        re-renderizar). Comparación reportada en el cierre. (Protocolo en 16, inicio)
```

---

## 8. LOS TESTS FINALES (después del checklist, antes de declarar lista)

**Test 1 — Entrecerrar los ojos.** Mira la pantalla con los ojos entrecerrados: debe leerse un claro 1 → 2 → 3 → 4 (protagonista → apoyo → contexto → metadata). Si todo pesa igual, la jerarquía falló → volver a la capa 1.

**Test 2 — Quitar el logo.** Sin el logo, ¿esto parece obra de un estudio premium o un template/app de IA genérica? ¿Se distingue de los competidores del nicho, de toda otra app hecha con IA y de las demás apps de este SO? Si no → la identidad falló → rederivar del mundo del sujeto (`16` PASO 0.45).

**Test 3 — Fidelidad a la referencia (SOLO si el usuario dio imagen de referencia).** Pon el screenshot a 375px AL LADO de la referencia: ¿mismo modo, hue del acento en la misma familia, misma clase de display, radios ±4px, misma densidad, misma lógica de sombras? ≥2 fallas → corregir tokens y re-renderizar (protocolo REFERENCIA=CONTRATO, `16` inicio). En este caso el Test 2 se subordina: parecerse a la referencia del usuario NO es falta de identidad — es el contrato.

Si los tests pasan y el checklist está completo: la pantalla está lista. Reporta con evidencia (ruta del screenshot + veredicto del revisor-visual: /40 usabilidad Y /20 craft + comparación de fidelidad si aplica).
