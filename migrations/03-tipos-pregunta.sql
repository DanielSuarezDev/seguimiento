-- ============================================================
-- MIGRACIÓN: Nuevos tipos de pregunta para plantillas
-- (checkbox, info, firma)
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

alter table public.form_preguntas
  drop constraint if exists form_preguntas_tipo_check;

alter table public.form_preguntas
  add constraint form_preguntas_tipo_check check (
    tipo in ('texto', 'textarea', 'escala', 'opciones', 'checkbox', 'info', 'firma')
  );
