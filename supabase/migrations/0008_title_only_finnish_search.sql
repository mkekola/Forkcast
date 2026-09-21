-- Free-text search matched on `instructions` as well as `title`, so
-- searching for an ingredient that's only mentioned in passing within a
-- recipe's steps (e.g. "öljy") surfaced that recipe even when it isn't
-- really "about" that ingredient. Structured filtering for "recipes with
-- roughly this main ingredient" is what recipe_categories (0005) is for -
-- free text search is only meant for finding a recipe by (something close
-- to) its name, so it's narrowed to title only.
--
-- This also switches the tsvector config from english to finnish, now that
-- recipe titles have been translated to Finnish (see the localization work
-- earlier this session) - matching stems correctly again, e.g. a search for
-- "kana" should match a title containing "kanaa" or "kanalla".
drop index if exists public.recipes_search_vector_idx;

alter table public.recipes drop column if exists search_vector;

alter table public.recipes add column search_vector tsvector
  generated always as (
    to_tsvector('finnish', coalesce(title, ''))
  ) stored;

create index recipes_search_vector_idx on public.recipes using gin (search_vector);
