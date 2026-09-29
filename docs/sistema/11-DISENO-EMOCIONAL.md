# DISEÑO EMOCIONAL — La Diferencia entre una App Genérica y una Premium

> **Cuándo cargar este archivo:**
> - Antes de construir (junto con `05-CREACION.md` y `10-DESIGN-TOKENS.md`)
> - Al pulir una app existente (junto con `07-PULIDO.md`)
> - Cuando la app "funciona" pero se siente genérica, fría, o "hecha con IA"
> - Este archivo define el TONO; el copy que vende/cobra (headline, paywall, bullets) vive en
>   `52-COPY-VISUALES-CONVERSION.md` — cargar ambos cuando la pantalla tiene que convertir.

## Objetivo
Una app que solo funciona no se diferencia de nada. Lo que vende, retiene y genera boca a boca es cómo SIENTE el usuario cuando la usa. Este archivo convierte una app funcional en una experiencia que la gente recuerda, recomienda y paga por mantener.

---

## LOS 3 NIVELES DEL DISEÑO EMOCIONAL (Norman) — resumen operativo

Teoría conocida; lo que importa es verificar los 3 en cada app:
- **Visceral** ("se ve increíble", se decide en <50ms): paleta con intención, tipografía con carácter, profundidad, animación de entrada. Test: screenshot de tu app junto a Revolut o Linear — si se ve plana o genérica, este nivel falla.
- **Conductual** ("se usa sin pensar"): acciones en 1-2 toques, feedback <100ms, undo en vez de confirmaciones, predictibilidad. Modelo Duolingo: el error se siente SEGURO, no punitivo.
- **Reflexivo** ("soy parte de algo"): progreso visible, identidad, logros compartibles. "Llevas 47 días de racha" → el usuario se siente disciplinado.

> **Sobre el ejemplo clásico de Phantom** ("gradientes de purple a blue" + "glassmorphism sutil"): válido cuando Phantom lo hizo (2021); hoy esa receta ES el cliché del diseño-IA — ver la Capa Anti-IA del `16`. La lección vigente es la INTENCIÓN emocional (que crear la wallet se sienta un momento, con su celebración), no la paleta.

La auditoría de los 3 niveles vive en la Capa 7 (abajo); los 3 adjetivos (Capa 1), la intensidad de celebración (Capa 3), la plantilla y la fórmula de 7 elementos siguen íntegros más abajo.

---

## IMPLEMENTACIÓN PRÁCTICA: 7 Capas de Emoción

### Capa 1: Personalidad de la App
Toda app tiene personalidad, incluso si no la defines a propósito. Si no la defines, la personalidad por defecto es "herramienta genérica sin alma."

**Ejercicio: Define la personalidad en 3 adjetivos**
Ejemplo:
- App de productividad: "Precisa, tranquila, confiable" (como un asistente senior)
- App de fitness: "Energética, motivadora, directa" (como un coach personal)
- App de finanzas: "Segura, elegante, clara" (como un banker suizo)
- App de educación: "Amigable, paciente, celebratoria" (como un buen profesor)
- App creativa: "Inspiradora, audaz, fluida" (como un director artístico)

**Estos 3 adjetivos definen TODO:**
- El tono del copy (formal/casual, entusiasta/sereno)
- La paleta de colores (vibrante/sobria, cálida/fría)
- Las animaciones (rápidas y enérgicas / suaves y fluidas)
- Los sonidos (si se usan)
- La mascota o avatar (si se usa)
- Los momentos de celebración (explosión de confetti vs. check sutil)

> Los 3 adjetivos NO se quedan en adjetivos: se **compilan** a números con la tabla del
> `COMPILADOR DE PERSONALIDAD` (más abajo). Sin la fila compilada en la Ficha de Dirección
> de Arte, la personalidad NO está definida — es solo una intención.

#### SISTEMA DE PERSONAJE E IDENTIDAD EMOCIONAL

¿Quién carga la emoción de la app? Duolingo tiene a Duo; Headspace tiene un orbe naranja; Linear no tiene a nadie — y las tres tienen identidad emocional fuerte. La mascota es UNA opción, no la default. Decidir con este árbol y anotarlo en la Ficha de Dirección de Arte:

```
¿MASCOTA/PERSONAJE SÍ O NO? — árbol de decisión por nicho

¿La app es de uso diario lúdico o de construcción de hábito con tono cercano
(idiomas, hábitos, fitness casual, educación, journaling, apps para niños/familia)?
  → SÍ suma: un personaje da rostro a la racha, al ánimo y a la culpa amable.

¿La app maneja dinero serio, salud clínica, trabajo B2B o datos sensibles
(finanzas, impuestos, salud mental clínica, legal, herramientas profesionales)?
  → NO: un personaje infantiliza y resta confianza justo donde más se necesita.
    La emoción la carga otra cosa (ver "SI NO HAY PERSONAJE" abajo).

¿Duda / punto medio (productividad personal, creatividad, bienestar suave)?
  → Default NO-personaje con forma abstracta de marca. Solo subir a personaje si
    los 3 adjetivos incluyen "juguetón/cercano/amigable" Y el ICP lo tolera (16).
```

**SI HAY PERSONAJE — spec mínima (sin esto, no se aprueba):**
```
1. FORMA BASE simple y geométrica, reproducible en 3 tamaños (24px ícono · 64-80px
   ilustración · 200px+ hero) sin perder identidad. Regla: si no puedes redibujarlo
   con 3-5 formas básicas (círculos, curvas, 1 rasgo distintivo), es demasiado complejo
   para mantener consistencia entre generaciones.
2. PALETA DEL PERSONAJE ligada a tokens: cuerpo = 1-2 colores del brand kit (acento o
   2ª nota), detalles en neutros de la escala. El personaje NUNCA introduce colores nuevos.
3. LOS 5 ESTADOS EMOCIONALES OBLIGATORIOS (mapean 1:1 a los momentos de 56):
   neutro (default/acompaña) · celebrando (hitos, M1-M3 de 56) · preocupado (racha en
   riesgo, M4 — preocupación suave, NUNCA enojo/decepción) · dormido (racha rota /
   inactividad, M5 — dormido se despierta; "muerto" o "llorando" PROHIBIDO) ·
   saludando (bienvenida y vuelta tras abandono, M6).
```

**Pipeline de producción con IA de imagen (consistencia entre poses):**
```
1. DESCRIPCIÓN CANÓNICA: escribir UNA descripción base del personaje (forma, proporciones,
   colores por nombre de token + hex actual, rasgo distintivo, estilo de render: "flat
   vector, sin gradientes, trazo grueso") y guardarla LITERAL en la Ficha de Dirección
   de Arte. Es el "código fuente" del personaje: toda generación futura parte de ella.
2. GENERAR por variación de pose, no de identidad: mismo prompt base + solo cambia la
   cláusula de pose/emoción ("...celebrando con los brazos arriba", "...dormido con zzz").
   Si el generador soporta seed o imagen de referencia, fijar el seed / pasar la pose
   neutra como referencia en cada variación. Generar los 5 estados en UNA sesión y
   compararlos lado a lado antes de aprobar (deriva de estilo = regenerar).
3. EXPORT: fondo transparente SIEMPRE (PNG 2x mínimo; SVG si el estilo es flat y se puede
   vectorizar). Nombrar por estado: mascota-neutro.svg, mascota-celebrando.svg…
4. RE-COLOREO: si el brand kit cambia, en SVG se re-mapean los fills a los tokens; en
   PNG se regenera desde la descripción canónica con los hex nuevos.
```

**SI NO HAY PERSONAJE — qué carga la emoción en su lugar (elegir 1 y ser consistente):**
```
- FORMA ABSTRACTA DE MARCA ANIMADA (el orbe de Headspace): un blob/orbe/anillo con los
  tokens de marca que respira en calma, pulsa al celebrar, se atenúa en riesgo. Mismos
  5 estados, expresados con motion y color en vez de cara.
- EL DATO HÉROE como portador de emoción (Strava, Whoop, apps de finanzas): el número
  protagonista celebra contando con spring, se apaga a gris en riesgo, se enmarca en la
  share card. La emoción vive en cómo se COMPORTA el dato.
- LA VOZ sola (Linear, apps sobrias): sin actor visual — el arquetipo de voz (matriz de
  abajo) + el motion compilado cargan toda la personalidad. Exige el copy MÁS afilado.
```

### Capa 2: Primer Contacto (los primeros 10 segundos)
El usuario forma una opinión en 50ms. En 10 segundos ya decidió si se queda o se va.

**Checklist del primer contacto:**
```
[ ] ¿La primera pantalla comunica QUÉ HACE la app en <5 segundos?
[ ] ¿Hay un elemento visual que capture la atención? (no solo texto)
[ ] ¿El color primario se siente diferenciado? (no el azul default de Tailwind)
[ ] ¿La tipografía tiene personalidad?
[ ] ¿Hay una animación sutil de entrada? (fade-in del contenido, no pantalla estática)
[ ] ¿El CTA principal es imposible de ignorar?
[ ] ¿Se siente premium o se siente template?
```

**Patrón de animación de primer contacto:**
```css
/* Los elementos aparecen escalonados, no todos de golpe */
.hero-title { animation: fadeSlideUp 0.6s ease-out 0.1s both; }
.hero-subtitle { animation: fadeSlideUp 0.6s ease-out 0.2s both; }
.hero-cta { animation: fadeSlideUp 0.6s ease-out 0.3s both; }
.hero-visual { animation: fadeSlideUp 0.6s ease-out 0.4s both; }

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Capa 3: Momentos de Celebración
Los momentos donde la app reconoce los logros del usuario. La mayoría de las apps los ignoran. Las apps premium los convierten en micro-momentos de dopamina.

> **Los BLUEPRINTS completos de cada momento viven en `56-MOMENTOS-EMOCIONALES.md`** — primera
> victoria, hito de racha, level-up, racha en riesgo, racha rota, vuelta tras abandono y share
> card, cada uno con blueprint 375px + números + timeline + copy por arquetipo + componentes TSX.
> Esta capa define CUÁNDO celebrar y con QUÉ intensidad; el CÓMO exacto (la pantalla) está en 56.
> No resolver un hito real con un toast: los niveles 2 y 3 de abajo SON pantallas de 56.

**Cuándo celebrar:**
- Primera acción completada: "¡Tu primera [X] está lista! 🎉"
- Hito de uso: "Llevas 10 / 50 / 100 resultados generados"
- Racha de días: "3 días consecutivos usándolo. ¡Vas muy bien!"
- Conversión a Pro: "Bienvenido/a al equipo Pro. Ahora tienes acceso a todo."
- Logro inesperado: "Tu resultado de hoy fue 40% más largo que el promedio. ¡Productividad!"

**Cómo celebrar (niveles de intensidad):**
```
Nivel 1 — Sutil (para acciones frecuentes):
  Toast con ícono ✓ y mensaje breve. Desaparece en 3s.
  Ejemplo: "Guardado ✓"

Nivel 2 — Notable (para hitos):
  Banner animado con mensaje personalizado.
  Ejemplo: "🎉 ¡Primer resultado generado! Ya eres parte del club."

Nivel 3 — Celebración (para logros importantes):
  Animación especial: confetti, burst de partículas, o animación del logo.
  Ejemplo: Al completar el onboarding o al hacer upgrade a Pro.
  Duración: 1.5-2 segundos. Nunca más. Nunca bloquear la app.
```

**Implementación de confetti simple:**
```typescript
// Librería ligera: canvas-confetti (2KB gzipped)
import confetti from 'canvas-confetti';

function celebrate() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: [/* reemplazar por los colores REALES del brand kit (PASO 0 de 16) — NO el azul default */], // del brand kit, no hex genérico
  });
}
```

---

### Sistema de Gamificación Profundo (más allá de las rachas)

> **Sistema completo en `24-GAMIFICACION.md`.** Este archivo (11) define el *tono emocional* de la gamificación (los 3 adjetivos, la intensidad de cada celebración, celebrar solo hitos reales). El archivo `24` define el *sistema*: loop del hábito (Hooked), mecánica de rachas con streak freeze, XP y niveles, recompensa variable, ligas, re-enganche, modelo de datos y anti-patrones. Cárgalos juntos al diseñar retención. Lo de abajo es el resumen de tipos de logros — el detalle vive en `24`.

Una racha de días es el nivel 0 de la gamificación. Las apps que mejor retienen tienen múltiples tipos de reconocimiento. Si la app tiene algún elemento de uso frecuente o progreso, implementar AL MENOS 3 de estos:

```
TIPOS DE LOGROS (elegir los que aplican al nicho de la app):

1. RACHAS DE CONSTANCIA (uso diario/semanal consecutivo)
   → 3 días, 7 días, 30 días, 100 días
   → Recuperación de racha: "Llevas 1 día de pausa — tu racha anterior fue X días"
   → Nunca mostrar "perdiste tu racha" en negativo — siempre en positivo

2. HITOS DE VOLUMEN (cuánto ha hecho el usuario en total)
   → 1er contenido, 10, 50, 100, 500 creados/publicados/completados
   → Estos no se pierden nunca — son acumulativos y permanentes

3. RÉCORDS PERSONALES (el mejor resultado del usuario vs su propio historial)
   → "Tu semana más productiva" / "Tu mejor mes" / "Nuevo récord"
   → Comparar contra el propio usuario, nunca contra otros (sin presión social)

4. METAS COMPLETADAS (objetivos que el usuario se puso)
   → El usuario define una meta → la app celebra cuando se alcanza
   → "Querías publicar 3 veces por semana — lo lograste 4 semanas seguidas"

5. PRIMERAS VECES (onboarding progresivo y natural)
   → Primera publicación / Primera semana completada / Primera marca creada
   → Los "primeras veces" son los logros más fáciles y más motivadores

6. NIVEL DE MAESTRÍA (basado en uso avanzado)
   → Desbloquear features o vistas avanzadas al demostrar dominio del básico
   → "Ya dominas [función X] — aquí tienes [función Y] más avanzada"

REGLAS DE LA GAMIFICACIÓN ÉTICA:
- Los logros se ganan con progreso REAL, no con tiempo en la app
- Nunca quitar un logro ya ganado
- Nunca mostrar logros de otros usuarios para crear presión social
- La recuperación siempre es fácil: reduce el costo de reengancharse y ofrece un punto de
  arranque limpio (fresh start) en vez de una deuda que saldar
- Los logros tienen íconos/visuales únicos que se acumulan en el perfil
- Celebrar con la intensidad correcta según el nivel (no confetti por guardar un borrador)
```

### Capa 4: Respuesta Emocional al Error
Cómo maneja la app los errores define más la experiencia que cómo maneja los éxitos.

**Principio Duolingo: "Fallar debe sentirse seguro."**

```
❌ Error frío:
  → Pantalla roja con "Error 500"
  → El usuario siente: "Se rompió. Es mi culpa?"

❌ Error genérico:
  → Toast: "Algo salió mal"
  → El usuario siente: "¿Y ahora qué hago?"

✅ Error empático:
  → Pantalla suave con ícono amigable
  → "No pudimos generar tu resultado. A veces pasa.
     Intenta con un texto más corto o prueba de nuevo →"
  → El usuario siente: "Ok, no es grave, lo intento de nuevo"

✅ Error con personalidad (si la app lo permite):
  → "Ups, la IA se tomó un café. Dale un segundo e inténtalo de nuevo ☕"
  → El usuario siente: "Jaja, ok, le doy retry"
```

**Regla de oro:** El mensaje de error debe hacer que el usuario sienta que TODO ESTÁ BAJO CONTROL, no que algo se rompió. Y siempre debe ser ACCIONABLE: además de empático, dice exactamente qué hacer a continuación. "No pudimos generar tu resultado" es empático pero incompleto; "No pudimos generar tu resultado. Intenta con un texto más corto o toca Reintentar" es empático Y accionable. Todo error termina con una salida clara.

### Capa 5: Transiciones y Movimiento
El movimiento comunica relaciones, jerarquía y cambio de estado. No es decoración.

**Principios de movimiento:**

```
1. Entrar y salir: Todo lo que aparece, aparece con animación (fade + slide).
   Todo lo que desaparece, desaparece con animación (fade out).
   Nunca pop-in/pop-out instantáneo.

2. Dirección con significado:
   - Avanzar en un flujo → contenido entra desde la derecha
   - Retroceder → contenido entra desde la izquierda
   - Abrir detalle → contenido sube desde abajo (bottom sheet)
   - Cerrar/descartar → contenido baja o se desvanece

3. Duración:
   - Micro (hover, toggle): 100-150ms
   - Estándar (modales, toasts): 200-300ms
   - Transiciones de página: 300-400ms
   - Celebraciones: 400-600ms spring (solo hitos reales)
   - NUNCA más de 1 segundo. Se siente lento.

4. Curva de easing (doctrina canónica en DESIGN-CORE.md):
   - Entrar Y salir de la UI: ease-out (arranca rápido = responsivo; ease-in al salir se "queda pegado")
   - Movimiento dentro de la pantalla: ease-in-out
   - Rebote/spring: cubic-bezier(0.34, 1.56, 0.64, 1) — solo celebración
   - NUNCA linear (se siente robótico), salvo loops de progreso constante
```

### Capa 6: Sonido y Háptica (Opcional pero Premium)
Las apps que más se recuerdan usan sonido: Duolingo, Slack (knock brush), iMessage.

**Cuándo añadir sonido:**
- Acción completada exitosamente (un "ding" sutil)
- Error (un "bonk" suave, no un pitido agresivo)
- Logro/celebración (fanfarria breve)
- Notificación (sonido distintivo de la marca)

**Reglas de sonido:**
- SIEMPRE dar opción de silenciar
- Desactivado por defecto en web apps (activar solo si el usuario lo elige)
- Sonidos de <1 segundo para acciones frecuentes
- El sonido debe ser CONSISTENTE con la personalidad (app seria = sonidos sobrios)

**Háptica en mobile (si es PWA o nativa):**
```javascript
// Vibración sutil al completar acción
navigator.vibrate?.(10); // 10ms — apenas perceptible pero se siente

// Vibración de error
navigator.vibrate?.([15, 50, 15]); // Doble pulso corto
```

### Capa 7: La Pregunta Final — "¿Esto se siente genérico?"

Antes de dar la app por terminada, hacer esta auditoría:

```
VISCERAL (se ve)
[ ] ¿Los colores se sienten únicos o son defaults de Tailwind?
[ ] ¿La tipografía tiene personalidad o es Inter/system-ui?
[ ] ¿Hay al menos un elemento visual memorable? (gradiente, ilustración, forma)
[ ] ¿Las pantallas tienen "espacio para respirar" o están apretadas?
[ ] ¿Hay una animación de entrada en la primera pantalla?

CONDUCTUAL (se usa)
[ ] ¿Las acciones principales se completan en ≤3 toques?
[ ] ¿Hay feedback inmediato en cada interacción? (<100ms)
[ ] ¿Las transiciones entre pantallas son suaves?
[ ] ¿Los errores se sienten seguros y guían hacia la solución?
[ ] ¿El loading se siente activo (mensajes, skeleton) o muerto (spinner)?

REFLEXIVO (se siente)
[ ] ¿La app tiene personalidad definida? (3 adjetivos)
[ ] ¿Hay momentos de celebración en hitos del usuario?
[ ] ¿El copy suena como una persona, no como un software?
[ ] ¿El usuario se siente más capaz/inteligente/productivo al usarla?
[ ] ¿Hay algo que haría que el usuario le muestre la app a un amigo?

DIFERENCIACIÓN
[ ] Si quito el logo, ¿se distingue de cualquier otra app del nicho?
[ ] ¿Hay un "momento WOW" que no esperaba encontrar?
[ ] ¿La primera impresión dice "profesional" o "hecho con template"?
```

---

## COMPILADOR DE PERSONALIDAD — de 3 adjetivos a valores concretos

Los 3 adjetivos son inútiles si se quedan en adjetivos: "juguetón" no le dice al agente qué `bounce` poner. Esta tabla los **compila** a números. Procedimiento: (1) elegir los 3 adjetivos (Capa 1), (2) buscar cada uno en la tabla, (3) donde los 3 adjetivos den valores distintos, **el primer adjetivo manda** (es el dominante) y los otros dos matizan hacia su rango, (4) escribir la fila compilada resultante en la Ficha de Dirección de Arte. **Sin la fila compilada en la Ficha, la personalidad NO está definida** — y el agente diseñará "de reflejo".

| Adjetivo | Spring (bounce · stiffness aprox.) | Duración base transiciones | Exclamaciones (máx/pantalla) | Intensidad de celebración (nivel 1/2/3 de Capa 3) | Radio de bordes tendencial | Densidad de color emocional |
|---|---|---|---|---|---|---|
| **Juguetón** | 0.30-0.35 · ~350 | 250-300ms | 1 (y con ingenio, no "¡¡!!") | check animado / overlay con rebote / confetti generoso + personaje | 16-24px (redondo) | Media-alta: acento presente, 2ª nota permitida en celebraciones |
| **Sereno** | 0.05-0.10 · ~200 | 300-400ms | 0 | check suave / banner calmado / anillo que se completa, SIN confetti | 12-16px | Baja: neutros dominan, acento solo en el dato del hito |
| **Enérgico** | 0.25-0.30 · ~400 | 180-250ms | 1-2 | check con punch / overlay rápido / confetti + háptica heavy | 12-16px | Media: acento protagónico en CTA y dato, entra rápido |
| **Sobrio** | 0-0.05 · ~250 | 200-300ms | 0 | check simple / línea de reconocimiento / número que cuenta, cero confetti | 8-12px (contenido) | Mínima: monocroma + acento quirúrgico |
| **Cálido** | 0.15-0.20 · ~250 | 280-350ms | 0-1 | check suave / banner con nombre del usuario / celebración con luz, poco confetti | 16-20px | Media: acento cálido + neutros con temperatura |
| **Técnico** | 0 · ~300 | 150-220ms | 0 | estado actualizado / badge sin fanfarria / dato héroe que cuenta | 6-10px (preciso) | Mínima: semánticos solo en su función |
| **Rebelde** | 0.25-0.35 · ~380 | 200-280ms | 1 (con actitud, no con emojis) | stamp/sello que golpea / overlay con contraste duro / celebración de alto contraste | 4-8px o mixto deliberado | Alta pero binaria: 1 acento fortísimo, cero decoración intermedia |
| **Minimal** | 0-0.05 · ~250 | 200-250ms | 0 | micro-check / una línea de texto / el espacio mismo celebra (aire + dato) | 8-12px | Mínima absoluta: 1 acento, aparece solo al lograr algo |

```
FILA COMPILADA (formato para la Ficha de Dirección de Arte — OBLIGATORIA):
Personalidad compilada: [adjetivo1 (dominante)] + [adjetivo2] + [adjetivo3]
→ spring: bounce __ / stiffness ~__ · duración base: __ms · exclamaciones: máx __/pantalla
→ celebración N1: __ · N2: __ · N3: __ · radius tendencial: __px · color emocional: __
→ arquetipo de voz: [coach enérgico | mentor sereno | cómplice juguetón | experto sobrio]

Ejemplo (app de hábitos "cálida, juguetona, clara"):
→ spring: bounce 0.2 / stiffness ~280 · duración base: 280ms · exclamaciones: máx 1
→ N1: check suave con nombre · N2: overlay con personaje · N3: confetti moderado + share card
→ radius: 16-20px · color: acento cálido + 2ª nota solo en celebraciones · voz: cómplice juguetón
```

> Estos valores alimentan directamente los timelines de `56-MOMENTOS-EMOCIONALES.md` (el bounce
> del badge, la intensidad del confetti) y la motion signature de `16` (PASO 0.7). Si el proyecto
> adoptó las curvas de firma de `41`, la duración base compilada se aplica sobre ESA familia.

---

## MATRIZ DE VOZ — 4 arquetipos × 8 momentos

El arquetipo de voz se elige UNA vez (sale de los 3 adjetivos compilados) y gobierna TODO el copy emocional. Los 4 arquetipos deben sonar a personas distintas — si dos celdas de la misma fila son intercambiables, están mal escritas. Los blueprints visuales de cada momento viven en `56-MOMENTOS-EMOCIONALES.md`; el copy de venta (paywall completo) en `52`.

| Momento | 🏋️ Coach enérgico | 🧘 Mentor sereno | 😏 Cómplice juguetón | 📐 Experto sobrio |
|---|---|---|---|---|
| **Bienvenida** (primer open) | "Llegaste. Ahora hagamos que cuente: tu primer paso toma 2 minutos." | "Bienvenida, Andrea. Empecemos por algo pequeño y bien hecho." | "Hola. Prometemos no pedirte 40 formularios. Solo una cosa: tu primera meta." | "Bienvenido. Configuremos tu punto de partida: 3 datos, 60 segundos." |
| **Primera victoria** (M1 de 56) | "¡Tu primer plan está listo! 12 respuestas, cero excusas — esto ya arrancó." | "Tu primer plan está listo. Un buen punto de partida; el resto, un día a la vez." | "Míralo. Tu plan. Existe. Nada mal para los primeros 5 minutos." | "Primer plan generado: 4 semanas, calibrado a tu nivel. Empieza por la semana 1." |
| **Hito** (racha/volumen, M2) | "¡30 días! Tu yo de hace un mes no se lo creería. A por los 100." | "30 días de constancia. Ya no es un intento — es un hábito." | "30 días. TREINTA. Oficialmente eres de esas personas constantes." | "Racha: 30 días. La mayoría abandona mucho antes — tu adherencia ya no depende de la motivación." |
| **Racha en riesgo** (M4) | "12 días no se dejan morir hoy. Un registro y sigue." | "Tu racha de 12 días sigue viva. El registro de hoy la mantiene." | "La llama está en modo siesta. Un registro y vuelve a prenderse." | "Racha activa: 12 días. Falta el registro de hoy." |
| **Racha rota** (M5) | "23 días no se borran con 1 día malo. Registra hoy y la recuperas." | "Tu racha se pausó — no se borró. Tus 23 días siguen en tu historial." | "La racha se tomó un día libre sin permiso. Tus 23 días siguen intactos: recuperémosla." | "Racha en pausa: 23 días conservados. Reparación disponible hoy con un registro." |
| **Error** (falla técnica) | "Se nos trabó — no es tu culpa. Dale reintentar y seguimos." | "Algo falló de nuestro lado. Tu trabajo está guardado; intenta de nuevo en un momento." | "No pudimos generar tu texto. Tu avance está a salvo — reintenta en unos segundos." (sin chiste: la personalidad juguetona va en celebraciones, no en errores — regla de `42`) | "Error al generar (nuestro servidor). Datos guardados. Reintentar suele resolverlo." |
| **Win-back push** (≥7 días) | "Tus 23 días de historial siguen ahí. Hoy: solo 10 minutos y retomas." | "Sin prisa, Andrea. Tu plan sigue guardado — un paso pequeño hoy basta." | "Tu plan pregunta por ti (nosotros solo somos el mensajero). ¿10 minutitos?" | "Tu progreso está intacto: plan + 18 días de historial. Sesión corta sugerida: 10 min." |
| **Paywall** (headline, ver 50/52) | "Tu plan está listo. Protégelo antes de que se quede en intención." | "Guarda lo que construiste hoy — tu plan de 4 semanas te espera completo." | "Sería una pena que estas 12 respuestas quedaran en nada, ¿no?" | "Plan de 4 semanas generado con tus 12 respuestas. Desbloquéalo completo." |

**Versión PROHIBIDA por fila (la que suena a template):**
```
Bienvenida       ❌ "¡Bienvenido a [App]! Estamos muy felices de tenerte aquí. ¡Explora todo!"
Primera victoria ❌ "¡Felicidades! Has completado tu primera acción. ¡Sigue así! 🎉"
Hito             ❌ "¡Wow! ¡Racha de 30 días! ¡Eres increíble! 🔥🔥🔥"
Racha en riesgo  ❌ "⚠️ ¡Vas a PERDER tu racha! ¡No tires tu esfuerzo a la basura!"
Racha rota       ❌ "Perdiste tu racha 💔. Todo se reinició a 0. Hazte Pro para que no vuelva a pasar."
Error            ❌ "Error 500: Internal Server Error." / "Algo salió mal."
Win-back push    ❌ "Te extrañamos 😢 ¡Vuelve pronto!"
Paywall          ❌ "Elige tu plan. Suscríbete para acceder a todas las funciones."
```

**Reglas transversales de la matriz:**
```
- UN arquetipo por app, en TODAS las superficies (UI, push, email, share card). Mezclar voces
  = no hay voz.
- El arquetipo MODULA por contexto (reglas de voz de abajo): incluso el cómplice juguetón se
  pone sobrio en pago, error de datos y momentos sensibles. El humor jamás en la mala noticia
  del dinero o la salud.
- Español LATAM natural: la matriz usa voseo/tuteo según el mercado definido en la Ficha
  (default tuteo neutro) (esto es el copy de la APP; la voz del AGENTE en el chat es SIEMPRE
  neutra — 42). No traducir del inglés mental ("¡Lo hiciste!" ← "You did it!" ❌).
- Test de la fila: leer las 4 celdas en voz alta. Si dos suenan a la misma persona, reescribir.
```

---

## ANTI-PATRONES EMOCIONALES

```
❌ Celebrar todo: Si todo tiene confetti, nada tiene confetti.
   Solo celebrar hitos genuinos.

❌ Humor forzado: "¡Oopsie doopsie! Algo salió malito 🙈"
   El humor debe encajar con la personalidad. Si la app es seria, no seas gracioso.

❌ Animaciones en todo: Si todo se mueve, nada se destaca y la app se siente lenta.
   Las animaciones son para momentos de cambio de estado, no para decoración.

❌ Dark mode como personalidad: El modo oscuro no es sustituto de diseño emocional.
   Una app fea en modo oscuro sigue siendo una app fea.

❌ Copiar la personalidad de otra app: Duolingo funciona siendo juguetón porque
   es educación. Una app de finanzas con mascota y confetti se sentiría infantil.
   Tu personalidad debe nacer de TU audiencia.

❌ Sonidos sin control de volumen: Si el usuario no puede silenciarlos,
   es una agresión, no una feature.

❌ Micro-interacciones que interfieren: La animación no debe bloquear
   la siguiente acción del usuario. Nunca obligar a esperar una animación.
```

---

## PLANTILLA: Definición de Diseño Emocional para tu App

Al inicio de cada proyecto, completar:

```markdown
## DISEÑO EMOCIONAL — [Nombre de la App]

### Personalidad
3 adjetivos: [___], [___], [___]
Si la app fuera una persona, sería: [descripción en 1 línea]
Tono de voz: [formal/casual] + [entusiasta/sereno] + [técnico/simple]
Arquetipo de voz (matriz de arriba): [coach enérgico | mentor sereno | cómplice juguetón | experto sobrio]
Fila compilada (COMPILADOR DE PERSONALIDAD — obligatoria): spring bounce __ · duración base __ms ·
exclamaciones máx __ · celebración N1/N2/N3: __ · radius __px · color emocional: __
Portador de la emoción (SISTEMA DE PERSONAJE): [personaje (5 estados) | forma abstracta | dato héroe | voz sola]

### Primer Contacto
Qué siente el usuario en los primeros 10 segundos: [___]
Elemento visual memorable: [___]
Animación de entrada: [sí/no, descripción]

### Momentos de Celebración
1. [Hito] → [Tipo de celebración]
2. [Hito] → [Tipo de celebración]
3. [Hito] → [Tipo de celebración]

### Experiencia de Error
Tono de los errores: [empático/humorístico/neutro]
Mensaje de error genérico: "[___]"

### Movimiento
Estilo general: [suave y fluido / rápido y enérgico / mínimo y preciso]
Duración base: [___]ms

### Sonido (si aplica)
[Sí/No]
Estilo: [___]
```


---

## LA FÓRMULA DE DISEÑO EMOCIONAL (los 7 elementos que hacen que el usuario quiera volver)

El diseño emocional no es decoración. Es la suma de sensaciones que hacen que el usuario sienta que fue entendido, que puede hacerlo y que fue diseñado para él. No es sobre colores ni animaciones — si eliminas colores, ilustraciones y animaciones, la app todavía debe sentirse clara y humana por su flujo, copy, feedback, control y progreso. Los visuales amplifican esa base; no la reemplazan.

| Elemento | Qué debe producir | Cómo medirlo |
|---|---|---|
| **Claridad** | El usuario entiende qué hacer y por qué importa | ¿Lo entiende sin explicación? |
| **Progreso** | La app muestra avance visible y celebra hitos reales | ¿El usuario siente que avanza? |
| **Control** | Se puede corregir, volver, cancelar, editar y decidir | ¿El usuario se siente seguro explorando? |
| **Personalidad** | La app tiene una voz reconocible y coherente | ¿Suena distinto a un template genérico? |
| **Ritmo** | La experiencia alterna foco, acción, espera y recompensa sin saturar | ¿Hay momentos de calma entre acciones? |
| **Confianza** | La app explica, no manipula, no exagera y respeta datos | ¿El usuario se siente seguro dando sus datos? |
| **Memoria** | Recuerda lo útil para reducir esfuerzo (no para invadir) | ¿La app recuerda lo importante sin pedir de más? |

**Prueba práctica de la fórmula:** Elimina mentalmente colores, ilustraciones y animaciones. ¿La app todavía se siente clara, progresiva, controlable, con personalidad, rítmica, confiable y con memoria? Si no, el diseño emocional está en la superficie, no en la estructura.

### Reglas de voz y personalidad
```
- Definir rasgos de tono con ejemplos permitidos Y prohibidos (ej: "optimista, directa, juguetona;
  nunca culposa, sarcástica ni exagerada")
- Modular según el contexto del usuario:
  - Éxito: más expresivo
  - Decisión: ser claro sobre todo
  - Error: ser calmado y accionable
  - Sensible (pago, pérdida, dato importante): ser sobrio, nunca gracioso
- Nunca: culpar al usuario por no volver, convertir notificaciones en memes,
  usar cercanía falsa con datos sensibles
- La personalidad debe hacer MÁS CLARO y agradable el uso, no competir con la tarea
```

### Mandamiento del diseño emocional
**Diseñar emoción, no decoración.** Una animación puede confirmar, orientar, celebrar o explicar. Si solo retrasa, distrae o intenta parecer premium, es decoración. Duolingo no funciona por su mascota — funciona porque la mascota está integrada al sistema de motivación. Lo mismo aplica a cualquier app: no agregar una mascota si el flujo sigue siendo frío o confuso.
