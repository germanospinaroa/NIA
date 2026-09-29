# SOPORTE AL CLIENTE — El Sistema de Retención que Evita Reembolsos, Churn y Reseñas de 1 Estrella

> **Cuándo cargar este archivo:**
> - Al montar el sistema de soporte (canal, plantillas, SLA) — normalmente al primer comprador real
> - Cada vez que hay que responder compradores, bajar tickets o prevenir reembolsos/reseñas negativas
> - Cuando el churn sube y hay que activar el soporte PROACTIVO (rescate por señal, no por ticket)
>
> **Se combina con:** `58-RETENCION-DE-INGRESOS.md` (el rescate de cancelaciones, dunning y win-back que el soporte proactivo dispara), `18-VENTA-HOTMART.md` (reembolsos y el portal del comprador de Hotmart), y `47-LEGAL-FISCAL-Y-PRIVACIDAD.md` (las obligaciones legales de atención: política de reembolso, "cómo cancelar" in-app).
>
> **Por qué existe:** el soporte NO es un buzón olvidado — es un SISTEMA DE RETENCIÓN. Un cliente bien atendido no churnea, y rescatar a uno que ya pagó es más barato que conseguir un reemplazo (CAC). Este archivo consolida el pilar completo: canales por etapa, SLA, plantillas, IA + escalada humana, rescate proactivo de churn, loop de feedback y métricas.

---

## PRINCIPIO: el soporte ES parte del producto vendible

Un cliente bien atendido NO churnea. Y como el soporte rescata clientes que ya pagaron, es **la inversión de retención más barata que existe** — evita el CAC de conseguir un reemplazo (conecta con `40-UNIT-ECONOMICS.md`: un cliente retenido vale su LTV completo; uno perdido cuesta un CAC nuevo). El soporte malo no se ve en el balance hasta que el churn lo grita.

Una app que se vende necesita un canal de soporte real — no solo un link legal "Contacto" en el footer.

---

## CANALES POR ETAPA (no montes un call center el día 1)

```
MÍNIMO VIABLE (arranque):
  - Email soporte@tuapp.com  +  Centro de ayuda / FAQ (las dudas top, reduce tickets).
  - Formulario in-app que escribe a una tabla `support_tickets` + email a ti (Resend),
    o una herramienta gratis (Crisp, Plain, Tawk). VISIBLE desde la app, no escondido.
  - Respuesta automática de "lo recibimos" al instante (gestiona expectativas).

CRECIENDO (cuando el volumen lo justifique):
  - Chat (Crisp/Plain/Tawk, varios con plan gratis) para respuesta más rápida.
  - Base de conocimiento navegable + búsqueda.

NO antes de tiempo: teléfono/WhatsApp 1:1 no escala — añádelo solo si tu avatar lo exige.

COMUNIDAD DE CLIENTES (WhatsApp/Telegram/Discord — el canal del nicho, ver 58 "Comunidad
post-compra"): también es canal informal de soporte y motor de retención; el dueño la vigila.
```

---

## SLA — define y CUMPLE un tiempo de respuesta

```
- SLA explícito y prometido: ej. primera respuesta < 24h hábiles (y dilo en el centro de ayuda).
- Respuesta automática de "lo recibimos" al instante (gestiona expectativa desde el minuto cero).
- CANNED RESPONSES / plantillas para lo repetitivo (acceso, magic link no llega, cómo cancelar,
  cómo actualizar el método de pago → enlaza con el dunning de 58). Responder rápido y bien lo
  repetitivo libera tiempo para lo difícil.
```

---

## PLANTILLAS BASE (adaptar el tono al arquetipo de voz del 11)

Las 4 canned responses que cubren el grueso de los tickets del día 1. Copiar, adaptar el tono y tenerlas listas ANTES del primer comprador:

```
1. "NO ME LLEGÓ EL ACCESO"
   "¡Hola [nombre]! Ya reviso tu compra. [Verificar la compra en Hotmart] Encontré tu pago ✓ —
   te acabo de reenviar el enlace de acceso (magic link) a [email]. Revisa también spam/promociones.
   Si compraste con OTRO email distinto al que me escribes, dime cuál usaste en Hotmart y lo
   arreglamos en un minuto." → si el email difiere del de Hotmart: seguir el flujo de reclamo del 18.

2. "EL MAGIC LINK NO FUNCIONA / CADUCÓ"
   "Esos enlaces caducan por seguridad — te acabo de enviar uno nuevo a [email]. Ábrelo en el
   mismo dispositivo donde quieres usar la app. Si no llega en 5 minutos, revisa spam y
   promociones; si sigue sin aparecer, avísame y lo revisamos juntos (a veces el proveedor de
   correo lo retiene — verificar dominio/entregabilidad, 46)."

3. "¿CÓMO CANCELO?"
   "Cancelar es fácil y sin trucos: entra a tu portal del comprador de Hotmart ([link]) →
   Suscripciones → Cancelar. Tu acceso sigue activo hasta el fin del período ya pagado.
   Antes de que te vayas: ¿me cuentas en una línea qué te faltó o qué no funcionó para ti?
   Si es [precio/una función], quizá tengo una alternativa que te sirva." (pregunta retentiva
   suave — la oferta de rescate según la razón vive en 58; nunca esconder el botón ni presionar.)

4. "QUIERO UN REEMBOLSO"
   "Claro, sin problema — tu compra tiene garantía de [N] días. El reembolso se procesa
   directamente en Hotmart: [pasos/link del portal del comprador]. En cuanto lo solicites,
   Hotmart te confirma por email y el dinero vuelve por el mismo medio de pago. Si algo de la
   app no funcionó como esperabas, me encantaría saberlo para arreglarlo." (tono SIN fricción:
   un reembolso fácil evita el chargeback y la reseña de 1 estrella.)
```

> Genera el resto con el mismo formato cuando aparezca un tema repetido (≥3 tickets iguales = plantilla nueva).

---

## SOPORTE CON IA + ESCALADA HUMANA (regla dura)

```
- Un bot/FAQ con IA responde lo repetitivo (acceso, facturación, "cómo hago X"). Bien hecho,
  resuelve el grueso sin intervención humana.
- Aplica los GUARDRAILS de 30: moderación de la salida, anti-inyección (el usuario no debe poder
  reprogramar al bot), grounding (responde SOLO con base en tu FAQ/docs; si no sabe, escala).
- ⛔ REGLA DURA: NUNCA dejar al usuario en LOOP con un bot sin salida a humano. Siempre un
  "hablar con una persona" visible. Un bot que no resuelve Y no deja escalar es un generador de
  churn y reseñas de 1 estrella en el marketplace de Hotmart.
```

---

## SOPORTE QUE RESCATA CHURN (proactivo, no reactivo)

El mejor soporte no espera el ticket: detecta la señal y actúa. Conecta directo con la cancelación retentiva, el dunning y el win-back de `58`.

```
SEÑAL                          → INTERVENCIÓN PROACTIVA (cruza con 58)
Cancela (encuesta de baja)     → oferta de rescate según la razón / oferta de PAUSA
past_due (pago falló, de 18)   → cadencia de dunning días 1/3/5/7 — "actualiza tu método"
Caída de uso / no vuelve       → re-onboarding ("el valor que te perdiste") + tip de uso
Ticket sin resolver > SLA      → escalar y disculpa proactiva (un ticket olvidado = churn casi seguro)
```

---

## LOOP DE FEEDBACK — el soporte es tu mejor fuente de producto

```
- Los tickets recurrentes SON el backlog: si 5 personas preguntan lo mismo, no respondas 5 veces —
  ARRÉGLALO en la UI/onboarding.
- Cada tema recurrente → un candidato a mejora del producto y a caso del descubrimiento continuo (44).
- Cada bug reportado en soporte → un caso de regresión (test de 06 o eval de 31), para que no vuelva.
- Revisar el TOP-5 de temas cada semana/quincena → alimenta el backlog y el descubrimiento (44).
```

---

## MÉTRICAS DE SOPORTE (mídelas, o no lo estás operando)

| Métrica | Qué indica | Señal de alarma |
|---|---|---|
| **Tiempo de primera respuesta** | ¿cumples tu SLA? | sistemáticamente > SLA prometido |
| **CSAT** (satisfacción post-ticket) | ¿resolviste bien? | tendencia a la baja |
| **Tickets / usuario activo** | ¿el producto confunde? | sube = fricción en la UI |
| **Top-5 temas recurrentes** | QUÉ arreglar en el producto | el mismo tema mes a mes = no lo arreglaste |
| **% resuelto por IA / sin escalar** | eficiencia del bot | bajo = el bot no ayuda; muy alto = ¿escala bien lo difícil? |
| **Tickets que terminaron en cancelación** | soporte como retención | alto = el soporte no rescata |

> **El top-5 de temas recurrentes es oro de producto.** No es una lista de quejas: es el roadmap que tus clientes ya te escribieron. Cruzarlo con `44` (descubrimiento) y las razones de cancelación (`58`) te dice exactamente qué arreglar para bajar churn — gratis.

---

## CHECKLIST DE CIERRE — Soporte como Retención

```
[ ] Canal real visible en la app (email soporte@ + FAQ mínimo; formulario → support_tickets + Resend
    o Crisp/Plain/Tawk; chat al crecer) — nunca solo el link legal "Contacto"
[ ] Respuesta automática de "lo recibimos" activa
[ ] SLA definido y prometido (ej. < 24h) + canned responses para lo repetitivo
[ ] Bot/IA de FAQ con escalada a humano SIEMPRE disponible (nunca loop sin salida) — guardrails de 30
[ ] Soporte proactivo cableado a 58: rescate por cancelación, dunning (past_due), re-onboarding
[ ] Loop de feedback: top-5 temas → backlog/UI (44); bug de soporte → test/eval (06/31)
[ ] Métricas: tiempo de respuesta, CSAT, tickets/usuario, top-5 temas, % resuelto por IA
```

---

## CÓMO SE CONECTA

```
58-RETENCION-DE-INGRESOS.md → el soporte proactivo dispara su cancelación retentiva, oferta de pausa,
                         dunning (past_due) y win-back; el soporte es el brazo humano de la retención.
18-VENTA-HOTMART.md    → los reembolsos/chargebacks se operan en Hotmart (el webhook corta el acceso);
                         el portal del comprador es adonde apunta la página "cómo cancelar"; Resend
                         monta los emails de soporte.
47-LEGAL-FISCAL-Y-PRIVACIDAD.md → las obligaciones legales de atención (política de reembolso alineada
                         con Hotmart, "cómo cancelar" in-app, aviso de renovación) viven ahí.
40-UNIT-ECONOMICS.md   → el soporte como retención protege el LTV (un cliente retenido = su LTV;
                         uno perdido = un CAC nuevo).
31-EVALS-OBSERVABILIDAD-OPERACION.md → los bugs de soporte se vuelven casos de regresión/eval;
                         la status page baja tickets a la mitad cuando algo falla.
30-INTEGRACION-IA.md   → los guardrails (moderación, anti-inyección, grounding) son la base del bot.
44-DESCUBRIMIENTO-DE-USUARIO.md → el top-5 de temas de soporte alimenta el descubrimiento continuo.
```
