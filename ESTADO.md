# ESTADO — NIA
Última actualización: 2026-10-03 | Sesión actual: intención estructurada + mensajes con valor + Evolution — implementación lista, activación externa pendiente

## Control admin para QA real — 2026-10-03
- Añadido el control "Prueba real de NIA" en /admin/users/[id], reutilizando la sesión administrativa existente y el endpoint POST /api/admin/qa/daily-intervention.
- La UI exige confirmación explícita, deshabilita la acción durante la ejecución y evita un segundo click o una segunda solicitud en la misma vista. Muestra planner, generación, interacción, delivery y estados separados de Evolution/WhatsApp.
- La ficha administrativa ahora lee el estado real de profiles.whatsapp_enabled y whatsapp_connections; no inventa que WhatsApp está conectado.
- Tests, typecheck, lint y build pasan. La prueba real NO fue ejecutada desde Codex; queda para el administrador desde su navegador autenticado.

## Auditoría editorial — 2026-10-03

EDITORIAL_AUDIT_COMPLETED=yes
EDITORIAL_CANONICAL_INTERVENTION_TABLE=public.interventions
COMMUNICATION_PREFERENCE_FIELD=NEW profiles.communication_preference
EDITORIAL_FIELDS_EXISTING=function,concept,angle,structure,audit_results,desired_change_snapshot,current_context_snapshot,profiles.learning_profile,context_history,desired_change_history
EDITORIAL_FIELDS_MISSING=profiles.communication_preference,interventions.topic,interventions.intervention_type,interventions.depth,interventions.blocks,interventions.editorial_strategy,interventions.editorial_reason
SAFE_TO_IMPLEMENT=yes

La auditoría read-only del esquema observable de Production confirmó que no existe una tabla `learning_profile`; `learning_profile` es JSONB en `profiles`. Las intervenciones históricas viven en `public.interventions` y ya conservan función, concepto, ángulo, estructura, texto y auditorías. `intervention_candidates` conserva el texto y metadata de candidatos, pero no es la fuente canónica de intervenciones entregadas. Las nuevas columnas serán aditivas y nullable para no inventar metadata histórica. La preferencia de comunicación no se mezclará con `voice_style`: `voice_style` representa el estilo existente y no tiene los valores editoriales `idea|practical|structured|adaptive`.

Decisión editorial: NIA deriva su memoria principalmente de `interventions`; no se crea una tabla paralela de memoria. El planner se ejecuta antes de generar contenido y la entrega WhatsApp permanece fuera de alcance.

## Memoria editorial y diversidad adaptativa — 2026-10-03
- Añadida la migración pendiente `20261003120000_editorial_memory.sql`. Es aditiva: agrega `profiles.communication_preference` con default `adaptive` y metadata nullable en `interventions` y `intervention_candidates` (`topic`, `intervention_type`, `depth`, `blocks`, `editorial_strategy`, `editorial_reason`). No modifica ni elimina datos históricos.
- `lib/server/editorial-memory.ts` deriva las últimas intervenciones, recurrencia de temas, ángulos, formatos y profundidad. La saturación es determinista y distingue tema repetido de idea/ángulo repetido.
- `lib/server/editorial-planner.ts` decide `continue_topic`, `change_angle`, `refresh_topic` o `explore_adjacent` con prioridad relevancia → valor → diversidad → preferencia → novedad → profundidad. La preferencia solo cambia pesos; no impone una plantilla.
- El contrato nuevo de generación usa `topic`, `concept`, `angle`, `intervention_type`, `depth` y `blocks[]`. `composeCandidateText()` compone los bloques y numera solo los bloques `step`; no exige recognition, insight, action, question o steps en todos los mensajes.
- El auditor acepta formatos flexibles, valida requisitos específicos de `step_by_step`/`tool`, detecta repetición interna por bloques y conserva `same concept != duplicate`. Reutilizar una estructura reciente es una advertencia, no un rechazo automático.
- Onboarding y `/app/tú` permiten elegir `idea`, `practical`, `structured` o `adaptive`; los usuarios existentes se inicializan en `adaptive` al aplicar la migración. Admin user detail y dashboard muestran el mapa editorial agregado.
- Tests offline nuevos: `test:editorial-memory`, `test:editorial-planner`, `test:flexible-interventions`, además de structured output actualizado. No hubo llamadas OpenAI, embeddings, semantic judge, LLM audit, Evolution, WhatsApp ni cron.
- Pendiente para Production: aplicar `supabase/migrations/20261003120000_editorial_memory.sql`. El cambio de código queda validado localmente y NO está desplegado.

## QA admin de generación editorial — 2026-10-03
- Añadido `POST /api/admin/qa/daily-intervention`, protegido por la sesión Supabase existente y `NIA_ADMIN_EMAILS`; no usa `CRON_SECRET` ni crea roles nuevos.
- El endpoint recibe únicamente `user_id`, valida usuario y conexión WhatsApp, ejecuta el mismo `resolveIntervention()` que usa el flujo diario con `maxGenerationAttempts: 1`, y reutiliza composer, claim y envío Evolution existentes.
- La ejecución usa `trigger_source=admin_qa`, `request_id`/`idempotency_key` deterministas por usuario y fecha, y un delivery marcado con slot `qa`; una repetición devuelve el resultado existente y no vuelve a generar ni enviar.
- No se añadió una página pública ni una UI nueva de QA; la operación queda disponible únicamente como endpoint admin hasta una futura herramienta dentro del back office.
- No se creó una tabla nueva ni se modificó el cron. La prueba real sigue pendiente de instrucción explícita.

## Refinamiento UI app — 2026-10-03
- `/app` quedó centrado en saludo real, intervención almacenada y una frase natural del próximo mensaje; se eliminaron el estado de conexión redundante y cualquier apariencia de dashboard en la primera pantalla.
- `lib/next-message.ts` conserva el cálculo existente y añade el formato humano “Tu próximo mensaje llegará hoy/mañana a…” sin exponer slots, timezone ni IDs.
- `/app/tú` prioriza cuenta, plan y preferencias; el estado del plan no inventa fechas cuando faltan y distingue cancelación solicitada. `/activate` usa “Continuar”.
- Tests UI y próximo mensaje pasan; typecheck/build pasan; lint mantiene cuatro warnings heredados. QA visual capturada en `output/playwright/ui-refinement-login-390.png`, `ui-refinement-activate-390.png` y `ui-refinement-login-1440.png`. La QA autenticada de `/app` y `/app/tú` queda pendiente de sesión controlada.
- No se modificaron generación, auditorías, composer, WhatsApp, Evolution, cron, scheduler, delivery, idempotencia, slots, Hotmart ni suscripciones.

## Auth Hotmart y duplicados diarios — 2026-10-03
- Causa del duplicado confirmada: `runDailyWhatsApp()` obtenía una sola `daily_message` por usuario/fecha antes de recorrer los slots y la reutilizaba; además `interactions_daily_once` impedía representar dos interacciones diarias.
- Corregido el pipeline para generar/obtener una interacción por `local_date + slot` (`1`/`2`) y mantener delivery idempotente por `user_id + local_date + slot`. Añadida migración `20261003060000_daily_interactions_by_slot.sql`; no se editaron migraciones históricas.
- Añadido `test:daily-whatsapp-idempotency`: cubre slots separados, reejecución, delivery único y contenidos distintos como contrato de scheduling. No hubo Evolution ni WhatsApp real.
- Login normal ahora usa email + contraseña. `/activate` usa el enlace de invitación de Supabase para crear la contraseña una sola vez y completa `must_set_password/account_status` server-side.
- Añadidos webhook idempotente `/api/webhooks/hotmart`, entitlements, eventos Hotmart, campos ampliados de suscripción, consulta/cancelación server-side y sección `Tu plan` en `/app/tú`. Variables nuevas: `HOTMART_HOTTOK`, `HOTMART_CLIENT_ID`, `HOTMART_CLIENT_SECRET`.
- Tests, typecheck, lint y build pasan; lint conserva cuatro warnings heredados. QA pública de login/activación capturada; `/app/tú` autenticada queda pendiente de sesión controlada. No deployment ni llamadas reales a Hotmart, Evolution, WhatsApp u OpenAI.

## Home, próximo mensaje y acceso — 2026-10-03
- `/app` quedó reducido a saludo, mensaje completo almacenado y una línea secundaria con próximo envío y estado de WhatsApp; se eliminaron el pretítulo `HOY`, “Último mensaje disponible” y las tres tarjetas de dashboard.
- `lib/next-message.ts` calcula determinísticamente el siguiente horario usando la frecuencia, ambas franjas y el timezone del perfil. Un slot exactamente en el minuto actual se considera ya procesado de forma conservadora y se toma el siguiente futuro o el primer slot del día siguiente.
- `/login` utiliza Magic Link con `shouldCreateUser: false`; conserva las rutas de contraseña sin usarlas para el acceso normal.
- `test:next-message`, tests existentes, typecheck, lint y build pasan. QA local de login realizada a 390×844 y 1440×900; la home autenticada no pudo abrirse sin una sesión controlada. No hubo llamadas API de IA, WhatsApp, cron ni deployment.

## Calidad del generador y auditor — 2026-10-03
- Ajustadas offline las instrucciones de generación para que recognition entre directamente en la situación, cada campo aporte una función distinta, action no repita steps y closing exprese una consecuencia práctica.
- El auditor LLM ahora distingue reconocimiento contextual natural de voz de chatbot y evalúa explícitamente la repetición interna frente a la repetición histórica.
- `unsupported_personal_context` separa anchors inequívocos de usos ambiguos; palabras aisladas como `trabajo`, `proyecto`, `equipo` o `familia` ya no bloquean candidatas.
- Añadidos tests offline para reconocimiento, contexto personal abstracto/concreto y repetición interna. Tests, typecheck, lint y build pasan. No hubo llamadas API, deployment ni prueba real.

## Configuración de mensajes — 2026-10-03
- `/api/profile` ya actualiza perfiles existentes con `update(values).eq('id', user.id)`; se eliminó el `upsert` del guardado de configuración.
- Los errores del PATCH registran código, mensaje, detalles e hint server-side saneados, sin exponer SQL al cliente. `/app/tú` conserva los cambios en pantalla si falla y solo actualiza `savedDraft` tras respuesta exitosa.
- Añadido `test:profile-settings` para cubrir configuraciones de 1 y 2 mensajes, incluyendo `01:00`, `01:15` y `America/Bogota`.
- Production desplegada en `dpl_CZ5o54jp2K9BL6cWQyYGF9VMHxD4`. La persistencia mediante sesión autenticada real y comprobación directa del perfil requieren un buzón/sesión controlada no disponible en este entorno.

## E2E WhatsApp con límite de costo — 2026-10-03
- Auditoría: `message_frequency=2` y `message_time_1/message_time_2` usan una sola `interactions.daily_message` por usuario/fecha; cada slot tiene su propio delivery y reutiliza el mismo `interaction_id` y contenido.
- Se ejecutó una única generación real controlada para el usuario conectado de prueba, usando el primer slot. Terminó en `no_approved_intervention`; no se creó interacción ni delivery y no se intentó ningún envío. La prueba se detuvo inmediatamente, sin reintentos.
- Tests mock/fixture reforzados para timezone, ventana de 15 minutos, composición, idempotencia/claim/dry-run por contrato y respuestas Evolution 201/404/500/red/no configurado. No hubo llamadas LLM en estas pruebas.

## Envío diario automático por WhatsApp — implementación 2026-10-03
- Se añadió un generador compartido en `lib/server/daily-message.ts`: `/api/daily` y el job usan la misma interacción diaria persistida y el mismo `message-composer`; no existe una segunda lógica psicológica ni una segunda versión del mensaje.
- Se añadió `lib/server/whatsapp-daily.ts`, con elegibilidad por `whatsapp_enabled` + conexión `connected`, timezone individual, franjas `message_time_1/message_time_2`, reserva concurrente y estados `pending/sent/failed`.
- Se añadió `app/api/cron/daily-whatsapp/route.ts`, protegido por `CRON_SECRET`. La migración `20261003040000_whatsapp_daily_deliveries.sql` crea la idempotencia y el registro del delivery. Vercel Hobby rechazó `vercel.json` con cron cada 15 minutos porque ese plan solo permite una ejecución diaria; se retiró esa configuración para no desplegar un scheduler que incumpla los horarios individuales.
- La migración todavía no está aplicada en Supabase Production: la consulta read-only a `whatsapp_daily_deliveries` devuelve HTTP 404 y el CLI de Supabase no tiene token de administración en este entorno. El job verifica ahora esa tabla al inicio y responde `503 daily_whatsapp_unavailable` de forma segura, incluso si no hay usuarios elegibles; no intenta enviar sin el registro de delivery.
- Verificación local: `test:daily-whatsapp`, tests existentes, typecheck, lint y build pasan. No se realizó envío real de WhatsApp en esta implementación porque el esquema de delivery de producción está pendiente.
- Se preparó `supabase/migrations/20261003050000_schedule_nia_daily_whatsapp.sql`: activa `pg_cron`/`pg_net`, lee `nia-cron-secret` desde `vault.decrypted_secrets` y programa `nia-daily-whatsapp` cada 15 minutos. No contiene secretos y falla cerrado si Vault no está configurado.
- No fue posible aplicar ni verificar esta migración en `fybyaeegwhgjzgabxint`: no hay `SUPABASE_ACCESS_TOKEN`, conexión SQL ni sesión de dashboard en el entorno. Por tanto `pg_cron`, `pg_net`, Vault, `cron.job` y `cron.job_run_details` siguen sin certificarse en Production.

## Intención y mensajes — 2026-10-03
- `/app/tú` ya no usa textarea ni autosave para la intención principal. Ofrece exactamente ocho intenciones estructuradas, una opción personalizada y un estado `intention_unclear` guiado en dos preguntas. `Guardar cambios` persiste intención, frecuencia, horario y timezone en una sola operación.
- `/api/profile` rechaza `no se`, `no sé`, vacío, `null`, `undefined` y claves de intención desconocidas; las intenciones estructuradas se normalizan en servidor. `/app` no muestra mensajes ni datos de intención inválidos.
- `/api/daily` no devuelve intervenciones si falta una intención válida. Los mensajes generados deben tener reconocimiento, explicación, insight, herramienta y acción; se excluyen mensajes legacy de una sola frase en Hoy y como fallback.
- Se añadió feedback funcional para el primer mensaje con `¿Esto se acerca a lo que necesitas?`; la opción negativa permite una nota corta y se añadió `feedback_note` a `interactions`.
- WhatsApp admite proveedor `evolution` además de Meta: `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE` y `EVOLUTION_WEBHOOK_TOKEN`; el webhook procesa `messages.upsert`/`remoteJid`, vincula por código de un solo uso y envía por `/message/sendText/{instance}`. La activación real requiere VPS/Evolution configurado y migraciones aplicadas.

## App autenticada — simplificación y WhatsApp — 2026-10-03
- La navegación de `/app` quedó reducida a `Hoy` y `Tú`; `Punto NIA` y `Evidencia` redirigen a `/app` y no forman parte de la experiencia autenticada. No se modificaron `/` ni `/descubre`.
- `Hoy` muestra únicamente intención real, próximo horario y estado de WhatsApp. `Tú` permite editar intención, frecuencia/horarios, cuenta, privacidad y conexión WhatsApp sin nombres ni intenciones fallback.
- Se implementaron endpoints autenticados `/api/whatsapp/connection`, `/link`, `/disconnect`, `/test` y webhook firmado `/api/whatsapp/webhook`; códigos hashados, temporales, de un solo uso y protegidos contra reutilización/takeover.
- Se añadió `supabase/migrations/20261003010000_whatsapp_connections.sql`; las tablas base están verificadas en Supabase Production. Evolution está configurado en Vercel y la UI nunca finge una conexión o envío.
- Se corrigió `middleware.ts` para actualizar cookies del request y copiar las cookies refrescadas a una única respuesta SSR.
- Verificado localmente: typecheck, lint, tests existentes, contrato WhatsApp y build. QA anónima de `/` y `/descubre` realizada; QA autenticada de `/app` queda pendiente de una sesión de test controlada.

## Onboarding — primera intervención bloqueada — 2026-10-03
- Causa real confirmada en producción: `PATCH /api/profile` respondía 200, pero el `GET /api/daily` respondía 500 porque `startGenerationAttempt()` insertaba en `generation_attempts` sin `user_id`. La tabla remota exige ese campo (`PostgreSQL 23502: null value in column "user_id"`). `execution_runs` se creaba y quedaba con `failure_code = generation_attempt_save_failed`; no era un problema de horario, sesión ni `/api/profile`.
- Corrección: los inserts de `generation_attempts` y `execution_provider_calls` ahora incluyen el `user_id` autenticado real. Se añadió logging server-side con código, mensaje, detalle e identificadores operativos saneados cuando falle una escritura de telemetría.
- Verificación read-only en Supabase: ambos payloads con `user_id` fueron aceptados con `Prefer: tx=rollback` (HTTP 201, sin persistir datos); los payloads sin `user_id` reprodujeron HTTP 400/23502. Tests de observabilidad, typecheck, lint y build pasan. La sesión autenticada Playwright no está disponible en el entorno, por lo que el recorrido completo con Magic Link no se marca como PASS.

## Onboarding — horario y primera interacción — 2026-10-02
- Causa reproducida: la selección de horario sí se enviaba a `/api/profile`, pero `/onboarding` trataba la respuesta válida `status: calibration_required` de `/api/daily` como un fallo genérico porque esperaba siempre una interacción inmediata. En la sesión sin Magic Link usada para reproducir también se confirmó un `401 unauthorized`, por ausencia de sesión Supabase real.
- Corrección: se confirma primero el guardado de `profiles.message_time_1` y `timezone`, se conserva el horario en el estado funnel solo después de un PATCH exitoso, y se continúa por la calibración existente (`/api/calibration`) cuando el motor la solicita. Se eliminó el copy de “primer momento” y se usa “mensaje de NIA”. No se cambió el esquema.
- Verificación: test específico cubre morning/midday/afternoon/night, typecheck, funnel, lint y build pasan. El E2E autenticado hasta Supabase no pudo repetirse sin abrir un Magic Link en un buzón controlado.

## Onboarding — 401 en guardado de horario — 2026-10-02
- Reproducción en producción: click en “Por la mañana” → `PATCH /api/profile` → `401` → `{"error":"unauthorized"}`; no se ejecutaban `/api/daily` ni `/api/calibration`.
- Corrección: `/auth/callback` ahora captura y escribe explícitamente en la respuesta de redirección las cookies emitidas por `exchangeCodeForSession`; `/onboarding` queda protegido por sesión real y redirige a acceso si no existe usuario autenticado. No se usa almacenamiento local como sustituto de autenticación.
- Pendiente de certificación: el buzón/Magic Link del usuario real no está disponible en este entorno, por lo que el clic real del correo y el PATCH autenticado no se pueden marcar como PASS aquí.

## Onboarding — flujo definitivo post-auth — 2026-10-02
- `/onboarding` ya no inventa nombre, intención ni contexto: si falta nombre pide el nombre; consume `directionText` cuando existe, permite confirmarlo o corregirlo, pide contexto concreto y después horario.
- Se añadió `/api/calibration` autenticado con GET/POST, validación de opciones, actualización idempotente de `learning_profile.calibration`, `context_history` y campos de contexto del perfil.
- El flujo separa `PROFILE_SAVE_ERROR`, `DAILY_GENERATION_ERROR`, `CALIBRATION_ERROR` y feedback; conserva la intervención y el feedback para refresh y termina en `ready` antes de `/app`.
- Middleware usa una única `supabaseResponse` siguiendo el patrón SSR de cookies. El arnés `test:onboarding-auth` permite probar con una sesión guardada de un entorno de test y rechaza explícitamente producción; en esta sesión no hay variables de entorno de test, por lo que su parte autenticada quedó sin ejecutar.

## Auth — corrección del loop de Magic Link — 2026-10-02
- Causa confirmada: `/acceso` había usado un endpoint propio basado en `auth.admin.generateLink`; ese enlace devolvía sesión implícita en `#access_token`, mientras `/auth/callback` esperaba `?code=` PKCE. Supabase validaba el enlace, pero la aplicación no establecía la sesión y regresaba a `/acceso`.
- Corrección: `/acceso` vuelve a `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo, shouldCreateUser: true } })`; el callback único usa `exchangeCodeForSession(code)`, escribe las cookies SSR y redirige a `/onboarding`. No se usa recovery ni `admin.generateLink` para login normal.
- Errores de callback no reenvían correo: enlaces usados/expirados muestran error y permiten solicitar otro manualmente. `/app` sin sesión redirige a `/acceso`.
- Producción comprobada: `POST /auth/v1/otp` respondió `200` para `germanospinaroa@gmail.com`; callback de enlace expirado/usado responde `307` a `/acceso?error=link_used`; `/app` anónimo responde `307` a `/acceso`; `/` y `/descubre` responden `200`.
- Pendiente de certificación externa: abrir el correo real y completar el clic en Gmail requiere acceso al buzón; el runner no tiene esa sesión. La respuesta 200 confirma aceptación del envío por Supabase, no la lectura de bandeja.

## Funnel /descubre — 11 etapas pre-pago + WhatsApp visual — 2026-10-02
- El flujo pre-pago quedó reducido a: tres pantallas de reconocimiento → evidencia en dos bloques → presentación de NIA → nombre → agradecimiento → conversación visual de WhatsApp → cómo funciona → primera victoria/futuro → planes.
- `/descubre` guarda `recognitionStep`, `recognitionComplete`, `recognitionContext`, `firstName` y `plan` con el sistema funnel existente. El contexto de la conversación se deriva del reconocimiento; no se pide texto abierto ni se llama al LLM.
- Se añadió `components/funnel/WhatsAppDemo.tsx`, reutilizable con `name`, `context` y `message`. Es una representación determinística: no envía WhatsApp ni pide teléfono durante el funnel.
- `/descubre/evidencia` usa las fuentes Santoro & Markus (2024) y Harkin et al. (2016), verificadas en PubMed; distingue explícitamente fundamento del fenómeno frente a eficacia de NIA. `/descubre/presenta`, `/descubre/nombre`, `/descubre/agradecimiento`, `/descubre/vivir`, `/descubre/funciona`, `/descubre/futuro` y `/descubre/planes` contienen las etapas aprobadas.
- Las rutas legacy fuera del recorrido redirigen a la etapa equivalente; no se muestran como pantallas del flujo. Se mantienen planes mensual US$6.99 y anual US$39.99, 7 días gratis y bypass interno, sin Hotmart ni pagos ficticios.
- QA local Playwright: capturas de reconocimiento, evidencia, agradecimiento, WhatsApp, cómo funciona, futuro y planes en 375×812, 390×844, 430×932 y 1440×900; persistencia de refresh, selección mensual/anual y acceso verificados. `/` verificada sin cambios. Sin errores de hidratación tras corregir la restauración de estado.
- Tests PASS: funnel, intervention, operational, dashboard, user-detail, intervention-detail, cost-ledger, `npx tsc --noEmit` y build. Lint PASS con cuatro warnings heredados fuera del cambio. Producción aliasada a `https://nia.gritlab.pro` y verificada en `/descubre`, evidencia, WhatsApp visual, planes y `/`; Magic Link real requiere buzón controlado.

## Funnel /descubre + onboarding — reconstrucción final implementada — 2026-10-02
- La experiencia pública ahora sigue la secuencia aprobada: reconocimiento en tres pantallas aisladas → open loop → presentación humana de NIA → nombre → explicación → evidencia → qué vivirá la usuaria → elección de contexto → situación dinámica → respuesta de NIA → feedback semántico → respuesta adaptada → explicación → futuro → continuidad → planes → acceso.
- Las rutas nuevas son `/descubre/presenta`, `/descubre/razon`, `/descubre/evidencia`, `/descubre/vivir`, `/descubre/contexto`, `/descubre/situacion`, `/descubre/respuesta`, `/descubre/feedback`, `/descubre/adaptacion` y `/descubre/futuro`. Las rutas legacy `/descubre/base`, `/descubre/dia` y `/descubre/prueba` redirigen al recorrido nuevo para no exponer copy técnico antiguo.
- El nombre, el contexto elegido, el feedback y el plan se conservan mediante el estado funnel existente. La respuesta de NIA es determinística y cambia según la situación elegida y la respuesta de la usuaria; no se invoca el LLM para la experiencia pública.
- `/onboarding` quedó como activación post-auth: intro breve → intención concreta → momento preferido → primera interacción real desde `/api/daily` → feedback de un toque → `/app`. No se inventa una intervención si faltan sesión, perfil o configuración.
- Se mantienen precios, trial y bypass: mensual US$6.99, anual US$39.99, 7 días gratis; no se llama Hotmart, no se crean pagos ficticios y no se registra MRR ficticio. `/`, motor, Supabase schema, auth/PKCE, Cost Ledger, admin y app no se modificaron por esta fase.
- Eventos nuevos/conservados: recognition viewed/continue, `understand_viewed`, `name_submitted`, `evidence_viewed`, `demo_viewed`, `context_selected`, `demo_feedback`, `demo_adaptation_viewed`, `future_experience_viewed`, `access_started`, `email_submitted`, `magic_link_requested`, `magic_link_sent`, `intention_submitted`, `timing_selected`, `first_intervention_received` y `first_intervention_feedback`.
- Verificación local: funnel, intervention, operational, dashboard, user-detail, intervention-detail, cost-ledger, typecheck, lint y build PASS. QA visual local realizada en 390×844 y 1440×900; se conservaron capturas bajo `output/playwright/`. Magic Link real requiere un buzón/sesión controlados y no se certificó en esta fase.

## Funnel /descubre — experiencia conversacional final — 2026-10-02
- Se reconstruyó el tramo público posterior al reconocimiento sin tocar `/`, el onboarding interno, auth, Supabase, el motor ni Hotmart.
- `/descubre/entiende` ahora explica el fenómeno de volver a dudar de una dirección propia; `/descubre/base` presenta de forma breve el fundamento de implementation intentions y JITAI con enlaces a Gollwitzer & Sheeran (2006) y Hsu et al. (2025), sin claims clínicos.
- `/descubre/nombre` conserva el nombre anónimo y `/descubre/dia` prepara la interacción sin copy técnico. `/descubre/prueba` muestra una situación, recoge tres respuestas semánticas y genera tres intervenciones determinísticas distintas.
- Se añadió `/descubre/explica` para explicar qué acaba de ocurrir usando dinámicamente el nombre y la respuesta elegida; `/descubre/continuidad` proyecta el uso real y lleva a planes.
- Se conservaron precios y bypass: mensual US$6.99, anual US$39.99, 7 días gratis; no se llama Hotmart ni se registran ventas ficticias. `/acceso` mantiene Magic Link/PKCE y suma eventos de acceso/email.
- Eventos añadidos: `understand_viewed`, `evidence_viewed`, `name_submitted`, `demo_started`, `demo_situation_viewed`, `demo_response_selected`, `demo_intervention_viewed`, `demo_explanation_viewed`, `demo_value_acknowledged`, `continuity_viewed`, `plan_viewed`, `access_started`, `email_submitted`, `magic_link_requested`.
- QA local Playwright: reconocimiento, entiende, fundamento, nombre dinámico, situación, ramas A/B/C, adaptación, explicación, continuidad, planes mensual/anual, acceso; 390×844 y 1440×900; sin errores de consola. Magic Link real sigue sin certificarse sin buzón controlado.

## Onboarding definitivo — revisión integral — 2026-10-02
- `/onboarding` ahora sigue: nombre → conexión humana → explicación del fenómeno → evidencia → por qué existe NIA → explicación de la experiencia → situación → adaptación → explicación de lo vivido → personalización dinámica → mecanismo → onboarding funcional.
- Elimina la pregunta emocional previa porque no alimentaba ninguna decisión real del sistema. La personalización demostrada usa nombre, respuesta de situación y respuesta adaptativa, y se conserva en el estado existente.
- La demo usa las tres respuestas solicitadas: `Empiezo a dudar`, `Me mantengo en lo que decidí` y `Depende mucho de quién me lo diga`; cada una produce una intervención y una segunda pregunta diferentes.
- La evidencia usa exclusivamente `docs/EVIDENCE-NIA.md` y PubMed 16536643: Webb & Sheeran (2006), 47 pruebas, `d = 0.66` para intención y `d = 0.36` para conducta. No se incorporó la segunda cifra sobre influencia del consejo porque no está respaldada en la documentación local disponible.
- No se tocaron auth, Magic Link/PKCE, Supabase, `/api/profile`, selección de plan, bypass, motor de intervención, semantic judge, learning, Cost Ledger, dashboard ni `/`.
- QA Playwright local: flujo completo del onboarding, refresh en respuesta adaptativa, ramas `doubt` y `firm`, 390×844 y 1440×900; sin errores de consola. Capturas en `output/playwright/onboarding-v2-*.png`.
- Tests PASS: funnel, intervention, operational, dashboard, user-detail, intervention-detail, cost-ledger, `npx tsc --noEmit`, lint (4 warnings heredados) y build.
- QA visual ajustada: la pantalla de explicación del fenómeno y la respuesta adaptativa mantienen CTA/opciones visibles en 390×844 tras compactar únicamente esas variantes.
- Producción desplegada en Vercel y aliasada a `https://nia.gritlab.pro`; `/onboarding` carga la nueva primera pantalla sin errores de consola y `/` conserva la landing anterior.

## Onboarding conversacional — reconstrucción — 2026-10-02
- `/onboarding` conserva la misma ruta, autenticación, persistencia anónima, sincronización con `/api/profile`, preguntas funcionales y salida a `/app`; se reconstruyó la experiencia anterior a esas preguntas.
- Nueva secuencia: conexión con nombre dinámico → explicación de la brecha intención/conducta → evidencia Webb & Sheeran con disclosure y enlace PubMed → presentación de NIA → sentimiento conversacional → introducción de la experiencia → situación concreta → respuesta adaptativa → explicación del mecanismo → onboarding funcional existente.
- La evidencia usa únicamente `docs/EVIDENCE-NIA.md`: 47 pruebas, `d = 0.66` para intención y `d = 0.36` para conducta; se aclara que no son porcentajes ni miden NIA.
- Se añadieron al estado funnel `onboardingStage`, `onboardingFeeling`, `onboardingSituationChoice` y `onboardingFollowupChoice`; se reutilizan `sessionStorage`/`localStorage` y `trackFunnel`, sin tablas ni sistemas paralelos.
- La situación tiene tres respuestas determinísticas y cada una cambia la intervención mostrada; la respuesta y la continuación se persisten antes de seguir.
- Se eliminaron eyebrows de programación del onboarding. La identidad visual se mantuvo: marfil, serif editorial, sans, coral y transiciones suaves.
- QA Playwright local: conexión, evidencia, NIA, sentimiento, introducción, situación, respuesta para información nueva y duda personal, explicación, refresh intermedio, dirección, contextos, voz y resumen final; 390×844 y 1440×900, consola sin errores.
- Verificado: `npm run test:funnel`, `npm run typecheck`, `npm run lint` y `npm run build` PASS. Lint conserva 4 warnings heredados fuera de onboarding.
- Deploy production completado y aliasado a `https://nia.gritlab.pro`; `/onboarding` responde en producción sin errores de consola.

## Funnel /descubre — reconstrucción definitiva — 2026-10-02
- Reconocimiento conservado en tres pantallas aisladas con el copy aprobado; cada CTA reemplaza la pantalla anterior y no se pide email ni datos al inicio.
- /descubre/entiende ahora abre una posibilidad de uso: intervención breve, lectura, pausa, respuesta y adaptación progresiva, sin claims científicos ni lenguaje técnico.
- Añadidas /descubre/nombre y /descubre/dia: el nombre se guarda anónimamente antes de la demo y se usa dinámicamente para presentar un día de uso posible.
- /descubre/prueba reconstruida como experiencia narrativa determinística: situación → intervención → elección semántica → respuesta adaptada. Las tres respuestas producen estados distintos y se registran feedback/adaptación/completado.
- Añadida /descubre/continuidad para explicar capacidades reales, qué señales se conservan y por qué el onboarding posterior es corto; el CTA lleva claramente a Ver planes.
- /descubre/planes mantiene mensual US$6.99 y anual US$39.99, 7 días gratis y selección persistente; el bypass sigue siendo interno y no registra pago, MRR ni venta.
- Auth no se rehízo: /acceso sigue usando Magic Link Supabase PKCE con /auth/callback; /app permanece protegido. La prueba local llegó hasta email y validó persistencia/refresh del estado. El click real de correo no se certificó sin buzón controlado y sin crear usuarios artificiales.
- QA visual local: capturas 390×844 de reconocimiento, entiende, nombre, día, intervención, pregunta, adaptación, continuidad, planes y acceso; capturas 375×812, 430×932 y 1440×900 para responsive. Consola: 0 errores en el recorrido probado.
- Verificado: test:funnel, test:intervention, test:operational, test:dashboard, test:user-detail, test:intervention-detail, test:cost-ledger, typecheck y build PASS; lint PASS con 4 warnings heredados no relacionados.
- `/` no fue modificado. No se tocaron motor de intervención, semantic judge, embeddings, thresholds, learning, Cost Ledger, admin, schema Supabase, WhatsApp ni Hotmart.
- Deploy production completado en Vercel y aliasado a `https://nia.gritlab.pro`; producción responde con el nuevo `/descubre` sin errores de consola y `/` continúa mostrando la landing vieja.

## Funnel /descubre corregido + auth PKCE — 2026-10-02
- Reemplazado únicamente el funnel público: /descubre ahora usa tres pantallas de reconocimiento y navega a /descubre/entiende; la landing / no fue modificada.
- Añadidas pantallas aisladas /descubre/entiende, /descubre/prueba y /descubre/planes, además de /acceso; la microdemo tiene tres respuestas con adaptación visible y eventos microdemo_feedback/microdemo_adapted.
- Planes funcionales en modo checkoutMode = bypass: mensual US$6.99 y anual US$39.99, ambos con 7 días gratis, selección persistente en sessionStorage, sin Hotmart, pagos ficticios ni MRR.
- /onboarding reemplazado por cuatro decisiones cortas + resumen: nombre, dirección, situaciones (máximo 2) y voz; conserva estado anónimo y sincroniza con /api/profile si ya existe sesión.
- Acceso usa el sistema Supabase existente mediante magic link; no se creó auth paralelo. Home sigue protegida por sesión real.
- QA Playwright local completada en 390 y 375 px; captura de reconocimiento desktop en 1440 px. Refresh de planes sin error de hidratación y consola sin errores en el caso probado.
- Verificado: npm run test:funnel, typecheck, lint, build y tests existentes de intervention/operational/dashboard/user-detail/intervention-detail/cost-ledger.
- Push completado en commit 2a74bfc y producción verificada: /, /descubre, /descubre/entiende, /descubre/prueba, /descubre/planes, /acceso, /onboarding y /auth/callback están publicados. Falta únicamente validar end-to-end con una sesión real de Supabase para completar acceso → onboarding → /app; Hotmart sigue fuera de alcance.
- Corrección definitiva: las tres pantallas iniciales usan exactamente el copy de reconocimiento aprobado, sin eyebrow, contador ni preguntas secundarias; cada CTA reemplaza la pantalla actual.
- /descubre/entiende reescrito desde la influencia externa y la dirección propia; /descubre/planes ya no muestra lenguaje interno de bypass. El estado anónimo se duplica en sessionStorage/localStorage para conservar plan, feedback y progreso.
- Magic Link endurecido con Supabase PKCE explícito y /auth/callback: exchangeCodeForSession valida el code, escribe cookies SSR y redirige solo a una ruta local segura. Supabase remoto reporta email habilitado y autoconfirmación desactivada.
- Guards verificados localmente: /app anónimo → 307 /login; /api/profile anónimo → 401; /auth/callback sin code → 307 /acceso?error=missing_code. La apertura de un correo real no se ejecutó sin una cuenta/buzón controlado, para no crear usuarios artificiales ni enviar correo no autorizado.
- QA Playwright v2: 390×844, 375×812, 430×932 y 1440×900; reconocimiento, transición, microdemo, plan mensual persistente tras refresh y consola sin errores.

## Fase 4A — Operational Data Foundation
- Implementado y reconciliado con Supabase remoto: `execution_runs`, `generation_attempts`, `execution_provider_calls`, `event_log` y `admin_audit_log` en `supabase/migrations/20261001042354_operational_data_foundation.sql`. La migration remota figura aplicada como `20261001042354_operational_data_foundation`.
- Integrado el tracking con `/api/daily`, `/api/interactions`, feedback, learning, recalibración y generación/auditoría del motor mediante `lib/server/operational-observability.ts`.
- Añadida `/api/admin/operations` con autorización server-side, paginación y filtros básicos.
- El email administrativo se obtiene desde Auth; no se duplicó en `profiles`.
- Añadidos tests deterministas en `scripts/test-operational-observability.mjs` y script `test:operational`.
- Verificado: test de intervención, test operacional, typecheck, lint, build y `git diff --check`. Lint mantiene 4 warnings heredados.
- Pendiente: aplicar la migration remotamente con autorización; no se hizo en esta fase. Dashboard, cost ledger, billing y WhatsApp quedan fuera.

## Fase 4E — Cost Ledger
- Creada localmente `supabase/migrations/20261001060000_cost_ledger.sql` con `provider_pricing` versionado y `provider_call_costs` auditable. Incluye pricing inicial únicamente para `openai/gpt-6-luna` y `openai/text-embedding-3-small`, con fuente/fecha declaradas. No fue aplicada remotamente.
- Creado `lib/server/cost-ledger.ts`: resolución histórica de pricing, cálculo por llamada, persistencia, agregación por ejecución/usuario/dashboard, desglose por operación/modelo y estado `NOT AVAILABLE` para usage/pricing desconocido. Los retries se contabilizan como llamadas reales; no se ejecutó backfill.
- `recordProviderCall` intenta persistir el snapshot de costo después de guardar usage. El motor de decisión no fue modificado.
- Dashboard, listado de usuarios, User Detail e Intervention Detail muestran AI cost cuando existe ledger calculado; incluyen promedios, desglose por operación/modelo y tendencia diaria, y no muestran cero ante datos faltantes. Infraestructura, WhatsApp y billing siguen fuera.
- Añadidos `scripts/test-cost-ledger.mjs` y `scripts/backfill-provider-call-costs.mjs` (el backfill exige confirmación explícita y no fue ejecutado). QA visual de costos quedó bloqueada por falta de sesión admin: las capturas guardadas muestran la redirección protegida a `/login`.
- Verificado localmente: `test:cost-ledger`, `test:intervention`, `test:operational`, `test:dashboard`, `test:user-detail`, `test:intervention-detail`, typecheck, lint (4 warnings heredados), build y `git diff --check`.

## Fase 4E.2 — Instrumentación real de costos
- Añadido `supabase/migrations/20261001070000_provider_call_cache_usage.sql` para `cached_input_tokens` y `cache_write_tokens`. No aplicada remotamente.
- `lib/server/llm-intervention.ts` normaliza usage de entrada/salida y detalles de caché; `operational-observability.ts` persiste esos campos cuando el schema remoto los soporte.
- `lib/server/intervention.ts` registra usage por llamada individual para generación, embedding, semantic judge, LLM audit y retries técnicos exitosos. El motor de decisión no cambió.
- `cost-ledger.ts` calcula input ordinario, cached input, cache write y output; usage o pricing faltante queda `unavailable`, no cero.
- Auditoría remota read-only: Cost Ledger existe y el pricing remoto tiene tarifas de caché para `gpt-6-luna`, pero la columna cache todavía no existe. `execution_runs`, `generation_attempts`, `execution_provider_calls`, `provider_call_costs` y `event_log` permanecen en 0; existen 7 interventions históricas sin execution asociada.
- La validación real quedó detenida antes de generar porque no hay Supabase CLI ni `SUPABASE_ACCESS_TOKEN`; no se ejecutó backfill ni se crearon datos.
- Preview read-only guardado en `output/cost-ledger/backfill-preview.json` y `.md`: 0 provider calls históricos, 0 elegibles, 0 snapshots pendientes de insertar.

✅ CHECKPOINT — Última acción completada: Etapa 1 — página de ventas construida y verificada / Siguiente acción exacta: esperar aprobación antes de diseñar onboarding.

## Qué es esta app
NIA Identity es una experiencia breve para mujeres profesionales que normalmente saben qué quieren y cómo quieren actuar, pero bajo fricción pueden alejarse de su propio criterio. Les ayuda a reducir esa distancia en segundos y, con el tiempo, reconocer evidencia real de que están actuando diferente, sin journaling ni conversaciones largas. Monetización propuesta: suscripción.

## Tesis central de producto — no headline comercial final
“NIA ayuda a reducir la distancia entre la mujer que Laura sabe que quiere ser y cómo termina actuando cuando aparece la duda, la presión o el piloto automático; con el tiempo también le devuelve pequeñas evidencias de que esa distancia se está cerrando.”

## Reporte de validación (Sesión 1 — contexto recibido)
- Veredicto actual: viable con ajustes; 81/100. El documento indica que necesita una última validación antes de construir el producto completo.
- Demanda: categoría con pago real; no se inventan volúmenes públicos donde la evidencia no es defendible.
- Referencias: I Am, ThinkUp, Daily Affirmations: Mood Match, Serenely, Future You, Daily Affirmation Reminders y Rosebud.
- Lo que los usuarios odian de la competencia: mensajes genéricos o poco relevantes, repetición, categorías/notificaciones incorrectas, pérdida de afirmaciones propias, widgets problemáticos y exceso de presión por rachas o engagement.
- Hueco recomendado: continuidad longitudinal en segundos; NIA aprende cómo respondió la persona y adapta el siguiente mensaje y la microacción.
- Brecha de posicionamiento: no competir como otra app de afirmaciones personalizadas, de IA o de “mensaje correcto a la hora correcta”.
- Demanda cualitativa: “daily affirmations” alta y con intención de pago alta, pero competida; “positive self-talk / self-talk” es el territorio más adecuado para NIA.
- Precios observados: I Am alrededor de US$14,99/mes y US$59,99/año; ThinkUp US$7,99/mes y US$39,99/año; Rosebud US$12,99/mes y US$107,99/año. Son referencias del documento, no una decisión final.

## Avatar y venta (Sesión 1 — contexto recibido)
- Avatar inicial: Laura, profesional de 30–42 años, con ingresos propios y familiarizada con crecimiento personal. El documento aclara que es un perfil de lanzamiento, no una afirmación demográfica general.
- Dolor central: sabe cómo quiere reaccionar, pero bajo presión vuelve al diálogo interno de duda, exigencia o miedo; las frases genéricas dejan de servirle justo cuando más las necesita.
- Deseo central: confiar progresivamente más en su propio criterio y lograr que cómo actúa se parezca cada vez más a cómo quiere vivir y presentarse; además, poder reconocer que sí está cambiando cuando existen pequeñas evidencias.
- Deseos funcionales: palabras creíbles y específicas, ayuda en segundos, memoria sin exposición íntima y pequeñas acciones que demuestren cambio.
- Objeciones/fricciones: “esto es otra app de frases bonitas”; puede usar ChatGPT gratis; no quiere calificar mensajes o llenar registros a diario; teme que la app almacene pensamientos íntimos y que la abandone como las anteriores.
- Nivel inicial: consciente del problema y de las soluciones, pero escéptica.
- Lenguaje clave: “Sé cómo quiero reaccionar, pero cuando llega el momento vuelvo a dudar de mí”; “No quiero otra rutina”; “Quiero que me conozca un poco, pero no demasiado”; “Quiero terminar haciendo algo diferente, no solo sentir bonito”.
- Ángulo comercial: “Actúa más como la persona que quieres ser, justo en los momentos en que normalmente vuelves a dudar de ti.”
- Claims prohibidos: no prometer ingresos, salud, tratamiento psicológico ni aceptación externa.
- FICHA-AVATAR.md: creada y aprobada el 2026-09-29 con base en “NIA - Cliente2.pdf” y el contexto confirmado por el usuario.

## Propuesta de valor y posicionamiento
- Versión elegida: “Ayudo a mujeres profesionales que sobrepiensan en momentos importantes a actuar con más seguridad, sin journaling, frases genéricas ni largas conversaciones con una IA.”
- Esta versión sigue siendo una referencia comercial histórica; la tesis vigente de producto está en el reencuadre estratégico de Etapa 1.5 y no se convierte automáticamente en nuevo hero.
- Razones de compra prioritarias: escapar del autosabotaje en el momento importante; trabajar en sí misma sin convertirlo en otra tarea; recibir ayuda sin tener que buscarla ni empezar de cero.
- Tiempo de valor: 10–30 segundos.
- Copy norte: “Sabes cómo quieres actuar. El problema es recordarlo justo cuando empiezas a dudar de ti.”
- Diferencia frente a ChatGPT/journaling/podcasts: intervención ambiental, mínima y con continuidad; no exige construir un prompt ni contar toda la vida.

## Mecanismo y alcance actual
- Mecanismo vigente: INTENCIÓN → INTERVENCIÓN → MICROSEÑAL → MEMORIA → ADAPTACIÓN → MICROACCIÓN CUANDO APLIQUE → EVIDENCIA → RECONOCIMIENTO.
- Nombre del mecanismo: “Punto NIA”. El diferencial no es generar mejores frases: lo que ocurre hoy modifica de forma perceptible lo que NIA hace después.
- Punto NIA: pequeño momento en el que Laura puede volver a cómo quiere actuar antes de responder únicamente desde la duda, la presión o el piloto automático. Sigue siendo una intervención breve, no chat, coaching, sesión, journaling ni terapia.
- Reconocimiento: solo cuando haya evidencia suficiente, NIA puede devolver diferencias, decisiones, acciones o patrones observables trazables a señales/acciones reales. No inventa progreso ni infiere estados psicológicos.
- Test de falsabilidad: si se eliminan memoria, feedback y adaptación, NIA se convierte en otra biblioteca de afirmaciones.
- La microacción no es obligatoria en cada intervención; aparece solo cuando aporta valor.
- No construir ahora: NIA DEEP con memoria vital amplia, voz, recaps, múltiples intenciones o conversaciones profundas.

## Constitución del Producto (vigente y congelada — contrato de producto)
1. Usuaria: Laura, profesional de 30–42 años, con ingresos propios y familiarizada con crecimiento personal. Tiende a dudar o sobrepensar en reuniones, decisiones, conversaciones, límites o situaciones de presión. No busca terapia ni un coach virtual; quiere una intervención breve que la ayude a volver a cómo quiere actuar.
2. Problema: Laura no está perdida: trabaja, cumple, tiene metas y normalmente sabe qué quiere. Pero la duda, la presión, el miedo a equivocarse, la necesidad de aprobación o un patrón anterior pueden alejarla de su propio criterio; termina actuando distinto de como quería actuar, se minimiza, evita, cede o se exige demasiado. El problema profundo es la distancia entre lo que sabe que quiere representar y lo que hace cuando aparece la fricción. Las frases genéricas se convierten en ruido y las alternativas profundas exigen demasiado: journaling, prompts, conversaciones largas o repetir el contexto.
3. Promesa de producto: NIA ayuda a reducir esa distancia mediante intervenciones breves que aprenden de la respuesta de Laura y, cuando existe evidencia suficiente, le muestran pequeñas señales de que está actuando diferente. No es el headline comercial final.
4. Primera victoria: durante el onboarding, en menos de cinco minutos, define una intención concreta que quiere reforzar y recibe una primera intervención breve y creíble. Responde con un solo toque y NIA usa esa señal para calibrar futuras intervenciones. La reacción buscada es: “Esto sí habla de lo que estoy trabajando.” La segunda victoria ocurre después: “Esto cambió porque NIA recordó cómo respondí.”
4b. Mecanismo propio: “Punto NIA”. La microseñal calibra; la memoria conserva lo necesario; la adaptación cambia la siguiente intervención; la microacción y la evidencia aparecen cuando aplican; el reconocimiento devuelve continuidad solo con base real.
5. Tres flujos principales: (a) definir intención, que persiste y no se reescribe a diario; (b) ritual proactivo: intervención → microseñal de un toque → memoria → fin, ocasionalmente con microacción y evidencia; (c) Punto NIA on demand: “Necesito NIA ahora” → contexto mínimo de un toque → intervención adaptada → microseñal → posible microacción → fin.
6. Modelo de interacción: híbrido. NIA viene a la usuaria con una intervención proactiva diaria en un momento acordado. La usuaria también puede ir a NIA on demand desde la app o WhatsApp mediante “Necesito NIA ahora”. En ambos casos NIA entrega una intervención, no abre un chat ni inicia coaching.
7. Feedback: señales de un toque, no encuesta ni conversación. “Así sí” indica que funcionan dirección y lenguaje; “Más real” indica que aplica pero suena demasiado absoluto o poco creíble; “Otro enfoque” indica falta de relevancia. El fallback de botones en WhatsApp será texto simple.
8. Canales: NIA App/Web es el hogar con intención actual, “Necesito NIA ahora”, evidencia, memoria y configuración. WhatsApp es presencia para intervención proactiva, feedback de un toque y activación rápida de un Punto NIA. WhatsApp no convierte a NIA en chatbot.
9. Contexto on demand: opciones de un toque: “Estoy dudando de mí”, “Tengo que decidir algo”, “Voy a tener una conversación”, “Algo no salió como esperaba” y “Solo necesito volver a mi intención”.
10. Memoria: recuerda dirección, no secretos: intención, lenguaje que funciona o no, feedback, contextos seleccionados y microacciones. No infiere traumas, diagnósticos, secretos, emociones íntimas no expresadas ni construye una biografía indiscriminada.
11. NIA nunca debe: convertirse en coach virtual; usar conversación abierta como mecanismo principal; presionar con culpa, streaks o miedo; hacer claims clínicos o presentarse como terapia; inferir secretos; exigir journaling o registros largos; convertir cada intervención en tarea; enviar múltiples mensajes diarios indiscriminadamente; entregar frases falsas, exageradas o genéricas; maximizar screen time; compartir o vender datos; mostrar complejidad solo para demostrar que usa IA.
12. Principio de experiencia: NIA debe requerir menos esfuerzo que buscar una frase, abrir ChatGPT o escribir en un journal. La inteligencia debe sentirse en lo que recuerda y ajusta, no en cuánto conversa.
13. Principio de retención: la usuaria vuelve porque “NIA mañana sabe un poco mejor qué me ayuda hoy”, no para proteger una racha.

## Estrategia de monetización
- Modelo propuesto: onboarding-first con 3 experiencias adaptativas gratuitas sin tarjeta y luego pantalla de planes.
- Justificación: permite sentir el mecanismo antes de pedir dinero y prueba si la adaptación genera valor real frente a una versión estática.
- Precio inicial propuesto: US$6,99 mensual y US$39,99 anual.
- Oferta de primeros usuarios propuesta: US$29,99 el primer año; no ofrecer lifetime todavía.
- Prueba: 7 días gratis con cobro automático del plan elegido, siempre con transparencia explícita antes del checkout y cancelación clara.
- Validación pendiente: probar demanda real y disposición a pagar antes de construir todo el producto.
- Gate previo eliminado por decisión del usuario: concierge, entrevistas WTP y fake-door no bloquean la construcción ni son requisito de validación.
- Nuevo modelo de validación: lanzamiento real con 7 días de trial gratuito, acceso completo al mecanismo y cobro posterior del plan elegido. La señal inicial mínima de aprendizaje son 3–5 primeros pagos reales post-trial; no se inventan benchmarks porcentuales.
- La validación debe cruzar adaptación percibida/uso → continuidad → pago, además de retorno D1/D3/D7, cancelación, primer pago y renovación cuando haya tiempo suficiente.
- Hotmart queda aprobado como proveedor de pagos y suscripciones para LATAM. No reabrir la selección salvo impedimento técnico real documentado. Debe cubrir checkout, confirmación, renovación, cancelación, webhook verificado, idempotencia y sincronización segura del acceso.
- Hotmart solo gestiona cobro/estado de acceso; no contiene lógica de NIA. Ninguna credencial o secreto va al navegador.
- Punto NIA on demand queda incluido en el plan pago, pero no se congelan límites, créditos ni fair-use hasta conocer costo real por intervención, frecuencia, margen y comportamiento.
- Trial: 7 días; no es demo limitada. Debe incluir intención persistente, intervenciones, feedback, memoria, adaptación, Punto NIA, microacciones cuando apliquen y primeras evidencias.
- Hotmart: trial gratuito configurado en la suscripción; plan elegido antes del checkout; transparencia obligatoria sobre 7 días gratis, precio, moneda, primer cobro, periodicidad, renovación automática y cancelación.
- Garantía candidata: 7 días sobre el primer cobro, sin convertirla en requisito mayor que el trial. Hotmart permite 7, 15, 21 o 30 días; la decisión comercial final se tomará explícitamente antes de publicar.

## Instrumentación mínima obligatoria
- Eventos canónicos: `landing_viewed`, `cta_started`, `onboarding_started`, `onboarding_completed`, `first_intervention_received`, `feedback_given`, `adapted_intervention_received`, `nia_now_started`, `microaction_completed`, `plan_selected`, `checkout_started`, `trial_started`, `returned_d1`, `returned_d3`, `returned_d7`, `trial_cancelled`, `trial_completed`, `first_payment_succeeded`, `first_payment_failed`, `subscription_cancelled`.
- La taxonomía debe reconstruir el trial completo y medir adaptación percibida/uso → continuidad → pago, sin instrumentar eventos sin utilidad decisional.

## Retención
- Loop: gatillo = intervención diaria acordada o necesidad imprevista → acción = leer y responder con un toque → recompensa = volver a la intención con un mensaje creíble → inversión = microseñal y contexto seleccionado que mejoran la próxima intervención → reconocimiento = evidencia narrativa de una diferencia real cuando existe base suficiente.
- Retención no basada en rachas: la razón para volver es que mañana NIA sepa un poco mejor qué ayuda hoy y que, con el tiempo, ayude a Laura a ver cosas que normalmente no reconocería en sí misma.
- La retención nunca debe crear dependencia: NIA no debe insinuar “me necesitas”, “sin mí volverás atrás” ni “yo te conozco mejor que tú”.
- Frecuencia: una intervención proactiva diaria como base, con límite y momento elegido por la usuaria; el modo on demand ocurre cuando ella lo necesita.
- Gamificación: no decidida; evitar presión por rachas salvo evidencia posterior.

## Secuencia maestra de construcción
- Estado: B5 aprobada y congelada; Constitución del Producto aprobada y congelada; validación comercial se realizará después del lanzamiento real.
- Ruta obligatoria: `/` → `/onboarding` → `/paywall` → `/login` → `/app` → servicios externos.
- Landing: pendiente — no escribir copy final hasta cerrar avatar y Constitución.
- Onboarding: pendiente — debe entregar una intervención real antes de pedir esfuerzo pesado.
- Paywall: pendiente — debe vender continuidad y aprendizaje, no una lista de funciones.
- Login/Auth: pendiente.
- App interna: pendiente; no construir dashboard prematuro.
- Servicios externos: bloqueados hasta aprobar las etapas anteriores; WhatsApp se implementará en esta etapa posterior, aunque su papel ya queda definido.

## Decisiones técnicas
- Framework, base de datos, auth, modelo de IA, esquema de datos y RLS: todavía no decididos; se definirán después de cerrar Constitución y estrategia.
- Idioma inicial previsto: español para LATAM, sujeto a confirmación del mercado objetivo.
- IA: el valor diferencial no puede depender solo de generación; debe apoyarse en historial estructurado, feedback, continuidad y evidencia acumulada.

## Dirección de arte — referencia aprobada
- FICHA-ARTE.md: existe y aprobada por el usuario: SÍ — 2026-09-29.
- Referencia contractual: `Visual NIA.png`. Define atmósfera, jerarquía, color, tipografía, densidad y carácter; no define funciones ni exige copia pixel-perfect.
- Territorio: premium, editorial, íntimo, contemporáneo, sereno pero activo, femenino adulto, sofisticado, humano y tecnológico sin look de IA.
- Brand kit de referencia: marfil cálido `#F4EFE6` · carbón `#181714` · copper `#C76338` · serif editorial + sans limpia.
- Sistema: estado claro para hogar/intención; estado carbón para Punto NIA, foco e intervención; copper moderado para acciones y señales.
- Firma: wordmark NIA simple con punto copper; evidencia como narrativa personal, no dashboard.
- `direcciones-abc.html` queda como exploración archivada, no como contrato final.

## Sesiones completadas ✅
- Sesión 1 — Sistema instalado, git inicial creado y documentos base de NIA incorporados; verificado 2026-09-29.
- B4 — Dirección visual cerrada con `FICHA-ARTE.md` y `Visual NIA.png`; verificado 2026-09-29.
- B5 — Plan Maestro aprobado y congelado con Hotmart, gate comercial, límites abiertos e instrumentación mínima; verificado 2026-09-29.

## Sesión en progreso 🔧
- Sesión 1 — Cierre documental preconstrucción y preparación de la página de ventas.

## Próximas sesiones 📋
- Próximo paso exacto: cerrar la documentación de mercado/modelo y comenzar la Etapa 1 — página de ventas.
- Gate de lanzamiento: página de ventas capaz de explicar NIA, iniciar el recorrido, mostrar la diferencia adaptativa, registrar eventos y pasar revisión visual/copy sin integrar Hotmart todavía.

## Conflictos revisados con el Sistema Operativo
- No hay conflicto de producto: el modelo híbrido mantiene la experiencia breve, el feedback mínimo, el valor antes del registro y la prohibición de coaching conversacional.
- WhatsApp es un servicio externo y, por la secuencia maestra, se define ahora pero se conecta después de aprobar página de ventas, onboarding, pantalla de planes, login y app interna.
- La intervención proactiva diaria debe respetar el límite de notificaciones y el consentimiento de la usuaria; no se interpreta como permiso para enviar mensajes indiscriminados.

## Problemas conocidos ⚠️
- “NIA - Cliente.pdf” original era ilegible; fue reemplazado correctamente por “NIA - Cliente2.pdf”, que sí pudo leerse completo.
- La validación actual es positiva pero no final: el propio documento exige probar la diferencia adaptativa contra una versión estática y pedir dinero real.
- No declarar NIA lista para vender hasta pasar los gates de seguridad, integridad y rigor de entrega.

## Pendientes del usuario
- Ninguno para comenzar la documentación y la página de ventas. Cualquier gasto de tráfico, cuenta o credencial se pedirá cuando corresponda.

## Notas para la próxima sesión
- La dirección elegida es NIA Identity. Mantener la experiencia extremadamente breve y centrada en actuar con más seguridad, no en coleccionar frases.
- No pedir una batería de preguntas: la Constitución congelada es la versión entregada por el usuario y no debe reinterpretarse como app de apertura reactiva ni como coach conversacional.

## Fase 3.2 — Contrato LLM y calibración semántica
- Verificado 2026-09-30: OpenAI `gpt-6-luna` devuelve 3 candidatos mediante Structured Outputs; `function` y `structure` son enums internos; `concept` y `angle` son texto semántico libre.
- Smoke real: 5 generaciones contra OpenAI, 3 candidatos válidos en cada una; sin `llm_candidate_schema_invalid`.
- Embeddings: se usa `text-embedding-3-small`, 1536 dimensiones. El embedding de la intervención aprobada ahora se persiste en el mismo insert y no se ignoran errores de persistencia.
- Calibración local real: 40 pares. Duplicados 0.677–0.936 (mediana 0.791); mismo concepto 0.388–0.585 (mediana 0.455); mismo tema/concepto distinto 0.311–0.541 (mediana 0.437); no relacionados 0.137–0.269 (mediana 0.224).
- Thresholds centrales calibrados provisionalmente con este dataset: review 0.58 y duplicate 0.63. Son valores iniciales, no una garantía universal.
- `concept_key` se calcula internamente sin nueva migración; permite separar saturación conceptual de duplicado semántico.
- E2E remoto sintético: `/api/daily` 200, 3 candidatos persistidos, intervención aprobada y embedding persistido. La segunda generación también pasó; la respuesta RPC no expuso matches en ese recorrido y queda pendiente de diagnóstico remoto específico.
- Feedback remoto vía `PATCH /api/interactions` devolvió 400 `feedback_save_failed`; no se corrigió en esta fase porque queda fuera del contrato LLM/calibración y requiere revisar la policy de actualización remota.
- Suite final: test de intervención, typecheck y build PASS; lint PASS con 4 warnings heredados. No deploy, commit ni push.

## Fase 3.3 — Diagnóstico feedback y RPC remoto
- Diagnóstico 2026-09-30: `PATCH /api/interactions` actualiza primero `public.interactions`; el rol es `authenticated`, el `user_id` coincide con `auth.uid()`, y Supabase devuelve `PGRST116` con 0 filas. La tabla legacy tenía SELECT/INSERT, pero no UPDATE policy.
- Corrección local preparada en `supabase/migrations/20260930212000_feedback_interactions_update_policy.sql`: policy UPDATE con `USING` y `WITH CHECK` limitados al usuario autenticado.
- Prueba directa autenticada: `intervention_feedback` y `learning_signals` sí aceptan inserts propios; el UPDATE de `interactions` es el único bloqueo confirmado.
- RPC remoto: llamada directa autenticada con embedding idéntico devuelve similarity `1.0`; paráfrasis real devuelve `0.935492`; mismo concepto devuelve `0.396025`; diferente devuelve `0.242834`. Aislamiento por usuario PASS. Llamada con service role devuelve 0 filas porque `auth.uid()` es NULL, como exige el diseño.
- La RPC actual no recibe `match_threshold`; recibe `p_user_id`, `p_query_embedding` y `p_limit`, y devuelve resultados ordenados sin filtrar threshold. La aplicación aplica review/duplicate después.
- Aplicación remota de la nueva migration quedó BLOCKED: `npx supabase db push --dry-run` devuelve `ProjectRefNotLinkedError`; no hay project ref enlazado ni credencial de base/CLI disponible. No se alteró el remoto.

## Fase 3.5 — Feedback remoto y E2E de aprendizaje
- Reconciliado el filename local con la versión remota: `20261001012236_feedback_interactions_update_policy.sql`. No se ejecutó CLI ni se reaplicó SQL.
- Suite local: test de intervención, typecheck y build PASS; lint PASS con 4 warnings heredados.
- E2E remoto: PATCH de feedback ahora devuelve HTTP 200; `interactions` se actualiza y se insertan `intervention_feedback` y `learning_signals` con el mismo `user_id`.
- `wording_off`: PASS; la segunda generación cambió formulación/estructura y conservó el territorio conceptual (`self_trust`).
- `too_general`: FAIL en la siguiente generación; `/api/interactions` devuelve 503 y el error interno capturado fue `no_approved_intervention`. No se hicieron correcciones especulativas ni se continuaron las pruebas de angle/context.
- No deploy, commit ni push. Los usuarios sintéticos de esta corrida no fueron eliminados porque la sesión prohibió ejecutar DELETE remoto; deben limpiarse mediante el procedimiento administrativo autorizado antes de usar el proyecto para pruebas posteriores.

## Fase 3.6 — Diagnóstico `too_general`
- Diagnóstico 2026-09-30: el signal se almacena como `specificity` con `value: low`, queda activo sin expiry y `applyLearningSignals` cambia `feedbackGoal` a `specific_context`; no genera una restricción textual específica para el prompt.
- Brief real: desired change `Quiero confiar más en mis decisiones.`, current context `Trabajo`, `relevantSituations: []`, `userLanguage: []`. El brief no tenía una situación concreta que pudiera usar sin inventarla.
- Prompt real: recibe el JSON completo del brief y la instrucción general de ser específico, pero no una instrucción cause-specific derivada de `specificity=low`.
- Causa final: combinación de generación insuficientemente anclada y falta de retry cause-specific. En la ejecución fallida, candidatos fueron rechazados por `generic_or_missing_user_context`/`low_specificity` en auditoría determinista, o por el auditor LLM por abstracción/coaching. No hubo candidato aprobado.
- `resolveIntervention` genera una sola tanda de 3 candidatos; `maxGenerationRounds` existe en configuración pero no se utiliza. `withJsonRetry` solo reintenta JSON inválido, no calidad.
- No se modificó el motor ni se añadieron retries en esta fase. Suite local final PASS; lint conserva 4 warnings heredados.

## Fase 3.7 — Especificidad y micro-calibración
- Implementado `hasSufficientContext()` y regla `unsupported_personal_context`; NIA no puede introducir personas, relaciones, lugares o situaciones no confirmadas.
- `specificity=low` ahora agrega restricciones de generación y activa hasta 3 tandas cause-specific cuando existe contexto suficiente. `wording_off` conserva su comportamiento.
- Sin contexto suficiente, la resolución no genera candidatos: guarda estado `calibration_required` en `profiles.learning_profile` y devuelve una respuesta estructurada, no un 503.
- Añadidos Structured Outputs para `CalibrationPrompt` y endpoint `/api/calibration`; las opciones se generan dinámicamente, son 2–4 y permiten texto libre.
- Contexto confirmado por calibración se guarda en `context_history` y pasa a ser el contexto activo sin borrar historial.
- E2E remoto sintético: sin contexto → calibration_required PASS; texto libre → contexto confirmado PASS; specificity low + contexto confirmado → retry aprobado PASS con intervención anclada a proyecto nuevo.
- No se ejecutaron todavía los tests completos de `context_changed`; quedan para la siguiente fase después de cerrar esta ruta.
- El feedback `too_general` por endpoint se probó sobre una intervención aprobada; el signal se persistió y el retry produjo una intervención específica sobre proyectos nuevos. Se bloqueó la reutilización de fallback cuando hay `specific_context`, `new_wording` o `new_angle`, para no devolver silenciosamente una intervención que la usuaria acaba de rechazar.
- Durante una corrida el proveedor devolvió `llm_empty_response`; se capturó sin secretos. El sistema ya no reutiliza fallback previo bajo una restricción correctiva activa.

## Etapa 1.5 — Reencuadre estratégico de NIA Identity
- Motivo: profundizar el problema y el valor longitudinal antes de volver a modificar la landing; la categoría no es simplemente overthinking, afirmaciones, autoestima o empowerment.
- Nueva tesis: NIA reduce la distancia entre la mujer que Laura sabe que quiere ser y cómo termina actuando cuando aparece la duda, la presión o el piloto automático; con el tiempo también le devuelve pequeñas evidencias de que esa distancia se está cerrando.
- Territorio emocional vigente: `VOLVER A TI`.
- Movimientos: `RECORDARTE` = recordar intención, criterio y lo que importa; `ELEGIRTE` = actuar conscientemente de forma congruente con lo que Laura decidió que importa, sin que NIA defina por ella qué significa; `RECONOCERTE` = hacer visibles evidencias reales de que está actuando diferente.
- Evidencia sube de importancia: sigue siendo narrativa personal, discreta, humana, no competitiva y trazable a acciones/señales; nunca puntos, badges, streaks, rankings, adulación ni progreso inventado.
- Loop conceptual extendido: INTENCIÓN → INTERVENCIÓN → MICROSEÑAL → MEMORIA → ADAPTACIÓN → MICROACCIÓN CUANDO APLIQUE → EVIDENCIA → RECONOCIMIENTO.
- Prohibición de marca: no convertir NIA en empowerment genérico ni usar “Elígete”, “Ámate primero”, “Eres suficiente”, “mejor versión” o variantes sin anclarlas a una situación, intención, elección, conducta, señal o evidencia real.
- Qué no cambia: Laura, Punto NIA, segundos, microseñales, memoria mínima, adaptación, intervención proactiva, on demand, no chat/coaching/journaling/streaks, privacidad, canales, suscripción, trial, secuencia maestra, dirección visual, infraestructura y Etapa 1 en producción.
- Landing: producción sin modificar. El brief conceptual queda actualizado abajo; antes de tocar código se revisará la historia sección por sección.
- Etapa 2: bloqueada hasta revisar la landing bajo este posicionamiento; no iniciada.

### Test de coherencia de Etapa 1.5
1. PASS — Si se elimina “affirmations”, NIA conserva el problema, el mecanismo y el valor longitudinal.
2. PASS — Sin “overthinking” en el headline, el problema sigue siendo comprensible como distancia entre criterio y conducta bajo fricción.
3. PASS — `VOLVER A TI` es territorio emocional; no se registra como promesa vacía ni resultado garantizado.
4. PASS — `ELEGIRTE` está definido como conducta congruente con lo que Laura decidió que importa; NIA no decide por ella.
5. PASS — `RECONOCERTE` exige evidencia trazable; no es adulación ni inferencia psicológica.
6. PASS — Punto NIA sigue siendo el mecanismo central y una intervención breve.
7. PASS — La experiencia sigue diseñada para entregar valor en 10–30 segundos.
8. PASS — El reconocimiento es una extensión conceptual del registro de evidencia; no obliga a crear infraestructura ni funcionalidades nuevas en esta etapa.
9. PASS — Memoria mínima, privacidad y “recuerda dirección, no secretos” permanecen intactos.
10. PASS — La diferencia frente a ChatGPT, journaling y apps de afirmaciones sigue siendo intervención breve, continuidad adaptativa y evidencia narrativa sin chat abierto.

## Brief operativo de página de ventas — B6

### Objetivo y promesa
- Objetivo único: llevar a una mujer que reconoce que sobrepiensa o duda en momentos importantes a querer experimentar NIA durante 7 días gratis.
- Promesa principal: “Actúa más como la persona que quieres ser, justo en los momentos en que normalmente vuelves a dudar de ti.”
- Apoyo: “Sin frases genéricas. Sin journaling. Sin largas conversaciones con una IA.”
- Big Idea: Laura no necesita otra frase para sentirse bien; necesita que algo recuerde qué le ayuda y ajuste lo siguiente cuando vuelva a dudar.

### Reencuadre conceptual pendiente de implementación
- Laura ya sabe bastante sobre cómo quiere actuar; la dificultad aparece cuando llega la fricción.
- La historia debe mostrar la distancia entre su criterio y lo que termina haciendo bajo duda, presión, miedo, aprobación o piloto automático.
- NIA interviene en segundos, aprende de cómo responde y hace que lo siguiente cambie.
- Cuando existan señales suficientes, NIA también devuelve evidencia de cambio sin inventar progreso.
- El resultado buscado no es sentirse bonita durante 30 segundos, sino actuar progresivamente de forma más congruente con lo que Laura misma decidió que importa.
- No escribir todavía nuevo hero definitivo ni elegir slogan final. No publicar cambios.
- La revisión previa a código será sección por sección: reconocimiento del problema → fricción → Punto NIA → adaptación → evidencia/reconocimiento → autonomía/privacidad → trial/CTA.

### Argumento y mecanismo
- Problema: ya sabe cómo quiere actuar y ha probado crecimiento personal, frases, ChatGPT o journaling, pero el momento real la devuelve al mismo diálogo interno. Lo genérico empieza de cero cada día.
- Enemigo comercial: genericidad y falta de continuidad; nunca “ser negativa” ni una condición clínica.
- Punto NIA en lenguaje simple: NIA muestra una intervención → Laura responde con una microseñal → NIA recuerda → lo siguiente cambia.
- Punto NIA en lenguaje conceptual: pequeño momento en el que Laura puede volver a cómo quiere actuar antes de responder únicamente desde la duda, la presión o el piloto automático.
- Evidencia/reconocimiento: solo devolver diferencias observables sustentadas por señales o acciones reales; no usar adulación ni dependencia como retención.
- Demostración obligatoria: intervención inicial → “Más real” → intervención futura menos absoluta y más creíble. La adaptación debe verse, no explicarse con arquitectura o machine learning.

### Claims y CTA
- Claims permitidos: volver a la intención, aprender de microseñales, adaptar futuras intervenciones, requerir segundos, evitar empezar de cero, memoria controlada por la usuaria y microacción cuando aporte valor.
- Claims prohibidos: terapia, tratamiento, ansiedad/depresión, curación, resultados clínicos o transformaciones garantizadas.
- CTA principal: “Probar NIA 7 días gratis”. Variante: “Empieza tus 7 días gratis”.
- Recorrido: landing → CTA → onboarding público → primera experiencia → selección de plan/checkout cuando corresponda. Hotmart no se integra en esta etapa.
- Transparencia preparada: “7 días gratis. Después se cobra el plan elegido salvo cancelación.” Importe, moneda y periodicidad deben aparecer antes de confirmar el trial.

### Arquitectura exacta de la landing
1. Hero: promesa, apoyo, CTA y preview de intervención; `landing_viewed` y `cta_started`.
2. Reconocimiento: el momento en que sabe cómo quiere actuar pero vuelve a dudar.
3. Por qué falla lo actual: frases genéricas, empezar de cero, ChatGPT/journaling con demasiado esfuerzo.
4. Diferencia: NIA aprende qué sí le ayuda y usa hoy para ser más relevante mañana.
5. Demostración Punto NIA: antes → “Más real” → después; interacción simulada, no chat.
6. Cómo funciona: intención, intervención, microseñal, memoria, adaptación y microacción cuando aplica.
7. Memoria bajo control: qué recuerda y qué no recuerda; visible, editable y revocable.
8. Objeción ChatGPT: NIA aparece sin prompt, no exige explicar todo otra vez y no abre una conversación larga.
9. Trial: 7 días de acceso al producto real; después cobro del plan elegido salvo cancelación. Sin precio falso ni urgencia.
10. CTA final: repetir la acción principal y resumir el resultado esperado.
11. Privacidad/legal básico: memoria mínima, no terapia, política de privacidad, términos y cancelación; sin social proof inventado.

### Diseño y gate
- Dirección: marfil cálido para reconocimiento/intención; carbón para la demostración de Punto NIA; copper solo para CTA, señales y transición; serif editorial + sans limpia; mucho aire y texto protagonista.
- Gate: comprensión sin explicación externa, diferencia adaptativa clara, no genérica/no terapia/no coach, CTA correcto, claims trazables, fidelidad a FICHA-ARTE, responsive 375 px, accesibilidad, eventos verificados, lint/typecheck/build limpios.

## Etapa 1 — Página de ventas ✅
- Estado: construida en `/` con Next.js App Router y kit canónico de landing; no se construyó onboarding, paywall, login, app interna, Hotmart ni Evolution.
- Dirección aplicada: marfil cálido `#F4EFE6`, carbón `#181714`, copper `#C76338`, serif editorial + sans limpia; la demostración de Punto NIA usa la transición clara → carbón.
- CTA: “Probar NIA 7 días gratis” → `/onboarding` como destino futuro, sin inventar todavía esa etapa.
- Instrumentación: `landing_viewed` al entrar y `cta_started` al pulsar cualquier CTA; eventos guardados en `window.__niaEvents` y emitidos como `nia:event` para conectar analítica real más adelante.
- Verificación 2026-09-29: `npm run typecheck` ✓ · `npm run lint` ✓ con 3 warnings heredados fuera del recorrido activo · `npm run build` ✓ · viewport Playwright 375 px ✓ · `scrollWidth === 375` ✓ · consola de página sin errores ✓ · eventos verificados ✓.
- Capturas: `output/playwright/landing-375.png` y `output/playwright/landing-375-full.png`.
- Revisión visual independiente: no hay agente `revisor-visual` disponible en este workspace; se conservaron capturas de Landing 2.0 para revisión del usuario.

## Publicación Vercel — 2026-09-29
- Proyecto Vercel creado y enlazado: `germans-projects-baef13ff/nia`.
- Repositorio conectado en Vercel: `https://github.com/germanospinaroa/NIA`.
- Root Directory: `.` · Framework: Next.js · Build: `npm run build` · Node configurado por Vercel: 24.x.
- Preview/despliegue inicial verificado como `READY`: `https://nia-snowy-zeta.vercel.app`.
- Inspector: `https://vercel.com/germans-projects-baef13ff/nia/7CNx8YUzyLV1tt9ZGob5AY1y8KuK`.
- Primer push completado: `main` remoto existe en `germanospinaroa/NIA` y coincide con SHA `a1ad5208aea1e1b9ccbd209ccae16e11fe37c1ff`.
- Vercel detectó el push desde GitHub y el deployment automático quedó `READY`; producción sigue usando `main` como fuente.
- Dominio `nia.gritlab.pro` añadido a Vercel y validado tras configurar el registro DNS requerido.
- DNS de `nia.gritlab.pro` validado por Vercel; HTTPS operativo y dominio asignado a producción.

## Etapa 1 — Producción cerrada ✅
- Vercel = producción; proyecto `germans-projects-baef13ff/nia` con framework Next.js.
- GitHub `germanospinaroa/NIA`, branch `main` = fuente de deployment automático.
- Dominio oficial operativo: `https://nia.gritlab.pro`.
- Verificación final 2026-09-30: HTTP 200, HTTPS activo, estilos/fuentes/assets cargados, viewport 375 px sin overflow, landing renderizada y sin errores relevantes durante la carga.
- Eventos verificados en producción: `landing_viewed` al cargar y `cta_started` al pulsar el CTA.
- El CTA conserva `/onboarding` como destino futuro; la ruta aún no se construye por decisión de alcance de Etapa 1.
- Evidencia: `output/playwright/etapa1-production-375.png`.
- No avanzar todavía a onboarding, Hotmart, Evolution, login, paywall ni app interna.
- No hay variables de entorno necesarias en esta etapa de landing; no se añadieron secretos.

## Etapa 1 — Landing 2.0 ✅
- Motivo del rework: aplicar el reencuadre estratégico de Etapa 1.5 sin avanzar a onboarding.
- Posicionamiento aplicado: distancia entre intención y acción bajo fricción; territorio `VOLVER A TI`; continuidad adaptativa y evidencia narrativa.
- Secciones actualizadas: reconocimiento, distancia, entrada de NIA, demo Punto NIA, Recordarte/Elegirte/Reconocerte, evidencia, comparación de herramientas, memoria/privacidad, continuidad, trial y cierre.
- Punto NIA mantenido: intervención breve, microseñal de un toque y adaptación visible; CTA mantiene `/onboarding` sin construirlo.
- Evidencia/reconocimiento incorporados como narrativa personal, sin dashboard, score, streaks ni adulación.
- Eventos verificados: `landing_viewed` y `cta_started`; no se añadieron eventos nuevos.
- Responsive verificado: desktop 1440 px y mobile 375 px; `scrollWidth` coincide con el viewport.
- Assets: no se añadieron imágenes externas; el visual de hero sigue siendo una mini-demo honesta.
- Verificación local: `npm run typecheck` ✓ · `npm run lint` ✓ con 3 warnings heredados fuera del recorrido activo · `npm run build` ✓.
- Capturas: `output/playwright/landing2-375.png`, `output/playwright/landing2-375-viewport.png`, `output/playwright/landing2-desktop.png`.
- Producción: deployment automático del proyecto Vercel existente `READY` en `https://nia-ov3vkk0zg-germans-projects-baef13ff.vercel.app`, con alias oficial `https://nia.gritlab.pro`.
- Smoke production 2026-09-30: HTTP 200, fuentes cargadas, assets completos, sin overflow a 375 px, demo “Más real” adaptativa y consola limpia durante la carga.
- Etapa 2: NO iniciada.

## Etapa 1 — Landing V3 — EN REVISIÓN VISUAL
- Motivo: reconstrucción visual y de conversión sobre Landing 2.0; la base estratégica permanece aprobada y no se modificó la Constitución del Producto.
- Posicionamiento aplicado: identificación humana → distancia entre intención y acción → demostración Punto NIA → continuidad → evidencia → deseo de probar.
- Cambios visuales: hero asimétrico con fotografía y Punto NIA integrado; reconocimiento con escena humana; distancia tipográfica/editorial; bloque carbón de producto; Recordarte/Elegirte/Reconocerte como sistema; evidencia narrativa; comparación editorial; privacidad sobria; cierre cinematográfico.
- Assets incorporados: `public/images/nia/hero-before-the-moment.png` (antes de una conversación), `recognition-entering.png` (entrada al trabajo), `evidence-after-conversation.png` (después de una conversación), `closing-leaving.png` (salida después de una decisión). Son cuatro escenas humanas distintas; el hero reutiliza el mismo archivo solo entre variantes responsive desktop/mobile.
- Punto NIA mantenido: intención → intervención → microseñal; “Más real” cambia la intervención futura y muestra el ajuste adaptativo.
- Eventos conservados: `landing_viewed` y `cta_started`; CTA conserva `/onboarding`, que sigue sin construirse.
- Responsive verificado: 1440 px, 390 × 844 y 375 × 812; `scrollWidth` coincide con el viewport; assets cargan sin roturas; consola limpia en producción local.
- Capturas V3: `output/playwright/landing-v3-1440.png`, `output/playwright/landing-v3-390.png`, `output/playwright/landing-v3-375.png` y primer fold `output/playwright/landing-v3-390-firstfold.png`.
- Calidad local: `npm run typecheck` ✓ · `npm run lint` ✓ con 3 warnings heredados fuera de esta landing · `npm run build` ✓.
- Git/deploy: commits `2b3970b` y `db0ee46` en `main`; push verificado; Vercel tomó el último push y `https://nia.gritlab.pro` sirve la V3 con HTTP 200.
- Smoke producción 2026-09-30: 1440, 390 × 844 y 375 × 812 sin overflow; cuatro assets completos; consola limpia; `landing_viewed` y `cta_started` verificados; “Más real” muestra el ajuste adaptativo; `/onboarding` conserva 404 por alcance.
- Gate visual: pendiente de aprobación visual explícita del usuario; Etapa 1 no se declara cerrada en esta revisión.
- Etapa 2: NO iniciada.

## Landing V4 — CRO / Product Proof Pass
- Motivo: hacer la landing más clara, demostrable y persuasiva sin cambiar la identidad visual V3 ni el posicionamiento NIA Identity.
- Arquitectura V4: hero funcional → reconocimiento/distancia comprimidos → demo Punto NIA en el primer tercio → mecanismo Recordarte/Elegirte/Reconocerte → continuidad/evidencia → trade-offs → memoria/control → FAQ → trial sin precio → CTA final.
- Demo: cinco estados visibles: intención → intervención → microseñal → señal guardada → intervención futura; etiquetada como ejemplo predefinido y sin fingir personalización real.
- Evidencia: convertida a secuencia descriptiva Día 1/Día 3/Día 5/Día 7; no usa score, porcentaje, badges, rachas ni evaluación psicológica.
- Memoria: representación conceptual de Ver memoria / Borrar / Reiniciar; marcada como control pendiente de implementación real en Etapa 2.
- Comparación: cambiada de bloques de desacreditación a tabla de trade-offs entre ChatGPT, journaling, afirmaciones y NIA.
- CTA: hero, después de demo, bloque de prueba y cierre; todos conservan `/onboarding` y `cta_started`.
- Longitud local a 1440: anterior 8.695 px → V4 7.169 px, aproximadamente 18% menor, con más producto visible por pantalla.
- Responsive local: 320, 375, 390 y 430 px sin overflow; 375 y 390 con captura completa; un solo H1; targets interactivos ≥44 px.
- Gates pendientes: `OFFER COMMERCIAL GATE: BLOCKED` por precio/plan/moneda/periodicidad/cancelación final no congelados; `LEGAL GATE: BLOCKED` porque `/privacidad`, `/terminos` y `/cancelacion` todavía no existen como textos aprobados; `FUNNEL GATE: BLOCKED` porque `/onboarding` no está construido.
- Paid traffic: NO autorizado mientras exista cualquiera de esos gates críticos.
- Etapa 2: NO iniciada.

## Funnel de adquisición NIA — `/descubre`
- Objetivo: crear una experiencia narrativa de adquisición independiente, sin alterar la landing V4 de `/`; primero reconocimiento, después nombre, dirección y demostración honesta de continuidad.
- Ruta: `/descubre`, aislada de `/`; no redirige ni reemplaza el root.
- Arquitectura: cuatro pantallas de reconocimiento y open loop → presentación de NIA y nombre → scroll editorial de reframe → elección de dirección → Punto NIA determinista → feedback humano → adaptación → memoria conceptual con control → payoff → continuación comercial.
- Root preservado: `app/page.tsx` no fue modificado en esta tarea; smoke local conserva el H1, un solo H1, HTTP 200 y ausencia de errores.
- Datos temporales: `firstName`, `chosenDirection`, `directionStatus`, `feedbackType`, `stage`; se conserva solo en `sessionStorage` para poder refrescar la experiencia, sin DB, auth ni servicios externos.
- Personalización: el nombre y la dirección elegida se usan en los momentos relevantes; no se solicitan datos sensibles ni se hacen inferencias psicológicas.
- Demo: intervención breve, feedback contextual, adaptación visible y memoria conceptual etiquetada como ejemplo; no se finge IA personalizada ni almacenamiento real.
- Evidencia: sección preparada con `EVIDENCE CONTENT REQUIRED`; no se publican estadísticas, estudios ni claims psicológicos sin fuente documental aprobada.
- Voz y límites: NIA es cercana, directa y tranquila; no es chat, terapia, coaching, companion ni herramienta de crisis.
- Eventos separados: `discover_viewed`, `discover_first_tap`, `discover_open_loop_reached`, `discover_name_entered`, `discover_reveal_viewed`, `discover_direction_selected`, `discover_direction_confirmed`, `discover_first_point_viewed`, `discover_feedback_given`, `discover_adaptation_viewed`, `discover_product_explainer_reached`, `discover_primary_cta_clicked`.
- QA local 2026-09-30: typecheck ✓ · lint sin errores, con 3 warnings heredados fuera de la ruta · build ✓ · Playwright sin errores de consola · sin overflow en 375, 390 y 430 px · root y `/descubre` HTTP 200 local.
- Capturas: `output/playwright/discover-start-390.png`, `discover-name-390.png`, `discover-reveal-390.png`, `discover-direction-390.png`, `discover-point-390.png`, `discover-adaptation-390.png`, `discover-commercial-390.png`, `discover-desktop-1440.png`, `root-regression-390.png`.
- Pendientes/gates: `OFFER COMMERCIAL GATE: BLOCKED` por términos comerciales finales no publicados; `LEGAL GATE: BLOCKED` porque privacidad, términos y cancelación aprobados siguen pendientes; `FUNNEL GATE: BLOCKED` porque `/onboarding` no existe.
- Paid traffic: NO autorizado. Etapa 2/onboarding: NO iniciada.

## `/descubre` — Evidence Pass
- Evidencia incorporada: bloque editorial sobre la brecha intención–conducta modulada por el contexto, con disclosure opcional y enlace a PubMed.
- Fenómeno elegido: `intention–behavior gap modulated by context`.
- Fuente principal: Webb & Sheeran (2006), metaanálisis de 47 pruebas experimentales; `d = 0.66` para intención y `d = 0.36` para conducta, solo en disclosure y sin convertirlo en porcentaje.
- Sin estadística en el main flow: PASS. La evidencia aparece como explicación breve; el detalle se abre bajo demanda.
- Seguridad de claims: no se publican claims causales sobre mujeres, automaticidad, ansiedad, autoestima, asertividad ni eficacia de NIA.
- JITAI tratado como inspiración de diseño, no como validación de detección automática ni de resultados.
- Implementation intentions documentado como mecanismo adyacente, no como validación de NIA.
- Documento canónico: `docs/EVIDENCE-NIA.md`.
- Analytics: eventos existentes conservados; se añadió únicamente `discover_evidence_opened` para el disclosure opcional.
- Root: `/` no modificado.
- Etapa 2: NO iniciada. Oferta comercial, legales y onboarding siguen bloqueados; no ready for paid traffic.

## Construcción MVP de App — 2026-09-30
- Source of truth: `docs/APP-MVP.md`.
- Auditoría: el repo era una landing Next.js estática; no existían auth, DB/RLS, API, Hotmart, email ni WhatsApp configurados.
- Arquitectura actual: `/descubre` → `/onboarding` pre-paywall → `/paywall` → activación futura → `/login` → `/app`.
- Construido local-first: shell con `Hoy · Punto NIA · Evidencia · Tú`, motor determinista curado en `lib/mvp.ts`, pre-paywall de voz/mensajes/email/resumen y pantallas de paywall/login/activación preparadas sin fingir integraciones.
- Estado local: `localStorage` solo para preview; `/descubre` aporta nombre y dirección vía `sessionStorage`. No representa auth ni persistencia de producción.
- Home: saludo, mensaje diario determinista, feedback humano, CTA Punto NIA, dirección activa y evidencia confirmada.
- Punto NIA: cinco contextos cerrados, intervención breve y una adaptación de una sola respuesta; no hay chat abierto.
- Evidencia: empty state y timeline descriptiva; solo entradas confirmadas por la usuaria; sin scores, streaks ni gráficas.
- Tú: dirección, estilo, mensajes, memoria y límites de cuenta visibles; plan y cancelación no inventados.
- Bloqueos externos: Auth/DB/RLS, Hotmart/webhook, email de activación y WhatsApp no configurados. WhatsApp no bloquea el uso local del Home.
- Gates: App shell BUILT; pre-paywall BUILT local; auth BLOCKED; payment BLOCKED; messaging BLOCKED; controlled users NO; paid traffic NO.
- `/` preservado y `/descubre` extendido solo mediante su CTA existente hacia `/onboarding`; no se modificó su arquitectura inicial.

## Supabase Auth + DB + RLS — 2026-09-30
- Packages: `@supabase/ssr` y `@supabase/supabase-js` instalados. Clientes browser/server/admin separados; la clave secreta solo se referencia server-side.
- Migración sincronizada con Supabase: `20260930191704_initial_mvp.sql`, `20260930191817_secure_touch_updated_at_search_path.sql` y `20260930191940_index_subscriptions_user_id.sql`. Las cinco entidades MVP, timestamps, constraints, función segura e índice de suscripciones están alineados. `onboarding_drafts` no tiene policies públicas intencionalmente.
- Auth: login, logout desde el shell, forgot password y reset password implementados; middleware SSR protege `/app` y sus subrutas.
- API: endpoints server-side para profile, interactions, evidence y creación controlada de onboarding draft.
- Persistencia: Home, perfil y evidencia comienzan a leer/escribir por API autenticada; `lib/mvp.ts` queda como contenido/motor y fallback de preview, no como autorización.
- Verificación DB/RLS remota: VERIFIED según pruebas del proyecto: A/B aislados en profiles, interactions y evidence; insert de interacción ajena bloqueado; mutation de subscriptions bloqueada; drafts anónimos bloqueados. El índice puede aparecer como unused_index hasta tener tráfico.
- Estado: DB/RLS = VERIFIED. Auth API real con dos usuarios sintéticos = VERIFIED; las cuentas temporales fueron limpiadas. Auth UI end-to-end y persistencia visual completa quedan PENDING de una sesión de navegador autenticada.
- Vercel: variables de producción configuradas sin imprimir valores; redeploy de `nia.gritlab.pro` PASS. `/` y `/descubre` HTTP 200; `/login` HTTP 200; `/app` sin sesión redirige HTTP 307 a `/login`.
- Próximo paso único: validar en navegador una sesión autenticada completa y capturar las pantallas de app; luego el único blocker de producto será Hotmart.

## Gate App autenticada + Daily NIA — 2026-09-30
- Daily NIA: BUILT/DEPLOYED. `/api/daily` usa timezone del profile, `local_date`, `interaction_type=daily_message`, índice único y recuperación tras colisión. El feedback se actualiza sobre la misma interacción.
- Home: lee profile, evidence y daily desde Supabase; si falla la carga muestra error manejado y no recurre a localStorage.
- Tú: dirección, voz, frecuencia 0/1/2, hora y nombre se guardan vía `PATCH /api/profile`.
- Punto NIA: flujo browser probado contra producción y la interacción quedó asociada al usuario sintético correcto.
- QA browser: capturas autenticadas generadas en `output/playwright/`; login, Home, Punto, Evidencia, Tú y logout comprobados con una cuenta sintética. El primer daily comparison necesitó esperar la hidratación del profile; la igualdad de contenido persistido está respaldada por la fila única remota.
- Cleanup: cuenta sintética y datos asociados eliminados mediante Supabase Auth admin.
- Estado real: DB/RLS VERIFIED; Auth API VERIFIED; Daily NIA DEPLOYED; browser QA completo y reset visual siguen PENDING; Hotmart sigue siendo el siguiente blocker de negocio después de cerrar ese QA.

## Regla visual permanente — sin pretítulos
- NIA no utiliza eyebrows, kickers, overlines, pretítulos ni etiquetas decorativas/programáticas encima de títulos principales o contenido real.
- La regla aplica a todas las rutas, estados y componentes reutilizables. Se conservan únicamente labels funcionales o títulos que aportan contenido real, como etiquetas de formularios, fechas y campos de una demostración.
- Auditoría global aplicada el 2026-09-30 sin cambios de lógica, navegación, autenticación ni identidad visual.

## Home autenticada — simplificación de intervención
- `/app` queda centrada en una sola intervención dinámica, una pregunta breve y el CTA `Volver a mí →`.
- Se retiraron de Home el pretítulo, explicaciones repetidas, feedback diario, resumen de dirección y bloques vacíos de evidencia.
- Se mantienen Supabase, daily NIA, autenticación, Punto NIA y navegación inferior sin cambios de producto.

## Evolución del motor de personalización — 2026-09-30
- Estado: BUILT LOCAL / MIGRATION PENDING REMOTE VERIFICATION. El motor único server-side ahora exige generación LLM de tres candidatos, auditoría determinista, búsqueda semántica vectorial, auditoría LLM, selección por AND estricto, persistencia y feedback contextual.
- Modelo: `desired_change_original`, `current_context_original`, historial de contextos y `learning_profile`; se conserva el lenguaje original de la usuaria y no se crea expediente psicológico.
- Onboarding: ahora pregunta en lenguaje abierto qué quiere cambiar o vivir diferente, en qué situaciones le cuesta actuar como quiere y, opcionalmente, qué tendría que decir NIA para sentirse propia. No muestra `desired change`, `learning profile` ni taxonomía interna.
- Auditoría: revisa contexto, especificidad, longitud, una idea, clichés, coaching/chatbot, lenguaje prohibido, duplicado literal/conceptual y repetición de concepto/ángulo/estructura. El motor no envía candidatos sin auditoría.
- Aprendizaje: feedback contextual según función; `context_changed`, `wording_off`, `too_general` y `angle_change` producen señales estructuradas. La recalibración se expone mediante `/api/recalibration`, con primera revisión prevista a siete días y contextos históricos conservados.
- Punto NIA: usa el mismo motor que Daily NIA; recibe un contexto cerrado, obtiene una intervención breve, muestra una sola pregunta contextual y termina. El navegador ya no envía el texto de la intervención.
- Datos/migración: `supabase/migrations/20260930210000_personalization_audit_learning.sql` añade campos y tablas RLS para `context_history`, `interventions`, `intervention_candidates`, `intervention_feedback` y `learning_signals`. No se aplicó remotamente desde este entorno por no existir CLI/configuración de Supabase disponible; debe verificarse antes de deploy.
- IA real: proveedor OpenAI por HTTP server-side; `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_EMBEDDING_MODEL` y opcionalmente `OPENAI_API_BASE_URL`. La prueba real local confirmó 3 candidatos JSON y embeddings de 1536 dimensiones con el modelo configurado en `.env.local`; la clave no se expone.
- Semántica: cada candidato aprobado por la auditoría determinista obtiene embedding, consulta `match_intervention_embeddings` por `user_id` y pasa por thresholds centralizados (`0.65` review, `0.78` duplicate). Se distinguen duplicado semántico, revisión, saturación de concepto y candidato nuevo. La migración sigue pendiente de aplicación/verificación remota.
- Aprobación: deterministic PASS AND semantic PASS AND LLM approved. Si el LLM o embeddings fallan, se registra el error y solo se reutiliza una intervención aprobada relevante; no se fabrica una frase genérica.
- Learning: el brief consulta señales activas, usa contexto específico, cambia wording/estructura o ángulo según feedback, y aplica expiración de 30 días para wording/angle. Context change bloquea generación hasta recalibración; desired changes anteriores quedan en `desired_change_history`.
- WhatsApp: preparado arquitectónicamente porque el resultado del motor es independiente del canal (`intervention`, feedback y channel), pero la integración continúa PENDING.
- Tests: `npm run test:intervention`, typecheck y build pasan; lint pasa con cuatro warnings heredados. Smoke real de OpenAI pasa generación estructurada de 3 candidatos y embeddings. Persistencia vectorial/RPC, RLS remoto y concurrencia multi-instancia siguen pendientes de verificación sin aplicar migraciones remotas.
- Panel: `/admin/interventions` y `/api/admin/interventions` muestran intervención, tres candidatos, auditorías, razones, similitudes, feedback, learning signals e historial; mantienen allowlist de email y acceso privilegiado exclusivamente server-side.
- Riesgos: aplicar y validar las migraciones en Supabase; probar RPC vectorial, RLS, concurrencia simultánea y flujo end-to-end con una usuaria de prueba real antes de declarar COMPLETE remoto.

## Fase 3.8 — Cambio de contexto y recalibración — 2026-10-01
- Context change: `context_changed` conserva el objetivo, bloquea la generación y devuelve `calibration_required` estructurado; la respuesta confirmada crea un nuevo contexto activo sin borrar el historial anterior.
- Desired change change: `desired_change_changed` conserva `desired_change_history`, marca el objetivo anterior como ended y el nuevo como active; exige nueva calibración antes de generar.
- Brief operativo: solo usa el contexto activo y filtra patrones/intervenciones del contexto anterior para la generación y auditoría; el historial completo sigue persistido.
- Calibración: usa el mismo `/api/calibration` para missing context, context change y desired change change; pregunta y opciones son Structured Outputs dinámicos, con texto libre siempre disponible. El campo se normaliza server-side a `active_context` o `desired_change` según el motivo solicitado.
- Señales: las señales de transición permanecen como historial; cuando la calibración queda `resolved`, el brief las trata como inactivas sin requerir UPDATE de señales (compatible con RLS actual).
- Diversidad post-recalibración: durante 24 horas después de confirmar un cambio, el brief pide priorizar el contexto/objetivo nuevo y evitar repetir concepto, ángulo o estructura anteriores; mantiene los mismos thresholds y RPC.
- Feedback: los botones incluyen `context_changed` y `desired_change_changed` además de las señales de wording, especificidad y ángulo; cada opción tiene mapeo explícito.
- LLM vacío: `llm_empty_response` corresponde a una respuesta del proveedor sin `message.content`; se mantiene como fallo técnico con 2 intentos técnicos separados de los retries de calidad. No hay fallback genérico.
- E2E remoto sintético: trabajo → pareja → familia y objetivo “confiar” → “poner límites” verificados; las intervenciones muestran snapshots distintos y el historial conserva los estados anteriores. No se usaron usuarios reales, deploy, commit ni push.
- QA final local: `npm run test:intervention` ✓ · `npm run typecheck` ✓ · `npm run lint` ✓ con 4 warnings heredados · `npm run build` ✓.

## Fase 3.9D — Semantic judge — 2026-09-30
- La similitud vectorial dejó de ser veredicto: recupera hasta 3 matches y solo activa el juez semántico desde `0.58`; `0.63` queda como banda metadata, no como rechazo automático.
- Añadido `lib/server/semantic-judge.ts` con Structured Outputs: `duplicate`, `same_theme_different_angle` o `distinct`. Solo `duplicate` bloquea; saturación de concepto y auditoría LLM permanecen separadas.
- El audit trail conserva similarity, similarity band, matches del juez y razones dentro de `audit_results` JSONB; no requiere migration.
- Replay local de los 12 casos existentes: 0 llamadas nuevas; los 12 requieren juez porque están sobre `0.58`. Tests, typecheck y build PASS; lint PASS con 4 warnings heredados. No deploy, commit ni push.

## Fase 3.9E — Calibración real del semantic judge — 2026-09-30
- Se ejecutaron únicamente los 12 casos existentes del replay, sin Red Team nuevo. Resultado real: 5 `duplicate`, 7 `same_theme_different_angle`, 0 `distinct`.
- Usage devuelto: 12 llamadas, 4,594 input tokens, 2,875 output tokens, 7,469 total tokens; no se calculó USD por falta de pricing configurado. Latencia total: 39,578 ms.
- Resultados detallados: `output/red-team/semantic-judge-results.json` y `.md`. No se cambiaron thresholds, prompts, embeddings, Supabase ni producción.
- Suite: test de intervención, typecheck y build PASS; lint PASS con 4 warnings heredados.

## Fase 3.9F — Integración final del semantic judge — 2026-09-30
- Flujo productivo verificado: deterministic → retrieval de hasta 3 matches → semantic judge desde `0.58` → LLM audit → selección.
- `0.63` solo determina `similarityBand=high_similarity`; no rechaza automáticamente. `semantic_review` queda como warning/metadata.
- `duplicate` falla; `same_theme_different_angle` y `distinct` pasan la capa semántica. El audit trail conserva band, judge matches, relación, flags y razón en el JSONB existente.
- Suite final: test de intervención, typecheck y build PASS; lint PASS con 4 warnings heredados. No deploy, commit ni push.

## Fase 4B — NIA Control operacional — 2026-09-30
- Backoffice implementado sobre la protección existente `requireAdmin`/`NIA_ADMIN_EMAILS`, sin segundo sistema de autenticación y con service role únicamente server-side.
- Dashboard `/admin`: periodos today/7d/30d/custom, usuarios activos por actividad operacional, requests/aprobaciones/no approved, approval rate por ejecuciones completadas, feedback, learning, recalibraciones, retries, capas de rechazo, uso de proveedor, errores y actividad reciente.
- Vistas: `/admin/users`, `/admin/users/[id]`, `/admin/interventions`, `/admin/interventions/[id]`, `/admin/operations` y `/admin/errors`; incluyen paginación, filtros y detalle operacional. El email se obtiene desde Auth; WhatsApp, costos, MRR, churn y conversión de trial muestran `NOT AVAILABLE`.
- APIs nuevas/extendidas: dashboard, users, user detail, intervention detail; operations e interventions existentes ampliadas con filtros, periodos, límites y auditoría administrativa.
- Validación: `npm run test:intervention`, `npm run test:operational`, typecheck, lint y build PASS; lint mantiene 4 warnings heredados; `git diff --check` PASS.
- QA visual: `/admin` redirige a `/login` sin sesión, confirmando deny-by-default. No se pudo revisar el interior del backoffice sin una sesión admin real; evidencia en `output/playwright/admin-auth-check.png`.
- Pendiente: aplicar migration operacional remotamente y hacer QA visual autenticada con datos reales; no se hicieron cambios remotos, deploy, commit ni push.

## Fase 4B — Dashboard operacional — 2026-09-30
- `/admin` consume una única agregación server-side para usuarios, ejecuciones, intervenciones, generación, errores, performance, feedback/learning, provider usage y eventos.
- Periodos soportados: today, 7 days, 30 days y custom mediante `date_from`/`date_to`; las fechas usan UTC y se aplican consistentemente a las consultas.
- Métricas sin fuente confiable se muestran como `NOT AVAILABLE`: costo AI, WhatsApp, infraestructura, MRR, churn y trial conversion.
- Añadido `lib/server/admin-dashboard.ts` como agregador puro y `npm run test:dashboard` para probar rangos, approval rate, no double count, errores y estados vacíos sin Supabase ni OpenAI.
- Dashboard actualizado con execution health diario, failure breakdown, generation funnel, provider usage, latencias por operación, feedback/learning, eventos y disponibilidad de datos.

## Fase 4C — User Detail — 2026-09-30
- `/admin/users/[id]` es read-only y muestra identidad desde Auth, estado actual, learning profile, context history, desired change history, usage, timeline, intervenciones, feedback, learning signals, ejecuciones limitadas y provider usage por operación.
- La API devuelve conteos separados de listas limitadas; no presenta una muestra parcial como total. Registra `view_user` con user_id y ruta.
- Onboarding por usuario queda `NOT AVAILABLE` porque `onboarding_drafts` no tiene `user_id` y el evento actual no conserva relación confiable; WhatsApp y Cost Ledger también quedan `NOT AVAILABLE`.
- Helpers puros y test: `lib/server/admin-user-detail.ts`, `scripts/test-user-detail.mjs`, `npm run test:user-detail` PASS.
- QA visual autenticada pendiente por falta de sesión admin; las capturas generadas muestran el redireccionamiento seguro a `/login`: `output/playwright/admin-user-detail-1440.png` y `admin-user-detail-390.png`.

## Fase 4D — Intervention Observability — 2026-10-01
- `/admin/interventions/[id]` queda como vista read-only de trazabilidad: intervención final, usuario, snapshots de contexto/objetivo al generar, execution, attempts, candidatos y auditorías por capa.
- Añadida `lib/server/admin-intervention-detail.ts` para derivar capas de rechazo, selección, agrupación de provider usage, timeline y sanitización de datos técnicos sin cambiar la decisión del motor.
- `app/api/admin/interventions/[id]/route.ts` devuelve expediente estructurado, obtiene email desde Auth, registra `view_intervention`, valida el ID y no expone prompts, credenciales ni headers. `learning_signals` se muestra como historial del usuario porque el schema no tiene `intervention_id`; no se atribuye causalidad individual.
- Test nuevo: `npm run test:intervention-detail`; suite, typecheck y build PASS; lint PASS con 4 warnings heredados; `git diff --check` PASS.
- QA autenticada pendiente: no había sesión admin en el entorno. Playwright confirmó redirect seguro a `/login`; capturas de ese estado en `output/playwright/admin-intervention-detail-1440.png` y `admin-intervention-detail-390.png`.

## Fase 4E — Conexión WhatsApp Evolution — 2026-10-03
- `/app/tú` usa un panel real para iniciar la vinculación: genera código temporal `NIA-XXXX`, muestra el número oficial desde `WHATSAPP_BUSINESS_NUMBER`, abre el deep link de WhatsApp y consulta el estado durante un tiempo limitado.
- `/api/whatsapp/link` usa sesión real y cliente administrativo server-side para persistir tokens porque la RLS existente no permite escrituras directas; el código se almacena como hash.
- El webhook `MESSAGES_UPSERT` valida el token, evita `fromMe`, vincula `wa_id`/teléfono en `whatsapp_connections`, consume el token y envía confirmación mediante Evolution con nombre dinámico.
- Producción tiene las tablas base `whatsapp_connections` y `whatsapp_link_tokens`; no se añadió migración porque el código usa el esquema real disponible. Evolution `nia` mantiene webhook autenticado y `MESSAGES_UPSERT`.
- Validación: suites relevantes, typecheck, lint y build PASS; lint conserva 4 warnings heredados. `/` y `/descubre` responden 200; API de conexión sin sesión responde 401.
- Pendiente real: prueba manual con un teléfono de WhatsApp que envíe el código y reciba la confirmación/mensaje de prueba; no se enviaron mensajes reales durante esta sesión.

## Fase 4F — Outbound WhatsApp Evolution — 2026-10-03
- Causa del fallo outbound: la instancia real de Evolution estaba publicada como `NIA`, mientras el cliente usaba `EVOLUTION_INSTANCE=nia`; inbound seguía funcionando porque no incluye el nombre de instancia en la URL del webhook, pero `/message/sendText/{instance}` sí lo requiere.
- `EVOLUTION_INSTANCE` de Vercel Production se sincronizó con `NIA`; la instancia fue verificada read-only como `open` mediante `fetchInstances`.
- `sendWhatsAppText` conserva el endpoint `/message/sendText/{instance}` y el payload `{ number, text }`, añade timeout, status HTTP, extracción de message id y logging saneado. El botón de prueba y la confirmación automática no convierten errores del proveedor en éxito.
- El webhook consume el token de vinculación de forma condicional/idempotente antes de enviar confirmación, evitando duplicados concurrentes.
- Test sintético outbound verifica respuesta 201 con message id y rechazo 404; suites relevantes, typecheck, lint y build ejecutados. No se envió ningún mensaje real durante esta sesión.

## Fase 4G — Composición humana de mensajes — 2026-10-03
- Se añadió `lib/server/message-composer.ts` como capa final, separada del motor psicológico: usa `first_name` real, timezone del perfil y hora local para saludo; añade cierres breves por franja y evita repetir el cierre reciente.
- `/api/daily` persiste el mensaje completo ya compuesto; `/app` reutiliza ese mismo contenido, sin una versión distinta para web. La intervención base, auditoría y selección del motor no cambian.
- Tests de compositor: franjas Bogotá, timezone alternativo, nombre ausente sin fallback, cierres y no repetición inmediata. Producción desplegada; `/` y `/descubre` siguen respondiendo 200.
- Limitación real: el repositorio no contiene actualmente un job/ruta que envíe intervenciones diarias por WhatsApp; solo existen outbound de confirmación y mensaje de prueba. No se afirma que el envío diario esté activo.
