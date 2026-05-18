-- ============================================================
-- MIGRACIÓN: Función para leer datos públicos del token
-- Permite que el aconsejado vea su nombre al abrir el formulario
-- sin exponer toda la tabla personas.
-- Ejecutar en SQL Editor de Supabase.
-- ============================================================

create or replace function public.token_publico(t_token text)
returns table (
  id uuid,
  tipo text,
  expira_at timestamptz,
  usado_at timestamptz,
  persona_id uuid,
  plantilla_id uuid,
  persona_nombre text,
  persona_apellido text,
  plantilla_nombre text
)
language sql
security definer
stable
set search_path = public
as $$
  select
    tk.id,
    tk.tipo,
    tk.expira_at,
    tk.usado_at,
    tk.persona_id,
    tk.plantilla_id,
    p.nombre        as persona_nombre,
    p.apellido      as persona_apellido,
    pl.nombre       as plantilla_nombre
  from public.formularios_tokens tk
  left join public.personas        p  on p.id  = tk.persona_id
  left join public.form_plantillas pl on pl.id = tk.plantilla_id
  where tk.token = t_token
$$;

grant execute on function public.token_publico(text) to anon, authenticated;
