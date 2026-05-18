import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const tipoLabel: Record<string, string> = {
  consentimiento_informado: "Consentimiento informado",
  evaluacion_inicial: "Evaluación inicial",
  seguimiento_semanal: "Seguimiento semanal",
  tareas_terapeuticas: "Tareas terapéuticas",
  personalizado: "Formulario personalizado",
};

const estadoStyle: Record<string, string> = {
  respondido: "bg-green-50 text-green-700",
  expirado: "bg-red-50 text-red-600",
  pendiente: "bg-amber-50 text-amber-700",
};

export default async function TabFormularios({
  personaId,
  nombrePersona,
}: {
  personaId: string;
  nombrePersona: string;
}) {
  const supabase = await createClient();

  type TokenRow = {
    id: string; tipo: string | null; created_at: string; expira_at: string; usado_at: string | null;
    form_plantillas: { nombre: string } | null;
  };
  type RespuestaRow = {
    id: string; tipo: string; created_at: string; revisado_at: string | null; token_id: string;
  };

  const [{ data: rawTokens }, { data: rawRespuestas }] = await Promise.all([
    supabase
      .from("formularios_tokens")
      .select("id, tipo, created_at, expira_at, usado_at, form_plantillas(nombre)")
      .eq("persona_id", personaId)
      .order("created_at", { ascending: false }),
    supabase
      .from("formularios_respuestas")
      .select("id, tipo, created_at, revisado_at, token_id")
      .eq("persona_id", personaId)
      .order("created_at", { ascending: false }),
  ]);

  const tokens = rawTokens as TokenRow[] | null;
  const respuestas = rawRespuestas as RespuestaRow[] | null;
  const respuestasPorToken = new Map(respuestas?.map((r) => [r.token_id, r]) ?? []);
  const sinRevisar = respuestas?.filter((r) => !r.revisado_at) ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-stone-700">
          Formularios enviados a <span className="text-stone-800">{nombrePersona}</span>
        </h2>
        <Link
          href={`/formularios/nuevo?persona_id=${personaId}`}
          className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Enviar formulario
        </Link>
      </div>

      {/* Sin revisar */}
      {sinRevisar.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
            Sin revisar ({sinRevisar.length})
          </h3>
          <div className="space-y-2">
            {sinRevisar.map((r) => (
              <Link
                key={r.id}
                href={`/formularios/respuesta/${r.id}`}
                className="block bg-white border border-amber-200 rounded-xl p-4 hover:border-amber-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-stone-800">{tipoLabel[r.tipo] ?? r.tipo}</p>
                      <p className="text-xs text-stone-400">Respondido el {new Date(r.created_at).toLocaleDateString("es")}</p>
                    </div>
                  </div>
                  <span className="text-xs text-amber-700 font-medium">Ver respuesta →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Todos los formularios */}
      {!tokens || tokens.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-xl p-10 text-center">
          <p className="text-3xl mb-2">📝</p>
          <p className="text-stone-400 text-sm mb-4">Sin formularios enviados aún</p>
          <Link
            href={`/formularios/nuevo?persona_id=${personaId}`}
            className="inline-block bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Enviar primer formulario
          </Link>
        </div>
      ) : (
        <div>
          {sinRevisar.length > 0 && (
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Todos los formularios</h3>
          )}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            {tokens.map((t, i) => {
              const plantilla = Array.isArray(t.form_plantillas) ? t.form_plantillas[0] : t.form_plantillas;
              const titulo = t.tipo === "personalizado" ? (plantilla?.nombre ?? "Formulario") : (tipoLabel[t.tipo ?? ""] ?? "Formulario");
              const expirado = new Date(t.expira_at) < new Date();
              const estado = t.usado_at ? "respondido" : expirado ? "expirado" : "pendiente";
              const respuesta = respuestasPorToken.get(t.id);
              return (
                <div key={t.id} className={`flex items-center justify-between p-4 ${i > 0 ? "border-t border-stone-100" : ""}`}>
                  <div>
                    <p className="text-sm font-medium text-stone-800">{titulo}</p>
                    <p className="text-xs text-stone-400">Enviado el {new Date(t.created_at).toLocaleDateString("es")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {estado === "pendiente" && (
                      <Link href={`/formularios/link/${t.id}`} className="text-xs text-stone-400 hover:text-amber-700 transition-colors">
                        Ver link
                      </Link>
                    )}
                    {respuesta && (
                      <Link href={`/formularios/respuesta/${respuesta.id}`} className="text-xs text-amber-700 hover:text-amber-800 font-medium">
                        Ver respuesta
                      </Link>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${estadoStyle[estado]}`}>{estado}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
