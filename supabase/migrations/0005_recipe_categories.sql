-- Precomputed multi-category tags per recipe, so quick-search chips can be
-- combined as a real SQL intersection instead of fetching one category and
-- keyword-filtering it in JS. A recipe keeps its original TheMealDB
-- category as a tag (this is also the only source for Vegetarian/Vegan -
-- see below), plus any protein/dish tag a real ingredient justifies, e.g. a
-- "Pasta"-category recipe that actually contains chicken also gets tagged
-- "Chicken", which is what lets "Pasta + Chicken" or "Pork + Pasta" chip
-- combinations return real matches instead of only ever matching recipes
-- whose title happens to mention both words.
--
-- Vegan is intentionally NOT re-derived from ingredients: reliably telling
-- dairy "Milk" apart from "Coconut Milk", or catching honey/gelatine, needs
-- word-boundary-aware matching this migration doesn't attempt, so Vegan
-- only carries recipes TheMealDB already tagged as such. Vegetarian *is*
-- re-derived (as "no meat/fish ingredient"), since without it a Vegetarian
-- chip could never combine with any other category at all.

create table if not exists public.recipe_categories (
  recipe_id text not null references public.recipes (id) on delete cascade,
  category text not null,
  primary key (recipe_id, category)
);

alter table public.recipe_categories enable row level security;

create policy "Anyone can read recipe categories"
  on public.recipe_categories for select
  using (true);

create index if not exists recipe_categories_category_idx on public.recipe_categories (category);

-- 1. Every recipe keeps its original category as a tag.
insert into public.recipe_categories (recipe_id, category)
select id, category from public.recipes
on conflict do nothing;

-- 2. Protein/dish tags derived from real ingredients.
insert into public.recipe_categories (recipe_id, category)
select distinct r.id, 'Chicken'
from public.recipes r
join public.recipe_ingredients ri on ri.recipe_id = r.id
where ri.name ilike '%chicken%'
on conflict do nothing;

insert into public.recipe_categories (recipe_id, category)
select distinct r.id, 'Beef'
from public.recipes r
join public.recipe_ingredients ri on ri.recipe_id = r.id
where ri.name ilike any (array['%beef%', '%steak%', '%oxtail%', '%brisket%'])
on conflict do nothing;

insert into public.recipe_categories (recipe_id, category)
select distinct r.id, 'Pork'
from public.recipes r
join public.recipe_ingredients ri on ri.recipe_id = r.id
where ri.name ilike any (array[
  '%pork%', '%bacon%', '%ham%', '%sausage%', '%chorizo%', '%prosciutto%', '%pancetta%', '%gammon%'
])
on conflict do nothing;

insert into public.recipe_categories (recipe_id, category)
select distinct r.id, 'Lamb'
from public.recipes r
join public.recipe_ingredients ri on ri.recipe_id = r.id
where ri.name ilike '%lamb%'
on conflict do nothing;

-- "goat meat" rather than "goat", since "Goats Cheese" is a dairy
-- ingredient, not goat meat.
insert into public.recipe_categories (recipe_id, category)
select distinct r.id, 'Goat'
from public.recipes r
join public.recipe_ingredients ri on ri.recipe_id = r.id
where ri.name ilike '%goat meat%'
on conflict do nothing;

insert into public.recipe_categories (recipe_id, category)
select distinct r.id, 'Seafood'
from public.recipes r
join public.recipe_ingredients ri on ri.recipe_id = r.id
where ri.name ilike any (array[
  '%fish%', '%prawn%', '%shrimp%', '%salmon%', '%cod%', '%tuna%', '%squid%', '%crab%',
  '%lobster%', '%mussel%', '%scallop%', '%anchov%', '%seafood%', '%haddock%', '%trout%', '%sardine%'
])
on conflict do nothing;

insert into public.recipe_categories (recipe_id, category)
select distinct r.id, 'Pasta'
from public.recipes r
join public.recipe_ingredients ri on ri.recipe_id = r.id
where ri.name ilike any (array[
  '%pasta%', '%spaghetti%', '%linguine%', '%fettuccine%', '%macaroni%', '%penne%', '%noodle%',
  '%lasagne%', '%ravioli%', '%tagliatelle%', '%rigatoni%', '%orzo%'
])
on conflict do nothing;

-- 3. Derive a Vegetarian tag for any recipe with no meat/fish ingredient,
--    regardless of its original category. "mince" is deliberately left out
--    of this exclusion list - it's redundant (Lamb/Beef/Pork Mince are
--    already caught by their own keyword) and would otherwise wrongly
--    disqualify a recipe over "Minced Garlic".
insert into public.recipe_categories (recipe_id, category)
select r.id, 'Vegetarian'
from public.recipes r
where not exists (
  select 1 from public.recipe_ingredients ri
  where ri.recipe_id = r.id
  and ri.name ilike any (array[
    '%chicken%', '%beef%', '%pork%', '%bacon%', '%ham%', '%sausage%', '%chorizo%', '%prosciutto%',
    '%pancetta%', '%gammon%', '%steak%', '%oxtail%', '%brisket%', '%lamb%', '%goat meat%', '%duck%',
    '%turkey%', '%veal%', '%venison%', '%meat%', '%fish%', '%prawn%', '%shrimp%', '%salmon%',
    '%cod%', '%tuna%', '%squid%', '%crab%', '%lobster%', '%mussel%', '%scallop%', '%anchov%',
    '%seafood%', '%haddock%', '%trout%', '%sardine%', '%gelatin%', '%gelatine%', '%lard%', '%suet%'
  ])
)
on conflict do nothing;
