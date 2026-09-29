# SEO TÉCNICO — Que la Landing y el Contenido se Indexen y Rankeen (Next.js App Router)

> **Cuándo cargar este archivo:**
> - Cuando la app tiene landing/contenido público que depende (o dependerá) de tráfico orgánico — junto con `34-ADQUISICION-Y-TRAFICO.md`, que es la ESTRATEGIA de canales y contenido; ESTE es el lado TÉCNICO que hace que ese contenido sea indexable.
> - En la fase de ingeniería del frontend público (junto con `28-INGENIERIA-NEXTJS.md` y `38-PERFORMANCE-BUDGET.md`), al construir rutas de marketing/blog.
> - Si hay multi-locale (`39-INTERNACIONALIZACION.md`): para configurar `hreflang` y canonical por locale.
>
> **Por qué existe:** el `34` decide QUÉ contenido escribir y para qué keywords. Pero un artículo perfecto que Google no puede rastrear, indexar o entender no rankea — factura cero tráfico orgánico. Este archivo es la plomería: metadata, sitemap, robots, datos estructurados, render server-side y `hreflang`. Sin esto, la estrategia de `34` es un coche sin ruedas. **No dupliques `34` (estrategia de keywords/clusters/contenido); aquí es todo implementación con código del App Router.**

---

## 1. CUÁNDO IMPORTA EL SEO TÉCNICO (Y CUÁNDO NO)

El SEO no es para toda la app. Es para lo PÚBLICO. La regla de oro:

```
SÍ se indexa (SEO técnico aplica):
- Landing / home pública (la del archivo 19)
- Blog / artículos de contenido (los clusters del 34)
- Páginas de pricing, features, casos de uso, comparativas — todo lo que vive ANTES del login.

NO se indexa (noindex obligatorio):
- TODO lo que está detrás del login: /app, /dashboard, /settings, /onboarding.
- Endpoints de API: /api/*.
- Páginas de estado de sesión: /checkout, confirmaciones, /thank-you con datos del usuario.
- Resultados de búsqueda interna, filtros con parámetros infinitos (trampa de "crawl budget").
```

**Por qué el orgánico merece la plomería:** es el único canal de adquisición cuyo CAC marginal tiende a $0 y **compone con el tiempo** (ver `34`). Un anuncio deja de traer tráfico el día que dejas de pagar; un artículo que rankea trae visitas gratis durante años. Pero ese activo solo existe si Google puede rastrearlo e indexarlo — y eso es 100% técnico. El SEO técnico es lo que convierte la estrategia de contenido del `34` en tráfico real.

> Si tu app es 100% detrás de login y NO vende por orgánico (solo paid + afiliados), este archivo se reduce a una cosa: poner `noindex` bien (sección 9) y olvidarte del resto. No inviertas en SEO técnico para una app sin superficie pública.

---

## 2. METADATA DINÁMICA (APP ROUTER)

El App Router maneja el `<head>` con la **Metadata API**: exportas un objeto `metadata` (estático) o una función `generateMetadata` (dinámico por ruta). Nunca pongas `<title>`/`<meta>` a mano en el JSX — Next los deduplica y gestiona por ti.

### Metadata base (en `app/layout.tsx`)

```ts
// app/layout.tsx — metadata raíz que heredan todas las rutas
import type { Metadata } from 'next';

export const metadata: Metadata = {
  // metadataBase: OBLIGATORIO para que canonical y OG resuelvan a URLs ABSOLUTAS.
  // Sin esto, Next emite rutas relativas y Google/redes no resuelven la imagen OG.
  metadataBase: new URL('https://tudominio.com'),
  title: {
    default: 'Marca — App de IA que [resultado] para [avatar]',
    template: '%s | Marca',   // cada página rellena %s: "Precios | Marca", "Blog | Marca"
  },
  description: 'La promesa central de ESTADO.md en ≤155 caracteres, con la keyword cabeza.',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'Marca',
    url: 'https://tudominio.com',
  },
  twitter: { card: 'summary_large_image', site: '@marca' },
  // robots por defecto INDEXABLE; las rutas privadas lo sobrescriben a noindex (sección 9).
  robots: { index: true, follow: true },
};
```

### Metadata por ruta dinámica (artículo de blog)

```ts
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next';
import { getPost } from '@/lib/cms';

// Next 15: params es una Promise → await (igual que en 28-INGENIERIA-NEXTJS).
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'No encontrado', robots: { index: false, follow: false } };

  const url = `https://tudominio.com/blog/${slug}`;
  return {
    title: post.seoTitle ?? post.title,               // ≤60 chars: el %s del template
    description: post.excerpt,                          // ≤155 chars, con keyword
    alternates: { canonical: url },                     // canonical → evita contenido duplicado
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url,
      publishedTime: post.publishedAt,
      authors: [post.authorName],
      images: [{ url: post.ogImage ?? '/opengraph-image', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt },
  };
}
```

### OG image generada con `next/og` (cero diseño manual por post)

```tsx
// app/blog/[slug]/opengraph-image.tsx — Next la sirve como /blog/[slug]/opengraph-image
import { ImageResponse } from 'next/og';
import { getPost } from '@/lib/cms';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };  // tamaño OG estándar
export const contentType = 'image/png';

// Next 15: params es una Promise → await (igual que en generateMetadata arriba).
export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return new ImageResponse(
    (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        width: '100%', height: '100%', padding: 80,
        background: 'var(--og-bg, #0b0b0f)', color: '#fff', fontSize: 64,
      }}>
        <div style={{ fontSize: 28, opacity: 0.7 }}>Marca · Blog</div>
        <div style={{ marginTop: 24, lineHeight: 1.1 }}>{post?.title ?? 'Marca'}</div>
      </div>
    ),
    size,
  );
}
```

> **Trampa de texto en imágenes + i18n:** si hay multi-locale (`39`), la OG image NO puede ser un `.png` con texto quemado — saldría en español para el lector pt-BR. Genera la OG con `next/og` leyendo el texto del archivo de mensajes del locale activo. Es el bug "más olvidado" que documenta `39` y `20-ASSETS-VISUALES.md`.

---

## 3. `sitemap.ts` Y `robots.ts` NATIVOS

El App Router genera ambos como archivos de código (no XML/txt a mano). Next los sirve en `/sitemap.xml` y `/robots.txt`.

### `app/sitemap.ts` — dinámico, incluye el contenido de la DB/CMS

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { getAllPostSlugs } from '@/lib/cms';

const BASE = 'https://tudominio.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Rutas estáticas de marketing (las que SÍ se indexan).
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,        changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/precios`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/blog`,    changeFrequency: 'daily',   priority: 0.7 },
  ];

  // Rutas de contenido DESDE la fuente de verdad (DB/CMS) — no a mano.
  const posts = await getAllPostSlugs();   // [{ slug, updatedAt }]
  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.updatedAt,             // lastModified real ayuda al re-crawl
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes];
  // NUNCA listes aquí /app, /dashboard ni /api: el sitemap es la lista de lo INDEXABLE.
}
```

### `app/robots.ts` — permite marketing, bloquea lo privado

```ts
// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/app', '/dashboard', '/api', '/onboarding', '/checkout'],
    },
    sitemap: 'https://tudominio.com/sitemap.xml',  // le dice al bot dónde está el mapa
  };
}
```

> **`robots.txt` NO es `noindex`.** Bloquear una ruta en `robots.txt` impide que Google la RASTREE, pero si alguien la enlaza, Google puede indexar la URL igual (sin contenido, fea en resultados). Para que una página NO aparezca en el índice, usa la **meta `noindex`** (sección 9) — y entonces NO la bloquees en robots, porque el bot necesita rastrearla para LEER el `noindex`. Son mecanismos distintos: robots controla el rastreo, `noindex` controla la indexación.

---

## 4. DATOS ESTRUCTURADOS / SCHEMA.ORG (JSON-LD)

Los datos estructurados le dicen a Google QUÉ es cada página en un formato que entiende → habilita **rich results** (estrellas, precio, FAQ desplegable, breadcrumbs en el resultado). En App Router se inyectan como un `<script type="application/ld+json">` en el Server Component.

```tsx
// components/JsonLd.tsx — helper reutilizable
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify es seguro aquí: los datos vienen de TU servidor/CMS, no de input
      // del usuario. Si algún campo es texto libre del usuario, sanitízalo antes.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

```tsx
// Organization + SoftwareApplication + Offer (precio) — en la landing (app/page.tsx)
import { JsonLd } from '@/components/JsonLd';

export default function Home() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Marca',
        url: 'https://tudominio.com',
        logo: 'https://tudominio.com/logo.png',
        sameAs: ['https://instagram.com/marca', 'https://tiktok.com/@marca'],
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Marca',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: {                                   // el precio → rich result con $
          '@type': 'Offer',
          price: '19.99',
          priceCurrency: 'USD',                     // por mercado: BRL en /pt-BR (ver 39)
        },
        aggregateRating: {                          // SOLO si los reviews son REALES
          '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '127',
        },
      }} />
      {/* ...resto de la landing */}
    </>
  );
}
```

```tsx
// FAQPage — en la sección de preguntas de la landing/artículo
<JsonLd data={{
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
}} />
```

```tsx
// BreadcrumbList — en artículos (Inicio › Blog › Título)
<JsonLd data={{
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://tudominio.com' },
    { '@type': 'ListItem', position: 2, name: 'Blog',   item: 'https://tudominio.com/blog' },
    { '@type': 'ListItem', position: 3, name: post.title, item: `https://tudominio.com/blog/${slug}` },
  ],
}} />
```

> **Regla anti-penalización:** el schema debe describir lo que el usuario REALMENTE ve en la página. Marcar `aggregateRating` con reviews inventados, o `FAQPage` con preguntas que no están visibles, es una violación de las guías de Google y puede ganar una **acción manual** (penalización). El schema amplifica contenido real; no inventa contenido.

---

## 5. RENDER PARA SEO — SSG/ISR, NUNCA SOLO CSR

**El bot de Google NO ejecuta tu JS de forma fiable ni inmediata.** Una página que renderiza su contenido en el cliente (CSR puro — `useEffect` que pide datos y pinta) le llega al bot como un cascarón vacío: sin texto, sin keywords, sin enlaces. El render server-side no es opcional para SEO; es la condición de existencia.

```
POR QUÉ CSR MATA EL SEO:
- El crawler hace dos pasadas: HTML primero, render de JS DESPUÉS (y la 2ª puede tardar días
  o no ocurrir). Si tu contenido solo aparece tras ejecutar JS, el bot indexa una página vacía.
- "En mi navegador se ve" no significa nada: tú ejecutas el JS, el bot puede que no.
- Por eso las páginas de MARKETING y CONTENIDO deben ser SSG (estáticas) o ISR (regeneradas),
  NUNCA un Client Component que pide datos al montar.
```

La buena noticia: el App Router renderiza en el servidor **por defecto** (RSC, ver `28-INGENIERIA-NEXTJS.md`). Para SEO solo tienes que NO sabotearlo: el contenido indexable va en Server Components, no detrás de `'use client'` + fetch en el cliente.

### SSG + ISR para contenido que cambia

```ts
// app/blog/[slug]/page.tsx — estático en build, regenerado cada hora (ISR)
import { getPost, getAllPostSlugs } from '@/lib/cms';
import { notFound } from 'next/navigation';

// Pre-renderiza una página estática por cada slug en build (SSG).
export async function generateStaticParams() {
  const posts = await getAllPostSlugs();
  return posts.map((p) => ({ slug: p.slug }));
}

// ISR: la página se sirve estática pero se regenera en background cada 3600s.
// Contenido nuevo (posts añadidos tras el build) se genera on-demand y se cachea.
export const revalidate = 3600;

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  // El HTML del artículo se renderiza en el SERVIDOR → el bot lo recibe completo.
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
    </article>
  );
}
```

> **Regla:** SSG para lo que no cambia (landing, pricing). ISR (`revalidate`) para lo que cambia sin redeploy (blog desde CMS, listados). CSR (`'use client'` + fetch) SOLO para lo interactivo detrás del login — que de todos modos lleva `noindex`. El contenido que quieres rankear nunca depende de JS del cliente.

---

## 6. CORE WEB VITALS COMO FACTOR DE RANKING

Google usa los Core Web Vitals (LCP, INP, CLS) como señal de ranking: a igualdad de relevancia, la página más rápida gana — y una página lenta pierde al usuario antes de convertir. **Para SEO, el budget de performance ES SEO.**

No se duplican números ni gates aquí. **La fuente única de los umbrales (LCP <2.5s, INP <200ms, CLS <0.1 p75), el GATE en CI (size-limit + Lighthouse CI) y las técnicas para caber está en `38-PERFORMANCE-BUDGET.md`.** Para SEO basta saber:

```
- La landing pública tiene el budget MÁS estricto (JS < 130KB, LCP < 2.0s en 38) justamente
  porque debe convertir en frío Y rankear: es la página que más visita el bot y el usuario nuevo.
- CLS bajo importa doble en contenido: un layout que "salta" mientras se lee espanta y daña la señal.
- El INP se vigila en CAMPO (CrUX/web-vitals), no en laboratorio — igual que para el budget (38).
```

> El "cómo" (RSC, next/image, next/font, code splitting) vive en `28` y `38`. Aquí solo se enlaza: cumplir el budget de `38` es, a la vez, cumplir la señal de Core Web Vitals de Google.

---

## 7. i18n / hreflang (SI HAY MULTI-LOCALE)

Si la app es multi-idioma (`39-INTERNACIONALIZACION.md`), hay que decirle a Google que `/blog/x` y `/pt-BR/blog/x` son **el mismo contenido en otro idioma**, no duplicados que compiten. Eso es `hreflang` + canonical por locale. Si la app es mono-idioma (default del SO), **salta esta sección** — no agregues hreflang "por si acaso".

```ts
// generateMetadata de una ruta localizada — alternates.languages emite los hreflang
import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';   // locales de 39: ['es', 'pt-BR']

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; slug: string }> }
): Promise<Metadata> {
  const { locale, slug } = await params;
  const path = `/blog/${slug}`;
  const BASE = 'https://tudominio.com';

  // 'es' es el default sin prefijo (localePrefix: 'as-needed' en 39); 'pt-BR' va prefijado.
  const urlFor = (loc: string) => loc === 'es' ? `${BASE}${path}` : `${BASE}/${loc}${path}`;

  return {
    alternates: {
      canonical: urlFor(locale),                 // canonical apunta a SU PROPIO locale
      languages: {                               // Next emite <link rel="alternate" hreflang=...>
        es: urlFor('es'),
        'pt-BR': urlFor('pt-BR'),
        'x-default': urlFor('es'),               // fallback para idiomas no cubiertos
      },
    },
  };
}
```

```
REGLAS hreflang (los errores típicos):
- Cada versión apunta a TODAS las versiones (incluida ella misma) y son RECÍPROCAS: si /es
  apunta a /pt-BR, /pt-BR debe apuntar a /es. Sin reciprocidad, Google ignora el hreflang.
- canonical de cada página → A SÍ MISMA en su locale. NO canonical de pt-BR apuntando a es
  (eso le dice a Google "la versión pt no cuenta" → no indexa Brasil).
- x-default: la versión para quien no encaja en ningún idioma listado (default es).
- Los códigos correctos: 'pt-BR' (no 'pt'), 'es' o 'es-MX' según tu segmentación (ver 39).
```

> Esto encaja con el routing `[locale]` y `localePrefix: 'as-needed'` de `39`: el default (es) va sin prefijo y los demás con él. El `hreflang` se deriva de esa misma estructura — no inventes URLs distintas a las del middleware de `39`.

---

## 8. PROGRAMMATIC SEO (AVANZADO) + INTERNAL LINKING

El SEO programático genera muchas páginas long-tail desde una **plantilla** + datos (ej. `/[herramienta]-para/[nicho]` → "generador de captions para nutricionistas", "...para coaches", "...para inmobiliarias"). Es palanca enorme... o spam que Google penaliza. La línea divisoria es **contenido único real**.

```
CUÁNDO SÍ (palanca legítima):
- Cada página resuelve una intención de búsqueda REAL y distinta (hay gente buscando eso).
- Cada página tiene CONTENIDO ÚNICO sustancial: ejemplos del nicho, datos propios, casos —
  no la misma plantilla con la palabra cambiada.
- Escala con sentido: 50 nichos donde de verdad hay demanda, no 5.000 combinaciones automáticas.

CUÁNDO ES SPAM (Google penaliza — "doorway pages" / thin content):
- Páginas idénticas con una palabra reemplazada (thin/duplicado): mismo texto, distinto [nicho].
- Combinaciones sin demanda real ("[herramienta] para [ciudad de 800 habitantes]") → thin a escala.
- Páginas creadas solo para captar la keyword, sin valor para quien aterriza → doorway pages,
  violación explícita de las guías de Google.
```

```ts
// app/[tool]/para/[niche]/page.tsx — programático CON contenido único por combinación
import { getNicheContent, listValidCombos } from '@/lib/pseo';
import { notFound } from 'next/navigation';

// Solo genera las combinaciones VÁLIDAS (con demanda y contenido real), no el producto cartesiano.
export async function generateStaticParams() {
  return listValidCombos();   // curado: combos con búsqueda real, no todas las posibles
}

export const revalidate = 86400;

export default async function ProgrammaticPage(
  { params }: { params: Promise<{ tool: string; niche: string }> }
) {
  const { tool, niche } = await params;
  const data = await getNicheContent(tool, niche);
  if (!data) notFound();   // si no hay contenido único para el combo, 404 — no publiques thin.

  return (
    <article>
      <h1>{data.h1}</h1>
      {/* CONTENIDO ÚNICO real del nicho, no plantilla con la palabra cambiada */}
      <section dangerouslySetInnerHTML={{ __html: data.uniqueBodyHtml }} />
      <RelatedLinks links={data.relatedHubLinks} />   {/* internal linking, ver abajo */}
    </article>
  );
}
```

### Internal linking / hub pages (el lado técnico del pillar + cluster)

El `34` define la estrategia pillar + cluster (1 página pilar + N de soporte). El lado TÉCNICO es el **internal linking** que conecta ese cluster:

```
- La página PILAR (hub) enlaza a cada artículo de soporte; cada soporte enlaza de vuelta al pilar.
  Esa malla de enlaces internos reparte autoridad y le dice a Google de qué trata tu sitio.
- Enlaces con ANCHOR TEXT descriptivo (la keyword del destino), no "click aquí".
- Profundidad ≤3 clicks desde la home a cualquier página indexable (si está más hondo, el bot
  la visita menos). El sitemap (sección 3) ayuda, pero el internal linking es lo que reparte peso.
- <Link> de next/link para navegación interna (prefetch + es un <a> real que el bot sigue).
  NUNCA navegación por onClick+router.push sin <a>: el bot no ve un enlace que no es <a href>.
```

---

## 9. INDEXACIÓN Y MEDICIÓN

### Google Search Console (GSC) — la consola de tu SEO

```
SETUP (manual, la IA guía al dueño igual que con Hotmart en 18/34):
1. search.google.com/search-console → añadir propiedad → verificar DOMINIO (registro DNS TXT;
   verifica todos los subdominios y http/https de una vez. Alternativa: meta tag/archivo HTML).
2. Enviar el sitemap: GSC → Sitemaps → pegar https://tudominio.com/sitemap.xml.
3. Revisar COBERTURA (Páginas): qué está indexado, qué excluido y POR QUÉ
   ("Excluida por noindex", "Rastreada pero no indexada", "Duplicada sin canónica").
4. Inspección de URL: pegar una URL → ver cómo la ve Google → "Solicitar indexación" para
   acelerar el descubrimiento de contenido nuevo.
5. Rendimiento: las queries reales por las que apareces (clics, impresiones, posición) →
   esto alimenta la estrategia de keywords del 34 con datos REALES, no supuestos.
```

### `noindex` correcto en páginas privadas/duplicadas

```ts
// Ruta privada (detrás de login): app/(app)/layout.tsx o por página
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },   // noindex,nofollow → fuera del índice
};
// Recuerda (sección 3): para que el bot LEA este noindex, la ruta NO debe estar
// bloqueada en robots.txt. noindex y disallow no se combinan en la misma URL.
```

### Paginación y parámetros (evitar duplicados y desperdicio de crawl)

```
- Listados paginados (/blog?page=2): cada página tiene su PROPIO canonical (a sí misma), no todas
  apuntando a la página 1 (eso oculta el contenido de las páginas 2+). Google ya no usa
  rel=next/prev, pero el contenido debe ser rastreable vía enlaces reales entre páginas.
- Parámetros de filtro/orden (?sort=, ?utm_=) que generan URLs infinitas con el mismo contenido:
  canonical a la versión limpia (sin parámetros) para que Google no indexe 50 variantes duplicadas.
- Búsqueda interna y filtros facetados: noindex (o bloquear el patrón) — son trampas de crawl budget
  que diluyen tu presupuesto de rastreo en páginas sin valor de búsqueda.
```

---

## 10. ANTI-PATRONES QUE PENALIZAN + CHECKLIST DE CIERRE

```
LO QUE GANA UNA PENALIZACIÓN (acción manual) O TE HUNDE EN EL ALGORITMO:
❌ Contenido DUPLICADO / THIN: la misma plantilla con una palabra cambiada (pSEO mal hecho,
   sección 8), o artículos de 200 palabras que no responden nada. Google premia profundidad real.
❌ KEYWORD STUFFING: repetir la keyword hasta sonar a robot. Escribe para el humano; la keyword
   entra natural en title, H1, primeros párrafos y un par de H2. Densidad forzada = señal de spam.
❌ CLOAKING: mostrarle al bot un contenido y al usuario otro. Violación grave, ban casi seguro.
❌ COMPRAR BACKLINKS / esquemas de enlaces: enlaces pagados o granjas de enlaces. Google los
   detecta y penaliza. Los backlinks se GANAN con contenido que la gente cita (lado del 34).
❌ CONTENIDO JS-ONLY (CSR): el bot no lo ve (sección 5). Server-render lo indexable, siempre.
❌ SCHEMA FALSO: ratings/FAQ inventados que no están en la página (sección 4) → acción manual.
❌ TEXTO OCULTO, redirecciones engañosas, AI-content masivo sin edición ni valor único.
```

```
CHECKLIST SEO TÉCNICO (verificar antes de depender del orgánico)
[ ] metadataBase configurado (URLs OG/canonical absolutas) en el layout raíz
[ ] title.template (%s | Marca) + description por ruta (generateMetadata en dinámicas)
[ ] alternates.canonical en cada página indexable (apuntando a sí misma)
[ ] OG + Twitter cards; opengraph-image.tsx (next/og) — texto por locale si hay i18n
[ ] app/sitemap.ts dinámico (incluye contenido del CMS/DB, NO incluye /app ni /api)
[ ] app/robots.ts: allow marketing, disallow /app /dashboard /api; declara el sitemap
[ ] JSON-LD: Organization + SoftwareApplication/Offer (precio), FAQPage, BreadcrumbList — REALES
[ ] Contenido indexable en SSG/ISR (generateStaticParams + revalidate), NUNCA CSR puro
[ ] Core Web Vitals dentro del budget de 38 (LCP/INP/CLS) — el gate de 38 cubre esto
[ ] hreflang (alternates.languages) + canonical por locale SI multi-idioma (39); recíprocos
[ ] pSEO solo con contenido ÚNICO real por combinación (combos curados, no producto cartesiano)
[ ] Internal linking pillar↔cluster con <Link>/<a> real y anchor descriptivo (≤3 clicks)
[ ] noindex en privadas/duplicadas (y NO bloqueadas en robots para que el bot lea el noindex)
[ ] Paginación/parámetros con canonical correcto (evitar duplicados y trampas de crawl budget)
[ ] Google Search Console: dominio verificado + sitemap enviado + cobertura revisada
[ ] Cero schema falso, keyword stuffing, cloaking, backlinks comprados o contenido thin
```

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

| Archivo | Conexión |
|---|---|
| **`34-ADQUISICION-Y-TRAFICO.md`** | La ESTRATEGIA (qué keywords, clusters pillar+cluster, calendario de contenido). **45 es la PLOMERÍA que hace indexable ese contenido.** No se duplican: 34 decide el qué, 45 ejecuta el cómo técnico. GSC (sección 9) devuelve queries reales que retroalimentan la estrategia del 34. |
| **`28-INGENIERIA-NEXTJS.md`** | Los patrones de render (RSC, generateMetadata, sitemap/robots, SSG/ISR, generateStaticParams, params como Promise en Next 15) que 45 usa para SEO. 28 da el patrón general; 45 lo aplica al objetivo de indexar. |
| **`38-PERFORMANCE-BUDGET.md`** | **Fuente única de los Core Web Vitals y del GATE.** Cumplir el budget de 38 ES cumplir la señal de ranking de Google. 45 no repite números ni gates — enlaza. |
| **`39-INTERNACIONALIZACION.md`** | El routing `[locale]` y `localePrefix: 'as-needed'` de 39 son la base del `hreflang`/canonical por locale (sección 7). La OG image por locale evita el texto quemado que 39 marca como bug. |
| **`19-PAGINA-DE-VENTAS.md`** | La landing pública es la página más indexada y la de budget más estricto. Su contenido (schema Offer, FAQ) alimenta el SEO; su conversión es lo que hace rentable el tráfico orgánico. |
| **`20-ASSETS-VISUALES.md`** | Las OG images con `next/og` siguen la identidad visual de 16/20; el texto va fuera del píxel (capa HTML/SVG) para localizarse. |
| **`36-ANALITICA-Y-EVENTOS.md`** | Los Web Vitals de campo (LCP/INP/CLS reales) que importan para el ranking se reportan a la analítica de 36 (mismo wrapper que en 38). |
| **`08-DEPLOY.md`** | El gate de Lighthouse/size-limit del CI (definido en 38) corre en el `ci.yml` de 08; verificar sitemap/robots tras deploy. |
