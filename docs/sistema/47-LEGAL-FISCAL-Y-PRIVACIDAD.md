# LEGAL, FISCAL Y PRIVACIDAD — El Único Hogar del Pilar Legal del SO

> **Cuándo cargar este archivo:**
> - Al montar las páginas legales (Privacidad, ToS, Reembolso, cookies) — requisito del footer de la landing (`19` §10) y del pre-lanzamiento
> - Cuando la app YA vende (o está a punto): al primer ingreso recurrente por Hotmart (junto con `18-VENTA-HOTMART.md` y `40-UNIT-ECONOMICS.md`)
> - Si la app maneja datos personales (casi siempre): privacidad LGPD/LATAM, consentimiento, transferencia internacional a la IA, derecho a eliminación
> - Si la app tiene contenido de usuarios (UGC) o salidas de IA públicas/compartibles (Trust & Safety, junto con `30-INTEGRACION-IA.md`)
>
> **Por qué existe:** este archivo es el ÚNICO hogar del pilar legal del SO — **privacidad + páginas legales + fiscal + ToS + Trust & Safety**, todo en un solo lugar. `09-SEGURIDAD.md` queda como seguridad TÉCNICA pura (BFF, RLS, XSS, CSP...) y apunta aquí para lo legal. El soporte al cliente (canales, SLA, rescate de churn) vive en `59-SOPORTE-CLIENTE.md`. Es la diferencia entre "una app que vende" y "un negocio que no te mete en problemas".

---

## 1. FISCAL Y LEGAL OPERATIVO (LATAM, con Hotmart)

### Hotmart como vendedor / Merchant of Record — reduce, NO elimina tu carga fiscal

En muchos países Hotmart actúa como el **vendedor de cara al comprador**: cobra al cliente, emite el comprobante al consumidor, retiene/paga ciertos impuestos del lado del consumidor, y te paga a ti como **productor** (descontando su tarifa de procesamiento y las retenciones que te apliquen). Eso te quita de encima parte de la fricción fiscal con el comprador final.

```
Lo que Hotmart SÍ suele resolver (verificar por país, no asumir):
- El cobro al comprador y su medio de pago (tarjeta, boleto, PIX, etc.).
- El comprobante/recibo al CONSUMIDOR final.
- La retención/pago de ciertos impuestos al consumo del lado del comprador.

Lo que Hotmart NO resuelve por ti:
- Declarar lo que Hotmart TE PAGA como tu INGRESO (esto es tuyo, siempre).
- Tu contabilidad, tu facturación al régimen, y entender QUÉ te retuvieron al pagarte.
```

> **Regla dura: verificar el modelo POR PAÍS, no asumir.** "Merchant of Record" no funciona igual en Colombia, México, Brasil, Argentina, Chile o Perú, ni para todos los productos. El alcance de lo que Hotmart hace por ti cambia con tu país de residencia fiscal y el del comprador. Confírmalo en tu panel y con la doc de Hotmart **antes** de prometerte que "Hotmart se encarga de los impuestos".

### Lo que el dueño SIGUE debiendo (no es opcional al escalar)

Aunque Hotmart sea el vendedor de cara al comprador, lo que te paga es **ingreso tuyo** y eso genera obligaciones:

| Obligación | Qué significa | Cuándo apretar |
|---|---|---|
| **Declarar el ingreso** | Lo que Hotmart te transfiere es renta tuya (persona natural o empresa, según tu país y monto). Declararlo según tu régimen. | Desde el primer pago; en serio al volverse recurrente |
| **Contabilidad / facturación** | Llevar registro de ingresos y, si tu régimen lo exige, emitir tus propias facturas (a Hotmart o por tu actividad). | Al pasar de "ingresos sueltos" a recurrencia |
| **Entender las retenciones** | Hotmart te retiene/descuenta al pagarte (procesamiento + posibles retenciones). Lo que LLEGA a tu cuenta ≠ el bruto. Esto alimenta el INGRESO NETO de `40`. | Antes de modelar unit economics con cifras reales |
| **Persona natural vs empresa** | Al escalar suele convenir constituir empresa (régimen, deducciones, límites de persona natural). Decisión local. | Cuando el ingreso recurrente lo justifique |

> **Recomendación dura, no negociable al escalar:** al PRIMER ingreso recurrente, consultar un **contador local**. No es un lujo ni "para después": las reglas de declaración, retención y régimen son específicas de tu país y cambian. El SO te da el mapa; el contador firma el terreno. Esto **NO es opcional** cuando el negocio empieza a facturar de verdad.

---

## 2. PÁGINAS LEGALES OBLIGATORIAS

Toda web app pública necesita, como mínimo, estas páginas — publicadas ANTES de la primera venta:

> **Quién redacta:** el AGENTE redacta el BORRADOR de cada página usando estos bullets como spec
> (en el idioma del usuario, específico de la app — qué datos trata, qué IA usa, qué vende), el
> dueño lo revisa y un abogado local lo valida idealmente. Los generadores (Termly, Iubenda, etc.)
> sirven para CONTRASTAR el borrador, no lo sustituyen — la landing no espera a un generador de pago.

### 1. Política de Privacidad

Requerida por ley en la mayoría de jurisdicciones (GDPR en Europa, CCPA en California, y las leyes LATAM de la sección 3).

Debe incluir:
- Qué datos se recopilan (nombre, email, datos de uso)
- Cómo se usan esos datos
- Si se comparten con terceros (APIs de IA, analytics, pagos) — incluida la **transferencia internacional** a la IA (ver sección 3)
- **Lista NOMBRADA de terceros/subprocesadores con su función** (ej.: Supabase — base de datos y auth; [proveedor de IA] — procesamiento de los prompts; Vercel — hosting; Resend — emails; Hotmart — pagos; [analytics] — uso). Una política que dice "terceros" sin nombres no informa nada.
- Cómo el usuario puede eliminar sus datos
- Información de contacto
- **Fecha de "última actualización" visible + versionado**: los cambios materiales se avisan por email a los usuarios activos (cambiar la política en silencio es la práctica que genera denuncias)

**Cómo se genera (regla del SO):** LA IA LA REDACTA con las especificaciones de este archivo — las páginas legales son entregables de la Sesión 3 y se crean ANTES de declarar la landing terminada (19). Antes de redactar, la IA pide los **DATOS DEL RESPONSABLE** (lo único que no puede inventar): nombre o razón social del dueño, país desde el que opera, y email de contacto legal. Los generadores externos (Termly, Iubenda) sirven como CONTRASTE opcional de completitud, nunca como sustituto ni excusa para no redactar. El complemento `/legal` (PROMPT-LEGAL.txt) audita las páginas ya creadas y las perfecciona.

### 2. Términos de Servicio (ToS)

Protegen al creador de la app de responsabilidad legal. Deben incluir:

```
- Qué es el servicio y qué NO promete; condiciones de uso aceptable; derecho a terminar cuentas.
- Que el acceso se vende vía Hotmart (suscripción) y vive en la app (Vercel/Supabase).
- Ley aplicable y resolución de disputas (tu país).
- La limitación de responsabilidad (ver Disclaimer abajo) — especialmente importante con IA.
```

### 3. Política de Reembolso → ALINEAR con la de Hotmart (no contradecirla)

```
- Hotmart impone su propia ventana/garantía legal de reembolso (verificar la vigente por país).
- Tu política NO puede prometer menos de lo que Hotmart garantiza, ni contradecir su flujo.
- El webhook ya maneja PURCHASE_REFUNDED/CHARGEBACK (corte de acceso, ver 18) — el TEXTO legal
  debe coincidir con ese comportamiento real.
```

### 4. Disclaimer + limitación de responsabilidad → CRÍTICO para apps de IA

```
- Frase núcleo: "Esto es ORIENTACIÓN generada por IA, NO consejo médico/legal/financiero/
  profesional. El usuario es responsable de sus decisiones." Adaptar al dominio de la app.
- La salida de IA puede ser incorrecta o incompleta; el usuario debe verificar.
- Sin esto, una app de IA que "aconseja" salud/dinero/legal te expone a responsabilidad real.
```

> **El disclaimer NO es decorativo.** Para una app de IA, la limitación de responsabilidad es la pieza legal que más te protege: define que generas *orientación*, no *consejo profesional vinculante*. Tiene que estar (a) en los ToS, (b) visible en la app donde la IA produce la salida sensible, y (c) coherente con el aviso de procesamiento de IA de la sección 3. Tres lugares, el mismo mensaje.

### 5. Edad mínima (si aplica)

```
- Declarar edad mínima de uso (13/16/18 según el dato que trates y tu país); reforzado si hay
  datos sensibles o de menores (ver sección 3). En un MVP, lo más simple es prohibir <18 si hay duda.
```

**Consentimiento atribuible, no una bandera del navegador.** El checkbox se registra después de
vincularlo a una identidad verificada o mediante una ceremonia explícita que luego se reconcilia
sin ambigüedad. Nunca guardar `consent=true` en `localStorage` para premarcarlo en la siguiente
visita: en un dispositivo compartido atribuiría la decisión de una persona a otra.

El ledger mínimo guarda `subject_id`, versión de política/texto, finalidades separadas, timestamp,
locale, origen y retiro. Si aplica un representante, guarda su identidad/relación y evidencia según
la revisión jurídica local. Consentimiento de servicio, marketing y datos sensibles no se agrupa en
una casilla única. El gate operativo completo vive en `61-INTEGRIDAD-DE-LANZAMIENTO.md`.

**Si el producto puede ser usado por menores:** no elegir una edad de memoria. Verificar la norma
vigente del país con fuentes oficiales y revisión jurídica profesional; implementar age gate,
minimización reforzada y participación/autorización del representante cuando corresponda. Fotos,
voz, documentos y avatares de menores van siempre en bucket privado con RLS y URLs firmadas cortas.

### 6. Aviso de Cookies (si aplica)

Obligatorio si usas cookies de terceros (analytics, publicidad) y tienes usuarios en Europa. Para MVP: una barra inferior con "Aceptar" y "Rechazar" **igual de accesibles** (mismo tamaño y prominencia — GDPR/ePrivacy exige que rechazar cueste lo mismo que aceptar) + link a la política de privacidad; y NINGUNA cookie no esencial se instala antes del consentimiento.

### Dónde van los textos legales

Links en el **footer** (siempre visible), en el **registro** (checkbox no premarcado) y, para apps de IA, el disclaimer **junto a la salida** de la IA — no solo enterrado en los ToS:

```
Footer:  [Términos de Servicio] · [Política de Privacidad] · [Política de Reembolso] · [Contacto/Soporte]
Registro: "Al crear tu cuenta aceptas los [Términos] y la [Política de Privacidad]." (checkbox NO premarcado)
En la salida de IA: micro-disclaimer contextual ("Esto es orientación, no consejo profesional").
```

### Capa legal de SUSCRIPCIÓN (obligatoria antes de vender recurrente)

Vender una suscripción añade obligaciones que un pago único no tiene. Cuatro piezas, todas antes de la primera venta:

```
1. PÁGINA "CÓMO CANCELAR" IN-APP — OBLIGATORIA.
   Pasos concretos (con capturas si se puede) + LINK DIRECTO al portal del comprador de Hotmart
   donde se cancela. Accesible desde ajustes/cuenta sin buscar. Una cancelación difícil no retiene:
   produce churn con rabia, reembolsos, chargebacks y reseñas de 1 estrella — y es un dark pattern
   prohibido por el propio SO (CLAUDE.md / 03).

2. AVISO DE RENOVACIÓN AUTOMÁTICA visible ANTES del checkout.
   En el paywall y en el puente de checkout (02C): "Se renueva automáticamente cada mes/año.
   Cancela cuando quieras desde tu cuenta." Con trial: la FECHA EXACTA del primer cobro (ya lo
   exige 02C). Cobros recurrentes "sorpresa" = disputas y riesgo de consumo.

3. DERECHO DE RETRACTO DE 7 DÍAS (CDC de Brasil, que Hotmart aplica).
   El comprador puede desistir dentro de los 7 días con devolución — Hotmart lo opera. Tu garantía
   y tus textos deben ser COHERENTES con esa ventana: nunca ofrecer menos de 7 días ni poner
   condiciones que la contradigan. En otros países LATAM hay figuras análogas: verificar por mercado.

4. COHERENCIA GARANTÍA PROMETIDA ↔ VENTANA REAL DE REEMBOLSO EN HOTMART.
   Si la landing/paywall promete "30 días o te devolvemos el dinero", la garantía del producto EN
   EL PANEL de Hotmart debe estar configurada a 30 días (se configura por producto). Prometer 30
   con 7 configurados = el cliente pide el día 20, Hotmart lo rechaza, y el incumplimiento es TUYO
   (reembolso manual + reclamo). Verificarlo en el panel antes de publicar la promesa.
```

> **Renovaciones automáticas — marco 2025-2026:** California ARL (jul-2025) exige recordatorio
> ANTES de la renovación anual y cancelación tan fácil como la suscripción; la regla federal FTC
> "Click-to-Cancel" fue anulada en 2025 pero la FTC reabrió el proceso en 2026 y varios estados
> la replican. Si vendes a EE.UU.: pre-aviso anual + cancelación simple NO son opcionales.
> La doctrina operativa (cadencia de avisos, cancel-flow) vive en `58-RETENCION-DE-INGRESOS.md`.

### Claims publicitarios y moderación (Meta / TikTok / Hotmart)

Los claims del copy no son solo un tema de conversión — son un riesgo operativo que puede matar tus canales:

```
- INCOME CLAIMS ("gana $1.847 en 21 días", "factura $10k/mes"): violan las políticas de anuncios
  de Meta y TikTok. Resultado: anuncios rechazados y, reincidiendo, la CUENTA PUBLICITARIA
  bloqueada — pierdes el canal de pago completo, no un anuncio.
- CLAIMS DE SALUD no sustentados ("pierde 5 kg en 2 semanas") y apelaciones a atributos personales
  ("¿cansado de tu sobrepeso?"): mismas políticas, mismo riesgo.
- HOTMART TAMBIÉN MODERA: productos y páginas con promesas de enriquecimiento o salud sin sustento
  pueden no pasar la aprobación o ser dados de baja después. Los testimonios inventados violan
  además sus términos (y la ley de consumo).
- REGLA DEL SO (coherente con la regla 3 de copy de 19): números específicos SOLO verificables y
  propios, enmarcados en PROCESO y TIEMPO ("de 2 horas a 4 minutos por carrusel"), nunca en
  promesas de ingresos o resultados de salud. La prueba social sigue el playbook "en frío" de 19
  (jamás placeholders).
```

---

## 3. PRIVACIDAD Y DATOS PERSONALES (LGPD y leyes LATAM)

### Principio de Minimización

Solo recopilar los datos que realmente necesitas. Para un MVP:
- Nombre (para personalización)
- Email (para auth y comunicación)
- Datos de uso de la app (para mejorar el producto)

NO recopilar a menos que sea esencial:
- Ubicación
- Fecha de nacimiento
- Número de teléfono
- Datos financieros (dejar eso a Hotmart/Stripe — el procesador de pago)

### Derecho a Eliminación

El usuario debe poder eliminar su cuenta y todos sus datos. Implementar:

```typescript
// Endpoint o función para eliminar cuenta
async function deleteUserAccount(userId: string) {
  // 1. Eliminar todos los datos del usuario
  await supabase.from('generations').delete().eq('user_id', userId);
  await supabase.from('profiles').delete().eq('id', userId);
  
  // 2. Eliminar la cuenta de auth
  await supabase.auth.admin.deleteUser(userId);
  
  // 3. Log para auditoría (sin datos personales)
  console.log(`Account deleted: ${userId} at ${new Date().toISOString()}`);
}
```

### Datos Sensibles en Prompts de IA

Advertir al usuario que los datos enviados a la IA pueden ser procesados por terceros:

```
⚠️ Aviso: Los textos que ingresas son procesados por un servicio de IA.
No incluyas información personal sensible como contraseñas, datos financieros,
o información médica confidencial.
```

**Retención y borrado de los datos enviados a la IA** (los prompts son datos personales si traen info del usuario):
```
- TTL para los logs de IA (ai_calls, ver 31) + purga por cron (pg_cron). No guardar prompts en crudo
  con PII: hash o versión redactada.
- Activar zero-data-retention (ZDR) con el proveedor cuando esté disponible (Anthropic/Google lo
  ofrecen en ciertos planes): que NO entrenen ni retengan tus datos.
- El borrado de cuenta debe arrastrar también los logs de IA del usuario, no solo el perfil.
```

### Privacidad LATAM (LGPD y leyes afines)

GDPR/CCPA aplican si tienes usuarios en Europa/California, pero el público de este SO es **LATAM**, con sus propias leyes de datos — y con multas reales. Lo mínimo que la app debe cumplir:

| País | Ley | Autoridad | Nota |
|---|---|---|---|
| Brasil | **LGPD** (Lei 13.709) | ANPD | La más estricta; multas hasta 2% de la facturación (tope R$50M/infracción) |
| Colombia | **Ley 1581 de 2012** | SIC | Exige **autorización previa EXPRESA** del titular al registrarse: checkbox NO pre-marcado + texto modelo de 1 frase — "Autorizo el tratamiento de mis datos según la Política de Privacidad". El aviso de privacidad debe estar accesible desde el punto de recolección (link junto al checkbox). RNBD (Registro Nacional de Bases de Datos): aplica según umbrales de activos de la empresa — verificar con el contador; la mayoría de apps indie quedan fuera del umbral, pero se VERIFICA, no se asume |
| México | **LFPDPPP** | INAI | Exige **Aviso de Privacidad** explícito en el punto de recolección |
| Argentina | Ley 25.326 (en reforma) | AAIP | Alineándose con estándar GDPR/LGPD |
| Chile | Ley 21.719 (2026) | Agencia de Protección de Datos | Régimen nuevo tipo GDPR |

**Lo común a todas (lo que la app debe implementar):**
```
[ ] BASE LEGAL del tratamiento: por defecto CONSENTIMIENTO libre, informado y específico
    (checkbox NO premarcado en el registro).
[ ] AVISO/POLÍTICA DE PRIVACIDAD clara en el punto de recolección (obligatorio como "Aviso de
    Privacidad" en MX; equivalente en BR/CO/CL): qué datos, para qué, con quién se comparten, retención.
[ ] DERECHOS DEL TITULAR (acceso, rectificación, cancelación/eliminación, oposición + portabilidad):
    borrado de cuenta funcional + canal de contacto (el email de soporte/DPO basta para un MVP).
[ ] MINIMIZACIÓN: solo los datos necesarios.
[ ] Menores o datos sensibles (salud, biometría) → reglas reforzadas; evitar recolectarlos en un MVP.
```

### El punto crítico para apps de IA: transferencia internacional

Los datos del usuario (prompts, imágenes, a veces PII) **salen hacia APIs de IA en EE.UU.** (Anthropic, OpenAI, Google). Eso es una **transferencia internacional de datos personales**, regulada por LGPD/Ley 1581/LFPDPPP:

```
[ ] DECLARAR la transferencia internacional en la política: nombrar al tercero (proveedor de IA) y
    el país destino (EE.UU.), y que el tratamiento se hace bajo sus términos.
[ ] CONSENTIMIENTO para esa transferencia (el checkbox del registro + el aviso "tus textos se
    procesan por un servicio de IA").
[ ] ZERO-DATA-RETENTION / NO-ENTRENAMIENTO con el proveedor donde exista (Anthropic y otros lo
    ofrecen): el dato pasa, se procesa, no se queda. Es lo que hace defendible la transferencia.
[ ] No mandar a la IA más PII de la necesaria: redactar/anonimizar antes cuando se pueda.
[ ] El borrado de cuenta arrastra también los logs de IA del usuario (no solo el perfil).
```

> Para un MVP de fundador solo: política con cláusula de transferencia + checkbox de consentimiento + ZDR activado + borrado de cuenta funcional cubre el grueso. Si la app maneja datos sensibles (salud, finanzas), consultar a un abogado de protección de datos local.

---

## 3B. LAS PROMESAS ESCRITAS MANDAN SOBRE LA TÁCTICA DE CRECIMIENTO

Antes de implementar **cualquier** técnica que envíe datos de usuarios a un tercero —coincidencia
avanzada de una plataforma de anuncios, conversiones del lado del servidor, píxeles de terceros,
enriquecimiento de datos, sincronización con un CRM— hay que **releer lo que ya prometiste**:

```
[ ] La política de privacidad publicada, palabra por palabra
[ ] El microcopy junto a CADA campo donde pides un dato
    ("cero publicidad", "solo para tu progreso", "no compartimos nada")
[ ] Los correos que ya enviaste diciendo qué harías con ese dato
[ ] El consentimiento que la persona aceptó, y su versión (ver 61)
```

**Si la técnica contradice cualquiera de esas frases, la técnica no se implementa.** No es una
cuestión de riesgo legal solamente: una promesa rota en el sitio donde se pide el dato destruye
exactamente la confianza que hace que la gente entregue el dato.

**Las tres salidas legítimas**, en este orden:
1. **Buscar una alternativa que no toque el dato prometido** (medición sin identificadores
   personales, conversiones sin correo, atribución por identificador anónimo propio).
2. **Cambiar la promesa hacia adelante**: actualizar la política y el microcopy, versionar el
   consentimiento y aplicarlo **solo a quienes acepten la versión nueva**. Nunca retroactivamente.
3. **Renunciar a la técnica.** Es una decisión válida y a veces la correcta.

> ⚠️ **Caso especial: productos usados por menores de edad.** Aquí la barra sube y la opción 2 se
> vuelve mucho más estrecha. Ver la sección de protección de menores de este archivo y el gate de
> consentimiento de `61-INTEGRIDAD-DE-LANZAMIENTO.md` antes de plantearse siquiera cambiar la promesa.

**Quién decide:** esto NO es una decisión técnica que el agente tome solo. Se informa al dueño con
las tres opciones y el costo de cada una, y él elige (ver "PREGUNTAR vs DECIDIR" en `CLAUDE.md`:
cambiar una promesa ya hecha a los usuarios es una decisión del dueño).

---

## 4. SOPORTE AL CLIENTE → vive en `59-SOPORTE-CLIENTE.md`

> El pilar completo de soporte (canales por etapa, SLA, plantillas, bot con escalada humana, rescate proactivo de churn, loop de feedback, métricas) se movió a `59-SOPORTE-CLIENTE.md`. Aquí solo queda la obligación LEGAL de atención: política de reembolso alineada con Hotmart y página "cómo cancelar" in-app (sección 2).

---

## 5. TRUST & SAFETY / MODERACIÓN (condicional — solo si aplica)

> **Esta sección APLICA SOLO si la app tiene contenido de usuarios (UGC) o salidas de IA públicas/compartibles.** Si la app es de un solo usuario, sin UGC, y las salidas de IA son privadas (solo las ve quien las generó), **esta sección NO aplica — y eso está bien, no hay nada que montar aquí.** Dilo explícitamente y pasa de largo.

### Si HAY contenido de usuarios (UGC) o salidas públicas/compartibles

```
POLÍTICA DE USO ACEPTABLE (parte de los ToS de la sección 2):
  - Qué está prohibido publicar/generar (acoso, ilegal, spam, sexual con menores, etc.).
  - Consecuencias (advertencia, suspensión, baja) y derecho a terminar la cuenta.

HERRAMIENTAS DE MODERACIÓN COMUNITARIA:
  - REPORTAR contenido/usuario (botón visible).
  - BLOQUEAR / SILENCIAR a otro usuario.
  - Manejo de ABUSO y SPAM (rate limit, detección de patrones, baneo).
  - EDAD MÍNIMA reforzada (coherente con la sección 2 y con la sección 3 para menores/datos sensibles).
```

### Para apps de IA: moderación de OUTPUTS (enlaza con los guardrails de `30`)

`30` ya define los guardrails de IA (moderación entrada/salida, anti-inyección, grounding). La capa de Trust & Safety los **opera** cuando la salida puede volverse pública o compartible:

```
- MODERACIÓN DE SALIDA (de 30, guardrail #1): pasar la salida del modelo por un clasificador
  (Moderation API del proveedor o un Haiku barato) ANTES de mostrarla o de permitir compartirla.
  Especialmente crítico si esa salida se publica o comparte (ya no es solo del usuario).
- ANTI-INYECCIÓN (de 30, guardrail #2): el input del usuario son DATOS, no instrucciones —
  no debe reprogramar el sistema ni la moderación.
- NO GENERAR CONTENIDO PROHIBIDO: políticas claras de qué la IA NO produce; bloquear y registrar
  el intento (status 'moderated' en ai_calls, ver 31).
- Si la salida se COMPARTE públicamente, la responsabilidad sube: modera ANTES de exponerla, no después.
```

> **Si NO hay UGC ni salida pública, esta sección entera no aplica.** No inventes una cola de moderación para una app de un solo usuario con salidas privadas — sería gold-plating. La regla: ¿el contenido que genera un usuario puede llegar a OTRO usuario o al público? Si no, salta esta sección.

---

## CHECKLIST DE CIERRE — Legal, Fiscal y Privacidad

```
FISCAL
[ ] Modelo de Hotmart como vendedor VERIFICADO por país (no asumido)
[ ] Sé qué me retiene/descuenta Hotmart al pagarme (alimenta el ingreso NETO de 40)
[ ] Ingreso de Hotmart declarado como renta propia según mi régimen
[ ] Contador local consultado al primer ingreso recurrente (NO opcional al escalar)
[ ] Si vendes multi-país/multi-moneda: obligaciones por mercado revisadas (ver 39)
[ ] Al escalar: decisión persona natural vs empresa tomada con asesoría; contabilidad montada

PÁGINAS LEGALES
[ ] Política de Privacidad publicada (qué datos, uso, terceros, eliminación, contacto)
[ ] ToS publicados (servicio, uso aceptable, terminación, ley aplicable)
[ ] Política de Reembolso alineada con Hotmart (coherente con el corte de acceso del webhook de 18)
[ ] Capa de suscripción: "cómo cancelar" in-app + aviso de renovación pre-checkout + retracto 7 días + garantía = ventana configurada en Hotmart
[ ] Claims publicitarios limpios (sin income/salud) — coherente con 19 y con la moderación de Hotmart
[ ] Disclaimer + limitación de responsabilidad (IA ≠ consejo profesional) en ToS Y junto a la salida
[ ] Edad mínima declarada si aplica
[ ] Aviso de cookies (si hay usuarios europeos / cookies de terceros)
[ ] Links legales en el footer y en el registro; checkbox de aceptación NO premarcado

PRIVACIDAD Y DATOS
[ ] Solo se recopilan datos necesarios (minimización)
[ ] Cumplimiento LATAM (LGPD/Ley 1581/LFPDPPP): aviso de privacidad, consentimiento, derechos del titular
[ ] Consentimiento ligado a identidad y versión; localStorage/cookies nunca lo premarcan
[ ] Si puede haber menores: age gate + revisión jurídica + representante cuando aplique
[ ] Fotos/voz/documentos/avatares sensibles en bucket privado; URL pública directa falla
[ ] Funcionalidad de eliminar cuenta implementada (arrastra también los logs de IA)
[ ] Aviso sobre procesamiento de datos con IA junto al input (si aplica)
[ ] Transferencia internacional a IA declarada + ZDR/no-entrenamiento activado
[ ] Datos de pago manejados por el procesador (Hotmart/Stripe), nunca almacenados

TRUST & SAFETY (solo si hay UGC o salida pública/compartible — si no, NO aplica)
[ ] Política de uso aceptable en los ToS
[ ] Reportar / bloquear / silenciar; manejo de abuso y spam; edad mínima reforzada
[ ] Moderación de OUTPUTS de IA antes de publicar/compartir (guardrails de 30: moderación, anti-inyección)
[ ] Si NO hay UGC ni salida pública: documentado que esta sección no aplica

SOPORTE → checklist propio en 59-SOPORTE-CLIENTE.md (aquí solo la obligación legal: reembolso + "cómo cancelar")
```

---

## CÓMO SE CONECTA

```
18-VENTA-HOTMART.md    → Hotmart como vendedor (reduce carga fiscal); el webhook ya hace el corte por
                         REFUNDED/CHARGEBACK que la Política de Reembolso debe reflejar. La Política
                         de Reembolso se ALINEA con la de Hotmart.
40-UNIT-ECONOMICS.md   → lo que Hotmart te retiene/descuenta define el INGRESO NETO.
09-SEGURIDAD.md        → seguridad TÉCNICA pura (BFF, RLS, XSS, CSP, uploads, CSRF); las claves de la
                         privacidad operativa (no loggear PII, borrado en cascada) se implementan con
                         sus patrones. Lo legal/privacidad vive AQUÍ, no allá.
19-PAGINA-DE-VENTAS.md → las páginas legales son requisito del footer de la landing (§10); los claims
                         del copy siguen la regla 3 del 19.
59-SOPORTE-CLIENTE.md  → el pilar de soporte completo (canales, SLA, rescate de churn, métricas);
                         aquí solo la obligación legal de atención (reembolso, "cómo cancelar").
58-RETENCION-DE-INGRESOS.md → dunning/win-back; la cancelación fácil que exige la capa de
                         suscripción es coherente con su cancelación retentiva (sin dark patterns).
30-INTEGRACION-IA.md   → los guardrails (moderación entrada/salida, anti-inyección, grounding) son la
                         base de la moderación de OUTPUTS en Trust & Safety; ZDR y retención de datos
                         de IA se configuran con el proveedor.
31-EVALS-OBSERVABILIDAD-OPERACION.md → ai_calls guarda prompt_hash (no PII en crudo) y su TTL/purga
                         implementa la retención que exige la privacidad.
44-DESCUBRIMIENTO-DE-USUARIO.md → las entrevistas y datos de usuarios reales también son datos
                         personales: aplica la misma minimización y consentimiento.
```
