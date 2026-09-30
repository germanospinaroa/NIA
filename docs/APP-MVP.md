# NIA App MVP — fuente canónica

Última actualización: 2026-09-30.

## Supabase Auth + DB — implementación en curso

Se añadieron los clientes oficiales `@supabase/ssr` y `@supabase/supabase-js`, separados en browser, server y admin server-only. La migración trazable está en `supabase/migrations/20260930_initial_mvp.sql` y define `onboarding_drafts`, `profiles`, `interactions`, `evidence_entries` y `subscriptions`, con RLS por usuaria. Los drafts solo se escriben mediante `POST /api/onboarding-draft`; no existe lectura pública ni enumeración.

La protección de `/app`, `/app/punto`, `/app/evidencia` y `/app/tu` se hace mediante sesión SSR. `/login`, `/forgot-password` y `/reset-password` usan Supabase Auth real. Los endpoints de perfil, interacciones y evidencia validan sesión server-side. `SUPABASE_SECRET_KEY` solo se importa desde el cliente admin server.

El código está preparado, pero el proyecto remoto devolvió `404` para las cinco tablas: la migración todavía no ha sido aplicada en Supabase. Hasta aplicarla y ejecutar pruebas de aislamiento con dos usuarios, Auth/DB/RLS no se consideran operativos ni se despliega a producción.

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
