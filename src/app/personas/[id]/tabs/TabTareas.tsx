import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import TareaActions from "./TareaActions";

const estadoColor: Record<string, string> = {
  pendiente:   "bg-amber-50 text-amber-700",
  en_progreso: "bg-blue-50 text-blue-700",
  completada:  "bg-green-50 text-green-700",
  omitida:     "bg-stone-100 text-stone-500",
};

const estadoLabel: Record<string, string> = {
  pendiente: "Pendiente", en_progreso: "En progreso", completada: "Completada", omitida: "Omitida",
};

export default async function TabTareas({ personaId }: { personaId: string }) {
  const supabase = await createClient();
  const hoy = new Date().toISOString().split("T")[0];

  type TareaRow = {
    id: string; titulo: string; descripcion: string | null; versiculos_referencia: string | null;
    fecha_asignacion: string; fecha_vencimiento: string | null; estado: string;
  };

  const { data: rawTareas } = await supabase
    .from("tareas")
    .select("id, titulo, descripcion, versiculos_referencia, fecha_asignacion, fecha_vencimiento, estado")
    .eq("persona_id", personaId)
    .order("fecha_asignacion", { ascending: false });

  const tareas = rawTareas as TareaRow[] | null;
  const activas = tareas?.filter((t) => t.estado === "pendiente" || t.estado === "en_progreso") ?? [];
  const cerradas = tareas?.filter((t) => t.estado === "completada" || t.estado === "omitida") ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-stone-700">Tareas y compromisos</h2>
        <Link
          href={`/tareas/nueva?persona_id=${personaId}`}
          className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nueva tarea
        </Link>
      </div>

      {!tareas || tareas.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-xl p-10 text-center">
          <p className="text-3xl mb-2">✅</p>
          <p className="text-stone-400 text-sm mb-4">Sin tareas asignadas</p>
          <Link
            href={`/tareas/nueva?persona_id=${personaId}`}
            className="inline-block bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Asignar primera tarea
          </Link>
        </div>
      ) : (
        <>
          {activas.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Activas ({activas.length})</h3>
              <div className="space-y-2">
                {activas.map((t) => {
                  const vencida = t.fecha_vencimiento && t.fecha_vencimiento < hoy;
                  return (
                    <div key={t.id} className="bg-white border border-stone-200 rounded-xl p-4 flex items-start gap-3">
                      <TareaActions tareaId={t.id} estado={t.estado} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-800">{t.titulo}</p>
                        {t.descripcion && <p className="text-xs text-stone-500 mt-0.5">{t.descripcion}</p>}
                        {t.versiculos_referencia && (
                          <p className="text-xs text-amber-700 mt-1">📖 {t.versiculos_referencia}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${estadoColor[t.estado]}`}>{estadoLabel[t.estado]}</span>
                          {t.fecha_vencimiento && (
                            <span className={`text-xs ${vencida ? "text-red-500 font-medium" : "text-stone-400"}`}>
                              {vencida ? "Vencida: " : "Vence: "}{t.fecha_vencimiento}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {cerradas.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Cerradas ({cerradas.length})</h3>
              <div className="space-y-2">
                {cerradas.map((t) => (
                  <div key={t.id} className="bg-white border border-stone-200 rounded-xl p-3 flex items-start gap-3 opacity-60">
                    <TareaActions tareaId={t.id} estado={t.estado} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-600 line-through">{t.titulo}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${estadoColor[t.estado]}`}>{estadoLabel[t.estado]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
