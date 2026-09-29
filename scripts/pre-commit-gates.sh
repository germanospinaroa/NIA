#!/usr/bin/env bash
# pre-commit-gates.sh — versión pre-commit de los gates deterministas de evidencia del SO
# (los mismos a-d del Stop hook .claude/hooks/pre-stop.sh, SIN tsc):
#   a) VEREDICTO       — pantalla del dinero declarada construida en ESTADO.md exige
#                        docs/revisiones/<slug>-veredicto.md con "Veredicto: LISTA",
#                        ≥36/40 y ≥16/20, y ningún .tsx más nuevo que el veredicto.
#   b) COMPARATIVA     — FICHA-ARTE.md exige direcciones-abc.html (árbol o historia git).
#   c) COPY MARCADO    — landing construida exige docs/copy/ con al menos un .md.
#   d) GARANTÍA        — copy con garantía exige FICHA-MERCADO.md legible con
#                        "Prueba elegida: N" y "Garantía elegida: M" y M>N (fail-closed).
#
# INSTALACIÓN (una sola vez, en la raíz del proyecto — elige UNA de las dos):
#   A) Recomendada (versionable en el repo):
#        mkdir -p .githooks
#        cp scripts/pre-commit-gates.sh .githooks/pre-commit
#        chmod +x .githooks/pre-commit
#        git config core.hooksPath .githooks
#   B) Directa (solo esta copia local):
#        cp scripts/pre-commit-gates.sh .git/hooks/pre-commit
#        chmod +x .git/hooks/pre-commit
#
# Válvula de escape (misma doctrina que el Stop hook): una violación documentada
# (grepeable) en la sección "Problemas conocidos" de ESTADO.md se reporta como aviso
# pero NO bloquea el commit. Sin documentar → bloquea (exit 2; git aborta el commit).
# Compatible con bash 3.2 (macOS). Se ejecuta desde la raíz del repo (git lo garantiza).

VIOL_KEYS=()
VIOL_MSGS=()
add_viol() {
  VIOL_KEYS[${#VIOL_KEYS[@]}]="$1"
  VIOL_MSGS[${#VIOL_MSGS[@]}]="$2"
}

# ── a) GATE DE VEREDICTO ────────────────────────────────────────────────────
# Detección (aproximación DOCUMENTADA): una pantalla del dinero se considera
# "declarada construida" si alguna línea de ESTADO.md contiene su nombre
# (landing | onboarding | paywall | pantalla principal) a ≤30 caracteres de una
# palabra de estado (construid- | verificad- | complet- | lista/o), en cualquier
# orden, y la línea no contiene "pendiente"/"no iniciad-".
gate_veredicto() {
  [ -f "ESTADO.md" ] || return 0
  for PAR in "landing|landing" "onboarding|onboarding" "paywall|paywall" "pantalla principal|pantalla-principal"; do
    NOMBRE="${PAR%%|*}"
    SLUG="${PAR##*|}"
    LINEA=$(LC_ALL=C grep -iE "(${NOMBRE}).{0,30}(construid|verificad|complet|list[ao])|(construid|verificad|complet|list[ao]).{0,30}(${NOMBRE})" ESTADO.md 2>/dev/null \
      | LC_ALL=C grep -ivE "pendiente|no iniciad|por construir" | head -1)
    [ -n "$LINEA" ] || continue

    VFILE=""
    if [ -f "docs/revisiones/${SLUG}-veredicto.md" ]; then
      VFILE="docs/revisiones/${SLUG}-veredicto.md"
    else
      for F in docs/revisiones/*"${SLUG}"*-veredicto.md; do
        [ -f "$F" ] && { VFILE="$F"; break; }
      done
    fi
    if [ -z "$VFILE" ]; then
      add_viol "veredicto:${SLUG}" "ESTADO.md declara la pantalla '${SLUG}' como construida/lista pero NO existe su veredicto: falta docs/revisiones/${SLUG}-veredicto.md con 'Veredicto: LISTA', 'Usabilidad: NN/40' (≥36) y 'Craft: NN/20' (≥16). Lo escribe EL SUBAGENTE revisor-visual (nunca quien construyó), junto al screenshot docs/revisiones/${SLUG}-375.png. La prosa ('revisado en preview') NO cuenta como evidencia."
      continue
    fi

    if ! grep -qE '^Veredicto:[[:space:]]*LISTA' "$VFILE"; then
      add_viol "veredicto:${SLUG}" "El veredicto ${VFILE} NO dice 'Veredicto: LISTA' (o dice NO LISTA). La pantalla '${SLUG}' no puede declararse construida/lista en ESTADO.md: corrige los defectos del veredicto y re-lanza el revisor-visual."
      continue
    fi
    USAB=$(sed -nE 's|^Usabilidad:[[:space:]]*([0-9]+)/40.*|\1|p' "$VFILE" | head -1)
    CRAFT=$(sed -nE 's|^Craft:[[:space:]]*([0-9]+)/20.*|\1|p' "$VFILE" | head -1)
    if [ -z "$USAB" ] || [ -z "$CRAFT" ]; then
      add_viol "veredicto:${SLUG}" "El veredicto ${VFILE} no tiene puntajes legibles: se exigen las líneas canónicas 'Usabilidad: NN/40' y 'Craft: NN/20' (las escribe el revisor-visual). Sin puntajes parseables el gate es fail-closed."
      continue
    fi
    if [ "$USAB" -lt 36 ] || [ "$CRAFT" -lt 16 ]; then
      add_viol "veredicto:${SLUG}" "La pantalla '${SLUG}' no pasa el gate doble: ${USAB}/40 y ${CRAFT}/20 (se exige ≥36/40 Y ≥16/20). Corrige los TOP DEFECTOS del veredicto ${VFILE} y re-lanza el revisor-visual."
      continue
    fi

    # Frescura (aproximación DOCUMENTADA: sin mapeo fiable pantalla→archivo, ningún
    # .tsx de app/, components/ o src/ puede ser más nuevo que el veredicto).
    NUEVOS=$(find app components src -name "*.tsx" -newer "$VFILE" 2>/dev/null | head -3 | tr '\n' ' ')
    if [ -n "$NUEVOS" ]; then
      add_viol "veredicto:${SLUG}" "Veredicto CADUCADO para '${SLUG}': hay código .tsx más nuevo que ${VFILE} (ej.: ${NUEVOS}). Un veredicto más viejo que el código de su pantalla no vale: re-renderiza a 375px y re-lanza el revisor-visual."
    fi
  done
}

# ── b) GATE DE COMPARATIVA ──────────────────────────────────────────────────
gate_comparativa() {
  [ -f "FICHA-ARTE.md" ] || return 0
  [ -f "direcciones-abc.html" ] && return 0
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git log --all --diff-filter=A --name-only --pretty=format: 2>/dev/null | grep -q "direcciones-abc\.html" && return 0
  fi
  add_viol "direcciones-abc" "Existe FICHA-ARTE.md pero direcciones-abc.html está AUSENTE (ni en el árbol ni en la historia de git): la identidad se eligió sin la comparativa A/B/C renderizada que exige el protocolo del 54. Genera direcciones-abc.html en la raíz del proyecto + el screenshot docs/revisiones/direcciones-abc.png (o recupera el que se usó)."
}

# ── c) GATE DE COPY MARCADO ─────────────────────────────────────────────────
gate_copy_marcado() {
  [ -d "app" ] || return 0
  DECLARADA=$(LC_ALL=C grep -iE "(landing).{0,30}(construid|verificad|complet|list[ao])|(construid|verificad|complet|list[ao]).{0,30}(landing)" ESTADO.md 2>/dev/null \
    | LC_ALL=C grep -ivE "pendiente|no iniciad|por construir" | head -1)
  VENTA=$(grep -rlEi "días gratis|dias gratis|prueba gratis|empezar mi prueba|paywall" \
    --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" \
    app components src 2>/dev/null | head -1)
  [ -n "$DECLARADA" ] || [ -n "$VENTA" ] || return 0
  ls docs/copy/*.md >/dev/null 2>&1 && return 0
  add_viol "docs/copy" "Hay pantalla de venta construida (app/ con landing) pero docs/copy/ está AUSENTE (no existe o no tiene ningún .md). El copy marcado es el INPUT de construcción: escribe docs/copy/<pantalla>.md con [acento]...[/acento] y [b]...[b] ANTES de construir/retocar la pantalla de venta."
}

# ── d) GARANTÍA FAIL-CLOSED ─────────────────────────────────────────────────
gate_garantia() {
  MENCIONA=$(grep -rlEi "garantía|garantia" \
    --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" \
    app components src 2>/dev/null | head -1)
  [ -n "$MENCIONA" ] || return 0
  if [ ! -f "FICHA-MERCADO.md" ]; then
    add_viol "garantia" "El copy menciona garantía (ej.: ${MENCIONA}) pero NO existe FICHA-MERCADO.md. Los plazos tienen que estar VERIFICADOS contra la pasarela real (18-VENTA-HOTMART.md), no supuestos. Este gate es FAIL-CLOSED: garantía sin FICHA-MERCADO con 'Prueba elegida: N' y 'Garantía elegida: M' (M>N) bloquea SIEMPRE. Créala con PLANTILLA-FICHA-MERCADO.md o quita la garantía del copy."
    return 0
  fi
  PRUEBA=$(LC_ALL=C sed -nE 's|.*Prueba elegida:[[:space:]]*([0-9]+).*|\1|p' FICHA-MERCADO.md 2>/dev/null | head -1)
  GARANTIA=$(LC_ALL=C sed -nE 's|.*Garant[^ ]*a elegida:[[:space:]]*([0-9]+).*|\1|p' FICHA-MERCADO.md 2>/dev/null | head -1)
  if [ -z "$PRUEBA" ] || [ -z "$GARANTIA" ]; then
    add_viol "garantia" "El copy menciona garantía (ej.: ${MENCIONA}) pero FICHA-MERCADO.md no tiene los dos plazos legibles ('Prueba elegida: N' y 'Garantía elegida: M'). Este gate es FAIL-CLOSED: sin los plazos parseables no hay cobertura verificada → se bloquea. Completa la ficha o quita la garantía del copy."
    return 0
  fi
  if [ "$GARANTIA" -le "$PRUEBA" ]; then
    add_viol "garantia" "REGLA DURA INCUMPLIDA: garantía (${GARANTIA} días) NO supera la prueba (${PRUEBA} días). Durante la prueba no hay nada que devolver, y el día del primer cobro la garantía ya venció: la cobertura real es CERO. O subes el plazo en el panel de la pasarela, o QUITAS la garantía del copy (18-VENTA-HOTMART.md)."
  fi
}

# ── Válvula de escape: ¿documentada en "Problemas conocidos" de ESTADO.md? ──
SECCION_PROBLEMAS=$(awk '/^## Problemas conocidos/{f=1;next} /^## /{f=0} f' ESTADO.md 2>/dev/null)
documentada() {
  case "$1" in
    veredicto:*)
      SL="${1#veredicto:}"
      printf '%s\n' "$SECCION_PROBLEMAS" | grep -i "veredicto" | grep -qi "$SL"
      ;;
    direcciones-abc) printf '%s\n' "$SECCION_PROBLEMAS" | grep -qi "direcciones-abc" ;;
    docs/copy)       printf '%s\n' "$SECCION_PROBLEMAS" | grep -qi "docs/copy" ;;
    garantia)        printf '%s\n' "$SECCION_PROBLEMAS" | LC_ALL=C grep -qiE "garant|FICHA-MERCADO" ;;
    *) return 1 ;;
  esac
}

gate_veredicto
gate_comparativa
gate_copy_marcado
gate_garantia

N=${#VIOL_KEYS[@]}
[ "$N" -eq 0 ] && exit 0

BLOQUEA=0
i=0
while [ "$i" -lt "$N" ]; do
  if documentada "${VIOL_KEYS[$i]}"; then
    printf '⚠️ aviso (documentada en Problemas conocidos, no bloquea): [%s] %s\n' "${VIOL_KEYS[$i]}" "${VIOL_MSGS[$i]}" >&2
  else
    if [ "$BLOQUEA" -eq 0 ]; then
      echo "⛔ GATES DE EVIDENCIA (pre-commit): violaciones sin resolver ni documentar — commit bloqueado:" >&2
      BLOQUEA=1
    fi
    printf '\n• [%s] %s\n' "${VIOL_KEYS[$i]}" "${VIOL_MSGS[$i]}" >&2
  fi
  i=$((i + 1))
done

if [ "$BLOQUEA" -eq 1 ]; then
  echo "" >&2
  echo "→ Resuelve cada punto, o documéntalo (grepeable, con su palabra clave) en la sección" >&2
  echo "  'Problemas conocidos' de ESTADO.md. (Escape de emergencia: git commit --no-verify.)" >&2
  exit 2
fi
exit 0
