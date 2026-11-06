-- ==============================================================================
-- HB+ Fit Workspace — Database Schema (PostgreSQL on Supabase)
-- ==============================================================================

-- 1. Create User Profiles Table (Stores user data and roles)
create table if not exists public.user_profiles (
  id text primary key,
  email text unique not null,
  display_name text,
  avatar_url text,
  domain text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  last_login_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 2. Create Security Audit Logs Table (Captures allowed vs blocked domain attempts)
create table if not exists public.audit_logs (
  id text primary key default gen_random_uuid()::text,
  timestamp timestamptz default now(),
  email text not null,
  domain text,
  status text not null check (status in ('allowed', 'rejected', 'signed_out')),
  reason text
);

-- 3. Enable Row Level Security (RLS)
alter table public.user_profiles enable row level security;
alter table public.audit_logs enable row level security;

-- 4. Create Policies (Permit authenticated and anon read/write for client operations)
drop policy if exists "Allow read user_profiles" on public.user_profiles;
create policy "Allow read user_profiles" on public.user_profiles for select using (true);

drop policy if exists "Allow upsert user_profiles" on public.user_profiles;
create policy "Allow upsert user_profiles" on public.user_profiles for all using (true) with check (true);

drop policy if exists "Allow read audit_logs" on public.audit_logs;
create policy "Allow read audit_logs" on public.audit_logs for select using (true);

drop policy if exists "Allow insert audit_logs" on public.audit_logs;
create policy "Allow insert audit_logs" on public.audit_logs for insert with check (true);

-- 5. Seed Initial Organization Directory
insert into public.user_profiles (id, email, display_name, domain, role)
values
  ('usr_hb_01', 'admin@hbplus.fit', 'System Administrator', 'hbplus.fit', 'admin'),
  ('usr_hb_02', 'kaif@hbplus.fit', 'Kaif Sardar', 'hbplus.fit', 'admin'),
  ('usr_hb_03', 'sarah.jenkins@hbplus.fit', 'Sarah Jenkins', 'hbplus.fit', 'user'),
  ('usr_hb_04', 'marcus.vance@hbplus.fit', 'Marcus Vance', 'hbplus.fit', 'user')
on conflict (email) do nothing;
