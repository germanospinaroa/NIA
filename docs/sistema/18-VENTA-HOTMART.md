# INFRAESTRUCTURA DE VENTA — Hotmart + Resend (Configuración por Defecto)

> **Cuándo cargar este archivo:**
> - Al configurar la monetización de la app (junto con `08-DEPLOY.md` y `09-SEGURIDAD.md`)
> - SIEMPRE para apps que se venderán por Hotmart (el caso por defecto de este sistema)
>
> **Contexto:** Hotmart NO aloja SaaS. La app vive en Vercel + Supabase. Hotmart solo procesa el pago. Este archivo explica el flujo completo para vender una web app por Hotmart: el producto de suscripción con su clase de acceso en el área de miembros, el webhook que crea/elimina usuarios automáticamente, y los emails de bienvenida con Resend.

---

## EL MODELO: vender una web app por Hotmart (que NO aloja apps)

Hotmart SÍ admite productos de software (sus formatos oficiales incluyen "Software" y "Aplicaciones") — lo que NO hace es ALOJAR la app. El método del SO: se crea un **producto de tipo SUSCRIPCIÓN** cuyo "contenido" es solo un **instructivo de acceso a la app real** (que vive en Vercel + Supabase). Se usa el flujo del área de miembros + webhook **porque da control total del acceso vía tu propia app** (crear/quitar usuarios en Supabase al ritmo de los eventos de pago), no porque Hotmart rechace apps. Hotmart cobra y dispara eventos; nuestro webhook crea/da de baja al usuario.

```
1. Producto tipo SUSCRIPCIÓN en Hotmart (NO pago único, NO ebook).
2. Dentro de su ÁREA DE MIEMBROS (Hotmart Club) se crea UN módulo con UNA clase que contiene un
   TEXTO simple: cómo entrar a la app. Eso es lo que Hotmart revisa para APROBAR el producto
   (necesita "contenido" para dejarte vender — esta clase cumple ese requisito).
3. Dos planes: MENSUAL y ANUAL, ambos con PERÍODO DE PRUEBA según FICHA-MERCADO §4 activado
   (7 días es EJEMPLO ilustrativo, no default — el plazo se decide por tiempo-a-valor y datos
   del nicho, 02C).
4. El cliente compra/inicia la prueba → Hotmart le manda SU email (instructivo) Y dispara el WEBHOOK.
5. El webhook (verificado con el HOTTOK) crea el usuario en Supabase; Resend manda NUESTRO email de
   bienvenida con el acceso real (enlace mágico + código de 6 dígitos — el combo de 26). El
   cliente entra a la app en Vercel.
```

El cliente recibe DOS emails: el de Hotmart (instructivo de acceso) y el nuestro (acceso real vía Resend). Ambos refuerzan que la compra fue exitosa.

> **La IA NO puede hacer estos pasos por el usuario** — son manuales, en el panel de Hotmart. Su trabajo es **GUIARLO paso a paso**, en el momento correcto (fase de venta/deploy), con la guía de abajo y confirmando antes de avanzar.

---

## GUÍA PASO A PASO EN HOTMART (la IA acompaña al usuario)

Presentar estos pasos al usuario **en orden, uno o dos a la vez**, en lenguaje simple, confirmando antes de seguir. Son acciones en `app.hotmart.com`.

**PASO A — Crear el producto (tipo suscripción)**
```
1. app.hotmart.com → "Productos" → "Crear producto".
2. Tipo: SUSCRIPCIÓN / recurrencia (NO pago único). Nombre = el de tu app. Idioma y moneda de tu mercado.
3. Categoría: la más cercana (ej. "Software", "Cursos online" según el caso).
```

**PASO B — Crear el área de miembros con UNA clase (esto APRUEBA el producto)**
```
1. En el producto → "Área de miembros" (Hotmart Club) → activarla/crearla.
2. Crear UN módulo (ej. "Empieza aquí") y dentro UNA clase (ej. "Cómo acceder a [App]").
3. En esa clase, pegar SOLO un texto con el instructivo de acceso (ver el texto modelo más abajo).
   → Sin "contenido", Hotmart no aprueba; esta clase es lo único que necesita para aprobar.
```

**PASO C — Crear los DOS planes con prueba gratis**
```
1. En el producto → "Precios"/"Planes" → crear PLAN MENSUAL ($X/mes).
2. Crear PLAN ANUAL (en la landing/paywall se muestra como $/mes en el display grande, con el
   TOTAL anual siempre visible en letra chica ("Se cobra $X/año") — transparencia obligatoria,
   ver 02C y 19).
3. En CADA plan → sección "Período de testes" (prueba) → activar el plazo de FICHA-MERCADO §4
   (ej. 7 días), modalidad GRÁTIS.
   ⚠️ Activar la prueba en AMBOS planes (mensual Y anual), no solo en uno.
```

**PASO D — Enviar a aprobación y publicar**
```
1. Completar los datos obligatorios (descripción, imagen/portada, precio, página de pago/checkout).
2. Enviar el producto a APROBACIÓN. Con la clase del Paso B, suele aprobarse sin problema.
3. Aprobado → queda disponible para vender (link de checkout / página de pago de Hotmart).
```

**PASO E — Webhook + hottok (conectar Hotmart con la app)** → ver "CONFIGURAR EL WEBHOOK" abajo.
Registrar la URL del endpoint, elegir los eventos, copiar el HOTTOK a `HOTMART_HOTTOK`, y mandar un test.
**Sin esto, las compras NO crean usuarios en la app.**

**PASO F — Prueba end-to-end (antes de anunciar)** → hacer una compra/prueba real y verificar toda la cadena (checklist final).

---

## PROTOCOLO DE CHECKOUT REAL — abrirlo, mirarlo y dejar constancia (OBLIGATORIO)

> **Cuándo:** en cuanto exista el producto en la pasarela, ANTES de escribir una sola línea de copy
> que mencione precio, prueba, garantía o medios de pago. Y otra vez antes de encender tráfico.

Configurar la pasarela **no es lo mismo que ver lo que ve el comprador**. La única evidencia válida
es la página de pago abierta, en un teléfono, con el país del cliente. Registrar en `FICHA-MERCADO.md`
(§3 y §4):

```
[ ] Abrí la URL de checkout REAL (no el panel de administración) en ancho de móvil
[ ] Anoté TODOS los medios de pago que aparecen
[ ] Toqué cada uno: ¿cuáles están DESHABILITADOS aunque se muestren?
    ⚠️ Un medio de pago visible pero inerte es peor que uno ausente: el comprador lo intenta,
       no pasa nada, y se va creyendo que la página está rota.
[ ] Comprobé si el plazo de garantía aparece por algún lado (muchas pasarelas NO lo muestran:
    si no aparece, tu web es el único sitio que lo promete — eso obliga a que sea exacto)
[ ] Revisé que no haya textos rotos, claves de traducción sin traducir o campos en otro idioma
[ ] Guardé una captura con fecha
```

**Por qué "toqué cada uno" y no "vi la lista":** los medios de pago que no admiten cobro recurrente
suelen mostrarse igual y quedar inertes cuando el producto es una suscripción. Se descubre haciendo
clic, nunca leyendo.

> ⚠️ **Parámetros de URL de la pasarela: verificar uno por uno, no confiar en la documentación.**
> Los parámetros que prometen alterar la vista del checkout (mostrar solo la prueba, ocultar
> el precio anual, preseleccionar un plan) dependen del tipo de producto, del país y de la versión
> del checkout — y a veces **no hacen nada**. Comprobación obligatoria: abrir la misma URL **con y
> sin** el parámetro y comparar lo que se ve. Si no cambia nada, el parámetro NO resuelve el
> problema, por más que la documentación lo describa. Anotarlo en `FICHA-MERCADO.md`.

---

## REGLA DURA: LA GARANTÍA TIENE QUE DURAR MÁS QUE LA PRUEBA

```
garantía > prueba        → la garantía cubre algo. Se puede prometer.
garantía = prueba        → COBERTURA CERO. Prohibido prometerla.
garantía < prueba        → COBERTURA CERO. Prohibido prometerla.
```

**Por qué**, con el caso típico de prueba de 7 días y garantía de 7 días:

| Día | Qué pasa | ¿Hay algo que devolver? | ¿La garantía sigue viva? |
|---|---|---|---|
| 0 | Empieza la prueba, no se cobra nada | No | Sí (pero no sirve: no hay cobro) |
| 1-6 | Sigue la prueba, no se cobra nada | No | Sí (idem) |
| 7 | **Primer cobro** | **Sí, por fin** | **No — venció hoy** |

El comprador nunca tiene un solo día en el que exista un cobro Y una garantía viva. Es una promesa
que no se puede cumplir: el peor tipo de copy, porque se descubre justo cuando la persona ya pagó.

**Qué hacer:** subir el plazo de garantía en el panel de la pasarela hasta que supere la prueba, y
recién entonces nombrarla en la web. Si la pasarela no permite un plazo mayor que la prueba, **la
garantía no se menciona** y la tranquilidad se construye con lo que sí es cierto ("hoy no pagas
nada", "cancelas cuando quieras", "te avisamos antes del cobro").

> ⚠️ **Desde cuándo cuenta el plazo.** Si no está confirmado si la garantía corre desde la adhesión
> o desde el primer cobro, el copy dice el plazo **sin fijar fecha de inicio** ("15 días de
> garantía"), que es cierto en cualquiera de los dos casos. Nunca escribir "15 días desde el cobro"
> sin confirmarlo con la pasarela: es una promesa de dinero, y esas se cumplen o no se hacen.

---

## CONFIGURAR LA PRUEBA GRATIS EN HOTMART (plazo: el de FICHA-MERCADO §4)

El plazo del trial se decide por TIEMPO-A-VALOR (regla completa en 02C): 5-7 días solo si el aha es inmediato; 14+ si el compromiso es anual/caro — los trials de 17-32 días convierten 42.5% vs 25.5% los de <4 días (RevenueCat 2026). El plazo final sale de FICHA-MERCADO §4. El trial con tarjeta/opt-out tiende a convertir más que el opt-in porque filtra alta-intención (heurística de industria — validar con tus números).

> ⚠️ **Verificar en Hotmart, no asumir:** si el "período de testes" de Hotmart exige tarjeta, y qué medios de pago admite (tarjeta / boleto / PIX) durante la prueba, depende del país y del producto. Confírmalo en el panel y en la doc oficial antes de prometer "trial con tarjeta". Las cifras de conversión de arriba NO son cifras de Hotmart. (Estrategia unificada de trial/pricing en `02C-PRICING-Y-MODELO-DE-NEGOCIO.md`.)

```
EN HOTMART (producto de tipo "assinatura"/suscripción):
1. Crear el producto como SUSCRIPCIÓN (no pago único) y definir el/los plan(es) (mensual y/o anual).
2. En el plan → precios → sección "Período de testes" (período de prueba). Dos modalidades:
   - GRÁTIS  → el cliente NO paga durante la prueba; el primer cobro ocurre al final del plazo elegido.
               Este es el DEFAULT del SO.
   - TEST-DRIVE → cobro reducido al inicio; la recurrencia plena empieza después.
3. Si aceptas boleto durante el trial, añadir `showTrialBillet=true` al link de pago.
(Verificar en el panel los días permitidos y si la tarjeta es obligatoria — la doc de Hotmart no fija
 el rango exacto. Docs: help.hotmart.com, artículos de "período de testes" / assinatura.)
```

```
EL WEBHOOK + EL TRIAL:
- Tratar el inicio de la prueba como "plan activo" (acceso COMPLETO): el usuario debe sentir el
  producto entero durante los 7 días.
- Al final del trial: cobro OK → sigue activo; cobro falla/cancela → past_due/cancelado (ver dunning).
- RECORDATORIO ANTES DEL COBRO (clave — los proveedores no siempre lo mandan): programar un email con
  Resend el DÍA 5-6 ("tu prueba termina en 24-48 h; esto es lo que perderás"). El framing de pérdida
  reduce el churn (cifra ilustrativa del sector, sin fuente pinneada — mide la tuya). El paywall
  debe mostrar la fecha EXACTA de cobro y "cancela cuando quieras".
  (Estrategia completa de trial y pricing en `02C-PRICING-Y-MODELO-DE-NEGOCIO.md`.)
```

### El texto de la clase de acceso (Paso B — lo que el usuario pega en la clase de Hotmart)
Un texto breve y claro (es lo ÚNICO que va dentro de la clase del área de miembros):
```
"¡Gracias por tu compra! 🎉
Tu acceso a [Nombre de la App] ya está activo.

Cómo entrar:
1. Revisa tu correo: te enviamos un email de [Nombre App] con tu acceso.
   (Revisa spam/promociones si no lo ves en 5 minutos.)
2. Entra a: https://tuapp.com/login
3. Usa el correo con el que compraste para iniciar sesión.

¿Problemas? Escríbenos a soporte@tuapp.com"
```

---

## FLUJO TÉCNICO COMPLETO

```
[Cliente compra en Hotmart]
        │
        ├──▶ [Hotmart envía su email automático con el instructivo de acceso]
        │
        ▼
[Hotmart dispara WEBHOOK → nuestro endpoint en Vercel/Supabase]
        │
        ▼
[El endpoint VERIFICA el hottok] ──✗──▶ rechaza (401)
        │ ✓
        ▼
[Según el evento:]
   PURCHASE_APPROVED / PURCHASE_COMPLETE → crear usuario en Supabase (plan activo)
   PURCHASE_REFUNDED / CHARGEBACK        → desactivar usuario
   SUBSCRIPTION_CANCELLATION             → marcar plan como cancelado (al fin del ciclo)
   PURCHASE_DELAYED                      → marcar como pago pendiente (dunning)
        │
        ▼
[Resend envía el email correspondiente:]
   nueva compra      → email de bienvenida con acceso
   cancelación       → email de "lamentamos que te vayas" (+ oferta de retención opcional)
```

---

## RUTA DE RESCATE DE ACCESO ("compré y no me llega") — el ticket #1 de este modelo

Dos causas dominan: el correo cayó en spam/promociones, o la persona compró en Hotmart con UN
correo y está intentando entrar con OTRO. La ruta se construye EN /login desde el día 1, visible:

```
1. Enlace visible bajo el formulario de login: "¿Compraste y no te llega el acceso?"
2. Esa pantalla ofrece, en este orden:
   [ ] REENVIAR el acceso — mismo endpoint del login, respuesta UNIFORME exista o no la cuenta:
       "Si este correo tiene una compra activa, el acceso llega en unos minutos"
       (anti-enumeración de 26; mismo rate limit del login)
   [ ] Recordatorio: "Revisa spam y promociones — búscalo como [remitente@tudominio]"
   [ ] "Verifica que sea el MISMO correo con el que compraste en Hotmart (está en tu
       comprobante y en el email que Hotmart te envió)"
   [ ] Botón de soporte con asunto pre-llenado ("No me llega el acceso — [su correo]")
3. PROCEDIMIENTO DE SOPORTE (va en el MANUAL-DEL-DUEÑO — la IA lo deja escrito): buscar la
   compra en el panel de Hotmart por correo/nombre/transacción → si compró con OTRO correo,
   actualizar el email de la cuenta existente desde el admin (updateUserById) y reenviar el
   acceso. NUNCA crear una segunda cuenta: rompe historial, racha y suscripción (el seam de
   este archivo).
4. Qué NO hacer: revelar en /login si un correo compró o no (rompe la anti-enumeración de 26);
   exigir número de transacción al usuario (fricción — es el plan B del soporte, no el camino).
```

---

## CONFIGURAR EL WEBHOOK EN HOTMART (Paso E de la guía)

Instrucciones para el usuario (la IA se lo explica paso a paso, después de que el endpoint esté desplegado):
```
1. Entrar a app.hotmart.com → menú izquierdo → Herramientas → Ver todas
2. Seleccionar "Webhook (API y notificaciones)"
3. Crear nueva configuración de Webhook
4. Pegar la URL del endpoint: https://tuapp.com/api/webhooks/hotmart
   (o la URL de la Supabase Edge Function). El endpoint debe estar YA desplegado (Vercel/Supabase).
5. Seleccionar los eventos a escuchar:
   - Compra aprobada (PURCHASE_APPROVED)
   - Compra completa (PURCHASE_COMPLETE)
   - Compra reembolsada (PURCHASE_REFUNDED)
   - Chargeback (PURCHASE_CHARGEBACK)
   - Cancelación de suscripción (SUBSCRIPTION_CANCELLATION)
   - Cambio de plan (SWITCH_PLAN) — llega cuando el "cambio de planes de suscripción" está
     habilitado en el producto y el cliente cambia mensual↔anual. Mapearlo SIEMPRE.
   - Pago atrasado / recurrencia / inicio de prueba (los que ofrezca tu cuenta para suscripciones)
6. Copiar el HOTTOK (token único de tu cuenta) desde la pestaña de Autenticación del Webhook
   → guardarlo como variable de entorno HOTMART_HOTTOK (en Vercel/Supabase, NUNCA en el repo)
7. Usar "Enviar test" para verificar que el endpoint responde 200
```

**Importante sobre el hottok:** cada cuenta de Hotmart tiene un hottok único. Es el token que verifica que la petición viene realmente de Hotmart y no de un atacante. SIEMPRE verificarlo antes de procesar cualquier evento — sin esto, cualquiera podría crear usuarios Pro gratis enviando peticiones falsas.

---

## EL ENDPOINT DEL WEBHOOK — solo existe una implementación válida

El SO no incluye un ejemplo simplificado: un webhook de pagos “didáctico” suele omitir justo lo que
evita pérdidas. Implementar directamente la sección **“SEGURIDAD DEL WEBHOOK DE HOTMART
(implementación real)”** de abajo y los Gates 2/7 de `61-INTEGRIDAD-DE-LANZAMIENTO.md`.

Pipeline obligatorio:

```
raw body -> autenticidad -> parse -> frescura -> catálogo allowlisted
-> dedupe técnico -> ledger económico -> transición/acceso recuperable -> email/job -> completed
```

**Estados de transacción de Hotmart** (para referencia): APPROVED, COMPLETE, CANCELLED, CHARGEBACK, REFUNDED, EXPIRED, OVERDUE, WAITING_PAYMENT, PROCESSING_TRANSACTION. **Estados de suscripción:** active, canceled, past_due, expired, started, inactive.

> ⚠️ **Los nombres EXACTOS de los eventos se VERIFICAN en el panel de Hotmart (Herramientas → Webhook) antes de codear** — el catálogo puede cambiar y varía por cuenta/versión (mismo principio que el placeholder del evento de trial más abajo). Los usados en este archivo (`PURCHASE_DELAYED` para retraso → `past_due`, `PURCHASE_EXPIRED`/`SUBSCRIPTION_CANCELLATION` para expiración/cancelación) se contrastan con la lista real que muestre TU panel al configurar el webhook, y la FSM se ajusta a esa lista.

---

## LOS DOS MODELOS DE CREACIÓN DE USUARIO (decidir según la monetización de 02C)

El webhook de arriba ya soporta los dos, pero hay que entender CUÁL usa tu app, porque el seam entre ellos es la fuente #1 de bugs de acceso/pago:

```
MODELO 1 — HARD PAYWALL (default Hotmart: landing → pago → acceso):
  No hay usuarios gratis. El webhook CREA el usuario al pagar (rama `!existing` → createUser).
  Flujo simple, una sola puerta. Es el caso de apps B2B / valor obvio (ver 02C).

MODELO 2A — ONBOARDING-FIRST / PREVIEW ANONIMO (landing → onboarding/preview → paywall → login):
  Default recomendado cuando la app puede mostrar valor antes de pedir cuenta. El usuario hace el
  onboarding con estado temporal en navegador; despues del paywall, el login/auth guarda o desbloquea
  el resultado. Reduce friccion y respeta la secuencia `landing -> onboarding -> paywall -> login`.
  Al comprar, Hotmart debe crear o subir la cuenta correcta segun el email/parametros del checkout.

MODELO 2B — ONBOARDING-FIRST / FREE TIER REGISTRADO (registro gratis → onboarding/preview → paywall):
  Usar solo si el progreso debe persistir ANTES del pago o si la primera victoria exige cuenta real.
  El usuario se AUTO-REGISTRA gratis con Supabase Auth (ver 26-AUTH-MODERNO) antes de pagar; cuando
  compra desde dentro de la app, el webhook lo ENCUENTRA por email/id y lo SUBE a Pro (rama
  `existing -> update`). Es util en IA creativa, bienestar o fitness cuando el preview/plan requiere
  historial persistente.
```

**Implementación del Modelo 2A (el seam anónimo→compra→cuenta, paso a paso):**
```
1. ANTES DEL CHECKOUT: la app genera un anon_id (uuid en localStorage, junto al estado
   versionado {v:1, respuestas, plan} — ver 26 -> "USUARIO ANONIMO -> CUENTA") y arma la URL
   con `URL`/`URLSearchParams`, no concatenacion manual:
   https://pay.hotmart.com/PRODUCTO?off=OFERTA&showOnlyTrial=1&sck=<anon_id>
   (`showOnlyTrial=1` fuerza la opcion de trial cuando la oferta esta configurada para ello;
   `sck` viaja como tracking. Agregar `email` solo si ya se conoce por una necesidad legitima
   del producto; no capturarlo como peaje antes de Hotmart.)
2. EL WEBHOOK crea/reconcilia la cuenta passwordless y envía magic link; la compra no prueba por sí
   sola control del buzón. La sesión nace cuando la persona consume el enlace recibido.
   y GUARDA el `sck`/anon_id recibido en el perfil (columna anon_id text). Resend manda el
   magic link (ver EMAILS CON RESEND).
3. PRIMER LOGIN (mismo dispositivo, el caso común): el cliente detecta sesión nueva + estado
   local → lo migra vía el endpoint BFF con validación zod de 26 → limpia localStorage.
   El plan que vio antes de pagar reaparece INTACTO en su cuenta — ese es el contrato del 2A.
4. OTRO DISPOSITIVO: no hay localStorage. Si las respuestas viajaron (payload corto en `sck`,
   o el webhook las recibió por otra vía) → regenerar el plan en el servidor; si no →
   onboarding corto de recuperación al primer login (honesto, ver 26 punto e).
5. PRUEBA E2E: correr el flujo completo anónimo → checkout → webhook → magic link → plan
   migrado, además de la prueba estándar de abajo.
```

> ⚠️ **EL BUG A EVITAR (caveat crítico del Modelo 2B): el match es por EMAIL.** Si el usuario se registró gratis con `caro@gmail.com` pero paga en Hotmart con `caro@hotmail.com`, el webhook NO lo encuentra → **crea una SEGUNDA cuenta Pro** y su cuenta gratis (con todo su onboarding/progreso) queda **huérfana**. El usuario entra a la cuenta vieja, la ve sin Pro, y cree que pagó en vano. Mitigaciones (aplicar al menos las dos primeras):
>
> ```
> (a) MISMO EMAIL CUANDO YA EXISTE: al mandar al usuario registrado al checkout de Hotmart,
>     pre-rellenar su email y explicar que conecta la compra con su cuenta. No crear una captura
>     previa solo para conseguir este parametro.
> (b) PASAR EL ID: enviar el user_id (o el email de la cuenta) como parámetro de tracking del checkout
>     (`src`/`sck` de Hotmart) y, en el webhook, matchear PRIMERO por ese id y solo si no, por email.
>     Así aunque pague con otro correo, se vincula a la cuenta correcta.
> (c) FLUJO DE RECLAMO (red de seguridad): si llega un pago de un email SIN cuenta previa, al primer
>     login con magic link a ese email se reconcilia; y dar un botón "ya pagué, conectar mi compra"
>     que busca por email/código de suscriptor.
> ```
> En el código del webhook, esto significa: en `PURCHASE_APPROVED`, buscar el perfil por `src`/id ANTES
> que por email; y NUNCA hacer un `INSERT` ciego — siempre `select`→(`update` si existe / `create` si no),
> como ya hace el bloque de referencia. Dedupe por `event_id` (ya cubierto) evita el doble cobro de evento,
> pero NO evita la cuenta duplicada por email distinto — eso lo evita (a)+(b).

> Cross-ref: la decisión Modelo 1 vs 2A vs 2B se toma en `02C-PRICING-Y-MODELO-DE-NEGOCIO.md`.
> El registro gratis del Modelo 2B usa el auth de `26-AUTH-MODERNO.md`; el Modelo 2A pide auth
> despues del paywall para guardar/desbloquear sin cortar el momentum.

---

## OPERACIONES DE SUSCRIPCIÓN EN HOTMART: qué se puede y qué NO

Hotmart es excelente para COBRAR una suscripción, pero NO es Stripe: varias operaciones que las apps
de suscripción dan por sentadas **no existen de forma nativa**. Prometerlas en el paywall o el soporte
sin saber cómo se implementan produce clientes furiosos. La tabla honesta (donde dice *(verificar)*,
confirmarlo en el panel actual de Hotmart antes de prometer nada — la plataforma cambia):

| Operación | ¿Nativa en Hotmart? | Cómo se resuelve EN LA PRÁCTICA |
|---|---|---|
| **Upgrade/downgrade mensual↔anual** | SÍ nativo: "cambio de planes de suscripción" (se habilita en el panel del producto) | El webhook manda el evento **`SWITCH_PLAN`** — mapearlo SIEMPRE: mantener el estado actual de la suscripción y ACTUALIZAR plan/límites del usuario según el plan nuevo del payload (idempotente por transaction/event id, como los demás). Verificar que la opción esté HABILITADA en el panel del producto antes de prometer el cambio en el paywall/soporte; sin el mapeo, los upgrades dejan el plan desactualizado en silencio. |
| **Créditos extra / add-ons medidos** | NO — no hay add-ons medidos ni "compra dentro de la suscripción" | Se implementa como **producto de PAGO ÚNICO SEPARADO** en Hotmart con su **propio mapeo en el webhook**: identificar el producto por el `product id` del payload; su `PURCHASE_APPROVED` **NO toca el status de la suscripción** — solo suma créditos (`credits = credits + N`) al perfil matcheado por email/`src`. Documentar el mapeo `product_id → acción` en el endpoint (un switch por producto ANTES de la FSM). Reembolso de ese producto → restar los créditos, no el plan. |
| **Descuento a un suscriptor existente** | NO nativo sobre una suscripción activa *(verificar)* | Alternativa real: **cupón de oferta para recompra** (cancela y recompra con cupón) — avisando el paso doble; o una oferta de retención por fuera (mes de cortesía gestionado en TU app extendiendo acceso, sin tocar el cobro). |
| **Pausar la suscripción** | NO nativa *(verificar)* | Alternativa honesta: **"pausa solo-de-acceso"** gestionada en TU app (congelas uso/créditos y los compensas después) **avisando con claridad qué pasa con el cobro** (Hotmart sigue cobrando). Si el usuario no acepta que se cobre, lo honesto es: cancelar + email de win-back para volver. NUNCA llamar "pausa" a algo que sigue cobrando sin decirlo. |

> Regla transversal: cualquier operación que resuelvas "por fuera" de Hotmart (créditos, pausa de acceso,
> cortesías) vive en TU base de datos y TU webhook — documenta el mapeo y pruébalo en la prueba E2E,
> porque Hotmart no sabe que existe.

### ⚠️ El evento de inicio de trial es un PLACEHOLDER — verificar ANTES de confiar en la métrica

El código de la FSM usa `TRIAL_START_EVENT = 'SUBSCRIPTION_TRIAL_START'; // (verificar)`. Ese nombre
es un **placeholder, no un dato**. ANTES de confiar en la métrica trial→pago: hacer una compra sandbox
con trial y **capturar el JSON real**. Es plausible que Hotmart dispare **`PURCHASE_APPROVED` con
valor 0** al iniciar el trial — si es así y no lo detectas, la FSM lo marca `active`, fija
`first_paid_at` en el día 0, y la métrica trial→pago queda **rota en silencio** (todos los trials
parecen pagos y tu conversión "perfecta" es mentira).

Mini-procedimiento de verificación (5 pasos, antes de lanzar):
```
1. Crear una compra sandbox (o real reembolsable) de un plan CON período de prueba activado.
2. Capturar el JSON COMPLETO del webhook que llega al INICIAR el trial (loguearlo en entorno de prueba).
3. Identificar cómo llega: ¿un evento propio de trial? ¿o un PURCHASE_APPROVED con price/value = 0
   o un flag de trial en el payload? Anotar el nombre/flag EXACTO.
4. Ajustar la FSM a la realidad: si es PURCHASE_APPROVED con valor 0 (o flag de trial) → mapear a
   `trialing`, NO a `active`; `first_paid_at` se fija SOLO con un cobro de valor > 0.
5. Dejar correr el trial hasta el PRIMER COBRO real y capturar TAMBIÉN ese JSON: confirmar que ese
   sí transiciona a `active` y fija `first_paid_at`. Recién ahí la métrica trial→pago es confiable.
```

### GRADUACIÓN DE PLATAFORMA — ¿cuándo Hotmart deja de convenir?

Hotmart cobra caro a cambio de dos cosas que al inicio valen oro: su **red de afiliados** (el canal #1
del SO) y el cobro local (PIX/boleto) con parte de la carga fiscal resuelta. Cuando esas dos dejan de
pesar, el spread de comisión se vuelve dinero regalado:

| Criterio | Hotmart | Stripe / Mercado Pago / Paddle |
|---|---|---|
| Costo por venta | ~10% + tarifa fija (+ comisión de afiliado si aplica) | ~3-5% |
| Red de afiliados | Nativa (marketplace — el canal #1 del SO) | No existe: la montas tú (software aparte) |
| PIX / boleto / medios LATAM | Nativos | Mercado Pago sí; Stripe parcial por país; Paddle limitado |
| Carga fiscal / comprobante al comprador | Actúa como vendedor en varios países (retiene/emite — ver 47) | Paddle es MoR; con Stripe/MP facturas y declaras tú |
| Control del checkout (el "puente" de 02C) | Limitado: checkout externo con su fricción | Total: checkout embebido/custom → menos fuga en el puente |

```
TRIGGER DE MIGRACIÓN: >$3-5k USD de MRR con ventas MAYORMENTE DIRECTAS (no de afiliados)
  → evaluar migrar a Stripe/Mercado Pago/Paddle: el spread de ~6% (10% → 3-5%) se paga la
    migración en meses (a $5k MRR, ~$300/mes de diferencia).
PERO: si los afiliados son tu canal #1 y traen el grueso de las ventas, Hotmart sigue ganando
  aunque cueste más — la red de afiliados ES lo que estás pagando. Migrar mata ese canal.
La decisión es por MEZCLA de canales (dato real del backoffice, 21), no por la comisión sola.
```

---

## PRUEBA DE PAGO DE PUNTA A PUNTA (obligatoria ANTES de vender — no se omite)

El webhook es el endpoint donde más bugs de pago aparecen, y no se ven hasta que un cliente real paga y NO recibe acceso (o lo recibe gratis). Antes de poner la app a la venta, hacer UNA compra de prueba completa y verificar la cadena entera. La IA guía al dueño paso a paso (ella no puede comprar por él):

```
PRUEBA E2E (usar el modo de prueba/sandbox de Hotmart, o una compra real reembolsable):
1. Comprar el producto como lo haría un cliente (desde la landing / link de checkout).
2. Verificar que el webhook se DISPARÓ y respondió 200 (revisar logs del endpoint).
3. Verificar que el usuario se CREÓ (Modelo 1) o se SUBIÓ a Pro (Modelo 2) en Supabase (tabla profiles).
4. Verificar que llegó el email de acceso (Resend) Y el instructivo de Hotmart.
5. Iniciar sesión con ese email y confirmar que la app da acceso Pro real.
6. SOLO MODELO 2B: registrarse GRATIS primero con un email, LUEGO comprar con EL MISMO email ->
   confirmar que la cuenta se SUBE a Pro (NO se crea una segunda). Repetir con email DISTINTO para
   ver el caso borde y validar la mitigación elegida.
7. Probar un reembolso de prueba → confirmar que el acceso baja a free sin borrar datos.
```

---

## SEGURIDAD DEL WEBHOOK DE HOTMART (implementación real, para producción)

> El bloque "código de referencia" de arriba es **didáctico**. Esto es lo que va a producción. Un webhook de pago es el endpoint más atacado de la app: si alguien lo engaña, **se autootorga premium gratis** (te regala el producto) o dispara reembolsos/cancelaciones falsas (te cuesta dinero y datos). Aquí no hay margen para "casi bien".

**Regla de oro: NUNCA confiar en el payload sin validar.** El cuerpo del webhook es input de internet, no de Hotmart. Cualquiera puede hacer `POST https://tuapp.com/api/webhooks/hotmart` con `{"event":"PURCHASE_APPROVED","data":{"buyer":{"email":"atacante@x.com"}}}`. Lo único que separa una compra real de un ataque es la **validación criptográfica**. Si esa validación es débil (o falla abierta), regalas el producto.

### Las 4 defensas del webhook (todas, en orden, antes de tocar la DB)

```
1. AUTENTICIDAD  → ¿viene de Hotmart? (hottok comparado en tiempo constante, sobre HTTPS)
2. FRESCURA      → ¿es reciente? (ventana de timestamp anti-replay)
3. IDEMPOTENCIA  → ¿ya lo procesé? (dedupe por event_id — Hotmart REENVÍA)
4. AUTORIZACIÓN  → ¿qué cambio de estado implica? (máquina de estados de la membresía)
```

### 1. Autenticidad — verificar el hottok correctamente

**El camino principal: comparar el hottok recibido contra `process.env.HOTMART_HOTTOK` en TIEMPO CONSTANTE, sobre HTTPS.** Hotmart envía un **hottok** (token único de tu cuenta); su modelo de autenticidad es ese token compartido viajando sobre TLS, NO una firma HMAC con un esquema inventado por nosotros. Reglas:

- **Comparación en TIEMPO CONSTANTE**, siempre. `receivedToken !== SECRET` (lo que hacía el ejemplo de arriba) es vulnerable a *timing attacks*: el `!==` de JS corta en el primer byte distinto, y el tiempo de respuesta filtra cuántos bytes acertó el atacante. Usar `crypto.timingSafeEqual`.
- **No inventes una firma.** Hotmart NO firma el body con un HMAC cuya clave sea el hottok. SI tu cuenta de Hotmart provee una firma propia, verifícala con **su** secreto SEPARADO (el que Hotmart documente para ese fin), nunca reutilizando el hottok como clave HMAC. Si tu cuenta no provee firma (el caso por defecto), basta hottok en tiempo constante + HTTPS.
- **Si SÍ hay una firma documentada por Hotmart, verifícala sobre el RAW body** (los bytes exactos recibidos), NO sobre el JSON re-serializado. `JSON.parse` → `JSON.stringify` reordena claves y cambia espacios; cualquier firma ya no coincide. Hay que leer el cuerpo crudo ANTES de parsearlo.
- **Fail-secure:** si falta `HOTMART_HOTTOK` en el entorno, la app **crashea al arrancar** (ver el principio fail-open/fail-secure en `27-REVISION-SEGURIDAD.md`). Nunca un default de juguete.

```typescript
// lib/hotmart-verify.ts
import crypto from 'node:crypto';

// Fail-secure: si falta el secreto, revienta el arranque (no corre con un default inseguro)
const HOTTOK = process.env.HOTMART_HOTTOK;
if (!HOTTOK) throw new Error('FALTA HOTMART_HOTTOK — el webhook no puede operar de forma segura');

/**
 * Comparación en tiempo constante de dos strings (anti timing-attack).
 * timingSafeEqual exige buffers de IGUAL longitud, o lanza. Comparamos primero la longitud
 * (con una variable, no con un early-return que filtre tiempo) y solo entonces comparamos bytes.
 * Truco alternativo válido: hashear ambos lados a SHA-256 (longitud fija) para no filtrar la
 * longitud — pero aquí dejamos UNA implementación clara y directa.
 */
function timingSafeEqualStr(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/**
 * Verifica el hottok en tiempo constante. Este es el camino principal y, en la mayoría de
 * cuentas, el ÚNICO. (Si tu cuenta de Hotmart documenta una firma propia, verifícala aparte
 * con SU secreto separado — no con el hottok.)
 */
export function verifyHotmart(opts: {
  hottok?: string;            // del header x-hotmart-hottok o del campo hottok del body
}): boolean {
  if (!opts.hottok) return false;
  return timingSafeEqualStr(opts.hottok, HOTTOK!);
}
```

> **HTTPS obligatorio.** El hottok es un secreto compartido que viaja en cada petición; es exactamente lo que separa una compra real de un atacante. Sin TLS, cualquier intermediario lo captura y replica peticiones válidas. Vercel ya fuerza HTTPS — nunca exponer el endpoint por HTTP.

### 2. Frescura — ventana de timestamp anti-replay

Aunque la firma sea válida, un atacante (o un proxy comprometido) puede **capturar una petición legítima y reenviarla**. Si el payload trae timestamp (`creation_date` / `approved_date` en ms), rechazar lo más viejo que una ventana (ej. 5 min). Es defensa en profundidad: la idempotencia (paso 3) ya frena el doble-procesamiento, pero la ventana frena el replay con datos de fecha manipulados.

```typescript
const REPLAY_WINDOW_MS = 5 * 60 * 1000; // 5 minutos

function isFresh(eventTimestampMs?: number): boolean {
  if (!eventTimestampMs) return true; // si el evento no trae fecha fiable, no bloquear por esto
  const age = Date.now() - eventTimestampMs;
  return age >= 0 && age <= REPLAY_WINDOW_MS;
}
```

### 3. Idempotencia — Hotmart REENVÍA eventos

Si tu endpoint tarda, devuelve 5xx, o el ACK se pierde, **Hotmart reintenta el mismo evento**. Sin dedupe: doble usuario, doble email, doble crédito, o un refund que pisa una recompra. La defensa es una tabla con el `event_id` como **primary key** — el segundo insert del mismo id falla, y eso es la señal de "ya procesado".

```sql
create table processed_events (
  event_id     text primary key,              -- id único del evento de Hotmart
  event_type   text not null,
  payload_hash text,                          -- sha256 del raw body (auditoría/forense)
  processed_at timestamptz not null default now()
);
-- Higiene: purgar eventos viejos con un cron diario (pg_cron), conservar 90 días.
```

> **`processed_events` solo guarda ÉXITOS.** El backoffice (`21-BACKOFFICE.md`) necesita VER los fallos
> (no autorizados, transiciones ilegales, errores), y necesitas una alerta "sin webhooks hace N horas"
> (Hotmart dejó de mandar, o tu endpoint está caído, y no te enteras hasta que un cliente reclama).
> Para eso, registrar TODO intento en un log aparte:

```sql
create table webhook_log (
  id          bigserial primary key,
  event_id    text,                              -- id del evento (puede repetirse en reintentos)
  type        text,                              -- tipo de evento Hotmart
  result      text not null check (result in
                ('applied','duplicate','illegal','unauthorized','error')),
  received_at timestamptz not null default now()
);
create index webhook_log_received_idx on webhook_log (received_at desc);
create index webhook_log_result_idx   on webhook_log (result, received_at desc);
-- El handler escribe aquí en CADA petición (éxito y fallo), antes de responder.
-- ALERTA "sin webhooks hace N horas": un cron compara max(received_at) contra now(); si
-- supera el umbral (ej. 6h sin NINGÚN webhook en horario de ventas) → avisar (Hotmart caído
-- o endpoint roto). Ver el panel de salud del webhook en 21-BACKOFFICE.
```

El `event_id` debe ser **estable y único por evento** (el `id`/`event_id` de Hotmart → el código de transacción → un compuesto determinista). **Nunca** algo que cambie entre reintentos (como `Date.now()`), o el dedupe no sirve.

#### RECONCILIACIÓN SEMANAL DE SUSCRIPCIONES (el seguro contra el drift silencioso)

Los reintentos de webhook **expiran** (Stripe reintenta hasta 3 días — doc de Stripe, 2025; verificar
la ventana de Hotmart en su documentación) — si tu endpoint estuvo roto más tiempo o un evento se
perdió, NADA repara el desfase: usuarios `active` en tu base con suscripción cancelada en el
proveedor (acceso regalado para siempre) o al revés (cliente pagando sin acceso). La alerta "sin
webhooks hace N horas" de arriba te dice que el canal se rompió; esta reconciliación repara lo que
se desfasó mientras estuvo roto.

```
EL JOB SEMANAL (cron):
1. Listar las suscripciones ACTIVAS del proveedor (API de Hotmart o export del panel).
2. Comparar contra tu tabla de estados (subscription_status).
3. Reportar CADA diferencia EN AMBAS DIRECCIONES:
   - activo en el proveedor, no-activo en tu base → cliente pagando sin acceso.
   - activo en tu base, no-activo en el proveedor → acceso regalado.
4. Reparar (con log de auditoría de cada corrección: qué estado, por qué, cuándo).
```

Es doctrina obligatoria de todos los equipos de billing serios (Stripe la documenta como *"process
undelivered events"*). La casilla vive en el Gate 2 de `61-INTEGRIDAD-DE-LANZAMIENTO.md`; las
diferencias detectadas cada semana se muestran como card en el backoffice (`21-BACKOFFICE.md`) —
el número sano es 0.

### 3B. Validación de catálogo + ledger económico (dos dedupes distintos)

Autenticidad solo dice "esto vino de Hotmart"; no dice que sea **tu producto correcto**. Antes de
conceder acceso, comparar contra una allowlist server-side de `product_id`, `offer_id/plan_id`,
moneda e importe/rango esperado. Un producto ajeno, una oferta retirada o un importe imposible se
registra y rechaza con alerta.

`processed_events.event_id` deduplica reintentos técnicos. Los ingresos necesitan además una clave
económica única: `provider + transaction_id + economic_kind`. Así `PURCHASE_APPROVED` y
`PURCHASE_COMPLETE`, aunque tengan event IDs distintos, no cuentan dos veces la misma compra.

```sql
create table payment_transactions (
  provider text not null,
  transaction_id text not null,
  economic_kind text not null check (economic_kind in ('sale','refund','chargeback')),
  product_id text not null,
  offer_id text,
  amount_minor bigint not null,
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  settlement_amount_minor bigint,
  settlement_currency text,
  provider_fee_minor bigint,
  affiliate_fee_minor bigint,
  tax_minor bigint,
  occurred_at timestamptz not null,
  raw_event_id text not null,
  primary key (provider, transaction_id, economic_kind)
);
```

La inserción del ledger, transición de membresía y marca técnica se hacen atómicamente o mediante
un workflow `pending -> completed/failed` reintentable. Nunca llamar "procesado" a un pago cuyo
acceso aún no puede recuperarse. Contrato completo: `61-INTEGRIDAD-DE-LANZAMIENTO.md`.

### 4. Máquina de estados de la membresía

Cada evento mueve al usuario entre estados. Definir la máquina explícitamente evita el bug clásico: que un evento *viejo* reentregado (ej. un `PURCHASE_APPROVED` tardío) **reactive** a un usuario que ya reembolsó.

| Evento Hotmart | Estado destino | Acceso del usuario | Notas |
|---|---|---|---|
| Inicio de trial gratis (estado `started` de Hotmart, o el flag de trial del payload) | `trialing` | **COMPLETO** (plan pro) | Marca el INICIO de la prueba gratis. Setear `trial_ends_at`. Acceso completo durante la prueba. (verificar) qué evento/flag exacto envía tu cuenta |
| `PURCHASE_APPROVED` / `PURCHASE_COMPLETE` | `active` | **COMPLETO** (plan pro) | PRIMER COBRO real (o compra sin trial). Setear `first_paid_at`. Es lo que marca trial→pago |
| `PURCHASE_DELAYED` | `past_due` | **COMPLETO durante la gracia** (3-7 días) | Dunning: banner no bloqueante, no cortar. NO degradar a un ya `refunded` |
| `SUBSCRIPTION_CANCELLATION` | `cancelled` | **COMPLETO hasta `access_until`**, luego free | Detiene renovación; no corta un mes/año ya pagado. Fijar `cancel_at_period_end=true` |
| `PURCHASE_EXPIRED` | `expired` | Según `grace_ends_at`, luego free | Expiración tras reintentos; no confundir con cancelación voluntaria |
| `PURCHASE_REFUNDED` | `refunded` | **CORTADO ya** | Terminal: ignorar `APPROVED` posteriores de esa transacción |
| `PURCHASE_CHARGEBACK` | `chargeback` | **CORTADO ya** | Terminal y más grave (fraude/disputa): cortar y marcar para revisión |

> **MÉTRICA trial→pago (no la pierdas):** si colapsas inicio-de-trial y primer-cobro en el mismo
> estado `active`, NO puedes calcular qué % de pruebas se convierten en pago — la métrica de negocio
> más importante de un SaaS con trial. Por eso el estado `trialing` es distinto de `active`, y se
> guardan `trial_ends_at` / `first_paid_at`. El INICIO de la prueba gratis (estado `started` de
> Hotmart, o el flag de trial del payload — **verificar** cuál envía tu cuenta) da acceso completo
> pero marca `trialing`; el PRIMER COBRO real (`PURCHASE_APPROVED`/`PURCHASE_COMPLETE`) pasa a
> `active` y fija `first_paid_at`. `conversión = count(first_paid_at) / count(trial_ends_at)`.

```typescript
// lib/membership-fsm.ts
type Status = 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired' | 'refunded' | 'chargeback';

// ⚠️ PLACEHOLDER — NO confiar sin verificar: hacer una compra sandbox CON trial y capturar el
// JSON real (mini-procedimiento de 5 pasos en "OPERACIONES DE SUSCRIPCIÓN EN HOTMART"). Es
// plausible que Hotmart dispare PURCHASE_APPROVED con valor 0 al iniciar el trial — si es así,
// la FSM debe tratarlo como 'trialing', NO 'active', o first_paid_at y la métrica trial→pago
// quedan ROTAS EN SILENCIO. Suele venir como estado 'started' o un flag de trial en el payload.
const TRIAL_START_EVENT = 'SUBSCRIPTION_TRIAL_START'; // (verificar) — ajustar al real de tu cuenta

const EVENT_TO_STATUS: Record<string, Status> = {
  [TRIAL_START_EVENT]: 'trialing',                 // inicio de prueba gratis → acceso completo, marca trial
  PURCHASE_APPROVED: 'active', PURCHASE_COMPLETE: 'active', // primer cobro real → trial→pago
  PURCHASE_DELAYED: 'past_due',                    // retraso/pago pendiente → dunning
  SUBSCRIPTION_CANCELLATION: 'cancelled',
  PURCHASE_EXPIRED: 'expired',                       // expiró tras agotar reintentos
  PURCHASE_REFUNDED: 'refunded', PURCHASE_CHARGEBACK: 'chargeback',
};
// SWITCH_PLAN (cambio de plan nativo mensual↔anual) NO transiciona de estado: la suscripción
// sigue en su estado actual (trialing/active). Se maneja como rama propia en el handler:
// ACTUALIZAR plan/límites del usuario según el plan NUEVO del payload, idempotente por
// transaction/event id como los demás eventos.
export const PLAN_CHANGE_EVENT = 'SWITCH_PLAN';
const TERMINAL_NEGATIVE: Status[] = ['refunded', 'chargeback'];
// 'trialing' y 'active' dan acceso COMPLETO (plan pro); la diferencia es solo de medición/negocio.
// El status solo NO decide acceso: cancelled/past_due consultan access_until/grace_ends_at.
const FULL_ACCESS: Status[] = ['trialing', 'active'];

/** ¿Es legal pasar de `from` a `to`? Bloquea reactivaciones ilegales por eventos viejos. */
export function canTransition(from: Status | null, to: Status): boolean {
  if (from === null) return true;                                        // usuario nuevo
  // ⛔ no resucitar un refund/chargeback con un evento de acceso reentregado:
  if (TERMINAL_NEGATIVE.includes(from) && (to === 'active' || to === 'trialing')) return false;
  return true;
}
export function statusForEvent(event: string): Status | null {
  return EVENT_TO_STATUS[event] ?? null;
}
export function hasFullAccess(s: Status, now: Date, accessUntil?: Date, graceEndsAt?: Date): boolean {
  if (FULL_ACCESS.includes(s)) return true;
  if (s === 'cancelled') return !!accessUntil && now < accessUntil;
  if (s === 'past_due') return !!graceEndsAt && now < graceEndsAt;
  return false;
}
```

### El route handler de producción (Next.js App Router)

Lee el **raw body**, valida (autenticidad → frescura), **deduplica**, y aplica el cambio **en una transacción** vía RPC de Postgres (insert del `event_id` + update del perfil = atómico).

```typescript
// app/api/webhooks/hotmart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import { verifyHotmart } from '@/lib/hotmart-verify';
import { statusForEvent, PLAN_CHANGE_EVENT } from '@/lib/membership-fsm';

export const runtime = 'nodejs'; // necesitamos node:crypto y raw body (no Edge)

const admin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role: SOLO servidor, NUNCA frontend
  { auth: { persistSession: false } }
);
const REPLAY_WINDOW_MS = 5 * 60 * 1000;

export async function POST(req: NextRequest) {
  // 1. RAW body (bytes exactos) — lo leemos antes de parsear (necesario si algún día verificas
  //    una firma documentada por Hotmart, y para el hash de auditoría). NO usar req.json() antes.
  const rawBody = await req.text();

  // 2. Autenticidad — hottok en tiempo constante (camino principal, sobre HTTPS).
  const hottok = req.headers.get('x-hotmart-hottok') ?? undefined;
  if (!verifyHotmart({ hottok })) {
    // registrar el intento no autorizado (el backoffice lo vigila: picos = ataque)
    await admin.from('webhook_log').insert({ result: 'unauthorized' });
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 }); // genérico, no revelar por qué
  }

  // 3. Parsear SOLO después de verificar
  let payload: any;
  try { payload = JSON.parse(rawBody); }
  catch { return NextResponse.json({ error: 'bad request' }, { status: 400 }); }

  // 4. Frescura (anti-replay)
  const ts = payload.creation_date ?? payload.data?.purchase?.approved_date;
  if (ts && (Date.now() - Number(ts) > REPLAY_WINDOW_MS)) {
    return NextResponse.json({ error: 'stale' }, { status: 400 });
  }

  // 5. Datos del evento
  const event: string = payload.event;
  const eventId: string =
    payload.id ?? payload.event_id ?? payload.data?.purchase?.transaction
    ?? `${event}:${payload.data?.buyer?.email}:${ts ?? ''}`; // compuesto determinista (NO Date.now())
  const email: string | undefined = payload.data?.buyer?.email ?? payload.email;
  const name: string = payload.data?.buyer?.name ?? '';
  const subscriberCode: string | undefined = payload.data?.subscription?.subscriber?.code;

  const newStatus = statusForEvent(event);
  if (event === PLAN_CHANGE_EVENT) {
    // SWITCH_PLAN: NO tocar el status — actualizar plan/límites del perfil según el plan NUEVO
    // del payload (payload.data.plans / subscription.plan), vía una RPC propia con el MISMO
    // dedupe por eventId. Ej.: return applySwitchPlan(eventId, subscriberCode, payload);
  }
  if (!newStatus) return NextResponse.json({ received: true, ignored: event }); // dedupe innecesario, 200

  const payloadHash = crypto.createHash('sha256').update(rawBody).digest('hex');

  // 6. Idempotencia + cambio de estado + transición legal, TODO atómico en una RPC transaccional.
  const { data, error } = await admin.rpc('apply_hotmart_event', {
    p_event_id: eventId, p_event_type: event, p_payload_hash: payloadHash,
    p_email: email, p_name: name, p_subscriber_code: subscriberCode, p_new_status: newStatus,
  });

  if (error) {
    console.error('webhook hotmart error', { event, code: error.code }); // loguear SIN PII
    // registrar el fallo para el backoffice (21) y la alerta de salud:
    await admin.from('webhook_log').insert({ event_id: eventId, type: event, result: 'error' });
    return NextResponse.json({ error: 'processing failed' }, { status: 500 }); // 5xx → Hotmart reintenta
  }
  // data: { status: 'applied' | 'duplicate' | 'illegal_transition' }
  const result =
    data?.status === 'applied' ? 'applied'
    : data?.status === 'duplicate' ? 'duplicate'
    : data?.status === 'illegal_transition' ? 'illegal' : 'applied';
  // SIEMPRE registrar el resultado (éxito y no-éxito) para el backoffice y la alerta de salud:
  await admin.from('webhook_log').insert({ event_id: eventId, type: event, result });
  if (data?.status === 'applied') {
    // await dispatchEmailForEvent(event, email, name); // emails SOLO si aplicamos (no en duplicados)
  }
  // 7. Siempre 200 cuando la decisión fue tomada (incluido duplicate/illegal): Hotmart deja de reintentar.
  return NextResponse.json({ received: true, result: data?.status ?? 'ok' });
}
```

La transacción vive en una función Postgres (atómica de verdad: el insert de idempotencia y el cambio de estado no pueden separarse), y aplica la máquina de estados del lado servidor también:

```sql
create or replace function apply_hotmart_event(
  p_event_id text, p_event_type text, p_payload_hash text,
  p_email text, p_name text, p_subscriber_code text, p_new_status text
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare v_current text; v_user_id uuid; v_plan text;
begin
  -- (a) IDEMPOTENCIA: si el event_id ya existe, salir sin tocar nada.
  begin
    insert into public.processed_events (event_id, event_type, payload_hash)
    values (p_event_id, p_event_type, p_payload_hash);
  exception when unique_violation then
    return jsonb_build_object('status','duplicate');
  end;

  -- (b) Resolver el perfil actual (por subscriber_code, si no por email).
  select id, status into v_user_id, v_current from public.profiles
  where (p_subscriber_code is not null and hotmart_subscriber_code = p_subscriber_code)
     or (p_subscriber_code is null and email = p_email) limit 1;

  -- (c) TRANSICIÓN LEGAL: no resucitar un refund/chargeback con un evento de acceso reentregado.
  if v_current in ('refunded','chargeback') and p_new_status in ('active','trialing') then
    return jsonb_build_object('status','illegal_transition','from',v_current);
  end if;

  -- 'trialing' y 'active' dan acceso completo (plan pro); la diferencia es de medición trial→pago.
  v_plan := case when p_new_status in ('trialing','active','past_due','cancelled') then 'pro' else 'free' end;

  -- (d) Aplicar (upsert por email). Usuario nuevo en compra aprobada → crear perfil.
  --     ⚠️ COHERENCIA con 25/26: en el modelo canónico `profiles.id` referencia `auth.users(id)`.
  --     El webhook llega ANTES de que exista esa cuenta de auth, así que aquí el `id` queda
  --     NULLABLE hasta que el handler cree el usuario de auth y lo reconcilie (paso de abajo).
  --     `email` lleva UNIQUE (ver DDL) → el on conflict hace la operación idempotente por email.
  if p_new_status in ('trialing','active') or v_user_id is not null then
    insert into public.profiles (email, name, plan, status, hotmart_subscriber_code,
                          first_paid_at)
    values (p_email, p_name, 'pro', p_new_status,
            coalesce(p_subscriber_code, null),
            case when p_new_status = 'active' then now() else null end)  -- primer cobro real
    on conflict (email) do update
      set status = excluded.status,
          plan = v_plan,
          name = coalesce(excluded.name, public.profiles.name),
          hotmart_subscriber_code =
            coalesce(excluded.hotmart_subscriber_code, public.profiles.hotmart_subscriber_code),
          -- fija first_paid_at SOLO la primera vez que llega un cobro real (trial→pago)
          first_paid_at = coalesce(public.profiles.first_paid_at,
                            case when excluded.status = 'active' then now() else null end);
  end if;
  -- NOTA: setear `trial_ends_at` al recibir el inicio de trial (p_new_status = 'trialing'),
  --       p. ej. now() + interval '7 days' o la fecha que traiga el payload de Hotmart (verificar).
  return jsonb_build_object('status','applied','new_status',p_new_status);
end; $$;

revoke execute on function apply_hotmart_event from anon, authenticated; -- solo el service role
```

> **`UNIQUE(email)` es obligatorio** en `profiles` para que el `on conflict (email)` funcione y para no crear perfiles duplicados cuando Hotmart reenvía o el usuario recompra. Asegúrate de que la tabla lo declare:
> ```sql
> -- en la definición de profiles (coherente con 25/26: id ANCLA a auth.users)
> alter table profiles add constraint profiles_email_key unique (email);
> -- id nullable hasta que se cree la cuenta de auth; al reconciliar, set id = <auth user id>
> ```

> **Orden auth ↔ profile (coherencia con 25-BASE-DE-DATOS y 26):** el modelo canónico ancla `profiles.id → auth.users(id)`. El webhook puede llegar antes de que exista el usuario de auth. Dos opciones coherentes: (1) crear PRIMERO la cuenta de auth y luego el perfil con ese `id`; o (2) crear el perfil con `id` nullable (como arriba) y RECONCILIAR el `id` cuando el handler cree la cuenta de auth. No insertar perfiles "huérfanos" permanentes sin `id`.

> **Crear la cuenta de auth:** `supabase.auth.admin.createUser` no es SQL; cuando la RPC devuelve `applied` para un usuario nuevo, el handler crea la cuenta de auth, fija `profiles.id` con ese id, y dispara el magic link (ver "EMAILS CON RESEND"). Si esa creación es frágil, usar el patrón de dos fases (`completed boolean default false`) descrito abajo.

### "Pagó y no entra" — la creación del usuario fuera de la transacción

El bug silencioso más caro: la RPC marca el evento como **procesado** (insert en `processed_events`), pero la cuenta de auth + magic link se crean DESPUÉS, en el handler, FUERA de esa transacción. Si ese paso falla (timeout, error de la Admin API, deploy caído) el evento ya quedó como "procesado" → Hotmart no reintenta, el cron de reintentos lo ve como hecho, y **el cliente pagó y nunca recibe acceso**. Nadie se entera hasta que reclama.

Dos patrones para cerrarlo (elegir uno):

```
PATRÓN A — crear el usuario de auth ANTES de marcar procesado:
  1) verificar/parsear/idempotencia "soft" (¿ya hay perfil con este email y completed=true? → salir)
  2) crear cuenta de auth + perfil (id ya anclado) + magic link
  3) RECIÉN entonces marcar el evento como procesado
  → si (2) falla, el evento NO queda procesado → Hotmart/cron reintentan → se vuelve a intentar.

PATRÓN B — dos fases con flag `completed` (recomendado con la RPC de arriba):
  1) RPC: insert processed_events + upsert profile con `completed = false`  (atómico)
  2) handler: crear cuenta de auth, fijar profiles.id, enviar magic link
  3) marcar `profiles.completed = true` SOLO al terminar (3) con éxito
  → un cron busca perfiles `completed = false` con > N min y REINTENTA el paso (2)-(3).
```

> **ALERTA "pagos sin acceso":** un cron compara perfiles con cobro (`first_paid_at` o status pagado)
> contra `completed = false` (o `id is null`) por más de N minutos → avisar. Es la contraparte
> operativa del log de webhooks: el dinero entró pero el acceso no salió. Ver 21-BACKOFFICE.

### Errores letales del webhook (no cometerlos)

```
❌ Comparar el hottok con === / !==      → timing attack. Usar timingSafeEqual.
❌ Inventar un HMAC con el hottok como clave → Hotmart NO firma así. Camino principal = comparar
   el hottok en tiempo constante. Firma SOLO si Hotmart la documenta, con SU secreto separado.
❌ Verificar una firma sobre el JSON parseado → nunca coincide. Si la hay, verificar sobre el RAW body.
❌ Procesar sin dedupe                    → doble premium / doble email cuando Hotmart reintenta.
❌ Confiar en el email del payload sin validar autenticidad → premium gratis para cualquiera.
❌ Devolver 200 cuando falló de verdad   → Hotmart deja de reintentar y PIERDES la venta.
❌ Loguear el payload completo            → PII (email, nombre) en logs/Sentry (ver 09 y 27).
❌ HOTMART_HOTTOK con fallback 'dev'      → fail-open. Que crashee si falta (27).
```

**UX del pago fallido (dunning) — no dejar la suscripción en limbo:** cuando el estado es `past_due`, mostrar en la app un banner no bloqueante ("Tu pago no se procesó — actualiza tu método para no perder el acceso") con periodo de gracia (3-7 días) en el que el usuario conserva el plan. Recuperar es la conversión más barata que existe (el usuario ya quería pagar). Nunca cortar el acceso de golpe ni borrar datos durante la gracia.

---

## EMAILS CON RESEND (la herramienta recomendada por defecto)

Resend es el mejor servicio de emails transaccionales en la actualidad: API simple, excelente entregabilidad, plantillas con React Email, plan gratis generoso. Es la opción por defecto de este sistema.

```
1. Crear cuenta en resend.com
2. Verificar el dominio propio (para que los emails salgan de @tuapp.com, no de un genérico
   — esto es clave para que no caigan en spam)
3. Obtener la API key → guardarla como RESEND_API_KEY (variable de entorno, servidor)
```

```typescript
// lib/email.ts
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWelcomeEmail(email: string, name: string) {
  // Generar magic link de Supabase para acceso sin contraseña
  const { data } = await supabase.auth.admin.generateLink({
    type: 'magiclink', email,
  });
  const accessLink = data?.properties?.action_link || 'https://tuapp.com/login';

  await resend.emails.send({
    from: '[Nombre App] <hola@tuapp.com>',
    to: email,
    subject: `¡Bienvenido/a a [Nombre App]! 🎉 Tu acceso está listo`,
    html: `
      <h1>¡Hola ${name}! 👋</h1>
      <p>Tu compra fue confirmada y tu acceso a [Nombre App] ya está activo.</p>
      <p><a href="${accessLink}" style="background:#______;color:#fff;
         padding:14px 28px;border-radius:12px;text-decoration:none;
         font-weight:600;display:inline-block">Entrar a [Nombre App] →</a></p>
      <p>Este enlace te deja entrar sin contraseña. Si caduca, entra en
         tuapp.com/login con este mismo correo.</p>
      <p>¿Dudas? Responde a este email y te ayudamos.</p>
    `
  });
}
```

Los otros dos emails (`sendCancellationEmail`, `sendPaymentFailedEmail`) se definen IGUAL que `sendWelcomeEmail` (mismo `resend.emails.send`), cambiando asunto y cuerpo: cancelación → tono empático + oferta de retención (sin magic link); pago fallido → "tu pago no se procesó" + link para actualizar el método. No dejarlos sin definir (el código de referencia los llama).

**Reglas de los emails transaccionales:**
- Salir SIEMPRE del dominio propio verificado (no @gmail, no genéricos) → entregabilidad
- Bienvenida: acceso inmediato + tono cálido + un solo CTA dominante
- Diseño consistente con la personalidad de la app (mismos colores)
- El magic link de Supabase permite entrar sin contraseña (menos fricción, ver `15-PATRONES-UX.md`)
- **Magic link caducado:** el comprador pide OTRO desde `/login` (ingresa su email de compra → nuevo enlace). Por eso el login por email debe existir SIEMPRE en apps Hotmart — el link del email de bienvenida expira, la página de login no (ver 26 y la pantalla de login en 50 → E)
- Cancelación: tono empático + oferta de retención opcional (ver win-back en `02-VALIDACION.md`)

### CARRITO ABANDONADO NATIVO (la fuente correcta del email de recuperación)

Hotmart CAPTURA los datos del lead que llegó al checkout y no pagó — no hace falta (ni está
permitido) pedirle el correo antes:

- INFORME "Abandono de Carrito" en el panel: nombre + email de quien inició el checkout sin pagar.
- EVENTO DE WEBHOOK de abandono de carrito (versión 2 del webhook): llega al mismo endpoint y
  permite disparar la secuencia automática sin exportar informes a mano.

La secuencia de 2-3 emails de recuperación (Resend) se monta sobre ESA fuente:
```
EMAIL 1 (1-3 h):   "¿te quedó alguna duda?" + link directo al checkout.
EMAIL 2 (día 1):   objeciones top + garantía/prueba (lo que sea CIERTO, ver regla dura).
EMAIL 3 (día 2-3): último recordatorio honesto (sin falsa escasez).
```
⚠️ Esto REEMPLAZA cualquier intento de capturar el email ANTES del checkout como peaje —
prohibido por la doctrina del puente (`60`/`02C`): Hotmart ya captura el dato EN el checkout.

---

## EL RESTO DEL STACK (configuración por defecto del sistema)

```
Base de datos + Auth:  Supabase
Hosting/Deploy:        Vercel
Pagos:                 Hotmart (webhook → este flujo)
Emails:                Resend (dominio propio verificado)
Dominio:               GoDaddy, Namecheap o Cloudflare Registrar
                       (apuntar DNS a Vercel + verificar dominio en Resend)
```

### Conexión del dominio (orden recomendado)
```
1. Comprar dominio en GoDaddy/Namecheap/Cloudflare
2. En Vercel: Settings → Domains → agregar el dominio → copiar los DNS records
3. En el registrador: pegar los DNS records de Vercel
4. En Resend: agregar el dominio → pegar los records SPF/DKIM en el registrador
   (esto es lo que hace que los emails NO caigan en spam)
5. Esperar propagación DNS (5 min - 48h)
```

---

## CHECKLIST DE INFRAESTRUCTURA DE VENTA

```
HOTMART (configuración manual — la IA guía al usuario, ver guía Paso A-F)
[ ] Producto creado como tipo SUSCRIPCIÓN (no pago único, no ebook)
[ ] Área de miembros con UN módulo + UNA clase con el texto de acceso (requisito de aprobación)
[ ] DOS planes creados: mensual y anual
[ ] Período de prueba (plazo de FICHA-MERCADO §4, modalidad Grátis) activado en AMBOS planes
[ ] "Cambio de planes de suscripción" habilitado en el panel del producto (upgrade/downgrade nativo)
[ ] Producto enviado a aprobación y APROBADO (disponible para vender)
[ ] Webhook configurado apuntando al endpoint correcto (ya desplegado)
[ ] Eventos seleccionados: aprobada, completa, reembolso, chargeback, cancelación, cambio de plan (SWITCH_PLAN), pago atrasado/recurrencia
[ ] HOTTOK copiado a variables de entorno (HOTMART_HOTTOK), nunca en el repo
[ ] Test del webhook exitoso (responde 200)

ENDPOINT
[ ] Verifica el hottok en TIEMPO CONSTANTE (timingSafeEqual) sobre HTTPS; firma SOLO si Hotmart la documenta (con su secreto separado, sobre el RAW body)
[ ] HOTMART_HOTTOK fail-secure (crashea si falta, sin default de juguete)
[ ] Idempotencia con tabla processed_events (Hotmart reintenta — sin esto: doble premium/email)
[ ] Catálogo allowlisted: product_id + offer_id/plan + moneda + importe se validan antes de acceso
[ ] Ledger económico único por provider+transaction_id+economic_kind; APPROVED+COMPLETE = 1 ingreso
[ ] Ventana de timestamp anti-replay
[ ] Crea usuario en compra aprobada
[ ] Desactiva en reembolso/chargeback
[ ] Máquina de estados: un evento viejo reentregado NO reactiva un refund/chargeback
[ ] Cambio de estado en transacción atómica (RPC apply_hotmart_event)
[ ] Modela trial_ends_at/current_period_end/access_until/grace_ends_at/cancel_at_period_end
[ ] Cancelación conserva acceso hasta access_until; refund/chargeback/expired tienen reglas separadas
[ ] Responde 200 siempre que procesa (incluido duplicate/illegal); 5xx solo en fallo real
[ ] Usa SERVICE_ROLE_KEY solo en servidor

RESEND
[ ] Dominio propio verificado (SPF/DKIM configurados)
[ ] Email de bienvenida con magic link y CTA claro
[ ] Email de cancelación empático
[ ] Emails salen de @tudominio, no genéricos

PRUEBA END-TO-END (crítica antes de lanzar — ver "PRUEBA DE PAGO DE PUNTA A PUNTA")
[ ] Modelo definido (1 hard paywall / 2 onboarding-first) según 02C, y el webhook lo soporta
[ ] Compra de prueba real → llega email de Hotmart
[ ] Webhook crea (Modelo 1) o SUBE a Pro (Modelo 2) el usuario en Supabase
[ ] Resend envía la bienvenida
[ ] El usuario entra a la app con el magic link y tiene plan Pro activo
[ ] SOLO MODELO 2B: registro gratis + compra con el MISMO email -> la cuenta se SUBE (no se duplica)
[ ] SOLO MODELO 2B: mitigación del email distinto aplicada (pre-rellenar email + matchear por id/src)
[ ] Cancelación de prueba → usuario marcado correctamente
[ ] Reembolso de prueba → baja a free sin borrar datos
[ ] EVENTO DE TRIAL VERIFICADO con JSON real de sandbox (5 pasos de "OPERACIONES DE SUSCRIPCIÓN"): inicio de trial → `trialing` (no `active`); `first_paid_at` solo con cobro > 0
[ ] APPROVED + COMPLETE de la misma transacción no duplica ingresos
[ ] Producto/oferta/importe/moneda ajenos rechazados y alertados
[ ] Fallo posterior al webhook se recupera: acceso + ledger + email terminan completed
[ ] Mensual y anual: cancelación durante trial, cancelación pagada, past_due, recuperación, refund y chargeback certificados en PAYMENT-CERTIFICATION.md (definido en 61)
[ ] Si vendes créditos extra: producto de pago único SEPARADO con su mapeo product_id → sumar créditos (no toca el status de la suscripción), probado E2E
[ ] SWITCH_PLAN mapeado en el webhook: mantiene el status y ACTUALIZA plan/límites según el plan nuevo del payload (idempotente), probado E2E
[ ] Operaciones documentadas para soporte: cambio de plan = nativo vía SWITCH_PLAN (verificar habilitado en panel); sin pausas nativas (solo "pausa de acceso" avisando el cobro)
```
