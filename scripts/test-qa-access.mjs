import assert from 'node:assert/strict';
import fs from 'node:fs';
import { isAdminEmail } from '../lib/admin-allowlist.ts';
import { isQaEmail } from '../lib/qa-allowlist.ts';

assert.equal(isQaEmail(' QA@example.com ', 'qa@example.com,other@example.com'), true);
assert.equal(isQaEmail('other@example.com', ' qa@example.com , other@example.com '), true);
assert.equal(isQaEmail('qa@example.com.evil', 'qa@example.com'), false);
assert.equal(isQaEmail('person@qa.example.com', 'qa.example.com'), false);
assert.equal(isQaEmail('qa@example.com', 'other@example.com'), false);
assert.equal(isQaEmail(null, 'qa@example.com'), false);
assert.equal(isAdminEmail('qa@example.com', 'admin@example.com'), false);

const route = fs.readFileSync('app/api/auth/access/request/route.ts', 'utf8');
const adminAccess = fs.readFileSync('lib/server/admin-access.ts', 'utf8');
const adminRoute = fs.readFileSync('app/api/admin/access/route.ts', 'utf8');

assert.match(route, /isAdminEmail\(email\)/);
assert.match(route, /isQaEmail\(email\)/);
assert.match(route, /const accessAuthorized = adminAuthorized \|\| qaAuthorized/);
assert.match(route, /shouldCreateUser: false/);
assert.match(route, /randomBytes\(32\)\.toString\('hex'\)/);
assert.match(route, /email_confirm: true/);
assert.match(route, /account_status: 'pending_activation'/);
assert.match(route, /profiles.*upsert/s);
assert.match(route, /if \(!eligible && !accessAuthorized\) return NextResponse\.json\(\{ ok: true \}\)/);
assert.match(adminAccess, /isAdminEmail\(user\.email\)/);
assert.match(adminRoute, /requireAdmin\(\)/);

console.log('QA access separation tests: PASS');
