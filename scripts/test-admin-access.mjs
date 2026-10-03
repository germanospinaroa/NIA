import assert from 'node:assert/strict';
import fs from 'node:fs';
import { isAdminEmail } from '../lib/admin-allowlist.ts';
import { getSafeNextPath } from '../lib/safe-next.ts';

assert.equal(isAdminEmail('admin@example.com', 'admin@example.com'), true);
assert.equal(isAdminEmail(' Admin@Example.com ', 'admin@example.com,other@example.com'), true);
assert.equal(isAdminEmail('person@example.com', 'admin@example.com'), false);
assert.equal(isAdminEmail(null, 'admin@example.com'), false);

assert.equal(getSafeNextPath('/admin'), '/admin');
assert.equal(getSafeNextPath('/admin/users/123'), '/admin/users/123');
assert.equal(getSafeNextPath('/app'), '/app');
assert.equal(getSafeNextPath('https://evil.com'), '/app');
assert.equal(getSafeNextPath('//evil.com'), '/app');
assert.equal(getSafeNextPath('https://nia.gritlab.pro/admin'), '/app');

const middleware = fs.readFileSync('middleware.ts', 'utf8');
const adminAccess = fs.readFileSync('app/api/admin/access/route.ts', 'utf8');
const qaRoute = fs.readFileSync('app/api/admin/qa/daily-intervention/route.ts', 'utf8');
const tu = fs.readFileSync('app/app/tu/page.tsx', 'utf8');

assert.match(middleware, /isAdminEmail\(user\.email\)/);
assert.match(middleware, /new NextResponse\('Forbidden'/);
assert.match(middleware, /\/login\?next=\/admin/);
assert.match(middleware, /getSafeNextPath\(request\.nextUrl\.searchParams\.get\('next'\)\)/);
assert.match(adminAccess, /requireAdmin\(\)/);
assert.match(adminAccess, /status: 403/);
assert.match(qaRoute, /requireAdmin\(\)/);
assert.ok(tu.includes("fetch('/api/admin/access')"));
assert.ok(tu.includes('isAdmin'));
assert.ok(tu.includes('Administración'));

const login = fs.readFileSync('app/login/page.tsx', 'utf8');
assert.ok(login.includes('window.location.search'));
assert.match(login, /router\.push\(nextPath\)/);

console.log('admin access tests: PASS');
