import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('app/onboarding/page.tsx', 'utf8');
const funnel = fs.readFileSync('lib/funnel.ts', 'utf8');
assert.match(source, /message_time_1: time/);
assert.match(source, /timezone/);
assert.match(source, /\/api\/profile/);
assert.match(source, /\/api\/daily/);
assert.match(source, /\/api\/calibration/);
assert.match(source, /calibration_required/);
assert.match(source, /onboardingStage: nextStage/);
assert.match(source, /¿En qué momento del día te gustaría recibir tu mensaje de NIA\?/);
assert.match(source, /Por la noche/);
assert.doesNotMatch(source, /primer momento/);
assert.match(funnel, /'calibration'/);
for (const [value, label, time] of [
  ['morning', 'Por la mañana', '08:00'],
  ['midday', 'Al mediodía', '12:30'],
  ['afternoon', 'Por la tarde', '17:30'],
  ['night', 'Por la noche', '21:00'],
]) {
  assert.match(source, new RegExp(`'${value}', '${label}', '${time}'`));
}
console.log('onboarding timing tests: PASS');
