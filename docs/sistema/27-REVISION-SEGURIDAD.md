# REVISIÓN DE SEGURIDAD — Auditoría Antes de Vender

> **Cuándo cargar este archivo:**
> - Antes del primer deploy a producción (obligatorio, junto con `09-SEGURIDAD.md`)
> - Antes de cada release que toque auth, pagos, datos de usuario o el BFF
> - Cuando la app va a manejar dinero o datos sensibles
>
> **Calibración:** esto es para MVPs de fundador solo, no para banca. Cubre lo que de verdad rompe apps reales y omite el overkill enterprise (auditoría formal línea por línea, HSMs, post-cuántico, hardening de K8s). Si la app crece a ese nivel, contratar una auditoría profesional.

## Objetivo
La mayoría de las brechas de apps indie no son ataques sofisticados — son **defaults inseguros, secretos filtrados, y dependencias podridas**. Este archivo es una rutina de auditoría repetible que el agente corre antes de vender, con comandos concretos, no buenas intenciones.

---

## PRINCIPIO: Secure by default / "pit of success"

La seguridad no puede depender de que cada desarrollador recuerde hacer lo correcto. El sistema debe hacer que **lo seguro sea el camino fácil** y lo inseguro sea difícil o ruidoso. El antipatrón opuesto es el "fail-open": cuando algo falla, el sistema se abre en vez de cerrarse.

```
✅ FAIL-SECURE (correcto): si falta la config, la app CRASHEA al arrancar.
   const SECRET = process.env.SECRET;  // undefined → revienta → te enteras en deploy

❌ FAIL-OPEN (crítico): si falta la config, la app sigue con un default inseguro.
   const SECRET = process.env.SECRET || 'dev-secret';  // ☠️ corre en prod con el secreto de juguete
```

---

## OWASP TOP 10:2025 — mapa de revisión

La referencia estándar de la industria, actualizada a 2025 (ojo a los renombres: A03 ahora es cadena de suministro, A10 es manejo de excepciones). Para cada categoría, qué revisar en una app del SO:

| # | Categoría (2025) | Qué revisar en tu app |
|---|---|---|
| A01 | Broken Access Control | RLS en toda tabla; el servidor autoriza con `(select auth.uid())`, nunca confía en IDs del cliente; sin IDOR (¿puedo leer `/api/doc/123` de otro usuario?) |
| A02 | Security Misconfiguration | Sin defaults inseguros; headers de seguridad + CSP; CORS con allowlist; DEBUG off en prod; buckets de Storage con políticas |
| A03 | **Software Supply Chain Failures** | `npm audit`; dependencias mantenidas y populares; lockfile commiteado; sin paquetes typo-squat |
| A04 | Cryptographic Failures | Sin datos sensibles en texto plano; HTTPS forzado; el provider hashea contraseñas (Argon2/bcrypt, nunca MD5/SHA1) |
| A05 | Injection | Queries parametrizadas (el cliente de Supabase ya lo hace); sanitizar input; cuidado con SQL crudo y con prompt-injection a la IA |
| A06 | Insecure Design | Rate limiting diseñado, no parchado; límites de plan verificados en servidor; threat model ligero hecho (abajo) |
| A07 | Identification & Auth Failures | Todo el archivo `26-AUTH-MODERNO.md`: rotación de tokens, rate limits, anti-enumeración, MFA |
| A08 | Software & Data Integrity | Verificar firmas de webhooks (hottok de Hotmart, firma de Stripe); no ejecutar código no confiable |
| A09 | Logging & Monitoring Failures | Sentry activo; logs SIN datos sensibles; alertas de costo y de error |
| A10 | **Mishandling Exceptional Conditions** | Fail-secure (no fail-open); errores no filtran stack traces al usuario; toda excepción tiene manejo |

---

## PASO 1 — Detección de defaults inseguros (fail-open)

Grep rápido sobre el código. Cada hit es sospechoso:

```bash
# Secretos con fallback inseguro (fail-open) — CRÍTICO
grep -rnE "process\.env\.[A-Z_]+\s*\|\|\s*['\"]" src/ app/ api/

# CORS abierto
grep -rnE "Access-Control-Allow-Origin.*\*|origin:\s*['\"]\*" .

# DEBUG / verbose en producción
grep -rniE "DEBUG\s*=\s*true|NODE_ENV.*development" .

# Criptografía débil
grep -rniE "\b(md5|sha1|des|rc4|ecb)\b" src/ app/
```

```
REGLA: un secreto con fallback (`env.X || 'default'`) = CRÍTICO. Cambiarlo a fail-secure
(que crashee si falta). "Es solo un default de desarrollo" NO es excusa — termina en producción.
```

---

## PASO 2 — Análisis estático con semgrep

Un escaneo de patrones de vulnerabilidad conocidos, en un comando:

```bash
# --metrics=off SIEMPRE (sin él, el modo auto manda telemetría a la nube)
semgrep --config auto --metrics=off
```

```
TRIAGE (no ahogarse en ruido):
- Filtrar por severidad MEDIUM/HIGH/CRITICAL.
- Quedarse con category=security y confidence/impact ∈ {MEDIUM, HIGH}.
- Lo demás (LOW, estilo) → backlog, no bloquea el release.
```

---

## PASO 3 — Auditoría de dependencias (cadena de suministro)

```bash
npm audit --omit=dev        # o pnpm audit / yarn audit
npm outdated                # dependencias muy atrasadas = riesgo
```

```
BANDERAS para revisar una dependencia antes de confiar en ella:
- Mantenedor único o anónimo, repo sin actividad reciente
- Muy poca popularidad para lo que hace (posible typo-squat)
- Hace FFI / deserialización / ejecuta binarios
- CVEs críticos pasados sin parchear, sin SECURITY.md
REGLA: el lockfile (package-lock.json / pnpm-lock.yaml) SIEMPRE commiteado.

SUPPLY CHAIN EN CI:
- `npm ci --ignore-scripts` en CI (los install-scripts de un paquete comprometido ejecutan código arbitrario).
- GitHub Actions pineadas por SHA completo (`uses: actions/checkout@<sha>`), nunca por tag mutable.
- CVE-2025-29927 (bypass del middleware de Next vía un header interno): exigir Next ≥ versión
  parcheada en el pin del 51 — y es la razón por la que TODA autorización se re-valida en el
  handler + RLS, nunca solo en el middleware (doctrina existente: 09 → "no es autorización,
  es cosmética" y el checklist ACCESO A01 de abajo).
```

---

## PASO 4 — Gestión de secretos

```
- .env en .gitignore (verificar con `git log --all -- .env` que nunca se commiteó).
- SCANNER DE SECRETOS: gitleaks (o GitHub Push Protection activado) en pre-commit/CI — el
  `git log -- .env` no atrapa un secreto pegado en cualquier otro archivo. Contexto: 39M de
  secretos filtrados en GitHub solo en 2024 (GitGuardian, informe 2025); las claves de OpenAI son
  la categoría de mayor crecimiento (+1.212% 2022→2024 — GitGuardian/Snyk); el tiempo
  descubrimiento→abuso se mide en MINUTOS.
- .env.example (o .env.schema) commiteado, con los NOMBRES de las variables y sin valores.
- Si un secreto se filtró alguna vez en git → ROTARLO (cambiar la clave), no solo borrar el commit.
- Disciplina del agente: NUNCA hacer `cat .env` ni `echo $SECRET` (expone el secreto en el
  transcript/logs). Para verificar que una variable existe, comprobar que NO está vacía sin imprimirla.
- Opcional (recomendado si manejas muchos secretos): Varlock con un `.env.schema` anotado
  (@sensitive, @type=string(startsWith=sk_)) que valida tipos y mantiene los valores enmascarados.
```

---

## PASO 5 — Seguridad de CI agéntico (si usas GitHub Actions con agentes/IA)

El SO mismo corre Claude Code/Codex; si tu pipeline ejecuta agentes, son una superficie de ataque:

```
- Input de un atacante (título de PR, comentario, issue) puede llegar al agente. Pasarlo por
  `env:` NO lo hace seguro — sigue siendo input no confiable.
- `pull_request_target` corre con secretos sobre código no confiable del PR → peligroso.
- PROHIBIR en CI: `--dangerously-skip-permissions`, `--yolo`, `Bash(*)` sin restricción,
  permisos de escritura amplios para el token del agente.
- El agente en CI solo debe tener los permisos mínimos para su tarea.
```

---

## THREAT MODEL LIGERO (4 preguntas, 10 minutos)

Antes de vender, responder por escrito (en `ESTADO.md` o un `SECURITY.md` del proyecto):

```
1. ¿Qué es lo más valioso que protege la app? (datos de usuario, dinero, contenido, reputación)
2. ¿Quién querría atacarla y cómo? (competidor, scraper, script kiddie quemando tu API de IA, abuso)
3. ¿Cuál es el peor caso si entran? (leak de datos, factura de IA, cuentas tomadas)
4. ¿Qué control concreto mitiga cada uno? (RLS, rate limit, firma de webhook, MFA, alertas de costo)
```

---

## LAS 5 CHECKLISTS DE REVISIÓN

```
INPUT
[ ] Todo input del usuario validado y limitado en longitud (archivo 09)
[ ] Queries parametrizadas (sin string-concat de SQL)
[ ] Inputs a la IA considerados para prompt-injection: el texto del usuario (o de un documento vía
    RAG) es DATOS, nunca instrucciones — separarlo del system prompt con delimitadores claros, y
    ninguna tool con efecto (enviar/borrar/cobrar/publicar) se dispara directo desde ese texto sin
    validación (zod) + confirmación humana en acciones de alto impacto (detalle y código en
    `30-INTEGRACION-IA.md` → "ANTI PROMPT-INJECTION EN TOOL-USE")

AUTH (detalle en 26)
[ ] Contraseñas con Argon2/bcrypt (provider), nunca MD5/SHA1
[ ] Tokens de sesión 128+ bits, en cookies httpOnly; rotación de refresh
[ ] Rate limiting por endpoint; anti-enumeración; MFA si aplica
[ ] Inventario de rutas/Actions/Functions: cero test/demo/debug/bypass/imperson/OTP autoverificado
[ ] Admin usa identidad verificada + autorización server-side; conocer un email nunca crea sesión

ACCESO (A01 — el más común)
[ ] Deny by default: si una política no existe, el acceso se niega
[ ] RLS en toda tabla con (select auth.uid()); servidor autoriza, no el cliente
[ ] Sin IDOR: probar acceder a recursos de otro usuario por ID y confirmar que falla
[ ] Límites de plan verificados en el SERVIDOR antes de cada acción (no solo ocultando botones)
[ ] Inventario de SECURITY DEFINER: search_path vacío, grants mínimos, auth.uid y owner validados
[ ] Estado de valor (XP/gemas/créditos/roles/entitlements): cliente sin INSERT/UPDATE/DELETE directo

DATOS (A04)
[ ] Sin secretos/PII en el frontend, en logs ni en Sentry
[ ] HTTPS forzado; datos sensibles cifrados en reposo donde aplique
[ ] Webhooks de pago verifican firma en TIEMPO CONSTANTE (timingSafeEqual), sobre el RAW body, con idempotencia (processed_events) y máquina de estados — código exacto y completo en `18-VENTA-HOTMART.md` → "SEGURIDAD DEL WEBHOOK DE HOTMART (implementación real)", NO improvisar una versión propia
[ ] Fetch de recursos externos provistos por el usuario validado contra SSRF (apps de visión) — ver 09
[ ] XSS prevenido por escape de OUTPUT (no escapando el input); uploads validados por magic bytes — ver 09
[ ] Buckets privados por defecto; fotos/voz/docs sensibles y de menores fallan sin signed/auth URL

ERRORES (A10)
[ ] Fail-secure: ante config faltante o fallo, la app se cierra, no se abre
[ ] Errores al usuario sin stack traces ni detalles internos
[ ] Toda promesa/excepción tiene manejo (sin catch vacíos que silencian fallos)
```

---

## CÓMO CORRER UNA REVISIÓN (orden)

```
1. Threat model ligero (4 preguntas)        → 10 min
2. Paso 1: grep de fail-open + cripto débil  → corregir críticos
3. Paso 2: semgrep --config auto --metrics=off → triage MEDIUM+
4. Paso 3: npm audit + revisión de deps      → parchear/reemplazar
5. Paso 4: secretos (gitignore, rotación)
6. Paso 5: CI agéntico (si aplica)
7. Inventariar rutas, RPC/SECURITY DEFINER, grants y buckets; probar llamadas directas hostiles
8. Recorrer las 5 checklists + el mapa OWASP + Gate 1/4/5 de 61
9. Documentar hallazgos y mitigaciones en SECURITY.md / ESTADO.md
```

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

- **`09-SEGURIDAD.md`**: define los controles técnicos (BFF, RLS, headers). Este archivo **audita** que estén bien puestos.
- **`26-AUTH-MODERNO.md`**: A07 del OWASP se cubre ahí.
- **`25-BASE-DE-DATOS.md`**: A01 (RLS) y A05 (queries parametrizadas) se implementan ahí.
- **`12-FLUJO-AGENTICO.md`**: el ritual de verificación aplica también a la seguridad — no declarar "seguro" sin haber corrido estos pasos.
