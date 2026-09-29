# INTERNACIONALIZACIÓN — i18n y Multi-mercado LATAM (el upside de Brasil)

> **Cuándo cargar este archivo:**
> - En la fase de validación/estrategia (junto con `02-VALIDACION.md` y `01-IDEACION.md`) al decidir a qué mercado(s) se ataca — la decisión de mono vs multi-idioma se toma AQUÍ, no a mitad de la construcción
> - En la fase de arquitectura (junto con `04-ARQUITECTURA.md` y `28-INGENIERIA-NEXTJS.md`) si la decisión fue multi-idioma
> - Siempre que se considere abrir Brasil (pt-BR) o escalar fuera del español
>
> **Por qué existe:** el SO construye por defecto en español LATAM neutro (mono-idioma). Pero el mayor mercado de habla NO española de la región es Brasil — pt-BR es ~60% del mercado no hispanohablante de LATAM y, para muchas categorías, un upside mayor que sumar otro país hispano. i18n mal hecha (strings hardcodeados, concatenación, moneda fija) es deuda que cuesta 5x arreglar después. Bien hecha desde el inicio, abrir Brasil es cambiar archivos de mensajes, no reescribir la app. Este archivo dice CUÁNDO vale la pena y CÓMO hacerlo sin trampas.

---

## LA DECISIÓN: ¿i18n SÍ o NO? (se toma al inicio y se documenta en ESTADO.md)

> **Default del SO = MONO-IDIOMA, español LATAM neutro.** La mayoría de las apps nuevas NO necesitan i18n el día 1: validar en un mercado, vender, y recién entonces escalar. Sumar i18n antes de tener tracción es complejidad sin retorno.

**Cuándo SÍ vale i18n:**
```
✅ Vas a atacar Brasil (pt-BR) — el caso #1. El mercado lo justifica solo.
✅ Tu validación (02, Gate de Demanda) dio señal fuerte en MÁS de un idioma.
✅ La app ya vende bien en español y el siguiente paso natural es escalar a pt-BR.
✅ El nicho es inherentemente internacional (ej. herramienta para freelancers que sirven a clientes globales).
```

**Cuándo NO (quédate mono-idioma):**
```
❌ Estás en MVP / aún validando. Un idioma, un mercado, foco. i18n después.
❌ Tu avatar es 100% hispanohablante de un país concreto. Neutralidad LATAM basta.
❌ "Por si acaso en el futuro" — eso NO es razón. Se añade cuando hay señal real.
```

> **Regla de coherencia con `CLAUDE.md`/`AGENTS.md` (Idioma de UI):** *"decidir al inicio mono-idioma (default español para LATAM) vs multi-idioma (con `next-intl`/i18n). No mezclar idiomas en la UI ni hardcodear textos si se planea más de un idioma. Se documenta en ESTADO.md y no se cambia a mitad."* Este archivo es la implementación de esa regla. La decisión va en ESTADO.md (ver abajo) y es vinculante: no se mezcla español y portugués en la misma UI ni se cambia el modelo a mitad de la construcción.

**Lo que SÍ conviene hacer aunque elijas mono-idioma hoy (i18n-ready barato):**
- NO concatenar strings (regla universal, mono o multi — ver "Trampas").
- Formatear fechas/números/moneda con `Intl`, no a mano (ver abajo). Es buena práctica igual.
- Centralizar los textos visibles (aunque sea un solo archivo `es.json`): migrar a multi-idioma luego es trivial; desenterrar 300 strings hardcodeados, no.

### Ficha de decisión (va en ESTADO.md)
```
IDIOMA DE UI — [Nombre de la App]

Modelo:            [ MONO-idioma (español LATAM neutro)  |  MULTI-idioma ]
Idiomas (si multi): [ es, pt-BR, ... ]   Idioma default/fallback: [ es ]
Mercados objetivo:  [ ej. México + Colombia  |  + Brasil ]
Razón de la decisión: [ej. "validado solo en es, Brasil es fase 2" | "Gate dio señal en es y pt"]
i18n-ready aunque sea mono: [ sí: textos centralizados + Intl para formato ]
Fecha de la decisión: [ ] — NO se cambia a mitad de construcción.
```

---

## IMPLEMENTACIÓN EN NEXT.JS — `next-intl` (la opción por defecto del SO)

Para Next.js App Router, `next-intl` es la librería recomendada: routing por locale, mensajes por archivo, formato con `Intl` integrado, y soporta Server y Client Components. (Alternativas: `next-i18next` para Pages Router, o `react-i18next` standalone si no es Next — pero el SO usa App Router, así que `next-intl`.)

**Principio innegociable: las claves NO se hardcodean.** Cada texto visible vive en un archivo de mensajes por idioma y se referencia por clave. Un string en español dentro de un componente es un bug en una app multi-idioma.

### Estructura de carpetas de traducción
```
/messages
  es.json          ← idioma default / fallback
  pt-BR.json       ← Brasil
/src
  /app
    /[locale]       ← routing por locale: /es/..., /pt-BR/...
      layout.tsx
      page.tsx
  /i18n
    routing.ts      ← locales soportados + default + localePrefix
    request.ts      ← carga los mensajes del locale activo (lo invoca el plugin)
  middleware.ts     ← detecta/redirige al locale (createMiddleware)
next.config.ts      ← envuelto con createNextIntlPlugin('./src/i18n/request.ts')
```

### Mensajes por archivo (claves anidadas, NUNCA texto suelto en el componente)
```json
// messages/es.json
{
  "onboarding": {
    "welcome": "Hola, {name}. Vamos a crear tu plan.",
    "cta": "Empezar mi plan"
  },
  "paywall": {
    "title": "Tu plan para {goal} está listo",
    "guarantee": "30 días o te devolvemos el dinero"
  }
}
```
```json
// messages/pt-BR.json
{
  "onboarding": {
    "welcome": "Olá, {name}. Vamos criar seu plano.",
    "cta": "Começar meu plano"
  },
  "paywall": {
    "title": "Seu plano para {goal} está pronto",
    "guarantee": "30 dias ou devolvemos seu dinheiro"
  }
}
```

### Configuración y uso (snippet)

> **El setup de `next-intl` son CUATRO piezas, no una.** Con solo `routing.ts` la app NO arranca: `useTranslations` lanza error en runtime porque falta el plugin que conecta los mensajes. Los cuatro archivos mínimos son: `routing.ts`, `request.ts`, `middleware.ts` y el plugin en `next.config.ts`. Faltando cualquiera, no compila o revienta al renderizar.

```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'pt-BR'],
  defaultLocale: 'es',          // fallback: si falta una clave en pt-BR, cae a es
  // 'as-needed': el default (es) va SIN prefijo (/onboarding), los demás CON él
  // (/pt-BR/onboarding). Coherente con "español es el default barato": no se
  // ensucia la URL del mercado principal. ('always' forzaría /es/... siempre.)
  localePrefix: 'as-needed',
});
```
```typescript
// src/i18n/request.ts — carga el locale activo y SUS mensajes (lo que el plugin invoca)
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  // valida contra los locales soportados; si no, cae al default
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```
```typescript
// src/middleware.ts — detecta el locale y redirige según routing
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // ignora api, internos de Next/Vercel y archivos con extensión (assets)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```
```typescript
// next.config.ts — el plugin que enchufa request.ts. SIN esto, useTranslations falla en runtime.
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl({
  // ...resto de tu config de Next
});
```
```typescript
// uso en un Server Component
import { getTranslations, setRequestLocale } from 'next-intl/server';

// genera las rutas estáticas (una por locale) → habilita SSG
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Next 15: params es una PROMISE → el componente es async y se hace await.
// Destructurar { params: { locale } } directo (el patrón viejo de Next 14) revienta en Next 15.
export default async function Onboarding({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // OBLIGATORIO al inicio de cada layout/page: sin setRequestLocale la página
  // se vuelve dinámica (render en cada request) y pierdes SSG/performance.
  setRequestLocale(locale);

  // En un componente ASYNC se usa getTranslations (useTranslations es solo
  // para componentes síncronos / de cliente).
  const t = await getTranslations('onboarding');
  const name = 'Ana'; // vendría de tus datos
  return (
    <>
      {/* clave + interpolación de variable — NUNCA concatenar */}
      <h1>{t('welcome', { name })}</h1>
      <button>{t('cta')}</button>
    </>
  );
}
```

> **Coherencia con `28-INGENIERIA-NEXTJS.md`:** el `[locale]` es un segmento dinámico de ruta; el `middleware.ts` que detecta el idioma convive con el resto de middleware (auth, etc.). No duplicar lógica — encadenar.

---

## FORMATO POR LOCALE CON `Intl` — fechas, números y MONEDA (lo crítico en LATAM)

Nunca formatees fechas, números o dinero a mano. El objeto `Intl` (nativo del navegador y de Node) sabe los separadores, símbolos y reglas de cada locale. Hacerlo a mano garantiza bugs: en Brasil el separador de miles es `.` y el decimal es `,` (exactamente al revés que en EE.UU.), y cada moneda tiene su símbolo y su redondeo.

### Las monedas de LATAM (el dato que más se equivoca)
| País | Moneda | Código | Símbolo | Ejemplo (10.000,50) | Notas |
|---|---|---|---|---|---|
| Brasil | Real | BRL | R$ | R$ 10.000,50 | `.` miles, `,` decimal. 2 decimales |
| México | Peso | MXN | $ | $10,000.50 | `,` miles, `.` decimal. 2 decimales |
| Colombia | Peso | COP | $ | $10.000 | sin decimales en la práctica (céntimos no se usan) |
| Argentina | Peso | ARS | $ | $10.000,50 | `.` miles, `,` decimal. Alta inflación → revisar precios seguido |
| Chile | Peso | CLP | $ | $10.000 | SIN decimales (no hay subunidad en uso) |

> **Trampa de redondeo:** COP y CLP en la práctica no usan decimales — `Intl` con `currency: 'CLP'` ya pone 0 decimales automáticamente. NO fuerces 2 decimales globalmente o mostrarás "$10.000,00" raro en Chile. Deja que `Intl` decida por moneda.

### Snippet — formateadores por locale
```typescript
// lib/format.ts
// Mapeo locale → moneda principal de ese mercado (ajustar a tu caso).
const CURRENCY_BY_LOCALE: Record<string, string> = {
  'es-MX': 'MXN', 'es-CO': 'COP', 'es-AR': 'ARS', 'es-CL': 'CLP',
  'pt-BR': 'BRL',
};

export function formatMoney(amount: number, locale: string, currency?: string) {
  const cur = currency ?? CURRENCY_BY_LOCALE[locale] ?? 'USD';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: cur,
    // NO fijar minimumFractionDigits: Intl ya usa 0 para CLP/COP y 2 para BRL/MXN/ARS.
  }).format(amount);
}

export function formatDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(date);
}

export function formatNumber(n: number, locale: string) {
  return new Intl.NumberFormat(locale).format(n);
}

// formatMoney(19.9, 'pt-BR')  → "R$ 19,90"  (ojo: el espacio es NBSP, ver nota abajo)
// formatMoney(199, 'es-CO')   → "$199" (sin decimales, correcto)
// formatDate(new Date(), 'pt-BR') → "19 de junho de 2026"
```

> **NBSP en el símbolo (trampa de tests):** el espacio que `Intl` inserta entre `R$` y el número NO es un espacio normal, es un NBSP (U+00A0). Por eso `"R$ 19,90"` escrito a mano con espacio normal NO es igual al output de `Intl`. Usa el resultado de `Intl` para MOSTRAR, no para comparar strings exactos en tests (`toBe("R$ 19,90")` falla aunque "se vea igual"). Si necesitas comparar, normaliza el NBSP o testea contra el output real.

> **ARS y decimales (única excepción donde el override manual se justifica):** `Intl` con `currency: 'ARS'` da 2 decimales por defecto (es correcto: el peso argentino tiene centavos). Si por la inflación prefieres ocultarlos (mostrar `$10.000` en vez de `$10.000,00`), eso SÍ requiere override manual explícito: `maximumFractionDigits: 0`. Es la única moneda de la tabla donde tocar los decimales a mano tiene sentido; para CLP/COP no hace falta (Intl ya pone 0) y para BRL/MXN no se tocan.

> **El precio de venta NO es solo formato.** Mostrar `R$ 19,90` no es lo mismo que cobrar el equivalente: en Brasil el precio se fija en reales con sensibilidad de mercado local (ver `02-VALIDACION.md` y `40-UNIT-ECONOMICS.md` para el margen por moneda). `Intl` formatea; el pricing por mercado se decide en validación.

---

## es → pt-BR: lo que cambia MÁS ALLÁ de traducir

Traducir es solo el 40% del trabajo. Una app "traducida con Google Translate" se siente extranjera y convierte mal. pt-BR es un mercado, no un diccionario.

### Checklist es → pt-BR
```
TRADUCCIÓN Y TONO
[ ] Traducción nativa (no automática) — pt-BR ≠ pt-PT (Portugal): "tela" no "ecrã",
    "celular" no "telemóvel", "você" no "tu". Brasil tiene su propio portugués.
[ ] Tono: el brasileño de consumo es cálido y cercano (más informal que el pt-PT). Ajustar
    el copy de marketing, no solo la UI.
[ ] Ejemplos y nombres localizados: nombres de personas (João, Maria), ciudades (São Paulo),
    casos de uso del mercado brasileño. Un ejemplo con "Juan de Bogotá" delata que no es para ellos.

MONEDA Y PRECIO
[ ] Precio en R$ (real), formateado con Intl (R$ 19,90), fijado para el poder adquisitivo local
    (no una conversión literal del precio en pesos).
[ ] Total anual en letra chica, $/mês en grande (regla de 02C/19, igual que en es).

MEDIOS DE PAGO (lo más distinto de Brasil)
[ ] PIX: el medio de pago instantáneo dominante en Brasil. Hotmart lo soporta — verificar que
    el producto/checkout lo ofrezca para el mercado BR. Sin PIX, dejas conversión sobre la mesa.
[ ] Boleto bancário: medio tradicional brasileño, todavía relevante. Hotmart lo admite.
[ ] Tarjeta: existe, pero PIX domina en compras digitales. Priorizar PIX en el checkout BR.
[ ] Verificar en el panel de Hotmart qué medios admite el trial en BR (ver 18-VENTA-HOTMART.md).

LEGAL / FORMATO
[ ] Documento fiscal: en Brasil es CPF (no DNI/RFC). Si pides identificación, el campo cambia.
[ ] Fecha en formato BR (dd/mm/aaaa) — ya lo da Intl con locale pt-BR.
[ ] Términos y privacidad acordes a la LGPD (la ley de datos brasileña, análoga al GDPR).

ASSETS
[ ] Textos en imágenes / banners / OG traducidos (ver Trampas — el bug más olvidado).
[ ] Imágenes con personas/contexto que no choquen culturalmente.
```

> **Conexión con Hotmart (`18-VENTA-HOTMART.md`):** para vender en Brasil, el producto de Hotmart se configura con moneda BRL y los medios PIX/boleto habilitados. El flujo de webhook/Resend es el mismo; cambian moneda, idioma del email de bienvenida (pt-BR) y los medios de pago. El `02C-PRICING-Y-MODELO-DE-NEGOCIO.md` ya documenta que mostrar el anual como mensual dio **+45% de ingreso por impresión de paywall EN BRASIL** — el upside de localizar bien pt-BR es medible.

---

## LAS TRAMPAS DE i18n (los bugs que delatan una traducción amateur)

```
❌ CONCATENAR STRINGS para armar frases:
   "Tienes " + count + " mensajes"  →  el orden de palabras cambia entre idiomas y se rompe.
   ✅ Usar interpolación + pluralización del sistema de mensajes:
      t('inbox.count', { count })  con la regla plural definida POR idioma.

❌ IGNORAR LA PLURALIZACIÓN:
   "1 mensajes" / "0 itens". Cada idioma tiene reglas plurales distintas.
   ✅ ICU MessageFormat (next-intl lo soporta):
      "{count, plural, =0 {Sin mensajes} one {# mensaje} other {# mensajes}}"
      Las categorías plurales (zero/one/two/few/many/other) las define CLDR POR IDIOMA:
      es y pt-BR usan solo one/other, pero NO asumir eso para otros idiomas (árabe,
      ruso, polaco tienen few/many). Cada archivo define las formas que su idioma exige.

❌ TEXTO DENTRO DE IMÁGENES / banners / OG images:
   Un banner .png que dice "Empieza gratis" no se traduce. En pt-BR sale en español.
   ✅ Texto como capa HTML/SVG sobre la imagen, o generar OG dinámico por locale
      (next/og con el texto del archivo de mensajes). Ver 20-ASSETS-VISUALES.md.

❌ HARDCODEAR strings en componentes "porque es solo uno".
   Ese "solo uno" se multiplica. Todo texto visible va al archivo de mensajes.

❌ ASUMIR que el texto traducido cabe igual:
   el portugués/alemán suele ser más largo que el español. Botones y cards deben
   tolerar texto más largo sin romper el layout (ver 14-LEYES-DE-DISENO.md).

❌ FECHAS/NÚMEROS/MONEDA formateados a mano:
   "R$ 19.90" (con punto) en Brasil está MAL — es "R$ 19,90". Usar Intl SIEMPRE.

❌ MEZCLAR idiomas en la misma UI (mitad es, mitad pt):
   delata strings olvidados. El fallback al default debe ser consciente, no accidental.
```

---

## CÓMO SE CONECTA

```
02-VALIDACION.md       → la decisión mono/multi y los mercados se toman en validación (Gate de Demanda
                         por mercado). El pricing por moneda se valida ahí, no se inventa al traducir.
02C-PRICING-Y-MODELO.  → mostrar el anual como $/mês es +45% de ingreso EN BRASIL: localizar pt-BR es
                         palanca de revenue, no solo de alcance.
04 / 28-NEXTJS         → routing por [locale], middleware de detección, Server/Client Components.
18-VENTA-HOTMART.md    → producto BR con moneda BRL + PIX/boleto; email de bienvenida en pt-BR.
20-ASSETS-VISUALES.md  → OG images y banners por locale (texto fuera del píxel).
40-UNIT-ECONOMICS.md   → el margen se calcula POR moneda (un precio en R$ con su COGS y comisión BR).
CLAUDE.md / AGENTS.md  → regla de Idioma de UI: la decisión vive en ESTADO.md y no se cambia a mitad.
```

---

## CHECKLIST DE INTERNACIONALIZACIÓN

```
DECISIÓN (al inicio, en ESTADO.md)
[ ] Modelo decidido: mono-idioma (default) vs multi-idioma — con razón y mercados
[ ] Si mono: textos centralizados + Intl para formato (i18n-ready barato)
[ ] La decisión NO se cambia a mitad de construcción

IMPLEMENTACIÓN (si multi)
[ ] next-intl configurado: routing por [locale], default/fallback, middleware
[ ] Mensajes por archivo (es.json, pt-BR.json) — CERO strings hardcodeados
[ ] Claves con interpolación de variables (sin concatenar)
[ ] Pluralización con ICU MessageFormat por idioma
[ ] Fechas/números/moneda con Intl (NUNCA a mano)
[ ] Moneda correcta por mercado (BRL/MXN/COP/ARS/CLP) — decimales que decide Intl

pt-BR (si se ataca Brasil)
[ ] Traducción nativa pt-BR (no automática, no pt-PT)
[ ] Tono y ejemplos localizados al mercado brasileño
[ ] Precio en R$ fijado para el poder adquisitivo local (no conversión literal)
[ ] PIX habilitado en el checkout de Hotmart (+ boleto) para BR
[ ] CPF en vez de DNI/RFC si se pide identificación; LGPD en términos/privacidad
[ ] Email de bienvenida (Resend) en pt-BR
[ ] Textos en imágenes/banners/OG traducidos por locale
[ ] Layout tolera texto más largo sin romperse
```
