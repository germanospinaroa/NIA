-- Vector storage is additive. The embedding model and dimension are centralized in server config.
create extension if not exists vector with schema extensions;
alter table public.interventions add column if not exists embedding extensions.vector(1536);
alter table public.intervention_candidates add column if not exists embedding extensions.vector(1536);
create index if not exists interventions_embedding_hnsw on public.interventions using hnsw (embedding vector_cosine_ops) where embedding is not null;

create or replace function public.match_intervention_embeddings(
  p_user_id uuid,
  p_query_embedding extensions.vector(1536),
  p_limit integer default 100
)
returns table (
  intervention_id uuid,
  text text,
  similarity real,
  concept text,
  angle text,
  function text,
  created_at timestamptz
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select i.id,
         i.text,
         (1 - (i.embedding <=> p_query_embedding))::real as similarity,
         i.concept,
         i.angle,
         i.function,
         i.created_at
  from public.interventions i
  where i.user_id = p_user_id
    and p_user_id = (select auth.uid())
    and i.embedding is not null
  order by i.embedding <=> p_query_embedding
  limit greatest(1, least(p_limit, 200));
$$;
