# ASSETS VISUALES — Qué Imágenes Necesita la App y Cómo Generarlas

> **Cuándo cargar este archivo:**
> - Cuando la app o la página de ventas necesitan elementos visuales (logo, favicon, imágenes)
> - Junto con `16-DIRECCION-DE-ARTE.md` (los assets deben seguir la dirección de arte)
>
> **Regla:** la IA no puede generar imágenes de marca por sí misma dentro del flujo de código. Cuando llegue el momento, debe DECIRLE al usuario exactamente qué imágenes generar, con qué herramienta, y con qué prompt — y mientras tanto, dejar placeholders limpios para no bloquear el desarrollo.

---

## QUÉ ASSETS NECESITA TODA APP (lista de verificación)

```
OBLIGATORIOS
[ ] Favicon (el ícono de la pestaña del navegador) — 512x512px, fondo sólido o transparente
[ ] Logo del producto (para header de la app y de la landing) — versión horizontal + ícono solo
[ ] Open Graph image (la preview al compartir el link en redes/WhatsApp) — 1200x630px

SEGÚN LA APP / LANDING
[ ] Imagen/screenshot del producto para el hero de la página de ventas
[ ] Ilustraciones o íconos custom para los bloques de beneficios (si el set de Lucide no basta)
[ ] Imágenes dentro de la app (avatares por defecto, estados vacíos ilustrados, banners)
[ ] Imágenes de fondo o texturas (solo si la dirección de arte las pide)
```

**Regla de mínimos:** no inflar. Para íconos de interfaz, usar Lucide React (ya disponible, gratis, cohesivo) — NO generar imágenes para eso. Generar imágenes solo para: logo, favicon, OG image, hero del producto, e ilustraciones de marca puntuales.

---

## RECETAS DE PROMPTS DESDE FICHA-ARTE.md

**Regla madre: NINGÚN asset se genera con un prompt genérico.** "Logo moderno para app de fitness" produce el mismo clipart que las IAs le producen a todo el mundo. Todo prompt de imagen se COMPONE desde la ficha del proyecto: la paleta exacta (los hex, no "azul"), el mood (los 3 adjetivos del 11), el estilo de ilustración/foto de la dirección elegida (A/B/C del 54), y la MISMA receta base entre assets — para que todos salgan de una familia, no de un collage.

### La plantilla de prompt base (rellenar desde FICHA-ARTE.md)

```
"[TIPO DE ASSET] para una app de [NICHO/qué hace], estilo [DIRECCIÓN de la ficha — ej. 'flat
geométrico editorial' / 'foto cálida con grano'], paleta EXACTA: [hex del acento], [hex de
superficie], [hex de texto secundario]. Mood: [los 3 adjetivos de la ficha]. Fondo
[transparente / hex del brand]. Sin texto embebido. Alta calidad, composición simple."
```

Variaciones por asset (la receta base NO cambia; solo se agrega la línea del asset):
- **Logo / ícono de marca:** "+ símbolo simple y memorable, legible a 16px, plano, sin sombras 3D, sin degradés. Sin texto, solo el ícono."
- **Favicon:** derivarlo del logo — versión cuadrada 512x512, fondo sólido del color de marca o transparente.
- **OG image 1200×630:** "+ el headline '[promesa principal de la landing]' grande y legible, el símbolo del logo, jerarquía de UN solo mensaje." (Excepción a "sin texto embebido": la OG lo lleva.)
- **Visual del hero de la landing:** "+ mockup del producto en un teléfono, ángulo frontal ligero, mostrando [pantalla principal]." — SIEMPRE preferir un screenshot real con datos semilla (32/19): convierte más que cualquier imagen generada.
- **Ilustraciones de la serie:** usar el prompt PARAMETRIZADO del "SISTEMA DE ILUSTRACIÓN IN-APP" (abajo) — misma receta base, solo cambia el [SUJETO].

### EL PACK MÍNIMO (checklist con specs)

```
[ ] Logo (SVG, versión horizontal + ícono solo) + favicon 512×512 (specs de la lista de arriba)
[ ] OG image 1200×630 con el headline de la landing (sin ella, el link se ve roto en WhatsApp)
[ ] Visual del hero de la landing — screenshot real con datos semilla (32) o, hasta tenerlo,
    placeholder digno (nunca clipart)
[ ] 2-4 ilustraciones de la MISMA serie: empty states de las secciones principales + la pantalla
    de reconocimiento del onboarding — receta base compartida (sistema de ilustración, abajo)
[ ] Mascota con sus 5 estados SOLO si la app la lleva → pipeline del 11 (puntero, no duplicar)
[ ] Share card template → 56 (M7): mismo brand kit, pensada para verse bien en el feed
```

### Regla de coherencia (por qué el pack se genera de UNA vez)

```
- TODOS los assets se generan en UNA misma sesión con la MISMA receta base: la consistencia
  muere si se generan en días distintos con prompts sueltos (cada uno sale de un estilo).
- Las recetas usadas (el prompt final de cada asset) se GUARDAN en FICHA-ARTE.md o ESTADO.md:
  cuando haya que regenerar o sumar un asset en 3 meses, se parte de la receta, no de memoria.
```

### Herramientas (en orden de preferencia)

1. **El generador de imágenes que el usuario YA tiene** (ChatGPT con imágenes, Gemini): la IA le entrega los prompts compuestos, listos para pegar. Para logos/íconos más afinados, Ideogram o Recraft son mejores — pero con lo que ya tiene alcanza.
2. **Sin ningún generador → fallbacks honestos** (nunca clipart genérico): ilustración CSS/SVG construida con la dirección del 54, foto stock CON el tratamiento del brand (duotone del 54 — nunca la foto cruda), o el placeholder digno de la sección de placeholders de abajo.

---

## PLACEHOLDERS MIENTRAS TANTO (no bloquear el desarrollo)

Mientras el usuario genera las imágenes, la IA deja placeholders limpios y profesionales, NUNCA cuadros grises rotos:

```tsx
{/* PLACEHOLDER LOGO — reemplazar con el logo generado en /public/logo.svg */}
<div className="flex items-center gap-2">
  <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)] flex items-center
       justify-center text-white font-bold text-lg">
    {/* Inicial del nombre como placeholder elegante */}
    K
  </div>
  <span className="font-bold text-lg">[Nombre App]</span>
</div>

{/* PLACEHOLDER IMAGEN — reemplazar con [descripción]. Tamaño: [WxH]px */}
<div className="aspect-video rounded-2xl bg-gradient-to-br
     from-[var(--brand-primary-soft)] to-[var(--surface-tertiary)]
     flex items-center justify-center">
  <span className="text-[var(--text-tertiary)] text-sm">
    Imagen del producto (pendiente)
  </span>
</div>
```

**Favicon temporal con SVG inline** (funciona ya, se reemplaza después):
```html
<link rel="icon" href="data:image/svg+xml,
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23[COLOR]'/>
    <text x='50' y='68' font-size='60' font-weight='bold' fill='white'
      text-anchor='middle' font-family='system-ui'>[INICIAL]</text>
  </svg>" />
```

---

## PROTOCOLO DE ACTIVOS DE MARCA (la regla que separa una demo IA de algo creíble)

> **Por qué existe:** una app o un deck que nombra "Spotify", "Nike" o "iPhone" y los dibuja con una silueta CSS o una caja de color de marca grita "esto lo hizo una IA sin acceso a nada real". Un logo oficial y una foto de producto real comunican credibilidad en milisegundos — y la credibilidad es lo que se vende. Esta sección es de cumplimiento OBLIGATORIO, no "si lo tengo a mano".

### Regla de hierro

```
Si en el diseño aparece CUALQUIER producto o marca reconocible
→ su LOGO OFICIAL es un activo OBLIGATORIO del entregable.
No es opcional. No es "lo agrego si lo encuentro fácil".
Falta un logo de una marca nombrada = el entregable NO está terminado.
```

### Principio: ACTIVOS REALES > PALETA

El color de marca es lo último, no lo primero. Un logo oficial y una foto de producto real comunican más marca que el hex exacto del acento.

```
JERARQUÍA DE LO QUE COMUNICA MARCA (de más a menos):
1. Logo oficial embebido          ← imprescindible
2. Foto de producto real           ← imprescindible si el producto se muestra
3. Tipografía y layout coherentes
4. Color de marca                  ← lo último, nunca el sustituto de 1 y 2

PROHIBIDO: reemplazar una foto de producto real por una silueta CSS,
un emoji, o una caja con el color de marca. Si no tienes la foto, consíguela
(ver cadena de fallback); no la inventes con un <div>.
```

### SUB-PORTÓN DE LOGOS (para comparativas, rankings y decks)

Antes de empezar a construir un deck/comparativa/ranking que nombre varias marcas, haz un **portón de control**: lista cada marca nombrada y confirma que su logo está embebido. Si falta uno → **STOP**, consíguelo antes de seguir.

```
SUB-PORTÓN DE LOGOS — completar ANTES de construir
Marca nombrada        Logo embebido (ruta/URL)         Estado
--------------------  -------------------------------  --------
Spotify               /assets/logos/spotify.svg        [ ] OK
Apple Music           /assets/logos/apple-music.svg    [ ] OK
YouTube Music         (pendiente)                      [ ] FALTA → STOP
...

Regla: una sola fila en FALTA = no se empieza a maquetar. Cero excepciones.
```

### Cadena de fallback para conseguir los activos

```
LOGOS (probar en orden hasta obtener uno válido):
  1. svgl.app            → SVG limpios de marcas conocidas
  2. simpleicons.org     → set enorme de logos monocromos en SVG
  3. favicon del dominio → https://www.google.com/s/2/favicons?domain=marca.com
                           (o /favicon.ico del sitio oficial) como último recurso

IMÁGENES / FOTOS DE PRODUCTO:
  1. Wikimedia Commons   → fotos con licencia, atribución clara
  2. Unsplash            → fotos de alta calidad
  Siempre con User-Agent conforme en las requests automatizadas
  (ej: "AppName/1.0 (contacto@dominio)") — sin esto, Wikimedia/Unsplash bloquean.
```

> Regla de cierre de esta sección: si el entregable nombra marcas y NO tiene sus logos reales, no se entrega. Es lo que separa "una demo de IA" de "algo que el cliente cree que es real" — y eso es exactamente lo que se está vendiendo.

---

## PWA — LOS ASSETS QUE HACEN QUE LA APP SE INSTALE COMO APP

Si la app se usa a diario (hábitos, finanzas, salud — casi todo lo que vende el SO), instalable en el home screen multiplica retención. Estos son los assets y la UX; el service worker de push vive en `24-GAMIFICACION.md`.

### manifest.json completo de ejemplo

```json
{
  "name": "Abunda — Control de gastos sin culpa",
  "short_name": "Abunda",
  "description": "Registra tus gastos en 5 segundos y ve a dónde se va tu plata.",
  "id": "/",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#0A0C12",
  "background_color": "#0A0C12",
  "lang": "es",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

```
REGLAS DEL MANIFEST:
- theme_color y background_color salen de los TOKENS (10): --surface-base del modo base de la app
  (dark-first → el casi-negro con tinte; light-first → el casi-blanco cálido). NUNCA #000/#fff puros.
  background_color pinta el splash mientras carga: si no matchea el fondo real, hay flash feo.
- display: standalone (sin barra del navegador — se siente app) · orientation: portrait (el SO es mobile-first).
- short_name ≤12 caracteres (es lo que se ve bajo el ícono del home screen).
- <link rel="manifest" href="/manifest.json"> en el <head> + los <meta name="theme-color"> del archivo 10/43.
```

### Maskable icons (tamaños y safe zone)

Android recorta el ícono en formas distintas (círculo, squircle, gota). Un ícono normal queda con bordes cortados o flotando en un círculo blanco — la señal de PWA descuidada.

```
- Tamaños: 192x192 y 512x512 en purpose "maskable" (ADEMÁS de los normales "any").
- SAFE ZONE: todo lo importante (el símbolo) dentro del círculo central del 80% del ancho
  (radio = 40% del lado). El 10% de margen por lado puede ser recortado.
- El FONDO del maskable llena el 100% del lienzo con color sólido de marca (no transparente:
  lo transparente se rellena de blanco al recortar).
- Verificar en maskable.app (preview de todas las máscaras) antes de dar por buenos los íconos.
- Prompt para el usuario: pedir el ícono del logo centrado ocupando ~60% del lienzo, fondo
  sólido del color de marca hasta los bordes, sin texto.
```

### apple-touch-icon y splash iOS

iOS ignora buena parte del manifest: pide sus propios tags.

```html
<!-- Ícono del home screen en iOS: 180x180, SIN transparencia (iOS la rellena de negro),
     esquinas CUADRADAS (iOS las redondea solo) -->
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">

<!-- Que se abra a pantalla completa como app -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Abunda">
```

Splash iOS: Apple exige una imagen `apple-touch-startup-image` POR CADA tamaño de pantalla (son 20+ combinaciones). Regla práctica del SO: **no mantener eso a mano** — generarlas con `pwa-asset-generator` (npm, genera íconos + splash + los `<link>` desde un solo SVG y el color de fondo de los tokens), o aceptar el fallback (iOS muestra `background_color` + ícono, que ya se ve digno si el manifest está bien).

### UX del prompt de instalación (nunca al aterrizar)

El browser dispara `beforeinstallprompt` cuando la PWA califica; el error clásico es pedirla de entrada. **Misma doctrina que el permiso de push del `24`: se pide DESPUÉS de la primera victoria, nunca antes de que el usuario haya recibido valor.**

```ts
// 1) Capturar el evento y GUARDARLO (no mostrarlo aún)
let deferredPrompt: any = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();            // bloquea el mini-infobar automático de Chrome
  deferredPrompt = e;
});

// 2) Mostrar NUESTRO banner/botón solo tras la primera victoria
//    (primer hábito completado, primer resultado generado, primera racha)
async function instalarApp() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;  // 'accepted' | 'dismissed'
  deferredPrompt = null;
  if (outcome === 'dismissed') localStorage.setItem('install-dismissed', String(Date.now()));
}
```

```
REGLAS DE LA UX DE INSTALACIÓN:
- Momento: justo después de la PRIMERA VICTORIA, con copy de beneficio ("Instálala para
  registrar tus gastos en 2 toques"), no "Instala nuestra app".
- Formato: banner/botón propio dentro del flujo, descartable en 1 tap. NUNCA un modal al aterrizar.
- Si dice que no: no volver a pedir en ≥14 días (localStorage). Dejar una entrada permanente
  discreta en Ajustes → "Instalar la app".
- iOS no tiene beforeinstallprompt: mostrar (solo en Safari iOS, mismo momento) una guía de
  2 pasos: "Compartir → Añadir a pantalla de inicio", con los íconos del sistema.
```

---

## SISTEMA DE ILUSTRACIÓN IN-APP (derivado del brand kit, no clipart suelto)

Empty states, onboarding y celebraciones piden ilustración — y el error es generarlas UNA a una sin sistema: cada una sale de un estilo distinto y la app parece un collage. El sistema:

### 1. Definir el ESTILO en 1 línea en la ficha de Dirección de Arte

```
Ilustración: [técnica] + [paleta desde tokens] + [trazo/forma] + [qué NUNCA]
Ej: "Flat geométrico de 2 tintas (--accent + --surface-secondary), formas redondeadas 
     sin outline, grano sutil; NUNCA 3D, NUNCA degradados, NUNCA personajes realistas."
```

Esa línea se deriva del arquetipo + mundo del sujeto (16, PASOS 0.3/0.45) y gobierna TODAS las ilustraciones de la app. Sin esa línea escrita, no se genera ninguna.

### 2. Prompt PARAMETRIZADO para generarlas con IA (coherentes entre sí)

Un solo template; solo cambia el [SUJETO]. Así las 6-10 ilustraciones de la app salen de la misma familia:

```
"Ilustración [ESTILO de la ficha, literal] para una app de [nicho].
Sujeto: [SUJETO — ej. 'una alcancía abierta y vacía' para el empty state de gastos].
Colores EXACTOS: fondo transparente, formas en [hex del acento] y [hex de superficie secundaria],
detalles en [hex de texto secundario]. Composición simple, un solo objeto protagonista,
mucho aire alrededor. Sin texto, sin marco, sin sombra proyectada.
Mismo estilo exacto que las anteriores de la serie."
```

```
REGLAS DE LA SERIE:
- Generar TODAS las ilustraciones en una misma sesión, reusando el template (la coherencia se pierde
  entre sesiones/herramientas distintas).
- Lista mínima: empty state por sección principal (3-5) + 1 de celebración + 1 de error/404.
- Mismo nivel de detalle y mismo grosor visual en todas (una detallada + una minimal = collage).
- Exportar en SVG o PNG con transparencia, optimizadas (<60KB c/u para ilustraciones de UI).
```

### 3. Fallback SIN assets: Phosphor duotone + formas del brand kit

Si el usuario aún no generó ilustraciones (o el proyecto no las amerita), NO dejar el empty state pelado ni usar clipart: componer con lo que ya hay —

```tsx
{/* Ícono Phosphor duotone grande sobre una composición de formas del brand kit */}
<div className="relative flex items-center justify-center py-10">
  {/* formas de marca detrás: círculo suave del acento + blob de superficie */}
  <div className="absolute w-28 h-28 rounded-full bg-[var(--brand-primary-soft)]" />
  <div className="absolute w-20 h-20 rounded-[42%_58%_63%_37%] bg-[var(--surface-tertiary)]
                  translate-x-6 -translate-y-3" />
  {/* el duotone toma el acento como capa secundaria — se ve "de la marca" sin asset */}
  <PiggyBank size={56} weight="duotone" color="var(--brand-primary)" className="relative" />
</div>
```

Reglas del fallback: ícono Phosphor **duotone** (nunca outline pelado) a 48-64px, 1-2 formas de fondo con los tokens (radio/blob coherentes con la forma del brand kit), y el conjunto centrado con aire. Es un placeholder DIGNO: pasa la revisión de pantalla, y se reemplaza por la ilustración de la serie cuando exista.

---

## REGLAS DE ASSETS

```
[ ] Todas las imágenes optimizadas: WebP/AVIF, <200KB (ver 13-INFRA-ESCALABILIDAD.md)
[ ] El logo en SVG cuando sea posible (escala sin perder calidad)
[ ] Los assets siguen la paleta y personalidad de 16-DIRECCION-DE-ARTE.md
[ ] La IA entrega al usuario la LISTA exacta de qué generar + el prompt de cada uno,
    COMPUESTO desde FICHA-ARTE.md (regla madre — jamás un prompt genérico)
[ ] Todo el pack generado en UNA sesión con la misma receta base; las recetas usadas
    guardadas en FICHA-ARTE.md/ESTADO.md para regenerar
[ ] Mientras tanto, placeholders limpios (gradientes/iniciales), nunca cuadros rotos
[ ] OG image configurada (sin esto, el link compartido se ve roto en WhatsApp/redes)
[ ] Favicon configurado (sin esto, la pestaña se ve amateur)
[ ] Toda marca/producto reconocible que aparece tiene su LOGO OFICIAL embebido (no silueta CSS)
[ ] Para deck/comparativa/ranking: SUB-PORTÓN DE LOGOS completo (cero filas en FALTA)
[ ] Ninguna foto de producto real reemplazada por un <div> de color de marca
[ ] Si es PWA/uso diario: manifest.json con theme/background desde tokens + maskable icons
    (safe zone 80%) + apple-touch-icon 180px + prompt de instalación DESPUÉS de la primera victoria
[ ] Ilustraciones in-app: estilo definido en 1 línea en la ficha + serie generada con el prompt
    parametrizado (o fallback Phosphor duotone + formas del brand kit — nunca clipart suelto)
```
