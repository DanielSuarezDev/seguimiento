import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ConsentimientoForm from "@/components/formularios/ConsentimientoForm";
import EvaluacionInicialForm from "@/components/formularios/EvaluacionInicialForm";
import SeguimientoSemanalForm from "@/components/formularios/SeguimientoSemanalForm";
import TareasTerapeuticasForm from "@/components/formularios/TareasTerapeuticasForm";
import FormularioPersonalizado from "@/components/formularios/FormularioPersonalizado";
import type { Pregunta } from "@/components/formularios/FormularioPersonalizado";

export default async function FormularioPublicoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  type TokenData = {
    id: string; tipo: string | null; expira_at: string; usado_at: string | null;
    persona_id: string; plantilla_id: string | null;
    persona_nombre: string | null; persona_apellido: string | null;
    plantilla_nombre: string | null;
  };

  // Usamos un RPC con security definer para poder leer el nombre del aconsejado
  // y de la plantilla sin exponer las tablas vía RLS al rol anónimo.
  // @ts-expect-error — función agregada vía migración SQL, no está en los tipos
  const { data: rawToken } = await supabase.rpc("token_publico", { t_token: token });
  const tokenData = (rawToken as TokenData[] | null)?.[0] ?? null;
  if (!tokenData) notFound();

  const nombrePersona = tokenData.persona_nombre && tokenData.persona_apellido
    ? `${tokenData.persona_nombre} ${tokenData.persona_apellido}`
    : "";
  const expirado = new Date(tokenData.expira_at) < new Date();

  if (expirado) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
        <p className="text-4xl mb-4">⏰</p>
        <h1 className="text-xl font-semibold text-stone-800 mb-2">Este formulario ha expirado</h1>
        <p className="text-stone-400 text-sm">Pide a tu consejero que te envíe un nuevo link.</p>
      </div>
    );
  }

  if (tokenData.usado_at) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
        <p className="text-4xl mb-4">✅</p>
        <h1 className="text-xl font-semibold text-stone-800 mb-2">Ya respondiste este formulario</h1>
        <p className="text-stone-400 text-sm">Tu consejero ya recibió tus respuestas. ¡Gracias!</p>
      </div>
    );
  }

  const tipoLabel: Record<string, string> = {
    consentimiento_informado: "Consentimiento informado",
    evaluacion_inicial: "Evaluación inicial",
    seguimiento_semanal: "Seguimiento semanal",
    tareas_terapeuticas: "Tareas terapéuticas",
    personalizado: "",
  };

  // Determinar el título del formulario
  const esPersonalizado = tokenData.tipo === "personalizado" && !!tokenData.plantilla_id;
  const tituloFormulario = esPersonalizado
    ? (tokenData.plantilla_nombre ?? "Formulario")
    : (tipoLabel[tokenData.tipo ?? ""] ?? "Formulario");

  const props = { tokenId: tokenData.id, token, personaId: tokenData.persona_id, nombrePersona };

  // Para formulario personalizado: cargar preguntas
  let preguntasPersonalizado: Pregunta[] = [];
  if (esPersonalizado) {
    type PreguntaRow = { id: string; orden: number; tipo: string; pregunta: string; placeholder: string | null; requerida: boolean; opciones: string[] | null };
    const { data } = await supabase
      .from("form_preguntas")
      .select("id, orden, tipo, pregunta, placeholder, requerida, opciones")
      .eq("plantilla_id", tokenData.plantilla_id!)
      .order("orden");
    preguntasPersonalizado = (data as PreguntaRow[] | null) ?? [];
  }

  // Para tareas terapéuticas: cargar tareas pendientes
  let tareasPersona: { id: string; titulo: string; descripcion: string | null }[] = [];
  if (tokenData.tipo === "tareas_terapeuticas") {
    const { data } = await supabase
      .from("tareas")
      .select("id, titulo, descripcion")
      .eq("persona_id", tokenData.persona_id)
      .in("estado", ["pendiente", "en_progreso"]);
    tareasPersona = data ?? [];
  }

  const ocultarHeader = tokenData.tipo === "evaluacion_inicial";

  return (
    <div>
      {!ocultarHeader && (
        <div className="mb-8">
          <p className="text-sm text-stone-400 mb-1">
            Para: <span className="font-medium text-stone-600">{nombrePersona || "Paciente"}</span>
          </p>
          <h1 className="text-2xl font-semibold text-stone-800">{tituloFormulario}</h1>
          <p className="text-stone-400 text-sm mt-1">Por favor completa el formulario con honestidad. Tus respuestas son confidenciales.</p>
        </div>
      )}

      {esPersonalizado && <FormularioPersonalizado {...props} preguntas={preguntasPersonalizado} />}
      {tokenData.tipo === "consentimiento_informado" && <ConsentimientoForm {...props} />}
      {tokenData.tipo === "evaluacion_inicial" && <EvaluacionInicialForm {...props} />}
      {tokenData.tipo === "seguimiento_semanal" && <SeguimientoSemanalForm {...props} />}
      {tokenData.tipo === "tareas_terapeuticas" && <TareasTerapeuticasForm {...props} tareas={tareasPersona} />}
    </div>
  );
}
