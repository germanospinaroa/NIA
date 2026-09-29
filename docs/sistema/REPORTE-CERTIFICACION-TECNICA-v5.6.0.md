# CERTIFICACIÓN TÉCNICA REPRODUCIBLE — SO v5.6.0

> ⚠️ NOTA (v5.9.0): donde dice 'cinco artefactos', v5.7+ los amplió a seis.

Fecha: 2026-07-21

## Objetivo

Comprobar que las mejoras v5.5 y v5.6 están presentes, coherentes, ejecutables y protegidas contra
regresiones conocidas. El comando reproducible es:

```bash
node scripts/test-integridad.mjs
```

## Metodología

1. **Baseline v5.5:** auditoría y release check de la carpeta; extracción y auditoría de su ZIP.
2. **Estado sano v5.6:** JSON, shell, referencias, fences, ruteo, prompts/comandos y paridad
   `CLAUDE.md`/`AGENTS.md`.
3. **Contratos semánticos:** auth, Hotmart, cancelación, claims, consentimiento, RPC, IA, economía,
   entitlement, checkout abandonado, release manifest y piloto.
4. **Mutation testing:** se crean copias temporales y se siembran fallos deliberados. El test pasa
   solo si `audit-so.sh` rechaza cada copia por la razón esperada.
5. **Hooks reales:** ejecución positiva y negativa de SessionStart, PostToolUse TypeScript,
   linter visual, Stop y PreCompact.
6. **Distribución:** listado, extracción y re-auditoría del ZIP que recibe el usuario.

## Mutaciones rechazadas

```
CLAUDE/AGENTS divergentes
JSON inválido
referencia a documento inexistente
fence Markdown sin cerrar
módulo numerado sin ruteo
comando obligatorio ausente
regla de conversión obsoleta
policy de gamificación con escritura directa
warnings ignorables por defecto
contrato crítico unknown_retryable eliminado
```

## Hooks verificados

- Un archivo no TypeScript no dispara falsos bloqueos.
- Un TypeScript roto devuelve exit 2 en PostToolUse.
- El Stop hook impide cerrar con TypeScript roto y evita loops cuando ya está activo.
- El linter visual bloquea hex directo, `transition-all` y `min-h-full` en una UI hostil.
- Una UI sin esas huellas pasa.
- SessionStart inyecta contexto y PreCompact exige persistir checkpoint.

## Resultado

```
69 verificaciones aprobadas
0 fallos finales
10 mutaciones peligrosas rechazadas
v5.5 carpeta + release + ZIP: OK como baseline
v5.6 carpeta + release + ZIP: OK
```

Durante la construcción del test apareció un falso negativo: el ZIP v5.5 distribuye contenido en
la raíz, mientras v5.6 usa una carpeta contenedora. El harness asumía solo la segunda forma. Se
corrigió para soportar ambas y la suite completa volvió a ejecutarse en verde.

## Qué certifica y qué no

Certifica que el SO contiene y enruta los controles, que sus guardianes detectan regresiones
representativas, que los hooks reaccionan como se espera y que la distribución conserva todo.

No puede garantizar que un modelo futuro obedezca cada instrucción ni certificar una app que aún no
existe. Cada app debe ejecutar `61-INTEGRIDAD-DE-LANZAMIENTO.md`, completar sus cinco artefactos y
probar infraestructura/pagos reales del mismo commit. v5.5 pasa su baseline histórico, pero v5.6 lo
reemplaza para cubrir los riesgos de la auditoría MateFlex.
