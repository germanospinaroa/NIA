# 📖 INSTRUCCIONES — Cómo Usar Este Sistema Operativo

> Lee este archivo primero. En 10 minutos vas a saber exactamente qué es este sistema, cómo funciona, y cómo sacarle el máximo provecho — incluso si nunca has creado una app.

---

## ¿Qué es esto?

Un sistema de documentos especializados (más de 40) que convierte a la IA (Codex, Claude Code, o Claude Chat) en un equipo completo de producto: estratega, diseñador UX, desarrollador full-stack senior, experto en backend y bases de datos, especialista en auth y ciberseguridad, diseñador de gamificación, QA tester y experto en monetización. Tú pones la idea (o ni siquiera eso) y el sistema guía a la IA para producir una web app profesional, monetizable y sin errores.

**Lo que NO es:** un curso para leer. Los archivos no son para que tú los estudies — son instrucciones para la IA. Tu trabajo es cargar el archivo correcto en el momento correcto y aprobar o ajustar lo que la IA propone.

---

## Los Archivos del Sistema, en Orden

### 📌 Empieza aquí (para ti, el humano)
| # | Archivo | Para qué sirve |
|---|---------|----------------|
| — | **INSTRUCCIONES.md** | Este archivo. El manual de uso. |
| — | **REFERENCIA-RAPIDA.md** | Chuleta con los prompts exactos para copiar y pegar en cada sesión. |

### 🤖 Archivos automáticos (van en la raíz del proyecto, una sola vez)
| # | Archivo | Para qué sirve |
|---|---------|----------------|
| — | **CLAUDE.md** | Lo lee Claude Code automáticamente. Reglas de código, diseño, seguridad y verificación condensadas. |
| — | **AGENTS.md** | Lo lee Codex automáticamente. Idéntico a CLAUDE.md. Pon AMBOS siempre. |

### 🔢 Las 8 fases del proceso (se cargan en orden, una o dos por sesión)
| # | Archivo | Fase | Pregunta que responde |
|---|---------|------|----------------------|
| 00 | **00-SISTEMA-MAESTRO.md** | Base | Solo si usas Claude Chat u otra IA sin auto-carga. En Codex/Claude Code NO lo necesitas (lo reemplazan CLAUDE.md/AGENTS.md). |
| 01 | **01-IDEACION.md** | Fase 0 | ¿Qué app construimos y con qué features? |
| 02 | **02-VALIDACION.md** | Fase 1 | ¿Vale la pena? ¿Cómo retiene y cuánto cobra? |
| 03 | **03-PRINCIPIOS-APP-EXITOSA.md** | Fase 2 | ¿Cómo debe sentirse y comportarse la app? |
| 04 | **04-ARQUITECTURA.md** | Fase 3 | ¿Qué pantallas, flujos y datos tiene? |
| 05 | **05-CREACION.md** | Fase 4 | ¿Cómo se construye el código? |
| 06 | **06-TESTING.md** | Fase 5 | ¿Funciona todo de verdad? |
| 07 | **07-PULIDO.md** | Fase 6 | ¿Se siente profesional y premium? |
| 08 | **08-DEPLOY.md** | Fase 7 | ¿Cómo la pongo en internet y cobro? |

### 🧩 Archivos transversales (se combinan con las fases cuando aplican)
| # | Archivo | Cuándo cargarlo |
|---|---------|-----------------|
| 09 | **09-SEGURIDAD.md** | Siempre antes de desplegar. Si la app maneja usuarios, datos o pagos. |
| 10 | **10-DESIGN-TOKENS.md** | Junto con la fase de creación (05). Sistema de colores, dark mode, accesibilidad. |
| 11 | **11-DISENO-EMOCIONAL.md** | Junto con creación (05) y pulido (07). Lo que hace que la app se sienta como Revolut o Duolingo y no como un template. |
| 12 | **12-FLUJO-AGENTICO.md** | Siempre que trabaje un agente (Codex/Claude Code). Verificación, framework, costos de IA. |
| 13 | **13-INFRA-ESCALABILIDAD.md** | Arquitectura de referencia, qué se rompe con 500-1000 usuarios y checklist para vender/escalar. |
| 14 | **14-LEYES-DE-DISENO.md** | Los 12 mandamientos + especificaciones numéricas exactas de tipografía, espaciado, movimiento y jerarquía. El antídoto contra el diseño "hecho con IA". |
| 15 | **15-PATRONES-UX.md** | Los patrones de UX con impacto MEDIDO en retención: rendimiento percibido, onboarding, empty states, auth sin fricción, gestos, háptica. La clave de la diferenciación 2026. |
| 16 | **16-DIRECCION-DE-ARTE.md** | Cómo elegir una identidad visual audaz y cohesiva — el "gusto" que separa lo correcto de lo memorable. Paleta, tipografía, craft, cohesión. |
| 17 | **17-VISUALIZACION-DATOS.md** | Gráficos, anillos, donuts, dashboards con specs exactas (principio Tufte). Para apps de fitness, finanzas, salud, analítica. |
| 18 | **18-VENTA-HOTMART.md** | Flujo completo de venta por Hotmart: producto fachada, webhook + hottok, creación/baja de usuarios, emails con Resend. Configuración por defecto. |
| 19 | **19-PAGINA-DE-VENTAS.md** | Estructura validada + copy de respuesta directa + visuales para landing pages de alta conversión. |
| 20 | **20-ASSETS-VISUALES.md** | Qué imágenes necesita la app (logo, favicon, OG, hero) y cómo generarlas con ChatGPT/Gemini + placeholders limpios. |
| 21 | **21-BACKOFFICE.md** | Construye un panel de admin para el dueño: ventas, usuarios, errores y métricas en lenguaje claro. |
| 22 | **22-LIBRERIAS-Y-CRAFT.md** | Las librerías concretas (Motion, Phosphor, Lottie, Recharts) y las animaciones que toda app DEBE tener. El antídoto contra el diseño estático. |
| 23 | **23-SKILLS-COMUNIDAD.md** | Skills de diseño de la comunidad (frontend-design oficial, UI/UX Pro Max) que complementan el sistema. Opcional. |
| 24 | **24-GAMIFICACION.md** | Retención y hábito: loop Hooked, rachas con streak-freeze, XP, recompensa variable, ligas, re-enganche. Lo que hace que la gente vuelva (como Duolingo). |
| 25 | **25-BASE-DE-DATOS.md** | Backend serio: diseño de esquema, índices, migraciones zero-downtime, EXPLAIN, RLS de alto rendimiento, pooling. |
| 26 | **26-AUTH-MODERNO.md** | Auth 2026: passkeys/WebAuthn, rotación de tokens, rate limits por endpoint, MFA, anti-enumeración. |
| 27 | **27-REVISION-SEGURIDAD.md** | Auditoría antes de vender: OWASP Top 10:2025, semgrep, npm audit, secretos, threat model ligero. |
| 28 | **28-INGENIERIA-NEXTJS.md** | Si la app es Next.js: Server/Client components, Server Actions, caché, Core Web Vitals. |
| 29 | **29-REFERENCIA-VISUAL.md** | Lookup rápido de paletas y tipografías por nicho (subconjunto curado de ui-ux-pro-max). |
| 30 | **30-INTEGRACION-IA.md** | Integración de IA multimodal: texto (streaming, prompt caching, tiering), imagen y audio (async + Storage), resiliencia (reintentos, timeouts, degradación) y economía por modalidad. Para apps que generan con IA. |
| 31 | **31-EVALS-OBSERVABILIDAD-OPERACION.md** | Operación profesional de IA: evals (golden set para no degradar al cambiar modelo/prompt), observabilidad (tabla `ai_calls`, costo real, alertas de gasto), CI/CD con gates, runbook de incidentes y soporte al usuario. El salto de "funciona" a "operación seria". |
| 32 | **32-DEL-MVP-AL-PRODUCTO.md** | El listón anti-MVP-básico: míralo RENDERIZADO a 375px, nav al fondo (no min-h-full), profundidad (no fondo plano), pantallas llenas de valor (no vacías), CTA vivo. Con el caso real de por qué las apps quedan básicas. El salto de "funciona" a "se vende". |
| 33 | **33-RAG-Y-CONTEXTO.md** | Si la app responde sobre documentos o conocimiento propio: RAG con pgvector, chunking, retrieval híbrido, reranking. |
| 34 | **34-ADQUISICION-Y-TRAFICO.md** | Cómo conseguir clientes para una app vendida por Hotmart: afiliados, paid ads, contenido/SEO, lead magnet + email. |
| 35 | **35-LANZAMIENTO.md** | Vender en picos: playbook de lanzamiento en 5 fases, oferta de fundadores, order bump/upsell, prueba social desde cero. |
| 36 | **36-ANALITICA-Y-EVENTOS.md** | Instrumentar el producto para decidir con datos: taxonomía de eventos, funnel de activación, North Star. |
| 37 | **37-FEATURE-FLAGS-Y-EXPERIMENTOS.md** | Lanzar gradual, apagar rápido, medir de verdad: feature flags, A/B testing, kill-switch, rollout. |
| 38 | **38-PERFORMANCE-BUDGET.md** | El peso es churn (LATAM): presupuesto de performance y Core Web Vitals como gate, pensado para Android de gama media. |
| 39 | **39-INTERNACIONALIZACION.md** | i18n y multi-mercado LATAM (Brasil pt-BR, monedas locales) con next-intl. |
| 40 | **40-UNIT-ECONOMICS.md** | ¿La app GANA dinero?: COGS, margen, break-even, LTV:CAC — la economía unitaria del negocio. |
| 41 | **41-CRAFT-DE-ANIMACION.md** | Animación de élite: cuándo NO animar, easing perceptual, runtime en GPU, View Transitions, motion narrativo. |
| 42 | **42-UX-WRITING.md** | El copy de interfaz como material de diseño: nombres de controles, errores, empty states, consistencia de verbos. |
| 43 | **43-MICRO-CRAFT-Y-EJECUCION.md** | La última milla verificable: micro-tipografía, overflow/min-w-0, forms, touch, dark robusto, URL-estado, bundle. |
| 44 | **44-DESCUBRIMIENTO-DE-USUARIO.md** | Investigar el problema con usuarios reales (Mom Test/JTBD, screener, síntesis) ANTES de construir. |
| 45 | **45-SEO-TECNICO.md** | Que la landing y el contenido se indexen y rankeen: metadata dinámica, sitemap/robots, schema.org, ISR, programmatic SEO. |
| 46 | **46-EMAIL-DELIVERABILITY.md** | Que el correo LLEGUE (no a spam): SPF/DKIM/DMARC, subdominio dedicado, warmup, higiene de lista. |
| 47 | **47-LEGAL-FISCAL-Y-PRIVACIDAD.md** | La operación post-venta que convierte "una app que vende" en "un negocio": fiscal/legal LATAM, ToS/refund/disclaimer IA, privacidad LGPD. |
| 48 | **48-RIGOR-DE-ENTREGA.md** | La puerta FINAL antes de declarar "listo": auto-QA end-to-end, pre-mortem, invariantes de dinero/datos/seguridad, circuit-breaker de costo de IA, manual del dueño. |
| 49 | **49-SISTEMA-DE-COMPONENTES.md** | Componentes con identidad propia (button, card, sheet, skeleton, empty state) y cómo des-genericar shadcn. |
| 50 | **50-DISENO-ONBOARDING-PAYWALL.md** | Las PANTALLAS de onboarding y paywall con layout, medidas y motion exactos. |
| 51 | **51-STACK-PINEADO.md** | El scaffold canónico del código: versiones pineadas, estructura de carpetas y `.env` de referencia. |
| 52 | **52-COPY-VISUALES-CONVERSION.md** | El copy y los visuales que convierten en landing/onboarding/paywall (+ rúbrica de copy /20). |
| 53 | **53-PANTALLA-CANONICA.md** | Un ejemplo completo y compilable de pantalla bien compuesta — se copia la composición, jamás los valores. |
| 54 | **54-BANCO-DE-DIRECCIONES.md** | 12 direcciones de arte nombradas + protocolo A/B/C (3 opciones renderizadas: elegir/combinar/pedir otras) para elegir identidad sin caer en el genérico. |
| 55 | **55-DISENO-DE-LANDING.md** | El layout visual de la landing: hero con medidas, pricing con señuelo, sticky CTA, animaciones de scroll. |
| 56 | **56-MOMENTOS-EMOCIONALES.md** | Las pantallas de los momentos que retienen: celebraciones, hitos de racha, level-up, racha rota, win-back, share cards. |
| 57 | **57-AVATAR-Y-CONSCIENCIA.md** | El cliente ideal y el argumento de venta: dolores, deseos, objeciones, nivel de consciencia — llena `FICHA-AVATAR.md`, obligatoria antes de cualquier copy de venta. |
| 58 | **58-RETENCION-DE-INGRESOS.md** | Mantener el dinero que ya entró: churn, dunning de pagos fallidos, win-back, referidos, renovación anual. |
| 59 | **59-SOPORTE-CLIENTE.md** | El sistema de soporte a compradores: canales por etapa, SLA, plantillas, soporte con IA + escalada humana, soporte-como-retención. |
| 60 | **60-OPERACION-DE-CONVERSION.md** | Contrato operativo desde trafico hasta primer cobro: sesiones, QA, atribucion, visibilidad real, Hotmart sin peajes, diagnostico y checkpoints. |
| 61 | **61-INTEGRIDAD-DE-LANZAMIENTO.md** | Gate binario antes de vender: verdad comercial, auth, pagos, privacidad, RPC, IA, monedas, reproducibilidad y piloto. |
| 62 | **62-PUBLICACION-SEGURA-Y-CONTINUA.md** | Cadena certificada GitHub→Vercel + Supabase: repositorio conectado, ambientes, cero secretos en chat, dominio/callbacks, SHA y segunda publicación automática. |
| 63 | **63-EMBUDO-DE-CHAT.md** | El segundo camino de venta: Meta Ads → página propia con formato de conversación (mensajes automáticos + botones, sin WhatsApp real) → checkout de Hotmart. Guion de 7 etapas, regla de marca y medición. |
| — | **DESIGN-CORE.md** | El núcleo canónico de diseño que el agente lee SIEMPRE antes de cualquier interfaz. |
| — | **SECUENCIA-MAESTRA-CONSTRUCCION.md** | El orden no negociable para construir una app vendible: ventas → onboarding → paywall → login → app interna → servicios. |
| — | **PREFLIGHT-PANTALLA.md** | La tarjeta que el agente relee ANTES de cada pantalla (~40 líneas). |
| — | **CHECKLIST-CIERRE.md** | La referencia por dominio del checklist de cierre (bloques condicionales por lo que tocaste). |
| — | **PLANTILLA-FICHA-ARTE.md / PLANTILLA-FICHA-AVATAR.md** | Plantillas de las dos fichas-memoria del proyecto: decisiones visuales y cliente ideal. |
| — | **GUIA-DE-LOS-PROMPTS.md / SETUP-CLAUDE-CODE.md** | Qué botón apretar en cada situación, y el paquete nativo de Claude Code (comandos, hooks, revisor visual, MCP). |
| — | **PLANTILLA-REVISION-PANTALLA.md** | Plantilla estructurada de 15 puntos para revisar cada pantalla antes de aprobarla (misión, elementos, estados, IA, criterios de aceptación). |
| — | **RUBRICAS-DE-PANTALLA.md** | Las rúbricas de cierre visual: /40 de usabilidad y /20 de craft con anclas, severidad, gate cognitivo y gate doble (las usa el subagente revisor-visual). |
| 02B | **02B-ONBOARDING-Y-PAYWALL.md** | El funnel validado de onboarding y paywall (Duolingo, Cal AI, Noom): los 5 trabajos, las 7 reglas, longitud del onboarding, anatomía del paywall y sus 7 preguntas, ética y patrones. |
| 02C | **02C-PRICING-Y-MODELO-DE-NEGOCIO.md** | Pricing y modelo de negocio: los 3 modelos, matriz A-F por nicho, efecto señuelo, créditos por resultados, el puente de checkout, métricas de monetización y trial. |
| — | **INICIO.md** | Protocolo de arranque: el agente lo ejecuta cuando le dices "comenzar". Pregunta crear vs mejorar, pide referencias visuales y las analiza. |
| — | **PLANTILLA-ESTADO.md** | Plantilla de la memoria del proyecto (ESTADO.md) que el agente mantiene. |

---

## Paso 0 — Antes de empezar (una sola vez en tu computadora)

Si nunca usaste una herramienta así, esto es lo único que necesitas instalar. ~15 minutos.

1. **Node.js** (el motor que corre las apps): descárgalo de [nodejs.org](https://nodejs.org) (versión LTS) e instálalo con doble clic. Es el único requisito técnico.
2. **Claude Code** (el agente que construye, lee CLAUDE.md): es una herramienta de terminal/escritorio de Anthropic. Instálalo siguiendo su guía oficial. *(Alternativa: Codex, que lee AGENTS.md.)*
3. **Abrir la terminal** y situarte en la carpeta del proyecto:
   - **Mac**: abre la app *Terminal* (Spotlight → "Terminal"); escribe `cd ` y arrastra la carpeta del proyecto a la ventana, Enter.
   - **Windows**: en el Explorador, entra a la carpeta, clic en la barra de ruta, escribe `cmd`, Enter.
4. **Abrir el agente en esa carpeta** (`claude` en la terminal, o abrir la carpeta desde la app). Listo: ya puedes pegar el primer prompt.

> No necesitas saber programar. El agente escribe el código; tú apruebas, ajustas y revisas el resultado renderizado. Si algo del Paso 0 se traba, pídele ayuda al propio agente describiéndole tu sistema operativo.

---

## Setup Inicial (5 minutos, una sola vez por proyecto)

1. **Crea la carpeta de tu proyecto** y dentro copia:
   - `CLAUDE.md` y `AGENTS.md` → en la **raíz** del proyecto
   - La carpeta completa del sistema → en `docs/sistema/` dentro del proyecto

```
mi-app/
├── CLAUDE.md          ← lo lee Claude Code automáticamente
├── AGENTS.md          ← lo lee Codex automáticamente
├── ESTADO.md          ← lo crea y mantiene el agente (memoria del proyecto)
├── docs/
│   └── sistema/       ← todos los archivos del sistema (00-63 + 02B + 02C) + plantillas
└── src/               ← el código de tu app
```

2. **Para arrancar, pega el PROMPT-ARRANQUE.txt** (incluido en el sistema) en tu primer mensaje a Codex o Claude Code. Es mejor que solo decir "comenzar" porque le indica al agente que lea SOLO el CLAUDE.md primero (eficiente, sin malgastar tokens) y luego te pregunte qué quieres hacer. El agente detecta si hay proyecto en curso, o te pregunta crear-desde-cero vs mejorar-existente, y te pide referencias visuales para definir la dirección. Si dejaste el sistema como ZIP en la carpeta, él lo instala solo y en silencio: **lo primero que deberías ver es la pregunta con las 3 opciones** — si en su lugar te narra pasos técnicos de instalación, respóndele "sigue el PASO 2 de INICIO.md: solo la pregunta".

3. **Eso es todo.** A partir de aquí, **el agente lee los archivos por sí mismo**: cuando le pidas definir la idea, leerá la ideación; cuando le pidas código, leerá creación + tokens + diseño emocional. Ya no necesitas subir archivos manualmente en cada sesión — la tabla de ruteo dentro de CLAUDE.md/AGENTS.md le dice qué leer para cada tipo de tarea.

4. **El agente además mantiene `ESTADO.md`**: un archivo con las decisiones tomadas, lo hecho y lo pendiente. Es su memoria entre sesiones — cuando vuelvas mañana, el agente lo lee y retoma exactamente donde quedó, sin que tengas que explicarle nada.

> **Nota**: Si usas Claude Chat u otra IA de chat (no un agente con acceso a archivos), ahí sí aplica el método manual: cargar `00-SISTEMA-MAESTRO.md` + el archivo de la fase en cada sesión, como indica la REFERENCIA-RAPIDA.

---

## Los 3 Caminos de Uso

### 🛣️ Camino A: "No tengo idea / Tengo una idea vaga" (proceso completo)

Con el setup hecho (sistema en `docs/sistema/`), no memorizas ningún plan: pega `PROMPT-ARRANQUE.txt` (o di "comenzar") y el agente ejecuta el protocolo de `INICIO.md` — investiga el mercado, te pide referencias visuales y te presenta el **Plan Maestro de 8 sesiones** para que lo apruebes.

**El plan de sesiones canónico vive en `INICIO.md` (sección B5) — esa es la fuente única.** Esta tabla es solo el resumen para que sepas qué esperar:

| Sesión | Foco | Qué obtienes |
|---|---|---|
| 1 | Validación, monetización y arquitectura | Viabilidad confirmada · estrategia onboarding/paywall · modelo de datos y auth diseñados |
| 2 | Identidad visual y sistema de diseño | Paleta, tipografía y tokens · ficha de dirección de arte en ESTADO.md |
| 3 | Página de ventas | Landing premium con promesa, visual real/mock realista, pricing/garantía y CTA |
| 4 | Onboarding, paywall y login | Onboarding personalizado · preview/resultado · paywall · acceso sin fricción |
| 5 | App interna simplificada | 3-5 secciones máximo · 1 protagonista por sección · estados completos |
| 6 | Integraciones reales y seguridad | GitHub→Vercel certificado · Supabase/RLS · IA server-side · ambientes aislados · Resend · dominio/Auth/callbacks · Hotmart |
| 7 | Testing, animaciones, pulido y rigor | Bugs corregidos · animaciones baseline · pantallas renderizadas · checklist 48 |
| 8 | Adquisición, lanzamiento y backoffice | Tráfico · lead magnet/email · funnel instrumentado · panel de admin |

Las Sesiones 1-7 dejan la app lista para vender; la 8 es crecimiento y operación. En cada sesión el agente lee él mismo los archivos que le tocan (tabla de ruteo de `CLAUDE.md`) y cierra proponiéndote el siguiente paso.

En cada sesión nueva, el agente lee `ESTADO.md` y retoma solo. Si notas que no lo hizo, dile: "lee el ESTADO.md primero" (o pega `PROMPT-RETOMAR.txt`).

### 🛣️ Camino B: "Ya tengo una app y quiero mejorarla"

Una sola sesión de auditoría:

```
Subir: 03-PRINCIPIOS-APP-EXITOSA.md + 06-TESTING.md + 07-PULIDO.md + 11-DISENO-EMOCIONAL.md
     + los archivos de tu app (o abrir Codex/Claude Code en la carpeta del proyecto)

Prompt: "Audita esta app contra los principios, ejecuta los tests y revisa el pulido
y el diseño emocional. Si falta contexto importante, hazme 2-4 preguntas simples.
Primero dame el reporte y el plan; cuando yo apruebe, corrige por capas y dame el
reporte de cambios."
```

Y antes de relanzarla: una sesión extra con `09-SEGURIDAD.md`.

### 🛣️ Camino C: "Solo quiero que la IA codee bien" (modo mínimo)

Pon `CLAUDE.md` + `AGENTS.md` en la raíz del proyecto. Nada más. Cada sesión de código ya aplicará automáticamente: tokens de diseño, accesibilidad, seguridad de API keys, verificación con build/typecheck, y diseño emocional básico.

---

## Reglas de Oro para Sacarle el Máximo Provecho

**1. No cargues archivos a mano — SOLO si usas una IA de chat SIN acceso a archivos (no Claude Code/Codex) aplica el límite.** En ese modo manual, nunca subas todos los archivos a la vez: saturas el contexto de la IA y le queda poco espacio para pensar — sube solo los de la fase actual (2-3 por sesión). Con Claude Code/Codex esta regla NO aplica: el agente lee él mismo los archivos que la tabla de ruteo le indica (pueden ser bastantes más) y gestiona su propio contexto.

**2. La memoria del proyecto es `ESTADO.md`, no tú.** Con Claude Code/Codex, el agente guarda ahí las decisiones, lo hecho y lo pendiente, y lo lee solo al arrancar cada sesión — no tienes que pegarle nada, como mucho recuérdale "lee el ESTADO.md primero". "Tú eres la memoria" aplica ÚNICAMENTE en modo chat sin acceso a archivos: ahí sí guarda los entregables de cada fase (App Brief, arquitectura, decisiones de diseño) y pégalos al inicio de la siguiente sesión.

**3. Exige el reporte de verificación.** Al final de cada sesión de código, la IA debe reportar: `tsc ✓ | build ✓ | dev ✓`. Si no lo hace, pídeselo: "ejecuta la verificación del ciclo agéntico antes de cerrar". Esa es la diferencia entre código bonito y código que funciona.

**4. Aprueba o ajusta, no redescribas.** El sistema está diseñado para que la IA proponga y tú digas "sí", "no" o "cambia X". Si te encuentras escribiendo párrafos largos explicando lo que quieres, algo falló en una fase anterior — vuelve a ella.

**5. No te saltes la validación (Fase 1).** Es tentador ir directo al código. Pero una app sin estrategia de retención ni economía de IA calculada es una app que pierde dinero aunque funcione perfecto.

**6. Respeta el límite de 3-5 features.** El sistema va a resistirse cuando quieras meter 10 funciones. Déjalo. Las apps que venden hacen UNA cosa increíblemente bien.

**7. La fase de pulido no es opcional.** La diferencia entre "app hecha con IA" y "app que la gente paga" está en la Sesión 7 (testing, animaciones, pulido y rigor de entrega), no en las sesiones de construcción (plan canónico de 8 sesiones en `INICIO.md` B5).

**8. Si la IA se desvía de las reglas**, recuérdaselo con una línea: "revisa el CLAUDE.md / el archivo de principios y corrige". Los agentes a veces pierden el hilo en sesiones largas — es normal, solo redirígelos.

**9. Actualiza el sistema con lo que aprendas.** ¿Descubriste un error recurrente? ¿Un patrón que funciona? Agrégalo al archivo correspondiente. Este sistema es un activo vivo, no un PDF muerto.

---

## Preguntas Frecuentes

**¿Funciona con cualquier IA?**
Está optimizado para Codex (lee AGENTS.md) y Claude Code (lee CLAUDE.md). En Claude Chat, ChatGPT u otra IA de chat, carga `00-SISTEMA-MAESTRO.md` + el archivo de fase como contexto manual.

**¿Cuánto tarda crear una app completa?**
Con el proceso completo: 8 sesiones de trabajo (ver el plan en `INICIO.md`; las Sesiones 1-7 dejan la app lista para vender, la 8 es crecimiento y operación). Entre 1 y 3 días reales según tu ritmo. Una app simple sin backend puede salir en menos sesiones, pero no debe saltarse la secuencia maestra.

**¿Necesito saber programar?**
No para usarlo. Sí ayuda entender conceptos básicos (qué es un deploy, qué es una API) para tomar mejores decisiones cuando la IA te pregunte. El sistema explica lo necesario en el camino.

**¿Qué hago si la app da errores?**
Sesión con `06-TESTING.md` + `12-FLUJO-AGENTICO.md` y el prompt: "ejecuta el ciclo completo de verificación, encuentra todos los errores y corrígelos sin avanzar hasta que tsc y build pasen limpios".

**¿Puedo usar esto para apps de clientes o para enseñar?**
Sí. El sistema es agnóstico al nicho: funciona para tu app, la de un cliente, o como material de enseñanza del proceso profesional completo.

**¿En qué orden leo los archivos si quiero entender el sistema a fondo?**
INSTRUCCIONES → REFERENCIA-RAPIDA → 03-PRINCIPIOS → 11-DISENO-EMOCIONAL → CLAUDE.md. Con esos 5 entiendes la filosofía completa. El resto son manuales de ejecución para la IA.
