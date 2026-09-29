#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const parent = path.dirname(root);
const baseline = process.env.SO_BASELINE ?? path.join(parent, 'SO-apps-v5.8.0');
const zipPath = process.env.SO_ZIP ?? path.join(os.homedir(), 'Downloads', 'SO-apps-v6.10.0.zip');
const baselineZip = process.env.SO_BASELINE_ZIP ?? path.join(os.homedir(), 'Downloads', 'SO-apps-v5.8.0.zip');
let failed = 0;
let passed = 0;

function pass(label) {
  passed += 1;
  process.stdout.write(`OK  ${label}\n`);
}

function fail(label, detail = '') {
  failed += 1;
  process.stderr.write(`ERR ${label}${detail ? `: ${detail}` : ''}\n`);
}

function assert(condition, label, detail = '') {
  condition ? pass(label) : fail(label, detail);
}

function run(command, args, cwd = root, input = '') {
  return spawnSync(command, args, {
    cwd,
    input,
    encoding: 'utf8',
    env: { ...process.env, LC_ALL: 'C' },
  });
}

function read(relative, base = root) {
  return fs.readFileSync(path.join(base, relative), 'utf8');
}

function write(relative, content, base) {
  const target = path.join(base, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function copyForMutation(name) {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), `so-current-${name}-`));
  fs.cpSync(root, target, { recursive: true });
  return target;
}

function expectAuditFailure(name, mutate, expectedText) {
  const target = copyForMutation(name);
  mutate(target);
  const result = run('bash', ['scripts/audit-so.sh'], target);
  const output = `${result.stdout}${result.stderr}`;
  assert(
    result.status !== 0 && (!expectedText || output.includes(expectedText)),
    `mutación rechazada: ${name}`,
    `exit=${result.status}; salida=${output.slice(0, 500)}`,
  );
}

function makePromptDist(base, prefix) {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  for (const file of walk(path.join(base, 'docs/sistema')).filter((f) => /PROMPT-.*\.txt$/.test(f))) {
    if (path.basename(file) !== 'PROMPT-AUDITAR-SO.txt') {
      fs.copyFileSync(file, path.join(target, path.basename(file)));
    }
  }
  return target;
}

process.stdout.write('=== CERTIFICACION DEL SO v6.10.0 ===\n');

// 0. Modo mantenedor vs modo usuario-final: los checks de EMPAQUETADO necesitan la versión
//    anterior (baseline) y los ZIPs al lado. Si faltan, se degradan con aviso claro en vez de
//    crashear con ENOENT, y se ejecutan SOLO las secciones que no requieren baseline.
const hasBaseline = fs.existsSync(path.join(baseline, 'scripts/audit-so.sh'));
const hasBaselineZip = fs.existsSync(baselineZip);
const hasZip = fs.existsSync(zipPath);
const missingPieces = [];
if (!hasBaseline) missingPieces.push(`el baseline v5.8 (${baseline} — o var SO_BASELINE)`);
if (!hasZip) missingPieces.push(`el ZIP v5.9 (${zipPath} — o var SO_ZIP)`);
if (!hasBaselineZip) missingPieces.push(`el ZIP baseline v5.8 (${baselineZip} — o var SO_BASELINE_ZIP)`);
if (missingPieces.length > 0) {
  process.stdout.write(
    `⚠️ Modo mantenedor no disponible: falta ${missingPieces.join('; ')}. ` +
    'Este script certifica el EMPAQUETADO del SO y necesita la versión anterior al lado ' +
    '(o las vars SO_BASELINE/SO_ZIP). Los checks de hooks/release que no requieren baseline ' +
    'se ejecutan igual.\n',
  );
}

// 1. Baseline y estado sano (solo en modo mantenedor con baseline presente).
if (hasBaseline) {
  pass('baseline v5.8 disponible');
  const baselineAudit = run('bash', ['scripts/audit-so.sh'], baseline);
  assert(baselineAudit.status === 0, 'baseline v5.8 pasa su auditoría', baselineAudit.stderr);
  const baselinePromptDist = makePromptDist(baseline, 'so-baseline-prompts-');
  const baselineRelease = run('bash', ['scripts/release.sh', baselinePromptDist], baseline);
  assert(baselineRelease.status === 0, 'baseline v5.8 pasa release check', baselineRelease.stderr);
}

if (hasBaselineZip) {
  pass('ZIP baseline v5.8 disponible');
  const baselineExtracted = fs.mkdtempSync(path.join(os.tmpdir(), 'so-baseline-zip-'));
  const baselineUnzip = run('unzip', ['-q', baselineZip, '-d', baselineExtracted]);
  assert(baselineUnzip.status === 0, 'ZIP baseline v5.8 extrae sin errores', baselineUnzip.stderr);
  const baselineRoots = [baselineExtracted, ...fs.readdirSync(baselineExtracted)
    .filter((name) => name !== '__MACOSX')
    .map((name) => path.join(baselineExtracted, name))]
    .filter((candidate) => fs.existsSync(path.join(candidate, 'scripts/audit-so.sh')));
  assert(baselineRoots.length === 1, 'ZIP baseline v5.8 contiene una raíz auditable');
  if (baselineRoots.length === 1) {
    const audit = run('bash', ['scripts/audit-so.sh'], baselineRoots[0]);
    assert(audit.status === 0, 'SO baseline v5.8 extraído pasa auditoría', audit.stderr);
  }
}

const currentAudit = run('bash', ['scripts/audit-so.sh']);
assert(currentAudit.status === 0, 'v5.9 pasa auditoría estructural', currentAudit.stderr);
assert(read('CLAUDE.md') === read('AGENTS.md'), 'CLAUDE.md y AGENTS.md idénticos');

if (hasBaseline) {
  const baselineFiles = walk(baseline).map((file) => path.relative(baseline, file));
  const missingFromCurrent = baselineFiles.filter((file) => !fs.existsSync(path.join(root, file)));
  assert(missingFromCurrent.length === 0, 'v5.9 no elimina archivos de v5.8', missingFromCurrent.join(', '));
}

// 2. Contratos semánticos de los hallazgos críticos.
const contracts = [
  ['61-INTEGRIDAD-DE-LANZAMIENTO.md', 'docs/sistema/61-INTEGRIDAD-DE-LANZAMIENTO.md', 'GATE 10'],
  ['prompt de integridad', 'docs/sistema/PROMPT-INTEGRIDAD-LANZAMIENTO.txt', 'Gates 1-10'],
  ['comando de integridad', '.claude/commands/integridad-lanzamiento.md', 'PROMPT-INTEGRIDAD'],
  ['ledger de claims', 'docs/sistema/61-INTEGRIDAD-DE-LANZAMIENTO.md', 'CLAIMS-LEDGER.md'],
  ['ledger económico', 'docs/sistema/18-VENTA-HOTMART.md', 'provider + transaction_id + economic_kind'],
  ['acceso hasta fin de periodo', 'docs/sistema/18-VENTA-HOTMART.md', 'access_until'],
  ['entitlement de cuatro estados', 'docs/sistema/42-UX-WRITING.md', 'unknown_retryable'],
  ['RPC por acción', 'docs/sistema/24-GAMIFICACION.md', 'claim_action_reward'],
  ['consentimiento sin localStorage', 'docs/sistema/47-LEGAL-FISCAL-Y-PRIVACIDAD.md', 'localStorage'],
  ['eval determinista', 'docs/sistema/31-EVALS-OBSERVABILIDAD-OPERACION.md', 'oracle programático'],
  ['economía p95', 'docs/sistema/40-UNIT-ECONOMICS.md', 'p95'],
  ['checkout abandonado derivado', 'docs/sistema/36-ANALITICA-Y-EVENTOS.md', 'checkout_abandonado'],
  ['release trazable', 'docs/sistema/08-DEPLOY.md', 'RELEASE-MANIFEST.json'],
  ['piloto controlado', 'docs/sistema/35-LANZAMIENTO.md', '5-10 compradores'],
  ['publicación canónica', 'docs/sistema/62-PUBLICACION-SEGURA-Y-CONTINUA.md', 'Máquina de estados de publicación'],
  ['certificado de publicación', 'docs/sistema/PLANTILLA-CERTIFICADO-PUBLICACION.md', 'automatic_updates_verified'],
  ['repositorio Vercel conectado', 'docs/sistema/PROMPT-DEPLOY.txt', 'Connected Git Repository'],
  ['segunda publicación', 'docs/sistema/PROMPT-DEPLOY.txt', 'SEGUNDA PUBLICACION'],
  ['Supabase dry-run', 'docs/sistema/PROMPT-DEPLOY.txt', 'supabase db push --dry-run'],
  ['cero secretos raíz', 'CLAUDE.md', 'CERO SECRETOS EN CHAT'],
];
for (const [label, file, term] of contracts) {
  assert(read(file).includes(term), `contrato presente: ${label}`);
}

const gamification = read('docs/sistema/24-GAMIFICACION.md');
assert(!/create policy "own_(progress|achievements)"[\s\S]{0,180}for all/.test(gamification),
  'gamificación no concede for-all sobre recompensas');
assert(gamification.includes('for select using'), 'gamificación permite lectura propia');

const hotmart = read('docs/sistema/18-VENTA-HOTMART.md');
assert(!hotmart.includes('receivedToken !== process.env.HOTMART_HOTTOK'),
  'Hotmart no conserva comparación insegura simplificada');
assert(!hotmart.includes("update({ status: 'cancelled', plan: 'free' })"),
  'cancelación no degrada inmediatamente a free');
assert(!hotmart.includes('Ejemplo didáctico simplificado'),
  'Hotmart no ofrece ejemplo inseguro copiable');

const validation = read('docs/sistema/02-VALIDACION.md');
assert(!validation.includes('Debe incluir: Uso ilimitado'), 'validación no exige claim ilimitado');
const deploy = read('docs/sistema/08-DEPLOY.md');
assert(!deploy.includes('la mayoría se pueden ignorar en MVP'), 'deploy no perdona warnings por defecto');

const deployPrompt = read('docs/sistema/PROMPT-DEPLOY.txt');
assert(!/(p[ií]deme|p[ií]demelo|p[aá]same|env[ií]ame|comp[aá]rteme|pega aqu[ií]).{0,100}(api.?key|clave|token|hottok|password|cookie|secret)/i.test(deployPrompt),
  'deploy no pide valores secretos por chat');
for (const state of ['PASO 0', 'PASO 1', 'PASO 2', 'PASO 3', 'PASO 4', 'PASO 5', 'PASO 6', 'PASO 7', 'PASO 8']) {
  assert(deployPrompt.includes(state), `deploy conserva estado ${state}`);
}
const publication = read('docs/sistema/62-PUBLICACION-SEGURA-Y-CONTINUA.md');
assert(publication.includes('`vercel link`') && publication.includes('NO prueba'),
  'publicación distingue vercel link de integración Git');
assert(publication.includes('db reset --linked') && publication.includes('Production'),
  'publicación bloquea reset remoto de Production');
const publicationTemplate = read('docs/sistema/PLANTILLA-CERTIFICADO-PUBLICACION.md');
for (const flag of ['automatic_updates_verified', 'production_sha_match', 'secrets_shared_in_chat',
  'production_secrets_in_preview', 'supabase_target_verified']) {
  assert(publicationTemplate.includes(flag), `certificado contiene flag ${flag}`);
}

// 3. Mutaciones: el auditor debe fallar cuando sembramos regresiones.
expectAuditFailure('agents-diverge', (dir) => {
  write('AGENTS.md', `${read('AGENTS.md', dir)}\nMUTACION\n`, dir);
}, 'CLAUDE.md y AGENTS.md divergen');

expectAuditFailure('json-invalid', (dir) => {
  write('.mcp.json', '{invalid', dir);
}, 'JSON de configuracion invalido');

expectAuditFailure('missing-ref', (dir) => {
  write('docs/sistema/PROMPT-CONVERSION.txt', `${read('docs/sistema/PROMPT-CONVERSION.txt', dir)}\n\`NO-EXISTE.md\`\n`, dir);
}, 'REF:');

expectAuditFailure('unclosed-fence', (dir) => {
  write('docs/sistema/61-INTEGRIDAD-DE-LANZAMIENTO.md', `${read('docs/sistema/61-INTEGRIDAD-DE-LANZAMIENTO.md', dir)}\n\`\`\`\n`, dir);
}, 'FENCE:');

expectAuditFailure('unrouted-module', (dir) => {
  write('docs/sistema/62-MUTACION.md', '# Mutación sin ruta\n', dir);
}, 'ROUTE:');

expectAuditFailure('missing-command', (dir) => {
  fs.rmSync(path.join(dir, '.claude/commands/integridad-lanzamiento.md'));
}, 'COMMAND:');

expectAuditFailure('obsolete-conversion', (dir) => {
  write('docs/sistema/PROMPT-CONVERSION.txt', `${read('docs/sistema/PROMPT-CONVERSION.txt', dir)}\npaywall_visto se renderiza al montar\n`, dir);
}, 'regla de conversion obsoleta');

expectAuditFailure('unsafe-gamification', (dir) => {
  write('docs/sistema/24-GAMIFICACION.md', `${read('docs/sistema/24-GAMIFICACION.md', dir)}\ncreate policy "own_progress" on user_progress for all;\n`, dir);
}, 'escritura directa');

expectAuditFailure('ignored-warnings', (dir) => {
  write('docs/sistema/08-DEPLOY.md', `${read('docs/sistema/08-DEPLOY.md', dir)}\nla mayoría se pueden ignorar en MVP\n`, dir);
}, 'ignorar warnings');

expectAuditFailure('missing-integrity-contract', (dir) => {
  for (const file of walk(dir).filter((f) => /\.(md|txt)$/.test(f))) {
    const content = fs.readFileSync(file, 'utf8').replaceAll('unknown_retryable', 'unknown_state');
    fs.writeFileSync(file, content);
  }
}, 'unknown_retryable');

expectAuditFailure('deploy-asks-secret', (dir) => {
  write('docs/sistema/PROMPT-DEPLOY.txt', `${read('docs/sistema/PROMPT-DEPLOY.txt', dir)}\nPásame la API key y el HOTTOK por chat.\n`, dir);
}, 'solicita un valor secreto');

expectAuditFailure('missing-connected-repo', (dir) => {
  for (const file of walk(dir).filter((f) => /\.(md|txt)$/.test(f))) {
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replaceAll('Connected Git Repository', 'Git link status'));
  }
}, 'Connected Git Repository');

expectAuditFailure('missing-second-deploy', (dir) => {
  for (const file of walk(dir).filter((f) => /\.(md|txt)$/.test(f))) {
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8')
      .replaceAll('automatic_updates_verified', 'updates_status')
      .replaceAll('segunda publicación automática', 'actualización posterior'));
  }
}, 'automatic_updates_verified');

expectAuditFailure('missing-publication-certificate', (dir) => {
  for (const file of walk(dir).filter((f) => /\.(md|txt)$/.test(f))) {
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replaceAll('PUBLICATION-CERTIFICATE.md', 'DEPLOY-NOTES.md'));
  }
}, 'PUBLICATION-CERTIFICATE.md');

expectAuditFailure('missing-supabase-dry-run', (dir) => {
  for (const file of walk(dir).filter((f) => /\.(md|txt)$/.test(f))) {
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replaceAll('supabase db push --dry-run', 'supabase db inspect'));
  }
}, 'supabase db push --dry-run');

// 4. Hooks y configuración ejecutable.
const settings = JSON.parse(read('.claude/settings.json'));
for (const group of Object.values(settings.hooks)) {
  for (const matcher of group) {
    for (const hook of matcher.hooks) {
      const script = hook.command.replace(/^bash\s+/, '');
      assert(fs.existsSync(path.join(root, script)), `hook existe: ${script}`);
      const syntax = run('bash', ['-n', script]);
      assert(syntax.status === 0, `hook con sintaxis válida: ${script}`, syntax.stderr);
    }
  }
}

const session = run('bash', ['.claude/hooks/session-start.sh']);
assert(session.status === 0 && session.stdout.includes('CONTEXTO DE ARRANQUE'),
  'SessionStart ejecuta e inyecta contexto');
const postEdit = run('bash', ['.claude/hooks/post-edit.sh'], root,
  JSON.stringify({ tool_input: { file_path: 'README.md' } }));
assert(postEdit.status === 0, 'PostToolUse ignora archivos no TypeScript sin romper');
const stop = run('bash', ['.claude/hooks/pre-stop.sh'], root,
  JSON.stringify({ stop_hook_active: true }));
assert(stop.status === 0, 'Stop hook evita loop de bloqueo');

const hookFixture = fs.mkdtempSync(path.join(os.tmpdir(), 'so-current-hooks-'));
write('tsconfig.json', '{}\n', hookFixture);
write('src/Broken.ts', 'const broken: string = 1;\n', hookFixture);
write('src/BadCard.tsx', 'export const Bad = () => <div className="transition-all min-h-full" style={{ color: "#ff00aa" }}>x</div>;\n', hookFixture);
write('src/GoodCard.tsx', 'export const Good = () => <main className="min-h-dvh text-foreground">x</main>;\n', hookFixture);
write('node_modules/.bin/tsc', '#!/usr/bin/env bash\necho "src/Broken.ts(1,7): error TS2322: bad type"\nexit 1\n', hookFixture);
fs.chmodSync(path.join(hookFixture, 'node_modules/.bin/tsc'), 0o755);

const postEditBroken = run('bash', [path.join(root, '.claude/hooks/post-edit.sh')], hookFixture,
  JSON.stringify({ tool_input: { file_path: path.join(hookFixture, 'src/Broken.ts') } }));
assert(postEditBroken.status === 2 && postEditBroken.stderr.includes('error TS'),
  'PostToolUse bloquea TypeScript roto', postEditBroken.stderr);

const stopBroken = run('bash', [path.join(root, '.claude/hooks/pre-stop.sh')], hookFixture,
  JSON.stringify({ stop_hook_active: false }));
assert(stopBroken.status === 2, 'Stop hook bloquea cierre con TypeScript roto', stopBroken.stderr);

const designBad = run('bash', [path.join(root, '.claude/hooks/post-edit-diseno.sh')], hookFixture,
  JSON.stringify({ tool_input: { file_path: path.join(hookFixture, 'src/BadCard.tsx') } }));
assert(designBad.status === 2 && designBad.stderr.includes('LINTER DE DISEÑO'),
  'linter visual bloquea anti-patrones', designBad.stderr);

const designGood = run('bash', [path.join(root, '.claude/hooks/post-edit-diseno.sh')], hookFixture,
  JSON.stringify({ tool_input: { file_path: path.join(hookFixture, 'src/GoodCard.tsx') } }));
assert(designGood.status === 0, 'linter visual acepta UI sin huellas prohibidas', designGood.stderr);

const compact = run('bash', ['.claude/hooks/pre-compact.sh']);
assert(compact.status === 0 && compact.stdout.includes('Compactación inminente'),
  'PreCompact recuerda persistir checkpoint');

// 5. Release completo con prompts sincronizados.
const promptDist = makePromptDist(root, 'so-current-prompts-');
const release = run('bash', ['scripts/release.sh', promptDist]);
assert(release.status === 0, 'release check completo pasa', `${release.stdout}\n${release.stderr}`);

// 6. Distribución: abrir el ZIP v5.9 y volver a ejecutar desde lo que recibe el usuario.
if (hasZip) {
  pass('ZIP v5.9 disponible');
  const list = run('unzip', ['-Z1', zipPath]);
  assert(list.status === 0, 'ZIP v5.9 se puede listar', list.stderr);
  assert(!list.stdout.includes('__MACOSX'), 'ZIP v5.9 sin metadatos __MACOSX');
  for (const required of [
    'SO-apps-v6.10.0/docs/sistema/61-INTEGRIDAD-DE-LANZAMIENTO.md',
    'SO-apps-v6.10.0/docs/sistema/62-PUBLICACION-SEGURA-Y-CONTINUA.md',
    'SO-apps-v6.10.0/docs/sistema/PLANTILLA-CERTIFICADO-PUBLICACION.md',
    'SO-apps-v6.10.0/docs/sistema/REPORTE-CERTIFICACION-TECNICA-v5.8.0.md',
    'SO-apps-v6.10.0/docs/sistema/PROMPT-DEPLOY.txt',
    'SO-apps-v6.10.0/.claude/commands/deploy.md',
    'SO-apps-v6.10.0/scripts/test-integridad.mjs',
  ]) {
    assert(list.stdout.split('\n').includes(required), `ZIP v5.9 contiene ${required}`);
  }

  const extracted = fs.mkdtempSync(path.join(os.tmpdir(), 'so-current-zip-'));
  const unzip = run('unzip', ['-q', zipPath, '-d', extracted]);
  assert(unzip.status === 0, 'ZIP v5.9 extrae sin errores', unzip.stderr);
  const extractedRoot = path.join(extracted, 'SO-apps-v6.10.0');
  const extractedAudit = run('bash', ['scripts/audit-so.sh'], extractedRoot);
  assert(extractedAudit.status === 0, 'SO v5.8 extraído pasa auditoría', extractedAudit.stderr);
}

const modo = missingPieces.length > 0 ? ' (modo usuario-final: checks de empaquetado omitidos)' : '';
process.stdout.write(`\nResultado: ${passed} OK, ${failed} fallos${modo}.\n`);
process.stdout.write(`Temporales de evidencia: ${os.tmpdir()}/so-baseline-* y ${os.tmpdir()}/so-current-*\n`);
process.exit(failed === 0 ? 0 : 1);
