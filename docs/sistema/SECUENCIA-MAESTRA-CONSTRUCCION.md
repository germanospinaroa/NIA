# SECUENCIA MAESTRA DE CONSTRUCCION VENDIBLE

> **Cuándo cargar este archivo:**
> - Antes de construir cualquier app nueva.
> - Antes de modificar una app que todavia no tiene venta, onboarding, paywall y login bien definidos.
> - Cuando el agente diga "primera version", "MVP", "construccion core" o "procedo a crear la app".
>
> **Por que existe:** El bug mas caro del SO es que el agente puede interpretar "MVP" como
> "dashboard interno rapido" y saltarse la cadena que vende: pagina de ventas, onboarding,
> paywall, login y recien despues la app interna. Esta secuencia es la fuente canonica para
> evitar que la IA construya como le plazca.

---

## 0. Regla Madre

Una app vendible NO empieza por el dashboard. Empieza por el camino completo que convierte a un
desconocido en usuario activado y, luego, en comprador.

```
Landing de ventas -> Onboarding -> Paywall -> Login/Auth -> App interna -> Servicios externos
       + contrato de eventos construido junto a cada pantalla, no al final
```

Si el agente construye primero la app interna sin haber definido y maquetado las cuatro piezas
anteriores, se detiene. No se llama "MVP"; se llama prototipo incompleto.

---

## 1. Secuencia obligatoria por producto

### Paso 1 - Pagina de ventas

Objetivo: vender el resultado antes de pedir esfuerzo.

Debe incluir:
- Hero con promesa clara: que es, para quien y por que importa en 3-5 segundos.
- Visual real o mock realista del producto, no ilustracion generica.
- La estructura canonica de 10 secciones de `19-PAGINA-DE-VENTAS.md` como punto de partida; se
  compacta solo con una hipotesis y medicion segun `60`, con layout de `55`.
- `landing_vista` y atribucion instrumentadas al construir, con modo `?qa=1`.
- Si aun no hay testimonios reales, no inventarlos: usar demo real, garantia y beta honesta.

No avanzar si:
- No existe `FICHA-AVATAR.md` completa y aprobada (57 — el copy se DERIVA de ella, no se inventa).
- La pagina parece una landing generica de IA.
- El CTA no dice la consecuencia exacta.
- No existe una propuesta de valor concreta.

### Paso 2 - Onboarding

Objetivo: llevar al usuario a sentir "esto me entiende" antes de pedirle una accion pesada.

Debe incluir:
- Una decision por pantalla.
- Barra de progreso si hay mas de 2 pasos.
- Preguntas que segmentan, personalizan o crean compromiso.
- Una primera accion real del usuario.
- Resultado personalizado visible al final.
- `onboarding_iniciado`, paso completado y `resultado_visto` instrumentados con sesion anonima.

No avanzar si:
- Es un tour de features.
- Pide registro antes de mostrar valor, salvo que el modelo sea hard paywall ya decidido.
- Tiene preguntas decorativas que no cambian nada.

### Paso 3 - Paywall

Objetivo: convertir el deseo creado por el onboarding en una oferta clara.

Debe incluir:
- Resultado personalizado visible.
- Maximo 3 beneficios principales y 2 planes por defecto.
- Precio claro con ancla.
- Garantia o reduccion de riesgo.
- CTA con beneficio concreto.
- Salida limpia, sin dark patterns.
- `paywall_visto` por visibilidad real (no render) y `checkout_iniciado` al salir.

No avanzar si:
- El paywall es solo una lista de features.
- Se siente como castigo despues de usar la app.
- No se entiende que se desbloquea.

### Paso 4 - Login/Auth

Objetivo: guardar o desbloquear sin cortar el momentum.

Debe incluir:
- Login por Google/email o metodo elegido en `26-AUTH-MODERNO.md`.
- Copy que explique por que se pide cuenta: guardar, sincronizar, desbloquear.
- Errores genericos y seguros.
- Estados loading, error, exito, disabled.

No avanzar si:
- El login aparece como muro frio antes del valor, sin justificacion.
- Se muestra un flujo falso que no tiene destino.

### Paso 5 - App interna

Objetivo: entregar el resultado prometido con minima carga mental.

Reglas de estructura:
- 3 a 5 secciones principales maximo.
- Cada seccion tiene 1 protagonista principal y maximo 2 secundarios.
- Si dos secciones muestran lo mismo, se fusionan o se redefine su trabajo.
- Cada pantalla responde: "que hago ahora?" con un paso obvio.
- Nada de "mil cosas": enriquecer no es amontonar features.
- El SEED de datos demo realistas del mundo del avatar (32, "LA APP NUNCA SE ENSEÑA VACÍA") se
  crea EN ESTA sesión: es prerrequisito de los screenshots del carrusel de la landing (19 §5) y
  del cierre de cada pantalla — la app se fotografía y se puntúa LLENA, nunca vacía.

Ejemplo de secciones bien separadas:
- Hoy: protagonista = accion principal de valor.
- Historial: protagonista = planes anteriores y busqueda/seleccion.
- Semana: protagonista = insight semanal, no repetir el plan de hoy.
- Cuenta/Plan: protagonista = estado de suscripcion y limites.

No avanzar si:
- Una pestaña contiene todo el producto.
- Historial y resumen semanal repiten la misma informacion.
- Hay mas de 3 bloques fuertes compitiendo en el primer viewport.
- No existe el seed de datos demo (una app interna que solo se puede enseñar vacia no esta cerrada).

### Paso 6 - Servicios externos

Solo despues de que la experiencia anterior este aprobada visual y funcionalmente:

1. Git/GitHub: versionar y proteger el trabajo.
2. Supabase: base de datos, RLS y auth real.
3. IA real por servidor/BFF: claves fuera del frontend, costos limitados, salida validada.
4. Vercel: preview y produccion.
5. Resend: emails transaccionales.
6. Dominio: lo compra/configura el usuario guiado por el agente.
7. Hotmart: producto, checkout, webhook con firma e idempotencia.

Al conectar Hotmart: URL con `off`, `showOnlyTrial=1` y `sck`; email solo si ya existe por una
necesidad real del producto. El webhook separa `trial_iniciado` y `primer_cobro_confirmado`.
Antes de traer trafico, el backoffice muestra el funnel de `60` y excluye sesiones QA completas.

Importante: la UX puede prototiparse con datos locales, pero la app NO se declara lista para vender
hasta conectar y auditar los servicios reales que correspondan.
Antes de abrir tráfico, ejecutar `61-INTEGRIDAD-DE-LANZAMIENTO.md` y P0-P8 de
`62-PUBLICACION-SEGURA-Y-CONTINUA.md`, y producir sus seis artefactos;
después calcular el certificado de `48-RIGOR-DE-ENTREGA.md`. Un bloqueante de 61/62 no se compensa.

**Cómo se guía esta etapa (la única con acompañamiento paso a paso):** de las 6 etapas anteriores,
esta es la ÚNICA donde el agente le explica cosas al usuario en simple y espera que él ejecute
acciones manuales — porque son las únicas que EXIGEN que él lo haga (crear cuentas, autorizar, pagar,
introducir secretos directamente en paneles oficiales). Para cada servicio: (1) explicar en una frase
qué es y para qué sirve, (2) dar ruta/link exacto, (3) pedir UNA acción en el momento necesario,
(4) describir el resultado que debe ver y (5) pedir que responda solo `hecho/configurada`, sin valores.
El agente JAMÁS pide, acepta, repite o muestra claves/tokens/passwords por chat ni solicita capturas que
los revelen; aplica el protocolo de `62`. Nunca asumir que el usuario sabe qué es una variable de entorno:
decir "una configuración privada guardada por el servicio, fuera del código". Las decisiones técnicas de las Sesiones 1-5 (modelo de
datos, método de auth, arquitectura de IA) YA se tomaron y ejecutaron sin pedirle nada al usuario —
esta es la primera vez que se le pide que haga algo, y por eso se guía con el máximo detalle.

---

## 2. Gates de avance

Antes de pasar al siguiente paso, el agente debe escribir en `ESTADO.md`:

```
Paso actual:
Pantallas creadas:
Protagonista de cada pantalla:
Accion primaria de cada pantalla:
Que NO se construyo aun:
Riesgos/pendientes:
Siguiente paso exacto:
```

Si falta un campo, la etapa no esta cerrada.

### 2.1 Puerta de aprobacion por etapa

Ademas de actualizar `ESTADO.md`, el agente debe presentar un **Reporte de Puerta** antes de
arrancar la etapa siguiente. No basta con que compile; la etapa debe quedar entendible,
verificada y aprobada.

Formato obligatorio:

```
PUERTA DE ETAPA — [Landing / Onboarding / Paywall / Login / App interna / Servicios]
1. Objetivo de la etapa:
2. Archivos del SO leidos:
3. Pantallas/rutas creadas o modificadas:
4. Protagonista principal de cada pantalla:
5. Accion primaria de cada pantalla:
6. Evidencia de verificacion:
   - comandos (tsc/build/dev):
   - screenshot REAL a 375px (RUTA del archivo):
   - veredicto del subagente `revisor-visual` (__/40 y __/20; fidelidad si hubo referencia):
   - flujo probado:
7. Riesgos o pendientes que NO deben confundirse con terminado:
8. Veredicto del agente: [aprobable / necesita correccion]
9. Siguiente etapa propuesta y para que sirve:
```

Regla dura:
- Si el veredicto es "necesita correccion", NO se avanza.
- Si es una etapa clave de producto (landing, onboarding, paywall, login, app interna), el agente
  pregunta si seguimos y espera OK del usuario antes de arrancar la etapa nueva.
- Si el usuario detecta un problema basico, la etapa vuelve a estado "no aprobada" en `ESTADO.md`
  y se corrige antes de seguir.
- Los servicios externos no empiezan hasta que landing, onboarding, paywall, login y app interna
  tengan puerta aprobada.

---

## 3. Checklist anti-dashboard prematuro

Antes de crear una ruta tipo `/app`, `/dashboard`, `/home` o una pantalla interna, responder:

```
[ ] Existe pagina de ventas o al menos su estructura final aprobada.
[ ] Existe onboarding o al menos su flujo final aprobado.
[ ] Existe paywall o al menos su pantalla final aprobada.
[ ] Existe login/auth UX o al menos su flujo final aprobado.
[ ] La app interna tiene 3-5 secciones maximo.
[ ] Cada seccion tiene 1 protagonista principal.
[ ] No hay secciones duplicadas.
[ ] El usuario entiende que servicios externos vienen despues.
```

Si alguna respuesta es NO, no se construye el dashboard. Se corrige la secuencia.

---

## 4. Como interpretar "primera version"

"Primera version" no significa "primera pantalla que compila". Significa:

```
1. El usuario ve la pagina de ventas.
2. Entra al onboarding.
3. Llega a un resultado o preview personalizado.
4. Ve el paywall en el momento correcto.
5. Puede registrarse o iniciar sesion.
6. Entra a una app interna simple, coherente y enfocada.
```

Puede usar datos locales si aun no se conectaron servicios, pero debe sentirse como el producto
real, no como una demo mezclada.

---

## 5. Protocolo si el agente ya se equivoco

Si ya existe una app mezclada o dashboard prematuro:

1. No seguir agregando features.
2. Auditar que piezas faltan en la secuencia maestra.
3. Congelar servicios externos.
4. Redibujar el flujo de rutas en este orden:
   `/` -> `/onboarding` -> `/paywall` -> `/login` -> `/app`
5. Reducir la app interna a 3-5 secciones con protagonistas claros.
6. Reescribir `ESTADO.md` con la nueva secuencia.

---

## 6. Frase de control para el agente

Antes de codear, el agente debe poder decir:

> "No estoy construyendo una app suelta; estoy construyendo el camino completo de venta y activacion.
> Primero vendo y activo, despues entrego, y solo despues conecto servicios externos."

Si esa frase no describe el plan actual, el plan esta mal.
