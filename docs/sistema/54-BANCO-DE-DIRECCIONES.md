# BANCO DE DIRECCIONES DE ARTE — 12 puntos de partida para no converger en el "segundo genérico"

> **Cuándo cargar este archivo:**
> - En la Sesión de identidad visual, DESPUÉS del PASO 0 de `16-DIRECCION-DE-ARTE.md` (TABLA DE LÍDERES del 0.2bis + mundo del sujeto) y ANTES de fijar la Ficha
> - Cuando el test de intercambiabilidad falla y hay que rederivar
> - SIEMPRE junto con LA PREGUNTA DE REFERENCIA (PASO 0 del protocolo del final) — obligatoria
>   ANTES de proponer cualquier diseño — y con la ruta que salga de ella: A/B/C o RÉPLICA FIEL
>
> **Posición del banco (doctrina jul-2026):** el banco se usa **DESPUÉS de la TABLA DE LÍDERES
> del `16` (PASO 0.2bis)**, como fuente del **DISPOSITIVO OWNABLE** y del detalle propio — NO
> sustituye basarse en lo que ya funciona. La identidad base (tipografía, lógica de color, cards)
> se FUSIONA de los líderes del nicho; del banco se roba el gesto que la diferencia. **Si una
> dirección del banco contradice lo que los líderes del nicho usan (p.ej. serif editorial para
> una app de hábitos gamificada), MANDAN los líderes.**
>
> **Problema que resuelve (2 líneas):** al prohibir el neón-oscuro genérico, los agentes convergen en un SEGUNDO genérico — crema + casi-negro + Bricolage en cada app. Este banco existe para forzar RANGO: 12 direcciones nombradas, con paleta, par tipográfico y dispositivo ownable listos para usar (la paleta se toma tal cual — la divergencia la ponen el dispositivo, la composición y la 2ª nota de color).

---

## REGLAS DE USO (antes de elegir nada)

```
(a) SI HAY REFERENCIA VISUAL DEL USUARIO, LAS 12 DIRECCIONES NO APLICAN para paleta/tipografía/
    modo. La referencia manda (palanca #1 contra lo genérico — 16): se extrae SU dirección
    completa y el catálogo de direcciones ni se abre. La ruta la decide el TIPO de referencia
    (PASO 0 del protocolo): captura de pantalla completa → RÉPLICA FIEL ÚNICA; referencia
    parcial (paleta/moodboard) o pedido de variantes → 3 INTERPRETACIONES FIELES del contrato,
    nunca 3 direcciones del banco.
(b) SE ELIGE POR EL MUNDO DEL SUJETO, no por gusto. Cada dirección lista dónde encaja y dónde NO.
    "Me gusta la terracota" no es un argumento; "la app vive en cocinas de familia" sí.
(c) PROHIBIDO REPETIR la dirección usada en el proyecto anterior. Consultar el registro en
    ESTADO.md (sección "Decisiones técnicas → Dirección de arte: [nombre del banco + dispositivo
    ownable elegido]") y ANOTAR la elegida al cerrar. Dos apps del SO con la misma dirección y
    el mismo dispositivo ownable = ambas fallan el test de intercambiabilidad.
(d) LA PALETA SE TOMA TAL CUAL (doctrina ago-2026, fuente única: 29). Los hex de abajo se usan
    ÍNTEGROS, sin perturbar el hue: rotar el acento "para diferenciar" produce la versión
    desafinada que la doctrina eliminó. La divergencia entre apps (y entre las opciones A/B/C)
    viene de la COMPOSICIÓN, el DISPOSITIVO OWNABLE y una 2ª nota de color propia.
    El nombre de la dirección va a ESTADO.md; los hex finales, a la Ficha.
(e) El par tipográfico también admite sustitución por un vecino de la misma familia estilística
    (otra serif de texto, otra grotesk condensada) — lo que NO se admite es Inter/Roboto/system-ui.
(f) LOS LÍDERES MANDAN SOBRE EL BANCO. La TABLA DE LÍDERES (16 PASO 0.2bis) ya fijó tipografía
    base, lógica de color y cards; del banco se toma primero el DISPOSITIVO OWNABLE (y el resto
    solo si es compatible con lo que los líderes usan). Si el par o la paleta de la dirección
    elegida contradicen la fila probada del nicho (29) o a los líderes → se conserva el
    dispositivo y se descarta el resto. Nunca serif+serif (regla dura de 29).
```

---

## LAS 12 DIRECCIONES

### 1. Editorial cálida
- **Mundo del sujeto:** lectura, escritura, periodismo, cursos, newsletters, apps de reflexión/diario.
- **Paleta** (se toma tal cual — regla d): fondo `#F6F1E8` · superficie `#FCF9F2` · texto `#2C2721` · acento `#7A3E2E` (óxido profundo, no terracota pastel).
- **Par tipográfico:** display **Newsreader** (Google, óptica display) + body **Mulish**.
- **Dispositivo ownable — subrayado marcador en la palabra clave del titular:**
```css
.marcador {
  background: linear-gradient(transparent 62%, color-mix(in oklab, var(--brand-primary) 26%, transparent) 62%);
  padding: 0 0.1em;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone; /* el subrayado sigue al texto si parte de línea */
}
```
- **Motion signature:** 320ms, ease-out suave `cubic-bezier(0.16, 1, 0.3, 1)`; los titulares entran con un fade puro (sin translate) — como pasar una página, nunca rebota.
- **NO aplicarla a:** fitness de intensidad, trading/cripto, herramientas técnicas B2B (se lee lenta y literaria).

### 2. Brutalista suave
- **Mundo del sujeto:** herramientas de creadores, portafolios, apps de productividad con opinión, comunidades indie.
- **Paleta:** fondo `#F2F0EB` · superficie `#FBFAF7` · texto `#1C1B18` · acento `#2743D6` (azul rotulador).
- **Par tipográfico:** display **Archivo Black** + body **Work Sans**.
- **Dispositivo ownable — sombra dura offset + borde visible (nada difumina):**
```css
.bloque-duro {
  border: 2px solid var(--text-primary);
  border-radius: var(--radius-md); /* radio pequeño: 6-8px, no 0 (0 + hairlines + gris = combo quemado) */
  box-shadow: 4px 4px 0 0 var(--text-primary);
  transition: box-shadow 120ms var(--ease-out), transform 120ms var(--ease-out);
}
.bloque-duro:active { transform: translate(3px, 3px); box-shadow: 1px 1px 0 0 var(--text-primary); }
```
- **Motion signature:** 150-200ms, curva firme `cubic-bezier(0.32, 0.72, 0, 1)`; el press HUNDE el bloque hacia su sombra (transform, no scale) — táctil como un sello.
- **NO aplicarla a:** salud/clínica, finanzas conservadoras, bienestar/calma (grita donde hay que susurrar).

### 3. Fintech de bolsillo
- **Mundo del sujeto:** finanzas personales, presupuesto, facturación freelance, control de deudas.
- **Paleta:** fondo `#101216` (pizarra, no #000) · superficie `#171A21` · texto `#E7E9EE` · acento `#3ECF8E` desaturado a `#46B583` para dark (verde saldo, no verde neón).
- **Par tipográfico:** display **Geologica** + body **Wix Madefor Text**.
- **Dispositivo ownable — numerales tabulares + regla vertical de datos** (receta completa en `53` Ejemplo B, clase `.dato-regla` + `.numeral`): todo dato clave cuelga de una regla de acento que se desvanece; los montos SIEMPRE en `tabular-nums`.
- **Motion signature:** 200-250ms, `cubic-bezier(0.32, 0.72, 0, 1)`; los números nunca hacen bounce — cuentan y se detienen en seco (la plata no rebota).
- **NO aplicarla a:** infantil/educación temprana, bienestar emocional, apps sociales (se siente extracto bancario).

### 4. Retro-deportiva
- **Mundo del sujeto:** fitness, running, retos de hábito físico, apps de equipo/liga, nutrición de rendimiento.
- **Paleta:** fondo `#12100C` (casi-negro cálido) · superficie `#1B1813` · texto `#F1EDE4` · acento `#E8590C` (naranja pista de atletismo).
- **Par tipográfico:** display **Big Shoulders** (condensada, en mayúsculas con tracking +0.02em) + body **Barlow**.
- **Dispositivo ownable — esquina recortada (dorsal de competencia) en la card héroe:**
```css
.card-dorsal {
  clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%);
  background: var(--surface-elevated);
  border-left: 3px solid var(--brand-primary);
}
```
- **Motion signature:** 180-240ms con UN spring reservado a completar el entreno (stiffness alta, damping medio); las barras de progreso crecen escalonadas como una salida de tacos.
- **NO aplicarla a:** finanzas, legal, salud clínica, meditación (demasiada adrenalina).

### 5. Clínica humana
- **Mundo del sujeto:** salud, telemedicina, medicación, veterinaria, seguros — donde hay miedo y hace falta calidez competente.
- **Paleta:** fondo `#F4F7F6` (blanco quirófano ENTIBIADO) · superficie `#FDFEFD` · texto `#22302C` · acento `#0F766E` (teal profundo, no cian).
- **Par tipográfico:** display **Gantari** + body **Atkinson Hyperlegible** (legibilidad clínica real, no estética de hospital).
- **Dispositivo ownable — duotone de marca en toda fotografía/ilustración:**
```css
.foto-duotone { position: relative; overflow: hidden; border-radius: var(--radius-lg); }
.foto-duotone img { filter: grayscale(1) contrast(1.05); display: block; width: 100%; }
.foto-duotone::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--brand-primary);
  mix-blend-mode: soft-light;
  opacity: 0.55;
  pointer-events: none;
}
```
- **Motion signature:** 280ms, ease-out estándar; CERO springs y cero celebraciones grandes — la confianza clínica se mueve poco y siempre igual.
- **NO aplicarla a:** entretenimiento, creadores, gaming, retail (se percibe aséptica).

### 6. Nocturna de estudio
- **Mundo del sujeto:** aprendizaje profundo, flashcards, preparación de exámenes, escritura larga, focus/pomodoro.
- **Paleta:** fondo `#14121B` (casi-negro violeta MUY desaturado — croma bajo, no morado IA) · superficie `#1C1926` · texto `#EAE6F2` · acento `#E0B458` (luz de lámpara).
- **Par tipográfico:** display **Spectral** (serif de pantalla) + body **IBM Plex Sans**.
- **Dispositivo ownable — grano + halo de lámpara sobre el objeto de estudio:**
```css
.halo-lampara {
  background:
    radial-gradient(420px 300px at 50% 0%, color-mix(in oklab, var(--brand-primary) 9%, transparent) 0%, transparent 70%),
    var(--surface-elevated);
}
/* + el grano feTurbulence de 53 Ejemplo A (body::after) con opacity 0.04 */
```
- **Motion signature:** 350ms, ease-out suave; stagger lento (80ms) — ritmo de biblioteca de noche, nada compite con el contenido.
- **NO aplicarla a:** fitness, ventas/CRM, apps diurnas de logística (el ambiente nocturno estorba de día).

### 7. Terracota mediterránea
- **Mundo del sujeto:** cocina, recetas, mercado local, viajes lentos, hospitalidad, vino y sobremesa.
- **Paleta:** fondo `#F8F1E9` · superficie `#FDF8F1` · texto `#3A2E26` · acento `#C0562F` (barro cocido) + 2ª nota funcional `#5F7248` (oliva) SOLO en estados positivos.
- **Par tipográfico:** display **Marcellus** (con mayúsculas espaciadas +0.06em en eyebrows) + body **Figtree**.
- **Dispositivo ownable — textura de puntos (arena/cerámica) en secciones alternas:**
```css
.seccion-arena {
  background-image: radial-gradient(color-mix(in oklab, var(--text-primary) 7%, transparent) 1px, transparent 1px);
  background-size: 14px 14px;
  background-color: var(--surface-tertiary);
}
```
- **Motion signature:** 300-350ms, ease-out cálido; las imágenes de platos entran con un scale 0.97→1 lento — apetito, no urgencia.
- **NO aplicarla a:** SaaS técnico, cripto/trading, apps de emergencia (demasiado vacacional).

### 8. Neo-memphis contenida
- **Mundo del sujeto:** educación de adolescentes/jóvenes, creatividad, idiomas, apps de comunidad con humor.
- **Paleta:** fondo `#FAF7F0` · superficie `#FFFEF9` · texto `#25222B` · acento `#E24E7A` (frambuesa) + 2ª nota `#2E5FE8` SOLO en un elemento fijo (el logo-forma o el indicador de nav) — nunca regadas.
- **Par tipográfico:** display **Bricolage Grotesque** (la ÚNICA dirección del banco que la usa — si tu proyecto anterior ya la usó, sustitúyela por **Anybody** o **Hanken Grotesk** display) + body **Onest**.
- **Dispositivo ownable — la forma-firma: un círculo desplazado con outline que marca el elemento activo:**
```css
.forma-firma {
  position: relative;
  isolation: isolate;
}
.forma-firma::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: -4px -8px -4px -4px;
  transform: rotate(-2deg);
  border: 2px solid var(--brand-primary);
  border-radius: 9999px 9999px 9999px 12px; /* radio asimétrico deliberado — la firma */
}
```
- **Motion signature:** 220ms con UN overshoot suave (spring damping alto) solo en la forma-firma; el resto, ease-out plano — memphis en un solo lugar, contención en todos los demás.
- **NO aplicarla a:** finanzas, salud, legal, B2B enterprise (el juego mata la credibilidad).

### 9. Papel y tinta
- **Mundo del sujeto:** documentos, contratos, notas serias, journaling minimal, herramientas de escritores profesionales.
- **Paleta:** fondo `#F5F4F0` (piedra fría, NO crema) · superficie `#FCFBF8` · texto `#1E1D1A` · acento `#8C2F23` (lacre) usado en ≤2 lugares por pantalla.
- **Par tipográfico:** display **EB Garamond** + body **Inter Tight** (Google — el body va en sans NEUTRA, regla (b) de 29; Cabinet Grotesk es display, no body).
- **Dispositivo ownable — doble regla tipográfica + capitular en el documento protagonista:**
```css
.doc-regla {
  border-top: 2px solid var(--text-primary);
  position: relative;
  padding-top: 12px;
}
.doc-regla::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 0;
  right: 0;
  border-top: 1px solid var(--text-primary); /* la doble regla de las portadillas */
}
.capitular::first-letter {
  font-family: var(--font-display);
  font-size: 3.2em;
  float: left;
  line-height: 0.85;
  padding-right: 0.08em;
  color: var(--brand-primary);
}
```
- **Motion signature:** 250ms, fades casi puros (translateY ≤6px); la tinta no vuela — aparece.
- **NO aplicarla a:** fitness, social, gaming, dashboards densos de datos vivos (es dirección de lectura, no de monitoreo).

### 10. Salvia técnica
- **Mundo del sujeto:** jardinería/agro-tech, sostenibilidad, hábitos de bienestar con datos, clima, herramientas de campo.
- **Paleta:** fondo `#EFF2ED` · superficie `#F9FBF7` · texto `#242B24` · acento `#3D6B4F` (salvia profunda); dark opcional derivado: fondo `#151A16`.
- **Par tipográfico:** display **Chivo** + body **Hanken Grotesk**.
- **Dispositivo ownable — rejilla técnica de campo + ticks de medición en el dato héroe:**
```css
.panel-campo {
  background-image:
    linear-gradient(color-mix(in oklab, var(--text-primary) 5%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in oklab, var(--text-primary) 5%, transparent) 1px, transparent 1px);
  background-size: 24px 24px;
}
.tick-escala {
  background-image: repeating-linear-gradient(90deg,
    var(--border-strong) 0 1px, transparent 1px 8px);
  height: 6px;
}
```
- **Motion signature:** 260ms ease-out; los gráficos se dibujan con `strokeDashoffset` lento (900ms) — el crecimiento es el mensaje.
- **NO aplicarla a:** moda/beauty, entretenimiento nocturno, fintech agresiva (el verde-campo confunde con "saldo").

### 11. Cítrica utilitaria
- **Mundo del sujeto:** logística personal, delivery, tareas del hogar, herramientas rápidas de uso diario, side-projects utilitarios.
- **Paleta:** fondo `#FBFAF6` · superficie `#FFFEFB` · texto `#232019` · acento `#D97E00` (mandarina quemada — no amarillo neón) con `--brand-primary-text: #231A05`.
- **Par tipográfico:** display **Unbounded** (solo en pesos 500-600, tamaños contenidos) + body **Familjen Grotesk**.
- **Dispositivo ownable — el dato/palabra clave va sobre una pastilla de acento partible:**
```css
.pastilla-dato {
  background: var(--brand-primary);
  color: var(--brand-primary-text);
  border-radius: var(--radius-sm);
  padding: 0.05em 0.3em;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  font-variant-numeric: tabular-nums;
}
```
- **Motion signature:** 160-220ms, la más rápida del banco (`cubic-bezier(0.32, 0.72, 0, 1)`); optimistic UI en todo toggle — la utilidad se siente instantánea o no se siente.
- **NO aplicarla a:** lujo, salud mental, legal, contenido largo (la energía cítrica cansa en sesiones largas).

### 12. Índigo profundo
- **Mundo del sujeto:** sueño, meditación, astronomía/astro-apps, journaling nocturno, música ambiental.
- **Paleta:** fondo `#12142A` (índigo casi-negro, croma contenido) · superficie `#191C36` · texto `#E4E4F0` · acento `#C8B27C` (oro viejo, jamás cian/morado neón).
- **Par tipográfico:** display **Zodiak** (Fontshare, serif) + body **Switzer** (Fontshare).
- **Dispositivo ownable — velo de profundidad vertical + hairline dorada como separador único:**
```css
/* iOS Safari ignora/jankea background-attachment: fixed — el velo va en un pseudo-elemento fijo */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(180deg, #1A1D3D 0%, var(--surface-base) 420px),
    var(--surface-base);
}
.hairline-oro {
  border: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, color-mix(in oklab, var(--brand-primary) 55%, transparent), transparent);
}
```
- **Motion signature:** 400ms (el límite superior permitido), fades largos y stagger de 80ms; ninguna animación bloqueante — todo respira al ritmo de exhalar.
- **NO aplicarla a:** productividad diurna, fitness, e-commerce, B2B (la calma nocturna se lee como lentitud).

---

## RESUMEN RÁPIDO (para elegir en 30 segundos)

| # | Dirección | Modo | Acento base | Par tipográfico | Dispositivo |
|---|---|---|---|---|---|
| 1 | Editorial cálida | Claro | Óxido `#7A3E2E` | Newsreader + Mulish | Subrayado marcador |
| 2 | Brutalista suave | Claro | Azul rotulador `#2743D6` | Archivo Black + Work Sans | Sombra dura offset |
| 3 | Fintech de bolsillo | Oscuro | Verde saldo `#46B583` | Geologica + Wix Madefor | Regla vertical + tabular |
| 4 | Retro-deportiva | Oscuro | Naranja pista `#E8590C` | Big Shoulders + Barlow | Esquina recortada |
| 5 | Clínica humana | Claro | Teal `#0F766E` | Gantari + Atkinson Hyperlegible | Duotone de marca |
| 6 | Nocturna de estudio | Oscuro | Luz lámpara `#E0B458` | Spectral + IBM Plex Sans | Grano + halo |
| 7 | Terracota mediterránea | Claro | Barro `#C0562F` | Marcellus + Figtree | Puntos de arena |
| 8 | Neo-memphis contenida | Claro | Frambuesa `#E24E7A` | Bricolage + Onest | Forma-firma outline |
| 9 | Papel y tinta | Claro | Lacre `#8C2F23` | EB Garamond + Inter Tight | Doble regla + capitular |
| 10 | Salvia técnica | Claro | Salvia `#3D6B4F` | Chivo + Hanken Grotesk | Rejilla + ticks |
| 11 | Cítrica utilitaria | Claro | Mandarina `#D97E00` | Unbounded + Familjen Grotesk | Pastilla de dato |
| 12 | Índigo profundo | Oscuro | Oro viejo `#C8B27C` | Zodiak + Switzer | Velo + hairline oro |

8 claras / 4 oscuras — el banco mismo encarna la doctrina: el modo se DERIVA, y claro es hoy lo más distintivo.

---

## PASO 0 — LA PREGUNTA DE REFERENCIA (obligatoria ANTES de proponer cualquier diseño)

> **El fallo que corrige:** el SO solo reaccionaba a la referencia si el usuario la daba por
> iniciativa propia. La mayoría NO sabe que puede darla — tiene guardada una captura de
> Pinterest, de redes sociales o de una app que ama, y recibía una propuesta inventada sin que
> nadie le preguntara. La referencia se PIDE, no se espera.

Antes de crear CUALQUIER propuesta de diseño (las 3 opciones A/B/C, un mockup de identidad,
"así se va a ver tu app"), el agente hace SIEMPRE esta pregunta — TEXTUAL, sin resumirla ni
parafrasearla (misma regla que la pregunta de arranque de INICIO.md):

```
🎨 Antes de diseñar cómo se va a ver tu app, dime qué prefieres:

1️⃣ Yo te propongo el diseño — estudio las mejores apps de tu tema y te preparo 3 estilos
   distintos aplicados a TU app, para que elijas el que más te guste.

2️⃣ Tú me muestras un estilo que te encante — si viste un diseño que te gustó en Pinterest,
   en redes sociales o en alguna app que uses, mándame una o varias capturas de pantalla y
   hago que tu app se vea igual a ese estilo (mismos colores, mismas formas, misma
   sensación), adaptado a tu contenido.

Responde 1 o 2 — y si eliges 2, pega aquí la(s) captura(s).
```

Reglas de la pregunta:

```
[ ] Se hace UNA sola vez por proyecto, en la sesión de identidad, ANTES de renderizar nada.
[ ] Si el usuario YA dio una referencia antes (en el brief, en el arranque, en cualquier
    mensaje previo), la pregunta se OMITE: se va directo a la ruta de réplica con lo que dio.
[ ] Si responde 2 pero no manda las capturas: pedírselas con suavidad y ESPERAR — PROHIBIDO
    proponer un diseño "mientras tanto".
[ ] La respuesta va a ESTADO.md ("Ruta de diseño: propuesta propia / réplica de referencia")
    — cosa juzgada, como toda decisión de la ficha.
[ ] El formato de la pregunta ES la regla 1E de CLAUDE.md (emoji temático + opciones 1️⃣ 2️⃣
    con lo importante en negrilla + explicación breve): toda pregunta de opciones del SO
    se presenta así.
```

**RUTA 1 — "Propóngamelo tú"** → EL PROTOCOLO A/B/C de abajo (sin referencia: 3 fusiones
distintas de líderes del nicho).

**RUTA 2 — el usuario manda captura(s) → LA RÉPLICA FIEL.** La captura (de Pinterest, de
redes, de otra app — el origen da igual) es REFERENCIA-MANDATO con todo el peso del contrato
del `16`. Y si muestra una PANTALLA COMPLETA (una UI real: layout, componentes, jerarquía —
no solo una paleta o un moodboard), el entregable NO son 3 opciones divergentes: es UNA
réplica fiel.

```
EL PROTOCOLO DE RÉPLICA FIEL:

1. ANALIZAR A DETALLE cada captura con la TABLA DE EXTRACCIÓN del 16 — MIRANDO la imagen, no
   de memoria: hex exactos (fondo, superficies, acento, textos), clase tipográfica y pesos,
   radios, sombras (capas, dureza), espaciado y densidad, tratamiento de cards/botones/íconos,
   estructura del layout, modo claro/oscuro. Con VARIAS capturas del mismo estilo se extrae
   el SISTEMA común de todas; si las capturas traen DOS estilos que se contradicen, preguntar
   cuál manda ANTES de construir.
2. CONSTRUIR `replica-fiel.html` (mismo kit y mismo estándar que la comparativa: chasis de
   teléfono real, fuentes garantizadas con fallback-trampa, autocontenido — se parte del kit
   de plantillas-codigo/direcciones-abc/ con UN solo frame, CONSERVANDO el marcador
   data-kit="abc-v2" que el hook verifica — Regla Dura #0): la pantalla clave de SU app
   vestida con el estilo extraído, y AL LADO la captura de referencia EMBEBIDA (img local o
   data-URI) — el usuario juzga la fidelidad con sus propios ojos.
3. LA REGLA DE ORO DE LA RUTA: EL ESTILO NO SE TOCA — SE ADAPTA EL CONTENIDO. Lo único que
   cambia respecto a la captura es el CONTENIDO (el copy, los datos, el mecanismo, las
   secciones de SU app — datos semilla del 32). Colores, tipografía, radios, sombras,
   densidad y composición se replican LO MÁS IGUAL POSIBLE. PROHIBIDO "mejorar", modernizar,
   aplicar la capa anti-IA en contra o desviar el estilo "para darle identidad propia": la
   identidad la eligió el usuario al elegir la captura (doctrina "es igualita" del 16).
4. VERIFICAR ANTES DE PRESENTAR: screenshot de replica-fiel.html + TEST DE FIDELIDAD del 16
   contra la captura (modo, hue, clase tipográfica, radios ±4px, densidad, lógica de
   sombras). ≥2 desvíos = corregir y re-capturar ANTES de mostrarla. Los gates de calidad de
   la comparativa aplican igual: cero emojis, íconos en chip SVG, mockup LLENO, fuentes
   verificadas clase por clase en el screenshot.
5. PRESENTAR con "Ábrelo aquí: [ruta]" + el screenshot y estas salidas en FORMATO VISUAL
   (regla 1E de CLAUDE.md — cada una en su línea, con emoji y lo importante en negrilla):
   1️⃣ **Apruébala** — tu app se vestirá con este estilo en todas sus pantallas.
   2️⃣ **Ajusta un detalle puntual** — un color, una fuente, un espacio.
   3️⃣ **Quiero ver 2-3 variantes fieles** — mismo estilo, composiciones distintas
   (→ INTERPRETACIONES FIELES del protocolo de abajo).
   4️⃣ **Prefiero otra captura** — o que te proponga yo los estilos.
6. Aprobada la réplica → EL TOUR DE LA APP (sección final de este archivo): se duplica el
   frame ya tematizado con las vistas clave de la app por dentro y el usuario confirma viendo
   el conjunto. Recién con el tour aprobado → FICHA-ARTE.md (con la captura original archivada
   en docs/revisiones/ como evidencia del contrato) + tokens + ESTADO.md. `replica-fiel.html`,
   el tour y sus screenshots se archivan en docs/revisiones/. Desde ahí, cosa juzgada: TODA
   pantalla nueva hereda este estilo y pasa el TEST DE FIDELIDAD contra la referencia al
   cerrar (Regla de Oro 7).

CUÁNDO SÍ van 3 opciones CON referencia (INTERPRETACIONES FIELES):
· La referencia es PARCIAL — fija paleta/mood pero NO una pantalla (un moodboard, una foto
  de ambiente, una paleta de Pinterest sin UI): la composición queda libre → 3
  interpretaciones fieles que divergen SOLO en lo que la referencia no fija.
· El usuario lo PIDE (salida 3 de la réplica).
En ambos casos aplica la rama "CON referencia" del protocolo de abajo.
```

---

## EL PROTOCOLO A/B/C (la RUTA 1 — y las interpretaciones fieles cuando la referencia es parcial o el usuario pide variantes)

En la **Sesión de identidad** de cada proyecto, la dirección NO se argumenta en prosa — se **renderiza y se elige**. Esto convierte la regla cualitativa ("que tenga identidad") en una selección entre cosas que el usuario VE. **Aplica SIEMPRE que la identidad se cree SIN una captura de pantalla completa del usuario** (RUTA 1, o RUTA 2 con referencia parcial / pedido de variantes); con captura completa manda LA RÉPLICA FIEL del PASO 0. Lo único que cambia entre los dos casos es DE QUÉ divergen las 3 opciones:

**REGLA DURA #0 — LA COMPARATIVA NACE DEL KIT, JAMÁS DESDE CERO (gate verificado por hook):**

```
direcciones-abc.html NO se escribe a mano: se COPIA plantillas-codigo/direcciones-abc/plantilla.html
a la raíz del proyecto y se TEMATIZA (tokens de cada opción + datos semilla del dominio + copy +
hipótesis). El kit ya trae TODO lo que la comparativa pobre olvida: chasis real con statusbar y
home-indicator, TAB BAR con íconos SVG, fallback-trampa montado, hairlines degradé, sombras
tintadas, chips SVG, espécimen tipográfico, MUESTRA DE PALETA, HERO DE LANDING por opción (con la
palabra que vende en acento y el botón valiente) y las 4 salidas visibles.

FALLO REAL que esta regla corrige: un agente escribió la comparativa desde cero en 239 líneas —
sin chasis, con emojis 🔥 como íconos, sin fallback-trampa, sin tab bar, sin hero de landing,
cards planas — teniendo el kit completo a un `cp` de distancia. Nunca más.

EL MARCADOR: el <html> del kit lleva data-kit="abc-v2" y el archivo final LO CONSERVA — el hook
pre-stop lo verifica: comparativa sin marcador = escrita desde cero = violación (igual para
replica-fiel.html de la RUTA 2: mismo kit, un solo frame + la captura al lado).

Y partir del kit es ADEMÁS más barato: tematizar y llenar cuesta una fracción de escribir ~900
líneas — la calidad y el presupuesto de tokens empujan en la misma dirección.
```

**REGLA DURA #1 — EL ENTREGABLE ES UN ARCHIVO VISUAL, NO UNA DESCRIPCIÓN:**

```
Las 3 opciones se entregan SIEMPRE como UNA SOLA página comparativa que el usuario abre y VE:
un archivo `direcciones-abc.html` AUTOCONTENIDO (CSS inline + fuentes de Google Fonts vía
<link> — cero build, se abre con doble clic) que muestra los 3 mockups LADO A LADO en frames
de teléfono de 375px, cada uno con su etiqueta grande (Opción A/B/C), su nombre y sus 2
líneas de descripción debajo. Alternativa equivalente si el dev server ya corre: la ruta
/dev/direcciones mostrando LAS TRES en una sola vista.

PROHIBIDO presentar las opciones solo con texto/descripciones, y PROHIBIDO preguntarle al
usuario cuál prefiere sin haberle dado la ruta exacta del archivo/URL donde VERLAS. Antes
de preguntar: (a) toma un screenshot de la página comparativa y VERIFÍCALO tú (¿se ven 3
diseños distintos? ¿cada tipografía se ve de su CLASE declarada — ninguna cayó al
fallback-trampa? — ver CARGA DE FUENTES GARANTIZADA abajo), (b) pega en tu mensaje
la ruta del archivo (o URL) + el screenshot. Si el preview muestra el boilerplate del
framework, NO has terminado.

El mensaje al usuario incluye: "Ábrelo aquí: [ruta/URL]" + las 4 salidas (elegir / combinar /
otras 3 / ajustar).
```

**LA COMPARATIVA ES UN ESCAPARATE, NO UN FORMULARIO (vara de calidad obligatoria):**

> **El fallo que corrige** (visto probando): la comparativa salió como tres cajas sueltas sobre fondo
> plano, sin degradados, sin marcos, sin jerarquía. El usuario la describió como "muy básica". Y es
> la PRIMERA impresión visual que recibe del sistema: si la página donde elige el estilo de su app se
> ve amateur, ya no confía en ninguna de las tres opciones. **La comparativa se juzga a sí misma.**

La página se construye con el mismo estándar que se le exige a una pantalla del producto:

```
LA PÁGINA (el contenedor, no las opciones):
[ ] Fondo con PROFUNDIDAD, no un color plano: banda oscura o crema con un mesh/degradé
    sutil detrás. Los mockups tienen que brillar contra algo, como en un showcase.
[ ] Cabecera propia: título ("Elige la dirección visual de tu app"), 1 línea de
    instrucción, y las 4 salidas visibles (elegir / combinar / otras 3 / ajustar).
[ ] Los 3 frames alineados en una fila, MISMO ancho, MISMA altura, MISMO espaciado.
    La simetría se mide, no se declara (12-FLUJO-AGENTICO).
[ ] Espaciado de la escala 4·8·12·16·24·32·48·64, también aquí.
[ ] En móvil se apilan; en escritorio van los 3 lado a lado.

CADA FRAME (la opción):
[ ] MARCO DE DISPOSITIVO REAL, no un rectángulo redondeado: bisel, isla dinámica,
    barra de estado con hora/señal/batería, indicador de inicio. Un mockup sin chasis
    se lee como una maqueta; con chasis se lee como una app que ya existe.
[ ] La pantalla DENTRO del marco va LLENA con datos semilla realistas del producto
    (32 — nunca una pantalla vacía ni "Lorem ipsum").
[ ] Debajo del frame, la ficha de la opción:
      · Etiqueta grande (Opción A / B / C) + nombre de la dirección
      · 2 líneas de descripción en lenguaje del usuario, sin jerga de diseño (GLOSARIO 1F de
        CLAUDE.md: nada de "hero", "serif", "grid", "layout" — di qué SIENTE y qué VE)
      · MUESTRA DE PALETA: 4-6 círculos o barras con los colores reales
      · ESPÉCIMEN TIPOGRÁFICO: el nombre de cada familia ESCRITO EN SU PROPIA FUENTE
        (así el usuario ve la tipografía, no lee su nombre)
[ ] Cada opción con SU dispositivo ownable ya aplicado y visible en el mockup.
```

**LOS 7 MATERIALES, VISIBLES EN CADA MOCKUP (lo que separa premium de básico):**

Cada una de las 3 pantallas del comparador debe poder señalar los 7 materiales extraídos de su
líder (`29` → "EXTRAER EL CRAFT"). Sin ellos, la comparativa se ve plana aunque la paleta sea buena:

```
[ ] Cards con MATERIAL: relleno + degradé sutil encima + luz en el borde superior
    (no un relleno plano)
[ ] Sombras en 2-3 CAPAS (una pegada + una lejana difusa), no una sombra genérica
[ ] Bordes: hairline translúcido o con degradé — nunca `1px solid #ddd`
[ ] EL BOTÓN PRINCIPAL con degradé tonal + luz interior + sombra TINTADA de su propio color
[ ] Íconos SIEMPRE en chip (círculo/squircle con fondo del acento al 8-14%), nunca sueltos
[ ] FONDO con profundidad: mesh/radial sutil o grano al 2-4% — no un fill plano
[ ] El DATO HÉROE tratado como dato: cifras tabulares, display, tracking apretado
```

⚠️ **Test de un vistazo:** si al describir un mockup solo puedes hablar de colores y tamaños —y no
de sombras, degradés ni tratamiento de íconos— está plano. Rehacer antes de presentar.

⚠️ **Prohibido presentar la comparativa sin marco de dispositivo.** Es la diferencia entre "mira
estos tres bocetos" y "mira tu app en tres versiones" — y solo la segunda permite elegir de verdad.

**GATE SIN EMOJIS (doctrina D-D — el mockup ES la promesa de calidad):**

```
[ ] SIN EMOJIS: los mockups usan icon chips SVG del kit (Lucide/Phosphor) — CERO emojis como
    íconos. Un mockup con emojis como íconos se REHACE antes de mostrarse al usuario.
[ ] Los 3 mockups llevan los detalles premium del kit: hairlines degradé de 1-2px, checkmarks
    custom (nunca el ✓ del sistema), fondo con profundidad y datos semilla realistas.
Por qué es gate y no consejo: el mockup ES la promesa de calidad de la app final — un mockup
con emojis o placeholders pobres promete una app pobre y sesga la elección del usuario.
```

**Verificación antes de presentar** (además del gate de fuentes de abajo): screenshot de la
comparativa + comprobar que los 3 frames miden lo mismo y que ninguna opción quedó visiblemente más
pobre que las otras. Una opción a medio hacer no es una opción: sesga la elección hacia las otras dos.

**CARGA DE FUENTES GARANTIZADA (parte de la REGLA DURA #1 — nació de un fallo real: una comparativa se presentó con las 3 tipografías caídas a la MISMA serif del sistema; el agente había intentado embeber base64, falló EN SILENCIO y nadie lo detectó antes de presentar):**

```
MÉTODO CANÓNICO — Google Fonts vía <link> con preconnect y display=swap. Las 3 líneas exactas
en el <head>, con TODAS las familias de las 3 opciones en UNA sola URL (ejemplo con 2 familias):

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700&family=Space+Grotesk:wght@400;600&display=swap" rel="stylesheet">

Requiere INTERNET al abrir el archivo — decírselo al usuario ("ábrelo con conexión").

EL TRUCO DEL FALLBACK-TRAMPA (obligatorio en la comparativa): cada familia se declara con un
fallback DELIBERADAMENTE feo y evidente —

  font-family: 'Baloo 2', monospace;

— así, si la fuente NO carga, el fallo GRITA en el screenshot (todo se ve monospace) en vez de
esconderse en una serif/sans del sistema que pasa desapercibida. Esto es SOLO para la
comparativa: en la app real el fallback vuelve a ser sensato (sans-serif/serif según la familia).

VERIFICACIÓN OBLIGATORIA ANTES DE PRESENTAR (gate): en el screenshot de la comparativa,
verificar OPCIÓN POR OPCIÓN que cada display se ve de su CLASE declarada: ¿la A se ve
redondeada? ¿la B grotesk? ¿la C serif? Si alguna cayó al fallback-trampa (se ve monospace) o
las tres se ven de la MISMA clase → las fuentes NO cargaron → arreglar y re-capturar ANTES de
preguntar al usuario. PROHIBIDO presentar la comparativa con fuentes caídas.

ALTERNATIVA SIN INTERNET: descargar los .woff2 y embeberlos con @font-face + base64 REAL.
Verificar (a) el PESO del archivo resultante (un .woff2 embebido de verdad suma decenas o
cientos de KB — si el html quedó liviano, el embed falló) y (b) que el screenshot confirme la
carga clase por clase. El error de la prueba real fue exactamente un embed base64 fallido en
silencio.
```

**NOTA DE VEHÍCULO (dónde se publica la comparativa decide CÓMO van las fuentes):**

```
- Si la comparativa se publica como ARTIFACT (páginas cuya CSP bloquea peticiones a hosts
  externos): el <link> a Google Fonts GARANTIZA el fallo silencioso — ahí las fuentes van
  EMBEBIDAS como @font-face con data-URI (woff2 base64 REAL, verificar el peso del archivo),
  o la comparativa se entrega como archivo local que el usuario abre con doble clic.
- El archivo `direcciones-abc.html` + su screenshot van SIEMPRE al repo en `docs/revisiones/`
  — INCLUIDAS las opciones descartadas: son evidencia de decisión ("por qué elegimos B y no
  A/C"), no basura. Lo único que se elimina antes del deploy es la ruta /dev/direcciones.
- El kit plantilla de la comparativa (chasis de teléfono, cabecera, fichas de opción,
  fallback-trampa ya montado) vive en `plantillas-codigo/direcciones-abc/` — se parte de él,
  no de cero.
```

**REGLA DURA #2 — DIVERGENCIA REAL OBLIGATORIA.** 3 acentos de color sobre la misma pantalla NO son 3 opciones. Qué debe divergir depende de la rama:

**SIN referencia del usuario — 3 FUSIONES distintas + LA REGLA DE LOS 4 EJES:**

```
Las 3 opciones son 3 FUSIONES distintas construidas desde la TABLA DE LÍDERES del 16 (PASO
0.2bis). Cada opción se ancla a una FUSIÓN DE LÍDERES DIFERENTE (A = énfasis en los líderes
X+Y, B = énfasis en Z+W...) — y su descripción de 2 líneas LO DICE. Reglas:
  - LA REGLA DE LOS 4 EJES: cada opción DEBE divergir de las otras dos en MÍNIMO 3 de
    estos 4 ejes:
    (1) CLASE TIPOGRÁFICA de la display — cada opción usa una FILA DISTINTA de las
        combinaciones probadas del 29 (p.ej. A redondeada friendly · B grotesk sobria ·
        C serif editorial — solo si la clase es válida para el nicho según los líderes);
    (2) COMPOSICIÓN de la pantalla — layouts distintos que usen apps líderes DISTINTAS
        (p.ej. A hero numérico grande + lista · B cards bento · C timeline/calendario denso);
    (3) PALETA REAL — temperatura o modo distinto cuando el nicho lo permite (mínimo 2
        modos o 2 temperaturas; nunca 3 variaciones del mismo beige), no el mismo neutro
        con otro acento;
    (4) DISPOSITIVO OWNABLE distinto (uno por opción, del banco).
  - Las 3 usan combinaciones tipográficas PROBADAS del 29 (confirmadas contra los líderes).
    NUNCA inventos que ningún líder use.
  - Cada opción toma su paleta tal cual (regla d) y respeta el registro anti-repetición
    (regla c) — la divergencia entre A/B/C viene de composición + dispositivo ownable +
    2ª nota de color propia, nunca de desafinar la paleta.

EL TEST DE DIVERGENCIA (gate antes de presentar): convierte mentalmente las 3 a escala de
grises — si se ven iguales, NO son 3 opciones: son 1 opción con 3 acentos. Rehacer.
Cambiar solo el color NO es una opción distinta.
```

**CON referencia del usuario — 3 INTERPRETACIONES FIELES del contrato:**

```
La paleta, el mood y la tipografía EXTRAÍDAS de la referencia (tabla del 16) se RESPETAN en
las tres opciones — la referencia es un contrato y las 3 lo cumplen. Como el contrato ya
fija los ejes 1 y 3 (tipografía y paleta), la divergencia OBLIGATORIA es en los ejes 2 y 4:
COMPOSICIÓN de la pantalla y DISPOSITIVO OWNABLE distintos por opción — más densidad,
profundidad (sombras vs bordes vs elevación), tratamiento de cards y microdetalles (radio
fino, textura sutil, tratamiento del dato héroe). PROHIBIDO que una opción "se aleje" de la
referencia para "dar variedad": las 3 pasarían el TEST DE FIDELIDAD del 16.
Las 3 interpretaciones fieles divergen SOLO en lo que la referencia NO fija. Si la referencia
fija casi todo y las 3 opciones difieren poco, ESO ESTÁ BIEN: es exactamente lo que el
usuario pidió — la fidelidad manda sobre la variedad. EL TEST DE DIVERGENCIA en escala de
grises es gate SOLO del caso SIN referencia: aquí NUNCA se fuerza divergencia contra el
contrato; solo se verifica que composición y dispositivo ownable difieran en el margen que
la referencia deja libre.
```

**REGLA DURA #3 — EL LISTÓN DE SHOWCASE (el NIVEL de las opciones, no solo su divergencia).** Divergir no basta: 3 wireframes con colores distintos son 3 opciones tímidas — el segundo hallazgo de la prueba real: opciones "correctas" pero planas, y una con media pantalla VACÍA. Las 3 opciones se componen al NIVEL DE LOS SHOWCASES REALES del nicho (Mobbin / Dribbble / Behance / Pinterest "mobile app design" actuales): cards grandes con formas valientes, sistemas de íconos con tratamiento, elementos gráficos firma, color con coraje. Si hay herramienta de búsqueda/web, MIRA showcases actuales del nicho ANTES de componer; si no, usa tu conocimiento de los líderes (TABLA DE LÍDERES del 16).

```
CADA OPCIÓN incluye SU PROPIO SISTEMA EXPRESIVO (además de los 4 ejes de divergencia):

(a) FORMA DOMINANTE propia — una por opción: cards XL redondeadas (radius 20-28px) ·
    pills/cápsulas apiladas · bento compacto · timeline con conector visible ·
    círculos/anillos protagonistas.
(b) SISTEMA DE ÍCONOS PROPIO — NUNCA íconos pelados sobre el fondo: contenedor de color
    pleno (chip 40-48px), duotone (Phosphor), o soft-3D. Receta CSS del soft-3D:

      .icon-3d { border-radius: 14px;
        background: linear-gradient(145deg, var(--acento-claro), var(--acento));
        box-shadow: inset 0 1px 2px rgba(255,255,255,.45),
                    inset 0 -2px 3px rgba(0,0,0,.18), 0 4px 10px var(--acento-25); }

(c) UN ELEMENTO GRÁFICO FIRMA por opción: blob orgánico tras el héroe · patrón de
    puntos/grid · mesh sutil · sticker/badge rotado (-3° a -6°) · ilustración spot.
(d) AL MENOS UN MOMENTO DE COLOR VALIENTE — los líderes usan color con coraje (Duolingo
    verde pleno, Headspace naranja pleno, Phantom lila pleno): un bloque/hero/CTA con color
    SATURADO del kit, no todo pastel tímido. La capa anti-IA sigue vigente (nada de neón
    morado/cian + glow por defecto): coraje ≠ neón.

MOCKUPS LLENOS — "la app nunca se enseña vacía" (32) aplica TAMBIÉN aquí: cada frame de la
comparativa está COMPLETO de contenido realista (datos semilla del 32) y muestra la pantalla
entera: header con saludo/contexto + el módulo héroe + 2-3 módulos secundarios + la
bottom-nav. Un frame con media pantalla vacía = REHACER esa opción.
```

**LA COMPARATIVA MUESTRA TAMBIÉN EL HERO DE LA LANDING (no solo la pantalla interna):**

```
Cada opción lleva DOS piezas con la misma dirección aplicada: su pantalla interna clave
(la home o la primera victoria) + el HERO de la landing (headline real derivado de
FICHA-AVATAR.md, CTA, fondo con profundidad — mismo estándar showcase). Razón: la landing
es lo primero que el mundo VE y lo primero que se CONSTRUYE (SECUENCIA MAESTRA) — elegir
dirección mirando solo la app interna es elegir a ciegas la pantalla que más vende. El hero
va como segundo frame de 375px bajo (o junto a) el frame de la app, dentro del mismo bloque
de la opción.
```

**HIPÓTESIS DE CONVERSIÓN POR OPCIÓN (1 línea obligatoria en la ficha de cada opción):**

```
Cada opción declara en 1 línea POR QUÉ convertiría mejor para ESTE avatar (FICHA-AVATAR.md):
  ✅ "B: el avergonzado necesita autoridad clínica sin culpa — teal sobrio + registro clínico"
  ❌ "B: moderna y confiable" (adjetivos de personalidad NO bastan — no conectan con el avatar)
La hipótesis va debajo de las 2 líneas de descripción de la opción y se conserva en
FICHA-ARTE.md junto a la elección: si luego la landing no convierte, es la primera
hipótesis a revisar (60).
```

**FORMATO DE PRESENTACIÓN (obligatorio — la página comparativa de la REGLA DURA #1, no prosa ni moodboards):**

```
1. CONSTRUIR la página comparativa: `direcciones-abc.html` autocontenido (o /dev/direcciones
   si el dev server ya corre) con las 3 variantes de la MISMA pantalla clave del producto
   (la home o la primera victoria) + el HERO de la landing por opción (regla de arriba)
   LADO A LADO en frames de teléfono de 375px, cada una con
   su paleta, su tipografía, su dispositivo ownable y su motion signature ya aplicados, su
   etiqueta grande (Opción A/B/C), su nombre y sus 2 líneas de descripción debajo. Es UNA
   pantalla real (mismos datos semilla, misma misión) resuelta 3 veces con divergencia REAL
   (REGLA DURA #2 — regla de los 4 ejes; con referencia, ejes 2 y 4) y compuesta al nivel
   showcase (REGLA DURA #3 — sistema expresivo propio, mockups llenos).
2. CAPTURAR un screenshot de la página comparativa (mecanismo real de preview/screenshot —
   Regla 7) y VERIFICARLO uno mismo contra los GATES (todos, mirando el screenshot):
     [ ] FUENTES verificadas CLASE POR CLASE (Regla #1): ¿la A se ve de su clase declarada?
         ¿la B? ¿la C? Ninguna cayó al fallback-trampa (nada se ve monospace) ni las tres
         se ven de la misma clase.
     [ ] 3 diseños distintos — pasa el TEST DE DIVERGENCIA en grises (Regla #2; gate SOLO
         SIN referencia — con referencia, divergen solo en lo que el contrato no fija y
         que difieran poco está BIEN).
     [ ] SIN EMOJIS (gate D-D): icon chips SVG del kit (Lucide/Phosphor) en los 3 mockups +
         hairlines degradé + checkmarks custom + fondo con profundidad. Con emojis como
         íconos, el mockup se REHACE antes de mostrarse.
     [ ] SISTEMA EXPRESIVO propio por opción: forma dominante + íconos con tratamiento
         (nunca pelados) + elemento gráfico firma (Regla #3).
     [ ] MOCKUPS LLENOS: header + módulo héroe + 2-3 secundarios + bottom-nav en cada
         frame; cero medias pantallas vacías (Regla #3).
     [ ] COLOR VALIENTE presente en cada opción (un bloque/hero/CTA saturado del kit —
         sin neón+glow, capa anti-IA).
   Recién entonces presentarlas como Opción A /
   Opción B / Opción C, cada una con 2 líneas: qué la define + de qué fusión de líderes
   viene (o, con referencia, qué composición/dispositivo interpreta distinto).
3. LA PREGUNTA AL USUARIO incluye SIEMPRE "Ábrelo aquí: [ruta del archivo/URL]" + el
   screenshot, y ofrece las 4 salidas en FORMATO VISUAL (regla 1E de CLAUDE.md — cada una
   en su línea, con emoji y lo importante en negrilla):
   1️⃣ **Elige A, B o C** — la que más te guste tal como está.
   2️⃣ **Combina lo mejor** — "la B pero con la tipografía de la A".
   3️⃣ **Pídeme otras 3 distintas** — descarto estas y te traigo opciones nuevas.
   4️⃣ **Ajusta un detalle puntual** — un color, una fuente, un espacio.
4. Si COMBINA → se re-renderiza la combinación en la página comparativa y se CONFIRMA con
   un nuevo screenshot antes de cerrar. Si pide OTRAS 3 → nuevas 3 SIN repetir las
   anteriores (las descartadas se anotan en la ficha para no re-proponerlas).
5. La opción elegida (o la combinación confirmada) pasa por EL TOUR DE LA APP (sección final
   de este archivo): el usuario ve la app POR DENTRO con ese estilo y confirma (o ajusta).
   Con el tour aprobado, se vuelca en FICHA-ARTE.md (campo
   "Protocolo A/B/C", incluida la ruta de la página comparativa) + ESTADO.md; el archivo
   `direcciones-abc.html` + `vista-previa-app.html` + sus screenshots se archivan en
   `docs/revisiones/` del repo,
   INCLUIDAS las opciones descartadas (evidencia de decisión — NOTA DE VEHÍCULO arriba);
   la ruta /dev/direcciones sí se elimina antes del deploy. Desde ahí la dirección es COSA
   JUZGADA (16): no se renegocia pantalla a pantalla.
```

Formato del reporte al usuario (en simple — esta elección es de las POCAS preguntas legítimas al usuario: es gusto/identidad, lo que la IA NO puede saber por él — ver "PREGUNTAR vs DECIDIR" / DECIDE-INFORMA-AVANZA en CLAUDE.md; la IA decide todo lo demás, pero el ESTILO lo elige el dueño entre opciones concretas renderizadas):

```
🎨 Preparé 3 estilos para tu app, aplicados a tu pantalla principal real.
   Ábrelo aquí: [ruta de direcciones-abc.html / URL de /dev/direcciones] — [screenshot de
   la página comparativa]

   **Opción A — [nombre]** — [qué la define + de qué fusión de líderes viene]
   **Opción B — [nombre]** — [...]
   **Opción C — [nombre]** — [...]

   ¿Cómo seguimos?
   1️⃣ **Elige A, B o C** — la que más te guste tal como está.
   2️⃣ **Combina lo mejor** — "la B pero con la tipografía de la A".
   3️⃣ **Pídeme otras 3 distintas** — descarto estas y te traigo opciones nuevas.
   4️⃣ **Ajusta un detalle puntual** — un color, una fuente, un espacio.
```

**Costo/beneficio:** las 3 variantes comparten los datos semilla y el frame comparativo, pero cada una tiene su PROPIA composición y tipografía (REGLA DURA #2 — compartir el mismo TSX cambiando solo `globals.css` produce exactamente el fracaso que este protocolo prohíbe: 1 pantalla con 3 acentos). El protocolo cuesta ~2-3 horas de agente y elimina el riesgo #1 de identidad: descubrir en la semana 3 que al usuario nunca le gustó la dirección.

---

## EL TOUR DE LA APP (el cierre del protocolo — ver la app POR DENTRO antes de fijar la ficha)

> **Por qué existe:** elegir un estilo mirando UNA pantalla es aprobar una promesa; verlo aplicado
> a la app entera es aprobar una realidad. El tour convierte la elección en una confirmación con
> los ojos — y captura los "mmm, esto no me convence" AHORA, cuando ajustar cuesta minutos, no en
> la semana 3, cuando cuesta rehacer pantallas construidas.

Cuando el usuario ELIGIÓ su opción del A/B/C (o la combinación quedó confirmada, o APROBÓ la
réplica fiel), la ficha NO se cierra todavía. Antes se construye **`vista-previa-app.html`**: un
tour de la app por dentro con el estilo elegido aplicado a sus vistas clave.

```
CÓMO SE CONSTRUYE (barato por diseño — nace de lo YA tematizado):

1. NO se escribe desde cero (misma Regla Dura #0): se parte del direcciones-abc.html (o
   replica-fiel.html) YA tematizado — se conserva SOLO la opción elegida (con la combinación
   aplicada si la hubo), se DUPLICA el frame del teléfono y cada copia recibe una vista nueva.
   El marcador data-kit="abc-v2" se conserva; el hook lo verifica.
2. LAS VISTAS DEL TOUR (4-5 frames, todos con el MISMO sistema — tokens, fuentes, radios,
   materiales del estilo elegido — y datos semilla del dominio real):
   · La pantalla PRINCIPAL / el ritual diario (M0) — la más vista de la app.
   · UNA pantalla del onboarding (una pregunta del quiz, con sus opciones).
   · El PAYWALL (planes con el anual recomendado — layout del 50, aunque el copy sea semilla).
   · 1-2 vistas del MECANISMO en acción (el resultado/progreso que la app promete).
   Cada frame lleva su rótulo ("Tu pantalla de cada día", "Así te pregunta al empezar",
   "Aquí eliges tu plan"…) en lenguaje del usuario, sin jerga.
3. LOS MISMOS GATES de la comparativa: fuentes verificadas clase por clase (fallback-trampa),
   CERO emojis como íconos (chips SVG), mockups LLENOS con tab bar, materiales premium
   presentes. Screenshot de la página VERIFICADO por el agente ANTES de presentarla.
4. PRESENTAR con la pregunta 1E, TEXTUAL:

   👀 Así se vería tu app POR DENTRO con el estilo que elegiste.
   Ábrelo aquí: [ruta de vista-previa-app.html] — [screenshot]

   1️⃣ **Me encanta — sigamos con este estilo** — lo dejo fijado y toda la app se construye así.
   2️⃣ **Ajusta un detalle** — dime qué cambiarías (un color, una fuente, un espacio, una vista).
   3️⃣ **Prefiero repensar el estilo** — volvemos a las opciones, o a otra captura tuya.

   Responde 1, 2 o 3.

5. LAS SALIDAS: (1) → FICHA-ARTE.md se llena con el estilo confirmado y desde ahí es COSA
   JUZGADA; el tour + su screenshot se archivan en docs/revisiones/ como evidencia de la
   aprobación. (2) → se ajusta, se RE-RENDERIZA el tour y se re-pregunta (mismo archivo,
   nueva captura). (3) → se vuelve al protocolo (otras 3 / otra captura) SIN resentimiento:
   descubrirlo aquí es exactamente para lo que existe el tour.
```

⚠️ **El tour NO es la app:** es mockup HTML del kit (rápido, pre-código). Las pantallas REALES se
construyen después en React con el mismo sistema — y cada una pasa su propio cierre (Regla 7).
El tour fija la DIRECCIÓN con el usuario; no sustituye el revisor ni el checklist de ninguna
pantalla real.
