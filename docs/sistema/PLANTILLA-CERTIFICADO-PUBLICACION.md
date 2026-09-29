# CERTIFICADO DE PUBLICACION — [APP]

> Evidencia operativa sin secretos. Estado permitido: `PASS`, `BLOCKED`, `NOT_APPLICABLE`.

## Identidad

| Campo | Valor no sensible | Estado | Evidencia |
|---|---|---|---|
| Local root | | | |
| GitHub owner/repo | | | |
| Git remote origin | | | |
| Default branch | | | |
| Vercel scope/project | | | |
| Vercel connected repository | | | |
| Vercel production branch | | | |
| Vercel root directory | | | |
| Supabase Production project-ref | | | |
| Supabase Preview/Dev project-ref | | | |
| Production domain | | | |

## Cadena de publicación

| Gate | Estado | Evidencia |
|---|---|---|
| P0 inventario coincide | | |
| P1 preflight/GitHub | | |
| P2 GitHub -> Vercel persistente | | |
| P3 Supabase target + dry-run + history | | |
| P4 variables aisladas por ambiente | | |
| P5 Preview automático desde Git | | |
| P6 dominio/Auth/callbacks | | |
| P7 Production automático + SHA | | |
| P8 segunda publicación + reversión automáticas | | |

## Evidencia de commits

```text
production_git_sha:
vercel_git_sha:
api_version_sha:
production_deployment_id:
preview_canary_sha:
production_canary_sha:
revert_canary_sha:
automatic_updates_verified: false
production_sha_match: false
```

## Variables por ambiente

No escribir valores. Registrar solo nombre, clasificación y presencia verificada.

| Nombre | Pública/secreta | Development | Preview | Production | Redeploy verificado |
|---|---|---:|---:|---:|---:|
| | | | | | |

```text
secrets_shared_in_chat: false
production_secrets_in_preview: false
secret_scan_local: PASS/BLOCKED
secret_scan_ci_or_provider: PASS/BLOCKED/NOT_APPLICABLE
rotation_required: false
```

## Dependencias de URL

| Sistema | Configuración | URL/patrón no sensible | Prueba |
|---|---|---|---|
| Vercel | dominio/SSL/canonical | | |
| App | site/base URL | | |
| Supabase Auth | Site URL | | |
| Supabase Auth | redirect allowlist | | |
| OAuth | callback/origin | | |
| Resend | dominio/enlaces | | |
| Pagos | return/cancel URL | | |
| Webhooks | endpoint | | |
| Analytics | dominio/origen | | |

## Supabase

```text
supabase_target_verified: false
migration_list_match: false
db_push_dry_run_reviewed: false
production_remote_reset_used: false
production_seed_used: false
rls_idor_test: PASS/BLOCKED
advisors: PASS/BLOCKED
```

## Pruebas en URL final

| Flujo | Estado | Evidencia |
|---|---|---|
| Landing/onboarding/paywall | | |
| Registro/login/logout/reset | | |
| Acción core | | |
| Pago/webhook/entitlement | | |
| Email transaccional | | |
| Analytics/backoffice | | |
| Error/rollback | | |

## Rollback y operación

```text
last_known_good_deployment:
code_rollback_tested: false
db_expand_contract_compatible: false
owner_runbook_location:
recertification_triggers_documented: false
```

## Veredicto

```text
VEREDICTO: APTO / NO APTO
Bloqueantes:
Riesgos residuales:
Responsable:
Fecha UTC:
```

