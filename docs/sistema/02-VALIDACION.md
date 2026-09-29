# FASE 1 — VALIDACIÓN Y ESTRATEGIA DE RETENCIÓN

## Objetivo
Antes de escribir una línea de código, validar que la app tiene potencial real de monetización y definir exactamente cómo va a retener usuarios mes a mes.

> **Validación con idea propia (FLUJO B de INICIO):** la validación usa el MISMO radar de `01`
> (EL RADAR DE MERCADO: la IA consulta las fuentes, extrae y cita — el usuario JAMÁS visita esas
> páginas), y el proyecto elige su APP MODELO igual que en el Flujo A. Tener idea propia no exime
> del modelo — lo probado se modela, lo propio se diferencia en UN eje.

---

## Paso 0: GATE DE VALIDACIÓN DE DEMANDA (señal de pago real ANTES de construir)

> **Por qué este gate no se negocia:** el 42-43% de los fracasos es "no había mercado / mal
> product-market fit" (CB Insights 2014/2026) — más que todas las causas de ejecución juntas;
> ~65% de los que fallaron por mercado nunca hablaron con un cliente antes de construir, y entre
> quienes validaron con rigor el fallo cae por debajo del 15% (UserIntuition 2025, análisis del
> corpus de post-mortems).

> Este es el gate que faltaba. El Test de Viabilidad (Paso 1) evalúa si la idea es BUENA en teoría. Este gate evalúa si **alguien la PAGARÍA en la práctica** — con señal real, no con "suena útil". Construir una app pulida que nadie quiere es la forma más cara de perder semanas. **Sin pasar este gate, NO se escribe código.**

**El principio:** las opiniones mienten, el comportamiento no. "Me encantaría algo así" no es validación — es cortesía. Validación es alguien **dando un paso que cuesta** (dejar la tarjeta, pre-ordenar, agendar) o **diciendo un número** (cuánto pagaría, sin que se lo sugieras). El SO exige una de estas dos señales antes de invertir en construcción:

> **Antes de este gate:** si tu hipótesis de problema NO está aterrizada en conversaciones reales con el segmento, pasa por `44-DESCUBRIMIENTO-DE-USUARIO.md` ANTES de este gate. `44` investiga la hipótesis con humanos reales y detecta la señal CUALITATIVA (qué gastan hoy, en qué, cuánto); este gate la prueba con DINERO. No son lo mismo: la entrevista te dice "creo que pagarían $X"; el gate te dice "pagaron $X".

### Opción A — Fake-door / landing de pre-orden (la señal más fuerte en tráfico frío)
```
Montar una landing mínima (puede ser la del archivo 19 en versión reducida) que vende la
promesa como si la app existiera, con un CTA "Pre-ordenar" / "Quiero acceso anticipado":
  - El CTA lleva a un checkout REAL (Hotmart, oferta de fundador con precio bajo) o a una
    lista de espera con tarjeta/depósito reembolsable.
  - Mandar tráfico REALISTA: 300+ visitas orgánicas propias (audiencia, grupos de nicho) o
    $100-150 de ads. ⚠️ Con $20-50 NO hay muestra: a CPC LATAM de $0.30-1 son 30-100 clics,
    y exigir ahí 3-5 pagos sería 5-15% de conversión FRÍA — irreal (la conversión fría
    landing→pago sana es 0.5-2% en el MEJOR caso).

REFERENCIA LATAM para calcular expectativas ANTES de gastar:
  CPC frío Meta/TikTok: ~$0.30-1 · CTR de anuncio: ~1-2% · conversión fría visita→pago: 0.5-2%.
  Ej.: $150 de ads ≈ 150-500 visitas → esperar 1-5 pagos si el mensaje funciona.

SEÑAL ESCALONADA:
  - SEÑAL MEDIA: ≥8-10% de las visitas hacen CLIC al checkout (intención de pago medida).
  - SEÑAL FUERTE: pagos reales de desconocidos (cualquier número >0 en frío ya es señal;
    1-2/100 sería excepcional — el propio benchmark de arriba dice 0.5-2% en el MEJOR caso).
  Reembolsar después si la app aún no existe.
SEÑAL QUE NO PASA: muchos "me interesa" y <8% que llegan al checkout, o cero pagos con 200+
  visitas → el mensaje o la demanda fallan. Iterar el ángulo o pivotar (NO construir).
```

### Opción B — 5 entrevistas JTBD con willingness-to-pay (Van Westendorp ligero)
```
Si no quieres montar landing aún, hacer 5 entrevistas a personas del avatar EXACTO (no amigos
que quieren agradar). Preguntar por el JOB TO BE DONE (qué intentan lograr y qué usan hoy) y
medir la disposición a pagar con 4 preguntas tipo Van Westendorp ligero:
  1. ¿A qué precio te parecería tan BARATO que dudarías de la calidad?
  2. ¿A qué precio te parecería una GANGA (buen valor, lo comprarías)?
  3. ¿A qué precio empezaría a parecerte CARO (lo pensarías)?
  4. ¿A qué precio sería tan CARO que ni lo considerarías?
El rango aceptable de precio vive entre las respuestas 2 y 3 (cruzadas entre los 5).
SEÑAL QUE PASA EL GATE: ≥ 4 de 5 nombran un precio dentro de un rango viable (que deja margen
  sobre el costo de IA, ver Paso 3) Y describen el dolor sin que tú se lo sugieras.
SEÑAL QUE NO PASA: precios irrisorios, "lo usaría si fuera gratis", o no logran nombrar el dolor
  → no hay demanda con disposición a pagar. Ajustar avatar/promesa o pivotar.
```

### OPCIÓN C — VALIDACIÓN CONCIERGE (la señal más fuerte que existe)
```
Doctrina YC "do things that don't scale" (Paul Graham, 2013): la IA del SO genera los OUTPUTS
reales del producto (el plan, el análisis, el documento) y el founder los entrega A MANO
(WhatsApp/email) a 3-5 clientes que PAGAN (aunque sea un precio simbólico de $5-10).

SEÑAL QUE PASA EL GATE: ≥3 personas pagaron y usaron = señal más fuerte que cualquier fake-door
  (dinero + uso real), y de paso prueba el GATE de IA real de 01 con outputs verdaderos ANTES
  de escribir código.
SEÑAL QUE NO PASA: si nadie paga por el resultado entregado en mano, ninguna app lo va a arreglar.
```

### Ficha del Gate
```
GATE DE DEMANDA — [Nombre de la App]

Método usado:        [ A: fake-door/pre-orden  |  B: 5 entrevistas JTBD  |  C: concierge ]
Señal obtenida:      [ej. "11% clic-a-checkout sobre 280 visitas + 3 pagos" | "4/5 nombran $15-25 y describen el dolor"]
Umbral exigido:      [ A: ≥8-10% clic-a-checkout (media) y/o ≥1-2 pagos por ~100 visitas (fuerte)  |  B: ≥4/5 con WTP viable  |  C: ≥3 pagaron y usaron ]
Rango de precio validado: [si aplica]

KILL CRITERIA (se escriben ANTES de validar, hoy — el día más barato para matar la idea):
  Señal esperada:                        ___
  Fecha límite:                          ___
  Acción pre-comprometida si no llega:   [ matar  |  pivotar a ___ ]

Resultado:           [ PASA → construir  |  NO PASA → iterar mensaje / pivotar / matar idea ]
```

> **Regla anti-sunk-cost:** máximo 2 reformulaciones de ángulo por idea; a la tercera sin señal,
> la idea SE MATA. Por qué existe esta regla: la escalada de compromiso (sunk cost) está
> documentada — el founder persiste por autojustificación y apego, no por evidencia (Annie Duke,
> "Quit", 2022; First Round, 2023); el único antídoto es el criterio escrito y fechado ANTES de
> encariñarse.

> **Por qué un umbral y no "alguna señal":** un solo "sí" puede ser ruido o cortesía. El umbral (≥X) fuerza un patrón, no una anécdota. Y la señal debe COSTAR algo a quien la da (dinero, tiempo de entrevista, un número comprometido) — por eso un "like" o un "qué buena idea" no cuentan. Este gate cuesta días; construir lo equivocado cuesta semanas y la moral del proyecto.

### Cómo aplicar el gate sin frenar a un usuario que "quiere que la IA lo haga todo"

El gate es la mejor práctica, pero la IA **no puede** entrevistar ni pre-vender por el usuario. Para que el gate guíe sin convertirse en un muro, hay tres caminos según el caso (el agente elige y lo explica en simple):

```
1. VINO POR FLUJO A (arbitraje LATAM, INICIO.md): el arbitraje valida el PROBLEMA, NUNCA el PAGO
   (coherente con el Pilar 2 de 01: que una app facture afuera o levante $20M NO prueba que un
   latino pague $20/mes por Hotmart). Por eso el gate NO se considera cubierto — se REBAJA a un
   MINI-GATE barato que no frena la obra: lanzar la landing fake-door del 19 EN PARALELO a la
   construcción (la landing igual se va a necesitar) y medir con el umbral escalonado de la
   Opción A (≥8-10% clic-a-checkout = señal media; ≥1-2 pagos por ~100 visitas = fuerte).
   Documentar en ESTADO.md: "PROBLEMA validado por arbitraje (FLUJO A); PAGO pendiente de
   mini-gate fake-door en paralelo — sin señal, NO se gasta en tráfico pago (34)".
   → Y SIEMPRE se corre el GATE DE VIABILIDAD UNITARIA (Paso 3 + 40): que alguien quiera ≠ que
   el negocio gane dinero.

2. QUIERE Y PUEDE VALIDAR: ofrecerle el camino más barato — montar la landing del archivo 19 como
   fake-door (Opción A). La IA construye la landing; el usuario solo manda el tráfico mínimo. Es la
   señal en frío más fuerte y reutiliza trabajo que igual hará (la concierge de la Opción C es aún
   más fuerte si tiene 3-5 personas a quienes entregar a mano).

3. NO PUEDE/NO QUIERE VALIDAR (caso típico del no-técnico que quiere construir ya): NO bloquear en
   seco. El agente: (a) explica en simple el riesgo ("construir sin saber si alguien paga es la forma
   más cara de equivocarse"); (b) propone VALIDAR EN PARALELO — lanzar la landing fake-door del 19
   apenas esté, mientras se construye el MVP, para tener señal antes de gastar en tráfico/IA; (c) deja
   constancia en ESTADO.md: "construido sin gate de demanda — riesgo asumido por el usuario el [fecha]";
   (d) pide el OK explícito (regla de alertas de CLAUDE.md) y avanza. La validación se persigue, no se
   regala — pero la decisión final es del dueño, informado.
```

> Regla: el gate **informa y recomienda**; solo es **bloqueante de verdad** cuando el propio usuario quiere invertir en tráfico pago (ahí sin señal NO se gastan ads — ver 34). Para construir el MVP, un usuario informado puede asumir el riesgo; lo que NO se permite es construir a ciegas SIN avisarle del riesgo.

### FALSEAR LA TESIS DE MERCADO (antes de aprobar una brecha)

Una brecha ("no existe X en español", "nadie hace Y para LATAM") NO se aprueba por no haber
encontrado al competidor — se aprueba después de **buscarlo ACTIVAMENTE para refutarla**:

```
1. Buscar en el IDIOMA OBJETIVO y en las stores (Play Store/App Store) con los TÉRMINOS
   DEL USUARIO, no los del producto ("dejar de fumar gratis", no "cesación tabáquica con IA").
2. Si aparece el competidor que la refuta (ej.: un QuitNow con millones de descargas en
   español), la tesis SE REESCRIBE ("no existe X" → "existe X, débil en Z") y la etapa de
   sofisticación del mercado se RE-EVALÚA (57 §6 — incluida la sofisticación bilingüe).
3. Regla: una brecha que nadie intentó refutar es una HIPÓTESIS, no un hallazgo — en
   ESTADO.md y en la ficha se anota como tal hasta pasar esta búsqueda.
```

---

## Paso 1: Test de Viabilidad (5 preguntas críticas)

Evalúa la idea aprobada en el App Brief contra estos 5 criterios. Si falla en 2 o más, hay que pivotar la idea o ajustarla.

### 1. Test de los 30 Segundos
> "¿El usuario puede obtener valor en los primeros 30 segundos de uso?"

- ✅ PASA: El usuario escribe algo, la IA responde con algo útil inmediatamente.
- ❌ FALLA: El usuario tiene que configurar cosas, subir archivos, completar perfil largo, o esperar procesamiento antes de ver un resultado.
- 🔧 CÓMO ARREGLAR: Reduce el onboarding al mínimo absoluto (nombre + 1 dato clave) y muestra un resultado de ejemplo ANTES de que el usuario haga nada.

### 2. Test de Recurrencia
> "¿El usuario tiene una razón para volver mañana o la próxima semana?"

- ✅ PASA: Los datos se acumulan, el contenido se renueva, hay un ciclo natural de uso.
- ❌ FALLA: El problema se resuelve en un solo uso.
- 🔧 CÓMO ARREGLAR: Añade una capa de tracking/historial/progresión que haga que el valor aumente con el uso.

### 3. Test de Irreemplazabilidad
> "¿Esto se puede hacer igual de bien en ChatGPT con un prompt?"

- ✅ PASA: La app ofrece interfaz especializada, datos guardados, flujo optimizado, o integración que un chat genérico no puede replicar.
- ❌ FALLA: Es básicamente un wrapper de prompt con UI bonita.
- 🔧 CÓMO ARREGLAR: Añade memoria persistente, templates personalizados, exportación profesional, o datos del usuario que enriquezcan las respuestas con el tiempo.

### 4. Test de Monetización
> "¿Hay una línea clara entre lo gratuito y lo de pago que no se siente arbitraria?"

- ✅ PASA: Lo gratuito es útil pero limitado de forma natural. Lo de pago desbloquea algo que el usuario QUIERE (no algo que le escondes).
- ❌ FALLA: La línea es artificial (limitar outputs a 3 por día sin razón real) o no hay nada que valga la pena pagar.
- 🔧 CÓMO ARREGLAR: El tier gratuito debe generar "hambre" natural. Ejemplos: 5 generaciones/día (suficiente para probar, insuficiente para trabajo real), exportación con marca de agua, historial de solo 7 días.

### 5. Test de Simplificación
> "¿Se puede explicar en una frase de 10 palabras?"

- ✅ PASA: "Crea propuestas comerciales profesionales en 60 segundos con IA"
- ❌ FALLA: "Es una plataforma que usa IA para ayudarte a gestionar, organizar y optimizar tu flujo de trabajo de contenido con plantillas inteligentes y análisis predictivo..."
- 🔧 CÓMO ARREGLAR: Elimina features hasta que la descripción quepa en una frase. Lo demás se puede agregar después.

### Resultado del Test

```
FICHA DE VIABILIDAD — [Nombre de la App]

Test de 30 Segundos:    [✅/❌] — [nota breve]
Test de Recurrencia:    [✅/❌] — [nota breve]  
Test de Irreemplazabilidad: [✅/❌] — [nota breve]
Test de Monetización:   [✅/❌] — [nota breve]
Test de Simplificación: [✅/❌] — [nota breve]

Resultado: [VIABLE / VIABLE CON AJUSTES / PIVOTAR]
Ajustes necesarios: [si aplica]
```

---

## Paso 2: Estrategia de Retención

Define los mecanismos concretos que harán que el usuario vuelva y pague mes a mes.

### Mecanismos de Retención (elige mínimo 2)

**Datos Acumulados (Lock-in Positivo)**
El usuario guarda historial, configuraciones, templates personalizados. Mientras más usa la app, más valiosa se vuelve porque tiene SUS datos ahí. Irse significaría perder todo.
- Ejemplo: Un planificador de contenido que guarda 6 meses de calendarios, métricas y templates optimizados.

**Personalización Progresiva**
La IA aprende las preferencias del usuario y mejora sus resultados con el tiempo. Las primeras respuestas son buenas, pero las del mes 3 son increíbles porque la IA ya conoce su estilo, nicho y audiencia.
- Ejemplo: Un generador de copy que cada vez clava más el tono del usuario.

**Contenido/Valor Renovado**
La app ofrece algo nuevo regularmente que no existía antes: nuevas plantillas, análisis de tendencias actualizados, datos del mercado frescos.
- Ejemplo: Un analizador de trends que cada semana muestra los temas calientes del nicho del usuario.

**Progresión y Logros**
El usuario tiene un sentido de avance: completa retos, desbloquea features, sube de nivel, acumula streaks.
- Ejemplo: Un tracker de hábitos que muestra rachas y desbloquea insights avanzados a los 30 días.

**Comunidad o Componente Social**
Leaderboards, perfiles públicos, compartir resultados. La presión social positiva mantiene el engagement.
- Ejemplo: Un quiz builder que permite ver cuánta gente completó tu quiz.

**Flujo de Trabajo Integrado**
La app se vuelve parte del workflow diario. Exporta a las herramientas que el usuario ya usa, se conecta con su ecosistema.
- Ejemplo: Un generador de reportes que exporta directo a Notion, Google Docs o Slack.

**Win-Back y Recuperación de Churn**
Cuando un usuario intenta cancelar, no dejarlo ir sin pelear:
1. **Encuesta de salida**: "¿Por qué te vas?" (opciones predefinidas: muy caro, no lo uso, no tiene lo que necesito, encontré algo mejor)
2. **Oferta de retención**: Descuento del 50% por 1-2 meses, o downgrade a un plan más barato
3. **Periodo de gracia**: No borrar sus datos por 30 días después de cancelar. Enviar email a los 7 días: "Tus [47 propuestas generadas] te están esperando"
4. **Re-engagement email**: A los 30, 60 y 90 días con novedades y oferta de regreso

### Documento de Retención

```markdown
## ESTRATEGIA DE RETENCIÓN — [Nombre de la App]

### Mecanismos Activos:
1. [Mecanismo 1]: [Implementación concreta en la app]
2. [Mecanismo 2]: [Implementación concreta en la app]

### Ciclo de Uso Esperado:
- Diario: [qué hace el usuario cada día]
- Semanal: [qué hace cada semana]  
- Mensual: [qué revisa cada mes]

### Trigger de Regreso:
[¿Qué hace que el usuario abra la app sin que nadie le diga? 
¿Notificación? ¿Necesidad del trabajo? ¿Curiosidad?]

### Estrategia de Emails/Notificaciones:
- Día 0: "Bienvenido. Aquí está tu primer resultado guardado."
- Día 1: "¿Sabías que puedes [feature que no usó]?"
- Día 3: Si no volvió: "Tu [resultado] te está esperando. Crea otro →"
- Día 7: "Llevas [X] resultados. Los usuarios Pro generan [Y] al mes."
- Día 14: Si inactivo: "Hace tiempo que no te vemos. ¿Todo bien?"
(Implementar con Resend, Loops, o el servicio de emails de Supabase)

### Momento de "No Me Puedo Ir":
[¿En qué momento el usuario tiene tanto invertido que cancelar 
le dolería? Cuantificar: después de X semanas de uso, 
tendría Y datos guardados que no quiere perder]
```

---

## Paso 3: Modelo de Pricing

Define la estructura de precios basada en el valor real que entrega la app.

### Framework de Pricing

**¿Freemium o Trial Gratuito? (Elegir uno, no ambos)**

| | Freemium | Trial (plazo por tiempo-a-valor — 02C) |
|---|---------|-------------------|
| Cuándo usar | El valor aumenta con el tiempo y el uso gratuito genera datos valiosos | El valor core requiere features Pro para experimentarse |
| Ventaja | Mayor base de usuarios, viralidad, SEO | Mayor tasa de conversión (10-25% vs 3-8% — rangos de checkout integrado/app store; con checkout web de Hotmart, aplicar el descuento del puente de 02C; freemium web mediana ~2.1%) |
| Riesgo | Muchos free riders, costos de servidor | Menos usuarios totales, presión de tiempo |
| Ideal para | Herramientas de uso frecuente (diario/semanal) | Herramientas de alto valor pero uso esporádico |

**Regla**: Si la app genera valor inmediato y frecuente → Freemium. Si el valor está en features avanzadas que solo se aprecian al usarlas → Trial.

> **Nota:** en suscripciones B2C onboarding-first, empezar con el recorrido minimo que produzca un
> resultado personalizado y medir abandono por paso. La duracion del trial debe permitir vivir el
> aha real, con renovacion transparente; no se fija copiando un benchmark. La estrategia esta en
> `02C` y la operacion/medicion en `60`.

**Tier Gratuito (Gancho) — solo si es Freemium**
- Propósito: Que el usuario experimente el momento WOW sin pagar.
- Debe incluir: Funcionalidad core limitada pero funcional.
- Límites sugeridos: 3-5 usos/día, historial de 7 días, exportación con watermark, sin personalización avanzada.
- Regla de oro: Lo gratuito debe ser tan bueno que el usuario QUIERA más, no tan malo que se vaya.

**Tier Pro (Producto Principal)**
- Rango recomendado: $15-39/mes **value-based**, anclado al WTP medido en el Gate (Van Westendorp/pre-orden); el extremo bajo solo si el nicho lo exige. Es una cota de cordura, NO un precio de catálogo (el precio real lo fija el WTP del avatar, ver Paso 3). Mismo rango que 01.
- Debe incluir: cuota/fair-use expresada en resultados útiles, historial completo, exportación
  profesional, personalización y funciones avanzadas de IA. "Ilimitado" solo si el escenario
  heavy-user de `40` pasa y el Claim-to-Capability Ledger de `61` demuestra que es cierto.
- Anchoring: Siempre comparar con el costo de NO tener la app (tiempo perdido, contratar a alguien, herramientas más caras).

**Tier Anual (Opcional pero recomendado)**
- Descuento: ≈17% ("2 meses gratis"), óptimo 15-20%. Mostrar el anual como $/mes en el display
  grande, con el TOTAL anual siempre visible en letra chica ("Se cobra $X/año") — transparencia
  obligatoria (ver 02C/19/18).
- Propósito: Cash flow upfront + menor churn.

### Economía Unitaria de IA (Obligatorio para apps que llaman a APIs de IA)

Cada generación cuesta dinero real. Calcular ANTES de fijar precios:

```
Costo por generación ≈ (tokens_input + tokens_output) × precio_por_token del modelo
Costo mensual por usuario Pro = generaciones_promedio/mes × costo_por_generación

REGLA: costo de IA por usuario Pro < 20% del precio de suscripción
Ejemplo: Pro a $15/mes → costo de IA máximo ~$3/mes/usuario
```

Si el número no cierra, las palancas son (en orden):
1. Usar un modelo más barato para tareas simples (clasificar, resumir → modelo pequeño)
2. Limitar max_tokens al mínimo necesario
3. Cachear resultados idénticos
4. Convertir "ilimitado" en fair-use (ej: 500/mes, invisible para el 95% de usuarios)
5. Subir el precio

### Tabla de Pricing

```markdown
|                    | Free          | Pro ($X/mes)       | Anual ($Y/año)     |
|--------------------|---------------|--------------------|--------------------|
| [Feature core]     | 3/día         | Ilimitado          | Ilimitado          |
| [Feature 2]        | Básico        | Avanzado           | Avanzado           |
| Historial          | 7 días        | Ilimitado          | Ilimitado          |
| Exportación        | Con watermark | Profesional        | Profesional        |
| Personalización IA | —             | ✅                 | ✅                 |
| Soporte            | —             | Email              | Email + Prioritario|
| Precio             | $0            | $X/mes             | $Y/año (ahorra Z%) |
```

---

## Paso 4: Métricas Objetivo

Define los KPIs que indicarán si la app va bien.

```markdown
## MÉTRICAS OBJETIVO — [Nombre de la App]

### Activación
- Definición: [qué cuenta como "usuario activado"]
- Objetivo: >60% de registros completan la primera acción de valor

### Retención
- D1 (día siguiente): >40% vuelve
- D7 (semana): >20% vuelve
- D30 (mes): >10% vuelve

### Conversión Free → Pro
- Objetivo: 3-8% de usuarios gratuitos convierten a pago (rango de checkout integrado/app store —
  con checkout web de Hotmart, aplicar el descuento del puente de 02C; freemium web mediana ~2.1%)
- Trigger de conversión: [qué evento dispara la necesidad de pagar]

### Churn Mensual
- Objetivo: <8% mensual (meta aspiracional; para MODELAR el LTV usa el churn realista 10-20% de `40-UNIT-ECONOMICS.md`)
- Señales de riesgo: [qué comportamiento indica que el usuario va a cancelar]

### Time to Value
- Objetivo: <60 segundos desde primer uso hasta primer resultado útil
```

---

## Entregable de Fase 1

El documento completo incluye:
1. Ficha de Viabilidad con los 5 tests
2. Estrategia de Retención con mecanismos definidos
3. Tabla de Pricing
4. Métricas Objetivo

### Criterios de Salida de Fase 1
- [ ] **GATE DE DEMANDA pasado (Paso 0): señal de pago real (≥8-10% clic-a-checkout y/o ≥1-2 pagos por ~100 visitas), ≥4/5 entrevistas con WTP viable o ≥3 clientes concierge que pagaron y usaron — o mini-gate fake-door en paralelo si vino por FLUJO A (el arbitraje valida el problema, no el pago); con los kill criteria escritos ANTES de validar**
- [ ] Los 5 tests de viabilidad pasan (o los ajustes están hechos)
- [ ] Al menos 2 mecanismos de retención definidos con implementación concreta
- [ ] Pricing definido con tiers claros
- [ ] Métricas objetivo establecidas
- [ ] El usuario aprobó todo lo anterior

→ **Siguiente: Cargar `03-PRINCIPIOS-APP-EXITOSA.md`**
