export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type EstadoSesion =
  | "pendiente" | "programada" | "en_proceso" | "completada" | "cancelada" | "reprogramada";

export type EvaluacionProgreso =
  | "estancado" | "lucha_constante" | "mostrando_apertura"
  | "evidencia_crecimiento" | "arrepentimiento_evidente" | "caminando_consistentemente";

export type RespuestaAconsejado =
  | "receptivo" | "humilde" | "defensivo" | "confundido" | "quebrantado"
  | "esperanzado" | "arrepentido" | "indiferente" | "resistente";

export type TipoTarea =
  | "lectura_biblica" | "devocional" | "oracion" | "memorizacion"
  | "diario_reflexion" | "perdon_reconciliacion" | "comunicacion"
  | "servicio" | "accion_practica" | "ayuno" | "otro";

export type PrioridadTarea = "baja" | "media" | "alta";

export interface Database {
  public: {
    Tables: {
      tipos_consejeria: {
        Row: { id: string; nombre: string; color: string };
        Insert: { id?: string; nombre: string; color?: string };
        Update: { id?: string; nombre?: string; color?: string };
        Relationships: [];
      };
      personas: {
        Row: {
          id: string; created_at: string; nombre: string; apellido: string;
          telefono: string | null; email: string | null; fecha_nacimiento: string | null;
          estado_civil: string | null; tipo_consejeria_id: string | null;
          ocupacion: string | null; iglesia: string | null; motivo_inicial: string | null;
          notas_generales: string | null; activo: boolean; user_id: string;
        };
        Insert: {
          id?: string; created_at?: string; nombre: string; apellido: string;
          telefono?: string | null; email?: string | null; fecha_nacimiento?: string | null;
          estado_civil?: string | null; tipo_consejeria_id?: string | null;
          ocupacion?: string | null; iglesia?: string | null; motivo_inicial?: string | null;
          notas_generales?: string | null; activo?: boolean; user_id: string;
        };
        Update: {
          id?: string; created_at?: string; nombre?: string; apellido?: string;
          telefono?: string | null; email?: string | null; fecha_nacimiento?: string | null;
          estado_civil?: string | null; tipo_consejeria_id?: string | null;
          ocupacion?: string | null; iglesia?: string | null; motivo_inicial?: string | null;
          notas_generales?: string | null; activo?: boolean; user_id?: string;
        };
        Relationships: [];
      };
      sesiones: {
        Row: {
          id: string; created_at: string; persona_id: string; fecha: string;
          hora_inicio: string | null; hora_fin: string | null; numero_sesion: number;
          tipo_consejeria_id: string | null; objetivos_sesion: string | null;
          motivo_consulta: string | null; contenido: string | null; versiculos: string | null;
          compromisos: string | null; observaciones_privadas: string | null;
          evaluacion_progreso: EvaluacionProgreso | null; proxima_sesion: string | null;
          proxima_sesion_hora: string | null;
          estado: EstadoSesion; user_id: string;
          objetivo_principal: string | null;
          situacion_presentada: string | null; eventos_semana: string | null;
          conflictos_actuales: string | null; sintomas_emociones: string | null;
          emociones_observadas: string[] | null; asuntos_corazon: string[] | null;
          observaciones_corazon: string | null;
          ensenanza_biblica: string | null; aplicacion_evangelio: string | null;
          llamado_arrepentimiento: string | null;
          respuesta_aconsejado: RespuestaAconsejado | null;
          evidencias_crecimiento: string | null; resumen_pastoral: string | null;
          temas_proxima_sesion: string | null;
        };
        Insert: {
          id?: string; created_at?: string; persona_id: string; fecha: string;
          hora_inicio?: string | null; hora_fin?: string | null; numero_sesion?: number;
          tipo_consejeria_id?: string | null; objetivos_sesion?: string | null;
          motivo_consulta?: string | null; contenido?: string | null; versiculos?: string | null;
          compromisos?: string | null; observaciones_privadas?: string | null;
          evaluacion_progreso?: EvaluacionProgreso | null; proxima_sesion?: string | null;
          proxima_sesion_hora?: string | null;
          estado?: EstadoSesion; user_id: string;
          objetivo_principal?: string | null;
          situacion_presentada?: string | null; eventos_semana?: string | null;
          conflictos_actuales?: string | null; sintomas_emociones?: string | null;
          emociones_observadas?: string[] | null; asuntos_corazon?: string[] | null;
          observaciones_corazon?: string | null;
          ensenanza_biblica?: string | null; aplicacion_evangelio?: string | null;
          llamado_arrepentimiento?: string | null;
          respuesta_aconsejado?: RespuestaAconsejado | null;
          evidencias_crecimiento?: string | null; resumen_pastoral?: string | null;
          temas_proxima_sesion?: string | null;
        };
        Update: {
          id?: string; created_at?: string; persona_id?: string; fecha?: string;
          hora_inicio?: string | null; hora_fin?: string | null; numero_sesion?: number;
          tipo_consejeria_id?: string | null; objetivos_sesion?: string | null;
          motivo_consulta?: string | null; contenido?: string | null; versiculos?: string | null;
          compromisos?: string | null; observaciones_privadas?: string | null;
          evaluacion_progreso?: EvaluacionProgreso | null; proxima_sesion?: string | null;
          proxima_sesion_hora?: string | null;
          estado?: EstadoSesion; user_id?: string;
          objetivo_principal?: string | null;
          situacion_presentada?: string | null; eventos_semana?: string | null;
          conflictos_actuales?: string | null; sintomas_emociones?: string | null;
          emociones_observadas?: string[] | null; asuntos_corazon?: string[] | null;
          observaciones_corazon?: string | null;
          ensenanza_biblica?: string | null; aplicacion_evangelio?: string | null;
          llamado_arrepentimiento?: string | null;
          respuesta_aconsejado?: RespuestaAconsejado | null;
          evidencias_crecimiento?: string | null; resumen_pastoral?: string | null;
          temas_proxima_sesion?: string | null;
        };
        Relationships: [];
      };
      tareas: {
        Row: {
          id: string; created_at: string; persona_id: string; sesion_id: string | null;
          titulo: string; descripcion: string | null; versiculos_referencia: string | null;
          fecha_asignacion: string; fecha_vencimiento: string | null;
          estado: "pendiente" | "en_progreso" | "completada" | "omitida";
          notas_completado: string | null; user_id: string;
          tipo: TipoTarea | null; prioridad: PrioridadTarea;
        };
        Insert: {
          id?: string; created_at?: string; persona_id: string; sesion_id?: string | null;
          titulo: string; descripcion?: string | null; versiculos_referencia?: string | null;
          fecha_asignacion?: string; fecha_vencimiento?: string | null;
          estado?: "pendiente" | "en_progreso" | "completada" | "omitida";
          notas_completado?: string | null; user_id: string;
          tipo?: TipoTarea | null; prioridad?: PrioridadTarea;
        };
        Update: {
          id?: string; created_at?: string; persona_id?: string; sesion_id?: string | null;
          titulo?: string; descripcion?: string | null; versiculos_referencia?: string | null;
          fecha_asignacion?: string; fecha_vencimiento?: string | null;
          estado?: "pendiente" | "en_progreso" | "completada" | "omitida";
          notas_completado?: string | null; user_id?: string;
          tipo?: TipoTarea | null; prioridad?: PrioridadTarea;
        };
        Relationships: [];
      };
      formularios_tokens: {
        Row: {
          id: string; created_at: string; token: string; persona_id: string;
          tipo: string | null; plantilla_id: string | null;
          expira_at: string; usado_at: string | null; sesion_id: string | null; user_id: string;
        };
        Insert: {
          id?: string; created_at?: string; token?: string; persona_id: string;
          tipo?: string | null; plantilla_id?: string | null;
          expira_at?: string; usado_at?: string | null; sesion_id?: string | null; user_id: string;
        };
        Update: {
          usado_at?: string | null; plantilla_id?: string | null; tipo?: string | null;
        };
        Relationships: [];
      };
      form_plantillas: {
        Row: { id: string; created_at: string; nombre: string; descripcion: string | null; activo: boolean; user_id: string };
        Insert: { id?: string; created_at?: string; nombre: string; descripcion?: string | null; activo?: boolean; user_id: string };
        Update: { nombre?: string; descripcion?: string | null; activo?: boolean };
        Relationships: [];
      };
      form_preguntas: {
        Row: { id: string; plantilla_id: string; orden: number; tipo: string; pregunta: string; placeholder: string | null; requerida: boolean; opciones: string[] | null };
        Insert: { id?: string; plantilla_id: string; orden?: number; tipo: string; pregunta: string; placeholder?: string | null; requerida?: boolean; opciones?: string[] | null };
        Update: { orden?: number; tipo?: string; pregunta?: string; placeholder?: string | null; requerida?: boolean; opciones?: string[] | null };
        Relationships: [];
      };
      formularios_respuestas: {
        Row: {
          id: string; created_at: string; token_id: string; persona_id: string;
          tipo: string; respuestas: Json; revisado_at: string | null; notas_consejero: string | null;
        };
        Insert: {
          id?: string; created_at?: string; token_id: string; persona_id: string;
          tipo: string; respuestas: Json; revisado_at?: string | null; notas_consejero?: string | null;
        };
        Update: {
          revisado_at?: string | null; notas_consejero?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type TipoConsejeria = Database["public"]["Tables"]["tipos_consejeria"]["Row"];
export type Persona = Database["public"]["Tables"]["personas"]["Row"];
export type PersonaInsert = Database["public"]["Tables"]["personas"]["Insert"];
export type Sesion = Database["public"]["Tables"]["sesiones"]["Row"];
export type SesionInsert = Database["public"]["Tables"]["sesiones"]["Insert"];
export type Tarea = Database["public"]["Tables"]["tareas"]["Row"];
export type TareaInsert = Database["public"]["Tables"]["tareas"]["Insert"];
export type FormularioToken = Database["public"]["Tables"]["formularios_tokens"]["Row"];
export type FormularioRespuesta = Database["public"]["Tables"]["formularios_respuestas"]["Row"];
