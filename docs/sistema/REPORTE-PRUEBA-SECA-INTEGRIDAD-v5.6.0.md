# REPORTE DE PRUEBA SECA — Integridad v5.6.0

Fecha: 2026-07-21

## Alcance

Se cruzó cada hallazgo de la auditoría MateFlex contra documentación canónica, prompts, comandos,
ruteo y auditor automático. Después se simularon tres apps de nichos distintos. Esta prueba certifica
que el SO **ordena detectar, implementar y verificar** los controles; no certifica una app futura,
que deberá producir su propia evidencia mediante 61.

## Matriz MateFlex

| Hallazgo | Control v5.6 | Ejecución/gate | Estado |
|---|---|---|---|
| Ruta por email/OTP autoverificado | 26 + 61 Gate 1 | inventario + test negativo | Cubierto |
| Admin mezclado con cliente | 26/27/61 | rol server-side + MFA/audit | Cubierto |
| Webhook marcado antes de acceso | 18 + 61 Gate 2 | workflow recuperable + retry | Cubierto |
| Producto/oferta/transacción no validados | 18/61 | allowlist comercial | Cubierto |
| APPROVED/COMPLETE duplica ingreso | 18/61 | ledger económico único | Cubierto |
| Cancelación corta periodo pagado | 18/61 | access_until/current_period_end | Cubierto |
| Trial no certificado | 18/61 | PAYMENT-CERTIFICATION | Cubierto |
| Consentimiento antes de controlar email | 26/47/61 | magic link + ledger | Cubierto |
| Consentimiento premarcado por localStorage | 47/61 | prohibición + test compartido | Cubierto |
| Menores sin tratamiento reforzado | 47/61 | age gate + revisión jurídica | Cubierto |
| Avatares públicos | 09/27/47/61 | bucket privado + URL firmada | Cubierto |
| RPC fabrica XP/gemas | 24/27/61 | SELECT propio + RPC action_id | Cubierto |
| Promesas sin feature/plan real | 61 Gate 3 | CLAIMS-LEDGER | Cubierto |
| "Ilimitado" con margen negativo | 02/30/40/61 | p95/heavy + fair-use visible | Cubierto |
| Recompensas onboarding no persisten | 61 Gate 3/5 | claim + E2E + ledger reward | Cubierto |
| Schema IA valida forma, no matemática | 31/61 | oracle + equivalencia/metamorphic | Cubierto |
| Cobertura temática insuficiente | 31/61 | claim->fixtures->umbral | Cubierto |
| Caché global repite ejercicios | 30/61 | scope + seed/pool diversidad | Cubierto |
| IA pública anónima sin protección | 30/61 | sesión firmada/cuota/anti-bot | Cubierto |
| Rate limit en memoria serverless | 09/30/61 | Postgres/Upstash atómico | Cubierto |
| Retries exceden presupuesto | 30/61 | reserva previa compartida | Cubierto |
| Cuotas no atómicas | 25/30/48/61 | RPC/UPDATE condicional | Cubierto |
| Economía de plan inviable | 40/61 | certificación por plan/cohorte/canal | Cubierto |
| Paywall CTA/precio confuso | 50/60/61 | jerarquía + prueba visual | Cubierto |
| X abre otra presión | 50/61 | primer tap cierra/vuelve | Cubierto |
| Legal pequeño/bajo contraste | 50/61 | >=14px móvil + AA | Cubierto |
| 100%/plan completo engañoso | 42/50/61 | estados semánticos separados | Cubierto |
| CTA oculta que abre venta | 42/50/61 | verbo+consecuencia | Cubierto |
| Login sin label | 42/50 | label persistente | Cubierto |
| Error de red = no compraste | 06/42/61 | entitlement de 4 estados | Cubierto |
| Dinámica inaccesible | 15/50/61 | aria-live/status/alert + E2E | Cubierto |
| Lint/tests/CI ausentes | 06/08/48/61 | pipeline obligatorio | Cubierto |
| .env/README genérico | 08/51/61 | clean-room | Cubierto |
| Vulnerabilidades npm | 27/61 | policy runtime/dev | Cubierto |
| LCP/SEO/headers ausentes | 09/38/45/61 | URL real + CI | Cubierto |
| Monitoreo/backups/runbook ausentes | 25/31/48/61 | pruebas operativas | Cubierto |
| Migraciones incompletas | 08/25/61 | DB vacía reconstruible | Cubierto |
| Commit auditado != producción | 08/61 | RELEASE-MANIFEST + /api/version | Cubierto |
| Backoffice mezcla COP/USD | 21/61 | amount_minor/currency/FX | Cubierto |
| Comisión plana llamada ganancia real | 21/40/61 | conciliada vs estimación | Cubierto |
| Funnel/UTM/trial/cobro/cancel sin eventos | 36/60/61 | contrato cliente+servidor | Cubierto |
| Abandono checkout ausente | 36/61 | evento derivado por ventana | Cubierto |
| D1-D7/pre-cobro/win-back/soporte | 58/59/60/61 | jobs/logs/retries | Cubierto |
| Exportación/borrado ausentes | 47/59/61 | E2E incluido Storage | Cubierto |
| Sin evidencia de demanda/piloto | 35/44/61 | 5-10 compradores ICP | Cubierto |

## Simulación multinicho

### A. App educativa para adolescentes

Ruteo esperado: 31 (oracles de matemáticas), 24 (recompensas), 47 (menores), 18 (suscripción), 61.
El SO bloquea: bucket público, consentimiento heredado, RPC con premios cliente, currículo prometido
sin fixtures, uso ilimitado no rentable y trial sin matriz real. Resultado: **gate adecuado**.

### B. App de salud/fitness para adultos

Ruteo esperado: 47 (dato sensible/disclaimer/revisión), 31 (evals sensibles + experto), 30 (datos a
proveedor), 40 (costo por modalidad), 61. El SO bloquea: diagnóstico/promesa médica no sustentada,
fotos públicas, consentimiento agrupado, salida sensible certificada solo por LLM-judge y claims de
resultado sin evidencia. Resultado: **generaliza fuera de educación**.

### C. Copiloto B2B de productividad

Ruteo esperado: 25 (org/memberships), 26/27 (admin/impersonación), 30/31 (tool-use/costos), 40 y 61.
El SO bloquea: IDOR entre tenants, soporte con bypass silencioso, tools con efecto sin confirmación,
caché global que fuga contexto, límites no atómicos, repo no reconstruible y deploy sin SHA.
Resultado: **generaliza fuera de B2C/menores**.

## Verificaciones ejecutadas

```
bash scripts/audit-so.sh                         OK
bash scripts/release.sh <prompts sincronizados> OK
CLAUDE.md == AGENTS.md                           OK
Referencias/fences/ruteo/comandos                OK
Regresiones críticas automatizadas               OK
```

## Veredicto

**APTO PARA DISTRIBUIR COMO SO v5.6.0.** Los hallazgos de MateFlex quedaron convertidos en reglas
canónicas, prompts ejecutores, gates binarios y checks estructurales. Esto reduce fuertemente la
probabilidad de repetición, pero no permite prometer perfección automática: cada app sigue siendo
NO APTA hasta completar sus cinco artefactos con evidencia del mismo entorno y commit desplegado.
