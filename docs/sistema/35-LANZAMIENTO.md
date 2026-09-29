# LANZAMIENTO — Vender en Picos

> **Cuándo cargar este archivo:**
> - Cuando la app está lista para su PRIMER lanzamiento (o un relanzamiento), después de `34-ADQUISICION-Y-TRAFICO.md`
> - Cuando ya hay clientes y el dueño quiere SUBIR el AOV/LTV en el checkout (order bumps, upsells)
> - Junto con `18-VENTA-HOTMART.md` (checkout, webhook, Resend) y `19-PAGINA-DE-VENTAS.md` (la oferta vive en la landing)
>
> **Por qué existe:** Adquirir clientes (archivo 34) es solo la mitad. Un lanzamiento concentra en una ventana corta las ventas que goteando tardarían meses. Este archivo cubre el playbook de lanzamiento (5 fases + checklist día-a-día), cómo subir el ticket promedio con bumps/upsells, y cómo conseguir prueba social cuando todavía no tienes ni un cliente.
>
> ⚠️ **El día después del lanzamiento: proteger el ingreso que entró → `58-RETENCION-DE-INGRESOS.md`**
> (cancelación retentiva, dunning de pagos fallidos, win-back, referidos, renovación anual).

---

## PLAYBOOK DE LANZAMIENTO (vender en picos, no a goteo)

Un lanzamiento concentra en una ventana corta (5-7 días) las ventas que el goteo tardaría meses en producir. Funciona por **urgencia y escasez REALES** (oferta de fundadores que expira, cupos, bono que se va) + **prueba social acumulada** (todos comprando a la vez). No es para siempre: es un evento.

### Las 5 fases del lanzamiento
```
FASE 1 — PRE-LANZAMIENTO (1-2 semanas antes): construir DESEO antes de abrir la venta.
  - Sembrar contenido sobre el problema (los ángulos del archivo 34) sin vender aún.
  - Anunciar que "algo viene" + abrir la LISTA DE ESPERA (captura de emails, ver abajo).
  - Reclutar afiliados (archivo 34) y darles fecha + kit para que disparen el mismo día.

FASE 2 — LISTA DE ESPERA: capturar a los interesados ANTES de abrir.
  - Landing simple "Entra a la lista y sé el primero (+ bono/precio de fundador)".
  - Email warming: 3-4 emails que educan sobre el problema y suben la expectativa.
  - Beneficio real por estar en la lista: precio/cupo/bono exclusivo → razón para inscribirse.

FASE 3 — OFERTA DE FUNDADORES (apertura del carrito): la mejor oferta que existirá.
  - Precio de fundador (más bajo que el normal) y/o bono exclusivo (plantilla, mes extra,
    onboarding 1:1) SOLO durante la ventana. Marco: "esto no se repite".
  - Para suscripción: "precio bloqueado de por vida" para fundadores = imán potente + baja churn
    (no querrán perder el precio viejo).
  - Cupos limitados REALES si el soporte/infra lo justifica (nada de falsa escasez — archivo 19).

FASE 4 — VENTANA DE CARRITO (5-7 días, cierre con fecha): la urgencia hace el trabajo.
  - Secuencia de emails de venta (abajo) + recordatorios de afiliados + ads retargeting.
  - Subir la intensidad hacia el final: día de cierre = 2-3 emails ("últimas horas").
  - Mostrar prueba social en vivo ("X personas ya entraron hoy").

FASE 5 — POST-LANZAMIENTO: cerrar, entregar y preparar el siguiente.
  - Cerrar la oferta de verdad (si dijiste que cerraba, cierra — o matas tu credibilidad).
  - Onboarding impecable de los que entraron (la 1ª victoria <60s del archivo 02).
  - Pedir testimonios a los primeros resultados (alimenta la prueba social del próximo lanzamiento).
  - Pasar a "evergreen": la venta diaria por los canales del archivo 34 + relanzamientos periódicos.
  - Y proteger lo que entró: activar la retención de ingresos del archivo 58 (dunning, cancelación
    retentiva, win-back) — el lanzamiento no termina hasta que el ingreso está protegido.
```

### Secuencia de emails de la ventana de carrito (con Resend del archivo 18)

> **⚠️ PRERREQUISITO antes del PRIMER envío masivo** (warming de lista de espera, ventana de carrito): pasar por `46-EMAIL-DELIVERABILITY.md` — SPF/DKIM/DMARC en el dominio de envío + warmup si el dominio es nuevo (un dominio frío mandando 500 emails el día de apertura = spam garantizado justo cuando más duele) — y **consentimiento/opt-in real** de cada dirección (`47-LEGAL-FISCAL-Y-PRIVACIDAD.md`). La lista de espera YA es opt-in si se capturó bien; una lista comprada o "prestada" jamás se usa.

```
APERTURA (día 1):    "Ya está abierto" — la oferta + el bono + la fecha de cierre exacta.
VALOR (día 2-3):     mecanismo + prueba social (caso/testimonio) + recordar el cierre.
OBJECIONES (día 4):  derribar las 3 dudas top + garantía. "¿Es para mí?".
URGENCIA (día 5-6):  "cierra en 48h / 24h" — el bono o el precio de fundador se va.
ÚLTIMO AVISO (cierre): 2-3 emails el último día ("últimas horas", "se cierra esta noche").
```

#### PROMPT para el plan + emails de lanzamiento
```
Eres estratega de lanzamientos de infoproducto/SaaS en Hotmart (LATAM). Diseña el lanzamiento de
[NOMBRE APP] ([qué hace] para [avatar]). Oferta de fundadores: [precio/bono]. Promesa: [ESTADO.md].
Entrega:
1. CALENDARIO de las 5 fases (pre-lanzamiento, lista de espera, oferta, ventana 5-7 días, post).
2. La OFERTA de fundadores recomendada (precio + bono + por qué urge), sin falsa escasez.
3. La secuencia de emails de WARMING (lista de espera, 3-4 emails) lista para Resend (archivo 18).
4. La secuencia de emails de la VENTANA de carrito (apertura → último aviso) lista para Resend:
   asunto + preview + cuerpo HTML simple, 1 CTA al checkout Hotmart, reglas de copy del archivo 19.
5. El brief para los AFILIADOS (qué publicar cada día de la ventana — encadena con el kit del 34).
Idioma del avatar. PROHIBIDO falsa escasez/urgencia: la fecha de cierre y los cupos deben ser reales.
```

### CHECKLIST DE LANZAMIENTO DÍA-A-DÍA (D-14 → D+7)

La versión operativa de las 5 fases: qué se hace cada día, quién lo hace y cómo se sabe que quedó hecho. "App" = lo ejecuta la IA/el sistema; "Dueño" = solo el dueño puede (paneles, publicar en sus redes); "Afiliados" = lo disparan ellos con el kit.

| Fecha | Acción | Responsable | Criterio de "hecho" |
|---|---|---|---|
| D-14 | Definir oferta de fundadores (precio + bono + fecha de cierre REAL) y anotarla en ESTADO.md | Dueño + app | Oferta escrita con fecha exacta en ESTADO.md |
| D-14 | Verificar prerrequisitos: deliverability (46) + opt-in (47) + landing pasó checklist (19) + webhook probado (18) | App | Los 4 checks en verde, anotados |
| D-13 | Abrir lista de espera (landing simple + captura) + grupo/difusión de WhatsApp opcional (34) | App + dueño | Página publicada, primer registro de prueba entra |
| D-12 | Sembrar contenido del problema (sin vender): 3-5 piezas programadas para las 2 semanas | App genera, dueño publica | Calendario con las piezas listas |
| D-10 | Reclutar/avisar afiliados: fecha de apertura + kit + brief de la ventana | Dueño (outreach) + app (kit) | ≥3-10 afiliados confirmados con kit en mano |
| D-7 | Email/WhatsApp de warming #1 a la lista ("falta 1 semana" + valor) | App | Enviado; open rate visto en el panel |
| D-5 | Warming #2 (educar sobre el mecanismo + anticipar el bono) | App | Enviado |
| D-3 | Warming #3 ("en 3 días abre; esto incluirá la oferta de fundadores") | App | Enviado; afiliados reconfirmados para D-0 |
| D-1 | Ensayo general: compra de prueba end-to-end (checkout → webhook → acceso → email) | App + dueño | Compra de prueba entra SIN tocar nada a mano |
| D-0 | APERTURA: email "ya está abierto" + publicación propia + afiliados disparan + ads retargeting si hay píxel verificado (34) | Todos | Checkout activo, primeras ventas visibles en Hotmart |
| D+1 | Prueba social en vivo ("X personas ya entraron") + responder TODAS las dudas de preventa (WhatsApp/email) | Dueño + app | Cero dudas sin responder >12h |
| D+2 | Email de valor (mecanismo + caso/testimonio) + recordatorio de cierre | App | Enviado |
| D+3 | Email de objeciones ("¿es para mí?" + garantía) + pieza orgánica de demo | App | Enviado + publicado |
| D+4 | Aviso "quedan 48h" (email + stories + afiliados empujan) | Todos | Enviado; afiliados publicaron |
| D+5 | "Últimas 24h" + 2-3 emails el día de cierre ("últimas horas" / "cierra esta noche") | App | Secuencia de cierre completa enviada |
| D+5/6 | CERRAR de verdad (quitar oferta/subir precio a la fecha dicha) | Dueño (panel Hotmart) + app (landing) | La oferta YA no se puede comprar; landing actualizada |
| D+6 | Onboarding impecable de la cohorte: monitorear primera victoria <60s, resolver accesos caídos (punto crítico #1) | App | 0 tickets de acceso sin resolver; activación medida (36) |
| D+7 | Retro del lanzamiento: ventas por canal (src), conversión de lista, feedback; pedir testimonios a los primeros con resultado; agradecer y liquidar bonus a afiliados top | App + dueño | Números en ESTADO.md + ≥3 testimonios pedidos |

---

## ORDER BUMP / UPSELL / DOWNSELL EN HOTMART (subir el AOV y el LTV)

El cliente más barato de convencer es el que YA está comprando. Subir el ticket promedio (AOV) en el momento de la compra es ingreso casi gratis. Hotmart soporta estos tres mecanismos nativamente.

```
ORDER BUMP (en el checkout, antes de pagar): un extra de bajo precio con un clic.
  - Qué ofrecer: un complemento de alto valor percibido y bajo costo de entrega
    (pack de plantillas, mes extra, mini-curso de uso, acceso a comunidad).
  - Regla: precio del bump = 20-40% del producto principal; "sí o no" de 1 clic, sin fricción.
  - Configuración: en Hotmart, "Order bump" asociado al producto principal en el checkout.

UPSELL (1-click, JUSTO después de comprar): una oferta mayor sin volver a meter la tarjeta.
  - Qué ofrecer: el plan anual (si compró mensual), un tier superior, un add-on premium,
    o un servicio 1:1. La "Página de gracias con oferta" / upsell 1-click de Hotmart.
  - El momento de máxima disposición a comprar es justo después de decir "sí".

DOWNSELL (si rechaza el upsell): una versión más barata de la oferta.
  - Qué ofrecer: el mismo beneficio en versión reducida, o un plan de pago en cuotas, o el
    plan mensual si rechazó el anual. "Si no es el momento del completo, lleva esto".

PARA SUSCRIPCIÓN (caso por defecto del SO), el mayor LTV viene de:
  - Upsell del MENSUAL → ANUAL en la página de gracias (cash upfront + menor churn, ver 02/19).
  - Order bump de un add-on de una sola vez (plantillas/onboarding) que sube el AOV del día 1.
```

> **Conexión con el webhook:** un order bump o upsell genera transacciones/eventos adicionales en Hotmart. El webhook del `18-VENTA-HOTMART.md` debe tratarlos por su `transaction`/`event_id` (idempotencia ya cubierta) y, si el upsell es el plan anual, actualizar el plan del perfil. Verificar que el `apply_hotmart_event` no confunda dos compras del mismo cliente (dedupe por transacción, no por email).

---

## PRUEBA SOCIAL DESDE CERO (testimonios cuando aún no tienes clientes)

La landing del archivo 19 y los creativos del archivo 34 PIDEN prueba social — pero al arrancar no tienes ni un cliente. El problema del huevo y la gallina. Cómo romperlo honestamente (sin inventar nada):

```
1. BETA SEMBRADA: regala/abre acceso gratuito a 10-20 personas de tu nicho a cambio de
   feedback honesto y, si les sirve, un testimonio. Es la fuente #1 de los primeros testimonios.
2. CASOS PROPIOS / DEMOSTRACIÓN: usa la app tú mismo y documenta TU resultado real con números
   ("generé X en Y minutos"). Un caso real propio es prueba legítima.
3. RESULTADOS DEL PROCESO, no solo del producto: si la app aún no tiene clientes con resultados
   de largo plazo, muestra el OUTPUT (lo que produce) y el AHORRO de tiempo — eso es demostrable
   desde el día 1.
4. OFERTA DE FUNDADORES (archivo 34/lanzamiento): los primeros que pagan a cambio de precio
   especial → se convierten en los testimonios del próximo lanzamiento. Pídeselo apenas tengan
   su primera victoria (la del onboarding <60s).
5. MICRO-COMPROMISOS: reseñas en el marketplace de Hotmart, capturas de mensajes de usuarios
   felices (con permiso), conteo de uso ("+X resultados generados esta semana").

REGLA INNEGOCIABLE: CERO testimonios inventados, fotos de stock como "clientes", o números
falsos. Es ilegal, te baja Hotmart, y destruye la confianza. Prueba social REAL o ninguna —
mientras tanto, vende con la transformación, la demo y la garantía (reversión de riesgo).
```

#### PROMPT para conseguir y formatear prueba social inicial
```
Diseña el plan de PRUEBA SOCIAL DESDE CERO de [NOMBRE APP]. Entrega: (1) el mensaje de invitación
a la beta sembrada (10-20 personas del nicho) pidiendo feedback + testimonio; (2) las 3 preguntas
exactas para que el beta-tester escriba un testimonio con RESULTADO concreto (no genérico);
(3) cómo documentar 1 caso propio con números reales; (4) cómo formatear los testimonios para la
landing del archivo 19 (foto + nombre + resultado). Idioma del avatar. Recuérdame la regla:
solo prueba social real, nunca inventada.
```

---

## PILOTO CERRADO ANTES DE TRÁFICO ABIERTO

Antes de escalar ads, afiliados o contenido, ejecutar un piloto con 5-10 compradores del ICP.
Cada persona completa sin ayuda landing -> onboarding -> paywall -> checkout/trial -> primera
victoria. Registrar source, objeción, tiempo al aha, soporte, primer cobro/cancelación/refund e
entrevista posterior. Ejecutar al menos la matriz de pagos aplicable de `61`.

El piloto no garantiza ventas; evita comprar tráfico para un sistema que cobra mal o promete algo
que no entrega. Sin compradores reales o señal de pago documentada, el veredicto es demanda no
validada y el lanzamiento permanece controlado.

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

- **`58-RETENCION-DE-INGRESOS.md`**: el día después del lanzamiento — proteger el ingreso que entró (cancelación retentiva, dunning, win-back, referidos, renovación anual). El lanzamiento mete el dinero; el 58 evita que se escape.
- **`18-VENTA-HOTMART.md`**: order bumps/upsells generan transacciones que el webhook procesa por `event_id` (idempotencia). Todos los emails del lanzamiento usan el **Resend** ya montado ahí.
- **`02-VALIDACION.md`**: el gate de demanda valida ANTES de invertir en lanzar; la primera victoria <60s del onboarding es lo que se monitorea en D+6.
- **`34-ADQUISICION-Y-TRAFICO.md`**: el lanzamiento concentra los canales de adquisición (afiliados, ads, email) en una ventana; la prueba social de aquí alimenta los creativos y emails de allá.
- **`19-PAGINA-DE-VENTAS.md`**: la oferta de fundadores, los bumps/upsells y la prueba social viven en la landing y en su copy de respuesta directa (sin falsa escasez ni dark patterns).
- **`21-BACKOFFICE.md`**: el efecto de bumps/upsells en el AOV/LTV y las ventas por canal del retro D+7 se MIDEN ahí.
- **`40-UNIT-ECONOMICS.md`**: el precio de fundador y la comisión de afiliados deben respetar el margen — validar la oferta contra la economía unitaria antes de anunciarla.
- **`46-EMAIL-DELIVERABILITY.md` + `47-LEGAL-FISCAL-Y-PRIVACIDAD.md`**: prerrequisito de TODO envío masivo del lanzamiento — SPF/DKIM/DMARC + warmup y consentimiento/opt-in ANTES del primer email de warming.
- **`PROMPT-LANZAMIENTO.txt`** (`/lanzamiento`): el brazo ejecutor de este archivo. Las secciones de churn (cancelación, dunning, win-back, renovación anual) viven en el 58 y se ejecutan con `PROMPT-RETENER-INGRESOS.txt`.
