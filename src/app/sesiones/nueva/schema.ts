import { z } from "zod";

export const tipoTareaEnum = z.enum([
  "lectura_biblica", "devocional", "oracion", "memorizacion",
  "diario_reflexion", "perdon_reconciliacion", "comunicacion",
  "servicio", "accion_practica", "ayuno", "otro",
]);

export const prioridadEnum = z.enum(["baja", "media", "alta"]);

export const estadoSesionEnum = z.enum([
  "programada", "en_proceso", "completada", "cancelada", "reprogramada",
]);

export const respuestaAconsejadoEnum = z.enum([
  "receptivo", "humilde", "defensivo", "confundido", "quebrantado",
  "esperanzado", "arrepentido", "indiferente", "resistente",
]);

export const evaluacionProgresoEnum = z.enum([
  "estancado", "lucha_constante", "mostrando_apertura",
  "evidencia_crecimiento", "arrepentimiento_evidente", "caminando_consistentemente",
]);

export const tareaSchema = z.object({
  tipo: tipoTareaEnum,
  titulo: z.string().min(1, "Escribe la tarea"),
  descripcion: z.string().optional().default(""),
  fecha_vencimiento: z.string().optional().default(""),
  prioridad: prioridadEnum.default("media"),
});

export const sesionFormSchema = z.object({
  // Sección 1
  persona_id: z.string().uuid("Selecciona una persona"),
  tipo_consejeria_id: z.string().optional().default(""),
  fecha: z.string().min(1, "Selecciona la fecha"),
  hora_inicio: z.string().optional().default(""),
  hora_fin: z.string().optional().default(""),
  estado: estadoSesionEnum.default("programada"),
  objetivo_principal: z.string().optional().default(""),

  // Sección 2
  situacion_presentada: z.string().optional().default(""),
  eventos_semana: z.string().optional().default(""),
  conflictos_actuales: z.string().optional().default(""),
  sintomas_emociones: z.string().optional().default(""),
  emociones_observadas: z.array(z.string()).default([]),

  // Sección 3
  asuntos_corazon: z.array(z.string()).default([]),
  observaciones_corazon: z.string().optional().default(""),

  // Sección 4
  versiculos: z.string().optional().default(""),
  ensenanza_biblica: z.string().optional().default(""),
  aplicacion_evangelio: z.string().optional().default(""),
  llamado_arrepentimiento: z.string().optional().default(""),

  // Sección 5
  respuesta_aconsejado: z.union([respuestaAconsejadoEnum, z.literal("")]).default(""),
  evidencias_crecimiento: z.string().optional().default(""),

  // Sección 6
  tareas: z.array(tareaSchema).default([]),

  // Sección 7
  resumen_pastoral: z.string().optional().default(""),

  // Sección 8
  observaciones_privadas: z.string().optional().default(""),

  // Sección 9
  evaluacion_progreso: z.union([evaluacionProgresoEnum, z.literal("")]).default(""),
  proxima_sesion: z.string().optional().default(""),
  proxima_sesion_hora: z.string().optional().default(""),
  temas_proxima_sesion: z.string().optional().default(""),
});

export type SesionFormInput = z.input<typeof sesionFormSchema>;
export type SesionFormValues = z.output<typeof sesionFormSchema>;
export type TareaFormValues = z.output<typeof tareaSchema>;

export const emocionesOpciones = [
  "Ansiedad", "Temor", "Ira", "Tristeza", "Culpa", "Confusión",
  "Desánimo", "Esperanza", "Soledad", "Estrés", "Frustración",
];

export const asuntosCorazonOpciones = [
  "Temor al hombre", "Control", "Idolatría", "Orgullo", "Incredulidad",
  "Autojusticia", "Búsqueda de aprobación", "Amargura", "Egoísmo",
  "Temor", "Ansiedad", "Perfeccionismo", "Placer", "Comodidad", "Autosuficiencia",
];

export const versiculosFrecuentes = [
  "Filipenses 4", "Mateo 6", "Romanos 8", "Santiago 4",
  "Efesios 4", "Proverbios 4:23", "Hebreos 4:12", "Colosenses 3",
];

export const estadoOptions: { value: SesionFormValues["estado"]; label: string }[] = [
  { value: "programada", label: "Programada" },
  { value: "en_proceso", label: "En proceso" },
  { value: "completada", label: "Completada" },
  { value: "cancelada", label: "Cancelada" },
  { value: "reprogramada", label: "Reprogramada" },
];

export const respuestaOptions = [
  { value: "receptivo", label: "Receptivo" },
  { value: "humilde", label: "Humilde" },
  { value: "defensivo", label: "Defensivo" },
  { value: "confundido", label: "Confundido" },
  { value: "quebrantado", label: "Quebrantado" },
  { value: "esperanzado", label: "Esperanzado" },
  { value: "arrepentido", label: "Arrepentido" },
  { value: "indiferente", label: "Indiferente" },
  { value: "resistente", label: "Resistente" },
] as const;

export const progresoOptions = [
  { value: "estancado", label: "Estancado" },
  { value: "lucha_constante", label: "Lucha constante" },
  { value: "mostrando_apertura", label: "Mostrando apertura" },
  { value: "evidencia_crecimiento", label: "Evidencia de crecimiento" },
  { value: "arrepentimiento_evidente", label: "Arrepentimiento evidente" },
  { value: "caminando_consistentemente", label: "Caminando consistentemente" },
] as const;

export const tipoTareaOptions = [
  { value: "lectura_biblica", label: "Lectura bíblica" },
  { value: "devocional", label: "Devocional" },
  { value: "oracion", label: "Oración" },
  { value: "memorizacion", label: "Memorización" },
  { value: "diario_reflexion", label: "Diario / reflexión" },
  { value: "perdon_reconciliacion", label: "Perdón / reconciliación" },
  { value: "comunicacion", label: "Comunicación" },
  { value: "servicio", label: "Servicio" },
  { value: "accion_practica", label: "Acción práctica" },
  { value: "ayuno", label: "Ayuno" },
  { value: "otro", label: "Otro" },
] as const;
