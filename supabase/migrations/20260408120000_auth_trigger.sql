-- Auto-create profiles and settings on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $body
declare
  v_username text;
  v_display_name text;
begin
  v_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );
  v_display_name := coalesce(
    new.raw_user_meta_data->>'display_name',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, username, display_name, email)
  values (new.id, lower(v_username), v_display_name, new.email)
  on conflict (id) do nothing;

  insert into public.site_settings (user_id, site_name, tagline, theme)
  values (new.id, v_display_name || '''s Blog', 'Welcome to my corner of the web', 'minimal')
  on conflict (user_id) do nothing;

  return new;
end;
$body;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
