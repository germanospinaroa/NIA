# PREFLIGHT — releer INMEDIATAMENTE ANTES de construir CADA pantalla

> ~40 líneas. Es lo único que debe estar fresco en memoria al codear. La doctrina completa vive en
> DESIGN-CORE (leído al inicio de sesión); esto es la tarjeta de cabina que se relee SIEMPRE.

**0. FICHA-ARTE.md abierta.** Todos los valores salen de ahí. ¿Hay referencia del usuario? → es CONTRATO (16):
la fidelidad manda — replicar, no reinterpretar; el cierre compara el screenshot AL LADO de la referencia.
¿Primera pantalla de este tipo en el proyecto? → mira el ejemplo compilable del 53 (copia COMPOSICIÓN, no valores).

**1. SPEC ANTES DE CÓDIGO** — emite este bloque y RECIÉN después escribe JSX:
```yaml
pantalla: __            # una misión, un objeto principal dominante
objeto_principal: __    # qué domina visualmente
niveles: {display: __, title: __, body: __, label: __}   # máx 3 tamaños visibles
acento_en: __           # SOLO la acción/dato clave (60-30-10)
baseline_aplican: []    # de las 7: stagger, conteo héroe, anillo/barras, tap, tabs, modal, celebración
dispositivo_ownable: __ # el de la ficha, visible en esta pantalla
estados: [empty, loading, success, error, disabled, offline]  # TODOS existen
```

**2. Números no negociables:** min-h-dvh + nav al fondo · 375px sin scroll horizontal · touch ≥44px ·
texto de lectura ≥14px (labels/captions 11-13px permitidos — N4) · escala espaciado 4·8·12·16·24·32·48·64 (nada intermedio) · radio idéntico en toda la
pantalla · tap 80-150ms, transiciones 200-400ms, nada linear · contraste ≥4.5:1.

**3. Prohibido:** hex fuera de tokens · `transition: all` · Inter/Roboto/system-ui de marca ·
`min-h-full` · fondo de un solo fill plano (3 niveles: base/elevado/hundido) · spinner genérico
(skeleton) · vacío muerto (pantalla LLENA de valor, no input+2 botones) · elemento tapable sin acción.

**3B. Lo que se puede medir, se mide (no se declara):** desborde horizontal = 0 · alturas de columnas
que dicen ser iguales · renglones reales del titular · nada importante tapado por barras fijas.
Se comprueba con **cada variante de contenido** (nombre corto y largo, categoría corta y larga), no
con una sola. Script en `12-FLUJO-AGENTICO.md` → "MEDIR EL LAYOUT". Un tamaño fijo calculado para un
texto se descuadra con los demás.
Si la app tiene toggle de tema: screenshot en AMBOS temas.
Si el layout depende del ancho: verificar también a 360px (ancho Android dominante en LATAM).

**3C. Lo que hay que LEER no puede irse solo:** todo contenido que enseña algo espera un acto del
usuario ("Entendido"). Si algo autodesaparece, el test mide **permanencia**, no existencia
(`06-TESTING.md` → "PRESENCIA ≠ LEGIBILIDAD").

**4. Cierre = evidencia:** screenshot REAL a 375px con DATOS SEMILLA (32 — nunca pantalla vacía) →
el `revisor-visual` es OBLIGATORIO en las 4 pantallas que deciden el dinero (landing, onboarding,
paywall, pantalla principal) y en la PRIMERA de cada plantilla/tipo nuevo (pásale SIEMPRE: screenshot
+ ARCHIVO DE CÓDIGO + FICHA-ARTE.md + referencia si existe; él puntúa /40 y /20, tú NO te autoevalúas);
en las demás: medición + checklist, anotando "sin revisor (pantalla secundaria)" → si hay referencia:
test de fidelidad → gate ≥36/40 Y ≥16/20 → reporte con ruta del screenshot + puntajes + ESTADO.md
actualizado. Sin screenshot no hay "lista".
