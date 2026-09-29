# PUBLICACION SEGURA Y CONTINUA

> **Cuándo cargar este archivo:**
> - Al conectar GitHub, Supabase o Vercel por primera vez.
> - Antes de publicar una app, configurar dominio, Auth, pagos, email u OAuth.
> - Cuando un `push` no despliega, el repo no aparece en Vercel o producción no refleja el último commit.
> - Al cambiar de cuenta/equipo, renombrar o transferir el repo, mover un monorepo o rotar secretos.
>
> **Fuente canónica:** este archivo define la conexión operativa. `08-DEPLOY.md` explica la infraestructura;
> `09-SEGURIDAD.md` protege la aplicación; `61-INTEGRIDAD-DE-LANZAMIENTO.md` decide si puede venderse.

## 1. Resultado obligatorio

"La app está publicada" significa que TODO esto está probado:

1. El directorio local apunta al repositorio GitHub correcto.
2. El proyecto Vercel existente está conectado de forma persistente a ESE repositorio.
3. La rama de producción y el directorio raíz son correctos.
4. Un push a una rama crea Preview automáticamente y un merge/push a producción crea Production.
5. El SHA de GitHub, el SHA construido por Vercel y el expuesto por la app coinciden.
6. Supabase está enlazado al `project-ref` correcto antes de aplicar migraciones.
7. Development, Preview y Production no comparten secretos ni datos reales por comodidad.
8. Dominio, Auth, OAuth, email y webhooks usan la URL final correcta.
9. Existe rollback de código y estrategia compatible para cambios de base de datos.
10. `PUBLICATION-CERTIFICATE.md` contiene evidencia sin valores secretos.

Un deploy manual exitoso NO prueba los puntos 2-4. Un sitio que abre NO prueba pagos, Auth, emails,
migraciones ni que el siguiente cambio vaya a publicarse.

---

## 2. Cinco conceptos que no se confunden

| Pieza | Qué demuestra | Qué NO demuestra |
|---|---|---|
| `git remote -v` | El clon local conoce un repo remoto | Que Vercel lo observe |
| Repo en GitHub | El código fue subido | Que exista proyecto Vercel |
| `vercel link` / `.vercel/project.json` | La carpeta local apunta a un proyecto Vercel | Que GitHub esté conectado para auto-deploy |
| `Project Settings -> Git -> Connected Git Repository` | Vercel escucha el repo | Que rama/root/env/build sean correctos |
| Deployment `Ready` | Ese build terminó | Que sea el SHA esperado o que el flujo futuro funcione |

**Regla:** nunca aceptar `vercel --prod` como sustituto permanente de la integración Git. Puede servir
para diagnóstico o emergencia, pero antes de cerrar se repara y prueba GitHub -> Vercel.

Documentación oficial de referencia (revalidar porque la UI/CLI cambia):
- https://vercel.com/docs/git
- https://vercel.com/docs/project-configuration/git-settings
- https://vercel.com/docs/cli/link
- https://supabase.com/docs/guides/local-development/cli-workflows
- https://supabase.com/docs/guides/auth/redirect-urls

---

## 3. Protocolo Cero Secretos en Chat

### 3.1 Clasificar antes de pedir

**Público por diseño:** nombre de variable, dominio, URL pública del proyecto, Supabase publishable/
anon key, IDs públicos de producto cuando el proveedor así lo documenta. La publishable key solo es
segura con RLS real; pública no significa que pueda autorizar datos por sí sola.

**Secreto:** password de DB, API keys de IA/Resend, Supabase secret/service-role key, HOTTOK, firmas de
webhook, tokens GitHub/Vercel/Supabase, OAuth client secret, connection strings y cookies/sesiones.

### 3.2 Conducta obligatoria del agente

- Pedir solo el **nombre**, proveedor y estado: `configurada / falta / no verificada`; jamás el valor.
- Nunca decir "pégame", "envíame", "dime" o "copia aquí" una clave, token, password o cookie.
- El usuario introduce el valor directamente en el dashboard oficial o en un prompt interactivo de CLI.
- No poner secretos como argumentos de línea de comandos: pueden quedar en historial, procesos o logs.
- No imprimir `env`, `.env*`, headers, cookies ni payloads completos. Mostrar nombres y valores redactados.
- No pedir capturas con valores visibles. Si una pantalla puede revelarlos, indicar primero cómo ocultarlos.
- Preferir OAuth/conectores y permisos mínimos; no pedir un PAT cuando una autorización de navegador basta.
- Confirmar presencia, entorno y redeploy sin leer/repetir el valor.
- `NEXT_PUBLIC_*`/`VITE_*` solo para datos explícitamente públicos. Un prefijo público convierte el valor en
  parte del bundle; no lo protege.

Forma correcta de guiar:

> "Abre Vercel -> Project -> Settings -> Environment Variables. Crea `RESEND_API_KEY`, marca solo
> Production y Sensitive, pega allí el valor sin enviármelo y dime únicamente `configurada`."

Forma prohibida:

> "Pásame tu RESEND_API_KEY/HOTTOK y yo la configuro."

### 3.3 Si un secreto aparece

1. Detener la publicación y no volver a citar el valor.
2. Tratarlo como comprometido aunque el repo/chat sea privado.
3. Revocar o rotar en el proveedor.
4. Sustituirlo en el almacén de secretos y crear un deployment nuevo.
5. Buscarlo en archivos, commits, logs, artefactos, screenshots y CI.
6. Si entró a Git, limpiar el historial con una herramienta apropiada y coordinar el cambio; borrar solo el
   archivo actual no elimina el secreto histórico.
7. Probar que la credencial anterior ya no funciona y registrar el incidente sin el valor.

`.env.example` contiene nombres y ejemplos ficticios. `.env`, `.env.*`, `.vercel/`, dumps y archivos de
credenciales quedan fuera de Git. La excepción explícita es `.env.example`.

---

## 4. Máquina de estados de publicación

No saltar estados. Cada estado termina con evidencia y un veredicto `PASS / BLOCKED / NOT_APPLICABLE`.
Una acción de cuenta que solo puede realizar el dueño queda `BLOCKED` hasta que él confirme el resultado
esperado; el agente continúa mientras tanto con lo independiente.

### P0 - Inventario e identidad

Registrar sin secretos:

```text
Local root:
GitHub owner/repo:
Git remote origin:
Default branch:
Vercel scope/team + project name:
Vercel connected repository:
Vercel production branch:
Vercel root directory:
Supabase environment + project name + project-ref:
Production domain:
Servicios con callbacks/webhooks: Auth / OAuth / pagos / email / otros
```

Si hay más de un repo/proyecto parecido, NO elegir por nombre. Comparar owner, URL, IDs no secretos,
último SHA y dominio. Nunca crear otro proyecto Vercel porque el correcto no apareció sin diagnosticar antes.

### P1 - Preflight local y GitHub

1. Leer `git status`, rama actual y `git remote -v`.
2. Confirmar que no hay secretos ni datos reales en archivos rastreados o historial reciente.
3. Verificar `.gitignore`, `.env.example`, lockfile y scripts reproducibles.
4. Ejecutar lint, typecheck, tests, build, E2E, seguridad y Gates 1-10 de `61`.
5. Crear/usar repo privado por defecto para producto comercial; configurar owner correcto.
6. Push y comprobar que `origin`, GitHub owner/repo, rama y SHA remoto coinciden.

No incrustar tokens en el remote (`https://TOKEN@github.com/...`). Usar conector, GitHub App, SSH o login
seguro de CLI.

### P2 - Integración persistente GitHub -> Vercel

1. Abrir/consultar el proyecto Vercel correcto; no crear duplicado.
2. Verificar `Settings -> Git -> Connected Git Repository = owner/repo`.
3. Si el repo no aparece, usar `Configure GitHub App` y conceder acceso solo al repo necesario. En una
   organización puede requerir aprobación del owner.
4. Verificar scope/team, Production Branch, Framework Preset, Root Directory, Install Command, Build Command,
   Output Directory y Node/runtime compatibles con el repo.
5. Revisar `Ignored Build Step`: no debe cancelar silenciosamente el tipo de deployment que se necesita.
6. Si existe `.vercel/project.json`, comprobar que sus IDs corresponden al mismo proyecto; no versionarlo.
7. Registrar el estado de integración en el certificado.

**Gate:** Vercel debe mostrar un Connected Git Repository exacto. `vercel link`, una URL viva o un deploy
manual no satisfacen este gate.

### P3 - Supabase correcto y reproducible

1. Separar como mínimo Development/Preview de Production. Si no hay presupuesto para tres proyectos, usar
   local para Development y un proyecto no productivo para Preview; jamás probar destrucción en Production.
2. Autenticar por navegador/conector; no pedir access token por chat.
3. Ejecutar `supabase link --project-ref <id-publico>` y verificar que el proyecto enlazado coincide con P0.
4. Comparar `supabase migration list`; resolver drift antes de avanzar.
5. Ejecutar `supabase db push --dry-run`, revisar SQL/destino y solo entonces `supabase db push`.
6. Probar clean-room local (`supabase db reset`) y regenerar tipos si cambia esquema.
7. Ejecutar advisors, RLS/IDOR, grants, funciones y Storage según `25`, `27` y `61`.

**Bloqueo duro:** `supabase db reset --linked`, `--include-seed`, borrado o reparación destructiva NO se
ejecutan contra Production. El agente vuelve a mostrar nombre + project-ref + impacto y pide aprobación
explícita para cualquier operación remota destructiva incluso fuera de producción.

**Regla dura: EL AGENTE JAMÁS POSEE CREDENCIALES DE ESCRITURA SOBRE PRODUCCIÓN.** Toda operación
destructiva en prod (migración, borrado, cambio de esquema) exige: backup del día verificado +
confirmación humana explícita + correr primero en preview. Los casos que fundan la regla: un agente
de Replit borró la base de producción de SaaStr durante un code freeze y fabricó 4.000 usuarios
falsos para taparlo (jul-2025); un agente con un token encontrado en un archivo borró 3 meses de
datos de PocketOS en 9 segundos (2026). El MCP/las herramientas del agente apuntan SIEMPRE al
proyecto de desarrollo; producción se toca por CI/CD con gates. Es la misma doctrina que `25` fija
en su sección de entornos ("nunca apuntar el MCP ni los experimentos a producción") — aquí se
vuelve bloqueo de publicación.

### P4 - Variables por ambiente

Crear un inventario de **nombres**, nunca valores:

| Variable | Pública/secreta | Development | Preview | Production | Consumidor | Redeploy |
|---|---|---:|---:|---:|---|---:|
| `NEXT_PUBLIC_SITE_URL` | pública | local | preview | dominio final | cliente/servidor | sí |
| `NEXT_PUBLIC_SUPABASE_URL` | pública | dev | preview | prod | cliente/servidor | sí |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | pública | dev | preview | prod | cliente | sí |
| `SUPABASE_SECRET_KEY` | secreta | dev | preview | prod | servidor | sí |
| claves IA/email/pagos/webhooks | secretas | test | test | live | servidor | sí |

- Preview no usa DB, pagos, email ni claves live de Production.
- Marcar variables secretas como Sensitive cuando el proveedor lo permita.
- Preferir el dashboard o entrada interactiva/stdin. `vercel env run` evita escribir secretos al disco.
- `vercel env pull` escribe un archivo: advertir antes de sobrescribir y comprobar que esté ignorado.
- Cambiar una variable exige nuevo deployment; los anteriores no se actualizan retroactivamente.
- Probar un endpoint/health check que reporte solo `configured: true/false`, nunca el valor.

### P5 - Preview real

1. Crear una rama de verificación desde un árbol limpio.
2. Hacer un cambio canario inocuo y visible solo en `/api/version`, metadata o panel admin.
3. Push de la rama.
4. Confirmar que Vercel creó automáticamente un Preview con Source = Git y el mismo SHA.
5. Esperar checks; abrir URL; probar consola/red, Auth no productiva y flujos E2E críticos.
6. Confirmar que GitHub muestra el check/deployment de Vercel.
7. Revertir o integrar el canario según diseño; no dejar texto de prueba visible al público.

Si no nace Preview automáticamente, el vínculo P2 está roto o la configuración lo está omitiendo. No
compensar con `vercel`; diagnosticar permisos, repo, rama, autor, root y ignored build.

### P6 - Dominio, Auth y callbacks

Cuando exista la URL final:

1. Asignar dominio al proyecto Vercel correcto y verificar DNS/SSL/canonical/redirect www-apex.
2. Definir `NEXT_PUBLIC_SITE_URL`/equivalente de Production con URL final y redeploy.
3. En Supabase Auth: `Site URL` exacta de producción; redirects exactos de producción; localhost y patrón
   restringido de Vercel solo para desarrollo/preview. No usar `https://**` global.
4. Revisar OAuth provider callbacks y orígenes permitidos.
5. Actualizar Resend links/from/domain, payment return URLs y TODOS los webhooks.
6. Verificar CORS/CSP/CSRF/cookies Secure/SameSite contra dominio real.
7. Probar confirmación, login, reset, logout y enlace expirado desde email real.

Mantener `URL-DEPENDENCIES` dentro del certificado: cambiar dominio obliga a recorrer esa lista completa.

### P7 - Producción

1. Merge/push a Production Branch mediante el flujo normal del repo.
2. Confirmar deployment automático, Source = Git, estado Ready y checks en verde.
3. Comparar `git rev-parse HEAD`, SHA remoto, `VERCEL_GIT_COMMIT_SHA`/metadata y `/api/version`.
4. Confirmar migración aplicada, entorno Production y dominio asignado a ese deployment.
5. Ejecutar smoke/E2E en URL final: landing, onboarding, Auth, core, pago test permitido, webhook, email,
   cancelación/refund según aplique, analytics y backoffice.
6. Completar `RELEASE-MANIFEST.json` y `PUBLICATION-CERTIFICATE.md`.

### P8 - Prueba obligatoria de la segunda publicación

La primera publicación NO cierra el proceso.

1. Crear un segundo commit canario inocuo sobre el flujo normal aprobado.
2. Push sin ejecutar `vercel` manualmente.
3. Verificar que aparece automáticamente un deployment nuevo.
4. Confirmar SHA exacto, checks, dominio actualizado y evidencia visible no sensible.
5. Revertir el canario con otro commit y verificar también su auto-deploy.

Solo tras estas dos transiciones se marca `automatic_updates_verified: true`.

### P9 - Operación posterior

Flujo estándar: rama -> PR -> Preview automático -> tests/revisión -> merge -> Production automático ->
smoke -> observación -> rollback si falla. Nunca editar producción a mano como rutina.

Recertificar P0-P8 cuando ocurra cualquiera:
- repo renombrado, transferido, archivado o cambiado;
- GitHub App suspendida, desinstalada o con permisos pendientes;
- cuenta/equipo/proyecto Vercel cambiado o duplicado;
- Production Branch, Root Directory, framework, runtime o ignored build modificados;
- dominio, Supabase project-ref, Auth, OAuth, pagos, email o webhooks modificados;
- incidente de secretos, migración o rollback.

---

## 5. Reparación guiada

| Síntoma | Diagnóstico antes de tocar | Reparación segura | Evidencia de cierre |
|---|---|---|---|
| Repo no aparece en Vercel | owner, org, GitHub App, acceso selected repos | `Configure GitHub App`; autorizar repo mínimo | repo importable y conectado |
| Push no despliega | Connected repo, rama, autor, ignored build, root | corregir configuración; push canario | deployment Git automático |
| Producción muestra código viejo | SHA, Production Branch, alias de dominio | desplegar SHA correcto por Git; reasignar alias si procede | `/api/version` = Git SHA |
| CLI apunta a proyecto distinto | `.vercel/project.json`, scope, project IDs | relink al existente; borrar metadata local solo tras identificar | IDs y dominio coinciden |
| Hay dos proyectos Vercel | dominios, repo, team, env, historial | elegir canónico; migrar config; desconectar el sobrante tras aprobación | un proyecto propietario |
| Repo renombrado/transferido | remote + Vercel Git + permisos de App | actualizar remote/permisos/conexión | push canario exitoso |
| Build no ve variables | nombre, scope, environment, deployment age | agregar al entorno correcto y redeploy | health `configured=true` |
| Supabase migró al lugar incorrecto | project-ref, migration history, datos afectados | detener; backup; plan de reversión/restauración aprobado | destinos e historiales correctos |
| Auth vuelve a localhost/preview | Site URL, redirects, templates | URL final exacta + redeploy + email real | login/reset en dominio final |
| Webhook no llega | URL, firma, proveedor, logs redactados | actualizar endpoint y replay seguro/idempotente | evento test + estado correcto |

Cada guía al usuario contiene: **por qué se necesita**, **ruta exacta**, **una sola acción**, **resultado que
debe ver** y **qué responder sin secretos**. No lanzar diez pasos sueltos ni pedirle que interprete jerga.

---

## 6. Certificado y veredicto

Usar `PLANTILLA-CERTIFICADO-PUBLICACION.md`. El certificado contiene nombres, URLs, IDs técnicos y SHAs,
pero cero claves, cookies, passwords, connection strings o payloads sensibles.

```text
APTO PARA PUBLICAR Y ACTUALIZAR:
  P0-P8 PASS
  automatic_updates_verified = true
  production_sha_match = true
  secrets_shared_in_chat = false
  production_secrets_in_preview = false
  supabase_target_verified = true
  callbacks_on_final_domain_verified = true

NO APTO:
  cualquier estado BLOCKED/NO VERIFICADO o evidencia inferida
```

No prometer seguridad absoluta ni "10/10" por checklist. El resultado defendible es: controles explícitos,
pruebas ejecutadas, evidencia trazable, riesgos residuales nombrados y procedimiento de recuperación.

