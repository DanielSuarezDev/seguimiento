-- Habilitar RLS (Row Level Security)
-- Ejecutar en el SQL Editor de Supabase

-- Tabla: personas (aconsejados)
create table if not exists public.personas (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  nombre text not null,
  apellido text not null,
  telefono text,
  email text,
  fecha_nacimiento date,
  estado_civil text check (estado_civil in ('soltero', 'casado', 'divorciado', 'viudo', 'union_libre')),
  notas_generales text,
  activo boolean default true not null,
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Tabla: sesiones
create table if not exists public.sesiones (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  persona_id uuid references public.personas(id) on delete cascade not null,
  fecha date not null,
  numero_sesion integer not null default 1,
  motivo_consulta text,
  contenido text,
  versiculos text,
  compromisos text,
  proxima_sesion date,
  estado text check (estado in ('pendiente', 'completada', 'cancelada')) default 'pendiente' not null,
  user_id uuid references auth.users(id) on delete cascade not null
);

-- RLS: solo el usuario ve sus propios datos
alter table public.personas enable row level security;
alter table public.sesiones enable row level security;

create policy "personas: solo el propietario" on public.personas
  for all using (auth.uid() = user_id);

create policy "sesiones: solo el propietario" on public.sesiones
  for all using (auth.uid() = user_id);

-- Índices
create index if not exists idx_sesiones_persona_id on public.sesiones(persona_id);
create index if not exists idx_sesiones_fecha on public.sesiones(fecha desc);
create index if not exists idx_personas_user_id on public.personas(user_id);
