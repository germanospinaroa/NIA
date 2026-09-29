# PLANTILLA — SELF-CHECK DE COHERENCIA DEL SO

Checklist que un agente recorre para detectar **incoherencias internas del propio Sistema Operativo** (el defecto histórico #1: referencias cruzadas que se desincronizan). Corre cada chequeo, pega la salida, marca ✅/❌ y reporta. Si todo está ✅ → el SO se puede reempacar.

Todos los comandos usan rutas RELATIVAS y asumen que estás en la **raíz del paquete del SO** (la carpeta que contiene `CLAUDE.md`, `AGENTS.md` y `docs/sistema/`). Si no, haz `cd` a esa raíz primero.

---

## (a) Toda ref `NN-*.md` y `PROMPT-*.txt` resuelve a un archivo existente

Extrae cada referencia citada en los docs y verifica que el archivo exista.

```bash
# Refs a docs numerados (ej. 33-RAG-Y-CONTEXTO.md) que NO existen:
cd docs/sistema && \
grep -rhoE '[0-9]{2}[AB]?-[A-ZÁÉÍÓÚÑ0-9-]+\.md' . | sort -u | while read f; do
  [ -e "$f" ] || echo "ROTA (doc): $f"
done

# Refs a prompts (ej. PROMPT-AUDITORIA.txt) que NO existen:
grep -rhoE 'PROMPT-[A-ZÁÉÍÓÚÑ0-9-]+\.txt' . | sort -u | while read f; do
  [ -e "$f" ] || echo "ROTA (prompt): $f"
done
```
Esperado: **sin salida**. Cualquier línea `ROTA:` es una ref colgada → corregir el texto o crear el archivo.

---

## (b) AGENTS.md == CLAUDE.md byte a byte, y prompts distribuibles sincronizados

`AGENTS.md` y `CLAUDE.md` deben ser idénticos. Y cada `PROMPT-*.txt` de la carpeta distribuible de prompts complementarios (si existe en el repo, p. ej. `../prompts-complementarios/Prompts complementarios/`) debe ser idéntico a su original en `docs/sistema/` — el defecto real ya ocurrió: una copia distribuible desincronizada certificaba "APTO" con vara más baja.

```bash
# Raíz: AGENTS.md vs CLAUDE.md
diff -q AGENTS.md CLAUDE.md && echo "OK raiz" || echo "DIFIEREN raiz"

# Prompts distribuibles vs docs/sistema/ (ajusta PC si la carpeta vive en otra ruta del repo):
PC="../prompts-complementarios/Prompts complementarios"
if [ -d "$PC" ]; then
  for f in "$PC"/PROMPT-*.txt; do
    diff -q "docs/sistema/$(basename "$f")" "$f" >/dev/null || echo "DESINCRONIZADO: $(basename "$f")"
  done
  echo "fin prompts"
else
  echo "sin carpeta distribuible en este repo — chequeo de prompts omitido"
fi
```
Esperado: **OK raiz** y ninguna línea `DESINCRONIZADO:` (solo `fin prompts`). Si difieren, copiar la versión canónica (`docs/sistema/`) sobre la copia distribuible.

---

## (c) Fences (triple backtick) balanceados en cada doc

Cada doc debe tener un número PAR de delimitadores de bloque de código.

```bash
cd docs/sistema && for f in *.md; do
  n=$(grep -c "$(printf '\140\140\140')" "$f")
  [ $((n % 2)) -ne 0 ] && echo "IMPAR ($n): $f"
done
echo "fin"
```
Esperado: solo `fin` (sin líneas `IMPAR`). Un fence impar rompe el render del doc → buscar el bloque sin cerrar.

---

## (d) Sin contradicciones de números (conteo de docs, sesiones, rangos)

Verifica que el conteo real de docs coincida con lo que el SO AFIRMA de sí mismo.

```bash
# Conteo real de docs numerados (incluye 02B y 02C):
cd docs/sistema && ls | grep -E '^[0-9]{2}[ABC]?-.*\.md$' | wc -l

# Rango real (primero y último):
ls | grep -E '^[0-9]{2}[ABC]?-.*\.md$' | sort | sed -n '1p;$p'

# Dónde el SO afirma un conteo/rango — revisar a mano que coincida con lo de arriba:
cd ../.. && grep -rniE 'docs? numerados|[0-9]+ ?docs|01-[0-9]{2}|sesiones|pilares' \
  CLAUDE.md docs/sistema/00-SISTEMA-MAESTRO.md docs/sistema/INICIO.md \
  docs/sistema/REFERENCIA-RAPIDA.md CHANGELOG.md

# CONTEOS ESTANCADOS (grep explícito — son las referencias que se quedan viejas al añadir módulos):
# hoy el rango numerado llega a 63 y el plan canónico es de 8 sesiones (INICIO.md B5). Nada debe decir lo viejo.
# (Se excluye esta plantilla, que contiene los patrones como texto del propio chequeo; el patrón de
#  "6 sesiones" no matchea rangos legítimos tipo "4-6 sesiones".)
grep -rnE '01-4[0-7]|(^|[^0-9-])6 sesiones|\[1-7\]' \
  CLAUDE.md AGENTS.md docs/sistema/*.md docs/sistema/*.txt CHANGELOG.md \
  | grep -v 'PLANTILLA-SELF-CHECK.md'
```
Esperado: el número que afirman los docs == el `wc -l`; el rango citado == el rango real; el conteo de sesiones es consistente entre los docs que lo mencionan (revisar a ojo). El grep de conteos estancados debe salir **sin salida** — cualquier `01-4x`, "6 sesiones" o "[1-7]" es una referencia vieja → corregir al rango real, "8 sesiones (ver INICIO.md)" y "[1-8]".

---

## (e) IDs de modelo vigentes

Solo se permiten: `claude-opus-4-8`, `claude-sonnet-4-6`, `claude-haiku-4-5`, `fable-5`. Sin sufijo de fecha y sin versiones 3.x.

```bash
# (desde la raíz del paquete)
# IDs prohibidos (versiones viejas, hardcodeadas o con fecha). Menciones a productos como
# ChatGPT/Gemini en guias de assets NO son IDs de modelo y no deben fallar este chequeo.
grep -rniE 'claude-[0-9]|claude-(opus|sonnet|haiku)-[0-9]+-[0-9]+-[0-9]{8}|gpt-[0-9]|gemini-[0-9]' \
  CLAUDE.md docs/sistema/ ; \
# Sanity: lista los IDs vigentes encontrados (para confirmar que solo aparecen estos):
echo "--- vigentes ---" ; \
grep -rhoE 'claude-(opus|sonnet|haiku)-[0-9]+-[0-9]+|fable-[0-9]+' docs/sistema/ CLAUDE.md | sort | uniq -c
```
Esperado: la primera búsqueda **sin salida**; bajo `--- vigentes ---` solo `claude-opus-4-8 / claude-sonnet-4-6 / claude-haiku-4-5 / fable-5`.

---

## (f) Cada doc numerado aparece en la tabla de ruteo de CLAUDE.md

Ningún doc puede quedar huérfano (sin entrada en la tabla que decide qué leer).

```bash
# (desde la raíz del paquete)
for f in docs/sistema/[0-9]*.md; do
  base=$(basename "$f")
  grep -q "$base" CLAUDE.md || echo "FALTA EN RUTEO: $base"
done
echo "fin"
```
Esperado: solo `fin`. Cada `FALTA EN RUTEO:` es un doc no ruteado → añadir su fila a la tabla de `CLAUDE.md` (y replicar en `AGENTS.md` + copias por el chequeo (b)).

---

## (g) INSTRUCCIONES.md y REFERENCIA-RAPIDA.md remiten a INICIO.md como fuente única del plan de sesiones

El plan de 8 sesiones vive SOLO en `INICIO.md` (sección B5). Los manuales del humano no pueden redefinir un plan propio — deben remitir a él (el defecto real: un "Camino A" de 6 sesiones contradiciendo las 8 canónicas).

```bash
# (desde la raíz del paquete)
for f in docs/sistema/INSTRUCCIONES.md docs/sistema/REFERENCIA-RAPIDA.md; do
  if grep -q 'INICIO\.md' "$f" && grep -q '8 sesiones' "$f"; then
    echo "OK: $f"
  else
    echo "NO REMITE al plan de 8 sesiones de INICIO.md: $f"
  fi
done
```
Esperado: **OK** en ambos. Si falta la remisión, reescribir la sección del plan para que cite `INICIO.md` (B5) como fuente única en vez de enseñar un mapa de sesiones propio.

---

## (h) CHEQUEOS SEMÁNTICOS DE DOCTRINA

Además de los chequeos estructurales, `scripts/audit-so.sh` corre greps que cazan **doctrina vieja** que sobrevive como texto (el defecto ya ocurrió: la coherencia estructural pasaba mientras un archivo seguía enseñando la regla derogada). Los greps vigentes:

```
- Perturbación de hue fuera de contexto histórico (la paleta del líder se toma TAL CUAL — 29)
- "15-25 pantallas" (rango de onboarding derogado; la doctrina vigente es 4-8 / 9-20 de 02B)
- "NUNCA el total" (display de precios derogado; vigente: $/mes grande + total anual visible — 02C)
- "% de ahorro" anual (vigente: el ahorro se expresa en meses, no en porcentaje — 02C)
- "counter menor o igual" (patrón de idempotencia/límite derogado)
- SUPABASE_ANON_KEY (nomenclatura vieja de claves)
- "supabase db query" (subcomando inexistente del CLI)
- "cancelar y recomprar" (flujo de cambio de plan derogado)
- "FIJA EXPECTATIVAS al inicio" (derogado: las expectativas se reparten en su momento — regla 8 de INICIO; el primer mensaje es SOLO la pregunta del PASO 2)
- "5-9 días" como duración óptima de trial (derogado: regla de TIEMPO-A-VALOR en 02C — RevenueCat 2026)
- "PIX y boleto NO se auto-cobran" como afirmación absoluta (derogado: Pix Automático jun-2025 — 58 Paso 0; el condicional "siguen SIN auto-cobrarse" tras verificar es legítimo)
- Voseo/regionalismos en la voz del agente ("tenés", "querés", "vos", "fijate"...) — la voz es español latino neutro (42); el voseo solo puede aparecer en la regla dialectal de 52/11/FICHA-AVATAR y en citas de usuarios (44)
```

**Regla de mantenimiento:** todo cambio de doctrina futuro entra con su grep en `audit-so.sh` — sin grep, el cambio no se considera propagado.

---

## REPORTE

| Chequeo | Resultado | Incoherencias encontradas |
|---|---|---|
| (a) refs `NN-*.md` / `PROMPT-*.txt` | | |
| (b) AGENTS==CLAUDE + prompts distribuibles | | |
| (c) fences balanceados | | |
| (d) conteos/rangos/sesiones (+ grep estancados) | | |
| (e) IDs de modelo | | |
| (f) docs en tabla de ruteo | | |
| (g) INSTRUCCIONES/REFERENCIA-RAPIDA remiten a INICIO.md | | |
| (h) chequeos semánticos de doctrina (audit-so.sh) | | |

Si TODO ✅ → el SO es coherente y se puede reempacar. Si hay ❌ → corregir primero, re-correr el chequeo afectado, y solo entonces reempacar.
