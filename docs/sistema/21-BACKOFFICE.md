# BACKOFFICE — Panel de Administración del Dueño de la App

> **Cuándo cargar este archivo:**
> - Como etapa propia tras construir el MVP, antes o junto al deploy
> - Junto con `13-INFRA-ESCALABILIDAD.md` (monitoreo) y `18-VENTA-HOTMART.md` (usuarios/ventas)
>
> **Por qué existe:** En vez de mandar al usuario a aprender Sentry, PostHog y 3 dashboards externos, el sistema le construye SU PROPIO backoffice: una sección privada (solo para el dueño) donde ve, en un solo lugar y en lenguaje claro, todo lo que pasa en su app — ventas, usuarios, errores y métricas de uso. Es la diferencia entre "tu app funciona" y "tienes control de tu negocio".

---

## QUÉ ES EL BACKOFFICE

Una ruta protegida (ej: `/admin`) accesible SOLO por el dueño de la app (verificado por email/rol en Supabase). Reúne en un panel limpio lo que normalmente vive disperso en herramientas externas. No reemplaza la observabilidad técnica profunda (Sentry sigue siendo útil para stack traces), pero le da al dueño NO-técnico una vista clara y accionable de su negocio sin tener que entender herramientas de ingeniería.

---

## LAS 4 SECCIONES DEL BACKOFFICE

### 1. Ventas y Suscripciones (lo primero que el dueño quiere ver)
```
- Ingresos del mes / total acumulado (MRR)
- Nuevas compras (alimentadas por el webhook de Hotmart → tabla en Supabase)
- Cancelaciones recientes + tasa de churn
- Usuarios activos vs cancelados
- Gráfico de evolución de ingresos (usar 17-VISUALIZACION-DATOS.md)
```

### 2. Usuarios
```
- Lista de usuarios (búsqueda por email)
- Estado de cada uno: activo / cancelado / reembolsado
- Fecha de alta, plan, última actividad
- Acción manual: activar/desactivar un usuario (por si el webhook falla)
- Métricas: total de usuarios, activos hoy/semana/mes (DAU/WAU/MAU)
```

### 3. Salud y Errores (monitoreo en lenguaje claro)
```
- Estado general: ✅ Todo bien / ⚠️ Hay incidencias
- Errores recientes capturados (logueados a una tabla `error_log` en Supabase desde
  los Error Boundaries y los catch del backend) — con mensaje, pantalla, hora, cuántos usuarios
- Errores agrupados por frecuencia (los más comunes primero = los que más urge arreglar)
- Estado de los webhooks de Hotmart (últimos eventos recibidos, fallos)
- DRIFT DE SUSCRIPCIONES (job de reconciliación de 18): diferencias detectadas esta semana entre
  el proveedor y tu base — el número sano es 0; >0 dos semanas seguidas = webhook con problemas
- Para stack traces profundos: integrar Sentry y enlazar a su dashboard (opcional, avanzado)
```

### 4. Uso y Métricas (¿la app retiene?)
```
- Activación: % de usuarios que completaron la primera acción de valor
- Retención: D1 / D7 / D30
- CURR semanal (definida en 36): la métrica de retención PRIORITARIA post-lanzamiento —
  se muestra como card con tendencia semana a semana
- Contador de PAGADORES FANTASMA activos: suscriptores pagando sin sesión en 14+ días
  (evento `pagador_fantasma_detectado` de 36) — el segmento de churn más recuperable;
  la intervención vive en el radar de riesgo del archivo 58
- Acción principal: cuántas veces se ejecutó la función core (hoy/semana/mes)
- Punto de abandono: en qué pantalla se van más usuarios
- Las métricas de 06-TESTING.md (Test 7) se visualizan aquí
```

---

## MÉTRICAS DE NEGOCIO — LTV, CAC y la economía que decide la inversión

> Las 4 secciones de arriba muestran QUÉ pasa (ventas, usuarios, errores, uso). Esta sección muestra si el negocio **gana o pierde dinero al crecer**. Sin estos números, invertir en adquisición (ver `34-ADQUISICION-Y-TRAFICO.md`) es apostar a ciegas. Aparecen en el backoffice como una sub-sección de "Ventas y Suscripciones" cuando ya hay datos de varios meses.

**Por qué SIN CAC no se puede decidir invertir en ads:** el CAC (lo que cuesta conseguir un cliente) comparado con el LTV (lo que ese cliente deja en total) es lo ÚNICO que dice si un canal gana o pierde dinero. Si gastas $40 en ads para ganar un cliente que solo te deja $30, cada venta te EMPOBRECE — y sin medir el CAC ni lo notas hasta que la caja se vacía. Con CAC y LTV, "¿escalo los ads?" deja de ser intuición y se vuelve aritmética.

### Las métricas y cómo calcularlas con los datos que YA hay (Hotmart + Supabase)
```
LTV (Lifetime Value) — cuánto deja un cliente en toda su vida:
  LTV ≈ (ingreso mensual por cliente) ÷ (churn mensual)
  Datos: ingreso/cliente de las ventas Hotmart (tabla profiles + datos del webhook);
         churn = cancelaciones del mes ÷ activos al inicio del mes (de profiles.status).
  Ej: $19.99/mes ÷ 22% churn ≈ $90 de LTV (≈ 4.5 meses de vida media).

CAC (Customer Acquisition Cost) — cuánto cuesta conseguir un cliente:
  CAC = (gasto total de adquisición del periodo) ÷ (clientes nuevos del periodo)
  Datos: clientes nuevos = altas de profiles en el periodo (status active, source). El GASTO
         (ads + comisiones de afiliado + UGC) se INGRESA a mano en el backoffice por canal
         (Hotmart no lo sabe) → tabla acquisition_spend (canal, monto, periodo).

RATIO LTV:CAC — la salud del negocio:
  LTV ÷ CAC.  Sano ≥ 3:1.  <1:1 = pierdes dinero por cliente. >5:1 = podrías invertir MÁS.

PAYBACK (meses para recuperar el CAC) — clave en suscripción:
  Payback = CAC ÷ (ingreso mensual por cliente).  Objetivo < 12 meses (ideal < 6) — umbral único en 40.
  Ej: CAC $30 ÷ $19.99 ≈ 1.5 meses. Cuanto más corto, menos caja necesitas para escalar.

CONVERSIÓN TRIAL → PAGO:
  (clientes que pagaron tras el trial) ÷ (clientes que iniciaron trial).
  Referencia: ~45% es el TECHO de app store (pago en 1 tap); con checkout web la fricción es
  mayor (puente de 02C) — mide tu baseline propio y mejora sobre él.
  Datos: el estado `trialing` es DISTINTO de `active` (fuente: 18 — sin esa separación no se
  puede medir trial→pago); la conversión se mide trialing → primer cobro real > 0 (fuente: 60).

CHURN VOLUNTARIO vs INVOLUNTARIO (separarlos SIEMPRE — se arreglan distinto):
  - Voluntario   = SUBSCRIPTION_CANCELLATION (el cliente decidió irse → retención, archivo 58).
  - Involuntario = murió en past_due tras agotar reintentos (pago fallido → dunning, archivo 58).
  Datos: ambos vienen del status/eventos del webhook (archivo 18). Si el involuntario es alto,
  el dunning del archivo 58 es la palanca más barata (no hay que reconvencer a nadie).
  El panel muestra el SPLIT como card propia (% voluntario / % involuntario del churn del mes).
  Benchmark: ~⅓ del churn total es involuntario (Recurly 2026) — si tu involuntario pesa mucho
  más que eso, el problema es el cobro, no el producto.

% DE ALTAS QUE SON REGRESOS (el win-back como canal, no como email suelto):
  (altas del periodo cuyo email ya existió como cliente cancelado) ÷ (altas totales del periodo).
  Datos: cruzar las altas de profiles con el histórico de cancelados (mismo email/user).
  Benchmark: 20-25% de las altas de la red Recurly 2025 son ex-cancelados. Si tu número es ~0%,
  el win-back del archivo 58 está apagado — es adquisición gratis que no estás cobrando.

ATRIBUCIÓN POR CANAL — qué canal trae clientes RENTABLES (no solo muchos):
  Guardar el ORIGEN de cada cliente (profiles.source: 'afiliado', 'ads_meta', 'organico',
  'email', 'directo' — desde el src/UTM del checkout o el código de afiliado de Hotmart; el
  MECANISMO de captura está en 36-ANALITICA "Atribución por canal") y cruzar CAC y LTV POR canal.
  Así sabes cuál escalar y cuál apagar. Un canal con CAC bajo pero LTV bajo (clientes que churnan)
  puede ser PEOR que uno con CAC alto y clientes fieles.

GANANCIA CONCILIADA — lo que de verdad te QUEDA (solo se llama "real" tras conciliar):
  Ingresos (MRR) NO es ganancia. La ganancia es lo que sobra tras pagar TODOS los costos:
    Ganancia = Ingresos − tarifa REAL de Hotmart − comisión de afiliados (si la venta vino por
               afiliado) − impuestos/retenciones − costo de IA (de la tabla `ai_calls`, ver 31)
               − infra (Supabase/Vercel) − email (Resend).
  Si faltan componentes reales, mostrar "Estimación" y los supuestos; nunca "ganancia real".
  Mostrar la card en una moneda explícita y solo tras conciliar con la liquidación del proveedor.
  ALERTA AUTOMÁTICA: si el costo de IA supera el ~20% de los ingresos (la "regla de 30" de 40/30),
  avisarlo en lenguaje claro: "La IA se está comiendo el 34% de lo que cobras — revisa los límites
  de uso (fair-use) o el precio". Este bloque es la versión REAL, con datos del mes, del modelo que
  40-UNIT-ECONOMICS calcula ANTES de vender. (Ojo de bases: el LTV/payback de arriba usan el cobro
  bruto por simplicidad; el margen fino vive en 40 — no mezclar las dos bases al comparar.)
```

### Tablas de soporte (se suman a profiles + event_log)
```
acquisition_spend (channel text, amount numeric, currency text, period_start date,
                   period_end date)  ← el dueño ingresa el gasto de ads/afiliados/UGC por canal.
profiles.source   text              ← origen del cliente (del UTM/código de afiliado del checkout).
-- LTV, CAC, ratio y payback se CALCULAN con queries agregadas sobre profiles + acquisition_spend;
-- no se almacenan (cambian cada mes). Mostrarlos como cards (dato héroe + tendencia + insight claro).
```

### Dinero multimoneda — no sumar unidades incompatibles

Guardar importes en unidad menor entera (`amount_minor`) + moneda ISO 4217. Nunca sumar COP con USD
ni cambiar solo la etiqueta. Mostrar por moneda original o convertir con `fx_rate`, fuente y
timestamp explícitos. Separar bruto, comisión del proveedor, afiliado, impuestos, reembolso,
liquidación neta y moneda de liquidación. La comisión plana es una estimación, no un dato real.

El backoffice debe conciliar el ledger de `18` con el extracto/liquidación de Hotmart y mostrar
diferencias. Distinguir caja cobrada, ingreso devengado y MRR; un cobro anual no se presenta entero
como MRR del mes. Contrato canónico: Gates 2 y 7 de `61-INTEGRIDAD-DE-LANZAMIENTO.md`.

> **Insight en lenguaje claro (el dueño no es analista):** no "LTV:CAC = 2.4", sino "Por cada $1 que gastas en conseguir un cliente, recuperas $2.40 — está bien, pero por debajo del 3 a 1 sano; revisa el canal [X] que es el que más cuesta". El backoffice traduce el número a una decisión.

---

## AVISOS AUTOMÁTICOS PARA EL DUEÑO (el panel no solo muestra — AVISA)

El dueño no técnico no va a leer tablas buscando problemas: el backoffice debe **empujarle** los avisos importantes, en lenguaje simple y con qué hacer. Es la misma doctrina de alertas que la regla transversal de `CLAUDE.md` ("Comunicación con el usuario y alertas"), pero dentro del producto. Un banner de avisos arriba del panel, con prioridad por impacto en el dinero o la seguridad:

```
DISPARADORES DE AVISO (cada uno con: qué pasa → por qué importa → qué hacer, en simple):
- 💸 IA cara: el costo de IA supera ~20% de los ingresos → "La IA se come el 34% de lo que cobras.
  Revisa los límites de uso o sube el precio." (regla de 30/40)
- 🔌 Webhook fallando: el webhook de Hotmart lleva N fallos/horas sin eventos → "Los pagos podrían no
  estar dando acceso (o dándolo gratis). Revisa la conexión con Hotmart." (riesgo de dinero, ver 18)
- 📉 Churn involuntario alto: muchas bajas por pago fallido → "Estás perdiendo clientes que SÍ querían
  pagar; activa/ajusta el dunning." (la palanca más barata, ver 58)
- ⚖️ Canal que pierde dinero: un canal con LTV:CAC < 1 → "El canal [X] te trae clientes que cuestan
  más de lo que dejan. Pausa el gasto ahí." (ver 34)
- 🐞 Errores en alza: un error afecta a muchos usuarios → "X usuarios chocaron con el mismo error hoy."
- 🧮 Margen negativo: la ganancia conciliada/estimada del mes es ≤ 0 → "Estás perdiendo dinero por cliente; vender
  más empeora. Revisa costos o precio antes de escalar." (ver 40)
```

> Estos avisos se calculan con las mismas queries del panel (no es infra nueva). La diferencia es que el dueño se entera SOLO cuando algo necesita su atención, sin tener que ser analista. Si nada está mal, el banner dice "✅ Todo en orden este mes" — también es información valiosa.

---

## CÓMO SE IMPLEMENTA (resumen técnico)

```
1. RUTA PROTEGIDA: /admin con guard que verifica rol 'admin' en el perfil de Supabase
   (RLS estricto: solo el dueño lee estas tablas agregadas).
2. TABLAS DE SOPORTE en Supabase:
   - error_log (mensaje, contexto, pantalla, user_id, created_at) ← escrita por
     Error Boundaries y catch del backend
   - event_log (tipo de evento, user_id, metadata, created_at) ← escrita en acciones clave
     (signup, primera acción, generación, etc.) para calcular activación/retención
   - (ventas y usuarios ya viven en profiles + los datos del webhook de Hotmart)
3. EL PANEL: consultas agregadas sobre esas tablas, mostradas con los componentes de
   17-VISUALIZACION-DATOS.md (cards con dato héroe + gráfico + insight).
4. INSIGHTS EN LENGUAJE CLARO: no "error rate 2.3%", sino "2 de cada 100 acciones fallan —
   revisa el error más común abajo". El dueño no es ingeniero.
```

### Logging de errores al backoffice (desde el Error Boundary)
```typescript
// En el Error Boundary y en los catch del backend:
async function logError(error: Error, context: string, userId?: string) {
  await supabase.from('error_log').insert({
    message: error.message,
    context,            // qué pantalla/acción
    user_id: userId,
    created_at: new Date().toISOString(),
  });
  // Opcional: también a Sentry para stack trace completo
}
```

```sql
-- RLS de error_log: el cliente SOLO inserta (y solo con SU user_id) — jamás lee ni edita.
-- Sin esta política, el insert desde el Error Boundary falla (RLS activo) o, peor,
-- una política laxa dejaría a cualquier usuario leer los errores (y datos) de otros.
alter table error_log enable row level security;
create policy "insert_own_errors" on error_log for insert to authenticated
  with check ((select auth.uid()) = user_id);
-- Solo el admin lee (guard del panel): select restringido al rol 'admin' del perfil.
create policy "admin_reads_errors" on error_log for select to authenticated
  using (exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role = 'admin'));
```

> Alternativa más robusta si hay usuarios anónimos o riesgo de spam: NO exponer la tabla al
> cliente y escribir vía un endpoint de servidor (`POST /api/log-error`) con rate limit —
> el cliente reporta, el servidor valida e inserta con su propio cliente.

### Logging de eventos para métricas
```typescript
async function logEvent(type: string, userId: string, metadata = {}) {
  await supabase.from('event_log').insert({ type, user_id: userId, metadata });
}
// Llamar en: signup, first_action, core_action, upgrade, etc.
// Con esto el backoffice calcula activación y retención sin herramientas externas.
// Las mecánicas que MUEVEN estas métricas (rachas, XP, hitos) y la lista canónica de eventos
// se definen en 24-GAMIFICACION.md: la gamificación los PRODUCE, el backoffice los LEE. Mismo event_log.
// El COSTO REAL de IA por feature/usuario se lee de la tabla `ai_calls` (ver 31-EVALS-OBSERVABILIDAD-OPERACION).
```

---

## NIVELES DE BACKOFFICE (según etapa)

```
Antes de traer trafico: Panel de conversion + salud del dato (sesiones limpias, QA excluido,
                        landing->onboarding->resultado->paywall real->checkout->trial->cobro).
MVP / primeras ventas:  + Secciones 1 y 2 (ventas + usuarios). Lo minimo para operar.
Crecimiento:            + Sección 3 (errores) cuando empiezan a llegar usuarios reales.
Optimización:           + Sección 4 (métricas de retención) cuando quieres mejorar el producto.
```

No construir las 4 secciones de golpe en un MVP. El panel de conversion no se pospone hasta tener
ventas: sin el no se sabe si falla trafico, onboarding, oferta, Hotmart o trial. Mostrar sesiones
unicas por cohorte/fuente, periodo y zona horaria, excluir sesiones QA completas y separar siempre
`checkout_iniciado`, `trial_iniciado` y `primer_cobro_confirmado`. Ver contrato en `60`.

---

## RELACIÓN CON HERRAMIENTAS EXTERNAS

El backoffice NO reemplaza todo:
```
- Sentry: sigue siendo la mejor opción para stack traces profundos y alertas técnicas.
  El backoffice muestra el resumen en lenguaje claro; Sentry, el detalle de ingeniería.
  Para apps que el dueño no-técnico opera solo, el backoffice basta al inicio.
- Alertas de costo (API de IA, Vercel): configurarlas igual (ver 13-INFRA-ESCALABILIDAD.md),
  porque son externas y protegen de facturas sorpresa.
- Analytics de tráfico (Vercel Analytics/Plausible/GA4): para la landing. El backoffice cubre
  el uso DENTRO de la app.
- PostHog (analítica de producto, archivo 36): es la herramienta del CONSTRUCTOR para hurgar
  funnels, cohortes y session replay a profundidad. El backoffice es la vista del DUEÑO (no técnico)
  en lenguaje claro. NO son dos sistemas que compiten: ambos leen los MISMOS eventos de valor —
  el `event_log` de Supabase es la fuente de verdad server-side (activación, retención, conversión);
  PostHog refleja esos eventos para análisis visual. No instrumentar dos taxonomías distintas:
  la canónica vive en 36.
- Modelo de economía unitaria (archivo 40): MODELA el margen ANTES de vender (con escenarios). El
  backoffice muestra la GANANCIA REAL del mes con datos. Misma economía, distinto momento — y no
  mezclar sus bases (40 usa ingreso neto/margen; aquí el cobro bruto por simplicidad operativa).
```

---

## CHECKLIST DEL BACKOFFICE

```
[ ] Ruta /admin protegida (solo rol admin, RLS estricto)
[ ] Sección de ventas: ingresos, compras, cancelaciones, churn
[ ] Sección de usuarios: lista, estado, activar/desactivar manual
[ ] Sección de salud: errores recientes agrupados por frecuencia, estado de webhooks
[ ] Sección de uso: activación, retención D1/D7/D30, acción principal
[ ] Métricas de negocio: LTV, CAC, ratio LTV:CAC (≥3:1), payback (<6m), trial→pago, atribución por canal
[ ] Ganancia conciliada por moneda; si hay supuestos se rotula ESTIMACIÓN, nunca "real"
[ ] amount_minor + currency; cero sumas COP/USD; FX con fuente/fecha; bruto/neto/fees separados
[ ] Ledger interno conciliado contra liquidación Hotmart; diferencias visibles
[ ] Caja, ingreso devengado y MRR anual amortizado no se confunden
[ ] Avisos automáticos al dueño (IA cara, webhook fallando, churn involuntario, canal que pierde, margen negativo) en lenguaje simple
[ ] Churn separado en voluntario vs involuntario (se arreglan distinto: retención vs dunning) con card de split (benchmark ~⅓ involuntario — Recurly 2026)
[ ] % de altas que son regresos (win-back como canal), CURR semanal (36) y contador de pagadores fantasma (36/58) en el panel
[ ] Tabla acquisition_spend (gasto por canal) + profiles.source (origen del cliente, capturado según 36)
[ ] Tablas error_log y event_log creadas y alimentadas
[ ] Insights en lenguaje claro (no jerga técnica)
[ ] Gráficos con el estilo de 17-VISUALIZACION-DATOS.md
[ ] Alertas de costo externas configuradas aparte
```
