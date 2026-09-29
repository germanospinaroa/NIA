# COPY Y VISUALES DE CONVERSION — Landing, Onboarding y Paywall que Venden

> **Cuándo cargar este archivo:**
> - SIEMPRE que se construya o revise una pagina de ventas, onboarding, paywall, checkout, pricing o pantalla de upgrade.
> - Junto con `19-PAGINA-DE-VENTAS.md`, `02B-ONBOARDING-Y-PAYWALL.md`, `50-DISENO-ONBOARDING-PAYWALL.md`, `42-UX-WRITING.md` y `DESIGN-CORE.md`.
>
> **Por que existe:** una pantalla puede cumplir medidas, compilar y verse "bonita", pero no vender. Este archivo convierte neuromarketing etico, copywriting de respuesta directa y CRO en reglas operativas para que el agente no entregue textos largos, visuales tibios ni sellos vagos como "garantia visible".

---

## LO QUE SE APRENDIÓ VENDIENDO DE VERDAD (correcciones con evidencia, no teoría)

Cinco cosas medidas en una app real con tráfico pagado. Cada una corrige un error que **parecía
buena práctica** hasta que los números dijeron lo contrario.

### 1. El MECANISMO no es la PROMESA (el error de copy más común en apps de IA)
```
❌ "Te damos el paso que sigue"        → describe el motor
✅ "Resuélvelo tú, sin que nadie te lo dé"  → describe el deseo
```
Nadie desea un algoritmo, un plan adaptativo ni una recomendación personalizada. Desea el **estado
final**. El mecanismo va DEBAJO, como la razón de por qué esta promesa sí es creíble — y suele ser lo
único que la competencia no puede copiar, así que no se tira: se subordina. Detalle en `42-UX-WRITING`.

### 2. El precio nunca aparece desnudo
Un número sin nada al lado se juzga **contra cero**. Medido: cuando la única cifra visible antes del
checkout era el total anual, 2 de cada 3 personas abandonaban en el último paso.
```
Junto a CADA aparición del precio va, en la misma frase:
  · la unidad chica (equivalente mensual o diario), Y
  · el cobro real, sin esconderlo
  · y cerca, un ancla externa que el comprador YA conoce y ya descartó por cara
    ("una hora de [alternativa] cuesta más que 2 meses de [producto]")
```
⚠️ La equivalencia mensual **nunca sustituye** al total: lo acompaña. Esconder el total lo convierte
en una sorpresa en el checkout, que es la causa #1 de abandono documentada (Baymard, ~48%, informe 2024).

### 3. La garantía tiene que durar MÁS que la prueba gratis
Si coinciden, durante la prueba no hay nada que devolver y el día del primer cobro la garantía ya
venció: **cobertura real CERO**. Es una promesa incumplible en la peor pantalla posible. Regla dura y
tabla completa en `18-VENTA-HOTMART`.

### 4. Un aviso que empieza con "no te asustes" instala el susto
Se probó una pantalla intermedia antes del checkout que explicaba, con honestidad, lo que la persona
vería después ("va a aparecer el precio del año, no te asustes"). **Solo 1 de cada 3 la cruzaba.** El
paso pensado para calmar se comía a dos de cada tres.
```
Regla: nombrar un miedo que el usuario todavía NO tiene, se lo instala.
Si hay que anticipar algo incómodo, se dice en positivo y sin pedir un clic extra:
  ❌ "La página que sigue te va a mostrar el precio del año. No te asustes."
  ✅ "Hoy no pagas nada · cancelas cuando quieras · N días de garantía"  (pegado al botón)
```

### 5. Personalizar con lo que la persona ELIGIÓ, no con lo que le pediste
El dato que más personaliza no es el nombre: es **lo que acaba de elegir o lograr** (su tema, su
objetivo, su resultado). Ese ya lo tienes sin pedir nada.
```
✅ "Empieza a dominar [lo que ELIGIÓ] desde hoy"     → cero fricción, alta personalización
⚠️ "[Nombre], empieza a…"                            → exige pedir el nombre antes
```
Medido: la pantalla que pedía nombre y correo antes del precio **expulsaba al 70%** de quien llegaba
a ella. Se eliminó y el titular conservó la personalización por elección. **Antes de pedir un dato
para personalizar, comprobar si ya tienes uno mejor que no cuesta nada.**

> ⚠️ Y si el dato viene del usuario, se presenta con cuidado: capitalizar iniciales, concordancia
> gramatical con el valor real, y nunca truncarlo con puntos suspensivos (`42-UX-WRITING`).

---

## 0. Fuentes y criterio

Referencias usadas para esta capa:
- RevenueCat: los paywalls son pantallas de revenue donde detalles pequenos pueden mover resultados de forma grande; recomienda optimizar placement, presentacion de valor, plan/pricing y transparencia.
- CXL: una landing debe tener una accion principal, headline orientado a beneficio, copy claro/conciso y message-match con la promesa que trajo al visitante.
- Nielsen Norman Group: el copy digital debe ser escaneable, conciso y escrito para el contexto/necesidad del usuario.
- Baymard: la confianza de pago no se resuelve con un icono generico; la percepcion de seguridad depende de como se ve y se entiende el area sensible.

**Traduccion al SO:** primero se escribe el argumento de venta, luego se diseña. Nunca al reves.

---

## 1. Regla madre: la pantalla vende una decision, no una feature

Antes de diseñar landing, onboarding o paywall, completar esta frase:

```
El usuario viene de [momento] con [dolor/deseo].
La pantalla debe hacerlo creer y sentir: "[creencia nueva]".
La unica accion que queremos es: [accion primaria].
Si no actua, la perdida honesta es: [perdida real, sin culpa].
```

Ejemplo para Foco Diario AI:

```
Viene de ver su primer plan.
Debe creer y sentir: "si no lo guardo, vuelvo al caos manana".
Accion primaria: desbloquear/guardar mi plan.
Perdida honesta: el plan queda como preview temporal y no podra replanificar ni ver historial.
```

Si esta frase no existe, el agente NO diseña. Primero define el argumento.

---

## LA FUENTE DE TODO COPY: FICHA-AVATAR.md (leer ANTES del proceso de headline)

Las plantillas de este archivo GENERAN y las 4 U's VALIDAN — pero la materia prima (dolores, deseos, objeciones, lenguaje literal del avatar) NO sale de la imaginación: sale de `FICHA-AVATAR.md` en la raíz del proyecto (fundamento y protocolo: `57-AVATAR-Y-CONSCIENCIA.md`).

```
REGLA 1 — SIN FICHA NO HAY COPY: si FICHA-AVATAR.md no existe o no está aprobada,
  PARAR y completarla primero (protocolo del 57). Prohibido escribir landing/onboarding/
  paywall "mientras tanto".

REGLA 2 — LAS 10 VARIANTES SE GENERAN COMBINANDO: cada variante del PROCESO OBLIGATORIO
  = 1 plantilla del swipe file × 1 deseo o dolor DE LA FICHA (variar el campo, no solo
  la plantilla: deseo tangible #1, dolor #1, identidad, objeción de oro, pérdida).
  El nivel de consciencia y la etapa de sofisticación de la ficha deciden el ángulo
  (tabla de abajo + 57 §6) ANTES de generar.

REGLA 3 — EL TEST DE TRAZA (test final de CADA pieza, no solo headlines): "¿a qué campo
  de la ficha se traza esto?" Si un bullet, sección o CTA no se puede trazar a un dolor,
  deseo, objeción o frase literal de la ficha → es relleno corporativo → reescribir.
  La tabla de mapeo campo→pieza vive en 57 §9.

REGLA 4 — DIALECTO: mono-país → se escribe en SU dialecto (léxico local de la ficha);
  multi-país → español neutro con léxico verificado en la Fuente 2 de ≥2 países.
```

---

## 1bis. FORMULA DE TITULAR — las 4 U's (obligatoria antes de escribir cualquier headline)

El error mas comun no es un titular "aburrido" — es un titular que cumple el limite de palabras pero no tiene ninguna palanca de persuasion. Antes de escribir un headline de hero, paywall u oferta, pasarlo por las **4 U's** (Michael Masterson / AWAI — Masterson es el seudónimo de Mark Ford: la misma persona):

```
UTIL         -> promete un beneficio real y concreto (esto pesa mas que las otras 3).
URGENTE      -> da una razon para actuar YA, no "algun dia" (ancla temporal real, nunca falsa).
ULTRA-ESPECIFICO -> numero o hecho preciso, no una afirmacion vaga.
UNICO        -> una razon por la que esto no es intercambiable con la competencia.

Prioridad si hay que elegir: UTIL > URGENTE > UNICO > ULTRA-ESPECIFICO.
```

Ejemplo trabajado (Foco Diario AI):
```
SIN formula:  "Convierte tu caos mental en 3 prioridades"
              -> cumple <8 palabras, pero es generico: cualquier app de productividad podria decirlo.

CON las 4 U's: "Tu plan de hoy, listo en 3 minutos — antes de tu primer cafe"
  Util: "tu plan de hoy" (resultado, no feature)
  Ultra-especifico: "3 minutos" (numero real, verificable)
  Urgente: "antes de tu primer cafe" (ancla temporal cotidiana, real — no inventa un plazo falso)
  Unico: enmarca la app como ritual matutino, no como gestor de tareas mas
```

Combinar con el **nivel de consciencia del visitante** (Schwartz, *Breakthrough Advertising*, 1966). Son 5 niveles — no 4 — y deciden el ángulo del titular:
```
1. COMPLETAMENTE INCONSCIENTE -> ni siquiera sabe que tiene un problema con nombre. El titular
   NO puede vender ni nombrar el producto: entra por la IDENTIDAD o una escena vivida que el
   lector reconoce como suya ("¿otra vez las 11pm y el post de mañana sin hacer?").
2. CONSCIENTE DEL PROBLEMA    -> vive el dolor pero no sabe que existe solución. El titular
   nombra el DOLOR con detalle vívido y agita (PAS) antes de prometer nada.
3. CONSCIENTE DE LA SOLUCIÓN  -> sabe que existen "apps para esto", no conoce la tuya. El titular
   promete el RESULTADO + insinúa el MECANISMO que lo hace distinto.
4. CONSCIENTE DEL PRODUCTO    -> conoce tu app pero no ha comprado. El titular se DIFERENCIA
   y responde la objeción principal (por qué esta y no la que ya vio).
5. EL MÁS CONSCIENTE          -> ya te conoce y solo le falta una razón para actuar HOY. El titular
   va DIRECTO a la OFERTA: precio, bono, deadline de fundadores.
```

**TABLA: nivel de consciencia → cómo cambia el ÉNFASIS de la landing** (el ORDEN de las 10 secciones canónicas del 19 NO cambia nunca — el nivel decide el largo/profundidad de cada sección, el ángulo del hero y dónde aterriza cada tráfico; es la extensión del message-match de `19`):

| Nivel | Hero abre con | Sección de problema | Largo de página | Oferta/precio | Dónde aterriza |
|---|---|---|---|---|---|
| 1. Completamente inconsciente | Escena/identidad, sin producto | LARGA: educar + agitar (2-3 secciones) | La más larga del sistema | Al final, tras construir todo el deseo | Contenido orgánico frío (TikTok descubrimiento) |
| 2. Consciente del problema | El dolor nombrado con detalle | Larga: agitación + costo de no resolver | Larga | Después del mecanismo y la prueba | Ads fríos por interés/dolor |
| 3. Consciente de la solución | Resultado + mecanismo bautizado | Corta: 1 sección de contraste | Media | A mitad de página, con anclaje | Búsqueda ("app para X"), comparativas |
| 4. Consciente del producto | Diferenciador + prueba | MÍNIMA: 1-2 preguntas de recordatorio (nunca se elimina la sección) | Corta | §6 compacta + la objeción #1 respondida en el hero | Retargeting, visita repetida |
| 5. El más consciente | La OFERTA misma (precio, bono, deadline) | Mínima: 1 pregunta puente | La más corta (cada sección en su versión mínima) | §6 con máximo protagonismo; el hero ya nombra la oferta | Email a la lista, oferta de fundadores |

Regla operativa: ANTES de escribir la landing, declarar en 1 línea el nivel del tráfico principal (viene de `34-ADQUISICION-Y-TRAFICO.md`) y anotarlo en ESTADO.md. Tráfico frío (niveles 1-2) = página larga que educa y agita; tráfico caliente (niveles 4-5) = oferta arriba y página corta. Si la landing recibe AMBOS, se diseña para el nivel 2-3 y el tráfico caliente llega por variante/ancla directa a la oferta — nunca un hero genérico "para todos" (ver el message-match de `19`).

---

## SWIPE FILE — PLANTILLAS Y EJEMPLOS (el motor de generación, no solo de validación)

Las 4 U's VALIDAN un titular; este swipe file lo GENERA. Prohibido escribir headlines "de la nada": se parte de estas plantillas clásicas de respuesta directa (Schwartz/Halbert/Caples, adaptadas al español LATAM), se rellenan con los datos REALES del proyecto (mecanismo bautizado de `19`, números verificables, avatar) y recién entonces se pasan por las 4 U's y el PROCESO OBLIGATORIO de abajo.

### Las 10 plantillas base (fill-in-the-blank)

```
1. CÓMO SIN AUNQUE:      "Cómo [resultado] sin [dolor/método odiado] aunque [objeción #1]"
2. MECANISMO ANTES→DESPUÉS: "El [mecanismo bautizado] que convierte [estado antes] en [estado
                          después] en [tiempo concreto]"
3. RETO CON GARANTÍA:    "[Haz X / logra X] en [tiempo] o [garantía con nombre propio]"
4. PREGUNTA-DESAFÍO:     "¿[Pregunta que el avatar responde 'sí' con incomodidad]?"
                          Ej. estructura: "¿[N años/meses] haciendo [esfuerzo] y todavía sin [resultado]?"
5. TESTIMONIAL-HEADLINE: "«[Resultado específico en palabras del usuario]» — [nombre/perfil real]"
                          (SOLO con testimonio real y verificable — ver "prueba social en frío" de 19)
6. NÚMERO + BENEFICIO + MARCO TEMPORAL: "[N resultados concretos] en [tiempo], sin [esfuerzo esperado]"
7. ENEMIGO COMÚN:        "Deja de [método viejo que el avatar ya odia]. [Mecanismo] hace [resultado] por ti."
8. IDENTIDAD:            "Para [identidad específica del avatar] que quieren [resultado] sin [sacrificio]"
9. PÉRDIDA CUANTIFICADA: "Cada [período] sin [mecanismo] te cuesta [pérdida honesta de tiempo/claridad]"
                          (⛔ cuantificar TIEMPO o PROCESO, nunca ingresos/salud — regla 3 de copy de 19;
                          la pérdida PROPIA documentada del avatar SÍ se cuantifica — ver 19 §3;
                          lo vetado es prometer ingresos)
10. PREDICCIÓN CONCRETA: "[Hoy/esta semana] vas a tener [resultado tangible]. Esto es lo único que haces tú: [paso mínimo]."
```

Regla de uso: la plantilla es esqueleto, no producto final. Un headline que se nota "de plantilla" ("Cómo ahorrar tiempo sin esfuerzo aunque estés ocupado") falla las 4 U's por vago — el valor está en los DATOS reales que la rellenan.

### Headlines ejemplares por nicho (matriz A-F de `02C`), en dos temperaturas

FRÍO = tráfico de descubrimiento (niveles 1-2 de Schwartz): agita el dolor, no vende todavía.
CALIENTE = retargeting/email/lista (niveles 4-5): resultado + oferta directa.

```
A) EDUCACIÓN / APRENDIZAJE
   Frío:     "¿7 años de inglés y todavía no lo hablas?"                        (plantilla 4)
   Frío:     "Tu problema no es memoria: es estudiar sin hablar"                (plantilla 7)
   Caliente: "Tu primera conversación real con IA, en 3 minutos"               (plantilla 6)
   Caliente: "10 minutos de práctica hablada hoy — sin profesor ni vergüenza"  (plantilla 6)

B) BIENESTAR / MEDITACIÓN / SALUD MENTAL
   Frío:     "Duermes 8 horas y despiertas cansado igual"                      (plantilla 4, afirmativa)
   Frío:     "No te falta fuerza de voluntad. Te sobra ruido."                 (plantilla 7)
   Caliente: "Tu plan de calma de 7 días, listo en 2 minutos"                  (plantilla 6)
   Caliente: "Esta noche duermes distinto: primera sesión guiada gratis"       (plantilla 10)

C) FITNESS / NUTRICIÓN / TRACKING
   Frío:     "No abandonaste la dieta. Abandonaste el diario de 20 minutos."   (plantilla 7)
   Frío:     "¿Cuántas veces empezaste a registrar comidas… y hasta el jueves?" (plantilla 4)
   Caliente: "Foto a tu plato → calorías y macros en 10 segundos"              (plantilla 2)
   Caliente: "Tu plan de nutrición a tu medida, antes de tu próxima comida"    (plantilla 6)

D) IA CREATIVA / CONTENIDO
   Frío:     "3 horas por carrusel es demasiado. Deberían ser 4 minutos."      (plantilla 9)
   Frío:     "Tu competencia no crea más contenido que tú — lo genera"         (plantilla 7)
   Caliente: "Tu primer guion listo en 4 minutos. Pruébalo gratis."            (plantilla 6)
   Caliente: "30 días de contenido en una tarde — con TU voz"                  (plantilla 6)

E) PRODUCTIVIDAD / ORGANIZACIÓN
   Frío:     "Tu lista tiene 47 tareas. Hoy vas a hacer 3."                    (plantilla 4, afirmativa)
   Frío:     "No estás desorganizado: tu sistema pide más orden del que devuelve" (plantilla 7)
   Caliente: "Vuelca tu caos y recibe tus 3 prioridades en 3 minutos"          (plantilla 2)
   Caliente: "Tu semana planificada cada domingo en 5 minutos"                 (plantilla 6)

F) FINANZAS / DINERO
   Frío:     "Sabes cuánto ganas. No sabes a dónde se va."                     (plantilla 4, afirmativa)
   Frío:     "El presupuesto que abandonaste era demasiado rígido para un mes real" (plantilla 7)
   Caliente: "Tu radiografía financiera del mes, lista en 3 minutos"           (plantilla 6)
   Caliente: "Encuentra tus 3 fugas de dinero de este mes — diagnóstico gratis" (plantilla 6)
   (⛔ en finanzas JAMÁS prometer ganancias/retornos — regla del nicho F en 02C y claims de 47)
```

Estos ejemplos son CALIBRACIÓN de nivel, no textos para copiar: el headline real del proyecto se genera con las plantillas + los datos propios y se somete al proceso de abajo.

---

## PROCESO OBLIGATORIO DE HEADLINE (mínimo 10 variantes — nunca "el primero que salió")

El headline es la pieza con más apalancamiento de toda la landing (Ogilvy: por cada persona que lee el cuerpo, cinco leen el titular). Prohibido quedarse con el primer intento. El proceso, en orden y sin saltos:

```
PASO 1 — GENERAR: escribir MÍNIMO 10 variantes usando el swipe file (variar plantilla, no solo
         palabras). Mezclar ángulos: dolor, mecanismo, número, identidad, pérdida.
PASO 2 — PUNTUAR: tabla de las 4 U's, 0-3 puntos por U (0 = ausente, 3 = fuerte). Máximo 12.
PASO 3 — ELEGIR: la de mayor puntaje. Empate → gana la más ÚTIL (prioridad de 1bis).
PASO 4 — TEST DEL BAR: ¿le dirías esa frase en voz alta a un amigo en un bar, sin vergüenza?
         Si suena a anuncio de los 90 o a robot corporativo → reescribir conservando el fondo.
PASO 5 — TEST DE INTERCAMBIABILIDAD: ¿podría firmarla un competidor tal cual? Si sí, no tiene
         mecanismo/ángulo propio → inyectar el mecanismo bautizado (19) o el dato específico y repuntuar.
```

### Ejemplo del proceso COMPLETO (app de fitness/nutrición tipo "foto → análisis", mecanismo bautizado: "el Escáner de Plato")

| # | Variante | Útil | Urgente | Ultra-esp. | Único | Total |
|---|---|---|---|---|---|---|
| 1 | "Controla tu nutrición fácilmente" | 2 | 0 | 0 | 0 | 2 |
| 2 | "La app de nutrición con IA más completa" | 1 | 0 | 0 | 0 | 1 |
| 3 | "Foto a tu plato, calorías en 10 segundos" | 3 | 1 | 3 | 2 | **9** |
| 4 | "Deja de escribir lo que comes: fotografíalo" | 2 | 1 | 1 | 2 | 6 |
| 5 | "Registra tu comida en 10 segundos, no en 10 minutos" | 3 | 1 | 3 | 1 | 8 |
| 6 | "Tu nutricionista de bolsillo, disponible 24/7" | 2 | 0 | 0 | 0 | 2 |
| 7 | "El Escáner de Plato: tu cámara ahora cuenta calorías" | 2 | 0 | 1 | 3 | 6 |
| 8 | "Come mejor sin pesar, medir ni anotar nada" | 3 | 0 | 1 | 2 | 6 |
| 9 | "10 segundos por comida. Ese es todo el esfuerzo." | 2 | 1 | 3 | 1 | 7 |
| 10 | "La foto de tu almuerzo sabe más que tu diario" | 2 | 0 | 1 | 2 | 5 |

```
PASO 3: gana la #3 (9/12).
PASO 4 (bar): "foto a tu plato, calorías en 10 segundos" — sí se dice en voz alta sin vergüenza. Pasa.
PASO 5 (intercambiabilidad): MyFitnessPal o Cal AI podrían firmarla → FALLA. Corrección: inyectar
   el mecanismo bautizado de la #7 en la ganadora:
   FINAL: "Escanea tu plato: calorías y macros en 10 segundos" (Útil 3 · Urg 1 · UE 3 · Único 3 = 10/12)
```

Las 10 variantes puntuadas van al reporte de cierre de la landing (evidencia del proceso, no solo el resultado). Este mismo proceso aplica al headline del PAYWALL (ver `50` → C2).

---

## 2. Copy de respuesta directa: formula obligatoria

Toda landing y paywall deben tener un bloque de copy con esta secuencia:

```
1. DOLOR ESPECIFICO: nombra la escena que el usuario ya vive.
2. MECANISMO: explica por que esta app resuelve distinto.
3. RESULTADO: muestra el estado deseado.
4. PRUEBA/DEMO: demuestra con UI real, ejemplo real o dato verificable.
5. OFERTA: que desbloquea, cuanto cuesta y por que ahora.
6. REVERSIBILIDAD: como reduce riesgo, sin prometer lo que aun no existe.
7. ACCION: CTA en primera persona o consecuencia clara.
```

### Reglas de longitud

```
Headline landing/paywall: 8-10 palabras maximo (<8 ideal).
Subheadline: max 2 lineas en mobile; si pasa de 2 lineas, cortar o mover a bullets.
Bullets: en paywall max 3 (un 4º SOLO si responde una objecion de la FICHA-AVATAR);
  max 5 en landing. Cada bullet <12 palabras.
Parrafos de venta: max 2 lineas en mobile. Si son 4 lineas, fallan.
Una pantalla de conversion no usa parrafos para convencer: usa contraste, visual y bullets.
```

### PRESUPUESTO DE COPY — límites duros, auto-auditables (no "aproximadamente corto")

El error real detectado: un subtítulo de 35 palabras "sonaba bien" al escribirlo pero ocupó 5 líneas
en mobile — la regla "máx 2 líneas" existía en prosa pero nadie la contó en palabras. De ahora en
adelante, ANTES de dar por escrita cualquier pieza, contar las palabras contra esta tabla (español
LATAM, tipografía display/body de 16-18px, viewport 375px):

```
Headline hero/paywall:        máx 8-10 palabras, <8 ideal (ya definido arriba, 4 U's)
Subheadline (hero/sección):   máx 12-14 palabras EN TOTAL — si al escribirla se siente "necesito
                               una coma más", es señal de cortarla en 2 oraciones de 6-7 palabras
                               cada una, NUNCA una sola de 20+.
Bullet / beneficio:            máx 10-12 palabras. Si no cabe, el beneficio está mal recortado.
Párrafo de sección (cualquiera): máx 2 líneas en mobile (~14-18 palabras). Si necesita más,
                               partirlo en 2 párrafos cortos o convertirlo en 2-3 bullets.
Card de "problema"/"diferenciación": 1 frase de 8-12 palabras, NUNCA una oración compuesta con
                               "pero", "sin embargo" Y una consecuencia todo junto.
```

Regla de auto-chequeo: contar las palabras de CADA subheadline/párrafo antes de continuar. Los
límites de la tabla son el estándar: si una pieza los excede, se corta — SALVO justificación de
claridad anotada en el reporte de cierre (la promesa clara gana al conteo, pero la excepción se
documenta, no se asume). Esta tabla aplica a TODA pantalla de venta (landing, onboarding,
paywall), no solo al hero.

### QUÉ PALABRA SE RESALTA (regla de énfasis — el copy se entrega MARCADO)

Se resalta la que VENDE: el beneficio, el número o la transformación — trazable a la FICHA-AVATAR
(deseo o dolor). Nunca artículos, nunca "tu", nunca el nombre del producto (salvo hero de marca).
El copy se entrega MARCADO: el redactor indica `[acento]palabra[/acento]` y `[b]palabra[/b]` —
el diseño no adivina qué resaltar. La ejecución visual (titular bold completo + palabra clave en
acento; subtitular con 2-4 semibold) es la JERARQUÍA DE ÉNFASIS de `55`.

### EXCEPCIÓN — respuestas de FAQ (contenido bajo demanda, no copy de venta directa)

Las respuestas de FAQ se expanden solo si el usuario toca la pregunta — no compiten por atención
como un subtítulo. Se les permite algo más de aire: **máx 2 oraciones cortas, ~18-22 palabras
totales**, nunca una sola oración compuesta de 25+ palabras con 2-3 ideas encadenadas. Igual se
cuentan las palabras — "más margen" no es "sin límite".

### PASADA FINAL DE AUTO-AUDITORÍA (obligatoria antes de declarar CUALQUIER pantalla de venta lista)

El error real detectado: cada sección se revisó al escribirla, pero nadie hizo una pasada COMPLETA
al final — así sobrevivieron bullets de 16 palabras en una sección ya "aprobada". Antes de cerrar
landing/onboarding/paywall, recorrer la pantalla de ARRIBA A ABAJO una vez más, sección por sección,
y para cada una: (1) contar palabras de cada headline/subheadline/bullet/párrafo contra el
PRESUPUESTO DE COPY, (2) verificar que tiene al menos un elemento visual (DENSIDAD VISUAL), (3)
verificar placeholders donde falte un asset real. Esta pasada es un paso aparte, DESPUÉS de terminar
de escribir todo — no se puede confiar en que "ya se revisó cada parte por separado".

### DENSIDAD VISUAL — ninguna sección solo de texto

Una landing que se siente "poco vendible" casi siempre tiene el mismo síntoma: párrafos y cards de
puro texto, sin nada que el ojo pueda "ver" antes de leer. Regla dura: **ninguna sección puede ser
3+ bloques de texto seguidos sin un elemento visual** (ícono, mockup, foto/video — real o
placeholder, ver abajo). Antes de cerrar una sección, contar: ¿hay algo que mirar, o solo párrafos?
Si es solo texto, agregar un ícono por card (mínimo) o un mockup/visual de apoyo.

### PLACEHOLDER DE ASSET REAL — cuando la IA no puede generar la foto/video (obligatorio usarlo, nunca dejarlo en blanco)

Distinto de los "mockups honestos" de `19` (que son UI/mecanismo simulado en HTML/CSS): esto es para
material que requiere una CÁMARA real — foto del fundador, video de 30-60s contando la historia,
foto de un usuario beta, captura de pantalla del producto ya en producción. La IA NO puede crear
estos, y dejarlos vacíos o rellenarlos con una ilustración generica es peor que ser honesto:

```
PATRÓN: caja con borde punteado (dashed), ícono (Image/Video/Camera de lucide), y 1 línea de
  instrucción de qué debe grabar/subir el usuario ahí — nunca vacío sin explicación.
  Ej: "🎥 Video de 30-60s contando por qué creaste esta app — reemplaza este espacio cuando lo grabes."
  Ej: "📸 Una foto tuya usando la app en tu escritorio — reemplaza este espacio."

DÓNDE usarlo (prioridad, no todos a la vez): historia del fundador (cerca de la prueba social en
  frío), foto/video de producto real cuando exista una versión productiva, testimonio con foto real
  cuando exista un beta tester dispuesto (nunca antes — ver "PRUEBA SOCIAL EN FRÍO" en 19).

NUNCA: dejar un div vacío sin ícono ni texto, ni rellenar con una ilustración de stock genérica que
  aparente ser el asset real.
```

### Enfasis visual dentro del copy

Usar negritas o acento SOLO en palabras que cambian la decision:

```
✅ "Guarda tus **3 prioridades** y replanifica cuando el dia cambie."
✅ "Vuelve mañana con tu **historial listo**, no con otra lista en blanco."
❌ "Pro desbloquea guardado, replan ilimitado e historial completo para no perder esta claridad mañana."
```

Regla: en mobile, el usuario debe poder escanear solo las palabras en negrita/acento y entender la oferta.

### Metodo "Fascinations" para bullets (Mel Martin/AWAI; popularizadas para web por Copyhackers) — evitar el bullet plano

Un bullet que solo lista una feature ("Historial de 30 dias") no vende. Una "Fascinacion" es una promesa audaz y ultra-especifica que toca el problema o el resultado sin revelarlo del todo — genera curiosidad, no solo informa:

```
CONSTRUCCION (orden invertido del intuitivo): el BENEFICIO en negrita abre el bullet como gancho,
la feature lo respalda como mecanismo/prueba despues.
  ❌ orden intuitivo:  "Historial completo — para que veas tus ultimos 30 dias"
  ✅ Fascination:      "**Descubre que tarea repites hace 3 semanas sin darte cuenta** — tu historial
                        completo lo muestra."

VARIAR EL LARGO: bullets todos del mismo tamano se leen como relleno generado, no como copy real.

ORDEN DE FUERZA: el bullet mas fuerte va PRIMERO, el segundo mas fuerte va AL FINAL (primacia/
recencia) — los bullets mas debiles se esconden en medio ("sandwich").
```

Fuente: copyhackers.com — método de bullet lists y "Fluff to Stuff" (cortar el calentamiento, ir directo a lo que el lector necesita).

---

## 2bis. PATRONES VALIDADOS DE APPS GANADORAS (evidencia real, no teoria)

Antes de disenar onboarding/paywall, revisar que patron de estos ya esta probado a escala real — no reinventar lo que Duolingo, Cal AI, Tiimo, Flo o Asana ya midieron con millones de usuarios. Cada patron cita su fuente; si un numero no esta documentado publicamente, se dice explicitamente (no se inventa).

```
1. REGISTRO DESPUES DEL PRIMER VALOR REAL (no antes)
   Duolingo pospuso el registro hasta DESPUES de la primera leccion completada -> +20% en
   retencion D1 (Lenny's Newsletter / Jorge Mazal, ex-growth lead). Flo hizo lo mismo con datos
   biograficos antes de pedir cuenta. Regla: si tu app puede dar una primera victoria SIN cuenta,
   hazlo — el registro se siente como "guardar lo que ya gane", no como una puerta de entrada.

2. EL PAYWALL LLEGA DESPUES DEL "AHA", NUNCA ANTES
   Cal AI oculta el precio hasta que el usuario ve su plan de calorias personalizado (el resultado
   de su propio cuestionario). Tiimo movio el paywall a la pantalla 3-4, justo tras la
   personalizacion. Ninguna app ganadora cobra ANTES de mostrar el resultado hecho a medida.

3. LARGO DE ONBOARDING SEGUN SI PERSONALIZA UN RESULTADO O ES UNA HERRAMIENTA DE VALOR OBVIO
   Cal AI: ~20-28 pantallas, 15s-2.5min (personaliza un plan nutricional completo).
   Tiimo: 14 pasos totales pero solo 2 preguntas de quiz (simplificado en 2025, antes tenia 3 con
   copy confuso — la simplificacion mejoro la claridad del paywall). Confirma la regla ya existente
   de 02B: bienestar/personalizacion = mas largo: utilidad obvia = mas corto.

4. PREGUNTA DE ATRIBUCION QUE DOBLA COMO INVESTIGACION DE MERCADO
   Cal AI pregunta "como nos conociste" durante el onboarding — sirve de dato de marketing INCLUSO
   si el usuario abandona antes de registrarse (screensdesign.com / Figma community breakdown).
   Agregar esta pregunta cuando el canal de adquisicion no este ya instrumentado por otra via (ver 36).

5. AUTOCOMPLETAR / "SUGERIR POR MI" PARA BAJAR LA FRICCION DE DECISION
   Tiimo pre-puebla rutinas sugeridas (manana/tarde/noche) con un boton "Suggest for me" en vez de
   forzar al usuario a construir todo desde cero (screensdesign.com). Aplicable directo a cualquier
   app que pida al usuario "crear su primer X": dar un ejemplo pre-llenado editable, no un lienzo vacio.

6. RITUAL DE MICRO-COMPROMISO INMEDIATAMENTE ANTES DEL PAYWALL
   Flo usa un gesto de "mantener presionado" para afirmar intencion justo antes de mostrar el precio
   (retention.blog / Adapty paywall library) — convierte la auto-reflexion en compromiso antes de pedir
   la tarjeta. Cal AI intercala pantallas de afirmacion/beneficio entre preguntas para sostener el
   compromiso. Esto es Cialdini (compromiso y consistencia) aplicado como INTERACCION, no solo como copy.

7. PAYWALL CONTEXTUAL SEGUN DE DONDE VINO EL USUARIO, NO UNA SOLA PANTALLA GENERICA
   Duolingo tiene al menos 7 puntos de paywall distintos en la app, y el mensaje CAMBIA segun el
   punto de entrada (desde la tienda enfatiza corazones ilimitados; desde un anuncio, enfatiza quitar
   anuncios) — RevenueCat blog, "How top apps approach paywalls". Si tu app tiene mas de un momento de
   friccion que lleva al paywall, el copy de cada uno debe nombrar ESA friccion especifica, no un
   mensaje generico de "hazte Pro".

8. LA RETENCION SE CONSTRUYE EN EL LOOP CENTRAL, NO SE AGREGA ENCIMA
   Flo retiene porque el LOG DIARIO (sintomas, animo) es a la vez la accion de valor y el dato que
   mejora la prediccion — retencion y valor son la MISMA accion, no una funcion aparte. Mismo
   principio en Duolingo (la leccion diaria es valor Y racha a la vez). Diseñar el loop central de
   la app (24-GAMIFICACION) para que usar la app sea, en si mismo, lo que la hace mejor mañana.

9. INVERTIR EN RETENER A QUIEN YA ESTA, NO SOLO EN ADQUIRIR
   El giro de crecimiento de Duolingo (2018-2021) vino de un modelo interno que encontro que la
   retencion de usuarios EXISTENTES (CURR) tenia 5x el impacto de adquisicion o reactivacion —
   la app crecio 4.5x en DAU priorizando streaks/ligas/notificaciones sobre gastar mas en ads
   (Lenny's Newsletter). Para decisiones de roadmap: un punto de mejora en retencion vale mas que
   uno en adquisicion.

10. LA VENTAJA INJUSTA SUELE SER UNA COMBINACION SECUENCIADA, NO UN SOLO TRUCO
    Cal AI: (a) sembrar 150+ micro-influencers organicos hasta que "no se sintiera como anuncio" ->
    (b) recien ENTONCES escalar con ads pagados de alto gasto -> (c) despues afiliados. Cada capa se
    activo solo cuando la anterior probo el funnel (growthcurve.co). No hay atajo: escalar publicidad
    paga ANTES de validar organico quema presupuesto sobre un mensaje que no convierte.

11. IDENTIDAD/EXPERIENCIA VIVIDA COMO MOAT (no solo buen UX)
    Tiimo es construida por un equipo con miembros neurodivergentes que disenan "lo que ellos mismos
    necesitan" — un moat de identidad, no una feature copiable (tiimoapp.com/resource-hub). Conecta
    directo con el PASO 0.45 "mundo del sujeto" de `16-DIRECCION-DE-ARTE.md`: la app que gana no es
    la mas pulida, es la que entiende el problema desde adentro.

12. EMPTY STATES CON PLANTILLAS SEGUN EL ROL/CONTEXTO DEL USUARIO
    Asana muestra 3 plantillas de proyecto segun el rol que el usuario indico al registrarse, cada
    una con una vista previa de como se ve ya lleno, y el CTA "Crear tu primer proyecto" visible de
    inmediato (CTO Magazine / analisis de PLG). Un empty state generico pierde esta oportunidad de
    personalizacion inmediata.

12bis. AUTORIDAD DEL PAYWALL CON TU PROPIA INVESTIGACION DE MERCADO (dato ya validado, cero esfuerzo extra)
    El reporte de validacion de la Sesion 1 (`02-VALIDACION.md`) ya identifico apps de referencia
    con metricas reales (ARR, usuarios, reseñas). Ese MISMO dato citado en el paywall es autoridad
    de Cialdini gratis: "[App de referencia] hizo $X/año con este mismo mecanismo" — real, ya
    investigado, no una afirmacion nueva que inventar. Ejemplo: una app de habitos anti-culpa cita
    "Finch, la app que tambien se niega a castigar un mal dia, llego a $30M/año" — dato de la propia
    investigacion de mercado, cero esfuerzo extra, autoridad instantanea. Regla: SOLO si el dato es
    real y ya fue verificado en la Sesion 1 — nunca inventar una cifra de un competidor para sonar
    creible.
    Validación social en el flujo: +3% free→paid medido en Headspace (Sub Club 2026) — modesto pero
    consistente; el número absoluto grande ("3,6M de personas") es el formato que Noom usa.
```

### ADVERTENCIA ETICA CON EVIDENCIA REAL (que NO copiar)

En abril de 2026, Apple retiro temporalmente Cal AI de la App Store por diseño de facturacion enganoso: el precio por semana se mostraba mas prominente que el monto real cobrado, el toggle de prueba gratis ocultaba el auto-renovar, y rechazar la oferta inicial disparaba un segundo flujo de compra distinto (un patron de "downsell" oscuro) — TechCrunch, MacRumors, 9to5Mac, abril 2026. La app fue restaurada tras corregirlo. **Esto confirma con un caso real y reciente** por que este SO prohibe sellos vagos y patrones oscuros (ver seccion 5): la escala que ganaron Cal AI/Duolingo/Flo vino de reducir friccion honesta, no de ocultar el precio. Un dark pattern puede funcionar semanas y despues cuesta la cuenta completa.

---

## 3. Visuales que venden: no basta una card bonita

Un visual de conversion debe hacer una de estas cinco cosas:

```
A. CONTRASTE: antes caotico vs despues claro.
B. PÉRDIDA HONESTA: que se pierde si no continua.
C. VALOR DESBLOQUEADO: que aparece al pasar a Pro.
D. PROGRESO: de donde esta a donde puede llegar.
E. PRUEBA: producto funcionando con un caso concreto.
```

Si el visual solo muestra una UI bonita sin tension, no vende.

### Visuales permitidos en paywall

```
1. Antes/Despues compactado:
   Izquierda: lista caotica tachada / "otra mañana igual".
   Derecha: 3 prioridades + bloques + historial protegido.

2. Plan bloqueado con perdida honesta:
   Prioridad 1 visible.
   Prioridades 2-3 o historial con lock suave y texto: "Se guarda al desbloquear Pro".
   Prohibido blur excesivo que parezca truco barato.

3. Value stack visual:
   Tres filas con icono + resultado:
   "Guardar plan" / "Replan sin culpa" / "Historial semanal".
   Cada fila responde "que gano hoy".

4. Timeline de activacion:
   Hoy: guardar plan.
   Esta semana: 3 planes claros.
   Domingo: patron semanal.

5. Mini-demo:
   Input caotico -> 3 prioridades -> bloques.
   Debe caber en el primer viewport mobile o tener CTA fijo visible.
```

### Visuales prohibidos en paywall

```
❌ Card titulada "Preview de tu plan" sin tension de perdida o desbloqueo.
❌ Screenshot generico que no muestra que cambia al pagar.
❌ Iconos decorativos como "beneficios" sin producto real.
❌ Sellos vagos: "garantia visible", "pago seguro despues", "confianza".
❌ Textos internos de proceso: "esto se configurara en la fase de servicios externos" en UI publica.
```

---

## 4. Paywall: estructura de copy que debe salir por defecto

> **Propiedad del pilar paywall:** ESTRATEGIA y anatomía → `02B-ONBOARDING-Y-PAYWALL.md` · medidas/layout/motion → `50-DISENO-ONBOARDING-PAYWALL.md` · palabras/fórmulas de copy → `52-COPY-VISUALES-CONVERSION.md`. Este archivo cubre SOLO su parte.

### Above the fold a 375px

El primer viewport debe contener:

```
1. Barra superior de marca:
   logo + nombre de app -> link a `/`
   X/cerrar -> salida limpia

2. Headline:
   "Guarda tu plan antes de perderlo"
   o "Tu claridad de hoy puede quedarse"
   Max 8-10 palabras.

3. Subheadline de max 2 lineas:
   "Tus 3 prioridades quedan guardadas — y tu semana aprende de ti."
   (sujeto = el usuario y su resultado, no "Pro" haciendo cosas)

4. Visual de valor:
   elegir uno de los 5 visuales permitidos.

5. Plan recomendado + CTA visible:
   si el precio no aparece en el primer viewport mobile, debe existir CTA fijo inferior con precio.
```

### Formula exacta de paywall

> **FÓRMULA ÚNICA DEL HEADLINE (esta es la dueña — 02B y 50 remiten aquí):**
> `[META o MECANISMO del usuario] + [presencia o pérdida honesta]`.
> "Tu plan para [su meta] está listo" es válido PORQUE contiene la meta; "Guarda tu plan
> antes de perderlo" es válido PORQUE la pérdida es real (el plan construido). Lo prohibido:
> el tibio sin meta ni pérdida ("Tu plan está listo" a secas) y la pérdida inventada.
> (Es la misma reconciliación del gate de `50` C2/checklist: la META o el deseo/pérdida
> REAL es lo que separa el headline válido del tibio.)

```
Headline = FÓRMULA ÚNICA (arriba): meta/mecanismo + presencia o pérdida honesta.
Subheadline = 3 beneficios max, con palabras clave resaltadas.
Visual = muestra lo que se desbloquea o se pierde.
Plan recomendado = anual como $/mes + total anual visible.
CTA = "Guardar mi plan con Pro" / "Desbloquear mi plan".
Salida = "Ahora no" neutro, nunca culpa.
Trust = garantia real + pago seguro real + restaurar compra.
```

> **Variante de CTA a testear — "$0":** "Prueba por $0" / "Empieza hoy por $0" — Duolingo encontró
> que "Try for $0" convierte mejor que "Try free for 7 days" (Cem Kansu, CPO, Sub Club/RevenueCat
> 2026). El "$0" hace tangible lo gratis; A/B contra la fórmula de días.

### Ejemplo para Foco Diario AI

```
Headline:
Guarda tus 3 prioridades de hoy — mañana replanificas en un tap
(filmable y específica: se puede VER qué guarda y qué pasa mañana; "claridad" no se filma.
 11 palabras: excede el máx por claridad — excepción anotada, según Reglas de longitud)

Subheadline:
Con Pro guardas tus **3 prioridades**, replanificas imprevistos y ves tu **patron semanal**.

Bullets:
✓ Tu plan queda guardado para volver durante el dia
✓ Replan ilimitado cuando aparezcan urgencias
✓ Historial para detectar que postergas cada semana

CTA:
Guardar mi plan con Pro

Salida:
Ahora no, seguir con la version gratis
```

---

## 5. Garantia, seguridad y confianza: nombres concretos o no se muestran

Nunca escribir "garantia visible", "pago seguro" o "confianza" como si fueran placeholders.

```
SI existe garantia real:
✅ "Garantia Hotmart de 7 dias: si no te sirve, pides reembolso."
✅ "30 dias o te devolvemos tu dinero."

SI todavia no existe garantia:
✅ No mostrarla en UI publica.
✅ En notas internas: "Pendiente configurar garantia en Hotmart".
❌ "Garantia visible"
❌ "Garantia al lanzar"

SI existe pago real:
✅ "Pago procesado por Hotmart."
✅ "Checkout seguro de Hotmart."

SI todavia no existe pago real:
✅ El CTA de preview puede decir internamente "Preview sin cobro real", pero NO como copy final de venta.
```

Regla: confianza = institucion concreta + politica concreta + consecuencia concreta.

---

## 6. Navegacion de marca en el funnel

Toda pantalla de ventas/onboarding/paywall/login debe tener presencia de marca:

```
Landing: logo + nombre visible en header.
Onboarding: logo/nombre arriba; click lleva a `/` o abre confirmacion si perderia progreso.
Paywall: logo/nombre arriba + X visible; logo lleva a `/`, X vuelve al resultado/onboarding.
Login: logo/nombre arriba; link a `/`; copy explica por que se pide cuenta.
```

Prohibido que una pantalla del funnel se sienta desconectada de la app. El usuario debe saber siempre:

```
Donde estoy.
Que app es.
Como volver.
Que pasa si cierro.
```

---

## 7. Landing: visuales y copy de venta

La landing no debe limitarse a explicar la app. Debe construir deseo.

### Hero

```
Headline: resultado o perdida evitada, no descripcion.
Subheadline: max 2 lineas, con mecanismo y usuario.
Visual: demo/producto real mostrando antes->despues.
CTA: consecuencia exacta.
```

Ejemplo:

```
❌ "Decide que hacer hoy."
✅ "Convierte caos en 3 prioridades"
✅ "Deja de empezar el dia apagando incendios"
```

### Estructura de la landing

La estructura NO vive aquí: es la **ESTRUCTURA CANÓNICA de 10 secciones del `19`** (inmutable —
hero 4U's → problema en preguntas → agitación → mecanismo → carrusel → oferta → garantía → FAQ →
CTA final emocional → footer legal). Este archivo aporta el COPY de cada sección, nunca otra
estructura. Cada sección debe responder una pregunta mental del visitante:

```
¿Esto es para mi?
¿Me entiende?
¿Como funciona?
¿Por que deberia creerlo?
¿Que gano hoy?
¿Que pasa si no me sirve?
¿Que hago ahora?
```

---

## NEUROMARKETING APLICADO POR SECCIÓN (la palanca psicológica de cada bloque de la landing)

Cada sección de la ESTRUCTURA CANÓNICA de `19` existe para activar UNA palanca de decisión concreta. Al escribir o revisar una sección, verificar que SU palanca está trabajando (no otra, no ninguna). El fundamento (avatar, PNL ética, límites) vive en `57-AVATAR-Y-CONSCIENCIA.md` — aquí solo la aplicación:

| Sección (estructura de 19) | Sesgo / palanca | Cómo se ve trabajando |
|---|---|---|
| Hero (4 U's) | Saliencia + promesa concreta | El deseo tangible #1 de la ficha, con número, en <3 segundos de lectura |
| Problema (preguntas) | Reconocimiento propio (efecto "me leyó la mente") | Dolores #1-3 de la ficha en preguntas casi literales — el avatar asiente |
| Agitación | Aversión a la pérdida + costo de la inacción cuantificado | Dolor emocional #1 + "cada semana sin esto te cuesta [tiempo/proceso honesto]" |
| Mecanismo bautizado | Efecto novedad + razón-porqué | "Funciona porque…" — el CÓMO distinto desactiva el "ya probé apps así" |
| Carrusel/demo de la app | Prueba de realidad + efecto dotación (verse usándola) | UI real/mockup honesto con LOS datos del avatar — ya se imagina dentro |
| Oferta (anual/mensual + trial) | Anclaje + señuelo | Mensual = ancla cara; anual como $/mes; señuelo si hay 3 tiers (02C) |
| Garantía | Reversión de riesgo total | Institución + política + consecuencia concretas (sección 5 de este archivo) |
| FAQ | Manejo de objeciones | 1 pregunta por objeción DE LA FICHA — no FAQs de relleno ("¿qué es la app?") |
| CTA final emocional | Future pacing + identidad | Presente del futuro deseado + deseo de identidad de la ficha, 1ª persona |

**Y el FUNNEL (onboarding → paywall) — la misma disciplina, pantalla por pantalla** (la tabla de arriba cubre la landing; estas filas cubren el resto del camino al pago, cada una con el archivo que la operacionaliza):

| Pantalla del funnel | Sesgo / palanca | Quién la operacionaliza |
|---|---|---|
| Pregunta del quiz | Micro-sí + razón-porque | `02B` (micro-compromisos) |
| Slider de meta | Compromiso + eco (su número reaparece después) | `02B` / `50` (B) |
| Loading pre-resultado | Labor illusion + goal gradient | `50` (loading 4-6s con checkmarks reales) |
| Reconocimiento entre preguntas | Reciprocidad + validación | `02B` (reconocimientos) |
| Reconocimiento final | Etiquetado de identidad | `02B` + `57` (identidad del avatar) |
| Revelación del plan | Efecto IKEA + dotación + PICO (peak-end) | `02B` / `50` (C — el plan construido POR él) |
| Paywall | Costo hundido visible + anclaje + aversión a pérdida honesta + timeline anti-miedo | `02B` / `50` (C) / `02C` |
| CTA de cruce al checkout | Pre-cierre (las 4 condiciones del cruce) | `02C` (EL PRE-CIERRE) + `60` |

Regla: una sección que no activa su palanca es peso muerto — se corrige contra la ficha, no se decora. Referencia cruzada: el 57 fundamenta (avatar, consciencia, PNL, ética), este archivo aplica.

---

## VALIDADO vs FOLKLORE (qué psicología usar con confianza y cuál es mito)

```
VALIDADO (usar sin miedo):
· Anclaje — el efecto MÁS replicado (Many Labs 2014, 36 laboratorios, d>1.0).
· Aversión a la pérdida / dotación — ~2:1 (Kahneman & Tversky; KKT 1990).
· Implementation intentions / compromiso — d=0.65, 94 estudios (Gollwitzer & Sheeran 2006).
· Precio por día (Gourville 1998).
· Left-digit $X.99 (Thomas & Morwitz 2005) — solo si cambia el dígito izquierdo; en marcas
  "calma/premium" el redondo comunica honestidad: es un trade-off, no una ley.
· Contraste del CTA — lo que replica es la SALIENCIA contra el fondo, no ningún color.
· Labor illusion (Buell & Norton 2011).
· Caras atraen atención (solo eso).

FOLKLORE (prohibido citarlo como ciencia):
· "El rojo convierte más" — era contraste, no color.
· "Quitar el símbolo de moneda" — un solo paper débil de 2009, sin réplica: mito.
· "La mirada del bebé dirige la conversión" — estudio de practicante n=106 jamás publicado;
  caras atraen atención ≠ mirada aumenta ventas.
· El decoy con productos reales — 11/91 réplicas (caveat completo en 02C).
· Priming sutil estilo Pre-Suasión — familia golpeada por la crisis de réplica; la
  pre-suasión defendible es ESTRUCTURAL: qué pantalla precede al precio.
· fMRI/EEG para paywalls — cero evidencia de que supere al A/B barato: Cal AI llegó a su
  paywall con 61 experimentos, no con neuroimagen.
```

**REGLA:** si un consejo psicológico no está en la lista VALIDADO ni trae réplica citable, se
trata como hipótesis a testear — nunca como doctrina.

---

## RÚBRICA DE COPY /20 — el gate de aprobación del argumento de venta

Igual que ninguna pantalla se declara lista sin la rúbrica visual /40 (`RUBRICAS-DE-PANTALLA.md`), ningún copy de venta (landing, paywall, emails de oferta) se aprueba sin esta rúbrica. **La puntúa el REVISOR INDEPENDIENTE** (subagente con contexto limpio, doctrina de `12-FLUJO-AGENTICO.md`) — quien escribió el copy NO se autopuntúa: quien escribe se enamora de sus frases y no ve la vaguedad.

**5 ejes de 4 puntos cada uno. Umbral de aprobación: ≥16/20.** Si un eje puntúa ≤2, se corrige ese eje aunque el total pase.

```
EJE 1 — IDEA ÚNICA DOMINANTE (¿la página gira alrededor de UNA Big Idea?)
  1 pt: la página lista features/beneficios sueltos; no se puede resumir en 1 frase.
  4 pt: toda la página desarrolla UNA idea formulable en 1 frase; el mecanismo bautizado
        aparece en hero, sección de mecanismo y oferta; nada compite con ella.

EJE 2 — ESPECIFICIDAD Y PRUEBA (¿números y hechos verificables, o adjetivos?)
  1 pt: "ahorra tiempo", "fácil y rápido", "la mejor" — claims sin número ni respaldo.
  4 pt: cada claim grande tiene número verificable ("de 2 horas a 4 minutos") o prueba
        (demo, testimonio real, garantía) — y CERO claims de ingresos/salud (regla 3 de 19).

EJE 3 — EMOCIÓN / DOLOR REAL (¿el avatar se siente leído, o le describen un producto?)
  1 pt: habla del producto y sus funciones; el dolor es genérico ("el estrés del día a día").
  4 pt: nombra la escena EXACTA que el avatar vive (día, hora, sensación), agita antes de
        resolver, y el "beneficio del beneficio" emocional está presente sin melodrama.

EJE 4 — CLARIDAD DE OFERTA (¿queda obvio qué recibo, cuánto cuesta y qué me protege?)
  1 pt: hay que releer para entender qué incluye el plan, o el precio aparece sin contexto.
  4 pt: stack de valor explícito (qué recibo, ítem por ítem), precio con anclaje, garantía
        con nombre concreto y deadline/cupo real si hay urgencia — un niño de 12 años lo explica.

EJE 5 — DIRECCIÓN A UNA ACCIÓN (¿toda la página empuja al MISMO siguiente paso?)
  1 pt: CTAs que compiten ("compra" vs "sígueme en IG" vs "descarga el PDF"), botones vagos.
  4 pt: UN solo tipo de acción primaria, repetida en hero/mid/final, con CTA de beneficio en
        1ª persona; cada sección termina acercando a esa acción.

SUB-CHECKS BINARIOS (pasan o no pasan — se reportan junto al /20):
  [ ] Message-match: el headline coincide en promesa y vocabulario con el creativo/anuncio
      de origen (34).
  [ ] Garantía nombrada: la garantía aparece con nombre y plazo cerca del CTA de compra.
  [ ] Énfasis: el titular lleva bold completo + palabra clave en acento; el subtitular
      2-4 semibold (JERARQUÍA DE ÉNFASIS de 55).
```

Formato del reporte del revisor: `Copy __/20 (idea _ · especificidad _ · emoción _ · oferta _ · acción _) + las 2 correcciones de mayor impacto`. Con <16, se corrige y se repuntúa — no se negocia el umbral. En el reporte de cierre conviven DOS rúbricas /20 (esta y la de craft visual): nómbralas SIEMPRE "craft /20" y "copy /20" — nunca "/20" a secas.

---

## GATE HUMANO DE 5 SEGUNDOS (antes de gastar tráfico)

Antes de pagar un solo clic: mostrar el HERO 5 segundos a 3-5 personas del ICP (o cercanas a él)
y preguntar "¿qué vende y para quién?". Si 2+ no lo dicen, el hero no comunica: se reescribe
antes de pagar tráfico. El test cuesta 10 minutos; cada clic sobre un hero que no comunica,
dinero. Se anota el resultado (quiénes, qué dijeron) en el reporte de cierre.
Y las variantes SUBCAMPEONAS del proceso de 10 headlines NO se tiran: se guardan como
hipótesis listadas para A/B con `37-FEATURE-FLAGS-Y-EXPERIMENTOS.md` cuando haya tráfico.

---

## 8. Checklist de conversion antes de cerrar landing/paywall

```
[ ] FICHA-AVATAR.md existe, esta aprobada, y CADA pieza (headline, bullet, seccion, CTA,
    FAQ) se traza a un campo de la ficha (test de traza — sin traza se reescribe, ver 57 §9).
[ ] El headline salio del PROCESO OBLIGATORIO: 10+ variantes generadas con el swipe file,
    puntuadas con las 4 U's, ganadora pasada por test del bar + test de intercambiabilidad.
[ ] El headline coincide con el nivel de consciencia del trafico (tabla de 5 niveles en 1bis)
    y el ÉNFASIS de la pagina entera corresponde a ese nivel (largo/profundidad de cada seccion,
    angulo del hero) — el ORDEN de las 10 secciones canonicas del 19 nunca cambia.
[ ] El copy completo fue puntuado por el REVISOR INDEPENDIENTE con la RÚBRICA DE COPY /20
    y saco ≥16 (ningun eje ≤2).
[ ] Se revisaron los patrones validados de apps ganadoras (2bis) aplicables al tipo de app:
    registro despues del primer valor, paywall despues del "aha", largo de onboarding acorde,
    ritual de micro-compromiso antes del paywall si aplica.
[ ] Los bullets usan el metodo Fascinations (beneficio en negrita abre, feature respalda) — no
    listan features planas del mismo largo.
[ ] Si la app interna aun no existe: el visual usa la jerarquia de mockups honestos (19), nunca
    un screenshot inventado ni un icono generico presentado como "asi se ve la app".
[ ] La pantalla tiene logo/nombre de app y camino claro de vuelta.
[ ] Headline <=10 palabras y vende resultado/perdida honesta.
[ ] Subheadline <=2 lineas mobile y contiene mecanismo + beneficio.
[ ] Hay palabras clave resaltadas en bold/acento, no parrafos planos.
[ ] Visual principal hace contraste, perdida, desbloqueo, progreso o prueba.
[ ] Paywall: precio y CTA aparecen en primer viewport mobile o CTA fijo inferior.
[ ] Paywall: no hay sellos vagos; garantia/pago solo si existen con nombre concreto.
[ ] Landing: cada seccion responde una pregunta mental del comprador.
[ ] Copy leido en voz alta: suena como una persona vendiendo con claridad, no como una IA explicando.
[ ] No hay mensajes internos de proceso en la UI publica.
```

Si falla uno de estos items, la pantalla no se aprueba aunque compile y se vea linda.

