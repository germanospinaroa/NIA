# OPERACION DE CONVERSION — Del trafico frio al primer cobro, sin medir ficcion

> **Cuando cargar este archivo:**
> - Antes de traer trafico a una landing, aunque la app todavia no tenga ventas.
> - Siempre que se construyan o revisen landing, onboarding, paywall o checkout externo.
> - Cuando pasan horas o dias sin ventas y hay que diagnosticar con datos, no con sensaciones.
> - Junto con `19-PAGINA-DE-VENTAS.md`, `02B-ONBOARDING-Y-PAYWALL.md`,
>   `02C-PRICING-Y-MODELO-DE-NEGOCIO.md`, `18-VENTA-HOTMART.md`,
>   `21-BACKOFFICE.md`, `36-ANALITICA-Y-EVENTOS.md` y
>   `37-FEATURE-FLAGS-Y-EXPERIMENTOS.md`.

> **Por que existe:** una app puede tener buen copy y seguir sin vender porque el dato esta mal
> definido, el checkout agrega un campo duplicado, la oferta nunca entra al viewport o una prueba
> interna se cuenta como cliente. Este modulo convierte la conversion en un sistema operativo:
> contrato de eventos, reglas de friccion, diagnostico por etapa y umbrales honestos.

---

## PRINCIPIO RECTOR: una checklist no garantiza ventas

El SO puede aumentar la probabilidad de una experiencia clara, confiable y vendible. No puede
garantizar ventas diarias. La conversion depende tambien de demanda, calidad del trafico, precio,
confianza, medios de pago y valor real del producto.

Toda afirmacion de conversion se clasifica antes de actuar:

```
HECHO       -> dato observado en produccion con definicion y denominador claros.
HIPOTESIS   -> explicacion plausible que todavia no fue probada.
BENCHMARK   -> referencia externa comparable solo en parte; nunca se presenta como meta propia.
DECISION    -> cambio elegido, con una metrica que dira si funciono.
```

Prohibido decir "este copy convertira mejor" o prometer un porcentaje antes de medirlo. Se dice:
"esta variante reduce la friccion X; mediremos Y para saber si mejora".

---

## EL FUNNEL COMERCIAL CANONICO

No colapsar pasos. Cada flecha responde una pregunta distinta:

```
landing_vista
  -> onboarding_iniciado
  -> onboarding_paso_completado (uno por paso)
  -> resultado_visto
  -> paywall_visto                 (la OFERTA entro realmente al viewport)
  -> checkout_iniciado             (salio hacia Hotmart)
  -> trial_iniciado                (confirmado por webhook, servidor)
  -> aha_alcanzado                 (primera victoria real durante el trial)
  -> primer_cobro_confirmado       (valor > 0, confirmado por webhook)
```

Eventos auxiliares utiles:

```
paywall_renderizado     -> la ruta/componente existio; NO significa que vio precio y condiciones.
paywall_plan_elegido   -> anual/mensual.
checkout_regresado     -> volvio desde Hotmart, con o sin conversion.
trial_cancelado        -> cancelo antes del primer cobro.
```

### Definiciones no negociables

| Evento | Cuando se emite | No se emite cuando |
|---|---|---|
| `landing_vista` | La landing queda util e interactiva | Prefetch, bot conocido o render fallido |
| `onboarding_iniciado` | La persona entra o completa la primera accion | Solo porque la ruta se precargo |
| `resultado_visto` | El resultado personalizado aparece usable | Empieza el loading |
| `paywall_renderizado` | El componente del paywall se monto | No aplica a una preview sin oferta |
| `paywall_visto` | Precio, renovacion y CTA entran >=35% al viewport | El paywall existe debajo del pliegue |
| `checkout_iniciado` | La navegacion a Hotmart fue iniciada | Foco en email, scroll o click que fallo |
| `trial_iniciado` | Hotmart confirma trial real | Click al checkout o boleto pendiente |
| `primer_cobro_confirmado` | Hotmart confirma cobro real de valor >0 | Inicio de trial a valor 0 |

La conversion principal nunca se registra solo desde el cliente. `trial_iniciado` y
`primer_cobro_confirmado` vienen del webhook idempotente de Hotmart (`18`).

---

## MEDIR EXPOSICION REAL, NO RENDER

El error clasico es emitir `paywall_visto` al montar el resultado, aunque el precio este 800px mas
abajo. Eso infla el denominador y hace parecer que el paywall no convence cuando, en realidad, no
fue visto.

Patron cliente recomendado:

```typescript
useEffect(() => {
  const node = offerRef.current;
  if (!node) return;

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) return;
    track('paywall_visto', { plan: selectedPlan, variant });
    observer.disconnect();
  }, { threshold: 0.35 });

  observer.observe(node);
  return () => observer.disconnect();
}, [selectedPlan, variant]);
```

Reglas:
- Emitir una sola vez por sesion y variante.
- El nodo observado contiene plan, precio/renovacion y CTA; no solo el titular.
- Si la oferta cabe completa en el primer viewport, igual se usa visibilidad real.
- `paywall_renderizado` es opcional para diagnosticar layout; jamas sustituye `paywall_visto`.

---

## SESIONES ANONIMAS, QA Y ATRIBUCION

### Sesion comercial de 30 minutos

El funnel previo al login necesita una clave anonima estable, pero no eterna. Guardar un UUID para
siempre mezcla visitas separadas de la misma persona y deforma las cohortes.

```
session_id = UUID first-party
vence       = tras 30 minutos de inactividad
renueva     = last_seen_at en cada evento
unidad      = sesiones unicas, no cantidad bruta de clicks
```

Al hacer login, asociar la sesion anonima al `user_id` sin reescribir la historia. No guardar email,
nombre, meta literal ni contenido sensible en propiedades de analitica.

### Modo QA obligatorio

Toda prueba manual o automatizada de produccion entra con `?qa=1`:

```
1. `qa=1` guarda una marca en sessionStorage.
2. Cada evento de esa sesion lleva `is_qa:true`.
3. El backoffice excluye la SESION COMPLETA si cualquiera de sus eventos es QA.
4. `qa=0` limpia la marca.
5. El panel muestra cuantas sesiones QA excluyo: la limpieza tambien se audita.
```

No basta con excluir solo los eventos marcados: si el primer evento llego antes de guardar la marca,
la sesion quedaria partida y contaminaria el denominador.

### Atribucion util

Conservar durante 30 dias una atribucion first-party con fecha de captura:

```
utm_source / utm_medium / utm_campaign / utm_content
referrer_host externo
fbclid  -> source=meta
ttclid  -> source=tiktok
gclid   -> source=google
msclkid -> source=microsoft
```

Una nueva visita con campana o referente externo real actualiza el toque comercial. Una navegacion
interna no lo sobrescribe con `directo`. Conservar first-touch y last-touch si el negocio necesita
compararlos; declarar cual usa cada dashboard.

---

## CHECKOUT EXTERNO: CERO PEAJES INVENTADOS

Un checkout externo ya agrega cambio de dominio, carga nueva, datos personales y medio de pago.
La app no debe inventar otro peaje justo antes.

### Regla del correo

```
SI el email ya existe por una razon propia del producto (cuenta autenticada o guardado solicitado):
  -> pre-rellenarlo en Hotmart y pasar user_id/anon_id por `sck`.

SI el email todavia no existe:
  -> Sigue PROHIBIDO el PEAJE de email: pedirlo como condicion para ver el precio o el CTA
     destruye intencion.
  -> dejar que Hotmart lo pida una sola vez en el checkout.
```

Lo que SI se permite y se recomienda TESTEAR (como experimento medible, `37`): email OPCIONAL en
la pantalla de RESULTADOS del quiz, enmarcado como valor ("¿Te enviamos tu plan por correo?") —
nunca bloqueante, con skip visible. Por que: en checkout web el ~97% que no compra es
irrecuperable sin email (visitante→suscripcion web promedia 2-3% — FunnelFox/ConvertFlow 2025);
Noom captura el email a 1/3 del funnel (RevenueCat 2025). El email capturado alimenta el
nurturing (`34`/`46`); la fuente principal de emails de abandonadores sigue siendo el carrito
abandonado nativo de Hotmart (`18`).

La captura de leads de baja intencion pertenece a un lead magnet o nurturing (`34`); nada de eso
debe bloquear a una persona que ya eligio precio y quiere iniciar la prueba. Consentimiento de
marketing nunca es requisito para comprar o probar.

Una pantalla de transicion solo se agrega si elimina incertidumbre sin pedir datos ni otro click
innecesario. El default es paywall transparente -> Hotmart directo.

### URL y verdad de Hotmart

Para una oferta con trial configurado y verificado:

```
https://pay.hotmart.com/PRODUCTO?off=OFERTA&showOnlyTrial=1&sck=ORIGEN_O_ANON_ID
```

- `showOnlyTrial=1`: muestra la opcion de checkout para trial, segun la documentacion oficial.
- `off`: selecciona la oferta/plan correcto.
- `sck`: atribucion o id anonimo no sensible para reconciliar el webhook.
- `email`: solo si ya se conoce legitimamente; nunca obliga a capturarlo antes.
- Construir la URL con `URL`/`URLSearchParams`, no concatenacion manual.

Antes de publicar, abrir el checkout REAL en mobile y verificar:

```
[ ] Producto y plan correctos.
[ ] Opcion "Quiero un periodo gratis" visible/seleccionable.
[ ] Precio de renovacion coincide con landing y paywall.
[ ] Moneda y medios de pago del pais objetivo.
[ ] `showOnlyTrial=1`, `off` y `sck` sobreviven en la URL.
[ ] Webhook diferencia trial de primer cobro.
```

### Copy honesto del salto

En una web app con Hotmart, el CTA no debe fingir que el trial ya fue activado dentro de la app.

```
CTA recomendado: "Ir a Hotmart y activar mi prueba"
Ayuda de 1 linea: "Completa tus datos y elige 'Quiero un periodo gratis'."
Renovacion: "El [fecha] se renueva por [monto/ciclo], salvo que canceles antes."
```

No usar frases internas o confusas como "preview gratis aqui". El usuario necesita saber que gana
y que ocurrira al tocar.

### CTA sticky en dos tiempos

Si precio/condiciones estan debajo del pliegue:

```
ANTES de ver la oferta: sticky = "Ver prueba y precios" -> hace scroll a la oferta.
DESPUES de verla:      sticky = "Activar N dias gratis" -> abre Hotmart.
```

Asi el sticky no salta sobre precio y renovacion. Si toda la oferta ya esta visible, puede abrir
Hotmart directamente.

### Regreso desde Hotmart

Guardar antes de salir `{plan, source, started_at}` en sessionStorage. Al volver:
- emitir `checkout_regresado` una vez;
- consultar el estado server-side durante 60-90s;
- si llega el webhook: celebrar y llevar a la primera victoria;
- si no llega: explicar que puede tardar y ofrecer "Ya pague y no se activa".

---

## LANDING: EL PRIMER VIEWPORT ES UN GATE, NO UNA PREFERENCIA

En `390x844` y `1440x900`, sin scroll deben verse:

```
logo/marca + titular + subtitular + CTA principal + una pista visible del producto real
```

No imponer 64-88px desktop si el titular real se rompe en demasiadas lineas. El tamano se decide
con el copy final renderizado. La cuenta de palabras es una heuristica; mandan claridad, una sola
idea y ajuste profesional.

Checklist del hero:
- Message-match con el anuncio/post que trajo el trafico.
- Promesa util y especifica; urgencia solo con razon real.
- Mecanismo o diferencia creible, no una promesa que cualquier competidor firma.
- CTA de una sola accion y ancho tactil suficiente.
- Producto real legible, no atmosfera decorativa.
- Cero overflow, texto cortado o boton en tres lineas.
- Consola limpia y LCP razonable en Android de gama media.

---

## ONBOARDING: LONGITUD GANADA, NO COPIADA

Una pregunta por pantalla significa UNA pregunta y UNA decision: nombre y meta no comparten vista.
El nombre, si se pide, es opcional o tiene una razon visible; su posicion se decide por contexto, no
por dogma.

Longitud inicial recomendada:

```
UTILIDAD DE VALOR OBVIO        -> 1-3 decisiones, maximo 5.
B2C CON PERSONALIZACION REAL   -> 4-8 preguntas utiles + reconocimientos breves.
DIAGNOSTICO PROFUNDO           -> 9-20 solo si cada respuesta cambia el resultado y los datos
                                 muestran que la completacion sigue sana.
```

No copiar las 20 o 113 pantallas de otra empresa como numero objetivo. Se empieza con el minimo que
segmenta, personaliza, activa y prepara el pago. Se expande solo con una hipotesis medible.

Cada paso debe registrar `paso`, `total_pasos` y tiempo. Si un paso pierde usuarios:
- revisar teclado/campo libre, opciones que no representan al avatar, doble pregunta y falta de skip;
- no agregar mas persuasion hasta corregir esa friccion.

---

## PAYWALL: CORTO POR DEFECTO, COMPLETO SIN SER PESADO

Responder las siete preguntas de `02B` no exige siete bloques. Consolidar informacion:

```
1 headline de resultado/perdida honesta
1 linea personal
1 visual o preview real
maximo 3 beneficios
maximo 2 planes principales
1 bloque compacto de trial/renovacion/cancelacion
1 CTA dominante + salida limpia
```

Default: short-form y escaneable. Un scroll corto es aceptable; una pagina de ventas dentro del
paywall no. No usar cards dentro de cards ni repetir lo que el onboarding ya demostro.

La primera vista mobile debe mostrar resultado y camino a la oferta. El CTA sticky no puede tapar
contenido ni enviar a Hotmart antes de que se vean precio y renovacion.

---

## MATRIZ DE DIAGNOSTICO: ARREGLAR LA ETAPA QUE SANGRA

| Caida observada | Sospechoso principal | Revisar primero | No hacer todavia |
|---|---|---|---|
| Landing -> onboarding | Trafico/message-match/hero/CTA | fuente, anuncio, primer viewport, velocidad | cambiar precio |
| Paso concreto de onboarding | Friccion de esa pregunta | doble pregunta, campo libre, teclado, opciones | rehacer el paywall |
| Resultado -> paywall visto | Layout/scroll | oferta debajo del pliegue, sticky, altura | culpar al copy del precio |
| Paywall visto -> checkout | Oferta/paywall | claridad, carga visual, plan, CTA, confianza | cambiar emails D1-D7 |
| Checkout -> trial | Puente/Hotmart | trial visible, moneda, medios de pago, campos, URL | alargar onboarding |
| Trial -> aha D1 | Producto/activacion | primera victoria, acceso, bugs, promesa cumplida | mas urgencia en landing |
| Trial -> primer cobro | Valor D1-D7 | retorno D3, uso, aviso, cancelacion y soporte | inventar descuento permanente |

Si hay clicks a checkout pero Hotmart no registra trials, primero se inspecciona el checkout real.
No se reescribe el hero para resolver una fuga que ocurre en otro dominio.

### El puente psicológico (el gemelo del diagnóstico técnico del puente)

Si la Tasa 2 (checkout → trial) muere, hay DOS puentes que revisar: el TÉCNICO (URL, `sck`,
retorno — lo ya documentado en este archivo) y el PSICOLÓGICO (02C → EL PRE-CIERRE):

```
1. PRECIO-SORPRESA     -> ¿el usuario vio el precio antes del paywall?
2. MIEDO ACTIVO        -> ¿hay timeline del trial + garantía visible?
3. RE-DECISIÓN         -> ¿el CTA anticipa qué verá en Hotmart o lo suelta a ciegas?
4. INVERSIÓN INVISIBLE -> ¿el paywall muestra lo que ya construyó?
```

El puente psicológico roto mata más Tasa 2 que el técnico.

---

## BACKOFFICE MINIMO DE CONVERSION — DESDE EL DIA 1

Antes del primer anuncio, `/admin/conversion` muestra:

```
COHORTE ACTUAL vs ANTERIOR (48h por defecto, configurable)
- landing, onboarding, cada paso, resultado, paywall visible, checkout, trial, primer cobro
- tasas entre pasos con denominador y sesiones unicas
- plan mensual/anual
- fuente/campana

SALUD DE MEDICION
- sesiones QA excluidas
- eventos rechazados/errores
- porcentaje sin atribucion
- ultima recepcion de webhook Hotmart
- diferencia entre trial y primer cobro

ALERTAS EN SIMPLE
- "X personas tocaron Hotmart y no llego ningun trial"
- "El paso [meta] pierde Y de cada Z sesiones"
- "La muestra todavia es pequena; no declares ganador de copy"
```

Las cohortes se forman por la primera `landing_vista` dentro de la ventana. No mezclar personas que
entraron antes con eventos que ocurrieron despues solo porque comparten fecha de consulta.

---

## CUANDO DECIDIR: EL RELOJ NO ES LA MUESTRA

"Pasaron 48/72 horas" no basta. Importa cuantas sesiones limpias atravesaron la superficie.

Umbral operativo para una primera auditoria de friccion grande:

```
100 sesiones nuevas de landing O 20 clicks reales a checkout, lo que ocurra primero.
```

Este umbral NO declara significancia ni un ganador de copy. Solo permite detectar fugas grandes y
priorizar. Un A/B formal usa el calculo de muestra de `37` (tasa base, MDE, alpha y potencia).

Excepciones que se corrigen sin esperar muestra:
- error funcional o de consola;
- CTA que no navega;
- precio/renovacion ocultos o incorrectos;
- trial no visible en Hotmart;
- webhook roto;
- doble pregunta o formulario duplicado;
- overflow/tap bloqueado en mobile;
- dato de QA contado como cliente.

Despues de cada cambio:
1. registrar UNA hipotesis principal;
2. publicar con timestamp/version;
3. verificar produccion con `qa=1`;
4. no cambiar la misma superficie otra vez antes del umbral, salvo bug severo;
5. comparar cohortes, no totales acumulados.

---

## PROTOCOLO DE RESCATE DE CONVERSION

```
C1. CONGELAR: no agregar features ni cambiar cinco piezas a la vez.
C2. LEER DATOS: cohortes, fuentes, pasos, checkout, trials, cobros y QA.
C3. RECORRER: mobile primero, pensando como el avatar y narrando cada duda.
C4. AISLAR: elegir la primera fuga grande de la matriz.
C5. CORREGIR: eliminar friccion y hacer el copy mas concreto, sin promesas falsas.
C6. VERIFICAR: tsc + test + build + flujo real + eventos recibidos + runtime sin errores.
C7. PUBLICAR Y MEDIR: version, hora, hipotesis, umbral y resultado.
```

Orden de prioridad cuando hay cero ventas:

```
1. Integridad de medicion y pagos.
2. Checkout -> trial.
3. Paywall visto -> checkout.
4. Onboarding paso a paso.
5. Landing/message-match.
6. Trial D1-D7.
7. Solo entonces matices de color, icono o una palabra.
```

---

## CHECKLIST DE CONVERSION ANTES DE TRAFICO

```
[ ] Funnel comercial instrumentado con definiciones de este archivo.
[ ] `paywall_visto` depende de visibilidad real, no de render.
[ ] Sesion anonima expira tras 30 min de inactividad.
[ ] `?qa=1` marca la sesion y el backoffice la excluye completa.
[ ] Atribucion UTM/referrer/click IDs persiste con fecha y no la pisa navegacion interna.
[ ] Landing probada en 390x844 y 1440x900: CTA + producto en primer viewport.
[ ] Onboarding: una pregunta por pantalla y primera victoria visible.
[ ] Paywall corto, max 3 beneficios, planes/precio/renovacion claros.
[ ] Ningun email/consentimiento bloquea el CTA de checkout si el dato no existia ya.
[ ] URL Hotmart con plan correcto + `showOnlyTrial=1` + `sck`.
[ ] Checkout real probado en mobile y pais objetivo.
[ ] Webhook distingue `trial_iniciado` de `primer_cobro_confirmado`.
[ ] Regreso/polling y reclamo de acceso probados.
[ ] Backoffice de conversion disponible desde dia 1.
```

## FUENTES DE CALIBRACION (verificar fecha al usar)

Benchmark del puente de checkout: el checkout web convierte ~45% menos que el pago in-app, pero
retiene 85-97% del ingreso vs 70-85% en stores (Adapty 2026 / RevenueCat 2025) — el trade-off
del puente, ahora con numero.

- RevenueCat, onboarding y trials en dia cero (actualizado 2026):
  https://www.revenuecat.com/blog/growth/fix-onboarding-funnels
- RevenueCat, casos de paywalls mas cortos y enfocados:
  https://www.revenuecat.com/blog/growth/paywall-redesigns-case-studies
- RevenueCat, placement y porcentaje que realmente ve el paywall:
  https://www.revenuecat.com/blog/growth/paywall-tests-grow-app-revenue
- Hotmart, parametros oficiales de checkout (`showOnlyTrial=1`):
  https://help.hotmart.com/es/article/115003588572/-como-configurar-mis-parametros-de-la-pagina-de-pago-

Las cifras de casos externos son evidencia direccional, no promesa para otra app. El dato propio
manda cuando la muestra y la instrumentacion son sanas.
