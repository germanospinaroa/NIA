# FASE 6 — PULIDO Y OPTIMIZACIÓN

## Objetivo
Transformar una app que "funciona" en una que "se siente profesional". Esta fase es la diferencia entre una web app hecha con IA genérica y una que parece hecha por un equipo de producto.

---

## Capa 1: Micro-interacciones

Las micro-interacciones son lo que hace que una app se sienta "viva". No son decoración — son feedback que le dice al usuario que la app responde a sus acciones.

> **Fuente única:** las **7 animaciones baseline** y la **lista anti-slop** canónicas viven en
> `DESIGN-CORE.md` §6 y §4 — este archivo NO las duplica. Aquí va solo el CSS de apoyo para
> implementarlas; ante cualquier discrepancia, manda DESIGN-CORE.

### Micro-interacciones Obligatorias

**Botones:**
```css
/* Transición: propiedades EXPLÍCITAS — jamás `transition: all` (repinta todo y va a tirones) */
.btn {
  transition: transform .15s var(--ease-out), background-color .2s ease, border-color .2s ease;
}

/* Hover-lift: SOLO transform (no animar box-shadow) y gateado — en touch el hover se "pega" */
@media (hover: hover) {
  .btn:hover { transform: translateY(-1px); }
}

/* Click — Feedback táctil */
.btn:active {
  transform: translateY(0px) scale(0.97);
}
```

**Cards / Elementos de Lista:**
```css
/* Hover sutil en cards clickeables — gateado para touch */
@media (hover: hover) {
  .card-interactive:hover {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent); /* estado discreto (no animado), no un lift */
  }
}
```

**Inputs:**
```css
/* Focus ring visible y suave — CSS real (`ring:` no existe en CSS, es sintaxis de Tailwind) */
input:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-color: var(--accent);
}
/* En Tailwind: focus-visible:ring-2 focus-visible:ring-accent */

/* Label que se reduce al hacer focus (float label pattern) — OPCIONAL */
```

**Aparición de Resultados:**
```css
/* Fade in + slide up para resultados generados */
@keyframes resultAppear {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.result-card {
  animation: resultAppear 0.4s ease-out;
}
```

**Modales:**
```css
/* Entrada suave */
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Overlay fade */
@keyframes overlayIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Copiar al Portapapeles:**
```
Click "Copiar" → Ícono cambia a ✓ (check) + texto cambia a "¡Copiado!" → 
Vuelve al estado original después de 2 segundos
```

**Eliminar:**
```
Click "Eliminar" → Modal de confirmación → Confirmar → 
El elemento se desvanece (fade out + slide) → Toast "Eliminado" con opción "Deshacer"
```

### Micro-interacciones Opcionales (pero recomendadas)

(La celebración de hitos, la transición entre pantallas y el streaming de IA NO van aquí — son
baseline obligatorias de DESIGN-CORE §6.)

- **Contador de caracteres** que cambia de color al acercarse al límite
- **Shake animation** en inputs con error de validación
- **Smooth scroll** al navegar a secciones internas
- **Progress bar** en procesos de múltiples pasos

---

## Capa 2: Copywriting Final

Revisar CADA texto de la app y asegurarse de que sea:

### Títulos de Pantalla
```
❌ "Dashboard"          → ✅ "Tu espacio de trabajo"
❌ "Historial"          → ✅ "Tus resultados"
❌ "Configuración"      → ✅ "Tu cuenta"
❌ "Nueva generación"   → ✅ "Crea algo nuevo"
```

### Botones y CTAs
```
❌ "Submit"             → ✅ "Generar mi propuesta"
❌ "Save"               → ✅ "Guardar"
❌ "Delete"             → ✅ "Eliminar"
❌ "Cancel"             → ✅ "Cancelar"
❌ "Sign up"            → ✅ "Crear mi cuenta gratis"
❌ "Upgrade"            → ✅ "Desbloquear Pro"
❌ "Learn more"         → ✅ "Ver qué incluye"
```

### Estados Vacíos
```
❌ "No hay datos"       
✅ "Aún no tienes resultados guardados. ¡Crea el primero!"

❌ "Lista vacía"        
✅ "Tu historial está vacío. Cada propuesta que generes aparecerá aquí."

❌ "No results found"   
✅ "No encontramos nada con esa búsqueda. Prueba con otras palabras."
```

### Mensajes de Error
```
❌ "Error 500"
✅ "Algo salió mal de nuestro lado. Intenta de nuevo en unos segundos."

❌ "Network error"
✅ "Parece que no hay conexión a internet. Verifica tu red e intenta de nuevo."

❌ "Invalid input"
✅ "El texto es muy largo. Intenta con algo más corto (máximo 500 caracteres)."

❌ "Rate limit exceeded"
✅ "Has hecho muchas solicitudes. Espera un momento e intenta de nuevo."
```

### Mensajes de Loading (para generación IA)
Rotar entre mensajes para que no se sienta repetitivo:
```javascript
const loadingMessages = [
  "Analizando tu solicitud...",
  "Generando tu resultado...",
  "Casi listo...",
  "Poniendo los toques finales..."
];
```

### Mensajes de Éxito
El éxito nombra la CONSECUENCIA con el verbo de la acción — nunca un "¡Listo!" genérico
(mismo verbo en reposo→cargando→éxito, regla del 49/DESIGN-CORE ítem 22):
```
"Propuesta creada"            (tras "Generar mi propuesta")
"Cambios guardados ✓"         (tras "Guardar cambios")
"Copiado al portapapeles ✓"   (tras "Copiar")
"Tu cuenta está lista — empieza por tu primera propuesta."  (tras el registro; nunca "¡Bienvenido!")
```

### Placeholder Text en Inputs
```
❌ "Escribe aquí"
✅ "Describe tu producto o servicio..." (contexto específico de la app)

❌ "Search"
✅ "Busca en tus resultados..."
```

---

## Capa 3: Diseño Visual Final

### Refinamiento de Color
- Verificar que el color primario se use solo en elementos que deben llamar la atención
- Los fondos de sección deben alternar sutilmente (ej: white → gray-50 → white)
- Los bordes deben ser sutiles (gray-200, no gray-400)
- Las sombras deben ser suaves (shadow-sm, no shadow-lg en todo)

### Refinamiento de Tipografía
- Verificar jerarquía: solo 1 título grande por pantalla
- Los subtítulos/descripciones en color más suave que el texto principal
- Interlineado cómodo en textos largos (leading-relaxed)
- Peso de fuente: bold solo para títulos, medium para botones, regular para body

### Refinamiento de Espaciado
- "Respira" — si algo se siente apretado, agregar más espacio
- Secciones separadas con mínimo 32px (gap-8)
- Contenido dentro de cards con padding generoso (p-6)
- En mobile, márgenes laterales mínimo de 16px

### Favicon e Identidad
```html
<!-- Generar un favicon simple. Opciones: -->
<!-- 1. SVG con las iniciales de la app -->
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='20' fill='%23[COLOR_PRIMARIO]'/>
    <text x='50%25' y='50%25' dominant-baseline='central' text-anchor='middle' 
      fill='white' font-family='system-ui' font-size='50' font-weight='bold'>
      [INICIALES]
    </text>
  </svg>" />

<!-- 2. Emoji como favicon (rápido pero menos profesional) -->
<link rel="icon" href="data:image/svg+xml,
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <text y='.9em' font-size='90'>🚀</text>
  </svg>" />
```

### Meta Tags y SEO Básico
```html
<title>[Nombre de la App] — [Beneficio en 5 palabras]</title>
<meta name="description" content="[Descripción de 150 caracteres max]" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta property="og:title" content="[Nombre de la App]" />
<meta property="og:description" content="[Descripción]" />
<meta property="og:image" content="[URL de imagen de preview]" />
```

### Página 404 (Obligatoria)
Toda app necesita una página 404 que no sea la pantalla blanca del servidor:
```
Contenido de la 404:
- Ilustración o ícono simpático (no un error técnico)
- "Esta página no existe" (no "Error 404 Not Found")
- "Parece que te perdiste. Vuelve al inicio →"
- Botón grande para ir a Home
- Opcionalmente: campo de búsqueda o links a secciones populares
```

La 404 debe mantener el header y la navegación de la app. NUNCA mostrar una página completamente diferente.

### Transiciones entre Páginas
No cambiar de pantalla con un corte brusco. Mínimo:
```css
/* Fade simple al cambiar de ruta */
.page-enter { opacity: 0; }
.page-enter-active { opacity: 1; transition: opacity 200ms ease-out; }
.page-exit { opacity: 1; }
.page-exit-active { opacity: 0; transition: opacity 150ms ease-out; } /* salidas TAMBIÉN ease-out (doctrina del 10/14) — nunca ease-in */
```

Si se usa un router con soporte para transiciones (Next.js App Router, React Router v7+), aprovecharlo. Si no, un fade CSS simple es suficiente.

### Emails Transaccionales (si hay auth)
Los emails que envía la app deben ser tan pulidos como la app:
```
Bienvenida: 
  Subject: "Bienvenido/a a [App] 🎉"
  Contenido: Nombre del usuario + qué puede hacer primero + link directo a la app

Resultado exportado:
  Subject: "Tu [resultado] está listo"
  Contenido: Preview del resultado + link para verlo en la app

Recuperar contraseña:
  Subject: "Restablece tu contraseña"
  Contenido: Link de reset (NO incluir la contraseña en el email) + expira en 1h
```

Para MVP: Usar los templates por defecto de Supabase Auth (ya están bien). Personalizar después.

---

## Capa 4: Performance Final

### Optimizaciones Obligatorias
- **Lazy loading** de componentes que no están en la vista inicial
- **Debounce** en inputs que disparan búsquedas o llamadas API
- **Memoización** de componentes pesados que no cambian frecuentemente
- **Compresión de imágenes** (WebP preferido, AVIF si hay soporte, <200KB)
- **Limitar re-renders** con React.memo, useMemo, useCallback donde tenga impacto real
- **font-display: swap** en todas las fuentes para no bloquear el render

### Reduce Motion — Obligatorio (el patrón CORRECTO, no el "nuke" global)
`prefers-reduced-motion` significa "sin MOVIMIENTO", no "sin feedback": lo que marea es el
desplazamiento/escala, no el fade ni el color. El "nuke" global (`animation-duration: 0.01ms
!important` en `*`) está **prohibido** — mata fades que ayudan a comprender qué pasó.

```css
/* ✅ CORRECTO — neutraliza movimiento, conserva opacidad/color */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-iteration-count: 1 !important;  /* corta loops (lo que marea) */
    scroll-behavior: auto !important;
  }
  /* anula desplazamiento/escala decorativos pero NO toca opacity ni color */
  [data-motion], .stagger-1, .stagger-2, .stagger-3, .stagger-4 {
    transform: none !important;
    animation-name: fade-only !important;     /* mismo timing, sin translateY */
  }
}
@keyframes fade-only { from { opacity: 0 } to { opacity: 1 } }
```

En Motion (`motion/react`), usar `useReducedMotion()` para anular `y`/`scale` manteniendo el fade.
Esto NO es opcional (condiciones vestibulares). Patrón completo y variante JS en `10-DESIGN-TOKENS.md`.

### Qué NO Optimizar en un MVP
- No implementar service workers para offline/PWA por moda (excepción justificada: el service worker mínimo para **web push opt-in** de re-enganche — ver `24-GAMIFICACION.md`)
- No implementar SSR/SSG a menos que sea parte del stack base
- No optimizar bundles a nivel granular
- No hacer code splitting extremo
- Estas optimizaciones son para después del product-market fit

---

## Capa 5: Legal y Compliance (Ver 47-LEGAL-FISCAL-Y-PRIVACIDAD.md para detalle)

Antes de lanzar, verificar que estas páginas existen y son accesibles:
- [ ] Política de Privacidad (link en footer y registro)
- [ ] Términos de Servicio (link en footer y registro)
- [ ] Aviso de cookies (si hay usuarios europeos)
- [ ] Checkbox de aceptación en formulario de registro
- [ ] Opción de eliminar cuenta en Configuración

---

## RÚBRICAS DE EVALUACIÓN → viven en `RUBRICAS-DE-PANTALLA.md`

> Las rúbricas con las que se puntúa toda pantalla (escala de severidad, crítica de 5 ejes,
> usabilidad /40 con anclas y pistas, gate de carga cognitiva, craft visual /20, la regla del
> GATE DOBLE ≥36/40 Y ≥16/20, y las anclas de los ítems subjetivos del cierre) se extrajeron a
> **`RUBRICAS-DE-PANTALLA.md`** — la fuente canónica. Esta fase las usa en su cierre (Criterios de
> Salida, abajo); quien puntúa es el subagente `revisor-visual`, nunca quien construyó la pantalla.

---

## Checklist Final de Pulido

```
MICRO-INTERACCIONES
[ ] Todos los botones tienen hover y active states
[ ] Los inputs tienen focus states claros
[ ] Los resultados aparecen con animación
[ ] Los modales tienen animación de entrada/salida
[ ] Copiar muestra confirmación visual
[ ] Eliminar tiene confirmación + undo

COPYWRITING
[ ] Todos los textos están en el idioma del usuario final
[ ] Los botones usan verbos de acción específicos
[ ] Los estados vacíos son útiles y tienen CTA
[ ] Los errores son claros y ofrecen solución
[ ] Los loadings son conversacionales
[ ] No hay textos placeholder tipo "Lorem ipsum" ni "TODO"

DISEÑO
[ ] Paleta de colores aplicada consistentemente
[ ] Tipografía con jerarquía clara
[ ] Espaciado generoso y consistente
[ ] Favicon implementado
[ ] Meta tags de SEO configurados

PERFORMANCE
[ ] La app carga en <3 segundos
[ ] No hay errores en consola
[ ] No hay requests innecesarios
[ ] Los loadings se muestran inmediatamente tras cada acción
```

### GATE DE MICRO-CRAFT (recorrer antes de dar la fase por cerrada)

Antes de declarar el pulido terminado, **recorrer el doc `43-MICRO-CRAFT-Y-EJECUCION.md`** y verificar el detalle fino que se escapa a las rúbricas de `RUBRICAS-DE-PANTALLA.md`: tipografía fina (viudas, escala, kerning), overflow y `min-w-0` (textos largos que no rompan el layout), forms (estados, validación, autofill), touch (targets ≥44px), y dark mode robusto (no solo invertir colores).

```
[ ] Recorrido el doc 43-MICRO-CRAFT-Y-EJECUCION.md sobre la pantalla terminada
[ ] Render mirado CON DATOS REALES (nombres largos, listas vacías, números grandes),
    NUNCA con lorem ipsum ni datos de juguete — el lorem oculta los bugs de layout
[ ] Aplicado el principio "quita un accesorio antes de terminar": sacar el elemento
    decorativo que menos aporta. Casi siempre el diseño mejora al restar.
```

### Criterios de Salida de Fase 6
- [ ] Cada pantalla protagonista pasa el GATE DOBLE: ≥36/40 usabilidad Y ≥16/20 craft visual
      (rúbricas de `RUBRICAS-DE-PANTALLA.md`), puntuadas por el revisor independiente
      (subagente con contexto limpio, doctrina del 12)
- [ ] La app se siente profesional y pulida
- [ ] Todos los textos son finales (no hay placeholders)
- [ ] Las micro-interacciones están implementadas
- [ ] La performance es aceptable
- [ ] Gate de micro-craft recorrido (doc 43) con datos reales
- [ ] El usuario aprobó el look & feel final

→ **Siguiente: Cargar `08-DEPLOY.md`**
