#!/usr/bin/env bash
# release.sh — verificaciones de reempaque del SO. Correr desde la raíz de so/ (o desde donde sea:
# el script se ubica solo). Exit != 0 si algo falla.
set -u

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT" || exit 1

PROMPTS_DIST="${1:-$ROOT/../prompts-complementarios/Prompts complementarios}"
FAIL=0

echo "════════════════════════════════════════════════"
echo " RELEASE CHECK del SO — raíz: $ROOT"
echo "════════════════════════════════════════════════"

echo ""
echo "── (0) Auditoria estructural"
if ! bash scripts/audit-so.sh; then
  FAIL=1
fi

# ── (a) Verificar CLAUDE.md ↔ AGENTS.md (verificación PURA — un verificador no muta el repo) ──
echo ""
echo "── (a) CLAUDE.md ↔ AGENTS.md"
if [ ! -f "CLAUDE.md" ]; then
  echo "❌ No existe CLAUDE.md en $ROOT — no se puede reempacar."
  exit 1
fi
if [ ! -f "AGENTS.md" ]; then
  echo "FAIL: no existe AGENTS.md — créalo como copia exacta de CLAUDE.md y reintenta."
  exit 1
fi
if cmp -s CLAUDE.md AGENTS.md; then
  echo "✅ CLAUDE.md y AGENTS.md son idénticos."
else
  echo "FAIL: CLAUDE.md y AGENTS.md divergen — sincroniza a mano (decide cuál manda) y reintenta."
  exit 1
fi

# ── (b) Diff de PROMPT-*.txt contra la copia distribuible ──────────────────
echo ""
echo "── (b) PROMPT-*.txt vs copia distribuible"
if [ ! -d "$PROMPTS_DIST" ]; then
  echo "❌ No existe la carpeta de prompts distribuibles: $PROMPTS_DIST"
  echo "   Pásala como argumento: scripts/release.sh /ruta/a/'Prompts complementarios'"
  FAIL=1
else
  DIFFS=0
  for f in docs/sistema/PROMPT-*.txt; do
    base=$(basename "$f")
    [ "$base" = "PROMPT-AUDITAR-SO.txt" ] && continue  # interno del mantenedor, no se distribuye
    if [ ! -f "$PROMPTS_DIST/$base" ]; then
      echo "❌ Falta en la copia distribuible: $base"
      DIFFS=$((DIFFS + 1))
      continue
    fi
    if ! diff -q "$f" "$PROMPTS_DIST/$base" >/dev/null 2>&1; then
      echo "❌ DIFIERE: $base (docs/sistema vs distribuible):"
      diff "$f" "$PROMPTS_DIST/$base" | head -10
      DIFFS=$((DIFFS + 1))
    fi
  done
  if [ "$DIFFS" -eq 0 ]; then
    echo "✅ Todos los PROMPT-*.txt coinciden con la copia distribuible."
  else
    echo "→ $DIFFS prompt(s) desincronizado(s). Sincroniza antes de reempacar."
    FAIL=1
  fi
fi

# ── (c) Conteos estancados en docs/sistema/*.md ────────────────────────────
# Patrones según PLANTILLA-SELF-CHECK.md: "(^|[^0-9-])6 sesiones" no matchea rangos
# legítimos tipo "4-6 sesiones". Se excluye la propia plantilla (cita los patrones como doc).
echo ""
echo "── (c) Conteos estancados en docs/sistema/*.md"
STALE=0
for pattern in '01-4[0-7]' '(^|[^0-9-])6 sesiones' '\[1-7\]' '00-59'; do
  HITS=$(grep -rnE "$pattern" docs/sistema/*.md 2>/dev/null | grep -v 'PLANTILLA-SELF-CHECK.md' || true)
  if [ -n "$HITS" ]; then
    echo "❌ Posible conteo estancado (patrón '$pattern'):"
    echo "$HITS" | head -10
    STALE=1
  fi
done
if [ "$STALE" -eq 0 ]; then
  echo "✅ Sin conteos estancados (01-4x, '6 sesiones', [1-7], 00-59)."
else
  echo "→ Revisa esas referencias: los rangos/conteos deben reflejar el estado actual del SO."
  FAIL=1
fi

# ── (d) INSTRUCCIONES.md y REFERENCIA-RAPIDA.md remiten a INICIO.md ────────
echo ""
echo "── (d) Referencias a INICIO.md"
for doc in docs/sistema/INSTRUCCIONES.md docs/sistema/REFERENCIA-RAPIDA.md; do
  if [ ! -f "$doc" ]; then
    echo "❌ No existe $doc"
    FAIL=1
  elif ! grep -q "INICIO.md" "$doc"; then
    echo "❌ $doc NO menciona INICIO.md (debe remitir a él como fuente única del plan de sesiones)."
    FAIL=1
  else
    echo "✅ $doc menciona INICIO.md."
  fi
done

# ── Resumen ─────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════"
if [ "$FAIL" -ne 0 ]; then
  echo "❌ RELEASE CHECK FALLÓ — corrige lo de arriba antes de reempacar el SO."
  exit 1
fi
echo "✅ RELEASE CHECK OK — el SO está listo para reempacar."
exit 0
