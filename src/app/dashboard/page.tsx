import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const hoy = new Date().toISOString().split("T")[0];

const estadoBadge: Record<string, string> = {
  pendiente:  "bg-amber-50 text-amber-700",
  en_progreso: "bg-blue-50 text-blue-700",
  completada: "bg-green-50 text-green-700",
  cancelada:  "bg-red-50 text-red-600",
  omitida:    "bg-stone-100 text-stone-500",
};

type Persona2 = { id?: string; nombre: string; apellido: string };
type SesionHoy = { id: string; persona_id: string; hora_inicio: string | null; hora_fin: string | null; estado: string; personas: Persona2 | null };
type TareaV    = { id: string; titulo: string; fecha_vencimiento: string | null; estado: string; persona_id: string; personas: Persona2 | null };
type SesionProx= { id: string; persona_id: string; fecha: string; hora_inicio: string | null; numero_sesion: number; personas: Persona2 | null };
type Respuesta = { id: string; tipo: string; created_at: string; persona_id: string; personas: Persona2 | null };
type Plantilla = { id: string; nombre: string; descripcion: string | null };

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalPersonas },
    { count: totalSesiones },
    { count: tareasPendientes },
    { count: formsSinRevisar },
    { data: rawSesionesHoy },
    { data: rawTareasVencidas },
    { data: rawProximasSesiones },
    { data: rawRespuestasSinRevisar },
    { data: rawPlantillas },
  ] = await Promise.all([
    supabase.from("personas").select("*", { count: "exact", head: true }).eq("activo", true),
    supabase.from("sesiones").select("*", { count: "exact", head: true }),
    supabase.from("tareas").select("*", { count: "exact", head: true }).in("estado", ["pendiente", "en_progreso"]),
    supabase.from("formularios_respuestas").select("*", { count: "exact", head: true }).is("revisado_at", null),
    supabase.from("sesiones").select("id, persona_id, hora_inicio, hora_fin, estado, personas(nombre, apellido)").eq("fecha", hoy).order("hora_inicio"),
    supabase.from("tareas").select("id, titulo, fecha_vencimiento, estado, persona_id, personas(nombre, apellido)").in("estado", ["pendiente", "en_progreso"]).lte("fecha_vencimiento", hoy).order("fecha_vencimiento").limit(5),
    supabase.from("sesiones").select("id, persona_id, fecha, hora_inicio, numero_sesion, personas(nombre, apellido)").eq("estado", "pendiente").gt("fecha", hoy).order("fecha").limit(4),
    supabase.from("formularios_respuestas").select("id, tipo, created_at, persona_id, personas(nombre, apellido)").is("revisado_at", null).order("created_at", { ascending: false }).limit(3),
    supabase.from("form_plantillas").select("id, nombre, descripcion").eq("activo", true).order("created_at", { ascending: false }),
  ]);

  const sesionesHoy       = rawSesionesHoy       as SesionHoy[]  | null;
  const tareasVencidas    = rawTareasVencidas     as TareaV[]     | null;
  const proximasSesiones  = rawProximasSesiones   as SesionProx[] | null;
  const respuestas        = rawRespuestasSinRevisar as Respuesta[] | null;
  const plantillas        = rawPlantillas as Plantilla[] | null;

  const stats = [
    { label: "Personas activas", value: totalPersonas ?? 0, icon: "👥", color: "text-blue-600 bg-blue-50" },
    { label: "Sesiones totales", value: totalSesiones ?? 0, icon: "📋", color: "text-amber-600 bg-amber-50" },
    { label: "Tareas activas", value: tareasPendientes ?? 0, icon: "✅", color: "text-green-600 bg-green-50" },
    { label: "Formularios sin revisar", value: formsSinRevisar ?? 0, icon: "📝", color: "text-rose-600 bg-rose-50" },
  ];

  return (
    <div className="max-w-6xl">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold text-stone-800">Dashboard</h1>
        <p className="text-stone-400 text-sm mt-0.5">
          {new Date().toLocaleDateString("es", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-stone-200 rounded-xl p-5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg mb-3 ${s.color}`}>{s.icon}</div>
            <div className="text-2xl font-bold text-stone-800">{s.value}</div>
            <div className="text-xs text-stone-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">

        {/* Columna izquierda: actividad del día */}
        <div className="col-span-2 space-y-5">

          {/* Hoy */}
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-stone-700 flex items-center gap-2">
                <span>📅</span> Hoy
              </h2>
            </div>
            {!sesionesHoy || sesionesHoy.length === 0 ? (
              <div className="py-6 text-center text-stone-400">
                <p className="text-2xl mb-1">🌿</p>
                <p className="text-sm">Sin sesiones programadas hoy</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sesionesHoy.map((s) => {
                  const p = Array.isArray(s.personas) ? s.personas[0] : s.personas;
                  return (
                    <Link key={s.id} href={`/personas/${s.persona_id}?tab=sesiones`} className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-xs font-semibold text-amber-800">
                          {p?.nombre?.[0] ?? "?"}{p?.apellido?.[0] ?? ""}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-700">{p ? `${p.nombre} ${p.apellido}` : "—"}</p>
                          <p className="text-xs text-stone-400">{s.hora_inicio ? s.hora_inicio.slice(0,5) : "Sin hora"}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${estadoBadge[s.estado]}`}>{s.estado}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Próximas sesiones */}
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-stone-700 flex items-center gap-2">
                <span>🗓</span> Próximas sesiones
              </h2>
            </div>
            {!proximasSesiones || proximasSesiones.length === 0 ? (
              <div className="py-6 text-center text-stone-400">
                <p className="text-sm">No hay sesiones próximas programadas</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {proximasSesiones.map((s) => {
                  const p = Array.isArray(s.personas) ? s.personas[0] : s.personas;
                  return (
                    <Link key={s.id} href={`/personas/${s.persona_id}?tab=sesiones`} className="flex items-center gap-3 p-3 rounded-lg border border-stone-100 hover:border-amber-200 hover:bg-amber-50/40 transition-all">
                      <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center text-xs font-bold text-amber-800 shrink-0">
                        {p?.nombre?.[0] ?? "?"}{p?.apellido?.[0] ?? ""}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-700 truncate">{p ? `${p.nombre} ${p.apellido}` : "—"}</p>
                        <p className="text-xs text-stone-400">
                          {new Date(s.fecha + "T00:00:00").toLocaleDateString("es", { weekday: "short", day: "numeric", month: "short" })}
                          {s.hora_inicio ? ` · ${s.hora_inicio.slice(0,5)}` : ""}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tareas vencidas */}
          {tareasVencidas && tareasVencidas.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-xl p-5">
              <h2 className="font-medium text-stone-700 flex items-center gap-2 mb-4">
                <span>⚠️</span> Tareas vencidas
              </h2>
              <div className="space-y-2">
                {tareasVencidas.map((t) => {
                  const p = Array.isArray(t.personas) ? t.personas[0] : t.personas;
                  return (
                    <Link key={t.id} href={`/personas/${t.persona_id}?tab=tareas`} className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-stone-700">{t.titulo}</p>
                        <p className="text-xs text-stone-400">{p ? `${p.nombre} ${p.apellido}` : "—"}</p>
                      </div>
                      <span className="text-xs text-red-500 font-medium">{t.fecha_vencimiento}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Respuestas sin revisar */}
          {respuestas && respuestas.length > 0 && (
            <div className="bg-white border border-amber-200 rounded-xl p-5">
              <h2 className="font-medium text-stone-700 flex items-center gap-2 mb-4">
                <span>📨</span> Respuestas sin revisar
              </h2>
              <div className="space-y-2">
                {respuestas.map((r) => {
                  const p = Array.isArray(r.personas) ? r.personas[0] : r.personas;
                  return (
                    <Link key={r.id} href={`/personas/${r.persona_id}?tab=formularios`} className="flex items-center justify-between p-3 rounded-lg hover:bg-amber-50/50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-stone-700">{p ? `${p.nombre} ${p.apellido}` : "—"}</p>
                        <p className="text-xs text-stone-400">Respondió hace {Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86400000)}d</p>
                      </div>
                      <span className="text-xs text-amber-700 font-medium">Ver →</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha: plantillas */}
        <div className="space-y-5">
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-stone-700 flex items-center gap-2">
                <span>📋</span> Plantillas
              </h2>
              <Link href="/configuracion/formularios/nueva" className="text-xs text-amber-700 hover:text-amber-800 font-medium">
                + Nueva
              </Link>
            </div>

            {!plantillas || plantillas.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-stone-400 text-sm mb-3">Sin plantillas de formulario</p>
                <Link
                  href="/configuracion/formularios"
                  className="inline-block bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  Importar estándar
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {plantillas.slice(0, 6).map((pl) => (
                  <Link
                    key={pl.id}
                    href={`/configuracion/formularios/${pl.id}`}
                    className="block p-2.5 rounded-lg hover:bg-stone-50 transition-colors group"
                  >
                    <p className="text-sm font-medium text-stone-700 group-hover:text-amber-700">{pl.nombre}</p>
                    {pl.descripcion && <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{pl.descripcion}</p>}
                  </Link>
                ))}
                {plantillas.length > 6 && (
                  <Link href="/configuracion/formularios" className="block text-xs text-amber-700 hover:text-amber-800 pt-2 text-center">
                    Ver todas ({plantillas.length})
                  </Link>
                )}
                <Link href="/configuracion/formularios" className="block text-xs text-stone-400 hover:text-amber-700 pt-2 text-center border-t border-stone-100 mt-3">
                  Gestionar plantillas →
                </Link>
              </div>
            )}
          </div>

          {/* Acciones rápidas */}
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <h2 className="font-medium text-stone-700 mb-4">Acciones</h2>
            <div className="space-y-2">
              <Link href="/personas/nueva" className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-stone-50 text-sm text-stone-600 transition-colors">
                <span>👤</span> Nueva persona
              </Link>
              <Link href="/personas" className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-stone-50 text-sm text-stone-600 transition-colors">
                <span>👥</span> Ver todas las personas
              </Link>
              <Link href="/configuracion/formularios" className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-stone-50 text-sm text-stone-600 transition-colors">
                <span>📋</span> Editar plantillas
              </Link>
              <Link href="/configuracion" className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-stone-50 text-sm text-stone-600 transition-colors">
                <span>⚙️</span> Configuración
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
