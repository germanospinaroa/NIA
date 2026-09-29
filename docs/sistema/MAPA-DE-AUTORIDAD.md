# MAPA DE AUTORIDAD — qué archivo manda en cada doctrina

Si dos archivos parecen contradecirse, esta tabla decide. El archivo que manda es la fuente única;
los demás CITAN. Si encuentras una contradicción que esta tabla no resuelve: repórtala como bug
del SO y sigue al archivo que manda aquí en la doctrina más cercana.

---

## LA TABLA

| Doctrina | Archivo que MANDA | Regla en una línea |
|---|---|---|
| Paleta/tipografía del líder | `29-REFERENCIA-VISUAL.md` | Se toma TAL CUAL, sin perturbar el hue |
| Longitud del onboarding | `02B-ONBOARDING-Y-PAYWALL.md` | B2C 4-8 pasos (9-20 solo con evidencia); B2B ≤5 pantallas (ideal 2-3) |
| Escalera de compromiso del funnel | `02B-ONBOARDING-Y-PAYWALL.md` (LA ESCALERA DE COMPROMISO) | Cada paso sube la inversión; el paywall es consecuencia; la landing es el peldaño 0 y el pre-cierre (`02C`) el último |
| Revisor visual (cuándo y con qué se invoca) | `CLAUDE.md` Regla de Oro 7 | Obligatorio en las 4 pantallas del dinero + primera de cada tipo nuevo; SIEMPRE 4 entradas (screenshot + código + FICHA-ARTE + referencia) |
| Display de precios | `02C-PRICING-Y-MODELO-DE-NEGOCIO.md` | $/mes grande + total anual visible + ahorro expresado en meses |
| Estructura de landing | `19-PAGINA-DE-VENTAS.md` (orden) + `52` §1bis (énfasis por consciencia) + `PROMPT-LANDING.txt` (rescate compacta con `60`) | El orden canónico lo fija el 19; el énfasis por nivel de consciencia, el 52; un rescate solo compacta con evidencia del 60 |
| Presupuesto de copy | `52-COPY-VISUALES-CONVERSION.md` | Los límites de palabras/lineas por sección salen del 52, no se improvisan |
| Roles de radius y componentes | `49-SISTEMA-DE-COMPONENTES.md` | Cada radio tiene rol asignado; los componentes se des-generican según el 49 |
| Escala de espaciado y jerarquía | `DESIGN-CORE.md` | Solo escala 4·8·12·16·24·32·48·64 (excepción: margen lateral 16/20) |
| Tamaños de texto | `DESIGN-CORE.md` | Lectura ≥14px; labels/captions 11-13px permitidos (nivel N4) |
| Rúbricas de cierre | `RUBRICAS-DE-PANTALLA.md` | /40 usabilidad + /20 craft, embebidas en el subagente `revisor-visual` |
| Animaciones baseline | `DESIGN-CORE.md` §6 | Las 7 baseline no negociables se verifican una por una |
| Modelo de ejecución (fases vs sesiones) | `INICIO.md` B5 | El plan canónico de 8 sesiones es la única versión; nadie redefine mapas propios |
| Orden de construcción | `SECUENCIA-MAESTRA-CONSTRUCCION.md` | Ventas → onboarding → paywall → login/auth → app interna → servicios externos |
| Estados de suscripción y webhook | `18-VENTA-HOTMART.md` | Los estados y transiciones del webhook de Hotmart los define el 18 |
| Funnel y métricas de conversión | `60-OPERACION-DE-CONVERSION.md` | El 60 define el funnel; el 36 lo instrumenta, el 21 lo muestra |
| Benchmarks de conversión | `02C-PRICING-Y-MODELO-DE-NEGOCIO.md` | Los techos de app store NO son objetivos web (puente de checkout) |
| Payback | `40-UNIT-ECONOMICS.md` | Payback <12 meses, ideal <6 |
| Auth | `26-AUTH-MODERNO.md` | La jerarquía de métodos de auth la decide el 26 |
| RLS y datos | `25-BASE-DE-DATOS.md` | RLS en toda tabla con `(select auth.uid())` + columna indexada |
| Seguridad pre-venta | `27-REVISION-SEGURIDAD.md` + `61-INTEGRIDAD-DE-LANZAMIENTO.md` + `48-RIGOR-DE-ENTREGA.md` | Auditoría OWASP + gates binarios + puerta de rigor: sin los tres, no se vende |
| Pendientes | `ESTADO.md` | Lo pendiente vive en ESTADO.md — nunca en TODO.md ni en comentarios del código |
| Referencia visual del usuario | `16-DIRECCION-DE-ARTE.md` (REFERENCIA=CONTRATO) | La imagen del usuario MANDA sobre la capa anti-IA y las tablas del 29; test de fidelidad al cierre |
| Elección de dirección de arte (protocolo A/B/C) | `54-BANCO-DE-DIRECCIONES.md` | 3 opciones renderizadas a 375px de la misma pantalla; el usuario elige, combina o pide otras |
| De dónde nace la comparativa/réplica (kit obligatorio) | `54-BANCO-DE-DIRECCIONES.md` (Regla Dura #0) | Se COPIA `plantillas-codigo/direcciones-abc/plantilla.html` y se tematiza — jamás desde cero; el archivo conserva `data-kit="abc-v2"` y el hook pre-stop lo verifica |
| Confirmación final del estilo (tour de la app) | `54-BANCO-DE-DIRECCIONES.md` (EL TOUR DE LA APP) | Elegido el estilo, `vista-previa-app.html` muestra 4-5 vistas de la app por dentro (principal/M0, onboarding, paywall, mecanismo) nacidas del frame ya tematizado; la FICHA-ARTE no se cierra sin el tour aprobado (pregunta 1E: me encanta / ajustar / repensar) — el hook lo verifica |
| Pregunta de referencia y ruta réplica fiel vs A/B/C | `54-BANCO-DE-DIRECCIONES.md` (PASO 0 — LA PREGUNTA DE REFERENCIA) | Antes de proponer cualquier diseño se pregunta (textual): ¿propongo yo o tienes capturas? Captura de pantalla completa → `replica-fiel.html` única (el estilo no se toca, solo se adapta el contenido); referencia parcial o pedido de variantes → interpretaciones fieles A/B/C |
| Formato de las preguntas de opciones al usuario | `CLAUDE.md` (COMUNICACIÓN, regla 1E) | Emoji temático + cada opción en su línea con número emoji (1️⃣ 2️⃣) + lo importante en negrilla + explicación breve + "Responde 1 o 2"; máx 2-4 opciones, una pregunta por mensaje |
| Vocabulario del mensaje al usuario (jerga prohibida) | `CLAUDE.md` (COMUNICACIÓN, regla 1F — GLOSARIO) | Traducciones cerradas (landing→"tu página de ventas", hero→"la parte de arriba"…); tecnologías NUNCA se anuncian (van a ESTADO.md) salvo que el usuario deba actuar sobre el servicio o pregunte; regla espejo si el usuario usa el término primero |
| Precio inicial, límites de plan y precio-para-ads | `02C-PRICING-Y-MODELO-DE-NEGOCIO.md` (LOS 3 SUELOS DEL PRECIO) | Precio = el mayor de suelo de costo (gate del `40` + fórmula del cupo: precio × 20% ÷ costo por resultado) y suelo de mercado (FICHA-MERCADO §1); el suelo de canal se chequea en `34` (CHEQUEO DE PRECIO PARA ADS) antes de la primera campaña — conversación en dos momentos, sin jerga al inicio |
| Modelo de monetización (hard paywall vs onboarding-first) | `02C-PRICING-Y-MODELO-DE-NEGOCIO.md` (matriz A-F) | Lo decide la matriz A-F + tie-breaker; preguntárselo al usuario está prohibido |
| Versiones del stack | `51-STACK-PINEADO.md` | Scaffold canónico con versiones pineadas + .env de referencia; no se improvisan versiones |
| Kicker/eyebrow en mayúsculas | `55-DISENO-DE-LANDING.md` (landing) · `DESIGN-CORE.md` (app interna) | En LANDING manda el 55: kicker legítimo, opcional y máx 1 por sección; en APP INTERNA manda DESIGN-CORE: prohibido como slop (eyebrows sobre CADA sección) |
| Dialecto del copy de la app | `FICHA-AVATAR.md` (campo Registro, protocolo en `57`) | La ficha manda SIEMPRE; "dialecto del avatar" con avatar multi-país = español neutro; una landing en voseo con ficha en tuteo es BUG, no estilo |
| Modo de la opción C del A/B/C | `16-DIRECCION-DE-ARTE.md` | El modo se DERIVA del mundo del sujeto; si el modo oscuro lo contradice (p.ej. salud diurna), la opción C diverge por temperatura/composición/dispositivo, no por modo — el "modo contrario" del 29 es default, no obligación |
| Ángulo del headline | `57-AVATAR-Y-CONSCIENCIA.md` §6 (sofisticación) | La sofisticación manda sobre el mapeo default deseo#1→headline de §9: en etapa 3+ el hero entra por mecanismo/identificación aunque el deseo #1 pida promesa directa |
| App modelo y su plano | `01-IDEACION.md` (LA APP MODELO) + `PLANTILLA-FICHA-MODELO.md` | Una sola app modelo con revenue probado ≥2 señales; se cambia UN eje y se conserva lo probado |

---

## CÓMO USAR ESTE MAPA

1. **Detectaste una contradicción entre dos archivos** → busca la doctrina en la tabla y sigue
   al archivo que MANDA. El otro archivo tiene una cita desactualizada: repórtala como bug del SO.
2. **La doctrina no está en la tabla** → sigue al archivo que manda en la doctrina MÁS CERCANA
   y reporta el hueco para que se añada la fila.
3. **Vas a cambiar una doctrina** → cambia primero el archivo que manda, propaga a los que citan,
   y añade el grep correspondiente en `scripts/audit-so.sh` (regla del chequeo (h) de
   `PLANTILLA-SELF-CHECK.md`: sin grep, el cambio no se considera propagado).

> Este mapa no reemplaza la tabla de ruteo de `CLAUDE.md` (qué leer para cada TAREA);
> resuelve la pregunta distinta de qué archivo tiene la última palabra en cada DOCTRINA.
