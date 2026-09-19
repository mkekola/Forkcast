-- 0005 matched "ham" as a plain substring, which also matched "Graham
-- Cracker Crumbs" and wrongly tagged Flapper Pie (and any future recipe
-- using that ingredient) as Pork, and wrongly excluded it from Vegetarian.
-- 0005 itself has been corrected to use a word-boundary match instead; this
-- migration re-applies that fix to data already inserted by the old logic.

delete from public.recipe_categories rc
where rc.category = 'Pork'
and not exists (
  select 1 from public.recipe_ingredients ri
  where ri.recipe_id = rc.recipe_id
  and (
    ri.name ilike any (array[
      '%pork%', '%bacon%', '%sausage%', '%chorizo%', '%prosciutto%', '%pancetta%', '%gammon%'
    ])
    or ri.name ~* '\yham\y'
  )
);

insert into public.recipe_categories (recipe_id, category)
select r.id, 'Vegetarian'
from public.recipes r
where not exists (
  select 1 from public.recipe_ingredients ri
  where ri.recipe_id = r.id
  and (
    ri.name ilike any (array[
      '%chicken%', '%beef%', '%pork%', '%bacon%', '%sausage%', '%chorizo%', '%prosciutto%',
      '%pancetta%', '%gammon%', '%steak%', '%oxtail%', '%brisket%', '%lamb%', '%goat meat%', '%duck%',
      '%turkey%', '%veal%', '%venison%', '%meat%', '%fish%', '%prawn%', '%shrimp%', '%salmon%',
      '%cod%', '%tuna%', '%squid%', '%crab%', '%lobster%', '%mussel%', '%scallop%', '%anchov%',
      '%seafood%', '%haddock%', '%trout%', '%sardine%', '%gelatin%', '%gelatine%', '%lard%', '%suet%'
    ])
    or ri.name ~* '\yham\y'
  )
)
on conflict do nothing;
