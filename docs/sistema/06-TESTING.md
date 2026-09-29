# FASE 5 — TESTING Y DETECCIÓN DE ERRORES

> **Cuándo cargar este archivo:**
> - Después de construir el MVP (Fase 4)
> - Al auditar una app existente
> - Junto con `03-PRINCIPIOS-APP-EXITOSA.md` para una revisión completa

## Objetivo
Encontrar y corregir todo lo que está roto, incompleto, o mal antes de pulir. No se pule algo que no funciona.

---

## Proceso de Testing (La IA ejecuta todo esto)

La IA debe revisar la app de forma sistemática, pantalla por pantalla, flujo por flujo. El usuario NO tiene que hacer QA manual. La IA reporta los problemas encontrados y los corrige directamente.

---

## Test 1: Flujo Funcional Completo

Simular mentalmente (o ejecutar si es posible) cada flujo definido en la Fase 3:

### Flujo de Primer Uso
```
[ ] La landing carga correctamente
[ ] El CTA principal es visible y funciona
[ ] El onboarding se completa correctamente
[ ] El resultado/preview personalizado aparece en el momento correcto
[ ] El paywall aparece despues del deseo, no como muro frio
[ ] El login/auth explica por que se pide cuenta
[ ] La app interna muestra su accion principal solo despues de ventas/onboarding/paywall/login
[ ] Al hacer click, se muestra el estado de carga
[ ] La IA responde y el resultado se muestra correctamente
[ ] Se puede copiar/guardar/exportar el resultado
[ ] El resultado se guarda en el historial
```

### Flujo de Uso Recurrente
```
[ ] Al volver, el usuario ve sus datos/resultados anteriores
[ ] Puede crear un nuevo resultado
[ ] El historial muestra los items en orden cronológico
[ ] Se puede buscar/filtrar en el historial (si aplica)
[ ] Las acciones sobre items del historial funcionan (ver, editar, eliminar)
```

### Flujo de Conversión (si aplica)
```
[ ] El límite gratuito se aplica correctamente
[ ] Al alcanzar el límite, se muestra el prompt de upgrade
[ ] La pantalla de pricing muestra la información correcta
[ ] El CTA de pago lleva al checkout correcto
```

---

## Test 2: Edge Cases y Errores

### Inputs del Usuario
```
[ ] Campo vacío: ¿Qué pasa si el usuario no escribe nada y da click? 
    → Debe mostrar validación, NO enviar request vacío
[ ] Texto extremadamente largo: ¿Se maneja bien?
    → Debe tener límite de caracteres visible + mensaje
[ ] Caracteres especiales: ¿Emojis, acentos, ñ, comillas?
    → Deben funcionar sin romper nada
[ ] Doble click en botón: ¿Se envía dos veces?
    → El botón debe deshabilitarse después del primer click
[ ] Pegado de texto muy largo: ¿Funciona?
    → Truncar o advertir antes de enviar
```

### Respuestas de IA
```
[ ] Respuesta normal: Se muestra correctamente
[ ] Respuesta muy larga: No rompe el layout
[ ] Respuesta con formato (markdown, listas, código): Se renderiza bien
[ ] Respuesta vacía o error de API: Se muestra mensaje de error claro
[ ] Timeout (>30s): Se muestra mensaje y opción de reintentar
[ ] Rate limit: Se informa al usuario sin tecnicismos
```

### Estados de Red
```
[ ] Sin internet: Se muestra mensaje offline claro
[ ] Internet lento: Los loaders funcionan correctamente
[ ] Reconexión: La app se recupera sin necesidad de recargar
```

### Responsividad y Compatibilidad
```
DISPOSITIVOS
[ ] 375px (iPhone SE): Todo visible y funcional
[ ] 390px (iPhone 14): Todo visible y funcional
[ ] 768px (iPad): Layout adapta correctamente
[ ] 1024px (Laptop): Aprovecha el espacio
[ ] 1440px (Desktop): No se estira demasiado (max-width aplicado)
[ ] Rotación horizontal en mobile: No se rompe

NAVEGADORES (probar al menos en 2)
[ ] Chrome (referencia principal)
[ ] Safari (el más problemático — probar en iPhone o macOS)
    Problemas comunes en Safari:
    - backdrop-filter necesita -webkit- prefix
    - input[type=date] se renderiza diferente
    - 100vh incluye la barra de navegación (usar 100dvh)
    - Scroll bounce interfiere con modales fixed
[ ] Firefox (verificar fuentes y gradientes)
[ ] Mobile Chrome (verificar teclado virtual no tape inputs)

CONEXIÓN
[ ] Probar con throttling "Slow 3G" en Chrome DevTools
[ ] Verificar que los skeleton loaders aparecen
[ ] Verificar que la app no se queda en blanco sin conexión
```

---

## Test 3: Calidad Visual

### Consistencia
```
[ ] Todos los bordes redondeados usan el mismo radio
[ ] Todos los colores pertenecen a la paleta definida
[ ] La tipografía sigue la jerarquía definida
[ ] El espaciado es consistente entre secciones similares
[ ] Los íconos son todos del mismo estilo/familia
[ ] Los botones del mismo tipo se ven iguales en toda la app
```

### Problemas Visuales Comunes
```
[ ] No hay textos cortados o desbordados
[ ] No hay elementos superpuestos accidentalmente
[ ] No hay scroll horizontal en ninguna pantalla mobile
[ ] Las imágenes/placeholders no se estiran o distorsionan
[ ] No hay espacios vacíos inexplicables
[ ] Los modales se ven bien y se centran correctamente
[ ] Los toasts no bloquean contenido importante
```

---

## Test 4: Performance y Core Web Vitals

### Core Web Vitals (las 3 métricas que Google mide)

> **Campo ≠ laboratorio (no los confundas).** LCP/INP/CLS que cuentan son los de **CAMPO**
> (usuarios reales, p75): se miden con **CrUX / PageSpeed Insights** y con la librería
> **`web-vitals`** reportando desde producción a tu analítica. DevTools y Lighthouse son solo
> para **depurar en laboratorio** — reproducen UN escenario en TU máquina, no el INP real de tus
> usuarios. El budget, el gate del CI y cómo medir cada métrica están en `38-PERFORMANCE-BUDGET.md`
> (fuente única de los números). Aquí solo verificas que existan y estén en verde.

```
[ ] LCP (Largest Contentful Paint): <2.5 segundos (p75 de CAMPO)
    → El elemento más grande visible carga rápido
    → Campo: CrUX / PageSpeed Insights / web-vitals en prod. Lab (depurar): Lighthouse.

[ ] INP (Interaction to Next Paint): <200ms (p75 de CAMPO)
    → La respuesta visual a clicks/taps es inmediata
    → Campo: CrUX / web-vitals en prod (la fuente que cuenta). Lab (depurar): DevTools → Performance
      para cazar la long task culpable — NO es el INP real de tus usuarios.

[ ] CLS (Cumulative Layout Shift): <0.1 (p75 de CAMPO)
    → Nada se mueve inesperadamente mientras carga
    → Campo: CrUX / web-vitals en prod. Causa #1: imágenes sin width/height. Causa #2:
      contenido insertado dinámicamente arriba del viewport.
```

### Performance General
```
[ ] Primera carga de la app: <3 segundos
[ ] Tiempo desde click hasta loading state: <200ms
[ ] Tiempo de respuesta de IA: loading se muestra inmediatamente
[ ] Navegación entre pantallas: <300ms
[ ] No hay re-renders innecesarios (React DevTools → Profiler)
[ ] No hay memory leaks en componentes con intervals/listeners
[ ] Las listas largas (>50 items) no causan lag
[ ] Imágenes en formatos modernos (WebP preferido, <200KB cada una)
[ ] Fuentes cargan sin bloquear el render (font-display: swap)
```

### Herramientas de Medición
- **PageSpeed Insights / CrUX**: métricas reales de CAMPO (p75) — la fuente que cuenta para el budget.
- **`web-vitals` en producción → analítica (36)**: LCP/INP/CLS de campo de TU base LATAM (ver 38).
- **Chrome Lighthouse**: auditoría de LABORATORIO (Performance, Accessibility, SEO); reproducible, para depurar.
- **Chrome DevTools → Network**: tamaño del bundle, tiempos de carga (laboratorio).
- **Chrome DevTools → Performance**: long tasks y re-renders para DEPURAR INP — NO es el INP de campo.

---

## Test 5: Accesibilidad (WCAG 2.2 AA)

```
PERCEPTIBLE
[ ] Contraste de texto normal ≥4.5:1 (verificar con WebAIM Contrast Checker)
[ ] Contraste de texto grande (≥18px bold) ≥3:1
[ ] Contraste de elementos UI (bordes, íconos) ≥3:1
[ ] Las imágenes tienen alt text descriptivo
[ ] El color NO es el único indicador de estado (ej: error = rojo + ícono + texto)
[ ] El texto se puede ampliar 200% sin perder funcionalidad

OPERABLE
[ ] Se puede navegar con Tab entre TODOS los elementos interactivos
[ ] El orden de Tab sigue un flujo lógico (izq→der, arriba→abajo)
[ ] Enter activa el botón/link seleccionado
[ ] Escape cierra modales y dropdowns
[ ] El focus es visible (outline) al navegar con teclado
[ ] Focus-visible solo aparece con teclado, no con mouse
[ ] Áreas táctiles mínimo 24x24px (WCAG AA), recomendado 44x44px
[ ] No hay trampas de teclado (el usuario siempre puede salir con Tab/Escape)

COMPRENSIBLE
[ ] Los inputs tienen labels visibles asociados (no solo placeholder)
[ ] Los errores de formulario son específicos y están junto al campo
[ ] La navegación es consistente en todas las pantallas
[ ] El idioma de la página está definido (<html lang="es">)

ROBUSTO
[ ] HTML semántico correcto (header, nav, main, section, article, footer)
[ ] Roles ARIA solo cuando no existe un elemento HTML nativo equivalente
[ ] Se respeta prefers-reduced-motion (animaciones desactivadas)
[ ] Se respeta prefers-color-scheme (si hay dark mode)
```

### Herramientas de Accesibilidad
- **axe DevTools** (extensión Chrome): Detecta ~30% de problemas automáticamente
- **Wave** (wave.webaim.org): Evaluación visual de accesibilidad
- **Lighthouse → Accessibility**: Puntuación rápida
- **Test manual**: Navegar la app entera SOLO con teclado (sin mouse)
- **Test con lector de pantalla**: VoiceOver (Mac), NVDA (Windows)

---

## Test 6: Seguridad Básica

```
[ ] No hay API keys sensibles en el código fuente (buscar en repo)
[ ] Variables de entorno NO están en el bundle de producción
[ ] Los console.log con datos sensibles están eliminados
[ ] Los inputs del usuario se sanitizan antes de enviar a APIs
[ ] Doble click en botones de pago/acciones críticas está prevenido
[ ] Si hay auth, la sesión expira después de inactividad
[ ] Si hay Supabase, RLS activo en TODAS las tablas — y PROBADO con acceso cruzado (ver Test 8)
[ ] HTTPS activo (Vercel lo hace automático)
[ ] No hay información sensible en URLs (tokens, IDs de sesión)
```

> Esto es el smoke básico. La auditoría seria (OWASP Top 10:2025, grep de fail-open, `semgrep`, `npm audit`) está en `27-REVISION-SEGURIDAD.md` y es obligatoria antes de vender.

---

## Test 7: Métricas de Experiencia (UX, no solo técnica)

El testing técnico verifica que funciona. Estas métricas verifican que se SIENTE bien — son las que predicen retención. Diseñar la app para poder medirlas y revisarlas tras el lanzamiento:

```
EXPERIENCIA
[ ] Tiempo hasta primera acción significativa: <60 segundos desde el primer uso
[ ] Tasa de completación de tarea por pantalla: ¿el usuario logra lo que vino a hacer?
[ ] Rage-tap rate: ¿hay zonas donde el usuario toca repetido por frustración?
    (señal de que algo parece tocable y no responde, o responde lento)
[ ] UI freeze rate: ¿la interfaz se congela durante alguna acción?
[ ] Profundidad de scroll: ¿el contenido importante queda sobre el pliegue?

RETENCIÓN (medir tras lanzar)
[ ] Retención día 1 / día 7 / día 30
[ ] Tasa de activación: % que completa la primera acción de valor
[ ] Punto de abandono: ¿en qué pantalla se van los que no vuelven?
```

Cómo observarlo: session replays (PostHog, Microsoft Clarity, UXCam — varios con plan gratis) muestran lo que los usuarios HACEN, no lo que crees que hacen. Es la fuente más honesta. Revisar replays de producción regularmente.

---

## Test 8: Auth y Datos (seguridad real, no solo superficie)

> Solo si la app tiene auth/backend. Detalle en `26-AUTH-MODERNO.md` y `27-REVISION-SEGURIDAD.md`.

```
[ ] IDOR: autenticado como usuario A, intentar leer/editar un recurso de B por su ID (en la URL
    o llamando la API directo) → debe FALLAR (403 o vacío), nunca devolver datos ajenos
[ ] RLS real: con la anon key, intentar `select *` de una tabla con datos de otros → 0 filas
[ ] Passkey: alta y uso en el mismo dispositivo; el counter incrementa; rechazar uno que no incremente
[ ] Login: mensajes genéricos (no revela si el email existe); rate limit tras N intentos fallidos
[ ] Reset/verificación: enlace de un solo uso y con expiración; mismo mensaje exista o no la cuenta
[ ] Tokens en cookies httpOnly (revisar DevTools → Application); NADA de tokens en localStorage
[ ] Logout invalida la sesión en el servidor (un token viejo ya no funciona)
```

---

## Test 9: Gamificación y Lógica de Servidor (anti-trampa)

> Solo si la app tiene gamificación/progreso. Detalle en `24-GAMIFICACION.md`.

```
[ ] XP/racha/nivel se calculan en el SERVIDOR: editar el valor desde DevTools no lo cambia de verdad
[ ] La racha cruza la medianoche bien (zona horaria del usuario, no la del servidor)
[ ] Streak freeze se consume ANTES de romper la racha; no se puede consumir dos veces el mismo día
[ ] Idempotencia: repetir la misma acción (doble-tap, reintento) no otorga XP ni hitos duplicados
[ ] Los logros acumulativos nunca se pierden; se otorgan por acción real, no por tiempo en la app
[ ] Las notificaciones de re-enganche respetan el tope (≤1-2/día) y los ajustes del usuario
```

---

## TESTING AUTOMATIZADO (no solo manual)

> **Nota:** esto NO reemplaza la verificación visual a 375px de `32-DEL-MVP-AL-PRODUCTO.md` — la complementa. Los tests automatizados son el GUARDIÁN que evita que un cambio futuro rompa lo que ya pasó el QA manual. El QA manual encuentra lo nuevo; la suite automatizada protege lo viejo en cada PR.

> **No confundir:** el seed de datos DEMO del `32` («LA APP NUNCA SE ENSEÑA VACÍA») es para ENSEÑAR la app (screenshots, demo del dueño) — los tests NO lo usan: cada test define sus propios fixtures mínimos y deterministas.

Los Tests 1-9 de arriba los ejecuta la IA una vez. El problema: el PR #40 rompe en silencio lo que funcionaba en el PR #10, y nadie corre el QA manual completo en cada cambio. Por eso lo que cobra dinero y la lógica que no puede fallar necesitan un guardián que corra solo, en cada merge. Y hay un agujero concreto hoy: el `ci.yml` de `08-DEPLOY.md` ejecuta `npm test`, pero esos tests NO EXISTEN — el gate está vacío. Esta sección lo llena.

### Vitest — lógica crítica de negocio (lo que NO puede fallar)

No se testea todo: se testea la lógica donde un bug cuesta dinero o rompe la confianza. Límites de plan, racha/XP, parsing del webhook de pago, idempotencia. Es lógica pura (entra dato, sale resultado), así que es barata de testear — inyecta dependencias en vez de crearlas dentro (ver TypeScript en `28-INGENIERIA-NEXTJS.md`).

```ts
// limites-plan.test.ts — un bug aquí o regala Pro gratis o bloquea a quien pagó
import { describe, it, expect } from 'vitest';
import { puedeGenerar } from '@/lib/plan';

describe('límite de plan', () => {
  it('free bloquea al llegar al tope diario', () => {
    expect(puedeGenerar({ plan: 'free', usoHoy: 10, limiteFree: 10 })).toBe(false);
  });
  it('free permite si está bajo el tope', () => {
    expect(puedeGenerar({ plan: 'free', usoHoy: 9, limiteFree: 10 })).toBe(true);
  });
  it('pro no se bloquea por el tope free', () => {
    expect(puedeGenerar({ plan: 'pro', usoHoy: 9999, limiteFree: 10 })).toBe(true);
  });
});

// webhook-pago.test.ts — idempotencia: el mismo evento NO debe otorgar el plan dos veces
it('webhook duplicado no activa el plan dos veces', async () => {
  const evento = parseWebhook(payloadHotmart);         // valida el hottok + parsea (zod en el borde)
  expect(evento.eventId).toBe('evt_123');
  const r1 = await aplicarPago(evento, { yaProcesados: new Set() });
  const r2 = await aplicarPago(evento, { yaProcesados: new Set(['evt_123']) });
  expect(r1.activado).toBe(true);
  expect(r2.activado).toBe(false);                     // idempotente: segundo intento no hace nada
});
```

### VERIFICAR LA MEDICIÓN: los píxeles bloquean navegadores automáticos

Al intentar comprobar que los eventos de analítica salen, usando un navegador automatizado, la
respuesta habitual de las plataformas de anuncios es **detectarlo como bot y no enviar nada**. En la
consola aparece un aviso de tráfico automatizado y cero peticiones de eventos.

Es una trampa silenciosa: parece que la instrumentación está rota cuando lo que pasa es que la
plataforma se negó a registrar la visita.

**La solución es no depender de la librería del tercero.** Se sustituye su función global por un
grabador propio **antes** de que cargue la página, y se comprueba qué pide **tu** código:

```javascript
// Se inyecta ANTES de cargar la página. Los fragmentos de estas plataformas suelen
// empezar con "si ya existe la función, no hacer nada", así que el grabador sobrevive.
await context.addInitScript(() => {
  window.__eventos = [];
  window.[funcionGlobalDelPixel] = (...args) => window.__eventos.push(args.join(':'));
});
// …recorrer el flujo…
const emitidos = await page.evaluate(() => window.__eventos);
```

Esto verifica **lo que tu código pide**, que es lo que puedes controlar. Que el tercero lo reciba se
comprueba aparte, en su panel, con tráfico real.

---

## CUANDO LA CAPTURA DE PANTALLA FALLA (plan B obligatorio)

La Regla de Oro 7 exige un render real a 375px para cerrar cualquier pantalla. Si la herramienta de
captura se cuelga —esperando fuentes, con tiempos de espera cortos, o por un fallo del servidor de
navegador—, el alumno se queda **sin poder cerrar ninguna pantalla**, que es peor que no tener la
regla.

**Orden de intentos, sin saltarse ninguno:**

```
1. La herramienta de captura integrada (MCP de navegador).
2. Si falla: un script propio de navegador headless, instalado en una carpeta temporal.
   Da el mismo resultado y evita los tiempos de espera de la integración.
3. Si tampoco: verificar por MEDICIÓN programática (12) y dejar constancia explícita
   de que la verificación VISUAL quedó pendiente.
4. Nunca: pedirle al dueño no técnico una captura "a 375px exactos" ni que puntúe una
   rúbrica. Eso es trasladarle una tarea técnica (regla dura 8 de CLAUDE.md).
```

⚠️ El paso 3 **no cierra la pantalla**: la deja marcada como no verificada visualmente. La medición
demuestra que no hay desbordes ni cortes, no que se vea bien.

---

## PRESENCIA ≠ LEGIBILIDAD (el test que pasa mientras el usuario no alcanza a leer)

`toBeVisible()` responde "¿está en el DOM y pintado?". **No responde "¿alcanzó a leerlo una persona?"**
Son preguntas distintas, y confundirlas produce el peor tipo de bug: el que ninguna prueba detecta y
todos los usuarios sufren.

**Caso típico:** una explicación, una pista o un mensaje de error que aparece y desaparece solo tras
unos cientos de milisegundos, o que se tapa con la siguiente pantalla. El test lo encuentra visible
en el instante en que corre. El usuario ve un parpadeo.

**La regla:**

```
Todo contenido cuyo propósito es que el usuario lo LEA o APRENDA
  → no puede desaparecer solo.
  → avanza con un acto explícito del usuario ("Entendido", "Continuar", cerrar).
Todo contenido informativo que sí puede autodesaparecer (confirmaciones breves)
  → permanece un mínimo comprobable, y el test mide PERMANENCIA, no existencia.
```

**Cómo se testea la permanencia (el patrón que sí sirve):**

```typescript
// ❌ NO BASTA: pasa aunque el mensaje dure 200ms
await expect(page.getByTestId('explicacion')).toBeVisible();

// ✅ SÍ SIRVE: comprueba que sigue ahí después del tiempo mínimo de lectura,
//    y que solo se va cuando el usuario lo decide.
await expect(page.getByTestId('explicacion')).toBeVisible();
await page.waitForTimeout(2500);                       // tiempo mínimo de lectura
await expect(page.getByTestId('explicacion')).toBeVisible();  // ← sigue ahí: no se fue sola
await page.getByRole('button', { name: /entendido/i }).click();
await expect(page.getByTestId('explicacion')).toBeHidden();   // ← se fue porque él quiso
```

**Cuánto es "tiempo mínimo de lectura":** ~200 palabras por minuto para lectura en pantalla en
condiciones normales; en un móvil, con prisa y sin contexto, mucho menos. Regla práctica del SO:
**nada que haya que leer dura menos de 3 segundos por sí solo, y si enseña algo, no dura: espera.**

> ⚠️ **Extensión de la misma trampa:** un elemento puede estar `visible` para el test y aun así ser
> inalcanzable para el usuario — tapado por una barra fija, fuera del área de scroll, o con el
> texto cortado. Cuando el contenido importe, la comprobación es **posicional además de existencial**
> (ver "MEDIR EL LAYOUT, NO DECLARARLO" en `12-FLUJO-AGENTICO.md`).

---

### Playwright — E2E de los flujos que COBRAN DINERO

Tests de unidad no atrapan un botón de checkout que no navega. Los flujos que generan o desbloquean ingreso se prueban de punta a punta en un navegador real. En el stack del SO el pago es **Hotmart** (18): el checkout es una página de un TERCERO que no se automatiza de forma fiable — **el gate AUTOMATIZABLE es tu WEBHOOK**, que es donde tu código crea/actualiza el usuario y activa el plan.

```ts
// pago.e2e.ts — el gate automatizable del pago es el WEBHOOK de Hotmart, no el checkout de un tercero
import { test, expect } from '@playwright/test';

test('signup → primera acción de valor (aha)', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /empezar/i }).click();
  await page.getByRole('button', { name: /generar/i }).click();
  await expect(page.getByTestId('resultado')).toBeVisible();   // llegó al valor sin registrarse
});

test('llegar al límite → aparece el paywall', async ({ page }) => {
  await loginComoFreeEnElLimite(page);
  await page.getByRole('button', { name: /generar/i }).click();
  await expect(page.getByText(/alcanzaste el límite/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /mejorar a pro/i })).toBeVisible();
});

test('webhook de Hotmart (compra aprobada) → crea/actualiza el usuario y activa el plan', async ({ page, request }) => {
  // Simular el POST que Hotmart enviaría, firmado con el hottok de PRUEBA (nunca el real en el repo):
  const res = await request.post('/api/webhooks/hotmart', {
    headers: { 'x-hotmart-hottok': process.env.HOTMART_HOTTOK_TEST! },
    data: payloadCompraAprobada({ email: 'comprador-e2e@test.local' }),  // fixture del payload real de 18
  });
  expect(res.status()).toBe(200);
  // Efecto observable: el comprador entra y su plan está activo (el webhook creó usuario + plan).
  await loginPorMagicLinkDePrueba(page, 'comprador-e2e@test.local');
  await expect(page.getByText(/plan pro/i)).toBeVisible();
  // Y el mismo payload REPETIDO no duplica nada (idempotencia — ver el test de unidad de arriba).
});
```

> **El checkout de Hotmart se cubre con un smoke MANUAL**, no automatizado: si el sandbox de
> checkout de Hotmart está disponible, una compra de prueba de punta a punta (checkout → email de
> acceso → login) antes de cada lanzamiento, anotada en el checklist. Automatizar la página de un
> tercero da falsos rojos y no prueba TU código; el webhook sí.

### Regresión visual — un guardián automático para la rúbrica /40

La verificación visual con las rúbricas de `RUBRICAS-DE-PANTALLA.md` (vía 32) da una nota /40 a ojo: es subjetiva y no se repite en cada PR. Una vez que una pantalla pasa **≥36/40**, se captura su screenshot baseline a **375 / 768 / 1440px**; de ahí en adelante el CI compara cada PR contra ese baseline y FALLA si hay diff visual inesperado. Así la rúbrica manual (que se corre pocas veces) queda blindada por un chequeo automático que se corre siempre.

```ts
// regresion-visual.e2e.ts — baseline tras pasar ≥36/40 en las rúbricas de RUBRICAS-DE-PANTALLA.md (vía 32)
import { test, expect } from '@playwright/test';

for (const [nombre, ancho] of [['mobile', 375], ['tablet', 768], ['desktop', 1440]] as const) {
  test(`flujo principal sin regresión visual @${nombre}`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: 900 });
    await page.goto('/');
    await expect(page).toHaveScreenshot(`landing-${nombre}.png`, { maxDiffPixelRatio: 0.01 });
  });
}
```

### Accesibilidad TESTEADA automáticamente — un gate en el CI, no solo una revisión a ojo

El Test 5 (WCAG 2.2 AA) de arriba es manual y se corre pocas veces. Igual que la rúbrica visual, una vez que una pantalla pasa la accesibilidad, hay que **blindarla con un chequeo automático que corra en cada PR** y FALLE el build ante violaciones serias (contraste, labels faltantes, roles inválidos, `alt` ausente). Así una regresión de accesibilidad (un botón sin label, un contraste que bajó) se atrapa en el merge, no en producción con un usuario de lector de pantalla.

```ts
// a11y.e2e.ts — axe corriendo en Playwright; falla el build ante violaciones serias
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright'; // npm i -D @axe-core/playwright

for (const ruta of ['/', '/app', '/pricing']) {
  test(`sin violaciones de accesibilidad serias @${ruta}`, async ({ page }) => {
    await page.goto(ruta);
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']) // estándar que exige el SO (Test 5)
      .analyze();
    // Fallar SOLO ante lo serio/crítico (no ahogar el gate en avisos menores)
    const serias = violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
    expect(serias, JSON.stringify(serias.map(v => v.id), null, 2)).toEqual([]);
  });
}
```

```ts
// Para COMPONENTES aislados (sin navegador), jest-axe / vitest-axe sobre el render:
import { render } from '@testing-library/react';
import { axe } from 'jest-axe'; // npm i -D jest-axe  (compatible con Vitest)

it('el formulario de generación no tiene violaciones de a11y', async () => {
  const { container } = render(<FormularioGenerar />);
  expect(await axe(container)).toHaveNoViolations();
});
```

> **Alternativa sin escribir tests:** `pa11y-ci` corre contra una lista de URLs y falla el build con un umbral de errores (`npx pa11y-ci --sitemap https://tuapp.com/sitemap.xml`). Útil si prefieres un gate por URL en vez de specs de Playwright.

> **El test automático cubre solo ~30-50% de WCAG — NO reemplaza la revisión manual.** `axe`/`pa11y` atrapan lo *programático*: contraste, labels asociados, roles ARIA inválidos, `alt` ausente, `lang` del documento. NO detectan si el orden de Tab tiene sentido, si un lector de pantalla anuncia el flujo de forma comprensible, ni si el contenido dinámico se anuncia (la regla **`aria-live`** de `15-PATRONES-UX.md`: streaming de IA, toasts/XP, level-up, errores — un cambio sin región *live* es invisible para VoiceOver/NVDA, y `axe` no lo ve). El gate automático COMPLEMENTA, no sustituye, el test manual con teclado y con lector de pantalla del Test 5.

### CI real como GATE de merge (conectar el ci.yml de 08)

El `ci.yml` de `08-DEPLOY.md` debe correr de verdad lo de arriba — no `npm test` sobre tests inexistentes. El pipeline real, todos como gate (si uno falla, el merge se bloquea):

```yaml
# Fragmento del ci.yml de 08-DEPLOY.md — el gate real
  - run: npm run typecheck     # tsc --noEmit: cero errores de tipos
  - run: npm run lint          # cero errores; warnings corregidos o excepción con vencimiento
  - run: npm run build         # build de producción no rota
  - run: npm run test          # Vitest: lógica crítica (plan, racha/XP, webhook, idempotencia)
  - run: npx playwright test   # E2E: flujos que cobran + regresión visual + a11y (axe, falla ante serias)
  - run: npx lhci autorun      # Lighthouse + gate de First Load JS: budget de performance (ver 38)
```

> El budget de performance como gate (First Load JS por ruta + Lighthouse CI; size-limit solo para CSS/libs puntuales) está detallado en `38-PERFORMANCE-BUDGET.md`. Es parte del mismo pipeline.

### Set mínimo NO-omitible de cobertura (regresión obligatoria)

No se exige cubrir todo. Se exige cubrir lo que, si se rompe, mata el negocio. Estos flujos SON regresión obligatoria — antes de mergear cualquier cambio que los toque, su test debe pasar:

```
[ ] Primer uso: signup → primera acción de valor (aha) visible
[ ] Uso recurrente: el usuario vuelve y ve sus datos/historial
[ ] Checkout (sandbox): pagar → webhook → plan activo → features desbloqueadas
[ ] Límite → paywall: free al tope ve el prompt de upgrade, no un error
[ ] Recuperación de sesión / IA: timeout o error de IA → mensaje claro + reintento, sin pantalla rota
[ ] Accesibilidad automática: axe (@axe-core/playwright) sin violaciones serias/críticas en las pantallas core — complementa el test manual del Test 5, no lo reemplaza
[ ] Entitlement: red/timeout/5xx -> unknown_retryable, nunca "no tienes una compra"
[ ] RPC de valor: cliente directo no puede fabricar XP/gemas/créditos/roles/entitlements
[ ] Clean-room: clon limpio + .env.example + migraciones reconstruyen el entorno y pasan la suite
```

Igual que los evals de IA, esta suite se corre como regresión obligatoria antes de cambiar algo que la toque — no es "lo corro cuando me acuerdo", es el gate del merge.

---

> **Calidad de salida de IA (no solo "funciona"):** los tests de arriba verifican que la app FUNCIONA; la CALIDAD de lo que GENERA la IA se mide con **evals (golden set)** — ver `31-EVALS-OBSERVABILIDAD-OPERACION.md`. Correrlos antes de cambiar de modelo o prompt es regresión obligatoria, igual que tsc/build.

## Formato del Reporte de Testing

```markdown
## REPORTE DE TESTING — [Nombre de la App]
Fecha: [fecha]

### Resumen
- Problemas críticos (bloquean el uso): [número]
- Problemas mayores (afectan la experiencia): [número]
- Problemas menores (detalles cosméticos): [número]
- Total: [número]

### Problemas Encontrados

#### 🔴 Críticos
1. [Descripción del problema]
   - Pantalla: [dónde ocurre]
   - Pasos para reproducir: [cómo se llega al error]
   - Fix aplicado: [qué se hizo para resolverlo]

#### 🟡 Mayores
1. [Descripción]
   - Fix aplicado: [solución]

#### 🟢 Menores
1. [Descripción]
   - Fix aplicado: [solución]

### Estado Final
- [ ] Todos los críticos resueltos
- [ ] Todos los mayores resueltos
- [ ] Menores resueltos o documentados para después
```

---

## Proceso de Corrección

La IA NO solo reporta los bugs. Los corrige directamente.

1. Ejecutar todos los tests
2. Documentar cada problema encontrado
3. Corregir los críticos primero, luego mayores, luego menores
4. Re-testear los flujos donde se aplicaron correcciones
5. Confirmar que las correcciones no rompieron otra cosa
6. Presentar el reporte final al usuario

### Criterios de Salida de Fase 5
- [ ] Cero problemas críticos
- [ ] Cero problemas mayores
- [ ] Todos los flujos principales funcionan de principio a fin
- [ ] La app es responsive en los breakpoints principales
- [ ] Los edge cases de input están manejados
- [ ] Los errores de IA están manejados con UX clara
- [ ] Si hay pagos: probado en modo sandbox/test con tarjeta de prueba
- [ ] Al menos 1 persona real (no el creador) completó el flujo principal sin ayuda — si no hay
      nadie disponible: el DUEÑO recorre el flujo en su celular siguiendo un guion de 5 tareas
      concretas (las acciones del flujo principal, escritas ANTES de probar — no "explorar"), y
      se anota como "test de pasillo pendiente" en ESTADO.md — nunca se declara hecho sin nadie

→ **Siguiente: Cargar `07-PULIDO.md`**
