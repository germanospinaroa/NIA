import assert from 'node:assert/strict';
import fs from 'node:fs';

const service = fs.readFileSync('lib/server/next-message-health.ts', 'utf8');
const route = fs.readFileSync('app/api/admin/users/[id]/next-message/route.ts', 'utf8');
const users = fs.readFileSync('app/admin/users/page.tsx', 'utf8');

assert.match(service, /export type NextMessageHealth/);
assert.match(service, /activeNextCount/);
assert.match(service, /next_ready/);
assert.match(service, /missing_next/);
assert.match(service, /multiple_active_next/);
assert.match(service, /stale_context_version/);
assert.match(service, /composeNiaMessage/);
assert.match(service, /Promise\.all/);
assert.match(route, /requireAdmin/);
assert.match(route, /recordAdminAudit/);
assert.match(route, /getNextMessageHealthDetail/);
assert.match(users, /Siguiente mensaje/);
assert.match(users, /user\.next_message_health\?\.status === 'ok'/);
assert.match(users, /next-message/);
console.log('next-message health contract tests: PASS');
