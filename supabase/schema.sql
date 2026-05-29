-- Pegar todo este archivo en: Supabase → SQL Editor → New query → Run

-- Tabla de actividades
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null,
  created_at timestamptz not null default now()
);

-- Tabla de sesiones
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_id uuid not null references public.activities (id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz
);

-- Como máximo una sesión activa por usuario
create unique index sessions_one_active_per_user
  on public.sessions (user_id)
  where ended_at is null;

create index sessions_user_started_at_idx
  on public.sessions (user_id, started_at desc);

create index activities_user_id_idx
  on public.activities (user_id);

-- Row Level Security
alter table public.activities enable row level security;
alter table public.sessions enable row level security;

-- Políticas: activities
create policy "activities_select_own"
  on public.activities for select
  using (auth.uid() = user_id);

create policy "activities_insert_own"
  on public.activities for insert
  with check (auth.uid() = user_id);

create policy "activities_update_own"
  on public.activities for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "activities_delete_own"
  on public.activities for delete
  using (auth.uid() = user_id);

-- Políticas: sessions
create policy "sessions_select_own"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "sessions_insert_own"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "sessions_update_own"
  on public.sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "sessions_delete_own"
  on public.sessions for delete
  using (auth.uid() = user_id);
