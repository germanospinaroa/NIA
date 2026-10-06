alter table public.interactions drop constraint if exists interactions_interaction_type_check;
alter table public.interactions add constraint interactions_interaction_type_check check (interaction_type in ('daily_message','nia_point','nia_welcome'));
create unique index if not exists interactions_single_welcome on public.interactions(user_id) where interaction_type = 'nia_welcome';
