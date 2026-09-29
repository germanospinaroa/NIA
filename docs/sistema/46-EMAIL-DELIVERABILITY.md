# ENTREGABILIDAD DE EMAIL — Que el correo LLEGUE (autenticación, dominio y reputación con Resend)

> **Cuándo cargar este archivo:**
> - Al verificar el dominio en Resend (junto con `18-VENTA-HOTMART.md`, paso de conexión del dominio)
> - ANTES de mandar la primera secuencia de nurturing del `34-ADQUISICION-Y-TRAFICO.md`
> - Si el cliente "pagó y no recibe el acceso/magic link", o si los emails caen en spam/promociones
> - Al configurar los webhooks de eventos de Resend (bounces/quejas → suppression list)
>
> **Por qué existe (la fuga más cara del SO):** Un email que cae en spam = no se entrega = el usuario no recibe su acceso (`18`) ni su recordatorio de trial = **no activa ni paga**. El SO ya enseña QUÉ emails mandar (transaccionales en `18`, nurturing en `34`), pero da por hecho que *llegan*. No llegan solos. Esta es la **CAPA DE ENTREGABILIDAD** que faltaba: autenticación de dominio, separación transaccional/marketing, calentamiento, higiene de lista y monitoreo. Sin esto, todo el copy del `19`/`34` y todo el webhook del `18` se desperdician en la carpeta de spam.

---

## EL PRINCIPIO: la reputación se gana lento y se pierde rápido

Gmail, Outlook y Yahoo no leen tu email y deciden "esto es bueno". Deciden por **reputación**: ¿este dominio autentica bien?, ¿la gente abre o marca como spam?, ¿rebota mucho? La reputación tarda semanas en construirse y se desploma en una sola campaña mala a una lista sucia.

```
1. AUTENTICA o no existes. Sin SPF + DKIM + DMARC, Gmail/Yahoo mandan a spam o RECHAZAN.
   Desde febrero 2024 lo EXIGEN para remitentes de volumen (>5.000/día), y premian tenerlos a todos.
2. SEPARA transaccional de marketing. El acceso/magic link (18) NO puede caer en spam por culpa de
   una campaña de nurturing (34) que recibió quejas. Subdominios distintos = reputaciones distintas.
3. CALIENTA. Un dominio nuevo que pasa de 0 a 10.000 emails huele a spammer. Sube el volumen gradual.
4. HIGIENE. Cada bounce y cada queja te baja la reputación. Suprime al instante, nunca compres listas.
5. MIDE. Google Postmaster Tools + eventos de Resend. Si no ves tu spam rate, vuelas a ciegas.
```

> **El transaccional es el que NO puede fallar.** El magic link de `18` es parte del servicio que el cliente PAGÓ. Si cae en spam, el cliente "pagó y no entra" (ver ese bug en `18`). Toda esta capa existe sobre todo para blindar ese correo.

---

## AUTENTICACIÓN DE DOMINIO (lo NO negociable)

Tres registros DNS. Cada uno responde una pregunta que el receptor se hace antes de aceptar tu correo:

```
SPF   → ¿este servidor TIENE PERMISO de enviar en nombre de mi dominio?  (lista de remitentes autorizados)
DKIM  → ¿el contenido viene firmado y NO fue alterado en el camino?      (firma criptográfica)
DMARC → ¿qué hago si SPF o DKIM fallan, y a dónde te reporto?            (política + alineación + reportes)
```

**Resend genera SPF y DKIM por ti** al verificar el dominio (los pegas en tu registrador: GoDaddy/Namecheap/Cloudflare). DMARC lo agregas tú a mano. Sin los tres, los grandes proveedores te mandan a spam o te rechazan.

### Registros DNS (ejemplo para el subdominio transaccional `tx.tuapp.com`)

> Los valores EXACTOS de SPF y DKIM los entrega Resend en su panel al agregar el dominio — **cópialos de ahí**, no inventes el host/valor. Lo de abajo es la FORMA que tienen.

```dns
; --- SPF --- (Resend lo genera; un único registro TXT tipo "spf1" por dominio de envío)
tx.tuapp.com.        TXT   "v=spf1 include:amazonses.com ~all"
; ~all = softfail (recomendado mientras observas). NUNCA tengas DOS registros SPF en el mismo host.

; --- DKIM --- (Resend genera el selector y la llave pública; suele ser un CNAME o TXT)
resend._domainkey.tx.tuapp.com.   CNAME   <valor-que-da-resend>.dkim.amazonses.com.
; (o TXT "v=DKIM1; k=rsa; p=MIGfMA0G...")  ← copiar literal del panel de Resend

; --- DMARC --- (lo agregas TÚ; empieza SIEMPRE en p=none para observar sin romper nada)
_dmarc.tx.tuapp.com.   TXT   "v=DMARC1; p=none; rua=mailto:dmarc@tuapp.com; fo=1; adkim=s; aspf=s"
```

- `rua=` → a dónde llegan los reportes agregados (crea ese buzón o usa un agregador gratis tipo Postmark DMARC / dmarc.postmarkapp.com para leerlos).
- `adkim=s; aspf=s` → alineación estricta (el dominio del `From` debe coincidir con el firmado). Empieza relajado (`r`) si rompe algo, endurece después.

### La política DMARC es PROGRESIVA (no saltes a `reject`)

```
p=none        → OBSERVAR. No bloquea nada; solo te REPORTA quién envía en tu nombre. Vive aquí
                1-4 semanas leyendo reportes hasta confirmar que TODO tu correo legítimo
                (Resend, y cualquier otro) pasa SPF/DKIM alineado.
   ↓ (cuando los reportes salen limpios)
p=quarantine  → lo dudoso va a SPAM. Sigue observando; revisa que no caiga correo bueno.
   ↓ (cuando confirmas que solo lo ilegítimo se cuarentena)
p=reject      → lo que falla se RECHAZA. Máxima protección anti-spoofing de tu marca. Destino final.
```

> ⚠️ **Saltar directo a `p=reject` con la config a medias = bloqueas TU PROPIO correo** (incluido el magic link). Por eso `none` → `quarantine` → `reject`, leyendo reportes en cada paso. Es la misma filosofía progresiva que el deploy gradual del SO: observar antes de hacer cumplir.

---

## DOMINIO/SUBDOMINIO DE ENVÍO DEDICADO (separar para proteger lo crítico)

**Regla dura: NUNCA envíes desde el dominio raíz `tuapp.com` a secas, y NUNCA mezcles transaccional con marketing en el mismo subdominio.**

```
tx.tuapp.com     → TRANSACCIONAL: acceso, magic link (18), recibos, recordatorio de fin de trial,
                   avisos de pago fallido. Volumen bajo, abierto casi siempre, CERO quejas.
                   ES EL QUE NO PUEDE FALLAR.

news.tuapp.com   → MARKETING / NURTURING (34): secuencia de bienvenida, newsletter, ofertas.
                   Volumen alto, más quejas y bajas naturales. Aquí vive el riesgo.
```

**Por qué la separación salva la venta:** la reputación se acumula POR DOMINIO de envío. Si una campaña de `news.tuapp.com` recibe quejas (alguien marca tu newsletter como spam) o rebota mucho, esa mala reputación NO contamina a `tx.tuapp.com`. El magic link sigue llegando aunque el marketing se queme. Si los mezclaras, una sola campaña tóxica tumbaría los emails de acceso de TODOS tus clientes que pagaron — el peor escenario posible.

```
EN RESEND: agregar AMBOS subdominios como dominios verificados separados (cada uno con su SPF/DKIM/DMARC).
EN EL CÓDIGO: dos remitentes y, idealmente, DOS API keys (ver "Resend specifics" abajo):
  - transaccional:  "Acceso TuApp <acceso@tx.tuapp.com>"
  - marketing:      "TuApp <hola@news.tuapp.com>"
```

> **El subdominio también protege el raíz.** Enviar desde subdominios deja `tuapp.com` "limpio" para tu correo corporativo (Google Workspace) y evita que una mala racha de email transaccional/marketing afecte la reputación del dominio principal.

---

## WARMUP (calentamiento de un dominio nuevo)

Un dominio que nunca envió correo no tiene reputación. Si su primer día son 10.000 emails, los filtros leen "esto es un spammer estrenando dominio" y te mandan directo a spam o te limitan (throttling). La solución es **subir el volumen gradualmente**.

```
POR QUÉ huele a spam un pico nuevo: los remitentes legítimos crecen orgánicamente; los spammers
queman un dominio nuevo con un blast masivo y lo desechan. Un volumen 0→masivo IMITA ese patrón.

PLAN DE WARMUP (orientativo; ajusta a tu volumen real):
  Día 1-2:   ~50/día      Semana 2:  ~500/día
  Día 3-4:   ~100/día     Semana 3:  ~1.000-2.000/día
  Día 5-7:   ~250/día     Semana 4+: duplicar mientras la reputación y los opens se mantengan sanos
  → empieza enviando a tus contactos MÁS comprometidos (los que SÍ abren): suben tu reputación rápido.
```

- **Lo bueno para apps del SO:** el transaccional de `18` se calienta SOLO y orgánicamente (cada venta = 1 email de acceso a alguien que lo espera y lo abre). Ese es el mejor warmup posible. El cuidado real es con el **marketing masivo** de `34` en `news.tuapp.com`: no dispares una secuencia a 5.000 leads el día que verificas el dominio.
- Resend ofrece IPs compartidas (ya calientes) por defecto — suficiente para la mayoría de apps del SO. Una IP dedicada solo tiene sentido a alto volumen y EXIGE warmup manual.

---

## HIGIENE DE LISTA (cada bounce y cada queja te cuestan reputación)

```
✅ DOUBLE OPT-IN para marketing: el lead confirma su email con un clic antes de entrar a la lista.
   Filtra typos y trampas, y prueba consentimiento (LGPD, ver 09). El transaccional NO lo necesita.
✅ SUPRIMIR al instante: un hard bounce o una queja → a la SUPPRESSION LIST, no le vuelvas a escribir.
   Resend mantiene una suppression list; aliméntala con sus webhooks (abajo).
✅ SUNSET de inactivos: quien no abre en 60-90 días → email de reenganche; si sigue sin abrir, lo
   sacas del marketing. Mandarle a quien nunca abre baja TU reputación para todos los demás.
❌ NUNCA comprar/scrapear listas. Son spam traps garantizados: una sola dirección trampa puede
   blacklistear tu dominio. Mata la entregabilidad del transaccional también. Cero excepciones.

UMBRALES A NO CRUZAR (si los pasas, los proveedores te castigan):
  Bounce rate    < 2%   (tolerable hasta ~5%; arriba de eso, frena y limpia la lista)
  Spam/quejas    < 0.1% (1 queja por cada 1.000 envíos; Gmail empieza a penalizar cerca de 0.3%)
```

- **Hard bounce** (no existe / dominio inválido) → suprimir SIEMPRE. **Soft bounce** (buzón lleno, temporal) → reintentar unas veces, luego suprimir si persiste.
- En el SO esto se conecta directo con el `webhook_log`/perfiles de `18`: el email del comprador viene de Hotmart, casi siempre válido (bajo bounce), pero igual hay que respetar las bajas del marketing.

---

## CONTENIDO ANTI-SPAM (lo que mira el filtro además de la autenticación)

Autenticar bien es necesario pero no suficiente: el filtro también lee el correo. Reglas para no oler a spam:

```
✅ Header List-Unsubscribe (ONE-CLICK) en TODO email de marketing/masivo — OBLIGATORIO desde 2024
   para remitentes de volumen (Gmail/Yahoo). Da de baja en un clic sin abrir el email.
✅ Link de baja VISIBLE en el cuerpo del email de marketing (además del header).
✅ From CONSISTENTE y reconocible: siempre el mismo "TuApp <hola@news.tuapp.com>". Cambiarlo
   reinicia tu reputación de remitente.
✅ Texto plano + HTML (multipart): manda ambas versiones. Solo-HTML puntúa peor.
✅ Ratio texto/imagen sano: emails todo-imagen (o una imagen gigante con 3 palabras) = bandera roja.
   Suficiente texto real, imágenes con alt.

❌ Acortadores de URL (bit.ly y compañía): asociados a spam; usa tu propio dominio en los links.
❌ Palabras gatillo apiladas ("GRATIS!!! GANA DINERO YA 100% GARANTIZADO 💰💰"), MAYÚSCULAS y
   exceso de signos. (Coherente con los claims PROHIBIDOS del copy en 19/34.)
❌ Adjuntos pesados o ejecutables en email frío.
```

- **El transaccional de `18`** NO lleva `List-Unsubscribe` de marketing (no es marketing: es servicio que el usuario pidió al pagar), pero SÍ cuida el `From` consistente, multipart y links propios. **No metas promociones dentro de un email transaccional** — eso lo convierte en marketing y dispara quejas sobre el dominio crítico.

---

## MONITOREO (si no lo mides, vuelas a ciegas)

```
GOOGLE POSTMASTER TOOLS  (postmaster.google.com)  → la verdad sobre tu reputación en Gmail (el receptor
  #1 en LATAM). Verifica tu dominio de envío ahí y vigila:
    - Spam rate         → el número rey. Mantener < 0.1%; ALARMA cerca de 0.3%.
    - Domain/IP reputation → "High/Medium/Low/Bad". Si baja, FRENA el marketing y limpia lista.
    - Autenticación     → % de correo que pasa SPF/DKIM/DMARC (debería ser ~100%).

MÉTRICAS DE RESEND (panel + webhooks):
    - delivered   → aceptados por el receptor (no garantiza inbox, pero sí "no rechazado").
    - bounced     → vigilar < 2-5%. Picos = lista sucia o problema de dominio.
    - complained  → vigilar < 0.1%. Cada uno → suprimir y revisar qué campaña lo causó.
    - opened/clicked → señal de engagement (relativa: el open tracking es imperfecto, pero útil de tendencia).

QUÉ HACER CON LOS UMBRALES: si bounce o quejas suben, o la reputación baja en Postmaster →
  PAUSAR envíos de marketing, limpiar la lista, y dejar que el transaccional (bajo riesgo) recupere
  la reputación antes de retomar campañas. Conecta con el panel de salud del 21-BACKOFFICE.
```

---

## RESEND SPECIFICS (cómo se aterriza todo lo anterior)

Resend es el default de email del SO (ver `18`). Esta capa se monta sobre la misma cuenta.

### 1. Verificar dominio(s) y configurar DNS

```
1. resend.com → Domains → Add Domain → agregar tx.tuapp.com (y aparte news.tuapp.com).
2. Resend muestra los registros SPF y DKIM EXACTOS → pegarlos en tu registrador (GoDaddy/
   Namecheap/Cloudflare). Agregar TÚ el registro DMARC (empezando en p=none).
3. Esperar verificación (propagación DNS: minutos a 48h). Hasta que Resend marque "Verified",
   no envíes en serio.
4. Region: elegir la más cercana a tu mercado para latencia.
```

### 2. Webhooks de eventos → suppression list + `profiles`

Resend emite eventos por cada email. Engánchalos para mantener la lista limpia **automáticamente** (mismo patrón de webhook que el de Hotmart en `18`: verificar firma, idempotencia, responder 200).

```typescript
// app/api/webhooks/resend/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';              // Resend firma con Svix; verifica con tu signing secret
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';            // necesitamos raw body para verificar la firma

const admin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,   // service role: SOLO servidor, NUNCA frontend
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  const raw = await req.text();             // RAW body (la firma se valida sobre los bytes exactos)
  const wh = new Webhook(process.env.RESEND_WEBHOOK_SECRET!); // fail-secure si falta (ver 27)
  let evt: any;
  try {
    evt = wh.verify(raw, {                   // verifica autenticidad; lanza si no cuadra
      'svix-id': req.headers.get('svix-id')!,
      'svix-timestamp': req.headers.get('svix-timestamp')!,
      'svix-signature': req.headers.get('svix-signature')!,
    });
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const email = evt.data?.to?.[0] ?? evt.data?.email;
  switch (evt.type) {
    case 'email.bounced':                    // hard bounce → suprimir, no volver a escribir
    case 'email.complained':                 // marcó como spam → suprimir y NO mandarle marketing
      await admin.from('email_suppression').upsert({
        email, reason: evt.type, suppressed_at: new Date().toISOString(),
      });
      // y reflejarlo en el perfil para que el cron de nurturing (34) lo SALTE:
      await admin.from('profiles')
        .update({ marketing_opt_out: true })
        .eq('email', email);
      break;
    case 'email.delivered':                  // (opcional) métricas/telemetría
    case 'email.opened':
      break;
  }
  return NextResponse.json({ received: true }); // 200 siempre que se procesó (o Resend reintenta)
}
```

```sql
-- tabla mínima de supresión (consultarla SIEMPRE antes de enviar marketing)
create table email_suppression (
  email         text primary key,
  reason        text not null,               -- bounced | complained | unsubscribed
  suppressed_at timestamptz not null default now()
);
```

> **Antes de CADA envío de marketing**, filtra contra `email_suppression` y `marketing_opt_out`. Un solo email a alguien que ya se quejó vuelve a contar como queja y te hunde más.

### 3. Separar API keys / dominios por tipo

```
RESEND_API_KEY_TX        → key para el dominio tx.tuapp.com (transaccional: acceso, magic link, recibos).
RESEND_API_KEY_MARKETING → key para el dominio news.tuapp.com (nurturing/newsletter de 34).
```

```typescript
// lib/email.ts — dos clientes, dos remitentes (extiende el lib/email.ts del archivo 18)
import { Resend } from 'resend';
export const resendTx = new Resend(process.env.RESEND_API_KEY_TX);
export const resendMkt = new Resend(process.env.RESEND_API_KEY_MARKETING);

export const FROM_TX  = 'Acceso TuApp <acceso@tx.tuapp.com>';   // 18: bienvenida/magic link/recibos
export const FROM_MKT = 'TuApp <hola@news.tuapp.com>';          // 34: nurturing/newsletter
```

Así un fallo o castigo en el marketing no comparte key ni dominio con el correo que entrega el acceso. (Mantén el `lib/email.ts` del `18` como única fuente; aquí solo lo extiendes con el segundo cliente/remitente.)

---

## TRANSACCIONAL vs MARKETING (la línea de consentimiento)

No es solo entregabilidad — es **legal** (consentimiento / LGPD, enlaza `47-LEGAL-FISCAL-Y-PRIVACIDAD.md`):

```
TRANSACCIONAL (18)  → NO requiere opt-in: es parte del SERVICIO que el usuario pidió/pagó.
  Ejemplos: email de acceso, magic link, recibo, recordatorio de fin de trial, aviso de pago fallido.
  NO lleva List-Unsubscribe de marketing (no puedes "darte de baja" del email que te da tu acceso).
  → REGLA: que sea PURAMENTE de servicio. En el momento que le metes una promo, se vuelve marketing.

MARKETING (34)      → SÍ requiere opt-in (consentimiento explícito; double opt-in recomendado).
  Ejemplos: secuencia de nurturing, newsletter, ofertas, win-back.
  SIEMPRE con List-Unsubscribe + baja visible. Respeta la suppression list y el opt-out.
  → Base legal: consentimiento del titular (LGPD/equivalente local). Ver 09 para el manejo del dato.

NUNCA los mezcles: ni en el mismo subdominio (reputación), ni en el mismo email (consentimiento).
```

---

## CÓMO SE CONECTA

```
18-VENTA-HOTMART.md   → ESTE archivo blinda el correo del que depende ese flujo: el email de
                        bienvenida/magic link (lib/email.ts, Resend) sale por tx.tuapp.com y NO puede
                        caer en spam, o el cliente "pagó y no entra". Reusa el mismo RESEND, dominio
                        verificado y el patrón de webhook (firma + idempotencia + 200).
34-ADQUISICION...md   → el nurturing/newsletter de 34 vive en news.tuapp.com (separado) y obedece
                        toda esta capa: double opt-in, List-Unsubscribe, suppression list, warmup del
                        marketing masivo. El cron de secuencias SALTA a quien esté suprimido/opt-out.
47-LEGAL-FISCAL-Y-PRIVACIDAD.md → la línea transaccional/marketing es también la línea de CONSENTIMIENTO (LGPD):
                        el opt-in del marketing y el manejo del dato del email se rigen por 47.
27-REVISION-SEGURIDAD → fail-secure de los secretos (RESEND_WEBHOOK_SECRET, API keys): crashear si
                        faltan, nunca un default de juguete; verificar firma sobre el RAW body.
21-BACKOFFICE.md      → el monitoreo (spam rate, bounce, quejas, reputación) alimenta el panel de
                        salud; "reputación cayendo" o "sin entregas" es una alerta operativa más.
```

---

## CHECKLIST DE ENTREGABILIDAD

```
AUTENTICACIÓN (no negociable)
[ ] SPF configurado (registro de Resend pegado en el registrador; UN solo SPF por host)
[ ] DKIM configurado (selector/llave de Resend pegados; verificado en el panel)
[ ] DMARC en p=none, con rua= a un buzón/agregador que LEES
[ ] Plan de subir DMARC progresivo: none → quarantine → reject (tras leer reportes limpios)
[ ] Dominio(s) marcados "Verified" en Resend antes de enviar en serio

SEPARACIÓN
[ ] Subdominio transaccional (tx.tuapp.com) ≠ subdominio marketing (news.tuapp.com)
[ ] NO se envía desde el dominio raíz a secas
[ ] Dos remitentes (y dos API keys) por tipo; transaccional aislado del marketing
[ ] Ningún email transaccional lleva promociones (se mantiene puramente de servicio)

WARMUP
[ ] El marketing masivo NO arranca a full el día que se verifica el dominio (volumen gradual)
[ ] Primeros envíos a los contactos más comprometidos (los que abren)

HIGIENE DE LISTA
[ ] Double opt-in en el alta de marketing
[ ] Webhooks de Resend (bounced/complained) → suppression list + marketing_opt_out en profiles
[ ] Cada envío de marketing filtra contra suppression list / opt-out ANTES de mandar
[ ] Sunset de inactivos (60-90 días sin abrir)
[ ] CERO listas compradas. Bounce < 2-5%. Quejas < 0.1%.

CONTENIDO
[ ] List-Unsubscribe one-click en todo email de marketing/masivo (header) + baja visible en el cuerpo
[ ] From consistente y reconocible; multipart (texto plano + HTML)
[ ] Links con dominio propio (sin acortadores); sin palabras-gatillo apiladas; ratio texto/imagen sano

MONITOREO
[ ] Dominio verificado en Google Postmaster Tools; spam rate < 0.1% vigilado
[ ] Métricas de Resend revisadas (delivered/bounced/complained); alertas si cruzan umbral
[ ] Plan de reacción: si la reputación baja → pausar marketing, limpiar lista, dejar recuperar el tx

CONSENTIMIENTO (legal)
[ ] Transaccional sin opt-in (servicio); marketing con opt-in registrado (LGPD, ver 09)
[ ] Transaccional y marketing nunca mezclados (ni subdominio ni email)
```
