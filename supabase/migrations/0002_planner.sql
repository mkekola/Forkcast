-- Planned meals (including drafts, which have day/meal set to null) and
-- shopping list checked-state, mirroring the PlannedMeal/checkedShoppingItems
-- shape the planner store used to keep in localStorage.

create table if not exists public.planned_meals (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  day text,
  meal text,
  recipe_id text not null,
  recipe_name text not null,
  recipe_image text not null,
  category text not null,
  ingredients jsonb,
  created_at timestamptz not null default now()
);

alter table public.planned_meals enable row level security;

create policy "Users can view their own planned meals"
  on public.planned_meals for select
  using (auth.uid() = user_id);

create policy "Users can add their own planned meals"
  on public.planned_meals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own planned meals"
  on public.planned_meals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can remove their own planned meals"
  on public.planned_meals for delete
  using (auth.uid() = user_id);

create table if not exists public.checked_shopping_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_key text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, item_key)
);

alter table public.checked_shopping_items enable row level security;

create policy "Users can view their own checked shopping items"
  on public.checked_shopping_items for select
  using (auth.uid() = user_id);

create policy "Users can add their own checked shopping items"
  on public.checked_shopping_items for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own checked shopping items"
  on public.checked_shopping_items for delete
  using (auth.uid() = user_id);
