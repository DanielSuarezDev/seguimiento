-- Sesiones — campos ACBC (consejería bíblica)
--
-- Objetivo:
--   1) Convertir `evaluacion_progreso` de integer (1-5) a text con etiquetas
--      pastorales: estancado, lucha_constante, mostrando_apertura,
--      evidencia_crecimiento, arrepentimiento_evidente, caminando_consistentemente.
--   2) Ampliar `estado` para incluir: en_proceso, reprogramada. Se conserva
--      'pendiente' como sinónimo de "programada" para no romper data existente.
--   3) Añadir columnas pastorales nuevas (situación presentada, asuntos del
--      corazón, verdad bíblica aplicada, respuesta del aconsejado, resumen
--      pastoral, etc.).

-- ---------- 1. evaluacion_progreso: integer -> text (o crear si no existe) ----------
alter table public.sesiones
  drop constraint if exists sesiones_evaluacion_progreso_check;

do $$
declare
  col_type text;
begin
  select data_type into col_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name   = 'sesiones'
    and column_name  = 'evaluacion_progreso';

  if col_type is null then
    -- No existe: crear directamente como text.
    execute 'alter table public.sesiones add column evaluacion_progreso text';
  elsif col_type in ('integer', 'smallint', 'bigint', 'numeric') then
    -- Existe como número: convertir a text mapeando 1-5 a las etiquetas pastorales.
    execute $convert$
      alter table public.sesiones
        alter column evaluacion_progreso type text
        using (
          case evaluacion_progreso
            when 1 then 'estancado'
            when 2 then 'lucha_constante'
            when 3 then 'mostrando_apertura'
            when 4 then 'evidencia_crecimiento'
            when 5 then 'caminando_consistentemente'
            else null
          end
        )
    $convert$;
  end if;
  -- Si ya es text, no se hace nada.
end $$;

alter table public.sesiones
  add constraint sesiones_evaluacion_progreso_check
  check (evaluacion_progreso is null or evaluacion_progreso in (
    'estancado',
    'lucha_constante',
    'mostrando_apertura',
    'evidencia_crecimiento',
    'arrepentimiento_evidente',
    'caminando_consistentemente'
  ));

-- ---------- 2. estado: ampliar valores permitidos ----------
alter table public.sesiones
  drop constraint if exists sesiones_estado_check;

alter table public.sesiones
  add constraint sesiones_estado_check
  check (estado in (
    'pendiente',      -- legado, equivale a "programada"
    'programada',
    'en_proceso',
    'completada',
    'cancelada',
    'reprogramada'
  ));

-- ---------- 3. Asegurar columnas base + nuevas columnas pastorales ----------
-- Algunas instalaciones tienen un schema `sesiones` reducido, así que añadimos
-- defensivamente todas las columnas que el formulario usa.
alter table public.sesiones
  -- Base (pueden faltar en DBs viejas)
  add column if not exists hora_inicio time,
  add column if not exists hora_fin time,
  add column if not exists numero_sesion integer not null default 1,
  add column if not exists tipo_consejeria_id uuid references public.tipos_consejeria(id),
  add column if not exists objetivos_sesion text,
  add column if not exists motivo_consulta text,
  add column if not exists contenido text,
  add column if not exists versiculos text,
  add column if not exists compromisos text,
  add column if not exists observaciones_privadas text,
  add column if not exists proxima_sesion date,
  add column if not exists proxima_sesion_hora time,
  -- Nuevas pastorales (ACBC)
  add column if not exists objetivo_principal text,
  add column if not exists situacion_presentada text,
  add column if not exists eventos_semana text,
  add column if not exists conflictos_actuales text,
  add column if not exists sintomas_emociones text,
  add column if not exists emociones_observadas text[] default '{}'::text[],
  add column if not exists asuntos_corazon text[] default '{}'::text[],
  add column if not exists observaciones_corazon text,
  add column if not exists ensenanza_biblica text,
  add column if not exists aplicacion_evangelio text,
  add column if not exists llamado_arrepentimiento text,
  add column if not exists respuesta_aconsejado text,
  add column if not exists evidencias_crecimiento text,
  add column if not exists resumen_pastoral text,
  add column if not exists temas_proxima_sesion text;

alter table public.sesiones
  drop constraint if exists sesiones_respuesta_aconsejado_check;

alter table public.sesiones
  add constraint sesiones_respuesta_aconsejado_check
  check (respuesta_aconsejado is null or respuesta_aconsejado in (
    'receptivo',
    'humilde',
    'defensivo',
    'confundido',
    'quebrantado',
    'esperanzado',
    'arrepentido',
    'indiferente',
    'resistente'
  ));

-- ---------- 4. tareas: asegurar columnas base + prioridad + tipo ----------
alter table public.tareas
  add column if not exists sesion_id uuid references public.sesiones(id) on delete set null,
  add column if not exists descripcion text,
  add column if not exists fecha_vencimiento date,
  add column if not exists tipo text,
  add column if not exists prioridad text default 'media';

alter table public.tareas
  drop constraint if exists tareas_prioridad_check;

alter table public.tareas
  add constraint tareas_prioridad_check
  check (prioridad in ('baja', 'media', 'alta'));

alter table public.tareas
  drop constraint if exists tareas_tipo_check;

alter table public.tareas
  add constraint tareas_tipo_check
  check (tipo is null or tipo in (
    'lectura_biblica',
    'devocional',
    'oracion',
    'memorizacion',
    'diario_reflexion',
    'perdon_reconciliacion',
    'comunicacion',
    'servicio',
    'accion_practica',
    'ayuno',
    'otro'
  ));
