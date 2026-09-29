# FASE 3 — ARQUITECTURA Y DISEÑO ESTRUCTURAL

## Objetivo
Definir la estructura completa de la app antes de escribir código: pantallas, flujos de usuario, componentes, y cómo se conecta todo. Este es el plano del edificio.

> Aquí se decide QUÉ datos maneja la app. El CÓMO a nivel ingeniería (esquema, índices, foreign keys, migraciones seguras y RLS de alto rendimiento) se implementa con `25-BASE-DE-DATOS.md`, y el método de auth con `26-AUTH-MODERNO.md`. Diséñalos en esta fase, antes de codear.
>
> El copy real de landing/onboarding/paywall (titulares, largo de subtítulos, densidad visual) NO
> se escribe desde este archivo — usar `52-COPY-VISUALES-CONVERSION.md` (fórmula 4 U's, presupuesto
> de palabras, densidad visual) y `19-PAGINA-DE-VENTAS.md`. Este archivo solo define QUÉ pantallas
> existen y qué elementos tiene cada una a nivel estructura, no el copy final.

---

## Paso 1: Mapa de Pantallas

Toda web app se reduce a un conjunto finito de pantallas. Identifícalas y nómbralas.

### Pantallas Obligatorias (toda web app las necesita)

**1. Landing / Pantalla de Entrada**
- Propósito: El usuario entiende qué hace la app y quiere probarla.
- Elementos: Headline + subtítulo + CTA principal + demostración visual.
- Regla: Si la app es de "valor inmediato" (generadores, calculadoras), esta pantalla puede SER la app directamente con un CTA de registro más abajo.

**2. Onboarding (la longitud la define el NICHO en 02B)**
- Propósito: Recoger la información que personaliza la primera experiencia Y construye compromiso.
- Longitud: herramienta de valor obvio -> 1-3 pasos (maximo 5); B2C personalizado -> empezar
  con 4-8. Superar 8 solo si el diagnostico es parte del producto y cada respuesta cambia algo
  visible. Ver `02B`/`60`; anotar la hipotesis y el abandono por paso en ESTADO.md.
- Elementos: 1 pregunta por pantalla + barra de progreso + botón siguiente.
- Regla: Cada pregunta debe tener opciones predefinidas (botones/chips), no campos de texto libre.

**3. Pantalla Principal / Core**
- Propósito: Donde ocurre la acción principal de la app. Es donde el usuario pasa el 80% de su tiempo.
- Elementos: Input del usuario + Output de la IA + Acciones sobre el resultado.
- Regla: Esta pantalla debe ser tan simple que un usuario de primera vez sepa usarla sin instrucciones.

**4. Historial / Mis Resultados**
- Propósito: Ver y acceder a resultados anteriores.
- Elementos: Lista/grid de resultados pasados + búsqueda/filtro + acciones (ver, editar, eliminar, exportar).
- Regla: Los resultados más recientes arriba. Formato de preview que muestre suficiente info sin abrir.

**5. Configuración / Perfil**
- Propósito: Ajustar preferencias, ver plan actual, gestionar cuenta.
- Elementos: Datos del usuario + Plan actual + Preferencias de la IA + Cerrar sesión.
- Regla: Accesible pero no prominente. Ícono de engranaje o avatar en la esquina.

**6. Pricing / Upgrade (si tiene modelo freemium)**
- Propósito: Convertir usuarios gratuitos a pagos.
- Elementos: Comparativa de planes + Beneficios claros + CTA de pago.
- Regla: No es un muro. Es una invitación. Mostrar lo que el usuario YA ha logrado gratis y lo que podría lograr como Pro.

### Pantallas Opcionales (según el tipo de app)

- **Dashboard**: Solo si la app maneja múltiples métricas o datos que el usuario necesita ver de un vistazo.
- **Templates / Biblioteca**: Si la app ofrece plantillas o recursos predefinidos.
- **Compartir / Publicar**: Si los resultados se comparten externamente.
- **Colaboración**: Si múltiples usuarios trabajan juntos.
- **Notificaciones**: Solo si hay eventos genuinos que reportar (no notificaciones fabricadas).

### Formato del Mapa

```markdown
## MAPA DE PANTALLAS — [Nombre de la App]

1. Landing Page
   → Onboarding (2 pasos)
   → Paywall
   → Login/Auth

2. App Interna
   2a. [Seccion principal: protagonista unico]
   2b. [Seccion secundaria 1]
   2c. [Seccion secundaria 2]

3. Secundarias
   3a. Perfil / Configuración (modal desde cualquier pantalla)
   3b. Pricing / Upgrade (modal o página)

4. Autenticación
   4a. Login (modal)
   4b. Registro (modal)
   4c. Recuperar contraseña (modal)

Total de pantallas únicas: [número]
```

**Regla**: Si el total supera 8 pantallas únicas, hay que simplificar. Un MVP no necesita más. (Las micro-pantallas del onboarding NO cuentan aquí: son UN flujo — "Onboarding" es 1 pantalla única en el mapa aunque tenga 20 pasos —, no secciones de la app.)

### Estructura de URLs

Definir las rutas limpias de la app:

```
/                     → Landing page o redirigir a /app
/app                  → Pantalla principal (core)
/app/history          → Historial de resultados
/app/history/:id      → Detalle de un resultado específico
/app/settings         → Configuración y perfil
/pricing              → Página de planes y precios
/login                → Login (o modal sobre cualquier página)
/signup               → Registro (o modal)
```

**Reglas de routing:**
- URLs semánticas y legibles (no `/app?view=3&tab=2`)
- Toda ruta debe funcionar como deep link (si alguien pega la URL, llega a esa pantalla)
- El botón "atrás" del navegador SIEMPRE funciona como el usuario espera
- Rutas protegidas (que requieren auth) redirigen a login si no hay sesión
- Login/signup redirigen a la app si ya hay sesión activa

---

## Paso 2: Flujo del Usuario

Define el camino exacto que sigue el usuario desde que llega hasta que paga.

### Flujo de Primer Uso (Critical Path)

```
Usuario llega por primera vez
    │
    ▼
[Landing Page] — Ve qué hace la app + demo visual
    │
    ▼
[CTA principal] — Empieza el camino elegido
    │
    ▼
[Onboarding] — Responde 1 decisión por pantalla y crea compromiso
    │
    ▼
[Resultado/Preview personalizado] — Ve valor basado en sus respuestas
    │
    ▼
[Paywall] — Entiende qué desbloquea y por qué ahora
    │
    ▼
[Login/Auth] — Guarda, desbloquea o sincroniza sin cortar el momentum
    │
    ▼
[App interna] — Entra a 3-5 secciones claras con 1 protagonista por sección
```

> No reemplazar este flujo por "landing -> pantalla core -> guardar". Ese atajo produce demos que
> funcionan, pero no productos vendibles. La secuencia canonica esta en `SECUENCIA-MAESTRA-CONSTRUCCION.md`.

### Flujo de Conversión (Free → Pro)

```
Usuario gratuito usa la app regularmente
    │
    ▼
[Alcanza un límite natural] — Se acabaron los usos diarios / quiere exportar / necesita feature avanzada
    │
    ▼
[Mensaje contextual] — NO un popup random. Un mensaje EN el momento de la necesidad.
    Ejemplo: "Has generado 3 propuestas hoy. Pasa a Pro para generar ilimitadas."
    │
    ▼
[Pantalla de Upgrade] — Comparativa clara + botón de pago
    │
    ▼
[Checkout] — Hotmart (default del SO — flujo completo en 18); Stripe solo si el proyecto lo pide explícitamente
    │
    ▼
[Confirmación + Desbloqueo inmediato] — Sin esperas, sin "tu plan se activará en 24h"
```

### Flujo de Uso Recurrente (Retención)

```
Usuario regresa a la app
    │
    ▼
[Pantalla Principal] — Ve algo nuevo o relevante desde su última visita:
    - "Tienes 3 resultados guardados"
    - "Nuevo: Probá [feature nueva]"  
    - "Tu racha: 5 días consecutivos"
    │
    ▼
[Acción del día] — Hace lo que vino a hacer
    │
    ▼
[Resultado + Refuerzo] — Resultado útil + micro-celebración
    - "¡Otra propuesta generada! Ya llevas 47 este mes."
```

---

## Paso 3: Wireframes Descriptivos

No necesitas diseñar wireframes visuales. Describe cada pantalla con suficiente detalle para que la IA pueda construirla.

### Formato de Wireframe Descriptivo

Para cada pantalla del mapa, describe:

```markdown
### Pantalla: [Nombre]

**Layout**: [Centrado simple / Sidebar + contenido / Tab bar + contenido / Full width]

**Header**:
- Izquierda: [Logo/nombre de la app]
- Centro: [Título de la sección o nada]
- Derecha: [Avatar del usuario / botón de acción]

**Contenido principal**:
- [Descripción del elemento 1, tamaño relativo, posición]
- [Descripción del elemento 2]
- [Descripción del elemento 3]

**Acciones**:
- Primaria: [Botón principal — texto + color]
- Secundaria: [Botón secundario si aplica]

**Estados especiales**:
- Vacío: [Qué se muestra si no hay datos]
- Cargando: [Tipo de loader]
- Error: [Mensaje de error]

**Comportamiento mobile**:
- [Qué cambia en pantalla pequeña]
```

---

## Paso 4: Estructura de Componentes

Define los componentes reutilizables que se usarán en toda la app.

### Componentes Base (toda app necesita estos)

```
/components
  /ui (componentes genéricos reutilizables)
    Button.tsx          — Primario, Secundario, Ghost, Danger
    Input.tsx           — Text, Textarea, Select
    Modal.tsx           — Container con overlay, animación, cierre
    Toast.tsx           — Notificaciones temporales (éxito, error, info)
    Card.tsx            — Contenedor con borde/sombra para agrupar info
    Skeleton.tsx        — Placeholder de carga
    Badge.tsx           — Etiquetas de estado (Pro, Nuevo, etc.)
    EmptyState.tsx      — Pantalla vacía con ilustración + CTA
    
  /layout (estructura de la app)
    Header.tsx          — Navegación superior
    Sidebar.tsx         — Navegación lateral (si aplica)
    TabBar.tsx          — Navegación inferior mobile (si aplica)
    PageContainer.tsx   — Wrapper con max-width y padding consistente
    
  /features (componentes específicos de la app)
    [ComponenteCore].tsx  — El componente principal de la app
    ResultCard.tsx        — Card de resultado individual
    HistoryList.tsx       — Lista de historial
    UpgradePrompt.tsx     — Prompt de conversión a Pro
    OnboardingStep.tsx    — Paso individual de onboarding
```

### Archivo de Configuración de Diseño

Centralizar constantes de diseño en un solo lugar:

```typescript
// config/design.ts — SOLO referencias a los tokens CSS del kit (10-DESIGN-TOKENS.md).
// Los valores hex viven UNA vez en app/globals.css (:root / [data-theme], derivados en 16);
// aquí JAMÁS un hex hardcodeado ni un gris genérico (text-gray-*) — el linter de diseño los rechaza.

export const DESIGN = {
  colors: {
    primary: 'var(--brand-primary)',
    primaryHover: 'var(--brand-primary-hover)',
    background: 'var(--surface-base)',
    surface: 'var(--surface-primary)',
    text: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    success: 'var(--status-success)',
    error: 'var(--status-error)',
    warning: 'var(--status-warning)',
  },
  radius: 'rounded-xl', // Consistente en toda la app
  shadow: 'shadow-sm',   // Sutil, no exagerado
  transition: 'transition-[transform,opacity,background-color] duration-200 ease-out', // nunca transition-all
  maxWidth: 'max-w-5xl',
  spacing: {
    page: 'px-4 md:px-8',
    section: 'py-8 md:py-12',
    card: 'p-4 md:p-6',
  },
  typography: {
    heading: 'font-bold tracking-tight',
    body: 'text-base leading-relaxed',
    // Neutros CON temperatura vía tokens — nunca text-gray-* (gris genérico sin tinte, ver 10/16):
    small: 'text-sm text-[var(--text-secondary)]',
    tiny: 'text-xs text-[var(--text-tertiary)]',
  }
} as const;
```

---

## Paso 5: Modelo de Datos (si la app guarda información)

Diseñar el esquema ANTES de escribir código, no al momento del deploy. **Esto es trabajo del
agente, no una conversación con el usuario** — el modelo de datos, sus índices y el método de auth
son implementación técnica pura (ver `CLAUDE.md` → "PREGUNTAR vs DECIDIR"): se diseñan, se
documentan en ESTADO.md, y se ejecutan sin presentárselos al usuario como algo a aprobar. Para cada
entidad de la app:

```markdown
## MODELO DE DATOS — [Nombre de la App]

### Entidad: [nombre, ej: generations]
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | PK, auto-generado |
| user_id | UUID | FK → profiles, indexado |
| input | TEXT | lo que el usuario escribió |
| output | TEXT | lo que la IA generó |
| created_at | TIMESTAMP | default NOW() |

### Relaciones:
- profiles 1→N generations
- [otras relaciones]

### Reglas:
- Toda tabla con datos de usuario lleva user_id + RLS
- Campos JSONB para metadata flexible (preferences, settings)
- Soft delete (deleted_at) solo si se necesita "deshacer"; si no, DELETE real
```

**Preguntas para que el AGENTE se responda a sí mismo (no se le hacen al usuario):**
1. ¿Qué necesita persistir entre sesiones? (eso son tablas)
2. ¿Qué se calcula al vuelo? (eso NO son tablas)
3. ¿Qué consultas hará la app más frecuentemente? (eso define los índices)

El SQL concreto de creación se ejecuta en la Fase 7 (`08-DEPLOY.md`), pero el diseño se decide aquí.

---

## Paso 6: Definición de API / Lógica de IA

Si la app usa IA (que casi siempre lo hará), define:

### Estructura de Llamadas a IA

```markdown
## LLAMADAS A IA — [Nombre de la App]

### Llamada Principal: [nombre descriptivo]
- Trigger: [qué acción del usuario la dispara]
- Input: [qué datos se envían]
- Prompt del sistema: [instrucción para la IA — definir con detalle]
- Output esperado: [formato y estructura de la respuesta]
- Tiempo estimado: [X segundos]
- Fallback si falla: [qué mostrar si la API no responde]

### Llamada Secundaria: [si aplica]
- [misma estructura]
```

### Manejo de Errores de IA

```
Si la API de IA no responde:
  → Mostrar: "La IA está tardando más de lo normal. ¿Quieres intentar de nuevo?"
  → Botón: "Reintentar" (máximo 2 reintentos automáticos)
  → Si falla 3 veces: "Lo sentimos, hay un problema técnico. Intenta en unos minutos."

Si la respuesta de IA es basura/irrelevante:
  → Mostrar botón: "Esto no es lo que esperaba — Regenerar"
  → Registrar el feedback para mejorar el prompt

Si el usuario excede su límite:
  → NO dar error. Mostrar: "Has usado tus 3 generaciones gratuitas de hoy. 
     Vuelve mañana o pasa a Pro para generar sin límites."
  → CTA directo al upgrade
```

---

## CHECKLIST DE ARQUITECTURA POR TIPO DE APP

Antes de aprobar el mapa de pantallas, verificar cuál es el tipo de app y aplicar los requisitos de su categoría. Estos son patrones que el usuario espera porque la competencia los tiene.

### Apps de gestión de contenido / calendario / planificación
(gestión de redes sociales, tareas, proyectos, editorial, CRM)
```
VISTAS OBLIGATORIAS — al menos 2 de estas 3:
  ✅ Vista de lista (con filtros por estado, tipo, fecha)
  ✅ Vista de calendario/tablero (como los community managers profesionales)
  ✅ Vista semanal (con fechas reales + navegación ← → entre semanas)

CADA VISTA TIENE:
  ✅ Fechas reales visibles (nunca solo "Esta semana" — mostrar "Jun 16-22, 2026")
  ✅ Navegación al período anterior y siguiente (← →)
  ✅ Filtros: por estado, por tipo/categoría, por entidad (marca/proyecto/persona)
  ✅ Estado visual por fecha: neutro (futura) / amarillo (próxima 24-48h) / rojo (vencida)

INTERACCIONES ESTÁNDAR:
  ✅ Acciones de creación ("+ nuevo", "agregar", "crear") viven en el contexto visual
     de lo que crean — cerca de la lista o sección a la que pertenecen, visibles
     sin scroll, consistentes en toda la app
  ✅ Cards clicables que abren detalle o edición
  ✅ Drag & drop para reordenar si el contenido tiene orden relevante
```

### Apps de tracking / hábitos / progreso personal
(fitness, finanzas, productividad, bienestar, aprendizaje)
```
VISTAS OBLIGATORIAS:
  ✅ Vista de hoy (acción inmediata)
  ✅ Vista de tendencia/histórico (gráficos de progreso en el tiempo)

GAMIFICACIÓN MÍNIMA (ver también 11-DISENO-EMOCIONAL.md):
  ✅ Racha de constancia (días consecutivos)
  ✅ Al menos 2 tipos de logros/hitos adicionales (no solo racha)
  ✅ Progreso hacia metas con porcentaje o barra visual
  ✅ Celebración en momentos reales (primera semana, primer mes, récord personal)
```

### Apps con múltiples entidades del usuario
(múltiples marcas, proyectos, cuentas, clientes)
```
NAVEGACIÓN ENTRE ENTIDADES:
  ✅ Tabs o selector visible con nombre + ícono/avatar de cada entidad
  ✅ Acción de crear nueva entidad en el contexto visual del selector
     (donde el usuario ya está mirando cuando quiere agregar una más)
  ✅ Estado visual que diferencia la entidad activa de las inactivas
  ✅ Si es un plan con límites: mostrar cuántas entidades quedan disponibles
```

### Apps con planes de precio y límites
```
ANTES DE CONSTRUIR documentar en ESTADO.md:
  ✅ ¿Qué puede hacer el plan gratis? [lista exacta con números: "2 marcas, 10 posts/mes"]
  ✅ ¿Qué desbloquea el plan pago? [diferencias concretas]
  ✅ ¿Qué ve el usuario cuando llega al límite? [mensaje + CTA al upgrade, nunca error técnico]

EN EL CÓDIGO:
  ✅ Verificar límite ANTES de crear un nuevo ítem (a nivel UX: mostrar el paywall, no un error)
  ⚠️ OJO concurrencia: esa verificación NO puede ser "SELECT count → decidir en JS → INSERT" (es
     una race condition: dos peticiones simultáneas se cuelan y violan el límite → pagas de más en
     cuotas de IA). La verificación debe ser ATÓMICA con la creación. Implementación correcta (UPDATE
     condicional / RPC security definer transaccional) en `25-BASE-DE-DATOS.md` → "TRANSACCIONES Y ATOMICIDAD".
  ✅ El paywall/upsell aparece con el valor del plan pago, no como un muro de error
  ✅ Los límites nunca se ignoran silenciosamente
```

---

## INVESTIGACIÓN DE COMPETIDORES (hacer en la fase de arquitectura)

Antes de definir el mapa de pantallas definitivo, buscar con búsqueda web las top 3-5 apps del mismo sector. Leer específicamente las reseñas de 1-2 estrellas para identificar lo que falla — eso es la oportunidad de diferenciación.

Documentar en ESTADO.md:
```
Competidor 1: [nombre] — Calificación [X.X] — [N] reseñas
  Lo que hacen bien: [...]
  Lo que critican los usuarios: [...]
  
Vistas/features que tiene TODA app del sector (son expectativas del usuario):
  - [lista]

Nuestra diferenciación: [cómo lo hacemos mejor]
```

---

## Entregable de Fase 3

El documento completo incluye:
1. Mapa de pantallas con jerarquía
2. Flujo de primer uso completo
3. Flujo de conversión
4. Flujo de retención
5. Wireframes descriptivos de cada pantalla
6. Estructura de componentes
7. Configuración de diseño
8. Definición de llamadas a IA

### Criterios de Salida de Fase 3
- [ ] Todas las pantallas están identificadas y tienen propósito claro
- [ ] Los flujos de usuario están definidos (primer uso, conversión, retención)
- [ ] Cada pantalla tiene su wireframe descriptivo
- [ ] Los componentes reutilizables están listados
- [ ] La lógica de IA está definida (inputs, outputs, fallbacks)
- [ ] El usuario aprobó la arquitectura

→ **Siguiente: Cargar `05-CREACION.md`**
