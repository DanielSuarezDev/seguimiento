import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import CopiarLink from "./CopiarLink";

const tipoLabel: Record<string, string> = {
  consentimiento_informado: "Consentimiento informado",
  evaluacion_inicial: "Evaluación inicial",
  seguimiento_semanal: "Seguimiento semanal",
  tareas_terapeuticas: "Tareas terapéuticas",
  personalizado: "Formulario personalizado",
};

export default async function VerLinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  type TokenRow = {
    id: string; token: string; tipo: string | null; expira_at: string; usado_at: string | null;
    created_at: string;
    personas: { id: string; nombre: string; apellido: string } | null;
    form_plantillas: { nombre: string } | null;
  };

  const { data: rawToken } = await supabase
    .from("formularios_tokens")
    .select("id, token, tipo, expira_at, usado_at, created_at, personas(id, nombre, apellido), form_plantillas(nombre)")
    .eq("id", id)
    .single();

  const token = rawToken as TokenRow | null;
  if (!token) notFound();

  const persona = Array.isArray(token.personas) ? token.personas[0] : token.personas;
  const plantilla = Array.isArray(token.form_plantillas) ? token.form_plantillas[0] : token.form_plantillas;
  const titulo = token.tipo === "personalizado" ? (plantilla?.nombre ?? "Formulario") : (tipoLabel[token.tipo ?? ""] ?? "Formulario");
  const expirado = new Date(token.expira_at) < new Date();
  const estado = token.usado_at ? "respondido" : expirado ? "expirado" : "pendiente";

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-7">
        <Link href="/formularios" className="text-stone-400 hover:text-stone-600 text-sm">← Formularios</Link>
        <span className="text-stone-300">/</span>
        <h1 className="text-xl font-semibold text-stone-800">Link de formulario</h1>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-5">
        <div>
          <p className="text-xs text-stone-400 mb-1">Formulario</p>
          <p className="text-lg font-semibold text-stone-800">{titulo}</p>
          {persona && (
            <p className="text-sm text-stone-500 mt-1">
              Para: <Link href={`/personas/${persona.id}`} className="text-amber-700 hover:text-amber-800">{persona.nombre} {persona.apellido}</Link>
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div>
            <p className="text-xs text-stone-400">Estado</p>
            <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-0.5 ${
              estado === "respondido" ? "bg-green-50 text-green-700" :
              estado === "expirado" ? "bg-red-50 text-red-600" :
              "bg-amber-50 text-amber-700"
            }`}>{estado}</span>
          </div>
          <div>
            <p className="text-xs text-stone-400">Enviado</p>
            <p className="text-stone-700">{new Date(token.created_at).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
          <div>
            <p className="text-xs text-stone-400">Expira</p>
            <p className="text-stone-700">{new Date(token.expira_at).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
        </div>

        {estado === "pendiente" ? (
          <CopiarLink token={token.token} />
        ) : (
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-sm text-stone-500">
            {estado === "respondido"
              ? "Este formulario ya fue respondido y el link ya no es válido."
              : "Este link ya expiró. Crea uno nuevo si lo necesitas."}
          </div>
        )}
      </div>
    </div>
  );
}
