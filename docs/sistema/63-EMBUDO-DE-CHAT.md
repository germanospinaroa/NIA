# 63 — EMBUDO DE CHAT — Vender con una página que conversa (Meta Ads → chat propio → Hotmart)

> **Cuándo cargar este archivo:**
> - Cuando el dueño quiere vender su app con un EMBUDO DE CHAT: anuncio de Meta → una página
>   PROPIA con formato de conversación → checkout de Hotmart.
> - Antes de clonar y adaptar la plataforma del curso (carpeta `wsp-funnel`) o de crear el flujo
>   de conversación — el protocolo ejecutable vive en `PROMPT-EMBUDO-CHAT.txt` (comando `/embudo-chat`).
> - Junto con `34-ADQUISICION-Y-TRAFICO.md` (los ads que traen el tráfico y el gate del píxel),
>   `19-PAGINA-DE-VENTAS.md` (la landing canónica — sigue siendo el default),
>   `02B-ONBOARDING-Y-PAYWALL.md` (escalera de compromiso), `02C-PRICING-Y-MODELO-DE-NEGOCIO.md`
>   (pricing y pre-cierre) y `18-VENTA-HOTMART.md` (el checkout donde cierra la venta).

> **Por qué existe:** el formato de conversación convierte muy bien al tráfico frío de Meta —
> pero el camino "WhatsApp real" mata a los novatos (baneos, número, plantillas, API). Este
> módulo define el camino seguro: un SIMULADOR de chat en página propia, con marca propia,
> que comparte TODO con el SO (avatar, mecanismo, precios, checkout) y cierra en Hotmart.

---

## §1 QUÉ ES Y CUÁNDO ELEGIRLO

El EMBUDO DE CHAT es un segundo camino de venta: el anuncio de Meta no aterriza en la landing
clásica sino en una página tuya que SE VE como un chat — mensajes automáticos que aparecen uno a
uno, y el visitante solo TOCA BOTONES para avanzar. **NO es WhatsApp real**: es tu propia página
web con formato de conversación. Esa diferencia es la ventaja:

```
1. CERO riesgo de baneo, número o plantillas: no dependes de Meta/WhatsApp Business, de un
   número de teléfono ni de aprobaciones de mensajes. Nadie te puede cerrar el canal.
2. Respuesta INSTANTÁNEA garantizada: el "chat" contesta en 1-2 segundos, 24/7, sin humano
   ni IA cara detrás. Un chat real sin respuesta rápida es una venta muerta.
3. SOLO BOTONES (sin preguntas abiertas): el visitante nunca escribe — elige. Cero mensajes
   imposibles de responder, cero moderación, y cada tap es un dato limpio.
4. Analítica por TAP + Píxel/Conversions API optimizando por COMPRAS: cada botón es un evento;
   Meta aprende de quién COMPRA, no de quién chatea.
5. Personalización REAL: la página ramifica según las respuestas (E2→E3) — algo que un humano
   contestando WhatsApp a mano no logra a escala.
```

**Vs el Click-to-WhatsApp real (CTWA):** la ventana gratuita de 72 horas de Meta para
conversaciones iniciadas por CTWA existe (verificado 2026), pero exige la API oficial, un número
dedicado y calidad de mensajería sostenida. Y el modo de muerte #1 del canal es real: la ola
2025-26 de baneos "en 2 días sin aviso" a cuentas que usan APIs no oficiales. Para el alumno
novato, el simulador elimina ese riesgo por diseño. El CTWA real queda como táctica avanzada
del `34-ADQUISICION-Y-TRAFICO.md`, no como el camino default de venta conversacional.

**Cuándo elegirlo:** como VARIANTE de la landing para tráfico frío de Meta. La decisión
(landing clásica vs embudo de chat, o A/B entre ambos con `37-FEATURE-FLAGS-Y-EXPERIMENTOS.md`)
se toma una vez y se anota en ESTADO.md. La landing canónica del `19-PAGINA-DE-VENTAS.md`
sigue siendo el default del SO; el embudo de chat es el segundo camino, no el reemplazo.

---

## §2 LA REGLA DE MARCA (anti-suplantación)

```
EL FORMATO ES DE TODOS; LA MARCA ES DE META.
· Burbujas, "escribiendo…", avatar circular, botones de respuesta → formato genérico de chat:
  usarlo es legítimo.
· Logo de WhatsApp, el nombre "WhatsApp", su verde exacto + header característico (el trade
  dress completo) → son de Meta. Imitarlos = la página SUPLANTA a WhatsApp: riesgo de rechazo
  de anuncios por suplantación de marca + dark pattern (el visitante cree estar en otra app).
```

La página es **"el chat de [tu app]"**: se tematiza con la FICHA-ARTE.md propia (paleta,
tipografía, radios, avatar de marca). Debe verse como TU producto conversando, no como un
WhatsApp disfrazado. Esto no es solo legal/ads: la confianza que convierte nace de una marca
que da la cara, no de un truco.

---

## §3 EL GUION DE 7 ETAPAS (todo con botones — cierra 100% en la página)

El copy NO se inventa: se DERIVA de FICHA-AVATAR.md (dolores, deseos, objeciones, sus palabras)
y del mecanismo nombrado de FICHA-MODELO.md / la Constitución del Producto — la regla de hilo
de siempre: cada burbuja debe poder trazarse a un campo de las fichas.

```
E1 APERTURA — 2-3 burbujas de persona real (nombre + rol, no "bot"): la promesa central + el
   mecanismo NOMBRADO. Un solo botón para avanzar (el primer micro-sí).
E2 MINI-DIAGNÓSTICO — 2-3 preguntas con botones, salidas de los dolores de la ficha. Es el
   quiz de onboarding en formato chat: preguntar antes de vender DUPLICA la activación
   (Headspace: 31%→63% al pasar de landing directa a quiz).
E3 RESULTADO PERSONALIZADO — la página ramifica por la COMBINACIÓN de respuestas y devuelve
   un diagnóstico corto que usa SUS palabras (las opciones que tocó). Aquí se siente escuchado.
E4 DEMO POR DENTRO — video de 30-60s o capturas REALES de la app resolviendo SU caso. Si el
   video aún no existe: slot [VIDEO AQUÍ] visible y pendiente en ESTADO.md — JAMÁS inventar.
   Prueba social solo si es real (política del 19: nunca testimonios fabricados).
E5 OFERTA — plan anual anclado en $/mes + total anual visible + trial si existe (02C).
   Botones: [Anual] [Mensual] [Tengo una duda]. El precio se muestra AQUÍ, antes de cualquier
   botón de pago — nadie llega al checkout sin haberlo visto.
E6 CIERRE — cada plan lleva a SU link de checkout de Hotmart con sck=chat-[campaña]-[plan].
   [Tengo una duda] abre las 3 objeciones TOP de la ficha, cada una con respuesta corta +
   garantía, y vuelve a la oferta. El pre-cierre del 02C aplica: la transición al checkout
   se anuncia, no sorprende.
E7 RESCATE — [Lo pienso] dispara UNA sola secuencia: recordar la garantía + la pérdida honesta
   de no actuar (el costo real de su problema, ya cuantificado en la ficha) + un cierre
   elegante que deja la puerta abierta. CERO countdown falso, cero "quedan 2 cupos". La
   recuperación del que se va de verdad es el RETARGETING de Meta con el Píxel — no trucos.
```

---

## §4 REGLAS DE COPY DEL CHAT

```
[ ] Burbuja ≤3 líneas en móvil (375px). Si necesita más, son dos burbujas.
[ ] 1 idea por burbuja. La conversación avanza en pasos, no en párrafos.
[ ] Registro de FICHA-AVATAR.md (tuteo neutro por default; el dialecto del avatar manda
    según la regla de 52).
[ ] El mecanismo NOMBRADO aparece en E1, E3 y E5 — el hilo que une promesa → diagnóstico → oferta.
[ ] Emojis: máximo 1 por burbuja, y 0 en la burbuja de precio.
[ ] Indicador "escribiendo…" + delays de 1-2.5s entre burbujas (ritmo humano, no metralleta
    ni espera artificial).
[ ] PROHIBIDO: "visto" falso, contadores inventados, urgencia sin fecha real — los mismos
    vetos anti-dark-pattern de todo el SO.
[ ] La escalera de compromiso del 02B aplica ENTERA: micro-síes crecientes, razón-porque en
    cada pedido, costo hundido visible ("ya respondiste 3 preguntas — tu resultado está listo"),
    y pre-exposición del precio en E5 antes del botón de pago. El pre-cierre del 02C en E6.
```

---

## §5 LOS DOS CAMINOS DEL ALUMNO

**(a) YA TIENE SU APP →** clonar la plataforma del embudo que provee el curso (la carpeta
`wsp-funnel`: builder visual de embudos + rutas públicas + analítica + Supabase) y adaptarla a
su app: marca propia, guion de 7 etapas, links de Hotmart. El protocolo completo — duplicar sin
tocar el original, quitar pagos internos, tematizar, verificar — vive en
`PROMPT-EMBUDO-CHAT.txt` (comando `/embudo-chat`). No se construye un simulador desde cero:
la plataforma ya existe, se adapta.

**(b) AÚN NO CREÓ SU APP →** se lo dice a la IA al arrancar ("quiero vender por embudo de
chat"). La app se construye NORMAL con el SO — la secuencia maestra queda intacta (ventas →
onboarding → paywall → login → app → servicios) — y lo que cambia es la SUPERFICIE de venta:
el embudo de chat ocupa el lugar de la landing (o convive con ella, según lo anotado en
ESTADO.md). El resto no cambia: el onboarding de producto, el paywall y Hotmart siguen igual.

---

## §6 MEDICIÓN

```
[ ] Cada TAP es un evento (etapa + botón elegido) → el funnel E1→E7 se lee en el marco del
    `60-OPERACION-DE-CONVERSION.md` (HECHO vs HIPÓTESIS, denominadores claros) con la
    taxonomía de `36-ANALITICA-Y-EVENTOS.md`.
[ ] Atribución: TODO link de checkout sale con sck=chat-[campaña]-[plan] — así el backoffice
    separa lo que vende el chat de lo que vende la landing.
[ ] Píxel de Meta + Conversions API optimizando por COMPRA — el gate del 34 aplica idéntico:
    sin píxel verificado con una compra de prueba, no se encienden ads hacia el embudo.
[ ] Benchmarks honestos: los vendors de embudos conversacionales reportan 5-15% de conversión
    en tráfico segmentado. Es un RANGO de referencia externo (BENCHMARK, no meta propia y
    nunca una promesa al dueño — regla del 60). Tu número real lo dirá tu funnel.
```

---

## §7 EL MODELO DE CONTRIBUCIÓN (contexto LATAM: qué robarle y qué NO)

En LATAM circula el modelo de "aporte voluntario" (contenido gratis + el que quiere, contribuye).
Qué dice la evidencia y qué se adopta:

```
LO QUE NO SE COPIA — el pago voluntario NO aplica a suscripción de software:
· Radiohead, "In Rainbows": el 62% de quienes descargaron pagó CERO.
· Gneezy et al. (Science, 2010): el "paga lo que quieras" solo fue rentable cuando se acopló
  a una causa (mitad para caridad). Sin causa, la mayoría paga nada o casi nada.
· Una suscripción con precio voluntario no financia servidores ni IA: no es un modelo, es
  una fuga.

LO QUE SÍ SE ROBA (y el embudo de chat lo implementa):
· Entregar valor masivo ANTES de pedir: el diagnóstico de E2-E3 y la demo de E4 dan valor
  real antes de mostrar precio. El TRIAL es la "contribución" bien hecha: pruebas primero,
  pagas después.
· Fricción CERO de entrada: tocar un botón, no llenar un formulario.
· El momento-regalo con ceremonia: si hay trial, se ENTREGA como regalo con nombre
  ("te desbloqueé tus 7 días Pro"), no como cláusula de pricing.
· La elección del monto convertida en elección de PLAN: la sensación de control que da
  "elige cuánto" se canaliza en [Anual] vs [Mensual] — el visitante elige, pero entre dos
  opciones que sostienen el negocio.
```

---

## CHECKLIST DE CIERRE DEL EMBUDO

```
[ ] Marca propia en toda la página (cero logo/nombre/trade dress de WhatsApp) — §2
[ ] Las 7 etapas presentes y cada burbuja trazable a FICHA-AVATAR.md / FICHA-MODELO.md — §3
[ ] Reglas de copy del chat verificadas burbuja por burbuja — §4
[ ] Todas las ramas probadas a 375px hasta SU checkout de Hotmart con su sck=chat-* — §6
[ ] Píxel + CAPI verificados con compra de prueba ANTES de encender ads (gate del 34)
[ ] Decisión landing vs chat (o A/B) anotada en ESTADO.md — §1
```
