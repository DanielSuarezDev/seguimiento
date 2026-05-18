import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AccionesTarea from "./AccionesTarea";

const estadoColor: Record<string, string> = {
  pendiente:   "bg-amber-50 text-amber-700",
  en_progreso: "bg-blue-50 text-blue-700",
  completada:  "bg-green-50 text-green-700",
  omitida:     "bg-stone-100 text-stone-500",
};
const estadoLabel: Record<string, string> = {
  pendiente: "Pendiente", en_progreso: "En progreso", completada: "Completada", omitida: "Omitida",
};

export default async function TareasPage() {
  const supabase = await createClient();
  const hoy = new Date().toISOString().split("T")[0];

  type TareaItem = { id: string; titulo: string; descripcion: string | null; fecha_vencimiento: string | null; estado: string; fecha_asignacion: string; versiculos_referencia: string | null; personas: { id: string; nombre: string; apellido: string } | null };

  const { data: rawTareas } = await supabase
    .from("tareas")
    .select("id, titulo, descripcion, fecha_vencimiento, estado, fecha_asignacion, versiculos_referencia, personas(id, nombre, apellido)")
    .order("fecha_vencimiento", { ascending: true, nullsFirst: false });

  const tareas = rawTareas as TareaItem[] | null;

  const pendientes = tareas?.filter((t) => t.estado === "pendiente" || t.estado === "en_progreso") ?? [];
  const completadas = tareas?.filter((t) => t.estado === "completada" || t.estado === "omitida") ?? [];

  function isVencida(fecha: string | null) {
    return fecha && fecha < hoy;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Tareas</h1>
          <p className="text-stone-400 text-sm mt-0.5">{pendientes.length} pendiente(s)</p>
        </div>
        <Link href="/tareas/nueva" className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          + Nueva tarea
        </Link>
      </div>

      {/* Pendientes */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">Pendientes</h2>
        {pendientes.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-10 text-center">
            <p className="text-3xl mb-2">✨</p>
            <p className="text-stone-400 text-sm">Sin tareas pendientes</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendientes.map((t) => {
              const p = Array.isArray(t.personas) ? t.personas[0] : t.personas;
              const vencida = isVencida(t.fecha_vencimiento);
              return (
                <div key={t.id} className={`bg-white border rounded-xl p-4 flex items-start gap-4 ${vencida ? "border-red-200" : "border-stone-200"}`}>
                  <AccionesTarea tareaId={t.id} estadoActual={t.estado as "pendiente" | "en_progreso" | "completada" | "omitida"} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-stone-800">{t.titulo}</p>
                        {t.descripcion && <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">{t.descripcion}</p>}
                        {t.versiculos_referencia && <p className="text-xs text-amber-600 mt-1">📖 {t.versiculos_referencia}</p>}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${estadoColor[t.estado]}`}>{estadoLabel[t.estado]}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      {p && (
                        <Link href={`/personas/${p.id}`} className="text-xs text-stone-400 hover:text-amber-700 transition-colors">
                          👤 {p.nombre} {p.apellido}
                        </Link>
                      )}
                      {t.fecha_vencimiento && (
                        <span className={`text-xs ${vencida ? "text-red-500 font-medium" : "text-stone-400"}`}>
                          {vencida ? "⚠️ Vencida: " : "Vence: "}{t.fecha_vencimiento}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completadas */}
      {completadas.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">Completadas / Omitidas</h2>
          <div className="space-y-2">
            {completadas.slice(0, 10).map((t) => {
              const p = Array.isArray(t.personas) ? t.personas[0] : t.personas;
              return (
                <div key={t.id} className="bg-white border border-stone-100 rounded-xl p-4 flex items-center gap-4 opacity-60">
                  <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${t.estado === "completada" ? "bg-green-500 border-green-500" : "border-stone-300"}`}>
                    {t.estado === "completada" && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-500 line-through truncate">{t.titulo}</p>
                    {p && <p className="text-xs text-stone-400">{p.nombre} {p.apellido}</p>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${estadoColor[t.estado]}`}>{estadoLabel[t.estado]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
