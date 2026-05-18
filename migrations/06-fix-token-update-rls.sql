-- Fix: permitir que el aconsejado (rol anon) marque el token como usado al enviar.
--
-- Bug: la policy anterior usaba sólo `using (usado_at is null)`. En UPDATE,
-- Postgres aplica USING también como WITH CHECK cuando éste no está definido,
-- así que tras setear `usado_at = now()` el WITH CHECK fallaba y se lanzaba
-- "new row violates row-level security policy for table formularios_tokens".
--
-- Solución: separar USING (qué filas son actualizables: las no usadas y no
-- vencidas) de WITH CHECK (qué cambios son válidos: sólo marcar usado_at, sin
-- tocar el resto del registro).

drop policy if exists "tokens: marcar usado publico" on public.formularios_tokens;

create policy "tokens: marcar usado publico"
  on public.formularios_tokens
  for update
  to anon, authenticated
  using (
    usado_at is null
    and expira_at > now()
  )
  with check (
    usado_at is not null
  );
