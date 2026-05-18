-- ============================================================
-- MIGRACIÓN COMPLETA — Ejecutar en SQL Editor de Supabase
-- Idempotente: puedes correrla varias veces sin problema
-- ============================================================

-- ---------- 1. Columnas faltantes en personas ----------
alter table public.personas
  add column if not exists iglesia text,
  add column if not exists ocupacion text,
  add column if not exists motivo_inicial text,
  add column if not exists notas_generales text,
  add column if not exists tipo_consejeria_id uuid references public.tipos_consejeria(id);

-- ---------- 2. Tipos de consejería: RLS + UNIQUE + seed ----------
delete from public.tipos_consejeria a
using public.tipos_consejeria b
where a.ctid < b.ctid and a.nombre = b.nombre;

alter table public.tipos_consejeria
  drop constraint if exists tipos_consejeria_nombre_unique;
alter table public.tipos_consejeria
  add constraint tipos_consejeria_nombre_unique unique (nombre);

insert into public.tipos_consejeria (nombre, color) values
  ('Individual', 'blue'),
  ('Parejas', 'rose'),
  ('Familiar', 'green'),
  ('Pastoral / Espiritual', 'amber')
on conflict (nombre) do nothing;

alter table public.tipos_consejeria enable row level security;

drop policy if exists "tipos_consejeria: lectura" on public.tipos_consejeria;
create policy "tipos_consejeria: lectura" on public.tipos_consejeria
  for select using (true);

drop policy if exists "tipos_consejeria: escritura authenticated" on public.tipos_consejeria;
create policy "tipos_consejeria: escritura authenticated" on public.tipos_consejeria
  for all using (auth.uid() is not null);

-- ---------- 3. Form Builder: plantillas y preguntas ----------
create table if not exists public.form_plantillas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  nombre text not null,
  descripcion text,
  activo boolean default true not null,
  user_id uuid references auth.users(id) on delete cascade not null
);

create table if not exists public.form_preguntas (
  id uuid primary key default gen_random_uuid(),
  plantilla_id uuid references public.form_plantillas(id) on delete cascade not null,
  orden integer not null default 0,
  tipo text not null,
  pregunta text not null,
  placeholder text,
  requerida boolean default false not null,
  opciones text[]
);

-- Constraint con todos los tipos (incluyendo los nuevos: checkbox, info, firma)
alter table public.form_preguntas
  drop constraint if exists form_preguntas_tipo_check;
alter table public.form_preguntas
  add constraint form_preguntas_tipo_check check (
    tipo in ('texto', 'textarea', 'escala', 'opciones', 'checkbox', 'info', 'firma')
  );

-- ---------- 4. formularios_tokens: plantilla_id + tipo nullable ----------
alter table public.formularios_tokens
  add column if not exists plantilla_id uuid references public.form_plantillas(id);

alter table public.formularios_tokens
  drop constraint if exists formularios_tokens_tipo_check;

alter table public.formularios_tokens
  alter column tipo drop not null;

-- ---------- 5. RLS para nuevas tablas ----------
alter table public.form_plantillas enable row level security;
alter table public.form_preguntas enable row level security;

drop policy if exists "plantillas: propietario" on public.form_plantillas;
create policy "plantillas: propietario" on public.form_plantillas
  for all using (auth.uid() = user_id);

drop policy if exists "plantillas: lectura publica" on public.form_plantillas;
create policy "plantillas: lectura publica" on public.form_plantillas
  for select using (activo = true);

drop policy if exists "preguntas: propietario" on public.form_preguntas;
create policy "preguntas: propietario" on public.form_preguntas
  for all using (
    exists (select 1 from public.form_plantillas p where p.id = plantilla_id and p.user_id = auth.uid())
  );

drop policy if exists "preguntas: lectura publica" on public.form_preguntas;
create policy "preguntas: lectura publica" on public.form_preguntas
  for select using (true);

-- ---------- 6. Fix: permitir que el aconsejado marque el token como usado ----------
drop policy if exists "tokens: marcar usado publico" on public.formularios_tokens;
create policy "tokens: marcar usado publico" on public.formularios_tokens
  for update using (usado_at is null);
