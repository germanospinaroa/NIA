# UNIT ECONOMICS — Economía Unitaria y Modelo Financiero (¿la app GANA dinero?)

> **Cuándo cargar este archivo:**
> - En la fase de validación (junto con `02-VALIDACION.md`, antes de fijar el precio) — el GATE de este archivo es PREVIO a construir
> - Junto con `30-INTEGRACION-IA.md` (costo de IA por usuario) y `21-BACKOFFICE.md` (LTV/CAC con datos reales) y `34-ADQUISICION-Y-TRAFICO.md` (CAC por canal)
> - Siempre que se decida o se ajuste el precio de la suscripción
>
> **Por qué existe:** el SO ya calcula el costo de IA por generación (`30`) y mide LTV/CAC con datos reales una vez que hay ventas (`21`). Lo que faltaba es el eslabón ANTES de vender: el **modelo unitario** que dice si, al precio que vas a cobrar, cada usuario deja margen o te EMPOBRECE. Una app puede convertir de maravilla y aun así perder dinero por usuario — si el COGS (costo de servir a un cliente) se come el precio, vender MÁS es perder MÁS rápido. Este archivo obliga a conocer el costo por usuario y el margen ANTES de fijar el precio, y añade un gate en validación.

---

## EL PRINCIPIO: convertir bien ≠ ganar dinero

```
Conversión alta + margen negativo = quiebra eficiente.
Cada cliente Pro que pagó $15 pero te cuesta $18 servir te hace perder $3.
Mientras más vendes, más rápido se vacía la caja. Y sin un modelo unitario, no lo ves
hasta que la factura de IA + Hotmart + infra llega a fin de mes.
```

La pregunta que este archivo responde ANTES de fijar precio: **¿cuánto me cuesta servir a UN usuario Pro durante un mes, y qué margen me deja el precio?** Si no sabes el COGS por usuario, el precio es una apuesta.

> **De dónde sale el precio que modelas aquí:** el "trabajo a contratar" (JTBD) y el rango de disposición a pagar salen del descubrimiento (`44-DESCUBRIMIENTO-DE-USUARIO.md`) y se confirman en el gate (`02`). El value-based pricing se ancla a ese valor, no al costo; este modelo unitario solo verifica que ese precio deje margen.

---

## COGS POR USUARIO PRO — los cuatro costos que se comen el precio

COGS = *Cost of Goods Sold*: lo que cuesta SERVIR a un cliente (no los costos fijos como tu sueldo). Para una web app de IA vendida por Hotmart, son cuatro:

```
1. IA            → llamadas a la API (Claude/LLM, imagen, audio). El más variable. Viene de 30.
2. INFRA         → Supabase (DB, storage, egress) + Vercel (cómputo, egress). Viene de 13.
3. EMAIL         → Resend (transaccionales: bienvenida, dunning, recordatorios). Viene de 18.
4. PAGO          → DOS costos distintos que casi todos confunden (ver recuadro abajo):
   4a. TARIFA DE PROCESAMIENTO de Hotmart (~9-10% + tarifa fija) — la cobra la plataforma SIEMPRE.
   4b. COMISIÓN DE AFILIADO (0% si es venta directa; 40-60%, típico 50%, si la venta vino por
       afiliado — ver 34). Los afiliados son el canal #1 del SO, así que este costo NO es opcional.
   + impuestos/retenciones LATAM. El bloque que más se olvida.
```

> **NO confundir dos cosas distintas que ambas salen del precio:**
> - **(a) Tarifa de procesamiento de Hotmart** (~9-10% + tarifa fija): es lo que cobra la PLATAFORMA por procesar el pago. Aplica a TODA venta, directa o por afiliado. Verificar la tasa real en tu panel (varía por plan/país).
> - **(b) Comisión de afiliado** (40-60%, típico 50%, según `34-ADQUISICION-Y-TRAFICO.md`): es lo que se lleva el AFILIADO que trajo la venta. Es **0% en venta directa** y puede ser **recurrente** (cada cobro, no solo el primero). Como los afiliados son el canal #1 del SO, hay que modelar el escenario CON afiliado, no solo el directo.
>
> Encima, en LATAM hay **retenciones e impuestos** (IVA/ISS, retención de renta según el país y si facturas como persona o empresa). Lo que llega a tu cuenta NO es el precio de catálogo. Modelar con el NETO, no con el bruto.
>
> **Por qué importa para la conclusión:** si modelas solo la tarifa de procesamiento (~10%) sales con un margen "feliz" del ~76%. Pero si la venta vino por un afiliado al 50%, ese 76% es FALSO: el margen real puede ser **≤0**. Por eso abajo se muestran los DOS escenarios lado a lado.

### Tabla de ejemplo — DOS escenarios (Pro a $15/mes — números ilustrativos, ajustar a tus datos)

**Escenario A — VENTA DIRECTA (sin afiliado):**
```
| Concepto                                  | Costo/mes/usuario | Nota                                        |
|-------------------------------------------|-------------------|---------------------------------------------|
| Precio de catálogo                        | $15.00            | lo que ve el cliente                        |
| (−) Tarifa de procesamiento Hotmart       | −$1.80            | 10% (−$1.50) + tarifa fija (−$0.30)         |
| (−) Comisión de afiliado                  |  $0.00            | venta directa: no hay afiliado              |
| (−) Impuestos/retenciones LATAM           | −$1.50            | IVA/ISS + retención renta (varía por país)  |
| = INGRESO NETO                            |  $11.70           | lo que REALMENTE llega                       |
|-------------------------------------------|-------------------|---------------------------------------------|
| (−) IA (regla 30: <20% del PRECIO)        | −$2.40            | ver economía por modalidad en 30            |
| (−) Infra (Supabase+Vercel)               | −$0.40            | supuesto app de TEXTO; sube con imagen/audio|
| (−) Email (Resend)                        | −$0.05            | transaccionales; plan gratis cubre el inicio|
| = COGS variable                           | −$2.85            |                                              |
|-------------------------------------------|-------------------|---------------------------------------------|
| MARGEN BRUTO por usuario                  |  $8.85            | = ingreso neto − COGS                        |
| MARGEN BRUTO %                            |  ~76%             | sobre ingreso neto ($8.85 / $11.70)         |
```

**Escenario B — VENTA POR AFILIADO (comisión 50% del precio):**
```
| Concepto                                  | Costo/mes/usuario | Nota                                        |
|-------------------------------------------|-------------------|---------------------------------------------|
| Precio de catálogo                        | $15.00            | lo que ve el cliente                        |
| (−) Tarifa de procesamiento Hotmart       | −$1.80            | 10% (−$1.50) + tarifa fija (−$0.30)         |
| (−) Comisión de afiliado (50%)            | −$7.50            | 50% del precio — canal #1 del SO (ver 34)   |
| (−) Impuestos/retenciones LATAM           | −$1.50            | IVA/ISS + retención renta (varía por país)  |
| = INGRESO NETO                            |  $4.20            | lo que REALMENTE llega tras pagar al afiliado|
|-------------------------------------------|-------------------|---------------------------------------------|
| (−) IA (regla 30: <20% del PRECIO)        | −$2.40            | ver economía por modalidad en 30            |
| (−) Infra (Supabase+Vercel)               | −$0.40            | supuesto app de TEXTO; sube con imagen/audio|
| (−) Email (Resend)                        | −$0.05            | transaccionales; plan gratis cubre el inicio|
| = COGS variable                           | −$2.85            |                                              |
|-------------------------------------------|-------------------|---------------------------------------------|
| MARGEN BRUTO por usuario                  |  $1.35            | = ingreso neto − COGS                        |
| MARGEN BRUTO %                            |  ~32%             | sobre ingreso neto ($1.35 / $4.20)          |
```

> **La conclusión CAMBIA según el canal — esto rompe el gate de viabilidad si lo ignoras:**
> - Venta directa: margen $8.85/usuario (~76%). Sano.
> - Venta por afiliado al 50%: margen cae a **$1.35/usuario (~32%)** — y si la comisión fuese recurrente y el precio algo más bajo o el COGS de IA algo más alto, se vuelve **negativo**. Un afiliado al 50% se lleva la mitad del precio bruto, que es MÁS que todo tu COGS variable junto.
> - Si la comisión es recurrente (default sugerido en `34`), esa caída aplica TODOS los meses, no solo el primero → no es CAC, es una baja permanente del margen (ver sección LTV/CAC).
>
> **Por eso no basta con un solo número de margen.** Modela tu mezcla real de ventas (¿qué % entra por afiliado vs directo?) y verifica el gate con el escenario PEOR, no con el feliz.

> **Dos definiciones de margen — no confundirlas:** el margen "sano" de SaaS (>70-80%) se mide sobre el INGRESO NETO (descontados procesamiento, comisión de afiliado si aplica e impuestos), contando IA+infra+email. Lo importante es que el número final por usuario sea claramente positivo en TU mezcla real de canales y que el % deje espacio para CAC y costos fijos.

> **La "regla de 30" (IA < 20%) es sobre el PRECIO de catálogo, no sobre el neto.** En el ejemplo, $2.40 de IA sobre $15 de catálogo = 16% → cumple la regla. **Ojo:** sobre el INGRESO NETO ese mismo costo pesa MÁS — en venta directa ($11.70 neto) la IA es ~20.5%, y en venta por afiliado ($4.20 neto) es ~57%. Como el margen se mide sobre el NETO, no te confíes con el 16% de catálogo: verifica el peso real de la IA sobre lo que de verdad te llega, sobre todo en el escenario con afiliado.

> **Supuesto del costo de infra:** los $0.40/usuario asumen una app de **TEXTO** (poca transferencia de datos). Con imagen/audio el egress de Supabase/Vercel sube y este número puede ser varias veces mayor (rango ~$0.40–$2+ según peso de medios — ver `13-INFRA-ESCALABILIDAD.md`). Trátalo como supuesto a verificar, no como dato fijo.

---

## MARGEN BRUTO OBJETIVO — la salud del producto

```
Margen bruto % = (ingreso neto − COGS variable) / ingreso neto

SaaS sano: >70-80%. Por debajo de ~60%, revisar: o el COGS de IA está alto
(aplicar las palancas de 30: modelo más barato, cachear, max_tokens, fair-use)
o el precio está bajo para lo que cuesta servir.
```

Por qué importa el 70-80%: ese margen es lo que queda para pagar el CAC (adquisición) y los costos fijos. Con margen del 30%, cada cliente deja tan poco que el CAC nunca se recupera y el negocio no escala. La regla de IA del archivo `30` (**costo de IA < 20% del precio**) existe justamente para proteger este margen.

---

## BREAK-EVEN — cuántos clientes Pro para no perder dinero

El break-even es el punto donde los ingresos cubren los costos FIJOS (los que pagas exista o no cada usuario: dominios, herramientas, tu tiempo si te lo pagas, suscripciones base de infra).

```
Clientes Pro para break-even = Costos fijos mensuales / Margen bruto por usuario

Ejemplo: costos fijos $300/mes (herramientas, dominio, base de Supabase/Vercel)
         margen bruto por usuario = $8.85 (venta DIRECTA)
         → 300 / 8.85 ≈ 34 clientes Pro para cubrir costos.
         Del cliente 35 en adelante, cada uno deja $8.85 de ganancia (antes de CAC).

OJO con el canal: si la venta viene por afiliado al 50%, el margen cae a $1.35/usuario
         → 300 / 1.35 ≈ 222 clientes Pro para el mismo break-even (¡6,5× más!).
         Usa el margen del canal que de verdad domine tu mezcla, no el del escenario feliz.
```

> **El break-even depende del margen, no del precio bruto.** Subir el precio sin cuidar el COGS no baja el break-even tanto como crees; bajar el COGS de IA (archivo 30) sí lo mueve fuerte. Un margen por usuario más alto = menos clientes necesarios para dejar de perder dinero.

---

## LTV / CAC / PAYBACK — ¿puedo invertir en crecer?

> Estas tres métricas son las mismas que `21-BACKOFFICE.md` calcula con datos reales una vez que vendes. Aquí se MODELAN antes, con estimados, para saber si el negocio puede pagar su propia adquisición. La conexión: el modelo unitario fija el techo de cuánto puedes gastar para conseguir un cliente.

```
LTV (Lifetime Value) — cuánto deja un cliente en toda su vida:
  LTV = ARPU × margen bruto × (1 / churn mensual)
  donde ARPU = ingreso neto promedio por usuario/mes (base más estricta; ver nota de base abajo).
  Ej (venta directa): $11.70 × 76% × (1 / 0.15) ≈ $11.70 × 0.76 × 6.7 ≈ $59 de LTV
      (con 15% de churn mensual → vida media ~6.7 meses).
  OJO: con churn 7% (optimista) el mismo cálculo da ~$127 (vida ~14 meses) — no asumas eso de
  entrada en B2C LATAM (ver nota de churn). Y si la venta vino por AFILIADO al 50%, el ARPU y el
  margen caen (tabla escenario B): $4.20 × 32% × 6.7 ≈ $9 de LTV. El canal cambia el LTV de raíz.

  DESCUENTOS QUE EL LTV BÁSICO OLVIDA (réstalos para no inflar el número):
   - Reembolsos / chargebacks: resta la tasa real del LTV — esas ventas se devuelven. Referencia:
     2-6% (RevenueCat 2025: mediana 2-5%; Educación/Health van al techo; la garantía de 7 días
     de Hotmart puede subirlo).
   - COGS del trial gratuito: durante el trial (ej. 7 días) el usuario CONSUME IA sin pagar. Ese
     costo de IA "regalado" es un costo de adquisición efectivo → súmalo al CAC, no lo ignores.

CAC (Customer Acquisition Cost) — cuánto cuesta conseguir un cliente:
  CAC = gasto de adquisición del periodo / clientes nuevos del periodo.
  Incluir: ads, contenido, el COGS de IA del trial gratuito (IA sin ingreso), Y la comisión de
  primer pago del afiliado de Hotmart (ver abajo). La comisión RECURRENTE va al margen, no al CAC.

REGLA LTV:CAC ≥ 3:1
  <1:1  → cada venta te empobrece. Parar y arreglar margen o canal.
  ~3:1  → sano. Puedes invertir en ese canal.
  >5:1  → estás dejando crecimiento sobre la mesa: invertir MÁS.

PAYBACK (meses para recuperar el CAC) — clave en suscripción:
  Payback = CAC / margen bruto por usuario ($/mes)
  (es decir, CAC dividido entre lo que cada usuario deja LIMPIO al mes — $8.85 en venta directa,
   $1.35 por afiliado al 50%; usa el margen del canal que corresponda, no el ingreso bruto).
  Objetivo: < 12 meses (idealmente < 6) (umbral único del SO — 21 y 34 remiten aquí).
  Más largo = necesitas mucha caja para escalar.
```

> **QUÉ MUEVE MÁS EL LTV (dónde invertir el esfuerzo — BENCHMARK):** por cada 1% de mejora,
> monetización/pricing mueve el resultado +12.7%, retención +6.71% y adquisición +3.32%
> (Price Intelligently, 512 empresas SaaS — estudio clásico re-validado). Palanca #1 en apps de
> consumo: la MEZCLA hacia el plan anual bien precificado — los mensuales retienen ~10% al año 2,
> los anuales renuevan 23-40% (mediana por categoría) y el cuartil superior 60-75% (RevenueCat
> 2025/2026). Palanca #2: el churn involuntario (20-40% del churn total — se recupera sin
> convencer a nadie: `58-RETENCION-DE-INGRESOS.md`).

> **Nota de churn — el 7% es OPTIMISTA para B2C LATAM:** un churn mensual del 7% (vida ~14 meses) es agresivo para suscripción B2C en LATAM. El rango realista es **10-20% mensual**; `21-BACKOFFICE.md` usa ~22% como ejemplo (vida ~4.5 meses). Modela con un churn realista (este doc usa 15% en los ejemplos) y trata el 7% como el mejor caso, no como base. Un churn más alto reduce el LTV proporcionalmente → revisa el LTV:CAC con el churn que de verdad esperas, no con el que te gustaría. **Y el churn NO es plano:** la PRIMERA renovación es la peor (mensual: 39-58% no renueva la 1ª según categoría; anual: 60-77% no renueva — BENCHMARK, RevenueCat 2026) y después la curva se aplana. Modela el LTV con curva, no con churn constante, o sobreestimarás 20-40%.

> **Nota de base — al comparar con `21-BACKOFFICE.md`, iguala la base:** este doc usa el INGRESO NETO como ARPU y divide el payback por el MARGEN bruto por usuario (medida más estricta). El `21`, por simplicidad operativa, usa el COBRO mensual (ingreso, no margen) tanto como ARPU como divisor del payback (ej. CAC $30 / $19.99 ≈ 1.5 meses). Ninguna está mal, pero NO mezcles: si comparas el payback de aquí con el de `21`, asegúrate de usar la misma base (ambos sobre margen, o ambos sobre ingreso), o los números no cuadrarán.

### El CAC de afiliados Hotmart (la particularidad LATAM)
```
Los afiliados de Hotmart cobran una COMISIÓN, a menudo RECURRENTE (un % de cada cobro,
no solo del primero). Eso cambia el cálculo:
  - Comisión de primer pago → entra directo en el CAC (costo de adquirir).
  - Comisión RECURRENTE → reduce el ARPU/margen de TODA la vida del cliente, no solo el mes 1.
    Modelarla como una baja del margen bruto mientras el cliente siga activo, NO solo como CAC.
Ej: si el afiliado se lleva 50% recurrente, tu margen por usuario se parte a la mitad cada mes.
    Un canal de afiliados "barato de adquirir" puede ser caro de SERVIR si la comisión es recurrente.
```

> **DEFAULT RECOMENDADO de comisión: 30-40% recurrente (o 50% SOLO de la primera venta).** El
> escenario B lo demuestra: con 50% RECURRENTE el margen cae a ~$1.35/usuario y **el gate de margen
> casi nunca pasa** — el afiliado se lleva más que todo tu COGS junto, todos los meses. Con 30-40%
> recurrente el modelo respira; con "50% solo primera venta" la comisión es CAC puro (un costo de
> adquisición de una vez) y el margen recurrente queda intacto. Ofrecer 50% recurrente SOLO si tu
> precio y COGS lo aguantan con el gate pasado en ese escenario, no por costumbre del marketplace.
> ⚠️ **Nota de sincronía:** `34-ADQUISICION-Y-TRAFICO.md` (programa de afiliados) debe usar ESTE
> MISMO default (30-40%, o 50% primera venta). Si al leer 34 ves otro número como recomendación,
> hay que alinearlos — el escenario B de este archivo es la razón matemática del default.

> **Conexión con `34-ADQUISICION-Y-TRAFICO.md` y `21-BACKOFFICE.md`:** el `34` define los canales (afiliados, ads, contenido); este archivo dice cuánto puedes pagar por canal sin romper el LTV:CAC; el `21` mide el CAC y LTV reales por canal una vez que hay datos. El modelo unitario es la brújula; el backoffice, el GPS.

---

## GATE EN VALIDACIÓN — no fijar el precio sin margen positivo

> **Regla nueva, vinculante (enlaza con el Paso 3 de `02-VALIDACION.md`):** el precio NO se fija — y por tanto no se construye sobre ese precio — hasta que exista un modelo unitario que dé **margen bruto positivo y sano**. El Gate de Demanda de `02` valida que alguien PAGARÍA; este gate valida que cobrando eso GANAS dinero. Ambos son previos a construir.
>
> **Este gate ES el SUELO 1 (de costo) de LOS 3 SUELOS DEL PRECIO (`02C`):** allá vive la regla
> de decisión completa — incluida la FÓRMULA DEL CUPO por plan (precio × 20% ÷ costo por
> resultado) que convierte este margen en límites de uso concretos. El suelo 2 (mercado) es
> FICHA-MERCADO §1; el suelo 3 (canal) se chequea en `34` ANTES de la primera campaña pagada
> (el CAC máximo tolerable de abajo vs el CPA real del canal).

```
GATE DE VIABILIDAD UNITARIA — [Nombre de la App]   (rellenar los DOS escenarios)

Precio Pro propuesto (del WTP del Gate de Demanda, 02):  $______

                                          VENTA DIRECTA   |  VENTA POR AFILIADO (___%)
(−) Tarifa de procesamiento Hotmart:        $______       |    $______
(−) Comisión de afiliado:                    $0.00        |    $______
(−) Impuestos/retenciones LATAM:            $______       |    $______
= Ingreso neto:                             $______       |    $______
(−) COGS variable (IA + infra + email):     $______       |    $______
Margen bruto por usuario ($ y %):           $___ /__%     |    $___ /__%
LTV estimado (con churn realista):          $______       |    $______
CAC máximo tolerable (LTV / 3):             $______       |    $______
Payback (CAC / margen por usuario):         ___ meses     |    ___ meses

Break-even (costos fijos / margen del canal dominante): ____ clientes Pro

Resultado (debe pasar en TU mezcla real de canales, no solo en el feliz):
  [ PASA → margen positivo y sano y LTV:CAC viable EN AMBOS escenarios relevantes → fijar precio ]
  [ NO PASA → si por afiliado el margen es bajo/negativo → bajar % de comisión (o solo 1ª venta,
              ver 34) / subir precio / bajar COGS de IA vía 30 / cambiar canal. NO construir
              sobre un precio que pierde en tu canal principal (los afiliados son el #1 del SO). ]
```

**Si NO pasa, las palancas (en orden):**
1. Bajar el COGS de IA — las 5 palancas de `30-INTEGRACION-IA.md` (modelo más barato, max_tokens, caché, fair-use).
2. Subir el precio — anclado al WTP medido (`02`), las apps de precio alto convierten igual o mejor (`02C`).
3. Cambiar/mejorar el canal de adquisición si el CAC es el problema (`34`).
4. Reducir costos fijos (infra más barata al inicio, plan gratis de Resend/Supabase).

---

## PLANTILLA SIMPLE (la rellena el AGENTE; el dueño no técnico solo aporta 2-3 datos)

> **Importante para el usuario no técnico:** el agente rellena la plantilla, pero no inventa cifras.
> Obtiene tarifas/precios actuales de fuentes oficiales y registra URL + fecha; usa datos reales del
> panel/ledger cuando existen. Todo supuesto se etiqueta como ESTIMACIÓN y se prueba en sensibilidad.
> Nunca llama "limpio" o "real" a un escenario no conciliado. Al dueño solo se le pregunta lo que
> solo él decide:
> - ¿Qué precio quieres cobrar? (o deja que el agente proponga uno anclado al valor).
> - ¿Vas a usar afiliados? ¿A qué comisión? (decide si modelar el escenario B).
> - ¿Cobro mensual, anual o ambos?
>
> El resto lo estima el agente y lo deja anotado en ESTADO.md. Si un costo es incierto, se marca como supuesto y se avisa (regla de alertas). Nunca entregar la plantilla vacía esperando que el dueño la complete.

```
| Línea                                        | Directo | Por afiliado |
|----------------------------------------------|---------|--------------|
| Precio Pro (catálogo)                        | $       | $            |
| − Tarifa de procesamiento Hotmart (% real)   | $       | $            |
| − Comisión de afiliado (0% directo; 40-60%)  |  $0.00  | $            |
| − Impuestos/retenciones (tu país)            | $       | $            |
| = INGRESO NETO por usuario/mes               | $       | $            |
|----------------------------------------------|---------|--------------|
| − IA por usuario/mes (de 30)                 | $       | $            |
| − Infra por usuario/mes (de 13)              | $       | $            |
| − Email por usuario/mes (Resend)             | $       | $            |
| = COGS variable                              | $       | $            |
|----------------------------------------------|---------|--------------|
| MARGEN BRUTO por usuario ($ y %)             | $  /  % | $  /  %      |
|----------------------------------------------|---------|--------------|
| Costos fijos mensuales                       | $       |              |
| BREAK-EVEN (clientes Pro, canal dominante)   |         |              |
| Churn mensual estimado (% — realista 10-20%) |         |              |
| Tasa de reembolso/chargeback (− del LTV)     |  %      |  %           |
| COGS de IA del trial gratis (+ al CAC)       | $       | $            |
| LTV = ingreso neto × margen / churn          | $       | $            |
| CAC máximo tolerable (LTV / 3)               | $       | $            |
| Payback = CAC / margen por usuario (meses)   |         |              |
| ¿Comisión de afiliado recurrente?            | sí/no — % (recurrente baja el margen TODOS los meses) |
```

---

## CÓMO SE CONECTA

```
02-VALIDACION.md       → el GATE unitario es previo a fijar precio; el WTP del Gate de Demanda
                         alimenta el precio que se modela aquí. Margen positivo antes de construir.
02C-PRICING-Y-MODELO.  → pricing del paywall (anual como $/mes); precio alto convierte igual → más margen.
                         Si usa CRÉDITOS por plan (IA cara por acción), cada tier se valida aquí contra el COGS.
30-INTEGRACION-IA.md   → el COGS de IA y las 5 palancas para bajarlo (la regla <20% del precio).
13-INFRA-ESCALABILIDAD → el costo de infra por usuario (Supabase/Vercel egress) y alertas de costo.
18-VENTA-HOTMART.md    → comisión de Hotmart + el flujo de cobro; el ingreso NETO sale de aquí.
34-ADQUISICION-Y-TRAFICO.md      → los canales y su CAC; de aquí sale la comisión de afiliado (40-60%,
                         típico 50%, a veces recurrente) que el escenario B modela; afiliados = canal #1.
21-BACKOFFICE.md       → mide LTV/CAC/payback REALES con datos; este archivo los MODELA antes de vender.
39-INTERNACIONALIZ.    → el margen se calcula POR moneda si vendes en BRL/MXN/etc. (un modelo por mercado).
```

---

## CHECKLIST DE UNIT ECONOMICS

```
[ ] Separadas las DOS líneas de pago: tarifa de procesamiento Hotmart (~9-10%+fija) Y comisión de afiliado (0% directo; 40-60% por afiliado)
[ ] COGS por usuario Pro calculado: IA + infra + email + procesamiento Hotmart + impuestos LATAM
[ ] DOS escenarios modelados lado a lado: venta directa vs venta por afiliado (50%)
[ ] Ingreso NETO (no bruto) usado en todos los cálculos
[ ] Margen bruto por usuario positivo y sano (>~70-80%) EN la mezcla real de canales (no solo directo)
[ ] Peso de la IA verificado sobre el NETO (la regla <20% es sobre el PRECIO; sobre el neto pesa más)
[ ] Infra tratada como supuesto (TEXTO ~$0.40; sube con imagen/audio — ver 13)
[ ] Break-even calculado con el margen del CANAL dominante (afiliado dispara el número)
[ ] Churn realista (10-20% B2C LATAM; alineado con 21 ~22%; 7% es optimista)
[ ] LTV estimado (ARPU × margen × 1/churn) y descontados reembolsos/chargebacks
[ ] COGS del trial gratuito (IA sin ingreso) contado como CAC efectivo
[ ] CAC máximo tolerable derivado (LTV:CAC ≥ 3:1)
[ ] Payback = CAC / margen por usuario, < 12 meses (idealmente < 6); base igualada al comparar con 21
[ ] Comisión de afiliado Hotmart modelada (recurrente = baja de margen, no solo CAC)
[ ] Comisión ofrecida = default 30-40% (o 50% solo 1ª venta); 50% recurrente solo si el gate pasa en el escenario B — mismo número que 34
[ ] GATE pasado: NO se fijó el precio sin un modelo que dé margen positivo en el canal principal
[ ] Plantilla rellenada con números reales del dueño (no solo el ejemplo)
[ ] Si multi-moneda: un modelo unitario por mercado (ver 39)
[ ] Precio de proveedor/Hotmart/FX con fuente oficial y fecha; supuestos rotulados
[ ] Escenarios mediana, p95 y heavy user incluyen trial, retries, fallbacks y evals
[ ] Plan anual usa ingreso mensual efectivo neto, no precio mensual de lista
[ ] ECONOMICS-CERTIFICATION.md (definido en 61) completado por plan/cohorte/canal; "ilimitado" solo si el estrés pasa
```
