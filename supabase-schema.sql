-- ═══════════════════════════════════════════════════════════════
-- Kotha.blog — Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up all tables
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ── Users Profile (extends Supabase auth.users) ────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null default '',
  email text not null,
  bio text default '',
  avatar_url text default '',
  joined_at timestamptz default now(),
  followers int default 0,
  following int default 0
);

-- Enforce lowercase + DNS-safe usernames
alter table public.profiles
  add constraint username_format
  check (username ~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$');

-- ── Posts ───────────────────────────────────────────────────────
create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null,
  title text not null,
  subtitle text default '',
  excerpt text default '',
  content text default '',
  cover_image text default '',
  tags text[] default '{}',
  published boolean default false,
  claps int default 0,
  views int default 0,
  read_time int default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, slug)
);

-- ── Site Settings (per-user blog theme & customization) ────────
create table if not exists public.site_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  site_name text default '',
  tagline text default '',
  theme text default 'minimal' check (theme in ('minimal', 'dark-noir', 'vintage-press', 'neon-vapor', 'forest', 'ocean-breeze')),
  accent_color text default '#0d9488',
  bg_color text default '#fafaf9',
  text_color text default '#1c1917',
  font_family text default 'serif' check (font_family in ('serif', 'sans', 'mono')),
  header_style text default 'centered' check (header_style in ('minimal', 'bold', 'centered')),
  show_bio boolean default true,
  social_twitter text default '',
  social_github text default '',
  social_website text default '',
  custom_css text default '',
  logo_url text default ''
);

-- ── Reserved Usernames ─────────────────────────────────────────
create table if not exists public.reserved_usernames (
  username text primary key
);

insert into public.reserved_usernames (username) values
  ('www'), ('app'), ('api'), ('admin'), ('dashboard'), ('mail'), ('ftp'), ('cdn'),
  ('static'), ('assets'), ('claim'), ('help'), ('support'), ('status'), ('blog'),
  ('docs'), ('staging'), ('dev'), ('test'), ('signin'), ('signup'), ('login'),
  ('logout'), ('register'), ('settings'), ('explore'), ('trending'), ('feed'),
  ('search'), ('new'), ('edit'), ('delete'), ('account'), ('profile'),
  ('notifications'), ('messages'), ('billing'), ('kotha'), ('about'),
  ('contact'), ('privacy'), ('terms'), ('legal'), ('sign-in'), ('sign-up')
on conflict do nothing;

-- ── Indexes ────────────────────────────────────────────────────
create index if not exists idx_profiles_username on public.profiles(username);
create index if not exists idx_posts_user_id on public.posts(user_id);
create index if not exists idx_posts_published on public.posts(published);
create index if not exists idx_posts_created on public.posts(created_at desc);
create index if not exists idx_posts_slug on public.posts(slug);

-- ── RLS Policies ───────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.site_settings enable row level security;
alter table public.reserved_usernames enable row level security;

-- Profiles: anyone can read, owner can update
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Posts: published posts are public, drafts only for owner
create policy "Published posts are viewable by everyone"
  on public.posts for select using (published = true or auth.uid() = user_id);
create policy "Users can insert own posts"
  on public.posts for insert with check (auth.uid() = user_id);
create policy "Users can update own posts"
  on public.posts for update using (auth.uid() = user_id);
create policy "Users can delete own posts"
  on public.posts for delete using (auth.uid() = user_id);

-- Site settings: anyone can read, owner can update
create policy "Site settings are viewable by everyone"
  on public.site_settings for select using (true);
create policy "Users can update own settings"
  on public.site_settings for update using (auth.uid() = user_id);
create policy "Users can insert own settings"
  on public.site_settings for insert with check (auth.uid() = user_id);

-- Reserved usernames: anyone can read
create policy "Reserved usernames are viewable by everyone"
  on public.reserved_usernames for select using (true);

-- ── Function: auto-set updated_at ──────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_post_update
  before update on public.posts
  for each row execute function public.handle_updated_at();

-- ── Function: estimate read time ───────────────────────────────
create or replace function public.estimate_read_time(content text)
returns int as $$
declare
  word_count int;
begin
  word_count := array_length(regexp_split_to_array(regexp_replace(content, '<[^>]*>', '', 'g'), '\s+'), 1);
  return greatest(1, round(word_count / 200.0));
end;
$$ language plpgsql immutable;
