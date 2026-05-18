-- ============================================================
-- MIGRACIÓN: Formularios por audiencia (etapa de vida)
--
-- Amplía el CHECK constraint de formularios_tokens.tipo para
-- aceptar variantes según la audiencia pastoral:
--   - Adulto              (mantiene evaluacion_inicial / seguimiento_semanal)
--   - Adolescente         (evaluacion_adolescente / seguimiento_adolescente)
--   - Niño                (evaluacion_nino / seguimiento_nino)
--   - Matrimonial/Familiar(evaluacion_matrimonial / seguimiento_matrimonial)
--
-- Cada variante usa un componente de formulario propio en el
-- frontend, con preguntas, tono y experiencia diseñados para
-- la etapa de vida correspondiente.
-- ============================================================

alter table public.formularios_tokens
  drop constraint if exists formularios_tokens_tipo_check;

alter table public.formularios_tokens
  add constraint formularios_tokens_tipo_check
  check (tipo in (
    'consentimiento_informado',
    'evaluacion_inicial',
    'evaluacion_adolescente',
    'evaluacion_nino',
    'evaluacion_matrimonial',
    'seguimiento_semanal',
    'seguimiento_adolescente',
    'seguimiento_nino',
    'seguimiento_matrimonial',
    'tareas_terapeuticas',
    'personalizado'
  ));
