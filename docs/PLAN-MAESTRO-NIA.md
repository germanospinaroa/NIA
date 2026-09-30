# PLAN MAESTRO — NIA Identity

Estado: APROBADO Y CONGELADO — 2026-09-29 · No se ha construido ninguna etapa de producto.
Contratos: Constitución de Producto congelada · `FICHA-ARTE.md` aprobada · Punto NIA · interacción híbrida · App/Web hogar · WhatsApp presencia futura · Hotmart proveedor de pagos.
Reencuadre estratégico 1.5: NIA reduce la distancia entre cómo Laura sabe que quiere actuar y cómo termina actuando bajo fricción; además puede devolver evidencia real de que esa distancia se está cerrando. Esto actualiza el territorio y la jerarquía del posicionamiento, no cambia el alcance ni autoriza modificar la landing todavía.

Regla de avance: el gate comercial previo no bloquea la construcción. NIA se construirá como MVP real, se lanzará con tráfico real y se validará mediante uso durante 7 días y conversión posterior a suscripción.

## 1. Secuencia completa de construcción

### Etapa 0 — Plan, validación y diseño de negocio
Cerrar avatar, mercado, modelo de app, economía unitaria, precio candidato, eventos y arquitectura. La validación comercial previa queda sustituida por un gate de lanzamiento: construir un MVP completo, cobrable e instrumentado para enviar tráfico real.

La validación posterior comprobará si la usuaria vive durante 7 días la continuidad adaptativa —que lo ocurrido hoy cambie perceptiblemente lo que NIA hace después— y permite que comience el cobro.

### Etapa 1 — Página de ventas
Vender el resultado: actuar de forma progresivamente más congruente con lo que Laura misma decidió que importa. Mostrar Punto NIA en acción, no “IA” ni una biblioteca de frases. Instrumentar llegada, CTA y atribución. La landing actual sigue sin modificarse; antes de tocar producción se hará una revisión sección por sección bajo el reencuadre 1.5. No publicar copy final hasta completar y aprobar `FICHA-AVATAR.md`.

### Etapa 2 — Recorrido de inicio
Sin cuenta y antes del pago. Definir una intención persistente, calibrar el lenguaje con opciones de un toque y entregar la primera intervención. La primera victoria ocurre aquí. No será un tour de funciones ni un chat.

### Etapa 3 — Pantalla de planes
Después de que la usuaria haya vivido el mecanismo y percibido al menos una adaptación. Mostrar qué logró gratis y qué desbloquea la continuidad. Sin urgencia falsa, culpa ni cobro oculto.

### Etapa 4 — Login y cuenta
Después del valor y del plan. La cuenta sirve para conservar intención, memoria, evidencia y acceso entre dispositivos. Auth passwordless/proveedor administrado; nunca auth propio ni contraseñas almacenadas por NIA.

### Etapa 5 — App interna
App/Web como hogar: Hoy/Punto NIA, Evidencia y Ajustes/Memoria. Máximo 3–5 secciones; cada una con una misión. La app funciona sin WhatsApp.

### Etapa 6 — Servicios externos
Solo después de aprobar las cinco etapas anteriores: base de datos real y RLS, auth real, servidor/BFF para IA, publicación, email transaccional, dominio, Hotmart y backoffice. Evolution/WhatsApp se integra aquí como adaptador de delivery e interacción; no contiene la lógica de producto.

## 2. Modelo de negocio

### Oferta inicial de lanzamiento
- Suscripción mensual propuesta: US$6,99.
- Suscripción anual propuesta: US$39,99/año, mostrada también como precio mensual transparente.
- Oferta inicial propuesta: US$29,99 el primer año; sin lifetime.
- Estos importes siguen siendo hipótesis comerciales: mensual US$6,99 y anual US$39,99. La variante de lanzamiento de US$29,99 el primer año queda documentada, pero no se activa automáticamente.

### Prueba gratuita
- 7 días de acceso al producto real, no una demo mutilada.
- Definir una intención persistente, recibir intervenciones, dar microseñales, experimentar adaptación, usar Punto NIA on demand, completar microacciones cuando correspondan y acumular primeras evidencias.
- La usuaria selecciona el plan y completa Hotmart antes de iniciar el trial.
- Al terminar los 7 días comienza el cobro del plan elegido y la recurrencia.

### Pantalla de planes
La ubicación exacta dentro del recorrido se definirá según el onboarding aprobado, pero debe aparecer antes de Hotmart y antes de iniciar el trial. Debe informar con claridad: 7 días gratis, plan, importe, moneda, fecha aproximada del primer cobro, periodicidad, renovación automática y cancelación.

### Pago desbloquea
- Ritual proactivo diario en el momento elegido.
- Punto NIA on demand con contextos de un toque. Los límites, créditos o fair-use todavía no se congelan: se decidirán con costo real por intervención, frecuencia, margen y comportamiento observados.
- Memoria y adaptación longitudinales completas.
- Evidencia acumulada y lectura narrativa de lo aprendido.
- Configuración de intención, momento, canal y privacidad.

### Por qué la recurrencia tiene sentido
El valor no se agota en la intervención de hoy. Cada microseñal modifica el lenguaje, el enfoque y la relevancia de las intervenciones futuras. Cancelar detiene esa continuidad; pagar mantiene un sistema que se vuelve más útil con el uso, sin exigir más conversación.

### Proveedor de pagos aprobado
Hotmart queda definido como proveedor de pagos y suscripciones para LATAM. Se integrará únicamente en la etapa de servicios externos y solo para checkout y estado de acceso. El flujo deberá contemplar confirmación, renovación, cancelación, webhook confiable/verificado, idempotencia y sincronización del estado interno.

NIA nunca confiará en una señal del navegador para habilitar acceso. Ningún secreto, token o credencial vivirá en el navegador. Hotmart no contendrá lógica del producto ni memoria de NIA; si aparece un impedimento técnico real, se documentará antes de reconsiderar la decisión.

## 3. Arquitectura funcional

### Núcleo de NIA
1. Intención activa: qué quiere reforzar Laura.
2. Contexto mínimo: situación elegida con un toque.
3. Motor Punto NIA: selecciona/genera la intervención según intención, contexto y memoria.
4. Microseñal: “Así sí”, “Más real” u “Otro enfoque”.
5. Memoria controlada: transforma la señal en preferencias de lenguaje y dirección.
6. Adaptación: hace perceptible el cambio en una intervención posterior.
7. Microacción opcional: aparece solo cuando aporta valor.
8. Evidencia: registro mínimo de lo realizado, expresado como narrativa personal.
9. Reconocimiento: cuando existan señales suficientes, devuelve diferencias, decisiones, acciones o patrones positivos observables trazables a registros reales; nunca inventa progreso ni infiere estados psicológicos.

### Capas de producto
- Hogar App/Web: intención, Punto NIA ahora, evidencia, memoria y ajustes.
- Entrega: interfaz común para mostrar una intervención y recibir una microseñal.
- Adaptadores de canal: web primero; WhatsApp/Evolution después. El adaptador traduce mensajes y botones, pero no decide la lógica de NIA.
- Cuenta y acceso: identidad, plan y sincronización.
- Cobro: Hotmart después de que el funnel visual esté aprobado; webhook firmado e idempotente. Solo eventos verificados actualizan el estado interno de acceso.
- Operación: eventos, errores, costos de IA, entregas fallidas y señales de retención.

### Datos que sí recuerda
- Intención activa e historial de intenciones elegidas.
- Microseñales y fecha de cada una.
- Contextos seleccionados por la usuaria.
- Lenguaje/enfoque que funcionó o no funcionó.
- Microacciones aceptadas/completadas, cuando existan.
- Intervenciones entregadas y evidencia asociada.

### Datos que no debe guardar ni inferir
- Traumas, diagnósticos, secretos o emociones íntimas no expresadas.
- Biografía indiscriminada o perfiles psicológicos ocultos.
- Contenido de conversaciones abiertas, porque no existirán como mecanismo principal.
- Datos de WhatsApp más allá de lo necesario para entregar y responder una intervención.
- Datos para vender, perfilar o compartir con terceros.

## 4. Flujos principales

### Llegada → onboarding
Página de ventas → botón principal → recorrido público sin cuenta → Laura define una intención → elige señales de lenguaje/estilo → recibe la primera intervención → responde con un toque.

### Ritual proactivo
Momento acordado → intervención breve → una microseñal → memoria silenciosa → fin. Cuando corresponda: intervención → microseñal → microacción → evidencia.

### Punto NIA on demand
“Necesito NIA ahora” → contexto de un toque: duda, decisión, conversación, algo inesperado o volver a la intención → intervención adaptada → microseñal → posible microacción → fin. Nunca se convierte en chat.

### Evidencia y reconocimiento
La usuaria puede registrar una pequeña acción o confirmar una microacción. NIA muestra una secuencia de momentos y aprendizajes, no gráficas de rendimiento ni una puntuación de hábito.
El reconocimiento es la capacidad de devolver, cuando haya evidencia suficiente, que una conducta o decisión ya está ocurriendo de forma diferente. Es narrativo, discreto, humano, no competitivo y trazable a acciones o señales reales. La evidencia sigue siendo narrativa personal, no dashboard.

### Memoria y configuración
La usuaria ve qué conserva NIA, puede editar su intención, cambiar momento/canal, borrar memoria y controlar privacidad. La memoria es visible y revocable.

### Paywall y login
Tres experiencias adaptativas → pantalla de planes → elección mensual/anual → página de pago → confirmación → login/creación de cuenta → migración segura del estado anónimo → hogar con continuidad desbloqueada.

## 5. Retención sin gamificación artificial

La retención nace de dos capas verificables: mañana NIA debe saber un poco mejor qué ayuda hoy; con el tiempo también debe ayudar a Laura a ver cosas que normalmente no reconocería en sí misma. El gatillo es una intervención diaria acordada o una necesidad imprevista; la recompensa es volver a la intención con palabras creíbles; la inversión es una microseñal que cambia el futuro y, cuando existe base suficiente, una evidencia que devuelve continuidad.

No habrá rachas, puntos, rankings, mascotas, culpa, notificaciones indiscriminadas ni tareas diarias obligatorias. La base será una intervención proactiva diaria como máximo, en el momento elegido por la usuaria, más el modo on demand. El reconocimiento no puede crear dependencia ni insinuar “me necesitas”, “sin mí volverás atrás” o “yo te conozco mejor que tú”.

## 6. MVP real

### Sí debe existir
- Página de ventas con promesa, demostración y CTA.
- Onboarding breve con una intención persistente.
- Primera intervención real y feedback de un toque.
- Segunda intervención claramente adaptada a la microseñal anterior.
- Punto NIA on demand desde App/Web.
- Contextos mínimos de un toque.
- Microacción opcional.
- Evidencia narrativa mínima.
- Pantalla de memoria y controles de privacidad.
- Pantalla de planes y oferta mensual/anual.
- Login seguro y migración del estado anónimo.
- App/Web hogar con Hoy/Punto NIA, Evidencia y Ajustes.
- Datos semilla realistas para demostración y pruebas.

### Fuera de la primera versión
- Chat abierto o coach conversacional.
- Journaling, diario largo o prompts diarios.
- Biblioteca de afirmaciones.
- Voz, audio, avatar o companion.
- Múltiples intenciones simultáneas.
- Rachas, XP, rankings, recompensas artificiales o gamificación social.
- Inferencias psicológicas, terapia o claims clínicos.
- Integración técnica de WhatsApp/Evolution antes de la etapa de servicios externos.
- Integraciones externas adicionales, comunidad, compartir social y dashboard analítico para usuarias.

## 7. Entregables y puertas

1. **Plan Maestro:** mapa, hipótesis, riesgos, modelo económico y criterio de finalización aprobados.
2. **Identidad visual:** `FICHA-ARTE.md` aprobada — ya cerrada con `Visual NIA.png`; falta tour visual cuando existan las vistas de producto.
3. **Página de ventas:** estructura canónica, copy trazable al avatar, CTA, eventos y captura verificada.
4. **Onboarding:** intención, primera intervención, microseñal, resultado visible, estados y captura verificada.
5. **Pantalla de planes:** valor conseguido, continuidad, precio transparente, salida limpia, eventos y captura verificada.
6. **Login:** motivo claro, estados seguros, rate limit, anti-enumeración y captura verificada.
7. **App interna:** Hoy/Punto NIA, Evidencia, Ajustes/Memoria, seed realista, estados y captura verificada.
8. **Servicios externos:** base de datos/RLS, auth real, BFF de IA, Hotmart, emails, publicación, WhatsApp/Evolution y backoffice; auditoría de seguridad, integridad y rigor de entrega.

Cada puerta exige tsc, build, arranque limpio, flujo principal, casos borde, captura a 375 px, revisión visual requerida y `ESTADO.md` actualizado.

## 8. Taxonomía mínima de eventos

Los eventos son estables, accionables y no deben crecer por instrumentar sin una pregunta de negocio. El contrato inicial es:

`landing_viewed`, `cta_started`, `onboarding_started`, `onboarding_completed`, `first_intervention_received`, `feedback_given`, `adapted_intervention_received`, `nia_now_started`, `microaction_completed`, `plan_selected`, `checkout_started`, `trial_started`, `returned_d1`, `returned_d3`, `returned_d7`, `trial_cancelled`, `trial_completed`, `first_payment_succeeded`, `first_payment_failed`, `subscription_cancelled`.

La instrumentación debe permitir responder: si percibir adaptación mejora la continuidad y el pago; si Punto NIA on demand produce retorno; y dónde se pierden las usuarias. `adaptation_recognized` y `paywall_viewed` podrán añadirse solo si responden a una decisión concreta y se define cómo se observa sin forzar una encuesta. Cada evento tendrá contexto mínimo —usuario anónimo o autenticado, sesión, etapa, intención no sensible, canal y timestamp— sin guardar el contenido íntimo de la persona.

## 9. Riesgos y decisiones críticas

- **Lanzamiento:** la categoría está validada, pero la señal específica de NIA se medirá con trial real. No se declarará validación fuerte hasta obtener al menos 3–5 primeros pagos post-trial.
- **Diferencia adaptativa:** el análisis debe cruzar adaptación percibida/uso → continuidad → pago, sin declarar resultados con muestras insuficientes.
- **Precio:** US$6,99/US$39,99 es candidato heredado del contexto, no precio final. Falta mercado específico, costo de IA y margen.
- **Límites de uso:** no fijar límites artificiales de Punto NIA antes de conocer costo, frecuencia y margen; tampoco prometer “ilimitado” sin esos datos.
- **Adaptación invisible:** si el día siguiente no cambia de forma perceptible, NIA parece otra app de frases. El test de regresión debe demostrar adaptación con la misma intención y señales distintas.
- **Reconocimiento sin base:** si la evidencia no está sustentada por acciones o señales reales, NIA no debe afirmar progreso ni convertir adulación en retención.
- **Proactividad:** una intervención diaria requiere consentimiento, horario elegido, pausa y límite. No debe maximizar screen time.
- **WhatsApp:** puede arrastrar el producto hacia chatbot. Se evita con adaptador separado, mensajes finitos y botones/texto de una acción.
- **Privacidad:** la memoria puede sentirse invasiva. Debe ser explícita, mínima, visible, editable y borrable.
- **Arte:** el cambio marfil→carbón debe señalar intención/foco; no se usará como adorno ni como modo oscuro genérico.
- **Secuencia:** no construir `/app` antes de página de ventas, onboarding, pantalla de planes y login definidos y aprobados.

## 10. WhatsApp / Evolution

Queda definido como canal de presencia e interacción breve: intervención proactiva, feedback de un toque y activación rápida de Punto NIA. No se integra antes de su etapa en Servicios Externos. No habrá concierge manual obligatorio por WhatsApp; cuando corresponda, Evolution se integrará como adaptador del producto real. El núcleo debe funcionar primero desde App/Web y no depender del proveedor.

## 11. Criterio de finalización del MVP vendible

Una usuaria nueva debe poder:

1. Llegar a la página de ventas y entender el resultado.
2. Empezar sin cuenta.
3. Definir una intención en menos de cinco minutos.
4. Recibir una primera intervención creíble.
5. Responder con una microseñal de un toque.
6. Recibir después una intervención que cambió perceptiblemente según esa señal.
7. Usar “Necesito NIA ahora” y elegir un contexto sin abrir conversación.
8. Completar una microacción solo si aplica y conservar evidencia narrativa.
9. Ver la pantalla de planes con la transparencia completa del trial.
10. Seleccionar un plan, completar Hotmart, iniciar el trial y conservar intención, memoria y evidencia.
11. Llegar al primer cobro y mantener el acceso sincronizado solo mediante eventos verificados.
12. Usar App/Web como hogar con controles de privacidad y borrar su memoria.
13. Recibir el servicio de forma estable y segura en el canal implementado, con pagos verificados, datos aislados por usuario, claves privadas fuera del navegador, política de privacidad y auditoría de seguridad aprobada.

Si solo existen pantallas bonitas, una demo estática, un chat o una app interna sin cobro y memoria segura, no es el MVP vendible de NIA.
