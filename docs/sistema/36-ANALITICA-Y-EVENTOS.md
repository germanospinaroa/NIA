# ANALÍTICA Y EVENTOS — Instrumentar el Producto para Decidir con Datos

> **Cuándo cargar este archivo:**
> - Al diseñar el flujo de la app, ANTES de traer tráfico (junto con `02C-PRICING-Y-MODELO-DE-NEGOCIO.md` y `34-ADQUISICION-Y-TRAFICO.md`)
> - Cuando los funnels que el SO promete medir (onboarding→paywall→pago en 02C, retención en 21/35) se están midiendo a ciegas
> - Siempre que vayas a tomar una decisión de producto o correr un A/B (junto con `37-FEATURE-FLAGS-Y-EXPERIMENTOS.md`)
>
> **Por qué existe:** El SO promete medir conversión, activación y retención en 02C, 21 y 35 — pero sin una **taxonomía de eventos** esos funnels se miden a ojo. No hay decisión de producto ni A/B real sin saber, evento por evento, dónde entra y dónde se cae el usuario. Este archivo define el contrato de analítica de producto: qué se mide, cómo se nombra y dónde se captura. Para adquisicion y monetizacion, las definiciones operativas de sesion, QA, atribucion y eventos de `60-OPERACION-DE-CONVERSION.md` son canónicas.

---

## PRINCIPIO: Sin taxonomía no hay decisiones, solo opiniones

La diferencia entre "creo que el paywall convierte mal" y "el 68% ve el paywall pero solo el 9% hace click" (cifras **ilustrativas**) es un sistema de eventos consistente. Sin él:

```
❌ "Parece que la gente se cae en el onboarding."   → opinión, no se puede actuar
✅ "paywall_visto: 1.240 · checkout_iniciado: 410 · trial_iniciado: 112" (ilustrativo)
   -> el cuello observado esta entre oferta y checkout; todavia hay que separar persuasion de
      navegacion fallida y friccion de Hotmart antes de atribuir causa.
```

**Regla de oro:** cada acción de valor de la app emite un evento, y el funnel completo está instrumentado **antes** de gastar el primer peso en tráfico (34). Medir después de lanzar es medir el humo.

> **Siembra los eventos AL CONSTRUIR, no en una "sesión de analítica" al final.** El error de secuencia típico: dejar toda la instrumentación para el lanzamiento. Pero los eventos de activación y retención (`aha_alcanzado`, `sesion_iniciada`, `event_log`) nacen pegados a la pantalla que los produce — el `aha_alcanzado` se emite donde ocurre la primera victoria, no se "añade después". Regla: cuando construyas la pantalla de una acción de valor, instrumenta su evento ahí mismo. La sesión de lanzamiento arma los funnels, la atribución por canal y los dashboards SOBRE eventos que ya existen — no los crea desde cero.

---

## HERRAMIENTA RECOMENDADA: PostHog (no GA4)

Para **analítica de producto** (funnels, retención por cohorte, session replay, feature flags), la recomendación del SO es **PostHog**, no Google Analytics 4.

```
POR QUÉ PostHog SOBRE GA4 PARA PRODUCTO:
- Open-source y autohospedable (puedes correrlo en tu propia infra si la privacidad lo exige).
- Free tier generoso (del orden de ~1M eventos/mes, cifra ILUSTRATIVA — verificar en posthog.com,
  los límites cambian) — sobra para un MVP y primeras ventas.
- Funnels, retención por cohorte y session replay vienen de fábrica; en GA4 son un dolor.
- Eventos con propiedades arbitrarias y identidad de usuario real (identify), no solo pageviews.
- Para A/B, PostHog aporta el **ANÁLISIS** del experimento: mide qué variante gana vía la propiedad
  `variant` en los eventos. OJO: el **flagging/asignación** de variantes NO vive en PostHog, vive en
  Supabase (37); no uses los flags de PostHog como la pieza que conecta. PostHog solo lee el resultado.
- Modelo de datos centrado en EVENTOS (no en sesiones/páginas como GA4) — que es como piensa
  un producto de suscripción.

GA4 es para MARKETING (tráfico de la landing, fuentes, campañas). Puede convivir:
  GA4 mide cómo llega la gente a la landing (34); PostHog mide qué hace DENTRO de la app.
```

> No mezclar responsabilidades: la landing puede usar Vercel Analytics o GA4 para tráfico; la app usa PostHog para producto. El backoffice (21) sigue siendo la vista en lenguaje claro para el dueño no-técnico.

---

## CONVENCIÓN DE NOMBRES: `objeto_accion` en snake_case

> **Nomenclatura canónica (reemplaza ejemplos previos).** Este archivo (36) es la **fuente única** de la taxonomía de eventos del SO y el wrapper se llama `track`. Cualquier nombre de evento en otros archivos —en particular los `trackEvent('view_pricing')`, `purchase`, `first_generation`, `day_streak` de `08-DEPLOY.md`— queda **derogado** por lo de aquí. Mapeo de los ejemplos viejos de 08 a la taxonomía canónica:
>
> | Viejo (08, camelCase/inglés) | Canónico (36, `objeto_accion`) |
> |---|---|
> | `view_pricing` | `paywall_visto` |
> | `purchase` | `primer_cobro_confirmado` |
> | `first_generation` | el evento **aha** de la app (`aha_alcanzado`, o el `consulta_creada`/objeto-real que defina el aha en 01) |
> | `day_streak` | `streak_extended` (nombre del contrato de 24 — vive en 24; en PostHog se refleja, no se redefine) |
>
> No uses `trackEvent` ni nombres en inglés/camelCase. Un solo wrapper: `track(evento, props)`.
>
> **⚠️ ÚNICA EXCEPCIÓN al snake_case español:** los eventos de gamificación conservan los nombres
> en inglés del contrato de 24 (`streak_extended`, `xp_awarded`, `achievement_unlocked`...) — 24 es
> su dueño y su fuente de verdad es el `event_log`. NO los traduzcas: traducirlos partiría el
> contrato y la serie histórica.

Un solo formato, sin excepciones. El nombre describe **qué objeto** y **qué acción**, en pasado, snake_case.

```
FORMATO: objeto_accion   (snake_case, acción en pasado)
  ✅ consulta_creada · paywall_visto · checkout_iniciado · primer_cobro_confirmado
  ❌ "Created Consulta" · "clickPaywall" · "PLAN_UPDATE" · "user did onboarding"

REGLAS:
- El OBJETO primero (consulta, paywall, plan, racha), la ACCIÓN después (creada, visto, actualizado).
- Verbo en PASADO: el evento registra algo que YA ocurrió.
- Nada de espacios, mayúsculas ni camelCase. snake_case siempre.
- Nombres ESTABLES: renombrar un evento parte la serie histórica. Elegir bien la primera vez.
```

**Propiedades consistentes (las mismas claves en todos los eventos donde apliquen):**

```
- plan: 'free' | 'trial' | 'pro'          (estado de suscripcion al momento del evento)
- session_id: sesion anonima first-party; vence tras 30 minutos de inactividad (ver 60)
- is_qa: true en pruebas `?qa=1`; el dashboard excluye la sesion completa
- source: origen normalizado; conservar first/last touch y click IDs durante 30 dias (ver 60)
- variant: variante de experimento si aplica (la inyecta 37)
- valor numérico del objeto cuando exista (ej: monto, duración, paso)
PROHIBIDO en propiedades: PII (email, nombre, teléfono), contenido sensible del usuario (ver 09).
```

---

## DICCIONARIO MÍNIMO DE EVENTOS (tabla de eventos canónicos)

Todo producto del SO instrumenta, como mínimo, estos cinco grupos. Adaptar los nombres del "objeto" a la app, pero **respetar la acción y el grupo**.

| Grupo | Evento canónico | Cuándo se emite | Propiedades clave |
|---|---|---|---|
| **Adquisicion** | `landing_vista` | landing util e interactiva, no prefetch | `source`, `session_id`, `is_qa` |
| **Activación / aha** | `app_abierta` | primera sesión del usuario | `source`, `plan` |
| | `aha_alcanzado` | el usuario vive la primera victoria (def. en 01) | `tiempo_a_aha_seg` |
| | `activacion_primera_victoria` | completó la primera victoria EN su primera sesión (benchmark: 34% promedio / 25% mediana — Lenny 2022) | `plan`, `source` |
| **Onboarding** | `onboarding_iniciado` | entra al primer paso | `source` |
| | `onboarding_paso_completado` | termina cada paso | `paso`, `total_pasos` |
| | `onboarding_completado` | llega al final del flujo | `pasos_saltados` |
| | `onboarding_abandonado` | sale sin terminar | `paso` (dónde se cayó) |
| **Resultado** | `resultado_visto` | aparece un resultado personalizado usable | `variant`, `session_id` |
| **Paywall** | `paywall_renderizado` | se monta el componente; evento diagnostico opcional | `variant` |
| | `paywall_visto` | precio, renovacion y CTA entran >=35% al viewport | `plan`, `variant` |
| | `paywall_plan_elegido` | selecciona mensual/anual | `plan_elegido`, `variant` |
| | `checkout_iniciado` | se inicia navegacion real a Hotmart | `plan_elegido`, `variant`, `sck` |
| | `checkout_abandonado` | derivado: checkout sin trial/cobro dentro de ventana definida | `plan_elegido`, `source`, `window_hours` |
| **Venta server-side** | `trial_iniciado` | webhook confirma trial real | `plan`, `ciclo`, `capturado` |
| | `primer_cobro_confirmado` | webhook confirma monto >0 | `plan`, `monto`, `ciclo`, `capturado` |
| | `trial_cancelado` | webhook confirma cancelacion pre-cobro | `dia_trial`, `motivo` |
| | `plan_actualizado` | alias legado de cambio de estado; no usar como KPI de compra | `estado_anterior`, `estado_nuevo` |
| **Acción core** | `consulta_creada` | ejecuta la función central de la app | `tipo`, `plan` |
| | (renombrar `consulta` al objeto real de la app) | | |
| **Retención** | `sesion_iniciada` | **una vez por día activo** (ver disparador abajo) | `plan`, `dias_desde_alta` |
| | `reactivacion_abierta` | vuelve tras notificación de re-enganche | `canal` |
| | `pagador_fantasma_detectado` | suscriptor activo sin sesión en 14+ días (derivado por job server-side sobre el `event_log`) — el segmento que más churnea en renovación y el más recuperable; dispara el radar de riesgo de 58 | `dias_sin_sesion`, `plan` |
| **Momentos (56)** | `momento_mostrado` | se renderiza un momento emocional del 56 (mide si los momentos se VEN y qué hace el usuario) | `momento_id` (m1..m7), `salida` (`cta`\|`dismiss`) |
| | `logro_compartido` | el usuario comparte la share card (M7); alimenta el factor K de referidos del 58 | `momento_id`, `canal` |

> **Disparador de `sesion_iniciada` (clave para D1/D7/D30).** Como el init usa `capture_pageview:false`, PostHog **no** tiene noción nativa de "día activo": la retención por cohorte depende enteramente de que este evento se emita **una sola vez por día**, deduplicado. Sin dedup, varios montajes el mismo día inflan la curva. Dos caminos válidos:
> 1. **Emitir al montar la app si la última visita fue antes de hoy**, deduplicado por fecha. Guardar `analytics_last_session_date` en `localStorage` (cliente) o en `profiles` (server-side, más robusto contra borrado de storage): si `!= hoy`, emitir `sesion_iniciada` y actualizar la fecha.
> 2. **Alternativa:** dejar `capture_pageview:true` y calcular la retención sobre el evento nativo `$pageview` de PostHog. Más simple, pero pierde el control de "evento explícito y nombrado" y carga cookies (revisar consentimiento/LGPD abajo).
>
> **Solapamiento con `app_abierta`:** `app_abierta` se emite **una sola vez en la vida del usuario** (primera sesión → numerador de activación). `sesion_iniciada` se emite **una vez por cada día activo** (incluida la primera → base de las cohortes de retención). El día de alta dispara **ambos**; no son redundantes.

```typescript
// lib/analytics.ts — dentro del wrapper, NUNCA posthog directo desde componentes.
export function trackSesionDiaria(plan: string, diasDesdeAlta: number) {
  if (typeof window === 'undefined') return;
  const hoy = new Date().toISOString().slice(0, 10);   // 'YYYY-MM-DD'
  if (localStorage.getItem('analytics_last_session_date') === hoy) return;  // ya contado hoy
  localStorage.setItem('analytics_last_session_date', hoy);
  track('sesion_iniciada', { plan, dias_desde_alta: diasDesdeAlta });
}
```

> Los eventos de **retención por gamificación** (rachas, XP, hitos) NO se redefinen aquí: viven en `24-GAMIFICACION.md` (`streak_extended`, `xp_awarded`, etc.) y se escriben en el `event_log` del servidor. PostHog refleja los que importan para funnels; no los duplica (ver coherencia abajo).

> **CURR semanal — métrica derivada, NO un evento nuevo.** Definición: % de usuarios activos de
> la semana N-1 que vuelve en la semana N (query sobre el `event_log`/`sesion_iniciada`, no un
> evento nuevo). Es la métrica prioritaria post-lanzamiento: en Duolingo tuvo 5-6x el impacto de
> cualquier otra palanca sobre el DAU (Lenny's 2022). Se lee en el backoffice (`21`).
>
> **Calibración rápida (la tabla completa vive en 24):** DAU/MAU 20% bueno / 50%+ excepcional
> (Lenny/Sequoia 2023-24) · 7% de retorno en D7 = top 25% (Amplitude 2024) · usuarios a 6 meses
> en consumer subscription: 40% bueno / 70% excelente (Lenny + Casey Winters).

---

## SALIR NO ES UNO: SALTAR Y ABANDONAR SON DOS PROBLEMAS DISTINTOS

`onboarding_abandonado` con la propiedad `paso` dice **dónde** se cae la gente. No dice **cómo**, y
esas son dos cosas con arreglos opuestos:

| Cómo sale | Qué significa | Qué se arregla |
|---|---|---|
| **Salta** (usa la salida que le diste) | La pantalla no convence, pero el recorrido sigue | El copy o el valor de esa pantalla |
| **Abandona** (cierra la app ahí) | La pantalla lo expulsa del producto | La pantalla sobra, o pide demasiado |

Sin distinguirlos, el equipo puede pasar días puliendo el texto de una pantalla que en realidad
había que quitar — o quitar una que solo necesitaba una frase distinta.

**Cómo se distingue: eventos de SALIDA EXPLÍCITA en toda pantalla que pida algo** (un dato, un
permiso, una decisión). Un evento por cada forma de salir hacia adelante:

```
paso_alcanzado           → llegó a la pantalla
paso_completado_con_X    → siguió Y entregó lo que se le pedía
paso_completado_sin_X    → siguió SIN entregarlo (si el campo es opcional)
paso_omitido             → usó la salida explícita ("prefiero no decirlo", "ahora no")

Los que se fueron en silencio = paso_alcanzado − (los otros tres)
```

La resta cierra sola y no hace falta un evento de "abandono": **el abandono es lo que queda**, y esa
es justamente la cifra que ninguna herramienta puede darte sin que la instrumentes.

> ⚠️ **Un dato real que vale por el patrón:** en un onboarding con salida explícita disponible, de 9
> personas que llegaron a la pantalla de datos, 2 continuaron y **cero** usaron la salida. Las otras
> 7 cerraron la app. La conclusión ("esa pantalla expulsa, y el botón de salida que pusimos no lo usa
> nadie") era imposible de alcanzar sin los tres eventos separados. El número es de un caso; el
> patrón —que "salta" y "abandona" hay que medirlos aparte— es universal.

---

## RETOMAR NO ES AVANZAR (no re-disparar eventos al restaurar estado)

Si el producto guarda el progreso y permite continuar donde se quedó, al restaurar **no se vuelven a
emitir los eventos de los pasos ya alcanzados**. Si se emiten, el embudo dice que más gente llegó a
esa pantalla de la que realmente la superó, y la etapa que sangra se camufla.

```
Al restaurar: registrar el paso de arranque y NO emitir su evento.
Emitir solo cuando el usuario AVANCE por sí mismo.
Si interesa medir el regreso, va un evento propio (`sesion_retomada`), nunca el del paso.
```

⚠️ Efecto lateral esperado y correcto: el evento del último paso restaurable **cuenta de menos**
frente a los eventos posteriores. Hay que anotarlo donde se lea el embudo, o alguien lo leerá como
una incoherencia.

---

## EVENTOS CONTAMINADOS POR TERCEROS (los que no puedes usar)

Cuando la pasarela de pago, un afiliado o una integración externa comparte tu mismo identificador de
medición, sus eventos se mezclan con los tuyos bajo el mismo nombre. El síntoma es una imposibilidad
aritmética: **más "inicios de pago" que "vistas del paywall"**, cuando el botón de pago solo existe
dentro del paywall.

```
Señal de contaminación: la herramienta marca el evento como proveniente de
varias fuentes/integraciones a la vez, mientras tus eventos propios aparecen
con una sola.

Regla: un evento con más de una fuente NO sirve para juzgar tu embudo.
Para cada etapa que te importe, tener un evento PROPIO con nombre propio.
```

Esto no se arregla, se aísla: el evento compartido sigue siendo útil para la plataforma de anuncios
(que necesita la conversión), y el evento propio es el que se usa para diagnosticar.

---

## UNA PREDICCIÓN ESCRITA ANTES DE CADA CAMBIO

Un cambio sin predicción no genera aprendizaje: pase lo que pase, siempre hay una explicación a
posteriori. Antes de publicar un cambio dirigido a mover una métrica, se escribe en `ESTADO.md`:

```
CAMBIO: ___
HIPÓTESIS: ___ (por qué debería funcionar)
PREDICCIÓN: la métrica ___ pasa de ___ a ___ (número concreto)
SE MIDE: con el evento ___, cuando haya ___ sesiones (umbral de `60`)
SI FALLA: qué queda descartado ___
```

El valor está en la última línea. Una predicción que falla **elimina una hipótesis**, que es
progreso real; una intuición que falla no elimina nada porque nunca fue explícita.

> Ejemplo real del patrón: se hizo opcional un campo obligatorio prediciendo que el paso de esa
> pantalla subiría a ~85%. Salió 20%. La predicción fallida descartó de golpe la hipótesis "el campo
> obligatorio es la causa" y redirigió el trabajo. Sin el número escrito antes, el resultado se
> habría leído como "mejoró un poco" y se habría seguido en la dirección equivocada.

---

## MAPA: evento → funnel → North Star

Los eventos no son un fin; existen para alimentar funnels y métricas de negocio. Así se conectan con 02C y 21.

```
FUNNEL DE ACTIVACION Y MONETIZACION (60) — la cadena que decide el revenue:
  landing_vista -> onboarding_iniciado -> onboarding_paso_completado -> resultado_visto
  -> paywall_visto -> checkout_iniciado -> trial_iniciado -> aha_alcanzado
  -> primer_cobro_confirmado

  Cada flecha es una tasa de conversión. PostHog dibuja este funnel y marca el paso que sangra.
  Es el MISMO funnel que 02C promete optimizar — ahora medido, no supuesto.

FUNNEL DE RETENCIÓN (58) — ¿vuelven?
  sesion_iniciada agrupado por cohorte de alta → curvas D1/D7/D30.
  CURR semanal (activos de la semana N-1 que vuelven en N, sobre sesion_iniciada) → la métrica
  prioritaria post-lanzamiento (definición arriba; doctrina en 24, lectura en 21).
  reactivacion_abierta mide si el re-enganche de 24/58 de verdad trae gente de vuelta.
```

**De evento a North Star (21):** las métricas de negocio del backoffice se calculan cruzando eventos con los datos de Hotmart:

```
- Activación = aha_alcanzado / app_abierta
- Interes en oferta = checkout_iniciado / paywall_visto
- Puente Hotmart = trial_iniciado / checkout_iniciado
- Trial a pago = primer_cobro_confirmado / trial_iniciado
- Retención D7 = usuarios con sesion_iniciada en día 7 / cohorte   → entra en LTV ≈ ARPU/churn
- Tiempo a aha = propiedad tiempo_a_aha_seg   → predictor temprano de retención
```

> PostHog responde "¿dónde se cae el funnel y qué variante gana?"; el backoffice (21) responde "¿gano dinero al crecer?" (LTV/CAC/payback). Se complementan, no compiten.

---

## IMPLEMENTACIÓN

### 1. SDK de PostHog en el cliente (captura de interacción)

```typescript
// lib/analytics.ts — wrapper único; NUNCA llamar a posthog directo desde componentes.
// TODO lo de PostHog (init, track, identify, reset) vive AQUÍ. Los componentes solo importan
// estas funciones, jamás `posthog-js` directo.
import posthog from 'posthog-js';

export function initAnalytics() {
  if (typeof window === 'undefined') return;
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,  // host EXPLÍCITO: us (us.i.posthog.com) o eu
                                                     // (eu.i.posthog.com) — define dónde residen los
                                                     // datos (relevante para LGPD; ver Privacidad/09)
    capture_pageview: false,            // capturamos eventos de producto, no pageviews ciegos
    // persistence default ('localStorage+cookie'): necesaria para que identify() COSA la actividad
    // anónima previa al registro. Con persistence:'memory' una recarga antes de registrarse PIERDE
    // el cosido anónimo→identificado. Cárgala SOLO tras consentimiento (ver Privacidad/LGPD).
    autocapture: false,                 // solo eventos explícitos y nombrados → datos limpios
  });
}

// Un único punto de entrada: el nombre snake_case + propiedades consistentes.
export function track(evento: string, props: Record<string, unknown> = {}) {
  posthog.capture(evento, props);
}

// Identidad: vincular eventos anónimos con el usuario real EN el registro/login, no antes.
export function identifyUser(userId: string, plan: string, source: string) {
  posthog.identify(userId, { plan, source });   // SIN email ni nombre: solo claves no-PII
}
export function resetAnalytics() {
  posthog.reset();   // en logout: corta la identidad para no mezclar usuarios en un mismo equipo
}
```

```typescript
// Uso en un componente — el nombre sigue la convención objeto_accion.
import { track } from '@/lib/analytics';

function observarOferta(node: HTMLElement, plan: string, variant: string) {
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) return;
    track('paywall_visto', { plan, variant });
    observer.disconnect();
  }, { threshold: 0.35 });
  observer.observe(node);
  return () => observer.disconnect();
}
```

### 2. Identificación de usuario (`identify`)

`identifyUser`/`resetAnalytics` viven **dentro del wrapper** (`lib/analytics.ts`, arriba) — no se llama a `posthog` directo desde el componente. Tras autenticar con Supabase:

```typescript
// Tras el login (Supabase) — asocia la sesión anónima con el user_id estable.
import { identifyUser, resetAnalytics } from '@/lib/analytics';

identifyUser(user.id, plan, source);   // en login
// resetAnalytics();                    // en logout

// Por qué importa la persistencia: con la cookie/localStorage por defecto, los eventos emitidos
// ANTES del registro (anónimos) se cosen al user_id en identify(). Con persistence:'memory' ese
// historial anónimo se pierde si el usuario recarga antes de registrarse.
```

### 3. Captura server-side de eventos críticos (no perder la conversión por adblockers)

El evento más importante — el **pago** — NO puede depender del navegador: los adblockers bloquean el SDK y perderías conversiones. La conversión real se captura en el **servidor**, desde el webhook de compra (18).

```typescript
// app/api/webhooks/hotmart/route.ts — al confirmar la compra (ver 18-VENTA-HOTMART).
import { PostHog } from 'posthog-node';

// flushAt:1 + flushInterval:0 → cada capture se envía de inmediato; no queda nada en buffer
// entre invocaciones. En serverless el contenedor se REUTILIZA: si hicieras ph.shutdown() por
// request, la 2ª invocación usaría un cliente ya apagado y PERDERÍA el evento.
const ph = new PostHog(process.env.POSTHOG_KEY!, {
  host: process.env.POSTHOG_HOST,
  flushAt: 1,
  flushInterval: 0,
});

export async function registrarPrimerCobro(userId: string, monto: number, ciclo: 'mensual' | 'anual') {
  ph.capture({
    distinctId: userId,                       // MISMO id que identify() en el cliente → se unen
    event: 'primer_cobro_confirmado',
    properties: { plan: 'pro', monto, ciclo, capturado: 'server' },
  });
  await ph.flush();                            // vacía el buffer al final del request (NO shutdown)
}

// ph.shutdown() se reserva para el CIERRE del proceso (scripts/cron de larga vida), NO por request.
// En serverless basta con flush(); el cliente module-scope se reutiliza entre invocaciones.
```

> **Regla de captura server-side:** todo evento que (a) mueve dinero, (b) viene de un webhook, o (c) es la base de una decisión de pago/A/B, se captura en el servidor con el mismo `distinctId`. Los eventos de pura interaccion van en el cliente. Trial y primer cobro viven en `trial_iniciado` y `primer_cobro_confirmado` server-side; `checkout_iniciado` vive en el cliente. Nunca colapsarlos bajo `plan_actualizado`.

`checkout_abandonado` no se dispara con `beforeunload`: se deriva por job cuando existe
`checkout_iniciado` y no aparece `trial_iniciado`/`primer_cobro_confirmado` para la misma identidad
de atribución dentro de la ventana acordada. Así no se cuentan recargas o demoras como abandono.

### 4. Variables de entorno (4, separadas cliente/servidor)

PostHog se usa desde **dos** contextos y cada uno tiene su par de variables. El host es **explícito** (us = `https://us.i.posthog.com`, eu = `https://eu.i.posthog.com`); fijarlo importa para residencia de datos / LGPD (09) y para el discurso de autohospedaje (si autohospedas, apunta a tu propia URL).

```env
# .env.local / Vercel — CLIENTE (prefijo NEXT_PUBLIC_, se incrustan en el bundle; la project key
# de PostHog es pública por diseño, no es un secreto):
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com   # us o eu — elegir explícito (o tu self-host)

# SERVIDOR (sin prefijo, solo se leen en el BFF/webhook — ver 08-DEPLOY):
POSTHOG_KEY=phc_xxxxxxxx                              # puede ser la misma project key
POSTHOG_HOST=https://us.i.posthog.com                # el MISMO host que el cliente
```

> Las del servidor van marcadas SOLO en los entornos que correspondan en Vercel (Production/Preview), igual que el resto de secretos (ver 08 — scoping de secretos por entorno).

---

## ATRIBUCIÓN POR CANAL — cómo se llena `source` (cierra el círculo con 34 y 21)

La propiedad `source` (y la columna `profiles.source` que lee el backoffice 21) aparece en medio mundo del SO, pero nadie sin esto explica CÓMO se llena. Esta es la cadena completa, de extremo a extremo:

```
1. EL ENLACE TRAE LA ETIQUETA: el tráfico de 34 llega a la landing (19) con una etiqueta de canal
   en la URL — el `src` de Hotmart y/o los UTM (ej. ...?src=meta_dolor&utm_source=meta).
2. LA LANDING LA GUARDA Y LA ARRASTRA: al cargar, lee esos parámetros y los guarda (localStorage o
   cookie de 1ª parte, tras consentimiento). Al construir el botón de checkout de Hotmart, les
   AÑADE AMBOS: `src` (alimenta los reportes de Hotmart) y `sck` (el que SÍ viaja en el payload
   del webhook) — ...checkout?src=meta_dolor&sck=meta_dolor. Así la etiqueta viaja con la compra.
3. EL WEBHOOK LA PERSISTE: cuando Hotmart confirma el pago, su webhook (18) trae el `sck` (y, si fue
   por afiliado, el id del afiliado). El handler lo escribe en `profiles.source` del usuario recién
   creado — fuente de verdad server-side, inmune a adblockers.
4. ANALÍTICA E IDENTIDAD LO LEEN: `identifyUser(userId, plan, source)` y CADA evento llevan ese
   `source` como propiedad. Si no hubo `src` pero sí afiliado → `source = 'afiliado:<id>'`.
```

```typescript
// Captura en la landing (una vez, al cargar) — se arrastra al checkout y sobrevive a la navegación.
function capturarOrigen() {
  if (typeof window === 'undefined') return;
  const p = new URLSearchParams(window.location.search);
  const src = p.get('src') ?? p.get('utm_source');
  if (src && !localStorage.getItem('attrib_source')) {
    localStorage.setItem('attrib_source', src);     // primer toque gana (no sobrescribir)
  }
}
// Al construir el link de checkout de Hotmart, anexar la etiqueta guardada en AMBOS parámetros
// (src para reportes de Hotmart; sck es el que viaja en el webhook — reconciliar por sck, como 60):
//   const tag = encodeURIComponent(localStorage.getItem('attrib_source') ?? 'directo');
//   `${CHECKOUT_URL}?src=${tag}&sck=${tag}`
```

> **Por qué cierra el círculo:** con `source` poblado así, PostHog parte cualquier funnel por canal (¿qué fuente convierte mejor de paywall a pago?) y el backoffice (`21`) calcula **CAC y LTV por canal** — exactamente lo que `34` necesita para decidir qué canal escalar y cuál matar. Sin este traspaso `sck`→webhook→`profiles.source`, `source` queda vacío y la atribución de `34`/`21` no existe.

---

## PRIVACIDAD (enlaza 47 — LGPD)

La analítica no exime del cumplimiento. En LATAM aplica la LGPD (Brasil) y leyes equivalentes (ver `47-LEGAL-FISCAL-Y-PRIVACIDAD.md`).

```
- CONSENTIMIENTO: no cargar cookies de analítica hasta que el usuario acepte. Patrón: arrancar SIN
  inicializar PostHog (o con persistence:'memory' temporal) y, AL consentir, inicializar con la
  persistencia por defecto ('localStorage+cookie'). Tradeoff a documentar: si nunca se eleva la
  persistencia, identify() NO cose la actividad anónima previa (se pierde al recargar) — por eso el
  cosido anónimo→identificado solo funciona con persistencia real, post-consentimiento.
- NADA DE PII en propiedades de eventos: ni email, ni nombre, ni teléfono, ni contenido sensible
  que el usuario haya escrito. Usar user_id (uuid) como identidad, no el email.
- IP y datos sensibles: deshabilitar la geolocalización por IP si no la necesitas; si autohospedas
  PostHog, los datos no salen de tu infra (ventaja clave sobre GA4 para nichos de salud/finanzas).
- DERECHO AL OLVIDO: PostHog permite borrar a una persona por distinctId → conéctalo al flujo de
  baja de cuenta (09).
```

---

## CHECKLIST DE CIERRE — Analítica y eventos

```
[ ] PostHog instalado; wrapper único track()/identify() (sin llamadas sueltas al SDK)
[ ] Convención objeto_accion (snake_case, pasado) aplicada a TODOS los eventos
[ ] Propiedades consistentes (plan, source, variant) y CERO PII en propiedades
[ ] Los 5 grupos del diccionario instrumentados (activación, onboarding, paywall, core, retención)
[ ] Funnel de 60 (`landing_vista`->...->`primer_cobro_confirmado`) armado ANTES del trafico
[ ] `paywall_visto` usa visibilidad real; render y exposicion no estan mezclados
[ ] `checkout_iniciado`, `trial_iniciado` y `primer_cobro_confirmado` separados
[ ] Trial y primer cobro capturados SERVER-SIDE desde el webhook (18), no en cliente
[ ] Sesion anonima de 30 min, atribucion 30 dias y click IDs implementados
[ ] `?qa=1` marca y excluye la sesion completa del dashboard comercial
[ ] identify() en login con user_id (no email); reset() en logout
[ ] Consentimiento antes de cookies de analítica; persistence en memoria hasta aceptar (09/LGPD)
[ ] Cada acción de valor emite su evento; el funnel está instrumentado antes del tráfico
[ ] Sin duplicar el event_log de 24: PostHog = analítica de producto; event_log = verdad server-side
```

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

- **`02C-PRICING-Y-MODELO-DE-NEGOCIO.md`**: define el funnel onboarding→paywall→pago; este archivo lo **instrumenta** evento por evento para que deje de medirse a ciegas.
- **`21-BACKOFFICE.md`**: define el `event_log` server-side y las métricas de negocio (LTV/CAC). PostHog mide funnels y A/B; el backoffice traduce a lenguaje claro y a economía. Se complementan.
- **`24-GAMIFICACION.md`**: dueño de los eventos de retención (`streak_extended`, `xp_awarded`...) escritos en el `event_log`. Aquí NO se duplican: `event_log` = fuente de verdad para lógica de negocio/retención; PostHog = analítica de producto/funnels.
- **`34-ADQUISICION-Y-TRAFICO.md`**: el funnel debe estar instrumentado ANTES de pagar por tráfico; la etiqueta de canal de 34 viaja al checkout (`src`+`sck`) → webhook (`sck`) → `profiles.source` (ver "Atribución por canal" arriba), y ese `source` es lo que permite a 21 calcular el CAC por canal.
- **`58-RETENCION-DE-INGRESOS.md`**: las curvas D1/D7/D30 y `reactivacion_abierta` miden si el re-enganche funciona; `logro_compartido` alimenta su factor K de referidos.
- **`56-MOMENTOS-EMOCIONALES.md`**: `momento_mostrado` y `logro_compartido` miden si los momentos emocionales (racha en riesgo, hitos, share card) se ven y convierten — sin estos eventos, el 56 se opera a ciegas.
- **`37-FEATURE-FLAGS-Y-EXPERIMENTOS.md`**: el **flagging/asignación** de variantes vive en Supabase (37); este archivo solo **mide** el efecto del experimento. PostHog aporta el análisis (qué variante gana), no la asignación — no se usan sus flags como la pieza que conecta. La propiedad `variant` es el puente entre ambos.
- **`47-LEGAL-FISCAL-Y-PRIVACIDAD.md`**: consentimiento, LGPD, no-PII y derecho al olvido aplican a toda la analítica.
- **`18-VENTA-HOTMART.md`**: el webhook es el origen server-side de `trial_iniciado` y `primer_cobro_confirmado`.
- **`60-OPERACION-DE-CONVERSION.md`**: contrato del funnel comercial, sesiones, QA, atribucion y diagnostico; prevalece para conversion.
