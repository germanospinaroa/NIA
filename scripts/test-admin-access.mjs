import assert from 'node:assert/strict';
import fs from 'node:fs';
import { isAdminEmail } from '../lib/admin-allowlist.ts';

assert.equal(isAdminEmail('admin@example.com', 'admin@example.com'), true);
assert.equal(isAdminEmail(' Admin@Example.com ', 'admin@example.com,other@example.com'), true);
assert.equal(isAdminEmail('person@example.com', 'admin@example.com'), false);
assert.equal(isAdminEmail(null, 'admin@example.com'), false);

const middleware = fs.readFileSync('middleware.ts', 'utf8');
const adminAccess = fs.readFileSync('app/api/admin/access/route.ts', 'utf8');
const qaRoute = fs.readFileSync('app/api/admin/qa/daily-intervention/route.ts', 'utf8');
const tu = fs.readFileSync('app/app/tu/page.tsx', 'utf8');

assert.match(middleware, /isAdminEmail\(user\.email\)/);
assert.match(middleware, /new NextResponse\('Forbidden'/);
assert.match(middleware, /\/login\?next=\/admin/);
assert.match(adminAccess, /requireAdmin\(\)/);
assert.match(adminAccess, /status: 403/);
assert.match(qaRoute, /requireAdmin\(\)/);
assert.ok(tu.includes("fetch('/api/admin/access')"));
assert.ok(tu.includes('isAdmin'));
assert.ok(tu.includes('Administración'));

console.log('admin access tests: PASS');
