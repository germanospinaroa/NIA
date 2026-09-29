# PLANTILLA — FICHA-ARTE.md (copiar a la raíz del proyecto de la app)

> **Qué es:** la memoria persistente de TODAS las decisiones de dirección de arte. Vive en la raíz
> del proyecto como `FICHA-ARTE.md`, junto a `ESTADO.md`. El hook de arranque la inyecta en cada
> sesión — así las decisiones visuales sobreviven compactaciones y sesiones nuevas.
> **Cuándo se llena:** en la Sesión de identidad visual (16 PASO 0), ANTES de la primera pantalla.
> **Regla:** máximo ~60 líneas. Si un campo no aplica, se escribe "N/A — [porqué]", nunca se borra.

```markdown
# FICHA DE DIRECCIÓN DE ARTE — [Nombre de la app]

## Referencia del usuario (CONTRATO — ver 16, protocolo obligatorio)
- ¿Hay imagen(es) de referencia del usuario?: SÍ/NO → [ruta(s) o descripción]
- Extracción (obligatoria si SÍ — mirada con herramienta de imágenes, no de memoria):
  - Modo: claro/oscuro · Fondo: #__ · Superficie: #__ · Texto 1º/2º: #__ / #__
  - Acento(s): #__ (dónde aparece en la imagen: __)
  - Display: [clase + fuente elegida entre las candidatas] · Body: [ídem]
  - Radio: __px · Espaciado: apretado/medio/aireado · Sombras: ninguna/sutil/dura
  - Bordes: __ (sí/no, grosor y opacidad — crítico si la referencia no usa sombras)
  - Textura/gradiente/grano: __ · Layout: __ · Detalle firma a replicar: __
- Prohibiciones anti-IA que la referencia LEVANTA: [ninguna / lista con porqué]

## Identidad derivada (si NO hay referencia: FUSIÓN de líderes — 16 PASO 0.2bis — + banco del 54 para el dispositivo)
- TABLA DE LÍDERES (si no hubo referencia): [app → qué tomé de ella]
  - Ej: Duolingo → tipografía redondeada friendly (Nunito) · Headspace → lógica de degradé
    tonal · Fabulous → celebraciones · Cal AI → cards y tratamiento de números
- Combinación tipográfica probada usada: [fila del 29] · validada contra líderes: SÍ/NO
- Arquetipo: __ · Mundo del sujeto (0.45): __
- Dirección del banco 54 usada para el DISPOSITIVO OWNABLE (si aplica): "__" · Líder de origen de la paleta (tomada tal cual): __

## Personalidad compilada (SIEMPRE obligatoria — la referencia no dicta motion ni voz)
- 3 adjetivos de personalidad: __, __, __
- Compilación (tabla del 11): spring __ · duración base __ms ·
  exclamaciones máx __/pantalla · celebración nivel __ · radio tendencial __px

## Brand kit final (los valores que viven en globals.css/@theme)
- Fondo: #__ · Superficie: #__ · Hundido: #__ · Texto 1º/2º: #__ / #__
- Acento: #__ (SOLO en: __) · 2ª nota (si hay): #__ (porqué: __)
- Semánticos: éxito #__ · error #__ · aviso #__
- Display: __ (pesos: __) · Body: __ (pesos: __) · Escala: display __px / title __px / body __px / label __px
- Radio: __px · Profundidad: [sombras 3 niveles / bordes+elevación — según la dirección] · Espaciado base: escala 4·8·12·16·24·32·48·64
- Dispositivo ownable: __ (receta: archivo 54 / propia: __)
- Motion signature: easing __ · stagger __ms · firma: __

## Trazabilidad y vetos
- Ruta de diseño (PREGUNTA DE REFERENCIA del 54): [propuesta propia / réplica de referencia]
- Protocolo A/B/C (si la ruta fue propuesta propia o interpretaciones fieles): opción elegida [A/B/C/combinación: __] · descartadas: [qué definía a las otras] · página comparativa: [ruta del direcciones-abc.html / URL de /dev/direcciones] · screenshots: [rutas]
- Réplica fiel (si la ruta fue captura del usuario): [ruta de replica-fiel.html] · captura(s) de referencia archivada(s): [rutas en docs/revisiones/] · test de fidelidad: [PASA/desvíos corregidos]
- Tour de la app (obligatorio en ambas rutas — 54): [ruta de vista-previa-app.html] · vistas incluidas: [principal/M0, onboarding, paywall, mecanismo] · aprobado por el usuario: [SÍ + fecha / ajustes pedidos y re-aprobado]
- Paleta derivada de: [referencia del usuario / líder de origen: __ (tomada tal cual — doctrina ago-2026 de 29) / banco 54 "X"] · Dispositivo ownable elegido: __
- Registro anti-repetición: paleta y par tipográfico anotados en ESTADO.md → vetados para el próximo proyecto
- Modo (claro/oscuro) DERIVADO por: __ (nunca "asumido")

## Idioma UI: __ · Fecha de cierre de la ficha: __ · Aprobada por el usuario: SÍ/NO
```

**Al cerrar la ficha:** (1) pedir OK del usuario mostrando los tokens llenos ("así traduje tu
referencia/dirección"), (2) volcarla a `globals.css` (@theme) ANTES de la primera pantalla,
(3) anotar en ESTADO.md que la ficha existe y está aprobada. Cambiarla a mitad de proyecto
requiere OK explícito del usuario y actualizar tokens + re-render de pantallas cerradas.
