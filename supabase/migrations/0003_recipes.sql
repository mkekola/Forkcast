-- Our own copy of TheMealDB's recipe catalog, imported once via CSV so
-- search/filtering can run as real SQL instead of being limited by
-- TheMealDB's live API (one category per recipe, no ingredient search,
-- aggressive rate limiting on detail lookups).
--
-- This is public reference data, not user data: anyone can read it, and
-- there are intentionally no insert/update/delete policies for the anon
-- role, since only an admin re-running the import should ever write here.

create table if not exists public.recipes (
  id text primary key,
  title text not null,
  category text not null,
  area text not null,
  instructions text,
  image text not null,
  youtube text,
  source text,
  created_at timestamptz not null default now()
);

alter table public.recipes enable row level security;

create policy "Anyone can read recipes"
  on public.recipes for select
  using (true);

create table if not exists public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id text not null references public.recipes (id) on delete cascade,
  position smallint not null,
  name text not null,
  measure text
);

alter table public.recipe_ingredients enable row level security;

create policy "Anyone can read recipe ingredients"
  on public.recipe_ingredients for select
  using (true);

create index if not exists recipes_category_idx on public.recipes (category);
create index if not exists recipes_area_idx on public.recipes (area);
create index if not exists recipe_ingredients_recipe_id_idx on public.recipe_ingredients (recipe_id);
create index if not exists recipe_ingredients_name_idx on public.recipe_ingredients (lower(name));

-- Full-text search across title + instructions, so free-text search can be
-- a real ranked search instead of a client-side substring match.
alter table public.recipes add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(instructions, '')), 'B')
  ) stored;

create index if not exists recipes_search_vector_idx on public.recipes using gin (search_vector);
