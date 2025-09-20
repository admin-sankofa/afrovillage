-- Supabase RLS policies for Afro Village application
-- Apply with: psql $DATABASE_URL -f supabase/rls-policies.sql

-- Users table: allow each authenticated user to read/update their own row
alter table if exists public.users enable row level security;

create policy if not exists users_select_own on public.users
  for select using (id = auth.uid());

create policy if not exists users_update_own on public.users
  for update using (id = auth.uid());

-- Artist profiles: tie access to owning user id
alter table if exists public.artist_profiles enable row level security;

create policy if not exists artist_profiles_select_own on public.artist_profiles
  for select using (user_id = auth.uid());

create policy if not exists artist_profiles_insert_own on public.artist_profiles
  for insert with check (user_id = auth.uid());

create policy if not exists artist_profiles_update_own on public.artist_profiles
  for update using (user_id = auth.uid());

-- Messages: authors can manage their own content, community feed is readable
alter table if exists public.messages enable row level security;

create policy if not exists messages_select_own on public.messages
  for select using (sender_id = auth.uid() or recipient_id is null or recipient_id = auth.uid());

create policy if not exists messages_insert_own on public.messages
  for insert with check (sender_id = auth.uid());

create policy if not exists messages_update_own on public.messages
  for update using (sender_id = auth.uid());
