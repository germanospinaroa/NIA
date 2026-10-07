import assert from 'node:assert/strict';
import fs from 'node:fs';
import { preferredAddressName } from '../lib/profile-name.ts';

assert.equal(preferredAddressName({ preferred_name: 'Vale', first_name: 'Valentina María' }), 'Vale');
assert.equal(preferredAddressName({ preferred_name: null, first_name: 'Valentina María' }), 'Valentina María');
assert.equal(preferredAddressName({ preferred_name: null, first_name: null }), null);
assert.equal(preferredAddressName({ preferred_name: '  María   José  ', first_name: 'María José' }), 'María   José');

const funnel = fs.readFileSync('components/funnel/PremiumDiscover.tsx', 'utf8');
const onboarding = fs.readFileSync('app/onboarding/page.tsx', 'utf8');
const access = fs.readFileSync('app/api/auth/access/request/route.ts', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20261006170000_identity_names_onboarding.sql', 'utf8');
assert.match(funnel, /preferredName/);
assert.doesNotMatch(funnel, /Buenos días, Juanita/);
assert.match(onboarding, /first_name: nextFirst/);
assert.match(onboarding, /last_name: nextLast/);
assert.match(onboarding, /preferred_name: nextPreferred/);
assert.doesNotMatch(access, /first_name: 'NIA'/);
assert.match(migration, /alter column first_name drop not null/);
assert.match(migration, /add column if not exists last_name/);
assert.match(migration, /add column if not exists preferred_name/);
console.log('identity names tests: PASS');
