-- ═══════════════════════════════════════════════════════════════
-- Kotha.blog — Schema V2: Admin + Extended themes + Reactions
-- Run AFTER the initial schema. Idempotent.
-- ═══════════════════════════════════════════════════════════════

-- ── Add admin flag to profiles ─────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- ── Drop old theme check to allow expanded set ─────────────────
ALTER TABLE public.site_settings DROP CONSTRAINT IF EXISTS site_settings_theme_check;

-- ── Reactions table (like / dislike / love) ─────────────────────
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction text NOT NULL CHECK (reaction IN ('like', 'dislike', 'love')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions readable by all" ON public.post_reactions
  FOR SELECT USING (true);
CREATE POLICY "Users manage own reactions" ON public.post_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own reactions" ON public.post_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- ── Comments table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments readable by all" ON public.post_comments
  FOR SELECT USING (true);
CREATE POLICY "Users insert own comments" ON public.post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own comments" ON public.post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- ── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reactions_post ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.post_comments(user_id);

-- ── Admin RLS: allow admins to delete others' posts/comments ──
-- Admins bypass delete restrictions
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Allow admins to delete any post
DROP POLICY IF EXISTS "Admins can delete any post" ON public.posts;
CREATE POLICY "Admins can delete any post" ON public.posts
  FOR DELETE USING (public.is_admin());

-- Allow admins to delete any comment
DROP POLICY IF EXISTS "Admins can delete any comment" ON public.post_comments;
CREATE POLICY "Admins can delete any comment" ON public.post_comments
  FOR DELETE USING (public.is_admin());

-- Allow admins to delete profiles (remove subdomains)
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;
CREATE POLICY "Admins can delete any profile" ON public.profiles
  FOR DELETE USING (public.is_admin());

-- Increment views helper
CREATE OR REPLACE FUNCTION public.increment_post_views(p_post_id uuid)
RETURNS int AS $$
DECLARE
  new_views int;
BEGIN
  UPDATE public.posts SET views = views + 1 WHERE id = p_post_id RETURNING views INTO new_views;
  RETURN COALESCE(new_views, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
