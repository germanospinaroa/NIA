# GAMIFICACIÓN Y RETENCIÓN — Cómo Convertir la App en un Hábito

> **Cuándo cargar este archivo:**
> - Al diseñar el flujo central de una app B2C de bienestar, fitness, finanzas personales, educación, productividad o creación de hábitos (junto con `02B-ONBOARDING-Y-PAYWALL.md`)
> - Al pulir una app que "funciona" pero que la gente usa una vez y no vuelve
> - Cuando el problema no es el producto, sino la **retención** (la app promedio pierde 77% de usuarios en 3 días)
> - La evidencia sourced de Duolingo (streaks, CURR, notificaciones) y Flo (loop de log diario) que
>   respalda este archivo vive con su cita completa en `52-COPY-VISUALES-CONVERSION.md` → "2bis"

## Objetivo
La diferencia entre una app que se prueba y una que se paga mes tras mes no es el feature — es si el usuario **vuelve**. Las apps que mejor retienen (Duolingo, Cal AI, Phantom, Strava) no tienen más features: tienen un **sistema de motivación** diseñado a propósito. Este archivo convierte la app en un hábito sin caer en dark patterns.

---

## PRINCIPIO RECTOR: Gamificar el comportamiento que YA importa

El error #1 de la gamificación amateur es **pegar puntos encima de una app aburrida**. Los puntos, badges y niveles no crean valor — **amplifican** el valor que ya existe. Si la acción central de la app no le sirve al usuario, ninguna racha lo va a retener.

```
❌ Gamificación de relleno: "Ganaste 50 puntos por abrir la app"
   → puntos sin significado = el usuario los ignora en 2 días

✅ Gamificación real: "3 días seguidos registrando tus comidas — tu adherencia
   subió 40%. Esta es la racha que predice resultados."
   → la mecánica refuerza el comportamiento que produce el resultado que el usuario pagó por lograr
```

**Regla de oro:** toda mecánica de gamificación debe reforzar **la acción que produce la primera victoria del usuario** (definida en la Constitución del Producto, archivo 01). Si no la refuerza, sobra.

---

## EL LOOP DEL HÁBITO (modelo Hooked: Gatillo → Acción → Recompensa Variable → Inversión)

Todo hábito digital se construye sobre el mismo bucle de 4 partes (Nir Eyal, *Hooked*). **Cada app del SO debe nombrar explícitamente su loop central** antes de construir — escribirlo en `ESTADO.md`.

```
1. GATILLO (Trigger) — qué trae al usuario de vuelta
   Externo: push/email a la hora activa histórica del usuario, no a una hora fija.
   Interno: la emoción que la app aprende a resolver ("me siento desorganizado" → abro la app).
   → El gatillo externo entrena el interno. Al principio notificas; con el tiempo el usuario
     vuelve solo porque asocia la app con resolver esa emoción.

2. ACCIÓN (Routine) — la UNA cosa que el usuario hace cada vez
   La acción central debe costar el mínimo esfuerzo posible (1-2 toques hasta el valor).
   Cuanto más fácil la acción, más se repite. (Fogg: Comportamiento = Motivación × Habilidad × Gatillo)

3. RECOMPENSA VARIABLE (Reward) — por qué se siente bien
   Si la recompensa es 100% predecible, el cerebro se aburre. La variabilidad mantiene
   el interés (ver Mecánica 3). La recompensa debe llegar INMEDIATAMENTE tras la acción.

4. INVERSIÓN (Investment) — por qué cuesta irse
   El usuario deja algo dentro: historial, progreso, una colección, preferencias aprendidas,
   contenido creado. Cada inversión sube el costo de cambio y carga el próximo gatillo.
   → Sin inversión no hay retención de largo plazo; solo entretenimiento desechable.
```

**INVERSIÓN ACTIVA — el moat de datos.** El registro de hoy debe CAMBIAR lo que la app le dice
mañana (mejor predicción, insight nuevo, plan ajustado). La inversión pasiva (historial que solo
se archiva) no retiene. **TEST BINARIO del MVP:** *"si borro tu historial, ¿la app de mañana es
idéntica?"* — si sí, no hay inversión: solo un archivo. Evidencia: Flo (>50% de MAU e ingresos
de usuarias con +1 año — el log diario alimenta el motor de predicción; General Atlantic 2024);
a16z 2025: la IA retiene cuando ACUMULA contexto (ChatGPT: DAU/MAU 36%, retención M12 de pago
68%), no cuando genera outputs sueltos (Sora: D30 <8%). Implementación con IA en
`30-INTEGRACION-IA.md` → "MEMORIA DEL USUARIO = RETENCIÓN".

**Tabla de loops por nicho (ejemplos para arrancar):**

| Nicho | Gatillo | Acción central | Recompensa variable | Inversión |
|---|---|---|---|---|
| Fitness/nutrición | Push 8am "¿desayunaste?" | Registrar comida (foto/voz) | Insight diario + racha | Historial corporal, fotos de progreso |
| Finanzas personales | Push tras cobro | Categorizar gastos | "Ahorraste X vs mes pasado" | Presupuesto y metas configuradas |
| Educación/idiomas | Recordatorio de lección | Completar lección 3-5min | XP + racha + cofre ocasional | Vocabulario aprendido, nivel |
| Productividad | Email matutino | Plan del día | "Tu día más productivo" | Proyectos, plantillas, sistema |
| Creación de contenido | Recordatorio de publicación | Crear/programar 1 post | Métricas de alcance | Calendario, marca, biblioteca |

> **El loop NO es un concepto abstracto — SHIPPEA como feature(s) en el MVP.** Error detectado al probar el SO: definir el loop ("hoy toca tu carrusel", calendario, métricas) y dejarlo en "pendiente de diseñar" mientras el MVP sale como "generador + historial". Esas cuatro columnas de arriba se construyen como PANTALLAS reales del MVP (el "Calendario", la "biblioteca", las "métricas de alcance" de la fila de contenido NO son V2 — son la razón de pagar). Ver `01-IDEACION.md` → "un GENERADOR + HISTORIAL NO es una app de suscripción". La **inversión** (última columna: marca aprendida, biblioteca acumulada, calendario lleno) es lo que sube el costo de irse — sin ella, el churn de IA (−30%, ver 02C) se lleva al usuario.
> **Cerrar el loop = la retención más fuerte:** crear → publicar → MEDIR → mejorar. Mostrarle al usuario si su contenido FUNCIONÓ ("tu carrusel del martes tuvo 2× alcance") da la razón #1 para volver cada mes. Evaluar la factibilidad de las integraciones (APIs sociales tienen fricción real — empezar liviano, ver pilar 3 de `01`).

---

## LA MÉTRICA DE ACTIVACIÓN — el "número mágico" que predice la retención

Antes de elegir mecánicas, hay que saber **qué comportamiento temprano predice que un usuario se quedará**. Las apps que mejor retienen no adivinan: encontraron su "número mágico" — una acción concreta, una cantidad y una ventana de tiempo que separan a los que se quedan de los que se van. Es el dato más accionable de toda la retención, porque **convierte la retención (un resultado lento) en un objetivo medible HOY** (en el onboarding).

```
EJEMPLOS HISTÓRICOS (el patrón, no para copiar el número):
  Facebook → 7 amigos en 10 días.    Slack → 2.000 mensajes enviados por un equipo.
  Twitter → seguir a 30 cuentas.     Dropbox → 1 archivo en 1 carpeta en 1 dispositivo.
La forma SIEMPRE es: [ACCIÓN central] × [CANTIDAD] dentro de [VENTANA de tiempo] → predice retención.
```

**Cómo encontrar el TUYO (con los datos de `36-ANALITICA-Y-EVENTOS.md`, apenas haya usuarios):**
```
1. Separar dos cohortes: los que SIGUEN activos al D30 vs los que se fueron.
2. Buscar la acción central (la que produce la primera victoria, archivo 01) y preguntar:
   "¿qué cantidad de esta acción, en qué primeros N días, tienen casi todos los retenidos
    y casi ninguno de los que se fueron?" Ese umbral es tu número mágico.
3. Es CORRELACIÓN, no causalidad mágica: valídalo moviendo el onboarding hacia ese número y
   viendo si la retención sube. Si no sube, no era el número — prueba otra acción/umbral.
```

> **Para qué sirve, en concreto:** el número mágico se vuelve el **objetivo del onboarding y de la gamificación**. Toda la maquinaria de este archivo (la meta diaria, la racha pre-cargada, el checklist de configuración, los primeros hitos) debe estar **calibrada para empujar al usuario a alcanzar ese número lo antes posible**. No gamificas "para que use la app" — gamificas para que cruce el umbral que lo convierte en usuario retenido. Mientras no tengas datos, usa una hipótesis explícita (ej. "3 generaciones en los primeros 3 días") escrita en ESTADO.md, y la validas cuando lleguen los datos.

**La forma de la curva de retención importa más que el número de un día.** Medir D1/D7/D30 como puntos sueltos engaña; lo que dice si hay producto es la **forma de la curva**:
```
- Curva que DECAE A CERO  → no hay valor recurrente. NINGUNA gamificación lo salva: el problema
  es el producto, no la falta de rachas. Volver a 01/03 antes de pegar mecánicas encima.
- Curva que SE APLANA en una meseta > 0 (ej. se estabiliza en ~25-30% al D30 y ahí se queda)
  → hay un núcleo de usuarios que encontró valor recurrente = señal de product-market fit.
  Ahí la gamificación SÍ rinde: sube la meseta y acelera cuánta gente llega a ella.
```
> Regla: si la curva aún decae a cero, la gamificación es maquillaje. Primero consigue que aplane (valor real recurrente); después amplifícala con las mecánicas de abajo. Instrumentar la curva por cohorte con los eventos `sesion_iniciada`/`aha_alcanzado` de `36`.

---

## BENCHMARKS DE ENGAGEMENT (con fuente y año)

Los números para calibrar la curva — SIEMPRE por vertical, nunca contra un promedio global:

| Métrica | Benchmark | Fuente y año |
|---|---|---|
| DAU/MAU | 20% bueno · 50%+ excepcional | Lenny/Sequoia 2023-24 |
| Retención promedio móvil | D1 ~24-26% · D7 ~11-13% · D30 ~5-7% | AppsFlyer/Adjust 2024 |
| D30 en apps de suscripción | 14% (vs 5.4% en apps con ads) | AppsFlyer 2026 |
| Usuarios a 6 meses (consumer subscription) | 40% bueno · 70% excelente | Lenny + Casey Winters |
| Referencia de bienestar: Headspace | D1 30% · D7 12% · D30 6% | Business of Apps 2024 |
| Regla del 7%: retorno en D7 de 7% | ya es top 25% de las apps | Amplitude 2024 |

> Un D30 de 6% en bienestar es SANO, no fracaso: calibra por vertical, no contra el promedio.

**CURR — la métrica prioritaria post-lanzamiento.** CURR (retención semanal de usuarios
ACTUALES — ¿qué % de los activos de la semana pasada volvió esta semana?): en Duolingo tuvo
5-6x el impacto de cualquier otra palanca sobre el DAU (+21% CURR = DAU 4.5x en 4 años —
Lenny's Newsletter 2022); se instrumenta en `36-ANALITICA-Y-EVENTOS.md` y se lee en `21-BACKOFFICE.md`.

---

## LA PRIMERA SEMANA DISEÑADA (D1-D7)

Los saltos de retención viven entre D1 y D7; a partir del día 7 la aversión a la pérdida se
enciende y la curva se aplana (Duolingo, 600+ experimentos solo en rachas; >50% de su DAU tiene
racha ≥7 días — Lenny's Podcast 2024). La primera semana no se deja al azar: se diseña día a día.

```
SECUENCIA DÍA A DÍA:
  D1    = primera victoria + ancla contextual (la pregunta "¿cuándo lo harás?" del onboarding
          fija la hora de notificación desde el día 1 — ver 02B)
  D2    = racha visible por primera vez (regla de Mecánica 1: no antes)
  D3-D4 = primer freeze GANADO (no regalado) + primer insight personalizado del historial
          + prompt de PASSKEY tras un momento de éxito ("¿entrar con tu huella la próxima
          vez?" — un tap y no vuelve a depender del correo; regla y momento en 26)
  D7    = hito emocional (M2 de 56) + mejor momento para upgrade/anual
```

**Meta de calibración:** 7% de retorno en D7 ya es top 25% (Amplitude 2024).

---

## MECÁNICA 1 — Rachas (streaks) + aversión a la pérdida

La racha es el motor de retención más potente que existe, porque explota la **aversión a la pérdida**: psicológicamente duele 2× más perder algo que ganarlo. Una racha de 47 días no es un número — es algo que el usuario **no quiere perder**.

```
REGLAS DE LA RACHA:
- Mostrar la UI de racha desde el DÍA 2 (no antes — no hay racha que mostrar en el día 1).
- Pre-cargar la racha en 1 apenas el usuario completa su primera acción (endowed progress:
  un progreso ya empezado se completa más que uno desde cero).
- Hito de celebración real en 7 / 30 / 100 / 365 días — con intensidad creciente.
- Copy en clave de pérdida, no de ganancia:
    ✅ "No pierdas tu racha de 12 días — te falta tu registro de hoy"
    ❌ "¡Construye una racha!" (sin nada que perder, no motiva)
```

**Streak Freeze (congelar racha) — el anti-churn más importante.** Sin esto, el día que el usuario falla pierde la racha Y la motivación, y se va. Con freeze, un día perdido no rompe nada.

```
- El usuario gana/compra "congeladores" (1-2 disponibles tras una racha de 7 días).
- Se consume 1 congelador POR CADA día fallado (no 1 congelador = cualquier cantidad de días):
  faltar 1 día cuesta 1 congelador; faltar 4 días seguidos cuesta 4 (o rompe la racha si no
  alcanzan). Ver el código más abajo — la regla simple es "1 día perdido = 1 congelador", no
  "1 congelador salva cualquier ausencia".
- Notificar al volver: "Usamos un congelador para salvar tu racha de 23 días. Te queda 1."
  → el usuario siente que la app lo cuida, no que lo castiga.
```

**Default recomendado: 2 freezes equipados** (pasar de 1 a 2 fue "un gran win de DAU" en
Duolingo — Shuttleworth 2024). La reparación y el freeze no son suavizantes: son lo que evita
que la racha rota destruya la motivación (JCR 2023: racha intacta 66.2% vs 57.9% de
continuación; el efecto se atenúa si el usuario puede reparar).

**Reparación de racha (<48h).** Si la racha se rompió, ofrecer recuperarla dentro de 48h (viendo un tip, completando una acción doble, o como beneficio Pro). Nunca mostrar "perdiste tu racha" en rojo punitivo — siempre con salida.

**Anti-burnout:** la racha no debe volverse una cárcel. Permitir "días de descanso" planificados (Duolingo lo hace) para que el usuario no sienta culpa al tomarse un fin de semana.

---

## MECÁNICA 2 — XP, niveles y meta diaria

XP (puntos de experiencia) contabiliza el **esfuerzo acumulado**. Los niveles convierten ese esfuerzo en una sensación de progreso permanente.

```
REGLAS DE XP:
- Otorgar XP por ACCIÓN SIGNIFICATIVA, nunca por click o por abrir la app.
  (ej: completar una lección, registrar un día completo, publicar un post — no "ver pantalla")
- Meta diaria SELECCIONABLE por el usuario (escala de Duolingo, probada):
    Casual 10 XP · Regular 20 XP · Serio 30 XP · Intenso 50 XP
  → dejar que el usuario elija su nivel de compromiso aumenta la adherencia (autonomía).
- Curva de niveles GEOMÉTRICA (cada nivel ≈ 1.3–1.5× el anterior):
    Nivel 1: 100 XP · Nivel 2: 140 · Nivel 3: 196 · Nivel 4: 274 ...
  → niveles tempranos rápidos (sensación de competencia inmediata),
    niveles altos aspiracionales (estatus de largo plazo).
```

```typescript
// Curva de nivel geométrica — centralizada, fácil de ajustar
const BASE_XP = 100;
const GROWTH = 1.4;
function xpParaNivel(nivel: number): number {
  return Math.round(BASE_XP * Math.pow(GROWTH, nivel - 1));
}
function nivelActual(xpTotal: number): number {
  let nivel = 1, acumulado = 0;
  while (acumulado + xpParaNivel(nivel) <= xpTotal) {
    acumulado += xpParaNivel(nivel);
    nivel++;
  }
  return nivel;
}
```

---

## MECÁNICA 3 — Recompensa variable (la que de verdad crea el hábito)

Es la mecánica más poderosa y la más fácil de ignorar. Una recompensa **predecible** se vuelve aburrida; una **variable** mantiene al cerebro enganchado (mismo principio que las máquinas tragamonedas — por eso hay que usarlo con ética).

```
CÓMO INTRODUCIR VARIABILIDAD (sin manipular):
- Cofres de recompensa en hitos de racha: al abrirlos dan una cantidad ALEATORIA de XP,
  un cosmético, o un congelador. El usuario sabe que recibirá algo bueno, no qué exactamente.
- Ventanas de "doble XP" ocasionales y anunciadas ("hoy hasta las 9pm: doble XP").
- Insights sorpresa: "Dato que no esperabas: tu mejor día de la semana es el martes."
  → la variabilidad puede ser de INFORMACIÓN, no solo de puntos.

LÍMITE ÉTICO (no negociable):
- La recompensa variable NUNCA debe ser la única forma de progresar ni esconder costos.
- Etiquetar claramente las mecánicas de azar. Nada de loot boxes pagadas disfrazadas.
- El valor central de la app debe estar disponible sin depender de la suerte.
```

---

## MECÁNICA 4 — Logros, badges y colección (efecto goal-gradient)

Los logros dan reconocimiento permanente y activan el **goal-gradient**: cuanto más cerca está una meta visible, más se esfuerza el usuario por alcanzarla.

```
TIPOS (elegir los que apliquen al nicho — heredan de la lista del archivo 11):
1. Rachas de constancia (Mecánica 1)
2. Hitos de volumen acumulado (1er, 10, 50, 100, 500 — nunca se pierden)
3. Récords personales (vs el propio usuario, NUNCA vs otros)
4. Metas que el usuario se puso y cumplió
5. Primeras veces (los logros más fáciles y motivadores del onboarding)
6. Nivel de maestría (desbloquea features avanzados al dominar lo básico)

REGLAS VISUALES:
- Mostrar los badges BLOQUEADOS junto a los desbloqueados, con barra de progreso.
- La barra dice "te faltan 3", no solo "70%". El número concreto tira del usuario hacia adelante.
- Badges con visual único que se acumulan en el perfil (colección = inversión, ver loop).
- Niveles tiered cuando aplique: Bronce → Plata → Oro sobre el mismo logro acumulativo.
```

---

## MECÁNICA 5 — Onboarding gamificado (el primer "aha" en <60 segundos)

La retención del día 1 (D1) se decide en el primer minuto. El onboarding debe entregar una **victoria real** antes de pedir nada.

```
- Primer "aha" en <60s: el usuario debe SENTIR el valor central antes de registrarse o pagar
  (coherente con la regla "valor antes del registro" del archivo 03).
- Anillo/checklist de configuración: "3 de 5 pasos para tu primer resultado" — el gradiente
  de meta (cuanto más cerca del final, más empuje) hace terminar lo empezado.
- Pre-cargar la racha en 1 al completar la primera acción (endowed progress).
- Cada paso del onboarding es una micro-victoria celebrada, no un formulario.
```

> Esta mecánica se diseña **junto** con la estrategia de onboarding-first de `02B-ONBOARDING-Y-PAYWALL.md`: el onboarding que construye inversión emocional (estilo Cal AI / Noom) ES gamificación aplicada a la conversión.

---

## MECÁNICA 6 — Ligas y comparación social (OPCIONAL, con cuidado)

La competencia social retiene fuerte pero puede dañar a usuarios que van perdiendo. **Solo añadir si la app tiene una superficie social real** y el nicho lo tolera (educación, fitness sí; finanzas, salud mental no).

```
SISTEMA DE LIGAS (modelo Duolingo, probado):
- Cohortes semanales de ~30 usuarios de nivel similar.
- Al final de la semana: suben ~7 (promoción) y bajan ~5 (descenso).
  → competencia con consecuencia, pero sin que la mayoría se sienta perdedora.
- Rankings SIEMPRE contra pares de nivel similar, nunca contra el #1 global (desmoraliza).

ALTERNATIVA SIN PRESIÓN (default recomendado para la mayoría de nichos):
- Comparar al usuario SOLO contra sí mismo: "tu mejor semana", "récord personal".
- Cero presión social, cero exposición de los datos de otros.
```

> Regla heredada del archivo 11: **nunca mostrar logros de otros para crear presión social** salvo que el sistema de ligas sea explícito y opt-in.

---

## RE-ENGANCHE: Notificaciones y win-back (sin volverse spam)

El gatillo externo es lo que reactiva el loop. Mal usado, es la razón #1 por la que la gente desinstala.

```
CALENDARIO DE RE-ENGANCHE:
- D1, D3, D7: notificaciones de re-enganche con valor (no "vuelve", sino "tu insight de hoy").
- Enviar a la HORA ACTIVA HISTÓRICA del usuario (cuando suele abrir la app), no a una hora fija.
- Win-back a los 7 días de inactividad: un mensaje que recuerde el progreso que dejó
  ("tu racha de 23 días te espera") + una razón concreta para volver.

TOPE DURO (no negociable):
- Máximo 1-2 notificaciones por día. Pasar de ahí dispara desinstalaciones (Duolingo sufrió
  su propio backlash por sobre-notificar).
- Toda notificación debe ser ACCIONABLE y específica. Prohibido "¡Te extrañamos! 😢".
- Control total en ajustes: el usuario elige tipos y horarios. Default conservador.

PRIORIDAD cuando varios triggers compiten el MISMO día (sin esto, el usuario recibe 3 pushes
o el orden lo decide el azar del cron). Jerarquía fija, de mayor a menor:
  1) Racha en riesgo        → "te falta tu registro de hoy para no perder tu racha de N días"
  2) Win-back de inactividad → "tu racha de 23 días te espera" (a los 7 días sin abrir)
  3) Insight / valor diario  → "tu dato de hoy: ..."
REGLA: máximo 1 push de RE-ENGANCHE por día. Si varios califican el mismo día, gana el de MAYOR
prioridad y los demás se DESCARTAN ese día (no se acumulan ni se mandan al día siguiente).
```

**TIMING PRECISO (la "hora activa histórica", operacionalizada):**
```
- Recordatorio diario = hora de la última acción del usuario −30 min (Duolingo lo envía 23.5h
  después de la práctica de ayer — ancla al momento en que DEMOSTRÓ tener tiempo).
- Racha en riesgo = 21-22h hora local (el "streak saver" de Duolingo sale a las 22:00).
- El día 1, sin historial, usa la respuesta de anclaje del onboarding (02B: "¿cuándo lo harás?").
- Regla de volumen intacta (tope 1-2/día) + REGLA NUEVA: si hay opt-in y NO envías nada,
  también churnea — el 95% de quienes aceptaron push y no recibieron ninguno se fue (Airship);
  mínimo 1 toque de valor/semana.
```

**Cómo implementar el re-enganche (el cómo, no solo el qué).** La notificación no se "manda" sola — hay que construir el disparador. Tres canales, de menor a mayor fricción:
```
1. EMAIL PROGRAMADO (lo más simple y universal — funciona sin permisos del navegador):
   - Un job de pg_cron (Supabase) o una Edge Function programada corre cada hora.
   - Consulta usuarios cuyo last_active_on indica inactividad de 1/3/7 días (o racha en riesgo).
   - Dispara el email vía Resend (mismo proveedor del archivo 18) con copy accionable y específico.
2. WEB PUSH (mayor engagement, requiere opt-in explícito — avanzado):
   - Pedir permiso DESPUÉS de la primera victoria, nunca al entrar (si lo pides al entrar, te lo niegan).
   - Service worker + Web Push API; guardar la suscripción por usuario. Respeta el tope y los ajustes.
   - En móvil-PWA es lo más cercano a una notificación de app nativa.
3. WHATSAPP (nichos LATAM de alto valor):
   - 80-90% de apertura en plantillas vs ~30% del mejor email (cifras de vendors 2024-25 —
     rango optimista); usarlo SOLO para racha en riesgo y win-back, con opt-in explícito y
     presupuestando el costo por conversación de la API de Meta.
```
> El service worker para web push SÍ se justifica como feature de retención opt-in — es la excepción a la regla de `07-PULIDO` de no meter service workers "por moda".

**ADD-TO-HOMESCREEN — el gatillo pasivo de la web:** tras la primera victoria + racha de 3,
prompt de "agrega el acceso directo" — el ícono en el home es el gatillo pasivo que la web no
tiene por defecto (equivalente del widget de racha que Duolingo cita entre sus mayores wins).

**El copy del push lleva la VOZ del arquetipo (matriz de `11-DISENO-EMOCIONAL.md`) — y la "culpa
amable" SANA es preocupación con humor autoconsciente, nunca chantaje.** La pantalla que recibe al
usuario al volver es el momento M6 de `56-MOMENTOS-EMOCIONALES.md`. Ejemplos por arquetipo:

```
RACHA EN RIESGO (prioridad 1):
  Cómplice juguetón: "Tu racha de 12 días está en modo siesta. Un registro de 2 min y sigue 🔥"
  Mentor sereno:     "Tu racha de 12 días sigue viva — el registro de hoy la mantiene."
  ❌ PROHIBIDO:      "⚠️ ¡ÚLTIMA OPORTUNIDAD! Vas a perder TODO tu progreso si no entras YA."

WIN-BACK 7 DÍAS (prioridad 2):
  Coach enérgico:    "Tus 23 días de historial siguen ahí. Hoy: 10 minutos y retomas."
  Cómplice juguetón: "Tu plan pregunta por ti. Nosotros solo somos el mensajero 📬 ¿10 minutitos?"
  ❌ PROHIBIDO:      "Te extrañamos 😢 Duo está triste. No nos abandones."

VALOR DIARIO (prioridad 3):
  Experto sobrio:    "Tu dato de hoy: los martes son tu mejor día — 2× más registros."
  Mentor sereno:     "Tu insight de hoy está listo: una tendencia nueva en tu semana."
  ❌ PROHIBIDO:      "¡Hola! ¿Ya viste todo lo nuevo que tenemos para ti? ¡Entra ahora!"
```

---

## CÓMO ELEGIR QUÉ MECÁNICAS USAR (por tipo de app)

No toda app necesita todas las mecánicas. Meterlas todas = ruido. Elegir según el patrón de uso:

| Patrón de uso de la app | Mecánicas núcleo | Evitar |
|---|---|---|
| Uso diario (hábito) — fitness, idiomas, journaling | Racha + XP + meta diaria + onboarding gamificado | — |
| Uso frecuente pero no diario — finanzas, productividad | Hitos de volumen + récords personales + re-enganche | Rachas diarias (generan culpa)* |
| Uso esporádico/por tarea — generadores, herramientas | Hitos de volumen + primeras veces | Rachas, XP, ligas (se sienten forzados) |
| Uso social/competitivo — comunidades, fitness grupal | Ligas + logros compartibles + XP | Comparación si el nicho es sensible |

> \* **Matiz en finanzas:** una racha de REGISTRO/constancia (categorizar gastos 1 min/día) SÍ funciona — coherente con el tie-breaker de `02C` (la frecuencia se atiende gamificando la constancia) — **si el fallo se trata con amabilidad** (freeze, reparación, momentos M4/M5 de `56` — nunca el cero rojo punitivo). Lo que se EVITA es gamificar el DINERO: el monto ahorrado como puntaje/XP hace parecer el dinero un juego (regla del nicho F de 02C).

**Mínimo viable:** si la app tiene cualquier elemento de uso recurrente, implementar **al menos 3 mecánicas** (típico: racha + hitos de volumen + onboarding gamificado).

**PROBADO QUE NO FUNCIONA (evidencia — no reinvertir aquí):**
```
- Referidos en apps single-player: +3% de usuarios nuevos en Duolingo (funcionan con
  network effect, no sin él).
- Abaratar la racha (exigir 1 ejercicio en vez de la acción completa): NO subió DAU —
  la racha debe exigir la ACCIÓN DE VALOR real.
- Contadores decorativos ("moves"): neutral total (Mazal 2022 / Shuttleworth 2024).
- ~80% de features se usan poco o nunca (Pendo): el esfuerzo va al loop core, no a features nuevas.
```

---

## MODELO DE DATOS MÍNIMO

La lógica de gamificación vive en el **servidor / la base de datos**, nunca solo en el cliente (si vive en el cliente, cualquiera edita su XP desde DevTools). Esquema base en Supabase:

```sql
-- Progreso de gamificación por usuario
create table user_progress (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  xp_total       integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_active_on date,                       -- para calcular si la racha sigue viva
  freezes        integer not null default 0,
  daily_goal     integer not null default 20, -- 10/20/30/50
  tz             text not null default 'America/Bogota' -- zona horaria del USUARIO (ver nota abajo)
);
alter table user_progress enable row level security;
-- Estado DERIVADO/de valor: el cliente solo puede leerlo. Dar `for all` al dueño de la fila
-- permitiría que fabricara XP, freezes o racha llamando Supabase directamente.
create policy "read_own_progress" on user_progress
  for select using ((select auth.uid()) = user_id);

-- Logros desbloqueados (acumulativo, nunca se borra)
create table user_achievements (
  user_id      uuid references auth.users(id) on delete cascade,
  achievement  text not null,
  unlocked_at  timestamptz not null default now(),
  primary key (user_id, achievement)
);
alter table user_achievements enable row level security;
create policy "read_own_achievements" on user_achievements
  for select using ((select auth.uid()) = user_id);
```

**No existe policy de INSERT/UPDATE/DELETE para `authenticated`.** Las mutaciones pasan por una
RPC estrecha o un handler con service role. La RPC recibe el identificador de la acción completada
y una idempotency key; **nunca** recibe XP, gemas, nivel, tema, precio o recompensa como autoridad.

```sql
create table reward_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  action_id uuid not null,
  action_type text not null,
  xp_awarded integer not null check (xp_awarded between 0 and 500),
  created_at timestamptz not null default now(),
  primary key (user_id, action_id)
);
alter table reward_events enable row level security;
create policy "read_own_reward_events" on reward_events
  for select using ((select auth.uid()) = user_id);

-- Pseudocontrato: la implementación de cada app verifica que action_id existe, pertenece al
-- usuario y está completada; luego obtiene la recompensa de una tabla/constante server-owned.
-- SECURITY DEFINER siempre con search_path vacío y objetos cualificados.
create or replace function public.claim_action_reward(p_action_id uuid)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'unauthorized'; end if;
  -- 1. SELECT ... FOR UPDATE de la acción real en public.<tabla_acciones>.
  -- 2. Verificar owner + completed_at + tipo allowlisted.
  -- 3. INSERT reward_events; unique(user_id, action_id) hace el claim idempotente.
  -- 4. Calcular XP/gemas en servidor y UPDATE public.user_progress dentro de esta transacción.
  -- El cliente jamás proporciona el valor de la recompensa.
  return jsonb_build_object('status', 'implement_domain_verification');
end; $$;

revoke execute on function public.claim_action_reward(uuid) from public, anon;
grant execute on function public.claim_action_reward(uuid) to authenticated;
```

> El bloque anterior es un **contrato**, no una función lista para producción: no se publica hasta
> reemplazar `<tabla_acciones>` por la acción real y crear tests adversariales. Si la app no puede
> demostrar server-side que ocurrió la acción, no concede una recompensa de valor.

**Cálculo de racha en el servidor** (Edge Function / route handler), nunca confiando en el cliente:

**Timezone — el "hoy" de la racha se computa en la zona del USUARIO, no en UTC.** Sin esto, un registro a las 9pm de Bogotá cuenta como "mañana" (UTC) y la racha se rompe o se duplica en el borde de medianoche. La columna `tz` de `user_progress` (arriba) guarda la zona (pedirla del navegador: `Intl.DateTimeFormat().resolvedOptions().timeZone`, con default `America/Bogota`). El `hoy` que recibe `actualizarRacha` es `now()` convertido a esa zona (`(now() at time zone p.tz)::date` en SQL). Y el cron horario de push (re-enganche) evalúa "racha en riesgo" POR ZONA: a cada usuario le llega el aviso en SU noche, no en la de UTC.

**Cuidado con el gap real:** un solo congelador NO debe "salvar" una ausencia de varios días. Hay que mirar **cuántos días** pasaron, no solo si quedan congeladores. Si el usuario faltó 4 días, salvar la racha cuesta **3 congeladores** (uno por cada día perdido entre la última actividad y hoy); si no le alcanzan, la racha reinicia.

```typescript
// Al registrar la acción central del día.
// Devuelve también freezesConsumidos para que el handler emita N veces el evento `streak_frozen`.
function actualizarRacha(
  p: { last_active_on: string | null; current_streak: number; freezes: number },
  hoy: string,
): { last_active_on: string; current_streak: number; freezes: number; freezesConsumidos: number } {
  if (p.last_active_on === hoy) {                            // ya contó hoy, sin cambios
    return { ...p, freezesConsumidos: 0 };
  }
  if (p.last_active_on === null) {                           // primera actividad de su vida
    return { ...p, current_streak: 1, last_active_on: hoy, freezesConsumidos: 0 };
  }

  const dias = diferenciaDias(p.last_active_on, hoy);        // días transcurridos (>= 1)

  if (dias === 1) {                                          // actividad ayer → la racha continúa
    return { ...p, current_streak: p.current_streak + 1, last_active_on: hoy, freezesConsumidos: 0 };
  }

  // Faltó (dias - 1) día(s). Cada día perdido cuesta 1 congelador.
  const diasPerdidos = dias - 1;
  if (diasPerdidos <= p.freezes) {                           // alcanzan los congeladores → racha salvada
    return {
      ...p,
      freezes: p.freezes - diasPerdidos,
      current_streak: p.current_streak + 1,                 // hoy SÍ cuenta como día de racha
      last_active_on: hoy,
      freezesConsumidos: diasPerdidos,                       // el handler emite `streak_frozen` esas N veces
    };
  }

  // El gap excede los congeladores disponibles → la racha reinicia en 1.
  return { ...p, current_streak: 1, last_active_on: hoy, freezesConsumidos: 0 };
}
```

> El handler que llama a `actualizarRacha` debe emitir el evento `streak_frozen` **una vez por cada congelador consumido** (`freezesConsumidos`), y `streak_extended` cuando la racha avanzó. Así el backoffice (21) cuenta correctamente cuántas rachas se salvaron con congeladores.
>
> **Hito de racha → momento M2, INMEDIATO:** tras extender la racha, si `current_streak ∈ {7, 30, 100, 365}` el handler devuelve además `milestone: current_streak` y emite el evento `streak_milestone` — y la UI renderiza el momento M2 de `56-MOMENTOS-EMOCIONALES.md` (overlay de celebración con intensidad creciente) EN esa misma respuesta, no en la próxima visita. Un hito celebrado al día siguiente no celebra nada.

---

## INSTRUMENTACIÓN — Qué eventos registrar y dónde (un solo contrato)

Las mecánicas no sirven si no se miden, y el error es que cada parte invente su propio log. **Un solo contrato de eventos**, escrito una vez en el servidor, alimenta tanto el backoffice como la analítica:

```
EVENTOS CANÓNICOS DE RETENCIÓN (se escriben en el event_log del servidor — ver 21-BACKOFFICE):
  streak_extended · streak_frozen · streak_broken · streak_milestone (hito 7/30/100/365 → M2 de 56)
  · xp_awarded · level_up · milestone_reached
  · achievement_unlocked · goal_completed · reengagement_sent · reengagement_opened

REGLA: cada evento se escribe UNA vez, en el servidor, junto a la lógica que lo produce, con
  user_id + timestamp + payload mínimo. El backoffice (21) LEE de ahí las métricas D1/D7/D30 y
  churn; la analítica de producto (trackEvent del archivo 08) refleja el MISMO evento, no crea otro.
```
> La gamificación PRODUCE estos eventos; el backoffice (`21-BACKOFFICE.md`) los LEE para sus métricas de retención. Sin este contrato único, terminas con tres logs distintos que no cuadran.

---

## ANTI-PATRONES PROHIBIDOS (gamificación ética)

```
❌ Spam de culpa: "Nos abandonaste 😢" / "Duo está triste por ti" como presión emocional.
❌ Pay-to-not-lose como única reparación: cobrar por no perder la racha es extorsión, no feature.
❌ Falsa escasez / urgencia falsa: "¡Solo quedan 2 horas!" cuando no es verdad.
❌ Métricas de vanidad sin progreso real: puntos que no reflejan ningún avance del usuario.
❌ Logros por tiempo en la app en vez de por valor logrado (incentiva adicción, no resultado).
❌ Comparación social que humilla: rankings globales que dejan a la mayoría como perdedores.
❌ Recompensas variables pagadas disfrazadas (loot boxes) — especialmente en apps con menores.
❌ Notificaciones > 2/día o no accionables.
```

**Test ético final:** *"¿Esta mecánica ayuda al usuario a lograr lo que vino a lograr, o solo lo mantiene pegado a la pantalla?"* Si es lo segundo, es un dark pattern — eliminarlo. La gamificación del SO retiene **dando valor real**, no explotando debilidades.

---

## CHECKLIST DE CIERRE — Gamificación

```
[ ] El loop central (gatillo→acción→recompensa→inversión) está nombrado en ESTADO.md
[ ] El número mágico (acción × cantidad × ventana que predice retención) está definido (hipótesis en ESTADO.md o dato de 36) y la gamificación está calibrada para empujar al usuario a cruzarlo
[ ] La curva de retención por cohorte se mide (36): se verifica que APLANE en meseta >0 antes de invertir en más mecánicas
[ ] Cada mecánica refuerza la acción que produce la primera victoria del usuario (archivo 01)
[ ] Las mecánicas elegidas corresponden al patrón de uso de la app (no se metieron todas "porque sí")
[ ] El cliente solo tiene SELECT sobre XP/racha/logros; no hay `for all` ni escritura directa
[ ] La RPC recibe action_id, no valores de recompensa; verifica acción, owner e idempotencia
[ ] SECURITY DEFINER usa search_path vacío, grants mínimos y fue probada vía llamada directa hostil
[ ] Racha: se muestra desde el día 2, hay streak freeze, reparación <48h, copy en clave de pérdida
[ ] Hitos celebrados en 7/30/100/365 con intensidad creciente (coherente con archivo 11)
[ ] Onboarding entrega el primer "aha" en <60s y pre-carga la racha en 1
[ ] Notificaciones: ≤1-2/día, a la hora activa, accionables, con control total en ajustes
[ ] Cada evento emocional (streak_extended en hito, level_up, achievement_unlocked,
    streak_broken, win_back) tiene su MOMENTO diseñado según 56-MOMENTOS-EMOCIONALES.md
    (pantalla/overlay con la voz del arquetipo de 11), no solo un toast
[ ] Cero anti-patrones de la lista de arriba
[ ] Test ético pasado en cada mecánica
```

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

- **`01-IDEACION.md`** define la *primera victoria* y la acción central — la gamificación las refuerza.
- **`02B-ONBOARDING-Y-PAYWALL.md`**: el onboarding gamificado ES la estrategia de conversión; la racha y los hitos alimentan el momento del paywall.
- **`11-DISENO-EMOCIONAL.md`** aporta el *tono* de las celebraciones (los 3 adjetivos) y la regla de celebrar solo hitos reales. Este archivo es el *sistema*; el 11 es la *emoción*.
- **`15-PATRONES-UX.md`**: empty states, feedback y "next best action" son los vehículos de las mecánicas.
- **`03-PRINCIPIOS-APP-EXITOSA.md`**: la retención es UX, no marketing — la gamificación es la herramienta concreta.
- **`36-ANALITICA-Y-EVENTOS.md`**: de aquí salen los datos para hallar el **número mágico** y medir la **forma de la curva de retención** por cohorte (`aha_alcanzado`, `sesion_iniciada`). La gamificación produce los eventos; 36 los lee para saber si la curva aplana.
