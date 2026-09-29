# CHECKLIST DE CIERRE — Referencia por dominio

> Este archivo complementa el **NÚCLEO OBLIGATORIO de 10 ítems** de `CLAUDE.md` (ese se recorre
> SIEMPRE, en cada pantalla/feature, sin excepción). Aquí vive la **referencia por dominio**:
> al cerrar, recorre SOLO los bloques que apliquen a lo que tocaste (diseño, IA, base de datos,
> auth, seguridad, gamificación). Es condicional pero NO opcional cuando el dominio aplica.
>
> Para el cierre de DISEÑO, el checklist canónico (26 ítems + sub-ítems) vive en `DESIGN-CORE.md`
> (los bloques visuales de aquí son la referencia extendida).

```
VERIFICACIÓN TÉCNICA
[ ] lint · tsc --noEmit · tests · build limpios; dev server sin errores en consola
[ ] Warnings corregidos o excepción con responsable, riesgo y vencimiento (no "ignorar en MVP")
[ ] Probado el flujo principal + casos borde (input vacío, doble-tap, sin conexión)
[ ] Regresión: lo que dependía de lo que toqué sigue funcionando

SECUENCIA DE PRODUCTO (archivo SECUENCIA-MAESTRA-CONSTRUCCION.md)
[ ] Si es app nueva/primera version/MVP, respeta el orden: ventas -> onboarding -> paywall -> login/auth -> app interna -> servicios externos
[ ] No se construyo un dashboard interno antes de landing/onboarding/paywall/login
[ ] Cada pantalla tiene 1 protagonista principal y maximo 2 secundarios
[ ] La app interna tiene 3-5 secciones maximo y no hay secciones duplicadas
[ ] ESTADO.md registra el estado de cada etapa de la secuencia
[ ] Si se cierra una etapa clave, se presento la PUERTA DE ETAPA (SECUENCIA 2.1) con evidencia y siguiente paso
[ ] No se arranco la siguiente etapa sin OK del usuario cuando correspondia

VERIFICACIÓN VISUAL (archivo 32 — la puerta que MÁS se salta y la que produce apps básicas)
[ ] ABRISTE la pantalla RENDERIZADA a 375px y la MIRASTE (screenshot si la herramienta lo permite) — sin esto, nada de lo de abajo cuenta
[ ] La bottom-nav está al fondo y NO hay vacío muerto (shell con min-h-dvh, NUNCA min-h-full sin h-full en el padre)
[ ] La pantalla está LLENA DE VALOR, no un input + 2 botones en un vacío (chips/medidores/estado/confianza — patrones del 32/15)
[ ] El fondo tiene PROFUNDIDAD (mesh/gradiente sutil), no un fill plano; las superficies están elevadas (sombra suave, no solo borde)
[ ] El CTA héroe se ve VIVO y accionable (nunca un pill muerto al 50% de opacidad)
[ ] Política de revisor (Regla de Oro 7): el SUBAGENTE `revisor-visual` (.claude/agents/) puntuó ≥36/40 usabilidad Y ≥16/20 craft
    en las 4 pantallas del dinero (landing, onboarding, paywall, pantalla principal) + la PRIMERA de cada plantilla/tipo nuevo;
    en secundarias basta medición + checklist, anotando "sin revisor (pantalla secundaria)". Autoevaluarse es inválido.
[ ] Al invocar al revisor, SIEMPRE las 4 entradas: screenshot + archivo de CÓDIGO + FICHA-ARTE.md + referencia del usuario (si existe)
[ ] Si el usuario dio referencia visual: veredicto FIEL en el test de fidelidad (16/DESIGN-CORE §8) — screenshot al lado de la referencia

MISIÓN Y CLARIDAD (por cada pantalla)
[ ] La pantalla tiene UNA misión principal — escrita en una frase
[ ] El CTA principal se reconoce en menos de 3 segundos
[ ] Cada elemento visible ayuda a entender, decidir, actuar o sentir progreso
  (si un elemento no hace ninguna de estas 4 cosas → eliminarlo)
[ ] El usuario sabe dónde está y qué ocurrirá si toca la acción principal
[ ] Hay ruta clara de volver, cancelar, cerrar, editar o deshacer cuando aplica
[ ] Existen todos los estados: empty, loading, success, error, disabled, offline

COPY Y LENGUAJE
[ ] Los textos usan lenguaje del usuario, no jerga técnica ni nombres internos
[ ] Los errores dicen qué pasó Y qué hacer: "No pudimos guardar. Revisa tu conexión e intenta de nuevo"
[ ] Las acciones destructivas o de alto impacto tienen confirmación o deshacer
[ ] La personalidad del copy es consistente con los 3 adjetivos de la app (archivo 11)
[ ] Si la pantalla vende/cobra/desbloquea: existe FICHA-AVATAR.md completa y aprobada (57) y CADA pieza de copy se traza a un campo de la ficha (dolor/deseo/objecion) — sin traza = relleno corporativo, reescribir
[ ] Si la pantalla vende/cobra/desbloquea: se recorrio `52-COPY-VISUALES-CONVERSION.md` y el copy pasa la RÚBRICA /20 del 52 (≥16, puntuada por el revisor independiente)
[ ] Landing: sigue la ESTRUCTURA CANÓNICA de 10 secciones del 19 en su ORDEN EXACTO (hero 4U's → problema en preguntas → agitacion → mecanismo → carrusel → oferta anual+mensual con trial → garantia → FAQ desde objeciones → CTA final emocional → footer legal con paginas existentes)
[ ] Landing/paywall: headline salido del PROCESO OBLIGATORIO del 52 (10 variantes + 4 U's + test del bar), <=10 palabras, subtitulo <=2 lineas mobile, bullets max 3-5
[ ] Landing: el mecanismo esta BAUTIZADO (nombre propio, archivo 19) y aparece en hero + seccion de mecanismo + paywall
[ ] El visual principal vende contraste, perdida honesta, valor desbloqueado, progreso o prueba; no es una card generica
[ ] No hay placeholders publicos de confianza: "garantia visible", "pago seguro despues", "se configurara luego"
[ ] Logo/nombre de app visible en landing/onboarding/paywall/login con ruta clara para volver
[ ] Si hay claims comerciales: cada uno está en CLAIMS-LEDGER.md con capacidad, plan, límite y prueba
[ ] "100%/completo/listo" no confunde onboarding/preview con compra o contenido desbloqueado

DISEÑO (archivos 14 + 16)
[ ] Espaciado: solo escala 4·8·12·16·24·32·48·64, interno≤externo, simétrico, sin huecos muertos
[ ] Color: regla 60-30-10, máx 1-2 de marca, auditados los colores que se colaron
[ ] Jerarquía: un objeto principal, test de entrecerrar los ojos pasa
[ ] Tipografía con carácter (no Inter/Roboto), texto minimalista (1 titular + 1 subtitular)
[ ] Fondo CON profundidad (mesh/gradiente sutil, NO fill plano — ni #000 ni beige plano); superficies elevadas (sombra suave + borde, no solo borde)
[ ] Capa anti-IA (archivo 16): <3 banderas rojas (no #000/#fff puro · no neón+glow+glass+orbe · modo DERIVADO, no asumido oscuro · jerarquía por tamaño) · ≥1 dispositivo ownable (textura/foto/ilustración/2ª nota de color) · el brand kit NO podría intercambiarse con otra app del SO

MOVIMIENTO Y CRAFT (archivo 22 — leer antes de verificar)
[ ] Las 7 animaciones baseline presentes — verificar UNA POR UNA:
    1) entrada escalonada (stagger) en cada pantalla al cargar
    2) conteo animado en números héroe (0 → valor final, nunca estático)
    3) dibujado de anillos / crecimiento de barras al cargar
    4) feedback de tap <150ms en todo elemento interactivo (whileTap scale 0.97)
    5) transición suave entre tabs/pantallas (no corte seco)
    6) aparición suave de modales y bottom sheets (desde abajo)
    7) celebración en hitos reales (solo hitos reales, no en cada tap)
[ ] prefers-reduced-motion respetado en TODAS las animaciones
[ ] Ícono de estado activo visible (no tapado por su fondo — Phosphor fill + acento)

EXPERIENCIA (archivos 15 + 03)
[ ] Skeleton en vez de spinner, empty states con CTA, feedback en cada interacción
[ ] La app no depende solo del color para comunicar estado (siempre texto/ícono también)
[ ] El usuario sabe "qué sigue" sin pensar
[ ] No hay patrones engañosos: confirmshaming, urgencia falsa, costos ocultos, cancelación difícil

SI HAY FUNCIÓN DE IA (UX en docs/sistema/05-CREACION.md; integración multimodal en docs/sistema/30-INTEGRACION-IA.md)
[ ] La IA está porque reduce esfuerzo real, no por moda
[ ] El usuario puede editar, regenerar, rechazar y deshacer toda salida importante
[ ] La IA declara límites; NO promete perfección
[ ] Acciones de alto impacto requieren control humano explícito
[ ] La personalización explica por qué muestra cada recomendación
[ ] Integración (30): clave en servidor; texto = streaming; imagen/audio = job asíncrono + Storage (no por la función)
[ ] Resiliencia: reintentos con backoff, timeout, idempotencia, degradación elegante ante fallo del proveedor
[ ] Caché de resultados idénticos + fair-use por modalidad; costo de IA por usuario Pro < 20% del precio
[ ] Observabilidad (31): tabla `ai_calls` (costo/tokens/latencia) + alertas de gasto; golden set de evals antes de cambiar modelo/prompt; guardrails (moderación, anti-inyección)
[ ] Evals compilados por dominio; oracle programático donde la verdad es determinista
[ ] Rate limit distribuido; reserva atómica cubre retries/fallbacks; caché con alcance y diversidad

ACCESIBILIDAD
[ ] Contraste ≥4.5:1 texto / ≥3:1 UI · objetivos táctiles ≥48px · labels visibles
[ ] Navegación por teclado · focus visible · HTML semántico

SI HAY BASE DE DATOS (checklist completo en docs/sistema/25-BASE-DE-DATOS.md)
[ ] RLS activo en TODA tabla con política `(select auth.uid())` + columna de la política indexada
[ ] Toda foreign key tiene su índice; listas paginadas; sin Seq Scan en tablas grandes (EXPLAIN)
[ ] Migraciones generadas con `supabase db pull` + `db advisors` sin alertas críticas

SI HAY AUTENTICACIÓN (checklist completo en docs/sistema/26-AUTH-MODERNO.md)
[ ] Tokens en cookies httpOnly (NUNCA localStorage); refresh con rotación; logout invalida en servidor
[ ] Rate limiting por endpoint; mensajes genéricos (anti-enumeración); verificación de email
[ ] OAuth/passkeys ofrecidos; MFA si maneja dinero o datos sensibles
[ ] Cero rutas test/debug/bypass/impersonación/OTP autoverificado en producción; admin separado

SEGURIDAD ANTES DE VENDER (auditoría completa en docs/sistema/27-REVISION-SEGURIDAD.md)
[ ] Corrida la auditoría: grep de fail-open · `semgrep` · `npm audit` · OWASP Top 10:2025
[ ] Sin secretos en frontend/logs; .env en .gitignore; webhooks de pago verifican firma
[ ] Probado IDOR: intentar leer un recurso de otro usuario por ID y confirmar que falla (403)

SI HAY GAMIFICACIÓN / RETENCIÓN (checklist completo en docs/sistema/24-GAMIFICACION.md)
[ ] El loop central (gatillo→acción→recompensa→inversión) está nombrado en ESTADO.md
[ ] Lógica de racha/XP/logros en el SERVIDOR (no editable desde el cliente), con RLS
[ ] Cliente solo SELECT de recompensas; RPC recibe action_id, valida acción y calcula valores server-side
[ ] Notificaciones ≤1-2/día, accionables, con control en ajustes; cero anti-patrones de culpa
[ ] Cada evento emocional (racha extendida/rota, level-up, logro, win-back) tiene su MOMENTO
    diseñado según `56-MOMENTOS-EMOCIONALES.md` (pantalla/overlay con la voz del arquetipo), no solo un toast

CIERRE
[ ] Ejecutados los 10 Gates de `61-INTEGRIDAD-DE-LANZAMIENTO.md`; cero bloqueantes
[ ] Seis artefactos de release completos; PUBLICATION-CERTIFICATE prueba GitHub→Vercel + segundo push
[ ] Evidencia/commit/producción coinciden; Supabase target y callbacks del dominio final verificados
[ ] Clon limpio reconstruye app+DB desde README/.env.example/migraciones
[ ] ESTADO.md actualizado
[ ] Pecados Capitales revisados (docs/sistema/03-PRINCIPIOS): ¿cae en alguno?
[ ] Verificación final con evidencia (ritual de 5 pasos, docs/sistema/12): no "debería funcionar"
[ ] Test final: "Si quito el logo, ¿se ve como estudio premium o app de IA genérica?"
```

---

## BLOQUE — SI LA PANTALLA MIDE, VENDE O PUBLICA (añadido v5.8.0)

Condicional como el resto de bloques: solo se recorre si el dominio aplica.

### Si tocaste MEDICIÓN
```
[ ] Toda pantalla que pide un dato o una decisión tiene sus eventos de SALIDA EXPLÍCITA
    (siguió-con / siguió-sin / omitió), para poder restar quién se fue en silencio (36)
[ ] Si el producto restaura progreso, retomar NO re-dispara los eventos de paso (36)
[ ] Los eventos que comparten identificador con un tercero están marcados como NO usables
    para juzgar el embudo propio (36)
[ ] El cambio salió con su PREDICCIÓN escrita en ESTADO.md antes de publicar (36)
[ ] Los eventos se verificaron EN PRODUCCIÓN, no en desarrollo (12)
```

### Si tocaste VENTA, PRECIO, PRUEBA O GARANTÍA
```
[ ] `FICHA-MERCADO.md` existe y sus ranuras están llenas con fuente y fecha
[ ] Abrí el checkout REAL en móvil y anoté medios de pago, cuáles están deshabilitados,
    si aparece la garantía y si hay textos rotos (18)
[ ] REGLA DURA verificada: garantía > prueba. Si no se cumple, la garantía NO se menciona (18)
[ ] Si el copy nombra un plazo de garantía sin confirmar desde cuándo cuenta,
    NO fija fecha de inicio (18)
[ ] Los parámetros de URL de la pasarela se probaron CON y SIN, comparando lo que se ve (18)
[ ] El precio se comparó con la mediana de FICHA-MERCADO §1; desvío >±30% tiene razón escrita
```

### Si tocaste PUBLICACIÓN
```
[ ] Verificado buscando una cadena que SOLO existe en la versión nueva (08)
[ ] Si el contenido se arma en el navegador, verificado leyendo el DOM y no el HTML (08)
[ ] Cuenta de la CLI comprobada antes del push (08)
```

### Si tocaste IA CON CACHÉ
```
[ ] El contenido se valida ANTES de guardarse en caché Y también al leerlo (30)
[ ] Los rechazos quedan registrados con su clave y motivo (30)
```

### Si tocaste TRACKING O DATOS PERSONALES
```
[ ] Releída la política de privacidad y el microcopy de CADA campo donde se pide el dato:
    la técnica no contradice ninguna promesa ya hecha (47)
[ ] Si la contradice, se presentaron las 3 opciones al dueño en vez de decidirlo solo (47)
```

### Si entregaste una COMPARATIVA DE DIRECCIONES o una LANDING
```
[ ] Ninguna parte se entregó "así por ahora": lo que no está terminado es un PLACEHOLDER
    visible y honesto, y se DIJO en el reporte de cierre (32 → "no existe la primera
    versión sencilla")
[ ] Comparativa: fondo con profundidad · 3 frames del MISMO ancho y alto · marco de
    dispositivo real (bisel, isla, barra de estado) · pantalla LLENA con datos semilla ·
    muestra de paleta · nombre de cada fuente escrito EN SU PROPIA FUENTE (54)
[ ] Landing: el precio nunca aparece solo — lleva su unidad chica, el cobro real y un
    ancla externa que el comprador ya conoce (52)
[ ] El titular promete el DESEO, no el mecanismo (52 · 42)
[ ] Si hay garantía nombrada: dura MÁS que la prueba gratis (18)
[ ] La personalización usa lo que la persona ELIGIÓ, no un dato que hubo que pedirle (52)
[ ] Ningún aviso nombra un miedo que el usuario todavía no tiene (52)
```

### Si la pantalla es de CONVERSIÓN (landing / onboarding / paywall)
```
Gate binario de detalles premium (doctrina de 55/50) — sin los 6, la pantalla NO se declara lista:
[ ] Titular con énfasis: bold completo (700-800) + 1-3 palabras clave en acento —
    la palabra que VENDE, nunca artículos (JERARQUÍA DE ÉNFASIS de 55)
[ ] ≥1 hairline degradé de 1-2px en el elemento clave (máx 3 por vista) (55)
[ ] Toda lista de beneficios con icon chips premium (SVG Lucide/Phosphor, contenedor 40-48px,
    fondo acento 8-12%, radius del kit) — cero emojis (55)
[ ] Checkmarks custom (círculo acento 12% + check SVG), nunca el ✓ del sistema (55)
[ ] Fondo con profundidad (mesh/radial sutil detrás del héroe, no plano) (55)
[ ] Radios consistentes del kit en toda la vista (55)
[ ] Copy del titular entregado MARCADO con qué resaltar — [acento]/[b] (regla "QUÉ PALABRA
    SE RESALTA" de 52)
[ ] EVIDENCIA v6: el copy marcado vive en docs/copy/<pantalla>.md · el veredicto del revisor
    en docs/revisiones/<pantalla>-veredicto.md · scripts/audit-conversion.sh corrido sin
    críticos — los hooks lo verifican; la prosa no cuenta
[ ] Si es la landing: construida DESDE el kit (plantillas-codigo/landing) — construir a mano
    una sección que el kit ya trae = desviación justificada en ESTADO.md
```

### Si presentaste una IDEA o una DIRECCIÓN VISUAL
```
[ ] No dijiste en ningún momento que ibas a hacer algo "simple", "básico" o "mínimo" (CLAUDE.md 1C)
[ ] La idea se propuso CON la evidencia de pago, no con una advertencia de que quizá nadie pague.
    Si la señal de pago no se verificó, la idea NO se propuso (01)
[ ] La validación se presentó como PASO DEL PLAN (la landing mide desde el día 1),
    no como un experimento aparte por si la idea es mala (01)
[ ] Lo no encontrado se nombró con precisión ("no encontré X"), nunca como duda difusa
    ("no sé si esto funcionará")
[ ] Las 3 direcciones visuales salen de CLASES distintas —la del líder, la del nicho vecino,
    la del modo contrario— y no de la misma fila con otro acento (29)
[ ] La paleta y la tipografía del líder se tomaron ÍNTEGRAS, sin desafinar el hue (29)
[ ] Los 7 MATERIALES son señalables en cada mockup: superficie con degradé · sombras en capas ·
    borde hairline o sin borde · botón con degradé tonal y sombra tintada · íconos en chip ·
    fondo con profundidad · dato héroe tratado como dato (29 → EXTRAER EL CRAFT)
[ ] Test de un vistazo: ¿puedes describir la pantalla hablando de sombras, degradés y bordes,
    y no solo de colores y tamaños? Si no, está plana
[ ] Podrías nombrar cada opción con una palabra distinta que un no diseñador entienda
```
