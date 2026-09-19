-- Lets the inspiration carousel ask Postgres for N random recipes directly
-- instead of repeatedly guessing via the client, like the old TheMealDB
-- integration had to (reroll random.php until enough had a tagged area).
create or replace function public.get_random_recipes(recipe_count int default 5)
returns setof public.recipes
language sql
stable
as $$
  select * from public.recipes order by random() limit recipe_count;
$$;

grant execute on function public.get_random_recipes(int) to anon, authenticated;
