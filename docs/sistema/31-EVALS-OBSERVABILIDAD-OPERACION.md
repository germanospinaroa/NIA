# EVALS, OBSERVABILIDAD Y OPERACIÓN DE IA — De "Funciona" a "Operación Profesional"

> **Cuándo cargar este archivo:**
> - Antes de lanzar una app de IA a producción (junto con `30-INTEGRACION-IA.md` y `08-DEPLOY.md`)
> - Cuando cambias de modelo (`AI_MODEL`) o de prompt y necesitas saber si mejoró o empeoró
> - Cuando la app ya tiene usuarios y hay que medir calidad, costo y resolver incidentes

## Objetivo
La mayoría de las apps de IA se construyen bien y se OPERAN mal: nadie sabe si la calidad de la IA bajó tras un cambio, cuánto cuesta de verdad cada usuario, ni qué hacer cuando algo se rompe a las 3am. Este archivo cierra ese eslabón — el que separa "una app de IA que funciona" de "una operación de IA profesional".

---

## PRINCIPIO: No puedes mejorar (ni cobrar bien) lo que no mides

La salida de un modelo es **no determinista y cambia sola** (el proveedor actualiza el modelo, tú cambias el prompt). Sin medición, cada cambio es a ciegas y cada usuario es un costo desconocido. Tres capas: **observar** (qué pasó), **evaluar** (¿está bien?), **operar** (¿qué hago cuando falla?).

---

## PARTE 1 — OBSERVABILIDAD DE IA

Registrar CADA llamada a la IA en una tabla propia. Es la base de los evals, del costo real del backoffice (`21`) y de las alertas de gasto.

```sql
create table ai_calls (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete set null,
  feature      text not null,              -- qué feature la disparó
  model        text not null,              -- el AI_MODEL usado (para regresión al cambiarlo)
  tokens_in    integer, tokens_out integer,
  cost_usd     numeric(10,5),              -- costo calculado de esta llamada
  latency_ms   integer,
  status       text not null,              -- ok | error | timeout | moderated
  error        text,
  prompt_hash  text,                       -- hash del prompt (NO el prompt crudo si trae PII)
  created_at   timestamptz not null default now()
);
create index ai_calls_user_created_idx on ai_calls(user_id, created_at desc);
create index ai_calls_feature_idx on ai_calls(feature, created_at desc);
alter table ai_calls enable row level security;  -- solo el backoffice/servidor lee (service role)
```

```
QUÉ LOGGEAR:        feature, modelo, tokens, costo, latencia, status, error.
QUÉ NO LOGGEAR:     PII en crudo. Si el prompt trae datos personales, guarda un hash o una versión
                    redactada — nunca el texto sensible (coherente con 09 y la retención de datos).
ALERTAS DE GASTO:   no basta el tope de la consola del proveedor. Cron diario que suma cost_usd:
                    (a) por usuario → si uno supera su fair-use, avisar/limitar; (b) global → si el
                    gasto del día supera el umbral, alerta (email/Slack). Una app con un bug en loop
                    puede gastar cientos de dólares en una noche.
```

> El backoffice (`21-BACKOFFICE.md`) lee de `ai_calls` el costo real por feature y por usuario — así la "economía unitaria < 20%" deja de ser una estimación y pasa a ser un número medido.

### TRACING — una fila por llamada no alcanza para flujos multi-paso

`ai_calls` registra UNA fila por llamada al modelo. Perfecto para una feature de un solo paso. Pero un flujo **multi-paso** (RAG: embed → retrieve → rerank → generate; o un loop agéntico de varias tools, ver 30) son varias llamadas encadenadas: sin atarlas, no sabes cuál de las etapas fue lenta, cuál falló, ni cuánto costó el flujo completo.

```
- trace_id: un ID por FLUJO de usuario (la pregunta de RAG, la tarea del agente). Todas las llamadas
  del flujo comparten el mismo trace_id.
- span: cada etapa dentro del flujo (retrieve, rerank, generate, tool_X) es un span con su nombre,
  duración, costo y status, ligado al trace_id (y opcionalmente a un parent_span_id para anidar).
- Agrega trace_id (y span/parent) como columnas en ai_calls (o una tabla ai_spans ligada por trace_id).
- Sin esto, un RAG lento o un agente en loop son INDEPURABLES: ves llamadas sueltas, no la historia.
```

```sql
-- Extender ai_calls para trazar flujos multi-paso (RAG, agentes).
alter table ai_calls add column trace_id      uuid;      -- mismo para todas las llamadas del flujo
alter table ai_calls add column span_name     text;      -- 'retrieve' | 'rerank' | 'generate' | 'tool:...'
alter table ai_calls add column parent_span   uuid;      -- para anidar (loop agéntico)
create index ai_calls_trace_idx on ai_calls(trace_id, created_at);
-- Una consulta por trace_id reconstruye el flujo completo: etapas, latencia y costo de cada una.
```

---

## PARTE 2 — EVALS (regresión de calidad antes de cambiar modelo o prompt)

El cambio más peligroso de una app de IA: tocar el prompt o subir de modelo "porque sí" y degradar la calidad sin enterarte. Un **golden set** lo previene.

```
EL GOLDEN SET (15-30 casos representativos):
- Cada caso = un input real + lo que una buena salida debe cumplir (la aserción, no la salida exacta:
  la IA no es determinista).
- Cubrir: el caso feliz, los bordes, y los que históricamente fallaron (cada bug encontrado → un caso).

TIPOS DE ASERCIÓN (de más barato a más caro):
1. EXACTA / REGEX / CONTIENE  → "incluye un número", "es JSON válido", "no contiene la palabra X".
2. SCHEMA (zod)               → la salida estructurada valida contra el schema (ver 28/05 — zod en el borde).
3. LLM-AS-JUDGE               → otro modelo (Haiku barato) puntúa 1-5 si la salida cumple un criterio
                                ("¿responde la pregunta?", "¿es respetuosa?"). Para calidad subjetiva.

CÓMO USARLO:
- Correr el golden set ANTES de cambiar AI_MODEL o un prompt. Umbral de aprobación (ej. ≥90% pasa).
- Si baja del umbral → no se mergea el cambio. Es un test, igual que tsc/build.
- Integrarlo al CI (ver 08-DEPLOY) para que corra solo en cada PR que toque IA.
```

```typescript
// Eval mínimo — un caso del golden set
const golden = [
  { input: 'Resume en 1 frase: ...', assert: (out: string) => out.length < 200 && out.includes('.') },
  // ...15-30 casos
];
let pass = 0;
for (const c of golden) { const out = await generate(c.input); if (c.assert(out)) pass++; }
const score = pass / golden.length;       // exigir score >= 0.9 para aprobar el cambio
```

### Evals serios — más allá del golden set mínimo

El golden set de 15-30 casos con `assert length<200` es el piso. Para una operación de IA que se vende, sube el listón:

```
1. DATASET VERSIONADO EN EL REPO (no en la cabeza de nadie):
   - El dataset de evals vive en el repo (evals/dataset.jsonl), versionado con git, revisado en PRs.
   - Cada bug encontrado en prod → un caso nuevo en el dataset (el dataset crece, no se estanca).

2. SEPARAR EVALS DE REGRESIÓN vs DE CAPACIDAD:
   - REGRESIÓN: "lo que ya funcionaba sigue funcionando". Corren en CI, umbral alto (≥90%), bloquean
     el merge si bajan. Casos estables, deterministas en su aserción.
   - CAPACIDAD: "¿qué tan bueno es en la tarea difícil?". Score continuo (no pass/fail), para comparar
     modelos/prompts y decidir. No bloquean el merge; informan la decisión.

3. LLM-AS-JUDGE CON RÚBRICA Y ANTI-SESGO (para calidad subjetiva):
   - Rúbrica explícita: criterios concretos y puntuables ("¿responde la pregunta? ¿cita la fuente?
     ¿tono respetuoso?"), no "¿está bien?" a ojo. El juez puntúa CADA criterio por separado.
   - Anti-sesgo del juez (sesgos reales y medibles):
     · POSITION BIAS: al comparar dos salidas A/B, el juez favorece la posición (1ra o 2da).
       Mitiga: corre el par en ambos órdenes y promedia; o pide puntuar cada una sola, no comparar.
     · SELF-PREFERENCE: un modelo tiende a preferir su propia salida. Usa un juez de OTRA familia/modelo
       que el generador cuando puedas.
     · PARES CIEGOS: el juez no debe saber qué prompt/modelo produjo cada salida (sin etiquetas
       "versión nueva" / "candidato"). Aleatoriza y anonimiza.
   - El juez puede ser un Haiku barato; loggear su costo (es parte del costo del eval).

4. MÉTRICAS AGREGADAS, no solo pass/umbral:
   - Reporta distribución (media, p50, p90, peor caso), no solo "% que pasa". Un 92% que esconde
     un peor-caso catastrófico es peligroso.
   - Cortes por categoría (caso feliz / bordes / históricos) para ver DÓNDE degradó.

5. CORRELACIÓN prompt_hash → score:
   - ai_calls ya guarda prompt_hash (ver Parte 1). Cruza el hash del prompt evaluado con su score:
     así sabes exactamente qué versión de prompt produjo qué calidad, y atas una regresión en prod
     a un cambio concreto de prompt.

6. COSTO DEL EVAL:
   - Cada corrida del dataset cuesta tokens (generación + juez). Mídelo y tenlo en cuenta:
     un dataset grande con LLM-judge en cada PR puede ser caro — balancea tamaño vs frecuencia.
```

```typescript
// evals/run.ts — estructura de dataset versionado + runner con regresión y LLM-judge anti-sesgo.
// Dataset: evals/dataset.jsonl, una línea por caso, en git.
interface EvalCase {
  id: string;
  type: 'regression' | 'capability';
  input: string;
  expect?: (out: string) => boolean;   // aserción determinista (regresión)
  rubric?: string;                       // criterio para el juez (capacidad/subjetivo)
}

async function runEvals(cases: EvalCase[], model: string) {
  // score: number 0..1 — o null = "no evaluado" (el juez falló); NUNCA un 0 silencioso.
  const results: { id: string; type: string; score: number | null; promptHash: string; costUsd: number }[] = [];

  for (const c of cases) {
    const { text, promptHash, costUsd } = await generate(c.input, model); // loggea en ai_calls
    let score: number | null;

    if (c.expect) {
      score = c.expect(text) ? 1 : 0;                       // regresión: pass/fail
    } else {
      score = await llmJudge(c.input, text, c.rubric!);     // capacidad: 0..1 con rúbrica, o null
    }
    results.push({ id: c.id, type: c.type, score, promptHash, costUsd });
  }

  // Métricas agregadas, separadas por tipo. Los "no evaluado" (null) se EXCLUYEN del p90 y se
  // reportan aparte — un 0 falso hundiría el p90 y dispararía falsas regresiones.
  const regression = results.filter(r => r.type === 'regression');
  const passRate = regression.filter(r => r.score === 1).length / (regression.length || 1);
  const capScores = results.filter(r => r.type === 'capability')
    .map(r => r.score).filter((s): s is number => s !== null).sort((a, b) => a - b);
  const p90 = capScores[Math.floor(capScores.length * 0.9)] ?? null;
  const noEvaluados = results.filter(r => r.type === 'capability' && r.score === null).length;
  if (noEvaluados > 0) console.warn(`⚠️ ${noEvaluados} caso(s) sin evaluar (el juez falló) — excluidos del p90`);
  const evalCost = results.reduce((s, r) => s + r.costUsd, 0);

  // CI: solo la REGRESIÓN bloquea el merge.
  if (passRate < 0.9) throw new Error(`Regresión ${(passRate * 100).toFixed(0)}% < 90% — no mergear`);
  return { passRate, capabilityP90: p90, noEvaluados, evalCost, byPromptHash: results };
}

// LLM-as-judge anti-position-bias: comparar en AMBOS órdenes y promediar (cuando es A/B).
// Para puntuar UNA salida: score 1-5 contra la rúbrica, par ciego (sin etiquetas de origen),
// con un modelo de OTRA familia que el generador (anti self-preference). Normalizar a 0..1.
// Cualquier fallo (API, JSON inválido, score fuera de rango) → null: el caso queda "no evaluado"
// y se excluye de las métricas — jamás devolver 0 en silencio.
async function llmJudge(input: string, output: string, rubric: string): Promise<number | null> {
  try {
    const res = await judgeClient.messages.create({
      model: process.env.JUDGE_MODEL!,       // OTRA familia que el generador (anti self-preference)
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: [
          'Eres un evaluador estricto. Puntúa la SALIDA contra la RÚBRICA.',
          `RÚBRICA:\n${rubric}`,
          `ENTRADA DEL USUARIO:\n${input}`,
          `SALIDA A EVALUAR:\n${output}`,
          'Responde SOLO con JSON: {"score": <entero 1-5>, "reason": "<una frase>"}',
        ].join('\n\n'),
      }],
    });
    const text = res.content
      .filter((block): block is { type: 'text'; text: string } => block.type === 'text')
      .map((block) => block.text).join('');
    const json = text.match(/\{[\s\S]*\}/);            // tolera prosa alrededor del JSON
    if (!json) return null;
    const score = Number(JSON.parse(json[0]).score);
    if (!Number.isInteger(score) || score < 1 || score > 5) return null;
    return (score - 1) / 4;                            // 1-5 → 0..1
  } catch {
    return null;                                       // error → "no evaluado", nunca 0 silencioso
  }
}
```

---

## PARTE 3 — RUNBOOK DE INCIDENTES (qué hacer cuando se rompe a las 3am)

No improvisar en caliente. Un mini-runbook de los 5 incidentes más probables: síntoma → causa → acción.

```
| Síntoma                          | Causa probable                  | Acción inmediata                         |
| La IA devuelve errores en masa   | proveedor caído / rate limit    | activar degradación (modelo fallback/    |
|                                  |                                 | mensaje); el circuit-breaker de 30 frena |
| La factura de IA se disparó      | bug en loop / abuso / sin caché | cortar la feature por flag; revisar       |
|                                  |                                 | ai_calls por usuario; subir rate limit    |
| La DB va lenta / al 90%          | falta índice / egress / storage | EXPLAIN (25); subir a Supabase Pro;       |
|                                  |                                 | purgar datos viejos                       |
| El webhook de pago falla         | firma / idempotencia / timeout  | revisar logs; reprocesar desde el panel   |
|                                  |                                 | de Hotmart/Stripe (idempotencia lo cubre) |
| Caída total (pantalla blanca)    | deploy roto                     | rollback: Vercel → promover el deploy      |
|                                  |                                 | anterior (1 clic). NUNCA hotfix a ciegas  |
```

```
ROLLBACK: Vercel guarda cada deploy → "Promote to Production" del anterior revierte en segundos.
          Tener identificado el último deploy bueno antes de cada release grande.
STATUS PAGE: una página de estado (BetterStack / Instatus / incluso estática) enlazada desde la app.
          Cuando algo falla, comunicar baja la ansiedad del usuario y los tickets a la mitad.
```

### MONITOREO EXTERNO MÍNIMO (15 minutos de setup, día 1)

```
(a) UPTIME EXTERNO gratuito (UptimeRobot/BetterStack) sobre la URL de producción + /api/health —
    Sentry NO avisa si la app está caída y nadie la visita.
(b) HEARTBEAT de TODOS los crons críticos (worker de cola, reclaim, backup, reconciliación de
    suscripciones de 18): cada cron hace ping al terminar; sin ping = alerta.
    Los crons muertos son el fallo silencioso #1 de las apps pequeñas.
```

---

## PARTE 4 — SOPORTE AL USUARIO → vive en `59-SOPORTE-CLIENTE.md`

> El pilar de soporte completo (canal mínimo viable, SLA, plantillas, bot con escalada humana, rescate de churn, métricas) vive en `59-SOPORTE-CLIENTE.md`. Regla operativa que sigue aplicando aquí: los bugs reportados en soporte se vuelven casos de regresión/eval (Parte 2), y la status page (Parte 3) baja los tickets a la mitad.

---

## CHECKLIST DE CIERRE — Evals, Observabilidad y Operación

```
OBSERVABILIDAD
[ ] Tabla `ai_calls` registrando feature/modelo/tokens/costo/latencia/status (sin PII en crudo)
[ ] trace_id/span en flujos multi-paso (RAG retrieve→rerank→generate, agentes) — depurables
[ ] Alerta de gasto de IA: diaria por usuario (fair-use) y global (tope) — no solo la consola
[ ] Sentry capturando errores de front y back (ver 13); errores de IA visibles

EVALS
[ ] Dataset versionado en el repo; cada bug de prod → un caso nuevo
[ ] Evals de REGRESIÓN (bloquean CI, ≥90%) separados de los de CAPACIDAD (score continuo, informan)
[ ] LLM-as-judge con rúbrica explícita y anti-sesgo (position bias, self-preference, pares ciegos)
[ ] Métricas agregadas (media/p50/p90/peor caso), no solo pass/umbral; cortes por categoría
[ ] Correlación prompt_hash → score; costo del eval medido
[ ] Se corre antes de cambiar AI_MODEL o un prompt; integrado al CI (cada PR que toca IA — ver 08)
[ ] Suite compilada por dominio: no se usa solo LLM-as-judge donde existe un oracle verificable
[ ] Claims de cobertura (temas/niveles/casos) trazados a fixtures y umbrales

OPERACIÓN
[ ] Mini-runbook de los 5 incidentes top (síntoma→causa→acción) escrito
[ ] Rollback probado (Vercel promote); último deploy bueno identificado
[ ] Status page enlazada desde la app
[ ] Uptime externo (UptimeRobot/BetterStack) sobre la URL de producción + /api/health
[ ] Heartbeat de todos los crons críticos (worker, reclaim, backup, reconciliación de 18):
    cada cron hace ping al terminar; sin ping = alerta
[ ] Canal de soporte real visible en la app (sistema completo en 59-SOPORTE-CLIENTE.md)

CONTINUIDAD (DR)
[ ] PITR activo + un restore ya PROBADO de verdad (no solo "está activado") — ver 25
[ ] RPO/RTO escritos como objetivo del negocio (ej. RPO ≤ 5 min, RTO ≤ 1 h)
[ ] Backup off-platform: pg_dump cifrado a S3/R2, en cron, fuera de la cuenta de Supabase
[ ] Runbook de migración fallida (expand/contract + rollback) — ver 25
[ ] Fallback definido si cae el proveedor de IA (degradación / modelo alterno) — ver 30
```

### El schema valida forma, no verdad: evals compilados por dominio

El golden set general no basta para todas las apps. Antes de vender, clasificar la salida:

- **Determinista** (matemáticas, cálculo, formatos): oracle programático, equivalencia semántica,
  property/metamorphic tests, signos, fracciones, unidades, geometría/bordes y errores comunes.
- **Sensible** (salud, finanzas, legal): referencias oficiales actuales, límites de uso, casos
  adversariales, revisión experta y escalada humana. El LLM-judge no certifica seguridad solo.
- **Creativa**: utilidad, diversidad, completitud, voz de marca y revisión humana ciega.

Crear una matriz `claim/tema/nivel -> fixtures -> oracle/rúbrica -> umbral`. Cada bug de producción
se vuelve fixture. Si el producto anuncia más cobertura de la que tiene el dataset, se amplía y
prueba o se corrige el claim mediante `CLAIMS-LEDGER.md` (61).

---

## RECUPERACIÓN ANTE DESASTRES (DR) Y CONTINUIDAD

Los evals te dicen si la IA responde bien; la observabilidad, si la app está viva. La DR responde a la pregunta que nadie quiere hacerse: **¿qué pasa cuando algo se rompe de forma grave?** El detalle de base de datos vive en `25-BASE-DE-DATOS.md`; aquí está el **runbook de continuidad a nivel app** — el plan que ejecutas a las 3am, no la teoría.

### RPO y RTO — pon números antes de necesitarlos

Dos objetivos de negocio que deben estar escritos ANTES del incidente, no improvisados durante él:

- **RPO (Recovery Point Objective)**: cuántos datos puedes permitirte perder. Con PITR el RPO es de segundos; con solo backup diario, hasta 24h. Ejemplo razonable para una app que cobra: **RPO ≤ 5 min**.
- **RTO (Recovery Time Objective)**: cuánto puede estar caída la app. Ejemplo: **RTO ≤ 1 h**. Si tu RTO es "1 hora" pero nunca probaste un restore, tu RTO real es "no sé" — que en la práctica significa "todo el día".

El detalle de PITR y restore de DB está en `25-BASE-DE-DATOS.md` (sección de backups). La regla de oro: **un backup que no probaste restaurar no es un backup, es una esperanza.** El restore tiene que estar PROBADO al menos una vez (cronómetro en mano para medir el RTO real).

### Backup off-platform — por si pierdes la cuenta, no solo los datos

PITR te salva de un `DELETE` accidental. No te salva si **pierdes la cuenta de Supabase** (suspensión, baja de pago, error humano, proveedor caído). Para ese escenario necesitas una copia FUERA de la plataforma:

```
- pg_dump periódico (cron diario/semanal) → archivo cifrado → bucket S3/R2 en OTRA cuenta/proveedor.
- Cífralo en reposo y restringe el acceso (es una copia completa de datos de usuarios — aplica la LGPD, ver 47).
- Rota y caduca copias viejas (ej. 7 diarias + 4 semanales) para no acumular costo ni superficie de fuga.
- Prueba restaurar ese dump a una DB limpia al menos una vez — mismo principio que el PITR.
```

No reemplaza al PITR (granularidad fina, RPO bajo); lo COMPLEMENTA (sobrevive a la pérdida de la cuenta).

**DEAD MAN'S SWITCH DEL BACKUP.** El modo de fallo real no es "no tengo backup" — es "mi backup
lleva semanas fallando en silencio" (GitLab 2017: 5 mecanismos de backup, todos rotos sin que nadie
lo supiera; se salvaron por una copia manual de 6 horas antes). Por eso el cron del pg_dump lleva
HEARTBEAT: ping a un monitor gratuito (healthchecks.io o equivalente) al terminar CON verificación
de tamaño mínimo del dump — si el ping NO llega, el monitor alerta. La alerta de "backup no corrió"
vale más que el backup mismo.

### Rollback de migración

Una migración mala puede ser tan destructiva como un borrado. El patrón seguro (expand/contract) y el procedimiento de rollback están en `25-BASE-DE-DATOS.md`. A nivel continuidad: ten identificado el último estado bueno del esquema y el comando exacto de reversa ANTES de aplicar, no después de romper producción.

### Si cae el proveedor de IA

La IA es una dependencia externa que SE CAE. La degradación elegante, el circuit-breaker, los timeouts/retries y el fallback (cola asíncrona o modelo alterno vía `AI_MODEL`) están en `30-INTEGRACION-IA.md`. A nivel continuidad, la regla es: **la caída de la IA degrada una feature, no tumba la app entera.** Si el proveedor está caído, el usuario ve un estado claro ("la IA no está disponible, lo reintentamos") y el resto de la app sigue funcionando.

### Checklist de continuidad (qué hacer cuando pasa lo peor)

```
ANTES (preparación)
[ ] RPO/RTO escritos y acordados como objetivo de negocio
[ ] PITR activo Y un restore probado de verdad (RTO medido con cronómetro) — ver 25
[ ] pg_dump cifrado a S3/R2 en cron, fuera de la cuenta de Supabase, restore probado
[ ] Heartbeat del backup (dead man's switch): el cron del pg_dump hace ping a un monitor externo
    al terminar, con tamaño mínimo del dump verificado; sin ping = alerta
[ ] Último deploy bueno y último esquema bueno identificados (rollback listo) — ver 25 y 08
[ ] Fallback de IA definido y probado (degradación / modelo alterno) — ver 30
[ ] Datos de contacto del proveedor + status pages a mano

DURANTE (el incidente)
[ ] Comunica: status page + mensaje in-app honesto (ver Runbook arriba)
[ ] Diagnostica el alcance (¿datos? ¿deploy? ¿DB? ¿IA? ¿toda la cuenta?)
[ ] Ejecuta el runbook que corresponda: rollback de deploy (08) / restore PITR (25) /
    restore off-platform (este doc) / degradación de IA (30)

DESPUÉS (post-mortem sin culpa)
[ ] Causa raíz documentada; el incidente se convierte en un caso de eval/test de regresión
[ ] Ajusta RPO/RTO si la realidad fue peor que el objetivo
```

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

- **`30-INTEGRACION-IA.md`**: produce las llamadas que aquí se observan y evalúan; el circuit-breaker y la degradación de 30 son la primera línea del runbook; salida estructurada, routing por capacidad y loops agénticos viven ahí.
- **`33-RAG-Y-CONTEXTO.md`**: recall@k y grounding/faithfulness son evals de RAG; el trace_id que abarca embed→retrieve→rerank→generate se registra aquí.
- **`21-BACKOFFICE.md`**: lee `ai_calls` para el costo real y `event_log` para retención — el panel del dueño.
- **`06-TESTING.md`**: los evals son al modelo lo que los tests son al código — regresión obligatoria.
- **`08-DEPLOY.md`**: el CI corre tests, build, auditoría de seguridad Y el golden set antes de producción; el rollback de deploy es parte del runbook de continuidad.
- **`25-BASE-DE-DATOS.md`**: el detalle de PITR, restore, RPO/RTO de DB y rollback de migración vive ahí; aquí está el runbook de continuidad a nivel app que lo orquesta.
- **`12-FLUJO-AGENTICO.md`**: el ritual de verificación con evidencia aplica también a la calidad de IA.
