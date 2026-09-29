# FLUJO AGÉNTICO — Cómo Trabajar con Codex y Claude Code

> **Cuándo cargar este archivo:**
> - Siempre que el trabajo lo haga un agente de código (Codex CLI, Claude Code)
> - Es el archivo que convierte "código que se ve bien" en "código que funciona sin errores"
> - Las reglas más críticas ya están condensadas en CLAUDE.md / AGENTS.md; este archivo es la versión completa

## Por Qué Existe Este Archivo

Codex y Claude Code no son chats — son agentes que pueden ejecutar comandos, leer archivos, correr tests y verificar su propio trabajo. La mayoría de los errores en apps creadas con IA no vienen de mal código, sino de que **nadie verificó el código antes de entregarlo**. Este archivo define el ciclo de trabajo que elimina ese problema.

---

## CÓMO PIENSA UN AGENTE (y los errores que eso causa)

Entender la cognición del agente previene los fallos más comunes:

### 1. El agente tiende a declarar éxito sin verificar
Es el fallo #1 de los agentes de código: dicen "listo, la app funciona" basándose en que el código *se ve* correcto, no en haberlo ejecutado. **Regla absoluta: ninguna afirmación de funcionamiento sin haber corrido el comando que lo demuestra.** "Debería funcionar" está prohibido como cierre — o se verificó, o se reporta como no verificado.

### 2. El agente tiende a parchear síntomas, no causas
Ante un error de TypeScript, el camino corto es `@ts-ignore`, `any`, o desactivar la regla. Ante un test que falla, comentarlo. **Prohibido.** Si el error existe, hay una causa raíz: encontrarla. Si tras 2-3 intentos no aparece, reportar al usuario el diagnóstico honesto en vez de esconder el problema.

### 3. El contexto se compacta y se pierde
En sesiones largas, el historial se resume automáticamente y los detalles se pierden — incluyendo instrucciones que el usuario dio hace 50 mensajes. Por eso existe `ESTADO.md`: tras cualquier compactación, releer `ESTADO.md` + `CLAUDE.md`/`AGENTS.md` antes de continuar. Y por eso las decisiones importantes se escriben ahí apenas se toman, no "al final".

### 4. Las tareas gigantes degradan la calidad
Un agente que recibe "construye toda la app" en una sola instrucción produce peor código que uno que recibe la misma app en tareas secuenciales con verificación entre cada una. Dividir siempre segun `SECUENCIA-MAESTRA-CONSTRUCCION.md`: ventas → onboarding → paywall → login/auth → app interna → servicios externos. Dentro de cada etapa: tipos → componentes base → layout → pantalla de la etapa → estados → integracion. Verificar en cada frontera.

### 5. Usar el modo de planificación cuando existe
Claude Code tiene plan mode; Codex permite revisar el plan antes de ejecutar. Para tareas de >5 archivos, usar el modo de planificación o presentar el plan en texto y esperar aprobación. El costo de planear es segundos; el costo de ejecutar un plan equivocado es la sesión entera.

### 6. Sandbox y permisos difieren entre herramientas
Codex corre en sandbox con modos de aprobación; Claude Code pide permisos por operación. En ambos casos: no asumir acceso a red o a comandos destructivos; si una operación requiere permisos elevados (instalar global, tocar archivos fuera del proyecto), explicar al usuario por qué antes de pedirla.

### 7. El agente "olvida" el sistema a mitad de proceso (el problema del drift)
Es el fallo más frustrante: el agente empieza siguiendo el sistema al pie de la letra y, 30 mensajes después, está improvisando de memoria, saltándose archivos y checklists. Causas y antídotos:

- **Causa: el contexto se llena y las instrucciones del sistema quedan "lejos".** Antídoto:
  releer `CLAUDE.md` (las 7 Reglas de Oro + la tabla) al empezar cada tarea nueva, no solo al
  arranque de la sesión. Es barato y reancla al agente.
- **Causa: tratar el sistema como "ya lo leí una vez".** Antídoto: los archivos se releen CADA
  vez que se hace una tarea de ese tipo. Leer el archivo 14 en la sesión 2 no significa que en
  la sesión 5 ya "te lo sabes" — vuelve a abrirlo. El costo de releer es mínimo; el de improvisar
  de memoria es una app mediocre.
- **Causa: avanzar sin cerrar.** Antídoto: el CHECKLIST DE CIERRE de `CLAUDE.md` es obligatorio
  ANTES de pasar a la siguiente pantalla/feature. No es opcional ni "para el final".
- **Causa: el usuario pide algo nuevo y el agente abandona el proceso en curso.** Antídoto:
  anotar en `ESTADO.md` dónde quedaste antes de cambiar de tema, para poder retomar.
- **Regla de auto-chequeo:** cada vez que vayas a decir "listo" o "ya quedó", PARA y pregúntate:
  ¿leí los archivos que la tabla indica para esto? ¿recorrí el checklist de cierre? Si la
  respuesta a cualquiera es no, todavía no está listo.

### 8. El agente no ve lo que no lee
Si modificas un componente sin leer cómo lo usan otros archivos, rompes cosas que no ves. Antes de cambiar una interfaz/props/firma: buscar sus usos (`grep`) y actualizar todos.

### 9. El agente supone hechos del mundo en vez de verificarlos (VERDAD ANTES QUE SUPOSICIÓN)
**Regla nueva, ALTA PRIORIDAD.** El conocimiento del modelo tiene fecha de corte. Ante cualquier producto, versión, spec, precio o fecha que pueda ser posterior a ese corte, el agente NO escribe de memoria: **busca primero (WebSearch), anota los hechos, y recién entonces diseña/escribe.**

```
PROHIBIDO como afirmación de hecho:
  "creo que esa versión aún no salió"
  "el último modelo es [X]"      (sin verificar)
  "ese producto no existe todavía"
  "la API funciona así"          (de memoria, sobre algo que cambia)

OBLIGATORIO antes de afirmar un hecho del mundo externo:
  1. WebSearch del producto/versión/spec/precio/fecha exacta
  2. Anotar los hechos encontrados (con la fuente) en ESTADO.md si son load-bearing
  3. Diseñar SOBRE esos hechos, no sobre la suposición
```

> **Por qué existe (caso real):** se perdieron ~2 horas diseñando el concepto de un producto que en realidad YA EXISTÍA, porque el agente supuso de memoria en vez de buscar. Una WebSearch cuesta segundos; un material de venta con datos falsos cuesta credibilidad ante el cliente. Verificar es barato; suponer es caro.

### 10. El agente construye antes de mostrar lo que entendió (PASE JUNIOR)
**Añadir al ciclo.** El agente trabaja como un diseñador junior responsable: ANTES de construir los componentes, **escribe y MUESTRA temprano** sus supuestos, su razonamiento y los placeholders que va a usar. Verbaliza el sistema de diseño (paleta, tipografía, layout, datos de ejemplo) y espera un OK.

```
PASE JUNIOR — mostrar antes de ejecutar:
  1. ASSUMPTIONS: qué entendí del pedido (en mis palabras) + qué estoy asumiendo donde había ambigüedad
  2. REASONING: por qué este enfoque (sistema de diseño, estructura de pantallas)
  3. PLACEHOLDERS: qué datos/copy/assets son provisionales y se reemplazarán
  → Mostrar esto TEMPRANO y esperar confirmación antes de maquetar.
```

Principio: **"entender mal temprano cuesta 100× menos que entender mal tarde".** Un malentendido detectado en 3 líneas de supuestos es gratis; detectado tras construir 8 componentes, es rehacer la sesión. (Esto COMPLEMENTA, no reemplaza, los check-ins y el modo de planificación ya existentes.)

---

## EL CICLO PROFESIONAL: Explorar → Planear → Implementar → Verificar → Testear → Desplegar

El mismo proceso de un equipo de desarrollo profesional, aplicado a TODA tarea (feature nueva, fix, mejora). Nunca entregar sin completar el ciclo.

### 0. Explorar (antes de planear — un plan sin exploración es una adivinanza)
- Leer el código y archivos relevantes al área que se va a tocar
- Buscar con grep los usos de lo que se va a modificar (componentes, funciones, tipos) — esto define el radio de impacto del cambio
- Leer `ESTADO.md` para conocer decisiones previas que afectan la tarea

### 1. Planificar (antes de tocar código)
- Leer los archivos existentes relevantes ANTES de modificar nada
- Si la tarea es crear una app nueva, primera version o MVP, leer
  `SECUENCIA-MAESTRA-CONSTRUCCION.md` y verificar que el plan respeta:
  landing -> onboarding -> paywall -> login/auth -> app interna -> servicios externos.
  Si el plan empieza por `/app`, dashboard o pantalla core interna, el plan esta mal.
- Listar los archivos que se van a crear/modificar
- Si la tarea es grande (>5 archivos), presentar el plan al usuario en 5-10 líneas y esperar OK
- Si la tarea es pequeña, ejecutar directamente

### 2. Implementar (en incrementos pequeños)
- Para apps vendibles, implementar por secuencia de conversion: pagina de ventas, onboarding,
  paywall, login/auth y solo despues app interna. La app interna debe tener 3-5 secciones maximo,
  con 1 protagonista por seccion. No se permite un dashboard con todo mezclado como "primera version".
- En la fase de servicios reales, construir en orden de dependencia. Si la app tiene backend:
  **esquema de datos + RLS (25) → auth (26) → BFF/endpoints (09) → tipos → utilidades → componentes base → features → pantallas.**
  Los datos y la seguridad primero dentro de esa fase; esto NO autoriza saltarse landing/onboarding/paywall/login.
- Un commit lógico por unidad de trabajo, no un mega-commit al final
- Nunca modificar más de lo necesario (no "aprovechar para refactorizar" sin que lo pidan)

### 3. Verificar (NO OPCIONAL — aquí mueren los errores)
Después de cada bloque de trabajo, ejecutar en orden:

```bash
# 1. TypeScript compila sin errores
npx tsc --noEmit

# 2. El build de producción funciona
npm run build

# 3. Si hay linter configurado
npm run lint

# 4. Si hay tests
npm test
```

**Regla absoluta**: Si cualquiera de estos comandos falla, NO avanzar a la siguiente tarea. Corregir primero. Un agente que acumula 15 errores de TypeScript para "arreglarlos al final" produce una bola de nieve imposible de debuggear.

**El ritual de verificación (5 pasos, sin atajos).** "Verificado" no es una sensación — es evidencia. Antes de afirmar que algo funciona:
```
1. IDENTIFICAR el comando exacto que lo demostraría (tsc, build, el test, abrir la pantalla).
2. EJECUTARLO de verdad.
3. LEER toda la salida + el exit code. "No vi un error" no es lo mismo que "pasó".
4. VERIFICAR que esa salida realmente respalda la afirmación (no una salida parcial ni un cacheo viejo).
5. AFIRMAR solo entonces, citando la evidencia ("tsc ✓, build ✓, dev arranca sin errores").
PROHIBIDO como cierre: "debería funcionar", "parece que está bien", "probablemente sirve".
O se verificó con evidencia, o se reporta honestamente como NO verificado. No hay punto medio.
```
Para apps Next.js, la verificación incluye los **Core Web Vitals** como métrica-gate (LCP<2.5s, INP<200ms, CLS<0.1 en p75) — ver `28-INGENIERIA-NEXTJS.md`.

### 4. Testear (funcional + regresión — que lo nuevo no rompa lo viejo)
- Levantar el dev server (`npm run dev`) y verificar que arranca sin errores en consola
- Para cambios de UI: verificar que la pantalla renderiza (si el entorno permite screenshots o abrir el navegador, hacerlo)
- Probar el flujo principal mentalmente contra el código: ¿qué pasa con input vacío? ¿con el botón doble-clickeado? ¿sin conexión?
- **Regresión**: probar no solo lo que se cambió, sino lo que DEPENDE de lo cambiado (los usos encontrados en la exploración). Tras cualquier cambio significativo, recorrer el flujo principal de la app de punta a punta.
- Si existe suite de tests, correrla ENTERA, no solo los tests del área tocada

### 5. Desplegar (cuando el incremento está verificado)
- Commit + push del incremento
- Si hay pipeline (Vercel): verificar que el preview deploy construye sin errores antes de promover a producción
- NUNCA desplegar a producción con verificación o testeo pendiente

### 6. Reporte de cierre
Al terminar, reportar al usuario en este formato:
```
✅ Hecho: [qué se construyó]
🔍 Verificado: tsc ✓ | build ✓ | dev server ✓
⚠️ Pendiente/Notas: [si hay algo que el usuario debe hacer: env vars, cuentas, etc.]
```

---

## MEDIR EL LAYOUT, NO DECLARARLO

Un comentario que dice "las tres secciones comparten el mismo padding" no es una verificación: es
una intención. El agente escribe la intención y sigue, y nadie vuelve a comprobarlo. La simetría, el
desborde y el número de renglones **se miden con código**, y el resultado se pega en el reporte.

```javascript
// Se ejecuta contra la página ya renderizada (MCP de navegador o script propio).
// Devuelve HECHOS, no impresiones.
{
  desbordeHorizontal: document.documentElement.scrollWidth - document.documentElement.clientWidth, // debe ser 0
  altoDeCadaColumna: [...document.querySelectorAll('[data-col]')].map(e => Math.round(e.getBoundingClientRect().height)),
  renglonesDelTitular: Math.round(h1.getBoundingClientRect().height / parseFloat(getComputedStyle(h1).lineHeight)),
  loQueTapaLaBarraFija: [...document.querySelectorAll('p,h2,li')]
      .filter(el => { const r = el.getBoundingClientRect();
                      return el.innerText?.trim() && r.top < topBarra && r.bottom > topBarra + 4; })
      .map(el => el.innerText.slice(0, 40)),   // debe quedar vacío en el contenido que importa
}
```

**Regla:** si una afirmación de diseño se puede medir, se mide. Si el agente dice "cabe sin
desplazar", "quedó simétrico" o "no se corta", el reporte lleva el número que lo demuestra.

> ⚠️ **Y se mide con CADA variante de contenido, no con una.** Un tamaño fijo calculado para el
> texto más largo se descuadra con el más corto. Si un valor depende del contenido (nombre del
> usuario, nombre del plan, categoría elegida), la comprobación recorre **todos** los valores
> posibles, no el que se tenía a mano.

---

## EL ENTORNO DE DESARROLLO MIENTE (verificar en producción)

Tres cosas que en `dev` dan un número y en producción dan otro. Confundirlas hace "arreglar"
problemas que no existen y no ver los que sí:

| Qué | En desarrollo | En producción | Consecuencia si se confunde |
|---|---|---|---|
| Efectos de React | El modo estricto los ejecuta **dos veces** | Una vez | Se ven eventos duplicados y se "corrige" un doble disparo inexistente |
| Peso y tiempos | Sin optimizar, sin minificar | Optimizado | Se toman decisiones de rendimiento con números falsos |
| Caché y CDN | No aplica | Sirve versiones anteriores | Se declara desplegado algo que nadie está viendo |

**Regla:** toda medición de **eventos**, **rendimiento** y **contenido publicado** se hace contra
producción. En desarrollo solo se verifica que funcione.

---

## TRAMPAS DE EDICIÓN MASIVA (por qué se pierde trabajo ya hecho)

Cuando el agente edita muchos puntos de un archivo con un script, el patrón habitual es: hacer todos
los reemplazos en memoria, comprobar, y guardar al final. **Si una comprobación falla a mitad, se
pierde todo lo anterior** — el archivo nunca se escribió.

```
❌ reemplazo A → reemplazo B → reemplazo C (falla) → nada se guardó, se perdió A y B
✅ reemplazo A → guardar → reemplazo B → guardar → reemplazo C (falla) → A y B están a salvo
```

**Reglas:**
- Guardar después de cada cambio, o editar por rangos de línea verificados uno a uno.
- Toda sustitución comprueba **primero** que el texto que busca existe; si no existe, se detiene y lo
  dice. Un reemplazo que no encuentra su objetivo y sigue en silencio deja el archivo a medias.
- Después de un bloque de ediciones, **releer el archivo** antes de darlo por bueno.

---

## DECISIÓN DE FRAMEWORK (tomar al inicio, nunca a mitad de proyecto)

"React" no es una decisión completa. Decidir entre estas dos rutas según la app:

### Ruta A: Vite + React (SPA)
**Cuándo**: La app vive detrás de login, no necesita SEO, es una herramienta (dashboard, generador, tracker).
```
Routing:      react-router-dom
Env vars:     VITE_* (públicas — claves sensibles NUNCA aquí)
BFF:          Supabase Edge Functions o funciones serverless separadas
Deploy:       Vercel como sitio estático
```

### Ruta B: Next.js (App Router)
**Cuándo**: La app necesita SEO (landing + app juntas), necesita API routes integradas, o renderizado server-side.
```
Routing:      file-based (app/)
Env vars:     NEXT_PUBLIC_* (públicas) y sin prefijo (servidor — aquí van las claves de IA)
BFF:          Route Handlers (app/api/*/route.ts) — el BFF viene integrado
Deploy:       Vercel nativo
```

> Si eliges Next.js, **leer `28-INGENIERIA-NEXTJS.md` antes de escribir componentes**: fronteras Server/Client, Server Actions, caché y Core Web Vitals. Es la diferencia entre usar el framework y pelear contra él.

**Regla de decisión rápida**: ¿La app necesita que Google indexe contenido o tiene landing page integrada? → Next.js. ¿Es pura herramienta tras login? → Vite. Si hay duda → Next.js (el BFF integrado simplifica la seguridad de API keys).

Documentar la decisión en el primer commit y NUNCA cambiarla a mitad de proyecto.

---

## PRESUPUESTO DE TOKENS DEL AGENTE (para quien trabaja con un plan limitado)

La mayoría de quien usa este SO tiene un plan mensual con ventanas de uso, no una API sin tope. Sus
créditos son un recurso finito y **conviene saber dónde se van de verdad**, porque la intuición
falla: se recorta lo barato y se deja intacto lo caro.

> **Este SO se usa con planes económicos y modelos de gama media** (Sonnet con esfuerzo medio,
> Codex, o el modelo base del proveedor de turno). El objetivo no es gastar poco: es que **al usuario
> le alcance para terminar su app**. Un crédito gastado en rehacer algo que salió pobre vale menos
> que el mismo crédito gastado en hacerlo bien la primera vez — por eso la respuesta a "cómo ahorro"
> nunca es "entrega menos", sino "no lo hagas dos veces".

**Medidas reales tomadas con este SO** (indicativas, varían con el modelo y el tamaño del proyecto):

| Actividad | Coste medido | Frecuencia |
|---|---|---|
| Investigación de ideas del FLUJO A (20 búsquedas, 8 categorías) | ~64.000 tokens | **1 vez** en todo el proyecto |
| Leer `16-DIRECCION-DE-ARTE.md` | ~17.000 tokens | 1 vez por sesión de diseño |
| Leer `19-PAGINA-DE-VENTAS.md` | ~13.000 tokens | 1 vez al hacer la landing |
| **Revisor visual de UNA pantalla** | **~78.000-92.000 tokens** | **× CADA pantalla** |
| Comparativa A/B/C **desde el kit** (copiar + tematizar + llenar) | fracción de escribirla | 1 vez |
| Comparativa A/B/C **desde cero** (PROHIBIDO — 54 Regla #0) | ~3-5× el kit, y sale peor | nunca |
| Contexto base de cada mensaje (CLAUDE.md + hook de arranque) | ~20.000 tokens de entrada (cacheados tras el 1er mensaje) | siempre |

> **Por eso los kits son también una regla de PRESUPUESTO:** la landing (kit del 55), la
> comparativa y la réplica (kit del 54 — Regla #0) nacen copiando una plantilla ya premium y
> tematizándola. Escribir desde cero cuesta varias veces más Y produce el resultado pobre que
> después hay que rehacer — el doble desperdicio.

### La conclusión que sorprende

**La investigación de ideas NO es el gasto grande.** Cuesta aproximadamente lo mismo que revisar UNA
pantalla, y ocurre una sola vez — mientras que el revisor se ejecuta en cada una. En un proyecto de
10 pantallas, las revisiones cuestan alrededor de **10 veces** lo que costó elegir la idea.

Y es el peor sitio para ahorrar: la investigación es lo que decide si las siguientes 40 horas de
trabajo construyen algo que se vende o algo que nadie quiere. **Ahorrar ahí es ahorrar en el mapa
antes de un viaje largo.**

### Dónde ahorrar de verdad, sin perder calidad

```
1. EL REVISOR VISUAL, con criterio (el gasto #1)
   → Obligatorio en las pantallas que deciden el dinero: landing, onboarding, paywall,
     y la pantalla principal de la app.
   → En pantallas secundarias (ajustes, perfil, legales): basta la verificación por
     MEDICIÓN (12) + el checklist, y se anota que no pasó por revisor.
   → NUNCA saltárselo en las cuatro primeras: son las que se ven antes de pagar.

2. NO RELEER DOCUMENTOS YA LEÍDOS EN LA MISMA SESIÓN
   → La tabla de ruteo dice qué leer POR TAREA, no "todo por si acaso".
   → Tras una compactación, releer solo ESTADO.md y las fichas (el hook las reinyecta),
     no los documentos completos otra vez.

3. UNA TAREA POR SESIÓN, CERRADA
   → Sesiones largas arrastran todo el historial en cada mensaje. Cerrar con ESTADO.md
     actualizado y empezar limpio cuesta MUCHO menos que una sesión eterna.

4. LA INVESTIGACIÓN, ACOTADA Y BIEN DIRIGIDA (no eliminada)
   → Techo: ~10-14 búsquedas POR RONDA (máximo 2 rondas).
   → ⚠️ Buscar en 15 categorías obvias gasta MÁS y encuentra MENOS que buscar en 8 bien
     elegidas. Medido: una ronda de 15 categorías genéricas costó >100k tokens y produjo
     UNA idea, porque 14 salían del pozo más agotado. Generar mejor cuesta menos que
     filtrar más (ver «DE DÓNDE SALEN LAS CANDIDATAS» en 01-IDEACION).
   → Empezar por el POZO 2 (marketplaces de servicios): es donde la señal de pago ya
     está probada, así que cada búsqueda rinde más.
   → Se PARA en cuanto haya 3-5 candidatas con PROPONER: encontrar más no mejora la
     decisión, solo gasta.
   → Si el usuario ya declaró un nicho (A2a/A2b), se busca SOLO en ese nicho: investigar
     categorías que no le interesan es el desperdicio más común de esta fase.
```

> ⚠️ **Lo que NO se recorta nunca**, por muy justo que ande el presupuesto: la verificación de que
> algo funciona (tsc, build, flujo real), la investigación que decide la idea, y el revisor de las
> cuatro pantallas que deciden la venta. Recortar ahí no ahorra créditos: los gasta después, en
> rehacer.

### EL RITMO DEL PLAN DE 20 (ventanas de uso y semanas — el SO está diseñado para esto)

Los planes económicos limitan el uso por VENTANAS (bloques de horas que se renuevan solos) y por
semana. Eso NO impide terminar la app — solo define el ritmo. Las reglas:

```
1. UNA SESIÓN DEL SO = UNA VENTANA. Cada sesión de la SECUENCIA (B5) está dimensionada para
   caber en una ventana de uso trabajando enfocado. No intentes meter dos sesiones en una
   ventana: la segunda sale a medias y rehacerla cuesta más que esperarla.
2. AL PRIMER AVISO DE LÍMITE: cierra en orden, no corras. Actualiza ESTADO.md (fase, decisiones,
   qué falta), termina la verificación de lo YA construido y PARA. Un cierre ordenado de 2
   minutos vale más que 10 minutos de trabajo nuevo sin verificar.
3. ESPERAR EL RESET NO CUESTA NADA. La memoria del proyecto es EXTERNA (ESTADO.md + las 4
   fichas): cuando la ventana se renueva, `/retomar` reconstruye el contexto en un minuto y se
   sigue exactamente donde quedó. El SO fue diseñado para pausarse sin perder nada.
4. PROHIBIDO "estirar" la ventana degradando calidad (saltarse el revisor de las 4 del dinero,
   no verificar, escribir desde cero en vez de usar los kits "para ir rápido"). Eso no estira
   la ventana: mueve el gasto a la siguiente, con intereses.
5. LA EXPECTATIVA HONESTA: una app vendible completa son las 8 sesiones de B5 + iteración =
   varias ventanas repartidas en 1-2 semanas de trabajo con un plan económico. Eso es lo
   normal y está bien — es un negocio, no una tarea de una tarde.
```

---

## INGENIERÍA DE COSTOS DE IA (Unit Economics Técnicos)

Una app de suscripción que llama a una API de IA tiene un costo variable por usuario. Si no se diseña, la app puede perder dinero con cada usuario Pro.

> Esta sección cubre la ingeniería de COSTOS (texto). La **arquitectura de integración completa** — texto con streaming/caching, imagen y audio asíncronos con Storage, resiliencia (reintentos, timeouts, degradación) y economía por modalidad — está en `30-INTEGRACION-IA.md`. Léelo antes de construir cualquier feature de IA de imagen o audio.

### Reglas de implementación

**1. Modelo según la tarea (no usar el más caro para todo):**
```
Tareas simples (clasificar, extraer, resumir corto):
  → Modelo pequeño/rápido (Haiku, GPT mini) — 10-20x más barato

Tareas core (la generación principal que el usuario paga):
  → Modelo medio (Sonnet o equivalente)

Tareas premium puntuales (análisis profundo, feature Pro destacada):
  → Modelo grande, solo si el resultado lo justifica
```

**2. Limitar max_tokens SIEMPRE:**
```typescript
// El costo de output es el más caro. Nunca dejar max_tokens sin límite razonable.
max_tokens: 1024,  // Para la mayoría de generaciones de una app
// No 4096 "por si acaso" — eso es 4x el costo potencial por llamada
```

**3. Cachear resultados idénticos o similares:**
```typescript
// Antes de llamar a la IA, verificar si ya existe el resultado
const cacheKey = hash(input + options);
const cached = await getFromCache(cacheKey);
if (cached) return cached; // Costo: $0
```

**4. Calcular el costo por usuario en el pricing (va en Fase 1):**
```
Costo por generación ≈ (tokens_input + tokens_output) × precio_por_token
Costo mensual por usuario Pro = generaciones_promedio_mes × costo_por_generación

Regla: el costo de IA por usuario Pro debe ser <20% del precio de suscripción.
Si un Pro paga $15/mes, el costo de IA no debe superar ~$3/mes.
Si lo supera → subir precio, limitar usos "ilimitados" con fair-use, o usar modelo más barato.
```

**5. "Ilimitado" nunca es ilimitado:**
Incluso el plan Pro debe tener un fair-use limit invisible (ej: 500 generaciones/mes) con rate limiting en el servidor, para protegerte de abuso y scripts.

**6. Modelo de IA como variable, nunca hardcodeado:**
```typescript
// constants.ts
export const AI_MODEL = process.env.AI_MODEL || '[modelo-actual]';
// Los modelos se deprecan. Centralizar el string permite cambiarlo en un lugar.
```

---

## GIT CON AGENTES

```
- Commits pequeños y frecuentes con mensajes descriptivos (feat:, fix:, style:)
- NUNCA commitear: .env, node_modules, archivos generados
- Antes del primer commit: verificar que .gitignore existe y cubre lo sensible
- Si algo se rompe: el historial de commits pequeños permite encontrar el commit culpable
- Nunca hacer force push ni reescribir historia sin pedirlo el usuario
```

---

## CUÁNDO PREGUNTAR vs CUÁNDO DECIDIR

El principio de mínimo esfuerzo dice que el agente decide. Pero hay excepciones:

**Decidir sin preguntar:**
- Nombres de variables, estructura de archivos, detalles de implementación
- Elección de librerías estándar del stack definido
- Fixes de bugs evidentes
- Mejoras de accesibilidad y seguridad (siempre aplicarlas)

**Preguntar SIEMPRE antes de:**
- Eliminar archivos o features existentes
- Cambiar el framework, la base de datos, o decisiones de arquitectura ya tomadas
- Instalar dependencias pesadas o poco conocidas
- Cualquier acción que cueste dinero (crear recursos cloud, llamadas masivas a APIs)
- Modificar el esquema de una base de datos con datos reales

---

## ORQUESTACIÓN DE SUBAGENTES (cuando la herramienta lo permite)

Claude Code y Codex pueden lanzar subagentes para paralelizar. Bien usado, acelera y mantiene el contexto limpio; mal usado, crea conflictos y trabajo redundante. Reglas:

```
- UN solo implementador por tarea de escritura. NUNCA dos agentes escribiendo el mismo código en
  paralelo (se pisan). La escritura es secuencial; la lectura/exploración sí se paraleliza.
- Paralelizar SOLO trabajo de lectura/diagnóstico independiente: explorar varios módulos, buscar
  usos, investigar opciones. Cada subagente devuelve una SÍNTESIS accionable, no volcados de archivos.
- Revisar en dos ejes por separado: (a) ¿cumple el objetivo/la spec? (b) ¿la calidad del código es
  buena? Mezclar ambas produce revisiones flojas.
- Para corregir varios hallazgos: UN agente con la lista completa, no uno por hallazgo.
- Nada de "¿sigo?" a mitad de un plan ya aprobado: ejecutar el plan completo y reportar al cerrar.
- El subagente hereda el sistema: indícale qué archivos del SO debe leer para su tarea (tabla de ruteo).
```

### EL REVISOR INDEPENDIENTE (doctrina obligatoria para el puntaje visual)

La rúbrica visual /40 de `RUBRICAS-DE-PANTALLA.md` (y la revisión de craft del 43) **NUNCA la puntúa el mismo
agente que construyó la pantalla**. El implementador es juez y parte: ya "sabe" que la pantalla está
bien, y su contexto está contaminado por horas de decisiones que justifica sin darse cuenta. El
resultado histórico: pantallas auto-puntuadas 38/40 que un ojo fresco puntúa 29/40.

Protocolo (el revisor YA EXISTE como agente: `.claude/agents/revisor-visual.md`, con las rúbricas
/40 y /20 y el test de fidelidad EMBEBIDOS — no hay que redactarle prompt ni mandarlo a leer `RUBRICAS-DE-PANTALLA.md`):

```
1. El implementador termina la pantalla, la abre renderizada a 375px y guarda el SCREENSHOT (Regla 7).
2. Se lanza el SUBAGENTE `revisor-visual` con contexto LIMPIO. Recibe SOLO tres cosas:
   (a) la RUTA del screenshot de la pantalla renderizada,
   (b) la ruta de FICHA-ARTE.md del proyecto,
   (c) la imagen de referencia del usuario, SI existe (para el test de fidelidad).
   NO recibe el hilo del implementador, ni las justificaciones de por qué algo quedó así.
3. El veredicto VÁLIDO para el checklist de cierre es el del REVISOR (formato fijo: /40 + /20 +
   fidelidad + top defectos con ubicación). Si da NO LISTA, la pantalla vuelve al implementador
   con la lista de hallazgos; se corrige, se re-renderiza y se re-lanza el revisor.
   Máximo 3 iteraciones: si a la 3ª no pasa, se reporta al usuario con honestidad (qué falta y
   por qué), NUNCA se infla el puntaje para cerrar.
4. Si la herramienta no permite subagentes, la alternativa mínima es una sesión/conversación nueva
   sin historial que reciba el contenido de .claude/agents/revisor-visual.md como prompt + esos
   3 insumos. Nunca el mismo hilo.
```

---

## PROTOCOLO DE RESCATE — Rediseñar una App Existente Sin Romperla

Para apps avanzadas pero estancadas (UX confusa, flujo poco claro, diseño genérico). El error típico del agente aquí es empezar a "mejorar" archivos sueltos sin entender el todo. Este protocolo lo previene con 5 fases estrictamente secuenciales:

### Fase R1 — Explorar (solo lectura, cero cambios)
- Leer la estructura completa del proyecto, package.json, y cada pantalla/componente principal
- Levantar el dev server y observar la app real, no solo el código
- **Auditoría técnica de la app existente (no solo visual):** ¿hay API keys en el frontend? ¿RLS activo en las tablas? ¿auth segura? Correr la auditoría de `27-REVISION-SEGURIDAD.md` y revisar el esquema/índices (`25`) y el método de auth (`26`). Un rescate que solo arregla la UI sobre una base insegura no sirve.
- Crear `ESTADO.md` documentando: qué hace la app, pantallas existentes, stack real, qué funciona y qué está a medias, y los hallazgos de seguridad/DB/auth

### Fase R2 — Mapear el flujo actual (el diagnóstico más importante)
Documentar el viaje real del usuario, pantalla por pantalla:
```
Pantalla 1 → ¿qué ve? ¿qué puede hacer? ¿cuántas acciones compiten por su atención?
   ↓ ¿cómo llega a la siguiente? ¿es obvio o hay que adivinarlo?
Pantalla 2 → [...]
```
Para cada paso, anotar: fricción (¿dónde se confundiría un usuario nuevo?), redundancia (¿pantallas o pasos que sobran?), y vacíos (¿qué espera el usuario que no existe?).

### Fase R3 — Diseñar el flujo ideal
- Auditar contra `03-PRINCIPIOS-APP-EXITOSA.md` (los 16 principios + checklist) y `11-DISENO-EMOCIONAL.md` (test "¿se siente genérico?")
- Rediseñar el flujo objetivo con la lógica de `04-ARQUITECTURA.md`: primer uso → momento WOW → uso recurrente
- Producir el plan: flujo actual vs flujo ideal, qué pantallas se mantienen / se fusionan / se eliminan / se crean, y la lista de cambios ordenada por impacto

### Fase R4 — Aprobar antes de ejecutar
Presentar el plan al usuario y ESPERAR aprobación. Un replanteamiento de flujo sin aprobación es reescribir la app de alguien sin permiso.

### Fase R5 — Ejecutar por capas verificadas
Orden recomendado: 1) flujo y navegación → 2) jerarquía y limpieza de cada pantalla → 3) sistema visual (tokens, tipografía, color) → 4) diseño emocional (animaciones, celebraciones, copy) → 5) testing completo.
Una capa a la vez. `tsc` + `build` + dev server limpios antes de pasar a la siguiente. Actualizar `ESTADO.md` al cerrar cada capa.

**Reglas del rescate:**
- Mejorar lo que existe > reescribir. Reescribir un componente solo si arreglarlo cuesta más que rehacerlo, y avisando.
- No agregar features nuevas durante el rescate (van a la lista de "después" en ESTADO.md).
- Si el flujo ideal requiere eliminar algo que el usuario construyó, preguntarlo explícitamente — nunca borrar trabajo ajeno por iniciativa propia.

---

## CHECKLIST DE CIERRE DE SESIÓN AGÉNTICA

```
[ ] npx tsc --noEmit → sin errores
[ ] npm run build → exitoso
[ ] npm run dev → arranca sin errores en consola
[ ] .env en .gitignore, .env.example actualizado
[ ] Commits con mensajes claros
[ ] Reporte al usuario: hecho / verificado / pendiente
[ ] Si quedó algo a medias: documentarlo en ESTADO.md (la única memoria de pendientes — CLAUDE.md regla dura 3), no en el código
```
