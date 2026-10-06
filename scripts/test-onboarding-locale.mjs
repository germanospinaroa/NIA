import assert from 'node:assert/strict';
import fs from 'node:fs';
import { countryFromBrowserLocale, timeLabel, timezoneLabel } from '../lib/locale.ts';

assert.equal(countryFromBrowserLocale('es-CO'), 'CO');
assert.equal(countryFromBrowserLocale('en-US'), 'US');
assert.match(timezoneLabel('America/New_York'), /New York · GMT/);
assert.match(timezoneLabel('Europe/Madrid'), /Madrid · GMT/);
assert.equal(timeLabel('08:00'), '8:00 a. m.');
assert.equal(timeLabel('20:05'), '8:05 p. m.');

const onboarding = fs.readFileSync('app/onboarding/page.tsx', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20261006150000_onboarding_locale_whatsapp_expectation.sql', 'utf8');
assert.match(onboarding, /country_code/);
assert.match(onboarding, /timezoneFromBrowser/);
assert.match(onboarding, /onboarding-country/);
assert.match(onboarding, /onboarding-timezone/);
assert.doesNotMatch(onboarding, /setTimezone\('America\/Bogota'\)/);
assert.match(migration, /add column if not exists country_code/);
assert.match(migration, /add column if not exists expected_phone/);

console.log('onboarding locale tests: PASS');
