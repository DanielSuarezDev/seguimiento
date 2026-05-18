import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const estadoLabel: Record<string, string> = {
  pendiente: "Programada",
  programada: "Programada",
  en_proceso: "En proceso",
  completada: "Completada",
  cancelada: "Cancelada",
  reprogramada: "Reprogramada",
};

const estadoColor: Record<string, string> = {
  pendiente: "bg-amber-50 text-amber-700",
  programada: "bg-amber-50 text-amber-700",
  en_proceso: "bg-blue-50 text-blue-700",
  completada: "bg-green-50 text-green-700",
  cancelada: "bg-red-50 text-red-600",
  reprogramada: "bg-stone-100 text-stone-600",
};

const progresoLabel: Record<string, string> = {
  estancado: "Estancado",
  lucha_constante: "Lucha constante",
  mostrando_apertura: "Mostrando apertura",
  evidencia_crecimiento: "Evidencia de crecimiento",
  arrepentimiento_evidente: "Arrepentimiento evidente",
  caminando_consistentemente: "Caminando consistentemente",
};

type SubTabKey = "programada" | "en_proceso" | "completada";

const SUBTABS: { key: SubTabKey; label: string; estados: string[] }[] = [
  { key: "programada", label: "Programadas", estados: ["pendiente", "programada", "reprogramada"] },
  { key: "en_proceso", label: "En proceso", estados: ["en_proceso"] },
  { key: "completada", label: "Completadas", estados: ["completada"] },
];

type SesionRow = {
  id: string; fecha: string;
  hora_inicio: string | null; hora_fin: string | null;
  numero_sesion: number;
  estado: string;
  motivo_consulta: string | null; situacion_presentada: string | null;
  objetivos_sesion: string | null; objetivo_principal: string | null;
  evaluacion_progreso: string | null;
};

function duracionTexto(inicio: string | null, fin: string | null) {
  if (!inicio || !fin) return null;
  const [hi, mi] = inicio.split(":").map(Number);
  const [hf, mf] = fin.split(":").map(Number);
  let total = hf * 60 + mf - (hi * 60 + mi);
  if (total <= 0) return null;
  const h = Math.floor(total / 60), m = total % 60;
  return h > 0 ? `${h}h${m ? ` ${m}min` : ""}` : `${m} min`;
}

export default async function TabSesiones({
  personaId, estadoFiltro,
}: { personaId: string; estadoFiltro?: string }) {
  const supabase = await createClient();
  const activeSub: SubTabKey = (SUBTABS.find((s) => s.key === estadoFiltro)?.key) ?? "programada";

  const { data: rawSesiones } = await supabase
    .from("sesiones")
    .select("id, fecha, hora_inicio, hora_fin, numero_sesion, estado, motivo_consulta, situacion_presentada, objetivos_sesion, objetivo_principal, evaluacion_progreso")
    .eq("persona_id", personaId)
    .order("fecha", { ascending: false });

  const sesiones = (rawSesiones as SesionRow[] | null) ?? [];

  const counts: Record<SubTabKey, number> = { programada: 0, en_proceso: 0, completada: 0 };
  for (const s of sesiones) {
    for (const sub of SUBTABS) if (sub.estados.includes(s.estado)) counts[sub.key]++;
  }

  const estadosActivos = SUBTABS.find((s) => s.key === activeSub)!.estados;
  const filtradas = sesiones.filter((s) => estadosActivos.includes(s.estado));

  const accent: Record<SubTabKey, { active: string; dot: string; badge: string }> = {
    programada: { active: "bg-white text-amber-700 shadow-sm", dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700" },
    en_proceso: { active: "bg-white text-blue-700 shadow-sm", dot: "bg-blue-500", badge: "bg-blue-100 text-blue-700" },
    completada: { active: "bg-white text-emerald-700 shadow-sm", dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-medium text-stone-700">Historial de sesiones</h2>
        <Link
          href={`/sesiones/nueva?persona_id=${personaId}`}
          className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          + Nueva sesión
        </Link>
      </div>

      {/* Sub-tabs (segmented control) */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-stone-100 rounded-2xl">
        {SUBTABS.map((sub) => {
          const activo = sub.key === activeSub;
          return (
            <Link
              key={sub.key}
              href={`/personas/${personaId}?tab=sesiones&estado=${sub.key}`}
              scroll={false}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activo ? accent[sub.key].active : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activo ? accent[sub.key].dot : "bg-stone-300"}`} />
              <span className="hidden sm:inline">{sub.label}</span>
              <span className="sm:hidden">{sub.label.split(" ")[0]}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                activo ? accent[sub.key].badge : "bg-stone-200 text-stone-500"
              }`}>
                {counts[sub.key]}
              </span>
            </Link>
          );
        })}
      </div>

      {filtradas.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-10 text-center">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-stone-400 text-sm mb-4">
            {activeSub === "programada" && "No hay sesiones programadas para esta persona."}
            {activeSub === "en_proceso" && "No hay sesiones en proceso."}
            {activeSub === "completada" && "Aún no hay sesiones completadas."}
          </p>
          {activeSub === "programada" && (
            <Link
              href={`/sesiones/nueva?persona_id=${personaId}`}
              className="inline-block bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              Programar sesión
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtradas.map((s) => {
            const titulo = s.objetivo_principal ?? s.objetivos_sesion;
            const fallback = s.situacion_presentada ?? s.motivo_consulta;
            const progreso = s.evaluacion_progreso ? progresoLabel[s.evaluacion_progreso] : null;
            return (
              <Link
                key={s.id}
                href={`/sesiones/${s.id}`}
                className="block bg-white border border-stone-200 rounded-xl p-4 hover:border-amber-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 bg-amber-50 rounded-full flex items-center justify-center text-sm font-semibold text-amber-700 shrink-0">
                      {s.numero_sesion}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-700">
                        {new Date(s.fecha + "T00:00:00").toLocaleDateString("es", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                        {s.hora_inicio && ` · ${s.hora_inicio.slice(0, 5)}`}
                      </p>
                      {titulo && <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{titulo}</p>}
                      {!titulo && fallback && <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{fallback}</p>}
                      {progreso && (
                        <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          {progreso}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${estadoColor[s.estado]}`}>
                    {estadoLabel[s.estado] ?? s.estado}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
