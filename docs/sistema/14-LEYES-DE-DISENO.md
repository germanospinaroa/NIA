# LEYES DE DISEÑO — Especificaciones Exactas, No Interpretables

> **Cuándo cargar este archivo:**
> - SIEMPRE que se genere o modifique cualquier interfaz (junto con `05-CREACION.md`, `10-DESIGN-TOKENS.md`, `11-DISENO-EMOCIONAL.md`)
> - Es el más importante para evitar el "look de app hecha con IA"
>
> **Por qué existe:** La causa #1 del diseño genérico no es el modelo de IA — es que recibe principios vagos ("buena jerarquía") en vez de especificaciones exactas ("título 28px/700, label 13px/500 gris"). La experiencia acumulada del sistema es inequívoca: las especificaciones con números producen UI notablemente más pulida que las órdenes con adjetivos. Este archivo convierte cada principio en un número que no se puede malinterpretar.

---

## LOS 12 MANDAMIENTOS (reglas duras, sin excepción)

1. **Un solo objeto principal por pantalla.** Una pantalla = una respuesta a "¿qué hago aquí?". Si hay dos cosas compitiendo por ser "lo importante", una está de más o va en otra pantalla. El objeto principal es visualmente dominante por tamaño, color y posición; todo lo demás recede.

2. **Máximo 5 destinos en la navegación principal.** Tab bar: 3-5 íconos, nunca más. Sidebar: 5-7 ítems máximo. Si necesitas más, agrupa o reconsidera el alcance.

3. **Máximo 3 tamaños de fuente por pantalla.** Display (lo grande), body (lo legible), label (lo pequeño). Un cuarto tamaño desordena la jerarquía. Material Design 3 define roles: display, headline, title, body, label — elige 3 por pantalla.

4. **El color de acento solo en la acción principal.** Si el naranja/azul/morado de marca está en 5 sitios, no destaca ninguno. Regla: el acento aparece en EL botón primario y casi nada más. Todo lo demás vive en neutros.

5. **Máximo 2 familias tipográficas.** Una display con personalidad + una sans legible. Y JAMÁS Inter, Roboto, Arial o system-ui como fuente de marca: son la huella digital del diseño genérico.

### LÍMITES DE TEXTO (minimalismo real — "menos es más")
El error de la IA es llenar de texto. En mobile, regla mecánica:
```
- Por pantalla: 1 titular + 1 subtitular (máx 2-3 líneas el subtitular). No más.
- Textos de cuerpo: máximo 3-4 líneas por bloque. Si necesita más, va en otra pantalla o
  se resume. Nadie lee párrafos en una app.
- Títulos cortos y potentes (≤8 palabras). Labels de 1-2 palabras.
- Cada palabra se gana su lugar: si una frase no aporta, se borra. El espacio vacío comunica.
- Una pantalla con mucho texto se siente como trabajo; una con poco, como una experiencia.
```

6. **Whitespace generoso, no decorativo.** El espacio vacío es estructura, no desperdicio. Si una pantalla se siente apretada, el problema casi nunca es "falta contenido": es "falta espacio". Densidad alta = se ve barato.

7. **Toda pantalla responde "¿qué sigue?" sin que el usuario piense.** Debe haber UN siguiente paso obvio, señalado visualmente. Si el usuario mira la pantalla y duda qué hacer, la jerarquía falló.

8. **Contraste real, medido.** Texto normal ≥4.5:1, texto grande ≥3:1, elementos de UI ≥3:1. El gris claro sobre fondo oscuro que "se ve elegante" suele fallar — medir, no asumir.

9. **El ícono activo se distingue sin desaparecer.** El estado activo de navegación se marca con color de acento o un fondo sutil — NUNCA pintando el ícono del mismo color que su contenedor (el error de la captura: ícono blanco sobre círculo blanco = invisible).

10. **Números y sus labels, perfectamente centrados/alineados.** Un número dentro de un anillo de progreso va centrado óptica y matemáticamente, con su label inmediatamente debajo, ambos como un grupo centrado. El desalineamiento es la señal #1 de "lo armó una máquina sin revisar".

11. **Acciones principales en el tercio inferior** (thumb zone). El pulgar alcanza cómodo la parte baja en una mano. CTAs primarios abajo; navegación y acciones secundarias arriba.

12. **Toca, responde en <100ms; transiciones 200-300ms; nada supera 500ms.** El movimiento es la señal de calidad que el usuario registra. Sin movimiento = se siente muerto. Movimiento lento = se siente pesado.

---

## ESPECIFICACIONES NUMÉRICAS (los números que Codex/Claude Code deben usar)

### Escala Tipográfica (mobile)
```
Display (número/título héroe):  28-40px / weight 700 / line-height 1.1 / letter-spacing -0.02em
Headline (título de pantalla):  22-28px / weight 700 / line-height 1.2
Title (título de sección/card): 17-20px / weight 600 / line-height 1.3
Body (texto normal):            15-16px / weight 400 / line-height 1.5
Label (etiquetas, metadata):    12-13px / weight 500 / line-height 1.4 / color secundario
Caption (lo más pequeño):       11-12px / weight 400 / color terciario
```
Regla: el salto entre niveles debe ser perceptible. Si display es 28 y headline 26, no hay jerarquía. Usa una escala con saltos claros (ej: 32 / 22 / 16 / 13).

Cuerpo de lectura: 45-75 caracteres por línea (`max-w-[65ch]` como referencia); labels probados con el idioma más largo del roadmap (pt-BR suele +20%).

**Relación con el límite de DESIGN-CORE ("máx 3 tamaños por pantalla", 4 niveles nombrados
display/title/body/label):** esta tabla de 6 es la PALETA completa disponible, no una obligación
de usar los 6 a la vez. En una pantalla dada, elegir máximo 3 de estos niveles (ej. Display + Body
+ Label, o Headline + Body + Caption) — Headline y Caption son variantes intermedias/menores para
casos puntuales, no un 4º y 5º nivel que compita con la jerarquía principal de esa pantalla.

### MICRO-TIPOGRAFÍA (los detalles que separan "pulido" de "borrador")

El tamaño y el peso son la mitad del trabajo; la otra mitad son los caracteres correctos. Reglas duras:

```
- Elipsis: usar … (U+2026), NUNCA tres puntos ...
- Comillas: tipográficas “ ” ‘ ’ (y ’ para apóstrofo), nunca las rectas " '
- Números en columnas/tablas/métricas: font-variant-numeric: tabular-nums
  (sin esto, las cifras "bailan" al actualizarse porque cada dígito tiene ancho distinto)
- Titulares: text-wrap: balance (reparte las palabras en líneas parejas, sin una viuda suelta)
- nbsp (espacio duro) entre número y unidad o en atajos: 10 km, ⌘ K, 5 GB
  (evita que "10" quede al final de una línea y "km" salte a la siguiente)
```

Esto es regla; el detalle completo (más casos, ligaduras, fracciones, guiones) está en `43-MICRO-CRAFT-Y-EJECUCION.md`.

### Espaciado (sistema de 4/8px — todo es múltiplo de 4)
```
Padding interno de cards:        16-24px (nunca menos de 16)
Gap entre elementos relacionados: 8-12px
Gap entre secciones distintas:    24-32px
Margen lateral de pantalla:       16-20px (mobile)
Separación título → contenido:    8-12px
Separación contenido → acción:    16-24px
Alto de respiro entre bloques:    mínimo 24px para que "respiren"
```

### SISTEMA DE ESPACIADO MECÁNICO (la regla que arregla los huecos y la asimetría)

El error más común de la IA en layout no es estético — es no pensar el espacio. Estas reglas son MECÁNICAS, no interpretables. Seguirlas elimina cosas pequeñas, asimétricas o con huecos ilógicos:

```
1. ESCALA ÚNICA — solo se permiten estos valores de espaciado (en px), nada intermedio:
   4 · 8 · 12 · 16 · 24 · 32 · 48 · 64
   Prohibido 13, 15, 18, 22, 30... Si dudas entre dos, elige el mayor (más aire = más premium).

2. REGLA INTERNO ≤ EXTERNO (la que elimina huecos ilógicos):
   El espacio DENTRO de un elemento (padding) debe ser ≤ al espacio que lo SEPARA de otros
   (margin). Ejemplo: si una card tiene 16px de padding interno, la separación entre cards
   debe ser ≥16px (24px o 32px). Así los grupos se leen como grupos y no hay huecos raros.

3. PROXIMIDAD = RELACIÓN: elementos relacionados van cerca (gap 8-12px); elementos de distinto
   grupo van lejos (gap 24-32px). El espacio comunica qué pertenece a qué. NUNCA espaciado
   uniforme entre todo (eso borra la jerarquía y crea el look "plano de IA").

4. SIMETRÍA Y ALINEACIÓN OBLIGATORIAS:
   - Padding horizontal IGUAL en ambos lados (si izq=16, der=16). El error de la captura.
   - Todo alineado a una rejilla: los bordes izquierdos de los elementos coinciden.
   - Márgenes laterales de pantalla idénticos izq/der en TODA la app (16 o 20px, uno solo).
   - Centrado real: un número dentro de un anillo va centrado óptica Y matemáticamente.

5. LLENAR EL ANCHO CON INTENCIÓN: en mobile, las cards y botones primarios ocupan el ancho
   disponible (menos los márgenes laterales). NO dejar elementos pequeños flotando con huecos
   muertos al lado. Si algo no llena el ancho, es una decisión deliberada, no un descuido.

6. ESTRUCTURA DE APP / VIEWPORT (el bug de layout #1): el app-shell de una app con bottom-nav DEBE
   llenar el viewport — `min-h-dvh` + flex-col, contenido `flex-1`, nav al fondo; html/body con la
   cadena de altura. NUNCA `min-h-full` sin `h-full` en el padre (= porcentaje contra altura auto =
   se ignora = nav flotando a media pantalla con vacío abajo: el bug real más común). Y si una
   pantalla tiene poco contenido, NO estirar ni dejar un gran vacío — centrarla o LLENARLA DE VALOR
   (chips, medidores, estado, confianza — ver `32` y `15`). Un vacío muerto abajo se ve roto.
   Verificar a 375px: ¿la nav está al fondo? ¿hay hueco sin propósito? Detalle en `32-DEL-MVP-AL-PRODUCTO.md`.

7. line-height en múltiplos de 4 para ritmo tipográfico consistente.
```

Test mecánico (la IA debe verificarlo): ¿todos los valores de espaciado salen de la escala
única? ¿el padding horizontal es simétrico? ¿los márgenes laterales son idénticos en toda la
app? ¿hay algún hueco muerto que no sea una decisión deliberada? Si alguna falla → corregir.

#### CAUSA RAÍZ CSS DEL ESPACIADO ROTO (cuando los números están bien pero se ve torcido)

A veces el espaciado en el código es correcto y aun así el padding sale asimétrico en pantalla. La causa casi siempre es **especificidad CSS que se pisa**: un selector por *tipo* (`.section { padding: 16px 24px }`) y otro por *elemento concreto* (`.cta { padding: 16px }`) aplican al mismo nodo, y gana el de mayor especificidad u orden, dejando un lado distinto del otro.

```css
/* ❌ El .cta hereda un padding-left de .section y se le pisa solo el lateral derecho */
.section { padding-left: 24px; padding-right: 24px; }
.cta     { padding-right: 16px; }   /* ← asimetría involuntaria: izq 24, der 16 */

/* ✅ Setear el shorthand completo en el elemento dueño del espaciado, sin reglas que pisen un solo lado */
.cta { padding: 16px; }
```

Regla de diagnóstico: si ves padding asimétrico, NO ajustes el número a ojo — inspecciona qué reglas aplican al nodo (DevTools → Computed) y elimina la que pisa un solo lado. El número casi nunca era el problema.

### Componentes
```
Radio de bordes:        elige UNO y mantenlo — cards 16-20px, botones 12-16px, chips 8px
                        (consistencia absoluta: si las cards son 16px, TODAS son 16px)
Altura de botón:        48-52px (área táctil ≥44px obligatoria)
Altura de input:        48-56px
Altura de tab bar:      56-64px + safe area inferior
Grosor de anillo:       8-12px (progreso circular)
Sombra (modo claro):    0 1px 3px rgba(0,0,0,0.08) — sutil, no dramática
Profundidad (modo oscuro): usar superficies más claras (no sombras) para elevar
```

### Densidad por Pantalla (anti-saturación)
```
Cards/bloques visibles sin scroll:  máximo 3-4 en la primera vista
Acciones por pantalla:              1 primaria + máx 2 secundarias
Métricas en un dashboard:           máximo 3-4 destacadas; el resto, un nivel abajo
Items de lista antes de paginar:    20-25
Campos de formulario visibles:      5-7 máximo (si hay más, dividir en pasos)
```

#### DENSIDAD POR TIPO DE PRODUCTO (el matiz crítico al límite "máx 3-4 bloques")

El minimalismo es el **fallback seguro, NO una ley universal**. El límite de 3-4 bloques aplica al default; hay una clase de producto donde *invertirlo* es lo correcto.

Cuando el VALOR CENTRAL del producto es **inteligencia / datos / contexto** (apps de IA, dashboards, copilotos, finanzas, salud), una pantalla casi vacía no comunica el valor — lo esconde. Un reloj con un solo botón no expresa inteligencia. Regla invertida para estos productos:

```
Cada pantalla necesita ≥3 SEÑALES VISIBLES de diferenciación, por ejemplo:
  - datos reales (no decorativos): cifras, series, comparaciones que importan
  - fragmentos del razonamiento: "por qué" detrás de una sugerencia
  - estado inferido: lo que el producto dedujo del contexto del usuario
  - relaciones contextuales: cómo se conecta este dato con otro
```

Cuidado capital: **densidad CON CONTENIDO, no con adorno.** Los íconos decorativos siguen prohibidos (ver Anti-Slop). Llenar una pantalla de IA con iconitos no es densidad de valor, es ruido. La densidad correcta es información que el usuario quiere ver, no decoración que finge sustancia.

> Esto es clave porque el target del SO son apps de IA: para ellas, "limpio pero vacío" se lee como "tonto". El default minimalista debe ceder ante producto-de-inteligencia.

---

## SISTEMA DE MOVIMIENTO (valores exactos, basados en investigación 2026)

```
Tap / press feedback:        80-150ms  | ease-out | scale(0.97) o cambio de opacidad
Toggle / switch:             150-200ms | ease-out
Hover (desktop):             150ms     | ease-out
Aparición de elemento:       200-300ms | ease-out | fade + translateY(8-12px)
Transición entre pantallas:  300-400ms | ease-out (entra Y sale)
Modal / bottom sheet:        300ms     | ease-out | desde abajo en mobile
Celebración / éxito:         400-600ms | spring (bounce 0.3) | SOLO en hitos reales
NUNCA:                       >500ms en algo que bloquee al usuario; linear en nada orgánico
```

### Reglas de movimiento
- **60% de las animaciones usan ease-out** (`cubic-bezier(0.16, 1, 0.3, 1)`) — es el "body text" del movimiento: confiable, invisible, correcto.
- **Spring solo para celebración** (overshoot que se siente vivo). Un spring en un tap rutinario se siente como demo técnica.
- **Entrada escalonada (stagger)** en la primera pantalla: los elementos aparecen en secuencia (50-80ms entre cada uno), no todos de golpe. Es la diferencia más barata entre "estático" y "premium".
- **Nada bloquea al usuario**: si una animación dura >300ms, debe poder interrumpirse tocando.
- **`prefers-reduced-motion`**: una parte real de usuarios lo activa (sensibilidad vestibular: mareo/náusea con el movimiento; crece con la edad). Respetarlo SIEMPRE — pero NO es "cero animación": conservar fades/color que ayudan a comprender, quitar solo movimiento/posición. Patrón correcto en `10-DESIGN-TOKENS.md`.

### ÁRBOL DE EASING PERCEPTUAL (el PORQUÉ de cada curva)

No memorices curvas: decide por cómo se SIENTE. La clave perceptual es que `ease-out` arranca rápido = feedback inmediato. Un dropdown con `ease-in` a 300ms se SIENTE más lento que el mismo dropdown con `ease-out` a 300ms (misma duración real, distinta percepción), porque `ease-in` arranca lento y el usuario "espera" antes de ver respuesta.

```
¿Qué hace el elemento?
├─ ENTRA o SALE de la UI (aparece/desaparece, dropdown, modal, toast) → ease-out
│     (arranca rápido = se siente responsivo; aplica a entradas Y salidas)
├─ SE MUEVE dentro de la pantalla (reordenar, mover de A a B en viewport) → ease-in-out
│     (acelera y desacelera = movimiento natural de un objeto físico)
├─ HOVER / cambio de color / micro-feedback → ease (suave, neutro)
└─ Progreso CONSTANTE (spinner, barra de carga, loop) → linear
```

- **`ease-in` casi nunca en UI.** Sirve para algo que "se va y no vuelve" (raro). En la práctica, si dudas, `ease-out` — es el default tanto para entradas como para salidas de UI.
- Detalle profundo (springs, duración por distancia, interrupciones) en `41-CRAFT-DE-ANIMACION.md`.

```css
/* Curvas nombradas — usar estos tokens, no valores sueltos */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);     /* entradas Y salidas de UI, el workhorse */
--ease-in: cubic-bezier(0.4, 0, 1, 1);          /* solo casos deliberados: "sale y no vuelve" */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* celebración */

/* Entrada escalonada de la primera pantalla */
@keyframes enter {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.stagger-1 { animation: enter 0.4s var(--ease-out) 0.05s both; }
.stagger-2 { animation: enter 0.4s var(--ease-out) 0.12s both; }
.stagger-3 { animation: enter 0.4s var(--ease-out) 0.19s both; }
.stagger-4 { animation: enter 0.4s var(--ease-out) 0.26s both; }
```

> Estas son las curvas base; la familia alternativa del `41` es una FIRMA opcional — se adopta una u otra por app, nunca ambas.

---

## RENDIMIENTO PERCIBIDO Y FEEDBACK (especificaciones exactas)

El movimiento y los estados de carga son la señal de calidad #1 que registra el usuario. (Patrones completos de rendimiento percibido en `15-PATRONES-UX.md`; aquí los valores visuales exactos.)

### Ciclo de vida del botón (los 3 estados, con números)
```
NORMAL:        fondo = color base | sombra = elevación sutil | escala 100%
PRESSED (0-100ms): fondo = un tono más oscuro | sombra = aplanar a 0 | escala 97-98% | instantáneo
RELEASE (100-250ms): vuelve a normal | sombra reaparece | escala 100% | 150ms ease-out
                     opcional: ripple/destello de éxito
```
Un botón que no cambia al tocarlo se siente roto. El feedback de press es obligatorio.

### Skeleton vs spinner (regla dura)
```
Spinner genérico = ANTI-PATRÓN en 2026. Prohibido para carga de contenido principal.
Skeleton screen = formas placeholder con las dimensiones del contenido real + shimmer sutil.
Regla: cuando llega el contenido, NADA salta (CLS = 0). El skeleton reserva el espacio exacto.
```

### Profundidad y tendencias visuales 2026 (usar con propósito, no de adorno)
```
Glassmorphism:  superficies translúcidas con blur — solo para capas flotantes (overlays,
                barras, tarjetas elevadas) que deben sentirse "encima". backdrop-filter: blur(12-20px).
                NUNCA en texto de cuerpo (mata legibilidad).
Bento grid:     bloques de distinto tamaño en cuadrícula — útil para dashboards donde cada
                bloque tiene peso distinto. El bloque principal es más grande (jerarquía por tamaño).
Profundidad por capas: en modo oscuro, elevar con superficies MÁS CLARAS, no con sombras.
                Cada nivel de elevación = un paso más claro de gris.
Low-stimulus UI: la tendencia dominante — calma sobre ruido. Menos colores, más espacio,
                movimiento sutil. Si dudas entre más o menos, elige menos.
```

## FÓRMULA DE JERARQUÍA VISUAL

Para que el ojo del usuario sepa dónde mirar, en orden, sin pensar. En cada pantalla, asignar a cada elemento un nivel y respetar su tratamiento:

```
NIVEL 1 — El protagonista (1 por pantalla):
  Tamaño grande (display) + peso 700 + color de máximo contraste o acento
  Posición dominante (centro o tercio superior del contenido)
  Ejemplo: el número de balance, el resultado generado, la acción del día

NIVEL 2 — Apoyo directo (1-2 por pantalla):
  Tamaño medio (title/headline) + peso 600 + contraste alto
  Ejemplo: título de sección, CTA primario

NIVEL 3 — Contexto (varios):
  Body + peso 400 + contraste medio
  Ejemplo: descripciones, valores secundarios

NIVEL 4 — Metadata (el fondo del escenario):
  Label/caption + color secundario/terciario + peso 500
  Ejemplo: fechas, unidades, etiquetas, porcentajes pequeños
```

Test: entrecierra los ojos mirando la pantalla. Si todo se ve igual de importante, la jerarquía falló. Debe haber un claro 1 → 2 → 3 → 4.

---

## DIAL DE INTENSIDAD: Compromiso de Color y Amplitud

La regla 60-30-10 dice *cómo proporcionar* el color, pero no *cuánto comprometerse*. Lo genérico nace de quedarse siempre en el punto medio tímido. Elegir un nivel de compromiso a propósito — y ser disciplinado en él:

```
NIVEL 1 — RESTRAINED (el default seguro): neutros con tinte + 1 acento ≤10% de la superficie.
          La regla 60-30-10 clásica. Correcto, calmado. El 80% de las apps viven aquí bien.
NIVEL 2 — COMMITTED: un color ocupa 30-60% de la superficie (no solo el botón — la sección,
          la card héroe, la barra). Más identidad, sigue siendo limpio. Ej: una pantalla cuyo
          héroe es un bloque del color de marca.
NIVEL 3 — FULL PALETTE: 3-4 colores con ROLES nombrados (no decorativos): cada uno significa algo.
          Requiere disciplina extra para no caer en ruido. Apps con datos/categorías.
NIVEL 4 — DRENCHED: la superficie ES el color (fondo de marca a pantalla completa). Audaz,
          memorable, arriesgado. Solo para marcas con personalidad fuerte y pantallas clave.
```

**Neutros con tinte (el detalle que se ve "caro"):** en vez de gris puro, empujar el neutro 0.005–0.015 de croma hacia el hue del acento. Imperceptible como color, pero hace que todo "pertenezca" a la misma marca. (Confirma la regla de "neutros con temperatura" del archivo 16.)

**Dial bolder ↔ quieter (cuando decidas ser audaz, comprométete — la timidez es lo genérico):**
```
Si vas BOLDER, hazlo de verdad (no a medias):
- Salto de escala tipográfica 3-5x entre niveles, no 1.5x (un héroe que DOMINA, no que "es un poco más grande").
- Contraste de pesos extremo: 900 junto a 200, no 600 junto a 400.
- Un solo color que se adueña del 60% de la superficie (nivel Committed/Drenched).
- Espacio dramático alrededor del héroe (en mobile: subir 1-2 escalones de la escala; en desktop/landing: 100-200px, no 20-40px).
- UNA entrada "firma" memorable, UNA sola vez (no animar todo: ver archivo 22).

Si vas QUIETER (low-stimulus, default 2026 para productividad/bienestar):
- Un solo acento muy contenido, mucho neutro, movimiento mínimo, tipografía de un solo peso.
- La calma ES la decisión. Pero igual con carácter (tipografía + neutro con tinte), no sosa.
```
> Regla: lo prohibido no es ser audaz ni ser sobrio — es el punto medio sin decidir. Elige el nivel del dial al definir la dirección de arte (archivo 16) y mantenlo en toda la app.

### COMPLEXITY MATCHING (el nivel del dial define DÓNDE va el rigor, no cuánta complejidad añadir)

Error frecuente: confundir "elegancia" con "añadir cosas". La elegancia NO nace de sumar complejidad. El nivel del dial no dice *cuánto decorar* — dice **dónde se concentra el rigor de ejecución**:

```
Dirección MINIMALISTA (Restrained/Quieter): exige PRECISIÓN absoluta en lo poco que hay.
   No hay nada que esconda el error → espaciado exacto, tipografía afinada, alineación perfecta,
   un solo detalle mal puesto se ve. El rigor va en la ejecución de cada elemento, no en cantidad.

Dirección MAXIMALISTA (Full Palette/Drenched): exige EJECUCIÓN ELABORADA y coherente.
   Más elementos en juego → el rigor va en que todo el sistema (roles de color, capas, ritmo)
   esté orquestado, no en simplificar.
```

Regla: subir el dial no autoriza a "rellenar"; baja el dial no autoriza a "descuidar". En ambos extremos el listón de ejecución es igual de alto, solo cambia hacia dónde apunta.

---

## UN OBJETO, NO UNA LISTA DE COSAS (estructura antes que contenido)

Cuando una pantalla "se siente desordenada" o parece "un montón de cosas sueltas", el reflejo es
mejorar cada bloque por separado. Casi nunca funciona: **el problema no es el contenido de los
bloques, es que son bloques.**

Cinco o seis tarjetas flotando, cada una con su sombra, su radio y su margen, no forman una
pantalla: forman una lista de objetos sin relación entre sí. El ojo cuenta islas.

```
❌ N tarjetas separadas por aire      → el ojo ve N objetos distintos
✅ 1 tarjeta con N secciones          → el ojo ve UN objeto con partes
   separadas por líneas de 1px
   y el MISMO padding en cada sección
```

**La regla:** si dos bloques hablan de lo mismo (el plan, el pedido, el perfil, el resultado),
**van dentro del mismo contenedor**, separados por hairlines y no por huecos. El aire separa cosas
distintas; la línea une partes de una misma cosa.

**Cómo saber cuál aplica:** ¿podrías ponerle un solo título a esos bloques juntos? Si sí, son un
objeto y hay que unirlos. Si no, son cosas distintas y el aire está bien.

Y la simetría del objeto no se declara: se mide (`12-FLUJO-AGENTICO.md`, "MEDIR EL LAYOUT").

---

## FALSA AFORDANCIA: lo que parece tocable, se toca

Un elemento decorativo con la forma de un control **es** un control a los ojos del usuario. La
combinación más peligrosa, porque reúne las tres señales de "botón" a la vez:

```
círculo o píldora  +  tamaño de área táctil (≈44px)  +  color de acción
= el usuario lo va a tocar, no importa que sea un adorno
```

En una pantalla con una sola acción importante, cada toque que no va a esa acción es un toque
perdido y un poco de confianza perdida ("toqué y no pasó nada"). Reglas:

- Los adornos no llevan el color de acción ni el tamaño de un control.
- Si un elemento decorativo necesita presencia, se le da con tamaño o posición, no con la
  apariencia de un botón.
- Y al revés: los controles reales sí llevan esas señales — no compartirlas con la decoración es lo
  que las mantiene significando algo.

Caso frecuente: insignias de "logro conseguido", íconos dentro de círculos de acento, y filas de
puntos decorativos. Todos se leen como tocables si copian el vestido de un control.

---

## ANTI-SLOP: Las Señales del Diseño "Hecho con IA"

**La lista anti-slop canónica y ÚNICA vive en `DESIGN-CORE.md` §4** — este archivo ya no mantiene
una copia propia (las copias divergen y terminan contradiciéndose). Recorrer la de DESIGN-CORE;
el porqué de cada señal de movimiento está en `41-CRAFT-DE-ANIMACION.md`, y las herramientas que
corrigen esas señales (fórmula de jerarquía, ritmo de espaciado, centrado óptico) viven arriba
en este mismo archivo.

---

## PROTOCOLO DE DISEÑO (orden obligatorio — nunca todo de un golpe)

La investigación es unánime: comprimir el diseño en un solo paso produce mediocridad. Secuencia:

1. **Layout y jerarquía primero** (sin color aún): ¿cuál es el objeto principal? ¿qué nivel tiene cada elemento? ¿la densidad respeta los máximos?
2. **Sistema visual**: aplicar tokens, escala tipográfica, espaciado. Verificar contraste.
3. **Color con intención**: neutros de base + acento solo en lo primario.
4. **Movimiento**: stagger de entrada, feedback de taps, transiciones.
5. **Auditoría anti-slop**: recorrer la lista canónica de `DESIGN-CORE.md` §4 y eliminar cada señal.
6. **Crítica final**: el test de entrecerrar los ojos + "¿se distingue de un template si quito el logo?".

Para apps existentes con diseño pobre: este protocolo se ejecuta como parte del Protocolo de Rescate (`12-FLUJO-AGENTICO.md`), capa por capa, verificando en cada una.

---

## CHECKLIST DE DISEÑO (aplicar a CADA pantalla antes de darla por buena)

```
JERARQUÍA
[ ] Hay UN objeto principal claramente dominante
[ ] Máximo 3 tamaños de fuente
[ ] El test de entrecerrar los ojos pasa (1→2→3→4 visible)
[ ] El usuario sabe "qué sigue" sin pensar

DENSIDAD
[ ] Máximo 3-4 bloques en la primera vista
[ ] 1 acción primaria + máx 2 secundarias
[ ] Whitespace generoso (nada apretado)

COLOR Y TIPOGRAFÍA
[ ] Acento SOLO en la acción primaria
[ ] Máximo 2 familias tipográficas, ninguna genérica (Inter/Roboto/system)
[ ] Contraste medido ≥4.5:1 (texto) / ≥3:1 (UI)
[ ] Fondo del modo DERIVADO en la Ficha, con profundidad real (nunca plano: 3 niveles base/elevado/hundido)

ALINEACIÓN Y DETALLE
[ ] Números centrados ópticamente con sus labels
[ ] Radio de bordes consistente en TODA la pantalla
[ ] Ícono de navegación activo visible (no tapado por su fondo)
[ ] Espaciado en múltiplos de 4/8

MOVIMIENTO
[ ] Stagger de entrada en la primera carga
[ ] Feedback <150ms en cada tap
[ ] Transiciones 200-400ms con ease-out
[ ] Solo se animan transform/opacity (nunca transition: all)
[ ] Popovers con transform-origin en el trigger; sin scale(0) inicial
[ ] Hover gateado con @media (hover: hover) para no pegarse en touch
[ ] prefers-reduced-motion respetado (fades sí, movimiento no — ver 10)

ANTI-SLOP
[ ] Recorrida la lista canónica de DESIGN-CORE §4 y eliminada (o justificada) cada señal
[ ] Test final: se distingue de un template sin el logo
```

> Este checklist es material de CONSULTA para subir un ítem flojo — el ÚNICO checklist que se
> recorre al cierre de pantalla es el de `DESIGN-CORE.md` §7 (regla de deduplicación de gates).
