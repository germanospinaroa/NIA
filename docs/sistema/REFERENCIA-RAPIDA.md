# REFERENCIA RÁPIDA — Sistema Operativo para Web Apps con IA

---

## Cómo Usar en Codex

### Setup Permanente (hacer una vez por proyecto)

```
mi-app/
├── CLAUDE.md          ← lo lee Claude Code automáticamente
├── AGENTS.md          ← lo lee Codex automáticamente (idéntico)
├── ESTADO.md          ← lo crea y mantiene el agente (memoria entre sesiones)
└── docs/sistema/      ← todos los archivos 00-63 + 02B + 02C + plantillas del sistema
```

Con esto, **el agente lee los documentos por sí mismo** según la tarea (la tabla de ruteo está en CLAUDE.md/AGENTS.md) y mantiene `ESTADO.md` con las decisiones y el progreso. Los prompts de abajo siguen el flujo por fases; el método de "subir archivos manualmente" solo aplica si usas una IA de chat sin acceso a archivos.

### Los archivos MD adicionales (numerados) se cargan solo cuando los necesitas, como contexto extra para fases específicas.

---

## ESCENARIO 1: Crear una App desde Cero

**El plan canónico es el de 8 sesiones de `INICIO.md` (sección B5) — esa es la fuente única del plan de sesiones; no uses otro mapa.** Con Claude Code/Codex NO subes archivos: el agente presenta ese Plan Maestro y lee él mismo los archivos de cada sesión (tabla de ruteo de CLAUDE.md).

**Para arrancar (Sesión 1):** pega `PROMPT-ARRANQUE.txt` (o simplemente di "comenzar").

**Para cada sesión siguiente:**
```
Lee ESTADO.md y continúa con la siguiente sesión del Plan Maestro (INICIO.md, sección B5).
```

Resumen del plan (los archivos exactos, condicionales y entregables de cada sesión están en `INICIO.md` B5):

| Sesión | Foco |
|---|---|
| 1 | Validación, AVATAR (cliente ideal), monetización y arquitectura |
| 2 | Identidad visual y sistema de diseño |
| 3 | Página de ventas |
| 4 | Onboarding, paywall y login |
| 5 | App interna simplificada |
| 6 | Integraciones reales y seguridad |
| 7 | Testing, animaciones, pulido y RIGOR DE ENTREGA (48) |
| 8 | Adquisición, lanzamiento y backoffice |

> Solo si usas una IA de chat SIN acceso a archivos: sube `00-SISTEMA-MAESTRO.md` + los archivos que `INICIO.md` B5 lista para la sesión en curso, como contexto manual, sesión por sesión.

---

## ESCENARIO 2: Mejorar una App Existente

### Sesión Única — Auditoría + Fixes
**Archivos a subir:** `03-PRINCIPIOS-APP-EXITOSA.md` + `06-TESTING.md` + `07-PULIDO.md` + `11-DISENO-EMOCIONAL.md`
(CLAUDE.md ya está en la raíz)
**Prompt:**
```
Tengo una app web existente que necesita revisión profesional.
[Adjuntar archivos del proyecto]

Haz lo siguiente en orden:
1. Revisa contra los mandamientos y anti-patrones del archivo de Principios (03)
2. Ejecuta los tests del archivo de Testing (funcional, edge cases,
   responsive, accesibilidad, performance, seguridad)
3. Aplica el pulido del archivo de Pulido
4. Primero entrégame el reporte y espera mi OK antes de tocar código
5. Corrige solo lo aprobado, por capas, verificando cada cambio
6. Dame un resumen de qué cambió y qué quedó pendiente

Si falta contexto importante, pregúntame en palabras simples antes de actuar.
```

### Sesión Extra — Seguridad Pre-Deploy
**Archivos a subir:** `09-SEGURIDAD.md` + `27-REVISION-SEGURIDAD.md`
**Prompt:**
```
Revisa la seguridad de esta app antes de desplegarla:
[Adjuntar archivos del proyecto]
- Verifica que no hay API keys en el frontend
- Verifica que los inputs se sanitizan
- Verifica RLS si usa Supabase
- Genera las páginas legales mínimas
- Aplica todos los fixes
```

---

## ESCENARIO 3: Solo Necesito el CLAUDE.md

Si ya sabes lo que estás haciendo y solo quieres que Codex siga buenas prácticas mientras codea, solo necesitas el `CLAUDE.md` en la raíz del proyecto. Nada más.

Codex lo leerá automáticamente y aplicará: tokens de diseño, accesibilidad, seguridad, patrones de código, convenciones de nombres, y el checklist de calidad.

---

## Estructura de Archivos

```
PARA AGENTES DE CÓDIGO (automático):
  CLAUDE.md                        # Lo lee Claude Code. Reglas de código + verificación.
  AGENTS.md                        # Lo lee Codex. Idéntico a CLAUDE.md.

PARA CARGAR POR SESIÓN (cuando necesites la fase):
  01-IDEACION.md                   # Fase 0: Sin idea → App Brief
  02-VALIDACION.md                 # Fase 1: Viabilidad + retención + pricing
  03-PRINCIPIOS-APP-EXITOSA.md     # Fase 2: 16 principios UX (10 mandamientos + 6 adicionales) + anti-patrones
  04-ARQUITECTURA.md               # Fase 3: Pantallas + flujos + wireframes
  05-CREACION.md                   # Fase 4: Proceso de código paso a paso
  06-TESTING.md                    # Fase 5: QA + Core Web Vitals + WCAG
  07-PULIDO.md                     # Fase 6: Micro-interacciones + copy + SEO
  08-DEPLOY.md                     # Fase 7: Vercel + Supabase + Analytics
  09-SEGURIDAD.md                  # Transversal: seguridad técnica — BFF, rate limit, XSS, CSP, RLS
  10-DESIGN-TOKENS.md              # Transversal: Tokens + Dark mode + Tailwind
  11-DISENO-EMOCIONAL.md           # Transversal: Personalidad + Celebración + Movimiento
  12-FLUJO-AGENTICO.md             # Transversal: Verificación + Framework + Costos de IA
  13-INFRA-ESCALABILIDAD.md        # Transversal: Arquitectura + Escalar a 500-1000 usuarios
  14-LEYES-DE-DISENO.md            # Transversal: Especificaciones exactas de diseño (anti-genérico)
  15-PATRONES-UX.md                # Transversal: Patrones UX de alto impacto en retención
  16-DIRECCION-DE-ARTE.md          # Transversal: Identidad visual audaz (anti-genérico, nivel gusto)
  17-VISUALIZACION-DATOS.md        # Transversal: Gráficos y dashboards premium
  18-VENTA-HOTMART.md              # Transversal: Venta por Hotmart + Resend (por defecto)
  19-PAGINA-DE-VENTAS.md           # Transversal: Landing de alta conversión + copy
  20-ASSETS-VISUALES.md            # Transversal: Logo, favicon, imágenes (ChatGPT/Gemini)
  21-BACKOFFICE.md                 # Etapa: Panel de admin del dueño (ventas, errores, métricas)
  02B-ONBOARDING-Y-PAYWALL.md      # Estrategia: funnel onboarding→paywall (5 trabajos, 7 reglas, anatomía, 7 preguntas)
  02C-PRICING-Y-MODELO-DE-NEGOCIO.md # Estrategia: pricing, 3 modelos, matriz A-F, señuelo, créditos, puente de checkout, trial
  22-LIBRERIAS-Y-CRAFT.md          # Transversal: Librerías de animación/íconos + animaciones baseline
  23-SKILLS-COMUNIDAD.md           # Setup: Skills de diseño de la comunidad (opcional)
  24-GAMIFICACION.md               # Retención: hábito (Hooked), rachas, XP, recompensa variable, anti-patrones
  25-BASE-DE-DATOS.md              # Backend: esquema, índices, migraciones seguras, EXPLAIN, pooling
  26-AUTH-MODERNO.md               # Auth 2026: passkeys, sesión/tokens, rate limits, MFA, anti-enumeración
  27-REVISION-SEGURIDAD.md         # Seguridad: OWASP Top 10:2025, semgrep, deps, secretos (pre-venta)
  28-INGENIERIA-NEXTJS.md          # Next.js: RSC, Server Actions, caché, Core Web Vitals
  29-REFERENCIA-VISUAL.md          # Diseño: paletas y tipografías por nicho (lookup rápido)
  30-INTEGRACION-IA.md             # IA: texto (streaming/caching), imagen/audio (async+Storage), resiliencia, costo
  31-EVALS-OBSERVABILIDAD-OPERACION.md # IA: evals (golden set), observabilidad (ai_calls), CI/CD, runbook, soporte
  32-DEL-MVP-AL-PRODUCTO.md         # El listón: de MVP básico/plano/vacío a producto enriquecido y vendible (¡míralo renderizado!)
  33-RAG-Y-CONTEXTO.md             # RAG sobre documentos: pgvector, chunking, retrieval, hybrid, reranking (solo si hace falta)
  34-ADQUISICION-Y-TRAFICO.md      # Distribución: afiliados Hotmart, paid ads, contenido/SEO, lead magnet + email
  35-LANZAMIENTO.md                # Lanzamiento: playbook 5 fases, oferta de fundadores, order bump/upsell, prueba social desde cero
  58-RETENCION-DE-INGRESOS.md      # Retención de ingresos: churn, dunning, win-back, referidos, renovación anual
  36-ANALITICA-Y-EVENTOS.md        # Analítica de producto: PostHog, taxonomía de eventos, funnel → North Star
  37-FEATURE-FLAGS-Y-EXPERIMENTOS.md # Feature flags, A/B, kill-switch, rollout gradual
  38-PERFORMANCE-BUDGET.md         # Presupuesto de performance + Core Web Vitals como gate de CI (LATAM)
  39-INTERNACIONALIZACION.md       # i18n / multi-mercado (Brasil pt-BR, monedas LATAM) con next-intl
  40-UNIT-ECONOMICS.md             # Economía unitaria: COGS, margen, break-even, LTV:CAC (¿es viable?)
  41-CRAFT-DE-ANIMACION.md         # Animación de élite: cuándo NO animar, easing perceptual, runtime GPU, View Transitions, motion narrativo
  42-UX-WRITING.md                 # Microcopy de interfaz: nombres de controles, errores, consistencia de verbos
  52-COPY-VISUALES-CONVERSION.md   # Conversion: headline, visual de valor, garantia concreta, marca y CTA
  43-MICRO-CRAFT-Y-EJECUCION.md    # Última milla verificable: micro-tipografía, overflow/min-w-0, forms, touch, dark robusto, URL-estado
  44-DESCUBRIMIENTO-DE-USUARIO.md  # Investigar el problema con usuarios reales (Mom Test/JTBD, screener, síntesis) antes del gate de pago
  45-SEO-TECNICO.md                # SEO técnico: metadata dinámica, sitemap/robots, schema.org, ISR, programmatic SEO
  46-EMAIL-DELIVERABILITY.md       # Que el email no caiga en spam: SPF/DKIM/DMARC, subdominio dedicado, warmup, higiene
  47-LEGAL-FISCAL-Y-PRIVACIDAD.md  # Operación post-venta: fiscal/legal LATAM, ToS/refund/disclaimer IA, privacidad LGPD, moderación
  59-SOPORTE-CLIENTE.md            # Soporte al cliente: canales por etapa, SLA, plantillas, soporte-como-retención
  60-OPERACION-DE-CONVERSION.md     # Conversion: sesiones limpias, QA, atribucion, Hotmart, funnel hasta primer cobro
  61-INTEGRIDAD-DE-LANZAMIENTO.md   # Bloqueantes binarios: claims/auth/pagos/privacidad/RPC/IA/dinero/release
  62-PUBLICACION-SEGURA-Y-CONTINUA.md # GitHub→Vercel persistente, Supabase target, ambientes, dominio y cero secretos en chat
  63-EMBUDO-DE-CHAT.md             # EMBUDO DE CHAT: Meta Ads → página propia con formato de conversación (botones, sin WhatsApp real) → Hotmart
  48-RIGOR-DE-ENTREGA.md           # La app casi perfecta desde la v1: auto-QA E2E, pre-mortem, invariantes dinero/datos/seguridad, circuit-breaker IA, manual del dueño
  49-SISTEMA-DE-COMPONENTES.md     # Componentes des-genericados: button, card, sheet, skeleton, empty state (código real)
  50-DISENO-ONBOARDING-PAYWALL.md  # Blueprints a 375px del onboarding y paywall (medidas, motion, copy)
  51-STACK-PINEADO.md              # Scaffold canónico con versiones pineadas + .env de referencia
  53-PANTALLA-CANONICA.md          # 2 pantallas ejemplares COMPLETAS y compilables (copiar composición, jamás valores)
  54-BANCO-DE-DIRECCIONES.md       # 12 direcciones de arte nombradas + recetas CSS ownables + protocolo A/B/C (elegir/combinar/pedir otras)
  55-DISENO-DE-LANDING.md          # Blueprints visuales de la landing: hero, pricing con señuelo, sticky CTA
  56-MOMENTOS-EMOCIONALES.md       # M0 (el ritual diario — la pantalla más vista) + los 7 momentos-evento que retienen, con blueprint + código
  57-AVATAR-Y-CONSCIENCIA.md       # El cliente ideal: dolores/deseos/objeciones, consciencia y sofisticación (Schwartz), PNL ética — la FUENTE de todo copy de venta
  RUBRICAS-DE-PANTALLA.md          # Las rúbricas de cierre: /40 usabilidad + /20 craft, severidad, gate doble (las usa el revisor-visual)
  DESIGN-CORE.md                   # Núcleo canónico de diseño (SIEMPRE antes de cualquier interfaz) + EL checklist de cierre visual
  PREFLIGHT-PANTALLA.md            # Tarjeta de ~30 líneas que se relee ANTES de cada pantalla (spec pre-código)
  CHECKLIST-CIERRE.md              # Referencia por dominio al cerrar (diseño, IA, DB, auth, seguridad, gamificación)
  PLANTILLA-FICHA-ARTE.md          # FICHA-ARTE.md del proyecto: la dirección de arte persistente (referencia extraída, brand kit, vetos)
  PLANTILLA-FICHA-AVATAR.md        # FICHA-AVATAR.md del proyecto: el cliente ideal persistente (dolores, deseos, objeciones, consciencia)
  PLANTILLA-REVISION-PANTALLA.md   # Revisión de pantalla (15 campos, antes de aprobar)
  PLANTILLA-SELF-CHECK.md          # Checklist de coherencia del PROPIO SO (refs, fences, IDs, rangos)
  PLANTILLA-FICHA-MERCADO.md       # FICHA-MERCADO.md del proyecto: los números reales del mercado (precio del nicho, ciclo de decisión, medios de pago)
  PLANTILLA-FICHA-MODELO.md        # FICHA-MODELO.md del proyecto: el plano de la app con revenue probado que se modela (blueprint + eje único de diferenciación)
  PLANTILLA-CERTIFICADO-PUBLICACION.md # PUBLICATION-CERTIFICATE.md: evidencia de la publicación segura (62), sin secretos
  PLANTILLA-INTEGRIDAD-LANZAMIENTO.md # Artefactos de evidencia de los gates binarios de integridad (61)
  SECUENCIA-MAESTRA-CONSTRUCCION.md # ¡El archivo de la REGLA CERO!: ventas→onboarding→paywall→login→app→servicios
  MAPA-DE-AUTORIDAD.md             # Qué archivo manda en cada doctrina (resuelve contradicciones entre archivos)
  PROMPT-ARRANQUE.txt              # Pega esto al arrancar un proyecto
  PROMPT-RETOMAR.txt               # Pega esto al volver a una sesión (retoma desde ESTADO.md)
  PROMPT-DEPLOY.txt                # Publica y prueba actualizaciones GitHub→Vercel + Supabase sin compartir secretos
  PROMPT-AUDITORIA.txt             # Auditoría end-to-end (modo --rapido / --exhaustivo): reporte → apruebas → ejecuta
  PROMPT-PRE-LANZAMIENTO.txt       # Certificación go-live: ¿lista para vender? (APTO/NO APTO)
  PROMPT-INTEGRIDAD-LANZAMIENTO.txt # Gates 1-10 + seis artefactos de evidencia
  PROMPT-DISENO.txt                # Diseño premium a nivel estudio (deriva del [CONTEXTO], anti-slop + rúbrica /40)
  PROMPT-ADQUISICION.txt           # Plan de tráfico/clientes (afiliados Hotmart, ads, contenido, email)
  PROMPT-LANZAMIENTO.txt           # Plan de lanzamiento + retención/dunning
  PROMPT-RETENCION.txt             # Implementar gamificación/retención (loop Hooked, rachas, XP)
  PROMPT-LANDING.txt               # Crear/elevar la landing de alta conversión (estructura canónica de 10 secciones)
  PROMPT-EMBUDO-CHAT.txt           # Montar el embudo de chat adaptando la plataforma del curso (guion de 7 etapas del 63)
  PROMPT-BACKOFFICE.txt            # Construir el panel de admin del dueño (ventas, métricas, costo IA)
  PROMPT-RESCATE.txt               # Rescatar una app estancada (flujo + UX + auditoría de seguridad, R1-R5)
  PROMPT-MEJORA-ONBOARDING-PAYWALL.txt # Rehacer onboarding y paywall con datos 2026 + 52
  PROMPT-AUDITAR-SO.txt            # Audita la coherencia del propio SO antes de reempacar el zip
  PROMPT-LEGAL.txt                 # Auditar y perfeccionar la capa legal (privacidad, términos, cookies)
  PROMPT-CONVERSION.txt            # Diagnóstico del funnel hasta el primer cobro (tráfico → onboarding → Hotmart → trial → cobro)
  PROMPT-VELOCIDAD.txt             # Hacer la app rápida en el celular real de LATAM (mide antes y después)
  PROMPT-EMAILS.txt                # Montar todos los correos del negocio con prueba end-to-end real
  PROMPT-ANALITICA.txt             # Instrumentar funnel, atribución y retención, conectados al backoffice
  PROMPT-SOPORTE.txt               # Montar el soporte a compradores (canales, SLA, plantillas)
  PROMPT-PRECIOS.txt               # Cambio de precio post-fundadores con grandfathering
  PROMPT-RETENER-INGRESOS.txt      # Proteger el ingreso que ya entró: cancelación retentiva, dunning, win-back
  PROMPT-OPERACION-MENSUAL.txt     # Revisión mensual del negocio + las 3 acciones del mes
  PROMPT-ITERACION-FEEDBACK.txt    # Convertir el feedback de clientes en máx. 3 mejoras priorizadas
  PROMPT-CONTENIDO-SEMANAL.txt     # El lote orgánico de la semana: guiones short-form + carrusel
  PROMPT-CRITICA-DE-EXPERTOS.txt   # Panel de 4 expertos critica sin piedad (solo diagnóstico)
  PROMPT-NUEVA-APP.txt             # Crear una app desde cero en CUALQUIER nicho (respuestas adelantadas, referencia opcional)
  INICIO.md                        # Protocolo de arranque ("comenzar") + análisis de referencias
  PLANTILLA-ESTADO.md              # Plantilla de la memoria del proyecto

YA NO NECESITAS CARGAR:
  00-SISTEMA-MAESTRO.md            # Reemplazado por CLAUDE.md para Codex
```

---

## Reglas de Oro (resumen)

1. **Mínimo esfuerzo para el usuario** — La IA propone y ejecuta, el usuario aprueba
2. **Valor en 30 segundos** — Resultado útil antes de configurar nada
3. **1-2 acciones por pantalla** — Si hay más, modal o nueva pantalla
4. **Onboarding según nicho (02B)** — B2B ≤5 pantallas (ideal 2-3); B2C de personalización 4-8 pasos (9-20 solo si el diagnóstico ES el producto)
5. **Feedback en toda interacción** — Hover, loading, éxito, error
6. **Mobile first** — 70%+ viene del celular
7. **Copy humano** — "Generar mi propuesta", no "Submit"
8. **Código completo** — Nada de TODO o placeholders
9. **Tokens, no colores directos** — CSS variables para todo
10. **API keys en el servidor** — NUNCA en el frontend
