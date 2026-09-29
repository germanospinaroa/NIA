# FEATURE FLAGS Y EXPERIMENTOS — Lanzar Gradual, Apagar Rápido, Medir de Verdad

> **Cuándo cargar este archivo:**
> - Antes de lanzar una feature nueva, cara o riesgosa (junto con `30-INTEGRACION-IA.md` para el kill-switch de IA)
> - Cuando quieras correr un A/B real (junto con `36-ANALITICA-Y-EVENTOS.md`, que mide el efecto)
> - Al probar variantes de onboarding o paywall (junto con `02B-ONBOARDING-Y-PAYWALL.md`)
>
> **Por qué existe:** El SO recomienda A/B testing en varios archivos (02B, 35), pero sin **feature flags** todo "A/B test" es irrealizable: no hay forma de mostrar variante A a unos y B a otros, ni de apagar una feature rota sin redeploy. Este archivo da la pieza que faltaba — flags para lanzar gradual, un kill-switch para apagar lo que se rompe, y un protocolo de experimentos honesto atado a la analítica de 36.

---

## PRINCIPIO: Separar el deploy del release

Subir código y activar una feature son dos cosas distintas. Un feature flag es un interruptor evaluado **en tiempo de ejecución** que decide si un usuario ve algo, sin tocar el código ya desplegado.

```
Esto te da TRES superpoderes que el SO daba por sentados sin tener la pieza:
1. ROLLOUT GRADUAL: enciende una feature para el 5%, mira los datos, sube al 100%.
2. KILL-SWITCH: una feature (o la IA, o el pago) se rompe → la apagas en segundos, sin redeploy.
3. EXPERIMENTOS A/B: muestras variante A vs B y mides cuál gana (con 36), no adivinas.
```

**Regla de oro:** toda feature nueva, cara o que toque dinero/IA nace detrás de un flag. El flag es barato; un redeploy de emergencia a las 2am, no.

---

## IMPLEMENTACIÓN SIMPLE: tabla `feature_flags` en Supabase, evaluada en el BFF

Para la mayoría de apps del SO basta una tabla en Supabase evaluada en el servidor (BFF / route handler de Next.js). PostHog también ofrece flags gestionados (ver al final); empezar simple.

```sql
-- Flags de la app. Una fila por flag.
create table feature_flags (
  key          text primary key,                 -- ej: 'nuevo_paywall', 'ia_resumen', 'kill_pago'
  enabled      boolean not null default false,    -- interruptor maestro (kill-switch: ponlo en false)
  rollout_pct  integer not null default 0 check (rollout_pct between 0 and 100),  -- % de usuarios
  variants     jsonb,                             -- para A/B: ['control','variante'] (opcional)
  updated_at   timestamptz not null default now()
);
alter table feature_flags enable row level security;
-- Los flags se evalúan en el BFF (servidor), NO en el cliente: por eso NO se da SELECT a `anon`.
-- Si dieras `using(true)` a anon, expondrías TODOS los flags (incl. roadmap oculto: kill_pago,
-- ia_resumen) vía la API REST de Supabase a cualquiera → fuga de roadmap. El servidor lee con
-- service_role (que salta RLS), así que aquí solo abrimos lectura a service_role explícitamente.
create policy "flags_read"  on feature_flags for select
  to service_role using (true);
-- ⚠️ ACLARACIÓN: service_role tiene `bypassrls` — NO pasa por las policies. Esta policy es
-- DOCUMENTACIÓN de la intención ("solo el servidor lee"), no seguridad: el control real es que
-- la secret key vive SOLO en el servidor (env var jamás expuesta al cliente).
-- Escritura SOLO para el dueño (rol admin desde el backoffice). OJO: `for all` con solo `using`
-- NO protege el INSERT (using filtra filas existentes; with check valida las nuevas) → hay que
-- declarar AMBOS, o un admin-falso podría insertar filas.
create policy "flags_admin" on feature_flags for all
  using ((select auth.jwt() ->> 'role') = 'admin')
  with check ((select auth.jwt() ->> 'role') = 'admin');
```

**Asignación determinista por una clave estable (hash → bucket).** Un usuario debe ver SIEMPRE la misma variante; nunca `Math.random()` (parpadearía entre A y B en cada carga y arruinaría el experimento).

> **Clave de bucketing y usuarios ANÓNIMOS — crítico.** El caso estrella (A/B del paywall de onboarding, 02B) ocurre ANTES del registro, y 36 ya captura eventos anónimos. Si bucketeas por `user_id`, el usuario no tiene `user_id` al inicio del funnel; y si lo bucketeas por algo que CAMBIA al hacer `identify`, el usuario SALTA de variante a mitad del funnel y contamina el experimento. **Regla:** usa una clave de asignación que exista ANTES del login y NO cambie tras el registro — el **`anonymous distinct_id` de PostHog** (o un uuid propio en cookie first-party), persistido y reusado tras `identify` (vía alias/merge de PostHog, que une el id anónimo con el `user_id`). Así un mismo humano conserva su bucket de punta a punta. Las firmas aceptan esa `assignmentKey` (el distinct_id anónimo cuando no hay `user_id`, el `user_id` cuando ya lo hay y coincide con el alias).

```typescript
// lib/flags.ts — evaluado en el SERVIDOR (BFF). Determinista: misma clave → mismo bucket.
import { createHash } from 'crypto';

// Entero del hash estable de (prefijo + flagKey + assignmentKey). 8 hex = 32 bits.
// `assignmentKey` = distinct_id ANÓNIMO de PostHog (o uuid en cookie) antes del login;
//  user_id después (mismo valor por el alias/merge), para no cambiar de bucket al identificarse.
function hashInt(prefix: string, flagKey: string, assignmentKey: string): number {
  const h = createHash('sha256').update(`${prefix}:${flagKey}:${assignmentKey}`).digest('hex');
  return parseInt(h.slice(0, 8), 16);   // 0 .. 0xFFFFFFFF
}

export type Flag = { enabled: boolean; rollout_pct: number; variants?: string[] };

// ¿Este usuario tiene la feature encendida? Bucket 0..99 para comparar contra rollout_pct.
// Prefijo 'rollout' = semilla propia, distinta de la de variante (ver getVariant): así el
// reparto de variantes NO está correlacionado con quién entró primero al rollout.
export function isEnabled(flag: Flag, assignmentKey: string, flagKey: string): boolean {
  if (!flag.enabled) return false;                            // kill-switch: corta a TODOS al instante
  const bucket = hashInt('rollout', flagKey, assignmentKey) % 100;  // %100: sesgo despreciable
  return bucket < flag.rollout_pct;                           // dentro del % de rollout
}

// ¿Qué variante de A/B le toca? (estable por clave; soporta N variantes uniformes)
export function getVariant(flag: Flag, assignmentKey: string, flagKey: string): string {
  const variants = flag.variants ?? ['control', 'variante'];
  // INVARIANTE DURO: variants[0] es SIEMPRE el flujo seguro/estable (el control). El kill-switch
  // cae aquí, así que variants[0] debe ser el camino que sabes que funciona.
  if (!flag.enabled) return variants[0];                      // apagado ⇒ todos al flujo estable
  // Sesgo de doble módulo (mal): `hashInt(...) % 100` y luego `% variants.length` reparte sobre
  // un valor ya truncado a 0..99 → con 3 variantes da 34/33/33 (sesgo sistemático). BIEN: mapear
  // la fracción [0,1) del hash de 32 bits directo a los N índices, reparto uniforme real.
  const n = hashInt('variant', flagKey, assignmentKey);       // 0 .. 0xFFFFFFFF
  return variants[Math.floor((n / 0x100000000) * variants.length)];
}
```

> **Kill-switch vs A/B son cosas distintas.** El kill-switch APAGA una feature → manda a todos al fallback (`variants[0]`, el flujo estable). El A/B REPARTE variantes entre usuarios para medir. No los mezcles: un experimento corre con `enabled=true`; el kill-switch lo apaga entero y deja a todos en el control seguro.

```typescript
// Uso en un route handler / Server Component: leer flag + decidir variante + ETIQUETAR el evento.
import { isEnabled, getVariant } from '@/lib/flags';
import { track } from '@/lib/analytics';   // de 36

const flag = await getFlag('nuevo_paywall');             // SELECT * from feature_flags where key=...
// assignmentKey = distinct_id anónimo de PostHog (paywall de onboarding = antes del login);
// tras identify, sigue siendo el mismo valor por el alias/merge → no salta de variante.
const variant = getVariant(flag, assignmentKey, 'nuevo_paywall');
track('paywall_visto', { plan, variant });               // 'variant' es el puente con 36
return variant === 'variante' ? <PaywallNuevo/> : <PaywallActual/>;
```

> Evaluar flags en el **servidor** (BFF), no en el cliente: así el kill-switch corta de verdad (un flag de cliente lo puede saltar un adblocker o un usuario en DevTools) y no expones features ocultas en el bundle. Cachear la lectura de flags unos segundos para no pegarle a la DB en cada request.

> **Cuidado: el TTL contradice la promesa del kill-switch.** Si cacheas la lectura con un TTL de N s, el kill-switch NO corta "en el próximo request": corta con latencia de hasta N s (lo que tarde en expirar la cache). Para la mayoría de flags eso da igual. Para los flags **críticos** (`kill_pago`, `ia_resumen`) no: ahí quieres corte inmediato → usa **invalidación push** en vez de esperar al TTL: Supabase Realtime suscrito a la fila del flag (al cambiar `enabled`, invalidas la cache al instante) o `revalidateTag` de Next.js disparado desde el backoffice al guardar. Regla: TTL para flags normales, push para los que apagan dinero/IA.

---

## KILL-SWITCH: apagar al instante, sin redeploy

El caso más importante en producción. Una feature cara (IA), el pago, o algo recién lanzado empieza a fallar o a quemar presupuesto → poner `enabled = false` en la fila del flag y **todos los usuarios dejan de verla en el próximo request**.

```
PATRÓN: una variable evaluada en SERVIDOR que envuelve la feature riesgosa.
  if (!isEnabled(flagIA, userId, 'ia_resumen')) return fallbackSinIA();

CASOS DE USO:
- IA cara o caída (timeout, rate limit, factura disparada) → kill 'ia_resumen', sirve fallback.
- Pasarela de pago con problemas → kill 'checkout_v2', vuelve al flujo estable.
- Feature recién lanzada con bug crítico → apagar mientras arreglas, sin rollback de deploy.
```

> **No es el mismo interruptor que 30 — son complementarios.** En `30-INTEGRACION-IA.md` el fallback es **AUTOMÁTICO**: ante fallos de IA (timeout, rate limit, proveedor caído) salta solo el circuit-breaker y el cross-provider, sin que nadie toque nada. El kill-switch de 37 es la palanca **MANUAL**: apagar la IA aunque esté funcionando perfectamente — porque el presupuesto se disparó, o por una decisión de negocio. Resumen: **30 reacciona a fallos técnicos sin intervención; 37 te da la mano humana para apagar a voluntad.** Sin flag, esa decisión manual significa redeploy; con flag, es un UPDATE de una fila.

---

## PROTOCOLO DE EXPERIMENTO A/B (atado a 36)

Un A/B sin método es teatro. Cada experimento sigue estos pasos, y la métrica objetivo es **un evento concreto de 36**.

```
1. HIPÓTESIS (una frase falsable):
   "Mostrar el precio anual como $/mes (variante) sube la conversión del paywall vs el total (control)."

2. METRICA OBJETIVO (UNA tasa del funnel de 60, decidida ANTES de mirar datos):
   Ejemplo: checkout_iniciado / paywall_visto. Una sola metrica primaria. Trial y primer cobro
   se analizan aparte; `plan_actualizado` no representa ambos.

3. TAMAÑO Y DURACIÓN (decididos ANTES de empezar):
   - El tamaño de muestra NO es "unos cientos". Sale de 4 inputs en una calculadora de tamaño
     muestral (PostHog trae una; o cualquier online):
       a) TASA BASE de la métrica primaria (medida en 36): p.ej. paywall convierte ~9%.
       b) MDE (efecto mínimo detectable) que te importa: p.ej. +15% relativo (de 9% a ~10.35%).
       c) α = 0.05  (tolerancia a falso positivo).
       d) Potencia = 0.80  (probabilidad de detectar el efecto si existe).
   - Con esos números (base ~9%, MDE +15% rel.) salen ~15-20k VISITANTES por variante. Orden de
     magnitud realista: DECENAS DE MILES por variante, no cientos. "Cientos de eventos" es falso
     y te lleva a declarar ganadores que son ruido.
   - La DURACIÓN la dicta el TAMAÑO DE MUESTRA, no el calendario: corres hasta juntar la muestra.
     Las 1-2 semanas completas son un PISO anti-sesgo (cubrir ciclos de día de semana), no el
     criterio de parada. Si juntas la muestra en 3 días igual esperas a cerrar semanas; si en 2
     semanas no la juntaste, NO declares nada.

   ⚠️ ADVERTENCIA PARA MVP DE LATAM — esto es lo normal, no la excepción:
   Un MVP casi nunca tiene tráfico para un A/B con potencia (decenas de miles/variante). Si tu
   tráfico no alcanza, NO corras un A/B clásico — sería teatro estadístico. En su lugar:
     • PRIORIZA fallas demostrables de usabilidad, medicion o checkout. Corregir un bug no requiere
       un A/B; requiere reproducirlo y verificar el arreglo.
     • Para una hipotesis comercial, prueba un cambio principal y conserva un baseline limpio. Un
       rediseño grande puede producir un efecto mayor, pero no se presume ni se declara sin datos.
     • O usa ROLLOUT GRADUAL + observa la métrica core (sección de abajo): lanzas a 5%/25%/100%
       mirando si la conversión sube o baja, sin pretender significancia estadística formal.
     • O ESPERA a tener trafico. Un A/B sin potencia no "da una pista": da numeros que mienten.
   El checkpoint operativo de `60` (100 sesiones limpias de landing o 20 checkouts) sirve para
   volver a inspeccionar el funnel; NO demuestra significancia ni declara ganadores.

4. CORRER: flag con variants ['control','variante'] al 50/50 (rollout_pct 100, asignación uniforme).
   La propiedad variant viaja en cada evento (36) → PostHog separa los funnels por variante.

5. LEER EL RESULTADO: comparar la métrica objetivo entre variantes SOLO al cumplir tamaño+duración.

6. DECLARAR SIGNIFICANCIA (antes de decidir): solo hay ganador si (a) p < 0.05 Y (b) el intervalo
   de confianza de la DIFERENCIA entre variantes NO cruza cero. Si p ≥ 0.05 o el IC incluye el 0,
   es EMPATE → te quedas con el control (no "ganó por poco"). PostHog reporta p-valor e IC en el
   experimento; léelos, no compares porcentajes a ojo.

7. DECIDIR: hay ganador significativo → rollout al 100% y se vuelve el nuevo control. Empate / no
   significativo → apagar y quedarse con el control. Documentar el aprendizaje (aunque "pierda",
   aprendiste algo).
```

**Honestidad estadística básica (no negociable):**

```
❌ Parar el test apenas la variante va ganando ("peeking") → falso positivo casi garantizado.
❌ Cambiar la métrica objetivo a mitad de camino para que "dé".
❌ Correr 1 día y declarar ganador (ruido, no señal).
✅ Fijar métrica, tamaño y duración ANTES. Leer al final. Aceptar el resultado, gane quien gane.
✅ Un solo experimento por superficie a la vez (dos A/B sobre el mismo paywall se contaminan).
```

---

## ROLLOUT GRADUAL: 5% → 25% → 100%

Para features nuevas que NO son experimento (no comparas variantes, solo quieres lanzar con red de seguridad):

```
PASO 1 — 5%:  rollout_pct = 5. Mira errores (error_log, 21) y la métrica core (36) en ese 5%.
              ¿Sube el error rate? ¿se cae la conversión? → kill y arregla.
PASO 2 — 25%: si el 5% está limpio tras 1-2 días, sube a 25%. Vuelve a observar.
PASO 3 — 100%: estable en 25% → rollout_pct = 100. La feature es general.

CÓMO: es un UPDATE de rollout_pct en la fila del flag (desde el backoffice). La asignación
determinista garantiza que quien ya estaba dentro del 5% SIGUE dentro al subir a 25% (no parpadea).
Si algo se rompe en cualquier paso: enabled = false (kill) y a cero, sin redeploy.
```

> El rollout gradual y el kill-switch usan el MISMO flag: `rollout_pct` controla el alcance, `enabled` es el corte de emergencia. Una feature riesgosa nace en 5% detrás de un flag con kill-switch armado.

---

## CICLO DE VIDA DEL FLAG: nace, cumple, MUERE

Un flag no es para siempre. Cada flag que dejas vivo es una rama `if/else` en el código y una fila que alguien tiene que entender después. Los flags zombi (al 100% hace meses, nadie recuerda qué hacían) son deuda técnica pura.

```
NACE     → feature detrás del flag (rollout 5% o A/B).
CUMPLE   → llega a 100% estable, o el A/B declaró ganador y se promovió.
MUERE    → tras X semanas estable al 100% (sugerencia: 2-4), REMOVER el flag:
             1. borrar la rama muerta del código (el if/else; te quedas solo con el camino ganador).
             2. borrar la fila del flag en feature_flags.
           Así el código vuelve a tener un solo camino y la tabla no acumula basura.

EXCEPCIÓN — flags PERMANENTES: solo los kill-switches operativos (kill_pago, ia_resumen) viven
para siempre, porque su trabajo es estar listos para apagar dinero/IA cuando haga falta. Esos NO
se borran. Todo lo demás (rollouts de features, A/B) es temporal por diseño.
```

---

## CHECKLIST DE CIERRE — Feature flags y experimentos

```
[ ] Tabla feature_flags en Supabase con RLS: SELECT solo a service_role (NO a anon → no fuga de
    roadmap), y policy admin con using Y with check (proteger también el INSERT)
[ ] Flags evaluados en el SERVIDOR (BFF), no en el cliente
[ ] Asignación determinista por hash de una clave estable — NUNCA Math.random(); sin doble módulo
    (mapear la fracción del hash a N variantes, no `%100` y luego `%length`)
[ ] Clave de bucketing estable que existe ANTES del login (distinct_id anónimo de PostHog o uuid en
    cookie) y se conserva tras identify (alias/merge) → el anónimo no salta de variante (02B)
[ ] INVARIANTE: variants[0] es SIEMPRE el flujo seguro/estable (ahí cae el kill-switch)
[ ] Toda feature nueva/cara/que toca dinero o IA nace detrás de un flag
[ ] Kill-switch MANUAL (enabled=false) probado: apaga IA/pago/feature a voluntad, sin redeploy.
    Distinto del fallback AUTOMÁTICO de 30 (circuit-breaker); son complementarios
[ ] Flags críticos (kill_pago, ia_resumen) con invalidación push (Realtime / revalidateTag), no
    solo TTL → corte inmediato, no con latencia de cache
[ ] Experimento A/B: hipótesis + UNA métrica objetivo (evento de 36) + tamaño (tasa base, MDE,
    α=0.05, potencia 0.80) + duración FIJADOS antes; muestra realista = decenas de miles/variante
[ ] Sin tráfico para potencia (caso normal en MVP LATAM): testear cambios GRANDES, o rollout
    gradual observando la métrica core, o esperar — NO un A/B clásico sin potencia
[ ] Declarar ganador SOLO con p<0.05 y el IC de la diferencia sin cruzar cero; si no, empate→control
[ ] La propiedad variant viaja en los eventos de 36 (puente flags ↔ analítica)
[ ] Honestidad estadística: no peeking, no cambiar métrica, leer solo al cumplir tamaño+duración
[ ] Rollout gradual 5%→25%→100% para features nuevas, observando error_log (21) y métrica core (36)
[ ] Variantes de onboarding/paywall (02B) se prueban vía flags, no a ojo
[ ] Ciclo de vida: tras 100% estable, REMOVER el flag (borrar rama muerta + fila) en 2-4 semanas;
    permanente solo para kill-switches operativos
```

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

- **`36-ANALITICA-Y-EVENTOS.md`**: complemento directo. Los flags EXPONEN variantes; 36 MIDE su efecto. La propiedad `variant` en los eventos es el puente: sin 36, un A/B no se puede leer; sin 37, no se puede correr.
- **`02B-ONBOARDING-Y-PAYWALL.md`**: las variantes de onboarding y paywall que 02B recomienda probar solo son realizables con estos flags. El A/B del paywall vive aquí + se mide en 36.
- **`30-INTEGRACION-IA.md`**: complementarios, no el mismo interruptor. 30 maneja los fallos AUTOMÁTICOS de la IA (circuit-breaker + cross-provider, sin intervención humana); el kill-switch de 37 es la palanca MANUAL para apagar la IA aunque funcione (presupuesto disparado, decisión de negocio).
- **`21-BACKOFFICE.md`**: el dueño activa/desactiva flags y ajusta `rollout_pct` desde el backoffice; observa `error_log` y métricas durante el rollout gradual.
- **`58-RETENCION-DE-INGRESOS.md`**: lanzar features de retención de forma gradual y medir su impacto en las curvas D1/D7/D30.
- **`25-BASE-DE-DATOS.md`**: el patrón de la tabla `feature_flags` (tipos, constraints, RLS) sigue las reglas de diseño de esquema de 25.
