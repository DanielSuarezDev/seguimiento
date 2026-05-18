-- ============================================================
-- MIGRACIÓN: Fix tipos_consejeria (RLS + seed + unique)
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. Limpiar duplicados (si existen)
delete from public.tipos_consejeria a
using public.tipos_consejeria b
where a.ctid < b.ctid and a.nombre = b.nombre;

-- 2. UNIQUE en nombre para evitar futuros duplicados
alter table public.tipos_consejeria
  drop constraint if exists tipos_consejeria_nombre_unique;
alter table public.tipos_consejeria
  add constraint tipos_consejeria_nombre_unique unique (nombre);

-- 3. Asegurar seed data (los 4 tipos por defecto)
insert into public.tipos_consejeria (nombre, color) values
  ('Individual', 'blue'),
  ('Parejas', 'rose'),
  ('Familiar', 'green'),
  ('Pastoral / Espiritual', 'amber')
on conflict (nombre) do nothing;

-- 4. Habilitar RLS con políticas correctas
--    (sin esto, Supabase no devuelve filas en muchas configuraciones)
alter table public.tipos_consejeria enable row level security;

drop policy if exists "tipos_consejeria: lectura" on public.tipos_consejeria;
create policy "tipos_consejeria: lectura" on public.tipos_consejeria
  for select using (true);

drop policy if exists "tipos_consejeria: escritura authenticated" on public.tipos_consejeria;
create policy "tipos_consejeria: escritura authenticated" on public.tipos_consejeria
  for all using (auth.uid() is not null);
