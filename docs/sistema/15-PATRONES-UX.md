# PATRONES UX DE ALTO IMPACTO — Lo que Separa al 5% que Sobrevive

> **Cuándo cargar este archivo:**
> - SIEMPRE que se diseñe el flujo, el onboarding, los estados o la navegación de una app
> - Junto con `14-LEYES-DE-DISENO.md` (las leyes visuales) y `11-DISENO-EMOCIONAL.md` (la personalidad)
> - Si la pantalla vende, cobra o convierte (no solo orienta), el copy persuasivo vive en
>   `52-COPY-VISUALES-CONVERSION.md` (fórmula 4 U's + los 12 patrones reales de Duolingo/Cal AI/
>   Tiimo/Flo/Asana en "2bis") — este archivo cubre el patrón de INTERACCIÓN, no el copy de venta.
>
> **Por qué existe:** La app promedio pierde el 77% de sus usuarios activos en 3 días y el 90% en 30 días. Eso no es un problema de marketing ni de features — es UX. Este archivo recoge los patrones de mayor impacto en retención, con su implementación exacta: los compartidos por las apps del decil superior (Duolingo, Calm, Revolut, Linear, Notion, Strava). Las cifras de impacto son ÓRDENES DE MAGNITUD ILUSTRATIVOS (no verificados) salvo donde se atribuye fuente — sirven para priorizar, no para prometer resultados.

---

## LAS LEYES ATEMPORALES DE UX (referencia rápida)

Teoría conocida (Norman, Nielsen, Yablonski) — lo que importa es la regla accionable:

| Ley | Regla accionable |
|---|---|
| Hick | Menos opciones por pantalla; lo avanzado se revela progresivamente. |
| Miller | Agrupar en chunks; nunca pedir que el usuario recuerde más de unos pocos elementos. |
| Fitts | CTA principal grande y en la zona del pulgar (tercio inferior en mobile). |
| Jakob | No reinventar patrones comunes: la app funciona como las que el usuario ya conoce. |
| Tesler | La complejidad irreducible la absorbe la app por dentro, nunca el usuario. |
| Von Restorff | El CTA primario destaca visualmente de todo lo demás (regla del acento). |
| Endowed progress (Nunes & Drèze 2006) | Progreso visible con arranque regalado ("2 de 3 pasos") empuja a completar. |
| Doherty | Toda interacción responde en <400ms (real o percibido — ver abajo). |
| Estética-usabilidad | Lo que se ve cuidado se percibe más fácil de usar y se perdona más. |
| Heurísticas de Nielsen | Estado del sistema visible, control/libertad, prevención de errores, consistencia — ya repartidas en los checklists de `03` y este archivo. |

---

## LA PRIMERA IMPRESIÓN — Los Datos que lo Cambian Todo

```
- El usuario forma una opinión de tu interfaz en 50 MILISEGUNDOS (estudio Lindgaard et al.,
  confirmado por NN/G). Antes de leer nada, ya decidió si se ve confiable o amateur.
  → Por eso el nivel visceral del diseño (archivo 14) decide antes que cualquier argumento.
- El 77% de los usuarios abandonan una app en los primeros 3 días (datos de Quettra,
  popularizados por Andrew Chen); la mayor parte del churn ocurre en la primera semana.
- Un buen onboarding puede aumentar la retención hasta ~50% (cifra ilustrativa del sector, no verificada).
- Subir la retención apenas 5% puede aumentar la ganancia 25% o más (Bain & Company,
  estudio clásico de Reichheld). La retención es el
  multiplicador de rentabilidad #1 — y su mayor palanca es la primera experiencia.
- El churn ocurre TEMPRANO: la mayoría que se va, se va ANTES de experimentar el valor.
  Por eso todo el peso está en llevar al usuario a su "momento aha" lo más rápido posible.
```

---

## TABLA DE IMPACTO (qué priorizar cuando hay que elegir)

```
PATRÓN                          IMPACTO (ilustrativo, no verificado)  PRIORIDAD
Autenticación sin fricción      +30-50% completación de registro      🔥 Crítico
Onboarding progresivo           +15-25% retención día 1               🔥 Crítico
Personalización / Next action   +20-30% retención día 30              🔥 Crítico
Empty states que activan        +30-40% tasa de activación            🔥 Alto
Micro-interacciones / feedback  +30-40% rendimiento percibido         🔥 Alto
Navegación por gestos           +10-15% completación de tareas        ⚡ Medio-alto
Rendimiento percibido (skeleton)+40-70% reducción de espera           🔥 Alto
```
> ⚠️ Las cifras de esta tabla son datos ilustrativos de orden de magnitud, sin fuente verificada.
> Úsalas SOLO para priorizar entre patrones; la prioridad relativa sí es sólida.

Si hay que construir patrones dentro de una app vendible, el orden depende de la secuencia maestra:
primero valor visible/onboarding, luego auth sin fricción cuando toque, después empty states,
feedback/micro-interacciones, personalización y gestos. El rendimiento percibido se aplica
transversalmente a todo. No interpretar esta lista como permiso para poner login antes del valor:
la secuencia canonica sigue siendo `landing -> onboarding -> paywall -> login/auth -> app interna`
salvo que `02B` haya elegido explicitamente hard paywall.

---

## 1. RENDIMIENTO PERCIBIDO — La UX Más Rentable que Existe

La verdad incómoda: **mejorar cómo se SIENTE la velocidad rinde más que mejorar la velocidad real.** Una app que carga datos en 800ms pero transiciona suave se siente más rápida que una que carga en 400ms pero corta en seco entre pantallas.

### Regla de oro
Estos patrones mejoran la experiencia subjetiva más que inversiones equivalentes en rendimiento real. Aplicarlos SIEMPRE.

### Skeleton screens — el spinner está prohibido
El spinner genérico es un anti-patrón en 2026. No comunica nada: el usuario no sabe qué viene ni cuánto falta. El skeleton (formas placeholder con las dimensiones del contenido real) reduce notablemente la espera percibida (dato ilustrativo, no verificado: 40-70%) y casi elimina el gesto de "¿está roto?" (cerrar o recargar la app).

```
Reglas del skeleton:
- Debe imitar la forma y dimensiones del contenido final (no rectángulos genéricos)
- Animación shimmer sutil (gradiente que se desplaza) = "procesando", no "colgado"
- Mantiene la estabilidad del layout: cuando llega el contenido, NADA salta (CLS = 0)
- Desaparece progresivamente conforme carga, no todo de golpe
```

### Escala de Respuesta a la Latencia (qué mostrar según cuánto tarde)
```
< 100ms       → Sin indicador. Se siente instantáneo. No molestar.
100ms - 1s    → Spinner inline en el elemento específico + deshabilitar interacción
                (prevenir doble-tap). NO bloquear toda la pantalla.
1s - 3s       → Skeleton screen con la forma del contenido + shimmer.
                Mantener la UI responsiva.
3s+           → Estado de carga claro + indicador de progreso (determinado si se puede)
                + permitir cancelar. Mensajes que rotan si aplica.
```

### Streaming de respuestas de IA (el patrón que cambia la emoción de la espera)
Antes del primer token hay 0.5-2s de delay mientras el modelo procesa. En esa ventana la UI NUNCA debe estar en blanco — va un skeleton. Luego, los tokens aparecen en streaming:
```
- Conexión por streaming (SSE/WebSocket), append de cada chunk al DOM
- Cursor de streaming: una barra vertical de 2px parpadeando a 500ms mientras llega contenido
- Al completar, el cursor desaparece
- Esto convierte la espera de "¿está roto?" a "estoy recibiendo algo compuesto para mí"
```

### Optimistic UI (velocidad sin esperar)
Para acciones de alta frecuencia y bajo riesgo (toggle, like, reordenar, guardar): actualizar la UI INMEDIATAMENTE asumiendo éxito; si el servidor falla (raro), revertir y explicar. Elimina la latencia percibida en la mayoría de operaciones.

---

## 2. ONBOARDING PROGRESIVO — Valor Antes de Compromiso

El primer minuto define si el usuario se queda. Las apps del decil superior comparten un patrón: una primera acción significativa, divulgación progresiva, y un empty state que se siente lleno.

### El "Momento Aha" — el corazón del onboarding
El momento aha es cuando el producto pasa de "algo que estoy probando" a "algo que necesito" — cuando el usuario experimenta el valor por primera vez. Todo el onboarding existe para llevarlo ahí lo más rápido posible.
```
- Identificar EL momento aha de tu app: la acción específica tras la cual los usuarios se
  quedan (no es registrarse ni completar el tour — es la primera vez que sienten el valor).
  Ej: en una app de generación, es ver su primer resultado útil. En un tracker, su primer registro.
- Las empresas que identifican y optimizan su momento aha ven mejoras grandes de activación (dato ilustrativo, no verificado: 2-3x en 90 días).
- Diseñar el onboarding entero como el camino más corto a ese momento. Eliminar todo lo que
  no acerque a él.
- Benchmark de activación: <20% = problema serio de onboarding; 20-40% típico; 40-60% bueno; >60% excelente.
```

### Reglas duras (las cifras de este bloque son ilustrativas, no verificadas — la dirección importa, no el número exacto)
```
- Cada pantalla extra de onboarding baja la finalización (ilustrativo: tours de UN paso ~75%
  de finalización; de cinco pasos, por debajo del 50%). Menos es más.
- La LONGITUD la define la estrategia de 02B según el nicho (B2B/utilidad ≤5 pantallas (ideal
  2-3); B2C emocional puede ser extenso con micro-compromisos). Cada paso introduce 1-2 conceptos MÁXIMO.
- Cada campo de formulario extra reduce la finalización (ilustrativo: 5-7%). Pedir el mínimo absoluto.
- El usuario hace una ACCIÓN REAL dentro del primer minuto (modelo Duolingo: a la lección
  antes de crear cuenta).
- El valor es obvio ANTES de pedir registro. Primero el WOW, después el signup.
- Divulgación progresiva (Hick's Law + NN/G): introducir features de a poco. Reduce el tiempo
  de completar tareas y mejora la comprensión (ilustrativo: 20-40%).
- Personalizar el onboarding (1 pregunta que adapta la experiencia) aumenta la activación
  vs un onboarding genérico igual para todos (ilustrativo: 30-50%).
- Nada de tours pasivos de 8 tooltips. El usuario aprende HACIENDO, no leyendo (Paradoja del
  Usuario Activo: nadie lee manuales, todos empiezan a usar de inmediato).
- Usar endowed progress: checklist con el primer paso ya marcado ("2 de 3 listo") motiva a completar.
```

### Estructura recomendada
```
Pantalla 1: Una pregunta que personaliza (con opciones predefinidas, no texto libre)
Pantalla 2: (opcional) Segunda pregunta de contexto
Pantalla 3: YA está usando la app, con un resultado de ejemplo precargado y un WOW inmediato
[El registro aparece DESPUÉS, cuando el usuario quiere guardar lo que ya logró]
```
> Esta estructura corta es el patrón B2B/utilidad; para B2C emocional, la versión extensa con micro-compromisos vive en `02B-ONBOARDING-Y-PAYWALL.md`.

Impacto ilustrativo (no verificado): +15-25% retención día 1.

---

## 3. EMPTY STATES QUE ACTIVAN — La Pantalla Más Subestimada

Un empty state no es "no hay datos". Es la primera pantalla que ve un usuario nuevo y la mayor oportunidad de activación que existe (impacto ilustrativo, no verificado: +30-40% en activación).

### Anatomía de un empty state que funciona
```
1. Ilustración o ícono con personalidad (no un cuadro gris vacío)
2. Título que NO dice "vacío": "Crea tu primera [X]" / "Aquí aparecerá tu [Y]"
3. Una frase que explica el valor: "Cada propuesta que generes vivirá aquí"
4. UN CTA claro y dominante hacia la primera acción
5. Opcional: un ejemplo o plantilla precargada que el usuario puede tocar para entender
```

### Los 3 tipos de empty state (cada uno se diseña distinto)
```
PRIMER USO:   "Nunca has creado nada aún" → máxima energía de activación + CTA grande
              + ejemplo precargado si es posible
RESULTADO VACÍO: "Tu búsqueda no encontró nada" → sugerir términos, ofrecer reset del filtro
ERROR/LOGRADO: "Completaste todo" → celebrar + sugerir el siguiente paso
```

Regla: el empty state se diseña con el MISMO cuidado que la pantalla llena. Nunca es un placeholder de "después lo arreglo".

---

## 4. AUTENTICACIÓN SIN FRICCIÓN — El Mayor Impacto en Conversión

El registro es el punto de mayor abandono. Reducir su fricción es la palanca de conversión #1 (impacto ilustrativo, no verificado: +30-50% en completación).

> Implementación del auth (passkeys/WebAuthn, OAuth, sesión y rotación de tokens, rate limits por endpoint, anti-enumeración) en `26-AUTH-MODERNO.md`. Aquí está el PATRÓN UX; ahí, el cómo técnico.

### Reglas
```
- Passwordless preferente: magic link, OAuth (Google mínimo), biométrico en mobile/PWA
- Mostrar valor ANTES de pedir cuenta (ver onboarding): el usuario se registra para GUARDAR
  lo que ya logró, no para empezar
- Pedir el mínimo absoluto: email O un solo tap de OAuth. Nada de formularios largos.
- Mensajes de error de login genéricos ("Credenciales inválidas") — nunca revelar si el email existe
- El "momento de onboarding oculto": la ventana de 0.5-2s entre "autenticado" y "primera pantalla
  con significado". No la desperdicies con un spinner — úsala para precargar y dar la bienvenida.
```

---

## 5. PERSONALIZACIÓN Y NEXT BEST ACTION — La Retención de Largo Plazo

Cuando la app sugiere la siguiente acción correcta según el contexto del usuario, reduce el esfuerzo de búsqueda y sube la completación (impacto ilustrativo, no verificado: +20-30% en retención día 30).

### Cómo implementarlo (sin sobre-ingeniería)
```
- "Siguiente acción": en vez de mostrar 8 opciones, la app destaca LA que más le conviene
  al usuario ahora, según su estado/progreso/hora del día
  Ejemplo: "Sube proteína primero. Te faltan 44g." (una acción, contextual, accionable)
- Dashboard personalizado: el orden de los módulos refleja lo que ESTE usuario usa más
- Contenido contextual: "Bienvenido de nuevo. Tienes 3 resultados guardados desde ayer."
- No requiere ML: reglas simples sobre el estado del usuario ya logran el 80% del efecto
```

Esto conecta con el momento WOW y el trigger de regreso de `02-VALIDACION.md`.

---

## 6. NAVEGACIÓN POR GESTOS — Limpia la UI, Acelera el Uso

Los gestos (swipe para volver, swipe para archivar, pull para refrescar) reducen los controles visibles en pantalla y hacen la app más rápida. Pero tienen un riesgo mortal: la descubribilidad.

### La regla que todos olvidan
**Si el usuario no sabe que un gesto existe, el gesto no existe.** Solución: divulgación progresiva — empezar con botones visibles, e introducir los atajos por gesto cuando el usuario demuestra competencia (modelo Superhuman: muestra los atajos inline hasta que el usuario empieza a usarlos, luego los desvanece).

### Reglas de accesibilidad (innegociables)
```
- TODO gesto necesita un fallback visible. Si swipe-para-borrar no tiene alternativa por tap,
  excluyes a usuarios con limitaciones motoras.
- Los gestos ACELERAN, no son la única puerta (no gatekeeping).
- Consistencia: si un swipe hace algo en la pantalla A, hace lo mismo en la B.
- Respetar los gestos del sistema (swipe-desde-el-borde para volver en iOS).
```

---

## 7. ESTADO EN EL URL / DEEP-LINKING — lo que separa "app web seria" de "SPA que olvida"

Una "app web seria" refleja su estado en el URL; una "SPA juguete" lo guarda solo en memoria y lo pierde al recargar. Si el usuario aplica un filtro, abre un tab, pagina o despliega un panel y al refrescar (o compartir el link) NADA de eso vuelve, la app se siente frágil. La regla: **el estado que el usuario puede observar y querer compartir/recuperar vive en el URL** (query params), no solo en `useState`.

```
QUÉ va al URL (estado navegable y compartible):
- Filtros y búsqueda activos (?q=...&cat=...)
- Tab/sección seleccionada (?tab=resumen)
- Paginación / orden (?page=3&sort=fecha)
- Panel/modal de detalle abierto (?item=42) → así un link abre directo en ese detalle
- Rango de fechas, vista (lista/grid), cualquier "dónde estoy" reproducible

QUÉ NO va al URL (efímero, no compartible):
- Texto a medio escribir en un input, hover, foco, estado de animación
- Secretos o datos sensibles (el URL se loguea, se comparte, queda en el historial)

POR QUÉ importa (no es cosmético):
- Compartibilidad: pegar el link reproduce EXACTO lo que el usuario veía. Soporte, equipo,
  redes → todos llegan a la misma vista. Es viralidad y es menos fricción de colaboración.
- Recargar no destruye el trabajo: el usuario refresca por error y sigue donde estaba.
- Botón atrás/adelante del navegador FUNCIONA (el usuario espera que funcione — Ley de Jakob).
- Deep-link real: campañas, emails y notificaciones pueden llevar a un estado preciso.
```

```
LINKS REALES, no onClick que navega:
- La navegación se hace con <a>/<Link> de verdad, NO con un <div onClick={() => router.push()}>.
- Un <a> real habilita Cmd/Ctrl+click (abrir en pestaña nueva), middle-click, "copiar enlace",
  y lo ve el lector de pantalla como link. Un div con onClick rompe todo eso silenciosamente.
- nuqs (librería) sincroniza estado React ↔ query params con una API tipo useState, sin
  perder el tipado ni reinventar el parseo/serialización.
```

> El PRINCIPIO UX vive aquí: el URL ES el estado, los links son reales, todo deep-linkeable. El
> DETALLE DE IMPLEMENTACIÓN (nuqs, parsers, shallow routing, debounce de filtros en el URL) vive
> en `43-MICRO-CRAFT-Y-EJECUCION.md`. Aquí el qué y el por qué; allá el cómo.

---

## 8. HÁPTICA — El Detalle Que Se Siente Premium

El feedback háptico (vibración sutil) hace que lo digital se sienta físico. Es el detalle invisible que separa una app cara de una barata. Siempre emparejar gestos y acciones clave con háptica.

### Cuándo y con qué intensidad (iOS: UIImpactFeedbackGenerator / web: navigator.vibrate)
```
Light (ligera):   confirmación de selección, toggle, llegar al final de una lista
Medium (media):   acción completada, item guardado, paso de onboarding superado
Heavy (fuerte):   error, acción destructiva, advertencia
Success/celebración: patrón doble corto al completar un hito

Web/PWA:
navigator.vibrate?.(10)            // confirmación sutil
navigator.vibrate?.([15, 50, 15])  // error / doble pulso
```

Reglas: siempre con opción de desactivar. Nunca vibración larga o molesta. Consistente con la personalidad (app seria = háptica discreta).

---

## SOSTENIBILIDAD / PESO DE ASSETS COMO UX — performance con propósito

El peso de los assets no es solo un tema de ingeniería (budget del 38): es UX y es retención. En las redes móviles LATAM (4G congestionada, 3G, planes prepago que cobran por MB), un asset pesado le cuesta al usuario tiempo, batería y DINERO real. Lo que carga rápido en una red mala retiene; lo que no, se cierra antes de verse.

```
- Auto-play de video = consumo masivo de datos y energía. En una red móvil cara, arrancar un
  video pesado solo en el fondo del hero puede gastarle al usuario varios MB que NO pidió →
  fricción y mala primera impresión (50ms deciden, ver arriba). Si va video: corto, comprimido,
  con poster, y idealmente que arranque por interacción, no auto-play en datos móviles.
- El "peso de assets" ES retención: el contenido que carga rápido en redes malas se ve; el que
  no, no existe (el usuario se fue antes). Cada MB ahorrado es un usuario más que llega al core.
- Sostenibilidad y UX apuntan al mismo lado: menos bytes = menos energía = más batería = carga
  más rápida = menos churn. No es un trade-off, es la misma palanca. Performance con propósito:
  no optimizas por deporte, optimizas porque el usuario LATAM lo paga si no lo haces.
```

> El número y el GATE del peso viven en `38-PERFORMANCE-BUDGET.md`; aquí está el porqué desde la
> UX/retención: en LATAM el peso es churn, y respetar la red del usuario es respetarlo a él.

---

## ANUNCIAR CONTENIDO DINÁMICO (aria-live) — no dejes ciego al lector de pantalla

Regla transversal, innegociable (WCAG AA). El momento aha de muchas apps ocurre en contenido que cambia SIN mover el foco: la respuesta de IA que aparece token a token, el toast de "+50 XP", el "¡Subiste a nivel 5!", el confeti de celebración. Para un usuario de lector de pantalla (VoiceOver/NVDA), si ese cambio no vive en una región *live*, **no existe**: el momento aha es invisible justo cuando importa. Hoy en el SO `aria-live`/`role="status"` solo se usaba para errores de formulario — hay que extenderlo a TODO contenido que se actualiza sin cambio de foco.

**La regla:** todo contenido que aparece o se actualiza sin que el foco se mueva hacia él debe vivir en una región live. Según urgencia:

```
Resultado de IA en streaming  → aria-live="polite" + aria-busy="true" mientras genera
                                 (al terminar, aria-busy="false"). No interrumpe; anuncia al pausar.
Toasts de éxito / XP ganada   → role="status" (polite). Se anuncia sin cortar la lectura actual.
Errores y level-up bloqueante → role="alert" (assertive). Interrumpe: el usuario debe enterarse ya.
Celebraciones / confeti       → texto equivalente en una región live ("¡Nivel 5 alcanzado!").
                                 El confeti es visual puro; sin texto live, el hito no se anuncia.
```

Claves de implementación:
- La región live debe existir en el DOM ANTES de llenarse (un contenedor vacío que se rellena). Si se monta junto con el texto, muchos lectores no lo anuncian.
- No abuses de `assertive`: resérvalo para lo que interrumpe (errores, hitos bloqueantes). Lo demás, `polite`.
- En streaming, no anuncies cada token (sería ruido): el `polite` agrupa y lee en las pausas; `aria-busy` comunica "sigo generando".

```tsx
// Resultado de IA en streaming + toast de XP + celebración accesible
function PantallaResultado({ texto, generando, xp, nivelNuevo }: Props) {
  return (
    <>
      {/* Streaming de IA: región polite, busy mientras genera */}
      <div
        aria-live="polite"
        aria-busy={generando}
        className="resultado-ia"
      >
        {texto}
        {generando && <span className="cursor-streaming" aria-hidden="true" />}
      </div>

      {/* Toast de XP: status = polite, no interrumpe */}
      {xp != null && (
        <div role="status" className="toast-xp">
          +{xp} XP ganada
        </div>
      )}

      {/* Celebración / confeti: el confeti es decorativo (aria-hidden);
          el hito se anuncia como texto en una región assertive */}
      {nivelNuevo != null && (
        <>
          <Confeti aria-hidden="true" />
          <div role="alert" className="sr-only">
            ¡Nivel {nivelNuevo} alcanzado!
          </div>
        </>
      )}
    </>
  );
}
```

> Esta regla se replica en el checklist de accesibilidad de `03-PRINCIPIOS-APP-EXITOSA.md` y se aplica específicamente en `24-GAMIFICACION.md` (XP, level-up) y `11-DISENO-EMOCIONAL.md` (celebraciones): cada celebración visual necesita su texto equivalente en una región live.

---

## CHECKLIST DE PATRONES UX (verificar en el flujo completo)

```
RENDIMIENTO PERCIBIDO
[ ] Cero spinners genéricos — skeleton screens con forma del contenido
[ ] Streaming con cursor (2px, parpadeo 500ms) en respuestas de IA
[ ] Contenido dinámico anunciado en regiones live: streaming IA (aria-live="polite" + aria-busy), toasts/XP (role="status"), errores/level-up (role="alert"), celebraciones con texto equivalente
[ ] Optimistic UI en acciones de alta frecuencia (toggle, like, guardar)
[ ] Escala de latencia respetada (<100ms nada, 1-3s skeleton, 3s+ progreso+cancelar)
[ ] Sin layout shift cuando llega el contenido (CLS = 0)

ONBOARDING Y ACTIVACIÓN
[ ] Longitud de onboarding según la estrategia de 02B (B2B/utilidad ≤3 pasos; B2C emocional puede ser extenso)
[ ] Acción real en el primer minuto, valor antes del registro
[ ] Empty states diseñados con CTA y energía de activación (los 3 tipos)
[ ] Divulgación progresiva (no todas las features de golpe)

AUTENTICACIÓN
[ ] Passwordless / OAuth / biométrico disponible
[ ] Mínimos datos pedidos, valor mostrado antes
[ ] Ventana post-login aprovechada (no spinner muerto)

PERSONALIZACIÓN
[ ] "Siguiente acción" contextual destacada (no 8 opciones equivalentes)
[ ] Mensaje de regreso personalizado

ESTADO EN EL URL / ASSETS
[ ] Filtros, tabs, paginación y paneles reflejados en query params (deep-linkeable, sobrevive al recargar)
[ ] Navegación con <a>/<Link> reales (Cmd+click / middle-click funcionan), no div onClick
[ ] Sin auto-play de video pesado en datos móviles; assets livianos (el peso es churn en LATAM)

GESTOS Y HÁPTICA
[ ] Todo gesto tiene fallback visible por tap
[ ] Gestos consistentes entre pantallas
[ ] Háptica en acciones clave con la intensidad correcta + opción de desactivar
[ ] Gestos del sistema (swipe-back) respetados
```
