-- Favorites table: mirrors the Recipe type used across the app.
-- Anonymous users (see the client-side sign-in plugin) get a real
-- auth.users row, so this works the same for anonymous and full accounts.

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_id text not null,
  title text not null,
  category text not null,
  area text not null,
  description text not null,
  image text not null,
  created_at timestamptz not null default now(),
  unique (user_id, recipe_id)
);

alter table public.favorites enable row level security;

create policy "Users can view their own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can add their own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);
