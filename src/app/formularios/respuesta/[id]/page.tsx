import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import MarcarRevisado from "./MarcarRevisado";

const tipoLabel: Record<string, string> = {
  consentimiento_informado: "Consentimiento informado",
  evaluacion_inicial: "Evaluación inicial · Adulto",
  evaluacion_adolescente: "Evaluación inicial · Adolescente",
  evaluacion_nino: "Evaluación inicial · Niño",
  evaluacion_matrimonial: "Evaluación matrimonial",
  seguimiento_semanal: "Seguimiento semanal · Adulto",
  seguimiento_adolescente: "Seguimiento semanal · Adolescente",
  seguimiento_nino: "Seguimiento semanal · Niño",
  seguimiento_matrimonial: "Seguimiento semanal · Matrimonial",
  tareas_terapeuticas: "Tareas terapéuticas",
  personalizado: "Formulario personalizado",
};

const semanaLabel: Record<number, string> = {
  1: "Muy difícil 🌧️", 2: "Difícil ☁️", 3: "Estable 🌤️", 4: "Buena ☀️", 5: "Muy alentadora 🌈",
};

const seccionesSeguimiento: { titulo: string; campos: { key: string; label: string; format?: (v: unknown) => string }[] }[] = [
  {
    titulo: "Cómo estuvo la semana",
    campos: [
      { key: "como_estuvo_semana", label: "Estado general de la semana",
        format: (v) => typeof v === "number" ? (semanaLabel[v] ?? String(v)) : "—" },
      { key: "bueno_agradecido", label: "Qué fue bueno o agradeció" },
      { key: "dificil_pesado", label: "Qué fue difícil o pesado" },
      { key: "prueba_fe_paciencia", label: "Pruebas de fe / paciencia / ánimo" },
    ],
  },
  {
    titulo: "Caminando esta semana",
    campos: [
      { key: "verdad_biblica", label: "Verdad bíblica que Dios usó" },
      { key: "tiempo_oracion", label: "Tiempo de oración y comunión" },
      { key: "peticion_oracion", label: "Petición de oración" },
    ],
  },
  {
    titulo: "Pasos de crecimiento",
    campos: [
      { key: "pasos_obediencia", label: "Pasos de obediencia o crecimiento" },
      { key: "costo_continuar", label: "Lo que costó continuar / aplicar" },
    ],
  },
  {
    titulo: "Corazón y emociones",
    campos: [
      { key: "emociones_presentes", label: "Emociones presentes" },
      { key: "ocupo_mente", label: "Qué ocupó más su mente o corazón" },
    ],
  },
];

// Agrupación + etiquetas legibles para evaluación inicial
const seccionesEvaluacion: { titulo: string; campos: { key: string; label: string }[] }[] = [
  {
    titulo: "Conociéndote",
    campos: [
      { key: "nombre_completo", label: "Nombre completo" },
      { key: "edad", label: "Edad" },
      { key: "sexo", label: "Sexo" },
      { key: "estado_civil", label: "Estado civil" },
      { key: "telefono", label: "Teléfono" },
      { key: "correo", label: "Correo electrónico" },
      { key: "ocupacion", label: "Ocupación" },
      { key: "iglesia_asiste", label: "Iglesia a la que asiste" },
      { key: "referido_por", label: "Referido por" },
    ],
  },
  {
    titulo: "Tu historia",
    campos: [
      { key: "historia_familiar", label: "Historia familiar" },
      { key: "vivio_ambos_padres", label: "¿Vivió con ambos padres?" },
      { key: "relacion_padre", label: "Relación con su padre" },
      { key: "relacion_madre", label: "Relación con su madre" },
      { key: "heridas_pasado", label: "Heridas o situaciones del pasado" },
      { key: "ambiente_crianza", label: "Ambiente donde creció" },
    ],
  },
  {
    titulo: "Situación actual",
    campos: [
      { key: "situacion_actual", label: "¿Qué está pasando en su vida?" },
      { key: "desde_cuando", label: "Desde cuándo" },
      { key: "afectacion_diaria", label: "Cómo afecta su vida diaria" },
      { key: "intentos_resolver", label: "Qué ha intentado para resolverlo" },
      { key: "sentimientos_recientes", label: "Cómo se ha sentido últimamente" },
      { key: "peso_situacion", label: "Peso de la situación (1-5)" },
    ],
  },
  {
    titulo: "Caminar espiritual",
    campos: [
      { key: "creyente", label: "¿Se considera creyente en Cristo?" },
      { key: "relacion_dios", label: "Relación actual con Dios" },
      { key: "asiste_iglesia_freq", label: "Asistencia a la iglesia" },
      { key: "tiempo_oracion", label: "Tiempos de oración" },
      { key: "lee_biblia", label: "Lectura de la Biblia" },
      { key: "luchas_espirituales", label: "Luchas espirituales / pecado recurrente" },
      { key: "dios_trabajando", label: "Qué cree que Dios quiere trabajar" },
    ],
  },
  {
    titulo: "Preguntas del corazón",
    campos: [
      { key: "preocupacion_principal", label: "Lo que más le preocupa" },
      { key: "teme_perder", label: "Qué teme perder" },
      { key: "deseo_profundo", label: "Qué desea profundamente" },
      { key: "refugio", label: "Dónde busca refugio bajo presión" },
      { key: "ocupa_mente", label: "Qué ocupa más su mente" },
      { key: "provoca_emociones", label: "Qué provoca enojo / tristeza / ansiedad" },
      { key: "necesidad_paz", label: "Qué necesita para tener paz" },
    ],
  },
  {
    titulo: "Cómo caminar con él/ella",
    campos: [
      { key: "expectativas", label: "Qué espera del proceso" },
      { key: "orientacion_biblica", label: "¿Dispuesto a recibir orientación bíblica?" },
      { key: "tareas_practicas", label: "¿Dispuesto a realizar tareas entre sesiones?" },
      { key: "disponibilidad", label: "Días / horarios disponibles" },
      { key: "algo_mas", label: "Algo más que quiera compartir" },
    ],
  },
  {
    titulo: "Consentimiento",
    campos: [{ key: "consentimiento", label: "Aceptó continuar y enviar su información" }],
  },
];

// --- Adolescente: evaluación ---
const seccionesEvalAdolescente = [
  { titulo: "Conociéndote", campos: [
    { key: "nombre", label: "Nombre" },
    { key: "edad", label: "Edad" },
    { key: "colegio", label: "Colegio" },
    { key: "curso", label: "Curso / grado" },
    { key: "con_quien_vives", label: "Con quién vive" },
  ]},
  { titulo: "Cómo se ha sentido", campos: [
    { key: "sentimientos", label: "Sentimientos marcados" },
  ]},
  { titulo: "Lo que está pasando", campos: [
    { key: "mas_dificil", label: "Lo más difícil últimamente" },
    { key: "ocupa_mente", label: "Qué ocupa más su mente" },
    { key: "preocupacion", label: "Algo que le esté preocupando" },
  ]},
  { titulo: "Amigos y redes", campos: [
    { key: "amistades", label: "Cómo se siente con sus amistades" },
    { key: "presion_redes", label: "Presión por redes sociales / comparación" },
    { key: "sentido_solo", label: "Se ha sentido solo" },
  ]},
  { titulo: "Familia", campos: [
    { key: "relacion_padres", label: "Relación con sus padres" },
    { key: "hablar_en_casa", label: "Puede hablar con alguien en casa" },
  ]},
  { titulo: "Vida espiritual", campos: [
    { key: "espiritual", label: "Cómo se siente espiritualmente" },
    { key: "peticion", label: "Petición de oración" },
  ]},
];

// --- Niño: evaluación ---
const seccionesEvalNino = [
  { titulo: "Hola", campos: [
    { key: "nombre", label: "Nombre" },
    { key: "edad", label: "Edad" },
    { key: "colegio", label: "Colegio" },
  ]},
  { titulo: "Cómo se ha sentido", campos: [
    { key: "sentimiento", label: "Sentimiento elegido" },
  ]},
  { titulo: "Cuéntanos un poquito", campos: [
    { key: "bonito_semana", label: "Lo más bonito de la semana" },
    { key: "triste_bravo", label: "Qué le puso triste o bravo" },
    { key: "miedo", label: "Algo que le dé miedo" },
  ]},
  { titulo: "Familia", campos: [
    { key: "pasar_familia", label: "Le gusta pasar tiempo con la familia" },
    { key: "relacion_padres", label: "Cómo se lleva con sus papás" },
  ]},
  { titulo: "Dios", campos: [
    { key: "ora_gusta", label: "Le gusta orar" },
    { key: "aprendio_dios", label: "Qué aprendió de Dios" },
    { key: "peticion", label: "Por qué quiere orar" },
  ]},
];

// --- Matrimonial: evaluación ---
const seccionesEvalMatrimonial = [
  { titulo: "Información básica", campos: [
    { key: "nombre_esposo", label: "Nombre del esposo" },
    { key: "nombre_esposa", label: "Nombre de la esposa" },
    { key: "tiempo_casados", label: "Tiempo de casados" },
    { key: "hijos", label: "Hijos" },
    { key: "iglesia", label: "Iglesia" },
  ]},
  { titulo: "Su relación hoy", campos: [
    { key: "describen_relacion", label: "Cómo describen su relación" },
    { key: "detalle_matrimonio", label: "Detalle de su matrimonio (relato)" },
    { key: "areas_ayuda", label: "Áreas en las que necesitan ayuda" },
  ]},
  { titulo: "Comunicación", campos: [
    { key: "fuente_conflictos", label: "Fuente principal de conflictos" },
    { key: "escucha_mutua", label: "Logran escucharse mutuamente" },
    { key: "manejo_desacuerdos", label: "Cómo manejan los desacuerdos" },
  ]},
  { titulo: "Vida espiritual juntos", campos: [
    { key: "oran_juntos", label: "¿Oran juntos?" },
    { key: "dios_centro", label: "Dios en el centro de la relación" },
  ]},
  { titulo: "Expectativas", campos: [
    { key: "expectativas", label: "Qué esperan del proceso" },
    { key: "dispuestos_trabajar", label: "Dispuestos a trabajar juntos" },
  ]},
];

// --- Adolescente: seguimiento ---
const seccionesSegAdolescente = [
  { titulo: "Su semana", campos: [
    { key: "como_semana", label: "Cómo estuvo su semana (1-5)" },
    { key: "lo_mejor", label: "Lo mejor de la semana" },
    { key: "lo_dificil", label: "Lo más difícil" },
    { key: "ocupo_mente", label: "Qué ocupó más su mente" },
  ]},
  { titulo: "Emociones", campos: [
    { key: "emociones", label: "Emociones presentes" },
  ]},
  { titulo: "Caminar con Dios", campos: [
    { key: "relacion_dios", label: "Relación con Dios esta semana" },
    { key: "peticion", label: "Petición de oración" },
  ]},
];

// --- Niño: seguimiento ---
const seccionesSegNino = [
  { titulo: "Su semana", campos: [
    { key: "como_semana", label: "Cómo estuvo su semana" },
    { key: "feliz", label: "Qué le hizo feliz" },
    { key: "dificil", label: "Qué fue difícil" },
  ]},
  { titulo: "Dios", campos: [
    { key: "oro", label: "¿Oró esta semana?" },
    { key: "aprendio", label: "Qué aprendió de Dios" },
  ]},
];

// --- Matrimonial: seguimiento ---
const seccionesSegMatrimonial = [
  { titulo: "Su semana juntos", campos: [
    { key: "como_relacion", label: "Cómo estuvo la relación (1-5)" },
    { key: "lo_mejor", label: "Lo mejor de la semana como pareja" },
    { key: "lo_dificil", label: "Lo difícil esta semana" },
  ]},
  { titulo: "Comunicación y conexión", campos: [
    { key: "conversaron_escucharon", label: "Pudieron conversar y escucharse" },
    { key: "oracion_perdon_conexion", label: "Momentos de oración, perdón o conexión" },
  ]},
  { titulo: "Esta próxima semana", campos: [
    { key: "trabajar_proxima", label: "Qué necesitan trabajar juntos" },
  ]},
];

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (Array.isArray(value)) return value.length === 0 ? "—" : value.join(", ");
  return String(value);
}

export default async function RespuestaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  type RespuestaRow = {
    id: string;
    created_at: string;
    revisado_at: string | null;
    notas_consejero: string | null;
    tipo: string;
    persona_id: string;
    respuestas: Record<string, unknown>;
    personas: { nombre: string; apellido: string } | { nombre: string; apellido: string }[] | null;
  };

  const { data, error } = await supabase
    .from("formularios_respuestas")
    .select("id, created_at, revisado_at, notas_consejero, tipo, persona_id, respuestas, personas(nombre, apellido)")
    .eq("id", id)
    .maybeSingle<RespuestaRow>();

  if (error || !data) notFound();

  const persona = Array.isArray(data.personas) ? data.personas[0] : data.personas;
  const nombre = persona ? `${persona.nombre} ${persona.apellido}` : "Aconsejado";

  const respuestas = (data.respuestas ?? {}) as Record<string, unknown>;
  const usadas = new Set<string>();

  type Seccion = { titulo: string; campos: { key: string; label: string; format?: (v: unknown) => string }[] };
  const seccionesPorTipo: Record<string, Seccion[]> = {
    evaluacion_inicial: seccionesEvaluacion,
    evaluacion_adolescente: seccionesEvalAdolescente,
    evaluacion_nino: seccionesEvalNino,
    evaluacion_matrimonial: seccionesEvalMatrimonial,
    seguimiento_semanal: seccionesSeguimiento,
    seguimiento_adolescente: seccionesSegAdolescente,
    seguimiento_nino: seccionesSegNino,
    seguimiento_matrimonial: seccionesSegMatrimonial,
  };
  const secciones: Seccion[] = seccionesPorTipo[data.tipo] ?? [];
  const camposExtra = Object.entries(respuestas).filter(([k]) => {
    if (secciones.length === 0) return true;
    return !secciones.some((s) => s.campos.some((c) => c.key === k));
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href={`/personas/${data.persona_id}`} className="text-xs text-stone-400 hover:text-amber-700">
            ← Volver al perfil
          </Link>
          <h1 className="text-2xl font-semibold text-stone-800 mt-1">
            {tipoLabel[data.tipo] ?? data.tipo}
          </h1>
          <p className="text-sm text-stone-500">
            De <span className="font-medium text-stone-700">{nombre}</span> ·{" "}
            {new Date(data.created_at).toLocaleString("es", { dateStyle: "long", timeStyle: "short" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data.revisado_at ? (
            <span className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
              Revisado el {new Date(data.revisado_at).toLocaleDateString("es")}
            </span>
          ) : (
            <MarcarRevisado respuestaId={data.id} personaId={data.persona_id} />
          )}
        </div>
      </div>

      {secciones.length > 0 ? (
        <div className="space-y-5">
          {secciones.map((seccion) => {
            const filas = seccion.campos
              .map((c) => {
                usadas.add(c.key);
                return { ...c, value: respuestas[c.key] };
              })
              .filter((f) => f.value !== undefined);
            if (filas.length === 0) return null;
            return (
              <section key={seccion.titulo} className="bg-white border border-stone-200 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-4">
                  {seccion.titulo}
                </h2>
                <dl className="divide-y divide-stone-100">
                  {filas.map((f) => (
                    <div key={f.key} className="py-3 grid sm:grid-cols-3 gap-2">
                      <dt className="text-xs text-stone-500 sm:col-span-1">{f.label}</dt>
                      <dd className="text-sm text-stone-800 sm:col-span-2 whitespace-pre-wrap">
                        {f.format ? f.format(f.value) : formatValue(f.value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            );
          })}
        </div>
      ) : null}

      {camposExtra.length > 0 && (
        <section className="bg-white border border-stone-200 rounded-2xl p-6">
          {secciones.length > 0 && (
            <h2 className="text-sm font-semibold text-stone-600 uppercase tracking-wide mb-4">
              Información adicional
            </h2>
          )}
          <dl className="divide-y divide-stone-100">
            {camposExtra.map(([k, v]) => (
              <div key={k} className="py-3 grid sm:grid-cols-3 gap-2">
                <dt className="text-xs text-stone-500 sm:col-span-1">{k.replace(/_/g, " ")}</dt>
                <dd className="text-sm text-stone-800 sm:col-span-2 whitespace-pre-wrap">
                  {formatValue(v)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {data.notas_consejero && (
        <section className="bg-amber-50/60 border border-amber-200 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-2">
            Notas del consejero
          </h2>
          <p className="text-sm text-stone-700 whitespace-pre-wrap">{data.notas_consejero}</p>
        </section>
      )}
    </div>
  );
}
