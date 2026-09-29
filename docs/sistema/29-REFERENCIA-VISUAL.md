# REFERENCIA VISUAL — Paletas y Tipografías por Nicho (lookup rápido)

> **Cuándo cargar este archivo:**
> - Al definir la dirección de arte (junto con `16-DIRECCION-DE-ARTE.md` y `10-DESIGN-TOKENS.md`)
> - Cuando necesitas un punto de partida de paleta/tipografía coherente con el nicho, sin inventar desde cero
>
> **Qué es:** una tabla de consulta de paletas y pares tipográficos **curados y no genéricos**, por nicho de producto. No reemplaza el criterio del archivo 16 (dirección de arte) — lo acelera. Para una base de datos exhaustiva (161 paletas, 73 pares), instalar la skill **ui-ux-pro-max** (ver `23-SKILLS-COMUNIDAD.md`); este archivo es el subconjunto que funciona aunque no instales nada.

---

## CÓMO USAR ESTE ARCHIVO

> **⚠️ 0. SI EL USUARIO DIO UNA REFERENCIA VISUAL, ESTAS TABLAS NO APLICAN.** La referencia del
> usuario es un contrato: se extrae con la TABLA DE EXTRACCIÓN del protocolo REFERENCIA=CONTRATO
> (`16-DIRECCION-DE-ARTE.md`, inicio) y de ahí salen paleta y tipografía. Este archivo es solo
> para cuando NO hay referencia-mandato.

1. Buscar el nicho más cercano al de la app.
2. Tomar la paleta del líder **ÍNTEGRA, sin desafinar** (ver el cambio de doctrina de abajo) y aplicarla con la lógica del archivo 16 (modo derivado con profundidad, acento audaz SOLO en acción/dato clave, regla 60-30-10). Extraer además los **7 MATERIALES** (sombras, degradés, bordes, botón, íconos, fondo, dato héroe): sin ellos la pantalla sale plana aunque el color sea correcto.
3. Mapear los valores a los tokens CSS del archivo 10 (`--bg`, `--surface`, `--text`, `--accent`...).
4. Elegir la fila del nicho en **COMBINACIONES TIPOGRÁFICAS PROBADAS** (abajo — el método principal), confirmarla contra la TABLA DE LÍDERES del `16` (PASO 0.2bis) y cargarla con `@import` / `next/font`.
5. **Auditar al final** (archivo 14): contar colores reales en la app y recortar los que se colaron.

> La tabla principal está expresada en **dark** (andamiaje técnico, NO recomendación estética — el modo se DERIVA en el 16); hay tabla espejo en MODO CLARO más abajo. El acento es el color de marca — máximo 1 (2 si hay razón funcional).

---

## PALETAS POR NICHO (valores hex de PARTIDA — validar contra los ganadores del nicho)

> ⚠️ **CAMBIO DE DOCTRINA (ago-2026) — LA PALETA DEL LÍDER SE TOMA TAL CUAL, NO SE PERTURBA.**
>
> Hasta ahora esta regla obligaba a mover el hue ±10-25° "para que dos apps del SO no salieran
> iguales". **Se elimina, porque hacía justo lo contrario de lo que buscaba.**
>
> Una paleta de una app líder no es una lista de colores: es un **sistema de relaciones** — cada
> color fue elegido CONTRA los otros, con sus contrastes medidos y su pareja tipográfica pensada.
> Rotar un hue 20° rompe esas relaciones y produce una versión *ligeramente desafinada* de algo que
> funcionaba. Eso, multiplicado por cada decisión, **es exactamente el aspecto "hecho con IA"**: nada
> está mal del todo, pero nada está bien del todo.
>
> **La regla nueva:**
> ```
> La paleta y la tipografía del líder de tu nicho se toman ÍNTEGRAS y sin desafinar.
> La diferenciación NO sale de retocar sus colores — sale de:
>   · QUÉ líder eliges (divergencia por construcción: el propio, el vecino, el modo contrario)
>   · la COMPOSICIÓN de tus pantallas
>   · tu DISPOSITIVO OWNABLE
>   · tu COPY y tu producto
> ```
>
> **Por qué esto no es copiar:** un lenguaje visual —una familia de color, un par tipográfico, una
> receta de sombras— no es propiedad de nadie; es vocabulario de la disciplina. Lo que sí está
> prohibido y no se toca nunca: **el nombre, el logo, el isotipo, las ilustraciones propias, el copy
> y las pantallas literales** de la app de referencia. Se toma el IDIOMA, no el discurso.
>
> Excepción intacta: si hay referencia del usuario, manda la referencia (regla 0 de arriba).

> **El modo se DERIVA (PASO 0 del 16); estas tablas dan puntos de partida en AMBOS modos — no asumas dark.** Primero corre el PASO 0.2bis (TABLA DE LÍDERES — lo que ya funciona) y la Regla 2 del 16 ("el modo se deriva, no se asume oscuro"); recién entonces toma la tabla del modo que salió del razonamiento. Hay tabla DARK (abajo) y tabla espejo en MODO CLARO (más abajo) para los nichos que suelen ganar en claro.

> ⚠️ Estas paletas son **dark-first como atajo**, NO como veredicto. Antes de adoptar una: (1) llena la TABLA DE LÍDERES del nicho exacto (Mobbin/App Store — `16` PASO 0.2bis, obligatorio) y aplica su lógica de color real: la familia cromática ES la del líder con mejor color, tomada íntegra — no una inventada ni desafinada; (2) muchos géneros GANAN en CLARO o multicolor (hábitos, kids, bienestar, social) — no defaultees a oscuro+1 acento; (3) la paleta debe servir al trabajo emocional del nicho (hábitos = positivo, victoria visible, verde=hecho; no marrón sombrío). Ver `16` PASO 0.5 → "valida contra los ganadores del nicho".

| Nicho | Fondo base | Superficie/Card | Texto primario | Texto secundario | Borde | Acento (marca) | Nota de carácter |
|---|---|---|---|---|---|---|---|
| Fitness / entrenamiento | `#0B0F0E` | `#141A18` | `#ECF2EF` | `#8A9A94` | `#222C29` | `#00E08A` (verde energía) | Verde vibrante = movimiento/salud, no el azul de todos |
| Nutrición / comida | `#120E0A` | `#1C1610` | `#F4EDE4` | `#A8978A` | `#2E251C` | `#FF7A1A` (naranja apetito) | Cálido, terroso; el naranja abre el apetito |
| Finanzas personales | `#0A0C12` | `#12151E` | `#E9ECF5` | `#8088A0` | `#1E2330` | `#3DDC84` (verde dinero) | Sobrio + verde solo en saldos/ganancias |
| Cripto / Web3 | `#0B0A14` | `#15131F` | `#ECEAF7` | `#8B86A8` | `#221F30` | `#7C5CFF` → `#3DD9EB` (gradiente) | Gradiente violeta→cian estilo Phantom |
| Meditación / bienestar | `#0E1014` | `#171A20` | `#E8EBF0` | `#8E96A4` | `#23272F` | `#9FB8AD` (salvia calma) | Acento desaturado, casi pastel; serenidad |
| Productividad | `#0A0A0B` | `#141416` | `#E8E8EA` | `#8A8A90` | `#222226` | `#5B8DEF` (azul foco) | Neutro casi-negro con tinte + un azul preciso |
| Educación / idiomas | `#0F0D16` | `#1A1622` | `#EFEAF5` | `#998FA8` | `#282232` | `#FFC23D` (amarillo juego) | Juguetón pero no infantil; amarillo + violeta |
| Salud / médica | `#0A0F12` | `#12181C` | `#E8EFF2` | `#84969E` | `#1E282D` | `#2BB6C4` (cian clínico) | Limpio, confiable; cian sobrio, nada estridente |
| Social / creador | `#0C0A0F` | `#161320` | `#F0ECF5` | `#998FA8` | `#241E30` | `#FF3D7F` (magenta) | Magenta audaz = expresión, energía social |
| SaaS B2B | `#0B0D10` | `#13161B` | `#E7EAEF` | `#828A96` | `#1F242B` | `#6366F1` (índigo pro) | Índigo serio; restricción cromática estricta |
| Citas / relaciones | `#120A0E` | `#1E1118` | `#F5E9EF` | `#B08A9C` | `#2E1C26` | `#FF4D6D` (rosa coral) | Cálido, íntimo; rosa coral no rojo agresivo |
| Journaling / diario | `#100E0C` | `#1A1714` | `#F0EAE2` | `#A0958A` | `#2A2520` | `#C8853D` (ámbar papel) | Editorial, cálido; sensación de cuaderno |
| Herramienta de IA | `#09090B` | `#131316` | `#EDEDF0` | `#86868E` | `#202024` | `#A78BFA` (lila IA) | Lila/violeta sutil; minimal y técnico |
| Kids / familiar | `#0D1117` | `#172033` | `#EAF0FA` | `#8FA0BC` | `#243049` | `#FFB020` + `#4FC3F7` | Dos acentos cálidos, alto contraste, amable |
| Productos / e-commerce | `#0B0B0D` | `#151518` | `#ECECEF` | `#8A8A92` | `#222226` | `#E8454E` (rojo deseo) | Neutro + rojo solo en CTA de compra/precio |

> **Recordatorio del archivo 16:** el error genérico no es la fealdad, es la **cobardía** (azul seguro + gris neutro + gradiente morado por default). Estas paletas eligen un acento con intención; aplicarlo con disciplina (10% de la superficie, no regado).

---

## PALETAS POR NICHO — MODO CLARO (tabla espejo para los nichos que suelen ganar en claro)

> Según el 16 (Regla 2: "el modo se DERIVA"), estos nichos suelen ganar en **CLARO**: el claro comunica día, papel, victoria visible y confianza — y hoy es MÁS distintivo porque casi toda app de IA defaultea a oscuro. Reglas duras de estas paletas claras:
> - **Casi-blancos CÁLIDOS con tinte, NUNCA `#FFFFFF` puro** (el blanco puro es la bandera del default, y en LATAM puede leerse hospital/luto — ver "Matiz cultural" del 16).
> - **Profundidad por SOMBRAS SUAVES, no por bordes duros**: en claro, las superficies se elevan con `box-shadow: 0 1px 3px rgba(30,25,20,0.06), 0 4px 12px rgba(30,25,20,0.05)`, no con `border: 1px solid` gris. El borde queda como refuerzo sutil opcional (≤6% de opacidad del texto).
> - Los acentos van 1-2 pasos MÁS OSCUROS/saturados que su versión dark para cumplir AA sobre fondo claro (verifica ≥4.5:1 texto, ≥3:1 UI).

| Nicho | Fondo base | Superficie/Card | Texto primario | Texto secundario | Acento (marca) | Nota de carácter | Cuándo elegir claro vs oscuro |
|---|---|---|---|---|---|---|---|
| Hábitos / bienestar | `#FAF6EF` (crema cálida) | `#FFFDF8` | `#28221B` | `#8C8172` | `#2E9E6B` (verde victoria) + `#F0A05A` hito | Positivo, diurno, "victoria visible": verde=hecho sobre papel cálido, no marrón sombrío | Claro si el ritual es de día y celebra progreso (lo usual); oscuro solo si es ritual nocturno (sueño, meditación de noche) |
| Educación / idiomas | `#FBF7EE` | `#FFFDF6` | `#2A2433` | `#8A8194` | `#6A4DE8` (violeta) + `#E8A014` (ámbar juego) | Juego respetuoso sobre "cuaderno" cálido; el ámbar celebra, el violeta guía | Claro para sesiones de estudio largas (legibilidad, menos fatiga); oscuro solo si la audiencia es juvenil-gamer y estudia de noche |
| Kids / familiar | `#FDF8EC` | `#FFFEF7` | `#33291C` | `#9A8C74` | `#F28C1B` (naranja) + `#2FA8D8` (cian) | Mundo diurno de juguetes y papel; alto contraste amable, formas redondas, ícono+forma (daltonismo) | Claro casi SIEMPRE gana en kids (su mundo es diurno y colorido); oscuro casi nunca — solo modo "cuento antes de dormir" |
| Social / creador | `#FBF5F1` | `#FFFDFB` | `#2B2126` | `#9A8890` | `#E82D6F` (magenta) | El contenido manda: lienzo cálido neutro y el magenta SOLO en acción/expresión | Claro si domina foto/contenido de día (el lienzo claro resalta el contenido); oscuro si es video/media inmersivo de consumo nocturno |
| Salud / médica | `#F8F9F6` (casi-blanco verdoso suave) | `#FDFEFB` | `#1E2B2F` | `#71838A` | `#178FA0` (cian clínico profundo) | Limpio y confiable SIN blanco-hospital puro: el tinte verdoso calienta la lectura clínica | Claro para lectura de datos médicos y confianza diurna (el estándar del sector); oscuro para monitoreo nocturno o pacientes crónicos que la usan de noche |
| Finanzas personales | `#F8F6F0` | `#FEFDF9` | `#1D222B` | `#79808F` | `#178A54` (verde dinero oscuro) | Control y claridad: verde solo en saldos/ganancias, resto sobrio; "estado de cuenta bien diseñado" | Claro para control de gastos y confianza cotidiana (los neobancos ganadores son claros); oscuro si es trading/inversión pro con dashboards densos |

> Mapear igual que las dark: fondo→`--bg`, superficie→`--surface`, textos→`--text`/secundario, acento→`--accent` (scaffold LIGHT completo en `10-DESIGN-TOKENS.md`). En claro, revisa DOBLE el contraste del acento sobre la superficie: un acento que brillaba en dark suele fallar AA en claro.

---

## MATRIZ AUDIENCIA × NICHO

> **El nicho NO basta.** La tabla de "Paletas por nicho" de arriba es el punto de partida; esta matriz muestra cómo la **audiencia dentro del mismo nicho** cambia toda la dirección de arte. "Fitness" no es un color: "fitness para mujeres 40+" y "fitness para hombres CrossFit" piden direcciones opuestas. Usar junto al **PASO 0** de `16-DIRECCION-DE-ARTE.md` (protocolo de derivación): esta matriz es el insumo, el PASO 0 es el razonamiento.
>
> Los hex de esta matriz están expresados sobre fondo oscuro y son de partida — afinar con `16`. **El modo se DERIVA (PASO 0 del 16), no se asume dark**: si el razonamiento pide claro, traducir la fila con la tabla de MODO CLARO de arriba (mismo hue del acento, 1-2 pasos más oscuro para AA, casi-blanco cálido de fondo). Temp = temperatura. Clase = clase tipográfica (razonar con PASO 0.6, bajar al catálogo de pares de este doc).

### Bienestar / mindfulness

| Audiencia | Paleta de partida (acento) | Temp | Clase tipográfica | Error genérico a evitar |
|---|---|---|---|---|
| Femenina, adulta, busca calma | `#E8A07A` durazno sobre `#14100E` | cálida | serif display o humanista | el rosa pastel "femenino" infantil; no toda mujer quiere lavanda |
| Masculina, "recuperación/foco" | `#6FA8A0` teal apagado sobre `#0E1014` | fría-neutra | grotesca sobria | el cliché "wellness = flores y curvas"; aquí va más austero |
| Senior (60+), salud mental | `#9FB8AD` salvia sobre `#171A20`, texto +1 tamaño | neutra | sans humanista grande | tipografía fina y de bajo contraste: ilegible para este ojo |

### Fitness / entrenamiento

| Audiencia | Paleta de partida (acento) | Temp | Clase tipográfica | Error genérico a evitar |
|---|---|---|---|---|
| Masculina, joven, alta intensidad | `#C6FF3D` lima eléctrica sobre `#0B0F0E` | fría | grotesca audaz, pesos extremos | el verde "salud" suave; aquí pide agresividad y contraste |
| Femenina, 40+, "fuerza en casa" | `#E0795C` terracota sobre `#15110F` | cálida | humanista cálida | el neón gritón y el "no pain no gain"; pide permiso, no presión |
| Neutra, longevidad/movilidad | `#5BB6A0` verde-teal sobre `#0E1212` | neutra | sans geométrica limpia | la estética "gym bro"; aquí va clínico-amable, sostenible |

### Fintech / dinero

| Audiencia | Paleta de partida (acento) | Temp | Clase tipográfica | Error genérico a evitar |
|---|---|---|---|---|
| Mixta, "primera vez invirtiendo" | `#3DDC84` verde + `#FFC23D` hito sobre `#0A0C12` | fría con toque cálido | grotesca + humanista | el azul institucional "del banco de mis papás"; aleja al joven |
| Premium / patrimonio alto | dorado `#C9A227` sobre `#0B0B0D` | neutra-cálida | serif display | el verde "app de gastos"; este pide lujo sobrio, Gobernante |
| Femenina, control de gastos | `#7C9CF0` azul-lila suave sobre `#0A0C12` | fría suave | humanista cercana | el rojo "alerta/deuda" agresivo; aquí calma y control, no culpa |

### Productividad

| Audiencia | Paleta de partida (acento) | Temp | Clase tipográfica | Error genérico a evitar |
|---|---|---|---|---|
| Profesional, foco, B2B | `#5B8DEF` azul foco sobre `#0A0A0B` | fría | sans geométrica | el confeti y la mascota; este perfil quiere calma low-stimulus |
| Creativa, freelancer | `#FF7A5C` coral sobre `#100E12` | cálida | grotesca con actitud | el gris corporativo plano; aquí pide carácter y energía |
| Estudiante, hábitos | `#FFC23D` ámbar + verde racha sobre `#0F0D16` | cálida | humanista juguetona | la frialdad enterprise; este pide gamificación amable |

### Educación / idiomas

| Audiencia | Paleta de partida (acento) | Temp | Clase tipográfica | Error genérico a evitar |
|---|---|---|---|---|
| Adulta, profesional (upskilling) | `#5B8DEF` azul + serif para "serio" sobre `#0F0D16` | neutra | serif transicional + sans | el look Duolingo infantil; el adulto quiere sentirse respetado |
| Juvenil / gamificada | `#FFC23D` amarillo + `#A78BFA` violeta | cálida | grotesca juguetona | el azul académico aburrido; aquí pide juego y color |
| Niños (con tutor adulto) | ver fila "Niños" abajo | cálida | redonda amigable | texto pequeño; UI pensada solo para el adulto |

### Salud / médica

| Audiencia | Paleta de partida (acento) | Temp | Clase tipográfica | Error genérico a evitar |
|---|---|---|---|---|
| Paciente general, confianza | `#2BB6C4` cian clínico sobre `#0A0F12` | fría | sans humanista | el blanco hospital frío (en LATAM puede leerse luto/clínica) |
| Crónicos / adultos mayores | `#4FA8B8` cian + texto +1 tamaño, contraste alto | neutra | humanista grande, alto contraste | el bajo contraste "elegante": aquí accesibilidad manda |
| Salud femenina / ciclo | `#C98BA8` rosa-malva apagado sobre `#120E12` | cálida | humanista cálida | el rojo "alerta médica" y el morado luto; pide intimidad sobria |

### Niños / familia

| Audiencia | Paleta de partida (acento) | Temp | Clase tipográfica | Error genérico a evitar |
|---|---|---|---|---|
| Niños pequeños (3-7) | `#FFB020` ámbar + `#4FC3F7` cian, alto contraste | cálida | redonda muy amigable | colores estridentes puros que cansan; usar ícono+forma (daltonismo) |
| Pre-adolescentes (8-12) | `#7C5CFF` violeta + `#3DD9EB` cian | neutra | grotesca con personalidad | el look "bebé"; este perfil rechaza lo demasiado infantil |
| Padres (la app la maneja el adulto) | `#5BB6A0` verde calmo sobre `#0E1212` | neutra-cálida | sans humanista | tratar al padre como niño; el adulto quiere control claro y sobrio |

### Creadores / contenido

| Audiencia | Paleta de partida (acento) | Temp | Clase tipográfica | Error genérico a evitar |
|---|---|---|---|---|
| Creador joven, expresivo | `#FF3D7F` magenta sobre `#0C0A0F` | cálida | display expresiva (Unbounded) | el neutro tímido; este perfil premia lo audaz y la firma visual |
| Community manager / PRO | `#6366F1` índigo pro sobre `#0B0D10` | fría | grotesca sobria | el color sobrecargado; aquí pide herramienta seria, restricción |
| Marca / negocio LATAM | `#E8454E` rojo deseo o `#FFC23D` ámbar sobre `#0B0B0D` | cálida | grotesca + humanista | el frío SaaS gringo; LATAM responde a calidez y cercanía |

> **Lectura de la matriz:** en cada nicho, fíjate cómo el ACENTO, la TEMPERATURA y la CLASE tipográfica cambian fila por fila aunque el nicho sea el mismo. Si el agente eligió el color "del nicho" sin mirar la audiencia, está en la fila equivocada. Volver al PASO 0 de `16`.

---

## VERTICALES ESPECIALIZADOS (sectores que el catálogo base no cubre)

> **Qué es:** la tabla de "Paletas por nicho" cubre los nichos de consumo masivo. Esta cubre **sectores especializados** — muchos con requisitos regulatorios, de confianza o de accesibilidad que cambian las reglas. Cada fila trae patrón recomendado + color/mood + **anti-patrón con severidad**. Curados para **LATAM** (matiz cultural del archivo 16: blanco puede leer luto/hospital, morado luto, verde/dorado bien recibidos). Severidad del anti-patrón: 🔴 grave (rompe confianza/legalidad/accesibilidad), 🟡 medio (se ve genérico o aleja al usuario).

| Vertical | Patrón recomendado | Color / mood | Anti-patrón (severidad) |
|---|---|---|---|
| **Legal / abogados** | Sobriedad editorial, jerarquía clara, credenciales y casos VISIBLES arriba | navy `#0E1726` + oro `#C9A227` sobre oscuro; serif transicional | 🔴 ocultar credenciales/colegiatura; 🟡 stock de "martillo de juez" |
| **Gobierno / servicio público** | Alto contraste AAA, skip links, navegación por teclado, **cero motion** | neutros + 1 acento institucional sobrio (azul/verde), fondo claro OK | 🔴 motion decorativo, bajo contraste, depender de color para estado; 🟡 jerga |
| **Salud / clínica** | Limpio, confiable, cian/teal sobrio, datos legibles, mucho aire | `#2BB6C4` cian sobre `#0A0F12`; sans humanista | 🔴 blanco hospital frío (luto en LATAM), rojo "alarma" gratuito; 🟡 estridencia |
| **Ciberseguridad** | Threat viz (mapas, grafos, severidad por forma+color), dark serio, mono para datos | `#0B0F14` + `#3DD9EB` cian / `#FF4D4D` alerta con ícono; mono | 🔴 alerta solo por color rojo (daltonismo); 🟡 "hacker de capucha" cliché |
| **Fintech B2B / enterprise** | Restricción cromática estricta, índigo serio, tablas densas legibles | `#6366F1` índigo sobre `#0B0D10`; grotesca sobria | 🔴 confeti/gamificación (este perfil quiere control); 🟡 color sobrecargado |
| **Energía / clima** | Datos de impacto reales, transparencia, verde con SUSTANCIA (cifras, no hojas) | verde-teal `#2FAE8E` + tierra sobre oscuro; sans geométrica | 🔴 **greenwashing** (verde+hojas sin datos verificables); 🟡 stock de paneles solares |
| **Educación** | Jerarquía de progreso clara, gamificación amable (no infantil para adultos) | ámbar `#FFC23D` + violeta `#A78BFA`; humanista juguetona / serif para adultos | 🔴 look Duolingo infantil con audiencia adulta; 🟡 azul académico aburrido |
| **Logística / delivery** | Estado en tiempo real, mapas, tracking claro, tipografía robusta para escaneo rápido | naranja `#FF7A1A` energía + neutros; grotesca legible | 🔴 estado de pedido solo por color; 🟡 mapa genérico sin jerarquía |
| **Agritech** | Orgánico/biophilic, tierra + verde real, datos de campo legibles a pleno sol | tierra `#7A5C3D` + verde `#5BB6A0`; sans humanista robusta | 🔴 bajo contraste (se usa en exteriores); 🟡 estética "silicon valley" desconectada del campo |
| **Music / streaming** | Contenido protagonista, oscuro inmersivo, acento vibrante, motion fluido | `#0A0A0B` + acento saturado (magenta/lima); display expresiva | 🟡 copiar literal a Spotify (verde); 🟡 cards idénticas sin jerarquía |
| **Inmobiliaria** | Fotografía héroe, filtros claros, confianza, datos de propiedad escaneables | neutros cálidos + `#C9A227` oro o teal sobrio; serif + sans | 🔴 ocultar precio/ubicación tras formulario; 🟡 stock de "casa genérica" |
| **Seguros** | Claridad radical (el rubro es confuso), confianza, sin letra chica oculta | azul/verde calmo, alto contraste; humanista cercana | 🔴 esconder coberturas/exclusiones; 🟡 rojo "alerta" que genera ansiedad |
| **RRHH / talento** | Cálido-profesional, personas reales, flujos claros (candidato + reclutador) | teal/verde calmo + cálido; sans humanista | 🟡 stock de "apretón de manos corporativo"; 🟡 frío enterprise que aleja al candidato |

> **Lectura LATAM:** en sectores de confianza (legal, salud, seguros, fintech B2B) la señal de **pertenencia y transparencia** vale más que la diferenciación cromática — converger en la categoría y ganar en craft (regla PASO 0.2 del archivo 16). Los 🔴 son no-negociables: rompen confianza, legalidad o accesibilidad.

---

## 🔴 EXTRAER EL CRAFT, NO SOLO EL COLOR (por qué sale plano con la paleta correcta)

> **El diagnóstico, tras varias pruebas reales:** las propuestas visuales salían "genéricas" y
> "básicas" **aunque la paleta y la tipografía fueran las correctas**. La causa: de una app líder se
> estaba extrayendo únicamente el COLOR (una lista de hex) y el par tipográfico. Pero lo que hace que
> una interfaz se vea premium **no es el hue** — es el MATERIAL: cómo están hechas las superficies,
> las sombras, los bordes, los íconos y el botón principal.
>
> Una paleta perfecta aplicada como rellenos planos con un borde gris **siempre se verá básica**.

### Lo que hay que extraer del líder, además del color (los 7 materiales)

Al llenar la TABLA DE LÍDERES del `16` (PASO 0.2bis), mirando capturas reales, anotar:

```
1. SUPERFICIE — ¿las cards son un relleno plano o tienen material?
   Premium casi siempre = relleno base + degradé sutilísimo encima + luz en el borde superior
   background: linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,0)) , var(--surface);
   box-shadow: inset 0 1px 0 rgba(255,255,255,.09);

2. SOMBRA — ¿una sombra o VARIAS capas?
   Plano = una sombra genérica.  Premium = 2-3 capas: una pegada y dura + una lejana y difusa.
   box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.10);

3. BORDE — ¿hairline translúcido, degradado, o ninguno?
   Un `1px solid #ddd` es la firma del template. Premium = 1px a baja opacidad del color del texto,
   o borde con degradé (padding-box/border-box), o NINGUNO resuelto todo con sombra.

4. EL BOTÓN PRINCIPAL — casi nunca es un rectángulo de color plano:
   relleno con degradé TONAL (mismo hue, 2 luminancias) + luz interior arriba +
   sombra TINTADA del propio color del botón (no negra).
   background: linear-gradient(180deg, var(--acento-claro), var(--acento-oscuro));
   box-shadow: 0 2px 8px color-mix(in oklab, var(--acento) 35%, transparent),
               inset 0 1px 0 rgba(255,255,255,.25);

5. ÍCONOS — ¿pelados o en contenedor?
   Premium = SIEMPRE dentro de un chip (círculo o squircle de 36-48px) con fondo del acento al
   8-14%. Mismo peso, mismo tamaño, misma familia en toda la app. Nunca un ícono suelto flotando.

6. FONDO — ¿un color plano o tiene profundidad?
   Premium = mesh/radial muy sutil detrás del héroe, o grano a 2-4% de opacidad, o ambas.
   Un fondo de un solo fill plano es el default del template.

7. EL DATO HÉROE — ¿el número recibe trato especial?
   Premium = cifras tabulares, tamaño display, tracking apretado, a veces otra familia (mono).
   Si el número principal se ve igual que el texto de al lado, no hay jerarquía de dato.
```

### La regla

```
Se toman los 7 materiales del líder TAL CUAL, igual que la paleta.
Si de una referencia solo sacaste colores y fuentes, NO la extrajiste: la miraste.
```

⚠️ **Comprobación rápida antes de dar por buena cualquier pantalla o mockup:** si al describirla solo
puedes hablar de colores y tamaños —y no de sombras, degradés, bordes o el tratamiento de los
íconos— es que está plana. Cada uno de los 7 puntos de arriba debe poder señalarse en la pantalla.

> Esto operacionaliza el ANTI-PLANO del `32` y la capa anti-IA del `16`: aquellos dicen QUÉ evitar;
> esta sección dice EXACTAMENTE QUÉ COPIAR del líder para no caer ahí.

---

## ESTILOS-FIRMA POR REFERENCIA REAL (DNA + CSS + fidelidad sin imágenes)

> **Qué es:** para los estilos nombrados del anexo del archivo 16, su **DNA visual**, una **implementación CSS concreta** de partida, el **% de fidelidad alcanzable SIN generar imágenes**, y su **temperatura**. Honesto sobre el límite: algunos estilos (partículas, 3D real, acuarela, cromados) NO se logran 100% en HTML/CSS y exigen imagen IA — marcado abajo para que el agente decida antes de prometer.

| Estilo | DNA visual | CSS clave (partida) | % sin imagen | Temp |
|---|---|---|---|---|
| **Swiss / Vercel** | aire, grotesca perfecta, negro/blanco, grid riguroso | `letter-spacing:-.03em; line-height:1; max-width:65ch; gap basado en 8px` | **100%** | neutro-silencioso |
| **Neo-Brutalism** | borde negro grueso, sombra dura sin blur, color plano | `border:3px solid #000; box-shadow:6px 6px 0 #000; border-radius:0` | **100%** | muy audaz |
| **Bento / Linear** | grid de cards de distinto tamaño, redondez generosa | `display:grid; grid-template:auto/repeat(4,1fr); gap:16px; border-radius:20px; border:1px solid rgba(255,255,255,.08)` | **100%** | neutro |
| **Aurora UI** | mesh de luz difusa, glow de color, profundidad sin objetos | `background:radial-gradient(60% 60% at 20% 10%,#7C5CFF55,transparent),radial-gradient(50% 50% at 90% 80%,#3DD9EB44,transparent); filter:blur(0)` | **100%** | audaz |
| **Glassmorphism** | vidrio translúcido con blur, sobre fondo colorido | `background:rgba(255,255,255,.06); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,.12)` | **100%** | neutro |
| **Memphis** | geometría caótica, patrones, color chillón | SVG `<pattern>` + `background-image` de zig-zags/círculos; sin imagen rasterizada | **100%** | muy audaz |
| **Liquid Glass** | refracción real, distorsión del fondo, capas de vidrio | blur+borde se logran en CSS; la **refracción/distorsión real** necesita SVG `feDisplacementMap` o imagen | **~80%** | audaz |
| **Claymorphism** | formas 3D "plastilina", infladas, sombras dobles | sombras dobles e `inset` aproximan; el **volumen 3D real** pide render/imagen | **~70%** | audaz-amable |
| **Organic / Biophilic** | blobs, curvas naturales, asimetría | `border-radius:42% 58% 63% 37%/...` + SVG blobs; **fotografía natural** sí pide imagen | **~85%** | neutro-cálido |
| **Retro-Futurism / Y2K** | neón, cromado líquido, grids sintéticos, brillos | grids y neón en CSS (`text-shadow`/gradients); **cromados y texturas líquidas** piden imagen | **~60%** | muy audaz |
| **Partículas / 3D / acuarela** | partículas animadas, geometría 3D, lavados de acuarela | — fuera del alcance CSS práctico: requieren **canvas/WebGL/Three.js o imagen IA** | **imagen/JS** | varía |

> **Regla de honestidad:** antes de prometer un estilo, mirar su `% sin imagen`. Si el proyecto no puede generar/pagar assets, elegir un estilo **100% CSS** (Swiss, Neo-Brutalism, Bento, Aurora, Glassmorphism, Memphis) y lograr la firma ahí. No vender "liquid glass con refracción" si solo se va a entregar un blur — eso es prometer audacia y entregar el default.

---

## COMBINACIONES TIPOGRÁFICAS PROBADAS (basadas en las apps más grandes) — EL MÉTODO PRINCIPAL

> **Doctrina (cambio tras prueba real, jul-2026):** el SO combinó para una app de hábitos DOS
> serifs (display serif + body serif) — una combinación que ninguna app grande usa. La elección
> "libre" de candidatas queda REEMPLAZADA como método principal por esta sección: el par base
> se elige de combinaciones que las apps líderes YA usan, y se confirma contra la TABLA DE
> LÍDERES del `16` (PASO 0.2bis). Inventar combinaciones tipográficas está PROHIBIDO.

**REGLAS DURAS DE COMBINACIÓN (las que la prueba real violó):**

```
(a) EL PATRÓN #1 DE LAS APPS GRANDES ES UNA SOLA FAMILIA SANS EN 2-3 PESOS
    (Duolingo, Revolut, Spotify, Linear). Es el default MÁS SEGURO: la jerarquía la hacen
    tamaño y peso, no una segunda fuente. Ante la duda, una familia.
(b) SI HAY 2 FAMILIAS: display con carácter + body sans NEUTRA. NUNCA serif+serif.
    NUNCA dos fuentes de personalidad fuerte juntas (dos displays compiten, no jerarquizan).
(c) SERIF DISPLAY SOLO en editorial / lifestyle / lujo — y SIEMPRE con body sans.
    Una app de hábitos gamificada con serif display está en la fila equivocada.
(d) MÁXIMO 2 FAMILIAS, SIEMPRE (la mono para cifras cuenta como tratamiento, no familia de marca).
```

**TABLA DE COMBINACIONES PROBADAS POR NICHO** (referente real → equivalente gratis verificado):

| Nicho | Patrón del líder (referente real) | Display → equivalente | Body | Fuente |
|---|---|---|---|---|
| Hábitos / gamificada | redondeada friendly, UNA familia (Duolingo) | **Nunito** o **Baloo 2** (o Quicksand) | misma familia, pesos 400/700/800 | Google Fonts |
| Bienestar / meditación | geométrica cálida, UNA familia (Headspace, Calm) | **DM Sans** o **Sora** | misma familia | Google Fonts |
| Fitness / nutrición | sans sólida + bold en números (Cal AI, Strava) | **Figtree** o **Instrument Sans** | misma familia (700/800 para cifras héroe) | Google Fonts |
| Finanzas | grotesk segura (Revolut, Nubank) | **Archivo** o **Schibsted Grotesk** | misma familia o **Instrument Sans** | Google Fonts |
| Productividad / B2B | sans neutra precisa (Linear, Notion) | **Geist** — si la consideras quemada: **General Sans** o **Switzer** | misma familia | Google Fonts / Fontshare |
| Editorial / contenido | serif display + body sans (NYT, Medium) | **Fraunces** o **Newsreader** | **Source Sans 3** o **Instrument Sans** | Google Fonts |
| Lujo / estética | serif elegante + body sans light (Playfair ya sobreusada) | **Gloock** o **Marcellus** | sans light (Figtree 300/400) | Google Fonts |
| IA creativa | grotesk expresiva SOLO display (Bricolage/Unbounded) | **Bricolage Grotesque** o **Unbounded** (SOLO display, pesos contenidos) | body sans neutra (Instrument Sans, Onest) | Google Fonts |
| Infantil / educación | redondeada, UNA familia | **Baloo 2** o **Fredoka** | misma familia | Google Fonts |
| Social / lifestyle | sans geométrica friendly (Airbnb Cereal ≈ Poppins) | **Poppins** — válida AQUÍ si el líder la usa: la regla anti-quemada CEDE ante la regla de lo probado | misma familia | Google Fonts |

> Sobre Poppins (y toda fuente "quemada" que un líder use): el riesgo real no es que exista en
> otras apps del mundo — es repetirla ENTRE proyectos del SO. Eso lo evita el REGISTRO
> ANTI-REPETICIÓN (abajo), no la caza de frescura.

**REGLA DE SELECCIÓN:** elige la fila de tu nicho → **confirma contra tu TABLA DE LÍDERES del
`16` (PASO 0.2bis)** → si tus líderes usan otra cosa, **MANDA lo que usan tus líderes** (con su
equivalente gratis). La fila es el fallback cuando la tabla de líderes no resolvió tipografía.

### DEGRADÉS QUE USAN LAS GRANDES (los únicos permitidos)

```
(a) TONAL: mismo hue, luminancia distinta (Calm: azul profundo → azul medio).
    El más seguro; da profundidad sin cambiar de color.
(b) ANÁLOGO CORTO: hues VECINOS, ≤40° de separación (Headspace: naranja → coral).
    (Instagram es la excepción multi-hue de una marca histórica — no imitarla.)
(c) NUNCA complementarios ni saltos raros: verde-salvia → durazno = el error de la prueba
    real. Si los dos extremos no son vecinos en la rueda, no es un degradé premium — es ruido.
USO: sutil de fondo, o contenido en el botón/CTA. JAMÁS en texto largo. Y como todo: si
ninguna app grande usa un degradé parecido, no lo uses (regla anti-invento del 16).
```

---

## PARES TIPOGRÁFICOS POR MOOD (catálogo secundario — el par base sale de las COMBINACIONES PROBADAS)

Display = titulares/héroe; Body = texto corrido. Todas gratis (Google Fonts o Fontshare). **Máximo 2 familias por app.**

> ⚠️ **REGLA (armonizada jul-2026):** el par BASE de la app sale de las **COMBINACIONES
> TIPOGRÁFICAS PROBADAS** (arriba), confirmado contra la TABLA DE LÍDERES del `16`. Esta tabla
> de moods y la LISTA FRESCA quedan para el **DETALLE PROPIO opcional** (p.ej. la display de la
> landing, un titular de celebración) y como pool del REGISTRO ANTI-REPETICIÓN cuando la fila
> probada del nicho ya se usó en el proyecto anterior — siempre respetando las reglas duras
> (a)-(d) de arriba: nunca serif+serif, nunca dos personalidades fuertes.

| Mood / nicho | Display | Body | Cómo cargar |
|---|---|---|---|
| Tech / startup | Sora | Inter Tight | Google Fonts |
| Audaz / fintech | Clash Display | Satoshi | Fontshare (`api.fontshare.com`) |
| Editorial / lujo | Fraunces | Hanken Grotesk | Google Fonts |
| Cálido / bienestar | Sentient | Switzer | Fontshare |
| Geométrico / SaaS | Cabinet Grotesk | General Sans | Fontshare |
| Juguetón / educación | Bricolage Grotesque | Schibsted Grotesk | Google Fonts |
| Expresivo / creador | Unbounded | Gabarito | Google Fonts |
| Minimal / IA | Author | Inter Tight | Fontshare / Google |
| Serif contemporáneo | Instrument Serif | **General Sans** (evitar Geist como body: sobreusada — ver NOTA SOBRE FUENTES SOBREUSADAS) | Google / Fontshare |
| Productividad / herramienta | Mona Sans | Hubot Sans | GitHub (open-source, variable) |
| Creativo / IA (code-aesthetic) | PP Neue Machina* / display | Geist Mono o DM Mono | Pago* / Google |

> **Frescos por nicho (investigación 2026, aún poco quemados):** bienestar → **Fraunces** (ejes SOFT/WONK/opsz, calidez que ninguna geométrica tiene) + **Hanken Grotesk** body · productividad → **Mona Sans + Hubot Sans** (familia industrial de GitHub, gratis, con un display "robótico") · finanzas con personalidad → serif de alto contraste (**Gambetta**, **Boska** de Fontshare) sobre **Manrope**/**General Sans** para datos densos · IA/creativo → alto contraste **display + monospace** (Geist Mono, DM Mono, JetBrains Mono) — el "code aesthetic" que evita el morado genérico. Regla: elegir por nicho + mundo del sujeto, nunca la primera fila que suene bien.

### LISTA FRESCA (el pool para el DETALLE PROPIO opcional — todas reales, gratis)

```
DISPLAYS SERIF (editorial, lujo, calidez):
  Google Fonts → Instrument Serif · Gloock · DM Serif Display · Abril Fatface · Newsreader ·
                 Crimson Pro · Bitter · Lora (en itálica como display) · Fraunces
  Fontshare    → Gambetta · Erode · Boska · Zodiak · Sentient · Melodrama

DISPLAYS SANS / GROTESCAS (audaz, técnico, contemporáneo):
  Google Fonts → Bricolage Grotesque · Familjen Grotesk · Schibsted Grotesk · Sora ·
                 Unbounded · Anybody · Khand · Boldonse · Climate Crisis (SOLO lúdico/kids)
  Fontshare    → Cabinet Grotesk · Clash Display · Chillax · Ranade · Tanker

BODYS (legibles, con carácter discreto):
  Google Fonts → Hanken Grotesk · Manrope · Gabarito · Figtree · Instrument Sans · Archivo ·
                 Onest · Inter Tight (solo body, nunca de marca)
  Fontshare    → General Sans · Switzer · Author · Satoshi · Supreme · Synonym
  GitHub       → Mona Sans · Hubot Sans (variable, open source)
```

> Cómo usarla (armonizada jul-2026): esta lista alimenta el **DETALLE PROPIO opcional** (display
> de la landing, titular de celebración) — NO el par base, que sale de las COMBINACIONES
> PROBADAS confirmadas contra los líderes. Toda elección respeta las reglas duras (a)-(d):
> nunca serif+serif, nunca dos personalidades fuertes juntas. Verifica contra el REGISTRO
> ANTI-REPETICIÓN (abajo): lo del proyecto anterior está vetado.

```css
/* Ejemplo: par "Audaz / fintech" desde Fontshare */
@import url('https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=satoshi@400,500,700&display=swap');
:root { --font-display: 'Clash Display', sans-serif; --font-body: 'Satoshi', sans-serif; }
```

```ts
// Next.js: con next/font (auto-host, preload, cero parpadeo) — preferir sobre @import en Next
import { Sora, Inter_Tight } from 'next/font/google';
export const display = Sora({ subsets: ['latin'], weight: ['600','700'], variable: '--font-display' });
export const body = Inter_Tight({ subsets: ['latin'], variable: '--font-body' });
```

---

## NOTA SOBRE FUENTES SOBREUSADAS (resolución del conflicto Space Grotesk / Geist)

Tu sistema recomendaba **Space Grotesk**; el análisis anti-slop de impeccable la marca como **sobreusada** (junto con Geist) — se volvió la huella del diseño-IA de 2024-2026, igual que Inter.

```
RESOLUCIÓN ADOPTADA:
- Space Grotesk y Geist pasan de "recomendadas" a "permitidas con criterio": funcionan, pero
  ya no diferencian. Si las usas, que sea por una razón, no por reflejo.
- OJO 2026: la propia "rotación fresca" (Clash Display, Satoshi, Fraunces) ya se está quemando
  de tanto aparecer en apps hechas con IA. Trátala como punto de partida, ROTA entre opciones, y
  dale a la display un TRATAMIENTO propio (ver PASO 0.6 de 16) para que dos apps no se vean iguales.
- Opciones aún POCO quemadas (frescas, con carácter, gratis): Bricolage Grotesque, Schibsted Grotesk,
  Familjen Grotesk, Gambetta, Erode, Instrument Serif, Unbounded, Boldonse, Redaction, Hanken Grotesk,
  Pally, Khand. Para superfamilia cohesiva: IBM Plex (Sans/Serif/Mono), Source.
- PROHIBIDAS como fuente de marca (archivo 16): Inter, Roboto, Arial, system-ui, Open Sans
  (defaults sin carácter). Inter/Inter Tight SÍ sirve como BODY neutro detrás de un display con
  carácter — ahí su neutralidad es una virtud, no un defecto.
```

---

## 🔴 DIVERGENCIA POR CONSTRUCCIÓN (por qué a todos les sale lo mismo, y cómo se arregla)

> **El fallo, detectado probando con varios proyectos:** distintos usuarios reciben propuestas
> visuales casi idénticas. La causa NO es que falten paletas —este archivo tiene decenas— sino que
> **el mecanismo que debía evitar la repetición no puede funcionar en un proyecto nuevo**: el
> REGISTRO ANTI-REPETICIÓN (abajo) vive en el `ESTADO.md` del proyecto, y en un proyecto recién
> creado ese registro **está vacío**. Sin nada que vetar, el agente elige la fila "más segura" de la
> tabla de su nicho — la misma para todos.
>
> La variación no puede depender de un historial que empieza en blanco. **Tiene que estar en la
> construcción de las 3 opciones.**

### La regla: las 3 opciones nacen de CLASES distintas, no de la misma fila con otro acento

Al montar el protocolo A/B/C (`54`), las tres opciones se construyen **desde puntos de partida
estructuralmente distintos**:

```
OPCIÓN A — LA DEL LÍDER: la fila de tu nicho en COMBINACIONES PROBADAS, con la paleta
           tomada tal cual. Es la apuesta segura: se parece a lo que ya funciona en ese mercado.

OPCIÓN B — LA DEL NICHO VECINO: la fila de una categoría ADYACENTE cuyo trabajo emocional
           se parezca (fitness↔hábitos · finanzas↔productividad · educación↔infantil ·
           bienestar↔salud · social↔creadores). Trae aire fresco sin salirse de lo probado,
           porque también es la fila de un líder — de otro mercado.

OPCIÓN C — LA DEL MODO CONTRARIO: la misma misión resuelta en el MODO opuesto al de A
           (si A es oscuro, C es claro), con la tabla espejo. El modo cambia la percepción
           más que cualquier acento, y es el eje que más divergencia da por menos riesgo.
```

**Por qué esto sí varía entre alumnos:** aunque dos proyectos compartan nicho, el nicho vecino
elegido, la composición y el dispositivo ownable serán distintos — y sobre todo, **el usuario elige
entre tres mundos de verdad diferentes** en vez de entre tres tonos del mismo.

### Comprobación antes de presentar (además del TEST DE DIVERGENCIA en grises del `54`)

```
[ ] ¿Las 3 opciones usan CLASES TIPOGRÁFICAS distintas? (redondeada / grotesca / geométrica /
    serif display + sans). Si las tres son "una sans neutra", NO hay tres opciones.
[ ] ¿Al menos una está en el MODO contrario a las otras?
[ ] ¿Cada una tiene su propio dispositivo ownable, y no el mismo con otro color?
[ ] ¿Podrías nombrar cada una con una palabra distinta que un no diseñador entienda?
    ("la cálida" / "la técnica" / "la editorial"). Si las tres se llamarían igual, rehacer.
```

⚠️ **Esto NO autoriza inventar combinaciones.** Las tres siguen saliendo de filas REALES de líderes
(la propia, la vecina, y la del modo contrario) — la regla anti-invento del `16` sigue vigente. Lo
que cambia es que se toman de **tres filas distintas** en vez de tres veces de la misma.

---

## REGISTRO ANTI-REPETICIÓN (para que dos apps del SO nunca salgan iguales)

Al cerrar el brand kit de cada proyecto, **registrar la dirección usada** para vetarla en el siguiente:

```
1. En el ESTADO.md del proyecto, bajo "Dirección de arte", anotar:
   Paleta: [modo + familia de hue del acento + hex final] · Par: [display + body] ·
   Estilo nombrado: [___]
2. Si el agente tiene memoria persistente entre proyectos (MEMORY.md / memoria de usuario),
   duplicar ahí la línea: "Dirección usada en [app]: [paleta] + [par]".
3. AL ARRANCAR el siguiente proyecto (PASO 0 de 16): consultar ese registro. La paleta
   (misma familia de hue del acento en el mismo modo) y el par tipográfico del proyecto
   anterior quedan VETADOS — elegir otra candidata de la LISTA FRESCA o cambiar el
   dispositivo ownable.
```

Este registro es lo que vuelve ejecutable el "test de genericidad" del 16: ya no es introspección
("¿tomaría yo esta misma decisión?") sino una verificación contra datos.

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

- **`16-DIRECCION-DE-ARTE.md`**: el criterio (protocolo REFERENCIA=CONTRATO, cuándo y cómo aplicar el acento, anti-slop, modo derivado con profundidad). Este archivo es el insumo rápido; el 16 es el juicio.
- **`10-DESIGN-TOKENS.md`**: convertir estos hex en tokens CSS.
- **`14-LEYES-DE-DISENO.md`**: niveles de compromiso de color y auditoría cromática final.
- **`23-SKILLS-COMUNIDAD.md`**: instalar ui-ux-pro-max para la base de datos completa.
