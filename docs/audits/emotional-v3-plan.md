# Plan de cambios — `emotional_v3`

## B. Mapa del nuevo funnel

| Pantalla | Trabajo psicológico | Interacción | CTA | Evento |
|---|---|---|---|---|
| Recognition | Reconocerse en una escena concreta | Elegir 1 de 3 situaciones | Continuar | `recognition_viewed`, `recognition_completed` |
| Pattern | Nombrar la fricción sin diagnosticar | Elegir aprobación, duda o incomodidad | Continuar | `pattern_viewed`, `pattern_completed` |
| Desire | Expresar el resultado propio | Elegir la respuesta que quiere poder sostener | Continuar | `desire_viewed`, `desire_completed` |
| Personalize | Aterrizar la demostración | Elegir contexto; nombre opcional | Ver cómo sería | `personalize_viewed`, `personalize_completed` |
| Demo | Experimentar NIA, no leer una explicación | Leer un mensaje determinista y personalizado | Conocer los planes | `demo_viewed`, `demo_completed` |
| Trust | Reducir incertidumbre | Leer qué hace, qué no hace y qué controla | Ver cómo empezar | `trust_viewed`, `trust_completed` |
| Plans | Convertir valor en decisión | Elegir anual o mensual | Quiero empezar con NIA | `plans_viewed`, `plan_selected`, `checkout_started` |

La compra no se cuenta desde el navegador. `purchase_confirmed` queda reservado a la confirmación real del proveedor de pagos y a su webhook verificado.

## C. Matriz visual

| Pantalla | Asset | Emoción | Intención visual | Decisión |
|---|---|---|---|---|
| Recognition | Sin fotografía; marfil con radial copper sutil | “Esto me pasa” | Poner la situación y la elección en primer plano | Evita una modelo genérica antes de entender el problema |
| Pattern | Sin fotografía; mismo sistema claro | Comprensión | El contexto elegido aparece dentro del copy | La personalización es visible, no decorativa |
| Desire | Sin fotografía; contraste tipográfico | Posibilidad | Hacer que ella formule su propio deseo | Evita prometer una transformación prefabricada |
| Personalize | Sin fotografía; input mínimo | Cercanía | El nombre es opcional y el contexto es funcional | Reduce fricción y no pide información sensible |
| Demo | `public/images/nia/hero-before-the-moment.png` no se usa; se utiliza una maqueta local de WhatsApp | Anticipación concreta | Mostrar el canal y el lenguaje sin falsificar una captura | La etiqueta “mensaje de ejemplo” protege la confianza |
| Trust | Sin fotografía; tres bloques con icon chip | Tranquilidad | Hacer explícitos límites, entrega y control | Sustituye testimonios no auditados |
| Plans | Sin fotografía; oferta editorial | Decisión serena | Precio, trial, renovación y cancelación en la misma vista | Mantiene los valores reales de Production |

Assets existentes auditados: las imágenes actuales son locales y no dependen de URLs externas. No se agregan imágenes nuevas a v3 hasta contar con una necesidad narrativa demostrada y derechos de uso documentados.

## G. Comparación con v2

- v2: 6 pantallas y una narrativa larga; v3: 7 estados comerciales con decisiones explícitas y una pantalla de confianza transparente.
- v2: la demo depende principalmente de una escena escrita; v3: la demo usa las respuestas de reconocimiento, patrón, deseo y contexto.
- v2: testimonios visuales sin trazabilidad visible; v3: no afirma prueba social sin autorización y evidencia verificable.
- v2: estado compartido/histórico; v3: `sessionStorage` aislado y versión de eventos separada.
- v2: contrato de eventos centrado en `discover_*`; v3: eventos por etapa y screen key auditables.
- v2: raíz pública sin mecanismo reversible de variante; v3: preview aislado en `/descubre/v3`, sin cambiar `/`.

## H. Plan de lanzamiento controlado

1. Preview: probar `/descubre/v3` en 360, 375, 390, 430, 768 y 1440 px; registrar screenshots y flujo completo hasta el checkout, sin completar pagos.
2. QA: ejecutar typecheck, build, tests focalizados, teclado, reduced motion, overflow, estados disabled y navegación atrás/refresh.
3. Activación: mantener `/` en v2 y habilitar v3 solo mediante ruta/flag explícita cuando exista autorización. No cambiar Production automáticamente.
4. Monitoreo: comparar reconocimiento→pattern, inicio→plans, plans→checkout y compras confirmadas por sesión elegible; separar QA, fuente, dispositivo y variante.
5. Criterio de evaluación: no declarar ganador con muestras pequeñas; exigir compras confirmadas y atribución verificable.
6. Rollback: retirar la ruta/flag de v3 y conservar `/` apuntando a `PremiumDiscover` v2. La migración de eventos es aditiva y no reescribe históricos.
