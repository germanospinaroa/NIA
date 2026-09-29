# UX WRITING — El Copy de Interfaz es Material de Diseño

> **Cuándo cargar este archivo:**
> - SIEMPRE que se escriba CUALQUIER texto de interfaz: botones, labels, placeholders, estados, errores, vacíos (junto con `14-LEYES-DE-DISENO.md` y `15-PATRONES-UX.md`)
> - Al pulir (junto con `07-PULIDO.md` y `32-DEL-MVP-AL-PRODUCTO.md`): el copy básico es una de las señales más rápidas de "demo hecha con IA"
> - Cuando dos pantallas del mismo flujo usan palabras distintas para lo mismo
> - Si la pantalla vende, cobra, desbloquea o convierte, cargar tambien `52-COPY-VISUALES-CONVERSION.md`.

## Objetivo
El archivo `11-DISENO-EMOCIONAL.md` define el TONO (la voz, la personalidad, los 3 adjetivos, cuándo celebrar). Este archivo define la DISCIPLINA del copy funcional: cómo se nombran las cosas, qué dice un botón, qué dice un error, cómo se etiqueta un campo. Son cosas distintas. El tono es cómo suena la app; el UX writing es si el usuario entiende qué va a pasar cuando toca algo. Una app puede tener una voz cálida y aun así ser ilegible porque el botón dice "Enviar" y nadie sabe a dónde.

---

## EL PRINCIPIO: el copy es material de diseño, con el mismo rigor que el color

```
El texto de la interfaz NO es relleno que se escribe al final "para que diga algo".
Es un componente de diseño, igual que un color o un espaciado, y se trata con el mismo rigor:
- Al color le exiges contraste medido (≥4.5:1). Al copy, claridad medida: ¿se entiende sin pensar?
- Al espaciado le exiges sistema (escala de 4px). Al copy, sistema: el mismo verbo en todo el flujo.
- Al acento le exiges que aparezca SOLO en la acción principal. Al copy, que cada palabra se gane su lugar.

El usuario lee la interfaz antes de "verla". Las palabras son lo primero que procesa al decidir
qué hacer. Un copy vago cuesta exactamente lo mismo que un layout roto: el usuario duda, y al dudar, abandona.
```

Esto conecta con la LEY DE TESLER (`15`): la complejidad irreducible la absorbe el producto, no el usuario. Un buen copy es la herramienta principal para absorber complejidad — explica sin que el usuario tenga que pensar.

---

## NOMBRAR POR LO QUE EL USUARIO CONTROLA, NO POR LA ARQUITECTURA

El error #1 del copy hecho por ingenieros (o por IA que leyó el código): nombrar las cosas como están nombradas en el sistema, no como las vive el usuario. El usuario no sabe ni le importa qué es un webhook, un payload o un endpoint.

```
ARQUITECTURA (lo que dice el código)   →  CONTROL DEL USUARIO (lo que el usuario quiere)
"Config de webhooks"                   →  "Notificaciones"
"Sincronizar payload"                  →  "Guardar cambios"
"Invalidar caché"                      →  "Actualizar"
"Gestión de tokens de sesión"          →  "Dispositivos conectados"
"Endpoint de exportación"              →  "Descargar mis datos"
"Parámetros del modelo"                →  "Ajustes de respuesta"
"Borrar registros huérfanos"           →  "Limpiar borradores"
```

```
REGLA: el nombre describe el RESULTADO que el usuario obtiene o el OBJETO que manipula,
nunca el mecanismo interno. Si para entender una label hay que saber cómo está construida
la app, la label está escrita para el programador, no para el usuario.
```

---

## VOZ ACTIVA: los controles dicen EXACTAMENTE qué pasa

Cada control debe declarar su consecuencia. El usuario tiene que poder predecir qué pasará antes de tocar (nivel conductual del `11`: "el usuario sabe qué va a pasar antes de que pase").

```
VAGO / GENÉRICO        →  EXACTO (verbo + objeto)
"Enviar"               →  "Guardar cambios"  /  "Publicar ahora"  /  "Enviar invitación"
"OK"                   →  "Eliminar publicación"  /  "Entendido"  (según lo que confirma)
"Continuar"            →  "Crear cuenta"  /  "Ir al pago"  (di a dónde lleva)
"Aceptar"              →  "Aceptar y pagar $9"  (en acciones con consecuencia)
"Listo"                →  "Guardar y salir"
"Confirmar"            →  "Sí, borrar 3 archivos"  (di QUÉ se confirma y cuántos)
```

```
REGLAS:
- Botón = verbo en infinitivo o imperativo, que nombra LA acción ("Publicar", "Descartar borrador").
- Nunca un botón ambiguo ("Enviar", "OK", "Continuar") cuando puedes nombrar la consecuencia real.
- En acciones destructivas o de pago, el botón dice exactamente qué pasa: "Cancelar suscripción",
  no "Confirmar". El usuario debe leer la consecuencia EN el botón, no inferirla.
```

---

## CONSISTENCIA DE NOMBRES EN UN FLUJO (el mismo verbo de principio a fin)

La incoherencia léxica es invisible para quien escribió el código y desorientadora para el usuario. Si el botón dice "Publicar", el éxito NO puede decir "Enviado". El usuario se pregunta si hizo otra cosa.

```
FLUJO COHERENTE (mismo verbo en toda la cadena):
  Botón:        "Publicar"
  Cargando:     "Publicando…"
  Éxito (toast): "Publicado ✓"
  Historial:    "Publicaste el 12 jun"
  Error:        "No se pudo publicar. Reintentar"

FLUJO ROTO (cada paso cambia de palabra):
  Botón "Publicar" → cargando "Enviando…" → toast "¡Listo!" → historial "Compartido"
  → el usuario no sabe si las 4 cosas son la misma acción.
```

```
REGLA: define un verbo canónico por acción y úsalo en TODOS sus estados
(reposo, cargando, éxito, error, historial). Mismo objeto, mismo nombre, siempre.
Un glosario de 8-12 términos al inicio del proyecto evita el 90% de estas incoherencias.
```

---

## EL VOCABULARIO DE LA INTERFAZ COMO WAYFINDING (señalización)

Pensá la interfaz como un edificio con señalización. Cada texto es una señal, y una buena señal hace UN trabajo. El problema no es la falta de texto: es el texto que intenta hacer dos trabajos a la vez.

```
CADA ELEMENTO HACE UN TRABAJO:
- Las LABELS etiquetan ("Correo electrónico"). No explican, no venden, no bromean.
- Los PLACEHOLDERS demuestran con un EJEMPLO ("tunombre@empresa.com"). No repiten la label.
- El HELPER TEXT aclara una regla ("Mínimo 8 caracteres"). No es decorativo.
- El TÍTULO de pantalla dice DÓNDE estás. El subtítulo dice QUÉ harás aquí.
- El BOTÓN dice qué pasa al tocarlo. No describe la pantalla.
- El ERROR dice qué pasó y qué hacer. No es la label disfrazada.

ANTI-PATRÓN (label que hace dos trabajos):
  ❌ Label: "Correo (escribe tu email para recibir el resumen diario)"
  ✅ Label: "Correo electrónico"  +  Helper: "Te enviamos un resumen diario"
     → la label etiqueta, el helper explica. Dos señales, cada una con un trabajo.
```

Esto refuerza la LEY DE JAKOB (`15`): los usuarios esperan que las señales funcionen como en las otras apps que ya conocen. Una label que se comporta como un párrafo rompe esa expectativa.

---

## ERRORES Y EMPTY STATES: MOMENTOS DE DIRECCIÓN, NO DE HUMOR NI DISCULPA

El `11` define el TONO del error (empático, calmado, nunca culposo). Aquí está la ESTRUCTURA funcional: un error y un empty state son momentos donde el usuario está bloqueado, y tu único trabajo es **dirigirlo**: decir qué pasó y qué hacer ahora. No es momento de chistes, no es momento de disculpas largas.

```
TODO ERROR TIENE 2 PARTES OBLIGATORIAS (alineado con la regla de errores de CLAUDE.md / 09):
  1. QUÉ PASÓ — en lenguaje del usuario, sin código ni stack ("No se pudo guardar tu cambio").
  2. QUÉ HACER — una salida concreta y accionable ("Revisa tu conexión y toca Reintentar").

Un error sin la parte 2 está incompleto, por muy empático que sea su tono.
```

```
❌ Error que solo se disculpa:   "Lo sentimos mucho, algo salió mal :("
   → empático pero inútil: el usuario no sabe qué hacer.

❌ Error que solo bromea:        "¡Ups! El servidor se fue por un café ☕"
   → el humor no dice qué pasó ni qué hacer. En un pago o pérdida de datos, ofende.

❌ Error técnico:                "Error 422: Unprocessable Entity"
   → es el sistema hablándole al sistema, no al usuario.

✅ Error que dirige:             "No pudimos guardar tu publicación. Revisa tu conexión
                                  y toca Reintentar."
   → qué pasó + qué hacer. El usuario nunca queda sin salida.
```

```
EMPTY STATES (estructura funcional; el catálogo completo en 15):
  Título que NO dice "vacío"  →  "Aún no tienes publicaciones"  (no "Sin datos")
  Una línea de valor          →  "Lo que publiques aparecerá aquí"
  UN CTA que dirige           →  "Crear primera publicación"
  → un empty state es una señal de dirección hacia la primera acción, no un cartel de "nada que ver".
```

> El humor de personalidad SÍ existe en la app (lo define `11`), pero vive en los momentos de éxito y en la voz general — NO en el momento en que el usuario está bloqueado o perdió algo. En errores y vacíos, la prioridad es dirigir; el tono solo modula, nunca reemplaza la dirección.

---

## PLAIN LANGUAGE, NÚMEROS Y FORMATO

```
LENGUAJE LLANO:
- Palabras que el usuario usaría hablando, no jerga corporativa ni técnica.
  "iniciar" no "instanciar", "cuenta" no "perfil de usuario del sistema".
- Frases cortas. Una idea por frase. Si una frase tiene una coma que aclara otra cosa, son dos frases.
- Sin relleno: "Por favor, ten en cuenta que es necesario que…" → "Necesitas…".
- Voz positiva: di qué SÍ hacer. "Usa 8+ caracteres" mejor que "No uses menos de 8 caracteres".

NÚMEROS Y FORMATO (el detalle que se ve premium):
- Fechas relativas para lo reciente: "hace 5 min", "ayer", "hace 3 días" — no "2026-06-18 14:32:01".
- Fechas absolutas para lo lejano: "12 jun" / "12 jun 2025" (incluye año si no es el actual).
- Cantidades grandes abreviadas: "1,2 k", "3,4 M" — no "1234" ni "3400000".
- Moneda con el formato local LATAM (separador correcto, símbolo correcto): "$1.250" / "$9,99".
- Pluralización real: "1 archivo" / "2 archivos" / "0 archivos" (nunca "1 archivos" ni "archivo(s)").
- Singular/plural y género concuerdan ("Eliminada" para una foto, "Eliminado" para un archivo).
```

```
MICROCOPY DE ESTADOS (botones, placeholders, carga):
- Placeholder = ejemplo terminado en "…":  "Ej. Lanzamiento de marzo…"  (no repite la label).
- Estado de carga con gerundio del verbo de la acción:  "Guardando…", "Publicando…", "Buscando…".
  → "Cargando…" genérico solo cuando no hay una acción específica que nombrar.
- Botón en reposo / cargando / hecho usan el MISMO verbo: "Guardar" → "Guardando…" → "Guardado ✓".
- Nunca un botón que cambie de "Guardar" a un spinner sin texto: el spinner solo no dice qué hace.
```

---

## EL MECANISMO NO ES LA PROMESA

El mecanismo es **cómo funciona el producto por dentro**. La promesa es **lo que la persona quiere
que le pase**. Se confunden constantemente, y el resultado es un copy correcto que no mueve a nadie.

```
Mecanismo:  "te damos el paso que sigue"          ← describe el motor
Promesa:    "resuélvelo tú, sin que nadie te lo dé" ← describe el deseo
```

Nadie desea un paso intermedio, un algoritmo, una recomendación personalizada ni un plan adaptativo.
Desea el estado final: entender, dejar de pelear, llegar tranquilo, verse capaz.

**La prueba:** lee la frase y pregunta *"¿alguien se acuesta deseando esto?"*. Si la respuesta es no,
estás describiendo el mecanismo.

**Dónde va cada uno:**

| | Va en | Función |
|---|---|---|
| **Promesa** | Titular, CTA, primera línea | Es lo que se compra. Sale de la ficha de avatar |
| **Mecanismo** | Debajo, como razón | Explica **por qué** esta promesa sí es creíble |

El mecanismo sigue siendo valioso —suele ser lo único que la competencia no puede copiar—, pero
funciona como **prueba de la promesa**, nunca como sustituto.

---

## LA INTERFAZ NO HABLA EL IDIOMA DEL SISTEMA

Etiquetas que existen porque son cómodas para quien programa, no porque signifiquen algo para quien
usa: `N1`, `V2`, `paso_3`, `Tier 1`, `Item`, `Registro`, `ID`, códigos internos de estado.

```
❌ N1  N2  N3  N4        ← ¿qué es N?
✅ Nivel 1  Nivel 2 …    ← o el nombre real de cada uno
```

**Regla:** ninguna abreviatura del código llega a la pantalla. Si no cabe escrita completa, el
problema es el diseño, no la palabra.

---

## LOS DATOS DEL USUARIO SE PRESENTAN CON CUIDADO

Lo que la persona escribe entra tal cual: en un móvil casi nadie usa mayúsculas, corrige el acento
ni revisa los espacios. Mostrar ese texto crudo en un titular —sobre todo en la pantalla que pide
dinero— se lee como descuido del producto.

- **Capitalizar** la inicial de nombres propios al mostrarlos en titulares y saludos.
- **No** forzar el resto a minúsculas: hay nombres con mayúsculas interiores legítimas.
- **Recortar** espacios sobrantes; nunca recortar el texto con puntos suspensivos si es un dato que
  la persona eligió (su nombre, su tema, su objetivo): verlo cortado es lo contrario de personalizado.
- **Concordancia gramatical** cuando el dato se inserta en una frase: artículos y géneros tienen que
  cuadrar con el valor real, no con el más frecuente. Una frase que cuadra con tres de cuatro valores
  posibles delata que detrás no hay nadie escribiendo.

---

## VOZ DEL AGENTE vs COPY DE LA APP (dos registros que NUNCA se mezclan)

- **La voz del AGENTE con el usuario es SIEMPRE español latino neutro**: tuteo ("tú tienes",
  "puedes", "elige"), cero voseo, cero regionalismos. En la voz del agente están PROHIBIDOS estos
  ejemplos de voseo/regionalismos: "vos", "tenés", "mirá", "che", "órale", "parce", "plata"/"lana" (como dinero).
- **El copy de la APP sigue el registro y dialecto del avatar** (regla dialectal de `52` + campo
  Registro de FICHA-AVATAR.md): si el mercado es Argentina, el copy de la app PUEDE vosear —
  el agente en el chat, nunca. La regla dialectal de 52 no se toca desde aquí.

---

## MINI-CHECKLIST DE UX WRITING (recorrer en cada pantalla)

```
[ ] Cada nombre describe lo que el USUARIO controla, no la arquitectura ("Notificaciones", no "webhooks")
[ ] Cada botón nombra su consecuencia con un verbo ("Guardar cambios", no "Enviar"/"OK"/"Continuar")
[ ] El verbo de una acción es el MISMO en reposo, cargando, éxito, error e historial
[ ] Cada elemento hace UN trabajo: labels etiquetan, placeholders ejemplifican, helpers aclaran
[ ] Los placeholders son un ejemplo terminado en "…", no una repetición de la label
[ ] Todo error dice QUÉ PASÓ + QUÉ HACER (accionable), sin código, sin chiste, sin disculpa larga
[ ] Los empty states dirigen a la primera acción (título que no dice "vacío" + valor + CTA)
[ ] Lenguaje llano, frases cortas, voz positiva (di qué SÍ hacer)
[ ] Fechas, números, moneda y plurales con formato local LATAM correcto (sin "1 archivos")
[ ] Estados de carga con gerundio del verbo real ("Guardando…"), no "Cargando…" genérico
[ ] Si es landing/paywall: headline 8-10 palabras máx (<8 ideal — regla única en 52), subtitulo <=2 lineas mobile, palabras clave resaltadas y CTA con consecuencia concreta
[ ] No hay placeholders de confianza ("garantia visible", "pago seguro despues") ni mensajes internos de proceso en UI publica
```

---

## TABLA ANTES / DESPUÉS (los arreglos más comunes)

| Contexto | ❌ Antes | ✅ Después | Por qué |
|---|---|---|---|
| Menú de ajustes | "Config de webhooks" | "Notificaciones" | Nombrar por lo que el usuario controla |
| Botón primario | "Enviar" | "Publicar ahora" | El botón dice qué pasa |
| Confirmar borrado | "¿Confirmar?" / "OK" | "Sí, eliminar 3 archivos" | Consecuencia exacta en el botón |
| Toast de éxito | "¡Listo!" | "Publicado ✓" | Mismo verbo del botón "Publicar" |
| Placeholder | "Nombre del proyecto" | "Ej. Lanzamiento de marzo…" | Ejemplo, no repetir la label |
| Estado de carga | "Cargando…" | "Guardando…" | Gerundio del verbo de la acción |
| Error de red | "Error 500" | "No se pudo guardar. Revisa tu conexión y toca Reintentar" | Qué pasó + qué hacer |
| Empty state | "No hay datos" | "Aún no tienes publicaciones — crea la primera" | Dirige a la acción |
| Fecha | "2026-06-18 14:32" | "hace 5 min" | Formato humano |
| Helper de campo | (label que explica todo) | Label corta + helper aparte | Cada elemento, un trabajo |

### Acceso y compras: cuatro estados, cuatro mensajes

Nunca colapsar una consulta de entitlement en booleano si puede fallar la red:

```
entitled          -> entrar/desbloquear
not_entitled      -> mostrar planes/restaurar compra
auth_required     -> iniciar sesión con el email de compra
unknown_retryable -> "No pudimos verificar tu acceso. Reintenta" + soporte; jamás "no compraste"
```

Un timeout, 5xx o conexión caída no demuestra ausencia de compra. Esta distinción se prueba E2E y
es bloqueante en `61-INTEGRIDAD-DE-LANZAMIENTO.md`.

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

- **`11-DISENO-EMOCIONAL.md`**: define el TONO/voz (los 3 adjetivos, cuándo celebrar, errores empáticos). 42 define la DISCIPLINA funcional (nombrar, botones, consistencia, estructura del error). El tono modula; el UX writing dirige. No se duplican: 11 = cómo suena, 42 = si se entiende.
- **`14-LEYES-DE-DISENO.md`**: los LÍMITES DE TEXTO (1 titular + 1 subtitular, labels de 1-2 palabras) son la restricción cuantitativa que este archivo aplica al elegir las palabras.
- **`15-PATRONES-UX.md`**: la anatomía de empty states y la escala de latencia; 42 da el copy exacto para esos estados.
- **`09-SEGURIDAD.md` / CLAUDE.md**: la regla de errores (qué pasó + qué hacer, sin filtrar detalle técnico) — 42 la operacionaliza en el lenguaje visible.
- **`32-DEL-MVP-AL-PRODUCTO.md`**: el copy genérico es una de las señales de "MVP básico"; el copy de este archivo es parte de subir el listón a "vendible".
- **`39-INTERNACIONALIZACION.md`**: pluralización, formato de fecha/moneda y concordancia de género se resuelven con las herramientas de i18n cuando la app es multi-idioma.
