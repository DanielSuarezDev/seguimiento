-- RPC para sincronizar datos básicos de la persona desde el formulario público.
--
-- Idea: cuando el consejero crea un aconsejado con campos vacíos (teléfono,
-- email, estado civil, ocupación, iglesia), y la persona los responde en la
-- evaluación inicial, esos campos deben quedar guardados en el perfil sin que
-- el consejero los reescriba a mano.
--
-- La función corre con security definer porque el rol anon NO puede actualizar
-- public.personas por RLS. Por seguridad valida que exista un token vigente
-- (no expirado) para esa persona antes de tocar nada y usa `coalesce` para
-- nunca sobreescribir un valor ya presente.

create or replace function public.sincronizar_persona_desde_form(
  p_token text,
  p_telefono text,
  p_email text,
  p_estado_civil text,
  p_ocupacion text,
  p_iglesia text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_persona_id uuid;
begin
  -- Buscar persona a través del token. No exigimos `usado_at is null` porque
  -- el flujo actual marca el token como usado y luego sincroniza.
  select tk.persona_id
    into v_persona_id
  from public.formularios_tokens tk
  where tk.token = p_token
    and tk.expira_at > now();

  if v_persona_id is null then
    return;
  end if;

  update public.personas
     set telefono     = coalesce(telefono,     nullif(trim(p_telefono),     '')),
         email        = coalesce(email,        nullif(trim(p_email),        '')),
         estado_civil = coalesce(estado_civil, nullif(trim(p_estado_civil), '')),
         ocupacion    = coalesce(ocupacion,    nullif(trim(p_ocupacion),    '')),
         iglesia      = coalesce(iglesia,      nullif(trim(p_iglesia),      ''))
   where id = v_persona_id;
end;
$$;

revoke all on function public.sincronizar_persona_desde_form(
  text, text, text, text, text, text
) from public;

grant execute on function public.sincronizar_persona_desde_form(
  text, text, text, text, text, text
) to anon, authenticated;
