import assert from 'node:assert/strict';
import fs from 'node:fs';

const premium = fs.readFileSync('components/funnel/PremiumDiscover.tsx', 'utf8');
const styles = fs.readFileSync('app/globals.css', 'utf8');
assert.match(premium, /useLayoutEffect/);
assert.match(premium, /window\.scrollTo\(\{ top: 0, left: 0, behavior: 'auto' \}\)/);
assert.match(styles, /\.premium-progress[^\{]*\{[^}]*width:/s);
assert.match(styles, /\.premium-screen\.is-recognition/);
assert.match(styles, /\.premium-screen\.is-demo/);
assert.match(styles, /\.premium-screen\.is-testimonials/);
assert.match(styles, /env\(safe-area-inset-bottom\)/);
assert.doesNotMatch(styles, /\.premium-screen-9|\.premium-screen-8|\.premium-screen-7/);
assert.doesNotMatch(premium, /smooth/);
console.log('premium short funnel CSS regression: PASS');
