#!/usr/bin/env bash
# audit-so.sh — auditoria estructural reproducible del paquete antes de distribuirlo.
set -u

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT" || exit 1

FAIL=0
pass() { printf 'OK  %s\n' "$1"; }
fail() { printf 'ERR %s\n' "$1" >&2; FAIL=1; }

command -v node >/dev/null 2>&1 || { fail "Node.js no esta disponible"; exit 1; }
command -v rg >/dev/null 2>&1 || { echo "FAIL: ripgrep (rg) es requerido para los checks de contenido" >&2; exit 1; }

if cmp -s CLAUDE.md AGENTS.md; then
  pass "CLAUDE.md y AGENTS.md son identicos"
else
  fail "CLAUDE.md y AGENTS.md divergen"
fi

if node -e 'JSON.parse(require("fs").readFileSync(".claude/settings.json", "utf8")); JSON.parse(require("fs").readFileSync(".mcp.json", "utf8"));'; then
  pass "JSON de configuracion valido"
else
  fail "JSON de configuracion invalido"
fi

SHELL_FAIL=0
while IFS= read -r file; do
  bash -n "$file" || SHELL_FAIL=1
done < <(find .claude/hooks scripts -type f -name '*.sh' | sort)
[ "$SHELL_FAIL" -eq 0 ] && pass "Scripts shell validos" || fail "Hay scripts shell invalidos"

NODE_AUDIT=$(node <<'NODE'
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const docs = path.join(root, 'docs', 'sistema');
const files = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full); else files.push(full);
  }
}
walk(root);
const textFiles = files.filter(f => /\.(md|txt)$/.test(f));
const existing = new Set(files.map(f => path.basename(f)));
const missingRefs = [];
const generatedRefs = new Set([
  'ESTADO.md', 'FICHA-ARTE.md', 'FICHA-AVATAR.md', 'FICHA-MERCADO.md', 'FICHA-MODELO.md', 'SECURITY.md',
    'MANUAL-DEL-DUEÑO.md', 'SKILL.md', 'robots.txt',
    'CLAIMS-LEDGER.md', 'PAYMENT-CERTIFICATION.md', 'ECONOMICS-CERTIFICATION.md',
    'PRIVACY-DATA-MAP.md', 'RELEASE-MANIFEST.json', 'PUBLICATION-CERTIFICATE.md',
]);
for (const file of textFiles) {
  const relativeFile = path.relative(root, file);
  if (relativeFile.startsWith('CHANGELOG')) continue;
  const text = fs.readFileSync(file, 'utf8');
  const tick = String.fromCharCode(96);
  const refPattern = new RegExp(tick + '([^' + tick + '\\n]+\\.(?:md|txt))' + tick, 'g');
  for (const match of text.matchAll(refPattern)) {
    const base = path.basename(match[1]);
    if (generatedRefs.has(base) || base.includes('*')) continue;
    if (base.includes('<') || base.includes('>')) continue; // rutas-plantilla con placeholder (<slug>, <pantalla>)
    if (/^docs\/(revisiones|copy)\//.test(match[1])) continue; // convenciones del PROYECTO destino (evidencia v6), no archivos del SO
    if (!existing.has(base)) missingRefs.push(relativeFile + ' -> ' + match[1]);
  }
}

const fenceErrors = [];
for (const file of textFiles.filter(f => f.endsWith('.md'))) {
  const fence = String.fromCharCode(96).repeat(3);
  const count = fs.readFileSync(file, 'utf8').split('\n').filter(line => line.startsWith(fence)).length;
  if (count % 2) fenceErrors.push(path.relative(root, file));
}

const numbered = fs.readdirSync(docs)
  .filter(n => /^(?:\d{2}|02[BC])-.*\.md$/.test(n));
const routing = fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8') +
  fs.readFileSync(path.join(docs, 'INSTRUCCIONES.md'), 'utf8');
const unrouted = numbered.filter(n => !routing.includes(n));

const commands = fs.readdirSync(path.join(root, '.claude', 'commands')).filter(n => n.endsWith('.md'));
const mappings = {
  'conversion.md': 'PROMPT-CONVERSION.txt',
  'landing.md': 'PROMPT-LANDING.txt',
  'onboarding-paywall.md': 'PROMPT-MEJORA-ONBOARDING-PAYWALL.txt',
  'analitica.md': 'PROMPT-ANALITICA.txt',
  'backoffice.md': 'PROMPT-BACKOFFICE.txt',
  'integridad-lanzamiento.md': 'PROMPT-INTEGRIDAD-LANZAMIENTO.txt',
  'deploy.md': 'PROMPT-DEPLOY.txt',
};
const commandErrors = Object.entries(mappings).filter(([command, prompt]) =>
  !commands.includes(command) || !fs.existsSync(path.join(docs, prompt))
).map(([command, prompt]) => command + ' -> ' + prompt);

for (const [label, values] of [
  ['REF', [...new Set(missingRefs)]],
  ['FENCE', fenceErrors],
  ['ROUTE', unrouted],
  ['COMMAND', commandErrors],
]) {
  for (const value of values) process.stdout.write(label + '\t' + value + '\n');
}
NODE
)

for kind in REF FENCE ROUTE COMMAND; do
  HITS=$(printf '%s\n' "$NODE_AUDIT" | awk -F '\t' -v k="$kind" '$1 == k {print $2}')
  if [ -n "$HITS" ]; then
    fail "$kind: $HITS"
  else
    pass "$kind sin hallazgos"
  fi
done

if rg -n 'python3|python -' .claude/hooks >/dev/null 2>&1; then
  fail "Los hooks aun dependen de Python"
else
  pass "Hooks sin dependencia silenciosa de Python"
fi

if rg -n 'paywall_visto[^\n]*(se renderiza|al montar)|plan_actualizado / paywall_visto|pantalla de transici[oó]n[^\n]*oblig' \
  docs/sistema/PROMPT-*.txt .claude/commands >/dev/null 2>&1; then
  fail "Un prompt/comando conserva una regla de conversion obsoleta"
else
  pass "Prompts sin reglas de conversion obsoletas"
fi

if rg -n 'create policy "own_(progress|achievements)"[\s\S]*for all' \
  docs/sistema/24-GAMIFICACION.md >/dev/null 2>&1; then
  fail "Gamificacion conserva escritura directa sobre estado de valor"
else
  pass "Gamificacion sin policy for-all de recompensas"
fi

if rg -n 'la mayor[ií]a se pueden ignorar en MVP' docs/sistema/08-DEPLOY.md >/dev/null 2>&1; then
  fail "Deploy aun permite ignorar warnings por defecto"
else
  pass "Deploy exige policy explicita de warnings"
fi

if rg -n -i '(p[ií]deme|p[ií]demelo|p[aá]same|env[ií]ame|comp[aá]rteme|pega aqu[ií]).{0,100}(api.?key|clave|token|hottok|password|cookie|secret|connection string)' \
  docs/sistema/PROMPT-*.txt .claude/commands >/dev/null 2>&1; then
  fail "Un prompt/comando solicita un valor secreto por chat"
else
  pass "Prompts/comandos no solicitan valores secretos por chat"
fi

REQUIRED_INTEGRITY=(
  'CLAIMS-LEDGER.md'
  'PAYMENT-CERTIFICATION.md'
  'RELEASE-MANIFEST.json'
  'provider + transaction_id + economic_kind'
  'unknown_retryable'
  'clean-room'
  'action_id'
  'checkout_abandonado'
  '62-PUBLICACION-SEGURA-Y-CONTINUA.md'
  'PUBLICATION-CERTIFICATE.md'
  'Connected Git Repository'
  'automatic_updates_verified'
  'Protocolo Cero Secretos en Chat'
  'supabase db push --dry-run'
  'segunda publicación automática'
)
for term in "${REQUIRED_INTEGRITY[@]}"; do
  if rg -F "$term" docs/sistema CLAUDE.md .claude/commands >/dev/null 2>&1; then
    pass "Integridad presente: $term"
  else
    fail "Falta control de integridad: $term"
  fi
done

# ── PRESENCIA DE DOCTRINA (frases que DEBEN existir — el inverso del guardián) ─
# La pregunta de referencia + la ruta de réplica fiel (doctrina ago-2026): si estas frases
# desaparecen de sus dueños, el flujo vuelve a proponer diseño sin preguntar por capturas.
if rg -F "LA PREGUNTA DE REFERENCIA" docs/sistema/54-BANCO-DE-DIRECCIONES.md docs/sistema/INICIO.md CLAUDE.md >/dev/null 2>&1; then
  pass "Doctrina presente: LA PREGUNTA DE REFERENCIA (54/INICIO/CLAUDE)"
else
  fail "Falta doctrina: LA PREGUNTA DE REFERENCIA"
fi
if rg -F "replica-fiel.html" docs/sistema/54-BANCO-DE-DIRECCIONES.md .claude/hooks/pre-stop.sh >/dev/null 2>&1; then
  pass "Doctrina presente: replica-fiel.html (54 + hook pre-stop)"
else
  fail "Falta doctrina: replica-fiel.html"
fi
# El glosario del mensaje al usuario (regla 1F): traducciones cerradas de la jerga.
if rg -F "EL GLOSARIO DEL MENSAJE AL USUARIO" CLAUDE.md >/dev/null 2>&1 \
   && rg -F "Palabras que quizá veas por aquí" docs/sistema/GUIA-DE-LOS-PROMPTS.md >/dev/null 2>&1; then
  pass "Doctrina presente: GLOSARIO 1F (CLAUDE) + mini-glosario del alumno (GUIA)"
else
  fail "Falta doctrina: glosario del mensaje al usuario"
fi
# El tour de la app (54): la confirmación del estilo viendo la app por dentro, con su gate.
if rg -F "EL TOUR DE LA APP" docs/sistema/54-BANCO-DE-DIRECCIONES.md CLAUDE.md >/dev/null 2>&1 \
   && grep -q 'vista-previa-app' .claude/hooks/pre-stop.sh; then
  pass "Doctrina presente: EL TOUR DE LA APP (54/CLAUDE) + gate vista-previa en hook"
else
  fail "Falta doctrina: tour de la app / gate vista-previa"
fi
# El ritmo del plan económico (12) + la nota simple del SETUP: doctrina de presupuesto.
if rg -F "EL RITMO DEL PLAN DE 20" docs/sistema/12-FLUJO-AGENTICO.md >/dev/null 2>&1 \
   && rg -F "¿Te alcanza tu plan?" docs/sistema/SETUP-CLAUDE-CODE.md >/dev/null 2>&1; then
  pass "Doctrina presente: RITMO DEL PLAN DE 20 (12) + nota de plan en SETUP"
else
  fail "Falta doctrina: ritmo del plan de 20 / nota de plan en SETUP"
fi
# El kit de la comparativa A/B/C: marcador de origen (54 Regla Dura #0) presente en la
# plantilla, verificado por el hook, y la regla declarada en el 54.
if grep -q 'data-kit="abc-v2"' plantillas-codigo/direcciones-abc/plantilla.html 2>/dev/null \
   && grep -q 'data-kit="abc-v2"' .claude/hooks/pre-stop.sh \
   && rg -F 'REGLA DURA #0' docs/sistema/54-BANCO-DE-DIRECCIONES.md >/dev/null 2>&1; then
  pass "Doctrina presente: kit A/B/C obligatorio con marcador abc-v2 (plantilla + hook + 54)"
else
  fail "Falta doctrina: marcador abc-v2 del kit A/B/C (plantilla/hook/54)"
fi
# Los 3 suelos del precio (02C) + el chequeo de precio para ads (34): la regla de decisión
# del precio inicial y el gate económico previo a la primera campaña pagada.
if rg -F "LOS 3 SUELOS" docs/sistema/02C-PRICING-Y-MODELO-DE-NEGOCIO.md CLAUDE.md >/dev/null 2>&1 \
   && rg -F "CHEQUEO DE PRECIO PARA ADS" docs/sistema/34-ADQUISICION-Y-TRAFICO.md docs/sistema/02C-PRICING-Y-MODELO-DE-NEGOCIO.md >/dev/null 2>&1; then
  pass "Doctrina presente: LOS 3 SUELOS DEL PRECIO (02C/CLAUDE) + CHEQUEO DE PRECIO PARA ADS (34)"
else
  fail "Falta doctrina: los 3 suelos del precio / chequeo de precio para ads"
fi
# El formato visual de preguntas de opciones (regla 1E): emoji + negrilla + explicación breve.
if rg -F "TODA PREGUNTA DE OPCIONES SE FORMATEA VISUAL" CLAUDE.md >/dev/null 2>&1 \
   && rg -F "FORMATO VISUAL" docs/sistema/INICIO.md docs/sistema/54-BANCO-DE-DIRECCIONES.md >/dev/null 2>&1; then
  pass "Doctrina presente: FORMATO VISUAL de preguntas (CLAUDE 1E + INICIO + 54)"
else
  fail "Falta doctrina: FORMATO VISUAL de preguntas de opciones"
fi

# ── GUARDIÁN SEMÁNTICO DE DOCTRINA ──────────────────────────────────────────
# REGLA DEL MANTENEDOR: todo cambio de doctrina entra con su grep aquí.
# Cada check busca la frase de la doctrina DEROGADA en docs/sistema/*.md + CLAUDE.md; si aparece
# fuera de su allowlist, el paquete conserva doctrina vieja y el audit FALLA nombrando el archivo.
# PLANTILLA-SELF-CHECK.md se excluye SIEMPRE: cita los patrones como documentación (misma
# convención que el check de conteos estancados de release.sh).
# Uso: doctrina <etiqueta> <regex> [allowlist: regex sobre "archivo:linea:contenido" que se permite]

doctrina() {
  local label="$1" regex="$2" allow="${3:-}" hits
  hits=$(rg -n --no-heading -g '*.md' -e "$regex" docs/sistema CLAUDE.md 2>/dev/null \
    | grep -v 'PLANTILLA-SELF-CHECK.md' || true)
  if [ -n "$allow" ] && [ -n "$hits" ]; then
    hits=$(printf '%s\n' "$hits" | grep -Ev "$allow" | grep -v '^$' || true)
  fi
  if [ -n "$hits" ]; then
    fail "DOCTRINA ($label): frase derogada presente:"
    printf '%s\n' "$hits" | head -5 >&2
  else
    pass "DOCTRINA ($label) sin hallazgos"
  fi
}

# (1) Perturbar el hue del líder está derogado (doctrina ago-2026): se toma TAL CUAL.
#     Permitido solo como contexto histórico en 29 y 16, y en CHANGELOG*.
doctrina "hue perturbado" 'hue ±10-25|perturbad' \
  '^docs/sistema/(29-REFERENCIA-VISUAL|16-DIRECCION-DE-ARTE)\.md:|CHANGELOG'
# (2) El rango "15-25 (micro-)pantallas" de onboarding está derogado (02B manda 4-8 inicial).
doctrina "15-25 pantallas" '15-25 (micro-)?pantallas'
# (3) "NUNCA el total" (precio anual) está derogado: el total anual debe ser visible.
doctrina "NUNCA el total" 'NUNCA el total'
# (4) Ahorro anual expresado en % está prohibido, salvo la línea que documenta la prohibición.
doctrina "ahorro anual en %" 'AHORRA [0-9]+%|% de ahorro' 'PROHIBIDO|no en %'
# (5) Regla WebAuthn vieja del counter ("menor o igual → rechazar") derogada (ver 26: excepción 0/0).
doctrina "counter WebAuthn" 'counter menor o igual'
# (6) Nomenclatura legacy de Supabase derogada: publishable/secret keys (51 §5).
doctrina "SUPABASE_ANON_KEY" 'SUPABASE_ANON_KEY'
# (7) `supabase db query` no existe en el CLI: psql / SQL editor / MCP execute_sql (25).
doctrina "supabase db query" 'supabase db query'
# (8) "cancelar y recomprar" derogado como instrucción de cambio de plan (18).
doctrina "cancelar y recomprar" 'cancelar y recomprar'
# (9) "FIJA EXPECTATIVAS al inicio" derogado: las expectativas se reparten en su momento
#     (regla 8 de INICIO); el primer mensaje es SOLO la pregunta del PASO 2. Cubre también
#     los .txt de prompts y los comandos de .claude/.
hits9=$(rg -n --no-heading -g '*.md' -g '*.txt' -e 'FIJA EXPECTATIVAS al inicio' docs/sistema .claude CLAUDE.md 2>/dev/null | grep -v 'PLANTILLA-SELF-CHECK.md' | grep -v 'CHANGELOG' || true)
if [ -n "$hits9" ]; then
  fail "DOCTRINA (expectativas al inicio): frase derogada presente:"
  printf '%s\n' "$hits9" | head -5 >&2
else
  pass "DOCTRINA (expectativas al inicio) sin hallazgos"
fi
# (10) Voseo/regionalismos en la voz del agente derogados: la voz del SO es español latino
#      NEUTRO (42). El voseo solo vive en la regla dialectal del copy de la app
#      (52/11/PLANTILLA-FICHA-AVATAR) y en citas voice-of-customer (44). Las líneas que
#      DOCUMENTAN la prohibición nombran la palabra "voseo" y se excluyen por contenido
#      (mismo criterio que el allowlist del check 4). Cubre md y txt de docs/sistema,
#      .claude y CLAUDE.md.
hits10=$(rg -n --no-heading -g '*.md' -g '*.txt' -e 'tenés|podés|querés|sabés|hacés|decís|dudás|mirá\b|fijate|conseguila|contame|avisame|[^a-zA-Z]vos[^a-zA-Z]' docs/sistema .claude CLAUDE.md 2>/dev/null \
  | grep -v 'PLANTILLA-SELF-CHECK.md' \
  | grep -v 'CHANGELOG' \
  | grep -v '52-COPY-VISUALES-CONVERSION.md' \
  | grep -v '11-DISENO-EMOCIONAL.md' \
  | grep -v 'PLANTILLA-FICHA-AVATAR.md' \
  | grep -v '44-DESCUBRIMIENTO-DE-USUARIO.md' \
  | grep -v 'voseo' || true)
if [ -n "$hits10" ]; then
  fail "DOCTRINA (voseo): voz no neutra presente:"
  printf '%s\n' "$hits10" | head -5 >&2
else
  pass "DOCTRINA (voseo) sin hallazgos"
fi

# (11) "5-9 dias" como duracion optima de trial esta derogado (02C: regla de TIEMPO-A-VALOR,
#      RevenueCat 2026: trials 17-32 dias convierten 42.5% vs 25.5%).
doctrina "trial 5-9 dias" '5-9 d[ií]as'
# (12) "PIX y boleto NO se auto-cobran" como afirmacion ABSOLUTA esta derogada (Pix Automatico,
#      jun-2025, soportado por Hotmart — 58 Paso 0; el fallback condicional "siguen SIN
#      auto-cobrarse" tras verificar es legitimo).
doctrina "PIX no se auto-cobra absoluto" 'PIX y boleto NO se auto-cobran'
# (13) "Zeigarnik" como mecanismo del progreso visible esta derogado (doctrina ago-2026):
#      el mecanismo real es ENDOWED PROGRESS (Nunes & Dreze 2006) / gradiente de meta.
doctrina "Zeigarnik" 'Zeigarnik'
# (14) Stats de constancia inventadas derogadas (56): todo % en copy lleva fuente y año o no existe.
doctrina "stats de constancia inventadas" 'top 6% de constancia|[Ss]olo el 6% llega|80% del resultado depende'
# (15) El "95%" atribuido a Zaltman esta derogado (02B): la cifra no es verificable; queda solo
#      el punto operativo (la emocion inicia, la logica justifica).
doctrina "Zaltman 95%" 'Zaltman'


exit "$FAIL"
