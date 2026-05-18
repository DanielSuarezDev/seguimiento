import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ count: totalPersonas }, { count: totalSesiones }, { data: proximasSesiones }] =
    await Promise.all([
      supabase.from("personas").select("*", { count: "exact", head: true }).eq("activo", true),
      supabase.from("sesiones").select("*", { count: "exact", head: true }),
      supabase
        .from("sesiones")
        .select("id, numero_sesion, fecha, personas(nombre, apellido)")
        .eq("estado", "pendiente")
        .gte("fecha", new Date().toISOString().split("T")[0])
        .order("fecha", { ascending: true })
        .limit(5),
    ]);

  const stats = [
    { label: "Personas activas", value: totalPersonas ?? 0, icon: "👥", href: "/personas" },
    { label: "Total de sesiones", value: totalSesiones ?? 0, icon: "📋", href: "/sesiones" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-800">Bienvenido</h1>
        <p className="text-stone-500 mt-1">Resumen de tu ministerio de consejería</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.href}
            href={stat.href}
            className="bg-white border border-stone-200 rounded-xl p-6 hover:border-amber-300 hover:shadow-sm transition-all"
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-bold text-stone-800">{stat.value}</div>
            <div className="text-sm text-stone-500 mt-1">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-stone-700">Próximas sesiones</h2>
          <Link href="/sesiones" className="text-sm text-amber-700 hover:text-amber-800">
            Ver todas →
          </Link>
        </div>

        {!proximasSesiones || proximasSesiones.length === 0 ? (
          <div className="text-center py-8 text-stone-400">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-sm">No hay sesiones próximas programadas</p>
            <Link
              href="/sesiones/nueva"
              className="inline-block mt-3 text-sm text-amber-700 hover:text-amber-800"
            >
              Programar una sesión
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {proximasSesiones.map((sesion) => {
              const persona = Array.isArray(sesion.personas)
                ? sesion.personas[0]
                : sesion.personas;
              return (
                <Link
                  key={sesion.id}
                  href={`/sesiones/${sesion.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-sm font-medium text-amber-800">
                      {persona?.nombre?.[0] ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-700">
                        {persona
                          ? `${persona.nombre} ${persona.apellido}`
                          : "Desconocido"}
                      </p>
                      <p className="text-xs text-stone-400">Sesión #{sesion.numero_sesion}</p>
                    </div>
                  </div>
                  <span className="text-sm text-stone-500">
                    {new Date(sesion.fecha + "T00:00:00").toLocaleDateString("es", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href="/personas/nueva"
          className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nueva persona
        </Link>
        <Link
          href="/sesiones/nueva"
          className="bg-white border border-stone-300 hover:border-stone-400 text-stone-700 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nueva sesión
        </Link>
      </div>
    </div>
  );
}
