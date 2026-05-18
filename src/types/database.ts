export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      personas: {
        Row: {
          id: string;
          created_at: string;
          nombre: string;
          apellido: string;
          telefono: string | null;
          email: string | null;
          fecha_nacimiento: string | null;
          estado_civil: string | null;
          notas_generales: string | null;
          activo: boolean;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          nombre: string;
          apellido: string;
          telefono?: string | null;
          email?: string | null;
          fecha_nacimiento?: string | null;
          estado_civil?: string | null;
          notas_generales?: string | null;
          activo?: boolean;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          nombre?: string;
          apellido?: string;
          telefono?: string | null;
          email?: string | null;
          fecha_nacimiento?: string | null;
          estado_civil?: string | null;
          notas_generales?: string | null;
          activo?: boolean;
          user_id?: string;
        };
        Relationships: [];
      };
      sesiones: {
        Row: {
          id: string;
          created_at: string;
          persona_id: string;
          fecha: string;
          numero_sesion: number;
          motivo_consulta: string | null;
          contenido: string | null;
          versiculos: string | null;
          compromisos: string | null;
          proxima_sesion: string | null;
          estado: "pendiente" | "completada" | "cancelada";
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          persona_id: string;
          fecha: string;
          numero_sesion?: number;
          motivo_consulta?: string | null;
          contenido?: string | null;
          versiculos?: string | null;
          compromisos?: string | null;
          proxima_sesion?: string | null;
          estado?: "pendiente" | "completada" | "cancelada";
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          persona_id?: string;
          fecha?: string;
          numero_sesion?: number;
          motivo_consulta?: string | null;
          contenido?: string | null;
          versiculos?: string | null;
          compromisos?: string | null;
          proxima_sesion?: string | null;
          estado?: "pendiente" | "completada" | "cancelada";
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sesiones_persona_id_fkey";
            columns: ["persona_id"];
            referencedRelation: "personas";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Persona = Database["public"]["Tables"]["personas"]["Row"];
export type PersonaInsert = Database["public"]["Tables"]["personas"]["Insert"];

export type Sesion = Database["public"]["Tables"]["sesiones"]["Row"];
export type SesionInsert = Database["public"]["Tables"]["sesiones"]["Insert"];
