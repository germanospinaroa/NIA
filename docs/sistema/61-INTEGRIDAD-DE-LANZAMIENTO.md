# INTEGRIDAD DE LANZAMIENTO — La Verdad Ejecutable del Producto

> **Cuándo cargar:** antes de abrir tráfico, cobrar, declarar una app terminada, auditar una app
> existente o publicar una promesa nueva. Complementa `48-RIGOR-DE-ENTREGA.md`: 48 puntúa la
> calidad global; este archivo contiene los **bloqueantes binarios** que no admiten compensación.

## PRINCIPIO RECTOR

Una app no está lista porque compila, se ve bien o tiene checkout. Está lista cuando cada promesa,
permiso, cobro, recompensa y métrica tiene una fuente de verdad, una prueba reproducible y una
salida segura ante fallos.

```
NO MEDIDO = NO APTO
DESCRITO PERO NO IMPLEMENTADO = NO APTO
IMPLEMENTADO PERO NO PROBADO = NO APTO
PROBADO EN OTRO COMMIT/ENTORNO = NO APTO
```

Ningún puntaje alto en diseño o conversión compensa un bloqueante de dinero, acceso, privacidad,
seguridad o exactitud de una promesa.

## LOS 6 ARTEFACTOS OBLIGATORIOS

Antes de vender, el repositorio debe contener y el agente debe completar:

1. `CLAIMS-LEDGER.md`: promesa pública -> capacidad -> plan/límite -> evidencia -> responsable.
2. `PAYMENT-CERTIFICATION.md`: matriz real de trial, cobro, cancelación, fallos y reembolsos.
3. `RELEASE-MANIFEST.json`: commit, deploy, migraciones, variables requeridas y fecha de auditoría.
4. `ECONOMICS-CERTIFICATION.md`: margen por plan/cohorte/canal y escenario p95 de uso.
5. `PRIVACY-DATA-MAP.md`: datos, finalidad, base/consentimiento, retención, acceso y borrado.
6. `PUBLICATION-CERTIFICATE.md`: repo conectado, ambientes, Supabase target, dominio/callbacks, SHA y
   prueba de una segunda publicación automática. Usar `PLANTILLA-CERTIFICADO-PUBLICACION.md` y `62`.

Pueden vivir en `docs/release/`. No son plantillas decorativas: cada fila debe enlazar evidencia
real (test, captura, consulta, log o URL). Un campo `pendiente`, `N/A` sin justificación o una prueba
contra otro entorno bloquea el lanzamiento.

---

## GATE 1 — INVENTARIO DE SUPERFICIE Y AUTH

Enumerar TODAS las rutas públicas, Route Handlers, Server Actions, Edge Functions, RPC SQL,
webhooks, buckets y funciones `SECURITY DEFINER`. Para cada una registrar autenticación,
autorización, rate limit, entrada, salida y test negativo.

Bloqueantes absolutos:

- Rutas de prueba, demo, soporte, impersonación, `bypass`, `debug`, `entrar-prueba`, login por email
  autorizado o cualquier endpoint que genere y verifique su propio OTP en producción.
- Confiar en conocer un email para crear sesión. El control del email se prueba mediante magic link
  u OTP enviado al usuario; el servidor nunca se demuestra a sí mismo que el usuario lo recibió.
- Administradores autenticados por el mismo atajo que clientes. El rol admin requiere identidad
  normal verificada + autorización server-side; para alto impacto, MFA y audit log.
- Secretos, listas de emails privilegiados o flags de bypass como mecanismo de autenticación.

Pruebas obligatorias:

```
[ ] `rg` de route/api/functions por test|demo|debug|bypass|imperson|otp|admin|prueba revisado a mano
[ ] Usuario A no puede leer/escribir recursos de B (IDOR, UI + API directa)
[ ] Cliente normal no puede invocar funciones admin ni cambiar roles/entitlements
[ ] Sesión inválida/expirada no cae en fail-open
[ ] Recuperación y magic link tienen rate limit distribuido y anti-enumeración
```

---

## GATE 2 — PAGOS COMO LEDGER, NO COMO UN CAMPO EN `profiles`

El perfil puede reflejar acceso, pero la fuente financiera es un ledger inmutable de transacciones.

Cada evento de proveedor se acepta solo si pasa:

1. Autenticidad documentada por el proveedor.
2. Frescura/replay protection cuando el proveedor la soporta.
3. Catálogo allowlisted: `provider`, `product_id`, `offer_id/plan_id`, moneda e importe esperado.
4. Identidad económica: `provider + transaction_id + economic_kind` es única.
5. Máquina de estados legal y monotónica.
6. Aplicación atómica o workflow recuperable con `pending/failed/completed`, intentos y último error.

`event_id` deduplica entregas técnicas. **No basta para ingresos:** `PURCHASE_APPROVED` y
`PURCHASE_COMPLETE` pueden ser eventos distintos de la misma transacción. El ledger económico evita
contar dos veces el mismo dinero.

Modelo mínimo de acceso:

```
subscription_status: trialing | active | past_due | cancelled | expired | refunded | chargeback
trial_ends_at
current_period_end
access_until
cancel_at_period_end
grace_ends_at
```

- Cancelación voluntaria: detiene renovación, conserva acceso hasta `access_until`.
- Reembolso/contracargo: sigue la política verificada; no se confunde con cancelación.
- `past_due`: gracia explícita y recuperación; no borra datos.
- Un evento viejo nunca reactiva un refund/chargeback ni acorta un periodo pagado válido.
- Crear acceso, reconciliar cuenta, registrar ledger y programar email debe ser atómico o
  reintentable. Nunca marcar `completed` antes de que el cliente tenga acceso recuperable.

### Matriz de certificación real

Probar en el entorno y commit que se va a publicar:

```
[ ] Trial mensual: día 0 -> acceso -> aviso pre-cobro -> primer cobro
[ ] Trial anual: día 0 -> acceso -> aviso pre-cobro -> primer cobro
[ ] Cancelación durante trial -> no cobro futuro -> estado y acceso correctos
[ ] Cancelación mensual/anual pagada -> acceso hasta fin de periodo
[ ] Pago rechazado -> past_due -> gracia -> recuperación y agotamiento de reintentos
[ ] Reenvío del mismo event_id -> sin doble efecto
[ ] APPROVED + COMPLETE de una transacción -> un solo ingreso
[ ] Producto/oferta/importe/moneda ajenos -> rechazados y alertados
[ ] Fallo después del webhook -> retry completa acceso, ledger y email
[ ] Reembolso y contracargo -> acceso/ledger correctos y auditables
[ ] Compra con email distinto -> reconciliación visible, sin cuenta huérfana
[ ] Reconciliación de entitlements programada (job semanal que compara suscripciones activas del
    proveedor contra los estados internos y repara el drift — 18)
```

Una simulación local no certifica el panel real. Si una prueba cuesta dinero, se pide autorización;
si no se ejecuta, el resultado sigue siendo **NO VERIFICADO / NO APTO**.

---

## GATE 3 — CLAIM-TO-CAPABILITY LEDGER

Inventariar todo claim en ads, landing, onboarding, paywall, checkout, emails, app, FAQ y legal.

| Claim exacto | Superficie | Capacidad/ruta | Plan y límite | Prueba | Estado |
|---|---|---|---|---|---|
| "3 ejercicios diarios gratis" | landing/paywall | entitlement `free_daily=3` | free | E2E límite 3/4 | real |

Reglas:

- Si la feature no existe, se elimina el claim. "Próximamente" no cuenta como valor del plan.
- "Ilimitado" está prohibido salvo que sea materialmente cierto, tenga fair-use visible y pase el
  estrés económico p95/heavy user. Preferir una cuota expresada en resultados útiles.
- "Cancela en un toque" exige cancelación real en ese flujo; un enlace externo con varios pasos no
  cumple. Describir la realidad sin disfrazarla.
- "Te avisamos" exige job, plantilla, logs, retry y test de entrega; un texto no es automatización.
- "Liga activa", "foto incluida", recompensas, progreso y planes solo se anuncian si persisten y
  están disponibles en producción para ese plan.
- "100%", "completo" o "listo" describe solo lo que realmente terminó. Distinguir
  `onboarding completado`, `vista previa generada`, `contenido desbloqueado` y `compra activa`.
- Un CTA declara su consecuencia: "Ver planes" abre venta; "Ver mi plan" abre contenido propio.
- Claims de salud, dinero, educación o resultados requieren evidencia y revisión profesional
  apropiada; el copy agresivo nunca autoriza una promesa falsa o no sustentada.

El ledger se revisa automáticamente por búsqueda de copy y manualmente por superficies renderizadas.
Cada cambio de pricing, entitlement o copy invalida su certificación hasta actualizarlo.

---

## GATE 4 — CONSENTIMIENTO, MENORES Y ARCHIVOS

- El consentimiento legal se registra **después** de vincularlo a una identidad verificada o a una
  ceremonia explícita que luego se reconcilia sin ambigüedad.
- Nunca persistir ni premarcar consentimiento legal mediante `localStorage`, cookie, defaults o el
  estado de otra persona. En dispositivo compartido, cada identidad decide desde cero.
- Ledger versionado: sujeto, versión del texto/política, finalidades, timestamp, locale, origen,
  retiro y, cuando aplique, representante/relación/evidencia.
- Consentimiento no agrupa finalidades opcionales: servicio, marketing y datos sensibles se separan.
- Si puede haber menores: age gate, regla jurisdiccional, participación/autorización del representante
  cuando corresponda, minimización reforzada y revisión jurídica profesional antes de vender.
- Fotos, voz, documentos, avatares y datos sensibles: buckets privados por defecto, RLS por carpeta
  y URLs firmadas cortas. Prohibido bucket público por comodidad.
- Exportación y eliminación se prueban E2E, incluyendo objetos de Storage, logs vinculables y
  proveedores externos según la política aplicable.

El SO orienta implementación; no sustituye asesoría legal local. Las obligaciones temporales se
verifican con fuentes oficiales actuales antes de publicar.

---

## GATE 5 — RPC, RECOMPENSAS Y ESTADO CONFIABLE

Para XP, gemas, créditos, rachas, niveles, cuotas, roles y entitlements:

- El cliente puede **leer** su estado, pero no insertar/actualizar/borrar directamente valores
  derivados o de valor. RLS propia no significa permiso de escritura propia.
- La RPC recibe `action_id`/identificador de recurso e idempotency key; nunca recibe `xp`, `gems`,
  nivel, precio, límite o recompensa como autoridad.
- El servidor verifica que la acción ocurrió, no fue premiada antes y corresponde al usuario.
- Recompensas y límites salen de constantes/tablas server-owned, dentro de una transacción con lock.
- `SECURITY DEFINER SET search_path = ''`, nombres cualificados, `auth.uid()` validado, grants mínimos
  y `REVOKE EXECUTE FROM public, anon` cuando no corresponda.
- Inventariar grants de todas las funciones y probar llamadas directas desde `anon` y `authenticated`.

Patrón RLS:

```
SELECT propia: permitido.
INSERT/UPDATE/DELETE desde cliente sobre estado derivado: denegado.
Mutación: solo RPC estrecha que calcula el resultado en servidor.
```

---

## GATE 6 — IA CORRECTA, DIVERSA Y RENTABLE

### Exactitud por dominio

El schema valida forma, no verdad. Cada app compila evals según el riesgo:

- Dominio determinista (matemáticas, cálculo, formatos): oracle programático, equivalencia,
  propiedades/metamorphic tests, bordes, signos, fracciones, unidades y errores comunes.
- Dominio sensible (salud, legal, finanzas): fuentes autorizadas actuales, límites claros, revisión
  experta y escalada humana. Un LLM-judge solo no certifica seguridad.
- Dominio creativo: rúbrica humana, diversidad, utilidad, voz de marca y ausencia de repetición.
- Matriz de cobertura: cada tema/nivel/caso prometido tiene fixtures y umbral. Cuatro temas no pueden
  sostener un claim de currículo completo sin declararlo.

### Consumo y caché

- Rate limit distribuido/atómico en serverless. Un `Map`/memoria local no es control de producción.
- Uso anónimo caro: sesión first-party firmada, cuota por sesión/IP, protección anti-bot escalonada,
  límite global y ninguna credencial directa al proveedor.
- Reservar **antes** de llamar el costo/tokens máximos del intento + retries/fallbacks. Liquidar el
  real después. Todos los intentos comparten trace, idempotency key y presupuesto; no reservan a ciegas.
- Caché global solo para contenido genérico, no privado y determinista. Personalizado incluye
  tenant/usuario/contexto/versión. Educación necesita diversidad controlada por seed/pool y evita
  entregar indefinidamente el mismo ejercicio global.

### Economía

Certificar por plan, país/moneda, canal y cohorte:

```
precio neto de impuestos/tarifas/afiliado
- IA (mediana, p95 y heavy user; trial + retries + fallback + evals)
- infraestructura variable
- email/storage/soporte variable
= margen de contribución
```

Usar precios actuales del proveedor con URL y fecha. El anual usa su ingreso mensual efectivo, no
el precio mensual de lista. Si p95 o el uso permitido produce margen negativo, cambia límites,
modelo, caché, precio o promesa antes de adquirir tráfico.

---

## GATE 7 — DINERO Y MONEDAS SIN FICCIÓN

- Guardar dinero en enteros de unidad menor: `amount_minor`, `currency` ISO 4217.
- Conservar monto bruto original, descuentos, comisión real, afiliado, impuestos, reembolso,
  liquidación neta y moneda de liquidación cuando el proveedor los entregue.
- Nunca sumar COP + USD ni rotular una moneda como otra. Reportar por moneda o convertir con
  `fx_rate`, fuente y timestamp explícitos; separar realizado de estimado.
- Una comisión plana puede ser `estimación`, nunca `ganancia real`.
- Conciliar ledger interno contra extracto/liquidación del proveedor y mostrar diferencias.
- MRR devengado, cash cobrado y plan anual se presentan por separado; no inflar MRR con todo el
  cobro anual ni confundir caja con ingreso mensual.

---

## GATE 8 — UX HONESTA Y ESTADOS DE ENTITLEMENT

- El primer tap en X/"Ahora no" del paywall cierra o vuelve. No abre otra pantalla de presión.
  La retención de cancelación aplica al suscriptor que cancela, no a quien descarta un paywall.
- Precio, periodo, renovación, fecha/monto del primer cobro y salida son legibles antes del CTA.
- Texto legal/comercial crítico: mínimo 14px móvil y contraste AA; no esconder obligaciones en 12px.
- Resolver acceso en cuatro estados: `entitled`, `not_entitled`, `auth_required`,
  `unknown_retryable`. Timeout/red/5xx nunca se traduce a "no compraste".
- Labels persistentes, foco visible, `aria-live`/`role=status`/`role=alert` y equivalentes de
  celebración se prueban en estados dinámicos.
- Ejecutar revisión visual y E2E en landing, onboarding, resultado, paywall, login, app vacía,
  app poblada, error, offline y recuperación.

---

## GATE 9 — REPOSITORIO RECONSTRUIBLE Y RELEASE TRAZABLE

CI obligatorio, con cero errores y política explícita de warnings:

```
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npx playwright test
npm audit --omit=dev --audit-level=high
evals del dominio
Lighthouse/size budget
```

- Warnings no se ignoran por defecto: se corrigen o se documentan con dueño, riesgo y vencimiento.
- Cero vulnerabilidades critical/high de runtime. Hallazgos dev/moderate se revisan y registran;
  no se ocultan para que el gate pase.
- `.env.example` completo, README propio, scripts reproducibles, seed/fixtures y todas las
  migraciones versionadas.
- Prueba clean-room: desde clon limpio + proyecto vacío se instala, migra, arranca y ejecutan tests
  usando solo README y secretos externos. Si falta una tabla manual, el repo no es reproducible.
- SEO público: metadata/OG/Twitter/canonical, `robots.txt`, `sitemap.xml` y códigos 200 verificados.
- Headers de seguridad verificados en la URL real: CSP, frame protection, nosniff, referrer y
  permissions policy según el producto.
- Monitoreo, alertas, soporte, backups, restore cronometrado y runbook probados.
- GitHub `owner/repo` coincide con `origin` y con Vercel `Connected Git Repository`; Production Branch,
  Root Directory e Ignored Build Step están comprobados. `vercel link` no demuestra esta integración.
- Preview y Production nacen del flujo Git normal y usan el SHA esperado. Un segundo commit canario y
  su reversión se auto-despliegan sin `vercel --prod`; evidencia en `PUBLICATION-CERTIFICATE.md`.
- Supabase project-ref, migration history y `db push --dry-run` se verifican antes de aplicar. Nunca
  `db reset --linked`/seed sobre Production. Auth/callbacks/webhooks se prueban en el dominio final.
- El agente no pide valores secretos por chat. Production/Preview/Development tienen credenciales y datos
  separados; cualquier exposición activa rotación, revisión de historial/logs y redeploy.

`RELEASE-MANIFEST.json` mínimo:

```json
{
  "git_sha": "...",
  "vercel_deployment_id": "...",
  "production_url": "...",
  "db_migration": "...",
  "built_at": "ISO-8601",
  "evidence_commit": "..."
}
```

Exponer una versión no sensible (`/api/version` o footer admin) y comprobar que producción,
evidencia y auditoría usan el mismo SHA. Si los conectores no muestran el proyecto correcto, esa
capa se marca **NO VERIFICADA**, jamás se infiere desde un ZIP.

---

## GATE 10 — ANALÍTICA, OPERACIÓN Y PILOTO

Antes de tráfico abierto:

- Funnel real: landing expuesta, CTA, onboarding por paso, paywall expuesto, selección, checkout,
  trial server-side, aha, primer cobro, cancelación, refund y source/UTM.
- `checkout_abandonado` se deriva con ventana definida de un `checkout_iniciado` sin trial/cobro;
  no se dispara al cerrar una pestaña de forma ingenua.
- Píxel/CAPI se valida con eventos de prueba y deduplicación; el ledger server-side manda para dinero.
- D1-D7, pre-cobro, onboarding, dunning, win-back y soporte tienen jobs/logs/retries; no basta copy.
- Exportación/borrado y contacto de soporte funcionan desde la app.
- Piloto cerrado con 5-10 compradores del ICP: completar flujo sin ayuda, pagar/trial real,
  entrevista posterior y registrar objeciones, activación, soporte y refund. No inventar demanda.

El piloto no garantiza ventas diarias. Sí evita escalar tráfico sobre un sistema que cobra mal,
promete lo que no entrega o no permite saber dónde se pierde la gente.

---

## VEREDICTO BINARIO

```
APTO:
  cero bloqueantes en Gates 1-10
  seis artefactos completos
  commit/evidencia/producción coinciden
  CI y pruebas reales en verde

NO APTO:
  cualquier bloqueante, evidencia ausente o infraestructura privada no verificada
```

El agente corrige lo que pueda sin tocar dinero o datos reales. Lo que requiera una compra,
credencial, decisión legal o acción de cuenta se entrega como paso exacto para el dueño y mantiene
el estado NO APTO hasta verificarse.
