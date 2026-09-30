# NIA App MVP — fuente canónica

Última actualización: 2026-09-30.

## Supabase Auth + DB — LIVE / VERIFIED

Se añadieron los clientes oficiales `@supabase/ssr` y `@supabase/supabase-js`, separados en browser, server y admin server-only. El historial local está alineado con Supabase: `20260930191704_initial_mvp.sql`, `20260930191817_secure_touch_updated_at_search_path.sql` y `20260930191940_index_subscriptions_user_id.sql`. El proyecto remoto contiene `onboarding_drafts`, `profiles`, `interactions`, `evidence_entries` y `subscriptions`, con RLS verificado por usuaria. Los drafts solo se escriben mediante `POST /api/onboarding-draft`; no existe lectura pública ni enumeración.

La protección de `/app`, `/app/punto`, `/app/evidencia` y `/app/tu` se hace mediante sesión SSR. `/login`, `/forgot-password` y `/reset-password` usan Supabase Auth real. Los endpoints de perfil, interacciones y evidencia validan sesión server-side. `SUPABASE_SECRET_KEY` solo se importa desde el cliente admin server.

La base remota está operativa. Las pruebas reportadas confirman aislamiento entre usuarios, inserción propia de interacciones, bloqueo de suscripciones desde cliente y bloqueo anónimo de drafts. Una prueba Auth real con dos cuentas sintéticas confirmó login, profile propio, aislamiento cruzado y bloqueo de subscription mutation; las cuentas y datos de prueba fueron eliminados después. `onboarding_drafts` mantiene RLS sin policies públicas de forma intencional; el aviso Security Advisor “RLS Enabled No Policy” es esperado. El índice de suscripciones se conserva aunque inicialmente aparezca como unused_index.

### Daily NIA

`GET /api/daily` calcula la fecha local usando el timezone del perfil, reutiliza la fila existente y persiste una nueva `daily_message` solo cuando no existe. La unicidad y la carrera de inserción se resuelven con la restricción de la base; un conflicto vuelve a leer la fila ganadora. `PATCH /api/daily` conserva el feedback de la usuaria en esa misma interacción. Home no usa localStorage para profile, daily, evidence ni Punto NIA.

Lifecycle previsto: `onboarding_draft → compra confirmada → auth.user → profile`. La activación Hotmart sigue pendiente y no se simula.

## Estado honesto

El repositorio no tenía auth, base de datos, API, email transaccional, Hotmart ni WhatsApp configurados. La V1 implementada en esta fase es una superficie funcional local-first: pre-paywall, shell de app, motor determinista curado, navegación, Home, Punto NIA, Evidencia y Tú. La persistencia local permite probar la experiencia, pero no equivale a una cuenta real ni está lista para usuarias externas.

## Arquitectura congelada

`AD/ORGANIC → /descubre → onboarding pre-paywall → /paywall → compra Hotmart confirmada → activación segura → /login → /app`.

El onboarding no vuelve a aparecer después del pago. La cuenta nace después de confirmación verificable del proveedor.

## App shell

Navegación máxima de cuatro destinos: `Hoy · Punto NIA · Evidencia · Tú`. La navegación es inferior, fija y visible en mobile. Configuración vive dentro de `Tú`.

## Producto V1

- Una sola dirección activa.
- Punto NIA con cinco contextos cerrados, intervención breve y una microseñal humana.
- Mensaje diario determinista, compartido conceptualmente entre Home y futuros canales.
- Evidencia únicamente confirmada por la usuaria; narrativa, sin score, streaks ni gráficas.
- Memoria: dirección, estilo, contextos y señales elegidas. NIA recuerda dirección, no secretos.
- NIA no es chat abierto, terapia, coaching, journaling ni companion.

## Pre-paywall

Se reutilizan `firstName`, `chosenDirection` y el feedback de `/descubre` cuando están disponibles. Se pide únicamente estilo de voz mediante ejemplos, frecuencia 0/1/2, horario base y email. El draft conceptual es `onboarding_draft`; la implementación server-side queda pendiente de DB/auth.

## Estado local de desarrollo

`lib/mvp.ts` concentra tipos, direcciones, estilos, contextos, motor determinista y eventos. `localStorage` se usa solo para preview local. No debe tratarse como identidad, autorización ni persistencia de producción.

## Entidades previstas

`onboarding_drafts`, `profiles`, `interactions`, `evidence_entries`, `subscriptions`, con RLS por usuario cuando se conecte el proveedor elegido. No se crean migraciones hasta definir entorno y proyecto reales.

## Integraciones

- Auth: BLOCKED — proveedor no configurado. No se implementa auth propio.
- DB/RLS: BLOCKED — proveedor y entorno no configurados.
- Hotmart/webhook: BLOCKED — no existe configuración verificable.
- Email de activación: BLOCKED — proveedor no configurado.
- WhatsApp: OFF — no existe Meta Cloud API, Twilio ni otro proveedor verificado. Home no depende de él.
- IA: no necesaria en V1; motor determinista reemplazable por una interfaz futura.

## Analytics MVP

Se conservan eventos de adquisición. La app local puede emitir: `app_home_viewed`, `nia_point_started`, `nia_point_completed`, `daily_message_feedback`, `evidence_saved`, `direction_changed`, `message_preferences_changed`, `subscription_manage_clicked` cuando exista la acción real.

## Non-goals V1

Chat abierto, journaling, múltiples direcciones, comunidad, streaks, gamificación, scores, gráficas, cursos, audio, voz, diagnóstico, assessment de salud mental, companion AI, múltiples agentes, detección automática de emociones, detección automática del momento correcto, automatización avanzada de WhatsApp, app nativa y motor complejo de notificaciones.

## Decisiones pendientes

Configurar un único proveedor de DB/auth, configurar Hotmart con webhook firmado e idempotente, definir oferta comercial real, configurar email de activación y decidir si/ cuándo se activa WhatsApp. Hasta entonces: no controlled users, no paid traffic.

## Evolución del motor de personalización — 2026-09-30

La aplicación mantiene un único motor server-side para Daily NIA y Punto NIA. Ya no acepta una frase enviada por el navegador como intervención final. El flujo es: `brief → 3 candidatos → auditoría determinista → selección → persistencia → feedback contextual`.

El brief separa `desired_change_original`, `current_context_original` y `learning_profile`. El onboarding recoge dos respuestas abiertas obligatorias y una opcional: qué quiere cambiar o vivir diferente, en qué situaciones le cuesta actuar como quiere y qué lenguaje le resultaría propio. Las preferencias de voz y mensajes siguen después, sin mostrar términos internos del sistema.

La auditoría local verifica contexto real, longitud, una sola idea, cliché, lenguaje de chatbot/coaching, lenguaje de framework (incluidos “sostener” y “mantener” como lenguaje introducido por NIA), repetición literal, similitud léxica/conceptual, concepto saturado y reutilización reciente de estructura. Los candidatos rechazados y sus razones se guardan en `intervention_candidates`; la intervención aprobada y su brief/auditoría se guardan en `interventions`.

El feedback deja de ser universal. `feedbackFor()` elige una pregunta y hasta tres opciones según la función de la intervención; `learningFromFeedback()` convierte la respuesta en una señal concreta, por ejemplo contexto cambiado, redacción poco propia, especificidad baja o ángulo rechazado. `intervention_feedback` y `learning_signals` conservan esa trazabilidad.

La recalibración está preparada en `GET/POST /api/recalibration`: primera revisión a los siete días y actualización explícita de contexto o de cambio deseado. Los contextos anteriores se conservan en `context_history`; no se diagnostica ni se infiere personalidad.

La comparación semántica actual es determinista y configurable (`lib/intervention-engine.ts`); no se añadió un proveedor de embeddings ni un LLM inexistente. `pgvector`, embeddings persistidos y auditoría LLM estructurada quedan pendientes de una decisión/proveedor real. La interfaz del motor permite incorporarlos sin duplicar el pipeline. No se declara eficacia científica de NIA.

Migración aditiva preparada: `supabase/migrations/20260930210000_personalization_audit_learning.sql`. Debe aplicarse al proyecto Supabase antes de usar en producción las nuevas rutas; no elimina ni reescribe datos MVP existentes. Añade campos de perfil/draft, historial de contexto, intervenciones, candidatos, feedback y señales de aprendizaje, con RLS por usuaria.

Reglas permanentes de voz: NIA es concreta, adulta y breve; no es coach, terapeuta ni chatbot. No genera frases motivacionales genéricas, no atribuye cambios que no puede verificar y no usa `sostener`/`mantener` como lenguaje propio. La intervención programada, Punto NIA y el futuro canal WhatsApp consumen el mismo motor y no conversan indefinidamente.
