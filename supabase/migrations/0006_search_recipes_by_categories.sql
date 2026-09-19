-- Given several category tags (from selected quick-search chips), returns
-- only recipes that carry ALL of them in recipe_categories - a real
-- intersection over precomputed tags, so "Pasta" + "Chicken" finds recipes
-- that are genuinely both, not just ones whose title says so.
create or replace function public.search_recipes_by_categories(categories text[])
returns setof public.recipes
language sql
stable
as $$
  select r.*
  from public.recipes r
  where r.id in (
    select recipe_id
    from public.recipe_categories
    where category = any(categories)
    group by recipe_id
    having count(distinct category) = array_length(categories, 1)
  );
$$;

grant execute on function public.search_recipes_by_categories(text[]) to anon, authenticated;
