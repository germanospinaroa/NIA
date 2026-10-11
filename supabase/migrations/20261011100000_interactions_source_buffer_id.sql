-- Explicitly link a production daily interaction to the NEXT buffer it consumed.
-- This prevents delivery learning from depending on composed-message text.
alter table public.interactions
  add column if not exists source_buffer_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'interactions_source_buffer_id_fkey'
      and conrelid = 'public.interactions'::regclass
  ) then
    alter table public.interactions
      add constraint interactions_source_buffer_id_fkey
      foreign key (source_buffer_id)
      references public.approved_intervention_buffer(id)
      on delete set null;
  end if;
end $$;

create index if not exists interactions_source_buffer_id_idx
  on public.interactions(source_buffer_id)
  where source_buffer_id is not null;
