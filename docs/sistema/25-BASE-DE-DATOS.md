# BASE DE DATOS — Diseño, Migraciones y Rendimiento Profesional

> **Cuándo cargar este archivo:**
> - Al diseñar el modelo de datos de la app (junto con `04-ARQUITECTURA.md`)
> - Antes de escribir cualquier migración o `CREATE TABLE`
> - Cuando una query va lenta, la app no escala, o vas a tocar el esquema de una DB con datos reales
> - Stack por defecto: **Supabase (Postgres)**. Las reglas son de Postgres salvo que se indique.

## Objetivo
El backend es donde mueren las apps que "se veían terminadas": queries que escanean millones de filas, migraciones que bloquean la tabla por horas, RLS que deja datos expuestos o que mata el rendimiento. Este archivo da la disciplina de base de datos que separa un MVP de juguete de uno que aguanta clientes reales.

---

## PRINCIPIO: El esquema es la decisión más cara de revertir

Un componente feo se rediseña en una tarde. Un esquema mal diseñado con datos reales encima se arrastra durante toda la vida del producto. **Pensar el esquema antes de escribir la primera tabla** — y migrarlo con cuidado quirúrgico cuando ya hay datos.

```
ANTES de crear una tabla, responder:
- ¿Cuál es la entidad y cuál es su clave primaria? (uuid por defecto en Supabase)
- ¿Qué relaciones tiene? (1:N → FK en el lado N; N:M → tabla intermedia)
- ¿Qué columnas se consultan, filtran u ordenan? (esas necesitan índice)
- ¿Qué invariantes debe garantizar la DB? (not null, unique, check, foreign key)
- ¿RLS? Sí, siempre (ver más abajo y archivo 09)
```

---

## DISEÑO DE ESQUEMA

```
REGLAS:
- Tipos correctos: timestamptz (no timestamp), numeric para dinero (NUNCA float),
  text (no varchar(n) arbitrario), boolean, uuid para IDs. jsonb solo para datos
  realmente sin esquema — no como excusa para no modelar.
- Constraints en la DB, no solo en el código: not null, unique, check (edad >= 0),
  foreign key con on delete (cascade/set null/restrict — decidir a propósito).
  La DB es la última línea de defensa de la integridad; el frontend miente.
- Normalizar por defecto (evitar duplicar datos); desnormalizar SOLO con una razón de
  rendimiento medida, y documentarla.
- Timestamps de auditoría en toda tabla: created_at timestamptz default now(),
  updated_at mantenido por trigger.
- Soft delete (deleted_at) cuando el dato no debe perderse; hard delete para datos
  desechables. Decidir por tabla.
```

```sql
-- Patrón base de tabla
create table posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null check (length(title) between 1 and 200),
  status      text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

---

## ÍNDICES — el 80% del rendimiento por el 20% del esfuerzo

Una query sin índice **escanea toda la tabla** (Seq Scan). Con 1.000 filas no se nota; con 1.000.000 la app se cae. Indexar bien es la palanca de rendimiento más grande.

```
REGLA #1 — Postgres NO indexa las foreign keys automáticamente.
  Una FK sin índice hace que DELETE/UPDATE en el padre (o un CASCADE) escanee y bloquee
  TODA la tabla hija. Siempre crear el índice a mano:
    create index posts_user_id_idx on posts(user_id);
  Esto da mejoras de 10-100x en joins y borrados. Es el índice olvidado #1.

REGLA #2 — Índices compuestos: columnas de IGUALDAD primero, luego rango/orden.
  Para `where status = 'published' order by created_at desc`:
    create index posts_status_created_idx on posts(status, created_at desc);
  Leftmost-prefix: un índice (a, b) sirve para filtrar por `a` o por `a AND b`,
  pero NO sirve para filtrar solo por `b`.

REGLA #3 — Elegir el tipo de índice según el dato:
  B-tree (default)  → igualdad y rango en columnas escalares
  GIN               → jsonb, arrays, y full-text search (to_tsvector)
  GiST              → datos geométricos / PostGIS / rangos
  BRIN              → tablas enormes ordenadas por tiempo (logs, eventos) — índice diminuto

REGLA #4 — No sobre-indexar. Cada índice acelera lecturas pero ralentiza cada INSERT/UPDATE
  (write amplification) y ocupa disco. Indexar lo que se consulta de verdad, no "por si acaso".
  Revisar índices no usados con pg_stat_user_indexes.
```

---

## PAGINACIÓN KEYSET (cursor) — el default para listas e historial

Toda lista debe paginarse (regla de `13-INFRA-ESCALABILIDAD.md`). Pero **cómo** importa: `OFFSET` (el `.range(0, 24)` del cliente de Supabase) se degrada a medida que el usuario avanza, porque Postgres debe **leer y descartar** todas las filas anteriores. La página 1 es instantánea; la página 200 escanea 5.000 filas para devolver 25 — y si entra una inserción mientras paginas, ves duplicados o te saltas registros.

**Keyset (cursor) pagination** es el default correcto: en vez de "saltar N filas", dice "dame las 25 siguientes *después de este punto*". Es O(1) respecto a la profundidad porque usa el índice para posicionarse directo.

```sql
-- Ordenar por una clave estable; created_at puede repetirse → desempatar con id.
-- Primera página:
select * from generations where user_id = :uid
order by created_at desc, id desc limit 25;

-- Páginas siguientes: pasar el (created_at, id) de la ÚLTIMA fila vista como cursor.
select * from generations where user_id = :uid
  and (created_at, id) < (:last_created_at, :last_id)   -- comparación de tuplas
order by created_at desc, id desc limit 25;
```

La **comparación de tuplas** `(created_at, id) < (:a, :b)` se resuelve con el índice compuesto — es la pareja inseparable de la sección de ÍNDICES:

```sql
create index generations_user_created_id_idx on generations (user_id, created_at desc, id desc);
```

Con el cliente de Supabase se emula con `.or()` (o, más limpio, una RPC que reciba el cursor):

```ts
let q = supabase.from('generations').select('*').eq('user_id', uid)
  .order('created_at', { ascending: false }).order('id', { ascending: false }).limit(25);
if (last) q = q.or(`created_at.lt.${last.created_at},and(created_at.eq.${last.created_at},id.lt.${last.id})`);
const { data } = await q; // cursor de la próxima página = data[data.length - 1]
```

```
REGLA: scroll infinito / "cargar más" / historiales largos → KEYSET (cursor).
       Paginador numerado sobre pocas filas → OFFSET está bien.
       Nunca OFFSET profundo (página 50+) sobre tablas que crecen.
```

---

## MIGRACIONES SEGURAS / ZERO-DOWNTIME

Una migración mal hecha sobre datos reales **bloquea la tabla** y tira la app. El error típico del agente: correr un `ALTER TABLE` que parece inocente y deja la app caída por minutos u horas.

### Flujo declarativo con Supabase (el correcto)

```
1. ITERAR en local sin ensuciar el historial:
   Probar el cambio con `psql` contra la connection string, el SQL editor del dashboard,
   o el MCP de Supabase (`execute_sql`) hasta que funcione — el CLI no trae un subcomando
   para ejecutar SQL suelto.
   NO usar `apply_migration` durante la exploración — escribe historial y envenena los diffs.

2. SNAPSHOT cuando el cambio está bien:
   `supabase db diff -f <nombre_descriptivo>`
   → genera el archivo de migración limpio a partir de los cambios LOCALES.
   (`supabase db pull` es OTRA cosa: trae el esquema REMOTO a local — no sirve
   para snapshotear lo que iteraste en local.)

3. AUDITAR antes de commitear:
   Los advisors se consultan en el dashboard de Supabase (Database → Advisors)
   o vía MCP con `get_advisors` — NO existe un subcomando `supabase db advisors` en el CLI.
   → detectan automáticamente índices faltantes, RLS desactivado, y problemas de seguridad.
   Pasar los advisors es parte del checklist de cierre, no opcional.

4. APLICAR en orden: local → preview/branch → producción. Nunca directo a producción.
```

### Operaciones peligrosas y cómo hacerlas seguras

```
- Crear índice en tabla con datos:  create index CONCURRENTLY ...
  (no bloquea escrituras; tarda más pero la app sigue viva).
  Cuidado: `CREATE INDEX IF NOT EXISTS` "tiene éxito" en silencio si quedó un índice
  INVÁLIDO de un intento fallido — borrarlo primero (drop index if exists ...).

- Agregar columna NOT NULL a tabla con datos: patrón expand-contract:
    1) add column nullable  →  2) backfill por lotes  →  3) set not null  →  4) (opcional) default
  Nunca `add column ... not null default ...` de golpe en tablas enormes.

- Backfills: por LOTES (ej. 5.000 filas por iteración con pausa), nunca un UPDATE de toda
  la tabla en una transacción (bloquea y crece el WAL sin control).

- Renombrar/eliminar columna usada en código: primero desplegar el código que ya no la usa,
  LUEGO eliminarla. Nunca al revés.

- (MySQL/PlanetScale, si aplica) escribir ALGORITHM=INSTANT|INPLACE, LOCK=NONE explícito.
  Si no lo especificas, MySQL puede caer en COPY y bloquear escrituras por horas en tablas
  grandes. Forzar que falle ruidosamente si no puede hacerlo online.
```

Para cutovers riesgosos: dual-write detrás de un feature flag (`37-FEATURE-FLAGS-Y-EXPERIMENTOS.md`)
— se enciende gradual, se apaga sin deploy.

---

## RENDIMIENTO DE QUERIES — disciplina de `EXPLAIN ANALYZE`

Cuando una query va lenta, no adivinar — **medir**:

```sql
explain (analyze, buffers) select ... ;
```

```
BANDERAS ROJAS en el plan:
- "Seq Scan" sobre una tabla grande      → falta un índice (la causa #1)
- "Rows Removed by Filter" alto          → el índice/where tiene mala selectividad
- buffers "read" >> "hit"                → los datos no están en caché (working set grande)
- "Sort Method: external merge Disk"     → work_mem insuficiente para el sort
- estimado vs real de filas muy distinto → estadísticas desactualizadas → correr ANALYZE;
```

**El problema N+1** (matar antes de que escale): hacer 1 query para la lista y luego 1 query por cada ítem = N+1 queries. Resolver con un join o un `in (...)`, no en un loop. (Conecta con la ingeniería de costos de IA del archivo 12: el mismo principio aplica a llamadas externas.)

---

## TRANSACCIONES Y ATOMICIDAD — la correctitud bajo concurrencia

El rendimiento (índices, paginación) hace que la app sea *rápida*. Las transacciones hacen que sea *correcta cuando dos usuarios actúan al mismo tiempo*. Una app que "funciona en la demo" (un usuario, un click) pierde dinero o corrompe datos en producción (50 usuarios concurrentes) si ignora esto.

```
USAR UNA TRANSACCIÓN siempre que un cambio toque MÁS DE UNA fila/tabla y deba ser todo-o-nada:
crear un registro Y descontar un crédito; cobrar Y marcar pagado; mover saldo de A a B.
```

### El antipatrón: "leer, decidir en el código, luego escribir" (race condition)

El patrón ingenuo —`SELECT count(...)`, comparar contra el límite en JS, y si pasa hacer el `INSERT`— **es una race condition**. Entre el `SELECT` y el `INSERT` hay una ventana donde otra petición hace lo mismo: dos leen "9 de 10", ambas deciden "hay espacio", ambas insertan → 11. Si eso es una cuota de IA, **pagas de más**.

```ts
// ❌ RACE CONDITION — lo que NO hay que hacer (aunque "funcione" en la demo)
const { count } = await supabase.from('generations')
  .select('*', { count: 'exact', head: true }).eq('user_id', uid);
if (count >= 10) throw new Error('límite');   // ← otra petición pasa por aquí a la vez
await supabase.from('generations').insert({ user_id: uid, ... });
```

> Este es el "verificar límite ANTES de crear" de `04-ARQUITECTURA.md`. A nivel **producto** (mostrar el paywall) es correcto; a nivel **datos** no basta: la verificación debe ocurrir *atómicamente dentro* de la escritura.

### Arreglo canónico — función RPC `security definer` transaccional

Una función Postgres es atómica por defecto (todo el cuerpo corre en una transacción): si algo falla, se revierte completo. Es el patrón de referencia para operaciones que cuestan dinero.

Esta es la versión **canónica** (idempotente): toda operación que cuesta dinero —descontar crédito + crear la generación + llamar a la IA— debe poder reintentarse sin doble-cobro ni doble-generación. Las redes fallan y los clientes hacen doble-click; sin una `p_idempotency_key`, un reintento descuenta dos créditos y genera dos veces. La garantía la da Postgres (`unique`), no el código (ver sección IDEMPOTENCIA).

La función vive en **`public`** — el único schema que PostgREST expone — con `grant execute` a `authenticated`: la llama el **USUARIO autenticado** vía `supabase.rpc('create_generation', {...})`, y por eso `(select auth.uid())` resuelve su identidad real desde el JWT. (Una función en un schema `private` sin grant sería ininvocable: el cliente no puede llegarle por la API, y si la llamara el servidor con la secret key, `auth.uid()` sería NULL.)

```sql
create or replace function public.create_generation(
  p_input text, p_output text, p_idempotency_key text)
returns public.generations
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_uid uuid := (select auth.uid()); v_row public.generations; v_claimed boolean;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001'; end if;

  -- 0) IDEMPOTENCIA: reclamar la clave ANTES del trabajo caro. Si ya existía, NO repetir:
  --    devolver el resultado previo. (insert-first, then act.)
  insert into public.idempotency_keys (key, user_id) values (p_idempotency_key, v_uid)
  on conflict (key) do nothing;
  get diagnostics v_claimed = row_count;          -- 1 = somos los primeros; 0 = duplicado
  if not v_claimed then
    -- ya procesado: devolver la generación previa enlazada a esta clave, sin descontar ni generar.
    select g.* into v_row from public.generations g
      where g.idempotency_key = p_idempotency_key limit 1;
    return v_row;                                  -- mismo resultado, cero efectos secundarios
  end if;

  -- 1) Descontar crédito de forma atómica. Si no hay saldo, 0 filas → abortamos todo
  --    (incluida la reserva de la clave de arriba: misma transacción).
  update public.user_quota set credits = credits - 1 where user_id = v_uid and credits > 0;
  if not found then raise exception 'NO_CREDITS' using errcode = 'P0001'; end if;

  -- 2) Crear el registro, enlazado a la clave. Si esto falla, todo lo anterior se revierte.
  insert into public.generations (user_id, input, output, idempotency_key)
  values (v_uid, p_input, p_output, p_idempotency_key)
  returning * into v_row;

  -- 3) marcar la clave como 'done' con el resultado cacheado (para reintentos posteriores).
  update public.idempotency_keys set status = 'done', result = to_jsonb(v_row), locked_at = now()
    where key = p_idempotency_key;
  return v_row;
end; $$;
-- Invocable SOLO por usuarios autenticados (por defecto Postgres concede execute a PUBLIC — cerrarlo):
revoke execute on function public.create_generation(text, text, text) from public, anon;
grant execute on function public.create_generation(text, text, text) to authenticated;
```

> **Modo alternativo — la llama el BFF con la secret key:** ahí `auth.uid()` es NULL. La función
> recibe entonces un `p_user_id uuid` que el SERVIDOR ya verificó del JWT (nunca del body) y lo usa
> en lugar de `auth.uid()`; el grant a `authenticated` sobra. Son dos modos EXCLUYENTES — elegir UNO y documentarlo en ESTADO.md.

> La `p_idempotency_key` es la INTENCIÓN del usuario: un uuid que el cliente genera UNA vez y reenvía en cada reintento (nunca `Date.now()`). `generations` necesita una columna `idempotency_key text` (con índice/unique) para enlazar el resultado a la clave. Si la app **no** corre la generación dentro de la RPC (caso común: la IA es una llamada externa lenta que va fuera del request), aplica el patrón de cola + idempotencia de `30-INTEGRACION-IA.md`: la clave reserva, el worker genera, y el reintento ve `status='done'` y devuelve el `result` cacheado.

Alternativas más simples para cuotas: `update user_quota set credits = credits - 1 where user_id = :uid and credits > 0 returning credits` (0 filas = sin saldo), o `insert ... select ... where (select count(*) ...) < 10` (verificación atómica). Para leer-luego-decidir complejo, bloquear con `select ... for update` (cuidado con el orden de bloqueo → deadlocks).

> **`user_quota` lleva `period_start timestamptz not null default now()` — el RESET PEREZOSO del plan free** (estrategia en `02C` → "CÓMO SE RENUEVAN LOS CRÉDITOS"): dentro de esta MISMA RPC, antes del paso (1) de descontar, `update user_quota set credits = <cupo_free>, period_start = now() where user_id = v_uid and now() - period_start > interval '30 days'` — sin cron, atómico con el descuento. El plan pago no usa este reset: sus créditos los renueva el webhook de cobro (18).

> **Pooler transaccional (6543):** las transacciones `begin; ... commit;` multi-sentencia NO son fiables sobre él. Una RPC `security definer` sí (toda la transacción en una sola llamada) — otra razón para preferir RPC sobre `begin/commit` desde la app serverless.

---

## IDEMPOTENCIA — que una operación no se ejecute dos veces

Las redes fallan, los usuarios hacen doble-click, los webhooks se reintentan, y un worker puede morir tras cobrar pero antes de registrarlo. Sin idempotencia, **cobras dos veces o llamas dos veces a la IA**. Toda operación que **cuesta dinero** necesita una clave de idempotencia. La garantía la da Postgres (columna `unique`), no el código.

```sql
create table idempotency_keys (
  key        text primary key,        -- el event_id del proveedor, o un uuid del cliente
  user_id    uuid references auth.users(id) on delete cascade,
  status     text not null default 'processing' check (status in ('processing','done','failed')),
  result     jsonb,                    -- respuesta cacheada para reintentos
  locked_at  timestamptz not null default now()
);

-- Índice parcial para el reclaim de jobs colgados (solo las filas 'processing', que son pocas):
create index idempotency_processing_idx
  on idempotency_keys (status, locked_at) where status = 'processing';

-- "insert-first, then act": reclamar la clave ANTES del trabajo caro.
insert into idempotency_keys (key, user_id) values (:key, :uid)
on conflict (key) do nothing returning key;
-- 1 fila → somos los primeros, procedemos. 0 filas → duplicado: devolver el result cacheado, NO repetir.
```

```
FLUJO: 1) insert 'processing'. 2) trabajo caro. 3) update a 'done' con result. 4) si falla → 'failed'.
RECUPERAR JOB MUERTO: un cron reclama lo colgado en 'processing' > 5 min y RE-FIJA locked_at = now()
  ATÓMICAMENTE en el mismo UPDATE — si no se re-fija, dos workers pueden reclamar el mismo job y el
  reclaim deja de ser fiable. Lo que falla > 1h va a dead-letter ('failed'), no se reintenta en bucle.
CLAVE = la INTENCIÓN del usuario (event_id del proveedor; o un uuid que el cliente genera UNA vez
y reenvía en cada reintento), nunca Date.now(). Para cobros, usar la Idempotency-Key del proveedor.
```

```sql
-- Reclaim ATÓMICO de jobs colgados: selecciona los 'processing' viejos y, en el MISMO UPDATE,
-- re-fija locked_at = now() para que ningún otro worker los tome a la vez. (usa el índice parcial)
update idempotency_keys
   set locked_at = now()
 where key in (
   select key from idempotency_keys
    where status = 'processing' and locked_at < now() - interval '5 minutes'
    for update skip locked            -- dos crons no pelean por la misma fila
   limit 100)
returning key, user_id;               -- estas claves se re-procesan con su payload original
```

Complementa el patrón de colas (`media_jobs`/`pgmq`) de `30-INTEGRACION-IA.md`: la cola mueve el trabajo fuera del request; la idempotencia garantiza que se ejecute **exactamente una vez**.

---

## SNIPPETS CANÓNICOS — copiar tal cual

El doc cita estos patrones pero no los mostraba.

### Trigger `updated_at` (lo que DISEÑO DE ESQUEMA da por hecho)

`updated_at default now()` solo pone la fecha al **crear**. Para que se actualice en cada `UPDATE`:

```sql
create or replace function private.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger posts_set_updated_at before update on posts
  for each row execute function private.set_updated_at();
```

### Función `security definer` en schema `private`

Corre con permisos del owner → puede tocar tablas que el usuario por RLS no podría. Reglas de seguridad **obligatorias**:

```sql
create schema if not exists private;
create or replace function private.user_is_org_member(p_org_id uuid) returns boolean
language sql security definer set search_path = '' stable
as $$ select exists (select 1 from public.memberships
       where org_id = p_org_id and user_id = (select auth.uid())); $$;
revoke execute on function private.user_is_org_member(uuid) from anon, authenticated;
```

```
REGLAS de toda función security definer:
- `set search_path = ''` SIEMPRE (referir tablas con esquema: public.x). Sin esto → escalada de privilegios.
- En un schema `private` no expuesto por la API REST.
- `revoke execute ... from anon, authenticated` salvo que la llames como RPC.
```

---

## RLS DE ALTO RENDIMIENTO (resumen — detalle de seguridad en `09-SEGURIDAD.md`)

> **FUENTE CANÓNICA del patrón RLS.** Este es el patrón de referencia (rendimiento) junto con `09-SEGURIDAD.md` (seguridad). Los demás archivos (`08`, `13`, `24`, `26`, `27`) lo USAN o lo referencian, no lo redefinen. Si el patrón cambia, se actualiza aquí y en `09` — no en seis lugares.

RLS es obligatorio (archivo 09), pero la forma ingenua mata el rendimiento. Dos optimizaciones que dan **100x+** en tablas grandes:

```sql
-- ❌ LENTO: auth.uid() se evalúa UNA VEZ POR FILA (1M filas = 1M llamadas)
create policy "p" on orders for all using ( auth.uid() = user_id );

-- ✅ RÁPIDO: envuelto en subquery, Postgres lo evalúa UNA sola vez y cachea el resultado
create policy "p" on orders for all using ( (select auth.uid()) = user_id );

-- ✅ Y SIEMPRE indexar la columna de la política:
create index orders_user_id_idx on orders(user_id);
```

Para lógica multi-tabla en políticas, mover la lógica a una función `security definer` en un schema `private` y `revoke execute ... from anon, authenticated` (detalle en archivo 09).

---

## MULTITENANCY — `user_id` simple vs. organización + membresía

La pregunta de modelado más importante en apps B2B. Elegir mal se arrastra toda la vida del producto (el esquema es lo más caro de revertir).

```
SOLO user_id  → cada dato pertenece a UNA persona. Apps B2C, herramientas individuales.
                 RLS: (select auth.uid()) = user_id. Es el patrón del resto de este doc.
organization_id + memberships → varias personas comparten datos con roles. Apps B2B, agencias,
                 CRM, equipos. El dato pertenece a una ORGANIZACIÓN; las personas pertenecen a ella.
```

**Cuándo usar org + membresía:** apps de agencia/equipo (p. ej. **Publicz**: una agencia con varios clientes y usuarios), CRMs, "invitar a tu equipo", planes por workspace. Si la app *algún día* tendrá "invita a un compañero", modela multitenancy desde el inicio: meterlo después, con datos reales, es una migración dolorosa.

```sql
create table organizations (id uuid primary key default gen_random_uuid(), name text not null);
create table memberships (
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  primary key (org_id, user_id)
);
create index memberships_user_idx on memberships(user_id);   -- la columna que filtra el RLS

-- Las tablas de datos cuelgan de la ORGANIZACIÓN, no del usuario:
create table posts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  author_id uuid not null references auth.users(id), body text not null
);
create index posts_org_idx on posts(org_id);
```

```sql
-- RLS por pertenencia (y por rol). Subquery envuelta + columna indexada (mismo principio de rendimiento).
create policy "members_read" on posts for select
  using ( org_id in (select org_id from memberships where user_id = (select auth.uid())) );
create policy "admins_delete" on posts for delete
  using ( org_id in (select org_id from memberships
          where user_id = (select auth.uid()) and role in ('owner','admin')) );
```

---

## RLS COMPLETO — matriz de políticas por comando

El error frecuente: una sola política `for all` que parece cubrir todo pero deja huecos —típicamente en `update`, donde `using` y `with check` hacen cosas distintas.

```
using       → filas EXISTENTES que la operación lee/toca (qué puedes VER/borrar/tomar de base).
with check  → valores NUEVOS que se escriben (qué puedes INSERTAR o en qué puede CONVERTIRSE una fila).

INSERT → solo WITH CHECK. DELETE → solo USING. SELECT → solo USING.
UPDATE → AMBOS: USING (qué filas edito) + WITH CHECK (en qué pueden quedar). Omitir el WITH CHECK
         en un UPDATE deja que el usuario "saque" una fila de su propiedad (cambiar user_id/org_id
         a otro). Es el hueco clásico.
```

| Comando | `using` | `with check` |
|---|---|---|
| `select` | ✅ | — |
| `insert` | — | ✅ |
| `update` | ✅ | ✅ |
| `delete` | ✅ | — |

```sql
-- Políticas separadas por comando (más explícito y auditable que un for all):
create policy "select_own" on posts for select using ( (select auth.uid()) = author_id );
create policy "insert_own" on posts for insert with check ( (select auth.uid()) = author_id );
create policy "update_own" on posts for update
  using ( (select auth.uid()) = author_id ) with check ( (select auth.uid()) = author_id );
create policy "delete_own" on posts for delete using ( (select auth.uid()) = author_id );
```

```
ROLES vía auth.jwt(): para roles globales, leer el claim — usar app_metadata (lo controla el backend),
  NUNCA user_metadata (lo edita el usuario → escalada). Para roles por org, preferir la tabla memberships.
SERVICE_ROLE: ignora el RLS (bypassrls). Solo en el servidor (webhooks, jobs). Cuando lo uses, la
  seguridad la pones TÚ: filtrar explícitamente por user_id/org_id. Nunca en el cliente.
RLS EN JOINS: se aplica a CADA tabla por separado. Activar RLS en `posts` NO protege `comments` —
  toda tabla relacionada necesita SUS políticas. Tabla con RLS activo y SIN política = nadie ve nada
  (deny-by-default): si una query "no devuelve nada", sospecha de una política faltante.
```

---

## SUPABASE — buenas prácticas específicas

```
EDGE FUNCTIONS (el BFF — ver archivo 09):
- Aquí viven las claves sensibles (API keys de IA/pagos), nunca en el cliente.
- Validar el JWT del usuario y usar (select auth.uid()) para autorizar; no confiar en IDs del body.
- Limitar tiempo de ejecución y tamaño de payload.

REALTIME:
- Suscribirse solo a lo que la pantalla necesita; RLS también aplica a realtime.
- Desuscribirse al desmontar el componente (fuga de conexiones si no).

STORAGE:
- Políticas de acceso por bucket; URLs firmadas con expiración para contenido privado.
- Validar tipo y tamaño de archivo en el servidor, no solo en el cliente.

ENTORNOS:
- Desarrollo local con `supabase start`; nunca apuntar el MCP ni los experimentos a producción.
- Usar branches/preview para probar migraciones antes de producción.
```

---

## CONNECTION POOLING (resumen — detalle de escala en `13-INFRA-ESCALABILIDAD.md`)

En entornos serverless (Edge Functions, Vercel) cada invocación abre conexiones; sin pooler, Postgres se queda sin conexiones y la app falla bajo carga. Supabase lo resuelve con Supavisor/PgBouncer, pero hay que usar el puerto correcto:

```
- Puerto 6543 (transaction mode) → para serverless / Edge / la app. ROMPE prepared statements,
  SET de sesión, LISTEN y advisory locks — no los uses sobre el pooler transaccional.
- Puerto 5432 (session mode / conexión directa) → para migraciones y tareas administrativas.
```

---

## BACKUPS, RESTORE Y ENTORNOS — lo que te salva el día que algo sale mal

`13-INFRA-ESCALABILIDAD.md` dice "backups automáticos". Aquí el detalle que convierte esa casilla en una garantía real.

```
PITR (Point-In-Time Recovery), no solo el backup diario:
- El backup diario te devuelve al estado de anoche → puedes perder hasta 24h de datos.
- PITR te deja restaurar a CUALQUIER segundo (ej. "justo antes del DELETE de las 14:32").
- ⚠️ El FREE tier de Supabase NO tiene PITR. Producción con datos de clientes necesita Pro + PITR.

RESTORE PROBADO — un backup que nunca restauraste NO es un backup, es una esperanza:
- Al menos una vez ANTES de vender + RE-DRILL trimestral (o tras cambios grandes de esquema),
  anotando el RTO medido en ESTADO.md — el restore que funcionó hace 6 meses puede no funcionar
  hoy (solo el 61% de los restores logra su objetivo — Backblaze 2024; solo ~30% de las
  organizaciones prueba sus backups — Veeam 2023).
- Restaurar en un proyecto/branch aparte y verificar que la app arranca y los datos están
  completos. Documentar el procedimiento (dónde, qué comando, cuánto tarda).

RPO / RTO: RPO = cuántos datos toleras perder (diario=24h, PITR=minutos). RTO = cuánto puede estar
  caída la app mientras restauras (solo lo sabes si hiciste un restore de prueba).
```

```
ENTORNOS: tener un STAGING persistente con datos representativos (anonimizados). El branch efímero
sirve para una PR; staging persistente sirve para probar lo que solo falla con datos reales:
migraciones (¿bloquea?, ¿cuánto tarda el backfill?) y webhooks de pago end-to-end, antes de prod.

OBSERVABILIDAD DE DB: pg_stat_statements (qué query consume el tiempo — Query Performance en el
dashboard); alertas de POOLER saturado y EGRESS cerca del límite (las dos causas de caída/factura
sorpresa a 300-500 usuarios, ver `13`); combinar con Sentry y las alertas de costo de IA.
```

---

## CHECKLIST DE CIERRE — Base de datos

```
ESQUEMA
[ ] Tipos correctos (timestamptz, numeric para dinero, uuid); constraints en la DB
[ ] Toda tabla con RLS activo + política por (select auth.uid())
[ ] created_at/updated_at presentes; on delete decidido a propósito en cada FK

ÍNDICES
[ ] TODA foreign key tiene su índice creado a mano
[ ] Índices compuestos en el orden correcto (igualdad → rango/orden)
[ ] Columna de cada política RLS indexada
[ ] Sin índices de más (revisados los no usados)

MIGRACIONES
[ ] Generadas con `supabase db diff -f <nombre>` (flujo declarativo), no a mano sobre producción
[ ] Advisors sin alertas críticas (dashboard Database → Advisors, o `get_advisors` vía MCP)
[ ] Índices nuevos con CREATE INDEX CONCURRENTLY; columnas NOT NULL vía expand-contract
[ ] Backfills por lotes; nada bloqueante sobre tablas con datos
[ ] Aplicadas en orden local → preview → producción
[ ] Clean-room: proyecto DB vacío se reconstruye solo con migraciones/seed versionados del repo
[ ] README documenta el orden; ninguna tabla/policy/function depende de clics manuales no registrados

RENDIMIENTO
[ ] Queries de listas/dashboards revisadas con EXPLAIN ANALYZE (sin Seq Scan en tablas grandes)
[ ] Sin N+1 en los flujos principales
[ ] RLS en forma de alto rendimiento ((select auth.uid()))
[ ] Serverless usa el pooler transaccional (6543); migraciones usan conexión directa (5432)
[ ] Listas largas / historiales / feeds paginan con KEYSET (cursor), no OFFSET profundo

CORRECTITUD / CONCURRENCIA
[ ] Toda operación que crea+descuenta (cuota, crédito, cobro) es atómica (RPC security definer o
    UPDATE condicional), nunca "SELECT count → decidir en JS → INSERT"
[ ] Operaciones que cuestan dinero (IA, cobros, webhooks) protegidas con idempotency key (unique)
[ ] Jobs largos con estado 'processing' + timeout/reclaim + dead-letter
[ ] RLS con políticas separadas por comando; UPDATE con using Y with check
[ ] Apps B2B/colaborativas: modeladas con org_id + memberships, no user_id suelto
[ ] Trigger updated_at presente en tablas que lo declaran

BACKUPS Y ENTORNOS
[ ] PITR activo en prod (no solo backup diario); free tier advertido como insuficiente
[ ] Restore PROBADO antes de vender + RE-DRILL trimestral (RTO medido anotado en ESTADO.md);
    RPO/RTO conocidos
[ ] Staging persistente; migraciones y webhooks probados ahí antes de prod
[ ] pg_stat_statements revisado; alertas de pooler y egress configuradas
```

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

- **`04-ARQUITECTURA.md`**: ahí se diseña el modelo de datos a nivel producto e indica "verificar límite ANTES de crear" (correcto a nivel UX). La *implementación* correcta bajo concurrencia es la sección TRANSACCIONES Y ATOMICIDAD de este archivo (atómica con la escritura, no un paso separado en JS).
- **`09-SEGURIDAD.md`**: RLS, BFF y secretos. Este archivo profundiza el *rendimiento* de RLS; el 09 cubre su *seguridad*.
- **`13-INFRA-ESCALABILIDAD.md`**: pooling, caché y escala para 500+ usuarios.
- **`12-FLUJO-AGENTICO.md`**: la regla "preguntar antes de tocar el esquema de una DB con datos reales" y la ingeniería de costos.
- **`30-INTEGRACION-IA.md`**: la tabla `media_jobs` (colas de IA) y su RLS siguen el patrón canónico de este archivo.
- **`24-GAMIFICACION.md`**: el estado derivado de racha/XP solo permite SELECT propio; las mutaciones
  pasan por RPC server-side. `using + with check` aplica a tablas que el usuario sí puede editar,
  no concede permiso de escritura sobre recompensas de valor.
