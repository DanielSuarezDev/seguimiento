import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const estadoColor: Record<string, string> = {
  pendiente:  "bg-amber-50 text-amber-700 border-amber-200",
  completada: "bg-green-50 text-green-700 border-green-200",
  cancelada:  "bg-red-50 text-red-500 border-red-200",
};

const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ mes?: string; año?: string }> }) {
  const sp = await searchParams;
  const now = new Date();
  const year  = sp.año ? Number(sp.año)  : now.getFullYear();
  const month = sp.mes ? Number(sp.mes) - 1 : now.getMonth();

  const firstDay = new Date(year, month, 1).toISOString().split("T")[0];
  const lastDay  = new Date(year, month + 1, 0).toISOString().split("T")[0];

  const supabase = await createClient();

  type SesionAgenda = { id: string; fecha: string; hora_inicio: string | null; estado: string; numero_sesion: number; personas: { nombre: string; apellido: string } | null };
  type TareaAgenda  = { id: string; titulo: string; fecha_vencimiento: string | null; estado: string };

  const [{ data: rawSesiones }, { data: rawTareas }] = await Promise.all([
    supabase.from("sesiones").select("id, fecha, hora_inicio, estado, numero_sesion, personas(nombre, apellido)")
      .gte("fecha", firstDay).lte("fecha", lastDay).order("fecha").order("hora_inicio"),
    supabase.from("tareas").select("id, titulo, fecha_vencimiento, estado")
      .gte("fecha_vencimiento", firstDay).lte("fecha_vencimiento", lastDay).in("estado", ["pendiente","en_progreso"]),
  ]);

  const sesiones = rawSesiones as SesionAgenda[] | null;
  const tareas   = rawTareas  as TareaAgenda[]  | null;

  const sesionesMap: Record<number, SesionAgenda[]> = {};
  sesiones?.forEach((s) => {
    const d = new Date(s.fecha + "T00:00:00").getDate();
    if (!sesionesMap[d]) sesionesMap[d] = [];
    sesionesMap[d]!.push(s);
  });

  const tareasMap: Record<number, TareaAgenda[]> = {};
  tareas?.forEach((t) => {
    if (!t.fecha_vencimiento) return;
    const d = new Date(t.fecha_vencimiento + "T00:00:00").getDate();
    if (!tareasMap[d]) tareasMap[d] = [];
    tareasMap[d]!.push(t);
  });

  const cells = buildCalendar(year, month);
  const hoy = now.toISOString().split("T")[0];
  const todayDay = now.getFullYear() === year && now.getMonth() === month ? now.getDate() : -1;

  // Prev/next
  const prevMonth = month === 0 ? { mes: 12, año: year - 1 } : { mes: month, año: year };
  const nextMonth = month === 11 ? { mes: 1, año: year + 1 } : { mes: month + 2, año: year };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-7">
        <h1 className="text-2xl font-semibold text-stone-800">Agenda</h1>
        <Link href="/sesiones/nueva" className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          + Nueva sesión
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-xl overflow-hidden">
          {/* Header mes */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <Link href={`/agenda?mes=${prevMonth.mes}&año=${prevMonth.año}`} className="text-stone-400 hover:text-stone-600 transition-colors px-2 py-1 rounded">←</Link>
            <h2 className="font-semibold text-stone-700">{meses[month]} {year}</h2>
            <Link href={`/agenda?mes=${nextMonth.mes}&año=${nextMonth.año}`} className="text-stone-400 hover:text-stone-600 transition-colors px-2 py-1 rounded">→</Link>
          </div>

          {/* Días semana */}
          <div className="grid grid-cols-7 border-b border-stone-100">
            {diasSemana.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-stone-400">{d}</div>
            ))}
          </div>

          {/* Celdas */}
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              const isHoy = day === todayDay;
              const hasSesiones = day && sesionesMap[day]?.length;
              const hasTareas = day && tareasMap[day]?.length;
              return (
                <div key={idx} className={`min-h-[60px] sm:min-h-[80px] p-1 sm:p-1.5 border-b border-r border-stone-50 ${!day ? "bg-stone-50/50" : ""}`}>
                  {day && (
                    <>
                      <div className={`w-6 h-6 flex items-center justify-center text-xs font-medium rounded-full mb-1 ${isHoy ? "bg-amber-600 text-white" : "text-stone-600"}`}>
                        {day}
                      </div>
                      {sesionesMap[day]?.slice(0,2).map((s) => {
                        const p = Array.isArray(s.personas) ? s.personas[0] : s.personas;
                        return (
                          <Link key={s.id} href={`/sesiones/${s.id}`}
                            className={`block text-[10px] px-1.5 py-0.5 rounded mb-0.5 border truncate leading-tight ${estadoColor[s.estado]}`}>
                            {s.hora_inicio ? s.hora_inicio.slice(0,5) + " " : ""}{p?.nombre ?? "—"}
                          </Link>
                        );
                      })}
                      {hasTareas ? <div className="text-[10px] text-stone-400 mt-0.5">✅ {tareasMap[day]!.length} tarea(s)</div> : null}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel lateral: sesiones del mes */}
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <h3 className="font-medium text-stone-700 mb-3 text-sm">Sesiones este mes</h3>
            {!sesiones || sesiones.length === 0 ? (
              <p className="text-sm text-stone-400 py-4 text-center">Sin sesiones</p>
            ) : (
              <div className="space-y-2">
                {sesiones.map((s) => {
                  const p = Array.isArray(s.personas) ? s.personas[0] : s.personas;
                  const fechaDate = new Date(s.fecha + "T00:00:00");
                  return (
                    <Link key={s.id} href={`/sesiones/${s.id}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 transition-colors">
                      <div className="w-8 h-8 bg-amber-50 rounded-lg flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] text-amber-600 font-medium leading-none">{diasSemana[fechaDate.getDay()]}</span>
                        <span className="text-xs font-bold text-amber-800 leading-none">{fechaDate.getDate()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-stone-700 truncate">{p ? `${p.nombre} ${p.apellido}` : "—"}</p>
                        <p className="text-xs text-stone-400">{s.hora_inicio ? s.hora_inicio.slice(0,5) : "Sin hora"}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {tareas && tareas.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <h3 className="font-medium text-stone-700 mb-3 text-sm">Tareas que vencen este mes</h3>
              <div className="space-y-2">
                {tareas.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 p-2">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-stone-600 truncate">{t.titulo}</p>
                      <p className="text-xs text-stone-400">{t.fecha_vencimiento}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
