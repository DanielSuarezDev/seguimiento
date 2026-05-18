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

type TabKey = "programada" | "en_proceso" | "completada";

const TABS: { key: TabKey; label: string; estados: string[] }[] = [
  { key: "programada", label: "Programadas", estados: ["pendiente", "programada", "reprogramada"] },
  { key: "en_proceso", label: "En proceso", estados: ["en_proceso"] },
  { key: "completada", label: "Completadas", estados: ["completada"] },
];

type SesionItem = {
  id: string; numero_sesion: number; fecha: string; estado: string;
  motivo_consulta: string | null; objetivo_principal: string | null;
  personas: { nombre: string; apellido: string } | { nombre: string; apellido: string }[] | null;
};

export default async function SesionesPage({
  searchParams,
}: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const activeTab: TabKey = (TABS.find((t) => t.key === tab)?.key) ?? "programada";
  const supabase = await createClient();

  const { data: rawSesiones } = await supabase
    .from("sesiones")
    .select("id, numero_sesion, fecha, estado, motivo_consulta, objetivo_principal, personas(nombre, apellido)")
    .order("fecha", { ascending: false });

  const sesiones = (rawSesiones as SesionItem[] | null) ?? [];

  // Contadores por tab
  const counts: Record<TabKey, number> = { programada: 0, en_proceso: 0, completada: 0 };
  for (const s of sesiones) {
    for (const t of TABS) {
      if (t.estados.includes(s.estado)) counts[t.key]++;
    }
  }

  const activos = TABS.find((t) => t.key === activeTab)!.estados;
  const filtradas = sesiones.filter((s) => activos.includes(s.estado));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Sesiones</h1>
          <p className="text-stone-500 mt-1">Historial y agenda de sesiones de consejería.</p>
        </div>
        <Link
          href="/sesiones/nueva"
          className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          + Nueva sesión
        </Link>
      </div>

      {/* Tabs como segmented control */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 p-1.5 bg-stone-100 rounded-2xl">
        {TABS.map((t) => {
          const activo = t.key === activeTab;
          const accent: Record<TabKey, { active: string; dot: string }> = {
            programada: { active: "bg-white text-amber-700 shadow-sm", dot: "bg-amber-500" },
            en_proceso: { active: "bg-white text-blue-700 shadow-sm", dot: "bg-blue-500" },
            completada: { active: "bg-white text-emerald-700 shadow-sm", dot: "bg-emerald-500" },
          };
          return (
            <Link
              key={t.key}
              href={`/sesiones?tab=${t.key}`}
              className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activo ? accent[t.key].active : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activo ? accent[t.key].dot : "bg-stone-300"}`} />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.split(" ")[0]}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                activo
                  ? t.key === "programada" ? "bg-amber-100 text-amber-700"
                    : t.key === "en_proceso" ? "bg-blue-100 text-blue-700"
                    : "bg-emerald-100 text-emerald-700"
                  : "bg-stone-200 text-stone-500"
              }`}>
                {counts[t.key]}
              </span>
            </Link>
          );
        })}
      </div>

      {filtradas.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-stone-500 mb-4">
            {activeTab === "programada"
              ? "No hay sesiones programadas todavía."
              : activeTab === "en_proceso"
                ? "No hay sesiones en proceso ahora."
                : "Aún no hay sesiones completadas."}
          </p>
          {activeTab === "programada" && (
            <Link
              href="/sesiones/nueva"
              className="inline-block bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              Programar sesión
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          {filtradas.map((sesion, i) => {
            const persona = Array.isArray(sesion.personas) ? sesion.personas[0] : sesion.personas;
            const subtitulo = sesion.objetivo_principal ?? sesion.motivo_consulta ?? "Sin objetivo registrado";
            return (
              <Link
                key={sesion.id}
                href={`/sesiones/${sesion.id}`}
                className={`flex items-center justify-between p-5 hover:bg-stone-50 transition-colors ${i > 0 ? "border-t border-stone-100" : ""}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-sm font-semibold text-amber-800 shrink-0">
                    {persona?.nombre?.[0] ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-stone-800 truncate">
                      {persona ? `${persona.nombre} ${persona.apellido}` : "Desconocido"}
                    </p>
                    <p className="text-xs text-stone-400 truncate">
                      Sesión #{sesion.numero_sesion} · {subtitulo.slice(0, 70)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full ${estadoColor[sesion.estado]}`}>
                    {estadoLabel[sesion.estado] ?? sesion.estado}
                  </span>
                  <span className="text-sm text-stone-400 min-w-[90px] text-right">
                    {new Date(sesion.fecha + "T00:00:00").toLocaleDateString("es", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
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
