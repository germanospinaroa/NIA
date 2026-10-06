import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.env.REDTEAM_OUTPUT_DIR || 'output/red-team');
const input = await fs.readFile(path.join(root, 'semantic-calibration.csv'), 'utf8');

function parseCsv(text) {
  const rows = []; let row = []; let value = ''; let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]; const next = text[i + 1];
    if (quoted && char === '"' && next === '"') { value += '"'; i += 1; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (!quoted && char === ',') { row.push(value); value = ''; continue; }
    if (!quoted && char === '\n') { row.push(value.replace(/\r$/, '')); rows.push(row); row = []; value = ''; continue; }
    value += char;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  const [header, ...data] = rows;
  return data.filter(item => item.length === header.length).map(item => Object.fromEntries(header.map((key, index) => [key, item[index]])));
}

const rows = parseCsv(input);
const reviewThreshold = 0.58;
const replay = rows.map(row => {
  const similarity = Number(row.similarity);
  const retrievalGate = similarity >= reviewThreshold ? 'judge_required' : 'distinct_by_retrieval';
  return { case_id: row.case_id, person_id: row.person_id, story_id: row.story_id, round: Number(row.round), similarity, retrieval_gate: retrievalGate, judge_result: null, note: retrievalGate === 'judge_required' ? 'No se ejecutó el juez; requiere una llamada explícita.' : 'No requiere juez por debajo del threshold de review.' };
});
await fs.writeFile(path.join(root, 'semantic-replay.json'), `${JSON.stringify({ source: 'semantic-calibration.csv', calls_made: 0, review_threshold: reviewThreshold, cases: replay }, null, 2)}\n`);
console.log(JSON.stringify({ status: 'PASS', cases: replay.length, judge_required: replay.filter(row => row.retrieval_gate === 'judge_required').length, calls_made: 0 }));
