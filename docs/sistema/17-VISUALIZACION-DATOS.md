# VISUALIZACIÓN DE DATOS — Gráficos que Comunican y se Ven Premium

> **Cuándo cargar este archivo:**
> - Siempre que la app muestre datos: dashboards, progreso, métricas, estadísticas, tracking
> - Apps de fitness, finanzas, analítica, salud, productividad viven de esto
> - Junto con `14-LEYES-DE-DISENO.md` y `16-DIRECCION-DE-ARTE.md` (los gráficos usan la misma paleta)
>
> **Por qué existe:** Un dashboard mal hecho hunde una app entera, por más bonito que sea el resto. Y los gráficos son donde Codex/Claude Code más improvisan sin guía. Este archivo da las reglas y specs para que los datos comuniquen al instante Y se vean profesionales.

---

## PRINCIPIO RECTOR: Data-Ink Ratio (Edward Tufte)

La investigación de Tufte, pionero de la visualización de datos, demuestra que **los gráficos con alto ratio dato-tinta (máxima información con mínima complejidad visual) producen comprensión más rápida y mayor recuerdo que las alternativas decorativas.**

Traducción práctica: cada elemento del gráfico debe ganarse su lugar. Fuera líneas de grid innecesarias, fuera efectos 3D, fuera sombras en las barras, fuera leyendas que se podrían poner directo sobre el dato. El error #1 de los gráficos es elegir el tipo por atractivo visual, no por claridad informacional.

---

## REGLAS UNIVERSALES DE GRÁFICOS

```
1. LABEL DIRECTO sobre el dato cuando se pueda — elimina la necesidad de leyenda y el
   ir-y-venir del ojo. ("106g" sobre la barra, no en una leyenda aparte).
2. COLOR CON SIGNIFICADO, no decorativo. Verde = positivo/logrado, rojo = negativo/déficit,
   acento = el dato en foco. No colorear barras de arcoíris "porque sí".
3. EL DATO PROTAGONISTA primero: el número grande que importa va en display (28-40px/700),
   el gráfico lo apoya, los ejes y labels son metadata (12-13px, color secundario).
4. INSIGHT, no solo dato: junto al gráfico, una frase que interpreta. No "1.420 kcal" solo,
   sino "↓ 8% vs la semana pasada". El usuario quiere el SIGNIFICADO, no el número crudo.
5. MENOS ES MÁS: máximo ejes necesarios. Quitar líneas de grid salvo 2-3 de referencia.
   Sin bordes de caja alrededor del gráfico. Sin fondo distinto.
6. RESPONSIVE: en móvil, máximo 7 puntos/barras visibles (días de la semana es ideal).
   Más datos → scroll horizontal con snap, o agregación (semana/mes/año con tabs).
```

---

## GRÁFICO → CASO DE USO (elegir el tipo por el dato, no por estética)

El error #1 es elegir el gráfico por cómo se ve. Esta tabla mapea **tipo de dato → gráfico recomendado → anti-patrón a evitar**. Empezar siempre por la naturaleza del dato.

| Tipo de dato (qué tienes) | Gráfico recomendado | Anti-patrón (NO hagas esto) |
|---|---|---|
| Serie temporal (evolución en el tiempo) | Línea o área | Barras para muchos puntos (se vuelve una reja ilegible) |
| Comparación entre categorías | Barras (horizontales si labels largos) | Donut/pie para comparar (el ojo no compara ángulos) |
| Parte de un todo (composición) | Donut o treemap, con cuidado y ≤5 partes | Pie con 8 tajadas; donut para comparar magnitudes |
| Distribución (cómo se reparten los valores) | Histograma o box plot | Línea (sugiere continuidad temporal falsa) |
| Correlación entre dos variables | Scatter plot | Dos líneas en ejes distintos (correlación espuria visual) |
| Datos geográficos | Mapa (choropleth / puntos) | Tabla de países cuando el patrón es espacial |
| Audio / señal | Waveform | Barras estáticas que pierden la forma de la onda |
| Fitness / esfuerzo por zona | Zonas de pace/ritmo (verde/amarillo/rojo) | Una sola línea sin umbrales (se pierde el "en qué zona") |
| Flujo entre estados / etapas | Sankey | Barras apiladas (oculta de-dónde-a-dónde) |
| Jerarquía / anidamiento | Treemap (o sunburst) | Lista plana que pierde la relación padre-hijo |
| KPI único | Big number + sparkline | Gráfico completo para un solo número |
| Progreso hacia una meta | Anillo o barra lineal de progreso | Gauge con aguja de tablero (ruido decorativo) |
| Ranking (orden importa) | Barras ordenadas | Pie (no comunica posición ni orden) |
| Múltiples métricas comparables por sujeto | Radar/spider (con moderación) | 5 anillos sueltos sin marco común |
| Embudo de conversión | Funnel | Barras sin la caída visible entre pasos |

> Regla de arranque: nombrá primero el TIPO DE DATO, después buscalo en la columna izquierda. Si el gráfico que ibas a usar es el de la columna "anti-patrón", cambialo.

---

## ACCESIBILIDAD DE VISUALIZACIONES (no negociable)

Un gráfico que solo se entiende viendo color, con vista perfecta, deja afuera a una parte real de los usuarios. Dos reglas obligatorias:

```
1. ALTERNATIVA EN TABLA SIEMPRE
   Toda visualización tiene una tabla equivalente con los mismos datos,
   oculta visualmente pero accesible a lectores de pantalla:
     <table class="sr-only"> ... </table>   (o aria-describedby a la tabla)
   El usuario de lector de pantalla obtiene los números, no "gráfico, imagen".

2. NO DEPENDER SOLO DEL COLOR (daltonismo)
   El significado nunca se codifica únicamente con color. Sumar SIEMPRE
   una segunda señal: forma, ícono, patrón, o label de texto directo.
     ❌ verde = logrado, rojo = déficit          (solo color)
     ✅ verde + ✓ "logrado", rojo + ✗ "déficit"   (color + forma + label)
   ~8% de los hombres tiene algún tipo de daltonismo: el rojo/verde es justo el par que más falla.
```

---

## ESPECIFICACIONES POR TIPO DE GRÁFICO

### Anillo de progreso (el rey de fitness/objetivos)
```
- Grosor del anillo: 8-12px, extremos redondeados (stroke-linecap: round)
- Track de fondo: el mismo grosor en neutro a baja opacidad (10-15%)
- Progreso: color de acento; opcional gradiente (ej: lima→ámbar) que comunica intensidad
- Número central: display grande (28-40px/700) PERFECTAMENTE centrado óptica y
  matemáticamente, con su label (unidad) inmediatamente debajo, ambos como grupo centrado
- Animación: el anillo se "dibuja" de 0 al valor en 600-800ms ease-out al cargar
- Glow detrás del anillo: SOLO si la dirección de la FICHA-ARTE lo pide (referencia del
  usuario o dirección del 54 que lo incluya); por defecto NO (capa anti-IA del 16)
- Para múltiples métricas: anillos concéntricos (estilo Apple Fitness) — máx 3
```

### Gráfico de barras (comparación temporal)
```
- Barras con esquinas redondeadas arriba (radio 4-6px)
- Ancho de barra ≈ 40-60% del espacio asignado (el gap entre barras importa, da aire)
- Color: neutro/acento suave para barras normales; acento pleno o gradiente para la barra
  destacada (hoy, récord, el dato en foco)
- Línea de referencia punteada (meta/promedio) cruzando el gráfico, con su valor al lado
- Eje Y: 3-4 valores máximo (0, medio, meta, máximo), en metadata pequeña
- Eje X: labels de una letra/abreviados (M T W T F S S)
- Animación: las barras crecen desde abajo, escalonadas (stagger 40-60ms entre cada una)
```

### Línea de tendencia (evolución, peso, progreso)
```
- Línea de 2-3px, color de acento, con curvatura suave (no quebrada salvo que el dato lo exija)
- Puntos en cada dato: círculos pequeños (4-6px) del color de acento
- Área bajo la línea: gradiente del acento desvaneciéndose a transparente (opcional, da cuerpo)
- Eje Y a la derecha o labels directos, mínimos
- Resaltar el último punto (el más reciente) con un punto más grande o un glow (el glow solo si la FICHA-ARTE lo autoriza — restringido por defecto: 16/DESIGN-CORE §4)
- Animación: la línea se dibuja de izquierda a derecha en 800ms
```

### Donut / dona (proporción, composición — macros, categorías)
```
- Usar para mostrar PARTES DE UN TODO (40% proteína / 35% carbos / 25% grasa)
- Grosor moderado (no pie sólido — el donut deja centro para un dato o label)
- Segmentos en colores distinguibles de la misma familia de la paleta (no arcoíris ajeno)
- Labels con porcentaje directos o en una mini-leyenda compacta al lado
- Centro: puede llevar el total o el dato clave
- Máximo 4-5 segmentos (más se vuelve ilegible) — agrupar el resto en "Otros"
- Animación: los segmentos se "rellenan" en secuencia
```

### Sparkline (tendencia mini, dentro de una card)
```
- Línea diminuta sin ejes ni labels, solo la forma de la tendencia
- Perfecta dentro de una card de métrica para dar contexto sin ocupar espacio
- Color: acento o semántico (verde si sube y es bueno, rojo si baja y es malo)
```

### Barra de progreso lineal (objetivos simples)
```
- Altura 6-10px, esquinas totalmente redondeadas (pill)
- Track neutro a baja opacidad + relleno de acento (o gradiente)
- Label de porcentaje o valor al lado o encima
- Animación: se llena de 0 al valor en 600ms ease-out
- Estado: verde si on-track, ámbar si cerca del límite, rojo si excedido (según contexto)
```

---

## CHARTCONTAINER CANÓNICO (Recharts tematizado — copia la estructura, deriva los tokens)

Recharts con sus defaults (azul `#8884d8`, grid gris, tooltip blanco) delata template al instante. Todo gráfico de la app pasa por un contenedor canónico que resuelve de una vez: tokens de la app (nunca los defaults de Recharts), tooltip tematizado con la card del sistema, tabla `sr-only` con los mismos datos (la regla de accesibilidad de arriba), skeleton mientras carga y ejes localizados con `Intl.NumberFormat`.

```tsx
// components/ui/chart-container.tsx — el envoltorio canónico de TODO gráfico Recharts
'use client';

import { useReducedMotion } from 'motion/react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface Punto { etiqueta: string; valor: number }

interface ChartContainerProps {
  titulo: string;          // para aria y la tabla sr-only: "Calorías por día"
  datos: Punto[] | null;   // null = cargando → skeleton con la forma del gráfico (CLS = 0)
  unidad?: string;         // "kcal", "COP" — para la tabla accesible
  altura?: number;
}

// Ejes LOCALIZADOS: "1,4 mil" y no "1.4K" — el locale de la app, nunca el default en inglés (39)
const NUM = new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 });

// Tooltip tematizado: la CARD elevada del sistema (49 §3), jamás el recuadro blanco default
function TooltipCard({ active, label, payload }:
  { active?: boolean; label?: string; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-default)]
                    bg-[var(--surface-elevated)] px-3 py-2 shadow-[var(--shadow-md)]">
      <p className="text-[12px] font-medium text-[var(--text-secondary)]">{label}</p>
      <p className="text-[15px] font-semibold tabular-nums text-[var(--text-primary)]">
        {NUM.format(payload[0].value)}
      </p>
    </div>
  );
}

export function ChartContainer({ titulo, datos, unidad = '', altura = 180 }: ChartContainerProps) {
  const reduce = useReducedMotion();
  if (!datos) return <Skeleton style={{ height: altura }} className="w-full" />;

  return (
    <figure aria-label={titulo}>
      <ResponsiveContainer width="100%" height={altura}>
        <BarChart data={datos} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
          {/* SOLO tokens de la app: como grid, ejes y tooltip leen var(--…), el gráfico
              cambia de tema solo (dark/light) con [data-theme] — cero hex de Recharts */}
          <CartesianGrid vertical={false} stroke="var(--border-default)" strokeDasharray="3 3" />
          <XAxis dataKey="etiqueta" axisLine={false} tickLine={false}
                 tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
          <YAxis width={36} axisLine={false} tickLine={false} tickCount={4}
                 tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                 tickFormatter={(v: number) => NUM.format(v)} />
          <Tooltip content={<TooltipCard />} cursor={{ fill: 'var(--brand-primary-soft)' }} />
          {/* Serie con token --chart-1 (definido junto a los del 10, mismo hue de la paleta);
              fallback al acento. Las barras crecen al montar (600-800ms, specs de arriba). */}
          <Bar dataKey="valor" fill="var(--chart-1, var(--brand-primary))"
               radius={[6, 6, 0, 0]} maxBarSize={28} isAnimationActive={!reduce} />
        </BarChart>
      </ResponsiveContainer>
      {/* La ALTERNATIVA EN TABLA obligatoria — mismos datos, sr-only (lector de pantalla) */}
      <figcaption className="sr-only">
        <table>
          <caption>{titulo}</caption>
          <thead><tr><th scope="col">Período</th><th scope="col">Valor{unidad && ` (${unidad})`}</th></tr></thead>
          <tbody>
            {datos.map((p) => (
              <tr key={p.etiqueta}><th scope="row">{p.etiqueta}</th><td>{p.valor}</td></tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}
```

Reglas del contenedor: los colores de serie salen de tokens `--chart-1..n` (misma familia de la paleta de la app — PROHIBIDO el azul default de Recharts); en dark mode no hay trabajo extra porque grid/ejes/tooltip usan tokens que cambian con el tema (verificar el screenshot en ambos temas si la app tiene toggle); línea/anillo/donut usan este mismo envoltorio cambiando solo el chart interno.

---

## LAYOUT DE DASHBOARD (cómo organizar múltiples datos sin saturar)

La tensión real: las apps de datos necesitan mostrar MUCHO, pero sin abrumar. Cómo resolverlo:

```
1. CARD-BASED: cada métrica/dataset en su propia card. Las cards crean separación visual
   y permiten que cada dato "respire" aunque haya muchos.
2. JERARQUÍA POR TAMAÑO (bento grid): el dato más importante en una card más grande arriba;
   los secundarios en cards más pequeñas abajo. No todas las cards del mismo tamaño.
3. ORDEN POR FRECUENCIA: lo que el usuario mira más, arriba (thumb zone / primer scroll).
4. UN DATO HÉROE POR SECCIÓN: cada card tiene UN número protagonista (display) + su gráfico
   de apoyo + su insight. No 5 números compitiendo en una card.
5. PROGRESSIVE DISCLOSURE: el dashboard muestra el resumen; tocar una card lleva al detalle.
   No meter todo el detalle en la vista principal.
6. AGRUPACIÓN TEMPORAL: tabs de Semana/Mes/3 Meses/Año en vez de meter todos los rangos juntos.
```

Nota sobre densidad: una pantalla de dashboard PUEDE tener más de 3-4 bloques (la regla general de `14-LEYES-DE-DISENO.md`) SI cada bloque está bien delimitado en su card, tiene jerarquía interna clara, y hay ritmo de espaciado. La clave no es "pocos elementos" sino "cero saturación": mucho dato bien organizado se siente calmado; poco dato mal organizado se siente caótico.

---

## INSIGHTS GENERADOS (el toque de IA que da valor)

Las apps de datos premium no solo muestran números — los interpretan. Aprovechar la IA de la app para generar insights:

```
En vez de:              Mostrar:
"1.420 kcal"        →   "↓ 8% vs la semana pasada"
"72.4 kg"           →   "↓ 1.2 kg este mes. Vas en ritmo."
Gráfico de barras   →   "Tu mejor día fue el viernes 🌟"
Datos de macros     →   "Te falta proteína para tu objetivo de recomposición"
```

Cada dato importante merece una frase de interpretación que lo conecte con el objetivo del usuario. Eso convierte un dashboard en un coach.

---

## CHECKLIST DE VISUALIZACIÓN DE DATOS

```
CLARIDAD (Tufte)
[ ] Cada elemento del gráfico se gana su lugar (sin adornos, sin 3D, sin sombras innecesarias)
[ ] Labels directos sobre los datos donde se puede (menos leyendas)
[ ] El tipo de gráfico se eligió por claridad, no por verse bonito
[ ] Máximo de líneas de grid (2-3 de referencia, no una reja)

JERARQUÍA
[ ] Un dato héroe por card (display grande) + gráfico de apoyo + insight
[ ] El número importante es lo primero que ve el ojo
[ ] Ejes y labels son metadata discreta (12-13px, color secundario)

COLOR Y COHESIÓN
[ ] Los gráficos usan la MISMA paleta que el resto de la app
[ ] Color con significado (verde positivo, rojo negativo, acento en foco)
[ ] Máximo de colores: no arcoíris, misma familia

MOVIMIENTO
[ ] Los gráficos se animan al cargar (barras crecen, línea se dibuja, anillo se llena)
[ ] Duración 600-800ms ease-out, stagger en elementos múltiples

VALOR
[ ] Cada dato clave tiene un insight/interpretación, no solo el número crudo
[ ] El dashboard responde "¿cómo voy?" de un vistazo

RESPONSIVE
[ ] Máximo 7 puntos/barras visibles en móvil
[ ] Más datos → tabs temporales o scroll con snap, no apretar todo

ACCESIBILIDAD
[ ] El tipo de gráfico salió de la tabla "Gráfico → Caso de uso" (no del gusto)
[ ] Cada visualización tiene su alternativa en TABLA (sr-only / aria-describedby)
[ ] El significado no depende solo del color: hay forma/ícono/label además del color
```
