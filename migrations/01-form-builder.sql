-- ============================================================
-- MIGRACIÓN: Form Builder + Fix token update policy
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. Tabla: plantillas de formulario personalizados
create table if not exists public.form_plantillas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  nombre text not null,
  descripcion text,
  activo boolean default true not null,
  user_id uuid references auth.users(id) on delete cascade not null
);

-- 2. Tabla: preguntas por plantilla
create table if not exists public.form_preguntas (
  id uuid primary key default gen_random_uuid(),
  plantilla_id uuid references public.form_plantillas(id) on delete cascade not null,
  orden integer not null default 0,
  tipo text not null check (tipo in ('texto', 'textarea', 'escala', 'opciones')),
  pregunta text not null,
  placeholder text,
  requerida boolean default false not null,
  opciones text[]  -- solo para tipo='opciones'
);

-- 3. Agregar plantilla_id a formularios_tokens
alter table public.formularios_tokens
  add column if not exists plantilla_id uuid references public.form_plantillas(id);

-- 4. Actualizar constraint de tipo para aceptar 'personalizado'
alter table public.formularios_tokens
  drop constraint if exists formularios_tokens_tipo_check;

alter table public.formularios_tokens
  alter column tipo drop not null;

-- 5. RLS para nuevas tablas
alter table public.form_plantillas enable row level security;
alter table public.form_preguntas enable row level security;

create policy "plantillas: propietario" on public.form_plantillas
  for all using (auth.uid() = user_id);

create policy "plantillas: lectura publica" on public.form_plantillas
  for select using (activo = true);

create policy "preguntas: propietario" on public.form_preguntas
  for all using (
    exists (select 1 from public.form_plantillas p where p.id = plantilla_id and p.user_id = auth.uid())
  );

create policy "preguntas: lectura publica" on public.form_preguntas
  for select using (true);

-- 6. Fix: permitir que el paciente marque el token como usado al enviar el formulario
create policy "tokens: marcar usado publico" on public.formularios_tokens
  for update using (usado_at is null);
