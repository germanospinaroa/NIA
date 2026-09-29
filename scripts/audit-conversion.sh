#!/usr/bin/env bash
# audit-conversion.sh — PILAR 2: linter de AUSENCIAS de calidad en pantallas de conversión.
# Uso: bash scripts/audit-conversion.sh [/ruta/al/proyecto]   (default: .)
#
# Audita las superficies de conversión (landing/onboarding/paywall + app/page.tsx raíz)
# contra la doctrina de 52-COPY-VISUALES-CONVERSION.md y 55-DISENO-DE-LANDING.md:
# presupuesto de copy, énfasis, hairlines, icon chips, emojis, radios vs FICHA-ARTE,
# profundidad de fondo, sticky CTA, animaciones baseline, voz vs FICHA-AVATAR,
# contraste WCAG de tokens, stack pineado (51), orden de planes, comparativa A/B/C
# y copy marcado.
#
# El análisis de JSX/CSS vive en scripts/lib-conversion.mjs (solo built-ins de Node).
# Exit != 0 SOLO si hay hallazgos críticos. Si un check no puede evaluarse
# (sin package.json, sin fichas, sin CSS…), degrada con aviso — nunca crashea.

set -u

PROJECT="${1:-.}"
if [ ! -d "$PROJECT" ]; then
  echo "❌ No existe el directorio: $PROJECT"
  echo "Uso: bash scripts/audit-conversion.sh /ruta/al/proyecto"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LIB="$SCRIPT_DIR/lib-conversion.mjs"

echo "════════════════════════════════════════════════════════"
echo " AUDITORÍA DE CONVERSIÓN — $PROJECT"
echo " (caza AUSENCIAS en landing/onboarding/paywall — 52/55;"
echo "  complementa audit-diseno.sh, NO reemplaza la rúbrica"
echo "  de copy /20 de 52 ni la visual /40 del revisor)"
echo "════════════════════════════════════════════════════════"

if [ ! -f "$LIB" ]; then
  echo ""
  echo "❌ Falta $LIB — el helper Node debe viajar junto a este script."
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "⚠️ Node.js no está disponible en el PATH y esta auditoría lo necesita para"
  echo "   analizar JSX/CSS. El stack del SO lo incluye siempre (51) — instala Node"
  echo "   y vuelve a correr. No se evaluó ningún check (degradación sin bloqueo)."
  exit 0
fi

# ── delega el análisis al helper Node y captura la línea centinela ──
OUTPUT="$(node "$LIB" "$PROJECT" 2>&1)"
STATUS=$?

printf '%s\n' "$OUTPUT" | grep -v '^##RESUMEN-AUDIT-CONVERSION##' || true

SENT="$(printf '%s\n' "$OUTPUT" | grep '^##RESUMEN-AUDIT-CONVERSION##' | tail -1 || true)"

if [ "$STATUS" -ne 0 ] || [ -z "$SENT" ]; then
  echo ""
  echo "⚠️ El analizador Node terminó con error (status $STATUS) — auditoría incompleta."
  echo "   No se bloquea el cierre por un fallo del tooling, pero revisa la salida de arriba"
  echo "   y repórtalo como bug del SO."
  exit 0
fi

CRIT="$(printf '%s' "$SENT" | sed -n 's/.*CRIT=\([0-9][0-9]*\).*/\1/p')"
WARN="$(printf '%s' "$SENT" | sed -n 's/.*WARN=\([0-9][0-9]*\).*/\1/p')"
SUP="$(printf '%s' "$SENT" | sed -n 's/.*SUP=\([0-9][0-9]*\).*/\1/p')"
CRIT="${CRIT:-0}"
WARN="${WARN:-0}"
SUP="${SUP:-0}"

echo ""
echo "════════════════════════════════════════════════════════"
echo " RESUMEN: $CRIT hallazgo(s) CRÍTICO(s) · $WARN aviso(s) · $SUP superficie(s) de conversión"
echo "════════════════════════════════════════════════════════"

if [ "$CRIT" -gt 0 ]; then
  echo "❌ NO pasa la auditoría de conversión. Corrige los críticos (presupuesto de copy,"
  echo "   énfasis, chips SVG, hairlines, profundidad, sticky CTA, animaciones, voz,"
  echo "   contraste, stack) y vuelve a correr. Después vienen las rúbricas del revisor:"
  echo "   copy /20 (52) y visual /40 + craft /20 (RUBRICAS-DE-PANTALLA.md)."
  exit 1
fi

if [ "$WARN" -gt 0 ]; then
  echo "⚠️ Pasa con avisos: revísalos antes de declarar la pantalla lista — varios son"
  echo "   límites doctrinales (radios de la ficha, orden de planes, copy sin marcar)."
else
  echo "✅ Limpio. Recuerda: este linter caza AUSENCIAS mecánicas — el veredicto visual /40,"
  echo "   el craft /20 y el copy /20 siguen siendo del revisor independiente."
fi
exit 0
