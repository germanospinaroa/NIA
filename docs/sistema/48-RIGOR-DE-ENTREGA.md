# RIGOR DE ENTREGA — La App Casi Perfecta Desde la v1 (que el usuario corrija lo MÍNIMO)

> **Cuándo cargar este archivo:**
> - Al cerrar CADA feature importante, y **OBLIGATORIO antes de declarar la app "lista para el usuario / para vender"**.
> - Junto con `06-TESTING.md`, `27-REVISION-SEGURIDAD.md`, `32-DEL-MVP-AL-PRODUCTO.md`, `21-BACKOFFICE.md`, `30-INTEGRACION-IA.md`.
>
> **Por qué existe:** El SO construye bien, pero el dueño es **NO técnico** — cada bug, flujo a medias o detalle omitido que llega a él es una corrección que NO debería tener que pedir. Las rondas de mejora del SO atacaron el QUÉ construir (ideación, diseño, monetización); este archivo ataca el **estándar de ENTREGA**: la diferencia entre "compila y se ve bien" y "está de verdad lista". La regla rectora: **antes de entregar, el agente actúa como tres personas a la vez — un QA despiadado, un fundador preocupado y un operador servicial.**

---

## EL PRINCIPIO: "compila" y "se ve bien" NO es "está lista"

El agente tiende a declarar "listo" cuando `tsc + build + render` pasan. Pero el usuario no toca el código ni el build — toca la **app funcionando**. Lo que lo hace volver a pedir correcciones casi siempre es una de estas: un botón que no hace nada, un estado vacío/error sin diseñar, un flujo que se rompe con un input raro, un pago que no da acceso, un output de IA mediocre, o "¿y ahora cómo hago X?". Esta capa cierra esas seis fugas **antes** de que el usuario las vea.

---

## 1. AUTO-QA END-TO-END — maneja la app como USUARIO, no solo la compiles

Compilar y mirar UNA pantalla renderizada (Regla 7) es necesario pero NO suficiente. Antes de "listo", el agente **recorre la app como un usuario real** con el preview/navegador disponible y verifica de verdad:

```
RECORRER CADA FLUJO COMPLETO (no solo la pantalla aislada):
  - Primera victoria (el momento aha) de punta a punta.
  - La acción frecuente (la que el usuario hará a diario).
  - Llegar al LÍMITE del plan free → ¿aparece el paywall con valor (no un error)?
  - El camino de pago/upgrade (aunque sea mock al inicio).
  - Recuperación de error (qué hace el usuario cuando algo falla).

TOCAR CADA ELEMENTO INTERACTIVO: si se ve tappable, DEBE hacer algo (regla 11 de CLAUDE).
  Aquí no se asume — se TOCA y se confirma. Cero botones decorativos.

VERIFICAR LOS 6 ESTADOS de cada pantalla: vacío · cargando · éxito · error · deshabilitado · offline.

CASOS BORDE OBLIGATORIOS por flujo:
  input vacío · input larguísimo/raro/emoji · doble-tap · sin conexión · sesión expirada ·
  plan al límite · IA que falla o tarda 10s · usuario nuevo con CERO datos (primer arranque).
```

> **Regla dura:** el reporte de cierre lista "lo que PROBÉ tocando", no "debería funcionar". Si no se manejó la app, no está QA-da. Usa el MCP de preview/navegador siempre que exista; si no hay ninguno, dilo y pide al usuario una prueba guiada (sin trasladarle tareas técnicas, ver CLAUDE.md Regla de ejecución 8).

### El primer arranque (lo que más se olvida)
La app que el dueño y su primer cliente abren está **VACÍA**. Una app que se ve genial con datos demo puede ser confusa o rota vacía. Verificar el primer arranque con CERO datos: ¿los estados vacíos guían y activan (CTA + ejemplo)? ¿hay datos semilla/ejemplo si ayudan? El usuario nunca debe ver una pantalla muerta el primer día.

---

## 2. PRE-MORTEM — imagina el fracaso ANTES de entregar (técnica de Gary Klein)

Antes de declarar la app lista, el agente hace un **pre-mortem** explícito:

> *"Estamos 1 semana en el futuro. La app fracasó, avergonzó al dueño o le costó dinero. ¿Por qué pasó?"*

Listar los **5 riesgos más probables** y **corregir los top antes de entregar** (no dejarlos como "nota"). Forzar las preguntas incómodas:

```
- ¿Qué pasa si 100 personas entran a la vez? (¿aguanta? ver 13)
- ¿Qué pasa si alguien ABUSA de la generación de IA? (¿hay tope? ver sección 4)
- ¿Qué pasa si el pago falla o llega tarde? (¿el cliente queda sin acceso o con acceso gratis?)
- ¿Qué pasa si el primer cliente abre la app vacía? (¿entiende qué hacer?)
- ¿Qué pasa si el output de IA sale malo, genérico u ofensivo? (¿hay control de calidad/guardrails?)
- ¿Qué pasa si el dueño no sabe operar algo? (¿tiene manual? ver sección 6)
- TEST DEL DESCONOCIDO: si un extraño abre esto, ¿confía y pagaría, o se ve "hecho por una IA"?
```

---

## 3. INVARIANTES QUE NO PUEDEN FALLAR (romperlos cuesta dinero o confianza)

> **Gate binario previo:** ejecutar los 10 Gates de `61-INTEGRIDAD-DE-LANZAMIENTO.md`. Cualquier
> bloqueante de auth, pago, privacidad, RPC, claim, economía o trazabilidad produce NO APTO aunque
> el certificado de abajo supere 80. Los puntos nunca compensan una vulnerabilidad crítica.

Tres cosas que, si están mal, el dueño SÍ o SÍ tendrá que corregir con un cliente molesto de por medio. Verificarlas explícitamente:

```
💰 EL DINERO NO PUEDE ESTAR MAL (ver 18 / 58 / 40):
  [ ] El gating free/pro se valida EN EL SERVIDOR, no ocultando botones en la UI → PROBAR el bypass.
  [ ] Webhook de pago: firma verificada + idempotencia + sin doble cobro / doble acceso.
  [ ] Máquina de estados de pago: un evento viejo reentregado NO reactiva un refund/chargeback.
  [ ] Cada caso deja el estado correcto: trial→pago, refund, chargeback, cambio de plan, doble compra,
      pago fallido (past_due con gracia), onboarding-first (la compra SUBE la cuenta, no la duplica — ver 18).
  [ ] Catálogo producto/oferta/moneda/importe validado + ledger económico sin APPROVED/COMPLETE doble.
  [ ] Cancelación conserva acceso hasta `access_until`; refund/chargeback/expired son estados distintos.
  [ ] El límite de plan se verifica ATÓMICAMENTE con la acción (no SELECT→JS→INSERT: race que regala IA).

🗄️ LOS DATOS NO SE PIERDEN (ver 25):
  [ ] Borrados con confirmación o soft-delete; nada destructivo de un clic.
  [ ] Migraciones NO destructivas (probar que no borran datos existentes).
  [ ] El usuario puede EXPORTAR sus datos (y borrarlos — derecho al olvido, 09/47).
  [ ] Backups activos antes de tener datos reales de clientes.

🔒 LA SEGURIDAD NO TIENE HUECOS (ver 27):
  [ ] Auditoría de 27 corrida (OWASP, semgrep, npm audit, secretos).
  [ ] IDOR probado: intentar leer el recurso de OTRO usuario por ID → debe fallar (403).
  [ ] RLS activo en TODA tabla; claves SOLO en servidor; webhooks verifican firma.
  [ ] Inventario de rutas/RPC/buckets: cero test/debug/bypass/OTP autoverificado en producción.
  [ ] XP/gemas/créditos/roles/entitlements no tienen escritura directa desde authenticated.
```

---

## 4. CIRCUIT-BREAKER DE COSTO DE IA — lo que evita una factura sorpresa de miles

Para un dueño no técnico, una factura de IA disparada (por abuso o por un bug en bucle) es **existencial**. El rate-limiting de `30` protege el uso normal; esto protege contra la catástrofe. Detalle de implementación en `30-INTEGRACION-IA.md`; aquí el invariante de entrega:

```
[ ] TOPE DE GASTO GLOBAL (diario y mensual) con KILL-SWITCH: si se supera, la generación se PAUSA o
    degrada automáticamente — NO se sigue gastando — y se ALERTA al dueño de inmediato (email/backoffice).
[ ] TOPE POR USUARIO (además del fair-use del plan): un usuario/bot no puede vaciar tu presupuesto.
[ ] Rate limiting por usuario Y por IP; protección anti-loop (un bug no puede llamar la API 10.000 veces).
[ ] El costo de IA por usuario Pro se mide y se mantiene <20% del precio (regla de 30/40) — verificado, no asumido.
```
> Sin esto, el peor día de un fundador solo es despertar con una factura de $5.000 de la API. El kill-switch convierte una catástrofe en un email de "pausamos la generación, revisa".

---

## 5. CALIDAD DEL OUTPUT DE IA — que el RESULTADO sea bueno, no slop

El código puede estar perfecto y el **output ser genérico/malo** — y el usuario igual tiene que corregir ("genera cosas mediocres"). Para apps de IA, la calidad del OUTPUT es parte de la entrega, no un extra:

```
[ ] Evaluar el RESULTADO real contra una rúbrica / golden set (ver 31), no solo que "no crashee":
    ¿es genuinamente BUENO y usable tal cual? ¿está COMPLETO (con imágenes/diseño si la promesa lo implica)?
    ¿suena a la MARCA del usuario (tono/nicho), no a "texto de IA"?
[ ] Si el output es mediocre: mejorar prompt / estructura / plantillas / few-shot ANTES de entregar.
[ ] Guardrails: moderación + anti-inyección de prompt (30) — el output nunca ofensivo ni manipulable.
[ ] El usuario SIEMPRE puede editar/regenerar/rechazar el output (la IA no es soberbia, ver 03/05).
```
> El "wow" tiene que IGUALAR la promesa (ver 01 "artefacto completo"). Un generador que produce slop genérico falla aunque el código sea impecable.

---

## 6. EL MANUAL DEL DUEÑO — el paquete de entrega para el no-técnico

Cuando el agente termina, el dueño no técnico necesita poder OPERAR la app sin volver a pedir ayuda para cada cosa. Generar, en lenguaje simple, un **`MANUAL-DEL-DUEÑO.md`** (en la raíz del proyecto):

```
QUÉ INCLUYE (todo en simple, paso a paso, sin jerga):
  - Qué cuentas necesita crear (Hotmart, Supabase, Vercel, dominio) y cómo conseguir/pegar cada clave.
  - Cómo desplegar y cómo poner la app en su dominio (resumen, detalle en 08).
  - Cómo LEER el backoffice (21): dónde ve ventas, usuarios, ganancia real y los avisos.
  - Tareas comunes paso a paso: cambiar el precio, dar acceso manual a un cliente, procesar un reembolso,
    pausar a alguien, leer por qué se fue un usuario.
  - RUNBOOK "si pasa X, haz Y": sitio caído · pago que no dio acceso · factura de IA alta (kill-switch) ·
    cliente dice que no puede entrar · webhook fallando. Cada uno con el primer paso concreto.
```
> Esto consolida en un documento lo que la regla de comunicación de CLAUDE.md ya exige avisar. El dueño se queda con un manual, no con dudas.

---

## 7. CADENCIA DE MANTENIMIENTO — lo que el dueño olvidará si no se lo dejas escrito

Un no-técnico no hará mantenimiento que no esté escrito y agendado. Dejar anotado (y, si se puede, agendado con recordatorios (dunning/renovaciones: `58`)):

```
[ ] Rotación de claves/API keys (cada X meses, o tras cualquier exposición).
[ ] Renovación del dominio (fecha) — perderlo tumba la app y el email.
[ ] Backups verificados (que de verdad se puedan restaurar, no solo que "existan") — RE-DRILL
    trimestral del restore (o tras cambios grandes de esquema), anotando el RTO medido en
    ESTADO.md (cadencia y fuentes en 25).
[ ] Actualización de dependencias / parches de seguridad (revisar cada X; `npm audit`).
[ ] Revisión mensual de costos (IA + infra + Hotmart) contra ingresos (40/21).
```

---

## EL TEST DE ESTRENO — recorre TODO como tu avatar, no como su constructor

Las rúbricas del revisor puntúan PANTALLAS; ninguna ve el VIAJE. El test de estreno caza lo que ningún gate por-pantalla puede ver: el ritmo, la fricción ACUMULADA, los saltos de tono entre etapas (una landing urgente → un onboarding frío), la pregunta que aburre en el minuto 3. Es EXPERIENCIAL — complementa las rúbricas y el auto-QA de la sección 1, no los reemplaza.

```
PROTOCOLO (con la app RENDERIZADA de verdad, nunca de memoria):
1. ENCARNA AL AVATAR: carga FICHA-AVATAR.md y métete en el papel — su dolor #1 ACTIVO ("hoy me
   pasó exactamente eso"), su objeción dominante sonando en la cabeza, su nivel de consciencia
   (¿sabe siquiera que esto tiene solución?), en SU celular, a la hora del día en que el dolor
   aprieta (la ficha la dice).
2. RECORRE EN ORDEN, RENDERIZADO (preview/screenshots reales):
   a) LANDING completa: ¿el hero me habla A MÍ o a "todo el mundo"? ¿en qué sección dejé de leer?
   b) ONBOARDING entero: ¿qué pregunta me aburrió o me hizo mentir? ¿el reconocimiento me NOMBRÓ
      de verdad (mi patrón, mis palabras) o era un ánimo intercambiable?
   c) PAYWALL: ¿mi objeción dominante quedó respondida ANTES de ver el precio? ¿confío en el
      trial (fecha, monto, cancelar) o huelo la trampa?
   d) PRIMERA SESIÓN de la app: ¿tuve mi victoria HOY? ¿sé exactamente qué hacer mañana?
3. SALIDA (formato fijo, sin diplomacia):
   - NARRACIÓN en 1ª persona del avatar, 10-15 líneas, HONESTA: "aquí dudé", "esto no lo
     entendí", "aquí hubiera cerrado la pestaña".
   - Los 3 PUNTOS DE FUGA detectados, cada uno con su FIX concreto (pantalla + cambio exacto).
4. QUIÉN LO EJECUTA: idealmente un SUBAGENTE con contexto LIMPIO (recibe SOLO FICHA-AVATAR.md +
   screenshots/URLs — sin el razonamiento de quien construyó: la misma lógica del revisor-visual).
   Si no hay subagentes: pasada SEPARADA del hilo de construcción, nunca "en caliente".
```

> Los 3 fixes se CORRIGEN antes de declarar la app lista (no se anotan "para después") — y si algún fix tocó el funnel de venta, el test se repite sobre la etapa corregida.

---

## CHECKLIST DE ENTREGA (la puerta FINAL antes de "listo para el usuario / para vender")

```
[ ] AUTO-QA end-to-end: cada elemento tocado, cada flujo recorrido, 6 estados, casos borde, primer arranque vacío — CON evidencia
[ ] PRE-MORTEM hecho: 5 riesgos listados, los top CORREGIDOS (no solo anotados)
[ ] DINERO: gating en servidor probado, webhook idempotente+firmado, refund/chargeback/cambio-de-plan correctos, límite atómico
[ ] DATOS: soft-delete/confirmación, migración no destructiva, export + borrado, backups
[ ] SEGURIDAD: auditoría 27 corrida, IDOR probado (403), sin secretos expuestos, RLS en toda tabla
[ ] IA — CIRCUIT-BREAKER: tope global + por-usuario + kill-switch + alerta al dueño; costo IA <20% del precio verificado
[ ] IA — CALIDAD DEL OUTPUT: evaluado contra rúbrica/golden set — bueno, completo, en marca; editable/regenerable; guardrails
[ ] MANUAL-DEL-DUEÑO.md generado (cuentas, claves, deploy, tareas comunes, runbook) en lenguaje simple
[ ] CADENCIA DE MANTENIMIENTO anotada (claves, dominio, backups, deps, costos)
[ ] TEST DE ESTRENO ejecutado (narración del avatar en 1ª persona + 3 fugas detectadas y CORREGIDAS)
[ ] Pendientes abiertos de ESTADO.md revisados y CERRADOS (incluido: screenshots REALES montados en el carrusel de la landing — 19 §5)
[ ] Gate de performance del 38 en verde (size-limit + Lighthouse CI móvil)
[ ] Reporte de cierre con evidencia (CLAUDE.md Regla de ejecución 8)
```

---

## EL CERTIFICADO /100 (el número que el dueño entiende)

El dueño no técnico no puede leer 10 gates dispersos. Al cerrar la certificación (esta puerta + `PROMPT-PRE-LANZAMIENTO.txt` / `/pre-lanzamiento`), TODO se consolida en UN certificado de calidad sobre 100, con 6 pilares. **Regla de cálculo simple y honesta:** cada sub-ítem es BINARIO (sus puntos completos o 0) o el puntaje REAL del revisor-visual escalado proporcionalmente. Nada se inventa: **si algo no se midió, puntúa 0 y se dice que no se midió** — un certificado inflado es peor que uno bajo.

El certificado requiere además los seis artefactos de 61 (`CLAIMS-LEDGER`, `PAYMENT-CERTIFICATION`,
`ECONOMICS-CERTIFICATION`, `PRIVACY-DATA-MAP`, `RELEASE-MANIFEST`, `PUBLICATION-CERTIFICATE`).
Si falta uno, el puntaje se puede
calcular como diagnóstico, pero el veredicto permanece NO APTO.

```
VENTA      /20 — la landing vende:
             [ ] estructura canónica de 10 secciones del 19 completa ............. 4 pts (binario)
             [ ] copy de venta del revisor (__/20) escalado ...................... ×0.4 → /8
             [ ] render de la landing: (usabilidad __/40 + craft __/20) / 60 ..... ×8   → /8
FUNNEL     /20 — onboarding + paywall convierten:
             [ ] gates del 02B (5 trabajos, 7 preguntas) + criterios D del 50 .... 8 pts (binario)
             [ ] render onboarding+paywall: promedio (__/40 + __/20) / 60 ........ ×8   → /8
             [ ] puente del trial D1-D7 diseñado y anotado en ESTADO.md (02C) .... 4 pts (binario)
PRODUCTO   /20 — la app interna es producto enriquecido:
             [ ] promedio del revisor en pantallas core: (__/40 + __/20) / 60 .... ×10  → /10
             [ ] momentos emocionales del 56 implementados (M1/M2 mínimo) ........ 5 pts (binario)
             [ ] los 6 estados completos en cada pantalla core ................... 5 pts (binario)
CONFIANZA  /15 — no filtra datos, no falla el cobro:
             [ ] auditoría del 27 corrida y sin ❌ (OWASP, IDOR, secretos) ....... 6 pts (binario)
             [ ] legal del 47 (privacidad, ToS, borrado, aviso IA, footer real) .. 4 pts (binario)
             [ ] pago E2E probado: pagar → plan activo → features (18) ........... 5 pts (binario)
VELOCIDAD  /10 — vuela en un Android de gama media:
             [ ] budget del 38 en verde: LCP móvil ............................... 5 pts (binario)
             [ ] budget del 38 en verde: CLS + size-limit ........................ 5 pts (binario)
RETENCIÓN  /15 — el ingreso se queda:
             [ ] loop del 24 implementado (gatillo→acción→recompensa→inversión) .. 5 pts (binario)
             [ ] analítica del 36 instrumentada (funnel + eventos clave) ......... 5 pts (binario)
             [ ] dunning del 58 montado (past_due + cadencia días 1/3/5/7) ....... 5 pts (binario)
───────────────────────────────────────────────────────────────────────────────────────────
TOTAL      /100
```

**BANDAS DEL VEREDICTO:**

```
≥90    CLASE MUNDIAL — lista para vender Y escalar (ads, afiliados, volumen).
80-89  LISTA PARA VENDER — se lanza; los pilares que quedaron <80% de su puntaje se mejoran
       en el primer mes (van como plan, con fecha, a ESTADO.md).
<80    NO APTO — no se vende todavía. El certificado sale con la LISTA EXACTA de qué falta
       (cada sub-ítem en 0 con su archivo del SO) — es el plan de trabajo, no un regaño.
```

**Cómo se PRESENTA al dueño:** el número grande + los 6 pilares con su puntaje en un desglose visual simple, una línea por pilar en lenguaje de negocio ("VENTA 17/20 — tu página vende bien; falta montar los screenshots reales"). El certificado completo (número, desglose, fecha, sub-ítems en 0) se guarda en ESTADO.md — es la foto de calidad del lanzamiento y la base para medir la mejora del primer mes.

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

- **`06-TESTING.md`**: el testing automatizado (Vitest/Playwright) es la red de seguridad; este archivo es el QA manual end-to-end + los invariantes de negocio que el test no cubre.
- **`27-REVISION-SEGURIDAD.md`**: la auditoría de seguridad es uno de los invariantes (sección 3); aquí se exige correrla como parte de la entrega.
- **`30-INTEGRACION-IA.md`**: el circuit-breaker de costo (sección 4) y la calidad del output (sección 5) se implementan con su plumbing.
- **`31-EVALS-OBSERVABILIDAD-OPERACION.md`**: la rúbrica/golden set para evaluar la calidad del output sale de aquí.
- **`18` / `58` / `40`**: los invariantes de dinero (webhook, estados dunning/renovación, gating, márgenes) viven ahí; este archivo los CONVIERTE en una puerta de entrega verificada.
- **`21-BACKOFFICE.md`**: el Manual del Dueño explica cómo leerlo; sus "avisos automáticos" son el canal del kill-switch.
- **`38-PERFORMANCE-BUDGET.md`**: el gate de performance (size-limit + Lighthouse CI móvil) es parte de la puerta de entrega — una app lenta en Android gama media NO está "lista para vender".
- **`32-DEL-MVP-AL-PRODUCTO.md`**: 32 sube el listón visual ("enriquecido"); 48 sube el listón funcional/operativo ("entregable de verdad"). Juntos = casi perfecta desde la v1.
