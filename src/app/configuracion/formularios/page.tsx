import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { plantillasEstandar } from "@/lib/plantillas-estandar";
import EliminarPlantilla from "./EliminarPlantilla";

type Plantilla = { id: string; nombre: string; descripcion: string | null; activo: boolean; created_at: string };

export default async function PlantillasPage() {
  const supabase = await createClient();

  // Cargar plantillas existentes
  const { data: rawPlantillas } = await supabase
    .from("form_plantillas")
    .select("id, nombre, descripcion, activo, created_at")
    .order("created_at", { ascending: true });

  let plantillas = (rawPlantillas as Plantilla[] | null) ?? [];

  // Auto-seed: si no hay ninguna plantilla, crear las estándar
  if (plantillas.length === 0) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      for (const p of plantillasEstandar) {
        const { data: nueva } = await supabase
          .from("form_plantillas")
          .insert({ nombre: p.nombre, descripcion: p.descripcion, user_id: user.id })
          .select("id")
          .single();

        if (!nueva) continue;

        const preguntasInsert = p.preguntas.map((pr, idx) => ({
          plantilla_id: nueva.id,
          orden: idx,
          tipo: pr.tipo,
          pregunta: pr.pregunta,
          placeholder: pr.placeholder ?? null,
          requerida: pr.requerida ?? false,
          opciones: pr.opciones ?? null,
        }));

        await supabase.from("form_preguntas").insert(preguntasInsert);
      }

      // Recargar
      const { data: rawNuevas } = await supabase
        .from("form_plantillas")
        .select("id, nombre, descripcion, activo, created_at")
        .order("created_at", { ascending: true });
      plantillas = (rawNuevas as Plantilla[] | null) ?? [];
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Plantillas de formulario</h1>
          <p className="text-stone-400 text-sm mt-0.5">Los formularios que envías a tus aconsejados. Edítalos o crea los tuyos.</p>
        </div>
        <Link
          href="/configuracion/formularios/nueva"
          className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nueva plantilla
        </Link>
      </div>

      {plantillas.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-stone-500 mb-4">Aún no tienes plantillas</p>
          <Link
            href="/configuracion/formularios/nueva"
            className="inline-block bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            Crear primera plantilla
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {plantillas.map((p) => (
            <div key={p.id} className="bg-white border border-stone-200 rounded-xl p-5 flex items-center justify-between hover:border-amber-200 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-stone-800">{p.nombre}</p>
                  {!p.activo && <span className="text-xs bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full">Inactiva</span>}
                </div>
                {p.descripcion && <p className="text-sm text-stone-400 mt-0.5">{p.descripcion}</p>}
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <Link
                  href={`/configuracion/formularios/${p.id}`}
                  className="text-sm text-amber-700 hover:text-amber-800 font-medium"
                >
                  Editar →
                </Link>
                <EliminarPlantilla plantillaId={p.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
