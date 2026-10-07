alter table public.whatsapp_link_tokens
  add column if not exists purpose text not null default 'connect';

alter table public.whatsapp_link_tokens
  drop constraint if exists whatsapp_link_tokens_purpose_check;

alter table public.whatsapp_link_tokens
  add constraint whatsapp_link_tokens_purpose_check
  check (purpose in ('connect', 'replace'));

create index if not exists whatsapp_link_tokens_user_purpose_status
  on public.whatsapp_link_tokens(user_id, purpose, status, created_at desc);
