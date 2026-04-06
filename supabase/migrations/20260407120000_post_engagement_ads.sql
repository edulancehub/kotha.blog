-- Run in Supabase SQL editor or via CLI. Safe to re-run fragments manually if needed.

-- Reliable view counter (returns new total)
create or replace function public.increment_post_views(p_post_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v integer;
begin
  update public.posts
  set views = coalesce(views, 0) + 1
  where id = p_post_id
  returning views into v;
  return coalesce(v, 0);
end;
$$;

grant execute on function public.increment_post_views(uuid) to service_role;

-- Comments (signed-in Kotha users)
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) >= 1 and char_length(body) <= 4000),
  created_at timestamptz not null default now()
);

create index if not exists post_comments_post_id_idx on public.post_comments(post_id);
create index if not exists post_comments_created_at_idx on public.post_comments(post_id, created_at);

-- One reaction per user per post (like | dislike | love)
create table if not exists public.post_reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null check (reaction in ('like', 'dislike', 'love')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists post_reactions_post_id_idx on public.post_reactions(post_id);

-- Ad embed slots (owner-controlled; paste AdSense / network snippet in Settings)
alter table public.site_settings
  add column if not exists ads_enabled boolean not null default false;

alter table public.site_settings
  add column if not exists ad_slot_header text not null default '';

alter table public.site_settings
  add column if not exists ad_slot_footer text not null default '';

alter table public.site_settings
  add column if not exists ad_slot_in_article text not null default '';

comment on column public.site_settings.ads_enabled is 'When true, render ad HTML slots on public blog';
comment on column public.site_settings.ad_slot_header is 'HTML/JS snippet below nav (e.g. ad network)';
comment on column public.site_settings.ad_slot_footer is 'HTML/JS snippet above footer';
comment on column public.site_settings.ad_slot_in_article is 'Optional snippet inside article (e.g. after content)';
