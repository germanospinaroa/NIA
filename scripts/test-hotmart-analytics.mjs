import assert from 'node:assert/strict';
import fs from 'node:fs';

const analytics = fs.readFileSync('components/analytics/HotmartAnalytics.tsx', 'utf8');
const frame = fs.readFileSync('components/funnel/FunnelFrame.tsx', 'utf8');
const activate = fs.readFileSync('app/activate/page.tsx', 'utf8');
const attribution = fs.readFileSync('lib/marketing-attribution.ts', 'utf8');
const checkout = fs.readFileSync('lib/hotmart-checkout.ts', 'utf8');
const privacy = fs.readFileSync('app/privacidad/page.tsx', 'utf8');

assert.match(analytics, /id="hotmart_launcher_script"/);
assert.match(analytics, /strategy="afterInteractive"/);
assert.match(analytics, /launcher\.hotmart\.com\/launcher\.js/);
assert.match(analytics, /hot\('account','ca466c8d-ad85-30c6-ad61-62464a24e7e1'\)/);
assert.match(analytics, /h\.async=1/);
assert.doesNotMatch(analytics, /email|phone|whatsapp|onboarding|psychological|intervention|support/i);
assert.match(frame, /HotmartAnalytics/);
assert.match(activate, /HotmartAnalytics/);
assert.doesNotMatch(fs.readFileSync('app/admin/layout.tsx', 'utf8'), /HotmartAnalytics|hotmart_launcher_script/);
for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'src', 'sck', 'xcod']) {
  assert.match(attribution, new RegExp(`['"]${key}['"]`));
}
assert.match(attribution, /localStorage\.setItem\(STORAGE_KEY/);
assert.match(attribution, /sessionStorage\.setItem\(STORAGE_KEY/);
assert.match(checkout, /new URL\(checkout\.url\)/);
assert.match(checkout, /url\.searchParams\.set\(key, value\)/);
assert.match(checkout, /r7w7emsp/);
assert.match(checkout, /3z4a0vad/);
assert.match(privacy, /Hotmart Analytics/);
console.log('hotmart analytics tests: PASS');
