import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import EliminarFormulario from "./EliminarFormulario";

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

type Token = { id: string; tipo: string; created_at: string; expira_at: string; usado_at: string | null; personas: { id: string; nombre: string; apellido: string } | null };
type Respuesta = { id: string; tipo: string; created_at: string; revisado_at: string | null; token_id: string; personas: { nombre: string; apellido: string } | null };

export default async function FormulariosPage() {
  const supabase = await createClient();

  const { data: rawTokens } = await supabase
    .from("formularios_tokens")
    .select("id, tipo, created_at, expira_at, usado_at, personas(id, nombre, apellido)")
    .order("created_at", { ascending: false });

  const { data: rawRespuestas } = await supabase
    .from("formularios_respuestas")
    .select("id, tipo, created_at, revisado_at, token_id, personas(nombre, apellido)")
    .order("created_at", { ascending: false });

  const tokens     = rawTokens     as Token[]     | null;
  const respuestas = rawRespuestas as Respuesta[] | null;
  const sinRevisar = respuestas?.filter((r) => !r.revisado_at) ?? [];

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Formularios</h1>
          <p className="text-stone-400 text-sm mt-0.5">
            {sinRevisar.length > 0 ? `${sinRevisar.length} respuesta(s) sin revisar` : "Todo revisado"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/configuracion/formularios" className="bg-white border border-stone-300 hover:border-stone-400 text-stone-600 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
            Mis plantillas
          </Link>
          <Link href="/formularios/nuevo" className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
            + Enviar formulario
          </Link>
        </div>
      </div>

      {/* Respuestas sin revisar */}
      {sinRevisar.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">Sin revisar</h2>
          <div className="space-y-2">
            {sinRevisar.map((r) => {
              const p = Array.isArray(r.personas) ? r.personas[0] : r.personas;
              return (
                <Link key={r.id} href={`/formularios/respuesta/${r.id}`} className="bg-white border border-amber-200 rounded-xl p-4 flex items-center justify-between hover:border-amber-300 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-stone-800">{tipoLabel[r.tipo] ?? r.tipo}</p>
                      <p className="text-xs text-stone-400">{p ? `${p.nombre} ${p.apellido}` : "—"} · {new Date(r.created_at).toLocaleDateString("es")}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">Nueva respuesta →</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Todos los formularios enviados */}
      <div>
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">Formularios enviados</h2>
        {!tokens || tokens.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-stone-400 text-sm mb-4">Aún no has enviado formularios a ningún paciente</p>
            <Link href="/formularios/nuevo" className="inline-block bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
              Enviar primer formulario
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            {tokens.map((t, i) => {
              const p = Array.isArray(t.personas) ? t.personas[0] : t.personas;
              const expirado = new Date(t.expira_at) < new Date();
              const estado = t.usado_at ? "respondido" : expirado ? "expirado" : "pendiente";
              const estadoStyle = { respondido: "bg-green-50 text-green-700", expirado: "bg-red-50 text-red-600", pendiente: "bg-amber-50 text-amber-700" };
              return (
                <div key={t.id} className={`flex items-center justify-between p-4 ${i > 0 ? "border-t border-stone-100" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-xs font-semibold text-stone-600">
                      {p?.nombre?.[0] ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-800">{tipoLabel[t.tipo] ?? t.tipo}</p>
                      <p className="text-xs text-stone-400">{p ? `${p.nombre} ${p.apellido}` : "—"} · {new Date(t.created_at).toLocaleDateString("es")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {estado === "pendiente" && (
                      <Link href={`/formularios/link/${t.id}`} className="text-xs text-stone-400 hover:text-amber-700 transition-colors">
                        Ver link
                      </Link>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${estadoStyle[estado]}`}>{estado}</span>
                    <EliminarFormulario tokenId={t.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
