# PLAN DE MEJORA DEL SO — Auditoria quirurgica

> Uso: documento vivo para mejorar el Sistema Operativo despues de detectar fallos de flujo,
> copy, diseño, logica de producto o ejecucion del agente. No reemplaza `INICIO.md`; prioriza
> que corregir primero.

## Diagnostico corto

El SO tenia buenos modulos, pero algunas reglas criticas estaban repartidas. Eso permitia que el
agente cumpliera una parte y saltara otra: construir dashboard antes de la cadena de venta, confundir
onboarding-first con registro-first, declarar pantallas listas sin puerta de etapa, o usar copy/visual
generico en pantallas que deben vender.

## Principio rector

Cada etapa debe cerrar con evidencia y aprobacion. El agente no avanza porque "ya compilo"; avanza
porque la pantalla cumple su objetivo, fue vista renderizada, tiene protagonista claro, y el usuario
entiende que viene despues.

## P0 — Correcciones ya aplicadas o inmediatas

1. Secuencia maestra dura:
   `landing -> onboarding -> paywall -> login/auth -> app interna -> servicios externos`.
2. Nuevo modulo 52 para copy y visuales de conversion.
3. Separacion de modelos:
   - hard paywall: landing -> pago -> app;
   - onboarding-first anonimo: landing -> onboarding/preview -> paywall -> login;
   - onboarding-first registrado: registro gratis -> onboarding -> paywall, solo si hace falta.
4. Puerta de etapa obligatoria en `SECUENCIA-MAESTRA-CONSTRUCCION.md`.
5. ESTADO.md debe marcar puertas aprobadas/no aprobadas, no solo "construido".

## P1 — Producto y flujo

- Cada proyecto debe tener mapa de rutas aprobado antes de codear.
- Cada pantalla debe tener 1 protagonista principal y maximo 2 secundarios.
- La app interna no puede tener secciones duplicadas ni una pestana que contenga todo.
- Si una etapa falla en preview o el usuario detecta un error basico, vuelve a "no aprobada".

## P2 — Conversion, copy y visuales

- Landing y paywall cargan siempre `52-COPY-VISUALES-CONVERSION.md`.
- Antes de diseñar, escribir argumento de venta: dolor -> mecanismo -> resultado -> prueba -> oferta -> reversibilidad -> accion.
- Visual principal debe vender: antes/despues, valor bloqueado, progreso, mini-demo o prueba.
- Prohibido mostrar placeholders publicos de confianza o prueba social.

## P3 — UX, onboarding y login

- Mostrar valor antes de pedir cuenta salvo hard paywall decidido.
- Onboarding no es tour: debe personalizar, activar y preparar el pago.
- Login debe justificar por que aparece: guardar, sincronizar o desbloquear.
- Logo/nombre de app visible en landing, onboarding, paywall y login, con ruta clara de regreso.

## P4 — Backend, dinero y seguridad

- Servicios externos bloqueados hasta aprobar experiencia completa.
- Supabase/RLS, auth, IA real, Vercel, Resend, dominio y Hotmart entran despues de la app interna aprobada.
- Gating de plan, limites de IA y webhooks se validan en servidor.
- No prometer garantia, checkout, cancelacion o pausa si no existe realmente.

## P5 — Verificacion y rigor

- Toda pantalla clave requiere: comandos, preview mobile 375px, flujo principal probado y casos borde.
- El cierre debe decir que se probo tocando, no que "deberia funcionar".
- Si no hay evidencia visual, la pantalla queda "no verificada visualmente".
- Antes de vender, aplicar `48-RIGOR-DE-ENTREGA.md`.

## P6 — Operacion y crecimiento

- No lanzar ads pagados sin medicion de funnel basica.
- Separar metricas: landing -> onboarding, onboarding -> paywall, paywall -> clic checkout,
  clic checkout -> compra, compra -> activacion.
- Crear manual del dueño antes de vender a desconocidos.

## Checklist de auditoria futura

[ ] No hay contradicciones entre `INICIO.md`, `SECUENCIA-MAESTRA-CONSTRUCCION.md`, `02B`, `02C`, `18`, `19` y `15`.
[ ] La tabla de ruteo manda a leer los docs correctos para cada tarea.
[ ] Cada prompt importante incluye puerta de etapa o espera OK cuando corresponde.
[ ] `ESTADO.md` distingue construido, verificado y aprobado.
[ ] Los placeholders solo existen como datos internos, nunca como UI publica.
[ ] Servicios externos siguen bloqueados hasta que la experiencia completa este aprobada.
