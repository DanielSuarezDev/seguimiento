import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SesionForm from "../../nueva/SesionForm";
import type { SesionFormInput } from "../../nueva/schema";

type SesionRow = {
  id: string;
  persona_id: string;
  fecha: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  tipo_consejeria_id: string | null;
  estado: string;
  objetivo_principal: string | null;
  objetivos_sesion: string | null;
  situacion_presentada: string | null;
  motivo_consulta: string | null;
  eventos_semana: string | null;
  conflictos_actuales: string | null;
  sintomas_emociones: string | null;
  emociones_observadas: string[] | null;
  asuntos_corazon: string[] | null;
  observaciones_corazon: string | null;
  versiculos: string | null;
  ensenanza_biblica: string | null;
  aplicacion_evangelio: string | null;
  llamado_arrepentimiento: string | null;
  respuesta_aconsejado: string | null;
  evidencias_crecimiento: string | null;
  resumen_pastoral: string | null;
  contenido: string | null;
  observaciones_privadas: string | null;
  evaluacion_progreso: string | null;
  proxima_sesion: string | null;
  proxima_sesion_hora: string | null;
  temas_proxima_sesion: string | null;
};

type TareaRow = {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_vencimiento: string | null;
  tipo: string | null;
  prioridad: string | null;
};

const TIPOS_VALIDOS = new Set([
  "lectura_biblica", "devocional", "oracion", "memorizacion",
  "diario_reflexion", "perdon_reconciliacion", "comunicacion",
  "servicio", "accion_practica", "ayuno", "otro",
]);

const ESTADOS_VALIDOS = new Set([
  "programada", "en_proceso", "completada", "cancelada", "reprogramada",
]);

const RESPUESTAS_VALIDAS = new Set([
  "receptivo", "humilde", "defensivo", "confundido", "quebrantado",
  "esperanzado", "arrepentido", "indiferente", "resistente",
]);

const PROGRESOS_VALIDOS = new Set([
  "estancado", "lucha_constante", "mostrando_apertura",
  "evidencia_crecimiento", "arrepentimiento_evidente", "caminando_consistentemente",
]);

export default async function EditarSesionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: rawSesion }, { data: rawTareas }] = await Promise.all([
    supabase.from("sesiones").select("*").eq("id", id).maybeSingle(),
    supabase.from("tareas")
      .select("id, titulo, descripcion, fecha_vencimiento, tipo, prioridad")
      .eq("sesion_id", id)
      .order("created_at"),
  ]);

  const sesion = rawSesion as SesionRow | null;
  if (!sesion) notFound();

  const tareas = (rawTareas as TareaRow[] | null) ?? [];

  // Mapear estado legacy "pendiente" → "programada" para el form
  const estadoMapeado = sesion.estado === "pendiente" ? "programada" : sesion.estado;
  const estadoSeguro = ESTADOS_VALIDOS.has(estadoMapeado) ? estadoMapeado : "programada";

  const respuesta = sesion.respuesta_aconsejado && RESPUESTAS_VALIDAS.has(sesion.respuesta_aconsejado)
    ? sesion.respuesta_aconsejado : "";
  const progreso = sesion.evaluacion_progreso && PROGRESOS_VALIDOS.has(sesion.evaluacion_progreso)
    ? sesion.evaluacion_progreso : "";

  const initialValues: SesionFormInput = {
    persona_id: sesion.persona_id,
    tipo_consejeria_id: sesion.tipo_consejeria_id ?? "",
    fecha: sesion.fecha,
    hora_inicio: sesion.hora_inicio?.slice(0, 5) ?? "",
    hora_fin: sesion.hora_fin?.slice(0, 5) ?? "",
    estado: estadoSeguro as SesionFormInput["estado"],
    objetivo_principal: sesion.objetivo_principal ?? sesion.objetivos_sesion ?? "",
    situacion_presentada: sesion.situacion_presentada ?? sesion.motivo_consulta ?? "",
    eventos_semana: sesion.eventos_semana ?? "",
    conflictos_actuales: sesion.conflictos_actuales ?? "",
    sintomas_emociones: sesion.sintomas_emociones ?? "",
    emociones_observadas: sesion.emociones_observadas ?? [],
    asuntos_corazon: sesion.asuntos_corazon ?? [],
    observaciones_corazon: sesion.observaciones_corazon ?? "",
    versiculos: sesion.versiculos ?? "",
    ensenanza_biblica: sesion.ensenanza_biblica ?? "",
    aplicacion_evangelio: sesion.aplicacion_evangelio ?? "",
    llamado_arrepentimiento: sesion.llamado_arrepentimiento ?? "",
    respuesta_aconsejado: respuesta as SesionFormInput["respuesta_aconsejado"],
    evidencias_crecimiento: sesion.evidencias_crecimiento ?? "",
    tareas: tareas.map((t) => ({
      tipo: (t.tipo && TIPOS_VALIDOS.has(t.tipo) ? t.tipo : "otro") as "otro",
      titulo: t.titulo,
      descripcion: t.descripcion ?? "",
      fecha_vencimiento: t.fecha_vencimiento ?? "",
      prioridad: (t.prioridad === "alta" || t.prioridad === "baja" ? t.prioridad : "media") as "media",
    })),
    resumen_pastoral: sesion.resumen_pastoral ?? sesion.contenido ?? "",
    observaciones_privadas: sesion.observaciones_privadas ?? "",
    evaluacion_progreso: progreso as SesionFormInput["evaluacion_progreso"],
    proxima_sesion: sesion.proxima_sesion ?? "",
    proxima_sesion_hora: sesion.proxima_sesion_hora?.slice(0, 5) ?? "",
    temas_proxima_sesion: sesion.temas_proxima_sesion ?? "",
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href={`/sesiones/${id}`} className="text-sm text-stone-400 hover:text-stone-600">
          ← Volver a la sesión
        </Link>
        <h1 className="text-3xl font-semibold text-stone-800 mt-2">Editar sesión</h1>
        <p className="text-stone-500 text-sm sm:text-base mt-1 max-w-xl leading-relaxed">
          Ajusta lo que necesites. Las tareas se reemplazan al guardar.
        </p>
      </div>

      <Suspense fallback={<div className="text-stone-400 text-sm">Cargando…</div>}>
        <SesionForm mode="edit" sesionId={id} initialValues={initialValues} />
      </Suspense>
    </div>
  );
}
