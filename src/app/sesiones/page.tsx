import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const estadoLabel: Record<string, string> = {
  pendiente: "Pendiente",
  completada: "Completada",
  cancelada: "Cancelada",
};

const estadoColor: Record<string, string> = {
  pendiente: "bg-amber-50 text-amber-700",
  completada: "bg-green-50 text-green-700",
  cancelada: "bg-red-50 text-red-600",
};

export default async function SesionesPage() {
  const supabase = await createClient();

  const { data: sesiones } = await supabase
    .from("sesiones")
    .select("id, numero_sesion, fecha, estado, motivo_consulta, personas(nombre, apellido)")
    .order("fecha", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Sesiones</h1>
          <p className="text-stone-500 mt-1">Historial de todas las sesiones</p>
        </div>
        <Link
          href="/sesiones/nueva"
          className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nueva sesión
        </Link>
      </div>

      {!sesiones || sesiones.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-stone-500 mb-4">Aún no hay sesiones registradas</p>
          <Link
            href="/sesiones/nueva"
            className="inline-block bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            Registrar primera sesión
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          {sesiones.map((sesion, i) => {
            const persona = Array.isArray(sesion.personas)
              ? sesion.personas[0]
              : sesion.personas;
            return (
              <Link
                key={sesion.id}
                href={`/sesiones/${sesion.id}`}
                className={`flex items-center justify-between p-5 hover:bg-stone-50 transition-colors ${i > 0 ? "border-t border-stone-100" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center text-sm font-semibold text-amber-800">
                    {persona?.nombre?.[0] ?? "?"}
                  </div>
                  <div>
                    <p className="font-medium text-stone-800">
                      {persona ? `${persona.nombre} ${persona.apellido}` : "Desconocido"}
                    </p>
                    <p className="text-xs text-stone-400">
                      Sesión #{sesion.numero_sesion} ·{" "}
                      {sesion.motivo_consulta?.slice(0, 50) ?? "Sin motivo registrado"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${estadoColor[sesion.estado]}`}>
                    {estadoLabel[sesion.estado]}
                  </span>
                  <span className="text-sm text-stone-400 min-w-[90px] text-right">
                    {new Date(sesion.fecha + "T00:00:00").toLocaleDateString("es", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
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
