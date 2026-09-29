# PLANTILLA — Artefactos de Integridad de Lanzamiento

> Copiar las seis secciones aplicables a `docs/release/` con los nombres indicados. Sustituir cada
> ejemplo por evidencia del proyecto. Una fila vacía, `pendiente` o N/A sin justificación bloquea.

## `CLAIMS-LEDGER.md`

| Claim exacto | Superficie/URL | Capacidad real | Plan/límite | Evidencia/test | Estado |
|---|---|---|---|---|---|
| | | | | | |

Inventario revisado: ads · landing · onboarding · resultado · paywall · checkout · emails · app ·
FAQ · términos. Fecha: ___ · Git SHA: ___

## `PAYMENT-CERTIFICATION.md`

Proveedor/product/offer: ___ · Entorno: ___ · Git SHA: ___ · Fecha: ___

| Caso | Transaction/event IDs | Estado esperado/real | Acceso hasta | Ledger | Evidencia |
|---|---|---|---|---|---|
| Inicio trial mensual/anual | | | | | |
| Primer cobro | | | | | |
| Cancelación en trial | | | | | |
| Cancelación pagada | | | | | |
| Past due + recuperación/expiración | | | | | |
| Evento duplicado + APPROVED/COMPLETE | | | | | |
| Producto/oferta/moneda inválidos | | | | | |
| Fallo intermedio + retry | | | | | |
| Refund + chargeback | | | | | |

## `ECONOMICS-CERTIFICATION.md`

Fuentes de precios/tarifas + fecha: ___

| Plan/país/canal | Neto mensual | IA p50 | IA p95/heavy | Otros COGS | Margen | Pasa |
|---|---:|---:|---:|---:|---:|---|
| | | | | | | |

Incluye trial, retries, fallbacks, afiliado, impuestos, refunds y mensual efectivo del anual.

## `PRIVACY-DATA-MAP.md`

| Dato | Sujeto | Finalidad | Base/consentimiento | Storage/acceso | Retención | Export/borrado |
|---|---|---|---|---|---|---|
| | | | | | | |

Menores posibles: sí/no · age gate: ___ · representante/revisión jurídica: ___ · buckets: ___

## `RELEASE-MANIFEST.json`

```json
{
  "git_sha": "",
  "vercel_deployment_id": "",
  "production_url": "",
  "db_project_id": "",
  "db_migration": "",
  "built_at": "",
  "evidence_commit": ""
}
```

Verificación `/api/version` o panel admin: ___ · clean-room report: ___ · CI run: ___

## `PUBLICATION-CERTIFICATE.md`

Copiar y completar `PLANTILLA-CERTIFICADO-PUBLICACION.md`. Debe probar el mismo `git_sha` del manifest,
`Connected Git Repository`, aislamiento de ambientes, Supabase project-ref, dependencias de URL y P0-P8
de `62-PUBLICACION-SEGURA-Y-CONTINUA.md`, incluida la segunda publicación automática y su reversión.
Nunca incluir valores de secretos.
