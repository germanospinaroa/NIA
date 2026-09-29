# INGENIERÍA NEXT.JS — App Router, RSC, Server Actions y Performance

> **Cuándo cargar este archivo:**
> - Cuando el framework elegido es **Next.js (App Router)** — la decisión Vite vs Next se toma al inicio según `12-FLUJO-AGENTICO.md`
> - Al escribir cualquier componente, fetch de datos o mutación en una app Next.js
> - Antes de optimizar performance (Core Web Vitals)
>
> Si la app es **Vite + React** (herramienta tras login, sin SEO), este archivo casi no aplica — saltar a las secciones de performance y TypeScript.
>
> **Fechado:** escrito contra Next 15/React 19 (verificado jul-2026); los patrones (RSC, `params`/`cookies` async, fetch sin caché por defecto) aplican a majors posteriores (Next 16+) — verificar breaking changes con `npx next info` y las release notes al arrancar un proyecto nuevo.

## Objetivo
Next.js App Router cambió las reglas: Server Components por defecto, Server Actions, una caché con varias capas. El código que parece React "normal" (fetch en `useEffect`, todo `'use client'`) funciona pero desperdicia el framework y mata el performance. Este archivo da los patrones correctos del App Router moderno (Next 15 / React 19).

---

## SERVER COMPONENTS vs CLIENT COMPONENTS — la frontera (lo más importante)

```
REGLA #1 — Todo en app/ es Server Component por DEFECTO.
  Los Server Components corren en el servidor: pueden hacer fetch/DB directo, no mandan su JS
  al cliente (bundle más liviano), y no pueden usar hooks ni eventos del navegador.

REGLA #2 — 'use client' va en la HOJA más baja que lo necesite, no arriba del árbol.
  Solo necesitan ser Client los componentes con: useState/useEffect, onClick/onChange,
  o APIs del navegador (window, localStorage). Marcar como cliente un layout entero arrastra
  todo su subárbol al bundle. Empujar el 'use client' hacia abajo, a la hoja interactiva.

REGLA #3 — Un Client Component NO puede importar un Server Component...
  ...pero SÍ puede recibirlo como children (composición). Este es el patrón clave:
```

```tsx
// ✅ El Server Component se pasa como children al Client Component
// layout.tsx (Server)
<ClientShell>
  <ServerContent />   {/* sigue siendo Server, solo "pasa por" el cliente */}
</ClientShell>

// ✅ Pasar datos async del Server al Client: pasar la Promise y desenvolverla con use()
// page.tsx (Server)
export default function Page() {
  const dataPromise = getData();           // NO await aquí
  return <ClientChart data={dataPromise} />;
}
// ClientChart.tsx (Client)
'use client';
import { use } from 'react';
export function ClientChart({ data }) {
  const resolved = use(data);              // se suspende hasta resolver
}
```

---

## DATA FETCHING EN RSC — sin `useEffect`

El patrón de React clásico (`useEffect` + `fetch` + `useState`) es un **antipatrón** en App Router: causa waterfalls, parpadeo y peor performance. En su lugar, el componente es `async`:

```tsx
// ✅ Server Component async — fetch directo, sin useEffect, sin estado de loading manual
export default async function Page() {
  // En Next 15 fetch NO se cachea por defecto: hay que pedir la caché explícitamente.
  // next: { revalidate: N } = ISR (cachea N segundos). Sin esto, cada request re-pega a la API.
  const data = await fetch('https://api/...', { next: { revalidate: 3600 } }).then(r => r.json());
  return <List items={data} />;
}
```

> **Next 15 — `fetch` ya NO se cachea por defecto** (cambio respecto a Next 14, donde era
> `force-cache` implícito). Hoy hay que hacer opt-in: `cache: 'force-cache'` (cachear indefinido)
> o `next: { revalidate: N }` (ISR). Además, una ruta que use `cookies()`/`headers()`/`searchParams`
> se vuelve **dinámica** y sus fetches no se cachean. No asumas que un fetch sin opciones se cachea solo.

```
REGLAS:
- Fetches independientes EN PARALELO con Promise.all (no await en serie = waterfall):
    const [a, b] = await Promise.all([getA(), getB()]);
- O streaming: envolver cada sección lenta en su propio <Suspense fallback={<Skeleton/>}>
  para que lo rápido pinte ya y lo lento llegue después (mejora LCP percibido).
- Cachear request de datos por-render con React.cache() para deduplicar la misma llamada.
```

### Eliminar waterfalls — el detalle granular

`Promise.all` resuelve el 80% de los waterfalls, pero quedan los sutiles: el `await` que bloquea antes de un chequeo barato, la promesa que se crea tarde, el fetch anidado por item. Reglas finas:

```
1. Chequeos SÍNCRONOS baratos ANTES de cualquier await:
   - Validar params, leer una cookie, decidir un redirect → todo eso es síncrono y barato.
     Hacerlo ANTES de disparar fetches evita pagar la red para luego tirar el resultado.

2. "Init promises early, resolve later" — disparar la promesa arriba, await abajo:
   - No await donde NO necesitas el dato todavía. Crea la promesa (sin await) lo antes
     posible y desenvuélvela recién en el punto donde de verdad la usas.

3. Fetches anidados (B depende de A) → encadénalos DENTRO del Promise.all por item:
   - Si tienes N items y cada uno necesita A→B, no hagas todos los A y luego todos los B
     (dos rondas seriales). Mapea cada item a su cadena A→B y resuelve las N cadenas en
     paralelo. La latencia total es la de UNA cadena, no la suma.

4. after() para trabajo NO bloqueante post-respuesta:
   - Logging, analítica, warming de caché, side-effects que el usuario no espera → fuera
     del camino crítico de la respuesta. La respuesta sale; el trabajo corre después.

5. React.cache() para dedup por-request:
   - Si tres componentes del mismo render piden getUser(), envuélvelo en cache() y la
     función corre UNA vez por request. Sin esto, cada llamada vuelve a pegar.
```

```tsx
// ❌ Waterfall sutil: await bloqueante antes de un chequeo barato + promesas creadas tarde
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();              // (1) ¿y si el id es inválido? pagaste el fetch en vano
  const { id } = await params;
  if (!id) notFound();                       // chequeo barato DESPUÉS del fetch caro
  const post = await getPost(id);            // serie con getUser, aunque son independientes
  return <Post post={post} author={user} />;
}

// ✅ Chequeos síncronos primero; promesas disparadas temprano; resolución en paralelo
import { after } from 'next/server';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;               // barato y síncrono-ish; va primero
  if (!id) notFound();                       // descartar antes de tocar la red

  const userP = getUser();                   // init early: dispara, NO await
  const postP = getPost(id);                 // dispara en paralelo
  const [user, post] = await Promise.all([userP, postP]);

  after(() => logView(id, user.id));         // (4) post-respuesta, fuera del camino crítico
  return <Post post={post} author={user} />;
}

// ✅ Fetches anidados por item (A→B) resueltos en paralelo, no en dos rondas seriales
const items = await Promise.all(
  ids.map(async (id) => {
    const base = await getItem(id);          // A
    const detail = await getDetail(base.ref); // B depende de A — encadenado DENTRO del map
    return { ...base, detail };
  }),
);                                            // N cadenas A→B en paralelo: latencia ≈ 1 cadena
```

```tsx
// React.cache() — dedup de la MISMA llamada en un render (no es caché entre requests)
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;                               // se ejecuta UNA vez por request, aunque la llamen
});                                           // el layout, la page y tres componentes a la vez
```

> `after()` (Next 15, estable) es para efectos que el usuario NO espera (analítica, logs, warming).
> NO lo uses para mutaciones cuya consistencia importe: corre tras enviar la respuesta y no
> bloquea, así que su fallo es silencioso. Para mutar con garantías, hazlo en el camino crítico.

---

## ANTIPATRONES (corregir siempre)

| ❌ Antipatrón | ✅ Correcto |
|---|---|
| `useEffect` + `fetch` + `useState` para cargar datos | Server Component `async` con `await fetch(...)` |
| `await a; await b; await c;` (serie) | `Promise.all([a, b, c])` o `<Suspense>` por sección |
| `'use client'` en el layout / arriba del árbol | `'use client'` solo en la hoja interactiva |
| Crear un API route solo para que el cliente lo llame | Fetch directo en el Server Component (o Server Action para mutar) |
| Server Action que retorna datos a un `<form action>` | La form action retorna void; usar `useActionState` para feedback |
| `<img>` crudo / fuente cargada por `<link>` | `next/image` con `priority` + `sizes`; `next/font` |

---

## SERVER ACTIONS — mutaciones, no fetching

```
- 'use server' a nivel de archivo = todas las exports son acciones; a nivel de función = solo esa.
- Las Server Actions son SOLO para MUTACIONES (crear/editar/borrar). Para LEER datos, usar
  Server Components async. No usar una Server Action como si fuera un endpoint de lectura.
- Una Server Action usada como `<form action={fn}>` DEBE retornar void:
    - para errores → lanzar (throw) y manejar con error boundary
    - para feedback (mensajes, validación) → useActionState
- Tras mutar: revalidar (revalidateTag/revalidatePath) o redirect() — desde el servidor.
- Validar SIEMPRE el input de la acción en el servidor (zod en el borde), aunque el form ya valide.
- AUTH/AUTHZ OBLIGATORIO — una Server Action es un endpoint PÚBLICO (su id queda en el bundle y
  cualquiera puede invocarla con un POST). TODA acción que muta datos o gasta IA DEBE empezar
  validando: (1) sesión con getUser(); (2) plan/límite de uso. ANTES de tocar la DB o llamar a la IA.
  RLS NO basta: protege filas, pero no frena que un usuario logueado gaste tu cuota de IA ni cubre
  efectos fuera de Postgres (pagar tokens, mandar emails). El BFF que autoriza está en 09-SEGURIDAD.
```

```tsx
// Servidor
'use server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
const Schema = z.object({ title: z.string().min(1).max(200) });

export async function createPost(prev, formData: FormData) {
  // 1. AUTH: ¿hay sesión? — una Server Action es un endpoint público, esto va PRIMERO
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. AUTHZ / límite: ¿el plan permite esta acción? (gastar IA, crear más, etc.)
  const { data: profile } = await supabase
    .from('profiles').select('plan, usage_today').eq('id', user.id).single();
  if (profile?.plan === 'free' && (profile?.usage_today ?? 0) >= FREE_LIMIT) {
    return { error: 'Alcanzaste el límite gratuito' };
  }

  // 3. Recién ahora: validar input y mutar
  const parsed = Schema.safeParse({ title: formData.get('title') });
  if (!parsed.success) return { error: 'Título inválido' };   // feedback vía useActionState
  // ... insertar (RLS con (select auth.uid()) es la SEGUNDA capa, no la única) ...
  revalidatePath('/posts');
  return { ok: true };
}

// Cliente
'use client';
const [state, action, pending] = useActionState(createPost, {});
// <form action={action}> ... {state.error && <p>{state.error}</p>}
```

**Patrón cookie en dos archivos:** las cookies se leen/escriben en el servidor; el `onClick` del cliente llama a una Server Action que usa `cookies()`. No intentar tocar cookies httpOnly desde el cliente.

---

## CACHÉ Y APIs ASYNC DE NEXT 15

```
FETCH (Next 15 — sin opciones NO se cachea; el opt-in es explícito):
- fetch(url)                               → NO cacheado por defecto (≠ Next 14): re-pega cada vez
- fetch(url, { cache: 'force-cache' })     → cachea de forma estática (opt-in explícito)
- fetch(url, { next: { revalidate: N } })  → ISR: cachea y regenera cada N segundos
- fetch(url, { cache: 'no-store' })        → siempre fresco (datos por-usuario, dashboards)
- Nota: si la ruta usa cookies()/headers()/searchParams se vuelve dinámica y nada se cachea.

'use cache' (Next 15):
- ⚠️ REQUIERE HABILITARLO: en Next 15, `experimental.useCache` (o `dynamicIO`) en next.config;
  en Next 16, `cacheComponents: true` — sigue siendo opt-in. Sin el flag, el build FALLA
  al encontrar la directiva.
- La función cacheada debe ser async y llevar la directiva 'use cache' en la PRIMERA línea.
- cacheLife('hours' | 'days' | ...) controla cuánto vive; cacheTag('posts') la etiqueta.
- Invalidar con revalidateTag('posts') / revalidatePath('/ruta') tras una mutación.
- NO leer cookies()/headers() dentro de un scope 'use cache' (son por-request): leerlas afuera
  y pasar los valores como argumentos.

APIs ASYNC (Next 15 — cambio que rompe código viejo):
- params, searchParams, cookies(), headers() ahora son ASYNC → hay que await:
    const { id } = await params;
    const cookieStore = await cookies();

useSearchParams (cliente):
- Requiere 'use client' Y estar envuelto en <Suspense> (si no, error de build / CSR bailout).
```

---

## ARCHIVOS ESPECIALES DEL APP ROUTER

El App Router reconoce nombres de archivo por convención dentro de cada carpeta de ruta. Usarlos en vez de armar tu propio manejo de loading/error:

```
- loading.tsx       → UI de carga de ese segmento. Next la muestra como fallback de <Suspense>
                      automáticamente mientras el Server Component async resuelve. (Skeletons del 15.)
- error.tsx         → error boundary del segmento. DEBE ser 'use client' y recibe { error, reset }.
                      Captura errores de render/data de ESE subárbol sin tumbar toda la app.
- not-found.tsx     → UI para 404. Se dispara con notFound() o cuando una ruta no existe.
- global-error.tsx  → error boundary de último recurso para el root layout. 'use client'; reemplaza
                      <html>/<body> (el layout falló). Es donde reportar a Sentry los errores de root.
```

---

## STATE MANAGEMENT E INTEGRACIÓN CON RSC

```
- Datos de SERVIDOR (de la DB / API) = se cargan en RSC async y bajan como props. NO meterlos en
  un store de cliente "porque sí": duplicar el estado del servidor en el cliente es el antipatrón.
- TanStack Query / Zustand / Context son SOLO para estado de CLIENTE (UI: modales abiertos, tabs,
  formularios optimistas, carrito en memoria). No para reemplazar el fetch del servidor.
- Los stores y providers viven en un componente 'use client' colocado lo MÁS ABAJO posible del árbol
  (envolver solo el subárbol que de verdad usa ese estado), no en el root layout — así no arrastras
  todo al bundle de cliente ni rompes el render en servidor de lo que no lo necesita.
- TanStack Query encaja para datos de cliente que se refrescan/mutan mucho; para lo demás, RSC + revalidate.
```

---

## OPTIMIZACIÓN DE RE-RENDER (INP) — el "cómo" del INP <200ms

El INP (Interaction to Next Paint, gate del 38) se gana o se pierde en el render del cliente: cada keystroke, cada toggle dispara un re-render, y si ese render hace trabajo de más, el frame se atrasa y el input se siente trabado — sobre todo en el Android de gama media LATAM (CPU 4x más lenta). Las reglas:

```
1. ESTADO DERIVADO EN RENDER, no en useEffect:
   - Si un valor se calcula a partir de props/estado, calcúlalo en el cuerpo del render
     (o con useMemo si es caro). Sincronizarlo con un useEffect + setState dispara un
     SEGUNDO render por interacción (render → effect → setState → render) y mete bugs de
     desfase. El effect-para-derivar-estado es un antipatrón (lo dice la doc de React).

2. useDeferredValue / startTransition para mantener el input responsivo:
   - Cuando un keystroke debe actualizar algo CARO (lista filtrada de 1000 items), separa
     lo urgente (el input se pinta ya) de lo no urgente (la lista se recalcula "cuando se
     pueda"). useDeferredValue(query) o startTransition(() => setFiltro(...)).

3. INPUTS NO CONTROLADOS por defecto:
   - Un <input> controlado re-renderiza en CADA tecla. Si el valor solo importa al enviar,
     usa no controlado (defaultValue + ref / FormData). Si DEBE ser controlado, que el
     render por keystroke sea BARATO (no recalcular media pantalla en cada letra).

4. LAZY INIT de useState para cómputo inicial caro:
   - useState(() => parsearAlgoCaro(props)) corre la función UNA vez. useState(parsearAlgoCaro(props))
     la ejecuta en CADA render y tira el resultado (solo el primero cuenta). El () => importa.

5. SUSCRIBIRSE A BOOLEANOS DERIVADOS, no a valores crudos:
   - Un componente que solo necesita saber "¿hay items?" no debe suscribirse a la lista entera
     (re-render con cada cambio de la lista). Derivar el booleano (items.length > 0) en el
     selector y suscribirse a ESO → re-render solo cuando el booleano cambia. (selectors de
     Zustand, useSyncExternalStore con selector.)
```

```tsx
// ❌ Estado derivado en effect: doble render por interacción + posible desfase
function Filtro({ items }: { items: Item[] }) {
  const [q, setQ] = useState('');
  const [visibles, setVisibles] = useState(items);
  useEffect(() => { setVisibles(items.filter((i) => i.nombre.includes(q))); }, [q, items]); // ❌
  return <><input value={q} onChange={(e) => setQ(e.target.value)} /><List items={visibles} /></>;
}

// ✅ Derivar en render (useMemo) + diferir lo caro para que el input no se trabe
import { useMemo, useDeferredValue, useState } from 'react';
function Filtro({ items }: { items: Item[] }) {
  const [q, setQ] = useState('');
  const qDiferido = useDeferredValue(q);                    // el input pinta YA; el filtro va detrás
  const visibles = useMemo(                                 // derivado EN render, no en effect
    () => items.filter((i) => i.nombre.includes(qDiferido)),
    [items, qDiferido],
  );
  return <><input value={q} onChange={(e) => setQ(e.target.value)} /><List items={visibles} /></>;
}

// ✅ Lazy init (la función corre una sola vez) + suscripción a un booleano derivado
const [doc] = useState(() => parsearMarkdownCaro(props.fuente)); // () => : una vez, no por render
const hayItems = useStore((s) => s.items.length > 0);            // re-render solo si cambia el bool
```

> Esto es la contracara cliente del INP: el 38 pone el gate (<200ms p75 de campo) y el 28 da
> los patrones de render que lo cumplen en el dispositivo lento. Para animaciones que también
> tiran frames, ver la regla de transform/opacity del 38 y el detalle en 41-CRAFT-DE-ANIMACION.

---

## PATRONES DE COMPOSICIÓN DE COMPONENTES — extensibilidad = vendibilidad

Un componente que crece a base de `boolean props` (`<Button primary loading disabled large icon />`) se pudre: cada flag nuevo multiplica las combinaciones posibles, muchas no tienen sentido (`primary` + `ghost`?), y el `if` interno se vuelve ilegible. El comprador que recibe la app no podrá extenderla sin tocar el núcleo. La composición correcta hace lo opuesto: el componente expone piezas, el usuario las arma.

```
OLORES (corregir):
- <Button primary loading disabled size="lg"> → combinatoria de booleanos: estados imposibles
  representables, lógica condicional que crece sin techo.
- Prop que cambia el COMPORTAMIENTO entero (un bool que bifurca dos componentes distintos
  disfrazados de uno) → son dos componentes; sepáralos.
- render props para todo (<List renderItem={...} renderEmpty={...}>) cuando children bastaría.

PATRONES CORRECTOS:
- VARIANTES EXPLÍCITAS, no booleanos: variant="primary" | "ghost" | "danger" (una opción,
  mutuamente excluyente) en vez de tres bools que pueden contradecirse. (cva/tailwind-variants
  + shadcn/ui ya modelan esto: una sola fuente de variantes tipada.)
- COMPOUND COMPONENTS con contexto compartido: el padre provee estado por contexto; los hijos
  lo consumen. El usuario compone el layout que quiera sin que el padre conozca su estructura.
- children > render props: pasar JSX como children es más legible y componible que una función.
  Render props SOLO cuando el hijo necesita datos que el padre calcula (raro).
- React 19: consumir contexto con use(Ctx), no useContext(Ctx). use() puede ir condicionalmente
  y es la API que React 19 empuja.
```

```tsx
// ❌ Combinatoria de booleanos: ¿qué pasa con loading + disabled + ghost + danger a la vez?
<Button primary large loading disabled icon={<X />} />

// ✅ Variante explícita (una opción) + estado acotado. shadcn/ui + cva modelan esto de fábrica.
<Button variant="danger" size="lg" disabled>Borrar</Button>
```

```tsx
// ✅ COMPOUND COMPONENT: el padre comparte estado por contexto; los hijos lo arman libremente.
'use client';
import { createContext, use, useState, type ReactNode } from 'react';

interface DisclosureCtx { open: boolean; toggle: () => void }
const Ctx = createContext<DisclosureCtx | null>(null);

function useDisclosure() {
  const ctx = use(Ctx);                       // React 19: use() en vez de useContext()
  if (!ctx) throw new Error('Disclosure.* debe ir dentro de <Disclosure.Root>');
  return ctx;
}

function Root({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <Ctx value={{ open, toggle: () => setOpen((o) => !o) }}>{children}</Ctx>;
}
function Trigger({ children }: { children: ReactNode }) {
  const { toggle, open } = useDisclosure();
  return <button onClick={toggle} aria-expanded={open}>{children}</button>;
}
function Panel({ children }: { children: ReactNode }) {
  const { open } = useDisclosure();
  return open ? <div role="region">{children}</div> : null;
}

export const Disclosure = { Root, Trigger, Panel };

// Uso — el consumidor compone el orden/layout SIN que Root conozca su estructura interna:
// <Disclosure.Root>
//   <Disclosure.Trigger>Ver detalles</Disclosure.Trigger>
//   <Disclosure.Panel>...contenido libre, cualquier markup...</Disclosure.Panel>
// </Disclosure.Root>
```

> Esto casa con shadcn/ui (que el SO ya usa): sus componentes son código que VIVE en tu repo,
> compuestos con Radix (compound + slots) y variantes con cva. Extenderlos es editar piezas, no
> pelear con props. Una app así la puede crecer el comprador → mantenibilidad = vendibilidad.

---

## PERFORMANCE / CORE WEB VITALS (métrica-gate antes de vender)

Los Core Web Vitals son medibles y son señal de ranking en Google. Objetivos (medidos en campo, percentil 75):

```
LCP (Largest Contentful Paint)  < 2.5 s    → qué tan rápido pinta el contenido principal
INP (Interaction to Next Paint) < 200 ms   → qué tan rápido responde a la interacción (reemplazó FID)
CLS (Cumulative Layout Shift)   < 0.1      → cuánto "salta" el layout al cargar
```

```
CÓMO LLEGAR A ESOS NÚMEROS:
- LCP: next/image con priority en la imagen candidata a LCP (hero) + sizes correcto;
  next/font (auto-host + preload, cero parpadeo de fuente); evitar bloquear el render con JS.
- INP: minimizar JS del cliente (RSC ayuda); startTransition/useDeferredValue para updates pesados;
  no bloquear el hilo con cálculos en el render.
- CLS: dimensiones explícitas en imágenes/media (next/image las maneja); reservar espacio para
  contenido async (skeletons del archivo 15); no inyectar banners que empujen el layout.
- SEO: generateMetadata (await params) + metadataBase configurado; sitemap y robots.
```

Verificar con Lighthouse / PageSpeed Insights / el reporte de Vercel Analytics antes del release. CLS=0 es alcanzable y el skeleton-screen del archivo 15 ya lo favorece.

**Caché de CDN (egress y latencia a escala — no basta "Vercel sirve por CDN"):**
```
- Semi-estático (landing, listados públicos, assets): Cache-Control con s-maxage + stale-while-revalidate
  → se sirve desde el edge sin re-pegarle al servidor/DB.
- Salidas de IA públicas y cacheables (no por-usuario): servirlas cacheadas desde el edge en vez de
  regenerar/re-consultar la DB en cada visita → baja el egress de Supabase (cuello a 300-500 usuarios, ver 13).
- Contenido por-usuario o privado: NO cachear en CDN (Cache-Control: private / no-store).
```

---

## TYPESCRIPT — disciplina que evita bugs (aplica a Vite y Next)

```
- Validar en los BORDES con zod: todo lo que entra de fuera (formData, body de API, params,
  respuesta de IA, webhooks) se parsea y valida antes de tocar la lógica. Adentro, tipos confiables.
- Aceptar dependencias, no crearlas dentro: inyectar el cliente/servicio como parámetro hace
  la función testeable y pura. Retornar resultados, no producir efectos secundarios escondidos.
- Discriminated unions para estados (loading/success/error) en vez de booleanos sueltos que
  permiten estados imposibles.
- Probar la interfaz pública del módulo, no sus internals; cortar en slices verticales.
```

---

## CHECKLIST DE CIERRE — Ingeniería Next.js

```
RSC / FRONTERA
[ ] Componentes son Server por defecto; 'use client' solo en hojas interactivas
[ ] Sin fetch en useEffect (datos en Server Components async)
[ ] Fetches independientes en Promise.all o cada uno tras su <Suspense>

SERVER ACTIONS
[ ] Toda acción que muta o gasta IA valida sesión (getUser) + plan/límite ANTES de actuar (es endpoint público)
[ ] Acciones solo para mutaciones; lecturas en Server Components
[ ] Form actions retornan void; feedback con useActionState; input validado con zod en servidor
[ ] Revalidación (revalidateTag/Path) o redirect tras mutar

CACHÉ / NEXT 15
[ ] revalidate/no-store decididos a propósito por cada fetch
[ ] params/searchParams/cookies()/headers() con await (Next 15)
[ ] useSearchParams envuelto en <Suspense>

PERFORMANCE
[ ] LCP <2.5s, INP <200ms, CLS <0.1 (p75) verificados con Lighthouse/PSI
[ ] next/image (priority+sizes en el hero) y next/font en uso
[ ] Metadata/SEO con generateMetadata + metadataBase
```

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

- **`12-FLUJO-AGENTICO.md`**: ahí se decide Vite vs Next.js (no cambiar a mitad). Este archivo es el "cómo" cuando es Next.
- **`05-CREACION.md`**: los patrones de generación de código incorporan estos antipatrones como reglas.
- **`09-SEGURIDAD.md`**: el BFF en Next son los Route Handlers / Server Actions; las claves viven ahí.
- **`13-INFRA-ESCALABILIDAD.md`**: caché, streaming de tareas largas y CDN para escalar.
