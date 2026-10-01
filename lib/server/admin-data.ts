import type { SupabaseClient } from '@supabase/supabase-js';

export type AdminPeriod = { key: string; label: string; from: string; to: string };

function isoDate(value: Date) { return value.toISOString(); }

export function parseAdminPeriod(url: URL): AdminPeriod {
  const key = url.searchParams.get('period') ?? '7d';
  const now = new Date();
  const fromParam = url.searchParams.get('date_from') ?? url.searchParams.get('from');
  const toParam = url.searchParams.get('date_to') ?? url.searchParams.get('to');
  const end = toParam ? new Date(`${toParam}T23:59:59.999Z`) : now;
  let start: Date;
  if (fromParam) start = new Date(`${fromParam}T00:00:00.000Z`);
  else if (key === 'today') start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  else if (key === '30d') start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  else start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { key, label: `${start.toLocaleDateString('es-ES', { dateStyle: 'medium', timeZone: 'UTC' })} — ${end.toLocaleDateString('es-ES', { dateStyle: 'medium', timeZone: 'UTC' })}`, from: isoDate(start), to: isoDate(end) };
}

export async function listAllAuthUsers(admin: SupabaseClient) {
  const users: Array<{ id: string; email?: string; created_at: string; last_sign_in_at?: string | null }> = [];
  let page = 1;
  while (true) {
    const result = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (result.error) throw result.error;
    users.push(...result.data.users);
    if (result.data.users.length < 1000) break;
    page += 1;
  }
  return users;
}

export function parseLimit(value: string | null, fallback = 25, maximum = 100) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? Math.min(Math.max(Math.floor(parsed), 1), maximum) : fallback;
}

export function parseOffset(value: string | null) { return Math.max(Number(value ?? 0) || 0, 0); }

export async function authDirectory(admin: SupabaseClient, userIds?: string[]) {
  const users = await listAllAuthUsers(admin);
  const filtered = userIds ? users.filter(user => userIds.includes(user.id)) : users;
  return new Map(filtered.map(user => [user.id, { id: user.id, email: user.email ?? null, created_at: user.created_at, last_sign_in_at: user.last_sign_in_at ?? null }]));
}

export function userLabel(directory: Map<string, { email: string | null }>, userId?: string | null) {
  if (!userId) return 'Sistema';
  return directory.get(userId)?.email || `${userId.slice(0, 8)}…`;
}
