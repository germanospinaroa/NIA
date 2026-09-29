# GUÍA DE LOS PROMPTS — Los "botones" del sistema, explicados en simple

> **Para quién es esto:** para ti, el dueño de la app, aunque nunca hayas programado. El sistema
> tiene una serie de "botones" (prompts) que le dicen a la IA exactamente qué hacer en cada
> momento del negocio. Esta guía te dice cuál apretar, cuándo, y qué necesitas tener listo antes.
>
> **Cómo se aprieta un botón:**
> - **Con Claude Code:** escribe `/nombre-del-comando` (ej. `/lanzamiento`) y Enter. Puedes añadir
>   contexto después del comando (ej. `/lanzamiento quiero lanzar el 15 de agosto`).
> - **Con otra IA (Codex, etc.):** abre el archivo `PROMPT-*.txt` correspondiente en
>   `docs/sistema/`, copia TODO su contenido y pégalo como mensaje.
> Son lo mismo: dos formas de apretar el mismo botón.
>
> **Palabras que quizá veas por aquí (y qué significan):** *landing* = tu página de ventas ·
> *hero* = la parte de arriba de esa página, lo primero que se ve · *paywall* = la pantalla
> donde se elige el plan · *onboarding* = el recorrido de inicio (las preguntas de bienvenida) ·
> *checkout* = la página de pago de Hotmart · *deploy* = publicar tu app en internet ·
> *trial* = la prueba gratis. La IA te hablará en simple; estos nombres aparecen solo en los
> títulos de algunos botones.
>
> **Mapeo comando↔prompt:** `/critica-expertos` = PROMPT-CRITICA-DE-EXPERTOS.txt ·
> `/onboarding-paywall` = PROMPT-MEJORA-ONBOARDING-PAYWALL.txt (nombres distintos, mismo contenido).

> **Regla de uso sano:** si el prompt cambia diseño, copy, ventas, precios, soporte o crecimiento,
> la IA primero debe hacerte 2-4 preguntas simples cuando falte contexto. Después presenta plan,
> espera tu OK y recién ahí ejecuta. Esto evita que la IA "mejore" la app según su gusto.

> **Carpeta complementaria:** además del SO completo, puedes usar una carpeta limpia de prompts
> complementarios (todos los `PROMPT-*.txt` de esta guía + esta misma guía) para pegarlos en una
> IA sin comandos. No incluye `PROMPT-AUDITAR-SO.txt`, que es de mantenimiento interno del SO.
> Los originales canónicos viven en `docs/sistema/` — si divergen, manda el de `docs/sistema/`.

---

## EL MAPA COMPLETO — el ciclo de vida de tu app, de la idea al negocio

```
                              ┌─────────────────────────────┐
                              │  ARRANQUE (/arranque)       │  ← empiezas aquí, con o sin idea
                              └──────────────┬──────────────┘
                                             ↓
                     SESIONES DE CONSTRUCCIÓN (1 a 8, guiadas por el sistema)
                     idea → validación → diseño → construcción → testing → pulido
                     (si cierras la compu a mitad: /retomar para seguir donde quedaste)
                                             ↓
                              ┌─────────────────────────────┐
                              │  DEPLOY (/deploy)           │  ← la app sale a internet
                              └──────────────┬──────────────┘
                                             ↓
                              ┌─────────────────────────────┐
                              │  PRE-LANZAMIENTO            │  ← el "examen final" antes de
                              │  (/pre-lanzamiento)         │     cobrarle a alguien
                              └──────────────┬──────────────┘
                                             ↓
                              ┌─────────────────────────────┐
                              │  LANZAMIENTO (/lanzamiento) │  ← la semana de venta en pico
                              └──────────────┬──────────────┘
                                             ↓
                              ┌─────────────────────────────┐
                              │  ADQUISICIÓN (/adquisicion) │  ← el motor de clientes de
                              └──────────────┬──────────────┘     todos los días
                                             ↓
        ══════════════ OPERACIÓN RECURRENTE (el negocio en marcha) ══════════════
        │                                                                        │
        │   CADA SEMANA:   /contenido-semanal  (el lote de videos y carruseles) │
        │   CADA MES:      /operacion-mensual  (¿cómo va el negocio? + 3 acciones)
        │   UNA VEZ:       /soporte            (montar la atención al cliente)  │
        │                                                                        │
        ══════════════════════════════════════════════════════════════════════════

        Y LOS "BOTONES DE SITUACIÓN" (se usan cuando pasa algo, en cualquier momento):
        /retomar             volví tras una pausa           /auditoria    ¿qué tan bien está mi app?
        /diseno              se ve genérica/fea             /rescate      está estancada/rota
        /retencion           pagan pero no la USAN          /retener-ingresos  cancelan o fallan pagos
        /iteracion-feedback  llegaron opiniones de clientes /precios      toca subir el precio
        /landing             necesito la página de ventas   /backoffice   necesito ver mis números
        /onboarding-paywall  se registran pero no pagan     /critica-expertos  crítica brutal antes de invertir más
        /emails              montar TODOS los correos       /velocidad    la app se siente lenta
        /analitica           quiero medir qué pasa de verdad
        /conversion          tengo tráfico pero no trials/cobros; localizar la fuga real
```

---

## FICHA DE CADA BOTÓN (cuándo, prerrequisitos, y qué preparar antes)

### 🟢 Construcción (de la idea a la app funcionando)

**`/arranque` — PROMPT-ARRANQUE.txt**
- **Cuándo:** primer mensaje de un proyecto nuevo, tengas idea clara, idea vaga o ninguna.
- **Prerrequisitos:** la carpeta del sistema (`docs/sistema/`) y `CLAUDE.md` en el proyecto. Nada más.
- **Antes de usar:** decide cuál de las 3 puertas es la tuya: no tengo idea / tengo una idea / ya tengo una app y quiero mejorarla. La IA te preguntará.

**`/retomar` — PROMPT-RETOMAR.txt**
- **Cuándo:** cada vez que vuelves tras cerrar la sesión (al día siguiente, tras una semana, cuando sea).
- **Prerrequisitos:** que exista `ESTADO.md` (la "memoria" del proyecto — se crea sola durante el arranque).
- **Antes de usar:** nada. La IA lee dónde quedaste y te propone el siguiente paso.

**`/nueva-app` — PROMPT-NUEVA-APP.txt**
- **Cuándo:** ya sabes qué app quieres (nicho + idea) y quieres arrancar rápido con las respuestas adelantadas — sirve para CUALQUIER nicho: el sistema investiga los líderes, el público y los números de TU mercado. Si aún no tienes idea, usa `/arranque` (el FLUJO A te propone oportunidades investigadas).
- **Antes de usar:** ten claros tu nicho y tu idea en 2-3 líneas; si tienes una referencia visual (captura de una app cuyo look amas), tenla a mano — es opcional pero ayuda.

### 🎨 Calidad y diseño (subir el nivel)

**`/auditoria` — PROMPT-AUDITORIA.txt**
- **Cuándo:** quieres un diagnóstico honesto de tu app (¿qué le falta para estar al 10/10?).
- **Prerrequisitos:** una app construida (aunque sea a medias).
- **Antes de usar:** ELIGE EL MODO: `--rapido` (revisión ligera, ~1 sesión) o `--exhaustivo` (revisión profunda, más larga). Si no sabes, empieza con `--rapido`.

**`/diseno` — PROMPT-DISENO.txt**
- **Cuándo:** la app funciona pero se ve genérica, plana o "hecha con IA".
- **Prerrequisitos:** app con pantallas construidas. Si existe `FICHA-ARTE.md` (las decisiones visuales del proyecto), la IA trabaja DENTRO de ella — no redecide colores ni fuentes.
- **Antes de usar:** si tienes referencias visuales (apps cuyo look amas), tenlas a mano — ayudan mucho.

**`/rescate` — PROMPT-RESCATE.txt**
- **Cuándo:** la app está estancada, enredada o rota y no sabes por dónde agarrarla.
- **Prerrequisitos:** el código de la app en el proyecto.
- **Antes de usar:** cuéntale a la IA en 2-3 frases qué está mal y qué esperabas que hiciera.

**`/critica-expertos` — PROMPT-CRITICA-DE-EXPERTOS.txt**
- **Cuándo:** quieres que 4 expertos (copywriter, director de arte, experto en conversión, inversionista escéptico) critiquen tu app SIN PIEDAD antes de invertir más tiempo o dinero. Es solo diagnóstico: nada se toca hasta que apruebes.
- **Prerrequisitos:** app con landing, onboarding y paywall construidos (aunque sea en borrador).
- **Antes de usar:** prepárate para escuchar cosas duras — ese es el punto. Di si hay decisiones que ya son definitivas (no las criticarán para cambiarlas).

**`/velocidad` — PROMPT-VELOCIDAD.txt**
- **Cuándo:** la app se siente lenta, o quieres asegurarte de que vuela en el celular real de tu cliente (Android gama media con datos móviles, no tu computadora con wifi).
- **Prerrequisitos:** app construida que compila y corre.
- **Antes de usar:** di dónde la sientes lenta (al abrir, al navegar, cuando responde la IA). La IA mide con números ANTES y DESPUÉS — nada de "se siente más rápida".

**`/onboarding-paywall` — PROMPT-MEJORA-ONBOARDING-PAYWALL.txt**
- **Cuándo:** la gente entra, se registra... y no paga. El problema está en la bienvenida o en la pantalla de planes.
- **Prerrequisitos:** app con registro y pantalla de pago construidas.
- **Antes de usar:** si tienes números (cuántos se registran vs cuántos pagan), pégalos — afinan el diagnóstico.

**`/legal` — PROMPT-LEGAL.txt**
- **Cuándo:** antes de vender (o tras cambios grandes: nueva feature de IA, nuevo país, cambio de precios) — la IA audita y perfecciona términos, privacidad, cookies, reembolsos y el disclaimer de IA contra el 47 Y contra lo que el código hace de verdad.
- **Antes de usar:** ten a mano el nombre/razón social del responsable y un email de contacto legal — es lo único que te va a pedir.

**`/conversion` — PROMPT-CONVERSION.txt**
- **Cuándo:** ya llega tráfico o hay trials, pero no sabes si falla landing, onboarding, oferta,
  salto a Hotmart, activación del trial o primer cobro.
- **Prerrequisitos:** acceso a producción y a las fuentes de eventos/webhooks. Si faltan datos,
  el comando separa hechos de hipótesis y arregla primero la instrumentación.
- **Antes de usar:** indica periodo, cambios recientes y fuentes de tráfico si los conoces.

### 🛒 Venta (de app a producto que cobra)

**`/landing` — PROMPT-LANDING.txt**
- **Cuándo:** necesitas la página de ventas (adonde llega todo el tráfico).
- **Prerrequisitos:** app definida (promesa, precio, a quién le sirve — está en ESTADO.md). Si no existe `FICHA-AVATAR.md` (la ficha de tu cliente ideal), la IA la creará contigo PRIMERO — todo el copy sale de ahí.
- **Antes de usar:** ten decidido el precio y la garantía. Si tienes testimonios, prepáralos.

**`/embudo-chat` — PROMPT-EMBUDO-CHAT.txt**
- **Cuándo:** quieres vender con un EMBUDO DE CHAT: el anuncio de Meta lleva a una página tuya con formato de conversación (mensajes automáticos + botones, sin WhatsApp real) que cierra en el checkout de Hotmart. Adapta la plataforma que provee el curso (carpeta wsp-funnel). Es la variante de la landing para tráfico frío — la landing clásica sigue siendo el default.
- **Prerrequisitos:** app definida con venta por Hotmart y `FICHA-AVATAR.md` completa (el guion del chat sale de ahí). La carpeta de la plataforma del curso en tu computadora. Si tu app aún no existe, usa `/arranque` y di "quiero vender por embudo de chat".
- **Antes de usar:** ten a mano los links de checkout de Hotmart y, si ya lo grabaste, el video de 30-60s de la demo (si no, la IA deja el espacio marcado y te da el guion).

**`/backoffice` — PROMPT-BACKOFFICE.txt**
- **Cuándo:** quieres TU panel privado: ventas, usuarios, errores, métricas.
- **Prerrequisitos:** app con base de datos (Supabase) funcionando.
- **Antes de usar:** nada especial. La IA propone las 4 secciones estándar.

**`/emails` — PROMPT-EMAILS.txt**
- **Cuándo:** toca montar los correos del negocio: el de acceso tras la compra (el más crítico — si no llega, el cliente pagó y no puede entrar), carrito abandonado, cobros fallidos, bienvenida y los del regalo gratis.
- **Prerrequisitos:** dominio propio y cuenta de Resend (el servicio que manda los correos); venta por Hotmart configurada para probar el de acceso de punta a punta.
- **Antes de usar:** nada especial. La IA hace inventario de qué existe, prioriza (los críticos primero) y prueba que cada correo LLEGUE de verdad.

**`/deploy` — PROMPT-DEPLOY.txt**
- **Cuándo:** primera publicación, push que no despliega, cambio de repo/cuenta/dominio o recertificación.
- **Prerrequisitos:** app sin bloqueantes; acceso a GitHub, Supabase, Vercel y registrador si hay dominio.
- **Antes de usar:** inicia sesión en tus cuentas, pero NO pegues claves/tokens en el chat. La IA verifica
  GitHub→Vercel, Supabase y callbacks, te guía una acción manual por vez y prueba una segunda publicación
  automática. Una URL viva o `vercel link` por sí solos no cuentan como conexión terminada.

**`/pre-lanzamiento` — PROMPT-PRE-LANZAMIENTO.txt**
- **Cuándo:** ANTES de cobrarle a la primera persona real. Es el examen final: seguridad, pagos, emails, todo probado.
- **Prerrequisitos:** app desplegada + venta por Hotmart configurada.
- **Antes de usar:** reserva una sesión tranquila — se prueba TODO de punta a punta, incluida una compra de prueba.

**`/integridad-lanzamiento` — PROMPT-INTEGRIDAD-LANZAMIENTO.txt**
- **Cuándo:** antes del certificado /100 o después de una auditoría crítica.
- **Prerrequisitos:** repositorio y, para certificar producción, acceso al deploy/DB/pagos correctos.
- **Antes de usar:** exige los Gates 1-10 de 61 y evidencia del mismo commit desplegado.

### 📣 Crecimiento (que llegue gente y compre)

**`/lanzamiento` — PROMPT-LANZAMIENTO.txt**
- **Cuándo:** vas a abrir la venta con evento: oferta de fundadores, ventana de 5-7 días, cierre real.
- **Prerrequisitos:** pasaste `/pre-lanzamiento`; emails configurados y dominio "calentado" (archivo 46); lista de espera con permiso real (opt-in).
- **Antes de usar:** decide (o deja que la IA proponga) la oferta de fundadores y la fecha REAL de cierre. Si prometes "precio de por vida", se cumple para siempre — piénsalo.

**`/adquisicion` — PROMPT-ADQUISICION.txt**
- **Cuándo:** la app vende pero no llega tráfico. Monta el motor: afiliados, contenido, WhatsApp, y (cuando toque) anuncios.
- **Prerrequisitos:** app desplegada + Hotmart configurado + landing que pasó su checklist.
- **Antes de usar:** sé honesto con tu etapa (0 clientes / camino a 100 / escalando) y tu presupuesto. Regla dura: sin píxel verificado con una compra de prueba, NO se encienden anuncios pagos.

**`/contenido-semanal` — PROMPT-CONTENIDO-SEMANAL.txt**
- **Cuándo:** cada semana. Te entrega 3-5 guiones de video + 1 carrusel listos para grabar.
- **Prerrequisitos:** identidad y promesa definidas (ESTADO.md). Ideal: haber corrido `/adquisicion` antes.
- **Antes de usar:** pega cómo le fue a lo de la semana pasada (views, guardados, ventas) — la IA aprende de eso. Primera vez: se usa sin datos, sin problema.

### 🔁 Operación (el negocio en marcha)

**`/operacion-mensual` — PROMPT-OPERACION-MENSUAL.txt**
- **Cuándo:** una vez al mes. Responde "¿cómo va mi negocio?" con números reales y te da LAS 3 acciones del mes.
- **Prerrequisitos:** app vendiendo + backoffice o eventos midiendo (aunque sea parcial).
- **Antes de usar:** nada — solo di si algo te preocupa en particular. Cada acción que te proponga viene con el botón de esta guía que la ejecuta.

**`/analitica` — PROMPT-ANALITICA.txt**
- **Cuándo:** no sabes qué está pasando con tus usuarios: ¿dónde se caen antes de pagar? ¿de qué canal vienen los que compran? ¿vuelven o desaparecen? Instrumenta la medición para responder con datos, no con sensaciones.
- **Prerrequisitos:** app funcionando con usuarios (o a punto de lanzar — mejor medir desde el día 1).
- **Antes de usar:** di qué pregunta te quita el sueño (por qué no compran, por qué no vuelven, de dónde vienen). Regla: solo se mide lo que responde una decisión — nada de medir por medir.

**`/soporte` — PROMPT-SOPORTE.txt**
- **Cuándo:** al empezar a vender (idealmente antes del primer cliente). Monta email + WhatsApp de atención, plantillas de respuesta y tiempos de respuesta realistas.
- **Prerrequisitos:** venta por Hotmart configurada (las plantillas de reembolso/cancelación dependen de eso).
- **Antes de usar:** decide qué número de WhatsApp usarás para el negocio.

**`/iteracion-feedback` — PROMPT-ITERACION-FEEDBACK.txt**
- **Cuándo:** llegaron opiniones de clientes reales (quejas, pedidos, ideas) y no sabes qué atender primero.
- **Prerrequisitos:** clientes reales usando la app.
- **Antes de usar:** junta el feedback crudo (mensajes, reseñas, respuestas de la encuesta de cancelación) y pégalo. Regla: máximo 3 cambios por ciclo — la IA te defenderá de querer hacerlo todo.

**`/retencion` — PROMPT-RETENCION.txt**
- **Cuándo:** la gente paga pero NO USA la app (y quien no usa, tarde o temprano cancela). Monta hábito: rachas, logros, recordatorios.
- **Prerrequisitos:** app con usuarios activos y su acción principal clara.
- **Antes de usar:** nada. OJO: si el problema es que CANCELAN o fallan los pagos, el botón es el siguiente, no este.

**`/retener-ingresos` — PROMPT-RETENER-INGRESOS.txt**
- **Cuándo:** la gente cancela, o los pagos fallan (tarjetas vencidas), o nadie renueva el plan anual. Protege el dinero que ya entró.
- **Prerrequisitos:** app vendiendo por Hotmart con el aviso automático de pagos (webhook) funcionando.
- **Antes de usar:** si sabes por qué cancelan (aunque sea de oído), cuéntalo. Regla de la pareja: **`/retencion` = que VUELVAN a usarla · `/retener-ingresos` = que no cancelen ni fallen los pagos.**

**`/precios` — PROMPT-PRECIOS.txt**
- **Cuándo:** toca cambiar el precio (típicamente subirlo al cerrar la etapa de fundadores).
- **Prerrequisitos:** app vendiendo; saber qué se les prometió a los fundadores (está en ESTADO.md).
- **Antes de usar:** ten el precio propuesto (o deja que la IA lo calcule con tus números). Nada se cambia hasta que apruebes el plan: el cambio toca Hotmart + landing + pantalla de planes + kit de afiliados EL MISMO DÍA, y los fundadores conservan su precio.

### 🔧 Interno (no es para operar tu app)

**`/auditar-so` — PROMPT-AUDITAR-SO.txt**: revisa la coherencia del PROPIO sistema de documentos (mantenimiento del SO). Para auditar TU APP, el botón es `/auditoria`.

---

## "SI TE PASA ESTO → APRIETA ESTE BOTÓN" (las 23 situaciones típicas)

| # | Te pasa esto... | Botón |
|---|---|---|
| 1 | "Quiero empezar una app (con o sin idea)" | `/arranque` |
| 2 | "Volví después de días/semanas y no sé dónde quedé" | `/retomar` |
| 3 | "Mi app funciona pero se ve genérica, como hecha con IA" | `/diseno` |
| 4 | "No sé qué tan bien o mal está mi app" | `/auditoria --rapido` |
| 5 | "Mi app está enredada/estancada, nada avanza" | `/rescate` |
| 6 | "La gente se registra pero casi nadie paga" | `/onboarding-paywall` |
| 6B | "Tengo tráfico pero no sé dónde se rompe la venta" | `/conversion` |
| 7 | "Ya quiero salir a internet con mi dominio" | `/deploy` |
| 8 | "¿Estoy listo para cobrarle a alguien de verdad?" | `/pre-lanzamiento` |
| 9 | "Quiero abrir la venta con todo (oferta de fundadores)" | `/lanzamiento` |
| 10 | "La app vende pero no llega gente" | `/adquisicion` |
| 11 | "No sé qué publicar esta semana en TikTok/Instagram" | `/contenido-semanal` |
| 12 | "¿Cómo va mi negocio? ¿En qué me enfoco este mes?" | `/operacion-mensual` |
| 13 | "Me llueven mensajes de clientes y no doy abasto" | `/soporte` (montarlo) — y `/iteracion-feedback` (procesar lo que piden) |
| 14 | "La gente paga pero no entra nunca a la app" | `/retencion` |
| 15 | "Me están cancelando / fallan los cobros / nadie renueva" | `/retener-ingresos` |
| +1 | "Quiero subir el precio sin traicionar a los fundadores" | `/precios` |
| +2 | "Quiero que expertos critiquen mi app sin piedad antes de invertir más" | `/critica-expertos` |
| +3 | "Me faltan los emails del negocio: acceso, carrito, cobros fallidos" | `/emails` |
| +4 | "La app se siente lenta / quiero que vuele en celulares" | `/velocidad` |
| +5 | "No sé qué está pasando con mis usuarios / quiero medir" | `/analitica` |
| +6 | "Quiero vender con una página que conversa (embudo de chat) en vez de la landing" | `/embudo-chat` |

> **¿Y si mi situación no está en la tabla?** Descríbela con tus palabras en el chat. La IA tiene
> la tabla de ruteo de `CLAUDE.md` y te dirá qué botón (o qué archivo del sistema) corresponde.
