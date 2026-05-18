-- ============================================================
-- SEGUIMIENTO — Consejería Bíblica
-- Ejecutar completo en el SQL Editor de Supabase
-- ============================================================

-- Tabla: tipos_consejeria (catálogo, sin RLS)
create table if not exists public.tipos_consejeria (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  color text not null default 'amber'
);

insert into public.tipos_consejeria (nombre, color) values
  ('Individual', 'blue'),
  ('Parejas', 'rose'),
  ('Familiar', 'green'),
  ('Pastoral / Espiritual', 'amber')
on conflict do nothing;

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
  tipo_consejeria_id uuid references public.tipos_consejeria(id),
  ocupacion text,
  iglesia text,
  motivo_inicial text,
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
  hora_inicio time,
  hora_fin time,
  numero_sesion integer not null default 1,
  tipo_consejeria_id uuid references public.tipos_consejeria(id),
  objetivos_sesion text,
  motivo_consulta text,
  contenido text,
  versiculos text,
  compromisos text,
  observaciones_privadas text,
  evaluacion_progreso integer check (evaluacion_progreso between 1 and 5),
  proxima_sesion date,
  proxima_sesion_hora time,
  estado text check (estado in ('pendiente', 'completada', 'cancelada')) default 'pendiente' not null,
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Tabla: tareas (homework)
create table if not exists public.tareas (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  persona_id uuid references public.personas(id) on delete cascade not null,
  sesion_id uuid references public.sesiones(id) on delete set null,
  titulo text not null,
  descripcion text,
  versiculos_referencia text,
  fecha_asignacion date not null default current_date,
  fecha_vencimiento date,
  estado text check (estado in ('pendiente', 'en_progreso', 'completada', 'omitida')) default 'pendiente' not null,
  notas_completado text,
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Tabla: formularios_tokens (links para pacientes)
create table if not exists public.formularios_tokens (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  token text unique not null default encode(gen_random_bytes(32), 'hex'),
  persona_id uuid references public.personas(id) on delete cascade not null,
  tipo text check (tipo in (
    'consentimiento_informado',
    'evaluacion_inicial',
    'seguimiento_semanal',
    'tareas_terapeuticas'
  )) not null,
  expira_at timestamptz not null default (now() + interval '7 days'),
  usado_at timestamptz,
  sesion_id uuid references public.sesiones(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Tabla: formularios_respuestas
create table if not exists public.formularios_respuestas (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  token_id uuid references public.formularios_tokens(id) on delete cascade not null,
  persona_id uuid references public.personas(id) on delete cascade not null,
  tipo text not null,
  respuestas jsonb not null default '{}',
  revisado_at timestamptz,
  notas_consejero text
);

-- ============================================================
-- RLS
-- ============================================================

alter table public.personas enable row level security;
alter table public.sesiones enable row level security;
alter table public.tareas enable row level security;
alter table public.formularios_tokens enable row level security;
alter table public.formularios_respuestas enable row level security;

create policy "personas: propietario" on public.personas for all using (auth.uid() = user_id);
create policy "sesiones: propietario" on public.sesiones for all using (auth.uid() = user_id);
create policy "tareas: propietario" on public.tareas for all using (auth.uid() = user_id);
create policy "tokens: propietario" on public.formularios_tokens for all using (auth.uid() = user_id);

-- Tokens: lectura pública por token (el paciente lee su formulario)
create policy "tokens: lectura publica" on public.formularios_tokens for select using (true);

-- Respuestas: el consejero ve las de sus personas
create policy "respuestas: propietario" on public.formularios_respuestas
  for select using (
    exists (select 1 from public.personas p where p.id = persona_id and p.user_id = auth.uid())
  );
create policy "respuestas: insert publico" on public.formularios_respuestas for insert with check (true);
create policy "respuestas: update propietario" on public.formularios_respuestas
  for update using (
    exists (select 1 from public.personas p where p.id = persona_id and p.user_id = auth.uid())
  );

-- ============================================================
-- Índices
-- ============================================================

create index if not exists idx_sesiones_persona_id on public.sesiones(persona_id);
create index if not exists idx_sesiones_fecha on public.sesiones(fecha desc);
create index if not exists idx_personas_user_id on public.personas(user_id);
create index if not exists idx_tareas_persona_id on public.tareas(persona_id);
create index if not exists idx_tareas_estado on public.tareas(estado);
create index if not exists idx_tareas_fecha_vencimiento on public.tareas(fecha_vencimiento);
create index if not exists idx_tokens_token on public.formularios_tokens(token);
create index if not exists idx_respuestas_persona_id on public.formularios_respuestas(persona_id);
