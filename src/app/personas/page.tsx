import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function PersonasPage() {
  const supabase = await createClient();

  const { data: personas } = await supabase
    .from("personas")
    .select("id, nombre, apellido, telefono, email, activo, sesiones(count)")
    .order("nombre");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Personas</h1>
          <p className="text-stone-500 mt-1">Listado de aconsejados</p>
        </div>
        <Link
          href="/personas/nueva"
          className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nueva persona
        </Link>
      </div>

      {!personas || personas.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-stone-500 mb-4">Aún no has registrado ninguna persona</p>
          <Link
            href="/personas/nueva"
            className="inline-block bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            Registrar primera persona
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {personas.map((persona) => {
            const sesionesArr = persona.sesiones as unknown as { count: number }[];
            const sesionesCount = sesionesArr?.[0]?.count ?? 0;
            return (
              <Link
                key={persona.id}
                href={`/personas/${persona.id}`}
                className="bg-white border border-stone-200 rounded-xl p-5 flex items-center justify-between hover:border-amber-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center font-semibold text-amber-800">
                    {persona.nombre[0]}{persona.apellido[0]}
                  </div>
                  <div>
                    <p className="font-medium text-stone-800">{persona.nombre} {persona.apellido}</p>
                    <p className="text-sm text-stone-400">
                      {persona.telefono ?? persona.email ?? "Sin contacto"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block text-xs px-2 py-1 rounded-full ${persona.activo ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                    {persona.activo ? "Activo" : "Inactivo"}
                  </span>
                  <p className="text-xs text-stone-400 mt-1">{sesionesCount} sesión(es)</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
