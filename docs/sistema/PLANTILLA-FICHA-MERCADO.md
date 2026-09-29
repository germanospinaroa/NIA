# PLANTILLA — FICHA-MERCADO.md (copiar a la raíz del proyecto de la app)

> **Qué es:** la memoria persistente de los NÚMEROS del mercado en el que se vende. Vive en la raíz
> como `FICHA-MERCADO.md`, junto a `ESTADO.md`, `FICHA-ARTE.md` y `FICHA-AVATAR.md` — mismo patrón.
> **Cuándo se llena:** en la Sesión 1, junto con la ficha de avatar y ANTES de fijar precio, duración
> de prueba, garantía o modelo de cobro.
> **Por qué existe:** el SO ya obligaba a investigar el nicho para la IDEA, el AVATAR y la DIRECCIÓN
> VISUAL — cada una con su ficha. Los números del mercado (precio típico, ciclo de decisión, cómo
> paga la gente) no tenían dónde vivir, así que el agente terminaba usando el número que encontraba
> escrito de ejemplo en un documento… que era el número de OTRO nicho y de OTRO país. Esta ficha
> cierra ese hueco: las reglas del SO citan RANURAS de esta ficha, nunca constantes.
>
> **Regla:** máximo ~70 líneas. Todo dato lleva **fuente + fecha + vencimiento** (regla ya vigente en
> `01-IDEACION.md`: "FECHAR todo dato de mercado"). Si un dato no se encuentra, se escribe
> `NO ENCONTRADO — se decide por criterio y se revisa el [fecha]`, **nunca se inventa un número**.
>
> ⚠️ **PROHIBIDO copiar los ejemplos de los documentos del SO.** Los números que aparecen en `02C`,
> `18`, `34` o `40` son ILUSTRACIONES de cómo se ve un dato bien citado, no valores por defecto.
> Un número sin fuente propia en esta ficha es un número inventado.

```markdown
# FICHA DE MERCADO — [Nombre de la app]

## Alcance de esta ficha
- Nicho/categoría exacta: __ (no "educación": "apps de refuerzo de matemáticas para secundaria")
- País(es) donde se va a vender: __ · Moneda de cobro: __
- Fecha de investigación: __ · **Vence el:** __ (recomendado: 6 meses)
- Pasarela/plataforma de venta elegida: __

## 1. PRECIO — contra qué se compara el tuyo
- Mediana de precio de la categoría (mensual): __ · (anual): __ | fuente: __ | fecha: __
- Ajuste por país (si la fuente lo da; ej. "este país paga 0,Xx de la referencia"): __ | fuente: __
- Rango que cobran los 3-5 líderes que investigaste en `16` PASO 0.2bis: __ a __ | fecha: __
- **Precio elegido para esta app:** __ · **Desvío respecto a la mediana:** __%
- Si el desvío supera ±30%, la razón escrita (qué justifica cobrar más o menos): __
- Precio por país/moneda (price parity — si se vende multi-país, ver `02C`): __

## 2. CICLO DE DECISIÓN — cuándo se puede juzgar una campaña
- ¿Se compra el mismo día o se piensa? __ | fuente: __ | fecha: __
- % de compras/pruebas que arrancan >30 días después del primer contacto: __ | fuente: __
- **Ventana mínima antes de declarar que una campaña fracasó:** __ días
- ⚠️ Sin este dato, apagar una campaña "porque van N días sin ventas" es una decisión a ciegas.

## 3. CÓMO PAGA ESTE MERCADO (verificado, no supuesto)
- Medios de pago disponibles en el checkout REAL, ABIERTO Y MIRADO (`18`, protocolo de checkout): __
- De esos, cuáles quedan **deshabilitados** con el modelo elegido (suscripción/pago único): __
- Penetración de tarjeta de crédito entre adultos del país: __% | fuente: __ | fecha: __
- ¿PIX/boleto disponibles? ¿Se auto-cobran o requieren pago manual por ciclo?
  (Hotmart: NO se auto-cobran — cada renovación genera un código nuevo; impacta el dunning de `58`): __
- ¿Pix Automático disponible? (Brasil, desde 2025 — recurrencia real por PIX): __ | fuente: __
- Medio de pago dominante local (transferencia, billetera, efectivo…): __ | fuente: __
- **Consecuencia para el producto:** ¿el modelo elegido excluye a qué % del mercado? __
- Si excluye a la mayoría: ¿hay una vía alterna (producto de pago único, otra pasarela)? __

## 4. PRUEBA Y GARANTÍA (plazos que la pasarela permite DE VERDAD)
- Plazos de prueba que admite la pasarela: __ | verificado en: __ | fecha: __
- Plazos de garantía/reembolso que admite: __ | verificado en: __
- Prueba elegida: __ días · Garantía elegida: __ días
- ⚠️ **REGLA DURA (`18`): la garantía tiene que durar MÁS que la prueba.** Si coinciden, durante la
  prueba no hay nada que devolver y el día del primer cobro la garantía ya venció: cobertura real
  CERO. Comprobación: garantía __ > prueba __ → SÍ / NO. Si es NO, no se publica la garantía.
- ¿Desde cuándo cuenta el plazo de garantía (adhesión o primer cobro)? __ | confirmado con: __
  Si NO está confirmado, el copy dice el plazo **sin fijar fecha de inicio** (cierto en ambos casos).

## 5. CONVERSIÓN ESPERABLE — para saber si un número es malo o normal
- Conversión típica visita→registro del nicho: __ | fuente: __
- Conversión típica prueba→pago del nicho: __ | fuente: __
- **Umbral de muestra antes de decidir** (de `60`, ajustado a este tráfico): __ sesiones o __ clics
- ⚠️ Estos números sirven para SABER SI ALGO ESTÁ MAL, no para prometer resultados.

## 6. ESTACIONALIDAD Y CONTEXTO
- ¿La demanda tiene picos? (exámenes, enero, fin de mes, temporada) __ | fuente: __
- Horas/días de mayor intención de compra observados o documentados: __
- Regulación que afecte la venta (menores, salud, finanzas, datos): __ → ver `47`
```

## CÓMO SE USA (y cómo NO)

**Se usa así:** cuando una regla del SO necesita un número de mercado, lo lee de esta ficha.
Ejemplos de cómo quedan las reglas al citar ranuras en vez de constantes:

| Regla del SO | Cómo la aplica el agente |
|---|---|
| Fijar precio (`02C`, `40`) | Compara con §1. Desvío >±30% exige razón escrita en ESTADO.md |
| Elegir prueba y garantía (`18`) | Toma los plazos de §4 y aplica la regla `garantía > prueba` |
| Decidir si una campaña fracasó (`34`, `60`) | No decide antes de la ventana de §2 |
| Elegir modelo de cobro (`02C`) | Si §3 dice que el modelo excluye a la mayoría, se replantea |
| Juzgar si una conversión es mala (`60`) | La compara con §5, no con una intuición |

**NO se usa para prometer resultados.** Ningún número de esta ficha entra en la landing como promesa
("el 80% mejora en 30 días"). Son datos para DECIDIR internamente. Lo que se promete sale de la
`FICHA-AVATAR.md` y tiene que ser cierto para ESTE producto (ver `61-INTEGRIDAD-DE-LANZAMIENTO.md`,
gate de claims).

## CUÁNDO SE REVISA
- Al llegar la fecha de vencimiento anotada arriba.
- Si se cambia de país, de moneda o de pasarela.
- Si un número real medido en la propia app contradice el benchmark: **gana el dato propio**, y se
  anota en la ficha con la fecha. Los benchmarks son un punto de partida, no un veredicto.
