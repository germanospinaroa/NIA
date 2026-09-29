#!/usr/bin/env bash
# audit-diseno.sh — auditoría mecánica de diseño de una app construida con el SO.
# Uso: scripts/audit-diseno.sh /ruta/al/proyecto
# Busca las huellas del "diseño genérico" que prohíbe el SO (14/16/10) + console.log.
# Exit != 0 si hay hallazgos críticos.
set -u

PROJECT="${1:-.}"
if [ ! -d "$PROJECT" ]; then
  echo "❌ No existe el directorio: $PROJECT"
  echo "Uso: scripts/audit-diseno.sh /ruta/al/proyecto"
  exit 1
fi
cd "$PROJECT" || exit 1

# Dónde buscar (solo código fuente de UI).
SRC_DIRS=""
for d in src app components pages; do
  [ -d "$d" ] && SRC_DIRS="$SRC_DIRS $d"
done
if [ -z "$SRC_DIRS" ]; then
  echo "⚠️ No encontré src/, app/, components/ ni pages/ en $PROJECT — audito todo el directorio."
  SRC_DIRS="."
fi

# Exclusiones: archivos donde SÍ es legítimo tener hex (tokens/config) y ruido.
EXCLUDES='--exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=build --exclude-dir=.git'
TOKEN_FILES='tokens|theme|tailwind\.config|globals\.css|design|palette|colors'

CRIT=0
WARN=0

echo "════════════════════════════════════════════════════════"
echo " AUDITORÍA MECÁNICA DE DISEÑO — $PROJECT"
echo " (complementa, NO reemplaza, la rúbrica /40 de RUBRICAS-DE-PANTALLA.md)"
echo "════════════════════════════════════════════════════════"

# ── 1. Hex hardcodeados fuera de archivos de tokens (crítico — regla 17 de UX) ──
echo ""
echo "── 1. Colores hex hardcodeados en componentes (deben ser tokens CSS — archivo 10)"
# El filtro de TOKEN_FILES aplica SOLO a la RUTA (antes del primer ':' de la salida ruta:línea:contenido)
# — nunca al contenido, para no excluir falsamente líneas de código que mencionen "theme/colors/design".
HEX=$(grep -rnE '#[0-9a-fA-F]{3,8}\b' $SRC_DIRS $EXCLUDES --include='*.tsx' --include='*.ts' 2>/dev/null \
      | grep -vE "^[^:]*(${TOKEN_FILES})[^:]*:" || true)
HEX_N=$(printf '%s' "$HEX" | grep -c . || true)
if [ "$HEX_N" -gt 0 ]; then
  echo "❌ $HEX_N línea(s) con hex directo fuera de tokens/config:"
  echo "$HEX" | head -15
  CRIT=$((CRIT + HEX_N))
else
  echo "✅ Sin hex hardcodeados fuera de tokens."
fi

# ── 2. Valores arbitrarios de Tailwind tipo p-[17px] (crítico — escala mecánica 14) ──
echo ""
echo "── 2. Valores arbitrarios fuera de la escala 4·8·12·16·24·32·48·64 (archivo 14)"
# WHITELIST de la escala canónica del SO: tipografía y CTA (11,12,13,15,17,32,40,52 px)
# y anchos de layout (360,375,420,448 px) NO son críticos. Lo demás sigue siéndolo.
# El filtro se aplica VALOR POR VALOR (una línea con w-[375px] Y p-[19px] sigue siendo crítica).
ARB=$(grep -rnE '\b[a-z-]+-\[[0-9]+(\.[0-9]+)?(px|rem|em)\]' $SRC_DIRS $EXCLUDES --include='*.tsx' --include='*.ts' 2>/dev/null \
      | awk '{ rest = $0; bad = 0
               while (match(rest, /\[[0-9]+(\.[0-9]+)?(px|rem|em)\]/)) {
                 v = substr(rest, RSTART, RLENGTH)
                 if (v !~ /^\[(11|12|13|15|17|32|40|52|360|375|420|448)px\]$/) bad = 1
                 rest = substr(rest, RSTART + RLENGTH) }
               if (bad) print }' || true)
ARB_N=$(printf '%s' "$ARB" | grep -c . || true)
if [ "$ARB_N" -gt 0 ]; then
  echo "❌ $ARB_N valor(es) arbitrario(s) tipo p-[17px]:"
  echo "$ARB" | head -15
  CRIT=$((CRIT + ARB_N))
else
  echo "✅ Sin valores arbitrarios de espaciado/tamaño."
fi

# ── 3. Grises genéricos de Tailwind (aviso — neutros sin temperatura, archivo 16) ──
echo ""
echo "── 3. Grises genéricos text/bg-gray/zinc/slate/neutral (el SO pide neutros con temperatura — archivo 16)"
GRAY=$(grep -rnE '(text|bg)-(gray|zinc|slate|neutral)-' $SRC_DIRS $EXCLUDES --include='*.tsx' --include='*.ts' 2>/dev/null || true)
GRAY_N=$(printf '%s' "$GRAY" | grep -c . || true)
if [ "$GRAY_N" -gt 0 ]; then
  echo "⚠️ $GRAY_N uso(s) de grises genéricos (text/bg-gray/zinc/slate/neutral):"
  echo "$GRAY" | head -10
  WARN=$((WARN + GRAY_N))
else
  echo "✅ Sin grises genéricos de Tailwind."
fi

# ── 4. Inter/Roboto detectadas (aviso — el rol decide: marca/display prohibida, body neutro permitido) ──
echo ""
echo "── 4. Inter/Roboto como fuente (verificar el ROL — archivos 14/16/29)"
FONT=$(grep -rniE "(font-family[^;]*|fontFamily[^,}]*|next/font/google[^\"']*[\"'])(Inter|Roboto)\b|[\"'](Inter|Roboto)[\"']" \
       $SRC_DIRS $EXCLUDES --include='*.tsx' --include='*.ts' --include='*.css' 2>/dev/null || true)
FONT_N=$(printf '%s' "$FONT" | grep -c . || true)
if [ "$FONT_N" -gt 0 ]; then
  echo "⚠️ $FONT_N referencia(s) a Inter/Roboto — Inter/Roboto como fuente de MARCA/display está"
  echo "   prohibida; como body neutro Inter/Inter Tight está permitida (29) — verificar el rol manualmente:"
  echo "$FONT" | head -10
  WARN=$((WARN + FONT_N))
else
  echo "✅ Sin Inter/Roboto."
fi

# ── 5. console.log (aviso; crítico si parece dato sensible) ──
echo ""
echo "── 5. console.log en el código (limpiar antes de vender — archivo 09)"
LOGS=$(grep -rn 'console\.log' $SRC_DIRS $EXCLUDES --include='*.tsx' --include='*.ts' 2>/dev/null || true)
LOGS_N=$(printf '%s' "$LOGS" | grep -c . || true)
if [ "$LOGS_N" -gt 0 ]; then
  echo "⚠️ $LOGS_N console.log:"
  echo "$LOGS" | head -10
  WARN=$((WARN + LOGS_N))
  SENSITIVE=$(printf '%s' "$LOGS" | grep -iE 'token|password|secret|key|email' || true)
  if [ -n "$SENSITIVE" ]; then
    echo "❌ Algunos parecen loguear datos sensibles:"
    echo "$SENSITIVE" | head -5
    CRIT=$((CRIT + 1))
  fi
else
  echo "✅ Sin console.log."
fi

# ── Resumen ──
echo ""
echo "════════════════════════════════════════════════════════"
echo " RESUMEN: $CRIT hallazgo(s) CRÍTICO(s) · $WARN aviso(s)"
echo "════════════════════════════════════════════════════════"
if [ "$CRIT" -gt 0 ]; then
  echo "❌ NO pasa la auditoría mecánica. Corrige los críticos (hex→tokens, escala de espaciado)"
  echo "   y vuelve a correr. Después aplica la rúbrica /40 de RUBRICAS-DE-PANTALLA.md."
  exit 1
fi
if [ "$WARN" -gt 0 ]; then
  echo "⚠️ Pasa con avisos: revisa los grises genéricos, el rol de Inter/Roboto y los console.log restantes."
else
  echo "✅ Limpio. Recuerda: esto es lo mecánico — la rúbrica visual /40 y el gate /20 de craft (RUBRICAS-DE-PANTALLA.md) se puntúan MIRANDO la app."
fi
exit 0
