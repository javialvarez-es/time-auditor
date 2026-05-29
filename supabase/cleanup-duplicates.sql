-- Pegar en Supabase → SQL Editor → Run
-- Borra actividades duplicadas (conserva la más antigua por usuario + nombre)

delete from public.activities
where id not in (
  select distinct on (user_id, name) id
  from public.activities
  order by user_id, name, created_at asc
);
