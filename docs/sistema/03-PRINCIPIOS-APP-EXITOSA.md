# FASE 2 — PRINCIPIOS DE UNA WEB APP EXITOSA

> **Cuándo cargar este archivo:**
> - Al definir cómo debe sentirse la app (antes de escribir código)
> - Al auditar una app existente para encontrar problemas de UX
> - Junto con `06-TESTING.md` y `07-PULIDO.md` para mejorar una app ya creada

## Objetivo
Este documento define las reglas obligatorias de UX, diseño, experiencia y estructura que TODA web app creada con este sistema debe cumplir. No es opcional. Es el estándar de calidad.

---

## LOS 10 MANDAMIENTOS DE UNA WEB APP EXITOSA

> Son 10 mandamientos aquí **+ 6 principios adicionales obligatorios** en la sección "PRINCIPIOS ADICIONALES" más abajo → **16 principios en total**.

### 1. Máximo 1-2 Elementos de Acción por Pantalla
La pantalla tiene UN propósito. El usuario debe saber qué hacer en menos de 2 segundos al verla. Si hay duda, hay demasiado.

- ✅ Pantalla de generación: 1 campo de texto + 1 botón de "Generar"
- ✅ Pantalla de resultados: El resultado + 2 acciones (Copiar / Regenerar)
- ❌ Dashboard con 6 cards, 3 gráficos, un sidebar con 12 opciones, y un banner promocional

**Regla técnica**: Si estás agregando un tercer botón de acción principal a una pantalla, necesitas un modal o una nueva pantalla.

### 2. Onboarding que No Se Siente como Onboarding
El usuario NO debe sentir que está configurando algo. Debe sentir que ya está usando la app.

**Patrón recomendado — Onboarding Integrado (versión corta, B2B/utilidad):**
1. Pantalla 1: "¿Cómo te llamas?" (solo el nombre, nada más)
2. Pantalla 2: Una pregunta relevante para personalizar (nicho, objetivo, etc.)
3. Pantalla 3: YA está usando la app con un resultado de ejemplo pre-cargado

**La longitud la define la estrategia de `02B-ONBOARDING-Y-PAYWALL.md` según el nicho** (B2B/utilidad: ≤3 pasos directos al valor; B2C emocional: extenso con micro-compromisos, estilo Cal AI). Ver 02B — la decisión se toma en la Sesión 1 y se documenta en ESTADO.md.

**Lo que NUNCA debe tener un onboarding:**
- Formularios largos
- Pedir email + contraseña antes de mostrar valor (primero el valor, luego el registro)
- Tours guiados con 8 tooltips que nadie lee
- Videos explicativos obligatorios
- Términos y condiciones antes de ver la app

**Patrón avanzado — Value First:**
El usuario puede usar la app SIN registrarse para su primera acción. Cuando quiere guardar el resultado o hacer una segunda, ahí sí le pides que se registre. Ya probó el valor. Ya está enganchado.

### 3. Modales como Extensión, No como Interrupción
Los modales flotantes son la herramienta perfecta para mantener las pantallas limpias sin sacrificar funcionalidad.

**Usar modales para:**
- Configuración y ajustes avanzados
- Confirmaciones de acciones importantes (eliminar, cancelar plan)
- Detalles expandidos de un elemento (ver más info sin cambiar de pantalla)
- Formularios secundarios (editar perfil, cambiar plan)
- Resultados detallados o previews

**NO usar modales para:**
- La acción principal de la pantalla
- Mensajes de bienvenida (usar toast o banner sutil)
- Información crítica que el usuario necesita ver siempre
- Modales dentro de modales (NUNCA)

**¿Modal, Drawer, o Nueva Página? (Guía de decisión)**
```
¿El contenido necesita >50% de la pantalla? 
  → SÍ → Nueva página (con animación de transición)
  → NO ↓

¿Es una acción rápida que no cambia el contexto?
  → SÍ → Modal centrado (configuración, confirmación, preview)
  → NO ↓

¿Es una lista, filtro, o navegación secundaria?
  → SÍ → Drawer lateral (slide desde la derecha)
  → NO → Modal por defecto
```

En mobile, los drawers salen desde abajo (bottom sheet), no desde el lado.

**Gestión de Toasts (cola y prioridad):**
```
- Máximo 3 toasts visibles simultáneamente
- Se apilan verticalmente (el más nuevo arriba o abajo, consistente)
- Auto-dismiss: Success = 3s, Info = 5s, Error = 8s (o hasta que el usuario cierre)
- Si llegan más de 3, los más antiguos se descartan
- Los errores NUNCA se auto-descartan si requieren acción del usuario
- Posición: esquina inferior derecha en desktop, parte superior en mobile
```

**Patrón Undo vs Confirmación:**
```
Para acciones reversibles (eliminar item, mover, archivar):
  → NO usar modal de confirmación ("¿Estás seguro?")
  → SÍ usar undo: Ejecutar inmediatamente + toast con "Deshacer" (5-8 segundos)
  → Más rápido para el usuario y menos fricción

Para acciones irreversibles (eliminar cuenta, cancelar plan, enviar a externos):
  → SÍ usar modal de confirmación con texto explícito
  → El botón destructivo en rojo, el botón seguro como primario
```

**Reglas técnicas de modales:**
- Fondo con blur/overlay oscuro (backdrop-blur + `var(--surface-overlay)` — token de `10`)
- Cerrar con click fuera, tecla Escape, y botón X
- Animación de entrada suave (scale 95→100 + fade in, 200ms)
- Máximo 70% del viewport en desktop, 90% en mobile
- Scroll interno si el contenido es largo, no scroll de página

### 4. Jerarquía Visual Clara y Consistente
El ojo del usuario debe seguir un camino natural sin esfuerzo.

**Estructura de cualquier pantalla:**
```
[Header / Navegación]          ← Siempre visible, siempre simple
[Título de la sección]         ← Qué estoy viendo
[Contenido principal]          ← Lo importante, ocupa >60% de la pantalla
[Acciones]                     ← Qué puedo hacer
```

**Tipografía (jerarquía obligatoria — escala exacta en `14-LEYES-DE-DISENO.md`, colores vía tokens de `10`):**
- Título principal (display): 28-40px · 700 · 1 por pantalla · color `var(--text-primary)`
- Subtítulo/descripción (title): 17-22px · 600 · color `var(--text-secondary)`
- Contenido (body): 15-16px · 400 · color `var(--text-primary)`
- Acciones: Botones con contraste claro entre primario y secundario
- Texto auxiliar (label/caption): 12-13px · 500 · color `var(--text-tertiary)` — nunca grises hardcodeados de Tailwind (`text-gray-*`)

**Espaciado:**
- Secciones separadas con espacio generoso (gap-8 o gap-12)
- Elementos relacionados juntos (gap-2 o gap-4)
- Nunca menos de 8px de padding en cualquier contenedor
- En mobile, padding horizontal mínimo de 16px (px-4)

### 5. Feedback Inmediato en TODA Interacción
El usuario nunca debe preguntarse "¿funcionó?" o "¿está cargando?"

**Estados obligatorios para toda acción:**
1. **Default**: Estado normal del elemento
2. **Hover**: Cambio visual sutil (color, sombra, scale)
3. **Loading**: Spinner o skeleton + texto "Generando..." / "Procesando..."
4. **Éxito**: Confirmación clara (toast verde, animación check, cambio de texto)
5. **Error**: Mensaje específico y acción sugerida ("No pudimos generar. Intenta con un texto más corto.")

**Patrones de loading (umbral canónico — `DESIGN-CORE.md`):**
- <100ms: nada (se siente instantáneo)
- 100ms-1s: spinner inline EN el elemento + bloquear doble-tap (nunca bloquear la pantalla)
- >1s: skeleton con la forma exacta del contenido + shimmer (CLS=0)
- 3s+: añadir indicador de progreso + botón de cancelar; mensajes rotativos si aplica ("Analizando tu texto..." → "Generando propuesta...")
- IA de texto: skeleton hasta el primer token, luego streaming. El spinner de página completa está PROHIBIDO siempre.

**Regla de oro**: Nunca un botón que no cambia cuando lo presionas. Nunca una pantalla que se queda igual después de una acción.

### 6. Diseño Mobile-First que No Se Siente "Adaptado"
El 70%+ de usuarios accederá desde el celular. Diseña para móvil PRIMERO.

**Reglas mobile:**
- Botones de mínimo 44x44px de área táctil
- Texto mínimo de 14px (nunca menos)
- Inputs que no se tapen con el teclado virtual
- Navegación inferior (tab bar) en vez de hamburger menu cuando hay ≤5 opciones
- Cards que ocupan el ancho completo, no grids de 2-3 columnas
- Formularios con un campo visible a la vez en flujos importantes

**Reglas desktop:**
- Máximo ancho de contenido: 1200px (max-w-7xl)
- Sidebar de navegación si hay >5 secciones
- Aprovechar el espacio con layouts de 2-3 columnas donde tenga sentido
- Hover states más elaborados (tooltips, previews)

### 7. Paleta de Color con Propósito
No elegir colores "bonitos". Elegir colores con función.

**Sistema de color mínimo (4 roles):**
1. **Primario**: El color de la marca. Botones principales, links, elementos activos.
2. **Fondo**: El color base. El MODO (claro/oscuro) SE DERIVA del arquetipo + mundo del sujeto (`16-DIRECCION-DE-ARTE.md`), nunca se asume por categoría.
3. **Texto**: Alto contraste con el fondo. Nunca gris claro sobre blanco.
4. **Acento/Estado**: Para éxito (verde), error (rojo), warning (amarillo), info (azul) — solo en su función semántica.

**Reglas de color:**
- Nunca más de 3 colores prominentes en una pantalla
- El color primario se usa con moderación — solo para lo que quieres que el ojo vaya primero
- Fondos de secciones alternando entre neutros de la MISMA familia (`var(--surface-base)` / `var(--surface-primary)` / `var(--surface-secondary)` — tokens de `10`) para crear ritmo; nunca #FFF/#000 puros ni grises genéricos de Tailwind
- Dark mode MVP: NO implementar el toggle visual en el MVP PERO sí usar tokens semánticos CSS (ver `10-DESIGN-TOKENS.md`) desde el día uno. Así cuando quieras agregar dark mode, es un bloque CSS, no reescribir la app. El 82% de usuarios lo prefiere, así que planifícalo aunque no lo lances aún.

**Identidad visual:** la paleta, el modo y la tipografía SE DERIVAN con el PASO 0 de `16-DIRECCION-DE-ARTE.md` + las paletas de `29-REFERENCIA-VISUAL.md`. **No hay colores por defecto por categoría de app** — asignar "azul a productividad" o "verde a finanzas" por reflejo es exactamente el default que produce apps intercambiables.

### 8. Navegación que Desaparece
La mejor navegación es la que el usuario no nota. Sabe dónde está y cómo llegar a cualquier lado sin pensar.

**Estructura recomendada para web apps:**
```
Apps con ≤3 secciones:
→ Tab bar superior o inferior, sin sidebar

Apps con 4-6 secciones:
→ Sidebar colapsable en desktop + tab bar inferior en mobile

Apps con >6 secciones:
→ Reconsiderar. Probablemente hay features que sobran.
```

**Reglas de navegación:**
- El usuario siempre debe saber EN QUÉ PANTALLA ESTÁ (elemento activo claro)
- Máximo 1 nivel de profundidad para llegar a cualquier feature principal
- Botón de "atrás" siempre visible cuando hay profundidad
- Breadcrumbs solo si hay >2 niveles (raramente necesario en una web app)
- Logo/nombre de la app como link a home siempre

### 9. Copy que Habla como Persona, No como Software
Cada texto en la app es una oportunidad de generar confianza o de alejar al usuario.

**Reglas de copywriting en la app:**
- Botones: Verbos de acción específicos ("Generar Propuesta", no "Submit")
- Títulos: Beneficio o contexto ("Tu calendario de contenido", no "Dashboard")
- Vacíos: Cuando no hay datos, no mostrar "No hay resultados". Mostrar: "Aún no has creado tu primer [X]. ¡Crea uno ahora! →"
- Errores: Humanos y con solución ("Algo salió mal. Intenta de nuevo o usa un texto más corto", no "Error 500")
- Loading: Conversacional ("Analizando tu texto...", no "Processing request...")
- Confirmaciones: Celebrar brevemente con el verbo de la acción ("Propuesta creada 🎉", no "Operation successful" ni "¡Listo!" — ver 42/49)

**Tono general**: Como un amigo que sabe mucho del tema. Ni robótico ni excesivamente casual. Profesional pero cálido.

### 10. Performance es UX
Si tarda, no importa qué tan bonita sea. El usuario se va.

**Prioridad de carga (Above the Fold First):**
Lo que el usuario VE primero debe CARGAR primero:
1. Header + título de la sección (HTML estático, instantáneo)
2. Contenido principal + campo de acción (componente core)
3. Datos del usuario (fetch async con skeleton)
4. Sidebar, footer, elementos secundarios (lazy load)
5. Analytics, scripts de terceros, chat widgets (después de que todo cargue)

Nunca bloquear el render del contenido principal esperando datos secundarios.

**Objetivos de performance:**
- Primera carga: <3 segundos
- Interacciones (click → respuesta visual): <100ms
- Llamadas a IA: Mostrar loading inmediato (<200ms tras click)
- Transiciones entre pantallas: <300ms
- Imágenes: Lazy loading + tamaño optimizado (nunca >500KB por imagen)

**Técnicas obligatorias:**
- Skeleton loaders en vez de spinners para contenido principal
- Optimistic UI: Mostrar el resultado como exitoso antes de que el servidor confirme (para acciones simples como guardar, dar like, etc.)
- Debounce en búsquedas y campos de texto que disparan llamadas API (300-500ms)
- Cache de resultados frecuentes para no re-generar lo mismo

---

## ANTI-PATRONES: Lo que NUNCA Debe Tener la App

### UX Anti-Patrones
- ❌ Splash screen o loading page al abrir (el usuario ya esperó a que cargara)
- ❌ Popups pidiendo notificaciones/email antes de usar la app
- ❌ Tutorial forzado que no se puede saltar
- ❌ Menú hamburger como única navegación en desktop
- ❌ Scroll horizontal en mobile (JAMÁS)
- ❌ Infinite scroll sin indicador de progreso o fin
- ❌ Auto-play de video o audio

### Diseño Anti-Patrones
- ❌ Más de 2 tipografías diferentes
- ❌ Gradientes en todos los elementos (elegir 1 lugar para gradiente max)
- ❌ Sombras exageradas en cada card
- ❌ Bordes redondeados inconsistentes (elegir un radio y mantenerlo: rounded-lg en todo, o rounded-xl en todo)
- ❌ Íconos de diferentes familias/estilos mezclados
- ❌ Emojis como íconos principales en la interfaz
- ❌ Fondos con imágenes que dificultan leer texto

### Técnicos Anti-Patrones
- ❌ Console.log en producción
- ❌ APIs keys expuestas en el frontend
- ❌ Formularios sin validación antes de enviar
- ❌ Inputs sin placeholder text
- ❌ Botones sin estados disabled cuando corresponde
- ❌ Links que no parecen links / Botones que no parecen botones
- ❌ Texto que no se puede seleccionar/copiar cuando debería poder copiarse

---

## PRINCIPIOS ADICIONALES OBLIGATORIOS

### 11. Progressive Disclosure — Revelar Complejidad Gradualmente
No mostrar todas las opciones de golpe. Las funciones avanzadas se revelan cuando el usuario las necesita.

**Niveles de revelación:**
```
Nivel 1 (visible siempre): La acción principal + el resultado
Nivel 2 (un click de distancia): Opciones de configuración, filtros, ajustes
Nivel 3 (dentro de un modal o pantalla secundaria): Configuración avanzada, integraciones, exportación compleja
```

**Patrón: "Ajustes avanzados"**
```
[Input principal]
[Botón de generar]

▸ Opciones avanzadas          ← Colapsado por defecto
  ├ Tono: Formal / Casual     ← Solo visible al expandir
  ├ Longitud: Corto / Largo
  └ Idioma: Español / Inglés
```

El 80% de usuarios nunca tocará las opciones avanzadas. No les llenes la pantalla.

### 12. Formularios que No Frustran
Los formularios son el punto de mayor fricción. Reglas obligatorias:

**Cuándo validar:**
- Al salir del campo (onBlur), NUNCA mientras escribe
- Al enviar, validar todo de nuevo y enfocar el primer campo con error
- Usar `aria-invalid` y `aria-describedby` para accesibilidad

**Reglas de campos:**
- Siempre label visible encima del campo (no solo placeholder)
- Placeholder como EJEMPLO, no como instrucción ("ej: tu@email.com")
- Campos agrupados lógicamente (datos personales juntos, datos de pago juntos)
- Máximo 5-7 campos visibles a la vez. Si hay más, dividir en pasos.
- Autocompletado activado (`autocomplete="email"`, `autocomplete="name"`)
- Tipo de input correcto (`type="email"`, `type="tel"`, `type="url"`) para que el teclado móvil se adapte

**Regla crítica**: En mobile, cuando el teclado virtual aparece, el campo activo debe ser visible. Nunca dejar que el teclado tape el input.

### 13. Copiar y Exportar — El Resultado Debe Ser Útil Fuera de la App

Cuando el usuario genera algo con IA, necesita SACARLO de la app. Patrones obligatorios:

**Botón "Copiar":**
```typescript
async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
  // Feedback visual: ícono cambia a ✓, texto cambia a "¡Copiado!"
  // Vuelve al estado original en 2 segundos
}
```
- El texto copiado debe ser LIMPIO (sin markdown crudo, sin HTML)
- Si es texto formateado, copiar como texto plano por defecto

**Exportar como archivo:**
- PDF para documentos formales
- TXT/MD para texto
- CSV para datos tabulares
- PNG/SVG para gráficos

**Compartir:**
- Botón de compartir nativo (`navigator.share()` en mobile)
- Link copiable para resultados públicos

### 14. Error Boundaries — La App Nunca Debe Mostrar Pantalla Blanca

Un error en un componente NO debe crashear toda la app. Usar Error Boundaries de React:

```
Regla de placement:
- 1 Error Boundary a nivel de la app entera (catch-all)
- 1 Error Boundary por sección principal (sidebar, main content, modal)
- Cada sección puede fallar independientemente sin afectar a las demás
```

```
Si MainContent falla → Sidebar sigue funcionando + MainContent muestra 
"Algo salió mal. [Reintentar]"

Si Sidebar falla → MainContent sigue funcionando + Sidebar muestra 
fallback sutil

Si todo falla → Pantalla de error amigable con botón de recargar
```

NUNCA mostrar una pantalla blanca. NUNCA mostrar el stack trace al usuario.

### 15. Keyboard Shortcuts para Power Users (Opcional pero Diferenciador)

Para apps de productividad, añadir atajos de teclado es un diferenciador premium:

```
Cmd/Ctrl + K → Barra de búsqueda/comandos
Cmd/Ctrl + Enter → Ejecutar acción principal (generar)
Escape → Cerrar modal/overlay
/ → Focus en el campo de búsqueda
? → Mostrar lista de atajos
```

Si se implementan, mostrar un tooltip "⌘K" junto al input de búsqueda para que el usuario descubra que existen.

### 16. URLs Limpias y Navegación por Browser

```
✅ /dashboard
✅ /generate
✅ /history/abc123
✅ /settings

❌ /app?view=dashboard&tab=2
❌ /#/generate
```

- El botón "atrás" del navegador SIEMPRE debe funcionar como el usuario espera
- Deep links: si alguien comparte una URL, debe llegar exactamente a esa pantalla
- Nunca perder el estado al recargar la página (guardar estado en URL params o localStorage)
- **Guardar estado agresivamente**: si el usuario sale a mitad de un flujo y vuelve, debe encontrar lo que dejó (borrador, paso, scroll). Diseñar para conectividad intermitente.
- **Consistencia de gestos y patrones**: si un swipe (o cualquier interacción) hace algo en la pantalla A, debe hacer lo mismo en la B. El usuario construye un modelo mental; la inconsistencia lo rompe.
- **Respetar los gestos del sistema**: swipe-desde-el-borde para volver en iOS, botón de atrás en Android.

---

## CHECKLIST DE CALIDAD UX (el ÚNICO de este archivo — aplicar a cada pantalla)

> Nota: este checklist cubre la calidad UX de este archivo. **El cierre canónico de diseño vive en `DESIGN-CORE.md`** (sección 7) — es el que se recorre para declarar una pantalla lista.

```
LAYOUT Y CONTENIDO
[ ] ¿La pantalla tiene máximo 1-2 acciones principales?
[ ] ¿El usuario sabe qué hacer en <2 segundos?
[ ] ¿La jerarquía visual es clara (título > contenido > acciones)?
[ ] ¿La complejidad se revela progresivamente?
[ ] ¿Los formularios validan al salir del campo, no al escribir?
[ ] ¿Los estados vacíos tienen mensaje útil y CTA?
[ ] ¿Los errores son específicos y ofrecen solución?
[ ] ¿El copy es humano, no robótico?

INTERACCIÓN
[ ] ¿Hay feedback visual para toda interacción?
[ ] ¿Los resultados se pueden copiar/exportar fácilmente?
[ ] ¿El botón "atrás" del navegador funciona correctamente?
[ ] ¿Escape cierra modales?
[ ] ¿La navegación por teclado (Tab) funciona en todos los elementos?

RESPONSIVE Y PERFORMANCE
[ ] ¿Funciona en mobile (375px) sin scroll horizontal?
[ ] ¿Los botones tienen >44px de área táctil en mobile?
[ ] ¿Los textos tienen >14px en mobile?
[ ] ¿El teclado virtual no tapa los inputs?
[ ] ¿El contenido carga en <3 segundos?

ACCESIBILIDAD
[ ] ¿El contraste de texto es ≥4.5:1 en texto normal?
[ ] ¿Los inputs tienen labels visibles y asociados?
[ ] ¿Las imágenes tienen alt text?
[ ] ¿El focus es visible al navegar con teclado?
[ ] ¿Se usa HTML semántico (main, nav, section, article)?
[ ] ¿Se respeta prefers-reduced-motion?
[ ] El contenido dinámico (streaming de IA, XP, level-up, celebraciones) se anuncia en regiones aria-live/role=status; no depende solo de lo visual (ver 15)

RESILIENCIA
[ ] ¿Hay Error Boundaries por sección?
[ ] ¿La app no muestra pantalla blanca ante errores?
[ ] ¿Sin conexión se muestra un mensaje claro?
```

---

## LOS 10 PECADOS CAPITALES DE APPS CREADAS CON IA

Estos son los patrones de fallo más comunes cuando se genera producto demasiado rápido. Si la app cae en uno, no está perdida — significa que necesita recorte, foco y criterios de experiencia más fuertes. Revisarlos como lista de auditoría al terminar cualquier pantalla importante.

```
PECADO                        POR QUÉ DAÑA LA EXPERIENCIA
La app-dashboard              Home llena de tarjetas, métricas y widgets que impresiona en
                              screenshot pero no ayuda a actuar.
La app-chatbot para todo      Usar una caja de texto para tareas que necesitan botones,
                              estructura, previews o flujos guiados.
La app-plantilla              Pantallas correctas pero sin personalidad, criterio ni relación
                              clara con el problema real del usuario.
La app sin estados            No contempla loading, empty, error, success, offline, disabled
                              y permisos negados.
La app sin jerarquía          Todo tiene el mismo peso visual — el usuario debe decidir qué
                              importa.
La app con onboarding         Explica promesas antes de entregar valor real.
de marketing
La app invasiva               Pide permisos, datos o notificaciones antes de generar confianza.
La app con IA soberbia        Promete demasiado, no muestra límites y no deja corregir.
La app inaccesible            Texto pequeño, poco contraste, objetivos táctiles pequeños o sin
                              etiquetas accesibles.
La app manipuladora           Usa culpa, urgencia falsa, confirmshaming, costos ocultos o
                              cancelación difícil.
```

---

## REGLAS ÉTICAS — PATRONES QUE NUNCA SE USAN

Una conversión obtenida engañando al usuario es deuda de confianza.

```
NUNCA usar dark patterns:
- Confirmshaming: "No, prefiero fracasar"
- Urgencia o escasez falsa (solo real si es real)
- Costos, renovaciones o condiciones ocultos al final
- Cancelación difícil o escondida
- Permisos sin contexto claro de beneficio

GAMIFICACIÓN ÉTICA (recompensar progreso, no compulsión):
- Rachas, puntos y badges: solo si hacen visible progreso real y motivan acciones valiosas
- NUNCA usar miedo a perder, culpa o comparación social para forzar retención
- El objetivo NO es que el usuario pase el máximo tiempo posible — sino que logre su meta
- Diseñar recuperación de hábito, no castigo por fallar: "Retoma donde quedaste" > "Perdiste tu racha"
- Celebrar progreso real genera orgullo; castigar ausencias genera resistencia

NOTIFICACIONES:
- Una notificación debe ser útil o no debe existir
- Específicas: "Tu resumen de hoy está listo" > "Tenemos novedades"
- Configurables: frecuencia, horario, categorías — el usuario controla
- Nunca: culpa, urgencia falsa, genéricas, sin acción clara, sin respetar zona horaria
- Criterio: ¿Por qué ahora? ¿Para qué sirve? ¿Qué acción concreta permite?
```

---

## REGLA DE PRUEBA CON HUMANOS

La IA puede generar una interfaz plausible, pero solo usuarios reales revelan si funciona. Antes de dar una pantalla por aprobada en cualquier proyecto:

```
- Al menos 3-5 personas del avatar objetivo deben completar las 3 tareas clave sin ayuda:
  1) primera acción de valor, 2) acción frecuente, 3) recuperación de error.
- Observar sin explicar: si tienes que explicar cómo funciona, la pantalla ya dio una señal.
- Convertir dudas repetidas en cambios de texto, jerarquía o flujo.
- No preguntar "¿te gusta?" — preguntar "¿qué harías ahora?" y observar.
- No validar solo con capturas bonitas o la opinión del equipo.
```

---

## PATRONES DE APP ESTÁNDAR (que toda app profesional tiene — sin excepción)

Estos patrones son tan comunes que el usuario los espera sin saberlo. Que falten se siente inmediatamente como app amateur. Implementarlos siempre, aunque nadie los pida explícitamente:

### Menú de perfil / usuario
Todo elemento de navegación que represente al usuario (avatar, ícono de perfil, nombre) abre un menú o pantalla al tocarlo. Nunca es decorativo. Las opciones estándar que los usuarios esperan en este menú, basadas en convenciones de plataforma:
```
MÍNIMAS (toda app con autenticación):
✅ Perfil o cuenta (nombre, foto, datos de la cuenta)
✅ Configuración o ajustes
✅ Cerrar sesión

RECOMENDADAS según el producto:
→ Toggle de modo oscuro/claro (si la app lo soporta)
→ Plan actual y gestión de suscripción
→ Ayuda o soporte
→ Notificaciones y preferencias

PRINCIPIO: cuantas menos opciones tenga este menú, más claro se ve.
Agrupar lo secundario en "Configuración" en vez de exponer todo en el primer nivel.
```

### Regla de elementos interactivos
**Todo elemento que se ve interactivo hace algo.** Si tiene apariencia de botón, ícono tapable o card clicable, tiene una acción definida. Un elemento sin respuesta destruye la confianza del usuario en toda la app — subconscientemente asume que algo está roto.

Si una función no está implementada aún: no mostrar el elemento, o mostrarlo con un estado visual de "próximamente" que explique cuándo llegará. Nunca dejarlo sin respuesta.

### Filtros en toda vista de lista o grilla
Toda pantalla que muestra una lista o grilla de ítems necesita:
```
- Filtro por estado (ej: publicado / borrador / programado / vencido)
- Filtro por tipo/categoría (ej: carrusel / reel / story / post)
- Búsqueda por texto si hay más de 10 ítems
- Ordenar por fecha, tipo u otro criterio relevante
```
Sin filtros, una lista con 20+ ítems se vuelve inutilizable.

### Vistas de datos temporales — requisitos mínimos
Toda vista que muestre datos por período (semana, mes, año) SIEMPRE tiene:
```
- Las fechas reales visibles (no solo "Esta semana" — "Jun 16 - Jun 22, 2026")
- Navegación a períodos anteriores y siguientes (← →)
- Contexto claro del período actual
```
Una vista "semanal" que no muestra las fechas ni permite ver la semana pasada no es una vista semanal — es una lista con otro nombre.

### Estados visuales para contenido con fecha o vencimiento
En apps donde los ítems tienen una fecha asociada (tareas, publicaciones, eventos, citas, recordatorios), el color y el estado visual comunican la urgencia sin que el usuario tenga que leer cada fecha:
```
CONVENCIÓN ESTÁNDAR (reconocible universalmente):
Neutro / color base:    Contenido futuro con tiempo suficiente, en orden
Ámbar / naranja:        Contenido que vence pronto (definir el umbral según el contexto:
                        próximas 24h para tareas urgentes, próxima semana para planning)
Rojo / borde rojo:      Contenido vencido o atrasado que requiere atención

REGLA: el usuario debe poder escanear la pantalla de un vistazo y saber
qué está bien, qué urge y qué está atrasado — sin leer cada fecha individualmente.

COMPLEMENTO: mostrar la fecha exacta en la card (no solo el color) para que
el usuario pueda actuar con información precisa.
```

---

## INVESTIGACIÓN DE COMPETIDORES (obligatoria antes de construir)

Antes de diseñar la primera pantalla, investigar las 3-5 apps más populares del mismo sector. El objetivo no es copiar — es entender qué espera el usuario de ese tipo de app y qué problemas tienen las existentes.

```
FUENTES A REVISAR (buscar con búsqueda web):
- App Store y Play Store: top apps del sector, leer reseñas de 1-2 estrellas
  (las quejas = lo que hay que resolver mejor)
- Product Hunt: buscar "[sector] app" para ver las más votadas
- Reddit: r/[nicho] para ver qué frustra a los usuarios actuales

LO QUE SE EXTRAE:
- ¿Qué vistas o flujos tiene toda app del sector? (son expectativas del usuario)
- ¿Qué es lo que más critican en las reseñas negativas? (tu oportunidad)
- ¿Qué precio cobran? (referencia de mercado)
- ¿Qué features ofrece el plan gratis vs el pago?
```

Esta investigación se documenta en ESTADO.md y guía decisiones de arquitectura. Una app de gestión de contenido para redes sociales SIN vistas de calendario/tablero es como una app de fitness sin tracking de progreso — el usuario lo espera porque la competencia lo tiene.

---

## LÓGICA DE PRECIOS Y LÍMITES (definir ANTES de construir)

Uno de los errores más costosos: construir la app y luego descubrir que la lógica de planes no está implementada. Antes de la Fase de Creación, definir y documentar en ESTADO.md:

```
PLAN GRATUITO:
- ¿Qué puede hacer? [lista concreta]
- ¿Cuáles son los límites? [números exactos: 2 marcas, 10 posts/mes, etc.]
- ¿Qué mensaje ve cuando llega al límite? [con CTA al plan pago]

PLAN PAGO:
- ¿Qué desbloquea exactamente? [lista concreta de diferencias]
- ¿Precio? $X/mes o $Y/año

VERIFICACIONES EN EL CÓDIGO:
- Antes de crear algo: verificar si el usuario está dentro de su límite
- Si llegó al límite: mostrar el paywall/upsell, no un error genérico
- El límite nunca se ignora silenciosamente
```

---

## Criterios de Salida de Fase 2
- [ ] El checklist de UX se entiende y está adaptado a la app específica
- [ ] Los patrones de diseño están definidos (usando design tokens)
- [ ] Se identificaron las pantallas principales y su propósito individual
- [ ] Los principios de accesibilidad están claros
- [ ] El usuario aprobó los principios que aplican a su app

→ **Siguiente: Cargar `04-ARQUITECTURA.md` + `10-DESIGN-TOKENS.md`**
