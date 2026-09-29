# FASE 4 — CREACIÓN DEL MVP

> ⚠️ **Antes de CADA pantalla:** relee `PREFLIGHT-PANTALLA.md` y emite la spec pre-código.
> El diseño lo mandan `DESIGN-CORE.md` + `FICHA-ARTE.md`; la primera pantalla de cada tipo se
> compone mirando el ejemplo del `53-PANTALLA-CANONICA.md`. Si la pantalla muestra datos → `17`;
> si toca racha/momentos → `24` + `56`.

> **Cuándo cargar este archivo:**
> - Cuando vas a construir la app (junto con `10-DESIGN-TOKENS.md`)
> - Ya tienes: App Brief, arquitectura definida, y pantallas claras
> - CLAUDE.md cubre las reglas de código esenciales; este archivo añade el proceso paso a paso y patrones avanzados

## Objetivo
Construir la app funcional completa. Código real, que funcione, que se vea profesional, y que el usuario pueda desplegar.

> Las decisiones técnicas de esta fase (estructura del modelo de IA, sync/async, esquema de datos,
> nombres de tablas/rutas) se DECIDEN y se documentan en ESTADO.md — no se le presentan al usuario
> como una elección a aprobar (ver `CLAUDE.md` → "PREGUNTAR vs DECIDIR"). El copy final de cualquier
> pantalla que venda/cobre/convierta sigue el presupuesto de palabras y las fórmulas de
> `52-COPY-VISUALES-CONVERSION.md`, no se improvisa aquí.

## Puerta de Entrada: No Empieces por el Dashboard

Antes de crear componentes, rutas o pantallas internas, cargar y obedecer
`SECUENCIA-MAESTRA-CONSTRUCCION.md`.

Orden obligatorio para una app vendible:

```
1. Pagina de ventas
2. Onboarding
3. Paywall
4. Login/Auth
5. App interna
6. Servicios externos
```

Si todavia no existen la pagina de ventas, el onboarding, el paywall y el login/auth UX, este archivo
NO autoriza a construir un dashboard interno. Primero se construye el camino que vende y activa; despues
la herramienta interna.

---

## Reglas de Código Absolutas

### Regla 1: Código Completo, No Esqueletos
Cada archivo que generes debe estar COMPLETO y FUNCIONAL. No "// TODO", no "// implementar aquí", no "placeholder". Si una función debe hacer algo, que lo haga. El usuario no debe escribir una sola línea de código.

### Regla 2: Un Archivo = Una Responsabilidad
Cada archivo hace una cosa. Un componente por archivo. La lógica separada de la presentación cuando tenga sentido. Pero no sobre-ingeniear: un MVP no necesita 47 archivos.

### Regla 3: Nombramiento Claro
Nombres descriptivos en inglés para código (es el estándar de la industria), pero comentarios y textos UI en el idioma del usuario.

### Regla 4: Responsive Primero
Todo código CSS es mobile-first. Primero diseña para 375px, luego agrega breakpoints para tablet (768px) y desktop (1024px+).

### Regla 5: Accesibilidad Obligatoria
- HTML semántico (header, nav, main, section, article, footer — no div soup)
- Todos los botones e inputs con aria-labels si no tienen texto visible
- Contraste WCAG AA mínimo (4.5:1 texto normal, 3:1 texto grande)
- Navegación por teclado funcional (Tab, Enter, Escape)
- Focus visible solo con teclado (:focus-visible)
- Alt text en imágenes
- `<html lang="es">` (o el idioma que corresponda)
- Respetar `prefers-reduced-motion` y `prefers-color-scheme`

### Regla 6: Git Hygiene
Si el proyecto usa git (recomendado siempre):
```bash
# .gitignore — SIEMPRE incluir:
.env
.env.local
.env.production
node_modules/
dist/
.next/
.vercel/

# .env.example — SIEMPRE crear para documentar qué variables se necesitan:
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
# Nota: las claves sensibles (API_KEY de IA) van en el servidor, no aquí
```

Commits frecuentes con mensajes descriptivos:
```
feat: add generation history page
fix: prevent double-click on generate button
style: improve mobile layout for results card
```

### Regla 7: Patrones Modernos del Framework (anti-antipatrones)
Estos errores compilan y "funcionan" pero delatan código amateur y dañan performance:
```
- Validar en los BORDES con zod: todo input externo (formData, body, params, respuesta de IA,
  webhooks) se parsea y valida antes de tocar la lógica. Adentro, tipos confiables.
- Imágenes con next/image (priority+sizes en el hero) y fuentes con next/font — nunca <img> crudo
  ni <link> a Google Fonts (penaliza LCP y CLS).
- Si el framework es Next.js (App Router): NO hacer fetch en useEffect (usar Server Components
  async), 'use client' solo en la hoja interactiva, Server Actions solo para mutaciones.
  → Patrones completos en 28-INGENIERIA-NEXTJS.md. LEERLO antes de escribir componentes en Next.
- Estados como discriminated unions (loading/success/error), no booleanos sueltos que permiten
  estados imposibles.
- Si la feature usa IA: texto corto → streaming; **imagen/audio o texto largo (>15s) → PARA y lee
  `30-INTEGRACION-IA.md` antes de codear** (job asíncrono + Supabase Storage + tabla `media_jobs` +
  resiliencia). NUNCA generes imagen/audio dentro del request del usuario.
```

---

## Proceso de Creación (Orden de Ejecución)

### Paso 1: Setup del Proyecto

Si es una app React (recomendado para la mayoría de casos):

```bash
# Estructura base del proyecto
src/
  app/                   # Páginas/rutas principales
    page.tsx             # Landing o Pantalla principal
    layout.tsx           # Layout compartido
  components/
    ui/                  # Componentes base reutilizables
    features/            # Componentes específicos de la app
    layout/              # Header, Sidebar, etc.
  lib/
    ai.ts                # Lógica de llamadas a IA
    utils.ts             # Funciones de utilidad
    constants.ts         # Constantes y configuración
  hooks/                 # Custom hooks
  types/                 # TypeScript types/interfaces
  styles/
    globals.css          # Estilos globales y variables CSS
```

### Paso 2: Crear los Componentes Base

Antes de construir features, establece los componentes base que se reutilizarán en toda la app. Estos deben seguir el sistema de diseño definido en la Fase 3.

**Componentes UI base mínimos:**

```typescript
// Button — con variantes: primary, secondary, ghost, danger
// Debe incluir: estado loading, estado disabled, tamaños sm/md/lg

// Input — con variantes: text, textarea, search
// Debe incluir: label, placeholder, error message, focus states

// Modal — con overlay, animación de entrada/salida
// Debe incluir: cerrar con Escape, click fuera, botón X

// Toast — notificaciones temporales
// Debe incluir: variantes success/error/info, auto-dismiss en 3-5s

// Card — contenedor con estilo consistente
// Debe incluir: variantes con/sin hover, con/sin borde

// Skeleton — placeholder de carga
// Debe incluir: variantes para texto, card, imagen

// EmptyState — para listas/secciones vacías
// Debe incluir: ícono, título, descripción, CTA
```

Si estás en un entorno con shadcn/ui disponible, úsalo como base y customiza los estilos. No reinventes la rueda en componentes base.

### Paso 3: Construir el Layout Principal

```typescript
// Layout structure
// ┌──────────────────────────────┐
// │         Header               │  ← Logo + Nav + User Avatar
// ├──────────────────────────────┤
// │                              │
// │      Contenido Principal     │  ← Cambia según la ruta
// │                              │
// ├──────────────────────────────┤
// │      Tab Bar (mobile)        │  ← Solo visible en mobile si aplica
// └──────────────────────────────┘
```

**Header recomendado:**
- Izquierda: Logo o nombre de la app (link a home)
- Centro: Navegación principal (desktop) o nada (mobile)
- Derecha: Avatar/ícono del usuario → dropdown con: Mi cuenta, Plan, Cerrar sesión

### Paso 4: Construir la Pantalla Correcta de la Secuencia

La pantalla que toca depende de `SECUENCIA-MAESTRA-CONSTRUCCION.md`. No saltar directo a la app interna.

Orden de construccion:

```
/              → pagina de ventas
/onboarding    → onboarding personalizado
/paywall       → oferta/planes
/login         → acceso y guardado
/app           → app interna simplificada
```

Cuando finalmente toque la app interna, construir la accion core con este patrón:

```
┌─────────────────────────────────┐
│  Título claro de qué hacer      │
│  Subtítulo con instrucción breve│
├─────────────────────────────────┤
│                                 │
│  [INPUT DEL USUARIO]            │
│  Campo de texto, selector,      │
│  upload, o lo que aplique        │
│                                 │
│  [BOTÓN DE ACCIÓN PRINCIPAL]    │
│  "Generar" / "Analizar" / etc.  │
│                                 │
├─────────────────────────────────┤
│                                 │
│  [RESULTADO / OUTPUT]           │
│  Lo que la IA genera            │
│  Con botones: Copiar, Guardar,  │
│  Regenerar, Exportar            │
│                                 │
└─────────────────────────────────┘
```

### Paso 5: Implementar la Lógica de IA

> ⚠️ **SOLO SERVIDOR.** Este código llama a la API de IA con tu clave secreta, así que vive
> en el servidor y JAMÁS se importa desde un componente cliente. En Next.js va en un Route
> Handler (`app/api/generate/route.ts`, como abajo). En Vite NO existe servidor propio:
> este código va en una **Edge Function de Supabase** o en un backend aparte — nunca en
> `src/`, porque todo lo que está en `src/` se bundlea al navegador y expondría la clave.
> El handler BFF completo (con auth, validación zod y rate limit) está en
> `09-SEGURIDAD.md` — esa es la referencia canónica; esto es la versión mínima.

```typescript
// app/api/generate/route.ts — Route Handler de Next.js (SOLO SERVIDOR)

interface AIRequest {
  input: string;
  context?: Record<string, any>;
  userId?: string;
}

interface AIResponse {
  result: string;
  metadata?: Record<string, any>;
}

async function generateWithAI(request: AIRequest): Promise<AIResponse> {
  // 1. Construir el prompt con el sistema definido en Fase 3
  const systemPrompt = `[Instrucción del sistema para la IA]`;

  // 2. Llamar a la API
  // NOTA: el modelo va en una constante/env var, NUNCA hardcodeado en cada llamada.
  // Verificar cuál es el modelo vigente recomendado al momento de construir.
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!, // env var de SERVIDOR (sin NEXT_PUBLIC_)
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: AI_MODEL, // desde constants.ts o process.env.AI_MODEL
      max_tokens: 1024, // limitar SIEMPRE — el output es el costo más caro
      system: systemPrompt,
      messages: [{ role: 'user', content: request.input }]
    })
  });

  // 3. Parsear la respuesta
  if (!response.ok) {
    throw new Error('AI generation failed');
  }

  const data = await response.json();
  const text = data.content
    .filter((block: any) => block.type === 'text')
    .map((block: any) => block.text)
    .join('\n');

  return { result: text };
}

export async function POST(req: Request) {
  const { input } = await req.json();
  // En producción: validar sesión + zod + rate limit ANTES de llamar a la IA (ver 09-SEGURIDAD.md)
  const result = await generateWithAI({ input });
  return Response.json(result);
}
```

### Paso 6: Construir Pantallas Secundarias

En este orden de prioridad:
1. **Historial** — Para que el usuario vea sus resultados anteriores
2. **Configuración** — Perfil básico + preferencias
3. **Pricing/Upgrade** — Solo si el modelo freemium está implementado

### Paso 7: Implementar Estados Especiales

Para CADA pantalla, implementar:

```typescript
// Loading State
{isLoading && <SkeletonLoader />}

// Empty State
{!isLoading && items.length === 0 && (
  <EmptyState
    icon={<FileText />}
    title="Aún no tienes resultados"
    description="Genera tu primera propuesta y aparecerá aquí"
    actionLabel="Crear mi primera propuesta"
    onAction={() => navigate('/generate')}
  />
)}

// Error State
{error && (
  <ErrorMessage
    message="No pudimos completar la acción"
    suggestion="Intenta de nuevo o usa un texto más corto"
    onRetry={handleRetry}
  />
)}

// Success State
{showSuccess && (
  <Toast type="success" message="Resultado guardado" />
)}
```

---

## Patrones de Código Específicos para Web Apps con IA

### Patrón: Streaming de Respuestas IA
Para respuestas largas, mostrar el texto progresivamente:

**Opción A: Streaming real (SSE) — recomendado si el backend lo soporta**
La API de Anthropic soporta streaming. El backend envía chunks al frontend via Server-Sent Events:

```typescript
// En el frontend: leer stream del backend
async function generateStreaming(input: string, onChunk: (text: string) => void) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    body: JSON.stringify({ input }),
  });
  
  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  
  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    fullText += chunk;
    onChunk(fullText); // Actualizar UI con cada chunk
  }
}
```

**Opción B: Simulación de typing — para cuando el backend devuelve todo de golpe**
```typescript
const [displayText, setDisplayText] = useState('');

useEffect(() => {
  if (!fullText) return;
  let i = 0;
  const interval = setInterval(() => {
    setDisplayText(fullText.slice(0, i));
    i += 3; // 3 caracteres a la vez (más natural)
    if (i > fullText.length) {
      setDisplayText(fullText);
      clearInterval(interval);
    }
  }, 15);
  return () => clearInterval(interval);
}, [fullText]);
```

**Regla**: Si la respuesta tarda >2 segundos, siempre usar una de las dos opciones. Nunca mostrar un spinner durante 10 segundos y luego todo el texto de golpe.

### Patrón: Límite de Uso Gratuito
```typescript
const FREE_DAILY_LIMIT = 3;

function checkUsageLimit(user: User): { allowed: boolean; remaining: number } {
  if (user.plan === 'pro') return { allowed: true, remaining: Infinity };
  
  const todayUsage = user.usageToday || 0;
  return {
    allowed: todayUsage < FREE_DAILY_LIMIT,
    remaining: Math.max(0, FREE_DAILY_LIMIT - todayUsage)
  };
}

// En el componente, cuando el límite se alcanza:
// NO bloquear con un muro. Mostrar un upgrade contextual amigable.
```

### Patrón: Persistencia de Datos (sin backend)
Para MVPs sin backend, hay dos escenarios:

**Escenario A: App desplegada (Vercel, Netlify, etc.)**
Usar localStorage para persistir datos entre sesiones:

```typescript
// hooks/useLocalStorage.ts
function useLocalStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(stored) : value;
    setStored(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [stored, setValue] as const;
}
```

**Escenario B: Artifact dentro de Claude**
localStorage NO está disponible en artifacts de Claude. Usar:
- `useState` / `useReducer` para datos de la sesión actual
- `window.storage` (API de artifacts) para persistencia entre sesiones:
```typescript
// Guardar: await window.storage.set('results', JSON.stringify(data));
// Leer:   const res = await window.storage.get('results');
```

La IA debe detectar en qué escenario se está trabajando y usar el patrón correcto.

### Patrón: Protección de Rutas
```typescript
// Si el usuario no está autenticado, redirigir al login
// Si el usuario gratuito intenta acceder a feature Pro, mostrar upgrade
// NUNCA mostrar una página en blanco o un error 403
```

---

## Manejo de Assets durante la Creación

### Íconos
```typescript
// Usar Lucide React — ya disponible en el entorno
import { Home, Settings, User, Search, Plus, X, Check, AlertCircle } from 'lucide-react';

// Tamaños consistentes:
// Navegación: size={20}
// Botones: size={16}
// Estados vacíos: size={48}
// Decorativos: size={24}
```

### Imágenes
Si la app necesita imágenes y el entorno permite generarlas:
- Generar con IA (DALL-E, Midjourney, Ideogram) especificando estilo consistente
- Guardar como archivos optimizados (WebP preferido, <200KB)

Si NO puede generar imágenes:
```typescript
// Usar gradientes CSS o SVGs como sustituto visual
// Para avatares: UI Avatars API (gratis, sin API key)
<img src={`https://ui-avatars.com/api/?name=${userName}&background=random`} />

// Para placeholders de contenido:
<div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl 
     flex items-center justify-center aspect-video">
  <span className="text-primary/40 text-sm">Imagen pendiente</span>
</div>

// Para íconos/ilustraciones simples: SVG inline
```

### Fuentes
```html
<!-- Google Fonts — elegir UNA fuente display + UNA sans-serif -->
<!-- Cargar solo los pesos necesarios. (Vite/HTML plano: este <link>. En Next.js NO uses <link>: usa next/font — el <link> penaliza LCP/CLS, ver 28-INGENIERIA-NEXTJS.md) -->
<link href="https://fonts.googleapis.com/css2?family=[Display]:wght@600;700&family=[Body]:wght@400;500;600&display=swap" rel="stylesheet">
```

**NO usar**: Inter, Roboto, Arial, system fonts genéricos. Elegir algo con personalidad que se alinee con el tono de la app.

---

## Patrones Técnicos Críticos (No Opcionales)

### Patrón: Error Boundaries (Obligatorio)

Toda app React DEBE tener Error Boundaries. Sin ellos, un error en cualquier componente muestra una pantalla blanca.

```typescript
// components/ErrorBoundary.tsx — Componente clase (requerido por React)
import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; }

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div role="alert" className="p-6 text-center">
          <p className="font-medium">Algo salió mal</p>
          <button onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**Placement obligatorio — un boundary por sección, NO uno global:**
```tsx
<ErrorBoundary fallback={<AppCrashScreen />}>      {/* catch-all */}
  <Header />
  <ErrorBoundary fallback={<SectionError />}>       {/* main */}
    <MainContent />
  </ErrorBoundary>
  <ErrorBoundary fallback={<SidebarFallback />}>    {/* sidebar */}
    <Sidebar />
  </ErrorBoundary>
</ErrorBoundary>
```

### Patrón: Seguridad de API Keys (Obligatorio)

**NUNCA llamar a APIs de IA directamente desde el frontend con API keys.** Ver `09-SEGURIDAD.md` para el patrón BFF completo. Si es un artifact de Claude las llamadas se manejan internamente, pero si se despliega como app independiente, el patrón BFF es obligatorio.

### Patrón: State Management

```
useState          → Estado local de un componente (formularios, toggles)
useReducer        → Estado local complejo con múltiples acciones
Context           → Estado compartido que cambia pocas veces (tema, auth)
Zustand/Jotai     → Estado global que cambia frecuentemente (caché, datos complejos)
TanStack Query    → Datos de servidor (APIs). Cache, refetch, loading automáticos.
```

**Regla para MVP:** useState + Context cubre el 90% de los casos. No instalar estado global externo a menos que sea realmente necesario.

### Patrón: HTML Semántico (Obligatorio)

Usar `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>` en vez de `<div>` para todo. Los lectores de pantalla dependen de esto para navegar. También mejora SEO.

### Patrón: Optimistic UI

Para acciones simples (guardar, like, toggle), actualizar la UI ANTES de la confirmación del servidor:

```typescript
async function saveResult(result: Result) {
  // 1. Actualizar UI inmediatamente
  setResults(prev => [...prev, result]);
  try {
    await api.save(result); // 2. Confirmar con servidor
  } catch {
    setResults(prev => prev.filter(r => r.id !== result.id)); // 3. Revertir si falla
    showToast('error', 'No se pudo guardar. Intenta de nuevo.');
  }
}
```

---

## Checklist de Creación

Antes de dar el MVP por terminado:

```
SECUENCIA
[ ] Pagina de ventas creada o estructura final aprobada
[ ] Onboarding creado o flujo final aprobado
[ ] Paywall creado o pantalla final aprobada
[ ] Login/Auth UX creado o flujo final aprobado
[ ] App interna construida DESPUES de lo anterior
[ ] App interna con 3-5 secciones maximo
[ ] Cada seccion tiene 1 protagonista principal y maximo 2 secundarios
[ ] No hay secciones duplicadas ni pestañas con el mismo trabajo

FUNCIONALIDAD
[ ] La acción core funciona de principio a fin
[ ] Los resultados de IA se muestran correctamente
[ ] El historial guarda y muestra resultados anteriores
[ ] Los estados de carga se muestran correctamente
[ ] Los errores se manejan con mensajes claros
[ ] El onboarding funciona y lleva al usuario a la acción core

DISEÑO
[ ] Mobile responsive (probar en 375px)
[ ] Colores consistentes con el sistema de diseño
[ ] Tipografía con jerarquía clara
[ ] Espaciado consistente
[ ] Todos los botones tienen hover/active states
[ ] Modales funcionan correctamente (abrir, cerrar, overlay)

CÓDIGO
[ ] Sin errores en consola
[ ] Sin console.log dejados por accidente
[ ] Sin API keys expuestas
[ ] TypeScript sin errores (si se usa TS)
[ ] Nombres de variables/funciones descriptivos
```

---

## MANDAMIENTOS DE UX PARA FUNCIONES CON IA (aplicar en TODA función que use modelos)

Estas 4 reglas son las más ignoradas al construir con IA — y las que más afectan la confianza del usuario. Aplicarlas en CADA función que genere, sugiera, procese o personalice con IA:

### Mandamiento 1: La IA solo entra donde reduce esfuerzo REAL
```
- Antes de añadir IA a una función, preguntarse: ¿la IA aquí resume, clasifica, transforma,
  compara, prioriza, detecta patrones, sugiere pasos o crea un borrador editable?
- Si la IA solo agrega espera, incertidumbre y correcciones → está empeorando la UX
- Combinar IA con UI estructurada: plantillas, chips, sliders, previews, confirmaciones
- Una caja de texto abierta NO es una interfaz de IA — combinarla con opciones predefinidas,
  sugerencias y rutas de acción concretas
- Criterio: ¿la IA reduce pasos, reduce duda, mejora calidad o personaliza mejor que sin IA?
```

### Mandamiento 2: La IA declara qué puede y qué NO puede hacer
```
- Mostrar capacidades y límites en lenguaje simple, justo donde afecta la acción
- No decir "resultado perfecto" — sí decir "puedo ayudarte a organizar y resumir; revisa antes de enviar"
- Mostrar nivel de confianza o advertencias cuando el resultado sea incierto
- Diferenciar claramente: sugerencia / borrador / decisión automática / acción final
- En tareas de IA: mostrar qué etapa está ocurriendo ("analizando documento", "comparando opciones")
  — no basta un spinner genérico de "cargando"
- Una IA que reconoce límites se siente más confiable que una que promete perfección
```

### Mandamiento 3: La IA permite editar, corregir, rechazar y entender
```
- Toda salida importante de IA debe tener: aceptar / editar / regenerar / rechazar / deshacer
- Permitir modificar parámetros visibles: tono, longitud, formato, nivel, restricciones
- NO bloquear al usuario con una única salida generada
- NO aplicar automáticamente cambios de alto impacto sin revisión explícita del usuario
- Acciones que publican, envían, borran, cobran o comparten deben requerir control
  explícito si hay riesgo real — la IA propone, el humano decide
- Recoger feedback granular: no solo pulgar arriba/abajo — "muy largo", "tono incorrecto",
  "dato equivocado" mejora la experiencia y ayuda al usuario a ajustar
```

### Mandamiento 4: La personalización es transparente y controlable
```
- Mostrar por qué algo fue recomendado: "porque practicaste X" / "por tu meta de esta semana"
- Permitir editar preferencias y borrar o reiniciar datos de personalización
- Si la app aprende preferencias y adapta la experiencia → avisar y explicar
- El usuario debe poder responder: "¿por qué veo esto?" y "¿cómo lo cambio?" sin soporte
- NO usar personalización para esconder opciones o empujar al usuario sin transparencia
- NO asumir que una acción aislada define una preferencia permanente
- La personalización "mágica" que ayuda genera deleite; la que oculta genera desconfianza
```

### Checklist para toda función con IA (10 puntos — recorrer antes de aprobar)
```
[ ] La IA se usa porque reduce esfuerzo real, no porque esté de moda
[ ] El usuario entiende qué puede hacer la IA y cuáles son sus límites
[ ] La IA muestra incertidumbre o pide revisión cuando el contexto lo requiere
[ ] Las salidas importantes se pueden editar, comparar, descartar y deshacer
[ ] La app NO aplica automáticamente decisiones de alto impacto sin control humano
[ ] El usuario puede corregir preferencias, datos e inferencias equivocadas
[ ] La personalización explica por qué muestra una recomendación
[ ] Los datos usados por IA se explican y se controlan desde privacidad
[ ] La calidad se mide por valor logrado, no por número de prompts o generaciones
[ ] Los errores de IA se convierten en mejora de UX, no en mensajes genéricos de "algo salió mal"
```

---

## Entregable de Fase 4
- Código completo y funcional del MVP
- Todos los componentes implementados
- Lógica de IA funcionando
- Pantallas principales construidas y conectadas
- Estados especiales (loading, empty, error) implementados

### Criterios de Salida de Fase 4
- [ ] La secuencia de producto funciona de principio a fin sin errores
- [ ] El flujo de primer uso está implementado: landing -> onboarding -> paywall -> login/auth -> app interna
- [ ] La pantalla de valor de la etapa correspondiente genera resultados con IA cuando aplica
- [ ] El diseño es responsive
- [ ] Los estados especiales están implementados
- [ ] El usuario probó la app y funciona

→ **Siguiente: Cargar `06-TESTING.md`**
