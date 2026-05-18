import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function PersonasPage() {
  const supabase = await createClient();

  type PersonaItem = { id: string; nombre: string; apellido: string; telefono: string | null; email: string | null; activo: boolean; tipos_consejeria: { nombre: string; color: string } | null; sesiones: { count: number }[] };

  const { data: rawPersonas } = await supabase
    .from("personas")
    .select("id, nombre, apellido, telefono, email, activo, tipos_consejeria(nombre, color), sesiones(count)")
    .order("nombre");

  const personas = rawPersonas as PersonaItem[] | null;

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Personas</h1>
          <p className="text-stone-400 text-sm mt-0.5">{personas?.filter((p) => p.activo).length ?? 0} activa(s)</p>
        </div>
        <Link href="/personas/nueva" className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          + Nueva persona
        </Link>
      </div>

      {!personas || personas.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-stone-400 mb-4">Aún no has registrado ninguna persona</p>
          <Link href="/personas/nueva" className="inline-block bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
            Registrar primera persona
          </Link>
        </div>
      ) : (
        <div className="grid gap-2">
          {personas.map((persona) => {
            const tipo = persona.tipos_consejeria;
            const sesionesCount = persona.sesiones?.[0]?.count ?? 0;
            return (
              <Link
                key={persona.id}
                href={`/personas/${persona.id}`}
                className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-4 hover:border-amber-300 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center font-semibold text-amber-800 text-sm shrink-0">
                  {persona.nombre[0]}{persona.apellido[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-stone-800">{persona.nombre} {persona.apellido}</p>
                    {!persona.activo && <span className="text-xs bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full">Inactivo</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {tipo && <span className="text-xs text-stone-400">{tipo.nombre}</span>}
                    {persona.telefono && <span className="text-xs text-stone-400">{persona.telefono}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-stone-400">{sesionesCount} sesión(es)</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
