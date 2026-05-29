-- Ejecutar en Supabase → SQL Editor (después del schema.sql original)

-- Marca qué usuarios ya recibieron actividades por defecto (solo una vez)
create table if not exists public.user_setup (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.user_setup enable row level security;

-- Evita duplicados futuros por nombre dentro del mismo usuario
create unique index if not exists activities_user_name_unique
  on public.activities (user_id, name);

-- Inserta actividades por defecto solo la primera vez (atómico, sin carreras)
create or replace function public.seed_default_activities()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.user_setup (user_id) values (uid)
  on conflict do nothing;

  if not found then
    return;
  end if;

  if exists (select 1 from public.activities where user_id = uid) then
    return;
  end if;

  insert into public.activities (user_id, name, color) values
    (uid, 'Trabajo', '#3b82f6'),
    (uid, 'Deporte', '#22c55e'),
    (uid, 'Dormir', '#6366f1'),
    (uid, 'Comer', '#f59e0b'),
    (uid, 'Ocio', '#ec4899');
end;
$$;

grant execute on function public.seed_default_activities() to authenticated;
