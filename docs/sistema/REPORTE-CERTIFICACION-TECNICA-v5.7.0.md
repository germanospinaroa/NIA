# CERTIFICACION TECNICA REPRODUCIBLE — SO v5.7.0

Fecha: 2026-07-22

## Objetivo

Comprobar que la publicación no termina en un primer deploy accidental: GitHub, Vercel y Supabase
deben conservar identidad, ambientes y trazabilidad, aceptar actualizaciones automáticas posteriores y
evitar que el agente solicite o reproduzca secretos del dueño.

Comando reproducible:

```bash
node scripts/test-integridad.mjs
```

## Metodología

1. **Baseline v5.6:** auditoría/release de la carpeta y extracción/auditoría de su ZIP.
2. **Estado sano v5.7:** JSON, shell, referencias, fences, ruteo, comandos y paridad CLAUDE/AGENTS.
3. **Contratos de publicación:** repo Vercel conectado, P0-P8, Supabase dry-run/target, certificado,
   flags de seguridad, SHA y segunda publicación automática con reversión.
4. **Barrido de prompts:** detección de frases que soliciten valores de claves, tokens, HOTTOK,
   passwords, cookies, secrets o connection strings por chat.
5. **Mutation testing:** copias temporales reciben regresiones deliberadas; la prueba solo pasa cuando
   `audit-so.sh` rechaza cada una por la causa esperada.
6. **Hooks reales:** ejecución positiva/negativa de SessionStart, PostToolUse TypeScript, linter visual,
   Stop y PreCompact.
7. **Distribución:** release check, listado del ZIP, ausencia de `__MACOSX`, extracción y reauditoría.

## Controles nuevos

- `62-PUBLICACION-SEGURA-Y-CONTINUA.md` distingue remote Git, repo GitHub, `vercel link`, integración
  Git persistente y deployment.
- `PUBLICATION-CERTIFICATE.md` prueba owner/repo, scope/project, rama/root, project-ref, ambientes,
  dependencias de URL, SHAs, rollback y actualización automática.
- Preview y Production deben originarse en Git. `vercel --prod` no puede ocultar integración rota.
- Un segundo commit canario y su reversión deben auto-desplegarse antes de cerrar.
- Supabase exige destino comprobado, migration history y `db push --dry-run`; reset/seed remoto en
  Production queda bloqueado.
- El agente pide solo nombre/estado de variables. Los valores se introducen directamente en el proveedor.
- Cambio de dominio recertifica Auth, OAuth, Resend, pagos, webhooks, CORS/CSP/cookies y canonical.

## Mutaciones rechazadas

```text
CLAUDE/AGENTS divergentes
JSON inválido
referencia inexistente
fence Markdown sin cerrar
módulo sin ruteo
comando obligatorio ausente
regla de conversión obsoleta
policy de gamificación insegura
warnings ignorables
contrato unknown_retryable eliminado
prompt que pide API key/HOTTOK por chat
Connected Git Repository eliminado
prueba de segunda publicación eliminada
PUBLICATION-CERTIFICATE eliminado
Supabase db push --dry-run eliminado
```

## Resultado

```text
100 verificaciones aprobadas
0 fallos finales
15 mutaciones peligrosas rechazadas
v5.6 carpeta + release + ZIP: OK como baseline
v5.7 carpeta + release + ZIP extraído: OK
```

## Qué certifica y qué no

Certifica que el SO contiene, enruta y protege mecánicamente los contratos de publicación segura, y
que el paquete distribuido conserva esos controles. Reduce de forma directa el riesgo de una app que
solo pudo publicarse una vez, de migraciones al Supabase equivocado y de secretos pedidos por chat.

No puede garantizar que un proveedor externo nunca falle ni que un modelo futuro obedezca sin ejecutar
los gates. Cada app debe completar P0-P8 contra sus cuentas reales, generar sus seis artefactos y conservar
evidencia del mismo commit. Sin acceso observable a un servicio, el estado correcto es `NO VERIFICADO`.
