# Migraciones SQL

Ejecuta las migraciones en orden numérico en el editor SQL de Supabase.
Cada archivo es idempotente o aplica un cambio aditivo sobre el anterior.

| # | Archivo | Descripción |
|---|---|---|
| 01 | `01-form-builder.sql` | Tablas para el constructor de formularios personalizados (plantillas, preguntas). |
| 02 | `02-tipos-consejeria.sql` | Catálogo de tipos de consejería. |
| 03 | `03-tipos-pregunta.sql` | Catálogo de tipos de pregunta (input, textarea, select, checkbox, escala). |
| 04 | `04-completa.sql` | Esquema consolidado / completo. |
| 05 | `05-token-publico.sql` | RPC `token_publico` para leer datos del token desde el rol anónimo. |
| 06 | `06-fix-token-update-rls.sql` | Fix RLS: el aconsejado anónimo puede marcar el token como usado (separa USING / WITH CHECK). |
| 07 | `07-sesiones-acbc.sql` | Sesiones estilo ACBC: `evaluacion_progreso` pasa a text, nuevos estados, columnas pastorales y campos `tipo`/`prioridad` en tareas. |
| 08 | `08-sync-persona-desde-form.sql` | RPC `sincronizar_persona_desde_form` (security definer) para rellenar datos vacíos de la persona desde la evaluación inicial. |

> El esquema base inicial vive en `../supabase-schema.sql` (raíz del proyecto).
> El formulario de evaluación inicial guarda sus respuestas como `jsonb` en la
> tabla `formularios_respuestas.respuestas`, por lo que **no requiere migración**
> al añadir/cambiar campos del formulario.
