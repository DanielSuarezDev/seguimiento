export type PreguntaSeed = {
  tipo: "texto" | "textarea" | "escala" | "opciones" | "checkbox" | "info" | "firma";
  pregunta: string;
  placeholder?: string;
  requerida?: boolean;
  opciones?: string[];
};

export type PlantillaSeed = {
  nombre: string;
  descripcion: string;
  preguntas: PreguntaSeed[];
};

const caracteristicasFamiliaOpts = [
  "Gritos", "Paz", "Peleas", "Violencia", "Comprensión", "Ira",
  "Mala comunicación", "Chismes", "Perdón", "Depresión", "Amargura",
  "Soledad", "Distanciamiento", "Gozo", "Cercanía", "Paciencia",
  "Fe", "Abandono", "Mentiras", "Desorden", "Orgullo", "Amistad",
  "Grosería", "Abrazos", "Besos", "Expresión de cariño", "Lealtad",
  "Oración", "Apoyo", "Ambición",
];

const estiloPadresOpts = [
  "Excesivamente autoritario",
  "Excesivamente permisivo",
  "Liderazgo a través del ejemplo",
  "Desconectado / excesivamente ocupado",
];

const sentimientosNinezOpts = [
  "Feliz", "Triste", "Relajado", "Seguro", "Incertidumbre",
  "Privado", "Amoroso", "Reflejaba a Cristo",
];

export const preguntasHistorial: PreguntaSeed[] = [
  { tipo: "info", pregunta: "Historial personal y familiar", placeholder: "Estas preguntas nos ayudan a conocerte mejor. Responde con la honestidad que puedas." },
  { tipo: "opciones", pregunta: "1. De pequeño/a, ¿experimentó algún tipo de abuso?", opciones: ["Sí", "No"] },
  { tipo: "textarea", pregunta: "Si su respuesta fue sí, comparta lo que desee (confidencial)" },
  { tipo: "textarea", pregunta: `2. ¿Qué características resaltan en la familia donde creció? Marque las que apliquen: ${caracteristicasFamiliaOpts.join(", ")}`, placeholder: "Escriba las que apliquen separadas por comas." },
  { tipo: "opciones", pregunta: "3. ¿Su familia tenía algún vicio?", opciones: ["Sí", "No"] },
  { tipo: "texto", pregunta: "Si sí, ¿cuál?" },
  { tipo: "opciones", pregunta: "4. ¿Usted tiene algún vicio?", opciones: ["Sí", "No"] },
  { tipo: "texto", pregunta: "Si sí, ¿cuál?" },
  { tipo: "opciones", pregunta: "5. ¿Ha sido arrestado alguna vez?", opciones: ["Sí", "No"] },
  { tipo: "textarea", pregunta: "Si sí, explique brevemente" },
  { tipo: "opciones", pregunta: "6. ¿Fue criado con ambos padres en casa?", opciones: ["Sí", "No"] },
  { tipo: "textarea", pregunta: "Si no, por favor explique" },
  { tipo: "opciones", pregunta: "7. Califique el matrimonio de sus padres", opciones: ["Infeliz", "Promedio", "Feliz", "Muy feliz"] },
  { tipo: "textarea", pregunta: "8. Describa la relación con su madre" },
  { tipo: "textarea", pregunta: "9. Describa la relación con su padre" },
  { tipo: "textarea", pregunta: "10. Describa la relación con sus hermanos" },
  { tipo: "textarea", pregunta: `11. Estilo de crianza de su MADRE (marque las que apliquen): ${estiloPadresOpts.join(", ")}` },
  { tipo: "textarea", pregunta: `11. Estilo de crianza de su PADRE (marque las que apliquen): ${estiloPadresOpts.join(", ")}` },
  { tipo: "textarea", pregunta: `12. Sentimientos que predominaron en su niñez (marque las que apliquen): ${sentimientosNinezOpts.join(", ")}` },
  { tipo: "textarea", pregunta: "13. ¿Sufre actualmente de alguna enfermedad o ha notado algún cambio en su cuerpo?" },
];

export const plantillasEstandar: PlantillaSeed[] = [
  {
    nombre: "Consentimiento informado",
    descripcion: "Autorización para el proceso de consejería, confidencialidad y términos",
    preguntas: [
      {
        tipo: "info",
        pregunta: "Términos del proceso de consejería",
        placeholder:
          "Esta consejería tiene un enfoque pastoral y bíblico. Las sesiones son confidenciales y no reemplazan tratamiento psicológico o psiquiátrico profesional. La asistencia es voluntaria y puedes interrumpirla en cualquier momento.",
      },
      { tipo: "checkbox", pregunta: "Acepto los términos del proceso", requerida: true },
      { tipo: "checkbox", pregunta: "Acepto la política de confidencialidad", requerida: true },
      { tipo: "checkbox", pregunta: "Autorizo que las sesiones sean grabadas (opcional)", requerida: false },
      { tipo: "firma", pregunta: "Firma (escribe tu nombre completo)", requerida: true },
      { tipo: "textarea", pregunta: "Comentarios o aclaraciones (opcional)" },
      ...preguntasHistorial,
    ],
  },
  {
    nombre: "Evaluación inicial",
    descripcion: "Historia personal, motivo de consulta y contexto espiritual",
    preguntas: [
      { tipo: "texto", pregunta: "Edad", placeholder: "Tu edad" },
      { tipo: "textarea", pregunta: "Motivo de consulta", placeholder: "Describe con tus propias palabras qué te trajo aquí...", requerida: true },
      { tipo: "texto", pregunta: "¿Desde cuándo vives esta situación?", placeholder: "Ej: 6 meses, 2 años..." },
      { tipo: "textarea", pregunta: "¿Has intentado resolver esto antes? ¿Cómo?" },
      { tipo: "escala", pregunta: "¿Cómo calificarías tu estado emocional hoy? (1 = muy mal, 5 = muy bien)" },
      { tipo: "opciones", pregunta: "¿Tienes apoyo de familia o amigos?", opciones: ["Sí, mucho", "Algo", "Poco", "No"] },
      { tipo: "textarea", pregunta: "¿Qué esperas del proceso de consejería?" },
      { tipo: "opciones", pregunta: "¿Tienes una práctica de fe activa?", opciones: ["Sí, activamente", "A veces", "Estoy buscando", "No"] },
      { tipo: "texto", pregunta: "¿A qué iglesia o comunidad asistes?" },
      { tipo: "textarea", pregunta: "Cuéntame brevemente sobre tu vida espiritual", placeholder: "Cómo está tu relación con Dios, si tienes devocional, vida de oración..." },
      { tipo: "textarea", pregunta: "Petición de oración", placeholder: "¿Hay algo específico por lo que quieres que ore por ti?" },
      { tipo: "textarea", pregunta: "Información adicional (opcional)" },
      ...preguntasHistorial,
    ],
  },
  {
    nombre: "Seguimiento semanal",
    descripcion: "Reporte de cómo fue la semana, avance en tareas y vida espiritual",
    preguntas: [
      { tipo: "escala", pregunta: "¿Cómo estuvo tu semana? (1 = muy difícil, 5 = muy buena)" },
      { tipo: "textarea", pregunta: "¿Qué fue bien esta semana? ¿Qué logros tuviste?", placeholder: "Pequeños o grandes logros, momentos de paz, avances..." },
      { tipo: "textarea", pregunta: "¿Qué fue difícil o te costó esta semana?", placeholder: "Situaciones difíciles, pensamientos negativos, conflictos..." },
      { tipo: "textarea", pregunta: "¿Qué tareas o compromisos pudiste realizar?" },
      { tipo: "textarea", pregunta: "¿Qué no pudiste hacer? ¿Por qué?" },
      { tipo: "texto", pregunta: "¿Qué versículos o textos bíblicos leíste o meditaste?", placeholder: "Ej: Salmos 23, Filipenses 4..." },
      { tipo: "textarea", pregunta: "¿Hubo algo de la Biblia que te habló esta semana?" },
      { tipo: "textarea", pregunta: "¿Cómo estuvo tu vida de oración?" },
      { tipo: "textarea", pregunta: "Petición de oración para esta semana" },
      { tipo: "textarea", pregunta: "¿Hay algo que quieras preguntarle o contarle a tu consejero?" },
      ...preguntasHistorial,
    ],
  },
  {
    nombre: "Tareas terapéuticas",
    descripcion: "Reporte general sobre el avance en las tareas asignadas",
    preguntas: [
      { tipo: "escala", pregunta: "¿Cómo te fue con las tareas esta semana? (1 = nada bien, 5 = excelente)" },
      { tipo: "textarea", pregunta: "¿Qué tareas pudiste completar?", requerida: true },
      { tipo: "textarea", pregunta: "¿Cuáles no pudiste completar y por qué?" },
      { tipo: "opciones", pregunta: "Nivel de dificultad general", opciones: ["Muy fácil", "Fácil", "Normal", "Difícil", "Muy difícil"] },
      { tipo: "textarea", pregunta: "¿Qué aprendiste haciendo estas tareas?" },
      { tipo: "textarea", pregunta: "Reflexión personal o algo que quieras compartir" },
      ...preguntasHistorial,
    ],
  },
];
