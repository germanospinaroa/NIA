# PLANTILLA-ESTADO — La Memoria Externa del Proyecto

> El agente crea un archivo `ESTADO.md` en la raíz del proyecto usando esta plantilla, y lo actualiza al cerrar cada sesión o completar un hito. Es la memoria que sobrevive entre sesiones y compactaciones de contexto. Máximo 200 líneas: es un resumen ejecutivo, no un log.

```markdown
# ESTADO — [Nombre de la App]
Última actualización: [fecha] | Sesión actual: [1-8]

⏸️ CHECKPOINT — Última acción completada: [___] / Siguiente acción exacta: [___]
> Este campo se actualiza TRAS CADA TAREA (no solo al cerrar sesión o completar un hito). Si la
> sesión se corta a mitad de camino, este renglón es lo que evita perder el progreso fino.

## Qué es esta app (3 líneas máximo)
[Qué hace, para quién, modelo de monetización]

## Promesa central
"Esta app ayuda a [usuario] a lograr [resultado] sin [fricción], mediante [mecanismo]."

## Reporte de validación (Sesión 1)
- Veredicto: [Excelente oportunidad / Viable con ajustes / Mercado incierto]
- Apps de referencia: [nombre + calificación + reseñas]
- Lo que los usuarios odian de la competencia (nuestra oportunidad): [2-3 puntos]
- Brecha LATAM confirmada: [sí/no + evidencia]
- Precio de referencia del mercado: $[X]-[Y]/mes

## Dirección de Arte (Sesión 2 — NO cambiar sin justificación)
> La ficha COMPLETA vive en `FICHA-ARTE.md` en la raíz (plantilla: `PLANTILLA-FICHA-ARTE.md`);
> el hook de arranque la inyecta en cada sesión. Aquí solo el resumen + el registro anti-repetición.
- FICHA-ARTE.md: [existe y aprobada por el usuario: SÍ/NO — fecha]
- ¿Hubo referencia visual del usuario?: [SÍ (ruta/descripción) → es CONTRATO / NO]
- Resumen: fondo #[hex] · acento #[hex] · Display "[nombre]" · Body "[nombre]" · radio [N]px
- Personalidad: [adjetivo 1] · [adjetivo 2] · [adjetivo 3] (compilada en la ficha)
- REGISTRO ANTI-REPETICIÓN (29/54): paleta y par tipográfico de ESTE proyecto quedan vetados
  para el próximo proyecto del SO. Dirección del banco 54 usada: [nombre o N/A]

## Avatar y venta (Sesión 1 — NO cambiar sin validar)
- FICHA-AVATAR.md: [existe y aprobada: SÍ/NO — fecha] (el copy de venta se DERIVA de ella — 57)
- Resumen: avatar [1 línea] · dolor #1 [___] · deseo #1 [___] · nivel de consciencia [1-5] · sofisticación [1-5]
- Landing: sigue la ESTRUCTURA CANÓNICA de 10 secciones del 19 — carrusel con
  [placeholders / screenshots reales montados el (fecha)] · footer legal: páginas [pendientes / creadas]

## Estrategia de monetización (Sesión 1 — NO cambiar sin validar)
- Modelo: [Hard paywall / Onboarding-first / Freemium]
- Justificación: [por qué se eligió este modelo para este nicho]
- Diseño del paywall: [qué muestra, dónde aparece, qué plan se recomienda]
- Trial: [duracion + por que permite vivir el aha + fecha/monto de renovacion; ver 02C/60]
- Puente del trial D1-D7 (02C): [diseñado / implementado] — momento de valor por día:
  [D1 ___ · D2-D3 ___ · D4-D5 ___ · D6 aviso pre-cobro · D7 ___]
- Pricing: $[X]/mes mensual | $[Y]/mes anual mostrado como $/mes ("2 meses gratis", nunca el total)

## Gamificación y retención (loop documentado en Sesión 4; momentos construidos en Sesión 5)
- Loop del hábito (Hooked): Gatillo [___] → Acción [___] → Recompensa [___] → Inversión [___]
- Mecánicas elegidas (según patrón de uso): [racha / XP / hitos de volumen / récords / ligas / ...]
- Primera victoria que celebra el onboarding (<60s): [___]
- Notificaciones de re-enganche: [D1/D3/D7, hora activa] — tope ≤1-2/día

## Secuencia maestra de construcción (NO saltar)
- Estado de la secuencia: [Landing / Onboarding / Paywall / Login / App interna / Servicios externos]
- Ruta aprobada: `/` → `/onboarding` → `/paywall` → `/login` → `/app`
- Landing: [pendiente / diseñada / construida / verificada] — protagonista: [___] — CTA primario: [___]
- Onboarding: [pendiente / diseñado / construido / verificado] — primera decisión: [___]
- Paywall: [pendiente / diseñado / construido / verificado] — oferta principal: [___]
- Login/Auth: [pendiente / diseñado / construido / verificado] — motivo de pedir cuenta: [___]
- App interna: [pendiente / diseñada / construida / verificada] — secciones: [3-5 max] — protagonista de cada una: [___]
- Servicios externos: [pendiente / en curso / conectado] — GitHub/Supabase/IA/Vercel/Resend/dominio/Hotmart
- Regla: si una etapa anterior está pendiente, NO construir la etapa siguiente salvo prototipo marcado como tal.

## Puertas de etapa (aprobacion antes de avanzar)
- Landing: [no iniciada / no aprobada / aprobada] — evidencia: [comandos + preview + flujo]
- Onboarding: [no iniciada / no aprobada / aprobada] — evidencia: [comandos + preview + flujo]
- Paywall: [no iniciada / no aprobada / aprobada] — evidencia: [comandos + preview + flujo]
- Login/Auth: [no iniciada / no aprobada / aprobada] — evidencia: [comandos + preview + flujo]
- App interna: [no iniciada / no aprobada / aprobada] — evidencia: [comandos + preview + flujo]
- Servicios externos: [bloqueados / en curso / aprobados] — desbloquear solo si las puertas anteriores estan aprobadas.
- Certificado /100 (48, al certificar pre-lanzamiento): [__/100 — fecha] — VENTA __/20 · FUNNEL __/20 · PRODUCTO __/20 · CONFIANZA __/15 · VELOCIDAD __/10 · RETENCIÓN __/15 — sub-ítems en 0: [___]

## Decisiones técnicas (NO re-discutir sin pedirlo el usuario)
- Framework: [Vite / Next.js] — decidido el [fecha]
- Stack: [detalles relevantes]
- Features del MVP: [lista de 3-5, en orden de prioridad]
- Modelo de IA: [cuál y por qué]
- [Otras decisiones de arquitectura]

## Sesiones completadas ✅
- Sesión [N] — [qué se hizo] — verificado [fecha]

## Sesión en progreso 🔧
- Sesión [N] — [qué está en curso y en qué punto]

## Próximas sesiones 📋
- Sesión [N+1]: [qué se hará]
- Sesión [N+2]: [qué se hará]

## Problemas conocidos ⚠️
> Los gates de cierre y de commit permiten cerrar con violaciones SOLO si están documentadas
> aquí (grepeables): nombra la palabra clave del gate — "veredicto" + la pantalla,
> "direcciones-abc", "docs/copy", "garantía"/"FICHA-MERCADO".
- [Bug o limitación] — [estado: investigando / pospuesto / workaround aplicado]

## Pendientes del usuario (acciones que el usuario debe hacer)
- [ ] [Acción concreta que el agente NO puede hacer: crear cuenta, pagar plan, etc.]

## Notas para la próxima sesión
- [Contexto crítico que el agente futuro necesita saber inmediatamente]
```

## Reglas de mantenimiento

1. **Crear** en la primera sesión, apenas haya decisiones tomadas. Nunca empezar a codear sin ESTADO.md.
2. **Leer** al inicio de TODA sesión, ANTES de tocar código. Si hay compactación de contexto, releer inmediatamente.
3. **Actualizar** al cerrar sesión, completar un hito, o tomar cualquier decisión que afecte otras partes del proyecto. Y el renglón **⏸️ CHECKPOINT se actualiza TRAS CADA TAREA** — es la granularidad fina que las demás secciones no capturan: si el usuario cierra a mitad de una sesión larga, "Siguiente acción exacta" es lo que permite retomar sin repetir ni perder trabajo.
4. **La Dirección de Arte y la Estrategia de monetización son cosa juzgada** — el agente no las reabre ni las cambia por iniciativa propia. Si hay duda, preguntar al usuario explícitamente.
5. **Podar**: si supera 200 líneas, comprimir las sesiones completadas en una sola línea de resumen.
6. **El campo "Pendientes del usuario"** debe estar siempre actualizado — es lo primero que el usuario debe ver al retomar.
7. **Memoria estática vs dinámica (con caducidad).** Las secciones "cosa juzgada" (Dirección de Arte, Monetización, Decisiones técnicas, loop de gamificación) son la memoria ESTÁTICA: rara vez cambian, son la verdad del proyecto. Las secciones de sesiones, problemas y pendientes son DINÁMICAS: caducan. Regla de poda: cuando un hecho dinámico deja de ser cierto (un bug se arregló, un pendiente se hizo), se ELIMINA, no se acumula. Cuando una decisión nueva contradice una vieja, se REEMPLAZA la vieja, no se deja conviviendo — la contradicción sin resolver es la causa #1 de que el agente "recuerde" algo que ya no es verdad.
8. **Commitear cada actualización.** Si el proyecto usa git, cada actualización de ESTADO.md se commitea (`git add ESTADO.md && git commit -m "chore: estado"`) — así la memoria sobrevive a cierres bruscos, ramas y máquinas distintas, y su historial es el log del proyecto.
9. **Recuperación:** si ESTADO.md falta o está corrupto → usar `PROMPT-RETOMAR.txt`, que reconstruye el estado desde el código. No adivinar de memoria: reconstruir y recién entonces continuar.
