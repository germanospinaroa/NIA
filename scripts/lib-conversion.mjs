#!/usr/bin/env node
/**
 * lib-conversion.mjs — motor de análisis de audit-conversion.sh (PILAR 2 del SO).
 *
 * Caza AUSENCIAS de calidad en superficies de conversión (landing/onboarding/paywall)
 * según la doctrina de 52-COPY-VISUALES-CONVERSION.md y 55-DISENO-DE-LANDING.md.
 * Solo built-ins de Node (fs/path). Sin dependencias npm.
 *
 * Salida: reporte por check (✅/❌/⚠️ con archivo:línea) + línea centinela final
 *   ##RESUMEN-AUDIT-CONVERSION## CRIT=n WARN=m SUP=k
 * que audit-conversion.sh usa para el resumen y el exit code.
 *
 * HEURÍSTICAS DOCUMENTADAS (aproximaciones deliberadas, ver también las limitaciones
 * al final de cada check):
 * - JSX se analiza con un escáner de tags propio (no un parser TS completo): tolera
 *   atributos con llaves/arrow functions, descarta genéricos TS (<number | null>) y
 *   comparaciones. Texto dinámico ({variable}) no se puede contar — se cubre en parte
 *   con el escaneo de literales largos (strings ≥80 chars) del mismo archivo.
 * - "Chip" de ícono = clase CSS con width/height 40-48px Y background, o clases
 *   Tailwind size-10/11/12 + bg-*. Un contenedor sin width en CSS no cuenta como chip.
 * - Voseo: lista explícita de formas voseantes (abajo). No se generan sufijos para no
 *   marcar falsos positivos ("quizás", "café"). "seguí/escribí/subí" pueden ser pasado
 *   de 1ª persona — riesgo aceptado y documentado.
 * - Palabras vetadas: las citadas tras "Palabras vetadas:" en FICHA-AVATAR.md MÁS las
 *   citadas como excluidas con `sin "x"/"y"` en la línea de Registro/Léxico local.
 * - "Misma vista" del check de radios ≈ el conjunto de .css del proyecto (una landing
 *   es una vista); la dispersión de radios de card se mide sobre selectores *card*.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] || '.');
const rel = (f) => path.relative(ROOT, f) || path.basename(f);

const EXCLUDE_DIRS = new Set([
  'node_modules', '.next', '.git', 'dist', 'build', 'out', 'coverage',
  '.vercel', '.turbo', '.cache', 'storybook-static',
]);

let CRIT = 0;
let WARN = 0;

// ───────────────────────── utilidades base ─────────────────────────

function walk(dir, out = [], depth = 0) {
  if (depth > 12 || out.length > 8000) return out;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!EXCLUDE_DIRS.has(e.name)) walk(full, out, depth + 1);
    } else if (e.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function read(file) {
  try { return fs.readFileSync(file, 'utf8'); } catch { return null; }
}

function lineOf(src, idx) {
  let line = 1;
  for (let i = 0; i < idx && i < src.length; i++) if (src[i] === '\n') line++;
  return line;
}

function reporte(num, titulo, { crits = [], warns = [], infos = [], ok = 'Sin hallazgos.', degradado = null, skip = null }) {
  console.log('');
  console.log(`── ${num}. ${titulo}`);
  for (const i of infos) console.log(`   ${i}`);
  if (skip) { console.log(`   (no aplica: ${skip})`); return; }
  if (degradado) { console.log(`⚠️ No se pudo evaluar: ${degradado}`); WARN += 1; return; }
  const listar = (items) => {
    items.slice(0, 12).forEach((x) => console.log(`   ${x}`));
    if (items.length > 12) console.log(`   … y ${items.length - 12} más.`);
  };
  if (crits.length) { console.log(`❌ ${crits.length} hallazgo(s) CRÍTICO(s):`); listar(crits); CRIT += crits.length; }
  if (warns.length) { console.log(`⚠️ ${warns.length} aviso(s):`); listar(warns); WARN += warns.length; }
  if (!crits.length && !warns.length) console.log(`✅ ${ok}`);
}

// ───────────────────────── escáner JSX ─────────────────────────

const VOID_TAGS = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr']);
const KEYWORDS_BEFORE_JSX = new Set(['return', 'default', 'case', 'do', 'else', 'yield', 'await', 'typeof', 'in', 'of']);

function prevAllowsJsx(src, ltIdx) {
  // Solo se rechaza el caso generics/índice: identificador o ) ] PEGADO al '<'
  // (useState<number>, arr[i]<x). Texto JSX ("rastreando <span…") lleva espacio antes.
  const p = src[ltIdx - 1];
  if (p === undefined) return true;
  if (p === ')' || p === ']') return false;
  if (/[A-Za-z0-9_$]/.test(p)) {
    let j = ltIdx - 1;
    while (j >= 0 && /[A-Za-z0-9_$]/.test(src[j])) j--;
    const word = src.slice(j + 1, ltIdx);
    return KEYWORDS_BEFORE_JSX.has(word); // return<div> se tolera; useState<T> no
  }
  return true;
}

function validarAttrs(attrs) {
  // enmascarar strings y grupos {…} balanceados; lo que quede deben ser attrs válidos
  let masked = '';
  let i = 0;
  while (i < attrs.length) {
    const ch = attrs[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      const q = ch; i++;
      while (i < attrs.length && !(attrs[i] === q && attrs[i - 1] !== '\\')) i++;
      i++; masked += 'S';
      continue;
    }
    if (ch === '{') {
      let d = 1; i++; let q = null;
      while (i < attrs.length && d > 0) {
        const c = attrs[i];
        if (q) { if (c === q && attrs[i - 1] !== '\\') q = null; }
        else if (c === '"' || c === "'" || c === '`') q = c;
        else if (c === '{') d++;
        else if (c === '}') d--;
        i++;
      }
      masked += 'E';
      continue;
    }
    masked += ch; i++;
  }
  const tokens = masked.split(/\s+/).filter(Boolean);
  for (const t of tokens) {
    if (!/^(?:[A-Za-z_@$][\w:.$-]*(=(S|E)?)?|S|E|=)$/.test(t)) return false;
  }
  return true;
}

function parseOpenTag(src, start) {
  let i = start + 1;
  const nm = /^[A-Za-z][\w.$-]*/.exec(src.slice(i, i + 80));
  if (!nm) return null;
  const name = nm[0];
  i += name.length;
  const attrStart = i;
  let depth = 0; let quote = null;
  while (i < src.length && i - start < 5000) {
    const ch = src[i];
    if (quote) { if (ch === quote && src[i - 1] !== '\\') quote = null; i++; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; i++; continue; }
    if (ch === '{') { depth++; i++; continue; }
    if (ch === '}') { if (depth > 0) depth--; i++; continue; }
    if (depth === 0 && ch === '>') {
      let attrs = src.slice(attrStart, i);
      const selfClose = /\/\s*$/.test(attrs);
      if (selfClose) attrs = attrs.replace(/\/\s*$/, '');
      if (!validarAttrs(attrs)) return null;
      const type = selfClose || VOID_TAGS.has(name.toLowerCase()) ? 'self' : 'open';
      return { type, name, attrs, start, end: i + 1 };
    }
    if (depth === 0 && ch === '<') return null;
    i++;
  }
  return null;
}

function scanTags(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    if (src[i] !== '<') { i++; continue; }
    const next = src[i + 1];
    if (next === '>') { tokens.push({ type: 'open', name: '', attrs: '', start: i, end: i + 2 }); i += 2; continue; } // <>
    if (next === '/') {
      if (src[i + 2] === '>') { tokens.push({ type: 'close', name: '', start: i, end: i + 3 }); i += 3; continue; } // </>
      const m = /^<\/\s*([A-Za-z][\w.$-]*)\s*>/.exec(src.slice(i, i + 120));
      if (m) { tokens.push({ type: 'close', name: m[1], start: i, end: i + m[0].length }); i += m[0].length; continue; }
      i++; continue;
    }
    if (next && /[A-Za-z]/.test(next) && prevAllowsJsx(src, i)) {
      const tag = parseOpenTag(src, i);
      if (tag) { tokens.push(tag); i = tag.end; continue; }
    }
    i++;
  }
  return tokens;
}

function classOf(attrs) {
  const m = /class(?:Name)?\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`)\s*\})/.exec(attrs || '');
  return m ? (m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5] ?? '') : '';
}

function procesarLlaves(s) {
  let r = '';
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === '{') {
      let d = 1; let j = i + 1; let q = null;
      while (j < s.length && d > 0) {
        const c = s[j];
        if (q) { if (c === q && s[j - 1] !== '\\') q = null; }
        else if (c === '"' || c === "'" || c === '`') q = c;
        else if (c === '{') d++;
        else if (c === '}') d--;
        j++;
      }
      const expr = s.slice(i + 1, Math.max(i + 1, j - 1)).trim();
      const lit = /^(?:"([^"]*)"|'([^']*)'|`([^`]*)`)$/.exec(expr);
      if (lit) r += ' ' + (lit[1] ?? lit[2] ?? lit[3] ?? '') + ' ';
      i = j;
      if (d > 0) break;
      continue;
    }
    if (ch === '}') { i++; continue; }
    r += ch; i++;
  }
  return r;
}

function textoJsx(inner) {
  const toks = scanTags(inner);
  let out = ''; let pos = 0;
  for (const t of toks) { out += inner.slice(pos, t.start); pos = t.end; }
  out += inner.slice(pos);
  out = procesarLlaves(out);
  out = out
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…').replace(/&quot;/g, '"').replace(/&#\d+;/g, ' ');
  return out.replace(/\s+/g, ' ').trim();
}

function contarPalabras(text) {
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

// Extrae elementos (h1,h2,h3,p,li,blockquote,svg y componentes *Icon) con stack.
const INTERES = new Set(['h1', 'h2', 'h3', 'p', 'li', 'blockquote']);
const ICON_RE = /^(svg|[A-Z][\w]*Icon)$/;
const ICON_EXENTO_RE = /chevron|arrow|caret|close|^XIcon$/i;
const LIST_CTX_RE = /(^|[\s_-])(list|items?|features?|benefits?|beneficios?|pain|bullets?|checklist|stack)([\s_-]|$)/i;
const TW_CHIP_RE = /\b(size-(10|11|12)|w-(10|11|12)\b[\s\S]*\bh-(10|11|12))\b/;

function analizarTsx(file, src) {
  const tokens = scanTags(src);
  const stack = [];
  const elements = [];  // {name, cls, inner, line, innerStart, innerEnd}
  const svgHits = [];   // {name, line, ancestors:[{name, cls}]}

  const registrarSvg = (tok) => {
    const ancestors = stack.map((s) => ({ name: s.name, cls: classOf(s.attrs) }));
    svgHits.push({ name: tok.name, line: lineOf(src, tok.start), ancestors });
  };

  for (const tok of tokens) {
    if (tok.type === 'open') {
      if (ICON_RE.test(tok.name)) registrarSvg(tok);
      stack.push(tok);
    } else if (tok.type === 'self') {
      if (ICON_RE.test(tok.name)) registrarSvg(tok);
    } else { // close
      let k = -1;
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].name === tok.name) { k = i; break; }
      }
      if (k === -1) continue;
      const open = stack[k];
      stack.length = k; // descarta también tags sin cerrar por encima
      if (INTERES.has(open.name)) {
        elements.push({
          name: open.name,
          cls: classOf(open.attrs),
          inner: src.slice(open.end, tok.start),
          line: lineOf(src, open.start),
          innerStart: open.end,
          innerEnd: tok.start,
        });
      }
    }
  }

  // props de título/headline con string literal
  const titleProps = [];
  const tpRe = /(?:^|\s)(title|titulo|headline|heading|subtitle|subtitulo|label|caption)\s*=\s*(?:"([^"]{12,})"|'([^']{12,})')/g;
  for (const tok of tokens) {
    if (tok.type === 'close' || !tok.attrs) continue;
    let m;
    tpRe.lastIndex = 0;
    while ((m = tpRe.exec(tok.attrs)) !== null) {
      const val = m[2] ?? m[3] ?? '';
      if (!val.includes(' ')) continue;
      titleProps.push({ prop: m[1], value: val, line: lineOf(src, tok.start) });
    }
  }

  // literales largos (≥80 chars) fuera de elementos ya extraídos
  const literals = [];
  const litRe = /"((?:[^"\\\n]|\\.){80,})"|'((?:[^'\\\n]|\\.){80,})'|`((?:[^`\\]|\\.){80,})`/g;
  let lm;
  while ((lm = litRe.exec(src)) !== null) {
    const val = (lm[1] ?? lm[2] ?? lm[3] ?? '').replace(/\s+/g, ' ').trim();
    if (!val.includes(' ') || !/\p{L}{3}/u.test(val)) continue;
    const ctx = src.slice(Math.max(0, lm.index - 45), lm.index);
    if (/\b(import|from|require|href=|src=|url\(|class(Name)?\s*=)\s*$/.test(ctx)) continue;
    if (/\b(import|from)\b/.test(ctx)) continue;
    const dentro = elements.some((e) => lm.index >= e.innerStart && lm.index < e.innerEnd);
    if (dentro) continue;
    literals.push({ value: val, line: lineOf(src, lm.index) });
  }

  return { file, src, elements, svgHits, titleProps, literals };
}

// ───────────────────────── parser CSS ─────────────────────────

function parseCssRules(src, file) {
  const clean = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const rules = [];
  let hasKeyframes = false;

  function bloque(from, to) {
    let i = from;
    let selStart = from;
    while (i < to) {
      const ch = clean[i];
      if (ch === '{') {
        // encontrar cierre balanceado
        let d = 1; let j = i + 1;
        while (j < to && d > 0) {
          if (clean[j] === '{') d++;
          else if (clean[j] === '}') d--;
          j++;
        }
        const selector = clean.slice(selStart, i).trim().replace(/\s+/g, ' ');
        const bodyStart = i + 1;
        const bodyEnd = j - 1;
        if (/^@(media|supports|layer|container)/i.test(selector)) {
          bloque(bodyStart, bodyEnd);
        } else if (/^@keyframes/i.test(selector)) {
          hasKeyframes = true;
        } else if (selector.startsWith('@')) {
          // @font-face y similares: registrar como regla simple
          rules.push({ selector, body: clean.slice(bodyStart, bodyEnd), bodyStart, line: lineOf(clean, selStart === from ? i : selStart), file });
        } else if (selector) {
          const body = clean.slice(bodyStart, bodyEnd);
          if (!body.includes('{')) {
            rules.push({ selector, body, bodyStart, line: lineOf(clean, i), file });
          } else {
            bloque(bodyStart, bodyEnd); // anidado inesperado: descender
          }
        }
        i = j;
        selStart = j;
        continue;
      }
      if (ch === '}') { i++; selStart = i; continue; }
      i++;
    }
  }
  bloque(0, clean.length);
  return { rules, hasKeyframes, clean };
}

function decls(body) {
  const out = [];
  for (const part of body.split(';')) {
    const idx = part.indexOf(':');
    if (idx < 1) continue;
    const prop = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (prop) out.push({ prop, value });
  }
  return out;
}

function resolverVar(value, varMap, depth = 0) {
  if (depth > 6 || !value) return value;
  return value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/g, (_, name, fb) => {
    const v = varMap.get(name);
    if (v !== undefined) return resolverVar(v, varMap, depth + 1);
    return fb !== undefined ? resolverVar(fb, varMap, depth + 1) : '';
  });
}

// ───────────────────────── color / WCAG ─────────────────────────

function hexRgb(value) {
  const m = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.exec((value || '').trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function luminancia([r, g, b]) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratioWcag(hexA, hexB) {
  const a = hexRgb(hexA); const b = hexRgb(hexB);
  if (!a || !b) return null;
  const la = luminancia(a); const lb = luminancia(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// ───────────────────────── fichas ─────────────────────────

function buscarFicha(files, nombre) {
  const raiz = path.join(ROOT, nombre);
  if (fs.existsSync(raiz)) return raiz;
  const hit = files.find((f) => path.basename(f) === nombre && !/docs[\\/]+sistema/.test(f));
  return hit || null;
}

function rangoRadiosFicha(src) {
  const lineas = src.split('\n').filter((l) => /radio/i.test(l));
  // preferir la línea del brand kit ("- Radio: 16-20px …") sobre menciones sueltas
  lineas.sort((a, b) => (/^\s*-?\s*radio\s*:/i.test(b) ? 1 : 0) - (/^\s*-?\s*radio\s*:/i.test(a) ? 1 : 0));
  for (const line of lineas) {
    const rango = /(\d+)\s*[-–a]\s*(\d+)\s*px/.exec(line);
    if (rango) {
      const ini = Math.max(0, line.toLowerCase().lastIndexOf('radio', rango.index));
      return { min: +rango[1], max: +rango[2], linea: line.slice(ini, rango.index + rango[0].length).trim() };
    }
    const nums = [...line.matchAll(/(\d+)\s*px/g)].map((m) => +m[1]).filter((n) => n > 0 && n < 100);
    if (nums.length) return { min: Math.min(...nums), max: Math.max(...nums), linea: line.trim().slice(0, 70) };
  }
  return null;
}

function leerAvatar(src) {
  let registro = null;
  const vetadas = new Set();
  for (const line of src.split('\n')) {
    if (registro === null && /Registro\s*:/.test(line)) {
      const seg = line.split(/Registro\s*:/)[1].split('·')[0];
      const plantilla = /tuteo\s*\/\s*voseo\s*\/\s*usted\s*:\s*(\w+)/i.exec(seg);
      if (plantilla) registro = plantilla[1].toLowerCase();
      else {
        const m = /(tuteo|voseo|usted)/i.exec(seg);
        if (m) registro = m[1].toLowerCase();
      }
    }
    if (/vetadas/i.test(line)) {
      const seg = line.slice(line.search(/vetadas/i));
      const quoted = [...seg.matchAll(/["“”'«]([\p{L}\s-]{2,25})["“”'»]/gu)].map((m) => m[1].trim());
      if (quoted.length) quoted.forEach((w) => vetadas.add(w));
      else {
        const colon = seg.indexOf(':');
        if (colon !== -1) {
          seg.slice(colon + 1).split('·')[0].split(/[,/]/).forEach((w) => {
            const t = w.trim().replace(/^__$/, '');
            if (t && t !== '__' && /\p{L}{2,}/u.test(t) && t.length < 26) vetadas.add(t);
          });
        }
      }
    }
    if (/(léxico|lexico|registro)/i.test(line)) {
      // términos explícitamente excluidos: sin "lana"/"plata" …
      const m = /\bsin\s+((?:["“][^"”]+["”]\s*[/,y]?\s*)+)/iu.exec(line);
      if (m) {
        [...m[1].matchAll(/["“]([^"”]+)["”]/g)].forEach((q) => vetadas.add(q[1].trim()));
      }
    }
  }
  return { registro, vetadas: [...vetadas].filter((w) => w && w !== '__') };
}

// ───────────────────────── preparación ─────────────────────────

const allFiles = walk(ROOT);
const tsxAll = allFiles.filter((f) => /\.(tsx|jsx)$/.test(f));
const tsAll = allFiles.filter((f) => /\.(tsx|jsx|ts|js|mjs)$/.test(f) && !/\.(config|test|spec)\./.test(path.basename(f)));
const cssFiles = allFiles.filter((f) => f.endsWith('.css'));

const UI_DIR_RE = /(^|[\\/])(app|components|pages|src[\\/]app|src[\\/]components|src[\\/]pages)([\\/]|$)/;
const uiTsx = tsxAll.filter((f) => UI_DIR_RE.test(rel(f))) .length ? tsxAll.filter((f) => UI_DIR_RE.test(rel(f))) : tsxAll;

const esSuperficie = (f) => {
  const r = rel(f).replace(/\\/g, '/');
  if (/(landing|onboarding|paywall)/i.test(r)) return true;
  return r === 'app/page.tsx' || r === 'src/app/page.tsx' || r === 'pages/index.tsx' || r === 'pages/index.jsx';
};
const convFiles = uiTsx.filter(esSuperficie);
const hayLanding = convFiles.some((f) => /landing/i.test(rel(f)) || /(^|\/)app\/page\.tsx$/.test(rel(f).replace(/\\/g, '/')) || /(^|\/)pages\/index\./.test(rel(f).replace(/\\/g, '/')));

const analisis = convFiles.map((f) => {
  const src = read(f);
  return src === null ? null : analizarTsx(f, src);
}).filter(Boolean);

const cssParsed = cssFiles.map((f) => {
  const src = read(f);
  if (src === null) return null;
  const p = parseCssRules(src, f);
  return { file: f, src, ...p };
}).filter(Boolean);

// mapa global de variables CSS (tema claro por defecto)
const varMap = new Map();
for (const c of cssParsed) {
  for (const r of c.rules) {
    for (const d of decls(r.body)) {
      if (d.prop.startsWith('--') && !/data-theme|\.dark/.test(r.selector)) varMap.set(d.prop, d.value);
    }
  }
}

console.log(`Superficies de conversión detectadas: ${convFiles.length} archivo(s)` + (cssFiles.length ? ` · CSS: ${cssFiles.length}` : ''));
convFiles.slice(0, 15).forEach((f) => console.log(`   ${rel(f)}`));
if (convFiles.length > 15) console.log(`   … y ${convFiles.length - 15} más.`);
if (!convFiles.length) {
  console.log('⚠️ No se detectaron superficies de conversión (rutas/archivos con landing|onboarding|paywall, ni app/page.tsx raíz).');
  console.log('   Los checks de pantalla se marcan como "no aplica" — audita igualmente el stack y las fichas.');
}

const SIN_SUP = convFiles.length === 0 ? 'sin superficies de conversión detectadas' : null;

// ───────────────────────── CHECK 1: presupuesto de copy ─────────────────────────

function check1() {
  if (SIN_SUP) return reporte(1, 'PRESUPUESTO DE COPY (52 — límites duros por pieza + regla móvil de 375px)', { skip: SIN_SUP });
  const crits = []; const warns = [];
  const LIMITES = { h1: 10, h2: 10, h3: 10, p: 30, blockquote: 30, li: 12 };

  const evaluar = (file, line, tipo, cls, texto, esLiteral) => {
    const palabras = contarPalabras(texto);
    const chars = texto.length;
    if (palabras === 0 || chars < 12) return;
    const base = path.basename(file);
    const esFaq = /faq/i.test(base) || /faq|answer|respuesta/i.test(cls);
    const esLegal = /legal|privaci|t[ée]rmin|disclaimer|footer|aviso/i.test(cls) || /footer|legal|privaci|t[ée]rmin/i.test(base);
    const esPS = /(^|[\s_-])(ps|pd)([\s_-]|$)|posdata/i.test(cls) || /^\s*(PS|PD)\s*[:.]/.test(texto);

    let limPalabras = LIMITES[tipo] ?? 30;
    let limChars = 160; let avisoChars = 120;
    if (esFaq && tipo !== 'h1' && tipo !== 'h2' && tipo !== 'h3') { limPalabras = 40; limChars = 200; avisoChars = 160; }
    if (esPS) { limChars = 200; avisoChars = 170; }
    if (esLegal) { limChars = 200; avisoChars = 180; }

    const razones = [];
    let critico = false;
    if (palabras > limPalabras) {
      const fuerte = palabras > Math.round(limPalabras * 1.5);
      razones.push(`${palabras} palabras (límite ${tipo}: ${limPalabras})`);
      // en literales el rol exacto es incierto → nunca crítico solo por palabras
      if (fuerte && !esLiteral && tipo !== 'li') critico = true;
    }
    if (chars > limChars) {
      razones.push(`${chars} caracteres — excede 3-4 líneas a 375px (límite ${limChars})`);
      critico = true;
    } else if (chars > avisoChars) {
      razones.push(`${chars} caracteres (aviso >${avisoChars}: vigilar líneas a 375px)`);
    }
    if (!razones.length) return;
    const etiqueta = esLiteral ? `string "${texto.slice(0, 34)}…"` : `<${tipo}>`;
    const msg = `${rel(file)}:${line} — ${etiqueta} · ${razones.join(' · ')}`;
    if (critico) crits.push(msg); else warns.push(msg);
  };

  for (const a of analisis) {
    for (const el of a.elements) {
      const texto = textoJsx(el.inner);
      evaluar(a.file, el.line, el.name, el.cls || '', texto, false);
    }
    for (const tp of a.titleProps) {
      evaluar(a.file, tp.line, 'h3', tp.prop, tp.value.replace(/\s+/g, ' ').trim(), false);
    }
    for (const lit of a.literals) {
      evaluar(a.file, lit.line, 'p', '', lit.value, true);
    }
  }
  reporte(1, 'PRESUPUESTO DE COPY (52 — límites duros por pieza + regla móvil de 375px)', {
    crits, warns,
    ok: 'Todo el copy extraíble respeta el presupuesto (h≤10 · p≤30 · FAQ≤40 · ≤160 chars por bloque).',
    infos: ['Heurística: texto de h1/h2/h3/p/li/blockquote + props de título + strings ≥80 chars; texto 100% dinámico ({var}) no es contable.'],
  });
}

// ───────────────────────── CHECK 2: énfasis ─────────────────────────

const ACCENT_CLS_RE = /accent|acento|mechanism|highlight|marker|resalt/i;
const PALABRAS_VACIAS = new Set(['tu', 'tus', 'vos', 'el', 'la', 'los', 'las', 'un', 'una', 'de', 'que', 'y', 'o']);

function check2() {
  if (SIN_SUP) return reporte(2, 'JERARQUÍA DE ÉNFASIS en titulares (55/52 — la palabra que VENDE, resaltada)', { skip: SIN_SUP });
  const crits = []; const warns = [];
  for (const a of analisis) {
    for (const el of a.elements) {
      if (el.name !== 'h1' && el.name !== 'h2') continue;
      const texto = textoJsx(el.inner);
      if (contarPalabras(texto) < 2) continue;
      const innerToks = scanTags(el.inner);
      let tieneEnfasis = false;
      const spansAcento = [];
      const miniStack = [];
      for (const t of innerToks) {
        if (t.type === 'open') { miniStack.push(t); continue; }
        if (t.type === 'self') {
          const cls = classOf(t.attrs);
          if (ACCENT_CLS_RE.test(cls)) tieneEnfasis = true;
          continue;
        }
        let k = -1;
        for (let i = miniStack.length - 1; i >= 0; i--) if (miniStack[i].name === t.name) { k = i; break; }
        if (k === -1) continue;
        const open = miniStack[k];
        miniStack.length = k;
        const cls = classOf(open.attrs);
        const lname = open.name.toLowerCase();
        if (lname === 'strong' || lname === 'b' || lname === 'mark') tieneEnfasis = true;
        if (ACCENT_CLS_RE.test(cls)) {
          tieneEnfasis = true;
          spansAcento.push(textoJsx(el.inner.slice(open.end, t.start)));
        }
      }
      if (!tieneEnfasis) {
        crits.push(`${rel(a.file)}:${el.line} — <${el.name}> sin palabra resaltada (span/strong con clase accent|acento|mechanism|highlight): "${texto.slice(0, 60)}…"`);
      }
      for (const st of spansAcento) {
        const palabras = st.toLowerCase().replace(/[^\p{L}\s]/gu, ' ').split(/\s+/).filter(Boolean);
        if (palabras.length && palabras.every((w) => PALABRAS_VACIAS.has(w))) {
          crits.push(`${rel(a.file)}:${el.line} — el acento resalta una palabra vacía ("${st.trim()}") — se resalta la que VENDE (beneficio/número/transformación), nunca tu/vos/artículos (52)`);
        }
      }
    }
  }
  reporte(2, 'JERARQUÍA DE ÉNFASIS en titulares (55/52 — la palabra que VENDE, resaltada)', {
    crits, warns,
    ok: 'Todos los h1/h2 de conversión llevan énfasis y no resaltan palabras vacías.',
  });
}

// ───────────────────────── CHECK 3: hairlines ─────────────────────────

function check3() {
  if (SIN_SUP || !hayLanding) return reporte(3, 'HAIRLINES DEGRADÉ (55 gate G — ≥1 obligatoria en landing/paywall)', { skip: SIN_SUP || 'no hay landing/paywall detectada' });
  const hallazgos = [];
  for (const c of cssParsed) {
    for (const r of c.rules) {
      if (/padding-box/.test(r.body) && /border-box/.test(r.body)) {
        hallazgos.push(`${rel(c.file)}:${r.line} — ${r.selector}`);
      }
    }
  }
  let gbc = 0;
  for (const f of tsxAll) {
    const src = read(f); if (!src) continue;
    if (/GradientBorder/i.test(src)) { gbc++; hallazgos.push(`${rel(f)} — usa <GradientBorder…>`); }
  }
  const crits = []; const warns = []; const infos = [];
  if (!hallazgos.length) {
    crits.push('Cero hairlines degradé en todo el proyecto (técnica padding-box/border-box o <GradientBorderCard>) — el gate G de 55 exige ≥1 en el elemento clave (plan recomendado / garantía / mecanismo).');
  } else {
    infos.push(`Encontradas ${hallazgos.length} hairline(s): ${hallazgos.slice(0, 3).join(' · ')}`);
    if (hallazgos.length > 3) warns.push(`${hallazgos.length} hairlines degradé — el máximo doctrinal es 1-3 por vista (regada deja de significar, 55).`);
  }
  reporte(3, 'HAIRLINES DEGRADÉ (55 gate G — ≥1 obligatoria en landing/paywall)', {
    crits, warns, infos, ok: 'Hairline degradé presente y sin regar.',
  });
}

// ───────────────────────── CHECK 4: icon chips ─────────────────────────

function check4() {
  if (SIN_SUP) return reporte(4, 'ICON CHIPS 40-48px (55 — ícono SVG dentro de contenedor con fondo, no "pelado")', { skip: SIN_SUP });

  // clases CSS que califican como chip (width/height 40-48 + background)
  const chipClasses = new Map();     // clase → tamaño
  const sizedBgClasses = new Map();  // clase con bg + tamaño fuera de rango
  for (const c of cssParsed) {
    for (const r of c.rules) {
      for (const sel of r.selector.split(',')) {
        const compounds = sel.trim().split(/[\s>+~]+/);
        const last = compounds[compounds.length - 1] || '';
        const clsMatch = /^\.([A-Za-z_][\w-]*)/.exec(last);
        if (!clsMatch) continue;
        const ds = decls(r.body);
        let size = null; let hasBg = false;
        for (const d of ds) {
          if (/^(min-)?(width|height)$/.test(d.prop)) {
            const v = /^(\d+(?:\.\d+)?)px$/.exec(resolverVar(d.value, varMap).trim());
            if (v) size = size ?? parseFloat(v[1]);
          }
          if (/^background(-color|-image)?$/.test(d.prop) && !/^\s*(none|transparent)\s*$/i.test(d.value)) hasBg = true;
        }
        if (size !== null && hasBg) {
          if (size >= 40 && size <= 48) chipClasses.set(clsMatch[1], size);
          else sizedBgClasses.set(clsMatch[1], size);
        }
      }
    }
  }

  const crits = []; const warns = [];
  for (const a of analisis) {
    for (const hit of a.svgHits) {
      if (ICON_EXENTO_RE.test(hit.name)) continue;
      // contexto de lista: ancestro li/ul/ol o clase de lista de beneficios
      let ctxIdx = -1;
      for (let i = hit.ancestors.length - 1; i >= 0; i--) {
        const an = hit.ancestors[i];
        const n = an.name.toLowerCase();
        if (n === 'li' || n === 'ul' || n === 'ol' || LIST_CTX_RE.test(an.cls)) { ctxIdx = i; break; }
      }
      if (ctxIdx === -1) continue;
      const cadena = hit.ancestors.slice(ctxIdx);
      if (cadena.some((an) => ['button', 'a', 'summary'].includes(an.name.toLowerCase()))) continue; // ícono de acción, no de beneficio
      let chip = null; let fueraDeRango = null;
      for (const an of cadena) {
        for (const cls of (an.cls || '').split(/\s+/)) {
          if (chipClasses.has(cls)) chip = { cls, size: chipClasses.get(cls) };
          else if (sizedBgClasses.has(cls)) fueraDeRango = { cls, size: sizedBgClasses.get(cls) };
        }
        if (TW_CHIP_RE.test(an.cls || '') && /\bbg-/.test(an.cls || '')) chip = { cls: an.cls, size: 44 };
      }
      const ctxCls = hit.ancestors[ctxIdx].cls || hit.ancestors[ctxIdx].name;
      if (chip) continue;
      if (fueraDeRango) {
        warns.push(`${rel(a.file)}:${hit.line} — <${hit.name}> en "${ctxCls}" tiene contenedor con fondo pero de ${fueraDeRango.size}px (.${fueraDeRango.cls}) — el chip premium es 40-48px (55)`);
      } else {
        crits.push(`${rel(a.file)}:${hit.line} — <${hit.name}> "pelado" en lista "${ctxCls}": sin chip contenedor 40-48px con fondo acento 8-12% (55: sistema de íconos)`);
      }
    }
  }
  reporte(4, 'ICON CHIPS 40-48px (55 — ícono SVG dentro de contenedor con fondo, no "pelado")', {
    crits, warns,
    ok: 'Todos los íconos de listas de beneficios van dentro de chips 40-48px.',
    infos: ['Heurística: svg/*Icon dentro de li o contenedores list|item|feature|benefit|pain; chip = clase CSS con width/height 40-48px + background (o Tailwind size-10/11/12 + bg-*). Chevrons y botones quedan exentos.'],
  });
}

// ───────────────────────── CHECK 5: emojis ─────────────────────────

const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;

function check5() {
  if (SIN_SUP) return reporte(5, 'EMOJIS como elemento visual (55/CLAUDE.md — prohibidos en conversión)', { skip: SIN_SUP });
  const crits = [];
  for (const a of analisis) {
    const lines = a.src.split('\n');
    lines.forEach((ln, i) => {
      const m = ln.match(EMOJI_RE);
      if (m) crits.push(`${rel(a.file)}:${i + 1} — ${[...new Set(m)].join(' ')} (todo ícono es SVG de librería con chip, jamás un carácter emoji/dingbat — incluye ✓/✔ del sistema)`);
    });
  }
  reporte(5, 'EMOJIS como elemento visual (55/CLAUDE.md — prohibidos en conversión)', {
    crits, ok: 'Cero emojis/dingbats (U+1F300-1FAFF, U+2600-27BF) en los .tsx de conversión.',
  });
}

// ───────────────────────── CHECK 6: radios vs ficha ─────────────────────────

function check6() {
  if (!cssParsed.length) return reporte(6, 'RADIOS vs FICHA-ARTE (16/55 — radios del kit, consistentes)', { degradado: 'no hay archivos .css en el proyecto.' });
  const fichaPath = buscarFicha(allFiles, 'FICHA-ARTE.md');
  const ficha = fichaPath ? read(fichaPath) : null;
  const rango = ficha ? rangoRadiosFicha(ficha) : null;

  const usos = []; // {valor, selector, file, line}
  for (const c of cssParsed) {
    for (const r of c.rules) {
      for (const d of decls(r.body)) {
        if (d.prop !== 'border-radius') continue;
        const resuelto = resolverVar(d.value, varMap);
        for (const m of resuelto.matchAll(/(\d+(?:\.\d+)?)px/g)) {
          usos.push({ valor: parseFloat(m[1]), selector: r.selector, file: c.file, line: r.line });
        }
      }
    }
  }
  const crits = []; const warns = []; const infos = [];
  const relevantes = usos.filter((u) => u.valor > 4 && u.valor < 999);

  if (rango) {
    infos.push(`Rango aprobado en FICHA-ARTE.md: ${rango.min}-${rango.max}px ("${rango.linea.slice(0, 70)}")`);
    for (const u of relevantes) {
      if (u.valor < rango.min || u.valor > rango.max) {
        warns.push(`${rel(u.file)}:${u.line} — border-radius ${u.valor}px en "${u.selector}" fuera del rango ${rango.min}-${rango.max}px de la ficha`);
      }
    }
  } else {
    infos.push(fichaPath ? 'FICHA-ARTE.md existe pero no pude extraer el rango de radios (línea "Radio: N-Mpx").' : 'FICHA-ARTE.md no existe — solo se evalúa la dispersión de radios de card.');
    if (fichaPath === null) warns.push('Sin FICHA-ARTE.md no hay rango de radios aprobado que validar — completa la ficha (16).');
  }

  // dispersión de radios de card en la misma vista
  const cardVals = new Map();
  for (const u of relevantes) {
    if (/card/i.test(u.selector)) {
      if (!cardVals.has(u.valor)) cardVals.set(u.valor, `${u.selector} (${rel(u.file)}:${u.line})`);
    }
  }
  if (cardVals.size >= 2) {
    const det = [...cardVals.entries()].map(([v, s]) => `${v}px → ${s}`).join(' · ');
    crits.push(`${cardVals.size} radios distintos de card en la misma vista: ${det} — el radio de card es UNO solo por pantalla (14/16)`);
  }
  reporte(6, 'RADIOS vs FICHA-ARTE (16/55 — radios del kit, consistentes)', {
    crits, warns, infos,
    ok: 'Todos los border-radius caen en el rango de la ficha y las cards comparten radio.',
  });
}

// ───────────────────────── CHECK 7: profundidad de fondo ─────────────────────────

const SECCION_SEL_RE = /(hero|section|secci|banner|panel|backdrop|fondo|cta-final|final|landing|paywall|onboarding|^body$|^main$|^html$)/i;
const BOTON_SEL_RE = /(btn|button|cta(?!-final)|chip|badge|pill)/i;

function check7() {
  if (SIN_SUP || !hayLanding) return reporte(7, 'PROFUNDIDAD DE FONDO (55 gate G — mesh/radial sutil, no fondo plano)', { skip: SIN_SUP || 'no hay landing detectada' });
  const crits = []; const infos = [];
  let gradientesSeccion = 0;
  for (const c of cssParsed) {
    for (const r of c.rules) {
      const tieneGrad = decls(r.body).some((d) => /^background(-image)?$/.test(d.prop) && /(radial|linear|conic)-gradient\(/.test(d.value));
      if (!tieneGrad) continue;
      const sel = r.selector;
      if (SECCION_SEL_RE.test(sel) && !BOTON_SEL_RE.test(sel)) {
        gradientesSeccion++;
        infos.push(`Fondo con gradiente: ${sel} (${rel(c.file)}:${r.line})`);
      }
    }
  }
  // gradientes inline en tsx de conversión sobre elementos no-botón
  for (const a of analisis) {
    a.src.split('\n').forEach((ln, i) => {
      if (/(radial|linear|conic)-gradient\(/.test(ln) && /background/i.test(ln) && !/btn|button/i.test(ln)) {
        gradientesSeccion++;
        infos.push(`Gradiente inline: ${rel(a.file)}:${i + 1}`);
      }
    });
  }
  if (gradientesSeccion === 0) {
    crits.push('Fondo plano: cero radial/linear/conic-gradient en fondos de sección o hero (fuera de botones) — el gate G de 55 exige profundidad (mesh/radial sutil detrás del héroe; ver también 32).');
  }
  reporte(7, 'PROFUNDIDAD DE FONDO (55 gate G — mesh/radial sutil, no fondo plano)', {
    crits, infos: gradientesSeccion ? infos.slice(0, 6) : [],
    ok: 'Hay gradientes de profundidad en fondos de sección/hero.',
  });
}

// ───────────────────────── CHECK 8: sticky CTA ─────────────────────────

function check8() {
  if (SIN_SUP || !hayLanding) return reporte(8, 'STICKY CTA MOBILE (55 T2 — siempre a un tap del dinero)', { skip: SIN_SUP || 'no hay landing detectada' });
  const crits = []; const infos = [];
  const candidatos = [];
  for (const c of cssParsed) {
    for (const r of c.rules) {
      const ds = decls(r.body);
      const fija = ds.some((d) => d.prop === 'position' && /(fixed|sticky)/.test(d.value));
      const abajo = ds.some((d) => /^(bottom|inset-block-end|inset)$/.test(d.prop));
      if (fija && abajo) candidatos.push({ sel: r.selector, file: c.file, line: r.line });
    }
  }
  for (const a of analisis) {
    a.src.split('\n').forEach((ln, i) => {
      if (/class(Name)?=["'{][^"']*\bfixed\b[^"']*\bbottom-/.test(ln) || /\bsticky\b[^"']*\bbottom-/.test(ln)) {
        candidatos.push({ sel: 'clase utilitaria', file: a.file, line: i + 1 });
      }
    });
  }
  const haySafeArea = cssParsed.some((c) => /safe-area-inset/.test(c.src)) || analisis.some((a) => /safe-area-inset/.test(a.src));
  if (!candidatos.length) {
    crits.push('Sin sticky CTA mobile: cero position:fixed/sticky anclado a bottom en el proyecto — la barra fija inferior con el CTA (aparece al salir el hero) es obligatoria en landing mobile (55 T2).');
  } else if (!haySafeArea) {
    candidatos.slice(0, 3).forEach((cand) => infos.push(`Candidato: ${cand.sel} (${rel(cand.file)}:${cand.line})`));
    crits.push('Hay un elemento fijo inferior pero SIN env(safe-area-inset-bottom) — en teléfonos con notch el CTA queda debajo de la barra del sistema (55 T2).');
  } else {
    candidatos.slice(0, 3).forEach((cand) => infos.push(`Sticky detectado: ${cand.sel} (${rel(cand.file)}:${cand.line})`));
  }
  reporte(8, 'STICKY CTA MOBILE (55 T2 — siempre a un tap del dinero)', {
    crits, infos, ok: 'Sticky CTA inferior con safe-area-inset presente.',
  });
}

// ───────────────────────── CHECK 9: animaciones ─────────────────────────

function check9() {
  if (SIN_SUP) return reporte(9, 'ANIMACIONES BASELINE (22/55 T4 — una página estática no está terminada)', { skip: SIN_SUP });
  const infos = []; const crits = [];
  const hayKeyframes = cssParsed.some((c) => c.hasKeyframes);
  let hayMotion = false;
  const motionRe = /(motion\/react|framer-motion|whileInView|IntersectionObserver|useInView)/;
  for (const f of tsAll) {
    const src = read(f); if (!src) continue;
    if (motionRe.test(src)) { hayMotion = true; infos.push(`Animación por JS detectada en ${rel(f)}`); break; }
  }
  const hayReduced = cssParsed.some((c) => /prefers-reduced-motion/.test(c.src)) || tsAll.some((f) => { const s = read(f); return s && /prefers-reduced-motion/.test(s); });
  if (!hayKeyframes && !hayMotion) {
    crits.push('Página estática: cero @keyframes y cero motion/react|framer-motion|whileInView|IntersectionObserver en el proyecto — las 7 animaciones baseline son obligatorias (22: stagger de entrada, conteo de números, feedback de tap, reveal on scroll…).');
  } else if (!hayReduced) {
    crits.push('Hay animaciones pero falta prefers-reduced-motion — es regla de accesibilidad no negociable (UX 10 / 55 T4).');
  }
  reporte(9, 'ANIMACIONES BASELINE (22/55 T4 — una página estática no está terminada)', {
    crits, infos: infos.slice(0, 2),
    ok: 'Hay animaciones (keyframes/motion) y prefers-reduced-motion está contemplado.',
  });
}

// ───────────────────────── CHECK 10: voz vs ficha ─────────────────────────

// Lista explícita y documentada de formas voseantes (no se generan sufijos):
const VOSEO_DICT = [
  'vos', 'sos', 'tenés', 'podés', 'querés', 'sabés', 'hacés', 'decís', 'sentís',
  'venís', 'salís', 'seguís', 'vivís', 'contás', 'cancelás', 'recibís', 'describís',
  'registrás', 'empezás', 'aguantás', 'pagás', 'usás', 'lográs', 'ganás',
  'mirá', 'dejá', 'empezá', 'probá', 'registrá', 'respirá', 'anotá', 'aguantá',
  'contá', 'tocá', 'apretá', 'sumá', 'descargá', 'elegí', 'seguí', 'escribí',
  'subí', 'acordate', 'fijate', 'animate', 'sumate', 'acá',
];

function buildWordRe(words) {
  const esc = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`(?<![\\p{L}\\p{M}])(${esc.join('|')})(?![\\p{L}\\p{M}])`, 'giu');
}

function check10() {
  if (SIN_SUP) return reporte(10, 'VOZ vs FICHA-AVATAR (52 regla 4 / 57 — registro y palabras vetadas)', { skip: SIN_SUP });
  const avatarPath = buscarFicha(allFiles, 'FICHA-AVATAR.md');
  if (!avatarPath) {
    return reporte(10, 'VOZ vs FICHA-AVATAR (52 regla 4 / 57 — registro y palabras vetadas)', {
      degradado: 'FICHA-AVATAR.md no existe — sin ficha no hay copy (52 regla 1). Complétala y vuelve a correr.',
    });
  }
  const { registro, vetadas } = leerAvatar(read(avatarPath) || '');
  const infos = [];
  const crits = [];
  const artePath = buscarFicha(allFiles, 'FICHA-ARTE.md');
  if (artePath) {
    const idioma = /Idioma UI\s*:?\s*([^\n·]+)/i.exec(read(artePath) || '');
    if (idioma) infos.push(`Idioma UI (FICHA-ARTE): ${idioma[1].trim()}`);
  }
  infos.push(`Registro (FICHA-AVATAR): ${registro || 'no declarado'} · Palabras vetadas: ${vetadas.length ? vetadas.join(', ') : 'ninguna extraíble'}`);

  const voseoHits = []; const vetadaHits = [];
  if (registro === 'tuteo' || registro === 'usted') {
    const voseoRe = buildWordRe(VOSEO_DICT);
    for (const a of analisis) {
      a.src.split('\n').forEach((ln, i) => {
        voseoRe.lastIndex = 0;
        let m;
        while ((m = voseoRe.exec(ln)) !== null) {
          voseoHits.push(`${rel(a.file)}:${i + 1} — voseo "${m[1]}" con registro=${registro} declarado en la ficha`);
        }
      });
    }
  } else if (registro === 'voseo') {
    infos.push('Registro = voseo: el diccionario voseante no aplica (sería la voz correcta).');
  } else {
    infos.push('Sin campo Registro legible en la ficha — no se valida el dialecto (solo las vetadas).');
  }

  if (vetadas.length) {
    const vetRe = buildWordRe(vetadas);
    for (const a of analisis) {
      a.src.split('\n').forEach((ln, i) => {
        vetRe.lastIndex = 0;
        let m;
        while ((m = vetRe.exec(ln)) !== null) {
          vetadaHits.push(`${rel(a.file)}:${i + 1} — palabra vetada por la ficha: "${m[1]}"`);
        }
      });
    }
  }
  if (voseoHits.length || vetadaHits.length) {
    infos.push(`Total: ${voseoHits.length} hit(s) de voseo · ${vetadaHits.length} hit(s) de palabras vetadas.`);
  }
  crits.push(...vetadaHits, ...voseoHits); // vetadas primero para que no las tape el tope de listado
  reporte(10, 'VOZ vs FICHA-AVATAR (52 regla 4 / 57 — registro y palabras vetadas)', {
    crits, infos,
    ok: 'El copy respeta el registro de la ficha y no usa palabras vetadas.',
  });
}

// ───────────────────────── CHECK 11: contraste ─────────────────────────

function check11() {
  if (!cssParsed.length) return reporte(11, 'CONTRASTE WCAG de tokens (10 / UX 10 — texto ≥4.5:1 sobre su fondo)', { degradado: 'no hay archivos .css con tokens.' });
  // temas: claro (:root/html/body sin data-theme) y oscuro (data-theme="dark"/.dark)
  const base = new Map(); const dark = new Map();
  const declLine = new Map();
  for (const c of cssParsed) {
    for (const r of c.rules) {
      const esDark = /data-theme\s*=\s*["']?dark|\.dark\b/.test(r.selector);
      const esRoot = /:root|^html\b|^body\b/.test(r.selector) || esDark;
      if (!esRoot) continue;
      for (const d of decls(r.body)) {
        if (!d.prop.startsWith('--')) continue;
        (esDark ? dark : base).set(d.prop, d.value.trim());
        if (!declLine.has(d.prop)) declLine.set(d.prop, `${rel(c.file)}:${r.line}`);
      }
    }
  }
  if (!base.size) return reporte(11, 'CONTRASTE WCAG de tokens (10 / UX 10 — texto ≥4.5:1 sobre su fondo)', { degradado: 'no encontré variables de color en :root — sin tokens no hay nada que medir (10).' });

  const temas = [['claro', base]];
  if (dark.size) temas.push(['oscuro', new Map([...base, ...dark])]);

  const crits = []; const warns = []; const infos = [];
  let noHex = 0;
  for (const [nombre, vars] of temas) {
    const textos = [...vars.keys()].filter((k) => /^--text/.test(k) && !/inverse/.test(k));
    const fondos = [...vars.keys()].filter((k) => /^--(bg|background|surface)($|-)/.test(k));
    for (const t of textos) {
      const th = hexRgb(resolverVar(vars.get(t), vars));
      if (!th) { noHex++; continue; }
      for (const f of fondos) {
        const fh = hexRgb(resolverVar(vars.get(f), vars));
        if (!fh) { noHex++; continue; }
        const ratio = ratioWcag(resolverVar(vars.get(t), vars), resolverVar(vars.get(f), vars));
        if (ratio !== null && ratio < 4.5) {
          crits.push(`${declLine.get(t) || ''} — ${t} (${vars.get(t)}) sobre ${f} (${vars.get(f)}): ${ratio.toFixed(2)}:1 < 4.5:1 [tema ${nombre}]`);
        }
      }
    }
    // texto inverso sobre acento (heurística adicional, solo aviso)
    const inv = [...vars.keys()].find((k) => /^--text-.*inverse/.test(k));
    const acc = vars.get('--accent') || vars.get('--brand-primary');
    if (inv && acc) {
      const ratio = ratioWcag(resolverVar(vars.get(inv), vars), resolverVar(acc, vars));
      if (ratio !== null && ratio < 4.5) warns.push(`${inv} sobre --accent: ${ratio.toFixed(2)}:1 < 4.5:1 [tema ${nombre}] — texto de botones/CTA`);
    }
  }
  if (noHex) infos.push(`${noHex} par(es) omitidos por valores no-hex (rgba/color-mix) — verificar a mano.`);
  reporte(11, 'CONTRASTE WCAG de tokens (10 / UX 10 — texto ≥4.5:1 sobre su fondo)', {
    crits, warns, infos,
    ok: 'Todos los tokens --text-* alcanzan 4.5:1 sobre --bg/--surface (texto normal).',
  });
}

// ───────────────────────── CHECK 12: stack ─────────────────────────

function check12() {
  const pkgPath = path.join(ROOT, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return reporte(12, 'STACK PINEADO (51 — sin él, las recetas premium no se pueden aplicar)', {
      degradado: 'no hay package.json en la raíz del proyecto — no se puede verificar el stack.',
    });
  }
  let pkg;
  try { pkg = JSON.parse(read(pkgPath) || '{}'); } catch (e) {
    return reporte(12, 'STACK PINEADO (51 — sin él, las recetas premium no se pueden aplicar)', {
      degradado: `package.json ilegible (${e.message}).`,
    });
  }
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const faltan = [];
  if (!deps['tailwindcss'] && !deps['@tailwindcss/postcss'] && !deps['@tailwindcss/vite']) faltan.push('tailwindcss');
  if (!deps['lucide-react'] && !deps['@phosphor-icons/react'] && !deps['phosphor-react'] && !deps['lucide']) faltan.push('lucide-react o @phosphor-icons/react (íconos SVG)');
  if (!deps['motion'] && !deps['framer-motion']) faltan.push('motion (o framer-motion)');
  const crits = [];
  if (faltan.length) {
    crits.push(`Stack pineado abandonado (51): faltan ${faltan.join(' · ')} — sin estas librerías los chips SVG, checkmarks custom y las 7 animaciones baseline no se pueden aplicar (22/49/55).`);
  }
  reporte(12, 'STACK PINEADO (51 — sin él, las recetas premium no se pueden aplicar)', {
    crits, ok: 'tailwindcss + librería de íconos SVG + motion presentes en package.json.',
  });
}

// ───────────────────────── CHECK 13: orden de planes ─────────────────────────

function check13() {
  if (SIN_SUP) return reporte(13, 'ORDEN DE PLANES (55 §6.1 — el anual recomendado PRIMERO en mobile)', { skip: SIN_SUP });
  const warns = [];
  for (const a of analisis) {
    if (!/plan|precio|pricing|oferta|paywall|suscri/i.test(rel(a.file) + a.src)) continue;
    const mMen = /(?<![\p{L}])mensual(?![\p{L}])/iu.exec(a.src);
    const mAnu = /(?<![\p{L}])anual(?![\p{L}])/iu.exec(a.src);
    if (mMen && mAnu && mMen.index < mAnu.index) {
      warns.push(`${rel(a.file)}:${lineOf(a.src, mMen.index)} — "Mensual" aparece antes que "Anual" en el DOM: en mobile apilado el ANUAL (recomendado) va primero (55 §6.1).`);
    }
  }
  reporte(13, 'ORDEN DE PLANES (55 §6.1 — el anual recomendado PRIMERO en mobile)', {
    warns, ok: 'El plan anual precede al mensual en el DOM (o no hay sección de planes detectable).',
  });
}

// ───────────────────────── CHECK 14: comparativa A/B/C ─────────────────────────

function lcsLen(a, b) {
  const n = Math.min(a.length, 350); const m = Math.min(b.length, 350);
  let prev = new Array(m + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    const cur = new Array(m + 1).fill(0);
    for (let j = 1; j <= m; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    }
    prev = cur;
  }
  return prev[m];
}

function check14() {
  const compPath = allFiles.find((f) => path.basename(f) === 'direcciones-abc.html');
  if (!compPath) {
    return reporte(14, 'COMPARATIVA A/B/C (54 — solo si existe direcciones-abc.html)', { skip: 'no existe direcciones-abc.html en el proyecto.' });
  }
  const html = read(compPath) || '';
  const crits = []; const warns = []; const infos = [];
  infos.push(`Archivo: ${rel(compPath)}`);
  if (!/fonts\.googleapis|@font-face/i.test(html)) {
    crits.push('Sin fonts.googleapis ni @font-face: las fuentes declaradas jamás cargan — la comparativa muestra fallbacks, no las 3 direcciones (54).');
  }
  const familias = [...html.matchAll(/font-family\s*:\s*([^;}"']+)/gi)].map((m) => m[1]);
  if (familias.length && !familias.some((f) => /monospace/i.test(f))) {
    warns.push('Ninguna declaración font-family usa el fallback-trampa monospace — si una fuente no carga, el fallo no "grita" (54: fallback-trampa).');
  }
  const emojiLines = [];
  html.split('\n').forEach((ln, i) => {
    const m = ln.match(EMOJI_RE);
    if (m) emojiLines.push(`${rel(compPath)}:${i + 1} — ${[...new Set(m)].join(' ')}`);
  });
  if (emojiLines.length) crits.push(`Emojis en la comparativa (${emojiLines.length} línea(s)) — los mockups A/B/C llevan chips SVG, cero emojis (54): ${emojiLines[0]}`);

  // similitud de DOM entre las 3 opciones
  const tokens = scanTags(html);
  const stack = [];
  const frames = [];
  for (const tok of tokens) {
    if (tok.type === 'open') {
      stack.push(tok);
    } else if (tok.type === 'close') {
      let k = -1;
      for (let i = stack.length - 1; i >= 0; i--) if (stack[i].name === tok.name) { k = i; break; }
      if (k === -1) continue;
      const open = stack[k];
      stack.length = k;
      if (/data-opcion|opcion-[abc]|opci[oó]n[-_ ]?[abc]/i.test(open.attrs || '')) {
        frames.push(html.slice(open.end, tok.start));
      }
    }
  }
  if (frames.length >= 2) {
    const seqs = frames.slice(0, 3).map((f) => scanTags(f).filter((t) => t.type !== 'close' && t.name).map((t) => t.name.toLowerCase()));
    let similares = 0; let pares = 0;
    for (let i = 0; i < seqs.length; i++) {
      for (let j = i + 1; j < seqs.length; j++) {
        pares++;
        const sim = (2 * lcsLen(seqs[i], seqs[j])) / Math.max(1, seqs[i].length + seqs[j].length);
        infos.push(`Similitud de DOM opción ${i + 1} vs ${j + 1}: ${(sim * 100).toFixed(0)}%`);
        if (sim > 0.8) similares++;
      }
    }
    if (pares && similares === pares) {
      crits.push('Las opciones comparten >80% del DOM: es 1 pantalla con 3 acentos, no 3 direcciones — el TEST DE DIVERGENCIA de 54 exige 3 diseños distintos en escala de grises.');
    }
  } else {
    warns.push('No pude identificar ≥2 frames data-opcion/opcion-a|b|c en la comparativa — verificar la divergencia A/B/C a mano (54).');
  }
  reporte(14, 'COMPARATIVA A/B/C (54 — solo si existe direcciones-abc.html)', {
    crits, warns, infos, ok: 'Comparativa con fuentes cargadas, fallback-trampa, sin emojis y con 3 DOMs divergentes.',
  });
}

// ───────────────────────── CHECK 15: copy marcado ─────────────────────────

function check15() {
  if (SIN_SUP) return reporte(15, 'COPY MARCADO (52 — [acento]palabra[/acento] entregado por el redactor)', { skip: SIN_SUP });
  const copyDir = path.join(ROOT, 'docs', 'copy');
  if (!fs.existsSync(copyDir)) {
    return reporte(15, 'COPY MARCADO (52 — [acento]palabra[/acento] entregado por el redactor)', {
      warns: ['docs/copy/ no existe — copy sin marcar (52): el redactor entrega el copy con [acento]…[/acento] y [b]…[/b]; el diseño ejecuta, no adivina qué resaltar.'],
    });
  }
  const warns = []; const infos = [];
  const mdFiles = walk(copyDir).filter((f) => f.endsWith('.md'));
  if (!mdFiles.length) {
    warns.push('docs/copy/ existe pero está vacío — copy sin marcar (52).');
  }
  // spans de acento reales en el JSX
  const spansAcento = [];
  for (const a of analisis) {
    for (const m of a.src.matchAll(/<(span|strong|em|mark)[^>]*class(?:Name)?\s*=\s*["'{][^"'}]*(accent|acento|mechanism|highlight|marker|resalt)[^>]*>([\s\S]{1,120}?)<\/\1>/gi)) {
      spansAcento.push(textoJsx(m[3]).toLowerCase());
    }
  }
  for (const md of mdFiles) {
    const src = read(md) || '';
    const marcas = [...src.matchAll(/\[acento\]([\s\S]{1,80}?)\[\/acento\]/gi)].map((m) => m[1].replace(/\s+/g, ' ').trim());
    if (!marcas.length) { infos.push(`${rel(md)}: sin marcas [acento] — nada que verificar.`); continue; }
    for (const palabra of marcas) {
      const encontrada = spansAcento.some((s) => s.includes(palabra.toLowerCase()));
      if (!encontrada) {
        warns.push(`${rel(md)} — "[acento]${palabra}[/acento]" no aparece envuelta en un span de acento en el JSX de conversión.`);
      }
    }
  }
  reporte(15, 'COPY MARCADO (52 — [acento]palabra[/acento] entregado por el redactor)', {
    warns, infos, ok: 'Cada [acento] del copy marcado aparece resaltado en el JSX.',
  });
}

// ───────────────────────── ejecución ─────────────────────────

const CHECKS = [check1, check2, check3, check4, check5, check6, check7, check8, check9, check10, check11, check12, check13, check14, check15];
CHECKS.forEach((fn, i) => {
  try { fn(); } catch (e) {
    reporte(i + 1, `(check ${i + 1})`, { degradado: `error interno del analizador (${e.message}) — revisar manualmente.` });
  }
});

console.log('');
console.log(`##RESUMEN-AUDIT-CONVERSION## CRIT=${CRIT} WARN=${WARN} SUP=${convFiles.length}`);
